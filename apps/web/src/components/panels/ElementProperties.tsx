import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import RotateRightIcon from '@mui/icons-material/RotateRight';
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
import { m3 } from '@/theme/m3Theme';

const FONT_FAMILIES = [
  { value: 'Roboto, sans-serif', label: 'Roboto' },
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

function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
      <Typography variant="subtitle2">{children}</Typography>
      {action}
    </Box>
  );
}

export function ElementProperties() {
  const { design, updateElement } = useDesignStore();
  const selectedElementId = useUIStore((s) => s.selectedElementId);
  const element = design.elements.find((el) => el.id === selectedElementId);

  if (!element) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          请选择一个元素以编辑其属性
        </Typography>
      </Box>
    );
  }

  const props = element.props;

  const handlePropChange = (key: string, value: any) => {
    updateElement(element.id, { [key]: value });
  };

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Box>
        <SectionTitle
          action={
            <IconButton size="small" onClick={() => handlePropChange('locked', !props.locked)}>
              {props.locked ? <LockIcon fontSize="small" /> : <LockOpenIcon fontSize="small" />}
            </IconButton>
          }
        >
          位置与尺寸
        </SectionTitle>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
          <NumberInput label="X" value={props.x} onChange={(v) => handlePropChange('x', v)} unit="px" />
          <NumberInput label="Y" value={props.y} onChange={(v) => handlePropChange('y', v)} unit="px" />
          <NumberInput label="宽度" value={props.width} onChange={(v) => handlePropChange('width', v)} unit="px" min={1} />
          <NumberInput label="高度" value={props.height} onChange={(v) => handlePropChange('height', v)} unit="px" min={1} />
        </Box>
      </Box>

      <Divider />

      <Box>
        <SectionTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <RotateRightIcon sx={{ fontSize: 18 }} />
            变换
          </Box>
        </SectionTitle>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
          <NumberInput label="旋转" value={props.rotation} onChange={(v) => handlePropChange('rotation', v)} unit="°" min={-360} max={360} />
          <NumberInput label="透明度" value={Math.round(props.opacity * 100)} onChange={(v) => handlePropChange('opacity', v / 100)} unit="%" min={0} max={100} />
        </Box>
      </Box>

      {element.type === 'text' && (
        <TextProperties props={props as TextElementProps} onChange={handlePropChange} />
      )}
      {element.type === 'shape' && (
        <ShapeProperties props={props as ShapeElementProps} onChange={handlePropChange} />
      )}
      {element.type === 'image' && (
        <ImageProperties props={props as ImageElementProps} onChange={handlePropChange} />
      )}
      {element.type === 'line' && (
        <LineProperties props={props as LineElementProps} onChange={handlePropChange} />
      )}
    </Box>
  );
}

function TextProperties({ props, onChange }: { props: TextElementProps; onChange: (key: string, value: any) => void }) {
  return (
    <Box>
      <Divider sx={{ mb: 2 }} />
      <SectionTitle>文本属性</SectionTitle>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <TextField select fullWidth label="字体" value={props.fontFamily} onChange={(e) => onChange('fontFamily', e.target.value)} size="small">
          {FONT_FAMILIES.map((f) => (
            <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>
          ))}
        </TextField>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
          <NumberInput label="字号" value={props.fontSize} onChange={(v) => onChange('fontSize', v)} unit="px" min={8} max={500} />
          <TextField select fullWidth label="字重" value={props.fontWeight} onChange={(e) => onChange('fontWeight', Number(e.target.value))} size="small">
            {FONT_WEIGHTS.map((w) => (
              <MenuItem key={w.value} value={w.value}>{w.label}</MenuItem>
            ))}
          </TextField>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
          <ColorPicker label="文字颜色" value={props.fill} onChange={(v) => onChange('fill', v)} />
          <TextField select fullWidth label="对齐" value={props.textAlign} onChange={(e) => onChange('textAlign', e.target.value)} size="small">
            {TEXT_ALIGNS.map((a) => (
              <MenuItem key={a.value} value={a.value}>{a.label}</MenuItem>
            ))}
          </TextField>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
          <NumberInput label="行高" value={props.lineHeight} onChange={(v) => onChange('lineHeight', v)} step={0.1} min={0.5} max={5} />
          <NumberInput label="字间距" value={props.letterSpacing} onChange={(v) => onChange('letterSpacing', v)} unit="px" min={-10} max={100} />
        </Box>
      </Box>
    </Box>
  );
}

function ShapeProperties({ props, onChange }: { props: ShapeElementProps; onChange: (key: string, value: any) => void }) {
  return (
    <Box>
      <Divider sx={{ mb: 2 }} />
      <SectionTitle>形状属性</SectionTitle>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <ColorPicker label="填充色" value={props.fill} onChange={(v) => onChange('fill', v)} />
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
          <ColorPicker label="描边色" value={props.stroke} onChange={(v) => onChange('stroke', v)} />
          <NumberInput label="描边宽度" value={props.strokeWidth} onChange={(v) => onChange('strokeWidth', v)} unit="px" min={0} max={100} />
        </Box>
        <NumberInput label="圆角" value={props.borderRadius} onChange={(v) => onChange('borderRadius', v)} unit="px" min={0} max={500} />
      </Box>
    </Box>
  );
}

function ImageProperties({ props, onChange }: { props: ImageElementProps; onChange: (key: string, value: any) => void }) {
  return (
    <Box>
      <Divider sx={{ mb: 2 }} />
      <SectionTitle>图片属性</SectionTitle>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <TextField fullWidth label="图片地址" value={props.src} onChange={(e) => onChange('src', e.target.value)} placeholder="输入图片 URL" size="small" />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 96,
            border: `1px dashed ${m3.outline}`,
            borderRadius: 2,
            bgcolor: m3.surfaceContainerLow,
          }}
        >
          <Typography
            component="label"
            variant="body2"
            color="primary"
            sx={{ cursor: 'pointer' }}
          >
            点击上传图片
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => onChange('src', reader.result as string);
                reader.readAsDataURL(file);
                e.target.value = '';
              }}
            />
          </Typography>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
          <NumberInput label="圆角" value={props.borderRadius} onChange={(v) => onChange('borderRadius', v)} unit="px" min={0} max={500} />
          <NumberInput label="阴影模糊" value={props.shadowBlur} onChange={(v) => onChange('shadowBlur', v)} unit="px" min={0} max={200} />
        </Box>
        <ColorPicker label="阴影颜色" value={props.shadowColor} onChange={(v) => onChange('shadowColor', v)} />
      </Box>
    </Box>
  );
}

function LineProperties({ props, onChange }: { props: LineElementProps; onChange: (key: string, value: any) => void }) {
  return (
    <Box>
      <Divider sx={{ mb: 2 }} />
      <SectionTitle>线条属性</SectionTitle>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <ColorPicker label="线条颜色" value={props.stroke} onChange={(v) => onChange('stroke', v)} />
        <NumberInput label="线条粗细" value={props.strokeWidth} onChange={(v) => onChange('strokeWidth', v)} unit="px" min={1} max={100} />
      </Box>
    </Box>
  );
}
