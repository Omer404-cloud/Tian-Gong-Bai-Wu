# 代码重构指南

## 🎯 重构目标

1. **修复关卡跳转 Bug**：确保 1→2→3 顺序正确
2. **提升代码可维护性**：减少重复代码
3. **增强扩展性**：方便添加新关卡
4. **优化架构**：统一关卡管理逻辑

## 🔧 立即修复（Critical Fixes）

### 修复 1：初始化第三关数据

**文件**: `script.js`
**位置**: 约第 398-401 行（`init()` 方法内）

**当前代码**:
```javascript
// 初始化随机掉落顺序
this.level1Data.initDropOrders();
this.level2Data.initDropOrders();
```

**修改为**:
```javascript
// 初始化随机掉落顺序
this.level1Data.initDropOrders();
this.level2Data.initDropOrders();
this.level3Data.initDropOrders(); // ✅ 新增
```

---

### 修复 2：重置第三关数据

**文件**: `script.js`
**位置**: 约第 2219-2223 行（`reset()` 方法内）

**当前代码**:
```javascript
// 重置第二关卡数据
this.level2Data.currentIndex = 0;
this.level2Data.completed = [];
this.level2Data.initDropOrders(); // 重新初始化随机掉落顺序
```

**在此代码后添加**:
```javascript
// 重置第三关卡数据
this.level3Data.currentIndex = 0;
this.level3Data.completed = [];
this.level3Data.initDropOrders(); // 重新初始化随机掉落顺序
```

---

### 修复 3：添加第三关通关检查

**文件**: `script.js`
**位置**: 约第 2284-2287 行（`gameLoop()` 方法内）

**当前代码**:
```javascript
// 检查第二关是否通关
else if (this.level === 2 && this.level2Data.completed.length === 16 && this.level2Data.completed.every(t => t.object && t.feature && t.value) && !this.levelCompleted) {
    this.levelCompleted = true;
    this.level1Win();
}
// 检查是否通关（例如达到第5级）
else if (this.level >= 5 && !this.levelCompleted) {
    this.levelCompleted = true;
    this.gameWin();
}
```

**修改为**:
```javascript
// 检查第二关是否通关
else if (this.level === 2 && this.level2Data.completed.length === 16 && this.level2Data.completed.every(t => t.object && t.feature && t.value) && !this.levelCompleted) {
    this.levelCompleted = true;
    this.level1Win();
}
// ✅ 新增：检查第三关是否通关
else if (this.level === 3 && this.level3Data.completed.length === 16 && this.level3Data.completed.every(t => t.object && t.feature && t.value) && !this.levelCompleted) {
    this.levelCompleted = true;
    this.level1Win();
}
// 检查是否通关（例如达到第5级）
else if (this.level >= 5 && !this.levelCompleted) {
    this.levelCompleted = true;
    this.gameWin();
}
```

---

## 🚀 深度重构（推荐但非必需）

### 重构 1：统一关卡管理器

**目标**: 将所有关卡数据统一管理，避免手动维护多个关卡

**在构造函数中添加** (约第 380 行后):

```javascript
// 统一关卡管理（放在 level3Data 定义之后）
this.levels = [
    null,              // 占位符，索引从1开始
    this.level1Data,   // 关卡1
    this.level2Data,   // 关卡2
    this.level3Data    // 关卡3
    // 未来添加更多关卡只需在这里追加即可
];

// 获取当前关卡配置
this.getCurrentLevelConfig = function() {
    return this.levels[this.level] || null;
};
```

---

### 重构 2：统一初始化方法

**新增方法** (放在 `init()` 方法之前):

```javascript
// 统一初始化所有关卡
initAllLevels() {
    for (let i = 1; i < this.levels.length; i++) {
        if (this.levels[i] && this.levels[i].initDropOrders) {
            this.levels[i].initDropOrders();
        }
    }
}
```

**修改 `init()` 方法**:

将原来的:
```javascript
// 初始化随机掉落顺序
this.level1Data.initDropOrders();
this.level2Data.initDropOrders();
this.level3Data.initDropOrders();
```

改为:
```javascript
// 初始化所有关卡
this.initAllLevels();
```

---

### 重构 3：统一重置方法

**新增方法** (放在 `reset()` 方法之前):

```javascript
// 统一重置所有关卡
resetAllLevels() {
    for (let i = 1; i < this.levels.length; i++) {
        if (this.levels[i]) {
            this.levels[i].currentIndex = 0;
            this.levels[i].completed = [];
            if (this.levels[i].initDropOrders) {
                this.levels[i].initDropOrders();
            }
        }
    }
}
```

**修改 `reset()` 方法**:

将所有关卡重置代码替换为:
```javascript
// 重置所有关卡数据
this.resetAllLevels();
```

---

### 重构 4：简化通关检查

**新增方法** (放在 `gameLoop()` 方法之前):

```javascript
// 检查当前关卡是否通关
checkLevelCompletion() {
    const levelConfig = this.getCurrentLevelConfig();
    
    // 如果没有关卡配置或已经标记为完成，直接返回
    if (!levelConfig || this.levelCompleted) {
        return;
    }
    
    const totalTriples = levelConfig.triples.length;
    const completed = levelConfig.completed;
    
    // 检查是否所有三元组都已完成
    if (completed.length === totalTriples && 
        completed.every(t => t.object && t.feature && t.value)) {
        this.levelCompleted = true;
        this.level1Win();
    }
}
```

**修改 `gameLoop()` 方法**:

将原来的多个 if-else 检查替换为:
```javascript
// 检查关卡完成状态
this.checkLevelCompletion();
```

---

### 重构 5：通用方块生成逻辑（高级）

**目标**: 将三个关卡几乎相同的代码提取到通用方法

**新增方法**:

```javascript
// 从关卡配置生成方块
generatePieceFromLevelConfig(levelConfig, levelNumber) {
    // 检查是否所有三元组都已完成
    if (levelConfig.currentIndex >= levelConfig.triples.length) {
        this.level1Win();
        return null;
    }
    
    // 获取当前三元组
    const currentTriple = levelConfig.triples[levelConfig.tripleOrder[levelConfig.currentIndex]];
    
    // 确定物元索引（根据关卡和对象名称）
    const elementIndex = this.getElementIndex(currentTriple.object, levelNumber);
    
    // 检查完成状态
    let completedTriple = levelConfig.completed.find(t => t.index === levelConfig.currentIndex);
    if (!completedTriple) {
        completedTriple = {
            index: levelConfig.currentIndex,
            tripleIndex: levelConfig.tripleOrder[levelConfig.currentIndex],
            object: false,
            feature: false,
            value: false
        };
        levelConfig.completed.push(completedTriple);
    }
    
    // 获取掉落顺序
    const dropOrder = levelConfig.dropOrders[levelConfig.tripleOrder[levelConfig.currentIndex]];
    
    // 查找下一个要掉落的模块
    let moduleType = null;
    let currentModule = null;
    let color = null;
    
    for (let i = 0; i < dropOrder.length; i++) {
        const type = dropOrder[i];
        if (!completedTriple[type]) {
            moduleType = type;
            
            if (moduleType === 'object') {
                currentModule = currentTriple.object;
                color = this.colors[elementIndex * 3 + 1];
            } else if (moduleType === 'feature') {
                currentModule = currentTriple.feature;
                color = this.colors[elementIndex * 3 + 2];
            } else if (moduleType === 'value') {
                currentModule = currentTriple.value;
                color = this.colors[elementIndex * 3 + 3];
            }
            break;
        }
    }
    
    // 如果没有找到，移动到下一个三元组
    if (!moduleType) {
        levelConfig.currentIndex++;
        return this.spawnNewPiece();
    }
    
    // 创建当前方块
    const colorIndex = elementIndex * 3 + (moduleType === 'object' ? 1 : moduleType === 'feature' ? 2 : 3);
    
    return {
        currentPiece: {
            shape: this.shapes['I'],
            shapeKey: 'I',
            shapeIndex: 0,
            color: color,
            colorIndex: colorIndex,
            text: currentModule,
            moduleType: moduleType,
            tripleIndex: levelConfig.currentIndex,
            originalTripleIndex: levelConfig.tripleOrder[levelConfig.currentIndex],
            x: Math.floor((this.cols - this.shapes['I'][0].length) / 2),
            y: 0
        },
        nextPiece: this.generateNextPiecePreview(levelConfig, levelNumber, completedTriple, elementIndex, moduleType)
    };
}

// 根据对象名称和关卡获取物元索引
getElementIndex(objectName, levelNumber) {
    // 第一关
    if (levelNumber === 1) {
        if (objectName === '耒（lěi）') return 1;
        if (objectName === '耒头') return 2;
        if (objectName === '耒柄') return 3;
    }
    // 第二关
    else if (levelNumber === 2) {
        if (objectName === '耜（sì）') return 4;
        if (objectName === '耜头') return 5;
        if (objectName === '耜柄') return 6;
        if (objectName === '踏肩/踏脚处') return 7;
        if (objectName === '耒') return 1; // 复用
    }
    // 第三关
    else if (levelNumber === 3) {
        if (objectName === '犁（lí）') return 8;
        if (objectName === '犁铧') return 9;
        if (objectName === '犁壁') return 10;
        if (objectName === '犁辕') return 11;
        if (objectName === '犁箭') return 12;
        if (objectName === '犁') return 8; // 处理简化写法
    }
    
    return 0; // 默认
}

// 生成下一个方块预览（省略详细实现，逻辑类似）
generateNextPiecePreview(levelConfig, levelNumber, completedTriple, currentElementIndex, currentModuleType) {
    // ... 类似的逻辑
    return {
        shape: this.shapes['I'],
        shapeKey: 'I',
        shapeIndex: 0,
        color: nextColor,
        text: nextModule,
        moduleType: nextModuleType
    };
}
```

**简化 `spawnNewPiece()` 方法**:

```javascript
spawnNewPiece() {
    const levelConfig = this.getCurrentLevelConfig();
    
    if (levelConfig) {
        const pieces = this.generatePieceFromLevelConfig(levelConfig, this.level);
        if (pieces) {
            this.currentPiece = pieces.currentPiece;
            this.nextPiece = pieces.nextPiece;
        }
    } else {
        // 默认随机生成
        this.spawnRandomPiece();
    }
    
    // 检查游戏是否结束
    if (this.currentPiece && this.collision(this.currentPiece.x, this.currentPiece.y, this.currentPiece.shape)) {
        this.gameOver();
    }
}
```

---

## 📊 重构优先级

### 🔴 高优先级（必须完成）
- ✅ 修复 1：初始化第三关数据
- ✅ 修复 2：重置第三关数据
- ✅ 修复 3：添加第三关通关检查

### 🟡 中优先级（强烈推荐）
- 重构 1：统一关卡管理器
- 重构 2：统一初始化方法
- 重构 3：统一重置方法
- 重构 4：简化通关检查

### 🟢 低优先级（可选优化）
- 重构 5：通用方块生成逻辑

---

## ✅ 测试清单

完成重构后，请进行以下测试：

### 基本功能测试
- [ ] 游戏可以正常启动
- [ ] 方块可以正常移动、旋转、下落
- [ ] 方块可以正确放置到游戏板

### 关卡跳转测试
- [ ] 完成第一关后，显示通关提示
- [ ] 点击"下一关"按钮，进入第二关（而不是第三关）
- [ ] 完成第二关后，显示通关提示
- [ ] 点击"下一关"按钮，进入第三关
- [ ] 完成第三关后，显示通关提示

### 重新开始测试
- [ ] 在任意关卡点击"重新来"按钮，可以重新开始当前关卡
- [ ] 点击"重新开始"按钮，回到第一关

### 数据完整性测试
- [ ] 第一关有 11 个三元组
- [ ] 第二关有 16 个三元组
- [ ] 第三关有 16 个三元组
- [ ] 所有方块都有正确的文本显示
- [ ] 所有方块都有正确的颜色显示

### 边界情况测试
- [ ] 在通关模态框显示时，游戏是否正确暂停
- [ ] 快速连续点击按钮不会导致错误
- [ ] 刷新页面后，最高分是否正确保存

---

## 🐛 常见问题

### Q1: 修改后第一关还是直接跳到第三关？
**A**: 检查以下内容：
1. 确保 `init()` 方法中已添加 `this.level3Data.initDropOrders()`
2. 清空浏览器缓存并刷新页面
3. 在控制台输入 `console.log(tetrisGame.level)` 查看当前关卡

### Q2: 第三关无法通关？
**A**: 检查以下内容：
1. 确保 `gameLoop()` 中已添加第三关的通关检查
2. 确认第三关的三元组数量（应该是 16 个）
3. 在控制台输入 `console.log(tetrisGame.level3Data.completed)` 查看完成状态

### Q3: 重新开始后第三关数据没有重置？
**A**: 确保 `reset()` 方法中已添加第三关的重置代码

---

## 📝 代码审查清单

完成所有修改后，进行以下检查：

- [ ] 所有修改的代码都有注释说明
- [ ] 没有遗留的 `console.log()` 调试代码（除非必要）
- [ ] 代码缩进统一（使用 4 个空格或 2 个空格）
- [ ] 变量命名清晰易懂
- [ ] 没有重复的代码块
- [ ] 所有关卡的逻辑一致

---

## 🎓 学习资源

### JavaScript 相关
- [MDN JavaScript 文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript)
- [JavaScript 设计模式](https://www.patterns.dev/)

### Canvas 游戏开发
- [Canvas API 文档](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API)
- [HTML5 游戏开发教程](https://developer.mozilla.org/zh-CN/docs/Games)

### 代码重构
- [重构：改善既有代码的设计](https://refactoring.com/)
- [代码整洁之道](https://www.oreilly.com/library/view/clean-code-a/9780136083238/)

---

**最后更新**: 2025-11-30
**版本**: 1.0.0
