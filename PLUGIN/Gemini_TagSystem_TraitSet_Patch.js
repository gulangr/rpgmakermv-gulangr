/*:
 * @plugindesc (v3.0) TagSystem 特性集扩展补丁 - 角色结构精准注入版
 * @author Gemini
 *
 * @param TraitSet File
 * @text 特性集JSON文件
 * @desc 位于 data/ 文件夹下的文件名 (需包含 .json 后缀)
 * @default TraitSet_001.json
 *
 * @help
 * ============================================================================
 * Gemini TagSystem Patch v3.0 (角色结构精准注入版)
 * ============================================================================
 * 专为 "TagSystem" 的【角色标签配置】结构设计的注入补丁。
 *
 * ★ 工作原理：
 * 1. 读取 TagSystem 的 "Actor Tag Settings" 参数。
 * 2. 解析每一项配置，获取 【角色ID (Actor ID)】。
 * 3. 遍历该角色配置下的 【标签列表 (Tags)】。
 * 4. 检查标签中的 【绑定状态 (State IDs)】。
 * 5. 如果发现 "w[名称]" (如 w神悟)，则从 JSON 中读取对应的特性集。
 * 6. 将特性集中的代码/备注，直接写入到该角色的数据库备注(Note)中。
 *
 * ★ 优势：
 * - 完美支持 Yanfly 等所有依赖备注读取的插件。
 * - 在游戏启动时一次性完成，游戏中无任何性能损耗。
 *
 * ============================================================================
 */

var Imported = Imported || {};
Imported.Gemini_TagSystem_Patch = true;

var Gemini = Gemini || {};
Gemini.TagPatch = Gemini.TagPatch || {};

(function() {
    'use strict';

    var parameters = PluginManager.parameters('Gemini_TagSystem_TraitSet_Patch');
    var traitSetFileName = parameters['TraitSet File'] || 'TraitSet_001.json';
    
    var _isGeminiInjected = false;

    // ========================================================================
    // 1. 拦截数据库加载流程
    // ========================================================================
    var _DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
    DataManager.isDatabaseLoaded = function() {
        // 等待标准数据库加载完毕
        if (!_DataManager_isDatabaseLoaded.call(this)) return false;

        // 执行一次性注入
        if (!_isGeminiInjected) {
            // 1.1 确保 JSON 数据已开始加载
            if (!window.$dataTraitSets) {
                this.loadGeminiTraitSets(); 
                return false; // 暂停等待
            }
            
            // 1.2 等待加载完成
            if (window._geminiTraitSetLoading) return false;

            // 1.3 数据就绪，开始注入
            this.injectGeminiNotes();
            _isGeminiInjected = true;
        }

        return true;
    };

    // ========================================================================
    // 2. 加载 JSON 文件
    // ========================================================================
    DataManager.loadGeminiTraitSets = function() {
        if (window._geminiTraitSetLoading) return;
        window._geminiTraitSetLoading = true;
        window.$dataTraitSets = {}; 

        var xhr = new XMLHttpRequest();
        var url = 'data/' + traitSetFileName;
        xhr.open('GET', url);
        xhr.overrideMimeType('application/json');
        xhr.onload = function() {
            if (xhr.status < 400) {
                try {
                    DataManager.processGeminiTraitSets(JSON.parse(xhr.responseText));
                } catch (e) {
                    console.error("Gemini Patch: JSON 解析失败", e);
                }
            }
            window._geminiTraitSetLoading = false; 
        };
        xhr.onerror = function() {
            console.error("Gemini Patch: 无法读取文件 " + url);
            window._geminiTraitSetLoading = false;
        };
        xhr.send();
    };

    DataManager.processGeminiTraitSets = function(nodes) {
        var map = {};
        
        // 递归处理树状结构
        var traverse = function(nodeList) {
            if (!nodeList) return;
            nodeList.forEach(function(node) {
                if (node.type === 'folder') {
                    if (node.children) traverse(node.children);
                } else if (node.type === 'set') {
                    // 构建特性集对象 - 补全 _isGeminiSet 标记
                    var traitObj = {
                        id: node.id,
                        name: node.name,
                        note: "", // 核心：存储所有代码
                        traits: [],
                        plusParams: [0,0,0,0,0,0,0,0],
                        rateParams: [1,1,1,1,1,1,1,1],
                        _isGeminiSet: true // 关键修复：标记为Gemini特性集，让paramPlus识别
                    };
                    
                    // 收集代码与特性
                    if (node.traits) {
                        node.traits.forEach(function(t) {
                            if (t.isCustom) {
                                // ★ 将自定义代码追加到 Note
                                traitObj.note += "\n" + (t.code || "") + "\n";
                            } else {
                                // 标准特性
                                traitObj.traits.push({
                                    code: Number(t.code),
                                    dataId: Number(t.dataId || 0),
                                    value: Number(t.value || 0)
                                });
                            }
                        });
                    }
                    
                    // 解析基础属性 (为 traitObjects 运行时做准备)
                    Gemini.TagPatch.parseBaseParams(traitObj);
                    
                    map[String(node.name).trim()] = traitObj;
                }
            });
        };

        traverse(nodes);
        window.$dataTraitSets = map;
    };

    // ========================================================================
    // 3. 核心手术：TagSystem 结构化注入
    // ========================================================================
    DataManager.injectGeminiNotes = function() {
        console.group("🔍 Gemini Patch v3.0: 角色结构注入");
        
        // 1. 读取 TagSystem 参数
        var tagParams = PluginManager.parameters('TagSystem');
        // 专门读取 'Actor Tag Settings'
        var rawActorSettings = tagParams['Actor Tag Settings'] || '[]';
        
        var actorSettings = [];
        try {
            // 解析第一层：角色配置列表
            actorSettings = JSON.parse(rawActorSettings);
        } catch(e) {
            console.error("无法解析 TagSystem 的 [Actor Tag Settings] 参数。", e);
            console.groupEnd();
            return;
        }

        var injectedCount = 0;

        // 2. 遍历每一个角色配置 (Item)
        actorSettings.forEach(function(settingStr, index) {
            var setting = {};
            try { setting = JSON.parse(settingStr); } catch(e) { return; }

            // 获取角色ID (TagSystem 参数名为 'Actor ID')
            var actorId = Number(setting['Actor ID']);
            
            // 校验角色是否存在
            if (actorId > 0 && $dataActors[actorId]) {
                var actor = $dataActors[actorId];
                var tagsStr = setting['Tags'] || '[]';
                var tags = [];
                try { tags = JSON.parse(tagsStr); } catch(e) {}

                var actorInjectedNote = "";
                var hasInjection = false;

                // 3. 遍历该角色的每一个标签 (Tag)
                tags.forEach(function(tagStr) {
                    var tagData = {};
                    try { tagData = JSON.parse(tagStr); } catch(e) { return; }

                    // 获取绑定列表 (State IDs 和 Reverse State IDs)
                    var stateIdsStr = tagData['State IDs'] || '[]';
                    var revIdsStr = tagData['Reverse State IDs'] || '[]';
                    
                    var targetIds = [];
                    try { targetIds = targetIds.concat(JSON.parse(stateIdsStr)); } catch(e){}
                    try { targetIds = targetIds.concat(JSON.parse(revIdsStr)); } catch(e){}

                    // 4. 检查 w[名称] 并提取
                    targetIds.forEach(function(val) {
                        var strVal = String(val).trim();
                        if (strVal.startsWith("w")) {
                            var setName = strVal.substring(1).trim();
                            var traitSet = window.$dataTraitSets[setName];

                            if (traitSet && traitSet.note) {
                                // ★★★ 注入核心 ★★★
                                actorInjectedNote += "\n" + traitSet.note + "\n";
                                console.log(`💉 注入: [角色ID:${actorId} ${actor.name}] <- 标签[${tagData.Name||'未命名'}] <- 特性集[${setName}]`);
                                hasInjection = true;
                            } else {
                                console.warn(`⚠️ 未找到特性集: "${setName}" (在角色 ${actor.name} 的标签中引用)`);
                            }
                        }
                    });
                });

                // 5. 写入数据库
                if (hasInjection) {
                    actor.note += actorInjectedNote;
                    // 更新元数据，确保其他插件能读到新 Note
                    if (DataManager.extractMetadata) {
                        DataManager.extractMetadata(actor);
                    }
                    injectedCount++;
                }
            }
        });

        console.log(`✅ 注入完成。共修改了 ${injectedCount} 个角色的数据。`);
        console.groupEnd();
    };

    // ========================================================================
    // 4. 辅助功能 (基础属性解析 & 运行时支持)
    // ========================================================================
    // 解析 <atk Plus: x> 等，用于 traitObjects (面板数值显示)
    Gemini.TagPatch.parseBaseParams = function(obj) {
        var notedata = obj.note.split(/[\r\n]+/);
        for (var i = 0; i < notedata.length; i++) {
            var line = notedata[i];
            if (line.match(/<(.*) PLUS:[ ]([\+\-]\d+)>/i)) {
                var id = this.getParamId(String(RegExp.$1));
                if (id !== null) obj.plusParams[id] = parseInt(RegExp.$2);
            } else if (line.match(/<(.*) RATE:[ ](\d+)([%％])>/i)) {
                var id = this.getParamId(String(RegExp.$1));
                if (id !== null) obj.rateParams[id] = parseFloat(RegExp.$2) * 0.01;
            }
        }
    };
    
    Gemini.TagPatch.getParamId = function(string) {
        string = string.toUpperCase().trim();
        if (['MHP', 'MAXHP', 'HP'].indexOf(string) >= 0) return 0;
        if (['MMP', 'MAXMP', 'MP'].indexOf(string) >= 0) return 1;
        if (['ATK', 'ATTACK'].indexOf(string) >= 0) return 2;
        if (['DEF', 'DEFENSE'].indexOf(string) >= 0) return 3;
        if (['MAT', 'M.ATTACK', 'INT'].indexOf(string) >= 0) return 4;
        if (['MDF', 'M.DEFENSE', 'RES'].indexOf(string) >= 0) return 5;
        if (['AGI', 'AGILITY', 'SPD'].indexOf(string) >= 0) return 6;
        if (['LUK', 'LUCK'].indexOf(string) >= 0) return 7;
        return null;
    };

    // 运行时 traitObjects (用于支持数值面板显示)
    // 注意：自定义代码(Custom Code)已经在上面注入到 Actor Note 里生效了，
    // 这里主要是为了让 paramPlus 等数值计算也能读到 JSON 里的数据。
    var _Game_BattlerBase_traitObjects = Game_BattlerBase.prototype.traitObjects;
    Game_BattlerBase.prototype.traitObjects = function() {
        var objects = _Game_BattlerBase_traitObjects.call(this);
        if (!window.$dataTraitSets) return objects;

        // 仅处理 Actor (因为 Enemy 的 Tag 结构不同，且通常不需要复杂注入)
        if (this.isActor()) {
            // 兜底逻辑：优先通过 TagSystem 标签匹配，失败则从角色备注反向匹配
            var hasTagMatched = false;
            if (this.getTags) {
                var tags = this.getTags(); 
                var currentPhase = (typeof this.getTagPhase === 'function') ? this.getTagPhase() : 0;
                
                for (var i = 0; i < tags.length; i++) {
                    var tag = tags[i];
                    var targetIds = [];
                    
                    // 正逆练判定
                    if (tag.tier === 2) {
                        if (currentPhase === 1) targetIds = tag.reverseStateIds; 
                        else targetIds = tag.stateIds;        
                    } else {
                        targetIds = tag.stateIds;
                    }

                    if (targetIds && targetIds.length > 0) {
                        for (var j = 0; j < targetIds.length; j++) {
                            var idVal = String(targetIds[j]);
                            if (idVal.trim().startsWith("w")) {
                                var setName = idVal.trim().substring(1).trim();
                                var traitSet = window.$dataTraitSets[setName];
                                if (traitSet) {
                                    objects.push(traitSet);
                                    hasTagMatched = true;
                                }
                            }
                        }
                    }
                }
            }

            // 兜底：如果标签匹配失败，从角色备注中匹配特性集名称
            if (!hasTagMatched) {
                var actor = $dataActors[this.actorId()];
                if (actor && actor.note) {
                    Object.values(window.$dataTraitSets).forEach(function(traitSet) {
                        // 匹配特性集名称/备注特征，避免重复添加
                        if (actor.note.includes(traitSet.note.trim()) && !objects.includes(traitSet)) {
                            objects.push(traitSet);
                        }
                    });
                }
            }
        }
        return objects;
    };
    
    // 劫持 paramPlus 以支持 JSON 中的 <atk Plus> (显示用)
    var _Game_Battler_paramPlus = Game_Battler.prototype.paramPlus;
    Game_Battler.prototype.paramPlus = function(paramId) {
        var value = _Game_Battler_paramPlus.call(this, paramId);
        if (this.isActor()) {
            var traits = this.traitObjects();
            for (var i = 0; i < traits.length; i++) {
                // 兼容标记：即使 _isGeminiSet 缺失，也读取 plusParams (双重保障)
                if ((traits[i]._isGeminiSet || traits[i].plusParams) && traits[i].plusParams) {
                    value += traits[i].plusParams[paramId];
                }
            }
        }
        return value;
    };

    // 覆盖 TagSystem 内核解析，防止 w神悟 被转为 NaN
    if (typeof TagSystem !== 'undefined' && TagSystem.parseTagList) {
        TagSystem.parseTagList = function(jsonStr, defaultTier) {
            var list = TagSystem.parseJson(jsonStr);
            return list.map(function(tagStr) {
                var tagObj = TagSystem.parseJson(tagStr);
                var dTier = defaultTier || 1;
                
                // 辅助函数：安全解析 ID 列表
                var parseIds = function(key) {
                    var raw = TagSystem.parseJson(tagObj[key] || '[]');
                    if (!Array.isArray(raw)) return [];
                    return raw.map(function(val) {
                        // 如果是纯数字，转数字；如果是 w开头，保留字符串
                        if (!isNaN(Number(val)) && String(val).trim() !== "") return Number(val);
                        return String(val);
                    });
                };

                return {
                    name: tagObj.Name || "",
                    note: tagObj.Note || "",
                    effect: tagObj.Effect || "",
                    reverseEffect: tagObj['Reverse Effect'] || "", 
                    tier: Number(tagObj.Tier || dTier),
                    stateIds: parseIds('State IDs'), 
                    reverseStateIds: parseIds('Reverse State IDs') 
                };
            });
        };
        // 强制重载 Tag 数据
        TagSystem.loadTagData();
    }

})();