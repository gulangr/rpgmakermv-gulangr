//=============================================================================
// YEP_PartySystem Cursor Swap Patch (Fix White Box Bug)
// 作用：允许在右上角窗口直接通过光标互换位置，按“下”键才进入备选列表
//=============================================================================

(function() {

    //-----------------------------------------------------------------------------
    // 1. 修改 Scene_Party 的确认逻辑 (onPartyOk)
    //-----------------------------------------------------------------------------
    var _Scene_Party_onPartyOk = Scene_Party.prototype.onPartyOk;
    Scene_Party.prototype.onPartyOk = function() {
        var symbol = this._commandWindow.currentSymbol();
        
        // 如果是“更换(Change)”模式
        if (symbol === 'change') {
            // 如果已经在“交换模式”中（说明这是第二次按下OK，确立目标）
            if (this._swapMode) {
                var sourceIndex = this._pendingSourceIndex;
                var targetIndex = this._partyWindow.index();

                // --- 修复点：先关闭交换模式，再刷新画面 ---
                this._swapMode = false; 

                // 执行交换
                if (sourceIndex !== targetIndex) {
                    SoundManager.playEquip();
                    $gameParty.swapOrder(sourceIndex, targetIndex);
                    this.refreshWindows(); // 此时 _swapMode 已为 false，重画时不会带白框
                } else {
                    // 如果选了同一个人，虽然没换位置，但也需要刷新一次以去除高亮
                    this._partyWindow.refresh();
                }
                
                this._partyWindow.activate(); // 保持焦点在上方窗口
                
            } else {
                // --- 第一次按下OK：锁定源角色，进入交换模式 ---
                this._swapMode = true;
                this._pendingSourceIndex = this._partyWindow.index();
                
                SoundManager.playOk();
                
                // 刷新窗口以显示高亮背景
                this._partyWindow.refresh();
                this._partyWindow.activate(); // 保持焦点，允许左右移动
            }
        } else {
            // 其他命令走原版逻辑
            _Scene_Party_onPartyOk.call(this);
        }
    };

    //-----------------------------------------------------------------------------
    // 2. 修改 Scene_Party 的取消逻辑 (onPartyCancel)
    //-----------------------------------------------------------------------------
    var _Scene_Party_onPartyCancel = Scene_Party.prototype.onPartyCancel;
    Scene_Party.prototype.onPartyCancel = function() {
        // 如果正在交换模式中，按取消键 = 取消高亮
        if (this._swapMode) {
            this._swapMode = false;
            this._partyWindow.refresh();
            this._partyWindow.activate();
            SoundManager.playCancel();
        } else {
            _Scene_Party_onPartyCancel.call(this);
        }
    };

    //-----------------------------------------------------------------------------
    // 3. 增加“按下”键进入下方列表的逻辑
    //-----------------------------------------------------------------------------
    var _Scene_Party_createPartyWindow = Scene_Party.prototype.createPartyWindow;
    Scene_Party.prototype.createPartyWindow = function() {
        _Scene_Party_createPartyWindow.call(this);
        this._partyWindow.setHandler('downInput', this.onPartyDown.bind(this));
    };

    Scene_Party.prototype.onPartyDown = function() {
        // 只有在交换模式（已选中第一人）时，才允许跳到下方列表找替补
        if (this._swapMode) {
            this._partyWindow.deactivate();
            this._listWindow.activate();
            this._listWindow.select(0);
        }
    };

    // 劫持 Window_PartySelect 的按键检测
    var _Window_PartySelect_processCursorMove = Window_PartySelect.prototype.processCursorMove;
    Window_PartySelect.prototype.processCursorMove = function() {
        if (this.isCursorMovable()) {
            if (Input.isRepeated('down')) {
                this.callHandler('downInput');
                return;
            }
        }
        _Window_PartySelect_processCursorMove.call(this);
    };

    //-----------------------------------------------------------------------------
    // 4. 增加“按上”键返回上方窗口的逻辑
    //-----------------------------------------------------------------------------
    var _Scene_Party_createListWindow = Scene_Party.prototype.createListWindow;
    Scene_Party.prototype.createListWindow = function() {
        _Scene_Party_createListWindow.call(this);
        this._listWindow.setHandler('upInput', this.onListUp.bind(this));
    };

    Scene_Party.prototype.onListUp = function() {
        this._listWindow.deactivate();
        this._listWindow.deselect();
        this._partyWindow.activate();
    };

    var _Window_PartyList_processCursorMove = Window_PartyList.prototype.processCursorMove;
    Window_PartyList.prototype.processCursorMove = function() {
        if (this.isCursorMovable()) {
            if (Input.isRepeated('up')) {
                if (this.index() < this.maxCols()) {
                    this.callHandler('upInput');
                    return;
                }
            }
        }
        _Window_PartyList_processCursorMove.call(this);
    };

    //-----------------------------------------------------------------------------
    // 5. 视觉优化：绘制选中状态的高亮背景
    //-----------------------------------------------------------------------------
    var _Window_PartySelect_drawItem = Window_PartySelect.prototype.drawItem;
    Window_PartySelect.prototype.drawItem = function(index) {
        // 绘制原版内容
        _Window_PartySelect_drawItem.call(this, index);

        // 如果处于交换模式，且当前格子是“源角色”，画一个半透明白色背景
        var scene = SceneManager._scene;
        if (scene instanceof Scene_Party && scene._swapMode && scene._pendingSourceIndex === index) {
            var rect = this.itemRect(index);
            this.contents.paintOpacity = 100; 
            this.contents.fillRect(rect.x, rect.y, rect.width, rect.height, 'rgba(255, 255, 255, 0.5)');
            this.contents.paintOpacity = 255; 
        }
    };

})();