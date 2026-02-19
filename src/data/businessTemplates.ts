import { DocumentTemplate } from "@/types/template";

export const businessTemplates: DocumentTemplate[] = [
  {
    id: "contract",
    name: "Contract",
    category: "Business",
    description: "Professional contract template for agreements and partnerships",
    thumbnail: "/thumbnails/business-proposal-thumb.png",
    sections: [
      {
        id: "hero-header",
        type: "body",
        placeholder: "",
        defaultContent: "",
        className: "relative -mx-8 -mt-8 mb-8 px-10 py-14 bg-gradient-to-br from-slate-900 via-zinc-800 to-slate-900 rounded-t-lg overflow-hidden before:absolute before:bottom-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-emerald-500 before:via-teal-500 before:to-cyan-500",
        editable: false
      },
      {
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "SERVICE AGREEMENT",
        className: "relative z-10 text-5xl font-extrabold text-white mb-3 tracking-tight",
        editable: true
      },
      {
        id: "contract-number",
        type: "subheading",
        placeholder: "{{contract_number}}",
        defaultContent: "Contract No. SA-2025-001",
        className: "relative z-10 text-lg text-white/50 mb-6 font-mono tracking-wider",
        editable: true
      },
      {
        id: "parties-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Parties",
        className: "text-2xl font-bold text-foreground mb-4 mt-6 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-emerald-500 after:to-teal-500 after:rounded-full",
        editable: true
      },
      {
        id: "parties",
        type: "body",
        placeholder: "{{parties}}",
        defaultContent: "This Agreement is entered into on 15 January 2025 between:\n\nParty A: Meridian Advisory Group Ltd\nRegistered Address: 42 Threadneedle Street, London, EC2R 8AY\nCompany Registration No: 12345678\n\nAND\n\nParty B: Harrington Wealth Holdings Plc\nRegistered Address: 18 Cathedral Square, Manchester, M3 7BW\nCompany Registration No: 87654321\n\nBoth parties hereby acknowledge and agree to the terms and conditions set forth in this agreement, which shall be governed by the laws of England and Wales.",
        className: "text-base leading-relaxed mb-8 text-muted-foreground bg-gradient-to-br from-emerald-500/8 to-teal-500/5 p-8 rounded-2xl border-l-4 border-emerald-500",
        editable: true
      },
      {
        id: "services-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Services & Deliverables",
        className: "text-2xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-teal-500 after:to-cyan-500 after:rounded-full",
        editable: true
      },
      {
        id: "services",
        type: "bullet-list",
        placeholder: "{{services}}",
        defaultContent: "Consulting and advisory services\nProject management and oversight\nDelivery of agreed milestones\nOngoing support and maintenance",
        className: "space-y-3 mb-8 text-base [&_li]:relative [&_li]:pl-6 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-2 [&_li]:before:w-2.5 [&_li]:before:h-2.5 [&_li]:before:bg-emerald-500 [&_li]:before:rounded-full [&_li]:text-muted-foreground [&_li]:py-2 [&_li]:border-b [&_li]:border-border/50",
        editable: true
      },
      {
        id: "terms-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Terms & Conditions",
        className: "text-2xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-cyan-500 after:to-sky-500 after:rounded-full",
        editable: true
      },
      {
        id: "terms",
        type: "body",
        placeholder: "{{terms}}",
        defaultContent: "Duration: 12 months from date of execution\nPayment Terms: Net 30 days\nTermination: 30 days written notice\nConfidentiality: Both parties agree to maintain confidentiality",
        className: "text-base leading-relaxed mb-8 text-muted-foreground p-6 bg-muted/20 rounded-xl",
        editable: true
      },
      {
        id: "signatures",
        type: "body",
        placeholder: "{{signatures}}",
        defaultContent: "Party A Signature: _____________________\nDate: _____________________\n\nParty B Signature: _____________________\nDate: _____________________",
        className: "text-base mt-12 pt-8 border-t-2 border-emerald-500/20",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(160 84% 39%)",
      secondaryColor: "hsl(172 66% 50%)",
      accentColor: "hsl(187 92% 69%)",
      backgroundColor: "hsl(0 0% 100%)"
    }
  },
  {
    id: "business-invoice",
    name: "Business Invoice",
    category: "Business",
    description: "Professional invoice template for billing",
    thumbnail: "/thumbnails/business-proposal-thumb.png",
    sections: [
      {
        id: "hero-header",
        type: "body",
        placeholder: "",
        defaultContent: "",
        className: "relative -mx-8 -mt-8 mb-8 px-10 py-14 bg-gradient-to-br from-violet-950 via-purple-900 to-violet-950 rounded-t-lg overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.3),transparent_50%)]",
        editable: false
      },
      {
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "INVOICE",
        className: "relative z-10 text-6xl font-extrabold text-white mb-2 tracking-tight",
        editable: true
      },
      {
        id: "invoice-number",
        type: "subheading",
        placeholder: "{{invoice_number}}",
        defaultContent: "Invoice #INV-2025-001",
        className: "relative z-10 text-lg text-violet-200/70 mb-6 font-light",
        editable: true
      },
      {
        id: "from-details",
        type: "body",
        placeholder: "{{from_details}}",
        defaultContent: "From: Your Company\n123 Business Street\nLondon, UK\nPhone: +44 20 1234 5678",
        className: "text-base leading-relaxed mb-6 text-muted-foreground p-5 bg-gradient-to-br from-violet-500/8 to-purple-500/5 rounded-xl border-l-4 border-violet-500",
        editable: true
      },
      {
        id: "to-details",
        type: "body",
        placeholder: "{{to_details}}",
        defaultContent: "Bill To: Client Name\n456 Client Road\nManchester, UK",
        className: "text-base leading-relaxed mb-8 text-muted-foreground p-5 bg-gradient-to-br from-purple-500/8 to-fuchsia-500/5 rounded-xl border-l-4 border-purple-500",
        editable: true
      },
      {
        id: "items",
        type: "bullet-list",
        placeholder: "{{items}}",
        defaultContent: "Consulting - 10 hours @ £150/hr - £1,500\nProject Management - 5 hours @ £120/hr - £600\nDocumentation - £400",
        className: "space-y-3 mb-8 text-base [&_li]:relative [&_li]:pl-6 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-2 [&_li]:before:w-2.5 [&_li]:before:h-2.5 [&_li]:before:bg-violet-500 [&_li]:before:rounded-full [&_li]:text-foreground [&_li]:py-3 [&_li]:px-5 [&_li]:bg-violet-500/5 [&_li]:rounded-xl",
        editable: true
      },
      {
        id: "totals",
        type: "body",
        placeholder: "{{totals}}",
        defaultContent: "Subtotal: £2,500.00\nVAT (20%): £500.00\n\nTotal Due: £3,000.00",
        className: "text-xl leading-relaxed mb-8 font-bold p-6 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-2xl border-2 border-violet-500/20",
        editable: true
      },
      {
        id: "payment-info",
        type: "body",
        placeholder: "{{payment_info}}",
        defaultContent: "Payment due within 30 days\nBank: Example Bank\nAccount: 12345678\nSort Code: 12-34-56",
        className: "text-sm text-muted-foreground bg-muted/30 p-5 rounded-xl border border-border",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(263 70% 50%)",
      secondaryColor: "hsl(271 81% 56%)",
      accentColor: "hsl(292 84% 61%)",
      backgroundColor: "hsl(0 0% 100%)"
    }
  },
  {
    id: "business-plan",
    name: "Business Plan",
    category: "Business",
    description: "Comprehensive business plan with market analysis and financial projections",
    thumbnail: "/thumbnails/business-plan-thumb.png",
    sections: [
      {
        id: "hero-header",
        type: "body",
        placeholder: "",
        defaultContent: "",
        className: "relative -mx-8 -mt-8 mb-8 px-10 py-16 bg-gradient-to-br from-blue-950 via-indigo-900 to-blue-950 rounded-t-lg overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_70%_30%,rgba(59,130,246,0.3),transparent_50%)] after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_20%_80%,rgba(99,102,241,0.2),transparent_50%)]",
        editable: false
      },
      {
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Business Plan 2025",
        className: "relative z-10 text-5xl font-extrabold mb-3 bg-gradient-to-r from-white via-blue-100 to-indigo-100 bg-clip-text text-transparent tracking-tight",
        editable: true
      },
      {
        id: "subtitle",
        type: "subheading",
        placeholder: "{{subtitle}}",
        defaultContent: "Strategic Growth & Market Expansion",
        className: "relative z-10 text-xl text-blue-200/70 mb-6 font-light",
        editable: true
      },
      {
        id: "divider-1",
        type: "divider",
        placeholder: "",
        className: "my-8 border-t-2 border-blue-500/20",
        editable: false
      },
      {
        id: "executive-summary-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Executive Summary",
        className: "text-3xl font-bold text-foreground mb-4 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-blue-500 after:to-indigo-500 after:rounded-full",
        editable: true
      },
      {
        id: "executive-summary",
        type: "body",
        placeholder: "{{executive_summary}}",
        defaultContent: "Our business is positioned to capture significant market share...",
        className: "text-lg leading-relaxed mb-8 text-muted-foreground bg-gradient-to-br from-blue-500/8 to-indigo-500/5 p-8 rounded-2xl border-l-4 border-blue-500",
        editable: true
      },
      {
        id: "market-analysis-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Market Analysis",
        className: "text-3xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-indigo-500 after:to-violet-500 after:rounded-full",
        editable: true
      },
      {
        id: "market-analysis",
        type: "body",
        placeholder: "{{market_analysis}}",
        defaultContent: "The target market demonstrates strong growth potential...",
        className: "text-lg leading-relaxed mb-8 text-muted-foreground",
        editable: true
      },
      {
        id: "chart-area",
        type: "image",
        placeholder: "{{chart1}}",
        defaultContent: "",
        className: "w-full h-80 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-violet-500/10 rounded-2xl flex items-center justify-center my-10 border-2 border-blue-500/20 shadow-xl",
        editable: true
      },
      {
        id: "strategy-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Growth Strategy",
        className: "text-3xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-violet-500 after:to-purple-500 after:rounded-full",
        editable: true
      },
      {
        id: "strategy",
        type: "bullet-list",
        placeholder: "{{strategy}}",
        defaultContent: "Expand into new geographic markets\nDevelop strategic partnerships\nInvest in technology infrastructure\nEnhance customer experience",
        className: "space-y-4 mb-8 text-lg [&_li]:relative [&_li]:pl-8 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-2 [&_li]:before:w-3 [&_li]:before:h-3 [&_li]:before:bg-gradient-to-r [&_li]:before:from-blue-500 [&_li]:before:to-indigo-500 [&_li]:before:rounded-full [&_li]:text-muted-foreground",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(221 83% 53%)",
      secondaryColor: "hsl(239 84% 67%)",
      accentColor: "hsl(263 70% 50%)",
      backgroundColor: "hsl(0 0% 100%)"
    }
  },
  {
    id: "proposal",
    name: "Business Proposal",
    category: "Business",
    description: "Professional proposal template for client projects",
    thumbnail: "/thumbnails/business-proposal-thumb.png",
    sections: [
      {
        id: "hero-header",
        type: "body",
        placeholder: "",
        defaultContent: "",
        className: "relative -mx-8 -mt-8 mb-8 px-10 py-16 bg-gradient-to-br from-sky-900 via-blue-800 to-indigo-900 rounded-t-lg overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_70%_30%,rgba(14,165,233,0.3),transparent_50%)] after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_20%_80%,rgba(99,102,241,0.2),transparent_50%)]",
        editable: false
      },
      {
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Business Proposal",
        className: "relative z-10 text-5xl font-extrabold text-white mb-4 tracking-tight",
        editable: true
      },
      {
        id: "tagline",
        type: "subheading",
        placeholder: "{{tagline}}",
        defaultContent: "Strategic Partnership Opportunity",
        className: "relative z-10 text-2xl text-sky-200/80 mb-8 font-light",
        editable: true
      },
      {
        id: "executive_overview_heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Executive Overview",
        className: "text-3xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-sky-500 after:to-blue-500 after:rounded-full",
        editable: true
      },
      {
        id: "executive_overview",
        type: "body",
        placeholder: "{{executive_overview}}",
        defaultContent: "We are pleased to present this comprehensive proposal outlining our approach to delivering transformative value across your organisation. Our methodology combines deep industry expertise with cutting-edge technology solutions to drive measurable outcomes. Having conducted preliminary analysis of your current operations, we have identified significant opportunities for improvement across operational efficiency, customer experience, and revenue generation. This proposal details our recommended approach, timeline, and investment requirements to achieve these objectives.",
        className: "text-lg leading-relaxed mb-8 text-muted-foreground bg-gradient-to-br from-sky-500/8 to-blue-500/5 p-8 rounded-2xl border-l-4 border-sky-500",
        editable: true
      },
      {
        id: "benefits_heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Key Benefits",
        className: "text-3xl font-bold text-foreground mb-6 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-blue-500 after:to-indigo-500 after:rounded-full",
        editable: true
      },
      {
        id: "benefit1_title",
        type: "subheading",
        placeholder: "{{benefit1_title}}",
        defaultContent: "Enhanced Efficiency",
        className: "text-xl font-bold mb-2 text-foreground",
        editable: true
      },
      {
        id: "benefit1_text",
        type: "body",
        placeholder: "{{benefit1_text}}",
        defaultContent: "Our proprietary process automation framework has consistently delivered operational cost reductions of 35-45% across similar engagements. By eliminating manual bottlenecks, standardising workflows, and implementing intelligent routing systems, we enable your team to focus on high-value strategic activities rather than administrative overhead. Previous clients have reported average time savings of 120 hours per month within the first quarter of implementation.",
        className: "text-base mb-6 pl-6 border-l-4 border-sky-500 text-muted-foreground bg-sky-500/5 p-4 rounded-r-xl",
        editable: true
      },
      {
        id: "benefit2_title",
        type: "subheading",
        placeholder: "{{benefit2_title}}",
        defaultContent: "Scalable Solutions",
        className: "text-xl font-bold mb-2 text-foreground",
        editable: true
      },
      {
        id: "benefit2_text",
        type: "body",
        placeholder: "{{benefit2_text}}",
        defaultContent: "Our modular architecture is designed from the ground up to accommodate rapid scaling without performance degradation. Whether your user base grows tenfold or your data volumes increase exponentially, the platform adapts seamlessly through automated provisioning and intelligent load distribution. This future-proof approach ensures that your technology investment continues to deliver value as your business evolves and market conditions change.",
        className: "text-base mb-6 pl-6 border-l-4 border-blue-500 text-muted-foreground bg-blue-500/5 p-4 rounded-r-xl",
        editable: true
      },
      {
        id: "roadmap_heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Implementation Roadmap",
        className: "text-3xl font-bold text-foreground mb-6 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-indigo-500 after:to-violet-500 after:rounded-full",
        editable: true
      },
      {
        id: "phase1_title",
        type: "subheading",
        placeholder: "{{phase1_title}}",
        defaultContent: "Phase 1: Discovery & Planning",
        className: "text-xl font-semibold mb-2 text-foreground relative pl-6 before:absolute before:left-0 before:top-1 before:w-3 before:h-3 before:bg-sky-500 before:rounded-full",
        editable: true
      },
      {
        id: "phase1_content",
        type: "body",
        placeholder: "{{phase1_content}}",
        defaultContent: "During the discovery phase, our team conducts comprehensive stakeholder interviews, process mapping workshops, and technical architecture assessments to develop a thorough understanding of your current state and desired outcomes. We produce a detailed requirements specification document, prioritised project roadmap, and risk mitigation plan. This phase typically spans 4-6 weeks and concludes with a formal presentation to the steering committee for sign-off before proceeding to implementation.",
        className: "text-base mb-6 text-muted-foreground ml-6 pl-6 border-l-2 border-sky-500/30",
        editable: true
      },
      {
        id: "phase2_title",
        type: "subheading",
        placeholder: "{{phase2_title}}",
        defaultContent: "Phase 2: Implementation",
        className: "text-xl font-semibold mb-2 text-foreground relative pl-6 before:absolute before:left-0 before:top-1 before:w-3 before:h-3 before:bg-blue-500 before:rounded-full",
        editable: true
      },
      {
        id: "phase2_content",
        type: "body",
        placeholder: "{{phase2_content}}",
        defaultContent: "Implementation follows an agile methodology with two-week sprint cycles, ensuring continuous delivery of functional components and regular stakeholder validation. Each sprint includes comprehensive testing—unit, integration, and user acceptance—to maintain the highest quality standards. Daily stand-ups and weekly progress reports keep all parties aligned, whilst our dedicated project manager serves as a single point of contact for any queries or escalations throughout the build phase.",
        className: "text-base mb-6 text-muted-foreground ml-6 pl-6 border-l-2 border-blue-500/30",
        editable: true
      },
      {
        id: "phase3_title",
        type: "subheading",
        placeholder: "{{phase3_title}}",
        defaultContent: "Phase 3: Launch & Support",
        className: "text-xl font-semibold mb-2 text-foreground relative pl-6 before:absolute before:left-0 before:top-1 before:w-3 before:h-3 before:bg-indigo-500 before:rounded-full",
        editable: true
      },
      {
        id: "phase3_content",
        type: "body",
        placeholder: "{{phase3_content}}",
        defaultContent: "Our launch phase encompasses a structured deployment process including environment provisioning, data migration, user training, and go-live support. We provide comprehensive training programmes tailored to different user roles, ensuring rapid adoption and maximum value realisation from day one. Post-launch, our dedicated support team provides 90 days of enhanced monitoring and assistance, followed by ongoing maintenance and optimisation under a separate support agreement.",
        className: "text-base mb-8 text-muted-foreground ml-6 pl-6 border-l-2 border-indigo-500/30",
        editable: true
      },
      {
        id: "financial_heading",
        type: "subheading",
        placeholder: "{{section4_heading}}",
        defaultContent: "Investment & ROI",
        className: "text-3xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-violet-500 after:to-purple-500 after:rounded-full",
        editable: true
      },
      {
        id: "financial_overview",
        type: "body",
        placeholder: "{{financial_overview}}",
        defaultContent: "Our pricing model is structured to deliver exceptional value whilst ensuring a clear and demonstrable return on investment. The total project investment of £185,000 covers all three implementation phases, including discovery, development, and deployment. Based on our analysis of your current operational costs, we project annual savings of £420,000 from process automation alone, delivering a payback period of under six months. Additional revenue uplift from enhanced customer experience is estimated at £280,000 annually, bringing the total first-year ROI to approximately 275%.",
        className: "text-lg leading-relaxed mb-8 text-muted-foreground relative p-8 bg-white rounded-2xl border border-border shadow-lg before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-sky-500 before:to-indigo-500 before:rounded-t-2xl overflow-hidden",
        editable: true
      },
      {
        id: "footer_text",
        type: "body",
        placeholder: "{{footer_text}}",
        defaultContent: "We look forward to partnering with you on this exciting journey. Contact us to discuss how we can bring this vision to life.",
        className: "text-center text-base mt-12 p-8 bg-gradient-to-br from-sky-500/8 to-indigo-500/5 rounded-2xl border border-sky-500/15 text-muted-foreground",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(199 89% 48%)",
      secondaryColor: "hsl(221 83% 53%)",
      accentColor: "hsl(239 84% 67%)",
      backgroundColor: "hsl(0 0% 100%)"
    }
  },
  {
    id: "client-letter",
    name: "Client Letter",
    category: "Business",
    description: "Formal business correspondence",
    thumbnail: "/thumbnails/business-letter-thumb.png",
    sections: [
      {
        id: "hero-header",
        type: "body",
        placeholder: "",
        defaultContent: "",
        className: "relative -mx-8 -mt-8 mb-8 px-10 py-10 bg-gradient-to-r from-amber-900 via-orange-800 to-amber-900 rounded-t-lg overflow-hidden before:absolute before:bottom-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-amber-400 before:via-orange-500 before:to-red-500",
        editable: false
      },
      {
        id: "date",
        type: "subheading",
        placeholder: "{{date}}",
        defaultContent: "20 October 2025",
        className: "relative z-10 text-sm text-amber-200/60 mb-2 font-medium tracking-wide",
        editable: true
      },
      {
        id: "recipient",
        type: "subheading",
        placeholder: "{{recipient}}",
        defaultContent: "Dear Valued Partner",
        className: "text-2xl font-semibold mb-6 mt-8 text-foreground",
        editable: true
      },
      {
        id: "opening",
        type: "body",
        placeholder: "{{opening}}",
        defaultContent: "We are delighted to write to you with an important update regarding our ongoing partnership and the exciting developments taking shape across our joint initiatives. As we approach the close of another productive quarter, we wanted to take this opportunity to reflect on our shared achievements and outline the strategic opportunities that lie ahead for both organisations in the coming months.",
        className: "text-base leading-[1.9] mb-8 text-muted-foreground",
        editable: true
      },
      {
        id: "main-content-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Key Updates",
        className: "text-2xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-12 after:h-1 after:bg-gradient-to-r after:from-amber-500 after:to-orange-500 after:rounded-full",
        editable: true
      },
      {
        id: "main-content",
        type: "body",
        placeholder: "{{main_content}}",
        defaultContent: "Our strategic partnership continues to deliver exceptional results, with key performance indicators exceeding targets across all major categories. The integration of our respective service platforms has been completed ahead of schedule, enabling seamless cross-referral workflows and enhanced client service delivery. Customer satisfaction scores have risen to 94%, representing a 12-point improvement since the inception of our collaboration. We have also made significant progress on our joint market expansion initiative, having successfully onboarded 47 new enterprise clients during this quarter alone.",
        className: "text-base leading-[1.9] mb-8 text-muted-foreground bg-gradient-to-br from-amber-500/5 to-orange-500/5 p-6 rounded-xl border-l-4 border-amber-500",
        editable: true
      },
      {
        id: "highlights",
        type: "bullet-list",
        placeholder: "{{highlights}}",
        defaultContent: "30% revenue growth this quarter\nLaunched three new product lines\nExpanded to two new markets\nEnhanced customer support services",
        className: "space-y-3 mb-8 [&_li]:relative [&_li]:pl-6 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-2 [&_li]:before:w-2 [&_li]:before:h-2 [&_li]:before:bg-amber-500 [&_li]:before:rounded-full [&_li]:text-muted-foreground",
        editable: true
      },
      {
        id: "closing",
        type: "body",
        placeholder: "{{closing}}",
        defaultContent: "We are genuinely enthusiastic about the trajectory of our partnership and the mutual value we continue to create. As we look towards the next quarter, we are confident that the strategic foundations we have built together will support continued growth and innovation. We would welcome the opportunity to discuss these developments further at your earliest convenience and remain committed to delivering excellence in everything we do together.",
        className: "text-base leading-[1.9] mb-8 text-muted-foreground",
        editable: true
      },
      {
        id: "signature",
        type: "subheading",
        placeholder: "{{signature}}",
        defaultContent: "Best regards,\nBusiness Development Team",
        className: "text-base mt-10 pt-8 border-t border-border text-foreground",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(38 92% 50%)",
      secondaryColor: "hsl(25 95% 53%)",
      accentColor: "hsl(0 72% 51%)",
      backgroundColor: "hsl(0 0% 100%)"
    }
  },
  {
    id: "portfolio-summary",
    name: "Company Portfolio",
    category: "Business",
    description: "Overview of company projects and achievements",
    thumbnail: "/thumbnails/company-portfolio-thumb.png",
    sections: [
      {
        id: "hero-header",
        type: "body",
        placeholder: "",
        defaultContent: "",
        className: "relative -mx-8 -mt-8 mb-8 px-10 py-16 bg-gradient-to-br from-rose-950 via-pink-900 to-fuchsia-900 rounded-t-lg overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_70%_30%,rgba(236,72,153,0.25),transparent_50%)] after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_20%_80%,rgba(192,38,211,0.2),transparent_50%)]",
        editable: false
      },
      {
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Company Portfolio",
        className: "relative z-10 text-5xl font-extrabold mb-3 bg-gradient-to-r from-white via-pink-100 to-fuchsia-100 bg-clip-text text-transparent tracking-tight",
        editable: true
      },
      {
        id: "tagline",
        type: "subheading",
        placeholder: "{{tagline}}",
        defaultContent: "Innovation Through Excellence",
        className: "relative z-10 text-2xl text-pink-200/70 mb-10 font-light",
        editable: true
      },
      {
        id: "showcase-image",
        type: "image",
        placeholder: "{{showcase_image}}",
        defaultContent: "",
        className: "w-full h-96 bg-gradient-to-br from-pink-500/10 via-fuchsia-500/10 to-purple-500/10 rounded-2xl flex items-center justify-center my-10 border-2 border-pink-500/20 shadow-2xl",
        editable: true
      },
      {
        id: "about-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "About Us",
        className: "text-3xl font-bold text-foreground mb-4 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-pink-500 after:to-fuchsia-500 after:rounded-full",
        editable: true
      },
      {
        id: "about",
        type: "body",
        placeholder: "{{about}}",
        defaultContent: "Established in 2015, we are a leading provider of innovative business solutions specialising in digital transformation, strategic consulting, and enterprise technology integration. With offices across London, Manchester, and Edinburgh, our team of 150+ professionals serves over 200 enterprise clients spanning financial services, healthcare, technology, and retail sectors. Our mission is to empower organisations with the tools, insights, and strategies they need to thrive in an increasingly competitive and digitally-driven marketplace.",
        className: "text-lg leading-relaxed mb-10 text-muted-foreground bg-gradient-to-br from-pink-500/8 to-fuchsia-500/5 p-8 rounded-2xl border-l-4 border-pink-500",
        editable: true
      },
      {
        id: "services-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Our Services",
        className: "text-3xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-fuchsia-500 after:to-purple-500 after:rounded-full",
        editable: true
      },
      {
        id: "services",
        type: "bullet-list",
        placeholder: "{{services}}",
        defaultContent: "Strategic Consulting & Advisory\nDigital Transformation Solutions\nProject Management Services\nChange Management Support",
        className: "space-y-4 mb-10 text-lg font-medium [&_li]:relative [&_li]:pl-8 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-2 [&_li]:before:w-3 [&_li]:before:h-3 [&_li]:before:bg-gradient-to-r [&_li]:before:from-pink-500 [&_li]:before:to-fuchsia-500 [&_li]:before:rounded-full [&_li]:text-foreground",
        editable: true
      },
      {
        id: "achievements-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Key Achievements",
        className: "text-3xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-purple-500 after:to-violet-500 after:rounded-full",
        editable: true
      },
      {
        id: "achievements",
        type: "bullet-list",
        placeholder: "{{achievements}}",
        defaultContent: "100+ successful projects delivered\n50+ enterprise clients worldwide\nIndustry recognition and awards\n95% client satisfaction rate",
        className: "space-y-4 mb-10 text-lg [&_li]:relative [&_li]:pl-8 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-2 [&_li]:before:w-3 [&_li]:before:h-3 [&_li]:before:bg-gradient-to-r [&_li]:before:from-purple-500 [&_li]:before:to-violet-500 [&_li]:before:rounded-full [&_li]:text-muted-foreground [&_li]:py-3 [&_li]:px-5 [&_li]:bg-purple-500/5 [&_li]:rounded-xl",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(330 81% 60%)",
      secondaryColor: "hsl(292 84% 61%)",
      accentColor: "hsl(263 70% 50%)",
      backgroundColor: "hsl(0 0% 100%)"
    }
  },
  {
    id: "kyc-form",
    name: "Business Onboarding",
    category: "Business",
    description: "Client onboarding and verification documentation",
    thumbnail: "/thumbnails/business-onboarding-thumb.png",
    sections: [
      {
        id: "hero-header",
        type: "body",
        placeholder: "",
        defaultContent: "",
        className: "relative -mx-8 -mt-8 mb-8 px-10 py-14 bg-gradient-to-br from-teal-900 via-emerald-800 to-teal-900 rounded-t-lg overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_60%_40%,rgba(20,184,166,0.3),transparent_50%)]",
        editable: false
      },
      {
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Business Onboarding Form",
        className: "relative z-10 text-4xl font-extrabold mb-3 bg-gradient-to-r from-white via-teal-100 to-emerald-100 bg-clip-text text-transparent tracking-tight",
        editable: true
      },
      {
        id: "subtitle",
        type: "subheading",
        placeholder: "{{subtitle}}",
        defaultContent: "Client Information & Verification",
        className: "relative z-10 text-lg text-teal-200/70 mb-6 font-light",
        editable: true
      },
      {
        id: "company-info-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Company Information",
        className: "text-2xl font-bold text-foreground mb-4 mt-6 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-teal-500 after:to-emerald-500 after:rounded-full",
        editable: true
      },
      {
        id: "company-info",
        type: "body",
        placeholder: "{{company_info}}",
        defaultContent: "Company Name: Harrington Wealth Holdings Plc\nRegistration Number: 12345678\nRegistered Address: 18 Cathedral Square, Manchester, M3 7BW\nDate of Incorporation: 15 March 2012\nPrimary Contact: Jonathan Harrington, Managing Director\nEmail: j.harrington@hwh.co.uk\nTelephone: +44 161 234 5678\nCompany Type: Public Limited Company\nVAT Registration Number: GB 123 4567 89",
        className: "text-base leading-relaxed mb-8 text-muted-foreground pl-6 border-l-4 border-teal-500 bg-teal-500/5 p-6 rounded-r-xl",
        editable: true
      },
      {
        id: "business-details-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Business Details",
        className: "text-2xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-emerald-500 after:to-green-500 after:rounded-full",
        editable: true
      },
      {
        id: "business-details",
        type: "bullet-list",
        placeholder: "{{business_details}}",
        defaultContent: "Industry sector and business activities\nAnnual revenue and employee count\nPrimary markets and locations\nKey stakeholders and decision makers",
        className: "space-y-3 mb-8 [&_li]:relative [&_li]:pl-6 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-2 [&_li]:before:w-2.5 [&_li]:before:h-2.5 [&_li]:before:bg-emerald-500 [&_li]:before:rounded-full [&_li]:text-muted-foreground [&_li]:py-2 [&_li]:border-b [&_li]:border-border/50",
        editable: true
      },
      {
        id: "documents-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Required Documentation",
        className: "text-2xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-green-500 after:to-lime-500 after:rounded-full",
        editable: true
      },
      {
        id: "documents",
        type: "bullet-list",
        placeholder: "{{documents}}",
        defaultContent: "Certificate of incorporation\nProof of registered address\nDirectors' identification\nFinancial statements (last 2 years)",
        className: "space-y-3 mb-8 [&_li]:relative [&_li]:pl-6 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-2 [&_li]:before:w-2.5 [&_li]:before:h-2.5 [&_li]:before:bg-green-500 [&_li]:before:rounded-full [&_li]:text-muted-foreground [&_li]:py-2 [&_li]:border-b [&_li]:border-border/50",
        editable: true
      },
      {
        id: "terms",
        type: "body",
        placeholder: "{{terms}}",
        defaultContent: "By submitting this form, you agree to our terms and conditions...",
        className: "text-sm leading-relaxed mb-6 text-muted-foreground bg-gradient-to-br from-teal-500/8 to-emerald-500/5 p-6 rounded-2xl italic border border-teal-500/15",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(172 66% 50%)",
      secondaryColor: "hsl(160 84% 39%)",
      accentColor: "hsl(142 76% 36%)",
      backgroundColor: "hsl(0 0% 100%)"
    }
  },
  {
    id: "compliance-report",
    name: "Compliance Report",
    category: "Business",
    description: "Corporate compliance and audit documentation",
    thumbnail: "/thumbnails/business-compliance-thumb.png",
    sections: [
      {
        id: "hero-header",
        type: "body",
        placeholder: "",
        defaultContent: "",
        className: "relative -mx-8 -mt-8 mb-8 px-10 py-14 bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 rounded-t-lg overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_70%_30%,rgba(239,68,68,0.2),transparent_50%)]",
        editable: false
      },
      {
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Corporate Compliance Report",
        className: "relative z-10 text-4xl font-extrabold mb-2 bg-gradient-to-r from-white via-red-100 to-slate-200 bg-clip-text text-transparent tracking-tight",
        editable: true
      },
      {
        id: "report-period",
        type: "subheading",
        placeholder: "{{report_period}}",
        defaultContent: "Reporting Period: Q4 2025",
        className: "relative z-10 text-sm text-white/50 mb-6 font-mono tracking-wider",
        editable: true
      },
      {
        id: "summary-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Compliance Summary",
        className: "text-2xl font-bold text-foreground mb-4 mt-8 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-emerald-500 after:to-green-500 after:rounded-full",
        editable: true
      },
      {
        id: "summary",
        type: "body",
        placeholder: "{{summary}}",
        defaultContent: "This quarterly compliance report provides a comprehensive assessment of the organisation's adherence to all applicable regulatory requirements, internal policies, and industry best practices. During the reporting period, we conducted 24 compliance audits across all business units, reviewed 1,847 client interactions for regulatory adherence, and assessed the effectiveness of our risk management controls. The overall compliance rating for Q4 2025 is 'Satisfactory' with a score of 92/100, representing a 4-point improvement from the previous quarter.",
        className: "text-base leading-relaxed mb-8 text-muted-foreground bg-gradient-to-br from-emerald-500/10 to-green-500/5 p-6 rounded-2xl border-l-4 border-emerald-500",
        editable: true
      },
      {
        id: "areas-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Compliance Areas Reviewed",
        className: "text-2xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-blue-500 after:to-indigo-500 after:rounded-full",
        editable: true
      },
      {
        id: "areas",
        type: "bullet-list",
        placeholder: "{{areas}}",
        defaultContent: "Data protection and privacy (GDPR)\nHealth and safety standards\nEnvironmental regulations\nEmployment law compliance\nFinancial reporting requirements",
        className: "space-y-3 mb-8 [&_li]:relative [&_li]:pl-8 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-2 [&_li]:before:w-3 [&_li]:before:h-3 [&_li]:before:bg-gradient-to-r [&_li]:before:from-emerald-500 [&_li]:before:to-green-500 [&_li]:before:rounded-full [&_li]:text-muted-foreground",
        editable: true
      },
      {
        id: "actions-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Action Items",
        className: "text-2xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-amber-500 after:to-orange-500 after:rounded-full",
        editable: true
      },
      {
        id: "actions",
        type: "bullet-list",
        placeholder: "{{actions}}",
        defaultContent: "Update privacy policies by end of month\nComplete staff training on new procedures\nReview supplier compliance certifications\nSchedule next audit for Q1 2026",
        className: "space-y-3 mb-8 [&_li]:relative [&_li]:pl-8 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-2 [&_li]:before:w-3 [&_li]:before:h-3 [&_li]:before:bg-gradient-to-r [&_li]:before:from-amber-500 [&_li]:before:to-orange-500 [&_li]:before:rounded-full [&_li]:text-muted-foreground",
        editable: true
      },
      {
        id: "conclusion",
        type: "body",
        placeholder: "{{conclusion}}",
        defaultContent: "Overall compliance status is satisfactory with all major requirements met...",
        className: "text-base leading-relaxed mb-6 text-muted-foreground relative p-6 bg-white rounded-2xl border border-border shadow-lg before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-emerald-500 before:to-green-500 before:rounded-t-2xl overflow-hidden",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(0 72% 51%)",
      secondaryColor: "hsl(160 84% 39%)",
      accentColor: "hsl(38 92% 50%)",
      backgroundColor: "hsl(0 0% 100%)"
    }
  },
  {
    id: "whitepaper",
    name: "Industry Whitepaper",
    category: "Business",
    description: "Thought leadership and research publication",
    thumbnail: "/thumbnails/industry-whitepaper-thumb.png",
    sections: [
      {
        id: "hero-header",
        type: "body",
        placeholder: "",
        defaultContent: "",
        className: "relative -mx-8 -mt-8 mb-8 px-10 py-20 bg-gradient-to-br from-indigo-950 via-blue-900 to-indigo-950 rounded-t-lg overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.2),transparent_60%)]",
        editable: false
      },
      {
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Digital Transformation in 2025",
        className: "relative z-10 text-5xl font-extrabold mb-4 leading-tight bg-gradient-to-r from-white via-indigo-100 to-blue-100 bg-clip-text text-transparent",
        editable: true
      },
      {
        id: "subtitle",
        type: "subheading",
        placeholder: "{{subtitle}}",
        defaultContent: "Strategies for Business Success",
        className: "relative z-10 text-2xl text-indigo-200/70 mb-10 font-light",
        editable: true
      },
      {
        id: "abstract-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Abstract",
        className: "text-3xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-indigo-500 after:to-blue-500 after:rounded-full",
        editable: true
      },
      {
        id: "abstract",
        type: "body",
        placeholder: "{{abstract}}",
        defaultContent: "This whitepaper explores the transformative impact of digital technologies on modern business operations, drawing on extensive research across 500 enterprises and in-depth case studies from leading organisations that have successfully navigated their digital transformation journeys. Our analysis reveals that whilst 85% of businesses have initiated digital transformation programmes, only 30% have achieved meaningful, measurable outcomes. This paper identifies the critical success factors that differentiate winners from laggards and provides a practical framework for organisations at every stage of their digital maturity journey.",
        className: "text-lg leading-relaxed mb-10 text-muted-foreground bg-gradient-to-br from-indigo-500/8 to-blue-500/5 p-8 rounded-2xl italic border-l-4 border-indigo-500",
        editable: true
      },
      {
        id: "visual-1",
        type: "image",
        placeholder: "{{visual1}}",
        defaultContent: "",
        className: "w-full h-80 bg-gradient-to-br from-indigo-500/10 via-blue-500/10 to-sky-500/10 rounded-2xl flex items-center justify-center my-10 border-2 border-indigo-500/20 shadow-xl",
        editable: true
      },
      {
        id: "introduction-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Introduction",
        className: "text-3xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-blue-500 after:to-sky-500 after:rounded-full",
        editable: true
      },
      {
        id: "introduction",
        type: "body",
        placeholder: "{{introduction}}",
        defaultContent: "Digital transformation has become a strategic imperative for businesses...",
        className: "text-lg leading-relaxed mb-10 text-muted-foreground",
        editable: true
      },
      {
        id: "insights-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Key Insights",
        className: "text-3xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-sky-500 after:to-cyan-500 after:rounded-full",
        editable: true
      },
      {
        id: "insights",
        type: "bullet-list",
        placeholder: "{{insights}}",
        defaultContent: "70% of companies accelerating digital initiatives\nCloud adoption up 40% year-over-year\nAI integration becoming mainstream\nCustomer experience remains top priority",
        className: "space-y-4 mb-10 text-lg [&_li]:relative [&_li]:pl-8 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-2 [&_li]:before:w-3 [&_li]:before:h-3 [&_li]:before:bg-gradient-to-r [&_li]:before:from-indigo-500 [&_li]:before:to-blue-500 [&_li]:before:rounded-full [&_li]:text-muted-foreground",
        editable: true
      },
      {
        id: "conclusion-heading",
        type: "subheading",
        placeholder: "{{section4_heading}}",
        defaultContent: "Conclusion",
        className: "text-3xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-cyan-500 after:to-teal-500 after:rounded-full",
        editable: true
      },
      {
        id: "conclusion",
        type: "body",
        placeholder: "{{conclusion}}",
        defaultContent: "Successful digital transformation requires a holistic approach that extends far beyond technology implementation. Our research demonstrates that organisations achieving the greatest returns from their digital initiatives are those that invest equally in cultural change, process re-engineering, and capability development alongside their technology investments. The evidence presented in this whitepaper makes a compelling case for integrated transformation strategies that address the human, process, and technology dimensions simultaneously, with leadership commitment and clear governance as essential prerequisites for success.",
        className: "text-lg leading-relaxed mb-10 text-muted-foreground relative p-8 bg-gradient-to-br from-indigo-500/8 to-cyan-500/5 rounded-2xl border border-indigo-500/15",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(239 84% 67%)",
      secondaryColor: "hsl(221 83% 53%)",
      accentColor: "hsl(199 89% 48%)",
      backgroundColor: "hsl(0 0% 100%)"
    }
  },
  {
    id: "market-commentary",
    name: "Market Update",
    category: "Business",
    description: "Industry news and market analysis",
    thumbnail: "/thumbnails/market-update-thumb.png",
    sections: [
      {
        id: "hero-header",
        type: "body",
        placeholder: "",
        defaultContent: "",
        className: "relative -mx-8 -mt-8 mb-8 px-10 py-16 bg-gradient-to-br from-cyan-950 via-sky-900 to-blue-950 rounded-t-lg overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_70%_30%,rgba(6,182,212,0.3),transparent_50%)] after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.2),transparent_50%)]",
        editable: false
      },
      {
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Market Update",
        className: "relative z-10 text-5xl font-extrabold bg-gradient-to-r from-white via-cyan-100 to-sky-100 bg-clip-text text-transparent mb-3 tracking-tight",
        editable: true
      },
      {
        id: "date",
        type: "subheading",
        placeholder: "{{date}}",
        defaultContent: "October 2025",
        className: "relative z-10 text-lg text-cyan-200/70 mb-6 font-light",
        editable: true
      },
      {
        id: "overview-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Industry Overview",
        className: "text-3xl font-bold text-foreground mb-4 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-cyan-500 after:to-sky-500 after:rounded-full",
        editable: true
      },
      {
        id: "overview",
        type: "body",
        placeholder: "{{overview}}",
        defaultContent: "The industry continues to demonstrate robust growth momentum heading into the final quarter of 2025, with key indicators pointing to sustained expansion across most major segments. Revenue growth across the sector has averaged 8.2% year-on-year, driven primarily by digital adoption acceleration and increasing demand for technology-enabled solutions. However, competitive dynamics are shifting rapidly as new market entrants leverage innovative business models to challenge established players. Supply chain normalisation and easing input cost pressures have contributed to margin expansion, with average EBITDA margins improving by 180 basis points compared to the prior year period.",
        className: "text-lg leading-relaxed mb-8 text-muted-foreground bg-gradient-to-br from-cyan-500/8 to-sky-500/5 p-8 rounded-2xl border-l-4 border-cyan-500",
        editable: true
      },
      {
        id: "trends-chart",
        type: "image",
        placeholder: "{{trends_chart}}",
        defaultContent: "",
        className: "w-full h-72 bg-gradient-to-br from-cyan-500/10 via-sky-500/10 to-blue-500/10 rounded-2xl flex items-center justify-center my-10 border-2 border-cyan-500/20 shadow-xl",
        editable: true
      },
      {
        id: "developments-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Key Developments",
        className: "text-3xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-sky-500 after:to-blue-500 after:rounded-full",
        editable: true
      },
      {
        id: "developments",
        type: "bullet-list",
        placeholder: "{{developments}}",
        defaultContent: "Major merger announced in sector\nNew regulations taking effect Q1 2026\nTechnology adoption accelerating\nEmergent competitors entering market",
        className: "space-y-4 mb-8 text-lg [&_li]:relative [&_li]:pl-8 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-2 [&_li]:before:w-3 [&_li]:before:h-3 [&_li]:before:bg-gradient-to-r [&_li]:before:from-cyan-500 [&_li]:before:to-sky-500 [&_li]:before:rounded-full [&_li]:text-muted-foreground",
        editable: true
      },
      {
        id: "outlook-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Business Outlook",
        className: "text-3xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-blue-500 after:to-indigo-500 after:rounded-full",
        editable: true
      },
      {
        id: "outlook",
        type: "body",
        placeholder: "{{outlook}}",
        defaultContent: "We anticipate continued growth through the first half of 2026, supported by favourable macroeconomic conditions, increasing enterprise technology budgets, and expanding addressable markets. Our analysis suggests that companies with strong digital capabilities and customer-centric operating models are best positioned to capitalise on emerging opportunities, whilst those reliant on legacy systems and traditional distribution channels face increasing pressure from nimbler competitors. We recommend monitoring key leading indicators including enterprise software spending, digital advertising growth rates, and consumer confidence indices for early signals of any shift in the current growth trajectory.",
        className: "text-lg leading-relaxed mb-8 text-muted-foreground relative p-8 bg-white rounded-2xl border border-border shadow-lg before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-cyan-500 before:to-blue-500 before:rounded-t-2xl overflow-hidden",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(187 92% 41%)",
      secondaryColor: "hsl(199 89% 48%)",
      accentColor: "hsl(221 83% 53%)",
      backgroundColor: "hsl(0 0% 100%)"
    }
  },
  {
    id: "meeting-agenda",
    name: "Meeting Agenda",
    category: "Business",
    description: "Structured meeting agenda and action items",
    thumbnail: "/thumbnails/business-meeting-thumb.png",
    sections: [
      {
        id: "hero-header",
        type: "body",
        placeholder: "",
        defaultContent: "",
        className: "relative -mx-8 -mt-8 mb-8 px-10 py-12 bg-gradient-to-r from-zinc-800 via-neutral-700 to-zinc-800 rounded-t-lg overflow-hidden before:absolute before:bottom-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-lime-500 before:via-green-500 before:to-emerald-500",
        editable: false
      },
      {
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Quarterly Business Review",
        className: "relative z-10 text-4xl font-extrabold text-white mb-2 tracking-tight",
        editable: true
      },
      {
        id: "meeting-info",
        type: "subheading",
        placeholder: "{{meeting_info}}",
        defaultContent: "Date: October 25, 2025 | Time: 2:00 PM | Duration: 90 minutes",
        className: "relative z-10 text-sm text-white/50 mb-6 font-mono tracking-wide",
        editable: true
      },
      {
        id: "participants-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Participants",
        className: "text-2xl font-bold text-foreground mb-4 mt-6 relative after:absolute after:-bottom-2 after:left-0 after:w-12 after:h-1 after:bg-gradient-to-r after:from-lime-500 after:to-green-500 after:rounded-full",
        editable: true
      },
      {
        id: "participants",
        type: "bullet-list",
        placeholder: "{{participants}}",
        defaultContent: "Executive Leadership Team\nDepartment Heads\nProject Managers\nKey Stakeholders",
        className: "space-y-3 mb-8 [&_li]:relative [&_li]:pl-6 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-2 [&_li]:before:w-2 [&_li]:before:h-2 [&_li]:before:bg-lime-500 [&_li]:before:rounded-full [&_li]:text-muted-foreground [&_li]:py-1",
        editable: true
      },
      {
        id: "agenda-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Agenda Items",
        className: "text-2xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-12 after:h-1 after:bg-gradient-to-r after:from-green-500 after:to-emerald-500 after:rounded-full",
        editable: true
      },
      {
        id: "agenda",
        type: "bullet-list",
        placeholder: "{{agenda}}",
        defaultContent: "Q4 performance review (20 min)\nStrategic initiatives update (20 min)\nBudget discussion for 2026 (20 min)\nRisk assessment (15 min)\nAction items and next steps (15 min)",
        className: "space-y-3 mb-8 text-base [&_li]:relative [&_li]:pl-6 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-2 [&_li]:before:w-2 [&_li]:before:h-2 [&_li]:before:bg-green-500 [&_li]:before:rounded-full [&_li]:text-muted-foreground [&_li]:py-2 [&_li]:px-4 [&_li]:bg-muted/20 [&_li]:rounded-lg",
        editable: true
      },
      {
        id: "objectives-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Meeting Objectives",
        className: "text-2xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-12 after:h-1 after:bg-gradient-to-r after:from-emerald-500 after:to-teal-500 after:rounded-full",
        editable: true
      },
      {
        id: "objectives",
        type: "body",
        placeholder: "{{objectives}}",
        defaultContent: "The primary objective of this quarterly business review is to conduct a thorough assessment of Q4 performance against our strategic plan targets, review progress on key initiatives, and align on priorities for the upcoming fiscal year. We will also evaluate current risk exposures, assess resource allocation effectiveness, and ensure that departmental objectives remain aligned with the overarching corporate strategy. All participants are expected to come prepared with updated metrics and actionable recommendations for their respective areas of responsibility.",
        className: "text-base leading-relaxed mb-8 text-muted-foreground pl-6 border-l-4 border-green-500 bg-green-500/5 p-6 rounded-r-xl",
        editable: true
      },
      {
        id: "preparation-heading",
        type: "subheading",
        placeholder: "{{section4_heading}}",
        defaultContent: "Pre-Meeting Materials",
        className: "text-2xl font-bold text-foreground mb-4 mt-10",
        editable: true
      },
      {
        id: "preparation",
        type: "bullet-list",
        placeholder: "{{preparation}}",
        defaultContent: "Q4 financial reports\nProject status updates\nMarket analysis documents\nDraft 2026 budget proposal",
        className: "space-y-2 mb-6 [&_li]:relative [&_li]:pl-6 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-2 [&_li]:before:w-2 [&_li]:before:h-2 [&_li]:before:bg-emerald-500 [&_li]:before:rounded-full [&_li]:text-muted-foreground",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(84 81% 44%)",
      secondaryColor: "hsl(142 76% 36%)",
      accentColor: "hsl(160 84% 39%)",
      backgroundColor: "hsl(0 0% 100%)"
    }
  },
  {
    id: "scenario-analysis",
    name: "Strategic Analysis",
    category: "Business",
    description: "Business scenario planning and risk assessment",
    thumbnail: "/thumbnails/strategic-analysis-thumb.png",
    sections: [
      {
        id: "hero-header",
        type: "body",
        placeholder: "",
        defaultContent: "",
        className: "relative -mx-8 -mt-8 mb-8 px-10 py-16 bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950 rounded-t-lg overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_50%,rgba(100,116,139,0.15),transparent_60%)]",
        editable: false
      },
      {
        id: "title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Strategic Scenario Analysis",
        className: "relative z-10 text-5xl font-extrabold mb-3 bg-gradient-to-r from-white via-slate-200 to-zinc-300 bg-clip-text text-transparent tracking-tight",
        editable: true
      },
      {
        id: "subtitle",
        type: "subheading",
        placeholder: "{{subtitle}}",
        defaultContent: "Business Planning & Risk Assessment",
        className: "relative z-10 text-xl text-slate-400 mb-6 font-light",
        editable: true
      },
      {
        id: "baseline-heading",
        type: "subheading",
        placeholder: "{{section1_heading}}",
        defaultContent: "Baseline Scenario",
        className: "text-3xl font-bold text-foreground mb-4 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-emerald-500 after:to-green-500 after:rounded-full",
        editable: true
      },
      {
        id: "baseline",
        type: "body",
        placeholder: "{{baseline}}",
        defaultContent: "Under the baseline scenario, we project continued steady-state growth of 6-8% per annum over the three-year planning horizon. This assumes stable market conditions, consistent customer retention rates above 90%, and successful execution of our current product roadmap. Revenue is expected to reach £185M by FY2028, with operating margins improving from 15% to 18% through operational efficiency gains and scale economies. Headcount grows moderately to 580 employees, with the majority of new hires concentrated in technology development and client-facing roles. This scenario requires no additional capital investment beyond our existing facilities and technology budget allocations.",
        className: "text-lg leading-relaxed mb-8 text-muted-foreground bg-gradient-to-br from-emerald-500/10 to-green-500/5 p-8 rounded-2xl border-l-4 border-emerald-500",
        editable: true
      },
      {
        id: "baseline-chart",
        type: "image",
        placeholder: "{{baseline_chart}}",
        defaultContent: "",
        className: "w-full h-72 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-2xl flex items-center justify-center my-10 border-2 border-emerald-500/20 shadow-lg",
        editable: true
      },
      {
        id: "growth-heading",
        type: "subheading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Growth Scenario",
        className: "text-3xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-sky-500 after:to-blue-500 after:rounded-full",
        editable: true
      },
      {
        id: "growth",
        type: "body",
        placeholder: "{{growth}}",
        defaultContent: "The growth scenario envisions accelerated market expansion through a combination of organic growth, strategic acquisitions, and international market entry. In this scenario, revenue grows at 18-22% annually, reaching £280M by FY2028 with operating margins of 20-22%. Key assumptions include successful launch of our Asia-Pacific operations in Q2 2026, completion of at least two strategic acquisitions valued at £25-40M each, and the introduction of three new product lines targeting previously unserved market segments. This scenario requires an additional £50M in growth capital, to be funded through a combination of debt facilities and a potential equity raise.",
        className: "text-lg leading-relaxed mb-8 text-muted-foreground bg-gradient-to-br from-sky-500/10 to-blue-500/5 p-8 rounded-2xl border-l-4 border-sky-500",
        editable: true
      },
      {
        id: "risk-heading",
        type: "subheading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Risk Scenario",
        className: "text-3xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-red-500 after:to-rose-600 after:rounded-full",
        editable: true
      },
      {
        id: "risk",
        type: "body",
        placeholder: "{{risk}}",
        defaultContent: "Under the risk scenario, we model the impact of a significant economic downturn combined with intensified competitive pressure and potential regulatory changes. Revenue growth decelerates to 1-3% annually, with potential for a single-quarter contraction of up to 5% in the event of a severe recession. Operating margins compress to 10-12% as pricing pressure increases and customer acquisition costs rise. Key risk factors include loss of two or more major enterprise clients, regulatory restrictions on our core product offerings, and a sustained decline in market confidence affecting new business pipeline conversion rates. Cash reserves of £15M provide approximately 8 months of operational runway in a zero-growth scenario.",
        className: "text-lg leading-relaxed mb-8 text-muted-foreground bg-gradient-to-br from-red-500/10 to-rose-500/5 p-8 rounded-2xl border-l-4 border-red-500",
        editable: true
      },
      {
        id: "mitigation-heading",
        type: "subheading",
        placeholder: "{{section4_heading}}",
        defaultContent: "Mitigation Strategies",
        className: "text-3xl font-bold text-foreground mb-4 mt-10 relative after:absolute after:-bottom-2 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-violet-500 after:to-purple-500 after:rounded-full",
        editable: true
      },
      {
        id: "mitigation",
        type: "bullet-list",
        placeholder: "{{mitigation}}",
        defaultContent: "Diversify revenue streams\nBuild strategic partnerships\nMaintain operational flexibility\nInvest in innovation",
        className: "space-y-4 mb-8 text-lg [&_li]:relative [&_li]:pl-8 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-2 [&_li]:before:w-3 [&_li]:before:h-3 [&_li]:before:bg-gradient-to-r [&_li]:before:from-violet-500 [&_li]:before:to-purple-500 [&_li]:before:rounded-full [&_li]:text-muted-foreground",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(215 14% 34%)",
      secondaryColor: "hsl(160 84% 39%)",
      accentColor: "hsl(350 89% 60%)",
      backgroundColor: "hsl(0 0% 100%)"
    }
  },
  {
    id: "multi-page-report",
    name: "Annual Report",
    category: "Business",
    description: "Comprehensive annual business report",
    thumbnail: "/thumbnails/annual-report-thumb.png",
    sections: [
      {
        id: "hero-header",
        type: "body",
        placeholder: "",
        defaultContent: "",
        className: "relative -mx-8 -mt-8 mb-8 px-10 py-24 bg-gradient-to-br from-emerald-950 via-teal-900 to-emerald-950 rounded-t-lg overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.2),transparent_60%)] after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_80%_80%,rgba(20,184,166,0.15),transparent_50%)]",
        editable: false
      },
      {
        id: "cover-title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Annual Report 2025",
        className: "relative z-10 text-6xl font-extrabold text-center mb-4 bg-gradient-to-r from-white via-emerald-100 to-teal-100 bg-clip-text text-transparent tracking-tight",
        editable: true
      },
      {
        id: "cover-tagline",
        type: "subheading",
        placeholder: "{{tagline}}",
        defaultContent: "Building Tomorrow's Success Today",
        className: "relative z-10 text-2xl text-center text-emerald-200/70 mb-8 font-light",
        editable: true
      },
      {
        id: "divider-cover",
        type: "divider",
        placeholder: "",
        className: "my-12 border-t-4 border-emerald-500/30",
        editable: false
      },
      {
        id: "ceo-message-heading",
        type: "heading",
        placeholder: "{{section1_heading}}",
        defaultContent: "CEO Message",
        className: "text-4xl font-extrabold text-foreground mb-6 mt-12 relative after:absolute after:-bottom-3 after:left-0 after:w-20 after:h-1.5 after:bg-gradient-to-r after:from-emerald-500 after:to-teal-500 after:rounded-full",
        editable: true
      },
      {
        id: "ceo-message",
        type: "body",
        placeholder: "{{ceo_message}}",
        defaultContent: "It gives me great pleasure to present our Annual Report for 2025, a year that has been truly transformative for our organisation. We entered the year with ambitious targets and a clear strategic vision, and I am proud to report that our team has delivered exceptional results across every measure of success. Revenue surpassed £150M for the first time in our company's history, representing 25% year-over-year growth, whilst our commitment to operational excellence drove profit margins to an all-time high of 18.5%. None of this would have been possible without the extraordinary dedication of our 500-strong team and the continued trust of our valued clients and partners.",
        className: "text-lg leading-relaxed mb-10 text-muted-foreground bg-gradient-to-br from-emerald-500/8 to-teal-500/5 p-8 rounded-2xl border-l-4 border-emerald-500",
        editable: true
      },
      {
        id: "performance-heading",
        type: "heading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Financial Performance",
        className: "text-4xl font-extrabold text-foreground mb-6 mt-12 relative after:absolute after:-bottom-3 after:left-0 after:w-20 after:h-1.5 after:bg-gradient-to-r after:from-teal-500 after:to-cyan-500 after:rounded-full",
        editable: true
      },
      {
        id: "performance",
        type: "body",
        placeholder: "{{performance}}",
        defaultContent: "We achieved record financial results in 2025, with total revenue reaching £152.3M, up from £121.8M in the prior year. This growth was driven by strong performance across all three business divisions: Enterprise Solutions contributed £68.5M (+28%), Professional Services delivered £52.1M (+22%), and our newly launched Digital Products division generated £31.7M in its first full year of operation. Gross profit margin improved to 62.4% from 58.9%, reflecting the increasing contribution of higher-margin recurring revenue streams which now represent 45% of total revenue. Operating cash flow was robust at £27.4M, enabling continued investment in growth initiatives whilst maintaining a healthy balance sheet.",
        className: "text-lg leading-relaxed mb-8 text-muted-foreground",
        editable: true
      },
      {
        id: "performance-chart",
        type: "image",
        placeholder: "{{performance_chart}}",
        defaultContent: "",
        className: "w-full h-96 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 rounded-2xl flex items-center justify-center my-10 border-2 border-emerald-500/20 shadow-xl",
        editable: true
      },
      {
        id: "operations-heading",
        type: "heading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Operations Highlights",
        className: "text-4xl font-extrabold text-foreground mb-6 mt-12 relative after:absolute after:-bottom-3 after:left-0 after:w-20 after:h-1.5 after:bg-gradient-to-r after:from-cyan-500 after:to-sky-500 after:rounded-full",
        editable: true
      },
      {
        id: "operations",
        type: "body",
        placeholder: "{{operations}}",
        defaultContent: "Our operational efficiency improved significantly through a comprehensive digital transformation programme initiated in early 2025. The implementation of our new enterprise resource planning system reduced administrative overhead by 30%, whilst automated workflow systems decreased average project delivery timelines by 18%. We expanded our office footprint with the opening of a state-of-the-art technology centre in Edinburgh, adding 15,000 square feet of collaborative workspace. Employee headcount grew to 500 across all locations, with particular investment in our technology engineering and client success teams to support our growing customer base.",
        className: "text-lg leading-relaxed mb-8 text-muted-foreground",
        editable: true
      },
      {
        id: "metrics-heading",
        type: "subheading",
        placeholder: "{{section4_heading}}",
        defaultContent: "Key Metrics",
        className: "text-2xl font-bold text-foreground mb-4 mt-8 relative after:absolute after:-bottom-2 after:left-0 after:w-12 after:h-1 after:bg-gradient-to-r after:from-sky-500 after:to-blue-500 after:rounded-full",
        editable: true
      },
      {
        id: "metrics",
        type: "bullet-list",
        placeholder: "{{metrics}}",
        defaultContent: "Revenue: £150M (+25% YoY)\nProfit Margin: 18.5%\nEmployee Count: 500\nCustomer Satisfaction: 92%\nMarket Share: 12%",
        className: "space-y-4 mb-10 text-lg font-medium [&_li]:relative [&_li]:pl-8 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-2 [&_li]:before:w-3 [&_li]:before:h-3 [&_li]:before:bg-gradient-to-r [&_li]:before:from-emerald-500 [&_li]:before:to-teal-500 [&_li]:before:rounded-full [&_li]:text-foreground [&_li]:py-3 [&_li]:px-5 [&_li]:bg-emerald-500/5 [&_li]:rounded-xl",
        editable: true
      },
      {
        id: "outlook-heading",
        type: "heading",
        placeholder: "{{section5_heading}}",
        defaultContent: "2026 Outlook",
        className: "text-4xl font-extrabold text-foreground mb-6 mt-12 relative after:absolute after:-bottom-3 after:left-0 after:w-20 after:h-1.5 after:bg-gradient-to-r after:from-blue-500 after:to-indigo-500 after:rounded-full",
        editable: true
      },
      {
        id: "outlook",
        type: "body",
        placeholder: "{{outlook}}",
        defaultContent: "We enter 2026 with exceptional momentum and a clear strategic roadmap for continued growth and innovation. Our three-year plan targets revenue of £250M by 2028, driven by international expansion into European and Asia-Pacific markets, strategic acquisitions to enhance our technology capabilities, and continued organic growth within our established client base. We are investing heavily in artificial intelligence and machine learning capabilities to enhance our product offerings and create new revenue streams. The board and executive team are fully aligned on our ambitious but achievable growth trajectory, and we remain deeply committed to delivering value for all our stakeholders.",
        className: "text-lg leading-relaxed mb-8 text-muted-foreground relative p-8 bg-gradient-to-br from-emerald-500/8 to-teal-500/5 rounded-2xl border border-emerald-500/15",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(160 84% 39%)",
      secondaryColor: "hsl(172 66% 50%)",
      accentColor: "hsl(199 89% 48%)",
      backgroundColor: "hsl(0 0% 100%)"
    }
  },
  {
    id: "pitch-deck",
    name: "Pitch Deck",
    category: "Business",
    description: "Startup pitch presentation document",
    thumbnail: "/thumbnails/business-pitch-thumb.png",
    sections: [
      {
        id: "hero-header",
        type: "body",
        placeholder: "",
        defaultContent: "",
        className: "relative -mx-8 -mt-8 mb-8 px-10 py-28 bg-gradient-to-br from-orange-950 via-red-900 to-rose-950 rounded-t-lg overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.2),transparent_60%)] after:absolute after:inset-0 after:bg-[radial-gradient(circle_at_80%_20%,rgba(244,63,94,0.15),transparent_50%)]",
        editable: false
      },
      {
        id: "cover-title",
        type: "heading",
        placeholder: "{{title}}",
        defaultContent: "Company Pitch Deck",
        className: "relative z-10 text-6xl font-extrabold text-center mb-6 bg-gradient-to-r from-white via-orange-100 to-red-100 bg-clip-text text-transparent tracking-tight",
        editable: true
      },
      {
        id: "cover-tagline",
        type: "subheading",
        placeholder: "{{tagline}}",
        defaultContent: "Revolutionizing the Industry",
        className: "relative z-10 text-3xl text-center text-orange-200/60 mb-8 font-light",
        editable: true
      },
      {
        id: "divider-1",
        type: "divider",
        placeholder: "",
        className: "my-16 border-t-4 border-orange-500/20",
        editable: false
      },
      {
        id: "problem-heading",
        type: "heading",
        placeholder: "{{section1_heading}}",
        defaultContent: "The Problem",
        className: "text-5xl font-extrabold mb-6 mt-16 relative after:absolute after:-bottom-3 after:left-0 after:w-24 after:h-1.5 after:bg-gradient-to-r after:from-red-500 after:to-rose-500 after:rounded-full text-foreground",
        editable: true
      },
      {
        id: "problem",
        type: "body",
        placeholder: "{{problem}}",
        defaultContent: "Today's businesses face unprecedented challenges in a rapidly evolving digital landscape. Legacy operational systems are unable to keep pace with changing customer expectations, regulatory requirements continue to grow in complexity, and the cost of maintaining outdated infrastructure consumes resources that should be directed toward innovation and growth. Research indicates that 67% of mid-market companies report significant operational inefficiencies costing them an average of £2.3M annually in lost productivity, whilst 72% of enterprise leaders cite digital transformation as their top strategic priority but lack the internal expertise to execute effectively.",
        className: "text-2xl leading-relaxed mb-12 text-muted-foreground",
        editable: true
      },
      {
        id: "solution-heading",
        type: "heading",
        placeholder: "{{section2_heading}}",
        defaultContent: "Our Solution",
        className: "text-5xl font-extrabold mb-6 mt-16 relative after:absolute after:-bottom-3 after:left-0 after:w-24 after:h-1.5 after:bg-gradient-to-r after:from-emerald-500 after:to-green-500 after:rounded-full text-foreground",
        editable: true
      },
      {
        id: "solution",
        type: "body",
        placeholder: "{{solution}}",
        defaultContent: "Our integrated platform combines proprietary AI-driven analytics, modular workflow automation, and intuitive client management tools to deliver a comprehensive solution that addresses the full spectrum of modern business challenges. Unlike piecemeal point solutions that create data silos and integration headaches, our unified architecture provides a single source of truth across all business functions. Early adopters have reported average efficiency gains of 40%, revenue increases of 25%, and customer satisfaction improvements exceeding 30 percentage points—all within the first twelve months of deployment.",
        className: "text-2xl leading-relaxed mb-12 text-muted-foreground",
        editable: true
      },
      {
        id: "solution-visual",
        type: "image",
        placeholder: "{{solution_visual}}",
        defaultContent: "",
        className: "w-full h-96 bg-gradient-to-br from-orange-500/10 via-red-500/10 to-rose-500/10 rounded-2xl flex items-center justify-center my-12 border-2 border-orange-500/20 shadow-2xl",
        editable: true
      },
      {
        id: "market-heading",
        type: "heading",
        placeholder: "{{section3_heading}}",
        defaultContent: "Market Opportunity",
        className: "text-5xl font-extrabold mb-6 mt-16 relative after:absolute after:-bottom-3 after:left-0 after:w-24 after:h-1.5 after:bg-gradient-to-r after:from-blue-500 after:to-sky-500 after:rounded-full text-foreground",
        editable: true
      },
      {
        id: "market",
        type: "bullet-list",
        placeholder: "{{market}}",
        defaultContent: "£10B total addressable market\n25% annual growth rate\n5M potential customers\nLimited competition in our segment",
        className: "space-y-4 mb-12 text-2xl font-medium [&_li]:relative [&_li]:pl-8 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-3 [&_li]:before:w-4 [&_li]:before:h-4 [&_li]:before:bg-gradient-to-r [&_li]:before:from-blue-500 [&_li]:before:to-sky-500 [&_li]:before:rounded-full [&_li]:text-foreground",
        editable: true
      },
      {
        id: "traction-heading",
        type: "heading",
        placeholder: "{{section4_heading}}",
        defaultContent: "Traction",
        className: "text-5xl font-extrabold mb-6 mt-16 relative after:absolute after:-bottom-3 after:left-0 after:w-24 after:h-1.5 after:bg-gradient-to-r after:from-amber-500 after:to-orange-500 after:rounded-full text-foreground",
        editable: true
      },
      {
        id: "traction",
        type: "bullet-list",
        placeholder: "{{traction}}",
        defaultContent: "£5M annual recurring revenue\n200+ enterprise customers\n40% quarter-over-quarter growth\n95% customer retention",
        className: "space-y-4 mb-12 text-2xl font-medium [&_li]:relative [&_li]:pl-8 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-3 [&_li]:before:w-4 [&_li]:before:h-4 [&_li]:before:bg-gradient-to-r [&_li]:before:from-amber-500 [&_li]:before:to-orange-500 [&_li]:before:rounded-full [&_li]:text-foreground",
        editable: true
      },
      {
        id: "ask-heading",
        type: "heading",
        placeholder: "{{section5_heading}}",
        defaultContent: "Investment Ask",
        className: "text-5xl font-extrabold mb-6 mt-16 relative after:absolute after:-bottom-3 after:left-0 after:w-24 after:h-1.5 after:bg-gradient-to-r after:from-orange-500 after:to-red-500 after:rounded-full text-foreground",
        editable: true
      },
      {
        id: "ask",
        type: "body",
        placeholder: "{{ask}}",
        defaultContent: "We are seeking £10M in Series A funding to scale our operations and accelerate market penetration across the UK and European markets. The capital will be deployed strategically: 45% towards product development and AI capability enhancement, 30% towards sales and marketing to drive enterprise client acquisition, and 25% towards operational scaling including team expansion and infrastructure. At our current trajectory, we project reaching £25M ARR within 18 months of funding, with a clear path to profitability by Q4 2027. We are offering equity participation on highly favourable terms and welcome the opportunity to discuss this investment in greater detail.",
        className: "text-2xl leading-relaxed mb-12 text-muted-foreground relative p-10 bg-gradient-to-br from-orange-500/10 to-red-500/5 rounded-3xl border-2 border-orange-500/20",
        editable: true
      }
    ],
    styles: {
      primaryColor: "hsl(25 95% 53%)",
      secondaryColor: "hsl(0 72% 51%)",
      accentColor: "hsl(350 89% 60%)",
      backgroundColor: "hsl(0 0% 100%)"
    }
  }
];
