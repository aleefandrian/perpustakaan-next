import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, verifyPassword, hashPassword } from "@/lib/auth";

export async function PUT(request) {
  try {
    const authUser = await requireAuth();

    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: "Semua kolom password wajib diisi." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password baru minimal 6 karakter." },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "Konfirmasi password baru tidak cocok." },
        { status: 400 }
      );
    }

    // Get current hashed password from db
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { id: true, password: true },
    });

    const isMatch = await verifyPassword(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Password saat ini tidak sesuai." },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: authUser.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      success: true,
      message: "Password berhasil diperbarui dengan aman.",
    });
  } catch (error) {
    console.error("Password update error:", error);
    const status = error.message?.includes("UNAUTHORIZED") ? 401 : 500;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}
