/**
 * The contact form endpoint.
 *
 * It does one thing: validate an enquiry and store it. It used to also send the
 * notification email over SMTP, which meant SMTP credentials in the deployment
 * and a mail library in the bundle. That job now belongs to a Supabase Edge
 * Function triggered by the insert — see supabase/functions/notify-contact —
 * so the credentials live in Supabase and this route stays a single write.
 *
 * The write goes through the anon key under row-level security. The `anyone can
 * submit` policy in 0001 permits the insert and nothing else: no select, no
 * update, no delete. An anonymous visitor can add a row and can never read one
 * back, including their own.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { CONTACT_EMAIL } from "@/constants/portfolio-constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Body {
  name?: string;
  email?: string;
  budget?: string;
  message?: string;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const budget = body.budget?.trim() ?? "";
  const message = body.message?.trim() ?? "";

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Name, email and message are required." },
      { status: 400 }
    );
  }
  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { error: "Please provide a valid email address." },
      { status: 400 }
    );
  }
  // Mirrors the CHECK constraints on the table, so an over-long field is
  // rejected here with a readable message rather than as a database error.
  if (name.length > 120 || email.length > 200 || message.length > 5000) {
    return NextResponse.json({ error: "Payload too large." }, { status: 413 });
  }

  // No database on this deployment. A forked copy with an empty .env lands
  // here, and the honest answer is an address they can write to — not a 500
  // that reads like the visitor did something wrong.
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      {
        error: `The contact form is not connected on this deployment. Please email ${CONTACT_EMAIL} directly.`,
      },
      { status: 503 }
    );
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json(
      { error: `Please email ${CONTACT_EMAIL} directly.` },
      { status: 503 }
    );
  }

  const forwarded = req.headers.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || null;
  const userAgent = req.headers.get("user-agent") ?? null;

  // No `.select()` — the insert policy grants insert only, so asking for the
  // row back would make PostgREST refuse the whole statement.
  const { error: dbError } = await supabase
    .from("contact_submissions")
    .insert({
      name,
      email,
      budget: budget || null,
      message,
      user_agent: userAgent,
      ip_address: ip,
    });

  if (dbError) {
    console.error("Supabase insert failed:", {
      message: dbError.message,
      code: dbError.code,
      hint: dbError.hint,
    });

    const tableMissing =
      dbError.code === "42P01" ||
      dbError.code === "PGRST205" ||
      /relation .* does not exist/i.test(dbError.message || "") ||
      /could not find the table/i.test(dbError.message || "");

    return NextResponse.json(
      {
        error: tableMissing
          ? "The database is connected but not set up yet. Run the files in supabase/migrations/ in the Supabase SQL editor."
          : "Could not save your message. Please try again.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
