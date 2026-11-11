import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const instant = false;

/**
 * GET /api/admin/borrowings/requests
 * Fetch all borrowing requests with filters, search, pagination, and statistics.
 */
export async function GET(request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || "all";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "20", 10));
    const skip = (page - 1) * limit;

    const where = {
      ...(status !== "all" && { status }),
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

    const [requests, total, stats] = await Promise.all([
      prisma.borrowingRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { requestedAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
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
              availableStock: true,
              totalStock: true,
              location: true,
              category: { select: { id: true, name: true } },
            },
          },
          borrowing: {
            select: {
              id: true,
              borrowedAt: true,
              dueDate: true,
              status: true,
            },
          },
        },
      }),
      prisma.borrowingRequest.count({ where }),
      Promise.all([
        prisma.borrowingRequest.count(),
        prisma.borrowingRequest.count({ where: { status: "PENDING" } }),
        prisma.borrowingRequest.count({ where: { status: "APPROVED" } }),
        prisma.borrowingRequest.count({ where: { status: "REJECTED" } }),
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
    console.error("GET /api/admin/borrowings/requests error:", error);
    const statusCode = error.message?.includes("UNAUTHORIZED")
      ? 401
      : error.message?.includes("FORBIDDEN")
      ? 403
      : 500;
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memuat daftar permohonan peminjaman." },
      { status: statusCode }
    );
  }
}
