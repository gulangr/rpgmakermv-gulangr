/*:
 * @plugindesc (v42.0) [镜像缩放修复] 完美兼容 AutoScaleAnimation 的镜像缩放
 * @author Gemini Assistant
 *
 * @param Config List
 * @text --- 动效配置列表 ---
 * @type struct<MotionConfig>[]
 * @desc 定义你的动画ID、总时间以及具体的运动阶段。
 * @default ["{\"Anim ID\":\"121\",\"Duration\":\"20\",\"Stages\":\"[\\\"{\\\\\\\"End Percent\\\\\\\":\\\\\\\"0.3\\\\\\\",\\\\\\\"Target X\\\\\\\":\\\\\\\"-60\\\\\\\",\\\\\\\"Target Y\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"Scale\\\\\\\":\\\\\\\"1.2\\\\\\\",\\\\\\\"Rotation\\\\\\\":\\\\\\\"-10\\\\\\\",\\\\\\\"Easing\\\\\\\":\\\\\\\"Steep Out\\\\\\\"}\\\",\\\"{\\\\\\\"End Percent\\\\\\\":\\\\\\\"0.6\\\\\\\",\\\\\\\"Target X\\\\\\\":\\\\\\\"-40\\\\\\\",\\\\\\\"Target Y\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"Scale\\\\\\\":\\\\\\\"1.0\\\\\\\",\\\\\\\"Rotation\\\\\\\":\\\\\\\"0\\\\\\\",\\\\\\\"Easing\\\\\\\":\\\\\\\"Linear\\\\\\\"}\\\"]\"}"]
 *
 * @help
 * ============================================================================
 * 【版本更新 (v42.0)】
 * 修复了与 AutoScaleAnimation (mirrorActor: true) 同时使用时的挤压BUG。
 *
 * * 修复原理：
 * 插件现在会实时检测动画当前的 X 轴缩放值。
 * 1. 如果 X > 0 (正常)：缩放增量正常相加 (1.0 + 0.2 = 1.2 拉伸)。
 * 2. 如果 X < 0 (镜像)：缩放增量会自动反向 (-1.0 - 0.2 = -1.2 拉伸)。
 *
 * 这确保了无论是否镜像，"拉伸"动作永远是变宽，"挤压"动作永远是变窄。
 *
 * 【兼容性】
 * 请务必将本插件放在 AutoScaleAnimation.js 的【下方】！
 * ============================================================================
 */
/*~struct~MotionConfig:
 * @param Anim ID
 * @text 目标动画 ID
 * @type number
 * @min 1
 *
 * @param Duration
 * @text 总持续时间 (帧)
 * @type number
 * @min 1
 * @default 20
 *
 * @param Stages
 * @text --- 关键帧阶段 ---
 * @type struct<Keyframe>[]
 * @desc 按时间顺序添加阶段。注意：End Percent 必须从小到大排列！
 */
/*~struct~Keyframe:
 * @param End Percent
 * @text 结束时间点 (0.1~0.9)
 * @type number
 * @decimals 2
 * @min 0.01
 * @max 0.99
 * @desc 该阶段在总时间的百分之多少结束？例如 0.3 代表 30%。
 *
 * @param Target X
 * @text 目标 X 偏移
 * @type number
 * @min -9999
 * @default 0
 *
 * @param Target Y
 * @text 目标 Y 偏移
 * @type number
 * @min -9999
 * @default 0
 *
 * @param Scale
 * @text 目标缩放
 * @type number
 * @decimals 2
 * @default 1.00
 *
 * @param Rotation
 * @text 目标旋转 (度)
 * @type number
 * @default 0
 *
 * @param Easing
 * @text 过渡曲线
 * @type select
 * @option Linear (匀速)
 * @value Linear
 * @option Smooth (平滑/缓入缓出)
 * @value Smooth
 * @option Steep Out (爆发/快->慢)
 * @value Steep Out
 * @option Steep In (蓄力/慢->快)
 * @value Steep In
 * @default Smooth
 */

(function() {

    var PARAM = PluginManager.parameters('VE_ShieldHit_Keyframes_Fix');
    var CONFIG_MAP = {}; 

    if (PARAM['Config List']) {
        try {
            var rawList = JSON.parse(PARAM['Config List']);
            for (var i = 0; i < rawList.length; i++) {
                var item = JSON.parse(rawList[i]);
                var animId = Number(item['Anim ID']);
                
                var stages = [];
                if (item['Stages']) {
                    var rawStages = JSON.parse(item['Stages']);
                    for (var j = 0; j < rawStages.length; j++) {
                        var s = JSON.parse(rawStages[j]);
                        stages.push({
                            pct: Number(s['End Percent']),
                            x: Number(s['Target X'] || 0),
                            y: Number(s['Target Y'] || 0),
                            scale: Number(s['Scale'] || 1.0),
                            rot: Number(s['Rotation'] || 0),
                            ease: s['Easing'] || 'Smooth'
                        });
                    }
                }
                
                stages.push({
                    pct: 1.0,
                    x: 0, y: 0, scale: 1.0, rot: 0,
                    ease: 'Smooth'
                });

                CONFIG_MAP[animId] = {
                    duration: Number(item['Duration'] || 20),
                    stages: stages
                };
            }
        } catch (e) {
            console.error("VE_ShieldHit_Keyframes_Fix 参数解析错误:", e);
        }
    }

    // ======================================================================
    // 1. 逻辑层：Yanfly 屏障检测
    // ======================================================================
    var _Game_Action_apply = Game_Action.prototype.apply;
    Game_Action.prototype.apply = function(target) {
        
        var oldBarrier = 0;
        if (target && typeof target.barrierPoints === 'function') {
            oldBarrier = target.barrierPoints();
        }

        _Game_Action_apply.call(this, target);
        
        try {
            var result = target.result();

            if (target && result.isHit() && this.isForOpponent()) {
                
                var newBarrier = 0;
                if (typeof target.barrierPoints === 'function') {
                    newBarrier = target.barrierPoints();
                }

                if (oldBarrier > newBarrier) {
                    if (!target._geminiMotionData) target._geminiMotionData = {};

                    for (var animId in CONFIG_MAP) {
                        var cfg = CONFIG_MAP[animId];
                        target._geminiMotionData[animId] = {
                            timer: cfg.duration,
                            max: cfg.duration,
                            stages: cfg.stages
                        };
                    }
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    // ======================================================================
    // 2. 计时器维护
    // ======================================================================
    var _Sprite_Battler_update = Sprite_Battler.prototype.update;
    Sprite_Battler.prototype.update = function() {
        _Sprite_Battler_update.call(this);
        
        if (this._battler && this._battler._geminiMotionData) {
            var data = this._battler._geminiMotionData;
            for (var animId in data) {
                if (data.hasOwnProperty(animId)) {
                    var motion = data[animId];
                    if (motion.timer > 0) {
                        motion.timer--;
                    }
                }
            }
        }
    };

    // ======================================================================
    // 3. 缓动算法
    // ======================================================================
    function getEasing(p, type) {
        switch (type) {
            case 'Linear': return p;
            case 'Steep Out': return 1 - Math.pow(1 - p, 3); 
            case 'Steep In': return Math.pow(p, 3);          
            case 'Smooth': 
            default: return 0.5 * (1 - Math.cos(p * Math.PI)); 
        }
    }

    function lerp(start, end, p) {
        return start + (end - start) * p;
    }

    // ======================================================================
    // 4. 表现层：多阶段插值 + 智能镜像反转
    // ======================================================================
    
    function findRealBattler(targetSprite) {
        if (!targetSprite) return null;
        if (targetSprite._battler) return targetSprite._battler;
        if (targetSprite.parent && targetSprite.parent._battler) return targetSprite.parent._battler;
        if (targetSprite.parent && targetSprite.parent.parent && targetSprite.parent.parent._battler) return targetSprite.parent.parent._battler;
        return null;
    }

    var _Sprite_Animation_update = Sprite_Animation.prototype.update;
    
    Sprite_Animation.prototype.update = function() {
        if (_Sprite_Animation_update) {
            _Sprite_Animation_update.call(this);
        }
        this.updateGeminiMotion();
    };

    Sprite_Animation.prototype.updateGeminiMotion = function() {
        if (!this._animation) return;

        var animId = this._animation.id;
        var realBattler = findRealBattler(this._target);

        if (realBattler && realBattler._geminiMotionData && realBattler._geminiMotionData[animId]) {
            
            var motion = realBattler._geminiMotionData[animId];
            
            if (motion.timer > 0) {
                var max = motion.max;
                var currentFrame = max - motion.timer;
                var globalP = currentFrame / max; 
                var stages = motion.stages;

                // --- 寻找阶段 ---
                var prevStage = { pct: 0, x: 0, y: 0, scale: 1.0, rot: 0 }; 
                var nextStage = null;

                for (var i = 0; i < stages.length; i++) {
                    if (globalP <= stages[i].pct) {
                        nextStage = stages[i];
                        break;
                    }
                    prevStage = stages[i];
                }

                if (!nextStage) return;

                // --- 计算进度 ---
                var durationP = nextStage.pct - prevStage.pct;
                var localP = (globalP - prevStage.pct) / durationP;
                var easedP = getEasing(localP, nextStage.ease);

                // --- 基础计算 ---
                var curX = lerp(prevStage.x, nextStage.x, easedP);
                var curY = lerp(prevStage.y, nextStage.y, easedP);
                var curScale = lerp(prevStage.scale, nextStage.scale, easedP);
                var curRot = lerp(prevStage.rot, nextStage.rot, easedP);

                // --- 智能镜像检测 (Scale修复核心) ---
                var isMirrored = false;
                
                // 1. 系统级镜像标记 (SV Battler 通常用这个)
                if (this._mirror) isMirrored = true;
                
                // 2. 物理级镜像检测 (AutoScaleAnimation 强制将 scale.x 设为负数)
                // 如果当前X缩放已经是负数，说明被其他插件翻转了
                if (this.scale.x < 0) isMirrored = true;

                if (isMirrored) {
                    curX = -curX;   // X位移反转
                    curRot = -curRot; // 旋转反转
                }

                // --- 应用属性 ---
                this.x += curX;
                this.y += curY;

                if (curScale !== 1.0) {
                    var s = curScale - 1.0;
                    
                    this.scale.y += s; // Y轴永远正常加

                    // 🔴 核心修复逻辑 🔴
                    if (this.scale.x < 0) {
                        // 如果是镜像(负数)，要让它变得更宽(绝对值变大)，需要【减去】s
                        // 例如: -1.0 - 0.2 = -1.2 (正确拉伸)
                        // 之前是: -1.0 + 0.2 = -0.8 (导致挤压)
                        this.scale.x -= s;
                    } else {
                        // 正常情况，直接加
                        this.scale.x += s;
                    }
                }

                if (curRot !== 0) {
                    this.rotation += curRot * (Math.PI / 180);
                }
            }
        }
    };

    // ======================================================================
    // 5. 测试按钮
    // ======================================================================
    var _Scene_Battle_createDisplayObjects = Scene_Battle.prototype.createDisplayObjects;
    Scene_Battle.prototype.createDisplayObjects = function() {
        _Scene_Battle_createDisplayObjects.call(this);
        this.createMotionTestButton();
    };

    Scene_Battle.prototype.createMotionTestButton = function() {
        var btn = new Sprite_Button();
        btn.x = 20; btn.y = 120;
        btn.bitmap = new Bitmap(140, 40);
        btn.bitmap.fillAll('rgba(0,100,200,0.6)');
        btn.bitmap.fontSize = 20;
        btn.bitmap.drawText("关键帧测试", 0, 0, 140, 40, 'center');
        
        btn.callClickHandler = function() {
            SoundManager.playCursor();
            var members = $gameParty.members().concat($gameTroop.members());
            members.forEach(function(b) {
                if (!b._geminiMotionData) b._geminiMotionData = {};
                for (var animId in CONFIG_MAP) {
                    var cfg = CONFIG_MAP[animId];
                    b._geminiMotionData[animId] = {
                        timer: cfg.duration,
                        max: cfg.duration,
                        stages: cfg.stages
                    };
                }
            });
        };
        this.addChild(btn);
    };

})();