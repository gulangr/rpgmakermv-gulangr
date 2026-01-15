/*:
 * @plugindesc (v6.0 Redux) 属性克制悬浮窗：分体调校终极版
 * @author Gemini Assistant
 *
 * @param Weak Image
 * @text 弱点图片文件名
 * @desc 存放在 img/system/ 下的文件名(无需后缀)。
 * @default Weak
 * @require 1
 * @dir img/system/
 * @type file
 *
 * @param Resist Image
 * @text 抵抗图片文件名
 * @desc 存放在 img/system/ 下的文件名(无需后缀)。
 * @default Resist
 * @require 1
 * @dir img/system/
 * @type file
 *
 * @param Gap Y
 * @text 全局堆叠间距
 * @desc 基础间距。影响所有情况。建议设为 5 或 10。
 * @default 5
 * @type number
 *
 * @param Assumed Height
 * @text 暴击图标准高度
 * @desc [仅暴击生效] 定义暴击图的高度。调大此值可防止暴击时重叠。
 * @default 50
 * @type number
 *
 * @param Non-Crit Offset
 * @text 非暴击修正值
 * @desc [仅无暴击生效] 这是一个额外的Y轴偏移。
 * 正数=向下移动，负数=向上移动。用于独立消除完美破盾时的空行。
 * @default 0
 * @type number
 *
 * @param Debug Mode
 * @text 开启调试日志
 * @desc 按F8在控制台显示判定信息。
 * @type boolean
 * @default true
 *
 * @help
 * ============================================================================
 * Gemini Element Popup Redux (v6.0)
 * ============================================================================
 * 【v6.0 终极更新：分体调校】
 * 为了满足“暴击”和“完美破盾(无暴击)”对位置的不同需求，
 * 本版本将两者的位置计算逻辑解耦。
 *
 * 1. 【全局堆叠间距 (Gap Y)】：
 * - 同时控制两种情况的基础位置。
 *
 * 2. 【暴击图标准高度 (Assumed Height)】：
 * - 仅在出现暴击图时生效。
 * - 用于解决暴击时的重叠问题。
 *
 * 3. 【非暴击修正值 (Non-Crit Offset)】(新功能)：
 * - 仅在没有暴击图（如完美破盾、普通伤害）时生效。
 * - 如果您觉得无暴击时空行太大，请设置一个正数（如 20），
 * 它会让图片单独向下移动，而不影响暴击时的位置。
 *
 * 【参数调整建议】
 * 1. 先调整 [Gap Y] 和 [Assumed Height]，让【暴击时】显示完美。
 * 2. 再观察【无暴击/完美破盾】时的情况：
 * - 如果觉得太高（有空行）：将 [Non-Crit Offset] 设为正数 (如 20)。
 * - 如果觉得太低（压字）：将 [Non-Crit Offset] 设为负数。
 */

(function() {
    var pluginName = "Gemini_ElementPopup_Redux";
    var currentScript = document.currentScript;
    if (currentScript) {
        var src = currentScript.src;
        var parts = src.split("/");
        var lastPart = parts[parts.length - 1];
        if (lastPart.indexOf(".js") > -1) {
            pluginName = lastPart.replace(".js", "");
            pluginName = decodeURIComponent(pluginName);
        }
    }
    
    var parameters = PluginManager.parameters(pluginName);
    var pWeakImg = String(parameters['Weak Image'] || 'Weak');
    var pResistImg = String(parameters['Resist Image'] || 'Resist');
    var pGapY = Number(parameters['Gap Y'] || 5);
    var pAssumedHeight = Number(parameters['Assumed Height'] || 50); 
    var pNonCritOffset = Number(parameters['Non-Crit Offset'] || 0); // 新参数
    var pDebug = (parameters['Debug Mode'] !== 'false');

    console.log("%c[ElementPopup v6.0] 分体调校版已加载!", "color: #00ff00; font-weight: bold;");

    var aesParams = PluginManager.parameters('AdvancedElementSystem');
    var aesWeakColor = aesParams['Weak Color'] || '#ff4444';
    var aesResistColor = aesParams['Resist Color'] || '#66ccff';

    function log(msg, data) {
        if (pDebug) {
            var prefix = "[ElementRedux] ";
            if (data) console.log(prefix + msg, data);
            else console.log(prefix + msg);
        }
    }

    // ========================================================================
    // 扩展 Game_Battler
    // ========================================================================
    var _Game_Battler_executeDamage = Game_Battler.prototype.executeDamage;
    Game_Battler.prototype.executeDamage = function(value) {
        _Game_Battler_executeDamage.call(this, value);
        var result = this.result();
        var rate = result.elementRate;
        if (result._elementRateDisplay !== undefined) rate = result._elementRateDisplay;
        
        if (rate !== undefined && rate !== 1.0) {
            this._geminiPendingElementRate = rate;
        }
    };

    // ========================================================================
    // Setup
    // ========================================================================
    var _Sprite_Damage_setup = Sprite_Damage.prototype.setup;
    Sprite_Damage.prototype.setup = function(target) {
        _Sprite_Damage_setup.call(this, target);
        var type = this.detectElementType(target);
        if (type) {
            var fileName = (type === 'weak') ? pWeakImg : pResistImg;
            this.createGeminiFloater(fileName);
        }
    };

    // ========================================================================
    // 类型判定
    // ========================================================================
    Sprite_Damage.prototype.detectElementType = function(target) {
        var rate = 1.0;
        var source = "none";

        if (target._geminiPendingElementRate !== undefined) {
            rate = target._geminiPendingElementRate;
            source = "buffer";
        } else {
            var result = target.result();
            var checkRate = result._elementRateDisplay;
            if (checkRate === undefined) checkRate = result.elementRate;
            if (checkRate !== undefined && checkRate !== 1.0) {
                rate = checkRate;
                source = "result";
            }
        }

        if (rate === 1.0 && this._rateSprite && this._rateSprite.bitmap) {
            var color = this._rateSprite.bitmap.textColor;
            if (color) {
                if (color.toUpperCase() === aesWeakColor.toUpperCase()) return 'weak';
                if (color.toUpperCase() === aesResistColor.toUpperCase()) return 'resist';
            }
        }

        if (rate !== 1.0) {
            var type = (rate > 1.0) ? 'weak' : 'resist';
            if (source === "buffer") {
                delete target._geminiPendingElementRate;
            }
            return type;
        }
        return null;
    };

    // ========================================================================
    // 创建图片
    // ========================================================================
    Sprite_Damage.prototype.createGeminiFloater = function(fileName) {
        var sprite = new Sprite();
        sprite.bitmap = ImageManager.loadSystem(fileName);
        sprite.anchor.x = 0.5;
        sprite.anchor.y = 1;
        sprite.y = -9999; 
        sprite._isGeminiFloater = true;
        sprite.dy = 0;
        sprite.ry = 0;
        this.addChild(sprite);
        this._geminiFloater = sprite;
    };

    // ========================================================================
    // Update
    // ========================================================================
    var _Sprite_Damage_update = Sprite_Damage.prototype.update;
    Sprite_Damage.prototype.update = function() {
        _Sprite_Damage_update.call(this);
        if (this._geminiFloater) {
            this.updateGeminiFloaterPosition();
            this.updateGeminiFloaterVisibility();
        }
    };

    Sprite_Damage.prototype.updateGeminiFloaterVisibility = function() {
        if (this.visible && this.opacity > 0) {
            this._geminiFloater.visible = true;
            this._geminiFloater.opacity = this.opacity; 
        }
    };

    // ------------------------------------------------------------------------
    // 【核心修复】位置计算
    // ------------------------------------------------------------------------
    Sprite_Damage.prototype.updateGeminiFloaterPosition = function() {
        var floater = this._geminiFloater;
        
        // 1. 基准：伤害数字的头顶
        var highestY = 0; 
        if (this.digitHeight) {
            highestY = -this.digitHeight(); 
        }
        
        var isCritDetected = false; // 标记是否检测到了暴击图

        for (var i = 0; i < this.children.length; i++) {
            var child = this.children[i];
            
            if (child === floater) continue;
            if (!child.visible || child.opacity <= 0) continue;

            // --- A. MOG 弹跳物体 (暴击图) ---
            if (child.yf2 !== undefined) {
                
                // 白名单：只有 Critical 才算
                if (child.bitmap && child.bitmap.url && child.bitmap.url.match(/Critical/i)) {
                    isCritDetected = true;
                    
                    var yByOffset = -child.yf2;
                    var yByReal = child.y;
                    var childBottom = Math.min(yByOffset, yByReal);
                    
                    // 应用暴击标准高度
                    var childVisualTop = childBottom - pAssumedHeight;
                    
                    if (childVisualTop < highestY) {
                        highestY = childVisualTop;
                    }
                }
            }
            // --- B. 普通物体 (AES文字) ---
            else {
                // 忽略 AES 文字
                if (child._maxDuration) continue; 
                
                if (child.y < highestY && Math.abs(child.y) < 500) {
                     highestY = child.y;
                }
            }
        }
        
        // --- 最终计算 ---
        // 基础公式
        var finalY = highestY - pGapY;

        // 如果【没有】检测到暴击图 (说明是普通伤害/完美破盾)，应用额外的修正
        if (!isCritDetected) {
            // pNonCritOffset: 正数向下移动，负数向上移动
            // 在屏幕坐标系中，Y 增加是向下
            finalY += pNonCritOffset;
        }

        floater.y = finalY;
    };

    var _Game_Battler_onTurnEnd = Game_Battler.prototype.onTurnEnd;
    Game_Battler.prototype.onTurnEnd = function() {
        _Game_Battler_onTurnEnd.call(this);
        this._geminiPendingElementRate = undefined;
    };

})();