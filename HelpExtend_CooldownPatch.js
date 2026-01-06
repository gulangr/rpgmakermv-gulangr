/*:
 * @plugindesc HelpExtend 扩展补丁 V5.7 (预热完成自动隐藏版)
 * @author 辅助开发 & RJO
 * @parent HelpExtend
 * * @param --- CD 设置 ---
 * @param CooldownColor
 * @desc 冷却时间文本的颜色 (RGBA格式)
 * @default rgba(255, 160, 60, 1)
 * @param CooldownText
 * @desc 冷却时间的前缀文本
 * @default CD:
 * @param TurnText
 * @desc 回合数的后缀文本
 * @default 回合
 * @param CurrentCDIcon
 * @desc [战斗中] 剩余冷却回合数旁边显示的图标ID (默认20-时钟)
 * @default 20
 *
 * @param --- 预热(Warmup) 设置 ---
 * @param WarmupColor
 * @desc 预热时间文本的颜色 (RGBA格式)
 * @default rgba(100, 200, 255, 1)
 * @param WarmupText
 * @desc 预热时间的前缀文本 (请勿设为空)
 * @default 预热:
 * @param CurrentWarmupIcon
 * @desc [战斗中] 剩余预热回合数旁边显示的图标ID (默认75-沙漏)
 * @default 75
 *
 * @param --- 排版设置 ---
 * @param MenuSpecialHeight
 * @desc [主菜单] 包含图标的特殊行的最小高度。
 * @default 28
 * @param BattleSpecialHeight
 * @desc [战斗中] 仅当【显示图标时】才生效的强制行高。
 * (普通文字会自动变回紧凑高度)
 * @default 18
 * @param SplitLinePadding
 * @desc [分割线] 画线之前预留的空白间距 (像素)。
 * @default 2
 * @param SplitLineYOffset
 * @desc [分割线] 线条垂直位置的微调偏移量。
 * @default 0
 *
 * @param --- 图标间距设置 ---
 * @param IconGap_Normal
 * @desc 普通图标与文字之间的间距 (像素)。
 * @default 4
 * @param IconGap_Charge
 * @desc 元素充能/消耗行 (+/-) 图标与文字的间距。
 * @default -2
 * @param IconCrop_Vertical
 * @desc 元素充能/消耗行 (+/-) 图标上下裁切的像素量。
 * @default 4
 *
 * @help
 * ============================================================================
 * 介绍 (V5.7 - 预热自动隐藏版)
 * ============================================================================
 * * 修改内容：
 *
 * 1. 【预热行自动隐藏】：
 * 战斗中，当技能的预热时间结束（剩余回合=0，图标消失）时，
 * 整行“预热：0回合”的文字也会彻底消失，不再占用任何位置。
 * (CD 行依然保留文字显示，仅隐藏图标)
 *
 * 2. 【智能排版】：
 * 依然包含 V5.6 的动态高度功能，有图标时撑开，无图标时紧凑。
 *
 * * * 放置顺序：
 * 请确保本插件在 HelpExtend.js 的【下方】。
 */

var Imported = Imported || {};
var RJO = RJO || {};
RJO.HE = RJO.HE || {};

(function() {
    
    // --- 参数读取 ---
    var parameters = PluginManager.parameters('HelpExtend_CooldownPatch');
    // CD 参数
    var cdColor = String(parameters['CooldownColor'] || 'rgba(255, 160, 60, 1)');
    var cdTextPrefix = String(parameters['CooldownText'] || 'CD:');
    var cdTextSuffix = String(parameters['TurnText'] || '回合');
    var currentCDIcon = Number(parameters['CurrentCDIcon'] || 20);
    // 预热 参数
    var warmupColor = String(parameters['WarmupColor'] || 'rgba(100, 200, 255, 1)');
    var warmupTextPrefix = String(parameters['WarmupText'] || '预热:');
    var currentWarmupIcon = Number(parameters['CurrentWarmupIcon'] || 75);
    
    var menuSpecialHeight = Number(parameters['MenuSpecialHeight'] || 28);
    // 战斗行高参数
    var battleSpecialHeight = Number(parameters['BattleSpecialHeight'] || 18);

    var splitLinePadding = Number(parameters['SplitLinePadding'] || 2);
    var splitLineYOffset = Number(parameters['SplitLineYOffset'] || 0);

    var iconGapNormal = Number(parameters['IconGap_Normal'] || 4);
    var iconGapCharge = Number(parameters['IconGap_Charge'] || -2); 
    var iconCropVertical = parameters['IconCrop_Vertical'] !== undefined ? Number(parameters['IconCrop_Vertical']) : 4;

    // ==========================================================================
    // 1. 静态数据注入 (CD 和 预热 数据)
    // ==========================================================================
    var _RJO_HE_getSkillBaseDescParams = RJO.HE.getSkillBaseDescParams;
    
    RJO.HE.getSkillBaseDescParams = function(item) {
        if (_RJO_HE_getSkillBaseDescParams) {
            _RJO_HE_getSkillBaseDescParams.call(this, item);
        }

        if (Imported.YEP_X_SkillCooldowns) {
            var size = RJO.HE.ItemDescOtherSize || 20;

            // --- 1. 注入冷却 (CD) ---
            if (item.cooldown) {
                var turns = item.cooldown[item.id];
                if (turns && turns > 0) {
                    var text = cdTextPrefix + turns + cdTextSuffix;
                    item.descParams.push([text, size, cdColor, false]);
                    item.pos[4] = item.descParams.length;
                }
            }

            // --- 2. 注入预热 (Warmup) ---
            if (item.warmup && item.warmup > 0) {
                var wText = warmupTextPrefix + item.warmup + cdTextSuffix; 
                item.descParams.push([wText, size, warmupColor, false]);
                item.pos[4] = item.descParams.length; 
            }
        }
    };

    // 检查 Sprite_ItemHelp 是否存在
    if (typeof Sprite_ItemHelp !== 'undefined') {

        // --- 辅助：判断是否完全隐藏该行 (V5.7 新增) ---
        function shouldHideLine(descItem, item) {
            var text = String(descItem[0] || "");
            
            // 仅在战斗中生效
            if (!$gameParty.inBattle()) return false;
            
            // 检测是否为预热行
            if (warmupTextPrefix && text.indexOf(warmupTextPrefix) === 0) {
                var actor = BattleManager.actor();
                if (actor && item && typeof actor.warmup === 'function') {
                    // 如果剩余预热回合 <= 0，则隐藏该行
                    if (actor.warmup(item.id) <= 0) {
                        return true;
                    }
                }
            }
            return false;
        }

        // --- 智能判断行是否需要增高 ---
        function shouldExpandLine(descItem, item) {
            var text = String(descItem[0] || "");
            
            // 品质行返回 false
            if (text.indexOf("品质") !== -1 || text.indexOf("Quality") !== -1) return false; 

            if ($gameParty.inBattle() && item) {
                 var actor = BattleManager.actor();
                 if (actor) {
                     // 1. 如果是 CD 行
                     if (cdTextPrefix && text.indexOf(cdTextPrefix) === 0) {
                         // 只有当剩余 CD > 0 时，才需要增高
                         if (typeof actor.cooldown === 'function' && actor.cooldown(item.id) > 0) {
                             return true;
                         }
                         return false;
                     }
                     // 2. 如果是 预热 行 (虽然会被隐藏，但保留判断逻辑以防万一)
                     if (warmupTextPrefix && text.indexOf(warmupTextPrefix) === 0) {
                         if (typeof actor.warmup === 'function' && actor.warmup(item.id) > 0) {
                             return true;
                         }
                         return false;
                     }
                 }
            }

            if (descItem[5]) return true; 
            if (text.indexOf("\\I[") !== -1) return true; 

            return false;
        }

        // --- 获取最小行高 ---
        function getMinLineHeight() {
            if (SceneManager._scene && SceneManager._scene instanceof Scene_Battle) {
                return battleSpecialHeight; 
            }
            return menuSpecialHeight;
        }

        // ==========================================================================
        // 2. 核心修复：计算高度
        // ==========================================================================
        Sprite_ItemHelp.prototype.getTextHeight = function() {
            if (this.bitmap) RJO.SW.setContent(this.bitmap);

            var desc = this.item.descParams;
            var y = 2 * this.standardPadding();
            var minH = getMinLineHeight(); 

            for (var i = 0; i < desc.length; i++) {
                if ((!desc[i][0] || desc[i][0] === "") && !desc[i][3]) continue;

                // --- V5.7: 如果需要隐藏，直接跳过高度计算 ---
                if (shouldHideLine(desc[i], this.item)) {
                    continue;
                }

                var textStr = String(desc[i][0]);
                var fontSize = desc[i][1];

                // 强制修复字号
                if (this.bitmap) this.bitmap.fontSize = fontSize;
                RJO.SW.changeTextSize(fontSize);
                
                RJO.SW.setupTextState(textStr, this.standardPadding(), y, this.contentsWidth(), desc[i][4]);
                var currentLineHeight = RJO.SW.textHeight;

                // 智能增高
                if (shouldExpandLine(desc[i], this.item)) {
                     if (currentLineHeight < minH) currentLineHeight = minH;
                }

                y += currentLineHeight;
                
                if (desc[i][3]) {
                    y += splitLinePadding; 
                    y += RJO.HE.ItemDescLineHeight;
                }
            }
            return y;
        };

        // ==========================================================================
        // 3. 动态绘制
        // ==========================================================================
        Sprite_ItemHelp.prototype.drawContents = function() {
            if (this.bitmap) RJO.SW.setContent(this.bitmap);

            var desc = this.item.descParams;
            var y = this.standardPadding();
            var minH = getMinLineHeight();

            for (var i = 0; i < desc.length; i++) {
                if ((!desc[i][0] || desc[i][0] === "") && !desc[i][3]) continue;

                // --- V5.7: 如果需要隐藏，直接跳过绘制 ---
                if (shouldHideLine(desc[i], this.item)) {
                    continue;
                }

                var textToDraw = desc[i][0];
                var fontSize = desc[i][1];

                // 强制修复字号
                if (this.bitmap) {
                    this.bitmap.fontSize = fontSize; 
                    if (RJO.SW.contents) RJO.SW.contents.fontSize = fontSize;
                }

                RJO.SW.changeTextSize(fontSize);
                RJO.SW.changeTextColor(desc[i][2]);
                
                // --- 动态数值处理 ---
                var dynamicValue = 0;
                var isDynamicLine = false;
                var currentIcon = 0; 

                if ($gameParty.inBattle() && textToDraw) {
                     var actor = BattleManager.actor();
                     if (actor && this.item) {
                         var strText = String(textToDraw);
                         
                         // A. CD
                         if (cdTextPrefix && strText.indexOf(cdTextPrefix) === 0) {
                             if (typeof actor.cooldown === 'function') {
                                 dynamicValue = actor.cooldown(this.item.id);
                                 if (dynamicValue > 0) {
                                     isDynamicLine = true;
                                     currentIcon = currentCDIcon;
                                 }
                             }
                         }
                         // B. Warmup
                         else if (warmupTextPrefix && strText.indexOf(warmupTextPrefix) === 0) {
                             if (typeof actor.warmup === 'function') {
                                 dynamicValue = actor.warmup(this.item.id);
                                 if (dynamicValue > 0) {
                                     isDynamicLine = true;
                                     currentIcon = currentWarmupIcon;
                                 }
                             }
                         }
                     }
                     
                     if (isDynamicLine && dynamicValue > 0) {
                         if (textToDraw.indexOf(" " + dynamicValue) === -1) {
                            textToDraw = textToDraw + " " + dynamicValue;
                         }
                     }
                }

                // 计算高度
                RJO.SW.setupTextState(textToDraw, this.standardPadding(), y, this.contentsWidth(), desc[i][4]);
                var realTextHeight = RJO.SW.textHeight;
                var currentLineHeight = realTextHeight;

                if (shouldExpandLine(desc[i], this.item)) {
                     if (currentLineHeight < minH) currentLineHeight = minH;
                }

                var dy = (currentLineHeight - realTextHeight) / 2;

                // 绘制文本
                RJO.SW.drawContentText(textToDraw, this.standardPadding(), y + dy, this.contentsWidth(), desc[i][4]);
                
                // --- 绘制动态图标 ---
                if (isDynamicLine && dynamicValue > 0 && currentIcon > 0) {
                    var iconBitmap = ImageManager.loadSystem('IconSet');
                    
                    var drawDynamicIcon = function() {
                        var pw = Window_Base._iconWidth || 40; 
                        var ph = Window_Base._iconHeight || 40;
                        
                        // 缩放逻辑
                        var srcW = 14; 
                        var srcH = 30;
                        var targetH = minH - 2; 
                        var targetW = Math.round(targetH * (srcW / srcH)); 
                        if (targetW < 10) targetW = 10;

                        var marginX = (pw - srcW) / 2; 
                        var marginY = (ph - srcH) / 2; 
                        var sx = (currentIcon % 16) * pw;
                        var sy = Math.floor(currentIcon / 16) * ph;
                        
                        var textWidth = this.bitmap.measureTextWidth(textToDraw);
                        var gap = 6; 
                        var destX = this.standardPadding() + textWidth + gap;
                        var destY = y + (currentLineHeight - targetH) / 2;
                        
                        this.bitmap.blt(iconBitmap, sx + marginX, sy + marginY, srcW, srcH, destX, destY, targetW, targetH);
                    }.bind(this);

                    if (iconBitmap.isReady()) {
                        drawDynamicIcon();
                    } else {
                        iconBitmap.addLoadListener(drawDynamicIcon);
                    }
                }
                
                // 绘制其他静态图标
                var iconData = desc[i][5];
                if (iconData) {
                    var bitmap = ImageManager.loadSystem(iconData.file);
                    
                    var drawStaticIcon = function() {
                        var measuredText = textToDraw;
                        var currentIconGap = iconGapNormal; 
                        var isElementCharge = false;

                        if (textToDraw.indexOf("+") !== -1 || textToDraw.indexOf("-") !== -1) {
                            measuredText = textToDraw.trim(); 
                            currentIconGap = iconGapCharge;   
                            isElementCharge = true;
                        }

                        var pw = Window_Base._iconWidth;
                        var ph = Window_Base._iconHeight;
                        var sx = iconData.index % 16 * pw;
                        var sy = Math.floor(iconData.index / 16) * ph;

                        var srcX = sx; 
                        var srcY = sy;
                        var srcW = pw;
                        var srcH = ph;

                        if (isElementCharge && iconCropVertical > 0) {
                            srcY += iconCropVertical;       
                            srcH -= (iconCropVertical * 2); 
                        }
                        
                        var sceneRate = 1.0;
                        if (SceneManager._scene && SceneManager._scene instanceof Scene_Battle) {
                            sceneRate = 0.75;
                        }
                        var finalScale = iconData.scale * sceneRate;
                        var targetW = Math.round(srcW * finalScale);
                        var targetH = Math.round(srcH * finalScale);
                        
                        var textWidth = this.bitmap.measureTextWidth(measuredText);
                        var destX = this.standardPadding() + textWidth + currentIconGap;
                        var destY = y + (currentLineHeight - targetH) / 2;

                        this.bitmap.blt(bitmap, srcX, srcY, srcW, srcH, destX, destY, targetW, targetH);
                    }.bind(this);

                    if (bitmap.isReady()) {
                        drawStaticIcon();
                    } else {
                        if (!bitmap._heListenerAdded) {
                            bitmap.addLoadListener(function() {
                                if (this.visible && this.item) this.setItem(this.item);
                            }.bind(this));
                            bitmap._heListenerAdded = true;
                        }
                    }
                }
            
                y += currentLineHeight;
                
                if (desc[i][3]) {
                    y += splitLinePadding; 
                    var lineY = y + (RJO.HE.ItemDescLineHeight / 2) + splitLineYOffset;
                    this.drawHorzLine(lineY);
                    y += RJO.HE.ItemDescLineHeight;
                }
            }
        };
    }

})();