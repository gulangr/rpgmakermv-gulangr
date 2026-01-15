/*:
 * @plugindesc [v3.0] 战斗逐帧调试工具 (+1/+5/+10帧 | 拖拽移动).
 * @author Gemini & User
 *
 * @param Initial Button X
 * @desc 工具栏初始 X 坐标.
 * @default 500
 *
 * @param Initial Button Y
 * @desc 工具栏初始 Y 坐标.
 * @default 10
 *
 * @help
 * ============================================================================
 * 功能介绍
 * ============================================================================
 * [ || ] : 暂停/继续。
 * [ +1 ] : 步进 1 帧 (仅暂停时)。
 * [ +5 ] : 步进 5 帧 (仅暂停时)。
 * [+10 ] : 步进 10 帧 (仅暂停时)。
 * [Slow] : 慢放开关 (1/6 速度)。
 *
 * ★ 移动位置:
 * 1. 【右键拖拽】：在工具栏任意位置按住鼠标右键并移动。
 * 2. 【左键拖拽】：在工具栏的“灰色背景空白处”按住鼠标左键并移动。
 */

(function() {
    var parameters = PluginManager.parameters('BattleFrameStepper');
    var pInitX = Number(parameters['Initial Button X'] || 500);
    var pInitY = Number(parameters['Initial Button Y'] || 10);

    //=============================================================================
    // Mouse Tracker (全局鼠标状态监听)
    //=============================================================================
    var MouseTracker = {
        rightDown: false,
        isDragging: false,
        
        init: function() {
            var _this = this;
            document.addEventListener('mousedown', function(e) {
                if (e.button === 2) _this.rightDown = true;
            });
            document.addEventListener('mouseup', function(e) {
                if (e.button === 2) {
                    _this.rightDown = false;
                    _this.isDragging = false;
                }
            });
            document.addEventListener('contextmenu', function(e) {
                if (_this.isDragging) {
                    e.preventDefault();
                }
            });
        }
    };
    MouseTracker.init();

    //=============================================================================
    // BattleManager
    //=============================================================================
    var _BattleManager_initMembers = BattleManager.initMembers;
    BattleManager.initMembers = function() {
        _BattleManager_initMembers.call(this);
        this._debugPaused = false;
        this._debugStepFrames = 0; // 剩余需要步进的帧数
        this._debugSlowMode = false;
        this._debugSlowCounter = 0;
    };

    // 请求步进 N 帧
    BattleManager.requestStep = function(frames) {
        if (this._debugPaused) {
            this._debugStepFrames += frames;
        }
    };

    //=============================================================================
    // Sprite_DebugButton
    //=============================================================================
    function Sprite_DebugButton() {
        this.initialize.apply(this, arguments);
    }
    Sprite_DebugButton.prototype = Object.create(Sprite_Button.prototype);
    Sprite_DebugButton.prototype.constructor = Sprite_DebugButton;

    Sprite_DebugButton.prototype.initialize = function(type, width) {
        Sprite_Button.prototype.initialize.call(this);
        this._type = type; 
        this._buttonWidth = width || 50; // 默认宽度变小一点以容纳更多按钮
        this._buttonHeight = 30;
        this.createBitmap();
    };

    Sprite_DebugButton.prototype.createBitmap = function() {
        this.bitmap = new Bitmap(this._buttonWidth, this._buttonHeight);
        this.redraw();
    };

    Sprite_DebugButton.prototype.redraw = function() {
        this.bitmap.clear();
        var color = 'rgba(0, 0, 0, 0.8)';
        if (this._type === 'pause' && BattleManager._debugPaused) color = 'rgba(200, 50, 50, 1)';
        if (this._type === 'slow' && BattleManager._debugSlowMode) color = 'rgba(50, 50, 200, 1)';
        
        // 步进中状态反馈
        if ((this._type === 'step1' || this._type === 'step5' || this._type === 'step10') 
             && BattleManager._debugStepFrames > 0) {
             color = 'rgba(100, 100, 100, 1)';
        }

        this.bitmap.fillAll(color);

        var text = "";
        if (this._type === 'pause') text = BattleManager._debugPaused ? "▶" : "||";
        if (this._type === 'step1') text = "+1";
        if (this._type === 'step5') text = "+5";
        if (this._type === 'step10') text = "+10";
        if (this._type === 'slow') text = "Slow";

        this.bitmap.fontSize = 16;
        this.bitmap.drawText(text, 0, 0, this._buttonWidth, this._buttonHeight, 'center');
    };

    Sprite_DebugButton.prototype.update = function() {
        Sprite_Button.prototype.update.call(this);
        // 实时重绘部分按钮
        if (this._type === 'pause' || this._type === 'slow' || BattleManager._debugStepFrames > 0) {
            this.redraw();
        }
        
        // 步进按钮可见性控制
        if (this._type.startsWith('step')) {
            this.opacity = BattleManager._debugPaused ? 255 : 100;
        }
    };

    Sprite_DebugButton.prototype.callClickHandler = function() {
        if (MouseTracker.isDragging) return;

        if (this._type === 'pause') {
            BattleManager._debugPaused = !BattleManager._debugPaused;
            BattleManager._debugStepFrames = 0; // 暂停/播放切换时清空步进队列
            SoundManager.playCursor();
        } 
        else if (this._type === 'step1') BattleManager.requestStep(1);
        else if (this._type === 'step5') BattleManager.requestStep(5);
        else if (this._type === 'step10') BattleManager.requestStep(10);
        else if (this._type === 'slow') {
            BattleManager._debugSlowMode = !BattleManager._debugSlowMode;
            SoundManager.playCursor();
        }
    };

    //=============================================================================
    // Sprite_DebugLayer (容器)
    //=============================================================================
    function Sprite_DebugLayer() {
        this.initialize.apply(this, arguments);
    }
    Sprite_DebugLayer.prototype = Object.create(Sprite.prototype);
    Sprite_DebugLayer.prototype.constructor = Sprite_DebugLayer;

    Sprite_DebugLayer.prototype.initialize = function() {
        Sprite.prototype.initialize.call(this);
        this.x = pInitX;
        this.y = pInitY;
        // 计算总宽度: 5个按钮(约50px宽) + 间隔(5px)
        // Layout: [Pause 50] [step1 40] [step5 40] [step10 45] [Slow 50]
        // 实际坐标微调
        this._width = 250; 
        this._height = 40;
        this._dragOffsetX = 0;
        this._dragOffsetY = 0;
        
        this.createBackground();
        this.createButtons();
    };

    Sprite_DebugLayer.prototype.createBackground = function() {
        this._bgSprite = new Sprite();
        // 动态调整背景大小以适应所有按钮
        this._bgSprite.bitmap = new Bitmap(300, 40);
        this._bgSprite.bitmap.fillAll('rgba(0, 0, 0, 0.4)'); 
        this.addChild(this._bgSprite);
    };

    Sprite_DebugLayer.prototype.createButtons = function() {
        var y = 5;
        var x = 5;
        var gap = 5;

        // Pause (50px)
        this._btnPause = new Sprite_DebugButton('pause', 50);
        this._btnPause.x = x; this._btnPause.y = y;
        this.addChild(this._btnPause);
        x += 50 + gap;

        // +1 (40px)
        this._btnStep1 = new Sprite_DebugButton('step1', 40);
        this._btnStep1.x = x; this._btnStep1.y = y;
        this.addChild(this._btnStep1);
        x += 40 + gap;

        // +5 (40px)
        this._btnStep5 = new Sprite_DebugButton('step5', 40);
        this._btnStep5.x = x; this._btnStep5.y = y;
        this.addChild(this._btnStep5);
        x += 40 + gap;

        // +10 (45px)
        this._btnStep10 = new Sprite_DebugButton('step10', 45);
        this._btnStep10.x = x; this._btnStep10.y = y;
        this.addChild(this._btnStep10);
        x += 45 + gap;

        // Slow (50px)
        this._btnSlow = new Sprite_DebugButton('slow', 50);
        this._btnSlow.x = x; this._btnSlow.y = y;
        this.addChild(this._btnSlow);
        
        // 更新背景宽度以匹配内容
        this._width = x + 50 + 5;
    };

    Sprite_DebugLayer.prototype.update = function() {
        Sprite.prototype.update.call(this);
        this.updateDrag();
        this.children.forEach(function(child) {
            if (child.update) child.update();
        });
    };

    Sprite_DebugLayer.prototype.updateDrag = function() {
        var mx = TouchInput.x;
        var my = TouchInput.y;
        var lx = mx - this.x;
        var ly = my - this.y;
        var isInside = (lx >= 0 && ly >= 0 && lx <= this._width && ly <= this._height);

        // 右键开始
        if (MouseTracker.rightDown && !MouseTracker.isDragging && isInside) {
            MouseTracker.isDragging = true;
            this._dragOffsetX = mx - this.x;
            this._dragOffsetY = my - this.y;
        }

        // 左键背景开始
        if (TouchInput.isPressed() && !MouseTracker.isDragging) {
             // 简单的背景判定：在范围内，且 Y 坐标不在按钮主体区域(虽然按钮几乎占满)
             // 或者为了简化：只要按住且不是点击触发瞬间（长按），就允许拖动
             // 这里采用：如果在范围内按住超过几帧，视为拖动。
             if (isInside && !this.isPointingAtButton(lx, ly)) {
                MouseTracker.isDragging = true;
                this._dragOffsetX = mx - this.x;
                this._dragOffsetY = my - this.y;
             }
        }
        
        if (!TouchInput.isPressed() && !MouseTracker.rightDown) {
            MouseTracker.isDragging = false;
        }

        if (MouseTracker.isDragging) {
            this.x = mx - this._dragOffsetX;
            this.y = my - this._dragOffsetY;
            this.x = Math.max(0, Math.min(Graphics.boxWidth - this._width, this.x));
            this.y = Math.max(0, Math.min(Graphics.boxHeight - this._height, this.y));
            if (MouseTracker.rightDown) TouchInput.clear();
        }
    };

    Sprite_DebugLayer.prototype.isPointingAtButton = function(lx, ly) {
        // 简单检测是否在按钮的Y轴范围内 (y=5~35)
        // 精确判定太繁琐，这里只做Y轴判定，如果是左键点在按钮空隙也能拖
        return (ly >= 5 && ly <= 35);
    };

    //=============================================================================
    // Scene_Battle
    //=============================================================================
    var _Scene_Battle_createDisplayObjects = Scene_Battle.prototype.createDisplayObjects;
    Scene_Battle.prototype.createDisplayObjects = function() {
        _Scene_Battle_createDisplayObjects.call(this);
        this._debugLayer = new Sprite_DebugLayer();
        this.addChild(this._debugLayer);
    };

    var _Scene_Battle_update = Scene_Battle.prototype.update;
    Scene_Battle.prototype.update = function() {
        if (this._debugLayer) this._debugLayer.update();

        // 暂停逻辑
        if (BattleManager._debugPaused) {
            // 如果有剩余的步进帧数，则执行一帧更新，并扣除次数
            if (BattleManager._debugStepFrames > 0) {
                BattleManager._debugStepFrames--;
                _Scene_Battle_update.call(this);
            }
            return; // 否则冻结
        }

        // 慢放逻辑
        if (BattleManager._debugSlowMode) {
            BattleManager._debugSlowCounter++;
            if (BattleManager._debugSlowCounter % 6 !== 0) return; 
        }

        _Scene_Battle_update.call(this);
    };

})();