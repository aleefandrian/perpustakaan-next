import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CATEGORY_DEFINITIONS = [
  { name: "Fiksi & Sastra", slug: "fiksi-sastra", query: "fiction", description: "Koleksi novel, cerita pendek, puisi, dan karya sastra klasik maupun modern." },
  { name: "Sains & Teknologi", slug: "sains-teknologi", query: "science", description: "Buku ilmu pengetahuan alam, fisika, biologi, kimia, dan terapan sains." },
  { name: "Komputer & Pemrograman", slug: "komputer-pemrograman", query: "computer science", description: "Teknologi informasi, rekayasa perangkat lunak, algoritma, dan pemrograman." },
  { name: "Sejarah & Budaya", slug: "sejarah-budaya", query: "history", description: "Peristiwa sejarah peradaban dunia, kebudayaan, dan arsip sejarah penting." },
  { name: "Pendidikan & Referensi", slug: "pendidikan-referensi", query: "education", description: "Buku pelajaran, metodologi pengajaran, kamus, dan panduan akademik." },
  { name: "Bisnis & Ekonomi", slug: "bisnis-ekonomi", query: "business", description: "Manajemen bisnis, finansial, ekonomi mikro-makro, dan kewirausahaan." },
  { name: "Psikologi & Pengembangan Diri", slug: "psikologi-pengembangan-diri", query: "psychology", description: "Psikologi kognitif, perilaku, kesehatan mental, dan kepemimpinan." },
  { name: "Biografi & Memoar", slug: "biografi-memoar", query: "biography", description: "Kisah hidup tokoh inspiratif, pemimpin dunia, ilmuwan, dan penulis legendaris." },
  { name: "Matematika & Logika", slug: "matematika-logika", query: "mathematics", description: "Matematika murni, statistika, kalkulus, aljabar, dan logika formal." },
  { name: "Filsafat & Etika", slug: "filsafat-etika", query: "philosophy", description: "Pemikiran filsafat barat-timur, etika, epistemologi, dan filsafat ilmu." },
  { name: "Seni & Desain", slug: "seni-desain", query: "art", description: "Seni visual, sejarah seni, tipografi, desain arsitektur, dan ilustrasi." },
  { name: "Sastra Dunia", slug: "sastra-dunia", query: "literature", description: "Karya literatur pemenang penghargaan dunia dan teks klasik." },
];

async function seedCategories() {
  console.log("🌱 Menyiapkan Kategori Perpustakaan...");
  const categoryMap = new Map();

  for (const cat of CATEGORY_DEFINITIONS) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: { name: cat.name, slug: cat.slug, description: cat.description },
    });
    categoryMap.set(cat.query, record.id);
    categoryMap.set(cat.slug, record.id);
  }

  console.log(`✅ ${categoryMap.size / 2} Kategori berhasil disiapkan.`);
  return categoryMap;
}

async function validateCoverImage(coverId) {
  const url = `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
  try {
    const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(5000) });
    if (!res.ok) return false;
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.startsWith("image/")) {
      return true;
    }
    return false;
  } catch {
    // If HEAD fails due to timeout or network glitch, cover_i is still standard Open Library ID
    return true;
  }
}

function cleanIsbn(isbnList) {
  if (!isbnList || !Array.isArray(isbnList) || isbnList.length === 0) return null;
  // Prefer 13-digit ISBN
  const isbn13 = isbnList.find((i) => i.replace(/[^0-9X]/gi, "").length === 13);
  if (isbn13) return isbn13.trim();
  const isbn10 = isbnList.find((i) => i.replace(/[^0-9X]/gi, "").length === 10);
  if (isbn10) return isbn10.trim();
  return String(isbnList[0]).trim();
}

function assignRackLocation(idx) {
  const racks = ["Rak A-1", "Rak A-2", "Rak B-1", "Rak B-2", "Rak C-1", "Rak C-2", "Rak D-1", "Rak D-2", "Rak E-1", "Rak E-2"];
  return racks[idx % racks.length];
}

function determineStock(idx) {
  // We want:
  // ~80% Tersedia (stock > 2)
  // ~12% Stok Menipis (stock 1-2)
  // ~8% Habis (available = 0)
  if (idx % 12 === 0) {
    // Habis
    const total = 3 + (idx % 4);
    return { totalStock: total, availableStock: 0 };
  } else if (idx % 7 === 0) {
    // Stok Menipis (1 or 2)
    const avail = (idx % 2) + 1;
    const total = avail + 2 + (idx % 3);
    return { totalStock: total, availableStock: avail };
  } else {
    // Tersedia (> 2)
    const avail = 3 + (idx % 10);
    const total = avail + (idx % 5);
    return { totalStock: total, availableStock: avail };
  }
}

async function fetchBooksFromOpenLibrary(query, limit = 50, page = 1) {
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(
    query
  )}&page=${page}&limit=${limit}&fields=key,title,subtitle,author_name,isbn,publisher,first_publish_year,subject,cover_i`;

  console.log(`📡 Mengambil data Open Library: [${query}] (halaman ${page}, batas ${limit})...`);
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) {
    throw new Error(`Open Library API error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return data.docs || [];
}

async function main() {
  console.log("🚀 Memulai Impor 300 Buku Nyata dari Open Library API...");

  const categoryMap = await seedCategories();
  const existingCount = await prisma.book.count();
  console.log(`📊 Jumlah buku saat ini di database: ${existingCount}`);

  if (existingCount >= 300) {
    console.log(`✅ Database sudah memiliki ${existingCount} buku (>= 300). Tidak perlu impor ulang.`);
    await printStats();
    return;
  }

  // Set to track unique titles and cover IDs
  const existingBooks = await prisma.book.findMany({ select: { title: true, coverId: true } });
  const seenTitles = new Set(existingBooks.map((b) => b.title.toLowerCase().trim()));
  const seenCoverIds = new Set(existingBooks.map((b) => String(b.coverId)));

  let totalImported = existingCount;
  const target = 300;

  for (const catDef of CATEGORY_DEFINITIONS) {
    if (totalImported >= target) break;

    const categoryId = categoryMap.get(catDef.query);
    let page = 1;
    let attempts = 0;

    while (totalImported < target && attempts < 3) {
      attempts++;
      let docs = [];
      try {
        docs = await fetchBooksFromOpenLibrary(catDef.query, 60, page);
      } catch (err) {
        console.warn(`⚠️ Gagal mengambil query "${catDef.query}":`, err.message);
        break;
      }

      if (!docs || docs.length === 0) break;

      for (const doc of docs) {
        if (totalImported >= target) break;

        // Validation rules:
        // 1. Must have valid title
        if (!doc.title || typeof doc.title !== "string" || doc.title.trim().length < 2) continue;
        const normalizedTitle = doc.title.toLowerCase().trim();
        if (seenTitles.has(normalizedTitle)) continue;

        // 2. Must have valid author
        if (!doc.author_name || !Array.isArray(doc.author_name) || doc.author_name.length === 0) continue;
        const author = doc.author_name.slice(0, 3).join(", ");

        // 3. Must have valid cover_i (number > 0)
        if (!doc.cover_i || typeof doc.cover_i !== "number" || doc.cover_i <= 0) continue;
        const coverIdStr = String(doc.cover_i);
        if (seenCoverIds.has(coverIdStr)) continue;

        // 4. Validate cover image format
        const coverUrl = `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`;

        // 5. Extract metadata
        const isbn = cleanIsbn(doc.isbn);
        const publisher = Array.isArray(doc.publisher) && doc.publisher.length > 0 ? doc.publisher[0] : "Penerbit Umum";
        const publishedYear = doc.first_publish_year && doc.first_publish_year > 1000 && doc.first_publish_year <= 2026 ? doc.first_publish_year : 2020;
        const genre = Array.isArray(doc.subject) && doc.subject.length > 0 ? doc.subject.slice(0, 2).join(", ") : catDef.name;
        const subtitle = doc.subtitle || null;
        const description = Array.isArray(doc.subject) ? `Koleksi perpustakaan bidang ${catDef.name}. Subjek: ${doc.subject.slice(0, 5).join(", ")}.` : `Koleksi buku resmi Libra: ${doc.title}.`;
        const location = assignRackLocation(totalImported);
        const stockInfo = determineStock(totalImported);

        try {
          await prisma.book.create({
            data: {
              title: doc.title.trim(),
              subtitle: subtitle ? subtitle.trim() : null,
              author: author.trim(),
              isbn: isbn,
              publisher: publisher.trim(),
              publishedYear: publishedYear,
              description: description,
              genre: genre,
              categoryId: categoryId,
              coverId: coverIdStr,
              coverUrl: coverUrl,
              source: "openlibrary",
              sourceUrl: doc.key ? `https://openlibrary.org${doc.key}` : `https://openlibrary.org/search?q=${encodeURIComponent(doc.title)}`,
              totalStock: stockInfo.totalStock,
              availableStock: stockInfo.availableStock,
              location: location,
            },
          });

          seenTitles.add(normalizedTitle);
          seenCoverIds.add(coverIdStr);
          totalImported++;

          if (totalImported % 10 === 0 || totalImported === target) {
            console.log(`📥 Progress Impor: ${totalImported} / ${target} buku tersimpan...`);
          }
        } catch (dbErr) {
          console.warn("⚠️ Gagal menyimpan ke DB:", dbErr.message);
        }
      }

      page++;
      // Polite delay between batches
      await new Promise((r) => setTimeout(r, 800));
    }
  }

  console.log(`\n🎉 SELESAI! Total buku berhasil diimpor: ${totalImported} buku.`);

  // Create sample loans if none exist
  await seedSampleLoans();

  await printStats();
}

async function seedSampleLoans() {
  const existingLoans = await prisma.loan.count();
  if (existingLoans > 0) return;

  const books = await prisma.book.findMany({ take: 5 });
  if (books.length === 0) return;

  console.log("📑 Menambahkan sampel transaksi peminjaman...");
  const borrowers = [
    { name: "Ahmad Fauzi", role: "Siswa (XII RPL 1)" },
    { name: "Siti Rahmawati", role: "Siswa (XI TKJ 2)" },
    { name: "Budi Santoso, S.Pd.", role: "Guru Bahasa Indonesia" },
    { name: "Rina Marlina", role: "Siswa (X IPA 3)" },
    { name: "Dimas Anggara", role: "Staf Tata Usaha" },
  ];

  for (let i = 0; i < Math.min(books.length, borrowers.length); i++) {
    const now = new Date();
    const dueDate = new Date();
    dueDate.setDate(now.getDate() + 7);

    await prisma.loan.create({
      data: {
        bookId: books[i].id,
        borrower: borrowers[i].name,
        role: borrowers[i].role,
        borrowDate: now,
        dueDate: dueDate,
        status: i === 0 ? "OVERDUE" : i === 1 ? "ACTIVE" : "RETURNED",
      },
    });
  }
  console.log("✅ 5 sampel transaksi peminjaman berhasil dibuat.");
}

async function printStats() {
  const total = await prisma.book.count();
  const available = await prisma.book.aggregate({ _sum: { availableStock: true } });
  const lowStock = await prisma.book.count({ where: { availableStock: { lte: 2, gt: 0 } } });
  const outOfStock = await prisma.book.count({ where: { availableStock: 0 } });
  const categories = await prisma.category.count();

  console.log("\n================ STATISTIK BUKU LIBRA ================");
  console.log(`📚 Total Buku Terdaftar : ${total}`);
  console.log(`🏷️  Total Kategori       : ${categories}`);
  console.log(`📦 Total Stok Tersedia  : ${available._sum.availableStock || 0}`);
  console.log(`⚠️  Stok Menipis (1-2)   : ${lowStock}`);
  console.log(`🚫 Stok Habis (0)       : ${outOfStock}`);
  console.log("======================================================\n");
}

main()
  .catch((e) => {
    console.error("❌ Fatal Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
