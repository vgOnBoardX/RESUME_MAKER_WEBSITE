import { NextResponse } from "next/server";
import { AUTH_COOKIE, signAccessToken } from "@/lib/auth";
import { createUser } from "@/lib/users-store";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
    };

    const name = body.name?.trim() ?? "";
    const email = body.email?.trim() ?? "";
    const password = body.password?.trim() ?? "";

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password should be at least 6 characters." }, { status: 400 });
    }

    const user = createUser({ name, email, password });
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to register.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
