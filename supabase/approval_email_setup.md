# Approval email — one-time activation

Goal: when you approve a submission in `/admin`, the founder who submitted
it automatically receives a "you're live" email.

The code is already in place and needs nothing from you:

- the submit form on the site stores the founder's email in the private
  `contacts` table (`db.js` → `submit`)
- the Approve button calls `DB.notifyApproved(id)` (`admin.js`)
- `supabase/functions/notify-approved/index.ts` looks the email up and
  sends it through Resend

What is missing is the Supabase/Resend side. Five steps, ~15 minutes.

---

## 1 · Verify startuplogin.com in Resend

The function sends **from `notifications@startuplogin.com`**. Resend will
refuse that address until the domain is verified, so do this first.

Resend dashboard → **Domains** → **Add Domain** → `startuplogin.com` →
region *any*. Resend shows 3 DNS records. Add them in **BigRock → Manage
DNS** for startuplogin.com:

| Type | Host / Name | Value |
|---|---|---|
| TXT  | `send` (or `send.startuplogin.com`) | the SPF value Resend shows (`v=spf1 include:amazonses.com ~all`) |
| MX   | `send` | `feedback-smtp.<region>.amazonses.com`, priority **10** |
| TXT  | `resend._domainkey` | the long DKIM key Resend shows |

Important: these are **additional** records on the `send` subdomain — they
do **not** replace your Google Workspace MX records on the root domain, so
support@startuplogin.com keeps working. Don't touch the existing Google MX
entries.

Back in Resend, click **Verify DNS Records**. It usually turns green in
5–30 minutes. Wait for **Verified** before testing.

## 2 · Deploy the function

Supabase Dashboard → **Edge Functions** → **Deploy a new function** → *Via
Editor*.

- Name it **exactly** `notify-approved` (the admin console calls it by
  this name)
- Delete the sample code, paste the entire contents of
  `supabase/functions/notify-approved/index.ts`
- **Deploy**

Leave **"Enforce JWT verification" ON** for this function. It is called
from the admin console by a signed-in user, and the function additionally
checks that the caller's email is the admin's — two locks, both wanted.
(Only `notify-submission` needs JWT verification off, because a database
trigger calls it with a shared secret instead.)

## 3 · Add the secrets

Edge Functions → **Secrets** (project-wide). Add:

| Name | Value |
|---|---|
| `RESEND_API_KEY` | the Resend API key (use the **rotated** one — the earlier key was pasted into the SQL editor and must stay revoked) |
| `ADMIN_EMAIL` | `support@startuplogin.com` |

`SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are
injected automatically — do not add them yourself.

Secrets are read at invocation, but redeploy the function afterwards if
you added them after step 2.

## 4 · Make sure the admin policies are live

If you have not run it since the schema was last re-applied, run
`supabase/admin_access.sql` once in the **SQL Editor**. It re-keys the
three admin RLS policies to `support@startuplogin.com`. Without it,
approvals silently fail and no email is ever triggered.

## 5 · Test end to end

1. On startuplogin.com → **List your startup**, submit a dummy listing
   with your own personal email in the email field.
2. Sign in at startuplogin.com/admin as support@startuplogin.com.
3. Select the dummy submission → **Approve**.
4. The toast should read **"… is LIVE — founder notified by email"**, and
   the email should arrive within seconds.
5. Delete the dummy listing afterwards (SQL Editor:
   `delete from public.listings where slug = '<the-slug>';`).

---

## Reading the result

The Approve button's toast tells you exactly what happened:

| Toast | Meaning |
|---|---|
| `… is LIVE — founder notified by email` | sent |
| `… is LIVE` (no email clause) | the function returned `sent:false` — the submission had no email address (the field is optional), or the listing was a bulk import |
| `… is LIVE (email notification failed — see console)` | the function errored — open the browser console, then Supabase → Edge Functions → `notify-approved` → **Logs** |

Common log messages:

- `401 not authorized` — `ADMIN_EMAIL` is missing or doesn't match the
  signed-in account exactly
- `502 email provider error` with `domain is not verified` — step 1 isn't
  finished
- `404 listing not found` / `400 listing is not live` — the approve write
  didn't land; run `admin_access.sql` (step 4)

## Note on bulk-imported listings

Listings added by the Sync button or by SQL have no row in `contacts`,
so no email is attempted for them. Only real submissions made through the
site's form trigger the founder email — which is what you want.
