/*:
 * @plugindesc [v2.1 Fix] 在战斗中添加一个开关按钮，开启后持续跳过敌人回合。
 * @author Gemini & User
 *
 * @param --- 设置 ---
 *
 * @param Button Image
 * @parent --- 设置 ---
 * @desc 按钮图片的文件名 (放在 img/system/ 中).
 * 留空则使用文字绘制。
 * @default 
 *
 * @param Button X
 * @parent --- 设置 ---
 * @desc 按钮在屏幕上的 X 坐标.
 * @default 700
 *
 * @param Button Y
 * @parent --- 设置 ---
 * @desc 按钮在屏幕上的 Y 坐标.
 * @default 10
 *
 * @param Button Text
 * @parent --- 设置 ---
 * @desc 如果没有图片，显示的文字内容.
 * @default 跳过敌方
 *
 * @param Button Scale
 * @parent --- 设置 ---
 * @desc 按钮的缩放比例 (1.0 为原大小).
 * @default 1.0
 *
 * @help
 * ============================================================================
 * 兼容性修复说明 (v2.1)
 * ============================================================================
 * 针对 YEP_BattleEngineCore 和 YEP_X_BattleSysCTB 进行了适配。
 * 现在不仅仅是在生成队列时移除敌人，而是在敌人试图 [开始行动] 的瞬间，
 * 强制将其拦截并结束回合。
 *
 * ============================================================================
 * 功能介绍
 * ============================================================================
 * 在战斗界面显示一个按钮。
 * * 1. 点击按钮：切换 [开启/关闭] 状态。
 * 2. 开启状态（按钮发光）：
 * - 敌人轮到行动回合时，会瞬间跳过，无法出招。
 * 3. 关闭状态（按钮正常）：
 * - 恢复正常战斗流程。
 */

(function() {
    var parameters = PluginManager.parameters('SkipEnemyTurnButton');
    var pButtonImage = String(parameters['Button Image'] || '');
    var pButtonX = Number(parameters['Button X'] || 700);
    var pButtonY = Number(parameters['Button Y'] || 10);
    var pButtonText = String(parameters['Button Text'] || '跳过敌方');
    var pButtonScale = Number(parameters['Button Scale'] || 1.0);

    //=============================================================================
    // BattleManager
    //=============================================================================
    
    var _BattleManager_initMembers = BattleManager.initMembers;
    BattleManager.initMembers = function() {
        _BattleManager_initMembers.call(this);
        this._skipEnemyMode = false;
    };

    BattleManager.toggleSkipEnemyMode = function() {
        this._skipEnemyMode = !this._skipEnemyMode;
        
        if (this._skipEnemyMode) {
            SoundManager.playOk();
            this.performSkipLogic(); 
        } else {
            SoundManager.playCancel();
        }
    };

    BattleManager.isSkipEnemyModeActive = function() {
        return this._skipEnemyMode;
    };

    // 原有的清理逻辑（对默认战斗系统有效）
    BattleManager.performSkipLogic = function() {
        if (this._actionBattlers) {
            this._actionBattlers = this._actionBattlers.filter(function(battler) {
                if (battler.isEnemy()) {
                    battler.clearActions();
                    return false;
                }
                return true;
            });
        }

        // 如果当前正好是敌人，立刻中断
        if (this._subject && this._subject.isEnemy()) {
            this._subject.clearActions();
            if (Imported && Imported.YEP_BattleEngineCore) {
                if (this._processTurn) { // 兼容部分 Yanfly 版本
                    this.endAction(); 
                } else {
                    this.endAction();
                }
            } else {
                this.endAction();
            }
        }
    };

    // 钩子1：默认战斗系统的队列生成拦截
    var _BattleManager_makeActionOrders = BattleManager.makeActionOrders;
    BattleManager.makeActionOrders = function() {
        _BattleManager_makeActionOrders.call(this);
        if (this._skipEnemyMode) {
            this.performSkipLogic();
        }
    };

    // 钩子2：核心拦截 (针对 CTB/ATB 以及所有试图行动的瞬间)
    // 这是修复 YEP_CTB 的关键部分
    var _BattleManager_startAction = BattleManager.startAction;
    BattleManager.startAction = function() {
        // 如果开启了跳过模式，且当前行动主体是敌人
        if (this.isSkipEnemyModeActive() && this._subject && this._subject.isEnemy()) {
            
            // 1. 清空敌人的具体行动内容
            this._subject.clearActions();
            
            // 2. 强制直接调用 endAction (告诉系统动作已做完)
            // 这会让 CTB 系统重置该敌人的行动条
            this.endAction();
            
            // 3. 阻止后续的原版 startAction 执行
            return; 
        }
        
        // 如果不是敌人，或者没开启跳过，正常执行
        _BattleManager_startAction.call(this);
    };

    //=============================================================================
    // Sprite_SkipButton
    //=============================================================================
    function Sprite_SkipButton() {
        this.initialize.apply(this, arguments);
    }

    Sprite_SkipButton.prototype = Object.create(Sprite_Button.prototype);
    Sprite_SkipButton.prototype.constructor = Sprite_SkipButton;

    Sprite_SkipButton.prototype.initialize = function() {
        Sprite_Button.prototype.initialize.call(this);
        this.x = pButtonX;
        this.y = pButtonY;
        this.scale.x = pButtonScale;
        this.scale.y = pButtonScale;
        this.loadButtonImage();
    };

    Sprite_SkipButton.prototype.loadButtonImage = function() {
        if (pButtonImage) {
            this.bitmap = ImageManager.loadSystem(pButtonImage);
        } else {
            this.bitmap = new Bitmap(120, 40);
            this.bitmap.fillAll('rgba(0, 0, 0, 0.6)');
            this.bitmap.fontSize = 20;
            this.bitmap.drawText(pButtonText, 0, 0, 120, 40, 'center');
        }
    };

    Sprite_SkipButton.prototype.update = function() {
        Sprite_Button.prototype.update.call(this);
        this.visible = SceneManager._scene instanceof Scene_Battle;

        if (BattleManager.isSkipEnemyModeActive()) {
            this.setBlendColor([255, 255, 255, 100]); 
        } else {
            this.setBlendColor([0, 0, 0, 0]);
        }
    };

    Sprite_SkipButton.prototype.callClickHandler = function() {
        BattleManager.toggleSkipEnemyMode();
    };

    //=============================================================================
    // Scene_Battle
    //=============================================================================
    var _Scene_Battle_createDisplayObjects = Scene_Battle.prototype.createDisplayObjects;
    Scene_Battle.prototype.createDisplayObjects = function() {
        _Scene_Battle_createDisplayObjects.call(this);
        this.createSkipButton();
    };

    Scene_Battle.prototype.createSkipButton = function() {
        this._skipButton = new Sprite_SkipButton();
        this.addChild(this._skipButton);
    };

})();