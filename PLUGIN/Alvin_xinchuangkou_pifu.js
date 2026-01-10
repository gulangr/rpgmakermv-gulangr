//=============================================================================
// Alvin_xinchuangkou_pifu_Safe.js
// 修复版：兼容 Yanfly 插件
//=============================================================================

(function() {

    //-----------------------------------------------------------------------------
    // Window_ActorCommand
    //

    // 载入窗口皮肤 (保持原样，因为是新增方法或覆盖默认皮肤)
    Window_ActorCommand.prototype.loadWindowskin = function() {
        this.windowskin = ImageManager.loadSystem('Windowshengshishaonv8');
    };

    // 兼容写法：修改命令列表
    var _Window_ActorCommand_makeCommandList = Window_ActorCommand.prototype.makeCommandList;
    Window_ActorCommand.prototype.makeCommandList = function() {
        // 调用原有的方法（保留 Yanfly 的封印、冷却等逻辑）
        _Window_ActorCommand_makeCommandList.call(this);
        // 如果列表中没有撤退，且需要添加，则添加（防止重复或逻辑冲突）
        // 原插件强制添加了 addAlvinRunCommand，这里我们追加在最后
        this.addAlvinRunCommand();
    };

    Window_ActorCommand.prototype.addAlvinRunCommand = function() {
        // 防止重复添加
        if (this._list.some(function(cmd) { return cmd.symbol === 'escape'; })) return;
        this.addCommand("撤退", 'escape', true);
    };

    // 覆盖默认参数 (这些通常没问题，保留覆盖)
    Window_ActorCommand.prototype.windowWidth = function() {
        return 83;
    };

    Window_ActorCommand.prototype.numVisibleRows = function() {
        return 3;
    };
    
    // 初始化方法兼容
    var _Window_ActorCommand_initialize = Window_ActorCommand.prototype.initialize;
    Window_ActorCommand.prototype.initialize = function() {
        _Window_ActorCommand_initialize.call(this); // 调用原来的初始化
        // 重新应用原插件的特殊设置
        var y = Graphics.boxHeight - this.windowHeight();
        this.move(0, y, this.width, this.height); // 确保位置
        this.openness = 0;
        this.deactivate();
        this._actor = null;
    };

    //-----------------------------------------------------------------------------
    // Scene_Battle
    //

    // 兼容写法：创建指令窗口
    var _Scene_Battle_createActorCommandWindow = Scene_Battle.prototype.createActorCommandWindow;
    Scene_Battle.prototype.createActorCommandWindow = function() {
        // 先运行 Yanfly 或其他插件的逻辑
        _Scene_Battle_createActorCommandWindow.call(this);
        // 补充绑定 escape 的处理函数
        this._actorCommandWindow.setHandler('escape', this.commandEscape.bind(this));
    };

    // 兼容写法：开始角色指令选择 (关键修复点！)
    var _Scene_Battle_startActorCommandSelection = Scene_Battle.prototype.startActorCommandSelection;
    Scene_Battle.prototype.startActorCommandSelection = function() {
        // 1. 先运行 Yanfly 的逻辑 (确保数据正确，防止 crash)
        _Scene_Battle_startActorCommandSelection.call(this);

        // 2. 运行原插件的“跟随角色移动窗口”逻辑
        var actorSprites = this._spriteset._actorSprites; // 获取战斗图数组
        for (var i = 0; i < actorSprites.length; i++) {
            var actorSprite = actorSprites[i];
            if (actorSprite._actor === BattleManager.actor()) {
                this._actorCommandWindow.x = actorSprite.x - 8;
                this._actorCommandWindow.y = actorSprite.y - 115;
                break; 
            }
        }
    };

    //-----------------------------------------------------------------------------
    // Sprite_Actor
    //
    
    // 如果这个也是覆盖，建议也兼容，但如果是简单的位置调整，覆盖通常没事。
    // 这里保留原写法，但在外面包了一层以防万一
    Sprite_Actor.prototype.setActorHome = function(index) {
        this.setHome(1550 + index * 32, 450 + index * 140);
    };

})();