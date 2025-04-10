import os
import json
from flask import Flask, request, jsonify
from model import ChineseChessModel
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable cross-origin requests

# Initialize the model
model = ChineseChessModel()
model_loaded = False

# Try to load a saved model if it exists
model_path = 'saved_models/model'
if os.path.exists(f"{model_path}_params.json"):
    model_loaded = model.load(model_path)

@app.route('/api/predict', methods=['POST'])
def predict():
    """
    Endpoint to get the best move from the model
    """
    try:
        data = request.json
        state = data.get('state')
        valid_moves = data.get('validMoves')
        
        if not state or not valid_moves:
            return jsonify({'error': 'Invalid input data'}), 400
        
        best_move = model.get_best_move(state, valid_moves)
        
        return jsonify({
            'move': best_move,
            'confidence': 0.75,  # Placeholder confidence value
            'model_loaded': model_loaded
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/train', methods=['POST'])
def train():
    """
    Endpoint to train the model with game data
    """
    try:
        data = request.json
        experiences = data.get('experiences')
        
        if not experiences:
            return jsonify({'error': 'No training data provided'}), 400
        
        # Add experiences to memory
        for exp in experiences:
            state = exp.get('state')
            action = exp.get('action')
            reward = exp.get('reward')
            next_state = exp.get('nextState')
            done = exp.get('done', False)
            
            model.remember(state, action, reward, next_state, done)
        
        # Train the model
        model.replay()
        
        # Update the target model occasionally
        if len(model.memory) % 100 == 0:
            model.update_target_model()
            
        # Save the model occasionally
        if len(model.memory) % 1000 == 0:
            os.makedirs('saved_models', exist_ok=True)
            model.save('saved_models/model')
        
        return jsonify({
            'success': True,
            'memory_size': len(model.memory),
            'exploration_rate': model.exploration_rate
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/save', methods=['POST'])
def save_model():
    """
    Endpoint to save the model
    """
    try:
        os.makedirs('saved_models', exist_ok=True)
        model.save('saved_models/model')
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/load', methods=['POST'])
def load_model():
    """
    Endpoint to load the model
    """
    try:
        global model_loaded
        model_loaded = model.load('saved_models/model')
        return jsonify({'success': model_loaded})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/status', methods=['GET'])
def status():
    """
    Endpoint to check the status of the model
    """
    return jsonify({
        'status': 'running',
        'model_loaded': model_loaded,
        'memory_size': len(model.memory),
        'exploration_rate': model.exploration_rate
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True) 