//=============================================================================
// STV_BeastBook.js
//=============================================================================
 
/*:
 * @plugindesc v4.8 - STV_BeastBook (Gemini Radar Fix)
 * || 为您的游戏添加一个怪物图鉴 (Beast Register)
 * @author SkottyTV (Modified by Gemini)
 *
 * @param ----- Window (窗口设置) -----
 *
 * @param Show Window
 * @text 显示窗口
 * @desc 显示或隐藏窗口皮肤。
 * TRUE = 显示窗口 / FALSE = 隐藏窗口
 * @default TRUE
 *
 * @param Background Picture
 * @text 背景图片
 * @desc 指定 img/pictures/ 文件夹下的背景图片文件名。
 * (留空则不使用背景图片)
 * @default
 *
 * @param Show Background Enemy
 * @text 显示背景敌人
 * @desc 是否在背景中显示敌人的立绘。
 * (TRUE = 显示 // FALSE = 隐藏)
 * @default TRUE
 *
 * @param Show Battle Back
 * @text 显示战斗背景
 * @desc 是否显示首次击杀/遭遇时的战斗背景图。
 * (TRUE = 显示 // FALSE = 隐藏)
 * @default TRUE
 *
 * @param Default Battle Back
 * @text 默认战斗背景
 * @desc 默认的战斗背景图片路径。
 * (如果通过插件指令添加怪物且无记录时使用) !(请使用 "/")
 * @default img/parallaxes/BlueSky.png
 *
 * @param Battle Back Index
 * @text 战斗背景层级
 * @desc 战斗背景的 Z 轴位置。
 * (0 = 在窗口皮肤后面 // 1 = 在窗口皮肤上面)
 * @default 0
 *
 * @param ----- ASV (侧视动画) -----
 *
 * @param ASV Animation Speed
 * @text ASV 动画速度
 * @desc ASV 战斗图的动画播放速度。
 * (数值越大动画越慢)
 * @default 10
 *
 * @param ASV Animated Pattern
 * @text ASV 动画模式
 * @desc 想要显示的 ASV 图案模式。
 * (默认 0 = 左上角的 3 张图片)
 * @default 0
 *
 * @param ----- Functions (功能设置) -----
 *
 * @param Max Beasts
 * @text 最大收录数量
 * @desc 图鉴使用的怪物数量上限。(数据库中的前 X 个)
 * (留空则使用全部怪物)
 * @default
 *
 * @param Fill Behavior
 * @text 图鉴填充方式
 * @desc 图鉴如何被填充信息。
 * 1 = 遭遇时 / 2 = 击杀时 / 3 = 无 (仅通过插件指令)
 * @default 2
 *
 * @param ID in front of Name
 * @text 名字前显示ID
 * @desc 是否在怪物名字前显示 ID。
 * TRUE = "4 - 史莱姆" / FALSE = "史莱姆"
 * @default TRUE
 *
 * @param ID in front of Unknown Enemy
 * @text 未知敌人前显示ID
 * @desc 是否在未知敌人的名字前显示 ID。
 * TRUE = "4 - ???" / FALSE = "???"
 * @default TRUE
 *
 * @param Animate Enemy
 * @text 敌人动画
 * @desc 选择是否让敌人图像进行动画显示（呼吸效果）。
 * TRUE = 动画 / FALSE =以此静止
 * @default TRUE
 *
 * @param Backbar Opacity
 * @text 背景栏不透明度
 * @desc 设置信息背景栏的不透明度。
 * 255 = 完全不透明 / 0 = 不可见
 * @default 130
 *
 * @param Count Discovered Variable
 * @text 已发现数量变量
 * @desc 将已发现的敌人数量存入指定 ID 的变量中。
 * @default 0
 *
 * @param Book Full Switch
 * @text 图鉴全满开关
 * @desc 当图鉴收集完成时，打开指定 ID 的开关。
 * @default 0
 *
 * @param Exp Icon
 * @text 经验值图标
 * @desc 设置显示经验值 (EXP) 的图标 ID。
 * @default 189
 *
 * @param Gold Icon
 * @text 金币图标
 * @desc 设置显示金币 (Gold) 的图标 ID。
 * @default 314
 *
 * @param ----- Text (文本设置) -----
 *
 * @param Unknown Info
 * @text 未知信息文本
 * @desc “未知信息”显示的文本内容。
 * @default ???
 *
 * @param None Data
 * @text 无数据文本
 * @desc “无数据”显示的文本内容。
 * @default none
 *
 * @param Drops Text
 * @text 掉落物品标题
 * @desc 敌人掉落物品栏的标题文本。
 * @default Items:
 *
 * @param Skills Text
 * @text 技能标题
 * @desc 敌人技能栏的标题文本。
 * @default Skills:
 *
 * @param Weakness Text
 * @text 弱点标题
 * @desc 属性抗性/弱点窗口的标题文本。
 * @default Weakness
 *
 * @param Kill Counter Text
 * @text 击杀统计标题
 * @desc 击杀计数器的标题文本。
 * @default Kills:
 *
 * @param ----- Elements Window (抗性窗口设置) -----
 *
 * @param Display Elements
 * @text 显示元素ID
 * @desc 填入要显示的元素ID，用逗号分隔。(最多6个，对应3列2行)
 * @default 1,2,3,4,5,6
 *
 * @param Element Column Spacing
 * @text 元素列间距
 * @desc 弱点/抗性每列之间的额外水平间距(像素)。
 * @default 0
 *
 * @param Element Text Gap
 * @text 元素文字间距
 * @desc 元素名称和百分比数值之间的间距(像素)。
 * @default 5
 *
 * @param State Resistance Text
 * @text 状态抗性标题
 * @desc 状态抗性部分的标题文本。
 * @default State Res
 *
 * @param Display States
 * @text 显示状态ID
 * @desc 填入要显示的状态ID，用逗号分隔。(最多10个，对应2列5行)
 * @default 1,4,5,6,8,9,10,12,13,14
 *
 * @param State Column Spacing
 * @text 状态列间距
 * @desc 状态抗性每列之间的额外水平间距(像素)。
 * @default 10
 *
 * @param State Text Gap
 * @text 状态文字间距
 * @desc 状态名称和百分比数值之间的间距(像素)。
 * @default 5
 *
 * @param Label Offset Y
 * @text 标签Y轴偏移
 * @desc 弱点/抗性标签相对于行的垂直偏移量(像素)。
 * @default -2
 *
 * @param ----- Colors (颜色设置) -----
 *
 * @param Drops Success Color
 * @text 掉落率颜色
 * @desc 掉落物品成功率的默认颜色 ID。
 * @default 6
 *
 * @param Skills Color
 * @text 技能颜色
 * @desc 技能名称的默认颜色 ID。
 * @default 3
 *
 * @param Unknown Color
 * @text 未知信息颜色
 * @desc “未知”信息的默认颜色 ID。
 * @default 7
 *
 * @param ----- Switches (开关设置) -----
 *
 * @param Info Window Switch
 * @text 信息窗口开关
 * @desc 选择一个开关 ID 来控制信息窗口的显示。
 * (留空或 "0" 则永久显示该窗口)
 * @default 0
 *
 * @param Weakness Window Switch
 * @text 弱点窗口开关
 * @desc 选择一个开关 ID 来控制弱点窗口的显示。
 * (留空或 "0" 则永久显示该窗口)
 * @default 0
 *
 * @param Parameter Window Switch
 * @text 属性窗口开关
 * @desc 选择一个开关 ID 来控制属性窗口的显示。
 * (留空或 "0" 则永久显示该窗口)
 * @default 0
 *
 * @param Show Items Switch
 * @text 显示物品开关
 * @desc 控制物品栏显示的开关 ID。
 * (留空或 "0" 则永久显示物品)
 * @default 0
 *
 * @param Show Skills Switch
 * @text 显示技能开关
 * @desc 控制技能栏显示的开关 ID。
 * (留空或 "0" 则永久显示技能)
 * @default 0
 *
 * @param Show EXP Switch
 * @text 显示经验开关
 * @desc 控制经验值显示的开关 ID。
 * (留空或 "0" 则永久显示经验值)
 * @default 0
 *
 * @param Show Gold Switch
 * @text 显示金币开关
 * @desc 控制金币显示的开关 ID。
 * (留空或 "0" 则永久显示金币)
 * @default 0
 *
 * @param Show Kill Counter Switch
 * @text 显示击杀统计开关
 * @desc 控制击杀计数器显示的开关 ID。
 * (留空或 "0" 则永久显示击杀计数器)
 * @default 0
 *
 * @param ----- Kill Counter (击杀统计) -----
 *
 * @param Max Kills Value
 * @text 最大击杀数
 * @desc 达成成就所需的默认击杀数量。
 * (会被插件指令 "BeastBook maxkills" 覆盖)
 * @default 25
 *
 * @param Kills Achievment Start Switch
 * @text 击杀成就起始开关
 * @desc 达成击杀成就时开启的开关起始 ID。
 * (例如: 设置为 500，则敌人 ID 17 达成成就时会开启开关 517)
 * @default 0
 *
 * @param Kills Bar Color 1
 * @text 击杀条颜色 1
 * @desc 击杀计数条的第一种颜色 ID。
 * @default 6
 *
 * @param Kills Bar Color 2
 * @text 击杀条颜色 2
 * @desc 击杀计数条的第二种颜色 ID。
 * @default 17
 * * @param ----- Fixes & Scaling (修复与缩放) -----
 * @param Skill Offset X
 * @text 技能偏移 X
 * @desc 将技能名称和图标向左移动 X 像素，以防止右侧被遮挡。
 * (根据需要调整数值，例如 10 或 20)
 * @default 0
 * * @param Skill Icon Scale
 * @text 技能图标缩放
 * @desc 技能图标的缩放比例。
 * (1.0 = 100% 大小, 0.8 = 80% 大小)
 * @default 1.0
 * * @param Drop Icon Scale
 * @text 掉落物图标缩放
 * @desc 掉落物品图标的缩放比例。
 * (1.0 = 100% 大小, 0.8 = 80% 大小)
 * @default 1.0
 * * @param ----- Tooltip (说明悬浮窗) -----
 * @param Tooltip Width
 * @text 说明窗口宽度
 * @desc 弹出的技能/物品说明窗口的宽度（像素）。
 * @default 300
 * * @param Tooltip Font Size
 * @text 说明字体大小
 * @desc 说明窗口内的文字大小。
 * @default 22
 * * @param ----- Stats Page Style (属性页样式) -----
 * @param Stats Background Color
 * @text 属性背景颜色
 * @desc 属性（包括8维属性、Exp、Gold、第二页详细参数）的背景矩形颜色。
 * @default #000000
 * * @param Stats Background Opacity
 * @text 属性背景透明度
 * @desc 属性背景的不透明度 (0-255)。
 * @default 130
 * * @param Stats Chamfer Size
 * @text 属性切角大小
 * @desc 背景矩形左上角和右下角的切角大小（像素）。
 * @default 10
 *
 * @param ----- Description (描述设置) -----
 * @param No Desc Text
 * @text 无注释文本
 * @desc 当怪物没有图鉴注释时显示的文本。
 * @default 该魔物无任何记录...
 *
 * @param Desc Vertical Margin
 * @text 说明框上下边距
 * @desc 底部说明框顶部和底部的隐形区域高度（像素）。
 * @default 10
 * * @param Desc Side Margin
 * @text 注释两侧边距
 * @desc 底部大注释框两侧不显示文字的留空宽度。
 * @default 40
 * * @param Desc Line Height
 * @text 说明文字行高
 * @desc 底部说明框内文字的行间距（像素）。(默认通常为36，调小可紧凑)
 * @default 28
 *
 * @param ----- Radar Chart (雷达图) -----
 * @param Show Radar
 * @text 显示雷达图
 * @type boolean
 * @on 显示
 * @off 隐藏
 * @default true
 *
 * @param Radar X
 * @text 雷达图 X 坐标
 * @desc 雷达图中心在信息窗口中的 X 坐标。
 * @default 120
 *
 * @param Radar Y
 * @text 雷达图 Y 坐标
 * @desc 雷达图中心在信息窗口中的 Y 坐标。
 * @default 120
 *
 * @param Radar Scale
 * @text 雷达图缩放
 * @desc 整体大小缩放百分比 (100 = 原大小)。
 * @default 100
 *
 * @param Radar Opacity
 * @text 雷达图透明度
 * @desc 整体不透明度 (0-255)。
 * @default 200
 *
 * @param Radar Radius
 * @text 雷达图半径
 * @desc 雷达图的基础半径大小。
 * @default 50
 *
 * @param Radar Fill Color
 * @text 雷达填充颜色
 * @desc css 颜色格式 (例如: rgba(100, 200, 255, 0.6))。
 * @default rgba(100, 200, 255, 0.6)
 *
 * @param Radar Stroke Color
 * @text 雷达边框颜色
 * @desc css 颜色格式 (例如: rgba(255, 255, 255, 0.8))。
 * @default rgba(255, 255, 255, 0.8)
 *
 * @param Radar Label Font Size
 * @text 雷达字体大小
 * @default 14
 *
 * @help
 * ============================================================================
 * 更新说明 v4.8 (Gemini Radar Fix)
 * ============================================================================
 * 1. 修复了雷达图消失的问题：
 * - 修正了参数 Show Radar 的布尔值判断逻辑。
 * - 兼容编辑器保存的 "true" (小写) 和旧版 "TRUE" (大写)。
 *
 * ============================================================================
 * 更新说明 v4.7 (Gemini Radar & Desc Update)
 * ============================================================================
 * 1. 新增功能：8维属性雷达图 (Radar Chart)
 * - 在信息窗口 (Info Window) 中显示 HP, MP, 攻, 防, 魔攻, 魔防, 敏, 幸。
 * - 可自定义位置、大小、透明度、颜色。
 * - 上限判定兼容 Gemini_LimitBonusPatch。
 *
 * 2. 改进描述文本设置：
 * - 新增 "无注释文本" 设置：当怪物没有配置图鉴注释时，显示该默认文本。
 * - 新增 "说明框上下边距" 设置：控制底部说明框上下方的留白隐形区域。
 */
 
// ----------------------------------------------------------------------------------------------------------------------------
// STV_BeastBook Parameters
// ----------------------------------------------------------------------------------------------------------------------------
    var stv_BeastBook_parameters = PluginManager.parameters('STV_BeastBook');
   
    //----- Window -----
    var stv_BeastBook_showWindow = String(stv_BeastBook_parameters['Show Window'] || 'TRUE');
    var stv_BeastBook_bgPicture = String(stv_BeastBook_parameters['Background Picture'] || '');
    var stv_BeastBook_showBgBeast = String(stv_BeastBook_parameters['Show Background Enemy'] || 'TRUE');
    var stv_BeastBook_showBattleBack = String(stv_BeastBook_parameters['Show Battle Back'] || 'TRUE');
    var stv_BeastBook_defaultBattleBack = String(stv_BeastBook_parameters['Default Battle Back'] || 'img/parallaxes/BlueSky.png');
    var stv_BeastBook_battleBackIndex = Number(stv_BeastBook_parameters['Battle Back Index'] || 0);
   
    //--- Animated Side View ---
    var stv_BeastBook_asvSpeed = Number(stv_BeastBook_parameters['ASV Animation Speed'] || 10);
    var stv_BeastBook_asvPattern = Number(stv_BeastBook_parameters['ASV Animated Pattern'] || 0);
   
    //----- Functions -----
    var stv_BeastBook_fillBehavior = String(stv_BeastBook_parameters['Fill Behavior'] || '2');
    var stv_BeastBook_showID = String(stv_BeastBook_parameters['ID in front of Name'] || 'TRUE');
    var stv_BeastBook_showIDunknown = String(stv_BeastBook_parameters['ID in front of Unknown Enemy'] || 'TRUE');
    var stv_BeastBook_animateBeast = String(stv_BeastBook_parameters['Animate Enemy'] || 'TRUE');
    var stv_BeastBook_bbOpacity = Number(stv_BeastBook_parameters['Backbar Opacity'] || 130);
    var stv_BeastBook_expIcon = Number(stv_BeastBook_parameters['Exp Icon'] || 189);
    var stv_BeastBook_goldIcon = Number(stv_BeastBook_parameters['Gold Icon'] || 314);
    var stv_BeastBook_countDiscovered = Number(stv_BeastBook_parameters['Count Discovered Variable'] || 0);
    var stv_BeastBook_bookFullSwitch = Number(stv_BeastBook_parameters['Book Full Switch'] || 0);
    var stv_BeastBook_maxBeasts = Number(stv_BeastBook_parameters['Max Beasts']);
 
    //----- Text -----
    var stv_BeastBook_unknownData = String(stv_BeastBook_parameters['Unknown Info'] || '???');
    var stv_BeastBook_noData = String(stv_BeastBook_parameters['None Data'] || 'none');
    var stv_BeastBook_dropsText = String(stv_BeastBook_parameters['Drops Text'] || 'Items:');
    var stv_BeastBook_skillsText = String(stv_BeastBook_parameters['Skills Text'] || 'Skills:');
    var stv_BeastBook_weaknessText = String(stv_BeastBook_parameters['Weakness Text'] || 'Weakness');
    var stv_BeastBook_killsText = String(stv_BeastBook_parameters['Kill Counter Text'] || 'Kills:');

    //----- Elements Window Settings (New) -----
    var stv_BeastBook_displayElements = String(stv_BeastBook_parameters['Display Elements'] || '1,2,3,4,5,6').split(',').map(Number);
    var stv_BeastBook_elementColSpacing = Number(stv_BeastBook_parameters['Element Column Spacing'] || 0);
    var stv_BeastBook_elementTextGap = Number(stv_BeastBook_parameters['Element Text Gap'] || 5);
    var stv_BeastBook_stateResText = String(stv_BeastBook_parameters['State Resistance Text'] || 'State Res');
    var stv_BeastBook_displayStates = String(stv_BeastBook_parameters['Display States'] || '1,4,5,6,8,9,10,12,13,14').split(',').map(Number);
    var stv_BeastBook_stateColSpacing = Number(stv_BeastBook_parameters['State Column Spacing'] || 10);
    var stv_BeastBook_stateTextGap = Number(stv_BeastBook_parameters['State Text Gap'] || 5);
    var stv_BeastBook_labelOffsetY = Number(stv_BeastBook_parameters['Label Offset Y'] || -2);
   
    //----- Colors -----
    var stv_BeastBook_unknownColor = Number(stv_BeastBook_parameters['Unknown Color'] || 7);
    var stv_BeastBook_skillsColor = Number(stv_BeastBook_parameters['Skills Color'] || 3);
    var stv_BeastBook_dropsSuccessColor = Number(stv_BeastBook_parameters['Drops Success Color'] || 6);
   
    //----- Switches -----
    var stv_BeastBook_statusSwitch = Number(stv_BeastBook_parameters['Info Window Switch'] || 0);
    var stv_BeastBook_elementsSwitch = Number(stv_BeastBook_parameters['Weakness Window Switch'] || 0);
    var stv_BeastBook_parameterSwitch = Number(stv_BeastBook_parameters['Parameter Window Switch'] || 0);
    var stv_BeastBook_showItemsSwitch = Number(stv_BeastBook_parameters['Show Items Switch'] || 0);
    var stv_BeastBook_showSkillsSwitch = Number(stv_BeastBook_parameters['Show Skills Switch'] || 0);
    var stv_BeastBook_showExpSwitch = Number(stv_BeastBook_parameters['Show EXP Switch'] || 0);
    var stv_BeastBook_showGoldSwitch = Number(stv_BeastBook_parameters['Show Gold Switch'] || 0);
    var stv_BeastBook_showKillCounterSwitch = Number(stv_BeastBook_parameters['Show Kill Counter Switch'] || 0);
   
    //----- Kill Counter -----
    var stv_BeastBook_maxKills = Number(stv_BeastBook_parameters['Max Kills Value'] || 25);
    var stv_BeastBook_killsCountColor1 = Number(stv_BeastBook_parameters['Kills Bar Color 1'] || 6);
    var stv_BeastBook_killsCountColor2 = Number(stv_BeastBook_parameters['Kills Bar Color 2'] || 17);
    var stv_BeastBook_killAchievmentSwitch = Number(stv_BeastBook_parameters['Kills Achievment Start Switch'] || 0);
    
    //----- Fixes & Scaling -----
    var stv_BeastBook_skillOffsetX = Number(stv_BeastBook_parameters['Skill Offset X'] || 0);
    var stv_BeastBook_skillIconScale = Number(stv_BeastBook_parameters['Skill Icon Scale'] || 1.0);
    var stv_BeastBook_dropIconScale = Number(stv_BeastBook_parameters['Drop Icon Scale'] || 1.0);
    
    //----- Tooltip -----
    var stv_BeastBook_tooltipWidth = Number(stv_BeastBook_parameters['Tooltip Width'] || 300);
    var stv_BeastBook_tooltipFontSize = Number(stv_BeastBook_parameters['Tooltip Font Size'] || 22);

    //----- Stats Page Style -----
    var stv_BeastBook_statsBgColor = String(stv_BeastBook_parameters['Stats Background Color'] || '#000000');
    var stv_BeastBook_statsBgOpacity = Number(stv_BeastBook_parameters['Stats Background Opacity'] || 130);
    var stv_BeastBook_statsChamfer = Number(stv_BeastBook_parameters['Stats Chamfer Size'] || 10);
    var stv_BeastBook_descSideMargin = Number(stv_BeastBook_parameters['Desc Side Margin'] || 40);
    var stv_BeastBook_descLineHeight = Number(stv_BeastBook_parameters['Desc Line Height'] || 28);
    
    //----- New Description Settings -----
    var stv_BeastBook_noDescText = String(stv_BeastBook_parameters['No Desc Text'] || '该魔物无任何记录...');
    var stv_BeastBook_descVMargin = Number(stv_BeastBook_parameters['Desc Vertical Margin'] || 10);

    //----- New Radar Settings (Fix: Case Insensitive) -----
    // 将字符串转换为小写后比较，确保 "true" 和 "TRUE" 都能被识别为 true
    var stv_BeastBook_showRadar = String(stv_BeastBook_parameters['Show Radar'] || 'true').toLowerCase() === 'true';
    
    var stv_BeastBook_radarX = Number(stv_BeastBook_parameters['Radar X'] || 100);
    var stv_BeastBook_radarY = Number(stv_BeastBook_parameters['Radar Y'] || 120);
    var stv_BeastBook_radarScale = Number(stv_BeastBook_parameters['Radar Scale'] || 100);
    var stv_BeastBook_radarOpacity = Number(stv_BeastBook_parameters['Radar Opacity'] || 200);
    var stv_BeastBook_radarRadius = Number(stv_BeastBook_parameters['Radar Radius'] || 50);
    var stv_BeastBook_radarFill = String(stv_BeastBook_parameters['Radar Fill Color'] || 'rgba(100, 200, 255, 0.6)');
    var stv_BeastBook_radarStroke = String(stv_BeastBook_parameters['Radar Stroke Color'] || 'rgba(255, 255, 255, 0.8)');
    var stv_BeastBook_radarFontSize = Number(stv_BeastBook_parameters['Radar Label Font Size'] || 14);
   
    //----- GLOBAL -----
    var stv_BeastBook_padding = 5;

// ----------------------------------------------------------------------------------------------------------------------------
// Window_Base Extension (Shared Method)
// ----------------------------------------------------------------------------------------------------------------------------  
    // 绘制全切角矩形的通用函数 (用于属性条)
    Window_Base.prototype.drawChamferedRect = function(x, y, width, height, color, opacity) {
        var ctx = this.contents.context;
        var s = stv_BeastBook_statsChamfer; // 切角大小

        ctx.save();
        ctx.globalAlpha = opacity / 255;
        ctx.fillStyle = color;
        ctx.beginPath();
        // 原版完整切角逻辑 (适配旧样式)
        ctx.moveTo(x, y + s);
        ctx.lineTo(x + s, y);
        ctx.lineTo(x + width, y);
        ctx.lineTo(x + width, y + height - s);
        ctx.lineTo(x + width - s, y + height);
        ctx.lineTo(x, y + height);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    };

    // 新增：绘制仅底部切角矩形 (Top-Left/Right Flat, Bottom-Left/Right Chamfer)
    Window_Base.prototype.drawChamferedRectBottom = function(x, y, width, height, color, opacity) {
        var ctx = this.contents.context;
        var s = stv_BeastBook_statsChamfer; 

        ctx.save();
        ctx.globalAlpha = opacity / 255;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x, y); // Top Left (No cut)
        ctx.lineTo(x + width, y); // Top Right (No cut)
        ctx.lineTo(x + width, y + height - s); // Right side
        ctx.lineTo(x + width - s, y + height); // Bottom Right cut
        ctx.lineTo(x + s, y + height); // Bottom side
        ctx.lineTo(x, y + height - s); // Bottom Left cut
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    };

    // 通用文字换行处理 (优化版：支持手动换行 + 自动换行)
    Window_Base.prototype.processWordWrap = function(text, maxWidth) {
        var result = '';
        // 1. 先按照原有的换行符(\r\n, \n)将文本切分成段落
        var paragraphs = text.split(/[\r\n]+/);

        for (var p = 0; p < paragraphs.length; p++) {
            var rawLine = paragraphs[p];
            var currentLine = '';
            var currentWidth = 0;

            for (var i = 0; i < rawLine.length; i++) {
                var char = rawLine[i];
                
                // 简单处理转义字符宽度 (忽略 \C[n], \I[n] 等带来的宽度计算影响)
                if (char === '\\') {
                    var remaining = rawLine.substring(i);
                    var codeMatch = remaining.match(/^(\\[a-zA-Z]\[\d+\]|\\[a-zA-Z])/);
                    if (codeMatch) {
                        var code = codeMatch[0];
                        currentLine += code;
                        i += code.length - 1; 
                        continue;
                    }
                }
                
                var charW = this.textWidth(char);
                // 如果当前行加上这个字超过了最大宽度，就插入一个换行符
                if (currentWidth + charW > maxWidth) {
                    result += currentLine + '\n';
                    currentLine = char;
                    currentWidth = charW;
                } else {
                    currentLine += char;
                    currentWidth += charW;
                }
            }
            result += currentLine;
            
            // 如果不是最后一段，手动加回原来的换行符
            if (p < paragraphs.length - 1) {
                result += '\n';
            }
        }
        return result;
    };

    // 新增：绘制图鉴大说明框 (已修改为水平居中 + 自定义行高 + 自定义空文本 + 垂直边距)
    Window_Base.prototype.drawBeastNoteBox = function(beast, startY) {
        if (!beast) return;
        
        // --- 文本检测逻辑 (默认文本) ---
        var text = beast.meta.图鉴注释 || stv_BeastBook_noDescText;
        
        // 计算剩余高度
        var rectHeight = this.contents.height - startY;
        if (rectHeight < 20) return; // 空间太小不绘制

        var rectWidth = this.contents.width;
        
        // 绘制底部切角背景
        this.drawChamferedRectBottom(0, startY, rectWidth, rectHeight, stv_BeastBook_statsBgColor, stv_BeastBook_statsBgOpacity);

        if (text) {
            var sideMargin = stv_BeastBook_descSideMargin;
            var vMargin = stv_BeastBook_descVMargin; // 获取垂直边距
            
            var textWidth = rectWidth - (sideMargin * 2);
            var textY = startY + vMargin; // 应用顶部边距

            // 处理自动换行 & 手动换行
            var wrappedText = this.processWordWrap(text, textWidth);
            
            // --- 修改开始：逐行计算居中并绘制 ---
            var lines = wrappedText.split('\n');
            var lineHeight = stv_BeastBook_descLineHeight; // 使用自定义行高

            for (var i = 0; i < lines.length; i++) {
                // 如果当前行超出下方的隐形区域，则停止绘制
                if (textY + (i * lineHeight) + lineHeight > startY + rectHeight - vMargin) break;

                var line = lines[i];
                var lineWidth = 0;

                // 计算该行文字宽度 (逻辑同 processWordWrap，忽略转义字符宽度)
                for (var j = 0; j < line.length; j++) {
                    var char = line[j];
                    if (char === '\\') {
                        var remaining = line.substring(j);
                        var codeMatch = remaining.match(/^(\\[a-zA-Z]\[\d+\]|\\[a-zA-Z])/);
                        if (codeMatch) {
                            j += codeMatch[0].length - 1; 
                            continue;
                        }
                    }
                    lineWidth += this.textWidth(char);
                }

                // 计算居中 X 坐标：(总宽度 - 文字宽度) / 2
                var centerX = (rectWidth - lineWidth) / 2;
                
                // 绘制当前行
                this.drawTextEx(line, centerX, textY + i * lineHeight);
            }
            // --- 修改结束 ---
        }
    };
 
// ----------------------------------------------------------------------------------------------------------------------------
// Scene BeastBook create
// ----------------------------------------------------------------------------------------------------------------------------  
    Scene_BeastBook = function() {
        this.initialize.apply(this, arguments);
    };
 
    Scene_BeastBook.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_BeastBook.prototype.constructor = Scene_BeastBook;
 
    Scene_BeastBook.prototype.initialize = function() {
        Scene_MenuBase.prototype.initialize.call(this);
    };                                                          
   
    Scene_BeastBook.prototype.createBackground = function() {
        this._backgroundSprite = new Sprite();
        this._backgroundSprite.move(0, 0, Graphics.width, Graphics.height);
        this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
        this.addChild(this._backgroundSprite);
        if (stv_BeastBook_bgPicture){
            this._foregroundSprite = new Sprite();
            this._foregroundSprite.move(0, 0, Graphics.width, Graphics.height);
            this._foregroundSprite.bitmap = ImageManager.loadPicture(stv_BeastBook_bgPicture);
            this.addChild(this._foregroundSprite);
        }
    };
   
    Scene_BeastBook.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);
       
        this.createWindowPositions();
        this.createSelectionWindow();
       
        if ($gameSwitches.value(stv_BeastBook_statusSwitch) || !stv_BeastBook_statusSwitch) this.createStatusWindow();
        if ($gameSwitches.value(stv_BeastBook_elementsSwitch) || !stv_BeastBook_elementsSwitch) this.createElementsWindow();
        if ($gameSwitches.value(stv_BeastBook_parameterSwitch) || !stv_BeastBook_parameterSwitch) this.createParametersWindow();
       
        this.createDescriptionWindow();
        
        // 创建 Tooltip 窗口
        this.createTooltipWindow();
        
        if(stv_BeastBook_showWindow != "TRUE"){
            this._selectionWindow.opacity = 0;
            this._infoWindow.opacity = 0;
            this._elementsWindow.opacity = 0;
            this._parametersWindow.opacity = 0;
            this._descriptionWindow.opacity = 0;
        }
       
        this.renewWindows();
    };
   
// ----------------------------------------------------------------------------------------------------------------------------
// Create Window Positions
// ----------------------------------------------------------------------------------------------------------------------------
    Scene_BeastBook.prototype.createWindowPositions = function() {
       
        var maxWidth = Graphics.boxWidth,
            maxHeight = Graphics.boxHeight;
       
        var sX = 0,
            sY = 0,
            sW = (maxWidth/3),
            sH = (maxHeight/3)*2;
        this._selectionWindow = new Window_BeastBook_Selection(sX, sY, sW, sH);
       
        var eX = sX,
            eY = sH,
            eW = sW,
            eH = (maxHeight/3);
        this._elementsWindow = new Window_BeastBook_Elements(eX, eY, eW, eH);
       
        var iX = sW,
            iY = sY,
            iW = maxWidth - sW,
            iH = sH;
        this._infoWindow = new Window_BeastBook_Info(iX, iY, iW, iH);
       
        var pX = sW,
            pY = eY,
            pW = iW,
            pH = eH;
        this._parametersWindow = new Window_BeastBook_Parameters(pX, pY, pW, pH);
       
        var dX = pX,
            dY = pY,
            dW = pW,
            dH = pH;
        this._descriptionWindow = new Window_BeastBook_Description(dX, dY, dW, dH);
       
    };
   
// ----------------------------------------------------------------------------------------------------------------------------
// Setup Index Window
// ----------------------------------------------------------------------------------------------------------------------------
    Scene_BeastBook.prototype.createSelectionWindow = function() {
        this._selectionWindow.setHandler('ok', this.onEnemySelect.bind(this));
        this._selectionWindow.setHandler('cancel', this.popScene.bind(this));
        this._selectionWindow.setBeastDataWindows(this._infoWindow, this._parametersWindow, this._elementsWindow, this._descriptionWindow);
        this.addWindow(this._selectionWindow);
    };
   
// ----------------------------------------------------------------------------------------------------------------------------
// Setup Info Window
// ----------------------------------------------------------------------------------------------------------------------------
    Scene_BeastBook.prototype.createStatusWindow = function() {
        this.addWindow(this._infoWindow);
    };
 
// ----------------------------------------------------------------------------------------------------------------------------
// Setup Elements Window
// ----------------------------------------------------------------------------------------------------------------------------
    Scene_BeastBook.prototype.createElementsWindow = function() {
        this.addWindow(this._elementsWindow);
    };
 
// ----------------------------------------------------------------------------------------------------------------------------
// Setup Parameters Window
// ----------------------------------------------------------------------------------------------------------------------------
    Scene_BeastBook.prototype.createParametersWindow = function() {
        this.addWindow(this._parametersWindow);
    };
   
// ----------------------------------------------------------------------------------------------------------------------------
// Setup Description Window
// ----------------------------------------------------------------------------------------------------------------------------
    Scene_BeastBook.prototype.createDescriptionWindow = function() {
        this.addWindow(this._descriptionWindow);
        this._descriptionWindow.hide();
    };

// ----------------------------------------------------------------------------------------------------------------------------
// Setup Tooltip Window
// ----------------------------------------------------------------------------------------------------------------------------
    Scene_BeastBook.prototype.createTooltipWindow = function() {
        this._tooltipWindow = new Window_BeastBook_Tooltip();
        this.addChild(this._tooltipWindow); // 确保在最上层
        this._infoWindow.setTooltipWindow(this._tooltipWindow);
    };
   
// ----------------------------------------------------------------------------------------------------------------------------
// Setup Enemy Select
// ----------------------------------------------------------------------------------------------------------------------------
    Scene_BeastBook.prototype.onEnemySelect = function() {
        if(this._descriptionWindow.visible) {
            this._descriptionWindow.hide();
        } else {
            this._descriptionWindow.show();
        }
        this._selectionWindow.activate();
 
    };
   
// ----------------------------------------------------------------------------------------------------------------------------
// Refresh Windows
// ----------------------------------------------------------------------------------------------------------------------------
    Scene_BeastBook.prototype.renewWindows = function() {
            this._selectionWindow.refresh();
            this._infoWindow.refresh();
            this._elementsWindow.refresh();
            this._parametersWindow.refresh();
            this._descriptionWindow.refresh();
    };
   
// ----------------------------------------------------------------------------------------------------------------------------
// Fill Selection Window
// ----------------------------------------------------------------------------------------------------------------------------
    function Window_BeastBook_Selection() {
        this.initialize.apply(this, arguments);
    }
 
    Window_BeastBook_Selection.prototype = Object.create(Window_Selectable.prototype);
    Window_BeastBook_Selection.prototype.constructor = Window_BeastBook_Selection;
 
    Window_BeastBook_Selection.lastTopRow = 0;
    Window_BeastBook_Selection.lastIndex  = 0;
 
    Window_BeastBook_Selection.prototype.initialize = function(x, y, width, height) {
        Window_Selectable.prototype.initialize.call(this, x, y, width, height);
       
        this.refresh();
        this.setTopRow(Window_BeastBook_Selection.lastTopRow);
        this.select(Window_BeastBook_Selection.lastIndex);
        this.activate();
       
    };
   
    Window_BeastBook_Selection.prototype.maxCols = function() {
        return 1;
    };
 
    Window_BeastBook_Selection.prototype.maxItems = function() {
        return this._list ? this._list.length : 0;
    };
   
    Window_BeastBook_Selection.prototype.setBeastDataWindows = function(window1, window2, window3, window4) {
        this._infoWindow = window1;
        this._parametersWindow = window2;
        this._elementsWindow = window3;
        this._descriptionWindow = window4;
        this.updateStatus();
    };
   
    Window_BeastBook_Selection.prototype.update = function() {
        Window_Selectable.prototype.update.call(this);
        this.updateStatus();
    };
   
    Window_BeastBook_Selection.prototype.updateStatus = function() {
       
        var beast = this._list[this.index()];
       
        if (this._infoWindow) {
            this._infoWindow.setBeast(beast);
        }
        if (this._parametersWindow) {
            this._parametersWindow.setBeast(beast);
        }
        if (this._elementsWindow) {
            this._elementsWindow.setBeast(beast);
        }
        if (this._descriptionWindow) {
            this._descriptionWindow.setBeast(beast);
        }
    };
   
    Window_BeastBook_Selection.prototype.refresh = function() {
        this._list = [];
        for (var i = 1; i < $beastBook.beasts.length; i++) {
            var beast = $dataEnemies[i];
            if (beast.name && $beastBook.beasts[i].show) {
                this._list.push(beast);
            }
        }
        this.createContents();
        this.drawAllItems();
    };
 
    Window_BeastBook_Selection.prototype.drawItem = function(index) {
        var beast= this._list[index],
            rect = this.itemRectForText(index),
            id = index + 1,
            name;
       
        this.changeTextColor(this.normalColor());
           
        if ($beastBook.isRevealed(beast.id)) {
            if (stv_BeastBook_showID == "TRUE") {
                name = id + " - " + beast.name;
            } else {
                name = beast.name;
            }
        } else {
            this.changeTextColor(this.textColor(stv_BeastBook_unknownColor));
            if (stv_BeastBook_showIDunknown  == "TRUE") {
                name = id + " - " + stv_BeastBook_unknownData;
            } else {
                name = stv_BeastBook_unknownData;
            }
        }
       
        this.drawText(String(name), rect.x, rect.y, rect.width);
        this.changeTextColor(this.normalColor());
    };
   
// ----------------------------------------------------------------------------------------------------------------------------
// Fill Description Window (Modified by Gemini to show Stats with Chamfered Rect)
// ----------------------------------------------------------------------------------------------------------------------------    
    function Window_BeastBook_Description() {
        this.initialize.apply(this, arguments);
    }
 
    Window_BeastBook_Description.prototype = Object.create(Window_Base.prototype);
    Window_BeastBook_Description.prototype.constructor = Window_BeastBook_Description;
 
    Window_BeastBook_Description.prototype.initialize = function(x, y, width, height) {
        Window_Base.prototype.initialize.call(this, x, y, width, height);
    };
   
    Window_BeastBook_Description.prototype.setBeast= function(beast) {
        this._beast = beast;
        this.refresh();
    };
   
    Window_BeastBook_Description.prototype.update = function() {
        Window_Base.prototype.update.call(this);
    };
    
    Window_BeastBook_Description.prototype.refresh = function() {
        this.contents.clear();
        
        // 如果没有选中怪物或未发现该怪物，显示未知信息
        if (!this._beast || !$beastBook.isRevealed(this._beast.id)) {
            this.changeTextColor(this.textColor(stv_BeastBook_unknownColor));
            var text = stv_BeastBook_unknownData;
            var rect = this.contents;
            this.drawText(text, 0, rect.height / 2 - this.lineHeight() / 2, rect.width, 'center');
            this.changeTextColor(this.normalColor());
            return;
        }

        // 创建一个临时的 Game_Enemy 对象来计算最终属性（包含特征值的计算）
        var gameEnemy = new Game_Enemy(this._beast.id, 0, 0);

        // 定义要显示的属性列表
        var dataList = [
            { name: "命中率",   value: gameEnemy.xparam(0) }, // hit
            { name: "闪避率",   value: gameEnemy.xparam(1) }, // eva
            { name: "暴击率",   value: gameEnemy.xparam(2) }, // cri
            { name: "反击率",   value: gameEnemy.xparam(6) }, // cnt
            { name: "暴击躲避", value: gameEnemy.xparam(3) }, // cev
            { name: "魔法躲避", value: gameEnemy.xparam(4) }, // mev
            { name: "魔法反射", value: gameEnemy.xparam(5) }, // mrf
            { name: "物理受伤", value: gameEnemy.sparam(0) }, // pdr (物理伤害率)
            { name: "魔法受伤", value: gameEnemy.sparam(1) }, // mdr (魔法伤害率)
            { name: "防御效果", value: gameEnemy.sparam(8) }, // gdr (防御效果)
            { name: "恢复效果", value: gameEnemy.sparam(4) }, // rec (恢复效果)
            { name: "HP恢复",   value: gameEnemy.xparam(7) }, // hrg
            // 插入空白条 (背景色矩形条但无内容)
            { name: "",         value: null, isEmpty: true },
            { name: "MP恢复",   value: gameEnemy.xparam(8) }, // mrg
            { name: "MP消耗",   value: gameEnemy.sparam(6) }  // mcr (MP消耗率)
        ];

        // 布局设置
        var cols = 3;
        var lineHeight = this.lineHeight();
        var colWidth = this.contents.width / cols;
        var padding = 5; // 左右间距
        var rectSpacing = 2; // 矩形之间的垂直间距
        
        // 记录已使用的高度
        var usedHeight = 0;

        for (var i = 0; i < dataList.length; i++) {
            var data = dataList[i];
            
            // 计算行列位置
            var col = i % cols;
            var row = Math.floor(i / cols);
            var x = col * colWidth;
            var y = row * lineHeight;
            
            usedHeight = Math.max(usedHeight, y + lineHeight);

            // 1. 绘制切角背景矩形 (宽度减去一点间隙，高度减去一点间隙)
            var rectW = colWidth - padding; 
            var rectH = lineHeight - rectSpacing;
            var rectX = x + padding / 2;
            
            this.drawChamferedRect(
                rectX, 
                y, 
                rectW, 
                rectH, 
                stv_BeastBook_statsBgColor, 
                stv_BeastBook_statsBgOpacity
            );

            // 如果是空白条，跳过绘制文字
            if (data.isEmpty) continue;

            // 2. 绘制属性名 (系统色)
            this.changeTextColor(this.systemColor());
            // 稍微增加 x 偏移，避免紧贴左边缘
            this.drawText(data.name, x + padding + 5, y, colWidth - padding);

            // 3. 绘制属性数值 (白色, 右对齐)
            this.resetTextColor();
            var valueText = Math.round(data.value * 100) + "%";
            // 稍微减少宽度，避免紧贴右边缘
            this.drawText(valueText, x, y, colWidth - padding - 5, 'right');
        }

        // --- 绘制底部大说明框 ---
        // 在网格下方留一点空隙
        var noteY = usedHeight + stv_BeastBook_padding;
        this.drawBeastNoteBox(this._beast, noteY);
    };

// ----------------------------------------------------------------------------------------------------------------------------
// Window BeastBook Tooltip
// ----------------------------------------------------------------------------------------------------------------------------
    function Window_BeastBook_Tooltip() {
        this.initialize.apply(this, arguments);
    }

    Window_BeastBook_Tooltip.prototype = Object.create(Window_Base.prototype);
    Window_BeastBook_Tooltip.prototype.constructor = Window_BeastBook_Tooltip;

    Window_BeastBook_Tooltip.prototype.initialize = function() {
        // 初始大小设为 0，隐藏
        Window_Base.prototype.initialize.call(this, 0, 0, 100, 100);
        this.openness = 0;
        this._item = null;
        this.hide();
    };

    Window_BeastBook_Tooltip.prototype.standardFontSize = function() {
        return stv_BeastBook_tooltipFontSize;
    };
    
    // 增加行高，防止文字挤压
    Window_BeastBook_Tooltip.prototype.lineHeight = function() {
        return this.standardFontSize() + 8;
    };

    Window_BeastBook_Tooltip.prototype.setItem = function(item, refX, refY, refWidth, refHeight, type) {
        // 如果是相同物品且已经打开，不处理
        if (this._item === item && this.openness > 0) return;
        
        // console.log("[BeastBook Debug] Tooltip setItem:", item ? item.name : "null");
        this._item = item;
        
        if (!item) {
            this.hide();
            this.openness = 0;
            return;
        }

        var desc = item.description || item.name || "";
        // 设定最大宽度，例如 300 或参数配置
        var maxWidth = stv_BeastBook_tooltipWidth - this.standardPadding() * 2;
        
        // 1. 设置字体
        if (this.contents) this.contents.fontSize = this.standardFontSize();
        
        // 2. 计算文字折行
        var wrappedText = this.processWordWrap(desc, maxWidth);
        var lines = wrappedText.split('\n');
        
        // 3. 计算实际所需高度
        var txtHeight = lines.length * this.lineHeight();
        var reqHeight = txtHeight + (this.standardPadding() * 2);
        var reqWidth = stv_BeastBook_tooltipWidth; // 固定宽度

        // 4. 计算最终位置
        var finalX = 0;
        var finalY = refY;

        if (type === 'item') {
            // 物品：在图标右侧
            finalX = refX + refWidth;
        } else {
            // 技能：在图标左侧
            finalX = refX - reqWidth;
        }

        // 5. 边界检查
        if (finalY + reqHeight > Graphics.boxHeight) {
            finalY = Graphics.boxHeight - reqHeight;
        }
        if (finalY < 0) finalY = 0;
        if (finalX + reqWidth > Graphics.boxWidth) {
            finalX = Graphics.boxWidth - reqWidth;
        }
        if (finalX < 0) finalX = 0;
        
        // console.log("[BeastBook Debug] Moving to:", finalX, finalY, reqWidth, reqHeight);

        // 6. 移动并重绘
        this.move(finalX, finalY, reqWidth, reqHeight);
        this.createContents();
        this.contents.fontSize = this.standardFontSize(); // createContents 后需重新设置字体

        // 7. 绘制文本
        var y = 0;
        for (var i = 0; i < lines.length; i++) {
            this.drawTextEx(lines[i], 0, y);
            y += this.lineHeight();
        }

        // 8. 瞬间显示
        this.show();
        this.openness = 255; 
        
        // 确保在最上层
        if (this.parent) {
             this.parent.addChild(this);
        }
    };
   
// ----------------------------------------------------------------------------------------------------------------------------
// Fill Info Window
// ----------------------------------------------------------------------------------------------------------------------------
    function Window_BeastBook_Info() {
        this.initialize.apply(this, arguments);
    }
 
    Window_BeastBook_Info.prototype = Object.create(Window_Base.prototype);
    Window_BeastBook_Info.prototype.constructor = Window_BeastBook_Info;
 
    Window_BeastBook_Info.prototype.initialize = function(x, y, width, height) {
        Window_Base.prototype.initialize.call(this, x, y, width, height);
        this.setBeastSprites();
        this.setBattleBackSprites();
        this._hitboxes = []; // 初始化点击区域数组
        this._tooltipWindow = null;
    };

    // 接收 Tooltip 窗口引用
    Window_BeastBook_Info.prototype.setTooltipWindow = function(win) {
        this._tooltipWindow = win;
    };
   
    Window_BeastBook_Info.prototype.setBattleBackSprites = function() {
        this._battleBack2 = new Sprite();
        this._battleBack2.anchor.x = 0;
        this._battleBack2.anchor.y = 0;
        this._battleBack2.x = 0;
        this._battleBack2.y = 0;
        this.addChildAt(this._battleBack2, stv_BeastBook_battleBackIndex);
       
        this._battleBack1 = new Sprite();
        this._battleBack1.anchor.x = 0;
        this._battleBack1.anchor.y = 0;
        this._battleBack1.x = 0;
        this._battleBack1.y = 0;
        this.addChildAt(this._battleBack1, stv_BeastBook_battleBackIndex);
    };
   
    Window_BeastBook_Info.prototype.setBeastSprites = function() {
        this._beastSprite = new Sprite();
        this._beastSprite.anchor.x = 0.5;
        this._beastSprite.anchor.y = 0.5;
        this._beastSprite.x = this.width/2;
        this._beastSprite.y = this.height/2;
        this._beastSprite.scale.x = 0.8;
        this._beastSprite.scale.y = 0.8;
        this.addChildToBack(this._beastSprite);
           
        this._beastBackSprite = new Sprite();
        this._beastBackSprite.anchor.x = 0.5;
        this._beastBackSprite.anchor.y = 0.5;
        this._beastBackSprite.x = this.width/1.1;
        this._beastBackSprite.y = this.height/1.2;
        this._beastBackSprite.scale.x = 2.0;
        this._beastBackSprite.scale.y = 2.0;
        this._beastBackSprite.opacity = 50;
        this.addChildToBack(this._beastBackSprite);
    };
   
    Window_BeastBook_Info.prototype.setBeast = function(beast) {
        if (this._beast === beast) return; // 核心修复：如果怪物没有变，就不刷新
        // console.log("[BeastBook Debug] Beast changed to:", beast ? beast.name : "null");
        this._beast = beast;
        this.refresh();
    };
   
    Window_BeastBook_Info.prototype.update = function() {
        Window_Base.prototype.update.call(this);
        this.processTouch(); // 新增触摸检测
    };

    // ==============================================================================
    // KEY FIX IS HERE (Click Offset Fix)
    // ==============================================================================
    Window_BeastBook_Info.prototype.processTouch = function() {
        if (!this._tooltipWindow) return;

        if (TouchInput.isTriggered()) {
            var x = this.canvasToLocalX(TouchInput.x);
            var y = this.canvasToLocalY(TouchInput.y);
            
            // 修正：减去窗口内边距，转换为 Contents 坐标系
            x -= this.standardPadding();
            y -= this.standardPadding();
            
            var hit = false;

            // 检查所有记录的图标区域
            for (var i = 0; i < this._hitboxes.length; i++) {
                var box = this._hitboxes[i];
                // 增加判定宽容度
                if (x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h) {
                    
                    // console.log("[BeastBook Debug] Hit!", box.item.name);
                    // 转换窗口相对坐标到屏幕绝对坐标传给 Tooltip
                    // 注意：这里的坐标计算需要加回 padding
                    var screenX = this.x + box.x + this.standardPadding();
                    var screenY = this.y + box.y + this.standardPadding();
                    
                    this._tooltipWindow.setItem(box.item, screenX, screenY, box.w, box.h, box.type);
                    hit = true;
                    SoundManager.playCursor();
                    break;
                }
            }

            if (!hit) {
                // 点击空白处关闭
                this._tooltipWindow.hide();
                this._tooltipWindow.openness = 0;
            }
        }
    };
    
    // 自定义缩放图标绘制函数
    Window_BeastBook_Info.prototype.drawIconScaled = function(iconIndex, x, y, scale) {
        var bitmap = ImageManager.loadSystem('IconSet');
        var pw = Window_Base._iconWidth;
        var ph = Window_Base._iconHeight;
        var sx = iconIndex % 16 * pw;
        var sy = Math.floor(iconIndex / 16) * ph;
        var dw = Math.floor(pw * scale);
        var dh = Math.floor(ph * scale);
        this.contents.blt(bitmap, sx, sy, pw, ph, x, y, dw, dh);
        return {w: dw, h: dh}; // 返回实际绘制的尺寸
    };
   
    Window_BeastBook_Info.prototype.contentDrawItems = function() {
        var y = this.lineHeight();
        var maxLength = ((this.contents.width/2) - stv_BeastBook_padding*2 - this.textWidth("100%"));
       
        this.contents.fillRect(0, y-5, (this.contents.width/2) - stv_BeastBook_padding, 1, this.normalColor());
        this.drawText(String(stv_BeastBook_dropsText), 0, 0);
       
        for (var j = 0; j < 3; j++) {
            var di = this._beast.dropItems[j];
            if (di.kind > 0) {
                if ($beastBook.beasts[this._beast.id] && $beastBook.beasts[this._beast.id].discoveredItems[j]) {
                    var item = Game_Enemy.prototype.itemObject(di.kind, di.dataId);
                    var successRate = Math.round((1/this._beast.dropItems[j].denominator)*100);
                    this.changeTextColor(this.textColor(stv_BeastBook_dropsSuccessColor));
                    this.drawText(String(successRate + "%"), 0, y);
                    this.changeTextColor(this.normalColor());
                    
                    // --- 掉落物图标绘制逻辑优化 (支持缩放) ---
                    var iconScale = stv_BeastBook_dropIconScale;
                    var ix = this.textWidth("100%") + stv_BeastBook_padding;
                    // 计算 Y 轴偏移以垂直居中
                    var iy = y + 2 + (Window_Base._iconHeight - Window_Base._iconHeight * iconScale) / 2;
                    
                    // 绘制缩放后的图标 并 记录点击区域
                    var dims = this.drawIconScaled(item.iconIndex, ix, iy, iconScale);
                    
                    // 将该图标加入点击检测列表 (类型：item)
                    this._hitboxes.push({
                        x: ix, 
                        y: iy, 
                        w: dims.w, 
                        h: dims.h, 
                        item: item, 
                        type: 'item'
                    });
                    
                    // 绘制物品名称，X轴位置根据缩放后的图标宽度调整
                    var tx = ix + (Window_Base._iconWidth * iconScale) + 4;
                    this.resetTextColor();
                    this.drawText(item.name, tx, y, maxLength);
                    
                } else {
                    this.changeTextColor(this.textColor(stv_BeastBook_unknownColor));
                    this.drawText(String(stv_BeastBook_unknownData), 0, y, maxLength);
                    this.changeTextColor(this.normalColor());
                }
                y += this.lineHeight();
            }
        }
 
        if (!this._beast.dropItems[0].kind && !this._beast.dropItems[1].kind && !this._beast.dropItems[2].kind) {
            this.changeTextColor(this.textColor(stv_BeastBook_unknownColor));
            this.drawText(String(stv_BeastBook_noData), 0, y);
            this.changeTextColor(this.normalColor());
        }    
    };
   
    Window_BeastBook_Info.prototype.contentDrawAbilities = function() {
        y = this.lineHeight();
        var maxLength = ((this.contents.width/2) - stv_BeastBook_padding*2 - 32);
       
        this.contents.fillRect((this.contents.width/2) + stv_BeastBook_padding, y-5, (this.contents.width/2) - stv_BeastBook_padding, 1, this.normalColor());
        this.drawText(String(stv_BeastBook_skillsText), this.contents.width-this.textWidth(stv_BeastBook_skillsText), 0);
         
        for (var j = 0; j < this._beast.actions.length; j++) {
            var ai = this._beast.actions[j];
                if (ai.skillId > 0) {
                    var skill = $dataSkills[ai.skillId];
                    if (skill.meta.BeastBook !== "hide") {
                        this.changeTextColor(this.textColor(stv_BeastBook_skillsColor));
                        
                        // --- 技能图标绘制逻辑优化 (支持缩放 & 偏移) ---
                        var iconScale = stv_BeastBook_skillIconScale;
                        var skillNameWidth = this.textWidth(skill.name);
                        
                        // 计算文字起始 X 坐标 (考虑了偏移量)
                        var sx = this.contents.width - skillNameWidth - 36 - stv_BeastBook_skillOffsetX;
                        
                        // 绘制文字
                        this.drawText(String(skill.name), sx, y, maxLength);
                        
                        // 绘制图标 (在文字右侧)
                        var ix = sx + skillNameWidth + 4;
                        var iy = y + 2 + (Window_Base._iconHeight - Window_Base._iconHeight * iconScale) / 2;
                        
                        // 绘制并记录区域
                        var dims = this.drawIconScaled(skill.iconIndex, ix, iy, iconScale);
                        
                        // 将该图标加入点击检测列表 (类型：skill)
                        this._hitboxes.push({
                            x: ix, 
                            y: iy, 
                            w: dims.w, 
                            h: dims.h, 
                            item: skill, 
                            type: 'skill'
                        });
                        
                        y += this.lineHeight();
                        this.changeTextColor(this.normalColor());
                    }
                }
        }
        if (this._beast.actions.length <= 0) {
            this.changeTextColor(this.textColor(stv_BeastBook_unknownColor));
            this.drawText(String(stv_BeastBook_noData), this.contents.width-this.textWidth(stv_BeastBook_noData), y);
            this.changeTextColor(this.normalColor());
        }    
    };
   
    Window_BeastBook_Info.prototype.contentDrawExp = function() {
        y = this.lineHeight();
       
        // Gemini: Modified to use Chamfered Rect style
        this.drawChamferedRect(0, (this.contents.height - y*2) - stv_BeastBook_padding, this.contents.width, y, stv_BeastBook_statsBgColor, stv_BeastBook_statsBgOpacity);
       
        this.drawIcon(stv_BeastBook_expIcon, this.contents.width - 32, this.contents.height - y*2 + 2 - stv_BeastBook_padding);
        this.drawText(String(TextManager.exp + ":"), 0, this.contents.height - y*2 - stv_BeastBook_padding);
        this.drawText(String(this._beast.exp), this.contents.width - 32 - this.textWidth(String(this._beast.exp)) - stv_BeastBook_padding, this.contents.height - y*2 - stv_BeastBook_padding);
 
    };
   
    Window_BeastBook_Info.prototype.contentDrawGold = function() {
        y = this.lineHeight();
       
        // Gemini: Modified to use Chamfered Rect style
        this.drawChamferedRect(0, this.contents.height - y, this.contents.width, y, stv_BeastBook_statsBgColor, stv_BeastBook_statsBgOpacity);
 
        this.drawIcon(stv_BeastBook_goldIcon, this.contents.width - 32, this.contents.height - y + 2);
        this.drawText(String(TextManager.currencyUnit + ":"), 0, this.contents.height - y);
        this.drawText(String(this._beast.gold), this.contents.width - 32 - this.textWidth(String(this._beast.gold)) - stv_BeastBook_padding, this.contents.height - y);        
    };
   
    Window_BeastBook_Info.prototype.contentDrawBattleBack = function() {
        var beast = this._beast;
        var pic1 = $beastBook.beasts[beast.id]._battleBack1;
        var pic2 = $beastBook.beasts[beast.id]._battleBack2;
       
        var bitmap1 = ImageManager.loadNormalBitmap(pic1, 0 || 0);
        var bitmap2 = ImageManager.loadNormalBitmap(pic2, 0 || 0);
       
        this._battleBack1.bitmap = bitmap1;
        this._battleBack2.bitmap = bitmap2;
       
        this._battleBack1.scale.x = this.width/this._battleBack1.bitmap.width;
        this._battleBack1.scale.y = this.height/this._battleBack1.bitmap.height;
        this._battleBack2.scale.x = this.width/this._battleBack2.bitmap.width;
        this._battleBack2.scale.y = this.height/this._battleBack2.bitmap.height;
    };
   
    Window_BeastBook_Info.prototype.aSVMotion = function(speed, max) {
        var thisSpeed = speed;
        if (!this._counter) this._counter = 0;
        if (!this._pattern) this._pattern = 0;
        if (!this._switch) this._switch = false;
       
        if (this._counter < thisSpeed) {
            this._counter += 1;
        } else {
            this._counter = 0;
            if (!this._switch) this._pattern = (this._pattern + 1) % (max+1);
            if (this._switch) this._pattern = (this._pattern - 1) % (max+1);
        }
       
        if (this._pattern == max & !this._switch) this._switch = !this._switch;
        if (this._pattern === 0 & this._switch) this._switch = !this._switch;
       
        return this._pattern;
    };
   
    Window_BeastBook_Info.prototype.staticMotion = function() {
        var bitmapHeight = this._beastSprite.bitmap.height;
        var contentsHeight = this.contents.height;
        var scalex = (Math.cos(Graphics.frameCount*0.03))/16;
        var scaley = ((Math.cos(Graphics.frameCount*0.03))/8);
           
        this._beastSprite.scale.x = (scalex*scalex)+0.8;
        this._beastSprite.scale.y = (scaley*scaley)+0.8;
        this._beastSprite.anchor.y = (scaley*scaley)+0.4;
       
        if (bitmapHeight > contentsHeight) {
            this._beastSprite.scale.x = ((scalex*scalex)+0.9)-0.3;
            this._beastSprite.scale.y = ((scaley*scaley)+0.9)-0.3;
            this._beastSprite.anchor.y = ((scaley*scaley)+0.4);
        }
    };
   
    Window_BeastBook_Info.prototype.contentDrawBeast = function() {
        var beast = this._beast,
            note = beast.note;
           
            if (beast.meta.BeastBookPic) {
                this._bitmap = ImageManager.loadNormalBitmap(beast.meta.BeastBookPic + ".png", 0 || 0);
                this.drawBeastStatic();
            } else {
                if (note.match(/<(?:SIDEVIEW BATTLER):[ ](.*)>/i)) {
                    this._bitmap = ImageManager.loadSvActor(String(RegExp.$1), 0);
                    this.drawBeastASV();
                } else {
                    if ($gameSystem.isSideView()) {this._bitmap = ImageManager.loadSvEnemy($dataEnemies[beast.id].battlerName, beast.battlerHue);}
                    else {this._bitmap = ImageManager.loadEnemy($dataEnemies[beast.id].battlerName, beast.battlerHue);}
                    this.drawBeastStatic();
                }
            }
    };
   
    Window_BeastBook_Info.prototype.drawBeastASV = function() {
        this._beastSprite.bitmap = this._bitmap;
        this._beastBackSprite.bitmap = this._bitmap;
        var bitmap = this._beastSprite.bitmap;
        if (bitmap) {
            var bw = bitmap.width / 9;
            var bh = bitmap.height / 6;
            var cx = Math.floor(stv_BeastBook_asvPattern / 6) * 3 + this.aSVMotion(stv_BeastBook_asvSpeed, 2);
            var cy = stv_BeastBook_asvPattern % 6;
            this._beastSprite.setFrame(cx * bw, cy * bh, bw, bh);
            this._beastBackSprite.setFrame(0, 0, bw, bh);
            if (stv_BeastBook_showBgBeast == "TRUE") this._beastBackSprite.bitmap = bitmap;
        }
    };
   
    Window_BeastBook_Info.prototype.drawBeastStatic = function() {
        this._beastSprite.bitmap = this._bitmap;
        if (stv_BeastBook_showBgBeast == "TRUE") this._beastBackSprite.bitmap = this._bitmap;
        if (stv_BeastBook_animateBeast == "TRUE") this.staticMotion();
    };
   
    Window_BeastBook_Info.prototype.contentDrawKillCounter = function() {
        var beast = this._beast.id;
       
        var gaugeWidth = 200;
        var gaugeXpos = (this.contents.width - gaugeWidth);
        var gaugeYpos = (this.contents.height - (this.lineHeight() * 3) - stv_BeastBook_padding*2);
        var actualkillsCount = $beastBook.beasts[beast].kills;
        var maxKillsCount = $beastBook.beasts[beast].maxKills;
        var killsCountText = actualkillsCount + " / " + maxKillsCount;
       
        this.drawGauge(gaugeXpos, gaugeYpos - stv_BeastBook_padding, gaugeWidth, actualkillsCount / maxKillsCount, this.textColor(stv_BeastBook_killsCountColor1), this.textColor(stv_BeastBook_killsCountColor2));
        this.drawText(String(stv_BeastBook_killsText), gaugeXpos - this.textWidth(stv_BeastBook_killsText) - stv_BeastBook_padding, gaugeYpos);
        this.drawText(String(killsCountText), this.contents.width - this.textWidth(killsCountText), gaugeYpos);
       
    };
   
    Window_BeastBook_Info.prototype.deleteBitmaps = function() {
        this._beastSprite.bitmap = null;
        this._beastBackSprite.bitmap = null;
        this._battleBack1.bitmap = null;
        this._battleBack2.bitmap = null;
    };
   
    Window_BeastBook_Info.prototype.refresh = function() {
        // console.log("[BeastBook Debug] Refreshing Info Window..."); // 可选调试
        this.contents.clear();
        this.deleteBitmaps();
        this._hitboxes = []; // 重置点击区域
        if (this._tooltipWindow) {
            this._tooltipWindow.hide(); // 刷新时关闭说明窗口
            this._tooltipWindow.openness = 0;
        }
       
        if ($beastBook.isRevealed(this._beast.id)) {
            if (stv_BeastBook_showBattleBack == "TRUE") this.contentDrawBattleBack();
            this.contentDrawBeast();
            if ($gameSwitches.value(stv_BeastBook_showItemsSwitch) || !stv_BeastBook_showItemsSwitch) this.contentDrawItems();
            if ($gameSwitches.value(stv_BeastBook_showSkillsSwitch) || !stv_BeastBook_showSkillsSwitch) this.contentDrawAbilities();
            if ($gameSwitches.value(stv_BeastBook_showKillCounterSwitch) || !stv_BeastBook_showKillCounterSwitch) this.contentDrawKillCounter();
            if ($gameSwitches.value(stv_BeastBook_showExpSwitch) || !stv_BeastBook_showExpSwitch) this.contentDrawExp();
            if ($gameSwitches.value(stv_BeastBook_showGoldSwitch) || !stv_BeastBook_showGoldSwitch) this.contentDrawGold();
            
            // Draw Radar Chart (New)
            // Use boolean check (Corrected)
            if (stv_BeastBook_showRadar) this.drawRadarChart();
        }
    };

    // 新增：绘制雷达图
    Window_BeastBook_Info.prototype.drawRadarChart = function() {
        if (!this._beast) return;
        
        // 创建临时敌人对象以获取属性
        var enemy = new Game_Enemy(this._beast.id, 0, 0);
        
        // 读取设置
        var cx = stv_BeastBook_radarX;
        var cy = stv_BeastBook_radarY;
        var scale = stv_BeastBook_radarScale / 100.0;
        var radius = stv_BeastBook_radarRadius * scale;
        var opacity = stv_BeastBook_radarOpacity;
        
        var ctx = this.contents.context;
        ctx.save();
        ctx.globalAlpha = opacity / 255;
        
        // 8维属性: HP(0), MP(1), ATK(2), DEF(3), MAT(4), MDF(5), AGI(6), LUK(7)
        var paramIds = [0, 1, 2, 3, 4, 5, 6, 7];
        var count = 8;
        var angleStep = (Math.PI * 2) / count;
        var startAngle = -Math.PI / 2; // 起始角度向上
        
        // 1. 绘制网格
        ctx.strokeStyle = stv_BeastBook_radarStroke;
        ctx.lineWidth = 1;
        // ctx.setLineDash([2, 2]); // 可选虚线
        
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
        
        // 2. 绘制数据区域
        ctx.fillStyle = stv_BeastBook_radarFill;
        ctx.strokeStyle = stv_BeastBook_radarStroke; 
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        for (var i = 0; i < count; i++) {
            var pId = paramIds[i];
            var val = enemy.param(pId);
            
            // 获取上限 (Gemini 逻辑)
            var max = 1;
            // 优先检查是否存在 getVisualChapterLimit (Gemini_ExcelStatsLink)
            if (typeof enemy.getVisualChapterLimit === 'function') {
                max = enemy.getVisualChapterLimit(pId);
            } else if (enemy.paramMax) { 
                // 其次检查 paramMax (Gemini_LimitBonusPatch 或 系统自带)
                max = enemy.paramMax(pId);
            } else {
                // 兜底逻辑
                if (pId === 0) max = 999999;
                else if (pId === 1) max = 9999;
                else max = 999;
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
        
        // 3. 绘制标签
        this.contents.fontSize = Math.max(10, Math.floor(stv_BeastBook_radarFontSize * scale));
        this.changeTextColor(this.systemColor());
        
        for (var i = 0; i < count; i++) {
            var pId = paramIds[i];
            var name = "";
            // 简化名称以适应雷达图
            if (pId === 0) name = "HP";
            else if (pId === 1) name = "MP";
            else if (pId === 2) name = "攻";
            else if (pId === 3) name = "防";
            else if (pId === 4) name = "魔攻";
            else if (pId === 5) name = "魔防";
            else if (pId === 6) name = "敏";
            else if (pId === 7) name = "幸";
            else name = TextManager.param(pId);
            
            var angle = startAngle + i * angleStep;
            var labelDist = radius + (15 * scale);
            var lx = cx + Math.cos(angle) * labelDist;
            var ly = cy + Math.sin(angle) * labelDist;
            
            var textWidth = this.textWidth(name);
            // 居中绘制标签
            this.drawText(name, lx - textWidth/2, ly - this.contents.fontSize/2, textWidth + 10, 'left');
        }
        this.resetTextColor();
        
        ctx.restore();
    };
 
// ----------------------------------------------------------------------------------------------------------------------------
// Fill Elements Window (Modified by Gemini - Icons, Spacing, Filter 100%, Centered Layout, Weakness Labels)
// ----------------------------------------------------------------------------------------------------------------------------
    function Window_BeastBook_Elements() {
        this.initialize.apply(this, arguments);
    }
 
    Window_BeastBook_Elements.prototype = Object.create(Window_Base.prototype);
    Window_BeastBook_Elements.prototype.constructor = Window_BeastBook_Elements;
 
    Window_BeastBook_Elements.prototype.initialize = function(x, y, width, height) {
        Window_Base.prototype.initialize.call(this, x, y, width, height);
    };
   
    Window_BeastBook_Elements.prototype.setBeast = function(beast) {
        this._beast = beast;
        this.refresh();
    };

    // 辅助函数：绘制带背景的标题
    Window_BeastBook_Elements.prototype.drawSectionHeader = function(text, x, y, width) {
        var rectHeight = this.lineHeight();
        this.drawChamferedRect(x, y, width, rectHeight, stv_BeastBook_statsBgColor, stv_BeastBook_statsBgOpacity);
        this.changeTextColor(this.systemColor());
        this.drawText(text, x, y, width, 'center');
        this.resetTextColor();
    };

    // 辅助函数：绘制缩放图标 (从 Info Window 移植以支持 Elements Window)
    Window_BeastBook_Elements.prototype.drawIconScaled = function(iconIndex, x, y, scale) {
        var bitmap = ImageManager.loadSystem('IconSet');
        var pw = Window_Base._iconWidth;
        var ph = Window_Base._iconHeight;
        var sx = iconIndex % 16 * pw;
        var sy = Math.floor(iconIndex / 16) * ph;
        var dw = Math.floor(pw * scale);
        var dh = Math.floor(ph * scale);
        this.contents.blt(bitmap, sx, sy, pw, ph, x, y, dw, dh);
        return {w: dw, h: dh}; 
    };
   
    Window_BeastBook_Elements.prototype.refresh = function() {
        this.contents.clear();
        
        if (!this._beast || !$beastBook.isRevealed(this._beast.id)) {
             this.changeTextColor(this.textColor(stv_BeastBook_unknownColor));
             this.drawText(stv_BeastBook_unknownData, 0, this.contents.height/2 - this.lineHeight() / 2, this.contents.width, 'center');
             this.resetTextColor();
            return;
        }

        var gameEnemy = new Game_Enemy(this._beast.id, 0, 0);
        var lineHeight = this.lineHeight();
        var startY = 0;
        
        // -------------------------------------------------------------
        // 定义普通字体和标签小字体大小
        // -------------------------------------------------------------
        var normalFontSize = 20; 
        var labelFontSize = normalFontSize - 6;

        // =========================================================
        // 1. 弱点 (元素抗性) 部分
        // =========================================================
        
        var rawElemList = stv_BeastBook_displayElements;
        var validElemList = [];
        for (var i = 0; i < rawElemList.length; i++) {
            var elId = rawElemList[i];
            if (!elId) continue;
            var rate = gameEnemy.elementRate(elId);
            if (Math.abs(rate - 1.0) > 0.005) {
                validElemList.push({ id: elId, rate: rate });
            }
        }

        this.drawSectionHeader(stv_BeastBook_weaknessText, 0, startY, this.contents.width);
        startY += lineHeight;

        var elemCols = 3;
        var elemSpacing = stv_BeastBook_elementColSpacing; 
        var elemColWidth = (this.contents.width - (elemCols - 1) * elemSpacing) / elemCols;
        var elemTextGap = stv_BeastBook_elementTextGap; 

        for (var i = 0; i < validElemList.length; i++) {
            var col = i % elemCols;
            var row = Math.floor(i / elemCols);
            if (row >= 2) break; 

            var data = validElemList[i];
            var name = $dataSystem.elements[data.id];
            var rateText = Math.round(data.rate * 100) + "%";

            var x = col * (elemColWidth + elemSpacing);
            var y = startY + row * lineHeight;

            // --- 确定标签和颜色 (弱点=红, 抗性=绿) ---
            var label = "";
            var colorIndex = 0;
            if (data.rate > 1.0) {
                label = "▼弱";
                colorIndex = 2; // Crisis Red
            } else {
                label = "▲抗";
                colorIndex = 3; // PowerUp Green
            }

            // --- 计算宽度 ---
            this.contents.fontSize = normalFontSize;
            var nameWidth = this.textWidth(name);
            var rateWidth = this.textWidth(rateText);
            
            this.contents.fontSize = labelFontSize;
            var labelWidth = this.textWidth(label);
            var labelGap = 2; // 标签和数字之间的微小间距

            // 总宽度 = 名字 + 间距 + (数值 + 小间距 + 标签)
            var totalWidth = nameWidth + elemTextGap + rateWidth + labelGap + labelWidth;
            
            // 计算起始X
            var contentX = x + (elemColWidth - totalWidth) / 2;

            // 1. 绘制名称
            this.contents.fontSize = normalFontSize;
            this.changeTextColor(this.systemColor());
            this.drawText(name, contentX, y, nameWidth);

            // 2. 绘制数值 (正常字体, 对应颜色)
            var rateX = contentX + nameWidth + elemTextGap;
            this.contents.fontSize = normalFontSize;
            // 颜色判断
            this.changeTextColor(this.textColor(colorIndex));
            this.drawText(rateText, rateX, y, rateWidth);

            // 3. 绘制标签 (小字体, 对应颜色)
            var labelX = rateX + rateWidth + labelGap;
            this.contents.fontSize = labelFontSize;
            this.changeTextColor(this.textColor(colorIndex));
            // 垂直居中调整: (行高 - 字体大小) / 2 + 偏移
            var labelY = y + (lineHeight - labelFontSize) / 2 + stv_BeastBook_labelOffsetY; 
            this.drawText(label, labelX, labelY, labelWidth);
            
            this.resetTextColor();
        }
        
        this.contents.fontSize = this.standardFontSize();
        startY += lineHeight * 2; 

        // =========================================================
        // 2. 状态抗性 部分
        // =========================================================

        var rawStateList = stv_BeastBook_displayStates;
        var validStateList = [];
        for (var i = 0; i < rawStateList.length; i++) {
            var stId = rawStateList[i];
            if (!stId) continue;
            var rate = gameEnemy.stateRate(stId);
            if (Math.abs(rate - 1.0) > 0.005) {
                validStateList.push({ id: stId, rate: rate });
            }
        }

        this.drawSectionHeader(stv_BeastBook_stateResText, 0, startY, this.contents.width);
        startY += lineHeight;

        var stateCols = 2;
        var stateSpacing = stv_BeastBook_stateColSpacing; 
        var stateColWidth = (this.contents.width - (stateCols - 1) * stateSpacing) / stateCols;
        var iconScale = stv_BeastBook_skillIconScale; 
        var stateTextGap = stv_BeastBook_stateTextGap; 

        for (var i = 0; i < validStateList.length; i++) {
            var col = i % stateCols;
            var row = Math.floor(i / stateCols);
            if (row >= 5) break; 

            var data = validStateList[i];
            var state = $dataStates[data.id];
            var rateText = Math.round(data.rate * 100) + "%";
            
            var x = col * (stateColWidth + stateSpacing);
            var y = startY + row * lineHeight;
            
            if (y + lineHeight > this.contents.height) break;

            // --- 确定标签和颜色 (弱点=红, 抗性=绿) ---
            var label = "";
            var colorIndex = 0;
            if (data.rate > 1.0) {
                label = "▼弱";
                colorIndex = 2; 
            } else {
                label = "▲抗";
                colorIndex = 3; 
            }

            // --- 计算宽度 ---
            this.contents.fontSize = normalFontSize;
            var iconRealWidth = Math.floor(Window_Base._iconWidth * iconScale);
            var iconSpacing = 4; 
            var nameWidth = this.textWidth(state.name);
            var rateWidth = this.textWidth(rateText);
            
            this.contents.fontSize = labelFontSize;
            var labelWidth = this.textWidth(label);
            var labelGap = 2;

            // 总宽度 = 图标 + 间隔 + 名字 + 间隔 + 数值 + 间隔 + 标签
            var totalWidth = iconRealWidth + iconSpacing + nameWidth + stateTextGap + rateWidth + labelGap + labelWidth;
            
            // 起始X
            var contentX = x + (stateColWidth - totalWidth) / 2;
            var iconY = y + (lineHeight - Window_Base._iconHeight * iconScale) / 2;
            
            // 1. 绘制图标
            this.drawIconScaled(state.iconIndex, contentX, iconY, iconScale);

            // 2. 绘制名称
            this.contents.fontSize = normalFontSize;
            this.changeTextColor(this.systemColor());
            var textStartX = contentX + iconRealWidth + iconSpacing;
            this.drawText(state.name, textStartX, y, nameWidth);

            // 3. 绘制数值
            var rateX = textStartX + nameWidth + stateTextGap;
            this.contents.fontSize = normalFontSize;
            // 颜色判断
            this.changeTextColor(this.textColor(colorIndex));
            this.drawText(rateText, rateX, y, rateWidth);

            // 4. 绘制标签
            var labelX = rateX + rateWidth + labelGap;
            this.contents.fontSize = labelFontSize;
            this.changeTextColor(this.textColor(colorIndex));
            var labelY = y + (lineHeight - labelFontSize) / 2 + stv_BeastBook_labelOffsetY; 
            this.drawText(label, labelX, labelY, labelWidth);
            
            this.resetTextColor();
        }
        this.contents.fontSize = this.standardFontSize();
    };
 
// ----------------------------------------------------------------------------------------------------------------------------
// Fill Parameters Window
// ----------------------------------------------------------------------------------------------------------------------------
    function Window_BeastBook_Parameters() {
        this.initialize.apply(this, arguments);
    }
 
    Window_BeastBook_Parameters.prototype = Object.create(Window_Base.prototype);
    Window_BeastBook_Parameters.prototype.constructor = Window_BeastBook_Parameters;
 
    Window_BeastBook_Parameters.prototype.initialize = function(x, y, width, height) {
        Window_Base.prototype.initialize.call(this, x, y, width, height);
    };
   
    Window_BeastBook_Parameters.prototype.setBeast= function(beast) {
        this._beast = beast;
        this.refresh();
    };
   
    Window_BeastBook_Parameters.prototype.contentDrawLeftParameters = function() {
        var y = 0;
        var leftEdgePos = (this.contents.width/2) - stv_BeastBook_padding;
       
        for (var i = 0; i < 4; i++) {
           
            // Gemini: Modified to use Chamfered Rect style
            this.drawChamferedRect(0, y, leftEdgePos, this.lineHeight(), stv_BeastBook_statsBgColor, stv_BeastBook_statsBgOpacity);
           
            this.changeTextColor(this.systemColor());
            // 确保属性名也是字符串
            var pName = TextManager.param(i);
            this.drawText(String(pName), stv_BeastBook_padding, y, 160);
            this.resetTextColor();        
            // 核心修复：对属性值强制字符串转换
            var pVal = String(this._beast.params[i]);
            this.drawText(pVal, leftEdgePos - stv_BeastBook_padding - this.textWidth(pVal), y, 60);
            y += this.lineHeight() + stv_BeastBook_padding;
        }
        // 返回使用的最后Y坐标，方便外部计算剩余高度
        return y;
    };
   
    Window_BeastBook_Parameters.prototype.contentDrawRightParameters = function() {
        var y = 0;
        var rightEdgePos = (this.contents.width/2) + stv_BeastBook_padding;
        var leftEdgePos = (this.contents.width/2) - stv_BeastBook_padding;
       
        for (var j = 4; j < 8; j++) {
           
            // Gemini: Modified to use Chamfered Rect style
            this.drawChamferedRect(rightEdgePos, y, leftEdgePos, this.lineHeight(), stv_BeastBook_statsBgColor, stv_BeastBook_statsBgOpacity);
           
            this.changeTextColor(this.systemColor());
            var pName = TextManager.param(j);
            this.drawText(String(pName), rightEdgePos + stv_BeastBook_padding, y, 160);
            this.resetTextColor();        
            // 核心修复：对属性值强制字符串转换
            var pVal = String(this._beast.params[j]);
            this.drawText(pVal, this.contents.width - stv_BeastBook_padding - this.textWidth(pVal), y, 60);
            y += this.lineHeight() + stv_BeastBook_padding;
        }
    };
   
    Window_BeastBook_Parameters.prototype.refresh = function() {
        this.contents.clear();
       
        if ($beastBook.isRevealed(this._beast.id)) {
            var usedY = this.contentDrawLeftParameters();
            this.contentDrawRightParameters();
            
            // --- 绘制底部大说明框 ---
            // 使用左侧参数绘制后的Y坐标作为起始点
            this.drawBeastNoteBox(this._beast, usedY);
        }
    };
 
 
// ----------------------------------------------------------------------------------------------------------------------------
// Alias methods
// ----------------------------------------------------------------------------------------------------------------------------
    STV_BeastBook_PluginCommand = Game_Interpreter.prototype.pluginCommand;
    STV_BeastBook_Create = DataManager.createGameObjects;
    STV_BeastBook_Save = DataManager.makeSaveContents;
    STV_BeastBook_Load = DataManager.extractSaveContents;
    STV_BeastBook_BattleBack = Spriteset_Battle.prototype.createBattleback;
    STV_BeastBook_DropItems = Game_Enemy.prototype.makeDropItems;
 
// ----------------------------------------------------------------------------------------------------------------------------
// DataManager
// ----------------------------------------------------------------------------------------------------------------------------
    var $beastBook = null;
 
    DataManager.makeSaveContents = function() {
        contents = STV_BeastBook_Save.call(this);
        contents.enemybook = $beastBook;
        return contents;
    };
   
    DataManager.extractSaveContents = function(contents) {
        STV_BeastBook_Load.call(this, contents);
        $beastBook = contents.enemybook;
    };
   
    DataManager.createGameObjects = function() {
        STV_BeastBook_Create.call(this);
        $beastBook = new Beast_Book();
    };
   
// ----------------------------------------------------------------------------------------------------------------------------
// Get EnemyTroop Info
// ----------------------------------------------------------------------------------------------------------------------------
    Game_Troop.prototype.updateInterpreter = function() {
        this._interpreter.update();
 
            for (var i = 0; i < $gameTroop.members().length; i++) {
            var stv_beastID = $gameTroop.members()[i]._enemyId;
            var stv_beastIsAlive = $gameTroop.members()[i].isAlive();
           
            switch (stv_BeastBook_fillBehavior) {
                case '1':
                    $beastBook.addBeast(stv_beastID);
                    $beastBook.setBattleBacks(stv_beastID);
                break;
                case '2':
                    if (!stv_beastIsAlive){
                        $beastBook.addBeast(stv_beastID);
                        $beastBook.setBattleBacks(stv_beastID);
                    }
                break;
                case '3':
                break;
            }
        }
    };
   
// ----------------------------------------------------------------------------------------------------------------------------
// Get BattleBack Info
// ----------------------------------------------------------------------------------------------------------------------------    
    Spriteset_Battle.prototype.createBattleback = function() {
        STV_BeastBook_BattleBack.call(this);
        $beastBook.battleBack1 = this._back1Sprite.bitmap._url;
        $beastBook.battleBack2 = this._back2Sprite.bitmap._url;
    };
   
// ----------------------------------------------------------------------------------------------------------------------------
// Item Discover // Kill Counter
// ----------------------------------------------------------------------------------------------------------------------------
    Game_Enemy.prototype.makeDropItems = function() {
        var rewards = STV_BeastBook_DropItems.call(this);
        var beastId = this._enemyId;
        var list = $beastBook.beasts[beastId];
           
        if(list.kills < list.maxKills) list.kills += 1;
        $beastBook.killAchievmentCheck(beastId);
        rewards.forEach(function(item) {
            $beastBook.discoverItem(beastId, item);
        });
        return rewards;
    };
 
// ----------------------------------------------------------------------------------------------------------------------------
// Beast_Book
// ----------------------------------------------------------------------------------------------------------------------------
 
    function Beast_Book() {
        this.initialize.apply(this, arguments);
    }
   
    Beast_Book.prototype.initialize = function() {
        this.clear();
    };
   
    // Set BattleBacks
    Beast_Book.prototype.setBattleBacks = function(beastId) {
        $beastBook.beasts[beastId]._battleBack1 = $beastBook.battleBack1;
        $beastBook.beasts[beastId]._battleBack2 = $beastBook.battleBack2;
    };
   
    // Clear Book
    Beast_Book.prototype.clear = function() {
        this.beasts = [0];
        var maxBeasts = $dataEnemies.length;
        if (stv_BeastBook_maxBeasts && stv_BeastBook_maxBeasts < maxBeasts) maxBeasts = stv_BeastBook_maxBeasts + 1;
       
        for (var i = 1; i < maxBeasts; ++i) {
           
            var enemy = $dataEnemies[i];
            if (!this.beasts[i]) this.beasts[i] = {};
           
            if (!this.beasts[i].show) {
                this.beasts[i].show = true;
                if (enemy.meta.BeastBook == 'hide') this.beasts[i].show = false;
            }
            if (!this.beasts[i].discovered) this.beasts[i].discovered = false;
            if (!this.beasts[i].discoveredItems) this.beasts[i].discoveredItems = [false,false,false];
            if (!this.beasts[i].kills) this.beasts[i].kills = 0;
            if (!this.beasts[i]._battleBack1) this.beasts[i]._battleBack1 = stv_BeastBook_defaultBattleBack;
            if (!this.beasts[i]._battleBack2) this.beasts[i]._battleBack2 = stv_BeastBook_defaultBattleBack;
           
            if (!this.beasts[i].maxKills) {
                if (!enemy.meta.BeastBookMaxKills) {
                    this.beasts[i].maxKills = stv_BeastBook_maxKills;
                } else {
                    this.beasts[i].maxKills = enemy.meta.BeastBookMaxKills;
                }
            }  
        }
    };
   
    // Complete All
    Beast_Book.prototype.complete = function() {
        this.completeBeasts();
        this.completeItems();
        this.completeKills();
    };  
   
    // Complete Enemies
    Beast_Book.prototype.completeBeasts = function() {
        for (var i = 1; i < this.beasts.length; i++) {
            this.beasts[i].discovered = true;
        }
        this.getRevealed();
    };
   
    // Complete Items
    Beast_Book.prototype.completeItems = function() {
        for (var i = 1; i < this.beasts.length; i++) {
            this.beasts[i].discoveredItems = [true,true,true];
        }
    };
   
    // Complete Kills
    Beast_Book.prototype.completeKills = function() {
        for (var i = 1; i < this.beasts.length; i++) {
            this.beasts[i].kills = this.beasts[i].maxKills;
            this.killAchievmentCheck(i);
        }
    };
   
    // Clear Items
    Beast_Book.prototype.clearItems = function() {
        for (var i = 1; i < this.beasts.length; i++) {
            this.beasts[i].discoveredItems = [false,false,false];
        }
    };
   
    // Hide Beast
    Beast_Book.prototype.hideBeast = function(beastId) {
        if (!this.beasts) this.clear();
        if (this.beasts[beastId]) this.beasts[beastId].show = false;
        this.getRevealed();
    };
   
    // Show Beast
    Beast_Book.prototype.showBeast = function(beastId) {
        if (!this.beasts) this.clear();
        if (this.beasts[beastId]) this.beasts[beastId].show = true;
        this.getRevealed();
    };
   
    // Add Beast
    Beast_Book.prototype.addBeast = function(beastId) {
        if (!this.beasts) this.clear();
        this.beasts[beastId].discovered = true;
        this.getRevealed();
    };
 
    // Remove Beast
    Beast_Book.prototype.removeBeast = function(beastId) {
        if (this.beasts) {
            this.beasts[beastId].discovered = false;
        }
    };
   
    // Check if Enemy is revealed
    Beast_Book.prototype.isRevealed = function(beast) {
        if (this.beasts && beast) {
            return this.beasts[beast].discovered;
        } else {
            return false;
        }
    };
   
    // Add Kill
    Beast_Book.prototype.addKill = function(beastId, value) {
        if (this.beasts[beastId]) {
            this.beasts[beastId].kills += value;
        }
    };
 
    // Set Max Kills
    Beast_Book.prototype.setMaxKills = function(beastId, value) {
        if (this.beasts[beastId]) {
            this.beasts[beastId].maxKills = value;
        }
    };
   
    // Check Kill Achievment
    Beast_Book.prototype.killAchievmentCheck = function(beastID) {
            var beast = this.beasts[beastID];
            if(beast.kills == beast.maxKills) {
                var achievmentSwitch = stv_BeastBook_killAchievmentSwitch + beastID;
            if (stv_BeastBook_killAchievmentSwitch) $gameSwitches.setValue(achievmentSwitch, true);
            }
    };  
   
    // Get Revealed Beasts
    Beast_Book.prototype.getRevealed = function() {
        var discoveredLength = 0;
        for (var i = 1; i < this.beasts.length; i++) {
            if(this.beasts[i].discovered) discoveredLength += 1;
        }
        $gameVariables.setValue(stv_BeastBook_countDiscovered, discoveredLength);
        if(discoveredLength >= ($dataEnemies.length-1)) $gameSwitches.setValue(stv_BeastBook_bookFullSwitch, true);
    };
   
    // Discover Item
    Beast_Book.prototype.discoverItem = function(E_Id, item) {
        var itemKind;
        if (DataManager.isItem(item)) itemKind = 1;
        if (DataManager.isWeapon(item)) itemKind = 2;
        if (DataManager.isArmor(item)) itemKind = 3;    
        for (var i = 0; i < 3; i++) {
            if ($dataEnemies[E_Id].dropItems[i].kind == itemKind && $dataEnemies[E_Id].dropItems[i].dataId == item.id) {
                var items = this.beasts[E_Id].discoveredItems;
                items[i] = true;
            }
        }  
    };
 
// ----------------------------------------------------------------------------------------------------------------------------
// Draw Skill Name Function
// ----------------------------------------------------------------------------------------------------------------------------  
    Window_Base.prototype.drawSkillName = function(skill, x, y, width) {
        if (skill) {
            if (this.textWidth(skill.name) > width) {
                this.drawText(String(skill.name), x + this.textWidth(skill.name) - width, y, width);  
            } else{
                this.drawText(String(skill.name), x, y, width);  
            }
            this.drawIcon(skill.iconIndex, x + this.textWidth(skill.name) + 4, y + 2);
        }
    };
 
// ----------------------------------------------------------------------------------------------------------------------------
// Plugin Commands
// ----------------------------------------------------------------------------------------------------------------------------
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        STV_BeastBook_PluginCommand.call(this, command, args);
       
        if (command === 'BeastBook') {
            switch (args[0]) {
                case 'open':
                    SceneManager.push(Scene_BeastBook);
                break;
                case 'hide':
                    $beastBook.hideBeast(Number(args[1]));
                break;
                case 'show':
                    $beastBook.showBeast(Number(args[1]));
                break;
                case 'add':
                    $beastBook.addBeast(Number(args[1]));
                break;
                case 'addvar':
                    $beastBook.addBeast(Number($gameVariables.value(args[1])));
                break;
                case 'addkill':
                    $beastBook.addKill(Number(args[1]), Number(args[2]));
                break;
                case 'maxkills':
                    $beastBook.setMaxKills(Number(args[1]), Number(args[2]));
                break;
                case 'remove':
                    $beastBook.removeBeast(Number(args[1]));
                break;
                case 'clear':
                    $beastBook.clear();
                break;
                case 'complete':
                    $beastBook.complete();
                break;
                case 'completebeasts':
                    $beastBook.completeBeasts();
                break;
                case 'completeitems':
                    $beastBook.completeItems();
                break;
                case 'completekills':
                    $beastBook.completeKills();
                break;
                case 'clearitems':
                    $beastBook.clearItems();
                break;
            }
        }
    };