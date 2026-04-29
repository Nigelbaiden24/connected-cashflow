-- DM Finder: searches, contacts, sources

CREATE TABLE public.dm_finder_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  full_name TEXT,
  job_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  location TEXT,
  sector TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error TEXT,
  results_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE public.dm_finder_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_id UUID NOT NULL REFERENCES public.dm_finder_searches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  full_name TEXT,
  role TEXT,
  company TEXT,
  email TEXT,
  email_confidence TEXT CHECK (email_confidence IN ('high','medium','low')),
  email_source_url TEXT,
  phone TEXT,
  phone_confidence TEXT CHECK (phone_confidence IN ('high','medium','low')),
  phone_source_url TEXT,
  linkedin_url TEXT,
  notes TEXT,
  relevance_tag TEXT,
  is_inferred BOOLEAN NOT NULL DEFAULT false,
  saved_to_crm BOOLEAN NOT NULL DEFAULT false,
  opted_out BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.dm_finder_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_id UUID NOT NULL REFERENCES public.dm_finder_searches(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  source_type TEXT,
  scraped_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  excerpt TEXT
);

CREATE INDEX idx_dm_finder_searches_user ON public.dm_finder_searches(user_id, created_at DESC);
CREATE INDEX idx_dm_finder_contacts_search ON public.dm_finder_contacts(search_id);
CREATE INDEX idx_dm_finder_sources_search ON public.dm_finder_sources(search_id);

ALTER TABLE public.dm_finder_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dm_finder_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dm_finder_sources ENABLE ROW LEVEL SECURITY;

-- Admin-only access (DM Finder is an admin tool)
CREATE POLICY "Admins manage dm_finder_searches"
  ON public.dm_finder_searches FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()) AND user_id = auth.uid());

CREATE POLICY "Admins manage dm_finder_contacts"
  ON public.dm_finder_contacts FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()) AND user_id = auth.uid());

CREATE POLICY "Admins manage dm_finder_sources"
  ON public.dm_finder_sources FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));