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
  { v: 6, l: "Every 6 hours