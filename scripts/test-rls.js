#!/usr/bin/env node

/**
 * Test RLS Policies
 * 
 * Este script valida que las políticas Row Level Security funcionen correctamente
 * aislando datos por tenant (clinicId).
 * 
 * Uso:
 *   node scripts/test-rls.js
 * 
 * Requisitos:
 *   - DATABASE_URL configurado en .env
 *   - Migración enable_rls_policies aplicada
 *   - Al menos 2 clinics en la base de datos
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

// ANSI colors para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}${colors.bright}${msg}${colors.reset}`),
};

/**
 * Set tenant context for current transaction
 */
async function setTenantContext(clinicId) {
  if (clinicId) {
    await prisma.$executeRawUnsafe(`SET LOCAL app.current_tenant = '${clinicId}'`);
    log.info(`Tenant context set to: ${clinicId}`);
  } else {
    await prisma.$executeRawUnsafe(`RESET app.current_tenant`);
    log.info('Tenant context reset (no tenant)');
  }
}

/**
 * Test 1: Verify RLS is enabled on tables
 */
async function testRlsEnabled() {
  log.section('TEST 1: Verify RLS Enabled');

  const tables = [
    'Clinic', 'Branch', 'User', 'Staff', 'Service', 'Package',
    'Reservation', 'PaymentIntent', 'Notification', 'AuditLog'
  ];

  let passCount = 0;

  for (const table of tables) {
    try {
      const result = await prisma.$queryRawUnsafe(`
        SELECT relrowsecurity
        FROM pg_class
        WHERE relname = '${table}'
      `);

      if (result[0]?.relrowsecurity) {
        log.success(`RLS enabled on ${table}`);
        passCount++;
      } else {
        log.error(`RLS NOT enabled on ${table}`);
      }
    } catch (error) {
      log.error(`Error checking ${table}: ${error.message}`);
    }
  }

  log.info(`\nResult: ${passCount}/${tables.length} tables have RLS enabled`);
  return passCount === tables.length;
}

/**
 * Test 2: Verify helper function exists
 */
async function testHelperFunction() {
  log.section('TEST 2: Verify current_tenant_id() Function');

  try {
    const result = await prisma.$queryRawUnsafe(`
      SELECT current_tenant_id() AS tenant_id
    `);

    if (result[0]?.tenant_id === null) {
      log.success('Helper function exists and returns NULL when no tenant set');
      return true;
    } else {
      log.error(`Unexpected result: ${result[0]?.tenant_id}`);
      return false;
    }
  } catch (error) {
    log.error(`Helper function error: ${error.message}`);
    return false;
  }
}

/**
 * Test 3: Verify tenant isolation
 */
async function testTenantIsolation() {
  log.section('TEST 3: Verify Tenant Isolation');

  // Get 2 different clinics
  const clinics = await prisma.clinic.findMany({ take: 2 });

  if (clinics.length < 2) {
    log.warn('Need at least 2 clinics in database. Creating test clinics...');
    
    // Create 2 test clinics
    const clinic1 = await prisma.clinic.create({
      data: {
        name: 'Test Clinic 1 (RLS Test)',
        slug: `test-clinic-1-${Date.now()}`,
      },
    });

    const clinic2 = await prisma.clinic.create({
      data: {
        name: 'Test Clinic 2 (RLS Test)',
        slug: `test-clinic-2-${Date.now()}`,
      },
    });

    clinics.push(clinic1, clinic2);
    log.success('Created 2 test clinics');
  }

  const clinic1Id = clinics[0].id;
  const clinic2Id = clinics[1].id;

  log.info(`\nClinic 1: ${clinic1Id}`);
  log.info(`Clinic 2: ${clinic2Id}`);

  let passed = true;

  // Test 3.1: Set tenant to clinic1, should only see clinic1 data
  log.info('\n--- Test 3.1: Access with Clinic 1 context ---');
  
  await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`SET LOCAL app.current_tenant = '${clinic1Id}'`);

    const users = await tx.user.findMany();
    const clinic1Users = users.filter(u => u.clinicId === clinic1Id);
    const otherUsers = users.filter(u => u.clinicId !== clinic1Id);

    if (otherUsers.length > 0) {
      log.error(`ISOLATION BREACH: Found ${otherUsers.length} users from other clinics!`);
      log.error(`IDs: ${otherUsers.map(u => u.clinicId).join(', ')}`);
      passed = false;
    } else {
      log.success(`Isolation OK: Found ${clinic1Users.length} users, all from clinic1`);
    }

    const reservations = await tx.reservation.findMany();
    const clinic1Reservations = reservations.filter(r => r.clinicId === clinic1Id);
    const otherReservations = reservations.filter(r => r.clinicId !== clinic1Id);

    if (otherReservations.length > 0) {
      log.error(`ISOLATION BREACH: Found ${otherReservations.length} reservations from other clinics!`);
      passed = false;
    } else {
      log.success(`Isolation OK: Found ${clinic1Reservations.length} reservations, all from clinic1`);
    }
  });

  // Test 3.2: Set tenant to clinic2, should only see clinic2 data
  log.info('\n--- Test 3.2: Access with Clinic 2 context ---');
  
  await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`SET LOCAL app.current_tenant = '${clinic2Id}'`);

    const users = await tx.user.findMany();
    const clinic2Users = users.filter(u => u.clinicId === clinic2Id);
    const otherUsers = users.filter(u => u.clinicId !== clinic2Id);

    if (otherUsers.length > 0) {
      log.error(`ISOLATION BREACH: Found ${otherUsers.length} users from other clinics!`);
      passed = false;
    } else {
      log.success(`Isolation OK: Found ${clinic2Users.length} users, all from clinic2`);
    }
  });

  // Test 3.3: No tenant context, should see nothing
  log.info('\n--- Test 3.3: Access with NO tenant context ---');
  
  await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`RESET app.current_tenant`);

    const users = await tx.user.findMany();
    const reservations = await tx.reservation.findMany();

    if (users.length > 0 || reservations.length > 0) {
      log.error(`ISOLATION BREACH: Should see 0 records without tenant, but found ${users.length} users and ${reservations.length} reservations`);
      passed = false;
    } else {
      log.success('Isolation OK: No records visible without tenant context');
    }
  });

  return passed;
}

/**
 * Test 4: Verify indirect relationships (Staff, TherapistProfile, etc.)
 */
async function testIndirectRelationships() {
  log.section('TEST 4: Verify Indirect Relationship Policies');

  const clinics = await prisma.clinic.findMany({ take: 1 });
  
  if (clinics.length === 0) {
    log.warn('No clinics found. Skipping indirect relationship test.');
    return true;
  }

  const clinicId = clinics[0].id;
  let passed = true;

  await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(`SET LOCAL app.current_tenant = '${clinicId}'`);

    // Test Staff access (through User relationship)
    const staff = await tx.staff.findMany({
      include: { user: true },
    });

    const wrongClinicStaff = staff.filter(s => s.user.clinicId !== clinicId);

    if (wrongClinicStaff.length > 0) {
      log.error(`ISOLATION BREACH: Found ${wrongClinicStaff.length} staff from other clinics`);
      passed = false;
    } else {
      log.success(`Staff isolation OK: ${staff.length} staff records, all from correct clinic`);
    }

    // Test TherapistProfile access (through Staff -> User relationship)
    const therapists = await tx.therapistProfile.findMany({
      include: { staff: { include: { user: true } } },
    });

    const wrongClinicTherapists = therapists.filter(
      t => t.staff.user.clinicId !== clinicId
    );

    if (wrongClinicTherapists.length > 0) {
      log.error(`ISOLATION BREACH: Found ${wrongClinicTherapists.length} therapists from other clinics`);
      passed = false;
    } else {
      log.success(`Therapist isolation OK: ${therapists.length} therapists, all from correct clinic`);
    }

    // Test PackageService access (through Package relationship)
    const packageServices = await tx.packageService.findMany({
      include: { package: true },
    });

    const wrongClinicPackageServices = packageServices.filter(
      ps => ps.package.clinicId !== clinicId
    );

    if (wrongClinicPackageServices.length > 0) {
      log.error(`ISOLATION BREACH: Found ${wrongClinicPackageServices.length} package services from other clinics`);
      passed = false;
    } else {
      log.success(`PackageService isolation OK: ${packageServices.length} package services, all from correct clinic`);
    }
  });

  return passed;
}

/**
 * Test 5: Performance check - verify indexes exist
 */
async function testIndexes() {
  log.section('TEST 5: Verify Performance Indexes');

  const expectedIndexes = [
    { table: 'User', column: 'clinicId' },
    { table: 'Branch', column: 'clinicId' },
    { table: 'Service', column: 'clinicId' },
    { table: 'Package', column: 'clinicId' },
    { table: 'Reservation', column: 'clinicId' },
    { table: 'Staff', column: 'userId' },
  ];

  let passCount = 0;

  for (const { table, column } of expectedIndexes) {
    try {
      const result = await prisma.$queryRawUnsafe(`
        SELECT COUNT(*) as count
        FROM pg_indexes
        WHERE tablename = '${table}'
        AND indexdef LIKE '%${column}%'
      `);

      const count = parseInt(result[0]?.count || 0);

      if (count > 0) {
        log.success(`Index exists on ${table}.${column}`);
        passCount++;
      } else {
        log.warn(`No index found on ${table}.${column}`);
      }
    } catch (error) {
      log.error(`Error checking index on ${table}.${column}: ${error.message}`);
    }
  }

  log.info(`\nResult: ${passCount}/${expectedIndexes.length} indexes found`);
  return passCount >= expectedIndexes.length * 0.8; // Pass if 80% of indexes exist
}

/**
 * Main test runner
 */
async function runTests() {
  console.log(`
${colors.cyan}${colors.bright}
╔═══════════════════════════════════════════════════════╗
║         Bloom RLS Policies Test Suite                 ║
║         Testing Row Level Security Isolation          ║
╚═══════════════════════════════════════════════════════╝
${colors.reset}
  `);

  const results = {
    rlsEnabled: false,
    helperFunction: false,
    tenantIsolation: false,
    indirectRelationships: false,
    indexes: false,
  };

  try {
    results.rlsEnabled = await testRlsEnabled();
    results.helperFunction = await testHelperFunction();
    results.tenantIsolation = await testTenantIsolation();
    results.indirectRelationships = await testIndirectRelationships();
    results.indexes = await testIndexes();

    // Summary
    log.section('TEST SUMMARY');

    const passed = Object.values(results).filter(Boolean).length;
    const total = Object.keys(results).length;

    console.log(`
  RLS Enabled:              ${results.rlsEnabled ? '✓ PASS' : '✗ FAIL'}
  Helper Function:          ${results.helperFunction ? '✓ PASS' : '✗ FAIL'}
  Tenant Isolation:         ${results.tenantIsolation ? '✓ PASS' : '✗ FAIL'}
  Indirect Relationships:   ${results.indirectRelationships ? '✓ PASS' : '✗ FAIL'}
  Performance Indexes:      ${results.indexes ? '✓ PASS' : '✗ FAIL'}

  ${colors.bright}Overall: ${passed}/${total} tests passed${colors.reset}
    `);

    if (passed === total) {
      log.success('All RLS tests passed! Multi-tenant isolation is working correctly. 🎉');
      process.exit(0);
    } else {
      log.error(`${total - passed} test(s) failed. Review RLS policies.`);
      process.exit(1);
    }

  } catch (error) {
    log.error(`Test suite error: ${error.message}`);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests if executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests, setTenantContext };
