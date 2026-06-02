import { NextResponse } from "next/server";
import {
  createSessionToken,
  getAdminPassword,
  getSessionCookieOptions,
  ADMIN_SESSION_COOKIE,
} from "@/lib/auth/admin-session";

export async function POST(request: Request) {
  const adminPassword = getAdminPassword();

  if (!adminPassword) {
    return NextResponse.json(
      { message: "Admin login is not configured." },
      { status: 503 },
    );
  }

  let body: { password?: string };

  try {
    body = (await request.json()) as { password?: string };
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }

  if (!body.password || body.password !== adminPassword) {
    return NextResponse.json({ message: "密码错误" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(
    ADMIN_SESSION_COOKIE,
    createSessionToken(),
    getSessionCookieOptions(),
  );

  return response;
}
