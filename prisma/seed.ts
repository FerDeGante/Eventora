// prisma/seed.ts

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  const targetClinicId = process.env.SEED_CLINIC_ID ?? process.env.NEXT_PUBLIC_CLINIC_ID;

  // 1) Crear/usar Clínica Principal
  console.log("\n📍 Creando/clonando clínica...");
  let clinic =
    (targetClinicId ? await prisma.clinic.findUnique({ where: { id: targetClinicId } }) : null) ??
    (await prisma.clinic.findUnique({ where: { slug: "eventora-principal" } }));

  if (!clinic) {
    clinic = await prisma.clinic.create({
      data: {
        id: targetClinicId,
        name: "Eventora Clínica Principal",
        slug: "eventora-principal",
        settings: {
          timezone: "America/Mexico_City",
          currency: "MXN",
          locale: "es-MX",
        },
      },
    });
  }

  console.log(`✅ Clínica: ${clinic.name} (${clinic.id})`);

  // 2) Crear Sucursales
  console.log("\n🏢 Creando sucursales...");
  const branchesData = [
    {
      name: "Sucursal Centro",
      address: "Av. Principal #123, Centro, Ciudad de México",
      phone: "555-0001",
      timezone: "America/Mexico_City",
    },
    {
      name: "Sucursal Norte",
      address: "Blvd. Norte #456, Zona Norte, Ciudad de México",
      phone: "555-0002",
      timezone: "America/Mexico_City",
    },
  ];

  const branches = [];
  for (const b of branchesData) {
    const branch = await prisma.branch.upsert({
      where: { clinicId_name: { clinicId: clinic.id, name: b.name } },
      update: {},
    create: {
      clinicId: clinic.id,
      ...b,
    },
  });
    branches.push(branch);
    console.log(`  ✓ ${branch.name}`);
  }

  // 3) Crear Usuario Admin
  console.log("\n👤 Creando usuarios...");
  const adminPassword = await bcrypt.hash("eventoraadmin25", 10);
  const adminUser = await prisma.user.upsert({
    where: { clinicId_email: { clinicId: clinic.id, email: "ferdegante.22@gmail.com" } },
    update: {},
    create: {
      clinicId: clinic.id,
      email: "ferdegante.22@gmail.com",
      name: "Fernando De Gante",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });
  console.log(`  ✓ Admin: ${adminUser.email}`);

  // Actualizar la clínica con el owner
  await prisma.clinic.update({
    where: { id: clinic.id },
    data: { ownerUserId: adminUser.id },
  });

  // 4) Crear Terapeutas (Staff + TherapistProfile)
  console.log("\n💆 Creando terapeutas...");
  const therapistsData = [
    { 
      email: "jesus.ramirez@bloom.com", 
      name: "Jesús Ramírez", 
      specialties: ["Fisioterapia", "Rehabilitación"],
      branchId: branches[0].id,
    },
    { 
      email: "miguel.ramirez@bloom.com", 
      name: "Miguel Ramírez", 
      specialties: ["Estimulación temprana", "Terapia acuática"],
      branchId: branches[0].id,
    },
    { 
      email: "alitzel.pacheco@bloom.com", 
      name: "Alitzel Pacheco", 
      specialties: ["Masajes", "Quiropráctica"],
      branchId: branches[1].id,
    },
  ];

  const therapists = [];
  for (const t of therapistsData) {
    const therapistPassword = await bcrypt.hash("therapist123", 10);
    const therapistUser = await prisma.user.upsert({
      where: { clinicId_email: { clinicId: clinic.id, email: t.email } },
      update: {},
      create: {
        clinicId: clinic.id,
        email: t.email,
        name: t.name,
        passwordHash: therapistPassword,
        role: "THERAPIST",
      },
    });

    const staff = await prisma.staff.upsert({
      where: { userId: therapistUser.id },
      update: {},
      create: {
        userId: therapistUser.id,
        branchId: t.branchId,
        jobTitle: "Terapeuta",
        colorTag: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      },
    });

    const therapistProfile = await prisma.therapistProfile.upsert({
      where: { staffId: staff.id },
      update: {},
      create: {
        staffId: staff.id,
        specialties: t.specialties,
        avgSessionMinutes: 60,
      },
    });

    therapists.push(therapistProfile);
    console.log(`  ✓ ${t.name} - ${t.specialties.join(", ")}`);
  }

  // 5) Crear Categorías de Servicios
  console.log("\n📂 Creando categorías de servicios...");
  const categoriesData = [
    { name: "Estimulación", colorHex: "#4CAF50" },
    { name: "Fisioterapia", colorHex: "#2196F3" },
    { name: "Terapias Complementarias", colorHex: "#FF9800" },
    { name: "Deportivo", colorHex: "#9C27B0" },
    { name: "Salud Integral", colorHex: "#F44336" },
  ];

  const categories = [];
  for (const cat of categoriesData) {
    const category = await prisma.serviceCategory.upsert({
      where: { clinicId_name: { clinicId: clinic.id, name: cat.name } },
      update: {},
      create: {
        clinicId: clinic.id,
        ...cat,
        sortOrder: categories.length,
      },
    });
    categories.push(category);
    console.log(`  ✓ ${category.name}`);
  }

  // 6) Crear Servicios
  console.log("\n🎯 Creando servicios...");
  const servicesData = [
    { 
      name: "Estimulación en agua",
      categoryName: "Estimulación",
      description: "Terapia de estimulación temprana en medio acuático",
      defaultDuration: 60,
      basePrice: 50000, // en centavos (500 MXN)
    },
    { 
      name: "Estimulación en piso",
      categoryName: "Estimulación",
      description: "Terapia de estimulación temprana en piso",
      defaultDuration: 60,
      basePrice: 50000,
    },
    { 
      name: "Fisioterapia",
      categoryName: "Fisioterapia",
      description: "Sesión de fisioterapia especializada",
      defaultDuration: 60,
      basePrice: 50000,
    },
    { 
      name: "Terapia post vacuna",
      categoryName: "Terapias Complementarias",
      description: "Terapia especializada post aplicación de vacunas",
      defaultDuration: 45,
      basePrice: 50000,
    },
    { 
      name: "Quiropráctica",
      categoryName: "Terapias Complementarias",
      description: "Ajustes quiroprácticos",
      defaultDuration: 45,
      basePrice: 50000,
    },
    { 
      name: "Masajes",
      categoryName: "Terapias Complementarias",
      description: "Masajes terapéuticos",
      defaultDuration: 60,
      basePrice: 50000,
    },
    { 
      name: "Prevención de lesiones",
      categoryName: "Deportivo",
      description: "Programa de prevención de lesiones deportivas",
      defaultDuration: 60,
      basePrice: 50000,
    },
    { 
      name: "Preparación física",
      categoryName: "Deportivo",
      description: "Entrenamiento y preparación física",
      defaultDuration: 90,
      basePrice: 50000,
    },
    { 
      name: "Nutrición",
      categoryName: "Salud Integral",
      description: "Consulta nutricional",
      defaultDuration: 45,
      basePrice: 50000,
    },
    { 
      name: "Medicina en rehabilitación",
      categoryName: "Salud Integral",
      description: "Consulta médica de rehabilitación",
      defaultDuration: 45,
      basePrice: 50000,
    },
  ];

  const services = [];
  for (const s of servicesData) {
    const category = categories.find(c => c.name === s.categoryName);
    const service = await prisma.service.upsert({
      where: { clinicId_name: { clinicId: clinic.id, name: s.name } },
      update: {},
      create: {
        clinicId: clinic.id,
        categoryId: category?.id,
        name: s.name,
        description: s.description,
        defaultDuration: s.defaultDuration,
        basePrice: s.basePrice,
      },
    });
    services.push(service);
    console.log(`  ✓ ${service.name}`);
  }

  // 6.1) Disponibilidad base (templates)
  console.log("\n⏱️ Creando templates de disponibilidad...");
  const templateOwners = [
    { ownerType: "BRANCH" as const, ownerId: branches[0].id, branchId: branches[0].id },
    { ownerType: "BRANCH" as const, ownerId: branches[1].id, branchId: branches[1].id },
  ];
  const weekdays = [1, 2, 3, 4, 5];
  for (const tpl of templateOwners) {
    for (const weekday of weekdays) {
      const exists = await prisma.availabilityTemplate.findFirst({
        where: {
          clinicId: clinic.id,
          ownerType: tpl.ownerType,
          ownerId: tpl.ownerId,
          weekday,
          startTime: new Date(Date.UTC(1970, 0, 1, 8, 0)),
          endTime: new Date(Date.UTC(1970, 0, 1, 16, 0)),
        },
      });
      if (!exists) {
        await prisma.availabilityTemplate.create({
          data: {
            clinicId: clinic.id,
            ownerType: tpl.ownerType,
            ownerId: tpl.ownerId,
            branchId: tpl.branchId,
            weekday,
            startTime: new Date(Date.UTC(1970, 0, 1, 8, 0)),
            endTime: new Date(Date.UTC(1970, 0, 1, 16, 0)),
            slotDuration: 60,
            capacity: 2,
          },
        });
      }
    }
  }
  console.log("  ✓ Templates diarios 08:00-16:00");

  // 7) Crear Paquetes
  console.log("\n📦 Creando paquetes...");
  const packagesData = [
    {
      name: "Estimulación en agua (1×mes)",
      serviceName: "Estimulación en agua",
      stripePriceId: "price_1RJd0OFV5ZpZiouCasDGf28F",
      sessions: 1,
      validityDays: 30,
      basePrice: 50000,
      inscriptionFee: 3000,
    },
    {
      name: "Estimulación en agua (4×mes)",
      serviceName: "Estimulación en agua",
      stripePriceId: "price_1RMBAKFV5ZpZiouCCnrjam5N",
      sessions: 4,
      validityDays: 30,
      basePrice: 140000,
      inscriptionFee: 3000,
    },
    {
      name: "Estimulación en agua (8×mes)",
      serviceName: "Estimulación en agua",
      stripePriceId: "price_1RMBFKFV5ZpZiouCJ1vHKREU",
      sessions: 8,
      validityDays: 30,
      basePrice: 225000,
      inscriptionFee: 3000,
    },
    {
      name: "Estimulación en agua (12×mes)",
      serviceName: "Estimulación en agua",
      stripePriceId: "price_1RMBIaFV5ZpZiouC8l6QjW2N",
      sessions: 12,
      validityDays: 30,
      basePrice: 250000,
      inscriptionFee: 3000,
    },
    {
      name: "Estimulación en piso (1×mes)",
      serviceName: "Estimulación en piso",
      stripePriceId: "price_1RJd1jFV5ZpZiouC1xXvllVc",
      sessions: 1,
      validityDays: 30,
      basePrice: 50000,
      inscriptionFee: 3000,
    },
    {
      name: "Estimulación en piso (4×mes)",
      serviceName: "Estimulación en piso",
      stripePriceId: "price_1RP6S2FV5ZpZiouC6cVpXQsJ",
      sessions: 4,
      validityDays: 30,
      basePrice: 140000,
      inscriptionFee: 3000,
    },
    {
      name: "Estimulación en piso (8×mes)",
      serviceName: "Estimulación en piso",
      stripePriceId: "price_1RP6SsFV5ZpZiouCtbg4A7OE",
      sessions: 8,
      validityDays: 30,
      basePrice: 225000,
      inscriptionFee: 3000,
    },
    {
      name: "Estimulación en piso (12×mes)",
      serviceName: "Estimulación en piso",
      stripePriceId: "price_1RP6TaFV5ZpZiouCoG5G58S3",
      sessions: 12,
      validityDays: 30,
      basePrice: 250000,
      inscriptionFee: 3000,
    },
    {
      name: "Fisioterapia (1×mes)",
      serviceName: "Fisioterapia",
      stripePriceId: "price_1RJd3WFV5ZpZiouC9PDzHjKU",
      sessions: 1,
      validityDays: 30,
      basePrice: 50000,
      inscriptionFee: 3000,
    },
    {
      name: "Fisioterapia (5×mes)",
      serviceName: "Fisioterapia",
      stripePriceId: "price_1RP6WwFV5ZpZiouCN3m0luq3",
      sessions: 5,
      validityDays: 30,
      basePrice: 200000,
      inscriptionFee: 3000,
    },
    {
      name: "Fisioterapia (10×mes)",
      serviceName: "Fisioterapia",
      stripePriceId: "price_1RP6W9FV5ZpZiouCBXnZwxLW",
      sessions: 10,
      validityDays: 30,
      basePrice: 300000,
      inscriptionFee: 3000,
    },
    {
      name: "Terapia post vacuna",
      serviceName: "Terapia post vacuna",
      stripePriceId: "price_1ROMxFFV5ZpZiouCdkM2KoHF",
      sessions: 1,
      validityDays: 7,
      basePrice: 50000,
      inscriptionFee: 3000,
    },
    {
      name: "Quiropráctica",
      serviceName: "Quiropráctica",
      stripePriceId: "price_1RJd2fFV5ZpZiouCsaJNkUTO",
      sessions: 1,
      validityDays: 30,
      basePrice: 50000,
      inscriptionFee: 3000,
    },
    {
      name: "Masajes",
      serviceName: "Masajes",
      stripePriceId: "price_1RJd4JFV5ZpZiouCPjcpX3Xn",
      sessions: 1,
      validityDays: 30,
      basePrice: 50000,
      inscriptionFee: 3000,
    },
  ];

  for (const p of packagesData) {
    const service = services.find(s => s.name === p.serviceName);
    const pkg = await prisma.package.upsert({
      where: { clinicId_name: { clinicId: clinic.id, name: p.name } },
      update: {},
      create: {
        clinicId: clinic.id,
        name: p.name,
        sessions: p.sessions,
        validityDays: p.validityDays,
        basePrice: p.basePrice,
        inscriptionFee: p.inscriptionFee,
        stripePriceId: p.stripePriceId,
        status: "ACTIVE",
      },
    });

    // Relacionar el paquete con el servicio
    if (service) {
      const existingLink = await prisma.packageService.findFirst({
        where: { packageId: pkg.id, serviceId: service.id },
      });
      if (!existingLink) {
        await prisma.packageService.create({
          data: {
            packageId: pkg.id,
            serviceId: service.id,
            mandatory: true,
            sequence: 0,
          },
        });
      }
    }

    console.log(`  ✓ ${pkg.name} - ${p.sessions} sesiones`);
  }

  // 8) Crear Clientes de Prueba
  console.log("\n👥 Creando clientes de prueba...");
  const clientsData = [
    { email: "cliente1@ejemplo.com", name: "María González", phone: "555-1001" },
    { email: "cliente2@ejemplo.com", name: "Juan Pérez", phone: "555-1002" },
    { email: "cliente3@ejemplo.com", name: "Ana Martínez", phone: "555-1003" },
  ];

  const clients = [];
  for (const c of clientsData) {
    const clientPassword = await bcrypt.hash("cliente123", 10);
    const client = await prisma.user.upsert({
      where: { clinicId_email: { clinicId: clinic.id, email: c.email } },
      update: {},
      create: {
        clinicId: clinic.id,
        email: c.email,
        name: c.name,
        phone: c.phone,
        passwordHash: clientPassword,
        role: "CLIENT",
      },
    });
    clients.push(client);
    console.log(`  ✓ ${client.name} (${client.email})`);
  }

  // 9) Paquetes asignados y reservas de ejemplo
  console.log("\n📅 Generando reservas y tickets...");
  const today = new Date();
  const startOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 8, 0));

  const sampleReservations = [
    { offsetHours: 0, serviceName: "Estimulación en agua", branch: branches[0], status: "CHECKED_IN" as const },
    { offsetHours: 1, serviceName: "Fisioterapia", branch: branches[0], status: "CONFIRMED" as const },
    { offsetHours: 2, serviceName: "Masajes", branch: branches[1], status: "CONFIRMED" as const },
    { offsetHours: 3, serviceName: "Quiropráctica", branch: branches[1], status: "COMPLETED" as const },
  ];

  const therapistProfile = await prisma.therapistProfile.findFirst({
    where: { staff: { user: { clinicId: clinic.id } } },
  });
  const firstPackage = await prisma.package.findFirst({ where: { clinicId: clinic.id }, orderBy: { createdAt: "asc" } });

  if (firstPackage) {
    const existingPackage = await prisma.userPackage.findFirst({
      where: {
        clinicId: clinic.id,
        userId: clients[0]?.id ?? adminUser.id,
        packageId: firstPackage.id,
      },
    });
    if (!existingPackage) {
      await prisma.userPackage.create({
        data: {
          clinicId: clinic.id,
          userId: clients[0]?.id ?? adminUser.id,
          packageId: firstPackage.id,
          sessionsTotal: 4,
          sessionsRemaining: 3,
          startDate: startOfDay,
          expiryDate: new Date(startOfDay.getTime() + 28 * 24 * 60 * 60 * 1000),
          pricePaid: 140000,
          paymentSource: "STRIPE",
        },
      });
    }
  }

  for (const res of sampleReservations) {
    const service = services.find((s) => s.name === res.serviceName);
    if (!service) continue;
    const startAt = new Date(startOfDay.getTime() + res.offsetHours * 60 * 60 * 1000);
    const endAt = new Date(startAt.getTime() + service.defaultDuration * 60 * 1000);
    const existingRes = await prisma.reservation.findFirst({
      where: {
        clinicId: clinic.id,
        branchId: res.branch.id,
        serviceId: service.id,
        userId: clients[0]?.id ?? adminUser.id,
        startAt,
      },
    });
    const reservation =
      existingRes ??
      (await prisma.reservation.create({
        data: {
          clinicId: clinic.id,
          branchId: res.branch.id,
          serviceId: service.id,
          userId: clients[0]?.id ?? adminUser.id,
          therapistId: therapistProfile?.id,
          startAt,
          endAt,
          status: res.status,
          paymentStatus: "PAID",
          notes: "Reserva demo generada por seed",
        },
      }));

    const paymentIntent = await prisma.paymentIntent.upsert({
      where: { id: reservation.paymentIntentId ?? `${reservation.id}-pi` },
      update: {},
      create: {
        id: reservation.paymentIntentId ?? `${reservation.id}-pi`,
        clinicId: clinic.id,
        amount: service.basePrice,
        currency: "MXN",
        provider: "STRIPE",
        status: "PAID",
        metadata: { seed: true },
      },
    });

    if (!reservation.paymentIntentId) {
      await prisma.reservation.update({
        where: { id: reservation.id },
        data: { paymentIntentId: paymentIntent.id },
      });
    }

    await prisma.posPrintJob.upsert({
      where: { id: `${paymentIntent.id}-job` },
      update: {},
      create: {
        id: `${paymentIntent.id}-job`,
        clinicId: clinic.id,
        paymentIntentId: paymentIntent.id,
        content: `Ticket ${paymentIntent.id} · ${service.name} · ${res.branch.name}`,
        status: "PRINTED",
        metadata: { branchName: res.branch.name },
      },
    });

    console.log(`  ✓ Reserva ${service.name} (${res.branch.name}) ${startAt.toISOString().slice(11, 16)} status ${res.status}`);
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ Seed finalizado correctamente!");
  console.log("=".repeat(60));
  console.log(`\n📋 Información importante:`);
  console.log(`   Clínica ID: ${clinic.id}`);
  console.log(`   Clínica Slug: ${clinic.slug}`);
  console.log(`\n💡 Agrega esto a apps/web/.env.local:`);
  console.log(`   NEXT_PUBLIC_CLINIC_ID=${clinic.id}`);
  console.log("\n" + "=".repeat(60) + "\n");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
