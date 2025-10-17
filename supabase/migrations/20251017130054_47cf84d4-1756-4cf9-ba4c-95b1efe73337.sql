-- Create candidates table for candidate registrations
CREATE TABLE public.candidates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  nationality TEXT NOT NULL,
  ni_number TEXT,
  passport_number TEXT,
  visa_status TEXT,
  right_to_work_uk BOOLEAN DEFAULT false,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  postcode TEXT NOT NULL,
  current_job_title TEXT,
  current_employer TEXT,
  years_experience INTEGER,
  desired_salary_min NUMERIC,
  desired_salary_max NUMERIC,
  notice_period TEXT,
  cv_file_path TEXT,
  cover_letter TEXT,
  linkedin_url TEXT,
  skills TEXT[],
  qualifications JSONB,
  employment_history JSONB,
  reference_contacts JSONB,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vacancies table for employer job postings
CREATE TABLE public.vacancies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  job_title TEXT NOT NULL,
  job_sector TEXT NOT NULL,
  job_location TEXT NOT NULL,
  job_type TEXT NOT NULL,
  salary_min NUMERIC,
  salary_max NUMERIC,
  salary_currency TEXT DEFAULT 'GBP',
  job_description TEXT NOT NULL,
  key_responsibilities TEXT[],
  required_qualifications TEXT[],
  preferred_qualifications TEXT[],
  benefits TEXT[],
  start_date DATE,
  application_deadline DATE,
  number_of_positions INTEGER DEFAULT 1,
  remote_work BOOLEAN DEFAULT false,
  visa_sponsorship BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacancies ENABLE ROW LEVEL SECURITY;

-- Candidates policies
CREATE POLICY "Anyone can insert candidates"
ON public.candidates
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can view their own candidate profile"
ON public.candidates
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own candidate profile"
ON public.candidates
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all candidates"
ON public.candidates
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Vacancies policies
CREATE POLICY "Anyone can insert vacancies"
ON public.vacancies
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can view their own vacancies"
ON public.vacancies
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own vacancies"
ON public.vacancies
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all vacancies"
ON public.vacancies
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_candidates_updated_at
BEFORE UPDATE ON public.candidates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vacancies_updated_at
BEFORE UPDATE ON public.vacancies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();