/*:
 * @plugindesc (补丁) Olivia 战斗UI优化：隐藏技能消耗 + 缩小物品数量字体。
 * @author Gemini Patch
 *
 * @help
 * 这个补丁专用于 Olivia_SideBattleUI.js。
 * * * 功能：
 * 1. 技能窗口：不显示 MP/TP/HP 消耗（节省宽度）。
 * 2. 物品窗口：将物品数量（如 ×99）的字体缩小，防止字体过大遮挡或不协调。
 *
 * 使用方法：
 * 请将此插件放在 Olivia_SideBattleUI.js 和 YEP_ItemCore.js(如果有) 的下方。
 */

(function() {

    // ======================================================================
    // 1. 针对战斗技能窗口：隐藏技能消耗 (MP/TP/HP)
    // ======================================================================
    if (typeof Window_BattleSkill !== 'undefined') {
        // 重写 drawSkillCost，直接返回 0，不绘制任何内容
        Window_BattleSkill.prototype.drawSkillCost = function(skill, x, y, width) {
            return 0; 
        };
    }

    // ======================================================================
    // 2. 针对战斗物品窗口：缩小数量显示的字体
    // ======================================================================
    if (typeof Window_BattleItem !== 'undefined') {
        Window_BattleItem.prototype.drawItemNumber = function(item, x, y, width) {
            if (!this.needsNumber()) return;
            
            // 备份原有字号
            var originalFontSize = this.contents.fontSize;
            
            // --- 核心修改：设置更小的字体 ---
            // this.standardFontSize() 已经是 Olivia 缩放后的大小
            // 这里我们再乘以 0.8 (即缩小 20%)，你可以根据需要修改这个数字
            var scale = 0.8; 
            this.contents.fontSize = Math.floor(this.standardFontSize() * scale);
            
            // 准备显示的文本
            var numItem = $gameParty.numItems(item);
            var string = "\u00d7" + numItem; // 默认显示为 "×数量"
            
            // 兼容 YEP_ItemCore 的格式设置 (如果安装了)
            if (Imported && Imported.YEP_ItemCore && Yanfly.Param && Yanfly.Param.ItemQuantityFmt) {
                // 使用 Yanfly 设置的格式 (例如 "x%1")
                string = Yanfly.Param.ItemQuantityFmt.format(Yanfly.Util.toGroup(numItem));
            } else {
                // 如果没有安装 YEP，使用系统默认逻辑 (通常是 : 数量，但也可能被其他插件改了，这里统一用 x)
                // 也可以用系统默认的绘制方法，但为了控制字体，我们手动绘制
                string = "\u00d7" + numItem; 
            }
            
            // 绘制文本 (靠右对齐)
            this.drawText(string, x, y, width, 'right');
            
            // 还原字号，以免影响后续绘制
            this.contents.fontSize = originalFontSize;
        };
    }

})();