import { create } from 'zustand';
import type {
  CanvasElement,
  DesignDocument,
  BackgroundElementProps,
  ElementProps,
  ElementType,
  Template,
} from '@inspiration/shared';
import { createDefaultDesign, createDefaultElement, generateId } from '@inspiration/shared';

interface DesignState {
  design: DesignDocument;
  selectedIds: string[];
  history: DesignDocument[];
  historyIndex: number;
}

interface DesignActions {
  setDesign: (design: DesignDocument) => void;
  updateElement: (id: string, partialProps: Partial<ElementProps>) => void;
  addElement: (element: CanvasElement) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string, multi?: boolean) => void;
  setSelectedIds: (ids: string[]) => void;
  deselectAll: () => void;
  clearSelection: () => void;
  moveElement: (id: string, x: number, y: number) => void;
  resizeElement: (
    id: string,
    width: number,
    height: number,
    x?: number,
    y?: number,
  ) => void;
  rotateElement: (id: string, rotation: number) => void;
  undo: () => void;
  redo: () => void;
  saveHistory: () => void;
  setZoom: (zoom: number) => void;
  setScroll: (x: number, y: number) => void;
  setBackground: (background: BackgroundElementProps) => void;
  updateDesignSize: (width: number, height: number) => void;
  // 新增 actions
  updateTitle: (title: string) => void;
  addElementByType: (type: ElementType, x: number, y: number) => void;
  duplicateElement: (id: string) => void;
  moveElementZIndex: (id: string, direction: 'up' | 'down') => void;
  applyTemplate: (template: Template) => void;
}

export type DesignStore = DesignState & DesignActions;

const MAX_HISTORY = 50;

const initialDesign = createDefaultDesign();

export const useDesignStore = create<DesignStore>((set, get) => ({
  design: initialDesign,
  selectedIds: [],
  history: [initialDesign],
  historyIndex: 0,

  setDesign: (design) => {
    set({ design });
    get().saveHistory();
  },

  updateElement: (id, partialProps) => {
    set((state) => ({
      design: {
        ...state.design,
        updatedAt: Date.now(),
        elements: state.design.elements.map((el) =>
          el.id === id
            ? { ...el, props: { ...el.props, ...partialProps } }
            : el
        ),
      },
    }));
  },

  addElement: (element) => {
    set((state) => {
      const maxZIndex = state.design.elements.reduce(
        (max, el) => (el.zIndex > max ? el.zIndex : max),
        0
      );
      return {
        design: {
          ...state.design,
          updatedAt: Date.now(),
          elements: [
            ...state.design.elements,
            { ...element, zIndex: maxZIndex + 1 },
          ],
        },
        selectedIds: [element.id],
      };
    });
    get().saveHistory();
  },

  deleteElement: (id) => {
    set((state) => ({
      design: {
        ...state.design,
        updatedAt: Date.now(),
        elements: state.design.elements.filter((el) => el.id !== id),
      },
      selectedIds: state.selectedIds.filter((sid) => sid !== id),
    }));
    get().saveHistory();
  },

  selectElement: (id, multi = false) => {
    set((state) => {
      if (multi) {
        const isSelected = state.selectedIds.includes(id);
        return {
          selectedIds: isSelected
            ? state.selectedIds.filter((sid) => sid !== id)
            : [...state.selectedIds, id],
        };
      }
      return { selectedIds: [id] };
    });
  },

  setSelectedIds: (ids) => {
    set({ selectedIds: ids });
  },

  deselectAll: () => {
    set({ selectedIds: [] });
  },

  clearSelection: () => {
    set({ selectedIds: [] });
  },

  moveElement: (id, x, y) => {
    set((state) => ({
      design: {
        ...state.design,
        updatedAt: Date.now(),
        elements: state.design.elements.map((el) =>
          el.id === id
            ? { ...el, props: { ...el.props, x, y } }
            : el
        ),
      },
    }));
  },

  resizeElement: (id, width, height, x, y) => {
    set((state) => ({
      design: {
        ...state.design,
        updatedAt: Date.now(),
        elements: state.design.elements.map((el) =>
          el.id === id
            ? {
                ...el,
                props: {
                  ...el.props,
                  width: Math.max(1, width),
                  height: Math.max(1, height),
                  ...(x !== undefined ? { x } : {}),
                  ...(y !== undefined ? { y } : {}),
                },
              }
            : el
        ),
      },
    }));
  },

  rotateElement: (id, rotation) => {
    set((state) => ({
      design: {
        ...state.design,
        updatedAt: Date.now(),
        elements: state.design.elements.map((el) =>
          el.id === id
            ? { ...el, props: { ...el.props, rotation } }
            : el
        ),
      },
    }));
  },

  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      set({
        design: { ...history[newIndex] },
        historyIndex: newIndex,
      });
    }
  },

  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      set({
        design: { ...history[newIndex] },
        historyIndex: newIndex,
      });
    }
  },

  saveHistory: () => {
    set((state) => {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push({ ...state.design });
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
      }
      return {
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  },

  setZoom: (zoom) => {
    set((state) => ({
      design: { ...state.design, zoom: Math.max(0.1, Math.min(4, zoom)) },
    }));
  },

  setScroll: (x, y) => {
    set((state) => ({
      design: { ...state.design, scrollX: x, scrollY: y },
    }));
  },

  setBackground: (background) => {
    set((state) => ({
      design: {
        ...state.design,
        background,
        updatedAt: Date.now(),
      },
    }));
    get().saveHistory();
  },

  updateDesignSize: (width, height) => {
    set((state) => ({
      design: {
        ...state.design,
        width,
        height,
        updatedAt: Date.now(),
      },
    }));
    get().saveHistory();
  },

  // 新增 actions

  updateTitle: (title) => {
    set((state) => ({
      design: {
        ...state.design,
        title,
        updatedAt: Date.now(),
      },
    }));
  },

  addElementByType: (type, x, y) => {
    const element = createDefaultElement(type, x, y);
    get().addElement(element);
  },

  duplicateElement: (id) => {
    const { design } = get();
    const element = design.elements.find((el) => el.id === id);
    if (!element) return;

    const newElement: CanvasElement = {
      ...element,
      id: generateId(),
      name: `${element.name} 副本`,
      props: {
        ...element.props,
        x: element.props.x + 20,
        y: element.props.y + 20,
      },
    };

    get().addElement(newElement);
  },

  moveElementZIndex: (id, direction) => {
    set((state) => {
      const elements = [...state.design.elements];
      const index = elements.findIndex((el) => el.id === id);
      if (index === -1) return {};

      const sorted = elements.sort((a, b) => a.zIndex - b.zIndex);
      const sortedIndex = sorted.findIndex((el) => el.id === id);

      if (direction === 'up' && sortedIndex < sorted.length - 1) {
        const nextEl = sorted[sortedIndex + 1];
        const tempZ = elements[index].zIndex;
        const nextIndex = elements.findIndex((el) => el.id === nextEl.id);
        elements[index] = { ...elements[index], zIndex: nextEl.zIndex };
        elements[nextIndex] = { ...elements[nextIndex], zIndex: tempZ };
      } else if (direction === 'down' && sortedIndex > 0) {
        const prevEl = sorted[sortedIndex - 1];
        const tempZ = elements[index].zIndex;
        const prevIndex = elements.findIndex((el) => el.id === prevEl.id);
        elements[index] = { ...elements[index], zIndex: prevEl.zIndex };
        elements[prevIndex] = { ...elements[prevIndex], zIndex: tempZ };
      }

      return {
        design: {
          ...state.design,
          elements,
          updatedAt: Date.now(),
        },
      };
    });
    get().saveHistory();
  },

  applyTemplate: (template) => {
    const newDesign: DesignDocument = {
      ...createDefaultDesign(),
      id: generateId(),
      title: template.name,
      width: template.width,
      height: template.height,
      background: template.background,
      elements: template.elements.map((el) => ({ ...el, id: generateId() })),
      templateId: template.id,
    };
    set({ design: newDesign, selectedIds: [] });
    get().saveHistory();
  },
}));
