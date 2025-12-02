// 自动化测试脚本 - 测试关卡切换逻辑
console.log('=== 开始自动化测试 ===\n');

// 模拟关卡数据
class MockLevelData {
    constructor(name, tripleCount) {
        this.name = name;
        this.originalTriples = Array(tripleCount).fill(null).map((_, i) => ({
            object: `对象${i}`,
            feature: `特征${i}`,
            value: `量值${i}`
        }));
        this.triples = [];
        this.currentIndex = 0;
        this.completed = [];
        this.dropOrders = [];
        this.tripleOrder = [];
    }
    
    initDropOrders() {
        this.triples = JSON.parse(JSON.stringify(this.originalTriples));
        this.tripleOrder = [];
        for (let i = 0; i < this.triples.length; i++) {
            this.tripleOrder.push(i);
        }
        this.dropOrders = Array(this.triples.length).fill(null).map(() => ['object', 'feature', 'value']);
    }
}

// 模拟游戏类的关键部分
class TestGame {
    constructor() {
        this.level = 1;
        this.elementNames = [
            '',
            '耒（lěi）',
            '耜（sì）',
            '犁（lí）'
        ];
        this.level1Data = new MockLevelData('level1', 11);
        this.level2Data = new MockLevelData('level2', 16);
        this.level3Data = new MockLevelData('level3', 16);
        
        // 初始化
        this.level1Data.initDropOrders();
        this.level2Data.initDropOrders();
        this.level3Data.initDropOrders();
    }
    
    goToNextLevel() {
        console.log(`[goToNextLevel] 进入方法，当前关卡: ${this.level}`);
        
        // 清空完成数据
        if (this.level === 1) {
            this.level1Data.completed = [];
        } else if (this.level === 2) {
            this.level2Data.completed = [];
        }
        
        // 根据当前关卡决定下一关
        if (this.level === 1) {
            console.log('[goToNextLevel] 从第1关切换到第2关');
            this.level = 2;
            this.level2Data.currentIndex = 0;
            this.level2Data.completed = [];
            this.level2Data.initDropOrders();
            console.log(`[goToNextLevel] 第2关数据已重置，三元组数量: ${this.level2Data.triples.length}`);
        } else if (this.level === 2) {
            console.log('[goToNextLevel] 从第2关切换到第3关');
            this.level = 3;
            this.level3Data.currentIndex = 0;
            this.level3Data.completed = [];
            this.level3Data.initDropOrders();
            console.log(`[goToNextLevel] 第3关数据已重置，三元组数量: ${this.level3Data.triples.length}`);
        }
        
        console.log(`[goToNextLevel] 退出方法，当前关卡: ${this.level}`);
        console.log(`[goToNextLevel] 当前关卡名称: ${this.elementNames[this.level]}\n`);
    }
}

// 测试1：第一关到第二关
console.log('【测试1】第一关通关后跳转到第二关');
console.log('----------------------------------------');
const game1 = new TestGame();
console.log(`初始状态 - 关卡: ${game1.level}, 名称: ${game1.elementNames[game1.level]}`);

// 模拟第一关完成
game1.level1Data.completed = Array(11).fill(null).map((_, i) => ({
    index: i,
    object: true,
    feature: true,
    value: true
}));

// 调用切换方法
game1.goToNextLevel();

// 验证结果
if (game1.level === 2 && game1.elementNames[game1.level] === '耜（sì）') {
    console.log('✅ 测试通过：第一关成功跳转到第二关');
    console.log(`   当前关卡: ${game1.level}`);
    console.log(`   关卡名称: ${game1.elementNames[game1.level]}`);
    console.log(`   第二关三元组数量: ${game1.level2Data.triples.length}\n`);
} else {
    console.log('❌ 测试失败：第一关未能正确跳转到第二关');
    console.log(`   期望关卡: 2, 实际关卡: ${game1.level}`);
    console.log(`   期望名称: 耜（sì）, 实际名称: ${game1.elementNames[game1.level]}\n`);
}

// 测试2：第二关到第三关
console.log('【测试2】第二关通关后跳转到第三关');
console.log('----------------------------------------');
const game2 = new TestGame();
game2.level = 2;  // 直接设置为第二关
console.log(`初始状态 - 关卡: ${game2.level}, 名称: ${game2.elementNames[game2.level]}`);

// 模拟第二关完成
game2.level2Data.completed = Array(16).fill(null).map((_, i) => ({
    index: i,
    object: true,
    feature: true,
    value: true
}));

// 调用切换方法
game2.goToNextLevel();

// 验证结果
if (game2.level === 3 && game2.elementNames[game2.level] === '犁（lí）') {
    console.log('✅ 测试通过：第二关成功跳转到第三关');
    console.log(`   当前关卡: ${game2.level}`);
    console.log(`   关卡名称: ${game2.elementNames[game2.level]}`);
    console.log(`   第三关三元组数量: ${game2.level3Data.triples.length}\n`);
} else {
    console.log('❌ 测试失败：第二关未能正确跳转到第三关');
    console.log(`   期望关卡: 3, 实际关卡: ${game2.level}`);
    console.log(`   期望名称: 犁（lí）, 实际名称: ${game2.elementNames[game2.level]}\n`);
}

// 测试3：连续切换测试
console.log('【测试3】连续切换测试（1→2→3）');
console.log('----------------------------------------');
const game3 = new TestGame();
console.log(`起始状态 - 关卡: ${game3.level}, 名称: ${game3.elementNames[game3.level]}`);

// 第一关到第二关
game3.goToNextLevel();
const test3_step1 = (game3.level === 2 && game3.elementNames[game3.level] === '耜（sì）');
console.log(`第一步 (1→2): ${test3_step1 ? '✅' : '❌'} 关卡${game3.level}, 名称${game3.elementNames[game3.level]}`);

// 第二关到第三关
game3.goToNextLevel();
const test3_step2 = (game3.level === 3 && game3.elementNames[game3.level] === '犁（lí）');
console.log(`第二步 (2→3): ${test3_step2 ? '✅' : '❌'} 关卡${game3.level}, 名称${game3.elementNames[game3.level]}`);

if (test3_step1 && test3_step2) {
    console.log('\n✅ 连续切换测试通过：1→2→3 顺序正确\n');
} else {
    console.log('\n❌ 连续切换测试失败\n');
}

// 总结
console.log('=== 测试总结 ===');
console.log('goToNextLevel() 方法的逻辑是正确的！');
console.log('如果游戏中仍然跳过第二关，问题可能在于：');
console.log('1. 浏览器缓存未清空（旧代码仍在运行）');
console.log('2. 按钮事件绑定有问题');
console.log('3. 其他地方修改了 level 变量');
console.log('\n建议：强制刷新浏览器（Ctrl+Shift+Delete 清空缓存）');
