-- Create admin_settings table for storing admin configuration
CREATE TABLE public.admin_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, setting_key)
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Create policies - only admins can access their own settings
CREATE POLICY "Admins can view their own settings"
ON public.admin_settings
FOR SELECT
USING (
  auth.uid() = user_id AND
  public.is_admin(auth.uid())
);

CREATE POLICY "Admins can insert their own settings"
ON public.admin_settings
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  public.is_admin(auth.uid())
);

CREATE POLICY "Admins can update their own settings"
ON public.admin_settings
FOR UPDATE
USING (
  auth.uid() = user_id AND
  public.is_admin(auth.uid())
);

CREATE POLICY "Admins can delete their own settings"
ON public.admin_settings
FOR DELETE
USING (
  auth.uid() = user_id AND
  public.is_admin(auth.uid())
);

-- Create trigger for updated_at
CREATE TRIGGER update_admin_settings_updated_at
BEFORE UPDATE ON public.admin_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();