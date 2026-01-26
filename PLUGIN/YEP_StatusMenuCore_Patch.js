/*:
 * @plugindesc (v1.3) YEP_StatusMenuCore 补丁 - 弱点显示 & 属性名位置微调
 * @author Target Code (Patch)
 *
 * @param Element Name Offset Y
 * @text 属性名Y轴偏移量
 * @desc 调整“火、水、草”等属性名的垂直位置。
 * 正数向下移动，负数向上移动。
 * @default 0
 * @type number
 * @min -50
 * @max 50
 *
 * @help
 * ============================================================================
 * 介绍
 * ============================================================================
 * 这是一个 YEP_StatusMenuCore 的扩展补丁。
 *
 * 功能：
 * 1. 弱点标识：在抗性和状态数值左侧显示“▼弱”或“▲抗”（保持 V1.0 样式）。
 * 2. 位置调整：可以通过参数手动调整属性名称（Elements）的 Y 轴位置。
 *
 * ============================================================================
 * 注意事项
 * ============================================================================
 * 1. 请确保将此插件置于 YEP_StatusMenuCore.js 的下方。
 * 2. 请确保此插件的文件名为 'YEP_StatusMenuCore_Patch.js'，
 * 否则参数可能无法正确读取（或者请自行修改代码中的 parameters 调用名称）。
 */

(function() {

    // 尝试获取参数，如果文件名不对则默认为 0
    var parameters = PluginManager.parameters('YEP_StatusMenuCore_Patch');
    var paramElementOffsetY = Number(parameters['Element Name Offset Y'] || 0);

    // 检查核心插件是否加载
    if (!Imported.YEP_StatusMenuCore) {
        console.error("Please install YEP_StatusMenuCore before using this patch.");
        return;
    }

    //-----------------------------------------------------------------------------
    // Window_StatusInfo
    //-----------------------------------------------------------------------------

    /**
     * 辅助函数：绘制弱点/抗性标签 (完全保留 V1.0 逻辑)
     */
    Window_StatusInfo.prototype.drawWeakResistLabel = function(rate, dx, dy, dw, percentText) {
        if (Math.abs(rate - 1.0) < 0.001) return;

        var label = (rate > 1.0) ? '▼弱' : '▲抗';

        var originalFontSize = this.contents.fontSize;
        var percentWidth = this.textWidth(percentText);

        // V1.0 字体设置
        var fontSizeOffset = 6; 
        this.contents.fontSize = originalFontSize - fontSizeOffset;

        var labelWidth = this.textWidth(label);
        var spacing = 5; 

        var finalX = dx + dw - percentWidth - spacing - labelWidth;
        
        // V1.0 垂直位置算法
        var yOffset = (originalFontSize - this.contents.fontSize) / 2;

        this.drawText(label, finalX, dy + yOffset, labelWidth, 'left');

        this.contents.fontSize = originalFontSize;
    };

    //=============================================================================
    // 重写 Elements (属性抗性) 绘制逻辑
    //=============================================================================
    Window_StatusInfo.prototype.drawElementData = function(eleId, dx, dy, dw) {
        eleId = parseInt(eleId);
        var eleName = $dataSystem.elements[eleId];
        var eleRate = this._actor.elementRate(eleId);
        
        dx += this.textPadding();
        dw -= this.textPadding() * 2;
        
        this._bypassResetTextColor = true;
        this.changeTextColor(this.systemColor());
        
        // 【核心修改】使用参数控制 Y 轴偏移
        // dy 是原本的标准位置，paramElementOffsetY 是你在插件管理器设置的数值
        this.drawTextEx(eleName, dx, dy + paramElementOffsetY);
        
        this._bypassResetTextColor = false;
        
        // 设置颜色
        this.setRateColor(eleRate);
        var text = (eleRate * 100).toFixed(Yanfly.Param.StatusEleDec) + '%';
        
        // 绘制百分比
        this.drawText(text, dx, dy, dw, 'right');

        // 绘制标签 (V1.0)
        this.drawWeakResistLabel(eleRate, dx, dy, dw, text);
    };

    //=============================================================================
    // 重写 States (状态抗性) 绘制逻辑
    //=============================================================================
    Window_StatusInfo.prototype.drawStatesData = function(stateId, dx, dy, dw) {
        stateId = parseInt(stateId);
        var stateRate = this._actor.stateRate(stateId);
        if (this._actor.isStateResist(stateId)) stateRate = 0;
        
        dx += this.textPadding();
        dw -= this.textPadding() * 2;
        
        this._bypassResetTextColor = true;
        this.changeTextColor(this.systemColor());
        
        // 状态页暂不应用该偏移，通常 drawItemName 自带图标对齐较好
        // 如果也需要调整，可以将 dy 改为 dy + paramElementOffsetY
        this.drawItemName($dataStates[stateId], dx, dy, dw);
        
        this._bypassResetTextColor = false;
        
        this.setRateColor(stateRate);
        var text = (stateRate * 100).toFixed(Yanfly.Param.StatusStatesDec) + '%';
        
        this.drawText(text, dx, dy, dw, 'right');

        this.drawWeakResistLabel(stateRate, dx, dy, dw, text);
    };

})();