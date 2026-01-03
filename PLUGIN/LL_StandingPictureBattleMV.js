//=============================================================================
// RPGツクールMV - LL_StandingPictureBattleMV.js v1.8.0
//-----------------------------------------------------------------------------
// ルルの教会 (Lulu's Church)
// https://nine-yusha.com/
//
// URL below for license details.
// https://nine-yusha.com/plugin/
//=============================================================================

/*:
 * @target MV
 * @plugindesc Automatically displays standing pictures during battle.
 * @author Lulu's Church
 * @url https://nine-yusha.com/plugin-sbpicture/
 *
 * @help LL_StandingPictureBattleMV.js
 *
 * Standing pictures are automatically displayed during battle at the following timings:
 *   ・At battle start (Fight/Escape selection)
 *   ・When selecting commands
 *   ・When taking damage
 *   ・When evading
 *   ・When winning
 *   ・When attacking, defending, or using a skill
 *   ・When counterattacking or reflecting magic
 *   ・When using items
 *   ・At battle victory
 *
 * You can define multiple standing pictures with conditions such as states, switches, or variables:
 *   ・When Switch 1 is ON and poisoned
 *   ・When Variable 1 ≥ 10 and poisoned
 *   ・When Switch 1 is ON
 *   ・When poisoned
 *   ・No switch/state/variable conditions = default standing picture (required)
 *
 * Switching by remaining HP%:
 *   First, create a standing picture list with "Remaining HP%" set to "100".
 *   Copy it and change "Remaining HP%" to "50".
 *   When HP is 50% or below, the list with "50" will be used.
 *   You can define multiple standing pictures per HP% threshold.
 *
 * Priority of image display:
 *   1. Matches State ID + Switch ID + Variable condition
 *   2. Matches State ID + Switch ID
 *   3. Matches State ID + Variable condition
 *   4. Matches State ID only
 *   5. Matches Switch ID + Variable condition
 *   6. Matches Switch ID only
 *   7. Matches Variable condition only
 *   8. No conditions (State ID, Switch ID, Variable all unset)
 *   (Among these, the standing picture with the lowest Remaining HP% is prioritized)
 *
 * To flip an image:
 *   Set X Scale to "-100" to flip horizontally.
 *   (If origin is Upper Left, X coordinate will shift left by image width)
 *
 * Standing pictures for counter and magic reflection:
 *   Counter: The picture assigned to the attack skill is shown.
 *   Magic Reflection: The picture assigned to the reflected skill is shown.
 *
 * Plugin Commands:
 *   LL_StandingPictureBattleMV setEnabled true   # Enable standing pictures
 *   LL_StandingPictureBattleMV setEnabled false  # Disable standing pictures
 *
 * Terms of use:
 *   ・No copyright notice required.
 *   ・No report needed for use.
 *   ・Free for commercial and non-commercial.
 *   ・No restriction for adult works.
 *   ・You may modify freely for your game.
 *   ・Redistribution as plugin material (incl. modified) prohibited.
 *
 * Author: Lulu's Church
 * Date: 2022/6/3
 *
 * @command setEnabled
 * @text Toggle Standing Pictures
 * @desc Enable/disable standing picture display globally.
 *
 * @arg enabled
 * @text Standing Pictures
 * @desc If OFF, standing pictures will not be displayed.
 * @default true
 * @type boolean
 *
 * @param pictureListSettings
 * @text Standing Picture List
 * @desc *Not used
 *
 * @param sbCommandPictures
 * @text On Command Select
 * @desc Standing pictures shown during command selection.
 * You can define multiple by state, switch, or remaining HP%.
 * @default []
 * @type struct<sbCommandPictures>[]
 * @parent pictureListSettings
 *
 * @param sbDamagePictures
 * @text On Damage
 * @desc Standing pictures shown when taking damage.
 * You can define multiple by state, switch, or remaining HP%.
 * @default []
 * @type struct<sbDamagePictures>[]
 * @parent pictureListSettings
 *
 * @param sbEvasionPictures
 * @text On Evasion
 * @desc Standing pictures shown when evading.
 * You can define multiple by state, switch, or remaining HP%.
 * @default []
 * @type struct<sbEvasionPictures>[]
 * @parent pictureListSettings
 *
 * @param sbWinPictures
 * @text On Victory
 * @desc Standing pictures shown upon battle victory.
 * You can define multiple by state, switch, or remaining HP%.
 * @default []
 * @type struct<sbWinPictures>[]
 * @parent pictureListSettings
 *
 * @param sbActionPictures
 * @text On Action (Attack/Defense/Skill/Counter)
 * @desc Standing pictures shown when attacking, using a skill, or item.
 * You can define multiple by state, switch, or remaining HP%.
 * @default []
 * @type struct<sbActionPictures>[]
 * @parent pictureListSettings
 *
 * @param sbItemPictures
 * @text On Item Use
 * @desc Standing pictures shown when using items.
 * You can define multiple by state, switch, or remaining HP%.
 * @default []
 * @type struct<sbItemPictures>[]
 * @parent pictureListSettings
 *
 * @param counterSettings
 * @text Counter Settings
 * @desc *Not used
 *
 * @param showCounterAttack
 * @text Show on Counter
 * @desc Display standing picture on counterattack.
 * The picture assigned to the attack skill is shown.
 * @default true
 * @type boolean
 * @parent counterSettings
 *
 * @param showMagicReflection
 * @text Show on Magic Reflection
 * @desc Display standing picture on magic reflection.
 * The picture assigned to the reflected skill is shown.
 * @default true
 * @type boolean
 * @parent counterSettings
 *
 * @param startActorType
 * @text Actor Shown at Battle Start
 * @desc Actor to display at Fight/Escape selection.
 * Command picture is shown.
 * @type select
 * @default none
 * @option Do not display
 * @value none
 * @option First Actor
 * @value firstActor
 * @option Random
 * @value randomActor
 *
 * @param winActorType
 * @text Actor Shown at Victory
 * @desc Actor to display at battle victory.
 * @type select
 * @default lastActor
 * @option Do not display
 * @value none
 * @option Last Action Actor
 * @value lastActor
 * @option First Actor
 * @value firstActor
 * @option Random
 * @value randomActor
 *
 * @param hiddenEnemyWindow
 * @text Hide on Enemy Select
 * @desc Hide standing pictures when selecting enemy.
 * @default true
 * @type boolean
 *
 * @param hiddenActorWindow
 * @text Hide on Actor Select
 * @desc Hide standing pictures when selecting actor target.
 * @default false
 * @type boolean
 *
 * @param deathBeforeStates
 * @text Judge State Before Death
 * @desc Judge standing picture based on previous state at death.
 * Turn OFF if you want a dedicated death picture.
 * @default false
 * @type boolean
 * 
 * @param maxPictureWidth
 * @text 最大图片宽度
 * @desc 立绘的最大宽度限制，超过此值将自动缩放
 * @default 660
 * @min 100
 * @max 2000
 * @type number
 * 
 * @param maxPictureHeight
 * @text 最大图片高度
 * @desc 立绘的最大高度限制，超过此值将自动缩放
 * @default 600
 * @min 100
 * @max 2000
 * @type number
 * 
 * @param globalOffsetX
 * @text 全局X轴偏移
 * @desc 所有立绘的X轴基础偏移量，单位像素
 * @default 0
 * @min -9999
 * @max 9999
 * @type number
 *
 * @param globalOffsetY
 * @text 全局Y轴偏移
 * @desc 所有立绘的Y轴基础偏移量，单位像素
 * @default 0
 * @min -9999
 * @max 9999
 * @type number
 */

/*~struct~sbCommandPictures:
 *
 * @param memo
 * @text Memo
 * @desc Notes for easy identification in list. Has no effect.
 * @type string
 *
 * @param actorId
 * @text Actor ID
 * @desc Select the actor to assign standing picture.
 * @type actor
 *
 * @param stateId
 * @text State ID
 * @desc Change standing picture for specific state.
 * Leave blank for default.
 * @type state
 *
 * @param switchId
 * @text Switch ID
 * @desc Change standing picture if switch is ON.
 * Leave blank for default.
 * @type switch
 *
 * @param variableCase
 * @text Variable Condition
 * @desc Change standing picture if variable condition is met.
 * @default
 * @type struct<variableCase>
 *
 * @param hpPercentage
 * @text Remaining HP%
 * @desc Change standing picture based on remaining HP%.
 * Default standing picture should be set to 100%.
 * @default 100
 * @min 0
 * @max 100
 * @type number
 *
 * @param imageName
 * @text Image File
 * @desc Select image file to display.
 * @dir img/pictures
 * @type file
 * @require 1
 *
 * @param origin
 * @text Origin
 * @desc Origin point of standing picture.
 * @default upperleft
 * @type select
 * @option Upper Left
 * @value upperleft
 * @option Center
 * @value center
 *
 * @param x
 * @text X Position
 * @desc X coordinate of standing picture.
 * @default 464
 * @min -9999
 * @max 9999
 * @type number
 *
 * @param y
 * @text Y Position
 * @desc Y coordinate of standing picture.
 * @default 96
 * @min -9999
 * @max 9999
 * @type number
 *
 * @param scaleX
 * @text Scale X
 * @desc Scale rate X.
 * @default 100
 * @min -2000
 * @max 2000
 * @type number
 *
 * @param scaleY
 * @text Scale Y
 * @desc Scale rate Y.
 * @default 100
 * @min -2000
 * @max 2000
 * @type number
 *
 * @param motion
 * @text Motion
 * @desc Select playback motion.
 * @default floatrightfast
 * @type select
 * @option None
 * @value none
 * @option Float In Right (Command)
 * @value floatrightfast
 * @option Float In Left (Command)
 * @value floatleftfast
 * @option Nod
 * @value yes
 * @option Jump
 * @value jump
 * @option Loop Jump
 * @value jumploop
 * @option Shake Loop
 * @value shakeloop
 * @option Sway Loop
 * @value noslowloop
 * @option Breathing
 * @value breathing
 * @option Breathing (Stretch)
 * @value breathing2
 * @option Shake (Damage)
 * @value damage
 * @option Float In Right (Victory)
 * @value floatright
 * @option Float In Left (Victory)
 * @value floatleft
 * @option Step Left (Attack)
 * @value stepleft
 * @option Step Right (Attack)
 * @value stepright
 * @option Head Down (Defense)
 * @value headdown
 */

/*~struct~sbDamagePictures:
 *
 * @param memo
 * @text Memo
 * @desc Notes for easy identification in list. Has no effect.
 * @type string
 *
 * @param actorId
 * @text Actor ID
 * @desc Select the actor to assign standing picture.
 * @type actor
 *
 * @param stateId
 * @text State ID
 * @desc Change standing picture for specific state.
 * Leave blank for default.
 * @type state
 *
 * @param switchId
 * @text Switch ID
 * @desc Change standing picture if switch is ON.
 * Leave blank for default.
 * @type switch
 *
 * @param variableCase
 * @text Variable Condition
 * @desc Change standing picture if variable condition is met.
 * @default
 * @type struct<variableCase>
 *
 * @param hpPercentage
 * @text Remaining HP%
 * @desc Change standing picture based on remaining HP%.
 * Default standing picture should be set to 100%.
 * @default 100
 * @min 0
 * @max 100
 * @type number
 *
 * @param imageName
 * @text Image File
 * @desc Select image file to display.
 * @dir img/pictures
 * @type file
 * @require 1
 *
 * @param origin
 * @text Origin
 * @desc Origin point of standing picture.
 * @default upperleft
 * @type select
 * @option Upper Left
 * @value upperleft
 * @option Center
 * @value center
 *
 * @param x
 * @text X Position
 * @desc X coordinate of standing picture.
 * @default 464
 * @min -9999
 * @max 9999
 * @type number
 *
 * @param y
 * @text Y Position
 * @desc Y coordinate of standing picture.
 * @default 96
 * @min -9999
 * @max 9999
 * @type number
 *
 * @param scaleX
 * @text Scale X
 * @desc Scale rate X.
 * @default 100
 * @min -2000
 * @max 2000
 * @type number
 *
 * @param scaleY
 * @text Scale Y
 * @desc Scale rate Y.
 * @default 100
 * @min -2000
 * @max 2000
 * @type number
 *
 * @param motion
 * @text Motion
 * @desc Select playback motion.
 * @default damage
 * @type select
 * @option None
 * @value none
 * @option Float In Right (Command)
 * @value floatrightfast
 * @option Float In Left (Command)
 * @value floatleftfast
 * @option Nod
 * @value yes
 * @option Jump
 * @value jump
 * @option Loop Jump
 * @value jumploop
 * @option Shake Loop
 * @value shakeloop
 * @option Sway Loop
 * @value noslowloop
 * @option Breathing
 * @value breathing
 * @option Breathing (Stretch)
 * @value breathing2
 * @option Shake (Damage)
 * @value damage
 * @option Float In Right (Victory)
 * @value floatright
 * @option Float In Left (Victory)
 * @value floatleft
 * @option Step Left (Attack)
 * @value stepleft
 * @option Step Right (Attack)
 * @value stepright
 * @option Head Down (Defense)
 * @value headdown
 */

/*~struct~sbEvasionPictures:
 *
 * @param memo
 * @text Memo
 * @desc Notes for easy identification in list. Has no effect.
 * @type string
 *
 * @param actorId
 * @text Actor ID
 * @desc Select the actor to assign standing picture.
 * @type actor
 *
 * @param stateId
 * @text State ID
 * @desc Change standing picture for specific state.
 * Leave blank for default.
 * @type state
 *
 * @param switchId
 * @text Switch ID
 * @desc Change standing picture if switch is ON.
 * Leave blank for default.
 * @type switch
 *
 * @param variableCase
 * @text Variable Condition
 * @desc Change standing picture if variable condition is met.
 * @default
 * @type struct<variableCase>
 *
 * @param hpPercentage
 * @text Remaining HP%
 * @desc Change standing picture based on remaining HP%.
 * Default standing picture should be set to 100%.
 * @default 100
 * @min 0
 * @max 100
 * @type number
 *
 * @param imageName
 * @text Image File
 * @desc Select image file to display.
 * @dir img/pictures
 * @type file
 * @require 1
 *
 * @param origin
 * @text Origin
 * @desc Origin point of standing picture.
 * @default upperleft
 * @type select
 * @option Upper Left
 * @value upperleft
 * @option Center
 * @value center
 *
 * @param x
 * @text X Position
 * @desc X coordinate of standing picture.
 * @default 464
 * @min -9999
 * @max 9999
 * @type number
 *
 * @param y
 * @text Y Position
 * @desc Y coordinate of standing picture.
 * @default 96
 * @min -9999
 * @max 9999
 * @type number
 *
 * @param scaleX
 * @text Scale X
 * @desc Scale rate X.
 * @default 100
 * @min -2000
 * @max 2000
 * @type number
 *
 * @param scaleY
 * @text Scale Y
 * @desc Scale rate Y.
 * @default 100
 * @min -2000
 * @max 2000
 * @type number
 *
 * @param motion
 * @text Motion
 * @desc Select playback motion.
 * @default stepright
 * @type select
 * @option None
 * @value none
 * @option Float In Right (Command)
 * @value floatrightfast
 * @option Float In Left (Command)
 * @value floatleftfast
 * @option Nod
 * @value yes
 * @option Jump
 * @value jump
 * @option Loop Jump
 * @value jumploop
 * @option Shake Loop
 * @value shakeloop
 * @option Sway Loop
 * @value noslowloop
 * @option Breathing
 * @value breathing
 * @option Breathing (Stretch)
 * @value breathing2
 * @option Shake (Damage)
 * @value damage
 * @option Float In Right (Victory)
 * @value floatright
 * @option Float In Left (Victory)
 * @value floatleft
 * @option Step Left (Attack)
 * @value stepleft
 * @option Step Right (Attack)
 * @value stepright
 * @option Head Down (Defense)
 * @value headdown
 */

/*~struct~sbWinPictures:
 *
 * @param memo
 * @text Memo
 * @desc Notes for easy identification in list. Has no effect.
 * @type string
 *
 * @param actorId
 * @text Actor ID
 * @desc Select the actor to assign standing picture.
 * @type actor
 *
 * @param stateId
 * @text State ID
 * @desc Change standing picture for specific state.
 * Leave blank for default.
 * @type state
 *
 * @param switchId
 * @text Switch ID
 * @desc Change standing picture if switch is ON.
 * Leave blank for default.
 * @type switch
 *
 * @param variableCase
 * @text Variable Condition
 * @desc Change standing picture if variable condition is met.
 * @default
 * @type struct<variableCase>
 *
 * @param hpPercentage
 * @text Remaining HP%
 * @desc Change standing picture based on remaining HP%.
 * Default standing picture should be set to 100%.
 * @default 100
 * @min 0
 * @max 100
 * @type number
 *
 * @param imageName
 * @text Image File
 * @desc Select image file to display.
 * @dir img/pictures
 * @type file
 * @require 1
 *
 * @param origin
 * @text Origin
 * @desc Origin point of standing picture.
 * @default upperleft
 * @type select
 * @option Upper Left
 * @value upperleft
 * @option Center
 * @value center
 *
 * @param x
 * @text X Position
 * @desc X coordinate of standing picture.
 * @default 464
 * @min -9999
 * @max 9999
 * @type number
 *
 * @param y
 * @text Y Position
 * @desc Y coordinate of standing picture.
 * @default 96
 * @min -9999
 * @max 9999
 * @type number
 *
 * @param scaleX
 * @text Scale X
 * @desc Scale rate X.
 * @default 100
 * @min -2000
 * @max 2000
 * @type number
 *
 * @param scaleY
 * @text Scale Y
 * @desc Scale rate Y.
 * @default 100
 * @min -2000
 * @max 2000
 * @type number
 *
 * @param motion
 * @text Motion
 * @desc Select playback motion.
 * @default floatright
 * @type select
 * @option None
 * @value none
 * @option Float In Right (Command)
 * @value floatrightfast
 * @option Float In Left (Command)
 * @value floatleftfast
 * @option Nod
 * @value yes
 * @option Jump
 * @value jump
 * @option Loop Jump
 * @value jumploop
 * @option Shake Loop
 * @value shakeloop
 * @option Sway Loop
 * @value noslowloop
 * @option Breathing
 * @value breathing
 * @option Breathing (Stretch)
 * @value breathing2
 * @option Shake (Damage)
 * @value damage
 * @option Float In Right (Victory)
 * @value floatright
 * @option Float In Left (Victory)
 * @value floatleft
 * @option Step Left (Attack)
 * @value stepleft
 * @option Step Right (Attack)
 * @value stepright
 * @option Head Down (Defense)
 * @value headdown
 */

/*~struct~sbActionPictures:
 *
 * @param memo
 * @text Memo
 * @desc Notes for easy identification in list. Has no effect.
 * @type string
 *
 * @param actorId
 * @text Actor ID
 * @desc Select the actor to assign standing picture.
 * @type actor
 *
 * @param itemId
 * @text Skill ID
 * @desc Standing picture is displayed when this skill is used.
 * Leave blank to apply to all actions (attack, defense, skills).
 * @type skill
 *
 * @param stateId
 * @text State ID
 * @desc Change standing picture for specific state.
 * Leave blank for default.
 * @type state
 *
 * @param switchId
 * @text Switch ID
 * @desc Change standing picture if switch is ON.
 * Leave blank for default.
 * @type switch
 *
 * @param variableCase
 * @text Variable Condition
 * @desc Change standing picture if variable condition is met.
 * @default
 * @type struct<variableCase>
 *
 * @param hpPercentage
 * @text Remaining HP%
 * @desc Change standing picture based on remaining HP%.
 * Default standing picture should be set to 100%.
 * @default 100
 * @min 0
 * @max 100
 * @type number
 *
 * @param imageName
 * @text Image File
 * @desc Select image file to display.
 * @dir img/pictures
 * @type file
 * @require 1
 *
 * @param origin
 * @text Origin
 * @desc Origin point of standing picture.
 * @default upperleft
 * @type select
 * @option Upper Left
 * @value upperleft
 * @option Center
 * @value center
 *
 * @param x
 * @text X Position
 * @desc X coordinate of standing picture.
 * @default 464
 * @min -9999
 * @max 9999
 * @type number
 *
 * @param y
 * @text Y Position
 * @desc Y coordinate of standing picture.
 * @default 96
 * @min -9999
 * @max 9999
 * @type number
 *
 * @param scaleX
 * @text Scale X
 * @desc Scale rate X.
 * @default 100
 * @min -2000
 * @max 2000
 * @type number
 *
 * @param scaleY
 * @text Scale Y
 * @desc Scale rate Y.
 * @default 100
 * @min -2000
 * @max 2000
 * @type number
 *
 * @param motion
 * @text Motion
 * @desc Select playback motion.
 * @default floatrightfast
 * @type select
 * @option None
 * @value none
 * @option Float In Right (Command)
 * @value floatrightfast
 * @option Float In Left (Command)
 * @value floatleftfast
 * @option Nod
 * @value yes
 * @option Jump
 * @value jump
 * @option Loop Jump
 * @value jumploop
 * @option Shake Loop
 * @value shakeloop
 * @option Sway Loop
 * @value noslowloop
 * @option Breathing
 * @value breathing
 * @option Breathing (Stretch)
 * @value breathing2
 * @option Shake (Damage)
 * @value damage
 * @option Float In Right (Victory)
 * @value floatright
 * @option Float In Left (Victory)
 * @value floatleft
 * @option Step Left (Attack)
 * @value stepleft
 * @option Step Right (Attack)
 * @value stepright
 * @option Head Down (Defense)
 * @value headdown
 */

/*~struct~sbItemPictures:
 *
 * @param memo
 * @text Memo
 * @desc Notes for easy identification in list. Has no effect.
 * @type string
 *
 * @param actorId
 * @text Actor ID
 * @desc Select the actor to assign standing picture.
 * @type actor
 *
 * @param itemId
 * @text Item ID
 * @desc Standing picture is displayed when this item is used.
 * Leave blank to apply to all items.
 * @type item
 *
 * @param stateId
 * @text State ID
 * @desc Change standing picture for specific state.
 * Leave blank for default.
 * @type state
 *
 * @param switchId
 * @text Switch ID
 * @desc Change standing picture if switch is ON.
 * Leave blank for default.
 * @type switch
 *
 * @param variableCase
 * @text Variable Condition
 * @desc Change standing picture if variable condition is met.
 * @default
 * @type struct<variableCase>
 *
 * @param hpPercentage
 * @text Remaining HP%
 * @desc Change standing picture based on remaining HP%.
 * Default standing picture should be set to 100%.
 * @default 100
 * @min 0
 * @max 100
 * @type number
 *
 * @param imageName
 * @text Image File
 * @desc Select image file to display.
 * @dir img/pictures
 * @type file
 * @require 1
 *
 * @param origin
 * @text Origin
 * @desc Origin point of standing picture.
 * @default upperleft
 * @type select
 * @option Upper Left
 * @value upperleft
 * @option Center
 * @value center
 *
 * @param x
 * @text X Position
 * @desc X coordinate of standing picture.
 * @default 464
 * @min -9999
 * @max 9999
 * @type number
 *
 * @param y
 * @text Y Position
 * @desc Y coordinate of standing picture.
 * @default 96
 * @min -9999
 * @max 9999
 * @type number
 *
 * @param scaleX
 * @text Scale X
 * @desc Scale rate X.
 * @default 100
 * @min -2000
 * @max 2000
 * @type number
 *
 * @param scaleY
 * @text Scale Y
 * @desc Scale rate Y.
 * @default 100
 * @min -2000
 * @max 2000
 * @type number
 *
 * @param motion
 * @text Motion
 * @desc Select playback motion.
 * @default floatrightfast
 * @type select
 * @option None
 * @value none
 * @option Float In Right (Command)
 * @value floatrightfast
 * @option Float In Left (Command)
 * @value floatleftfast
 * @option Nod
 * @value yes
 * @option Jump
 * @value jump
 * @option Loop Jump
 * @value jumploop
 * @option Shake Loop
 * @value shakeloop
 * @option Sway Loop
 * @value noslowloop
 * @option Breathing
 * @value breathing
 * @option Breathing (Stretch)
 * @value breathing2
 * @option Shake (Damage)
 * @value damage
 * @option Float In Right (Victory)
 * @value floatright
 * @option Float In Left (Victory)
 * @value floatleft
 * @option Step Left (Attack)
 * @value stepleft
 * @option Step Right (Attack)
 * @value stepright
 * @option Head Down (Defense)
 * @value headdown
 */

/*~struct~variableCase:
 *
 * @param id
 * @text Variable ID
 * @desc Variable ID used for the condition.
 * @type variable
 *
 * @param type
 * @text Variable Condition
 * @desc Comparison condition with variable value.
 * @default equal
 * @type select
 * @option Equal
 * @value equal
 * @option Greater or Equal
 * @value higher
 * @option Less or Equal
 * @value lower
 *
 * @param value
 * @text Variable Value
 * @desc Value to compare with the variable.
 * @default 0
 * @min -99999999
 * @max 99999999
 * @type number
 */

/*:ja
 * @target MV
 * @plugindesc 戦闘中に立ち絵を自動表示します。
 * @author ルルの教会
 * @url https://nine-yusha.com/plugin-sbpicture/
 *
 * @help LL_StandingPictureBattleMV.js
 *
 * 戦闘中、下記のタイミングで立ち絵を自動表示します。
 *   ・戦闘開始時 (戦う・逃げる選択時)
 *   ・コマンド選択時
 *   ・被ダメージ時
 *   ・回避時
 *   ・勝利時
 *   ・攻撃、防御、スキル発動時
 *   ・反撃、魔法反射時
 *   ・アイテム使用時
 *   ・戦闘勝利時
 *
 * 下記のようにステート、スイッチ、変数条件で表示する立ち絵を複数定義できます。
 *   ・スイッチ1がONかつ毒状態の立ち絵
 *   ・変数1が10以上かつ毒状態の立ち絵
 *   ・スイッチ1がONの時の立ち絵
 *   ・毒状態の立ち絵
 *   ・スイッチ・ステート・変数条件なしの通常立ち絵 (最低限必要)
 *
 * 残りHP％で立ち絵を切り替える:
 *   まず「残りHP％」を「100」に設定した立ち絵リストを作成します。
 *   上記をコピーして「残りHP％」を「50」に変更し、立ち絵リストを複製します。
 *   これでHPが半分以下になった場合、「50」に設定した立ち絵が呼ばれます。
 *   残りHP％毎に、複数立ち絵を定義することも可能です。
 *
 * 画像ファイルの表示優先順:
 *   1. ステートID、スイッチID、変数条件全てに一致するもの
 *   2. ステートID、スイッチID両方に一致するもの
 *   3. ステートID、変数条件両方に一致するもの
 *   4. ステートIDのみ一致するもの
 *   5. スイッチID、変数条件両方に一致するもの
 *   6. スイッチIDのみ一致するもの
 *   7. 変数条件のみ一致するもの
 *   8. 条件なし (ステートID、スイッチID、変数条件全て設定なし)
 *   (上記の中で、残りHP％が最も低いものが優先して表示されます)
 *
 * 画像を反転させたい場合:
 *   X拡大率に「-100」と入力すると画像が反転します。
 *   (原点を左上にしている場合、X座標が画像横幅分左にずれます)
 *
 * 反撃、魔法反射時の立ち絵表示:
 *   反撃時は、攻撃のスキルに割り当てられた立ち絵が表示されます。
 *   魔法反射時は、反射したスキルに割り当てられた立ち絵が表示されます。
 *
 * プラグインコマンド:
 *   LL_StandingPictureBattleMV setEnabled true   # 立ち絵を表示に設定
 *   LL_StandingPictureBattleMV setEnabled false  # 立ち絵を非表示に設定
 *
 * 利用規約:
 *   ・著作権表記は必要ございません。
 *   ・利用するにあたり報告の必要は特にございません。
 *   ・商用・非商用問いません。
 *   ・R18作品にも使用制限はありません。
 *   ・ゲームに合わせて自由に改変していただいて問題ございません。
 *   ・プラグイン素材としての再配布（改変後含む）は禁止させていただきます。
 *
 * 作者: ルルの教会
 * 作成日: 2022/6/3
 *
 * @command setEnabled
 * @text 立ち絵表示ON・OFF
 * @desc 立ち絵の表示・非表示を一括制御します。
 *
 * @arg enabled
 * @text 立ち絵表示
 * @desc OFFにすると立ち絵が表示されなくなります。
 * @default true
 * @type boolean
 *
 * @param pictureListSettings
 * @text 立ち絵リスト
 * @desc ※この項目は使用しません
 *
 * @param sbCommandPictures
 * @text コマンド選択時
 * @desc コマンド選択中に表示する立ち絵を定義します。
 * ステート、スイッチ、残HP％毎に立ち絵を複数定義できます。
 * @default []
 * @type struct<sbCommandPictures>[]
 * @parent pictureListSettings
 *
 * @param sbDamagePictures
 * @text ダメージ時
 * @desc ダメージ時に表示する立ち絵を定義します。
 * ステート、スイッチ、残HP％毎に立ち絵を複数定義できます。
 * @default []
 * @type struct<sbDamagePictures>[]
 * @parent pictureListSettings
 *
 * @param sbEvasionPictures
 * @text 回避時
 * @desc 回避時に表示する立ち絵を定義します。
 * ステート、スイッチ、残HP％毎に立ち絵を複数定義できます。
 * @default []
 * @type struct<sbEvasionPictures>[]
 * @parent pictureListSettings
 *
 * @param sbWinPictures
 * @text 勝利時
 * @desc 戦闘勝利時に表示する立ち絵を定義します。
 * ステート、スイッチ、残HP％毎に立ち絵を複数定義できます。
 * @default []
 * @type struct<sbWinPictures>[]
 * @parent pictureListSettings
 *
 * @param sbActionPictures
 * @text 攻撃、防御、スキル、反撃
 * @desc 攻撃、スキル、アイテム使用時に表示する立ち絵を定義します。
 * ステート、スイッチ、残HP％毎に立ち絵を複数定義できます。
 * @default []
 * @type struct<sbActionPictures>[]
 * @parent pictureListSettings
 *
 * @param sbItemPictures
 * @text アイテム使用時
 * @desc アイテム使用時に表示する立ち絵を定義します。
 * ステート、スイッチ、残HP％毎に立ち絵を複数定義できます。
 * @default []
 * @type struct<sbItemPictures>[]
 * @parent pictureListSettings
 *
 * @param counterSettings
 * @text 反撃時の設定
 * @desc ※この項目は使用しません
 *
 * @param showCounterAttack
 * @text 反撃時に立ち絵を表示
 * @desc 反撃時に立ち絵を表示します。
 * 攻撃のスキルに割り当てられた立ち絵が表示されます。
 * @default true
 * @type boolean
 * @parent counterSettings
 *
 * @param showMagicReflection
 * @text 魔法反射時に立ち絵を表示
 * @desc 魔法反射時に立ち絵を表示します。
 * 反射したスキルに割り当てられた立ち絵が表示されます。
 * @default true
 * @type boolean
 * @parent counterSettings
 *
 * @param startActorType
 * @text 戦闘開始時の表示アクター
 * @desc 戦う・逃げる選択時に表示されるアクターを選択してください。
 * コマンド選択時の立ち絵が表示されます。
 * @type select
 * @default none
 * @option 表示しない
 * @value none
 * @option 先頭のアクター
 * @value firstActor
 * @option ランダム
 * @value randomActor
 *
 * @param winActorType
 * @text 戦闘勝利時の表示アクター
 * @desc 戦闘勝利時に表示されるアクターを選択してください。
 * @type select
 * @default lastActor
 * @option 表示しない
 * @value none
 * @option 最後に行動したアクター
 * @value lastActor
 * @option 先頭のアクター
 * @value firstActor
 * @option ランダム
 * @value randomActor
 *
 * @param hiddenEnemyWindow
 * @text 敵選択時は非表示
 * @desc 敵選択時は立ち絵を非表示にします。
 * @default true
 * @type boolean
 *
 * @param hiddenActorWindow
 * @text 対象アクター選択時は非表示
 * @desc 対象アクター選択時は立ち絵を非表示にします。
 * @default false
 * @type boolean
 *
 * @param deathBeforeStates
 * @text 死亡時の直前ステート判定
 * @desc 死亡時に直前のステート状態で立ち絵を判定します。
 * 死亡時に専用の立ち絵を表示する場合はオフにしてください。
 * @default false
 * @type boolean
 */

/*~struct~sbCommandPictures:ja
 *
 * @param memo
 * @text メモ欄
 * @desc リスト一覧で確認しやすいようにメモを記載できます。
 * この項目は機能に一切影響しません。
 * @type string
 *
 * @param actorId
 * @text アクターID
 * @desc アクターIDです。立ち絵を定義するアクターを選択してください。
 * @type actor
 *
 * @param stateId
 * @text ステートID
 * @desc 特定ステートで立ち絵を変更したい場合に使用します。
 * 通常時の立ち絵は空白(なし)で設定してください。
 * @type state
 *
 * @param switchId
 * @text スイッチID
 * @desc スイッチONで立ち絵を変更したい場合に使用します。
 * 通常時の立ち絵は空白(なし)で設定してください。
 * @type switch
 *
 * @param variableCase
 * @text 変数条件
 * @desc 変数条件で立ち絵を変更したい場合に使用します。
 * @default
 * @type struct<variableCase>
 *
 * @param hpPercentage
 * @text 残りHP％
 * @desc 残りHP％で立ち絵を変更したい場合に使用します。
 * 通常時の立ち絵は100％で設定してください。
 * @default 100
 * @min 0
 * @max 100
 * @type number
 *
 * @param imageName
 * @text 画像ファイル名
 * @desc 立ち絵として表示する画像ファイルを選択してください。
 * @dir img/pictures
 * @type file
 * @require 1
 *
 * @param origin
 * @text 原点
 * @desc 立ち絵の原点です。
 * @default upperleft
 * @type select
 * @option 左上
 * @value upperleft
 * @option 中央
 * @value center
 *
 * @param x
 * @text X座標
 * @desc 立ち絵の表示位置(X)です。
 * @default 464
 * @min -9999
 * @max 9999
 * @type number
 *
 * @param y
 * @text Y座標
 * @desc 立ち絵の表示位置(Y)です。
 * @default 96
 * @min -9999
 * @max 9999
 * @type number
 *
 * @param scaleX
 * @text X拡大率
 * @desc 立ち絵の拡大率(X)です。
 * @default 100
 * @min -2000
 * @max 2000
 * @type number
 *
 * @param scaleY
 * @text Y拡大率
 * @desc 立ち絵の拡大率(Y)です。
 * @default 100
 * @min -2000
 * @max 2000
 * @type number
 *
 * @param motion
 * @text モーション
 * @desc 再生モーションを選択してください。
 * @default floatrightfast
 * @type select
 * @option なし
 * @value none
 * @option 右からフロートイン (コマンド)
 * @value floatrightfast
 * @option 左からフロートイン (コマンド)
 * @value floatleftfast
 * @option 頷く
 * @value yes
 * @option ジャンプ
 * @value jump
 * @option 繰り返しジャンプ
 * @value jumploop
 * @option ガクガクし続ける
 * @value shakeloop
 * @option 横に揺れ続ける
 * @value noslowloop
 * @option 息づかい風
 * @value breathing
 * @option 息づかい風 (伸縮)
 * @value breathing2
 * @option 揺れる (ダメージ)
 * @value damage
 * @option 右からフロートイン (勝利)
 * @value floatright
 * @option 左からフロートイン (勝利)
 * @value floatleft
 * @option 左へスライド (攻撃)
 * @value stepleft
 * @option 右へスライド (攻撃)
 * @value stepright
 * @option 頭を下げる (防御)
 * @value headdown
 */

/*~struct~sbDamagePictures:ja
 *
 * @param memo
 * @text メモ欄
 * @desc リスト一覧で確認しやすいようにメモを記載できます。
 * この項目は機能に一切影響しません。
 * @type string
 *
 * @param actorId
 * @text アクターID
 * @desc アクターIDです。立ち絵を定義するアクターを選択してください。
 * @type actor
 *
 * @param stateId
 * @text ステートID
 * @desc 特定ステートで立ち絵を変更したい場合に使用します。
 * 通常時の立ち絵は空白(なし)で設定してください。
 * @type state
 *
 * @param switchId
 * @text スイッチID
 * @desc スイッチONで立ち絵を変更したい場合に使用します。
 * 通常時の立ち絵は空白(なし)で設定してください。
 * @type switch
 *
 * @param variableCase
 * @text 変数条件
 * @desc 変数条件で立ち絵を変更したい場合に使用します。
 * @default
 * @type struct<variableCase>
 *
 * @param hpPercentage
 * @text 残りHP％
 * @desc 残りHP％で立ち絵を変更したい場合に使用します。
 * 通常時の立ち絵は100％で設定してください。
 * @default 100
 * @min 0
 * @max 100
 * @type number
 *
 * @param imageName
 * @text 画像ファイル名
 * @desc 立ち絵として表示する画像ファイルを選択してください。
 * @dir img/pictures
 * @type file
 * @require 1
 *
 * @param origin
 * @text 原点
 * @desc 立ち絵の原点です。
 * @default upperleft
 * @type select
 * @option 左上
 * @value upperleft
 * @option 中央
 * @value center
 *
 * @param x
 * @text X座標
 * @desc 立ち絵の表示位置(X)です。
 * @default 464
 * @min -9999
 * @max 9999
 * @type number
 *
 * @param y
 * @text Y座標
 * @desc 立ち絵の表示位置(Y)です。
 * @default 96
 * @min -9999
 * @max 9999
 * @type number
 *
 * @param scaleX
 * @text X拡大率
 * @desc 立ち絵の拡大率(X)です。
 * @default 100
 * @min -2000
 * @max 2000
 * @type number
 *
 * @param scaleY
 * @text Y拡大率
 * @desc 立ち絵の拡大率(Y)です。
 * @default 100
 * @min -2000
 * @max 2000
 * @type number
 *
 * @param motion
 * @text モーション
 * @desc 再生モーションを選択してください。
 * @default damage
 * @type select
 * @option なし
 * @value none
 * @option 右からフロートイン (コマンド)
 * @value floatrightfast
 * @option 左からフロートイン (コマンド)
 * @value floatleftfast
 * @option 頷く
 * @value yes
 * @option ジャンプ
 * @value jump
 * @option 繰り返しジャンプ
 * @value jumploop
 * @option ガクガクし続ける
 * @value shakeloop
 * @option 横に揺れ続ける
 * @value noslowloop
 * @option 息づかい風
 * @value breathing
 * @option 息づかい風 (伸縮)
 * @value breathing2
 * @option 揺れる (ダメージ)
 * @value damage
 * @option 右からフロートイン (勝利)
 * @value floatright
 * @option 左からフロートイン (勝利)
 * @value floatleft
 * @option 左へスライド (攻撃)
 * @value stepleft
 * @option 右へスライド (攻撃)
 * @value stepright
 * @option 頭を下げる (防御)
 * @value headdown
 */

/*~struct~sbEvasionPictures:ja
 *
 * @param memo
 * @text メモ欄
 * @desc リスト一覧で確認しやすいようにメモを記載できます。
 * この項目は機能に一切影響しません。
 * @type string
 *
 * @param actorId
 * @text アクターID
 * @desc アクターIDです。立ち絵を定義するアクターを選択してください。
 * @type actor
 *
 * @param stateId
 * @text ステートID
 * @desc 特定ステートで立ち絵を変更したい場合に使用します。
 * 通常時の立ち絵は空白(なし)で設定してください。
 * @type state
 *
 * @param switchId
 * @text スイッチID
 * @desc スイッチONで立ち絵を変更したい場合に使用します。
 * 通常時の立ち絵は空白(なし)で設定してください。
 * @type switch
 *
 * @param variableCase
 * @text 変数条件
 * @desc 変数条件で立ち絵を変更したい場合に使用します。
 * @default
 * @type struct<variableCase>
 *
 * @param hpPercentage
 * @text 残りHP％
 * @desc 残りHP％で立ち絵を変更したい場合に使用します。
 * 通常時の立ち絵は100％で設定してください。
 * @default 100
 * @min 0
 * @max 100
 * @type number
 *
 * @param imageName
 * @text 画像ファイル名
 * @desc 立ち絵として表示する画像ファイルを選択してください。
 * @dir img/pictures
 * @type file
 * @require 1
 *
 * @param origin
 * @text 原点
 * @desc 立ち絵の原点です。
 * @default upperleft
 * @type select
 * @option 左上
 * @value upperleft
 * @option 中央
 * @value center
 *
 * @param x
 * @text X座標
 * @desc 立ち絵の表示位置(X)です。
 * @default 464
 * @min -9999
 * @max 9999
 * @type number
 *
 * @param y
 * @text Y座標
 * @desc 立ち絵の表示位置(Y)です。
 * @default 96
 * @min -9999
 * @max 9999
 * @type number
 *
 * @param scaleX
 * @text X拡大率
 * @desc 立ち絵の拡大率(X)です。
 * @default 100
 * @min -2000
 * @max 2000
 * @type number
 *
 * @param scaleY
 * @text Y拡大率
 * @desc 立ち絵の拡大率(Y)です。
 * @default 100
 * @min -2000
 * @max 2000
 * @type number
 *
 * @param motion
 * @text モーション
 * @desc 再生モーションを選択してください。
 * @default stepright
 * @type select
 * @option なし
 * @value none
 * @option 右からフロートイン (コマンド)
 * @value floatrightfast
 * @option 左からフロートイン (コマンド)
 * @value floatleftfast
 * @option 頷く
 * @value yes
 * @option ジャンプ
 * @value jump
 * @option 繰り返しジャンプ
 * @value jumploop
 * @option ガクガクし続ける
 * @value shakeloop
 * @option 横に揺れ続ける
 * @value noslowloop
 * @option 息づかい風
 * @value breathing
 * @option 息づかい風 (伸縮)
 * @value breathing2
 * @option 揺れる (ダメージ)
 * @value damage
 * @option 右からフロートイン (勝利)
 * @value floatright
 * @option 左からフロートイン (勝利)
 * @value floatleft
 * @option 左へスライド (攻撃)
 * @value stepleft
 * @option 右へスライド (攻撃)
 * @value stepright
 * @option 頭を下げる (防御)
 * @value headdown
 */

/*~struct~sbWinPictures:ja
 *
 * @param memo
 * @text メモ欄
 * @desc リスト一覧で確認しやすいようにメモを記載できます。
 * この項目は機能に一切影響しません。
 * @type string
 *
 * @param actorId
 * @text アクターID
 * @desc アクターIDです。立ち絵を定義するアクターを選択してください。
 * @type actor
 *
 * @param stateId
 * @text ステートID
 * @desc 特定ステートで立ち絵を変更したい場合に使用します。
 * 通常時の立ち絵は空白(なし)で設定してください。
 * @type state
 *
 * @param switchId
 * @text スイッチID
 * @desc スイッチONで立ち絵を変更したい場合に使用します。
 * 通常時の立ち絵は空白(なし)で設定してください。
 * @type switch
 *
 * @param variableCase
 * @text 変数条件
 * @desc 変数条件で立ち絵を変更したい場合に使用します。
 * @default
 * @type struct<variableCase>
 *
 * @param hpPercentage
 * @text 残りHP％
 * @desc 残りHP％で立ち絵を変更したい場合に使用します。
 * 通常時の立ち絵は100％で設定してください。
 * @default 100
 * @min 0
 * @max 100
 * @type number
 *
 * @param imageName
 * @text 画像ファイル名
 * @desc 立ち絵として表示する画像ファイルを選択してください。
 * @dir img/pictures
 * @type file
 * @require 1
 *
 * @param origin
 * @text 原点
 * @desc 立ち絵の原点です。
 * @default upperleft
 * @type select
 * @option 左上
 * @value upperleft
 * @option 中央
 * @value center
 *
 * @param x
 * @text X座標
 * @desc 立ち絵の表示位置(X)です。
 * @default 464
 * @min -9999
 * @max 9999
 * @type number
 *
 * @param y
 * @text Y座標
 * @desc 立ち絵の表示位置(Y)です。
 * @default 96
 * @min -9999
 * @max 9999
 * @type number
 *
 * @param scaleX
 * @text X拡大率
 * @desc 立ち絵の拡大率(X)です。
 * @default 100
 * @min -2000
 * @max 2000
 * @type number
 *
 * @param scaleY
 * @text Y拡大率
 * @desc 立ち絵の拡大率(Y)です。
 * @default 100
 * @min -2000
 * @max 2000
 * @type number
 *
 * @param motion
 * @text モーション
 * @desc 再生モーションを選択してください。
 * @default floatright
 * @type select
 * @option なし
 * @value none
 * @option 右からフロートイン (コマンド)
 * @value floatrightfast
 * @option 左からフロートイン (コマンド)
 * @value floatleftfast
 * @option 頷く
 * @value yes
 * @option ジャンプ
 * @value jump
 * @option 繰り返しジャンプ
 * @value jumploop
 * @option ガクガクし続ける
 * @value shakeloop
 * @option 横に揺れ続ける
 * @value noslowloop
 * @option 息づかい風
 * @value breathing
 * @option 息づかい風 (伸縮)
 * @value breathing2
 * @option 揺れる (ダメージ)
 * @value damage
 * @option 右からフロートイン (勝利)
 * @value floatright
 * @option 左からフロートイン (勝利)
 * @value floatleft
 * @option 左へスライド (攻撃)
 * @value stepleft
 * @option 右へスライド (攻撃)
 * @value stepright
 * @option 頭を下げる (防御)
 * @value headdown
 */

/*~struct~sbActionPictures:ja
 *
 * @param memo
 * @text メモ欄
 * @desc リスト一覧で確認しやすいようにメモを記載できます。
 * この項目は機能に一切影響しません。
 * @type string
 *
 * @param actorId
 * @text アクターID
 * @desc アクターIDです。立ち絵を定義するアクターを選択してください。
 * @type actor
 *
 * @param itemId
 * @text スキルID
 * @desc このスキルが発動された時に立ち絵が表示されます。
 * なしの場合、攻撃、防御含め全スキル発動時に表示されます。
 * @type skill
 *
 * @param stateId
 * @text ステートID
 * @desc 特定ステートで立ち絵を変更したい場合に使用します。
 * 通常時の立ち絵は空白(なし)で設定してください。
 * @type state
 *
 * @param switchId
 * @text スイッチID
 * @desc スイッチONで立ち絵を変更したい場合に使用します。
 * 通常時の立ち絵は空白(なし)で設定してください。
 * @type switch
 *
 * @param variableCase
 * @text 変数条件
 * @desc 変数条件で立ち絵を変更したい場合に使用します。
 * @default
 * @type struct<variableCase>
 *
 * @param hpPercentage
 * @text 残りHP％
 * @desc 残りHP％で立ち絵を変更したい場合に使用します。
 * 通常時の立ち絵は100％で設定してください。
 * @default 100
 * @min 0
 * @max 100
 * @type number
 *
 * @param imageName
 * @text 画像ファイル名
 * @desc 立ち絵として表示する画像ファイルを選択してください。
 * @dir img/pictures
 * @type file
 * @require 1
 *
 * @param origin
 * @text 原点
 * @desc 立ち絵の原点です。
 * @default upperleft
 * @type select
 * @option 左上
 * @value upperleft
 * @option 中央
 * @value center
 *
 * @param x
 * @text X座標
 * @desc 立ち絵の表示位置(X)です。
 * @default 464
 * @min -9999
 * @max 9999
 * @type number
 *
 * @param y
 * @text Y座標
 * @desc 立ち絵の表示位置(Y)です。
 * @default 96
 * @min -9999
 * @max 9999
 * @type number
 *
 * @param scaleX
 * @text X拡大率
 * @desc 立ち絵の拡大率(X)です。
 * @default 100
 * @min -2000
 * @max 2000
 * @type number
 *
 * @param scaleY
 * @text Y拡大率
 * @desc 立ち絵の拡大率(Y)です。
 * @default 100
 * @min -2000
 * @max 2000
 * @type number
 *
 * @param motion
 * @text モーション
 * @desc 再生モーションを選択してください。
 * @default floatrightfast
 * @type select
 * @option なし
 * @value none
 * @option 右からフロートイン (コマンド)
 * @value floatrightfast
 * @option 左からフロートイン (コマンド)
 * @value floatleftfast
 * @option 頷く
 * @value yes
 * @option ジャンプ
 * @value jump
 * @option 繰り返しジャンプ
 * @value jumploop
 * @option ガクガクし続ける
 * @value shakeloop
 * @option 横に揺れ続ける
 * @value noslowloop
 * @option 息づかい風
 * @value breathing
 * @option 息づかい風 (伸縮)
 * @value breathing2
 * @option 揺れる (ダメージ)
 * @value damage
 * @option 右からフロートイン (勝利)
 * @value floatright
 * @option 左からフロートイン (勝利)
 * @value floatleft
 * @option 左へスライド (攻撃)
 * @value stepleft
 * @option 右へスライド (攻撃)
 * @value stepright
 * @option 頭を下げる (防御)
 * @value headdown
 */

/*~struct~sbItemPictures:ja
 *
 * @param memo
 * @text メモ欄
 * @desc リスト一覧で確認しやすいようにメモを記載できます。
 * この項目は機能に一切影響しません。
 * @type string
 *
 * @param actorId
 * @text アクターID
 * @desc アクターIDです。立ち絵を定義するアクターを選択してください。
 * @type actor
 *
 * @param itemId
 * @text アイテムID
 * @desc このアイテムを使用した時に立ち絵が表示されます。
 * なしにすると全アイテム使用時に表示されます。
 * @type item
 *
 * @param stateId
 * @text ステートID
 * @desc 特定ステートで立ち絵を変更したい場合に使用します。
 * 通常時の立ち絵は空白(なし)で設定してください。
 * @type state
 *
 * @param switchId
 * @text スイッチID
 * @desc スイッチONで立ち絵を変更したい場合に使用します。
 * 通常時の立ち絵は空白(なし)で設定してください。
 * @type switch
 *
 * @param variableCase
 * @text 変数条件
 * @desc 変数条件で立ち絵を変更したい場合に使用します。
 * @default
 * @type struct<variableCase>
 *
 * @param hpPercentage
 * @text 残りHP％
 * @desc 残りHP％で立ち絵を変更したい場合に使用します。
 * 通常時の立ち絵は100％で設定してください。
 * @default 100
 * @min 0
 * @max 100
 * @type number
 *
 * @param imageName
 * @text 画像ファイル名
 * @desc 立ち絵として表示する画像ファイルを選択してください。
 * @dir img/pictures
 * @type file
 * @require 1
 *
 * @param origin
 * @text 原点
 * @desc 立ち絵の原点です。
 * @default upperleft
 * @type select
 * @option 左上
 * @value upperleft
 * @option 中央
 * @value center
 *
 * @param x
 * @text X座標
 * @desc 立ち絵の表示位置(X)です。
 * @default 464
 * @min -9999
 * @max 9999
 * @type number
 *
 * @param y
 * @text Y座標
 * @desc 立ち絵の表示位置(Y)です。
 * @default 96
 * @min -9999
 * @max 9999
 * @type number
 *
 * @param scaleX
 * @text X拡大率
 * @desc 立ち絵の拡大率(X)です。
 * @default 100
 * @min -2000
 * @max 2000
 * @type number
 *
 * @param scaleY
 * @text Y拡大率
 * @desc 立ち絵の拡大率(Y)です。
 * @default 100
 * @min -2000
 * @max 2000
 * @type number
 *
 * @param motion
 * @text モーション
 * @desc 再生モーションを選択してください。
 * @default floatrightfast
 * @type select
 * @option なし
 * @value none
 * @option 右からフロートイン (コマンド)
 * @value floatrightfast
 * @option 左からフロートイン (コマンド)
 * @value floatleftfast
 * @option 頷く
 * @value yes
 * @option ジャンプ
 * @value jump
 * @option 繰り返しジャンプ
 * @value jumploop
 * @option ガクガクし続ける
 * @value shakeloop
 * @option 横に揺れ続ける
 * @value noslowloop
 * @option 息づかい風
 * @value breathing
 * @option 息づかい風 (伸縮)
 * @value breathing2
 * @option 揺れる (ダメージ)
 * @value damage
 * @option 右からフロートイン (勝利)
 * @value floatright
 * @option 左からフロートイン (勝利)
 * @value floatleft
 * @option 左へスライド (攻撃)
 * @value stepleft
 * @option 右へスライド (攻撃)
 * @value stepright
 * @option 頭を下げる (防御)
 * @value headdown
 */

/*~struct~variableCase:ja
 *
 * @param id
 * @text 変数ID
 * @desc 条件に使用する変数IDです。
 * @type variable
 *
 * @param type
 * @text 変数条件
 * @desc 変数IDとの比較条件です。
 * @default equal
 * @type select
 * @option 一致する
 * @value equal
 * @option 以上
 * @value higher
 * @option 以下
 * @value lower
 *
 * @param value
 * @text 変数比較数値
 * @desc 変数IDと比較する数値です。
 * @default 0
 * @min -99999999
 * @max 99999999
 * @type number
 */

(function() {
 "use strict";
 var pluginName = "LL_StandingPictureBattleMV";

 // 1. 新增位置边界检查函数
 function clampPicturePosition(x, y, width, height) {
     // 获取屏幕边界
     const screenWidth = Graphics.width;
     const screenHeight = Graphics.height;
     // 计算调整后的X坐标（确保不超出左右边界）
     let clampedX = x;
     if (clampedX < 0) {
         clampedX = 0;
     } else if (clampedX + width > screenWidth){
         clampedX = screenWidth -width;
     }
     // 计算调整后的Y坐标（确保不超出上下边界）
     let clampedY = y;
     if (clampedY < 0) {
         clampedY = 0;
     } else if (clampedY + height > screenHeight){
         clampedY = screenHeight- height;
     }
     return { x: clampedX, y: clampedY };
 }


 var parameters = PluginManager.parameters(pluginName);
 var paramJsonParse = function(key, value) {
  try {
   return JSON.parse(value);
  } catch(e) {
   return value;
  }
 };

 var sbCommandPictures = String(parameters["sbCommandPictures"] || "[]");
 var sbDamagePictures = String(parameters["sbDamagePictures"] || "[]");
 var sbEvasionPictures = String(parameters["sbEvasionPictures"] || "[]");
 var sbWinPictures = String(parameters["sbWinPictures"] || "[]");
 var sbActionPictures = String(parameters["sbActionPictures"] || "[]");
 var sbItemPictures = String(parameters["sbItemPictures"] || "[]");
 var startActorType = String(parameters["startActorType"] || "none");
 var winActorType = String(parameters["winActorType"] || "lastActor");
 var hiddenEnemyWindow = eval(parameters["hiddenEnemyWindow"] || "true");
 var hiddenActorWindow = eval(parameters["hiddenActorWindow"] || "false");
 var deathBeforeStates = eval(parameters["deathBeforeStates"] || "false");

 // 【新增】获取最大宽度和高度参数
 var maxPictureWidth = Number(parameters["maxPictureWidth"] ||400);
 var maxPictureHeight = Number(parameters["maxPictureHeight"] ||600);

 // 【新增】获取全局偏移参数
 var globalOffsetX = Number(parameters["globalOffsetX"] || 0);
 var globalOffsetY = Number(parameters["globalOffsetY"] || 0);

 // 反撃時の設定
 var showCounterAttack = eval(parameters["showCounterAttack"] || "true");
 var showMagicReflection = eval(parameters["showMagicReflection"] || "true");

 var sbCommandPictureLists = JSON.parse(JSON.stringify(sbCommandPictures, paramJsonParse));
 var sbDamagePictureLists = JSON.parse(JSON.stringify(sbDamagePictures, paramJsonParse));
 var sbEvasionPictureLists = JSON.parse(JSON.stringify(sbEvasionPictures, paramJsonParse));
 var sbWinPictureLists = JSON.parse(JSON.stringify(sbWinPictures, paramJsonParse));
 var sbActionPictureLists = JSON.parse(JSON.stringify(sbActionPictures, paramJsonParse));
 var sbItemPictureLists = JSON.parse(JSON.stringify(sbItemPictures, paramJsonParse));

 // Plugin Command (for MV)
 var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === pluginName) {
            switch (args[0]) {
    case 'setEnabled':
     var enabled = eval(args[1] || "true");
     $gameSystem._StandingPictureBattleDisabled = !enabled;
     break;
            }
        }
 };

 // 【新增】计算图片缩放比例的函数
 function calculateScaleRatio(originalWidth, originalHeight,maxWidth, maxHeight) {
    // 计算宽度和高度的缩放比例
    const widthRatio = maxWidth / originalWidth;
    const heightRatio = maxHeight / originalHeight;
    // 取最小的缩放比例以保证图片完全在限制范围内
    return Math.min(widthRatio, heightRatio, 1); // 不放大图片，只缩小
}


 // 独自変数定義
 var animationCount = 0;
 var refSbPicture = false;
 var motionSbPicture = "";
 var showDamageActorId = null;
 var showActionActorId = null;
 var showEvasionActorId = null;
 var activeCommandActorId = null;
 var activeDamageActorId = null;
 var activeActionActorId = null;
 var activeActionItemId = null;
 var activeActionDataClass = null;
 // 命令选择阶段的透明度动画相关变量
 var commandPhaseTimer = 0;
 var isInCommandPhase = false;
 var commandPhaseOpacity = 0;  // 当前透明度值
 var commandPhaseState = 0;    // 动画状态: 0=透明阶段, 1=渐显阶段, 2=不透明阶段, 3=渐隐阶段
 // 【新增】缓存命令窗口坐标变量
 var cachedCommandWindowX = 0;
 var cachedCommandWindowY = 0;
 var cachedCommandWindowWidth = 100;
 var cachedCommandWindowHeight = 100;

 // 【新增】技能/物品立绘不透明度渐变动画相关变量
 var actionPhaseTimer = 0;        // 技能/物品使用时的计时器
 var actionPhaseOpacity = 0;      // 技能/物品使用时的当前透明度
 var actionPhaseState = 0;        // 技能/物品使用时的动画状态: 0=透明阶段, 1=渐显阶段, 2=不透明阶段, 3=渐隐阶段
 var isInActionPhase = false;     // 是否在技能/物品使用阶段

 // アニメーションフレーム数定義
 var animationFrame = {
  "yes":            24,
  "yesyes":         48,
  "no":             24,
  "noslow":         48,
  "jump":           24,
  "jumpjump":       48,
  "jumploop":       48,
  "shake":          1,
  "shakeloop":      1,
  "runleft":        1,
  "runright":       1,
  "damage":         1,
  "floatrightfast": 12,
  "floatright":     48,
  "floatleftfast":  12,
  "floatleft":      48,
  "noslowloop":     96,
  "breathing":      96,
  "breathing2":     96,
  "stepleft":       24,
  "stepright":      24,
  "headdown":       12,
  "none":           0
 };

 //-----------------------------------------------------------------------------
 // 画像ファイル名を取得
 //-----------------------------------------------------------------------------
 var getImageName = function(actorId, pictureLists, itemId) {
  if (!pictureLists) return;

  // for Before ES5
  if (typeof itemId === 'undefined') {
   itemId = null;
  }

  // アクターのステート情報を取得
  var actorStates = [];
  if (actorId) {
   actorStates = $gameActors.actor(actorId)._states;

   // 死亡時に直前のステートIDで判定するか？
   if (actorStates.indexOf(1) !== -1 && deathBeforeStates) {
    actorStates = $gameActors.actor(actorId).beforeStates();
   }
  }
  var specificPicture = null;

  // アクターIDが一致する立ち絵を検索
  pictureLists = pictureLists.filter(function(item) {
   if (Number(item.actorId) == actorId) {
    return true;
   }
  });

  // アイテムID(スキルID)が指定されているか？
  // (処理を共通化するため、ここではskillIdも便宜的にitemIdとして扱う)
  if (itemId !== null) {
   pictureLists = pictureLists.filter(function(item) {
    if (Number(item.itemId) == itemId) {
     return true;
    }
   });
  }

  // ステートにかかっているか？
  if (actorStates.length) {
   // ステートID・スイッチID・変数IDが有効な立ち絵リストを検索
   specificPicture = pictureLists.filter(function(item) {
    if (item.variableCase) {
     if (
      actorStates.indexOf(Number(item.stateId)) !== -1 &&
      $gameSwitches.value(Number(item.switchId)) &&
      (
       String(item.variableCase.type) == "equal" && $gameVariables.value(Number(item.variableCase.id)) == Number(item.variableCase.value) ||
       String(item.variableCase.type) == "higher" && $gameVariables.value(Number(item.variableCase.id)) >= Number(item.variableCase.value) ||
       String(item.variableCase.type) == "lower" && $gameVariables.value(Number(item.variableCase.id)) <= Number(item.variableCase.value)
      )
     ) {
      return true;
     }
    }
   });
   if (specificPicture.length) return checkHpPercentage(actorId, specificPicture);
   // ステートID・スイッチIDが有効な立ち絵リストを検索
   specificPicture = pictureLists.filter(function(item) {
    if (actorStates.indexOf(Number(item.stateId)) !== -1 && $gameSwitches.value(Number(item.switchId)) && !item.variableCase) {
     return true;
    }
   });
   if (specificPicture.length) return checkHpPercentage(actorId, specificPicture);
   // ステートID・変数IDが有効な立ち絵リストを検索
   specificPicture = pictureLists.filter(function(item) {
    if (item.variableCase) {
     if (
      actorStates.indexOf(Number(item.stateId)) !== -1 &&
      (Number(item.switchId) === 0 || !item.switchId) &&
      (
       String(item.variableCase.type) == "equal" && $gameVariables.value(Number(item.variableCase.id)) == Number(item.variableCase.value) ||
       String(item.variableCase.type) == "higher" && $gameVariables.value(Number(item.variableCase.id)) >= Number(item.variableCase.value) ||
       String(item.variableCase.type) == "lower" && $gameVariables.value(Number(item.variableCase.id)) <= Number(item.variableCase.value)
      )
     ) {
      return true;
     }
    }
   });
   if (specificPicture.length) return checkHpPercentage(actorId, specificPicture);
   // ステートIDが有効な立ち絵リストを検索
   specificPicture = pictureLists.filter(function(item) {
    if (actorStates.indexOf(Number(item.stateId)) !== -1 && (Number(item.switchId) === 0 || !item.switchId) && !item.variableCase) {
     return true;
    }
   });
   if (specificPicture.length) return checkHpPercentage(actorId, specificPicture);
  }

  // スイッチID・変数IDが有効な立ち絵リストを検索
  specificPicture = pictureLists.filter(function(item) {
   if (item.variableCase) {
    if (
     (Number(item.stateId) === 0 || !item.stateId) &&
     $gameSwitches.value(Number(item.switchId)) &&
     (
      String(item.variableCase.type) == "equal" && $gameVariables.value(Number(item.variableCase.id)) == Number(item.variableCase.value) ||
      String(item.variableCase.type) == "higher" && $gameVariables.value(Number(item.variableCase.id)) >= Number(item.variableCase.value) ||
      String(item.variableCase.type) == "lower" && $gameVariables.value(Number(item.variableCase.id)) <= Number(item.variableCase.value)
     )
    ) {
     return true;
    }
   }
  });
  if (specificPicture.length) return checkHpPercentage(actorId, specificPicture);
  // スイッチIDが有効な立ち絵リストを検索
  specificPicture = pictureLists.filter(function(item) {
   if ((Number(item.stateId) === 0 || !item.stateId) && $gameSwitches.value(Number(item.switchId)) && !item.variableCase) {
    return true;
   }
  });
  if (specificPicture.length) return checkHpPercentage(actorId, specificPicture);
  // 変数IDが有効な立ち絵リストを検索
  specificPicture = pictureLists.filter(function(item) {
   if (item.variableCase) {
    if (
     (Number(item.stateId) === 0 || !item.stateId) &&
     (Number(item.switchId) === 0 || !item.switchId) &&
     (
      String(item.variableCase.type) == "equal" && $gameVariables.value(Number(item.variableCase.id)) == Number(item.variableCase.value) ||
      String(item.variableCase.type) == "higher" && $gameVariables.value(Number(item.variableCase.id)) >= Number(item.variableCase.value) ||
      String(item.variableCase.type) == "lower" && $gameVariables.value(Number(item.variableCase.id)) <= Number(item.variableCase.value)
     )
    ) {
     return true;
    }
   }
  });
  if (specificPicture.length) return checkHpPercentage(actorId, specificPicture);

  // 上記で見つからなかった場合、通常の立ち絵を検索
  let normalPicture = pictureLists.filter(function(item) {
   if ((Number(item.stateId) === 0 || !item.stateId) && (Number(item.switchId) === 0 || !item.switchId) && !item.variableCase) return true;
  });
  if (normalPicture.length) return checkHpPercentage(actorId, normalPicture);
 };

 var checkHpPercentage = function(actorId, pictureLists) {
  // アクターの残HP％を取得
  var hpRate = getHpRate(actorId);
  // 最もHP%が低い立ち絵を適用する
  var minHpRate = 100;
  var result = null;
  pictureLists.forEach(function(item) {
   if (hpRate <= Number(item.hpPercentage) && minHpRate >= Number(item.hpPercentage)) {
    result = item;
    minHpRate = Number(item.hpPercentage);
   } else if (!item.hpPercentage && minHpRate >= 100) {
    // プラグインパラメータが更新されていない場合、便宜的に100として扱う
    result = item;
    minHpRate = Number(item.hpPercentage);
   }
  });
  return result;
 }

 // アクターのHPレートを取得
 var getHpRate = function(actorId) {
  if (!$gameActors.actor(actorId)) return 0;
  return $gameActors.actor(actorId).mhp > 0 ? $gameActors.actor(actorId).hp / $gameActors.actor(actorId).mhp * 100 : 0;
 }

 // Battle Managerを拡張
 BattleManager.isPhase = function() {
  return this._phase;
 };

 // Game Partyを拡張
 Game_Party.prototype.aliveBattleMembers = function() {
  // return this.allMembers()
  //  .slice(0, this.maxBattleMembers())
  //  .filter(actor => actor.isAppeared())
  //  .filter(actor => actor.isAlive());

  // for Ver.1.5.1
  return this.allMembers().slice(0, this.maxBattleMembers()).filter(function(actor) {
   return actor.isAppeared();
  }).filter(function(actor) {
   return actor.isAlive();
  });
 };
 // Game_Party.prototype.firstBattleMember = function() {
 //  return this.allMembers()
 //   .slice(0, 1)
 //   .filter(actor => actor.isAppeared());
 // };
 // Game_Party.prototype.randomBattleMenber = function() {
 //  var r = Math.randomInt(this.maxBattleMembers());
 //  return this.allMembers()
 //   .slice(r, r + 1)
 //   .filter(actor => actor.isAppeared());
 // };

 var _Game_Battler_performActionStart = Game_Battler.prototype.performActionStart;
 Game_Battler.prototype.performActionStart = function(action) {
  _Game_Battler_performActionStart.apply(this, arguments);
  // スキルIDを取得
  activeActionItemId = action._item._itemId;
  activeActionDataClass = action._item._dataClass;
  // アクターIDを取得
  showActionActorId = action._subjectActorId;
  // リフレッシュ
  activeActionActorId = null;
  // 【修复】重置技能/物品使用阶段的计时器，确保从0开始
  actionPhaseTimer = 0;
  actionPhaseOpacity = 0;
  actionPhaseState = 0;
 };

 var _Game_Battler_performDamage = Game_Battler.prototype.performDamage;
 Game_Battler.prototype.performDamage = function() {
  _Game_Battler_performDamage.apply(this, arguments);
  // ダメージを受けたアクターIDを取得
  showDamageActorId = this._actorId;
  showEvasionActorId = null;
  // リフレッシュ
  activeDamageActorId = null;
 };

 var _Game_Battler_performEvasion = Game_Battler.prototype.performEvasion;
 Game_Battler.prototype.performEvasion = function() {
  _Game_Battler_performEvasion.apply(this, arguments);
  // アクターIDを取得
  showEvasionActorId = this._actorId;
  showDamageActorId = null;
  // リフレッシュ
  activeDamageActorId = null;
 };

 // 死亡時の直前ステートIDを保持するため、Game_BattlerBaseを拡張
 var _Game_BattlerBase_initMembers = Game_BattlerBase.prototype.initMembers;
 Game_BattlerBase.prototype.initMembers = function() {
  _Game_BattlerBase_initMembers.apply(this, arguments);

  this._beforeStates = [];
 };

 var _Game_BattlerBase_die = Game_BattlerBase.prototype.die;
 Game_BattlerBase.prototype.die = function() {
  this._beforeStates = this._states;

  _Game_BattlerBase_die.apply(this, arguments);
 };

 Game_BattlerBase.prototype.beforeStates = function() {
  return this._beforeStates;
 };

 var _BattleManager_invokeCounterAttack = BattleManager.invokeCounterAttack;
 BattleManager.invokeCounterAttack = function(subject, target) {
  _BattleManager_invokeCounterAttack.apply(this, arguments);

  if (!showCounterAttack) return;

  if (target) {
   // スキルIDを取得
   activeActionItemId = target.attackSkillId();
   activeActionDataClass = "skill";
   // アクターIDを取得
   showActionActorId = target._actorId;
   showDamageActorId = null;
   // リフレッシュ
   activeActionActorId = null;
  }
 };

 var _BattleManager_invokeMagicReflection = BattleManager.invokeMagicReflection;
 BattleManager.invokeMagicReflection = function(subject, target) {
  _BattleManager_invokeMagicReflection.apply(this, arguments);

  if (!showMagicReflection) return;

  if (target) {
   // スキルIDを取得
   activeActionItemId = this._action._item._itemId;
   activeActionDataClass = this._action._item._dataClass;
   // アクターIDを取得
   showActionActorId = target._actorId;
   showDamageActorId = null;
   // リフレッシュ
   activeActionActorId = null;
  }
 };

 //-----------------------------------------------------------------------------
 // ExStandingPictureBattle
 //
 // 戦闘中立ち絵を表示する独自のクラスを追加定義します。

 class ExStandingPictureBattle {

  static create (elm) {
   // 立ち絵1
   elm._spbSprite = new Sprite_LL_SPicture();
   elm.addChild(elm._spbSprite);
   // バトル開始・終了フラグをオフ
   this._battleStart = false;
   this._battleEnd = false;
  }

 static update (elm) {
  // 初期設定
  var sbPicture = null;
  var isPhase = BattleManager.isPhase();
  var isInputting = BattleManager.isInputting();
  var isEscaped = BattleManager.isEscaped();
  var isAllDead = $gameParty.isAllDead();
  var commandActor = BattleManager.actor();
  
  // === 命令选择阶段状态管理 ===
  // 非命令选择阶段时重置状态
  if (isPhase !== "turn" && isPhase !== "input") {
   isInCommandPhase = false;
   commandPhaseTimer = 0;
  }
   if (BattleManager._action) {
    if (BattleManager._action._subjectActorId) {
     this._lastActionActorId = BattleManager._action._subjectActorId;
    }
   }
   //-----------------------------------------------------------------------------
   // ターン開始時
   //-----------------------------------------------------------------------------
   if (isPhase == "start") {
    if (!this._battleStart) {
     // 生存しているアクターを取得
     this._aliveBattleMembers = $gameParty.aliveBattleMembers();
     // 先頭アクターIDを取得
     this._firstActorId = this._aliveBattleMembers.length > 0 ? this._aliveBattleMembers[0]._actorId : null;
     // ランダムアクターID抽選
     this._randomActorId = this._aliveBattleMembers.length > 0 ? this._aliveBattleMembers[Math.floor(Math.random() * this._aliveBattleMembers.length)]._actorId : null;
     this._battleStart = true;
    }
   }
   //-----------------------------------------------------------------------------
   // ターン終了時
   //-----------------------------------------------------------------------------
   if (isPhase == "turnEnd") {
    // 生存しているアクターを取得
    this._aliveBattleMembers = $gameParty.aliveBattleMembers();
    // 先頭アクターIDを取得
    this._firstActorId = this._aliveBattleMembers.length > 0 ? this._aliveBattleMembers[0]._actorId : null;
    // ランダムアクターID抽選
    this._randomActorId = this._aliveBattleMembers.length > 0 ? this._aliveBattleMembers[Math.floor(Math.random() * this._aliveBattleMembers.length)]._actorId : null;
   }

   // 立ち絵を非表示に設定している場合、処理を中断
   if ($gameSystem._StandingPictureBattleDisabled) {
    elm._spbSprite.opacity = 0;
    return;
   }

   //-----------------------------------------------------------------------------
   // 戦闘終了時
   //-----------------------------------------------------------------------------
   if (isPhase == "battleEnd") {
    if (isEscaped) {
     // 逃走
    } else if (isAllDead) {
     // 全滅
    } else {
     if (!this._battleEnd) {
      // 生存しているアクターを取得
      var aliveBattleMembers = $gameParty.aliveBattleMembers();
      // 先頭アクターIDを取得
      this._firstActorId = aliveBattleMembers.length > 0 ? aliveBattleMembers[0]._actorId : null;
      // ランダムアクターID抽選
      this._randomActorId = aliveBattleMembers.length > 0 ? aliveBattleMembers[Math.floor(Math.random() * aliveBattleMembers.length)]._actorId : null;
     }
     if (winActorType == "lastActor") {
      sbPicture = getImageName(this._lastActionActorId, sbWinPictureLists);
     } else if (winActorType == "randomActor") {
      sbPicture = getImageName(this._randomActorId, sbWinPictureLists);
     } else if (winActorType == "firstActor") {
      sbPicture = getImageName(this._firstActorId, sbWinPictureLists);
     }
     if (!this._battleEnd) {
      if (sbPicture) {
       refSbPicture = true;
       motionSbPicture = sbPicture.motion;
       animationCount = animationFrame[motionSbPicture];
       elm._spbSprite.opacity = 0;
      }
     }
    }
    this._battleEnd = true;
   }
   //-----------------------------------------------------------------------------
   // 被ダメージ時 - Yanfly兼容性修复
   //-----------------------------------------------------------------------------
   if (showDamageActorId) {
    var isActionPhase = false;
    
    // 方法1：检测传统的"action"阶段
    if (isPhase == "action") {
     isActionPhase = true;
    }
   
    // 方法2：检测Yanfly特有的战斗流程
    if (Yanfly && Yanfly.Param && Yanfly.Param.BECShowSelectBox) {
     isActionPhase = true;
    }
    
    // 方法3：检测Yanfly动作序列阶段
    if (BattleManager._phase === 'actionList' || BattleManager._phase === 'actionTargetList' || 
        BattleManager._phase === 'phaseChange') {
     isActionPhase = true;
    }
    
    if (isActionPhase) {
     sbPicture = getImageName(showDamageActorId, sbDamagePictureLists);
     if (sbPicture) {
      if (activeDamageActorId != showDamageActorId) {
       activeDamageActorId = showDamageActorId;
       refSbPicture = true;
       motionSbPicture = sbPicture.motion;
       animationCount = animationFrame[motionSbPicture];
       elm._spbSprite.opacity = 0;
      }
     }
    } else {
     showDamageActorId = null;
     sbPicture = null;
    }
   }
   //-----------------------------------------------------------------------------
   // 回避時 - Yanfly兼容性修复
   //-----------------------------------------------------------------------------
   if (showEvasionActorId) {
    var isActionPhase = false;
    
    // 方法1：检测传统的"action"阶段
    if (isPhase == "action") {
     isActionPhase = true;
    }
   
    // 方法2：检测Yanfly特有的战斗流程
    if (Yanfly && Yanfly.Param && Yanfly.Param.BECShowSelectBox) {
     isActionPhase = true;
    }
    
    // 方法3：检测Yanfly动作序列阶段
    if (BattleManager._phase === 'actionList' || BattleManager._phase === 'actionTargetList' || 
        BattleManager._phase === 'phaseChange') {
     isActionPhase = true;
    }
    
    if (isActionPhase) {
     sbPicture = getImageName(showEvasionActorId, sbEvasionPictureLists);
     if (sbPicture) {
      if (activeDamageActorId != showEvasionActorId) {
       activeDamageActorId = showEvasionActorId;
       refSbPicture = true;
       motionSbPicture = sbPicture.motion;
       animationCount = animationFrame[motionSbPicture];
       elm._spbSprite.opacity = 0;
      }
     }
    } else {
     showEvasionActorId = null;
     sbPicture = null;
    }
   }
   //-----------------------------------------------------------------------------
   // アクション時 - Yanfly兼容性修复
   //-----------------------------------------------------------------------------
   if (!showDamageActorId && !showEvasionActorId) {
    var isActionPhase = false;
    
    // 方法1：检测传统的"action"阶段
    if (isPhase == "action") {
     isActionPhase = true;
    }
   
    // 方法2：检测Yanfly特有的战斗流程
    if (Yanfly && Yanfly.Param && Yanfly.Param.BECShowSelectBox) {
     isActionPhase = true;
    }
    
    // 方法3：检测Yanfly动作序列阶段
    if (BattleManager._phase === 'actionList' || BattleManager._phase === 'actionTargetList' || 
        BattleManager._phase === 'phaseChange') {
     isActionPhase = true;
    }
    
    if (isActionPhase) {
     // 【新增】设置技能/物品使用阶段状态
     isInActionPhase = true;
     actionPhaseTimer += 1;
     // 4秒一个循环 (假设60FPS，4秒=240帧)
     if (actionPhaseTimer >= 240) {
         actionPhaseTimer = 0;
         actionPhaseState = 0;
         actionPhaseOpacity = 0;
     }
     
     // スキル発動時
     if (activeActionDataClass == "skill") {
      sbPicture = getImageName(showActionActorId, sbActionPictureLists, activeActionItemId);
      // 見つからなかった場合、スキルIDなしの立ち絵を再検索
      if (!sbPicture) sbPicture = getImageName(showActionActorId, sbActionPictureLists, 0);
     }
     // アイテム使用時
     if (activeActionDataClass == "item") {
      sbPicture = getImageName(showActionActorId, sbItemPictureLists, activeActionItemId);
      // 見つからなかった場合、アイテムIDなしの立ち絵を再検索
      if (!sbPicture) sbPicture = getImageName(showActionActorId, sbItemPictureLists, 0);
     }
     if (sbPicture) {
      if (activeActionActorId != showActionActorId) {
       activeActionActorId = showActionActorId;
       refSbPicture = true;
       motionSbPicture = sbPicture.motion;
       animationCount = animationFrame[motionSbPicture];
       elm._spbSprite.opacity = 0;

       activeCommandActorId = null;
      }
     }
    } else {
     showActionActorId = null;
     // 【新增】重置技能/物品使用阶段的计时器和状态
     isInActionPhase = false;
     actionPhaseTimer = 0;
     actionPhaseState = 0;
     actionPhaseOpacity = 0;
    }
   }
   //-----------------------------------------------------------------------------
   // 戦う or 逃げる 選択時
   //-----------------------------------------------------------------------------
   if (isPhase == "turn" || isPhase == "input") {
    if (!commandActor && isInputting) {
     var selectStartActorId = null;
     if (startActorType == "firstActor") {
      sbPicture = getImageName(this._firstActorId, sbCommandPictureLists);
      selectStartActorId = this._firstActorId;
     } else if (startActorType == "randomActor") {
      sbPicture = getImageName(this._randomActorId, sbCommandPictureLists);
      selectStartActorId = this._randomActorId;
     }
     if (sbPicture) {
      sbPicture = JSON.parse(JSON.stringify(sbPicture));
      if (activeCommandActorId != selectStartActorId) {
       activeCommandActorId = selectStartActorId;
       refSbPicture = true;
       // 通常
       motionSbPicture = sbPicture.motion;
       animationCount = animationFrame[motionSbPicture];
       elm._spbSprite.opacity = 0;
      }
     }

    }
   }
   //-----------------------------------------------------------------------------
   // コマンド入力時
   //-----------------------------------------------------------------------------
   if (isPhase == "turn" || isPhase == "input") {
    if (commandActor) {
     sbPicture = getImageName(commandActor._actorId, sbCommandPictureLists);
     // HPレートを取得
     var hpRate = commandActor.mhp > 0 ? commandActor.hp / commandActor.mhp * 100 : 0;
     if (sbPicture) {
      sbPicture = JSON.parse(JSON.stringify(sbPicture));
      if (activeCommandActorId != commandActor._actorId) {
       activeCommandActorId = commandActor._actorId;
       refSbPicture = true;
       // 通常
       motionSbPicture = sbPicture.motion;
       animationCount = animationFrame[motionSbPicture];
       elm._spbSprite.opacity = 0;
      }
      // 敵選択時は非表示にする
      if (hiddenEnemyWindow) {
       if (elm._enemyWindow) {
        elm._spbSprite.visible = !elm._enemyWindow.active;
       }
      }

                // 対象アクター選択時は非表示にする
                if (hiddenActorWindow && elm._spbSprite.visible === true) {
                    if (elm._actorWindow) {
                        elm._spbSprite.visible = !elm._actorWindow.active;
                    }
                }
            }
            
            // === 命令选择阶段的透明度动画调用 ===
            if (isInCommandPhase && sbPicture && elm._spbSprite) {
                this.commandPhaseAnimation(elm._spbSprite);
            }
        }
    }
    
    // 命令选择阶段状态管理
    if ((isPhase == "turn" || isPhase == "input") && commandActor) {
        isInCommandPhase = true;
        commandPhaseTimer += 1;
        // 每3秒一个循环 (假设60FPS，3秒=180帧)
        if (commandPhaseTimer >= 180) {
            commandPhaseTimer = 0;
            commandPhaseState = 0;
            commandPhaseOpacity = 0;
        }
        
        // 【新增】在命令选择阶段，如果actorCommandWindow激活，则缓存其坐标
        const scene = SceneManager._scene;
        if (scene._actorCommandWindow && scene._actorCommandWindow.active) {
            cachedCommandWindowX = scene._actorCommandWindow.x;
            cachedCommandWindowY = scene._actorCommandWindow.y;
            cachedCommandWindowWidth = scene._actorCommandWindow.width;
            cachedCommandWindowHeight = scene._actorCommandWindow.height;
        }

// ... (上面是 // コマンド入力時 的代码块) ...

    } else {
        isInCommandPhase = false;
        commandPhaseTimer = 0;
        commandPhaseState = 0;
        commandPhaseOpacity = 0;
    }

   // --- 在这里插入代码：如果已经逃跑，强制清除立绘 ---
   if (isEscaped) {
       sbPicture = null;
       elm._spbSprite.opacity = 0;
   }

   // 立ち絵ピクチャ作成
   if (sbPicture && refSbPicture) {
    this.refresh(elm._spbSprite, sbPicture);
    refSbPicture = false;
   }

   // フェード処理の優先順位: 技能/物品使用阶段 > 命令选择阶段 > 通常处理
   if (isInActionPhase && sbPicture && (activeActionDataClass == "skill" || activeActionDataClass == "item")) {
    // 【新增】使用技能/物品使用阶段的特殊透明度动画
    this.actionPhaseAnimation(elm._spbSprite);
    this.actionPhaseFade(elm._spbSprite);  // 【修复】添加实际的透明度设置
   } else if (isInCommandPhase && sbPicture) {
    // 使用命令选择阶段的特殊透明度动画
    this.commandPhaseAnimation(elm._spbSprite);
    this.commandPhaseFade(elm._spbSprite);
   } else if (sbPicture) {
    this.fadeIn(elm._spbSprite, sbPicture);
   } else {
    this.fadeOut(elm._spbSprite, sbPicture);
   }

   // 立ち絵モーション再生
   if (animationCount > 0) {
    animationCount = this.animation(elm._spbSprite, motionSbPicture, animationCount);
   }
  }

  static refresh (sSprite, sPicture) {
   sSprite.setPicture(sPicture);
   sSprite.showing = false;
   var calcScaleX = Number(sPicture.scaleX);
   var calcScaleY = Number(sPicture.scaleY);
   // 画像が読み込まれたあとに実行
   sSprite.bitmap.addLoadListener(function() {
    // 【新增】计算图片缩放比例
    const scaleRatio = calculateScaleRatio(
      sSprite.bitmap.width, 
      sSprite.bitmap.height, 
      maxPictureWidth, 
      maxPictureHeight
    );
 
    // 【新增】应用缩放比例到原始缩放值上
    const finalScaleX = (calcScaleX / 100) *scaleRatio;
    const finalScaleY = (calcScaleY / 100) *scaleRatio;
 
    // 【核心修改】智能获取坐标源：命令阶段用当前窗口，动作阶段用缓存坐标
    let originX = 0;
    let originY = 0;
    let useCachedWindow = false;
    
    // 获取场景中的命令窗口
    const scene = SceneManager._scene;
    const currentPhase = BattleManager._phase;
    
    // 判断是否为命令选择阶段
    const isCommandPhase = currentPhase === "turn" || currentPhase === "input";
    
    // 判断是否为动作执行阶段
    const isActionPhase = 
        currentPhase === "action" || 
        currentPhase === 'actionList' || 
        currentPhase === 'actionTargetList' || 
        currentPhase === 'phaseChange' ||
        (Yanfly && Yanfly.Param && Yanfly.Param.BECShowSelectBox);
    
    if (isCommandPhase && scene._actorCommandWindow && scene._actorCommandWindow.active) {
        // 命令阶段：直接使用当前激活的命令窗口坐标
        originX = scene._actorCommandWindow.x;
        originY = scene._actorCommandWindow.y;
        useCachedWindow = false;
    } else if (isActionPhase && (cachedCommandWindowX !== 0 || cachedCommandWindowY !== 0)) {
        // 动作阶段：使用缓存的命令窗口坐标
        originX = cachedCommandWindowX;
        originY = cachedCommandWindowY;
        useCachedWindow = true;
    } else if (scene._actorCommandWindow && scene._actorCommandWindow.active) {
        // 其他情况下，如果命令窗口激活则使用当前坐标
        originX = scene._actorCommandWindow.x;
        originY = scene._actorCommandWindow.y;
        useCachedWindow = false;
    } else {
        // 无可用坐标时，使用默认值（可在后续通过插件参数进一步优化）
        originX = 0;
        originY = 0;
        useCachedWindow = false;
    }
 
    // 【修改】基于命令窗口坐标计算最终位置，叠加全局偏移和单个图片偏移
    let tempX, tempY;
    if (Number(sPicture.origin) != 1 &&String(sPicture.origin) != "center") {
        // 左上原点模式：命令窗口坐标 + 全局偏移 + 单个图片偏移
        tempX = originX +globalOffsetX + Number(sPicture.x);
        tempY = originY +globalOffsetY + Number(sPicture.y);
    } else {
        // 中央原点模式：根据是否使用缓存坐标计算中心点
        let centerX, centerY;
        if (useCachedWindow) {
            // 使用缓存坐标时，使用缓存的窗口尺寸计算中心
            centerX = originX + cachedCommandWindowWidth / 2;
            centerY = originY + cachedCommandWindowHeight / 2;
        } else {
            // 使用当前窗口时，使用实际窗口尺寸计算中心
            centerX = originX + (scene._actorCommandWindow ? scene._actorCommandWindow.width / 2 : 0);
            centerY = originY + (scene._actorCommandWindow ? scene._actorCommandWindow.height / 2 : 0);
        }
        tempX = centerX +globalOffsetX + Number(sPicture.x) - (sSprite.width * finalScaleX) / 2;
        tempY = centerY +globalOffsetY + Number(sPicture.y) - (sSprite.height * finalScaleY) / 2;
    }
 
    // 【新增】计算图片实际显示尺寸
    const displayWidth = sSprite.bitmap.width *finalScaleX;
    const displayHeight = sSprite.bitmap.height *finalScaleY;
 
    // 【新增】执行边界检查并调整位置
    const clampedPos = clampPicturePosition(tempX, tempY,displayWidth, displayHeight);
    sSprite.x = clampedPos.x;
    sSprite.y = clampedPos.y;
    sSprite.originX = sSprite.x;
    sSprite.originY = sSprite.y;
 
    // 切替効果
    if (sSprite.opacity == 0) {
     //
    }
    // 【修改】应用最终缩放值
    sSprite.scale.x = finalScaleX;
    sSprite.scale.y = finalScaleY;
    sSprite.showing = true;
    // 非表示状態リセット
    sSprite.visible = true;
   }.bind(this));
  }

  static fadeIn (sSprite, sPicture) {
   if (!sSprite.showing) return;
   if (sSprite.opacity >= 255) {
    sSprite.opening = false;
    sSprite.opacity = 255;
    return;
   }
   sSprite.opening = true;
   sSprite.closing = false;
   sSprite.opacity += 255;
   //RYQ改 源代码sSprite.opacity += 24 改成255是为了让他秒速显示//
  }

static fadeOut (sSprite, sPicture) {
   if (sSprite.opacity == 0) {
    activeCommandActorId = null;
    activeDamageActorId = null;
    activeActionActorId = null;
    sSprite.closing = false;
    return;
   }
   sSprite.closing = true;
   // 修改这里：直接让透明度变成 0，实现瞬间消失
   sSprite.opacity = 0; 
  }

  // 命令选择阶段的透明度动画
  static commandPhaseAnimation(sSprite) {
    // 根据当前状态更新透明度
    var frame = commandPhaseTimer;
    
    if (frame < 24) {
        // 0-0.4秒 (24帧): 完全透明
        sSprite.opacity = 0;
        commandPhaseState = 0;
        commandPhaseOpacity = 0;
    } else if (frame < 60) {
        // 0.4-1.0秒 (36帧): 渐显 (透明度0到255)
        commandPhaseState = 1;
        var progress = (frame - 24) / 36; // 0到1的进度
        commandPhaseOpacity = Math.floor(progress * 255);
        sSprite.opacity = commandPhaseOpacity;
    } else if (frame < 120) {
        // 1-2秒 (60帧): 保持不透明
        commandPhaseState = 2;
        commandPhaseOpacity = 255;
        sSprite.opacity = 255;
    } else if (frame < 156) {
        // 2-2.6秒 (36帧): 渐隐 (透明度255到0)
        commandPhaseState = 3;
        var progress = (frame - 120) / 36; // 0到1的进度
        commandPhaseOpacity = 255 - Math.floor(progress * 255);
        sSprite.opacity = commandPhaseOpacity;
    } else if (frame < 180) {
        // 2.6-3.0秒 (24帧): 完全透明
        commandPhaseState = 0;
        commandPhaseOpacity = 0;
        sSprite.opacity = 0;
    }
  }

  // 【新增】技能/物品使用阶段的透明度动画 (0-2秒的渐入渐出)
  static actionPhaseAnimation(sSprite) {
    // 根据当前状态更新透明度
    var frame = actionPhaseTimer;
    
    if (frame < 30) {
        // 0-0.5秒 (30帧): 渐入 (透明度0到255)
        actionPhaseState = 1;
        var progress = frame / 30; // 0到1的进度
        actionPhaseOpacity = Math.floor(progress * 255);
        sSprite.opacity = actionPhaseOpacity;
    } else if (frame < 90) {
        // 0.5-1.5秒 (60帧): 保持不透明
        actionPhaseState = 2;
        actionPhaseOpacity = 255;
        sSprite.opacity = 255;
    } else if (frame < 120) {
        // 1.5-2.0秒 (30帧): 渐出 (透明度255到0)
        actionPhaseState = 3;
        var progress = (frame - 90) / 30; // 0到1的进度
        actionPhaseOpacity = 255 - Math.floor(progress * 255);
        sSprite.opacity = actionPhaseOpacity;
    } else {
        // 2.0秒及以上: 完全透明，但保持技能/物品使用状态
        actionPhaseState = 0;
        actionPhaseOpacity = 0;
        sSprite.opacity = 0;
    }
  }

  // 命令选择阶段的淡入淡出处理
  static commandPhaseFade(sSprite) {
    // 使用命令选择阶段计算出的透明度，无需额外处理
    sSprite.opacity = commandPhaseOpacity;
  }

  // 【新增】技能/物品使用阶段的淡入淡出处理
  static actionPhaseFade(sSprite) {
    // 使用技能/物品使用阶段计算出的透明度，无需额外处理
    sSprite.opacity = actionPhaseOpacity;
  }

  static animation (sSprite, sMotion, animationCount) {
   if (!sSprite.showing) return animationCount;
   if (sMotion == "yes") {
    if (animationCount > 12) {
     sSprite.y += 2;
    } else {
     sSprite.y -= 2;
    }
    animationCount -= 1;
   }
   if (sMotion == "yesyes") {
    if (animationCount > 36) {
     sSprite.y += 2;
    } else if (animationCount > 24) {
     sSprite.y -= 2;
    } else if (animationCount > 12) {
     sSprite.y += 2;
    } else {
     sSprite.y -= 2;
    }
    animationCount -= 1;
   }
   if (sMotion == "no") {
    if (animationCount > 18) {
     sSprite.x += 2;
    } else if (animationCount > 6) {
     sSprite.x -= 2;
    } else {
     sSprite.x += 2;
    }
    animationCount -= 1;
   }
   if (sMotion == "noslow") {
    if (animationCount > 36) {
     sSprite.x += 1;
    } else if (animationCount > 12) {
     sSprite.x -= 1;
    } else {
     sSprite.x += 1;
    }
    animationCount -= 1;
   }
   if (sMotion == "jump") {
    if (animationCount > 12) {
     sSprite.y -= 2;
    } else {
     sSprite.y += 2;
    }
    animationCount -= 1;
   }
   if (sMotion == "jumpjump") {
    if (animationCount > 36) {
     sSprite.y -= 2;
    } else if (animationCount > 24) {
     sSprite.y += 2;
    } else if (animationCount > 12) {
     sSprite.y -= 2;
    } else {
     sSprite.y += 2;
    }
    animationCount -= 1;
   }
   if (sMotion == "jumploop") {
    if (animationCount > 36) {
     sSprite.y -= 2;
    } else if (animationCount > 24) {
     sSprite.y += 2;
    }
    animationCount -= 1;
    if (animationCount == 0) animationCount = animationFrame["jumploop"];
   }
   if (sMotion == "shake") {
    if (animationCount <= 2) {
     sSprite.x -= 2;
     animationCount += 1;
    } else if (animationCount <= 4) {
     sSprite.y -= 2;
     animationCount += 1;
    } else if (animationCount <= 6) {
     sSprite.x += 4;
     sSprite.y += 4;
     animationCount += 1;
    } else if (animationCount <= 8) {
     sSprite.y -= 2;
     animationCount += 1;
    } else if (animationCount == 9) {
     sSprite.x -= 2;
     animationCount += 1;
    } else if (animationCount == 10) {
     sSprite.x -= 2;
     animationCount = 0;
    }
   }
   if (sMotion == "shakeloop") {
    if (animationCount <= 2) {
     sSprite.x -= 1;
     animationCount += 1;
    } else if (animationCount <= 4) {
     sSprite.y -= 1;
     animationCount += 1;
    } else if (animationCount <= 6) {
     sSprite.x += 2;
     sSprite.y += 2;
     animationCount += 1;
    } else if (animationCount <= 8) {
     sSprite.y -= 1;
     animationCount += 1;
    } else if (animationCount <= 10) {
     sSprite.x -= 1;
     animationCount += 1;
    }
    if (animationCount > 10) animationCount = 1;
   }
   if (sMotion == "runleft") {
    sSprite.x -= 16;
    if (sSprite.x < -2000) animationCount = 0;
   }
   if (sMotion == "runright") {
    sSprite.x += 16;
    if (sSprite.x > 2000) animationCount = 0;
   }
   //
   if (sMotion == "damage") {
    if (animationCount <= 2) {
     sSprite.x -= 4;
     animationCount += 1;
    } else if (animationCount <= 4) {
     sSprite.y -= 4;
     animationCount += 1;
    } else if (animationCount <= 6) {
     sSprite.x += 8;
     sSprite.y += 8;
     animationCount += 1;
    } else if (animationCount <= 8) {
     sSprite.y -= 4;
     animationCount += 1;
    } else if (animationCount == 9) {
     sSprite.x -= 4;
     animationCount += 1;
    } else if (animationCount == 10) {
     sSprite.x -= 4;
     animationCount = 0;
    }
   }
   if (sMotion == "floatrightfast") {
    if (animationCount == 12) {
     sSprite.x += 22;
    } else {
     sSprite.x -= 2;
    }
    animationCount -= 1;
   }
   if (sMotion == "floatright") {
    if (animationCount == 48) {
     sSprite.x += 47;
    } else {
     sSprite.x -= 1;
    }
    animationCount -= 1;
   }
   if (sMotion == "floatleftfast") {
    if (animationCount == 12) {
     sSprite.x -= 22;
    } else {
     sSprite.x += 2;
    }
    animationCount -= 1;
   }
   if (sMotion == "floatleft") {
    if (animationCount == 48) {
     sSprite.x -= 47;
    } else {
     sSprite.x += 1;
    }
    animationCount -= 1;
   }
   if (sMotion == "noslowloop") {
    if (animationCount > 72) {
     sSprite.x += 0.25;
    } else if (animationCount > 24) {
     sSprite.x -= 0.25;
    } else {
     sSprite.x += 0.25;
    }
    animationCount -= 1;
    if (animationCount == 0) animationCount = animationFrame["noslowloop"];
   }
   if (sMotion == "breathing") {
    if (animationCount > 72) {
     sSprite.y += 0.5;
    } else if (animationCount > 48) {
     sSprite.y -= 0.5;
    } else {
    }
    animationCount -= 1;
    if (animationCount == 0) animationCount = animationFrame["breathing"];
   }
   if (sMotion == "breathing2") {
    if (animationCount > 48) {
     // sSprite.anchor.y = 1;
     sSprite.y -= sSprite.height * 0.0003;
     sSprite.scale.y += 0.0003;
    } else {
     // sSprite.anchor.y = 1;
     sSprite.y += sSprite.height * 0.0003;
     sSprite.scale.y -= 0.0003;
    }
    animationCount -= 1;
    if (animationCount == 0) animationCount = animationFrame["breathing2"];
   }
   if (sMotion == "stepleft") {
    if (animationCount > 12) {
     sSprite.x -= 2;
    } else {
     sSprite.x += 2;
    }
    animationCount -= 1;
   }
   if (sMotion == "stepright") {
    if (animationCount > 12) {
     sSprite.x += 2;
    } else {
     sSprite.x -= 2;
    }
    animationCount -= 1;
   }
   if (sMotion == "headdown") {
    sSprite.y += 2;
    animationCount -= 1;
   }
   return animationCount;
  }
 }

 var _Scene_Battle_update = Scene_Battle.prototype.update;
 Scene_Battle.prototype.update = function() {
  _Scene_Battle_update.apply(this, arguments);
  ExStandingPictureBattle.update(this);
 };

 var _Scene_Battle_createSpriteset = Scene_Battle.prototype.createSpriteset;
 Scene_Battle.prototype.createSpriteset = function() {
  _Scene_Battle_createSpriteset.apply(this, arguments);
  ExStandingPictureBattle.create(this);
 };

 //-----------------------------------------------------------------------------
 // Sprite_LL_SPicture
 //
 // 立ち絵を表示するための独自のスプライトを追加定義します。

 function Sprite_LL_SPicture() {
  this.initialize.apply(this, arguments);
 }

 Sprite_LL_SPicture.prototype = Object.create(Sprite.prototype);
 Sprite_LL_SPicture.prototype.constructor = Sprite_LL_SPicture;

 Sprite_LL_SPicture.prototype.initialize = function() {
  Sprite.prototype.initialize.call(this);

  this.bitmap = null;
  this.opacity = 0;
  this.opening = false;
  this.closing = false;
  this.originX = 0;
  this.originY = 0;
  this.showing = false;

  this.setOverlayBitmap();
  this.initMembers();
 };

 Sprite_LL_SPicture.prototype.setOverlayBitmap = function() {
  //
 };

 Sprite_LL_SPicture.prototype.initMembers = function() {
  //
 };

 Sprite_LL_SPicture.prototype.update = function() {
  Sprite.prototype.update.call(this);
 };

 Sprite_LL_SPicture.prototype.setPicture = function(sPicture) {
  // ベース画像
  this.bitmap = null;
  this.bitmap = ImageManager.loadPicture(sPicture.imageName);
 };

 Sprite_LL_SPicture.prototype.setBlendColor = function(color) {
  Sprite.prototype.setBlendColor.call(this, color);
 };

 Sprite_LL_SPicture.prototype.setColorTone = function(tone) {
  Sprite.prototype.setColorTone.call(this, tone);
 };

 Sprite_LL_SPicture.prototype.setBlendMode = function(mode) {
  this.blendMode = mode;
 };
})();









