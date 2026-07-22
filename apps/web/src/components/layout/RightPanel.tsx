import { Palette, Layers } from 'lucide-react';
import { useUIStore, type RightTabType } from '@/store/useUIStore';
import { ElementProperties } from '../panels/ElementProperties';
import { DesignProperties } from '../panels/DesignProperties';
import { LayerPanel } from '../panels/LayerPanel';

interface TabItem {
  id: RightTabType;
  icon: typeof Palette;
  label: string;
}

const TABS: TabItem[] = [
  { id: 'design', icon: Palette, label: '设计' },
  { id: 'layers', icon: Layers, label: '图层' },
];

export function RightPanel() {
  const { rightTab, setRightTab, selectedElementId } = useUIStore();

  return (
    <aside className="w-72 bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
      {/* 标签页切换 */}
      <div className="flex border-b border-gray-200 flex-shrink-0">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = rightTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setRightTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors relative ${
                isActive
                  ? 'text-primary-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* 面板内容 */}
      <div className="flex-1 overflow-hidden">
        {rightTab === 'design' && (
          <div className="h-full overflow-y-auto">
            {selectedElementId ? <ElementProperties /> : <DesignProperties />}
          </div>
        )}
        {rightTab === 'layers' && <LayerPanel />}
      </div>
    </aside>
  );
}
