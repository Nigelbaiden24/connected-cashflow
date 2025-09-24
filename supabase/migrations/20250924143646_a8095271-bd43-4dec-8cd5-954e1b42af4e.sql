-- Create clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  aum DECIMAL(15,2) DEFAULT 0,
  risk_profile TEXT CHECK (risk_profile IN ('Conservative', 'Moderate', 'Aggressive')),
  status TEXT CHECK (status IN ('active', 'needs_review', 'inactive')) DEFAULT 'active',
  date_of_birth DATE,
  address TEXT,
  occupation TEXT,
  annual_income DECIMAL(15,2),
  net_worth DECIMAL(15,2),
  investment_experience TEXT,
  investment_objectives TEXT[],
  liquidity_needs TEXT,
  time_horizon INTEGER, -- in years
  last_contact_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create portfolio holdings table
CREATE TABLE public.portfolio_holdings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL, -- 'Equity', 'Bonds', 'Alternative', 'Cash'
  asset_name TEXT NOT NULL,
  symbol TEXT,
  quantity DECIMAL(15,4),
  current_value DECIMAL(15,2),
  allocation_percentage DECIMAL(5,2),
  purchase_date DATE,
  purchase_price DECIMAL(15,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create client goals table
CREATE TABLE public.client_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL, -- 'Retirement', 'Education', 'House Purchase', 'Emergency Fund', etc.
  goal_name TEXT NOT NULL,
  target_amount DECIMAL(15,2),
  current_amount DECIMAL(15,2) DEFAULT 0,
  target_date DATE,
  priority TEXT CHECK (priority IN ('High', 'Medium', 'Low')) DEFAULT 'Medium',
  status TEXT CHECK (status IN ('On Track', 'Behind', 'Achieved', 'Paused')) DEFAULT 'On Track',
  monthly_contribution DECIMAL(15,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create client documents table
CREATE TABLE public.client_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL, -- 'Tax Return', 'Investment Statement', 'Insurance Policy', etc.
  file_path TEXT,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expiry_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create client meetings table
CREATE TABLE public.client_meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  meeting_type TEXT NOT NULL, -- 'Annual Review', 'Portfolio Review', 'Goal Planning', 'Check-in'
  meeting_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER,
  location TEXT, -- 'Office', 'Virtual', 'Client Location'
  status TEXT CHECK (status IN ('Scheduled', 'Completed', 'Cancelled', 'Rescheduled')) DEFAULT 'Scheduled',
  agenda TEXT[],
  notes TEXT,
  action_items TEXT[],
  next_meeting_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_meetings ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since no user authentication is implemented yet)
CREATE POLICY "Anyone can view clients" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Anyone can insert clients" ON public.clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update clients" ON public.clients FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete clients" ON public.clients FOR DELETE USING (true);

CREATE POLICY "Anyone can view portfolio holdings" ON public.portfolio_holdings FOR SELECT USING (true);
CREATE POLICY "Anyone can insert portfolio holdings" ON public.portfolio_holdings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update portfolio holdings" ON public.portfolio_holdings FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete portfolio holdings" ON public.portfolio_holdings FOR DELETE USING (true);

CREATE POLICY "Anyone can view client goals" ON public.client_goals FOR SELECT USING (true);
CREATE POLICY "Anyone can insert client goals" ON public.client_goals FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update client goals" ON public.client_goals FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete client goals" ON public.client_goals FOR DELETE USING (true);

CREATE POLICY "Anyone can view client documents" ON public.client_documents FOR SELECT USING (true);
CREATE POLICY "Anyone can insert client documents" ON public.client_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update client documents" ON public.client_documents FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete client documents" ON public.client_documents FOR DELETE USING (true);

CREATE POLICY "Anyone can view client meetings" ON public.client_meetings FOR SELECT USING (true);
CREATE POLICY "Anyone can insert client meetings" ON public.client_meetings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update client meetings" ON public.client_meetings FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete client meetings" ON public.client_meetings FOR DELETE USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_portfolio_holdings_updated_at
  BEFORE UPDATE ON public.portfolio_holdings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_goals_updated_at
  BEFORE UPDATE ON public.client_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_meetings_updated_at
  BEFORE UPDATE ON public.client_meetings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.clients (client_id, name, email, phone, aum, risk_profile, status, date_of_birth, address, occupation, annual_income, net_worth, investment_experience, investment_objectives, liquidity_needs, time_horizon, notes) VALUES
('CL001', 'Robert Johnson', 'r.johnson@email.com', '(555) 123-4567', 2400000.00, 'Conservative', 'active', '1965-03-15', '123 Oak Street, New York, NY 10001', 'Retired Engineer', 85000.00, 2800000.00, 'Moderate', ARRAY['Capital Preservation', 'Income Generation'], 'Moderate - Need access to funds for healthcare', 10, 'Long-term client, very risk-averse'),
('CL002', 'Sarah Williams', 's.williams@email.com', '(555) 234-5678', 1800000.00, 'Moderate', 'active', '1978-07-22', '456 Pine Avenue, Los Angeles, CA 90210', 'Marketing Director', 145000.00, 2100000.00, 'Experienced', ARRAY['Growth', 'Retirement Planning'], 'Low - Stable income, no immediate needs', 15, 'Excellent communication, meets quarterly'),
('CL003', 'Michael Chen', 'm.chen@email.com', '(555) 345-6789', 3200000.00, 'Aggressive', 'active', '1985-11-08', '789 Elm Drive, San Francisco, CA 94102', 'Tech Executive', 285000.00, 3800000.00, 'Very Experienced', ARRAY['Growth', 'Tax Optimization'], 'Very Low - High income, long time horizon', 20, 'Young professional, high risk tolerance'),
('CL004', 'Emma Davis', 'e.davis@email.com', '(555) 456-7890', 950000.00, 'Conservative', 'needs_review', '1960-12-03', '321 Maple Court, Chicago, IL 60601', 'Retired Teacher', 65000.00, 1200000.00, 'Limited', ARRAY['Capital Preservation', 'Estate Planning'], 'High - Fixed income, health concerns', 8, 'Needs more frequent contact, concerned about market volatility');

-- Insert sample portfolio holdings
INSERT INTO public.portfolio_holdings (client_id, asset_type, asset_name, symbol, quantity, current_value, allocation_percentage) VALUES
((SELECT id FROM public.clients WHERE client_id = 'CL001'), 'Bonds', 'US Treasury 10Y', 'TLT', 500.00, 1440000.00, 60.00),
((SELECT id FROM public.clients WHERE client_id = 'CL001'), 'Equity', 'S&P 500 ETF', 'SPY', 150.00, 720000.00, 30.00),
((SELECT id FROM public.clients WHERE client_id = 'CL001'), 'Alternative', 'REIT Index', 'VNQ', 200.00, 240000.00, 10.00),
((SELECT id FROM public.clients WHERE client_id = 'CL002'), 'Equity', 'Total Stock Market', 'VTI', 400.00, 900000.00, 50.00),
((SELECT id FROM public.clients WHERE client_id = 'CL002'), 'Bonds', 'Aggregate Bond ETF', 'BND', 700.00, 630000.00, 35.00),
((SELECT id FROM public.clients WHERE client_id = 'CL002'), 'Alternative', 'Commodities ETF', 'DJP', 300.00, 270000.00, 15.00);

-- Insert sample goals
INSERT INTO public.client_goals (client_id, goal_type, goal_name, target_amount, current_amount, target_date, priority, status, monthly_contribution) VALUES
((SELECT id FROM public.clients WHERE client_id = 'CL001'), 'Retirement', 'Secure Retirement Income', 3000000.00, 2400000.00, '2030-12-31', 'High', 'On Track', 5000.00),
((SELECT id FROM public.clients WHERE client_id = 'CL002'), 'Retirement', 'Retirement at 60', 4000000.00, 1800000.00, '2038-07-22', 'High', 'On Track', 8000.00),
((SELECT id FROM public.clients WHERE client_id = 'CL002'), 'Education', 'Children College Fund', 500000.00, 180000.00, '2035-08-01', 'Medium', 'On Track', 2000.00),
((SELECT id FROM public.clients WHERE client_id = 'CL003'), 'Retirement', 'Early Retirement Fund', 5000000.00, 3200000.00, '2045-11-08', 'High', 'On Track', 12000.00);