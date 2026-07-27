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
import { TemplatePanel } from '../panels/TemplatePanel';

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

function AssetPanel() {
  const assets = [
    { id: 'asset-001', name: '山脉风景', type: 'image', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200' },
    { id: 'asset-002', name: '城市夜景', type: 'image', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=200' },
    { id: 'asset-003', name: '海洋日落', type: 'image', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200' },
    { id: 'asset-004', name: '森林小径', type: 'image', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=200' },
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="px-4 py-3 border-b border-gray-100">
        <span className="text-sm font-medium text-gray-800">素材库</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-2 gap-2">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="group cursor-pointer rounded-lg border border-gray-200 overflow-hidden hover:border-primary-400 hover:shadow-md transition-all"
            >
              <div className="w-full aspect-video bg-gray-100 overflow-hidden">
                <img
                  src={asset.url}
                  alt={asset.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  loading="lazy"
                />
              </div>
              <div className="px-2 py-1.5">
                <p className="text-xs font-medium text-gray-700 truncate">{asset.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PagePanel() {
  return (
    <div className="h-full flex flex-col bg-white">
      <div className="px-4 py-3 border-b border-gray-100">
        <span className="text-sm font-medium text-gray-800">页面</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-center text-gray-400">
          <Layers className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p className="text-sm">暂无页面</p>
          <p className="text-xs mt-1">创建新页面以管理多页设计</p>
        </div>
        <button className="w-full mt-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
          + 新建页面
        </button>
      </div>
    </div>
  );
}

export function LeftSidebar() {
  const { activeTool, setActiveTool, activePanel, setActivePanel } = useUIStore();

  const handleToolClick = (tool: ToolType) => {
    setActiveTool(activeTool === tool ? 'select' : tool);
  };

  const handlePanelClick = (panel: PanelType) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  const renderPanel = () => {
    if (!activePanel) return null;
    switch (activePanel) {
      case 'templates':
        return <TemplatePanel />;
      case 'assets':
        return <AssetPanel />;
      case 'pages':
        return <PagePanel />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-shrink-0">
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

      {/* 面板内容区 */}
      {activePanel && (
        <div className="w-64 border-r border-gray-200 flex-shrink-0 overflow-hidden">
          {renderPanel()}
        </div>
      )}
    </div>
  );
}
