
CREATE TABLE public.company_finder_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  sector text NOT NULL,
  sub_criteria text,
  location text,
  brief text,
  status text NOT NULL DEFAULT 'pending',
  results_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE public.company_finder_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  search_id uuid NOT NULL REFERENCES public.company_finder_searches(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  company_name text NOT NULL,
  website text,
  country text,
  sector text,
  tier text,
  role text,
  description text,
  key_signals text,
  source_url text,
  confidence text,
  relevance_tag text,
  saved_to_crm boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.company_finder_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_finder_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage company finder searches"
  ON public.company_finder_searches FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins manage company finder results"
  ON public.company_finder_results FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

CREATE INDEX idx_company_finder_results_search ON public.company_finder_results(search_id);
CREATE INDEX idx_company_finder_searches_user ON public.company_finder_searches(user_id, created_at DESC);
