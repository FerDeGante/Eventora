// src/components/RescheduleModal.tsx
import React, { useState } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import type { Reservation } from "@/types/index";

interface RescheduleModalProps {
  show: boolean;
  onHide: () => void;
  reservation: Reservation;
  onRescheduleSuccess?: () => void;
  adminMode?: boolean;
}

const availableTimes = [
  "09:00", "09:30", "10:00", "10:30", "11:00",
  "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00",
  "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00"
];

const RescheduleModal: React.FC<RescheduleModalProps> = ({
  show,
  onHide,
  reservation,
  onRescheduleSuccess,
  adminMode,
}) => {
  const [date, setDate] = useState<Date>(
    reservation?.date ? new Date(reservation.date) : new Date()
  );
  const [time, setTime] = useState<string>(() =>
    reservation?.date ? new Date(reservation.date).toTimeString().slice(0, 5) : "09:00"
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setSuccess(false);

    try {
      if (!date || !time) {
        setError("Selecciona fecha y hora.");
        setLoading(false);
        return;
      }
      // El backend espera { newDate, newTime }
      const newDate = date.toISOString().slice(0, 10);
      const newTime = time;
      const body = { newDate, newTime };

      const res = await fetch(`/api/admin/reservations/${reservation.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo reprogramar.");
      }
      setSuccess(true);
      if (onRescheduleSuccess) onRescheduleSuccess();
    } catch (e: any) {
      setError(e.message || "Error al reprogramar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          Reprogramar sesión
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <div className="mb-2">
            <strong>Servicio:</strong> {reservation.serviceName}
          </div>
          <div className="mb-2">
            <strong>Cliente:</strong> {reservation.userName}
          </div>
          <div className="mb-2">
            <strong>Sesión:</strong> {reservation.sessionNumber} / {reservation.totalSessions}
          </div>
        </div>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nueva fecha</Form.Label>
            <DatePicker
              selected={date}
              onChange={(d: Date | null) => {
                if (d) setDate(d);
              }}
              dateFormat="yyyy-MM-dd"
              className="form-control"
              minDate={new Date()}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Hora</Form.Label>
            <Form.Select
              value={time}
              onChange={(e) => setTime(e.target.value)}
            >
              {availableTimes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Form.Select>
          </Form.Group>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">¡Sesión reprogramada!</Alert>}
          <div className="d-flex justify-content-end">
            <Button variant="secondary" className="me-2" onClick={onHide} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? <Spinner size="sm" animation="border" /> : "Guardar cambios"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default RescheduleModal;