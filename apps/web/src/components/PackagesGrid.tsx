// src/components/PackagesGrid.tsx
import React from 'react';
import PackageCard, { Package } from './PackageCard';

interface PackagesGridProps {
  paquetes: Package[];
  onBuy: (pkgId: string) => void;
}

export default function PackagesGrid({ paquetes, onBuy }: PackagesGridProps) {
  return (
    <div className="row g-4">
      {paquetes.map(p => (
        <div key={p.id} className="col-12 col-md-4">
          <PackageCard pkg={p} onBuy={() => onBuy(p.id)} />
        </div>
      ))}
    </div>
  );
}
