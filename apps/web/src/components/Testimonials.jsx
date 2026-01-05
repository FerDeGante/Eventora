// src/components/Testimonials.jsx
import React from "react";
import Carousel from "react-bootstrap/Carousel";

const reviews = [
  {
    name: "María López",
    text: "¡Excelente atención! Mis dolores de espalda desaparecieron.",
  },
  {
    name: "Juan Pérez",
    text: "La estimulación en agua fue maravillosa para mi rehabilitación.",
  },
  {
    name: "Ana Torres",
    text: "Recomendado 100%. Las instalaciones son de primera.",
  },
];

export default function Testimonials() {
  return (
    <section className="container py-5">
      <h2 className="text-center mb-4">Opiniones de nuestros pacientes</h2>
      <Carousel indicators={false} interval={5000}>
        {reviews.map((r, i) => (
          <Carousel.Item key={i}>
            <div className="text-center px-4">
              <p className="lead">“{r.text}”</p>
              <p className="fw-bold">— {r.name}</p>
            </div>
          </Carousel.Item>
        ))}
      </Carousel>
    </section>
  );
}
