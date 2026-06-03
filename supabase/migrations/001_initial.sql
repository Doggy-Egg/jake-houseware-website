-- JAKE HOUSEWARE — initial schema
-- products use collection_slugs text[] (no product_collections junction table)

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------

CREATE TABLE public.categories (
  slug text PRIMARY KEY,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER categories_set_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- sub_categories
-- ---------------------------------------------------------------------------

CREATE TABLE public.sub_categories (
  slug text PRIMARY KEY,
  name text NOT NULL,
  category_slug text NOT NULL REFERENCES public.categories (slug)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX sub_categories_category_slug_idx
  ON public.sub_categories (category_slug);

CREATE TRIGGER sub_categories_set_updated_at
  BEFORE UPDATE ON public.sub_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- collections
-- ---------------------------------------------------------------------------

CREATE TABLE public.collections (
  slug text PRIMARY KEY,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER collections_set_updated_at
  BEFORE UPDATE ON public.collections
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------

CREATE TABLE public.products (
  id text PRIMARY KEY,
  slug text NOT NULL,
  item_no text NOT NULL,
  name text NOT NULL,
  description text,
  category_slug text NOT NULL REFERENCES public.categories (slug)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  sub_category_slug text REFERENCES public.sub_categories (slug)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  collection_slugs text[] NOT NULL DEFAULT '{}',
  images text[] NOT NULL DEFAULT '{}',
  thumbnail text,
  material text,
  dimensions text,
  moq integer,
  packaging text,
  lead_time text,
  keywords text[],
  weight text,
  carton_size text,
  qty_per_carton integer,
  cbm numeric(10, 4),
  factory text,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'inactive')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX products_slug_idx ON public.products (slug);
CREATE UNIQUE INDEX products_item_no_lower_idx ON public.products (lower(trim(item_no)));
CREATE INDEX products_category_slug_idx ON public.products (category_slug);
CREATE INDEX products_status_idx ON public.products (status);
CREATE INDEX products_collection_slugs_gin_idx ON public.products USING gin (collection_slugs);

CREATE TRIGGER products_set_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_categories"
  ON public.categories
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "public_read_sub_categories"
  ON public.sub_categories
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "public_read_collections"
  ON public.collections
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "public_read_active_products"
  ON public.products
  FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

-- Writes go through Next.js API using service_role (bypasses RLS).

-- ---------------------------------------------------------------------------
-- Data API grants (required on newer Supabase projects)
-- ---------------------------------------------------------------------------

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT ON TABLE public.categories TO anon, authenticated;
GRANT SELECT ON TABLE public.sub_categories TO anon, authenticated;
GRANT SELECT ON TABLE public.collections TO anon, authenticated;
GRANT SELECT ON TABLE public.products TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.categories TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.sub_categories TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.collections TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.products TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO service_role;

-- ---------------------------------------------------------------------------
-- Storage: product-images bucket
-- ---------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "product_images_public_read"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

CREATE POLICY "product_images_service_insert"
  ON storage.objects
  FOR INSERT
  TO service_role
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "product_images_service_update"
  ON storage.objects
  FOR UPDATE
  TO service_role
  USING (bucket_id = 'product-images')
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "product_images_service_delete"
  ON storage.objects
  FOR DELETE
  TO service_role
  USING (bucket_id = 'product-images');

-- ---------------------------------------------------------------------------
-- Verification (run separately after migration succeeds)
-- ---------------------------------------------------------------------------
--
-- SELECT table_name
-- FROM information_schema.tables
-- WHERE table_schema = 'public'
--   AND table_name IN ('categories', 'sub_categories', 'collections', 'products')
-- ORDER BY table_name;
--
-- SELECT id, name, public, file_size_limit
-- FROM storage.buckets
-- WHERE id = 'product-images';
