"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  Spinner,
  Modal,
  Button,
  OverlayTrigger,
  Tooltip,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { FaEdit, FaCalendarPlus } from "react-icons/fa";

interface HistoryItem {
  id: string;
  date: string;                // ISO string
  serviceName: string | null;  // viene de tu API (/api/appointments/history)
}

export default function HistorySection() {
  const [rows, setRows] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editSlot, setEditSlot] = useState<HistoryItem | null>(null);
  const [newDate, setNewDate] = useState<Date | null>(null);
  const [newHour, setNewHour] = useState<number | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/appointments/history")
      .then((res) => res.json())
      .then((data: HistoryItem[]) => setRows(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleEdit = (item: HistoryItem) => {
    setEditSlot(item);
    const dt = new Date(item.date);
    setNewDate(dt);
    setNewHour(dt.getHours());
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editSlot || !newDate || newHour === null) return;
    const updated = new Date(newDate);
    updated.setHours(newHour, 0, 0, 0);

    await fetch(`/api/appointments/${editSlot.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: updated.toISOString() }),
    });

    setRows((current) =>
      current.map((r) =>
        r.id === editSlot.id
          ? { ...r, date: updated.toISOString() }
          : r
      )
    );
    setShowModal(false);
    setToastMsg("Reservación actualizada");
  };

  const calLink = (item: HistoryItem) => {
    const start = new Date(item.date);
    const end = new Date(start.getTime() + 3600 * 1000);
    const fmt = (x: Date) => x.toISOString().replace(/[-:]|\.\d{3}/g, "");
    return (
      "https://www.google.com/calendar/render?action=TEMPLATE" +
      `&text=${encodeURIComponent(item.serviceName ?? "Reserva")}` +
      `&dates=${fmt(start)}/${fmt(end)}` +
      `&details=${encodeURIComponent(item.serviceName ?? "")}` +
      `&location=${encodeURIComponent(item.serviceName ?? "")}`
    );
  };

  if (loading) return <Spinner className="m-5" animation="border" />;

  return (
    <>
      <Table hover responsive className="dashboard-table">
        <thead>
          <tr>
            <th>Servicio</th>
            <th>Fecha y hora</th>
            <th>Editar</th>
            <th>Calendario</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center">
                — No hay reservaciones —
              </td>
            </tr>
          ) : (
            rows.map((r) => {
              const dt = new Date(r.date);
              const display = `${dt.toLocaleDateString()} • ${dt.toLocaleTimeString(
                [],
                { hour: "2-digit", minute: "2-digit" }
              )}`;
              return (
                <tr key={r.id}>
                  <td>{r.serviceName ?? "—"}</td>
                  <td>{display}</td>
                  <td>
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Editar fecha</Tooltip>}
                    >
                      <Button variant="link" onClick={() => handleEdit(r)}>
                        <FaEdit size={18} />
                      </Button>
                    </OverlayTrigger>
                  </td>
                  <td>
                    <a href={calLink(r)} target="_blank" rel="noopener noreferrer">
                      <FaCalendarPlus />
                    </a>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Cambiar fecha de reservación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {newDate && (
            <>
              <Calendar
                onChange={(d) =>
                  setNewDate(Array.isArray(d) ? d[0] : d)
                }
                value={newDate}
                minDate={new Date()}
                maxDate={new Date(new Date().setDate(new Date().getDate() + 30))}
                tileDisabled={({ date, view }) =>
                  view === "month" && date.getDay() === 0
                }
              />
              <div className="mt-3">
                <strong>Horario:</strong>{" "}
                {(newDate.getDay() === 6
                  ? [9, 10, 11, 12, 13, 14]
                  : [10, 11, 12, 13, 14, 15, 16, 17, 18]
                ).map((h) => (
                  <Button
                    key={h}
                    variant={newHour === h ? "primary" : "outline-primary"}
                    className="me-1 mb-2"
                    onClick={() => setNewHour(h)}
                  >
                    {h}:00
                  </Button>
                ))}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>
      <ToastContainer position="top-end" className="p-3">
        <Toast
          bg="success"
          onClose={() => setToastMsg(null)}
          show={!!toastMsg}
          delay={3000}
          autohide
        >
          <Toast.Body className="text-white">{toastMsg}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}