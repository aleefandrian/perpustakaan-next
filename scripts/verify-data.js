import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Memulai Verifikasi Data Buku Perpustakaan Libra...\n");

  // 1. Total records
  const total = await prisma.book.count();
  console.log(`1. Total Buku di Database          : ${total}`);

  // 2. Distinct titles & coverIds
  const distinctTitles = await prisma.book.findMany({
    select: { title: true },
    distinct: ["title"],
  });
  console.log(`2. Jumlah Judul Unik               : ${distinctTitles.length}`);

  // 3. Books with title
  const withTitle = await prisma.book.count({
    where: { title: { not: "" } },
  });
  console.log(`3. Buku dengan Judul Valid         : ${withTitle}`);

  // 4. Books with author
  const withAuthor = await prisma.book.count({
    where: { author: { not: "" } },
  });
  console.log(`4. Buku dengan Pengarang Valid     : ${withAuthor}`);

  // 5. Books with ISBN
  const withIsbn = await prisma.book.count({
    where: { isbn: { not: null } },
  });
  console.log(`5. Buku dengan ISBN Tercatat       : ${withIsbn}`);

  // 6. Books with cover ID
  const withCoverId = await prisma.book.count({
    where: { coverId: { not: null } },
  });
  console.log(`6. Buku dengan ID Cover Open Lib   : ${withCoverId}`);

  // 7. Books with cover URL
  const withCoverUrl = await prisma.book.count({
    where: { coverUrl: { startsWith: "http" } },
  });
  console.log(`7. Buku dengan URL Cover Valid     : ${withCoverUrl}`);

  // 8. Missing covers
  const missingCovers = await prisma.book.count({
    where: {
      OR: [
        { coverUrl: "" },
        { NOT: { coverUrl: { startsWith: "http" } } },
      ],
    },
  });
  console.log(`8. Buku tanpa Cover (Missing)      : ${missingCovers}`);

  // 9. Duplicates check
  const allBooks = await prisma.book.findMany({ select: { title: true } });
  const titleCounts = {};
  let duplicates = 0;
  for (const b of allBooks) {
    const norm = b.title.toLowerCase().trim();
    if (titleCounts[norm]) {
      duplicates++;
    } else {
      titleCounts[norm] = 1;
    }
  }
  console.log(`9. Jumlah Judul Duplikat           : ${duplicates}`);

  // 10. Inventory rules validation
  const invalidStock = await prisma.book.count({
    where: {
      OR: [
        { totalStock: { lt: 0 } },
        { availableStock: { lt: 0 } },
      ],
    },
  });
  console.log(`10. Rekor Stok Negatif/Invalid     : ${invalidStock}`);

  // 11. Categories check
  const categoriesCount = await prisma.category.count();
  const booksWithoutCategory = await prisma.book.count({
    where: { categoryId: null },
  });
  console.log(`11. Total Kategori Terdaftar       : ${categoriesCount}`);
  console.log(`12. Buku tanpa Relasi Kategori     : ${booksWithoutCategory}`);

  // 12. Loans check
  const loansCount = await prisma.loan.count();
  console.log(`13. Total Transaksi Peminjaman     : ${loansCount}`);

  // 13. Pagination check
  const pageSize = 20;
  const totalPages = Math.ceil(total / pageSize);
  console.log(`14. Halaman Paginasi (20/hlm)      : ${totalPages} Halaman`);

  // 14. Stock status distribution
  const stockAvailable = await prisma.book.count({ where: { availableStock: { gt: 2 } } });
  const stockLow = await prisma.book.count({ where: { availableStock: { gte: 1, lte: 2 } } });
  const stockOut = await prisma.book.count({ where: { availableStock: 0 } });
  console.log(`15. Distribusi Status Stok:`);
  console.log(`    - Tersedia (> 2)   : ${stockAvailable}`);
  console.log(`    - Stok Menipis (1-2): ${stockLow}`);
  console.log(`    - Habis (0)        : ${stockOut}`);

  // 15. Sample check of cover image HEAD response for 5 random books
  console.log("\n🌐 Memeriksa respon HTTP HEAD sampel Cover Open Library...");
  const sampleBooks = await prisma.book.findMany({ take: 5, select: { title: true, coverUrl: true } });
  let headSuccess = 0;
  for (const sb of sampleBooks) {
    try {
      const res = await fetch(sb.coverUrl, { method: "HEAD", signal: AbortSignal.timeout(6000) });
      const cType = res.headers.get("content-type");
      console.log(`    ✓ [${res.status}] ${cType || "unknown"} -> ${sb.title.slice(0, 30)}...`);
      if (res.ok) headSuccess++;
    } catch (err) {
      console.warn(`    ⚠️ Gagal cek cover: ${err.message}`);
    }
  }
  console.log(`    Hasil Sampel Cover: ${headSuccess}/${sampleBooks.length} sukses merespon gambar.`);

  console.log("\n================ KESIMPULAN AUDIT ================");
  if (total === 300 && withCoverUrl === 300 && missingCovers === 0 && duplicates === 0) {
    console.log("✅ SEMUA KRITERIA DATA BUKU TERPENUHI DENGAN SEMPURNA! (300/300 BUKU)");
  } else {
    console.log("⚠️ ADA KETIDAKSESUAIAN DATA");
  }
  console.log("==================================================\n");
}

main()
  .catch((e) => {
    console.error("Error audit:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
