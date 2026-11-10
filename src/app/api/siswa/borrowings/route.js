import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireStudent } from "@/lib/auth";

export const instant = false;

export async function GET() {
  try {
    const student = await requireStudent();

    const [loans, stats] = await Promise.all([
      prisma.loan.findMany({
        where: { userId: student.id },
        orderBy: { borrowDate: "desc" },
        include: {
          book: {
            select: {
              id: true,
              title: true,
              author: true,
              coverUrl: true,
              publisher: true,
              location: true,
              category: { select: { name: true } },
            },
          },
        },
      }),
      Promise.all([
        prisma.loan.count({
          where: { userId: student.id, status: "ACTIVE" },
        }),
        prisma.loan.count({
          where: { userId: student.id, status: "RETURNED" },
        }),
        prisma.loan.count({
          where: { userId: student.id, status: "OVERDUE" },
        }),
      ]),
    ]);

    const [activeLoans, returnedLoans, overdueLoans] = stats;

    return NextResponse.json({
      success: true,
      data: loans,
      stats: {
        total: loans.length,
        active: activeLoans,
        returned: returnedLoans,
        overdue: overdueLoans,
      },
    });
  } catch (error) {
    const status = error.message?.includes("UNAUTHORIZED")
      ? 401
      : error.message?.includes("FORBIDDEN")
      ? 403
      : 500;
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal mengambil data peminjaman siswa.",
      },
      { status }
    );
  }
}
