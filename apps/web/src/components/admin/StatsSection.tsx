// src/components/admin/StatsSection.tsx
"use client";

import React from "react";
import "chart.js/auto"; // registra automáticamente escalas y controladores
import { Line } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import { Container, Row, Col, Spinner } from "react-bootstrap";
import { FaUsers, FaBoxOpen, FaCalendarAlt, FaDollarSign } from "react-icons/fa";
import { useAdminStats } from "@/hooks/useAdminStats";
import StatsCard from "./StatsCard";

export default function StatsSection() {
  const { data, isLoading, isError } = useAdminStats();

  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" /> Cargando reportes…
      </Container>
    );
  }
  if (isError || !data) {
    return (
      <Container className="py-5">
        <div className="alert alert-danger">Error al cargar reportes.</div>
      </Container>
    );
  }

  const {
    activeMembers,
    packagesSoldThisMonth,
    reservationsThisMonth,
    monthlyRevenue,
  } = data;

  // Total ingresos últimos 6 meses
  const total6m = monthlyRevenue.reduce((sum, cur) => sum + cur.revenue, 0);

  // Datos para el gráfico
  const chartData = {
    labels: monthlyRevenue.map((m) => m.month),
    datasets: [
      {
        label: "Ingresos",
        data: monthlyRevenue.map((m) => m.revenue),
        fill: false,
        tension: 0.3,
        borderColor: "#60bac2",
        pointBackgroundColor: "#60bac2",
        pointBorderColor: "#fff",
        pointRadius: 4,
      },
    ],
  };

  // Opciones tipadas para Chart.js
  const options: ChartOptions<"line"> = {
    scales: {
      x: {
        type: "category",
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: { stepSize: 500 },
      },
    },
    plugins: {
      legend: {
        position: "top",
        labels: { boxWidth: 20, padding: 16 },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Reportes</h1>

      {/* — Tarjetas con íconos — */}
      <Row className="g-3 mb-5">
        <Col md={3}>
          <StatsCard
            title="Miembros activos"
            value={activeMembers}
            icon={<FaUsers size={32} />}
          />
        </Col>
        <Col md={3}>
          <StatsCard
            title="Paquetes vendidos (mes)"
            value={packagesSoldThisMonth}
            icon={<FaBoxOpen size={32} />}
          />
        </Col>
        <Col md={3}>
          <StatsCard
            title="Reservas (mes)"
            value={reservationsThisMonth}
            icon={<FaCalendarAlt size={32} />}
          />
        </Col>
        <Col md={3}>
          <StatsCard
            title="Ingreso total (6m)"
            value={`MX$ ${total6m.toLocaleString()}`}
            icon={<FaDollarSign size={32} />}
          />
        </Col>
      </Row>

      {/* — Gráfico de líneas — */}
      <Row style={{ height: 400 }}>
        <Col>
          <h4>Ingresos Mensuales (últimos 6 meses)</h4>
          <div style={{ height: 300, position: "relative" }}>
            <Line data={chartData} options={options} redraw />
          </div>
        </Col>
      </Row>
    </Container>
  );
}
