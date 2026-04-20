import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Database,
  Globe2,
  Sparkles,
  TrendingUp,
  Building2,
  Briefcase,
  ShieldCheck,
  Radar,
  LineChart,
  Target,
  Users,
  Zap,
  BarChart3,
  Network,
  Eye,
  Brain,
  Layers,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImg from "@/assets/about-hero-platform.jpg";
import warroomImg from "@/assets/about-warroom.jpg";
import dataLayersImg from "@/assets/about-data-layers.jpg";
import dashboardImg from "@/assets/about-dashboard.jpg";

interface Props {
  onNavigate: (section: string) => void;
}

export function AboutFlowpulse({ onNavigate }: Props) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  const pillars = [
    {
      icon: Database,
      title: "The Private Markets, Decoded",
      copy: "A unified intelligence graph spanning 4M+ private companies, 250K+ deals, 90K+ funds and the people who move them — refreshed in real time.",
    },
    {
      icon: Radar,
      title: "Live Deal Intelligence",
      copy: "M&A, fundraises, IPOs, distressed assets and alternative opportunities surfaced the moment they break — across 15+ asset categories worldwide.",
    },
    {
      icon: Brain,
      title: "Institutional-Grade AI",
      copy: "Multi-model AI engines run valuation, scenario, stress-test and conviction scoring side-by-side with human analysts — not as a gimmick.",
    },
    {
      icon: Network,
      title: "Three Platforms. One Spine.",
      copy: "Finance, Investor and Business — each tailored to a different operator, all powered by the same proprietary data and analytics layer.",
    },
  ];

  const capabilities = [
    { icon: LineChart, label: "Company & fund intelligence" },
    { icon: Target, label: "Deal sourcing & pipeline" },
    { icon: BarChart3, label: "Valuation & comparables" },
    { icon: Layers, label: "Scenario & stress testing" },
    { icon: Eye, label: "Investor & LP discovery" },
    { icon: ShieldCheck, label: "Compliance & risk" },
    { icon: Users, label: "CRM & client management" },
    { icon: Zap, label: "Workflow automation" },
  ];

  const platforms = [
    {
      name: "Flowpulse Finance",
      tag: "For Advisors & Wealth Managers",
      icon: TrendingUp,
      accent: "from-sky-500/20 via-blue-500/10 to-transparent",
      ring: "ring-sky-400/30",
      points: [
        "Live market & fund database",
        "AI Analyst chatbot (Theodore)",
        "Client CRM, planning & reporting",
        "Compliance & document automation",
      ],
    },
    {
      name: "Flowpulse Investor",
      tag: "For Investors & Family Offices",
      icon: Briefcase,
      accent: "from-violet-500/25 via-fuchsia-500/10 to-transparent",
      ring: "ring-violet-400/30",
      points: [
        "Pitchbook-style deal intelligence",
        "Startup & PE/VC discovery",
        "Scenario & AI stress testing",
        "Portfolio & J-curve analytics",
      ],
    },
    {
      name: "Flowpulse Business",
      tag: "For Operators & Founders",
      icon: Building2,
      accent: "from-emerald-500/20 via-teal-500/10 to-transparent",
      ring: "ring-emerald-400/30",
      points: [
        "Project, task & team operations",
        "Workflow automation engine",
        "Documents & e-signatures",
        "Real-time business analytics",
      ],
    },
  ];

  const stats = [
    { value: "4M+", label: "Companies tracked" },
    { value: "250K+", label: "Deals indexed" },
    { value: "90K+", label: "Funds & investors" },
    { value: "15+", label: "Asset categories" },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-background text-foreground">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Flowpulse global intelligence network"
            className="h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(222,47%,5%)]/40 via-[hsl(222,47%,5%)]/70 to-[hsl(222,47%,5%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.18),transparent_60%)]" />
        </div>

        <div className="relative container mx-auto px-4 pt-24 pb-32 md:pt-32 md:pb-44">
          <div className="max-w-4xl">
            <Badge className="bg-white/5 border border-white/10 text-white/80 backdrop-blur-md hover:bg-white/10">
              <Sparkles className="w-3.5 h-3.5 mr-2 text-sky-300" />
              About The Flowpulse Group
            </Badge>

            <h1 className="mt-6 text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
              The intelligence layer
              <br />
              <span className="bg-gradient-to-r from-sky-300 via-cyan-200 to-violet-300 bg-clip-text text-transparent">
                for modern capital.
              </span>
            </h1>

            <p className="mt-8 text-lg md:text-xl text-white/70 max-w-2xl leading-relaxed">
              Flowpulse is a private-markets intelligence and workflow platform — the
              category Pitchbook, Preqin and CB Insights pioneered, rebuilt for the AI
              era and engineered for the operators who actually move capital.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={() => navigate("/pricing")}
                className="bg-white text-slate-900 hover:bg-white/90 font-semibold"
              >
                Explore the platforms
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onNavigate("contact")}
                className="bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-md"
              >
                Speak with the team
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 rounded-2xl overflow-hidden border border-white/10 backdrop-blur-md max-w-3xl">
              {stats.map((s) => (
                <div key={s.label} className="bg-[hsl(222,47%,7%)]/80 px-5 py-6">
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
                    {s.value}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-widest text-white/50">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="relative py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <div className="text-xs uppercase tracking-[0.3em] text-sky-300/80 font-semibold">
                Our mission
              </div>
              <h2 className="mt-4 text-4xl md:text-5xl font-bold leading-tight">
                Replace the spreadsheet, the screen-scrape and the gut feel.
              </h2>
            </div>
            <div className="lg:col-span-7 space-y-6 text-white/70 text-lg leading-relaxed">
              <p>
                For thirty years, the world's most consequential investment decisions have
                been made on a stack of disconnected tools — terminals built in the 90s,
                CRMs designed for SaaS sales teams, and PDFs emailed at 2 a.m.
              </p>
              <p>
                Flowpulse was built to retire that workflow. We unify the data, analytics,
                deal flow and client operations of an entire investment practice into a
                single, AI-native platform — so analysts can focus on judgement, not
                janitorial work.
              </p>
              <p className="text-white/85">
                The result is what an institutional research desk, a private-markets data
                provider and a modern operating system would look like if you built them
                today, from a blank page, together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <section className="relative py-24 bg-gradient-to-b from-transparent via-[hsl(222,47%,7%)] to-transparent">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <div className="text-xs uppercase tracking-[0.3em] text-violet-300/80 font-semibold">
              What Flowpulse is
            </div>
            <h2 className="mt-4 text-4xl md:text-5xl font-bold">
              A research desk, a deal terminal and an operating system —
              <span className="text-white/50"> in one.</span>
            </h2>
          </div>

          <div className="mt-16 grid md:grid-cols-2 gap-px bg-white/10 rounded-3xl overflow-hidden border border-white/10">
            {pillars.map((p) => (
              <div
                key={p.title}
                className="group relative bg-[hsl(222,47%,6%)] p-10 hover:bg-[hsl(222,47%,8%)] transition-colors"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500/20 to-violet-500/20 ring-1 ring-white/10">
                  <p.icon className="w-6 h-6 text-sky-300" />
                </div>
                <h3 className="mt-6 text-2xl font-semibold">{p.title}</h3>
                <p className="mt-3 text-white/65 leading-relaxed">{p.copy}</p>
                <div className="absolute inset-x-10 bottom-0 h-px bg-gradient-to-r from-transparent via-sky-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PITCHBOOK COMPARISON / WAR ROOM IMAGE */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-tr from-sky-500/20 via-transparent to-violet-500/20 blur-2xl rounded-[2rem]" />
              <div className="relative rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl">
                <img
                  src={warroomImg}
                  alt="Institutional analyst war room"
                  loading="lazy"
                  className="w-full h-auto"
                />
              </div>
            </div>
            <div>
              <Badge className="bg-sky-500/10 border border-sky-400/30 text-sky-200">
                Built for the institutional standard
              </Badge>
              <h2 className="mt-6 text-4xl md:text-5xl font-bold leading-tight">
                The depth of Pitchbook.
                <br />
                <span className="text-white/50">The speed of a startup.</span>
              </h2>
              <p className="mt-6 text-white/70 text-lg leading-relaxed">
                We benchmark against the platforms that institutional desks already pay
                six figures a seat for — and rebuild every workflow around live data,
                native AI, and an interface that doesn't feel like 2008.
              </p>

              <div className="mt-10 grid grid-cols-2 gap-3">
                {capabilities.map((c) => (
                  <div
                    key={c.label}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur-md hover:border-white/20 hover:bg-white/[0.06] transition-colors"
                  >
                    <c.icon className="w-4 h-4 text-sky-300 flex-shrink-0" />
                    <span className="text-sm text-white/85">{c.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THREE PLATFORMS */}
      <section className="relative py-24 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.08),transparent_60%)]" />
        <div className="relative container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="text-xs uppercase tracking-[0.3em] text-emerald-300/80 font-semibold">
              The product
            </div>
            <h2 className="mt-4 text-4xl md:text-5xl font-bold">
              One intelligence engine.
              <br />
              <span className="bg-gradient-to-r from-sky-300 via-violet-300 to-emerald-300 bg-clip-text text-transparent">
                Three purpose-built platforms.
              </span>
            </h2>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-6">
            {platforms.map((pf) => (
              <div
                key={pf.name}
                className={`group relative rounded-2xl border border-white/10 bg-[hsl(222,47%,6%)] p-8 backdrop-blur-md overflow-hidden hover:border-white/20 transition-all hover:-translate-y-1 ring-1 ${pf.ring}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${pf.accent} opacity-50 group-hover:opacity-80 transition-opacity`} />
                <div className="relative">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 ring-1 ring-white/10">
                    <pf.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="mt-6 text-xs uppercase tracking-widest text-white/50">
                    {pf.tag}
                  </div>
                  <h3 className="mt-2 text-2xl font-semibold">{pf.name}</h3>
                  <ul className="mt-6 space-y-3">
                    {pf.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-2 text-sm text-white/75">
                        <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-sky-300/80 flex-shrink-0" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DATA LAYERS IMAGE */}
      <section className="relative py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="text-xs uppercase tracking-[0.3em] text-cyan-300/80 font-semibold">
                The Flowpulse data layer
              </div>
              <h2 className="mt-4 text-4xl md:text-5xl font-bold leading-tight">
                Every signal, every source — stitched into one graph.
              </h2>
              <p className="mt-6 text-white/70 text-lg leading-relaxed">
                Filings, news, transactions, fund flows, alternative datasets and
                proprietary research are normalised, linked and continuously enriched.
                Nothing is static. Nothing is siloed. Every entity — company, deal, fund,
                person — is a living object in the graph.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-px bg-white/10 rounded-xl overflow-hidden border border-white/10">
                {[
                  { v: "Live", l: "Refresh" },
                  { v: "120+", l: "Sources" },
                  { v: "AI", l: "Enriched" },
                ].map((x) => (
                  <div key={x.l} className="bg-[hsl(222,47%,7%)] px-4 py-5 text-center">
                    <div className="text-2xl font-bold">{x.v}</div>
                    <div className="text-[10px] uppercase tracking-widest text-white/50 mt-1">
                      {x.l}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2 relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-violet-500/20 via-transparent to-sky-500/20 blur-2xl rounded-[2rem]" />
              <div className="relative rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl">
                <img
                  src={dataLayersImg}
                  alt="Layered Flowpulse data graph"
                  loading="lazy"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHO WE SERVE */}
      <section className="relative py-24 md:py-32 bg-[hsl(222,47%,4%)]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <div className="text-xs uppercase tracking-[0.3em] text-sky-300/80 font-semibold">
              Who we serve
            </div>
            <h2 className="mt-4 text-4xl md:text-5xl font-bold">
              The operators rewriting how capital moves.
            </h2>
          </div>

          <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { t: "Investment Advisors", d: "Wealth managers and IFAs running modern, data-led practices." },
              { t: "Private Equity & VC", d: "Funds sourcing, diligencing and stress-testing deals at speed." },
              { t: "Family Offices", d: "Multi-asset allocators tracking liquid and alternative exposures." },
              { t: "Corporate Development", d: "M&A teams mapping targets, comparables and competitive moves." },
              { t: "Investor Relations", d: "Teams managing LPs, reporting, and capital-raise pipelines." },
              { t: "Founders & Operators", d: "Companies running planning, projects, and reporting in one place." },
              { t: "Recruiters & HR", d: "Talent leaders sourcing across finance, tech and operations." },
              { t: "Research Analysts", d: "Sell-side and independent analysts building defensible theses." },
            ].map((x) => (
              <div
                key={x.t}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 hover:bg-white/[0.05] hover:border-white/20 transition-colors backdrop-blur-md"
              >
                <Globe2 className="w-5 h-5 text-sky-300" />
                <div className="mt-4 text-lg font-semibold">{x.t}</div>
                <div className="mt-2 text-sm text-white/65 leading-relaxed">{x.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DASHBOARD SHOWCASE + CTA */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(56,189,248,0.12),transparent_60%)]" />
        <div className="relative container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-bold leading-tight">
              See what an
              <span className="bg-gradient-to-r from-sky-300 to-violet-300 bg-clip-text text-transparent">
                {" "}AI-native investment platform{" "}
              </span>
              actually feels like.
            </h2>
            <p className="mt-6 text-white/70 text-lg max-w-2xl mx-auto">
              Tour the live product, request institutional access, or talk to the team
              about deploying Flowpulse across your firm.
            </p>
            <div className="mt-10 flex flex-wrap gap-3 justify-center">
              <Button
                size="lg"
                onClick={() => navigate("/pricing")}
                className="bg-white text-slate-900 hover:bg-white/90 font-semibold"
              >
                View pricing & plans
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onNavigate("contact")}
                className="bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-md"
              >
                Book a private demo
              </Button>
            </div>
          </div>

          <div className="relative mt-20 max-w-6xl mx-auto">
            <div className="absolute -inset-6 bg-gradient-to-tr from-sky-500/20 via-violet-500/10 to-emerald-500/20 blur-3xl rounded-[3rem]" />
            <div className="relative rounded-3xl overflow-hidden ring-1 ring-white/10 shadow-[0_30px_120px_-30px_rgba(56,189,248,0.5)]">
              <img
                src={dashboardImg}
                alt="Flowpulse intelligence dashboard"
                loading="lazy"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
