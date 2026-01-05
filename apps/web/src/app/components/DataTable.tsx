'use client';

import { ReactNode, useState } from 'react';
import { LoadingSkeleton } from './LoadingStates';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (value: any, row: T) => ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  rowKey: keyof T;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends Record<string, any>>({ 
  data, 
  columns, 
  loading = false,
  emptyMessage = 'No hay datos para mostrar',
  rowKey,
  onRowClick,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    
    if (aVal === bVal) return 0;
    
    const comparison = aVal > bVal ? 1 : -1;
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} style={{ 
              display: 'grid', 
              gridTemplateColumns: columns.map(c => c.width || '1fr').join(' '),
              gap: '1rem'
            }}>
              {columns.map((_, colIdx) => (
                <LoadingSkeleton key={colIdx} height="20px" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="glass-panel" style={{ 
        padding: '3rem',
        textAlign: 'center',
        color: 'var(--color-text-secondary)',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>📭</div>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ 
          width: '100%',
          borderCollapse: 'collapse',
        }}>
          <thead>
            <tr style={{ 
              borderBottom: '1px solid var(--bloom-border)',
            }}>
              {columns.map((column) => (
                <th 
                  key={column.key as string}
                  onClick={() => column.sortable && handleSort(column.key as string)}
                  style={{
                    padding: '1rem 1.5rem',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--color-text-secondary)',
                    cursor: column.sortable ? 'pointer' : 'default',
                    userSelect: 'none',
                    width: column.width,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {column.header}
                    {column.sortable && (
                      <span style={{ opacity: 0.5, fontSize: '0.75rem' }}>
                        {sortKey === column.key ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row) => (
              <tr 
                key={row[rowKey] as string}
                onClick={() => onRowClick?.(row)}
                style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  cursor: onRowClick ? 'pointer' : 'default',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (onRowClick) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (onRowClick) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {columns.map((column) => {
                  const value = row[column.key];
                  return (
                    <td 
                      key={column.key as string}
                      style={{
                        padding: '1rem 1.5rem',
                        fontSize: '0.875rem',
                      }}
                    >
                      {column.render ? column.render(value, row) : value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
