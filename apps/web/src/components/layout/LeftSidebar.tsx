import {
  NearMe as SelectIcon,
  Title as TextIcon,
  Image as ImageIcon,
  Category as ShapeIcon,
  HorizontalRule as LineIcon,
  Dashboard as TemplateIcon,
  PermMedia as AssetIcon,
  Layers as LayersIcon,
  CropSquare as SquareIcon,
  Circle as CircleIcon,
  ChangeHistory as TriangleIcon,
  Star as StarIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Divider from '@mui/material/Divider';
import { useUIStore, type ToolType, type PanelType } from '@/store/useUIStore';
import { useDesignStore } from '@/store/useDesignStore';
import { TemplatePanel } from '../panels/TemplatePanel';
import { createDefaultElement, type ShapeType } from '@inspiration/shared';
import { m3 } from '@/theme/m3Theme';

interface ToolItem {
  id: ToolType;
  icon: typeof SelectIcon;
  label: string;
  panel: PanelType;
}

const TOOLS: ToolItem[] = [
  { id: 'select', icon: SelectIcon, label: '选择', panel: null },
  { id: 'text', icon: TextIcon, label: '文本', panel: 'text' },
  { id: 'image', icon: ImageIcon, label: '图片', panel: 'assets' },
  { id: 'shape', icon: ShapeIcon, label: '形状', panel: 'shapes' },
  { id: 'line', icon: LineIcon, label: '线条', panel: 'lines' },
];

const PANELS: { id: PanelType; icon: typeof TemplateIcon; label: string }[] = [
  { id: 'templates', icon: TemplateIcon, label: '模板' },
  { id: 'assets', icon: AssetIcon, label: '素材' },
  { id: 'pages', icon: LayersIcon, label: '页面' },
];

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

function PanelHeader({ title }: { title: string }) {
  return (
    <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${m3.outlineVariant}` }}>
      <Typography variant="subtitle2" color="text.primary">
        {title}
      </Typography>
    </Box>
  );
}

function TextPanel() {
  const { addElement } = useDesignStore();
  const { setActiveTool, setActivePanel } = useUIStore();

  const handleAddText = (preset: TextPreset) => {
    const element = createDefaultElement('text', 100, 100);
    element.props = {
      ...element.props,
      text: preset.text,
      fontSize: preset.fontSize,
      fontWeight: preset.fontWeight,
      width: preset.fontSize * preset.text.length * 0.6,
      height: preset.fontSize * 1.4,
    } as any;
    element.name = preset.name;
    addElement(element);
    setActiveTool('select');
    setActivePanel(null);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: m3.surfaceContainerLowest }}>
      <PanelHeader title="文本预设" />
      <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {TEXT_PRESETS.map((preset) => (
          <Card key={preset.label} variant="outlined">
            <CardActionArea onClick={() => handleAddText(preset)} sx={{ p: 1.5 }}>
              <Typography
                sx={{
                  fontSize: `${Math.min(preset.fontSize, 24)}px`,
                  fontWeight: preset.fontWeight,
                  color: m3.onSurface,
                }}
              >
                {preset.text}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {preset.fontSize}px ·{' '}
                {preset.fontWeight === 700
                  ? '粗体'
                  : preset.fontWeight === 600
                    ? '半粗'
                    : preset.fontWeight === 500
                      ? '中等'
                      : '常规'}
              </Typography>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Box>
  );
}

interface ShapePreset {
  shapeType: ShapeType;
  name: string;
  icon: typeof SquareIcon;
}

const SHAPE_PRESETS: ShapePreset[] = [
  { shapeType: 'rect', name: '矩形', icon: SquareIcon },
  { shapeType: 'circle', name: '圆形', icon: CircleIcon },
  { shapeType: 'triangle', name: '三角形', icon: TriangleIcon },
  { shapeType: 'star', name: '星形', icon: StarIcon },
  { shapeType: 'arrow', name: '箭头', icon: ArrowIcon },
];

function ShapePanel() {
  const { addElement } = useDesignStore();
  const { setActiveTool, setActivePanel } = useUIStore();

  const handleAddShape = (preset: ShapePreset) => {
    const element = createDefaultElement('shape', 100, 100);
    element.props = { ...element.props, shapeType: preset.shapeType } as any;
    element.name = preset.name;
    addElement(element);
    setActiveTool('select');
    setActivePanel(null);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: m3.surfaceContainerLowest }}>
      <PanelHeader title="形状库" />
      <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
          {SHAPE_PRESETS.map((preset) => {
            const Icon = preset.icon;
            return (
              <Card key={preset.shapeType} variant="outlined">
                <CardActionArea
                  onClick={() => handleAddShape(preset)}
                  sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2, gap: 1 }}
                >
                  <Icon sx={{ fontSize: 32, color: m3.onSurfaceVariant }} />
                  <Typography variant="caption" sx={{ fontWeight: 500 }}>
                    {preset.name}
                  </Typography>
                </CardActionArea>
              </Card>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

function AssetPanel() {
  const { addElement } = useDesignStore();
  const { setActiveTool, setActivePanel } = useUIStore();
  const assets = [
    { id: 'asset-001', name: '山脉风景', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200' },
    { id: 'asset-002', name: '城市夜景', url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=200' },
    { id: 'asset-003', name: '海洋日落', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200' },
    { id: 'asset-004', name: '森林小径', url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=200' },
  ];

  const handleAddImage = (asset: (typeof assets)[0]) => {
    const element = createDefaultElement('image', 100, 100);
    element.props = { ...element.props, src: asset.url.replace('w=200', 'w=800') } as any;
    element.name = asset.name;
    addElement(element);
    setActiveTool('select');
    setActivePanel(null);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: m3.surfaceContainerLowest }}>
      <PanelHeader title="素材库" />
      <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
          {assets.map((asset) => (
            <Card key={asset.id} variant="outlined">
              <CardActionArea onClick={() => handleAddImage(asset)}>
                <CardMedia component="img" height="80" image={asset.url} alt={asset.name} />
                <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                  <Typography variant="caption" sx={{ fontWeight: 500 }} noWrap>
                    {asset.name}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 1.5, borderRadius: 5, bgcolor: m3.secondaryContainer, color: m3.onSecondaryContainer, boxShadow: 'none' }}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (ev) => {
              const file = (ev.target as HTMLInputElement).files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                  const element = createDefaultElement('image', 100, 100);
                  element.props = { ...element.props, src: reader.result as string } as any;
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
        >
          上传本地图片
        </Button>
      </Box>
    </Box>
  );
}

function LinePanel() {
  const { addElement } = useDesignStore();
  const { setActiveTool, setActivePanel } = useUIStore();

  const LINE_PRESETS = [
    { name: '水平线', points: [0, 0, 200, 0] as number[], width: 200, height: 4 },
    { name: '垂直线', points: [0, 0, 0, 200] as number[], width: 4, height: 200 },
    { name: '对角线', points: [0, 0, 200, 200] as number[], width: 200, height: 200 },
    { name: '短横线', points: [0, 0, 120, 0] as number[], width: 120, height: 4 },
  ];

  const handleAddLine = (preset: (typeof LINE_PRESETS)[0]) => {
    const element = createDefaultElement('line', 100, 100);
    element.props = {
      ...element.props,
      points: preset.points,
      width: preset.width,
      height: preset.height,
    } as any;
    element.name = preset.name;
    addElement(element);
    setActiveTool('select');
    setActivePanel(null);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: m3.surfaceContainerLowest }}>
      <PanelHeader title="线条库" />
      <Box sx={{ flex: 1, overflowY: 'auto', p: 1.5 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
          {LINE_PRESETS.map((preset) => (
            <Card key={preset.name} variant="outlined">
              <CardActionArea
                onClick={() => handleAddLine(preset)}
                sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2, gap: 1 }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    component="svg"
                    viewBox="0 0 48 48"
                    sx={{ width: 40, height: 40 }}
                  >
                    <line
                      x1={preset.points[0] * 0.2 + 4}
                      y1={preset.points[1] * 0.2 + 24}
                      x2={preset.points[2] * 0.2 + 4}
                      y2={preset.points[3] * 0.2 + 24}
                      stroke={m3.onSurfaceVariant}
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                  </Box>
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  {preset.name}
                </Typography>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

function PagePanel() {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: m3.surfaceContainerLowest }}>
      <PanelHeader title="页面" />
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2, textAlign: 'center' }}>
        <LayersIcon sx={{ fontSize: 48, color: m3.outline, opacity: 0.4, mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          暂无页面
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
          创建新页面以管理多页设计
        </Typography>
        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 2, borderRadius: 5, bgcolor: m3.secondaryContainer, color: m3.onSecondaryContainer, boxShadow: 'none' }}
        >
          新建页面
        </Button>
      </Box>
    </Box>
  );
}

function NavRailButton({
  icon: Icon,
  label,
  isActive,
  onClick,
}: {
  icon: typeof SelectIcon;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: 64,
        py: 1,
        borderRadius: 4,
        cursor: 'pointer',
        bgcolor: isActive ? m3.secondaryContainer : 'transparent',
        color: isActive ? m3.onSecondaryContainer : m3.onSurfaceVariant,
        transition: 'all 0.2s',
        '&:hover': {
          bgcolor: isActive ? m3.secondaryContainer : m3.surfaceContainerHigh,
        },
      }}
    >
      <Icon sx={{ fontSize: 24 }} />
      <Typography variant="caption" sx={{ mt: 0.25, fontWeight: 500, fontSize: '0.6875rem' }}>
        {label}
      </Typography>
    </Box>
  );
}

export function LeftSidebar() {
  const { activeTool, setActiveTool, activePanel, setActivePanel } = useUIStore();

  const handleToolClick = (tool: ToolType) => {
    if (activeTool === tool) {
      setActiveTool('select');
      const toolItem = TOOLS.find((t) => t.id === tool);
      if (toolItem?.panel) setActivePanel(null);
    } else {
      setActiveTool(tool);
      const toolItem = TOOLS.find((t) => t.id === tool);
      if (toolItem?.panel) setActivePanel(toolItem.panel);
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
      case 'lines':
        return <LinePanel />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexShrink: 0 }}>
      {/* M3 Navigation Rail */}
      <Paper
        elevation={0}
        square
        sx={{
          width: 80,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: 1.5,
          gap: 0.5,
          bgcolor: m3.surfaceContainerLowest,
          borderRight: `1px solid ${m3.outlineVariant}`,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
          {TOOLS.map((tool) => (
            <NavRailButton
              key={tool.id}
              icon={tool.icon}
              label={tool.label}
              isActive={activeTool === tool.id}
              onClick={() => handleToolClick(tool.id)}
            />
          ))}
        </Box>

        <Divider sx={{ width: 48, my: 1, borderColor: m3.outlineVariant }} />

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 0.5 }}>
          {PANELS.map((panel) => (
            <NavRailButton
              key={panel.id}
              icon={panel.icon}
              label={panel.label}
              isActive={activePanel === panel.id}
              onClick={() => handlePanelClick(panel.id)}
            />
          ))}
        </Box>
      </Paper>

      {activePanel && (
        <Paper
          elevation={0}
          square
          sx={{
            width: 280,
            flexShrink: 0,
            overflow: 'hidden',
            borderRight: `1px solid ${m3.outlineVariant}`,
          }}
        >
          {renderPanel()}
        </Paper>
      )}
    </Box>
  );
}
