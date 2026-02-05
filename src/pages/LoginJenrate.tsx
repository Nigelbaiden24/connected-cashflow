 import { useState } from "react";
 import { useNavigate } from "react-router-dom";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import { FileText, Eye, EyeOff, Sparkles, Palette, FileCheck } from "lucide-react";
 import { useToast } from "@/hooks/use-toast";
 import { supabase } from "@/integrations/supabase/client";
 import flowpulseLogo from "@/assets/flowpulse-logo.png";
 
 interface LoginJenrateProps {
   onLogin: (email: string) => void;
 }
 
 const LoginJenrate = ({ onLogin }: LoginJenrateProps) => {
   const navigate = useNavigate();
   const [email, setEmail] = useState("");
   const [password, setPassword] = useState("");
   const [showPassword, setShowPassword] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
   const { toast } = useToast();
 
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
         navigate("/jenrate");
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
 
   return (
     <div className="min-h-screen grid lg:grid-cols-2">
       {/* Left Side - Branding with Purple/Violet Theme */}
       <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 text-white relative overflow-hidden">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)] opacity-50" />
         <div className="absolute -top-40 -right-40 w-96 h-96 bg-fuchsia-400/30 blur-3xl rounded-full" />
         <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-400/20 blur-3xl rounded-full" />
         
         <div className="relative z-10">
           <img 
             src={flowpulseLogo} 
             alt="Jenrate" 
             className="h-16 mb-8 cursor-pointer hover:scale-105 transition-transform" 
             onClick={() => window.location.href = '/'}
           />
           <h1 className="text-5xl font-bold mb-4">Jenrate</h1>
           <p className="text-xl text-violet-100 mb-8">
             AI-powered document generation for modern businesses
           </p>
         </div>
         
         <div className="relative z-10 space-y-6">
           <div className="flex items-start gap-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
             <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
               <Sparkles className="h-6 w-6" />
             </div>
             <div>
               <h3 className="font-semibold mb-1">AI-Powered Generation</h3>
               <p className="text-sm text-violet-100">Create professional documents with intelligent AI assistance</p>
             </div>
           </div>
           
           <div className="flex items-start gap-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
             <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
               <Palette className="h-6 w-6" />
             </div>
             <div>
               <h3 className="font-semibold mb-1">Custom Templates</h3>
               <p className="text-sm text-violet-100">Choose from a library of professional, customizable templates</p>
             </div>
           </div>
           
           <div className="flex items-start gap-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
             <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
               <FileCheck className="h-6 w-6" />
             </div>
             <div>
               <h3 className="font-semibold mb-1">Export & Share</h3>
               <p className="text-sm text-violet-100">Download as PDF or share directly with clients</p>
             </div>
           </div>
         </div>
         
         <div className="relative z-10 text-sm text-violet-100">
           © 2024 Jenrate by FlowPulse. All rights reserved.
         </div>
       </div>
 
       {/* Right Side - Login Form */}
       <div className="flex items-center justify-center p-8 bg-background">
         <div className="w-full max-w-md space-y-8">
           <div className="lg:hidden text-center mb-8">
             <img 
               src={flowpulseLogo} 
               alt="Jenrate" 
               className="h-10 mx-auto mb-4 cursor-pointer" 
               onClick={() => window.location.href = '/'}
             />
           </div>
           
           <div>
             <div className="flex items-center gap-2 mb-2">
               <FileText className="h-6 w-6 text-violet-600" />
               <span className="text-sm font-medium text-violet-600">Document Generator</span>
             </div>
             <h2 className="text-3xl font-bold tracking-tight">Sign in to Jenrate</h2>
             <p className="text-muted-foreground mt-2">
               Access your AI document generation platform
             </p>
           </div>
 
           <form onSubmit={handleSubmit} className="space-y-6">
             <div className="space-y-2">
               <Label htmlFor="email" className="text-sm font-medium">
                 Email Address
               </Label>
               <Input
                 id="email"
                 type="email"
                 placeholder="you@company.com"
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 required
               />
             </div>
             
             <div className="space-y-2">
               <Label htmlFor="password" className="text-sm font-medium">
                 Password
               </Label>
               <div className="relative">
                 <Input
                   id="password"
                   type={showPassword ? "text" : "password"}
                   placeholder="Enter your password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="pr-10"
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
               className="w-full h-11 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700"
               disabled={isLoading}
             >
               {isLoading ? "Signing in..." : "Sign in to Jenrate"}
             </Button>
           </form>
         </div>
       </div>
     </div>
   );
 };
 
 export default LoginJenrate;