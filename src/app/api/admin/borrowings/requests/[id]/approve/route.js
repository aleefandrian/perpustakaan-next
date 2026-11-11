import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { addCalendarMonth } from "@/utils/borrowingUtils";

export const instant = false;

/**
 * PATCH /api/admin/borrowings/requests/[id]/approve
 * Atomically approves a pending borrowing request, decrements stock, and creates an active borrowing.
 */
export async function PATCH(request, { params }) {
  try {
    await requireAdmin();
    const resolvedParams = await params;
    const requestId = parseInt(resolvedParams.id, 10);

    if (!requestId || isNaN(requestId)) {
      return NextResponse.json(
        { success: false, message: "ID Permohonan tidak valid." },
        { status: 400 }
      );
    }

    const approvedAt = new Date();
    const borrowedAt = approvedAt; // <--- Tambahkan ini
    const dueDate = addCalendarMonth(approvedAt, 1);
    // Atomic transaction for concurrency safety & stock integrity
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch borrowing request
      const borrowReq = await tx.borrowingRequest.findUnique({
        where: { id: requestId },
        include: {
          user: { select: { id: true, name: true, nisn: true } },
          book: { select: { id: true, title: true, availableStock: true } },
        },
      });

      if (!borrowReq) {
        throw new Error("NOT_FOUND: Permohonan peminjaman tidak ditemukan.");
      }

      if (borrowReq.status !== "PENDING") {
        throw new Error(
          `CONFLICT: Permohonan ini sudah diproses sebelumnya dengan status ${borrowReq.status}.`
        );
      }

      // 2. Recheck available stock atomically
      const currentBook = await tx.book.findUnique({
        where: { id: borrowReq.bookId },
        select: { id: true, title: true, availableStock: true },
      });

      if (!currentBook || currentBook.availableStock <= 0) {
        throw new Error(
          `OUT_OF_STOCK: Stok buku "${currentBook?.title || "Buku"}" saat ini habis (0 eksemplar). Permohonan tidak dapat disetujui.`
        );
      }

      // 3. Verify student does not already have an active borrowing for this book
      const existingActive = await tx.borrowing.findFirst({
        where: {
          userId: borrowReq.userId,
          bookId: borrowReq.bookId,
          status: "ACTIVE",
        },
      });

      if (existingActive) {
        throw new Error(
          `DUPLICATE: Siswa ${borrowReq.user.name} saat ini masih meminjam buku "${currentBook.title}".`
        );
      }

      // 4. Decrement available stock
      await tx.book.update({
        where: { id: borrowReq.bookId },
        data: {
          availableStock: { decrement: 1 },
        },
      });

      // 5. Create Borrowing record
      const borrowing = await tx.borrowing.create({
        data: {
          userId: borrowReq.userId,
          bookId: borrowReq.bookId,
          requestId: borrowReq.id,
          borrowedAt: approvedAt,
          dueDate,
          status: "ACTIVE",
        },
      });

      // 6. Update request status to APPROVED
      const updatedRequest = await tx.borrowingRequest.update({
        where: { id: borrowReq.id },
        data: {
          status: "APPROVED",
          approvedAt,
        },
        include: {
          user: { select: { id: true, name: true, nisn: true, className: true } },
          book: { select: { id: true, title: true, availableStock: true } },
        },
      });

      return { updatedRequest, borrowing };
    });

    return NextResponse.json({
      success: true,
      message: `Permohonan peminjaman buku "${result.updatedRequest.book.title}" oleh siswa ${result.updatedRequest.user.name} berhasil disetujui. Batas pengembalian: ${dueDate.toLocaleDateString("id-ID")}.`,
      data: result,
    });
  } catch (error) {
    console.error("PATCH /api/admin/borrowings/requests/[id]/approve error:", error);

    let status = 500;
    let message = error.message || "Gagal menyetujui permohonan peminjaman.";

    if (error.message?.includes("UNAUTHORIZED")) {
      status = 401;
    } else if (error.message?.includes("FORBIDDEN")) {
      status = 403;
    } else if (error.message?.includes("NOT_FOUND")) {
      status = 404;
      message = error.message.replace("NOT_FOUND: ", "");
    } else if (error.message?.includes("CONFLICT")) {
      status = 409;
      message = error.message.replace("CONFLICT: ", "");
    } else if (error.message?.includes("OUT_OF_STOCK") || error.message?.includes("DUPLICATE")) {
      status = 400;
      message = error.message.replace(/^[A-Z_]+: /, "");
    }

    return NextResponse.json({ success: false, message }, { status });
  }
}
