

/*:


 * @plugindesc HelpExtend战斗字号自定义补丁


 * @author 辅助开发


 * @parent HelpExtend


 * 


 * @param BattleItemDescNameSize


 * @desc 战斗中道具描述里物品名称字号


 * @default 24


 * 


 * @param BattleItemDescSize


 * @desc 战斗中道具描述里其他项目字号


 * @default 18


 * 


 * @param BattleItemDescOtherSize


 * @desc 战斗中道具描述里其他项目字号（装备/技能属性等）


 * @default 20


 * 


 * @help


 * 1. 需将本插件放在HelpExtend.js之后加载


 * 2. 战斗场景会使用本插件的字号参数，非战斗场景使用原HelpExtend的参数


 * 3. 参数含义与原插件对应参数完全一致，仅作用于战斗场景


 */



// 读取补丁参数


RJO.Parameters_BattleSize = PluginManager.parameters('HelpExtend_BattleSizePatch');


RJO.Param.BattleItemDescNameSize = Number(RJO.Parameters_BattleSize['BattleItemDescNameSize'] || 22);


RJO.Param.BattleItemDescSize = Number(RJO.Parameters_BattleSize['BattleItemDescSize'] || 16);


RJO.Param.BattleItemDescOtherSize = Number(RJO.Parameters_BattleSize['BattleItemDescOtherSize'] || 18);



// 重写获取字号的逻辑，区分战斗/非战斗场景


(function() {


    // 备份原有的参数读取逻辑


    const originalGetDescParams = RJO.HE.getDescParams;


    


    RJO.HE.getDescParams = function(item, type) {


        // 判断是否为战斗场景


        const isBattleScene = SceneManager._scene instanceof Scene_Battle;


        


        // 临时替换字号参数（战斗场景使用补丁参数，非战斗使用原参数）


        const originNameSize = RJO.HE.ItemDescNameSize;


        const originDescSize = RJO.HE.ItemDescSize;


        const originOtherSize = RJO.HE.ItemDescOtherSize;


        


        if (isBattleScene) {


            RJO.HE.ItemDescNameSize = RJO.Param.BattleItemDescNameSize;


            RJO.HE.ItemDescSize = RJO.Param.BattleItemDescSize;


            RJO.HE.ItemDescOtherSize = RJO.Param.BattleItemDescOtherSize;


        }


        


        // 执行原逻辑


        originalGetDescParams.call(this, item, type);


        


        // 恢复原参数（避免影响非战斗场景）


        if (isBattleScene) {


            RJO.HE.ItemDescNameSize = originNameSize;


            RJO.HE.ItemDescSize = originDescSize;


            RJO.HE.ItemDescOtherSize = originOtherSize;


        }


    };



    // 修复战斗场景下动态更新字号的问题（可选：如果战斗中切换物品时字号未生效则启用）


    const originalSpriteSetItem = Sprite_ItemHelp.prototype.setItem;


    Sprite_ItemHelp.prototype.setItem = function(item) {


        if (SceneManager._scene instanceof Scene_Battle && item) {


            // 重新计算战斗场景下的描述参数


            const type = DataManager.isItem(item) ? 0 : 


                         DataManager.isWeapon(item) ? 1 : 


                         DataManager.isArmor(item) ? 2 : 


                         DataManager.isSkill(item) ? 3 : -1;


            if (type >= 0) {


                RJO.HE.getDescParams(item, type);


            }


        }


        originalSpriteSetItem.call(this, item);


    };


})();

