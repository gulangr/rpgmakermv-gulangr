/*:
 * @plugindesc 修复 VE_ShieldHit 与 AutoScaleAnimation 兼容性问题，强制镜像动画的 X 轴运动。
 * @author Gemini Patch
 * @help
 * 这是一个兼容性补丁。
 * * 请将此插件放置在以下插件的下方：
 * 1. VE_ShieldHit_Keyframes_Fix
 * 2. autoscaleanimation (或相关的缩放插件)
 * * 功能：
 * 当动画被标记为镜像 (mirror) 时（通常是我方角色朝左时），
 * 强制将动画的 X 轴位置相对于目标中心进行翻转，
 * 从而修复护盾/飞行道具向反方向移动的问题。
 */

(function() {
    // 备份原有的 updatePosition 方法
    var _Sprite_Animation_updatePosition = Sprite_Animation.prototype.updatePosition;

    Sprite_Animation.prototype.updatePosition = function() {
        // 1. 先执行原有的定位逻辑 (包含 VE 插件的计算)
        _Sprite_Animation_updatePosition.call(this);

        // 2. 检查是否需要镜像修正
        // this._mirror 是 RPG Maker 默认判断是否镜像的标志
        // 如果 autoscaleanimation 设置了镜像，通常也会设置这个标志，或者目标是我方角色时通常为 true
        if (this._mirror) {
            
            // 获取动画的目标对象 (通常是战斗图 Sprite_Battler)
            var target = this._target;
            
            if (target && target.x !== undefined) {
                // 计算当前计算出的 X 坐标与目标中心点的偏移量
                // 此时的 this.x 是 VE 插件按照"朝右"计算出的位置
                var offsetX = this.x - target.x;

                // 3. 执行镜像翻转：
                // 新的 X 坐标 = 目标中心点 - 原有的偏移量
                // 这样原本向右飞 (+10) 就会变成向左飞 (-10)
                this.x = target.x - offsetX;

                // 4. (可选) 如果还需要翻转角度/旋转 (比如箭矢的朝向)
                // 如果您发现护盾的贴图朝向不对，可以取消下面这行的注释
                // this.rotation = -this.rotation;
            }
        }
    };
})();