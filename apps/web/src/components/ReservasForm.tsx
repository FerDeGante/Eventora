// src/components/ReservasForm.tsx
"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Container, Form, Button, Alert, Row, Col } from "react-bootstrap";
import { loadStripe } from "@stripe/stripe-js";

interface Servicio {
  slug: string;
  label: string;
  priceId: string;
}
const servicios: Servicio[] = [
  { slug: "agua", label: "Estimulación en agua", priceId: "price_1RJd0OFV5ZpZiouCasDGf28F" },
  { slug: "piso", label: "Estimulación en piso", priceId: "price_1RJd1jFV5ZpZiouC1xXvllVc" },
  { slug: "quiropractica", label: "Quiropráctica", priceId: "price_1RJd2fFV5ZpZiouCsaJNkUTO" },
  { slug: "fisioterapia", label: "Fisioterapia", priceId: "price_1RJd3WFV5ZpZiouC9PDzHjKU" },
  { slug: "masajes", label: "Masajes", priceId: "price_1RJd4JFV5ZpZiouCPjcpX3Xn" },
  { slug: "cosmetologia", label: "Cosmetología", priceId: "price_1RJd57FV5ZpZiouCpcrKNvJV" },
  { slug: "prevencion-lesiones", label: "Prevención de lesiones", priceId: "price_1RJd57FV5ZpZiouCpcrKNvJV" },
  { slug: "preparacion-fisica", label: "Preparación física", priceId: "price_1RJd6EFV5ZpZiouCYwD4J3I8" },
  { slug: "nutricion", label: "Nutrición", priceId: "price_1RJd7qFV5ZpZiouCbj6HrFJF" },
  { slug: "medicina-rehabilitacion", label: "Medicina en rehabilitación", priceId: "price_1RJd9HFV5ZpZiouClVlCujAm" },
  { slug: "terpia-post-vacuna", label: "Terapia post vacuna", priceId: "price_1ROMxFFV5ZpZiouCdkM2KoHF" },
];
const terapeutas = [
  "Jesús Ramírez",
  "Miguel Ramírez",
  "Alitzel Pacheco",
  "Francia",
  "Gisela",
  "María del Carmen",
];

export default function ReservasForm() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [servicio, setServicio] = useState<string>("");
  const [terapeuta, setTerapeuta] = useState<string>("");
  const [fecha, setFecha] = useState<Date | null>(null);
  const [horario, setHorario] = useState<number | null>(null);
  const [error, setError] = useState<string>("");
  const [availableHours, setAvailableHours] = useState<number[]>([]);

  const horasSemana = Array.from({ length: 9 }, (_, i) => 10 + i); // 10–18
  const horasSabado = Array.from({ length: 6 }, (_, i) => 9 + i);   // 9–14

  // 1) Protección de ruta
  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  // 2) Filtrar horas pasadas
  useEffect(() => {
    if (!fecha) {
      setAvailableHours([]);
      return;
    }
    const now = new Date();
    const base = fecha.getDay() === 6 ? horasSabado : horasSemana;
    const filtered =
      fecha.toDateString() === now.toDateString()
        ? base.filter((h) => h > now.getHours())
        : base;
    setAvailableHours(filtered);
  }, [fecha, horasSemana, horasSabado]);

  // 3) Paso 1 → validación y siguiente
  const handleNext = (e: FormEvent) => {
    e.preventDefault();
    if (!servicio || !terapeuta || !fecha || horario === null) {
      setError("Por favor completa todos los campos");
      return;
    }
    setError("");
    setStep(2);
  };

  // 4) Confirmar y Stripe
  const handleConfirm = async () => {
    const svc = servicios.find((s) => s.slug === servicio)!;
    const stripeBody = {
      priceId: svc.priceId,
      metadata: {
        userId: session?.user?.id ?? "",
        servicio,
        terapeuta,
        date: fecha!.toISOString(),
        hour: `${horario}:00`,
      },
    };
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stripeBody),
    });
    const { sessionId } = await res.json();
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
    stripe?.redirectToCheckout({ sessionId });
  };

  if (status === "loading" || !session) {
    return <Container className="py-5 text-center">Cargando…</Container>;
  }

  return (
    <Container className="py-5 dashboard-container">
      <h2 className="dashboard-header">Reservar cita</h2>

      {step === 1 ? (
        <>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleNext} style={{ maxWidth: 600, margin: "0 auto" }}>
            {/* Servicio */}
            <Form.Group className="mb-3">
              <Form.Label>Servicio</Form.Label>
              <Form.Select
                value={servicio}
                onChange={(e) => {
                  setServicio(e.target.value);
                  setFecha(null);
                  setHorario(null);
                }}
                required
              >
                <option value="">Selecciona un servicio</option>
                {servicios.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Terapeuta */}
            <Form.Group className="mb-3">
              <Form.Label>Terapeuta</Form.Label>
              <Form.Select
                value={terapeuta}
                onChange={(e) => {
                  setTerapeuta(e.target.value);
                  setFecha(null);
                  setHorario(null);
                }}
                required
              >
                <option value="">Selecciona un terapeuta</option>
                {terapeutas.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Fecha */}
            <Form.Group className="mb-4">
              <Form.Label>Fecha</Form.Label>
              <Calendar
                onChange={(d) => setFecha(Array.isArray(d) ? d[0] : d)}
                value={fecha ?? new Date()}
                minDate={new Date()}
                tileDisabled={({ date }) => date.getDay() === 0}
                className="mb-3"
              />
            </Form.Group>

            {/* Hora */}
            {fecha && (
              <Form.Group className="mb-4">
                <Form.Label>Hora</Form.Label>
                <Row>
                  {availableHours.map((h) => (
                    <Col xs={4} md={3} key={h}>
                      <Button
                        variant="outline-primary"
                        className={`w-100 slot-btn ${horario === h ? "selected" : ""}`}
                        type="button"
                        onClick={() => setHorario(h)}
                      >
                        {h}:00
                      </Button>
                    </Col>
                  ))}
                </Row>
              </Form.Group>
            )}

            <Button type="submit" className="w-100 btn-orange">
              Siguiente
            </Button>
          </Form>
        </>
      ) : (
        <>
          <div className="p-4" style={{ maxWidth: 600, margin: "0 auto" }}>
            <h3>Confirma tu reserva</h3>
            <p>
              <strong>Servicio:</strong>{" "}
              {servicios.find((s) => s.slug === servicio)?.label}
            </p>
            <p>
              <strong>Terapeuta:</strong> {terapeuta}
            </p>
            <p>
              <strong>Fecha:</strong>{" "}
              {fecha?.toLocaleDateString()} a las {horario}:00
            </p>
            <Button onClick={handleConfirm} className="w-100 btn-orange mb-2">
              Confirmar y Pagar
            </Button>
            <Button variant="link" onClick={() => setStep(1)}>
              ← Volver
            </Button>
          </div>
        </>
      )}
    </Container>
  );
}