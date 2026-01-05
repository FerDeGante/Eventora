// src/components/admin/StatsCard.tsx
"use client";

import React from "react";
import { Card } from "react-bootstrap";
import type { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
}

export default function StatsCard({ title, value, icon }: StatsCardProps) {
  return (
    <Card className="stats-card h-100">
      <Card.Body className="d-flex align-items-center">
        <div className="me-3 stats-card-icon">
          {icon}
        </div>
        <div>
          <h2 className="stats-card-value mb-1">{value}</h2>
          <div className="stats-card-title text-secondary">{title}</div>
        </div>
      </Card.Body>
    </Card>
  );
}
