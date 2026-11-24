import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, createAdminSessionCookie, getSessionCookieOptions } from "@/lib/auth/authorization";

export async function POST(request) {
  try {
    const { idToken } = await request.json();
    if (typeof idToken !== "string" || !idToken)
      return NextResponse.json({ error: "Missing authentication token." }, { status: 400 });
    const sessionCookie = await createAdminSessionCookie(idToken);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, sessionCookie, getSessionCookieOptions());
    return response;
  } catch (error) {
    if (error?.code === "ADMIN_UNAUTHORIZED")
      return NextResponse.json({ error: "This account is not authorized for Sathi Admin." }, { status: 403 });
    return NextResponse.json({ error: "Unable to create a secure session." }, { status: 401 });
  }
}

export async function GET() {
  const { getAdminSession } = await import("@/lib/auth/authorization");
  const session = await getAdminSession();
  return session
    ? NextResponse.json({ authenticated: true, user: session })
    : NextResponse.json({ authenticated: false }, { status: 401 });
}
