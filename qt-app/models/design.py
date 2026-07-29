"""数据模型定义 - 从 packages/shared/src/index.ts 移植"""

import random
import time
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional, Union


class ElementType(str, Enum):
    TEXT = "text"
    IMAGE = "image"
    SHAPE = "shape"
    ICON = "icon"
    SVG = "svg"
    VIDEO = "video"
    BACKGROUND = "background"
    LINE = "line"


class ShapeType(str, Enum):
    RECT = "rect"
    CIRCLE = "circle"
    TRIANGLE = "triangle"
    STAR = "star"
    ARROW = "arrow"
    LINE = "line"


@dataclass
class BaseElementProps:
    x: float = 0.0
    y: float = 0.0
    width: float = 200.0
    height: float = 100.0
    rotation: float = 0.0
    opacity: float = 1.0
    visible: bool = True
    locked: bool = False


@dataclass
class TextElementProps(BaseElementProps):
    text: str = "双击编辑文本"
    fontFamily: str = "Inter, sans-serif"
    fontSize: float = 24.0
    fontWeight: int = 400
    fontStyle: str = "normal"  # 'normal' | 'italic'
    textDecoration: str = "none"  # 'none' | 'underline' | 'line-through'
    textAlign: str = "left"  # 'left' | 'center' | 'right'
    fill: str = "#333333"
    lineHeight: float = 1.4
    letterSpacing: float = 0.0
    padding: float = 0.0


@dataclass
class ImageElementProps(BaseElementProps):
    src: str = ""
    cropX: float = 0.0
    cropY: float = 0.0
    cropWidth: float = 1.0
    cropHeight: float = 1.0
    borderRadius: float = 0.0
    shadowBlur: float = 0.0
    shadowColor: str = "rgba(0,0,0,0.3)"
    shadowOffsetX: float = 0.0
    shadowOffsetY: float = 0.0


@dataclass
class ShapeElementProps(BaseElementProps):
    shapeType: ShapeType = ShapeType.RECT
    fill: str = "#4F46E5"
    stroke: str = "transparent"
    strokeWidth: float = 0.0
    borderRadius: float = 8.0


@dataclass
class LineElementProps(BaseElementProps):
    stroke: str = "#333333"
    strokeWidth: float = 2.0
    points: list = field(default_factory=lambda: [0, 2, 200, 2])


@dataclass
class GradientStop:
    color: str
    offset: float


@dataclass
class GradientConfig:
    type: str = "linear"  # 'linear' | 'radial'
    colors: list = field(default_factory=list)  # [GradientStop]
    angle: float = 0.0


@dataclass
class BackgroundElementProps:
    type: str = "solid"  # 'solid' | 'gradient' | 'image'
    color: Optional[str] = "#FFFFFF"
    gradient: Optional[GradientConfig] = None
    image: Optional[str] = None


ElementProps = Union[TextElementProps, ImageElementProps, ShapeElementProps, LineElementProps]


@dataclass
class CanvasElement:
    id: str
    type: ElementType
    name: str = "元素"
    parentId: Optional[str] = None
    zIndex: int = 0
    props: ElementProps = field(default_factory=BaseElementProps)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "type": self.type.value,
            "name": self.name,
            "parentId": self.parentId,
            "zIndex": self.zIndex,
            "props": self._props_to_dict(),
        }

    def _props_to_dict(self) -> dict:
        result = {}
        for key, val in self.props.__dict__.items():
            if isinstance(val, Enum):
                result[key] = val.value
            elif isinstance(val, (list, dict)):
                result[key] = val
            else:
                result[key] = val
        return result

    @staticmethod
    def from_dict(data: dict) -> "CanvasElement":
        el_type = ElementType(data["type"])
        props_data = data.get("props", {})
        if el_type == ElementType.TEXT:
            props = TextElementProps(**props_data)
        elif el_type == ElementType.IMAGE:
            props_data_copy = dict(props_data)
            for f in ["cropX", "cropY", "cropWidth", "cropHeight", "borderRadius",
                       "shadowBlur", "shadowOffsetX", "shadowOffsetY"]:
                if f not in props_data_copy:
                    props_data_copy[f] = 0.0
            props = ImageElementProps(**props_data_copy)
        elif el_type == ElementType.LINE:
            props = LineElementProps(**props_data)
        else:
            props_data_copy = dict(props_data)
            if "shapeType" in props_data_copy and isinstance(props_data_copy["shapeType"], str):
                props_data_copy["shapeType"] = ShapeType(props_data_copy["shapeType"])
            props = ShapeElementProps(**props_data_copy)
        return CanvasElement(
            id=data["id"],
            type=el_type,
            name=data.get("name", "元素"),
            parentId=data.get("parentId"),
            zIndex=data.get("zIndex", 0),
            props=props,
        )


@dataclass
class DesignDocument:
    id: str
    title: str = "未命名设计"
    width: float = 1080.0
    height: float = 1440.0
    background: BackgroundElementProps = field(default_factory=BackgroundElementProps)
    elements: list = field(default_factory=list)  # [CanvasElement]
    zoom: float = 1.0
    scrollX: float = 0.0
    scrollY: float = 0.0
    version: int = 1
    createdAt: float = 0.0
    updatedAt: float = 0.0
    templateId: Optional[str] = None

    def __post_init__(self):
        if self.createdAt == 0.0:
            self.createdAt = time.time()
        if self.updatedAt == 0.0:
            self.updatedAt = time.time()

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "title": self.title,
            "width": self.width,
            "height": self.height,
            "background": {
                "type": self.background.type,
                "color": self.background.color,
                "gradient": self.background.gradient.__dict__ if self.background.gradient else None,
                "image": self.background.image,
            },
            "elements": [el.to_dict() for el in self.elements],
            "zoom": self.zoom,
            "scrollX": self.scrollX,
            "scrollY": self.scrollY,
            "version": self.version,
            "createdAt": self.createdAt,
            "updatedAt": self.updatedAt,
            "templateId": self.templateId,
        }

    @staticmethod
    def from_dict(data: dict) -> "DesignDocument":
        bg_data = data.get("background", {})
        gradient = None
        if bg_data.get("gradient"):
            gradient = GradientConfig(**bg_data["gradient"])
        background = BackgroundElementProps(
            type=bg_data.get("type", "solid"),
            color=bg_data.get("color", "#FFFFFF"),
            gradient=gradient,
            image=bg_data.get("image"),
        )
        elements = [CanvasElement.from_dict(el) for el in data.get("elements", [])]
        return DesignDocument(
            id=data["id"],
            title=data.get("title", "未命名设计"),
            width=data.get("width", 1080),
            height=data.get("height", 1440),
            background=background,
            elements=elements,
            zoom=data.get("zoom", 1.0),
            scrollX=data.get("scrollX", 0.0),
            scrollY=data.get("scrollY", 0.0),
            version=data.get("version", 1),
            createdAt=data.get("createdAt", time.time()),
            updatedAt=data.get("updatedAt", time.time()),
            templateId=data.get("templateId"),
        )


def generate_id() -> str:
    """生成唯一 ID"""
    rand_part = "".join(random.choices("abcdefghijklmnopqrstuvwxyz0123456789", k=9))
    time_part = hex(int(time.time() * 1000))[2:]
    return rand_part + time_part


def create_default_element(element_type: ElementType, x: float, y: float) -> CanvasElement:
    """创建默认元素"""
    elem_id = generate_id()
    base = BaseElementProps(x=x, y=y)

    if element_type == ElementType.TEXT:
        props = TextElementProps(
            x=x, y=y, width=200, height=50,
            text="双击编辑文本", fontSize=24,
        )
        return CanvasElement(id=elem_id, type=ElementType.TEXT, name="文本", props=props)
    elif element_type == ElementType.IMAGE:
        props = ImageElementProps(
            x=x, y=y, width=300, height=200,
        )
        return CanvasElement(id=elem_id, type=ElementType.IMAGE, name="图片", props=props)
    elif element_type == ElementType.SHAPE:
        props = ShapeElementProps(
            x=x, y=y, width=150, height=150,
            shapeType=ShapeType.RECT, fill="#4F46E5",
        )
        return CanvasElement(id=elem_id, type=ElementType.SHAPE, name="形状", props=props)
    elif element_type == ElementType.LINE:
        props = LineElementProps(
            x=x, y=y, width=200, height=4,
        )
        return CanvasElement(id=elem_id, type=ElementType.LINE, name="线条", props=props)
    else:
        props = ShapeElementProps(
            x=x, y=y, width=150, height=150,
            shapeType=ShapeType.RECT, fill="#4F46E5",
        )
        return CanvasElement(id=elem_id, type=ElementType.SHAPE, name="元素", props=props)


def create_default_design() -> DesignDocument:
    """创建默认设计文档"""
    return DesignDocument(
        id=generate_id(),
        title="未命名设计",
        width=1080,
        height=1440,
        background=BackgroundElementProps(type="solid", color="#FFFFFF"),
        elements=[],
        zoom=1.0,
    )