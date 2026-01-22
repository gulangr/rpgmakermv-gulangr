/*:
 * @plugindesc (v1.8) TagSystem 终极补丁 - 修复图标[T:x]不显示的问题
 * @author Gemini
 *
 * @param Enable Debug Log
 * @text 启用调试日志
 * @type boolean
 * @on 开启
 * @off 关闭
 * @default true
 *
 * @help
 * ============================================================================
 * 功能升级 (v1.8)
 * ============================================================================
 * 修复了与 TagSystem_IconsPatch.js 的冲突。
 * 现在可以正确解析和显示 [T:x] 格式的图标了。
 * * 1. 【解锁 16 进制颜色代码】：
 * - 【暴击】[FFFFFF][3]     (背景白色，文字3号色)
 * - 【火焰】[#FF0000][#FFFF00] (背景红色，文字黄色)
 *
 * 2. 【图标支持】：
 * - 支持文本中插入图标：获得[T:25]物品
 * - 支持标签内插入图标：【[T:10]力量】[0][0]
 *
 * ============================================================================
 */

(function() {

    var parameters = PluginManager.parameters('Gemini_TagSystem_WrappingPatch');
    var enableDebug = (parameters['Enable Debug Log'] || 'true') === 'true';

    // 获取配置参数
    var yepParams = PluginManager.parameters('YEP_StatusMenu_CustomWindow') || {};
    var paramFontSize = Number(yepParams['Content Font Size'] || 16);
    var paramLineHeight = Number(yepParams['Content Line Height'] || 20);
    var paramLabelNameOffsetY = Number(yepParams['Label Name Offset Y'] || 0);
    var paramNamePadding = Number(yepParams['Name Padding'] || 4);
    var paramLinePadding = Number(yepParams['Line Padding'] || 4);
    var paramLabelColorIndex = Number(yepParams['Label Color Index'] || 3);
    
    var paramLineColor = String(yepParams['Line Color'] || '255, 255, 255');
    var paramLineOpacity = Number(yepParams['Line Opacity'] || 0.3);
    var finalLineStyle = 'rgba(' + paramLineColor + ',' + paramLineOpacity + ')';

    var COLOR_POS_BLUE = '#66ccff';
    var COLOR_NEG_PURPLE = '#ea80fc';
    var SUFFIX_TEXT = "（满）";

    // ------------------------------------------------------------------------
    // 1. 系统底层扩展：让 textColor 支持 Hex 字符串
    // ------------------------------------------------------------------------
    var _Window_Base_textColor = Window_Base.prototype.textColor;
    Window_Base.prototype.textColor = function(n) {
        if (typeof n === 'string') {
            if (n.match(/^#?[0-9a-fA-F]{6}$/)) {
                return (n.startsWith('#') ? n : '#' + n);
            }
        }
        return _Window_Base_textColor.call(this, n);
    };

    // ------------------------------------------------------------------------
    // 2. 覆盖 TagSystem 解析器：支持 Hex 字符串参数 + [T:x] 图标完美兼容
    // ------------------------------------------------------------------------
    
    // 辅助函数：解析文本中的图标 [T:x] 或 [T:x:scale]
    function parseIconsInText(str) {
        var res = [];
        // 匹配 [T:123] 或 [T:123:1.5]
        var reg = /\[T:\s*(\d+)(?:\s*:\s*(\d+(?:\.\d+)?))?\s*\]/g;
        var cur = 0;
        var m;
        while((m = reg.exec(str)) !== null) {
            // 添加图标前的纯文本
            if (m.index > cur) {
                res.push({ type: 'text', content: str.substring(cur, m.index) });
            }
            // 添加图标 Token
            res.push({
                type: 'icon',
                iconIndex: Number(m[1]),
                iconScale: m[2] ? Number(m[2]) : 1.0
            });
            cur = reg.lastIndex;
        }
        // 添加剩余文本
        if (cur < str.length) {
            res.push({ type: 'text', content: str.substring(cur) });
        }
        return res;
    }

    // 辅助函数：解析颜色ID或Hex
    function parseColor(val) {
         if (!val) return 0;
         if (val.match(/^\d+$/)) return Number(val);
         return val; 
    }

    // 重写主解析器
    TagSystem.parseStyledText = function(text) {
        if (!text || text === '') return [{ type: 'text', content: text }];
        
        var tokens = [];
        // 匹配标签块：【内容】[背景][文字]
        // 允许颜色部分包含非数字 (Hex)
        var regexBlock = /【([^】]+?)】\[\s*(.*?)\s*\]\[\s*(.*?)\s*\]/g;
        
        var cursor = 0;
        var match;

        while ((match = regexBlock.exec(text)) !== null) {
            // 1. 处理标签块之前的普通文本（可能含有图标）
            var preText = text.substring(cursor, match.index);
            if (preText) {
                tokens = tokens.concat(parseIconsInText(preText));
            }

            // 2. 处理标签块
            var contentRaw = match[1];
            var bgParam = match[2];
            var textParam = match[3];

            // 解析标签内部文字（可能含有图标）
            var parts = parseIconsInText(contentRaw);

            tokens.push({
                type: 'styled',
                content: contentRaw, // 原始文本用于降级显示
                bgColorId: parseColor(bgParam),
                textColorId: parseColor(textParam),
                parts: parts // 包含内部结构用于高级显示
            });

            cursor = regexBlock.lastIndex;
        }

        // 3. 处理剩余文本
        var remain = text.substring(cursor);
        if (remain) {
            tokens = tokens.concat(parseIconsInText(remain));
        }

        return tokens;
    };

    // ------------------------------------------------------------------------
    // 3. 覆盖绘制逻辑：兼容 Hex 颜色绘制
    // ------------------------------------------------------------------------
    Window_Base.prototype.drawStyledTextBlock = function(styledItem, textState) {
        const content = styledItem.content;
        const bgColorId = styledItem.bgColorId;
        const textColorId = styledItem.textColorId;

        const originalFontSize = this.contents.fontSize || 28;
        const originalFontFace = this.contents.fontFace;
        const fontSizeReduction = TagSystem.Params.fontSizeReduction;
        const margin = TagSystem.Params.bgBlockMargin; 
        
        let targetFontSize = originalFontSize - fontSizeReduction;
        targetFontSize = Math.max(targetFontSize, 1);

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
            
            var rawTextWidth = this.textWidth(content);
            var visualTextWidth = rawTextWidth * scaleRatio;

            const baseBgHeight = originalFontSize * TagSystem.Params.bgHeightRatio;
            const baseBgWidth = visualTextWidth * TagSystem.Params.bgWidthScale + TagSystem.Params.bgHorizontalPadding * 2;
            const singleSideExpand = (baseBgWidth - visualTextWidth) / 2;
            
            const bgX = textState.x + margin;
            const bgY = textState.y + TagSystem.Params.bgBaselineOffset + (this.lineHeight() - baseBgHeight) / 2;
            const textX = bgX + singleSideExpand;
            
            var shouldDrawBg = false;
            if (typeof bgColorId === 'number' && bgColorId > 0) shouldDrawBg = true;
            if (typeof bgColorId === 'string' && bgColorId !== '') shouldDrawBg = true;

            const ctx = this.contents._context;

            if (shouldDrawBg) {
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

            ctx.save();
            var fontStyle = '';
            if (this.contents.fontItalic) fontStyle += 'italic ';
            if (this.contents.fontBold) fontStyle += 'bold ';
            ctx.font = fontStyle + renderFontSize + 'px "' + TagSystem.Params.tagFontName + '"';
            
            ctx.fillStyle = this.textColor(textColorId);
            ctx.textBaseline = 'middle';
            const lh = this.lineHeight();
            const ty = textState.y + lh / 2 + TagSystem.Params.textBaselineOffset;

            if (scaleRatio !== 1.0) {
                ctx.scale(scaleRatio, scaleRatio);
                ctx.fillText(content, textX / scaleRatio, ty / scaleRatio);
            } else {
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

    // ------------------------------------------------------------------------
    // 4. 辅助：宽度计算 (v1.6 逻辑 + IconParams 保护)
    // ------------------------------------------------------------------------
    function calcTokenWidth(win, token) {
        if (token.type === 'text') return win.textWidth(token.content);
        
        // 确保 iconParams 存在，防止崩溃
        var iconParams = (TagSystem.IconParams) ? TagSystem.IconParams : { 
            iconWidth: 32, iconHeight: 32, maxIconScale: 1.0, iconTextSpacing: 2 
        };

        if (token.type === 'styled') {
            var totalW = 0;
            var margin = TagSystem.Params.bgBlockMargin;
            var fontSizeReduction = TagSystem.Params.fontSizeReduction;
            var originalFontSize = win.contents.fontSize;
            var originalFontFace = win.contents.fontFace;
            win.contents.fontFace = TagSystem.Params.tagFontName;
            
            if (token.parts) { 
                // 拥有内部结构（图标+文字）
                win.contents.fontSize = originalFontSize - fontSizeReduction;
                var partsTotalW = 0;
                var spacing = iconParams.iconTextSpacing;
                
                for (var i = 0; i < token.parts.length; i++) {
                    var part = token.parts[i];
                    if (part.type === 'text') {
                        partsTotalW += win.textWidth(part.content);
                    } else if (part.type === 'icon') {
                         var lh = win.lineHeight();
                         var maxScale = iconParams.maxIconScale;
                         var iScale = part.iconScale ? Math.min(part.iconScale, maxScale) : maxScale;
                         var ratio = (lh * iScale) / iconParams.iconHeight;
                         partsTotalW += iconParams.iconWidth * ratio;
                    }
                }
                // 加上间距
                if (token.parts.length > 1) {
                    partsTotalW += (token.parts.length - 1) * spacing;
                }
                totalW = partsTotalW * TagSystem.Params.bgWidthScale + TagSystem.Params.bgHorizontalPadding * 2 + margin;
            } else { 
                // 纯文字回退模式
                var targetFontSize = Math.max(originalFontSize - fontSizeReduction, 1);
                var minBrowserFontSize = 12;
                var scaleRatio = (targetFontSize < minBrowserFontSize) ? targetFontSize / minBrowserFontSize : 1.0;
                var renderFontSize = (targetFontSize < minBrowserFontSize) ? minBrowserFontSize : targetFontSize;
                win.contents.fontSize = renderFontSize;
                var visualW = win.textWidth(token.content) * scaleRatio;
                totalW = visualW * TagSystem.Params.bgWidthScale + TagSystem.Params.bgHorizontalPadding * 2 + margin;
            }
            win.contents.fontSize = originalFontSize;
            win.contents.fontFace = originalFontFace;
            return totalW;

        } else if (token.type === 'icon') {
            var margin = TagSystem.Params.bgBlockMargin;
            var lh = win.lineHeight();
            var maxScale = iconParams.maxIconScale;
            var ratio = Math.min((lh * maxScale) / iconParams.iconHeight, maxScale);
            if (token.iconScale && token.iconScale > 1) ratio = Math.min(ratio * token.iconScale, maxScale);
            return iconParams.iconWidth * ratio + margin;
        }
        return 0;
    }

    // ------------------------------------------------------------------------
    // 5. 核心：Hook 系统 (智能布局与行数限制)
    // ------------------------------------------------------------------------
    var _Scene_Status_createCustomExtWindow = Scene_Status.prototype.createCustomExtWindow;
    Scene_Status.prototype.createCustomExtWindow = function() {
        if (_Scene_Status_createCustomExtWindow) {
            _Scene_Status_createCustomExtWindow.call(this);
        }

        if (this._customExtWindow) {
             var win = this._customExtWindow;
             var proto = win.constructor.prototype;

             if (!proto._isGeminiWrappedV17) {
                 console.log("Gemini_TagSystem_WrappingPatch v1.8: 图标解析修复版已加载。");
                 
                 // 预计算布局
                 proto.layoutTextAndLimit = function(text, maxWidth, maxLines) {
                    if (!text) return { lines: [], height: 0, lineCount: 0 };
                    if (maxLines <= 0) return { lines: [], height: 0, lineCount: 0 };

                    // 调用新的解析器
                    var tokens = TagSystem.parseStyledText(text);
                    var lines = [];
                    var currentLine = [];
                    var currentLineW = 0;
                    var suffixW = this.textWidth(SUFFIX_TEXT);
                    
                    var items = [];
                    for (var i = 0; i < tokens.length; i++) {
                        var t = tokens[i];
                        if (t.type === 'text') {
                            var chars = t.content.split('');
                            for (var c = 0; c < chars.length; c++) {
                                items.push({ type: 'char', content: chars[c], width: this.textWidth(chars[c]) });
                            }
                        } else {
                            items.push({ type: 'token', token: t, width: calcTokenWidth(this, t) });
                        }
                    }

                    for (var i = 0; i < items.length; i++) {
                        var item = items[i];
                        if (currentLineW + item.width > maxWidth) {
                            lines.push(currentLine);
                            if (lines.length >= maxLines) {
                                var lastLine = lines[lines.length - 1];
                                var w = 0;
                                lastLine.forEach(function(it){ w += it.width; });
                                while (lastLine.length > 0 && w + suffixW > maxWidth) {
                                    var popped = lastLine.pop();
                                    w -= popped.width;
                                }
                                lastLine.push({ type: 'char', content: SUFFIX_TEXT, width: suffixW });
                                return { lines: lines, height: lines.length * paramLineHeight, lineCount: lines.length };
                            }
                            currentLine = [];
                            currentLineW = 0;
                        }
                        currentLine.push(item);
                        currentLineW += item.width;
                    }
                    if (currentLine.length > 0) lines.push(currentLine);
                    return { lines: lines, height: lines.length * paramLineHeight, lineCount: lines.length };
                 };

                 // 绘制布局
                 proto.drawLayoutLines = function(layoutData, x, y, align) {
                     var lh = paramLineHeight;
                     var currentY = y;
                     var initialColor = this.contents.textColor; 

                     for (var l = 0; l < layoutData.lines.length; l++) {
                         var lineItems = layoutData.lines[l];
                         var currentX = x;
                         for (var i = 0; i < lineItems.length; i++) {
                             var item = lineItems[i];
                             if (item.type === 'char') {
                                 this.drawText(item.content, currentX, currentY, 2000, 'left');
                                 currentX += item.width;
                             } else if (item.type === 'token') {
                                 var textState = { x: currentX, y: currentY, height: lh, index: 0 };
                                 var token = item.token;
                                 
                                 if (token.type === 'icon') {
                                     // 委托给 IconsPatch 的方法
                                     if (this.drawIconBlock) {
                                        this.drawIconBlock(token, textState);
                                     }
                                 } else if (token.type === 'styled') {
                                     if (token.parts && this.drawStyledTextWithIcons) {
                                         // 有内部图标结构 -> 委托给 IconsPatch
                                         this.drawStyledTextWithIcons(token, textState);
                                     } else {
                                         // 无内部结构 -> 使用兼容 Hex 的绘制
                                         this.drawStyledTextBlock(token, textState);
                                     }
                                 }
                                 this.contents.textColor = initialColor;
                                 currentX = textState.x;
                             }
                         }
                         currentY += lh;
                     }
                 };

                 // 覆盖 drawTagContent (保持原样)
                 proto.drawTagContent = function(rect, tag) {
                    if (!tag) return;
                    var oldSize = this.contents.fontSize;
                    this.contents.fontSize = paramFontSize;
                    var lh = paramLineHeight;
                    var px = rect.x + 6;
                    var py = rect.y + 6;
                    var pw = rect.width - 12;
                    var currentY = py + paramLabelNameOffsetY;
                    var phase = (this._actor && typeof this._actor.getTagPhase === 'function') ? this._actor.getTagPhase() : 0;

                    this.changeTextColor(this.normalColor());
                    var nameW = this.textWidth(tag.name);
                    var nameX = px + (pw - nameW) / 2; 
                    this.drawText(tag.name, nameX, currentY, 2000, 'left');
                    currentY += lh + paramNamePadding;

                    this.contents.fillRect(px, currentY, pw, 1, finalLineStyle);
                    currentY += (1 + paramLinePadding); 

                    this.changeTextColor(this.textColor(paramLabelColorIndex));
                    this.drawText("✦介绍", px, currentY, 2000, 'left');
                    currentY += lh;
                    
                    this.resetTextColor();
                    var layoutNote = this.layoutTextAndLimit(tag.note || "", pw, 2);
                    this.drawLayoutLines(layoutNote, px, currentY, 'left');
                    currentY += layoutNote.height;

                    currentY += lh * 0.5;

                    if (tag.tier === 2) {
                        this.changeTextColor(this.textColor(paramLabelColorIndex));
                        this.drawText("✦效果", px, currentY, 2000, 'left');
                        currentY += lh;
                        var usedLines = layoutNote.lineCount;
                        var limitPos = Math.min(2, 5 - usedLines);
                        this.changeTextColor((phase === 0) ? COLOR_POS_BLUE : this.normalColor());
                        var layoutPos = this.layoutTextAndLimit("正:" + (tag.effect || ""), pw, limitPos);
                        this.drawLayoutLines(layoutPos, px, currentY, 'left');
                        currentY += layoutPos.height;
                        usedLines += layoutPos.lineCount;
                        var limitNeg = Math.min(2, 5 - usedLines);
                        this.changeTextColor((phase === 1) ? COLOR_NEG_PURPLE : this.normalColor());
                        var layoutNeg = this.layoutTextAndLimit("逆:" + (tag.reverseEffect || ""), pw, limitNeg);
                        this.drawLayoutLines(layoutNeg, px, currentY, 'left');
                    } else {
                        this.changeTextColor(this.textColor(paramLabelColorIndex));
                        this.drawText("✦效果", px, currentY, 2000, 'left');
                        currentY += lh;
                        this.resetTextColor();
                        var limitEffect = Math.min(2, 5 - layoutNote.lineCount);
                        var layoutEffect = this.layoutTextAndLimit(tag.effect || "", pw, limitEffect);
                        this.drawLayoutLines(layoutEffect, px, currentY, 'left');
                    }
                    this.contents.fontSize = oldSize;
                 };
                 proto._isGeminiWrappedV17 = true;
             }
        }
    };
})();