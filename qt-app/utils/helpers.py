"""工具函数"""

from PySide6.QtCore import Qt, QRectF, QPointF
from PySide6.QtGui import QColor, QPainterPath, QPolygonF, QLinearGradient, QRadialGradient
from PySide6.QtWidgets import QGraphicsItem
import math


def parse_color(color_str: str) -> QColor:
    """解析颜色字符串为 QColor"""
    color_str = color_str.strip()
    if color_str == "transparent":
        return QColor(0, 0, 0, 0)
    if color_str.startswith("rgba("):
        parts = color_str[5:-1].split(",")
        r, g, b = int(parts[0]), int(parts[1]), int(parts[2])
        a = int(float(parts[3]) * 255)
        return QColor(r, g, b, a)
    if color_str.startswith("rgb("):
        parts = color_str[3:-1].split(",")
        r, g, b = int(parts[0]), int(parts[1]), int(parts[2])
        return QColor(r, g, b)
    return QColor(color_str)


def create_star_path(center: QPointF, outer_r: float, inner_r: float, points: int = 5) -> QPainterPath:
    """创建星形路径"""
    path = QPainterPath()
    angle_step = math.pi / points
    start_angle = -math.pi / 2

    for i in range(points * 2):
        angle = start_angle + i * angle_step
        r = outer_r if i % 2 == 0 else inner_r
        x = center.x() + r * math.cos(angle)
        y = center.y() + r * math.sin(angle)
        if i == 0:
            path.moveTo(x, y)
        else:
            path.lineTo(x, y)
    path.closeSubpath()
    return path


def create_arrow_path(rect: QRectF) -> QPainterPath:
    """创建箭头路径"""
    path = QPainterPath()
    w, h = rect.width(), rect.height()
    cx, cy = rect.center().x(), rect.center().y()
    path.moveTo(cx - w / 2, cy - h / 4)
    path.lineTo(cx + w / 4, cy - h / 4)
    path.lineTo(cx + w / 4, cy - h / 2)
    path.lineTo(cx + w / 2, cy)
    path.lineTo(cx + w / 4, cy + h / 2)
    path.lineTo(cx + w / 4, cy + h / 4)
    path.lineTo(cx - w / 2, cy + h / 4)
    path.closeSubpath()
    return path


def create_linear_gradient(colors: list, angle: float, rect: QRectF) -> QLinearGradient:
    """创建线性渐变"""
    grad = QLinearGradient()
    rad = math.radians(angle)
    cx, cy = rect.center().x(), rect.center().y()
    half_w, half_h = rect.width() / 2, rect.height() / 2
    dx = half_w * math.cos(rad)
    dy = half_h * math.sin(rad)
    grad.setStart(cx - dx, cy - dy)
    grad.setFinalStop(cx + dx, cy + dy)
    for stop in colors:
        if hasattr(stop, "color"):
            grad.setColorAt(stop.offset, parse_color(stop.color))
        else:
            grad.setColorAt(stop.get("offset", 0), parse_color(stop.get("color", "#FFF")))
    return grad