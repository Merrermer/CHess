/**
 * Base class for AI agents to play Chinese Chess
 * This will be extended by different implementations, including a future RL model
 */
export default class Agent {
    /**
     * Create a new agent
     */
    constructor() {}

    /**
     * Get the next move for the agent
     * @param {Object} boardState - The current state of the board
     * @returns {Object|null} - The selected move or null if no move is available
     */
    getNextMove(boardState) {
        throw new Error('Method getNextMove must be implemented by subclasses');
    }

    /**
     * Notify the agent of game result for learning
     * @param {string} result - The result of the game ('win', 'loss', 'draw')
     */
    notifyGameResult(result) {
        // Default implementation does nothing
        // RL agents will override this to update their models
    }

    /**
     * Save the agent's state/model (for learning agents)
     */
    saveModel() {
        // Default implementation does nothing
        // RL agents will override this to save their models
    }

    /**
     * Load the agent's state/model (for learning agents)
     */
    loadModel() {
        // Default implementation does nothing
        // RL agents will override this to load their models
    }
} 