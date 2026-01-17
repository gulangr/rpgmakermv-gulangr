/*:
 * @plugindesc YEP_StatusMenuCore 属性条修正补丁 (基于章节真实上限)
 * @author Gemini
 *
 * @help
 * ============================================================================
 * 介绍
 * ============================================================================
 * 本插件专用于修改 YEP_StatusMenuCore 的属性条绘制逻辑。
 *
 * 原版逻辑：
 * 寻找角色当前最高的属性值作为基准 (100%)，其他属性按比例缩放。
 *
 * 修改后逻辑：
 * 直接使用角色属性的“最大上限” (paramMax) 作为基准。
 * 这个“最大上限”会自动读取您之前安装的章节限制插件计算出的数值
 * (即：章节基础值 + 名字图标加成)。
 *
 * ============================================================================
 * 使用方法
 * ============================================================================
 * 1. 确保已安装 YEP_StatusMenuCore。
 * 2. 确保已安装 Gemini_ChapterLimit_Fixed (或类似版本)。
 * 3. 将本插件放在上述两个插件的【下方】。
 *
 */

(function() {

    // 确保 YEP_StatusMenuCore 已经加载
    if (Imported.YEP_StatusMenuCore) {

        // 重写计算比率的函数
        Window_StatusInfo.prototype.calcParamRate = function(paramId) {
            // 获取当前属性值 (例如 攻击力 150)
            var current = this._actor.param(paramId);
            
            // 获取该属性的最终上限 (例如 攻击力上限 200)
            // 这里会自动调用 Game_BattlerBase.prototype.paramMax
            // 该函数已经被 Gemini_ChapterLimit 系列插件接管
            var max = this._actor.paramMax(paramId);
            
            // 防止除以0的错误
            if (max === 0) return 0;
            
            // 计算比率 (150 / 200 = 0.75)
            var rate = current / max;
            
            // 限制最大长度不超过 100% (防止属性溢出导致画出框外)
            return Math.min(rate, 1.0);
        };

        console.log("Gemini_StatusMenu_GaugePatch applied successfully.");
    } else {
        console.warn("Gemini_StatusMenu_GaugePatch: YEP_StatusMenuCore not found.");
    }

})();