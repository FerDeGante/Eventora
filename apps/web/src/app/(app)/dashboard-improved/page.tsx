'use client';

import { useState } from 'react';
import { StatCard, StatGrid } from '../../components/dashboard/StatCard';
import { ReservationsChart, RevenueChart } from '../../components/dashboard/Charts';
import { DateRangePicker } from '../../components/dashboard/DateRangePicker';
import { subDays } from 'date-fns';

// Mock data - en producción esto vendría de la API
const mockReservationsData = [
  { date: '24 Nov', reservations: 45, completed: 38, cancelled: 5 },
  { date: '25 Nov', reservations: 52, completed: 45, cancelled: 4 },
  { date: '26 Nov', reservations: 48, completed: 42, cancelled: 3 },
  { date: '27 Nov', reservations: 61, completed: 55, cancelled: 4 },
  { date: '28 Nov', reservations: 58, completed: 51, cancelled: 6 },
  { date: '29 Nov', reservations: 54, completed: 48, cancelled: 2 },
  { date: '30 Nov', reservations: 67, completed: 59, cancelled: 5 },
];

const mockRevenueData = [
  { period: 'Sem 1', stripe: 142000, pos: 58000, cash: 23000 },
  { period: 'Sem 2', stripe: 156000, pos: 62000, cash: 28000 },
  { period: 'Sem 3', stripe: 168000, pos: 71000, cash: 31000 },
  { period: 'Sem 4', stripe: 175000, pos: 69000, cash: 26000 },
];

export default function ImprovedDashboard() {
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 6),
    to: new Date(),
  });

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
        <ReservationsChart data={mockReservationsData} />
        <RevenueChart data={mockRevenueData} />
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
