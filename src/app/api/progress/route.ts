import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

const PROGRESS_DIR = path.join(process.cwd(), "data", "progress");

function ensureDir() {
  if (!fs.existsSync(PROGRESS_DIR)) fs.mkdirSync(PROGRESS_DIR, { recursive: true });
}

function filePath(userId: string) {
  const safe = userId.replace(/[^a-zA-Z0-9_-]/g, "_");
  return path.join(PROGRESS_DIR, `${safe}.json`);
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  ensureDir();
  const fp = filePath(userId);
  if (!fs.existsSync(fp)) return NextResponse.json(null);
  const data = JSON.parse(fs.readFileSync(fp, "utf-8"));
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const userId: string = body.userId;
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  ensureDir();
  fs.writeFileSync(filePath(userId), JSON.stringify(body, null, 2));
  return NextResponse.json({ ok: true });
}
