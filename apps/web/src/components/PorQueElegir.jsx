// src/components/PorQueElegir.jsx
import React from "react";
import { FaHeartbeat, FaUsers, FaAward } from "react-icons/fa";

export default function PorQueElegir() {
  return (
    <section className="container py-5">
      <h2 className="text-center mb-4">¿Por qué elegir Eventora?</h2>
      <div className="row g-4">
        <div className="col-md-4 text-center">
          <FaHeartbeat size={48} className="mb-3 text-primary" />
          <h5>Atención personalizada</h5>
          <p>Cada sesión es diseñada a tu medida por nuestros expertos.</p>
        </div>
        <div className="col-md-4 text-center">
          <FaUsers size={48} className="mb-3 text-primary" />
          <h5>Equipo profesional</h5>
          <p>Terapeutas certificados y con amplia experiencia.</p>
        </div>
        <div className="col-md-4 text-center">
          <FaAward size={48} className="mb-3 text-primary" />
          <h5>Instalaciones de calidad</h5>
          <p>Contamos con espacios confortables y equipamiento de vanguardia.</p>
        </div>
      </div>
    </section>
);
}
