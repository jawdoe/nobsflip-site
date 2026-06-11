-- Daily free-scan limit. Run this in your Supabase SQL editor.
-- Free users get a capped number of scans per day; premium = unlimited.

-- Per-user daily counter on profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS daily_scan_count int NOT NULL DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS scan_count_date date;

-- Atomic check-and-increment. Returns JSON describing the decision.
-- premium users are always allowed and never counted.
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

  -- No profile row yet: allow (the signup trigger normally creates one).
  IF NOT FOUND THEN
    RETURN jsonb_build_object('allowed', true, 'premium', false,
      'used', 0, 'limit', p_cap, 'remaining', p_cap, 'noProfile', true);
  END IF;

  IF v_premium THEN
    RETURN jsonb_build_object('allowed', true, 'premium', true);
  END IF;

  -- New day resets the counter.
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
