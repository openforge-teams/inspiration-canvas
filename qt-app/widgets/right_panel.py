"""右侧面板 - 属性面板 + 图层面板"""

from PySide6.QtCore import Qt, Signal
from PySide6.QtGui import QColor, QFont
from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QPushButton,
    QLabel, QScrollArea, QFrame, QSpinBox, QDoubleSpinBox,
    QComboBox, QColorDialog, QLineEdit, QTabWidget,
    QListWidget, QListWidgetItem, QSizePolicy, QSlider,
    QGroupBox, QGridLayout, QStackedWidget,
)

from models.design import (
    CanvasElement, ElementType, ShapeType,
    TextElementProps, ImageElementProps, ShapeElementProps,
    BackgroundElementProps, GradientConfig, GradientStop,
)
from models.state import get_design_state, get_ui_state
from utils.helpers import parse_color


class RightPanel(QWidget):
    """右侧面板"""

    def __init__(self, parent=None):
        super().__init__(parent)
        self.setFixedWidth(280)
        self._design_state = get_design_state()
        self._ui_state = get_ui_state()

        self._init_ui()
        self._connect_signals()

    def _init_ui(self):
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        # 选项卡切换（设计/图层）
        tab_bar = QHBoxLayout()
        tab_bar.setContentsMargins(8, 4, 8, 4)
        tab_bar.setSpacing(4)

        self._design_tab_btn = QPushButton("设计")
        self._design_tab_btn.setCheckable(True)
        self._design_tab_btn.setChecked(True)
        self._design_tab_btn.setStyleSheet(self._tab_style())
        self._design_tab_btn.clicked.connect(lambda: setattr(self._ui_state, "right_tab", "design"))

        self._layers_tab_btn = QPushButton("图层")
        self._layers_tab_btn.setCheckable(True)
        self._layers_tab_btn.setStyleSheet(self._tab_style())
        self._layers_tab_btn.clicked.connect(lambda: setattr(self._ui_state, "right_tab", "layers"))

        tab_bar.addWidget(self._design_tab_btn)
        tab_bar.addWidget(self._layers_tab_btn)
        tab_bar.addStretch()
        layout.addLayout(tab_bar)

        # 内容区
        self._stack = QStackedWidget()
        self._stack.addWidget(self._create_design_tab())
        self._stack.addWidget(self._create_layers_tab())
        layout.addWidget(self._stack, 1)

    def _connect_signals(self):
        self._ui_state.right_tab_changed.connect(self._on_right_tab_changed)
        self._design_state.selection_changed.connect(self._on_selection_changed)
        self._design_state.design_changed.connect(self._on_design_changed)

    def _tab_style(self):
        return """
            QPushButton {
                border: none;
                border-radius: 6px;
                padding: 6px 14px;
                font-size: 12px;
                font-weight: 500;
                color: #6B7280;
                background: transparent;
            }
            QPushButton:checked {
                background: #EEF2FF;
                color: #6366F1;
            }
            QPushButton:hover:!checked {
                background: #F3F4F6;
            }
        """

    # ── 设计面板 ──

    def _create_design_tab(self) -> QWidget:
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setStyleSheet("QScrollArea { border: none; }")

        widget = QWidget()
        layout = QVBoxLayout(widget)
        layout.setContentsMargins(12, 8, 12, 8)
        layout.setSpacing(12)

        # 画布尺寸
        size_group = self._create_section("画布尺寸")
        size_layout = QHBoxLayout()
        self._width_spin = QSpinBox()
        self._width_spin.setRange(100, 10000)
        self._width_spin.setValue(int(self._design_state.design.width))
        self._width_spin.valueChanged.connect(self._on_size_changed)
        self._height_spin = QSpinBox()
        self._height_spin.setRange(100, 10000)
        self._height_spin.setValue(int(self._design_state.design.height))
        self._height_spin.valueChanged.connect(self._on_size_changed)
        size_layout.addWidget(QLabel("宽"))
        size_layout.addWidget(self._width_spin)
        size_layout.addWidget(QLabel("高"))
        size_layout.addWidget(self._height_spin)
        size_group.layout().addLayout(size_layout)

        # 预设尺寸
        presets = [
            ("小红书 1080×1440", 1080, 1440),
            ("抖音 1080×1920", 1080, 1920),
            ("朋友圈 1080×1080", 1080, 1080),
            ("海报 750×1334", 750, 1334),
            ("PPT 16:9 1920×1080", 1920, 1080),
        ]
        for name, w, h in presets:
            btn = QPushButton(name)
            btn.setStyleSheet("""
                QPushButton {
                    border: 1px solid #E5E7EB;
                    border-radius: 6px;
                    padding: 4px 8px;
                    font-size: 11px;
                    color: #374151;
                }
                QPushButton:hover {
                    border-color: #6366F1;
                    background: #EEF2FF;
                }
            """)
            btn.clicked.connect(lambda checked, w=w, h=h: self._on_preset_size(w, h))
            size_group.layout().addWidget(btn)

        layout.addWidget(size_group)

        # 背景设置
        bg_group = self._create_section("背景设置")
        bg_type_layout = QHBoxLayout()
        self._bg_solid_btn = QPushButton("纯色")
        self._bg_solid_btn.setCheckable(True)
        self._bg_solid_btn.setChecked(True)
        self._bg_gradient_btn = QPushButton("渐变")
        self._bg_gradient_btn.setCheckable(True)
        for b in [self._bg_solid_btn, self._bg_gradient_btn]:
            b.setStyleSheet(self._tab_style())
        self._bg_solid_btn.clicked.connect(lambda: self._on_bg_type("solid"))
        self._bg_gradient_btn.clicked.connect(lambda: self._on_bg_type("gradient"))
        bg_type_layout.addWidget(self._bg_solid_btn)
        bg_type_layout.addWidget(self._bg_gradient_btn)
        bg_type_layout.addStretch()
        bg_group.layout().addLayout(bg_type_layout)

        self._bg_color_btn = QPushButton()
        self._bg_color_btn.setFixedSize(28, 28)
        self._bg_color_btn.setStyleSheet(
            f"background: {self._design_state.design.background.color or '#FFFFFF'}; "
            "border: 1px solid #D1D5DB; border-radius: 4px;"
        )
        self._bg_color_btn.clicked.connect(self._on_bg_color_pick)
        bg_group.layout().addWidget(self._bg_color_btn)

        # 渐变预设
        self._gradient_presets = QWidget()
        gradient_grid = QGridLayout(self._gradient_presets)
        gradient_grid.setContentsMargins(0, 0, 0, 0)
        gradient_grid.setSpacing(4)
        gradient_presets = [
            ("清晨", ["#667eea", "#764ba2"]),
            ("日暮", ["#f093fb", "#f5576c"]),
            ("极光", ["#4facfe", "#00f2fe"]),
            ("海洋", ["#43e97b", "#38f9d7"]),
            ("森林", ["#11998e", "#38ef7d"]),
            ("夕阳", ["#fa709a", "#fee140"]),
            ("深空", ["#0c3483", "#a2b6df"]),
            ("薰衣草", ["#c471f5", "#fa71cd"]),
        ]
        for i, (name, colors) in enumerate(gradient_presets):
            btn = QPushButton(name)
            btn.setFixedHeight(32)
            btn.setStyleSheet(f"""
                QPushButton {{
                    background: qlineargradient(x1:0, y1:0, x2:1, y2:1,
                        stop:0 {colors[0]}, stop:1 {colors[1]});
                    border: 1px solid #E5E7EB;
                    border-radius: 6px;
                    font-size: 11px;
                    color: white;
                    font-weight: 500;
                }}
                QPushButton:hover {{
                    border-color: #6366F1;
                }}
            """)
            btn.clicked.connect(lambda checked, c=colors: self._on_gradient_preset(c))
            gradient_grid.addWidget(btn, i // 4, i % 4)
        self._gradient_presets.setVisible(False)
        bg_group.layout().addWidget(self._gradient_presets)

        layout.addWidget(bg_group)

        # 元素属性
        self._element_props_group = self._create_section("元素属性")
        self._element_props_stack = QStackedWidget()
        self._element_props_stack.addWidget(QLabel("未选中任何元素"))
        self._element_props_stack.addWidget(self._create_text_props())
        self._element_props_stack.addWidget(self._create_shape_props())
        self._element_props_stack.addWidget(self._create_image_props())
        self._element_props_group.layout().addWidget(self._element_props_stack)
        self._element_props_group.setVisible(False)
        layout.addWidget(self._element_props_group)

        layout.addStretch()
        scroll.setWidget(widget)
        return scroll

    def _create_section(self, title: str) -> QGroupBox:
        group = QGroupBox(title)
        group.setStyleSheet("""
            QGroupBox {
                font-size: 12px;
                font-weight: 600;
                color: #374151;
                border: 1px solid #F3F4F6;
                border-radius: 8px;
                padding: 8px;
                padding-top: 16px;
            }
            QGroupBox::title {
                subcontrol-origin: margin;
                left: 8px;
                padding: 0 4px;
            }
        """)
        group.setLayout(QVBoxLayout())
        group.layout().setSpacing(6)
        return group

    # ── 元素属性子面板 ──

    def _create_text_props(self) -> QWidget:
        w = QWidget()
        l = QVBoxLayout(w)
        l.setSpacing(6)
        self._text_font_size = QSpinBox()
        self._text_font_size.setRange(8, 200)
        self._text_font_size.valueChanged.connect(self._on_text_prop_changed)
        l.addWidget(QLabel("字号"))
        l.addWidget(self._text_font_size)
        self._text_color_btn = QPushButton()
        self._text_color_btn.setFixedSize(28, 28)
        self._text_color_btn.clicked.connect(self._on_text_color_pick)
        l.addWidget(QLabel("颜色"))
        l.addWidget(self._text_color_btn)
        return w

    def _create_shape_props(self) -> QWidget:
        w = QWidget()
        l = QVBoxLayout(w)
        l.setSpacing(6)
        self._shape_fill_btn = QPushButton()
        self._shape_fill_btn.setFixedSize(28, 28)
        self._shape_fill_btn.clicked.connect(self._on_shape_fill_pick)
        l.addWidget(QLabel("填充"))
        l.addWidget(self._shape_fill_btn)
        self._shape_stroke_width = QDoubleSpinBox()
        self._shape_stroke_width.setRange(0, 50)
        self._shape_stroke_width.valueChanged.connect(self._on_shape_prop_changed)
        l.addWidget(QLabel("边框宽度"))
        l.addWidget(self._shape_stroke_width)
        return w

    def _create_image_props(self) -> QWidget:
        w = QWidget()
        l = QVBoxLayout(w)
        l.setSpacing(6)
        self._image_radius = QDoubleSpinBox()
        self._image_radius.setRange(0, 200)
        self._image_radius.valueChanged.connect(self._on_image_prop_changed)
        l.addWidget(QLabel("圆角"))
        l.addWidget(self._image_radius)
        return w

    # ── 图层面板 ──

    def _create_layers_tab(self) -> QWidget:
        widget = QWidget()
        layout = QVBoxLayout(widget)
        layout.setContentsMargins(8, 8, 8, 8)
        layout.setSpacing(4)

        header = QLabel(f"图层 ({len(self._design_state.design.elements)})")
        header.setStyleSheet("font-size: 12px; font-weight: 600; color: #374151;")
        layout.addWidget(header)

        self._layer_list = QListWidget()
        self._layer_list.setStyleSheet("""
            QListWidget {
                border: none;
                background: transparent;
            }
            QListWidget::item {
                border: 1px solid #F3F4F6;
                border-radius: 6px;
                padding: 8px;
                margin: 2px 0;
            }
            QListWidget::item:selected {
                background: #EEF2FF;
                border-color: #6366F1;
            }
        """)
        self._layer_list.currentRowChanged.connect(self._on_layer_selected)
        layout.addWidget(self._layer_list, 1)

        btn_layout = QHBoxLayout()
        for text, action in [
            ("↑", "up"), ("↓", "down"), ("+", "dup"), ("🗑", "del"),
        ]:
            btn = QPushButton(text)
            btn.setFixedSize(32, 32)
            btn.clicked.connect(lambda checked, a=action: self._on_layer_action(a))
            btn_layout.addWidget(btn)
        btn_layout.addStretch()
        layout.addLayout(btn_layout)

        return widget

    def _rebuild_layer_list(self):
        self._layer_list.clear()
        elements = sorted(
            self._design_state.design.elements,
            key=lambda e: e.zIndex,
            reverse=True,
        )
        for el in elements:
            type_icon = {"text": "T", "image": "◻", "shape": "◯", "line": "╱"}.get(
                el.type.value, "?"
            )
            item = QListWidgetItem(f"{type_icon}  {el.name}")
            item.setData(Qt.UserRole, el.id)
            if el.id in self._design_state.selected_ids:
                item.setSelected(True)
            self._layer_list.addItem(item)

    # ── 信号处理 ──

    def _on_right_tab_changed(self, tab: str):
        self._design_tab_btn.setChecked(tab == "design")
        self._layers_tab_btn.setChecked(tab == "layers")
        self._stack.setCurrentIndex(0 if tab == "design" else 1)
        if tab == "layers":
            self._rebuild_layer_list()

    def _on_selection_changed(self):
        self._update_element_props()
        self._rebuild_layer_list()

    def _on_design_changed(self):
        self._width_spin.blockSignals(True)
        self._height_spin.blockSignals(True)
        self._width_spin.setValue(int(self._design_state.design.width))
        self._height_spin.setValue(int(self._design_state.design.height))
        self._width_spin.blockSignals(False)
        self._height_spin.blockSignals(False)
        self._bg_color_btn.setStyleSheet(
            f"background: {self._design_state.design.background.color or '#FFFFFF'}; "
            "border: 1px solid #D1D5DB; border-radius: 4px;"
        )

    def _update_element_props(self):
        el = self._design_state.selected_element
        if el is None:
            self._element_props_group.setVisible(False)
            self._element_props_stack.setCurrentIndex(0)
            return
        self._element_props_group.setVisible(True)
        if el.type == ElementType.TEXT:
            self._element_props_stack.setCurrentIndex(1)
            self._text_font_size.setValue(int(el.props.fontSize))
            self._text_color_btn.setStyleSheet(
                f"background: {el.props.fill}; border: 1px solid #D1D5DB; border-radius: 4px;"
            )
        elif el.type == ElementType.SHAPE:
            self._element_props_stack.setCurrentIndex(2)
            self._shape_fill_btn.setStyleSheet(
                f"background: {el.props.fill}; border: 1px solid #D1D5DB; border-radius: 4px;"
            )
            self._shape_stroke_width.setValue(el.props.strokeWidth)
        elif el.type == ElementType.IMAGE:
            self._element_props_stack.setCurrentIndex(3)
            self._image_radius.setValue(el.props.borderRadius)

    # ── 事件处理 ──

    def _on_size_changed(self):
        self._design_state.update_design_size(
            self._width_spin.value(), self._height_spin.value()
        )

    def _on_preset_size(self, w: int, h: int):
        self._width_spin.setValue(w)
        self._height_spin.setValue(h)
        self._design_state.update_design_size(w, h)

    def _on_bg_type(self, bg_type: str):
        self._bg_solid_btn.setChecked(bg_type == "solid")
        self._bg_gradient_btn.setChecked(bg_type == "gradient")
        self._gradient_presets.setVisible(bg_type == "gradient")
        bg = BackgroundElementProps(type=bg_type)
        if bg_type == "solid":
            bg.color = self._design_state.design.background.color or "#FFFFFF"
        self._design_state.set_background(bg)

    def _on_bg_color_pick(self):
        color = QColorDialog.getColor(
            parse_color(self._design_state.design.background.color or "#FFFFFF"),
            self, "选择背景颜色"
        )
        if color.isValid():
            bg = BackgroundElementProps(
                type="solid", color=color.name()
            )
            self._design_state.set_background(bg)

    def _on_gradient_preset(self, colors: list):
        grad = GradientConfig(
            type="linear",
            colors=[
                GradientStop(color=colors[0], offset=0.0),
                GradientStop(color=colors[1], offset=1.0),
            ],
            angle=135,
        )
        bg = BackgroundElementProps(type="gradient", gradient=grad)
        self._design_state.set_background(bg)

    def _on_text_prop_changed(self):
        el = self._design_state.selected_element
        if el and el.type == ElementType.TEXT:
            self._design_state.update_element(
                el.id, {"fontSize": self._text_font_size.value()}
            )

    def _on_text_color_pick(self):
        el = self._design_state.selected_element
        if el and el.type == ElementType.TEXT:
            color = QColorDialog.getColor(parse_color(el.props.fill), self)
            if color.isValid():
                self._design_state.update_element(el.id, {"fill": color.name()})

    def _on_shape_prop_changed(self):
        el = self._design_state.selected_element
        if el and el.type == ElementType.SHAPE:
            self._design_state.update_element(
                el.id, {"strokeWidth": self._shape_stroke_width.value()}
            )

    def _on_shape_fill_pick(self):
        el = self._design_state.selected_element
        if el and el.type == ElementType.SHAPE:
            color = QColorDialog.getColor(parse_color(el.props.fill), self)
            if color.isValid():
                self._design_state.update_element(el.id, {"fill": color.name()})

    def _on_image_prop_changed(self):
        el = self._design_state.selected_element
        if el and el.type == ElementType.IMAGE:
            self._design_state.update_element(
                el.id, {"borderRadius": self._image_radius.value()}
            )

    def _on_layer_selected(self, row: int):
        if row < 0:
            return
        item = self._layer_list.item(row)
        if item:
            el_id = item.data(Qt.UserRole)
            self._design_state.select_element(el_id)

    def _on_layer_action(self, action: str):
        sel = self._design_state.selected_ids
        if not sel:
            return
        el_id = sel[0]
        if action == "up":
            self._design_state.move_element_z_index(el_id, "up")
        elif action == "down":
            self._design_state.move_element_z_index(el_id, "down")
        elif action == "dup":
            self._design_state.duplicate_element(el_id)
        elif action == "del":
            self._design_state.delete_element(el_id)
        self._rebuild_layer_list()