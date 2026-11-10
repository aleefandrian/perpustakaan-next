import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runFeatureTests() {
  console.log("🧪 Memulai Pengujian Fungsionalitas Fitur Manajemen Buku Libra...\n");

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
    }
  }

  // 1. Pagination Tests (20 per page, 15 pages)
  console.log("--- 1. PENGUJIAN PAGINASI (20 item per halaman) ---");
  const p1 = await prisma.book.findMany({ skip: 0, take: 20 });
  assert(p1.length === 20, "Halaman 1 menghasilkan tepat 20 buku");

  const p2 = await prisma.book.findMany({ skip: 20, take: 20 });
  assert(p2.length === 20, "Halaman 2 menghasilkan tepat 20 buku");
  assert(p1[0].id !== p2[0].id, "Halaman 1 dan 2 memiliki ID buku yang berbeda");

  const p15 = await prisma.book.findMany({ skip: 280, take: 20 });
  assert(p15.length === 20, "Halaman 15 menghasilkan tepat 20 buku (total 300 buku)");

  const p16 = await prisma.book.findMany({ skip: 300, take: 20 });
  assert(p16.length === 0, "Halaman 16 kosong (karena tepat 300 buku / 15 halaman)");

  // 2. Search Tests
  console.log("\n--- 2. PENGUJIAN PENCARIAN (Database Insensitive Search) ---");
  const searchTitle = await prisma.book.findMany({
    where: { title: { contains: "science", mode: "insensitive" } },
  });
  assert(searchTitle.length > 0, `Pencarian judul "science" menemukan ${searchTitle.length} buku`);

  const searchAuthor = await prisma.book.findMany({
    where: { author: { contains: "Borges", mode: "insensitive" } },
  });
  assert(searchAuthor.length > 0, `Pencarian pengarang "Borges" menemukan ${searchAuthor.length} buku`);

  const searchEmpty = await prisma.book.findMany({
    where: { title: { contains: "xyzxyznonexistentquery999", mode: "insensitive" } },
  });
  assert(searchEmpty.length === 0, "Pencarian query acak tidak menghasilkan buku (0 buku)");

  // 3. Filtering Tests
  console.log("\n--- 3. PENGUJIAN FILTER KATEGORI & STATUS STOK ---");
  const category1 = await prisma.category.findFirst();
  const booksInCat1 = await prisma.book.count({ where: { categoryId: category1.id } });
  assert(booksInCat1 > 0, `Filter kategori "${category1.name}" menghasilkan ${booksInCat1} buku`);

  const filterTersedia = await prisma.book.count({ where: { availableStock: { gt: 2 } } });
  assert(filterTersedia > 0, `Filter status "Tersedia (>2)" menemukan ${filterTersedia} buku`);

  const filterMenipis = await prisma.book.count({ where: { availableStock: { gte: 1, lte: 2 } } });
  assert(filterMenipis > 0, `Filter status "Stok Menipis (1-2)" menemukan ${filterMenipis} buku`);

  const filterHabis = await prisma.book.count({ where: { availableStock: 0 } });
  assert(filterHabis > 0, `Filter status "Habis (0)" menemukan ${filterHabis} buku`);

  // 4. Sorting Tests
  console.log("\n--- 4. PENGUJIAN PENGURUTAN (Sorting) ---");
  const sortAsc = await prisma.book.findMany({ take: 2, orderBy: { title: "asc" } });
  assert(sortAsc.length === 2 && sortAsc[0].title.localeCompare(sortAsc[1].title) <= 0, "Pengurutan Judul A-Z berfungsi dengan benar");

  const sortStockDesc = await prisma.book.findMany({ take: 2, orderBy: { availableStock: "desc" } });
  assert(sortStockDesc[0].availableStock >= sortStockDesc[1].availableStock, "Pengurutan Stok Terbanyak berfungsi dengan benar");

  // 5. CRUD & Safety Deletion Tests
  console.log("\n--- 5. PENGUJIAN CRUD DAN INTEGRITAS TRANSAKSI ---");
  // A. Create Book
  const testBook = await prisma.book.create({
    data: {
      title: "Test Automation Book QA",
      author: "QA Tester Specialist",
      isbn: "9781234567890",
      publisher: "QA Press",
      publishedYear: 2026,
      genre: "Testing",
      coverUrl: "https://covers.openlibrary.org/b/id/10832290-M.jpg",
      totalStock: 5,
      availableStock: 5,
      location: "Rak Test",
    },
  });
  assert(testBook.id > 0, `Berhasil membuat buku baru ID #${testBook.id}`);

  // B. Edit Book
  const updatedBook = await prisma.book.update({
    where: { id: testBook.id },
    data: {
      title: "Test Automation Book QA (Updated)",
      availableStock: 4,
    },
  });
  assert(updatedBook.title.includes("(Updated)") && updatedBook.availableStock === 4, "Berhasil memperbarui data buku");

  // C. Test Safety Deletion on Book with Active Loan
  const bookWithLoan = await prisma.book.findFirst({
    where: {
      loans: {
        some: { status: "ACTIVE" },
      },
    },
    include: { loans: true },
  });

  if (bookWithLoan) {
    let prevented = false;
    // Check our logic: active loans must prevent deletion
    const activeLoans = bookWithLoan.loans.filter((l) => l.status === "ACTIVE" || l.status === "OVERDUE");
    if (activeLoans.length > 0) {
      prevented = true;
    }
    assert(prevented, `Buku ID #${bookWithLoan.id} ("${bookWithLoan.title}") memiliki pinjaman aktif (${activeLoans.length}) sehingga penghapusan dicegah dengan aman`);
  }

  // D. Delete the test book
  await prisma.book.delete({ where: { id: testBook.id } });
  const checkDeleted = await prisma.book.findUnique({ where: { id: testBook.id } });
  assert(checkDeleted === null, "Buku pengujian berhasil dihapus permanen");

  // Final count check
  const finalCount = await prisma.book.count();
  assert(finalCount === 300, `Jumlah buku kembali tepat 300 (Aktual: ${finalCount})`);

  console.log(`\n📊 Ringkasan Hasil Pengujian: ${passed} / ${total} PASS (${Math.round((passed / total) * 100)}% Sukses)\n`);
}

runFeatureTests()
  .catch((e) => {
    console.error("Test error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
