import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Crosshair, Building2 } from "lucide-react";
import { DMFinderPanel } from "./DMFinderPanel";
import { CompanyFinderPanel } from "./CompanyFinderPanel";

export function FinderHub() {
  return (
    <Tabs defaultValue="dm" className="w-full">
      <TabsList className="bg-slate-900/60 border border-white/5 backdrop-blur-xl">
        <TabsTrigger
          value="dm"
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500/30 data-[state=active]:to-fuchsia-500/30 data-[state=active]:text-violet-100 text-slate-300 gap-2"
        >
          <Crosshair className="h-4 w-4" /> DM Finder
        </TabsTrigger>
        <TabsTrigger
          value="company"
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/30 data-[state=active]:to-violet-500/30 data-[state=active]:text-cyan-100 text-slate-300 gap-2"
        >
          <Building2 className="h-4 w-4" /> Company Finder
        </TabsTrigger>
      </TabsList>
      <TabsContent value="dm" className="mt-4">
        <DMFinderPanel />
      </TabsContent>
      <TabsContent value="company" className="mt-4">
        <CompanyFinderPanel />
      </TabsContent>
    </Tabs>
  );
}
