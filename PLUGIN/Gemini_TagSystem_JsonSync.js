/*:
 * @plugindesc (v2.3) TagSystem 数据双向智能同步工具 - 自动监听保存
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
 * * @param Sync To Editor
 * @text 同步到编辑器
 * @type boolean
 * @on 开启
 * @off 关闭
 * @desc 启动游戏时，如果JSON文件较新，自动将其写入 js/plugins.js (需重启编辑器生效)。
 * @default true
 * * @param Sync From Editor
 * @text 从编辑器同步
 * @type boolean
 * @on 开启
 * @off 关闭
 * @desc 启动游戏或保存工程后，自动将编辑器参数导出覆盖 JSON 文件。
 * @default true
 *
 * @help
 * ============================================================================
 * 更新日志 (v2.3)
 * ============================================================================
 * 新增：对 `js/plugins.js` 的文件监听。
 * 效果：每当你在 RPG Maker MV 插件管理器中修改了参数并保存工程，
 * 本插件会自动检测到变化，并将最新的参数导出为 `data/TagSystem.json`。
 * 这实现了完全的自动双向同步。
 * * ============================================================================
 */

(function() {
    var parameters = PluginManager.parameters('Gemini_TagSystem_JsonSync');
    var filePath = String(parameters['JSON File Path'] || 'data/TagSystem.json');
    var autoReload = (parameters['Auto Reload'] || 'true') === 'true';
    var syncToEditor = (parameters['Sync To Editor'] || 'true') === 'true';
    var syncFromEditor = (parameters['Sync From Editor'] || 'true') === 'true';

    // 仅在 Node.js 环境 (本地测试/NW.js) 下运行
    if (!Utils.isNwjs()) return; 
    var fs = require('fs');
    var path = require('path');
    
    var base = path.dirname(process.mainModule.filename);
    var fullPath = path.join(base, filePath);
    var pluginsJsPath = path.join(base, 'js/plugins.js');

    // ------------------------------------------------------------------------
    // 转换工具 (解决可视模式报错)
    // ------------------------------------------------------------------------
    function toEditorString(val) {
        if (val === undefined || val === null) return "";
        return String(val);
    }

    function toEditorArrayString(arr) {
        if (!Array.isArray(arr)) return "[]";
        var strArr = arr.map(function(item) { return String(item); });
        return JSON.stringify(strArr);
    }

    function transformToSettingsFormat(dataObj, idKey) {
        var result = [];
        var sortedIds = Object.keys(dataObj).map(Number).sort(function(a,b){return a-b});
        
        sortedIds.forEach(function(id) {
            var tags = dataObj[id];
            if (!tags) return;

            var entry = {};
            entry[idKey] = toEditorString(id);
            
            var tagListForEditor = tags.map(function(t) {
                var tagStruct = {
                    "Name": toEditorString(t.name),
                    "Note": toEditorString(t.note),
                    "Effect": toEditorString(t.effect),
                    "Reverse Effect": toEditorString(t.reverseEffect),
                    "Tier": toEditorString(t.tier || 1),
                    "State IDs": toEditorArrayString(t.stateIds),
                    "Reverse State IDs": toEditorArrayString(t.reverseStateIds)
                };
                return JSON.stringify(tagStruct);
            });

            entry["Tags"] = JSON.stringify(tagListForEditor);
            result.push(JSON.stringify(entry));
        });
        return result;
    }

    // ------------------------------------------------------------------------
    // 导出 (Plugin Params -> JSON)
    // ------------------------------------------------------------------------
    TagSystem.exportData = function() {
        // 主动重载内存中的 TagSystem 数据（从当前的 $plugins 参数）
        if (typeof TagSystem.loadTagData === 'function') {
            // 这里有个小技巧：如果 plugins.js 刚变，内存中的 PluginManager.parameters 可能还是旧的
            // 所以我们需要重新读取文件来获取最新参数? 
            // 不，游戏运行时不会重载 plugins.js。
            // 但如果是文件监听触发的，说明外部文件变了，我们需要读取文件。
            
            // 如果是游戏启动时调用，PluginManager 已经加载了最新参数，直接 export 即可。
            // 如果是监听触发，见下方处理。
            TagSystem.loadTagData(); 
        }

        if ($dataTags) {
            var jsonStr = JSON.stringify($dataTags, null, 4);
            var dir = path.dirname(fullPath);
            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(fullPath, jsonStr);
            console.log("TagSystem Sync: 已将编辑器参数同步导出至 " + filePath);
        }
    };

    // ------------------------------------------------------------------------
    // 注入 (JSON -> plugins.js)
    // ------------------------------------------------------------------------
    TagSystem.updatePluginsJs = function(jsonData) {
        if (!fs.existsSync(pluginsJsPath)) return;

        try {
            var content = fs.readFileSync(pluginsJsPath, 'utf8');
            var jsonStart = content.indexOf('[');
            var jsonEnd = content.lastIndexOf(']');
            if (jsonStart === -1 || jsonEnd === -1) return;

            var pluginsArr = JSON.parse(content.substring(jsonStart, jsonEnd + 1));
            
            var targetPlugin = null;
            for (var i = 0; i < pluginsArr.length; i++) {
                if (pluginsArr[i].name === 'TagSystem' && pluginsArr[i].status === true) {
                    targetPlugin = pluginsArr[i];
                    break;
                }
            }

            if (targetPlugin) {
                if (jsonData.actors) targetPlugin.parameters['Actor Tag Settings'] = JSON.stringify(transformToSettingsFormat(jsonData.actors, 'Actor ID'));
                if (jsonData.enemies) targetPlugin.parameters['Enemy Tag Settings'] = JSON.stringify(transformToSettingsFormat(jsonData.enemies, 'Enemy ID'));
                if (jsonData.weapons) targetPlugin.parameters['Weapon Tag Settings'] = JSON.stringify(transformToSettingsFormat(jsonData.weapons, 'Weapon ID'));
                if (jsonData.armors) targetPlugin.parameters['Armor Tag Settings'] = JSON.stringify(transformToSettingsFormat(jsonData.armors, 'Armor ID'));
                if (jsonData.swordMarks) targetPlugin.parameters['Sword Mark Tag Settings'] = JSON.stringify(transformToSettingsFormat(jsonData.swordMarks, 'Sword Mark ID'));

                var newContent = "var $plugins =\n" + JSON.stringify(pluginsArr, null, 4) + ";";
                fs.writeFileSync(pluginsJsPath, newContent);
                console.log("TagSystem Sync: JSON 数据较新，已注入 js/plugins.js");
            }
        } catch (e) {
            console.error("TagSystem Sync Error", e);
        }
    };

    // ------------------------------------------------------------------------
    // 智能同步逻辑 (启动时)
    // ------------------------------------------------------------------------
    TagSystem.performSmartSync = function() {
        var hasJson = fs.existsSync(fullPath);
        var hasPluginJs = fs.existsSync(pluginsJsPath);

        if (!hasPluginJs) return; 

        if (!hasJson) {
            TagSystem.exportData();
            return;
        }

        var jsonStat = fs.statSync(fullPath);
        var pluginStat = fs.statSync(pluginsJsPath);
        var timeDiff = pluginStat.mtime.getTime() - jsonStat.mtime.getTime();

        if (timeDiff > 2000 && syncFromEditor) {
            console.log("TagSystem Sync: 发现编辑器保存更新，执行导出...");
            TagSystem.exportData();
        } else if (timeDiff < -2000 && syncToEditor) {
            console.log("TagSystem Sync: 发现 JSON 更新，执行注入...");
            try {
                var fileContent = fs.readFileSync(fullPath, 'utf8');
                var parsedData = JSON.parse(fileContent);
                TagSystem.updatePluginsJs(parsedData);
                $dataTags = parsedData;
            } catch(e) { console.error(e); }
        } else {
            TagSystem.loadJsonData();
        }
    };

    TagSystem.loadJsonData = function() {
        if (!fs.existsSync(fullPath)) return;
        try {
            var fileContent = fs.readFileSync(fullPath, 'utf8');
            var parsedData = JSON.parse(fileContent);
            if (parsedData && typeof parsedData === 'object') {
                $dataTags = parsedData;
                $dataTags.actors = $dataTags.actors || {};
                $dataTags.enemies = $dataTags.enemies || {};
                $dataTags.weapons = $dataTags.weapons || {};
                $dataTags.armors = $dataTags.armors || {};
                $dataTags.swordMarks = $dataTags.swordMarks || {};
                console.log("TagSystem: 已从 JSON 加载数据。");
            }
        } catch (e) {
            console.error("TagSystem: JSON 加载失败！", e);
        }
    };

    // ------------------------------------------------------------------------
    // 初始化与文件监听
    // ------------------------------------------------------------------------
    var _DataManager_createGameObjects = DataManager.createGameObjects;
    DataManager.createGameObjects = function() {
        _DataManager_createGameObjects.call(this);
        TagSystem.performSmartSync();
    };

    // 监听 TagSystem.json 变化 -> 同步给 plugins.js
    if (autoReload && fs.existsSync(fullPath)) {
         let fsWait = false;
         fs.watch(fullPath, (event, filename) => {
             if (filename && event === 'change') {
                 if (fsWait) return;
                 fsWait = true;
                 setTimeout(() => { fsWait = false; }, 100);
                 console.log("TagSystem: 检测到 JSON 变更，重载数据...");
                 TagSystem.loadJsonData();
                 if (syncToEditor) {
                     try {
                         var d = fs.readFileSync(fullPath, 'utf8');
                         TagSystem.updatePluginsJs(JSON.parse(d));
                     } catch(e) {}
                 }
             }
         });
    }

    // 监听 plugins.js 变化 -> 同步给 TagSystem.json
    // 这样当你在编辑器保存项目时，JSON 会自动更新
    if (syncFromEditor && fs.existsSync(pluginsJsPath)) {
        let jsWait = false;
        fs.watch(pluginsJsPath, (event, filename) => {
            if (event === 'change') {
                if (jsWait) return;
                jsWait = true;
                setTimeout(() => { jsWait = false; }, 2000); // 防抖时间长一点，因为写入可能慢

                console.log("TagSystem: 检测到 plugins.js 变更 (编辑器保存)，尝试导出 JSON...");
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
                        // 恢复？其实不需要恢复，因为这只是运行时的临时状态
                    }
                } catch(e) {
                    console.error("TagSystem: 自动导出失败", e);
                }
            }
        });
    }

})();