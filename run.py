import sys
from PyQt5.QtWidgets import QApplication
from chess_ai.chess.renderer import ChessGameWindow

def main():
    """主程序入口"""
    app = QApplication(sys.argv)
    window = ChessGameWindow()
    window.show()
    sys.exit(app.exec_())

if __name__ == "__main__":
    main() 