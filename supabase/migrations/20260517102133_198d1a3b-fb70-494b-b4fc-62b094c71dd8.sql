
-- ============================================================
-- AI Queue → Frontend Tabs sync infrastructure
-- ============================================================

-- 1. Destination tables for AI-promoted content
CREATE TABLE IF NOT EXISTS public.platform_curated_watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid,
  symbol text NOT NULL,
  asset_name text,
  asset_type text,
  trigger_type text,
  watchlist_reason text,
  catalyst_summary text,
  support_resistance text,
  entry_risk_level text,
  momentum_score numeric,
  alert_urgency_score numeric,
  confidence_score numeric,
  signals jsonb DEFAULT '[]'::jsonb,
  platform text,
  expires_at timestamptz,
  promoted_at timestamptz NOT NULL DEFAULT now(),
  promoted_by uuid,
  status text NOT NULL DEFAULT 'active'
);
ALTER TABLE public.platform_curated_watchlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read curated watchlist" ON public.platform_curated_watchlist
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin write curated watchlist" ON public.platform_curated_watchlist
  FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.platform_fund_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid,
  ticker text NOT NULL,
  fund_name text NOT NULL,
  fund_type text,
  asset_class text,
  region text,
  summary text,
  pros jsonb,
  cons jsonb,
  suitable_investor_types jsonb,
  comparative_analysis text,
  trend_commentary text,
  overall_score numeric,
  holdings_concentration jsonb,
  sector_exposure jsonb,
  historical_performance jsonb,
  fee_analysis jsonb,
  fund_flows jsonb,
  manager_performance jsonb,
  volatility_metrics jsonb,
  platform text,
  promoted_at timestamptz NOT NULL DEFAULT now(),
  promoted_by uuid,
  status text NOT NULL DEFAULT 'active'
);
ALTER TABLE public.platform_fund_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read fund analyses" ON public.platform_fund_analyses
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin write fund analyses" ON public.platform_fund_analyses
  FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.platform_discovery_picks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid,
  symbol text,
  asset_name text,
  asset_type text,
  discovery_bucket text,
  sector text,
  thesis text,
  catalysts jsonb,
  risks jsonb,
  score numeric,
  conviction text,
  valuation_metrics jsonb,
  momentum_metrics jsonb,
  earnings_growth jsonb,
  analyst_sentiment jsonb,
  volatility_metrics jsonb,
  platform text,
  promoted_at timestamptz NOT NULL DEFAULT now(),
  promoted_by uuid,
  status text NOT NULL DEFAULT 'active'
);
ALTER TABLE public.platform_discovery_picks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read discovery picks" ON public.platform_discovery_picks
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin write discovery picks" ON public.platform_discovery_picks
  FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.platform_investor_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid,
  primary_segment text NOT NULL,
  secondary_segments jsonb,
  segment_confidence numeric,
  behavioural_signals jsonb,
  risk_tolerance text,
  engagement_score numeric,
  recommended_assets jsonb,
  recommended_portfolios jsonb,
  recommended_content jsonb,
  recommended_alerts jsonb,
  recommended_watchlists jsonb,
  summary text,
  platform text,
  promoted_at timestamptz NOT NULL DEFAULT now(),
  promoted_by uuid,
  status text NOT NULL DEFAULT 'active'
);
ALTER TABLE public.platform_investor_segments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read segments" ON public.platform_investor_segments
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin write segments" ON public.platform_investor_segments
  FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Add platform column to market_trends if missing (for benchmark report sync)
ALTER TABLE public.market_trends
  ADD COLUMN IF NOT EXISTS platform text,
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS source_id uuid;

-- ============================================================
-- 2. Promotion RPCs (SECURITY DEFINER, admin-only)
-- ============================================================

CREATE OR REPLACE FUNCTION public.promote_analyst_benchmark_report(_id uuid, _platform text DEFAULT 'both')
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_item public.analyst_benchmark_reports%ROWTYPE; v_new uuid;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RETURN jsonb_build_object('ok',false,'error','Admin required'); END IF;
  SELECT * INTO v_item FROM public.analyst_benchmark_reports WHERE id = _id;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','Not found'); END IF;
  INSERT INTO public.market_trends (title, description, impact, timeframe, is_published, created_by, platform, source, source_id)
  VALUES (
    v_item.headline,
    left(COALESCE(v_item.executive_summary, v_item.mobile_summary, v_item.full_commentary, 'AI benchmark report'), 2000),
    CASE WHEN v_item.confidence_score >= 4 THEN 'high' WHEN v_item.confidence_score >= 2.5 THEN 'medium' ELSE 'low' END,
    'short-term',
    true,
    auth.uid(),
    COALESCE(NULLIF(_platform,''),'both'),
    'ai_benchmark_report',
    v_item.id
  ) RETURNING id INTO v_new;
  UPDATE public.analyst_benchmark_reports SET status='approved', target_platform=COALESCE(_platform, target_platform), reviewed_by=auth.uid(), reviewed_at=now() WHERE id=_id;
  RETURN jsonb_build_object('ok',true,'promoted_id',v_new,'platform',_platform);
EXCEPTION WHEN OTHERS THEN RETURN jsonb_build_object('ok',false,'error',SQLERRM); END; $$;

CREATE OR REPLACE FUNCTION public.promote_analyst_watchlist_entry(_id uuid, _platform text DEFAULT 'finance')
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_item public.analyst_dynamic_watchlist%ROWTYPE; v_new uuid;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RETURN jsonb_build_object('ok',false,'error','Admin required'); END IF;
  SELECT * INTO v_item FROM public.analyst_dynamic_watchlist WHERE id = _id;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','Not found'); END IF;
  INSERT INTO public.platform_curated_watchlist (
    source_id, symbol, asset_name, asset_type, trigger_type, watchlist_reason,
    catalyst_summary, support_resistance, entry_risk_level, momentum_score,
    alert_urgency_score, confidence_score, signals, platform, expires_at, promoted_by
  ) VALUES (
    v_item.id, v_item.symbol, v_item.asset_name, v_item.asset_type, v_item.trigger_type,
    v_item.watchlist_reason, v_item.catalyst_summary, v_item.support_resistance,
    v_item.entry_risk_level, v_item.momentum_score, v_item.alert_urgency_score,
    v_item.confidence_score, COALESCE(v_item.signals,'[]'::jsonb),
    COALESCE(NULLIF(_platform,''),'finance'), v_item.expires_at, auth.uid()
  ) RETURNING id INTO v_new;
  UPDATE public.analyst_dynamic_watchlist SET status='promoted', target_platform=COALESCE(_platform,target_platform), reviewed_by=auth.uid(), reviewed_at=now() WHERE id=_id;
  RETURN jsonb_build_object('ok',true,'promoted_id',v_new,'platform',_platform);
EXCEPTION WHEN OTHERS THEN RETURN jsonb_build_object('ok',false,'error',SQLERRM); END; $$;

CREATE OR REPLACE FUNCTION public.promote_etf_fund_analysis(_id uuid, _platform text DEFAULT 'both')
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_item public.etf_fund_analyses%ROWTYPE; v_new uuid;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RETURN jsonb_build_object('ok',false,'error','Admin required'); END IF;
  SELECT * INTO v_item FROM public.etf_fund_analyses WHERE id = _id;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','Not found'); END IF;
  INSERT INTO public.platform_fund_analyses (
    source_id, ticker, fund_name, fund_type, asset_class, region, summary,
    pros, cons, suitable_investor_types, comparative_analysis, trend_commentary,
    overall_score, holdings_concentration, sector_exposure, historical_performance,
    fee_analysis, fund_flows, manager_performance, volatility_metrics, platform, promoted_by
  ) VALUES (
    v_item.id, v_item.ticker, v_item.fund_name, v_item.fund_type, v_item.asset_class,
    v_item.region, v_item.summary, v_item.pros, v_item.cons, v_item.suitable_investor_types,
    v_item.comparative_analysis, v_item.trend_commentary, v_item.overall_score,
    v_item.holdings_concentration, v_item.sector_exposure, v_item.historical_performance,
    v_item.fee_analysis, v_item.fund_flows, v_item.manager_performance, v_item.volatility_metrics,
    COALESCE(NULLIF(_platform,''),'both'), auth.uid()
  ) RETURNING id INTO v_new;
  UPDATE public.etf_fund_analyses SET status='promoted', target_platform=COALESCE(_platform,target_platform) WHERE id=_id;
  RETURN jsonb_build_object('ok',true,'promoted_id',v_new,'platform',_platform);
EXCEPTION WHEN OTHERS THEN RETURN jsonb_build_object('ok',false,'error',SQLERRM); END; $$;

CREATE OR REPLACE FUNCTION public.promote_realtime_alert(_id uuid, _platform text DEFAULT 'investor')
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_item public.realtime_investment_alerts%ROWTYPE; v_new uuid;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RETURN jsonb_build_object('ok',false,'error','Admin required'); END IF;
  SELECT * INTO v_item FROM public.realtime_investment_alerts WHERE id = _id;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','Not found'); END IF;
  INSERT INTO public.investor_alerts (
    alert_type, title, description, severity, published_date, ticker, company, metadata, alert_data
  ) VALUES (
    'realtime_signal',
    COALESCE(v_item.asset_name, v_item.symbol) || ' — ' || initcap(v_item.classification),
    COALESCE(v_item.actionable_summary, v_item.catalyst_explanation, 'Real-time investment signal'),
    CASE v_item.urgency_rating WHEN 'critical' THEN 'critical' WHEN 'high' THEN 'high' WHEN 'medium' THEN 'medium' ELSE 'low' END,
    now(),
    v_item.symbol,
    v_item.asset_name,
    jsonb_build_object('source_id', v_item.id, 'source','analyst_realtime_alert','platform','investor','classification', v_item.classification, 'alert_category', v_item.alert_category, 'confidence_score', v_item.confidence_score),
    jsonb_build_object('signals', v_item.signals, 'risk_disclaimer', v_item.risk_disclaimer, 'expires_at', v_item.expires_at, 'urgency', v_item.urgency_rating)
  ) RETURNING id INTO v_new;
  UPDATE public.realtime_investment_alerts SET status='promoted' WHERE id=_id;
  RETURN jsonb_build_object('ok',true,'promoted_id',v_new,'platform','investor');
EXCEPTION WHEN OTHERS THEN RETURN jsonb_build_object('ok',false,'error',SQLERRM); END; $$;

CREATE OR REPLACE FUNCTION public.promote_analyst_discovery_pick(_id uuid, _platform text DEFAULT 'both')
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_item public.discovery_engine_results%ROWTYPE; v_new uuid;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RETURN jsonb_build_object('ok',false,'error','Admin required'); END IF;
  SELECT * INTO v_item FROM public.discovery_engine_results WHERE id = _id;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','Not found'); END IF;
  INSERT INTO public.platform_discovery_picks (
    source_id, symbol, asset_name, asset_type, discovery_bucket, sector, thesis,
    catalysts, risks, score, conviction, valuation_metrics, momentum_metrics,
    earnings_growth, analyst_sentiment, volatility_metrics, platform, promoted_by
  ) VALUES (
    v_item.id, v_item.symbol, v_item.asset_name, v_item.asset_type, v_item.discovery_bucket,
    v_item.sector, v_item.thesis, v_item.catalysts, v_item.risks, v_item.score,
    v_item.conviction, v_item.valuation_metrics, v_item.momentum_metrics,
    v_item.earnings_growth, v_item.analyst_sentiment, v_item.volatility_metrics,
    COALESCE(NULLIF(_platform,''),'both'), auth.uid()
  ) RETURNING id INTO v_new;
  UPDATE public.discovery_engine_results SET status='promoted', target_platform=COALESCE(_platform,target_platform) WHERE id=_id;
  RETURN jsonb_build_object('ok',true,'promoted_id',v_new,'platform',_platform);
EXCEPTION WHEN OTHERS THEN RETURN jsonb_build_object('ok',false,'error',SQLERRM); END; $$;

CREATE OR REPLACE FUNCTION public.promote_analyst_investor_segment(_id uuid, _platform text DEFAULT 'both')
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_item public.investor_segments%ROWTYPE; v_new uuid;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RETURN jsonb_build_object('ok',false,'error','Admin required'); END IF;
  SELECT * INTO v_item FROM public.investor_segments WHERE id = _id;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','Not found'); END IF;
  INSERT INTO public.platform_investor_segments (
    source_id, primary_segment, secondary_segments, segment_confidence, behavioural_signals,
    risk_tolerance, engagement_score, recommended_assets, recommended_portfolios,
    recommended_content, recommended_alerts, recommended_watchlists, summary, platform, promoted_by
  ) VALUES (
    v_item.id, v_item.primary_segment, v_item.secondary_segments, v_item.segment_confidence,
    v_item.behavioural_signals, v_item.risk_tolerance, v_item.engagement_score,
    v_item.recommended_assets, v_item.recommended_portfolios, v_item.recommended_content,
    v_item.recommended_alerts, v_item.recommended_watchlists, v_item.summary,
    COALESCE(NULLIF(_platform,''),'both'), auth.uid()
  ) RETURNING id INTO v_new;
  UPDATE public.investor_segments SET status='promoted', target_platform=COALESCE(_platform,target_platform) WHERE id=_id;
  RETURN jsonb_build_object('ok',true,'promoted_id',v_new,'platform',_platform);
EXCEPTION WHEN OTHERS THEN RETURN jsonb_build_object('ok',false,'error',SQLERRM); END; $$;
