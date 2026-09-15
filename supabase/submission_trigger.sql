-- Fires the notify-submission Edge Function for every new public
-- submission (status 'pending'). Replaces the dashboard Database
-- Webhook, which requires the supabase_functions schema that this
-- project lacks. Replace PASTE_YOUR_SECRET_HERE with the same value
-- stored as the WEBHOOK_SECRET Edge Function secret, then run once
-- in the SQL Editor. Safe to re-run.

create extension if not exists pg_net;

create or replace function public.notify_submission_hook()
returns trigger language plpgsql security definer as $$
begin
  if new.status = 'pending' then
    perform net.http_post(
      url := 'https://ofzkkrerikwxpuangqxg.supabase.co/functions/v1/notify-submission',
      body := jsonb_build_object('type', 'INSERT', 'record', to_jsonb(new)),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-webhook-secret', 'PASTE_YOUR_SECRET_HERE'
      )
    );
  end if;
  return new;
end $$;

drop trigger if exists submission_alert on public.listings;
create trigger submission_alert
  after insert on public.listings
  for each row execute function public.notify_submission_hook();
