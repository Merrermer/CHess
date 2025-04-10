import Board from './Board.js';
import AgentFactory from '../agents/AgentFactory.js';

/**
 * Class managing the game flow and integrating the board with AI agents
 */
export default class Game {
    /**
     * Create a new game
     * @param {Object} options - Game options
     */
    constructor(options = {}) {
        this.board = new Board();
        this.ai = null;
        this.aiColor = options.aiColor || 'black';
        this.autoPlay = options.autoPlay || false;
        this.onBoardUpdate = options.onBoardUpdate || (() => {});
        this.onGameEnd = options.onGameEnd || (() => {});
        this.history = [];
        this.gameOver = false;
        this.statusMessage = 'Red\'s Turn';
        
        // Initialize with a random agent by default
        this.setAIAgent('random');
    }

    /**
     * Set the AI agent type
     * @param {string} agentType - The type of agent to use
     * @param {Object} options - Additional options for the agent
     */
    setAIAgent(agentType, options = {}) {
        this.ai = AgentFactory.createAgent(agentType, options);
        console.log(`AI agent set to: ${agentType}`);
    }

    /**
     * Handle clicking on a cell
     * @param {number} row - The row of the clicked cell
     * @param {number} col - The column of the clicked cell
     * @returns {boolean} - True if the click resulted in a move
     */
    handleCellClick(row, col) {
        if (this.gameOver) return false;
        
        // If AI's turn and autoplay is enabled, don't allow player moves
        if (this.board.currentPlayer === this.aiColor && this.autoPlay) {
            return false;
        }

        const piece = this.board.getPiece(row, col);
        
        // If a piece is selected and the click is on a valid move position
        if (this.board.selectedPiece) {
            const validMoves = this.board.getValidMoves();
            const isValidMove = validMoves.some(([r, c]) => r === row && c === col);
            
            if (isValidMove) {
                // Make the move
                const moveResult = this.board.movePiece(row, col);
                
                if (moveResult) {
                    this.updateGameStatus();
                    this.onBoardUpdate();
                    
                    // AI's turn
                    if (!this.gameOver && this.board.currentPlayer === this.aiColor && this.autoPlay) {
                        setTimeout(() => this.makeAIMove(), 500);
                    }
                    
                    return true;
                }
            } else if (piece && piece.color === this.board.currentPlayer) {
                // Re-select a different piece of the same color
                this.board.selectPiece(row, col);
                this.onBoardUpdate();
                return false;
            } else {
                // Deselect the current piece
                this.board.selectedPiece = null;
                this.onBoardUpdate();
                return false;
            }
        } else if (piece && piece.color === this.board.currentPlayer) {
            // Select the piece
            this.board.selectPiece(row, col);
            this.onBoardUpdate();
            return false;
        }
        
        return false;
    }

    /**
     * Make a move with the AI
     */
    makeAIMove() {
        if (this.gameOver || !this.ai || this.board.currentPlayer !== this.aiColor) {
            return;
        }

        // Get all possible moves for the AI
        const validMoves = [];
        for (let r = 0; r < this.board.rows; r++) {
            for (let c = 0; c < this.board.cols; c++) {
                const piece = this.board.getPiece(r, c);
                if (piece && piece.color === this.board.currentPlayer) {
                    this.board.selectedPiece = piece;
                    const moves = this.board.getValidMoves();
                    
                    moves.forEach(([toRow, toCol]) => {
                        validMoves.push({
                            piece,
                            from: { row: piece.row, col: piece.col },
                            to: { row: toRow, col: toCol }
                        });
                    });
                }
            }
        }

        // Get the board state for the AI
        const boardState = {
            board: this.board,
            validMoves
        };

        // Ask the AI for the next move
        const move = this.ai.getNextMove(boardState);

        if (move) {
            // Select the piece and make the move
            this.board.selectedPiece = move.piece;
            const moveResult = this.board.movePiece(move.to.row, move.to.col);
            
            if (moveResult) {
                this.updateGameStatus();
                this.onBoardUpdate();
                
                // If the AI is training, record the move
                if (this.ai.recordTrainingExample) {
                    // Simple reward: +0.1 for a move that doesn't lose
                    this.ai.recordTrainingExample(boardState, move, 0.1);
                }
            }
        } else {
            console.error('AI couldn\'t find a valid move');
        }
    }

    /**
     * Update the game status based on the current board state
     */
    updateGameStatus() {
        const currentColor = this.board.currentPlayer;
        
        if (this.board.isCheckmate()) {
            // The player who just made the move wins
            const winner = currentColor === 'red' ? 'Black' : 'Red';
            this.statusMessage = `Checkmate! ${winner} wins`;
            this.gameOver = true;
            
            // Notify AI agent of the result
            if (this.ai.notifyGameResult) {
                const result = winner.toLowerCase() === this.aiColor ? 'win' : 'loss';
                this.ai.notifyGameResult(result);
            }
            
            this.onGameEnd(winner.toLowerCase());
        } else if (this.board.isDraw()) {
            this.statusMessage = 'Game ended in a draw';
            this.gameOver = true;
            
            // Notify AI agent of the result
            if (this.ai.notifyGameResult) {
                this.ai.notifyGameResult('draw');
            }
            
            this.onGameEnd('draw');
        } else if (this.board.isInCheck()) {
            this.statusMessage = `${currentColor.charAt(0).toUpperCase() + currentColor.slice(1)}'s turn - In Check!`;
        } else {
            this.statusMessage = `${currentColor.charAt(0).toUpperCase() + currentColor.slice(1)}'s turn`;
        }
    }

    /**
     * Reset the game to its initial state
     */
    resetGame() {
        this.board.reset();
        this.gameOver = false;
        this.statusMessage = 'Red\'s Turn';
        this.onBoardUpdate();
        
        // If AI goes first and autoplay is enabled, make a move
        if (this.board.currentPlayer === this.aiColor && this.autoPlay) {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }

    /**
     * Toggle the autoplay mode
     * @param {boolean} enabled - Whether autoplay should be enabled
     */
    setAutoPlay(enabled) {
        this.autoPlay = enabled;
        
        // If it's AI's turn and autoplay was just enabled, make a move
        if (enabled && this.board.currentPlayer === this.aiColor && !this.gameOver) {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }

    /**
     * Get the current status message
     * @returns {string} - The current status message
     */
    getStatusMessage() {
        return this.statusMessage;
    }

    /**
     * Get valid moves for a selected piece
     * @returns {Array} - Array of valid move positions
     */
    getValidMoves() {
        return this.board.getValidMoves();
    }

    /**
     * Check if the game is over
     * @returns {boolean} - True if the game is over
     */
    isGameOver() {
        return this.gameOver;
    }
} 