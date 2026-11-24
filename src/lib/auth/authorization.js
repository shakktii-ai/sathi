import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminAuth } from "@/lib/firebase/admin";

export const ADMIN_SESSION_COOKIE = "sathi_admin_session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 5;

export function isAuthorizedAdmin(decodedToken) {
  return decodedToken?.admin === true || decodedToken?.adminRole === "super_admin";
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  };
}

export async function createAdminSessionCookie(idToken) {
  const adminAuth = getAdminAuth();
  const decodedToken = await adminAuth.verifyIdToken(idToken, true);
  if (!isAuthorizedAdmin(decodedToken)) {
    const error = new Error("This account is not authorized for Sathi Admin.");
    error.code = "ADMIN_UNAUTHORIZED";
    throw error;
  }
  return adminAuth.createSessionCookie(idToken, { expiresIn: SESSION_DURATION_MS });
}

export async function getAdminSession() {
  const sessionCookie = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!sessionCookie) return null;

  try {
    const decodedToken = await getAdminAuth().verifySessionCookie(sessionCookie, true);
    if (!isAuthorizedAdmin(decodedToken)) return null;
    return {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      name: decodedToken.name || null,
      adminRole: decodedToken.adminRole || (decodedToken.admin === true ? "admin" : null),
    };
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/login?reason=session_expired");
  return session;
}
