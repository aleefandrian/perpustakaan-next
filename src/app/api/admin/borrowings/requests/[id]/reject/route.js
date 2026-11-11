import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const instant = false;

/**
 * PATCH /api/admin/borrowings/requests/[id]/reject
 * Rejects a pending borrowing request with a mandatory reason.
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

    const body = await request.json().catch(() => ({}));
    const reason = body.reason?.trim();

    if (!reason) {
      return NextResponse.json(
        { success: false, message: "Alasan penolakan permohonan wajib diisi." },
        { status: 400 }
      );
    }

    const borrowReq = await prisma.borrowingRequest.findUnique({
      where: { id: requestId },
      include: {
        user: { select: { id: true, name: true } },
        book: { select: { id: true, title: true } },
      },
    });

    if (!borrowReq) {
      return NextResponse.json(
        { success: false, message: "Permohonan peminjaman tidak ditemukan." },
        { status: 404 }
      );
    }

    if (borrowReq.status !== "PENDING") {
      return NextResponse.json(
        {
          success: false,
          message: `Permohonan sudah diproses sebelumnya dengan status ${borrowReq.status}.`,
        },
        { status: 409 }
      );
    }

    const updated = await prisma.borrowingRequest.update({
      where: { id: requestId },
      data: {
        status: "REJECTED",
        rejectedAt: new Date(),
        rejectionReason: reason,
      },
      include: {
        user: { select: { id: true, name: true, nisn: true } },
        book: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Permohonan peminjaman buku "${updated.book.title}" oleh ${updated.user.name} berhasil ditolak.`,
      data: updated,
    });
  } catch (error) {
    console.error("PATCH /api/admin/borrowings/requests/[id]/reject error:", error);
    const statusCode = error.message?.includes("UNAUTHORIZED")
      ? 401
      : error.message?.includes("FORBIDDEN")
      ? 403
      : 500;
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menolak permohonan peminjaman." },
      { status: statusCode }
    );
  }
}
