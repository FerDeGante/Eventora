// src/components/PackageCard.tsx
import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { FaStopwatch, FaCalendarAlt, FaDollarSign } from 'react-icons/fa';

export interface Package {
  id: string;
  title: string;
  sessions?: number;       // opcional para “Otros servicios”
  inscription?: number;    // opcional
  price: number;
  description: string;
  image: string;
  priceId: string;
}

interface PackageCardProps {
  pkg: Package;
  onBuy?: () => void;
}

export default function PackageCard({ pkg, onBuy }: PackageCardProps) {
  return (
    <Card className="h-100 shadow-sm servicio-card text-center">
      <div className="card-img-wrap">
        <Card.Img variant="top" src={pkg.image} alt={pkg.title} />
      </div>
      <Card.Body className="d-flex flex-column">
        <Card.Title>
          {pkg.title} <span role="img" aria-label="estrella">✨</span>
        </Card.Title>
        <Card.Text className="flex-grow-1">
          {pkg.description}
          {pkg.sessions != null && pkg.inscription != null && (
            <>
              <br />
              <FaStopwatch /> {pkg.sessions} {pkg.sessions === 1 ? 'sesión' : 'sesiones'}
              <br />
              <FaCalendarAlt /> Vigencia: {pkg.inscription} días
            </>
          )}
          <br />
          <FaDollarSign /> ${pkg.price.toLocaleString()} MXN
        </Card.Text>
        {onBuy && (
          <Button onClick={onBuy} className="btn-orange mt-3">
            ¡Lo quiero!
          </Button>
        )}
      </Card.Body>
    </Card>
  );
}
