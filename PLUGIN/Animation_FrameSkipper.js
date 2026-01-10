/*:
 * @plugindesc [v2.2 效果合并版] 动画减帧插件。跳过的帧的音效和闪光会自动合并到上一个有效帧播放。
 * @author Gemini
 *
 * @help
 * ============================================================================
 * 功能机制
 * ============================================================================
 * 1. 帧数跳过：支持 <Skip:x> (均匀) 和 <SkipFrames:...> (指定) 两种模式。
 * * 2. 效果合并 (您要求的功能)：
 * 当插件决定跳过某些帧（例如跳过帧2、帧3，直接播放帧4）时，
 * 在播放“帧1”（最近的上一个有效帧）的那一瞬间，插件会同时检查帧2和帧3。
 * 如果帧2和帧3里定义了 SE 或 闪光，它们会立即在帧1显示的同时被触发。
 *
 * 3. 兼容性修正：
 * 采用“帧索引伪装”技术，确保 VE 和 Yanfly 插件能正确播放这些
 * 原本属于被跳过帧的闪光效果。
 *
 * ============================================================================
 * 使用方法
 * ============================================================================
 * 在 RPG Maker MV 数据库 -> 动画 (Animations) -> 名称 (Name) 中添加标签：
 *
 * 模式 A：指定跳过某些帧 (例如剪掉前摇)
 * <SkipFrames: 1, 2, 3>
 * -> 播放时直接从第4帧画面开始，但第1,2,3帧的音效会随第4帧同时播放(或视逻辑合并到上一帧)。
 * *注意：如果是开头的帧被跳过，音效会在动画启动瞬间播放。
 *
 * 模式 B：均匀跳帧
 * <Skip: 1>
 * -> 播放 1, 3, 5... (偶数帧的音效会合并到奇数帧播放)
 */

(function() {
    // 备份原有的 setup 方法
    var _Sprite_Animation_setup = Sprite_Animation.prototype.setup;

    Sprite_Animation.prototype.setup = function(target, animation, mirror, delay) {
        // 1. 调用原版 setup
        _Sprite_Animation_setup.call(this, target, animation, mirror, delay);

        // 强制初始化，防止 NaN 错误
        this._frameIndex = 0;
        
        this._skipMode = 'none';
        this._skipStep = 1;
        this._skipList = [];

        if (this._animation) {
            this.parseSkipTag(this._animation.name);
            this.recalculateDuration();
            
            // 如果起始帧(第1帧, Index 0)就被设定为跳过
            // 我们需要找到第一个“有效帧”作为起点
            // 但注意：被跳过的开头帧的音效，稍后会在 updateMain 中被这个“第一个有效帧”捕获并播放
            if (this._skipMode === 'list') {
                while (this._skipList.indexOf(this._frameIndex) !== -1 && this._frameIndex < this._animation.frames.length) {
                    this._frameIndex++;
                }
            }
        }
    };

    Sprite_Animation.prototype.parseSkipTag = function(name) {
        // 模式1: 列表指定 <SkipFrames: 1,2,5>
        var matchFrames = name.match(/<SkipFrames:\s*([\d,\s]+)>/i);
        if (matchFrames) {
            this._skipMode = 'list';
            var numStr = matchFrames[1].split(',');
            for (var i = 0; i < numStr.length; i++) {
                var val = parseInt(numStr[i].trim());
                if (!isNaN(val)) {
                    // 转换为 0-based 索引
                    this._skipList.push(val - 1);
                }
            }
            return;
        }

        // 模式2: 步长跳过 <Skip: 1>
        var matchStep = name.match(/<Skip:\s*(\d+)>/i);
        if (matchStep) {
            this._skipMode = 'step';
            this._skipStep = parseInt(matchStep[1]) + 1;
        }
    };

    Sprite_Animation.prototype.recalculateDuration = function() {
        if (this._skipMode === 'none') return;

        var validFrames = 0;
        var totalFrames = this._animation.frames.length;

        if (this._skipMode === 'step') {
            validFrames = Math.ceil(totalFrames / this._skipStep);
        } else if (this._skipMode === 'list') {
            for (var i = 0; i < totalFrames; i++) {
                if (this._skipList.indexOf(i) === -1) {
                    validFrames++;
                }
            }
        }
        // 重新计算总时长，保证动画播完正好结束
        this._duration = validFrames * this._rate;
    };

    // --- 核心方法：处理特定帧的音效和闪光 ---
    Sprite_Animation.prototype.processTimingsAt = function(targetIndex) {
        var timings = this._animation.timings;
        for (var i = 0; i < timings.length; i++) {
            var timing = timings[i];
            
            // 找到属于 targetIndex 这一帧的配置
            if (timing.frame === targetIndex) {
                
                // [关键逻辑] 伪装帧索引
                // 为了让 VE/Yanfly 插件认为“现在就是这一帧”，我们需要临时修改 _frameIndex
                // 这样它们才不会拦截闪光效果。
                
                var originalIndex = this._frameIndex; // 备份当前有效帧号
                this._frameIndex = targetIndex;       // 伪装成(可能是被跳过的)目标帧号
                
                try {
                    // 调用底层处理函数，播放 SE 和 Flash
                    // 此时在引擎看来，我们正处于 targetIndex 这一帧
                    this.processTimingData(timing);   
                } catch (e) {
                    console.error("FrameSkipper Error at index " + targetIndex, e);
                }
                
                this._frameIndex = originalIndex;     // 恢复真相
            }
        }
    };

    // 备份原有的 updateMain 方法
    var _Sprite_Animation_updateMain = Sprite_Animation.prototype.updateMain;

    Sprite_Animation.prototype.updateMain = function() {
        // 安全检查
        if (this._frameIndex === undefined || isNaN(this._frameIndex)) this._frameIndex = 0;
        
        if (this._skipMode === 'none') {
            _Sprite_Animation_updateMain.call(this);
            return;
        }

        // 仅在每一帧画面的起始时刻 (第1个tick) 执行
        // 这样可以防止同一个音效被重复播放
        if (this._animation && this._animation.timings && this._duration % this._rate === 0) {
            
            // ============================================================
            // 步骤 1: 播放【当前有效帧】的音效/闪光
            // ============================================================
            this.processTimingsAt(this._frameIndex);

            // ============================================================
            // 步骤 2: 搜寻并合并【紧随其后的被跳过帧】的音效/闪光
            // ============================================================
            
            // 计算当前帧之后，下一个有效帧是多少？
            // 中间夹着的所有帧，就是被跳过的帧，它们的音效需要“搬运”到这里播放。
            
            var rawNext = this._frameIndex + 1; // 开始搜寻的位置
            var actualNext = -1;                // 搜寻结束的位置(不包含)
            
            if (this._skipMode === 'step') {
                actualNext = this._frameIndex + this._skipStep;
            } else {
                actualNext = this._frameIndex + 1;
                // 如果 actualNext 在跳过列表中，就继续往后找，直到找到一个不跳过的
                while (this._skipList.indexOf(actualNext) !== -1) {
                    actualNext++;
                }
            }
            
            // 遍历中间所有的帧 (这些都是被跳过的)
            for (var i = rawNext; i < actualNext; i++) {
                // 防止越界
                if (i < this._animation.frames.length) {
                    // [执行搬运] 
                    // 虽然画面不显示帧 i，但我们在当前帧的这一刻，强制触发帧 i 的效果
                    this.processTimingsAt(i);
                }
            }
        }

        // 绘制当前帧画面
        this.updateFrame();
        
        // 计时器递减
        this._duration--;

        // 换帧逻辑
        if (this._duration % this._rate === 0) {
            this.advanceFrame();
        }
    };

    // 计算下一个有效帧号
    Sprite_Animation.prototype.advanceFrame = function() {
        if (this._skipMode === 'step') {
             this._frameIndex += this._skipStep;
        } 
        else if (this._skipMode === 'list') {
            // 线性寻找下一个不在跳过列表里的帧
            this._frameIndex++;
            while (this._skipList.indexOf(this._frameIndex) !== -1) {
                this._frameIndex++;
            }
        }
    };

})();