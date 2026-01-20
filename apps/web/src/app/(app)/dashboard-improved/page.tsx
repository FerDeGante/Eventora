'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { StatCard, StatGrid } from '../../components/dashboard/StatCard';
import { ReservationsChart, RevenueChart } from '../../components/dashboard/Charts';
import { DateRangePicker } from '../../components/dashboard/DateRangePicker';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { getReservationsAnalytics, getRevenueAnalytics } from '@/lib/admin-api';

const ChartState = ({ title, subtitle, message }: { title: string; subtitle: string; message: string }) => (
  <div className="glass-panel" style={{ padding: '1.5rem' }}>
    <div style={{ marginBottom: '1.5rem' }}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
        {subtitle}
      </p>
    </div>
    <div style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
      {message}
    </div>
  </div>
);

export default function ImprovedDashboard() {
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 6),
    to: new Date(),
  });

  const analyticsRange = useMemo(() => ({
    start: format(dateRange.from, 'yyyy-MM-dd'),
    end: format(dateRange.to, 'yyyy-MM-dd'),
  }), [dateRange]);

  const rangeLabel = useMemo(() => (
    `${format(dateRange.from, 'dd MMM', { locale: es })} - ${format(dateRange.to, 'dd MMM yyyy', { locale: es })}`
  ), [dateRange]);

  const reservationsQuery = useQuery({
    queryKey: ['dashboard-improved-reservations', analyticsRange.start, analyticsRange.end],
    queryFn: () => getReservationsAnalytics(analyticsRange),
  });

  const revenueQuery = useQuery({
    queryKey: ['dashboard-improved-revenue', analyticsRange.start, analyticsRange.end],
    queryFn: () => getRevenueAnalytics(analyticsRange),
  });

  const reservationsData = reservationsQuery.data ?? [];
  const revenueData = revenueQuery.data ?? [];

  return (
    <div className="container section-spacing">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="h1-responsive mb-2">
            Dashboard
          </h1>
          <p className="body-responsive text-gray-400">
            Vista general de tu clínica
          </p>
        </div>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* KPIs Grid - Responsive: 1 col mobile, 2 cols tablet, 4 cols desktop */}
      <StatGrid cols={4}>
        <StatCard
          title="Reservas hoy"
          value="67"
          delta="+12%"
          trend="up"
          subtitle="vs ayer"
          icon="📅"
        />
        <StatCard
          title="Ingresos del día"
          value="$24,500"
          delta="+8.5%"
          trend="up"
          subtitle="MXN"
          icon="💰"
        />
        <StatCard
          title="Paquetes activos"
          value="312"
          delta="-2"
          trend="down"
          subtitle="vs semana pasada"
          icon="📦"
        />
        <StatCard
          title="Tasa de ocupación"
          value="87%"
          delta="+5%"
          trend="up"
          subtitle="capacidad utilizada"
          icon="📊"
        />
      </StatGrid>

      {/* Charts Grid - Responsive: stacks on mobile, side by side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        {reservationsQuery.isLoading && (
          <ChartState title="Reservas por día" subtitle={rangeLabel} message="Cargando datos de reservas..." />
        )}
        {reservationsQuery.isError && (
          <ChartState title="Reservas por día" subtitle={rangeLabel} message="No pudimos cargar el histórico de reservas." />
        )}
        {!reservationsQuery.isLoading && !reservationsQuery.isError && reservationsData.length === 0 && (
          <ChartState title="Reservas por día" subtitle={rangeLabel} message="No hay reservas en el rango seleccionado." />
        )}
        {!reservationsQuery.isLoading && !reservationsQuery.isError && reservationsData.length > 0 && (
          <ReservationsChart data={reservationsData} subtitle={rangeLabel} />
        )}

        {revenueQuery.isLoading && (
          <ChartState title="Ingresos por método de pago" subtitle={rangeLabel} message="Cargando datos de ingresos..." />
        )}
        {revenueQuery.isError && (
          <ChartState title="Ingresos por método de pago" subtitle={rangeLabel} message="No pudimos cargar el histórico de ingresos." />
        )}
        {!revenueQuery.isLoading && !revenueQuery.isError && revenueData.length === 0 && (
          <ChartState title="Ingresos por método de pago" subtitle={rangeLabel} message="No hay ingresos en el rango seleccionado." />
        )}
        {!revenueQuery.isLoading && !revenueQuery.isError && revenueData.length > 0 && (
          <RevenueChart data={revenueData} subtitle={rangeLabel} />
        )}
      </div>

      {/* Additional Stats - Responsive: 1 col mobile, 2 cols tablet, 3 cols desktop */}
      <StatGrid cols={3}>
        <StatCard
          title="Nuevos clientes"
          value="28"
          delta="+15%"
          trend="up"
          subtitle="este mes"
          icon="👥"
        />
        <StatCard
          title="Sesiones completadas"
          value="348"
          delta="+22"
          trend="up"
          subtitle="esta semana"
          icon="✅"
        />
        <StatCard
          title="Tasa de cancelación"
          value="4.2%"
          delta="-1.3%"
          trend="up"
          subtitle="mejorando"
          icon="📉"
        />
      </StatGrid>

      {/* Quick Actions Panel */}
      <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
          Acciones rápidas
        </h3>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <button 
            className="bloom-button"
            style={{ padding: '0.875rem 1.5rem' }}
            onClick={() => window.location.href = '/wizard'}
          >
            ➕ Nueva reserva
          </button>
          <button 
            className="bloom-button"
            style={{ 
              padding: '0.875rem 1.5rem',
              background: 'transparent',
              border: '1px solid var(--bloom-border)'
            }}
            onClick={() => window.location.href = '/pos'}
          >
            💳 Abrir POS
          </button>
          <button 
            className="bloom-button"
            style={{ 
              padding: '0.875rem 1.5rem',
              background: 'transparent',
              border: '1px solid var(--bloom-border)'
            }}
            onClick={() => window.location.href = '/notifications'}
          >
            📧 Ver notificaciones
          </button>
          <button 
            className="bloom-button"
            style={{ 
              padding: '0.875rem 1.5rem',
              background: 'transparent',
              border: '1px solid var(--bloom-border)'
            }}
            onClick={() => window.location.href = '/marketplace'}
          >
            🏪 Marketplace
          </button>
        </div>
      </div>
    </div>
  );
}
