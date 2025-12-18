-- Create CRM follow-ups table
CREATE TABLE public.crm_follow_ups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  interaction_id UUID REFERENCES public.crm_interactions(id) ON DELETE SET NULL,
  follow_up_date TIMESTAMP WITH TIME ZONE NOT NULL,
  reminder_sent BOOLEAN DEFAULT false,
  reminder_sent_at TIMESTAMP WITH TIME ZONE,
  title TEXT NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crm_follow_ups ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own follow-ups"
ON public.crm_follow_ups
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own follow-ups"
ON public.crm_follow_ups
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own follow-ups"
ON public.crm_follow_ups
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own follow-ups"
ON public.crm_follow_ups
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for efficient querying
CREATE INDEX idx_crm_follow_ups_date ON public.crm_follow_ups(follow_up_date);
CREATE INDEX idx_crm_follow_ups_user ON public.crm_follow_ups(user_id);
CREATE INDEX idx_crm_follow_ups_pending ON public.crm_follow_ups(follow_up_date) WHERE status = 'pending' AND reminder_sent = false;

-- Create CRM notifications table
CREATE TABLE public.crm_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  follow_up_id UUID REFERENCES public.crm_follow_ups(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT DEFAULT 'follow_up_reminder',
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crm_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications"
ON public.crm_notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.crm_notifications
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
ON public.crm_notifications
FOR INSERT
WITH CHECK (true);

-- Create index
CREATE INDEX idx_crm_notifications_user ON public.crm_notifications(user_id);
CREATE INDEX idx_crm_notifications_unread ON public.crm_notifications(user_id) WHERE is_read = false;

-- Create updated_at trigger for follow-ups
CREATE TRIGGER update_crm_follow_ups_updated_at
BEFORE UPDATE ON public.crm_follow_ups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();