/*:
 * @plugindesc (v5.1 品质分级版) 修复文字遮挡，支持Tier 1-4独立皮肤与背景。
 * @author Gemini
 *
 * @param --- Skin Files (Border) ---
 * @default
 *
 * @param Skin: Default
 * @parent --- Skin Files (Border) ---
 * @text 默认/空格子边框皮肤
 * @default Window
 * @require 1
 * @dir img/system/
 * @type file
 * @desc 用于绘制边框的Window皮肤文件(img/system/)。
 *
 * @param Skin: Tier 1
 * @parent --- Skin Files (Border) ---
 * @text Tier 1 边框皮肤
 * @default Window
 * @require 1
 * @dir img/system/
 * @type file
 *
 * @param Skin: Tier 2
 * @parent --- Skin Files (Border) ---
 * @text Tier 2 边框皮肤
 * @default Window
 * @require 1
 * @dir img/system/
 * @type file
 *
 * @param Skin: Tier 3
 * @parent --- Skin Files (Border) ---
 * @text Tier 3 边框皮肤
 * @default Window
 * @require 1
 * @dir img/system/
 * @type file
 *
 * @param Skin: Tier 4
 * @parent --- Skin Files (Border) ---
 * @text Tier 4 边框皮肤
 * @default Window
 * @require 1
 * @dir img/system/
 * @type file
 * @desc 原装备位，现对应 Tier 4 品质。
 *
 * @param --- Background Images (img/pictures/) ---
 * @default
 *
 * @param Bg: Default
 * @parent --- Background Images (img/pictures/) ---
 * @text 默认/空格子背景图
 * @require 1
 * @dir img/pictures/
 * @type file
 * @desc 显示在文字后方的独立背景图。留空则使用皮肤纹理。
 *
 * @param Bg: Tier 1
 * @parent --- Background Images (img/pictures/) ---
 * @text Tier 1 背景图
 * @require 1
 * @dir img/pictures/
 * @type file
 *
 * @param Bg: Tier 2
 * @parent --- Background Images (img/pictures/) ---
 * @text Tier 2 背景图
 * @require 1
 * @dir img/pictures/
 * @type file
 *
 * @param Bg: Tier 3
 * @parent --- Background Images (img/pictures/) ---
 * @text Tier 3 背景图
 * @require 1
 * @dir img/pictures/
 * @type file
 *
 * @param Bg: Tier 4
 * @parent --- Background Images (img/pictures/) ---
 * @text Tier 4 背景图
 * @require 1
 * @dir img/pictures/
 * @type file
 * @desc 原装备位，现对应 Tier 4 品质。
 *
 * @param --- Settings ---
 * @default
 *
 * @param Opacity
 * @parent --- Settings ---
 * @text 背景不透明度
 * @type number
 * @min 0
 * @max 255
 * @default 160
 * @desc 背景图或皮肤纹理的透明度。
 *
 * @param Skin Layout Mode
 * @parent --- Settings ---
 * @text 皮肤布局模式(用于边框)
 * @type select
 * @option Standard MV (标准MV格式)
 * @value Standard
 * @option Quadrant (四等分格式)
 * @value Quadrant
 * @default Quadrant
 * @desc 您的素材请选择 [Quadrant]。
 *
 * @param Background Type
 * @parent --- Settings ---
 * @text 皮肤纹理回退模式
 * @type select
 * @option Tile (平铺)
 * @value Tile
 * @option Stretch (拉伸)
 * @value Stretch
 * @default Stretch
 * @desc 当没有设置独立背景图时，如何绘制 Window 皮肤里的纹理。
 *
 * @param Background Quadrant
 * @parent --- Settings ---
 * @text [四等分] 纹理回退位置
 * @type select
 * @option Top-Left (左上角)
 * @value TL
 * @option Bottom-Left (左下角)
 * @value BL
 * @default TL
 *
 * @param Corner Size
 * @parent --- Settings ---
 * @text 源图片边角大小
 * @type number
 * @default 24
 * @desc 素材原本的角落尺寸。
 *
 * @param Text Margin
 * @parent --- Settings ---
 * @text 文字内边距
 * @type number
 * @default 4
 * @desc 文字距离边框内沿的额外空隙(像素)。
 *
 * @param Right Border Offset
 * @parent --- Settings ---
 * @text 右边框读取偏移
 * @type number
 * @min -24
 * @max 24
 * @default 0
 * @desc 修复右边框切割问题。
 *
 * @param Override Tier Colors
 * @parent --- Settings ---
 * @text 是否覆盖Tier颜色
 * @type boolean
 * @default false
 *
 * @help
 * ============================================================================
 * 更新说明 v5.1 (Tier 4 支持)
 * ============================================================================
 * 1. [逻辑变更]：
 * 移除了“检测到是武器/护甲就强制使用Equip皮肤”的逻辑。
 * 现在完全基于 Tier (品质) 来判断。
 *
 * 2. [Tier 4]：
 * 新增了 Tier 4 的边框和背景设置。
 * 如果您使用了 TagSystem 并将装备设为 Tier 4，它们将使用此处的设置。
 *
 * 必须放在 YEP_StatusMenu_CustomWindow 下方。
 * ============================================================================
 */

(function() {
    var parameters = PluginManager.parameters('Gemini_YEP_Status_Skin_Injection');
    
    // 1. 读取皮肤文件名 (system)
    var skinNames = {
        'default': String(parameters['Skin: Default'] || 'Window'),
        'tier1':   String(parameters['Skin: Tier 1'] || 'Window'),
        'tier2':   String(parameters['Skin: Tier 2'] || 'Window'),
        'tier3':   String(parameters['Skin: Tier 3'] || 'Window'),
        'tier4':   String(parameters['Skin: Tier 4'] || 'Window') // Changed from equip
    };

    // 2. 读取背景图片名 (pictures)
    var bgNames = {
        'default': String(parameters['Bg: Default'] || ''),
        'tier1':   String(parameters['Bg: Tier 1'] || ''),
        'tier2':   String(parameters['Bg: Tier 2'] || ''),
        'tier3':   String(parameters['Bg: Tier 3'] || ''),
        'tier4':   String(parameters['Bg: Tier 4'] || '') // Changed from equip
    };

    var bgOpacity = Number(parameters['Opacity'] || 160);
    var layoutMode = String(parameters['Skin Layout Mode'] || 'Quadrant');
    var bgFallbackType = String(parameters['Background Type'] || 'Stretch');
    var bgQuadPos = String(parameters['Background Quadrant'] || 'TL');
    var cornerSize = Number(parameters['Corner Size'] || 24);
    var textMargin = Number(parameters['Text Margin'] || 4);
    var rightOffset = Number(parameters['Right Border Offset'] || 0);
    var overrideTier = (parameters['Override Tier Colors'] === 'true');

    var yepParams = PluginManager.parameters('YEP_StatusMenu_CustomWindow');
    var yepBorderScale = Number(yepParams['Window Border Scale'] || 0.5);

    // 获取皮肤切片坐标 (用于边框和回退纹理)
    function getSkinCoords(skin) {
        var sw = skin.width;
        var sh = skin.height;
        if (sw <= 0 || sh <= 0) return null;

        if (layoutMode === 'Quadrant') {
            var halfW = Math.floor(sw / 2);
            var halfH = Math.floor(sh / 2);
            var fx = halfW; var fy = 0; var fw = halfW; var fh = halfH;
            var bx = 0; var by = 0;
            if (bgQuadPos === 'BL') by = halfH;
            return { fx: fx, fy: fy, fw: fw, fh: fh, bx: bx, by: by, bw: halfW, bh: halfH };
        } else {
            return { fx: 64, fy: 0, fw: 128, fh: 128, bx: 0, by: 0, bw: 64, bh: 64 };
        }
    }

    // 辅助：根据Tag获取Key
    function getTagKey(tag) {
        if (!tag) return 'default';
        
        // 纯粹根据 Tier 判断，不再检测 isWeapon/isArmor
        if (tag.tier !== undefined) {
            if (tag.tier === 1) return 'tier1';
            if (tag.tier === 2) return 'tier2';
            if (tag.tier === 3) return 'tier3';
            if (tag.tier === 4) return 'tier4';
        }
        
        return 'default';
    }

    var _Scene_Status_createCustomExtWindow = Scene_Status.prototype.createCustomExtWindow;
    
    Scene_Status.prototype.createCustomExtWindow = function() {
        if (_Scene_Status_createCustomExtWindow) {
            _Scene_Status_createCustomExtWindow.call(this);
        }

        if (this._customExtWindow) {
            var win = this._customExtWindow;
            
            // --- 资源预加载 ---
            win._skins = {};
            win._bgImgs = {};
            ['default', 'tier1', 'tier2', 'tier3', 'tier4'].forEach(function(key) {
                // 加载 img/system/ 下的皮肤
                win._skins[key] = ImageManager.loadSystem(skinNames[key]);
                // 加载 img/pictures/ 下的背景图 (如果设置了)
                if (bgNames[key]) {
                    win._bgImgs[key] = ImageManager.loadPicture(bgNames[key]);
                }
            });

            // 获取 Window 皮肤 (用于边框和回退)
            win.getGeminiSkin = function(key) {
                var skin = this._skins[key];
                if (skin && skin.width > 0) return skin;
                if (this._skins['default'] && this._skins['default'].width > 0) return this._skins['default'];
                return this.windowskin;
            };

            // 获取独立背景图
            win.getGeminiBgImg = function(key) {
                var img = this._bgImgs[key];
                if (img && img.width > 0) return img;
                return null; // 没有设置或未加载好
            };

            // ================================================================
            // 覆盖 A: drawDarkRect (空格子)
            // ================================================================
            var _orig_drawDarkRect = win.drawDarkRect;
            win.drawDarkRect = function(dx, dy, dw, dh) {
                dx = Math.floor(dx); dy = Math.floor(dy);
                dw = Math.floor(dw); dh = Math.floor(dh);

                var key = 'default';
                var skin = this.getGeminiSkin(key);
                var bgImg = this.getGeminiBgImg(key);
                
                // 安全检查：至少要有皮肤才能画边框
                if (!skin || skin.width <= 0) {
                    if (_orig_drawDarkRect) _orig_drawDarkRect.call(this, dx, dy, dw, dh);
                    else this.contents.fillRect(dx, dy, dw, dh, 'rgba(0,0,0,0.5)');
                    return;
                }
                
                var coords = getSkinCoords(skin);
                if (coords) {
                    // 1. 画背景 (优先独立图，其次皮肤纹理)
                    this.drawGeminiBackground(dx, dy, dw, dh, skin, coords, bgImg);
                    // 2. 画边框
                    this.drawGeminiBorder(dx, dy, dw, dh, skin, coords);
                }
            };

            // ================================================================
            // 覆盖 B: drawTierBackground (有内容的格子)
            // ================================================================
            var _orig_drawTierBackground = win.drawTierBackground;
            win.drawTierBackground = function(rect, tag) {
                var x = Math.floor(rect.x); var y = Math.floor(rect.y);
                var w = Math.floor(rect.width); var h = Math.floor(rect.height);

                var key = getTagKey(tag);
                var skin = this.getGeminiSkin(key);
                var bgImg = this.getGeminiBgImg(key);
                var coords = skin ? getSkinCoords(skin) : null;

                // 1. 底层背景
                if (skin && coords) {
                    this.drawGeminiBackground(x, y, w, h, skin, coords, bgImg);
                }
                // 2. 中层 Tier 颜色
                if (!overrideTier && _orig_drawTierBackground) {
                    var fixRect = { x: x, y: y, width: w, height: h };
                    _orig_drawTierBackground.call(this, fixRect, tag);
                }
                // 3. 上层边框
                if (skin && coords) {
                    this.drawGeminiBorder(x, y, w, h, skin, coords);
                }
            };

            // ================================================================
            // 覆盖 C: drawTagContent (文字防遮挡 - 保持不变)
            // ================================================================
            var _orig_drawTagContent = win.drawTagContent;
            win.drawTagContent = function(rect, tag) {
                var borderThick = Math.floor(cornerSize * yepBorderScale);
                var totalSafePad = borderThick + textMargin;
                var yepHardcodedPad = 6;
                var extraOffset = Math.max(0, totalSafePad - yepHardcodedPad);

                if (extraOffset > 0) {
                    var safeRect = {
                        x: rect.x + extraOffset,
                        y: rect.y + extraOffset,
                        width: rect.width - (extraOffset * 2),
                        height: rect.height - (extraOffset * 2)
                    };
                    _orig_drawTagContent.call(this, safeRect, tag);
                } else {
                    _orig_drawTagContent.call(this, rect, tag);
                }
            };

            // ================================================================
            // 覆盖 D: drawWindowSkinBorder (禁用原版)
            // ================================================================
            win.drawWindowSkinBorder = function(rect) {};

            // ================================================================
            // 核心辅助：绘制背景
            // ================================================================
            win.drawGeminiBackground = function(dx, dy, dw, dh, skin, coords, bgImg) {
                var contents = this.contents;
                contents.context.save();
                var pad = 2; // 内缩一点
                var inX = dx + pad; var inY = dy + pad;
                var inW = dw - pad * 2; var inH = dh - pad * 2;

                if (inW > 0 && inH > 0) {
                    contents.paintOpacity = bgOpacity;
                    
                    // 优先判断是否有独立背景图
                    if (bgImg) {
                        // 有独立图 -> 拉伸铺满
                        contents.blt(bgImg, 0, 0, bgImg.width, bgImg.height, inX, inY, inW, inH);
                    } else {
                        // 没有独立图 -> 回退到使用 Window 皮肤的纹理
                        if (bgFallbackType === 'Stretch') {
                            contents.blt(skin, coords.bx, coords.by, coords.bw, coords.bh, inX, inY, inW, inH);
                        } else {
                            // Tile mode
                            for (var yy = 0; yy < inH; yy += coords.bh) {
                                for (var xx = 0; xx < inW; xx += coords.bw) {
                                    var drawW = Math.min(coords.bw, inW - xx);
                                    var drawH = Math.min(coords.bh, inH - yy);
                                    contents.blt(skin, coords.bx, coords.by, drawW, drawH, inX + xx, inY + yy, drawW, drawH);
                                }
                            }
                        }
                    }
                    contents.paintOpacity = 255;
                }
                contents.context.restore();
            };

            // ================================================================
            // 核心辅助：绘制边框 (保持不变)
            // ================================================================
            win.drawGeminiBorder = function(x, y, w, h, skin, coords) {
                var p = cornerSize; 
                var dp = Math.floor(p * yepBorderScale); 
                var fx = coords.fx; var fy = coords.fy;
                var fw = coords.fw; var fh = coords.fh;
                var contents = this.contents;
                var srcRightX = fx + fw - p + rightOffset;

                if (w < dp * 2 || h < dp * 2) {
                    contents.blt(skin, fx, fy, fw, fh, x, y, w, h);
                } else {
                    // UL, UR, BL, BR
                    contents.blt(skin, fx, fy, p, p, x, y, dp, dp); 
                    contents.blt(skin, srcRightX, fy, p, p, x + w - dp, y, dp, dp); 
                    contents.blt(skin, fx, fy + fh - p, p, p, x, y + h - dp, dp, dp); 
                    contents.blt(skin, srcRightX, fy + fh - p, p, p, x + w - dp, y + h - dp, dp, dp); 
                    // Top, Bottom, Left, Right
                    contents.blt(skin, fx + p, fy, fw - p*2, p, x + dp, y, w - dp*2, dp); 
                    contents.blt(skin, fx + p, fy + fh - p, fw - p*2, p, x + dp, y + h - dp, w - dp*2, dp); 
                    contents.blt(skin, fx, fy + p, p, fh - p*2, x, y + dp, dp, h - dp*2); 
                    contents.blt(skin, srcRightX, fy + p, p, fh - p*2, x + w - dp, y + dp, dp, h - dp*2); 
                }
            };
        }
    };

})();