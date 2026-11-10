import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, hashPassword } from "@/lib/auth";

export async function GET(request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "20", 10));
    const search = searchParams.get("search")?.trim() || "";
    const role = searchParams.get("role")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const className = searchParams.get("class")?.trim() || "";
    const sort = searchParams.get("sort")?.trim() || "name-asc";

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { nisn: { contains: search, mode: "insensitive" } },
        { employeeId: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role && (role === "ADMIN" || role === "SISWA")) {
      where.role = role;
    }

    if (status && (status === "ACTIVE" || status === "INACTIVE")) {
      where.status = status;
    }

    if (className && className !== "all") {
      where.className = className;
    }

    let orderBy = { name: "asc" };
    switch (sort) {
      case "name-desc":
        orderBy = { name: "desc" };
        break;
      case "date-desc":
        orderBy = { createdAt: "desc" };
        break;
      case "date-asc":
        orderBy = { createdAt: "asc" };
        break;
      case "name-asc":
      default:
        orderBy = { name: "asc" };
    }

    const [users, totalFiltered, globalStats] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
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
          _count: {
            select: { loans: true },
          },
        },
      }),
      prisma.user.count({ where }),
      Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: "ADMIN" } }),
        prisma.user.count({ where: { role: "SISWA" } }),
        prisma.user.count({ where: { status: "ACTIVE" } }),
      ]),
    ]);

    const [totalUsers, totalAdmin, totalSiswa, activeUsers] = globalStats;
    const totalPages = Math.ceil(totalFiltered / limit) || 1;

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total: totalFiltered,
        totalPages,
      },
      stats: {
        totalUsers,
        totalAdmin,
        totalSiswa,
        activeUsers,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    const status = error.message?.includes("FORBIDDEN") ? 403 : error.message?.includes("UNAUTHORIZED") ? 401 : 500;
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memuat pengguna." },
      { status }
    );
  }
}

export async function POST(request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const name = body.name?.trim();
    const username = body.username?.trim().toLowerCase();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const role = body.role === "ADMIN" ? "ADMIN" : "SISWA";
    const status = body.status === "INACTIVE" ? "INACTIVE" : "ACTIVE";
    const photo = body.photo?.trim() || null;
    const phone = body.phone?.trim() || null;
    const address = body.address?.trim() || null;
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

    if (!password || password.length < 6) {
      return NextResponse.json({ success: false, message: "Password minimal 6 karakter." }, { status: 400 });
    }

    if (role === "SISWA" && !className) {
      return NextResponse.json({ success: false, message: "Kelas wajib diisi untuk akun siswa." }, { status: 400 });
    }

    // Check unique username
    const existUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email },
          ...(nisn ? [{ nisn }] : []),
          ...(employeeId ? [{ employeeId }] : []),
        ],
      },
    });

    if (existUser) {
      let field = "Username atau email";
      if (existUser.username === username) field = "Username";
      else if (existUser.email === email) field = "Email";
      else if (nisn && existUser.nisn === nisn) field = "NISN";
      else if (employeeId && existUser.employeeId === employeeId) field = "ID Pegawai";

      return NextResponse.json(
        { success: false, message: `${field} sudah digunakan oleh pengguna lain.` },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const created = await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
        photo,
        role,
        status,
        phone,
        address,
        nisn,
        employeeId,
        className,
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
        createdAt: true,
      },
    });

    return NextResponse.json(
      { success: true, message: `Pengguna "${name}" berhasil ditambahkan.`, data: created },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    const status = error.message?.includes("FORBIDDEN") ? 403 : error.message?.includes("UNAUTHORIZED") ? 401 : 500;
    return NextResponse.json(
      { success: false, message: error.message || "Gagal membuat pengguna." },
      { status }
    );
  }
}
