//=============================================================================
// Actor Stepping Animation (Fix for YEP_PartySystem)
// by Shaz (Modified by Gemini)
// Last Updated: 2026.01.01
//=============================================================================

/*:
 * @plugindesc Allows party leader/followers to have stepping anim on map
 * @author Shaz
 *
 * @help This plugin does not provide plugin commands.
 *
 * Add <stepanim> to the note box of an Actor to turn on stepping animation
 * for the actor's sprite on the map, as the party leader or a follower.
 *
 */

(function() {
  var _Game_Player_update = Game_Player.prototype.update;
  Game_Player.prototype.update = function(sceneActive) {
    _Game_Player_update.call(this, sceneActive);
    // 修复：检查队长是否存在
    var leader = $gameParty.leader();
    if (leader && leader.actor()) {
        this.setStepAnime(leader.actor().meta.stepanim || false);
    }
  };

  var _Game_Follower_update = Game_Follower.prototype.update;
  Game_Follower.prototype.update = function() {
    _Game_Follower_update.call(this);
    // 修复：检查该跟随者位置是否有角色
    var actor = this.actor();
    if (actor && actor.actor()) {
        this.setStepAnime(actor.actor().meta.stepanim || false);
    } else {
        // 如果没人，可以考虑关闭踏步动画，或者保持默认
        this.setStepAnime(false); 
    }
  };
})();