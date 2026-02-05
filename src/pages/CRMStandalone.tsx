 import { useState, useEffect } from "react";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Users, TrendingUp, DollarSign, ArrowLeft, Upload, LayoutGrid, LogOut } from "lucide-react";
 import { supabase } from "@/integrations/supabase/client";
 import { CRMBoard } from "@/components/CRMBoard";
 import { useNavigate } from "react-router-dom";
 import { BulkImportDialog } from "@/components/crm/BulkImportDialog";
 import { TranslatedText } from "@/components/TranslatedText";
 import flowpulseLogo from "@/assets/flowpulse-logo.png";
 
 interface CRMStandaloneProps {
   userEmail: string;
   onLogout: () => void;
 }
 
 const CRMStandalone = ({ userEmail, onLogout }: CRMStandaloneProps) => {
   const navigate = useNavigate();
   const [totalContacts, setTotalContacts] = useState(0);
   const [activeContacts, setActiveContacts] = useState(0);
   const [importDialogOpen, setImportDialogOpen] = useState(false);
   const [refreshTrigger, setRefreshTrigger] = useState(0);
 
   useEffect(() => {
     fetchStats();
   }, []);
 
   const fetchStats = async () => {
     try {
       const { data: allContacts, error: allError } = await supabase
         .from("crm_contacts")
         .select("id, status");
 
       if (allError) throw allError;
 
       setTotalContacts(allContacts?.length || 0);
       setActiveContacts(
         allContacts?.filter((c) => c.status === "active").length || 0
       );
     } catch (error) {
       console.error("Error fetching stats:", error);
     }
   };
 
   const handleLogout = async () => {
     await supabase.auth.signOut();
     onLogout();
     navigate("/");
   };
 
   return (
     <div className="min-h-screen bg-background">
       {/* Header */}
       <header className="sticky top-0 z-50 border-b bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
         <div className="container mx-auto px-6 py-4 flex items-center justify-between">
           <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
             <img src={flowpulseLogo} alt="FlowPulse CRM" className="h-10" />
             <div>
               <span className="font-bold text-xl">FlowPulse CRM</span>
               <p className="text-xs text-blue-100">{userEmail}</p>
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
               <LayoutGrid className="h-8 w-8 text-blue-600" />
               <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                 <TranslatedText>CRM Dashboard</TranslatedText>
               </h1>
             </div>
             <p className="text-muted-foreground text-sm">
               <TranslatedText>Customer Relationship Management</TranslatedText>
             </p>
           </div>
           <Button 
             onClick={() => setImportDialogOpen(true)}
             className="shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
           >
             <Upload className="h-4 w-4 mr-2" />
             <TranslatedText>Bulk Import</TranslatedText>
           </Button>
         </div>
 
         {/* Enhanced Stats Cards */}
         <div className="grid gap-4 md:grid-cols-3">
           <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium text-muted-foreground">
                 <TranslatedText>Total Contacts</TranslatedText>
               </CardTitle>
               <div className="p-2 rounded-lg bg-blue-500/10">
                 <Users className="h-4 w-4 text-blue-600" />
               </div>
             </CardHeader>
             <CardContent className="space-y-1">
               <div className="text-3xl font-bold tracking-tight">{totalContacts}</div>
               <p className="text-xs text-muted-foreground flex items-center gap-1">
                 <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                 {activeContacts} <TranslatedText>active relationships</TranslatedText>
               </p>
             </CardContent>
           </Card>
 
           <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium text-muted-foreground">
                 <TranslatedText>Conversion Rate</TranslatedText>
               </CardTitle>
               <div className="p-2 rounded-lg bg-chart-1/10">
                 <TrendingUp className="h-4 w-4 text-chart-1" />
               </div>
             </CardHeader>
             <CardContent className="space-y-1">
               <div className="text-3xl font-bold tracking-tight">24.5%</div>
               <p className="text-xs text-muted-foreground">
                 <TranslatedText>From leads to clients</TranslatedText>
               </p>
             </CardContent>
           </Card>
 
           <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
               <CardTitle className="text-sm font-medium text-muted-foreground">
                 <TranslatedText>Pipeline Value</TranslatedText>
               </CardTitle>
               <div className="p-2 rounded-lg bg-chart-2/10">
                 <DollarSign className="h-4 w-4 text-chart-2" />
               </div>
             </CardHeader>
             <CardContent className="space-y-1">
               <div className="text-3xl font-bold tracking-tight">£125K</div>
               <p className="text-xs text-muted-foreground">
                 <TranslatedText>Potential revenue</TranslatedText>
               </p>
             </CardContent>
           </Card>
         </div>
 
         <CRMBoard key={refreshTrigger} />
 
         <BulkImportDialog
           open={importDialogOpen}
           onOpenChange={setImportDialogOpen}
           onImportComplete={() => {
             fetchStats();
             setRefreshTrigger(prev => prev + 1);
           }}
         />
       </div>
     </div>
   );
 };
 
 export default CRMStandalone;