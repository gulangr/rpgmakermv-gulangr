/*:
 * @plugindesc (v1.0) 修复TagSystem赋予的状态无法读取备注(Note)的问题
 * @author Gemini
 * @target MV
 *
 * @help
 * ============================================================================
 * 问题描述
 * ============================================================================
 * 原版 TagSystem.js 仅将状态添加到了 `traitObjects` (用于计算属性加成)，
 * 但没有添加到 `states` 列表或 `isStateAffected` 判定中。
 * * 这导致许多依赖 `actor.states()` 或 `actor.isStateAffected()` 来读取
 * 状态备注 (<Note>) 或检测状态存在的插件 (如 YEP_BuffsStatesCore,
 * YEP_AutoPassiveStates 等) 无法识别这些由标签赋予的状态。
 *
 * ============================================================================
 * 修复内容
 * ============================================================================
 * 1. 修正 `states()` 方法：现在会包含标签赋予的动态状态。
 * 2. 修正 `isStateAffected()` 方法：现在能正确检测到标签状态。
 * 3. 修正 `traitObjects()` 方法：自动去重，防止因上述修改导致的属性双重叠加。
 *
 * ============================================================================
 * 使用说明
 * ============================================================================
 * 请将此插件放置在 TagSystem.js 下方。
 * 不需要任何参数。
 */

(function() {
    
    // ------------------------------------------------------------------------
    // 修正 states()
    // 让依赖 actor.states() 遍历的插件（如 YEP 插件读取 Note）能找到标签状态
    // ------------------------------------------------------------------------
    var _Game_BattlerBase_states = Game_BattlerBase.prototype.states;
    Game_BattlerBase.prototype.states = function() {
        var states = _Game_BattlerBase_states.call(this);
        
        // 安全检查：确保 TagSystem 的方法存在
        if (this.getTagStates) {
            var tagStates = this.getTagStates();
            // 合并并去重 (防止同一状态ID在列表中出现多次)
            for (var i = 0; i < tagStates.length; i++) {
                var s = tagStates[i];
                // contains 检查的是对象引用，$dataStates 中的对象是全局唯一的，所以有效
                if (s && !states.contains(s)) {
                    states.push(s);
                }
            }
        }
        return states;
    };

    // ------------------------------------------------------------------------
    // 修正 isStateAffected()
    // 让 if (actor.isStateAffected(x)) 的判断条件生效
    // ------------------------------------------------------------------------
    var _Game_BattlerBase_isStateAffected = Game_BattlerBase.prototype.isStateAffected;
    Game_BattlerBase.prototype.isStateAffected = function(stateId) {
        // 1. 先检查原逻辑 (检查 this._states 数组中的 ID)
        if (_Game_BattlerBase_isStateAffected.call(this, stateId)) return true;
        
        // 2. 再检查标签系统赋予的状态 (TagSystem 计算出的动态状态)
        if (this.getTagStates) {
            var tagStates = this.getTagStates();
            for (var i = 0; i < tagStates.length; i++) {
                if (tagStates[i].id === stateId) return true;
            }
        }
        return false;
    };

    // ------------------------------------------------------------------------
    // 修正 traitObjects()
    // 防止属性双重叠加：
    // 1. TagSystem 原本就往 traitObjects 里塞了一次 TagStates。
    // 2. 我们上面修改了 states()，而原版 traitObjects 会调用 states()。
    // 结果：TagSystem塞一份 + states()带一份 = 两份。
    // 解决：对返回的列表进行去重。
    // ------------------------------------------------------------------------
    var _Game_BattlerBase_traitObjects = Game_BattlerBase.prototype.traitObjects;
    Game_BattlerBase.prototype.traitObjects = function() {
        // 调用原函数（注意：TagSystem 已经Alias了这个函数，所以这里包含了 TagSystem 的逻辑）
        var objects = _Game_BattlerBase_traitObjects.call(this);
        
        // 使用 filter + indexOf 进行去重
        // 这一步非常关键，否则攻击力等属性会加成两次
        return objects.filter(function(item, pos) {
            return objects.indexOf(item) === pos;
        });
    };

})();