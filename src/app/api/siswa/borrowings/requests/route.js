import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStudent } from "@/lib/auth";

export const instant = false;

/**
 * GET /api/siswa/borrowings/requests
 * List borrowing requests submitted by the authenticated student.
 */
export async function GET(request) {
  try {
    const student = await requireStudent();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || "all";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));
    const skip = (page - 1) * limit;

    const where = {
      userId: student.id,
      ...(status !== "all" && { status }),
      ...(search && {
        OR: [
          { book: { title: { contains: search, mode: "insensitive" } } },
          { book: { author: { contains: search, mode: "insensitive" } } },
          { book: { isbn: { contains: search, mode: "insensitive" } } },
        ],
      }),
    };

    const [requests, total, stats] = await Promise.all([
      prisma.borrowingRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { requestedAt: "desc" },
        include: {
          book: {
            select: {
              id: true,
              title: true,
              author: true,
              isbn: true,
              coverUrl: true,
              availableStock: true,
              category: { select: { id: true, name: true } },
            },
          },
        },
      }),
      prisma.borrowingRequest.count({ where }),
      Promise.all([
        prisma.borrowingRequest.count({ where: { userId: student.id } }),
        prisma.borrowingRequest.count({
          where: { userId: student.id, status: "PENDING" },
        }),
        prisma.borrowingRequest.count({
          where: { userId: student.id, status: "APPROVED" },
        }),
        prisma.borrowingRequest.count({
          where: { userId: student.id, status: "REJECTED" },
        }),
      ]),
    ]);

    const [totalAll, pendingCount, approvedCount, rejectedCount] = stats;

    return NextResponse.json({
      success: true,
      data: requests,
      stats: {
        total: totalAll,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error("GET /api/siswa/borrowings/requests error:", error);
    const statusCode = error.message?.includes("UNAUTHORIZED")
      ? 401
      : error.message?.includes("FORBIDDEN")
      ? 403
      : 500;
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memuat pengajuan peminjaman." },
      { status: statusCode }
    );
  }
}

/**
 * POST /api/siswa/borrowings/requests
 * Submit a new borrowing request for a book.
 */
export async function POST(request) {
  try {
    const student = await requireStudent();
    const body = await request.json();
    const bookId = parseInt(body.bookId, 10);

    if (!bookId || isNaN(bookId)) {
      return NextResponse.json(
        { success: false, message: "ID Buku tidak valid." },
        { status: 400 }
      );
    }

    // 1. Check book existence and stock
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      select: { id: true, title: true, availableStock: true },
    });

    if (!book) {
      return NextResponse.json(
        { success: false, message: "Buku tidak ditemukan dalam katalog perpustakaan." },
        { status: 404 }
      );
    }

    if (book.availableStock <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Stok buku "${book.title}" saat ini sedang habis.`,
        },
        { status: 400 }
      );
    }

    // 2. Business Rule: Check if student already has an active borrowing for this book
    const existingActiveBorrowing = await prisma.borrowing.findFirst({
      where: {
        userId: student.id,
        bookId: book.id,
        status: "ACTIVE",
      },
    });

    if (existingActiveBorrowing) {
      return NextResponse.json(
        {
          success: false,
          message: `Anda sedang meminjam buku "${book.title}". Pengajuan baru hanya diperbolehkan setelah buku dikembalikan.`,
        },
        { status: 400 }
      );
    }

    // 3. Business Rule: Check if student already has a pending request for this book
    const existingPendingRequest = await prisma.borrowingRequest.findFirst({
      where: {
        userId: student.id,
        bookId: book.id,
        status: "PENDING",
      },
    });

    if (existingPendingRequest) {
      return NextResponse.json(
        {
          success: false,
          message: `Anda sudah memiliki pengajuan peminjaman untuk buku "${book.title}" yang sedang menunggu persetujuan Admin.`,
        },
        { status: 400 }
      );
    }

    // 4. Create the BorrowingRequest (No stock decrement yet, requires Admin approval)
    const newRequest = await prisma.borrowingRequest.create({
      data: {
        userId: student.id,
        bookId: book.id,
        status: "PENDING",
        requestedAt: new Date(),
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverUrl: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Pengajuan peminjaman buku "${book.title}" berhasil diajukan. Menunggu persetujuan Admin perpustakaan.`,
        data: newRequest,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/siswa/borrowings/requests error:", error);
    const statusCode = error.message?.includes("UNAUTHORIZED")
      ? 401
      : error.message?.includes("FORBIDDEN")
      ? 403
      : 500;
    return NextResponse.json(
      { success: false, message: error.message || "Gagal mengajukan peminjaman buku." },
      { status: statusCode }
    );
  }
}
