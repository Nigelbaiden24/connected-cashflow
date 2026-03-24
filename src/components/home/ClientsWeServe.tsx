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
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Trusted by Leading Industry Professionals
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              FlowPulse serves a diverse range of financial and business professionals across multiple sectors
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {clientData.map((client, idx) => (
              <div
                key={idx}
                className="group relative perspective-[800px]"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Card */}
                <div
                  className={`relative overflow-hidden rounded-xl border border-primary/20 bg-background/80 backdrop-blur-sm transition-all duration-500 ease-out ${
                    hoveredIdx === idx
                      ? "border-primary/50 shadow-xl shadow-primary/15 [transform:rotateY(0deg)_scale(1.02)]"
                      : "hover:border-primary/30 hover:shadow-md"
                  }`}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Image */}
                  <div className="relative h-40 overflow-hidden bg-gradient-to-br from-muted/50 to-muted/20">
                    <img
                      src={client.image}
                      alt={client.name}
                      loading="lazy"
                      width={512}
                      height={512}
                      className={`w-full h-full object-contain transition-all duration-500 ${
                        hoveredIdx === idx ? "scale-110 opacity-30" : "scale-100 opacity-90"
                      }`}
                    />
                    
                    {/* Hover overlay with description */}
                    <div
                      className={`absolute inset-0 flex items-center justify-center p-4 transition-all duration-500 ${
                        hoveredIdx === idx
                          ? "opacity-100 translate-z-[40px]"
                          : "opacity-0"
                      }`}
                      style={{
                        transform: hoveredIdx === idx ? "translateZ(30px)" : "translateZ(0px)",
                        transformStyle: "preserve-3d",
                      }}
                    >
                      <div
                        className={`bg-background/90 backdrop-blur-md rounded-lg p-3 border border-primary/30 shadow-lg transition-all duration-500 ${
                          hoveredIdx === idx
                            ? "translate-y-0 opacity-100 scale-100"
                            : "translate-y-4 opacity-0 scale-95"
                        }`}
                      >
                        <p className="text-xs leading-relaxed text-foreground/90">
                          {client.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="p-4 text-center">
                    <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors duration-300">
                      {client.name}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
