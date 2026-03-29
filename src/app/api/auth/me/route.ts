import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { AUTH_COOKIE, getBearerToken, verifyAccessToken } from "@/lib/auth";
import { StoredUser } from "@/lib/users-store";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

function getUserFromId(userId: string): Pick<StoredUser, "id" | "name" | "email"> | null {
  const usersFile = path.join(process.cwd(), "data", "users.json");
  if (!existsSync(usersFile)) return null;
  const raw = readFileSync(usersFile, "utf8");
  const parsed = JSON.parse(raw) as { users: StoredUser[] };
  const user = parsed.users.find((item) => item.id === userId);
  if (!user) return null;
  return { id: user.id, name: user.name, email: user.email };
}

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(AUTH_COOKIE)?.value;
  const bearerToken = getBearerToken(request);
  const token = cookieToken ?? bearerToken;

  const session = await verifyAccessToken(token);
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = getUserFromId(session.userId);
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user });
}
