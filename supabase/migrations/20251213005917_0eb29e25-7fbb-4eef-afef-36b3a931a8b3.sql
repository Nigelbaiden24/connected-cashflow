-- Create table for storing scraped Companies House data
CREATE TABLE public.companies_house_scrapes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  search_query TEXT NOT NULL,
  search_type TEXT NOT NULL CHECK (search_type IN ('company_name', 'company_number', 'officer_name')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  total_pages_scraped INTEGER DEFAULT 0,
  total_records_found INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create table for scraped company data
CREATE TABLE public.scraped_companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scrape_id UUID REFERENCES public.companies_house_scrapes(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_number TEXT NOT NULL,
  company_status TEXT,
  sic_codes TEXT[],
  incorporation_date DATE,
  registered_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(scrape_id, company_number)
);

-- Create table for scraped officers/directors
CREATE TABLE public.scraped_officers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scrape_id UUID REFERENCES public.companies_house_scrapes(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.scraped_companies(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  officer_role TEXT NOT NULL,
  date_of_birth_month INTEGER,
  date_of_birth_year INTEGER,
  nationality TEXT,
  correspondence_address TEXT,
  appointed_date DATE,
  resigned_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(scrape_id, full_name, company_id)
);

-- Enable RLS
ALTER TABLE public.companies_house_scrapes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraped_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraped_officers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies_house_scrapes
CREATE POLICY "Users can view their own scrapes"
  ON public.companies_house_scrapes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scrapes"
  ON public.companies_house_scrapes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scrapes"
  ON public.companies_house_scrapes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scrapes"
  ON public.companies_house_scrapes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for scraped_companies
CREATE POLICY "Users can view companies from their scrapes"
  ON public.scraped_companies FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.companies_house_scrapes 
    WHERE id = scrape_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can insert companies from their scrapes"
  ON public.scraped_companies FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.companies_house_scrapes 
    WHERE id = scrape_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete companies from their scrapes"
  ON public.scraped_companies FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.companies_house_scrapes 
    WHERE id = scrape_id AND user_id = auth.uid()
  ));

-- RLS Policies for scraped_officers
CREATE POLICY "Users can view officers from their scrapes"
  ON public.scraped_officers FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.companies_house_scrapes chs
    JOIN public.scraped_companies sc ON sc.scrape_id = chs.id
    WHERE sc.id = company_id AND chs.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert officers from their scrapes"
  ON public.scraped_officers FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.companies_house_scrapes chs
    JOIN public.scraped_companies sc ON sc.scrape_id = chs.id
    WHERE sc.id = company_id AND chs.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete officers from their scrapes"
  ON public.scraped_officers FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.companies_house_scrapes chs
    JOIN public.scraped_companies sc ON sc.scrape_id = chs.id
    WHERE sc.id = company_id AND chs.user_id = auth.uid()
  ));

-- Create indexes for performance
CREATE INDEX idx_scraped_companies_scrape_id ON public.scraped_companies(scrape_id);
CREATE INDEX idx_scraped_companies_company_number ON public.scraped_companies(company_number);
CREATE INDEX idx_scraped_officers_scrape_id ON public.scraped_officers(scrape_id);
CREATE INDEX idx_scraped_officers_company_id ON public.scraped_officers(company_id);
CREATE INDEX idx_scraped_officers_full_name ON public.scraped_officers(full_name);