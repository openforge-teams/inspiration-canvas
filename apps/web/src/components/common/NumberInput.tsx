import { useState, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  placeholder?: string;
}

export function NumberInput({
  value,
  onChange,
  label,
  min = -Infinity,
  max = Infinity,
  step = 1,
  unit,
  placeholder = '0',
}: NumberInputProps) {
  const [inputValue, setInputValue] = useState(String(value));
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isFocused) setInputValue(String(value));
  }, [value, isFocused]);

  const clamp = (val: number) => Math.min(Math.max(val, min), max);

  const handleIncrement = () => onChange(clamp(Number(value) + step));
  const handleDecrement = () => onChange(clamp(Number(value) - step));

  const handleBlur = () => {
    setIsFocused(false);
    const num = parseFloat(inputValue);
    if (!isNaN(num)) onChange(clamp(num));
    else setInputValue(String(value));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') inputRef.current?.blur();
    else if (e.key === 'ArrowUp') { e.preventDefault(); handleIncrement(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); handleDecrement(); }
  };

  return (
    <Box>
      {label && (
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75, display: 'block', fontWeight: 500 }}>
          {label}
        </Typography>
      )}
      <TextField
        inputRef={inputRef}
        type="number"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        size="small"
        fullWidth
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                {unit && (
                  <Typography variant="caption" color="text.disabled" sx={{ mr: 0.5 }}>
                    {unit}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <IconButton size="small" onClick={handleIncrement} sx={{ p: 0, height: 16 }}>
                    <KeyboardArrowUpIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                  <IconButton size="small" onClick={handleDecrement} sx={{ p: 0, height: 16 }}>
                    <KeyboardArrowDownIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              </InputAdornment>
            ),
          },
        }}
      />
    </Box>
  );
}
