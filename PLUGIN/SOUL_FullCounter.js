/*:
* @plugindesc Mimics the Full Counter Skill of Meliodas from Nanatsu no Taizai.
* @author soulpour777 - soulxregalia.wordpress.com
*
* @param Full Counter Multiplier
* @desc The multiplier when the character uses the Full Counter State. (Math formula accepted)
* @default 2
*

@help This plugin does not have any commands.

Meliodas' Full Counter

Tag your states with <full_counter> if you want them to behave like
Meliodas' Full Counter. Make sure that the state is a magic reflection
ability. This works by injecting new effects if the state is tagged
with it and if magical reflect is added into it as an effect.

The FULL COUNTER MULTIPLIER is the multiplier of the reflect
damage. This means that the actual damage of the reflection (normal)
is multiplied by it. When I said that Math formula is accepted,
I meant that any math style value is accepted. For example:

For example:

Math.floor(Math.random() * 20)

This will randomize between 0 to 19.

*/

var applyEx = false;

var Imported = Imported || {};
Imported.SOUL_FullCounter = true;

var Soulpour777 = Soulpour777 || {};
Soulpour777.FullCounter = Soulpour777.FullCounter || {};

var fc = PluginManager.parameters('SOUL_FullCounter');
Soulpour777.FullCounter.multiplierDamage = fc['Full Counter Multiplier'];

Game_Battler.prototype.addState = function(stateId) {
    if (this.isStateAddable(stateId)) {
        if (!this.isStateAffected(stateId)) {
            this.addNewState(stateId);
            this.refresh();
        }
        if ($dataStates[stateId].note.match('<full_counter>')) applyEx = true;
        this.resetStateCounts(stateId);
        this._result.pushAddedState(stateId);
    }
};

Game_Battler.prototype.removeState = function(stateId) {
    if (this.isStateAffected(stateId)) {
        if (stateId === this.deathStateId()) {
            this.revive();
        }
        if ($dataStates[stateId].note.match('<full_counter>')) applyEx = false;
        this.eraseState(stateId);
        this.refresh();
        this._result.pushRemovedState(stateId);
    }
};

Game_Action.prototype.applyEx = function(target) {
    var result = target.result();
    this.subject().clearResult();
    result.clear();
    result.used = this.testApply(target);
    result.missed = (result.used && Math.random() >= this.itemHit(target));
    result.evaded = (!result.missed && Math.random() < this.itemEva(target));
    result.physical = this.isPhysical();
    result.drain = this.isDrain();

    if (result.isHit()) {
        if (this.item().damage.type > 0) {
            result.critical = (Math.random() < this.itemCri(target));
            var value = this.makeDamageValue(target, result.critical);
            this.executeDamage(target, value *= eval(Soulpour777.FullCounter.multiplierDamage));
        }
        this.item().effects.forEach(function(effect) {
            this.applyItemEffect(target, effect);
        }, this);
        this.applyItemUserEffect(target);
    }
};

BattleManager.invokeMagicReflection = function(subject, target) {
    this._logWindow.displayReflection(target);
    if(applyEx) {
    	this._action.applyEx(subject);
    } else {
    	this._action.apply(subject);
    }
    this._logWindow.displayActionResults(subject, subject);
};