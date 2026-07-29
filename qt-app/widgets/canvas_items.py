"""画布元素 - QGraphicsItem 子类实现"""

from PySide6.QtCore import Qt, QRectF, QPointF
from PySide6.QtGui import (
    QColor, QPen, QBrush, QPainter, QPainterPath, QFont,
    QPixmap, QImage, QLinearGradient,
)
from PySide6.QtWidgets import (
    QGraphicsItem, QGraphicsRectItem,
    QStyleOptionGraphicsItem, QStyle, QWidget,
)
import math
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from widgets.canvas import DesignCanvas

from models.design import (
    CanvasElement, TextElementProps, ImageElementProps,
    ShapeElementProps, LineElementProps, ShapeType,
)
from utils.helpers import parse_color, create_star_path, create_arrow_path, create_linear_gradient


class CanvasElementItem(QGraphicsItem):
    """画布元素基类 - 使用 QGraphicsItem（非 QGraphicsObject）"""

    def __init__(self, element: CanvasElement, canvas: "DesignCanvas" = None):
        super().__init__()
        self._element = element
        self._canvas = canvas
        self.setFlag(QGraphicsItem.ItemIsSelectable, True)
        self.setFlag(QGraphicsItem.ItemIsMovable, True)
        self.setFlag(QGraphicsItem.ItemSendsGeometryChanges, True)
        self.setAcceptHoverEvents(True)
        self.setCacheMode(QGraphicsItem.DeviceCoordinateCache)
        self._moving = False
        self._start_pos = QPointF()

    @property
    def element(self) -> CanvasElement:
        return self._element

    def boundingRect(self) -> QRectF:
        return QRectF(0, 0, self._element.props.width, self._element.props.height)

    def itemChange(self, change, value):
        if change == QGraphicsItem.ItemPositionHasChanged and self._moving:
            if self._canvas:
                self._canvas.handle_item_moved(
                    self._element.id,
                    self.pos().x(),
                    self.pos().y(),
                )
        return super().itemChange(change, value)

    def mousePressEvent(self, event):
        self._moving = True
        self._start_pos = self.pos()
        if self._canvas:
            self._canvas.handle_item_clicked(self._element.id)
        super().mousePressEvent(event)

    def mouseReleaseEvent(self, event):
        if self._moving and self._start_pos != self.pos():
            if self._canvas:
                self._canvas.handle_item_moved(
                    self._element.id,
                    self.pos().x(),
                    self.pos().y(),
                )
        self._moving = False
        super().mouseReleaseEvent(event)

    def mouseDoubleClickEvent(self, event):
        if self._canvas:
            self._canvas.handle_item_double_clicked(self._element.id)
        super().mouseDoubleClickEvent(event)

    def update_from_element(self):
        """从数据模型更新视图"""
        self.setPos(self._element.props.x, self._element.props.y)
        self.setRotation(self._element.props.rotation)
        self.setOpacity(self._element.props.opacity)
        self.setVisible(self._element.props.visible)
        self.prepareGeometryChange()
        self.update()


class TextItem(CanvasElementItem):
    """文本元素"""

    def paint(self, painter: QPainter, option: QStyleOptionGraphicsItem, widget: QWidget):
        props: TextElementProps = self._element.props
        painter.setRenderHint(QPainter.Antialiasing)
        painter.setRenderHint(QPainter.TextAntialiasing)

        if option.state & QStyle.State_Selected:
            painter.setPen(QPen(QColor("#6366F1"), 1, Qt.DashLine))
            painter.setBrush(Qt.NoBrush)
            painter.drawRect(self.boundingRect())

        font = QFont()
        font.setFamily(props.fontFamily.split(",")[0].strip())
        font.setPixelSize(int(props.fontSize))
        # 注意: setWeight() 在 offscreen 渲染中会导致段错误，使用 setBold 替代
        font.setBold(props.fontWeight >= 600)
        font.setItalic(props.fontStyle == "italic")
        font.setUnderline(props.textDecoration == "underline")
        font.setLetterSpacing(QFont.AbsoluteSpacing, props.letterSpacing)
        painter.setFont(font)

        painter.setPen(QPen(parse_color(props.fill)))

        flags = Qt.TextWordWrap
        if props.textAlign == "center":
            flags |= Qt.AlignHCenter
        elif props.textAlign == "right":
            flags |= Qt.AlignRight
        else:
            flags |= Qt.AlignLeft
        flags |= Qt.AlignTop

        rect = QRectF(
            props.padding,
            props.padding,
            self.boundingRect().width() - props.padding * 2,
            self.boundingRect().height() - props.padding * 2,
        )
        painter.drawText(rect, flags, props.text)


class ImageItem(CanvasElementItem):
    """图片元素"""

    def __init__(self, element: CanvasElement, canvas: "DesignCanvas" = None):
        super().__init__(element, canvas)
        self._pixmap: QPixmap = None
        self._load_image()

    def _load_image(self):
        props: ImageElementProps = self._element.props
        if props.src:
            if props.src.startswith("data:"):
                import base64
                header, data = props.src.split(",", 1)
                img_data = base64.b64decode(data)
                img = QImage()
                img.loadFromData(img_data)
                self._pixmap = QPixmap.fromImage(img)
            elif props.src.startswith("http"):
                self._pixmap = None
            else:
                self._pixmap = QPixmap(props.src)

    def set_src(self, src: str):
        self._element.props.src = src
        self._load_image()
        self.update()

    def paint(self, painter: QPainter, option: QStyleOptionGraphicsItem, widget: QWidget):
        painter.setRenderHint(QPainter.Antialiasing)
        painter.setRenderHint(QPainter.SmoothPixmapTransform)

        rect = self.boundingRect()
        props: ImageElementProps = self._element.props

        if props.borderRadius > 0:
            path = QPainterPath()
            path.addRoundedRect(rect, props.borderRadius, props.borderRadius)
            painter.setClipPath(path)

        if self._pixmap and not self._pixmap.isNull():
            painter.drawPixmap(rect.toRect(), self._pixmap)
        else:
            painter.setPen(Qt.NoPen)
            painter.setBrush(QBrush(QColor("#E5E7EB")))
            painter.drawRect(rect)
            painter.setPen(QPen(QColor("#9CA3AF")))
            painter.setFont(QFont("sans-serif", 10))
            painter.drawText(rect, Qt.AlignCenter, "图片占位")

        if option.state & QStyle.State_Selected:
            painter.setClipping(False)
            painter.setPen(QPen(QColor("#6366F1"), 2))
            painter.setBrush(Qt.NoBrush)
            painter.drawRect(rect)


class ShapeItem(CanvasElementItem):
    """形状元素"""

    def shape_path(self) -> QPainterPath:
        rect = self.boundingRect()
        props: ShapeElementProps = self._element.props

        if props.shapeType == ShapeType.CIRCLE:
            path = QPainterPath()
            path.addEllipse(rect)
            return path
        elif props.shapeType == ShapeType.TRIANGLE:
            path = QPainterPath()
            path.moveTo(rect.center().x(), rect.top())
            path.lineTo(rect.right(), rect.bottom())
            path.lineTo(rect.left(), rect.bottom())
            path.closeSubpath()
            return path
        elif props.shapeType == ShapeType.STAR:
            center = rect.center()
            r = min(rect.width(), rect.height()) / 2
            return create_star_path(center, r, r * 0.4)
        elif props.shapeType == ShapeType.ARROW:
            return create_arrow_path(rect)
        else:  # RECT
            if props.borderRadius > 0:
                path = QPainterPath()
                path.addRoundedRect(rect, props.borderRadius, props.borderRadius)
                return path
            path = QPainterPath()
            path.addRect(rect)
            return path

    def paint(self, painter: QPainter, option: QStyleOptionGraphicsItem, widget: QWidget):
        painter.setRenderHint(QPainter.Antialiasing)
        props: ShapeElementProps = self._element.props

        path = self.shape_path()
        fill_color = parse_color(props.fill)
        stroke_color = parse_color(props.stroke)

        painter.setPen(Qt.NoPen)
        painter.setBrush(QBrush(fill_color))
        painter.drawPath(path)

        if props.strokeWidth > 0 and stroke_color.alpha() > 0:
            painter.setPen(QPen(stroke_color, props.strokeWidth))
            painter.setBrush(Qt.NoBrush)
            painter.drawPath(path)

        if option.state & QStyle.State_Selected:
            painter.setPen(QPen(QColor("#6366F1"), 2, Qt.DashLine))
            painter.setBrush(Qt.NoBrush)
            painter.drawRect(self.boundingRect())


class LineItem(CanvasElementItem):
    """线条元素"""

    def paint(self, painter: QPainter, option: QStyleOptionGraphicsItem, widget: QWidget):
        painter.setRenderHint(QPainter.Antialiasing)
        props: LineElementProps = self._element.props

        color = parse_color(props.stroke)
        pen = QPen(color, props.strokeWidth, Qt.SolidLine, Qt.RoundCap)
        painter.setPen(pen)

        points = props.points
        if len(points) >= 4:
            path = QPainterPath()
            path.moveTo(points[0], points[1])
            for i in range(2, len(points), 2):
                path.lineTo(points[i], points[i + 1])
            painter.drawPath(path)

        if option.state & QStyle.State_Selected:
            painter.setPen(QPen(QColor("#6366F1"), 1, Qt.DashLine))
            painter.setBrush(Qt.NoBrush)
            painter.drawRect(self.boundingRect())


def create_canvas_item(element: CanvasElement, canvas: "DesignCanvas" = None) -> CanvasElementItem:
    """工厂方法：根据元素类型创建对应的图形项"""
    if element.type.value == "text":
        return TextItem(element, canvas)
    elif element.type.value == "image":
        return ImageItem(element, canvas)
    elif element.type.value == "shape":
        return ShapeItem(element, canvas)
    elif element.type.value == "line":
        return LineItem(element, canvas)
    else:
        return ShapeItem(element, canvas)