"""主窗口 - 整合所有组件"""

from PySide6.QtCore import Qt, Signal, QTimer
from PySide6.QtGui import QAction, QKeySequence
from PySide6.QtWidgets import (
    QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QSplitter, QFrame, QApplication,
)

from models.design import ElementType, ShapeType, create_default_element, generate_id
from models.state import get_design_state, get_ui_state

from widgets.header import Header
from widgets.left_sidebar import LeftSidebar
from widgets.canvas import DesignCanvas
from widgets.right_panel import RightPanel
from widgets.export_dialog import ExportDialog


# ─── 工具面板内容 ───

class TextPanel(QWidget):
    """文本预设面板"""

    def __init__(self, parent=None):
        super().__init__(parent)
        self._design_state = get_design_state()
        self._ui_state = get_ui_state()
        self._init_ui()

    def _init_ui(self):
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        # 标题
        from PySide6.QtWidgets import QLabel
        header = QLabel("文本预设")
        header.setStyleSheet("""
            QLabel {
                font-size: 13px;
                font-weight: 600;
                color: #374151;
                padding: 12px 16px;
                border-bottom: 1px solid #F3F4F6;
                background: white;
            }
        """)
        layout.addWidget(header)

        # 预设列表
        from PySide6.QtWidgets import QScrollArea, QPushButton
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setStyleSheet("QScrollArea { border: none; background: white; }")

        content = QWidget()
        content_layout = QVBoxLayout(content)
        content_layout.setContentsMargins(12, 8, 12, 8)
        content_layout.setSpacing(6)

        presets = [
            ("大标题", "大标题", 48, 700),
            ("标题", "标题", 36, 600),
            ("副标题", "副标题", 28, 500),
            ("正文", "正文内容", 18, 400),
            ("小字", "小字说明", 14, 400),
        ]

        for name, text, size, weight in presets:
            btn = QPushButton()
            btn.setStyleSheet("""
                QPushButton {
                    border: 1px solid #E5E7EB;
                    border-radius: 8px;
                    padding: 12px 16px;
                    text-align: left;
                    background: white;
                }
                QPushButton:hover {
                    border-color: #6366F1;
                    background: #EEF2FF;
                }
            """)
            # 使用 QVBoxLayout 在按钮内显示文本和描述
            btn_layout = QVBoxLayout(btn)
            btn_layout.setContentsMargins(0, 0, 0, 0)
            btn_layout.setSpacing(2)

            text_label = QLabel(text)
            text_label.setStyleSheet(f"""
                font-size: {min(size, 24)}px;
                font-weight: {weight};
                color: #111827;
                border: none;
                background: transparent;
            """)
            btn_layout.addWidget(text_label)

            desc_label = QLabel(f"{size}px · {'粗体' if weight==700 else '半粗' if weight==600 else '中等' if weight==500 else '常规'}")
            desc_label.setStyleSheet("font-size: 11px; color: #9CA3AF; border: none; background: transparent;")
            btn_layout.addWidget(desc_label)

            btn.clicked.connect(lambda checked, n=name, t=text, s=size, w=weight: self._add_text(n, t, s, w))
            content_layout.addWidget(btn)

        content_layout.addStretch()
        scroll.setWidget(content)
        layout.addWidget(scroll)

    def _add_text(self, name: str, text: str, size: int, weight: int):
        design = self._design_state.design
        el_width = size * len(text) * 0.6
        el_height = size * 1.4
        offset = len(design.elements) * 25
        x = design.width / 2 - el_width / 2 + offset
        y = design.height / 2 - el_height / 2 + offset

        element = create_default_element(ElementType.TEXT, x, y)
        element.props.fontSize = size
        element.props.fontWeight = weight
        element.props.text = text
        element.props.width = el_width
        element.props.height = el_height
        element.name = name
        self._design_state.add_element(element)
        self._ui_state.active_tool = "select"
        self._ui_state.active_panel = ""


class ShapePanel(QWidget):
    """形状预设面板"""

    def __init__(self, parent=None):
        super().__init__(parent)
        self._design_state = get_design_state()
        self._ui_state = get_ui_state()
        self._init_ui()

    def _init_ui(self):
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        from PySide6.QtWidgets import QLabel, QScrollArea, QPushButton, QGridLayout

        header = QLabel("形状库")
        header.setStyleSheet("""
            QLabel {
                font-size: 13px;
                font-weight: 600;
                color: #374151;
                padding: 12px 16px;
                border-bottom: 1px solid #F3F4F6;
                background: white;
            }
        """)
        layout.addWidget(header)

        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setStyleSheet("QScrollArea { border: none; background: white; }")

        content = QWidget()
        content_layout = QVBoxLayout(content)
        content_layout.setContentsMargins(12, 8, 12, 8)

        grid = QGridLayout()
        grid.setSpacing(8)

        shapes = [
            ("矩形", ShapeType.RECT, "▬"),
            ("圆形", ShapeType.CIRCLE, "●"),
            ("三角形", ShapeType.TRIANGLE, "▲"),
            ("星形", ShapeType.STAR, "★"),
            ("箭头", ShapeType.ARROW, "➤"),
        ]

        for i, (name, shape_type, icon) in enumerate(shapes):
            btn = QPushButton()
            btn.setFixedSize(100, 80)
            btn.setStyleSheet("""
                QPushButton {
                    border: 1px solid #E5E7EB;
                    border-radius: 8px;
                    background: white;
                }
                QPushButton:hover {
                    border-color: #6366F1;
                    background: #EEF2FF;
                }
            """)
            btn_layout = QVBoxLayout(btn)
            btn_layout.setContentsMargins(0, 0, 0, 0)
            btn_layout.setSpacing(4)
            btn_layout.setAlignment(Qt.AlignCenter)

            icon_label = QLabel(icon)
            icon_label.setStyleSheet("font-size: 24px; color: #6B7280; border: none; background: transparent;")
            icon_label.setAlignment(Qt.AlignCenter)
            btn_layout.addWidget(icon_label)

            name_label = QLabel(name)
            name_label.setStyleSheet("font-size: 11px; font-weight: 500; color: #6B7280; border: none; background: transparent;")
            name_label.setAlignment(Qt.AlignCenter)
            btn_layout.addWidget(name_label)

            btn.clicked.connect(lambda checked, n=name, st=shape_type: self._add_shape(n, st))
            grid.addWidget(btn, i // 2, i % 2)

        content_layout.addLayout(grid)
        content_layout.addStretch()
        scroll.setWidget(content)
        layout.addWidget(scroll)

    def _add_shape(self, name: str, shape_type: ShapeType):
        design = self._design_state.design
        offset = len(design.elements) * 25
        x = design.width / 2 - 75 + offset
        y = design.height / 2 - 75 + offset

        element = create_default_element(ElementType.SHAPE, x, y)
        element.props.shapeType = shape_type
        element.name = name
        self._design_state.add_element(element)
        self._ui_state.active_tool = "select"
        self._ui_state.active_panel = ""


class AssetPanel(QWidget):
    """素材库面板"""

    def __init__(self, parent=None):
        super().__init__(parent)
        self._design_state = get_design_state()
        self._ui_state = get_ui_state()
        self._assets = [
            ("asset-001", "山脉风景", "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200"),
            ("asset-002", "城市夜景", "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=200"),
            ("asset-003", "海洋日落", "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200"),
            ("asset-004", "森林小径", "https://images.unsplash.com/photo-1448375240586-882707db888b?w=200"),
        ]
        self._init_ui()

    def _init_ui(self):
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        from PySide6.QtWidgets import QLabel, QScrollArea, QPushButton, QGridLayout, QFileDialog

        header = QLabel("素材库")
        header.setStyleSheet("""
            QLabel {
                font-size: 13px;
                font-weight: 600;
                color: #374151;
                padding: 12px 16px;
                border-bottom: 1px solid #F3F4F6;
                background: white;
            }
        """)
        layout.addWidget(header)

        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setStyleSheet("QScrollArea { border: none; background: white; }")

        content = QWidget()
        content_layout = QVBoxLayout(content)
        content_layout.setContentsMargins(12, 8, 12, 8)

        grid = QGridLayout()
        grid.setSpacing(8)

        for i, (aid, name, url) in enumerate(self._assets):
            card = QFrame()
            card.setStyleSheet("""
                QFrame {
                    border: 1px solid #E5E7EB;
                    border-radius: 8px;
                    background: white;
                }
                QFrame:hover {
                    border-color: #6366F1;
                }
            """)
            card.setCursor(Qt.PointingHandCursor)

            card_layout = QVBoxLayout(card)
            card_layout.setContentsMargins(0, 0, 0, 0)
            card_layout.setSpacing(0)

            # 图片缩略图
            from PySide6.QtGui import QPixmap
            from PySide6.QtNetwork import QNetworkAccessManager, QNetworkRequest
            from PySide6.QtCore import QUrl

            img_label = QLabel()
            img_label.setFixedSize(120, 68)
            img_label.setAlignment(Qt.AlignCenter)
            img_label.setStyleSheet("background: #F3F4F6; border: none; border-radius: 7px 7px 0 0;")

            # 使用网络请求加载图片
            self._load_network_image(url, img_label)

            card_layout.addWidget(img_label, 0, Qt.AlignCenter)

            name_label = QLabel(name)
            name_label.setStyleSheet("font-size: 11px; font-weight: 500; color: #374151; padding: 6px 8px; border: none; background: transparent;")
            card_layout.addWidget(name_label)

            card.mousePressEvent = lambda e, n=name, u=url: self._add_image(n, u)
            img_label.mousePressEvent = lambda e, n=name, u=url: self._add_image(n, u)
            name_label.mousePressEvent = lambda e, n=name, u=url: self._add_image(n, u)

            grid.addWidget(card, i // 2, i % 2)

        content_layout.addLayout(grid)

        # 上传按钮
        upload_btn = QPushButton("+ 上传本地图片")
        upload_btn.setStyleSheet("""
            QPushButton {
                border: 1px dashed #D1D5DB;
                border-radius: 8px;
                padding: 10px;
                font-size: 13px;
                font-weight: 500;
                color: #6366F1;
                background: #F9FAFB;
                margin-top: 8px;
            }
            QPushButton:hover {
                background: #EEF2FF;
                border-color: #6366F1;
            }
        """)
        upload_btn.clicked.connect(self._upload_image)
        content_layout.addWidget(upload_btn)

        content_layout.addStretch()
        scroll.setWidget(content)
        layout.addWidget(scroll)

    def _load_network_image(self, url: str, label: "QLabel"):
        """加载网络图片"""
        from PySide6.QtNetwork import QNetworkAccessManager, QNetworkRequest
        from PySide6.QtCore import QUrl

        manager = QNetworkAccessManager()
        manager.finished.connect(lambda reply, lbl=label: self._on_image_loaded(reply, lbl))
        manager.get(QNetworkRequest(QUrl(url)))

    def _on_image_loaded(self, reply, label: "QLabel"):
        """图片加载完成"""
        from PySide6.QtGui import QPixmap
        data = reply.readAll()
        pixmap = QPixmap()
        pixmap.loadFromData(data)
        if not pixmap.isNull():
            scaled = pixmap.scaled(120, 68, Qt.KeepAspectRatio, Qt.SmoothTransformation)
            label.setPixmap(scaled)
        reply.deleteLater()

    def _add_image(self, name: str, url: str):
        design = self._design_state.design
        offset = len(design.elements) * 25
        x = design.width / 2 - 150 + offset
        y = design.height / 2 - 100 + offset

        element = create_default_element(ElementType.IMAGE, x, y)
        element.props.src = url.replace("w=200", "w=800")
        element.name = name
        self._design_state.add_element(element)
        self._ui_state.active_tool = "select"
        self._ui_state.active_panel = ""

    def _upload_image(self):
        from PySide6.QtWidgets import QFileDialog
        file_path, _ = QFileDialog.getOpenFileName(
            self, "选择图片", "",
            "Images (*.png *.jpg *.jpeg *.gif *.webp);;All Files (*)"
        )
        if not file_path:
            return

        import base64
        with open(file_path, "rb") as f:
            img_data = base64.b64encode(f.read()).decode()
            ext = file_path.rsplit(".", 1)[-1].lower()
            mime = f"image/{ext}" if ext in ["png", "jpg", "jpeg", "gif", "webp"] else "image/png"
            src = f"data:{mime};base64,{img_data}"

        design = self._design_state.design
        offset = len(design.elements) * 25
        x = design.width / 2 - 150 + offset
        y = design.height / 2 - 100 + offset

        element = create_default_element(ElementType.IMAGE, x, y)
        element.props.src = src
        element.name = file_path.rsplit("/", 1)[-1]
        self._design_state.add_element(element)
        self._ui_state.active_tool = "select"
        self._ui_state.active_panel = ""


class TemplatePanel(QWidget):
    """模板面板（占位）"""

    def __init__(self, parent=None):
        super().__init__(parent)
        layout = QVBoxLayout(self)
        from PySide6.QtWidgets import QLabel, QPushButton

        header = QLabel("模板")
        header.setStyleSheet("""
            QLabel {
                font-size: 13px;
                font-weight: 600;
                color: #374151;
                padding: 12px 16px;
                border-bottom: 1px solid #F3F4F6;
                background: white;
            }
        """)
        layout.addWidget(header)

        placeholder = QLabel("模板功能开发中...")
        placeholder.setStyleSheet("color: #9CA3AF; font-size: 12px; padding: 20px;")
        placeholder.setAlignment(Qt.AlignCenter)
        layout.addWidget(placeholder)
        layout.addStretch()


class PagePanel(QWidget):
    """页面面板（占位）"""

    def __init__(self, parent=None):
        super().__init__(parent)
        layout = QVBoxLayout(self)
        from PySide6.QtWidgets import QLabel, QPushButton

        header = QLabel("页面")
        header.setStyleSheet("""
            QLabel {
                font-size: 13px;
                font-weight: 600;
                color: #374151;
                padding: 12px 16px;
                border-bottom: 1px solid #F3F4F6;
                background: white;
            }
        """)
        layout.addWidget(header)

        placeholder = QLabel("暂无页面\n创建新页面以管理多页设计")
        placeholder.setStyleSheet("color: #9CA3AF; font-size: 12px; padding: 20px;")
        placeholder.setAlignment(Qt.AlignCenter)
        layout.addWidget(placeholder)

        btn = QPushButton("+ 新建页面")
        btn.setStyleSheet("""
            QPushButton {
                border: 1px solid #E5E7EB;
                border-radius: 8px;
                padding: 8px;
                font-size: 13px;
                font-weight: 500;
                color: #6366F1;
                background: #F9FAFB;
                margin: 12px;
            }
            QPushButton:hover {
                background: #EEF2FF;
                border-color: #6366F1;
            }
        """)
        layout.addWidget(btn)
        layout.addStretch()


# ─── 主窗口 ───

class MainWindow(QMainWindow):
    """灵感画布主窗口"""

    def __init__(self):
        super().__init__()
        self.setWindowTitle("灵感画布 - Inspiration Canvas")
        self.setMinimumSize(1200, 800)
        self.resize(1440, 900)

        self._design_state = get_design_state()
        self._ui_state = get_ui_state()

        self._init_ui()
        self._connect_signals()
        self._setup_menu()

    def _init_ui(self):
        # 设置全局样式
        self.setStyleSheet("""
            QMainWindow {
                background: #F3F4F6;
            }
        """)

        central = QWidget()
        self.setCentralWidget(central)

        main_layout = QVBoxLayout(central)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)

        # Header
        self.header = Header()
        main_layout.addWidget(self.header)

        # 主体区域
        body_layout = QHBoxLayout()
        body_layout.setContentsMargins(0, 0, 0, 0)
        body_layout.setSpacing(0)

        # 左侧工具栏
        self._left_sidebar = LeftSidebar()
        body_layout.addWidget(self._left_sidebar)

        # 面板内容区（根据工具/面板切换显示）
        self._panel_stack = {
            "text": TextPanel(),
            "shapes": ShapePanel(),
            "assets": AssetPanel(),
            "templates": TemplatePanel(),
            "pages": PagePanel(),
        }

        self._panel_container = QFrame()
        self._panel_container.setFixedWidth(280)
        self._panel_container.setStyleSheet("QFrame { background: white; border-right: 1px solid #E5E7EB; }")
        self._panel_container.setVisible(False)
        panel_container_layout = QVBoxLayout(self._panel_container)
        panel_container_layout.setContentsMargins(0, 0, 0, 0)
        panel_container_layout.setSpacing(0)
        body_layout.addWidget(self._panel_container)

        # 画布
        self.canvas = DesignCanvas()
        self.canvas.setFocusPolicy(Qt.StrongFocus)
        body_layout.addWidget(self.canvas, 1)

        # 右侧面板
        self._right_panel = RightPanel()
        body_layout.addWidget(self._right_panel)

        main_layout.addLayout(body_layout, 1)

        # 状态栏
        from PySide6.QtWidgets import QStatusBar
        self._status_bar = QStatusBar()
        self._status_bar.setStyleSheet("QStatusBar { background: #F9FAFB; border-top: 1px solid #E5E7EB; font-size: 11px; color: #6B7280; }")
        self._status_bar.showMessage(f"画布尺寸: {int(self._design_state.design.width)} × {int(self._design_state.design.height)} px")
        self.setStatusBar(self._status_bar)

        # 导出对话框
        self._export_dialog = ExportDialog(self)

    def _connect_signals(self):
        # UI 面板切换
        self._ui_state.active_panel_changed.connect(self._on_panel_changed)
        self._ui_state.show_export_modal_changed.connect(self._on_show_export)

        # 设计状态变化
        self._design_state.design_changed.connect(self._on_design_changed)
        self._design_state.selection_changed.connect(self._on_selection_changed)

        # Header 缩放连接画布
        self.header._zoom_in_btn.clicked.connect(self.canvas.zoom_in)
        self.header._zoom_out_btn.clicked.connect(self.canvas.zoom_out)
        self.header._zoom_label.clicked.connect(self.canvas.zoom_reset)

        # 画布缩放变化同步到 header
        self.canvas.zoom_changed.connect(self.header._update_zoom_label)

    def _setup_menu(self):
        """设置菜单栏"""
        menu_bar = self.menuBar()
        menu_bar.setStyleSheet("""
            QMenuBar {
                background: white;
                border-bottom: 1px solid #E5E7EB;
                padding: 2px;
            }
            QMenuBar::item {
                padding: 4px 12px;
                font-size: 12px;
            }
            QMenu {
                background: white;
                border: 1px solid #E5E7EB;
                border-radius: 8px;
                padding: 4px;
            }
            QMenu::item {
                padding: 6px 24px;
                font-size: 12px;
            }
            QMenu::item:selected {
                background: #EEF2FF;
                color: #6366F1;
                border-radius: 4px;
            }
        """)

        # 文件菜单
        file_menu = menu_bar.addMenu("文件(&F)")

        new_action = QAction("新建(&N)", self)
        new_action.setShortcut(QKeySequence.New)
        new_action.triggered.connect(self._on_new)
        file_menu.addAction(new_action)

        open_action = QAction("打开(&O)...", self)
        open_action.setShortcut(QKeySequence.Open)
        open_action.triggered.connect(self._on_open)
        file_menu.addAction(open_action)

        save_action = QAction("保存(&S)", self)
        save_action.setShortcut(QKeySequence.Save)
        save_action.triggered.connect(self._on_save)
        file_menu.addAction(save_action)

        file_menu.addSeparator()

        export_action = QAction("导出(&E)...", self)
        export_action.setShortcut(QKeySequence("Ctrl+E"))
        export_action.triggered.connect(lambda: setattr(self._ui_state, "show_export_modal", True))
        file_menu.addAction(export_action)

        file_menu.addSeparator()

        quit_action = QAction("退出(&Q)", self)
        quit_action.setShortcut(QKeySequence.Quit)
        quit_action.triggered.connect(self.close)
        file_menu.addAction(quit_action)

        # 编辑菜单
        edit_menu = menu_bar.addMenu("编辑(&E)")

        undo_action = QAction("撤销(&U)", self)
        undo_action.setShortcut(QKeySequence.Undo)
        undo_action.triggered.connect(self._design_state.undo)
        edit_menu.addAction(undo_action)

        redo_action = QAction("重做(&R)", self)
        redo_action.setShortcut(QKeySequence("Ctrl+Shift+Z"))
        redo_action.triggered.connect(self._design_state.redo)
        edit_menu.addAction(redo_action)

        edit_menu.addSeparator()

        delete_action = QAction("删除(&D)", self)
        delete_action.setShortcut(QKeySequence.Delete)
        delete_action.triggered.connect(self._on_delete_selected)
        edit_menu.addAction(delete_action)

        duplicate_action = QAction("复制(&D)", self)
        duplicate_action.setShortcut(QKeySequence("Ctrl+D"))
        duplicate_action.triggered.connect(self._on_duplicate_selected)
        edit_menu.addAction(duplicate_action)

        # 视图菜单
        view_menu = menu_bar.addMenu("视图(&V)")

        zoom_in_action = QAction("放大(&I)", self)
        zoom_in_action.setShortcut(QKeySequence.ZoomIn)
        zoom_in_action.triggered.connect(self.canvas.zoom_in)
        view_menu.addAction(zoom_in_action)

        zoom_out_action = QAction("缩小(&O)", self)
        zoom_out_action.setShortcut(QKeySequence.ZoomOut)
        zoom_out_action.triggered.connect(self.canvas.zoom_out)
        view_menu.addAction(zoom_out_action)

        zoom_reset_action = QAction("重置缩放(&R)", self)
        zoom_reset_action.setShortcut(QKeySequence("Ctrl+0"))
        zoom_reset_action.triggered.connect(self.canvas.zoom_reset)
        view_menu.addAction(zoom_reset_action)

    # ── 信号处理 ──

    def _on_panel_changed(self, panel_name: str):
        """面板内容切换"""
        # 清除旧内容
        old_layout = self._panel_container.layout()
        if old_layout:
            while old_layout.count():
                item = old_layout.takeAt(0)
                if item.widget():
                    item.widget().setParent(None)

        if panel_name and panel_name in self._panel_stack:
            panel = self._panel_stack[panel_name]
            self._panel_container.layout().addWidget(panel)
            self._panel_container.setVisible(True)
        else:
            self._panel_container.setVisible(False)

    def _on_show_export(self, show: bool):
        if show:
            self._export_dialog.exec()
            self._ui_state.show_export_modal = False

    def _on_design_changed(self):
        design = self._design_state.design
        self._status_bar.showMessage(
            f"画布尺寸: {int(design.width)} × {int(design.height)} px  |  "
            f"元素: {len(design.elements)}  |  "
            f"缩放: {int(design.zoom * 100)}%"
        )

    def _on_selection_changed(self):
        design = self._design_state.design
        sel = self._design_state.selected_ids
        if sel:
            self._status_bar.showMessage(
                f"已选中 {len(sel)} 个元素  |  "
                f"画布尺寸: {int(design.width)} × {int(design.height)} px  |  "
                f"缩放: {int(design.zoom * 100)}%"
            )

    # ── 菜单操作 ──

    def _on_new(self):
        from PySide6.QtWidgets import QMessageBox
        reply = QMessageBox.question(
            self, "新建设计", "确定要新建设计吗？当前未保存的更改将丢失。",
            QMessageBox.Yes | QMessageBox.No
        )
        if reply == QMessageBox.Yes:
            from models.design import create_default_design
            self._design_state.set_design(create_default_design())

    def _on_open(self):
        from PySide6.QtWidgets import QFileDialog, QMessageBox
        file_path, _ = QFileDialog.getOpenFileName(
            self, "打开设计文件", "",
            "JSON 文件 (*.json);;All Files (*)"
        )
        if not file_path:
            return
        import json
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            from models.design import DesignDocument
            design = DesignDocument.from_dict(data)
            self._design_state.set_design(design)
            self._status_bar.showMessage(f"已打开: {file_path}")
        except Exception as e:
            QMessageBox.warning(self, "打开失败", f"无法打开文件: {e}")

    def _on_save(self):
        from PySide6.QtWidgets import QFileDialog, QMessageBox
        file_path, _ = QFileDialog.getSaveFileName(
            self, "保存设计文件", "未命名设计.json",
            "JSON 文件 (*.json);;All Files (*)"
        )
        if not file_path:
            return
        import json
        try:
            data = self._design_state.design.to_dict()
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            self._status_bar.showMessage(f"已保存: {file_path}")
        except Exception as e:
            QMessageBox.warning(self, "保存失败", f"无法保存文件: {e}")

    def _on_delete_selected(self):
        for sid in list(self._design_state.selected_ids):
            self._design_state.delete_element(sid)

    def _on_duplicate_selected(self):
        for sid in list(self._design_state.selected_ids):
            self._design_state.duplicate_element(sid)