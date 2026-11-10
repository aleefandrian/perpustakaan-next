import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const authUser = await requireAuth();

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        photo: true,
        role: true,
        nisn: true,
        employeeId: true,
        className: true,
        phone: true,
        address: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        loans: {
          take: 5,
          orderBy: { borrowDate: "desc" },
          include: {
            book: {
              select: { id: true, title: true, coverUrl: true, author: true },
            },
          },
        },
        _count: {
          select: { loans: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "Pengguna tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    const status = error.message?.includes("UNAUTHORIZED") ? 401 : 500;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}

export async function PUT(request) {
  try {
    const authUser = await requireAuth();

    const body = await request.json();
    const name = body.name?.trim();
    const username = body.username?.trim().toLowerCase();
    const email = body.email?.trim().toLowerCase();
    const phone = body.phone !== undefined ? body.phone?.trim() || null : authUser.phone;
    const address = body.address !== undefined ? body.address?.trim() || null : authUser.address;
    const photo = body.photo !== undefined ? body.photo?.trim() || null : authUser.photo;

    if (!name) {
      return NextResponse.json({ success: false, message: "Nama lengkap wajib diisi." }, { status: 400 });
    }

    if (!username || username.length < 3) {
      return NextResponse.json({ success: false, message: "Username minimal 3 karakter." }, { status: 400 });
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json({ success: false, message: "Alamat email tidak valid." }, { status: 400 });
    }

    // Check unique username & email excluding self
    const duplicate = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
        NOT: { id: authUser.id },
      },
    });

    if (duplicate) {
      const field = duplicate.username === username ? "Username" : "Email";
      return NextResponse.json(
        { success: false, message: `${field} sudah digunakan oleh akun lain.` },
        { status: 400 }
      );
    }

    // Notice: Role, NISN, employeeId, and Status cannot be modified by user via profile endpoint!
    const updated = await prisma.user.update({
      where: { id: authUser.id },
      data: {
        name,
        username,
        email,
        phone,
        address,
        photo,
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        photo: true,
        role: true,
        nisn: true,
        employeeId: true,
        className: true,
        phone: true,
        address: true,
        status: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profil Anda berhasil diperbarui.",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    const status = error.message?.includes("UNAUTHORIZED") ? 401 : 500;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}
