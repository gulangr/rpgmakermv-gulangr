/*:
 * @plugindesc (v1.1) TagSystem 数据外置与实时同步工具 - 适配版
 * @author Gemini
 *
 * @param JSON File Path
 * @text JSON文件路径
 * @desc 标签数据文件的存放路径（相对于游戏根目录）。
 * @default data/TagSystem.json
 *
 * @param Auto Reload
 * @text 启用实时热更新
 * @type boolean
 * @on 开启
 * @off 关闭
 * @desc 修改JSON文件后是否自动同步到游戏中（无需重启）。
 * @default true
 *
 * @help
 * ============================================================================
 * 功能介绍
 * ============================================================================
 * 本插件专为适配当前的 TagSystem.js 设计。
 * 它可以将分散在插件参数中的 角色/敌人/武器/护甲 标签配置，
 * 统一导出为一个 JSON 文件，并支持外部修改和热更新。
 *
 * ============================================================================
 * 使用流程
 * ============================================================================
 * 1. 【首次迁移】：
 * - 运行游戏（进入标题画面即可）。
 * - 按 F8 打开控制台，输入：TagSystem.exportData() 并回车。
 * - 提示“数据已成功导出”后，查看工程目录下的 data/TagSystem.json。
 *
 * 2. 【外部编辑】：
 * - 使用文本编辑器修改 JSON 文件。
 * - 结构为：
 * {
 * "actors": { "1": [...], "2": [...] },
 * "enemies": { ... },
 * ...
 * }
 *
 * 3. 【实时同步】：
 * - 修改保存 JSON 后，游戏内数据会立即更新。
 * - 如果正打开着状态界面，需要关闭再打开一次才能看到变化。
 *
 * ============================================================================
 */

(function() {
    var parameters = PluginManager.parameters('Gemini_TagSystem_JsonSync');
    var filePath = String(parameters['JSON File Path'] || 'data/TagSystem.json');
    var autoReload = (parameters['Auto Reload'] || 'true') === 'true';

    var fs = require('fs');
    var path = require('path');
    
    var base = path.dirname(process.mainModule.filename);
    var fullPath = path.join(base, filePath);

    // ------------------------------------------------------------------------
    // 导出功能
    // ------------------------------------------------------------------------
    TagSystem.exportData = function() {
        // 1. 强制初始化数据 (确保从参数中读取到了最新的配置)
        // TagSystem.js 提供了 loadTagData 方法，我们利用它
        if (typeof TagSystem.loadTagData === 'function') {
            TagSystem.loadTagData();
        } else {
            console.error("TagSystem: 无法调用 loadTagData，请确保 TagSystem 插件已加载。");
            return;
        }

        // 2. 获取核心数据对象 $dataTags
        // 只有当它包含有效数据时才导出
        if ($dataTags && (Object.keys($dataTags.actors || {}).length > 0 || 
                          Object.keys($dataTags.weapons || {}).length > 0 ||
                          Object.keys($dataTags.armors || {}).length > 0 ||
                          Object.keys($dataTags.enemies || {}).length > 0)) {
            
            var jsonStr = JSON.stringify($dataTags, null, 4);
            
            var dir = path.dirname(fullPath);
            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir, { recursive: true });
            }

            fs.writeFileSync(fullPath, jsonStr);
            console.log("TagSystem: 数据已成功导出至 " + fullPath);
            if (typeof SoundManager !== 'undefined') SoundManager.playOk();
        } else {
            // 如果全是空的，可能是参数没配，或者读取失败
            // 但即使是空的结构，我们也尝试导出，方便用户填空
            if ($dataTags) {
                var jsonStr = JSON.stringify($dataTags, null, 4);
                var dir = path.dirname(fullPath);
                if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
                fs.writeFileSync(fullPath, jsonStr);
                console.log("TagSystem: (空数据) 结构已导出至 " + fullPath);
            } else {
                console.error("TagSystem: 未找到 $dataTags 对象。");
            }
        }
    };

    // ------------------------------------------------------------------------
    // 加载功能
    // ------------------------------------------------------------------------
    TagSystem.loadJsonData = function() {
        if (!fs.existsSync(fullPath)) {
            // 文件不存在时，静默失败，使用默认参数
            // console.warn("TagSystem: 外部 JSON 不存在，使用插件参数。");
            return;
        }

        try {
            var fileContent = fs.readFileSync(fullPath, 'utf8');
            var parsedData = JSON.parse(fileContent);

            if (parsedData && typeof parsedData === 'object') {
                // 直接覆盖全局变量 $dataTags
                $dataTags = parsedData;
                
                // 确保结构完整 (防止 JSON 缺项导致报错)
                $dataTags.actors = $dataTags.actors || {};
                $dataTags.enemies = $dataTags.enemies || {};
                $dataTags.weapons = $dataTags.weapons || {};
                $dataTags.armors = $dataTags.armors || {};

                console.log("TagSystem: 已从 JSON 加载数据。");
                refreshCurrentScene();
            }
        } catch (e) {
            console.error("TagSystem: JSON 加载失败！", e);
        }
    };

    // ------------------------------------------------------------------------
    // 界面刷新
    // ------------------------------------------------------------------------
    function refreshCurrentScene() {
        if (!SceneManager._scene) return;
        
        // 刷新当前角色的标签缓存 (如果有)
        if ($gameParty) {
            $gameParty.members().forEach(function(actor) {
                if (actor.refresh) actor.refresh();
            });
        }

        // 刷新状态界面
        if (SceneManager._scene instanceof Scene_Status) {
            // 重新创建或刷新窗口
            var scene = SceneManager._scene;
            if (scene._customExtWindow) {
                scene._customExtWindow.refresh();
            }
            if (scene._statusWindow) {
                scene._statusWindow.refresh();
            }
        }
    }

    // ------------------------------------------------------------------------
    // 监听与初始化
    // ------------------------------------------------------------------------
    if (autoReload) {
        if (fs.existsSync(fullPath) || fs.existsSync(path.dirname(fullPath))) {
             // 简单的去抖动处理，防止短时间多次触发
             var fsWait = false;
             if (fs.existsSync(fullPath)) {
                 fs.watch(fullPath, function(event, filename) {
                     if (filename && event === 'change') {
                         if (fsWait) return;
                         fsWait = true;
                         setTimeout(function() { fsWait = false; }, 100);
                         
                         console.log("TagSystem: 检测到文件变更，重载数据...");
                         TagSystem.loadJsonData();
                     }
                 });
             }
        }
    }

    // 在数据加载完成后，尝试读取 JSON 覆盖
    var _DataManager_createGameObjects = DataManager.createGameObjects;
    DataManager.createGameObjects = function() {
        _DataManager_createGameObjects.call(this);
        // 原版 TagSystem.loadTagData() 会在这里被调用一次读取参数
        // 我们紧接着调用 loadJsonData() 来覆盖它
        TagSystem.loadJsonData();
    };
    
    // 插件命令
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'TagSystem' && args[0] === 'Export') {
            TagSystem.exportData();
        }
    };

})();