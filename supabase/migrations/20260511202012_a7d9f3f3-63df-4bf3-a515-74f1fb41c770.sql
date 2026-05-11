
-- Live "Analyst Activity" feed for stocks & crypto, posted by admin (manual or AI scanner)
CREATE TABLE IF NOT EXISTS public.stocks_crypto_analyst_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  name text NOT NULL,
  asset_type text NOT NULL CHECK (asset_type IN ('stock','crypto')),
  logo_url text,
  activity_type text NOT NULL DEFAULT 'rating_update', -- rating_update, ai_pick, alert, commentary
  headline text NOT NULL,
  summary text,
  analyst_rating text,
  conviction_score numeric,
  past_performance text,
  future_outlook text,
  catalysts text[],
  risks text[],
  scan_date date DEFAULT CURRENT_DATE,
  source text DEFAULT 'admin', -- admin | ai_scan
  is_promoted boolean DEFAULT true,
  platform text, -- finance | investor | both/null
  metadata jsonb DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sc_activity_created_at ON public.stocks_crypto_analyst_activity (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sc_activity_symbol ON public.stocks_crypto_analyst_activity (symbol);
CREATE INDEX IF NOT EXISTS idx_sc_activity_scan_date ON public.stocks_crypto_analyst_activity (scan_date DESC);

ALTER TABLE public.stocks_crypto_analyst_activity ENABLE ROW LEVEL SECURITY;

-- Read: anyone authenticated can read promoted entries
CREATE POLICY "Authenticated users can view promoted analyst activity"
  ON public.stocks_crypto_analyst_activity FOR SELECT
  TO authenticated
  USING (is_promoted = true);

-- Admin manage
CREATE POLICY "Admins can insert analyst activity"
  ON public.stocks_crypto_analyst_activity FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update analyst activity"
  ON public.stocks_crypto_analyst_activity FOR UPDATE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all analyst activity"
  ON public.stocks_crypto_analyst_activity FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete analyst activity"
  ON public.stocks_crypto_analyst_activity FOR DELETE
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE TRIGGER trg_sc_activity_updated_at
  BEFORE UPDATE ON public.stocks_crypto_analyst_activity
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.stocks_crypto_analyst_activity;
