"""画布视图 - QGraphicsView 实现"""

from PySide6.QtCore import Qt, QRectF, QPointF, Signal, QTimer
from PySide6.QtGui import (
    QColor, QPen, QBrush, QPainter, QPainterPath,
    QWheelEvent, QMouseEvent, QKeyEvent,
)
from PySide6.QtWidgets import (
    QGraphicsView, QGraphicsScene, QGraphicsRectItem,
    QGraphicsItem, QApplication,
)

from models.design import (
    CanvasElement, DesignDocument, BackgroundElementProps,
    ElementType, GradientStop,
)
from models.state import get_design_state, get_ui_state
from widgets.canvas_items import create_canvas_item, CanvasElementItem
from utils.helpers import parse_color, create_linear_gradient


class DesignCanvas(QGraphicsView):
    """设计画布视图"""

    zoom_changed = Signal(float)
    scroll_changed = Signal(float, float)

    def __init__(self, parent=None):
        super().__init__(parent)
        self._scene = QGraphicsScene(self)
        self.setScene(self._scene)

        # 渲染设置
        self.setRenderHint(QPainter.Antialiasing)
        self.setRenderHint(QPainter.SmoothPixmapTransform)
        self.setViewportUpdateMode(QGraphicsView.FullViewportUpdate)
        self.setHorizontalScrollBarPolicy(Qt.ScrollBarAlwaysOff)
        self.setVerticalScrollBarPolicy(Qt.ScrollBarAlwaysOff)
        self.setDragMode(QGraphicsView.NoDrag)
        self.setTransformationAnchor(QGraphicsView.AnchorUnderMouse)
        self.setResizeAnchor(QGraphicsView.AnchorUnderMouse)
        self.setBackgroundBrush(QBrush(QColor("#F3F4F6")))

        # 状态
        self._design_state = get_design_state()
        self._ui_state = get_ui_state()
        self._item_map: dict[str, CanvasElementItem] = {}
        self._bg_rect: QGraphicsRectItem = None
        self._select_rect_start: QPointF = None
        self._select_rect_item: QGraphicsRectItem = None
        self._is_panning = False
        self._pan_start = QPointF()

        # 连接设计状态信号
        self._design_state.element_added.connect(self._on_element_added)
        self._design_state.element_removed.connect(self._on_element_removed)
        self._design_state.element_updated.connect(self._on_element_updated)
        self._design_state.design_changed.connect(self._on_design_changed)
        self._design_state.background_changed.connect(self._on_background_changed)
        self._design_state.selection_changed.connect(self._on_selection_changed)

        # 初始化画布
        self._rebuild_canvas()
        self._fit_to_view()

    # ── 画布重建 ──

    def _rebuild_canvas(self):
        """重建整个画布"""
        self._scene.clear()
        self._item_map.clear()
        design = self._design_state.design

        # 绘制背景
        self._draw_background()

        # 绘制所有元素
        for el in design.elements:
            self._add_item_to_scene(el)

        # 更新场景范围
        margin = 200
        self._scene.setSceneRect(
            QRectF(-margin, -margin,
                   design.width + margin * 2,
                   design.height + margin * 2)
        )

    def _draw_background(self):
        bg = self._design_state.design.background
        design = self._design_state.design
        rect = QRectF(0, 0, design.width, design.height)

        if bg.type == "solid":
            color = parse_color(bg.color or "#FFFFFF")
            self._bg_rect = self._scene.addRect(rect, Qt.NoPen, QBrush(color))
        elif bg.type == "gradient" and bg.gradient:
            grad = create_linear_gradient(
                bg.gradient.colors, bg.gradient.angle, rect
            )
            self._bg_rect = self._scene.addRect(rect, Qt.NoPen, QBrush(grad))
        else:
            self._bg_rect = self._scene.addRect(rect, Qt.NoPen, QBrush(QColor("#FFFFFF")))

        self._bg_rect.setZValue(-1000)

    def _add_item_to_scene(self, element: CanvasElement):
        """添加单个元素到场景"""
        item = create_canvas_item(element, self)
        item.setPos(element.props.x, element.props.y)
        item.setZValue(element.zIndex)
        self._scene.addItem(item)
        self._item_map[element.id] = item

    def _fit_to_view(self):
        """适配视图"""
        design = self._design_state.design
        self.resetTransform()
        self.centerOn(design.width / 2, design.height / 2)
        self._update_zoom(design.zoom)

    def _update_zoom(self, zoom: float):
        """更新缩放"""
        self.resetTransform()
        self.scale(zoom, zoom)

    # ── 信号处理 ──

    def _on_element_added(self, element_id: str):
        design = self._design_state.design
        for el in design.elements:
            if el.id == element_id:
                self._add_item_to_scene(el)
                break

    def _on_element_removed(self, element_id: str):
        if element_id in self._item_map:
            item = self._item_map.pop(element_id)
            self._scene.removeItem(item)

    def _on_element_updated(self, element_id: str):
        if element_id in self._item_map:
            item = self._item_map[element_id]
            item.update_from_element()

    def _on_design_changed(self):
        self._rebuild_canvas()

    def _on_background_changed(self):
        if self._bg_rect:
            self._scene.removeItem(self._bg_rect)
        self._draw_background()

    def _on_selection_changed(self):
        self._scene.clearSelection()
        for sid in self._design_state.selected_ids:
            if sid in self._item_map:
                self._item_map[sid].setSelected(True)

    # ── 元素交互回调 (由 CanvasElementItem 调用) ──

    def handle_item_moved(self, element_id: str, x: float, y: float):
        """元素移动回调"""
        self._design_state.update_element(element_id, {"x": x, "y": y})

    def handle_item_clicked(self, element_id: str):
        """元素点击回调"""
        modifiers = QApplication.keyboardModifiers()
        multi = bool(modifiers & Qt.ControlModifier)
        self._design_state.select_element(element_id, multi)
        self._ui_state.right_tab = "design"

    def handle_item_double_clicked(self, element_id: str):
        """元素双击回调"""
        self._ui_state.right_tab = "design"

    # ── 鼠标事件 ──

    def mousePressEvent(self, event: QMouseEvent):
        if event.button() == Qt.MiddleButton:
            self._is_panning = True
            self._pan_start = event.position()
            self.setCursor(Qt.ClosedHandCursor)
            event.accept()
            return

        if event.button() == Qt.LeftButton:
            item = self.itemAt(event.pos())
            if item is None or item == self._bg_rect:
                self._design_state.deselect_all()
                self._select_rect_start = event.position()
                self._select_rect_item = QGraphicsRectItem()
                self._select_rect_item.setPen(QPen(QColor("#6366F1"), 1, Qt.DashLine))
                self._select_rect_item.setBrush(QBrush(QColor(99, 102, 241, 30)))
                self._select_rect_item.setZValue(10000)
                self._scene.addItem(self._select_rect_item)
                event.accept()
                return

        super().mousePressEvent(event)

    def mouseMoveEvent(self, event: QMouseEvent):
        if self._is_panning:
            delta = event.position() - self._pan_start
            self._pan_start = event.position()
            self.horizontalScrollBar().setValue(
                self.horizontalScrollBar().value() - int(delta.x())
            )
            self.verticalScrollBar().setValue(
                self.verticalScrollBar().value() - int(delta.y())
            )
            event.accept()
            return

        if self._select_rect_item and self._select_rect_start is not None:
            p1 = self._select_rect_start
            p2 = event.position()
            rect = QRectF(
                min(p1.x(), p2.x()), min(p1.y(), p2.y()),
                abs(p2.x() - p1.x()), abs(p2.y() - p1.y()),
            )
            scene_rect = QRectF(
                self.mapToScene(rect.topLeft().toPoint()),
                self.mapToScene(rect.bottomRight().toPoint()),
            )
            self._select_rect_item.setRect(scene_rect)
            event.accept()
            return

        super().mouseMoveEvent(event)

    def mouseReleaseEvent(self, event: QMouseEvent):
        if self._is_panning:
            self._is_panning = False
            self.setCursor(Qt.ArrowCursor)
            event.accept()
            return

        if self._select_rect_item:
            self._scene.removeItem(self._select_rect_item)
            self._select_rect_item = None
            self._select_rect_start = None
            event.accept()
            return

        super().mouseReleaseEvent(event)

    # ── 滚轮事件 ──

    def wheelEvent(self, event: QWheelEvent):
        zoom_factor = 1.0015 ** event.angleDelta().y()
        current_zoom = self._design_state.design.zoom
        new_zoom = current_zoom * zoom_factor
        new_zoom = max(0.1, min(4.0, new_zoom))
        self._design_state.set_zoom(new_zoom)
        self._update_zoom(new_zoom)
        self.zoom_changed.emit(new_zoom)

    # ── 键盘事件 ──

    def keyPressEvent(self, event: QKeyEvent):
        if event.key() == Qt.Key_Delete or event.key() == Qt.Key_Backspace:
            for sid in list(self._design_state.selected_ids):
                self._design_state.delete_element(sid)
        elif event.key() == Qt.Key_Z and event.modifiers() & Qt.ControlModifier:
            if event.modifiers() & Qt.ShiftModifier:
                self._design_state.redo()
            else:
                self._design_state.undo()
        else:
            super().keyPressEvent(event)

    # ── 公开方法 ──

    def get_design_pixmap(self) -> "QPixmap":
        """获取整个设计的像素图（用于导出）"""
        from PySide6.QtGui import QPixmap
        design = self._design_state.design
        old_rect = self._scene.sceneRect()
        self._scene.setSceneRect(0, 0, design.width, design.height)
        pixmap = QPixmap(int(design.width), int(design.height))
        pixmap.fill(Qt.transparent)
        painter = QPainter(pixmap)
        painter.setRenderHint(QPainter.Antialiasing)
        self._scene.render(painter)
        painter.end()
        self._scene.setSceneRect(old_rect)
        return pixmap

    def zoom_in(self):
        new_zoom = min(4.0, self._design_state.design.zoom * 1.2)
        self._design_state.set_zoom(new_zoom)
        self._update_zoom(new_zoom)
        self.zoom_changed.emit(new_zoom)

    def zoom_out(self):
        new_zoom = max(0.1, self._design_state.design.zoom / 1.2)
        self._design_state.set_zoom(new_zoom)
        self._update_zoom(new_zoom)
        self.zoom_changed.emit(new_zoom)

    def zoom_reset(self):
        self._design_state.set_zoom(1.0)
        self._update_zoom(1.0)
        self.centerOn(self._design_state.design.width / 2,
                       self._design_state.design.height / 2)
        self.zoom_changed.emit(1.0)