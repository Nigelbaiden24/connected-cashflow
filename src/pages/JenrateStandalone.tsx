 import { useState } from "react";
 import { Button } from "@/components/ui/button";
 import { FileText, LogOut } from "lucide-react";
 import { supabase } from "@/integrations/supabase/client";
 import { useNavigate } from "react-router-dom";
 import { AdminDocumentGenerator } from "@/components/admin/AdminDocumentGenerator";
 import flowpulseLogo from "@/assets/flowpulse-logo.png";
 
 interface JenrateStandaloneProps {
   userEmail: string;
   onLogout: () => void;
 }
 
 const JenrateStandalone = ({ userEmail, onLogout }: JenrateStandaloneProps) => {
   const navigate = useNavigate();
 
   const handleLogout = async () => {
     await supabase.auth.signOut();
     onLogout();
     navigate("/");
   };
 
   return (
     <div className="min-h-screen bg-background">
       {/* Header */}
       <header className="sticky top-0 z-50 border-b bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white">
         <div className="container mx-auto px-6 py-4 flex items-center justify-between">
           <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
             <img src={flowpulseLogo} alt="Jenrate" className="h-10" />
             <div>
               <span className="font-bold text-xl">Jenrate</span>
               <p className="text-xs text-violet-100">{userEmail}</p>
             </div>
           </div>
           <Button
             variant="outline"
             size="sm"
             onClick={handleLogout}
             className="gap-2 bg-white/10 border-white/30 hover:bg-white/20 text-white"
           >
             <LogOut className="h-4 w-4" />
             Sign Out
           </Button>
         </div>
       </header>
 
       <div className="flex-1 p-6 space-y-6 animate-in fade-in duration-500">
         {/* Enhanced Header */}
         <div className="flex items-center justify-between">
           <div className="space-y-1">
             <div className="flex items-center gap-2">
               <FileText className="h-8 w-8 text-violet-600" />
               <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                 Jenrate
               </h1>
             </div>
             <p className="text-muted-foreground text-sm">
               AI-Powered Document Generator
             </p>
           </div>
         </div>
 
         {/* Document Generator */}
         <AdminDocumentGenerator />
       </div>
     </div>
   );
 };
 
 export default JenrateStandalone;