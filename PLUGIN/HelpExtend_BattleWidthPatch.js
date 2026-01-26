/*:
 * @plugindesc HelpExtend插件战斗场景宽度自定义补丁
 * @author 辅助开发
 * @parent HelpExtend
 * 
 * @param BattleItemDescWidth
 * @desc 战斗场景下物品描述宽度（仅战斗生效）
 * @default 240
 * 
 * @help 该补丁需在HelpExtend.js之后加载，仅修改战斗场景的ItemDescWidth参数
 */

// 读取补丁参数
RJO.Parameters_BattleWidth = PluginManager.parameters('HelpExtend_BattleWidthPatch');
RJO.Param.BattleItemDescWidth = Number(RJO.Parameters_BattleWidth['BattleItemDescWidth'] || 240);

// 重写Scene_Battle的createHelpWindow方法，使用战斗专属宽度
RJO.HE.Original_Scene_Battle_createHelpWindow = Scene_Battle.prototype.createHelpWindow;
Scene_Battle.prototype.createHelpWindow = function() {
    // 战斗场景使用补丁参数
    this._helpWindow = new Sprite_ItemHelp(RJO.Param.BattleItemDescWidth);
    this.addChild(this._helpWindow);
};

// 保留非战斗场景的原逻辑（Scene_MenuBase等仍使用原ItemDescWidth）
// 若需其他非战斗场景特殊处理，可在此扩展