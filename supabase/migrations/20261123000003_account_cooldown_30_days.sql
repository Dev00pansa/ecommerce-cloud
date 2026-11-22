alter table public.profiles
  add column if not exists username_updated_at timestamptz;

alter table public.profiles
  add column if not exists password_updated_at timestamptz;

create or replace function public.enforce_account_update_cooldown()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.username is distinct from old.username then
    if old.username_updated_at is not null
       and old.username_updated_at > (now() - interval '30 days') then
      raise exception 'USERNAME_COOLDOWN_ACTIVE'
        using errcode = 'P0001';
    end if;
    new.username_updated_at := now();
  else
    new.username_updated_at := old.username_updated_at;
  end if;

  if new.password_updated_at is distinct from old.password_updated_at then
    if old.password_updated_at is not null
       and old.password_updated_at > (now() - interval '30 days') then
      raise exception 'PASSWORD_COOLDOWN_ACTIVE'
        using errcode = 'P0001';
    end if;
    new.password_updated_at := now();
  end if;

  return new;
end;
$$;

create trigger on_profiles_enforce_cooldown
  before update on public.profiles
  for each row
  execute function public.enforce_account_update_cooldown();
