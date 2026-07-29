import {
  MousePointer2,
  Type,
  Image,
  Shapes,
  Minus,
  LayoutTemplate,
  Folder,
  Layers,
  Square,
  Circle,
  Triangle,
  Star,
  ArrowRight,
} from 'lucide-react';
import { useUIStore, type ToolType, type PanelType } from '@/store/useUIStore';
import { useDesignStore } from '@/store/useDesignStore';
import { TemplatePanel } from '../panels/TemplatePanel';
import { createDefaultElement, type ShapeType } from '@inspiration/shared';

interface ToolItem {
  id: ToolType;
  icon: typeof MousePointer2;
  label: string;
  panel: PanelType;
}

const TOOLS: ToolItem[] = [
  { id: 'select', icon: MousePointer2, label: '选择', panel: null },
  { id: 'text', icon: Type, label: '文本', panel: 'text' },
  { id: 'image', icon: Image, label: '图片', panel: 'assets' },
  { id: 'shape', icon: Shapes, label: '形状', panel: 'shapes' },
  { id: 'line', icon: Minus, label: '线条', panel: null },
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

// ─── 文本预设面板 ───
interface TextPreset {
  label: string;
  fontSize: number;
  fontWeight: number;
  text: string;
  name: string;
}

const TEXT_PRESETS: TextPreset[] = [
  { label: '大标题', name: '大标题', text: '大标题', fontSize: 48, fontWeight: 700 },
  { label: '标题', name: '标题', text: '标题', fontSize: 36, fontWeight: 600 },
  { label: '副标题', name: '副标题', text: '副标题', fontSize: 28, fontWeight: 500 },
  { label: '正文', name: '正文', text: '正文内容', fontSize: 18, fontWeight: 400 },
  { label: '小字', name: '小字', text: '小字说明', fontSize: 14, fontWeight: 400 },
];

function TextPanel() {
  const { addElement, design } = useDesignStore();
  const { setActiveTool, setActivePanel } = useUIStore();

  const handleAddText = (preset: TextPreset) => {
    const elWidth = preset.fontSize * preset.text.length * 0.6;
    const elHeight = preset.fontSize * 1.4;
    const offset = design.elements.length * 25;
    const x = design.width / 2 - elWidth / 2 + offset;
    const y = design.height / 2 - elHeight / 2 + offset;
    const element = createDefaultElement('text', x, y);
    element.props = {
      ...element.props,
      text: preset.text,
      fontSize: preset.fontSize,
      fontWeight: preset.fontWeight,
      width: elWidth,
      height: elHeight,
    } as any;
    element.name = preset.name;
    addElement(element);
    setActiveTool('select');
    setActivePanel(null);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="px-4 py-3 border-b border-gray-100">
        <span className="text-sm font-medium text-gray-800">文本预设</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {TEXT_PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => handleAddText(preset)}
            className="w-full px-4 py-3 text-left rounded-lg border border-gray-200 hover:border-primary-400 hover:bg-primary-50 transition-all"
          >
            <span
              className="block text-gray-800"
              style={{
                fontSize: `${Math.min(preset.fontSize, 24)}px`,
                fontWeight: preset.fontWeight,
              }}
            >
              {preset.text}
            </span>
            <span className="text-xs text-gray-400 mt-1 block">
              {preset.fontSize}px · {preset.fontWeight === 700 ? '粗体' : preset.fontWeight === 600 ? '半粗' : preset.fontWeight === 500 ? '中等' : '常规'}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── 形状预设面板 ───
interface ShapePreset {
  shapeType: ShapeType;
  name: string;
  icon: typeof Square;
}

const SHAPE_PRESETS: ShapePreset[] = [
  { shapeType: 'rect', name: '矩形', icon: Square },
  { shapeType: 'circle', name: '圆形', icon: Circle },
  { shapeType: 'triangle', name: '三角形', icon: Triangle },
  { shapeType: 'star', name: '星形', icon: Star },
  { shapeType: 'arrow', name: '箭头', icon: ArrowRight },
];

function ShapePanel() {
  const { addElement, design } = useDesignStore();
  const { setActiveTool, setActivePanel } = useUIStore();

  const handleAddShape = (preset: ShapePreset) => {
    const offset = design.elements.length * 25;
    const x = design.width / 2 - 75 + offset;
    const y = design.height / 2 - 75 + offset;
    const element = createDefaultElement('shape', x, y);
    element.props = {
      ...element.props,
      shapeType: preset.shapeType,
    } as any;
    element.name = preset.name;
    addElement(element);
    setActiveTool('select');
    setActivePanel(null);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="px-4 py-3 border-b border-gray-100">
        <span className="text-sm font-medium text-gray-800">形状库</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-2 gap-2">
          {SHAPE_PRESETS.map((preset) => {
            const Icon = preset.icon;
            return (
              <button
                key={preset.shapeType}
                onClick={() => handleAddShape(preset)}
                className="flex flex-col items-center justify-center gap-2 py-4 rounded-lg border border-gray-200 hover:border-primary-400 hover:bg-primary-50 transition-all"
              >
                <Icon className="w-7 h-7 text-gray-600" />
                <span className="text-xs font-medium text-gray-600">{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── 素材库面板（图片） ───
function AssetPanel() {
  const { addElement, design } = useDesignStore();
  const { setActiveTool, setActivePanel } = useUIStore();
  const assets = [
    { id: 'asset-001', name: '山脉风景', type: 'image', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200' },
    { id: 'asset-002', name: '城市夜景', type: 'image', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=200' },
    { id: 'asset-003', name: '海洋日落', type: 'image', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200' },
    { id: 'asset-004', name: '森林小径', type: 'image', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=200' },
  ];

  const handleAddImage = (asset: typeof assets[0]) => {
    const offset = design.elements.length * 25;
    const x = design.width / 2 - 150 + offset;
    const y = design.height / 2 - 100 + offset;
    const element = createDefaultElement('image', x, y);
    element.props = {
      ...element.props,
      src: asset.url.replace('w=200', 'w=800'),
    } as any;
    element.name = asset.name;
    addElement(element);
    setActiveTool('select');
    setActivePanel(null);
  };

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
              onClick={() => handleAddImage(asset)}
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
        {/* 上传本地图片 */}
        <button
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (ev) => {
              const file = (ev.target as HTMLInputElement).files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                  const imgSrc = reader.result as string;
                  const offset = design.elements.length * 25;
                  const x = design.width / 2 - 150 + offset;
                  const y = design.height / 2 - 100 + offset;
                  const element = createDefaultElement('image', x, y);
                  element.props = { ...element.props, src: imgSrc } as any;
                  element.name = file.name;
                  addElement(element);
                  setActiveTool('select');
                  setActivePanel(null);
                };
                reader.readAsDataURL(file);
              }
            };
            input.click();
          }}
          className="w-full mt-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
        >
          + 上传本地图片
        </button>
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
    if (activeTool === tool) {
      // 再次点击同一个工具：切回选择，关闭面板
      setActiveTool('select');
      const toolItem = TOOLS.find((t) => t.id === tool);
      if (toolItem?.panel) {
        setActivePanel(null);
      }
    } else {
      // 切换到新工具，并打开对应面板
      setActiveTool(tool);
      const toolItem = TOOLS.find((t) => t.id === tool);
      if (toolItem?.panel) {
        setActivePanel(toolItem.panel);
      }
    }
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
      case 'text':
        return <TextPanel />;
      case 'shapes':
        return <ShapePanel />;
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
