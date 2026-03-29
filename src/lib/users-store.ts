import { randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

type StoredUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

type UserStore = {
  users: StoredUser[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

function ensureStore() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!existsSync(USERS_FILE)) {
    const initial: UserStore = { users: [] };
    writeFileSync(USERS_FILE, JSON.stringify(initial, null, 2), "utf8");
  }
}

function readStore(): UserStore {
  ensureStore();
  const raw = readFileSync(USERS_FILE, "utf8");
  return JSON.parse(raw) as UserStore;
}

function writeStore(store: UserStore) {
  writeFileSync(USERS_FILE, JSON.stringify(store, null, 2), "utf8");
}

export function hashPassword(password: string): string {
  const salt = randomUUID().replace(/-/g, "");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, passwordHash: string): boolean {
  const [salt, originalHash] = passwordHash.split(":");
  if (!salt || !originalHash) return false;
  const hash = scryptSync(password, salt, 64).toString("hex");
  return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(originalHash, "hex"));
}

export function findUserByEmail(email: string): StoredUser | undefined {
  const store = readStore();
  return store.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

export function createUser(input: { name: string; email: string; password: string }): StoredUser {
  const store = readStore();
  const existing = store.users.find((user) => user.email.toLowerCase() === input.email.toLowerCase());
  if (existing) {
    throw new Error("Email already registered.");
  }

  const user: StoredUser = {
    id: randomUUID(),
    name: input.name.trim(),
    email: input.email.toLowerCase().trim(),
    passwordHash: hashPassword(input.password),
    createdAt: new Date().toISOString(),
  };

  store.users.push(user);
  writeStore(store);
  return user;
}

export type { StoredUser };
