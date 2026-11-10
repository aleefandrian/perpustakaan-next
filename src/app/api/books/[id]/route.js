import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateBookInput } from "@/features/books/schemas/bookSchema";
import { requireAuth, requireAdmin } from "@/lib/auth";

export const instant = false;

export async function GET(request, { params }) {
  try {
    await requireAuth();

    const { id } = await params;
    const bookId = parseInt(id, 10);

    if (isNaN(bookId)) {
      return NextResponse.json(
        { success: false, message: "ID buku tidak valid." },
        { status: 400 }
      );
    }

    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        category: true,
        loans: {
          orderBy: { borrowDate: "desc" },
          take: 10,
        },
      },
    });

    if (!book) {
      return NextResponse.json(
        { success: false, message: "Buku tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: book });
  } catch (error) {
    console.error("Error fetching single book:", error);
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

export async function PUT(request, { params }) {
  try {
    await requireAdmin();

    const { id } = await params;
    const bookId = parseInt(id, 10);

    if (isNaN(bookId)) {
      return NextResponse.json(
        { success: false, message: "ID buku tidak valid." },
        { status: 400 }
      );
    }

    const existingBook = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        loans: {
          where: { status: "ACTIVE" },
        },
      },
    });

    if (!existingBook) {
      return NextResponse.json(
        { success: false, message: "Buku tidak ditemukan." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { isValid, errors } = validateBookInput(body);

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Validasi data gagal.", errors },
        { status: 400 }
      );
    }

    // Do not allow reducing totalStock below active loans
    const activeLoansCount = existingBook.loans.length;
    const newTotalStock = parseInt(body.totalStock, 10);
    if (newTotalStock < activeLoansCount) {
      return NextResponse.json(
        {
          success: false,
          message: `Stok total (${newTotalStock}) tidak boleh lebih kecil dari jumlah peminjaman aktif saat ini (${activeLoansCount} buku sedang dipinjam).`,
        },
        { status: 400 }
      );
    }

    const updated = await prisma.book.update({
      where: { id: bookId },
      data: {
        title: body.title.trim(),
        subtitle: body.subtitle?.trim() || null,
        author: body.author.trim(),
        isbn: body.isbn?.trim() || null,
        publisher: body.publisher?.trim() || "Penerbit Umum",
        publishedYear: body.publishedYear ? parseInt(body.publishedYear, 10) : existingBook.publishedYear,
        description: body.description?.trim() || null,
        genre: body.genre?.trim() || "Umum",
        categoryId: body.categoryId ? parseInt(body.categoryId, 10) : null,
        coverUrl: body.coverUrl.trim(),
        coverId: body.coverId?.trim() || existingBook.coverId,
        totalStock: newTotalStock,
        availableStock: parseInt(body.availableStock, 10),
        location: body.location?.trim() || "Rak A-1",
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Data buku berhasil diperbarui.",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating book:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui buku.", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await requireAdmin();

    const { id } = await params;
    const bookId = parseInt(id, 10);

    if (isNaN(bookId)) {
      return NextResponse.json(
        { success: false, message: "ID buku tidak valid." },
        { status: 400 }
      );
    }

    const existingBook = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        loans: {
          where: {
            OR: [{ status: "ACTIVE" }, { status: "OVERDUE" }],
          },
        },
      },
    });

    if (!existingBook) {
      return NextResponse.json(
        { success: false, message: "Buku tidak ditemukan." },
        { status: 404 }
      );
    }

    // Safety constraint: Prevent deletion if book has active/overdue loans
    if (existingBook.loans.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Buku "${existingBook.title}" tidak dapat dihapus karena masih memiliki ${existingBook.loans.length} transaksi peminjaman aktif atau terlambat. Harap selesaikan pengembalian buku terlebih dahulu.`,
        },
        { status: 400 }
      );
    }

    // First delete any returned historical loans if foreign key restriction applies
    await prisma.loan.deleteMany({
      where: { bookId },
    });

    await prisma.book.delete({
      where: { id: bookId },
    });

    return NextResponse.json({
      success: true,
      message: `Buku "${existingBook.title}" berhasil dihapus dari sistem.`,
    });
  } catch (error) {
    console.error("Error deleting book:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus buku.", error: error.message },
      { status: 500 }
    );
  }
}
