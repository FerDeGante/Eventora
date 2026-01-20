// src/lib/packages.ts

export type Category = "agua" | "piso" | "fisio" | "otros";

export interface PackageDef {
  /** Identificador único del paquete, coincide con el serviceId que usas en la base */
  id: string;
  /** Título que se muestra en UI y en Stripe metadata */
  title: string;
  /** Número de sesiones incluidas */
  sessions: number;
  /** Vigencia (en días) mínimamente para agendar */
  inscription: number;
  /** Precio total en MXN (o la moneda que uses) */
  price: number;
  /** Descripción breve para la tarjeta */
  description: string;
  /** Ruta a la imagen para la tarjeta */
  image: string;
  /** El priceId de Stripe */
  priceId: string;
  /** Categoría para filtrar en PackagesSection */
  category: Category;
}

export const paquetes: PackageDef[] = [
  // — Agua —
  {
    id: "agua_1",
    title: "Estimulación en agua (1×mes)",
    sessions: 1,
    inscription: 30,
    price: 500,
    description: "Sesión individual 👶 con ejercicios en agua.",
    image: "/images/estimlacion_agua_animado.jpeg",
    priceId: "price_1RJd0OFV5ZpZiouCasDGf28F",
    category: "agua",
  },
  {
    id: "agua_4",
    title: "Estimulación en agua (4×mes)",
    sessions: 4,
    inscription: 30,
    price: 1400,
    description: "Una sesión semanal 👶 en agua.",
    image: "/images/estimlacion_agua_animado.jpeg",
    priceId: "price_1RMBAKFV5ZpZiouCCnrjam5N",
    category: "agua",
  },
  {
    id: "agua_8",
    title: "Estimulación en agua (8×mes)",
    sessions: 8,
    inscription: 30,
    price: 2250,
    description: "Dos sesiones semanales 👶💦 en agua.",
    image: "/images/estimlacion_agua_animado.jpeg",
    priceId: "price_1RMBFKFV5ZpZiouCJ1vHKREU",
    category: "agua",
  },
  {
    id: "agua_12",
    title: "Estimulación en agua (12×mes)",
    sessions: 12,
    inscription: 30,
    price: 2500,
    description: "Tres sesiones semanales 👶💦 en agua.",
    image: "/images/estimlacion_agua_animado.jpeg",
    priceId: "price_1RMBIaFV5ZpZiouC8l6QjW2N",
    category: "agua",
  },

  // — Piso —
  {
    id: "piso_1",
    title: "Estimulación en piso (1×mes)",
    sessions: 1,
    inscription: 30,
    price: 500,
    description: "Sesión individual 👶 en piso.",
    image: "/images/estimulacion_piso_animado.jpeg",
    priceId: "price_1RJd1jFV5ZpZiouC1xXvllVc",
    category: "piso",
  },
  {
    id: "piso_4",
    title: "Estimulación en piso (4×mes)",
    sessions: 4,
    inscription: 30,
    price: 1400,
    description: "Una sesión semanal 👶 en piso.",
    image: "/images/estimulacion_piso_animado.jpeg",
    priceId: "price_1RP6S2FV5ZpZiouC6cVpXQsJ",
    category: "piso",
  },
  {
    id: "piso_8",
    title: "Estimulación en piso (8×mes)",
    sessions: 8,
    inscription: 30,
    price: 2250,
    description: "Dos sesiones semanales 👶 en piso.",
    image: "/images/estimulacion_piso_animado.jpeg",
    priceId: "price_1RP6SsFV5ZpZiouCtbg4A7OE",
    category: "piso",
  },
  {
    id: "piso_12",
    title: "Estimulación en piso (12×mes)",
    sessions: 12,
    inscription: 30,
    price: 2500,
    description: "Tres sesiones semanales 👶 en piso.",
    image: "/images/estimulacion_piso_animado.jpeg",
    priceId: "price_1RP6TaFV5ZpZiouCoG5G58S3",
    category: "piso",
  },

  // — Fisio —
  {
    id: "fisio_1",
    title: "Fisioterapia (1 sesión)",
    sessions: 1,
    inscription: 30,
    price: 500,
    description: "Sesión individual de fisioterapia 🏥.",
    image: "/images/fisio_animado.jpeg",
    priceId: "price_1RJd3WFV5ZpZiouC9PDzHjKU",
    category: "fisio",
  },
  {
    id: "fisio_5",
    title: "Fisioterapia (5 sesiones)",
    sessions: 5,
    inscription: 30,
    price: 2000,
    description: "Paquete de 5 sesiones para recuperación continua 🩺.",
    image: "/images/fisio_animado.jpeg",
    priceId: "price_1RP6WwFV5ZpZiouCN3m0luq3",
    category: "fisio",
  },
  {
    id: "fisio_10",
    title: "Fisioterapia (10 sesiones)",
    sessions: 10,
    inscription: 30,
    price: 3000,
    description: "Paquete intensivo de 10 sesiones para tu salud 💪.",
    image: "/images/fisio_animado.jpeg",
    priceId: "price_1RP6W9FV5ZpZiouCBXnZwxLW",
    category: "fisio",
  },

  // — Otros servicios —
  {
    id: "post_vacuna",
    title: "Terapia post vacuna",
    sessions: 1,
    inscription: 30,
    price: 500,
    description: "Alivia molestias tras vacunación 💉",
    image: "/images/post_vacuna_animado.jpeg",
    priceId: "price_1ROMxFFV5ZpZiouCdkM2KoHF",
    category: "otros",
  },
  {
    id: "quiropractica",
    title: "Quiropráctica",
    sessions: 1,
    inscription: 30,
    price: 500,
    description: "Ajustes para tu columna 🦴",
    image: "/images/quiro_animado.jpeg",
    priceId: "price_1RJd2fFV5ZpZiouCsaJNkUTO",
    category: "otros",
  },
  {
    id: "masajes",
    title: "Masajes",
    sessions: 1,
    inscription: 30,
    price: 500,
    description: "Relaja cuerpo y mente 💆‍♀️",
    image: "/images/masajes_animado.jpeg",
    priceId: "price_1RJd4JFV5ZpZiouCPjcpX3Xn",
    category: "otros",
  },
  {
    id: "cosmetologia",
    title: "Cosmetología",
    sessions: 1,
    inscription: 30,
    price: 500,
    description: "Cuidado facial personalizado ✨",
    image: "/images/cosmetologia_animado.jpeg",
    priceId: "price_1RQaDGFV5ZpZiouCdNjxrjVk",
    category: "otros",
  },
  {
    id: "lesiones",
    title: "Prevención de lesiones",
    sessions: 1,
    inscription: 30,
    price: 500,
    description: "Evita lesiones comunes 💪",
    image: "/images/prevencion_animado.jpeg",
    priceId: "price_1RJd57FV5ZpZiouCpcrKNvJV",
    category: "otros",
  },
  {
    id: "prep_fisica",
    title: "Preparación física",
    sessions: 1,
    inscription: 30,
    price: 500,
    description: "Entrenamiento funcional 🏋️",
    image: "/images/preparacion_animado.jpeg",
    priceId: "price_1RJd6EFV5ZpZiouCYwD4J3I8",
    category: "otros",
  },
  {
    id: "nutricion",
    title: "Nutrición",
    sessions: 1,
    inscription: 30,
    price: 500,
    description: "Plan alimenticio personalizado 🥗",
    image: "/images/nutri_animado.jpeg",
    priceId: "price_1RJd7qFV5ZpZiouCbj6HrFJF",
    category: "otros",
  },
  {
    id: "medicina",
    title: "Medicina en rehabilitación",
    sessions: 1,
    inscription: 30,
    price: 500,
    description: "Revisión médica de apoyo 🩺",
    image: "/images/medicina_rehab_animado.jpeg",
    priceId: "price_1RJd9HFV5ZpZiouClVlCujAm",
    category: "otros",
  },
];
