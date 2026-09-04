select cron.schedule('alusathi-treatment-reminders', '* * * * *', $$
  select net.http_post(
    url := 'https://wztcmrrraglfzuszxgtf.supabase.co/functions/v1/send-reminders',
    headers := jsonb_build_object('Content-Type','application/json','x-cron-secret',
      (select decrypted_secret from vault.decrypted_secrets where name='alusathi_push_cron')),
    body := '{}'::jsonb, timeout_milliseconds := 50000
  ) where exists (select 1 from public.treatment_reminders
    where due_at<=now() and due_at>now()-interval '24 hours'
    and next_attempt_at<=now() and notified_at is null and not completed and attempts<12);
$$);
