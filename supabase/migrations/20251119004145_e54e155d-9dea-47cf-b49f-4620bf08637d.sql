-- Create alert preferences table
CREATE TABLE IF NOT EXISTS public.investor_alert_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  alert_type TEXT NOT NULL,
  email_enabled BOOLEAN DEFAULT false,
  platform_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, alert_type)
);

-- Enable RLS
ALTER TABLE public.investor_alert_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own alert preferences"
  ON public.investor_alert_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own alert preferences"
  ON public.investor_alert_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alert preferences"
  ON public.investor_alert_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create alerts table for storing actual alerts
CREATE TABLE IF NOT EXISTS public.investor_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  severity TEXT DEFAULT 'info',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  published_date TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.investor_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies - all users can view alerts
CREATE POLICY "All authenticated users can view alerts"
  ON public.investor_alerts
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Admins can manage alerts
CREATE POLICY "Admins can manage alerts"
  ON public.investor_alerts
  FOR ALL
  USING (is_admin(auth.uid()));

-- Create alert notifications table for delivered alerts
CREATE TABLE IF NOT EXISTS public.investor_alert_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  alert_id UUID NOT NULL REFERENCES public.investor_alerts(id) ON DELETE CASCADE,
  delivery_method TEXT NOT NULL,
  delivered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.investor_alert_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notifications"
  ON public.investor_alert_notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.investor_alert_notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- System can insert notifications
CREATE POLICY "System can insert notifications"
  ON public.investor_alert_notifications
  FOR INSERT
  WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_investor_alert_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_investor_alert_preferences_timestamp
  BEFORE UPDATE ON public.investor_alert_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_investor_alert_preferences_updated_at();