import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateBookInput } from "@/features/books/schemas/bookSchema";
import { requireAuth, requireAdmin } from "@/lib/auth";

export async function GET(request) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "20", 10));
    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const genre = searchParams.get("genre")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const year = searchParams.get("year")?.trim() || "";
    const sort = searchParams.get("sort")?.trim() || "id-asc";

    // Build Prisma `where` clause
    const where = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { author: { contains: search, mode: "insensitive" } },
        { isbn: { contains: search, mode: "insensitive" } },
        { publisher: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category && category !== "all") {
      const catId = parseInt(category, 10);
      if (!isNaN(catId)) {
        where.categoryId = catId;
      } else {
        where.category = { slug: category };
      }
    }

    if (genre && genre !== "all") {
      where.genre = { contains: genre, mode: "insensitive" };
    }

    if (status && status !== "all") {
      if (status === "tersedia") {
        where.availableStock = { gt: 2 };
      } else if (status === "menipis") {
        where.availableStock = { gte: 1, lte: 2 };
      } else if (status === "habis") {
        where.availableStock = 0;
      }
    }

    if (year && year !== "all") {
      const y = parseInt(year, 10);
      if (!isNaN(y)) {
        where.publishedYear = y;
      }
    }

    // Build Prisma `orderBy` clause
    let orderBy = { id: "asc" };
    switch (sort) {
      case "title-asc":
        orderBy = { title: "asc" };
        break;
      case "title-desc":
        orderBy = { title: "desc" };
        break;
      case "year-desc":
        orderBy = { publishedYear: "desc" };
        break;
      case "year-asc":
        orderBy = { publishedYear: "asc" };
        break;
      case "stock-desc":
        orderBy = { availableStock: "desc" };
        break;
      case "stock-asc":
        orderBy = { availableStock: "asc" };
        break;
      default:
        orderBy = { id: "asc" };
    }

    // Execute queries in parallel
    const [books, totalFiltered, globalStats] = await Promise.all([
      prisma.book.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          _count: {
            select: { loans: true },
          },
        },
      }),
      prisma.book.count({ where }),
      // Global stats for cards
      Promise.all([
        prisma.book.count(),
        prisma.book.aggregate({
          _sum: { availableStock: true, totalStock: true },
        }),
        prisma.book.count({
          where: { availableStock: { lte: 2 } },
        }),
      ]),
    ]);

    const [totalBooks, stockSums, lowStockCount] = globalStats;
    const totalPages = Math.ceil(totalFiltered / limit) || 1;

    return NextResponse.json({
      success: true,
      data: books,
      pagination: {
        page,
        limit,
        total: totalFiltered,
        totalPages,
      },
      stats: {
        totalBooks: totalBooks,
        totalTitles: totalBooks, // unique titles
        availableStock: stockSums._sum.availableStock || 0,
        lowStock: lowStockCount,
      },
    });
  } catch (error) {
    console.error("Error fetching books:", error);
    const status = error.message?.includes("UNAUTHORIZED")
      ? 401
      : error.message?.includes("FORBIDDEN")
      ? 403
      : 500;
    return NextResponse.json(
      { success: false, message: error.message || "Gagal mengambil data buku." },
      { status }
    );
  }
}

export async function POST(request) {
  try {
    await requireAdmin();

    const body = await request.json();

    const { isValid, errors } = validateBookInput(body);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Validasi data gagal.", errors },
        { status: 400 }
      );
    }

    const created = await prisma.book.create({
      data: {
        title: body.title.trim(),
        subtitle: body.subtitle?.trim() || null,
        author: body.author.trim(),
        isbn: body.isbn?.trim() || null,
        publisher: body.publisher?.trim() || "Penerbit Umum",
        publishedYear: body.publishedYear ? parseInt(body.publishedYear, 10) : new Date().getFullYear(),
        description: body.description?.trim() || null,
        genre: body.genre?.trim() || "Umum",
        categoryId: body.categoryId ? parseInt(body.categoryId, 10) : null,
        coverUrl: body.coverUrl.trim(),
        coverId: body.coverId?.trim() || null,
        source: body.source || "manual",
        sourceUrl: body.sourceUrl || null,
        totalStock: parseInt(body.totalStock, 10),
        availableStock: parseInt(body.availableStock, 10),
        location: body.location?.trim() || "Rak A-1",
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(
      { success: true, message: "Buku berhasil ditambahkan.", data: created },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating book:", error);
    const status = error.message?.includes("UNAUTHORIZED")
      ? 401
      : error.message?.includes("FORBIDDEN")
      ? 403
      : 500;
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menambahkan buku." },
      { status }
    );
  }
}
