// 颜色预设
export interface ColorPreset {
  name: string;
  colors: string[];
}

export const colorPresets: ColorPreset[] = [
  {
    name: '品牌蓝',
    colors: ['#EFF6FF', '#DBEAFE', '#93C5FD', '#3B82F6', '#1D4ED8', '#1E3A8A'],
  },
  {
    name: '活力橙',
    colors: ['#FFF7ED', '#FFEDD5', '#FDBA74', '#F97316', '#EA580C', '#9A3412'],
  },
  {
    name: '清新绿',
    colors: ['#F0FDF4', '#DCFCE7', '#86EFAC', '#22C55E', '#16A34A', '#166534'],
  },
  {
    name: '优雅紫',
    colors: ['#FAF5FF', '#F3E8FF', '#D8B4FE', '#A855F7', '#9333EA', '#6B21A8'],
  },
  {
    name: '浪漫粉',
    colors: ['#FDF2F8', '#FCE7F3', '#F9A8D4', '#EC4899', '#DB2777', '#9D174D'],
  },
  {
    name: '商务灰',
    colors: ['#F8FAFC', '#F1F5F9', '#CBD5E1', '#64748B', '#334155', '#0F172A'],
  },
  {
    name: '复古棕',
    colors: ['#FEF3C7', '#FDE68A', '#F59E0B', '#D97706', '#92400E', '#78350F'],
  },
  {
    name: '自然色',
    colors: ['#FEF3C7', '#D1FAE5', '#A7F3D0', '#6EE7B7', '#10B981', '#047857'],
  },
];

export const solidColors: string[] = [
  '#FFFFFF',
  '#F8FAFC',
  '#F1F5F9',
  '#E2E8F0',
  '#CBD5E1',
  '#94A3B8',
  '#64748B',
  '#475569',
  '#334155',
  '#1E293B',
  '#0F172A',
  '#000000',
  '#FEE2E2',
  '#FECACA',
  '#FCA5A5',
  '#F87171',
  '#EF4444',
  '#DC2626',
  '#B91C1C',
  '#991B1B',
  '#FEF3C7',
  '#FDE68A',
  '#FCD34D',
  '#FBBF24',
  '#F59E0B',
  '#D97706',
  '#B45309',
  '#92400E',
  '#D1FAE5',
  '#A7F3D0',
  '#6EE7B7',
  '#34D399',
  '#10B981',
  '#059669',
  '#047857',
  '#065F46',
  '#DBEAFE',
  '#BFDBFE',
  '#93C5FD',
  '#60A5FA',
  '#3B82F6',
  '#2563EB',
  '#1D4ED8',
  '#1E40AF',
  '#EDE9FE',
  '#DDD6FE',
  '#C4B5FD',
  '#A78BFA',
  '#8B5CF6',
  '#7C3AED',
  '#6D28D9',
  '#5B21B6',
  '#FCE7F3',
  '#FBCFE8',
  '#F9A8D4',
  '#F472B6',
  '#EC4899',
  '#DB2777',
  '#BE185D',
  '#9D174D',
];

// 字体列表
export interface FontPreset {
  name: string;
  fontFamily: string;
  category: 'sans-serif' | 'serif' | 'monospace' | 'display';
}

export const fontList: FontPreset[] = [
  {
    name: '系统默认',
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
    category: 'sans-serif',
  },
  {
    name: '苹方',
    fontFamily: "'PingFang SC', 'PingFang TC', sans-serif",
    category: 'sans-serif',
  },
  {
    name: '思源黑体',
    fontFamily: "'Source Han Sans SC', 'Noto Sans CJK SC', sans-serif",
    category: 'sans-serif',
  },
  {
    name: '思源宋体',
    fontFamily: "'Source Han Serif SC', 'Noto Serif CJK SC', serif",
    category: 'serif',
  },
  {
    name: '微软雅黑',
    fontFamily: "'Microsoft YaHei', '微软雅黑', sans-serif",
    category: 'sans-serif',
  },
  {
    name: '宋体',
    fontFamily: "'SimSun', '宋体', serif",
    category: 'serif',
  },
  {
    name: '黑体',
    fontFamily: "'SimHei', '黑体', sans-serif",
    category: 'sans-serif',
  },
  {
    name: '楷体',
    fontFamily: "'KaiTi', '楷体', serif",
    category: 'serif',
  },
  {
    name: 'Inter',
    fontFamily: "'Inter', sans-serif",
    category: 'sans-serif',
  },
  {
    name: 'Roboto',
    fontFamily: "'Roboto', sans-serif",
    category: 'sans-serif',
  },
  {
    name: 'Open Sans',
    fontFamily: "'Open Sans', sans-serif",
    category: 'sans-serif',
  },
  {
    name: 'Poppins',
    fontFamily: "'Poppins', sans-serif",
    category: 'sans-serif',
  },
  {
    name: 'Montserrat',
    fontFamily: "'Montserrat', sans-serif",
    category: 'sans-serif',
  },
  {
    name: 'Playfair Display',
    fontFamily: "'Playfair Display', serif",
    category: 'display',
  },
  {
    name: 'Lora',
    fontFamily: "'Lora', serif",
    category: 'serif',
  },
  {
    name: 'Merriweather',
    fontFamily: "'Merriweather', serif",
    category: 'serif',
  },
  {
    name: 'Fira Code',
    fontFamily: "'Fira Code', monospace",
    category: 'monospace',
  },
  {
    name: 'JetBrains Mono',
    fontFamily: "'JetBrains Mono', monospace",
    category: 'monospace',
  },
];

// 形状预设
export interface ShapePreset {
  name: string;
  shapeType: 'rect' | 'circle' | 'triangle' | 'star' | 'arrow' | 'line';
  icon: string;
  defaultProps: {
    fill: string;
    stroke: string;
    strokeWidth: number;
    borderRadius: number;
  };
}

export const shapePresets: ShapePreset[] = [
  {
    name: '矩形',
    shapeType: 'rect',
    icon: '▭',
    defaultProps: {
      fill: '#4F46E5',
      stroke: 'transparent',
      strokeWidth: 0,
      borderRadius: 0,
    },
  },
  {
    name: '圆角矩形',
    shapeType: 'rect',
    icon: '▢',
    defaultProps: {
      fill: '#4F46E5',
      stroke: 'transparent',
      strokeWidth: 0,
      borderRadius: 12,
    },
  },
  {
    name: '圆形',
    shapeType: 'circle',
    icon: '○',
    defaultProps: {
      fill: '#10B981',
      stroke: 'transparent',
      strokeWidth: 0,
      borderRadius: 0,
    },
  },
  {
    name: '三角形',
    shapeType: 'triangle',
    icon: '△',
    defaultProps: {
      fill: '#F59E0B',
      stroke: 'transparent',
      strokeWidth: 0,
      borderRadius: 0,
    },
  },
  {
    name: '星形',
    shapeType: 'star',
    icon: '☆',
    defaultProps: {
      fill: '#EF4444',
      stroke: 'transparent',
      strokeWidth: 0,
      borderRadius: 0,
    },
  },
  {
    name: '右箭头',
    shapeType: 'arrow',
    icon: '→',
    defaultProps: {
      fill: '#6366F1',
      stroke: 'transparent',
      strokeWidth: 0,
      borderRadius: 0,
    },
  },
  {
    name: '描边矩形',
    shapeType: 'rect',
    icon: '□',
    defaultProps: {
      fill: 'transparent',
      stroke: '#4F46E5',
      strokeWidth: 3,
      borderRadius: 0,
    },
  },
  {
    name: '描边圆形',
    shapeType: 'circle',
    icon: '◯',
    defaultProps: {
      fill: 'transparent',
      stroke: '#10B981',
      strokeWidth: 3,
      borderRadius: 0,
    },
  },
  {
    name: '实线',
    shapeType: 'line',
    icon: '─',
    defaultProps: {
      fill: '#374151',
      stroke: '#374151',
      strokeWidth: 2,
      borderRadius: 0,
    },
  },
  {
    name: '虚线',
    shapeType: 'line',
    icon: '╌',
    defaultProps: {
      fill: '#374151',
      stroke: '#374151',
      strokeWidth: 2,
      borderRadius: 0,
    },
  },
  {
    name: '胶囊',
    shapeType: 'rect',
    icon: '▬',
    defaultProps: {
      fill: '#8B5CF6',
      stroke: 'transparent',
      strokeWidth: 0,
      borderRadius: 999,
    },
  },
  {
    name: '菱形',
    shapeType: 'rect',
    icon: '◇',
    defaultProps: {
      fill: '#EC4899',
      stroke: 'transparent',
      strokeWidth: 0,
      borderRadius: 0,
    },
  },
];

// 渐变预设
export interface GradientPreset {
  name: string;
  type: 'linear' | 'radial';
  angle: number;
  colors: { color: string; offset: number }[];
}

export const gradientPresets: GradientPreset[] = [
  {
    name: '紫色梦境',
    type: 'linear',
    angle: 135,
    colors: [
      { color: '#667EEA', offset: 0 },
      { color: '#764BA2', offset: 1 },
    ],
  },
  {
    name: '日落橙',
    type: 'linear',
    angle: 135,
    colors: [
      { color: '#FF6B6B', offset: 0 },
      { color: '#FFA07A', offset: 1 },
    ],
  },
  {
    name: '清新薄荷',
    type: 'linear',
    angle: 135,
    colors: [
      { color: '#43E97B', offset: 0 },
      { color: '#38F9D7', offset: 1 },
    ],
  },
  {
    name: '天空蓝',
    type: 'linear',
    angle: 180,
    colors: [
      { color: '#4FACFE', offset: 0 },
      { color: '#00F2FE', offset: 1 },
    ],
  },
  {
    name: '玫瑰金',
    type: 'linear',
    angle: 135,
    colors: [
      { color: '#F6D365', offset: 0 },
      { color: '#FDA085', offset: 1 },
    ],
  },
  {
    name: '深邃夜空',
    type: 'linear',
    angle: 135,
    colors: [
      { color: '#0F2027', offset: 0 },
      { color: '#203A43', offset: 0.5 },
      { color: '#2C5364', offset: 1 },
    ],
  },
  {
    name: '樱花粉',
    type: 'linear',
    angle: 180,
    colors: [
      { color: '#FFE4E6', offset: 0 },
      { color: '#FECDD3', offset: 1 },
    ],
  },
  {
    name: '海洋蓝',
    type: 'radial',
    angle: 0,
    colors: [
      { color: '#2193B0', offset: 0 },
      { color: '#6DD5ED', offset: 1 },
    ],
  },
];

export default {
  colorPresets,
  solidColors,
  fontList,
  shapePresets,
  gradientPresets,
};
