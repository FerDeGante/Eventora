'use client';

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ReservationsChartProps {
  data: Array<{
    date: string;
    reservations: number;
    completed: number;
    cancelled: number;
  }>;
}

export function ReservationsChart({ data }: ReservationsChartProps) {
  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Reservas por día
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          Últimos 7 días
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="date" 
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: '0.75rem' }}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: '0.75rem' }}
          />
          <Tooltip 
            contentStyle={{ 
              background: 'rgba(6, 15, 48, 0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              backdropFilter: 'blur(12px)',
            }}
            labelStyle={{ color: '#f8fbff', fontWeight: 600 }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '0.875rem' }}
            iconType="circle"
          />
          <Line 
            type="monotone" 
            dataKey="reservations" 
            name="Total"
            stroke="#60bac2" 
            strokeWidth={2}
            dot={{ fill: '#60bac2', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="completed" 
            name="Completadas"
            stroke="#22c55e" 
            strokeWidth={2}
            dot={{ fill: '#22c55e', r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="cancelled" 
            name="Canceladas"
            stroke="#ef4444" 
            strokeWidth={2}
            dot={{ fill: '#ef4444', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface RevenueChartProps {
  data: Array<{
    period: string;
    stripe: number;
    pos: number;
    cash: number;
  }>;
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Ingresos por método de pago
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          Últimas 4 semanas
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="period" 
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: '0.75rem' }}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.5)"
            style={{ fontSize: '0.75rem' }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip 
            contentStyle={{ 
              background: 'rgba(6, 15, 48, 0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              backdropFilter: 'blur(12px)',
            }}
            labelStyle={{ color: '#f8fbff', fontWeight: 600 }}
            formatter={(value: number | undefined) => value ? `$${value.toLocaleString()} MXN` : '$0 MXN'}
          />
          <Legend 
            wrapperStyle={{ fontSize: '0.875rem' }}
            iconType="rect"
          />
          <Bar dataKey="stripe" name="Stripe" fill="#635bff" radius={[8, 8, 0, 0]} />
          <Bar dataKey="pos" name="POS" fill="#60bac2" radius={[8, 8, 0, 0]} />
          <Bar dataKey="cash" name="Efectivo" fill="#22c55e" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
