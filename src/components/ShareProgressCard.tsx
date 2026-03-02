import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Share2, Download, Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useQuranXp } from "@/hooks/useQuranXp";
import { useStreak } from "@/hooks/useStreak";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function ShareProgressCard() {
  const { t } = useLanguage();
  const xp = useQuranXp();
  const { streak } = useStreak();
  const { user } = useAuth();
  const [generating, setGenerating] = useState(false);
  const [displayName, setDisplayName] = useState("");

  // Load name on first render
  useState(() => {
    if (user) {
      supabase.from("profiles").select("display_name").eq("user_id", user.id).maybeSingle().then(({ data }) => {
        if (data?.display_name) setDisplayName(data.display_name);
      });
    }
  });

  const generateAndShare = useCallback(async () => {
    setGenerating(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext("2d")!;

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, 0, 1920);
      grad.addColorStop(0, "#1a1a2e");
      grad.addColorStop(0.5, "#16213e");
      grad.addColorStop(1, "#0f3460");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1920);

      // Decorative circles
      ctx.globalAlpha = 0.1;
      ctx.beginPath();
      ctx.arc(200, 400, 300, 0, Math.PI * 2);
      ctx.fillStyle = "#e2b714";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(880, 1400, 250, 0, Math.PI * 2);
      ctx.fillStyle = "#53d769";
      ctx.fill();
      ctx.globalAlpha = 1;

      // Title
      ctx.fillStyle = "#e2b714";
      ctx.font = "bold 72px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("🌙 Ta'alam", 540, 300);

      // Name
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 64px system-ui, sans-serif";
      ctx.fillText(displayName || "Apprenant", 540, 500);

      // Level badge
      ctx.font = "48px system-ui, sans-serif";
      ctx.fillStyle = "#e2b714";
      ctx.fillText(`⭐ Level ${xp.level}`, 540, 620);

      // Stats cards
      const stats = [
        { emoji: "🔥", label: t("home.days" as any), value: `${streak || 0}` },
        { emoji: "⭐", label: "XP Total", value: `${xp.xp}` },
        { emoji: "🏅", label: "Level", value: `${xp.level}` },
      ];

      let yPos = 800;
      for (const stat of stats) {
        // Card bg
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        roundRect(ctx, 140, yPos, 800, 120, 30);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 48px system-ui, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(`${stat.emoji}  ${stat.label}`, 200, yPos + 75);

        ctx.textAlign = "right";
        ctx.fillStyle = "#53d769";
        ctx.font = "bold 56px system-ui, sans-serif";
        ctx.fillText(stat.value, 880, yPos + 75);

        yPos += 160;
      }

      // Footer
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.font = "32px system-ui, sans-serif";
      ctx.fillText("taaloum.lovable.app", 540, 1700);
      ctx.fillText("#TaalamHifz #Free", 540, 1760);

      // Export
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), "image/png")
      );
      const file = new File([blob], "taalam-progress.png", { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Ta'alam Progress",
          text: t("share.text" as any),
        });
      } else {
        // Fallback: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "taalam-progress.png";
        a.click();
        URL.revokeObjectURL(url);
        toast.success(t("share.downloaded" as any));
      }
    } catch (e) {
      console.warn("Share failed:", e);
    } finally {
      setGenerating(false);
    }
  }, [displayName, xp, streak, t]);

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={generateAndShare}
      disabled={generating}
      className="w-full flex items-center gap-3 rounded-2xl p-4 bg-gradient-to-r from-violet-600/20 to-pink-600/10 border border-violet-400/30 backdrop-blur-md disabled:opacity-60"
    >
      {generating ? (
        <Loader2 size={22} className="text-violet-400 animate-spin" />
      ) : (
        <Share2 size={22} className="text-violet-400" />
      )}
      <div className="flex-1 min-w-0 text-left">
        <p className="text-sm font-bold text-card-foreground">{t("share.title" as any)}</p>
        <p className="text-[11px] text-muted-foreground">{t("share.desc" as any)}</p>
      </div>
      <Download size={16} className="text-muted-foreground shrink-0" />
    </motion.button>
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
