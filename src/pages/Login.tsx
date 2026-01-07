import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Eye, EyeOff, Lock, Mail, CheckCircle2, User, Phone, Building, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import flowpulseLogo from "@/assets/flowpulse-logo.png";

interface LoginProps {
  onLogin: (email: string) => void;
}

const Login = ({ onLogin }: LoginProps) => {
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
        navigate("/dashboard");
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
        source_page: "finance-login",
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
    <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-2">
      {/* Left Side - Branding (visible on both mobile and desktop) */}
      <div className="flex flex-col justify-between p-8 lg:p-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white lg:min-h-screen">
        <div>
          <img 
            src={flowpulseLogo} 
            alt="FlowPulse Finance" 
            className="h-12 mb-8 cursor-pointer hover:scale-105 transition-transform" 
            onClick={() => window.location.href = '/'}
          />
          <h1 className="text-4xl font-bold mb-4">Welcome to FlowPulse Finance</h1>
          <p className="text-xl text-blue-100 mb-8">
            Your intelligent financial advisory platform for wealth management excellence
          </p>
        </div>
        
        <div className="hidden lg:block space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Advanced Portfolio Management</h3>
              <p className="text-sm text-blue-100">Track and optimize client investments with real-time analytics</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Bank-Level Security</h3>
              <p className="text-sm text-blue-100">SOC 2 Compliant & FINRA Approved infrastructure</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Compliance Ready</h3>
              <p className="text-sm text-blue-100">Built-in regulatory compliance and reporting tools</p>
            </div>
          </div>
        </div>
        
        <div className="hidden lg:block text-sm text-blue-100">
          © 2024 FlowPulse Finance. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login/Enquiry Forms */}
      <div className="flex items-center justify-center p-8 bg-background flex-1">
        <div className="w-full max-w-md space-y-6">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="enquiry">Make an Enquiry</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-6 mt-6">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Sign in to your account</h2>
                <p className="text-muted-foreground mt-2">
                  Access your financial advisory dashboard
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="advisor@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <button type="button" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-base"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="enquiry" className="space-y-6 mt-6">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Request Access</h2>
                <p className="text-muted-foreground mt-2">
                  Interested in FlowPulse Finance? Submit your details and our team will contact you.
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
                    placeholder="Tell us about your requirements and how we can help..."
                    value={enquiryMessage}
                    onChange={(e) => setEnquiryMessage(e.target.value)}
                    className="min-h-[100px]"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-base"
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

export default Login;