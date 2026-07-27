import { create } from 'zustand';

export type ActiveTool = 'select' | 'text' | 'image' | 'shape' | 'line';
export type ActivePanel = 'templates' | 'assets' | 'pages' | 'text' | 'shapes' | null;
export type RightTabType = 'design' | 'layers';

// 类型别名兼容
export type ToolType = ActiveTool;
export type PanelType = ActivePanel;

interface UIState {
  activeTool: ActiveTool;
  activePanel: ActivePanel;
  showExportModal: boolean;
  selectedElementId: string | null;
  rightTab: RightTabType;
}

interface UIActions {
  setActiveTool: (tool: ActiveTool) => void;
  setActivePanel: (panel: ActivePanel) => void;
  setShowExportModal: (show: boolean) => void;
  setSelectedElementId: (id: string | null) => void;
  setRightTab: (tab: RightTabType) => void;
}

export type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>((set) => ({
  activeTool: 'select',
  activePanel: null,
  showExportModal: false,
  selectedElementId: null,
  rightTab: 'design',

  setActiveTool: (tool) => set({ activeTool: tool }),
  setActivePanel: (panel) => set({ activePanel: panel }),
  setShowExportModal: (show) => set({ showExportModal: show }),
  setSelectedElementId: (id) => set({ selectedElementId: id }),
  setRightTab: (tab) => set({ rightTab: tab }),
}));
