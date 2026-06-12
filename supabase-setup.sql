-- NoBSFlip full Supabase setup. Run this ONCE in the Supabase SQL editor.
-- Safe to re-run (idempotent). Creates profiles + premium fields + daily scan cap.

-- =========================================================================
-- 1. Profiles table (linked to auth users)
-- =========================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  is_premium boolean NOT NULL DEFAULT false,
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text, -- 'active', 'canceled', 'past_due', etc
  premium_since timestamptz,
  premium_until timestamptz,
  ebay_access_token text,
  ebay_refresh_token text,
  ebay_token_expires_at timestamptz,
  ebay_user_id text,
  display_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- (for databases where profiles already existed without these columns)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text;

-- Auto-create a profile row whenever a user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own profile" ON profiles;
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users update own profile" ON profiles;
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Service role full access" ON profiles;
CREATE POLICY "Service role full access" ON profiles USING (auth.role() = 'service_role');

-- Backfill profiles for any existing users
INSERT INTO profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- 2. Daily free-scan limit (free users capped per day; premium = unlimited)
-- =========================================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS daily_scan_count int NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS scan_count_date date;

-- Atomic check-and-increment. Returns JSON describing the decision.
CREATE OR REPLACE FUNCTION consume_scan(p_user uuid, p_cap int)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_premium boolean;
  v_count   int;
  v_date    date;
  v_today   date := (now() AT TIME ZONE 'UTC')::date;
BEGIN
  SELECT is_premium, daily_scan_count, scan_count_date
    INTO v_premium, v_count, v_date
    FROM profiles
    WHERE id = p_user
    FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('allowed', true, 'premium', false,
      'used', 0, 'limit', p_cap, 'remaining', p_cap, 'noProfile', true);
  END IF;

  IF v_premium THEN
    RETURN jsonb_build_object('allowed', true, 'premium', true);
  END IF;

  IF v_date IS NULL OR v_date < v_today THEN
    v_count := 0;
  END IF;

  IF v_count >= p_cap THEN
    RETURN jsonb_build_object('allowed', false, 'premium', false,
      'used', v_count, 'limit', p_cap, 'remaining', 0);
  END IF;

  v_count := v_count + 1;
  UPDATE profiles
    SET daily_scan_count = v_count, scan_count_date = v_today, updated_at = now()
    WHERE id = p_user;

  RETURN jsonb_build_object('allowed', true, 'premium', false,
    'used', v_count, 'limit', p_cap, 'remaining', p_cap - v_count);
END;
$$;

GRANT EXECUTE ON FUNCTION consume_scan(uuid, int) TO service_role;
GRANT EXECUTE ON FUNCTION consume_scan(uuid, int) TO authenticated;

-- =========================================================================
-- 3. Ensure flip_posts has the columns the app reads/writes
--    (dashboard, fliplog, scan-save, and analytics all need these).
--    Guarded so it does nothing if flip_posts doesn't exist yet.
-- =========================================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name = 'flip_posts') THEN
    ALTER TABLE public.flip_posts ADD COLUMN IF NOT EXISTS user_id uuid;
    ALTER TABLE public.flip_posts ADD COLUMN IF NOT EXISTS actual_sell numeric;
  END IF;
END $$;
