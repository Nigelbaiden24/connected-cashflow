import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FinanceLayout } from "@/components/FinanceLayout";
import { FinancialNewsFeed } from "@/components/news/FinancialNewsFeed";
import { supabase } from "@/integrations/supabase/client";

const News = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <FinanceLayout userEmail={userEmail} onLogout={handleLogout}>
      <div className="p-6">
        <FinancialNewsFeed />
      </div>
    </FinanceLayout>
  );
};

export default News;
