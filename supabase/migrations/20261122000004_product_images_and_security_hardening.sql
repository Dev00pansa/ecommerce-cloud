alter table public.ecommerce_calculations
  add column if not exists product_image_url text;

alter table public.ecommerce_calculations
  drop constraint if exists ecommerce_calculations_non_negative_check;

alter table public.ecommerce_calculations
  add constraint ecommerce_calculations_non_negative_check
  check (
    cost_price >= 0
    and packaging_cost >= 0
    and ads_cost >= 0
    and platform_fee_percent >= 0
    and platform_fee_percent <= 100
    and selling_price >= 0
    and fixed_cost >= 0
    and char_length(product_name) <= 120
    and char_length(platform) <= 60
    and (product_image_url is null or char_length(product_image_url) <= 500)
  );

drop policy if exists "Users can update their own ecommerce calculations" on public.ecommerce_calculations;
create policy "Users can update their own ecommerce calculations"
  on public.ecommerce_calculations
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  204800,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can view their own product images" on storage.objects;
create policy "Users can view their own product images"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can upload their own product images" on storage.objects;
create policy "Users can upload their own product images"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can update their own product images" on storage.objects;
create policy "Users can update their own product images"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can delete their own product images" on storage.objects;
create policy "Users can delete their own product images"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

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
begin
  v_username := trim(coalesce(new.raw_user_meta_data ->> 'username', ''));

  if v_username !~ '^[A-Za-z0-9_]{4,20}$' then
    v_username := 'user_' || replace(left(new.id::text, 8), '-', '');
  end if;

  insert into public.profiles (id, username, email)
  values (new.id, v_username, lower(trim(coalesce(new.email, ''))));

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
begin
  v_clean := trim(coalesce(p_username, ''));
  if v_clean !~ '^[A-Za-z0-9_]{4,20}$' then
    return false;
  end if;

  return not exists (
    select 1
    from public.profiles
    where lower(username) = lower(v_clean)
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

revoke all on function public.check_username_available(text) from public;
grant execute on function public.check_username_available(text) to anon, authenticated;

revoke all on function public.get_email_for_login(text) from public;
grant execute on function public.get_email_for_login(text) to anon, authenticated;
