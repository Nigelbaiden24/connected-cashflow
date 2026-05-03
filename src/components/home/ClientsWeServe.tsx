import { useState } from "react";

import familyOfficesImg from "@/assets/clients/family-offices.png";
import angelInvestorsImg from "@/assets/clients/angel-investors.png";
import investmentClubsImg from "@/assets/clients/investment-clubs.png";
import holdingCompaniesImg from "@/assets/clients/holding-companies.png";
import investorsImg from "@/assets/clients/investors.png";
import smallBusinessBuyersImg from "@/assets/clients/small-business-buyers.png";
import entrepreneursImg from "@/assets/clients/entrepreneurs.png";
import corporateStrategyImg from "@/assets/clients/corporate-strategy.png";
import developmentTeamsImg from "@/assets/clients/development-teams.png";
import contentCreatorsImg from "@/assets/clients/content-creators.png";
import introducersImg from "@/assets/clients/introducers.png";
import vcAnalystsImg from "@/assets/clients/vc-analysts.png";
import hedgeFundImg from "@/assets/clients/hedge-fund.png";
import wealthManagersImg from "@/assets/clients/wealth-managers.png";
import altInvestmentImg from "@/assets/clients/alt-investment.png";
import businessOwnersImg from "@/assets/clients/business-owners.png";

const clientData = [
  {
    name: "Family Offices",
    image: familyOfficesImg,
    description: "Centralise multi-generational wealth tracking, consolidate asset reporting, and streamline governance workflows — all in one unified dashboard built for complex family structures."
  },
  {
    name: "Angel Investor Networking",
    image: angelInvestorsImg,
    description: "Discover curated deal flow, manage your portfolio of early-stage investments, and connect with vetted founders through our intelligent matching and due-diligence tools."
  },
  {
    name: "Investment Clubs",
    image: investmentClubsImg,
    description: "Collaborate on collective investment decisions with shared research, voting tools, and transparent performance tracking across every member's contribution."
  },
  {
    name: "Holding Companies",
    image: holdingCompaniesImg,
    description: "Gain a consolidated view of subsidiary performance, intercompany financials, and strategic KPIs — enabling faster board-level decisions with real-time data."
  },
  {
    name: "Investors",
    image: investorsImg,
    description: "Access deep market analytics, portfolio modelling, and risk assessment tools that help you identify alpha opportunities and manage exposure with precision."
  },
  {
    name: "Small Business Buyers",
    image: smallBusinessBuyersImg,
    description: "Evaluate acquisition targets with integrated valuation models, due-diligence checklists, and financial health scorecards tailored for SME transactions."
  },
  {
    name: "Entrepreneurs",
    image: entrepreneursImg,
    description: "From runway forecasting to investor-ready reporting, get the financial tools you need to scale confidently — without hiring a full finance team."
  },
  {
    name: "Corporate Strategy Teams",
    image: corporateStrategyImg,
    description: "Align strategic planning with real-time financial data, scenario modelling, and competitive intelligence to drive evidence-based growth initiatives."
  },
  {
    name: "Development Teams",
    image: developmentTeamsImg,
    description: "Integrate financial APIs, automate reporting pipelines, and build custom dashboards using our developer-friendly platform with full documentation."
  },
  {
    name: "Financial Content Creators",
    image: contentCreatorsImg,
    description: "Leverage real-time market data, interactive charts, and embeddable widgets to create compelling financial content that engages and educates your audience."
  },
  {
    name: "Introducers & Intermediaries",
    image: introducersImg,
    description: "Manage referral pipelines, track commissions, and provide your clients with white-labelled insights that reinforce your value as a trusted connector."
  },
  {
    name: "Venture Capital Analysts",
    image: vcAnalystsImg,
    description: "Screen deal flow at scale, model fund returns, and generate LP-ready reports with automated data aggregation across your entire portfolio."
  },
  {
    name: "Hedge Fund Analysts",
    image: hedgeFundImg,
    description: "Access quantitative analytics, alternative data feeds, and risk decomposition tools designed for the speed and rigour of institutional-grade analysis."
  },
  {
    name: "Wealth Managers",
    image: wealthManagersImg,
    description: "Deliver personalised client experiences with holistic portfolio views, compliant reporting, and proactive rebalancing alerts — all from one platform."
  },
  {
    name: "Alternative Investment Brokers",
    image: altInvestmentImg,
    description: "Navigate complex asset classes with specialised valuation tools, market intelligence, and compliance frameworks for real estate, commodities, and private equity."
  },
  {
    name: "Business Owners",
    image: businessOwnersImg,
    description: "Monitor cash flow, forecast revenue, and benchmark performance against industry peers — giving you the financial clarity to make bold business decisions."
  },
];

export function ClientsWeServe() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <section className="relative py-28 bg-white overflow-hidden">
      {/* Ambient backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.10),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(139,92,246,0.07),transparent_60%)]" />
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,23,42,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.6) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative container mx-auto px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="max-w-3xl mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/[0.04] border border-slate-900/10 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              <span className="text-[11px] uppercase tracking-[0.25em] text-slate-700 font-semibold">
                Who we serve
              </span>
            </div>
            <h2 className="mt-6 text-4xl md:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
              Trusted by the operators
              <br />
              <span className="bg-gradient-to-r from-sky-600 via-cyan-600 to-violet-600 bg-clip-text text-transparent">
                moving private capital.
              </span>
            </h2>
            <p className="mt-5 text-lg text-slate-600 max-w-2xl leading-relaxed">
              From single-family offices to institutional desks — Flowpulse powers the
              full spectrum of professionals shaping modern finance.
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200 rounded-3xl overflow-hidden border border-slate-200 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.25)]">
            {clientData.map((client, idx) => {
              const isActive = hoveredIdx === idx;
              return (
                <div
                  key={idx}
                  className="group relative bg-white hover:bg-slate-50/80 transition-colors duration-300"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  {/* Image area */}
                  <div className="relative h-44 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-sky-500/[0.05] via-transparent to-violet-500/[0.05]" />
                    <img
                      src={client.image}
                      alt={client.name}
                      loading="lazy"
                      width={512}
                      height={512}
                      className={`relative w-full h-full object-contain p-6 transition-all duration-500 ${
                        isActive ? "scale-105 opacity-15 blur-[2px]" : "scale-100 opacity-95"
                      }`}
                    />

                    {/* Hover description */}
                    <div
                      className={`absolute inset-0 flex items-center justify-center p-5 transition-all duration-400 ${
                        isActive ? "opacity-100" : "opacity-0 pointer-events-none"
                      }`}
                    >
                      <p
                        className={`text-[13px] leading-relaxed text-slate-700 text-center transition-all duration-400 ${
                          isActive ? "translate-y-0" : "translate-y-2"
                        }`}
                      >
                        {client.description}
                      </p>
                    </div>
                  </div>

                  {/* Title bar */}
                  <div className="relative px-5 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <p className="font-semibold text-[13px] tracking-tight text-slate-900">
                      {client.name}
                    </p>
                    <span
                      className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                        isActive ? "bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.7)]" : "bg-slate-300"
                      }`}
                    />
                  </div>

                  {/* Bottom accent line */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-500/70 to-transparent transition-opacity duration-300 ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
