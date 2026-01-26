/*:
 * @plugindesc (v3.5) YEP_StatusMenuCore 扩展 - 完美回溯与补丁兼容版
 * @author Target Code (Patch)
 *
 * @param --- Window Settings ---
 * @default
 *
 * @param Window X
 * @text 窗口 X 坐标
 * @parent --- Window Settings ---
 * @default 0
 *
 * @param Window Y
 * @text 窗口 Y 坐标
 * @parent --- Window Settings ---
 * @default 400
 *
 * @param Window Width
 * @text 窗口宽度
 * @parent --- Window Settings ---
 * @default 300
 *
 * @param Window Height
 * @text 窗口高度
 * @parent --- Window Settings ---
 * @default 400
 *
 * @param --- Grid Settings ---
 * @default
 *
 * @param Grid Columns
 * @text 网格列数
 * @parent --- Grid Settings ---
 * @desc 必须大于0
 * @default 2
 * @type number
 * @min 1
 *
 * @param Grid Rows
 * @text 网格行数
 * @parent --- Grid Settings ---
 * @desc 必须大于0
 * @default 2
 * @type number
 * @min 1
 *
 * @param Grid Padding
 * @text 网格间距
 * @parent --- Grid Settings ---
 * @default 8
 * @type number
 * @min 0
 *
 * @param Grid Color
 * @text 默认背景颜色
 * @parent --- Grid Settings ---
 * @default rgba(0, 0, 0, 0.5)
 *
 * @param --- Tier Colors ---
 * @default
 *
 * @param Tier 1 Color
 * @text 1级背景色 (纯色)
 * @parent --- Tier Colors ---
 * @default rgba(0, 100, 0, 0.6)
 *
 * @param Tier 2 Color Start
 * @text 2级渐变起始色
 * @parent --- Tier Colors ---
 * @default rgba(0, 100, 0, 0.6)
 *
 * @param Tier 2 Color End
 * @text 2级渐变结束色
 * @parent --- Tier Colors ---
 * @default rgba(150, 0, 0, 0.6)
 *
 * @param Tier 3 Color
 * @text 3级背景色 (纯色)
 * @parent --- Tier Colors ---
 * @default rgba(150, 0, 0, 0.6)
 *
 * @param Equip Tag Color
 * @text 装备标签背景色
 * @parent --- Tier Colors ---
 * @desc 武器/护甲标签的背景色 (银灰色)。
 * @default rgba(169, 169, 169, 0.6)
 *
 * @param --- Border Settings ---
 * @default
 *
 * @param Border Style
 * @text 边框样式
 * @parent --- Border Settings ---
 * @type select
 * @option Window Skin (默认窗口皮肤)
 * @value Window
 * @option Simple Line (简单线条)
 * @value Simple
 * @option None (无)
 * @value None
 * @default Window
 *
 * @param Window Border Scale
 * @text [Window] 边框缩放
 * @parent --- Border Settings ---
 * @default 0.50
 *
 * @param --- Plus Sign Settings ---
 * @default
 *
 * @param Draw Plus Sign
 * @text 是否绘制加号
 * @parent --- Plus Sign Settings ---
 * @type boolean
 * @on 绘制
 * @off 不绘制
 * @default true
 *
 * @param Plus Color
 * @text 加号颜色
 * @parent --- Plus Sign Settings ---
 * @default rgba(255, 255, 255, 0.15)
 *
 * @param Plus Size
 * @text 加号尺寸
 * @parent --- Plus Sign Settings ---
 * @type number
 * @default 14
 *
 * @param Plus Thickness
 * @text 加号粗细
 * @parent --- Plus Sign Settings ---
 * @type number
 * @default 2
 *
 * @param --- Content Settings ---
 * @default
 *
 * @param Label Name Offset Y
 * @text 标签名Y轴偏移
 * @parent --- Content Settings ---
 * @default 0
 * @type number
 *
 * @param Content Font Size
 * @text 内容字体大小
 * @parent --- Content Settings ---
 * @default 16
 * @type number
 *
 * @param Content Line Height
 * @text 内容行高
 * @parent --- Content Settings ---
 * @default 20
 * @type number
 *
 * @param Name Padding
 * @text 标签名下间距
 * @parent --- Content Settings ---
 * @default 4
 * @type number
 *
 * @param Line Color
 * @text 分割线颜色
 * @parent --- Content Settings ---
 * @desc 标签内部水平分割线的颜色 (RGB格式，如 255, 255, 255)。
 * @default 255, 255, 255
 *
 * @param Line Opacity
 * @text 分割线透明度
 * @parent --- Content Settings ---
 * @desc 分割线的不透明度 (0.0 到 1.0 之间)。
 * @default 0.3
 *
 * @param Line Padding
 * @text 分割线下间距
 * @parent --- Content Settings ---
 * @default 4
 * @type number
 *
 * @param Label Color Index
 * @text 标题颜色索引
 * @parent --- Content Settings ---
 * @desc "✦介绍" 和 "✦效果" 的颜色索引。3是绿色。
 * @default 3
 * @type number
 *
 * @param --- Test Button ---
 * @default
 *
 * @param Show Test Button
 * @text 显示测试按钮
 * @parent --- Test Button ---
 * @type boolean
 * @on 显示
 * @off 隐藏
 * @desc 是否在窗口中显示用于随机切换正逆练的测试按钮。
 * @default true
 *
 * @param Test Button Text
 * @text 按钮文本
 * @parent --- Test Button ---
 * @default 测试切换
 *
 * @param Test Button X
 * @text 按钮 X 坐标
 * @parent --- Test Button ---
 * @desc 相对窗口内容的坐标。
 * @default 10
 * @type number
 *
 * @param Test Button Y
 * @text 按钮 Y 坐标
 * @parent --- Test Button ---
 * @default 360
 * @type number
 *
 * @param Test Button Width
 * @text 按钮宽度
 * @parent --- Test Button ---
 * @default 100
 * @type number
 *
 * @param Test Button Height
 * @text 按钮高度
 * @parent --- Test Button ---
 * @default 30
 * @type number
 *
 * @help
 * ============================================================================
 * 介绍
 * ============================================================================
 * YEP_StatusMenuCore 的扩展插件 v3.5 (补丁完美兼容版)。
 * * 基于 v3.4 逻辑回退，确保了 Tier 2 品级标签显示效果的呼吸感与补丁兼容。
 * 必须确保 Gemini_YEP_Status_Skin_Injection 放在此插件下方。
 */

(function() {

    var parameters = PluginManager.parameters('YEP_StatusMenu_CustomWindow');
    
    // Window Settings
    var paramX = String(parameters['Window X'] || '0');
    var paramY = String(parameters['Window Y'] || '400');
    var paramW = String(parameters['Window Width'] || '300');
    var paramH = String(parameters['Window Height'] || '400');

    // Grid Settings
    var rawCols = Number(parameters['Grid Columns']);
    var paramCols = (isNaN(rawCols) || rawCols < 1) ? 2 : rawCols;
    var rawRows = Number(parameters['Grid Rows']);
    var paramRows = (isNaN(rawRows) || rawRows < 1) ? 2 : rawRows;
    var paramPadding = Number(parameters['Grid Padding'] || 8);
    var paramGridColor = String(parameters['Grid Color'] || 'rgba(0, 0, 0, 0.5)');

    // Tier Colors
    var paramTier1Color = String(parameters['Tier 1 Color'] || 'rgba(0, 100, 0, 0.6)');
    var paramTier2Start = String(parameters['Tier 2 Color Start'] || 'rgba(0, 100, 0, 0.6)');
    var paramTier2End   = String(parameters['Tier 2 Color End'] || 'rgba(150, 0, 0, 0.6)');
    var paramTier3Color = String(parameters['Tier 3 Color'] || 'rgba(150, 0, 0, 0.6)');
    var paramEquipColor = String(parameters['Equip Tag Color'] || 'rgba(169, 169, 169, 0.6)'); 

    // Border Settings
    var paramBorderStyle = String(parameters['Border Style'] || 'Window');
    var paramWinScale = Number(parameters['Window Border Scale'] || 0.5);

    // Plus Sign Settings
    var paramDrawPlus = String(parameters['Draw Plus Sign'] || 'true') === 'true';
    var paramPlusColor = String(parameters['Plus Color'] || 'rgba(255, 255, 255, 0.15)');
    var paramPlusSize = Number(parameters['Plus Size'] || 14);
    var paramPlusThickness = Number(parameters['Plus Thickness'] || 2);
    
    // Content Settings
    var paramLabelNameOffsetY = Number(parameters['Label Name Offset Y'] || 0);
    var paramFontSize = Number(parameters['Content Font Size'] || 16);
    var paramLineHeight = Number(parameters['Content Line Height'] || 20);
    var paramNamePadding = Number(parameters['Name Padding'] || 4);
    var paramLinePadding = Number(parameters['Line Padding'] || 4);
    var paramLabelColorIndex = Number(parameters['Label Color Index'] || 3);

    // 自定义分割线颜色逻辑
    var paramLineColor = String(parameters['Line Color'] || '255, 255, 255');
    var paramLineOpacity = Number(parameters['Line Opacity'] || 0.3);
    var finalLineStyle = 'rgba(' + paramLineColor + ',' + paramLineOpacity + ')';

    // Test Button Settings
    var paramShowTestBtn = String(parameters['Show Test Button'] || 'true') === 'true';
    var paramTestBtnText = String(parameters['Test Button Text'] || '测试切换');
    var paramTestBtnX = Number(parameters['Test Button X'] || 10);
    var paramTestBtnY = Number(parameters['Test Button Y'] || 360);
    var paramTestBtnW = Number(parameters['Test Button Width'] || 100);
    var paramTestBtnH = Number(parameters['Test Button Height'] || 30);

    var COLOR_POS_BLUE = '#66ccff';
    var COLOR_NEG_PURPLE = '#ea80fc';

    if (!Imported.YEP_StatusMenuCore) return;

    //-----------------------------------------------------------------------------
    // Window_StatusCustomExt
    //-----------------------------------------------------------------------------
    
    function Window_StatusCustomExt() {
        this.initialize.apply(this, arguments);
    }

    Window_StatusCustomExt.prototype = Object.create(Window_Base.prototype);
    Window_StatusCustomExt.prototype.constructor = Window_StatusCustomExt;

    Window_StatusCustomExt.prototype.initialize = function() {
        var x = eval(paramX), y = eval(paramY), width = eval(paramW), height = eval(paramH);
        Window_Base.prototype.initialize.call(this, x, y, width || 300, height || 400);
        this.loadWindowskin();
        this._actor = null;
    };

    Window_StatusCustomExt.prototype.setActor = function(actor) {
        this._actor = actor;
        this.refresh();
    };

    Window_StatusCustomExt.prototype.update = function() {
        Window_Base.prototype.update.call(this);
        this.processTestButton();
    };

    Window_StatusCustomExt.prototype.processTestButton = function() {
        if (!paramShowTestBtn || !this._actor) return;
        if (TouchInput.isTriggered()) {
            var x = this.canvasToLocalX(TouchInput.x), y = this.canvasToLocalY(TouchInput.y);
            if (x >= paramTestBtnX && x <= paramTestBtnX + paramTestBtnW &&
                y >= paramTestBtnY && y <= paramTestBtnY + paramTestBtnH) {
                SoundManager.playOk();
                this._actor._tagPhase = Math.random() < 0.5 ? 0 : 1;
                this._actor.refresh();
                this.refresh();
                this.activate();
            }
        }
    };

    Window_StatusCustomExt.prototype.itemRect = function(index) {
        var rect = new Rectangle();
        var maxCols = paramCols, maxRows = paramRows, padding = paramPadding;
        var totalW = this.contents.width || 1, totalH = this.contents.height || 1;
        var cellWidth = (totalW - (maxCols - 1) * padding) / maxCols;
        var cellHeight = (totalH - (maxRows - 1) * padding) / maxRows;
        rect.x = Math.floor((index % maxCols) * (cellWidth + padding));
        rect.y = Math.floor(Math.floor(index / maxCols) * (cellHeight + padding));
        rect.width = Math.floor(cellWidth);
        rect.height = Math.floor(cellHeight);
        return rect;
    };

    // 绘制空格子背景 (Gemini 补丁的主要注入点)
    Window_StatusCustomExt.prototype.drawDarkRect = function(dx, dy, dw, dh) {
        this.contents.fillRect(dx, dy, dw, dh, paramGridColor);
    };

    // 绘制标签背景 (Gemini 补丁的主要注入点)
    Window_StatusCustomExt.prototype.drawTierBackground = function(rect, tag) {
        var ctx = this.contents.context;
        var tier = tag.tier || 1;
        if (tag.isEquip) {
            this.contents.fillRect(rect.x, rect.y, rect.width, rect.height, paramEquipColor);
            return;
        }
        if (tier === 1) {
            this.contents.fillRect(rect.x, rect.y, rect.width, rect.height, paramTier1Color);
        } else if (tier === 3) {
            this.contents.fillRect(rect.x, rect.y, rect.width, rect.height, paramTier3Color);
        } else if (tier === 2) {
            ctx.save();
            var grad = ctx.createLinearGradient(rect.x, rect.y, rect.x + rect.width, rect.y);
            grad.addColorStop(0, paramTier2Start); grad.addColorStop(1, paramTier2End);
            ctx.fillStyle = grad; ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
            ctx.restore();
        } else {
            this.drawDarkRect(rect.x, rect.y, rect.width, rect.height);
        }
    };

    Window_StatusCustomExt.prototype.drawWindowSkinBorder = function(rect) {
        if (!this.windowskin) return;
        var scale = paramWinScale, skin = this.windowskin;
        var sC = 24, sE = 16, dC = sC * scale;
        var dW = rect.width - dC * 2, dH = rect.height - dC * 2;
        this.contents.blt(skin, 64, 0, sC, sC, rect.x, rect.y, dC, dC);
        this.contents.blt(skin, 64+sC+sE, 0, sC, sC, rect.x+rect.width-dC, rect.y, dC, dC);
        this.contents.blt(skin, 64, 0+sC+sE, sC, sC, rect.x, rect.y+rect.height-dC, dC, dC);
        this.contents.blt(skin, 64+sC+sE, 0+sC+sE, sC, sC, rect.x+rect.width-dC, rect.y+rect.height-dC, dC, dC);
        if (dW > 0) {
            this.contents.blt(skin, 64+sC, 0, sE, sC, rect.x+dC, rect.y, dW, dC);
            this.contents.blt(skin, 64+sC, 0+sC+sE, sE, sC, rect.x+dC, rect.y+rect.height-dC, dW, dC);
        }
        if (dH > 0) {
            this.contents.blt(skin, 64, 0+sC, sC, sE, rect.x, rect.y+dC, dC, dH);
            this.contents.blt(skin, 64+sC+sE, 0+sC, sC, sE, rect.x+rect.width-dC, rect.y+dC, dC, dH);
        }
    };

    Window_StatusCustomExt.prototype.drawSimpleBorder = function(rect) {
        var color = 'rgba(255, 255, 255, 0.5)', thick = 1;
        this.contents.fillRect(rect.x, rect.y, rect.width, thick, color);
        this.contents.fillRect(rect.x, rect.y + rect.height - thick, rect.width, thick, color);
        this.contents.fillRect(rect.x, rect.y, thick, rect.height, color);
        this.contents.fillRect(rect.x + rect.width - thick, rect.y, thick, rect.height, color);
    };

    Window_StatusCustomExt.prototype.drawPlusSign = function(rect) {
        var c = paramPlusColor, s = paramPlusSize, t = paramPlusThickness;
        var cx = rect.x + rect.width / 2, cy = rect.y + rect.height / 2;
        this.contents.fillRect(cx - s / 2, cy - t / 2, s, t, c);
        this.contents.fillRect(cx - t / 2, cy - s / 2, t, s, c);
    };

    // 绘制标签内容 (Gemini 补丁的文字偏移注入点)
    Window_StatusCustomExt.prototype.drawTagContent = function(rect, tag) {
        if (!tag) return;
        var oldSize = this.contents.fontSize;
        this.contents.fontSize = paramFontSize;
        var lh = paramLineHeight, px = rect.x + 6, py = rect.y + 6, pw = rect.width - 12;
        var currentY = py + paramLabelNameOffsetY;
        var phase = (this._actor && typeof this._actor.getTagPhase === 'function') ? this._actor.getTagPhase() : 0;

        // 1. Name
        this.changeTextColor(this.normalColor());
        this.drawText(tag.name, px, currentY, pw, 'center');
        currentY += lh + paramNamePadding;

        // 2. Line (应用自定义颜色)
        this.contents.fillRect(px, currentY, pw, 1, finalLineStyle);
        currentY += (1 + paramLinePadding); 

        // 3. Intro
        this.changeTextColor(this.textColor(paramLabelColorIndex));
        this.drawText("✦介绍", px, currentY, pw, 'left');
        currentY += lh;
        this.resetTextColor();
        this.drawText(tag.note || "", px, currentY, pw, 'left');
        currentY += lh;

        // 4. Effect (回退 v3.4 逻辑，确保 Tier 2 也有偏移空行)
        currentY += lh * 0.5;

        if (tag.tier === 2) {
            this.changeTextColor(this.textColor(paramLabelColorIndex));
            this.drawText("✦效果", px, currentY, pw, 'left');
            currentY += lh;
            this.changeTextColor((phase === 0) ? COLOR_POS_BLUE : this.normalColor());
            this.drawText("正:" + (tag.effect || ""), px, currentY, pw, 'left');
            currentY += lh;
            this.changeTextColor((phase === 1) ? COLOR_NEG_PURPLE : this.normalColor());
            this.drawText("逆:" + (tag.reverseEffect || ""), px, currentY, pw, 'left');
        } else {
            this.changeTextColor(this.textColor(paramLabelColorIndex));
            this.drawText("✦效果", px, currentY, pw, 'left');
            currentY += lh;
            this.resetTextColor();
            this.drawText(tag.effect || "", px, currentY, pw, 'left');
        }
        this.contents.fontSize = oldSize;
    };

    Window_StatusCustomExt.prototype.drawTestButton = function() {
        if (!paramShowTestBtn) return;
        var bx = paramTestBtnX, by = paramTestBtnY, bw = paramTestBtnW, bh = paramTestBtnH;
        this.contents.fillRect(bx, by, bw, bh, 'rgba(0, 0, 0, 0.6)');
        var bCol = 'rgba(255, 255, 255, 0.8)';
        this.contents.fillRect(bx, by, bw, 2, bCol); 
        this.contents.fillRect(bx, by + bh - 2, bw, 2, bCol);
        this.contents.fillRect(bx, by, 2, bh, bCol);
        this.contents.fillRect(bx + bw - 2, by, 2, bh, bCol);
        this.changeTextColor(this.systemColor());
        this.drawText(paramTestBtnText, bx, by, bw, 'center');
    };

    Window_StatusCustomExt.prototype.refresh = function() {
        this.contents.clear();
        var tags = [];
        if (this._actor && typeof this._actor.getTags === 'function') {
            tags = this._actor.getTags().slice().sort(function(a, b) {
                var ea = a.isEquip ? 1 : 0, eb = b.isEquip ? 1 : 0;
                if (ea !== eb) return ea - eb;
                return (a.tier || 1) - (b.tier || 1);
            });
        }
        for (var i = 0; i < (paramCols * paramRows); i++) {
            var rect = this.itemRect(i), tag = tags[i];
            if (tag) { 
                this.drawTierBackground(rect, tag); 
                this.drawTagContent(rect, tag); 
            } else { 
                this.drawDarkRect(rect.x, rect.y, rect.width, rect.height); 
                if (paramDrawPlus) this.drawPlusSign(rect); 
            }
            if (paramBorderStyle === 'Window') this.drawWindowSkinBorder(rect);
            else if (paramBorderStyle === 'Simple') this.drawSimpleBorder(rect);
        }
        this.drawTestButton();
    };

    var _Scene_Status_create = Scene_Status.prototype.create;
    Scene_Status.prototype.create = function() {
        _Scene_Status_create.call(this);
        this.createCustomExtWindow();
        if (this._customExtWindow) this._customExtWindow.setActor(this.actor());
    };

    Scene_Status.prototype.createCustomExtWindow = function() {
        this._customExtWindow = new Window_StatusCustomExt();
        this.addWindow(this._customExtWindow);
    };

    var _Scene_Status_refreshActor = Scene_Status.prototype.refreshActor;
    Scene_Status.prototype.refreshActor = function() {
        _Scene_Status_refreshActor.call(this);
        if (this._customExtWindow) this._customExtWindow.setActor(this.actor());
    };

})();