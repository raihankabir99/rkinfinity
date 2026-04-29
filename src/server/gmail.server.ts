// Server-only Gmail sender via Lovable connector gateway.
// Sends from the connected Gmail account to one or many recipients.

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_mail/gmail/v1";

export const ALERT_RECIPIENTS = [
  "maskrklo@gmail.com",
  "rkinfinity.official@gmail.com",
];

function toBase64Url(input: string): string {
  // btoa works in the worker runtime; for unicode safety encode first.
  const utf8 = unescape(encodeURIComponent(input));
  return btoa(utf8).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function buildRfc2822({
  to,
  subject,
  html,
  text,
  fromName = "rkInfinity Pulse",
}: {
  to: string[];
  subject: string;
  html?: string;
  text?: string;
  fromName?: string;
}): string {
  const boundary = `rk_${Math.random().toString(36).slice(2)}`;
  const headers = [
    `From: ${fromName} <me>`,
    `To: ${to.join(", ")}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
  ].join("\r\n");

  const parts: string[] = [];
  parts.push(`--${boundary}`);
  parts.push('Content-Type: text/plain; charset="UTF-8"');
  parts.push("Content-Transfer-Encoding: 7bit");
  parts.push("");
  parts.push(text ?? (html ?? "").replace(/<[^>]+>/g, ""));
  parts.push(`--${boundary}`);
  parts.push('Content-Type: text/html; charset="UTF-8"');
  parts.push("Content-Transfer-Encoding: 7bit");
  parts.push("");
  parts.push(html ?? `<pre>${text ?? ""}</pre>`);
  parts.push(`--${boundary}--`);

  return headers + parts.join("\r\n");
}

export async function sendGmail(opts: {
  to: string[] | string;
  subject: string;
  html?: string;
  text?: string;
  fromName?: string;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const gmailKey = process.env.GOOGLE_MAIL_API_KEY;
  if (!lovableKey) return { ok: false, error: "LOVABLE_API_KEY missing" };
  if (!gmailKey) return { ok: false, error: "GOOGLE_MAIL_API_KEY missing" };

  const to = Array.isArray(opts.to) ? opts.to : [opts.to];
  const raw = toBase64Url(buildRfc2822({ ...opts, to }));

  const res = await fetch(`${GATEWAY_URL}/users/me/messages/send`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": gmailKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw }),
  });

  const data = (await res.json().catch(() => ({}))) as { id?: string };
  if (!res.ok) {
    return { ok: false, error: `Gmail ${res.status}: ${JSON.stringify(data)}` };
  }
  return { ok: true, id: data.id };
}
