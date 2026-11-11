import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getSession } from "./session";

/**
 * Hash password with bcryptjs
 */
export async function hashPassword(plainText) {
  return await bcrypt.hash(plainText, 10);
}

/**
 * Verify plaintext password against bcrypt hash
 */
export async function verifyPassword(plainText, hashedPassword) {
  if (!plainText || !hashedPassword) return false;
  return await bcrypt.compare(plainText, hashedPassword);
}

/**
 * Authenticate credentials against database
 * Uses identifier (username, email, nisn, or employeeId) and password
 */
export async function authenticate(identifier, password) {
  if (!identifier || !password) {
    throw new Error("Username/email dan password wajib diisi.");
  }

  const trimmed = identifier.trim();

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: trimmed },
        { email: trimmed.toLowerCase() },
        { nisn: trimmed },
        { employeeId: trimmed },
      ],
    },
  });

  // Generic message: do not expose whether user exists
  if (!user) {
    throw new Error("Kredensial login tidak valid.");
  }

  if (user.status !== "ACTIVE") {
    throw new Error(
      "Akun Anda berstatus non-aktif. Silakan hubungi admin perpustakaan."
    );
  }

  const isMatch = await verifyPassword(password, user.password);
  if (!isMatch) {
    throw new Error("Kredensial login tidak valid.");
  }

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Retrieve current authenticated user from session cookie
 * Throws Prisma database errors so they can be handled with 500/503 rather than 401
 */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.userId) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
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
      },
    });

    if (!user || user.status !== "ACTIVE") return null;

    return user;
  } catch (error) {
    console.error("Database error retrieving current user:", error);
    // If it's a Prisma connection error (e.g. P1001), rethrow so caller can distinguish from 401
    if (error?.code?.startsWith?.("P") || error?.name?.includes("Prisma")) {
      throw error;
    }
    return null;
  }
}
