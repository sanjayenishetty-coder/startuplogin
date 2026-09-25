// Emails the admin whenever a new listing is submitted on the site.
// For a notify-list signup it also emails the person who signed up, so
// they have a record of it and know the sender before the launch email.
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

  // Someone joined a "notify me when it launches" list. Two emails go out:
  // the alert to the admin, and a confirmation to the person who signed up.
  // They are sent independently — a failure on one must not swallow the other.
  if (payload?.table === "notify_signups") {
    if (!rec.email) return reply(200, { skipped: true, reason: "no email on signup" });
    const section = rec.source === "schemes" ? "Startup Schemes" : (rec.source || "a section");
    const who = rec.startup_name ? String(rec.startup_name) : "";

    const send = (body: Record<string, unknown>) =>
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

    const alert = send({
      from: "Startup Login <notifications@startuplogin.com>",
      to: [to],
      subject: `Notify list: ${who || rec.email} wants ${section}`,
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#1a1a2e">
          <h3 style="margin:20px 0 8px">New notify-list signup</h3>
          <table style="font-size:14px;border-collapse:collapse">
            <tr><td style="padding:2px 12px 2px 0;color:#666">Email</td><td><b>${rec.email}</b></td></tr>
            ${who ? `<tr><td style="padding:2px 12px 2px 0;color:#666">Startup</td><td>${who}</td></tr>` : ""}
            <tr><td style="padding:2px 12px 2px 0;color:#666">Waiting for</td><td>${section}</td></tr>
          </table>
          <p style="margin:16px 0"><a href="https://startuplogin.com/admin"
            style="display:inline-block;background:#2456f5;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">
            Open the Signups tab</a></p>
          <p style="color:#999;font-size:12px">Sent automatically when someone joins a notify list on startuplogin.com</p>
        </div>`,
    });

    const confirm = send({
      from: "Startup Login <notifications@startuplogin.com>",
      to: [rec.email],
      reply_to: "support@startuplogin.com",
      subject: `You're on the list — ${section}`,
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#1a1a2e">
          <h2 style="margin:24px 0 8px">You're on the list.</h2>
          <p>Thanks${who ? `, ${who}` : ""} — we'll email you the day <b>${section}</b> goes
          live on <a href="https://startuplogin.com">Startup Login</a>.</p>
          <p style="color:#444">It will cover every government scheme an Indian startup can
          actually use — central and state. Grants, seed funds, interest subsidies, patent and
          certification reimbursements, incubation support and tax benefits, with who qualifies,
          what you get and where to apply.</p>
          <p>In the meantime the registry is already live and free to browse: Indian startups,
          investors, incubators and accelerators across 42 cities.</p>
          <p><a href="https://startuplogin.com" style="display:inline-block;background:#2456f5;
          color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Browse the registry</a></p>
          <p style="color:#666;font-size:13px">Not expecting this email? Someone entered this
          address on our site. Ignore it and we won't write again.</p>
          <p style="color:#999;font-size:12px">— Team Startup Login · startuplogin.com</p>
        </div>`,
    });

    const [alertRes, confirmRes] = await Promise.allSettled([alert, confirm]);
    const ok = (r: PromiseSettledResult<Response>) =>
      r.status === "fulfilled" && r.value.ok;
    const why = async (r: PromiseSettledResult<Response>) =>
      r.status === "rejected" ? String(r.reason) : await r.value.text();

    if (!ok(alertRes) && !ok(confirmRes)) {
      return reply(502, {
        sent: false, kind: "signup",
        alertError: await why(alertRes), confirmError: await why(confirmRes),
      });
    }
    return reply(200, {
      sent: true, kind: "signup",
      alert: ok(alertRes), confirmation: ok(confirmRes),
      ...(ok(alertRes) ? {} : { alertError: await why(alertRes) }),
      ...(ok(confirmRes) ? {} : { confirmError: await why(confirmRes) }),
    });
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
