/*:
 * @plugindesc 在YEP状态菜单中悬停在属性上显示说明窗口 (完美修复版)
 * @author Gemini Custom
 *
 * @param ---Tooltip Settings---
 * @default
 *
 * @param Tooltip Font Size
 * @desc 悬浮窗文字大小
 * @default 18
 *
 * @param Window Padding
 * @desc 悬浮窗内边距
 * @default 10
 *
 * @param ---Descriptions---
 * @default
 *
 * @param Desc MHP
 * @desc 最大HP (param id 0) 的说明文字
 * @default 也就是生命值，降为0时角色会战斗不能。
 *
 * @param Desc MMP
 * @desc 最大MP (param id 1) 的说明文字
 * @default 也就是魔法值，用于释放技能。
 *
 * @param Desc ATK
 * @desc 攻击力 (param id 2) 的说明文字
 * @default 影响物理攻击造成的伤害量。
 *
 * @param Desc DEF
 * @desc 防御力 (param id 3) 的说明文字
 * @default 减少受到的物理伤害量。
 *
 * @param Desc MAT
 * @desc 魔法攻击 (param id 4) 的说明文字
 * @default 影响魔法技能造成的伤害量或治疗量。
 *
 * @param Desc MDF
 * @desc 魔法防御 (param id 5) 的说明文字
 * @default 减少受到的魔法伤害量。
 *
 * @param Desc AGI
 * @desc 敏捷 (param id 6) 的说明文字
 * @default 决定战斗中的行动顺序以及回避率。
 *
 * @param Desc LUK
 * @desc 幸运 (param id 7) 的说明文字
 * @default 影响状态异常的命中率和暴击回避率。
 *
 * @help
 * ============================================================================
 * 功能说明
 * ============================================================================
 * 当在状态菜单的 "General" (常规) 或 "Parameters" (参数) 页面时，
 * 鼠标悬停在八大属性（HP, MP, 攻, 防, 魔攻, 魔防, 敏, 运）上，
 * 会显示配置好的说明文字。
 *
 * 修复日志：
 * 1. 修复长文本显示不全的问题。
 * 2. 修复颜色代码 (\c[2]) 导致右侧大片留白的问题。
 * 3. 修复底部出现多余空行的问题。
 * 4. 修复在“属性概率”等其他页面误显示上一页悬浮窗的问题。
 */

(function() {
    if (!Imported.YEP_StatusMenuCore) {
        console.error("StatusParamTooltip requires YEP_StatusMenuCore.js installed.");
        return;
    }

    var parameters = PluginManager.parameters('StatusParamTooltip');
    var tooltipFontSize = Number(parameters['Tooltip Font Size'] || 18);
    var windowPadding = Number(parameters['Window Padding'] || 10);
    
    var paramDesc = [
        String(parameters['Desc MHP'] || ''),
        String(parameters['Desc MMP'] || ''),
        String(parameters['Desc ATK'] || ''),
        String(parameters['Desc DEF'] || ''),
        String(parameters['Desc MAT'] || ''),
        String(parameters['Desc MDF'] || ''),
        String(parameters['Desc AGI'] || ''),
        String(parameters['Desc LUK'] || '')
    ];

    //=============================================================================
    // Window_StatTooltip
    //=============================================================================
    function Window_StatTooltip() {
        this.initialize.apply(this, arguments);
    }

    Window_StatTooltip.prototype = Object.create(Window_Base.prototype);
    Window_StatTooltip.prototype.constructor = Window_StatTooltip;

    Window_StatTooltip.prototype.initialize = function() {
        Window_Base.prototype.initialize.call(this, 0, 0, 100, 100);
        this.openness = 0;
        this._text = '';
        this.hide();
    };

    Window_StatTooltip.prototype.standardFontSize = function() {
        return tooltipFontSize;
    };

    Window_StatTooltip.prototype.standardPadding = function() {
        return windowPadding;
    };

    Window_StatTooltip.prototype.lineHeight = function() {
        return this.standardFontSize() + 8;
    };

    Window_StatTooltip.prototype.processWordWrap = function(text, maxWidth) {
        var result = '';
        var currentLine = '';
        var currentWidth = 0;

        for (var i = 0; i < text.length; i++) {
            var char = text[i];

            // 智能识别控制字符 (如 \c[2], \i[64]) 并忽略其宽度
            if (char === '\\') {
                var remaining = text.substring(i);
                var codeMatch = remaining.match(/^(\\[a-zA-Z]\[\d+\]|\\[a-zA-Z])/);
                if (codeMatch) {
                    var code = codeMatch[0];
                    currentLine += code;
                    i += code.length - 1; 
                    continue;
                }
            }

            if (char === '\n') {
                result += currentLine + '\n';
                currentLine = '';
                currentWidth = 0;
                continue;
            }

            var charW = this.textWidth(char);
            if (currentWidth + charW > maxWidth) {
                result += currentLine + '\n';
                currentLine = char;
                currentWidth = charW;
            } else {
                currentLine += char;
                currentWidth += charW;
            }
        }
        result += currentLine;
        return result;
    };

    Window_StatTooltip.prototype.refresh = function(text) {
        if (this._text === text) return;
        this._text = text;
        
        if (this.contents) {
            this.contents.fontSize = this.standardFontSize();
        }

        var maxWidth = 320; 
        var wrappedText = this.processWordWrap(text, maxWidth);
        wrappedText = wrappedText.replace(/[\r\n]+$/, ""); // 去除尾部换行

        var lines = wrappedText.split('\n');
        var lineCount = lines.length;
        
        // 高度计算：保留0.5行缓冲
        var height = this.fittingHeight(lineCount) + (this.lineHeight() * 0.5);
        var width = maxWidth + this.standardPadding() * 2;

        this.move(this.x, this.y, width, height);
        
        this.createContents();
        this.contents.fontSize = this.standardFontSize(); 
        this.drawTextEx(wrappedText, 0, 0);
    };

    Window_StatTooltip.prototype.updatePosition = function() {
        var x = TouchInput.x + 20; 
        var y = TouchInput.y + 20; 
        if (x + this.width > Graphics.boxWidth) x = TouchInput.x - this.width - 10;
        if (y + this.height > Graphics.boxHeight) y = TouchInput.y - this.height - 10;
        this.x = x;
        this.y = y;
    };

    //=============================================================================
    // Window_StatusInfo 修改
    //=============================================================================

    var _Window_StatusInfo_initialize = Window_StatusInfo.prototype.initialize;
    Window_StatusInfo.prototype.initialize = function(y, commandWindow) {
        _Window_StatusInfo_initialize.call(this, y, commandWindow);
        this._paramHotspots = []; 
        this._tooltipWindow = null;
    };

    Window_StatusInfo.prototype.setTooltipWindow = function(tooltipWindow) {
        this._tooltipWindow = tooltipWindow;
    };

    // 覆盖 drawGeneralParam (General 页)
    Window_StatusInfo.prototype.drawGeneralParam = function() {
        this._paramHotspots = [];
        var rect = new Rectangle();
        rect.width = (this.contents.width - this.standardPadding()) / 2;
        rect.y = this.lineHeight() * 2;
        rect.height = this.lineHeight();
        var dx = rect.x + this.textPadding();
        var dw = rect.width - this.textPadding() * 2;
        this.drawDarkRect(rect.x, rect.y, rect.width, rect.height);
        this.changeTextColor(this.systemColor());
        this.drawText(TextManager.level, dx, rect.y, dw, 'left');
        this.changeTextColor(this.normalColor());
        text = Yanfly.Util.toGroup(this._actor.level);
        this.drawText(text, dx, rect.y, dw, 'right');

        for (var i = 0; i < 8; ++i) {
            if (i < 2) {
                rect.y += this.lineHeight();
            } else if (i === 2) {
                rect.y += this.lineHeight();
                rect.width /= 2;
                dw = rect.width - this.textPadding() * 2;
            } else if (i % 2 === 0) {
                rect.x = 0;
                dx = rect.x + this.textPadding();
                rect.y += this.lineHeight();
            } else {
                rect.x += rect.width;
                dx += rect.width;
            }
            this.drawDarkRect(rect.x, rect.y, rect.width, rect.height);
            this.changeTextColor(this.systemColor());
            this.drawText(TextManager.param(i), dx, rect.y, dw, 'left');
            this.changeTextColor(this.normalColor());
            text = Yanfly.Util.toGroup(this._actor.param(i));
            this.drawText(text, dx, rect.y, dw, 'right');

            // 记录热区
            this._paramHotspots.push({
                x: rect.x, y: rect.y, width: rect.width, height: rect.height, paramId: i
            });
        }
    };

    // 覆盖 drawParameters (Parameters 页)
    Window_StatusInfo.prototype.drawParameters = function() {
        this._paramHotspots = [];
        var dx = 0;
        var dy = this.lineHeight() / 2;
        var dw = this.contents.width;
        var dh = this.lineHeight();
        var dw2;
        var text;
        this.changeTextColor(this.systemColor());
        this.drawText(Yanfly.Param.StatusGraphText, dx, dy, dw, 'center');
        dy = this.lineHeight();
        dx = this.standardPadding();
        dw -= this.standardPadding() * 2;
        
        for (var i = 2; i < 8; ++i) {
            dy += this.lineHeight();
            var rate = this.drawParamGauge(dx, dy, dw, i);
            this.changeTextColor(this.systemColor());
            this.drawText(TextManager.param(i), dx + 4, dy, dw - 4);
            text = Yanfly.Util.toGroup(this._actor.param(i))
            this.changeTextColor(this.normalColor());
            dw2 = dw * rate;
            this.drawText(text, dx, dy, dw2 - 4, 'right');

            // 记录热区
            this._paramHotspots.push({
                x: dx, y: dy, width: dw, height: dh, paramId: i
            });
        }
    };

    var _Window_StatusInfo_update = Window_StatusInfo.prototype.update;
    Window_StatusInfo.prototype.update = function() {
        _Window_StatusInfo_update.call(this);
        this.updateTooltip();
    };

    Window_StatusInfo.prototype.updateTooltip = function() {
        if (!this._tooltipWindow) return;

        // --- 核心修复：页面检查 ---
        // 只有当前页面是 'general' 或 'parameters' 时才允许显示
        // 如果是 'attributes'、'states' 等其他页面，强制隐藏并返回
        if (this._symbol !== 'general' && this._symbol !== 'parameters') {
            this._tooltipWindow.hide();
            return;
        }
        // -----------------------
        
        if (!this.visible || this._paramHotspots.length === 0) {
            this._tooltipWindow.hide();
            return;
        }

        var localX = TouchInput.x - this.x - this.standardPadding();
        var localY = TouchInput.y - this.y - this.standardPadding();
        var found = false;
        var foundParamId = -1;

        for (var i = 0; i < this._paramHotspots.length; i++) {
            var spot = this._paramHotspots[i];
            if (localX >= spot.x && localX <= spot.x + spot.width &&
                localY >= spot.y && localY <= spot.y + spot.height) {
                found = true;
                foundParamId = spot.paramId;
                break;
            }
        }

        if (found) {
            var text = paramDesc[foundParamId];
            if (text && text !== '') {
                this._tooltipWindow.refresh(text);
                this._tooltipWindow.updatePosition();
                this._tooltipWindow.show();
                this._tooltipWindow.openness = 255;
            } else {
                this._tooltipWindow.hide();
            }
        } else {
            this._tooltipWindow.hide();
        }
    };

    var _Scene_Status_create = Scene_Status.prototype.create;
    Scene_Status.prototype.create = function() {
        _Scene_Status_create.call(this);
        this.createTooltipWindow();
    };

    Scene_Status.prototype.createTooltipWindow = function() {
        this._tooltipWindow = new Window_StatTooltip();
        this.addChild(this._tooltipWindow);
        if (this._infoWindow) {
            this._infoWindow.setTooltipWindow(this._tooltipWindow);
        }
    };

})();