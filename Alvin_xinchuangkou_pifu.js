Window_ActorCommand.prototype.loadWindowskin = function() {
    this.windowskin = ImageManager.loadSystem('Windowshengshishaonv8');
};

Window_ActorCommand.prototype.makeCommandList = function() {
    if (this._actor) {
        this.addAttackCommand();
        this.addSkillCommands();
        this.addItemCommand();
        this.addGuardCommand();
        this.addAlvinRunCommand();
    }
};

Window_ActorCommand.prototype.addAlvinRunCommand = function() {
    this.addCommand("撤退", 'escape', true);
};

Scene_Battle.prototype.createActorCommandWindow = function() {
    this._actorCommandWindow = new Window_ActorCommand();
    this._actorCommandWindow.setHandler('attack', this.commandAttack.bind(this));
    this._actorCommandWindow.setHandler('skill',  this.commandSkill.bind(this));
    this._actorCommandWindow.setHandler('guard',  this.commandGuard.bind(this));
    this._actorCommandWindow.setHandler('item',   this.commandItem.bind(this));
    this._actorCommandWindow.setHandler('cancel', this.selectPreviousCommand.bind(this));
    this._actorCommandWindow.setHandler('escape', this.commandEscape.bind(this));
    this.addWindow(this._actorCommandWindow);

};

Scene_Battle.prototype.startActorCommandSelection = function() {
    this._statusWindow.select(BattleManager.actor().index());
    this._partyCommandWindow.close();
    this._actorCommandWindow.setup(BattleManager.actor());//设置角色命令窗口的数据//
    var actorSprites = SceneManager._scene._spriteset._actorSprites;//定义变量actorSprites 保存所有角色侧视图的素材 通过_actorSprites直接获取因为这个变量是个数组//
    for ( const actorSprite of actorSprites) {
         if ( actorSprite._actor == BattleManager.actor() ) { //判断每个素材的属性：actor 是否等于battlemanager.actor//
	     this._actorCommandWindow.x = actorSprite.x + -8//将角色的X复制到角色命令窗口的X//
	     this._actorCommandWindow.y = actorSprite.y - 115//将角色的X复制到角色命令窗口的y//
        }
    }
};

Sprite_Actor.prototype.setActorHome = function(index) {
    this.setHome(1550 + index * 32, 450 + index * 140);
};

Window_ActorCommand.prototype.initialize = function() {
    var y = Graphics.boxHeight - this.windowHeight();
    Window_Command.prototype.initialize.call(this, 0, y);
    this.openness = 0;
    this.deactivate();
    this._actor = null;
};

Window_ActorCommand.prototype.windowWidth = function() {
    return 83;
};

Window_ActorCommand.prototype.numVisibleRows = function() {
    return 3;
};
