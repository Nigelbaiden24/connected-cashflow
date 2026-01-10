-- Create opportunity_products table for admin-sourced investment opportunities
CREATE TABLE public.opportunity_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Basic Info
  title TEXT NOT NULL,
  short_description TEXT,
  full_description TEXT,
  
  -- Product Category
  category TEXT NOT NULL CHECK (category IN ('real_estate', 'private_business', 'collectibles_luxury')),
  sub_category TEXT NOT NULL,
  
  -- Pricing & Location
  price NUMERIC,
  price_currency TEXT DEFAULT 'GBP',
  location TEXT,
  country TEXT,
  
  -- Media
  thumbnail_url TEXT,
  gallery_images TEXT[],
  
  -- Analyst Ratings (like fund database)
  analyst_rating TEXT CHECK (analyst_rating IN ('Gold', 'Silver', 'Bronze', 'Neutral', 'Negative')),
  
  -- Conviction Scores (0-5 scale)
  quality_score NUMERIC CHECK (quality_score >= 0 AND quality_score <= 5),
  value_score NUMERIC CHECK (value_score >= 0 AND value_score <= 5),
  liquidity_score NUMERIC CHECK (liquidity_score >= 0 AND liquidity_score <= 5),
  risk_score NUMERIC CHECK (risk_score >= 0 AND risk_score <= 5),
  overall_conviction_score NUMERIC,
  
  -- Analyst Commentary
  investment_thesis TEXT,
  strengths TEXT,
  risks TEXT,
  suitable_investor_type TEXT,
  key_watchpoints TEXT,
  
  -- Product-specific fields (JSON for flexibility)
  product_details JSONB DEFAULT '{}',
  
  -- Real Estate specific
  property_type TEXT,
  bedrooms INTEGER,
  bathrooms INTEGER,
  square_footage NUMERIC,
  year_built INTEGER,
  rental_yield NUMERIC,
  
  -- Private Business specific
  industry TEXT,
  annual_revenue NUMERIC,
  employee_count INTEGER,
  founding_year INTEGER,
  business_stage TEXT,
  
  -- Collectibles specific
  provenance TEXT,
  condition TEXT,
  authenticity_verified BOOLEAN DEFAULT false,
  estimated_appreciation NUMERIC,
  
  -- Status & Metadata
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'sold', 'withdrawn')),
  featured BOOLEAN DEFAULT false,
  last_analyst_review_date TIMESTAMPTZ,
  uploaded_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.opportunity_products ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (active opportunities)
CREATE POLICY "Anyone can view active opportunities" 
ON public.opportunity_products 
FOR SELECT 
USING (status = 'active');

-- Create policy for admin insert/update/delete (based on user_roles)
CREATE POLICY "Admins can manage opportunities" 
ON public.opportunity_products 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role = 'admin'
  )
);

-- Create trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_opportunity_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_opportunity_products_updated_at
BEFORE UPDATE ON public.opportunity_products
FOR EACH ROW
EXECUTE FUNCTION public.update_opportunity_products_updated_at();

-- Create index for faster queries
CREATE INDEX idx_opportunity_products_category ON public.opportunity_products(category);
CREATE INDEX idx_opportunity_products_status ON public.opportunity_products(status);
CREATE INDEX idx_opportunity_products_featured ON public.opportunity_products(featured);