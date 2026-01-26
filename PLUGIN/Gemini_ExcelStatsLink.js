/*:
 * @plugindesc v1.8 (硬上限修复) 链接EXCEL数据库，支持软上限/装备突破/全局硬上限三重逻辑。
 * @author Gemini
 *
 * @help
 * ============================================================================
 * 插件说明 (v1.8)
 * ============================================================================
 * 1. 前置插件：必须安装并启用 ChapterControl.js。
 * 2. 数据源：自动读取 data/Gemini_ExcelStats.json 文件。
 *
 * 3. 属性计算优先级逻辑（核心）：
 * Step 1 [基础值]: 读取 Excel 中的 X 值作为 1 级基础属性。
 * Step 2 [肉体成长]: 计算 (基础X + 升级/道具加成)，得到“肉体值”。
 * Step 3 [软上限截断]: 将“肉体值”限制在 (Excel Y值 / 5 * 当前章节) 范围内。
 * Step 4 [装备叠加]: 在截断后的肉体值上，叠加装备和备注的属性加成。
 * Step 5 [硬上限封顶]: 最终结果强制不超过 (Gemini_LimitBonusPatch) 规定的全局上限。
 *
 * 4. 辅助功能：
 * - 将 Excel 中的 nameIcon 注入到数据库 meta 中。
 * - 提供 isParamReachedChapterCap 函数供雷达图判断是否变色。
 * ============================================================================
 */

var Imported = Imported || {};
Imported.Gemini_ExcelStatsLink = true;

var Gemini = Gemini || {};
Gemini.ESL = {};
Gemini.ESL.parameters = PluginManager.parameters('Gemini_ExcelStatsLink');
Gemini.ESL._dataInjected = false; 

// ============================================================================
// 1. DataManager: 加载与注入
// ============================================================================
Gemini.ESL.DataManager_loadDatabase = DataManager.loadDatabase;
DataManager.loadDatabase = function() {
    Gemini.ESL.DataManager_loadDatabase.call(this);
    this.loadDataFile('$dataExcelStats', 'Gemini_ExcelStats.json');
};

var _Gemini_ESL_DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
    if (!_Gemini_ESL_DataManager_isDatabaseLoaded.call(this)) return false;
    if (!window['$dataExcelStats']) return false; 
    
    if (!Gemini.ESL._dataInjected) {
        Gemini.ESL.injectExcelData();
        Gemini.ESL._dataInjected = true;
    }
    
    return true;
};

Gemini.ESL.injectExcelData = function() {
    if (!$dataExcelStats) return;
    
    var inject = function(db) {
        for (var id in db) {
            var data = db[id];
            var obj = null;
            if (db === $dataExcelStats.Actors) obj = $dataActors[id];
            else if (db === $dataExcelStats.Enemies) obj = $dataEnemies[id];
            else if (db === $dataExcelStats.Classes) obj = $dataClasses[id];
            
            if (data && obj && data.nameIcon) {
                obj.meta.NameIcon = String(data.nameIcon);
            }
        }
    };

    inject($dataExcelStats.Actors);
    inject($dataExcelStats.Enemies);
    inject($dataExcelStats.Classes);

    if ($gameTemp && $gameTemp._isPlaytest) {
        console.log("[Gemini_ESL] NameIcon 数据注入完成。");
    }
};

// ============================================================================
// 2. 核心辅助：获取 Excel 定义的数据
// ============================================================================

Game_Actor.prototype.getExcelStatDef = function(paramId) {
    if (!$dataExcelStats) return null;
    var actorData = $dataExcelStats.Actors[this.actorId()];
    if (actorData && actorData.stats && actorData.stats[paramId]) {
        return actorData.stats[paramId];
    }
    var classData = $dataExcelStats.Classes[this._classId];
    if (classData && classData.stats && classData.stats[paramId]) {
        return classData.stats[paramId];
    }
    return null;
};

Game_Enemy.prototype.getExcelStatDef = function(paramId) {
    if (!$dataExcelStats) return null;
    var enemyData = $dataExcelStats.Enemies[this.enemyId()];
    if (enemyData && enemyData.stats && enemyData.stats[paramId]) {
        return enemyData.stats[paramId];
    }
    return null;
};

// ============================================================================
// 3. 基础值重写 (应用 X 值)
// ============================================================================

var _Gemini_ESL_Game_Actor_paramBase = Game_Actor.prototype.paramBase;
Game_Actor.prototype.paramBase = function(paramId) {
    var def = this.getExcelStatDef(paramId);
    if (def) return def.x; 
    return _Gemini_ESL_Game_Actor_paramBase.call(this, paramId);
};

var _Gemini_ESL_Game_Enemy_paramBase = Game_Enemy.prototype.paramBase;
Game_Enemy.prototype.paramBase = function(paramId) {
    var def = this.getExcelStatDef(paramId);
    if (def) return def.x;
    return _Gemini_ESL_Game_Enemy_paramBase.call(this, paramId);
};

// ============================================================================
// 4. 上限计算与属性重组 (应用 Y 值与章节限制)
// ============================================================================

Game_BattlerBase.prototype.getExcelChapterCap = function(paramId) {
    if (!this.isActor()) return 99999999;
    var def = this.getExcelStatDef(paramId);
    if (!def || def.y <= 0) return 99999999; 

    var rawChapter = 1.0;
    if ($gameSystem && typeof $gameSystem.chapter === 'function') {
        rawChapter = $gameSystem.chapter();
    }
    var currentChapter = Math.floor(rawChapter);
    if (currentChapter < 1) currentChapter = 1;
    if (currentChapter > 5) currentChapter = 5;

    var capPerChapter = Math.floor(def.y / 5);
    return capPerChapter * currentChapter;
};

Game_Actor.prototype.paramPlusFromEquips = function(paramId) {
    var value = 0;
    var equips = this.equips();
    for (var i = 0; i < equips.length; i++) {
        var item = equips[i];
        if (item) value += item.params[paramId];
    }
    return value;
};

// 重写 param 方法：核心逻辑
var _Gemini_ESL_Game_Actor_param = Game_Actor.prototype.param;
Game_Actor.prototype.param = function(paramId) {
    // 1. 获取包含所有加成（基础X + 升级 + 种子 + 装备）的原始总值
    var baseValue = this.paramBase(paramId);
    var plusValue = this.paramPlus(paramId); 
    var totalRaw = baseValue + plusValue;

    // 2. 剥离装备加成，算出“肉体属性”
    var equipPlus = this.paramPlusFromEquips(paramId);
    var bodyStats = totalRaw - equipPlus; 

    // 3. 计算当前章节软上限 (Excel Y相关)
    var chapterCap = this.getExcelChapterCap(paramId);

    // 4. 对肉体属性进行截断 (Soft Cap)
    var cappedBody = Math.min(bodyStats, chapterCap);

    // 5. 重新加上装备属性 (装备可以突破软上限)
    var finalBase = cappedBody + equipPlus;

    // 6. 应用 Rate (特性乘算) 和 Buff
    var paramRate = this.paramRate(paramId);
    var buffRate = this.paramBuffRate(paramId);
    var finalValue = finalBase * paramRate * buffRate;
    
    var result = Math.floor(finalValue);

    // 7. [新增] 强制遵守全局硬上限 (Gemini_LimitBonusPatch 规定的上限)
    // this.paramMax(paramId) 会返回LimitBonusPatch计算后的最终天花板
    var globalHardCap = this.paramMax(paramId);
    if (result > globalHardCap) {
        result = globalHardCap;
    }

    // 8. 最小生命值保护
    if (paramId === 0 && result <= 0) {
        // console.warn("[Gemini_ESL] Actor " + this.actorId() + " MaxHP fixed to 1.");
        result = 1;
    }
    
    return result;
};

// ============================================================================
// 5. 辅助功能：供雷达图调用判断是否变色
// ============================================================================

Game_Actor.prototype.isParamReachedChapterCap = function(paramId) {
    var baseValue = this.paramBase(paramId);
    var plusValue = this.paramPlus(paramId);
    var equipPlus = this.paramPlusFromEquips(paramId);
    
    var bodyStats = baseValue + (plusValue - equipPlus);
    var chapterCap = this.getExcelChapterCap(paramId);
    
    // 如果肉体值 >= 软上限，视为达标
    return bodyStats >= chapterCap;
};