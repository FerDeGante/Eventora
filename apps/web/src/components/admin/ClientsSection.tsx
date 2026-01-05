// src/components/admin/ClientsSection.tsx
"use client";
import { useEffect, useState } from "react";
import { Table, Button, Form, Modal, Toast, ToastContainer } from "react-bootstrap";
import { FaPen, FaTrash } from "react-icons/fa";

interface Client {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
}

export default function ClientsSection() {
  const [list, setList] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [show, setShow] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const load = async (q = "") => {
    const res = await fetch(
      `/api/admin/clients?search=${encodeURIComponent(q)}`,
      { credentials: "include" }
    );
    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }
    if (res.ok) setList(await res.json());
  };

  useEffect(() => {
    load(search);
  }, [search]);

  const saveClient = async () => {
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/admin/clients/${editingId}` : "/api/admin/clients";
    const res = await fetch(url, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }
    if (res.ok) {
      setShow(false);
      setEditingId(null);
      setForm({ name: "", email: "", phone: "", password: "" });
      load();
      setToastMsg(editingId ? "Cliente actualizado" : "Cliente creado");
    }
  };

  const startCreate = () => {
    setEditingId(null);
    setForm({ name: "", email: "", phone: "", password: "" });
    setShow(true);
  };

  const startEdit = (c: Client) => {
    setEditingId(c.id);
    setForm({ name: c.name || "", email: c.email, phone: c.phone || "", password: "" });
    setShow(true);
  };

  const deleteClient = async (id: string) => {
    if (!confirm("¿Eliminar este cliente?")) return;
    const res = await fetch(
      `/api/admin/clients/${id}`,
      { method: "DELETE", credentials: "include" }
    );
    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }
    if (res.ok) {
      setToastMsg("Cliente eliminado");
      load();
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between mb-3">
        <Form.Control
          placeholder="Buscar"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 200 }}
        />
        <Button onClick={startCreate}>+ Nuevo Cliente</Button>
      </div>
      <Table bordered hover size="sm">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Teléfono</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {list.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.email}</td>
              <td>{c.phone}</td>
              <td>{c.role}</td>
              <td>
                <Button size="sm" variant="light" className="me-1" onClick={() => startEdit(c)}>
                  <FaPen />
                </Button>
                <Button size="sm" variant="light" onClick={() => deleteClient(c.id)}>
                  <FaTrash />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? "Editar Cliente" : "Nuevo Cliente"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Correo</Form.Label>
              <Form.Control
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={saveClient}>Guardar</Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="bottom-end" className="p-3">
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
