import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Mail, Upload, Search, Calendar, Eye } from "lucide-react";
import { toast } from "sonner";

const Newsletters = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [newsletters] = useState([
    {
      id: "1",
      title: "Weekly Market Digest",
      edition: "January 12, 2025",
      preview: "This week's top market movers, analyst insights, and what to watch next week...",
      category: "Weekly",
      subscribers: 15234
    },
    {
      id: "2",
      title: "Crypto Insights Monthly",
      edition: "January 2025",
      preview: "Deep dive into cryptocurrency trends, DeFi developments, and institutional adoption...",
      category: "Monthly",
      subscribers: 8921
    },
    {
      id: "3",
      title: "Property Investment Quarterly",
      edition: "Q1 2025",
      preview: "Global real estate market analysis, emerging opportunities, and regulatory updates...",
      category: "Quarterly",
      subscribers: 6543
    },
  ]);

  const handleUpload = () => {
    toast.success("Newsletter upload ready");
  };

  const handleSubscribe = () => {
    toast.success("Subscription preferences updated");
  };

  return (
    <div className="p-6 space-y-6 investor-theme">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Newsletters</h1>
          <p className="text-muted-foreground mt-2">
            Stay informed with curated market insights and investment opportunities
          </p>
        </div>
        <Button onClick={handleUpload} variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Upload Newsletter
        </Button>
      </div>

      {/* Subscribe Section */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Subscribe to Our Newsletters
          </CardTitle>
          <CardDescription>
            Get the latest market insights delivered to your inbox
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input placeholder="Enter your email" type="email" />
            <Button onClick={handleSubscribe} className="bg-primary hover:bg-primary/90">
              Subscribe
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search newsletters..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Newsletter Archive */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Newsletter Archive</h2>
        {newsletters.map((newsletter) => (
          <Card key={newsletter.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <Mail className="h-8 w-8 text-primary" />
                <Badge variant="secondary">{newsletter.category}</Badge>
              </div>
              <CardTitle className="mt-4">{newsletter.title}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {newsletter.edition}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{newsletter.preview}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {newsletter.subscribers.toLocaleString()} subscribers
                </span>
                <div className="flex gap-2">
                  <Button variant="outline">Preview</Button>
                  <Button className="bg-primary hover:bg-primary/90">
                    Read Full Edition
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Newsletters;
