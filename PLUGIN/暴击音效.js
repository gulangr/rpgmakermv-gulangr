var alias_applyCrit = Game_Action.prototype.applyCritical;
Game_Action.prototype.applyCritical = function(damage) {
    AudioManager.playSe({name: "baojibe", pan: 0, pitch: 100, volume: 120});//baojibe xiaomifeng
    return alias_applyCrit.call(this, damage);
};