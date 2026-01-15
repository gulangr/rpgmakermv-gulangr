/*:
 * @plugindesc (v1.0) AES文字跟随补丁：让倍率文字吸附在弱点图片上
 * @author Gemini Assistant
 *
 * @param Offset X
 * @text X轴微调
 * @desc 文字相对于弱点图片的水平偏移量。正数向右，负数向左。
 * @default 0
 * @type number
 * @min -999
 * @max 999
 *
 * @param Offset Y
 * @text Y轴微调
 * @desc 文字相对于弱点图片的垂直偏移量。正数向下，负数向上。
 * @default -20
 * @type number
 * @min -999
 * @max 999
 *
 * @help
 * ============================================================================
 * Gemini AES Follower (v1.0)
 * ============================================================================
 * 这是一个桥接补丁插件。
 *
 * 【功能】
 * 它强制 AdvancedElementSystem (AES) 生成的倍率文字（如 "Weak", "x2.0"）
 * 放弃原本的漂浮逻辑，改为死死“咬住” Gemini_ElementPopup_Redux 生成的
 * 弱点/抵抗图片。
 *
 * 【效果】
 * 无论弱点图片怎么堆叠（暴击时在上面，无暴击时在下面），
 * AES 文字都会永远跟随着它，保持相对静止。
 *
 * 【使用注意】
 * 1. 必须放在 Gemini_ElementPopup_Redux.js 的下方。
 * 2. 如果没有触发弱点/抵抗（即没有生成图片），AES文字将保持原版行为。
 */

(function() {
    var pluginName = "Gemini_AES_Follower";
    var parameters = PluginManager.parameters(pluginName);
    var pOffsetX = Number(parameters['Offset X'] || 0);
    var pOffsetY = Number(parameters['Offset Y'] || -20);

    // ========================================================================
    // 拦截 Update：实施“绑架”逻辑
    // ========================================================================
    var _Sprite_Damage_update = Sprite_Damage.prototype.update;
    Sprite_Damage.prototype.update = function() {
        // 1. 执行原版逻辑 (让 AES 和 Redux 各自计算自己的东西)
        _Sprite_Damage_update.call(this);

        // 2. 检查两个主角是否都存在
        // this._geminiFloater -> Redux 的弱点图片
        // this._rateSprite -> AES 的文字对象
        if (this._geminiFloater && this._rateSprite) {
            
            // 3. 强制覆盖 AES 文字的坐标
            // 让它等于 [弱点图坐标] + [偏移量]
            this._rateSprite.x = this._geminiFloater.x + pOffsetX;
            this._rateSprite.y = this._geminiFloater.y + pOffsetY;

            // 4. (可选) 同步透明度
            // 这样当弱点图消失时，文字也会一起消失，看起来更像一个整体
            if (this._geminiFloater.opacity < 255) {
                this._rateSprite.opacity = this._geminiFloater.opacity;
            }
            
            // 5. (可选) 强制 AES 文字可见
            // 防止某些 AES 版本在 update 中因为持续时间到了而提前隐藏
            if (this._geminiFloater.visible && this._geminiFloater.opacity > 0) {
                 this._rateSprite.visible = true;
            }
        }
    };

})();