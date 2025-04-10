import RandomAgent from './RandomAgent.js';
import RLAgent from './RLAgent.js';
import PythonRLAgent from './PythonRLAgent.js';

/**
 * Factory class to create and manage different agent types
 */
export default class AgentFactory {
    /**
     * Create a new agent of the specified type
     * @param {string} type - The type of agent to create ('random', 'model', 'python')
     * @param {Object} options - Configuration options for the agent
     * @returns {Agent} - The created agent
     */
    static createAgent(type, options = {}) {
        switch (type) {
            case 'random':
                return new RandomAgent();
            case 'model':
                return new RLAgent(options);
            case 'python':
                return new PythonRLAgent(options);
            default:
                console.warn(`Unknown agent type: ${type}, defaulting to random`);
                return new RandomAgent();
        }
    }
} 