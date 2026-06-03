-- Fix: new Supabase projects no longer auto-grant Data API access to new tables.
-- Run this in SQL Editor after 001_initial.sql if seed fails with
-- "permission denied for table categories".

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT ON TABLE public.categories TO anon, authenticated;
GRANT SELECT ON TABLE public.sub_categories TO anon, authenticated;
GRANT SELECT ON TABLE public.collections TO anon, authenticated;
GRANT SELECT ON TABLE public.products TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.categories TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.sub_categories TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.collections TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.products TO service_role;

-- Future tables in public schema (optional convenience)
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO service_role;
