/*:
 * @plugindesc [8维雷达 v5] 增加窗口坐标微调 + 图形位置微调
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
 * @param --- 窗口位置修正 (新) ---
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
 * @help
 * ============================================================================
 * 更新说明 v5
 * ============================================================================
 * 新增了 [窗口位置修正] 参数：
 *
 * 1. [Window Offset X]:
 * - 如果您觉得雷达窗口离右边太近，可以填入负数 (例如 -10)。
 * - 如果您觉得中间的 SkillStatus 窗口太宽，想给雷达腾位置，可以填入负数。
 *
 * 2. [Window Offset Y]:
 * - 如果雷达窗口和指令窗口没对齐（比如偏高了），可以填入正数 (例如 5) 把它降下来。
 *
 * ============================================================================
 * 属性顺序
 * ============================================================================
 * HP -> MP -> 攻 -> 防 -> 魔攻 -> 魔防 -> 敏 -> 幸
 */

(function() {
    var parameters = PluginManager.parameters('Gemini_StatusMenu_Radar_8Param_v5');
    if (!parameters['Radar Width']) {
        var pluginName = "Gemini_StatusMenu_Radar_8Param_v5";
        if (document.currentScript) {
            pluginName = document.currentScript.src.split('/').pop().split('.').shift();
        }
        parameters = PluginManager.parameters(pluginName);
    }

    // 基础参数
    var forceScreenWidth = Number(parameters['Force Screen Width'] || 0);
    var radarWidth = Number(parameters['Radar Width'] || 200);
    var hideHelpWindow = (parameters['Hide Help Window'] !== 'false');
    
    // 新增：窗口位置微调
    var winOffsetX = Number(parameters['Window Offset X'] || 0);
    var winOffsetY = Number(parameters['Window Offset Y'] || 0);

    // 图形参数
    var globalScale = Number(parameters['Radar Scale'] || 100) / 100.0;
    var baseRadius = Number(parameters['Radar Radius'] || 50);
    var graphOffsetX = Number(parameters['Radar X Offset'] || 0);
    var graphOffsetY = Number(parameters['Radar Y Offset'] || 10);
    var fillColor = String(parameters['Fill Color'] || 'rgba(100, 200, 255, 0.6)');
    var strokeColor = String(parameters['Stroke Color'] || 'rgba(255, 255, 255, 0.8)');
    var baseFontSize = Number(parameters['Label Font Size'] || 13);

    // ========================================================================
    // 窗口创建与布局
    // ========================================================================

    if (Imported.YEP_StatusMenuCore) {
        Scene_Status.prototype.createStatusWindow = function() {
            var wx = this._commandWindow.width;
            var wh = this._commandWindow.height;
            var wy = this._commandWindow.y;

            var totalW = (forceScreenWidth > 0) ? forceScreenWidth : Graphics.boxWidth;
            
            // 计算雷达位置 (加入微调)
            var radarX = totalW - radarWidth + winOffsetX;
            var radarY = wy + winOffsetY;
            
            // 状态窗口填满中间
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
        
        // 计算目标位置 (加入微调)
        var targetRadarX = totalW - radarWidth + winOffsetX;
        var targetRadarY = cmdY + winOffsetY;
        
        var targetStatusX = cmdX + cmdW;
        var targetStatusW = targetRadarX - targetStatusX;

        // 应用位置
        if (this._radarWindow.x !== targetRadarX) this._radarWindow.x = targetRadarX;
        if (this._radarWindow.y !== targetRadarY) this._radarWindow.y = targetRadarY;
        
        if (this._radarWindow.height !== cmdH) {
            this._radarWindow.height = cmdH;
            this._radarWindow.refresh();
        }

        if (this._statusWindow.x !== targetStatusX) this._statusWindow.x = targetStatusX;
        if (this._statusWindow.y !== cmdY)          this._statusWindow.y = cmdY;
        
        // 只有宽度变化大时才重绘
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
    // 雷达图绘制
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
        // 使用图形偏移参数
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
        
        // 网格
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

        // 数据
        ctx.setLineDash([]);
        ctx.fillStyle = fillColor;
        ctx.strokeStyle = fillColor.replace('0.6', '1.0');
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        for (var i = 0; i < count; i++) {
            var pId = paramIds[i];
            var val = this._actor.param(pId);
            
            var max = 1;
            if (this._actor.paramMax) {
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

        // 文字
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

            this.changeTextColor(this.systemColor());
            this.drawText(name, tx, ty, textWidth + 10, 'left');
        }

        ctx.restore();
    };

})();