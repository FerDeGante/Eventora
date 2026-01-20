'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { FiltersBar } from '../../../components/FiltersBar';
import { DataTable, type Column } from '../../../components/DataTable';
import { getReservations, type Reservation as ApiReservation } from '@/lib/admin-api';

type ReservationStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

interface ReservationRow {
  id: string;
  date: string;
  time: string;
  client: string;
  service: string;
  therapist: string;
  status: ReservationStatus;
  amount: number;
}

const statusColors: Record<ReservationStatus, { bg: string; border: string; text: string }> = {
  pending: { bg: 'rgba(251, 191, 36, 0.2)', border: 'rgba(251, 191, 36, 0.4)', text: '#fbbf24' },
  confirmed: { bg: 'rgba(96, 186, 194, 0.2)', border: 'rgba(96, 186, 194, 0.4)', text: '#60bac2' },
  completed: { bg: 'rgba(34, 197, 94, 0.2)', border: 'rgba(34, 197, 94, 0.4)', text: '#22c55e' },
  cancelled: { bg: 'rgba(239, 68, 68, 0.2)', border: 'rgba(239, 68, 68, 0.4)', text: '#ef4444' },
  no_show: { bg: 'rgba(148, 163, 184, 0.2)', border: 'rgba(148, 163, 184, 0.4)', text: '#94a3b8' },
};

const statusLabels: Record<ReservationStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
  no_show: 'No show',
};

export default function ReservationsManagementPage() {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('search')?.trim() ?? '';
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<{ status?: string; service?: string }>({});
  const pageSize = 20;

  const statusFilter = filters.status?.toUpperCase();

  const { data: reservations = [], isLoading, error } = useQuery({
    queryKey: ['admin-reservations', page, pageSize, statusFilter],
    queryFn: () => getReservations({
      page,
      pageSize,
      status: statusFilter || undefined,
    }),
  });

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const rows = useMemo(() => (
    reservations.map((reservation: ApiReservation): ReservationRow => {
      const dateValue = reservation.startAt ?? reservation.createdAt;
      const startAt = dateValue ? new Date(dateValue) : null;
      const status = reservation.status?.toLowerCase() as ReservationStatus;
      return {
        id: reservation.id,
        date: dateValue,
        time: startAt ? format(startAt, 'HH:mm') : '--:--',
        client: reservation.user?.name || reservation.user?.email || 'Sin cliente',
        service: reservation.service?.name || 'Sin servicio',
        therapist: reservation.therapist?.name || 'Sin terapeuta',
        status: status || 'pending',
        amount: reservation.service?.price ?? 0,
      };
    })
  ), [reservations]);

  const filteredData = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase();
    const serviceFilter = filters.service?.toLowerCase();
    return rows.filter((row) => {
      if (serviceFilter && !row.service.toLowerCase().includes(serviceFilter)) {
        return false;
      }
      if (normalizedSearch) {
        const haystack = `${row.client} ${row.service} ${row.therapist}`.toLowerCase();
        return haystack.includes(normalizedSearch);
      }
      return true;
    });
  }, [rows, searchTerm, filters.service]);

  const columns: Column<ReservationRow>[] = [
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
      render: (value: ReservationRow['status']) => {
        const colors = statusColors[value] || statusColors.pending;
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
      render: (value) => `$${value.toLocaleString('es-MX')}`,
    },
  ];

  const filterOptions = [
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
    setFilters({
      status: typeof filters.status === 'string' ? filters.status : undefined,
      service: typeof filters.service === 'string' ? filters.service : undefined,
    });
    setPage(1);
  };

  const canGoBack = page > 1;
  const canGoForward = reservations.length === pageSize;

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
        filters={filterOptions} 
        onFilterChange={handleFilterChange}
      />

      {error && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ color: 'var(--color-text-secondary)' }}>
            ⚠️ No pudimos cargar las reservas. Intenta nuevamente en unos minutos.
          </div>
        </div>
      )}

      <DataTable
        data={filteredData}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        emptyMessage="No hay reservas para los filtros seleccionados"
        onRowClick={(row) => console.log('Clicked:', row)}
      />

      <div className="glass-panel" style={{ marginTop: '1.5rem', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          Página {page}
        </span>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="bloom-button"
            style={{ padding: '0.5rem 1rem', opacity: canGoBack ? 1 : 0.5 }}
            onClick={() => canGoBack && setPage((prev) => prev - 1)}
            disabled={!canGoBack || isLoading}
          >
            ← Anterior
          </button>
          <button
            type="button"
            className="bloom-button"
            style={{ padding: '0.5rem 1rem', opacity: canGoForward ? 1 : 0.5 }}
            onClick={() => canGoForward && setPage((prev) => prev + 1)}
            disabled={!canGoForward || isLoading}
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  );
}
