import { NextResponse } from "next/server";
import { AUTH_COOKIE, signAccessToken } from "@/lib/auth";
import { findUserByEmail, verifyPassword } from "@/lib/users-store";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };
    const email = body.email?.trim() ?? "";
    const password = body.password?.trim() ?? "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = findUserByEmail(email);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const token = await signAccessToken(user.id, user.email);
    const response = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email },
      token,
    });
    response.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Unable to login." }, { status: 500 });
  }
}
