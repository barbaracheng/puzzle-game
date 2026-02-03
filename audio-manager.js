/**
 * AudioManager - 统一音频管理器
 * 负责管理所有游戏音频（背景音乐、音效等）
 */
class AudioManager {
    constructor() {
        // 音频上下文
        this.audioContext = null;

        // 音频状态
        this.soundEnabled = true;
        this.musicEnabled = true;  // 修复：默认开启背景音乐
        this.masterVolume = 0.8;  // 修复：提高主音量（0.5 -> 0.8）
        this.sfxVolume = 1.0;  // 修复：提高音效音量（0.6 -> 1.0）
        this.musicVolume = 0.4;

        // 音频源
        this.backgroundMusicSource = null;
        this.backgroundMusicGain = null;
        this.moveSoundBuffer = null;
        this.clickSoundBuffer = null;
        this.winSoundBuffer = null;

        // 加载状态
        this.isInitialized = false;
        this.isLoading = false;
        this.loadPromise = null;

        // 事件回调
        this.onError = null;

        // 加载保存的设置
        this.loadSettings();
    }

    /**
     * 初始化音频管理器
     */
    async init() {
        if (this.isInitialized) return;
        if (this.isLoading && this.loadPromise) return this.loadPromise;

        this.isLoading = true;

        try {
            // 创建音频上下文
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // 预加载所有音效
            await this.loadSounds();

            this.isInitialized = true;
            console.log('AudioManager 初始化成功');
        } catch (error) {
            console.error('AudioManager 初始化失败:', error);
            if (this.onError) {
                this.onError('音频系统初始化失败');
            }
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * 预加载所有音效
     */
    async loadSounds() {
        try {
            // 预生成音效缓冲区（使用Web Audio API生成，避免加载外部文件）
            this.moveSoundBuffer = this.createMoveSoundBuffer();
            this.clickSoundBuffer = this.createClickSoundBuffer();
            this.winSoundBuffer = this.createWinSoundBuffer();

            console.log('音效加载完成');
        } catch (error) {
            console.error('音效加载失败:', error);
            throw error;
        }
    }

    /**
     * 创建移动音效缓冲区
     * 生成一个清脆的"咔嗒"声
     */
    createMoveSoundBuffer() {
        const duration = 0.15;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);

        // 生成一个从800Hz快速下降到300Hz的波形
        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            const frequency = 800 * Math.exp(-10 * t) + 300;
            const amplitude = Math.exp(-15 * t); // 快速衰减

            // 使用混合波形（正弦波+方波）增加质感
            data[i] = amplitude * (
                0.7 * Math.sin(2 * Math.PI * frequency * t) +
                0.3 * Math.sign(Math.sin(2 * Math.PI * frequency * t))
            );
        }

        return buffer;
    }

    /**
     * 创建点击音效缓冲区
     * 生成一个轻柔的"滴"声
     */
    createClickSoundBuffer() {
        const duration = 0.08;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);

        // 生成一个高频正弦波
        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            const frequency = 1200;
            const amplitude = Math.exp(-20 * t);

            data[i] = amplitude * Math.sin(2 * Math.PI * frequency * t);
        }

        return buffer;
    }

    /**
     * 创建胜利音效缓冲区
     * 生成一个欢快的和弦
     */
    createWinSoundBuffer() {
        const duration = 0.8;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);

        // C大调和弦：C5, E5, G5
        const frequencies = [523.25, 659.25, 783.99];

        for (let i = 0; i < buffer.length; i++) {
            const t = i / sampleRate;
            const amplitude = Math.exp(-3 * t) * 0.5;

            data[i] = 0;
            for (const freq of frequencies) {
                data[i] += amplitude * Math.sin(2 * Math.PI * freq * t);
            }
            data[i] /= frequencies.length;
        }

        return buffer;
    }

    /**
     * 确保音频上下文已恢复（处理浏览器自动播放策略）
     */
    async resumeAudioContext() {
        if (!this.audioContext) return;

        if (this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
            } catch (error) {
                console.error('恢复音频上下文失败:', error);
            }
        }
    }

    /**
     * 播放音效
     * @param {AudioBuffer} buffer - 音频缓冲区
     * @param {number} volume - 音量 (0-1)
     * @param {number} playbackRate - 播放速率
     */
    playSound(buffer, volume = 1, playbackRate = 1) {
        if (!this.soundEnabled || !buffer || !this.audioContext) return;

        try {
            // 确保音频上下文已恢复
            this.resumeAudioContext();

            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();

            source.buffer = buffer;
            source.playbackRate.value = playbackRate;

            // 应用音量
            const finalVolume = volume * this.sfxVolume * this.masterVolume;
            gainNode.gain.setValueAtTime(finalVolume, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);

            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            source.start();
            source.stop(this.audioContext.currentTime + 0.3);
        } catch (error) {
            console.error('播放音效失败:', error);
        }
    }

    /**
     * 播放移动音效
     */
    playMoveSound() {
        this.playSound(this.moveSoundBuffer, 1.0, 1.0);
    }

    /**
     * 播放点击音效
     */
    playClickSound() {
        this.playSound(this.clickSoundBuffer, 0.7, 1.0);
    }

    /**
     * 播放胜利音效
     */
    playWinSound() {
        this.playSound(this.winSoundBuffer, 0.8, 1.0);
    }

    /**
     * 播放背景音乐
     * 使用Web Audio API生成简单的环境音
     */
    playBackgroundMusic() {
        if (!this.musicEnabled || this.backgroundMusicSource) return;

        try {
            if (!this.audioContext) {
                this.init();
                return;
            }

            this.resumeAudioContext();

            // 创建一个简单的环境音乐（使用低频振荡器）
            const duration = 30; // 30秒循环
            const sampleRate = this.audioContext.sampleRate;
            const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
            const data = buffer.getChannelData(0);

            // 生成轻柔的背景音（低频和弦）
            const frequencies = [130.81, 164.81, 196.00]; // C3, E3, G3

            for (let i = 0; i < buffer.length; i++) {
                const t = i / sampleRate;
                data[i] = 0;

                for (const freq of frequencies) {
                    // 使用两个振荡器生成谐波
                    data[i] += Math.sin(2 * Math.PI * freq * t) * 0.3;
                    data[i] += Math.sin(2 * Math.PI * freq * 2 * t) * 0.15;
                    data[i] += Math.sin(2 * Math.PI * freq * 3 * t) * 0.05;
                }

                // 应用包络（淡入淡出）
                const envelope = Math.min(t, 1) * Math.min(duration - t, 1);
                data[i] *= envelope / frequencies.length;
                data[i] *= 0.15; // 降低整体音量
            }

            // 创建源节点
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.loop = true;

            // 创建增益节点
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = 0; // 从0开始
            gainNode.gain.linearRampToValueAtTime(this.musicVolume * this.masterVolume, this.audioContext.currentTime + 2); // 2秒淡入

            // 连接节点
            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            // 保存引用
            this.backgroundMusicSource = source;
            this.backgroundMusicGain = gainNode;

            // 播放
            source.start();
            console.log('背景音乐已启动');
        } catch (error) {
            console.error('播放背景音乐失败:', error);
            if (this.onError) {
                this.onError('背景音乐播放失败');
            }
        }
    }

    /**
     * 停止背景音乐
     */
    stopBackgroundMusic() {
        if (!this.backgroundMusicSource) return;

        try {
            // 2秒淡出
            if (this.backgroundMusicGain && this.audioContext) {
                this.backgroundMusicGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 2);
            }

            // 2秒后停止
            setTimeout(() => {
                if (this.backgroundMusicSource) {
                    try {
                        this.backgroundMusicSource.stop();
                    } catch (e) {
                        // 忽略已停止的错误
                    }
                    this.backgroundMusicSource = null;
                    this.backgroundMusicGain = null;
                    console.log('背景音乐已停止');
                }
            }, 2000);
        } catch (error) {
            console.error('停止背景音乐失败:', error);
            // 清理引用
            this.backgroundMusicSource = null;
            this.backgroundMusicGain = null;
        }
    }

    /**
     * 切换音效开关
     */
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;

        // 保存设置
        this.saveSettings();

        return this.soundEnabled;
    }

    /**
     * 切换背景音乐开关
     */
    toggleMusic() {
        this.musicEnabled = !this.musicEnabled;

        if (this.musicEnabled) {
            this.playBackgroundMusic();
        } else {
            this.stopBackgroundMusic();
        }

        // 保存设置
        this.saveSettings();

        return this.musicEnabled;
    }

    /**
     * 设置主音量
     * @param {number} value - 音量值 (0-100)
     */
    setMasterVolume(value) {
        this.masterVolume = value / 100;

        // 更新背景音乐音量
        if (this.backgroundMusicGain) {
            this.backgroundMusicGain.gain.value = this.musicVolume * this.masterVolume;
        }

        // 保存设置
        this.saveSettings();
    }

    /**
     * 设置音效音量
     * @param {number} value - 音量值 (0-100)
     */
    setSfxVolume(value) {
        this.sfxVolume = value / 100;

        // 保存设置
        this.saveSettings();
    }

    /**
     * 设置背景音乐音量
     * @param {number} value - 音量值 (0-100)
     */
    setMusicVolume(value) {
        this.musicVolume = value / 100;

        if (this.backgroundMusicGain) {
            this.backgroundMusicGain.gain.value = this.musicVolume * this.masterVolume;
        }

        // 保存设置
        this.saveSettings();
    }

    /**
     * 获取音量值
     * @returns {Object} 包含各个音量的对象
     */
    getVolumes() {
        return {
            master: Math.round(this.masterVolume * 100),
            sfx: Math.round(this.sfxVolume * 100),
            music: Math.round(this.musicVolume * 100)
        };
    }

    /**
     * 保存设置到localStorage
     */
    saveSettings() {
        const settings = {
            soundEnabled: this.soundEnabled,
            musicEnabled: this.musicEnabled,
            masterVolume: Math.round(this.masterVolume * 100),
            sfxVolume: Math.round(this.sfxVolume * 100),
            musicVolume: Math.round(this.musicVolume * 100)
        };
        try {
            localStorage.setItem('puzzleGameAudioSettings', JSON.stringify(settings));
            console.log('音频设置已保存');
        } catch (error) {
            console.warn('保存音频设置失败:', error);
        }
    }

    /**
     * 从localStorage加载设置
     */
    loadSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('puzzleGameAudioSettings'));
            if (settings) {
                if (typeof settings.soundEnabled === 'boolean') {
                    this.soundEnabled = settings.soundEnabled;
                }
                if (typeof settings.musicEnabled === 'boolean') {
                    this.musicEnabled = settings.musicEnabled;
                }
                if (typeof settings.masterVolume === 'number') {
                    this.masterVolume = settings.masterVolume / 100;
                }
                if (typeof settings.sfxVolume === 'number') {
                    this.sfxVolume = settings.sfxVolume / 100;
                }
                if (typeof settings.musicVolume === 'number') {
                    this.musicVolume = settings.musicVolume / 100;
                }
                console.log('音频设置已加载');
            }
        } catch (error) {
            console.warn('加载音频设置失败:', error);
        }
    }

    /**
     * 获取状态
     * @returns {Object} 包含所有状态的对象
     */
    getState() {
        return {
            soundEnabled: this.soundEnabled,
            musicEnabled: this.musicEnabled,
            isPlaying: this.backgroundMusicSource !== null,
            volumes: this.getVolumes(),
            isInitialized: this.isInitialized
        };
    }

    /**
     * 清理资源
     */
    dispose() {
        this.stopBackgroundMusic();

        if (this.audioContext) {
            try {
                this.audioContext.close();
            } catch (e) {
                // 忽略错误
            }
            this.audioContext = null;
        }

        this.moveSoundBuffer = null;
        this.clickSoundBuffer = null;
        this.winSoundBuffer = null;
        this.isInitialized = false;
    }
}

// 导出为全局变量
if (typeof window !== 'undefined') {
    window.AudioManager = AudioManager;
}
