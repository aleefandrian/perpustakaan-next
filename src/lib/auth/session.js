import crypto from "crypto";

export const SESSION_COOKIE_NAME = "libra_session";
export const SESSION_SECRET =
  process.env.SESSION_SECRET || "libra-secret-key-development-2026";

export const DEFAULT_SESSION_DURATION = 24 * 60 * 60; // 24 hours (in seconds)
export const REMEMBER_ME_DURATION = 30 * 24 * 60 * 60; // 30 days (in seconds)

/**
 * Dynamically retrieve cookie store compatible with Next.js bundler and plain Node runtime
 */
async function getCookieStore() {
  try {
    const { cookies } = await import("next/headers");
    return await cookies();
  } catch {
    const { cookies } = await import("next/headers.js");
    return await cookies();
  }
}

/**
 * Sign a payload using HMAC SHA-256
 */
export function signToken(payload, secret = SESSION_SECRET) {
  const jsonStr = JSON.stringify(payload);
  const base64 = Buffer.from(jsonStr).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(base64)
    .digest("base64url");
  return `${base64}.${signature}`;
}

/**
 * Verify and parse a signed token with timing-safe comparison and expiration check
 */
export function verifyToken(token, secret = SESSION_SECRET) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [base64, signature] = parts;

  try {
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(base64)
      .digest("base64url");

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSig);

    if (
      sigBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
    ) {
      return null;
    }

    const jsonStr = Buffer.from(base64, "base64url").toString("utf-8");
    const payload = JSON.parse(jsonStr);

    // Verify expiration timestamp
    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Create a session payload and signed token for a user
 */
export function createSessionToken(user, rememberMe = false) {
  const durationSec = rememberMe
    ? REMEMBER_ME_DURATION
    : DEFAULT_SESSION_DURATION;
  const now = Date.now();

  const payload = {
    userId: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status || "ACTIVE",
    iat: now,
    exp: now + durationSec * 1000,
    rememberMe: Boolean(rememberMe),
  };

  const token = signToken(payload);
  return { token, payload, maxAge: durationSec };
}

/**
 * Set HTTP-only session cookie in response headers / Server Action
 */
export async function setSessionCookie(user, rememberMe = false) {
  const { token, payload, maxAge } = createSessionToken(user, rememberMe);
  const cookieStore = await getCookieStore();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });

  return payload;
}

/**
 * Clear session cookie (Logout)
 */
export async function clearSessionCookie() {
  const cookieStore = await getCookieStore();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
}

/**
 * Get verified session from current cookies
 */
export async function getSession() {
  const cookieStore = await getCookieStore();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;
  return verifyToken(token);
}
