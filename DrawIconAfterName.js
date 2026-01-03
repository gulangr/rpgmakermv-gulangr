/*:
 * @plugindesc 在名字后方绘制图标 (支持变量控制 + 插件命令修改 + 异步修复)
 * @author Gemini
 *
 * @param Icon Variable ID
 * @desc 全局变量ID，用于强制覆盖所有人的图标。
 * 设置为 0 则不启用全局覆盖。
 * @default 0
 *
 * @param Icon Scale
 * @desc 图标显示的缩放比例。
 * 1.0 = 原大(100%), 0.8 = 缩小到80%
 * @default 1.0
 *
 * @help
 * ============================================================================
 * 插件命令 (Plugin Commands)
 * ============================================================================
 * * 想要在游戏过程中改变某个角色的图标？请在事件中使用以下插件命令：
 *
 * ChangeNameIcon 角色ID 图标ID
 * * 例如：
 * ChangeNameIcon 1 10    -> 把 1号角色 的图标改为 10
 * ChangeNameIcon 1 0     -> 把 1号角色 的图标恢复为默认（读取备注）
 * * ============================================================================
 * 优先级说明
 * ============================================================================
 * 1. 全局变量 (参数 Icon Variable ID) - 优先级最高，如果它大于0，所有人都显示这个。
 * 2. 插件命令设置 - 优先级第二，如果用命令修改过，就显示修改后的。
 * 3. 数据库备注 <NameIcon: x> - 优先级最低，默认显示。
 */

(function() {
    var parameters = PluginManager.parameters('DrawIconAfterName');
    var globalIconVarId = Number(parameters['Icon Variable ID'] || 0);
    var iconScale = Number(parameters['Icon Scale'] || 1.0);

    // --- 1. 预加载逻辑 ---
    var _Scene_Boot_loadSystemImages = Scene_Boot.prototype.loadSystemImages;
    Scene_Boot.prototype.loadSystemImages = function() {
        _Scene_Boot_loadSystemImages.call(this);
        ImageManager.loadSystem('IconSet32');
    };

    // --- 2. 插件命令定义 ---
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'ChangeNameIcon') {
            var actorId = Number(args[0]);
            var iconId = Number(args[1]);
            if ($gameActors.actor(actorId)) {
                // 将自定义图标ID存在 $gameActors 数据里，这样存档会被保存
                $gameActors.actor(actorId)._overrideNameIcon = iconId;
            }
        }
    };

    // --- 3. 绘制逻辑 ---
    var _Window_Base_drawActorName = Window_Base.prototype.drawActorName;
    Window_Base.prototype.drawActorName = function(actor, x, y, width) {
        _Window_Base_drawActorName.call(this, actor, x, y, width);

        // 获取真实的 Game_Actor 对象
        var gameActor = actor.actor ? actor.actor() : actor; // 兼容性处理
        if (!gameActor) return;

        var iconIndex = 0;

        // --- 优先级 C: 读取数据库备注 (默认值) ---
        if (gameActor.meta && gameActor.meta.NameIcon) {
            iconIndex = Number(gameActor.meta.NameIcon);
        }

        // --- 优先级 B: 读取插件命令修改的值 (存档数据) ---
        // 检查这个角色是否有动态修改过的图标
        // 注意：这里用 actor (Game_Actor实例) 而不是 actor.actor() (数据库数据)
        if (actor._overrideNameIcon !== undefined && actor._overrideNameIcon > 0) {
            iconIndex = actor._overrideNameIcon;
        }

        // --- 优先级 A: 读取全局变量覆盖 (强行统一) ---
        if (globalIconVarId > 0) {
            var varValue = $gameVariables.value(globalIconVarId);
            if (varValue > 0) {
                iconIndex = varValue;
            }
        }

        // 开始绘制
        if (iconIndex > 0) {
            var nameWidth = this.textWidth(actor.name());
            var sourceSize = 32; 
            var destSize = Math.floor(sourceSize * iconScale);
            
            var bitmap = ImageManager.loadSystem('IconSet32');

            // --- 异步刷新逻辑 ---
            if (!bitmap.isReady()) {
                if (this.refresh && typeof this.refresh === 'function') {
                    var that = this;
                    bitmap.addLoadListener(function() {
                        that.refresh();
                    });
                }
                return; 
            }
            
            var sx = iconIndex % 16 * sourceSize;
            var sy = Math.floor(iconIndex / 16) * sourceSize;
            var iconX = x + nameWidth + 4;
            var offsetY = (this.lineHeight() - destSize) / 2;
            var iconY = y + offsetY;

            this.contents.blt(bitmap, sx, sy, sourceSize, sourceSize, iconX, iconY, destSize, destSize);
        }
    };
})();