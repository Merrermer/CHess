from abc import abstractmethod
from enum import Enum
import copy

class Color(Enum):
    RED = "红"
    BLACK = "黑"

class Piece:
    """象棋棋子基类"""
    
    def __init__(self, color: Color, position: tuple[int, int]):
        """
        初始化棋子
        
        参数:
            color: 棋子颜色 (Color.RED 或 Color.BLACK)
            position: 棋子位置，格式为 (row, col)，如 (0, 0) 表示左上角
        """
        self.color: Color = color
        self.position: tuple[int, int] = position
        self.name: str = ""  # 子类需要重写这个属性
        self.symbol: str = ""  # 子类需要重写这个属性
    
    def __str__(self):
        """返回棋子的字符表示"""
        return f"{self.color.value}{self.name}"
    
    @abstractmethod
    def get_legal_moves(self, board) -> list[tuple[int, int]]:
        pass

    def is_valid_move(self, board, target_position: tuple[int, int]):
        """
        判断移动到目标位置是否合法
        
        参数:
            board: 棋盘对象
            target_position: 目标位置 (row, col)
            
        返回:
            布尔值，表示移动是否合法
        """
        return target_position in self.get_legal_moves(board)
    
    def move(self, board, target_position):
        """
        移动棋子到目标位置
        
        参数:
            board: 棋盘对象
            target_position: 目标位置 (row, col)
            
        返回:
            移动是否成功
        """
        if self.is_valid_move(board, target_position):
            old_position = copy.copy(self.position)
            self.position = target_position
            board.update_piece_position(self, old_position)
            return True
        return False
    
    def is_in_board(self, position, board):
        """判断位置是否在棋盘内"""
        row, col = position
        return 0 <= row < board.rows and 0 <= col < board.cols
    
    def is_same_color(self, other_piece):
        """判断两个棋子是否同色"""
        if other_piece is None:
            return False
        return self.color == other_piece.color


class Jiang(Piece):
    """将/帅"""
    
    def __init__(self, color, position):
        super().__init__(color, position)
        self.name = "帅" if color == Color.RED else "将"
        self.symbol = "J"
    
    def get_legal_moves(self, board):
        moves = []
        row, col = self.position
        # 将/帅只能在九宫格内移动
        directions = [(0, 1), (1, 0), (0, -1), (-1, 0)]  # 上下左右
        
        for dr, dc in directions:
            new_row, new_col = row + dr, col + dc
            new_pos = (new_row, new_col)
            
            # 检查是否在九宫格内
            if self.is_in_palace(new_pos):
                if board.get_piece_at(new_pos) is None or not self.is_same_color(board.get_piece_at(new_pos)):
                    moves.append(new_pos)
        
        return moves
    
    def is_in_palace(self, position):
        """判断位置是否在九宫格内"""
        row, col = position
        if self.color == Color.RED:
            return 7 <= row <= 9 and 3 <= col <= 5
        else:  # BLACK
            return 0 <= row <= 2 and 3 <= col <= 5


class Shi(Piece):
    """士/仕"""
    
    def __init__(self, color, position):
        super().__init__(color, position)
        self.name = "仕" if color == Color.RED else "士"
        self.symbol = "S"
    
    def get_legal_moves(self, board):
        moves = []
        row, col = self.position
        # 士/仕只能在九宫格内斜着移动
        directions = [(1, 1), (1, -1), (-1, 1), (-1, -1)]  # 斜向
        
        for dr, dc in directions:
            new_row, new_col = row + dr, col + dc
            new_pos = (new_row, new_col)
            
            # 检查是否在九宫格内
            if self.is_in_palace(new_pos):
                if board.get_piece_at(new_pos) is None or not self.is_same_color(board.get_piece_at(new_pos)):
                    moves.append(new_pos)
        
        return moves
    
    def is_in_palace(self, position):
        """判断位置是否在九宫格内"""
        row, col = position
        if self.color == Color.RED:
            return 7 <= row <= 9 and 3 <= col <= 5
        else:  # BLACK
            return 0 <= row <= 2 and 3 <= col <= 5


class Xiang(Piece):
    """相/象"""
    
    def __init__(self, color, position):
        super().__init__(color, position)
        self.name = "相" if color == Color.RED else "象"
        self.symbol = "X"
    
    def get_legal_moves(self, board):
        moves = []
        row, col = self.position
        # 相/象走田字，且不能过河
        directions = [(2, 2), (2, -2), (-2, 2), (-2, -2)]
        
        for dr, dc in directions:
            new_row, new_col = row + dr, col + dc
            new_pos = (new_row, new_col)
            
            # 检查是否在己方区域且没有被塞象眼
            if self.is_in_own_territory(new_pos) and not self.is_blocked_diagonal(board, new_pos):
                if board.get_piece_at(new_pos) is None or not self.is_same_color(board.get_piece_at(new_pos)):
                    moves.append(new_pos)
        
        return moves
    
    def is_in_own_territory(self, position):
        """判断位置是否在己方区域（不过河）"""
        row, col = position
        if not (0 <= row <= 9 and 0 <= col <= 8):
            return False
            
        if self.color == Color.RED:
            return row >= 5  # 红方在下半部分
        else:  # BLACK
            return row <= 4  # 黑方在上半部分
    
    def is_blocked_diagonal(self, board, target_position):
        """判断象眼是否被塞住"""
        current_row, current_col = self.position
        target_row, target_col = target_position
        
        # 计算象眼位置
        eye_row = (current_row + target_row) // 2
        eye_col = (current_col + target_col) // 2
        
        # 检查象眼是否有棋子
        return board.get_piece_at((eye_row, eye_col)) is not None


# 更多棋子类可以继续添加...
class Ma(Piece):
    """马"""
    
    def __init__(self, color, position):
        super().__init__(color, position)
        self.name = "马"
        self.symbol = "M"
    
    def get_legal_moves(self, board):
        moves = []
        row, col = self.position
        # 马走日，8个方向
        potential_moves = [
            (row+2, col+1), (row+2, col-1),
            (row-2, col+1), (row-2, col-1),
            (row+1, col+2), (row-1, col+2),
            (row+1, col-2), (row-1, col-2)
        ]
        
        for new_pos in potential_moves:
            new_row, new_col = new_pos
            
            # 检查是否在棋盘内且没有被蹩马腿
            if self.is_in_board(new_pos, board) and not self.is_blocked(board, new_pos):
                if board.get_piece_at(new_pos) is None or not self.is_same_color(board.get_piece_at(new_pos)):
                    moves.append(new_pos)
        
        return moves
    
    def is_blocked(self, board, target_position):
        """判断马腿是否被蹩住"""
        current_row, current_col = self.position
        target_row, target_col = target_position
        
        # 计算马腿位置
        if abs(target_row - current_row) == 2:  # 竖着走
            leg_row = (current_row + target_row) // 2
            leg_col = current_col
        else:  # 横着走
            leg_row = current_row
            leg_col = (current_col + target_col) // 2
        
        # 检查马腿是否有棋子
        return board.get_piece_at((leg_row, leg_col)) is not None


class Che(Piece):
    """车"""
    
    def __init__(self, color, position):
        super().__init__(color, position)
        self.name = "车"
        self.symbol = "C"
    
    def get_legal_moves(self, board):
        moves = []
        row, col = self.position
        
        # 横向移动
        for new_col in range(col+1, board.cols):
            new_pos = (row, new_col)
            piece_at_pos = board.get_piece_at(new_pos)
            if piece_at_pos is None:
                moves.append(new_pos)
            else:
                if not self.is_same_color(piece_at_pos):
                    moves.append(new_pos)
                break
                
        for new_col in range(col-1, -1, -1):
            new_pos = (row, new_col)
            piece_at_pos = board.get_piece_at(new_pos)
            if piece_at_pos is None:
                moves.append(new_pos)
            else:
                if not self.is_same_color(piece_at_pos):
                    moves.append(new_pos)
                break
        
        # 纵向移动
        for new_row in range(row+1, board.rows):
            new_pos = (new_row, col)
            piece_at_pos = board.get_piece_at(new_pos)
            if piece_at_pos is None:
                moves.append(new_pos)
            else:
                if not self.is_same_color(piece_at_pos):
                    moves.append(new_pos)
                break
                
        for new_row in range(row-1, -1, -1):
            new_pos = (new_row, col)
            piece_at_pos = board.get_piece_at(new_pos)
            if piece_at_pos is None:
                moves.append(new_pos)
            else:
                if not self.is_same_color(piece_at_pos):
                    moves.append(new_pos)
                break
        
        return moves


class Pao(Piece):
    """炮"""
    
    def __init__(self, color, position):
        super().__init__(color, position)
        self.name = "炮"
        self.symbol = "P"
    
    def get_legal_moves(self, board):
        moves = []
        row, col = self.position
        
        # 横向移动
        for direction in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
            dr, dc = direction
            has_platform = False  # 是否已经翻过一个台
            
            for i in range(1, max(board.rows, board.cols)):
                new_row, new_col = row + dr * i, col + dc * i
                new_pos = (new_row, new_col)
                
                if not self.is_in_board(new_pos, board):
                    break
                    
                piece_at_pos = board.get_piece_at(new_pos)
                
                if not has_platform:  # 还没有翻过台
                    if piece_at_pos is None:
                        moves.append(new_pos)
                    else:
                        has_platform = True
                else:  # 已经翻过台
                    if piece_at_pos is not None:
                        if not self.is_same_color(piece_at_pos):
                            moves.append(new_pos)
                        break
        
        return moves


class Bing(Piece):
    """兵/卒"""
    
    def __init__(self, color, position):
        super().__init__(color, position)
        self.name = "兵" if color == Color.RED else "卒"
        self.symbol = "B"
    
    def get_legal_moves(self, board):
        moves = []
        row, col = self.position
        
        if self.color == Color.RED:
            # 红方兵
            directions = [(-1, 0)]  # 向上
            if row <= 4:  # 过河后可以左右移动
                directions.extend([(0, 1), (0, -1)])
        else:
            # 黑方卒
            directions = [(1, 0)]  # 向下
            if row >= 5:  # 过河后可以左右移动
                directions.extend([(0, 1), (0, -1)])
        
        for dr, dc in directions:
            new_row, new_col = row + dr, col + dc
            new_pos = (new_row, new_col)
            
            if self.is_in_board(new_pos, board):
                piece_at_pos = board.get_piece_at(new_pos)
                if piece_at_pos is None or not self.is_same_color(piece_at_pos):
                    moves.append(new_pos)
        
        return moves
