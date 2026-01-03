/*:
 * @plugindesc 修改 YEP_SkillCore：去除技能消耗图标，并使用 "|" 分隔消耗项。
 * @author Gemini Patch
 *
 * @help
 * 请确保此插件放在 YEP_SkillCore.js 的下方。
 * * 功能：
 * 1. 移除了 HP/MP/TP 消耗前的图标显示。
 * 2. 多个消耗并存时，中间会自动添加 "|" 分隔符。
 */

(function() {

    // ===========================================================================
    // 重写：绘制技能总消耗 (控制整体流程和分隔符)
    // ===========================================================================
    Window_SkillList.prototype.drawSkillCost = function(skill, wx, wy, width) {
        var dw = width;
        var costDrawn = false; // 标记是否已经绘制过一种消耗

        // 定义绘制分隔符的函数
        var drawSeparator = function() {
            if (costDrawn) {
                var sepText = " | "; // 这里修改分隔符样式
                this.changeTextColor(this.normalColor());
                // 计算分隔符宽度
                var sepWidth = this.textWidth(sepText);
                // 绘制分隔符
                this.drawText(sepText, wx, wy, dw, 'right');
                // 减少可用宽度
                dw -= sepWidth; 
            }
        }.bind(this);

        // --- 1. 绘制 TP ---
        if (this._actor.skillTpCost(skill) > 0) {
            drawSeparator(); 
            dw = this.drawTpCost(skill, wx, wy, dw);
            costDrawn = true;
        }

        // --- 2. 绘制 MP ---
        if (this._actor.skillMpCost(skill) > 0) {
            drawSeparator();
            dw = this.drawMpCost(skill, wx, wy, dw);
            costDrawn = true;
        }

        // --- 3. 绘制 HP ---
        if (this._actor.skillHpCost(skill) > 0) {
            drawSeparator();
            dw = this.drawHpCost(skill, wx, wy, dw);
            costDrawn = true;
        }

        // --- 4. 绘制自定义消耗文字 ---
        if (skill.customCostText && skill.customCostText !== '') {
            drawSeparator();
            dw = this.drawCustomDisplayCost(skill, wx, wy, dw);
            costDrawn = true;
        }

        // --- 5. 绘制其他消耗 (兼容性保留) ---
        dw = this.drawOtherCost(skill, wx, wy, dw);

        return dw;
    };

    // ===========================================================================
    // 重写：绘制 TP (移除图标 & 移除末尾留白)
    // ===========================================================================
    Window_SkillList.prototype.drawTpCost = function(skill, wx, wy, dw) {
        if (this._actor.skillTpCost(skill) <= 0) return dw;
        
        // 移除图标绘制代码...
        
        this.changeTextColor(this.textColor(Yanfly.Param.SCCTpTextColor));
        var fmt = Yanfly.Param.SCCTpFormat;
        var text = fmt.format(Yanfly.Util.toGroup(this._actor.skillTpCost(skill)), TextManager.tpA);
        this.contents.fontSize = Yanfly.Param.SCCTpFontSize;
        this.drawText(text, wx, wy, dw, 'right');
        
        // 移除 Yanfly.Param.SCCCostPadding，由 drawSkillCost 统一控制间隔
        var returnWidth = dw - this.textWidth(text); 
        this.resetFontSettings();
        return returnWidth;
    };

    // ===========================================================================
    // 重写：绘制 MP (移除图标 & 移除末尾留白)
    // ===========================================================================
    Window_SkillList.prototype.drawMpCost = function(skill, wx, wy, dw) {
        if (this._actor.skillMpCost(skill) <= 0) return dw;
        
        // 移除图标绘制代码...

        this.changeTextColor(this.textColor(Yanfly.Param.SCCMpTextColor));
        var fmt = Yanfly.Param.SCCMpFormat;
        var text = fmt.format(Yanfly.Util.toGroup(this._actor.skillMpCost(skill)), TextManager.mpA);
        this.contents.fontSize = Yanfly.Param.SCCMpFontSize;
        this.drawText(text, wx, wy, dw, 'right');
        
        var returnWidth = dw - this.textWidth(text);
        this.resetFontSettings();
        return returnWidth;
    };

    // ===========================================================================
    // 重写：绘制 HP (移除图标 & 移除末尾留白)
    // ===========================================================================
    Window_SkillList.prototype.drawHpCost = function(skill, wx, wy, dw) {
        if (this._actor.skillHpCost(skill) <= 0) return dw;
        
        // 移除图标绘制代码...

        this.changeTextColor(this.textColor(Yanfly.Param.SCCHpTextColor));
        var fmt = Yanfly.Param.SCCHpFormat;
        var text = fmt.format(Yanfly.Util.toGroup(this._actor.skillHpCost(skill)), TextManager.hpA);
        this.contents.fontSize = Yanfly.Param.SCCHpFontSize;
        this.drawText(text, wx, wy, dw, 'right');
        
        var returnWidth = dw - this.textWidth(text);
        this.resetFontSettings();
        return returnWidth;
    };

    // ===========================================================================
    // 重写：绘制自定义消耗 (移除末尾留白)
    // ===========================================================================
    Window_SkillList.prototype.drawCustomDisplayCost = function(skill, wx, wy, dw) {
        this.runDisplayEvalCost(skill);
        if (skill.customCostText === '') return dw;
        var width = this.textWidthEx(skill.customCostText);
        this.resetFontSettings();
        this.drawTextEx(skill.customCostText, wx - width + dw, wy);
        // 移除 Yanfly.Param.SCCCostPadding
        var returnWidth = dw - width; 
        this.resetFontSettings();
        return returnWidth;
    };

})();