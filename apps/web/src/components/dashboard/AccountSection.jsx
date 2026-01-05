"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Form, Button, Alert } from "react-bootstrap";

export default function AccountSection() {
  const { data: session } = useSession();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const payload = await res.json();
    if (!res.ok) {
      setError(payload.error);
      setStatus("error");
    } else {
      setError(null);
      setStatus("ok");
      setCurrentPassword("");
      setNewPassword("");
    }
  };

  return (
    <div className="text-center">
      <h3>Mi cuenta</h3>
      <p>
        <strong>Nombre:</strong> {session?.user?.name}
      </p>
      <p>
        <strong>Email:</strong> {session?.user?.email}
      </p>

      <hr />

      <h5>Cambiar contraseña</h5>
      <Form onSubmit={handleSubmit} className="form-container">
        {status === "ok" && (
          <Alert variant="success">Contraseña actualizada</Alert>
        )}
        {status === "error" && <Alert variant="danger">{error}</Alert>}

        <Form.Group className="mb-3" controlId="currentPassword">
          <Form.Label>Contraseña actual</Form.Label>
          <Form.Control
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="newPassword">
          <Form.Label>Nueva contraseña</Form.Label>
          <Form.Control
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </Form.Group>

        <Button
          type="submit"
          className="btn-orange w-100"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Guardando…" : "Guardar"}
        </Button>
      </Form>
    </div>
  );
}