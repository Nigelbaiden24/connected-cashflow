## Analyst AI Pipeline — End-to-End MVP

A 6-layer autonomous research pipeline: **Scrape → Classify → Score → Generate → Validate → Approve/Publish**. Built on Lovable Cloud + Lovable AI Gateway + Firecrawl (already connected). New "Analyst Queue" admin tab is the human approval gate.

### Layer 1 — Scrapers (free + Firecrawl)
New edge function `analyst-scrape-orchestrator` runs every 30 min via pg_cron. Sources:
- **Yahoo Finance** (free quote/chart endpoints) — prices, movers
- **SEC EDGAR** (free) — latest 8-K/10-Q filings
- **Companies House** (existing scraper) — UK filings
- **Reddit** (free .json endpoints) — r/wallstreetbets, r/stocks, r/investing sentiment
- **Google Trends** (free serpapi-style scrape via Firecrawl) — search momentum
- **News + X/TradingView** — Firecrawl `search` + `scrape`
All raw rows land in `analyst_raw_signals` (one row per item, deduped by `source_url` hash).

### Layer 2 — Classification
Edge function `analyst-classify` picks unclassified rows in batches of 25 and calls Lovable AI (`google/gemini-3-flash-preview`) with a tool-call schema returning:
`category` (Macro News, Equity News, Earnings, Momentum, Technical Breakout, Value, Growth, ETF Flow, Insider, Institutional, Retail Sentiment, Risk Event, Volatility), `tickers[]`, `sectors[]`, `regions[]`, `sentiment` (-1..1), `urgency` (0..5).
Writes results to `analyst_signals` (classified, enriched).

### Layer 3 — Scoring Engine
Edge function `analyst-score` aggregates signals per (ticker | theme | sector) into `analyst_opportunities` with:
- `conviction` 0–5 (per project standard)
- `opportunity_score` 0–100 (weighted: sentiment 25%, urgency 20%, source diversity 25%, momentum 15%, recency 15%)
- `risk_score` 0–100
- `time_horizon` (intraday / swing / long-term)
- `evidence[]` — array of signal IDs that triggered it

### Layer 4 — Content Generation
Edge function `analyst-generate-brief` produces analyst-grade output per opportunity, using one of 4 personas chosen by category:
- Equity Research Analyst (Equity/Earnings)
- Macro Strategist (Macro News, Risk Event)
- ETF/Fund Analyst (ETF Flow, Sector Rotation)
- Quant Screener (Momentum, Technical Breakout, Value, Growth)
Each brief: thesis, catalyst, evidence citations, key levels, risks, suggested action. Stored in `analyst_briefs`.

### Layer 5 — Compliance / Hallucination Filter
Same edge function self-reviews with a second AI pass that returns `compliance_pass` (bool) + `flags[]`:
- Every numeric claim must trace to an evidence signal
- No price targets without source
- No unverifiable forward statements
- FCA-style "not advice" footer auto-appended
Failed briefs get `status='quarantined'` (visible in admin but flagged red).

### Layer 6 — Admin Approval Queue
New tab **Analyst Queue** in flowpulse/admin sidebar:
- Card list grouped by status (Pending, Quarantined, Promoted, Rejected)
- Each card: title, conviction badge (0–5), opportunity score ring, risk meter, persona, evidence count, full brief preview
- **Promote** → inserts into existing `opportunities` table (Opportunity Intelligence on Finance + Investor frontends), GBP normalised
- **Reject** → marks rejected, AI uses rejected examples as negative training context for future runs
- Filters: category, conviction ≥, source, ticker, search
- Auto-refresh every 60s; manual "Run pipeline now" button

### Database (single migration)
- `analyst_raw_signals` — raw scrape rows
- `analyst_signals` — classified
- `analyst_opportunities` — scored
- `analyst_briefs` — generated content + compliance result + status
- `analyst_pipeline_runs` — observability (rows scraped, classified, generated, errors, duration)
- All admin-only RLS (admin role check)
- pg_cron job: every 30 min → calls `analyst-scrape-orchestrator` which chains classify → score → generate → validate

### Frontend
- New route `/admin/analyst-queue` + sidebar entry under Scraper category
- Components: `AnalystQueueDashboard`, `AnalystBriefCard`, `PipelineRunStats`, `PromoteRejectActions`
- Reuses existing dark slate + glassmorphism tokens, conviction 0–5 visuals from standardized scoring memory

### Out of scope (this iteration)
- Paid APIs (Alpha Vantage, Finnhub, News API) — can add later
- Insider trading / institutional 13F (requires paid feeds)
- Auto-publish without human review (you chose dedicated queue with promote/reject)

### Build order
1. Migration (5 new tables + cron + RLS)
2. Scraper orchestrator edge function
3. Classify + Score + Generate + Validate edge functions
4. Admin Queue UI + sidebar entry + promote/reject actions
5. Wire pg_cron and seed first run

This is a sizable build — expect 1 migration + ~5 new edge functions + ~6 new components.
