/*:
 * @plugindesc (V11.1) [最终版] 动画纯净遮罩 - 修复混合模式失效问题，移除调试代码。
 * @author 辅助开发
 *
 * @param Mask Config List
 * @text 遮罩配置列表
 * @type struct<MaskConfig>[]
 * @desc 配置哪些动画ID需要应用遮罩。
 * @default []
 *
 * @help
 * ============================================================================
 * 功能介绍
 * ============================================================================
 * 本插件允许为动画应用 Alpha 遮罩（基于透明度裁剪）。
 *
 * 特性：
 * 1. 使用底层滤镜管线替代默认遮罩，完美支持【发光特效】。
 * 2. 彻底解决了普通遮罩导致的"透明背景变黑"问题。
 *
 * 使用方法：
 * 1. 准备背景透明的 PNG 遮罩图放入 img/system/。
 * 2. 在配置列表中绑定动画 ID 和图片。
 * 3. 如果是发光特效，请将【混合模式】设为 1 (Add)。
 *
 * ============================================================================
 */

/*~struct~MaskConfig:
 * @param Animation Id
 * @text 目标动画ID
 * @type animation
 * @desc 指定应用遮罩的动画编号。
 *
 * @param Mask Image
 * @text 遮罩图片文件名
 * @type file
 * @require 1
 * @dir img/system/
 * @desc 必须是背景透明的PNG。
 *
 * @param Force Blend Mode
 * @text 特效混合模式
 * @type select
 * @option 0 - Normal (正常/实体)
 * @value 0
 * @option 1 - Add (相加/光效推荐)
 * @value 1
 * @option 3 - Screen (滤色)
 * @value 3
 * @desc 消除黑边的关键：光效请选 1。
 * @default 1
 *
 * @param --- Initial ---
 * @text --- 初始状态 ---
 *
 * @param Init Scale X
 * @text 初始缩放 X
 * @parent --- Initial ---
 * @type number
 * @decimals 2
 * @default 1.00
 *
 * @param Init Scale Y
 * @text 初始缩放 Y
 * @parent --- Initial ---
 * @type number
 * @decimals 2
 * @default 1.00
 *
 * @param Offset X
 * @text 初始偏移 X
 * @parent --- Initial ---
 * @type number
 * @default 0
 *
 * @param Offset Y
 * @text 初始偏移 Y
 * @parent --- Initial ---
 * @type number
 * @default 0
 *
 * @param Init Rotation
 * @text 初始角度
 * @parent --- Initial ---
 * @type number
 * @default 0
 *
 * @param --- Dynamics ---
 * @text --- 动态变化 ---
 *
 * @param Scroll Speed X
 * @text X轴移动速度
 * @parent --- Dynamics ---
 * @type number
 * @default 0
 *
 * @param Scroll Speed Y
 * @text Y轴移动速度
 * @parent --- Dynamics ---
 * @type number
 * @default 0
 *
 * @param Rotation Speed
 * @text 旋转速度
 * @parent --- Dynamics ---
 * @type number
 * @default 0
 *
 * @param Scale Speed X
 * @text X缩放增量
 * @parent --- Dynamics ---
 * @type number
 * @decimals 3
 * @default 0
 *
 * @param Scale Speed Y
 * @text Y缩放增量
 * @parent --- Dynamics ---
 * @type number
 * @decimals 3
 * @default 0
 */

(function() {
    'use strict';

    var parameters = PluginManager.parameters('AnimationAlphaMask');
    var configRaw = parameters['Mask Config List'] || '[]';
    var configList = JSON.parse(configRaw);

    var maskConfigs = {};
    for (var i = 0; i < configList.length; i++) {
        var data = JSON.parse(configList[i]);
        var animId = Number(data['Animation Id']);
        maskConfigs[animId] = {
            filename: data['Mask Image'],
            blendMode: Number(data['Force Blend Mode']) || 0,
            
            initScaleX: Number(data['Init Scale X']) || 1.0,
            initScaleY: Number(data['Init Scale Y']) || 1.0,
            offsetX: Number(data['Offset X']) || 0,
            offsetY: Number(data['Offset Y']) || 0,
            initRotation: (Number(data['Init Rotation']) || 0) * (Math.PI / 180),
            scrollX: Number(data['Scroll Speed X']) || 0,
            scrollY: Number(data['Scroll Speed Y']) || 0,
            rotSpeed: (Number(data['Rotation Speed']) || 0) * (Math.PI / 180),
            scaleSpeedX: Number(data['Scale Speed X']) || 0,
            scaleSpeedY: Number(data['Scale Speed Y']) || 0
        };
    }

    // 检测可用的滤镜类 (优先使用 AlphaMaskFilter)
    var FilterClass = null;
    if (typeof PIXI.filters !== 'undefined') {
        if (typeof PIXI.filters.AlphaMaskFilter === 'function') {
            FilterClass = PIXI.filters.AlphaMaskFilter;
        } else if (typeof PIXI.SpriteMaskFilter === 'function') {
            FilterClass = PIXI.SpriteMaskFilter;
        }
    }

    var _Scene_Boot_loadSystemImages = Scene_Boot.prototype.loadSystemImages;
    Scene_Boot.prototype.loadSystemImages = function() {
        _Scene_Boot_loadSystemImages.call(this);
        for (var key in maskConfigs) {
            if (maskConfigs[key].filename) {
                ImageManager.loadSystem(maskConfigs[key].filename);
            }
        }
    };

    // ======================================================================
    // 扩展 Sprite_Animation
    // ======================================================================

    var _Sprite_Animation_setup = Sprite_Animation.prototype.setup;
    Sprite_Animation.prototype.setup = function(target, animation, mirror, delay) {
        this.removeAlphaMask();
        _Sprite_Animation_setup.call(this, target, animation, mirror, delay);
        
        if (this._animation && maskConfigs[this._animation.id]) {
            this.createAlphaMask(maskConfigs[this._animation.id]);
        }
    };

    Sprite_Animation.prototype.createAlphaMask = function(config) {
        var bitmap = ImageManager.loadSystem(config.filename);
        
        if (!bitmap.isReady()) {
             bitmap.addLoadListener(this.createAlphaMask.bind(this, config));
             return;
        }

        var maskSprite = new Sprite(bitmap);
        maskSprite.anchor.x = 0.5;
        maskSprite.anchor.y = 0.5;
        maskSprite.x = config.offsetX;
        maskSprite.y = config.offsetY;
        maskSprite.scale.x = config.initScaleX;
        maskSprite.scale.y = config.initScaleY;
        maskSprite.rotation = config.initRotation;
        
        // 必须添加到显示列表以获取世界坐标，但设为不可见（不直接渲染）
        this.addChild(maskSprite);
        maskSprite.renderable = false;

        // 核心逻辑：使用滤镜并强制混合模式
        if (FilterClass) {
            var maskFilter = new FilterClass(maskSprite);
            
            // 关键：强制滤镜使用 ADD 模式，避免黑边
            if (config.blendMode !== 0) {
                maskFilter.blendMode = config.blendMode;
            }

            this.filters = [maskFilter];
            
            // 双重保险：容器本身也应用混合模式
            if (config.blendMode !== 0) {
                this.blendMode = config.blendMode;
            }
        } 
        else {
            // 降级方案 (极低概率触发)
            this.mask = maskSprite;
            if (config.blendMode !== 0) {
                this.blendMode = config.blendMode;
            }
        }

        this._maskConfig = config;
        this._customMask = maskSprite;
    };

    Sprite_Animation.prototype.removeAlphaMask = function() {
        if (this._customMask) {
            this.filters = null;
            this.mask = null;
            this.blendMode = PIXI.BLEND_MODES.NORMAL;
            this.removeChild(this._customMask);
            this._customMask = null;
            this._maskConfig = null;
        }
    };

    var _Sprite_Animation_update = Sprite_Animation.prototype.update;
    Sprite_Animation.prototype.update = function() {
        _Sprite_Animation_update.call(this);

        if (this._customMask && this._maskConfig && this.isPlaying()) {
            var mask = this._customMask;
            var cfg = this._maskConfig;

            mask.x += cfg.scrollX;
            mask.y += cfg.scrollY;
            if (cfg.rotSpeed !== 0) mask.rotation += cfg.rotSpeed;
            if (cfg.scaleSpeedX !== 0) mask.scale.x += cfg.scaleSpeedX;
            if (cfg.scaleSpeedY !== 0) mask.scale.y += cfg.scaleSpeedY;
        }
    };
    
    var _Sprite_Animation_remove = Sprite_Animation.prototype.remove;
    Sprite_Animation.prototype.remove = function() {
        this.removeAlphaMask();
        if (_Sprite_Animation_remove) _Sprite_Animation_remove.call(this);
    };

})();