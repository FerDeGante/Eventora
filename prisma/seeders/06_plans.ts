// Seed para los planes de Eventora SaaS
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const plans = [
  {
    name: 'Starter',
    priceMonthly: 59900, // $599 MXN
    priceYearly: 599000, // $5,990 MXN (2 meses gratis)
    maxUsers: 3,
    maxBranches: 1,
    maxServices: 10,
    transactionFee: 400, // 4%
    features: {
      analytics: false,
      customBranding: false,
      apiAccess: false,
      prioritySupport: false,
      whatsappNotifications: false,
    },
    sortOrder: 1,
  },
  {
    name: 'Professional',
    priceMonthly: 129900, // $1,299 MXN
    priceYearly: 1299000, // $12,990 MXN
    maxUsers: 10,
    maxBranches: 3,
    maxServices: 50,
    transactionFee: 300, // 3%
    features: {
      analytics: true,
      customBranding: true,
      apiAccess: false,
      prioritySupport: false,
      whatsappNotifications: true,
    },
    sortOrder: 2,
  },
  {
    name: 'Enterprise',
    priceMonthly: 299900, // $2,999 MXN
    priceYearly: 2999000, // $29,990 MXN
    maxUsers: 50,
    maxBranches: 10,
    maxServices: 200,
    transactionFee: 200, // 2%
    features: {
      analytics: true,
      customBranding: true,
      apiAccess: true,
      prioritySupport: true,
      whatsappNotifications: true,
      dedicatedSupport: true,
    },
    sortOrder: 3,
  },
];

async function seedPlans() {
  console.log('🌱 Seeding plans...');

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    });
    console.log(`  ✅ Plan "${plan.name}" created/updated`);
  }

  console.log('✅ Plans seeded successfully');
}

export { seedPlans };

// Si se ejecuta directamente
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  seedPlans()
    .then(() => prisma.$disconnect())
    .catch((e) => {
      console.error(e);
      prisma.$disconnect();
      process.exit(1);
    });
}
