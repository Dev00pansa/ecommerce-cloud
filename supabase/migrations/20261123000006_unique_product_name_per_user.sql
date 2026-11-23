create unique index if not exists ecommerce_calculations_user_product_name_unique_idx
  on public.ecommerce_calculations (user_id, lower(btrim(product_name)))
  where btrim(product_name) <> '';
