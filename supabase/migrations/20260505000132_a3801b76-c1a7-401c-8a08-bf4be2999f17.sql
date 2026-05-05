
-- Notification fan-out triggers for both platforms
-- Finance/Business: writes to business_notifications (per user)
-- Investor: writes to investor_alerts (broadcast, hook resolves per-user unread)

CREATE OR REPLACE FUNCTION public.notify_finance_content()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_type text := TG_ARGV[0];
  v_action_url text := TG_ARGV[1];
  v_label text := TG_ARGV[2];
  v_title text;
BEGIN
  v_title := COALESCE(NEW.title, v_label);
  INSERT INTO public.business_notifications (
    user_id, title, message, notification_type, severity, entity_type, entity_id, action_url
  )
  SELECT up.user_id,
         '🔔 New ' || v_label,
         v_label || ': ' || v_title,
         v_type,
         'info',
         v_type,
         NEW.id::text,
         v_action_url
  FROM public.user_profiles up;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'notify_finance_content failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_investor_content()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_type text := TG_ARGV[0];
  v_label text := TG_ARGV[1];
  v_title text;
BEGIN
  v_title := COALESCE(NEW.title, v_label);
  INSERT INTO public.investor_alerts (
    alert_type, title, description, severity, published_date, metadata
  ) VALUES (
    v_type,
    '🔔 New ' || v_label || ': ' || v_title,
    'A new ' || lower(v_label) || ' is available on the platform.',
    'info',
    now(),
    jsonb_build_object('entity_id', NEW.id, 'entity_type', v_type, 'source', 'auto_trigger')
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'notify_investor_content failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Drop existing if any (idempotent)
DROP TRIGGER IF EXISTS trg_notify_finance_opportunity_products ON public.opportunity_products;
DROP TRIGGER IF EXISTS trg_notify_investor_opportunity_products ON public.opportunity_products;
DROP TRIGGER IF EXISTS trg_notify_investor_finder_opps ON public.investor_finder_opportunities;
DROP TRIGGER IF EXISTS trg_notify_finance_opportunities ON public.opportunities;
DROP TRIGGER IF EXISTS trg_notify_finance_newsletters ON public.newsletters;
DROP TRIGGER IF EXISTS trg_notify_investor_newsletters ON public.newsletters;
DROP TRIGGER IF EXISTS trg_notify_finance_commentary ON public.market_commentary;
DROP TRIGGER IF EXISTS trg_notify_investor_commentary ON public.market_commentary;
DROP TRIGGER IF EXISTS trg_notify_finance_trends ON public.market_trends;
DROP TRIGGER IF EXISTS trg_notify_investor_trends ON public.market_trends;
DROP TRIGGER IF EXISTS trg_notify_investor_learning ON public.learning_content;
DROP TRIGGER IF EXISTS trg_notify_finance_portfolios ON public.model_portfolios;
DROP TRIGGER IF EXISTS trg_notify_investor_portfolios ON public.model_portfolios;
DROP TRIGGER IF EXISTS trg_notify_finance_picks ON public.featured_analyst_picks;
DROP TRIGGER IF EXISTS trg_notify_investor_picks ON public.featured_analyst_picks;
DROP TRIGGER IF EXISTS trg_notify_finance_reports ON public.purchasable_reports;
DROP TRIGGER IF EXISTS trg_notify_investor_reports ON public.purchasable_reports;

-- Opportunity Products (both platforms, only when active)
CREATE TRIGGER trg_notify_finance_opportunity_products
AFTER INSERT ON public.opportunity_products
FOR EACH ROW
WHEN (NEW.status = 'active' AND (NEW.platform IS NULL OR NEW.platform IN ('finance','both')))
EXECUTE FUNCTION public.notify_finance_content('opportunity', '/finance/opportunities', 'Opportunity');

CREATE TRIGGER trg_notify_investor_opportunity_products
AFTER INSERT ON public.opportunity_products
FOR EACH ROW
WHEN (NEW.status = 'active' AND (NEW.platform IS NULL OR NEW.platform IN ('investor','both')))
EXECUTE FUNCTION public.notify_investor_content('opportunity', 'Opportunity');

-- Investor Finder Opportunities
CREATE TRIGGER trg_notify_investor_finder_opps
AFTER INSERT ON public.investor_finder_opportunities
FOR EACH ROW
WHEN (NEW.status = 'published')
EXECUTE FUNCTION public.notify_investor_content('deal', 'Deal');

-- Opportunities (finance)
CREATE TRIGGER trg_notify_finance_opportunities
AFTER INSERT ON public.opportunities
FOR EACH ROW
WHEN (NEW.status = 'published')
EXECUTE FUNCTION public.notify_finance_content('opportunity', '/finance/opportunities', 'Opportunity');

-- Newsletters (both)
CREATE TRIGGER trg_notify_finance_newsletters
AFTER INSERT ON public.newsletters
FOR EACH ROW
EXECUTE FUNCTION public.notify_finance_content('newsletter', '/finance/news', 'Newsletter');

CREATE TRIGGER trg_notify_investor_newsletters
AFTER INSERT ON public.newsletters
FOR EACH ROW
EXECUTE FUNCTION public.notify_investor_content('newsletter', 'Newsletter');

-- Market Commentary (both)
CREATE TRIGGER trg_notify_finance_commentary
AFTER INSERT ON public.market_commentary
FOR EACH ROW
EXECUTE FUNCTION public.notify_finance_content('market_commentary', '/finance/market-commentary', 'Market Commentary');

CREATE TRIGGER trg_notify_investor_commentary
AFTER INSERT ON public.market_commentary
FOR EACH ROW
EXECUTE FUNCTION public.notify_investor_content('market_commentary', 'Market Commentary');

-- Market Trends
CREATE TRIGGER trg_notify_finance_trends
AFTER INSERT ON public.market_trends
FOR EACH ROW
WHEN (NEW.is_published = true)
EXECUTE FUNCTION public.notify_finance_content('market_trend', '/finance/benchmarking-trends', 'Market Trend');

CREATE TRIGGER trg_notify_investor_trends
AFTER INSERT ON public.market_trends
FOR EACH ROW
WHEN (NEW.is_published = true)
EXECUTE FUNCTION public.notify_investor_content('market_trend', 'Market Trend');

-- Learning Content (investor)
CREATE TRIGGER trg_notify_investor_learning
AFTER INSERT ON public.learning_content
FOR EACH ROW
WHEN (NEW.is_published = true)
EXECUTE FUNCTION public.notify_investor_content('learning_content', 'Learning Content');

-- Model Portfolios (both)
CREATE TRIGGER trg_notify_finance_portfolios
AFTER INSERT ON public.model_portfolios
FOR EACH ROW
EXECUTE FUNCTION public.notify_finance_content('model_portfolio', '/finance/model-portfolios', 'Model Portfolio');

CREATE TRIGGER trg_notify_investor_portfolios
AFTER INSERT ON public.model_portfolios
FOR EACH ROW
EXECUTE FUNCTION public.notify_investor_content('model_portfolio', 'Model Portfolio');

-- Featured Analyst Picks (both)
CREATE TRIGGER trg_notify_finance_picks
AFTER INSERT ON public.featured_analyst_picks
FOR EACH ROW
EXECUTE FUNCTION public.notify_finance_content('analyst_pick', '/finance/featured-picks', 'Analyst Pick');

CREATE TRIGGER trg_notify_investor_picks
AFTER INSERT ON public.featured_analyst_picks
FOR EACH ROW
EXECUTE FUNCTION public.notify_investor_content('analyst_pick', 'Analyst Pick');

-- Purchasable Reports (both)
CREATE TRIGGER trg_notify_finance_reports
AFTER INSERT ON public.purchasable_reports
FOR EACH ROW
WHEN (NEW.is_published = true)
EXECUTE FUNCTION public.notify_finance_content('research_report', '/finance/reports', 'Research Report');

CREATE TRIGGER trg_notify_investor_reports
AFTER INSERT ON public.purchasable_reports
FOR EACH ROW
WHEN (NEW.is_published = true)
EXECUTE FUNCTION public.notify_investor_content('research_report', 'Research Report');
