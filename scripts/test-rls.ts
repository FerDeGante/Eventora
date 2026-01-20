/**
 * RLS Policy Testing Script
 * 
 * This script validates that Row Level Security policies are working correctly
 * by testing tenant isolation across different scenarios.
 * 
 * Usage:
 *   npm run test:rls
 * 
 * Prerequisites:
 *   - Migration 20251213000000_enable_rls applied
 *   - At least 2 clinics seeded in database
 *   - Environment variables configured
 */

import { PrismaClient } from '@prisma/client';

// Test clinic IDs (replace with actual IDs from your database)
const CLINIC_A_ID = 'clinic_a_id_here';
const CLINIC_B_ID = 'clinic_b_id_here';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message: string) {
  log(`✅ ${message}`, 'green');
}

function error(message: string) {
  log(`❌ ${message}`, 'red');
}

function info(message: string) {
  log(`ℹ️  ${message}`, 'cyan');
}

function section(message: string) {
  log(`\n${'='.repeat(60)}`, 'blue');
  log(`  ${message}`, 'blue');
  log(`${'='.repeat(60)}`, 'blue');
}

// Helper to create Prisma client with tenant context
async function createTenantClient(tenantId: string, isAdmin = false) {
  const prisma = new PrismaClient();
  
  // Set tenant context using raw SQL
  await prisma.$executeRawUnsafe(`
    SELECT set_config('app.current_tenant_id', '${tenantId}', false);
  `);
  
  if (isAdmin) {
    await prisma.$executeRawUnsafe(`
      SELECT set_config('app.is_system_admin', 'true', false);
    `);
  }
  
  return prisma;
}

async function runTests() {
  log('\n🧪 Starting RLS Policy Tests\n', 'yellow');
  
  let passedTests = 0;
  let failedTests = 0;
  
  try {
    // ========================================================================
    // TEST 1: Tenant Isolation - SELECT
    // ========================================================================
    section('TEST 1: Tenant Isolation - SELECT');
    
    const prismaA = await createTenantClient(CLINIC_A_ID);
    const prismaB = await createTenantClient(CLINIC_B_ID);
    
    info('Fetching users for Clinic A...');
    const usersA = await prismaA.user.findMany();
    
    info('Fetching users for Clinic B...');
    const usersB = await prismaB.user.findMany();
    
    // Verify no overlap
    const overlapIds = usersA
      .map(u => u.id)
      .filter(id => usersB.map(u => u.id).includes(id));
    
    if (overlapIds.length === 0) {
      success('No user overlap between tenants');
      passedTests++;
    } else {
      error(`Found ${overlapIds.length} overlapping users!`);
      failedTests++;
    }
    
    // Verify clinicId matches
    const wrongClinicUsers = usersA.filter(u => u.clinicId !== CLINIC_A_ID);
    if (wrongClinicUsers.length === 0) {
      success('All users belong to correct clinic');
      passedTests++;
    } else {
      error(`Found ${wrongClinicUsers.length} users with wrong clinicId!`);
      failedTests++;
    }
    
    await prismaA.$disconnect();
    await prismaB.$disconnect();
    
    // ========================================================================
    // TEST 2: Cross-Tenant Access Prevention - INSERT
    // ========================================================================
    section('TEST 2: Cross-Tenant Access Prevention - INSERT');
    
    const prismaClinicA = await createTenantClient(CLINIC_A_ID);
    
    try {
      info('Attempting to insert user for Clinic B while in Clinic A context...');
      await prismaClinicA.user.create({
        data: {
          clinicId: CLINIC_B_ID, // Wrong tenant!
          email: 'malicious@test.com',
          passwordHash: 'hash',
          role: 'CLIENT',
        },
      });
      
      error('RLS FAILED: Allowed cross-tenant insert!');
      failedTests++;
    } catch (err) {
      success('RLS blocked cross-tenant insert');
      passedTests++;
    }
    
    await prismaClinicA.$disconnect();
    
    // ========================================================================
    // TEST 3: System Admin Bypass
    // ========================================================================
    section('TEST 3: System Admin Bypass');
    
    const prismaAdmin = await createTenantClient(CLINIC_A_ID, true);
    
    info('Fetching all clinics as system admin...');
    const allClinics = await prismaAdmin.clinic.findMany();
    
    if (allClinics.length >= 2) {
      success(`System admin can see ${allClinics.length} clinics`);
      passedTests++;
    } else {
      error('System admin bypass not working!');
      failedTests++;
    }
    
    await prismaAdmin.$disconnect();
    
    // ========================================================================
    // TEST 4: Nested Relations Isolation (Staff → User)
    // ========================================================================
    section('TEST 4: Nested Relations Isolation');
    
    const prismaNestedA = await createTenantClient(CLINIC_A_ID);
    
    info('Fetching staff with user relation...');
    const staffA = await prismaNestedA.staff.findMany({
      include: { user: true },
    });
    
    const wrongClinicStaff = staffA.filter(
      s => s.user?.clinicId !== CLINIC_A_ID
    );
    
    if (wrongClinicStaff.length === 0) {
      success('All staff belong to correct clinic (via User relation)');
      passedTests++;
    } else {
      error(`Found ${wrongClinicStaff.length} staff with wrong clinic!`);
      failedTests++;
    }
    
    await prismaNestedA.$disconnect();
    
    // ========================================================================
    // TEST 5: Update Restrictions
    // ========================================================================
    section('TEST 5: Update Restrictions');
    
    const prismaUpdateA = await createTenantClient(CLINIC_A_ID);
    const prismaUpdateB = await createTenantClient(CLINIC_B_ID);
    
    // Get a user from Clinic B
    const userB = await prismaUpdateB.user.findFirst();
    
    if (userB) {
      try {
        info('Attempting to update Clinic B user from Clinic A context...');
        await prismaUpdateA.user.update({
          where: { id: userB.id },
          data: { name: 'Hacked Name' },
        });
        
        error('RLS FAILED: Allowed cross-tenant update!');
        failedTests++;
      } catch (err) {
        success('RLS blocked cross-tenant update');
        passedTests++;
      }
    } else {
      info('No users in Clinic B, skipping update test');
    }
    
    await prismaUpdateA.$disconnect();
    await prismaUpdateB.$disconnect();
    
    // ========================================================================
    // TEST 6: Delete Restrictions
    // ========================================================================
    section('TEST 6: Delete Restrictions');
    
    const prismaDeleteA = await createTenantClient(CLINIC_A_ID);
    const prismaDeleteB = await createTenantClient(CLINIC_B_ID);
    
    // Create a test user in Clinic B
    const testUser = await prismaDeleteB.user.create({
      data: {
        clinicId: CLINIC_B_ID,
        email: `test-delete-${Date.now()}@example.com`,
        passwordHash: 'hash',
        role: 'CLIENT',
      },
    });
    
    try {
      info('Attempting to delete Clinic B user from Clinic A context...');
      await prismaDeleteA.user.delete({
        where: { id: testUser.id },
      });
      
      error('RLS FAILED: Allowed cross-tenant delete!');
      failedTests++;
    } catch (err) {
      success('RLS blocked cross-tenant delete');
      passedTests++;
    }
    
    // Cleanup: delete from correct context
    await prismaDeleteB.user.delete({
      where: { id: testUser.id },
    });
    
    await prismaDeleteA.$disconnect();
    await prismaDeleteB.$disconnect();
    
    // ========================================================================
    // TEST 7: Reservation Isolation
    // ========================================================================
    section('TEST 7: Reservation Isolation');
    
    const prismaResA = await createTenantClient(CLINIC_A_ID);
    const prismaResB = await createTenantClient(CLINIC_B_ID);
    
    info('Fetching reservations for Clinic A...');
    const reservationsA = await prismaResA.reservation.findMany();
    
    info('Fetching reservations for Clinic B...');
    const reservationsB = await prismaResB.reservation.findMany();
    
    const overlapReservations = reservationsA
      .map(r => r.id)
      .filter(id => reservationsB.map(r => r.id).includes(id));
    
    if (overlapReservations.length === 0) {
      success('No reservation overlap between tenants');
      passedTests++;
    } else {
      error(`Found ${overlapReservations.length} overlapping reservations!`);
      failedTests++;
    }
    
    await prismaResA.$disconnect();
    await prismaResB.$disconnect();
    
    // ========================================================================
    // TEST 8: Payment Intent Isolation
    // ========================================================================
    section('TEST 8: Payment Intent Isolation');
    
    const prismaPayA = await createTenantClient(CLINIC_A_ID);
    const prismaPayB = await createTenantClient(CLINIC_B_ID);
    
    info('Fetching payment intents for Clinic A...');
    const paymentsA = await prismaPayA.paymentIntent.findMany();
    
    info('Fetching payment intents for Clinic B...');
    const paymentsB = await prismaPayB.paymentIntent.findMany();
    
    const overlapPayments = paymentsA
      .map(p => p.id)
      .filter(id => paymentsB.map(p => p.id).includes(id));
    
    if (overlapPayments.length === 0) {
      success('No payment intent overlap between tenants');
      passedTests++;
    } else {
      error(`Found ${overlapPayments.length} overlapping payments!`);
      failedTests++;
    }
    
    await prismaPayA.$disconnect();
    await prismaPayB.$disconnect();
    
    // ========================================================================
    // TEST 9: Audit Log Immutability
    // ========================================================================
    section('TEST 9: Audit Log Immutability');
    
    const prismaAuditA = await createTenantClient(CLINIC_A_ID);
    
    // Create audit log entry
    const auditEntry = await prismaAuditA.auditLog.create({
      data: {
        clinicId: CLINIC_A_ID,
        action: 'TEST_ACTION',
        userId: 'test-user',
        metadata: {},
      },
    });
    
    try {
      info('Attempting to update audit log (should fail)...');
      await prismaAuditA.auditLog.update({
        where: { id: auditEntry.id },
        data: { action: 'MODIFIED_ACTION' },
      });
      
      error('Audit logs should be immutable!');
      failedTests++;
    } catch (err) {
      success('Audit logs are protected from updates');
      passedTests++;
    }
    
    try {
      info('Attempting to delete audit log (should fail)...');
      await prismaAuditA.auditLog.delete({
        where: { id: auditEntry.id },
      });
      
      error('Audit logs should be immutable!');
      failedTests++;
    } catch (err) {
      success('Audit logs are protected from deletion');
      passedTests++;
    }
    
    await prismaAuditA.$disconnect();
    
    // ========================================================================
    // TEST 10: Performance Check
    // ========================================================================
    section('TEST 10: Performance Check');
    
    const prismaPerfA = await createTenantClient(CLINIC_A_ID);
    
    info('Running 100 queries with RLS enabled...');
    const startTime = Date.now();
    
    for (let i = 0; i < 100; i++) {
      await prismaPerfA.user.findMany({ take: 10 });
    }
    
    const endTime = Date.now();
    const avgTime = (endTime - startTime) / 100;
    
    info(`Average query time: ${avgTime.toFixed(2)}ms`);
    
    if (avgTime < 50) {
      success('RLS performance is acceptable (<50ms avg)');
      passedTests++;
    } else if (avgTime < 100) {
      log(`⚠️  RLS performance is borderline (${avgTime.toFixed(2)}ms avg)`, 'yellow');
      passedTests++;
    } else {
      error(`RLS performance is poor (${avgTime.toFixed(2)}ms avg)`);
      failedTests++;
    }
    
    await prismaPerfA.$disconnect();
    
  } catch (err) {
    error(`Unexpected error during tests: ${err}`);
    failedTests++;
  }
  
  // ========================================================================
  // FINAL RESULTS
  // ========================================================================
  section('TEST RESULTS');
  
  const totalTests = passedTests + failedTests;
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  
  log(`\nTotal Tests: ${totalTests}`, 'cyan');
  log(`Passed: ${passedTests}`, 'green');
  log(`Failed: ${failedTests}`, failedTests > 0 ? 'red' : 'green');
  log(`Success Rate: ${successRate}%\n`, successRate === '100.0' ? 'green' : 'yellow');
  
  if (failedTests === 0) {
    success('🎉 All RLS tests passed! Tenant isolation is working correctly.\n');
    process.exit(0);
  } else {
    error('❌ Some RLS tests failed. Please review the policies.\n');
    process.exit(1);
  }
}

// Run tests
runTests().catch((err) => {
  error(`Fatal error: ${err}`);
  process.exit(1);
});
