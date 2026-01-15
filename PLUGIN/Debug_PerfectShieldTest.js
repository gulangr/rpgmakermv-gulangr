/*:
 * @plugindesc (Debug Tool v3.1) 完美破盾/溢出破盾测试工具 (修复首发失效)
 * @author Gemini Assistant
 *
 * @param Test Key
 * @text 模拟测试键
 * @desc 战斗中选中敌人时按下此键触发。(默认 84 = T键)
 * @default 84
 * @type number
 *
 * @param Force Critical
 * @text 是否强制暴击
 * @desc 测试时是否强制触发暴击？(ON=必定暴击, OFF=必定不暴击)
 * @type boolean
 * @default true
 *
 * @param Overflow Mode
 * @text 溢出伤害模式
 * @desc ON = 造成“护盾+100”的伤害(测试HP弹窗)。OFF = 造成“等于护盾”的伤害(测试完美破盾)。
 * @type boolean
 * @default false
 *
 * @help
 * ============================================================================
 * Debug Perfect Shield Test (v3.1)
 * ============================================================================
 * 【v3.1 修复说明】
 * 修复了“第一次攻击时不生效，只有后续攻击才生效”的BUG。
 * 原理：将按键注册逻辑提早到游戏启动时，确保首次按键能被正确识别。
 *
 * 【模式说明】
 * 1. 完美破盾模式 (Overflow Mode = false):
 * - 伤害值会被强制修正为【敌人的当前护盾值】(例如 300)。
 * - 结果：护盾归零，HP伤害为0。
 *
 * 2. 溢出破盾模式 (Overflow Mode = true):
 * - 伤害值会被强制修正为【敌人的当前护盾值 + 100】(例如 400)。
 * - 结果：护盾归零，并产生 100 点 HP 伤害。
 */

(function() {
    var parameters = PluginManager.parameters('Debug_PerfectShieldTest');
    var pTestKey = Number(parameters['Test Key'] || 84); 
    var pForceCrit = (parameters['Force Critical'] === 'true');
    var pOverflow = (parameters['Overflow Mode'] === 'true');

    // --- 修复核心：在插件加载时立即注册按键 ---
    // 这样游戏启动后，Input系统就会立即开始监听这个键
    var keyName = 'perfect_shield_test';
    if (!Input.keyMapper[pTestKey]) {
        Input.keyMapper[pTestKey] = keyName;
        console.log("⚡ [Debug Tool] 测试键已注册: KeyCode " + pTestKey + " -> " + keyName);
    }

    // 拦截伤害计算
    var _Game_Action_makeDamageValue = Game_Action.prototype.makeDamageValue;
    Game_Action.prototype.makeDamageValue = function(target, critical) {
        var value = _Game_Action_makeDamageValue.call(this, target, critical);
        
        // 检测按键状态
        // 增加 Input.isLongPressed 以防手速过快或过慢
        if (Input.isPressed(keyName) || Input.isLongPressed(keyName)) { 
             if (target.barrierPoints() > 0) {
                 var finalDmg = target.barrierPoints();
                 
                 // 如果开启了溢出模式，额外加 100 伤害
                 if (pOverflow) {
                     finalDmg += 100;
                     console.log("%c⚡ [测试触发] 溢出破盾模拟! 伤害修正为: " + finalDmg + " (护盾+100)", "color: red; font-weight: bold;");
                 } else {
                     console.log("%c⚡ [测试触发] 完美破盾模拟! 伤害修正为: " + finalDmg + " (精确等于护盾)", "color: orange; font-weight: bold;");
                 }
                 
                 return finalDmg; 
             } else {
                 console.log("⚡ [测试跳过] 目标没有护盾，不做修正。");
             }
        }
        return value;
    };
    
    // 拦截暴击计算
    var _Game_Action_itemCri = Game_Action.prototype.itemCri;
    Game_Action.prototype.itemCri = function(target) {
        if (Input.isPressed(keyName) || Input.isLongPressed(keyName)) {
            if (pForceCrit) return 1.0; 
            else return 0.0; 
        }
        return _Game_Action_itemCri.call(this, target);
    };

    // Redux 监控部分 (保持不变，用于调试位置)
    if (Sprite_Damage.prototype.updateGeminiFloaterPosition) {
        var _original_updatePosition = Sprite_Damage.prototype.updateGeminiFloaterPosition;
        Sprite_Damage.prototype.updateGeminiFloaterPosition = function() {
            _original_updatePosition.call(this);
            var floater = this._geminiFloater;
            if (!floater || !floater.visible) return;
            if (!this._debugLogCount) this._debugLogCount = 0;
            if (this._debugLogCount > 5) return; 
            this._debugLogCount++;

            console.group("🔍 Redux 坐标监控 (帧 " + this._debugLogCount + ")");
            console.log("--- 扫描环境 ---");
            var highestY = 0;
            if (this.digitHeight) {
                highestY = -this.digitHeight();
                console.log(`[基准] 伤害数字顶: ${highestY}`);
            }

            for (var i = 0; i < this.children.length; i++) {
                var child = this.children[i];
                if (child === floater) continue;
                if (!child.visible) continue;

                if (child.yf2 !== undefined) {
                    var type = "未知MOG物体";
                    if (child.bitmap && child.bitmap.url) {
                        if (child.bitmap.url.match(/Critical/i)) type = "暴击图片";
                        else if (child.bitmap.url.match(/Barrier/i)) type = "护盾图片";
                    }

                    console.log(`📡 发现: [${type}]`);
                    console.log(`   yf2(弹跳): ${child.yf2}`);
                    console.log(`   y(真实): ${child.y}`);
                    
                    var yByOffset = -child.yf2;
                    var yByReal = child.y;
                    var bottom = Math.min(yByOffset, yByReal);
                    console.log(`   👉 判定底部(Min): ${bottom}`);
                }
            }

            console.log("--- 最终结果 ---");
            console.log(`📍 弱点图(Floater) Y坐标: ${floater.y}`);
            console.log("----------------");
            console.groupEnd();
        };
        
        var _Sprite_Damage_setup = Sprite_Damage.prototype.setup;
        Sprite_Damage.prototype.setup = function(target) {
            this._debugLogCount = 0;
            _Sprite_Damage_setup.call(this, target);
        };
    }

})();