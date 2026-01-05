"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Form, Button, Alert, Modal, Accordion, Row, Col } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getISOWeek, getYear, isToday } from "date-fns";

interface Client   { id: string; name: string; email: string; }
interface Package  { id: string; name: string; sessions: number; price: number; }
interface Branch   { id: string; name: string; }
type PaymentMethod = "efectivo" | "transferencia";

type Slot = {
  date: Date | null;
  time: string;
  availableTimes: string[];
};

type ManualReservationSectionProps = {
  apiClientsUrl?: string;
  apiPackagesUrl?: string;
  apiBranchesUrl?: string;
  apiReservationUrl?: string;
};

function getMaxSessionsPerWeek(sessions: number) {
  if (sessions === 4) return 1;
  if (sessions === 8) return 2;
  if (sessions === 12) return 3;
  return 1;
}

function getValidDateRange(pkg: Package | undefined, slotIdx: number, slots: Slot[]) {
  if (!pkg) return { minDate: undefined, maxDate: undefined };
  const firstDate = slots[0]?.date;
  let minDate: Date | undefined = undefined;
  let maxDate: Date | undefined = undefined;
  if (firstDate) {
    minDate = firstDate;
    maxDate = new Date(firstDate);
    maxDate.setDate(maxDate.getDate() + 29);
  }
  return { minDate, maxDate };
}

// --- HORARIOS Y REGLAS DE SERVICIO ---
const getHorarioByPackage = (pkg: Package | undefined, date: Date | null): { start: number; end: number; } => {
  if (!pkg || !date) return { start: 9, end: 19 }; // default
  const day = date.getDay();
  // Fisioterapia inicia 9:00 todos los días
  if (/fisioterapia/i.test(pkg.name)) {
    if (day === 6 || day === 0) return { start: 9, end: 17 }; // Sábado/domingo
    return { start: 9, end: 19 }; // Lunes-viernes
  }
  // Agua, piso: domingo sí
  if (/agua/i.test(pkg.name) || /piso/i.test(pkg.name)) {
    if (day === 0 || day === 6) return { start: 9, end: 17 }; // Sábado/domingo
    return { start: 9, end: 19 };
  }
  // Otros paquetes: solo lunes-sábado, 11 a 19
  if (day === 6) return { start: 9, end: 17 }; // Sábado
  return { start: 11, end: 19 }; // Lunes-viernes
};

const isBusinessDay = (date: Date, pkg?: Package) => {
  const day = date.getDay();
  if (!pkg) return day !== 0; // domingo fuera por defecto
  if (/agua/i.test(pkg.name) || /piso/i.test(pkg.name) || /fisioterapia/i.test(pkg.name)) {
    return true; // permiten domingo
  }
  return day !== 0;
};

export default function ManualReservationSection({
  apiClientsUrl = "/api/admin/clients",
  apiPackagesUrl = "/api/admin/packages",
  apiBranchesUrl = "/api/admin/branches",
  apiReservationUrl = "/api/admin/reservations",
}: ManualReservationSectionProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [clientId, setClientId] = useState("");
  const [packageId, setPackageId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("efectivo");
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());

  const fetchJSON = (url: string, opts: RequestInit = {}) =>
    fetch(url, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      ...opts,
    });

  // Load data
  useEffect(() => {
    fetchJSON(apiClientsUrl).then(r => r.json()).then(setClients)
      .catch(() => setError("Error cargando clientes"));
    fetchJSON(apiPackagesUrl).then(r => r.json()).then(setPackages)
      .catch(() => setError("Error cargando paquetes"));
    fetchJSON(apiBranchesUrl).then(r => r.json()).then(data => {
      setBranches(data);
      if (data.length === 1) setBranchId(data[0].id);
    }).catch(() => setError("Error cargando sucursales"));
  }, [apiClientsUrl, apiPackagesUrl, apiBranchesUrl]);

  // Regenera slots al cambiar paquete
  useEffect(() => {
    if (!packageId) return setSlots([]);
    const pkg = packages.find(p => p.id === packageId);
    const count = pkg?.sessions || 1;
    setSlots(Array.from({ length: count }).map(() => ({
      date: null,
      time: "",
      availableTimes: [],
    })));
  }, [packageId, packages]);

  // Precarga los próximos 30 días para detectar fechas bloqueadas
  useEffect(() => {
    const loadBlockedDates = async () => {
      if (!packageId || !branchId) return;
      const pkg = packages.find(p => p.id === packageId);
      if (!pkg) return;
      const today = new Date();
      const blockSet = new Set<string>();
      for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        if (!isBusinessDay(d, pkg)) continue;
        const dateStr = d.toISOString().slice(0, 10);
        const res = await fetchJSON(
          `/api/admin/availability?packageId=${packageId}&branchId=${branchId}&date=${dateStr}`
        );
        const available: string[] = await res.json();
        if (available.length === 0) blockSet.add(dateStr);
      }
      setBlockedDates(blockSet);
    };
    loadBlockedDates();
  }, [packageId, branchId, packages]);

  // NEW LOGIC: genera los horarios disponibles (09:00 a 19:00, o 09:00-17:00 sábado/domingo)
  function buildTimeSlots(pkg: Package | undefined, date: Date | null) {
    if (!pkg || !date) return [];
    const { start, end } = getHorarioByPackage(pkg, date);

    const slots: string[] = [];
    for (let h = start; h < end; h++) {
      slots.push(`${h.toString().padStart(2, "0")}:00`);
      slots.push(`${h.toString().padStart(2, "0")}:30`);
    }
    slots.push(`${end.toString().padStart(2, "0")}:00`);

    // Si es HOY, filtrar las horas pasadas:
    if (date && isToday(date)) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      return slots.filter(slot => {
        const [sh, sm] = slot.split(":").map(Number);
        return (sh * 60 + sm) > currentMinutes;
      });
    }
    return slots;
  }

  // Al elegir fecha, consultar horarios DISPONIBLES para ese paquete/sucursal/día
  const onDateChange = async (i: number, d: Date | null) => {
    let available: string[] = [];
    const pkg = packages.find(p => p.id === packageId);
    if (packageId && branchId && d) {
      try {
        // Aquí puedes consultar disponibilidad real del backend si existe
        // Pero para fines visuales, genera el array de slots posibles según reglas
        available = buildTimeSlots(pkg, d);
      } catch { available = []; }
    }
    const c = [...slots];
    c[i].date = d;
    c[i].availableTimes = available;
    c[i].time = available[0] || "";
    setSlots(c);
  };

  const onTimeChange = (i: number, t: string) => {
    const c = [...slots];
    c[i].time = t;
    setSlots(c);
  };

  // Validar fechas según regla de 1,2,3xsemana y candado 30 días
  const isDateDisabled = (slotIdx: number, date: Date) => {
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) return false;
    const dateStr = date.toISOString().slice(0, 10);
    if (!isBusinessDay(date, pkg)) return true;
    if (blockedDates.has(dateStr)) return true;

    // Obtén la semana y año de la fecha que intentas seleccionar
    const week = getISOWeek(date);
    const year = getYear(date);

    // Cuenta cuántas sesiones ya hay en esa semana para este paquete (en el wizard)
    let countInWeek = 0;
    for (let prev = 0; prev < slots.length; prev++) {
      if (prev === slotIdx) continue;
      if (slots[prev].date) {
        const prevDate = slots[prev].date as Date;
        if (getISOWeek(prevDate) === week && getYear(prevDate) === year) {
          countInWeek++;
        }
      }
    }

    const maxPerWeek = getMaxSessionsPerWeek(pkg.sessions);

    if (countInWeek >= maxPerWeek) return true;
    if (slots[0].date && slotIdx > 0) {
      const firstDate = slots[0].date as Date;
      const diff = (date.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);
      if (diff < 0 || diff > 29) return true;
    }
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (date < today) return true;
    return false;
  };

  const handleProceed = () => {
    setError(null); setSuccess(null);
    if (!clientId || !packageId || !branchId || slots.some(s => !s.date || !s.time)) {
      setError("Completa todos los campos."); return;
    }
    setShowPayment(true);
  };

  const handleConfirm = async () => {
    setError(null);
    try {
      await Promise.all(slots.map(s =>
        fetchJSON(apiReservationUrl, {
          method: "POST",
          body: JSON.stringify({
            userId: clientId,
            packageId,
            date: s.date ? new Date(
              s.date.getFullYear(),
              s.date.getMonth(),
              s.date.getDate(),
              parseInt(s.time.split(":")[0]),
              parseInt(s.time.split(":")[1])
            ).toISOString() : "",
            paymentMethod,
            branchId,
          }),
        }).then(async r => {
          if (!r.ok) {
            const { error } = await r.json();
            throw new Error(error || "Error creando reserva");
          }
        })
      ));
      setShowPayment(false);
      setSuccess("Reservación creada.");
      setClientId(""); setPackageId(""); setSlots([]);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const selectedPackage = useMemo(
    () => packages.find(p => p.id === packageId),
    [packageId, packages]
  );

  return (
    <>
      <h2>Generar reservación manual</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Cliente</Form.Label>
          <Form.Select value={clientId} onChange={e => setClientId(e.target.value)}>
            <option value="">-- Selecciona cliente --</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.email})
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Paquete</Form.Label>
          <Form.Select value={packageId} onChange={e => setPackageId(e.target.value)}>
            <option value="">-- Selecciona paquete --</option>
            {packages.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sessions} sesión{p.sessions > 1 ? "es" : ""})
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Sucursal</Form.Label>
          <Form.Select value={branchId} onChange={e => setBranchId(e.target.value)}>
            <option value="">-- Selecciona sucursal --</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </Form.Select>
        </Form.Group>

        {slots.map((s, i) => {
          const { minDate, maxDate } = getValidDateRange(selectedPackage, i, slots);
          return (
            <Accordion key={i} defaultActiveKey="0" className="mb-2">
              <Accordion.Item eventKey="0">
                <Accordion.Header>Sesión {i + 1}</Accordion.Header>
                <Accordion.Body>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-2">
                        <Form.Label>Fecha</Form.Label>
                        <DatePicker
                          selected={s.date ?? undefined}
                          onChange={(date: Date | null) => onDateChange(i, date)}
                          minDate={i === 0 ? new Date() : (minDate ?? undefined)}
                          maxDate={maxDate ?? undefined}
                          filterDate={(date: Date) => !isDateDisabled(i, date)}
                          dateFormat="yyyy-MM-dd"
                          placeholderText="Selecciona fecha"
                          className="form-control"
                          disabled={!!(i > 0 && !slots[i - 1].date)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Hora</Form.Label>
                        {s.availableTimes.length > 0
                          ? (
                            <Form.Select
                              value={s.time}
                              onChange={e => onTimeChange(i, e.target.value)}
                            >
                              {s.availableTimes.map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </Form.Select>
                          )
                          : <Alert variant="warning">No hay horarios libres en esta fecha.</Alert>
                        }
                      </Form.Group>
                    </Col>
                  </Row>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          );
        })}

        <Button
          onClick={handleProceed}
          disabled={!clientId || !packageId || !branchId || slots.some(s => !s.date || !s.time)}
        >
          Continuar
        </Button>
      </Form>

      <Modal show={showPayment} onHide={() => setShowPayment(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar pago</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ul>
            {slots.map((s, i) => (
              <li key={i}>
                Sesión {i + 1}: {s.date ? s.date.toLocaleDateString("es-MX") : "--"} a las {s.time}
              </li>
            ))}
          </ul>
          {selectedPackage && typeof selectedPackage.price === "number" && (
            <div style={{ fontWeight: "bold", marginBottom: 12 }}>
              Total a pagar: <span style={{ color: "#0072f5" }}>
                ${selectedPackage.price.toLocaleString("es-MX")} MXN
              </span>
            </div>
          )}
          <Form>
            <Form.Check
              type="radio" label="Efectivo" name="pay"
              checked={paymentMethod === "efectivo"}
              onChange={() => setPaymentMethod("efectivo")}
            />
            <Form.Check
              type="radio" label="Transferencia" name="pay"
              checked={paymentMethod === "transferencia"}
              onChange={() => setPaymentMethod("transferencia")}
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPayment(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>Confirmar reserva</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}