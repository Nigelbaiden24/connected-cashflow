-- Create newsletters table for admin-uploaded content
CREATE TABLE IF NOT EXISTS public.newsletters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  edition text,
  preview text,
  content text NOT NULL,
  read_time text,
  category text NOT NULL, -- 'ai_roundup', 'sector', 'digest'
  published_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  uploaded_by uuid REFERENCES auth.users(id)
);

-- Create newsletter subscriptions table
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  subscribed_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Enable RLS
ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for newsletters - all authenticated users can view, admins can manage
CREATE POLICY "Anyone can view published newsletters"
  ON public.newsletters
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage newsletters"
  ON public.newsletters
  FOR ALL
  USING (is_admin(auth.uid()));

-- Policies for subscriptions - anyone can subscribe, admins can view all
CREATE POLICY "Anyone can subscribe to newsletters"
  ON public.newsletter_subscriptions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all subscriptions"
  ON public.newsletter_subscriptions
  FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Users can view their own subscription"
  ON public.newsletter_subscriptions
  FOR SELECT
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_newsletters_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER newsletters_updated_at
  BEFORE UPDATE ON public.newsletters
  FOR EACH ROW
  EXECUTE FUNCTION update_newsletters_updated_at();