/*:
 * @plugindesc [v2.1] 战斗中循环显示弱点图标 (支持独立设置问号图标大小)
 * @author Gemini Assistant
 *
 * @param ---Icon Settings---
 * @text 图标外观设置
 *
 * @param Unknown Icon Index
 * @parent ---Icon Settings---
 * @text 未知弱点图标
 * @type number
 * @min 0
 * @desc 当弱点尚未被属性攻击触发时显示的图标 (如问号)。
 * @default 19
 *
 * @param Unknown Icon Scale
 * @parent ---Icon Settings---
 * @text 未知图标缩放
 * @type number
 * @decimals 2
 * @min 0.1
 * @desc 问号图标的基础缩放比例。它会在此基础上进行呼吸动画。
 * @default 1.00
 *
 * @param Icon Width
 * @parent ---Icon Settings---
 * @text 图标原始宽度
 * @type number
 * @min 1
 * @desc IconSet.png 中单个图标的像素宽度 (你的项目是40)。
 * @default 40
 *
 * @param Icon Height
 * @parent ---Icon Settings---
 * @text 图标原始高度
 * @type number
 * @min 1
 * @desc IconSet.png 中单个图标的像素高度 (你的项目是40)。
 * @default 40
 *
 * @param Icon Scale
 * @parent ---Icon Settings---
 * @text 弱点图标缩放
 * @type number
 * @decimals 2
 * @min 0.1
 * @desc 针对已揭示的弱点属性图标（火、水等）的缩放比例。
 * @default 1.00
 *
 * @param Background Icon Index
 * @parent ---Icon Settings---
 * @text 背景图标索引
 * @type number
 * @min 0
 * @desc 显示在弱点图标后方的背景图标ID（在IconSet中）。0为不显示。
 * @default 0
 *
 * @param ---Weakness Settings---
 * @text 弱点显示设置
 *
 * @param Element Icons
 * @parent ---Weakness Settings---
 * @text 属性图标配置
 * @type struct<ElementIcon>[]
 * @desc 配置每个属性ID对应的图标索引。
 * @default []
 *
 * @param Scroll Speed
 * @parent ---Weakness Settings---
 * @text 图标滚动速度
 * @type number
 * @min 1
 * @desc 每隔多少帧切换下一个弱点图标？(60帧 = 1秒)
 * @default 60
 *
 * @param Offset X
 * @parent ---Weakness Settings---
 * @text 全局图标 X 偏移
 * @type number
 * @min -999
 * @max 999
 * @desc 所有敌人的图标相对于中心的通用水平偏移量。
 * @default 0
 *
 * @param Offset Y
 * @parent ---Weakness Settings---
 * @text 全局图标 Y 偏移
 * @type number
 * @min -999
 * @max 999
 * @desc 所有敌人的图标相对于中心的通用垂直偏移量。
 * @default -100
 *
 * @param Threshold
 * @parent ---Weakness Settings---
 * @text 弱点判定阈值
 * @type number
 * @desc 属性有效度大于多少百分比才算弱点？(100代表100%)
 * @default 100
 *
 * @help
 * ============================================================================
 * 简单循环弱点显示 v2.1
 * ============================================================================
 *
 * 更新日志 v2.1:
 * - 新增 "未知图标缩放 (Unknown Icon Scale)" 参数。
 * - 允许将问号图标和普通属性图标设置为不同的大小。
 *
 * ============================================================================
 * 备注栏微调 (Notetags)
 * ============================================================================
 * <弱点偏移x: 20>
 * <弱点偏移y: 50>
 *
 */

/*~struct~ElementIcon:
 * @param Element Id
 * @text 属性 ID
 * @type number
 * @min 1
 * @desc 数据库中的属性 ID。
 *
 * @param Icon Index
 * @text 图标索引
 * @type number
 * @min 0
 * @desc 对应的图标 ID。
 */

(function() {
    var parameters = PluginManager.parameters('SimpleCyclingWeakness');
    
    // 解析参数
    var iconWidth = Number(parameters['Icon Width'] || 40);
    var iconHeight = Number(parameters['Icon Height'] || 40);
    var iconScale = Number(parameters['Icon Scale'] || 1.0);
    var unknownIconScale = Number(parameters['Unknown Icon Scale'] || 1.0); // 新增参数
    var bgIconIndex = Number(parameters['Background Icon Index'] || 0);
    var unknownIconIndex = Number(parameters['Unknown Icon Index'] || 19);

    var rawIcons = JSON.parse(parameters['Element Icons'] || '[]');
    var elementIcons = {};
    rawIcons.forEach(function(json) {
        var data = JSON.parse(json);
        elementIcons[Number(data['Element Id'])] = Number(data['Icon Index']);
    });

    var scrollSpeed = Number(parameters['Scroll Speed'] || 60);
    var globalOffsetX = Number(parameters['Offset X'] || 0);
    var globalOffsetY = Number(parameters['Offset Y'] || -100);
    var threshold = Number(parameters['Threshold'] || 100) / 100;

    // ==============================================================================
    // Game_Enemy Extension
    // ==============================================================================
    var _Game_Enemy_initMembers = Game_Enemy.prototype.initMembers;
    Game_Enemy.prototype.initMembers = function() {
        _Game_Enemy_initMembers.call(this);
        this._revealedWeaknesses = [];
    };

    Game_Enemy.prototype.isWeaknessRevealed = function(elementId) {
        return this._revealedWeaknesses.contains(elementId);
    };

    Game_Enemy.prototype.revealWeakness = function(elementId) {
        if (!this._revealedWeaknesses.contains(elementId)) {
            this._revealedWeaknesses.push(elementId);
        }
    };

    // ==============================================================================
    // Game_Action Extension
    // ==============================================================================
    var _Game_Action_apply = Game_Action.prototype.apply;
    Game_Action.prototype.apply = function(target) {
        _Game_Action_apply.call(this, target);
        if (target.result().isHit() && target.isEnemy()) {
            this.checkWeaknessReveal(target);
        }
    };

    Game_Action.prototype.checkWeaknessReveal = function(target) {
        var elements = [];
        var damageElementId = this.item().damage.elementId;
        
        if (damageElementId < 0) {
            elements = this.subject().attackElements();
        } else {
            elements = [damageElementId];
        }

        for (var i = 0; i < elements.length; i++) {
            var elId = elements[i];
            var rate = target.elementRate(elId);
            if (rate > threshold) {
                target.revealWeakness(elId);
            }
        }
    };

    // ==============================================================================
    // Sprite_WeaknessIcon
    // ==============================================================================
    function Sprite_WeaknessIcon() {
        this.initialize.apply(this, arguments);
    }

    Sprite_WeaknessIcon.prototype = Object.create(Sprite.prototype);
    Sprite_WeaknessIcon.prototype.constructor = Sprite_WeaknessIcon;

    Sprite_WeaknessIcon.prototype.initialize = function() {
        Sprite.prototype.initialize.call(this);
        this.anchor.x = 0.5;
        this.anchor.y = 1; 
        this.visible = false;
        
        this._battler = null;
        this._timer = 0;
        this._currentIndex = 0;
        this._weaknessList = [];

        // --- 背景层 ---
        this._bgSprite = new Sprite();
        this._bgSprite.bitmap = ImageManager.loadSystem('IconSet');
        this._bgSprite.anchor.x = 0.5;
        this._bgSprite.anchor.y = 0.5;
        this._bgSprite.y = -iconHeight / 2;
        this._bgSprite.setFrame(0, 0, 0, 0);
        this.addChild(this._bgSprite);

        // --- 前景层(弱点) ---
        this._fgSprite = new Sprite();
        this._fgSprite.bitmap = ImageManager.loadSystem('IconSet');
        this._fgSprite.anchor.x = 0.5;
        this._fgSprite.anchor.y = 0.5;
        this._fgSprite.y = -iconHeight / 2;
        this._fgSprite.scale.x = iconScale;
        this._fgSprite.scale.y = iconScale;
        this._fgSprite.setFrame(0, 0, 0, 0); 
        this.addChild(this._fgSprite);

        this.refreshBackgroundFrame();
    };

    Sprite_WeaknessIcon.prototype.setup = function(battler) {
        this._battler = battler;
        this.refreshWeaknessList();
        this.updatePosition();
    };

    Sprite_WeaknessIcon.prototype.updatePosition = function() {
        if (!this._battler) return;
        
        var enemyData = this._battler.enemy();
        var localX = 0;
        var localY = 0;

        if (enemyData.meta['弱点偏移x']) {
            localX = Number(enemyData.meta['弱点偏移x']);
        }
        if (enemyData.meta['弱点偏移y']) {
            localY = Number(enemyData.meta['弱点偏移y']);
        }

        this.x = globalOffsetX + localX;
        this.y = globalOffsetY + localY;
    };

    Sprite_WeaknessIcon.prototype.refreshWeaknessList = function() {
        if (!this._battler) return;
        
        var knowns = [];
        var unknowns = [];
        
        for (var elId in elementIcons) {
            var id = Number(elId);
            var rate = this._battler.elementRate(id);
            
            if (rate > threshold) {
                if (this._battler.isWeaknessRevealed(id)) {
                    knowns.push(elementIcons[id]);
                } else {
                    unknowns.push(unknownIconIndex);
                }
            }
        }

        this._weaknessList = unknowns.concat(knowns);
    };

    Sprite_WeaknessIcon.prototype.update = function() {
        Sprite.prototype.update.call(this);
        if (!this._battler) return;

        if (this._battler.isDead() || this._battler.isHidden()) {
            this.visible = false;
            return;
        }

        if (this._timer % scrollSpeed === 0 || Graphics.frameCount % 10 === 0) {
           this.refreshWeaknessList();
        }

        if (this._weaknessList.length > 0) {
            this.visible = true;
            
            if (bgIconIndex > 0) {
                this._bgSprite.visible = true;
            } else {
                this._bgSprite.visible = false;
            }

            this.updateIconCycle();
            this.updatePulseAnimation(); 
        } else {
            this.visible = false;
        }
    };

    Sprite_WeaknessIcon.prototype.updatePulseAnimation = function() {
        var currentIconIndex = this._weaknessList[this._currentIndex];
        
        if (currentIconIndex === unknownIconIndex) {
            // 使用 "Unknown Icon Scale" 作为基础值
            var pulse = Math.sin(Graphics.frameCount * 0.1) * 0.15;
            var newScale = unknownIconScale + pulse;
            
            if (newScale < 0) newScale = 0;
            
            this._fgSprite.scale.x = newScale;
            this._fgSprite.scale.y = newScale;
        } else {
            // 使用 "Icon Scale" 作为基础值
            this._fgSprite.scale.x = iconScale;
            this._fgSprite.scale.y = iconScale;
        }
    };

    Sprite_WeaknessIcon.prototype.updateIconCycle = function() {
        this._timer++;
        
        if (this._weaknessList.length > 1) {
            if (this._timer >= scrollSpeed) {
                this._timer = 0;
                this._currentIndex++;
                if (this._currentIndex >= this._weaknessList.length) {
                    this._currentIndex = 0;
                }
                this.refreshForegroundFrame();
            }
        } else {
             this._currentIndex = 0;
             this.refreshForegroundFrame();
        }
    };

    Sprite_WeaknessIcon.prototype.refreshBackgroundFrame = function() {
        if (bgIconIndex <= 0) return;
        
        var pw = iconWidth;
        var ph = iconHeight;
        var sx = bgIconIndex % 16 * pw;
        var sy = Math.floor(bgIconIndex / 16) * ph;
        
        this._bgSprite.setFrame(sx, sy, pw, ph);
    };

    Sprite_WeaknessIcon.prototype.refreshForegroundFrame = function() {
        if (!this._weaknessList || this._weaknessList.length === 0) {
            this._fgSprite.setFrame(0, 0, 0, 0);
            return;
        }

        var iconIndex = this._weaknessList[this._currentIndex];
        
        if (typeof iconIndex !== 'number') return;

        var pw = iconWidth;
        var ph = iconHeight;
        var sx = iconIndex % 16 * pw;
        var sy = Math.floor(iconIndex / 16) * ph;
        
        this._fgSprite.setFrame(sx, sy, pw, ph);
    };

    var _Sprite_Enemy_initMembers = Sprite_Enemy.prototype.initMembers;
    Sprite_Enemy.prototype.initMembers = function() {
        _Sprite_Enemy_initMembers.call(this);
        this._weaknessIconSprite = null;
    };

    var _Sprite_Enemy_setBattler = Sprite_Enemy.prototype.setBattler;
    Sprite_Enemy.prototype.setBattler = function(battler) {
        _Sprite_Enemy_setBattler.call(this, battler);
        if (!this._weaknessIconSprite) {
            this._weaknessIconSprite = new Sprite_WeaknessIcon();
            this.addChild(this._weaknessIconSprite);
        }
        this._weaknessIconSprite.setup(battler);
    };

})();