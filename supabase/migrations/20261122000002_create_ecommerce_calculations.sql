create table if not exists public.ecommerce_calculations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_name text not null,
  platform text not null,
  cost_price numeric not null default 0,
  packaging_cost numeric not null default 0,
  ads_cost numeric not null default 0,
  platform_fee_percent numeric not null default 0,
  selling_price numeric not null default 0,
  fixed_cost numeric not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists ecommerce_calculations_user_id_created_at_idx
  on public.ecommerce_calculations (user_id, created_at desc);

alter table public.ecommerce_calculations enable row level security;

drop policy if exists "Users can view their own ecommerce calculations" on public.ecommerce_calculations;
create policy "Users can view their own ecommerce calculations"
  on public.ecommerce_calculations
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own ecommerce calculations" on public.ecommerce_calculations;
create policy "Users can insert their own ecommerce calculations"
  on public.ecommerce_calculations
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own ecommerce calculations" on public.ecommerce_calculations;
create policy "Users can delete their own ecommerce calculations"
  on public.ecommerce_calculations
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'ecommerce_calculations'
  ) then
    alter publication supabase_realtime add table public.ecommerce_calculations;
  end if;
end
$$;
