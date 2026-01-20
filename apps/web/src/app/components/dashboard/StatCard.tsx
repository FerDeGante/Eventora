'use client';

import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  delta?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: ReactNode;
  subtitle?: string;
  loading?: boolean;
}

export function StatCard({ 
  title, 
  value, 
  delta, 
  trend = 'neutral', 
  icon,
  subtitle,
  loading = false 
}: StatCardProps) {
  const trendColors = {
    up: '#22c55e',
    down: '#ef4444',
    neutral: '#94a3b8',
  };

  const trendIcons = {
    up: '↗',
    down: '↘',
    neutral: '→',
  };

  if (loading) {
    return (
      <div className="glass-panel stat-card stat-card--loading" style={{
        padding: '1.5rem',
        minHeight: '140px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div className="loading-skeleton" style={{ width: '100%', height: '80px' }} />
      </div>
    );
  }

  return (
    <div className="glass-panel stat-card" style={{
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '1rem' 
      }}>
        <div style={{ flex: 1 }}>
          <p style={{ 
            fontSize: '0.875rem',
            color: 'var(--color-text-secondary)',
            marginBottom: '0.5rem',
            fontWeight: 500,
          }}>
            {title}
          </p>
          <p style={{
            fontSize: '2rem',
            fontWeight: 700,
            lineHeight: 1.2,
            background: 'linear-gradient(135deg, #f8fbff 0%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            {value}
          </p>
        </div>
        {icon && (
          <div style={{
            fontSize: '2rem',
            opacity: 0.3,
            lineHeight: 1,
          }}>
            {icon}
          </div>
        )}
      </div>

      {(delta || subtitle) && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          fontSize: '0.875rem',
        }}>
          {delta && (
            <>
              <span style={{ 
                color: trendColors[trend],
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}>
                {trendIcons[trend]} {delta}
              </span>
              {subtitle && <span style={{ color: 'var(--color-text-secondary)' }}>·</span>}
            </>
          )}
          {subtitle && (
            <span style={{ color: 'var(--color-text-secondary)' }}>
              {subtitle}
            </span>
          )}
        </div>
      )}

      {/* Decorative gradient */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: '100px',
        height: '100px',
        background: `radial-gradient(circle at center, ${trendColors[trend]}15, transparent 70%)`,
        pointerEvents: 'none',
      }} />
    </div>
  );
}

interface StatGridProps {
  children: ReactNode;
  cols?: 2 | 3 | 4;
}

export function StatGrid({ children, cols = 3 }: StatGridProps) {
  // Responsive grid classes based on number of columns
  const gridClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridClasses[cols]} gap-4 md:gap-6 mb-6 md:mb-8`}>
      {children}
    </div>
  );
}
