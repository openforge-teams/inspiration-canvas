import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch';
import Slider from '@mui/material/Slider';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import CloseIcon from '@mui/icons-material/Close';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CodeIcon from '@mui/icons-material/Code';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useUIStore } from '@/store/useUIStore';
import { useDesignStore } from '@/store/useDesignStore';
import { getStage } from '@/store/stageRef';
import type { ExportFormat } from '@inspiration/shared';
import { m3 } from '@/theme/m3Theme';

interface FormatOption {
  id: ExportFormat;
  icon: typeof ImageIcon;
  label: string;
  description: string;
}

const FORMAT_OPTIONS: FormatOption[] = [
  { id: 'png', icon: ImageIcon, label: 'PNG', description: '无损压缩，支持透明背景' },
  { id: 'jpg', icon: ImageIcon, label: 'JPG', description: '有损压缩，文件较小' },
  { id: 'pdf', icon: PictureAsPdfIcon, label: 'PDF', description: '矢量文档，适合打印' },
  { id: 'svg', icon: CodeIcon, label: 'SVG', description: '矢量格式，无限缩放' },
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

  const handleClose = () => setShowExportModal(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
      const stage = getStage();
      if (!stage) throw new Error('无法获取画布实例');

      const marginPx = includeMargin ? margin * scale : 0;
      const exportW = design.width * scale + marginPx * 2;
      const exportH = design.height * scale + marginPx * 2;

      const designDataUrl = stage.toDataURL({
        x: 0,
        y: 0,
        width: design.width,
        height: design.height,
        pixelRatio: scale,
        mimeType: format === 'jpg' ? 'image/jpeg' : 'image/png',
        quality: format === 'jpg' ? quality / 100 : undefined,
      });

      if (marginPx === 0 && (format === 'png' || format === 'jpg')) {
        const link = document.createElement('a');
        link.download = `${design.title || 'design'}.${format}`;
        link.href = designDataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setIsExporting(false);
        handleClose();
        return;
      }

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

      const shouldFillBg = !transparent || format === 'jpg';
      if (shouldFillBg) {
        ctx.fillStyle = design.background.type === 'solid' ? (design.background.color || '#FFFFFF') : '#FFFFFF';
        ctx.fillRect(0, 0, exportW, exportH);
      }

      ctx.drawImage(img, marginPx, marginPx, design.width * scale, design.height * scale);

      let dataUrl: string;
      let filename: string;

      if (format === 'png') {
        dataUrl = exportCanvas.toDataURL('image/png');
        filename = `${design.title || 'design'}.png`;
      } else if (format === 'jpg') {
        dataUrl = exportCanvas.toDataURL('image/jpeg', quality / 100);
        filename = `${design.title || 'design'}.jpg`;
      } else if (format === 'svg') {
        const pngDataUrl = exportCanvas.toDataURL('image/png');
        const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${exportW}" height="${exportH}" viewBox="0 0 ${exportW} ${exportH}">
  <image href="${pngDataUrl}" width="${exportW}" height="${exportH}"/>
</svg>`;
        dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgContent);
        filename = `${design.title || 'design'}.svg`;
      } else if (format === 'pdf') {
        const { default: jsPDF } = await import('jspdf');
        const pdf = new jsPDF({ orientation: exportW > exportH ? 'landscape' : 'portrait', unit: 'px', format: [exportW, exportH] });
        pdf.addImage(exportCanvas.toDataURL('image/jpeg', quality / 100), 'JPEG', 0, 0, exportW, exportH);
        pdf.save(`${design.title || 'design'}.pdf`);
        setIsExporting(false);
        handleClose();
        return;
      } else {
        throw new Error('不支持的导出格式');
      }

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

  const totalMargin = includeMargin ? margin * 2 : 0;
  const finalWidth = design.width * scale + totalMargin;
  const finalHeight = design.height * scale + totalMargin;

  return (
    <Dialog open={showExportModal} onClose={handleClose} maxWidth="md" fullWidth slotProps={{ paper: { sx: { borderRadius: 7 } } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 3, bgcolor: m3.primaryContainer, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileDownloadIcon sx={{ color: m3.onPrimaryContainer }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 500 }}>导出设计</Typography>
            <Typography variant="body2" color="text.secondary">选择导出格式和参数</Typography>
          </Box>
        </Box>
        <IconButton onClick={handleClose}><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>导出格式</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            {FORMAT_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = format === option.id;
              return (
                <Card
                  key={option.id}
                  variant="outlined"
                  sx={{
                    border: isSelected ? `2px solid ${m3.primary}` : `1px solid ${m3.outlineVariant}`,
                    bgcolor: isSelected ? m3.primaryContainer : 'transparent',
                  }}
                >
                  <CardActionArea onClick={() => setFormat(option.id)} sx={{ p: 2 }}>
                    {isSelected && (
                      <CheckCircleIcon sx={{ position: 'absolute', top: 12, right: 12, fontSize: 20, color: m3.primary }} />
                    )}
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: isSelected ? m3.primary : m3.surfaceContainerHigh, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                      <Icon sx={{ color: isSelected ? m3.onPrimary : m3.onSurfaceVariant }} />
                    </Box>
                    <Typography variant="subtitle2" color={isSelected ? 'primary' : 'text.primary'}>{option.label}</Typography>
                    <Typography variant="caption" color="text.secondary">{option.description}</Typography>
                  </CardActionArea>
                </Card>
              );
            })}
          </Box>
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1.5 }}>导出缩放</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {SCALE_OPTIONS.map((s) => (
              <Button
                key={s}
                variant={scale === s ? 'contained' : 'outlined'}
                onClick={() => setScale(s)}
                sx={{ flex: 1, borderRadius: 5 }}
              >
                {s}x
              </Button>
            ))}
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            输出尺寸: {finalWidth} × {finalHeight} px
          </Typography>
        </Box>

        {format === 'jpg' && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2">图片质量</Typography>
              <Typography variant="body2" color="text.secondary">{quality}%</Typography>
            </Box>
            <Slider value={quality} onChange={(_, v) => setQuality(v as number)} min={10} max={100} step={5} />
          </Box>
        )}

        {(format === 'png' || format === 'svg') && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, bgcolor: m3.surfaceContainer, borderRadius: 3 }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>透明背景</Typography>
              <Typography variant="caption" color="text.secondary">移除画布背景色</Typography>
            </Box>
            <Switch checked={transparent} onChange={(_, v) => setTransparent(v)} />
          </Box>
        )}

        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, bgcolor: m3.surfaceContainer, borderRadius: 3 }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>添加边距</Typography>
              <Typography variant="caption" color="text.secondary">在设计周围添加空白边距</Typography>
            </Box>
            <Switch checked={includeMargin} onChange={(_, v) => setIncludeMargin(v)} />
          </Box>
          {includeMargin && (
            <Box sx={{ mt: 1.5, px: 1 }}>
              <Typography variant="caption" color="text.secondary">边距大小 (px): {margin}</Typography>
              <Slider value={margin} onChange={(_, v) => setMargin(v as number)} min={0} max={100} step={5} />
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">
          画布尺寸: {design.width} × {design.height} px
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={handleClose} variant="outlined" sx={{ borderRadius: 5 }}>取消</Button>
          <Button
            variant="contained"
            onClick={handleExport}
            disabled={isExporting}
            startIcon={isExporting ? <CircularProgress size={16} color="inherit" /> : <FileDownloadIcon />}
            sx={{ borderRadius: 5 }}
          >
            {isExporting ? '导出中...' : `导出 ${format.toUpperCase()}`}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
