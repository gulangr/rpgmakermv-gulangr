/*:
 * @plugindesc 战斗敌人选中高光颜色自定义插件 V1.3 - (混合模式 + 智能还原)
 * @author 辅助开发
 *
 * @param HighlightColor
 * @text 高光颜色 (R,G,B)
 * @desc 选中敌人时的闪烁颜色。格式：红,绿,蓝 (0-255)。
 * 默认白色：255,255,255。
 * @default 255,255,255
 *
 * @param HighlightAlpha
 * @text 高光强度/透明度
 * @type number
 * @min 0
 * @max 255
 * @desc 颜色叠加的强度 (0-255)。
 * 数值越大颜色越浓。默认 64。
 * @default 64
 *
 * @param BlendMode
 * @text 混合模式
 * @type select
 * @option 正常 (Normal)
 * @value 0
 * @option 叠加/发光 (Add)
 * @value 1
 * @option 正片叠底 (Multiply)
 * @value 2
 * @option 滤色 (Screen)
 * @value 3
 * @desc 选中时敌人图片的混合模式。
 * 推荐“正常”或“叠加/发光”。
 * @default 0
 *
 * @help
 * ============================================================================
 * 介绍 (V1.3 混合模式版)
 * ============================================================================
 * 本插件允许您修改战斗中选中敌人的高光颜色、强度以及混合模式。
 *
 * ★ V1.3 新增功能：混合模式 (Blend Mode)
 * 您可以改变选中时的渲染方式：
 * - 0 (正常): 标准的颜色覆盖。
 * - 1 (叠加): 让敌人看起来像在“发光”，适合能量感的锁定。
 * - 2 (正片叠底): 会让画面变暗，颜色融合更深沉。
 * - 3 (滤色): 类似叠加，但更柔和。
 *
 * ★ 智能还原：
 * 插件会自动记录敌人原本的混合模式（例如某些幽灵怪原本就是叠加模式），
 * 取消选中后会完美还原，不会出现显示错误。
 *
 */

(function() {

    // --- 获取参数 ---
    var parameters = PluginManager.parameters('EnemySelectionColor');
    var colorStr = String(parameters['HighlightColor'] || '255,255,255');
    var alphaVal = Number(parameters['HighlightAlpha'] || 64);
    var targetBlendMode = Number(parameters['BlendMode'] || 0);

    // 解析颜色数组
    var _highlightColor = colorStr.split(',').map(Number);
    if (_highlightColor.length !== 3) {
        _highlightColor = [255, 255, 255];
    }
    
    // 组合成 [R, G, B, A]
    var _selectionBlendColor = _highlightColor.concat([alphaVal]);
    var _clearBlendColor = [0, 0, 0, 0];

    // ======================================================================
    // 重写 Sprite_Enemy 的选中效果
    // ======================================================================
    
    // 初始化扩展：增加状态标记
    var _Sprite_Enemy_initialize = Sprite_Enemy.prototype.initialize;
    Sprite_Enemy.prototype.initialize = function(battler) {
        _Sprite_Enemy_initialize.call(this, battler);
        this._selectionActive = false; // 标记是否处于由于选中而改变了状态
        this._savedBlendMode = 0;      // 用于存储原始混合模式
    };

    Sprite_Enemy.prototype.updateSelectionEffect = function() {
        var target = this._effectTarget; 
        
        if (this._battler.isSelected()) {
            // 1. 刚开始选中：备份原始状态
            if (!this._selectionActive) {
                this._savedBlendMode = target.blendMode;
                this._selectionActive = true;
            }

            // 2. 持续应用效果 (颜色 + 混合模式)
            // V1.2 逻辑：必须累加计数器以确保后续清理
            this._selectionEffectCount++;
            
            // 应用颜色
            target.setBlendColor(_selectionBlendColor);
            // 应用混合模式
            target.blendMode = targetBlendMode;
            
        } else if (this._selectionEffectCount > 0 || this._selectionActive) {
            // 3. 取消选中：清理与还原
            
            // 清除颜色
            target.setBlendColor(_clearBlendColor);
            
            // 还原混合模式 (如果之前是因为选中而修改了的话)
            if (this._selectionActive) {
                target.blendMode = this._savedBlendMode;
                this._selectionActive = false;
            }
            
            this._selectionEffectCount = 0;
        }
    };

})();