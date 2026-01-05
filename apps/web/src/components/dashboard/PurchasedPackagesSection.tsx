"use client";

import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Badge,
} from "react-bootstrap";
import { useRouter } from "next/router";
import type { UserPackageResponse } from "@/pages/api/dashboard/packages";

export default function PurchasedPackagesSection() {
  const [packages, setPackages] = useState<UserPackageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/dashboard/packages")
      .then((r) => r.json())
      .then((data: UserPackageResponse[]) =>
        setPackages(
          data
            .filter((pkg) => new Date(pkg.expiresAt) > new Date()) // solo vigentes
            .sort(
              (a, b) =>
                new Date(a.expiresAt).getTime() -
                new Date(b.expiresAt).getTime()
            )
        )
      )
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSchedule = (pkg: UserPackageResponse) => {
    router.push(
      {
        pathname: "/dashboard",
        query: {
          view: "reservar-paquete",
          pkgKey: pkg.pkgId,
          sessions: 1,
          priceId: pkg.priceId,
        },
      },
      undefined,
      { shallow: true }
    );
  };

  if (loading)
    return <Spinner className="m-5" animation="border" />;

  if (packages.length === 0) {
    return (
      <Alert variant="info" className="text-center">
        No tienes paquetes vigentes.
        <Button
          variant="primary"
          className="ms-3"
          onClick={() =>
            router.push("/dashboard?tab=reservar", undefined, {
              shallow: true,
            })
          }
        >
          Comprar paquete
        </Button>
      </Alert>
    );
  }

  return (
    <Container className="py-4">
      <h3 className="mb-4 text-center">Mis paquetes vigentes</h3>
      <Row className="g-4">
        {packages.map((pkg) => {
          const sesionesRestantes = pkg.sessionsRemaining;
          const expirado = new Date(pkg.expiresAt) < new Date();

          return (
            <Col key={pkg.id} md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>
                    {pkg.pkgName}{" "}
                    {expirado && (
                      <Badge bg="danger" className="ms-2">
                        Vencido
                      </Badge>
                    )}
                  </Card.Title>
                  <Card.Text>
                    Comprado: {new Date(pkg.createdAt).toLocaleDateString()}
                  </Card.Text>
                  <Card.Text>
                    Vence: {new Date(pkg.expiresAt).toLocaleDateString()}
                  </Card.Text>
                  <Card.Text>
                    Sesiones restantes:{" "}
                    <strong>
                      {sesionesRestantes > 0 ? sesionesRestantes : 0}
                    </strong>
                  </Card.Text>
                  {!expirado && sesionesRestantes > 0 ? (
                    <Button
                      className="btn-orange"
                      onClick={() => handleSchedule(pkg)}
                    >
                      Agendar sesión
                    </Button>
                  ) : (
                    <Button className="btn-orange" disabled>
                      {expirado
                        ? "Paquete vencido"
                        : "Sin sesiones disponibles"}
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
}