/*:
 * @plugindesc [8维雷达 v5.5] 视觉上限修正 + 自定义达标颜色 + 硬上限提示
 * @author Gemini
 *
 * @param --- 核心布局 ---
 *
 * @param Force Screen Width
 * @text 强制屏幕宽度
 * @desc 填入您的分辨率宽度(如 1900)。0 为自动。
 * @type number
 * @default 0
 *
 * @param Radar Width
 * @text 雷达窗口宽度
 * @type number
 * @default 200
 *
 * @param Hide Help Window
 * @text 隐藏帮助窗口背景
 * @type boolean
 * @on 隐藏 (透明)
 * @off 显示 (默认)
 * @default true
 *
 * @param --- 窗口位置修正 ---
 *
 * @param Window Offset X
 * @text 窗口 X 坐标修正
 * @desc 在自动对齐的基础上微调。正数向右移，负数向左移。
 * @type number
 * @min -999
 * @default 0
 *
 * @param Window Offset Y
 * @text 窗口 Y 坐标修正
 * @desc 在自动对齐的基础上微调。正数向下移，负数向上移。
 * @type number
 * @min -999
 * @default 0
 *
 * @param --- 雷达图形绘制 ---
 *
 * @param Radar Scale
 * @text 整体缩放百分比
 * @desc 100为原大小。
 * @type number
 * @min 10
 * @max 200
 * @default 100
 *
 * @param Radar Radius
 * @text 基础半径
 * @desc 雷达图的基础大小。
 * @type number
 * @default 50
 *
 * @param Radar X Offset
 * @text 图形中心 X 偏移
 * @desc 移动雷达图在窗口内的位置。
 * @type number
 * @min -999
 * @default 0
 *
 * @param Radar Y Offset
 * @text 图形中心 Y 偏移
 * @desc 移动雷达图在窗口内的位置。
 * @type number
 * @min -999
 * @default 10
 *
 * @param Fill Color
 * @text 雷达填充颜色
 * @default rgba(100, 200, 255, 0.6)
 *
 * @param Stroke Color
 * @text 边框线条颜色
 * @default rgba(255, 255, 255, 0.8)
 *
 * @param Label Font Size
 * @text 基础字体大小
 * @type number
 * @default 13
 *
 * @param --- 颜色提示设置 ---
 *
 * @param Alert Text Color
 * @text 软上限提示颜色
 * @desc 属性达到软上限(章节肉体限制)时的文字颜色索引。默认25(红色)。
 * @type number
 * @default 25
 *
 * @param Hard Cap Text Color
 * @text 硬上限提示颜色
 * @desc 属性达到硬上限(全局最终封顶)时的文字颜色索引。默认14(黄色)。
 * @type number
 * @default 14
 *
 * @param Both Cap Text Color
 * @text 双重上限提示颜色
 * @desc 同时达到软上限和硬上限时的文字颜色索引。默认31(紫色)。
 * @type number
 * @default 31
 *
 * @help
 * ============================================================================
 * 更新说明 v5.5
 * ============================================================================
 * 1. 新增参数 [硬上限提示颜色] (默认14 黄色)
 * 2. 新增参数 [双重上限提示颜色] (默认31 紫色)
 * * 颜色判断优先级：
 * 双重上限 (紫色) > 硬上限 (黄色) > 软上限 (红色) > 未达标 (系统色)
 *
 * - 软上限判断依赖: Gemini_ExcelStatsLink.js
 * - 硬上限判断依赖: Gemini_LimitBonusPatch.js (或系统 paramMax)
 */

(function() {
    // 读取参数 (兼容原插件名)
    var params = PluginManager.parameters('Gemini_StatusMenu_Radar_Header_Fix');
    if (!params['Radar Width']) {
        params = PluginManager.parameters('Gemini_StatusMenu_Radar_8Param_v5');
    }

    var forceScreenWidth = Number(params['Force Screen Width'] || 0);
    var radarWidth = Number(params['Radar Width'] || 200);
    var hideHelpWindow = (params['Hide Help Window'] !== 'false');
    
    var winOffsetX = Number(params['Window Offset X'] || 0);
    var winOffsetY = Number(params['Window Offset Y'] || 0);

    var globalScale = Number(params['Radar Scale'] || 100) / 100.0;
    var baseRadius = Number(params['Radar Radius'] || 50);
    var graphOffsetX = Number(params['Radar X Offset'] || 0);
    var graphOffsetY = Number(params['Radar Y Offset'] || 10);
    var fillColor = String(params['Fill Color'] || 'rgba(100, 200, 255, 0.6)');
    var strokeColor = String(params['Stroke Color'] || 'rgba(255, 255, 255, 0.8)');
    var baseFontSize = Number(params['Label Font Size'] || 13);
    
    // 新增：读取自定义颜色参数
    var alertTextColor = Number(params['Alert Text Color'] || 25);
    var hardCapTextColor = Number(params['Hard Cap Text Color'] || 14);
    var bothCapTextColor = Number(params['Both Cap Text Color'] || 31);

    // ========================================================================
    // 窗口创建与布局
    // ========================================================================

    if (Imported.YEP_StatusMenuCore) {
        Scene_Status.prototype.createStatusWindow = function() {
            var wx = this._commandWindow.width;
            var wh = this._commandWindow.height;
            var wy = this._commandWindow.y;

            var totalW = (forceScreenWidth > 0) ? forceScreenWidth : Graphics.boxWidth;
            var radarX = totalW - radarWidth + winOffsetX;
            var radarY = wy + winOffsetY;
            var statusW = radarX - wx;

            this._statusWindow = new Window_SkillStatus(wx, wy, statusW, wh);
            this.addWindow(this._statusWindow);
            
            this.createRadarWindow(radarX, radarY, radarWidth, wh);
            
            if (hideHelpWindow && this._helpWindow) {
                this._helpWindow.opacity = 0;
            }
        };
    }

    var _Scene_Status_update = Scene_Status.prototype.update;
    Scene_Status.prototype.update = function() {
        _Scene_Status_update.call(this);
        this.updateRadarLayout();
    };

    Scene_Status.prototype.updateRadarLayout = function() {
        if (!this._commandWindow || !this._radarWindow || !this._statusWindow) return;

        var cmdX = this._commandWindow.x;
        var cmdY = this._commandWindow.y;
        var cmdW = this._commandWindow.width;
        var cmdH = this._commandWindow.height;
        
        var totalW = (forceScreenWidth > 0) ? forceScreenWidth : Graphics.boxWidth;
        var targetRadarX = totalW - radarWidth + winOffsetX;
        var targetRadarY = cmdY + winOffsetY;
        var targetStatusX = cmdX + cmdW;
        var targetStatusW = targetRadarX - targetStatusX;

        if (this._radarWindow.x !== targetRadarX) this._radarWindow.x = targetRadarX;
        if (this._radarWindow.y !== targetRadarY) this._radarWindow.y = targetRadarY;
        
        if (this._radarWindow.height !== cmdH) {
            this._radarWindow.height = cmdH;
            this._radarWindow.refresh();
        }

        if (this._statusWindow.x !== targetStatusX) this._statusWindow.x = targetStatusX;
        if (this._statusWindow.y !== cmdY)          this._statusWindow.y = cmdY;
        
        if (Math.abs(this._statusWindow.width - targetStatusW) > 1) {
            this._statusWindow.width = targetStatusW;
            this._statusWindow.createContents();
            this._statusWindow.refresh();
        }

        if (hideHelpWindow && this._helpWindow && this._helpWindow.opacity !== 0) {
            this._helpWindow.opacity = 0;
        }
    };

    Scene_Status.prototype.createRadarWindow = function(x, y, w, h) {
        this._radarWindow = new Window_StatusRadar(x, y, w, h);
        this._radarWindow.setActor(this.actor());
        this.addWindow(this._radarWindow);
    };

    var _Scene_Status_refreshActor = Scene_Status.prototype.refreshActor;
    Scene_Status.prototype.refreshActor = function() {
        _Scene_Status_refreshActor.call(this);
        if (this._radarWindow) {
            this._radarWindow.setActor(this.actor());
        }
    };

    // ========================================================================
    // 雷达图绘制类
    // ========================================================================

    function Window_StatusRadar() {
        this.initialize.apply(this, arguments);
    }

    Window_StatusRadar.prototype = Object.create(Window_Base.prototype);
    Window_StatusRadar.prototype.constructor = Window_StatusRadar;

    Window_StatusRadar.prototype.initialize = function(x, y, width, height) {
        Window_Base.prototype.initialize.call(this, x, y, width, height);
        this._actor = null;
    };

    Window_StatusRadar.prototype.setActor = function(actor) {
        if (this._actor !== actor) {
            this._actor = actor;
            this.refresh();
        }
    };

    Window_StatusRadar.prototype.refresh = function() {
        this.contents.clear();
        if (!this._actor) return;
        this.drawRadarGraph();
    };

    Window_StatusRadar.prototype.drawRadarGraph = function() {
        var cx = (this.contents.width / 2) + graphOffsetX;
        var cy = (this.contents.height / 2) + graphOffsetY;
        var radius = baseRadius * globalScale;
        var fontSize = Math.max(10, Math.floor(baseFontSize * globalScale));
        
        var paramIds = [0, 1, 2, 3, 4, 5, 6, 7];
        var count = paramIds.length;
        var angleStep = (Math.PI * 2) / count;
        var startAngle = -Math.PI / 2;

        var ctx = this.contents.context;
        ctx.save();
        
        // 1. 绘制网格
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);

        var levels = [0.33, 0.66, 1.0];
        for (var l = 0; l < levels.length; l++) {
            var r = radius * levels[l];
            ctx.beginPath();
            for (var i = 0; i < count; i++) {
                var angle = startAngle + i * angleStep;
                var x = cx + Math.cos(angle) * r;
                var y = cy + Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
        }

        // 2. 绘制数据区域
        ctx.setLineDash([]);
        ctx.fillStyle = fillColor;
        ctx.strokeStyle = fillColor.replace('0.6', '1.0');
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        for (var i = 0; i < count; i++) {
            var pId = paramIds[i];
            var val = this._actor.param(pId);
            
            // 使用视觉固定上限
            var max = 1;
            if (typeof this._actor.getVisualChapterLimit === 'function') {
                max = this._actor.getVisualChapterLimit(pId);
            } else if (this._actor.paramMax) {
                max = this._actor.paramMax(pId); 
            }
            if (max <= 0) max = 1;
            
            var rate = val / max;
            if (rate > 1) rate = 1;

            var r = radius * rate;
            var angle = startAngle + i * angleStep;
            var x = cx + Math.cos(angle) * r;
            var y = cy + Math.sin(angle) * r;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 3. 绘制文字标签
        this.contents.fontSize = fontSize;
        for (var i = 0; i < count; i++) {
            var pId = paramIds[i];
            var name = "";
            if (pId === 0) name = "HP";
            else if (pId === 1) name = "MP";
            else if (pId === 2) name = "攻";
            else if (pId === 3) name = "防御";
            else if (pId === 4) name = "魔攻";
            else if (pId === 5) name = "魔防";
            else if (pId === 6) name = "敏";
            else name = TextManager.param(pId);

            var angle = startAngle + i * angleStep;
            var labelDist = radius + (12 * globalScale); 
            var lx = cx + Math.cos(angle) * labelDist;
            var ly = cy + Math.sin(angle) * labelDist;

            var align = 'center';
            var cosV = Math.cos(angle);
            if (Math.abs(cosV) < 0.2) align = 'center';
            else if (cosV > 0) align = 'left';
            else align = 'right';

            var textWidth = this.textWidth(name);
            var tx = lx;
            if (align === 'left') tx = lx;
            else if (align === 'right') tx = lx - textWidth;
            else tx = lx - textWidth / 2;

            var ty = ly - (this.lineHeight() / 2);

            // --- 核心修改：检测上限状态 ---
            var isSoftCapped = false;
            // 1. 检测软上限 (是否达到Excel设定的章节肉体上限)
            if (this._actor && typeof this._actor.isParamReachedChapterCap === 'function') {
                isSoftCapped = this._actor.isParamReachedChapterCap(pId);
            }

            var isHardCapped = false;
            // 2. 检测硬上限 (当前值是否达到paramMax封顶值)
            // Gemini_LimitBonusPatch 会重写 paramMax 为全局硬上限
            if (this._actor) {
                // 使用 >= 判断，通常数值会被 clamp 到 max，所以是相等的
                isHardCapped = (this._actor.param(pId) >= this._actor.paramMax(pId));
            }

            // 3. 颜色应用逻辑 (优先级：双重 > 硬 > 软 > 无)
            if (isSoftCapped && isHardCapped) {
                this.changeTextColor(this.textColor(bothCapTextColor)); // 双重上限(紫)
            } else if (isHardCapped) {
                this.changeTextColor(this.textColor(hardCapTextColor)); // 硬上限(黄)
            } else if (isSoftCapped) {
                this.changeTextColor(this.textColor(alertTextColor));   // 软上限(红)
            } else {
                this.changeTextColor(this.systemColor());
            }
            // -------------------------------

            this.drawText(name, tx, ty, textWidth + 10, 'left');
        }

        ctx.restore();
    };

})();