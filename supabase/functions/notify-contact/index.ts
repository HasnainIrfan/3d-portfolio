import { createClient } from "jsr:@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import {
  buildAlertHtml,
  buildAlertSubject,
  buildAlertText,
  buildReplyHtml,
  buildReplySubject,
  buildReplyText,
  type Submission,
} from "./email-template.ts";

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
    return json({ skipped: true });
  }

  const submission = payload.record;

  const host = env("SMTP_HOST");
  const user = env("SMTP_USER");
  const pass = env("SMTP_PASS");
  const port = Number(env("SMTP_PORT") ?? "465");
  const recipient = env("CONTACT_RECIPIENT_EMAIL") ?? user;

  if (!host || !user || !pass || !recipient) {
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
        tls: port === 465,
        auth: { username: user, password: pass },
      },
    });

    const ownerName = env("OWNER_NAME") ?? "the team";
    const siteUrl = env("SITE_URL");

    let replyFailed: string | null = null;
    try {
      await client.send({
        from: `${ownerName} <${user}>`,
        to: submission.email,
        replyTo: recipient,
        subject: buildReplySubject(ownerName),
        content: buildReplyText(submission, ownerName),
        html: buildReplyHtml(submission, ownerName, siteUrl),
      });
    } catch (error) {
      replyFailed = error instanceof Error ? error.message : String(error);
      console.error("Acknowledgement to sender failed:", replyFailed);
    }

    await client.send({
      from: `Portfolio <${user}>`,
      to: recipient,
      replyTo: `${submission.name} <${submission.email}>`,
      subject: buildAlertSubject(submission),
      content: buildAlertText(submission),
      html: buildAlertHtml(submission, env("ADMIN_INBOX_URL")),
    });

    await recordResult(
      submission.id,
      true,
      replyFailed ? `Acknowledgement to sender failed: ${replyFailed}` : null
    );
    return json({ ok: true, acknowledgement: replyFailed ? "failed" : "sent" });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error("Failed to send notification:", detail);
    await recordResult(submission.id, false, detail.slice(0, 300));
    return json({ ok: false, error: detail });
  } finally {
    await client?.close().catch(() => {});
  }
});

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
    console.error("Could not record email status:", updateError);
  }
}
