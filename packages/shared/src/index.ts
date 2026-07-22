// 元素类型
export type ElementType = 'text' | 'image' | 'shape' | 'icon' | 'svg' | 'video' | 'background' | 'line';

// 形状类型
export type ShapeType = 'rect' | 'circle' | 'triangle' | 'star' | 'arrow' | 'line';

// 基础元素属性
export interface BaseElementProps {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
}

// 文本元素属性
export interface TextElementProps extends BaseElementProps {
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline' | 'line-through';
  textAlign: 'left' | 'center' | 'right';
  fill: string;
  lineHeight: number;
  letterSpacing: number;
  padding: number;
}

// 图片元素属性
export interface ImageElementProps extends BaseElementProps {
  src: string;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
  borderRadius: number;
  shadowBlur: number;
  shadowColor: string;
  shadowOffsetX: number;
  shadowOffsetY: number;
}

// 形状元素属性
export interface ShapeElementProps extends BaseElementProps {
  shapeType: ShapeType;
  fill: string;
  stroke: string;
  strokeWidth: number;
  borderRadius: number;
}

// 线条元素属性
export interface LineElementProps extends BaseElementProps {
  stroke: string;
  strokeWidth: number;
  points: number[];
}

// 背景元素属性
export interface BackgroundElementProps {
  type: 'solid' | 'gradient' | 'image';
  color?: string;
  gradient?: {
    type: 'linear' | 'radial';
    colors: { color: string; offset: number }[];
    angle: number;
  };
  image?: string;
}

// 元素联合类型
export type ElementProps =
  | TextElementProps
  | ImageElementProps
  | ShapeElementProps
  | LineElementProps;

// 画布元素
export interface CanvasElement {
  id: string;
  type: ElementType;
  name: string;
  parentId: string | null;
  zIndex: number;
  props: ElementProps;
}

// 设计文档
export interface DesignDocument {
  id: string;
  title: string;
  width: number;
  height: number;
  background: BackgroundElementProps;
  elements: CanvasElement[];
  zoom: number;
  scrollX: number;
  scrollY: number;
  version: number;
  createdAt: number;
  updatedAt: number;
  templateId?: string;
}

// 模板
export interface Template {
  id: string;
  name: string;
  category: string;
  tags: string[];
  previewUrl: string;
  width: number;
  height: number;
  elements: CanvasElement[];
  background: BackgroundElementProps;
  author: string;
  usageCount: number;
  createdAt: number;
}

// 素材
export interface Asset {
  id: string;
  type: 'image' | 'icon' | 'svg' | 'font' | 'video';
  name: string;
  tags: string[];
  url: string;
  thumbnail?: string;
  width?: number;
  height?: number;
  licenseType: 'free' | 'pro' | 'premium';
}

// 操作日志
export interface OperationLog {
  id: string;
  designId: string;
  userId: string;
  opType: 'create' | 'update' | 'delete' | 'move' | 'group' | 'ungroup';
  elementId: string;
  field?: string;
  oldValue?: any;
  newValue?: any;
  timestamp: number;
}

// 用户
export interface User {
  id: string;
  name: string;
  avatar: string;
  email: string;
}

// 协作光标
export interface CollaboratorCursor {
  userId: string;
  userName: string;
  avatar: string;
  color: string;
  x: number;
  y: number;
  selectedElementId: string | null;
}

// 导出格式
export type ExportFormat = 'png' | 'jpg' | 'pdf' | 'svg';

// 导出配置
export interface ExportConfig {
  format: ExportFormat;
  quality: number;
  scale: number;
  transparent: boolean;
  includeMargin: boolean;
  margin: number;
}

// 工具
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

export function createDefaultElement(type: ElementType, x: number, y: number): CanvasElement {
  const id = generateId();
  const baseProps = {
    x,
    y,
    width: 200,
    height: 100,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
  };

  switch (type) {
    case 'text':
      return {
        id,
        type: 'text',
        name: '文本',
        parentId: null,
        zIndex: 0,
        props: {
          ...baseProps,
          width: 200,
          height: 50,
          text: '双击编辑文本',
          fontFamily: 'Inter, sans-serif',
          fontSize: 24,
          fontWeight: 400,
          fontStyle: 'normal',
          textDecoration: 'none',
          textAlign: 'left',
          fill: '#333333',
          lineHeight: 1.4,
          letterSpacing: 0,
          padding: 0,
        },
      };
    case 'image':
      return {
        id,
        type: 'image',
        name: '图片',
        parentId: null,
        zIndex: 0,
        props: {
          ...baseProps,
          width: 300,
          height: 200,
          src: '',
          cropX: 0,
          cropY: 0,
          cropWidth: 1,
          cropHeight: 1,
          borderRadius: 0,
          shadowBlur: 0,
          shadowColor: 'rgba(0,0,0,0.3)',
          shadowOffsetX: 0,
          shadowOffsetY: 0,
        },
      };
    case 'shape':
      return {
        id,
        type: 'shape',
        name: '形状',
        parentId: null,
        zIndex: 0,
        props: {
          ...baseProps,
          width: 150,
          height: 150,
          shapeType: 'rect',
          fill: '#4F46E5',
          stroke: 'transparent',
          strokeWidth: 0,
          borderRadius: 8,
        },
      };
    case 'line':
      return {
        id,
        type: 'line',
        name: '线条',
        parentId: null,
        zIndex: 0,
        props: {
          ...baseProps,
          width: 200,
          height: 4,
          stroke: '#333333',
          strokeWidth: 2,
          points: [0, 2, 200, 2],
        },
      };
    default:
      return {
        id,
        type: 'shape',
        name: '元素',
        parentId: null,
        zIndex: 0,
        props: {
          ...baseProps,
          shapeType: 'rect',
          fill: '#4F46E5',
          stroke: 'transparent',
          strokeWidth: 0,
          borderRadius: 8,
        },
      };
  }
}

export function createDefaultDesign(): DesignDocument {
  return {
    id: generateId(),
    title: '未命名设计',
    width: 1080,
    height: 1440,
    background: {
      type: 'solid',
      color: '#FFFFFF',
    },
    elements: [],
    zoom: 1,
    scrollX: 0,
    scrollY: 0,
    version: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
