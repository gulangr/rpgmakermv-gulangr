/*:
 * @plugindesc (v1.1 Mod) 修复MOG与YEP护盾插件共用时，破盾暴击图片位置及显示逻辑。
 * @author Gemini Assistant
 *
 * @param Break Shield Offset Y
 * @text 破盾暴击Y轴上移量
 * @desc 当产生溢出伤害（双弹窗）时，暴击图标向上移动的像素距离。
 * @default 40
 * @type number
 *
 * @help
 * ============================================================================
 * Gemini Crit Popup Patch (v1.1 Mod)
 * ============================================================================
 * 这是一个逻辑修正补丁，用于 MOG_DmgPopupEffects 和 YEP_AbsorptionBarrier。
 *
 * 【核心逻辑】
 * 1. 护盾弹窗层：
 * - 始终隐藏 MOG 自带的暴击图（避免重复）。
 * - 特判：如果是“完美破盾”（护盾破了但没溢出伤害），强制在此层显示暴击图。
 * 注意：此时【不应用】Y轴偏移，因为没有 HP 数字挤占空间。
 * - 特判：如果是“溢出破盾”（有后续 HP 弹窗），传递信号给下一层。
 *
 * 2. HP 弹窗层：
 * - 如果收到“溢出破盾”信号，显示暴击图。
 * - 此时【应用】Y轴偏移，调整位置以美观显示。
 *
 * ============================================================================
 * 使用方法
 * ============================================================================
 * 1. 必须放置在 MOG_DmgPopupEffects.js 和 YEP_AbsorptionBarrier.js 的下方。
 */

(function() {
    // 获取参数
    var parameters = PluginManager.parameters('Gemini_CritPopup_Patch');
    var pOffsetY = Number(parameters['Break Shield Offset Y'] || 40);

    // ------------------------------------------------------------------------
    // 拦截 Setup：状态识别与信号传递
    // ------------------------------------------------------------------------
    var _Sprite_Damage_setup = Sprite_Damage.prototype.setup;
    Sprite_Damage.prototype.setup = function(target) {
        
        // 1. 识别当前弹窗类型 (依赖 YEP 的 _barrierAffected 标记)
        var isBarrierPopup = false;
        if (target._damagePopup && target._damagePopup.length > 0) {
             isBarrierPopup = !!target._damagePopup[0]._barrierAffected;
        }

        // 2. 逻辑分流
        if (isBarrierPopup) {
            // === 当前是：护盾弹窗 ===
            var result = target.result();
            
            // 判定：暴击 且 护盾被清空
            if (result.critical && target.barrierPoints() === 0) {
                
                // 情况 A：完美破盾 (HP伤害为0)
                // 系统不会生成下一个 HP 弹窗，所以我们必须在这里“借壳”显示暴击。
                if (result.hpDamage === 0) {
                    this._forceCreateCrit = true;       // 强制生成暴击图
                    this._applyGeminiCritOffset = false; // 【关键】不应用偏移 (因为只有一行数字)
                } 
                // 情况 B：溢出破盾 (HP伤害 > 0)
                // 系统会生成下一个 HP 弹窗，我们将任务交给它。
                else {
                    target._geminiCritBreakFlag = true; // 传递信号
                    // 此时 MOG 默认会隐藏当前层的暴击，符合“护盾层隐藏”的需求
                }
            }
        } else {
            // === 当前是：HP 弹窗 (或普通弹窗) ===
            
            // 检查是否有来自上一层（护盾层）的信号
            if (target._geminiCritBreakFlag) {
                // 收到溢出信号！标记当前弹窗需要应用偏移
                this._applyGeminiCritOffset = true;
                
                // 消费信号
                target._geminiCritBreakFlag = false; 
            }
        }
        
        // 3. 执行原版 setup
        _Sprite_Damage_setup.call(this, target);
        
        // 4. 补救措施：处理完美破盾的强制生成
        // 原版 setup 可能因为 hpDamage=0 而跳过了 createCritical，这里补上
        if (this._forceCreateCrit) {
            // 如果 MOG 没有创建暴击图（_critRecorded 为 false），我们手动创建
            if (!this._critRecorded) {
                this.createCritical();
            }
            this._forceCreateCrit = false;
        }
    };

    // ------------------------------------------------------------------------
    // 拦截 createCritical：位置偏移执行
    // ------------------------------------------------------------------------
    var _Sprite_Damage_createCritical = Sprite_Damage.prototype.createCritical;
    Sprite_Damage.prototype.createCritical = function() {
        // 1. 生成图片
        _Sprite_Damage_createCritical.call(this);
        
        // 2. 仅在需要偏移时调整坐标 (溢出破盾的情况)
        if (this._applyGeminiCritOffset) {
            var sprite = this.children[this.children.length - 1];
            if (sprite) {
                // 增加 yf2 值，使图片视觉上移
                sprite.yf2 = (sprite.yf2 || 0) + pOffsetY;
            }
        }
    };

})();