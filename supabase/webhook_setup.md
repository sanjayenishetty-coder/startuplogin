# Submission alert email — one-time setup

Sends an email to support@startuplogin.com every time someone submits a
listing on the site. Two pieces: the `notify-submission` Edge Function
(sends the email) and a Database Webhook (fires the function on every
new submission row).

## 1. Deploy the function

Supabase Dashboard → **Edge Functions** → Deploy a new function → *Via
Editor* → name it exactly `notify-submission` → paste the contents of
`supabase/functions/notify-submission/index.ts` → Deploy.

Then open the function's settings and **turn OFF "Enforce JWT
verification"** (the webhook authenticates with a shared secret
instead — the function rejects any call without it).

## 2. Add secrets

Edge Functions → **Secrets** (project-wide; RESEND_API_KEY is already
there from notify-approved). Add:

- `WEBHOOK_SECRET` — any long random string (e.g. from a password
  generator). You'll paste the same value in step 3.
- `NOTIFY_TO` — `support@startuplogin.com` (optional; this is the default)

## 3. Create the webhook

Dashboard → **Database → Webhooks** → Create a new hook:

- Name: `submission-alert`
- Table: `public.listings`
- Events: **INSERT** only
- Type: HTTP Request, Method POST
- URL: `https://ofzkkrerikwxpuangqxg.supabase.co/functions/v1/notify-submission`
- HTTP Headers: add `x-webhook-secret` = the same value as WEBHOOK_SECRET

Save.

## 4. Test

Submit a dummy listing on startuplogin.com — an email titled
"New submission: …" should reach support@startuplogin.com within
seconds. (Bulk imports and the admin Sync button insert rows with
status 'live', which the function deliberately ignores — you are only
alerted for real public submissions.)
