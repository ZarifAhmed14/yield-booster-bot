create table public.farmer_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('scan', 'reminder', 'yield')),
  payload jsonb not null check (jsonb_typeof(payload) = 'object' and octet_length(payload::text) <= 32768),
  created_at timestamptz not null default now()
);
create index farmer_records_owner_kind on public.farmer_records(user_id, kind, created_at desc);
alter table public.farmer_records enable row level security;
revoke all on public.farmer_records from anon;
grant select, insert, update, delete on public.farmer_records to authenticated;
create policy "Read own records" on public.farmer_records for select to authenticated using ((select auth.uid()) = user_id);
create policy "Insert own records" on public.farmer_records for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own records" on public.farmer_records for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Delete own records" on public.farmer_records for delete to authenticated using ((select auth.uid()) = user_id);
