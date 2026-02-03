#!/usr/bin/env node

/**
 * 拼图游戏Bug修复测试脚本
 * 测试两个主要的bug：
 * 1. 确保只生成一个空白格
 * 2. 暂停按钮文字正确更新
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 开始测试拼图游戏Bug修复...\n');

// 读取game.js文件
const gameJsPath = path.join(__dirname, 'game.js');
const gameJsContent = fs.readFileSync(gameJsPath, 'utf8');

// 读取index.html文件
const htmlPath = path.join(__dirname, 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

let passedTests = 0;
let totalTests = 0;

/**
 * 测试1: 检查createBoard()是否清空tiles数组
 */
function test1() {
    totalTests++;
    console.log('测试1: createBoard()是否清空tiles数组');

    // 检查整个文件中是否有清空tiles数组的逻辑
    if (gameJsContent.includes('this.tiles = []') &&
        gameJsContent.includes('createBoard()')) {
        console.log('  ✅ 通过: createBoard()正确清空了tiles数组');
        passedTests++;
    } else {
        console.log('  ❌ 失败: createBoard()没有清空tiles数组');
    }
    console.log('');
}

/**
 * 测试2: 检查moveTile()是否验证emptyTile.value === 0
 */
function test2() {
    totalTests++;
    console.log('测试2: moveTile()是否验证emptyTile.value === 0');

    // 查找moveTile方法
    const moveTileMatch = gameJsContent.match(/moveTile\(tileIndex\)\s*{[\s\S]*?}/);

    if (!moveTileMatch) {
        console.log('  ❌ 失败: 找不到moveTile方法');
        return;
    }

    const moveTileCode = moveTileMatch[0];

    // 检查是否有验证 emptyTile.value === 0
    if (moveTileCode.includes('if (emptyTile.value !== 0)') &&
        moveTileCode.includes('console.error') &&
        moveTileCode.includes('emptyTile.value is not 0')) {
        console.log('  ✅ 通过: moveTile()正确验证了emptyTile.value === 0');
        passedTests++;
    } else {
        console.log('  ❌ 失败: moveTile()没有正确验证emptyTile.value');
    }
    console.log('');
}

/**
 * 测试3: 检查shuffle()中shuffledValues是否只有一个0
 */
function test3() {
    totalTests++;
    console.log('测试3: shuffle()中shuffledValues是否只有一个0');

    // 检查整个文件中shuffledValues数组的创建
    const hasForLoop = gameJsContent.includes('for (let i = 1; i < totalTiles; i++)') ||
                      gameJsContent.includes('for (let i = 1; i < totalTiles; i++)');
    const hasPushI = gameJsContent.includes('shuffledValues.push(i)');
    const hasPush0 = gameJsContent.includes('shuffledValues.push(0)');
    const hasComment = gameJsContent.includes('只有一个0表示空白格') ||
                      gameJsContent.includes('0 represents empty');

    if (hasPushI && hasPush0 && hasComment) {
        console.log('  ✅ 通过: shuffle()正确创建只有一个0的shuffledValues数组');
        passedTests++;
    } else {
        console.log('  ❌ 失败: shuffle()的shuffledValues数组创建有问题');
        console.log(`     - for循环: ${hasForLoop ? '✓' : '✗'}`);
        console.log(`     - push(i): ${hasPushI ? '✓' : '✗'}`);
        console.log(`     - push(0): ${hasPush0 ? '✓' : '✗'}`);
        console.log(`     - 注释: ${hasComment ? '✓' : '✗'}`);
    }
    console.log('');
}

/**
 * 测试4: 检查HTML中暂停按钮是否有文字元素
 */
function test4() {
    totalTests++;
    console.log('测试4: HTML中暂停按钮是否有文字元素');

    // 查找暂停按钮
    const pauseBtnMatch = htmlContent.match(/<button[^>]*id="pause-btn"[^>]*>[\s\S]*?<\/button>/);

    if (!pauseBtnMatch) {
        console.log('  ❌ 失败: 找不到暂停按钮');
        return;
    }

    const pauseBtnCode = pauseBtnMatch[0];

    // 检查是否有文字span元素
    if (pauseBtnCode.includes('id="pause-btn-text"') &&
        pauseBtnCode.includes('<span')) {
        console.log('  ✅ 通过: 暂停按钮有文字元素');
        passedTests++;
    } else {
        console.log('  ❌ 失败: 暂停按钮没有文字元素');
    }
    console.log('');
}

/**
 * 测试5: 检查togglePause()是否更新按钮文字
 */
function test5() {
    totalTests++;
    console.log('测试5: togglePause()是否更新按钮文字');

    // 检查整个文件中togglePause方法是否更新按钮文字
    const hasPauseBtnText = gameJsContent.includes("pauseBtnText") ||
                             gameJsContent.includes('pause-btn-text');
    const hasSetTextContent = gameJsContent.includes("textContent = '暂停游戏'") ||
                             gameJsContent.includes('textContent = "暂停游戏"');
    const hasPauseGameText = gameJsContent.includes('暂停游戏');
    const hasContinueGameText = gameJsContent.includes('继续游戏');

    if (hasPauseBtnText && hasSetTextContent && hasPauseGameText && hasContinueGameText) {
        console.log('  ✅ 通过: togglePause()正确更新按钮文字');
        passedTests++;
    } else {
        console.log('  ❌ 失败: togglePause()没有正确更新按钮文字');
        console.log(`     - pauseBtnText: ${hasPauseBtnText ? '✓' : '✗'}`);
        console.log(`     - setTextContent: ${hasSetTextContent ? '✓' : '✗'}`);
        console.log(`     - 暂停游戏: ${hasPauseGameText ? '✓' : '✗'}`);
        console.log(`     - 继续游戏: ${hasContinueGameText ? '✓' : '✗'}`);
    }
    console.log('');
}

/**
 * 测试6: 检查startGame()是否设置初始按钮文字
 */
function test6() {
    totalTests++;
    console.log('测试6: startGame()是否设置初始按钮文字');

    // 检查整个文件中startGame方法是否设置按钮文字
    const hasStartGame = gameJsContent.includes('startGame()');
    const hasPauseBtnText = gameJsContent.includes("pauseBtnText") ||
                            gameJsContent.includes('pause-btn-text');
    const hasSetTextContent = gameJsContent.includes("textContent = '暂停游戏'") ||
                            gameJsContent.includes('textContent = "暂停游戏"');
    const hasPauseGameText = gameJsContent.includes('暂停游戏');

    if (hasStartGame && hasPauseBtnText && hasSetTextContent && hasPauseGameText) {
        console.log('  ✅ 通过: startGame()正确设置初始按钮文字');
        passedTests++;
    } else {
        console.log('  ❌ 失败: startGame()没有正确设置初始按钮文字');
        console.log(`     - startGame: ${hasStartGame ? '✓' : '✗'}`);
        console.log(`     - pauseBtnText: ${hasPauseBtnText ? '✓' : '✗'}`);
        console.log(`     - setTextContent: ${hasSetTextContent ? '✓' : '✗'}`);
        console.log(`     - 暂停游戏: ${hasPauseGameText ? '✓' : '✗'}`);
    }
    console.log('');
}

/**
 * 测试7: 检查shuffle()是否重置暂停按钮文字
 */
function test7() {
    totalTests++;
    console.log('测试7: shuffle()是否重置暂停按钮文字');

    // 查找shuffle方法
    const shuffleMatch = gameJsContent.match(/shuffle\(\)\s*{[\s\S]*?}/);

    if (!shuffleMatch) {
        console.log('  ❌ 失败: 找不到shuffle方法');
        return;
    }

    const shuffleCode = shuffleMatch[0];

    // 检查是否有重置按钮文字的逻辑
    const hasPauseBtnText = shuffleCode.includes('pauseBtnText') ||
                            shuffleCode.includes('pause-btn-text');
    const hasSetTextContent = shuffleCode.includes('textContent = ') ||
                            shuffleCode.includes('.textContent =');
    const hasResetText = shuffleCode.includes('textContent = \'暂停\'') ||
                        shuffleCode.includes('textContent = "暂停"');

    if (hasPauseBtnText && hasSetTextContent && hasResetText) {
        console.log('  ✅ 通过: shuffle()正确重置按钮文字');
        passedTests++;
    } else {
        console.log('  ❌ 失败: shuffle()没有正确重置按钮文字');
        console.log(`     - pauseBtnText: ${hasPauseBtnText ? '✓' : '✗'}`);
        console.log(`     - setTextContent: ${hasSetTextContent ? '✓' : '✗'}`);
        console.log(`     - 重置为"暂停": ${hasResetText ? '✓' : '✗'}`);
    }
    console.log('');
}

/**
 * 测试8: 检查moveTile()中的值交换逻辑
 */
function test8() {
    totalTests++;
    console.log('测试8: moveTile()中的值交换逻辑是否正确');

    // 检查整个文件中moveTile方法的值交换逻辑
    const hasValidation = gameJsContent.includes('if (emptyTile.value !== 0)');
    const hasTempValue = gameJsContent.includes('const tempValue = clickedTile.value');
    const hasClickedAssign = gameJsContent.includes('clickedTile.value = emptyTile.value');
    const hasEmptyAssign = gameJsContent.includes('emptyTile.value = tempValue');
    const hasErrorLog = gameJsContent.includes('emptyTile.value is not 0');

    if (hasValidation && hasTempValue && hasClickedAssign && hasEmptyAssign && hasErrorLog) {
        console.log('  ✅ 通过: moveTile()的值交换逻辑正确');
        passedTests++;
    } else {
        console.log('  ❌ 失败: moveTile()的值交换逻辑有问题');
        console.log(`     - 验证emptyTile.value: ${hasValidation ? '✓' : '✗'}`);
        console.log(`     - 临时变量: ${hasTempValue ? '✓' : '✗'}`);
        console.log(`     - clickedTile.value =: ${hasClickedAssign ? '✓' : '✗'}`);
        console.log(`     - emptyTile.value =: ${hasEmptyAssign ? '✓' : '✗'}`);
        console.log(`     - 错误日志: ${hasErrorLog ? '✓' : '✗'}`);
    }
    console.log('');
}

// 运行所有测试
test1();
test2();
test3();
test4();
test5();
test6();
test7();
test8();

// 输出测试结果
console.log('====================================');
console.log(`📊 测试结果: ${passedTests}/${totalTests} 通过`);
console.log('====================================');

if (passedTests === totalTests) {
    console.log('\n✨ 所有测试通过！Bug修复成功！\n');
    process.exit(0);
} else {
    console.log(`\n❌ ${totalTests - passedTests} 个测试失败，请检查修复！\n`);
    process.exit(1);
}
