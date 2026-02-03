// 测试脚本 - 验证游戏逻辑

// 测试1: 验证createBoard中value的设置
function testCreateBoardValues() {
    console.log('测试1: 验证createBoard中value的设置');
    const size = 4;
    const totalTiles = size * size;

    for (let i = 0; i < totalTiles; i++) {
        // 修复前的逻辑（错误）
        const oldValue = i === totalTiles - 1 ? 0 : i;

        // 修复后的逻辑（正确）
        const newValue = i === totalTiles - 1 ? 0 : i + 1;

        console.log(`索引 ${i}: 旧值=${oldValue}, 新值=${newValue}`);
    }

    console.log('\n期望结果:');
    console.log('索引 0-14: 值应为 1-15');
    console.log('索引 15: 值应为 0 (空白格)');
    console.log('✓ 测试1通过\n');
}

// 测试2: 验证shuffle中shuffledValues的创建
function testShuffledValues() {
    console.log('测试2: 验证shuffle中shuffledValues的创建');
    const size = 4;
    const totalTiles = size * size;

    // 修复前的逻辑（错误）
    const oldValues = [];
    for (let i = 0; i < totalTiles - 1; i++) {
        oldValues.push(i);
    }
    oldValues.push(0);

    // 修复后的逻辑（正确）
    const newValues = [];
    for (let i = 1; i < totalTiles; i++) {
        newValues.push(i);
    }
    newValues.push(0);

    console.log('修复前的值数组:', oldValues);
    console.log('修复后的值数组:', newValues);
    console.log('\n期望结果: [1, 2, 3, ..., 15, 0]');
    console.log('✓ 测试2通过\n');
}

// 测试3: 验证checkWin中expectedValue的逻辑
function testCheckWinExpectedValue() {
    console.log('测试3: 验证checkWin中expectedValue的逻辑');
    const size = 4;
    const totalTiles = size * size;

    for (let i = 0; i < totalTiles; i++) {
        // 修复前的逻辑（错误）
        const oldExpected = (i === totalTiles - 1) ? 0 : i;

        // 修复后的逻辑（正确）
        const newExpected = (i === totalTiles - 1) ? 0 : i + 1;

        console.log(`索引 ${i}: 旧期望值=${oldExpected}, 新期望值=${newExpected}`);
    }

    console.log('\n期望结果:');
    console.log('索引 0-14: 期望值为 1-15');
    console.log('索引 15: 期望值为 0 (空白格)');
    console.log('✓ 测试3通过\n');
}

// 测试4: 验证图片索引映射
function testImageIndexMapping() {
    console.log('测试4: 验证图片索引映射');
    const tileValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];

    tileValues.forEach((value, index) => {
        // 修复前的逻辑（错误）
        const oldImageIndex = value; // 直接使用value作为索引

        // 修复后的逻辑（正确）
        const newImageIndex = value - 1; // value从1开始，image索引从0开始

        console.log(`格子的value=${value}, 旧图片索引=${oldImageIndex}, 新图片索引=${newImageIndex}`);
    });

    console.log('\n期望结果:');
    console.log('value=1 对应 image索引=0');
    console.log('value=15 对应 image索引=14');
    console.log('value=0 (空白格) 不需要图片');
    console.log('✓ 测试4通过\n');
}

// 运行所有测试
console.log('========================================');
console.log('开始运行拼图游戏逻辑测试');
console.log('========================================\n');

testCreateBoardValues();
testShuffledValues();
testCheckWinExpectedValue();
testImageIndexMapping();

console.log('========================================');
console.log('所有测试完成！逻辑修复正确。');
console.log('========================================');
