/*:
 * @plugindesc 技能就绪提示插件 V3.5 - (智能延迟区分 + 闪光 + 音效)
 * @author 辅助开发
 *
 * @param PopupFontFace
 * @text 提示文字字体
 * @desc 弹出提示文字使用的字体名称。
 * @default GameFont
 *
 * @param PopupFontSize
 * @text 技能名文字大小
 * @desc 技能名称的字号大小 (作为主字号)。
 * @default 24
 *
 * @param ReadyTextDiff
 * @text Ready字号减小量
 * @type number
 * @desc "Ready !!!" 字样比技能名小多少像素。
 * @default 4
 *
 * @param PopupTextColor
 * @text 提示文字颜色
 * @desc 弹出提示文字的颜色 (十六进制格式)。
 * @default #ffff00
 *
 * @param IconSizeAdjust
 * @text 图标尺寸增量
 * @type number
 * @desc 图标大小 = 技能名字号 + 此数值。
 * @default 4
 *
 * @param IconTextGap
 * @text 图标文字间距
 * @type number
 * @min -20
 * @desc 图标和技能名之间的空隙像素。
 * @default 0
 *
 * @param LineSpacing
 * @text 上下行间距
 * @type number
 * @desc 技能名和下方Ready文字之间的垂直距离。
 * @default 0
 *
 * @param ReadyOffsetX
 * @text Ready横坐标偏移
 * @type number
 * @min -999
 * @desc 微调 "Ready !!!" 的左右位置。
 * @default 0
 *
 * @param StartDelay
 * @text 弹出启动延迟
 * @type number
 * @desc 仅当【获得变量】导致技能可用时，延迟多少帧显示？
 * 用于错开VarSkillCost动画。补MP/TP导致的可用不延迟。
 * @default 45
 *
 * @param --- 动画设置 ---
 *
 * @param BaseDuration
 * @text 基础停留时长
 * @type number
 * @desc 提示文字在屏幕上存在的总基础帧数。
 * 包含弹出和悬停的时间。设小此数值可让提示更快消失。
 * @default 90
 *
 * @param FadeOutDuration
 * @text 消失动画时长
 * @type number
 * @desc 最后阶段(放大+透明)的持续帧数。
 * 必须小于基础停留时长。设为0则瞬间消失。
 * @default 30
 *
 * @param PopupInitSpeed
 * @text 弹出初速度
 * @type number
 * @decimals 2
 * @desc 文字刚弹出时的向上速度。
 * @default 4.0
 *
 * @param PopupFriction
 * @text 飞行阻力系数
 * @type number
 * @decimals 3
 * @max 0.999
 * @desc 速度衰减系数。
 * @default 0.92
 *
 * @param ReadyDelay
 * @text Ready延迟帧
 * @type number
 * @desc "Ready !!!" 文字比技能名晚出来多少帧？
 * @default 15
 *
 * @param ReadyFloatDist
 * @text Ready上浮距离
 * @type number
 * @desc "Ready !!!" 文字出现时的上浮偏移量。
 * @default 15
 *
 * @param --- 闪光设置 ---
 * * @param FlashMethod
 * @text 闪光模式
 * @type select
 * @option 自定义颜色 (Flash)
 * @value Custom
 * @option 系统白光 (Whiten)
 * @value Whiten
 * @desc 如果自定义颜色无效，请尝试选择“系统白光”。
 * @default Custom
 *
 * @param FlashColor
 * @text 闪光颜色
 * @desc 仅在模式为“自定义颜色”时有效。格式：R,G,B,Intensity
 * @default 255,255,255,255
 *
 * @param FlashDuration
 * @text 闪光持续帧数
 * @type number
 * @desc 角色闪光持续的时间。设为 0 则不闪光。
 * @default 30
 *
 * @param --- 音效设置 ---
 *
 * @param ReadySound
 * @text 提示音效文件
 * @desc 弹出提示时播放的 SE 音效文件名 (无需扩展名)。
 * @default 
 * @require 1
 * @dir audio/se/
 * @type file
 *
 * @param ReadyVolume
 * @text 音效音量
 * @type number
 * @min 0
 * @max 100
 * @default 90
 *
 * @param ReadyPitch
 * @text 音效音调
 * @type number
 * @min 50
 * @max 150
 * @default 100
 *
 * @help
 * ============================================================================
 * 介绍 (V3.5 智能延迟区分版)
 * ============================================================================
 * 本插件专门用于检测战斗中变量变化（如通过 <VarGain: x y> 触发）。
 *
 * ★ V3.5 逻辑升级：智能区分触发源
 *
 * 1. 变量触发 (需避让动画)：
 * 当因为【变量增加】导致技能刚刚好可以使用时，插件会应用您设置的
 * 【弹出启动延迟】，以等待 VarSkillCost 等插件的动画播放完毕，
 * 防止文字重叠。
 *
 * 2. 补给触发 (无需延迟)：
 * 当变量条件早已满足，但因为【回复 MP/TP/HP】导致技能从灰色变亮时，
 * 插件会【立即】弹出提示，不再强制等待延迟。
 *
 * ============================================================================
 * 提示格式
 * ============================================================================
 * [图标] 技能名   <-- 居中
 * Ready !!!     <-- 居中 (可设置偏移 X)
 */

(function() {

    // --- 获取插件参数 ---
    var parameters = PluginManager.parameters('SkillReadyPopup');
    var popupFontFace = String(parameters['PopupFontFace'] || 'GameFont');
    var popupFontSize = Number(parameters['PopupFontSize'] || 24);
    var popupTextColor = String(parameters['PopupTextColor'] || '#ffff00');
    
    var readyTextDiff = Number(parameters['ReadyTextDiff'] || 4);
    var iconSizeAdjust = Number(parameters['IconSizeAdjust'] || 4);
    var iconTextGap = Number(parameters['IconTextGap'] || 0);
    var lineSpacing = Number(parameters['LineSpacing'] || 0);
    var readyOffsetX = Number(parameters['ReadyOffsetX'] || 0); 
    
    var startDelay = Number(parameters['StartDelay'] || 45); // 默认建议45帧

    // 动画参数
    var baseDuration = Number(parameters['BaseDuration'] || 90);
    var fadeOutDuration = Number(parameters['FadeOutDuration'] || 30);
    var popupInitSpeed = Number(parameters['PopupInitSpeed'] || 4.0);
    var popupFriction = Number(parameters['PopupFriction'] || 0.92);

    var readyDelay = Number(parameters['ReadyDelay'] || 15);
    var readyFloatDist = Number(parameters['ReadyFloatDist'] || 15);

    // 闪光参数
    var flashMethod = String(parameters['FlashMethod'] || 'Custom');
    var flashColorStr = String(parameters['FlashColor'] || '255,255,255,255');
    var flashDuration = Number(parameters['FlashDuration'] || 30);

    // 音效参数
    var readySound = String(parameters['ReadySound'] || '');
    var readyVolume = Number(parameters['ReadyVolume'] || 90);
    var readyPitch = Number(parameters['ReadyPitch'] || 100);

    // ======================================================================
    // 辅助工具：判断战斗是否处于活跃状态
    // ======================================================================
    function isBattleActive() {
        if (!$gameParty.inBattle()) return false;
        if (BattleManager._escaped) return false; 
        if (BattleManager._aborting) return false; 
        if (BattleManager._phase === 'battleEnd') return false; 
        return true;
    }

    // ======================================================================
    // 1. 核心扩展：初始化监听队列
    // ======================================================================
    var _Game_Battler_initMembers = Game_Battler.prototype.initMembers;
    Game_Battler.prototype.initMembers = function() {
        _Game_Battler_initMembers.call(this);
        this._readyPopupQueue = [];
        this._skillReadyWatchList = [];
        this._delayedReadyQueue = []; 
    };

    // ======================================================================
    // 2. 监听变量变化
    // ======================================================================
    var _Game_Variables_setValue = Game_Variables.prototype.setValue;
    Game_Variables.prototype.setValue = function(variableId, value) {
        var oldValue = this.value(variableId);
        
        var checkNeeded = (isBattleActive() && value > oldValue);

        _Game_Variables_setValue.call(this, variableId, value);

        if (checkNeeded) {
            $gameParty.members().forEach(function(actor) {
                if (actor.isAlive()) {
                    actor.checkSkillsForReadyPopup();
                }
            });
        }
    };

    // ======================================================================
    // 3. Game_Actor 逻辑扩展
    // ======================================================================
    
    Game_Actor.prototype.canPaySkillCostIgnorePools = function(skill) {
        var realMp = this._mp;
        var realTp = this._tp;
        this._mp = this.mmp;
        this._tp = this.maxTp();
        var canPay = this.canPaySkillCost(skill);
        this._mp = realMp;
        this._tp = realTp;
        return canPay;
    };

    // --- 由变量改变触发的检测 (需要延迟) ---
    Game_Actor.prototype.checkSkillsForReadyPopup = function() {
        if (!isBattleActive()) return;

        var skills = this.skills();
        for (var i = 0; i < skills.length; i++) {
            var skill = skills[i];
            if (skill && skill.stypeId === 3) {
                if (this.canPaySkillCost(skill)) {
                    // 变量够了，MP也够了 -> 直接触发
                    // ★ 关键：因为是变量变化触发的，所以【需要延迟】
                    this.triggerSkillReady(skill, true);
                } else {
                    if (this.canPaySkillCostIgnorePools(skill)) {
                        if (!this.isWatchingSkill(skill)) {
                            this.addSkillToWatchList(skill);
                        }
                    }
                }
            }
        }
    };

    // --- 核心触发函数 (带来源标记) ---
    // isVarTrigger: true=来自变量变化(需延迟), false=来自补给(不需延迟)
    Game_Actor.prototype.triggerSkillReady = function(skill, isVarTrigger) {
        if (!isBattleActive()) return; 

        if (this._lastReadySkillId === skill.id && this._lastReadyTime === Graphics.frameCount) {
            return;
        }

        // 记录防抖
        this._lastReadySkillId = skill.id;
        this._lastReadyTime = Graphics.frameCount;
        
        // 移除监听
        this.removeSkillFromWatchList(skill);

        // ★ V3.5 智能延迟判断
        // 如果是变量触发，且设置了延迟 -> 走延迟队列
        if (isVarTrigger && startDelay > 0) {
            this.addDelayedReadyPopup(skill, startDelay);
        } else {
            // 否则 (是补给触发 OR 没设置延迟) -> 立即执行
            this.executeSkillReady(skill);
        }
    };

    Game_Actor.prototype.addDelayedReadyPopup = function(skill, delayFrames) {
        if (!this._delayedReadyQueue) this._delayedReadyQueue = [];
        this._delayedReadyQueue.push({
            skill: skill,
            delay: delayFrames
        });
    };

    Game_Actor.prototype.updateDelayedReadyPopups = function() {
        if (!this._delayedReadyQueue || this._delayedReadyQueue.length === 0) return;
        
        if (!isBattleActive()) {
            this._delayedReadyQueue = [];
            return;
        }

        for (var i = this._delayedReadyQueue.length - 1; i >= 0; i--) {
            var item = this._delayedReadyQueue[i];
            item.delay--;
            if (item.delay <= 0) {
                this.executeSkillReady(item.skill);
                this._delayedReadyQueue.splice(i, 1);
            }
        }
    };

    // 执行显示
    Game_Actor.prototype.executeSkillReady = function(skill) {
        // 1. 闪光
        if (flashDuration > 0) {
            if (flashMethod === 'Whiten') {
                this.requestEffect('whiten');
            } else {
                try {
                    var colorArray = flashColorStr.split(',').map(Number);
                    if (colorArray.length === 4) {
                        this.startFlash(colorArray, flashDuration);
                    }
                } catch (e) {
                    console.warn("SkillReadyPopup: FlashColor error.");
                }
            }
        }

        // 2. 音效
        if (readySound) {
            var se = {
                name: readySound,
                volume: readyVolume,
                pitch: readyPitch,
                pan: 0
            };
            AudioManager.playSe(se);
        }

        // 3. 弹窗
        var popupData = {
            mainText: skill.name,
            subText: "Ready !!!", 
            iconIndex: skill.iconIndex
        };
        this.requestReadyPopup(popupData);
    };

    // --- 监听列表管理 ---
    Game_Actor.prototype.isWatchingSkill = function(skill) {
        return this._skillReadyWatchList.contains(skill.id);
    };

    Game_Actor.prototype.addSkillToWatchList = function(skill) {
        if (!this._skillReadyWatchList.contains(skill.id)) {
            this._skillReadyWatchList.push(skill.id);
        }
    };

    Game_Actor.prototype.removeSkillFromWatchList = function(skill) {
        var index = this._skillReadyWatchList.indexOf(skill.id);
        if (index >= 0) {
            this._skillReadyWatchList.splice(index, 1);
        }
    };

    // --- 由每帧刷新触发的检测 (补给导致) ---
    Game_Actor.prototype.updateSkillWatchList = function() {
        if (!isBattleActive()) {
            if (this._skillReadyWatchList.length > 0) {
                this._skillReadyWatchList = [];
            }
            return;
        }

        if (!this._skillReadyWatchList || this._skillReadyWatchList.length === 0) return;
        for (var i = this._skillReadyWatchList.length - 1; i >= 0; i--) {
            var skillId = this._skillReadyWatchList[i];
            var skill = $dataSkills[skillId];
            if (skill) {
                if (this.canPaySkillCost(skill)) {
                    // ★ 关键：这是在 update 中发现技能可用了，说明是补给/回蓝导致的
                    // 此时不需要避让动画，传入 false (不延迟)
                    this.triggerSkillReady(skill, false); 
                } else {
                    if (!this.canPaySkillCostIgnorePools(skill)) {
                        this.removeSkillFromWatchList(skill);
                    }
                }
            }
        }
    };

    // ======================================================================
    // 4. 驱动层 (Sprite_Battler)
    // ======================================================================
    var _Sprite_Battler_update = Sprite_Battler.prototype.update;
    Sprite_Battler.prototype.update = function() {
        _Sprite_Battler_update.call(this);
        if (this._battler) {
            if (this._battler.isActor()) {
                if (typeof this._battler.updateSkillWatchList === 'function') {
                    this._battler.updateSkillWatchList();
                }
                if (typeof this._battler.updateDelayedReadyPopups === 'function') {
                    this._battler.updateDelayedReadyPopups();
                }
            }
            this.updateReadyPopup();
        }
    };

    // ======================================================================
    // 5. 弹窗显示逻辑
    // ======================================================================

    Game_Battler.prototype.requestReadyPopup = function(data) {
        this._readyPopupQueue.push(data);
    };

    Game_Battler.prototype.isReadyPopupRequested = function() {
        return this._readyPopupQueue && this._readyPopupQueue.length > 0;
    };

    Game_Battler.prototype.shiftReadyPopup = function() {
        return this._readyPopupQueue.shift();
    };

    Sprite_Battler.prototype.updateReadyPopup = function() {
        if (this._battler.isReadyPopupRequested()) {
            var data = this._battler.shiftReadyPopup();
            this.createReadyPopupSprite(data);
        }
    };

    Sprite_Battler.prototype.createReadyPopupSprite = function(data) {
        var sprite = new Sprite_SkillReadyPopup();
        sprite.setup(this._battler, data);
        this.addChild(sprite);
    };

    // --- Sprite Class ---
    function Sprite_SkillReadyPopup() {
        this.initialize.apply(this, arguments);
    }

    Sprite_SkillReadyPopup.prototype = Object.create(Sprite.prototype);
    Sprite_SkillReadyPopup.prototype.constructor = Sprite_SkillReadyPopup;

    Sprite_SkillReadyPopup.prototype.initialize = function() {
        Sprite.prototype.initialize.call(this);
        this._duration = 0;
        this._time = 0; 
        this.anchor.x = 0.5;
        this.anchor.y = 1;
        this.z = 8; 
    };

    Sprite_SkillReadyPopup.prototype.setup = function(battler, data) {
        var mainText = data.mainText;
        var subText = data.subText;
        var iconIndex = data.iconIndex;
        
        var mainFontSize = popupFontSize;
        var subFontSize = Math.max(10, mainFontSize - readyTextDiff); 
        var iconSize = mainFontSize + iconSizeAdjust; 
        
        // --- 第一部分：图标 + 技能名 (主层) ---
        var boxHeight1 = Math.max(mainFontSize, iconSize) + 4;
        var boxWidth1 = 600; 
        
        var bitmap1 = new Bitmap(boxWidth1, boxHeight1);
        bitmap1.fontFace = popupFontFace;
        bitmap1.textColor = popupTextColor; 
        bitmap1.outlineColor = "rgba(0, 0, 0, 0.8)";
        bitmap1.outlineWidth = 4;
        bitmap1.fontSize = mainFontSize;

        var mainTextWidth = bitmap1.measureTextWidth(mainText);
        var contentWidth1 = iconSize + iconTextGap + mainTextWidth;
        var startX1 = (boxWidth1 - contentWidth1) / 2;

        var iconBitmap = ImageManager.loadSystem('IconSet');
        if (iconIndex > 0) {
            var pw = Window_Base._iconWidth;
            var ph = Window_Base._iconHeight;
            var sx = iconIndex % 16 * pw;
            var sy = Math.floor(iconIndex / 16) * ph;
            var iconY = (boxHeight1 - iconSize) / 2;
            bitmap1.blt(iconBitmap, sx, sy, pw, ph, startX1, iconY, iconSize, iconSize);
        }
        var textY1 = (boxHeight1 - mainFontSize) / 2;
        bitmap1.drawText(mainText, startX1 + iconSize + iconTextGap, textY1, mainTextWidth + 20, mainFontSize, 'left');

        this._mainPart = new Sprite(bitmap1);
        this._mainPart.anchor.x = 0.5;
        this._mainPart.anchor.y = 1; 
        this._mainPart.x = 0; 
        this._mainPart.y = 0;
        this.addChild(this._mainPart);

        // --- 第二部分：Ready !!! (副层) ---
        var boxHeight2 = subFontSize + 4;
        var boxWidth2 = 600;

        var bitmap2 = new Bitmap(boxWidth2, boxHeight2);
        bitmap2.fontFace = popupFontFace;
        bitmap2.textColor = popupTextColor; 
        bitmap2.outlineColor = "rgba(0, 0, 0, 0.8)";
        bitmap2.outlineWidth = 4;
        bitmap2.fontSize = subFontSize;

        bitmap2.drawText(subText, 0, 0, boxWidth2, boxHeight2, 'center');

        this._readyPart = new Sprite(bitmap2);
        this._readyPart.anchor.x = 0.5;
        this._readyPart.anchor.y = 0; 
        
        this._readyPart.x = readyOffsetX;
        this._readyPart.y = lineSpacing; 
        
        this._readyPart.opacity = 0;
        this._readyPart.y += readyFloatDist;

        this.addChild(this._readyPart);

        // --- 位置与动画初始化 ---
        var spriteHeight = 0;
        if (this.parent && typeof this.parent._mainSprite !== 'undefined') {
             spriteHeight = this.parent._mainSprite.height || 64;
        } else {
             spriteHeight = 64; 
        }
        
        this.y = -spriteHeight - 20; 
        
        // 总时长计算
        var total = baseDuration + readyDelay;
        if (total < fadeOutDuration + 5) {
            total = fadeOutDuration + 5;
        }
        this._duration = total; 
        
        this._time = 0;
        
        this._moveSpeed = popupInitSpeed; 
        this._targetReadyY = lineSpacing;
    };

    Sprite_SkillReadyPopup.prototype.update = function() {
        Sprite.prototype.update.call(this);
        
        if (this._duration > 0) {
            this._duration--;
            this._time++; 
            
            // 1. 整体上浮
            this.y -= this._moveSpeed;
            this._moveSpeed *= popupFriction; 

            // 2. Ready 部分的独立动画
            if (this._time > readyDelay) {
                if (this._readyPart.opacity < 255) {
                    this._readyPart.opacity += 20;
                }
                var dist = this._readyPart.y - this._targetReadyY;
                if (dist > 0.1) {
                    this._readyPart.y -= dist * 0.15;
                } else {
                    this._readyPart.y = this._targetReadyY;
                }
            }

            // 3. 最终整体消失动画
            if (fadeOutDuration > 0 && this._duration < fadeOutDuration) {
                var progress = (fadeOutDuration - this._duration) / fadeOutDuration;
                this.opacity = 255 * (1 - progress);
                var scale = 1.0 + (0.1 * progress);
                this.scale.x = scale;
                this.scale.y = scale;
            }

        } else {
            if (this.parent) {
                this.parent.removeChild(this);
            }
        }
    };

})();