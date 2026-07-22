import { useState } from 'react';
import { Palette, Image, Layers } from 'lucide-react';
import { NumberInput } from '../common/NumberInput';
import { ColorPicker } from '../common/ColorPicker';
import { useDesignStore } from '@/store/useDesignStore';

const SIZE_PRESETS = [
  { name: '小红书', width: 1080, height: 1440, icon: '📕' },
  { name: '抖音', width: 1080, height: 1920, icon: '🎵' },
  { name: '微信朋友圈', width: 1080, height: 1080, icon: '💬' },
  { name: '海报', width: 750, height: 1334, icon: '🖼️' },
  { name: 'PPT 16:9', width: 1920, height: 1080, icon: '📊' },
  { name: 'PPT 4:3', width: 1440, height: 1080, icon: '📈' },
  { name: '公众号封面', width: 900, height: 383, icon: '📰' },
  { name: 'B 站封面', width: 1146, height: 717, icon: '📺' },
  { name: '微博', width: 1080, height: 1080, icon: '🌐' },
  { name: 'Instagram', width: 1080, height: 1080, icon: '📸' },
  { name: 'Facebook', width: 1200, height: 630, icon: '👥' },
  { name: 'Twitter/X', width: 1200, height: 675, icon: '🐦' },
];

const GRADIENT_PRESETS = [
  { name: '清晨', colors: ['#FFECD2', '#FCB69F'] },
  { name: '日暮', colors: ['#FF6E7F', '#BFE9FF'] },
  { name: '极光', colors: ['#A8EDEA', '#FED6E3'] },
  { name: '海洋', colors: ['#667EEA', '#764BA2'] },
  { name: '森林', colors: ['#11998E', '#38EF7D'] },
  { name: '夕阳', colors: ['#F093FB', '#F5576C'] },
  { name: '深空', colors: ['#0F0C29', '#302B63', '#24243E'] },
  { name: '薰衣草', colors: ['#E0EAFC', '#CFDEF3'] },
];

type BgType = 'solid' | 'gradient' | 'image';

export function DesignProperties() {
  const { design, updateDesignSize, setBackground } = useDesignStore();
  const [bgType, setBgType] = useState<BgType>(
    (design.background.type as BgType) || 'solid'
  );
  const [customWidth, setCustomWidth] = useState(design.width);
  const [customHeight, setCustomHeight] = useState(design.height);

  const handlePresetSize = (width: number, height: number) => {
    setCustomWidth(width);
    setCustomHeight(height);
    updateDesignSize(width, height);
  };

  const handleCustomSize = () => {
    updateDesignSize(customWidth, customHeight);
  };

  const handleBgColorChange = (color: string) => {
    setBackground({ type: 'solid', color });
  };

  const handleGradientChange = (colors: string[]) => {
    setBackground({
      type: 'gradient',
      gradient: {
        type: 'linear',
        colors: colors.map((color, i) => ({
          color,
          offset: i / (colors.length - 1),
        })),
        angle: 135,
      },
    });
  };

  const getBgPreviewStyle = () => {
    const bg = design.background;
    if (bg.type === 'solid') {
      return { backgroundColor: bg.color || '#FFFFFF' };
    }
    if (bg.type === 'gradient' && bg.gradient) {
      const stops = bg.gradient.colors
        .map((c) => `${c.color} ${c.offset * 100}%`)
        .join(', ');
      return {
        background: `linear-gradient(${bg.gradient.angle}deg, ${stops})`,
      };
    }
    if (bg.type === 'image' && bg.image) {
      return { backgroundImage: `url(${bg.image})`, backgroundSize: 'cover' };
    }
    return { backgroundColor: '#FFFFFF' };
  };

  return (
    <div className="p-4 space-y-5 overflow-y-auto">
      {/* 尺寸预设 */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <Layers className="w-4 h-4" />
          画布尺寸
        </h3>

        {/* 当前尺寸预览 */}
        <div
          className="w-full h-24 rounded-lg border border-gray-200 shadow-sm flex items-center justify-center relative overflow-hidden"
          style={getBgPreviewStyle()}
        >
          <span className="bg-black/50 text-white text-xs px-2 py-1 rounded">
            {design.width} × {design.height}
          </span>
        </div>

        {/* 预设尺寸网格 */}
        <div className="grid grid-cols-3 gap-2">
          {SIZE_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handlePresetSize(preset.width, preset.height)}
              className="flex flex-col items-center p-2 rounded-lg border border-gray-200 hover:border-primary-400 hover:bg-primary-50 transition-colors text-left"
            >
              <span className="text-lg mb-1">{preset.icon}</span>
              <span className="text-xs font-medium text-gray-700">{preset.name}</span>
              <span className="text-[10px] text-gray-400">
                {preset.width}×{preset.height}
              </span>
            </button>
          ))}
        </div>

        {/* 自定义尺寸 */}
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-500 font-medium">自定义尺寸</span>
          <div className="grid grid-cols-2 gap-2">
            <NumberInput
              label="宽度"
              value={customWidth}
              onChange={setCustomWidth}
              unit="px"
              min={1}
              max={10000}
            />
            <NumberInput
              label="高度"
              value={customHeight}
              onChange={setCustomHeight}
              unit="px"
              min={1}
              max={10000}
            />
          </div>
          <button
            onClick={handleCustomSize}
            className="w-full h-8 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
          >
            应用尺寸
          </button>
        </div>
      </div>

      {/* 背景设置 */}
      <div className="space-y-3 border-t pt-4">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <Palette className="w-4 h-4" />
          背景设置
        </h3>

        {/* 背景类型切换 */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setBgType('solid')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
              bgType === 'solid'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            纯色
          </button>
          <button
            onClick={() => setBgType('gradient')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
              bgType === 'gradient'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            渐变
          </button>
          <button
            onClick={() => setBgType('image')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
              bgType === 'image'
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            图片
          </button>
        </div>

        {/* 纯色背景 */}
        {bgType === 'solid' && (
          <ColorPicker
            label="背景颜色"
            value={design.background.color || '#FFFFFF'}
            onChange={handleBgColorChange}
          />
        )}

        {/* 渐变背景 */}
        {bgType === 'gradient' && (
          <div className="space-y-2">
            <span className="text-xs text-gray-500 font-medium">渐变预设</span>
            <div className="grid grid-cols-4 gap-2">
              {GRADIENT_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handleGradientChange(preset.colors)}
                  className="w-full h-10 rounded-md border border-gray-200 hover:border-primary-400 transition-colors"
                  style={{
                    background: `linear-gradient(135deg, ${preset.colors.join(', ')})`,
                  }}
                  title={preset.name}
                />
              ))}
            </div>
          </div>
        )}

        {/* 图片背景 */}
        {bgType === 'image' && (
          <div className="space-y-2">
            <div className="flex items-center justify-center w-full h-20 bg-gray-50 border border-dashed border-gray-200 rounded-md">
              <label className="cursor-pointer text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
                <Image className="w-4 h-4" />
                上传背景图片
                <input type="file" accept="image/*" className="hidden" />
              </label>
            </div>
            <input
              type="text"
              placeholder="或输入图片 URL"
              className="w-full h-8 px-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-primary-500 bg-white"
            />
          </div>
        )}
      </div>

      {/* 颜色预设 */}
      <div className="space-y-3 border-t pt-4">
        <h3 className="text-sm font-semibold text-gray-800">快速配色</h3>
        <div className="grid grid-cols-6 gap-1.5">
          {[
            '#FFFFFF', '#F8FAFC', '#F1F5F9', '#E2E8F0', '#CBD5E1', '#94A3B8',
            '#64748B', '#475569', '#334155', '#1E293B', '#0F172A', '#020617',
            '#FEF2F2', '#FEE2E2', '#FECACA', '#FCA5A5', '#F87171', '#EF4444',
            '#FFF7ED', '#FFEDD5', '#FED7AA', '#FDBA74', '#FB923C', '#F97316',
            '#FEFCE8', '#FEF9C3', '#FEF08A', '#FDE047', '#FACC15', '#EAB308',
            '#F7FEE7', '#ECFCCB', '#D9F99D', '#BEF264', '#A3E635', '#84CC16',
            '#F0FDF4', '#DCFCE7', '#BBF7D0', '#86EFAC', '#4ADE80', '#22C55E',
            '#ECFDF5', '#D1FAE5', '#A7F3D0', '#6EE7B7', '#34D399', '#10B981',
            '#F0FDFA', '#CCFBF1', '#99F6E4', '#5EEAD4', '#2DD4BF', '#14B8A6',
            '#ECFEFF', '#CFFAFE', '#A5F3FC', '#67E8F9', '#22D3EE', '#06B6D4',
            '#EFF6FF', '#DBEAFE', '#BFDBFE', '#93C5FD', '#60A5FA', '#3B82F6',
            '#EEF2FF', '#E0E7FF', '#C7D2FE', '#A5B4FC', '#818CF8', '#6366F1',
          ].map((color) => (
            <button
              key={color}
              onClick={() => handleBgColorChange(color)}
              className="w-full aspect-square rounded border border-gray-200 hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
