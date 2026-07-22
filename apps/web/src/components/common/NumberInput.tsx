import { useState, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

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
    if (!isFocused) {
      setInputValue(String(value));
    }
  }, [value, isFocused]);

  const clamp = (val: number) => Math.min(Math.max(val, min), max);

  const handleIncrement = () => {
    onChange(clamp(Number(value) + step));
  };

  const handleDecrement = () => {
    onChange(clamp(Number(value) - step));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleBlur = () => {
    setIsFocused(false);
    const num = parseFloat(inputValue);
    if (!isNaN(num)) {
      onChange(clamp(num));
    } else {
      setInputValue(String(value));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleIncrement();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleDecrement();
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-xs text-gray-500 font-medium">{label}</span>}
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="number"
          value={inputValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className="w-full h-9 pl-2 pr-8 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-white"
        />
        {unit && (
          <span className="absolute right-7 text-xs text-gray-400 pointer-events-none">
            {unit}
          </span>
        )}
        <div className="absolute right-1 flex flex-col">
          <button
            type="button"
            onClick={handleIncrement}
            className="w-5 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
          >
            <ChevronUp className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={handleDecrement}
            className="w-5 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
          >
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
