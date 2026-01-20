import Link from "next/link";
import React, { ReactNode } from "react";
import {
  FaWater,
  FaWalking,
  FaHands,
  FaRunning,
  FaSpa,
  FaShieldAlt,
  FaDumbbell,
  FaNutritionix,
  FaBaby,
} from "react-icons/fa";
import {TbPhysotherapist, TbMassage} from "react-icons/tb";
import { GiLipstick } from "react-icons/gi";

interface Servicio {
  slug: string;
  icon: ReactNode;
  label: string;
  color: "primary" | "secondary" | "tertiary";
}

const servicios: Servicio[] = [
  { slug: "agua", icon: <FaWater />, label: "Estimulación en agua", color: "primary" },
  { slug: "piso", icon: <FaWalking />, label: "Estimulación en piso", color: "secondary" },
  { slug: "quiropractica", icon: <TbMassage />, label: "Quiropráctica", color: "tertiary" },
  { slug: "fisioterapia", icon: <TbPhysotherapist />, label: "Fisioterapia", color: "primary" },
  { slug: "masajes", icon: <FaSpa />, label: "Masajes", color: "secondary" },
  { slug: "cosmetologia", icon: <GiLipstick />, label: "Cosmetología", color: "tertiary" },
  { slug: "prevencion-lesiones", icon: <FaShieldAlt />, label: "Prevención de lesiones", color: "primary" },
  { slug: "preparacion-fisica", icon: <FaDumbbell />, label: "Preparación física", color: "secondary" },
  { slug: "nutricion", icon: <FaNutritionix />, label: "Nutrición", color: "tertiary" },
  { slug: "terapia-post-vacuna", icon: <FaBaby />, label: "Terapia post vacuna", color: "primary" },
];

export default function NuestrosServicios() {
  return (
    <section className="services-grid">
      <div className="container">
        <h2 className="services-title">Nuestros servicios</h2>
        <div className="services-list">
          {servicios.map((s) => (
            <Link
              key={s.slug}
              href={`/dashboard?tab=reservar&servicio=${s.slug}`}
              className={`service-btn service-${s.color}`}
            >
              <span className="icon-circle">{s.icon}</span>
              <span className="label">{s.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
