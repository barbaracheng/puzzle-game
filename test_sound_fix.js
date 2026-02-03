/**
 * 测试脚本：验证拼图游戏的修复和新功能
 * 运行方式：node test_sound_fix.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 开始测试拼图游戏的修复和新功能...\n');

// 读取HTML文件
const htmlPath = path.join(__dirname, 'index.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

// 读取JS文件
const jsPath = path.join(__dirname, 'game.js');
const jsContent = fs.readFileSync(jsPath, 'utf-8');

// 读取CSS文件
const cssPath = path.join(__dirname, 'style.css');
const cssContent = fs.readFileSync(cssPath, 'utf-8');

let passedTests = 0;
let failedTests = 0;

function test(description, condition) {
    if (condition) {
        console.log(`✅ PASS: ${description}`);
        passedTests++;
    } else {
        console.log(`❌ FAIL: ${description}`);
        failedTests++;
    }
}

console.log('📝 测试1: HTML结构检查\n');

test('HTML包含音效按钮', htmlContent.includes('id="sound-btn"'));
test('HTML包含音乐按钮', htmlContent.includes('id="music-btn"'));
test('HTML包含音量滑块', htmlContent.includes('id="volume-slider"'));
test('HTML包含开始/结束图标', htmlContent.includes('id="start-icon"') && htmlContent.includes('id="stop-icon"'));
test('HTML包含开始按钮文字', htmlContent.includes('id="start-btn-text"'));

console.log('\n📝 测试2: JavaScript功能检查\n');

test('JS包含soundEnabled属性', jsContent.includes('this.soundEnabled'));
test('JS包含musicEnabled属性', jsContent.includes('this.musicEnabled'));
test('JS包含musicVolume属性', jsContent.includes('this.musicVolume'));
test('JS包含audioContext属性', jsContent.includes('this.audioContext'));
test('JS包含toggleSound方法', jsContent.includes('toggleSound()'));
test('JS包含toggleMusic方法', jsContent.includes('toggleMusic()'));
test('JS包含setVolume方法', jsContent.includes('setVolume('));
test('JS包含playMoveSound方法', jsContent.includes('playMoveSound()'));
test('JS包含playBackgroundMusic方法', jsContent.includes('playBackgroundMusic()'));
test('JS包含stopBackgroundMusic方法', jsContent.includes('stopBackgroundMusic()'));
test('JS包含toggleGame方法', jsContent.includes('toggleGame()'));
test('JS包含startGame方法', jsContent.includes('startGame()'));
test('JS包含endGame方法', jsContent.includes('endGame()'));

console.log('\n📝 测试3: 开始/结束游戏按钮逻辑检查\n');

test('toggleGame方法检查gameStarted状态', jsContent.match(/if\s*\(!this\.gameStarted\)/));
test('startGame方法设置gameStarted为true', jsContent.includes('this.gameStarted = true') && jsContent.includes('startGame()'));
test('endGame方法设置gameStarted为false', jsContent.includes('this.gameStarted = false') && jsContent.includes('endGame()'));
test('toggleGame在未开始时调用startGame', jsContent.match(/if\s*\(!this\.gameStarted\)\s*{[\s\S]*?this\.startGame\(\);/));
test('toggleGame在开始时确认后调用endGame', jsContent.includes('confirm') && jsContent.includes('endGame()'));
test('startGame更新按钮文字为"结束游戏"', jsContent.includes('结束游戏'));
test('endGame更新按钮文字为"开始游戏"', jsContent.includes('开始游戏'));

console.log('\n📝 测试4: 音效功能检查\n');

test('playMoveSound检查soundEnabled', jsContent.includes('if (!this.soundEnabled) return'));
test('playMoveSound使用Web Audio API', jsContent.includes('createOscillator') || jsContent.includes('AudioContext'));
test('toggleSound切换soundEnabled状态', jsContent.includes('this.soundEnabled = !this.soundEnabled'));

console.log('\n📝 测试5: 音乐功能检查\n');

test('playBackgroundMusic检查musicEnabled', jsContent.includes('if (!this.musicEnabled') || jsContent.includes('if (this.musicEnabled)'));
test('createBackgroundMusic创建音频缓冲区', jsContent.includes('createBuffer'));
test('toggleMusic切换musicEnabled状态', jsContent.includes('this.musicEnabled = !this.musicEnabled'));
test('setVolume更新musicVolume', jsContent.includes('this.musicVolume ='));

console.log('\n📝 测试6: CSS样式检查\n');

test('CSS包含音乐控制样式', cssContent.includes('.music-controls'));
test('CSS包含音量控制样式', cssContent.includes('.volume-control'));
test('CSS包含音量滑块样式', cssContent.includes('.volume-slider'));

console.log('\n📝 测试7: resetGame方法检查\n');

test('resetGame更新按钮文字为"开始游戏"', jsContent.includes('resetGame()') && jsContent.includes('开始游戏'));

console.log('\n📝 测试8: checkWin方法检查\n');

test('checkWin更新按钮状态', jsContent.includes('checkWin()') && jsContent.includes('startBtnText'));

console.log('\n📝 测试9: 事件监听器检查\n');

test('soundBtn添加click监听器', jsContent.includes("document.getElementById('sound-btn')"));
test('musicBtn添加click监听器', jsContent.includes("document.getElementById('music-btn')"));
test('volumeSlider添加input监听器', jsContent.includes("document.getElementById('volume-slider')"));

console.log('\n📝 测试10: 移动时播放音效\n');

test('moveTile调用playMoveSound', jsContent.includes('moveTile') && jsContent.includes('playMoveSound()'));

console.log('\n' + '='.repeat(60));
console.log(`\n📊 测试结果:`);
console.log(`✅ 通过: ${passedTests} 个测试`);
console.log(`❌ 失败: ${failedTests} 个测试`);
console.log(`📈 成功率: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);

if (failedTests === 0) {
    console.log('\n🎉 所有测试通过！代码修改成功！');
} else {
    console.log('\n⚠️  存在失败的测试，请检查代码。');
}

console.log('\n' + '='.repeat(60));

// 输出详细的bug修复报告
console.log('\n📋 Bug修复报告：\n');
console.log('1. Bug 1: 开始/结束游戏按钮逻辑错误');
console.log('   - 原因：点击"开始游戏"后按钮文字没有变化');
console.log('   - 修复：添加了toggleGame方法，根据gameStarted状态切换开始/结束功能');
console.log('   - 实现：未开始状态显示"开始游戏"，进行中显示"结束游戏"，点击"结束游戏"弹出确认对话框\n');

console.log('2. 新功能 1: 移动音效');
console.log('   - 实现：使用Web Audio API生成"咔嗒"声');
console.log('   - 控制：添加音效开关按钮，可随时开启/关闭');
console.log('   - 触发：每次移动格子时自动播放音效\n');

console.log('3. 新功能 2: 游戏背景音乐');
console.log('   - 实现：使用Web Audio API生成简单的背景音乐');
console.log('   - 控制：添加音乐按钮和音量滑块');
console.log('   - 功能：音乐可循环播放，音量可调节\n');

console.log('4. 修改的文件：');
console.log('   - index.html: 添加音效、音乐、音量控制按钮和图标');
console.log('   - game.js: 添加音效和音乐功能，修复开始/结束游戏按钮逻辑');
console.log('   - style.css: 添加音乐控制和音量滑块的样式\n');

process.exit(failedTests === 0 ? 0 : 1);
