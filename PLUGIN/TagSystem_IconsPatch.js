//=============================================================================
// TagSystem_IconsPatch.js
//=============================================================================
/*:
 * @plugindesc (v1.2 修复版) TagSystem 图标扩展补丁 - 修复缩放限制与图标位移
 * @author Gemini & Zulu
 *
 * @param --- 图标集设置 ---
 * @default
 *
 * @param IconSetFileName
 * @text 图标集文件名
 * @parent --- 图标集设置 ---
 * @type string
 * @desc 图标集图片文件名（不含扩展名），图片应放置在 img/system/ 目录下
 * @default IconSet
 *
 * @param IconWidth
 * @text 图标宽度
 * @parent --- 图标集设置 ---
 * @type number
 * @min 1
 * @max 256
 * @desc 图标集中单个图标的宽度（像素），默认32
 * @default 32
 *
 * @param IconHeight
 * @text 图标高度
 * @parent --- 图标集设置 ---
 * @type number
 * @min 1
 * @max 256
 * @desc 图标集中单个图标的高度（像素），默认32
 * @default 32
 *
 * @param IconColumns
 * @text 图标集列数
 * @parent --- 图标集设置 ---
 * @type number
 * @min 1
 * @max 100
 * @desc 图标集中每行的图标数量，用于计算图标位置，默认16
 * @default 16
 *
 * @param --- 缩放设置 ---
 * @default
 *
 * @param MaxIconScale
 * @text 默认缩放比例
 * @parent --- 缩放设置 ---
 * @type number
 * @decimals 2
 * @min 0.1
 * @max 5.0
 * @desc 当未指定具体缩放时，图标相对于行高的默认缩放比例，默认1.0
 * @default 1.0
 *
 * @param IconBaselineOffset
 * @text 图标基线偏移
 * @parent --- 缩放设置 ---
 * @type number
 * @min -20
 * @max 20
 * @desc 图标垂直偏移（正数=下移，负数=上移），默认0
 * @default 0
 * * @param ContentIconOffsetY
 * @text 【】内图标Y偏移
 * @parent --- 缩放设置 ---
 * @type number
 * @min -50
 * @max 50
 * @desc 微调【】内容中图标的Y轴位置。正数向下，负数向上。
 * @default 0
 *
 * @param BackgroundHeightScale
 * @text 背景高度缩放比例
 * @parent --- 缩放设置 ---
 * @type number
 * @decimals 2
 * @min 0.1
 * @max 3.0
 * @desc 背景高度相对于最大内容高度的缩放比例，默认1.0
 * @default 1.0
 *
 * @param IconTextSpacing
 * @text 图标文字间距
 * @parent --- 缩放设置 ---
 * @type number
 * @min 0
 * @max 20
 * @desc 图标和文字之间的间距（像素），默认2
 * @default 2
 *
 * @param --- 高级设置 ---
 * @default
 *
 * @param EnableDebug
 * @text 启用调试模式
 * @parent --- 高级设置 ---
 * @type boolean
 * @desc 在控制台输出调试信息
 * @default false
 *
 * @help
 * ============================================================================
 * 修复说明 (v1.2)
 * ============================================================================
 * 1. 新增 "【】内图标Y偏移" 参数，允许独立微调背景块内图标的垂直位置。
 * * 修复说明 (v1.1)
 * ============================================================================
 * 修复了图标缩放逻辑中的 Bug：
 * 1. 移除了 iconScale > 1 的强制检查，现在可以正确缩放图标（包括缩小）。
 * 2. 移除了 maxIconScale 对自定义缩放的强制截断，自定义参数优先级更高。
 * * 这解决了 TagSystem 主插件中 "标签名图标缩放" 参数无效的问题。
 * ============================================================================
 */

var Imported = Imported || {};

(function() {
    'use strict';

    // 检查 TagSystem 是否已加载
    if (!Imported.TagSystem) {
        console.warn('TagSystem_IconsPatch: TagSystem 插件未加载，图标功能将被禁用。');
        return;
    }

    // 插件信息
    Imported.TagSystem_IconsPatch = true;
    var PluginName = 'TagSystem_IconsPatch';

    // 获取参数
    var parameters = PluginManager.parameters(PluginName);
    TagSystem.IconParams = {
        iconSetFileName: String(parameters['IconSetFileName'] || 'IconSet'),
        iconWidth: Number(parameters['IconWidth'] || 32),
        iconHeight: Number(parameters['IconHeight'] || 32),
        iconColumns: Number(parameters['IconColumns'] || 16),
        maxIconScale: Number(parameters['MaxIconScale'] || 1.0),
        iconBaselineOffset: Number(parameters['IconBaselineOffset'] || 0),
        contentIconOffsetY: Number(parameters['ContentIconOffsetY'] || 0), // 新增参数读取
        bgHeightScale: Number(parameters['BackgroundHeightScale'] || 1.0),
        iconTextSpacing: Number(parameters['IconTextSpacing'] || 2),
        enableDebug: String(parameters['EnableDebug'] || 'false') === 'true'
    };

    // 缓存图标集位图
    var _iconSetBitmap = null;
    var _iconSetLoaded = false;

    // 加载图标集
    function loadIconSet() {
        if (_iconSetLoaded) return _iconSetBitmap;
        
        var iconParams = TagSystem.IconParams;
        _iconSetBitmap = ImageManager.loadSystem(iconParams.iconSetFileName);
        
        _iconSetBitmap.addLoadListener(function() {
            _iconSetLoaded = true;
            if (iconParams.enableDebug) {
                console.log('TagSystem_IconsPatch: 图标集加载完成', _iconSetBitmap);
            }
        });
        
        return _iconSetBitmap;
    }
    // 恢复正常的宽度系数设置
    if (TagSystem.Params) {
        TagSystem.Params.bgWidthScaleForIcon = TagSystem.Params.bgWidthScale;
    }

    // 扩展解析函数：支持图标语法和背景中的图标
    var _originalParseStyledText = TagSystem.parseStyledText;
    TagSystem.parseStyledText = function(text) {
        if (!text || text === '') return [{ type: 'text', content: text }];
        
        var result = [];
        var lastIndex = 0;
        
        // 使用新的正则表达式匹配所有可能的组合
        // 格式：普通文本(【背景文本】)?
        var combinedRegex = /([^【】]*)(【([^】]*?)】\[(\d+)\]\[(\d+)\])?/g;
        var match;
        
        while ((match = combinedRegex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                var unmatchedText = text.substring(lastIndex, match.index);
                if (unmatchedText.trim()) {
                    result.push({ type: 'text', content: unmatchedText });
                }
            }
            
            // 处理普通文本部分
            if (match[1] && match[1].trim()) {
                var plainText = match[1];
                var iconRegex = /\[T:\s*(\d+)(?:\s*:\s*(\d+(?:\.\d+)?))?\s*\]/g;
                var iconMatch;
                var plainLastIndex = 0;
                
                while ((iconMatch = iconRegex.exec(plainText)) !== null) {
                    if (iconMatch.index > plainLastIndex) {
                        var beforeText = plainText.substring(plainLastIndex, iconMatch.index);
                        result.push({ type: 'text', content: beforeText });
                    }
                    result.push({
                        type: 'icon',
                        iconIndex: Number(iconMatch[1]),
                        iconScale: iconMatch[2] ? Number(iconMatch[2]) : undefined // Fix: undefined if not set
                    });
                    plainLastIndex = iconMatch.index + iconMatch[0].length;
                }
                
                if (plainLastIndex < plainText.length) {
                    var remainingText = plainText.substring(plainLastIndex);
                    result.push({ type: 'text', content: remainingText });
                }
            }
            
            // 处理背景标签部分
            if (match[3] && match[4] && match[5]) {
                var bgContent = match[3];
                var bgColorId = Number(match[4]);
                var textColorId = Number(match[5]);
                
                var iconRegex = /\[T:\s*(\d+)(?:\s*:\s*(\d+(?:\.\d+)?))?\s*\]/g;
                var iconMatch;
                var bgLastIndex = 0;
                var bgParts = [];
                
                while ((iconMatch = iconRegex.exec(bgContent)) !== null) {
                    if (iconMatch.index > bgLastIndex) {
                        var beforeText = bgContent.substring(bgLastIndex, iconMatch.index);
                        bgParts.push({ type: 'text', content: beforeText });
                    }
                    bgParts.push({
                        type: 'icon',
                        iconIndex: Number(iconMatch[1]),
                        iconScale: iconMatch[2] ? Number(iconMatch[2]) : undefined
                    });
                    bgLastIndex = iconMatch.index + iconMatch[0].length;
                }
                
                if (bgLastIndex < bgContent.length) {
                    var remainingText = bgContent.substring(bgLastIndex);
                    bgParts.push({ type: 'text', content: remainingText });
                }
                
                result.push({
                    type: 'styled',
                    parts: bgParts,
                    bgColorId: bgColorId,
                    textColorId: textColorId
                });
            }
            lastIndex = match.index + match[0].length;
            if (match[0] === '') break;
        }
        
        if (lastIndex < text.length) {
            var remainingText = text.substring(lastIndex);
            if (remainingText.trim()) {
                result.push({ type: 'text', content: remainingText });
            }
        }
        return result;
    };

    // 获取图标在图标集中的位置
    function getIconPosition(iconIndex) {
        var iconParams = TagSystem.IconParams;
        var columns = iconParams.iconColumns;
        var x = (iconIndex % columns) * iconParams.iconWidth;
        var y = Math.floor(iconIndex / columns) * iconParams.iconHeight;
        return { x: x, y: y };
    }

    // 绘制图标（独立模式）- 【修复：缩放逻辑】
    Window_Base.prototype.drawIconBlock = function(iconItem, textState) {
        if (!_iconSetBitmap || _iconSetBitmap.isError()) {
            loadIconSet();
            textState.x += TagSystem.IconParams.iconWidth + TagSystem.Params.bgBlockMargin;
            return;
        }
        
        var iconParams = TagSystem.IconParams;
        var margin = TagSystem.Params.bgBlockMargin;
        var lineHeight = this.lineHeight();
        
        // 【核心修复】：优先使用指定缩放，没有指定则使用默认 MaxIconScale
        var effectiveScale = (iconItem.iconScale !== undefined) ? iconItem.iconScale : iconParams.maxIconScale;
        
        // 计算目标高度
        var targetSize = lineHeight * effectiveScale;
        
        // 计算缩放比
        var scaleRatio = targetSize / iconParams.iconHeight;
        
        // 计算实际绘制尺寸
        var drawWidth = iconParams.iconWidth * scaleRatio;
        var drawHeight = iconParams.iconHeight * scaleRatio;
        
        // 计算绘制位置
        var drawX = textState.x + margin;
        var drawY = textState.y + (lineHeight - drawHeight) / 2 + iconParams.iconBaselineOffset;
        var iconPos = getIconPosition(iconItem.iconIndex);
        
        this.contents._context.save();
        this.contents._context.imageSmoothingEnabled = false;
        
        this.contents.blt(
            _iconSetBitmap,
            iconPos.x, iconPos.y,
            iconParams.iconWidth, iconParams.iconHeight,
            drawX, drawY,
            drawWidth, drawHeight
        );
        
        this.contents._context.restore();
        this.contents._dirty = true;
        
        textState.x = drawX + drawWidth + margin;
        
        if (iconParams.enableDebug) {
            console.log('TagSystem_IconsPatch: Draw Icon', {
                index: iconItem.iconIndex,
                scale: effectiveScale,
                w: drawWidth,
                h: drawHeight
            });
        }
    };

    // 绘制图标（背景内模式） - 【修复：缩放逻辑】
    Window_Base.prototype.drawIconInBackground = function(iconItem, context, baseX, baseY, lineHeight) {
        if (!_iconSetBitmap || _iconSetBitmap.isError()) {
            return { width: TagSystem.IconParams.iconWidth };
        }
        
        var iconParams = TagSystem.IconParams;
        
        // 【核心修复】：同上
        var effectiveScale = (iconItem.iconScale !== undefined) ? iconItem.iconScale : iconParams.maxIconScale;
        var targetSize = lineHeight * effectiveScale;
        var scaleRatio = targetSize / iconParams.iconHeight;
        
        var drawWidth = iconParams.iconWidth * scaleRatio;
        var drawHeight = iconParams.iconHeight * scaleRatio;
        
        var drawX = baseX;
        var drawY = baseY + (lineHeight - drawHeight) / 2;
        var iconPos = getIconPosition(iconItem.iconIndex);
        
        context.save();
        context.imageSmoothingEnabled = false;
        
        this.contents.blt(
            _iconSetBitmap,
            iconPos.x, iconPos.y,
            iconParams.iconWidth, iconParams.iconHeight,
            drawX, drawY,
            drawWidth, drawHeight
        );
        
        context.restore();
        this.contents._dirty = true;
        
        return { width: drawWidth, height: drawHeight };
    };

    // 重写绘制样式文本块函数
    var _originalDrawStyledTextBlock = Window_Base.prototype.drawStyledTextBlock;
    Window_Base.prototype.drawStyledTextBlock = function(styledItem, textState) {
        if (styledItem.parts) {
            this.drawStyledTextWithIcons(styledItem, textState);
        } else {
            _originalDrawStyledTextBlock.call(this, styledItem, textState);
        }
    };

    // 绘制包含图标的样式文本块 - 【修复：缩放逻辑】
    Window_Base.prototype.drawStyledTextWithIcons = function(styledItem, textState) {
        var bgColorId = styledItem.bgColorId;
        var textColorId = styledItem.textColorId;
        var parts = styledItem.parts;
        var margin = TagSystem.Params.bgBlockMargin;
        
        const originalFontSize = this.contents.fontSize || 28;
        const originalFontFace = this.contents.fontFace;
        const originalPaintOpacity = this.contents.paintOpacity;
        const originalOutlineWidth = this.contents.outlineWidth;
        const originalOutlineColor = this.contents.outlineColor;
        const originalShadow = this.contents.shadow;
        const originalFillStyle = this.contents._context.fillStyle;
        const originalStrokeStyle = this.contents._context.strokeStyle;
        const originalShadowColor = this.contents._context.shadowColor;
        const originalShadowBlur = this.contents._context.shadowBlur;
        const originalShadowOffsetX = this.contents._context.shadowOffsetX;
        const originalShadowOffsetY = this.contents._context.shadowOffsetY;
        const originalTextBaseline = this.contents._context.textBaseline; 

        try {
            this.contents.fontFace = TagSystem.Params.tagFontName;
            this.contents.fontSize = originalFontSize - TagSystem.Params.fontSizeReduction;
            
            var partsWidth = [];
            var maxPartHeight = 0;
            var lineHeight = this.lineHeight();
            
            for (var i = 0; i < parts.length; i++) {
                var part = parts[i];
                if (part.type === 'text') {
                    var textWidth = this.textWidth(part.content);
                    var textHeight = lineHeight;
                    partsWidth.push({ width: textWidth, height: textHeight });
                    maxPartHeight = Math.max(maxPartHeight, textHeight);
                } else if (part.type === 'icon') {
                    // 【核心修复】：混合排版中的图标缩放
                    var effectiveScale = (part.iconScale !== undefined) ? part.iconScale : TagSystem.IconParams.maxIconScale;
                    var targetHeight = lineHeight * effectiveScale;
                    var scaleRatio = targetHeight / TagSystem.IconParams.iconHeight;
                    
                    var iconWidth = TagSystem.IconParams.iconWidth * scaleRatio;
                    var iconHeight = targetHeight;
                    partsWidth.push({ width: iconWidth, height: iconHeight });
                    maxPartHeight = Math.max(maxPartHeight, iconHeight);
                }
            }
            
            var totalWidth = 0;
            for (var i = 0; i < partsWidth.length; i++) {
                totalWidth += partsWidth[i].width;
            }
            totalWidth += (partsWidth.length - 1) * TagSystem.IconParams.iconTextSpacing;
            
            var baseBgHeight = maxPartHeight * TagSystem.IconParams.bgHeightScale;
            var baseBgWidth = totalWidth * TagSystem.Params.bgWidthScale + TagSystem.Params.bgHorizontalPadding * 2;
            var bgX = textState.x + margin;
            var bgY = textState.y + TagSystem.Params.bgBaselineOffset + (this.lineHeight() - baseBgHeight) / 2;
            
            // 绘制背景
            if (bgColorId > 0 && bgColorId <= 15) {
                const ctx = this.contents._context;
                const bgColor = this.textColor(bgColorId);
                ctx.save();
                ctx.fillStyle = bgColor;
                ctx.globalAlpha = TagSystem.Params.bgOpacity; 
                ctx.fillRoundedRect(bgX, bgY, baseBgWidth, baseBgHeight, TagSystem.Params.bgBorderRadius);
                
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
                    this.contents._context.fillText(part.content, currentX, textY);
                    this.contents._context.restore();
                    this.contents._dirty = true;
                    currentX += partWidth + TagSystem.IconParams.iconTextSpacing;
                } else if (part.type === 'icon') {
                    // 【核心修改】这里应用了偏移量
                    var iconY = bgCenterY - partsWidth[i].height / 2 + TagSystem.IconParams.contentIconOffsetY;
                    var iconWidth = partsWidth[i].width;
                    var iconHeight = partsWidth[i].height;
                    
                    this.contents._context.save();
                    this.contents._context.imageSmoothingEnabled = false;
                    var iconPos = getIconPosition(part.iconIndex);
                    this.contents.blt(
                        _iconSetBitmap,
                        iconPos.x, iconPos.y,
                        TagSystem.IconParams.iconWidth, TagSystem.IconParams.iconHeight,
                        currentX, iconY,
                        iconWidth, iconHeight
                    );
                    this.contents._context.restore();
                    this.contents._dirty = true;
                    currentX += iconWidth + TagSystem.IconParams.iconTextSpacing;
                }
            }
            textState.x = bgX + baseBgWidth + margin;
        } finally {
            this.contents.fontSize = originalFontSize;
            this.contents.fontFace = originalFontFace;
            this.contents.paintOpacity = originalPaintOpacity;
            this.contents.outlineWidth = originalOutlineWidth;
            this.contents.outlineColor = originalOutlineColor;
            if (originalShadow !== undefined) this.contents.shadow = originalShadow;
            this.contents.outline = true;
            this.contents._context.fillStyle = originalFillStyle;
            this.contents._context.strokeStyle = originalStrokeStyle;
            this.contents._context.shadowColor = originalShadowColor;
            this.contents._context.shadowBlur = originalShadowBlur;
            this.contents._context.shadowOffsetX = originalShadowOffsetX;
            this.contents._context.shadowOffsetY = originalShadowOffsetY;
            this.contents._context.textBaseline = originalTextBaseline; 
            this.changeTextColor(this.normalColor());
        }
    };

    // 扩展处理函数和 drawText 保持不变 (省略以节省空间，但代码逻辑中已包含)
    var _originalProcessNormalCharacter = Window_Base.prototype.processNormalCharacter;
    Window_Base.prototype.processNormalCharacter = function(textState) {
        if (textState.styledText && textState.styledIndex < textState.styledText.length) {
            const styledItem = textState.styledText[textState.styledIndex];
            if (!textState.styledProcessing) {
                if (styledItem.type === 'icon') {
                    this.drawIconBlock(styledItem, textState);
                    textState.styledIndex++;
                    return;
                } else if (styledItem.type === 'styled') {
                    this.drawStyledTextBlock(styledItem, textState);
                    textState.styledIndex++;
                    return;
                } else if (styledItem.type === 'text') {
                    textState.styledIndex++;
                    _originalProcessNormalCharacter.call(this, textState);
                    return;
                }
            }
        }
        _originalProcessNormalCharacter.call(this, textState);
    };

    var _originalDrawText = Window_Base.prototype.drawText;
    Window_Base.prototype.drawText = function(text, x, y, width, align) {
        if (!text || text === '') return _originalDrawText.call(this, text, x, y, width, align);
        var styledText = TagSystem.parseStyledText(text);
        if (styledText.length === 1 && styledText[0].type === 'text') {
            return _originalDrawText.call(this, text, x, y, width, align);
        }
        var textState = {
            x: x, y: y, width: width, height: this.lineHeight(),
            align: align || 'left', styledText: styledText, styledIndex: 0, styledProcessing: false
        };
        while (textState.styledIndex < styledText.length) {
            var item = styledText[textState.styledIndex];
            if (item.type === 'text') {
                var originalOutline = this.contents.outline;
                var originalFontFace = this.contents.fontFace;
                this.contents.outline = true;
                this.contents.fontFace = originalFontFace;
                this.changeTextColor(this.normalColor());
                var remainingWidth = textState.width - (textState.x - x);
                _originalDrawText.call(this, item.content, textState.x, textState.y, remainingWidth, textState.align);
                textState.x += this.textWidth(item.content);
                textState.styledIndex++;
                this.contents.outline = originalOutline;
            } else if (item.type === 'icon') {
                this.drawIconBlock(item, textState);
                textState.styledIndex++;
            } else {
                this.processNormalCharacter(textState);
            }
        }
    };

    // 初始化加载
    var _DataManager_createGameObjects = DataManager.createGameObjects;
    DataManager.createGameObjects = function() {
        _DataManager_createGameObjects.call(this);
        loadIconSet();
    };
    var _Scene_Boot_loadSystemImages = Scene_Boot.loadSystemImages;
    Scene_Boot.loadSystemImages = function() {
        _Scene_Boot_loadSystemImages.call(this);
        loadIconSet();
    };

    if (TagSystem.IconParams.enableDebug) {
        console.log('TagSystem_IconsPatch: 插件已加载 (Fix v1.2)');
    }
})();