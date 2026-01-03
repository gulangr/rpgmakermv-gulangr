//=============================================================================
// Drill_ItemTextColor.js
//=============================================================================

/*:
 * @plugindesc (v1.0) 主菜单 - 物品文本颜色
 * @author Drill_up
 * 
 * @param 颜色配置
 * @type text[]
 * @desc 自定义你的配置颜色，可以无限添加。
 * @default ["#FF4444","#FF784C","#FFFF40","#80FF80","#98F5FF","#40C0F0","#8080FF","#FF69B4","#8B4C39","#BEBEBE","#797979"]
 * 
 * @help  
 * =============================================================================
 * +++ Drill_ItemTextColor +++
 * 作者：Drill_up
 * 如果你有兴趣，也可以来看看我的mog中文全翻译插件哦ヽ(*。>Д<)o゜
 * https://rpg.blue/thread-409713-1-1.html
 * =============================================================================
 * 根据物品/装备中的标签注释，改变文本颜色。只此一个单独的功能。
 * ★★插件要放在各菜单界面的前面，放后面可能部分菜单的颜色没变化★★
 * 
 * -----------------------------------------------------------------------------
 * ----激活条件：
 * 在要修改颜色的装备或者物品下，添加注释即可：
 *
 * <颜色:1>
 * <颜色:#FF4444>
 *
 * 颜色后面的数字1对应你配置中的第1个颜色。你也可以直接贴颜色代码。
 *
 * -----------------------------------------------------------------------------
 * ----关于颜色：
 * 默认配置是：
 *  #FF4444 赤   <颜色:1>
 *  #FF784C 橙   <颜色:2>
 *  #FFFF40 黄   <颜色:3>
 *  #80FF80 绿   <颜色:4>
 *  #98F5FF 青   <颜色:5>
 *  #40C0F0 蓝   <颜色:6>
 *  #8080FF 紫   <颜色:7>
 *  #FF69B4 粉   <颜色:8>
 *  #8B4C39 棕   <颜色:9>
 *  #BEBEBE 亮灰 <颜色:10>
 *  #797979 暗灰 <颜色:11>
 *
 * 如果你想配置更完美的颜色，推荐去这个网址找到你想要的颜色代码：
 * http://tool.oschina.net/commons?type=3
 *
 */
 
//=============================================================================
// ** 变量获取
//=============================================================================
　　var Imported = Imported || {};
　　Imported.Drill_ItemTextColor = true;
　　var DrillUp = DrillUp || {}; 

    DrillUp.parameters = PluginManager.parameters('Drill_ItemTextColor');
	if(DrillUp.parameters['颜色配置'] != "" ){
		DrillUp.color_conf = JSON.parse(DrillUp.parameters['颜色配置']);
	}else{
		DrillUp.color_conf = ["#FF4444","#FF784C","#FFFF40","#80FF80","#98F5FF","#40C0F0","#8080FF","#FF69B4","#8B4C39","#BEBEBE","#797979"];
	}

//=============================================================================
// ** 复写函数
//=============================================================================

var _Window_Base_drawItemName = Window_Base.prototype.drawItemName;
Window_Base.prototype.drawItemName = function(item, x, y, width) {
    width = width || 312;
    if (item) {
		var color = String(item.meta['颜色'] || "");
		if(color !== ""){
			if( color.slice(0,1) === "#" ){
				this.changeTextColor(color);
			}else{
				this.changeTextColor(DrillUp.color_conf[ Number(color) -1 ]);
			}
		}else{
			this.resetTextColor();
		}
        var iconBoxWidth = Window_Base._iconWidth + 4;
        this.drawIcon(item.iconIndex, x + 2, y + 2);
        this.drawText(item.name, x + iconBoxWidth, y, width - iconBoxWidth);
		this.resetTextColor();
    }
}

