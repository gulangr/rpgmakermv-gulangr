/*:
 * @plugindesc [简单命中修正] 让超过100%的命中率可以抵消敌人的闪避率。
 * @author Gemini Assistant
 * @help
 * 原版逻辑：
 * 命中判定(160%) -> 成功 -> 闪避判定(20%) -> 敌人有20%概率闪避。
 * (溢出的60%命中率被浪费了)
 *
 * 修正后逻辑：
 * 溢出的60%命中率会自动减去敌人的闪避率。
 * 敌人最终闪避率 = 20% - 60% = -40% (即0%闪避，攻击必中)。
 */

(function() {
    // 备份原有的闪避计算函数
    var _Game_Action_itemEva = Game_Action.prototype.itemEva;

    // 重写闪避计算
    Game_Action.prototype.itemEva = function(target) {
        // 获取敌人原本的闪避率 (比如 0.2)
        var realEva = _Game_Action_itemEva.call(this, target);
        
        // 获取我方原本的命中率 (比如 1.6)
        var realHit = this.itemHit(target);

        // 如果命中率超过 1.0 (100%)
        if (realHit > 1.0) {
            // 计算溢出值 (1.6 - 1.0 = 0.6)
            var overflow = realHit - 1.0;
            // 用溢出值抵消敌人的闪避率
            realEva -= overflow;
        }

        // 确保闪避率不小于 0 (防止出现负数导致未知错误)
        return Math.max(0, realEva);
    };
})();