"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SectionHeading } from "@/app/components/ui/SectionHeading";
import { GlowCard } from "@/app/components/ui/GlowCard";
import { 
  getReportSummary, 
  getTopServices, 
  getOccupancyReport,
} from "@/lib/admin-api";
import { 
  DollarSign, 
  Calendar, 
  Users, 
  Award, 
  TrendingUp, 
  TrendingDown,
  BarChart2,
  Clock,
  Download,
  Printer,
} from "react-feather";

type DateRange = "today" | "week" | "month" | "quarter" | "year" | "custom";

function getDateRange(range: DateRange): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  
  switch (range) {
    case "today":
      start.setHours(0, 0, 0, 0);
      break;
    case "week":
      start.setDate(end.getDate() - 7);
      break;
    case "month":
      start.setMonth(end.getMonth() - 1);
      break;
    case "quarter":
      start.setMonth(end.getMonth() - 3);
      break;
    case "year":
      start.setFullYear(end.getFullYear() - 1);
      break;
    case "custom":
      // Will be handled by custom date inputs
      break;
  }
  
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange>("month");
  const { start, end } = getDateRange(dateRange);
  const [isExporting, setIsExporting] = useState(false);

  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ["report-summary", start, end],
    queryFn: () => getReportSummary(start, end),
  });

  const { data: topServices = [], isLoading: loadingServices } = useQuery({
    queryKey: ["top-services", start, end],
    queryFn: () => getTopServices(start, end, 5),
  });

  const { data: occupancy = [], isLoading: loadingOccupancy } = useQuery({
    queryKey: ["occupancy", start, end],
    queryFn: () => getOccupancyReport(start, end),
  });

  const rangeLabels: Record<DateRange, string> = {
    "today": "Hoy",
    "week": "Esta semana",
    "month": "Este mes",
    "quarter": "Este trimestre",
    "year": "Este año",
    "custom": "Personalizado",
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      // Prepare CSV data
      const csvData = [
        ["Métrica", "Valor"],
        ["Ingresos", formatCurrency(summary?.revenue.current ?? 0)],
        ["Reservaciones", String(summary?.bookings.current ?? 0)],
        ["Clientes activos", String(summary?.activeClients ?? 0)],
        ["Membresías activas", String(summary?.activeMemberships ?? 0)],
        [""],
        ["Servicio", "Reservaciones", "Ingresos"],
        ...topServices.map(s => [s.serviceName, String(s.bookings), formatCurrency(s.revenue)]),
        [""],
        ["Sucursal", "Reservaciones"],
        ...occupancy.map(b => [b.branchName, String(b.reservations)]),
      ];
      
      const csv = csvData.map(row => row.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `reporte-${dateRange}-${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting CSV:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="reports-page">
      <section className="reports-header glass-panel">
        <SectionHeading eyebrow="Analíticas" title="Reportes">
          Visualiza el rendimiento de tu negocio con métricas clave.
        </SectionHeading>
        
        <div className="reports-filters">
          <div className="date-range-selector">
            {(Object.keys(rangeLabels) as DateRange[]).map((range) => (
              <button
                key={range}
                className={`range-btn ${dateRange === range ? "active" : ""}`}
                onClick={() => setDateRange(range)}
              >
                {rangeLabels[range]}
              </button>
            ))}
          </div>
          
          <div className="reports-actions">
            <button
              className="action-btn"
              onClick={handleExportCSV}
              disabled={isExporting || loadingSummary}
              title="Exportar a CSV"
            >
              <Download size={16} />
              {isExporting ? "Exportando..." : "Exportar CSV"}
            </button>
            <button
              className="action-btn"
              onClick={handlePrint}
              disabled={loadingSummary}
              title="Imprimir reporte"
            >
              <Printer size={16} />
              Imprimir
            </button>
          </div>
        </div>
      </section>

      {/* Summary Cards */}
      <section className="reports-summary">
        <GlowCard>
          <div className="stat-card">
            <div className="stat-card__icon stat-card__icon--revenue">
              <DollarSign size={24} />
            </div>
            <div className="stat-card__content">
              <span className="stat-card__label">Ingresos</span>
              <span className="stat-card__value">
                {loadingSummary ? "..." : formatCurrency(summary?.revenue.current ?? 0)}
              </span>
              {summary && (
                <span className={`stat-card__change ${summary.revenue.change >= 0 ? "positive" : "negative"}`}>
                  {summary.revenue.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {Math.abs(summary.revenue.change)}%
                </span>
              )}
            </div>
          </div>
        </GlowCard>

        <GlowCard>
          <div className="stat-card">
            <div className="stat-card__icon stat-card__icon--bookings">
              <Calendar size={24} />
            </div>
            <div className="stat-card__content">
              <span className="stat-card__label">Reservaciones</span>
              <span className="stat-card__value">
                {loadingSummary ? "..." : summary?.bookings.current ?? 0}
              </span>
              {summary && (
                <span className={`stat-card__change ${summary.bookings.change >= 0 ? "positive" : "negative"}`}>
                  {summary.bookings.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {Math.abs(summary.bookings.change)}%
                </span>
              )}
            </div>
          </div>
        </GlowCard>

        <GlowCard>
          <div className="stat-card">
            <div className="stat-card__icon stat-card__icon--clients">
              <Users size={24} />
            </div>
            <div className="stat-card__content">
              <span className="stat-card__label">Clientes activos</span>
              <span className="stat-card__value">
                {loadingSummary ? "..." : summary?.activeClients ?? 0}
              </span>
            </div>
          </div>
        </GlowCard>

        <GlowCard>
          <div className="stat-card">
            <div className="stat-card__icon stat-card__icon--memberships">
              <Award size={24} />
            </div>
            <div className="stat-card__content">
              <span className="stat-card__label">Membresías activas</span>
              <span className="stat-card__value">
                {loadingSummary ? "..." : summary?.activeMemberships ?? 0}
              </span>
            </div>
          </div>
        </GlowCard>
      </section>

      {/* Charts Section */}
      <section className="reports-charts">
        <GlowCard>
          <div className="chart-card">
            <div className="chart-card__header">
              <BarChart2 size={20} />
              <h3>Servicios más reservados</h3>
            </div>
            <div className="chart-card__content">
              {loadingServices ? (
                <div className="chart-loading">
                  <div className="loading-spinner-sm"></div>
                  <p>Cargando...</p>
                </div>
              ) : topServices.length === 0 ? (
                <div className="chart-empty">
                  <div className="empty-icon-sm">📊</div>
                  <p>No hay datos para el periodo seleccionado</p>
                </div>
              ) : (
                <div className="service-ranking">
                  {topServices.map((service, index) => (
                    <div key={service.serviceId} className="service-rank-item">
                      <span className="rank-position">#{index + 1}</span>
                      <div className="rank-details">
                        <span className="rank-name">{service.serviceName}</span>
                        <span className="rank-stats">
                          {service.bookings} reservaciones • {formatCurrency(service.revenue)}
                        </span>
                      </div>
                      <div className="rank-bar-container">
                        <div 
                          className="rank-bar" 
                          style={{ 
                            width: `${(service.bookings / (topServices[0]?.bookings || 1)) * 100}%` 
                          }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </GlowCard>

        <GlowCard>
          <div className="chart-card">
            <div className="chart-card__header">
              <Clock size={20} />
              <h3>Ocupación por sucursal</h3>
            </div>
            <div className="chart-card__content">
              {loadingOccupancy ? (
                <div className="chart-loading">
                  <div className="loading-spinner-sm"></div>
                  <p>Cargando...</p>
                </div>
              ) : occupancy.length === 0 ? (
                <div className="chart-empty">
                  <div className="empty-icon-sm">🏢</div>
                  <p>No hay datos para el periodo seleccionado</p>
                </div>
              ) : (
                <div className="occupancy-list">
                  {occupancy.map((branch) => (
                    <div key={branch.branchId} className="occupancy-item">
                      <span className="occupancy-name">{branch.branchName}</span>
                      <span className="occupancy-count">{branch.reservations} reservaciones</span>
                      <div className="occupancy-bar-container">
                        <div 
                          className="occupancy-bar" 
                          style={{ 
                            width: `${(branch.reservations / Math.max(...occupancy.map(b => b.reservations), 1)) * 100}%` 
                          }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </GlowCard>
      </section>

      <style jsx>{`
        .reports-page {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .reports-header {
          padding: 2rem;
          border-radius: 1rem;
        }

        .reports-filters {
          margin-top: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .date-range-selector {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .reports-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border: 1px solid var(--border-subtle);
          border-radius: 0.5rem;
          background: var(--surface-elevated);
          color: var(--text-secondary);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-btn:hover:not(:disabled) {
          border-color: var(--primary);
          color: var(--primary);
        }

        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .range-btn {
          padding: 0.5rem 1rem;
          border: 1px solid var(--border-subtle);
          border-radius: 0.5rem;
          background: var(--surface-elevated);
          color: var(--text-secondary);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .range-btn:hover {
          border-color: var(--primary);
          color: var(--primary);
        }

        .range-btn.active {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }

        .reports-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
        }

        .stat-card {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.25rem;
        }

        .stat-card__icon {
          width: 48px;
          height: 48px;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-card__icon--revenue {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
        }

        .stat-card__icon--bookings {
          background: rgba(99, 102, 241, 0.15);
          color: #6366f1;
        }

        .stat-card__icon--clients {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }

        .stat-card__icon--memberships {
          background: rgba(236, 72, 153, 0.15);
          color: #ec4899;
        }

        .stat-card__content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .stat-card__label {
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .stat-card__value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .stat-card__change {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .stat-card__change.positive {
          color: #10b981;
        }

        .stat-card__change.negative {
          color: #ef4444;
        }

        .reports-charts {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 1rem;
        }

        .chart-card {
          padding: 1.5rem;
        }

        .chart-card__header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          color: var(--text-primary);
        }

        .chart-card__header h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
        }

        .chart-loading,
        .chart-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          text-align: center;
          color: var(--text-muted);
          padding: 2rem;
        }

        .loading-spinner-sm {
          width: 32px;
          height: 32px;
          border: 3px solid var(--border-subtle);
          border-top-color: var(--accent-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .empty-icon-sm {
          font-size: 2rem;
          opacity: 0.5;
        }

        .service-ranking {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .service-rank-item {
          display: grid;
          grid-template-columns: auto 1fr 120px;
          align-items: center;
          gap: 1rem;
        }

        .rank-position {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--primary);
          width: 28px;
        }

        .rank-details {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }

        .rank-name {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .rank-stats {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .rank-bar-container {
          height: 8px;
          background: var(--surface-elevated);
          border-radius: 4px;
          overflow: hidden;
        }

        .rank-bar {
          height: 100%;
          background: linear-gradient(90deg, var(--primary), var(--primary-light, #818cf8));
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .occupancy-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .occupancy-item {
          display: grid;
          grid-template-columns: 1fr auto 100px;
          align-items: center;
          gap: 1rem;
        }

        .occupancy-name {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .occupancy-count {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .occupancy-bar-container {
          height: 8px;
          background: var(--surface-elevated);
          border-radius: 4px;
          overflow: hidden;
        }

        .occupancy-bar {
          height: 100%;
          background: linear-gradient(90deg, #f59e0b, #fbbf24);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        @media (max-width: 768px) {
          .reports-charts {
            grid-template-columns: 1fr;
          }

          .service-rank-item,
          .occupancy-item {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }

          .rank-bar-container,
          .occupancy-bar-container {
            width: 100%;
          }

          .reports-filters {
            flex-direction: column;
            align-items: stretch;
          }

          .reports-actions {
            width: 100%;
          }

          .action-btn {
            flex: 1;
          }
        }

        /* Print styles */
        @media print {
          .reports-filters,
          .reports-actions {
            display: none;
          }

          .reports-page {
            max-width: 100%;
          }

          .glass-panel {
            border: 1px solid #ddd;
            background: white;
          }

          .stat-card__icon {
            display: none;
          }

          .chart-card {
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
