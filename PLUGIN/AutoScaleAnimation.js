/*:
 * @plugindesc (V3.8 双重因子版) 敌人体型倍率实装 + 动画/敌人双重缩放叠加
 * @author 辅助开发
 *
 * @help
 * ============================================================================
 * V3.8 更新日志 (核心算法重构)
 * ============================================================================
 * 1. 敌人缩放公式更改：
 * 现在敌人的缩放不再仅依赖基准值，而是会乘上体型倍率。
 * 公式：EnemyScale = 原始倍率(calc) * 基准值(base) * 用户值(user)
 * * 2. 缩放叠加逻辑：
 * 当敌人播放动画时，如果该动画也有配置，两者会相乘。
 * 公式：FinalScale = EnemyScale * AnimationScale
 * (如果动画没有配置，则 AnimationScale 默认为 1.0)
 *
 * ============================================================================
 * 核心功能
 * ============================================================================
 * 1. 自动同步配置结构。
 * 2. 内置【深层雷达】，能穿透 VE 插件的图层找到真正的角色。
 * 3. 内置【强制执法】，强行修正动画方向。
 */

(function() {
    
    // ======================================================================
    // 1. 核心配置与文件管理
    // ======================================================================
    var Config = {
        animFile: "AnimationScales.json",
        enemyFile: "EnemyScales.json",
        baseSize: 64
    };

    var _animationScales = {};
    var _enemyScales = {};
    
    var _fs = null;
    var _path = null;
    var _animPath = null;
    var _enemyPath = null;

    if (Utils.isNwjs()) {
        try {
            _fs = require('fs');
            _path = require('path');
            var base = _path.dirname(process.mainModule.filename);
            _animPath = _path.join(base, Config.animFile);
            _enemyPath = _path.join(base, Config.enemyFile);
        } catch (e) {
            console.warn("AutoScaleAnimation: 无法初始化文件系统环境。", e);
        }
    }

    function loadJson(filePath) {
        if (!_fs || !filePath || !_fs.existsSync(filePath)) return {};
        try { return JSON.parse(_fs.readFileSync(filePath, 'utf8')); } 
        catch (e) { return {}; }
    }

    function saveJson(filePath, dataObj) {
        if (!_fs || !filePath) return;
        try { _fs.writeFileSync(filePath, JSON.stringify(dataObj, null, 4)); } 
        catch (e) { console.error("写入失败: " + filePath, e); }
    }

    function syncConfigStructure() {
        if (!Utils.isNwjs()) return;
        var changed = false;
        // 动画配置同步
        for (var key in _animationScales) {
            var data = _animationScales[key];
            if (data.mirrorActor === undefined) { data.mirrorActor = false; changed = true; }
            if (data.baseScale === undefined) {
                var raw = data.calcScale || 1.0;
                data.baseScale = (raw < 1.0) ? 1.0 : raw;
                changed = true;
            }
            if (data.userScale === undefined) { data.userScale = 1.0; changed = true; }
        }
        if (changed) saveJson(_animPath, _animationScales);
    }

    function loadAllConfigs() {
        _animationScales = loadJson(_animPath);
        _enemyScales = loadJson(_enemyPath);
        syncConfigStructure();
    }
    loadAllConfigs();

    // ======================================================================
    // 2. 图像分析算法
    // ======================================================================
    function analyzeBitmap(bitmap, animationName) {
        if (!bitmap.isReady()) return null;
        var canvas = bitmap.canvas;
        var context = canvas.getContext('2d');
        var width = canvas.width;
        var height = canvas.height;
        var cellW = 192; var cellH = 192;
        var cols = 5; var rows = Math.ceil(height / cellH);
        var maxContentW = 1; var maxContentH = 1;
        var imgData = context.getImageData(0, 0, width, height).data;

        for (var r = 0; r < rows; r++) {
            for (var c = 0; c < cols; c++) {
                var startX = c * cellW; var startY = r * cellH;
                if (startY >= height) break;
                var bounds = getCellBounds(imgData, width, height, startX, startY, cellW, cellH);
                if (bounds.valid) {
                    var w = bounds.maxX - bounds.minX + 1;
                    var h = bounds.maxY - bounds.minY + 1;
                    if (w > maxContentW) maxContentW = w;
                    if (h > maxContentH) maxContentH = h;
                }
            }
        }
        var maxDim = Math.max(maxContentW, maxContentH);
        var rawScale = Config.baseSize / maxDim;
        var baseScale = (rawScale < 1.0) ? 1.0 : rawScale;
        return {
            name: animationName,
            maxW: maxContentW, maxH: maxContentH,
            calcScale: Number(rawScale.toFixed(4)),
            baseScale: Number(baseScale.toFixed(4)),
            userScale: 1.0,
            align: "center", offX: 0, offY: 0,
            mirrorActor: false
        };
    }

    function getCellBounds(data, imgW, imgH, ox, oy, w, h) {
        var minX = w, maxX = -1, minY = h, maxY = -1;
        var found = false;
        for (var y = 0; y < h; y++) {
            for (var x = 0; x < w; x++) {
                var realX = ox + x; var realY = oy + y;
                if (realX >= imgW || realY >= imgH) continue;
                var idx = (realY * imgW + realX) * 4 + 3;
                if (data[idx] > 0) { 
                    found = true;
                    if (x < minX) minX = x; if (x > maxX) maxX = x;
                    if (y < minY) minY = y; if (y > maxY) maxY = y;
                }
            }
        }
        return { valid: found, minX: minX, maxX: maxX, minY: minY, maxY: maxY };
    }

    // ======================================================================
    // 3. 辅助：深层雷达
    // ======================================================================
    function getRealBattler(target) {
        if (!target) return null;
        if (target._battler) return target._battler;
        if (target.parent && target.parent._battler) return target.parent._battler;
        if (target.parent && target.parent.parent && target.parent.parent._battler) {
            return target.parent.parent._battler;
        }
        return null;
    }

    // ======================================================================
    // 4. 拦截 Setup
    // ======================================================================
    var _Sprite_Animation_setup = Sprite_Animation.prototype.setup;
    Sprite_Animation.prototype.setup = function(target, animation, mirror, delay) {
        _Sprite_Animation_setup.call(this, target, animation, mirror, delay);

        if (!this._target || !animation) return;
        var animId = animation.id;
        var animName = animation.animation1Name;

        // 分析逻辑
        if (!_animationScales[animId] && Utils.isNwjs()) {
             var bitmap = ImageManager.loadAnimation(animName);
             if (bitmap.isReady()) {
                 var result = analyzeBitmap(bitmap, animation.name);
                 if (result) {
                     _animationScales[animId] = result;
                     saveJson(_animPath, _animationScales);
                 }
             } else {
                 bitmap.addLoadListener(function() {
                     var res = analyzeBitmap(bitmap, animation.name);
                     if (res && !_animationScales[animId]) {
                         _animationScales[animId] = res;
                         saveJson(_animPath, _animationScales);
                     }
                 });
             }
        }
        
        // 初始缩放
        this.applyAutoScale();
    };

    // ======================================================================
    // 5. 拦截 Update
    // ======================================================================
    var _Sprite_Animation_update = Sprite_Animation.prototype.update;
    
    Sprite_Animation.prototype.update = function() {
        _Sprite_Animation_update.call(this);
        if (this._target && this._animation) {
            this.applyAutoScale();
        }
    };

    // ======================================================================
    // 6. 统一应用缩放与镜像 (核心改动区域)
    // ======================================================================
    Sprite_Animation.prototype.applyAutoScale = function() {
        var animId = this._animation.id;
        var config = _animationScales[animId]; // 动画配置
        
        // 即使 config 不存在，也可能因为是敌人而需要缩放，所以这里不直接 return
        // 但为了下面代码简洁，如果 config 不存在，我们视为默认值

        var battler = getRealBattler(this._target);
        var scaleMag = 1.0;

        if (battler && battler.isEnemy()) {
            var enemyId = battler.enemyId();
            
            // --- A. 自动生成/补全敌人数据 ---
            if (!_enemyScales[enemyId] && Utils.isNwjs()) {
                 var visualSprite = this._target;
                 if ((!visualSprite.bitmap || visualSprite.width === 0) && visualSprite.parent && visualSprite.parent.bitmap) {
                     visualSprite = visualSprite.parent;
                 }
                 
                 // 必须图片就绪才生成
                 if (visualSprite.bitmap && visualSprite.bitmap.isReady()) {
                     var eWidth = visualSprite.bitmap.width;   
                     var eHeight = visualSprite.bitmap.height;
                     var avgDim = (eWidth + eHeight) / 2;
                     var multiplier = Math.max(1, Math.round(avgDim / 64));
                     
                     _enemyScales[enemyId] = { 
                         name: battler.name(), 
                         calcScale: multiplier, 
                         baseScale: 1.0, 
                         userScale: 1.0,
                         maxW: eWidth, 
                         maxH: eHeight 
                     };
                     saveJson(_enemyPath, _enemyScales);
                     _enemyScales = loadJson(_enemyPath); // 刷新
                 }
            }
            
            // --- B. 计算敌人基础缩放 (Requirement 1) ---
            var enemyFinalScale = 1.0;
            if (_enemyScales[enemyId]) {
                var ed = _enemyScales[enemyId];
                // 公式：原始倍率 * 基准值 * 用户值
                var eCalc = (ed.calcScale !== undefined) ? ed.calcScale : 1.0;
                var eBase = (ed.baseScale !== undefined) ? ed.baseScale : 1.0;
                var eUser = (ed.userScale !== undefined) ? ed.userScale : 1.0;
                
                enemyFinalScale = eCalc * eBase * eUser;
            }

            // --- C. 计算动画叠加缩放 (Requirement 2) ---
            var animFinalScale = 1.0; // 默认 1.0
            
            // 如果 AnimationScales.json 中有定义 (有 config)
            if (config) {
                // 动画缩放 = 基准 * 用户
                var aBase = (config.baseScale !== undefined) ? config.baseScale : ((config.calcScale < 1.0) ? 1.0 : config.calcScale);
                var aUser = (config.userScale !== undefined) ? config.userScale : 1.0;
                animFinalScale = aBase * aUser;
            }
            
            // --- D. 最终叠加 ---
            scaleMag = enemyFinalScale * animFinalScale;

        } else {
            // >>> 我方角色逻辑 <<<
            if (config) {
                var base = (config.baseScale !== undefined) ? config.baseScale : ((config.calcScale < 1.0) ? 1.0 : config.calcScale);
                scaleMag = base * (config.userScale || 1.0);
            }
        }

        // --- 方向控制 ---
        var finalScaleX = Math.abs(scaleMag);
        
        // 只有我方角色才考虑镜像配置
        if (config && config.mirrorActor === true && battler && battler.isActor()) {
            finalScaleX = -Math.abs(scaleMag);
        } else {
            var currentSign = (this.scale.x < 0) ? -1 : 1;
            finalScaleX = Math.abs(scaleMag) * currentSign;
        }

        this.scale.x = finalScaleX;
        this.scale.y = Math.abs(scaleMag);

        // --- 位移处理 ---
        if (this._animation.position !== 3) {
            var parent = this._target.parent;
            var grandparent = parent ? parent.parent : null;
            
            this.x = this._target.x;
            this.y = this._target.y;
            if (this.parent === grandparent) {
                this.x += parent.x;
                this.y += parent.y;
            }

            var t = this._target;
            var tW = t.width || 0;
            var tH = t.height || 0;
            
            // 位移参数只读动画配置
            var align = (config && config.align) ? config.align : "center";
            var offX = (config && config.offX) ? Number(config.offX) : 0;
            var offY = (config && config.offY) ? Number(config.offY) : 0;
            var safeMaxH = (config && config.maxH) ? config.maxH : 192; 
            var aniHalfHeight = (safeMaxH * this.scale.y) / 2;

            if (align === "top") { this.y -= tH; this.y += aniHalfHeight; } 
            else if (align === "bottom") { this.y -= aniHalfHeight; } 
            else { this.y -= tH / 2; }

            if (finalScaleX < 0) {
                this.x -= tW * (offX / 100); 
            } else {
                this.x += tW * (offX / 100);
            }
            this.y += tH * (offY / 100);
        }
    };

})();