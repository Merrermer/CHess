# Chinese Chess (Xiangqi) with Python RL Integration

This project implements Chinese Chess (Xiangqi) with a modular design that allows for integration with a Python-based reinforcement learning model.

## Features

- Complete implementation of Chinese Chess rules
- Pieces placed on junctions (intersections) of the board as in traditional Chinese Chess
- AI opponent with multiple options:
  - Random move selection
  - JavaScript-based RL model (placeholder)
  - Python-based RL model with API integration
- Clean, modern UI
- Move history tracking
- Customizable board visualization

## Getting Started

### Option 1: Run with Python (recommended)

1. Clone the repository
2. Make sure you have Python 3.6+ installed
3. Run `python run.py`
   - This will automatically install required Python packages
   - Start both the web server and Python API server
   - Open your browser to the game

### Option 2: Manual Setup

1. Clone the repository
2. Start the web server:
   ```
   node server.js
   ```
3. In a separate terminal, start the Python API server:
   ```
   cd python
   pip install -r requirements.txt
   python api.py
   ```
4. Open your browser to `http://localhost:3000`

## Game Rules

Chinese Chess (Xiangqi) is a two-player board game played on a 9x10 grid. The game is similar to Western Chess but with different pieces and rules.

### Pieces:

- **General/King (帥/將)**: Moves one step orthogonally and must stay in the palace
- **Advisor (仕/士)**: Moves one step diagonally and must stay in the palace
- **Elephant (相/象)**: Moves exactly two steps diagonally and cannot cross the river
- **Horse (馬)**: Moves one step orthogonally and then one step diagonally outward (similar to Knight in Western Chess)
- **Chariot (車)**: Moves any number of steps orthogonally (like Rook in Western Chess)
- **Cannon (炮/砲)**: Moves like Chariot, but must jump over exactly one piece to capture
- **Soldier (兵/卒)**: Moves one step forward before crossing the river; after crossing, can also move horizontally

## Project Structure

The project is organized with a modular structure to facilitate RL integration:

```
/
├── index.html                  # Main HTML file
├── css/
│   └── styles.css              # CSS styles
├── js/
│   ├── main.js                 # Main JavaScript entry point
│   ├── models/                 # Core game models
│   │   ├── Board.js            # Board representation and game logic
│   │   ├── Game.js             # Game controller
│   │   ├── Piece.js            # Chess piece definition
│   │   └── Renderer.js         # UI rendering
│   └── agents/                 # AI agents
│       ├── Agent.js            # Base agent class
│       ├── AgentFactory.js     # Factory for creating agents
│       ├── RandomAgent.js      # Random move agent
│       ├── RLAgent.js          # JavaScript RL agent (placeholder)
│       └── PythonRLAgent.js    # Client for Python RL model
├── python/
│   ├── api.py                  # Flask API server
│   ├── model.py                # Python RL model implementation
│   └── requirements.txt        # Python dependencies
├── server.js                   # Node.js web server
└── run.py                      # Script to run both servers
```

## Python Reinforcement Learning Integration

The architecture enables integration with a Python-based reinforcement learning model:

### Python Model

The `python/model.py` file contains a skeleton for a Deep Q-Network (DQN) implementation:

- State representation: 10x9 board with 14 channels (7 piece types × 2 colors)
- Action space: All valid moves for the current player
- Reward system: Immediate rewards for moves + final rewards for game outcomes

### API Integration

The JavaScript game communicates with the Python model via a Flask API:

- `/api/predict` - Get the best move from the model
- `/api/train` - Train the model with game data
- `/api/save` - Save the model
- `/api/load` - Load a saved model
- `/api/status` - Check the status of the model

### Training Mode

When training mode is enabled:
1. The game records each move and state
2. When the game ends, it sends the experience data to the Python model
3. The model updates its parameters using experience replay

## Implementing Your Own RL Model

To implement your own reinforcement learning model:

1. Modify the `python/model.py` file:
   - Uncomment the TensorFlow imports
   - Implement the actual model in `_build_model()`
   - Implement proper state encoding in `_encode_state()`
   - Implement actual prediction in `predict()`
   - Implement proper training in `replay()`

2. The model receives:
   - Board state (positions of all pieces)
   - Valid moves for the current player
   - Rewards for moves and game outcomes

## License

MIT