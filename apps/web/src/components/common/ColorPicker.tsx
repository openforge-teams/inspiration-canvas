import { useState, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { m3 } from '@/theme/m3Theme';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  presetColors?: string[];
}

const DEFAULT_PRESETS = [
  '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E',
  '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
  '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#F43F5E',
];

export function ColorPicker({ value, onChange, label, presetColors = DEFAULT_PRESETS }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Box ref={containerRef}>
      {label && (
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75, display: 'block', fontWeight: 500 }}>
          {label}
        </Typography>
      )}
      <Box
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1,
          py: 0.75,
          border: `1px solid ${m3.outline}`,
          borderRadius: 1,
          cursor: 'pointer',
          bgcolor: m3.surfaceContainerLowest,
          '&:hover': { borderColor: m3.onSurface },
        }}
      >
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: 1,
            border: `1px solid ${m3.outlineVariant}`,
            bgcolor: value,
            flexShrink: 0,
          }}
        />
        <Typography variant="body2" sx={{ flex: 1, fontFamily: 'monospace', fontSize: '0.8125rem' }}>
          {value}
        </Typography>
        <KeyboardArrowDownIcon
          sx={{ fontSize: 18, color: m3.onSurfaceVariant, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        />
      </Box>

      {isOpen && (
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            zIndex: 1300,
            mt: 0.5,
            p: 2,
            width: 260,
            borderRadius: 3,
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            自定义颜色
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Box
              component="input"
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              sx={{ width: 40, height: 40, border: `1px solid ${m3.outlineVariant}`, borderRadius: 1, cursor: 'pointer', p: 0 }}
            />
            <TextField
              value={value}
              onChange={(e) => onChange(e.target.value)}
              size="small"
              fullWidth
              sx={{ '& input': { fontFamily: 'monospace', fontSize: '0.8125rem' } }}
            />
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            预设颜色
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 0.75 }}>
            {presetColors.map((color) => (
              <IconButton
                key={color}
                onClick={() => { onChange(color); setIsOpen(false); }}
                sx={{
                  width: 32,
                  height: 32,
                  p: 0,
                  borderRadius: 1,
                  border: value.toLowerCase() === color.toLowerCase() ? `2px solid ${m3.primary}` : `1px solid ${m3.outlineVariant}`,
                  bgcolor: color,
                  '&:hover': { transform: 'scale(1.1)', bgcolor: color },
                }}
              />
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
}
