"""灵感画布 - Python Qt 版本入口"""

import sys
import os

# 确保项目根目录在 Python 路径中
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from PySide6.QtWidgets import QApplication
from PySide6.QtCore import Qt
from PySide6.QtGui import QFont

from main_window import MainWindow


def main():
    # 高 DPI 支持
    QApplication.setHighDpiScaleFactorRoundingPolicy(
        Qt.HighDpiScaleFactorRoundingPolicy.PassThrough
    )

    app = QApplication(sys.argv)
    app.setApplicationName("灵感画布")
    app.setApplicationDisplayName("灵感画布 - Inspiration Canvas")
    app.setOrganizationName("OpenForge")

    # 设置默认字体
    font = QFont()
    font.setFamily("Noto Sans CJK SC, Microsoft YaHei, PingFang SC, sans-serif")
    font.setPixelSize(13)
    app.setFont(font)

    # 全局样式表
    app.setStyleSheet("""
        * {
            font-family: "Noto Sans CJK SC", "Microsoft YaHei", "PingFang SC", "sans-serif";
        }
        QToolTip {
            background: #1F2937;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 6px 10px;
            font-size: 12px;
        }
    """)

    window = MainWindow()
    window.show()

    sys.exit(app.exec())


if __name__ == "__main__":
    main()