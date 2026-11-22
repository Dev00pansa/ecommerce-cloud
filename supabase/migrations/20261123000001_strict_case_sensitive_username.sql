alter table public.profiles
  drop constraint if exists profiles_username_check;

alter table public.profiles
  drop constraint if exists profiles_username_format_check;

alter table public.profiles
  add constraint profiles_username_format_check
  check (username ~ '^[A-Za-z0-9_]{4,20}$');

create unique index if not exists profiles_username_lower_unique_idx
  on public.profiles (lower(username));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_username text;
  v_email text;
begin
  v_username := trim(coalesce(new.raw_user_meta_data ->> 'username', ''));
  v_email := lower(trim(coalesce(new.email, '')));

  if v_username !~ '^[A-Za-z0-9_]{4,20}$' then
    v_username := 'user_' || replace(left(new.id::text, 8), '-', '');
  end if;

  insert into public.profiles (id, username, email)
  values (new.id, v_username, v_email);

  return new;
end;
$$;

create or replace function public.check_username_available(p_username text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_clean text;
  v_caller uuid;
begin
  v_clean := trim(coalesce(p_username, ''));
  if v_clean !~ '^[A-Za-z0-9_]{4,20}$' then
    return false;
  end if;

  v_caller := auth.uid();

  return not exists (
    select 1
    from public.profiles
    where lower(username) = lower(v_clean)
      and (v_caller is null or id <> v_caller)
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
  v_clean := trim(coalesce(p_identifier, ''));
  if v_clean = '' then
    return null;
  end if;

  if position('@' in v_clean) > 0 then
    select p.email
    into v_email
    from public.profiles as p
    where lower(p.email) = lower(v_clean)
    limit 1;

    return coalesce(v_email, lower(v_clean));
  end if;

  select p.email
  into v_email
  from public.profiles as p
  where p.username = v_clean
  limit 1;

  return v_email;
end;
$$;

grant execute on function public.check_username_available(text) to anon, authenticated;
grant execute on function public.get_email_for_login(text) to anon, authenticated;
