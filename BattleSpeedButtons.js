/*:
 * @plugindesc 战斗变速控制插件 V1.4 - (智能变速：选择阶段不减速)
 * @author 辅助开发
 *
 * @param ButtonX
 * @text 按钮起始X坐标
 * @desc 按钮组在屏幕上的X坐标。
 * @default 700
 *
 * @param ButtonY
 * @text 按钮起始Y坐标
 * @desc 按钮组在屏幕上的Y坐标。
 * @default 20
 *
 * @param ButtonWidth
 * @text 按钮宽度
 * @type number
 * @default 60
 *
 * @param ButtonHeight
 * @text 按钮高度
 * @type number
 * @default 30
 *
 * @param Spacing
 * @text 按钮间距
 * @type number
 * @desc 按钮之间的垂直间距。
 * @default 10
 *
 * @help
 * ============================================================================
 * 介绍 (V1.4 智能变速版)
 * ============================================================================
 * 本插件在战斗场景中添加 4 个按钮，用于控制战斗动画和逻辑的流转速度。
 *
 * ★ V1.4 核心升级：
 * 【智能分离选择阶段】：
 * 当玩家处于“输入指令阶段”（选择攻击、技能、道具、目标）时，
 * 无论您当前选定的速度是多少（例如 0.25x），游戏都会强制以 1.0x 正常速度运行。
 * 只有在开始执行动作、播放动画时，才会应用变速效果。
 * * 这确保了您在操作菜单时永远是流畅的，而观看战斗演出时可以是慢动作或快进。
 *
 * 【按钮排列顺序】
 * 1. x2.0 : 2倍速
 * 2. x0.5 : 1/2倍速
 * 3. x0.25: 1/4倍速
 * 4. x1.0 : 正常速度
 *
 */

(function() {

    // --- 参数获取 ---
    var parameters = PluginManager.parameters('BattleSpeedButtons');
    var btnStartX = Number(parameters['ButtonX'] || 700);
    var btnStartY = Number(parameters['ButtonY'] || 20);
    var btnWidth = Number(parameters['ButtonWidth'] || 60);
    var btnHeight = Number(parameters['ButtonHeight'] || 30);
    var btnSpacing = Number(parameters['Spacing'] || 10);

    // ======================================================================
    // 1. 核心逻辑：变速控制 (UI解耦 + 智能阶段判断)
    // ======================================================================
    
    // 初始化速度变量
    var _Scene_Battle_initialize = Scene_Battle.prototype.initialize;
    Scene_Battle.prototype.initialize = function() {
        _Scene_Battle_initialize.call(this);
        this._battleSpeed = 1.0;       // 设定的目标速度
        this._speedAccumulator = 0.0;  // 速度累积器
    };

    // ★ 重写 update：实现 逻辑慢放 + UI满速 + 选择阶段强制正常
    var _Scene_Battle_update = Scene_Battle.prototype.update;
    Scene_Battle.prototype.update = function() {
        
        // --- V1.4 核心修改：计算当前帧的实际生效速度 ---
        // 如果 BattleManager 处于输入状态 (选技能/选人)，强制使用 1.0 速度
        // 否则使用用户设定的 _battleSpeed
        var activeSpeed = (BattleManager.isInputting()) ? 1.0 : this._battleSpeed;

        // 情况A：正常速度 (1.0)
        // (选择阶段会强制进入这里，保证菜单流畅)
        if (activeSpeed === 1.0) {
            _Scene_Battle_update.call(this);
            return;
        }

        // 情况B：加速 ( > 1.0)
        if (activeSpeed > 1.0) {
            var loops = Math.floor(activeSpeed);
            for (var i = 0; i < loops; i++) {
                _Scene_Battle_update.call(this);
            }
        }
        // 情况C：慢动作 ( < 1.0)
        else {
            this._speedAccumulator += activeSpeed;
            
            if (this._speedAccumulator >= 1.0) {
                // --- 逻辑帧 ---
                this._speedAccumulator -= 1.0;
                _Scene_Battle_update.call(this);
            } else {
                // --- 插值帧 (逻辑暂停，但UI继续) ---
                this.updateInputAndUI();
            }
        }
    };

    // ★ 辅助函数：仅更新输入和UI (用于慢动作时的插值帧)
    Scene_Battle.prototype.updateInputAndUI = function() {
        // 1. 更新输入设备状态
        if (typeof Input !== 'undefined') Input.update();
        if (typeof TouchInput !== 'undefined') TouchInput.update();

        // 2. 更新窗口层
        if (this._windowLayer) {
            this._windowLayer.update();
        }

        // 3. 更新速度按钮自身
        if (this._speedButtons) {
            this._speedButtons.forEach(function(btn) {
                btn.update();
            });
        }
    };

    // 切换速度的方法
    Scene_Battle.prototype.changeBattleSpeed = function(speed) {
        if (this._battleSpeed === speed && speed !== 1.0) {
            this._battleSpeed = 1.0; 
        } else {
            this._battleSpeed = speed;
        }
        
        if (this._speedButtons) {
            this._speedButtons.forEach(function(btn) {
                btn.refresh();
            });
        }
    };

    // ======================================================================
    // 2. UI 实现：速度按钮
    // ======================================================================

    var _Scene_Battle_createDisplayObjects = Scene_Battle.prototype.createDisplayObjects;
    Scene_Battle.prototype.createDisplayObjects = function() {
        _Scene_Battle_createDisplayObjects.call(this);
        this.createSpeedButtons();
    };

    Scene_Battle.prototype.createSpeedButtons = function() {
        this._speedButtons = [];
        
        var speeds = [2.0, 0.5, 0.25, 1.0];
        var labels = ["x2.0", "x0.5", "x0.25", "x1.0"];

        for (var i = 0; i < speeds.length; i++) {
            var btn = new Sprite_SpeedButton(speeds[i], labels[i]);
            btn.x = btnStartX;
            btn.y = btnStartY + i * (btnHeight + btnSpacing);
            this.addChild(btn);
            this._speedButtons.push(btn);
        }
    };

    // --- 按钮精灵类 ---
    function Sprite_SpeedButton() {
        this.initialize.apply(this, arguments);
    }

    Sprite_SpeedButton.prototype = Object.create(Sprite.prototype);
    Sprite_SpeedButton.prototype.constructor = Sprite_SpeedButton;

    Sprite_SpeedButton.prototype.initialize = function(speed, label) {
        Sprite.prototype.initialize.call(this);
        this._targetSpeed = speed;
        this._label = label;
        this._pressed = false;
        
        this.bitmap = new Bitmap(btnWidth, btnHeight);
        this.refresh();
    };

    Sprite_SpeedButton.prototype.refresh = function() {
        this.bitmap.clear();
        
        var scene = SceneManager._scene;
        var isActive = (scene && scene._battleSpeed === this._targetSpeed);
        
        var color1 = isActive ? 'rgba(100, 255, 100, 0.8)' : 'rgba(0, 0, 0, 0.5)';
        var color2 = isActive ? 'rgba(50, 200, 50, 0.8)' : 'rgba(0, 0, 0, 0.2)';
        
        var ctx = this.bitmap.context;
        var grad = ctx.createLinearGradient(0, 0, 0, btnHeight);
        grad.addColorStop(0, color1);
        grad.addColorStop(1, color2);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, btnWidth, btnHeight);
        
        ctx.strokeStyle = isActive ? '#ffffff' : '#aaaaaa';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, btnWidth, btnHeight);

        this.bitmap.fontSize = 18;
        this.bitmap.textColor = '#ffffff';
        this.bitmap.drawText(this._label, 0, 0, btnWidth, btnHeight, 'center');
    };

    Sprite_SpeedButton.prototype.update = function() {
        Sprite.prototype.update.call(this);
        this.processTouch();
    };

    Sprite_SpeedButton.prototype.processTouch = function() {
        if (TouchInput.isTriggered() && this.isTouching()) {
            SoundManager.playOk();
            SceneManager._scene.changeBattleSpeed(this._targetSpeed);
        }
    };

    Sprite_SpeedButton.prototype.isTouching = function() {
        var x = TouchInput.x;
        var y = TouchInput.y;
        return x >= this.x && x < this.x + this.width &&
               y >= this.y && y < this.y + this.height;
    };

})();