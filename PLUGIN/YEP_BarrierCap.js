/*:
 * @plugindesc (扩展) 限制 YEP_AbsorptionBarrier 的护盾最大值
 * @author 辅助开发
 *
 * @param Cap Rate
 * @text 护盾上限倍率
 * @desc 护盾上限 = 最大生命值(MaxHP) x 倍率。
 * 1.0 代表 100% MaxHP，0.5 代表 50%。
 * @default 1.0
 *
 * @help
 * ============================================================================
 * 介绍
 * ============================================================================
 * YEP_AbsorptionBarrier 默认没有护盾上限。
 * 本插件强制增加一个上限，防止护盾无限堆叠。
 *
 * 逻辑：
 * 每次获得护盾后，如果总护盾值 > 上限，
 * 插件会自动扣除多余的部分（优先扣除永久护盾，再扣除限时护盾）。
 */

(function() {

    var parameters = PluginManager.parameters('YEP_BarrierCap');
    var capRate = Number(parameters['Cap Rate'] || 1.0);

    var _Game_Battler_gainBarrier = Game_Battler.prototype.gainBarrier;
    Game_Battler.prototype.gainBarrier = function(value, turn) {
        // 1. 先执行原本的获得护盾逻辑
        _Game_Battler_gainBarrier.call(this, value, turn);

        // 2. 计算上限
        var cap = Math.floor(this.mhp * capRate);
        var current = this.barrierPoints();

        // 3. 如果超过上限，手动削减
        if (current > cap) {
            var remove = current - cap;

            // 步骤 A: 优先削减永久护盾 (_permBarrier)
            // (注意：这里直接操作内部变量以避免触发受击动画)
            if (this._permBarrier && this._permBarrier > 0) {
                if (this._permBarrier >= remove) {
                    this._permBarrier -= remove;
                    remove = 0;
                } else {
                    remove -= this._permBarrier;
                    this._permBarrier = 0;
                }
            }

            // 步骤 B: 如果还需要削减，则削减限时护盾 (_turnBarrier)
            // 从回合数最长的开始削减
            if (remove > 0 && this._turnBarrier && this._turnBarrier.length > 0) {
                for (var i = this._turnBarrier.length - 1; i >= 0; i--) {
                    var val = this._turnBarrier[i] || 0;
                    if (val > 0) {
                        if (val >= remove) {
                            this._turnBarrier[i] -= remove;
                            remove = 0;
                            break;
                        } else {
                            remove -= val;
                            this._turnBarrier[i] = 0;
                        }
                    }
                }
            }
            
            // 刷新界面显示
            this.refresh();
        }
    };

})();