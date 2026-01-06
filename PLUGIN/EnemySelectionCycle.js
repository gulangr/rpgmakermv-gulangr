/*:
 * @plugindesc 战斗敌人选择光标循环移动插件
 * @author 辅助开发
 *
 * @help
 * ============================================================================
 * 介绍
 * ============================================================================
 * 在 RPG Maker MV/MZ 的默认战斗中，选择敌人时，光标移动到两端会停止。
 *
 * 本插件修改了这一逻辑：
 * 1. 允许光标循环移动（从最右移到最左，从最左移到最右）。
 * 2. 即使敌人列表是垂直排列的，也允许使用【左右方向键】来切换敌人
 * （方便玩家直观地对应屏幕上的敌人位置）。
 *
 * 无需参数，即插即用。
 */

(function() {

    // ======================================================================
    // 重写 Window_BattleEnemy 的左右移动逻辑
    // ======================================================================

    // 向右移动：(当前索引 + 1) % 总数
    // 效果：到达末尾时，取模运算会让其回到 0
    Window_BattleEnemy.prototype.cursorRight = function(wrap) {
        var maxItems = this.maxItems();
        if (maxItems === 0) return;

        var index = this.index();
        // 循环逻辑
        var nextIndex = (index + 1) % maxItems;
        
        this.select(nextIndex);
    };

    // 向左移动：(当前索引 - 1 + 总数) % 总数
    // 效果：在 0 的位置减 1 变成 -1，加上总数变成末尾，再取模确保安全
    Window_BattleEnemy.prototype.cursorLeft = function(wrap) {
        var maxItems = this.maxItems();
        if (maxItems === 0) return;

        var index = this.index();
        // 循环逻辑
        var nextIndex = (index - 1 + maxItems) % maxItems;
        
        this.select(nextIndex);
    };

})();