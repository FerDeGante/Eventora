// src/components/dashboard/ReservarPaquete.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  Container,
  Button,
  Alert,
  ListGroup,
  Spinner,
  Row,
  Col,
  Card,
} from "react-bootstrap";
import { loadStripe } from "@stripe/stripe-js";

// priceId ➔ serviceId
const priceToServiceId: Record<string, string> = {
  "price_1RJd0OFV5ZpZiouCasDGf28F": "agua_1",
  "price_1RMBAKFV5ZpZiouCCnrjam5N": "agua_4",
  "price_1RMBFKFV5ZpZiouCJ1vHKREU": "agua_8",
  "price_1RMBIaFV5ZpZiouC8l6QjW2N": "agua_12",
  "price_1RJd1jFV5ZpZiouC1xXvllVc": "piso_1",
  "price_1RP6S2FV5ZpZiouC6cVpXQsJ": "piso_4",
  "price_1RP6TaFV5ZpZiouCoG5G58S3": "piso_12",
  "price_1RP6SsFV5ZpZiouCtbg4A7OE": "piso_8",
  "price_1RJd3WFV5ZpZiouC9PDzHjKU": "fisio_1",
  "price_1RP6WwFV5ZpZiouCN3m0luq3": "fisio_5",
  "price_1RP6W9FV5ZpZiouCBXnZwxLW": "fisio_10",
  "price_1ROMxFFV5ZpZiouCdkM2KoHF": "post_vacuna",
  "price_1RJd2fFV5ZpZiouCsaJNkUTO": "quiropractica",
  "price_1RJd4JFV5ZpZiouCPjcpX3Xn": "masajes",
  "price_1RQaDGFV5ZpZiouCdNjxrjVk": "cosmetologia",
  "price_1RJd57FV5ZpZiouCpcrKNvJV": "prevencion_lesiones",
  "price_1RJd6EFV5ZpZiouCYwD4J3I8": "preparacion_fisica",
  "price_1RJd7qFV5ZpZiouCbj6HrFJF": "nutricion",
  "price_1RJd9HFV5ZpZiouClVlCujAm": "medicina_rehab",
};

// priceId ➔ costo (MXN)
function getPrecioPaquete(priceId: string): string {
  switch (priceId) {
    case "price_1RJd0OFV5ZpZiouCasDGf28F": return "500";
    case "price_1RMBAKFV5ZpZiouCCnrjam5N": return "1400";
    case "price_1RMBFKFV5ZpZiouCJ1vHKREU": return "2250";
    case "price_1RMBIaFV5ZpZiouC8l6QjW2N": return "2500";
    case "price_1RJd1jFV5ZpZiouC1xXvllVc": return "500";
    case "price_1RP6S2FV5ZpZiouC6cVpXQsJ": return "1400";
    case "price_1RP6TaFV5ZpZiouCoG5G58S3": return "2500";
    case "price_1RP6SsFV5ZpZiouCtbg4A7OE": return "2250";
    case "price_1RJd3WFV5ZpZiouC9PDzHjKU": return "500";
    case "price_1RP6WwFV5ZpZiouCN3m0luq3": return "2000";
    case "price_1RP6W9FV5ZpZiouCBXnZwxLW": return "3000";
    case "price_1ROMxFFV5ZpZiouCdkM2KoHF": return "500";
    case "price_1RJd2fFV5ZpZiouCsaJNkUTO": return "500";
    case "price_1RJd4JFV5ZpZiouCPjcpX3Xn": return "500";
    case "price_1RQaDGFV5ZpZiouCdNjxrjVk": return "500";
    case "price_1RJd57FV5ZpZiouCpcrKNvJV": return "500";
    case "price_1RJd6EFV5ZpZiouCYwD4J3I8": return "500";
    case "price_1RJd7qFV5ZpZiouCbj6HrFJF": return "500";
    case "price_1RJd9HFV5ZpZiouClVlCujAm": return "500";
    default: return "—";
  }
}

// Máximo sesiones/semana según paquete
function maxSesionesPorSemana(sesiones: number) {
  if (sesiones === 4) return 1;
  if (sesiones === 8) return 2;
  if (sesiones === 12) return 3;
  return 1;
}

export default function ReservarPaquete({
  pkgKey,
  sessions: sessionCount,
  priceId: propPriceId,
}: {
  pkgKey: string;
  sessions: number;
  priceId: string;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { title, expiresAt } = router.query;

  // Wizard states
  const [slots, setSlots] = useState<{ date: Date | null; hora: number | null }[]>(
    Array.from({ length: sessionCount }, () => ({ date: null, hora: null }))
  );
  const [current, setCurrent] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Horas ocupadas reales del backend (por paquete)
  const [busySlots, setBusySlots] = useState<{ date: string; hour: number }[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") window.location.replace("/login");
  }, [status]);

  useEffect(() => {
    if (!pkgKey) return;
    fetch(`/api/appointments/busy-slots?packageId=${pkgKey}`)
      .then((res) => res.json())
      .then((data) => setBusySlots(data.slots || []))
      .catch(() => setBusySlots([]));
  }, [pkgKey]);

  // Valida si el horario está ocupado o excede el máximo por semana
  function isHourDisabled(date: Date, hour: number) {
    const ymd = date.toISOString().split("T")[0];
    // 1. Ocupado real
    if (busySlots.some((s) => s.date === ymd && s.hour === hour)) return true;
    // 2. Ocupado ya en wizard
    if (
      slots.some(
        (s, idx) =>
          idx !== current &&
          s.date &&
          s.date.toISOString().split("T")[0] === ymd &&
          s.hora === hour
      )
    ) return true;
    // 3. Candado: máximo sesiones por semana
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 7);
    const sesionesEnSemana =
      slots.filter(
        (s, idx) =>
          idx !== current &&
          s.date &&
          new Date(s.date) >= weekStart &&
          new Date(s.date) < weekEnd
      ).length +
      // + la que está seleccionando aquí (si aplica)
      (slots[current].date &&
      new Date(slots[current].date!) >= weekStart &&
      new Date(slots[current].date!) < weekEnd
        ? 1
        : 0
      );
    if (sesionesEnSemana > maxSesionesPorSemana(sessionCount)) return true;
    return false;
  }

  // Horas
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 30);

  const thisSlot = slots[current];
  const weekdayHours = [9,10,11,12,13,14,15,16,17,18];
  const saturdayHours = [9,10,11,12,13,14];
  let availableHours: number[] = [];
  if (thisSlot.date) {
    const isSaturday = thisSlot.date.getDay() === 6;
    const base = isSaturday ? saturdayHours : weekdayHours;
    const isToday = thisSlot.date.toDateString() === today.toDateString();
    const nowHour = new Date().getHours();
    availableHours = base.filter(
      (h) =>
        (isToday ? h > nowHour : true) &&
        !isHourDisabled(thisSlot.date!, h)
    );
  }

  function updateSlot(data: Partial<{ date: Date | null; hora: number | null }>) {
    setSlots((prev) => {
      const next = [...prev];
      next[current] = { ...next[current], ...data };
      return next;
    });
  }

  function nextStep() {
    if (!thisSlot.date || thisSlot.hora === null)
      return setError("Elige fecha y hora");
    setError("");
    if (current < sessionCount - 1) setCurrent((c) => c + 1);
  }

  function prevStep() {
    if (current > 0) setCurrent((c) => c - 1);
  }

  async function confirmAll() {
    setLoading(true);
    const dates = slots.map((s) => s.date!.toISOString());
    const hoursArr = slots.map((s) => `${s.hora}:00`);
    const serviceId = priceToServiceId[propPriceId];
    const serviceName = title as string;

    const metadata = {
      userId: session?.user?.id ?? "",
      serviceId,
      serviceName,
      dates: JSON.stringify(dates),
      hours: JSON.stringify(hoursArr),
    };

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId: propPriceId, metadata }),
    });
    const { sessionId } = await res.json();
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
    await stripe?.redirectToCheckout({ sessionId });
    setLoading(false);
  }

  function mostrarVencimiento(expiresAt?: string | string[]) {
    if (!expiresAt) return null;
    const dt = Array.isArray(expiresAt) ? expiresAt[0] : expiresAt;
    return new Date(dt).toLocaleDateString();
  }

  if (
    status === "loading" ||
    !session ||
    !propPriceId ||
    !title ||
    isNaN(sessionCount)
  ) {
    return <Spinner className="m-5" animation="border" />;
  }

  return (
    <Container className="py-5">
      <Row>
        {/* Wizard */}
        <Col md={7} sm={12}>
          <Card className="mb-4 p-3">
            <h2 className="dashboard-header mb-4">
              Sesión {current + 1} de {sessionCount}
            </h2>
            {error && <Alert variant="danger">{error}</Alert>}

            <Calendar
              onChange={(d) =>
                updateSlot({
                  date: Array.isArray(d) ? d[0] : d,
                  hora: null,
                })
              }
              value={thisSlot.date || today}
              minDate={today}
              maxDate={maxDate}
              // ¡No bloqueamos domingos!
              // tileDisabled={({ date }) => false}
            />
            {thisSlot.date && (
              <div className="mt-3">
                <strong>Hora:</strong>{" "}
                {availableHours.length === 0 ? (
                  <span className="text-danger ms-2">Sin horarios disponibles</span>
                ) : (
                  availableHours.map((h) => (
                    <Button
                      key={h}
                      variant={thisSlot.hora === h ? "primary" : "outline-primary"}
                      className="me-1 mb-2"
                      onClick={() => updateSlot({ hora: h })}
                    >
                      {h}:00
                    </Button>
                  ))
                )}
              </div>
            )}

            <div className="mt-4 d-flex justify-content-between">
              {current > 0 && (
                <Button variant="secondary" onClick={prevStep}>
                  ← Anterior
                </Button>
              )}
              {current < sessionCount - 1 ? (
                <Button className="btn-orange" onClick={nextStep}>
                  Siguiente
                </Button>
              ) : (
                <Button className="btn-orange" onClick={confirmAll} disabled={loading}>
                  {loading ? "Reservando..." : "Confirmar reservación"}
                </Button>
              )}
            </div>
          </Card>
        </Col>
        {/* Resumen lateral */}
        <Col md={5} sm={12}>
          <Card className="mb-4 p-3">
            <h4>Resumen</h4>
            <ListGroup className="mb-3">
              <ListGroup.Item>
                <strong>Paquete:</strong> {title}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Sesiones:</strong> {sessionCount}
              </ListGroup.Item>
              {slots.map((s, i) =>
                s.date && s.hora !== null ? (
                  <ListGroup.Item key={i}>
                    <strong>Sesión {i + 1}:</strong>{" "}
                    {new Date(s.date).toLocaleDateString()} a las {s.hora}:00
                  </ListGroup.Item>
                ) : null
              )}
              <ListGroup.Item>
                <strong>Vence:</strong> {mostrarVencimiento(expiresAt)}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Costo total:</strong> ${getPrecioPaquete(propPriceId)} MXN
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}