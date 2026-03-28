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

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const users = ensureFile();
  const user = users.find((u) => u.email === email);

  if (!user || user.passwordHash !== hashPassword(password)) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  return NextResponse.json({ id: user.id, email: user.email, name: user.name });
}
