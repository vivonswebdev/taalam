import { useRef, useState, useCallback } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, X, Download, MessageCircle, Send } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import type { Family, FamilyMember } from "@/hooks/useFamily";
import { toast } from "sonner";

interface Props {
  family: Family;
  members: FamilyMember[];
  open: boolean;
  onClose: () => void;
}

const CARD_W = 720;
const CARD_H = 960;

function getLevel(xp: number) {
  if (xp >= 10000) return 20;
  return Math.floor(xp / 500) + 1;
}

export default function FamilyShareCard({ family, members, open, onClose }: Props) {
  const { t } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const qrRef = useRef<HTMLCanvasElement>(null);
  const [generating, setGenerating] = useState(false);

  const joinUrl = `https://taaloum.lovable.app/family?join=${family.invite_code}`;

  const totalXP = members.reduce((s, m) => s + (m.xp_total || 0), 0);
  const maxStreak = members.reduce((m, c) => Math.max(m, c.streak_days || 0), 0);
  const children = members.filter(m => m.role_in_family === "child");
  const totalXPToday = members.reduce((s, m) => s + (m.xp_today || 0), 0);

  const drawCard = useCallback(async (): Promise<Blob | null> => {
    const canvas = canvasRef.current;
    const qrCanvas = qrRef.current;
    if (!canvas || !qrCanvas) return null;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const dpr = 2;
    canvas.width = CARD_W * dpr;
    canvas.height = CARD_H * dpr;
    ctx.scale(dpr, dpr);

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
    grad.addColorStop(0, "#0c1222");
    grad.addColorStop(0.5, "#1a1a3e");
    grad.addColorStop(1, "#0c1222");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CARD_W, CARD_H);

    // Decorative circles
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = "#8b5cf6";
    ctx.beginPath(); ctx.arc(600, 100, 200, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#06b6d4";
    ctx.beginPath(); ctx.arc(120, 800, 180, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;

    // Header
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 42px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🕌 Taaloum", CARD_W / 2, 70);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "18px system-ui, sans-serif";
    ctx.fillText(t("share.familyReport" as any), CARD_W / 2, 100);

    // Family name card
    const cardY = 130;
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    roundedRect(ctx, 40, cardY, CARD_W - 80, 80, 20);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1;
    roundedRect(ctx, 40, cardY, CARD_W - 80, 80, 20);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`👨‍👩‍👧‍👦 ${family.name}`, CARD_W / 2, cardY + 35);
    ctx.fillStyle = "#64748b";
    ctx.font = "15px system-ui, sans-serif";
    ctx.fillText(`${members.length} ${t("family.members")} · ${children.length} ${t("family.child")}`, CARD_W / 2, cardY + 62);

    // Stats grid
    const statsY = 240;
    const stats = [
      { emoji: "⚡", value: `${totalXP}`, label: "XP Total" },
      { emoji: "🔥", value: `${maxStreak}j`, label: t("family.bestStreak") },
      { emoji: "⭐", value: `${totalXPToday}`, label: t("family.xpToday") },
      { emoji: "📊", value: `Lv.${getLevel(totalXP)}`, label: t("family.level" as any) },
    ];

    const statW = (CARD_W - 80 - 20) / 2;
    const statH = 90;
    stats.forEach((stat, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 40 + col * (statW + 20);
      const y = statsY + row * (statH + 12);

      ctx.fillStyle = "rgba(255,255,255,0.04)";
      roundedRect(ctx, x, y, statW, statH, 16);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      roundedRect(ctx, x, y, statW, statH, 16);
      ctx.stroke();

      ctx.font = "28px system-ui, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText(`${stat.emoji} ${stat.value}`, x + statW / 2, y + 40);
      ctx.font = "13px system-ui, sans-serif";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(stat.label, x + statW / 2, y + 65);
    });

    // Children list
    const childrenY = statsY + 2 * (statH + 12) + 20;
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 14px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(t("family.children").toUpperCase(), 50, childrenY);

    children.slice(0, 4).forEach((child, i) => {
      const y = childrenY + 16 + i * 56;
      ctx.fillStyle = "rgba(255,255,255,0.04)";
      roundedRect(ctx, 40, y, CARD_W - 80, 48, 14);
      ctx.fill();

      ctx.font = "24px system-ui, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "left";
      ctx.fillText(child.avatar_emoji || "🌙", 56, y + 34);

      ctx.font = "bold 16px system-ui, sans-serif";
      ctx.fillText(child.display_name || "?", 92, y + 28);

      ctx.font = "13px system-ui, sans-serif";
      ctx.fillStyle = "#64748b";
      ctx.textAlign = "right";
      ctx.fillText(`⚡${child.xp_total || 0} XP  🔥${child.streak_days || 0}j`, CARD_W - 56, y + 30);
    });

    // QR Code section
    const qrY = childrenY + 16 + Math.min(children.length, 4) * 56 + 30;

    ctx.fillStyle = "rgba(255,255,255,0.06)";
    roundedRect(ctx, 40, qrY, CARD_W - 80, 170, 20);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(t("share.scanToJoin" as any), CARD_W / 2, qrY + 28);

    // Draw QR from hidden canvas
    const qrSize = 100;
    const qrX = CARD_W / 2 - qrSize / 2;
    ctx.drawImage(qrCanvas, qrX, qrY + 38, qrSize, qrSize);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 13px system-ui, sans-serif";
    ctx.fillText(`📎 ${t("share.code" as any)}: ${family.invite_code}`, CARD_W / 2, qrY + 155);

    // Footer
    ctx.fillStyle = "#475569";
    ctx.font = "12px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("taaloum.lovable.app", CARD_W / 2, CARD_H - 20);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/png");
    });
  }, [family, members, children, totalXP, maxStreak, totalXPToday, t]);

  const handleShare = useCallback(async (platform: "whatsapp" | "telegram" | "download" | "native") => {
    setGenerating(true);
    try {
      const blob = await drawCard();
      if (!blob) throw new Error("Canvas error");

      const file = new File([blob], `taaloum-${family.name.replace(/\s/g, "-")}.png`, { type: "image/png" });
      const shareText = `🕌 ${t("share.shareText" as any)} "${family.name}"!\n⚡ ${totalXP} XP · 🔥 ${maxStreak}j streak\n📎 ${t("share.code" as any)}: ${family.invite_code}\n🔗 ${joinUrl}`;

      if (platform === "native" && navigator.share) {
        await navigator.share({ text: shareText, files: [file] });
      } else if (platform === "whatsapp") {
        // Try native share with file first, fallback to URL
        if (navigator.share) {
          try {
            await navigator.share({ text: shareText, files: [file] });
            return;
          } catch {}
        }
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
      } else if (platform === "telegram") {
        if (navigator.share) {
          try {
            await navigator.share({ text: shareText, files: [file] });
            return;
          } catch {}
        }
        window.open(`https://t.me/share/url?url=${encodeURIComponent(joinUrl)}&text=${encodeURIComponent(shareText)}`, "_blank");
      } else if (platform === "download") {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = file.name; a.click();
        URL.revokeObjectURL(url);
        toast.success(t("share.downloaded" as any));
      }
    } catch (err) {
      console.error(err);
      toast.error(t("share.error" as any));
    } finally {
      setGenerating(false);
    }
  }, [drawCard, family, totalXP, maxStreak, joinUrl, t]);

  return (
    <>
      {/* Hidden canvases */}
      <canvas ref={canvasRef} className="hidden" />
      <QRCodeCanvas
        ref={qrRef as any}
        value={joinUrl}
        size={200}
        bgColor="transparent"
        fgColor="#ffffff"
        level="M"
        style={{ display: "none" }}
      />

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Share2 size={18} className="text-primary" />
                  {t("share.title" as any)}
                </h3>
                <button onClick={onClose} className="p-1 hover:bg-accent rounded-lg">
                  <X size={18} className="text-muted-foreground" />
                </button>
              </div>

              {/* Preview */}
              <div className="bg-gradient-to-br from-[#0c1222] to-[#1a1a3e] rounded-2xl p-4 text-center space-y-2">
                <p className="text-white font-bold text-sm">🕌 {family.name}</p>
                <div className="flex justify-center gap-4 text-white/80 text-xs">
                  <span>⚡ {totalXP} XP</span>
                  <span>🔥 {maxStreak}j</span>
                  <span>👧 {children.length}</span>
                </div>
                <div className="flex justify-center pt-1">
                  <QRCodeCanvas value={joinUrl} size={80} bgColor="transparent" fgColor="#ffffff" level="M" />
                </div>
                <p className="text-white/50 text-[10px] font-mono">{family.invite_code}</p>
              </div>

              {/* Share buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleShare("whatsapp")}
                  disabled={generating}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366]/10 text-[#25D366] font-semibold text-sm border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-colors disabled:opacity-50"
                >
                  <MessageCircle size={16} />
                  WhatsApp
                </button>
                <button
                  onClick={() => handleShare("telegram")}
                  disabled={generating}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0088cc]/10 text-[#0088cc] font-semibold text-sm border border-[#0088cc]/20 hover:bg-[#0088cc]/20 transition-colors disabled:opacity-50"
                >
                  <Send size={16} />
                  Telegram
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleShare("download")}
                  disabled={generating}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-muted text-foreground font-medium text-sm hover:bg-accent transition-colors disabled:opacity-50"
                >
                  <Download size={14} />
                  {t("share.download" as any)}
                </button>
                {typeof navigator.share === "function" && (
                  <button
                    onClick={() => handleShare("native")}
                    disabled={generating}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/10 text-primary font-medium text-sm hover:bg-primary/20 transition-colors disabled:opacity-50"
                  >
                    <Share2 size={14} />
                    {t("share.more" as any)}
                  </button>
                )}
              </div>

              {generating && (
                <p className="text-xs text-muted-foreground text-center animate-pulse">
                  {t("share.generating" as any)}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
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
