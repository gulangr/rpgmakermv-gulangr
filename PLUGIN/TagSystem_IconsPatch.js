//=============================================================================
// TagSystem_IconsPatch.js
//=============================================================================
/*:
 * @plugindesc (v1.0) TagSystem 图标扩展补丁 - 自定义图标集+自动缩放
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
 * @text 最大缩放比例
 * @parent --- 缩放设置 ---
 * @type number
 * @decimals 2
 * @min 0.1
 * @max 5.0
 * @desc 图标最大缩放比例（相对于行高），默认1.0
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
 * 功能说明
 * ============================================================================
 * 此插件为 TagSystem 插件添加图标支持功能。
 *
 * 使用方法：
 * 在标签效果文本中使用特殊语法插入图标：
 * [T:1] - 插入图标集第1个图标（从0开始计数）
 * [T:1:2] - 插入图标集第1个图标，缩放比例为2倍
 *
 * 例如：
 * 【火焰】[T:5]技能伤害+50%  - 标签后插入图标
 * 【暴[T:5]击】[1][2]        - 标签背景中插入图标
 * [T:10]【冰霜】暴击率+30%    - 标签前插入图标
 *
 * ============================================================================
 * 图标集要求
 * ============================================================================
 * 1. 将图标集图片放置在 img/system/ 目录下
 * 2. 图片格式支持 PNG
 * 3. 图标集应为包含多个图标的水平排列图片
 * 4. 单个图标大小由 IconWidth 和 IconHeight 参数指定
 *
 * ============================================================================
 * 插件依赖
 * ============================================================================
 * 此插件需要 TagSystem.js 插件已安装并启用。
 * 建议将此插件放置在 TagSystem 插件之后。
 *
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
    TagSystem.Params.bgWidthScaleForIcon = TagSystem.Params.bgWidthScale;

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
                // 添加未匹配的文本
                var unmatchedText = text.substring(lastIndex, match.index);
                if (unmatchedText.trim()) {
                    result.push({
                        type: 'text',
                        content: unmatchedText
                    });
                }
            }
            
            // 处理普通文本部分
            if (match[1] && match[1].trim()) {
                // 检查普通文本中是否包含图标语法
                var plainText = match[1];
                var iconRegex = /\[T:\s*(\d+)(?:\s*:\s*(\d+(?:\.\d+)?))?\s*\]/g;
                var iconMatch;
                var plainLastIndex = 0;
                
                while ((iconMatch = iconRegex.exec(plainText)) !== null) {
                    // 添加图标前的普通文本
                    if (iconMatch.index > plainLastIndex) {
                        var beforeText = plainText.substring(plainLastIndex, iconMatch.index);
                        result.push({
                            type: 'text',
                            content: beforeText
                        });
                    }
                    
                    // 添加图标
                    result.push({
                        type: 'icon',
                        iconIndex: Number(iconMatch[1]),
                        iconScale: iconMatch[2] ? Number(iconMatch[2]) : 1
                    });
                    
                    plainLastIndex = iconMatch.index + iconMatch[0].length;
                }
                
                // 添加剩余的普通文本
                if (plainLastIndex < plainText.length) {
                    var remainingText = plainText.substring(plainLastIndex);
                    result.push({
                        type: 'text',
                        content: remainingText
                    });
                }
            }
            
            // 处理背景标签部分
            if (match[3] && match[4] && match[5]) {
                // 解析背景标签中的内容
                var bgContent = match[3];
                var bgColorId = Number(match[4]);
                var textColorId = Number(match[5]);
                
                // 检查背景内容中是否包含图标
                var iconRegex = /\[T:\s*(\d+)(?:\s*:\s*(\d+(?:\.\d+)?))?\s*\]/g;
                var iconMatch;
                var bgLastIndex = 0;
                var bgParts = [];
                
                while ((iconMatch = iconRegex.exec(bgContent)) !== null) {
                    // 添加图标前的普通文本
                    if (iconMatch.index > bgLastIndex) {
                        var beforeText = bgContent.substring(bgLastIndex, iconMatch.index);
                        bgParts.push({
                            type: 'text',
                            content: beforeText
                        });
                    }
                    
                    // 添加图标
                    bgParts.push({
                        type: 'icon',
                        iconIndex: Number(iconMatch[1]),
                        iconScale: iconMatch[2] ? Number(iconMatch[2]) : 1
                    });
                    
                    bgLastIndex = iconMatch.index + iconMatch[0].length;
                }
                
                // 添加剩余的文本
                if (bgLastIndex < bgContent.length) {
                    var remainingText = bgContent.substring(bgLastIndex);
                    bgParts.push({
                        type: 'text',
                        content: remainingText
                    });
                }
                
                // 将背景部分作为一个整体添加到结果
                result.push({
                    type: 'styled',
                    parts: bgParts,
                    bgColorId: bgColorId,
                    textColorId: textColorId
                });
            }
            
            lastIndex = match.index + match[0].length;
            
            // 防止无限循环
            if (match[0] === '') {
                break;
            }
        }
        
        // 添加剩余文本
        if (lastIndex < text.length) {
            var remainingText = text.substring(lastIndex);
            if (remainingText.trim()) {
                result.push({
                    type: 'text',
                    content: remainingText
                });
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

    // 绘制图标（独立模式）
    Window_Base.prototype.drawIconBlock = function(iconItem, textState) {
        if (!_iconSetBitmap || _iconSetBitmap.isError()) {
            loadIconSet();
            // 图标未加载时推进坐标
            textState.x += TagSystem.IconParams.iconWidth + TagSystem.Params.bgBlockMargin;
            return;
        }
        
        var iconParams = TagSystem.IconParams;
        var margin = TagSystem.Params.bgBlockMargin;
        
        // 计算目标行高
        var lineHeight = this.lineHeight();
        
        // 计算图标目标尺寸（缩放到行高）
        var targetSize = lineHeight * iconParams.maxIconScale;
        var scaleRatio = targetSize / iconParams.iconHeight;
        scaleRatio = Math.min(scaleRatio, iconParams.maxIconScale);
        
        // 考虑用户指定的缩放比例
        if (iconItem.iconScale && iconItem.iconScale > 1) {
            scaleRatio = Math.min(scaleRatio * iconItem.iconScale, iconParams.maxIconScale);
        }
        
        // 计算实际绘制尺寸
        var drawWidth = iconParams.iconWidth * scaleRatio;
        var drawHeight = iconParams.iconHeight * scaleRatio;
        
        // 计算绘制位置（垂直居中，考虑基线偏移）
        var drawX = textState.x + margin;
        var drawY = textState.y + (lineHeight - drawHeight) / 2 + iconParams.iconBaselineOffset;
        
        // 获取图标在图标集中的位置
        var iconPos = getIconPosition(iconItem.iconIndex);
        
        // 绘制图标
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
        
        // 推进坐标
        textState.x = drawX + drawWidth + margin;
        
        if (iconParams.enableDebug) {
            console.log('TagSystem_IconsPatch: 绘制图标', {
                iconIndex: iconItem.iconIndex,
                scaleRatio: scaleRatio,
                drawWidth: drawWidth,
                drawHeight: drawHeight
            });
        }
    };

    // 绘制图标（背景内模式）
    Window_Base.prototype.drawIconInBackground = function(iconItem, context, baseX, baseY, lineHeight) {
        if (!_iconSetBitmap || _iconSetBitmap.isError()) {
            return { width: TagSystem.IconParams.iconWidth };
        }
        
        var iconParams = TagSystem.IconParams;
        
        // 计算图标尺寸（缩放到行高）
        var targetSize = lineHeight * iconParams.maxIconScale;
        var scaleRatio = targetSize / iconParams.iconHeight;
        scaleRatio = Math.min(scaleRatio, iconParams.maxIconScale);
        
        // 考虑用户指定的缩放比例
        if (iconItem.iconScale && iconItem.iconScale > 1) {
            scaleRatio = Math.min(scaleRatio * iconItem.iconScale, iconParams.maxIconScale);
        }
        
        // 计算实际绘制尺寸
        var drawWidth = iconParams.iconWidth * scaleRatio;
        var drawHeight = iconParams.iconHeight * scaleRatio;
        
        // 计算绘制位置（垂直居中）
        var drawX = baseX;
        var drawY = baseY + (lineHeight - drawHeight) / 2;
        
        // 获取图标在图标集中的位置
        var iconPos = getIconPosition(iconItem.iconIndex);
        
        // 绘制图标
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

    // 重写绘制样式文本块函数，支持背景中的图标
    var _originalDrawStyledTextBlock = Window_Base.prototype.drawStyledTextBlock;
    Window_Base.prototype.drawStyledTextBlock = function(styledItem, textState) {
        // 如果是新格式的样式项（包含parts）
        if (styledItem.parts) {
            this.drawStyledTextWithIcons(styledItem, textState);
        } else {
            // 原始格式，使用原始方法
            _originalDrawStyledTextBlock.call(this, styledItem, textState);
        }
    };

    // 绘制包含图标的样式文本块
    Window_Base.prototype.drawStyledTextWithIcons = function(styledItem, textState) {
        var bgColorId = styledItem.bgColorId;
        var textColorId = styledItem.textColorId;
        var parts = styledItem.parts;
        var margin = TagSystem.Params.bgBlockMargin;
        
        // 1. 保存原生状态
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
            // 2. 精确计算所有部分的宽度和高度
            this.contents.fontFace = TagSystem.Params.tagFontName;
            this.contents.fontSize = originalFontSize - TagSystem.Params.fontSizeReduction;
            
            // 测量每个部分的实际宽度和高度
            var partsWidth = [];
            var maxPartHeight = 0;
            
            for (var i = 0; i < parts.length; i++) {
                var part = parts[i];
                if (part.type === 'text') {
                    var textWidth = this.textWidth(part.content);
                    var textHeight = this.lineHeight(); // 文字高度使用行高
                    partsWidth.push({ width: textWidth, height: textHeight });
                    maxPartHeight = Math.max(maxPartHeight, textHeight);
                } else if (part.type === 'icon') {
                    // 计算图标的实际尺寸（基于行高的缩放）
                    var lineHeight = this.lineHeight();
                    var maxIconScale = TagSystem.IconParams.maxIconScale;
                    var iconScale = part.iconScale ? Math.min(part.iconScale, maxIconScale) : maxIconScale;
                    
                    // 基于行高计算图标实际尺寸
                    var targetHeight = lineHeight * iconScale;
                    var scaleRatio = targetHeight / TagSystem.IconParams.iconHeight;
                    
                    var iconWidth = TagSystem.IconParams.iconWidth * scaleRatio;
                    var iconHeight = targetHeight;
                    partsWidth.push({ width: iconWidth, height: iconHeight });
                    maxPartHeight = Math.max(maxPartHeight, iconHeight);
                }
            }
            
            // 计算总宽度（包括间距）
            var totalWidth = 0;
            for (var i = 0; i < partsWidth.length; i++) {
                totalWidth += partsWidth[i].width;
            }
            // 添加各部分之间的间距（使用参数设置）
            totalWidth += (partsWidth.length - 1) * TagSystem.IconParams.iconTextSpacing;
            
            // 背景高度基于最大部分高度，并应用缩放比例
            var baseBgHeight = maxPartHeight * TagSystem.IconParams.bgHeightScale;
            
            // 使用正常的宽度系数来确保完全覆盖内容
            var baseBgWidth = totalWidth * TagSystem.Params.bgWidthScale + TagSystem.Params.bgHorizontalPadding * 2;
            var bgX = textState.x + margin;
            var bgY = textState.y + TagSystem.Params.bgBaselineOffset + (this.lineHeight() - baseBgHeight) / 2;
            
            // 3. 绘制背景
            if (bgColorId > 0 && bgColorId <= 15) {
                const ctx = this.contents._context;
                const bgColor = this.textColor(bgColorId);
                
                ctx.save();
                ctx.fillStyle = bgColor;
                ctx.globalAlpha = TagSystem.Params.bgOpacity; 
                
                // 绘制圆角矩形背景
                ctx.fillRoundedRect(bgX, bgY, baseBgWidth, baseBgHeight, TagSystem.Params.bgBorderRadius);
                
                // 绘制描边
                if (TagSystem.Params.bgStrokeWidth > 0) {
                    ctx.globalAlpha = 1.0;
                    ctx.lineWidth = TagSystem.Params.bgStrokeWidth;
                    ctx.strokeStyle = TagSystem.Params.bgStrokeColor;
                    ctx.strokeRoundedRect(bgX, bgY, baseBgWidth, baseBgHeight, TagSystem.Params.bgBorderRadius);
                }
                
                ctx.restore();
                this.contents._dirty = true;
            }
            
            // 4. 绘制内容（文本和图标）- 精确计算位置
            var currentX = bgX + (baseBgWidth - totalWidth) / 2;
            // 计算背景的垂直中心
            var bgCenterY = bgY + baseBgHeight / 2;
            
            for (var i = 0; i < parts.length; i++) {
                var part = parts[i];
                
                if (part.type === 'text') {
                    // 绘制文本 - 垂直居中于背景
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
                    // 绘制图标 - 垂直居中于背景
                    var iconY = bgCenterY - partsWidth[i].height / 2;
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
            
            // 5. 推进坐标
            textState.x = bgX + baseBgWidth + margin;
            
        } finally {
            // 恢复所有状态
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

    // 扩展处理函数：支持图标
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
                    // 普通文本，使用原始方法
                    textState.styledIndex++;
                    _originalProcessNormalCharacter.call(this, textState);
                    return;
                }
            }
        }
        _originalProcessNormalCharacter.call(this, textState);
    };

    // 扩展 drawText 函数
    var _originalDrawText = Window_Base.prototype.drawText;
    Window_Base.prototype.drawText = function(text, x, y, width, align) {
        if (!text || text === '') {
            return _originalDrawText.call(this, text, x, y, width, align);
        }
        
        var styledText = TagSystem.parseStyledText(text);
        
        // 如果只有普通文本，使用原始方法
        if (styledText.length === 1 && styledText[0].type === 'text') {
            return _originalDrawText.call(this, text, x, y, width, align);
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
                var originalOutline = this.contents.outline;
                var originalTextColor = this.contents.textColor;
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

    // 预加载图标集
    var _DataManager_createGameObjects = DataManager.createGameObjects;
    DataManager.createGameObjects = function() {
        _DataManager_createGameObjects.call(this);
        loadIconSet();
    };

    // 场景初始化时加载图标集
    var _Scene_Boot_loadSystemImages = Scene_Boot.loadSystemImages;
    Scene_Boot.loadSystemImages = function() {
        _Scene_Boot_loadSystemImages.call(this);
        loadIconSet();
    };

    // 调试输出
    if (TagSystem.IconParams.enableDebug) {
        console.log('TagSystem_IconsPatch: 插件已加载');
        console.log('图标集设置:', TagSystem.IconParams);
    }

})();