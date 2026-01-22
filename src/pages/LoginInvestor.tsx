import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Eye, EyeOff, Globe, Coins, Building, User, Phone, Mail, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import flowpulseLogo from "@/assets/flowpulse-logo.png";

interface LoginInvestorProps {
  onLogin: (email: string) => void;
}

const LoginInvestor = ({ onLogin }: LoginInvestorProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Enquiry form state
  const [enquiryName, setEnquiryName] = useState("");
  const [enquiryEmail, setEnquiryEmail] = useState("");
  const [enquiryPhone, setEnquiryPhone] = useState("");
  const [enquiryCompany, setEnquiryCompany] = useState("");
  const [enquiryMessage, setEnquiryMessage] = useState("");
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        toast({
          title: "Login Successful",
          description: `Welcome back! Logged in as ${email}`,
        });
        onLogin(email);
        navigate("/investor/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingEnquiry(true);

    try {
      const { error } = await supabase.from("contact_submissions").insert({
        name: enquiryName,
        email: enquiryEmail,
        phone: enquiryPhone || null,
        company: enquiryCompany || null,
        message: enquiryMessage,
        source_page: "investor-login",
      });

      if (error) throw error;

      toast({
        title: "Enquiry Submitted",
        description: "Thank you! A member of our team will be in touch shortly.",
      });

      // Reset form
      setEnquiryName("");
      setEnquiryEmail("");
      setEnquiryPhone("");
      setEnquiryCompany("");
      setEnquiryMessage("");
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit enquiry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingEnquiry(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Side - Branding with Purple Theme */}
      <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 p-12 flex flex-col justify-between text-white">
        <div>
          <div className="flex items-center gap-3 mb-8 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate("/")}>
            <img src={flowpulseLogo} alt="FlowPulse Logo" className="h-10 w-10" />
            <span className="text-2xl font-bold">FlowPulse Investor</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Your Global Investment Portal
          </h1>
          <p className="text-xl text-purple-100 mb-8">
            Access exclusive research, market intelligence, and investment opportunities worldwide
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="bg-purple-500/30 p-3 rounded-lg">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">International Markets</h3>
              <p className="text-purple-100">Global stocks, property, and private equity opportunities</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-purple-500/30 p-3 rounded-lg">
              <Coins className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Digital Assets</h3>
              <p className="text-purple-100">Cryptocurrency analysis and investment insights</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-purple-500/30 p-3 rounded-lg">
              <Building className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Alternative Investments</h3>
              <p className="text-purple-100">Private equity and businesses for sale</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login/Enquiry Forms */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-6">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="enquiry">Make an Enquiry</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-6 mt-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight">Welcome Back</h2>
                <p className="text-muted-foreground mt-2">Sign in to access your investment portal</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="investor@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="enquiry" className="space-y-6 mt-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight">Request Access</h2>
                <p className="text-muted-foreground mt-2">
                  Interested in joining? Submit your details and we'll be in touch.
                </p>
              </div>

              <form onSubmit={handleEnquirySubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="enquiry-name">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="enquiry-name"
                      type="text"
                      placeholder="John Smith"
                      value={enquiryName}
                      onChange={(e) => setEnquiryName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="enquiry-email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="enquiry-email"
                      type="email"
                      placeholder="john@company.com"
                      value={enquiryEmail}
                      onChange={(e) => setEnquiryEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="enquiry-phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="enquiry-phone"
                        type="tel"
                        placeholder="+44 7123..."
                        value={enquiryPhone}
                        onChange={(e) => setEnquiryPhone(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="enquiry-company">Company</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="enquiry-company"
                        type="text"
                        placeholder="Company Ltd"
                        value={enquiryCompany}
                        onChange={(e) => setEnquiryCompany(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="enquiry-message">Message *</Label>
                  <Textarea
                    id="enquiry-message"
                    placeholder="Tell us about your investment interests and goals..."
                    value={enquiryMessage}
                    onChange={(e) => setEnquiryMessage(e.target.value)}
                    className="min-h-[100px]"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  disabled={isSubmittingEnquiry}
                >
                  {isSubmittingEnquiry ? (
                    "Submitting..."
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Enquiry
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default LoginInvestor;
