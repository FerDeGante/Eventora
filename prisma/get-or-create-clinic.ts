// Script temporal para obtener o crear una clínica principal
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Buscar si ya existe alguna clínica
  let clinic = await prisma.clinic.findFirst();

  if (!clinic) {
    // Crear una clínica principal
    clinic = await prisma.clinic.create({
      data: {
        name: "Eventora Clínica Principal",
        slug: "eventora-principal",
        settings: {
          timezone: "America/Mexico_City",
          currency: "MXN",
          locale: "es-MX",
        },
      },
    });
    console.log("✅ Clínica creada:");
  } else {
    console.log("✅ Clínica encontrada:");
  }

  console.log(`   ID: ${clinic.id}`);
  console.log(`   Nombre: ${clinic.name}`);
  console.log(`   Slug: ${clinic.slug}`);
  console.log("\n📋 Agrega esta línea a apps/web/.env.local:");
  console.log(`NEXT_PUBLIC_CLINIC_ID=${clinic.id}`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
