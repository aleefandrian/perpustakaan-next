import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const INDONESIAN_FIRST_NAMES = [
  "Aditya", "Ahmad", "Anisa", "Bayu", "Bima", "Citra", "Daffa", "Dewi",
  "Dimas", "Eka", "Fadhil", "Farhan", "Fitri", "Galih", "Gita", "Hafiz",
  "Ilham", "Indah", "Intan", "Joko", "Kartika", "Laras", "Mahendra", "Mega",
  "Muhammad", "Nabila", "Naufal", "Nurul", "Pradana", "Putra", "Putri",
  "Rafi", "Rahma", "Rian", "Rina", "Rizky", "Salma", "Salsabila", "Satria",
  "Siti", "Surya", "Syifa", "Taufik", "Tiara", "Tri", "Wahyu", "Wulan",
  "Yogi", "Yuda", "Zahra"
];

const INDONESIAN_LAST_NAMES = [
  "Pratama", "Saputra", "Wijaya", "Kusuma", "Hidayat", "Nugroho", "Santoso",
  "Wibowo", "Setiawan", "Lestari", "Utami", "Handayani", "Permana", "Ramadhan",
  "Firmansyah", "Gunawan", "Suryono", "Purnomo", "Wahyudi", "Susanto"
];

const CLASSES = ["X-A", "X-B", "XI-A", "XI-B", "XII-A", "XII-B"];

export async function seedUsers() {
  console.log("🌱 Menyiapkan Data Pengguna Libra (1 Admin + 50 Siswa)...");

  const adminPasswordPlain = process.env.SEED_ADMIN_PASSWORD || "admin123";
  const studentPasswordPlain = process.env.SEED_STUDENT_PASSWORD || "siswa123";

  const adminPasswordHash = await bcrypt.hash(adminPasswordPlain, 10);
  const studentPasswordHash = await bcrypt.hash(studentPasswordPlain, 10);

  // 1. Seed Admin
  const adminData = {
    name: "Administrator Libra",
    username: "admin_libra",
    email: "admin@libra.local",
    password: adminPasswordHash,
    role: "ADMIN",
    employeeId: "ADM001",
    phone: "081234567890",
    address: "Perpustakaan Bintang Harapan",
    status: "ACTIVE",
  };

  const admin = await prisma.user.upsert({
    where: { username: adminData.username },
    update: {
      name: adminData.name,
      email: adminData.email,
      role: adminData.role,
      employeeId: adminData.employeeId,
      phone: adminData.phone,
      address: adminData.address,
      status: adminData.status,
    },
    create: adminData,
  });

  console.log(`✅ Admin terdaftar: ${admin.name} (@${admin.username})`);

  // 2. Seed 50 Students
  let studentsCreated = 0;
  for (let i = 0; i < 50; i++) {
    const firstName = INDONESIAN_FIRST_NAMES[i % INDONESIAN_FIRST_NAMES.length];
    const lastName = INDONESIAN_LAST_NAMES[i % INDONESIAN_LAST_NAMES.length];
    const fullName = `${firstName} ${lastName}`;
    const username = `${firstName.toLowerCase()}_${String(i + 1).padStart(2, "0")}`;
    const email = `${username}@siswa.libra.local`;
    // 10 digit unique NISN (e.g. 0081234501 to 0081234550)
    const nisn = `008123${String(4500 + i + 1)}`;
    const className = CLASSES[i % CLASSES.length];
    const phone = `08${(1000000000 + i * 17923).toString().slice(0, 10)}`;

    await prisma.user.upsert({
      where: { username },
      update: {
        name: fullName,
        email,
        nisn,
        className,
        role: "SISWA",
        phone,
        status: "ACTIVE",
      },
      create: {
        name: fullName,
        username,
        email,
        password: studentPasswordHash,
        role: "SISWA",
        nisn,
        className,
        phone,
        status: "ACTIVE",
      },
    });
    studentsCreated++;
  }

  console.log(`✅ ${studentsCreated} Siswa berhasil disiapkan/diperbarui.`);

  // 3. Connect existing sample loans to users if not yet assigned
  const loans = await prisma.loan.findMany({ where: { userId: null }, take: 5 });
  if (loans.length > 0) {
    const students = await prisma.user.findMany({ where: { role: "SISWA" }, take: 5 });
    for (let i = 0; i < Math.min(loans.length, students.length); i++) {
      await prisma.loan.update({
        where: { id: loans[i].id },
        data: {
          userId: students[i].id,
          borrower: students[i].name,
          role: `Siswa (${students[i].className})`,
        },
      });
    }
    console.log(`✅ ${loans.length} transaksi peminjaman dikaitkan dengan akun siswa.`);
  }

  // Print statistics
  const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
  const studentCount = await prisma.user.count({ where: { role: "SISWA" } });
  const totalCount = await prisma.user.count();

  console.log("\n================ STATISTIK PENGGUNA LIBRA ================");
  console.log(`👑 Total Akun ADMIN  : ${adminCount}`);
  console.log(`🎓 Total Akun SISWA  : ${studentCount}`);
  console.log(`👥 Total Keseluruhan : ${totalCount}`);
  console.log("==========================================================\n");
}

if (process.argv[1]?.endsWith("seed-users.js")) {
  seedUsers()
    .catch((e) => {
      console.error("❌ Fatal Error seed users:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
