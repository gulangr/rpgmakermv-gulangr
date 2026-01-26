/*:
 * @plugindesc 战斗中无缝状态菜单 (完美持久化 v11) - 修复战斗卡死
 * @author Gemini (Based on User Request)
 *
 * @param ---遮罩设置---
 * @default
 *
 * @param Mask Color
 * @text 遮罩颜色
 * @parent ---遮罩设置---
 * @desc 战斗背景上覆盖层的颜色。使用十六进制格式格式。
 * @default #000000
 *
 * @param Mask Opacity
 * @text 遮罩透明度
 * @parent ---遮罩设置---
 * @type number
 * @min 0
 * @max 255
 * @desc 遮罩的透明度。0为全透明，255为完全不透明。
 * @default 160
 *
 * @help
 * ============================================================================
 * 功能说明 (v11 更新)
 * ============================================================================
 * 本插件允许在战斗中无缝打开状态菜单，查看完毕后完美恢复战斗现场。
 *
 * 【v11 关键修复】：
 * 1. 修复了 v10 版本中导致战斗命令选定后“卡死/静止”的严重 Bug。
 * 原因：在恢复战斗场景时，漏掉了激活场景的指令 (Scene_Base.start)，
 * 导致战斗逻辑循环 (Update) 无法启动。
 *
 * 【v10 特性保留】：
 * 1. 修复撤退/战斗结束时的卡死问题。
 * 2. TagSystem 剑标锁定提示与遮罩功能。
 *
 * ============================================================================
 * 使用要求
 * ============================================================================
 * 1. 必须安装 YEP_BattleEngineCore 和 YEP_StatusMenuCore。
 * 2. 必须将本插件放在插件列表的【最下方】！！！
 * 3. 插件文件名必须为: Gemini_BattleStatus_Seamless.js
 */

(function() {

    // ========================================================================
    // 0. 读取插件参数
    // ========================================================================
    var parameters = PluginManager.parameters('Gemini_BattleStatus_Seamless');
    var maskColor = String(parameters['Mask Color'] || '#000000');
    var maskOpacity = Number(parameters['Mask Opacity'] || 160);

    // ========================================================================
    // 1. SceneManager 核心黑科技：实例冻结与解冻
    // ========================================================================

    var _SceneManager_push = SceneManager.push;
    SceneManager.push = function(sceneClass) {
        if (this._scene instanceof Scene_Battle && sceneClass === Scene_Status) {
            this._stack.push(this._scene);
            this._scene._isPaused = true; 
            this._scene.stop();
            this.goto(sceneClass);
        } else {
            _SceneManager_push.call(this, sceneClass);
        }
    };

    var _SceneManager_pop = SceneManager.pop;
    SceneManager.pop = function() {
        var stackTop = this._stack.length > 0 ? this._stack[this._stack.length - 1] : null;

        if (stackTop && typeof stackTop === 'object' && stackTop instanceof Scene_Battle && stackTop._isPaused) {
            this._nextScene = this._stack.pop();
            this._nextScene._isResumed = true;
            this._nextScene._isPaused = false; 
            if (this._scene) {
                this._scene.stop();
            }
        } else {
            _SceneManager_pop.call(this);
        }
    };

    // ========================================================================
    // 2. Scene_Battle 拦截器：防止重置
    // ========================================================================

    var _Scene_Battle_terminate = Scene_Battle.prototype.terminate;
    Scene_Battle.prototype.terminate = function() {
        if (this._isPaused) return; 
        _Scene_Battle_terminate.call(this);
    };

    var _Scene_Battle_create = Scene_Battle.prototype.create;
    Scene_Battle.prototype.create = function() {
        if (this._isResumed) return;
        _Scene_Battle_create.call(this);
    };

    var _Scene_Battle_start = Scene_Battle.prototype.start;
    Scene_Battle.prototype.start = function() {
        if (this._isResumed) {
            this._isResumed = false;
            
            // 【v11 核心修复】
            // 必须调用 Scene_Base 的 start 来将 this._active 设为 true。
            // 否则 Scene_Battle.update 将认为场景未激活，从而停止更新 BattleManager！
            Scene_Base.prototype.start.call(this);

            if (this._fadeDuration > 0) {
                 this.startFadeIn(this._fadeDuration, false);
            } else {
                 this.startFadeIn(this.fadeSpeed(), false);
            }
            BattleManager.playBattleBgm();

            $gameParty._inBattle = true;
            this.refreshStatus();

            if (Imported.LL_StandingPictureBattleMV && this._standingPicture1) {
                this._standingPicture1.opacity = 255;
            }

            if (BattleManager.isInputting()) {
                var actor = BattleManager.actor();
                if (actor) {
                    this._actorCommandWindow.setup(actor);
                    this._actorCommandWindow.activate();
                } else {
                    this.startPartyCommandSelection();
                }
            }
            return; 
        }
        _Scene_Battle_start.call(this);
    };

    // ========================================================================
    // 3. 界面整合
    // ========================================================================

    var _Window_ActorCommand_makeCommandList = Window_ActorCommand.prototype.makeCommandList;
    Window_ActorCommand.prototype.makeCommandList = function() {
        _Window_ActorCommand_makeCommandList.call(this);
        var statusCommand = { name: TextManager.status, symbol: 'gemini_status', enabled: true, ext: null };
        var index = -1;
        for (var i = 0; i < this._list.length; i++) {
            if (this._list[i].symbol === 'item') { index = i; break; }
        }
        if (index !== -1) this._list.splice(index + 1, 0, statusCommand);
        else this._list.push(statusCommand);
    };

    var _Scene_Battle_createActorCommandWindow = Scene_Battle.prototype.createActorCommandWindow;
    Scene_Battle.prototype.createActorCommandWindow = function() {
        _Scene_Battle_createActorCommandWindow.call(this);
        this._actorCommandWindow.setHandler('gemini_status', this.onGeminiStatus.bind(this));
    };

    Scene_Battle.prototype.onGeminiStatus = function() {
        var actor = BattleManager.actor();
        if (!actor) return;
        $gameParty.setMenuActor(actor);
        SceneManager.snapForBackground();
        SceneManager.push(Scene_Status);
    };

    // ========================================================================
    // 4. 状态菜单背景处理
    // ========================================================================

    var _Scene_Status_createBackground = Scene_Status.prototype.createBackground;
    Scene_Status.prototype.createBackground = function() {
        var prevIsBattle = false;
        if (SceneManager._stack.length > 0) {
            var stackTop = SceneManager._stack[SceneManager._stack.length - 1];
            if (stackTop instanceof Scene_Battle) prevIsBattle = true;
        }

        if (prevIsBattle) {
            this._backgroundSprite = new Sprite();
            this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
            this.addChild(this._backgroundSprite);

            this._overlaySprite = new Sprite(new Bitmap(Graphics.boxWidth, Graphics.boxHeight));
            this._overlaySprite.bitmap.fillAll(maskColor);
            this._overlaySprite.opacity = maskOpacity;
            this.addChild(this._overlaySprite);
        } else {
            _Scene_Status_createBackground.call(this);
        }
    };

    Scene_Status.prototype.popScene = function() {
        SceneManager.pop();
    };

    // ========================================================================
    // 5. TagSystem 剑标锁定补丁
    // ========================================================================
    
    var _Scene_Status_create = Scene_Status.prototype.create;
    Scene_Status.prototype.create = function() {
        _Scene_Status_create.call(this);

        if ($gameParty.inBattle() && Imported.TagSystem) {
            var self = this;
            setTimeout(function() {
                var win = self._customExtWindow;
                if (win && win.update) {
                    
                    var _TagSystem_win_update = win.update;

                    win.update = function() {
                        
                        if (this.visible && this._swordMarkClickZones && this._swordMarkClickZones.length > 0) {
                            if (TouchInput.isTriggered()) {
                                var pad = this.standardPadding ? this.standardPadding() : 18;
                                var x = this.canvasToLocalX(TouchInput.x) - pad;
                                var y = this.canvasToLocalY(TouchInput.y) - pad;

                                for (var i = 0; i < this._swordMarkClickZones.length; i++) {
                                    var zone = this._swordMarkClickZones[i];
                                    
                                    var isLeft = (x >= zone.leftZone.x && x <= zone.leftZone.x + zone.leftZone.width &&
                                                  y >= zone.leftZone.y && y <= zone.leftZone.y + zone.leftZone.height);
                                                  
                                    var isRight = (x >= zone.rightZone.x && x <= zone.rightZone.x + zone.rightZone.width &&
                                                   y >= zone.rightZone.y && y <= zone.rightZone.y + zone.rightZone.height);

                                    if (isLeft || isRight) {
                                        SoundManager.playBuzzer();

                                        if (self._activeWarningSprite) return;

                                        var r = zone.rect;
                                        var sprite = new Sprite(new Bitmap(r.width, r.height));
                                        
                                        sprite.x = this.x + pad + r.x;
                                        sprite.y = this.y + pad + r.y;
                                        sprite.z = 100; 
                                        
                                        sprite.bitmap.fillAll('rgba(0, 0, 0, 0.6)');
                                        
                                        sprite.bitmap.fontSize = 20;
                                        sprite.bitmap.textColor = '#ff6060'; 
                                        sprite.bitmap.outlineColor = 'rgba(0, 0, 0, 0.8)';
                                        sprite.bitmap.outlineWidth = 4;
                                        sprite.bitmap.drawText("战斗中禁止切换", 0, 0, r.width, r.height, 'center');
                                        
                                        self._activeWarningSprite = sprite;
                                        self.addChild(sprite);

                                        setTimeout(function() {
                                            if (self._activeWarningSprite === sprite) {
                                                self.removeChild(sprite);
                                                if (sprite.bitmap) sprite.bitmap.clear();
                                                self._activeWarningSprite = null;
                                            }
                                        }, 1000);

                                        var backupZones = this._swordMarkClickZones;
                                        this._swordMarkClickZones = [];
                                        _TagSystem_win_update.call(this);
                                        this._swordMarkClickZones = backupZones;

                                        return; 
                                    }
                                }
                            }
                        }
                        _TagSystem_win_update.call(this);
                    };
                }
            }, 50); 
        }
    };

})();
