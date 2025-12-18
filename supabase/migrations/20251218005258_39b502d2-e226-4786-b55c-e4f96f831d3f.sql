-- Create purchasable reports table
CREATE TABLE public.purchasable_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  file_path TEXT NOT NULL,
  price_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'GBP',
  stripe_price_id TEXT,
  is_published BOOLEAN DEFAULT true,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  uploaded_by UUID REFERENCES auth.users(id)
);

-- Create purchases table to track user purchases
CREATE TABLE public.report_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  report_id UUID REFERENCES public.purchasable_reports(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  amount_paid INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GBP',
  status TEXT NOT NULL DEFAULT 'pending',
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  email TEXT,
  UNIQUE(user_id, report_id)
);

-- Enable RLS
ALTER TABLE public.purchasable_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_purchases ENABLE ROW LEVEL SECURITY;

-- Policies for purchasable_reports (public read for published)
CREATE POLICY "Anyone can view published reports" 
  ON public.purchasable_reports 
  FOR SELECT 
  USING (is_published = true);

CREATE POLICY "Admins can manage reports" 
  ON public.purchasable_reports 
  FOR ALL 
  USING (public.is_admin(auth.uid()));

-- Policies for report_purchases
CREATE POLICY "Users can view their own purchases" 
  ON public.report_purchases 
  FOR SELECT 
  USING (auth.uid() = user_id OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "System can insert purchases" 
  ON public.report_purchases 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "System can update purchases" 
  ON public.report_purchases 
  FOR UPDATE 
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_purchasable_reports_updated_at
  BEFORE UPDATE ON public.purchasable_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();