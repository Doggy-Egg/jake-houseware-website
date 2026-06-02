import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth/admin-session-cookie";

export { ADMIN_SESSION_COOKIE } from "@/lib/auth/admin-session-cookie";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export function getAuthSecret(): string {
  return process.env.AUTH_SECRET ?? "dev-secret-change-me";
}

export function getAdminPassword(): string | null {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  if (process.env.NODE_ENV === "development") return "jakehouseware";
  return null;
}

export function createSessionToken(): string {
  const payload = `admin:${Date.now()}`;
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature || !payload.startsWith("admin:")) return false;

  const expected = signPayload(payload);
  if (signature.length !== expected.length) return false;

  try {
    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return false;
    }
  } catch {
    return false;
  }

  const timestamp = Number(payload.split(":")[1]);
  if (Number.isNaN(timestamp)) return false;

  const ageMs = Date.now() - timestamp;
  return ageMs >= 0 && ageMs <= SESSION_MAX_AGE_SECONDS * 1000;
}

function signPayload(payload: string): string {
  return createHmac("sha256", getAuthSecret()).update(payload).digest("hex");
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export async function getServerSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

export function getRequestSession(request: NextRequest): boolean {
  return verifySessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

export function unauthorizedResponse() {
  return Response.json({ message: "Unauthorized" }, { status: 401 });
}
