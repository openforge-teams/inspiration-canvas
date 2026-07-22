import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Type,
  Image,
  Square,
  Minus,
  ChevronUp,
  ChevronDown,
  Trash2,
  Copy,
} from 'lucide-react';
import { useDesignStore } from '@/store/useDesignStore';
import { useUIStore } from '@/store/useUIStore';
import type { CanvasElement } from '@inspiration/shared';

function getTypeIcon(type: CanvasElement['type']) {
  switch (type) {
    case 'text':
      return Type;
    case 'image':
      return Image;
    case 'shape':
      return Square;
    case 'line':
      return Minus;
    default:
      return Square;
  }
}

function getTypeLabel(type: CanvasElement['type']) {
  switch (type) {
    case 'text':
      return '文本';
    case 'image':
      return '图片';
    case 'shape':
      return '形状';
    case 'line':
      return '线条';
    default:
      return '元素';
  }
}

export function LayerPanel() {
  const { design, updateElement, deleteElement, duplicateElement, moveElementZIndex } =
    useDesignStore();
  const { selectedElementId, setSelectedElementId } = useUIStore();

  const sortedElements = [...design.elements].sort((a, b) => b.zIndex - a.zIndex);

  const handleToggleVisibility = (e: React.MouseEvent, element: CanvasElement) => {
    e.stopPropagation();
    updateElement(element.id, { visible: !element.props.visible });
  };

  const handleToggleLock = (e: React.MouseEvent, element: CanvasElement) => {
    e.stopPropagation();
    updateElement(element.id, { locked: !element.props.locked });
  };

  const handleSelect = (element: CanvasElement) => {
    setSelectedElementId(element.id);
  };

  if (sortedElements.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-gray-400">
          <Square className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p className="text-sm">暂无图层</p>
          <p className="text-xs mt-1">添加元素后将显示在这里</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* 头部 */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-800">
          图层 ({sortedElements.length})
        </span>
      </div>

      {/* 图层列表 */}
      <div className="flex-1 overflow-y-auto py-1">
        {sortedElements.map((element) => {
          const Icon = getTypeIcon(element.type);
          const isSelected = selectedElementId === element.id;

          return (
            <div
              key={element.id}
              onClick={() => handleSelect(element)}
              className={`group mx-2 my-0.5 px-2 py-2 rounded-md cursor-pointer flex items-center gap-2 transition-colors ${
                isSelected
                  ? 'bg-primary-50 border border-primary-200'
                  : 'hover:bg-gray-50 border border-transparent'
              }`}
            >
              {/* 可见性切换 */}
              <button
                onClick={(e) => handleToggleVisibility(e, element)}
                className="p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 flex-shrink-0"
                title={element.props.visible ? '隐藏' : '显示'}
              >
                {element.props.visible ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
              </button>

              {/* 类型图标 */}
              <div
                className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${
                  isSelected ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>

              {/* 名称 */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm truncate ${
                    !element.props.visible ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  {element.name}
                </p>
                <p className="text-[10px] text-gray-400">{getTypeLabel(element.type)}</p>
              </div>

              {/* 操作按钮 - 默认隐藏，hover 显示 */}
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveElementZIndex(element.id, 'up');
                  }}
                  className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
                  title="上移一层"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveElementZIndex(element.id, 'down');
                  }}
                  className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
                  title="下移一层"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateElement(element.id);
                  }}
                  className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600"
                  title="复制"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteElement(element.id);
                  }}
                  className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-500"
                  title="删除"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 锁定切换 */}
              <button
                onClick={(e) => handleToggleLock(e, element)}
                className={`p-0.5 rounded hover:bg-gray-200 flex-shrink-0 ${
                  element.props.locked ? 'text-amber-500' : 'text-gray-300 hover:text-gray-500'
                }`}
                title={element.props.locked ? '解锁' : '锁定'}
              >
                {element.props.locked ? (
                  <Lock className="w-3.5 h-3.5" />
                ) : (
                  <Unlock className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
