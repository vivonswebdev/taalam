import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DEMO_EMAIL = "demo@taalam.eu";
const DEMO_PASSWORD = "TaalamDemo2026!";

export default function DemoLoginBanner() {
  const [searchParams] = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("demo") === "true") {
      localStorage.setItem("show_demo_banner", "true");
    }
    setVisible(localStorage.getItem("show_demo_banner") === "true");
  }, [searchParams]);

  if (!visible) return null;

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      });
      if (error) throw error;
      localStorage.setItem("taalam_remember_me", "true");
      toast.success("Bienvenue, compte demo activé !");
    } catch (err: any) {
      toast.error("Compte demo non disponible");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDemoLogin}
      disabled={loading}
      className="w-full py-2.5 px-4 text-xs font-medium rounded-xl border border-[hsl(38,40%,70%)] bg-[hsl(38,40%,82%)] text-[hsl(38,30%,25%)] hover:bg-[hsl(38,40%,76%)] transition-colors text-center disabled:opacity-50"
    >
      {loading ? "Connexion..." : "🍎 Apple Review ? Appuyez ici pour accès demo"}
    </button>
  );
}
