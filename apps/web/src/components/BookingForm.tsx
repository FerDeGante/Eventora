// src/components/BookingForm.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { loadStripe, Stripe } from "@stripe/stripe-js";

interface Slot {
  id: string;
  start_time: string;
  end_time: string;
}

interface BookingFormProps {
  serviceId: string;
}

export default function BookingForm({ serviceId }: BookingFormProps) {
  const [date, setDate] = useState<string>("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Carga los slots cuando cambie la fecha
  useEffect(() => {
    if (!date) return;
    fetch(`/api/easy?service_id=${serviceId}&date=${date}`)
      .then((r) => r.json())
      .then((data: Slot[]) => setSlots(data))
      .catch(() => setSlots([]));
  }, [date, serviceId]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // toma el valor del select “slot”
    const form = e.currentTarget;
    const slotValue = (form.elements.namedItem("slot") as HTMLSelectElement)
      .value;

    // obtiene la llave pública de Stripe (con ! nos aseguramos de que no sea undefined)
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!;
    const stripe: Stripe | null = await loadStripe(key);

    if (!stripe) {
      alert("Error al inicializar Stripe.");
      return;
    }

    // Crea la sesión de checkout
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: serviceId,
        slot_id: slotValue,
        date,
        customer,
      }),
    });

    const { sessionId } = await res.json();
    if (!sessionId) {
      alert("Error al crear la sesión de pago.");
      return;
    }

    // Redirige a Checkout
    const { error } = await stripe.redirectToCheckout({ sessionId });
    if (error) {
      alert(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-4">
      <label htmlFor="date">Fecha</label>
      <input
        id="date"
        type="date"
        className="form-control mb-3"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />

      {slots.length > 0 && (
        <select name="slot" className="form-select mb-3" required>
          <option value="">Selecciona un horario</option>
          {slots.map((s) => (
            <option key={s.id} value={s.id}>
              {s.start_time} – {s.end_time}
            </option>
          ))}
        </select>
      )}

      <h5>Datos personales</h5>
      <input
        type="text"
        className="form-control mb-2"
        placeholder="Nombre"
        value={customer.name}
        onChange={(e) =>
          setCustomer({ ...customer, name: e.target.value })
        }
        required
      />
      <input
        type="email"
        className="form-control mb-2"
        placeholder="Email"
        value={customer.email}
        onChange={(e) =>
          setCustomer({ ...customer, email: e.target.value })
        }
        required
      />
      <input
        type="tel"
        className="form-control mb-2"
        placeholder="Teléfono"
        value={customer.phone}
        onChange={(e) =>
          setCustomer({ ...customer, phone: e.target.value })
        }
        required
      />

      <button type="submit" className="btn btn-warning mt-3">
        Pagar y Agendar
      </button>
    </form>
  );
}
