"""导出对话框"""

from PySide6.QtCore import Qt
from PySide6.QtGui import QPixmap
from PySide6.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QPushButton,
    QLabel, QComboBox, QSpinBox, QGroupBox,
    QFileDialog,
)

from models.state import get_design_state, get_ui_state


class ExportDialog(QDialog):
    """导出对话框"""

    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("导出设计")
        self.setFixedSize(400, 350)
        self.setStyleSheet("""
            QDialog {
                background: white;
                border-radius: 12px;
            }
        """)

        self._design_state = get_design_state()
        self._ui_state = get_ui_state()

        self._init_ui()

    def _init_ui(self):
        layout = QVBoxLayout(self)
        layout.setSpacing(16)
        layout.setContentsMargins(24, 24, 24, 24)

        title = QLabel("导出设计")
        title.setStyleSheet("font-size: 18px; font-weight: 700; color: #111827;")
        layout.addWidget(title)

        # 格式选择
        format_group = QGroupBox("文件格式")
        format_layout = QHBoxLayout()
        self._format_buttons = []
        formats = [("PNG", "png"), ("JPG", "jpg"), ("PDF", "pdf"), ("SVG", "svg")]
        for label, fmt in formats:
            btn = QPushButton(label)
            btn.setCheckable(True)
            btn.setFixedSize(72, 36)
            btn.clicked.connect(lambda checked, f=fmt: self._on_format_change(f))
            format_layout.addWidget(btn)
            self._format_buttons.append((btn, fmt))
        self._format_buttons[0][0].setChecked(True)
        format_group.setLayout(format_layout)
        for btn, _ in self._format_buttons:
            btn.setStyleSheet("""
                QPushButton {
                    border: 1px solid #E5E7EB;
                    border-radius: 8px;
                    font-size: 12px;
                    font-weight: 500;
                    color: #374151;
                }
                QPushButton:checked {
                    border-color: #6366F1;
                    background: #EEF2FF;
                    color: #6366F1;
                }
            """)
        layout.addWidget(format_group)

        # 缩放
        scale_group = QGroupBox("缩放比例")
        scale_layout = QHBoxLayout()
        self._scale_buttons = []
        scales = [("0.5×", 0.5), ("1×", 1), ("2×", 2), ("3×", 3)]
        for label, s in scales:
            btn = QPushButton(label)
            btn.setCheckable(True)
            btn.setFixedSize(56, 32)
            btn.clicked.connect(lambda checked, sc=s: self._on_scale_change(sc))
            scale_layout.addWidget(btn)
            self._scale_buttons.append((btn, s))
        self._scale_buttons[1][0].setChecked(True)
        scale_group.setLayout(scale_layout)
        for btn, _ in self._scale_buttons:
            btn.setStyleSheet("""
                QPushButton {
                    border: 1px solid #E5E7EB;
                    border-radius: 8px;
                    font-size: 12px;
                    font-weight: 500;
                    color: #374151;
                }
                QPushButton:checked {
                    border-color: #6366F1;
                    background: #EEF2FF;
                    color: #6366F1;
                }
            """)
        layout.addWidget(scale_group)

        # 尺寸信息
        design = self._design_state.design
        info = QLabel(f"输出尺寸: {int(design.width)} × {int(design.height)} px")
        info.setStyleSheet("color: #6B7280; font-size: 12px;")
        layout.addWidget(info)

        layout.addStretch()

        # 按钮
        btn_layout = QHBoxLayout()
        cancel_btn = QPushButton("取消")
        cancel_btn.clicked.connect(self.reject)
        export_btn = QPushButton("导出 PNG")
        export_btn.setStyleSheet("""
            QPushButton {
                background: #6366F1;
                color: white;
                border: none;
                border-radius: 8px;
                padding: 8px 20px;
                font-size: 13px;
                font-weight: 500;
            }
            QPushButton:hover {
                background: #4F46E5;
            }
        """)
        export_btn.clicked.connect(self._on_export)
        btn_layout.addWidget(cancel_btn)
        btn_layout.addStretch()
        btn_layout.addWidget(export_btn)
        layout.addLayout(btn_layout)

        self._selected_format = "png"
        self._selected_scale = 1.0

    def _on_format_change(self, fmt: str):
        self._selected_format = fmt
        for btn, f in self._format_buttons:
            btn.setChecked(f == fmt)

    def _on_scale_change(self, scale: float):
        self._selected_scale = scale
        for btn, s in self._scale_buttons:
            btn.setChecked(s == scale)

    def _on_export(self):
        file_path, _ = QFileDialog.getSaveFileName(
            self, "保存文件", "",
            f"Images (*.{self._selected_format});;All Files (*)"
        )
        if not file_path:
            return

        # 获取父窗口的 canvas 引用
        main_window = self.parent()
        if main_window and hasattr(main_window, "canvas"):
            pixmap = main_window.canvas.get_design_pixmap()
            if self._selected_scale != 1.0:
                new_w = int(pixmap.width() * self._selected_scale)
                new_h = int(pixmap.height() * self._selected_scale)
                pixmap = pixmap.scaled(new_w, new_h, Qt.KeepAspectRatio, Qt.SmoothTransformation)
            pixmap.save(file_path, self._selected_format.upper())

        self.accept()