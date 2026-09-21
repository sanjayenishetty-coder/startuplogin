-- Emails support@startuplogin.com whenever someone joins a notify list.
-- Mirrors submission_trigger.sql and reuses the same notify-submission
-- function and WEBHOOK_SECRET. Replace PASTE_YOUR_SECRET_HERE with the
-- same value stored as the WEBHOOK_SECRET Edge Function secret, then run
-- once in the SQL Editor. Safe to re-run.
--
-- Requires notify_signups.sql to have been run first.

create extension if not exists pg_net;

create or replace function public.notify_signup_hook()
returns trigger language plpgsql security definer as $$
begin
  perform net.http_post(
    url := 'https://ofzkkrerikwxpuangqxg.supabase.co/functions/v1/notify-submission',
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'notify_signups',
      'record', to_jsonb(new)
    ),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', 'PASTE_YOUR_SECRET_HERE'
    )
  );
  return new;
end $$;

drop trigger if exists signup_alert on public.notify_signups;
create trigger signup_alert
  after insert on public.notify_signups
  for each row execute function public.notify_signup_hook();
