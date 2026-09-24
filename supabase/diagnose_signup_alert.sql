-- Why didn't the signup alert email arrive? Run these four in order.
-- Each one rules out a layer, so stop at the first that looks wrong.

-- 1 · Did the signup reach the table at all?
select id, email, source, created_at
from public.notify_signups
order by created_at desc
limit 10;

-- 2 · Does the trigger exist on that table?
select tgname, tgenabled
from pg_trigger
where tgrelid = 'public.notify_signups'::regclass
  and not tgisinternal;
-- expect one row: signup_alert, tgenabled = 'O'

-- 3 · What did the trigger's HTTP call come back with?
--     This is the decisive one. pg_net records every response here.
select id, status_code, left(content, 300) as body, created
from net._http_response
order by created desc
limit 10;
--   no rows        -> the trigger never fired (or pg_net isn't running)
--   401            -> the secret in the trigger != WEBHOOK_SECRET
--   200 {"sent":true,...}                 -> the email WAS sent; look in spam
--   200 {"skipped":true,"reason":"not a listing insert"}
--                  -> the Edge Function was NOT redeployed with the new code
--   502            -> Resend rejected it; the body says why

-- 4 · What secret is the trigger actually sending?
--     Compare this against Edge Functions -> Secrets -> WEBHOOK_SECRET.
select substring(prosrc from 'x-webhook-secret'',\s*''([^'']+)') as secret_in_trigger
from pg_proc where proname = 'notify_signup_hook';
