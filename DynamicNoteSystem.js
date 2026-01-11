/*:
 * @plugindesc v1.0 动态备注系统 - 游戏中通过事件修改数据库备注，支持存档保存。
 * @author Gemini AI
 *
 * @help
 * ============================================================================
 * 插件介绍
 * ============================================================================
 * 本插件允许你在游戏通过【插件命令】动态修改8大类目的备注（Note）。
 * 修改后的备注会保存到存档中，读档时会自动恢复。
 * 修改后会自动刷新 Meta 数据，兼容 Yanfly 等依赖标签的插件。
 *
 * ============================================================================
 * 插件命令 (Plugin Commands)
 * ============================================================================
 * 格式：DNS [类目] [ID] [操作] [内容]
 *
 * 1. 类目 (Type):
 * actor   (角色)
 * class   (职业)
 * skill   (技能)
 * item    (物品)
 * weapon  (武器)
 * armor   (护甲)
 * enemy   (敌人)
 * state   (状态)
 *
 * 2. ID:
 * 数据库中对应的数字 ID。
 *
 * 3. 操作 (Action):
 * add     (追加：在原有备注后添加新内容)
 * set     (覆盖：完全清空原有备注，设置为新内容)
 * clear   (清空：删除该对象的所有备注)
 * remove  (移除：从备注中删除指定的字符串)
 *
 * 4. 内容 (Content):
 * 具体的备注文本。如果是 remove 操作，则填写要删除的文本。
 *
 * ============================================================================
 * 使用范例
 * ============================================================================
 *
 * 例1：给 1号角色 添加一个火属性被动标签
 * DNS actor 1 add <Passive State: 10>
 *
 * 例2：将 5号武器 的备注完全修改为 "无法出售"
 * DNS weapon 5 set <Cannot Sell>
 *
 * 例3：从 2号敌人 的备注中移除 "<Boss>" 标签
 * DNS enemy 2 remove <Boss>
 *
 * 例4：清空 10号物品 的所有备注
 * DNS item 10 clear
 *
 * ============================================================================
 * 脚本调用 (高级)
 * ============================================================================
 * $gameSystem.dnsModifyNote(type, id, action, content);
 *
 * 参数说明：
 * type: 字符串, 如 'actor', 'item'
 * id: 数字
 * action: 'add', 'set', 'remove', 'clear'
 * content: 字符串
 */

var Imported = Imported || {};
Imported.DynamicNoteSystem = true;

var DynamicNoteSystem = DynamicNoteSystem || {};

(function() {
    'use strict';

    // 映射字符串到数据库对象
    DynamicNoteSystem.getDataBase = function(type) {
        switch (type.toLowerCase()) {
            case 'actor':  return $dataActors;
            case 'class':  return $dataClasses;
            case 'skill':  return $dataSkills;
            case 'item':   return $dataItems;
            case 'weapon': return $dataWeapons;
            case 'armor':  return $dataArmors;
            case 'enemy':  return $dataEnemies;
            case 'state':  return $dataStates;
            default: return null;
        }
    };

    // 初始化原始数据的备份（防止重复叠加）
    DynamicNoteSystem.initOriginalNotes = function(db, id) {
        if (!db[id]) return;
        if (db[id]._originalNote === undefined) {
            db[id]._originalNote = db[id].note || "";
        }
    };

    // ======================================================================
    // Game_System 扩展：负责数据存储和逻辑处理
    // ======================================================================

    var _Game_System_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function() {
        _Game_System_initialize.call(this);
        // 数据结构: { "actor": { 1: "备注内容", 2: "备注内容" }, "item": ... }
        this._dynamicNotes = {
            actor: {}, class: {}, skill: {}, item: {},
            weapon: {}, armor: {}, enemy: {}, state: {}
        };
    };

    // 核心修改函数
    Game_System.prototype.dnsModifyNote = function(type, id, action, content) {
        var db = DynamicNoteSystem.getDataBase(type);
        if (!db || !db[id]) return;

        // 1. 确保有原始备份
        DynamicNoteSystem.initOriginalNotes(db, id);

        // 2. 获取当前应该基于哪个文本进行修改
        // 如果我们之前修改过，存在 _dynamicNotes 里，否则用原始的
        var currentNote = "";
        if (this._dynamicNotes[type] && this._dynamicNotes[type][id] !== undefined) {
            currentNote = this._dynamicNotes[type][id];
        } else {
            currentNote = db[id]._originalNote;
        }

        // 3. 执行操作
        var newNote = currentNote;
        content = content || "";

        switch (action.toLowerCase()) {
            case 'add':
                // 避免重复换行
                if (newNote.length > 0 && !newNote.endsWith('\n')) {
                    newNote += '\n';
                }
                newNote += content;
                break;
            case 'set':
                newNote = content;
                break;
            case 'remove':
                // 简单的字符串替换，移除指定内容
                newNote = newNote.split(content).join(""); 
                break;
            case 'clear':
                newNote = "";
                break;
        }

        // 4. 保存到 System (用于存档)
        if (!this._dynamicNotes[type]) this._dynamicNotes[type] = {};
        this._dynamicNotes[type][id] = newNote;

        // 5. 立即应用到游戏数据库 (实时生效)
        this.dnsApplyToDatabase(type, id, newNote);
    };

    // 将修改应用到 $data 对象并刷新 Meta
    Game_System.prototype.dnsApplyToDatabase = function(type, id, noteText) {
        var db = DynamicNoteSystem.getDataBase(type);
        if (!db || !db[id]) return;

        // 修改 note
        db[id].note = noteText;

        // 关键：刷新元数据，让其他插件识别
        DataManager.extractMetadata(db[id]);
    };

    // 重新应用所有存储的备注 (用于读档后)
    Game_System.prototype.dnsReapplyAll = function() {
        if (!this._dynamicNotes) return;

        for (var type in this._dynamicNotes) {
            var typeObj = this._dynamicNotes[type];
            for (var id in typeObj) {
                var noteText = typeObj[id];
                this.dnsApplyToDatabase(type, Number(id), noteText);
            }
        }
    };

    // ======================================================================
    // 存档与读档挂钩
    // ======================================================================

    // 读档成功后，提取 save contents 之后，应用我们的修改
    var _DataManager_extractSaveContents = DataManager.extractSaveContents;
    DataManager.extractSaveContents = function(contents) {
        _DataManager_extractSaveContents.call(this, contents);
        if ($gameSystem && $gameSystem.dnsReapplyAll) {
            $gameSystem.dnsReapplyAll();
        }
    };

    // 每次开始新游戏时，需要清理一下数据库被污染的状态
    // (因为 $data 对象是全局的，返回标题画面不会重置它们)
    var _DataManager_setupNewGame = DataManager.setupNewGame;
    DataManager.setupNewGame = function() {
        _DataManager_setupNewGame.call(this);
        // 这里可以添加逻辑恢复所有 $data 到 _originalNote，
        // 但由于 MV 的机制，如果不重载页面，$data 确实会保持脏数据。
        // 不过由于新游戏的 $gameSystem 是空的，如果不恢复，
        // 只有在玩家遇到被修改过的物体时才会发现。
        // 最佳实践：建议只依赖存档数据覆盖。
        // 稍微强力的做法是遍历恢复：
        DynamicNoteSystem.resetAllDatabases();
    };

    DynamicNoteSystem.resetAllDatabases = function() {
        var types = ['actor', 'class', 'skill', 'item', 'weapon', 'armor', 'enemy', 'state'];
        types.forEach(function(type) {
            var db = DynamicNoteSystem.getDataBase(type);
            if (!db) return;
            for (var i = 1; i < db.length; i++) {
                if (db[i] && db[i]._originalNote !== undefined) {
                    db[i].note = db[i]._originalNote;
                    DataManager.extractMetadata(db[i]);
                    // 清除标记，等待下一次初始化
                    delete db[i]._originalNote; 
                }
            }
        });
    };

    // ======================================================================
    // 插件命令解析
    // ======================================================================
    
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        
        if (command.toUpperCase() === 'DNS') {
            if (args.length < 3) return;

            var type = args[0];
            var id = Number(args[1]);
            var action = args[2];
            
            // 拼接剩余参数作为内容 (允许内容中有空格)
            var content = "";
            if (args.length > 3) {
                content = args.slice(3).join(" ");
            }

            $gameSystem.dnsModifyNote(type, id, action, content);
        }
    };

})();