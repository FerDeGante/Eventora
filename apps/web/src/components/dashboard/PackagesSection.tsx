// src/components/dashboard/PackagesSection.tsx
"use client";

import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useRouter } from "next/router";
import PackageCard from "../PackageCard";
import { PackageDef, paquetes } from "@/lib/packages";

export default function PackagesSection() {
  const router = useRouter();

  const handleBuy = (pkg: PackageDef) => {
    router.push(
      {
        pathname: "/dashboard",
        query: {
          view: "reservar-paquete",
          pkgKey: pkg.id,
          sessions: pkg.sessions,
          priceId: pkg.priceId,
          title: pkg.title,
        },
      },
      undefined,
      { shallow: true }
    );
  };

  const renderGroup = (label: string, category: PackageDef["category"]) => {
    const grupo = paquetes.filter((p) => p.category === category);
    if (grupo.length === 0) return null;
    return (
      <section key={category}>
        <h2 className="mb-4">{label}</h2>
        <Row className="g-4 mb-5">
          {grupo.map((pkg) => (
            <Col key={pkg.priceId} md={3}>
              <PackageCard pkg={pkg} onBuy={() => handleBuy(pkg)} />
            </Col>
          ))}
        </Row>
      </section>
    );
  };

  return (
    <Container className="py-4">
      {renderGroup("Estimulación temprana en agua", "agua")}
      {renderGroup("Estimulación temprana en piso", "piso")}
      {renderGroup("Fisioterapia", "fisio")}
      {renderGroup("Otros servicios", "otros")}
    </Container>
  );
}
