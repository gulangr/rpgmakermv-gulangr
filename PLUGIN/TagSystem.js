/*:
 * @plugindesc (v3.6) 标签系统 - 装备标签标记版
 * @author Custom
 *
 * @param --- Actor Settings ---
 * @default
 *
 * @param Actor Tag Settings
 * @text 角色标签配置
 * @parent --- Actor Settings ---
 * @type struct<ActorSetting>[]
 * @desc 在这里注册角色的标签。
 * @default []
 *
 * @param --- Enemy Settings ---
 * @default
 *
 * @param Enemy Tag Settings
 * @text 敌人标签配置
 * @parent --- Enemy Settings ---
 * @type struct<EnemySetting>[]
 * @desc 在这里注册敌人的标签。
 * @default []
 *
 * @param --- Weapon Settings ---
 * @default
 *
 * @param Weapon Tag Settings
 * @text 武器标签配置
 * @parent --- Weapon Settings ---
 * @type struct<WeaponSetting>[]
 * @desc 在这里注册武器的标签。
 * @default []
 *
 * @param --- Armor Settings ---
 * @default
 *
 * @param Armor Tag Settings
 * @text 护甲标签配置
 * @parent --- Armor Settings ---
 * @type struct<ArmorSetting>[]
 * @desc 在这里注册护甲的标签。
 * @default []
 *
 * @help
 * ============================================================================
 * 介绍
 * ============================================================================
 * 这是一个标签系统的升级版 (v3.6)。
 *
 * 【更新说明】
 * 增加了内部逻辑，使插件能区分“角色自带标签”和“装备提供的标签”。
 * 这为窗口插件实现“装备标签排在最后且变色”提供了支持。
 *
 */

/*~struct~ActorSetting:
 * @param Actor ID
 * @text 角色ID
 * @type number
 * @min 1
 * @desc 数据库中对应的角色ID
 * @default 1
 *
 * @param Tags
 * @text 标签列表
 * @type struct<TagData>[]
 * @desc 该角色拥有的标签集合
 * @default []
 */

/*~struct~EnemySetting:
 * @param Enemy ID
 * @text 敌人ID
 * @type number
 * @min 1
 * @desc 数据库中对应的敌人ID
 * @default 1
 *
 * @param Tags
 * @text 标签列表
 * @type struct<TagData>[]
 * @desc 该敌人拥有的标签集合
 * @default []
 */

/*~struct~WeaponSetting:
 * @param Weapon ID
 * @text 武器ID
 * @type number
 * @min 1
 * @desc 数据库中对应的武器ID
 * @default 1
 *
 * @param Tags
 * @text 标签列表
 * @type struct<TagData>[]
 * @desc 该武器拥有的标签集合
 * @default []
 */

/*~struct~ArmorSetting:
 * @param Armor ID
 * @text 护甲ID
 * @type number
 * @min 1
 * @desc 数据库中对应的护甲ID
 * @default 1
 *
 * @param Tags
 * @text 标签列表
 * @type struct<TagData>[]
 * @desc 该护甲拥有的标签集合
 * @default []
 */

/*~struct~TagData:
 * @param Name
 * @text 标签名
 * @type string
 * @default 新标签
 *
 * @param Note
 * @text 标签注释
 * @type string
 * @default 无描述
 *
 * @param Effect
 * @text 标签效果文本 (正练)
 * @type string
 * @desc 正练状态下显示的说明文本。
 * @default 无效果
 *
 * @param Reverse Effect
 * @text 逆练效果文本 (Tier 2)
 * @type string
 * @desc [Tier 2专属] 逆练状态下显示的说明文本。
 * @default 逆练效果
 *
 * @param State List
 * @text 绑定状态列表 (正练)
 * @type number[]
 * @desc 正练时生效的被动状态ID。
 * @default []
 *
 * @param Reverse State List
 * @text 逆练状态列表 (Tier 2)
 * @type number[]
 * @desc [Tier 2专属] 逆练时生效的被动状态ID。
 * @default []
 *
 * @param Tier
 * @text 标签品级
 * @type number
 * @min 1
 * @max 3
 * @desc 1=普通, 2=可正逆切换, 3=史诗
 * @default 1
 *
 * @param State ID
 * @text [兼容旧版] 单个ID
 * @type number
 * @min 0
 * @default 0
 */

var Imported = Imported || {};
Imported.TagSystem = true;

var TagSystem = TagSystem || {};

(function() {

    TagSystem.Parameters = PluginManager.parameters('TagSystem');
    
    TagSystem.parseJson = function(str) {
        try {
            return JSON.parse(str);
        } catch (e) {
            return [];
        }
    };

    TagSystem.parseTagList = function(jsonStr) {
        var list = TagSystem.parseJson(jsonStr);
        return list.map(function(tagStr) {
            var tagObj = TagSystem.parseJson(tagStr);
            
            var singleId = Number(tagObj['State ID'] || 0);
            var posList = [];
            try { posList = JSON.parse(tagObj['State List'] || '[]').map(Number); } catch (e) {}
            if (singleId > 0) posList.push(singleId);

            var negList = [];
            try { negList = JSON.parse(tagObj['Reverse State List'] || '[]').map(Number); } catch (e) {}
            
            return {
                name: tagObj.Name || "",
                note: tagObj.Note || "",
                effect: tagObj.Effect || "",               
                reverseEffect: tagObj['Reverse Effect'] || "", 
                stateIds: posList,
                reverseStateIds: negList,
                tier: Number(tagObj.Tier || 1)
            };
        });
    };

    TagSystem.parseSettings = function(paramName, idParamName) {
        var rawList = TagSystem.parseJson(TagSystem.Parameters[paramName] || '[]');
        var dataMap = {};
        
        rawList.forEach(function(settingStr) {
            var setting = TagSystem.parseJson(settingStr);
            var id = Number(setting[idParamName]);
            var tags = TagSystem.parseTagList(setting.Tags || '[]');
            
            if (id > 0) {
                if (dataMap[id]) {
                    dataMap[id] = dataMap[id].concat(tags);
                } else {
                    dataMap[id] = tags;
                }
            }
        });
        return dataMap;
    };

    var _DataManager_createGameObjects = DataManager.createGameObjects;
    DataManager.createGameObjects = function() {
        _DataManager_createGameObjects.call(this);
        TagSystem.loadTagData();
    };

    TagSystem.loadTagData = function() {
        $dataTags = {
            actors: TagSystem.parseSettings('Actor Tag Settings', 'Actor ID'),
            enemies: TagSystem.parseSettings('Enemy Tag Settings', 'Enemy ID'),
            weapons: TagSystem.parseSettings('Weapon Tag Settings', 'Weapon ID'),
            armors: TagSystem.parseSettings('Armor Tag Settings', 'Armor ID')
        };
    };

    //-----------------------------------------------------------------------------
    // Game_Actor 扩展 - 战斗计数与相位切换
    //-----------------------------------------------------------------------------

    var _Game_Actor_setup = Game_Actor.prototype.setup;
    Game_Actor.prototype.setup = function(actorId) {
        _Game_Actor_setup.call(this, actorId);
        this.initTagCultivation();
    };

    Game_Actor.prototype.initTagCultivation = function() {
        this._tagPhase = 0; 
        this._tagBattleCount = 0;
        this._tagBattleLimit = this.generateTagBattleLimit();
    };

    Game_Actor.prototype.generateTagBattleLimit = function() {
        return Math.floor(Math.random() * 5) + 3; 
    };

    Game_Actor.prototype.getTagPhase = function() {
        return this._tagPhase || 0;
    };

    var _Game_Actor_onBattleEnd = Game_Actor.prototype.onBattleEnd;
    Game_Actor.prototype.onBattleEnd = function() {
        _Game_Actor_onBattleEnd.call(this);
        this.updateTagCultivation();
    };

    Game_Actor.prototype.updateTagCultivation = function() {
        this._tagBattleCount = (this._tagBattleCount || 0) + 1;
        if (this._tagBattleCount >= this._tagBattleLimit) {
            this._tagPhase = (this._tagPhase === 0) ? 1 : 0;
            this._tagBattleCount = 0;
            this._tagBattleLimit = this.generateTagBattleLimit();
            this.refresh();
        }
    };

    //-----------------------------------------------------------------------------
    // Game_BattlerBase / Game_Actor / Game_Enemy 扩展
    //-----------------------------------------------------------------------------
    
    Game_BattlerBase.prototype.getTags = function() {
        return [];
    };

    Game_BattlerBase.prototype.getTagPhase = function() {
        return 0; 
    };

    // 【修改】标记装备标签
    Game_Actor.prototype.getTags = function() {
        if (!$dataTags) return [];
        
        var tags = [];
        
        // 1. 角色标签 (非装备)
        var actorId = this.actorId();
        if ($dataTags.actors && $dataTags.actors[actorId]) {
            // 复制对象并标记 isEquip = false
            var aTags = $dataTags.actors[actorId].map(function(t) {
                var nt = Object.assign({}, t);
                nt.isEquip = false;
                return nt;
            });
            tags = tags.concat(aTags);
        }
        
        // 2. 装备标签
        var equips = this.equips();
        for (var i = 0; i < equips.length; i++) {
            var item = equips[i];
            if (!item) continue;
            
            var eTags = [];
            if (DataManager.isWeapon(item)) {
                if ($dataTags.weapons && $dataTags.weapons[item.id]) {
                    eTags = $dataTags.weapons[item.id];
                }
            } else if (DataManager.isArmor(item)) {
                if ($dataTags.armors && $dataTags.armors[item.id]) {
                    eTags = $dataTags.armors[item.id];
                }
            }
            
            // 复制对象并标记 isEquip = true
            if (eTags.length > 0) {
                var markedTags = eTags.map(function(t) {
                    var nt = Object.assign({}, t);
                    nt.isEquip = true; 
                    return nt;
                });
                tags = tags.concat(markedTags);
            }
        }
        
        return tags;
    };

    Game_Enemy.prototype.getTags = function() {
        if (!$dataTags || !$dataTags.enemies) return [];
        var enemyId = this.enemyId();
        return $dataTags.enemies[enemyId] || [];
    };

    //-----------------------------------------------------------------------------
    // 状态与特征逻辑
    //-----------------------------------------------------------------------------

    Game_BattlerBase.prototype.getTagStates = function() {
        var tags = this.getTags(); 
        var states = [];
        var currentPhase = this.getTagPhase(); 

        for (var i = 0; i < tags.length; i++) {
            var tag = tags[i];
            var targetIds = [];

            if (tag.tier === 2 && currentPhase === 1) {
                targetIds = tag.reverseStateIds;
            } else {
                targetIds = tag.stateIds;
            }

            if (targetIds && targetIds.length > 0) {
                for (var j = 0; j < targetIds.length; j++) {
                    var sId = targetIds[j];
                    if (sId > 0 && $dataStates[sId]) {
                        states.push($dataStates[sId]);
                    }
                }
            }
        }
        return states;
    };

    Game_BattlerBase.prototype.hasTagState = function(stateId) {
        var tags = this.getTags();
        var currentPhase = this.getTagPhase();

        for (var i = 0; i < tags.length; i++) {
            var tag = tags[i];
            var targetIds = [];
            if (tag.tier === 2 && currentPhase === 1) {
                targetIds = tag.reverseStateIds;
            } else {
                targetIds = tag.stateIds;
            }
            if (targetIds && targetIds.indexOf(stateId) > -1) {
                return true;
            }
        }
        return false;
    };

    var _Game_BattlerBase_traitObjects = Game_BattlerBase.prototype.traitObjects;
    Game_BattlerBase.prototype.traitObjects = function() {
        var objects = _Game_BattlerBase_traitObjects.call(this);
        var tagStates = this.getTagStates();
        for (var i = 0; i < tagStates.length; i++) {
            objects.push(tagStates[i]);
        }
        return objects;
    };

})();