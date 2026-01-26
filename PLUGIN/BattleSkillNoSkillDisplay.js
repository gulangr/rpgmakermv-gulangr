//=============================================================================
// BattleSkillNoSkillDisplay.js
//=============================================================================

/*:
 * @plugindesc 在战斗技能菜单中显示"暂无魔法"提示 - 兼容Olivia_SideBattleUI
 * @author Your Name
 * @help 
 * 当战斗中打开技能菜单且没有任何技能时，显示"暂无魔法"提示。
 * 此插件专门设计为与Olivia_SideBattleUI插件兼容。
 * 
 * 使用方法：
 * 1. 将此插件放在Olivia_SideBattleUI插件和BattleItemNoItemDisplay.js下方
 * 2. 无需额外配置
 */

(function() {
    'use strict';

    // 检查是否加载了Olivia_SideBattleUI插件
    var hasOliviaPlugin = Imported && Imported.Olivia_SideBattleUI;
    console.log('BattleSkillNoSkillDisplay插件加载 - Olivia插件状态:', hasOliviaPlugin);

    // 保存原有的 maxItems 方法
    var _Window_BattleSkill_maxItems = Window_BattleSkill.prototype.maxItems;
    
    // 修改 maxItems 方法确保至少有1个条目显示"暂无魔法"
    Window_BattleSkill.prototype.maxItems = function() {
        var count = _Window_BattleSkill_maxItems.call(this);
        return count > 0 ? count : 1;
    };

    // 保存原有的 drawItem 方法
    var _Window_BattleSkill_drawItem = Window_BattleSkill.prototype.drawItem;
    
    // 修改 drawItem 方法以显示"暂无魔法"
    Window_BattleSkill.prototype.drawItem = function(index) {
        // 添加安全检查
        var items = this._data || [];
        
        if (items.length === 0 && index === 0) {
            // 如果没有技能，在第一个位置显示"暂无魔法"
            this.resetTextColor();
            this.changePaintOpacity(true);
            
            // 使用更准确的rect获取方式
            var rect = this.itemRect(index);
            
            // 清空绘制区域，防止残留选择框
            this.contents.clearRect(rect.x, rect.y, rect.width, rect.height);
            
            // 使用标准窗口文本颜色，与其他窗口元素保持一致
            this.changeTextColor(this.normalColor());
            this.drawText("暂无魔法", rect.x, rect.y, rect.width, "center");
            this.resetTextColor();
        } else if (items.length > 0 && index < items.length) {
            // 正常绘制技能
            _Window_BattleSkill_drawItem.call(this, index);
        }
    };

    // 修正后的 isCurrentItemEnabled 方法
    Window_BattleSkill.prototype.isCurrentItemEnabled = function() {
        // 1. 如果列表为空（显示"暂无魔法"），直接禁用，不可点击
        if (!this._data || this._data.length === 0) {
            return false;
        }
        
        // 2. 如果列表有技能，调用父类 Window_SkillList 的原生逻辑
        // 原生逻辑会自动检查 MP/TP 是否足够，以及技能是否因其他原因被封印
        return Window_SkillList.prototype.isCurrentItemEnabled.call(this);
    };
    // 修改 isEnabled 方法
    Window_BattleSkill.prototype.isEnabled = function(item) {
        if (!this._data || this._data.length === 0) return false;
        return Window_SkillList.prototype.isEnabled.call(this, item);
    };

    // 保存原有的 select 方法
    var _Window_BattleSkill_select = Window_BattleSkill.prototype.select;
    
    // 修改 select 方法以正确处理无技能的情况
    Window_BattleSkill.prototype.select = function(index) {
        // 添加安全检查，防止数据未初始化
        if (!this._data || this._data.length === 0) {
            this._index = -1;
            this._cursorFixed = false;
            this._cursorAll = false;
            // 强制隐藏光标
            this.setCursorRect(0, 0, 0, 0);
            return;
        }
        _Window_BattleSkill_select.call(this, index);
    };

    // 保存原有的 processOk 方法
    var _Window_BattleSkill_processOk = Window_BattleSkill.prototype.processOk;
    
    // 修改 processOk 方法以阻止在无技能时确认选择
    Window_BattleSkill.prototype.processOk = function() {
        // 添加安全检查
        if (!this._data || this._data.length === 0) {
            SoundManager.playBuzzer();
            this.activate();
            return;
        }
        _Window_BattleSkill_processOk.call(this);
    };

    // 保存原有的 update 方法
    var _Window_BattleSkill_update = Window_BattleSkill.prototype.update;
    
    // 修改 update 方法，确保无技能时处理正确
    Window_BattleSkill.prototype.update = function() {
        _Window_BattleSkill_update.call(this);
        
        // 确保无技能时不会显示选择光标，添加安全检查
        if (this._data && this._data.length === 0) {
            if (this.index() >= 0) {
                this.select(-1);
            }
            // 强制隐藏光标矩形
            this.setCursorRect(0, 0, 0, 0);
        }
    };

    // 新增：重置窗口状态的方法
    Window_BattleSkill.prototype.resetSkillWindowState = function() {
        this._index = -1;
        this.setCursorRect(0, 0, 0, 0);
        this._cursorFixed = false;
        this._cursorAll = false;
        if (this.contents) {
            this.contents.clear();
        }
    };

    // 保存原有的 setActor 方法（切换角色时会调用）
    var _Window_BattleSkill_setActor = Window_BattleSkill.prototype.setActor;
    Window_BattleSkill.prototype.setActor = function(actor) {
        // 切换角色时先重置窗口状态
        this.resetSkillWindowState();
        _Window_BattleSkill_setActor.call(this, actor);
        // 重新绘制窗口内容
        this.refresh();
        // 确保光标状态正确
        if (!this._data || this._data.length === 0) {
            this.select(-1);
            this.setCursorRect(0, 0, 0, 0);
        }
    };

    // 保存原有的 refresh 方法
    var _Window_BattleSkill_refresh = Window_BattleSkill.prototype.refresh;
    Window_BattleSkill.prototype.refresh = function() {
        _Window_BattleSkill_refresh.call(this);
        // 刷新后检查是否无技能，确保光标隐藏
        if (!this._data || this._data.length === 0) {
            this.setCursorRect(0, 0, 0, 0);
        }
    };

    // 兼容 Olivia_SideBattleUI 插件
    if (Olivia && Olivia.OctoBattle && Olivia.OctoBattle.BattleUI) {
        console.log('检测到Olivia_SideBattleUI插件，应用技能窗口兼容性处理');
        
        // 兼容Olivia的show方法
        var _Olivia_skill_show = Olivia.OctoBattle.BattleUI.___Window_BattleSkill_show___;
        if (_Olivia_skill_show) {
            Window_BattleSkill.prototype.show = function() {
                _Olivia_skill_show.call(this);
                // 确保在显示窗口时检查技能数量，添加安全检查
                if (this._data && this._data.length === 0) {
                    this.select(-1);
                    this.setCursorRect(0, 0, 0, 0);
                }
            };
        }
        
        // 兼容drawItemName方法
        var _Olivia_skill_drawItemName = Window_BattleSkill.prototype.drawItemName;
        if (_Olivia_skill_drawItemName) {
            Window_BattleSkill.prototype.drawItemName = function(item, x, y, width) {
                // 添加安全检查
                if (!this._data || this._data.length === 0) {
                    // 不绘制任何内容，由drawItem方法处理
                    return;
                }
                _Olivia_skill_drawItemName.call(this, item, x, y, width);
            };
        }
    }

    // 插件加载完成验证
    if (typeof Window_BattleSkill !== 'undefined') {
        console.log("BattleSkillNoSkillDisplay插件成功加载并已应用修改");
    } else {
        console.error("BattleSkillNoSkillDisplay插件加载失败：Window_BattleSkill未定义");
    }

})();