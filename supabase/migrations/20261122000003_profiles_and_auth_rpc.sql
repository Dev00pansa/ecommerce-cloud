drop table if exists public.user_projects cascade;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (username = lower(username) and username ~ '^[a-z0-9_]{4,20}$'),
  email text not null,
  created_at timestamptz not null default now()
);

create index if not exists profiles_username_idx on public.profiles (username);

alter table public.profiles enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_username text;
begin
  v_username := lower(trim(coalesce(new.raw_user_meta_data ->> 'username', '')));

  if v_username !~ '^[a-z0-9_]{4,20}$' then
    v_username := 'user_' || replace(left(new.id::text, 8), '-', '');
  end if;

  insert into public.profiles (id, username, email)
  values (new.id, v_username, lower(trim(coalesce(new.email, ''))));

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

create or replace function public.check_username_available(p_username text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_clean text;
begin
  v_clean := lower(trim(coalesce(p_username, '')));
  if v_clean !~ '^[a-z0-9_]{4,20}$' then
    return false;
  end if;

  return not exists (
    select 1
    from public.profiles
    where username = v_clean
  );
end;
$$;

create or replace function public.get_email_for_login(p_identifier text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_clean text;
  v_email text;
begin
  v_clean := lower(trim(coalesce(p_identifier, '')));
  if v_clean = '' then
    return null;
  end if;

  if position('@' in v_clean) > 0 then
    return v_clean;
  end if;

  select p.email
  into v_email
  from public.profiles as p
  where p.username = v_clean
  limit 1;

  return v_email;
end;
$$;

revoke all on function public.check_username_available(text) from public;
grant execute on function public.check_username_available(text) to anon, authenticated;

revoke all on function public.get_email_for_login(text) from public;
grant execute on function public.get_email_for_login(text) to anon, authenticated;
