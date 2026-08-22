import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import SearchIcon from '@mui/icons-material/Search';
import { useDesignStore } from '@/store/useDesignStore';
import type { Template } from '@inspiration/shared';
import { generateId } from '@inspiration/shared';
import { m3 } from '@/theme/m3Theme';

const MOCK_TEMPLATES: Template[] = [
  {
    id: 'tpl-1',
    name: '简约产品海报',
    category: '海报',
    tags: ['简约', '产品', '电商'],
    previewUrl: '',
    width: 750,
    height: 1334,
    author: '灵感画布',
    usageCount: 12580,
    createdAt: Date.now() - 86400000 * 30,
    background: { type: 'gradient', gradient: { type: 'linear', colors: [{ color: '#667EEA', offset: 0 }, { color: '#764BA2', offset: 1 }], angle: 135 } },
    elements: [
      {
        id: generateId(),
        type: 'text',
        name: '标题',
        parentId: null,
        zIndex: 0,
        props: {
          x: 50, y: 200, width: 650, height: 120,
          rotation: 0, opacity: 1, visible: true, locked: false,
          text: '新品上市', fontFamily: 'Roboto, sans-serif', fontSize: 72,
          fontWeight: 700, fontStyle: 'normal', textDecoration: 'none',
          textAlign: 'center', fill: '#FFFFFF', lineHeight: 1.2, letterSpacing: 2, padding: 0,
        },
      },
    ],
  },
  {
    id: 'tpl-2',
    name: '美食小红书封面',
    category: '小红书',
    tags: ['美食', '小红书', '清新'],
    previewUrl: '',
    width: 1080,
    height: 1440,
    author: '灵感画布',
    usageCount: 8920,
    createdAt: Date.now() - 86400000 * 15,
    background: { type: 'solid', color: '#FFF7ED' },
    elements: [],
  },
  {
    id: 'tpl-3',
    name: '商务 PPT 模板',
    category: 'PPT',
    tags: ['商务', 'PPT', '简约'],
    previewUrl: '',
    width: 1920,
    height: 1080,
    author: '灵感画布',
    usageCount: 15680,
    createdAt: Date.now() - 86400000 * 60,
    background: { type: 'solid', color: '#FFFFFF' },
    elements: [],
  },
  {
    id: 'tpl-4',
    name: '渐变营销海报',
    category: '海报',
    tags: ['渐变', '营销', '潮流'],
    previewUrl: '',
    width: 750,
    height: 1334,
    author: '灵感画布',
    usageCount: 6540,
    createdAt: Date.now() - 86400000 * 7,
    background: { type: 'gradient', gradient: { type: 'linear', colors: [{ color: '#F093FB', offset: 0 }, { color: '#F5576C', offset: 1 }], angle: 180 } },
    elements: [],
  },
  {
    id: 'tpl-5',
    name: '朋友圈日签',
    category: '朋友圈',
    tags: ['日签', '朋友圈', '治愈'],
    previewUrl: '',
    width: 1080,
    height: 1080,
    author: '灵感画布',
    usageCount: 23450,
    createdAt: Date.now() - 86400000 * 3,
    background: { type: 'gradient', gradient: { type: 'linear', colors: [{ color: '#A8EDEA', offset: 0 }, { color: '#FED6E3', offset: 1 }], angle: 135 } },
    elements: [],
  },
  {
    id: 'tpl-6',
    name: '科技发布会海报',
    category: '海报',
    tags: ['科技', '发布会', '深色'],
    previewUrl: '',
    width: 750,
    height: 1334,
    author: '灵感画布',
    usageCount: 4320,
    createdAt: Date.now() - 86400000 * 20,
    background: { type: 'gradient', gradient: { type: 'linear', colors: [{ color: '#0F0C29', offset: 0 }, { color: '#302B63', offset: 0.5 }, { color: '#24243E', offset: 1 }], angle: 135 } },
    elements: [],
  },
  {
    id: 'tpl-7',
    name: '清新公众号封面',
    category: '公众号',
    tags: ['清新', '公众号', '绿色'],
    previewUrl: '',
    width: 900,
    height: 383,
    author: '灵感画布',
    usageCount: 9870,
    createdAt: Date.now() - 86400000 * 10,
    background: { type: 'gradient', gradient: { type: 'linear', colors: [{ color: '#11998E', offset: 0 }, { color: '#38EF7D', offset: 1 }], angle: 90 } },
    elements: [],
  },
  {
    id: 'tpl-8',
    name: 'INS 风格拼贴',
    category: 'Instagram',
    tags: ['INS', '拼贴', '复古'],
    previewUrl: '',
    width: 1080,
    height: 1080,
    author: '灵感画布',
    usageCount: 11230,
    createdAt: Date.now() - 86400000 * 5,
    background: { type: 'solid', color: '#FEF3C7' },
    elements: [],
  },
];

const CATEGORIES = ['全部', '海报', '小红书', 'PPT', '朋友圈', '公众号', 'Instagram'];

export function TemplatePanel() {
  const { applyTemplate } = useDesignStore();
  const [activeCategory, setActiveCategory] = useState('全部');

  const filteredTemplates =
    activeCategory === '全部'
      ? MOCK_TEMPLATES
      : MOCK_TEMPLATES.filter((t) => t.category === activeCategory);

  const getTemplateBgStyle = (template: Template) => {
    const bg = template.background;
    if (bg.type === 'solid') return { backgroundColor: bg.color || '#FFFFFF' };
    if (bg.type === 'gradient' && bg.gradient) {
      const stops = bg.gradient.colors.map((c) => `${c.color} ${c.offset * 100}%`).join(', ');
      return { background: `linear-gradient(${bg.gradient.angle}deg, ${stops})` };
    }
    return { backgroundColor: m3.surfaceContainerHigh };
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: m3.surfaceContainerLowest }}>
      <Box sx={{ p: 2, borderBottom: `1px solid ${m3.outlineVariant}` }}>
        <TextField
          fullWidth
          placeholder="搜索模板..."
          size="small"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            },
          }}
        />
        <Box sx={{ display: 'flex', gap: 0.75, overflowX: 'auto', mt: 1.5, pb: 0.5 }}>
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              size="small"
              onClick={() => setActiveCategory(cat)}
              color={activeCategory === cat ? 'primary' : 'default'}
              variant={activeCategory === cat ? 'filled' : 'outlined'}
              sx={{ flexShrink: 0 }}
            />
          ))}
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
          {filteredTemplates.map((template) => (
            <Box key={template.id}>
              <Card variant="outlined" sx={{ overflow: 'hidden' }}>
                <CardActionArea onClick={() => applyTemplate(template)}>
                  <Box
                    sx={{
                      position: 'relative',
                      aspectRatio: `${template.width} / ${template.height}`,
                      ...getTemplateBgStyle(template),
                    }}
                  >
                    {template.elements.slice(0, 3).map((el) => {
                      const scaleX = 100 / template.width;
                      const scaleY = 100 / template.height;
                      return (
                        <Box
                          key={el.id}
                          sx={{
                            position: 'absolute',
                            left: `${el.props.x * scaleX}%`,
                            top: `${el.props.y * scaleY}%`,
                            width: `${el.props.width * scaleX}%`,
                            height: `${el.props.height * scaleY}%`,
                            color: (el.props as any).fill || m3.onSurface,
                            fontSize: 8,
                            overflow: 'hidden',
                          }}
                        >
                          {el.type === 'text' && (
                            <Typography variant="caption" noWrap>
                              {(el.props as any).text}
                            </Typography>
                          )}
                        </Box>
                      );
                    })}
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'rgba(0,0,0,0)',
                        transition: 'background-color 0.2s',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.2)' },
                        '&:hover .use-label': { opacity: 1 },
                      }}
                    >
                      <Chip
                        className="use-label"
                        label="使用模板"
                        size="small"
                        sx={{ opacity: 0, transition: 'opacity 0.2s', bgcolor: m3.surfaceContainerLowest }}
                      />
                    </Box>
                    <Chip
                      label={`${template.width}×${template.height}`}
                      size="small"
                      sx={{
                        position: 'absolute',
                        bottom: 4,
                        right: 4,
                        height: 20,
                        fontSize: 10,
                        bgcolor: 'rgba(0,0,0,0.5)',
                        color: '#fff',
                      }}
                    />
                  </Box>
                </CardActionArea>
              </Card>
              <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                {template.name}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">
                  {template.category}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {template.usageCount.toLocaleString()} 使用
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
