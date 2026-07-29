"""左侧工具栏 - 工具按钮和面板"""

from PySide6.QtCore import Qt, Signal, QSize
from PySide6.QtGui import QIcon, QColor, QAction, QFont
from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QPushButton,
    QStackedWidget, QLabel, QScrollArea, QFrame,
    QGridLayout, QFileDialog, QSizePolicy,
)

from models.design import ElementType, ShapeType, create_default_element, generate_id
from models.state import get_design_state, get_ui_state


class ToolButton(QPushButton):
    """工具按钮"""

    def __init__(self, icon_text: str, label: str, parent=None):
        super().__init__(parent)
        self._icon_text = icon_text
        self._label = label
        self.setFixedSize(48, 48)
        self.setCheckable(True)
        self.setToolTip(label)
        self.setStyleSheet("""
            QPushButton {
                border: none;
                border-radius: 8px;
                background: #F9FAFB;
                color: #6B7280;
                font-size: 10px;
                font-weight: 500;
                padding: 4px;
            }
            QPushButton:checked {
                background: #6366F1;
                color: white;
            }
            QPushButton:hover:!checked {
                background: #F3F4F6;
                color: #374151;
            }
        """)

    def paintEvent(self, event):
        super().paintEvent(event)
        from PySide6.QtGui import QPainter
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)
        color = QColor("white") if self.isChecked() else QColor("#6B7280")
        painter.setPen(color)
        font = QFont("sans-serif", 14)
        painter.setFont(font)
        painter.drawText(self.rect().adjusted(0, 2, 0, -14), Qt.AlignCenter, self._icon_text)
        font2 = QFont("sans-serif", 8)
        painter.setFont(font2)
        painter.drawText(self.rect().adjusted(0, 22, 0, -4), Qt.AlignCenter, self._label)
        painter.end()


class LeftSidebar(QWidget):
    """左侧边栏"""

    tool_changed = Signal(str)  # tool name

    def __init__(self, parent=None):
        super().__init__(parent)
        self.setFixedWidth(64)
        self._design_state = get_design_state()
        self._ui_state = get_ui_state()

        self._init_ui()
        self._connect_signals()

    def _init_ui(self):
        layout = QVBoxLayout(self)
        layout.setContentsMargins(4, 8, 4, 8)
        layout.setSpacing(2)

        # 工具按钮组
        tool_frame = QFrame()
        tool_frame.setStyleSheet("QFrame { background: #F9FAFB; border-radius: 12px; }")
        tool_layout = QVBoxLayout(tool_frame)
        tool_layout.setContentsMargins(4, 4, 4, 4)
        tool_layout.setSpacing(2)

        self._tools = [
            ("◌", "选择", "select"),
            ("T", "文本", "text"),
            ("◻", "图片", "image"),
            ("◯", "形状", "shape"),
            ("╱", "线条", "line"),
        ]

        self._tool_buttons: dict[str, ToolButton] = {}
        for icon, label, tool_id in self._tools:
            btn = ToolButton(icon, label)
            btn.clicked.connect(lambda checked, t=tool_id: self._on_tool_clicked(t))
            tool_layout.addWidget(btn)
            self._tool_buttons[tool_id] = btn

        layout.addWidget(tool_frame)

        # 分隔线
        sep = QFrame()
        sep.setFrameShape(QFrame.HLine)
        sep.setStyleSheet("QFrame { color: #E5E7EB; margin: 4px 12px; }")
        layout.addWidget(sep)

        # 面板切换按钮
        panel_frame = QFrame()
        panel_frame.setStyleSheet("QFrame { background: #F9FAFB; border-radius: 12px; }")
        panel_layout = QVBoxLayout(panel_frame)
        panel_layout.setContentsMargins(4, 4, 4, 4)
        panel_layout.setSpacing(2)

        self._panels = [
            ("◫", "模板", "templates"),
            ("◳", "素材", "assets"),
            ("☰", "页面", "pages"),
        ]

        self._panel_buttons: dict[str, ToolButton] = {}
        for icon, label, panel_id in self._panels:
            btn = ToolButton(icon, label)
            btn.clicked.connect(lambda checked, p=panel_id: self._on_panel_clicked(p))
            panel_layout.addWidget(btn)
            self._panel_buttons[panel_id] = btn

        layout.addWidget(panel_frame)
        layout.addStretch()

    def _connect_signals(self):
        self._ui_state.active_tool_changed.connect(self._on_active_tool_changed)
        self._ui_state.active_panel_changed.connect(self._on_active_panel_changed)

    def _on_tool_clicked(self, tool_id: str):
        current = self._ui_state.active_tool
        if current == tool_id:
            # 再次点击同一个工具：切回选择
            self._ui_state.active_tool = "select"
            self._ui_state.active_panel = ""
        else:
            self._ui_state.active_tool = tool_id
            # 打开对应面板
            panel_map = {"text": "text", "image": "assets", "shape": "shapes"}
            if tool_id in panel_map:
                self._ui_state.active_panel = panel_map[tool_id]
        self.tool_changed.emit(self._ui_state.active_tool)

    def _on_panel_clicked(self, panel_id: str):
        current = self._ui_state.active_panel
        self._ui_state.active_panel = "" if current == panel_id else panel_id

    def _on_active_tool_changed(self, tool: str):
        for tid, btn in self._tool_buttons.items():
            btn.setChecked(tid == tool)

    def _on_active_panel_changed(self, panel: str):
        for pid, btn in self._panel_buttons.items():
            btn.setChecked(pid == panel)