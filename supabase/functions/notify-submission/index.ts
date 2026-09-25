// Emails the admin whenever a new listing is submitted on the site, or
// whenever someone joins a "notify me when it launches" list.
// Triggered by a Supabase Database Webhook on INSERT into public.listings
// (see supabase/webhook_setup.md). The webhook must send the header
// x-webhook-secret matching the WEBHOOK_SECRET function secret.
//
// Secrets required (project-wide Edge Function secrets):
//   RESEND_API_KEY  - same key used by notify-approved
//   WEBHOOK_SECRET  - any long random string; set the same value on the webhook
//   NOTIFY_TO       - where to send alerts (support@startuplogin.com)

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

function reply(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return reply(405, { error: "POST only" });

  const secret = Deno.env.get("WEBHOOK_SECRET") ?? "";
  if (!secret || req.headers.get("x-webhook-secret") !== secret) {
    return reply(401, { error: "bad webhook secret" });
  }

  const payload = await req.json().catch(() => null);
  const rec = payload?.record;
  if (payload?.type !== "INSERT" || !rec) {
    return reply(200, { skipped: true, reason: "not an insert" });
  }

  const to = Deno.env.get("NOTIFY_TO") || "support@startuplogin.com";

  // Someone joined a "notify me when it launches" list.
  if (payload?.table === "notify_signups") {
    if (!rec.email) return reply(200, { skipped: true, reason: "no email on signup" });
    const section = rec.source === "schemes" ? "Startup Schemes" : (rec.source || "a section");
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Startup Login <notifications@startuplogin.com>",
        to: [to],
        subject: `Notify list: ${rec.startup_name || rec.email} wants ${section}`,
        html: `
          <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#1a1a2e">
            <h3 style="margin:20px 0 8px">New notify-list signup</h3>
            <table style="font-size:14px;border-collapse:collapse">
              <tr><td style="padding:2px 12px 2px 0;color:#666">Email</td><td><b>${rec.email}</b></td></tr>
              ${rec.startup_name ? `<tr><td style="padding:2px 12px 2px 0;color:#666">Startup</td><td>${rec.startup_name}</td></tr>` : ""}
              <tr><td style="padding:2px 12px 2px 0;color:#666">Waiting for</td><td>${section}</td></tr>
            </table>
            <p style="margin:16px 0"><a href="https://startuplogin.com/admin"
              style="display:inline-block;background:#2456f5;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">
              Open the Signups tab</a></p>
            <p style="color:#999;font-size:12px">Sent automatically when someone joins a notify list on startuplogin.com</p>
          </div>`,
      }),
    });
    if (!res.ok) {
      return reply(502, { sent: false, error: "email provider error", detail: await res.text() });
    }
    return reply(200, { sent: true, kind: "signup" });
  }

  // Otherwise: a listing submission.
  if (!rec.name) {
    return reply(200, { skipped: true, reason: "not a listing insert" });
  }
  // Only alert on real public submissions, not bulk imports/syncs (those are 'live').
  if (rec.status !== "pending") {
    return reply(200, { skipped: true, reason: "not a pending submission" });
  }

  const nouns: Record<string, string> = {
    startup: "Startup", vc: "Investor", incubator: "Incubator", event: "Event",
  };
  const kind = nouns[rec.type] ?? "Listing";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Startup Login <notifications@startuplogin.com>",
      to: [to],
      subject: `New submission: ${rec.name} (${kind}${rec.city ? " · " + rec.city : ""})`,
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#1a1a2e">
          <h3 style="margin:20px 0 8px">New ${kind.toLowerCase()} submission</h3>
          <table style="font-size:14px;border-collapse:collapse">
            <tr><td style="padding:2px 12px 2px 0;color:#666">Name</td><td><b>${rec.name}</b></td></tr>
            ${rec.tagline ? `<tr><td style="padding:2px 12px 2px 0;color:#666">One-liner</td><td>${rec.tagline}</td></tr>` : ""}
            ${rec.city ? `<tr><td style="padding:2px 12px 2px 0;color:#666">City</td><td>${rec.city}</td></tr>` : ""}
            ${rec.sector ? `<tr><td style="padding:2px 12px 2px 0;color:#666">Sector</td><td>${rec.sector}</td></tr>` : ""}
            ${rec.website ? `<tr><td style="padding:2px 12px 2px 0;color:#666">Website</td><td><a href="${rec.website}">${rec.website}</a></td></tr>` : ""}
          </table>
          <p style="margin:16px 0"><a href="https://startuplogin.com/admin"
            style="display:inline-block;background:#2456f5;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">
            Review in the admin console</a></p>
          <p style="color:#999;font-size:12px">Sent automatically when a listing is submitted on startuplogin.com</p>
        </div>`,
    }),
  });

  if (!res.ok) {
    return reply(502, { sent: false, error: "email provider error", detail: await res.text() });
  }
  return reply(200, { sent: true });
});
