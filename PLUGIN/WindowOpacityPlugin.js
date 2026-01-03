//=============================================================================
// WindowOpacityPlugin.js
//=============================================================================

/*:
 * @plugindesc 允许修改战斗窗口透明度（ActorCommand和BattleItem）
 * @author Zulu
 * @help 
 * 此插件允许您设置 Window_ActorCommand 和 Window_BattleItem 窗口的透明度
 * 包括显示"暂无物品"的战斗物品窗口
 * 
 * @param windowOpacity
 * @text 窗口透明度
 * @desc 设置窗口透明度 (0-255, 0=完全透明, 255=完全不透明)
 * @type number
 * @min 0
 * @max 255
 * @default 255
 */

(function() {
    'use strict';
    
    var parameters = PluginManager.parameters('WindowOpacityPlugin');
    var windowOpacity = Number(parameters['windowOpacity'] || 255);

    // 保存原始方法
    var _Window_ActorCommand_initialize = Window_ActorCommand.prototype.initialize;
    var _Window_ActorCommand_update = Window_ActorCommand.prototype.update;

    // 扩展初始化方法
    Window_ActorCommand.prototype.initialize = function() {
        _Window_ActorCommand_initialize.call(this);
        this.opacity = windowOpacity; // 设置窗口透明度
    };

    // 扩展更新方法以确保透明度持续有效
    Window_ActorCommand.prototype.update = function() {
        _Window_ActorCommand_update.call(this);
        this.opacity = windowOpacity; // 持续更新透明度
    };

    // 添加设置透明度的方法
    Window_ActorCommand.prototype.setOpacity = function(value) {
        windowOpacity = Math.max(0, Math.min(255, value)); // 确保在0-255范围内
        this.opacity = windowOpacity;
    };

    // 添加获取透明度的方法
    Window_ActorCommand.prototype.getOpacity = function() {
        return windowOpacity;
    };

    // 添加淡入淡出效果
    Window_ActorCommand.prototype.fadeIn = function(duration) {
        if (duration === undefined) duration = 30;
        var startOpacity = this.opacity;
        var frames = duration;
        var self = this;
        
        for (var i = 0; i <= frames; i++) {
            (function(frame) {
                setTimeout(function() {
                    var ratio = frame / frames;
                    var currentOpacity = startOpacity + (255 - startOpacity) * ratio;
                    self.opacity = Math.round(currentOpacity);
                }, frame * (1000/60));
            })(i);
        }
    };

    Window_ActorCommand.prototype.fadeOut = function(duration) {
        if (duration === undefined) duration = 30;
        var startOpacity = this.opacity;
        var frames = duration;
        var self = this;
        
        for (var i = 0; i <= frames; i++) {
            (function(frame) {
                setTimeout(function() {
                    var ratio = frame / frames;
                    var currentOpacity = startOpacity * (1 - ratio);
                    self.opacity = Math.round(currentOpacity);
                }, frame * (1000/60));
            })(i);
        }
    };

    // 修改 updatePosition 方法以保持透明度设置
    var _Window_ActorCommand_updatePosition = Window_ActorCommand.prototype.updatePosition;
    Window_ActorCommand.prototype.updatePosition = function() {
        _Window_ActorCommand_updatePosition.call(this);
        this.opacity = windowOpacity; // 确保位置更新后透明度不变
    };

    // =========================================
    // 为Window_BattleItem添加透明度支持
    // =========================================
    
    // 保存Window_BattleItem的原始方法
    var _Window_BattleItem_initialize = Window_BattleItem.prototype.initialize;
    var _Window_BattleItem_update = Window_BattleItem.prototype.update;

    // 扩展Window_BattleItem初始化方法
    Window_BattleItem.prototype.initialize = function() {
        _Window_BattleItem_initialize.call(this);
        this.opacity = windowOpacity; // 设置窗口透明度
    };

    // 扩展Window_BattleItem更新方法以确保透明度持续有效
    Window_BattleItem.prototype.update = function() {
        _Window_BattleItem_update.call(this);
        this.opacity = windowOpacity; // 持续更新透明度
    };

    // 为Window_BattleItem添加设置透明度的方法
    Window_BattleItem.prototype.setOpacity = function(value) {
        windowOpacity = Math.max(0, Math.min(255, value)); // 确保在0-255范围内
        this.opacity = windowOpacity;
    };

    // 为Window_BattleItem添加获取透明度的方法
    Window_BattleItem.prototype.getOpacity = function() {
        return windowOpacity;
    };

    // 为Window_BattleItem添加淡入淡出效果
    Window_BattleItem.prototype.fadeIn = function(duration) {
        if (duration === undefined) duration = 30;
        var startOpacity = this.opacity;
        var frames = duration;
        var self = this;
        
        for (var i = 0; i <= frames; i++) {
            (function(frame) {
                setTimeout(function() {
                    var ratio = frame / frames;
                    var currentOpacity = startOpacity + (255 - startOpacity) * ratio;
                    self.opacity = Math.round(currentOpacity);
                }, frame * (1000/60));
            })(i);
        }
    };

    Window_BattleItem.prototype.fadeOut = function(duration) {
        if (duration === undefined) duration = 30;
        var startOpacity = this.opacity;
        var frames = duration;
        var self = this;
        
        for (var i = 0; i <= frames; i++) {
            (function(frame) {
                setTimeout(function() {
                    var ratio = frame / frames;
                    var currentOpacity = startOpacity * (1 - ratio);
                    self.opacity = Math.round(currentOpacity);
                }, frame * (1000/60));
            })(i);
        }
    };

    // 修改Window_BattleItem的updatePosition方法以保持透明度设置
    var _Window_BattleItem_updatePosition = Window_BattleItem.prototype.updatePosition;
    if (_Window_BattleItem_updatePosition) {
        Window_BattleItem.prototype.updatePosition = function() {
            _Window_BattleItem_updatePosition.call(this);
            this.opacity = windowOpacity; // 确保位置更新后透明度不变
        };
    }

})();