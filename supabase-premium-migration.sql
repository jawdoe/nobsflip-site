-- Run this in your Supabase SQL editor

-- Profiles table (linked to auth users)
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
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Auto-create profile when user signs up
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
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
-- Service role can do everything (for webhook updates)
CREATE POLICY "Service role full access" ON profiles USING (auth.role() = 'service_role');

-- Insert profile for any existing users who don't have one yet
INSERT INTO profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;
