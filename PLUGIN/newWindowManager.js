//全方面调整对话窗口和选项框位置
//用于RPGmaker MV
/*:
 * @plugindesc 对话窗口调整集成
 * @author 乌枫Raven
 * 
 * @param ■  调整选项框  ■
 * 
 * @param adjustWindowChoiceList
 * @text 是否调整选项框
 * @type boolean
 * @desc 调整选项框位置开关
 * @default true
 * 
 * @param ChoiceList_x
 * @text 选项框水平移动
 * @type number
 * @desc 右侧选项框左移，左侧选项框右移
 * @min 0
 * @default 0
 * 
 * @param ChoiceList_y
 * @text 选项框垂直移动
 * @type number
 * @desc 下移
 * @default 0
 * 
 * @param ■  调整对话框  ■
 * 
 * @param adjustMessageWindow
 * @text 是否调整对话框窗口
 * @type boolean
 * @default true
 * 
 * @param Message_x
 * @text 对话框宽度缩小
 * @type number
 * @default 0
 * 
 * @param Message_y
 * @text 对话框高度缩小
 * @type number
 * @default 0
 * 
 * @param InvisibleWindow
 * @text 使原UI框不可见
 * @type boolean
 * @default true
 * 
 * @param ■  自定义选项框  ■
 * 
 * @param UseOwnChoiceList
 * @text 是否自定义选项框图案
 * @type boolean
 * @default true
 * 
 * @param ItemAdj_w
 * @text 选项宽度调整
 * @type number
 * @default 0
 * 
 * @param ItemAdj_h
 * @text 选项高度调整
 * @type number
 * @default 0
 * 
 * @help
 * 本插件用于调整对话窗口 以及对话中的选项窗美化
 * v1.0：自定义功能并没有对不同位置的选项框进行区分，请谨慎使用
 * 若要使用自定义选项框功能，将ChoiceDefault.png与Chosen.png置于img/sysytem目录下
 * ● ChoiceDefault.png 未被选择的选项状态
 * ● Chosen.png 被选择时的选项状态
 * 
 * 选项窗口背景不同时，可以准备不同的图案用于区分，文件名要求如下：
 * ● 窗口 ChoiceDefault.png Chosen.png
 * ● 暗淡 ChoiceDefault_1.png Chosen_1.png
 * ● 透明 ChoiceDefault_2.png Chosen_2.png
 *
 */
(function(){
	"use strict";
	var pluginName = "newWindowManager";
	var parameters = PluginManager.parameters(pluginName);
	var adjustWindowChoiceList = eval(parameters["adjustWindowChoiceList"]);
	var ChoiceList_x = Number(parameters["ChoiceList_x"] || "0");
	var ChoiceList_y = Number(parameters["ChoiceList_y"] || "0");
	var adjustOnBattle = true;
	var adjustMessageWindow = eval(parameters["adjustMessageWindow"]);
	var Message_x = Number(parameters["Message_x"] || "0");
	var Message_y = Number(parameters["Message_y"] || "0");
	var InvisibleWindow = eval(parameters["InvisibleWindow"]);
	var UseOwnChoiceList = eval(parameters["UseOwnChoiceList"]);
    var ItemAdj_w = Number(parameters["ItemAdj_w"] || "0");
    var ItemAdj_h = Number(parameters["ItemAdj_h"] || "0");
	//自定义选项框

	//调整选项框位置
	var _Window_ChoiceList_updatePlacement = Window_ChoiceList.prototype.updatePlacement;
	Window_ChoiceList.prototype.updatePlacement = function() {
		_Window_ChoiceList_updatePlacement.apply(this, arguments);
		var adjustValue_x = 0;
		var adjustValue_y = 0;
		if ((!$gameParty.inBattle() || adjustOnBattle)&& adjustWindowChoiceList) {
			adjustValue_x = ChoiceList_x;
			adjustValue_y = ChoiceList_y;
		}
		var positionType = $gameMessage.choicePositionType();
		if (positionType === 2) {
			this.x -= adjustValue_x;
		} else if (positionType === 0) {
			this.x += adjustValue_x;
		}
		this.y += adjustValue_y;
		if (UseOwnChoiceList) this.y += this.height;
		
	};
	//调整选项框与选项大小
	Window_ChoiceList.prototype.windowWidth = function() {
    	var width = this.maxChoiceWidth() + this.padding * 2;
		if (UseOwnChoiceList) return Math.min(width+ItemAdj_w, Graphics.boxWidth);
    	else return Math.min(width, Graphics.boxWidth);
	};

	Window_ChoiceList.prototype.lineHeight = function () {
		if (UseOwnChoiceList) return 36+ItemAdj_h;
		else return 36;
	}

	//调整对话框大小
	var _Window_Message_updatePlacement = Window_Message.prototype.updatePlacement;
	Window_Message.prototype.updatePlacement = function() {
		_Window_Message_updatePlacement.apply(this, arguments);
		var adjustValue_x = 0;
		var adjustValue_y = 0;
		if (!$gameParty.inBattle() || adjustOnBattle) {
			if (adjustMessageWindow) {
				adjustValue_x = Message_x;
				adjustValue_y = Message_y;
			}
		}
		this.x = adjustValue_x;
		this.width = Graphics.boxWidth - (adjustValue_x * 2);
		this.height -= adjustValue_y; 
		var positionType = $gameMessage.positionType();
		if (positionType === 2) {
			this.y += adjustValue_y;
		}
		else if (positionType === 1) {
			this.y += adjustValue_y/2;
		}
	};
	//背景透明化
	var _Window_Base_standardBackOpacity = Window_Base.prototype.standardBackOpacity;
	Window_Base.prototype.standardBackOpacity = function() {
		if (InvisibleWindow) return 0;
		else return 192;
	}
	//边框透明化
	var _Window__refreshFrame = Window.prototype._refreshFrame;
	Window.prototype._refreshFrame = function () {
		_Window__refreshFrame.call(this);
		if (InvisibleWindow) this._windowFrameSprite.visible = false;
	}

//背景 ChoiceBack 未选择 ChoiceDefault 选择 Chosen
	//修改背景
	// var _Window_ChoiceList_updateBackground = Window_ChoiceList.prototype.updateBackground;
	// Window_ChoiceList.prototype.updateBackground = function (){
	// 	if (UseOwnChoiceList) {
    //         //绘制背景
	// 		var filename = "ChoiceBack";
    //         var _x = 0;
    //         var _y = 0;
	// 		var img = ImageManager.loadSystem(filename);
    //         if (img.isReady()) {
    //             var sprite = new Sprite(img);
    //             sprite.x = _x;
    //             sprite.y = _y;
    //             this.addChildToBack(sprite);
    //         }
	//     }

	// 	_Window_ChoiceList_updateBackground.apply(this, arguments);

	// };

    //按选择与未选择加载选项
    var _Window_ChoiceList_drawItem = Window_ChoiceList.prototype.drawItem;
    Window_ChoiceList.prototype.drawItem = function (index) {
        _Window_ChoiceList_drawItem.apply(this, arguments);//保持原生成选项不变
        if (UseOwnChoiceList) {
            var itemW = this.itemWidth(); 
            var itemH = this.itemHeight();
            var _x=0;
            var _y=0;
            if (index === this.index()) {
                //绘制被选项
                //console.log("1");
                var sprite = new Sprite(this.chosen);
            }
            else {
                //绘制未被选择项
                //console.log("0");
                var sprite = new Sprite(this.choiceDefault);
            }
            sprite.x = _x;
            sprite.y = _y + index*itemH;
            this.addChildToBack(sprite);
            this.SpriteList.push(sprite);
            this.spnum++;
        }

    };
    Window_ChoiceList.prototype.loadBitmap = function () {
		if (this._background === 0){
        	this.chosen = ImageManager.loadSystem("Chosen");
        	this.choiceDefault = ImageManager.loadSystem("ChoiceDefault");}
		else if (this._background === 1) {
			this.chosen = ImageManager.loadSystem("Chosen_1")
        	this.choiceDefault = ImageManager.loadSystem("ChoiceDefault_1");
		}else if (this._background === 2) {
			this.chosen = ImageManager.loadSystem("Chosen_2");
        	this.choiceDefault = ImageManager.loadSystem("ChoiceDefault_2");
		}
        this.SpriteList = [];
        this.spnum=0;

    }
    var _Window_ChoiceList_initialize = Window_ChoiceList.prototype.initialize;
    Window_ChoiceList.prototype.initialize = function(messageWindow) {
        _Window_ChoiceList_initialize.apply(this, arguments);
        if (UseOwnChoiceList) {
            this.loadBitmap();
        }
    }

    var _Window_Selectable_updateCursor=Window_Selectable.prototype.updateCursor;
    Window_ChoiceList.prototype.updateCursor = function () {
		_Window_Selectable_updateCursor.apply(this, arguments);
		if (UseOwnChoiceList && this.spnum!==0){
            for (var i=0; i<this.spnum;i++) {
                this.removeChild(this.SpriteList[i]);
            }
            this.SpriteList = [];
            this.refresh();
			var rect = this.itemRect(this.index());
        	this.setCursorRect(rect.x, rect.y, rect.width, rect.height-ItemAdj_h);
        }

    }


})();