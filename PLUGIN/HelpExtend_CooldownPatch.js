/*:
 * @plugindesc HelpExtend 扩展补丁 v2.0 - 高度自定义排版 & 间距调整
 * @author 辅助开发 & RJO
 * @parent HelpExtend
 * * @param --- CD 设置 ---
 * * @param CooldownColor
 * @desc 冷却时间文本的颜色 (RGBA格式)
 * @default rgba(255, 160, 60, 1)
 * * @param CooldownText
 * @desc 冷却时间的前缀文本
 * @default CD:
 * * @param TurnText
 * @desc 回合数的后缀文本
 * @default 回合
 * * @param CurrentCDIcon
 * @desc 剩余回合数后面显示的图标ID (默认20)
 * @default 20
 * * @param --- 排版设置 ---
 * * @param MenuSpecialHeight
 * @desc [主菜单] 包含品质/图标的特殊行的最小高度。
 * 设为 28 或 30 可减小间距；设为 40 可防止大图标重叠。
 * @default 28
 * * @param SplitLinePadding
 * @desc [分割线] 画线之前预留的空白间距 (像素)。
 * @default 2
 * * @param SplitLineYOffset
 * @desc [分割线] 线条垂直位置的微调偏移量。
 * 正数向下移，负数向上移。
 * @default 0
 * * @help
 * ============================================================================
 * 介绍 (v2.0 - 自定义排版版)
 * ============================================================================
 * 这是一个 HelpExtend 的综合修复补丁。
 * * * * v2.0 新增功能：
 * 1. 【自定义间距】你可以通过参数调整主菜单中“品质”行的高度，
 * 解决间距过大的问题 (建议设为 28)。
 * 2. 【自定义分割线】你可以调整分割线的位置和上方留白。
 * 3. 【图标裁切】保留了 v1.8 的图标裁切方案 (14x30)。
 *
 * * * 常见调整：
 * - 如果觉得主菜单里“品质”和下面的字隔得太远 -> 减小 MenuSpecialHeight
 * - 如果觉得分割线压到了上面的字 -> 增大 SplitLinePadding 或 SplitLineYOffset
 * - 如果觉得分割线离下面的字太近 -> 增大 SplitLinePadding
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
    var cdColor = String(parameters['CooldownColor'] || 'rgba(255, 160, 60, 1)');
    var cdTextPrefix = String(parameters['CooldownText'] || 'CD:');
    var cdTextSuffix = String(parameters['TurnText'] || '回合');
    var currentCDIcon = Number(parameters['CurrentCDIcon'] || 20);
    
    // v2.0 新增参数
    var menuSpecialHeight = Number(parameters['MenuSpecialHeight'] || 28);
    var splitLinePadding = Number(parameters['SplitLinePadding'] || 2);
    var splitLineYOffset = Number(parameters['SplitLineYOffset'] || 0);

    // ==========================================================================
    // 1. 静态数据注入
    // ==========================================================================
    var _RJO_HE_getSkillBaseDescParams = RJO.HE.getSkillBaseDescParams;
    
    RJO.HE.getSkillBaseDescParams = function(item) {
        if (_RJO_HE_getSkillBaseDescParams) {
            _RJO_HE_getSkillBaseDescParams.call(this, item);
        }

        if (Imported.YEP_X_SkillCooldowns && item.cooldown) {
            var turns = item.cooldown[item.id];
            if (turns && turns > 0) {
                var text = cdTextPrefix + turns + cdTextSuffix;
                var size = RJO.HE.ItemDescOtherSize || 20;
                item.descParams.push([text, size, cdColor, false]);
                item.pos[4] = item.descParams.length;
            }
        }
    };

    // 检查 Sprite_ItemHelp 是否存在
    if (typeof Sprite_ItemHelp !== 'undefined') {

        // --- 智能判断行是否需要增高 ---
        function shouldExpandLine(descItem) {
            var text = String(descItem[0] || "");
            
            // CD 行在战斗中需要增高
            if (text.indexOf(cdTextPrefix) === 0) {
                return $gameParty.inBattle();
            }

            // 其他带有图标或特殊关键词的行
            if (descItem[5]) return true; 
            if (text.indexOf("\\I[") !== -1) return true; 
            if (text.indexOf("品质") !== -1) return true; 

            return false;
        }

        // --- 获取最小行高 (核心修改) ---
        function getMinLineHeight() {
            // 战斗中: 适应裁切后的图标 (30px), 设为 32 比较稳妥
            if (SceneManager._scene && SceneManager._scene instanceof Scene_Battle) {
                return 32; 
            }
            
            // 主菜单: 使用用户自定义的高度 (v2.0)
            // 默认 28px，比之前的 40px 紧凑很多
            return menuSpecialHeight;
        }

        // ==========================================================================
        // 2. 核心修复：计算高度
        // ==========================================================================
        Sprite_ItemHelp.prototype.getTextHeight = function() {
            var desc = this.item.descParams;
            var y = 2 * this.standardPadding();
            var minH = getMinLineHeight(); 

            for (var i = 0; i < desc.length; i++) {
                if ((!desc[i][0] || desc[i][0] === "") && !desc[i][3]) continue;

                RJO.SW.changeTextSize(desc[i][1]);
                var currentLineHeight = RJO.SW.textHeight;

                if (shouldExpandLine(desc[i])) {
                     if (currentLineHeight < minH) {
                         currentLineHeight = minH;
                     }
                }

                RJO.SW.setupTextState(desc[i][0], this.standardPadding(), y, this.contentsWidth(), desc[i][4]);
                y += currentLineHeight;
                
                // [v2.0] 分割线间距
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
            var desc = this.item.descParams;
            var y = this.standardPadding();
            var minH = getMinLineHeight();

            for (var i = 0; i < desc.length; i++) {
                if ((!desc[i][0] || desc[i][0] === "") && !desc[i][3]) continue;

                RJO.SW.changeTextSize(desc[i][1]);
                RJO.SW.changeTextColor(desc[i][2]);
                
                var currentLineHeight = RJO.SW.textHeight;
                if (shouldExpandLine(desc[i])) {
                     if (currentLineHeight < minH) {
                         currentLineHeight = minH;
                     }
                }

                var dy = (currentLineHeight - RJO.SW.textHeight) / 2;

                // --- 1. 处理文本 ---
                var textToDraw = desc[i][0];
                var cdValue = 0;
                var isCDLine = false;

                if ($gameParty.inBattle() && textToDraw && String(textToDraw).indexOf(cdTextPrefix) === 0) {
                     var actor = BattleManager.actor();
                     if (actor && this.item && typeof actor.cooldown === 'function') {
                         cdValue = actor.cooldown(this.item.id);
                         if (cdValue > 0) {
                             textToDraw = textToDraw + " " + cdValue;
                             isCDLine = true;
                         }
                     }
                }

                RJO.SW.drawContentText(textToDraw, this.standardPadding(), y + dy, this.contentsWidth(), desc[i][4]);
                
                // --- 2. 手动绘制裁剪图标 (14x30) ---
                if (isCDLine && cdValue > 0) {
                    var iconBitmap = ImageManager.loadSystem('IconSet');
                    
                    if (iconBitmap && iconBitmap.width > 0) {
                        var pw = Window_Base._iconWidth || 40; 
                        var ph = Window_Base._iconHeight || 40;
                        
                        var targetW = 14; // 宽 14
                        var targetH = 30; // 高 30
                        
                        var marginX = (pw - targetW) / 2; 
                        var marginY = (ph - targetH) / 2; 

                        var sx = (currentCDIcon % 16) * pw;
                        var sy = Math.floor(currentCDIcon / 16) * ph;
                        
                        var cropSX = sx + marginX;
                        var cropSY = sy + marginY;

                        var textWidth = this.bitmap.measureTextWidth(textToDraw);
                        var gap = 6; 
                        var destX = this.standardPadding() + textWidth + gap;
                        
                        var destY = y + (currentLineHeight - targetH) / 2;

                        this.bitmap.blt(iconBitmap, cropSX, cropSY, targetW, targetH, destX, destY, targetW, targetH);
                    }
                }
                
                // 3. 原有图标
                var iconData = desc[i][5];
                if (iconData) {
                    var bitmap = ImageManager.loadSystem(iconData.file);
                    if (bitmap.isReady()) {
                        var textWidth = this.bitmap.measureTextWidth(desc[i][0]);
                        var iconGap = 4;
                        var destX = this.standardPadding() + textWidth + iconGap;
                        
                        var pw = Window_Base._iconWidth;
                        var ph = Window_Base._iconHeight;
                        var sx = iconData.index % 16 * pw;
                        var sy = Math.floor(iconData.index / 16) * ph;
                        
                        var sceneRate = 1.0;
                        if (SceneManager._scene && SceneManager._scene instanceof Scene_Battle) {
                            sceneRate = 0.75;
                        }
                        var finalScale = iconData.scale * sceneRate;
                        var targetW = Math.round(pw * finalScale);
                        var targetH = Math.round(ph * finalScale);
                        
                        var destY = y + (currentLineHeight - targetH) / 2;
                        this.bitmap.blt(bitmap, sx, sy, pw, ph, destX, destY, targetW, targetH);
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
                
                // [v2.0] 绘制分割线
                if (desc[i][3]) {
                    y += splitLinePadding; // 加上参数设置的间距
                    
                    // 计算线条 Y 坐标 (基准 + 偏移参数)
                    var lineY = y + (RJO.HE.ItemDescLineHeight / 2) + splitLineYOffset;
                    
                    this.drawHorzLine(lineY);
                    
                    y += RJO.HE.ItemDescLineHeight;
                }
            }
        };
    }

})();