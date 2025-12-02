# 天工百物 · 三元配对游戏

## 📖 项目简介

这是一个基于俄罗斯方块机制的教育类小游戏，通过游戏方式学习中国传统农耕工具的物元知识（对象、特征、量值三元组）。玩家需要将下落的方块正确放置到对应的列中，完成物元三元组的配对。

## 🎮 游戏机制

### 核心玩法
- 游戏板分为三列：**对象列**、**特征列**、**量值列**
- 方块形状：统一为 1×4 的长条形
- 每个方块包含文本信息（对象名/特征/量值）
- 方块必须放置到正确的列才能得分
- 完成所有三元组配对后进入下一关

### 关卡设计
- **第一关 - 耒（lěi）**：11 个三元组
- **第二关 - 耜（sì）**：16 个三元组
- **第三关 - 犁（lí）**：16 个三元组
- 支持扩展更多关卡

## 🏗️ 技术架构

### 文件结构
```
els/
├── index.html          # 主 HTML 文件
├── style.css          # 样式文件
├── script.js          # 游戏逻辑（主文件）
└── README.md          # 项目文档（本文件）
```

### 核心类：TetrisGame

```javascript
class TetrisGame {
    // 游戏配置
    rows: 20              // 游戏板行数
    cols: 12              // 游戏板列数（每列4格）
    blockSize: 25         // 方块尺寸（像素）
    
    // 游戏状态
    board[][]             // 游戏板数组
    currentPiece          // 当前方块
    nextPiece             // 下一个方块
    score                 // 当前分数
    level                 // 当前关卡
    gameRunning           // 游戏运行状态
    gamePaused            // 游戏暂停状态
    levelCompleted        // 关卡完成标志
    
    // 关卡数据
    level1Data            // 第一关数据
    level2Data            // 第二关数据
    level3Data            // 第三关数据
}
```

## 🔧 关卡数据结构

每个关卡数据包含以下字段：

```javascript
levelXData = {
    // 原始三元组数据（不会被修改）
    originalTriples: [
        { object: '对象名', feature: '特征', value: '量值' },
        // ...更多三元组
    ],
    
    // 实际使用的三元组（可能被打乱）
    triples: [],
    
    // 当前进度索引
    currentIndex: 0,
    
    // 完成状态跟踪
    completed: [],
    
    // 三列的位置定义
    columns: {
        object: 0,    // 对象列：0-3
        feature: 4,   // 特征列：4-7
        value: 8      // 量值列：8-11
    },
    
    // 随机掉落顺序
    dropOrders: [],
    
    // 三元组的随机顺序索引
    tripleOrder: [],
    
    // 初始化方法
    initDropOrders() { ... }
}
```

## 🎨 颜色系统

游戏使用系统化的颜色索引：

```javascript
// 索引 0: 空方块
// 索引 1-3: 底部标签颜色（对象、特征、量值）
// 索引 4-6: 物元1（耒）的三列颜色
// 索引 7-9: 物元2（耒头）的三列颜色
// ...以此类推
```

### 颜色规则
- **对象列**：蓝色系/紫色系
- **特征列**：绿色系
- **量值列**：红色系/橙色系

## 🐛 已知问题与修复方案

### ❌ 问题 1：关卡跳转错乱（已修复）

**症状**：第一关通过后直接跳到第三关，跳过第二关

**根本原因**：
1. `init()` 方法缺少 `level3Data.initDropOrders()` 初始化
2. `reset()` 方法缺少第三关数据重置
3. `gameLoop()` 方法缺少第三关通关检查

**修复方案**：

#### 修复 1：init() 方法（约第 398-401 行）
```javascript
// 初始化随机掉落顺序
this.level1Data.initDropOrders();
this.level2Data.initDropOrders();
this.level3Data.initDropOrders(); // ✅ 添加这一行
```

#### 修复 2：reset() 方法（约第 2219-2223 行后）
```javascript
// 重置第二关卡数据
this.level2Data.currentIndex = 0;
this.level2Data.completed = [];
this.level2Data.initDropOrders();

// ✅ 添加以下代码块
// 重置第三关卡数据
this.level3Data.currentIndex = 0;
this.level3Data.completed = [];
this.level3Data.initDropOrders();
```

#### 修复 3：gameLoop() 方法（约第 2284-2286 行后）
```javascript
// 检查第二关是否通关
else if (this.level === 2 && this.level2Data.completed.length === 16 && 
         this.level2Data.completed.every(t => t.object && t.feature && t.value) && 
         !this.levelCompleted) {
    this.levelCompleted = true;
    this.level1Win();
}
// ✅ 添加以下代码块
// 检查第三关是否通关
else if (this.level === 3 && this.level3Data.completed.length === 16 && 
         this.level3Data.completed.every(t => t.object && t.feature && t.value) && 
         !this.levelCompleted) {
    this.levelCompleted = true;
    this.level1Win();
}
```

## 🚀 扩展性优化建议

当前代码存在**代码重复**和**扩展性差**的问题。建议进行以下重构：

### 优化 1：统一关卡管理

```javascript
// 在构造函数中添加
this.levels = [
    null,              // 占位符，索引从1开始
    this.level1Data,
    this.level2Data,
    this.level3Data
    // 未来可以轻松添加第四关、第五关...
];

// 获取当前关卡配置
getCurrentLevelConfig() {
    return this.levels[this.level];
}
```

### 优化 2：统一初始化方法

```javascript
initAllLevels() {
    for (let i = 1; i < this.levels.length; i++) {
        if (this.levels[i]) {
            this.levels[i].initDropOrders();
        }
    }
}

// 在 init() 中调用
init() {
    // ...其他代码
    this.initAllLevels(); // 替代原来的手动初始化
    // ...
}
```

### 优化 3：统一重置方法

```javascript
resetAllLevels() {
    for (let i = 1; i < this.levels.length; i++) {
        if (this.levels[i]) {
            this.levels[i].currentIndex = 0;
            this.levels[i].completed = [];
            this.levels[i].initDropOrders();
        }
    }
}

// 在 reset() 中调用
reset() {
    // ...其他代码
    this.resetAllLevels(); // 替代原来的手动重置
    // ...
}
```

### 优化 4：通用的方块生成逻辑

```javascript
spawnNewPiece() {
    const levelConfig = this.getCurrentLevelConfig();
    
    if (!levelConfig) {
        // 使用默认随机生成（用于测试或其他模式）
        this.spawnRandomPiece();
        return;
    }
    
    // 检查是否完成所有三元组
    if (levelConfig.currentIndex >= levelConfig.triples.length) {
        this.level1Win();
        return;
    }
    
    // 通用的方块生成逻辑
    const piece = this.generatePieceFromLevel(levelConfig);
    this.currentPiece = piece.current;
    this.nextPiece = piece.next;
}

generatePieceFromLevel(levelConfig) {
    // 提取重复的方块生成逻辑到单独的方法
    // ...
}
```

### 优化 5：简化通关检查

```javascript
// 在 gameLoop() 中
checkLevelCompletion() {
    const levelConfig = this.getCurrentLevelConfig();
    
    if (!levelConfig || this.levelCompleted) return;
    
    const totalTriples = levelConfig.triples.length;
    const completed = levelConfig.completed;
    
    if (completed.length === totalTriples && 
        completed.every(t => t.object && t.feature && t.value)) {
        this.levelCompleted = true;
        this.level1Win();
    }
}

// 在 gameLoop() 中调用
gameLoop(timestamp) {
    // ...其他代码
    this.checkLevelCompletion(); // 替代原来的多个 if-else
    // ...
}
```

## 📝 如何添加新关卡

### 步骤 1：定义关卡数据

在构造函数中添加新关卡数据（例如第四关）：

```javascript
// 第四关卡"镰（lián）"数据结构
this.level4Data = {
    originalTriples: [
        { object: '镰（lián）', feature: '萌芽期', value: '新石器时代' },
        { object: '镰（lián）', feature: '衰退期', value: '现代' },
        // ...添加更多三元组
    ],
    triples: [],
    currentIndex: 0,
    completed: [],
    columns: {
        object: 0,
        feature: 4,
        value: 8
    },
    dropOrders: [],
    tripleOrder: [],
    initDropOrders() {
        // 复制 level1Data 的 initDropOrders 方法
        this.triples = JSON.parse(JSON.stringify(this.originalTriples));
        this.tripleOrder = [];
        for (let i = 0; i < this.triples.length; i++) {
            this.tripleOrder.push(i);
        }
        // Fisher-Yates 洗牌
        for (let i = this.tripleOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.tripleOrder[i], this.tripleOrder[j]] = [this.tripleOrder[j], this.tripleOrder[i]];
        }
        this.dropOrders = [];
        for (let i = 0; i < this.triples.length; i++) {
            const order = ['object', 'feature', 'value'];
            for (let j = order.length - 1; j > 0; j--) {
                const k = Math.floor(Math.random() * (j + 1));
                [order[j], order[k]] = [order[k], order[j]];
            }
            this.dropOrders.push(order);
        }
    }
};
```

### 步骤 2：添加颜色定义

在 `this.colors` 数组中添加新物元的颜色（索引 37-39+）：

```javascript
'#新颜色1', // 物元13 - 对象（镰）
'#新颜色2', // 物元13 - 特征
'#新颜色3', // 物元13 - 量值
// ...
```

### 步骤 3：添加物元名称

在 `this.elementNames` 数组中添加：

```javascript
'镰（lián）', // 第四关
```

### 步骤 4：初始化新关卡

在 `init()` 方法中添加：

```javascript
this.level4Data.initDropOrders();
```

### 步骤 5：重置新关卡

在 `reset()` 方法中添加：

```javascript
// 重置第四关卡数据
this.level4Data.currentIndex = 0;
this.level4Data.completed = [];
this.level4Data.initDropOrders();
```

### 步骤 6：添加方块生成逻辑

在 `spawnNewPiece()` 方法中添加 `else if (this.level === 4)` 分支（复制第三关的代码并修改）。

### 步骤 7：添加通关检查

在 `gameLoop()` 方法中添加：

```javascript
else if (this.level === 4 && this.level4Data.completed.length === 三元组数量 && 
         this.level4Data.completed.every(t => t.object && t.feature && t.value) && 
         !this.levelCompleted) {
    this.levelCompleted = true;
    this.level1Win();
}
```

### 步骤 8：更新关卡切换

在 `goToNextLevel()` 方法中添加：

```javascript
else if (this.level === 3) {
    this.level = 4;
    this.level4Data.currentIndex = 0;
    this.level4Data.completed = [];
    this.level4Data.initDropOrders();
}
```

### 步骤 9：更新通关模态框

在 `showLevel1WinModal()` 方法中添加：

```javascript
else if (this.level === 4) {
    descriptionElement.textContent = '通过第4关-镰（lián）的考验！';
    nextBtn.textContent = '下一关'; // 或 '重新开始'
    nextBtn.style.display = 'inline-block';
}
```

### 步骤 10：更新 `restartLevel()` 方法

添加对第四关的重置处理。

## 🎯 关键方法说明

### spawnNewPiece()
生成新的下落方块。根据当前关卡和进度，生成对应的物元方块（对象/特征/量值）。

### move(dx, dy)
移动当前方块。检查碰撞和有效性。

### placePiece()
放置方块到游戏板。触发验证逻辑，检查是否放置正确。

### validatePlacement()
验证方块是否放置到正确的列。正确则标记完成，错误则触发错误提示。

### checkRowsForCompletion()
检查是否有行需要清除（在本游戏中不清除行，仅用于检测完成状态）。

### level1Win()
触发关卡通关庆祝流程（音效、烟花、模态框）。

### goToNextLevel()
进入下一关。重置游戏状态，切换关卡数据。

### restartLevel()
重新开始当前关卡。

## 🎮 操作说明

### 键盘控制
- **←/→ 方向键**：左右移动方块
- **↓ 方向键**：加速下落
- **空格键**：瞬间落地

### 触摸控制
- **左右滑动**：移动方块
- **下滑**：加速下落

### 按钮控制
- **开始**：开始游戏
- **暂停**：暂停/继续游戏
- **重新开始**：重置游戏到第一关
- **方向按钮**：触摸设备使用的虚拟按键

## 🔍 调试技巧

### 查看当前关卡状态
在浏览器控制台输入：
```javascript
console.log('当前关卡:', tetrisGame.level);
console.log('关卡数据:', tetrisGame[`level${tetrisGame.level}Data`]);
console.log('完成状态:', tetrisGame[`level${tetrisGame.level}Data`].completed);
```

### 跳过当前关卡（测试用）
```javascript
tetrisGame.level1Win();
```

### 查看颜色系统
```javascript
console.log('颜色数组:', tetrisGame.colors);
```

## 📦 部署说明

### 本地运行
直接用浏览器打开 `index.html` 即可运行。

### 服务器部署
将整个 `els` 文件夹上传到 Web 服务器即可。

### 注意事项
- 确保所有文件使用 UTF-8 编码（支持中文显示）
- 建议使用现代浏览器（Chrome、Firefox、Safari、Edge）

## 📄 许可证

本项目为教育用途开发。

## 👨‍💻 维护者

如有问题或建议，请联系项目维护者。

---

**最后更新时间**: 2025-11-30

**版本**: 1.0.0
