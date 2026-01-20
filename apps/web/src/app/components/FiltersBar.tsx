'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface FilterOption {
  value: string;
  label: string;
}

interface FiltersBarProps {
  filters: Array<{
    key: string;
    label: string;
    options: FilterOption[];
    type?: 'select' | 'multiselect' | 'search';
  }>;
  onFilterChange?: (filters: Record<string, string | string[]>) => void;
}

export function FiltersBar({ filters, onFilterChange }: FiltersBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [activeFilters, setActiveFilters] = useState<Record<string, string | string[]>>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Initialize from URL params
  useEffect(() => {
    const initial: Record<string, string | string[]> = {};
    searchParams.forEach((value, key) => {
      if (key === 'search') {
        setSearchTerm(value);
      } else {
        initial[key] = value.includes(',') ? value.split(',') : value;
      }
    });
    setActiveFilters(initial);
  }, [searchParams]);

  const updateFilters = (key: string, value: string | string[]) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
    
    // Update URL
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) {
        params.set(k, Array.isArray(v) ? v.join(',') : v);
      }
    });
    if (searchTerm) params.set('search', searchTerm);
    
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    onFilterChange?.(newFilters);
  };

  const clearFilters = () => {
    setActiveFilters({});
    setSearchTerm('');
    router.push(pathname, { scroll: false });
    onFilterChange?.({});
  };

  const hasActiveFilters = Object.keys(activeFilters).length > 0 || searchTerm;

  return (
    <div className="glass-panel" style={{ 
      padding: '1rem 1.5rem',
      marginBottom: '1.5rem',
    }}>
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
      }}>
        {/* Search */}
        <div style={{ flex: '1 1 300px', minWidth: '200px' }}>
          <input
            type="search"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              const params = new URLSearchParams(searchParams);
              if (e.target.value) {
                params.set('search', e.target.value);
              } else {
                params.delete('search');
              }
              router.push(`${pathname}?${params.toString()}`, { scroll: false });
            }}
            style={{
              width: '100%',
              padding: '0.625rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--bloom-border)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'inherit',
              fontSize: '0.875rem',
            }}
            aria-label="Buscar"
          />
        </div>

        {/* Filters */}
        {filters.map((filter) => (
          <div key={filter.key} style={{ minWidth: '150px' }}>
            <select
              value={activeFilters[filter.key] as string || ''}
              onChange={(e) => updateFilters(filter.key, e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem 1rem',
                borderRadius: '8px',
                border: '1px solid var(--bloom-border)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'inherit',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
              aria-label={filter.label}
            >
              <option value="">{filter.label}</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        {/* Clear button */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            style={{
              padding: '0.625rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--bloom-border)',
              background: 'transparent',
              color: 'var(--color-text-secondary)',
              fontSize: '0.875rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
            aria-label="Limpiar filtros"
          >
            ✕ Limpiar
          </button>
        )}
      </div>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div style={{ 
          marginTop: '1rem',
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          fontSize: '0.875rem',
        }}>
          {searchTerm && (
            <span style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '999px',
              background: 'rgba(96, 186, 194, 0.2)',
              border: '1px solid rgba(96, 186, 194, 0.3)',
            }}>
              Buscar: "{searchTerm}"
            </span>
          )}
          {Object.entries(activeFilters).map(([key, value]) => {
            const filter = filters.find(f => f.key === key);
            const label = filter?.options.find(o => o.value === value)?.label || value;
            return (
              <span 
                key={key}
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '999px',
                  background: 'rgba(96, 186, 194, 0.2)',
                  border: '1px solid rgba(96, 186, 194, 0.3)',
                }}
              >
                {filter?.label}: {label as string}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
