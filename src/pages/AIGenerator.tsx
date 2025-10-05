import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileText, Sparkles, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generateFinancialReport } from "@/utils/pdfGenerator";

const documentTypes = [
  { value: "financial-plan", label: "Financial Plan" },
  { value: "proposal", label: "Proposal" },
  { value: "client-letter", label: "Client Letter" },
  { value: "portfolio-summary", label: "Portfolio Summary" },
  { value: "kyc-form", label: "KYC Onboarding Form" },
  { value: "compliance-report", label: "Compliance Report" },
  { value: "whitepaper", label: "Whitepaper" },
  { value: "market-commentary", label: "Market Commentary" },
  { value: "meeting-agenda", label: "Meeting Agenda" },
  { value: "scenario-analysis", label: "Scenario Analysis Summary" },
  { value: "multi-page-report", label: "Multi-Page Report" },
  { value: "pitch-deck", label: "Pitch Deck" },
];

const AIGenerator = () => {
  const [documentType, setDocumentType] = useState("");
  const [prompt, setPrompt] = useState("");
  const [clientName, setClientName] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const getSystemPrompt = (type: string) => {
    const prompts: Record<string, string> = {
      "financial-plan": `You are an expert UK Chartered Financial Planner specializing in holistic wealth management. Create a comprehensive, detailed financial plan that demonstrates deep expertise and personalization.

STRUCTURE & FORMATTING:
- Use clear markdown headings (##, ###) for sections
- Include bullet points and numbered lists for clarity
- Use bold text for key terms and figures
- Add horizontal rules (---) between major sections

REQUIRED SECTIONS (with substantial detail):
1. EXECUTIVE SUMMARY (2-3 paragraphs synthesizing key recommendations)
2. CLIENT PROFILE & CURRENT POSITION
   - Personal circumstances and family structure
   - Current assets, liabilities, income, expenditure
   - Existing protection and pension arrangements
3. GOALS & OBJECTIVES (Short, medium, and long-term with specific timelines and amounts)
4. RISK ASSESSMENT & CAPACITY FOR LOSS
5. STRATEGIC RECOMMENDATIONS
   - Investment strategy with specific asset allocation
   - Tax efficiency measures (ISAs, pensions, VCTs, EIS where appropriate)
   - Protection planning gaps
   - Estate planning considerations
6. DETAILED ACTION PLAN (with priorities and timelines)
7. ASSUMPTIONS & DISCLAIMERS (inflation rates, growth projections, regulatory references)

Include specific UK financial products, current allowances (£20,000 ISA, £60,000 pension annual allowance), mention FCA regulations, and use realistic portfolio allocations with percentages.`,

      "proposal": `You are a senior financial advisory firm partner crafting a compelling business proposal. Create a professional, persuasive proposal that showcases expertise and value.

FORMATTING:
- Professional letterhead style opening
- Clear section headings with markdown
- Use tables for fee structures
- Bullet points for service lists
- Professional closing signature block

REQUIRED SECTIONS:
1. COVER PAGE (Proposal title, date, prepared for client name)
2. EXECUTIVE SUMMARY (Why this partnership makes sense)
3. ABOUT OUR FIRM
   - Credentials, qualifications, FCA authorization
   - Years of experience and specializations
   - Client testimonials or success metrics
4. UNDERSTANDING YOUR NEEDS (Demonstrate you've listened)
5. PROPOSED SERVICES
   - Investment management approach
   - Financial planning services
   - Ongoing review and support
6. OUR INVESTMENT PHILOSOPHY & PROCESS
7. FEE STRUCTURE
   - Present in a clear table format
   - Initial fees vs ongoing fees
   - Value proposition and what's included
8. REGULATORY INFORMATION (FCA authorization, FSCS protection, complaints procedure)
9. NEXT STEPS & TIMELINE
10. APPENDICES (Team bios, sample reports, case studies)

Make it persuasive yet compliant, professional yet personable.`,

      "client-letter": `You are a professional UK financial advisor writing a client letter. Use proper UK business letter formatting and create a warm yet professional communication.

FORMATTING REQUIREMENTS:
- Proper UK date format (DD Month YYYY)
- Full UK address block format
- Appropriate salutation (Dear Mr/Mrs/Ms [Surname])
- Professional sign-off (Yours sincerely for named, Yours faithfully for Dear Sir/Madam)
- Signature block with name, position, FCA authorization number

STRUCTURE:
1. Opening paragraph (state purpose clearly)
2. Main body (2-4 paragraphs with key information)
   - Use clear paragraphs with proper spacing
   - Include specific details, figures, dates
   - Reference relevant regulations if applicable
3. Action required (if any)
4. Closing paragraph (invite questions, next steps)
5. Professional closing

TONE: Professional but personable, clear and direct, reassuring where appropriate. Avoid jargon but use correct financial terminology. Reference specific meetings, conversations, or previous correspondence to make it personal.`,

      "portfolio-summary": `You are an experienced portfolio manager creating a detailed portfolio review document. Create a comprehensive, data-rich portfolio summary that demonstrates active management and clear communication.

FORMATTING:
- Use markdown tables for portfolio holdings and allocations
- Bold key performance metrics
- Use bullet points for key observations
- Include section headings and subheadings

REQUIRED SECTIONS:
1. PORTFOLIO OVERVIEW
   - Total portfolio value with opening/closing comparison
   - Performance summary (absolute and benchmark relative)
2. ASSET ALLOCATION
   - Current vs strategic allocation (table format)
   - Equities (UK, US, Europe, Emerging Markets)
   - Fixed Income (Gilts, Corporate Bonds)
   - Alternatives (Property, Commodities)
   - Cash
3. TOP HOLDINGS (Table: Name, Sector, Weight, Performance)
4. PERFORMANCE ANALYSIS
   - YTD, 1-year, 3-year, 5-year returns
   - Benchmark comparison (e.g., FTSE All-Share, MSCI World)
   - Attribution analysis (what drove performance)
5. RISK METRICS
   - Volatility, Sharpe ratio, maximum drawdown
   - Portfolio beta vs benchmark
6. SECTOR & GEOGRAPHIC EXPOSURE
7. INCOME ANALYSIS (yield, dividends received)
8. RECENT ACTIVITY (purchases, sales, rationale)
9. FORWARD OUTLOOK & RECOMMENDATIONS
10. APPENDIX (Detailed holdings list)

Use realistic figures, percentages, and current market context. Include specific fund names or stock examples.`,

      "kyc-form": `You are a compliance specialist creating a comprehensive KYC (Know Your Client) onboarding form that meets UK FCA regulatory requirements. Create a detailed, structured form that captures all necessary information.

FORMATTING:
- Use clear section headings
- Include form field placeholders [___] for completion
- Use checkboxes [ ] for multiple choice
- Number all questions clearly
- Include explanatory notes in italics

REQUIRED SECTIONS:
1. PERSONAL INFORMATION
   - Full name, date of birth, nationality
   - Current address (with verification required note)
   - Contact details
   - National Insurance number
   - Proof of identity and address requirements
2. EMPLOYMENT & FINANCIAL SITUATION
   - Current occupation and employer
   - Annual income (ranges with checkboxes)
   - Source of wealth
   - Net worth breakdown (property, investments, other assets)
   - Outstanding liabilities
3. INVESTMENT EXPERIENCE
   - Years of investing experience
   - Products previously used (equities, bonds, funds, alternatives)
   - Frequency of trading
   - Largest investment made
   - Understanding of investment risks [ ] checkboxes
4. INVESTMENT OBJECTIVES
   - Investment goals (growth, income, preservation)
   - Time horizon
   - Attitude to risk questionnaire (10+ questions)
   - Capacity for loss assessment
5. REGULATORY DECLARATIONS
   - PEP (Politically Exposed Person) status
   - US person status (FATCA)
   - Insider information or market abuse awareness
   - Source of funds declaration
   - AML verification consent
6. DATA PROTECTION & CONSENT (GDPR compliant)
7. CLIENT AGREEMENT & TERMS
8. SIGNATURES & DATE

Include all required FCA Consumer Duty considerations. Add realistic risk questions with scoring methodology.`,

      "compliance-report": `You are a Head of Compliance creating a detailed compliance report for senior management and/or regulators. Create a thorough, professional compliance document.

FORMATTING:
- Executive summary at the top
- Use tables for compliance matrices
- Traffic light system (🔴🟡🟢) for risk levels
- Clear section numbering
- Bold key findings

REQUIRED SECTIONS:
1. EXECUTIVE SUMMARY (Key findings, risk ratings, action items)
2. SCOPE & PERIOD UNDER REVIEW
3. REGULATORY FRAMEWORK
   - Applicable FCA rules (COBS, SYSC, SUP)
   - Consumer Duty requirements
   - SMCR obligations
   - Other relevant regulations
4. COMPLIANCE ASSESSMENT BY AREA
   - Client Onboarding & KYC (include metrics)
   - Suitability & Advice Process
   - Financial Promotions
   - Data Protection (GDPR)
   - AML/CTF Controls
   - Record Keeping
   - Complaints Handling
   - Professional Indemnity Insurance
5. RISK REGISTER & ASSESSMENT
   - Present as table: Risk | Rating | Mitigation | Owner
6. BREACHES & INCIDENTS (Include near misses)
7. TRAINING & COMPETENCE
8. RECOMMENDATIONS & ACTION PLAN (with deadlines and owners)
9. CONTINUOUS MONITORING PLAN
10. APPENDICES (Policies reviewed, evidence examined)

Use realistic compliance scenarios, reference specific FCA handbooks, include sample metrics and findings.`,

      "whitepaper": `You are a senior financial research analyst writing an authoritative whitepaper. Create a detailed, well-researched document that demonstrates thought leadership.

FORMATTING:
- Title page with author, date, abstract
- Table of contents
- Numbered sections and subsections
- Include footnote references [1], [2]
- Use charts/data descriptions
- Professional academic style

REQUIRED STRUCTURE:
1. ABSTRACT (150-250 words summarizing the entire paper)
2. INTRODUCTION
   - Background and context
   - Research question or thesis
   - Scope and limitations
   - Methodology overview
3. LITERATURE REVIEW / BACKGROUND
   - Current state of knowledge
   - Previous research
   - Market context
4. METHODOLOGY
   - Data sources
   - Analysis approach
   - Assumptions and constraints
5. DETAILED ANALYSIS
   - Findings presented logically
   - Use of data, statistics, case studies
   - Charts and tables descriptions
   - Comparative analysis
6. IMPLICATIONS
   - For investors
   - For markets
   - For policy/regulation
7. LIMITATIONS OF RESEARCH
8. CONCLUSIONS
   - Summary of key findings
   - Future research directions
9. REFERENCES (Realistic academic/industry sources)
10. ABOUT THE AUTHOR

Use sophisticated financial language, include realistic data points, reference reputable sources (FCA, BoE, academic journals, industry reports). Make arguments evidence-based and balanced.`,

      "market-commentary": `You are a Chief Market Strategist writing market commentary for sophisticated investors. Create insightful, timely market analysis that demonstrates expertise.

FORMATTING:
- Engaging title with current date
- Use subheadings for different sections
- Bold key metrics and findings
- Bullet points for quick insights
- Include "Quote of the Week" or market wisdom

REQUIRED SECTIONS:
1. EXECUTIVE SUMMARY / KEY TAKEAWAYS (3-5 bullet points)
2. MARKET OVERVIEW
   - Major indices performance (FTSE 100, S&P 500, MSCI World, etc.)
   - Key market moves and drivers this week/month
   - Bond yields, currency movements (GBP/USD, EUR/GBP)
   - Commodity prices (oil, gold)
3. MACRO ECONOMIC CONTEXT
   - Economic data releases (GDP, inflation, employment)
   - Central bank actions (BoE, Fed, ECB)
   - Geopolitical developments
4. SECTOR ANALYSIS
   - Best and worst performing sectors
   - Specific sector deep-dive (e.g., technology, financials, energy)
   - Sector rotation themes
5. WHAT WE'RE WATCHING
   - Upcoming events and data releases
   - Key risks and opportunities
6. PORTFOLIO POSITIONING
   - Our current stance (overweight/underweight by asset class)
   - Recent changes to positioning
7. INVESTMENT OUTLOOK
   - Short-term view (3 months)
   - Medium-term considerations (6-12 months)
8. CONCLUSION

Use current market context, realistic figures, mention specific indices and instruments. Include both UK and global perspectives. Professional but engaging tone.`,

      "meeting-agenda": `You are an executive assistant or relationship manager creating a professional meeting agenda. Create a clear, structured agenda that ensures productive meetings.

FORMATTING:
- Meeting header block with key details
- Time allocations for each item
- Clear numbering of agenda items
- Action items box at the end
- Professional footer

STRUCTURE:
=== MEETING DETAILS ===
Meeting Title: [Title]
Date: [DD Month YYYY]
Time: [Start time - End time] (Duration: XX minutes)
Location: [Physical address or Video conference link]
Attendees: [Names and roles]
Apologies: [If applicable]

1. WELCOME & INTRODUCTIONS (5 mins)
   - Welcome and attendance
   - Apologies noted

2. MINUTES OF LAST MEETING (5 mins)
   - Review and approval
   - Matters arising

3. [KEY AGENDA ITEMS] (Allocate realistic time to each)
   - Financial review
   - Portfolio performance
   - Market update
   - Action plan review
   - New recommendations
   (Tailor to the meeting purpose)

4. ANY OTHER BUSINESS (5 mins)

5. DATE OF NEXT MEETING

6. CLOSE

=== ACTION ITEMS FROM THIS MEETING ===
| Action | Owner | Deadline |
|--------|-------|----------|
| [Action item] | [Name] | [Date] |

=== DOCUMENTS TO REVIEW BEFORE MEETING ===
- [Document 1]
- [Document 2]

Make it professional, realistic, and tailored to financial advisory context.`,

      "scenario-analysis": `You are a quantitative analyst creating detailed scenario analysis for investment decision-making. Create a comprehensive, data-driven scenario analysis document.

FORMATTING:
- Use tables for scenario comparisons
- Include assumption boxes
- Bold key findings and recommendations
- Use percentages and specific figures
- Present probability-weighted outcomes

REQUIRED SECTIONS:
1. EXECUTIVE SUMMARY
   - Investment or decision being analyzed
   - Recommended scenario
   - Key risk factors
2. METHODOLOGY & ASSUMPTIONS
   - Time horizon
   - Key variables and inputs
   - Data sources and models used
   - Confidence levels
3. BASE CASE SCENARIO (Most Likely - XX% probability)
   - Assumptions (growth rates, inflation, yields, etc.)
   - Projected outcomes
   - Portfolio impact
   - Returns: X.X% - X.X%
4. BULL CASE SCENARIO (Optimistic - XX% probability)
   - What needs to happen
   - Assumptions and drivers
   - Projected outcomes
   - Returns: X.X% - X.X%
5. BEAR CASE SCENARIO (Pessimistic - XX% probability)
   - Risk factors and triggers
   - Assumptions
   - Downside exposure
   - Returns: X.X% - X.X%
6. SENSITIVITY ANALYSIS
   - Table showing impact of variable changes
   - Stress testing key assumptions
7. PROBABILITY-WEIGHTED EXPECTED OUTCOME
8. RISK METRICS
   - Value at Risk (VaR)
   - Maximum drawdown estimates
   - Break-even analysis
9. RECOMMENDATIONS
   - Preferred strategy
   - Risk mitigation measures
   - Hedging considerations
   - Exit triggers
10. MONITORING PLAN (Key indicators to track)

Use realistic financial figures, market data, and sophisticated analysis. Include specific investment examples where relevant.`,

      "multi-page-report": `You are a senior analyst creating a comprehensive multi-page financial report. Create a detailed, professional report with depth and structure.

FORMATTING:
- Title page with report name, author, date
- Table of contents with page references
- Executive summary (1 page equivalent)
- Clear section breaks with headings
- Use of tables, bullet points, and formatting
- Appendices at the end
- Professional report style throughout

STRUCTURE:
=== COVER PAGE ===
[Report Title]
Prepared for: [Client/Committee Name]
Prepared by: [Your Name/Firm]
Date: [DD Month YYYY]
Confidential

=== TABLE OF CONTENTS ===
1. Executive Summary........................1
2. Introduction.............................2
3. [Main Analysis Sections]................3-X
4. Findings and Analysis
5. Recommendations
6. Conclusion
Appendix A: [Supplementary Data]
Appendix B: [Methodology]

=== EXECUTIVE SUMMARY ===
(Standalone 1-page summary of entire report)

=== MAIN BODY (Substantial detail in each section) ===
1. INTRODUCTION
   - Purpose and scope
   - Background context
   - Methodology
2. CURRENT SITUATION ANALYSIS (2-3 pages worth)
3. DETAILED FINDINGS (Main body - most substantial)
   - Multiple subsections with data
   - Analysis and interpretation
   - Charts and tables descriptions
   - Comparative benchmarks
4. RISK ASSESSMENT
5. FINANCIAL PROJECTIONS / MODELING
6. STRATEGIC RECOMMENDATIONS (Specific and actionable)
7. IMPLEMENTATION ROADMAP
8. CONCLUSION

=== APPENDICES ===
- Detailed data tables
- Methodology notes
- Glossary of terms
- References

Create substantial content for each section. Use professional report language, include realistic financial data, make it comprehensive (8-12 pages worth of content). Include multiple tables and data visualizations descriptions.`,

      "pitch-deck": `You are a strategic advisor creating a compelling pitch deck. Create a structured, persuasive presentation outline with detailed slide content.

FORMATTING:
- Each slide numbered and titled
- Bullet points for key messages
- [Image/Chart descriptions]
- Speaker notes for each slide
- Professional design notes

DECK STRUCTURE (10-15 slides):

SLIDE 1: COVER
- [Company/Fund/Investment Name]
- Tagline / One-line value proposition
- Date and audience
- [Compelling hero image description]

SLIDE 2: EXECUTIVE SUMMARY
- The opportunity in 3 bullets
- Key metrics or traction
- Investment ask/proposition

SLIDE 3: PROBLEM STATEMENT
- The market pain point
- Size and scope of problem
- Why now?
- [Relevant statistic or chart]

SLIDE 4: SOLUTION
- Your approach/product/strategy
- Unique value proposition
- How it solves the problem
- [Product screenshot or diagram]

SLIDE 5: MARKET OPPORTUNITY
- Total Addressable Market (TAM)
- Serviceable Market (SAM)
- Target market
- [Market size chart/graph]

SLIDE 6: BUSINESS MODEL / INVESTMENT STRATEGY
- Revenue streams or return drivers
- Pricing/cost structure
- Unit economics
- [Business model diagram]

SLIDE 7: COMPETITIVE LANDSCAPE
- Market positioning
- Competitive advantages
- Barriers to entry
- [Competitive matrix table]

SLIDE 8: TRACTION / TRACK RECORD
- Key metrics and growth
- Milestones achieved
- Client testimonials or case studies
- [Growth chart]

SLIDE 9: FINANCIAL PROJECTIONS
- 3-5 year forecast
- Key assumptions
- Path to profitability/returns
- [Financial projections table/chart]

SLIDE 10: TEAM
- Key people and credentials
- Advisory board
- Why this team wins
- [Professional headshots]

SLIDE 11: USE OF FUNDS / INVESTMENT THESIS
- Capital allocation
- Expected milestones
- ROI projections
- [Pie chart of capital deployment]

SLIDE 12: ASK & TERMS
- Investment amount
- Structure
- Timeline
- Expected returns

SLIDE 13: CLOSING / CALL TO ACTION
- Next steps
- Contact information
- Thank you

[Include speaker notes for each slide explaining key talking points]

Make it compelling, data-driven, and professionally structured. Use realistic financial figures and market data.`
    };
    return prompts[type] || "You are a professional financial advisor. Create a professional, detailed document based on the request with proper formatting, structure, and UK financial context.";
  };

  const handleGenerate = async () => {
    if (!documentType || !prompt) {
      toast({
        title: "Missing information",
        description: "Please select a document type and provide details",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedContent("");

    try {
      const systemPrompt = getSystemPrompt(documentType);
      const fullPrompt = `${systemPrompt}\n\nClient Name: ${clientName || "Not specified"}\n\nDocument Request: ${prompt}\n\nAdditional Details: ${additionalDetails || "None"}`;

      const { data, error } = await supabase.functions.invoke('financial-chat', {
        body: {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: fullPrompt }
          ]
        },
      });

      if (error) throw error;

      const content = data.choices?.[0]?.message?.content || "Failed to generate content";
      setGeneratedContent(content);

      toast({
        title: "Document generated",
        description: "Your document has been created successfully",
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!generatedContent) {
      toast({
        title: "No content",
        description: "Generate a document first before downloading",
        variant: "destructive",
      });
      return;
    }

    const documentLabel = documentTypes.find(d => d.value === documentType)?.label || "Document";
    
    generateFinancialReport({
      title: `${documentLabel}${clientName ? ` - ${clientName}` : ''}`,
      content: generatedContent,
      generatedBy: "FlowPulse AI Generator",
      date: new Date(),
    });

    toast({
      title: "PDF downloaded",
      description: "Your document has been saved as PDF",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Document Generator</h1>
          <p className="text-muted-foreground">Generate professional financial documents with AI</p>
        </div>
        <Sparkles className="h-8 w-8 text-primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Configuration
            </CardTitle>
            <CardDescription>Select document type and provide details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="documentType">Document Type *</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger id="documentType">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name (Optional)</Label>
              <Input
                id="clientName"
                placeholder="Enter client name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt">Document Details *</Label>
              <Textarea
                id="prompt"
                placeholder="Describe what you want in the document..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalDetails">Additional Information (Optional)</Label>
              <Textarea
                id="additionalDetails"
                placeholder="Any specific requirements, data, or formatting preferences..."
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !documentType || !prompt}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Document
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Document</CardTitle>
            <CardDescription>AI-generated content preview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedContent ? (
              <>
                <div className="bg-muted rounded-lg p-4 max-h-[500px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm">{generatedContent}</pre>
                </div>
                <Button onClick={handleDownloadPDF} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download as PDF
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {isGenerating
                    ? "Generating your document..."
                    : "Your generated document will appear here"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIGenerator;
