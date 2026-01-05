// src/components/client/MyReservations.jsx
import React, { useState, useEffect } from "react";
import { Button, Modal, Spinner, Alert } from "react-bootstrap";
import RescheduleModal from "./RescheduleModal";

export default function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch("/api/client/reservations")
      .then(res => res.json())
      .then(setReservations);
  }, []);

  const handleReschedule = (reservation) => {
    setSelected(reservation);
    setShowModal(true);
  };

  const onRescheduleSuccess = (newDate) => {
    setReservations(reservations.map(r =>
      r.id === selected.id ? { ...r, date: newDate } : r
    ));
    setShowModal(false);
  };

  return (
    <div className="my-10 px-4 max-w-2xl mx-auto">
      <h2 className="mb-5 text-2xl font-bold">Mis reservaciones</h2>
      {reservations.length === 0 && <Spinner animation="border" />}
      {reservations.map(r => (
        <div key={r.id} className="rounded-xl shadow p-4 mb-4 flex justify-between items-center bg-white border border-blue-100">
          <div>
            <div className="font-semibold">{r.packageName}</div>
            <div className="text-sm text-gray-500">{new Date(r.date).toLocaleString()}</div>
            <div className={`text-xs ${r.status === "COMPLETED" ? "text-green-500" : "text-blue-500"}`}>{r.status}</div>
          </div>
          {r.status === "PENDING" && (
            <Button size="sm" variant="outline-primary" onClick={() => handleReschedule(r)}>
              Reprogramar
            </Button>
          )}
        </div>
      ))}
      {showModal && selected && (
        <RescheduleModal
          reservation={selected}
          show={showModal}
          onHide={() => setShowModal(false)}
          onSuccess={onRescheduleSuccess}
        />
      )}
    </div>
  );
}