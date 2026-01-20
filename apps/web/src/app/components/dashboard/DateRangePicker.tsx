'use client';

import { useState } from 'react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const presets = [
  { label: 'Hoy', getValue: () => ({ from: startOfDay(new Date()), to: endOfDay(new Date()) }) },
  { label: 'Últimos 7 días', getValue: () => ({ from: subDays(new Date(), 6), to: new Date() }) },
  { label: 'Últimos 30 días', getValue: () => ({ from: subDays(new Date(), 29), to: new Date() }) },
  { label: 'Este mes', getValue: () => ({ 
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), 
    to: new Date() 
  })},
];

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePresetClick = (preset: typeof presets[0]) => {
    onChange(preset.getValue());
    setIsOpen(false);
  };

  return (
    <div className="date-range-picker" style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="glass-panel"
        style={{
          padding: '0.75rem 1.5rem',
          border: '1px solid var(--bloom-border)',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.05)',
          color: 'inherit',
          fontSize: '0.875rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <span>📅</span>
        <span>
          {format(value.from, 'dd MMM', { locale: es })} - {format(value.to, 'dd MMM yyyy', { locale: es })}
        </span>
        <span style={{ marginLeft: '0.5rem', opacity: 0.5 }}>▼</span>
      </button>

      {isOpen && (
        <>
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10,
            }}
            onClick={() => setIsOpen(false)}
          />
          <div 
            className="glass-panel"
            style={{
              position: 'absolute',
              top: 'calc(100% + 0.5rem)',
              right: 0,
              zIndex: 20,
              padding: '0.5rem',
              minWidth: '200px',
              border: '1px solid var(--bloom-border)',
              borderRadius: '12px',
            }}
          >
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => handlePresetClick(preset)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'inherit',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
