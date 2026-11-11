import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStudent } from "@/lib/auth";
import { calculateBorrowingStatus } from "@/utils/borrowingUtils";

export const instant = false;

/**
 * GET /api/siswa/borrowings
 * Returns list of active borrowings for the logged in student with due dates & dynamic fines.
 */
export async function GET(request) {
  try {
    const student = await requireStudent();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const filter = searchParams.get("filter") || "all"; // "all" | "active" | "overdue"
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));

    const where = {
      userId: student.id,
      status: "ACTIVE",
      ...(search && {
        OR: [
          { book: { title: { contains: search, mode: "insensitive" } } },
          { book: { author: { contains: search, mode: "insensitive" } } },
          { book: { isbn: { contains: search, mode: "insensitive" } } },
        ],
      }),
    };

    const allBorrowings = await prisma.borrowing.findMany({
      where,
      orderBy: { borrowedAt: "desc" },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverUrl: true,
            publisher: true,
            location: true,
            isbn: true,
            category: { select: { id: true, name: true } },
          },
        },
      },
    });

    // Compute dynamic status & fines
    const now = new Date();
    const enrichedBorrowings = allBorrowings.map((item) => {
      const calculation = calculateBorrowingStatus(item.dueDate, now);
      return {
        ...item,
        isOverdue: calculation.isOverdue,
        overdueDays: calculation.overdueDays,
        daysRemaining: calculation.daysRemaining,
        fineAmount: calculation.fineAmount,
        formattedFine: calculation.formattedFine,
        timeStatusLabel: calculation.timeStatusLabel,
        computedStatus: calculation.status,
      };
    });

    // Filter by active / overdue if requested
    let filteredBorrowings = enrichedBorrowings;
    if (filter === "overdue") {
      filteredBorrowings = enrichedBorrowings.filter((b) => b.isOverdue);
    } else if (filter === "on_time") {
      filteredBorrowings = enrichedBorrowings.filter((b) => !b.isOverdue);
    }

    // Pagination
    const total = filteredBorrowings.length;
    const paginated = filteredBorrowings.slice((page - 1) * limit, page * limit);

    // Compute summary statistics across all active borrowings of this student
    const totalActive = enrichedBorrowings.length;
    const overdueCount = enrichedBorrowings.filter((b) => b.isOverdue).length;
    const onTimeCount = totalActive - overdueCount;
    const totalAccumulatedFine = enrichedBorrowings.reduce(
      (sum, b) => sum + b.fineAmount,
      0
    );

    return NextResponse.json({
      success: true,
      data: paginated,
      stats: {
        total: totalActive,
        active: onTimeCount,
        overdue: overdueCount,
        totalFine: totalAccumulatedFine,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error("GET /api/siswa/borrowings error:", error);
    const statusCode = error.message?.includes("UNAUTHORIZED")
      ? 401
      : error.message?.includes("FORBIDDEN")
      ? 403
      : 500;
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memuat data peminjaman." },
      { status: statusCode }
    );
  }
}
