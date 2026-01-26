
//=============================================================================

// BattleItemNoItemDisplay.js

//=============================================================================


/*:

 * @plugindesc 在战斗物品菜单中显示"暂无物品"提示 - 兼容Olivia_SideBattleUI

 * @author Zulu

 * @help 

 * 当战斗中打开物品菜单且没有任何物品时，显示"暂无物品"提示。

 * 此插件专门设计为与Olivia_SideBattleUI插件兼容。

 * 

 * 使用方法：

 * 1. 将此插件放在Olivia_SideBattleUI插件下方

 * 2. 无需额外配置

 */


(function() {

    'use strict';

    

    // 检查是否加载了Olivia_SideBattleUI插件

    var hasOliviaPlugin = Imported && Imported.Olivia_SideBattleUI;

    

    console.log('BattleItemNoItemDisplay插件加载 - Olivia插件状态:', hasOliviaPlugin);

    

    // 保存原有的 maxItems 方法

    var _Window_BattleItem_maxItems = Window_BattleItem.prototype.maxItems;

    

    // 修改 maxItems 方法确保至少有1个条目显示"暂无物品"

    Window_BattleItem.prototype.maxItems = function() {

        var count = _Window_BattleItem_maxItems.call(this);

        return count > 0 ? count : 1;

    };


    // 保存原有的 drawItem 方法

    var _Window_BattleItem_drawItem = Window_BattleItem.prototype.drawItem;

    

    // 修改 drawItem 方法以显示"暂无物品"

    Window_BattleItem.prototype.drawItem = function(index) {

        // 添加安全检查

        var items = this._data || [];

        

        if (items.length === 0 && index === 0) {

            // 如果没有物品，在第一个位置显示"暂无物品"

            this.resetTextColor();

            this.changePaintOpacity(true);

            

            // 使用更准确的rect获取方式

            var rect = this.itemRect(index);

            

            // 使用标准窗口文本颜色，与其他窗口元素保持一致

            // 使用正常文本颜色，字体大小和样式也与窗口标准一致

            this.changeTextColor(this.normalColor()); // 标准正常颜色

            this.drawText("暂无物品", rect.x, rect.y, rect.width, "center");

            this.resetTextColor();

        } else if (items.length > 0 && index < items.length) {

            // 正常绘制物品

            _Window_BattleItem_drawItem.call(this, index);

        }

    };


    // 修改 isCurrentItemEnabled 方法，确保在无物品时不能选择

    Window_BattleItem.prototype.isCurrentItemEnabled = function() {

        return this._data && this._data.length > 0;

    };


    // 修改 isEnabled 方法

    Window_BattleItem.prototype.isEnabled = function(item) {

        if (!this._data || this._data.length === 0) return false;

        return Window_ItemList.prototype.isEnabled.call(this, item);

    };


    // 保存原有的 select 方法

    var _Window_BattleItem_select = Window_BattleItem.prototype.select;

    

    // 修改 select 方法以正确处理无物品的情况

    Window_BattleItem.prototype.select = function(index) {

        // 添加安全检查，防止数据未初始化

        if (!this._data || this._data.length === 0) {

            this._index = -1;

            this._cursorFixed = false;

            this._cursorAll = false;

            return;

        }

        _Window_BattleItem_select.call(this, index);

    };


    // 保存原有的 processOk 方法

    var _Window_BattleItem_processOk = Window_BattleItem.prototype.processOk;

    

    // 修改 processOk 方法以阻止在无物品时确认选择

    Window_BattleItem.prototype.processOk = function() {

        // 添加安全检查

        if (!this._data || this._data.length === 0) {

            SoundManager.playBuzzer();

            this.activate();

            return;

        }

        _Window_BattleItem_processOk.call(this);

    };


    // 保存原有的 update 方法

    var _Window_BattleItem_update = Window_BattleItem.prototype.update;

    

    // 修改 update 方法，确保无物品时处理正确

    Window_BattleItem.prototype.update = function() {

        _Window_BattleItem_update.call(this);

        

        // 确保无物品时不会显示选择光标，添加安全检查

        if (this._data && this._data.length === 0 && this.index() >= 0) {

            this.select(-1);

        }

    };


    // 兼容 Olivia_SideBattleUI 插件

    if (Olivia && Olivia.OctoBattle && Olivia.OctoBattle.BattleUI) {

        console.log('检测到Olivia_SideBattleUI插件，应用兼容性处理');

        

        // 兼容Olivia的show方法

        var _Olivia_show = Olivia.OctoBattle.BattleUI.___Window_BattleItem_show___;

        if (_Olivia_show) {

            Window_BattleItem.prototype.show = function() {

                _Olivia_show.call(this);

                // 确保在显示窗口时检查物品数量，添加安全检查

                if (this._data && this._data.length === 0) {

                    this.select(-1);

                }

            };

        }

        

        // 兼容drawItemName方法

        var _Olivia_drawItemName = Window_BattleItem.prototype.drawItemName;

        if (_Olivia_drawItemName) {

            Window_BattleItem.prototype.drawItemName = function(item, x, y, width) {

                // 添加安全检查

                if (!this._data || this._data.length === 0) {

                    // 不绘制任何内容，由drawItem方法处理

                    return;

                }

                _Olivia_drawItemName.call(this, item, x, y, width);

            };

        }

    }


    // 安全地覆盖onBattleStart方法

    var _Scene_Battle_onBattleStart = Scene_Battle.prototype.onBattleStart;

    Scene_Battle.prototype.onBattleStart = function() {

        if (_Scene_Battle_onBattleStart) {

            _Scene_Battle_onBattleStart.call(this);

        }

        console.log('战斗开始，BattleItemNoItemDisplay插件已激活');

    };


    // 插件加载完成验证

    if (typeof Window_BattleItem !== 'undefined') {

        console.log("BattleItemNoItemDisplay插件成功加载并已应用修改");

    } else {

        console.error("BattleItemNoItemDisplay插件加载失败：Window_BattleItem未定义");

    }

})();
