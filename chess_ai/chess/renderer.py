from PyQt5.QtWidgets import QWidget, QLabel, QApplication, QMainWindow, QVBoxLayout, QHBoxLayout, QPushButton, QGridLayout
from PyQt5.QtGui import QPainter, QColor, QPen, QBrush, QFont, QPixmap, QPainterPath
from PyQt5.QtCore import Qt, QSize, QPoint, QRect, pyqtSignal, pyqtSlot

from .board import Board
from .piece import Color, Piece, Jiang, Shi, Xiang, Ma, Che, Pao, Bing

class ChessBoardRenderer(QWidget):
    """使用PyQt5渲染象棋棋盘"""
    
    piece_selected = pyqtSignal(tuple)  # 发出被选择棋子的位置信号
    piece_moved = pyqtSignal(tuple, tuple)  # 发出棋子移动的信号(from_pos, to_pos)
    
    def __init__(self, board: Board, parent=None):
        super().__init__(parent)
        self.board = board
        self.cell_size = 60  # 格子大小
        self.margin = 30     # 边距
        self.selected_pos = None  # 当前选中的位置
        self.possible_moves = []  # 当前选中棋子的可能移动位置
        
        # 设置窗口大小
        self.setMinimumSize(
            self.margin * 2 + self.cell_size * self.board.cols,
            self.margin * 2 + self.cell_size * self.board.rows
        )
        
        # 初始化UI
        self.init_ui()
        
    def init_ui(self):
        """初始化UI"""
        self.setWindowTitle('中国象棋')
        self.setStyleSheet("background-color: #f5d7a3;")  # 设置棋盘背景色
        
    def paintEvent(self, event):
        """绘制棋盘和棋子"""
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)  # 抗锯齿
        
        # 绘制棋盘
        self.draw_board(painter)
        
        # 绘制棋子
        self.draw_pieces(painter)
        
        # 绘制选中框和可能移动位置
        self.draw_selections(painter)
        
    def draw_board(self, painter):
        """绘制棋盘网格和九宫格"""
        pen = QPen(QColor("#000000"), 2)
        painter.setPen(pen)
        
        # 绘制外框
        board_width = self.cell_size * (self.board.cols-1)
        board_height = self.cell_size * (self.board.rows-1)
        board_rect = QRect(
            self.margin, 
            self.margin, 
            board_width, 
            board_height
        )
        painter.drawRect(board_rect)
        
        # 绘制横线
        for row in range(self.board.rows):
            y = self.margin + row * self.cell_size
            painter.drawLine(
                self.margin, y,
                self.margin + board_width, y
            )
        
        # 绘制竖线
        for col in range(self.board.cols):
            x = self.margin + col * self.cell_size
            painter.drawLine(
                x, self.margin,
                x, self.margin + board_height
            )
        
        # 绘制楚河汉界
        font = QFont("SimHei", 20, QFont.Bold)
        painter.setFont(font)
        painter.drawText(
            self.margin + int(1.5 * self.cell_size), 
            self.margin + 5 * self.cell_size - 10,
            "楚 河"
        )
        painter.drawText(
            self.margin + int(5.5 * self.cell_size), 
            self.margin + 5 * self.cell_size - 10,
            "汉 界"
        )
        
        # 绘制九宫格斜线
        # 红方九宫格
        painter.drawLine(
            self.margin + 3 * self.cell_size, 
            self.margin + 7 * self.cell_size,
            self.margin + 5 * self.cell_size, 
            self.margin + 9 * self.cell_size
        )
        painter.drawLine(
            self.margin + 5 * self.cell_size, 
            self.margin + 7 * self.cell_size,
            self.margin + 3 * self.cell_size, 
            self.margin + 9 * self.cell_size
        )
        
        # 黑方九宫格
        painter.drawLine(
            self.margin + 3 * self.cell_size, 
            self.margin + 0 * self.cell_size,
            self.margin + 5 * self.cell_size, 
            self.margin + 2 * self.cell_size
        )
        painter.drawLine(
            self.margin + 5 * self.cell_size, 
            self.margin + 0 * self.cell_size,
            self.margin + 3 * self.cell_size, 
            self.margin + 2 * self.cell_size
        )
        
    def draw_pieces(self, painter):
        """绘制棋子"""
        for pos, piece in self.board.pieces.items():
            self.draw_piece(painter, piece, pos)
    
    def draw_piece(self, painter, piece, position):
        """绘制单个棋子"""
        row, col = position
        x = self.margin + col * self.cell_size
        y = self.margin + row * self.cell_size
        
        # 棋子半径
        radius = int(self.cell_size * 0.4)
        
        # 设置棋子颜色
        if piece.color == Color.RED:
            bg_color = QColor("#f44336")  # 红色棋子底色
            text_color = QColor("#ffffff")  # 红色棋子文字颜色
        else:
            bg_color = QColor("#000000")  # 黑色棋子底色
            text_color = QColor("#ffffff")  # 黑色棋子文字颜色
        
        # 绘制棋子底色
        painter.setPen(Qt.NoPen)
        painter.setBrush(QBrush(bg_color))
        painter.drawEllipse(
            x - radius, 
            y - radius, 
            radius * 2, 
            radius * 2
        )
        
        # 绘制棋子边框
        painter.setPen(QPen(QColor("#000000"), 2))
        painter.setBrush(Qt.NoBrush)
        painter.drawEllipse(
            x - radius, 
            y - radius, 
            radius * 2, 
            radius * 2
        )
        
        # 绘制棋子文字
        font = QFont("楷体", 16, QFont.Bold)
        painter.setFont(font)
        painter.setPen(QPen(text_color))
        painter.drawText(
            x - radius, 
            y - radius, 
            radius * 2, 
            radius * 2, 
            Qt.AlignCenter, 
            piece.name
        )
    
    def draw_selections(self, painter):
        """绘制选中框和可能的移动位置"""
        if self.selected_pos:
            row, col = self.selected_pos
            x = self.margin + col * self.cell_size
            y = self.margin + row * self.cell_size
            
            # 绘制选中框
            pen = QPen(QColor("#ffeb3b"), 3)  # 黄色高亮选中的棋子
            painter.setPen(pen)
            
            # 选中框比棋子大一些
            radius = int(self.cell_size * 0.45)
            painter.drawRect(
                x - radius, 
                y - radius, 
                radius * 2, 
                radius * 2
            )
            
            # 绘制可能的移动位置
            for move_pos in self.possible_moves:
                move_row, move_col = move_pos
                move_x = self.margin + move_col * self.cell_size
                move_y = self.margin + move_row * self.cell_size
                
                # 使用半透明的圆形标记可能移动位置
                painter.setPen(Qt.NoPen)
                painter.setBrush(QBrush(QColor(0, 255, 0, 80)))  # 半透明绿色
                painter.drawEllipse(
                    move_x - radius // 2, 
                    move_y - radius // 2, 
                    radius, 
                    radius
                )
    
    def mousePressEvent(self, event):
        """处理鼠标点击事件"""
        # 将鼠标坐标转换为棋盘坐标
        x, y = event.x(), event.y()
        col = round((x - self.margin) / self.cell_size)
        row = round((y - self.margin) / self.cell_size)
        
        # 确保坐标在棋盘范围内
        if 0 <= row < self.board.rows and 0 <= col < self.board.cols:
            clicked_pos = (row, col)
            clicked_piece = self.board.get_piece_at(clicked_pos)
            
            # 如果有选中的棋子，且点击了可移动位置
            if self.selected_pos and clicked_pos in self.possible_moves:
                # 发出棋子移动信号
                self.piece_moved.emit(self.selected_pos, clicked_pos)
                
                # 移动棋子
                selected_piece = self.board.get_piece_at(self.selected_pos)
                if selected_piece:
                    selected_piece.move(self.board, clicked_pos)
                
                # 重置选中状态
                self.selected_pos = None
                self.possible_moves = []
                
            # 选中新棋子
            elif clicked_piece:
                # 发出棋子选中信号，让游戏窗口可以验证该棋子是否属于当前玩家
                self.piece_selected.emit(clicked_pos)
                
                # 先设置选中状态，如果游戏窗口判定无效，会清除这些状态
                self.selected_pos = clicked_pos
                self.possible_moves = clicked_piece.get_legal_moves(self.board)
            else:
                # 点击空位，取消选中
                self.selected_pos = None
                self.possible_moves = []
            
            # 更新界面
            self.update()


class ChessGameWindow(QMainWindow):
    """中国象棋游戏窗口"""
    
    def __init__(self):
        super().__init__()
        self.board = Board()
        self.current_player = Color.RED  # 红方先走
        
        self.init_ui()
        
    def init_ui(self):
        """初始化UI"""
        self.setWindowTitle('中国象棋')
        
        # 主窗口布局
        central_widget = QWidget()
        main_layout = QVBoxLayout(central_widget)
        
        # 游戏信息布局
        info_layout = QHBoxLayout()
        self.player_label = QLabel(f"当前玩家: {self.current_player.value}")
        self.player_label.setStyleSheet("font-size: 16px; font-weight: bold;")
        info_layout.addWidget(self.player_label)
        
        # 添加重新开始按钮
        restart_button = QPushButton("重新开始")
        restart_button.clicked.connect(self.restart_game)
        info_layout.addWidget(restart_button)
        
        # 添加棋盘渲染器
        self.renderer = ChessBoardRenderer(self.board)
        self.renderer.piece_selected.connect(self.on_piece_selected)
        self.renderer.piece_moved.connect(self.on_piece_moved)
        
        # 设置布局
        main_layout.addLayout(info_layout)
        main_layout.addWidget(self.renderer)
        
        self.setCentralWidget(central_widget)
        
        # 调整窗口大小
        self.resize(600, 650)
        
    def on_piece_selected(self, position):
        """处理棋子选择事件，确保只能选择当前玩家的棋子"""
        piece = self.board.get_piece_at(position)
        if piece and piece.color != self.current_player:
            # 如果选择的不是当前玩家的棋子，清除选择
            self.renderer.selected_pos = None
            self.renderer.possible_moves = []
            self.renderer.update()
            
    def on_piece_moved(self, from_pos, to_pos):
        """处理棋子移动事件"""
        piece = self.board.get_piece_at(from_pos)
        
        # 确保只有当前玩家的棋子可以移动
        if piece and piece.color == self.current_player:
            # 切换玩家
            self.current_player = Color.BLACK if self.current_player == Color.RED else Color.RED
            self.player_label.setText(f"当前玩家: {self.current_player.value}")
            
            # 检查游戏是否结束
            game_over, winner = self.board.is_game_over()
            if game_over:
                self.player_label.setText(f"游戏结束! {winner.value}方获胜!")
        
    def restart_game(self):
        """重新开始游戏"""
        self.board.initialize_board()
        self.current_player = Color.RED
        self.player_label.setText(f"当前玩家: {self.current_player.value}")
        self.renderer.selected_pos = None
        self.renderer.possible_moves = []
        self.renderer.update()

