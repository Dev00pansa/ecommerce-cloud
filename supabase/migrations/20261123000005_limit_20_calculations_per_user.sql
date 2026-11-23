create or replace function public.enforce_max_calculations_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  perform pg_advisory_xact_lock(hashtext(new.user_id::text));

  select count(*)
  into v_count
  from public.ecommerce_calculations
  where user_id = new.user_id;

  if v_count >= 20 then
    raise exception 'CLOUD_STORAGE_LIMIT_REACHED'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;
