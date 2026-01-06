/*:
 * @plugindesc (V7.0) [最终无闪烁版] 采用"先隐藏后显示"策略，彻底根除默认字体闪现问题。
 * @author 辅助开发
 *
 * @param Image Filename
 * @text 数字图片文件名
 * @desc 存放在 img/system/ 下的图片文件名 (不需要后缀)。
 * @default Damage2
 *
 * @help
 * ============================================================================
 * V7.0 技术解析
 * ============================================================================
 * 针对日志中发现的 "IsReady=false" 问题，采用了新的处理逻辑：
 * * 1. 当护盾伤害触发时，如果图片还没加载好：
 * -> 立即将当前的默认数字设为【不可见】(Visible=false)。
 * -> (此时屏幕上什么都没有，避免了默认字体闪瞎眼)
 * * 2. 0.0x秒后，图片加载完成：
 * -> 触发回调，执行换肤。
 * -> 将数字重新设为【可见】(Visible=true)。
 * * 结果：视觉上实现了完美的无缝切换。
 * ============================================================================
 */

(function() {
    var parameters = PluginManager.parameters('YEP_Barrier_BEC_Patch');
    var imageName = parameters['Image Filename'] || 'Damage2';

    // 1. 预加载
    var _Scene_Boot_loadSystemImages = Scene_Boot.prototype.loadSystemImages;
    Scene_Boot.prototype.loadSystemImages = function() {
        _Scene_Boot_loadSystemImages.call(this);
        ImageManager.loadSystem(imageName);
    };

    // ======================================================================
    // 2. 侦测逻辑 (V5.0/V6.0 验证过的稳定版本)
    // ======================================================================
    var _Sprite_Damage_setup = Sprite_Damage.prototype.setup;
    Sprite_Damage.prototype.setup = function(target) {
        this._isBarrierPopup = false;

        var popupData = target._damagePopup && target._damagePopup[0];
        if (popupData && popupData._barrierAffected) {
            this._isBarrierPopup = true;
        } else if (target.result() && target.result().barrierAffected) {
            this._isBarrierPopup = true;
        }

        _Sprite_Damage_setup.call(this, target);
    };

    if (Sprite_Damage.prototype.setupBarrierEffect) {
        var _Sprite_Damage_setupBarrierEffect = Sprite_Damage.prototype.setupBarrierEffect;
        Sprite_Damage.prototype.setupBarrierEffect = function() {
            _Sprite_Damage_setupBarrierEffect.call(this);
            if (this._isBarrierPopup) {
                this._flashColor = [0, 0, 0, 0];
                this._flashDuration = 0;
            }
        };
    }

    // ======================================================================
    // 3. 核心：后期换肤 + 智能隐藏
    // ======================================================================
    var _Sprite_Damage_createDigits = Sprite_Damage.prototype.createDigits;
    Sprite_Damage.prototype.createDigits = function(baseRow, value) {
        // 先生成默认数字(带动画)
        _Sprite_Damage_createDigits.call(this, baseRow, value);

        if (this._isBarrierPopup) {
            this.applyBarrierSkin(value);
        }
    };

    // 换肤函数
    Sprite_Damage.prototype.applyBarrierSkin = function(value) {
        var bitmap = ImageManager.loadSystem(imageName);

        // === 核心修复逻辑 ===
        if (!bitmap.isReady()) {
            // A计划: 图片还没好？
            // 赶紧把现在的默认字体隐藏起来！绝对不能让玩家看到！
            for (var i = 0; i < this.children.length; i++) {
                this.children[i].visible = false;
            }
            
            // 添加监听，等图片好了再回来
            bitmap.addLoadListener(this.applyBarrierSkin.bind(this, value));
            return;
        }
        
        // === 图片已就绪 (B计划) ===
        var string = Math.abs(value).toString();
        var newW = Math.floor(bitmap.width / 10);
        var newH = bitmap.height;

        if (newW <= 0) return;

        var digitIndex = 0;
        
        for (var i = 0; i < this.children.length; i++) {
            var sprite = this.children[i];

            if (sprite.bitmap && (sprite.bitmap === this._damageBitmap || (sprite.bitmap.url && sprite.bitmap.url.contains("Damage")))) {
                
                // 1. 替换图片
                sprite.bitmap = bitmap;

                // 2. 重新切割
                if (digitIndex < string.length) {
                    var n = Number(string[digitIndex]);
                    sprite.setFrame(n * newW, 0, newW, newH);
                    sprite.x = (digitIndex - (string.length - 1) / 2) * newW;
                    
                    digitIndex++;
                }
                
                // 3. 显形！(如果是从A计划回来的，这里会让它重新可见)
                sprite.visible = true;
            }
        }
    };

})();