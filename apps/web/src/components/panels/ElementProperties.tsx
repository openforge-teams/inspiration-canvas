import { Lock, Unlock, RotateCw } from 'lucide-react';
import { NumberInput } from '../common/NumberInput';
import { ColorPicker } from '../common/ColorPicker';
import { useDesignStore } from '@/store/useDesignStore';
import { useUIStore } from '@/store/useUIStore';
import type {
  TextElementProps,
  ShapeElementProps,
  ImageElementProps,
  LineElementProps,
} from '@inspiration/shared';

const FONT_FAMILIES = [
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'system-ui, sans-serif', label: '系统默认' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Courier New, monospace', label: 'Courier New' },
  { value: 'Arial, sans-serif', label: 'Arial' },
];

const FONT_WEIGHTS = [
  { value: 300, label: '细体' },
  { value: 400, label: '常规' },
  { value: 500, label: '中等' },
  { value: 600, label: '半粗' },
  { value: 700, label: '粗体' },
  { value: 800, label: '特粗' },
];

const TEXT_ALIGNS = [
  { value: 'left', label: '左对齐' },
  { value: 'center', label: '居中' },
  { value: 'right', label: '右对齐' },
];

export function ElementProperties() {
  const { design, updateElement } = useDesignStore();
  const selectedElementId = useUIStore((s) => s.selectedElementId);

  const element = design.elements.find((el) => el.id === selectedElementId);

  if (!element) {
    return (
      <div className="p-4 text-sm text-gray-500 text-center">
        请选择一个元素以编辑其属性
      </div>
    );
  }

  const props = element.props;

  const handlePropChange = (key: string, value: any) => {
    updateElement(element.id, { [key]: value });
  };

  const handleToggleLock = () => {
    updateElement(element.id, { locked: !props.locked });
  };

  return (
    <div className="p-4 space-y-5 overflow-y-auto">
      {/* 通用属性 */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center justify-between">
          位置与尺寸
          <button
            onClick={handleToggleLock}
            className="p-1 rounded hover:bg-gray-100 text-gray-500"
            title={props.locked ? '解锁' : '锁定'}
          >
            {props.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <NumberInput
            label="X"
            value={props.x}
            onChange={(v) => handlePropChange('x', v)}
            unit="px"
          />
          <NumberInput
            label="Y"
            value={props.y}
            onChange={(v) => handlePropChange('y', v)}
            unit="px"
          />
          <NumberInput
            label="宽度"
            value={props.width}
            onChange={(v) => handlePropChange('width', v)}
            unit="px"
            min={1}
          />
          <NumberInput
            label="高度"
            value={props.height}
            onChange={(v) => handlePropChange('height', v)}
            unit="px"
            min={1}
          />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <RotateCw className="w-4 h-4" />
          变换
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <NumberInput
            label="旋转"
            value={props.rotation}
            onChange={(v) => handlePropChange('rotation', v)}
            unit="°"
            min={-360}
            max={360}
          />
          <NumberInput
            label="透明度"
            value={Math.round(props.opacity * 100)}
            onChange={(v) => handlePropChange('opacity', v / 100)}
            unit="%"
            min={0}
            max={100}
          />
        </div>
      </div>

      {/* 文本属性 */}
      {element.type === 'text' && (
        <TextProperties
          props={props as TextElementProps}
          onChange={handlePropChange}
        />
      )}

      {/* 形状属性 */}
      {element.type === 'shape' && (
        <ShapeProperties
          props={props as ShapeElementProps}
          onChange={handlePropChange}
        />
      )}

      {/* 图片属性 */}
      {element.type === 'image' && (
        <ImageProperties
          props={props as ImageElementProps}
          onChange={handlePropChange}
        />
      )}

      {/* 线条属性 */}
      {element.type === 'line' && (
        <LineProperties
          props={props as LineElementProps}
          onChange={handlePropChange}
        />
      )}
    </div>
  );
}

function TextProperties({
  props,
  onChange,
}: {
  props: TextElementProps;
  onChange: (key: string, value: any) => void;
}) {
  return (
    <div className="space-y-3 border-t pt-4">
      <h3 className="text-sm font-semibold text-gray-800">文本属性</h3>

      <div>
        <label className="text-xs text-gray-500 block mb-1.5">字体</label>
        <select
          value={props.fontFamily}
          onChange={(e) => onChange('fontFamily', e.target.value)}
          className="w-full h-9 px-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-primary-500 bg-white"
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <NumberInput
          label="字号"
          value={props.fontSize}
          onChange={(v) => onChange('fontSize', v)}
          unit="px"
          min={8}
          max={500}
        />
        <div>
          <label className="text-xs text-gray-500 block mb-1.5">字重</label>
          <select
            value={props.fontWeight}
            onChange={(e) => onChange('fontWeight', Number(e.target.value))}
            className="w-full h-9 px-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-primary-500 bg-white"
          >
            {FONT_WEIGHTS.map((w) => (
              <option key={w.value} value={w.value}>
                {w.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <ColorPicker
          label="文字颜色"
          value={props.fill}
          onChange={(v) => onChange('fill', v)}
        />
        <div>
          <label className="text-xs text-gray-500 block mb-1.5">对齐</label>
          <select
            value={props.textAlign}
            onChange={(e) => onChange('textAlign', e.target.value)}
            className="w-full h-9 px-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-primary-500 bg-white"
          >
            {TEXT_ALIGNS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <NumberInput
          label="行高"
          value={props.lineHeight}
          onChange={(v) => onChange('lineHeight', v)}
          step={0.1}
          min={0.5}
          max={5}
        />
        <NumberInput
          label="字间距"
          value={props.letterSpacing}
          onChange={(v) => onChange('letterSpacing', v)}
          unit="px"
          min={-10}
          max={100}
        />
      </div>
    </div>
  );
}

function ShapeProperties({
  props,
  onChange,
}: {
  props: ShapeElementProps;
  onChange: (key: string, value: any) => void;
}) {
  return (
    <div className="space-y-3 border-t pt-4">
      <h3 className="text-sm font-semibold text-gray-800">形状属性</h3>

      <ColorPicker
        label="填充色"
        value={props.fill}
        onChange={(v) => onChange('fill', v)}
      />

      <div className="grid grid-cols-2 gap-2">
        <ColorPicker
          label="描边色"
          value={props.stroke}
          onChange={(v) => onChange('stroke', v)}
        />
        <NumberInput
          label="描边宽度"
          value={props.strokeWidth}
          onChange={(v) => onChange('strokeWidth', v)}
          unit="px"
          min={0}
          max={100}
        />
      </div>

      <NumberInput
        label="圆角"
        value={props.borderRadius}
        onChange={(v) => onChange('borderRadius', v)}
        unit="px"
        min={0}
        max={500}
      />
    </div>
  );
}

function ImageProperties({
  props,
  onChange,
}: {
  props: ImageElementProps;
  onChange: (key: string, value: any) => void;
}) {
  return (
    <div className="space-y-3 border-t pt-4">
      <h3 className="text-sm font-semibold text-gray-800">图片属性</h3>

      <div>
        <label className="text-xs text-gray-500 block mb-1.5">图片地址</label>
        <input
          type="text"
          value={props.src}
          onChange={(e) => onChange('src', e.target.value)}
          placeholder="输入图片 URL"
          className="w-full h-9 px-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-primary-500 bg-white"
        />
      </div>

      <div className="flex items-center justify-center w-full h-24 bg-gray-50 border border-dashed border-gray-200 rounded-md">
        <label className="cursor-pointer text-sm text-primary-600 hover:text-primary-700">
          点击上传图片
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                onChange('src', reader.result as string);
              };
              reader.readAsDataURL(file);
              // 重置 input 以便重复选择同一文件
              e.target.value = '';
            }}
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <NumberInput
          label="圆角"
          value={props.borderRadius}
          onChange={(v) => onChange('borderRadius', v)}
          unit="px"
          min={0}
          max={500}
        />
        <NumberInput
          label="阴影模糊"
          value={props.shadowBlur}
          onChange={(v) => onChange('shadowBlur', v)}
          unit="px"
          min={0}
          max={200}
        />
      </div>

      <ColorPicker
        label="阴影颜色"
        value={props.shadowColor}
        onChange={(v) => onChange('shadowColor', v)}
      />
    </div>
  );
}

function LineProperties({
  props,
  onChange,
}: {
  props: LineElementProps;
  onChange: (key: string, value: any) => void;
}) {
  return (
    <div className="space-y-3 border-t pt-4">
      <h3 className="text-sm font-semibold text-gray-800">线条属性</h3>

      <ColorPicker
        label="线条颜色"
        value={props.stroke}
        onChange={(v) => onChange('stroke', v)}
      />

      <NumberInput
        label="线条粗细"
        value={props.strokeWidth}
        onChange={(v) => onChange('strokeWidth', v)}
        unit="px"
        min={1}
        max={100}
      />
    </div>
  );
}
