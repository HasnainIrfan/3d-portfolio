/**
 * The notification email, in the portfolio's own colours.
 *
 * Written as a table-based layout with inline styles, which looks dated because
 * email clients are dated: Outlook still renders through Word's HTML engine,
 * and Gmail strips <style> blocks in some contexts. Flexbox and CSS variables
 * are not available here.
 *
 * A plain-text alternative is built alongside it. Sending both is what keeps
 * the message out of spam folders that penalise HTML-only mail.
 */

export interface Submission {
  id: string;
  name: string;
  email: string;
  budget: string | null;
  message: string;
  created_at: string;
  ip_address: string | null;
  user_agent: string | null;
}

/** Email bodies are HTML, and every field below came from a stranger. */
const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const row = (label: string, value: string): string => `
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid #282b4b;color:#8b8fa3;font-size:13px;width:110px;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:10px 0;border-bottom:1px solid #282b4b;color:#e9e9ee;font-size:14px;">${value}</td>
  </tr>`;

export const buildSubject = (s: Submission): string =>
  `New enquiry from ${s.name}${s.budget ? ` · ${s.budget}` : ""}`;

export const buildText = (s: Submission): string =>
  [
    "New portfolio enquiry",
    "",
    `Name:    ${s.name}`,
    `Email:   ${s.email}`,
    `Budget:  ${s.budget ?? "—"}`,
    `Sent:    ${new Date(s.created_at).toUTCString()}`,
    "",
    "Message:",
    s.message,
    "",
    "—",
    `Reply directly to this email to answer ${s.name}.`,
  ].join("\n");

export const buildHtml = (s: Submission, adminUrl?: string): string => {
  const sent = new Date(s.created_at).toUTCString();

  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#030412;">
  <!-- Shown in the inbox list under the subject, before the mail is opened. -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    ${escapeHtml(s.message.slice(0, 120))}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#030412;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#06091f;border:1px solid #282b4b;border-radius:16px;overflow:hidden;">

        <tr><td style="padding:28px 28px 0;">
          <div style="display:inline-block;padding:5px 12px;border-radius:999px;background:#1f1e39;color:#7a57db;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;">
            New enquiry
          </div>
          <h1 style="margin:16px 0 0;color:#ffffff;font-size:22px;font-family:Arial,Helvetica,sans-serif;font-weight:bold;">
            ${escapeHtml(s.name)} got in touch
          </h1>
        </td></tr>

        <tr><td style="padding:20px 28px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;">
            ${row("From", `<a href="mailto:${encodeURIComponent(s.email)}" style="color:#ea4884;text-decoration:none;">${escapeHtml(s.email)}</a>`)}
            ${s.budget ? row("Budget", escapeHtml(s.budget)) : ""}
            ${row("Received", escapeHtml(sent))}
          </table>
        </td></tr>

        <tr><td style="padding:22px 28px 0;">
          <div style="padding:18px;border-radius:12px;background:#161a31;border:1px solid #282b4b;">
            <p style="margin:0;color:#c9cad6;font-size:14px;line-height:1.65;font-family:Arial,Helvetica,sans-serif;white-space:pre-wrap;">${escapeHtml(s.message)}</p>
          </div>
        </td></tr>

        <tr><td style="padding:24px 28px 28px;" align="center">
          <a href="mailto:${encodeURIComponent(s.email)}?subject=${encodeURIComponent(`Re: your enquiry`)}"
             style="display:inline-block;padding:13px 26px;border-radius:999px;background:#5c33cc;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">
            Reply to ${escapeHtml(s.name)}
          </a>
          ${
            adminUrl
              ? `<p style="margin:14px 0 0;font-family:Arial,Helvetica,sans-serif;">
                   <a href="${escapeHtml(adminUrl)}" style="color:#8b8fa3;font-size:12px;text-decoration:underline;">Open the inbox</a>
                 </p>`
              : ""
          }
        </td></tr>

      </table>

      <p style="margin:18px 0 0;color:#4a4d63;font-size:11px;font-family:Arial,Helvetica,sans-serif;">
        Sent by your portfolio contact form · reply goes straight to the sender
      </p>
    </td></tr>
  </table>
</body>
</html>`;
};
