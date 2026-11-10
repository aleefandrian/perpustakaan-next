import { seedUsers } from "../scripts/seed-users.js";

async function main() {
  console.log("🚀 Menjalankan Database Seeder Utama Libra...");
  await seedUsers();
  console.log("✅ Seeding selesai dengan sukses!");
}

main().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});
