import { getCurrentUser } from "./auth";
import { ROLES, isAdmin } from "./permissions";

/**
 * Assert user is authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user || user.status !== "ACTIVE") {
    throw new Error("UNAUTHORIZED: Harap login terlebih dahulu.");
  }
  return user;
}

/**
 * Assert user has a specific role
 */
export async function requireRole(role) {
  const user = await requireAuth();
  if (user.role !== role) {
    throw new Error(`FORBIDDEN: Akses ditolak untuk role ${user.role}.`);
  }
  return user;
}

/**
 * Assert user has ADMIN role
 */
export async function requireAdmin() {
  const user = await requireAuth();
  if (!isAdmin(user)) {
    throw new Error(
      "FORBIDDEN: Hanya Administrator yang berhak mengakses fitur ini."
    );
  }
  return user;
}

/**
 * Assert user has SISWA role
 */
export async function requireStudent() {
  const user = await requireAuth();
  if (user.role !== ROLES.SISWA) {
    throw new Error("FORBIDDEN: Hanya Siswa yang berhak mengakses fitur ini.");
  }
  return user;
}

/**
 * Guard to prevent students from accessing or modifying another student's data
 */
export async function assertCanAccessUser(targetUserId) {
  const user = await requireAuth();
  if (isAdmin(user)) return user;

  const numericTargetId = parseInt(targetUserId, 10);
  if (user.id !== numericTargetId) {
    throw new Error(
      "FORBIDDEN: Anda tidak memiliki izin untuk mengakses data pengguna lain."
    );
  }
  return user;
}
