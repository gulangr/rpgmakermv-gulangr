/*:
 * @plugindesc (v1.2) TagSystem 图标修复版 - 自动重绘+预加载
 * @author Gemini
 *
 * @param CustomIconSet
 * @text 自定义图标集文件名
 * @desc 位于 img/system/ 文件夹下的图片文件名（无需.png后缀）。
 * @default IconSet
 *
 * @help
 * ============================================================================
 * Gemini TagSystem Icon Patch (v1.2 修复版)
 * ============================================================================
 * 修复了初次显示时图标可能为空白的问题。
 *
 * 【更新说明 v1.2】
 * 1. 新增：图片加载监听器。如果图片尚未读取完成，窗口会在读取完成后自动刷新。
 * 2. 新增：预加载机制。游戏启动时会自动预读图标集，减少延迟。
 *
 * 【使用方法】
 * 在 TagSystem 的标签文本中，使用 \icon[n] 语法。
 * 示例：【\icon[64]强力攻击】
 *
 * ============================================================================
 */

var Imported = Imported || {};
Imported.Gemini_TagSystem_IconPatch = true;

var Gemini = Gemini || {};
Gemini.IconPatch = Gemini.IconPatch || {};

(function() {
    'use strict';

    var parameters = PluginManager.parameters('Gemini_TagSystem_IconPatch');
    var customIconSetFile = parameters['CustomIconSet'] || 'IconSet';

    Gemini.IconPatch.loadCustomIconSet = function() {
        return ImageManager.loadSystem(customIconSetFile);
    };

    // --- 修复点1：在场景启动时预加载图片 ---
    var _Scene_Boot_loadSystemImages = Scene_Boot.prototype.loadSystemImages;
    Scene_Boot.prototype.loadSystemImages = function() {
        _Scene_Boot_loadSystemImages.call(this);
        Gemini.IconPatch.loadCustomIconSet();
    };

    // 覆盖 TagSystem 方法
    var _Window_Base_drawStyledTextBlock = Window_Base.prototype.drawStyledTextBlock;
    
    Window_Base.prototype.drawStyledTextBlock = function(styledItem, textState) {
        if (styledItem.content && styledItem.content.match(/\\icon\[(\d+)\]/i)) {
            this.drawStyledTextBlockWithIcons(styledItem, textState);
        } else {
            _Window_Base_drawStyledTextBlock.call(this, styledItem, textState);
        }
    };

    Window_Base.prototype.drawStyledTextBlockWithIcons = function(styledItem, textState) {
        const rawContent = styledItem.content;
        const segments = this.parseIconSegments(rawContent);

        // 1. 保存状态
        const originalFontSize = this.contents.fontSize;
        const originalFontFace = this.contents.fontFace;
        const ctx = this.contents._context; 

        // 2. TagSystem 核心尺寸计算逻辑
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
            // 清理环境
            this.contents.outlineWidth = 0;
            this.contents.outlineColor = 'rgba(0,0,0,0)';
            this.contents.fontFace = TagSystem.Params.tagFontName;
            this.contents.fontSize = renderFontSize;

            // 3. 计算宽度
            var totalVisualWidth = 0;
            const lineHeight = this.lineHeight(); 

            for (var i = 0; i < segments.length; i++) {
                var seg = segments[i];
                if (seg.type === 'text') {
                    var rawSegWidth = this.textWidth(seg.value);
                    seg.width = rawSegWidth * scaleRatio; 
                    totalVisualWidth += seg.width;
                } else if (seg.type === 'icon') {
                    seg.width = lineHeight; // 图标宽度 = 行高
                    totalVisualWidth += seg.width;
                }
            }

            // 4. 背景计算
            const baseBgHeight = originalFontSize * TagSystem.Params.bgHeightRatio;
            const baseBgWidth = totalVisualWidth * TagSystem.Params.bgWidthScale + TagSystem.Params.bgHorizontalPadding * 2;
            const singleSideExpand = (baseBgWidth - totalVisualWidth) / 2;

            const bgX = textState.x + margin;
            const bgY = textState.y + TagSystem.Params.bgBaselineOffset + (this.lineHeight() - baseBgHeight) / 2;
            
            // 5. 绘制背景
            const bgColorId = styledItem.bgColorId;
            if (bgColorId > 0 && bgColorId <= 15) {
                const bgColor = this.textColor(bgColorId);
                ctx.save();
                ctx.fillStyle = bgColor;
                ctx.globalAlpha = TagSystem.Params.bgOpacity;
                
                if (ctx.fillRoundedRect) {
                    ctx.fillRoundedRect(bgX, bgY, baseBgWidth, baseBgHeight, TagSystem.Params.bgBorderRadius);
                } else {
                    ctx.fillRect(bgX, bgY, baseBgWidth, baseBgHeight);
                }

                if (TagSystem.Params.bgStrokeWidth > 0 && ctx.strokeRoundedRect) {
                    ctx.globalAlpha = 1.0;
                    ctx.lineWidth = TagSystem.Params.bgStrokeWidth;
                    ctx.strokeStyle = TagSystem.Params.bgStrokeColor;
                    ctx.strokeRoundedRect(bgX, bgY, baseBgWidth, baseBgHeight, TagSystem.Params.bgBorderRadius);
                }
                ctx.restore();
            }

            // 6. 绘制内容
            var currentX = bgX + singleSideExpand; 
            const ty = textState.y + lineHeight / 2 + TagSystem.Params.textBaselineOffset;
            const iconBitmap = Gemini.IconPatch.loadCustomIconSet();

            // --- 修复点2：如果图片未就绪，添加回调自动刷新窗口 ---
            if (!iconBitmap.isReady()) {
                // 当图片加载完成后，如果当前窗口有刷新功能，则执行刷新
                var windowInstance = this;
                iconBitmap.addLoadListener(function() {
                    if (windowInstance && typeof windowInstance.refresh === 'function') {
                        windowInstance.refresh();
                    }
                });
            }

            for (var i = 0; i < segments.length; i++) {
                var seg = segments[i];
                
                if (seg.type === 'text') {
                    ctx.save();
                    var fontStyle = '';
                    if (this.contents.fontItalic) fontStyle += 'italic ';
                    if (this.contents.fontBold) fontStyle += 'bold ';
                    ctx.font = fontStyle + renderFontSize + 'px "' + TagSystem.Params.tagFontName + '"';
                    ctx.fillStyle = this.textColor(styledItem.textColorId);
                    ctx.textBaseline = 'middle';

                    if (scaleRatio !== 1.0) {
                        ctx.scale(scaleRatio, scaleRatio);
                        ctx.fillText(seg.value, currentX / scaleRatio, ty / scaleRatio);
                    } else {
                        ctx.fillText(seg.value, currentX, ty);
                    }
                    ctx.restore();
                    currentX += seg.width;

                } else if (seg.type === 'icon') {
                    // 使用 blt 绘制
                    if (iconBitmap.isReady()) {
                        var iconIndex = seg.value;
                        var pw = 32; 
                        var ph = 32; 
                        var sx = iconIndex % 16 * pw;
                        var sy = Math.floor(iconIndex / 16) * ph;
                        
                        var dw = lineHeight;
                        var dh = lineHeight;
                        var dy = ty - (dh / 2); 

                        this.contents.blt(iconBitmap, sx, sy, pw, ph, currentX, dy, dw, dh);
                    } 
                    // 如果没ready，就留白，等待上面的 addLoadListener 触发刷新
                    currentX += seg.width;
                }
            }

            this.contents._dirty = true;
            textState.x = bgX + baseBgWidth + margin;

        } catch(e) {
            console.error("Gemini Icon Patch Error:", e);
        } finally {
            // 恢复
            this.contents.fontSize = originalFontSize;
            this.contents.fontFace = originalFontFace;
            this.changeTextColor(this.normalColor());
        }
    };

    Window_Base.prototype.parseIconSegments = function(text) {
        var segments = [];
        var regex = /\\icon\[(\d+)\]/gi;
        var current = 0;
        var match;
        
        while ((match = regex.exec(text)) !== null) {
            if (match.index > current) {
                segments.push({ type: 'text', value: text.substring(current, match.index) });
            }
            segments.push({ type: 'icon', value: parseInt(match[1]) });
            current = regex.lastIndex;
        }
        if (current < text.length) {
            segments.push({ type: 'text', value: text.substring(current) });
        }
        return segments;
    };

})();