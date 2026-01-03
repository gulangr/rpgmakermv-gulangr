/*:
 * @plugindesc 技能消耗/产生变量扩展 v1.5：修复图标不显示的问题(正则冲突修复)。
 * @author Custom Plugin
 *
 * @param ---常规设置---
 * @default
 *
 * @param IconSet Filename
 * @text 图标集文件名
 * @parent ---常规设置---
 * @desc 存放在 img/system/ 文件夹下的图片文件名（不带扩展名）。
 * @default IconSet
 *
 * @param Show Cost Value
 * @text 显示消耗数值
 * @parent ---常规设置---
 * @type boolean
 * @on 显示
 * @off 隐藏
 * @desc 是否在图标右侧显示消耗的具体数字？(如: 图标 1)。
 * @default false
 *
 * @param ---变量类型 1---
 * @default
 *
 * @param Var1 ID
 * @text 绑定的变量ID
 * @parent ---变量类型 1---
 * @type variable
 * @desc 该类型对应的游戏变量ID。
 * @default 1
 *
 * @param Var1 Index
 * @text 图标索引
 * @parent ---变量类型 1---
 * @type number
 * @desc 图标索引。请设置为大于0的数。
 * @default 16
 *
 * @param Var1 Scale
 * @text 图标缩放比例
 * @parent ---变量类型 1---
 * @desc 1.0 为原大小，0.5 为一半大小。
 * @default 1.0
 *
 * @param ---变量类型 2---
 * @default
 *
 * @param Var2 ID
 * @text 绑定的变量ID
 * @parent ---变量类型 2---
 * @type variable
 * @default 2
 *
 * @param Var2 Index
 * @text 图标索引
 * @parent ---变量类型 2---
 * @type number
 * @default 1
 *
 * @param Var2 Scale
 * @text 图标缩放比例
 * @parent ---变量类型 2---
 * @default 1.0
 *
 * @param ---变量类型 3---
 * @default
 *
 * @param Var3 ID
 * @text 绑定的变量ID
 * @parent ---变量类型 3---
 * @type variable
 * @default 3
 *
 * @param Var3 Index
 * @text 图标索引
 * @parent ---变量类型 3---
 * @type number
 * @default 2
 *
 * @param Var3 Scale
 * @text 图标缩放比例
 * @parent ---变量类型 3---
 * @default 1.0
 *
 * @param ---变量类型 4---
 * @default
 *
 * @param Var4 ID
 * @text 绑定的变量ID
 * @parent ---变量类型 4---
 * @type variable
 * @default 4
 *
 * @param Var4 Index
 * @text 图标索引
 * @parent ---变量类型 4---
 * @type number
 * @default 3
 *
 * @param Var4 Scale
 * @text 图标缩放比例
 * @parent ---变量类型 4---
 * @default 1.0
 *
 * @param ---变量类型 5---
 * @default
 *
 * @param Var5 ID
 * @text 绑定的变量ID
 * @parent ---变量类型 5---
 * @type variable
 * @default 5
 *
 * @param Var5 Index
 * @text 图标索引
 * @parent ---变量类型 5---
 * @type number
 * @default 4
 *
 * @param Var5 Scale
 * @text 图标缩放比例
 * @parent ---变量类型 5---
 * @default 1.0
 *
 * @help
 * ============================================================================
 * 介绍
 * ============================================================================
 * 本插件允许技能消耗或产生(获得)变量值，并为特定技能类型（ID:3）显示自定义图标。
 *
 * ============================================================================
 * 备注指令 (Notetags)
 * ============================================================================
 * 1. 消耗变量 (Cost):
 * <VarCost: 类型ID 数量>
 * 示例: <VarCost: 1 50>  (消耗类型1变量50点，若不足则无法释放)
 *
 * 2. 产生变量 (Gain):
 * <VarGain: 类型ID 数量>
 * 示例: <VarGain: 1 10>  (释放技能后，获得类型1变量10点)
 *
 * * 类型ID (1-5) 对应插件参数中配置的变量ID。
 */

var Imported = Imported || {};
Imported.VarSkillCost = true;

var VarSkillCost = VarSkillCost || {};

(function() {

    // ===========================================================================
    // 参数解析
    // ===========================================================================
    var parameters = PluginManager.parameters('VarSkillCost');
    
    VarSkillCost.iconSetFile = String(parameters['IconSet Filename'] || 'IconSet');
    var showValueParam = parameters['Show Cost Value'];
    // 确保默认值为 false
    if (showValueParam === undefined) showValueParam = "false"; 
    VarSkillCost.showValue = eval(String(showValueParam));
    
    VarSkillCost.types = {};
    for (var i = 1; i <= 5; i++) {
        VarSkillCost.types[i] = {
            id: Number(parameters['Var' + i + ' ID'] || 0),
            iconIndex: Number(parameters['Var' + i + ' Index'] || 0),
            scale: Number(parameters['Var' + i + ' Scale'] || 1.0)
        };
    }

    // ===========================================================================
    // 资源预加载
    // ===========================================================================
    var _Scene_Boot_loadSystemImages = Scene_Boot.prototype.loadSystemImages;
    Scene_Boot.prototype.loadSystemImages = function() {
        _Scene_Boot_loadSystemImages.call(this);
        if (VarSkillCost.iconSetFile && VarSkillCost.iconSetFile !== 'IconSet') {
            ImageManager.reserveSystem(VarSkillCost.iconSetFile);
        }
    };

    // ===========================================================================
    // DataManager - 解析备注 (修复了正则匹配冲突)
    // ===========================================================================
    var _DataManager_processSkillNotetags = DataManager.processSkillNotetags;
    DataManager.processSkillNotetags = function(group) {
        _DataManager_processSkillNotetags.call(this, group);
        
        var costRegex = /<(?:VarCost):[ ]*(\d+)[ ]+(\d+)>/i;
        var gainRegex = /<(?:VarGain):[ ]*(\d+)[ ]+(\d+)>/i;
        
        for (var n = 1; n < group.length; n++) {
            var obj = group[n];
            var notedata = obj.note.split(/[\r\n]+/);
            
            obj.varCosts = [];
            obj.varGains = [];
            
            for (var i = 0; i < notedata.length; i++) {
                var line = notedata[i];
                
                // 解析消耗
                var costMatch = line.match(costRegex);
                if (costMatch) {
                    var typeId = parseInt(costMatch[1]);
                    var val = parseInt(costMatch[2]);
                    if (VarSkillCost.types[typeId]) {
                        obj.varCosts.push({
                            type: typeId,
                            varId: VarSkillCost.types[typeId].id,
                            val: val
                        });
                    }
                }
                
                // 解析产生(Gain)
                var gainMatch = line.match(gainRegex);
                if (gainMatch) {
                    var typeId = parseInt(gainMatch[1]);
                    var val = parseInt(gainMatch[2]);
                    if (VarSkillCost.types[typeId]) {
                        obj.varGains.push({
                            type: typeId,
                            varId: VarSkillCost.types[typeId].id,
                            val: val
                        });
                    }
                }
            }
        }
    };

    // ===========================================================================
    // Game_BattlerBase - 逻辑处理
    // ===========================================================================
    
    // 1. 检查消耗是否足够
    var _Game_BattlerBase_canPaySkillCost = Game_BattlerBase.prototype.canPaySkillCost;
    Game_BattlerBase.prototype.canPaySkillCost = function(skill) {
        if (!skill.varCosts) return _Game_BattlerBase_canPaySkillCost.call(this, skill);
        for (var i = 0; i < skill.varCosts.length; i++) {
            var costData = skill.varCosts[i];
            var currentVal = $gameVariables.value(costData.varId);
            if (currentVal < costData.val) return false;
        }
        return _Game_BattlerBase_canPaySkillCost.call(this, skill);
    };

    // 2. 支付消耗
    var _Game_BattlerBase_paySkillCost = Game_BattlerBase.prototype.paySkillCost;
    Game_BattlerBase.prototype.paySkillCost = function(skill) {
        _Game_BattlerBase_paySkillCost.call(this, skill);
        if (skill.varCosts) {
            for (var i = 0; i < skill.varCosts.length; i++) {
                var costData = skill.varCosts[i];
                var currentVal = $gameVariables.value(costData.varId);
                $gameVariables.setValue(costData.varId, currentVal - costData.val);
            }
        }
    };

    // 3. 产生变量 (Gain)
    var _Game_Battler_useItem = Game_Battler.prototype.useItem;
    Game_Battler.prototype.useItem = function(item) {
        _Game_Battler_useItem.call(this, item);
        
        if (DataManager.isSkill(item) && item.varGains && item.varGains.length > 0) {
            if (this.isActor()) {
                for (var i = 0; i < item.varGains.length; i++) {
                    var gainData = item.varGains[i];
                    var currentVal = $gameVariables.value(gainData.varId);
                    $gameVariables.setValue(gainData.varId, currentVal + gainData.val);
                }
            }
        }
    };

    // ===========================================================================
    // Window_SkillList - UI绘制
    // ===========================================================================
    var _Window_SkillList_drawOtherCost = Window_SkillList.prototype.drawOtherCost;
    Window_SkillList.prototype.drawOtherCost = function(skill, wx, wy, dw) {
        dw = _Window_SkillList_drawOtherCost.call(this, skill, wx, wy, dw);

        // 仅在技能类型ID为3且有变量消耗时绘制
        if (skill.stypeId !== 3 || !skill.varCosts || skill.varCosts.length === 0) {
            return dw;
        }

        var bitmap = ImageManager.loadSystem(VarSkillCost.iconSetFile);

        if (!bitmap.isReady()) {
            var _this = this;
            if (!bitmap._hasVarSkillCostListener) {
                bitmap.addLoadListener(function() {
                    if (_this && !_this._isDestroyed && _this.contents) {
                        _this.refresh();
                    }
                });
                bitmap._hasVarSkillCostListener = true;
            }
        }

        for (var i = 0; i < skill.varCosts.length; i++) {
            var costData = skill.varCosts[i];
            var typeConfig = VarSkillCost.types[costData.type];
            var costValue = costData.val;

            // 1. 绘制分隔符 " | "
            if (dw < this.width) {
                var sepText = " | ";
                this.changeTextColor(this.normalColor());
                var scale = (typeof this.getSkillCostScale === 'function') ? this.getSkillCostScale() : 1.0;
                var fontSize = (Yanfly.Param && Yanfly.Param.SCCTpFontSize) ? Yanfly.Param.SCCTpFontSize : 20;
                this.contents.fontSize = Math.round(fontSize * scale);

                var sepWidth = this.textWidth(sepText);
                if (dw >= sepWidth) {
                    this.drawText(sepText, wx, wy, dw, 'right');
                    dw -= sepWidth;
                }
            }

            // 2. 准备数据
            var iconIndex = typeConfig.iconIndex;
            var iconScale = typeConfig.scale;
            var windowScale = (typeof this.getSkillCostScale === 'function') ? this.getSkillCostScale() : 1.0;
            var finalScale = iconScale * windowScale;

            // 检查是否显示数值
            var valStr = VarSkillCost.showValue ? String(costValue) : "";
            
            var baseFontSize = (Yanfly.Param && Yanfly.Param.SCCTpFontSize) ? Yanfly.Param.SCCTpFontSize : 28;
            this.contents.fontSize = Math.round(baseFontSize * windowScale);
            this.changeTextColor(this.normalColor());
            
            var textWidth = this.textWidth(valStr);
            var gap = (valStr === "") ? 0 : 2; 

            var pw = Window_Base._iconWidth;
            var ph = Window_Base._iconHeight;
            var sx = iconIndex % 16 * pw;
            var sy = Math.floor(iconIndex / 16) * ph;
            
            var targetIconW = Math.round(pw * finalScale);
            var targetIconH = Math.round(ph * finalScale);
            
            var totalItemWidth = targetIconW + gap + textWidth;

            // 确保空间足够绘制
            if (dw >= totalItemWidth) {
                // 如果需要显示数值
                if (valStr !== "") {
                    this.drawText(valStr, wx, wy, dw, 'right');
                }
                
                // 计算图标位置
                var iconDestX = wx + dw - textWidth - gap - targetIconW;
                var iconDestY = wy + (this.lineHeight() - targetIconH) / 2;
                
                if (bitmap.isReady()) {
                    this.contents.blt(bitmap, sx, sy, pw, ph, iconDestX, iconDestY, targetIconW, targetIconH);
                }

                dw -= totalItemWidth;
            }
        }
        
        this.resetFontSettings();
        return dw;
    };

})();