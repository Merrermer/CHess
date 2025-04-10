/**
 * Class representing a Chinese Chess piece
 */
export default class Piece {
    /**
     * Create a new piece
     * @param {string} type - The type of piece (chariot/rook, horse, elephant, advisor, general, cannon, soldier)
     * @param {string} color - The color of piece (red or black)
     * @param {number} row - The row position
     * @param {number} col - The column position
     */
    constructor(type, color, row, col) {
        this.type = type;
        this.color = color;
        this.row = row;
        this.col = col;
        this.hasMoved = false;
        this.symbol = this.getSymbol();
    }

    /**
     * Get the symbol for the piece based on type and color
     * @returns {string} - The symbol for the piece
     */
    getSymbol() {
        // Symbols for red pieces
        const redSymbols = {
            'chariot': '車',
            'horse': '馬',
            'elephant': '相',
            'advisor': '仕',
            'general': '帥',
            'cannon': '炮',
            'soldier': '兵'
        };

        // Symbols for black pieces
        const blackSymbols = {
            'chariot': '車',
            'horse': '馬',
            'elephant': '象',
            'advisor': '士',
            'general': '將',
            'cannon': '砲',
            'soldier': '卒'
        };

        return this.color === 'red' ? redSymbols[this.type] : blackSymbols[this.type];
    }

    /**
     * Move the piece to a new position
     * @param {number} row - The new row position
     * @param {number} col - The new column position
     */
    move(row, col) {
        this.row = row;
        this.col = col;
        this.hasMoved = true;
    }

    /**
     * Get a serializable representation of the piece for AI model
     * @returns {Object} - The serialized piece
     */
    serialize() {
        return {
            type: this.type,
            color: this.color,
            row: this.row,
            col: this.col
        };
    }

    /**
     * Get the piece value for evaluation functions
     * @returns {number} - The value of the piece
     */
    getValue() {
        const values = {
            'chariot': 9,
            'horse': 4,
            'elephant': 2,
            'advisor': 2,
            'general': 100,
            'cannon': 4.5,
            'soldier': 1
        };

        return values[this.type] || 0;
    }
} 