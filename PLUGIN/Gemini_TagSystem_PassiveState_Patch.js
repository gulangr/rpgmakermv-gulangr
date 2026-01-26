/*:
 * @plugindesc (v2.0) TagSystem 状态显示增强 - 完美被动/主动切换支持
 * @author Gemini
 * @target MV
 *
 * @help
 * ============================================================================
 * 功能说明
 * ============================================================================
 * 此插件专门解决 TagSystem 赋予的状态与战斗中临时获得的状态共存的问题。
 *
 * 1. 【智能图标过滤】：
 * - 如果状态仅由标签 (Tag) 赋予，它被视为“固有被动”，不显示图标，无回合限制。
 * - 如果状态是由技能/物品临时赋予，它会正常显示图标和回合数。
 *
 * 2. 【重叠状态处理】：
 * - 即使角色已经通过标签拥有了状态A (被动)，
 * - 当他在战斗中再次被施加状态A (主动) 时，
 * - 系统会强制显示该状态的图标和倒计时。
 * - 当倒计时结束后，图标消失，但状态A的效果依然由标签维持 (变回被动)。
 *
 * ============================================================================
 * 使用顺序
 * ============================================================================
 * 必须放在 TagSystem.js 的下方。
 * 建议放在 Gemini_TagSystem_StateNoteFix.js 的下方。
 */

(function() {

    // ------------------------------------------------------------------------
    // 1. 修正 addState (处理重叠逻辑)
    // ------------------------------------------------------------------------
    var _Game_Battler_addState = Game_Battler.prototype.addState;
    Game_Battler.prototype.addState = function(stateId) {
        // 核心逻辑：
        // 如果系统判定角色"已拥有"该状态(isStateAffected返回true，通常是因为Tag赋予了)，
        // 但是该状态并不在 _states 数组里(说明它是纯虚的被动状态)，
        // 而现在我们正尝试主动施加这个状态...
        if (this.isStateAffected(stateId) && !this._states.contains(stateId)) {
            // 强制将状态"实体化"加入到 _states 列表。
            // 这样它就有了实体，可以显示图标，也可以计算回合了。
            this.addNewState(stateId);
        }
        
        // 继续执行原版 addState (它会负责刷新回合数、处理动画等)
        _Game_Battler_addState.call(this, stateId);
    };

    // ------------------------------------------------------------------------
    // 2. 修正 stateIcons (处理图标显示)
    // ------------------------------------------------------------------------
    // 我们这里不保留原方法引用，因为需要完全接管图标的过滤逻辑
    Game_BattlerBase.prototype.stateIcons = function() {
        // 1. 获取所有生效的状态对象 (包含 Active主动 和 Passive被动)
        // 注意：这会按照数据库里的优先级排序
        var allStates = this.states();
        
        // 2. 获取当前的"实体"状态列表 (仅包含真正有回合限制的主动状态)
        var activeIds = this._states; 
        
        return allStates.filter(function(state) {
            // 【核心过滤】：
            // 只有当状态 ID 真实存在于 activeIds (_states) 数组中时，才允许显示图标。
            // 这样就自动过滤掉了那些只存在于 Tag 中但不在 _states 中的"纯被动"。
            return activeIds.contains(state.id);
        }).map(function(state) {
            return state.iconIndex;
        }).filter(function(iconIndex) {
            return iconIndex > 0;
        });
    };

})();