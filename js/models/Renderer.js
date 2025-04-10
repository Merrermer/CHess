/**
 * Class responsible for rendering the Chinese Chess board and UI
 */
export default class Renderer {
    /**
     * Create a new renderer
     * @param {HTMLElement} boardElement - The DOM element to render the board into
     * @param {Object} game - The game instance
     */
    constructor(boardElement, game) {
        this.boardElement = boardElement;
        this.game = game;
        this.cellSize = 0;
        this.cells = [];
        this.initialized = false;
    }

    /**
     * Initialize the board UI
     */
    initialize() {
        // Clear the board
        this.boardElement.innerHTML = '';
        this.cells = [];

        // Calculate cell size
        const boardWidth = this.boardElement.clientWidth;
        this.cellSize = boardWidth / 8; // 9 columns = 8 junctions in Chinese Chess

        // Create the river
        const river = document.createElement('div');
        river.className = 'river';
        this.boardElement.appendChild(river);

        // Create the palaces
        const redPalace = document.createElement('div');
        redPalace.className = 'palace red';
        this.boardElement.appendChild(redPalace);

        const blackPalace = document.createElement('div');
        blackPalace.className = 'palace black';
        this.boardElement.appendChild(blackPalace);

        // Create the grid lines
        this.createGridLines();

        // Create special point markers for soldier positions
        this.createPointMarkers();

        // Create cells at junctions rather than inside the grid
        for (let row = 0; row < this.game.board.rows; row++) {
            for (let col = 0; col < this.game.board.cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                
                // Position at junctions (subtract half cell size to center)
                cell.style.width = `${this.cellSize}px`;
                cell.style.height = `${this.cellSize}px`;
                cell.style.left = `${col * this.cellSize - this.cellSize/2}px`;
                cell.style.top = `${row * this.cellSize - this.cellSize/2}px`;
                
                // Add click handler
                cell.addEventListener('click', () => {
                    this.game.handleCellClick(row, col);
                });
                
                this.boardElement.appendChild(cell);
                this.cells.push({ element: cell, row, col });
            }
        }

        // Create diagonal lines in the palaces
        this.createPalaceDiagonals();

        this.initialized = true;
        this.render();
    }

    /**
     * Create grid lines on the board
     */
    createGridLines() {
        // Horizontal lines
        for (let row = 0; row < this.game.board.rows; row++) {
            const line = document.createElement('div');
            line.className = 'grid-line horizontal';
            line.style.top = `${row * this.cellSize}px`;
            this.boardElement.appendChild(line);
        }

        // Vertical lines
        for (let col = 0; col < this.game.board.cols; col++) {
            const line = document.createElement('div');
            line.className = 'grid-line vertical';
            line.style.left = `${col * this.cellSize}px`;
            this.boardElement.appendChild(line);
        }
    }

    /**
     * Create diagonal lines in the palaces
     */
    createPalaceDiagonals() {
        // Black palace diagonals
        this.createDiagonalLine(0, 3, 2, 5); // Top-left to bottom-right
        this.createDiagonalLine(0, 5, 2, 3); // Top-right to bottom-left

        // Red palace diagonals
        this.createDiagonalLine(7, 3, 9, 5); // Top-left to bottom-right
        this.createDiagonalLine(7, 5, 9, 3); // Top-right to bottom-left
    }

    /**
     * Create a diagonal line between two points
     * @param {number} startRow - Starting row
     * @param {number} startCol - Starting column
     * @param {number} endRow - Ending row
     * @param {number} endCol - Ending column
     */
    createDiagonalLine(startRow, startCol, endRow, endCol) {
        const line = document.createElement('div');
        line.className = 'diagonal-line';
        
        const startX = startCol * this.cellSize;
        const startY = startRow * this.cellSize;
        const endX = endCol * this.cellSize;
        const endY = endRow * this.cellSize;
        
        // Calculate length and angle
        const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
        const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);
        
        line.style.width = `${length}px`;
        line.style.transform = `translate(${startX}px, ${startY}px) rotate(${angle}deg)`;
        
        this.boardElement.appendChild(line);
    }

    /**
     * Create point markers for soldier positions
     */
    createPointMarkers() {
        // Points for black soldier positions after crossing river
        for (let row = 5; row <= 9; row += 2) {
            for (let col = 0; col <= 8; col += 2) {
                if (row === 5 || col === 0 || col === 8) {
                    this.createPointMarker(row, col);
                }
            }
        }
        
        // Points for red soldier positions after crossing river
        for (let row = 0; row <= 4; row += 2) {
            for (let col = 0; col <= 8; col += 2) {
                if (row === 4 || col === 0 || col === 8) {
                    this.createPointMarker(row, col);
                }
            }
        }
    }

    /**
     * Create a point marker at a position
     * @param {number} row - Row position
     * @param {number} col - Column position
     */
    createPointMarker(row, col) {
        const marker = document.createElement('div');
        marker.className = 'point-marker';
        marker.style.left = `${col * this.cellSize - 4}px`;
        marker.style.top = `${row * this.cellSize - 4}px`;
        this.boardElement.appendChild(marker);
    }

    /**
     * Render the current state of the board
     */
    render() {
        if (!this.initialized) {
            this.initialize();
            return;
        }

        // Clear all pieces
        this.cells.forEach(cell => {
            // Remove any existing pieces
            Array.from(cell.element.children).forEach(child => cell.element.removeChild(child));
            
            // Reset classes
            cell.element.className = 'cell';
        });

        // Render pieces
        for (let row = 0; row < this.game.board.rows; row++) {
            for (let col = 0; col < this.game.board.cols; col++) {
                const piece = this.game.board.getPiece(row, col);
                if (piece) {
                    this.renderPiece(row, col, piece);
                }
            }
        }

        // Highlight selected piece
        if (this.game.board.selectedPiece) {
            const { row, col } = this.game.board.selectedPiece;
            const cell = this.cells.find(c => c.row === row && c.col === col);
            if (cell) {
                cell.element.classList.add('selected');
                
                // Highlight valid moves
                const validMoves = this.game.getValidMoves();
                validMoves.forEach(([moveRow, moveCol]) => {
                    const moveCell = this.cells.find(c => c.row === moveRow && c.col === moveCol);
                    if (moveCell) {
                        moveCell.element.classList.add('valid-move');
                    }
                });
            }
        }

        // Update status message
        const statusElement = document.getElementById('status');
        if (statusElement) {
            statusElement.textContent = this.game.getStatusMessage();
        }

        // Update move history
        this.updateMoveHistory();
    }

    /**
     * Render a piece on the board
     * @param {number} row - Row position
     * @param {number} col - Column position
     * @param {Object} piece - The piece to render
     */
    renderPiece(row, col, piece) {
        const cell = this.cells.find(c => c.row === row && c.col === col);
        if (!cell) return;

        const pieceElement = document.createElement('div');
        pieceElement.className = `piece ${piece.color}`;
        pieceElement.textContent = piece.symbol;
        
        cell.element.appendChild(pieceElement);
    }

    /**
     * Update the move history display
     */
    updateMoveHistory() {
        const movesListElement = document.getElementById('moves-list');
        if (!movesListElement) return;

        // Clear the move list
        movesListElement.innerHTML = '';

        // Add each move to the list
        this.game.board.moveHistory.forEach((move, index) => {
            const moveElement = document.createElement('div');
            
            const color = move.color.charAt(0).toUpperCase() + move.color.slice(1);
            const pieceType = move.piece.charAt(0).toUpperCase() + move.piece.slice(1);
            const from = `${move.from.col},${move.from.row}`;
            const to = `${move.to.col},${move.to.row}`;
            const captureText = move.captured ? ` (captured ${move.captured.color} ${move.captured.type})` : '';
            
            moveElement.textContent = `${index + 1}. ${color} ${pieceType} ${from} → ${to}${captureText}`;
            
            movesListElement.appendChild(moveElement);
        });

        // Scroll to the bottom
        movesListElement.scrollTop = movesListElement.scrollHeight;
    }

    /**
     * Handle window resize
     */
    handleResize() {
        this.initialized = false;
        this.initialize();
    }
} 