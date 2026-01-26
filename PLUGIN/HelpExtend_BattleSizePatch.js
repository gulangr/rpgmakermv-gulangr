/*:
 * @plugindesc HelpExtend战斗字号自定义补丁 (V1.1 - 支持品质字号)
 * @author 辅助开发
 * @parent HelpExtend
 * * @param BattleItemDescNameSize
 * @desc 战斗中道具描述里物品名称字号
 * @default 24
 * * @param BattleItemDescSize
 * @desc 战斗中道具描述里其他项目字号
 * @default 18
 * * @param BattleItemDescOtherSize
 * @desc 战斗中道具描述里其他项目字号（装备/技能属性等）
 * @default 20
 *
 * @param BattleItemQualitySize
 * @desc 战斗中“品质”行的文字大小
 * @default 14
 * * @help
 * 1. 需将本插件放在HelpExtend.js之后加载
 * 2. 战斗场景会使用本插件的字号参数，非战斗场景使用原HelpExtend的参数
 * 3. V1.1新增：可独立控制战斗中“品质”文字的大小
 */

// 读取补丁参数
var RJO = RJO || {};
RJO.Parameters_BattleSize = PluginManager.parameters('HelpExtend_BattleSizePatch');
RJO.Param = RJO.Param || {};

RJO.Param.BattleItemDescNameSize = Number(RJO.Parameters_BattleSize['BattleItemDescNameSize'] || 22);
RJO.Param.BattleItemDescSize = Number(RJO.Parameters_BattleSize['BattleItemDescSize'] || 16);
RJO.Param.BattleItemDescOtherSize = Number(RJO.Parameters_BattleSize['BattleItemDescOtherSize'] || 18);
// 新增参数：品质字号
RJO.Param.BattleItemQualitySize = Number(RJO.Parameters_BattleSize['BattleItemQualitySize'] || 14);

// 重写获取字号的逻辑，区分战斗/非战斗场景
(function() {
    // 备份原有的参数读取逻辑
    const originalGetDescParams = RJO.HE.getDescParams;

    RJO.HE.getDescParams = function(item, type) {
        // 判断是否在战斗场景
        const isBattleScene = (SceneManager._scene instanceof Scene_Battle);
        
        // 备份非战斗场景的原始参数
        const originNameSize = RJO.HE.ItemDescNameSize;
        const originDescSize = RJO.HE.ItemDescSize;
        const originOtherSize = RJO.HE.ItemDescOtherSize;

        // 如果是战斗场景，替换为战斗专用参数
        if (isBattleScene) {
            RJO.HE.ItemDescNameSize = RJO.Param.BattleItemDescNameSize;
            RJO.HE.ItemDescSize = RJO.Param.BattleItemDescSize;
            RJO.HE.ItemDescOtherSize = RJO.Param.BattleItemDescOtherSize;
        }

        // 执行原逻辑 (生成 item.descParams)
        originalGetDescParams.call(this, item, type);
        
        // --- V1.1 新增：强制修正品质行字号 ---
        if (isBattleScene && item.descParams) {
            for (var i = 0; i < item.descParams.length; i++) {
                var text = String(item.descParams[i][0]);
                // 检测是否包含“品质”或“Quality”
                if (text.indexOf("品质") !== -1 || text.indexOf("Quality") !== -1) {
                    // 强制修改该行的字号为参数设定的值
                    item.descParams[i][1] = RJO.Param.BattleItemQualitySize;
                }
            }
        }
        // -----------------------------------

        // 恢复原参数（避免影响非战斗场景）
        if (isBattleScene) {
            RJO.HE.ItemDescNameSize = originNameSize;
            RJO.HE.ItemDescSize = originDescSize;
            RJO.HE.ItemDescOtherSize = originOtherSize;
        }
    };

    // 修复战斗场景下动态更新字号的问题
    const originalSpriteSetItem = Sprite_ItemHelp.prototype.setItem;
    Sprite_ItemHelp.prototype.setItem = function(item) {
        if (SceneManager._scene instanceof Scene_Battle && item) {
            // 重新计算战斗场景下的描述参数
            const type = DataManager.isItem(item) ? 0 : 
                         DataManager.isWeapon(item) ? 1 : 
                         DataManager.isArmor(item) ? 2 : 
                         DataManager.isSkill(item) ? 3 : 0;
            
            // 重新生成数据 (这时会触发上面的 getDescParams 并应用战斗字号)
            RJO.HE.getDescParams(item, type);
        }
        originalSpriteSetItem.call(this, item);
    };

})();