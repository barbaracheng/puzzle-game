class PuzzleGame {
    constructor() {
        this.size = 4;
        this.tiles = [];
        this.emptyIndex = 0;
        this.moves = 0;
        this.timer = null;
        this.seconds = 0;
        this.isPlaying = false;
        this.isPaused = false;
        this.originalImage = null;
        this.tileImages = [];
        this.gameStarted = false; // 新增：游戏是否已开始的标志

        // 音频管理器
        this.audioManager = new AudioManager();
        this.audioManager.onError = (message) => {
            this.showToast(message);
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createBoard();
        this.shuffle();

        // 初始化音量图标
        const volumeSlider = document.getElementById('volume-slider');
        if (volumeSlider) {
            this.updateVolumeIcon(volumeSlider.value);
        }
    }

    setupEventListeners() {
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.handleDifficultyChange(e.target.value);
        });

        document.getElementById('shuffle-btn').addEventListener('click', () => {
            this.resetGame();
        });

        document.getElementById('preview-btn').addEventListener('click', () => {
            this.showPreview();
        });

        document.getElementById('close-preview').addEventListener('click', () => {
            this.hidePreview();
        });

        document.getElementById('play-again').addEventListener('click', () => {
            this.hideWin();
            this.resetGame();
        });

        // Upload image functionality
        const uploadBtn = document.getElementById('upload-btn');
        const imageInput = document.getElementById('image-input');

        uploadBtn.addEventListener('click', () => {
            imageInput.click();
        });

        imageInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                this.handleImageUpload(e.target.files[0]);
            }
        });

        // Pause/Resume functionality
        const pauseBtn = document.getElementById('pause-btn');
        pauseBtn.addEventListener('click', () => {
            this.togglePause();
        });

        // Start game functionality
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.toggleGame();
            });
        }

        // Sound toggle functionality
        const soundBtn = document.getElementById('sound-btn');
        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                this.toggleSound();
            });
        }

        // Music toggle functionality
        const musicBtn = document.getElementById('music-btn');
        if (musicBtn) {
            musicBtn.addEventListener('click', () => {
                this.toggleMusic();
            });
        }

        // Volume control functionality
        const volumeSlider = document.getElementById('volume-slider');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                this.setVolume(e.target.value);
                this.updateVolumeIcon(e.target.value);
            });
        }

        // Volume button toggle functionality
        const volumeBtn = document.getElementById('volume-btn');
        if (volumeBtn) {
            volumeBtn.addEventListener('click', () => {
                this.toggleVolumeControl();
            });
        }
    }

    handleDifficultyChange(newSize) {
        if (this.isPlaying && !this.isPaused) {
            // If game is in progress, ask for confirmation
            if (confirm('游戏正在进行中，切换难度将重新开始游戏，确定要继续吗？')) {
                this.size = parseInt(newSize);
                this.resetGame();
                this.showToast('难度已切换，请点击"开始游戏"');
            } else {
                // Revert the select to current size
                document.getElementById('difficulty').value = this.size;
            }
        } else {
            // Game not started or paused, allow change
            this.size = parseInt(newSize);
            this.resetGame();
            if (this.gameStarted) {
                this.gameStarted = false;
                this.showToast('难度已切换，请点击"开始游戏"');
            }
        }
    }

    handleImageUpload(file) {
        // 检查是否为图片文件
        if (!file.type.startsWith('image/')) {
            this.showToast('请上传图片文件！');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.originalImage = e.target.result;
            this.createTileImages();
            // 上传图片后重置游戏状态，但保持gameStarted为false
            this.shuffle();
            this.showToast('图片上传成功！点击"开始游戏"开始拼图');
        };
        reader.readAsDataURL(file);
    }

    createTileImages() {
        if (!this.originalImage) {
            this.tileImages = [];
            return;
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Make sure image is square
            const size = Math.min(img.width, img.height);
            canvas.width = size / this.size;
            canvas.height = size / this.size;
            
            this.tileImages = [];
            
            for (let row = 0; row < this.size; row++) {
                for (let col = 0; col < this.size; col++) {
                    // Draw the portion of image for this tile
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(
                        img,
                        (col * img.width) / this.size,
                        (row * img.height) / this.size,
                        img.width / this.size,
                        img.height / this.size,
                        0,
                        0,
                        canvas.width,
                        canvas.height
                    );
                    
                    this.tileImages.push(canvas.toDataURL());
                }
            }
            
            // Update board with images
            this.updateBoardWithImages();
        };
        
        img.src = this.originalImage;
    }

    updateBoardWithImages() {
        if (this.tileImages.length === 0) return;
        
        const totalTiles = this.size * this.size;
        for (let i = 0; i < totalTiles; i++) {
            const tile = this.tiles[i];
            if (tile.value !== 0) {
                // Use image instead of text
                const imageIndex = tile.value - 1;
                if (this.tileImages[imageIndex]) {
                    tile.element.style.backgroundImage = `url(${this.tileImages[imageIndex]})`;
                    tile.element.style.backgroundSize = 'cover';
                    tile.element.style.backgroundPosition = 'center';
                    tile.element.textContent = '';
                    tile.element.classList.add('has-image');
                }
            }
        }
    }

    createBoard() {
        const board = document.getElementById('puzzle-board');
        board.innerHTML = '';
        board.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;

        // Bug 1 修复：确保清空旧的tiles数组
        this.tiles = [];
        const totalTiles = this.size * this.size;

        for (let i = 0; i < totalTiles; i++) {
            const tile = document.createElement('div');
            tile.className = 'puzzle-tile';
            tile.dataset.index = i;
            
            if (i === totalTiles - 1) {
                tile.className += ' empty';
                tile.textContent = '';
                this.emptyIndex = i;
            } else {
                tile.textContent = i + 1;
            }
            
            this.tiles.push({
                element: tile,
                currentIndex: i,
                correctIndex: i,
                value: i === totalTiles - 1 ? 0 : i + 1  // 修复：非空白格的value应该是i+1
            });

            board.appendChild(tile);
        }
        
        // Apply images if they exist
        if (this.originalImage) {
            this.createTileImages();
        }
    }

    handleTileClick(tileIndex) {
        // Bug 3修复：添加未开始和暂停状态的提示
        if (!this.isPlaying) {
            this.showToast('请点击"开始游戏"按钮！');
            return;
        }
        
        if (this.isPaused) {
            this.showToast('游戏已暂停，请点击继续');
            return;
        }
        
        this.moveTile(tileIndex);
    }

    moveTile(tileIndex) {
        if (!this.canMove(tileIndex)) return;

        const emptyPos = this.getTilePosition(this.emptyIndex);
        const tilePos = this.getTilePosition(tileIndex);

        const distance = Math.abs(emptyPos.row - tilePos.row) +
                        Math.abs(emptyPos.col - tilePos.col);

        if (distance !== 1) return;

        // Get the tile at the clicked index
        const clickedTile = this.tiles[tileIndex];
        const emptyTile = this.tiles[this.emptyIndex];

        // Bug 1 修复：确保 emptyTile.value 是 0，避免创建多个空白格
        if (emptyTile.value !== 0) {
            console.error('Error: emptyTile.value is not 0!', emptyTile.value);
            return;
        }

        // Swap values
        const tempValue = clickedTile.value;
        clickedTile.value = emptyTile.value;  // clickedTile 变成 0 (空白)
        emptyTile.value = tempValue;  // emptyTile 变成原来的值

        // Update the DOM
        if (clickedTile.value === 0) {
            clickedTile.element.className = 'puzzle-tile empty';
            clickedTile.element.textContent = '';
            clickedTile.element.style.backgroundImage = '';
            clickedTile.element.style.backgroundSize = '';
            clickedTile.element.style.backgroundPosition = '';
        } else {
            clickedTile.element.className = 'puzzle-tile';
            clickedTile.element.textContent = clickedTile.value;  // 修复：直接显示value，不需要+1
            
            // Apply image if exists (value从1开始，所以image索引是value-1)
            if (this.originalImage && this.tileImages[clickedTile.value - 1]) {
                clickedTile.element.style.backgroundImage = `url(${this.tileImages[clickedTile.value - 1]})`;
                clickedTile.element.style.backgroundSize = 'cover';
                clickedTile.element.style.backgroundPosition = 'center';
                clickedTile.element.textContent = '';
                clickedTile.element.classList.add('has-image');
            }
        }

        if (emptyTile.value !== 0) {
            emptyTile.element.className = 'puzzle-tile';
            emptyTile.element.textContent = emptyTile.value;  // 修复：直接显示value，不需要+1
            
            // Apply image if exists (value从1开始，所以image索引是value-1)
            if (this.originalImage && this.tileImages[emptyTile.value - 1]) {
                emptyTile.element.style.backgroundImage = `url(${this.tileImages[emptyTile.value - 1]})`;
                emptyTile.element.style.backgroundSize = 'cover';
                emptyTile.element.style.backgroundPosition = 'center';
                emptyTile.element.textContent = '';
                emptyTile.element.classList.add('has-image');
            }
        }

        // Update empty index
        this.emptyIndex = tileIndex;

        this.moves++;
        this.updateMoves();

        // 播放移动音效
        this.playMoveSound();

        this.checkWin();
    }

    canMove(tileIndex) {
        const emptyPos = this.getTilePosition(this.emptyIndex);
        const tilePos = this.getTilePosition(tileIndex);

        const distance = Math.abs(emptyPos.row - tilePos.row) + 
                        Math.abs(emptyPos.col - tilePos.col);

        return distance === 1;
    }

    getTilePosition(index) {
        return {
            row: Math.floor(index / this.size),
            col: index % this.size
        };
    }

    togglePause() {
        if (!this.isPlaying) return;

        this.isPaused = !this.isPaused;

        const pauseIcon = document.getElementById('pause-icon');
        const playIcon = document.getElementById('play-icon');
        const board = document.getElementById('puzzle-board');
        const pauseBtnText = document.getElementById('pause-btn-text');

        if (this.isPaused) {
            pauseIcon.style.display = 'none';
            playIcon.style.display = 'block';
            this.stopTimer();
            board.classList.add('paused');
            // Bug 2 修复：更新按钮文字
            if (pauseBtnText) {
                pauseBtnText.textContent = '继续游戏';
            }
            this.showToast('游戏已暂停');
        } else {
            pauseIcon.style.display = 'block';
            playIcon.style.display = 'none';
            this.startTimer();
            board.classList.remove('paused');
            // Bug 2 修复：更新按钮文字
            if (pauseBtnText) {
                pauseBtnText.textContent = '暂停游戏';
            }
            this.showToast('游戏继续');
        }
    }

    shuffle() {
        // Reset state
        this.moves = 0;
        this.seconds = 0;
        this.isPlaying = false;
        this.isPaused = false;
        this.gameStarted = false; // 重置游戏开始标志
        this.stopTimer();
        this.updateMoves();
        this.updateTimer();
        this.hideWin();

        // Reset pause button
        const pauseIcon = document.getElementById('pause-icon');
        const playIcon = document.getElementById('play-icon');
        const pauseBtnText = document.getElementById('pause-btn-text');
        pauseIcon.style.display = 'block';
        playIcon.style.display = 'none';
        document.getElementById('puzzle-board').classList.remove('paused');
        // Bug 2 修复：重置暂停按钮文字
        if (pauseBtnText) {
            pauseBtnText.textContent = '暂停';
        }

        // Create board first
        this.createBoard();

        // Create solvable shuffle
        const totalTiles = this.size * this.size;
        const shuffledValues = [];

        // Bug 1 修复：创建包含一个0的数组
        for (let i = 1; i < totalTiles; i++) {
            shuffledValues.push(i);
        }
        shuffledValues.push(0); // 只有一个0表示空白格

        // Fisher-Yates shuffle with solvability check
        let inversions = 0;
        let emptyRowFromBottom = 0;

        do {
            for (let i = shuffledValues.length - 2; i >= 1; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledValues[i], shuffledValues[j]] = [shuffledValues[j], shuffledValues[i]];
            }

            // Count inversions for solvability check
            inversions = 0;
            for (let i = 0; i < shuffledValues.length; i++) {
                for (let j = i + 1; j < shuffledValues.length; j++) {
                    if (shuffledValues[i] > shuffledValues[j] &&
                        shuffledValues[i] !== 0 && shuffledValues[j] !== 0) {
                        inversions++;
                    }
                }
            }

            // Find empty row from bottom
            const emptyIndex = shuffledValues.indexOf(0);
            emptyRowFromBottom = this.size - Math.floor(emptyIndex / this.size);
        } while (!this.isSolvable(inversions, emptyRowFromBottom));

        // Apply shuffled values to board
        // Bug 1 修复：确保只有一个空白格
        for (let i = 0; i < totalTiles; i++) {
            const value = shuffledValues[i];
            const tile = this.tiles[i];

            tile.value = value;

            if (value === 0) {
                // Bug 1 修复：确保只有一个空白格
                tile.element.className = 'puzzle-tile empty';
                tile.element.textContent = '';
                tile.element.style.backgroundImage = '';
                tile.element.style.backgroundSize = '';
                tile.element.style.backgroundPosition = '';
                this.emptyIndex = i;
            } else {
                tile.element.className = 'puzzle-tile';

                // Apply image if exists (value从1开始，所以image索引是value-1)
                if (this.originalImage && this.tileImages[value - 1]) {
                    tile.element.style.backgroundImage = `url(${this.tileImages[value - 1]})`;
                    tile.element.style.backgroundSize = 'cover';
                    tile.element.style.backgroundPosition = 'center';
                    tile.element.textContent = '';
                    tile.element.classList.add('has-image');
                } else {
                    tile.element.textContent = value;
                }
            }

            // Add click event listener
            tile.element.onclick = () => this.handleTileClick(i);
        }
    }

    isSolvable(inversions, emptyRowFromBottom) {
        // For N-puzzle, the solvability rules are:
        // If N is odd (3x3): solvable if inversions is even
        // If N is even (4x4, 5x5): solvable if (inversions + emptyRowFromBottom) is odd
        if (this.size % 2 === 1) {
            return inversions % 2 === 0;
        } else {
            return (inversions + emptyRowFromBottom) % 2 === 1;
        }
    }

    resetGame() {
        this.shuffle();

        // 重置开始按钮状态
        const startBtnText = document.getElementById('start-btn-text');
        const startIcon = document.getElementById('start-icon');
        const stopIcon = document.getElementById('stop-icon');

        if (startBtnText) {
            startBtnText.textContent = '开始游戏';
        }
        if (startIcon) {
            startIcon.style.display = 'block';
        }
        if (stopIcon) {
            stopIcon.style.display = 'none';
        }
    }

    // 修复：开始/结束游戏切换
    toggleGame() {
        if (!this.gameStarted) {
            // 开始游戏
            this.startGame();
        } else {
            // 结束游戏 - 弹出确认对话框
            if (confirm('确定要结束游戏吗？')) {
                this.endGame();
            }
        }
    }

    // 开始游戏
    async startGame() {
        this.gameStarted = true;
        this.isPlaying = true;
        this.isPaused = false;

        // 初始化音频管理器
        if (!this.audioManager.isInitialized) {
            await this.audioManager.init();
        }

        // 更新按钮状态为"结束游戏"
        const startBtnText = document.getElementById('start-btn-text');
        const startIcon = document.getElementById('start-icon');
        const stopIcon = document.getElementById('stop-icon');

        if (startBtnText) {
            startBtnText.textContent = '结束游戏';
        }
        if (startIcon) {
            startIcon.style.display = 'none';
        }
        if (stopIcon) {
            stopIcon.style.display = 'block';
        }

        // Bug 2 修复：设置暂停按钮文字
        const pauseBtnText = document.getElementById('pause-btn-text');
        if (pauseBtnText) {
            pauseBtnText.textContent = '暂停游戏';
        }

        this.startTimer();
        this.showToast('游戏开始！点击空白格相邻的方块进行移动');
    }

    // 结束游戏
    endGame() {
        this.gameStarted = false;
        this.isPlaying = false;
        this.isPaused = false;

        // 重置游戏
        this.resetGame();

        // 更新按钮状态为"开始游戏"
        const startBtnText = document.getElementById('start-btn-text');
        const startIcon = document.getElementById('start-icon');
        const stopIcon = document.getElementById('stop-icon');

        if (startBtnText) {
            startBtnText.textContent = '开始游戏';
        }
        if (startIcon) {
            startIcon.style.display = 'block';
        }
        if (stopIcon) {
            stopIcon.style.display = 'none';
        }

        this.showToast('游戏已结束');
    }

    // 音效开关
    toggleSound() {
        const enabled = this.audioManager.toggleSound();

        const soundOnIcon = document.getElementById('sound-on-icon');
        const soundOffIcon = document.getElementById('sound-off-icon');
        const soundBtn = document.getElementById('sound-btn');

        if (enabled) {
            soundOnIcon.style.display = 'block';
            soundOffIcon.style.display = 'none';
            soundBtn.style.color = 'var(--primary-color)';
            this.showToast('音效已开启');
        } else {
            soundOnIcon.style.display = 'none';
            soundOffIcon.style.display = 'block';
            soundBtn.style.color = 'var(--text-secondary)';
            this.showToast('音效已关闭');
        }
    }

    // 音乐开关
    async toggleMusic() {
        // 初始化音频管理器（如果是第一次）
        if (!this.audioManager.isInitialized) {
            await this.audioManager.init();
        }

        const enabled = this.audioManager.toggleMusic();

        const musicOnIcon = document.getElementById('music-on-icon');
        const musicOffIcon = document.getElementById('music-off-icon');
        const musicBtn = document.getElementById('music-btn');

        if (enabled) {
            musicOnIcon.style.display = 'block';
            musicOffIcon.style.display = 'none';
            musicBtn.style.color = 'var(--primary-color)';
            this.showToast('背景音乐已开启');
        } else {
            musicOnIcon.style.display = 'none';
            musicOffIcon.style.display = 'block';
            musicBtn.style.color = 'var(--text-secondary)';
            this.showToast('背景音乐已关闭');
        }
    }

    // 设置音量
    setVolume(value) {
        this.audioManager.setMasterVolume(value);
    }

    // 切换音量控制显示
    toggleVolumeControl() {
        const volumeControl = document.getElementById('volume-control');
        if (volumeControl) {
            const isHidden = volumeControl.style.display === 'none';
            volumeControl.style.display = isHidden ? 'flex' : 'none';
        }
    }

    // 更新音量图标
    updateVolumeIcon(volume) {
        const volumeHighIcon = document.getElementById('volume-high-icon');
        const volumeLowIcon = document.getElementById('volume-low-icon');
        const volumeMuteIcon = document.getElementById('volume-mute-icon');
        const volumeBtn = document.getElementById('volume-btn');

        if (!volumeHighIcon || !volumeLowIcon || !volumeMuteIcon || !volumeBtn) return;

        // 隐藏所有图标
        volumeHighIcon.style.display = 'none';
        volumeLowIcon.style.display = 'none';
        volumeMuteIcon.style.display = 'none';

        // 根据音量显示对应图标
        if (volume == 0) {
            volumeMuteIcon.style.display = 'block';
            volumeBtn.style.color = 'var(--text-secondary)';
        } else if (volume < 50) {
            volumeLowIcon.style.display = 'block';
            volumeBtn.style.color = 'var(--primary-color)';
        } else {
            volumeHighIcon.style.display = 'block';
            volumeBtn.style.color = 'var(--primary-color)';
        }
    }

    // 播放移动音效
    async playMoveSound() {
        // 确保音频管理器已初始化
        if (!this.audioManager.isInitialized) {
            await this.audioManager.init();
        }

        this.audioManager.playMoveSound();
    }

    // 新增：开始游戏
    startGame_old() {
        if (this.gameStarted) {
            // 如果游戏已经开始，提示确认
            if (confirm('游戏已经开始，确定要重新开始吗？')) {
                this.shuffle();
                this.gameStarted = false;
                this.startGame();
            }
            return;
        }

        this.gameStarted = true;
        this.isPlaying = true;
        this.isPaused = false;

        // Bug 2 修复：设置暂停按钮文字
        const pauseBtnText = document.getElementById('pause-btn-text');
        if (pauseBtnText) {
            pauseBtnText.textContent = '暂停游戏';
        }

        this.startTimer();
        this.showToast('游戏开始！点击空白格相邻的方块进行移动');
    }

    async checkWin() {
        const totalTiles = this.size * this.size;

        for (let i = 0; i < totalTiles; i++) {
            const expectedValue = (i === totalTiles - 1) ? 0 : i + 1;  // 修复：期望值应该是i+1
            if (this.tiles[i].value !== expectedValue) {
                return false;
            }
        }

        this.stopTimer();
        this.isPlaying = false;
        this.isPaused = false;
        this.gameStarted = false;  // 重置游戏开始标志

        // 更新按钮状态为"开始游戏"
        const startBtnText = document.getElementById('start-btn-text');
        const startIcon = document.getElementById('start-icon');
        const stopIcon = document.getElementById('stop-icon');

        if (startBtnText) {
            startBtnText.textContent = '开始游戏';
        }
        if (startIcon) {
            startIcon.style.display = 'block';
        }
        if (stopIcon) {
            stopIcon.style.display = 'none';
        }

        // 播放胜利音效
        this.audioManager.playWinSound();

        this.showWin();
        return true;
    }

    showWin() {
        const minutes = Math.floor(this.seconds / 60);
        const seconds = this.seconds % 60;
        const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        const message = `你用了 ${this.moves} 步和 ${timeStr} 时间完成了拼图！`;
        document.getElementById('win-message').textContent = message;
        document.getElementById('win-overlay').classList.remove('hidden');
    }

    hideWin() {
        document.getElementById('win-overlay').classList.add('hidden');
    }

    showPreview() {
        const previewContainer = document.getElementById('preview-image-container');
        previewContainer.innerHTML = '';
        
        if (this.originalImage) {
            // Show the original image
            const img = document.createElement('img');
            img.src = this.originalImage;
            img.style.maxWidth = '100%';
            img.style.maxHeight = '400px';
            img.style.borderRadius = '10px';
            previewContainer.appendChild(img);
        } else {
            // Show the number tiles in correct order
            const previewBoard = document.createElement('div');
            previewBoard.className = 'preview-board';
            previewBoard.style.display = 'grid';
            previewBoard.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;
            previewBoard.style.gap = '4px';
            previewBoard.style.padding = '8px';
            previewBoard.style.background = 'rgba(0, 0, 0, 0.3)';
            previewBoard.style.borderRadius = '15px';
            previewBoard.style.aspectRatio = '1';
            previewBoard.style.maxWidth = '300px';
            previewBoard.style.margin = '0 auto';
            
            const totalTiles = this.size * this.size;
            for (let i = 0; i < totalTiles; i++) {
                const tile = document.createElement('div');
                tile.className = 'puzzle-tile';
                tile.style.fontSize = `${1.5 - (this.size * 0.1)}em`;
                
                if (i === totalTiles - 1) {
                    tile.className += ' empty';
                    tile.textContent = '';
                } else {
                    tile.textContent = i + 1;
                }
                
                previewBoard.appendChild(tile);
            }
            
            previewContainer.appendChild(previewBoard);
        }
        
        document.getElementById('preview-overlay').classList.add('visible');
    }

    hidePreview() {
        document.getElementById('preview-overlay').classList.remove('visible');
    }

    startTimer() {
        if (this.timer || this.isPaused) return;
        this.timer = setInterval(() => {
            this.seconds++;
            this.updateTimer();
        }, 1000);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    updateTimer() {
        const minutes = Math.floor(this.seconds / 60);
        const seconds = this.seconds % 60;
        const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        document.getElementById('time').textContent = timeStr;
    }

    updateMoves() {
        document.getElementById('moves').textContent = this.moves;
    }

    // 新增：显示Toast提示
    showToast(message) {
        // 移除旧的toast
        const oldToast = document.querySelector('.toast-message');
        if (oldToast) {
            oldToast.remove();
        }

        // 创建新的toast
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.textContent = message;
        document.body.appendChild(toast);

        // 3秒后移除
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
            }, 300);
        }, 2000);
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PuzzleGame();
});
