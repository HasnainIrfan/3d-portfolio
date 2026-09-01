/**
 * notify-contact — emails you when someone fills in the contact form.
 *
 * This is the piece that used to live in the Next.js app as a Nodemailer call
 * inside the API route. Moving it here took the SMTP credentials out of the
 * web deployment entirely: they are Supabase secrets now, and the repository
 * contains none of them.
 *
 * How it runs:
 *
 *   INSERT on contact_submissions
 *     → Database Webhook (Dashboard → Database → Webhooks)
 *       → this function
 *         → SMTP
 *         → writes email_sent / email_error back to the row
 *
 * Deploy:
 *   supabase functions deploy notify-contact
 *   supabase secrets set SMTP_HOST=... SMTP_PORT=465 SMTP_USER=... \
 *                        SMTP_PASS=... CONTACT_RECIPIENT_EMAIL=... \
 *                        NOTIFY_WEBHOOK_SECRET=$(openssl rand -hex 32)
 *
 * Setup is walked through in docs/admin.md.
 */

import { createClient } from "jsr:@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import {
  buildHtml,
  buildSubject,
  buildText,
  type Submission,
} from "./email-template.ts";

/** The webhook payload Supabase sends. Only INSERT is acted on. */
interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  schema: string;
  record: Submission | null;
}

const env = (key: string): string | undefined => Deno.env.get(key);

const json = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  // A shared secret, set as a custom header on the webhook. Without it this
  // endpoint is an open relay: anyone who learns the URL can post a payload and
  // have your SMTP account send whatever they like, from your domain.
  const expectedSecret = env("NOTIFY_WEBHOOK_SECRET");
  if (expectedSecret) {
    const provided = req.headers.get("x-webhook-secret");
    if (provided !== expectedSecret) {
      return json({ error: "Unauthorized" }, 401);
    }
  } else {
    console.warn(
      "NOTIFY_WEBHOOK_SECRET is not set. Anyone who discovers this function's " +
        "URL can trigger it. Set it and add the matching x-webhook-secret " +
        "header to the webhook."
    );
  }

  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  if (payload.type !== "INSERT" || !payload.record) {
    // Not an error — the webhook may be configured for more events than this
    // function cares about. Acknowledged so Supabase does not retry it.
    return json({ skipped: true });
  }

  const submission = payload.record;

  const host = env("SMTP_HOST");
  const user = env("SMTP_USER");
  const pass = env("SMTP_PASS");
  const port = Number(env("SMTP_PORT") ?? "465");
  const recipient = env("CONTACT_RECIPIENT_EMAIL") ?? user;

  if (!host || !user || !pass || !recipient) {
    // The submission is already saved; a missing mail config must not turn into
    // a retry storm against a webhook that can never succeed.
    console.error("SMTP secrets are incomplete — no email sent.");
    await recordResult(submission.id, false, "SMTP is not configured");
    return json({ ok: false, reason: "smtp-not-configured" });
  }

  let client: SMTPClient | undefined;

  try {
    client = new SMTPClient({
      connection: {
        hostname: host,
        port,
        // 465 is implicit TLS; 587 negotiates STARTTLS after connecting.
        tls: port === 465,
        auth: { username: user, password: pass },
      },
    });

    await client.send({
      from: `Portfolio <${user}>`,
      to: recipient,
      // So hitting reply in your mail client answers the visitor, not yourself.
      replyTo: `${submission.name} <${submission.email}>`,
      subject: buildSubject(submission),
      content: buildText(submission),
      html: buildHtml(submission, env("ADMIN_INBOX_URL")),
    });

    await recordResult(submission.id, true, null);
    return json({ ok: true });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error("Failed to send notification:", detail);
    await recordResult(submission.id, false, detail.slice(0, 300));
    // 200, not 500. The enquiry is safely stored, and a non-2xx here only makes
    // Supabase redeliver a webhook whose failure is not transient.
    return json({ ok: false, error: detail });
  } finally {
    await client?.close().catch(() => {});
  }
});

/**
 * Records the outcome on the row, so /admin can show "notification email was
 * not delivered" instead of leaving weeks of silent failures invisible.
 *
 * Uses the service-role key, which Supabase injects into every Edge Function.
 * That key never leaves Supabase — it is not in the repository and not in the
 * web app.
 */
async function recordResult(
  id: string,
  sent: boolean,
  error: string | null
): Promise<void> {
  const url = env("SUPABASE_URL");
  const serviceKey = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) return;

  try {
    const supabase = createClient(url, serviceKey, {
      auth: { persistSession: false },
    });
    await supabase
      .from("contact_submissions")
      .update({ email_sent: sent, email_error: error })
      .eq("id", id);
  } catch (updateError) {
    // Best effort. Failing to record the status must never fail the request.
    console.error("Could not record email status:", updateError);
  }
}
