import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, requireAuth } from "@/lib/auth";

export async function GET(request) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "20", 10));
    const search = searchParams.get("search")?.trim() || "";
    const sort = searchParams.get("sort")?.trim() || "name-asc";
    const all = searchParams.get("all") === "true";

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
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

    if (all) {
      const categories = await prisma.category.findMany({
        where,
        orderBy,
        include: {
          _count: { select: { books: true } },
        },
      });
      return NextResponse.json({ success: true, data: categories });
    }

    const [categories, totalFiltered, allStats] = await Promise.all([
      prisma.category.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: {
          _count: { select: { books: true } },
        },
      }),
      prisma.category.count({ where }),
      prisma.category.findMany({
        select: {
          id: true,
          _count: { select: { books: true } },
        },
      }),
    ]);

    const totalCategories = allStats.length;
    const usedCategories = allStats.filter((c) => c._count.books > 0).length;
    const emptyCategories = totalCategories - usedCategories;
    const totalPages = Math.ceil(totalFiltered / limit) || 1;

    return NextResponse.json({
      success: true,
      data: categories,
      pagination: {
        page,
        limit,
        total: totalFiltered,
        totalPages,
      },
      stats: {
        totalCategories,
        usedCategories,
        emptyCategories,
      },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    const status = error.message?.includes("UNAUTHORIZED")
      ? 401
      : error.message?.includes("FORBIDDEN")
      ? 403
      : 500;
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memuat kategori." },
      { status }
    );
  }
}

export async function POST(request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const name = body.name?.trim();
    const description = body.description?.trim() || null;

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Nama kategori wajib diisi." },
        { status: 400 }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        { success: false, message: "Nama kategori maksimal 100 karakter." },
        { status: 400 }
      );
    }

    // Generate unique slug
    let slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    if (!slug) slug = "kategori-" + Date.now();

    // Check unique name
    const existing = await prisma.category.findFirst({
      where: {
        OR: [
          { name: { equals: name, mode: "insensitive" } },
          { slug: slug },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: `Kategori dengan nama "${name}" sudah terdaftar.` },
        { status: 400 }
      );
    }

    const created = await prisma.category.create({
      data: {
        name,
        slug,
        description,
      },
      include: {
        _count: { select: { books: true } },
      },
    });

    return NextResponse.json(
      { success: true, message: "Kategori berhasil ditambahkan.", data: created },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating category:", error);
    const status = error.message?.includes("FORBIDDEN") ? 403 : error.message?.includes("UNAUTHORIZED") ? 401 : 500;
    return NextResponse.json(
      { success: false, message: error.message || "Gagal membuat kategori." },
      { status }
    );
  }
}
