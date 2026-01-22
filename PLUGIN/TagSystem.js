/*:
 * @plugindesc (v3.63 修复版) 标签系统 - 完美间隙+字体隔离+强制缩放+背景边框
 * @author Custom & 适配修改 & Gemini优化
 *
 * @param --- 视觉自定义参数 ---
 * @default
 *
 * @param FontSizeReduction
 * @text 字号缩小幅度
 * @parent --- 视觉自定义参数 ---
 * @type number
 * @min 1
 * @max 20
 * @desc 【】内文字的缩小单位（MV中2单位=1个视觉字号），默认4（2个字号）
 * @default 4
 *
 * @param TagFontName
 * @text 【】内文字字体
 * @parent --- 视觉自定义参数 ---
 * @type string
 * @desc 填写字体名称（需与MV编辑器「数据库→系统→字体」一致，如：微软雅黑/Meiryo）
 * @default 微软雅黑
 *
 * @param BgHeightRatio
 * @text 背景高度比例
 * @parent --- 视觉自定义参数 ---
 * @type number
 * @decimals 2
 * @min 0.1
 * @max 5.0
 * @desc 背景块高度相对于普通文字字号的比例（0.1=极小，5.0=超大），默认0.9
 * @default 0.9
 *
 * @param BgWidthScale
 * @text 背景宽度扩展系数
 * @parent --- 视觉自定义参数 ---
 * @type number
 * @decimals 2
 * @min 0.5
 * @max 3.0
 * @desc 背景宽度相对文字宽度的扩展系数（1.0=与文字等宽，2.0=比文字宽1倍），默认1.2
 * @default 1.2
 *
 * @param BgBorderRadius
 * @text 背景圆角半径
 * @parent --- 视觉自定义参数 ---
 * @type number
 * @min 0
 * @max 50
 * @desc 圆角矩形的圆角半径（0=直角，数值越大越圆），默认4
 * @default 4
 *
 * @param BgHorizontalPadding
 * @text 背景左右基础边距
 * @parent --- 视觉自定义参数 ---
 * @type number
 * @min 0
 * @max 20
 * @desc 背景块左右额外预留的空白（基础边距，对称添加），默认2像素
 * @default 2
 *
 * @param BgBlockMargin
 * @text 背景块外部间距
 * @parent --- 视觉自定义参数 ---
 * @type number
 * @min 0
 * @max 50
 * @desc 背景块与左右相邻文字的距离（像素），默认2
 * @default 2
 *
 * @param BgOpacity
 * @text 背景块不透明度
 * @parent --- 视觉自定义参数 ---
 * @type number
 * @min 0
 * @max 255
 * @desc 背景颜色块的不透明度（0=全透明，255=完全不透明），默认255。
 * @default 255
 * * @param BgStrokeWidth
 * @text 背景边框宽度
 * @parent --- 视觉自定义参数 ---
 * @type number
 * @min 0
 * @max 10
 * @desc 背景块的描边宽度（0=无边框），默认0
 * @default 0
 *
 * @param BgStrokeColor
 * @text 背景边框颜色
 * @parent --- 视觉自定义参数 ---
 * @type string
 * @desc 背景块的描边颜色（支持Hex/RGB），默认#FFFFFF
 * @default #FFFFFF
 *
 * @param TextBaselineOffset
 * @text 文字基线偏移
 * @parent --- 视觉自定义参数 ---
 * @type number
 * @min -20
 * @max 20
 * @desc 【】内文字垂直偏移（正数=下移，负数=上移），默认0
 * @default 0
 *
 * @param BgBaselineOffset
 * @text 背景基线偏移
 * @parent --- 视觉自定义参数 ---
 * @type number
 * @min -20
 * @max 20
 * @desc 背景块垂直偏移（正数=下移，负数=上移），默认0
 * @default 0
 *
 * @param --- 基础配置参数 ---
 * @default
 *
 * @param Actor Tag Settings
 * @text 角色标签配置
 * @parent --- 基础配置参数 ---
 * @type struct<ActorSetting>[]
 * @desc 在这里注册角色的标签。
 * @default []
 *
 * @param Enemy Tag Settings
 * @text 敌人标签配置
 * @parent --- 基础配置参数 ---
 * @type struct<EnemySetting>[]
 * @desc 在这里注册敌人的标签。
 * @default []
 *
 * @param Weapon Tag Settings
 * @text 武器标签配置
 * @parent --- 基础配置参数 ---
 * @type struct<WeaponSetting>[]
 * @desc 在这里注册武器的标签。
 * @default []
 *
 * @param Armor Tag Settings
 * @text 护甲标签配置
 * @parent --- 基础配置参数 ---
 * @type struct<ArmorSetting>[]
 * @desc 在这里注册护甲的标签。
 * @default []
 *
 * @help
 * ============================================================================
 * 插件参数说明
 * ============================================================================
 * 更新日志 (v3.63):
 * - 修复：首次打开状态菜单时字体无法加载的问题（增加字体预加载逻辑）。
 *
 * 更新日志 (v3.62):
 * - 修复：Game_Actor.prototype.getTags 中判断装备类型的逻辑错误，
 * 解决了武器和护甲标签无法显示的问题。
 *
 * 更新日志 (v3.61):
 * - 新增背景描边功能：支持为【】标签背景添加自定义颜色的外边框。
 * * 更新日志 (v3.60):
 * - 核心技术升级：引入 Canvas Scale 缩放技术。
 * - 突破限制：现在可以显示任意大小的字体（例如 8px, 6px），
 * 即便浏览器内核强制最小字号为 12px，本插件也会通过缩放强制显示为小字号。
 *
 * 核心特性 (合并版)：
 * * 1. 【完美间隙与背景】:
 * - 继承了完美间隙版的圆角背景、对称扩展和外部间距逻辑。
 * * 2. 【预加载字体隔离 (直绘版)】:
 * - 强制使用 TagFontName 字体。
 * - 彻底隔离全局 Bitmap&DrawTextEx 特效（无强制渐变、无描边）。
 * * 3. 【正逆练自动切换】:
 * - 角色每3-7场战斗自动切换正/逆练阶段。
 * - Tier 2 标签会自动根据阶段激活“绑定状态”或“逆练绑定状态”。
 *
 * ============================================================================
 */

/*~struct~ActorSetting:
 * @param Actor ID
 * @text 角色ID
 * @type number
 * @min 1
 * @desc 数据库中对应的角色ID
 * @default 1
 *
 * @param Tags
 * @text 标签列表
 * @type struct<TagData>[]
 * @desc 该角色拥有的标签集合
 * @default []
 */

/*~struct~EnemySetting:
 * @param Enemy ID
 * @text 敌人ID
 * @type number
 * @min 1
 * @desc 数据库中对应的敌人ID
 * @default 1
 *
 * @param Tags
 * @text 标签列表
 * @type struct<TagData>[]
 * @desc 该敌人拥有的标签集合
 * @default []
 */

/*~struct~WeaponSetting:
 * @param Weapon ID
 * @text 武器ID
 * @type number
 * @min 1
 * @desc 数据库中对应的武器ID
 * @default 1
 *
 * @param Tags
 * @text 标签列表
 * @type struct<TagDataEquip>[]
 * @desc 该武器拥有的标签集合
 * @default []
 */

/*~struct~ArmorSetting:
 * @param Armor ID
 * @text 护甲ID
 * @type number
 * @min 1
 * @desc 数据库中对应的护甲ID
 * @default 1
 *
 * @param Tags
 * @text 标签列表
 * @type struct<TagDataEquip>[]
 * @desc 该护甲拥有的标签集合
 * @default []
 */

/*~struct~TagData:
 * @param Name
 * @text 标签名
 * @type string
 * @default 新标签
 *
 * @param Note
 * @text 标签注释
 * @type string
 * @default 无描述
 *
 * @param Effect
 * @text 效果文本 (正练)
 * @type string
 * @desc 正练状态下显示的说明文本。支持语法：【显示文字】[背景色ID][文字色ID]
 * @default 无效果
 *
 * @param Reverse Effect
 * @text 效果文本 (逆练)
 * @type string
 * @desc 逆练状态下显示的说明文本。仅当Tier=2且处于逆练阶段时生效。
 * @default 无效果
 *
 * @param Tier
 * @text 标签品级
 * @type number
 * @min 1
 * @max 5
 * @desc 1=普通, 2=可正逆切换(修炼), 3=史诗, 4=装备, 5=标志
 * @default 1
 *
 * @param State IDs
 * @text 绑定状态 (正练)
 * @type number[]
 * @desc 当标签生效且处于正练阶段(或非Tier2)时，赋予角色的状态ID列表。
 * @default []
 *
 * @param Reverse State IDs
 * @text 绑定状态 (逆练)
 * @type number[]
 * @desc 当标签生效且处于逆练阶段(Tier=2)时，赋予角色的状态ID列表。
 * @default []
 */

/*~struct~TagDataEquip:
 * @param Name
 * @text 标签名
 * @type string
 * @default 新标签
 *
 * @param Note
 * @text 标签注释
 * @type string
 * @default 无描述
 *
 * @param Effect
 * @text 效果文本 (正练)
 * @type string
 * @desc 正练状态下显示的说明文本。支持语法：【显示文字】[背景色ID][文字色ID]
 * @default 无效果
 *
 * @param Reverse Effect
 * @text 效果文本 (逆练)
 * @type string
 * @desc 逆练状态下显示的说明文本。仅当Tier=2且处于逆练阶段时生效。
 * @default 无效果
 *
 * @param Tier
 * @text 标签品级
 * @type number
 * @min 1
 * @max 5
 * @desc 1=普通, 2=可正逆切换, 3=史诗, 4=装备, 5=标志
 * @default 4
 *
 * @param State IDs
 * @text 绑定状态 (正练)
 * @type number[]
 * @desc 当标签生效且处于正练阶段(或非Tier2)时，赋予角色的状态ID列表。
 * @default []
 *
 * @param Reverse State IDs
 * @text 绑定状态 (逆练)
 * @type number[]
 * @desc 当标签生效且处于逆练阶段(Tier=2)时，赋予角色的状态ID列表。
 * @default []
 */

var Imported = Imported || {};
Imported.TagSystem = true;

var TagSystem = TagSystem || {};
TagSystem.Parameters = PluginManager.parameters('TagSystem');

// 解析自定义视觉参数
TagSystem.Params = {
    fontSizeReduction: Number(TagSystem.Parameters['FontSizeReduction'] || 4),
    tagFontName: TagSystem.Parameters['TagFontName'] || '微软雅黑',
    bgHeightRatio: Number(TagSystem.Parameters['BgHeightRatio'] || 0.9),
    bgWidthScale: Number(TagSystem.Parameters['BgWidthScale'] || 1.2),
    bgBorderRadius: Number(TagSystem.Parameters['BgBorderRadius'] || 4),
    bgHorizontalPadding: Number(TagSystem.Parameters['BgHorizontalPadding'] || 2),
    bgBlockMargin: Number(TagSystem.Parameters['BgBlockMargin'] || 2),
    // 解析透明度并转换为0-1
    bgOpacity: Number(TagSystem.Parameters['BgOpacity'] === undefined ? 255 : TagSystem.Parameters['BgOpacity']) / 255,
    // 解析描边参数
    bgStrokeWidth: Number(TagSystem.Parameters['BgStrokeWidth'] || 0),
    bgStrokeColor: String(TagSystem.Parameters['BgStrokeColor'] || '#FFFFFF'),
    
    textBaselineOffset: Number(TagSystem.Parameters['TextBaselineOffset'] || 0),
    bgBaselineOffset: Number(TagSystem.Parameters['BgBaselineOffset'] || 0)
};

var $dataTags = $dataTags || {};

(function() {

    // 扩展CanvasRenderingContext2D：绘制圆角矩形 (填充)
    CanvasRenderingContext2D.prototype.fillRoundedRect = function(x, y, width, height, radius) {
        this.beginPath();
        this.moveTo(x + radius, y);
        this.lineTo(x + width - radius, y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.lineTo(x + width, y + height - radius);
        this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.lineTo(x + radius, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.lineTo(x, y + radius);
        this.quadraticCurveTo(x, y, x + radius, y);
        this.closePath();
        this.fill();
    };

    // 扩展CanvasRenderingContext2D：绘制圆角矩形 (描边) - 新增
    CanvasRenderingContext2D.prototype.strokeRoundedRect = function(x, y, width, height, radius) {
        this.beginPath();
        this.moveTo(x + radius, y);
        this.lineTo(x + width - radius, y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.lineTo(x + width, y + height - radius);
        this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.lineTo(x + radius, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.lineTo(x, y + radius);
        this.quadraticCurveTo(x, y, x + radius, y);
        this.closePath();
        this.stroke();
    };

    TagSystem.parseJson = function(str) {
        try {
            return JSON.parse(str);
        } catch (e) {
            return [];
        }
    };

    TagSystem.parseTagList = function(jsonStr, defaultTier) {
        var list = TagSystem.parseJson(jsonStr);
        return list.map(function(tagStr) {
            var tagObj = TagSystem.parseJson(tagStr);
            var dTier = defaultTier || 1;

            return {
                name: tagObj.Name || "",
                note: tagObj.Note || "",
                effect: tagObj.Effect || "",
                reverseEffect: tagObj['Reverse Effect'] || "", 
                tier: Number(tagObj.Tier || dTier),
                stateIds: TagSystem.parseJson(tagObj['State IDs'] || '[]').map(Number), 
                reverseStateIds: TagSystem.parseJson(tagObj['Reverse State IDs'] || '[]').map(Number) 
            };
        });
    };

    TagSystem.parseSettings = function(paramName, idParamName, defaultTier) {
        var rawList = TagSystem.parseJson(TagSystem.Parameters[paramName] || '[]');
        var dataMap = {};
        
        rawList.forEach(function(settingStr) {
            var setting = TagSystem.parseJson(settingStr);
            var id = Number(setting[idParamName]);
            var tags = TagSystem.parseTagList(setting.Tags || '[]', defaultTier);
            
            if (id > 0) {
                dataMap[id] = tags;
            }
        });
        return dataMap;
    };

    var _DataManager_createGameObjects = DataManager.createGameObjects;
    DataManager.createGameObjects = function() {
        _DataManager_createGameObjects.call(this);
        TagSystem.loadTagData();
    };

    TagSystem.loadTagData = function() {
        $dataTags = $dataTags || {};
        $dataTags = {
            actors: TagSystem.parseSettings('Actor Tag Settings', 'Actor ID', 1),
            enemies: TagSystem.parseSettings('Enemy Tag Settings', 'Enemy ID', 1),
            weapons: TagSystem.parseSettings('Weapon Tag Settings', 'Weapon ID', 4),
            armors: TagSystem.parseSettings('Armor Tag Settings', 'Armor ID', 4)
        };
    };

    //-----------------------------------------------------------------------------
    // 解析特殊样式文本
    //-----------------------------------------------------------------------------
    TagSystem.parseStyledText = function(text) {
        if (!text || text === '') return [{ type: 'text', content: text }];
        
        const result = [];
        const regex = /【([^】]+?)】\[\s*(\d+)\s*\]\[\s*(\d+)\s*\]/g;
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                result.push({
                    type: 'text',
                    content: text.substring(lastIndex, match.index)
                });
            }

            const content = match[1].trim();
            const bgColorId = Number(match[2]) || 0;
            const textColorId = Number(match[3]) || 0;

            result.push({
                type: 'styled',
                content: content,
                bgColorId: bgColorId,
                textColorId: textColorId
            });

            lastIndex = regex.lastIndex;
        }

        if (lastIndex < text.length) {
            result.push({
                type: 'text',
                content: text.substring(lastIndex)
            });
        }

        return result;
    };

    //-----------------------------------------------------------------------------
    // 核心绘制逻辑（修复：突破最小字号限制）
    //-----------------------------------------------------------------------------
    const _Window_Base_processNormalCharacter = Window_Base.prototype.processNormalCharacter;
    Window_Base.prototype.processNormalCharacter = function(textState) {
        if (textState.styledText && textState.styledIndex < textState.styledText.length) {
            const styledItem = textState.styledText[textState.styledIndex];
            if (styledItem.type === 'styled' && !textState.styledProcessing) {
                this.drawStyledTextBlock(styledItem, textState);
                textState.styledIndex++;
                return;
            }
        }
        _Window_Base_processNormalCharacter.call(this, textState);
    };

    Window_Base.prototype.drawStyledTextBlock = function(styledItem, textState) {
        const content = styledItem.content;
        const bgColorId = styledItem.bgColorId;
        const textColorId = styledItem.textColorId;

        // 1. 保存原生状态
        const originalFontSize = this.contents.fontSize || 28;
        const originalFontFace = this.contents.fontFace;
        const originalPaintOpacity = this.contents.paintOpacity;
        const originalOutlineWidth = this.contents.outlineWidth;
        const originalOutlineColor = this.contents.outlineColor;
        const originalShadow = this.contents.shadow;
        const originalFillStyle = this.contents._context.fillStyle;
        const originalStrokeStyle = this.contents._context.strokeStyle;
        const originalShadowColor = this.contents._context.shadowColor;
        const originalShadowBlur = this.contents._context.shadowBlur;
        const originalShadowOffsetX = this.contents._context.shadowOffsetX;
        const originalShadowOffsetY = this.contents._context.shadowOffsetY;
        const originalTextBaseline = this.contents._context.textBaseline; 

        // 2. 读取并计算目标字号
        const fontSizeReduction = TagSystem.Params.fontSizeReduction;
        const margin = TagSystem.Params.bgBlockMargin; 
        
        // 目标字号（比如14 - 10 = 4px）
        let targetFontSize = originalFontSize - fontSizeReduction;
        targetFontSize = Math.max(targetFontSize, 1); // 允许极小值

        // --- 核心修复：突破最小字号限制 (Scale Approach) ---
        var minBrowserFontSize = 12; // 大多数浏览器限制为12px
        var renderFontSize = targetFontSize;
        var scaleRatio = 1.0;

        // 如果目标字号小于12，则强制渲染为12，然后缩小画布
        if (targetFontSize < minBrowserFontSize) {
            scaleRatio = targetFontSize / minBrowserFontSize; // 例如 8/12 = 0.66
            renderFontSize = minBrowserFontSize; // 实际渲染字号设为12
        }

        try {
            // 清理环境
            this.contents.outlineWidth = 0;
            this.contents.outlineColor = 'rgba(0,0,0,0)';
            this.contents.shadow = false;
            this.contents.outline = false;
            
            const ctx = this.contents._context;
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.strokeStyle = 'transparent';

            // 3. 计算尺寸 (使用 renderFontSize 计算宽度，再乘以缩放比得到实际视觉宽度)
            // 先设置渲染字号，以便 measureText 获得 12px 下的宽度
            this.contents.fontFace = TagSystem.Params.tagFontName;
            this.contents.fontSize = renderFontSize;
            
            var rawTextWidth = this.textWidth(content); // 这是 12px 时的宽度
            var visualTextWidth = rawTextWidth * scaleRatio; // 这是 8px 时的视觉宽度

            // 背景计算基于“视觉宽度”和“原始字号(originalFontSize)”
            const baseBgHeight = originalFontSize * TagSystem.Params.bgHeightRatio;
            const baseBgWidth = visualTextWidth * TagSystem.Params.bgWidthScale + TagSystem.Params.bgHorizontalPadding * 2;
            const singleSideExpand = (baseBgWidth - visualTextWidth) / 2;
            
            const bgX = textState.x + margin;
            const bgY = textState.y + TagSystem.Params.bgBaselineOffset + (this.lineHeight() - baseBgHeight) / 2;
            const textX = bgX + singleSideExpand; // 文字的视觉起始点 X
            
            // 4. 绘制背景 (不需要缩放，按正常坐标绘制)
            if (bgColorId > 0 && bgColorId <= 15) {
                const bgColor = this.textColor(bgColorId);
                ctx.save();
                ctx.fillStyle = bgColor;
                
                // --- 应用透明度 ---
                ctx.globalAlpha = TagSystem.Params.bgOpacity; 
                
                // 绘制填充
                ctx.fillRoundedRect(bgX, bgY, baseBgWidth, baseBgHeight, TagSystem.Params.bgBorderRadius);
                
                // --- 绘制描边 (新增) ---
                if (TagSystem.Params.bgStrokeWidth > 0) {
                    // 重置Alpha为1，确保边框清晰（或您可以注释掉这行使其半透明）
                    ctx.globalAlpha = 1.0; 
                    ctx.lineWidth = TagSystem.Params.bgStrokeWidth;
                    ctx.strokeStyle = TagSystem.Params.bgStrokeColor;
                    ctx.strokeRoundedRect(bgX, bgY, baseBgWidth, baseBgHeight, TagSystem.Params.bgBorderRadius);
                }

                ctx.restore();
                this.contents._dirty = true;
            }

            // 5. 绘制文字 (应用缩放)
            ctx.save();
            
            var fontStyle = '';
            if (this.contents.fontItalic) fontStyle += 'italic ';
            if (this.contents.fontBold) fontStyle += 'bold ';
            // 使用 renderFontSize (至少12px)
            ctx.font = fontStyle + renderFontSize + 'px "' + TagSystem.Params.tagFontName + '"';
            ctx.fillStyle = this.textColor(textColorId);
            ctx.textBaseline = 'middle';
            
            // 计算垂直居中位置
            const lh = this.lineHeight();
            const ty = textState.y + lh / 2 + TagSystem.Params.textBaselineOffset;

            // 应用缩放
            // 注意：ctx.scale 会缩放坐标系，所以绘制坐标要除以缩放比
            if (scaleRatio !== 1.0) {
                ctx.scale(scaleRatio, scaleRatio);
                ctx.fillText(content, textX / scaleRatio, ty / scaleRatio);
            } else {
                ctx.fillText(content, textX, ty);
            }
            
            ctx.restore();
            
            this.contents._dirty = true;

            // 6. 推进坐标 (使用背景块的宽度)
            textState.x = bgX + baseBgWidth + margin;

        } finally {
            // 恢复所有状态
            this.contents.fontSize = originalFontSize;
            this.contents.fontFace = originalFontFace;
            this.contents.paintOpacity = originalPaintOpacity;
            this.contents.outlineWidth = originalOutlineWidth;
            this.contents.outlineColor = originalOutlineColor;
            if (originalShadow !== undefined) this.contents.shadow = originalShadow;
            this.contents.outline = true;
            
            this.contents._context.fillStyle = originalFillStyle;
            this.contents._context.strokeStyle = originalStrokeStyle;
            this.contents._context.shadowColor = originalShadowColor;
            this.contents._context.shadowBlur = originalShadowBlur;
            this.contents._context.shadowOffsetX = originalShadowOffsetX;
            this.contents._context.shadowOffsetY = originalShadowOffsetY;
            this.contents._context.textBaseline = originalTextBaseline; 
            
            this.changeTextColor(this.normalColor());
        }
    };

    //-----------------------------------------------------------------------------
    // 重写drawText以支持混合绘制
    //-----------------------------------------------------------------------------
    const _Window_Base_drawText = Window_Base.prototype.drawText;
    Window_Base.prototype.drawText = function(text, x, y, width, align) {
        if (!text || text === '') return _Window_Base_drawText.call(this, text, x, y, width, align);

        const styledText = TagSystem.parseStyledText(text);
        if (styledText.length === 1 && styledText[0].type === 'text') {
            return _Window_Base_drawText.call(this, text, x, y, width, align);
        }

        const textState = {
            x: x,
            y: y,
            width: width,
            height: this.lineHeight(),
            align: align || 'left',
            styledText: styledText,
            styledIndex: 0,
            styledProcessing: false
        };

        while (textState.styledIndex < styledText.length) {
            const item = styledText[textState.styledIndex];
            if (item.type === 'text') {
                const originalOutline = this.contents.outline;
                const originalTextColor = this.contents.textColor; 
                const originalFontFace = this.contents.fontFace;
                
                this.contents.outline = true;
                this.contents.fontFace = originalFontFace;
                this.changeTextColor(this.normalColor());
                
                const remainingWidth = textState.width - (textState.x - x);
                _Window_Base_drawText.call(this, item.content, textState.x, textState.y, remainingWidth, textState.align);
                
                textState.x += this.textWidth(item.content);
                textState.styledIndex++;
                
                this.contents.outline = originalOutline;
            } else {
                this.processNormalCharacter(textState);
            }
        }
    };

    //-----------------------------------------------------------------------------
    // 角色/敌人标签与修炼逻辑
    //-----------------------------------------------------------------------------
    
    var _Game_Actor_setup = Game_Actor.prototype.setup;
    Game_Actor.prototype.setup = function(actorId) {
        _Game_Actor_setup.call(this, actorId);
        if (this.actorId() > 0 && $dataActors[this.actorId()]) {
            this.initTagCultivation();
        }
    };

    Game_Actor.prototype.initTagCultivation = function() {
        this._tagPhase = 0; // 0 = 正练, 1 = 逆练
        this._tagBattleCount = 0;
        this._tagBattleLimit = this.generateTagBattleLimit();
    };

    Game_Actor.prototype.generateTagBattleLimit = function() {
        return Math.floor(Math.random() * 5) + 3; 
    };

    Game_Actor.prototype.getTagPhase = function() {
        return this._tagPhase || 0;
    };

    var _Game_Actor_onBattleEnd = Game_Actor.prototype.onBattleEnd;
    Game_Actor.prototype.onBattleEnd = function() {
        _Game_Actor_onBattleEnd.call(this);
        this.updateTagCultivation();
    };

    Game_Actor.prototype.updateTagCultivation = function() {
        if (this._tagBattleLimit === undefined) this.initTagCultivation();

        this._tagBattleCount++;
        if (this._tagBattleCount >= this._tagBattleLimit) {
            this._tagBattleCount = 0;
            this._tagBattleLimit = this.generateTagBattleLimit();
            this._tagPhase = (this._tagPhase === 0) ? 1 : 0;
            this.refresh();
        }
    };

    // [Fix] 修复武器/装备标签读取逻辑
    Game_Actor.prototype.getTags = function() {
        if (!$dataTags) return [];
        
        var tags = [];
        var actorId = this.actorId();
        
        // 1. 获取角色自身标签
        if ($dataTags.actors && $dataTags.actors[actorId]) {
            // 使用 map 浅拷贝对象，防止污染源数据
            const actorTags = $dataTags.actors[actorId].map(function(tag) {
                var newTag = JsonEx.makeDeepCopy(tag);
                newTag.isEquip = false;
                return newTag;
            });
            tags = tags.concat(actorTags);
        }

        // 2. 获取装备标签 (修复版)
        this.equips().forEach(function(equip) {
            // 如果装备为空，跳过
            if (!equip) return;
            
            var equipTags = [];
            
            // 使用 DataManager 正确判断类型
            if (DataManager.isWeapon(equip)) {
                if ($dataTags.weapons && $dataTags.weapons[equip.id]) {
                    equipTags = $dataTags.weapons[equip.id];
                }
            } else if (DataManager.isArmor(equip)) {
                if ($dataTags.armors && $dataTags.armors[equip.id]) {
                    equipTags = $dataTags.armors[equip.id];
                }
            }
            
            if (equipTags.length > 0) {
                var taggedEquipTags = equipTags.map(function(tag) {
                    var newTag = JsonEx.makeDeepCopy(tag);
                    newTag.isEquip = true; // 标记为装备提供的标签
                    return newTag;
                });
                tags = tags.concat(taggedEquipTags);
            }
        });

        return tags;
    };

    Game_Enemy.prototype.getTags = function() {
        if (!$dataTags) return [];
        const enemyId = this.enemyId();
        return $dataTags.enemies[enemyId] || [];
    };

    Game_BattlerBase.prototype.getTagStates = function() {
        var states = [];
        if (!this.isActor()) return states;
        if (typeof this.getTags !== 'function') return states;

        var tags = this.getTags();
        var currentPhase = this.getTagPhase();

        for (var i = 0; i < tags.length; i++) {
            var tag = tags[i];
            var targetIds = [];

            if (tag.tier === 2) {
                if (currentPhase === 1) {
                    targetIds = tag.reverseStateIds; 
                } else {
                    targetIds = tag.stateIds;        
                }
            } else {
                targetIds = tag.stateIds;
            }

            if (targetIds && targetIds.length > 0) {
                for (var j = 0; j < targetIds.length; j++) {
                    var sId = targetIds[j];
                    if (sId > 0 && $dataStates[sId]) {
                        states.push($dataStates[sId]);
                    }
                }
            }
        }
        return states;
    };

    var _Game_BattlerBase_traitObjects = Game_BattlerBase.prototype.traitObjects;
    Game_BattlerBase.prototype.traitObjects = function() {
        var objects = _Game_BattlerBase_traitObjects.call(this);
        var tagStates = this.getTagStates();
        if (tagStates && tagStates.length > 0) {
            objects = objects.concat(tagStates);
        }
        return objects;
    };

    Game_BattlerBase.prototype.hasTagState = function(stateId) {
        var objects = this.traitObjects();
        for (var i = 0; i < objects.length; i++) {
            if (objects[i].id === stateId && objects[i].iconIndex !== undefined) { 
                return true; 
            }
        }
        return false;
    };

    // ============================================================================
    // 修复：字体预加载逻辑 (Fix for Font Loading Issue)
    // ============================================================================
    // 在游戏启动时，强制创建一个临时的 Bitmap 并绘制一次该字体，
    // 以强迫浏览器立即加载字体文件。这解决了首次打开菜单字体不显示的问题。
    // ============================================================================

    TagSystem.preloadFont = function() {
        if (this._fontPreloaded) return;
        var fontName = TagSystem.Params.tagFontName;
        if (!fontName) return;

        // 方法 1: 尝试使用现代浏览器 API (可选)
        if (window.document && window.document.fonts && window.document.fonts.load) {
            try {
                window.document.fonts.load("20px " + fontName);
            } catch (e) {
                // Ignore
            }
        }

        // 方法 2: 暴力绘制法 (最可靠)
        // 创建一个极小的 Bitmap，设置字体并绘制文字，触发浏览器加载机制
        var tempBitmap = new Bitmap(100, 100);
        tempBitmap.fontFace = fontName;
        tempBitmap.drawText("Preload", 0, 0, 100, 30);
        
        // 标记已执行
        this._fontPreloaded = true;
        // console.log("TagSystem: Font '" + fontName + "' preloading triggered.");
    };

    // 挂载到 Scene_Boot (游戏启动场景)
    var _Scene_Boot_create = Scene_Boot.prototype.create;
    Scene_Boot.prototype.create = function() {
        _Scene_Boot_create.call(this);
        TagSystem.preloadFont();
    };

})();