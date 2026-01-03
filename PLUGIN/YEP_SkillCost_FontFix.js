/*:
 * @plugindesc 修改 YEP_SkillCore：去除图标 + "|"分隔符 + 字体大小自适应 Olivia UI 缩放。
 * @author Gemini Patch
 *
 * @help
 * 请确保此插件放在 YEP_SkillCore.js 的下方。
 * * 功能：
 * 1. 移除 HP/MP/TP 的图标。
 * 2. 多个消耗之间添加 " | " 分隔符。
 * 3. 消耗的单位（如 MP）字体比数字小。
 * 4. 【修复】自动适配 Olivia Side Battle UI 的窗口缩放比例。
 */

(function() {

    // ===========================================================================
    // 辅助：获取当前窗口的缩放倍率
    // ===========================================================================
    Window_SkillList.prototype.getSkillCostScale = function() {
        // 检查是否存在 scaleRate 方法 (Olivia 插件提供的)
        // 如果是在战斗界面，这通常返回 0.6~0.8；在普通菜单则返回 1.0
        return (typeof this.scaleRate === 'function') ? this.scaleRate() : 1.0;
    };

    // ===========================================================================
    // 辅助函数：分段绘制 (先画单位，再画数字)
    // ===========================================================================
    Window_SkillList.prototype.drawCostSplit = function(wx, wy, dw, cost, label, baseFontSize, colorIndex) {
        // 1. 获取缩放倍率
        var scale = this.getSkillCostScale();
        
        // 2. 计算缩放后的“主数字”字号
        var scaledFontSize = Math.round(baseFontSize * scale);
        
        // 3. 计算缩放后的“单位”字号 (Label)
        // 原逻辑是小 6 号，现在这个“差值”也要随比例缩放，防止字体过小
        var fontSizeDiff = Math.max(2, Math.round(6 * scale)); 
        var smallFontSize = Math.max(10, scaledFontSize - fontSizeDiff); // 最小不小于10px

        // --- 绘制单位 (Label) ---
        var color = this.textColor(colorIndex);
        this.contents.fontSize = smallFontSize;
        this.changeTextColor(color);
        
        var labelWidth = this.textWidth(label);
        
        // 计算垂直偏移量，让小字体底部对齐（向下偏移）
        // 偏移量也需要根据缩放调整
        var yOffset = (scaledFontSize - smallFontSize) / 2 + (2 * scale); 

        // 绘制单位 (靠右)
        this.drawText(label, wx, wy + yOffset, dw, 'right');
        
        // --- 绘制数值 (Value) ---
        var valStr = String(Yanfly.Util.toGroup(cost));
        this.contents.fontSize = scaledFontSize; // 应用缩放后的字号
        this.changeTextColor(color);
        
        // 减少绘制区域宽度（扣除单位占用的宽度 + 少量间距）
        var spaceWidth = 2 * scale; // 间距也随缩放调整
        var remainDw = dw - labelWidth - spaceWidth;
        
        // 绘制数字 (在单位左侧)
        this.drawText(valStr, wx, wy, remainDw, 'right');
        
        // 4. 计算总占用宽度并返回
        var valWidth = this.textWidth(valStr);
        var totalWidth = labelWidth + spaceWidth + valWidth;
        
        this.resetFontSettings();
        return totalWidth;
    };

    // ===========================================================================
    // 主流程：绘制技能总消耗 (控制整体流程和分隔符)
    // ===========================================================================
    Window_SkillList.prototype.drawSkillCost = function(skill, wx, wy, width) {
        var dw = width;
        var costDrawn = false; // 标记是否已经绘制过一种消耗
        
        // 获取缩放比例，用于分隔符
        var scale = this.getSkillCostScale();

        // 定义绘制分隔符的函数
        var drawSeparator = function() {
            if (costDrawn) {
                var sepText = " | "; 
                this.changeTextColor(this.normalColor()); 
                
                // 分隔符字体也要缩放，使用 TP 设置作为基准
                this.contents.fontSize = Math.round(Yanfly.Param.SCCTpFontSize * scale);
                
                var sepWidth = this.textWidth(sepText);
                this.drawText(sepText, wx, wy, dw, 'right');
                dw -= sepWidth; 
            }
        }.bind(this);

        // --- 1. 绘制 TP ---
        if (this._actor.skillTpCost(skill) > 0) {
            drawSeparator(); 
            var used = this.drawTpCost(skill, wx, wy, dw);
            dw -= used;
            costDrawn = true;
        }

        // --- 2. 绘制 MP ---
        if (this._actor.skillMpCost(skill) > 0) {
            drawSeparator();
            var used = this.drawMpCost(skill, wx, wy, dw);
            dw -= used;
            costDrawn = true;
        }

        // --- 3. 绘制 HP ---
        if (this._actor.skillHpCost(skill) > 0) {
            drawSeparator();
            var used = this.drawHpCost(skill, wx, wy, dw);
            dw -= used;
            costDrawn = true;
        }

        // --- 4. 绘制自定义消耗文字 ---
        if (skill.customCostText && skill.customCostText !== '') {
            drawSeparator();
            dw = this.drawCustomDisplayCost(skill, wx, wy, dw);
            costDrawn = true;
        }

        // --- 5. 其他 ---
        dw = this.drawOtherCost(skill, wx, wy, dw);

        return dw;
    };

    // ===========================================================================
    // 重写各消耗类型的具体绘制 (调用 drawCostSplit)
    // ===========================================================================
    
    // TP
    Window_SkillList.prototype.drawTpCost = function(skill, wx, wy, dw) {
        var cost = this._actor.skillTpCost(skill);
        if (cost <= 0) return 0; 
        
        // 传入 Yanfly 的原始设置参数，缩放逻辑在 drawCostSplit 内部处理
        return this.drawCostSplit(
            wx, wy, dw, 
            cost, 
            TextManager.tpA, 
            Yanfly.Param.SCCTpFontSize, 
            Yanfly.Param.SCCTpTextColor 
        );
    };

    // MP
    Window_SkillList.prototype.drawMpCost = function(skill, wx, wy, dw) {
        var cost = this._actor.skillMpCost(skill);
        if (cost <= 0) return 0;

        return this.drawCostSplit(
            wx, wy, dw, 
            cost, 
            TextManager.mpA, 
            Yanfly.Param.SCCMpFontSize, 
            Yanfly.Param.SCCMpTextColor
        );
    };

    // HP
    Window_SkillList.prototype.drawHpCost = function(skill, wx, wy, dw) {
        var cost = this._actor.skillHpCost(skill);
        if (cost <= 0) return 0;

        return this.drawCostSplit(
            wx, wy, dw, 
            cost, 
            TextManager.hpA, 
            Yanfly.Param.SCCHpFontSize, 
            Yanfly.Param.SCCHpTextColor
        );
    };

    // 自定义消耗
    Window_SkillList.prototype.drawCustomDisplayCost = function(skill, wx, wy, dw) {
        this.runDisplayEvalCost(skill);
        if (skill.customCostText === '') return dw;
        
        // 确保重置为窗口默认状态 (Olivia 会在 resetFontSettings 里处理缩放)
        this.resetFontSettings();
        
        var width = this.textWidthEx(skill.customCostText);
        this.drawTextEx(skill.customCostText, wx - width + dw, wy);
        return dw - width; 
    };

})();