/*:
 * @plugindesc [开发工具 v5] 屏幕尺子 (核弹级置顶 | 解决YEP菜单不显示问题)
 * @author Gemini
 *
 * @param Trigger Key
 * @text 激活热键
 * @desc 推荐使用 tab。
 * @type select
 * @option tab
 * @option shift
 * @option control
 * @option F4
 * @default tab
 *
 * @param Line Color
 * @text 测量线颜色
 * @default #ff0000
 *
 * @param Text Color
 * @text 文字背景色
 * @default rgba(0, 0, 0, 0.9)
 *
 * @help
 * ============================================================================
 * 修复说明 v5 (最终解决方案)
 * ============================================================================
 * 1. 【核心机制重写】：
 * 不再依赖 Scene_Base，直接挂钩 SceneManager。
 * 即使在 YEP 状态菜单或其他复杂界面中，也能强制运行。
 *
 * 2. 【暴力置顶】：
 * 每一帧都会检测并强行把尺子图层移动到最顶端，
 * 防止被 UI 窗口覆盖。
 *
 * 3. 【调试日志】：
 * 按 F8 打开控制台。
 * 当您点击鼠标时，控制台会显示 "Mouse Click Detected!"。
 * 如果没显示，说明输入被底层屏蔽了。
 *
 * ============================================================================
 * 使用方法
 * ============================================================================
 * - 按 [Tab] 键开启/关闭。
 * - 或长按鼠标右键 3 秒开启。
 * - 左键拖拽拉框测量。
 */

(function() {
    var parameters = PluginManager.parameters('Gemini_ScreenRuler_v5');
    // 容错读取
    if (!parameters['Trigger Key']) {
        var scripts = document.querySelectorAll('script');
        for (var i = 0; i < scripts.length; i++) {
            var src = scripts[i].src;
            if (src.indexOf('Gemini_ScreenRuler') > -1) {
                var name = src.split('/').pop().split('.')[0];
                parameters = PluginManager.parameters(name);
                break;
            }
        }
    }

    var triggerKey = String(parameters['Trigger Key'] || 'tab');
    var lineColor = String(parameters['Line Color'] || '#ff0000'); // 默认改为红色，更显眼
    var textBgColor = String(parameters['Text Color'] || 'rgba(0, 0, 0, 0.9)');

    console.log("⚡ [Gemini Ruler v5] 已加载。等待 SceneManager...");

    // 全局状态
    var _rulerActive = false;
    var _isDragging = false;
    var _startX = 0;
    var _startY = 0;
    var _curX = 0;
    var _curY = 0;
    var _rightClickTimer = 0;
    var _rulerSprite = null;

    // ========================================================================
    // 核心挂钩: SceneManager
    // ========================================================================

    var _SceneManager_updateScene = SceneManager.updateScene;
    SceneManager.updateScene = function() {
        _SceneManager_updateScene.call(this);
        
        // 只有当场景存在时才运行
        if (this._scene) {
            updateRulerLogic(this._scene);
        }
    };

    function updateRulerLogic(currentScene) {
        // 1. 初始化精灵 (如果场景切换了，重建精灵)
        if (!_rulerSprite || _rulerSprite.parent !== currentScene) {
            if (_rulerSprite && _rulerSprite.parent) {
                _rulerSprite.parent.removeChild(_rulerSprite);
            }
            _rulerSprite = new Sprite();
            _rulerSprite.bitmap = new Bitmap(Graphics.boxWidth, Graphics.boxHeight);
            _rulerSprite.z = 99999; // 极大值
            currentScene.addChild(_rulerSprite);
            console.log("⚡ [Gemini Ruler] 在新场景中创建标尺层");
        }

        // 2. 暴力置顶 (确保它是最后一个子对象)
        if (_rulerActive && currentScene.children) {
            var lastIndex = currentScene.children.length - 1;
            if (currentScene.children[lastIndex] !== _rulerSprite) {
                currentScene.removeChild(_rulerSprite);
                currentScene.addChild(_rulerSprite);
            }
        }

        // 3. 输入检测
        updateInput();

        // 4. 绘制
        drawRuler();
    }

    function updateInput() {
        // 键盘开关
        if (Input.isTriggered(triggerKey)) {
            toggleRuler("Key: " + triggerKey);
        }

        // 右键长按开关
        if (TouchInput.isCancelled()) {
            _rightClickTimer++;
            if (_rightClickTimer === 180) { // 3秒
                toggleRuler("Right Hold");
                _rightClickTimer = 0;
                SoundManager.playSave();
            }
        } else {
            _rightClickTimer = 0;
        }

        if (_rulerActive) {
            _curX = TouchInput.x;
            _curY = TouchInput.y;

            if (TouchInput.isTriggered()) {
                console.log("⚡ [Gemini Ruler] 检测到鼠标点击! X:" + _curX + " Y:" + _curY);
                _isDragging = true;
                _startX = _curX;
                _startY = _curY;
            }

            if (TouchInput.isReleased()) {
                if (_isDragging) {
                    console.log("⚡ [Gemini Ruler] 拖拽结束。");
                }
                _isDragging = false;
            }
        }
    }

    function toggleRuler(source) {
        _rulerActive = !_rulerActive;
        console.log("⚡ [Gemini Ruler] 开关状态: " + _rulerActive + " (" + source + ")");
        if (_rulerActive) {
            if (SoundManager.playOk) SoundManager.playOk();
        } else {
            if (SoundManager.playCancel) SoundManager.playCancel();
            // 关闭时清空画布
            if (_rulerSprite && _rulerSprite.bitmap) {
                _rulerSprite.bitmap.clear();
            }
        }
    }

    // ========================================================================
    // 绘制函数
    // ========================================================================

    function drawRuler() {
        if (!_rulerSprite || !_rulerSprite.bitmap) return;
        var bmp = _rulerSprite.bitmap;
        
        // 每一帧都清空重绘
        bmp.clear();

        if (!_rulerActive) return;

        var ctx = bmp._context;
        ctx.save();

        // 1. 状态标签
        drawLabel(bmp, 10, 10, "RULER ON (" + triggerKey + ")");

        // 2. 辅助线
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(_curX, 0);
        ctx.lineTo(_curX, Graphics.boxHeight);
        ctx.moveTo(0, _curY);
        ctx.lineTo(Graphics.boxWidth, _curY);
        ctx.stroke();

        // 3. 鼠标坐标
        drawLabel(bmp, _curX + 15, _curY + 15, "X:" + _curX + " Y:" + _curY);

        // 4. 测量矩形
        if (_isDragging) {
            var w = _curX - _startX;
            var h = _curY - _startY;

            // 画框
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.rect(_startX, _startY, w, h);
            ctx.stroke();

            // 数据
            var infoText = "W: " + Math.abs(w) + " H: " + Math.abs(h);
            var cx = _startX + w / 2;
            var cy = _startY + h / 2;
            
            drawLabel(bmp, cx - 40, cy, infoText, true);
            drawLabel(bmp, _startX, _startY - 25, "Start: " + _startX + "," + _startY);
        }

        ctx.restore();
    }

    function drawLabel(bitmap, x, y, text, centered) {
        var fontSize = 14;
        bitmap.fontSize = fontSize;
        var textWidth = bitmap.measureTextWidth(text);
        var padding = 4;
        
        if (centered) x = x + (textWidth / 2);

        // 边界限制
        if (x < 0) x = 0;
        if (y < 0) y = 0;
        if (x + textWidth > Graphics.boxWidth) x = Graphics.boxWidth - textWidth;
        if (y + fontSize + padding*2 > Graphics.boxHeight) y = Graphics.boxHeight - fontSize - padding*2;

        var ctx = bitmap._context;
        ctx.save();
        ctx.fillStyle = textBgColor;
        ctx.fillRect(x, y, textWidth + padding * 2, fontSize + padding * 2);
        
        bitmap.textColor = '#ffffff';
        bitmap.drawText(text, x + padding, y + padding, textWidth, fontSize, 'left');
        ctx.restore();
    }

})();