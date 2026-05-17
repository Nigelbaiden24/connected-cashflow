## Goal

Right now the admin "AI Queue" panels (Benchmarks & Trends, Dynamic Watchlist, ETF & Fund Analysis, Real-Time Alerts, Market Commentary, Discovery Engine, Investor Segments) only flip a `status='promoted'` flag on their source tables. The Finance / Investor frontends read from *different* display tables, so promoted items never appear publicly. This plan makes Promote actually publish to the correct frontend tab for each panel, and adds two brand-new enterprise-grade tabs.

## Promotion routing

| Admin AI-Queue panel | Source table | Target frontend tab(s) | Destination table |
|---|---|---|---|
| Benchmarks & Trends | `analyst_benchmark_reports` | Finance + Investor → Benchmarking & Trends | `market_trends` (existing) — new "AI Benchmark Report" section |
| Dynamic Watchlist | `analyst_dynamic_watchlist` | Finance → Watchlists (new "AI Curated" tab) | new `platform_curated_watchlist` |
| ETF & Fund Analysis | `etf_fund_analyses` | Finance + Investor → Fund & ETF Database (new "AI Analysis" tab) | new `platform_fund_analyses` |
| Real-Time Alerts | `realtime_investment_alerts` | Investor → Signals & Alerts | `investor_alerts` (existing, via `alert_type='realtime_signal'`) |
| Market Commentary | `analyst_market_commentary` | Finance + Investor → Market Commentary | `market_commentary` (existing — already wired via `promote_analyst_market_commentary`) |
| Discovery Engine | `analyst_discovery_results` | **NEW** Discovery Engine tab on both platforms | new `platform_discovery_picks` |
| Investor Segments | `analyst_investor_segments` | **NEW** Investor Segments tab on both platforms | new `platform_investor_segments` |

## Backend (single migration)

1. New tables (RLS = authenticated read, admin write):
   - `platform_curated_watchlist` — symbol, asset_name, asset_type, trigger_type, momentum_score, urgency_score, catalyst_summary, signals jsonb, platform, expires_at
   - `platform_fund_analyses` — ticker, fund_name, fund_type, asset_class, overall_score, summary, pros, cons, suitable_investor_types, comparative_analysis, full_payload jsonb, platform
   - `platform_discovery_picks` — title, category, theme, conviction_score, thesis, catalysts, risks, instruments jsonb, region, time_horizon, platform
   - `platform_investor_segments` — segment_name, segment_type, profile, allocation_model, recommended_products jsonb, risk_profile, platform
2. SECURITY DEFINER RPCs (one per panel, mirroring `promote_analyst_market_commentary`):
   - `promote_analyst_benchmark_report(_id, _platform)` → inserts a `market_trends` row tagged `source='ai_analyst_brief'`
   - `promote_analyst_watchlist_entry(_id, _platform)` → inserts into `platform_curated_watchlist`
   - `promote_etf_fund_analysis(_id, _platform)` → inserts into `platform_fund_analyses`
   - `promote_realtime_alert(_id, _platform)` → inserts into `investor_alerts` (forces investor platform)
   - `promote_analyst_discovery_pick(_id, _platform)` → inserts into `platform_discovery_picks`
   - `promote_analyst_investor_segment(_id, _platform)` → inserts into `platform_investor_segments`
   Each RPC also flips the source row to `status='promoted'`, `target_platform`, `reviewed_at`, `reviewed_by`.

## Frontend changes

1. **`PromoteToPlatformButton`** — extend with optional `rpcName` prop. When set, instead of doing a generic `UPDATE`, it calls `supabase.rpc(rpcName, { _id, _platform })`. Falls back to current update behaviour when omitted, so nothing else breaks.
2. **Wire each panel** to the matching RPC:
   - `BenchmarkTrendsPanel` → `promote_analyst_benchmark_report`
   - `DynamicWatchlistPanel` → `promote_analyst_watchlist_entry` (Finance only — hide Investor option)
   - `ETFFundAnalysisPanel` → `promote_etf_fund_analysis`
   - `RealtimeAlertsPanel` → `promote_realtime_alert` (Investor only)
   - `MarketCommentaryPanel` → already wired, just confirm
   - `DiscoveryEnginePanel`, `InvestorSegmentsPanel` → new RPCs
3. **Finance frontend additions:**
   - `src/pages/finance/Watchlists.tsx` — add "AI Curated" tab reading `platform_curated_watchlist` where `platform IN (finance, both, NULL)`
   - `src/pages/finance/FundETFDatabase.tsx` — add "AI Analysis" tab reading `platform_fund_analyses`
   - `src/pages/finance/BenchmarkingTrends.tsx` — add "AI Benchmark Reports" section reading promoted `market_trends`
   - **NEW** `src/pages/finance/DiscoveryEngine.tsx` + sidebar entry
   - **NEW** `src/pages/finance/InvestorSegments.tsx` + sidebar entry
4. **Investor frontend additions:** mirror of the above (minus Watchlists), all rendered in the existing enterprise dark-glass style (slate-950 glass cards, gradient accents, conviction bars, Recharts where appropriate).
5. **Routing:** register the four new routes in `src/App.tsx` under the existing finance/investor layouts; add sidebar items in `FinanceSidebar.tsx` and the investor sidebar.

## Visual standard for the two new tabs

Elite enterprise grade: full-bleed hero with platform-themed gradient (deep blue for Finance, violet for Investor), filter rail (sector/region/conviction/horizon), grid of glass cards with conviction meter, expandable detail drawer showing thesis / catalysts / risks / suggested instruments, sparkline + sector chip row, Pitchbook-style metadata block. Matches the existing AnalystQueueDashboard aesthetic on the admin side so users feel continuity.

## Out of scope

- No changes to scrapers or analyst edge functions themselves — only the promotion path.
- No changes to existing user-owned watchlists; the AI-curated list is a separate read-only tab.

## Order of execution

1. Migration (tables + RPCs + RLS).
2. Extend `PromoteToPlatformButton` with `rpcName` and wire all 7 panels.
3. Add Finance + Investor frontend tabs/pages and sidebar entries.
4. Smoke test: promote one item per panel → verify it appears in the matching frontend tab on the correct platform.
