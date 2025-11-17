-- Cart Items Table
CREATE TABLE IF NOT EXISTS public.cart_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id bigint NOT NULL,
  product_title character varying NOT NULL,
  product_price numeric NOT NULL,
  product_discounted_price numeric,
  product_image text,
  quantity integer NOT NULL CHECK (quantity > 0),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT cart_items_pkey PRIMARY KEY (id),
  CONSTRAINT cart_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE,
  CONSTRAINT cart_items_user_product_unique UNIQUE (user_id, product_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own cart items
CREATE POLICY "Users can view own cart items" ON public.cart_items
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own cart items
CREATE POLICY "Users can insert own cart items" ON public.cart_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own cart items
CREATE POLICY "Users can update own cart items" ON public.cart_items
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own cart items
CREATE POLICY "Users can delete own cart items" ON public.cart_items
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS cart_items_user_id_idx ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS cart_items_product_id_idx ON public.cart_items(product_id);
CREATE INDEX IF NOT EXISTS cart_items_user_product_idx ON public.cart_items(user_id, product_id);
