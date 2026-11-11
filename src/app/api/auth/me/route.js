import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const instant = false;

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Belum terautentikasi." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("GET /api/auth/me error:", error);
    const isDbError = error?.code?.startsWith?.("P") || error?.name?.includes("Prisma");
    return NextResponse.json(
      {
        success: false,
        message: isDbError
          ? "Gagal terhubung ke database server. Pastikan database aktif."
          : (error.message || "Terjadi kesalahan server."),
      },
      { status: isDbError ? 503 : 500 }
    );
  }
}
