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
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createBoard();
        this.shuffle();
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
    }

    handleDifficultyChange(newSize) {
        if (this.isPlaying && !this.isPaused) {
            // If game is in progress, ask for confirmation
            if (confirm('游戏正在进行中，切换难度将重新开始游戏，确定要继续吗？')) {
                this.size = parseInt(newSize);
                this.resetGame();
            } else {
                // Revert the select to current size
                document.getElementById('difficulty').value = this.size;
            }
        } else {
            // Game not started or paused, allow change
            this.size = parseInt(newSize);
            this.resetGame();
        }
    }

    handleImageUpload(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.originalImage = e.target.result;
            this.createTileImages();
            this.resetGame();
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
                value: i === totalTiles - 1 ? 0 : i
            });

            board.appendChild(tile);
        }
        
        // Apply images if they exist
        if (this.originalImage) {
            this.createTileImages();
        }
    }

    handleTileClick(tileIndex) {
        if (!this.isPlaying || this.isPaused) return;
        
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

        // Swap values
        const tempValue = clickedTile.value;
        clickedTile.value = emptyTile.value;
        emptyTile.value = tempValue;

        // Update the DOM
        if (clickedTile.value === 0) {
            clickedTile.element.className = 'puzzle-tile empty';
            clickedTile.element.textContent = '';
            clickedTile.element.style.backgroundImage = '';
            clickedTile.element.style.backgroundSize = '';
            clickedTile.element.style.backgroundPosition = '';
        } else {
            clickedTile.element.className = 'puzzle-tile';
            clickedTile.element.textContent = clickedTile.value + 1;
            
            // Apply image if exists
            if (this.originalImage && this.tileImages[clickedTile.value]) {
                clickedTile.element.style.backgroundImage = `url(${this.tileImages[clickedTile.value]})`;
                clickedTile.element.style.backgroundSize = 'cover';
                clickedTile.element.style.backgroundPosition = 'center';
                clickedTile.element.textContent = '';
                clickedTile.element.classList.add('has-image');
            }
        }

        if (emptyTile.value !== 0) {
            emptyTile.element.className = 'puzzle-tile';
            emptyTile.element.textContent = emptyTile.value + 1;
            
            // Apply image if exists
            if (this.originalImage && this.tileImages[emptyTile.value]) {
                emptyTile.element.style.backgroundImage = `url(${this.tileImages[emptyTile.value]})`;
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
        
        if (this.isPaused) {
            pauseIcon.style.display = 'none';
            playIcon.style.display = 'block';
            this.stopTimer();
            board.classList.add('paused');
        } else {
            pauseIcon.style.display = 'block';
            playIcon.style.display = 'none';
            this.startTimer();
            board.classList.remove('paused');
        }
    }

    shuffle() {
        // Reset state
        this.moves = 0;
        this.seconds = 0;
        this.isPlaying = false;
        this.isPaused = false;
        this.stopTimer();
        this.updateMoves();
        this.updateTimer();
        this.hideWin();
        
        // Reset pause button
        const pauseIcon = document.getElementById('pause-icon');
        const playIcon = document.getElementById('play-icon');
        pauseIcon.style.display = 'block';
        playIcon.style.display = 'none';
        document.getElementById('puzzle-board').classList.remove('paused');

        // Create board first
        this.createBoard();

        // Create solvable shuffle
        const totalTiles = this.size * this.size;
        const shuffledValues = [];
        
        for (let i = 0; i < totalTiles - 1; i++) {
            shuffledValues.push(i);
        }
        shuffledValues.push(0); // 0 represents empty

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
        for (let i = 0; i < totalTiles; i++) {
            const value = shuffledValues[i];
            const tile = this.tiles[i];
            
            tile.value = value;
            
            if (value === 0) {
                tile.element.className = 'puzzle-tile empty';
                tile.element.textContent = '';
                tile.element.style.backgroundImage = '';
                tile.element.style.backgroundSize = '';
                tile.element.style.backgroundPosition = '';
                this.emptyIndex = i;
            } else {
                tile.element.className = 'puzzle-tile';
                
                // Apply image if exists
                if (this.originalImage && this.tileImages[value]) {
                    tile.element.style.backgroundImage = `url(${this.tileImages[value]})`;
                    tile.element.style.backgroundSize = 'cover';
                    tile.element.style.backgroundPosition = 'center';
                    tile.element.textContent = '';
                    tile.element.classList.add('has-image');
                } else {
                    tile.element.textContent = value + 1;
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
    }

    checkWin() {
        const totalTiles = this.size * this.size;
        
        for (let i = 0; i < totalTiles; i++) {
            const expectedValue = (i === totalTiles - 1) ? 0 : i;
            if (this.tiles[i].value !== expectedValue) {
                return false;
            }
        }

        this.stopTimer();
        this.isPlaying = false;
        this.isPaused = false;
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
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PuzzleGame();
});
