create table if not exists public.user_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  created_at timestamptz not null default now()
);

create index if not exists user_projects_user_id_created_at_idx
  on public.user_projects (user_id, created_at desc);

alter table public.user_projects enable row level security;

drop policy if exists "Users can view their own projects" on public.user_projects;
create policy "Users can view their own projects"
  on public.user_projects
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own projects" on public.user_projects;
create policy "Users can insert their own projects"
  on public.user_projects
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own projects" on public.user_projects;
create policy "Users can delete their own projects"
  on public.user_projects
  for delete
  to authenticated
  using (auth.uid() = user_id);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'user_projects'
  ) then
    alter publication supabase_realtime add table public.user_projects;
  end if;
end
$$;
