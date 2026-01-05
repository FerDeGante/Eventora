'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export default function ContactForm() {
  const [form, setForm] = useState<ContactFormData>({
    name: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState<null | 'sending' | 'ok' | 'error'>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Error al enviar');
      setStatus('ok');
      setForm({ name: '', email: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Control
          type="text"
          name="name"
          placeholder="Tu nombre"
          value={form.name}
          onChange={handleChange}
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Control
          type="email"
          name="email"
          placeholder="Tu correo"
          value={form.email}
          onChange={handleChange}
          required
        />
      </Form.Group>
     
      <Button
        type="submit"
        disabled={status === 'sending'}
        className="btn-orange w-100"
      >
        {status === 'sending' ? 'Enviando...' : 'Enviar'}
      </Button>
      {status === 'ok' && (
        <Alert variant="success" className="mt-3">
          ¡Mensaje enviado con éxito!
        </Alert>
      )}
      {status === 'error' && (
        <Alert variant="danger" className="mt-3">
          Ocurrió un error al enviar. Intenta de nuevo.
        </Alert>
      )}
    </Form>
  );
}
