"""状态管理 - 从 Zustand store 移植到 Qt 信号/槽模式"""

import copy
from typing import Optional, Callable

from PySide6.QtCore import QObject, Signal

from .design import (
    CanvasElement,
    DesignDocument,
    BackgroundElementProps,
    ElementType,
    ElementProps,
    create_default_element,
    create_default_design,
    generate_id,
)

MAX_HISTORY = 50


class DesignState(QObject):
    """设计状态管理 - 核心数据模型 + 操作"""

    # 信号
    design_changed = Signal()
    element_added = Signal(str)  # element_id
    element_removed = Signal(str)  # element_id
    element_updated = Signal(str)  # element_id
    selection_changed = Signal()
    history_changed = Signal()
    zoom_changed = Signal(float)
    background_changed = Signal()

    def __init__(self, parent: QObject = None):
        super().__init__(parent)
        self._design = create_default_design()
        self._selected_ids: list[str] = []
        self._history: list[DesignDocument] = [copy.deepcopy(self._design)]
        self._history_index = 0

    # ── 属性访问 ──

    @property
    def design(self) -> DesignDocument:
        return self._design

    @design.setter
    def design(self, value: DesignDocument):
        self._design = value

    @property
    def selected_ids(self) -> list[str]:
        return self._selected_ids

    @property
    def history(self) -> list[DesignDocument]:
        return self._history

    @property
    def history_index(self) -> int:
        return self._history_index

    @property
    def can_undo(self) -> bool:
        return self._history_index > 0

    @property
    def can_redo(self) -> bool:
        return self._history_index < len(self._history) - 1

    # ── 历史管理 ──

    def save_history(self):
        """保存历史快照"""
        new_history = self._history[:self._history_index + 1]
        new_history.append(copy.deepcopy(self._design))
        if len(new_history) > MAX_HISTORY:
            new_history.pop(0)
        self._history = new_history
        self._history_index = len(new_history) - 1
        self.history_changed.emit()

    def undo(self):
        """撤销"""
        if self._history_index > 0:
            self._history_index -= 1
            self._design = copy.deepcopy(self._history[self._history_index])
            self._selected_ids = []
            self.design_changed.emit()
            self.history_changed.emit()
            self.selection_changed.emit()

    def redo(self):
        """重做"""
        if self._history_index < len(self._history) - 1:
            self._history_index += 1
            self._design = copy.deepcopy(self._history[self._history_index])
            self._selected_ids = []
            self.design_changed.emit()
            self.history_changed.emit()
            self.selection_changed.emit()

    # ── 元素操作 ──

    def add_element(self, element: CanvasElement):
        """添加元素"""
        max_z = max((el.zIndex for el in self._design.elements), default=0)
        element.zIndex = max_z + 1
        self._design.elements.append(element)
        self._selected_ids = [element.id]
        self._design.updatedAt = __import__("time").time()
        self.save_history()
        self.element_added.emit(element.id)
        self.selection_changed.emit()
        self.design_changed.emit()

    def delete_element(self, element_id: str):
        """删除元素"""
        self._design.elements = [
            el for el in self._design.elements if el.id != element_id
        ]
        self._selected_ids = [sid for sid in self._selected_ids if sid != element_id]
        self._design.updatedAt = __import__("time").time()
        self.save_history()
        self.element_removed.emit(element_id)
        self.selection_changed.emit()
        self.design_changed.emit()

    def update_element(self, element_id: str, partial_props: dict):
        """更新元素属性"""
        for el in self._design.elements:
            if el.id == element_id:
                for key, val in partial_props.items():
                    if hasattr(el.props, key):
                        setattr(el.props, key, val)
                break
        self._design.updatedAt = __import__("time").time()
        self.element_updated.emit(element_id)
        self.design_changed.emit()

    def add_element_by_type(self, element_type: ElementType, x: float, y: float):
        """按类型添加元素"""
        element = create_default_element(element_type, x, y)
        self.add_element(element)

    def duplicate_element(self, element_id: str):
        """复制元素"""
        for el in self._design.elements:
            if el.id == element_id:
                new_el = copy.deepcopy(el)
                new_el.id = generate_id()
                new_el.name = f"{el.name} 副本"
                new_el.props.x += 20
                new_el.props.y += 20
                self.add_element(new_el)
                return

    def move_element_z_index(self, element_id: str, direction: str):
        """移动元素层级"""
        elements = self._design.elements
        sorted_els = sorted(elements, key=lambda e: e.zIndex)
        idx = next((i for i, e in enumerate(sorted_els) if e.id == element_id), -1)
        if idx == -1:
            return
        if direction == "up" and idx < len(sorted_els) - 1:
            sorted_els[idx].zIndex, sorted_els[idx + 1].zIndex = (
                sorted_els[idx + 1].zIndex,
                sorted_els[idx].zIndex,
            )
        elif direction == "down" and idx > 0:
            sorted_els[idx].zIndex, sorted_els[idx - 1].zIndex = (
                sorted_els[idx - 1].zIndex,
                sorted_els[idx].zIndex,
            )
        self._design.updatedAt = __import__("time").time()
        self.save_history()
        self.design_changed.emit()

    # ── 选择操作 ──

    def select_element(self, element_id: str, multi: bool = False):
        """选择元素"""
        if multi:
            if element_id in self._selected_ids:
                self._selected_ids.remove(element_id)
            else:
                self._selected_ids.append(element_id)
        else:
            self._selected_ids = [element_id]
        self.selection_changed.emit()

    def set_selected_ids(self, ids: list[str]):
        self._selected_ids = ids
        self.selection_changed.emit()

    def deselect_all(self):
        self._selected_ids = []
        self.selection_changed.emit()

    @property
    def selected_element(self) -> Optional[CanvasElement]:
        if len(self._selected_ids) == 1:
            for el in self._design.elements:
                if el.id == self._selected_ids[0]:
                    return el
        return None

    # ── 画布操作 ──

    def set_zoom(self, zoom: float):
        self._design.zoom = max(0.1, min(4.0, zoom))
        self.zoom_changed.emit(self._design.zoom)
        self.design_changed.emit()

    def set_scroll(self, x: float, y: float):
        self._design.scrollX = x
        self._design.scrollY = y

    def set_background(self, background: BackgroundElementProps):
        self._design.background = background
        self._design.updatedAt = __import__("time").time()
        self.save_history()
        self.background_changed.emit()
        self.design_changed.emit()

    def update_design_size(self, width: float, height: float):
        self._design.width = width
        self._design.height = height
        self._design.updatedAt = __import__("time").time()
        self.save_history()
        self.design_changed.emit()

    def update_title(self, title: str):
        self._design.title = title
        self._design.updatedAt = __import__("time").time()
        self.design_changed.emit()

    def set_design(self, design: DesignDocument):
        self._design = design
        self._selected_ids = []
        self.save_history()
        self.design_changed.emit()
        self.selection_changed.emit()


class UIState(QObject):
    """UI 状态管理"""

    active_tool_changed = Signal(str)
    active_panel_changed = Signal(str)  # panel name or ""
    show_export_modal_changed = Signal(bool)
    right_tab_changed = Signal(str)

    def __init__(self, parent: QObject = None):
        super().__init__(parent)
        self._active_tool = "select"
        self._active_panel = ""  # "" means no panel
        self._show_export_modal = False
        self._right_tab = "design"  # 'design' | 'layers'

    @property
    def active_tool(self) -> str:
        return self._active_tool

    @active_tool.setter
    def active_tool(self, value: str):
        if self._active_tool != value:
            self._active_tool = value
            self.active_tool_changed.emit(value)

    @property
    def active_panel(self) -> str:
        return self._active_panel

    @active_panel.setter
    def active_panel(self, value: str):
        if self._active_panel != value:
            self._active_panel = value
            self.active_panel_changed.emit(value)

    @property
    def show_export_modal(self) -> bool:
        return self._show_export_modal

    @show_export_modal.setter
    def show_export_modal(self, value: bool):
        if self._show_export_modal != value:
            self._show_export_modal = value
            self.show_export_modal_changed.emit(value)

    @property
    def right_tab(self) -> str:
        return self._right_tab

    @right_tab.setter
    def right_tab(self, value: str):
        if self._right_tab != value:
            self._right_tab = value
            self.right_tab_changed.emit(value)


# 全局单例
_design_state_instance: Optional[DesignState] = None
_ui_state_instance: Optional[UIState] = None


def get_design_state() -> DesignState:
    global _design_state_instance
    if _design_state_instance is None:
        _design_state_instance = DesignState()
    return _design_state_instance


def get_ui_state() -> UIState:
    global _ui_state_instance
    if _ui_state_instance is None:
        _ui_state_instance = UIState()
    return _ui_state_instance