export const ROLES = {
  ADMIN: "ADMIN",
  SISWA: "SISWA",
};

/**
 * Route prefixes designated strictly for ADMIN
 */
export const ADMIN_ONLY_ROUTES = [
  "/admin",
  "/books",
  "/categories",
  "/users",
  "/loans",
  "/borrowings",
  "/return",
  "/returns",
  "/profile",
];

/**
 * Route prefixes designated strictly for SISWA
 */
export const STUDENT_ONLY_ROUTES = ["/siswa"];

/**
 * Public routes that do not require authentication
 */
export const PUBLIC_ROUTES = [
  "/login",
  "/logout",
  "/api/auth/login",
  "/api/auth/logout",
];

export function isAdmin(userOrRole) {
  const role = typeof userOrRole === "string" ? userOrRole : userOrRole?.role;
  return role === ROLES.ADMIN;
}

export function isStudent(userOrRole) {
  const role = typeof userOrRole === "string" ? userOrRole : userOrRole?.role;
  return role === ROLES.SISWA;
}

export function getDefaultDashboard(role) {
  if (role === ROLES.ADMIN) {
    return "/";
  }
  return "/siswa/dashboard";
}

/**
 * Validate whether a role is authorized to visit a specific pathname
 */
export function canAccessRoute(role, pathname) {
  if (!role) return false;

  // Root path "/" is the Admin Dashboard in this system
  if (pathname === "/" || pathname === "/dashboard") {
    return role === ROLES.ADMIN;
  }

  // Admin routes
  const isAdminRoute = ADMIN_ONLY_ROUTES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  if (isAdminRoute) {
    return role === ROLES.ADMIN;
  }

  // Student routes
  const isStudentRoute = STUDENT_ONLY_ROUTES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  if (isStudentRoute) {
    return role === ROLES.SISWA;
  }

  // Any other route: default to admin permission
  return role === ROLES.ADMIN;
}

/**
 * Sanitize callback URL to prevent Open Redirect vulnerabilities
 * and prevent cross-role destination mismatches.
 */
export function sanitizeCallbackUrl(callbackUrl, role) {
  if (!callbackUrl || typeof callbackUrl !== "string") {
    return getDefaultDashboard(role);
  }

  // Reject external or malformed URLs (must start with / and not //)
  if (!callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) {
    return getDefaultDashboard(role);
  }

  // Check against permitted route for the role
  const pathWithoutQuery = callbackUrl.split("?")[0];
  if (!canAccessRoute(role, pathWithoutQuery)) {
    return getDefaultDashboard(role);
  }

  return callbackUrl;
}
