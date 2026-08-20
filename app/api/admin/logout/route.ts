import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/admin/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST only. A GET logout would let any page log the admin out with an <img>
// tag, and would be followed by link prefetchers.
export async function POST() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
