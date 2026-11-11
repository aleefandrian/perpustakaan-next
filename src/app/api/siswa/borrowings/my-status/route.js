import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStudent } from "@/lib/auth";

export const instant = false;

/**
 * GET /api/siswa/borrowings/my-status
 * Returns lists of bookIds currently pending or actively borrowed by this student.
 */
export async function GET() {
  try {
    const student = await requireStudent();

    const [pendingRequests, activeBorrowings] = await Promise.all([
      prisma.borrowingRequest.findMany({
        where: { userId: student.id, status: "PENDING" },
        select: { bookId: true },
      }),
      prisma.borrowing.findMany({
        where: { userId: student.id, status: "ACTIVE" },
        select: { bookId: true },
      }),
    ]);

    const pendingBookIds = pendingRequests.map((r) => r.bookId);
    const activeBookIds = activeBorrowings.map((b) => b.bookId);

    return NextResponse.json({
      success: true,
      pendingBookIds,
      activeBookIds,
    });
  } catch (error) {
    console.error("GET /api/siswa/borrowings/my-status error:", error);
    const statusCode = error.message?.includes("UNAUTHORIZED")
      ? 401
      : error.message?.includes("FORBIDDEN")
      ? 403
      : 500;
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memuat status buku." },
      { status: statusCode }
    );
  }
}
