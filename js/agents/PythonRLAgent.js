import Agent from './Agent.js';

/**
 * Agent that uses a Python-based reinforcement learning model
 * Communicates with the Python API server to get move predictions
 */
export default class PythonRLAgent extends Agent {
    /**
     * Create a new Python RL agent
     * @param {Object} options - Options for the agent
     */
    constructor(options = {}) {
        super();
        this.options = {
            apiUrl: 'http://localhost:5000/api',
            trainingEnabled: false,
            ...options
        };
        
        this.experiences = [];
        this.modelStatus = 'disconnected';
        this.checkStatus();
    }
    
    /**
     * Check the status of the Python model
     */
    async checkStatus() {
        try {
            const response = await fetch(`${this.options.apiUrl}/status`);
            const data = await response.json();
            
            this.modelStatus = data.status || 'connected';
            this.modelLoaded = data.model_loaded || false;
            this.memorySize = data.memory_size || 0;
            this.explorationRate = data.exploration_rate || 0;
            
            console.log(`Python RL model status: ${this.modelStatus}`);
            console.log(`Model loaded: ${this.modelLoaded}`);
            
            return true;
        } catch (error) {
            console.error('Error connecting to Python RL model:', error);
            this.modelStatus = 'disconnected';
            return false;
        }
    }
    
    /**
     * Get the next move from the Python model
     * @param {Object} boardState - The current state of the board
     * @returns {Object|null} - The selected move or null if no move is available
     */
    async getNextMove(boardState) {
        const { board, validMoves } = boardState;
        
        if (!validMoves || validMoves.length === 0) {
            return null;
        }
        
        // If model is disconnected, fall back to random selection
        if (this.modelStatus !== 'running' && this.modelStatus !== 'connected') {
            const randomIndex = Math.floor(Math.random() * validMoves.length);
            return validMoves[randomIndex];
        }
        
        try {
            // Prepare the state for the Python model
            const state = board.getStateForAI();
            
            // Send the state and valid moves to the Python API
            const response = await fetch(`${this.options.apiUrl}/predict`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    state,
                    validMoves
                })
            });
            
            const data = await response.json();
            
            if (data.error) {
                console.error('Error from Python RL model:', data.error);
                // Fall back to random selection
                const randomIndex = Math.floor(Math.random() * validMoves.length);
                return validMoves[randomIndex];
            }
            
            // The API should return the best move
            return data.move;
        } catch (error) {
            console.error('Error getting move from Python RL model:', error);
            // Fall back to random selection
            const randomIndex = Math.floor(Math.random() * validMoves.length);
            return validMoves[randomIndex];
        }
    }
    
    /**
     * Record a training example for the RL model
     * @param {Object} boardState - The board state before the move
     * @param {Object} move - The move that was made
     * @param {number} reward - The immediate reward for the move
     */
    recordTrainingExample(boardState, move, reward) {
        if (!this.options.trainingEnabled) return;
        
        this.experiences.push({
            state: boardState.board.getStateForAI(),
            action: move,
            reward,
            nextState: null,  // Will be filled in when the next state is known
            done: false
        });
        
        // Update the next state for the previous experience
        if (this.experiences.length > 1) {
            const prevExperience = this.experiences[this.experiences.length - 2];
            prevExperience.nextState = boardState.board.getStateForAI();
        }
    }
    
    /**
     * Notify the agent of game result for learning
     * @param {string} result - The result of the game ('win', 'loss', 'draw')
     */
    async notifyGameResult(result) {
        if (!this.options.trainingEnabled || this.experiences.length === 0) return;
        
        // Calculate final reward based on game result
        let finalReward = 0;
        switch (result) {
            case 'win':
                finalReward = 1;
                break;
            case 'loss':
                finalReward = -1;
                break;
            case 'draw':
                finalReward = 0.1;
                break;
        }
        
        // Update the last experience
        const lastExperience = this.experiences[this.experiences.length - 1];
        lastExperience.reward += finalReward;
        lastExperience.done = true;
        
        // Send the experiences to the Python API for training
        try {
            const response = await fetch(`${this.options.apiUrl}/train`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    experiences: this.experiences
                })
            });
            
            const data = await response.json();
            
            if (data.error) {
                console.error('Error training Python RL model:', data.error);
            } else {
                console.log(`Training successful. Memory size: ${data.memory_size}, Exploration rate: ${data.exploration_rate}`);
                this.memorySize = data.memory_size;
                this.explorationRate = data.exploration_rate;
            }
        } catch (error) {
            console.error('Error training Python RL model:', error);
        }
        
        // Clear experiences for the next game
        this.experiences = [];
    }
    
    /**
     * Save the Python model
     */
    async saveModel() {
        try {
            const response = await fetch(`${this.options.apiUrl}/save`, {
                method: 'POST'
            });
            
            const data = await response.json();
            
            if (data.error) {
                console.error('Error saving Python RL model:', data.error);
                return false;
            } else {
                console.log('Python RL model saved successfully');
                return true;
            }
        } catch (error) {
            console.error('Error saving Python RL model:', error);
            return false;
        }
    }
    
    /**
     * Load the Python model
     */
    async loadModel() {
        try {
            const response = await fetch(`${this.options.apiUrl}/load`, {
                method: 'POST'
            });
            
            const data = await response.json();
            
            if (data.error) {
                console.error('Error loading Python RL model:', data.error);
                return false;
            } else {
                console.log('Python RL model loaded successfully');
                this.modelLoaded = data.success;
                return data.success;
            }
        } catch (error) {
            console.error('Error loading Python RL model:', error);
            return false;
        }
    }
    
    /**
     * Enable or disable training mode
     * @param {boolean} enabled - Whether training should be enabled
     */
    setTrainingMode(enabled) {
        this.options.trainingEnabled = enabled;
        console.log(`Training mode ${enabled ? 'enabled' : 'disabled'}`);
    }
} 