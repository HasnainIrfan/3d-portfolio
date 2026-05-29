import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 465);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const recipientEmail =
  process.env.CONTACT_RECIPIENT_EMAIL || "hasnainirfandeveloper@gmail.com";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Body {
  name?: string;
  email?: string;
  budget?: string;
  message?: string;
}

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

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
  if (name.length > 200 || email.length > 200 || message.length > 5000) {
    return NextResponse.json({ error: "Payload too large." }, { status: 413 });
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Supabase environment variables are missing.");
    return NextResponse.json(
      { error: "Server is not configured." },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  const forwarded = req.headers.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || null;
  const userAgent = req.headers.get("user-agent") ?? null;

  const { error: dbError, data: inserted } = await supabase
    .from("contact_submissions")
    .insert({
      name,
      email,
      budget: budget || null,
      message,
      user_agent: userAgent,
      ip_address: ip,
    })
    .select("id, created_at")
    .single();

  if (dbError) {
    console.error(
      "Supabase insert failed:",
      JSON.stringify(
        {
          message: dbError.message,
          code: dbError.code,
          details: dbError.details,
          hint: dbError.hint,
        },
        null,
        2
      )
    );
    const tableMissing =
      dbError.code === "42P01" ||
      dbError.code === "PGRST205" ||
      /relation .* does not exist/i.test(dbError.message || "") ||
      /could not find the table/i.test(dbError.message || "");
    return NextResponse.json(
      {
        error: tableMissing
          ? "Supabase table 'contact_submissions' is missing. Run supabase/migrations/0001_contact_submissions.sql in the Supabase SQL editor."
          : "Could not save your message. Please try again.",
      },
      { status: 500 }
    );
  }

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
      });

      const subject = `New portfolio enquiry — ${name}`;
      const text = `New portfolio contact form submission

Name:    ${name}
Email:   ${email}
Budget:  ${budget || "—"}
IP:      ${ip || "—"}
Agent:   ${userAgent || "—"}

Message:
${message}

Submission ID: ${inserted?.id}
`;

      const html = `
        <div style="font-family:Inter,Arial,sans-serif;background:#0a0b1a;color:#f5f5f7;padding:24px;border-radius:16px;max-width:600px;margin:auto">
          <h2 style="margin:0 0 16px;font-size:20px;background:linear-gradient(135deg,#5c33cc,#ea4884);-webkit-background-clip:text;background-clip:text;color:transparent;">New portfolio enquiry</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:6px 8px;color:#9ca0b3;width:120px">Name</td><td style="padding:6px 8px;color:#fff">${escapeHtml(name)}</td></tr>
            <tr><td style="padding:6px 8px;color:#9ca0b3">Email</td><td style="padding:6px 8px;color:#fff"><a href="mailto:${escapeHtml(email)}" style="color:#ea4884">${escapeHtml(email)}</a></td></tr>
            <tr><td style="padding:6px 8px;color:#9ca0b3">Budget</td><td style="padding:6px 8px;color:#fff">${escapeHtml(budget) || "&mdash;"}</td></tr>
            <tr><td style="padding:6px 8px;color:#9ca0b3;vertical-align:top">Message</td><td style="padding:6px 8px;color:#fff;white-space:pre-wrap">${escapeHtml(message)}</td></tr>
          </table>
          <p style="margin-top:20px;font-size:11px;color:#6b6f80">IP: ${escapeHtml(ip || "—")} · Submission ID: ${escapeHtml(inserted?.id ?? "—")}</p>
        </div>`;

      await transporter.sendMail({
        from: `"Portfolio · Hasnain" <${smtpUser}>`,
        to: recipientEmail,
        replyTo: email,
        subject,
        text,
        html,
      });
    } catch (mailError) {
      console.error("Email send failed:", mailError);
      // The DB row is already saved — still return success to the user.
    }
  } else {
    console.warn("SMTP not configured — skipping email send.");
  }

  return NextResponse.json({ ok: true, id: inserted?.id }, { status: 201 });
}
