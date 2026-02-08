import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { createOpportunityNotification } from "@/utils/notificationService";
import { 
  Upload, 
  Building2, 
  Briefcase, 
  Gem, 
  Loader2,
  Star,
  Save,
  Image
} from "lucide-react";

const categoryConfig = {
  uk_property: {
    label: "UK Property",
    icon: Building2,
    subCategories: ["B2F", "B2L", "HMO", "R2R", "B2SA", "Commercial Property", "Land", "Parking Spaces"]
  },
  vehicles: {
    label: "Vehicles",
    icon: Briefcase, // Using Briefcase as placeholder since Car icon not imported
    subCategories: ["Classic Cars", "Luxury Vehicles", "Motorcycles", "Commercial Vehicles"]
  },
  overseas_property: {
    label: "Overseas Property & Land",
    icon: Building2,
    subCategories: ["Residential Overseas", "Commercial Overseas", "Land Overseas", "Development Projects"]
  },
  businesses: {
    label: "Businesses",
    icon: Briefcase,
    subCategories: ["SMEs", "Startups", "Franchises", "Established Businesses"]
  },
  stocks: {
    label: "Stocks",
    icon: Briefcase,
    subCategories: ["UK Equities", "US Equities", "International Equities", "Penny Stocks"]
  },
  crypto: {
    label: "Crypto & Digital Assets",
    icon: Gem,
    subCategories: ["Cryptocurrency", "NFTs", "Digital Tokens", "DeFi"]
  },
  private_equity: {
    label: "Private Equity",
    icon: Briefcase,
    subCategories: ["Growth Equity", "Buyouts", "Venture Capital", "Mezzanine"]
  },
  memorabilia: {
    label: "Memorabilia",
    icon: Gem,
    subCategories: ["Sports Memorabilia", "Entertainment", "Historical Items", "Signed Items"]
  },
  commodities: {
    label: "Commodities & Hard Assets",
    icon: Gem,
    subCategories: ["Gold", "Silver", "Precious Metals", "Raw Materials"]
  },
  funds: {
    label: "Funds",
    icon: Building2,
    subCategories: ["Mutual Funds", "ETFs", "Hedge Funds", "REITs"]
  }
};

interface OpportunityForm {
  // Basic Info
  title: string;
  short_description: string;
  full_description: string;
  category: string;
  sub_category: string;
  
  // Pricing & Location
  price: string;
  price_currency: string;
  location: string;
  country: string;
  
  // Ratings
  analyst_rating: string;
  quality_score: number;
  value_score: number;
  liquidity_score: number;
  risk_score: number;
  transparency_score: number;
  complexity_score: number;
  market_sentiment_score: number;
  age_condition_score: number;
  geographic_regulatory_score: number;
  
  // Commentary
  investment_thesis: string;
  strengths: string;
  risks: string;
  suitable_investor_type: string;
  key_watchpoints: string;
  
  // Dimension-specific commentary
  liquidity_commentary: string;
  transparency_commentary: string;
  risk_commentary: string;
  complexity_commentary: string;
  market_sentiment_commentary: string;
  age_condition_commentary: string;
  geographic_regulatory_commentary: string;
  
  // Real Estate specific
  property_type: string;
  bedrooms: string;
  bathrooms: string;
  square_footage: string;
  year_built: string;
  rental_yield: string;
  
  // Business specific
  industry: string;
  annual_revenue: string;
  employee_count: string;
  founding_year: string;
  business_stage: string;
  
  // Collectibles specific
  provenance: string;
  condition: string;
  authenticity_verified: boolean;
  estimated_appreciation: string;
  
  // Status
  status: string;
  featured: boolean;
}

const initialForm: OpportunityForm = {
  title: "",
  short_description: "",
  full_description: "",
  category: "",
  sub_category: "",
  price: "",
  price_currency: "GBP",
  location: "",
  country: "United Kingdom",
  analyst_rating: "",
  quality_score: 3,
  value_score: 3,
  liquidity_score: 3,
  risk_score: 3,
  transparency_score: 3,
  complexity_score: 3,
  market_sentiment_score: 3,
  age_condition_score: 3,
  geographic_regulatory_score: 3,
  investment_thesis: "",
  strengths: "",
  risks: "",
  suitable_investor_type: "",
  key_watchpoints: "",
  liquidity_commentary: "",
  transparency_commentary: "",
  risk_commentary: "",
  complexity_commentary: "",
  market_sentiment_commentary: "",
  age_condition_commentary: "",
  geographic_regulatory_commentary: "",
  property_type: "",
  bedrooms: "",
  bathrooms: "",
  square_footage: "",
  year_built: "",
  rental_yield: "",
  industry: "",
  annual_revenue: "",
  employee_count: "",
  founding_year: "",
  business_stage: "",
  provenance: "",
  condition: "",
  authenticity_verified: false,
  estimated_appreciation: "",
  status: "draft",
  featured: false
};

export function OpportunityUpload() {
  const [form, setForm] = useState<OpportunityForm>(initialForm);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const overallScore = ((form.quality_score + form.value_score + form.liquidity_score + form.risk_score + form.transparency_score + form.complexity_score + form.market_sentiment_score + form.age_condition_score + form.geographic_regulatory_score) / 9).toFixed(1);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title || !form.category || !form.sub_category) {
      toast.error("Please fill in all required fields");
      return;
    }

    setUploading(true);
    try {
      let thumbnailUrl = "";

      // Upload thumbnail if provided
      if (thumbnailFile) {
        const fileExt = thumbnailFile.name.split(".").pop();
        const fileName = `opportunities/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("reports")
          .upload(fileName, thumbnailFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("reports")
          .getPublicUrl(fileName);
        
        thumbnailUrl = publicUrl;
      }

      const { data: { user } } = await supabase.auth.getUser();

      const opportunityData = {
        title: form.title,
        short_description: form.short_description,
        full_description: form.full_description,
        category: form.category,
        sub_category: form.sub_category,
        price: form.price ? parseFloat(form.price) : null,
        price_currency: form.price_currency,
        location: form.location,
        country: form.country,
        thumbnail_url: thumbnailUrl || null,
        analyst_rating: form.analyst_rating || null,
        quality_score: form.quality_score,
        value_score: form.value_score,
        liquidity_score: form.liquidity_score,
        risk_score: form.risk_score,
        transparency_score: form.transparency_score,
        complexity_score: form.complexity_score,
        market_sentiment_score: form.market_sentiment_score,
        age_condition_score: form.age_condition_score,
        geographic_regulatory_score: form.geographic_regulatory_score,
        overall_conviction_score: parseFloat(overallScore),
        investment_thesis: form.investment_thesis || null,
        strengths: form.strengths || null,
        risks: form.risks || null,
        suitable_investor_type: form.suitable_investor_type || null,
        key_watchpoints: form.key_watchpoints || null,
        liquidity_commentary: form.liquidity_commentary || null,
        transparency_commentary: form.transparency_commentary || null,
        risk_commentary: form.risk_commentary || null,
        complexity_commentary: form.complexity_commentary || null,
        market_sentiment_commentary: form.market_sentiment_commentary || null,
        age_condition_commentary: form.age_condition_commentary || null,
        geographic_regulatory_commentary: form.geographic_regulatory_commentary || null,
        property_type: form.category === "real_estate" ? form.property_type : null,
        bedrooms: form.category === "real_estate" && form.bedrooms ? parseInt(form.bedrooms) : null,
        bathrooms: form.category === "real_estate" && form.bathrooms ? parseInt(form.bathrooms) : null,
        square_footage: form.category === "real_estate" && form.square_footage ? parseFloat(form.square_footage) : null,
        year_built: form.category === "real_estate" && form.year_built ? parseInt(form.year_built) : null,
        rental_yield: form.category === "real_estate" && form.rental_yield ? parseFloat(form.rental_yield) : null,
        industry: form.category === "private_business" ? form.industry : null,
        annual_revenue: form.category === "private_business" && form.annual_revenue ? parseFloat(form.annual_revenue) : null,
        employee_count: form.category === "private_business" && form.employee_count ? parseInt(form.employee_count) : null,
        founding_year: form.category === "private_business" && form.founding_year ? parseInt(form.founding_year) : null,
        business_stage: form.category === "private_business" ? form.business_stage : null,
        provenance: form.category === "collectibles_luxury" ? form.provenance : null,
        condition: form.category === "collectibles_luxury" ? form.condition : null,
        authenticity_verified: form.category === "collectibles_luxury" ? form.authenticity_verified : false,
        estimated_appreciation: form.category === "collectibles_luxury" && form.estimated_appreciation ? parseFloat(form.estimated_appreciation) : null,
        status: form.status,
        featured: form.featured,
        last_analyst_review_date: new Date().toISOString(),
        uploaded_by: user?.id || null
      };

      const { data: insertedOpportunity, error } = await supabase
        .from("opportunity_products")
        .insert(opportunityData)
        .select()
        .single();

      if (error) throw error;

      // Create notifications for all users about the new opportunity
      await createOpportunityNotification({
        opportunityId: insertedOpportunity.id,
        title: form.title,
        category: form.category,
        subCategory: form.sub_category,
      });

      toast.success("Opportunity uploaded successfully!");
      setForm(initialForm);
      setThumbnailFile(null);
      setThumbnailPreview("");
    } catch (error: any) {
      console.error("Error uploading opportunity:", error);
      toast.error(error.message || "Failed to upload opportunity");
    } finally {
      setUploading(false);
    }
  };

  const updateForm = (field: keyof OpportunityForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <form onSubmit={handleSubmit} className="space-y-6 pr-4">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="ratings">Product Scoring</TabsTrigger>
            <TabsTrigger value="commentary">Analysis</TabsTrigger>
            <TabsTrigger value="details">Category Details</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Core details about the opportunity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={form.title}
                      onChange={(e) => updateForm("title", e.target.value)}
                      placeholder="e.g., Luxury Penthouse in Mayfair"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={form.category} onValueChange={(v) => updateForm("category", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <config.icon className="h-4 w-4" />
                              {config.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {form.category && (
                  <div className="space-y-2">
                    <Label htmlFor="sub_category">Sub-Category *</Label>
                    <Select value={form.sub_category} onValueChange={(v) => updateForm("sub_category", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sub-category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryConfig[form.category as keyof typeof categoryConfig]?.subCategories.map((sub) => (
                          <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="short_description">Short Description</Label>
                  <Textarea
                    id="short_description"
                    value={form.short_description}
                    onChange={(e) => updateForm("short_description", e.target.value)}
                    placeholder="Brief summary (shown in cards)"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_description">Full Description</Label>
                  <Textarea
                    id="full_description"
                    value={form.full_description}
                    onChange={(e) => updateForm("full_description", e.target.value)}
                    placeholder="Detailed description"
                    rows={4}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      value={form.price}
                      onChange={(e) => updateForm("price", e.target.value)}
                      placeholder="e.g., 500000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={form.price_currency} onValueChange={(v) => updateForm("price_currency", v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={form.location}
                      onChange={(e) => updateForm("location", e.target.value)}
                      placeholder="e.g., London, UK"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thumbnail">Thumbnail Image</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="thumbnail"
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="flex-1"
                    />
                    {thumbnailPreview && (
                      <img 
                        src={thumbnailPreview} 
                        alt="Preview" 
                        className="h-20 w-20 object-cover rounded-lg border"
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Product Scoring Tab */}
          <TabsContent value="ratings" className="space-y-4 mt-4">
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  Product-Specific Scoring
                </CardTitle>
                <CardDescription>
                  Score each dimension based on the product type. These scores help investors assess opportunities across different asset classes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Forward-Looking Analyst Rating</Label>
                  <Select value={form.analyst_rating} onValueChange={(v) => updateForm("analyst_rating", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select overall rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Gold">🥇 Gold - Highest Conviction</SelectItem>
                      <SelectItem value="Silver">🥈 Silver - Strong Conviction</SelectItem>
                      <SelectItem value="Bronze">🥉 Bronze - Moderate Conviction</SelectItem>
                      <SelectItem value="Neutral">⚪ Neutral - Hold / Monitor</SelectItem>
                      <SelectItem value="Negative">🔴 Negative - Avoid / Concerns</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Conviction Scores</span>
                  <Badge variant="secondary" className="text-lg">
                    Overall: {overallScore}/5
                  </Badge>
                </CardTitle>
                <CardDescription>Rate each dimension from 0-5. Each score has its own commentary field.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { key: "liquidity_score", commentaryKey: "liquidity_commentary", label: "Liquidity", description: "Time to sell, market depth, transaction frequency" },
                  { key: "transparency_score", commentaryKey: "transparency_commentary", label: "Transparency", description: "Availability of valuation data, public filings, ownership clarity" },
                  { key: "risk_score", commentaryKey: "risk_commentary", label: "Risk Profile", description: "Volatility of historical value (for art, businesses, property indices)" },
                  { key: "complexity_score", commentaryKey: "complexity_commentary", label: "Complexity", description: "Legal structures, foreign jurisdiction, tax implications" },
                  { key: "market_sentiment_score", commentaryKey: "market_sentiment_commentary", label: "Market Sentiment", description: "Past performance trends, demand scarcity, peer pricing" },
                  { key: "age_condition_score", commentaryKey: "age_condition_commentary", label: "Age / Condition", description: "For art, property, collectibles - physical state & age factors" },
                  { key: "geographic_regulatory_score", commentaryKey: "geographic_regulatory_commentary", label: "Geographic / Regulatory Risk", description: "Especially for overseas assets - jurisdictional & regulatory concerns" },
                  { key: "quality_score", commentaryKey: null, label: "Quality", description: "Overall quality assessment" },
                  { key: "value_score", commentaryKey: null, label: "Value", description: "Value for money proposition" }
                ].map(({ key, commentaryKey, label, description }) => (
                  <div key={key} className="space-y-3 p-4 border rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-semibold">{label}</Label>
                        <p className="text-xs text-muted-foreground">{description}</p>
                      </div>
                      <Badge variant="outline" className="text-lg">{form[key as keyof OpportunityForm]}/5</Badge>
                    </div>
                    <Slider
                      value={[form[key as keyof OpportunityForm] as number]}
                      onValueChange={(v) => updateForm(key as keyof OpportunityForm, v[0])}
                      max={5}
                      min={0}
                      step={0.5}
                      className="w-full"
                    />
                    {commentaryKey && (
                      <div className="pt-2">
                        <Label className="text-sm text-muted-foreground">Commentary</Label>
                        <Textarea
                          value={form[commentaryKey as keyof OpportunityForm] as string}
                          onChange={(e) => updateForm(commentaryKey as keyof OpportunityForm, e.target.value)}
                          placeholder={`Explain ${label.toLowerCase()} assessment...`}
                          rows={2}
                          className="mt-1"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commentary Tab */}
          <TabsContent value="commentary" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Analyst Commentary</CardTitle>
                <CardDescription>Detailed written analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="investment_thesis">Investment Thesis</Label>
                  <Textarea
                    id="investment_thesis"
                    value={form.investment_thesis}
                    onChange={(e) => updateForm("investment_thesis", e.target.value)}
                    placeholder="Core investment case..."
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="strengths">Strengths</Label>
                  <Textarea
                    id="strengths"
                    value={form.strengths}
                    onChange={(e) => updateForm("strengths", e.target.value)}
                    placeholder="Key advantages and positive factors..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="risks">Risks</Label>
                  <Textarea
                    id="risks"
                    value={form.risks}
                    onChange={(e) => updateForm("risks", e.target.value)}
                    placeholder="Potential risks and concerns..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="suitable_investor_type">Suitable Investor Type</Label>
                  <Textarea
                    id="suitable_investor_type"
                    value={form.suitable_investor_type}
                    onChange={(e) => updateForm("suitable_investor_type", e.target.value)}
                    placeholder="Who is this opportunity best suited for..."
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="key_watchpoints">Key Watchpoints</Label>
                  <Textarea
                    id="key_watchpoints"
                    value={form.key_watchpoints}
                    onChange={(e) => updateForm("key_watchpoints", e.target.value)}
                    placeholder="Items to monitor going forward..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Product Details Tab */}
          <TabsContent value="details" className="space-y-4 mt-4">
            {(form.category === "uk_property" || form.category === "overseas_property") && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" /> Property Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Property Type</Label>
                    <Select value={form.property_type} onValueChange={(v) => updateForm("property_type", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="penthouse">Penthouse</SelectItem>
                        <SelectItem value="villa">Villa</SelectItem>
                        <SelectItem value="commercial">Commercial Unit</SelectItem>
                        <SelectItem value="land">Land</SelectItem>
                        <SelectItem value="hmo">HMO</SelectItem>
                        <SelectItem value="parking">Parking Space</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Bedrooms</Label>
                    <Input
                      type="number"
                      value={form.bedrooms}
                      onChange={(e) => updateForm("bedrooms", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bathrooms</Label>
                    <Input
                      type="number"
                      value={form.bathrooms}
                      onChange={(e) => updateForm("bathrooms", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Square Footage</Label>
                    <Input
                      type="number"
                      value={form.square_footage}
                      onChange={(e) => updateForm("square_footage", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Year Built</Label>
                    <Input
                      type="number"
                      value={form.year_built}
                      onChange={(e) => updateForm("year_built", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Rental Yield (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={form.rental_yield}
                      onChange={(e) => updateForm("rental_yield", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {(form.category === "businesses" || form.category === "private_equity") && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" /> Business Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Input
                      value={form.industry}
                      onChange={(e) => updateForm("industry", e.target.value)}
                      placeholder="e.g., Technology, Healthcare"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Business Stage</Label>
                    <Select value={form.business_stage} onValueChange={(v) => updateForm("business_stage", v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pre-seed">Pre-Seed</SelectItem>
                        <SelectItem value="seed">Seed</SelectItem>
                        <SelectItem value="series-a">Series A</SelectItem>
                        <SelectItem value="series-b">Series B+</SelectItem>
                        <SelectItem value="growth">Growth</SelectItem>
                        <SelectItem value="mature">Mature</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Annual Revenue (£)</Label>
                    <Input
                      type="number"
                      value={form.annual_revenue}
                      onChange={(e) => updateForm("annual_revenue", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Employee Count</Label>
                    <Input
                      type="number"
                      value={form.employee_count}
                      onChange={(e) => updateForm("employee_count", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Founding Year</Label>
                    <Input
                      type="number"
                      value={form.founding_year}
                      onChange={(e) => updateForm("founding_year", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {(form.category === "memorabilia" || form.category === "vehicles" || form.category === "commodities") && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gem className="h-5 w-5" /> Asset Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Provenance</Label>
                    <Textarea
                      value={form.provenance}
                      onChange={(e) => updateForm("provenance", e.target.value)}
                      placeholder="History and ownership chain..."
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Condition</Label>
                      <Select value={form.condition} onValueChange={(v) => updateForm("condition", v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mint">Mint</SelectItem>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="restoration-needed">Restoration Needed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Est. Annual Appreciation (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={form.estimated_appreciation}
                        onChange={(e) => updateForm("estimated_appreciation", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="authenticity"
                      checked={form.authenticity_verified}
                      onCheckedChange={(v) => updateForm("authenticity_verified", v)}
                    />
                    <Label htmlFor="authenticity">Authenticity Verified</Label>
                  </div>
                </CardContent>
              </Card>
            )}

            {(form.category === "stocks" || form.category === "crypto" || form.category === "funds") && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gem className="h-5 w-5" /> Financial Asset Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Investment Thesis Details</Label>
                    <Textarea
                      value={form.provenance}
                      onChange={(e) => updateForm("provenance", e.target.value)}
                      placeholder="Why this asset is a good investment opportunity..."
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Est. Annual Return (%)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={form.estimated_appreciation}
                        onChange={(e) => updateForm("estimated_appreciation", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Industry/Sector</Label>
                      <Input
                        value={form.industry}
                        onChange={(e) => updateForm("industry", e.target.value)}
                        placeholder="e.g., Technology, Healthcare, DeFi"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {!form.category && (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Select a category first to see product-specific fields</p>
              </Card>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Publication Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => updateForm("status", v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active (Published)</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="withdrawn">Withdrawn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={form.featured}
                    onCheckedChange={(v) => updateForm("featured", v)}
                  />
                  <Label htmlFor="featured" className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Featured Opportunity
                  </Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => setForm(initialForm)}>
            Reset Form
          </Button>
          <Button type="submit" disabled={uploading}>
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Opportunity
              </>
            )}
          </Button>
        </div>
      </form>
    </ScrollArea>
  );
}
