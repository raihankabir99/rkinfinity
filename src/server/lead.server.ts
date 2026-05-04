import { supabaseAdmin } from "@/server/supabase-admin.server";
import { sendGmail, ALERT_RECIPIENTS } from "@/server/gmail.server";

export interface LeadInput {
  name: string;
  email: string;
  subject?: string;
  message: string;
  source?: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function submitLead(lead: LeadInput) {
  const { data: inserted, error: insertErr } = await supabaseAdmin
    .from("leads")
    .insert({
      name: lead.name,
      email: lead.email,
      message: [lead.subject ? `Subject: ${lead.subject}` : null, lead.message]
        .filter(Boolean)
        .join("\n\n"),
      source: lead.source ?? "contact_form",
    })
    .select("id, created_at")
    .single();

  if (insertErr) {
    console.error("lead insert failed", insertErr);
    throw new Error("Failed to save lead");
  }

  const subject = `🔔 New Lead — ${lead.name}`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#0a0a0a;color:#fff;border-radius:12px;border:1px solid #FFD700">
      <h2 style="color:#FFD700;margin:0 0 12px">New rkInfinity Lead</h2>
      <p style="color:#bbb;margin:0 0 18px">Just received via the website.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="padding:6px 0;color:#888;width:90px">Name</td><td>${escapeHtml(lead.name)}</td></tr>
        <tr><td style="padding:6px 0;color:#888">Email</td><td><a href="mailto:${escapeHtml(lead.email)}" style="color:#FFD700">${escapeHtml(lead.email)}</a></td></tr>
        ${lead.subject ? `<tr><td style="padding:6px 0;color:#888">Subject</td><td>${escapeHtml(lead.subject)}</td></tr>` : ""}
        <tr><td style="padding:6px 0;color:#888;vertical-align:top">Message</td><td style="white-space:pre-wrap">${escapeHtml(lead.message)}</td></tr>
        <tr><td style="padding:6px 0;color:#888">Source</td><td>${escapeHtml(lead.source ?? "contact_form")}</td></tr>
      </table>
      <hr style="border:none;border-top:1px solid #222;margin:18px 0" />
      <p style="color:#666;font-size:12px;margin:0">Logged in Pulse Admin Dashboard · ID ${inserted?.id ?? "—"}</p>
    </div>
  `;

  const emailRes = await sendGmail({
    to: ALERT_RECIPIENTS,
    subject,
    html,
    text: `New lead from ${lead.name} <${lead.email}>\n\n${lead.message}`,
  });

  if (!emailRes.ok) {
    console.error("Gmail alert failed", emailRes.error);
  }

  return { ok: true, id: inserted?.id, emailed: emailRes.ok };
}
