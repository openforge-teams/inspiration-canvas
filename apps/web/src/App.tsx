import { Undo2, Redo2, ZoomIn, ZoomOut } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { RightPanel } from '@/components/layout/RightPanel';
import { DesignCanvas } from '@/components/canvas/DesignCanvas';
import { ExportModal } from '@/components/modals/ExportModal';
import { useDesignStore } from '@/store/useDesignStore';
import { useUIStore } from '@/store/useUIStore';

function App() {
  const { design, undo, redo, setZoom, historyIndex, history } = useDesignStore();
  const { showExportModal } = useUIStore();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const zoomPercent = Math.round(design.zoom * 100);

  const handleZoomIn = () => {
    setZoom(design.zoom + 0.1);
  };

  const handleZoomOut = () => {
    setZoom(design.zoom - 0.1);
  };

  const handleZoomReset = () => {
    setZoom(1);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-100">
      {/* 顶部 Header */}
      <Header />

      {/* 主体区域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧边栏 */}
        <LeftSidebar />

        {/* 中间画布区域 */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* 顶部工具栏：撤销/重做 + 缩放显示 */}
          <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center gap-1">
              <button
                onClick={undo}
                disabled={!canUndo}
                className={`p-2 rounded-lg transition-colors ${
                  canUndo
                    ? 'text-gray-600 hover:bg-gray-100'
                    : 'text-gray-300 cursor-not-allowed'
                }`}
                title="撤销 (Ctrl+Z)"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                className={`p-2 rounded-lg transition-colors ${
                  canRedo
                    ? 'text-gray-600 hover:bg-gray-100'
                    : 'text-gray-300 cursor-not-allowed'
                }`}
                title="重做 (Ctrl+Shift+Z)"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">
                {zoomPercent}%
              </span>
            </div>
          </div>

          {/* DesignCanvas 组件 */}
          <div className="flex-1 overflow-hidden">
            <DesignCanvas />
          </div>

          {/* 底部状态栏 */}
          <div className="flex items-center justify-between px-4 py-1.5 bg-white border-t border-gray-200 text-xs text-gray-500 flex-shrink-0">
            <div className="flex items-center gap-4">
              <span>
                {design.width} × {design.height}
              </span>
              <span className="text-gray-400">|</span>
              <span>{design.elements.length} 个元素</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                title="缩小"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleZoomReset}
                className="px-2 py-0.5 rounded hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-colors min-w-[44px] text-center font-medium"
                title="重置缩放"
              >
                {zoomPercent}%
              </button>
              <button
                onClick={handleZoomIn}
                className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                title="放大"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </main>

        {/* 右侧面板 */}
        <RightPanel />
      </div>

      {/* 导出弹窗 */}
      {showExportModal && <ExportModal />}
    </div>
  );
}

export default App;
