import { useState } from 'react';
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Share2,
  Download,
  Sparkles,
  Edit3,
  Check,
} from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useDesignStore } from '@/store/useDesignStore';

export function Header() {
  const { setShowExportModal } = useUIStore();
  const { design, updateTitle, setZoom, undo, redo, historyIndex, history } = useDesignStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(design.title);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const zoom = design.zoom;

  const handleTitleSubmit = () => {
    if (titleInput.trim()) {
      updateTitle(titleInput.trim());
    } else {
      setTitleInput(design.title);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setTitleInput(design.title);
      setIsEditingTitle(false);
    }
  };

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.1, 4));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.1, 0.1));
  };

  const handleZoomReset = () => {
    setZoom(1);
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
      {/* 左侧：Logo + 标题 */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-gray-800 text-lg">灵感画布</span>
        </div>

        <div className="h-6 w-px bg-gray-200" />

        {/* 可编辑标题 */}
        <div className="flex items-center gap-1.5 group">
          {isEditingTitle ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={handleTitleKeyDown}
                autoFocus
                className="h-7 px-2 text-sm font-medium text-gray-800 bg-gray-50 border border-primary-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-200 w-48"
              />
              <button
                onClick={handleTitleSubmit}
                className="p-1 rounded hover:bg-gray-100 text-primary-600"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setTitleInput(design.title);
                setIsEditingTitle(true);
              }}
              className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
            >
              <span className="text-sm font-medium text-gray-800">{design.title}</span>
              <Edit3 className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </div>
      </div>

      {/* 中间：撤销/重做 + 缩放 */}
      <div className="flex items-center gap-2">
        {/* 撤销重做 */}
        <div className="flex items-center gap-0.5 p-1 bg-gray-50 rounded-lg">
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`p-1.5 rounded-md transition-colors ${
              canUndo
                ? 'text-gray-600 hover:bg-white hover:shadow-sm'
                : 'text-gray-300 cursor-not-allowed'
            }`}
            title="撤销 (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className={`p-1.5 rounded-md transition-colors ${
              canRedo
                ? 'text-gray-600 hover:bg-white hover:shadow-sm'
                : 'text-gray-300 cursor-not-allowed'
            }`}
            title="重做 (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* 缩放控制 */}
        <div className="flex items-center gap-1 p-1 bg-gray-50 rounded-lg">
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-md text-gray-600 hover:bg-white hover:shadow-sm transition-colors"
            title="缩小"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomReset}
            className="px-2 py-1 text-xs font-medium text-gray-700 hover:bg-white hover:shadow-sm rounded-md transition-colors min-w-[48px]"
            title="重置缩放"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-md text-gray-600 hover:bg-white hover:shadow-sm transition-colors"
            title="放大"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 右侧：分享/导出 */}
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
          <Share2 className="w-4 h-4" />
          分享
        </button>
        <button
          onClick={() => setShowExportModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          导出
        </button>
      </div>
    </header>
  );
}
