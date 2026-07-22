import { useState } from 'react';
import { Search } from 'lucide-react';
import { useDesignStore } from '@/store/useDesignStore';
import type { Template } from '@inspiration/shared';
import { generateId } from '@inspiration/shared';

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
          text: '新品上市', fontFamily: 'Inter, sans-serif', fontSize: 72,
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

  const filteredTemplates = activeCategory === '全部'
    ? MOCK_TEMPLATES
    : MOCK_TEMPLATES.filter((t) => t.category === activeCategory);

  const handleApplyTemplate = (template: Template) => {
    applyTemplate(template);
  };

  const getTemplateBgStyle = (template: Template) => {
    const bg = template.background;
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
    return { backgroundColor: '#F3F4F6' };
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* 搜索和分类 */}
      <div className="p-4 border-b border-gray-100 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜索模板..."
            className="w-full h-9 pl-9 pr-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 bg-gray-50"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                activeCategory === cat
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 模板网格 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="group cursor-pointer"
              onClick={() => handleApplyTemplate(template)}
            >
              {/* 预览区域 */}
              <div
                className="relative w-full rounded-lg border border-gray-200 overflow-hidden hover:border-primary-400 hover:shadow-md transition-all"
                style={{
                  aspectRatio: `${template.width} / ${template.height}`,
                  ...getTemplateBgStyle(template),
                }}
              >
                {/* 模板元素预览 */}
                {template.elements.slice(0, 3).map((el) => {
                  const scaleX = 100 / template.width;
                  const scaleY = 100 / template.height;
                  return (
                    <div
                      key={el.id}
                      className="absolute"
                      style={{
                        left: `${el.props.x * scaleX}%`,
                        top: `${el.props.y * scaleY}%`,
                        width: `${el.props.width * scaleX}%`,
                        height: `${el.props.height * scaleY}%`,
                        color: (el.props as any).fill || '#333',
                        fontSize: '8px',
                        overflow: 'hidden',
                      }}
                    >
                      {el.type === 'text' && (
                        <span className="line-clamp-2">{(el.props as any).text}</span>
                      )}
                    </div>
                  );
                })}

                {/* Hover 遮罩 */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 bg-white text-gray-800 text-xs font-medium px-3 py-1.5 rounded-full shadow-md transition-opacity">
                    使用模板
                  </span>
                </div>

                {/* 尺寸标签 */}
                <div className="absolute bottom-1.5 right-1.5 bg-black/40 text-white text-[10px] px-1.5 py-0.5 rounded">
                  {template.width}×{template.height}
                </div>
              </div>

              {/* 模板信息 */}
              <div className="mt-2">
                <h4 className="text-sm font-medium text-gray-800 truncate">
                  {template.name}
                </h4>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-xs text-gray-400">{template.category}</span>
                  <span className="text-xs text-gray-400">
                    {template.usageCount.toLocaleString()} 使用
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
