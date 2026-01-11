//=============================================================================
// Alvin_xinchuangkou_pifu_Fix.js
// 智能版：动态识别“第一个行动者”，完美拦截 PartyCommand
//=============================================================================

(function() {

    //-----------------------------------------------------------------------------
    // Window_ActorCommand
    //-----------------------------------------------------------------------------

    // 1. 载入窗口皮肤
    Window_ActorCommand.prototype.loadWindowskin = function() {
        this.windowskin = ImageManager.loadSystem('Windowshengshishaonv8');
    };

    // 2. 添加撤退指令
    var _Window_ActorCommand_makeCommandList = Window_ActorCommand.prototype.makeCommandList;
    Window_ActorCommand.prototype.makeCommandList = function() {
        _Window_ActorCommand_makeCommandList.call(this);
        this.addAlvinRunCommand();
    };

    Window_ActorCommand.prototype.addAlvinRunCommand = function() {
        if (this._list.some(function(cmd) { return cmd.symbol === 'escape'; })) return;
        this.addCommand("撤退", 'escape', true);
    };

    // 3. 窗口参数
    Window_ActorCommand.prototype.windowWidth = function() {
        return 83;
    };

    Window_ActorCommand.prototype.numVisibleRows = function() {
        return 3;
    };
    
    // 4. 初始化
    var _Window_ActorCommand_initialize = Window_ActorCommand.prototype.initialize;
    Window_ActorCommand.prototype.initialize = function() {
        _Window_ActorCommand_initialize.call(this); 
        var y = Graphics.boxHeight - this.windowHeight();
        this.move(0, y, this.width, this.height);
        this.openness = 0;
        this.deactivate();
        this._actor = null;
    };

    //=============================================================================
    // 【核心修复：智能拦截逻辑】
    //=============================================================================
    var _Window_ActorCommand_processCancel = Window_ActorCommand.prototype.processCancel;
    Window_ActorCommand.prototype.processCancel = function() {
        
        // 1. 获取当前角色索引
        var currentIndex = BattleManager._actorIndex;
        
        // 2. 智能检查：前面是否还有能够行动的队友？
        var canGoBack = false;
        // 从当前角色的前一个开始，一直往前找
        for (var i = currentIndex - 1; i >= 0; i--) {
            var member = $gameParty.members()[i];
            // 如果找到了一个能输入的队友，说明可以回退
            if (member && member.canInput()) {
                canGoBack = true;
                break;
            }
        }

        // 3. 判断拦截
        // 如果前面没有可以回退的队友 (canGoBack 为 false)
        // 或者这是 CTB 模式 (CTB 模式通常单人行动，无法切换队友，永远拦截)
        var isCTB = BattleManager.isCTB && BattleManager.isCTB(); 
        
        if (!canGoBack || isCTB) {
            // === 拦截生效 ===
            // 播放禁止音效
            SoundManager.playBuzzer();
            // 强制激活窗口，防止失焦卡死
            this.activate();
            // 吞掉这次取消操作，什么都不做
            return;
        }

        // 4. 如果前面有队友，允许正常回退
        _Window_ActorCommand_processCancel.call(this);
    };

    //-----------------------------------------------------------------------------
    // Scene_Battle
    //-----------------------------------------------------------------------------

    var _Scene_Battle_createActorCommandWindow = Scene_Battle.prototype.createActorCommandWindow;
    Scene_Battle.prototype.createActorCommandWindow = function() {
        _Scene_Battle_createActorCommandWindow.call(this);
        // 绑定 escape 键功能
        this._actorCommandWindow.setHandler('escape', this.commandEscape.bind(this));
        
        // 注意：cancel 键已经由上面的 processCancel 底层接管，无需在此 setHandler
    };

    var _Scene_Battle_startActorCommandSelection = Scene_Battle.prototype.startActorCommandSelection;
    Scene_Battle.prototype.startActorCommandSelection = function() {
        _Scene_Battle_startActorCommandSelection.call(this);
        // 窗口跟随
        if (this._spriteset && this._spriteset._actorSprites) {
            var actorSprites = this._spriteset._actorSprites; 
            for (var i = 0; i < actorSprites.length; i++) {
                var actorSprite = actorSprites[i];
                if (actorSprite._actor === BattleManager.actor()) {
                    this._actorCommandWindow.x = actorSprite.x - 8;
                    this._actorCommandWindow.y = actorSprite.y - 115;
                    break; 
                }
            }
        }
    };

    //-----------------------------------------------------------------------------
    // Sprite_Actor
    //-----------------------------------------------------------------------------
    
    Sprite_Actor.prototype.setActorHome = function(index) {
        this.setHome(1550 + index * 32, 450 + index * 140);
    };

})();