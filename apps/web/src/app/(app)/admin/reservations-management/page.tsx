'use client';

import { useState } from 'react';
import { FiltersBar } from '../../../components/FiltersBar';
import { DataTable, type Column } from '../../../components/DataTable';

interface Reservation {
  id: string;
  date: string;
  time: string;
  client: string;
  service: string;
  therapist: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  amount: number;
}

// Mock data
const mockReservations: Reservation[] = [
  { id: 'RES-001', date: '2025-11-30', time: '09:00', client: 'María González', service: 'Fisioterapia', therapist: 'Dr. Pérez', status: 'confirmed', amount: 500 },
  { id: 'RES-002', date: '2025-11-30', time: '10:00', client: 'Juan Martínez', service: 'Masajes', therapist: 'Ana López', status: 'completed', amount: 450 },
  { id: 'RES-003', date: '2025-11-30', time: '11:00', client: 'Pedro Sánchez', service: 'Quiropráctica', therapist: 'Dr. Ramírez', status: 'pending', amount: 600 },
  { id: 'RES-004', date: '2025-11-30', time: '14:00', client: 'Laura Jiménez', service: 'Hidroterapia', therapist: 'Carla Torres', status: 'confirmed', amount: 700 },
  { id: 'RES-005', date: '2025-11-30', time: '15:30', client: 'Carlos Ruiz', service: 'Fisioterapia', therapist: 'Dr. Pérez', status: 'cancelled', amount: 500 },
];

const statusColors = {
  pending: { bg: 'rgba(251, 191, 36, 0.2)', border: 'rgba(251, 191, 36, 0.4)', text: '#fbbf24' },
  confirmed: { bg: 'rgba(96, 186, 194, 0.2)', border: 'rgba(96, 186, 194, 0.4)', text: '#60bac2' },
  completed: { bg: 'rgba(34, 197, 94, 0.2)', border: 'rgba(34, 197, 94, 0.4)', text: '#22c55e' },
  cancelled: { bg: 'rgba(239, 68, 68, 0.2)', border: 'rgba(239, 68, 68, 0.4)', text: '#ef4444' },
};

const statusLabels = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

export default function ReservationsManagementPage() {
  const [filteredData, setFilteredData] = useState(mockReservations);

  const columns: Column<Reservation>[] = [
    {
      key: 'id',
      header: 'ID',
      width: '100px',
      sortable: true,
    },
    {
      key: 'date',
      header: 'Fecha',
      width: '120px',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('es-MX'),
    },
    {
      key: 'time',
      header: 'Hora',
      width: '80px',
    },
    {
      key: 'client',
      header: 'Cliente',
      sortable: true,
    },
    {
      key: 'service',
      header: 'Servicio',
      sortable: true,
    },
    {
      key: 'therapist',
      header: 'Terapeuta',
    },
    {
      key: 'status',
      header: 'Estado',
      width: '130px',
      sortable: true,
      render: (value: Reservation['status']) => {
        const colors = statusColors[value];
        return (
          <span style={{
            padding: '0.375rem 0.75rem',
            borderRadius: '999px',
            background: colors.bg,
            border: `1px solid ${colors.border}`,
            color: colors.text,
            fontSize: '0.75rem',
            fontWeight: 600,
            display: 'inline-block',
          }}>
            {statusLabels[value]}
          </span>
        );
      },
    },
    {
      key: 'amount',
      header: 'Monto',
      width: '100px',
      sortable: true,
      render: (value) => `$${value}`,
    },
  ];

  const filters = [
    {
      key: 'status',
      label: 'Estado',
      options: [
        { value: 'pending', label: 'Pendiente' },
        { value: 'confirmed', label: 'Confirmada' },
        { value: 'completed', label: 'Completada' },
        { value: 'cancelled', label: 'Cancelada' },
      ],
    },
    {
      key: 'service',
      label: 'Servicio',
      options: [
        { value: 'fisioterapia', label: 'Fisioterapia' },
        { value: 'masajes', label: 'Masajes' },
        { value: 'quiropractica', label: 'Quiropráctica' },
        { value: 'hidroterapia', label: 'Hidroterapia' },
      ],
    },
  ];

  const handleFilterChange = (filters: Record<string, string | string[]>) => {
    let filtered = [...mockReservations];
    
    if (filters.status) {
      filtered = filtered.filter(r => r.status === filters.status);
    }
    
    if (filters.service) {
      filtered = filtered.filter(r => 
        r.service.toLowerCase().includes((filters.service as string).toLowerCase())
      );
    }
    
    setFilteredData(filtered);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Gestión de Reservas
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Administra y filtra las reservas de tu clínica
        </p>
      </div>

      <FiltersBar 
        filters={filters} 
        onFilterChange={handleFilterChange}
      />

      <DataTable
        data={filteredData}
        columns={columns}
        rowKey="id"
        onRowClick={(row) => console.log('Clicked:', row)}
      />
    </div>
  );
}
