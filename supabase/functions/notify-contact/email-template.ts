/**
 * The two emails this project sends, and the only templates it has.
 *
 * 1. An acknowledgement to the person who filled in the form, so they know it
 *    arrived and roughly when to expect a reply. Sent first — it is the one a
 *    stranger is waiting on.
 * 2. The lead itself, to you, with Reply-To set to the sender so hitting reply
 *    answers them rather than yourself.
 *
 * Table layouts and inline styles throughout, because email clients are dated:
 * Outlook renders through Word's HTML engine and Gmail strips <style> blocks in
 * some contexts. Flexbox, grid and CSS variables are not available here.
 *
 * Every message is built as HTML *and* plain text. Sending both is what keeps
 * mail out of spam filters that penalise HTML-only messages.
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

/** Every field below was typed by a stranger and is about to become HTML. */
const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/** Only the sender's first name, and only if it looks like one. A form field
 *  can contain anything, and "Hi ,"  reads worse than a plain greeting. */
const firstName = (name: string): string => {
  const first = name.trim().split(/\s+/)[0] ?? "";
  return /^[\p{L}'-]{1,30}$/u.test(first) ? first : "there";
};

/* -------------------------------------------------------------------------- */
/*  Shared shell                                                              */
/* -------------------------------------------------------------------------- */

const shell = (preheader: string, inner: string, footer: string): string =>
  `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#030412;">
  <!-- Shown in the inbox list beside the subject, before the mail is opened. -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#030412;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#06091f;border:1px solid #282b4b;border-radius:16px;">
${inner}
      </table>
      <p style="margin:18px 0 0;color:#3d4054;font-size:11px;font-family:Arial,Helvetica,sans-serif;">${escapeHtml(footer)}</p>
    </td></tr>
  </table>
</body>
</html>`;

const detailRow = (label: string, value: string): string => `
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid #282b4b;color:#8b8fa3;font-size:13px;width:110px;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:10px 0;border-bottom:1px solid #282b4b;color:#e9e9ee;font-size:14px;">${value}</td>
  </tr>`;

/* -------------------------------------------------------------------------- */
/*  1. Acknowledgement — to the person who wrote in                           */
/* -------------------------------------------------------------------------- */

export const buildReplySubject = (ownerName: string): string =>
  `Thanks for reaching out — ${ownerName}`;

export const buildReplyText = (s: Submission, ownerName: string): string =>
  [
    `Hi ${firstName(s.name)},`,
    "",
    `Thanks for getting in touch — your message reached me and I'll reply personally, usually within one business day.`,
    "",
    "Here is what you sent, for your records:",
    "",
    s.message,
    "",
    "No need to reply to this message; it is just a confirmation.",
    "",
    `— ${ownerName}`,
  ].join("\n");

export const buildReplyHtml = (
  s: Submission,
  ownerName: string,
  siteUrl?: string
): string =>
  shell(
    "Your message reached me — I'll reply within one business day.",
    `
        <tr><td align="center" style="padding:34px 30px 0;">
          <div style="width:46px;height:46px;line-height:46px;border-radius:12px;background:#5c33cc;color:#ffffff;font-size:20px;font-weight:bold;font-family:Arial,Helvetica,sans-serif;">${escapeHtml(ownerName.charAt(0).toUpperCase())}</div>
          <h1 style="margin:20px 0 0;color:#ffffff;font-size:22px;font-weight:bold;font-family:Arial,Helvetica,sans-serif;">Thanks, ${escapeHtml(firstName(s.name))} &mdash; got it</h1>
        </td></tr>

        <tr><td style="padding:14px 30px 0;">
          <p style="margin:0;color:#9a9db0;font-size:14px;line-height:1.7;text-align:center;font-family:Arial,Helvetica,sans-serif;">
            Your message came through. I read every one myself and will reply
            personally, usually within one business day.
          </p>
        </td></tr>

        <tr><td style="padding:24px 30px 0;">
          <p style="margin:0 0 10px;color:#6a6d82;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;">What you sent</p>
          <div style="padding:18px;border-radius:12px;background:#161a31;border:1px solid #282b4b;">
            <p style="margin:0;color:#c9cad6;font-size:14px;line-height:1.65;font-family:Arial,Helvetica,sans-serif;white-space:pre-wrap;">${escapeHtml(s.message)}</p>
          </div>
        </td></tr>
${
  siteUrl
    ? `
        <tr><td align="center" style="padding:24px 30px 0;">
          <a href="${escapeHtml(siteUrl)}" style="display:inline-block;padding:13px 26px;border-radius:999px;background:#5c33cc;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">See my work</a>
        </td></tr>`
    : ""
}
        <tr><td style="padding:24px 30px 30px;">
          <div style="border-top:1px solid #282b4b;padding-top:18px;">
            <p style="margin:0;color:#4a4d63;font-size:11px;line-height:1.6;text-align:center;font-family:Arial,Helvetica,sans-serif;">
              This is an automatic confirmation &mdash; no need to reply to it.
              My personal answer is on its way.
            </p>
          </div>
        </td></tr>`,
    `Sent because you used the contact form on ${ownerName}'s site`
  );

/* -------------------------------------------------------------------------- */
/*  2. The lead — to you                                                      */
/* -------------------------------------------------------------------------- */

export const buildAlertSubject = (s: Submission): string =>
  `New enquiry from ${s.name}${s.budget ? ` · ${s.budget}` : ""}`;

export const buildAlertText = (s: Submission): string =>
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
    `Reply to this email to answer ${s.name} directly.`,
  ].join("\n");

export const buildAlertHtml = (s: Submission, adminUrl?: string): string =>
  shell(
    s.message.slice(0, 120),
    `
        <tr><td style="padding:28px 28px 0;">
          <div style="display:inline-block;padding:5px 12px;border-radius:999px;background:#1f1e39;color:#7a57db;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;">New enquiry</div>
          <h1 style="margin:16px 0 0;color:#ffffff;font-size:22px;font-family:Arial,Helvetica,sans-serif;font-weight:bold;">${escapeHtml(s.name)} got in touch</h1>
        </td></tr>

        <tr><td style="padding:20px 28px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;">
            ${detailRow("From", `<a href="mailto:${encodeURIComponent(s.email)}" style="color:#ea4884;text-decoration:none;">${escapeHtml(s.email)}</a>`)}
            ${s.budget ? detailRow("Budget", escapeHtml(s.budget)) : ""}
            ${detailRow("Received", escapeHtml(new Date(s.created_at).toUTCString()))}
          </table>
        </td></tr>

        <tr><td style="padding:22px 28px 0;">
          <div style="padding:18px;border-radius:12px;background:#161a31;border:1px solid #282b4b;">
            <p style="margin:0;color:#c9cad6;font-size:14px;line-height:1.65;font-family:Arial,Helvetica,sans-serif;white-space:pre-wrap;">${escapeHtml(s.message)}</p>
          </div>
        </td></tr>

        <tr><td align="center" style="padding:24px 28px 28px;">
          <a href="mailto:${encodeURIComponent(s.email)}" style="display:inline-block;padding:13px 26px;border-radius:999px;background:#5c33cc;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">Reply to ${escapeHtml(s.name)}</a>
          ${adminUrl ? `<p style="margin:14px 0 0;font-family:Arial,Helvetica,sans-serif;"><a href="${escapeHtml(adminUrl)}" style="color:#8b8fa3;font-size:12px;text-decoration:underline;">Open the inbox</a></p>` : ""}
        </td></tr>`,
    "Sent by your portfolio contact form · reply goes straight to the sender"
  );
