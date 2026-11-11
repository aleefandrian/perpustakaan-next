import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStudent } from "@/lib/auth";

export const instant = false;

/**
 * DELETE /api/siswa/borrowings/requests/[id]
 * Student can safely cancel their own PENDING request.
 */
export async function DELETE(request, { params }) {
  try {
    const student = await requireStudent();
    const resolvedParams = await params;
    const requestId = parseInt(resolvedParams.id, 10);

    if (!requestId || isNaN(requestId)) {
      return NextResponse.json(
        { success: false, message: "ID Pengajuan tidak valid." },
        { status: 400 }
      );
    }

    const borrowingRequest = await prisma.borrowingRequest.findUnique({
      where: { id: requestId },
      include: { book: { select: { title: true } } },
    });

    if (!borrowingRequest) {
      return NextResponse.json(
        { success: false, message: "Pengajuan peminjaman tidak ditemukan." },
        { status: 404 }
      );
    }

    if (borrowingRequest.userId !== student.id) {
      return NextResponse.json(
        { success: false, message: "Anda tidak memiliki akses untuk membatalkan pengajuan ini." },
        { status: 403 }
      );
    }

    if (borrowingRequest.status !== "PENDING") {
      return NextResponse.json(
        {
          success: false,
          message: `Pengajuan tidak dapat dibatalkan karena sudah ${
            borrowingRequest.status === "APPROVED" ? "disetujui" : "ditolak"
          }.`,
        },
        { status: 400 }
      );
    }

    await prisma.borrowingRequest.delete({
      where: { id: requestId },
    });

    return NextResponse.json({
      success: true,
      message: `Pengajuan peminjaman buku "${borrowingRequest.book.title}" berhasil dibatalkan.`,
    });
  } catch (error) {
    console.error("DELETE /api/siswa/borrowings/requests/[id] error:", error);
    const statusCode = error.message?.includes("UNAUTHORIZED")
      ? 401
      : error.message?.includes("FORBIDDEN")
      ? 403
      : 500;
    return NextResponse.json(
      { success: false, message: error.message || "Gagal membatalkan pengajuan." },
      { status: statusCode }
    );
  }
}
