/*:
 * @plugindesc (v5 整体位移版) 战斗作弊按钮：1.满暴击满命中 2.攻击力1000。
 * @author Gemini
 *
 * @param --- 整体偏移 ---
 *
 * @param Global Offset X
 * @parent --- 整体偏移 ---
 * @desc 所有按钮一起移动的 X 轴偏移量 (正数向右，负数向左)。
 * @default 0
 *
 * @param Global Offset Y
 * @parent --- 整体偏移 ---
 * @desc 所有按钮一起移动的 Y 轴偏移量 (正数向下，负数向上)。
 * @default 0
 *
 * @param --- 按钮 1 (必杀) ---
 *
 * @param Button 1 X
 * @parent --- 按钮 1 (必杀) ---
 * @desc "必杀" 按钮的独立 X 坐标 (基础位置)。
 * @default 20
 *
 * @param Button 1 Y
 * @parent --- 按钮 1 (必杀) ---
 * @desc "必杀" 按钮的独立 Y 坐标 (基础位置)。
 * @default 20
 *
 * @param --- 按钮 2 (千攻) ---
 *
 * @param Button 2 X
 * @parent --- 按钮 2 (千攻) ---
 * @desc "千攻" 按钮的独立 X 坐标 (基础位置)。
 * @default 130
 *
 * @param Button 2 Y
 * @parent --- 按钮 2 (千攻) ---
 * @desc "千攻" 按钮的独立 Y 坐标 (基础位置)。
 * @default 20
 *
 * @help
 * ============================================================================
 * 介绍
 * ============================================================================
 * 在战斗界面显示两个作弊按钮。
 *
 * 按钮位置计算公式：
 * 最终 X = 按钮独立 X + 整体偏移 X
 * 最终 Y = 按钮独立 Y + 整体偏移 Y
 *
 * 按钮功能：
 * 1. [必杀]: 点击后，我方全体 命中率(HIT) 和 暴击率(CRI) 锁定为 100%。
 * 2. [千攻]: 点击后，我方全体 攻击力(ATK) 锁定为 1000。
 *
 * ============================================================================
 * 兼容性
 * ============================================================================
 * 包含防崩溃修复 (无 strokeRect，无 canvasToLocalX)，稳定运行。
 */

(function() {

    // --- 读取插件参数 ---
    var parameters = PluginManager.parameters('Cheat_BattleButtons');
    
    // 整体偏移
    var pGlobalX = Number(parameters['Global Offset X'] || 0);
    var pGlobalY = Number(parameters['Global Offset Y'] || 0);

    // 独立坐标
    var pBtn1X = Number(parameters['Button 1 X'] || 20);
    var pBtn1Y = Number(parameters['Button 1 Y'] || 20);
    var pBtn2X = Number(parameters['Button 2 X'] || 130);
    var pBtn2Y = Number(parameters['Button 2 Y'] || 20);
    
    //=============================================================================
    // ** Game_System
    // 保存按钮状态
    //=============================================================================
    var _Game_System_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function() {
        _Game_System_initialize.call(this);
        this._cheatCritActive = false;
        this._cheatAtkActive = false;
    };

    Game_System.prototype.isCheatCritActive = function() {
        return this._cheatCritActive;
    };

    Game_System.prototype.setCheatCritActive = function(value) {
        this._cheatCritActive = value;
    };

    Game_System.prototype.isCheatAtkActive = function() {
        return this._cheatAtkActive;
    };

    Game_System.prototype.setCheatAtkActive = function(value) {
        this._cheatAtkActive = value;
    };

    //=============================================================================
    // ** Game_BattlerBase / Game_Actor
    // 核心逻辑：拦截属性计算
    //=============================================================================

    // 1. 修改 命中率 (hit - xparam 0) 和 暴击率 (cri - xparam 2)
    var _Game_BattlerBase_xparam = Game_BattlerBase.prototype.xparam;
    Game_BattlerBase.prototype.xparam = function(xparamId) {
        var value = _Game_BattlerBase_xparam.call(this, xparamId);
        
        // 仅对我方角色(Actor)生效
        if (this.isActor() && $gameSystem.isCheatCritActive()) {
            if (xparamId === 0 || xparamId === 2) {
                return 1.0; // 100%
            }
        }
        return value;
    };

    // 2. 修改 攻击力 (atk - param 2)
    var _Game_BattlerBase_param = Game_BattlerBase.prototype.param;
    Game_BattlerBase.prototype.param = function(paramId) {
        // 仅对我方角色(Actor)生效
        if (this.isActor() && paramId === 2 && $gameSystem.isCheatAtkActive()) {
            return 1000; // 锁定为 1000
        }
        return _Game_BattlerBase_param.call(this, paramId);
    };

    //=============================================================================
    // ** Sprite_CheatButton
    // 自定义按钮
    //=============================================================================
    function Sprite_CheatButton() {
        this.initialize.apply(this, arguments);
    }

    Sprite_CheatButton.prototype = Object.create(Sprite.prototype);
    Sprite_CheatButton.prototype.constructor = Sprite_CheatButton;

    Sprite_CheatButton.prototype.initialize = function(type) {
        Sprite.prototype.initialize.call(this);
        this._type = type; // 1 = 必杀, 2 = 千攻
        this.createBitmap();
        this.updateState();
    };

    Sprite_CheatButton.prototype.createBitmap = function() {
        this.bitmap = new Bitmap(100, 40);
    };

    // --- 绘制逻辑：使用 fillRect 模拟边框 ---
    Sprite_CheatButton.prototype.redraw = function(isActive) {
        var color = isActive ? '#ffcc00' : 'rgba(0,0,0,0.6)';
        var textColor = '#ffffff';
        var borderColor = '#ffffff';
        var text = (this._type === 1) ? "必杀" : "千攻";
        text += (isActive ? " ON" : " OFF");

        this.bitmap.clear();
        
        // 1. 画背景
        this.bitmap.fillRect(0, 0, 100, 40, color);
        
        // 2. 画边框 (使用 fillRect 画四条线)
        this.bitmap.fillRect(0, 0, 100, 2, borderColor); // 上
        this.bitmap.fillRect(0, 38, 100, 2, borderColor); // 下
        this.bitmap.fillRect(0, 0, 2, 40, borderColor); // 左
        this.bitmap.fillRect(98, 0, 2, 40, borderColor); // 右

        // 3. 画文字
        this.bitmap.fontSize = 20;
        this.bitmap.textColor = textColor;
        this.bitmap.drawText(text, 0, 0, 100, 40, 'center');
    };

    Sprite_CheatButton.prototype.update = function() {
        Sprite.prototype.update.call(this);
        this.processTouch();
    };

    // --- 触摸判定 ---
    Sprite_CheatButton.prototype.processTouch = function() {
        if (TouchInput.isTriggered()) {
            var tx = TouchInput.x;
            var ty = TouchInput.y;
            
            // 获取按钮当前的屏幕坐标
            var bx = this.x;
            var by = this.y;
            var bw = 100; 
            var bh = 40;  
            
            if (tx >= bx && tx <= bx + bw && ty >= by && ty <= by + bh) {
                SoundManager.playOk();
                this.onClick();
            }
        }
    };

    Sprite_CheatButton.prototype.onClick = function() {
        if (this._type === 1) {
            $gameSystem.setCheatCritActive(!$gameSystem.isCheatCritActive());
        } else {
            $gameSystem.setCheatAtkActive(!$gameSystem.isCheatAtkActive());
        }
        this.updateState();
    };

    Sprite_CheatButton.prototype.updateState = function() {
        var active = (this._type === 1) ? $gameSystem.isCheatCritActive() : $gameSystem.isCheatAtkActive();
        this.redraw(active);
    };

    //=============================================================================
    // ** Scene_Battle
    //=============================================================================
    var _Scene_Battle_createDisplayObjects = Scene_Battle.prototype.createDisplayObjects;
    Scene_Battle.prototype.createDisplayObjects = function() {
        _Scene_Battle_createDisplayObjects.call(this);
        this.createCheatButtons();
    };

    Scene_Battle.prototype.createCheatButtons = function() {
        // 计算最终坐标 = 独立坐标 + 整体偏移
        
        // 按钮1
        this._cheatBtn1 = new Sprite_CheatButton(1);
        this._cheatBtn1.x = pBtn1X + pGlobalX;
        this._cheatBtn1.y = pBtn1Y + pGlobalY;
        this.addChild(this._cheatBtn1);

        // 按钮2
        this._cheatBtn2 = new Sprite_CheatButton(2);
        this._cheatBtn2.x = pBtn2X + pGlobalX;
        this._cheatBtn2.y = pBtn2Y + pGlobalY;
        this.addChild(this._cheatBtn2);
    };

})();