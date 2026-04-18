import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ContactForm } from "@/components/ContactForm";
import { ENTERPRISE_CATEGORIES } from "@/components/home/EnterpriseDataStrip";
import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import flowpulseLogo from "@/assets/flowpulse-logo.png";

interface Explainer {
  headline: string;
  intro: string;
  sections: { title: string; body: string }[];
  capabilities: string[];
  dataPoints: { label: string; value: string }[];
  useCases: { title: string; description: string }[];
}

export default function EnterpriseDataCategory() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const category = ENTERPRISE_CATEGORIES.find((c) => c.slug === slug);
  const [explainer, setExplainer] = useState<Explainer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!category) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.functions.invoke(
          "enterprise-category-explainer",
          { body: { category: category.label } },
        );
        if (cancelled) return;
        if (error) throw error;
        if (data?.explainer) setExplainer(data.explainer);
        else throw new Error(data?.error || "No explainer returned");
      } catch (e: any) {
        if (!cancelled) setError(e.message || "Failed to generate explainer");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [category]);

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6 text-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Category not found</h1>
          <Button onClick={() => navigate("/")}>Back to home</Button>
        </div>
      </div>
    );
  }

  const Icon = category.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-background">
      {/* Top nav */}
      <header className="border-b border-white/5 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={flowpulseLogo} alt="FlowPulse" className="h-8 w-8" />
            <span className="font-bold text-white">FlowPulse</span>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to home
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-cyan-500/10" />
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="relative container mx-auto px-6 max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-400/30 rounded-full mb-6">
            <Sparkles className="h-3.5 w-3.5 text-blue-300" />
            <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
              Enterprise Data
            </span>
          </div>
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/30 mb-6">
            <Icon className="h-8 w-8 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            {category.label}
          </h1>
          {loading ? (
            <Skeleton className="h-6 w-2/3 mx-auto mt-4 bg-white/10" />
          ) : (
            <p className="text-xl md:text-2xl text-blue-100/80 max-w-3xl mx-auto">
              {explainer?.headline}
            </p>
          )}
        </div>
      </section>

      {/* Body */}
      <section className="container mx-auto px-6 max-w-6xl pb-16 md:pb-24">
        {loading && (
          <div className="space-y-6">
            <Skeleton className="h-32 w-full bg-white/5" />
            <div className="grid md:grid-cols-2 gap-6">
              <Skeleton className="h-48 w-full bg-white/5" />
              <Skeleton className="h-48 w-full bg-white/5" />
            </div>
          </div>
        )}

        {error && !loading && (
          <Card className="bg-red-500/10 border-red-500/30">
            <CardContent className="p-6 text-center text-red-200">
              <p className="font-semibold mb-2">Couldn't load AI explainer</p>
              <p className="text-sm opacity-80">{error}</p>
            </CardContent>
          </Card>
        )}

        {explainer && (
          <div className="space-y-12">
            {/* Intro */}
            <Card className="bg-white/[0.03] border-white/10 backdrop-blur-sm">
              <CardContent className="p-6 md:p-8">
                <p className="text-lg md:text-xl leading-relaxed text-slate-200">
                  {explainer.intro}
                </p>
              </CardContent>
            </Card>

            {/* Data points */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {explainer.dataPoints.map((dp, i) => (
                <Card
                  key={i}
                  className="bg-gradient-to-b from-blue-950/30 to-slate-900/50 border-blue-500/20"
                >
                  <CardContent className="p-5 text-center">
                    <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                      {dp.value}
                    </div>
                    <div className="text-xs uppercase tracking-wider text-slate-400 mt-1">
                      {dp.label}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Sections */}
            <div className="grid md:grid-cols-2 gap-6">
              {explainer.sections.map((sec, i) => (
                <Card
                  key={i}
                  className="bg-white/[0.03] border-white/10 hover:border-blue-400/30 transition-colors"
                >
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-white mb-3">
                      {sec.title}
                    </h3>
                    <p className="text-slate-300 leading-relaxed">{sec.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Capabilities */}
            <Card className="bg-gradient-to-br from-slate-900/80 to-blue-950/30 border-white/10">
              <CardContent className="p-6 md:p-8">
                <h3 className="text-2xl font-bold text-white mb-6">
                  Core capabilities
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {explainer.capabilities.map((cap, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5"
                    >
                      <CheckCircle2 className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-200">{cap}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Use cases */}
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">
                Built for these workflows
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {explainer.useCases.map((uc, i) => (
                  <Card
                    key={i}
                    className="bg-white/[0.03] border-white/10 hover:border-cyan-400/30 transition-colors"
                  >
                    <CardContent className="p-6">
                      <h4 className="font-bold text-white mb-2">{uc.title}</h4>
                      <p className="text-sm text-slate-300">{uc.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Contact form */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Talk to our enterprise team
            </h2>
            <p className="text-muted-foreground text-lg">
              Tell us about your {category.label.toLowerCase()} requirements — a
              FlowPulse specialist will be in touch within 24 hours.
            </p>
          </div>
          <ContactForm sourcePage={`enterprise-data:${slug}`} />
        </div>
      </section>
    </div>
  );
}
