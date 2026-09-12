// Sends the "you're live" email to a founder when their listing is approved.
// Called by the admin console after a successful approve; the caller must be
// signed in as the admin account.
//
// Secrets required (Supabase Dashboard -> Edge Functions -> notify-approved -> Secrets):
//   RESEND_API_KEY  - API key from resend.com
//   ADMIN_EMAIL     - the admin account email (support@startuplogin.com)
// SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY are provided
// automatically by the Edge runtime.

import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

  // Only the signed-in admin may trigger notifications.
  const authHeader = req.headers.get("Authorization") ?? "";
  const anon = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: { user } } = await anon.auth.getUser();
  const adminEmail = Deno.env.get("ADMIN_EMAIL") ?? "";
  if (!user || !adminEmail || user.email?.toLowerCase() !== adminEmail.toLowerCase()) {
    return reply(401, { error: "not authorized" });
  }

  const { id } = await req.json().catch(() => ({}));
  if (!id) return reply(400, { error: "missing listing id" });

  const svc = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { data: listing } = await svc
    .from("listings").select("name, slug, type, status").eq("id", id).single();
  if (!listing) return reply(404, { error: "listing not found" });
  if (listing.status !== "live") return reply(400, { error: "listing is not live" });

  const { data: contact } = await svc
    .from("contacts").select("email").eq("listing_id", id).maybeSingle();
  if (!contact?.email) return reply(200, { sent: false, reason: "no contact email" });

  const nouns: Record<string, string> = {
    startup: "startup", vc: "investor profile",
    incubator: "incubator", event: "event",
  };
  const noun = nouns[listing.type] ?? "listing";
  const url = `https://startuplogin.com/#/startup/${listing.slug}`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Startup Login <notifications@startuplogin.com>",
      to: [contact.email],
      subject: `${listing.name} is now live on Startup Login`,
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;color:#1a1a2e">
          <h2 style="margin:24px 0 8px">You're live. 🎉</h2>
          <p>Good news — your ${noun} <b>${listing.name}</b> has been approved and is
          now listed on <a href="https://startuplogin.com">Startup Login</a>, the
          discovery platform for Indian startups.</p>
          <p><a href="${url}" style="display:inline-block;background:#2456f5;color:#fff;
          padding:10px 18px;border-radius:8px;text-decoration:none">View your listing</a></p>
          <p style="color:#666;font-size:13px">Spotted something to correct? Just reply
          to this email and we'll fix it.</p>
          <p style="color:#999;font-size:12px">— Team Startup Login · startuplogin.com</p>
        </div>`,
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    return reply(502, { sent: false, error: "email provider error", detail });
  }
  return reply(200, { sent: true, to: contact.email });
});
