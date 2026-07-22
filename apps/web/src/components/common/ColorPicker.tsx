import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

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
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      {label && <span className="text-xs text-gray-500 font-medium">{label}</span>}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full h-9 px-2 flex items-center gap-2 bg-white border border-gray-200 rounded-md hover:border-gray-300 transition-colors"
        >
          <div
            className="w-5 h-5 rounded border border-gray-200 flex-shrink-0"
            style={{ backgroundColor: value }}
          />
          <span className="text-sm text-gray-700 flex-1 text-left font-mono">{value}</span>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-50 top-full left-0 mt-1 p-3 bg-white border border-gray-200 rounded-lg shadow-lg w-64">
            <div className="mb-3">
              <label className="text-xs text-gray-500 block mb-1">自定义颜色</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-9 h-9 rounded border border-gray-200 cursor-pointer p-0"
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className="flex-1 h-9 px-2 text-sm border border-gray-200 rounded-md font-mono focus:outline-none focus:border-primary-500"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">预设颜色</label>
              <div className="grid grid-cols-6 gap-1">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      onChange(color);
                      setIsOpen(false);
                    }}
                    className={`w-8 h-8 rounded border-2 transition-transform hover:scale-110 ${
                      value.toLowerCase() === color.toLowerCase()
                        ? 'border-primary-500'
                        : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
