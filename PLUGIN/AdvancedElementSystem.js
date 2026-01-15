/*:
 * @plugindesc 属性克制系统 v6.2：音频闪避(Ducking)、智能延迟、含可开关的BGM测试日志。
 * @author Gemini AI
 *
 * @param Skill Type ID
 * @text 核心元素技能类型ID
 * @type number
 * @default 3
 *
 * @param Show Rate Popup
 * @text 是否显示倍率文字
 * @type boolean
 * @default true
 *
 * @param --- UI Settings ---
 * @default
 *
 * @param Popup Font Face
 * @text 倍率字体名称
 * @parent --- UI Settings ---
 * @default GameFont
 *
 * @param Popup Font Size
 * @text 倍率字体大小
 * @parent --- UI Settings ---
 * @type number
 * @default 20
 *
 * @param Popup Duration
 * @text 倍率持续时间(帧)
 * @parent --- UI Settings ---
 * @type number
 * @min 1
 * @default 90
 *
 * @param Popup Offset X
 * @text X轴偏移量
 * @parent --- UI Settings ---
 * @type number
 * @default 20
 *
 * @param Popup Offset Y
 * @text Y轴偏移量
 * @parent --- UI Settings ---
 * @type number
 * @default -30
 *
 * @param Weak Color
 * @text 克制文字颜色
 * @parent --- UI Settings ---
 * @default #ff4444
 *
 * @param Resist Color
 * @text 抵抗文字颜色
 * @parent --- UI Settings ---
 * @default #66ccff
 *
 * @param --- Audio Ducking ---
 * @default
 *
 * @param Enable Ducking
 * @text 开启音频闪避
 * @parent --- Audio Ducking ---
 * @desc 总开关。关闭后，弱点/抵抗音效播放时不会影响其他声音。
 * @type boolean
 * @default true
 *
 * @param Ducking Duration
 * @text 闪避持续时间(帧)
 * @parent --- Audio Ducking ---
 * @type number
 * @default 45
 *
 * @param BGM Duck Rate
 * @text BGM音量保留比例
 * @parent --- Audio Ducking ---
 * @desc 70 表示降低 30%。
 * @type number
 * @min 0
 * @max 100
 * @default 70
 *
 * @param Other SE Duck Rate
 * @text 其他SE音量保留比例
 * @parent --- Audio Ducking ---
 * @desc 85 表示降低 15%。
 * @type number
 * @min 0
 * @max 100
 * @default 85
 *
 * @param --- Smart Delay ---
 * @default
 *
 * @param Plugin SE Weight
 * @text 插件音效权重
 * @parent --- Smart Delay ---
 * @desc 建议设为 10。
 * @type number
 * @default 10
 *
 * @param Delay Frames
 * @text 并发SE推迟帧数
 * @parent --- Smart Delay ---
 * @type number
 * @default 15
 *
 * @param --- Debug / Test ---
 * @default
 *
 * @param Enable Debug Log
 * @text 开启测试日志
 * @parent --- Debug / Test ---
 * @desc 【测试开关】开启后按F8查看控制台，可检测BGM是否减少及减少程度。
 * @type boolean
 * @default false
 *
 * @param --- Sound Effects ---
 * @default
 *
 * @param Weak SE Name
 * @text 弱点音效文件名
 * @parent --- Sound Effects ---
 * @type file
 * @dir audio/se/
 * @require 1
 *
 * @param Weak SE Volume
 * @text 弱点音量
 * @parent --- Sound Effects ---
 * @default 90
 *
 * @param Weak SE Pitch
 * @text 弱点音调
 * @parent --- Sound Effects ---
 * @default 100
 *
 * @param Weak SE Pan
 * @text 弱点声像
 * @parent --- Sound Effects ---
 * @default 0
 *
 * @param Resist SE Name
 * @text 抵抗音效文件名
 * @parent --- Sound Effects ---
 * @type file
 * @dir audio/se/
 * @require 1
 *
 * @param Resist SE Volume
 * @text 抵抗音量
 * @parent --- Sound Effects ---
 * @default 90
 *
 * @param Resist SE Pitch
 * @text 抵抗音调
 * @parent --- Sound Effects ---
 * @default 100
 *
 * @param Resist SE Pan
 * @text 抵抗声像
 * @parent --- Sound Effects ---
 * @default 0
 *
 * @help
 * ============================================================================
 * 更新说明 (v6.2) - 测试开关
 * ============================================================================
 * 1. 明确的测试功能开关：
 * - 参数：【开启测试日志】(Enable Debug Log)
 * - 作用：用于检测 BGM 是否成功闪避（降低音量）。
 *
 * 2. 如何使用测试功能：
 * - 将【开启测试日志】设为 true。
 * - 进入游戏战斗，触发一次弱点或抵抗音效。
 * - 按 F8 打开控制台。
 * - 寻找紫色文字：[Audio Debug] 🎵 BGM Lowered...
 * - 它会显示：BGM 降低前是 100%，降低后是 70% (具体数值取决于你的设置)。
 *
 * ============================================================================
 * 核心功能
 * ============================================================================
 * 1. 智能闪避 (Ducking)：播放音效时自动压低 BGM 和其他 SE。
 * 2. 权重延迟：防止声音重叠。
 * 3. 属性叠加与去重。
 * 4. 数据库与备注极值计算 (Max/Min)。
 */

(function() {
    var parameters = PluginManager.parameters('AdvancedElementSystem');
    var pCoreTypeId = Number(parameters['Skill Type ID'] || 3);
    var pShowRate = (parameters['Show Rate Popup'] === 'true');
    
    // UI 参数
    var pFontName = String(parameters['Popup Font Face'] || 'GameFont');
    var pFontSize = Number(parameters['Popup Font Size'] || 20);
    var pDuration = Number(parameters['Popup Duration'] || 90); 
    var pOffsetX = Number(parameters['Popup Offset X'] || 20);
    var pOffsetY = Number(parameters['Popup Offset Y'] || -30);
    var pWeakColor = String(parameters['Weak Color'] || '#ff4444');
    var pResistColor = String(parameters['Resist Color'] || '#66ccff');

    // 音效参数
    var pWeakSe = {
        name: String(parameters['Weak SE Name'] || ''),
        volume: Number(parameters['Weak SE Volume'] || 90),
        pitch: Number(parameters['Weak SE Pitch'] || 100),
        pan: Number(parameters['Weak SE Pan'] || 0)
    };
    var pResistSe = {
        name: String(parameters['Resist SE Name'] || ''),
        volume: Number(parameters['Resist SE Volume'] || 90),
        pitch: Number(parameters['Resist SE Pitch'] || 100),
        pan: Number(parameters['Resist SE Pan'] || 0)
    };

    // 音频闪避参数
    var pEnableDucking = (parameters['Enable Ducking'] === 'true');
    var pDuckingDuration = Number(parameters['Ducking Duration'] || 45);
    var pBgmDuckRate = Number(parameters['BGM Duck Rate'] || 70) / 100.0;
    var pSeDuckRate = Number(parameters['Other SE Duck Rate'] || 85) / 100.0;
    var pPluginSeWeight = Number(parameters['Plugin SE Weight'] || 10);
    var pDelayFrames = Number(parameters['Delay Frames'] || 15);
    // 调试开关
    var pDebugMode = (parameters['Enable Debug Log'] === 'true');

    var zMultipliers = [1.0, 1.0, 1.111111111111, 1.157407407407, 1.205632716049, 1.205632716049];

    // ========================================================================
    //  调试日志辅助函数
    // ========================================================================
    function logDebug(type, message, color) {
        if (!pDebugMode) return; // 如果关闭测试，直接返回，不执行
        var tag = "%c[Audio Debug] " + type;
        var style = "color: " + color + "; font-weight: bold;";
        console.log(tag, style, message);
    }

    // ========================================================================
    //  AudioManager 扩展
    // ========================================================================

    AudioManager._duckingTimer = 0;
    AudioManager._seDelayQueue = []; 

    var _AudioManager_updateBgmParameters = AudioManager.updateBgmParameters;
    AudioManager.updateBgmParameters = function(bgm) {
        _AudioManager_updateBgmParameters.call(this, bgm);
        
        if (this._duckingTimer > 0 && this._bgmBuffer && !this._bgmBuffer._isDucked) {
            var oldVol = this._bgmBuffer.volume; // 获取原始音量
            this._bgmBuffer.volume *= pBgmDuckRate; // 应用降低
            
            // 记录测试日志：BGM 变化
            if (this._duckingTimer === pDuckingDuration) { 
                var oldPct = Math.round(oldVol * 100);
                var newPct = Math.round(this._bgmBuffer.volume * 100);
                logDebug("🎵", "BGM Lowered: " + oldPct + "% -> " + newPct + "% (Reduced by " + (100 - pBgmDuckRate*100).toFixed(0) + "%)", "#ff00ff");
            }
        }
    };

    var _AudioManager_playSe = AudioManager.playSe;
    AudioManager.playSe = function(se) {
        if (!pEnableDucking) {
            _AudioManager_playSe.call(this, se);
            return;
        }

        var currentWeight = se._weight || 0;

        // A: 插件触发的高权重 SE
        if (se._isPluginTrigger) {
            this._duckingTimer = pDuckingDuration;
            this._dominantWeight = currentWeight;
            
            logDebug("🛑", "Trigger SE: " + se.name + " (Weight: " + currentWeight + ")", "#ff4444");
            
            _AudioManager_playSe.call(this, se);
            this.updateBgmParameters(this._currentBgm);
            return;
        }

        // B: 普通 SE
        if (this._duckingTimer > 0) {
            // 检查延迟
            if (currentWeight < (this._dominantWeight || 0)) {
                if (!se._hasBeenDelayed) {
                    var delayedSe = JsonEx.makeDeepCopy(se);
                    delayedSe._hasBeenDelayed = true; 
                    
                    this._seDelayQueue.push({
                        se: delayedSe,
                        timer: pDelayFrames
                    });

                    logDebug("⏳", "SE Delayed: " + se.name + " -> " + pDelayFrames + " frames", "#ffa500");
                    return; 
                }
            }

            // 检查压低
            var originalVolume = se.volume;
            se.volume = originalVolume * pSeDuckRate;
            
            logDebug("🔉", "SE Ducked: " + se.name + " | Vol: " + originalVolume + " -> " + se.volume, "#00ccff");
            
            _AudioManager_playSe.call(this, se);
            se.volume = originalVolume; 
        } else {
            _AudioManager_playSe.call(this, se);
        }
    };

    var _Scene_Base_update = Scene_Base.prototype.update;
    Scene_Base.prototype.update = function() {
        _Scene_Base_update.call(this);
        AudioManager.updateDuckingLogic();
    };

    AudioManager.updateDuckingLogic = function() {
        if (this._duckingTimer > 0) {
            this._duckingTimer--;
            if (this._duckingTimer === 0) {
                this._dominantWeight = 0; 
                this.updateBgmParameters(this._currentBgm);
                logDebug("✅", "Ducking Ended. BGM Restored.", "#00ff00");
            }
        }

        if (this._seDelayQueue.length > 0) {
            for (var i = this._seDelayQueue.length - 1; i >= 0; i--) {
                var item = this._seDelayQueue[i];
                item.timer--;
                
                if (item.timer <= 0) {
                    this._seDelayQueue.splice(i, 1);
                    logDebug("▶️", "Playing Delayed SE: " + item.se.name, "#ffff00");
                    this.playSe(item.se);
                }
            }
        }
    };

    // ========================================================================
    //  属性计算 (保持不变)
    // ========================================================================
    Game_Battler.prototype.getSpecificWeakRate = function(elementId) {
        var maxVal = null;
        var key = "WeakRate-" + elementId;
        this.traitObjects().forEach(function(obj) {
            if (obj.meta && obj.meta[key]) {
                var val = Number(obj.meta[key]);
                if (maxVal === null || val > maxVal) maxVal = val;
            }
        });
        return maxVal;
    };

    var _Game_Action_calcElementRate = Game_Action.prototype.calcElementRate;
    Game_Action.prototype.calcElementRate = function(target) {
        var item = this.item();
        var elements = this.getSkillElements();
        if (elements.length === 0) return 1.0;
        var isCoreSkill = (item.stypeId === pCoreTypeId);
        var netCount = 0;
        var totalRateProduct = 1.0;
        for (var i = 0; i < elements.length; i++) {
            var eleId = elements[i];
            var dbRate = target.elementRate(eleId);
            var tagRate = target.getSpecificWeakRate(eleId);
            var finalEleRate = dbRate;
            if (tagRate !== null) {
                if (dbRate > 1.0 || tagRate > 1.0) finalEleRate = Math.max(dbRate, tagRate);
                else finalEleRate = Math.min(dbRate, tagRate);
            }
            totalRateProduct *= finalEleRate;
            if (finalEleRate > 1.0) netCount++;
            else if (finalEleRate < 1.0) netCount--;
        }
        var zVal = 1.0;
        if (isCoreSkill && netCount > 0) {
            var zIndex = Math.min(netCount, zMultipliers.length - 1);
            zVal = zMultipliers[zIndex];
        }
        var rawRate = totalRateProduct * zVal;
        var finalRate = this.roundSpecial(rawRate);
        if (target.result()) target.result()._elementRateDisplay = finalRate;
        return finalRate;
    };

    Game_Action.prototype.getSkillElements = function() {
        var item = this.item();
        var elements = [];
        var defaultEleId = item.damage.elementId;
        if (defaultEleId < 0) elements = this.subject().attackElements();
        else if (defaultEleId > 0) elements.push(defaultEleId);
        if (item.stypeId === pCoreTypeId) {
            if (item.meta && item.meta.Elements) {
                var extraElems = item.meta.Elements.split(',').map(Number);
                elements = elements.concat(extraElems);
            }
        }
        return elements.filter(function(item, pos) { return elements.indexOf(item) == pos; });
    };

    Game_Action.prototype.roundSpecial = function(num) {
        var percent = Math.round(num * 100);
        var lastDigit = percent % 10;
        if (lastDigit < 5) percent -= lastDigit;
        else if (lastDigit > 5) percent += (10 - lastDigit);
        return percent / 100.0;
    };

    // ========================================================================
    //  触发逻辑
    // ========================================================================
    var _Game_Action_apply = Game_Action.prototype.apply;
    Game_Action.prototype.apply = function(target) {
        _Game_Action_apply.call(this, target);
        var result = target.result();
        
        if (result.isHit()) {
            var rate = result._elementRateDisplay;
            var seToPlay = null;

            if (rate > 1.0 && pWeakSe.name) seToPlay = pWeakSe;
            else if (rate < 1.0 && pResistSe.name) seToPlay = pResistSe;

            if (seToPlay) {
                var finalSe = JsonEx.makeDeepCopy(seToPlay);
                finalSe._isPluginTrigger = true;
                finalSe._weight = pPluginSeWeight;
                AudioManager.playSe(finalSe);
            }
        }
    };

    // ========================================================================
    //  UI 显示 (v5.7 Fix版)
    // ========================================================================
    var _Game_ActionResult_clear = Game_ActionResult.prototype.clear;
    Game_ActionResult.prototype.clear = function() {
        _Game_ActionResult_clear.call(this);
        this._elementRateDisplay = 1.0;
    };

    if (pShowRate) {
        var _Sprite_Damage_setup = Sprite_Damage.prototype.setup;
        Sprite_Damage.prototype.setup = function(target) {
            _Sprite_Damage_setup.call(this, target);
            this._rateSprite = null;
            var result = target.result();
            if (result && result._elementRateDisplay && result._elementRateDisplay !== 1.0) {
                if (!result.missed && !result.evaded) {
                    this.createRatePopup(result._elementRateDisplay);
                }
            }
        };

        Sprite_Damage.prototype.createRatePopup = function(rate) {
            var rateSprite = new Sprite();
            var w = pFontSize * 5 + 40; 
            var h = pFontSize + 20;     
            rateSprite.bitmap = new Bitmap(w, h);
            rateSprite.bitmap.fontFace = pFontName;
            rateSprite.bitmap.fontSize = pFontSize;
            var color = (rate > 1.0) ? pWeakColor : pResistColor;
            rateSprite.bitmap.textColor = color;
            var text = "x" + rate;
            if (rate % 1 === 0) text = "x" + rate + ".0"; 
            rateSprite.bitmap.drawText(text, 0, 0, w, h, 'left');
            rateSprite.x = pOffsetX; 
            rateSprite.y = pOffsetY; 
            rateSprite._maxDuration = pDuration;
            rateSprite._currentDuration = pDuration;
            this.addChild(rateSprite);
            this._rateSprite = rateSprite;
        };

        var _Sprite_Damage_update = Sprite_Damage.prototype.update;
        Sprite_Damage.prototype.update = function() {
            _Sprite_Damage_update.call(this);
            if (this._rateSprite) this.updateRateSprite(this._rateSprite);
        };

        Sprite_Damage.prototype.updateRateSprite = function(sprite) {
            if (sprite._currentDuration > 0) {
                sprite._currentDuration--;
                if (sprite._currentDuration < 20) sprite.opacity = (sprite._currentDuration / 20) * 255;
            } else {
                sprite.opacity = 0;
            }
        };

        var _Sprite_Damage_updateChild = Sprite_Damage.prototype.updateChild;
        Sprite_Damage.prototype.updateChild = function(sprite) {
            if (sprite === this._rateSprite) return;
            _Sprite_Damage_updateChild.call(this, sprite);
        };
    }
})();