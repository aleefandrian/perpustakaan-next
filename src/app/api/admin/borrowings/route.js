import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { calculateBorrowingStatus } from "@/utils/borrowingUtils";

export const instant = false;

/**
 * GET /api/admin/borrowings
 * Returns all active borrowings with dynamic status, overdue days, fines, stats, and filters.
 */
export async function GET(request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const filter = searchParams.get("filter") || "all"; // "all" | "active" | "overdue"
    const sort = searchParams.get("sort") || "latest"; // "latest" | "earliest" | "nearest_due" | "most_overdue" | "highest_fine"
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "20", 10));

    const where = {
      status: "ACTIVE",
      ...(search && {
        OR: [
          { user: { name: { contains: search, mode: "insensitive" } } },
          { user: { nisn: { contains: search, mode: "insensitive" } } },
          { user: { username: { contains: search, mode: "insensitive" } } },
          { user: { className: { contains: search, mode: "insensitive" } } },
          { book: { title: { contains: search, mode: "insensitive" } } },
          { book: { isbn: { contains: search, mode: "insensitive" } } },
        ],
      }),
    };

    const allRecords = await prisma.borrowing.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            nisn: true,
            className: true,
            photo: true,
            phone: true,
          },
        },
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            isbn: true,
            coverUrl: true,
            location: true,
            category: { select: { id: true, name: true } },
          },
        },
      },
    });

    const now = new Date();
    const enriched = allRecords.map((item) => {
      const calc = calculateBorrowingStatus(item.dueDate, now);
      return {
        ...item,
        isOverdue: calc.isOverdue,
        overdueDays: calc.overdueDays,
        daysRemaining: calc.daysRemaining,
        fineAmount: calc.fineAmount,
        formattedFine: calc.formattedFine,
        timeStatusLabel: calc.timeStatusLabel,
        computedStatus: calc.status,
      };
    });

    // Filter
    let filtered = enriched;
    if (filter === "overdue") {
      filtered = enriched.filter((b) => b.isOverdue);
    } else if (filter === "active" || filter === "on_time") {
      filtered = enriched.filter((b) => !b.isOverdue);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sort === "earliest") {
        return new Date(a.borrowedAt).getTime() - new Date(b.borrowedAt).getTime();
      }
      if (sort === "nearest_due") {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sort === "most_overdue") {
        return b.overdueDays - a.overdueDays;
      }
      if (sort === "highest_fine") {
        return b.fineAmount - a.fineAmount;
      }
      // default: latest
      return new Date(b.borrowedAt).getTime() - new Date(a.borrowedAt).getTime();
    });

    // Pagination
    const total = filtered.length;
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    // Global stats across all active borrowings (unfiltered by search/filter so dashboard stats are accurate)
    // To calculate global active borrowings stats:
    const allActiveForStats = await prisma.borrowing.findMany({
      where: { status: "ACTIVE" },
      select: { dueDate: true },
    });

    let totalOverdue = 0;
    let totalFine = 0;
    allActiveForStats.forEach((loan) => {
      const c = calculateBorrowingStatus(loan.dueDate, now);
      if (c.isOverdue) {
        totalOverdue += 1;
        totalFine += c.fineAmount;
      }
    });
    const totalActiveCount = allActiveForStats.length;
    const totalOnTime = totalActiveCount - totalOverdue;

    return NextResponse.json({
      success: true,
      data: paginated,
      stats: {
        totalActive: totalActiveCount,
        onTime: totalOnTime,
        overdue: totalOverdue,
        totalFine,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/borrowings error:", error);
    const statusCode = error.message?.includes("UNAUTHORIZED")
      ? 401
      : error.message?.includes("FORBIDDEN")
      ? 403
      : 500;
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memuat data peminjaman perpustakaan." },
      { status: statusCode }
    );
  }
}
