import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const USERS_FILE = path.join(process.cwd(), "data", "users.json");

type UserEntry = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
};

function ensureFile(): UserEntry[] {
  const dir = path.dirname(USERS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, "[]");
  return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8")) as UserEntry[];
}

function hashPassword(pw: string): string {
  return crypto.createHash("sha256").update(pw).digest("hex");
}

export async function POST(req: Request) {
  const body = await req.json();
  const email: string = (body.email ?? "").trim().toLowerCase();
  const password: string = body.password ?? "";
  const name: string = (body.name ?? email.split("@")[0]).trim();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const users = ensureFile();

  if (users.some((u) => u.email === email)) {
    return NextResponse.json({ error: "Account already exists. Please login." }, { status: 409 });
  }

  const entry: UserEntry = {
    id: crypto.randomUUID(),
    email,
    name,
    passwordHash: hashPassword(password),
  };

  users.push(entry);
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

  return NextResponse.json({ id: entry.id, email: entry.email, name: entry.name });
}
