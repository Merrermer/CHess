import Game from './models/Game.js';
import Renderer from './models/Renderer.js';

/**
 * Initialize the Chinese Chess game
 */
document.addEventListener('DOMContentLoaded', () => {
    const boardElement = document.getElementById('board');
    const statusElement = document.getElementById('status');
    const resetButton = document.getElementById('reset-button');
    const aiMoveButton = document.getElementById('ai-move-button');
    const aiLevelSelect = document.getElementById('ai-level');
    const trainingModeCheckbox = document.getElementById('training-mode');
    const modelInfoElement = document.getElementById('model-info');
    
    // Create game instance
    const game = new Game({
        aiColor: 'black',
        autoPlay: true,
        onBoardUpdate: () => {
            renderer.render();
        },
        onGameEnd: (winner) => {
            console.log(`Game ended. Winner: ${winner}`);
            updateModelInfo();
        }
    });
    
    // Create renderer
    const renderer = new Renderer(boardElement, game);
    
    // Initialize the board
    renderer.initialize();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        renderer.handleResize();
    });
    
    // Reset button
    resetButton.addEventListener('click', () => {
        game.resetGame();
        updateModelInfo();
    });
    
    // AI move button
    aiMoveButton.addEventListener('click', () => {
        if (game.board.currentPlayer === game.aiColor) {
            game.makeAIMove();
            updateModelInfo();
        } else {
            statusElement.textContent = 'It\'s your turn to move!';
            setTimeout(() => {
                statusElement.textContent = game.getStatusMessage();
            }, 2000);
        }
    });
    
    // AI level selector
    aiLevelSelect.addEventListener('change', (e) => {
        const agentType = e.target.value;
        game.setAIAgent(agentType);
        updateModelInfo();
        
        // Show/hide training mode checkbox based on agent type
        if (agentType === 'python') {
            trainingModeCheckbox.parentElement.style.display = 'block';
        } else {
            trainingModeCheckbox.parentElement.style.display = 'none';
            trainingModeCheckbox.checked = false;
        }
    });
    
    // Training mode checkbox
    trainingModeCheckbox.addEventListener('change', (e) => {
        const isTraining = e.target.checked;
        
        if (game.ai && game.ai.setTrainingMode) {
            game.ai.setTrainingMode(isTraining);
            updateModelInfo();
        }
    });
    
    // Initialize training mode checkbox visibility
    trainingModeCheckbox.parentElement.style.display = 'none';
    
    // Function to update model info display
    function updateModelInfo() {
        if (game.ai && (game.ai.modelStatus || game.ai.explorationRate)) {
            const status = game.ai.modelStatus || 'unknown';
            const loaded = game.ai.modelLoaded ? 'Yes' : 'No';
            const trainingMode = game.ai.options && game.ai.options.trainingEnabled ? 'Enabled' : 'Disabled';
            const memorySize = game.ai.memorySize || 0;
            const explorationRate = game.ai.explorationRate ? game.ai.explorationRate.toFixed(4) : 'N/A';
            
            modelInfoElement.innerHTML = `
                <div>Status: ${status}</div>
                <div>Model Loaded: ${loaded}</div>
                <div>Training Mode: ${trainingMode}</div>
                <div>Memory Size: ${memorySize}</div>
                <div>Exploration Rate: ${explorationRate}</div>
            `;
        } else {
            modelInfoElement.textContent = 'Not connected to Python model';
        }
    }
    
    // Check model status periodically if using Python model
    setInterval(() => {
        if (game.ai && game.ai.checkStatus) {
            game.ai.checkStatus().then(() => {
                updateModelInfo();
            });
        }
    }, 5000);

    // Function to expose the game object for debugging or future RL integration
    window.getChessGame = () => {
        return {
            game,
            renderer
        };
    };
    
    console.log('Chinese Chess initialized! You play as Red.');
}); 