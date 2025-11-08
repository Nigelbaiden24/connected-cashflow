import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        // Wait a bit for webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Fetch user's subscription
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast({
            title: "Error",
            description: "Please log in to view your subscription",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }

        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error('Error fetching subscription:', error);
        } else {
          setSubscription(data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [sessionId, navigate, toast]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Processing your subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-3xl">Payment Successful!</CardTitle>
          <CardDescription className="text-base mt-2">
            Thank you for subscribing to FlowPulse. Your payment has been processed successfully.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {subscription ? (
            <>
              <div className="border-t border-b py-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan:</span>
                  <span className="font-semibold">{subscription.plan_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Platform:</span>
                  <span className="font-semibold capitalize">{subscription.platform}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    {subscription.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Billing Period:</span>
                  <span className="font-semibold">
                    {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
                  </span>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold">What's Next?</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>You now have full access to all {subscription.plan_name} features</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>A confirmation email has been sent to your inbox</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>You can manage your subscription anytime from your dashboard</span>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">
                Your subscription is being processed. Please check your dashboard in a few moments.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => navigate("/pricing")}
          >
            View Pricing
          </Button>
          <Button 
            className="flex-1 gap-2"
            onClick={() => navigate(subscription?.platform === 'business' ? "/business-dashboard" : "/dashboard")}
          >
            Go to Dashboard
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentSuccess;