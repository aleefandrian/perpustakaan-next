import { NextResponse } from "next/server";
import { verifyToken, SESSION_COOKIE_NAME } from "./lib/auth/session";
import {
  canAccessRoute,
  getDefaultDashboard,
  sanitizeCallbackUrl,
  ROLES,
  PUBLIC_ROUTES,
} from "./lib/auth/permissions";

export function proxy(request) {
  const { pathname, search } = request.nextUrl;

  // 1. Fast bypass for Next.js internal assets, static files, and icons
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Read and verify session cookie
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? verifyToken(token) : null;
  const isAuthenticated = Boolean(
    session && (session.role === ROLES.ADMIN || session.role === ROLES.SISWA)
  );
  const userRole = session?.role;

  // 3. Handle Login page (/login)
  if (pathname === "/login") {
    if (isAuthenticated) {
      const callbackParam = request.nextUrl.searchParams.get("callbackUrl");
      const targetUrl = sanitizeCallbackUrl(callbackParam, userRole);
      return NextResponse.redirect(new URL(targetUrl, request.url));
    }
    return NextResponse.next();
  }

  // 4. Handle Logout page (/logout)
  if (pathname === "/logout") {
    return NextResponse.next();
  }

  // 5. Handle API Routes (/api/*)
  if (pathname.startsWith("/api")) {
    // Public API endpoints
    if (
      pathname.startsWith("/api/auth/login") ||
      pathname.startsWith("/api/auth/logout")
    ) {
      return NextResponse.next();
    }

    // All other APIs require authentication
    if (!isAuthenticated) {
      return NextResponse.json(
        { success: false, message: "UNAUTHORIZED: Harap login terlebih dahulu." },
        { status: 401 }
      );
    }

    // Administrative APIs (Categories, Users, Book modifications, Admin Borrowings)
    const isCategoryApi = pathname.startsWith("/api/categories");
    const isUserApi = pathname.startsWith("/api/users");
    const isAdminApi = pathname.startsWith("/api/admin");
    const isBookMutationApi =
      pathname.startsWith("/api/books") &&
      ["POST", "PUT", "DELETE", "PATCH"].includes(request.method);

    if (isCategoryApi || isUserApi || isAdminApi || isBookMutationApi) {
      if (userRole !== ROLES.ADMIN) {
        return NextResponse.json(
          {
            success: false,
            message:
              "FORBIDDEN: Hanya Administrator yang berhak mengakses API ini.",
          },
          { status: 403 }
        );
      }
    }

    // Student-specific APIs (/api/siswa/*)
    if (pathname.startsWith("/api/siswa")) {
      if (userRole !== ROLES.SISWA) {
        return NextResponse.json(
          {
            success: false,
            message: "FORBIDDEN: API ini hanya dapat diakses oleh Siswa.",
          },
          { status: 403 }
        );
      }
    }

    return NextResponse.next();
  }

  // 6. Handle Route Aliases for Admin
  if (pathname === "/admin/dashboard") {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login?callbackUrl=/", request.url));
    }
    if (userRole === ROLES.SISWA) {
      return NextResponse.redirect(new URL("/siswa/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname === "/loans") {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login?callbackUrl=/borrowings", request.url));
    }
    if (userRole === ROLES.SISWA) {
      return NextResponse.redirect(new URL("/siswa/peminjaman", request.url));
    }
    return NextResponse.redirect(new URL("/borrowings", request.url));
  }

  if (pathname === "/returns") {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login?callbackUrl=/return", request.url));
    }
    if (userRole === ROLES.SISWA) {
      return NextResponse.redirect(new URL("/siswa/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/return", request.url));
  }

  // 7. Route Protection for Frontend Pages
  if (!isAuthenticated) {
    const callbackUrl = encodeURIComponent(`${pathname}${search}`);
    const loginUrl = new URL(`/login?callbackUrl=${callbackUrl}`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 8. Cross-role prevention
  // If ADMIN attempts to access student-only route (/siswa/*) -> redirect to Admin Dashboard ("/")
  if (userRole === ROLES.ADMIN && pathname.startsWith("/siswa")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If SISWA attempts to access admin route -> redirect to Student Dashboard ("/siswa/dashboard")
  if (userRole === ROLES.SISWA) {
    const isStudentRoute = pathname.startsWith("/siswa");
    if (!isStudentRoute) {
      return NextResponse.redirect(new URL("/siswa/dashboard", request.url));
    }
  }

  // 9. Permitted request
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public asset extensions (.svg, .png, .jpg, .jpeg, .gif, .webp, .ico)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
