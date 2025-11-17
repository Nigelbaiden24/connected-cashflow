import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Building2, MapPin, CheckCircle } from "lucide-react";
import { z } from "zod";
import flowpulseLogo from "@/assets/flowpulse-logo.png";

interface OpportunityDetails {
  id: string;
  ref_number: string;
  title: string;
  short_description: string;
  industry: string;
  location: string;
  business_description: string | null;
  industry_overview: string | null;
  business_highlights: string[] | null;
  financial_summary: string | null;
  team_overview: string | null;
  image_url: string | null;
}

const inquirySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  phone: z.string().trim().max(50).optional(),
  company: z.string().trim().max(200).optional(),
  message: z.string().trim().min(1, "Message is required").max(1000),
});

export default function OpportunityDetail() {
  const { refNumber } = useParams<{ refNumber: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [opportunity, setOpportunity] = useState<OpportunityDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });

  useEffect(() => {
    if (refNumber) {
      fetchOpportunity();
    }
  }, [refNumber]);

  const fetchOpportunity = async () => {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('ref_number', refNumber)
        .eq('status', 'active')
        .single();

      if (error) throw error;
      setOpportunity(data);
    } catch (error) {
      toast({
        title: "Opportunity not found",
        description: "This opportunity may no longer be available.",
        variant: "destructive",
      });
      navigate('/opportunities');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = inquirySchema.parse(formData);
      setSubmitting(true);

      const { error } = await supabase
        .from('opportunity_inquiries')
        .insert([{
          opportunity_id: opportunity?.id,
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone || null,
          company: validatedData.company || null,
          message: validatedData.message,
        }]);

      if (error) throw error;

      toast({
        title: "Inquiry Submitted",
        description: "Our team will contact you within 24 hours to discuss this opportunity.",
      });
      
      setFormData({ name: "", email: "", phone: "", company: "", message: "" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0]?.message || "Please check your input.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to submit inquiry. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!opportunity) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <img src={flowpulseLogo} alt="FlowPulse" className="h-8 w-8" />
              <span className="text-xl font-bold">FlowPulse Investor</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/opportunities")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Opportunities
              </Button>
              <Button onClick={() => navigate("/login-investor")}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {opportunity.image_url && (
              <div className="rounded-lg overflow-hidden">
                <img 
                  src={opportunity.image_url} 
                  alt={opportunity.title}
                  className="w-full h-64 object-cover"
                />
              </div>
            )}

            <div>
              <h1 className="text-4xl font-bold text-primary mb-2">
                {opportunity.title}
              </h1>
              <p className="text-muted-foreground mb-4">
                Ref: {opportunity.ref_number}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  <span className="font-medium">Industry Overview:</span>
                  <span>{opportunity.industry}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium">Location:</span>
                  <span>{opportunity.location}</span>
                </div>
              </div>
            </div>

            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold text-primary mb-4">Business Details</h2>
                <div className="space-y-6">
                  {opportunity.business_description && (
                    <div>
                      <p className="text-foreground leading-relaxed">
                        {opportunity.business_description}
                      </p>
                    </div>
                  )}

                  {opportunity.industry_overview && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Industry Overview:</h3>
                      <p className="text-muted-foreground">{opportunity.industry_overview}</p>
                    </div>
                  )}

                  {opportunity.business_highlights && opportunity.business_highlights.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Business Description:</h3>
                      <ul className="space-y-2">
                        {opportunity.business_highlights.map((highlight, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {opportunity.financial_summary && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Financial Summary:</h3>
                      <p className="text-muted-foreground">{opportunity.financial_summary}</p>
                    </div>
                  )}

                  {opportunity.team_overview && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Team Overview:</h3>
                      <p className="text-muted-foreground">{opportunity.team_overview}</p>
                    </div>
                  )}

                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      To find out more get in touch with our team quoting reference number:{" "}
                      <span className="font-bold text-foreground">{opportunity.ref_number}</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-4">Express Your Interest</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={4}
                      placeholder="Tell us about your interest in this opportunity..."
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Inquiry"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
