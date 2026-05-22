import { useEffect, useMemo, useState } from "react";
import DOMPurify from "dompurify";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, Eye, CheckCircle2, Trash2, RefreshCw, Clock, Play, Plus, Bot, ChevronDown, Zap } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import flowpulseLogo from "@/assets/flowpulse-logo.png";

type AssetType = "stock" | "crypto";

interface GeneratedReport {
  id: string;
  asset_type: AssetType;
  title: string;
  slug: string;
  ticker: string | null;
  excerpt: string | null;
  hero_image_url: string | null;
  html_content: string;
  pages: Array<{ title: string; html: string }> | null;
  page_count: number | null;
  report_date: string | null;
  ai_score: number | null;
  ai_tags: string[] | null;
  status: "draft" | "promoted" | "archived";
  sources: Array<{ url: string; title?: string | null }> | null;
  reading_time_minutes: number | null;
  created_at: string;
  promoted_at: string | null;
}

interface Schedule {
  id: string;
  asset_type: AssetType;
  topic: string;
  ticker: string | null;
  extra_urls: string[];
  frequency_hours: number;
  enabled: boolean;
  last_run_at: string | null;
  last_run_status: string | null;
  last_run_error: string | null;
  next_run_at: string;
}

interface Props {
  assetType: AssetType;
  title: string;
  description: string;
  iconGradient: string;
  Icon: React.ElementType;
}

const FREQ_OPTIONS = [
  { v: 1, l: "Every hour" },
  { v: 3, l: "Every 3 hours" },
  { v: 6, l: "Every 6 hours" },
  { v: 12, l: "Every 12 hours" },
  { v: 24, l: "Daily" },
  { v: 72, l: "Every 3 days" },
  { v: 168, l: "Weekly" },
];

// Curated, verified Unsplash photo IDs used as deterministic fallbacks when
// the AI returns a broken hero_image_url. Mirrors the server-side list.
const STOCK_HEROES = [
  "photo-1611974789855-9c2a0a7236a3",
  "photo-1590283603385-17ffb3a7f29f",
  "photo-1554260570-9140fd3b7614",
  "photo-1559526324-4b87b5e36e44",
  "photo-1604594849809-dfedbc827105",
  "photo-1611324586060-04bcc4eee1b9",
  "photo-1642784353700-3aef5f8b9396",
  "photo-1591696205602-2f950c417cb9",
  "photo-1607968565043-36af90dde238",
];
const CRYPTO_HEROES = [
  "photo-1518546305927-5a555bb7020d",
  "photo-1639762681485-074b7f938ba0",
  "photo-1640340434855-6084b1f4901c",
  "photo-1621932953986-15fcfb2d6669",
  "photo-1620321023374-d1a68fb