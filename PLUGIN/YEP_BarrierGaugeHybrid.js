/*:
 * @plugindesc (V6) 智能双向护盾条 - 修复背景条消失问题
 * @author 辅助开发
 *
 * @help
 * ============================================================================
 * 介绍 (V6 修复版)
 * ============================================================================
 * 这是一个定制的护盾条显示插件，实现了【双向锚定】的视觉逻辑。
 *
 * ★ V6 修复：
 * 修复了 HP 条未满时，右侧剩余部分的黑色背景条消失的问题。
 * 现在无论 HP 多少，血条的黑色背景都会完整显示。
 *
 * ============================================================================
 * 核心逻辑
 * ============================================================================
 * 1. 【未溢出状态】 (当前HP + 护盾 <= MaxHP)
 * - 左对齐，护盾紧接 HP。
 * - 增加向右，减少向左。
 *
 * 2. 【溢出状态】 (当前HP + 护盾 > MaxHP)
 * - 右对齐，护盾覆盖 HP。
 * - 增加向左 (覆盖更多)，减少向右 (露出HP)。
 *
 * ============================================================================
 * 安装位置
 * ============================================================================
 * 必须放在 YEP_AbsorptionBarrier.js 的下方。
 * 必须放在 YEP_Olivia_BarrierPatch_V2.js 的下方。
 */

(function() {

    if (Imported.YEP_AbsorptionBarrier) {

        Window_Base.prototype.drawBarrierGauge = function(actor, wx, wy, ww) {
            
            var max = actor.mhp; 
            if (max === 0) return ww;

            // ==========================================================
            // 1. 绘制 HP 层 (底层 + 完整背景)
            // ==========================================================
            var hpRate = actor.hp / max;
            // 限制比例不超标，防止画出界
            if (hpRate > 1.0) hpRate = 1.0; 
            
            var hpColor1 = this.hpGaugeColor1();
            var hpColor2 = this.hpGaugeColor2();
            
            // ★ V6 关键修复：
            // 这里的宽度传入 ww (总宽)，确保 drawGauge 绘制出完整的黑色背景条。
            // 比例传入 hpRate，确保 HP 颜色只填充当前血量的部分。
            this.drawGauge(wx, wy, ww, hpRate, hpColor1, hpColor2);


            // ==========================================================
            // 2. 准备护盾数据
            // ==========================================================
            var barrier = actor.barrierPoints();
            if (barrier <= 0) return ww; // 无护盾，结束

            var barrierRate = barrier / max;
            if (barrierRate > 1.0) barrierRate = 1.0;
            
            // 计算护盾的物理像素宽度
            var barrierWidth = Math.floor(ww * barrierRate);
            
            var barrierColor1 = this.barrierColor1();
            var barrierColor2 = this.barrierColor2();

            // ==========================================================
            // 3. 计算坐标 (智能双向逻辑)
            // ==========================================================
            var totalPoints = actor.hp + barrier;
            var barrierX;

            if (totalPoints <= max) {
                // [模式 A：未溢出] -> 左对齐 (接在HP后面)
                // 我们需要算出当前 HP 实际占了多少像素，作为护盾的起点
                var currentHpWidth = Math.floor(ww * hpRate);
                barrierX = wx + currentHpWidth;
            } else {
                // [模式 B：溢出] -> 右对齐 (覆盖HP)
                barrierX = wx + ww - barrierWidth;
            }

            // ==========================================================
            // 4. 绘制护盾层 (无背景)
            // ==========================================================
            // 技巧：我们只希望画护盾的【颜色条】，不希望再画一次黑色的【背景框】。
            // 因为底层已经画过完整的背景了，再画一次会导致叠加变黑或覆盖HP。
            
            // 备份原本的背景色函数
            var originalBackColor = this.gaugeBackColor;
            // 临时修改为完全透明
            this.gaugeBackColor = function() { return 'rgba(0,0,0,0)'; };

            try {
                // 绘制护盾
                // 这里的 rate 传 1.0，因为 barrierWidth 已经是我们计算好的最终宽度
                this.drawGauge(barrierX, wy, barrierWidth, 1.0, barrierColor1, barrierColor2);
            } finally {
                // 恢复原本的背景色函数，以免影响其他窗口 (如MP/TP)
                this.gaugeBackColor = originalBackColor;
            }
            
            return ww;
        };

    }

})();