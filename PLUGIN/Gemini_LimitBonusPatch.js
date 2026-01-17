/*:
 * @plugindesc 章节属性上限 (特定图标加成版 - 回退)
 * @author Gemini
 *
 * @param ---系统设置---
 * @default
 *
 * @param Plugin Enabled
 * @text 插件总开关
 * @type boolean
 * @on 启用
 * @off 禁用
 * @default true
 *
 * @param Default Visible
 * @text 默认显示状态
 * @type boolean
 * @on 展开
 * @off 隐藏
 * @default true
 *
 * @param ---数值设置---
 * @default
 *
 * @param Limit HP Per Chapter
 * @text 每章 HP 上限增量
 * @desc 默认 400。
 * @type number
 * @default 400
 *
 * @param Limit MP Per Chapter
 * @text 每章 MP 上限增量
 * @desc 默认 160。
 * @type number
 * @default 160
 *
 * @param Limit Param Per Chapter
 * @text 每章 普通属性 上限增量
 * @desc 默认 40。
 * @type number
 * @default 40
 *
 * @param ---操作设置---
 * @default
 *
 * @param Toggle Key
 * @text 切换按键
 * @type select
 * @option Tab
 * @value tab
 * @option Shift
 * @value shift
 * @default tab
 *
 * @param ---窗口位置---
 * @default
 *
 * @param Window X
 * @text 窗口 X 坐标
 * @type number
 * @default 0
 *
 * @param Window Y
 * @text 窗口 Y 坐标
 * @type number
 * @default 0
 *
 * @help
 * ============================================================================
 * 逻辑回退说明
 * ============================================================================
 * 恢复为根据图标类型加成特定属性：
 * 1. 盾牌 (1-5): 加成 DEF, MDF, HP
 * 2. 剑 (6-10): 加成 ATK, DEF, LUK
 * 3. 靴子 (11-15): 加成 AGI, ATK, LUK
 * 4. 绷带 (16-20): 加成 MAT, MP, HP, AGI
 * 5. 帽子 (21-25): 加成 MAT, MDF, MP
 */

(function() {
    var pluginName = "Gemini_ChapterLimit_Fixed";
    if (document.currentScript) {
        var scriptName = document.currentScript.src.split('/').pop().split('.').shift();
        if (scriptName) pluginName = scriptName;
    }
    var parameters = PluginManager.parameters(pluginName);

    var isPluginEnabled = (parameters['Plugin Enabled'] !== 'false');
    var isDefaultVisible = (parameters['Default Visible'] !== 'false');
    
    var limitHpPerChapter = Number(parameters['Limit HP Per Chapter'] || 400);
    var limitMpPerChapter = Number(parameters['Limit MP Per Chapter'] || 160);
    var limitParamPerChapter = Number(parameters['Limit Param Per Chapter'] || 40);
    
    var toggleKey = String(parameters['Toggle Key'] || 'tab');
    var winX = Number(parameters['Window X'] || 0);
    var winY = Number(parameters['Window Y'] || 0);

    var baseBonusValues = [80, 40, 20, 10, 5];

    // ========================================================================
    //  Part 1: 图标加成逻辑 (特定加成)
    // ========================================================================
    
    Game_Actor.prototype.getIconLimitBonus = function(paramId) {
        var iconIndex = 0;
        
        var drawIconParams = PluginManager.parameters('DrawIconAfterName');
        if (drawIconParams) {
            var globalVarId = Number(drawIconParams['Icon Variable ID'] || 0);
            if (globalVarId > 0 && $gameVariables.value(globalVarId) > 0) {
                iconIndex = $gameVariables.value(globalVarId);
            }
        }
        if (iconIndex === 0 && this._overrideNameIcon !== undefined && this._overrideNameIcon > 0) {
            iconIndex = this._overrideNameIcon;
        }
        if (iconIndex === 0 && this.actor().meta.NameIcon) {
            iconIndex = Number(this.actor().meta.NameIcon);
        }

        if (iconIndex <= 0 || iconIndex > 25) return 0;

        var currentChapter = 1;
        if ($gameSystem && typeof $gameSystem.chapter === 'function') {
            currentChapter = $gameSystem.chapter();
        } else if ($gameSystem && $gameSystem._chapterVersion) {
            currentChapter = $gameSystem._chapterVersion;
        }
        
        var chapterInt = Math.floor(currentChapter);
        if (chapterInt < 1) chapterInt = 1;
        if (chapterInt > 5) chapterInt = 5;

        var limitTier = 6 - chapterInt;
        var typeGroup = Math.floor((iconIndex - 1) / 5); 
        var originalTier = ((iconIndex - 1) % 5) + 1;
        var effectiveTier = Math.max(originalTier, limitTier);
        
        var bonusVal = baseBonusValues[effectiveTier - 1];

        // 属性类型放大
        if (paramId === 0) { // HP
            bonusVal *= (limitHpPerChapter / limitParamPerChapter); 
        } else if (paramId === 1) { // MP
            bonusVal *= (limitMpPerChapter / limitParamPerChapter);
        }
        
        // 判定属性归属
        var isTargetParam = false;
        switch (typeGroup) {
            case 0: // 盾牌
                if (paramId === 3 || paramId === 5 || paramId === 0) isTargetParam = true;
                break;
            case 1: // 剑
                if (paramId === 2 || paramId === 3 || paramId === 7) isTargetParam = true;
                break;
            case 2: // 靴子
                if (paramId === 6 || paramId === 2 || paramId === 7) isTargetParam = true;
                break;
            case 3: // 绷带
                if (paramId === 4 || paramId === 1 || paramId === 0 || paramId === 6) isTargetParam = true;
                break;
            case 4: // 帽子
                if (paramId === 4 || paramId === 5 || paramId === 1) isTargetParam = true;
                break;
        }

        return isTargetParam ? Math.floor(bonusVal) : 0;
    };

    // ========================================================================
    //  Part 2: 属性上限计算
    // ========================================================================

    var _Game_BattlerBase_paramMax = Game_BattlerBase.prototype.paramMax;
    Game_BattlerBase.prototype.paramMax = function(paramId) {
        if (this.isActor()) {
            var currentChapter = 1;
            if ($gameSystem && typeof $gameSystem.chapter === 'function') {
                currentChapter = $gameSystem.chapter();
            } else if ($gameSystem && $gameSystem._chapterVersion) {
                currentChapter = $gameSystem._chapterVersion;
            }
            var chapterInt = Math.floor(currentChapter);
            if (chapterInt < 1) chapterInt = 1;

            var baseLimit = 0;
            if (paramId === 0) { 
                baseLimit = chapterInt * limitHpPerChapter;
            } else if (paramId === 1) { 
                baseLimit = chapterInt * limitMpPerChapter;
            } else { 
                baseLimit = chapterInt * limitParamPerChapter;
            }

            var bonus = this.getIconLimitBonus(paramId);

            return baseLimit + bonus;
        }
        return _Game_BattlerBase_paramMax.call(this, paramId);
    };

    // ========================================================================
    //  Part 3: 窗口显示
    // ========================================================================
    // (省略 Window_LimitMonitor 部分，保持原样即可，为了篇幅这里不重复写，
    //  实际使用请确保之前的 Window_LimitMonitor 代码还在文件里，或者直接保留上一版的文件尾部)
    
    function Window_LimitMonitor() {
        this.initialize.apply(this, arguments);
    }

    Window_LimitMonitor.prototype = Object.create(Window_Base.prototype);
    Window_LimitMonitor.prototype.constructor = Window_LimitMonitor;

    Window_LimitMonitor.prototype.initialize = function(x, y) {
        var width = 280; 
        var height = this.fittingHeight(9);
        Window_Base.prototype.initialize.call(this, x, y, width, height);
        this.opacity = 200;
        this._isVisible = (isPluginEnabled && isDefaultVisible);
        this.visible = this._isVisible;
        if (this.visible) this.refresh();
    };

    Window_LimitMonitor.prototype.update = function() {
        Window_Base.prototype.update.call(this);
        if (isPluginEnabled) {
            if (Input.isTriggered(toggleKey)) {
                this._isVisible = !this._isVisible;
                this.visible = this._isVisible;
                if (this._isVisible) {
                    SoundManager.playCursor();
                    this.refresh();
                } else {
                    SoundManager.playCancel();
                }
            }
        } else {
            this.visible = false;
        }
        if (this.visible && Graphics.frameCount % 20 === 0) {
            this.refresh();
        }
    };

    Window_LimitMonitor.prototype.refresh = function() {
        if (!this.contents) return;
        this.contents.clear();
        var actor = $gameParty.leader();
        if (!actor) return;
        var currentChapter = ($gameSystem && $gameSystem.chapter) ? $gameSystem.chapter() : 1;
        var chapterInt = Math.floor(currentChapter);
        var lineHeight = this.lineHeight();
        this.changeTextColor(this.systemColor());
        var title = "第" + chapterInt + "章 上限";
        if (chapterInt >= 5) title = "第" + chapterInt + "章 (全解锁)";
        this.drawText(title, 0, 0, this.contentsWidth(), 'center');
        this.resetTextColor();
        var params = [
            { id: 0, name: TextManager.hp },
            { id: 1, name: TextManager.mp },
            { id: 2, name: TextManager.param(2) },
            { id: 3, name: TextManager.param(3) },
            { id: 4, name: TextManager.param(4) },
            { id: 5, name: TextManager.param(5) },
            { id: 6, name: TextManager.param(6) },
            { id: 7, name: TextManager.param(7) }
        ];
        for (var i = 0; i < params.length; i++) {
            var p = params[i];
            var finalLimit = actor.paramMax(p.id);
            var bonus = actor.getIconLimitBonus(p.id);
            var y = lineHeight * (i + 1);
            this.changeTextColor(this.systemColor());
            this.drawText(p.name, 0, y, 80);
            this.resetTextColor();
            var valueText = String(finalLimit);
            if (bonus > 0) {
                this.changeTextColor(this.powerUpColor());
                valueText += " (+" + bonus + ")";
            }
            this.drawText(valueText, 80, y, 160, 'right');
            this.resetTextColor();
        }
    };

    var _Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;
    Scene_Map.prototype.createAllWindows = function() {
        _Scene_Map_createAllWindows.call(this);
        this.createLimitMonitorWindow();
    };

    Scene_Map.prototype.createLimitMonitorWindow = function() {
        this._limitMonitorWindow = new Window_LimitMonitor(winX, winY);
        this.addWindow(this._limitMonitorWindow);
    };

})();