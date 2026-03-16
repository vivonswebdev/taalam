import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const DEMO_EMAIL = "demo@taalam.eu";
const DEMO_PASSWORD = "TaalamDemo2026!";

interface DemoLoginBannerProps {
  onDemoLogin: (email: string, password: string) => void;
}

export default function DemoLoginBanner({ onDemoLogin }: DemoLoginBannerProps) {
  const [searchParams] = useSearchParams();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (searchParams.get("demo") === "true") {
      localStorage.setItem("show_demo_banner", "true");
    }
    setVisible(localStorage.getItem("show_demo_banner") === "true");
  }, [searchParams]);

  if (!visible) return null;

  return (
    <button
      onClick={() => onDemoLogin(DEMO_EMAIL, DEMO_PASSWORD)}
      className="w-full py-2.5 px-4 text-xs font-medium rounded-xl border border-[hsl(38,40%,70%)] bg-[hsl(38,40%,82%)] text-[hsl(38,30%,25%)] hover:bg-[hsl(38,40%,76%)] transition-colors text-center"
    >
      🍎 Apple Review ? Appuyez ici pour accès demo
    </button>
  );
}
