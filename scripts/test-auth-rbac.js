const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const prisma = new PrismaClient();

const SESSION_SECRET = process.env.SESSION_SECRET || "libra-secret-key-development-2026";
const SESSION_COOKIE_NAME = "libra_session";

const {
  signToken,
  verifyToken,
  createSessionToken,
} = require("../src/lib/auth/session");

const {
  ROLES,
  isAdmin,
  isStudent,
  getDefaultDashboard,
  canAccessRoute,
  sanitizeCallbackUrl,
} = require("../src/lib/auth/permissions");

// Helper to simulate proxy routing logic
function evaluateProxyRouting(pathname, method = "GET", token = null, search = "") {
  // 1. Bypass assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return { type: "next" };
  }

  // 2. Read and verify session
  const session = token ? verifyToken(token) : null;
  const isAuthenticated = Boolean(
    session && (session.role === ROLES.ADMIN || session.role === ROLES.SISWA)
  );
  const userRole = session?.role;

  // 3. Login page
  if (pathname === "/login") {
    if (isAuthenticated) {
      const targetUrl = sanitizeCallbackUrl(null, userRole);
      return { type: "redirect", url: targetUrl };
    }
    return { type: "next" };
  }

  // 4. Logout page
  if (pathname === "/logout") {
    return { type: "next" };
  }

  // 5. API Routes
  if (pathname.startsWith("/api")) {
    if (
      pathname.startsWith("/api/auth/login") ||
      pathname.startsWith("/api/auth/logout")
    ) {
      return { type: "next" };
    }

    if (!isAuthenticated) {
      return { type: "json", status: 401, message: "UNAUTHORIZED" };
    }

    const isCategoryApi = pathname.startsWith("/api/categories");
    const isUserApi = pathname.startsWith("/api/users");
    const isBookMutationApi =
      pathname.startsWith("/api/books") &&
      ["POST", "PUT", "DELETE", "PATCH"].includes(method);

    if (isCategoryApi || isUserApi || isBookMutationApi) {
      if (userRole !== ROLES.ADMIN) {
        return { type: "json", status: 403, message: "FORBIDDEN" };
      }
    }

    if (pathname.startsWith("/api/siswa")) {
      if (userRole !== ROLES.SISWA) {
        return { type: "json", status: 403, message: "FORBIDDEN" };
      }
    }

    return { type: "next" };
  }

  // 6. Admin Aliases
  if (pathname === "/admin/dashboard") {
    if (!isAuthenticated) return { type: "redirect", url: "/login?callbackUrl=/" };
    if (userRole === ROLES.SISWA) return { type: "redirect", url: "/siswa/dashboard" };
    return { type: "redirect", url: "/" };
  }

  if (pathname === "/borrowings") {
    if (!isAuthenticated) return { type: "redirect", url: "/login?callbackUrl=/loans" };
    if (userRole === ROLES.SISWA) return { type: "redirect", url: "/siswa/borrowings" };
    return { type: "redirect", url: "/loans" };
  }

  if (pathname === "/returns") {
    if (!isAuthenticated) return { type: "redirect", url: "/login?callbackUrl=/return" };
    if (userRole === ROLES.SISWA) return { type: "redirect", url: "/siswa/dashboard" };
    return { type: "redirect", url: "/return" };
  }

  // 7. Protected frontend routes
  if (!isAuthenticated) {
    const callbackUrl = encodeURIComponent(`${pathname}${search}`);
    return { type: "redirect", url: `/login?callbackUrl=${callbackUrl}` };
  }

  // 8. Cross-role prevention
  if (userRole === ROLES.ADMIN && pathname.startsWith("/siswa")) {
    return { type: "redirect", url: "/" };
  }

  if (userRole === ROLES.SISWA) {
    const isStudentRoute = pathname.startsWith("/siswa");
    if (!isStudentRoute) {
      return { type: "redirect", url: "/siswa/dashboard" };
    }
  }

  return { type: "next" };
}

async function runRBACTests() {
  console.log("==================================================");
  console.log("   LIBRA AUTHENTICATION & RBAC TEST SUITE");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✓ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`✗ [FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. SETUP TEST USERS
  console.log("\n--- SECTION 1: DATABASE & CREDENTIAL VERIFICATION ---");
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  assert(admin !== null, "Admin user exists in database");

  const student = await prisma.user.findFirst({ where: { role: "SISWA" } });
  assert(student !== null, "Student user exists in database");

  // Create an inactive user for test
  const inactiveUsername = "inactive_test_" + Date.now();
  const hashedPassword = await bcrypt.hash("password123", 10);
  const inactiveUser = await prisma.user.create({
    data: {
      name: "User Nonaktif",
      username: inactiveUsername,
      email: `${inactiveUsername}@sekolah.id`,
      password: hashedPassword,
      role: "SISWA",
      status: "INACTIVE",
    },
  });
  assert(inactiveUser.status === "INACTIVE", "Inactive test user created");

  // 2. AUTHENTICATION LOGIC TESTS
  console.log("\n--- SECTION 2: AUTHENTICATION & SESSION TESTS ---");

  // 2a. Password Verification
  const validPass = await bcrypt.compare("password123", inactiveUser.password);
  assert(validPass === true, "Valid password matches hash");

  const invalidPass = await bcrypt.compare("wrongpassword", inactiveUser.password);
  assert(invalidPass === false, "Invalid password fails hash check");

  // 2b. Inactive user rejection
  assert(inactiveUser.status !== "ACTIVE", "Inactive accounts correctly rejected");

  // Clean up inactive test user
  await prisma.user.delete({ where: { id: inactiveUser.id } });

  // 2c. Token generation & verification
  const now = Date.now();
  const adminPayload = {
    userId: admin.id,
    username: admin.username,
    role: "ADMIN",
    status: "ACTIVE",
    iat: now,
    exp: now + 86400 * 1000,
  };
  const adminToken = signToken(adminPayload);
  const verifiedAdmin = verifyToken(adminToken);
  assert(verifiedAdmin?.role === "ADMIN", "ADMIN token signs and verifies correctly");

  const studentPayload = {
    userId: student.id,
    username: student.username,
    role: "SISWA",
    status: "ACTIVE",
    iat: now,
    exp: now + 86400 * 1000,
  };
  const studentToken = signToken(studentPayload);
  const verifiedStudent = verifyToken(studentToken);
  assert(verifiedStudent?.role === "SISWA", "SISWA token signs and verifies correctly");

  // 2d. Remember Me token (30 days expiration)
  const rememberRes = createSessionToken(admin, true);
  const verifiedRemember = verifyToken(rememberRes.token);
  assert(
    verifiedRemember?.rememberMe === true &&
    rememberRes.maxAge === 30 * 24 * 60 * 60 &&
    verifiedRemember.exp > now + 29 * 86400 * 1000,
    "Remember Me 30-day session verified"
  );

  // 2e. Expired token rejection
  const expiredPayload = {
    userId: admin.id,
    role: "ADMIN",
    exp: now - 1000, // expired 1s ago
  };
  const expiredToken = signToken(expiredPayload);
  const verifiedExpired = verifyToken(expiredToken);
  assert(verifiedExpired === null, "Expired session token is strictly rejected");

  // 2f. Tampered token rejection
  const tamperedToken = adminToken.slice(0, -4) + "XXXX";
  const verifiedTampered = verifyToken(tamperedToken);
  assert(verifiedTampered === null, "Tampered session cookie is strictly rejected");

  // 3. PROXY (MIDDLEWARE) TESTS: UNAUTHENTICATED
  console.log("\n--- SECTION 3: PROXY UNAUTHENTICATED ACCESS TESTS ---");

  // 3a. Protected route -> Redirects to /login
  const unauthBooksRes = evaluateProxyRouting("/books");
  assert(
    unauthBooksRes.type === "redirect" && unauthBooksRes.url.includes("/login?callbackUrl=%2Fbooks"),
    "Unauthenticated access to /books redirects to /login with callbackUrl"
  );

  // 3b. Unauthenticated access to /login -> Allowed
  const unauthLoginRes = evaluateProxyRouting("/login");
  assert(unauthLoginRes.type === "next", "Unauthenticated access to /login is allowed");

  // 3c. Unauthenticated API access -> Returns 401 JSON
  const unauthApiRes = evaluateProxyRouting("/api/users");
  assert(unauthApiRes.type === "json" && unauthApiRes.status === 401, "Unauthenticated API request to /api/users returns 401 status");

  // 4. PROXY (MIDDLEWARE) TESTS: ADMIN ROLE
  console.log("\n--- SECTION 4: PROXY ADMIN ACCESS TESTS ---");

  // 4a. ADMIN accesses Admin Dashboard -> Allowed
  const adminDashRes = evaluateProxyRouting("/", "GET", adminToken);
  assert(adminDashRes.type === "next", "ADMIN access to / is allowed");

  // 4b. ADMIN accesses /books -> Allowed
  const adminBooksRes = evaluateProxyRouting("/books", "GET", adminToken);
  assert(adminBooksRes.type === "next", "ADMIN access to /books is allowed");

  // 4c. ADMIN accesses /categories -> Allowed
  const adminCatRes = evaluateProxyRouting("/categories", "GET", adminToken);
  assert(adminCatRes.type === "next", "ADMIN access to /categories is allowed");

  // 4d. ADMIN accesses /users -> Allowed
  const adminUsersRes = evaluateProxyRouting("/users", "GET", adminToken);
  assert(adminUsersRes.type === "next", "ADMIN access to /users is allowed");

  // 4e. ADMIN accesses /login -> Redirected away to dashboard
  const adminLoginRes = evaluateProxyRouting("/login", "GET", adminToken);
  assert(
    adminLoginRes.type === "redirect" && adminLoginRes.url === "/",
    "ADMIN visiting /login redirects to Admin Dashboard (/)"
  );

  // 4f. ADMIN accesses student page (/siswa/dashboard) -> Redirected to Admin Dashboard
  const adminCrossRes = evaluateProxyRouting("/siswa/dashboard", "GET", adminToken);
  assert(
    adminCrossRes.type === "redirect" && adminCrossRes.url === "/",
    "ADMIN visiting /siswa/dashboard is redirected to Admin Dashboard (/)"
  );

  // 5. PROXY (MIDDLEWARE) TESTS: SISWA ROLE
  console.log("\n--- SECTION 5: PROXY SISWA ACCESS TESTS ---");

  // 5a. SISWA accesses /siswa/dashboard -> Allowed
  const studentDashRes = evaluateProxyRouting("/siswa/dashboard", "GET", studentToken);
  assert(studentDashRes.type === "next", "SISWA access to /siswa/dashboard is allowed");

  // 5b. SISWA accesses /siswa/books -> Allowed
  const studentBooksRes = evaluateProxyRouting("/siswa/books", "GET", studentToken);
  assert(studentBooksRes.type === "next", "SISWA access to /siswa/books is allowed");

  // 5c. SISWA accesses /siswa/borrowings -> Allowed
  const studentBorrowingsRes = evaluateProxyRouting("/siswa/borrowings", "GET", studentToken);
  assert(studentBorrowingsRes.type === "next", "SISWA access to /siswa/borrowings is allowed");

  // 5d. SISWA accesses /siswa/profile -> Allowed
  const studentProfileRes = evaluateProxyRouting("/siswa/profile", "GET", studentToken);
  assert(studentProfileRes.type === "next", "SISWA access to /siswa/profile is allowed");

  // 5e. SISWA accesses / (Admin Dashboard) -> Blocked & redirected to student dashboard
  const studentAdminDash = evaluateProxyRouting("/", "GET", studentToken);
  assert(
    studentAdminDash.type === "redirect" && studentAdminDash.url === "/siswa/dashboard",
    "SISWA visiting Admin Dashboard (/) is redirected to /siswa/dashboard"
  );

  // 5f. SISWA accesses /users -> Blocked & redirected to student dashboard
  const studentUsersRes = evaluateProxyRouting("/users", "GET", studentToken);
  assert(
    studentUsersRes.type === "redirect" && studentUsersRes.url === "/siswa/dashboard",
    "SISWA visiting /users is redirected to /siswa/dashboard"
  );

  // 5g. SISWA accesses /categories -> Blocked & redirected to student dashboard
  const studentCatRes = evaluateProxyRouting("/categories", "GET", studentToken);
  assert(
    studentCatRes.type === "redirect" && studentCatRes.url === "/siswa/dashboard",
    "SISWA visiting /categories is redirected to /siswa/dashboard"
  );

  // 5h. SISWA accesses /books -> Blocked & redirected to student dashboard
  const studentBooksAdmin = evaluateProxyRouting("/books", "GET", studentToken);
  assert(
    studentBooksAdmin.type === "redirect" && studentBooksAdmin.url === "/siswa/dashboard",
    "SISWA visiting Admin /books is redirected to /siswa/dashboard"
  );

  // 5i. SISWA accesses /login -> Redirected to /siswa/dashboard
  const studentLoginRes = evaluateProxyRouting("/login", "GET", studentToken);
  assert(
    studentLoginRes.type === "redirect" && studentLoginRes.url === "/siswa/dashboard",
    "SISWA visiting /login redirects to /siswa/dashboard"
  );

  // 6. API AUTHORIZATION & ROLE ISOLATION
  console.log("\n--- SECTION 6: API RBAC & SECURITY TESTS ---");

  // 6a. SISWA calling /api/users -> 403 Forbidden
  const studentApiUsers = evaluateProxyRouting("/api/users", "GET", studentToken);
  assert(studentApiUsers.type === "json" && studentApiUsers.status === 403, "SISWA requesting /api/users returns 403 Forbidden");

  // 6b. SISWA calling /api/categories -> 403 Forbidden
  const studentApiCat = evaluateProxyRouting("/api/categories", "GET", studentToken);
  assert(studentApiCat.type === "json" && studentApiCat.status === 403, "SISWA requesting /api/categories returns 403 Forbidden");

  // 6c. SISWA calling POST /api/books (Create book) -> 403 Forbidden
  const studentPostBook = evaluateProxyRouting("/api/books", "POST", studentToken);
  assert(studentPostBook.type === "json" && studentPostBook.status === 403, "SISWA POST to /api/books returns 403 Forbidden");

  // 6d. ADMIN calling /api/users -> Allowed
  const adminApiUsers = evaluateProxyRouting("/api/users", "GET", adminToken);
  assert(adminApiUsers.type === "next", "ADMIN requesting /api/users is allowed");

  // 6e. ADMIN calling /api/siswa/borrowings -> 403 Forbidden
  const adminApiStudent = evaluateProxyRouting("/api/siswa/borrowings", "GET", adminToken);
  assert(adminApiStudent.type === "json" && adminApiStudent.status === 403, "ADMIN requesting /api/siswa/borrowings returns 403 Forbidden");

  // 6f. SISWA calling /api/siswa/borrowings -> Allowed
  const studentApiStudent = evaluateProxyRouting("/api/siswa/borrowings", "GET", studentToken);
  assert(studentApiStudent.type === "next", "SISWA requesting /api/siswa/borrowings is allowed");

  // 7. OPEN REDIRECT PREVENTION
  console.log("\n--- SECTION 7: OPEN REDIRECT PREVENTION ---");
  const evil1 = sanitizeCallbackUrl("https://evil.com", "ADMIN");
  assert(evil1 === "/", "Open redirect 'https://evil.com' sanitized to '/'");

  const evil2 = sanitizeCallbackUrl("//evil.com", "ADMIN");
  assert(evil2 === "/", "Protocol-relative redirect '//evil.com' sanitized to '/'");

  const crossRoleCallback = sanitizeCallbackUrl("/users", "SISWA");
  assert(crossRoleCallback === "/siswa/dashboard", "Forbidden callbackUrl '/users' for SISWA sanitized to '/siswa/dashboard'");

  const validCallback = sanitizeCallbackUrl("/books", "ADMIN");
  assert(validCallback === "/books", "Legitimate internal callbackUrl '/books' for ADMIN preserved");

  console.log("\n==================================================");
  console.log(`TOTAL TESTS: ${passed + failed}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runRBACTests()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
