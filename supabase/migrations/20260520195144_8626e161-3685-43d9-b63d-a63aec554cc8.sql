
-- 1. promote_analyst_benchmark_report -> market_trends
CREATE OR REPLACE FUNCTION public.promote_analyst_benchmark_report(_id uuid, _platform text DEFAULT 'both')
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='public' AS $$
DECLARE r public.analyst_benchmark_reports%ROWTYPE; v_platform text; new_id uuid;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RETURN jsonb_build_object('ok',false,'error','Admin required'); END IF;
  v_platform := COALESCE(NULLIF(_platform,''),'both');
  SELECT * INTO r FROM public.analyst_benchmark_reports WHERE id=_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','Not found'); END IF;
  INSERT INTO public.market_trends(title, description, impact, timeframe, is_published, created_by, platform, source, source_id)
  VALUES(
    COALESCE(NULLIF(r.headline,''),'AI Benchmark Report'),
    left(COALESCE(NULLIF(r.executive_summary,''), NULLIF(r.mobile_summary,''), NULLIF(r.full_commentary,''),'AI benchmark report'),2000),
    'High','30d', true, auth.uid(), v_platform, 'ai_benchmark_report', r.id
  ) RETURNING id INTO new_id;
  UPDATE public.analyst_benchmark_reports SET status='promoted', target_platform=v_platform, reviewed_at=now(), reviewed_by=auth.uid() WHERE id=_id;
  RETURN jsonb_build_object('ok',true,'promoted_id',new_id,'platform',v_platform);
EXCEPTION WHEN OTHERS THEN RETURN jsonb_build_object('ok',false,'error',SQLERRM); END $$;

-- 2. promote_analyst_watchlist_entry -> platform_curated_watchlist (finance only)
CREATE OR REPLACE FUNCTION public.promote_analyst_watchlist_entry(_id uuid, _platform text DEFAULT 'finance')
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='public' AS $$
DECLARE r public.analyst_dynamic_watchlist%ROWTYPE; v_platform text := 'finance'; new_id uuid;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RETURN jsonb_build_object('ok',false,'error','Admin required'); END IF;
  SELECT * INTO r FROM public.analyst_dynamic_watchlist WHERE id=_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','Not found'); END IF;
  INSERT INTO public.platform_curated_watchlist(source_id, symbol, asset_name, asset_type, trigger_type, watchlist_reason, catalyst_summary, support_resistance, entry_risk_level, momentum_score, alert_urgency_score, confidence_score, signals, platform, expires_at, promoted_by, status)
  VALUES(r.id, r.symbol, r.asset_name, r.asset_type, r.trigger_type, r.watchlist_reason, r.catalyst_summary, r.support_resistance, r.entry_risk_level, r.momentum_score, r.alert_urgency_score, r.confidence_score, COALESCE(r.signals,'[]'::jsonb), v_platform, r.expires_at, auth.uid(),'active')
  RETURNING id INTO new_id;
  UPDATE public.analyst_dynamic_watchlist SET status='promoted', target_platform=v_platform, reviewed_at=now(), reviewed_by=auth.uid() WHERE id=_id;
  RETURN jsonb_build_object('ok',true,'promoted_id',new_id,'platform',v_platform);
EXCEPTION WHEN OTHERS THEN RETURN jsonb_build_object('ok',false,'error',SQLERRM); END $$;

-- 3. promote_etf_fund_analysis -> platform_fund_analyses
CREATE OR REPLACE FUNCTION public.promote_etf_fund_analysis(_id uuid, _platform text DEFAULT 'both')
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='public' AS $$
DECLARE r public.etf_fund_analyses%ROWTYPE; v_platform text; new_id uuid;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RETURN jsonb_build_object('ok',false,'error','Admin required'); END IF;
  v_platform := COALESCE(NULLIF(_platform,''),'both');
  SELECT * INTO r FROM public.etf_fund_analyses WHERE id=_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','Not found'); END IF;
  INSERT INTO public.platform_fund_analyses(source_id, ticker, fund_name, fund_type, asset_class, region, summary, pros, cons, suitable_investor_types, comparative_analysis, trend_commentary, overall_score, holdings_concentration, sector_exposure, historical_performance, fee_analysis, fund_flows, manager_performance, volatility_metrics, platform, promoted_by, status)
  VALUES(r.id, r.ticker, r.fund_name, r.fund_type, r.asset_class, r.region, r.summary, COALESCE(r.pros,'[]'::jsonb), COALESCE(r.cons,'[]'::jsonb), COALESCE(r.suitable_investor_types,'[]'::jsonb), r.comparative_analysis, r.trend_commentary, r.overall_score, COALESCE(r.holdings_concentration,'{}'::jsonb), COALESCE(r.sector_exposure,'{}'::jsonb), COALESCE(r.historical_performance,'{}'::jsonb), COALESCE(r.fee_analysis,'{}'::jsonb), COALESCE(r.fund_flows,'{}'::jsonb), COALESCE(r.manager_performance,'{}'::jsonb), COALESCE(r.volatility_metrics,'{}'::jsonb), v_platform, auth.uid(),'active')
  RETURNING id INTO new_id;
  UPDATE public.etf_fund_analyses SET status='promoted', target_platform=v_platform WHERE id=_id;
  RETURN jsonb_build_object('ok',true,'promoted_id',new_id,'platform',v_platform);
EXCEPTION WHEN OTHERS THEN RETURN jsonb_build_object('ok',false,'error',SQLERRM); END $$;

-- 4. promote_realtime_alert -> investor_alerts (investor only)
CREATE OR REPLACE FUNCTION public.promote_realtime_alert(_id uuid, _platform text DEFAULT 'investor')
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='public' AS $$
DECLARE r public.realtime_investment_alerts%ROWTYPE; new_id uuid;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RETURN jsonb_build_object('ok',false,'error','Admin required'); END IF;
  SELECT * INTO r FROM public.realtime_investment_alerts WHERE id=_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','Not found'); END IF;
  INSERT INTO public.investor_alerts(alert_type, title, description, severity, published_date, ticker, company, metadata, alert_data)
  VALUES(
    COALESCE(NULLIF(r.alert_category,''),'realtime_signal'),
    COALESCE(NULLIF(r.symbol,'') || COALESCE(' — '||NULLIF(r.asset_name,''),''), 'Real-time Signal'),
    left(COALESCE(NULLIF(r.actionable_summary,''), NULLIF(r.catalyst_explanation,''),'Real-time investment alert'),2000),
    CASE lower(COALESCE(r.urgency_rating,'medium'))
      WHEN 'critical' THEN 'critical' WHEN 'high' THEN 'high' WHEN 'low' THEN 'info' ELSE 'warning' END,
    now(), r.symbol, r.asset_name,
    jsonb_build_object('source','realtime_investment_alerts','source_id',r.id,'classification',r.classification,'urgency_rating',r.urgency_rating,'confidence_score',r.confidence_score,'expires_at',r.expires_at),
    jsonb_build_object('signals',COALESCE(r.signals,'[]'::jsonb),'source_refs',COALESCE(r.source_refs,'[]'::jsonb),'catalyst_explanation',r.catalyst_explanation,'risk_disclaimer',r.risk_disclaimer)
  ) RETURNING id INTO new_id;
  UPDATE public.realtime_investment_alerts SET status='promoted', target_platform='investor' WHERE id=_id;
  RETURN jsonb_build_object('ok',true,'promoted_id',new_id,'platform','investor');
EXCEPTION WHEN OTHERS THEN RETURN jsonb_build_object('ok',false,'error',SQLERRM); END $$;

-- 5. promote_analyst_discovery_pick -> platform_discovery_picks
CREATE OR REPLACE FUNCTION public.promote_analyst_discovery_pick(_id uuid, _platform text DEFAULT 'both')
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='public' AS $$
DECLARE r public.discovery_engine_results%ROWTYPE; v_platform text; new_id uuid;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RETURN jsonb_build_object('ok',false,'error','Admin required'); END IF;
  v_platform := COALESCE(NULLIF(_platform,''),'both');
  SELECT * INTO r FROM public.discovery_engine_results WHERE id=_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','Not found'); END IF;
  INSERT INTO public.platform_discovery_picks(source_id, symbol, asset_name, asset_type, discovery_bucket, sector, thesis, catalysts, risks, score, conviction, valuation_metrics, momentum_metrics, earnings_growth, analyst_sentiment, volatility_metrics, platform, promoted_by, status)
  VALUES(r.id, r.symbol, r.asset_name, r.asset_type, r.discovery_bucket, r.sector, r.thesis, COALESCE(r.catalysts,'[]'::jsonb), COALESCE(r.risks,'[]'::jsonb), r.score, r.conviction, COALESCE(r.valuation_metrics,'{}'::jsonb), COALESCE(r.momentum_metrics,'{}'::jsonb), COALESCE(r.earnings_growth,'{}'::jsonb), COALESCE(r.analyst_sentiment,'{}'::jsonb), COALESCE(r.volatility_metrics,'{}'::jsonb), v_platform, auth.uid(),'active')
  RETURNING id INTO new_id;
  UPDATE public.discovery_engine_results SET status='promoted', target_platform=v_platform WHERE id=_id;
  RETURN jsonb_build_object('ok',true,'promoted_id',new_id,'platform',v_platform);
EXCEPTION WHEN OTHERS THEN RETURN jsonb_build_object('ok',false,'error',SQLERRM); END $$;

-- 6. promote_analyst_investor_segment -> platform_investor_segments
CREATE OR REPLACE FUNCTION public.promote_analyst_investor_segment(_id uuid, _platform text DEFAULT 'both')
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='public' AS $$
DECLARE r public.investor_segments%ROWTYPE; v_platform text; new_id uuid;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN RETURN jsonb_build_object('ok',false,'error','Admin required'); END IF;
  v_platform := COALESCE(NULLIF(_platform,''),'both');
  SELECT * INTO r FROM public.investor_segments WHERE id=_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'error','Not found'); END IF;
  INSERT INTO public.platform_investor_segments(source_id, primary_segment, secondary_segments, segment_confidence, behavioural_signals, risk_tolerance, engagement_score, recommended_assets, recommended_portfolios, recommended_content, recommended_alerts, recommended_watchlists, summary, platform, promoted_by, status)
  VALUES(r.id, r.primary_segment, COALESCE(r.secondary_segments,'[]'::jsonb), r.segment_confidence, COALESCE(r.behavioural_signals,'{}'::jsonb), r.risk_tolerance, r.engagement_score, COALESCE(r.recommended_assets,'[]'::jsonb), COALESCE(r.recommended_portfolios,'[]'::jsonb), COALESCE(r.recommended_content,'[]'::jsonb), COALESCE(r.recommended_alerts,'[]'::jsonb), COALESCE(r.recommended_watchlists,'[]'::jsonb), r.summary, v_platform, auth.uid(),'active')
  RETURNING id INTO new_id;
  UPDATE public.investor_segments SET status='promoted', target_platform=v_platform WHERE id=_id;
  RETURN jsonb_build_object('ok',true,'promoted_id',new_id,'platform',v_platform);
EXCEPTION WHEN OTHERS THEN RETURN jsonb_build_object('ok',false,'error',SQLERRM); END $$;

-- Backfill: prior promoted analyst rows that never reached destination tables
INSERT INTO public.platform_fund_analyses(source_id, ticker, fund_name, fund_type, asset_class, region, summary, pros, cons, suitable_investor_types, comparative_analysis, trend_commentary, overall_score, holdings_concentration, sector_exposure, historical_performance, fee_analysis, fund_flows, manager_performance, volatility_metrics, platform, status)
SELECT r.id, r.ticker, r.fund_name, r.fund_type, r.asset_class, r.region, r.summary, COALESCE(r.pros,'[]'::jsonb), COALESCE(r.cons,'[]'::jsonb), COALESCE(r.suitable_investor_types,'[]'::jsonb), r.comparative_analysis, r.trend_commentary, r.overall_score, COALESCE(r.holdings_concentration,'{}'::jsonb), COALESCE(r.sector_exposure,'{}'::jsonb), COALESCE(r.historical_performance,'{}'::jsonb), COALESCE(r.fee_analysis,'{}'::jsonb), COALESCE(r.fund_flows,'{}'::jsonb), COALESCE(r.manager_performance,'{}'::jsonb), COALESCE(r.volatility_metrics,'{}'::jsonb), COALESCE(r.target_platform,'both'),'active'
FROM public.etf_fund_analyses r
WHERE r.status='promoted' AND NOT EXISTS (SELECT 1 FROM public.platform_fund_analyses p WHERE p.source_id=r.id);

INSERT INTO public.platform_curated_watchlist(source_id, symbol, asset_name, asset_type, trigger_type, watchlist_reason, catalyst_summary, support_resistance, entry_risk_level, momentum_score, alert_urgency_score, confidence_score, signals, platform, expires_at, status)
SELECT r.id, r.symbol, r.asset_name, r.asset_type, r.trigger_type, r.watchlist_reason, r.catalyst_summary, r.support_resistance, r.entry_risk_level, r.momentum_score, r.alert_urgency_score, r.confidence_score, COALESCE(r.signals,'[]'::jsonb),'finance', r.expires_at,'active'
FROM public.analyst_dynamic_watchlist r
WHERE r.status='promoted' AND NOT EXISTS (SELECT 1 FROM public.platform_curated_watchlist p WHERE p.source_id=r.id);

INSERT INTO public.platform_discovery_picks(source_id, symbol, asset_name, asset_type, discovery_bucket, sector, thesis, catalysts, risks, score, conviction, valuation_metrics, momentum_metrics, earnings_growth, analyst_sentiment, volatility_metrics, platform, status)
SELECT r.id, r.symbol, r.asset_name, r.asset_type, r.discovery_bucket, r.sector, r.thesis, COALESCE(r.catalysts,'[]'::jsonb), COALESCE(r.risks,'[]'::jsonb), r.score, r.conviction, COALESCE(r.valuation_metrics,'{}'::jsonb), COALESCE(r.momentum_metrics,'{}'::jsonb), COALESCE(r.earnings_growth,'{}'::jsonb), COALESCE(r.analyst_sentiment,'{}'::jsonb), COALESCE(r.volatility_metrics,'{}'::jsonb), COALESCE(r.target_platform,'both'),'active'
FROM public.discovery_engine_results r
WHERE r.status='promoted' AND NOT EXISTS (SELECT 1 FROM public.platform_discovery_picks p WHERE p.source_id=r.id);

INSERT INTO public.platform_investor_segments(source_id, primary_segment, secondary_segments, segment_confidence, behavioural_signals, risk_tolerance, engagement_score, recommended_assets, recommended_portfolios, recommended_content, recommended_alerts, recommended_watchlists, summary, platform, status)
SELECT r.id, r.primary_segment, COALESCE(r.secondary_segments,'[]'::jsonb), r.segment_confidence, COALESCE(r.behavioural_signals,'{}'::jsonb), r.risk_tolerance, r.engagement_score, COALESCE(r.recommended_assets,'[]'::jsonb), COALESCE(r.recommended_portfolios,'[]'::jsonb), COALESCE(r.recommended_content,'[]'::jsonb), COALESCE(r.recommended_alerts,'[]'::jsonb), COALESCE(r.recommended_watchlists,'[]'::jsonb), r.summary, COALESCE(r.target_platform,'both'),'active'
FROM public.investor_segments r
WHERE r.status='promoted' AND NOT EXISTS (SELECT 1 FROM public.platform_investor_segments p WHERE p.source_id=r.id);

INSERT INTO public.investor_alerts(alert_type, title, description, severity, published_date, ticker, company, metadata, alert_data)
SELECT
  COALESCE(NULLIF(r.alert_category,''),'realtime_signal'),
  COALESCE(NULLIF(r.symbol,'') || COALESCE(' — '||NULLIF(r.asset_name,''),''),'Real-time Signal'),
  left(COALESCE(NULLIF(r.actionable_summary,''), NULLIF(r.catalyst_explanation,''),'Real-time investment alert'),2000),
  CASE lower(COALESCE(r.urgency_rating,'medium'))
    WHEN 'critical' THEN 'critical' WHEN 'high' THEN 'high' WHEN 'low' THEN 'info' ELSE 'warning' END,
  COALESCE(r.updated_at, r.created_at, now()), r.symbol, r.asset_name,
  jsonb_build_object('source','realtime_investment_alerts','source_id',r.id,'classification',r.classification,'urgency_rating',r.urgency_rating,'confidence_score',r.confidence_score,'expires_at',r.expires_at),
  jsonb_build_object('signals',COALESCE(r.signals,'[]'::jsonb),'source_refs',COALESCE(r.source_refs,'[]'::jsonb),'catalyst_explanation',r.catalyst_explanation,'risk_disclaimer',r.risk_disclaimer)
FROM public.realtime_investment_alerts r
WHERE r.status='promoted'
  AND NOT EXISTS (SELECT 1 FROM public.investor_alerts a WHERE a.metadata->>'source'='realtime_investment_alerts' AND a.metadata->>'source_id'=r.id::text);
