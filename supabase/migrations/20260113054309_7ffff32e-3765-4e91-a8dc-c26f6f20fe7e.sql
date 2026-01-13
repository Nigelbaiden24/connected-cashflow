-- Add tab-level permission columns for FlowPulse Finance platform
ALTER TABLE public.platform_permissions
ADD COLUMN IF NOT EXISTS finance_dashboard boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS finance_ai_chatbot boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS finance_calendar boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS finance_document_generator boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS finance_market_data boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS finance_market_commentary boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS finance_model_portfolios boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS finance_benchmarking_trends boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS finance_ai_analyst boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS finance_watchlists boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS finance_screeners boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS finance_fund_database boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS finance_stocks_crypto boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS finance_opportunities boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS finance_financial_planning boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS finance_portfolio_management boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS finance_goal_planning boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS finance_investment_analysis boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS finance_risk_assessment boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS finance_scenario_analysis boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS finance_crm boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS finance_client_management boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS finance_client_onboarding boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS finance_practice_management boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS finance_payroll boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS finance_compliance boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS finance_reports boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS finance_security boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS finance_automation boolean DEFAULT true;

-- Add tab-level permission columns for FlowPulse Investor platform
ALTER TABLE public.platform_permissions
ADD COLUMN IF NOT EXISTS investor_dashboard boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS investor_research_reports boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS investor_analysis_reports boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS investor_market_commentary boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS investor_model_portfolios boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS investor_signals_alerts boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS investor_newsletters boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS investor_benchmarking_trends boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS investor_screeners boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS investor_fund_database boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS investor_stocks_crypto boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS investor_ai_analyst boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS investor_learning_hub boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS investor_market_data_hub boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS investor_tools_calculators boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS investor_risk_compliance boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS investor_opportunities boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS investor_watchlists boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS investor_tasks boolean DEFAULT true;

-- Create function to update tab permissions
CREATE OR REPLACE FUNCTION public.update_tab_permissions(
  _user_id uuid,
  _permissions jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.platform_permissions
  SET
    -- Finance tabs
    finance_dashboard = COALESCE((_permissions->>'finance_dashboard')::boolean, finance_dashboard),
    finance_ai_chatbot = COALESCE((_permissions->>'finance_ai_chatbot')::boolean, finance_ai_chatbot),
    finance_calendar = COALESCE((_permissions->>'finance_calendar')::boolean, finance_calendar),
    finance_document_generator = COALESCE((_permissions->>'finance_document_generator')::boolean, finance_document_generator),
    finance_market_data = COALESCE((_permissions->>'finance_market_data')::boolean, finance_market_data),
    finance_market_commentary = COALESCE((_permissions->>'finance_market_commentary')::boolean, finance_market_commentary),
    finance_model_portfolios = COALESCE((_permissions->>'finance_model_portfolios')::boolean, finance_model_portfolios),
    finance_benchmarking_trends = COALESCE((_permissions->>'finance_benchmarking_trends')::boolean, finance_benchmarking_trends),
    finance_ai_analyst = COALESCE((_permissions->>'finance_ai_analyst')::boolean, finance_ai_analyst),
    finance_watchlists = COALESCE((_permissions->>'finance_watchlists')::boolean, finance_watchlists),
    finance_screeners = COALESCE((_permissions->>'finance_screeners')::boolean, finance_screeners),
    finance_fund_database = COALESCE((_permissions->>'finance_fund_database')::boolean, finance_fund_database),
    finance_stocks_crypto = COALESCE((_permissions->>'finance_stocks_crypto')::boolean, finance_stocks_crypto),
    finance_opportunities = COALESCE((_permissions->>'finance_opportunities')::boolean, finance_opportunities),
    finance_financial_planning = COALESCE((_permissions->>'finance_financial_planning')::boolean, finance_financial_planning),
    finance_portfolio_management = COALESCE((_permissions->>'finance_portfolio_management')::boolean, finance_portfolio_management),
    finance_goal_planning = COALESCE((_permissions->>'finance_goal_planning')::boolean, finance_goal_planning),
    finance_investment_analysis = COALESCE((_permissions->>'finance_investment_analysis')::boolean, finance_investment_analysis),
    finance_risk_assessment = COALESCE((_permissions->>'finance_risk_assessment')::boolean, finance_risk_assessment),
    finance_scenario_analysis = COALESCE((_permissions->>'finance_scenario_analysis')::boolean, finance_scenario_analysis),
    finance_crm = COALESCE((_permissions->>'finance_crm')::boolean, finance_crm),
    finance_client_management = COALESCE((_permissions->>'finance_client_management')::boolean, finance_client_management),
    finance_client_onboarding = COALESCE((_permissions->>'finance_client_onboarding')::boolean, finance_client_onboarding),
    finance_practice_management = COALESCE((_permissions->>'finance_practice_management')::boolean, finance_practice_management),
    finance_payroll = COALESCE((_permissions->>'finance_payroll')::boolean, finance_payroll),
    finance_compliance = COALESCE((_permissions->>'finance_compliance')::boolean, finance_compliance),
    finance_reports = COALESCE((_permissions->>'finance_reports')::boolean, finance_reports),
    finance_security = COALESCE((_permissions->>'finance_security')::boolean, finance_security),
    finance_automation = COALESCE((_permissions->>'finance_automation')::boolean, finance_automation),
    -- Investor tabs
    investor_dashboard = COALESCE((_permissions->>'investor_dashboard')::boolean, investor_dashboard),
    investor_research_reports = COALESCE((_permissions->>'investor_research_reports')::boolean, investor_research_reports),
    investor_analysis_reports = COALESCE((_permissions->>'investor_analysis_reports')::boolean, investor_analysis_reports),
    investor_market_commentary = COALESCE((_permissions->>'investor_market_commentary')::boolean, investor_market_commentary),
    investor_model_portfolios = COALESCE((_permissions->>'investor_model_portfolios')::boolean, investor_model_portfolios),
    investor_signals_alerts = COALESCE((_permissions->>'investor_signals_alerts')::boolean, investor_signals_alerts),
    investor_newsletters = COALESCE((_permissions->>'investor_newsletters')::boolean, investor_newsletters),
    investor_benchmarking_trends = COALESCE((_permissions->>'investor_benchmarking_trends')::boolean, investor_benchmarking_trends),
    investor_screeners = COALESCE((_permissions->>'investor_screeners')::boolean, investor_screeners),
    investor_fund_database = COALESCE((_permissions->>'investor_fund_database')::boolean, investor_fund_database),
    investor_stocks_crypto = COALESCE((_permissions->>'investor_stocks_crypto')::boolean, investor_stocks_crypto),
    investor_ai_analyst = COALESCE((_permissions->>'investor_ai_analyst')::boolean, investor_ai_analyst),
    investor_learning_hub = COALESCE((_permissions->>'investor_learning_hub')::boolean, investor_learning_hub),
    investor_market_data_hub = COALESCE((_permissions->>'investor_market_data_hub')::boolean, investor_market_data_hub),
    investor_tools_calculators = COALESCE((_permissions->>'investor_tools_calculators')::boolean, investor_tools_calculators),
    investor_risk_compliance = COALESCE((_permissions->>'investor_risk_compliance')::boolean, investor_risk_compliance),
    investor_opportunities = COALESCE((_permissions->>'investor_opportunities')::boolean, investor_opportunities),
    investor_watchlists = COALESCE((_permissions->>'investor_watchlists')::boolean, investor_watchlists),
    investor_tasks = COALESCE((_permissions->>'investor_tasks')::boolean, investor_tasks),
    updated_at = now()
  WHERE user_id = _user_id;
  
  -- If no row was updated, insert a new one
  IF NOT FOUND THEN
    INSERT INTO public.platform_permissions (user_id)
    VALUES (_user_id);
    
    -- Recursively call to update the new row
    PERFORM public.update_tab_permissions(_user_id, _permissions);
  END IF;
END;
$$;