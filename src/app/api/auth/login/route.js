import { NextResponse } from "next/server";
import { authenticate, setSessionCookie, sanitizeCallbackUrl } from "@/lib/auth";

export const instant = false;

export async function POST(request) {
  try {
    const body = await request.json();
    const { identifier, password, rememberMe, callbackUrl } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, message: "Username/email dan password wajib diisi." },
        { status: 400 }
      );
    }

    const user = await authenticate(identifier, password);

    // Set HTTP-only cookie with proper duration based on rememberMe
    await setSessionCookie(user, Boolean(rememberMe));

    const redirectUrl = sanitizeCallbackUrl(callbackUrl, user.role);

    return NextResponse.json({
      success: true,
      message: `Selamat datang, ${user.name}!`,
      redirectUrl,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        photo: user.photo,
      },
    });
  } catch (error) {
    const isAuthError =
      error.message?.includes("tidak valid") ||
      error.message?.includes("wajib diisi");
    const isInactive = error.message?.includes("non-aktif");
    const status = isInactive ? 403 : isAuthError ? 401 : 500;

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Terjadi kesalahan server saat login.",
      },
      { status }
    );
  }
}
