/*:
 * @plugindesc (v5.4 终极细节版) 配合VarSkillCost，支持自定义速度线的高度偏移、透明度及混合模式。
 * @author Custom Plugin
 *
 * @param --- 音效设置 ---
 * @default
 *
 * @param SE Filename
 * @text 音效文件名
 * @parent --- 音效设置 ---
 * @desc 播放的SE文件名(不带扩展名)。文件请放在 audio/se/ 文件夹下。留空则不播放。
 * @type file
 * @dir audio/se/
 * @default
 *
 * @param SE Volume
 * @text 音效音量
 * @parent --- 音效设置 ---
 * @type number
 * @min 0
 * @max 100
 * @default 90
 *
 * @param SE Pitch
 * @text 音效音调
 * @parent --- 音效设置 ---
 * @type number
 * @min 50
 * @max 150
 * @default 100
 *
 * @param --- 视觉设置 ---
 * @default
 *
 * @param Icon Scale
 * @text 图标目标缩放 (%)
 * @parent --- 视觉设置 ---
 * @desc 图标最终(100%)显示时的大小。
 * @type number
 * @min 1
 * @default 100
 *
 * @param Spawn Radius X
 * @text X轴生成范围
 * @parent --- 视觉设置 ---
 * @desc 图标产生的横向随机范围。默认 60。
 * @type number
 * @min 0
 * @default 60
 *
 * @param Float Speed
 * @text 上浮速度 (可多选)
 * @parent --- 视觉设置 ---
 * @desc 图标最终的飞行速度。可填多个值用逗号隔开。
 * @type text
 * @default 2.0
 *
 * @param Life Time
 * @text 存活时间 (帧)
 * @parent --- 视觉设置 ---
 * @desc 图标从出现到消失的总时间。
 * @type number
 * @min 20
 * @default 70
 *
 * @param Blend Mode
 * @text 图标混合模式
 * @parent --- 视觉设置 ---
 * @desc 图标的图层合成方式(0:正常 1:叠加发光)。
 * @type select
 * @option 正常 (Normal)
 * @value 0
 * @option 叠加/发光 (Add)
 * @value 1
 * @option 正片叠底 (Multiply)
 * @value 2
 * @option 滤色 (Screen)
 * @value 3
 * @default 0
 *
 * @param --- 速度线设置 ---
 * @default
 *
 * @param Show Speed Lines
 * @text 是否显示速度线
 * @parent --- 速度线设置 ---
 * @desc 是否在图标上升时显示背景速度线特效。
 * @type boolean
 * @on 显示
 * @off 关闭
 * @default true
 *
 * @param Line Density
 * @text 线条密度
 * @parent --- 速度线设置 ---
 * @desc 每次产生一批图标时，同时产生多少根速度线。建议 5-15。
 * @type number
 * @min 0
 * @default 8
 *
 * @param Line Color
 * @text 线条颜色
 * @parent --- 速度线设置 ---
 * @desc CSS颜色格式。如 #ff0000(红), #000000(黑)。需配合[线混合模式]为0才能显示深色。
 * @default #ffffff
 *
 * @param Line Blend Mode
 * @text 线混合模式
 * @parent --- 速度线设置 ---
 * @desc 0:正常(实色), 1:叠加(发光)。如果你发现改颜色没效果，请设为0。
 * @type select
 * @option 正常 (Normal)
 * @value 0
 * @option 叠加/发光 (Add)
 * @value 1
 * @default 1
 *
 * @param Line Max Opacity
 * @text 线最大不透明度
 * @parent --- 速度线设置 ---
 * @desc 线条显示时的最大透明度(0-255)。默认 220。
 * @type number
 * @min 0
 * @max 255
 * @default 220
 *
 * @param Line Offset Y
 * @text 线初始高度偏移
 * @parent --- 速度线设置 ---
 * @desc 调整线条生成的垂直位置。负数向上，正数向下。默认 0。
 * @type number
 * @min -999
 * @default 0
 *
 * @param Line Speed Range
 * @text 线移动速度 (Min, Max)
 * @parent --- 速度线设置 ---
 * @desc 速度越快飞得越高。填两个数字表示随机范围。默认 8, 13。
 * @default 8, 13
 *
 * @param Line Width Range
 * @text 线宽度范围 (Min, Max)
 * @parent --- 速度线设置 ---
 * @desc 线条的粗细(像素)。填两个数字表示随机范围。默认 2, 4。
 * @default 2, 4
 *
 * @param Line Height Range
 * @text 线长度范围 (Min, Max)
 * @parent --- 速度线设置 ---
 * @desc 线条本身的视觉长度(像素)。填两个数字表示随机范围。默认 60, 140。
 * @default 60, 140
 *
 * @param Base Wait Frames
 * @text 基准等待帧数 (X)
 * @parent --- 视觉设置 ---
 * @desc 当只产生1种变量时的等待时间。产生多种变量时，此时间会自动按比例缩短。
 * @type number
 * @min 0
 * @default 50
 *
 * @help
 * ============================================================================
 * 介绍
 * ============================================================================
 * 这是一个 VarSkillCost 的视觉扩展插件。
 *
 * 【v5.4 更新说明】
 * 1. 修复了颜色设置无效的问题：
 * 请调整参数 [线混合模式]。
 * - 如果你想用白色、金色光效，选 [1: 叠加]。
 * - 如果你想用黑色、深红色等实色，选 [0: 正常]。
 *
 * 2. 新增 [线初始高度偏移]：
 * - 填正数（如 50），线条会从更低的地方（脚下）冒出来。
 * - 填负数（如 -50），线条会从更高的地方（头顶上方）冒出来。
 *
 * 3. 新增 [线最大不透明度]：
 * - 可以控制线条的透明程度，0为完全透明，255为完全不透明。
 *
 * ============================================================================
 * 必须插件
 * ============================================================================
 * VarSkillCost.js (必须放在本插件上方)
 */

(function() {
    // 检查依赖
    if (!Imported.VarSkillCost) {
        console.warn("VarSkillCost_VisualExt: 请将此插件置于 VarSkillCost.js 之下，并确保主插件已启用。");
        return;
    }

    // 自动获取参数
    var parameters = PluginManager.parameters('VarSkillCost_VisualExt');
    if (Object.keys(parameters).length === 0) {
         var script = document.currentScript;
         if (script) {
             var fileName = script.src.split('/').pop().replace('.js', '');
             parameters = PluginManager.parameters(fileName);
         }
    }

    var parseFloatArray = function(str) {
        if (str === undefined || str === null || str === "") return [2.0];
        var arr = String(str).split(',');
        var result = [];
        for (var i = 0; i < arr.length; i++) {
            var n = Number(arr[i]);
            if (!isNaN(n)) result.push(n);
        }
        if (result.length === 0) return [2.0];
        return result;
    };

    var parseRange = function(str, defaultMin, defaultMax) {
        if (!str) return { min: defaultMin, max: defaultMax };
        var arr = str.split(',').map(Number);
        if (arr.length === 0) return { min: defaultMin, max: defaultMax };
        if (arr.length === 1) return { min: arr[0], max: arr[0] };
        return { min: arr[0], max: arr[1] };
    };

    // ===========================================================================
    // 配置
    // ===========================================================================
    
    var SPEED_MULTIPLIERS = {
        1: 1.00,
        2: 0.85,
        3: 0.72,
        4: 0.61,
        5: 0.52
    };

    // 读取范围参数
    var lineSpeedRange = parseRange(parameters['Line Speed Range'], 8, 13);
    var lineWidthRange = parseRange(parameters['Line Width Range'], 2, 4);
    var lineHeightRange = parseRange(parameters['Line Height Range'], 60, 140);

    var BASE_CONFIG = {
        seName: String(parameters['SE Filename'] || ''),
        seVolume: Number(parameters['SE Volume'] || 90),
        sePitch: Number(parameters['SE Pitch'] || 100),

        iconScale: Number(parameters['Icon Scale'] || 100) / 100,
        waitFrames: Number(parameters['Base Wait Frames'] || 50),
        blendMode: Number(parameters['Blend Mode'] || 0),
        spawnRadiusX: Number(parameters['Spawn Radius X'] || 60),
        floatSpeedList: parseFloatArray(parameters['Float Speed']),
        lifeTime: Number(parameters['Life Time'] || 70),
        
        // --- 速度线配置 ---
        showSpeedLines: String(parameters['Show Speed Lines']) === 'true',
        lineDensity: Number(parameters['Line Density'] || 8),
        lineColor: String(parameters['Line Color'] || '#ffffff'),
        
        // v5.4 新增参数
        lineBlendMode: Number(parameters['Line Blend Mode'] || 1), // 默认1(叠加), 改0可修复颜色问题
        lineOpacity: Number(parameters['Line Max Opacity'] || 220),
        lineOffsetY: Number(parameters['Line Offset Y'] || 0),
        
        lineSpeedMin: lineSpeedRange.min,
        lineSpeedMax: lineSpeedRange.max,
        lineWidthMin: lineWidthRange.min,
        lineWidthMax: lineWidthRange.max,
        lineHeightMin: lineHeightRange.min,
        lineHeightMax: lineHeightRange.max,
        
        spawnRadiusY: 40,     
        batches: 3,           
        batchDelay: 10,       
        fadeInFrame: 15,      
        fadeOutFrame: 15,     
        minDist: 24           
    };

    // ===========================================================================
    // BattleManager
    // ===========================================================================
    BattleManager._varGainSprites = [];

    BattleManager.updateVarGainEffects = function() {
        if (!this._varGainSprites || this._varGainSprites.length === 0) return;

        for (var i = this._varGainSprites.length - 1; i >= 0; i--) {
            var s = this._varGainSprites[i];
            if (s.parent && !s.isAlive()) {
                s.parent.removeChild(s);
                this._varGainSprites.splice(i, 1);
            }
        }
    };

    var _Scene_Battle_update = Scene_Battle.prototype.update;
    Scene_Battle.prototype.update = function() {
        _Scene_Battle_update.call(this);
        BattleManager.updateVarGainEffects();
    };

    // ===========================================================================
    // Sprite_SpeedLine (速度线精灵)
    // ===========================================================================
    function Sprite_SpeedLine() {
        this.initialize.apply(this, arguments);
    }

    Sprite_SpeedLine.prototype = Object.create(Sprite.prototype);
    Sprite_SpeedLine.prototype.constructor = Sprite_SpeedLine;

    Sprite_SpeedLine.prototype.initialize = function(x, y, delay, settings) {
        Sprite.prototype.initialize.call(this);
        this._delay = delay;
        this._settings = settings;
        this._timer = 0;
        this._maxLife = Math.floor(settings.lifeTime * 0.7); 
        
        // 【核心修改】应用混合模式参数 (0=正常, 1=叠加)
        this.blendMode = BASE_CONFIG.lineBlendMode; 
        
        // 层级设为 0.5 (背景和人物之间)
        this.z = 0.5;

        // 自定义宽度
        var wMin = BASE_CONFIG.lineWidthMin;
        var wMax = BASE_CONFIG.lineWidthMax;
        var lineWidth = Math.randomInt(wMax - wMin + 1) + wMin;
        
        // 自定义长度
        var hMin = BASE_CONFIG.lineHeightMin;
        var hMax = BASE_CONFIG.lineHeightMax;
        var lineHeight = Math.randomInt(hMax - hMin + 1) + hMin;
        
        this.bitmap = new Bitmap(lineWidth, lineHeight);
        this.drawGradientLine(lineWidth, lineHeight);
        
        this.anchor.x = 0.5;
        this.anchor.y = 1.0; 
        
        // 【核心修改】应用 Y 轴偏移
        // 原有逻辑：y + 随机
        // 新逻辑：y + 偏移 + 随机
        var randomY = Math.random() * 40 - 20;
        this.x = x + (Math.random() * 80 - 40); 
        this.y = y + BASE_CONFIG.lineOffsetY + randomY; 
        
        // 移动速度
        var sMin = BASE_CONFIG.lineSpeedMin;
        var sMax = BASE_CONFIG.lineSpeedMax;
        this._moveSpeed = Math.random() * (sMax - sMin) + sMin;
        
        this.opacity = 0;
        this.scale.y = 0.5; 
    };

    Sprite_SpeedLine.prototype.drawGradientLine = function(w, h) {
        var ctx = this.bitmap.context;
        var grad = ctx.createLinearGradient(0, 0, 0, h);
        
        // 使用配置的颜色
        // 如果混合模式是0(Normal)，这里的颜色就会直接显示
        // 如果混合模式是1(Add)，这里的颜色会和背景相加
        grad.addColorStop(0, 'rgba(255,255,255,0)');
        grad.addColorStop(0.2, BASE_CONFIG.lineColor);
        grad.addColorStop(0.8, BASE_CONFIG.lineColor);
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
    };

    Sprite_SpeedLine.prototype.update = function() {
        Sprite.prototype.update.call(this);
        if (this._delay > 0) {
            this._delay--;
            return;
        }
        this._timer++;

        this.y -= this._moveSpeed;
        
        if (this.scale.y < 1.5) this.scale.y += 0.05;

        // 【核心修改】应用最大不透明度参数
        var maxOp = BASE_CONFIG.lineOpacity;
        var fadeIn = 10;
        var fadeOut = 10;
        
        if (this._timer <= fadeIn) {
            this.opacity = (this._timer / fadeIn) * maxOp; 
        } else if (this._timer > this._maxLife - fadeOut) {
            var p = (this._maxLife - this._timer) / fadeOut;
            this.opacity = p * maxOp;
        } else {
            this.opacity = maxOp;
        }
    };

    Sprite_SpeedLine.prototype.isAlive = function() {
        return this._timer < this._maxLife;
    };

    // ===========================================================================
    // Sprite_VarGainIcon (保持不变)
    // ===========================================================================
    function Sprite_VarGainIcon() {
        this.initialize.apply(this, arguments);
    }

    Sprite_VarGainIcon.prototype = Object.create(Sprite.prototype);
    Sprite_VarGainIcon.prototype.constructor = Sprite_VarGainIcon;

    Sprite_VarGainIcon.prototype.initialize = function(iconIndex, x, y, delay, settings) {
        Sprite.prototype.initialize.call(this);
        this._iconIndex = iconIndex;
        this._delay = delay;
        this._settings = settings; 
        
        this.z = 1.1;

        var speedList = settings.adjustedSpeeds;
        if (speedList && speedList.length > 0) {
            this._targetMoveSpeed = speedList[Math.randomInt(speedList.length)];
        } else {
            this._targetMoveSpeed = 2.0;
        }

        this._timer = 0;
        this._maxLife = settings.lifeTime;
        
        this.blendMode = BASE_CONFIG.blendMode;
        this.anchor.x = 0.5;
        this.anchor.y = 0.5;
        this.x = x;
        this.y = y;
        this.opacity = 0;
        this.scale.x = 0;
        this.scale.y = 0;
        this.bitmap = ImageManager.loadSystem(VarSkillCost.iconSetFile);
        this.setFrameIcon(this._iconIndex);
    };

    Sprite_VarGainIcon.prototype.setFrameIcon = function(iconIndex) {
        var pw = Window_Base._iconWidth;
        var ph = Window_Base._iconHeight;
        var sx = iconIndex % 16 * pw;
        var sy = Math.floor(iconIndex / 16) * ph;
        this.setFrame(sx, sy, pw, ph);
    };

    Sprite_VarGainIcon.prototype.update = function() {
        Sprite.prototype.update.call(this);
        if (this._delay > 0) {
            this._delay--;
            return;
        }
        this._timer++;
        
        var progress = this._timer / this._maxLife;
        if (progress > 1) progress = 1;

        var speedCurve = 1 - Math.pow(1 - progress, 3);
        var speedRatio = 0.8 + 0.2 * speedCurve;
        var currentSpeed = this._targetMoveSpeed * speedRatio;
        this.y -= currentSpeed;

        var scaleCurve = Math.pow(progress, 3);
        var scaleRatio = 0.8 + 0.2 * scaleCurve;
        var targetUserScale = BASE_CONFIG.iconScale;
        var finalBaseScale = targetUserScale * scaleRatio;

        var breath = Math.sin(this._timer * 0.15) * (0.05 * targetUserScale);
        var totalScale = finalBaseScale + breath;
        this.scale.x = totalScale;
        this.scale.y = totalScale;

        var fadeIn = this._settings.fadeInFrame;
        var fadeOut = this._settings.fadeOutFrame;
        if (this._timer <= fadeIn) {
            var p = this._timer / fadeIn;
            var opCurve = 1 - Math.pow(1 - p, 2);
            this.opacity = opCurve * 255;
        } else if (this._timer > this._maxLife - fadeOut) {
            var p = (this._maxLife - this._timer) / fadeOut; 
            var opCurve = Math.pow(p, 2);
            this.opacity = opCurve * 255;
        } else {
            this.opacity = 255;
        }
    };

    Sprite_VarGainIcon.prototype.isAlive = function() {
        return this._timer < this._maxLife || this._delay > 0;
    };

    // ===========================================================================
    // Window_BattleLog
    // ===========================================================================
    
    var _Window_BattleLog_performAction = Window_BattleLog.prototype.performAction;
    
    Window_BattleLog.prototype.performAction = function(subject, action, skipVarGain) {
        var item = action.item();

        if (item && item.varGains && item.varGains.length > 0 && !skipVarGain) {
            
            var totalTypeCount = item.varGains.length;
            var plans = this.generateVarGainPlans(item.varGains);

            if (plans.length > 0) {
                this._methods.unshift({
                    name: 'performAction',
                    params: [subject, action, true]
                });

                for (var i = plans.length - 1; i >= 0; i--) {
                    var pIndex = plans[i].index;
                    var pContent = plans[i].content;

                    this._methods.unshift({
                        name: 'performVarGainEffect',
                        params: [subject, item, pContent, totalTypeCount, pIndex] 
                    });
                }
                return;
            }
        }

        _Window_BattleLog_performAction.apply(this, arguments);
    };

    Window_BattleLog.prototype.generateVarGainPlans = function(gains) {
        var plans = [];
        for (var i = 0; i < gains.length; i++) {
            plans.push({ 
                content: [{ gain: gains[i], count: 10 }],
                index: i
            });
        }
        return plans;
    };

    Window_BattleLog.prototype.performVarGainEffect = function(subject, item, currentPlanContent, totalTypeCount, currentPlanIndex) {
        var factor = SPEED_MULTIPLIERS[totalTypeCount] || 0.52;
        var dynamicWait = Math.floor(BASE_CONFIG.waitFrames * factor);
        
        if (dynamicWait > 0) {
            this._waitCount = dynamicWait;
        }

        if (!currentPlanContent) return;

        var adjustedSpeeds = BASE_CONFIG.floatSpeedList.map(function(s) {
            return s / factor; 
        });

        var spriteSettings = {
            lifeTime: Math.floor(BASE_CONFIG.lifeTime * factor),
            fadeInFrame: Math.floor(BASE_CONFIG.fadeInFrame * Math.sqrt(factor)), 
            fadeOutFrame: Math.floor(BASE_CONFIG.fadeOutFrame * Math.sqrt(factor)),
            adjustedSpeeds: adjustedSpeeds,
            batchDelay: Math.floor(BASE_CONFIG.batchDelay * factor) 
        };
        
        spriteSettings.lifeTime = Math.max(20, spriteSettings.lifeTime);
        spriteSettings.batchDelay = Math.max(1, spriteSettings.batchDelay);
        spriteSettings.fadeInFrame = Math.max(5, spriteSettings.fadeInFrame);

        var spawnQueue = []; 
        for (var i = 0; i < currentPlanContent.length; i++) {
            var p = currentPlanContent[i];
            var typeId = p.gain.type;
            var count = p.count;
            var typeConfig = VarSkillCost.types[typeId];
            if (typeConfig) {
                for (var c = 0; c < count; c++) {
                    spawnQueue.push(typeConfig.iconIndex);
                }
            }
        }
        
        var centerX = subject.screenX();
        var centerY = subject.screenY(); 
        centerY -= 48; 

        var positions = [];
        var totalIcons = spawnQueue.length;
        var batchSize = Math.ceil(totalIcons / BASE_CONFIG.batches); 

        var scene = SceneManager._scene;

        if (BASE_CONFIG.showSpeedLines && scene && scene._spriteset && scene._spriteset._battleField) {
            var container = scene._spriteset._battleField;
            var lineCount = BASE_CONFIG.lineDensity;
            
            for (var k = 0; k < lineCount; k++) {
                var lineDelay = Math.randomInt(20);
                var lineSprite = new Sprite_SpeedLine(centerX, centerY, lineDelay, spriteSettings);
                
                var index = Math.min(2, container.children.length);
                container.addChildAt(lineSprite, index);
                
                BattleManager._varGainSprites.push(lineSprite);
            }
        }

        for (var i = 0; i < totalIcons; i++) {
            var iconIndex = spawnQueue[i];
            var pos = getNonOverlappingPos(centerX, centerY, positions);
            positions.push(pos);

            var batchIndex = Math.floor(i / batchSize);
            
            if (i % batchSize === 0) {
                this.checkAndPlaySe(totalTypeCount, currentPlanIndex, batchIndex);
            }

            var delay = batchIndex * spriteSettings.batchDelay;
            delay += Math.randomInt(3);

            var sprite = new Sprite_VarGainIcon(iconIndex, pos.x, pos.y, delay, spriteSettings);
            
            if (scene && scene._spriteset && scene._spriteset._battleField) {
                scene._spriteset._battleField.addChild(sprite); 
                BattleManager._varGainSprites.push(sprite);
            }
        }
    };

    Window_BattleLog.prototype.checkAndPlaySe = function(totalTypeCount, planIndex, batchIndex) {
        if (!BASE_CONFIG.seName) return;

        var shouldPlay = false;

        if (totalTypeCount >= 3) {
            if (batchIndex === 0) shouldPlay = true;
        } 
        else if (totalTypeCount === 1) {
            shouldPlay = true; 
        } 
        else if (totalTypeCount === 2) {
            if (planIndex === 0) {
                if (batchIndex === 0) shouldPlay = true;
            }
            else if (planIndex === 1) {
                if (batchIndex === 0 || batchIndex === 1) shouldPlay = true;
            }
        }

        if (shouldPlay) {
            AudioManager.playSe({
                name: BASE_CONFIG.seName,
                volume: BASE_CONFIG.seVolume,
                pitch: BASE_CONFIG.sePitch,
                pan: 0
            });
        }
    };

    function getNonOverlappingPos(cx, cy, existingPositions) {
        var limit = 20;
        for (var t = 0; t < limit; t++) {
            var rx = cx + (Math.random() * BASE_CONFIG.spawnRadiusX * 2 - BASE_CONFIG.spawnRadiusX);
            var ry = cy + (Math.random() * BASE_CONFIG.spawnRadiusY * 2 - BASE_CONFIG.spawnRadiusY);
            
            var overlap = false;
            for (var j = 0; j < existingPositions.length; j++) {
                var p = existingPositions[j];
                var dx = rx - p.x;
                var dy = ry - p.y;
                var dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < BASE_CONFIG.minDist) {
                    overlap = true;
                    break;
                }
            }
            if (!overlap) return {x: rx, y: ry};
        }
        return {x: cx + (Math.random()*40-20), y: cy + (Math.random()*40-20)};
    }

})();