/*:
 * @plugindesc v2.0 全局备注管理器(高级版) - 支持为每一条单独的全局备注设置特定的排除ID。
 * @author Gemini AI
 *
 * @help
 * ============================================================================
 * 介绍
 * ============================================================================
 * 本插件用于批量管理 RPG Maker MV 数据库的备注（Note）栏。
 * * 与普通版不同，v2.0 允许你精细控制每一条备注的生效对象。
 * 你可以创建多条规则，每条规则都有自己的内容和“黑名单”。
 *
 * ============================================================================
 * 使用方法
 * ============================================================================
 * 1. 打开插件参数，选择你要设置的类目（例如：角色设置）。
 * 2. 这里的参数现在是一个“列表”。双击空白行添加一条新规则。
 * 3. 在弹出的窗口中：
 * - 【备注内容】：填写你要注入的标签，例如 <Passive State: 10>
 * - 【排除ID列表】：填写不希望拥有此标签的ID，例如 1,5
 * 4. 你可以继续添加第二条、第三条规则，它们互不干扰。
 *
 * ============================================================================
 * 应用场景举例
 * ============================================================================
 * 场景：
 * 你想给所有角色加 500 HP，除了主角（ID:1）。
 * 你还想给所有角色加 10% 暴击率，包括主角，但除了牧师（ID:4）。
 *
 * 设置：
 * 1. 在“角色设置”中添加第1条：
 * - 内容：<MaxHP: +500>
 * - 排除ID：1
 * 2. 在“角色设置”中添加第2条：
 * - 内容：<Cri: +10%>
 * - 排除ID：4
 *
 * ============================================================================
 *
 * @param ---角色设置---
 * @default
 *
 * @param ActorSettings
 * @text 角色备注列表
 * @parent ---角色设置---
 * @type struct<NoteRule>[]
 * @desc 添加多条备注规则，每条规则可独立设置排除ID。
 * @default []
 *
 * @param ---职业设置---
 * @default
 *
 * @param ClassSettings
 * @text 职业备注列表
 * @parent ---职业设置---
 * @type struct<NoteRule>[]
 * @desc 添加多条备注规则，每条规则可独立设置排除ID。
 * @default []
 *
 * @param ---技能设置---
 * @default
 *
 * @param SkillSettings
 * @text 技能备注列表
 * @parent ---技能设置---
 * @type struct<NoteRule>[]
 * @desc 添加多条备注规则，每条规则可独立设置排除ID。
 * @default []
 *
 * @param ---物品设置---
 * @default
 *
 * @param ItemSettings
 * @text 物品备注列表
 * @parent ---物品设置---
 * @type struct<NoteRule>[]
 * @desc 添加多条备注规则，每条规则可独立设置排除ID。
 * @default []
 *
 * @param ---武器设置---
 * @default
 *
 * @param WeaponSettings
 * @text 武器备注列表
 * @parent ---武器设置---
 * @type struct<NoteRule>[]
 * @desc 添加多条备注规则，每条规则可独立设置排除ID。
 * @default []
 *
 * @param ---护甲设置---
 * @default
 *
 * @param ArmorSettings
 * @text 护甲备注列表
 * @parent ---护甲设置---
 * @type struct<NoteRule>[]
 * @desc 添加多条备注规则，每条规则可独立设置排除ID。
 * @default []
 *
 * @param ---敌人设置---
 * @default
 *
 * @param EnemySettings
 * @text 敌人备注列表
 * @parent ---敌人设置---
 * @type struct<NoteRule>[]
 * @desc 添加多条备注规则，每条规则可独立设置排除ID。
 * @default []
 *
 * @param ---状态设置---
 * @default
 *
 * @param StateSettings
 * @text 状态备注列表
 * @parent ---状态设置---
 * @type struct<NoteRule>[]
 * @desc 添加多条备注规则，每条规则可独立设置排除ID。
 * @default []
 *
 */

/*~struct~NoteRule:
 *
 * @param Content
 * @text 备注内容
 * @type note
 * @desc 输入要添加到备注栏的文本（支持多行）。
 * @default ""
 *
 * @param ExcludeIds
 * @text 排除ID列表
 * @type number[]
 * @desc 填写不应用此条备注的数据ID。
 * @default []
 *
 */

var Imported = Imported || {};
Imported.GlobalNoteManager = true;

var GlobalNoteManager = GlobalNoteManager || {};

(function() {
    'use strict';

    var parameters = PluginManager.parameters('GlobalNoteManager');

    // ======================================================================
    // 数据解析：处理 Struct 数组
    // ======================================================================
    GlobalNoteManager.parseRuleList = function(paramName) {
        try {
            var rawJSON = parameters[paramName];
            if (!rawJSON || rawJSON === "[]" || rawJSON === "") return [];

            var rawList = JSON.parse(rawJSON);
            
            // 遍历列表中的每一个 Struct 配置
            var parsedRules = rawList.map(function(itemJSON) {
                var itemData = JSON.parse(itemJSON);
                var excludeList = [];
                
                // 解析排除列表
                if (itemData.ExcludeIds) {
                    excludeList = JSON.parse(itemData.ExcludeIds).map(Number);
                }

                return {
                    content: itemData.Content || "",
                    excludeIds: excludeList
                };
            });

            return parsedRules;

        } catch (e) {
            console.error("GlobalNoteManager: JSON Parse Error in " + paramName, e);
            return [];
        }
    };

    // 加载配置
    GlobalNoteManager.rules = {
        actor:  GlobalNoteManager.parseRuleList('ActorSettings'),
        class:  GlobalNoteManager.parseRuleList('ClassSettings'),
        skill:  GlobalNoteManager.parseRuleList('SkillSettings'),
        item:   GlobalNoteManager.parseRuleList('ItemSettings'),
        weapon: GlobalNoteManager.parseRuleList('WeaponSettings'),
        armor:  GlobalNoteManager.parseRuleList('ArmorSettings'),
        enemy:  GlobalNoteManager.parseRuleList('EnemySettings'),
        state:  GlobalNoteManager.parseRuleList('StateSettings')
    };

    // ======================================================================
    // 核心处理逻辑
    // ======================================================================
    
    GlobalNoteManager.processDatabase = function(dataArray, typeKey) {
        if (!dataArray) return;
        var rules = GlobalNoteManager.rules[typeKey];
        if (!rules || rules.length === 0) return;

        // 遍历数据库中的每一个对象 (跳过索引0)
        for (var i = 1; i < dataArray.length; i++) {
            var obj = dataArray[i];
            if (!obj) continue;

            var noteToAppend = "";

            // 遍历每一条配置的规则
            for (var r = 0; r < rules.length; r++) {
                var rule = rules[r];
                
                // 核心判断：如果当前对象ID不在该规则的排除列表中
                if (!rule.excludeIds.contains(obj.id)) {
                    // 如果内容不为空，则追加
                    if (rule.content) {
                        noteToAppend += "\n" + rule.content;
                    }
                }
            }

            // 如果有需要追加的内容
            if (noteToAppend.length > 0) {
                obj.note = (obj.note || "") + noteToAppend;
                // 重新刷新 Meta 数据，确保其他插件能读取
                DataManager.extractMetadata(obj);
            }
        }
    };

    // ======================================================================
    // 注入钩子
    // ======================================================================
    
    var _DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
    DataManager.isDatabaseLoaded = function() {
        if (!_DataManager_isDatabaseLoaded.call(this)) return false;

        if (!GlobalNoteManager._isProcessed) {
            GlobalNoteManager.processDatabase($dataActors, 'actor');
            GlobalNoteManager.processDatabase($dataClasses, 'class');
            GlobalNoteManager.processDatabase($dataSkills, 'skill');
            GlobalNoteManager.processDatabase($dataItems, 'item');
            GlobalNoteManager.processDatabase($dataWeapons, 'weapon');
            GlobalNoteManager.processDatabase($dataArmors, 'armor');
            GlobalNoteManager.processDatabase($dataEnemies, 'enemy');
            GlobalNoteManager.processDatabase($dataStates, 'state');
            
            GlobalNoteManager._isProcessed = true;
        }
        
        return true;
    };

})();