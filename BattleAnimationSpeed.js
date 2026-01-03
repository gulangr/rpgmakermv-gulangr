/*:
 * @plugindesc [测试工具] 战斗动画速度控制器 - 支持实时变速
 * @author Custom Plugin
 *
 * @param Default Rate
 * @text 默认帧率 (速率)
 * @desc 动画的播放速率。数值越大越慢，数值越小越快。
 * MV默认为 4。 (1=极快, 4=正常, 8=0.5倍慢放, 16=0.25倍慢放)
 * @type number
 * @min 1
 * @default 4
 *
 * @param Speed Variable ID
 * @text [可选] 控制速度的变量ID
 * @desc 指定一个变量ID。如果该变量的值大于0，将优先使用该变量的值作为速率。
 * 用于在游戏中通过控制台或事件实时调整速度。
 * @type variable
 * @default 0
 *
 * @help
 * ============================================================================
 * 介绍
 * ============================================================================
 * 这个插件允许您自定义战斗中动画的播放速度。
 * 主要用于开发阶段测试、观察动画细节、或者是制作慢动作特效。
 *
 * ============================================================================
 * 原理解析 (重要)
 * ============================================================================
 * RPG Maker MV 的动画播放是基于“帧率 (Rate)”计算的。
 * 这个数值代表：每播放 1 帧动画图块，需要经过多少帧游戏时间。
 *
 * - 默认值 4 : 代表游戏每运行 4 帧，动画才走 1 格 (标准速度)。
 *
 * --- 设置参考 ---
 *
 * 【加速类】
 * 1 : 4倍速 (极快，每帧都变)
 * 2 : 2倍速
 *
 * 【正常】
 * 4 : 正常速度 (默认)
 *
 * 【慢放类 - 适合调试】
 * 8  : 0.5倍速 (慢动作)
 * 12 : 0.33倍速
 * 16 : 0.25倍速 (超级慢动作)
 * 24 : 极慢
 *
 * ============================================================================
 * 兼容性
 * ============================================================================
 * 请将本插件放在 Yanfly_BattleEngineCore (YEP战斗核心) 的 **下方**。
 * 这样可以确保本插件的速度设置能够覆盖 Yanfly 的默认设置。
 */

(function() {

    var parameters = PluginManager.parameters('BattleAnimationSpeed');
    var defaultRate = Number(parameters['Default Rate'] || 4);
    var variableId = Number(parameters['Speed Variable ID'] || 0);

    // 拦截动画速率设置
    var _Sprite_Animation_setupRate = Sprite_Animation.prototype.setupRate;
    Sprite_Animation.prototype.setupRate = function() {
        // 先运行原有的逻辑 (兼容其他插件)
        _Sprite_Animation_setupRate.call(this);

        // 获取当前应该使用的速率
        var finalRate = defaultRate;

        // 如果绑定了变量，且变量值有效(>0)，则使用变量的值
        if (variableId > 0) {
            var gameVarValue = $gameVariables.value(variableId);
            if (gameVarValue > 0) {
                finalRate = gameVarValue;
            }
        }

        // 强制覆盖速率
        this._rate = finalRate;
    };

})();