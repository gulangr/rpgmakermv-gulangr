/*:
 * @plugindesc 自定义变量数值上限限制插件
 * @author Gemini & User
 *
 * @param LimitList
 * @text 变量上限列表
 * @desc 在这里配置各个变量的上限值。
 * @type struct<LimitSetting>[]
 * @default []
 *
 * @help
 * ============================================================================
 * 介绍
 * ============================================================================
 * 本插件允许你通过参数设置指定变量的最大值。
 * 当游戏逻辑（事件指令或脚本）尝试将变量增加到超过该值时，
 * 变量的值会被强制锁定在设定的上限。
 *
 * ============================================================================
 * 使用方法
 * ============================================================================
 * 1. 打开插件管理器，找到 VariableLimit。
 * 2. 点击 "变量上限列表" 参数。
 * 3. 在列表中添加行，分别设置 "变量 ID" 和 "最大值"。
 *
 * 例如：设置 变量[0001] 的上限为 100。
 * 当你在游戏中执行 "变量[0001] + 10" (假设当前是95) -> 结果变为 100。
 *
 */

/*~struct~LimitSetting:
 *
 * @param VariableId
 * @text 变量 ID
 * @desc 选择需要限制上限的变量。
 * @type variable
 *
 * @param MaxValue
 * @text 最大值 (上限)
 * @desc 该变量允许达到的最大数值。
 * @type number
 * @min -99999999
 * @default 100
 *
 */

(function() {
    'use strict';

    var pluginName = 'VariableLimit';
    var parameters = PluginManager.parameters(pluginName);
    var rawLimitList = parameters['LimitList'] || '[]';
    
    // 解析参数并转换为这就好用的映射对象 { 变量ID: 上限值 }
    var _limitMap = {};

    try {
        var parsedList = JSON.parse(rawLimitList);
        for (var i = 0; i < parsedList.length; i++) {
            var data = JSON.parse(parsedList[i]);
            var id = Number(data.VariableId);
            var max = Number(data.MaxValue);
            if (!isNaN(id) && !isNaN(max)) {
                _limitMap[id] = max;
            }
        }
    } catch (e) {
        console.error("VariableLimit 插件参数解析错误:", e);
    }

    // ------------------------------------------------------------------------
    // 核心逻辑：拦截变量设置
    // ------------------------------------------------------------------------

    // 保存原有的 setValue 方法
    var _Game_Variables_setValue = Game_Variables.prototype.setValue;

    Game_Variables.prototype.setValue = function(variableId, value) {
        // 检查该变量ID是否在我们的限制列表中
        if (_limitMap.hasOwnProperty(variableId)) {
            var maxLimit = _limitMap[variableId];
            
            // 如果传入的值是数字，且超过了上限
            if (typeof value === 'number' && value > maxLimit) {
                value = maxLimit;
            }
        }

        // 调用原有的方法执行赋值
        _Game_Variables_setValue.call(this, variableId, value);
    };

})();