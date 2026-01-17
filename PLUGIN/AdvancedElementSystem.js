/*:
 * @plugindesc 属性克制系统 v7.3：全局钳制(修复菜单显示) + 双重归整 + 去除Z值。
 * @author Gemini AI (Mod)
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
 * 更新说明 (v7.3 Mod)
 * ============================================================================
 * 1. 【全局属性钳制】(修复菜单显示)：
 * 修改了底层的 elementRate 方法。
 * 现在，无论是战斗计算、还是在状态菜单里查看，
 * 只要属性有效度超过 140%，都会强制显示和按 140% 计算。
 * 只要属性有效度低于 70%，都会强制显示和按 70% 计算。
 *
 * 2. 【去除 Z 值】：
 * 移除了核心技能的多重弱点加成机制。
 *
 * 3. 【双重归整逻辑】：
 * - 计算结果 < 1.3：使用旧逻辑（保留 .00, .05, .10）。
 * - 计算结果 >= 1.3：使用新逻辑（1,2->0; 3,4,6,7->5; 8,9->进位）。
 *
 * ============================================================================
 * 核心功能
 * ============================================================================
 * 1. 智能闪避 (Ducking)：播放音效时自动压低 BGM 和其他 SE。
 * 2. 权重延迟：防止声音重叠。
 * 3. 属性叠加与去重。
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

    // ========================================================================
    //  调试日志辅助函数
    // ========================================================================
    function logDebug(type, message, color) {
        if (!pDebugMode) return;
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
            var oldVol = this._bgmBuffer.volume;
            this._bgmBuffer.volume *= pBgmDuckRate;
            
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
    //  全局属性有效度钳制 (v7.3 新增)
    //  这里拦截了最底层的 elementRate，确保菜单显示和战斗计算都受影响
    // ========================================================================
    var _Game_BattlerBase_elementRate = Game_BattlerBase.prototype.elementRate;
    Game_BattlerBase.prototype.elementRate = function(elementId) {
        var rate = _Game_BattlerBase_elementRate.call(this, elementId);
        // 强制限制在 0.7 ~ 1.4
        // 任何调用 .elementRate(id) 的地方（包括状态菜单）都会拿到钳制后的值
        return Math.min(1.4, Math.max(0.7, rate));
    };

    // ========================================================================
    //  属性计算 (v7.2 -> v7.3 保留计算逻辑)
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
        
        var totalRateProduct = 1.0;
        for (var i = 0; i < elements.length; i++) {
            var eleId = elements[i];
            var dbRate = target.elementRate(eleId); // 此时已是钳制过的值(0.7~1.4)
            var tagRate = target.getSpecificWeakRate(eleId);
            var finalEleRate = dbRate;
            
            if (tagRate !== null) {
                if (dbRate > 1.0 || tagRate > 1.0) finalEleRate = Math.max(dbRate, tagRate);
                else finalEleRate = Math.min(dbRate, tagRate);
            }
            
            // 为了保险起见（防止备注tagRate突破天际），这里再次进行钳制
            finalEleRate = Math.min(1.4, Math.max(0.7, finalEleRate));

            totalRateProduct *= finalEleRate;
        }
        
        var rawRate = totalRateProduct;
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

    // [MOD] 特殊归整函数 (双重逻辑)
    Game_Action.prototype.roundSpecial = function(num) {
        if (num < 1.3) {
            // --- 逻辑 A: 倍率 < 1.3 ---
            var percent = Math.round(num * 100);
            var lastDigit = percent % 10;
            
            if (lastDigit < 5) percent -= lastDigit;      
            else if (lastDigit > 5) percent += (10 - lastDigit);
            
            return percent / 100.0;
            
        } else {
            // --- 逻辑 B: 倍率 >= 1.3 ---
            var rounded1 = Math.round(num * 10) / 10;
            
            var str = rounded1.toFixed(1);
            var parts = str.split('.');
            var intPart = parseInt(parts[0]);
            var decPart = parseInt(parts[1]); 
            
            if ([0, 1, 2].includes(decPart)) {
                return intPart + 0.0;
            } else if ([3, 4, 5, 6, 7].includes(decPart)) {
                return intPart + 0.5;
            } else if ([8, 9].includes(decPart)) {
                return intPart + 1.0;
            }
            
            return rounded1;
        }
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
    //  UI 显示
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