//=============================================================================
// MOG_CursorBorder_ActorCommand_Patch.js
//=============================================================================
/*:
 * @plugindesc (v1.0) 补丁 - 屏蔽MOG_CursorBorder在战斗ActorCommand窗口的生效
 * @author Drill_up
 *
 * @help  
 * =============================================================================
 * +++ MOG_CursorBorder 补丁 +++
 * 作者：Drill_up
 * 如果你使用了 MOG_CursorBorder.js 插件，并且希望战斗中角色指令窗口（ActorCommand）
 * 不显示外框效果，可使用本补丁插件。
 * 
 * -----------------------------------------------------------------------------
 * 插件使用说明：
 * 1. 放置位置：必须放在 MOG_CursorBorder.js 插件的下方。
 * 2. 生效逻辑：仅屏蔽 ActorCommand 窗口的外框，其他菜单窗口的外框效果保持不变。
 * =============================================================================
 */

//=============================================================================
// ** 插件参数 & 全局变量
//=============================================================================
var Imported = Imported || {};
Imported.MOG_CursorBorder_ActorCommand_Patch = true;
var DrillUp = DrillUp || {};

//=============================================================================
// ** Window_Selectable
// 重写创建外框的逻辑，排除 ActorCommand 窗口
//=============================================================================
// 备份原创建外框方法
var _drill_cborder_actorCmd_createSprSelMenu = Window_Selectable.prototype.createSprSelMenu;
Window_Selectable.prototype.createSprSelMenu = function() {
    // 判断是否为战斗ActorCommand窗口
    if (this instanceof Window_ActorCommand) {
        this._spriteSelMenu = null; // 不创建外框精灵
        return;
    }
    // 其他窗口正常创建外框
    _drill_cborder_actorCmd_createSprSelMenu.call(this);
};

// 确保ActorCommand窗口更新时不处理外框逻辑
var _drill_cborder_actorCmd_update = SpriteSelectionMenu.prototype.update;
SpriteSelectionMenu.prototype.update = function() {
    // 如果所属窗口是ActorCommand，直接返回不更新
    if (this._window instanceof Window_ActorCommand) {
        this.visible = false;
        return;
    }
    _drill_cborder_actorCmd_update.call(this);
};

// 修复ActorCommand窗口select方法的冗余调用
var _drill_cborder_actorCmd_select = Window_Selectable.prototype.select;
Window_Selectable.prototype.select = function(index) {
    _drill_cborder_actorCmd_select.call(this, index);
    // 仅非ActorCommand窗口更新外框
    if (this._spriteSelMenu && !(this instanceof Window_ActorCommand)) {
        this._spriteSelMenu.update();
    }
};