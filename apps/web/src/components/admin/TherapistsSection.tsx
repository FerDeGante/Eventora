"use client";
import { useEffect, useState } from "react";
import { Table, Button, Form, Modal, Toast, ToastContainer } from "react-bootstrap";
import { FaPen, FaTrash } from "react-icons/fa";

interface Therapist {
  id: string;
  name: string;
  specialty: string | null;
  isActive: boolean;
}

export default function TherapistsSection() {
  const [list, setList] = useState<Therapist[]>([]);
  const [search, setSearch] = useState("");
  const [show, setShow] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", specialty: "", isActive: true });
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Carga la lista desde el API
  const load = async (q = "") => {
    const res = await fetch(`/api/admin/therapists?search=${encodeURIComponent(q)}`, {
      credentials: "include",
    });
    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }
    if (res.ok) {
      setList(await res.json());
    }
  };

  useEffect(() => {
    load(search);
  }, [search]);

  // Abre el modal para crear uno nuevo
  const startCreate = () => {
    setEditingId(null);
    setForm({ name: "", specialty: "", isActive: true });
    setShow(true);
  };

  // Abre el modal para editar el existente
  const startEdit = (t: Therapist) => {
    setEditingId(t.id);
    setForm({ name: t.name, specialty: t.specialty || "", isActive: t.isActive });
    setShow(true);
  };

  const saveTherapist = async () => {
    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `/api/admin/therapists/${editingId}`
      : "/api/admin/therapists";
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
      load(); // recarga la lista
      setToastMsg(editingId ? "Terapeuta actualizado" : "Terapeuta creado");
      setEditingId(null);
      setForm({ name: "", specialty: "", isActive: true });
    }
  };

  const deleteTherapist = async (id: string) => {
    if (!confirm("¿Eliminar este terapeuta?")) return;
    const res = await fetch(`/api/admin/therapists/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.status === 401) {
      window.location.href = "/login";
      return;
    }
    if (res.ok) {
      setToastMsg("Terapeuta eliminado");
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
        <Button onClick={startCreate}>+ Nuevo Terapeuta</Button>
      </div>

      <Table bordered hover size="sm">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Especialidad</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {list.map((t) => (
            <tr key={t.id}>
              <td>{t.name}</td>
              <td>{t.specialty}</td>
              <td>{t.isActive ? "Activo" : "Inactivo"}</td>
              <td>
                <Button
                  size="sm"
                  variant="light"
                  className="me-1"
                  onClick={() => startEdit(t)}
                >
                  <FaPen />
                </Button>
                <Button
                  size="sm"
                  variant="light"
                  onClick={() => deleteTherapist(t.id)}
                >
                  <FaTrash />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal Crear/Editar */}
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? "Editar Terapeuta" : "Nuevo Terapeuta"}</Modal.Title>
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
              <Form.Label>Especialidad</Form.Label>
              <Form.Control
                value={form.specialty}
                onChange={(e) => setForm({ ...form, specialty: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Check
                type="switch"
                id="therapist-active"
                label="Activo"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={saveTherapist}>Guardar</Button>
        </Modal.Footer>
      </Modal>

      {/* Toast de confirmación */}
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
