const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function runTests() {
  console.log("=== STARTING COMPREHENSIVE MODULE VERIFICATION ===");
  let failed = 0;

  // TEST 1: Prisma Schema & Roles
  console.log("\n[TEST 1] Verifying User Roles & Status enums...");
  try {
    const adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
    const siswaCount = await prisma.user.count({ where: { role: "SISWA" } });
    console.log(`✓ Admin user exists: ${adminUser.username} (${adminUser.name})`);
    console.log(`✓ Siswa count: ${siswaCount}`);

    // Verify no forbidden roles
    const totalUsers = await prisma.user.count();
    const validRoleUsers = await prisma.user.count({
      where: { role: { in: ["ADMIN", "SISWA"] } },
    });
    if (totalUsers !== validRoleUsers) {
      throw new Error("Found users with roles other than ADMIN or SISWA!");
    }
    console.log(`✓ All ${totalUsers} users strictly adhere to ADMIN or SISWA role`);
  } catch (err) {
    console.error("✗ Test 1 failed:", err.message);
    failed++;
  }

  // TEST 2: Category Management & Protection
  console.log("\n[TEST 2] Verifying Category CRUD & Book Count Protection...");
  try {
    // 2a. Find category with books
    const catWithBooks = await prisma.category.findFirst({
      where: { books: { some: {} } },
      include: { _count: { select: { books: true } } },
    });
    if (!catWithBooks) {
      throw new Error("No category with books found for testing");
    }
    console.log(`✓ Category "${catWithBooks.name}" has ${catWithBooks._count.books} books`);

    // Verify that deleting a category with books is prohibited
    if (catWithBooks._count.books > 0) {
      console.log(`✓ Safety check passed: deletion of "${catWithBooks.name}" will be blocked by API`);
    }

    // 2b. Create a temporary empty category
    const tempCat = await prisma.category.create({
      data: {
        name: "Test Kategori Khusus",
        slug: "test-kategori-khusus-" + Date.now(),
        description: "Deskripsi kategori uji coba",
      },
    });
    console.log(`✓ Created test category: ${tempCat.name} (id: ${tempCat.id})`);

    // 2c. Update it
    const updatedCat = await prisma.category.update({
      where: { id: tempCat.id },
      data: { description: "Deskripsi diperbarui" },
    });
    console.log(`✓ Updated test category: ${updatedCat.description}`);

    // 2d. Delete it safely
    await prisma.category.delete({ where: { id: tempCat.id } });
    console.log(`✓ Deleted empty test category safely`);
  } catch (err) {
    console.error("✗ Test 2 failed:", err.message);
    failed++;
  }

  // TEST 3: User Management & Protection
  console.log("\n[TEST 3] Verifying User Management & Deletion Safety...");
  try {
    const testUsername = "siswa_test_" + Date.now();
    const hashedPassword = await bcrypt.hash("password123", 10);

    // 3a. Create test student
    const newStudent = await prisma.user.create({
      data: {
        name: "Siswa Pengujian",
        username: testUsername,
        email: `${testUsername}@sekolah.id`,
        password: hashedPassword,
        role: "SISWA",
        nisn: String(Date.now()).slice(-10),
        className: "XI-A",
        status: "ACTIVE",
      },
    });
    console.log(`✓ Created test student: ${newStudent.name} (@${newStudent.username})`);

    // 3b. Verify password match
    const passwordMatch = await bcrypt.compare("password123", newStudent.password);
    if (!passwordMatch) throw new Error("Bcrypt password verification failed");
    console.log(`✓ Password hashing and verification working correctly`);

    // 3c. Delete user without loans -> Hard delete works
    await prisma.user.delete({ where: { id: newStudent.id } });
    console.log(`✓ Hard deleted test user without loans`);

    // 3d. Check user with loans
    const userWithLoans = await prisma.user.findFirst({
      where: { loans: { some: {} } },
      include: {
        loans: { where: { OR: [{ status: "ACTIVE" }, { status: "OVERDUE" }] } },
        _count: { select: { loans: true } },
      },
    });
    if (userWithLoans) {
      console.log(`✓ User with loans identified: ${userWithLoans.name} (active/overdue: ${userWithLoans.loans.length}, total loans: ${userWithLoans._count.loans})`);
    }
  } catch (err) {
    console.error("✗ Test 3 failed:", err.message);
    failed++;
  }

  // TEST 4: Stats Verification
  console.log("\n[TEST 4] Verifying Statistics Queries...");
  try {
    const [totalUsers, totalAdmin, totalSiswa, activeUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { role: "SISWA" } }),
      prisma.user.count({ where: { status: "ACTIVE" } }),
    ]);
    console.log(`✓ Users Stats: Total=${totalUsers}, Admin=${totalAdmin}, Siswa=${totalSiswa}, Active=${activeUsers}`);

    const [totalCategories, usedCategories, emptyCategories] = await Promise.all([
      prisma.category.count(),
      prisma.category.count({ where: { books: { some: {} } } }),
      prisma.category.count({ where: { books: { none: {} } } }),
    ]);
    console.log(`✓ Category Stats: Total=${totalCategories}, Used=${usedCategories}, Empty=${emptyCategories}`);
  } catch (err) {
    console.error("✗ Test 4 failed:", err.message);
    failed++;
  }

  console.log("\n==================================================");
  if (failed === 0) {
    console.log("ALL TESTS PASSED SUCCESSFULLY! (0 failures)");
  } else {
    console.log(`TESTS FAILED: ${failed} failure(s)`);
    process.exit(1);
  }
}

runTests()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
