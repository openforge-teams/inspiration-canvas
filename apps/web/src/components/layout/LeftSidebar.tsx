import {
  MousePointer2,
  Type,
  Image,
  Shapes,
  Minus,
  LayoutTemplate,
  Folder,
  Layers,
} from 'lucide-react';
import { useUIStore, type ToolType, type PanelType } from '@/store/useUIStore';

interface ToolItem {
  id: ToolType;
  icon: typeof MousePointer2;
  label: string;
}

const TOOLS: ToolItem[] = [
  { id: 'select', icon: MousePointer2, label: '选择' },
  { id: 'text', icon: Type, label: '文本' },
  { id: 'image', icon: Image, label: '图片' },
  { id: 'shape', icon: Shapes, label: '形状' },
  { id: 'line', icon: Minus, label: '线条' },
];

interface PanelItem {
  id: PanelType;
  icon: typeof LayoutTemplate;
  label: string;
}

const PANELS: PanelItem[] = [
  { id: 'templates', icon: LayoutTemplate, label: '模板' },
  { id: 'assets', icon: Folder, label: '素材' },
  { id: 'pages', icon: Layers, label: '页面' },
];

export function LeftSidebar() {
  const { activeTool, setActiveTool, activePanel, setActivePanel } = useUIStore();

  const handleToolClick = (tool: ToolType) => {
    setActiveTool(activeTool === tool ? 'select' : tool);
  };

  const handlePanelClick = (panel: PanelType) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  return (
    <aside className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-3 gap-1 flex-shrink-0">
      {/* 工具按钮组 */}
      <div className="flex flex-col items-center gap-0.5 p-1.5 bg-gray-50 rounded-xl">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              className={`group relative w-11 h-11 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all ${
                isActive
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-200'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
              }`}
              title={tool.label}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{tool.label}</span>
            </button>
          );
        })}
      </div>

      {/* 分隔线 */}
      <div className="w-8 h-px bg-gray-200 my-2" />

      {/* 底部面板切换 */}
      <div className="flex-1 flex flex-col items-center justify-end gap-0.5">
        {PANELS.map((panel) => {
          const Icon = panel.icon;
          const isActive = activePanel === panel.id;
          return (
            <button
              key={panel.id}
              onClick={() => handlePanelClick(panel.id)}
              className={`group relative w-11 h-11 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all ${
                isActive
                  ? 'bg-primary-50 text-primary-600 border border-primary-200'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
              title={panel.label}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{panel.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
