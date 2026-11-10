import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, hashPassword } from "@/lib/auth";

export const instant = false;

export async function GET(request, { params }) {
  try {
    await requireAdmin();

    const { id } = await params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return NextResponse.json({ success: false, message: "ID pengguna tidak valid." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
          include: { book: { select: { id: true, title: true } } },
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
    const status = error.message?.includes("FORBIDDEN") ? 403 : error.message?.includes("UNAUTHORIZED") ? 401 : 500;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}

export async function PUT(request, { params }) {
  try {
    const admin = await requireAdmin();

    const { id } = await params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return NextResponse.json({ success: false, message: "ID pengguna tidak valid." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ success: false, message: "Pengguna tidak ditemukan." }, { status: 404 });
    }

    const body = await request.json();
    const name = body.name?.trim();
    const username = body.username?.trim().toLowerCase();
    const email = body.email?.trim().toLowerCase();
    const role = body.role === "ADMIN" ? "ADMIN" : "SISWA";
    const status = body.status === "INACTIVE" ? "INACTIVE" : "ACTIVE";
    const photo = body.photo !== undefined ? body.photo?.trim() || null : existingUser.photo;
    const phone = body.phone !== undefined ? body.phone?.trim() || null : existingUser.phone;
    const address = body.address !== undefined ? body.address?.trim() || null : existingUser.address;
    const nisn = role === "SISWA" && body.nisn ? body.nisn.trim() : null;
    const employeeId = role === "ADMIN" && body.employeeId ? body.employeeId.trim() : null;
    const className = role === "SISWA" && body.className ? body.className.trim() : null;

    if (!name) {
      return NextResponse.json({ success: false, message: "Nama lengkap wajib diisi." }, { status: 400 });
    }

    if (!username || username.length < 3) {
      return NextResponse.json({ success: false, message: "Username minimal 3 karakter." }, { status: 400 });
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json({ success: false, message: "Alamat email tidak valid." }, { status: 400 });
    }

    // Safety: Prevent admin from deactivating or demoting the last active ADMIN
    if (existingUser.role === "ADMIN" && (role !== "ADMIN" || status !== "ACTIVE")) {
      const activeAdminCount = await prisma.user.count({
        where: { role: "ADMIN", status: "ACTIVE" },
      });
      if (activeAdminCount <= 1) {
        return NextResponse.json(
          { success: false, message: "Tidak dapat mengubah role atau menonaktifkan satu-satunya akun Administrator aktif." },
          { status: 400 }
        );
      }
    }

    // Check unique conflicts
    const duplicate = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email },
          ...(nisn ? [{ nisn }] : []),
          ...(employeeId ? [{ employeeId }] : []),
        ],
        NOT: { id: userId },
      },
    });

    if (duplicate) {
      let field = "Username atau email";
      if (duplicate.username === username) field = "Username";
      else if (duplicate.email === email) field = "Email";
      else if (nisn && duplicate.nisn === nisn) field = "NISN";
      else if (employeeId && duplicate.employeeId === employeeId) field = "ID Pegawai";

      return NextResponse.json(
        { success: false, message: `${field} sudah digunakan oleh pengguna lain.` },
        { status: 400 }
      );
    }

    const updateData = {
      name,
      username,
      email,
      role,
      status,
      photo,
      phone,
      address,
      nisn,
      employeeId,
      className,
    };

    // If new password provided, hash it. Otherwise retain existing.
    if (body.password && body.password.trim().length >= 6) {
      updateData.password = await hashPassword(body.password.trim());
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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
      message: `Data pengguna "${name}" berhasil diperbarui.`,
      data: updated,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    const status = error.message?.includes("FORBIDDEN") ? 403 : error.message?.includes("UNAUTHORIZED") ? 401 : 500;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}

export async function DELETE(request, { params }) {
  try {
    const currentAdmin = await requireAdmin();

    const { id } = await params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return NextResponse.json({ success: false, message: "ID pengguna tidak valid." }, { status: 400 });
    }

    // Prevent deleting self
    if (currentAdmin.id === userId) {
      return NextResponse.json(
        { success: false, message: "Anda tidak dapat menghapus akun Anda sendiri saat sedang login." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        loans: {
          where: {
            OR: [{ status: "ACTIVE" }, { status: "OVERDUE" }],
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

    // Active loans restriction
    if (user.loans.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Pengguna "${user.name}" tidak dapat dihapus karena masih memiliki ${user.loans.length} peminjaman buku aktif/terlambat. Harap selesaikan pengembalian buku terlebih dahulu.`,
        },
        { status: 400 }
      );
    }

    // If historical returned loans exist, soft delete/deactivate to preserve audit trail
    if (user._count.loans > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: { status: "INACTIVE" },
      });
      return NextResponse.json({
        success: true,
        message: `Pengguna "${user.name}" memiliki riwayat peminjaman arsip, sehingga status akun dinonaktifkan (Soft Delete) untuk menjaga integritas data riwayat.`,
      });
    }

    // No historical loans -> safe permanent delete
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      message: `Pengguna "${user.name}" berhasil dihapus dari sistem.`,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    const status = error.message?.includes("FORBIDDEN") ? 403 : error.message?.includes("UNAUTHORIZED") ? 401 : 500;
    return NextResponse.json({ success: false, message: error.message }, { status });
  }
}
