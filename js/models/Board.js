import Piece from './Piece.js';

/**
 * Class representing the Chinese Chess board
 */
export default class Board {
    /**
     * Create a new board
     */
    constructor() {
        this.rows = 10;
        this.cols = 9;
        this.grid = Array(this.rows).fill().map(() => Array(this.cols).fill(null));
        this.selectedPiece = null;
        this.currentPlayer = 'red'; // Red goes first
        this.moveHistory = [];
        this.setupPieces();
    }

    /**
     * Set up the initial pieces on the board
     */
    setupPieces() {
        // Place chariots (rooks)
        this.placePiece('chariot', 'black', 0, 0);
        this.placePiece('chariot', 'black', 0, 8);
        this.placePiece('chariot', 'red', 9, 0);
        this.placePiece('chariot', 'red', 9, 8);

        // Place horses (knights)
        this.placePiece('horse', 'black', 0, 1);
        this.placePiece('horse', 'black', 0, 7);
        this.placePiece('horse', 'red', 9, 1);
        this.placePiece('horse', 'red', 9, 7);

        // Place elephants
        this.placePiece('elephant', 'black', 0, 2);
        this.placePiece('elephant', 'black', 0, 6);
        this.placePiece('elephant', 'red', 9, 2);
        this.placePiece('elephant', 'red', 9, 6);

        // Place advisors
        this.placePiece('advisor', 'black', 0, 3);
        this.placePiece('advisor', 'black', 0, 5);
        this.placePiece('advisor', 'red', 9, 3);
        this.placePiece('advisor', 'red', 9, 5);

        // Place generals
        this.placePiece('general', 'black', 0, 4);
        this.placePiece('general', 'red', 9, 4);

        // Place cannons
        this.placePiece('cannon', 'black', 2, 1);
        this.placePiece('cannon', 'black', 2, 7);
        this.placePiece('cannon', 'red', 7, 1);
        this.placePiece('cannon', 'red', 7, 7);

        // Place soldiers
        for (let i = 0; i < 5; i++) {
            this.placePiece('soldier', 'black', 3, i * 2);
            this.placePiece('soldier', 'red', 6, i * 2);
        }
    }

    /**
     * Place a piece on the board
     * @param {string} type - The type of piece
     * @param {string} color - The color of the piece
     * @param {number} row - The row position
     * @param {number} col - The column position
     */
    placePiece(type, color, row, col) {
        const piece = new Piece(type, color, row, col);
        this.grid[row][col] = piece;
        return piece;
    }

    /**
     * Get the piece at the specified position
     * @param {number} row - The row position
     * @param {number} col - The column position
     * @returns {Piece|null} - The piece at the position or null if empty
     */
    getPiece(row, col) {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
            return null;
        }
        return this.grid[row][col];
    }

    /**
     * Select a piece on the board
     * @param {number} row - The row position
     * @param {number} col - The column position
     * @returns {boolean} - True if a piece was selected, false otherwise
     */
    selectPiece(row, col) {
        const piece = this.getPiece(row, col);
        if (piece && piece.color === this.currentPlayer) {
            this.selectedPiece = piece;
            return true;
        }
        return false;
    }

    /**
     * Get all valid moves for the selected piece
     * @returns {Array} - Array of valid move positions [row, col]
     */
    getValidMoves() {
        if (!this.selectedPiece) return [];

        const piece = this.selectedPiece;
        const moves = [];

        switch (piece.type) {
            case 'chariot': // Rook
                this.addStraightLineMoves(piece, moves);
                break;
            case 'horse': // Knight
                this.addHorseMoves(piece, moves);
                break;
            case 'elephant': // Elephant
                this.addElephantMoves(piece, moves);
                break;
            case 'advisor': // Advisor
                this.addAdvisorMoves(piece, moves);
                break;
            case 'general': // General/King
                this.addGeneralMoves(piece, moves);
                break;
            case 'cannon': // Cannon
                this.addCannonMoves(piece, moves);
                break;
            case 'soldier': // Pawn/Soldier
                this.addSoldierMoves(piece, moves);
                break;
        }

        // Filter out moves that would leave the general in check
        return moves.filter(([row, col]) => !this.wouldBeInCheckAfterMove(piece, row, col));
    }

    /**
     * Add straight line moves (for chariots/rooks)
     * @param {Piece} piece - The piece to get moves for
     * @param {Array} moves - Array to add valid moves to
     */
    addStraightLineMoves(piece, moves) {
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // Up, Down, Left, Right

        for (const [dr, dc] of directions) {
            let r = piece.row + dr;
            let c = piece.col + dc;

            while (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
                const targetPiece = this.getPiece(r, c);
                if (!targetPiece) {
                    moves.push([r, c]);
                } else {
                    if (targetPiece.color !== piece.color) {
                        moves.push([r, c]);
                    }
                    break;
                }
                r += dr;
                c += dc;
            }
        }
    }

    /**
     * Add horse moves
     * @param {Piece} piece - The piece to get moves for
     * @param {Array} moves - Array to add valid moves to
     */
    addHorseMoves(piece, moves) {
        const possibleMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];

        for (const [dr, dc] of possibleMoves) {
            const r = piece.row + dr;
            const c = piece.col + dc;

            // Check if move is within board
            if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
                // Check if the horse's leg is blocked
                const legRow = piece.row + (dr === 2 || dr === -2 ? dr / 2 : 0);
                const legCol = piece.col + (dc === 2 || dc === -2 ? dc / 2 : 0);
                
                if (this.getPiece(legRow, legCol) === null) {
                    const targetPiece = this.getPiece(r, c);
                    if (!targetPiece || targetPiece.color !== piece.color) {
                        moves.push([r, c]);
                    }
                }
            }
        }
    }

    /**
     * Add elephant moves
     * @param {Piece} piece - The piece to get moves for
     * @param {Array} moves - Array to add valid moves to
     */
    addElephantMoves(piece, moves) {
        const possibleMoves = [[-2, -2], [-2, 2], [2, -2], [2, 2]];

        for (const [dr, dc] of possibleMoves) {
            const r = piece.row + dr;
            const c = piece.col + dc;

            // Check if move is within board and within own territory
            if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
                // Elephants can't cross the river
                if ((piece.color === 'red' && r < 5) || (piece.color === 'black' && r > 4)) {
                    continue;
                }

                // Check if the elephant's eye is blocked
                const eyeRow = piece.row + dr / 2;
                const eyeCol = piece.col + dc / 2;
                
                if (this.getPiece(eyeRow, eyeCol) === null) {
                    const targetPiece = this.getPiece(r, c);
                    if (!targetPiece || targetPiece.color !== piece.color) {
                        moves.push([r, c]);
                    }
                }
            }
        }
    }

    /**
     * Add advisor moves
     * @param {Piece} piece - The piece to get moves for
     * @param {Array} moves - Array to add valid moves to
     */
    addAdvisorMoves(piece, moves) {
        const possibleMoves = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

        for (const [dr, dc] of possibleMoves) {
            const r = piece.row + dr;
            const c = piece.col + dc;

            // Check if move is within the palace
            if (this.isInsidePalace(r, c, piece.color)) {
                const targetPiece = this.getPiece(r, c);
                if (!targetPiece || targetPiece.color !== piece.color) {
                    moves.push([r, c]);
                }
            }
        }
    }

    /**
     * Add general/king moves
     * @param {Piece} piece - The piece to get moves for
     * @param {Array} moves - Array to add valid moves to
     */
    addGeneralMoves(piece, moves) {
        const possibleMoves = [[-1, 0], [1, 0], [0, -1], [0, 1]];

        for (const [dr, dc] of possibleMoves) {
            const r = piece.row + dr;
            const c = piece.col + dc;

            // Check if move is within the palace
            if (this.isInsidePalace(r, c, piece.color)) {
                const targetPiece = this.getPiece(r, c);
                if (!targetPiece || targetPiece.color !== piece.color) {
                    moves.push([r, c]);
                }
            }
        }

        // Flying general rule - check if the general can "see" the enemy general
        this.addFlyingGeneralMove(piece, moves);
    }

    /**
     * Add flying general move if applicable
     * @param {Piece} piece - The general piece
     * @param {Array} moves - Array to add valid moves to
     */
    addFlyingGeneralMove(piece, moves) {
        // Find enemy general
        let enemyGeneral = null;
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const p = this.getPiece(r, c);
                if (p && p.type === 'general' && p.color !== piece.color) {
                    enemyGeneral = p;
                    break;
                }
            }
            if (enemyGeneral) break;
        }

        if (enemyGeneral && piece.col === enemyGeneral.col) {
            // Check if there are any pieces between the two generals
            let hasPieceBetween = false;
            const startRow = Math.min(piece.row, enemyGeneral.row) + 1;
            const endRow = Math.max(piece.row, enemyGeneral.row) - 1;

            for (let r = startRow; r <= endRow; r++) {
                if (this.getPiece(r, piece.col)) {
                    hasPieceBetween = true;
                    break;
                }
            }

            if (!hasPieceBetween) {
                moves.push([enemyGeneral.row, enemyGeneral.col]);
            }
        }
    }

    /**
     * Add cannon moves
     * @param {Piece} piece - The piece to get moves for
     * @param {Array} moves - Array to add valid moves to
     */
    addCannonMoves(piece, moves) {
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // Up, Down, Left, Right

        for (const [dr, dc] of directions) {
            let r = piece.row + dr;
            let c = piece.col + dc;
            let foundPlatform = false;

            while (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
                const targetPiece = this.getPiece(r, c);

                if (!foundPlatform) {
                    if (!targetPiece) {
                        // Normal move without jumping
                        moves.push([r, c]);
                    } else {
                        // Found a platform to jump over
                        foundPlatform = true;
                    }
                } else {
                    // After finding a platform
                    if (targetPiece) {
                        if (targetPiece.color !== piece.color) {
                            // Can capture enemy piece after jumping
                            moves.push([r, c]);
                        }
                        break;
                    }
                }

                r += dr;
                c += dc;
            }
        }
    }

    /**
     * Add soldier/pawn moves
     * @param {Piece} piece - The piece to get moves for
     * @param {Array} moves - Array to add valid moves to
     */
    addSoldierMoves(piece, moves) {
        let possibleMoves = [];

        if (piece.color === 'red') {
            // Red soldiers move up and sideways if crossed river
            possibleMoves.push([-1, 0]); // Forward

            if (piece.row < 5) { // Crossed the river
                possibleMoves.push([0, -1], [0, 1]); // Left and right
            }
        } else {
            // Black soldiers move down and sideways if crossed river
            possibleMoves.push([1, 0]); // Forward

            if (piece.row > 4) { // Crossed the river
                possibleMoves.push([0, -1], [0, 1]); // Left and right
            }
        }

        for (const [dr, dc] of possibleMoves) {
            const r = piece.row + dr;
            const c = piece.col + dc;

            if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
                const targetPiece = this.getPiece(r, c);
                if (!targetPiece || targetPiece.color !== piece.color) {
                    moves.push([r, c]);
                }
            }
        }
    }

    /**
     * Check if a position is inside the palace
     * @param {number} row - The row position
     * @param {number} col - The column position
     * @param {string} color - The color of the piece
     * @returns {boolean} - True if the position is inside the palace
     */
    isInsidePalace(row, col, color) {
        if (col < 3 || col > 5) return false;

        if (color === 'red') {
            return row >= 7 && row <= 9;
        } else {
            return row >= 0 && row <= 2;
        }
    }

    /**
     * Move a piece on the board
     * @param {number} toRow - The destination row
     * @param {number} toCol - The destination column
     * @returns {boolean} - True if the move was successful
     */
    movePiece(toRow, toCol) {
        if (!this.selectedPiece) return false;

        const piece = this.selectedPiece;
        const validMoves = this.getValidMoves();
        const isValidMove = validMoves.some(([row, col]) => row === toRow && col === toCol);

        if (isValidMove) {
            const fromRow = piece.row;
            const fromCol = piece.col;
            const capturedPiece = this.grid[toRow][toCol];

            // Record move for history
            this.moveHistory.push({
                piece: piece.type,
                color: piece.color,
                from: { row: fromRow, col: fromCol },
                to: { row: toRow, col: toCol },
                captured: capturedPiece ? {
                    type: capturedPiece.type,
                    color: capturedPiece.color
                } : null
            });

            // Update the board
            this.grid[fromRow][fromCol] = null;
            this.grid[toRow][toCol] = piece;
            piece.move(toRow, toCol);

            // Switch player
            this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
            this.selectedPiece = null;

            return true;
        }

        return false;
    }

    /**
     * Check if the current player is in check
     * @returns {boolean} - True if the current player is in check
     */
    isInCheck() {
        return this.isPlayerInCheck(this.currentPlayer);
    }

    /**
     * Check if a specific player is in check
     * @param {string} player - The player color to check
     * @returns {boolean} - True if the player is in check
     */
    isPlayerInCheck(player) {
        // Find the general
        let general = null;
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const piece = this.getPiece(r, c);
                if (piece && piece.type === 'general' && piece.color === player) {
                    general = piece;
                    break;
                }
            }
            if (general) break;
        }

        if (!general) return false;

        // Check if any opponent piece can capture the general
        const opponent = player === 'red' ? 'black' : 'red';

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const piece = this.getPiece(r, c);
                if (piece && piece.color === opponent) {
                    // Save current selected piece and temporarily select opponent piece
                    const savedSelected = this.selectedPiece;
                    this.selectedPiece = piece;

                    const moves = this.getValidMoves();
                    const canCaptureGeneral = moves.some(([row, col]) => 
                        row === general.row && col === general.col
                    );

                    // Restore selected piece
                    this.selectedPiece = savedSelected;

                    if (canCaptureGeneral) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    /**
     * Check if a move would leave the player in check
     * @param {Piece} piece - The piece to move
     * @param {number} toRow - The destination row
     * @param {number} toCol - The destination column
     * @returns {boolean} - True if the move would leave the player in check
     */
    wouldBeInCheckAfterMove(piece, toRow, toCol) {
        // Save current board state
        const fromRow = piece.row;
        const fromCol = piece.col;
        const capturedPiece = this.grid[toRow][toCol];

        // Make the move temporarily
        this.grid[fromRow][fromCol] = null;
        this.grid[toRow][toCol] = piece;

        // Save original position
        const originalRow = piece.row;
        const originalCol = piece.col;

        // Update piece position
        piece.row = toRow;
        piece.col = toCol;

        // Check if player would be in check
        const wouldBeInCheck = this.isPlayerInCheck(piece.color);

        // Restore the board state
        this.grid[fromRow][fromCol] = piece;
        this.grid[toRow][toCol] = capturedPiece;

        // Restore piece position
        piece.row = originalRow;
        piece.col = originalCol;

        return wouldBeInCheck;
    }

    /**
     * Check if the current player is in checkmate
     * @returns {boolean} - True if the current player is in checkmate
     */
    isCheckmate() {
        if (!this.isInCheck()) return false;

        // Check if any move can get the player out of check
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const piece = this.getPiece(r, c);
                if (piece && piece.color === this.currentPlayer) {
                    // Save current selected piece and temporarily select this piece
                    const savedSelected = this.selectedPiece;
                    this.selectedPiece = piece;

                    const moves = this.getValidMoves();
                    
                    // Restore selected piece
                    this.selectedPiece = savedSelected;

                    if (moves.length > 0) {
                        return false; // Found a valid move, not checkmate
                    }
                }
            }
        }

        return true; // No valid moves, it's checkmate
    }

    /**
     * Check if the game is a draw
     * @returns {boolean} - True if the game is a draw
     */
    isDraw() {
        // Simple perpetual check detection (3 repetitions)
        if (this.moveHistory.length >= 10) {
            // Check last 6 moves for a 3-move repetition
            const lastMoves = this.moveHistory.slice(-6);
            if (this.isRepetition(lastMoves[0], lastMoves[2], lastMoves[4]) && 
                this.isRepetition(lastMoves[1], lastMoves[3], lastMoves[5])) {
                return true;
            }
        }

        // Stalemate check
        if (!this.isInCheck()) {
            let hasValidMove = false;
            
            for (let r = 0; r < this.rows; r++) {
                for (let c = 0; c < this.cols; c++) {
                    const piece = this.getPiece(r, c);
                    if (piece && piece.color === this.currentPlayer) {
                        const savedSelected = this.selectedPiece;
                        this.selectedPiece = piece;
                        const moves = this.getValidMoves();
                        this.selectedPiece = savedSelected;
                        
                        if (moves.length > 0) {
                            hasValidMove = true;
                            break;
                        }
                    }
                }
                if (hasValidMove) break;
            }
            
            if (!hasValidMove) return true; // Stalemate
        }

        return false;
    }

    /**
     * Check if three moves are repetitions
     * @param {Object} move1 - First move
     * @param {Object} move2 - Second move
     * @param {Object} move3 - Third move
     * @returns {boolean} - True if the moves are repetitions
     */
    isRepetition(move1, move2, move3) {
        return (
            move1.piece === move3.piece &&
            move1.color === move3.color &&
            move1.from.row === move3.to.row &&
            move1.from.col === move3.to.col &&
            move1.to.row === move3.from.row &&
            move1.to.col === move3.from.col &&
            move2.piece === move2.piece &&
            move2.color === move2.color &&
            move2.from.row === move2.to.row &&
            move2.from.col === move2.to.col &&
            move2.to.row === move2.from.row &&
            move2.to.col === move2.from.col
        );
    }

    /**
     * Get the current state of the board for the AI model
     * @returns {Object} - The board state in a format suitable for the AI
     */
    getStateForAI() {
        const pieces = [];
        
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const piece = this.getPiece(r, c);
                if (piece) {
                    pieces.push(piece.serialize());
                }
            }
        }

        return {
            pieces,
            currentPlayer: this.currentPlayer,
            moveHistory: this.moveHistory,
            isInCheck: this.isInCheck(),
            isCheckmate: this.isCheckmate()
        };
    }

    /**
     * Reset the board to the starting position
     */
    reset() {
        this.grid = Array(this.rows).fill().map(() => Array(this.cols).fill(null));
        this.selectedPiece = null;
        this.currentPlayer = 'red';
        this.moveHistory = [];
        this.setupPieces();
    }
} 