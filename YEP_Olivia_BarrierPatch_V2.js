/*:
 * @plugindesc 修复 Olivia_SideBattleUI 与 YEP_AbsorptionBarrier 的护盾显示兼容性 (V2 增强版)
 * @author 辅助开发
 *
 * @help
 * ============================================================================
 * 介绍
 * ============================================================================
 * 这是一个兼容性补丁 (V2)。
 *
 * 修复问题：
 * 1. 战斗中护盾条不显示的问题。
 * 2. 获得护盾时，UI 不刷新的问题 (这是 V1 版本未解决的核心原因)。
 *
 * 使用要求：
 * 1. YEP_AbsorptionBarrier.js
 * 2. Olivia_SideBattleUI.js
 *
 * 安装位置：
 * 请确保本插件位于上述两个插件的【下方】。
 *
 */

(function() {

    // 仅当两个插件都存在时才执行修复
    if (Imported.YEP_AbsorptionBarrier && Imported.Olivia_SideBattleUI) {

        // ======================================================================
        // 1. 修复刷新检测逻辑
        // 让 Olivia UI 能够感知到“护盾值”的变化
        // ======================================================================
        
        var _Window_BattleSideHP_initialize = Window_BattleSideHP.prototype.initialize;
        Window_BattleSideHP.prototype.initialize = function(x, y, width, height, index) {
            _Window_BattleSideHP_initialize.call(this, x, y, width, height, index);
            this._barrier = 0; // 初始化护盾记录变量
        };

        var _Window_BattleSideHP_refresh = Window_BattleSideHP.prototype.refresh;
        Window_BattleSideHP.prototype.refresh = function() {
            _Window_BattleSideHP_refresh.call(this);
            if (!!this._actor) {
                // 在刷新时，记录当前的护盾值
                this._barrier = this._actor.barrierPoints();
            }
        };

        var _Window_BattleSideHP_checkRefreshConditions = Window_BattleSideHP.prototype.checkRefreshConditions;
        Window_BattleSideHP.prototype.checkRefreshConditions = function() {
            if (!!this._actor) {
                // 核心修复：除了检查 HP 变化，还要检查 护盾值 是否变化
                if (this._barrier !== this._actor.barrierPoints()) {
                    return true;
                }
            }
            return _Window_BattleSideHP_checkRefreshConditions.call(this);
        };

        // ======================================================================
        // 2. 修复绘制逻辑
        // 确保调用 Yanfly 的护盾绘制方法
        // ======================================================================

        Window_BattleSideHP.prototype.drawActorHp = function(actor, x, y, width) {
            width = width || 186;
            
            // 检查是否有护盾
            if (actor.barrierPoints() > 0) {
                // 强制调用 Yanfly 的护盾绘制逻辑
                // Yanfly 的 drawBarrierGauge 会自动绘制 护盾背景 和 HP前景
                this.drawBarrierGauge(actor, x, y, width);
            } else {
                // 正常的 HP 绘制
                var color1 = this.hpGaugeColor1();
                var color2 = this.hpGaugeColor2();
                this.drawGauge(x, y, width, actor.hpRate(), color1, color2);
            }

            // 绘制 HP 文字和数值 (保持 Olivia 的风格)
            this.changeTextColor(this.systemColor());
            this.drawText(TextManager.hpA, x, y, 44);
            
            var c1 = this.hpColor(actor);
            var c2 = this.normalColor();
            this.drawCurrentAndMax(actor.hp, actor.mhp, x, y, width, c1, c2);
        };
    }

})();