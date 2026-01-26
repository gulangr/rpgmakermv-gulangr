/*:
 * @plugindesc 根据发动技能时的MP比例提升魔法伤害 (修正版：计算消耗前状态)
 * @author Gemini Assistant
 *
 * @param Max Bonus Rate
 * @text 最大加成比例
 * @desc 满MP时的额外伤害加成。0.2 代表增加20%（即1.2倍）。
 * @default 0.2
 * @type number
 * @decimals 2
 *
 * @help
 * ============================================================================
 * 介绍
 * ============================================================================
 * 这个插件会自动检测所有的“魔法攻击”。
 * * 伤害计算逻辑：
 * 最终伤害 = 原本伤害 * (1 + (发动前MP / 最大MP) * 最大加成比例)
 *
 * 修正说明：
 * 原版 RPG Maker 会先扣除 MP 再计算伤害。
 * 本插件会自动将本次技能消耗的 MP 加回去进行比例计算。
 * * 示例 (MaxMP=100, 技能消耗=20, 加成=0.2):
 * - 玩家当前 100 MP，释放技能。
 * - 系统扣除 20 MP，剩余 80 MP。
 * - 插件计算判定：(80 + 20) / 100 = 100% 比例。
 * - 伤害倍率：1.0 + (1.0 * 0.2) = 1.2 倍。
 */

(function() {
    var parameters = PluginManager.parameters('MagicDamageByMP');
    var maxBonusRate = Number(parameters['Max Bonus Rate'] || 0.2);

    var _Game_Action_makeDamageValue = Game_Action.prototype.makeDamageValue;

    Game_Action.prototype.makeDamageValue = function(target, critical) {
        var value = _Game_Action_makeDamageValue.call(this, target, critical);

        if (this.isMagical()) {
            var user = this.subject();
            
            // 1. 获取当前剩余 MP
            var currentMp = user.mp;
            
            // 2. 计算刚才消耗掉的 MP (考虑角色的 MP 消耗率 mcr)
            // 注意：如果是物品则没有消耗，技能才有
            var costMp = 0;
            if (DataManager.isSkill(this.item())) {
                costMp = user.skillMpCost(this.item());
            }

            // 3. 模拟还原出“发动前”的 MP 值 (且不超过上限)
            var preUseMp = Math.min(currentMp + costMp, user.mmp);

            // 4. 计算发动前的比例
            var mpRate = preUseMp / user.mmp;

            // 5. 应用加成
            var multiplier = 1.0 + (mpRate * maxBonusRate);
            value *= multiplier;
        }

        return Math.round(value);
    };

})();