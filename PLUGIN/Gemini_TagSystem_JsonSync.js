/*:
 * @plugindesc (v2.4) TagSystem 数据双向智能同步工具 - 带调试开关
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
 * @param Sync To Editor
 * @text 同步到编辑器
 * @type boolean
 * @on 开启
 * @off 关闭
 * @desc 启动游戏时，如果JSON文件较新，自动将其写入 js/plugins.js (需重启编辑器生效)。
 * @default true
 *
 * @param Sync From Editor
 * @text 从编辑器同步
 * @type boolean
 * @on 开启
 * @off 关闭
 * @desc 启动游戏或保存工程后，自动将编辑器参数导出覆盖 JSON 文件。
 * @default true
 *
 * @param Debug Mode
 * @text 显示调试日志
 * @type boolean
 * @on 显示
 * @off 隐藏
 * @desc 是否在F8控制台打印同步状态和详细信息。建议在发布时关闭。
 * @default true
 *
 * @help
 * ============================================================================
 * 更新日志 (v2.4)
 * ============================================================================
 * 新增：[显示调试日志] 参数。
 * 功能：现在可以关闭控制台的大量同步提示信息，保持控制台整洁。
 *
 * ============================================================================
 * 基本功能
 * ============================================================================
 * 1. JSON -> 游戏 (热更新):
 * 修改 data/TagSystem.json 后，游戏内无需刷新即可实时生效（用于微调数值）。
 *
 * 2. 编辑器 -> JSON (自动导出):
 * 在 RPG Maker 编辑器中修改参数并保存/测试游戏时，会自动更新 JSON 文件。
 *
 * 3. JSON -> 编辑器 (反向同步):
 * 如果 JSON 文件比编辑器里的参数新，插件会自动更新 js/plugins.js。
 * 注意：这需要你【重启 RPG Maker 编辑器】才能看到参数变化。
 */

var Imported = Imported || {};
Imported.TagSystem_JsonSync = true;

var TagSystem = TagSystem || {};
TagSystem.JsonSync = TagSystem.JsonSync || {};

(function() {
    var fs = require('fs');
    var path = require('path');

    var parameters = PluginManager.parameters('Gemini_TagSystem_JsonSync');
    
    TagSystem.JsonSync.Params = {
        jsonPath: String(parameters['JSON File Path'] || 'data/TagSystem.json'),
        autoReload: String(parameters['Auto Reload'] || 'true') === 'true',
        syncToEditor: String(parameters['Sync To Editor'] || 'true') === 'true',
        syncFromEditor: String(parameters['Sync From Editor'] || 'true') === 'true',
        debugMode: String(parameters['Debug Mode'] || 'true') === 'true' // 新增调试开关
    };

    // 辅助日志函数
    TagSystem.JsonSync.log = function(message) {
        if (this.Params.debugMode) {
            console.log(message);
        }
    };

    // 辅助警告函数 (警告通常建议保留，但为了完全静默也可受控)
    TagSystem.JsonSync.warn = function(message) {
        if (this.Params.debugMode) {
            console.warn(message);
        }
    };

    var relativePath = TagSystem.JsonSync.Params.jsonPath;
    var filePath = path.join(process.mainModule.filename, '..', relativePath);
    var pluginsJsPath = path.join(process.mainModule.filename, '..', 'js/plugins.js');
    var dirPath = path.dirname(filePath);

    // 确保目录存在
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    // ------------------------------------------------------------------------
    // 核心功能 1: 导出数据 (编辑器 -> JSON)
    // ------------------------------------------------------------------------
    TagSystem.exportData = function() {
        if (!TagSystem.Parameters) return;

        var dataToExport = [
            TagSystem.Parameters['Actor Tag Settings'],
            TagSystem.Parameters['Enemy Tag Settings'],
            TagSystem.Parameters['Weapon Tag Settings'],
            TagSystem.Parameters['Armor Tag Settings'],
            TagSystem.Parameters['Sword Mark Tag Settings']
        ];

        var jsonStr = JSON.stringify(dataToExport, null, 4);

        // 读取现有文件对比，避免无意义写入
        if (fs.existsSync(filePath)) {
            var currentContent = fs.readFileSync(filePath, 'utf8');
            if (currentContent === jsonStr) return; 
        }

        fs.writeFileSync(filePath, jsonStr);
        TagSystem.JsonSync.log("TagSystem Sync: 已将编辑器参数同步导出至 " + relativePath);
    };

    // ------------------------------------------------------------------------
    // 核心功能 2: 注入数据 (JSON -> 编辑器/plugins.js)
    // ------------------------------------------------------------------------
    TagSystem.injectToPluginsJs = function(jsonContent) {
        if (!fs.existsSync(pluginsJsPath)) return;

        var pluginsRaw = fs.readFileSync(pluginsJsPath, 'utf8');
        // 解析 plugins.js (它是一个 var $plugins = [...] 结构)
        // 我们提取 [] 部分
        var start = pluginsRaw.indexOf('[');
        var end = pluginsRaw.lastIndexOf(']');
        if (start === -1 || end === -1) return;

        var jsonPart = pluginsRaw.substring(start, end + 1);
        var pluginsList = JSON.parse(jsonPart);

        // 找到 TagSystem 插件
        var tagPlugin = pluginsList.find(function(p) { return p.name === 'TagSystem'; });
        if (!tagPlugin) return;

        // 解析 JSON 数据
        var importedData;
        try {
            importedData = JSON.parse(jsonContent);
        } catch (e) {
            console.error("TagSystem Sync Error: JSON 文件损坏，无法同步到编辑器。");
            return;
        }

        // 覆盖参数
        tagPlugin.parameters['Actor Tag Settings'] = importedData[0];
        tagPlugin.parameters['Enemy Tag Settings'] = importedData[1];
        tagPlugin.parameters['Weapon Tag Settings'] = importedData[2];
        tagPlugin.parameters['Armor Tag Settings'] = importedData[3];
        tagPlugin.parameters['Sword Mark Tag Settings'] = importedData[4];

        // 重组文件内容
        var newJsonPart = JSON.stringify(pluginsList, null, 4); // 格式化写入
        var newFileContent = "var $plugins =\n" + newJsonPart + ";\n";

        fs.writeFileSync(pluginsJsPath, newFileContent);
        TagSystem.JsonSync.log("TagSystem Sync: JSON 数据较新，已注入 js/plugins.js");
        TagSystem.JsonSync.warn("TagSystem: 请重启 RPG Maker 编辑器以应用更改！");
    };

    // ------------------------------------------------------------------------
    // 逻辑流
    // ------------------------------------------------------------------------

    // 1. 启动检查：对比时间戳，决定是 导出 还是 导入
    if (fs.existsSync(filePath)) {
        var jsonStat = fs.statSync(filePath);
        var pluginsStat = fs.statSync(pluginsJsPath);

        // 如果 JSON 比 plugins.js 新，且开启了反向同步
        if (TagSystem.JsonSync.Params.syncToEditor && jsonStat.mtime > pluginsStat.mtime) {
            var jsonContent = fs.readFileSync(filePath, 'utf8');
            TagSystem.injectToPluginsJs(jsonContent);
            // 此时内存里的 TagSystem.Parameters 还是旧的，需要重新加载一遍吗？
            // 通常 DataManager 还没运行，我们此时注入只能影响编辑器下次打开。
            // 但为了游戏当前运行也能生效，我们手动重载 TagSystem 数据
            // (TagSystem 插件会在 createGameObjects 时读取，所以这里只要覆盖 Parameters 即可)
            // 但为了安全，我们依赖下面的 reloadData
        } else if (TagSystem.JsonSync.Params.syncFromEditor) {
            // 否则，如果开启了正向同步，且 JSON 比较旧（或不存在），尝试导出
            // 这里我们延迟一点，确保 TagSystem 已加载
            setTimeout(function() {
                TagSystem.exportData();
            }, 100);
        }
    } else if (TagSystem.JsonSync.Params.syncFromEditor) {
        // 文件不存在，直接导出
        setTimeout(function() {
            TagSystem.exportData();
        }, 100);
    }

    // ------------------------------------------------------------------------
    // 监听器
    // ------------------------------------------------------------------------

    // 监听 JSON 变化 -> 热更新游戏数据
    if (TagSystem.JsonSync.Params.autoReload) {
        var wait = false;
        fs.watch(filePath, function(event, filename) {
             if (filename && event === 'change') {
                 if (wait) return;
                 wait = true;
                 setTimeout(function() { wait = false; }, 100);
                 
                 TagSystem.JsonSync.log("TagSystem: 检测到 JSON 变更，重载数据...");
                 try {
                     var content = fs.readFileSync(filePath, "utf8");
                     var data = JSON.parse(content);
                     
                     // 实时覆盖 TagSystem 的参数对象
                     TagSystem.Parameters['Actor Tag Settings'] = data[0];
                     TagSystem.Parameters['Enemy Tag Settings'] = data[1];
                     TagSystem.Parameters['Weapon Tag Settings'] = data[2];
                     TagSystem.Parameters['Armor Tag Settings'] = data[3];
                     TagSystem.Parameters['Sword Mark Tag Settings'] = data[4];

                     // 重新解析数据结构
                     if (TagSystem.loadTagData) {
                         TagSystem.loadTagData();
                         
                         // 刷新当前角色的标签缓存 (如果有)
                         if ($gameParty) {
                             $gameParty.members().forEach(function(actor) {
                                 actor.refresh();
                             });
                         }
                         TagSystem.JsonSync.log("TagSystem: 已从 JSON 加载数据。");
                     }
                 } catch (e) {
                     console.error("TagSystem: JSON 重载失败", e);
                 }
             }
         });
    }

    // 监听 plugins.js 变化 -> 同步给 TagSystem.json
    // 这样当你在编辑器保存项目时，JSON 会自动更新
    if (TagSystem.JsonSync.Params.syncFromEditor && fs.existsSync(pluginsJsPath)) {
        let jsWait = false;
        fs.watch(pluginsJsPath, (event, filename) => {
            if (event === 'change') {
                if (jsWait) return;
                jsWait = true;
                setTimeout(() => { jsWait = false; }, 2000); // 防抖时间长一点，因为写入可能慢

                TagSystem.JsonSync.log("TagSystem: 检测到 plugins.js 变更 (编辑器保存)，尝试导出 JSON...");
                // 此时我们需要手动读取 plugins.js 解析出 TagSystem 参数，因为内存里的 parameters 还没变
                try {
                    var content = fs.readFileSync(pluginsJsPath, 'utf8');
                    var jsonStart = content.indexOf('[');
                    var jsonEnd = content.lastIndexOf(']');
                    var pluginsArr = JSON.parse(content.substring(jsonStart, jsonEnd + 1));
                    
                    var targetPlugin = pluginsArr.find(p => p.name === 'TagSystem' && p.status === true);
                    if (targetPlugin) {
                        // 临时覆盖参数进行解析
                        TagSystem.Parameters = targetPlugin.parameters;
                        TagSystem.exportData(); // 调用导出逻辑
                    }
                } catch (e) {
                    // 写入过程中可能产生临时读写冲突，忽略
                }
            }
        });
    }

    TagSystem.JsonSync.log("TagSystem Sync: 插件已加载，调试模式已开启。");

})();