/*:
 * @plugindesc v1.3 动态敌人等级与属性系统 (UI样式优化版)
 * @author Gemini
 *
 * @param LevelWeightX
 * @text 等级计算权重X
 * @desc 最高等级的权重 (0-1之间)。计算公式：最高级*X + (1-X)*去掉最低级后的平均级。
 * @default 0.5
 *
 * @help
 * 修改点：
 * 1. 敌人名称显示的格式从 lv[n] 改为 lv.n
 * 2. 依然保持底层兼容逻辑，确保在 Olivia 等 UI 插件下也能显示。
 */

(function() {
    var params = PluginManager.parameters('Gemini_DynamicEnemyLevel');
    var weightX = parseFloat(params['LevelWeightX'] || 0.5);

    // ========================================================================
    // 1. 等级计算核心 (包含地图备注逻辑)
    // ========================================================================
    
    Game_Enemy.prototype.calculateDynamicLevel = function() {
        var members = $gameParty.allMembers();
        if (members.length === 0) return 1;
        var levels = members.map(function(m) { return m.level; });
        var maxLv = Math.max.apply(null, levels);
        
        var avgLv;
        if (levels.length > 1) {
            var minLv = Math.min.apply(null, levels);
            var sum = levels.reduce(function(a, b) { return a + b; }, 0);
            avgLv = (sum - minLv) / (levels.length - 1);
        } else {
            avgLv = maxLv;
        }

        var baseLv = maxLv * weightX + (1 - weightX) * avgLv;
        var offset = 0;
        
        if ($dataMap && $dataMap.note) {
            var mapNote = $dataMap.note;
            var regex = /<MapLv:([^:>]+):([^:>]+)(?::([^>]+))?>/i;
            var match = mapNote.match(regex);
            if (match) {
                var targetMapId = match[1];
                var adjustVal = match[2];
                if (targetMapId.toUpperCase() === 'M' || parseInt(targetMapId) === $gameMap.mapId()) {
                    if (adjustVal.toUpperCase() !== 'M') offset = parseInt(adjustVal) || 0;
                }
            }
        }
        return Math.max(1, Math.round(baseLv + offset));
    };

    var _Game_Enemy_setup = Game_Enemy.prototype.setup;
    Game_Enemy.prototype.setup = function(enemyId, x, y) {
        _Game_Enemy_setup.call(this, enemyId, x, y);
        this._level = this.calculateDynamicLevel();
    };

    // ========================================================================
    // 2. 属性计算 (适配 ChapterControl 与 Excel 数据)
    // ========================================================================

    Game_Enemy.prototype.getChapterYRate = function() {
        if (!$gameSystem || typeof $gameSystem.chapter !== 'function') return 1.0;
        var chapter = Math.floor($gameSystem.chapter()); // 小数点后向下取整
        switch (chapter) {
            case 1: return 1.025;
            case 2: return 1.05;
            case 3: return 1.1;
            case 4: return 1.2;
            case 5: return 1.4;
            default: return chapter > 5 ? 1.4 : 1.0;
        }
    };

    var _Game_Enemy_param = Game_Enemy.prototype.param;
    Game_Enemy.prototype.param = function(paramId) {
        // 如果 ExcelStatsLink 已经注入了 getExcelStatDef，则优先使用
        var statsDef = this.getExcelStatDef ? this.getExcelStatDef(paramId) : null;
        if (!statsDef) return _Game_Enemy_param.call(this, paramId);

        var x = statsDef.x;
        var y = statsDef.y;
        var n = this._level || 1;
        var modifiedY = y * this.getChapterYRate();
        
        // 属性成长公式: x + (y - x) * (n - 1) / 44
        var baseParam = x + (modifiedY - x) * (n - 1) / 44;
        
        var diffRate = 1.0;
        if ($dataMap && $dataMap.note.contains('简单')) diffRate = 0.8;
        if ($dataMap && $dataMap.note.contains('困难')) diffRate = 1.2;

        return Math.floor(baseParam * diffRate * this.paramRate(paramId) * this.paramBuffRate(paramId));
    };

    // ========================================================================
    // 3. UI 注入 (底层名称改写：lv.n 样式)
    // ========================================================================

    var _Game_Enemy_name = Game_Enemy.prototype.name;
    Game_Enemy.prototype.name = function() {
        var name = _Game_Enemy_name.call(this);
        // 防止重复添加标签（有些插件会多次调用 name 方法）
        if (name.contains("lv.")) return name;
        
        var lv = this._level || this.calculateDynamicLevel();
        // 修改为用户要求的 lv.n 格式
        return "lv." + lv + " " + name;
    };

})();