-- Enterprise add-on: analyst portfolio reviews for FlowPulse Investor.
-- Users with the 'portfolio_review' add-on upload holdings and objectives;
-- FlowPulse analysts (admins) review, optionally starting from an AI draft,
-- and deliver a written review.

-- ── Add-on entitlements (reusable for future enterprise add-ons) ──────────
CREATE TABLE IF NOT EXISTS public.enterprise_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  addon text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  reviews_included integer,            -- null = unlimited
  expires_at timestamptz,
  notes text,
  granted_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, addon)
);

REVOKE ALL ON public.enterprise_addons FROM anon, authenticated;
GRANT SELECT ON public.enterprise_addons TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.enterprise_addons TO authenticated;
GRANT ALL ON public.enterprise_addons TO service_role;

ALTER TABLE public.enterprise_addons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own add-ons" ON public.enterprise_addons;
CREATE POLICY "Users read own add-ons" ON public.enterprise_addons FOR SELECT
  USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin(auth.uid())));

DROP POLICY IF EXISTS "Admins manage add-ons" ON public.enterprise_addons;
CREATE POLICY "Admins manage add-ons" ON public.enterprise_addons FOR ALL
  USING ((SELECT public.is_admin(auth.uid())))
  WITH CHECK ((SELECT public.is_admin(auth.uid())));

CREATE OR REPLACE FUNCTION public.has_addon(_user_id uuid, _addon text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.enterprise_addons a
    WHERE a.user_id = _user_id AND a.addon = _addon AND a.status = 'active'
      AND (a.expires_at IS NULL OR a.expires_at > now())
  );
$$;

REVOKE ALL ON FUNCTION public.has_addon(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_addon(uuid, text) TO authenticated, service_role;

-- ── Review requests (what the client sees) ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.portfolio_review_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  title text NOT NULL,
  status text NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted', 'in_review', 'delivered', 'cancelled')),
  objectives text,
  risk_profile text CHECK (risk_profile IN ('cautious', 'balanced', 'growth', 'adventurous')),
  time_horizon text,
  income_need text,
  constraints text,
  base_currency text NOT NULL DEFAULT 'GBP',
  holdings jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_value numeric,
  source_file_name text,
  assigned_to uuid,
  analyst_name text,
  review jsonb,                         -- delivered review (sections, metrics)
  delivered_at timestamptz,
  user_rating integer CHECK (user_rating BETWEEN 1 AND 5),
  user_feedback text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS portfolio_review_requests_user_idx ON public.portfolio_review_requests (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS portfolio_review_requests_status_idx ON public.portfolio_review_requests (status, created_at);

REVOKE ALL ON public.portfolio_review_requests FROM anon, authenticated;
GRANT SELECT, INSERT ON public.portfolio_review_requests TO authenticated;
GRANT UPDATE, DELETE ON public.portfolio_review_requests TO authenticated;
GRANT ALL ON public.portfolio_review_requests TO service_role;

ALTER TABLE public.portfolio_review_requests ENABLE ROW LEVEL SECURITY;

-- Active add-on and, when the add-on has a review allowance, allowance left.
CREATE OR REPLACE FUNCTION public.can_request_portfolio_review(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.enterprise_addons a
    WHERE a.user_id = _user_id AND a.addon = 'portfolio_review' AND a.status = 'active'
      AND (a.expires_at IS NULL OR a.expires_at > now())
      AND (a.reviews_included IS NULL OR a.reviews_included > (
        SELECT count(*) FROM public.portfolio_review_requests r
        WHERE r.user_id = _user_id AND r.status <> 'cancelled'
      ))
  );
$$;

REVOKE ALL ON FUNCTION public.can_request_portfolio_review(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_request_portfolio_review(uuid) TO authenticated, service_role;

DROP POLICY IF EXISTS "Clients read own reviews" ON public.portfolio_review_requests;
CREATE POLICY "Clients read own reviews" ON public.portfolio_review_requests FOR SELECT
  USING (user_id = (SELECT auth.uid()) OR (SELECT public.is_admin(auth.uid())));

-- Only entitled users can submit, and only as themselves, as a new request.
DROP POLICY IF EXISTS "Entitled clients submit reviews" ON public.portfolio_review_requests;
CREATE POLICY "Entitled clients submit reviews" ON public.portfolio_review_requests FOR INSERT
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND status = 'submitted'
    AND review IS NULL
    AND (SELECT public.can_request_portfolio_review(auth.uid()))
  );

DROP POLICY IF EXISTS "Admins manage reviews" ON public.portfolio_review_requests;
CREATE POLICY "Admins manage reviews" ON public.portfolio_review_requests FOR ALL
  USING ((SELECT public.is_admin(auth.uid())))
  WITH CHECK ((SELECT public.is_admin(auth.uid())));

-- Clients change their own requests only through these functions.
CREATE OR REPLACE FUNCTION public.cancel_portfolio_review(_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH u AS (
    UPDATE public.portfolio_review_requests
    SET status = 'cancelled', updated_at = now()
    WHERE id = _id AND user_id = auth.uid() AND status = 'submitted'
    RETURNING 1
  )
  SELECT EXISTS (SELECT 1 FROM u);
$$;

CREATE OR REPLACE FUNCTION public.rate_portfolio_review(_id uuid, _rating integer, _feedback text DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH u AS (
    UPDATE public.portfolio_review_requests
    SET user_rating = greatest(1, least(5, _rating)), user_feedback = left(_feedback, 2000), updated_at = now()
    WHERE id = _id AND user_id = auth.uid() AND status = 'delivered'
    RETURNING 1
  )
  SELECT EXISTS (SELECT 1 FROM u);
$$;

REVOKE ALL ON FUNCTION public.cancel_portfolio_review(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.rate_portfolio_review(uuid, integer, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cancel_portfolio_review(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.rate_portfolio_review(uuid, integer, text) TO authenticated;

-- ── Analyst working draft (never visible to the client) ──────────────────
CREATE TABLE IF NOT EXISTS public.portfolio_review_drafts (
  request_id uuid PRIMARY KEY REFERENCES public.portfolio_review_requests(id) ON DELETE CASCADE,
  analytics jsonb,
  ai_draft jsonb,
  working jsonb,
  internal_notes text,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);

REVOKE ALL ON public.portfolio_review_drafts FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_review_drafts TO authenticated;
GRANT ALL ON public.portfolio_review_drafts TO service_role;

ALTER TABLE public.portfolio_review_drafts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage review drafts" ON public.portfolio_review_drafts;
CREATE POLICY "Admins manage review drafts" ON public.portfolio_review_drafts FOR ALL
  USING ((SELECT public.is_admin(auth.uid())))
  WITH CHECK ((SELECT public.is_admin(auth.uid())));

-- ── Messages between client and analyst ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.portfolio_review_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.portfolio_review_requests(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL DEFAULT auth.uid(),
  sender_role text NOT NULL CHECK (sender_role IN ('client', 'analyst')),
  body text NOT NULL CHECK (length(body) BETWEEN 1 AND 4000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS portfolio_review_messages_request_idx ON public.portfolio_review_messages (request_id, created_at);

REVOKE ALL ON public.portfolio_review_messages FROM anon, authenticated;
GRANT SELECT, INSERT ON public.portfolio_review_messages TO authenticated;
GRANT ALL ON public.portfolio_review_messages TO service_role;

ALTER TABLE public.portfolio_review_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants read review messages" ON public.portfolio_review_messages;
CREATE POLICY "Participants read review messages" ON public.portfolio_review_messages FOR SELECT
  USING (
    (SELECT public.is_admin(auth.uid()))
    OR EXISTS (SELECT 1 FROM public.portfolio_review_requests r WHERE r.id = request_id AND r.user_id = (SELECT auth.uid()))
  );

DROP POLICY IF EXISTS "Clients message on own reviews" ON public.portfolio_review_messages;
CREATE POLICY "Clients message on own reviews" ON public.portfolio_review_messages FOR INSERT
  WITH CHECK (
    sender_id = (SELECT auth.uid()) AND sender_role = 'client'
    AND EXISTS (SELECT 1 FROM public.portfolio_review_requests r
                WHERE r.id = request_id AND r.user_id = (SELECT auth.uid()) AND r.status <> 'cancelled')
  );

DROP POLICY IF EXISTS "Analysts message on reviews" ON public.portfolio_review_messages;
CREATE POLICY "Analysts message on reviews" ON public.portfolio_review_messages FOR INSERT
  WITH CHECK (sender_id = (SELECT auth.uid()) AND sender_role = 'analyst' AND (SELECT public.is_admin(auth.uid())));
