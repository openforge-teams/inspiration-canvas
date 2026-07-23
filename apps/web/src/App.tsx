import { Header } from '@/components/layout/Header';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { RightPanel } from '@/components/layout/RightPanel';
import { DesignCanvas } from '@/components/canvas/DesignCanvas';
import { ExportModal } from '@/components/modals/ExportModal';
import { useDesignStore } from '@/store/useDesignStore';
import { useUIStore } from '@/store/useUIStore';

function App() {
  const { design } = useDesignStore();
  const { showExportModal } = useUIStore();

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
            <div className="flex items-center gap-4">
              <span className="text-gray-400">
                {Math.round(design.zoom * 100)}%
              </span>
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
