/*:
 * @plugindesc [v13 智能适配版] 状态菜单立绘 (自动适应窗口大小，防截断)
 * @author Gemini
 *
 * @param --- 布局设置 ---
 *
 * @param Picture Window Width
 * @text 立绘窗口宽度
 * @type number
 * @default 600
 *
 * @param Picture Alignment
 * @text 图片对齐方式
 * @type select
 * @option 居中 (Center)
 * @value center
 * @option 靠右 (Right)
 * @value right
 * @option 靠左 (Left)
 * @value left
 * @default right
 *
 * @param Picture Max Width
 * @text 图片最大宽度限制
 * @desc 图片缩放后的宽度绝对不会超过此值。
 * @type number
 * @default 600
 *
 * @param Picture Max Height
 * @text 图片最大高度限制
 * @desc 图片缩放后的高度绝对不会超过此值。
 * @type number
 * @default 800
 *
 * @param Offset X
 * @text 图片 X 偏移
 * @type number
 * @default 0
 *
 * @param Offset Y
 * @text 图片 Y 偏移
 * @type number
 * @default 0
 *
 * @param --- 窗口样式 ---
 *
 * @param Window Opacity
 * @text 窗口透明度
 * @type number
 * @min 0
 * @max 255
 * @default 255
 *
 * @param --- 交互设置 ---
 *
 * @param Enable Left Right Switch
 * @text 启用左右键切换角色
 * @type boolean
 * @default true
 *
 * @param --- 调试与修复 ---
 * @param Force Right Align
 * @text [修复] 强制窗口贴右
 * @type boolean
 * @default true
 *
 * @param --- 独立图片设置 ---
 * @param Actor 1 Image
 * @text 角色1 强制图片
 * @default 
 *
 * @help
 * ============================================================================
 * 更新说明 v13
 * ============================================================================
 * 1. 【智能缩放修复】：
 * 之前的版本只根据“最大宽度限制”来缩放，导致如果窗口本身很窄，
 * 图片虽然缩放了但还是比窗口大，从而被截断。
 *
 * 现在的逻辑是：
 * 最终限制宽度 = Min(您设置的最大宽, 窗口当前的实际宽)
 * 最终限制高度 = Min(您设置的最大高, 窗口当前的实际高)
 *
 * 保证图片始终等比例缩放，且完整显示在窗口内。
 */

(function() {
    var parameters = PluginManager.parameters('Gemini_StatusMenu_Picture_Universal_v13');
    if (!parameters['Picture Window Width']) {
        var scripts = document.querySelectorAll('script');
        for (var i = 0; i < scripts.length; i++) {
            var src = scripts[i].src;
            if (src.indexOf('Gemini_StatusMenu_Picture') > -1) {
                var name = src.split('/').pop().split('.')[0];
                parameters = PluginManager.parameters(name);
                break;
            }
        }
    }

    var picWinWidth = Number(parameters['Picture Window Width'] || 600);
    var picAlign = String(parameters['Picture Alignment'] || 'right');
    var picMaxWidth = Number(parameters['Picture Max Width'] || 600);
    var picMaxHeight = Number(parameters['Picture Max Height'] || 800);
    var picOffsetX = Number(parameters['Offset X'] || 0);
    var picOffsetY = Number(parameters['Offset Y'] || 0);
    var winOpacity = Number(parameters['Window Opacity']);
    if (isNaN(winOpacity)) winOpacity = 255;
    
    var forceRight = (parameters['Force Right Align'] !== 'false');
    var enableLR = (parameters['Enable Left Right Switch'] !== 'false');

    // ========================================================================
    // 辅助函数
    // ========================================================================
    function getBottomLimitY() {
        var limit = Graphics.boxHeight;
        var customParams = PluginManager.parameters('YEP_StatusMenu_CustomWindow');
        if (customParams && customParams['Window Y']) {
            var customY = Number(customParams['Window Y']);
            if (!isNaN(customY) && customY > 0) {
                limit = customY;
            }
        }
        return limit;
    }

    // ========================================================================
    // 1. 场景逻辑扩展
    // ========================================================================
    
    var _Scene_Status_update = Scene_Status.prototype.update;
    Scene_Status.prototype.update = function() {
        _Scene_Status_update.call(this);
        
        if (enableLR && this.isActive()) {
            var canSwitch = false;
            if (this._commandWindow && this._commandWindow.active) {
                if (this._commandWindow.maxCols() === 1) canSwitch = true;
            } else if (!this._commandWindow || !this._commandWindow.active) {
                canSwitch = true;
            }

            if (canSwitch) {
                var lastIndex = this._commandWindow ? this._commandWindow.index() : 0;
                if (Input.isTriggered('right')) {
                    SoundManager.playCursor();
                    this.nextActor();
                    if (this._commandWindow) this._commandWindow.select(lastIndex);
                } else if (Input.isTriggered('left')) {
                    SoundManager.playCursor();
                    this.previousActor();
                    if (this._commandWindow) this._commandWindow.select(lastIndex);
                }
            }
        }
    };

    // ========================================================================
    // 2. 左侧窗口调整
    // ========================================================================
    if (Imported.YEP_StatusMenuCore) {
        var _Window_StatusInfo_initialize = Window_StatusInfo.prototype.initialize;
        Window_StatusInfo.prototype.initialize = function(y, commandWindow) {
            _Window_StatusInfo_initialize.call(this, y, commandWindow);
            
            var newWidth = Graphics.boxWidth - picWinWidth;
            this.width = newWidth;

            var bottomLimit = getBottomLimitY(); 
            var newHeight = bottomLimit - y;     
            if (newHeight < 100) newHeight = 100;

            this.height = newHeight;
            this.createContents();
            this.refresh();
        };
    }

    // ========================================================================
    // 3. 右侧窗口创建
    // ========================================================================
    var _Scene_Status_create = Scene_Status.prototype.create;
    Scene_Status.prototype.create = function() {
        _Scene_Status_create.call(this);
        this.createStandingPictureWindow();
    };

    Scene_Status.prototype.createStandingPictureWindow = function() {
        var wy = this._helpWindow.height;
        if (this._infoWindow) wy = this._infoWindow.y;
        
        var bottomLimit = getBottomLimitY();
        var wh = bottomLimit - wy;
        if (wh < 100) wh = 100;

        var wx = Graphics.boxWidth - picWinWidth;
        
        this._pictureWindow = new Window_StatusPicture(wx, wy, picWinWidth, wh);
        this._pictureWindow.setActor(this.actor());
        this.addWindow(this._pictureWindow);
    };

    var _Scene_Status_refreshActor = Scene_Status.prototype.refreshActor;
    Scene_Status.prototype.refreshActor = function() {
        _Scene_Status_refreshActor.call(this);
        if (this._pictureWindow) this._pictureWindow.setActor(this.actor());
    };

    // ========================================================================
    // 4. 窗口类实现
    // ========================================================================
    function Window_StatusPicture() {
        this.initialize.apply(this, arguments);
    }

    Window_StatusPicture.prototype = Object.create(Window_Base.prototype);
    Window_StatusPicture.prototype.constructor = Window_StatusPicture;

    Window_StatusPicture.prototype.initialize = function(x, y, width, height) {
        Window_Base.prototype.initialize.call(this, x, y, width, height);
        this._actor = null;
        this.opacity = winOpacity;
    };
    
    Window_StatusPicture.prototype.update = function() {
        Window_Base.prototype.update.call(this);
        if (forceRight) {
            var targetX = Graphics.boxWidth - this.width;
            if (this.x !== targetX) this.x = targetX;
        }
    };

    Window_StatusPicture.prototype.setActor = function(actor) {
        if (this._actor !== actor) {
            this._actor = actor;
            this.refresh();
        }
    };

    Window_StatusPicture.prototype.refresh = function() {
        this.contents.clear();
        if (!this._actor) return;
        
        var imageName = this.huntForPicture();
        if (imageName) {
            this.drawStandingPicture(imageName);
        }
    };

    Window_StatusPicture.prototype.huntForPicture = function() {
        var id = this._actor.actorId();
        if (parameters['Actor ' + id + ' Image']) {
            var manualImg = String(parameters['Actor ' + id + ' Image']);
            if (manualImg && manualImg.length > 0) return manualImg;
        }

        var targetImage = null;
        for (var i = 0; i < $plugins.length; i++) {
            var plugin = $plugins[i];
            if (!plugin.status) continue;
            var rawList = null;
            if (plugin.parameters['sbCommandPictures']) rawList = plugin.parameters['sbCommandPictures']; 
            else if (plugin.parameters['standingPictures']) rawList = plugin.parameters['standingPictures'];

            if (rawList) {
                try {
                    var list = JSON.parse(rawList);
                    for (var j = 0; j < list.length; j++) {
                        var item = JSON.parse(list[j]);
                        if (Number(item.actorId) === id) {
                            if (item.imageName) return item.imageName;
                        }
                    }
                } catch (e) { continue; }
            }
        }
        return targetImage;
    };

    Window_StatusPicture.prototype.drawStandingPicture = function(imageName) {
        var bitmap = ImageManager.loadPicture(imageName);
        var self = this;
        
        bitmap.addLoadListener(function() {
            var bw = bitmap.width;
            var bh = bitmap.height;
            if (bw <= 0 || bh <= 0) return;
            
            // --- v13 核心修改：双重限制计算 ---
            // 1. 获取窗口实际可绘图区域大小 (减去内边距后的安全区域)
            var windowContentWidth = self.contents.width;
            var windowContentHeight = self.contents.height;

            // 2. 取“参数限制”和“实际窗口大小”的较小值作为最终限制
            var limitW = Math.min(picMaxWidth, windowContentWidth);
            var limitH = Math.min(picMaxHeight, windowContentHeight);

            // 3. 计算缩放比例 (如果图片比限制大，则缩小；如果小，保持原样)
            var scale = 1;
            if (bw > limitW || bh > limitH) {
                var scaleX = limitW / bw;
                var scaleY = limitH / bh;
                scale = Math.min(scaleX, scaleY);
            }
            
            var finalW = Math.floor(bw * scale);
            var finalH = Math.floor(bh * scale);
            
            // --- 对齐计算 ---
            var dx = 0;
            if (picAlign === 'right') {
                dx = self.contents.width - finalW;
            } else if (picAlign === 'left') {
                dx = 0;
            } else {
                dx = (self.contents.width - finalW) / 2;
            }
            
            dx += picOffsetX;
            // 底部对齐
            var dy = (self.contents.height - finalH) + picOffsetY;
            
            self.contents.blt(bitmap, 0, 0, bw, bh, dx, dy, finalW, finalH);
        });
    };

})();