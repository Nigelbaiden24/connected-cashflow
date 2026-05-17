
REVOKE EXECUTE ON FUNCTION public.promote_analyst_benchmark_report(uuid, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.promote_analyst_watchlist_entry(uuid, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.promote_etf_fund_analysis(uuid, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.promote_realtime_alert(uuid, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.promote_analyst_discovery_pick(uuid, text) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.promote_analyst_investor_segment(uuid, text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.promote_analyst_benchmark_report(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.promote_analyst_watchlist_entry(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.promote_etf_fund_analysis(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.promote_realtime_alert(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.promote_analyst_discovery_pick(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.promote_analyst_investor_segment(uuid, text) TO authenticated;
