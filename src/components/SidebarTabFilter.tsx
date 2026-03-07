import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Settings2 } from "lucide-react";

interface SidebarTabFilterProps {
  platform: "finance" | "investor";
  navGroups: { label: string; items: { title: string; url: string }[] }[];
  onFilterChange: (hiddenUrls: string[]) => void;
}

const STORAGE_KEY_PREFIX = "sidebar_hidden_tabs_";

export function SidebarTabFilter({ platform, navGroups, onFilterChange }: SidebarTabFilterProps) {
  const storageKey = STORAGE_KEY_PREFIX + platform;
  const [hiddenUrls, setHiddenUrls] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(hiddenUrls));
    onFilterChange(hiddenUrls);
  }, [hiddenUrls, storageKey, onFilterChange]);

  const toggleUrl = (url: string) => {
    setHiddenUrls(prev => prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]);
  };

  const showAll = () => setHiddenUrls([]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800/60">
          <Settings2 className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 bg-slate-900 border-slate-700 text-white">
        <SheetHeader>
          <SheetTitle className="text-white">Customise Sidebar</SheetTitle>
        </SheetHeader>
        <div className="flex items-center justify-between mt-4 mb-2">
          <span className="text-xs text-slate-400">Toggle tabs on or off</span>
          <Button variant="ghost" size="sm" onClick={showAll} className="text-xs text-primary hover:text-primary/80 h-7">
            Show All
          </Button>
        </div>
        <ScrollArea className="h-[calc(100vh-140px)]">
          <div className="space-y-5 pr-2">
            {navGroups.map(group => (
              <div key={group.label}>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-2">{group.label}</p>
                <div className="space-y-1">
                  {group.items.map(item => (
                    <div key={item.url} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-800/60 transition-colors">
                      <span className="text-sm text-slate-300">{item.title}</span>
                      <Switch
                        checked={!hiddenUrls.includes(item.url)}
                        onCheckedChange={() => toggleUrl(item.url)}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
