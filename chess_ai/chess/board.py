from .piece import Color, Piece, Jiang, Shi, Xiang, Ma, Che, Pao, Bing

class Board:
    def __init__(self):
        self.rows = 10
        self.cols = 9
        self.pieces = {}  # 存储棋子位置 {(row, col): piece}
        self.initialize_board()

    def initialize_board(self):
        """初始化中国象棋的起始状态"""
        # 清空棋盘
        self.pieces = {}

        # 初始化红方棋子
        # 底线棋子 (第9行)
        self.add_piece(Che(Color.RED, (9, 0)))   # 车
        self.add_piece(Ma(Color.RED, (9, 1)))    # 马
        self.add_piece(Xiang(Color.RED, (9, 2))) # 相
        self.add_piece(Shi(Color.RED, (9, 3)))   # 仕
        self.add_piece(Jiang(Color.RED, (9, 4))) # 帅
        self.add_piece(Shi(Color.RED, (9, 5)))   # 仕
        self.add_piece(Xiang(Color.RED, (9, 6))) # 相
        self.add_piece(Ma(Color.RED, (9, 7)))    # 马
        self.add_piece(Che(Color.RED, (9, 8)))   # 车

        # 炮 (第7行)
        self.add_piece(Pao(Color.RED, (7, 1)))
        self.add_piece(Pao(Color.RED, (7, 7)))

        # 兵 (第6行)
        for col in [0, 2, 4, 6, 8]:
            self.add_piece(Bing(Color.RED, (6, col)))

        # 初始化黑方棋子
        # 底线棋子 (第0行)
        self.add_piece(Che(Color.BLACK, (0, 0)))   # 车
        self.add_piece(Ma(Color.BLACK, (0, 1)))    # 马
        self.add_piece(Xiang(Color.BLACK, (0, 2))) # 象
        self.add_piece(Shi(Color.BLACK, (0, 3)))   # 士
        self.add_piece(Jiang(Color.BLACK, (0, 4))) # 将
        self.add_piece(Shi(Color.BLACK, (0, 5)))   # 士
        self.add_piece(Xiang(Color.BLACK, (0, 6))) # 象
        self.add_piece(Ma(Color.BLACK, (0, 7)))    # 马
        self.add_piece(Che(Color.BLACK, (0, 8)))   # 车

        # 炮 (第2行)
        self.add_piece(Pao(Color.BLACK, (2, 1)))
        self.add_piece(Pao(Color.BLACK, (2, 7)))

        # 卒 (第3行)
        for col in [0, 2, 4, 6, 8]:
            self.add_piece(Bing(Color.BLACK, (3, col)))

    def add_piece(self, piece: Piece):
        """添加棋子到棋盘"""
        self.pieces[piece.position] = piece

    def remove_piece(self, position):
        """从棋盘上移除棋子"""
        if position in self.pieces:
            del self.pieces[position]

    def get_piece_at(self, position):
        """获取指定位置的棋子"""
        return self.pieces.get(position)

    def update_piece_position(self, piece, old_position):
        """更新棋子位置"""
        if old_position in self.pieces:
            del self.pieces[old_position]
        self.pieces[piece.position] = piece

    def display(self):
        """打印棋盘状态"""
        board_str = []
        
        # 添加列标签
        col_labels = "   " + "  ".join([str(i) for i in range(self.cols)])
        board_str.append(col_labels)
        
        # 添加顶部边界
        board_str.append("  " + "=" * (self.cols * 3 + 1))
        
        # 添加棋盘内容
        for row in range(self.rows):
            row_str = f"{row} |"
            for col in range(self.cols):
                piece = self.get_piece_at((row, col))
                if piece:
                    # 使用棋子符号并用不同颜色表示不同方的棋子
                    if piece.color == Color.RED:
                        row_str += f" {piece.symbol} "
                    else:
                        row_str += f" {piece.symbol.lower()} "
                else:
                    row_str += " . "
            board_str.append(row_str + "|")
        
        # 添加底部边界
        board_str.append("  " + "=" * (self.cols * 3 + 1))
        
        return "\n".join(board_str)

    def __str__(self):
        return self.display()

    def is_checkmate(self, color: Color) -> bool:
        """检查是否将军"""
        # 找到对应颜色的将/帅
        king = None
        for piece in self.pieces.values():
            if isinstance(piece, Jiang) and piece.color == color:
                king = piece
                break
        
        if not king:
            return True  # 没有将/帅，视为被将死
        
        # 检查对方所有棋子是否可以吃掉将/帅
        for piece in self.pieces.values():
            if piece.color != color:  # 对方棋子
                if king.position in piece.get_legal_moves(self):
                    return True  # 将/帅可以被吃，被将军
        
        return False

    def is_game_over(self) -> tuple[bool, Color]:
        """检查游戏是否结束，返回(是否结束, 获胜方)"""
        # 检查红方是否被将死
        if self.is_checkmate(Color.RED):
            return True, Color.BLACK
        
        # 检查黑方是否被将死
        if self.is_checkmate(Color.BLACK):
            return True, Color.RED
        
        return False, None

        
