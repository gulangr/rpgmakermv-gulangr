/*:
 * @plugindesc 章节控制系统 (支持小数) v1.1
 * @author Gemini Assistant
 *
 * @help
 * ============================================================================
 * 介绍
 * ============================================================================
 * 本插件允许你使用带小数的数字（如 1.1, 1.5）来控制游戏章节进度。
 * 这些数值存储在系统存档中，不会像默认变量那样被强制取整。
 *
 * ============================================================================
 * 插件指令 (Plugin Commands)
 * ============================================================================
 *
 * 1. 设置/修改章节数值
 * Chapter Set 1.1      // 将章节设置为 1.1
 * Chapter Set 2.0      // 将章节设置为 2.0
 * Chapter Add 0.1      // 当前章节 + 0.1
 * Chapter Sub 0.5      // 当前章节 - 0.5
 *
 * 2. 读取章节数值到变量 (NEW!)
 * 将当前带小数的章节数，强制存入指定的普通变量中。
 * (注意：存入后该变量会变成小数，在对话框用 \V[n] 可直接显示)
 * * * 格式: Chapter Get [变量ID]
 * * 示例: Chapter Get 5     // 将当前的章节数（如1.5）存入 5号变量
 *
 * 3. 条件判断 (将结果输出到开关)
 * 判断当前章节是否满足条件，如果满足，打开指定开关；否则关闭该开关。
 * * 格式: Chapter Check [比较符] [数值] [开关ID]
 * * 示例:
 * Chapter Check = 1.5 10    // 如果当前章节等于 1.5，打开10号开关
 * Chapter Check > 1.0 11    // 如果当前章节大于 1.0，打开11号开关
 *
 * [比较符] 支持: =, >, <, >=, <=, !=
 *
 * ============================================================================
 * 脚本调用 (Script Calls)
 * ============================================================================
 * $gameSystem.chapter()    // 返回当前的章节数值 (float)
 *
 */

(function() {
    var parameters = PluginManager.parameters('ChapterControl');

    //-----------------------------------------------------------------------------
    // 辅助函数：修正浮点数精度（保留1位小数）
    //-----------------------------------------------------------------------------
    function fixFloat(num) {
        return Math.round(num * 10) / 10;
    }

    //-----------------------------------------------------------------------------
    // Game_System
    // 初始化和读取章节
    //-----------------------------------------------------------------------------
    var _Game_System_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function() {
        _Game_System_initialize.call(this);
        this._chapterVersion = 1.0; 
    };

    Game_System.prototype.chapter = function() {
        return this._chapterVersion || 1.0;
    };

    Game_System.prototype.setChapter = function(value) {
        this._chapterVersion = fixFloat(value);
    };

    Game_System.prototype.addChapter = function(value) {
        this._chapterVersion = fixFloat(this.chapter() + value);
    };

    //-----------------------------------------------------------------------------
    // Game_Interpreter
    // 插件指令解析
    //-----------------------------------------------------------------------------
    var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        
        if (command.toLowerCase() === 'chapter') {
            var action = args[0].toLowerCase();
            
            if (action === 'set') {
                var value = parseFloat(args[1]);
                $gameSystem.setChapter(value);
            } 
            else if (action === 'add') {
                var value = parseFloat(args[1]);
                $gameSystem.addChapter(value);
            } 
            else if (action === 'sub') {
                var value = parseFloat(args[1]);
                $gameSystem.addChapter(-value);
            }
            // --- 新增功能: 读取数值到变量 ---
            else if (action === 'get') {
                var variableId = parseInt(args[1]);
                var value = $gameSystem.chapter();
                
                // 关键点：直接操作 _data 数组，绕过 setValue 的 Math.floor 取整限制
                // 这样变量里就能存储 1.5 这种小数了
                if (variableId > 0 && variableId < $dataSystem.variables.length) {
                    $gameVariables._data[variableId] = value;
                    $gameMap.requestRefresh(); // 刷新地图事件以响应变量变化
                }
            } 
            // -----------------------------
            else if (action === 'check') {
                var operator = args[1];
                var targetVal = parseFloat(args[2]);
                var switchId = parseInt(args[3]);
                var currentVal = $gameSystem.chapter();
                var result = false;

                switch (operator) {
                    case '=':  result = (currentVal === targetVal); break;
                    case '>':  result = (currentVal > targetVal); break;
                    case '<':  result = (currentVal < targetVal); break;
                    case '>=': result = (currentVal >= targetVal); break;
                    case '<=': result = (currentVal <= targetVal); break;
                    case '!=': result = (currentVal !== targetVal); break;
                }

                $gameSwitches.setValue(switchId, result);
            }
        }
    };

})();