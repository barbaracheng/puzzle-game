class PuzzleGame {
    constructor() {
        this.size = 4;
        this.tiles = [];
        this.emptyIndex = 0;
        this.moves = 0;
        this.timer = null;
        this.seconds = 0;
        this.isPlaying = false;
        this.originalImage = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createBoard();
        this.shuffle();
    }

    setupEventListeners() {
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.size = parseInt(e.target.value);
            this.resetGame();
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
            
            if (i === totalTiles - 1) {
                tile.className += ' empty';
                tile.textContent = '';
                this.emptyIndex = i;
            } else {
                tile.textContent = i + 1;
                tile.addEventListener('click', () => this.handleTileClick(i));
            }
            
            this.tiles.push({
                element: tile,
                currentIndex: i,
                correctIndex: i,
                value: i
            });

            board.appendChild(tile);
        }
    }

    handleTileClick(clickedValue) {
        if (!this.isPlaying) {
            this.startTimer();
            this.isPlaying = true;
        }

        const clickedIndex = this.tiles.findIndex(t => t.value === clickedValue);
        this.moveTile(clickedIndex);
    }

    moveTile(index) {
        if (!this.canMove(index)) return;

        const emptyPos = this.getTilePosition(this.emptyIndex);
        const tilePos = this.getTilePosition(index);

        const distance = Math.abs(emptyPos.row - tilePos.row) + 
                        Math.abs(emptyPos.col - tilePos.col);

        if (distance !== 1) return;

        // Swap tiles
        const emptyElement = this.tiles[this.emptyIndex].element;
        const tileElement = this.tiles[index].element;

        // Swap elements in the DOM
        const temp = emptyElement.innerHTML;
        emptyElement.innerHTML = tileElement.innerHTML;
        emptyElement.className = tileElement.className;
        emptyElement.className = emptyElement.className.replace(' empty', '');
        
        tileElement.innerHTML = '';
        tileElement.className = 'puzzle-tile empty';

        // Update event listeners
        const emptyValue = this.tiles[this.emptyIndex].value;
        const tileValue = this.tiles[index].value;

        this.tiles[this.emptyIndex].value = tileValue;
        this.tiles[index].value = emptyValue;

        this.tiles[this.emptyIndex].element.addEventListener('click', () => 
            this.handleTileClick(this.tiles[this.emptyIndex].value));

        // Remove event listener from empty tile
        const newEmptyIndex = index;
        this.tiles[newEmptyIndex].element.removeEventListener('click', () => {});

        this.emptyIndex = newEmptyIndex;

        this.moves++;
        this.updateMoves();

        this.checkWin();
    }

    canMove(index) {
        const emptyPos = this.getTilePosition(this.emptyIndex);
        const tilePos = this.getTilePosition(index);

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

    shuffle() {
        // Reset state
        this.moves = 0;
        this.seconds = 0;
        this.isPlaying = false;
        this.stopTimer();
        this.updateMoves();
        this.updateTimer();
        this.hideWin();

        // Create solvable shuffle
        const totalTiles = this.size * this.size;
        const shuffledValues = [];
        
        for (let i = 0; i < totalTiles - 1; i++) {
            shuffledValues.push(i + 1);
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
        const board = document.getElementById('puzzle-board');
        for (let i = 0; i < totalTiles; i++) {
            const value = shuffledValues[i];
            const tile = this.tiles[i];
            
            if (value === 0) {
                tile.element.className = 'puzzle-tile empty';
                tile.element.innerHTML = '';
                tile.value = 0;
                this.emptyIndex = i;
            } else {
                tile.element.className = 'puzzle-tile';
                tile.element.textContent = value;
                tile.value = value;
                tile.element.addEventListener('click', () => this.handleTileClick(value));
            }
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
            const expectedValue = (i === totalTiles - 1) ? 0 : i + 1;
            if (this.tiles[i].value !== expectedValue) {
                return false;
            }
        }

        this.stopTimer();
        this.isPlaying = false;
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
        document.getElementById('preview-overlay').classList.add('visible');
    }

    hidePreview() {
        document.getElementById('preview-overlay').classList.remove('visible');
    }

    startTimer() {
        if (this.timer) return;
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
