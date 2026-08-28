-- Please run this in the Supabase SQL Editor to support the new products and variants!
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS product_name TEXT;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS variant TEXT;

-- We can drop the category column from orders since an order now contains multiple different products
ALTER TABLE public.orders DROP COLUMN IF EXISTS category;
DROP TYPE IF EXISTS category_type CASCADE;
