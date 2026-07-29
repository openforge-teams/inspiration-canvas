"""顶部 Header 栏"""

from PySide6.QtCore import Qt, Signal
from PySide6.QtGui import QFont
from PySide6.QtWidgets import (
    QWidget, QHBoxLayout, QPushButton, QLabel,
    QLineEdit, QSizePolicy,
)

from models.state import get_design_state, get_ui_state


class Header(QWidget):
    """顶部 Header"""

    def __init__(self, parent=None):
        super().__init__(parent)
        self.setFixedHeight(48)
        self._design_state = get_design_state()
        self._ui_state = get_ui_state()

        self._init_ui()
        self._connect_signals()

    def _init_ui(self):
        self.setStyleSheet("""
            QWidget {
                background: white;
                border-bottom: 1px solid #E5E7EB;
            }
        """)

        layout = QHBoxLayout(self)
        layout.setContentsMargins(12, 4, 12, 4)
        layout.setSpacing(8)

        # Logo / 标题
        logo = QLabel("灵感画布")
        logo.setStyleSheet("""
            font-size: 16px;
            font-weight: 700;
            color: #6366F1;
            border: none;
        """)
        layout.addWidget(logo)

        # 设计标题
        self._title_input = QLineEdit(self._design_state.design.title)
        self._title_input.setFixedWidth(200)
        self._title_input.setStyleSheet("""
            QLineEdit {
                border: 1px solid transparent;
                font-size: 13px;
                font-weight: 500;
                color: #374151;
                padding: 4px 8px;
                border-radius: 6px;
            }
            QLineEdit:focus {
                border-color: #6366F1;
                background: #F9FAFB;
            }
        """)
        self._title_input.editingFinished.connect(self._on_title_changed)
        layout.addWidget(self._title_input)

        layout.addStretch()

        # 撤销/重做
        self._undo_btn = QPushButton("↩")
        self._undo_btn.setFixedSize(32, 32)
        self._undo_btn.setToolTip("撤销 (Ctrl+Z)")
        self._undo_btn.setEnabled(False)
        self._undo_btn.clicked.connect(self._design_state.undo)
        layout.addWidget(self._undo_btn)

        self._redo_btn = QPushButton("↪")
        self._redo_btn.setFixedSize(32, 32)
        self._redo_btn.setToolTip("重做 (Ctrl+Shift+Z)")
        self._redo_btn.setEnabled(False)
        self._redo_btn.clicked.connect(self._design_state.redo)
        layout.addWidget(self._redo_btn)

        for btn in [self._undo_btn, self._redo_btn]:
            btn.setStyleSheet("""
                QPushButton {
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    color: #6B7280;
                }
                QPushButton:hover:!disabled {
                    background: #F3F4F6;
                    color: #374151;
                }
                QPushButton:disabled {
                    color: #D1D5DB;
                }
            """)

        # 分隔线
        sep = QLabel("|")
        sep.setStyleSheet("color: #E5E7EB; border: none;")
        layout.addWidget(sep)

        # 缩放
        self._zoom_out_btn = QPushButton("−")
        self._zoom_out_btn.setFixedSize(28, 28)
        self._zoom_out_btn.clicked.connect(self._on_zoom_out)
        layout.addWidget(self._zoom_out_btn)

        self._zoom_label = QPushButton("100%")
        self._zoom_label.setFixedSize(48, 28)
        self._zoom_label.clicked.connect(self._on_zoom_reset)
        layout.addWidget(self._zoom_label)

        self._zoom_in_btn = QPushButton("+")
        self._zoom_in_btn.setFixedSize(28, 28)
        self._zoom_in_btn.clicked.connect(self._on_zoom_in)
        layout.addWidget(self._zoom_in_btn)

        for btn in [self._zoom_out_btn, self._zoom_label, self._zoom_in_btn]:
            btn.setStyleSheet("""
                QPushButton {
                    border: 1px solid #E5E7EB;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 500;
                    color: #6B7280;
                }
                QPushButton:hover {
                    background: #F3F4F6;
                }
            """)

        layout.addStretch()

        # 导出按钮
        self._export_btn = QPushButton("导出")
        self._export_btn.setFixedWidth(60)
        self._export_btn.setStyleSheet("""
            QPushButton {
                background: #6366F1;
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 500;
                padding: 6px 12px;
            }
            QPushButton:hover {
                background: #4F46E5;
            }
        """)
        self._export_btn.clicked.connect(lambda: setattr(self._ui_state, "show_export_modal", True))
        layout.addWidget(self._export_btn)

    def _connect_signals(self):
        self._design_state.history_changed.connect(self._update_history_buttons)
        self._design_state.zoom_changed.connect(self._update_zoom_label)
        self._design_state.design_changed.connect(self._update_title)

    def _update_history_buttons(self):
        self._undo_btn.setEnabled(self._design_state.can_undo)
        self._redo_btn.setEnabled(self._design_state.can_redo)

    def _update_zoom_label(self, zoom: float):
        self._zoom_label.setText(f"{int(zoom * 100)}%")

    def _update_title(self):
        self._title_input.setText(self._design_state.design.title)

    def _on_title_changed(self):
        self._design_state.update_title(self._title_input.text())

    def _on_zoom_in(self):
        self._design_state.set_zoom(self._design_state.design.zoom * 1.2)

    def _on_zoom_out(self):
        self._design_state.set_zoom(self._design_state.design.zoom / 1.2)

    def _on_zoom_reset(self):
        self._design_state.set_zoom(1.0)