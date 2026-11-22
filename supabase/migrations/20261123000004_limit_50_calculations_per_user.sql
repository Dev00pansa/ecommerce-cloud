create or replace function public.enforce_max_calculations_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  select count(*)
  into v_count
  from public.ecommerce_calculations
  where user_id = new.user_id;

  if v_count >= 50 then
    raise exception 'CLOUD_STORAGE_LIMIT_REACHED'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

create trigger on_ecommerce_calculations_limit_50
  before insert on public.ecommerce_calculations
  for each row
  execute function public.enforce_max_calculations_limit();
