import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Divider from '@mui/material/Divider';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import LayersIcon from '@mui/icons-material/Layers';
import PaletteIcon from '@mui/icons-material/Palette';
import ImageIcon from '@mui/icons-material/Image';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
import CropFreeIcon from '@mui/icons-material/CropFree';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import ArticleIcon from '@mui/icons-material/Article';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';
import LanguageIcon from '@mui/icons-material/Language';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import GroupsIcon from '@mui/icons-material/Groups';
import type { SvgIconComponent } from '@mui/icons-material';
import { NumberInput } from '../common/NumberInput';
import { ColorPicker } from '../common/ColorPicker';
import { useDesignStore } from '@/store/useDesignStore';
import { m3 } from '@/theme/m3Theme';

const SIZE_PRESETS: Array<{ name: string; width: number; height: number; icon: SvgIconComponent }> = [
  { name: '小红书', width: 1080, height: 1440, icon: MenuBookIcon },
  { name: '抖音', width: 1080, height: 1920, icon: MusicNoteIcon },
  { name: '微信朋友圈', width: 1080, height: 1080, icon: ChatBubbleOutlineOutlinedIcon },
  { name: '海报', width: 750, height: 1334, icon: CropFreeIcon },
  { name: 'PPT 16:9', width: 1920, height: 1080, icon: BarChartIcon },
  { name: 'PPT 4:3', width: 1440, height: 1080, icon: ShowChartIcon },
  { name: '公众号封面', width: 900, height: 383, icon: ArticleIcon },
  { name: 'B 站封面', width: 1146, height: 717, icon: OndemandVideoIcon },
  { name: '微博', width: 1080, height: 1080, icon: LanguageIcon },
  { name: 'Instagram', width: 1080, height: 1080, icon: PhotoCameraIcon },
  { name: 'Facebook', width: 1200, height: 630, icon: GroupsIcon },
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
  const [bgType, setBgType] = useState<BgType>((design.background.type as BgType) || 'solid');
  const [customWidth, setCustomWidth] = useState(design.width);
  const [customHeight, setCustomHeight] = useState(design.height);
  const [imageUrl, setImageUrl] = useState(design.background.image || '');

  useEffect(() => {
    setCustomWidth(design.width);
    setCustomHeight(design.height);
  }, [design.width, design.height]);

  useEffect(() => {
    setBgType((design.background.type as BgType) || 'solid');
  }, [design.background.type]);

  useEffect(() => {
    setImageUrl(design.background.image || '');
  }, [design.background.image]);

  const handlePresetSize = (width: number, height: number) => {
    setCustomWidth(width);
    setCustomHeight(height);
    updateDesignSize(width, height);
  };

  const handleBgColorChange = (color: string) => {
    setBackground({ type: 'solid', color });
  };

  const handleGradientChange = (colors: string[]) => {
    setBackground({
      type: 'gradient',
      gradient: {
        type: 'linear',
        colors: colors.map((color, i) => ({ color, offset: i / (colors.length - 1) })),
        angle: 135,
      },
    });
  };

  const applyImageUrl = () => {
    const trimmed = imageUrl.trim();
    if (trimmed) setBackground({ type: 'image', image: trimmed });
  };

  const getBgPreviewStyle = () => {
    const bg = design.background;
    if (bg.type === 'solid') return { backgroundColor: bg.color || '#FFFFFF' };
    if (bg.type === 'gradient' && bg.gradient) {
      const stops = bg.gradient.colors.map((c) => `${c.color} ${c.offset * 100}%`).join(', ');
      return { background: `linear-gradient(${bg.gradient.angle}deg, ${stops})` };
    }
    if (bg.type === 'image' && bg.image) {
      return { backgroundImage: `url(${bg.image})`, backgroundSize: 'cover' };
    }
    return { backgroundColor: '#FFFFFF' };
  };

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Box>
        <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <LayersIcon sx={{ fontSize: 18 }} />
          画布尺寸
        </Typography>

        <Box
          sx={{
            width: '100%',
            height: 96,
            borderRadius: 2,
            border: `1px solid ${m3.outlineVariant}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            ...getBgPreviewStyle(),
          }}
        >
          <Typography
            variant="caption"
            sx={{ bgcolor: 'rgba(0,0,0,0.5)', color: '#fff', px: 1, py: 0.5, borderRadius: 1 }}
          >
            {design.width} × {design.height}
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mt: 1.5 }}>
          {SIZE_PRESETS.map((preset) => {
            const Icon = preset.icon;
            return (
              <Card key={preset.name} variant="outlined">
                <CardActionArea
                  onClick={() => handlePresetSize(preset.width, preset.height)}
                  sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 1.5, gap: 0.5 }}
                >
                  <Icon sx={{ fontSize: 20, color: m3.onSurfaceVariant }} />
                  <Typography variant="caption" sx={{ fontWeight: 500 }} align="center">
                    {preset.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                    {preset.width}×{preset.height}
                  </Typography>
                </CardActionArea>
              </Card>
            );
          })}
        </Box>

        <Divider sx={{ my: 2 }} />
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
          自定义尺寸
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mt: 1 }}>
          <NumberInput label="宽度" value={customWidth} onChange={setCustomWidth} unit="px" min={1} max={10000} />
          <NumberInput label="高度" value={customHeight} onChange={setCustomHeight} unit="px" min={1} max={10000} />
        </Box>
        <Button
          fullWidth
          variant="outlined"
          onClick={() => updateDesignSize(customWidth, customHeight)}
          sx={{ mt: 1.5, borderRadius: 5 }}
        >
          应用尺寸
        </Button>
      </Box>

      <Divider />

      <Box>
        <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <PaletteIcon sx={{ fontSize: 18 }} />
          背景设置
        </Typography>

        <ToggleButtonGroup
          value={bgType}
          exclusive
          onChange={(_, val) => val && setBgType(val)}
          fullWidth
          size="small"
          sx={{ mb: 2 }}
        >
          <ToggleButton value="solid">纯色</ToggleButton>
          <ToggleButton value="gradient">渐变</ToggleButton>
          <ToggleButton value="image">图片</ToggleButton>
        </ToggleButtonGroup>

        {bgType === 'solid' && (
          <ColorPicker label="背景颜色" value={design.background.color || '#FFFFFF'} onChange={handleBgColorChange} />
        )}

        {bgType === 'gradient' && (
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              渐变预设
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, mt: 1 }}>
              {GRADIENT_PRESETS.map((preset) => (
                <Box
                  key={preset.name}
                  onClick={() => handleGradientChange(preset.colors)}
                  title={preset.name}
                  sx={{
                    height: 40,
                    borderRadius: 2,
                    border: `1px solid ${m3.outlineVariant}`,
                    cursor: 'pointer',
                    background: `linear-gradient(135deg, ${preset.colors.join(', ')})`,
                    '&:hover': { borderColor: m3.primary },
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {bgType === 'image' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {design.background.image && (
              <Box
                sx={{
                  width: '100%',
                  height: 96,
                  borderRadius: 2,
                  border: `1px solid ${m3.outlineVariant}`,
                  backgroundImage: `url(${design.background.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            )}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 80,
                border: `1px dashed ${m3.outline}`,
                borderRadius: 2,
                bgcolor: m3.surfaceContainerLow,
              }}
            >
              <Typography component="label" variant="body2" color="primary" sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ImageIcon fontSize="small" />
                上传背景图片
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      const src = reader.result as string;
                      setImageUrl(src);
                      setBackground({ type: 'image', image: src });
                    };
                    reader.readAsDataURL(file);
                    e.target.value = '';
                  }}
                />
              </Typography>
            </Box>
            <TextField
              fullWidth
              size="small"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyImageUrl()}
              onBlur={applyImageUrl}
              placeholder="或输入图片 URL，按回车应用"
            />
          </Box>
        )}
      </Box>

      <Divider />

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
          快速配色
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 0.75 }}>
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
            <Box
              key={color}
              onClick={() => handleBgColorChange(color)}
              title={color}
              sx={{
                aspectRatio: '1',
                borderRadius: 1,
                border: `1px solid ${m3.outlineVariant}`,
                bgcolor: color,
                cursor: 'pointer',
                transition: 'transform 0.15s',
                '&:hover': { transform: 'scale(1.15)' },
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
