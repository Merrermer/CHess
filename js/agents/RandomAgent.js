import Agent from './Agent.js';

/**
 * Agent that makes random moves
 * Useful for testing and as a baseline for RL model training
 */
export default class RandomAgent extends Agent {
    /**
     * Get a random move from the available valid moves
     * @param {Object} boardState - The current state of the board
     * @returns {Object|null} - A randomly selected move or null if no moves available
     */
    getNextMove(boardState) {
        const { board, validMoves } = boardState;
        
        if (!validMoves || validMoves.length === 0) {
            return null;
        }
        
        // Choose a random move from the valid moves
        const randomIndex = Math.floor(Math.random() * validMoves.length);
        return validMoves[randomIndex];
    }
} 