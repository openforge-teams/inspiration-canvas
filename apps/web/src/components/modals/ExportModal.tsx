import { useState } from 'react';
import {
  X,
  Download,
  FileImage,
  FileText,
  Image as ImageIcon,
  FileCode,
  Check,
} from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useDesignStore } from '@/store/useDesignStore';
import { getStage } from '@/store/stageRef';
import type { ExportFormat } from '@inspiration/shared';

interface FormatOption {
  id: ExportFormat;
  icon: typeof FileImage;
  label: string;
  description: string;
}

const FORMAT_OPTIONS: FormatOption[] = [
  { id: 'png', icon: FileImage, label: 'PNG', description: '无损压缩，支持透明背景' },
  { id: 'jpg', icon: ImageIcon, label: 'JPG', description: '有损压缩，文件较小' },
  { id: 'pdf', icon: FileText, label: 'PDF', description: '矢量文档，适合打印' },
  { id: 'svg', icon: FileCode, label: 'SVG', description: '矢量格式，无限缩放' },
];

const SCALE_OPTIONS = [0.5, 1, 2, 3];

export function ExportModal() {
  const { showExportModal, setShowExportModal } = useUIStore();
  const { design } = useDesignStore();
  const [format, setFormat] = useState<ExportFormat>('png');
  const [quality, setQuality] = useState(90);
  const [scale, setScale] = useState(2);
  const [transparent, setTransparent] = useState(false);
  const [includeMargin, setIncludeMargin] = useState(false);
  const [margin, setMargin] = useState(20);
  const [isExporting, setIsExporting] = useState(false);

  if (!showExportModal) return null;

  const handleClose = () => {
    setShowExportModal(false);
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // 等待下一帧确保画布渲染完成
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

      const stage = getStage();
      if (!stage) {
        throw new Error('无法获取画布实例');
      }

      const marginPx = includeMargin ? margin * scale : 0;
      const exportW = design.width * scale + marginPx * 2;
      const exportH = design.height * scale + marginPx * 2;

      // 使用 Konva 的 toDataURL 方法精确导出设计区域
      // 这会以指定的 pixelRatio 渲染整个设计画布，不受视口缩放/位置影响
      const designDataUrl = stage.toDataURL({
        x: 0,
        y: 0,
        width: design.width,
        height: design.height,
        pixelRatio: scale,
        mimeType: format === 'jpg' ? 'image/jpeg' : 'image/png',
        quality: format === 'jpg' ? quality / 100 : undefined,
      });

      // 如果不需要边距且格式为 PNG/JPG，直接下载 Konva 生成的图片
      if (marginPx === 0 && (format === 'png' || format === 'jpg')) {
        const filename = `${design.title || 'design'}.${format}`;
        const link = document.createElement('a');
        link.download = filename;
        link.href = designDataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsExporting(false);
        handleClose();
        return;
      }

      // 需要边距或透明背景处理：创建合成 canvas
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = designDataUrl;
      });

      const exportCanvas = document.createElement('canvas');
      const ctx = exportCanvas.getContext('2d');
      if (!ctx) throw new Error('无法创建导出画布');

      exportCanvas.width = exportW;
      exportCanvas.height = exportH;

      // 绘制背景（透明选项处理）
      const shouldFillBg = !transparent || format === 'jpg';
      if (shouldFillBg) {
        ctx.fillStyle = design.background.type === 'solid'
          ? (design.background.color || '#FFFFFF')
          : '#FFFFFF';
        ctx.fillRect(0, 0, exportW, exportH);
      }

      // 绘制设计内容（带边距）
      ctx.drawImage(img, marginPx, marginPx, design.width * scale, design.height * scale);

      // 根据格式导出
      let dataUrl: string;
      let filename: string;

      if (format === 'png') {
        dataUrl = exportCanvas.toDataURL('image/png');
        filename = `${design.title || 'design'}.png`;
      } else if (format === 'jpg') {
        dataUrl = exportCanvas.toDataURL('image/jpeg', quality / 100);
        filename = `${design.title || 'design'}.jpg`;
      } else if (format === 'svg') {
        // SVG 导出：创建一个包含 canvas 图像的 SVG
        const pngDataUrl = exportCanvas.toDataURL('image/png');
        const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${exportW}" height="${exportH}" viewBox="0 0 ${exportW} ${exportH}">
  <image href="${pngDataUrl}" width="${exportW}" height="${exportH}"/>
</svg>`;
        dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgContent);
        filename = `${design.title || 'design'}.svg`;
      } else if (format === 'pdf') {
        // 动态导入 jsPDF
        const { default: jsPDF } = await import('jspdf');
        const pdf = new jsPDF({
          orientation: exportW > exportH ? 'landscape' : 'portrait',
          unit: 'px',
          format: [exportW, exportH],
        });
        const imgData = exportCanvas.toDataURL('image/jpeg', quality / 100);
        pdf.addImage(imgData, 'JPEG', 0, 0, exportW, exportH);
        pdf.save(`${design.title || 'design'}.pdf`);
        setIsExporting(false);
        handleClose();
        return;
      } else {
        throw new Error('不支持的导出格式');
      }

      // 触发下载
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请重试');
    }

    setIsExporting(false);
    handleClose();
  };

  const exportWidth = design.width * scale;
  const exportHeight = design.height * scale;
  const totalMargin = includeMargin ? margin * 2 : 0;
  const finalWidth = exportWidth + totalMargin;
  const finalHeight = exportHeight + totalMargin;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* 弹窗内容 */}
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <Download className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">导出设计</h2>
              <p className="text-sm text-gray-500">选择导出格式和参数</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 内容区 */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* 格式选择 */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-3">导出格式</label>
            <div className="grid grid-cols-2 gap-3">
              {FORMAT_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = format === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => setFormat(option.id)}
                    className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50/50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                        isSelected ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className={`font-medium ${isSelected ? 'text-primary-700' : 'text-gray-800'}`}>
                      {option.label}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 缩放设置 */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-3">导出缩放</label>
            <div className="flex gap-2">
              {SCALE_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setScale(s)}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg border transition-colors ${
                    scale === s
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              输出尺寸: {finalWidth} × {finalHeight} px
            </p>
          </div>

          {/* 质量设置 (仅 JPG) */}
          {format === 'jpg' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">图片质量</label>
                <span className="text-sm text-gray-500">{quality}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                step={5}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>低质量</span>
                <span>高质量</span>
              </div>
            </div>
          )}

          {/* 透明背景 (仅 PNG/SVG) */}
          {(format === 'png' || format === 'svg') && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-700">透明背景</p>
                <p className="text-xs text-gray-500">移除画布背景色</p>
              </div>
              <button
                onClick={() => setTransparent(!transparent)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  transparent ? 'bg-primary-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    transparent ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          )}

          {/* 边距设置 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-700">添加边距</p>
                <p className="text-xs text-gray-500">在设计周围添加空白边距</p>
              </div>
              <button
                onClick={() => setIncludeMargin(!includeMargin)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  includeMargin ? 'bg-primary-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    includeMargin ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            {includeMargin && (
              <div className="pl-3">
                <label className="text-xs text-gray-500 block mb-1.5">边距大小 (px)</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0</span>
                  <span>{margin}px</span>
                  <span>100</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 底部操作 */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <div className="text-sm text-gray-500">
            画布尺寸: {design.width} × {design.height} px
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  导出中...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  导出 {format.toUpperCase()}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
