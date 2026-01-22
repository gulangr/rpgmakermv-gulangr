/*:
 * @plugindesc (v1.5) TagSystem 样式修复补丁 - 特定窗口样式增强版+背景阴影
 * @author Gemini 优化补丁
 *
 * @param --- 正常文字样式 (【】之外) ---
 * @default
 *
 * @param Enable Normal Style
 * @text 启用正常文字自定义
 * @parent --- 正常文字样式 (【】之外) ---
 * @type boolean
 * @on 启用
 * @off 关闭
 * @desc 是否启用自定义样式？(v1.4改动：开启后仅在 YEP 状态菜单的 Window_StatusCustomExt 窗口生效)
 * @default true
 *
 * @param Normal Font Opacity
 * @text 字体透明度
 * @parent --- 正常文字样式 (【】之外) ---
 * @type number
 * @min 0
 * @max 255
 * @desc 文字的不透明度 (0-255)。MV默认255。
 * @default 255
 *
 * @param Normal Outline Color
 * @text 描边颜色
 * @parent --- 正常文字样式 (【】之外) ---
 * @type string
 * @desc 描边颜色 (16进制格式，如 #000000)
 * @default #000000
 *
 * @param Normal Outline Opacity
 * @text 描边透明度
 * @parent --- 正常文字样式 (【】之外) ---
 * @type number
 * @min 0
 * @max 255
 * @desc 描边不透明度 (0-255)。
 * @default 128
 *
 * @param Normal Outline Width
 * @text 描边宽度
 * @parent --- 正常文字样式 (【】之外) ---
 * @type number
 * @min 0
 * @desc 描边线条的粗细 (像素)。MV默认4。
 * @default 4
 *
 * @param Normal Shadow Color
 * @text 阴影颜色
 * @parent --- 正常文字样式 (【】之外) ---
 * @type string
 * @desc 阴影颜色 (16进制格式，如 #000000)
 * @default #000000
 *
 * @param Normal Shadow Opacity
 * @text 阴影透明度
 * @parent --- 正常文字样式 (【】之外) ---
 * @type number
 * @min 0
 * @max 255
 * @desc 阴影不透明度 (0-255)。设为0可隐藏阴影。
 * @default 0
 *
 * @param Normal Shadow Blur
 * @text 阴影范围(模糊)
 * @parent --- 正常文字样式 (【】之外) ---
 * @type number
 * @min 0
 * @desc 阴影的模糊扩散范围。0为锐利阴影。
 * @default 0
 *
 * @param Normal Shadow Offset X
 * @text 阴影X偏移
 * @parent --- 正常文字样式 (【】之外) ---
 * @type number
 * @min -20
 * @max 20
 * @desc 阴影横向偏移像素。
 * @default 0
 *
 * @param Normal Shadow Offset Y
 * @text 阴影Y偏移
 * @parent --- 正常文字样式 (【】之外) ---
 * @type number
 * @min -20
 * @max 20
 * @desc 阴影纵向偏移像素。
 * @default 0
 *
 * @param --- 标签文字样式 (【】之内) ---
 * @default
 *
 * @param Enable Tag Style
 * @text 启用标签文字自定义
 * @parent --- 标签文字样式 (【】之内) ---
 * @type boolean
 * @on 启用
 * @off 使用系统默认
 * @desc 是否对【】之内的标签文字应用自定义样式？(此选项依然全局生效)
 * @default true
 *
 * @param Tag Outline Color
 * @text 描边颜色
 * @parent --- 标签文字样式 (【】之内) ---
 * @type string
 * @desc 描边颜色 (16进制格式，如 #000000)
 * @default #000000
 *
 * @param Tag Outline Opacity
 * @text 描边透明度
 * @parent --- 标签文字样式 (【】之内) ---
 * @type number
 * @min 0
 * @max 255
 * @desc 描边不透明度 (0-255)。
 * @default 128
 *
 * @param Tag Outline Width
 * @text 描边宽度
 * @parent --- 标签文字样式 (【】之内) ---
 * @type number
 * @min 0
 * @desc 描边线条的粗细 (像素)。
 * @default 4
 *
 * @param Tag Shadow Color
 * @text 阴影颜色
 * @parent --- 标签文字样式 (【】之内) ---
 * @type string
 * @desc 阴影颜色 (16进制格式，如 #000000)
 * @default #000000
 *
 * @param Tag Shadow Opacity
 * @text 阴影透明度
 * @parent --- 标签文字样式 (【】之内) ---
 * @type number
 * @min 0
 * @max 255
 * @desc 阴影不透明度 (0-255)。
 * @default 0
 *
 * @param Tag Shadow Blur
 * @text 阴影范围(模糊)
 * @parent --- 标签文字样式 (【】之内) ---
 * @type number
 * @min 0
 * @desc 阴影的模糊扩散范围。
 * @default 0
 *
 * @param Tag Shadow Offset X
 * @text 阴影X偏移
 * @parent --- 标签文字样式 (【】之内) ---
 * @type number
 * @min -20
 * @max 20
 * @desc 阴影横向偏移像素。
 * @default 0
 *
 * @param Tag Shadow Offset Y
 * @text 阴影Y偏移
 * @parent --- 标签文字样式 (【】之内) ---
 * @type number
 * @min -20
 * @max 20
 * @desc 阴影纵向偏移像素。
 * @default 0
 * * @param --- 背景色块阴影样式 ---
 * @default
 *
 * @param Bg Shadow Color
 * @text 背景阴影颜色
 * @parent --- 背景色块阴影样式 ---
 * @type string
 * @desc 背景色块的阴影颜色 (16进制格式，如 #000000)
 * @default #000000
 *
 * @param Bg Shadow Opacity
 * @text 背景阴影透明度
 * @parent --- 背景色块阴影样式 ---
 * @type number
 * @min 0
 * @max 255
 * @desc 背景色块的阴影不透明度 (0-255)。设为0可隐藏阴影。
 * @default 0
 *
 * @param Bg Shadow Blur
 * @text 背景阴影范围(模糊)
 * @parent --- 背景色块阴影样式 ---
 * @type number
 * @min 0
 * @desc 背景色块的阴影模糊扩散范围。
 * @default 0
 *
 * @param Bg Shadow Offset X
 * @text 背景阴影X偏移
 * @parent --- 背景色块阴影样式 ---
 * @type number
 * @min -20
 * @max 20
 * @desc 背景色块的阴影横向偏移像素。
 * @default 0
 *
 * @param Bg Shadow Offset Y
 * @text 背景阴影Y偏移
 * @parent --- 背景色块阴影样式 ---
 * @type number
 * @min -20
 * @max 20
 * @desc 背景色块的阴影纵向偏移像素。
 * @default 0
 *
 * @help
 * ============================================================================
 * 插件说明 (v1.5)
 * ============================================================================
 * 这是一个针对 TagSystem 系列插件的全局视觉增强补丁。
 *
 * 更新日志：
 * v1.5 - 新增：自定义背景色块（标签背景）的阴影样式。
 * v1.4 - 修改：限制“正常文字样式”仅在 Window_StatusCustomExt 窗口中生效。
 * (其他窗口将保持系统默认样式，不受本插件参数影响)
 * v1.3 - 新增：支持独立定义【】之外的“正常文字”样式。
 * v1.2 - 新增：支持自定义【】之内文字的描边与阴影样式。
 * v1.1 - 修复：解决 v1.0 的报错问题。
 *
 * ============================================================================
 * 使用注意事项
 * ============================================================================
 * 1. 请务必将本插件放置在以下插件的 **下方**：
 * - TagSystem.js
 * - TagSystem_IconsPatch.js
 * - Gemini_TagSystem_WrappingPatch.js
 * ============================================================================
 */

(function() {
    'use strict';

    // 检查依赖
    if (!Imported.TagSystem) return;

    // 获取参数
    var parameters = PluginManager.parameters('Gemini_TagSystem_StyleRestore');
    
    // --- 正常文字参数 ---
    var useNormalStyle = (parameters['Enable Normal Style'] || 'true') === 'true';
    var pNormalOpacity = Number(parameters['Normal Font Opacity'] || 255);
    var pNormalOutlineColor = String(parameters['Normal Outline Color'] || '#000000');
    var pNormalOutlineOpacity = Number(parameters['Normal Outline Opacity'] || 128);
    var pNormalOutlineWidth = Number(parameters['Normal Outline Width'] || 4);
    var pNormalShadowColor = String(parameters['Normal Shadow Color'] || '#000000');
    var pNormalShadowOpacity = Number(parameters['Normal Shadow Opacity'] || 0);
    var pNormalShadowBlur = Number(parameters['Normal Shadow Blur'] || 0);
    var pNormalShadowOffsetX = Number(parameters['Normal Shadow Offset X'] || 0);
    var pNormalShadowOffsetY = Number(parameters['Normal Shadow Offset Y'] || 0);

    // --- 标签文字参数 ---
    var useTagStyle = (parameters['Enable Tag Style'] || 'true') === 'true';
    var pTagOutlineColor = String(parameters['Tag Outline Color'] || '#000000');
    var pTagOutlineOpacity = Number(parameters['Tag Outline Opacity'] || 128);
    var pTagOutlineWidth = Number(parameters['Tag Outline Width'] || 4);
    var pTagShadowColor = String(parameters['Tag Shadow Color'] || '#000000');
    var pTagShadowOpacity = Number(parameters['Tag Shadow Opacity'] || 0);
    var pTagShadowBlur = Number(parameters['Tag Shadow Blur'] || 0);
    var pTagShadowOffsetX = Number(parameters['Tag Shadow Offset X'] || 0);
    var pTagShadowOffsetY = Number(parameters['Tag Shadow Offset Y'] || 0);

    // --- 背景色块阴影参数 (v1.5 新增) ---
    var pBgShadowColor = String(parameters['Bg Shadow Color'] || '#000000');
    var pBgShadowOpacity = Number(parameters['Bg Shadow Opacity'] || 0);
    var pBgShadowBlur = Number(parameters['Bg Shadow Blur'] || 0);
    var pBgShadowOffsetX = Number(parameters['Bg Shadow Offset X'] || 0);
    var pBgShadowOffsetY = Number(parameters['Bg Shadow Offset Y'] || 0);

    // 辅助：Hex转RGBA
    function hexToRgba(hex, alpha) {
        if (!hex) return 'rgba(0,0,0,0)';
        if (hex.startsWith('#')) hex = hex.slice(1);
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
        if (hex.length !== 6) return 'rgba(0,0,0,0)';
        var r = parseInt(hex.substring(0, 2), 16);
        var g = parseInt(hex.substring(2, 4), 16);
        var b = parseInt(hex.substring(4, 6), 16);
        var a = (alpha / 255).toFixed(2);
        return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
    }

    // 预计算样式
    var styleNormalOutline = hexToRgba(pNormalOutlineColor, pNormalOutlineOpacity);
    var styleNormalShadow = hexToRgba(pNormalShadowColor, pNormalShadowOpacity);
    var styleTagOutline = hexToRgba(pTagOutlineColor, pTagOutlineOpacity);
    var styleTagShadow = hexToRgba(pTagShadowColor, pTagShadowOpacity);
    // 新增：背景阴影样式预计算
    var styleBgShadow = hexToRgba(pBgShadowColor, pBgShadowOpacity);

    // ========================================================================
    // 核心重写 1: drawText (处理正常文字与图标混合)
    // ========================================================================
    Window_Base.prototype.drawText = function(text, x, y, width, align) {
        if (!text || text === '') {
            this.contents.drawText(text, x, y, width, this.lineHeight(), align);
            return;
        }
        
        var styledText = TagSystem.parseStyledText(text);
        
        // 单一纯文本情况
        if (styledText.length === 1 && styledText[0].type === 'text') {
            this.drawNormalTextWithStyle(text, x, y, width, align);
            return;
        }
        
        var textState = {
            x: x,
            y: y,
            width: width,
            height: this.lineHeight(),
            align: align || 'left',
            styledText: styledText,
            styledIndex: 0,
            styledProcessing: false
        };
        
        while (textState.styledIndex < styledText.length) {
            var item = styledText[textState.styledIndex];
            
            if (item.type === 'text') {
                var remainingWidth = textState.width - (textState.x - x);
                this.drawNormalTextWithStyle(item.content, textState.x, textState.y, remainingWidth, textState.align);
                
                textState.x += this.textWidth(item.content);
                textState.styledIndex++;
            } else if (item.type === 'icon') {
                if (this.drawIconBlock) {
                    this.drawIconBlock(item, textState);
                }
                textState.styledIndex++;
            } else {
                this.processNormalCharacter(textState);
            }
        }
    };

    // 新增：带样式的普通文本绘制函数 (v1.4: 增加窗口判断逻辑)
    Window_Base.prototype.drawNormalTextWithStyle = function(text, x, y, width, align) {
        // 保存原始状态
        var originalOutlineWidth = this.contents.outlineWidth;
        var originalOutlineColor = this.contents.outlineColor;
        var originalPaintOpacity = this.contents.paintOpacity;
        var ctx = this.contents._context;
        var originalShadowBlur = ctx.shadowBlur;
        var originalShadowColor = ctx.shadowColor;
        var originalShadowOffsetX = ctx.shadowOffsetX;
        var originalShadowOffsetY = ctx.shadowOffsetY;

        // [v1.4 核心修改] 判断是否为目标窗口
        var isTargetWindow = (this.constructor.name === 'Window_StatusCustomExt');

        try {
            // 仅在启用且为目标窗口时应用自定义样式
            if (useNormalStyle && isTargetWindow) {
                this.contents.paintOpacity = pNormalOpacity;
                this.contents.outlineWidth = pNormalOutlineWidth;
                this.contents.outlineColor = styleNormalOutline;
                
                if (pNormalShadowOpacity > 0) {
                    ctx.shadowColor = styleNormalShadow;
                    ctx.shadowBlur = pNormalShadowBlur;
                    ctx.shadowOffsetX = pNormalShadowOffsetX;
                    ctx.shadowOffsetY = pNormalShadowOffsetY;
                } else {
                    ctx.shadowColor = 'rgba(0,0,0,0)';
                }
            }
            
            // 绘制
            this.contents.drawText(text, x, y, width, this.lineHeight(), align);

        } finally {
            // 恢复状态
            this.contents.outlineWidth = originalOutlineWidth;
            this.contents.outlineColor = originalOutlineColor;
            this.contents.paintOpacity = originalPaintOpacity;
            ctx.shadowBlur = originalShadowBlur;
            ctx.shadowColor = originalShadowColor;
            ctx.shadowOffsetX = originalShadowOffsetX;
            ctx.shadowOffsetY = originalShadowOffsetY;
        }
    };

    // ========================================================================
    // 核心重写 2: drawStyledTextBlock (处理【】内纯文字/Hex颜色)
    // ========================================================================
    var _Window_Base_drawStyledTextBlock = Window_Base.prototype.drawStyledTextBlock;
    
    Window_Base.prototype.drawStyledTextBlock = function(styledItem, textState) {
        if (!styledItem || (!styledItem.bgColorId && !styledItem.textColorId)) {
             return _Window_Base_drawStyledTextBlock.call(this, styledItem, textState);
        }

        const content = styledItem.content;
        const bgColorId = styledItem.bgColorId;
        const textColorId = styledItem.textColorId;
        const originalFontSize = this.contents.fontSize || 28;
        const originalFontFace = this.contents.fontFace;

        // 标签样式 (Tags) 暂时保持全局生效，如果需要限制也可在此处增加判断
        var tOutlineWidth, tOutlineColor;
        var tShadowColor, tShadowBlur, tShadowOffsetX, tShadowOffsetY;

        if (useTagStyle) {
            tOutlineWidth = pTagOutlineWidth;
            tOutlineColor = styleTagOutline;
            tShadowColor = styleTagShadow;
            tShadowBlur = pTagShadowBlur;
            tShadowOffsetX = pTagShadowOffsetX;
            tShadowOffsetY = pTagShadowOffsetY;
        } else {
            tOutlineWidth = this.contents.outlineWidth;
            tOutlineColor = this.contents.outlineColor;
            tShadowColor = this.contents._context.shadowColor;
            tShadowBlur = this.contents._context.shadowBlur;
            tShadowOffsetX = this.contents._context.shadowOffsetX;
            tShadowOffsetY = this.contents._context.shadowOffsetY;
        }

        const fontSizeReduction = TagSystem.Params.fontSizeReduction;
        const margin = TagSystem.Params.bgBlockMargin; 
        let targetFontSize = Math.max(originalFontSize - fontSizeReduction, 1);
        var minBrowserFontSize = 12;
        var renderFontSize = targetFontSize;
        var scaleRatio = 1.0;
        if (targetFontSize < minBrowserFontSize) {
            scaleRatio = targetFontSize / minBrowserFontSize;
            renderFontSize = minBrowserFontSize;
        }

        try {
            this.contents.fontFace = TagSystem.Params.tagFontName;
            this.contents.fontSize = renderFontSize;
            var visualTextWidth = this.textWidth(content) * scaleRatio;
            const baseBgHeight = originalFontSize * TagSystem.Params.bgHeightRatio;
            const baseBgWidth = visualTextWidth * TagSystem.Params.bgWidthScale + TagSystem.Params.bgHorizontalPadding * 2;
            const singleSideExpand = (baseBgWidth - visualTextWidth) / 2;
            const bgX = textState.x + margin;
            const bgY = textState.y + TagSystem.Params.bgBaselineOffset + (this.lineHeight() - baseBgHeight) / 2;
            const textX = bgX + singleSideExpand;
            
            var shouldDrawBg = (typeof bgColorId === 'number' && bgColorId > 0) || (typeof bgColorId === 'string' && bgColorId !== '');
            const ctx = this.contents._context;
            if (shouldDrawBg) {
                const bgColor = this.textColor(bgColorId);
                ctx.save();
                
                // --- 新增：应用背景阴影 ---
                if (pBgShadowOpacity > 0) {
                    ctx.shadowColor = styleBgShadow;
                    ctx.shadowBlur = pBgShadowBlur;
                    ctx.shadowOffsetX = pBgShadowOffsetX;
                    ctx.shadowOffsetY = pBgShadowOffsetY;
                }
                
                ctx.fillStyle = bgColor;
                ctx.globalAlpha = TagSystem.Params.bgOpacity; 
                ctx.fillRoundedRect(bgX, bgY, baseBgWidth, baseBgHeight, TagSystem.Params.bgBorderRadius);
                
                // 绘制边框前重置阴影，避免边框重叠阴影
                ctx.shadowColor = 'rgba(0,0,0,0)'; 
                
                if (TagSystem.Params.bgStrokeWidth > 0) {
                    ctx.globalAlpha = 1.0; 
                    ctx.lineWidth = TagSystem.Params.bgStrokeWidth;
                    ctx.strokeStyle = TagSystem.Params.bgStrokeColor;
                    ctx.strokeRoundedRect(bgX, bgY, baseBgWidth, baseBgHeight, TagSystem.Params.bgBorderRadius);
                }
                ctx.restore();
                this.contents._dirty = true;
            }

            ctx.save();
            var fontStyle = '';
            if (this.contents.fontItalic) fontStyle += 'italic ';
            if (this.contents.fontBold) fontStyle += 'bold ';
            ctx.font = fontStyle + renderFontSize + 'px "' + TagSystem.Params.tagFontName + '"';
            ctx.fillStyle = this.textColor(textColorId);
            ctx.textBaseline = 'middle';
            const ty = textState.y + this.lineHeight() / 2 + TagSystem.Params.textBaselineOffset;

            if (tShadowColor && tShadowColor !== 'rgba(0,0,0,0)') {
                ctx.shadowColor = tShadowColor;
                ctx.shadowBlur = tShadowBlur;
                ctx.shadowOffsetX = tShadowOffsetX;
                ctx.shadowOffsetY = tShadowOffsetY;
            }
            if (tOutlineWidth > 0) {
                ctx.lineWidth = tOutlineWidth;
                ctx.strokeStyle = tOutlineColor;
                ctx.lineJoin = 'round';
            }

            if (scaleRatio !== 1.0) {
                ctx.scale(scaleRatio, scaleRatio);
                if (tOutlineWidth > 0) ctx.strokeText(content, textX / scaleRatio, ty / scaleRatio);
                ctx.fillText(content, textX / scaleRatio, ty / scaleRatio);
            } else {
                if (tOutlineWidth > 0) ctx.strokeText(content, textX, ty);
                ctx.fillText(content, textX, ty);
            }
            ctx.restore();
            this.contents._dirty = true;

            textState.x = bgX + baseBgWidth + margin;
        } finally {
            this.contents.fontSize = originalFontSize;
            this.contents.fontFace = originalFontFace;
            this.changeTextColor(this.normalColor());
        }
    };

    // ========================================================================
    // 核心重写 3: drawStyledTextWithIcons (处理【】内图标混合)
    // ========================================================================
    if (Window_Base.prototype.drawStyledTextWithIcons) {
        Window_Base.prototype.drawStyledTextWithIcons = function(styledItem, textState) {
            var bgColorId = styledItem.bgColorId;
            var textColorId = styledItem.textColorId;
            var parts = styledItem.parts;
            var margin = TagSystem.Params.bgBlockMargin;
            
            const originalFontSize = this.contents.fontSize || 28;
            const originalFontFace = this.contents.fontFace;
            
            // 标签样式 (Tags) 保持全局生效
            var tOutlineWidth, tOutlineColor;
            var tShadowColor, tShadowBlur, tShadowOffsetX, tShadowOffsetY;
            if (useTagStyle) {
                tOutlineWidth = pTagOutlineWidth;
                tOutlineColor = styleTagOutline;
                tShadowColor = styleTagShadow;
                tShadowBlur = pTagShadowBlur;
                tShadowOffsetX = pTagShadowOffsetX;
                tShadowOffsetY = pTagShadowOffsetY;
            } else {
                tOutlineWidth = this.contents.outlineWidth;
                tOutlineColor = this.contents.outlineColor;
                tShadowColor = this.contents._context.shadowColor;
                tShadowBlur = this.contents._context.shadowBlur;
                tShadowOffsetX = this.contents._context.shadowOffsetX;
                tShadowOffsetY = this.contents._context.shadowOffsetY;
            }

            try {
                this.contents.fontFace = TagSystem.Params.tagFontName;
                this.contents.fontSize = originalFontSize - TagSystem.Params.fontSizeReduction;
                
                var partsWidth = [];
                var maxPartHeight = 0;
                for (var i = 0; i < parts.length; i++) {
                    var part = parts[i];
                    if (part.type === 'text') {
                        var textWidth = this.textWidth(part.content);
                        var textHeight = this.lineHeight(); 
                        partsWidth.push({ width: textWidth, height: textHeight });
                        maxPartHeight = Math.max(maxPartHeight, textHeight);
                    } else if (part.type === 'icon') {
                        var lineHeight = this.lineHeight();
                        var maxIconScale = TagSystem.IconParams.maxIconScale;
                        var iconScale = part.iconScale ? Math.min(part.iconScale, maxIconScale) : maxIconScale;
                        var targetHeight = lineHeight * iconScale;
                        var scaleRatio = targetHeight / TagSystem.IconParams.iconHeight;
                        var iconWidth = TagSystem.IconParams.iconWidth * scaleRatio;
                        var iconHeight = targetHeight;
                        partsWidth.push({ width: iconWidth, height: iconHeight });
                        maxPartHeight = Math.max(maxPartHeight, iconHeight);
                    }
                }
                var totalWidth = 0;
                for (var i = 0; i < partsWidth.length; i++) totalWidth += partsWidth[i].width;
                totalWidth += (partsWidth.length - 1) * TagSystem.IconParams.iconTextSpacing;
                
                var baseBgHeight = maxPartHeight * TagSystem.IconParams.bgHeightScale;
                var baseBgWidth = totalWidth * TagSystem.Params.bgWidthScale + TagSystem.Params.bgHorizontalPadding * 2;
                var bgX = textState.x + margin;
                var bgY = textState.y + TagSystem.Params.bgBaselineOffset + (this.lineHeight() - baseBgHeight) / 2;
                
                if ((typeof bgColorId === 'number' && bgColorId > 0) || (typeof bgColorId === 'string' && bgColorId !== '')) {
                    const ctx = this.contents._context;
                    const bgColor = this.textColor(bgColorId);
                    ctx.save();
                    
                    // --- 新增：应用背景阴影 ---
                    if (pBgShadowOpacity > 0) {
                        ctx.shadowColor = styleBgShadow;
                        ctx.shadowBlur = pBgShadowBlur;
                        ctx.shadowOffsetX = pBgShadowOffsetX;
                        ctx.shadowOffsetY = pBgShadowOffsetY;
                    }
                    
                    ctx.fillStyle = bgColor;
                    ctx.globalAlpha = TagSystem.Params.bgOpacity; 
                    ctx.fillRoundedRect(bgX, bgY, baseBgWidth, baseBgHeight, TagSystem.Params.bgBorderRadius);
                    
                    // 绘制边框前重置阴影
                    ctx.shadowColor = 'rgba(0,0,0,0)';
                    
                    if (TagSystem.Params.bgStrokeWidth > 0) {
                        ctx.globalAlpha = 1.0;
                        ctx.lineWidth = TagSystem.Params.bgStrokeWidth;
                        ctx.strokeStyle = TagSystem.Params.bgStrokeColor;
                        ctx.strokeRoundedRect(bgX, bgY, baseBgWidth, baseBgHeight, TagSystem.Params.bgBorderRadius);
                    }
                    ctx.restore();
                    this.contents._dirty = true;
                }
                
                var currentX = bgX + (baseBgWidth - totalWidth) / 2;
                var bgCenterY = bgY + baseBgHeight / 2;
                
                for (var i = 0; i < parts.length; i++) {
                    var part = parts[i];
                    if (part.type === 'text') {
                        var textY = bgCenterY + TagSystem.Params.textBaselineOffset;
                        var partWidth = partsWidth[i].width;
                        this.contents._context.save();
                        this.contents._context.font = (originalFontSize - TagSystem.Params.fontSizeReduction) + 'px "' + TagSystem.Params.tagFontName + '"';
                        this.contents._context.fillStyle = this.textColor(textColorId);
                        this.contents._context.textBaseline = 'middle';
                        
                        if (tShadowColor && tShadowColor !== 'rgba(0,0,0,0)') {
                            this.contents._context.shadowColor = tShadowColor;
                            this.contents._context.shadowBlur = tShadowBlur;
                            this.contents._context.shadowOffsetX = tShadowOffsetX;
                            this.contents._context.shadowOffsetY = tShadowOffsetY;
                        }
                        if (tOutlineWidth > 0) {
                            this.contents._context.lineWidth = tOutlineWidth;
                            this.contents._context.strokeStyle = tOutlineColor;
                            this.contents._context.lineJoin = 'round';
                            this.contents._context.strokeText(part.content, currentX, textY);
                        }
                        this.contents._context.fillText(part.content, currentX, textY);
                        this.contents._context.restore();
                        this.contents._dirty = true;
                        currentX += partWidth + TagSystem.IconParams.iconTextSpacing;
                        
                    } else if (part.type === 'icon') {
                        var iconY = bgCenterY - partsWidth[i].height / 2;
                        var iconWidth = partsWidth[i].width;
                        var iconHeight = partsWidth[i].height;
                        
                        this.contents._context.save();
                        this.contents._context.imageSmoothingEnabled = false;
                        
                        var iconParams = TagSystem.IconParams;
                        var ix = (part.iconIndex % iconParams.iconColumns) * iconParams.iconWidth;
                        var iy = Math.floor(part.iconIndex / iconParams.iconColumns) * iconParams.iconHeight;
                        var iconSet = ImageManager.loadSystem(iconParams.iconSetFileName);
                        
                        this.contents.blt(iconSet, ix, iy, iconParams.iconWidth, iconParams.iconHeight, currentX, iconY, iconWidth, iconHeight);
                        this.contents._context.restore();
                        this.contents._dirty = true;
                        
                        currentX += iconWidth + TagSystem.IconParams.iconTextSpacing;
                    }
                }
                textState.x = bgX + baseBgWidth + margin;
            } finally {
                this.contents.fontSize = originalFontSize;
                this.contents.fontFace = originalFontFace;
                this.changeTextColor(this.normalColor());
            }
        };
    }

})();