/*:
 * @plugindesc YEP_StatusMenuCore 属性条修正补丁 (基于固定章节上限) v1.1
 * @author Gemini
 *
 * @help
 * ============================================================================
 * 逻辑修正说明
 * ============================================================================
 * 为了解决雷达图和属性条因为角色名字图标加成不同而导致的“长短不一”问题，
 * 本插件将绘制基准（分母）锁定为基于章节的固定公式，不再包含图标加成。
 *
 * 设定公式：
 * 基础上限：由 Gemini_LimitBonusPatch 定义 (HP 400/章, MP 160/章, 属性 40/章)
 * 额外补正：
 * - 攻防魔敏幸 (X): 1-5章分别为 [5, 10, 20, 40, 80]
 * - 最大HP (Y): 1-5章分别为 [50, 100, 200, 400, 800]
 * - 最大MP (Z): 1-5章分别为 [20, 40, 80, 160, 320]
 * * 最终绘图上限 = 基础上限(章节) + 额外补正(章节)
 */

(function() {

    // 定义通用的视觉上限计算函数 (会被雷达图插件共用)
    Game_Actor.prototype.getVisualChapterLimit = function(paramId) {
        // 1. 获取当前章节
        var chapter = 1;
        if (Imported.ChapterControl && $gameSystem) {
            chapter = Math.floor($gameSystem.chapter());
        } else if ($gameSystem && $gameSystem.chapter) {
            chapter = Math.floor($gameSystem.chapter());
        }
        // 限制范围 1-5
        if (chapter < 1) chapter = 1;
        if (chapter > 5) chapter = 5;
        
        var idx = chapter - 1; // 数组索引

        // 2. 基础上限 (来源于 LimitBonusPatch 的设定)
        var baseLimit = 0;
        var extraBonus = 0;

        // 3. 计算公式
        if (paramId === 0) { // HP
            baseLimit = chapter * 400;
            var arrY = [50, 100, 200, 400, 800];
            extraBonus = arrY[idx];
        } else if (paramId === 1) { // MP (此处修正为MP使用Z值)
            baseLimit = chapter * 160;
            var arrZ = [20, 40, 80, 160, 320];
            extraBonus = arrZ[idx];
        } else { // 普通属性 (2-7)
            baseLimit = chapter * 40;
            var arrX = [5, 10, 20, 40, 80];
            extraBonus = arrX[idx];
        }

        return baseLimit + extraBonus;
    };

    // 确保 YEP_StatusMenuCore 已经加载
    if (Imported.YEP_StatusMenuCore) {

        // 重写计算比率的函数
        Window_StatusInfo.prototype.calcParamRate = function(paramId) {
            if (!this._actor) return 0;

            // 分子：当前属性值
            var current = this._actor.param(paramId);
            
            // 分母：使用新的视觉固定上限 (不再使用 paramMax)
            var max = this._actor.getVisualChapterLimit(paramId);
            
            if (max === 0) return 0;
            
            // 计算比率
            var rate = current / max;
            
            return Math.min(rate, 1.0);
        };

        console.log("Gemini_StatusMenu_GaugePatch (Visual Fix) applied.");
    }

})();