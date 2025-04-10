import numpy as np
import json
import os
from collections import deque
import random

# Optional imports - uncomment when ready to implement the model
# import tensorflow as tf
# from tensorflow.keras import Sequential
# from tensorflow.keras.layers import Dense, Conv2D, Flatten, Input

class ChineseChessModel:
    """
    Reinforcement Learning model for Chinese Chess (Xiangqi)
    Uses a Deep Q-Network (DQN) approach
    """
    
    def __init__(self, learning_rate=0.001, discount_factor=0.95, exploration_rate=1.0, 
                 exploration_decay=0.995, min_exploration_rate=0.01, batch_size=32):
        self.learning_rate = learning_rate
        self.discount_factor = discount_factor  # gamma
        self.exploration_rate = exploration_rate  # epsilon
        self.exploration_decay = exploration_decay
        self.min_exploration_rate = min_exploration_rate
        self.batch_size = batch_size
        
        # Memory for experience replay
        self.memory = deque(maxlen=10000)
        
        # Piece type mapping for state encoding
        self.piece_mapping = {
            'chariot': {'red': 1, 'black': -1},
            'horse': {'red': 2, 'black': -2},
            'elephant': {'red': 3, 'black': -3},
            'advisor': {'red': 4, 'black': -4},
            'general': {'red': 5, 'black': -5},
            'cannon': {'red': 6, 'black': -6},
            'soldier': {'red': 7, 'black': -7}
        }
        
        # Build the model
        self.model = self._build_model()
        self.target_model = self._build_model()
        self.update_target_model()
        
    def _build_model(self):
        """
        Build a CNN model for Q-value prediction
        """
        # Placeholder for the actual model implementation
        # When ready, uncomment this code and implement the actual model
        """
        model = Sequential([
            Input(shape=(10, 9, 14)),  # 10x9 board with 14 channels (7 piece types * 2 colors)
            Conv2D(64, (3, 3), activation='relu', padding='same'),
            Conv2D(128, (3, 3), activation='relu', padding='same'),
            Conv2D(128, (3, 3), activation='relu', padding='same'),
            Flatten(),
            Dense(512, activation='relu'),
            Dense(256, activation='relu'),
            Dense(1, activation='linear')  # Q-value output
        ])
        
        model.compile(loss='mse', optimizer=tf.keras.optimizers.Adam(learning_rate=self.learning_rate))
        """
        # For now, return a dummy model placeholder
        return "model_placeholder"
    
    def update_target_model(self):
        """
        Update the target model with weights from the primary model
        """
        # self.target_model.set_weights(self.model.get_weights())
        pass
    
    def _encode_state(self, state):
        """
        Encode the board state into a format suitable for the neural network
        
        Returns:
            numpy array of shape (10, 9, 14) representing the board state
        """
        # Initialize empty state tensor
        encoded_state = np.zeros((10, 9, 14))
        
        # Process each piece
        for piece in state['pieces']:
            piece_type = piece['type']
            color = piece['color']
            row = piece['row']
            col = piece['col']
            
            # Get the piece value from the mapping
            piece_value = self.piece_mapping[piece_type][color]
            
            # Set the appropriate channel
            # Red pieces use channels 0-6, black pieces use channels 7-13
            channel = abs(piece_value) - 1
            if piece_value < 0:  # black piece
                channel += 7
                
            encoded_state[row, col, channel] = 1
            
        return encoded_state
    
    def predict(self, state, move):
        """
        Predict Q-value for a specific state-action pair
        """
        # Encode the state
        encoded_state = self._encode_state(state)
        
        # For now, return a random value
        # In the real implementation, this would use the model to predict
        return random.random()
    
    def get_best_move(self, state, valid_moves):
        """
        Get the best move according to the current model
        
        Args:
            state: Dictionary containing board state
            valid_moves: List of valid moves
            
        Returns:
            The best move according to the current policy
        """
        # Exploration: choose a random move
        if random.random() < self.exploration_rate:
            return random.choice(valid_moves) if valid_moves else None
        
        # Exploitation: choose the best move
        best_move = None
        best_value = float('-inf')
        
        for move in valid_moves:
            # Predict Q-value for this move
            value = self.predict(state, move)
            
            if value > best_value:
                best_value = value
                best_move = move
        
        return best_move
    
    def remember(self, state, action, reward, next_state, done):
        """
        Store experience in memory for replay
        """
        self.memory.append((state, action, reward, next_state, done))
    
    def replay(self, batch_size=None):
        """
        Train the model on batches of experiences
        """
        if batch_size is None:
            batch_size = self.batch_size
            
        if len(self.memory) < batch_size:
            return
            
        # Sample batch from memory
        minibatch = random.sample(self.memory, batch_size)
        
        # Train the model (placeholder - would be implemented with actual model)
        """
        for state, action, reward, next_state, done in minibatch:
            encoded_state = self._encode_state(state)
            
            if done:
                target = reward
            else:
                encoded_next_state = self._encode_state(next_state)
                target = reward + self.discount_factor * np.amax(self.target_model.predict(encoded_next_state)[0])
                
            target_f = self.model.predict(encoded_state)
            target_f[0][action] = target
            
            self.model.fit(encoded_state, target_f, epochs=1, verbose=0)
        """
        
        # Decay exploration rate
        if self.exploration_rate > self.min_exploration_rate:
            self.exploration_rate *= self.exploration_decay
    
    def save(self, filepath):
        """
        Save the model to a file
        """
        # self.model.save(filepath)
        
        # Also save hyperparameters
        params = {
            'learning_rate': self.learning_rate,
            'discount_factor': self.discount_factor,
            'exploration_rate': self.exploration_rate,
            'exploration_decay': self.exploration_decay,
            'min_exploration_rate': self.min_exploration_rate,
            'batch_size': self.batch_size
        }
        
        with open(f"{filepath}_params.json", 'w') as f:
            json.dump(params, f)
            
        print(f"Model saved to {filepath}")
    
    def load(self, filepath):
        """
        Load the model from a file
        """
        # self.model = tf.keras.models.load_model(filepath)
        # self.update_target_model()
        
        # Load hyperparameters
        try:
            with open(f"{filepath}_params.json", 'r') as f:
                params = json.load(f)
                
            self.learning_rate = params['learning_rate']
            self.discount_factor = params['discount_factor']
            self.exploration_rate = params['exploration_rate']
            self.exploration_decay = params['exploration_decay']
            self.min_exploration_rate = params['min_exploration_rate']
            self.batch_size = params['batch_size']
            
            print(f"Model loaded from {filepath}")
            return True
        except:
            print(f"Failed to load model from {filepath}")
            return False 