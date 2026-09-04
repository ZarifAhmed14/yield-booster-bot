create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique check (length(endpoint) <= 2048 and endpoint ~ '^https://(fcm\.googleapis\.com|updates\.push\.services\.mozilla\.com|web\.push\.apple\.com)/'),
  p256dh text not null check (p256dh ~ '^[A-Za-z0-9_-]{87,88}$'),
  auth text not null check (auth ~ '^[A-Za-z0-9_-]{22,24}$'),
  language text not null default 'bn' check (language in ('bn','en')),
  created_at timestamptz not null default now()
);
create index push_subscriptions_owner on public.push_subscriptions(user_id);
alter table public.push_subscriptions enable row level security;
revoke all on public.push_subscriptions from anon, authenticated;
grant select, insert, update, delete on public.push_subscriptions to authenticated;
create policy "Own push subscriptions" on public.push_subscriptions for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);

create table public.treatment_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 120),
  due_at timestamptz not null,
  completed boolean not null default false,
  notified_at timestamptz,
  attempts integer not null default 0,
  next_attempt_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index treatment_reminders_owner on public.treatment_reminders(user_id, due_at);
create index treatment_reminders_due on public.treatment_reminders(due_at, next_attempt_at) where not completed and notified_at is null;
alter table public.treatment_reminders enable row level security;
revoke all on public.treatment_reminders from anon, authenticated;
grant select, delete on public.treatment_reminders to authenticated;
grant insert(id,user_id,title,due_at,completed), update(title,due_at,completed) on public.treatment_reminders to authenticated;
create policy "Own treatment reminders" on public.treatment_reminders for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);

create table public.push_public_config (id boolean primary key default true check(id), public_key text not null);
alter table public.push_public_config enable row level security;
revoke all on public.push_public_config from anon, authenticated;
grant select on public.push_public_config to authenticated;
create policy "Read push public key" on public.push_public_config for select to authenticated using(true);

-- Only the background worker may read its narrowly scoped secrets or claim jobs.
create function public.push_worker_config() returns jsonb language sql security definer set search_path='' as $$
  select jsonb_object_agg(name, decrypted_secret) from vault.decrypted_secrets
  where name in ('alusathi_push_private','alusathi_push_cron');
$$;
revoke all on function public.push_worker_config() from public, anon, authenticated;
grant execute on function public.push_worker_config() to service_role;

create function public.claim_due_reminders() returns setof public.treatment_reminders language sql security invoker set search_path='' as $$
  update public.treatment_reminders set attempts=attempts+1, next_attempt_at=now()+interval '5 minutes'
  where id in (select id from public.treatment_reminders where due_at<=now() and due_at>now()-interval '24 hours'
    and next_attempt_at<=now() and notified_at is null and not completed and attempts<12
    order by due_at for update skip locked limit 50)
  returning *;
$$;
revoke all on function public.claim_due_reminders() from public, anon, authenticated;
grant execute on function public.claim_due_reminders() to service_role;
