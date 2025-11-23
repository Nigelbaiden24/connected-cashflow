-- Add status and updated_at columns to demo_requests
ALTER TABLE public.demo_requests 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'scheduled', 'completed', 'cancelled')),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Add trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_demo_requests_updated_at ON public.demo_requests;
CREATE TRIGGER update_demo_requests_updated_at
  BEFORE UPDATE ON public.demo_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();