import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Download, BarChart3 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/hooks/useLanguage";
import type { FamilyMember } from "@/hooks/useFamily";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

interface DayData {
  date: string;
  [userId: string]: number | string;
}

const CHILD_COLORS = [
  "hsl(var(--primary))",
  "hsl(142, 71%, 45%)",
  "hsl(262, 83%, 58%)",
  "hsl(25, 95%, 53%)",
  "hsl(340, 82%, 52%)",
];

interface FamilyHeatmapProps {
  familyId: string;
  members: FamilyMember[];
}

export default function FamilyHeatmap({ familyId, members }: FamilyHeatmapProps) {
  const { t } = useLanguage();
  const [activityMap, setActivityMap] = useState<Map<string, Map<string, { xp: number; minutes: number; ayat: number }>>>(new Map());
  const [loading, setLoading] = useState(true);

  const children = useMemo(() => members.filter((m) => m.role_in_family === "child"), [members]);

  const last30Dates = useMemo(() => {
    const dates: string[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().slice(0, 10));
    }
    return dates;
  }, []);

  const fetchActivity = useCallback(async () => {
    if (children.length === 0) { setLoading(false); return; }
    setLoading(true);

    const userIds = children.map((c) => c.user_id);
    const startDate = last30Dates[0];

    const { data } = await supabase
      .from("quran_daily_activity")
      .select("user_id, activity_date, minutes_quran, ayat_recited")
      .in("user_id", userIds)
      .gte("activity_date", startDate);

    // Also get XP from user_progress for daily approximation
    const map = new Map<string, Map<string, { xp: number; minutes: number; ayat: number }>>();
    
    for (const uid of userIds) {
      map.set(uid, new Map());
    }

    if (data) {
      for (const row of data) {
        const userMap = map.get(row.user_id);
        if (userMap) {
          userMap.set(row.activity_date, {
            xp: (row.minutes_quran || 0) * 2 + (row.ayat_recited || 0),
            minutes: row.minutes_quran || 0,
            ayat: row.ayat_recited || 0,
          });
        }
      }
    }

    setActivityMap(map);
    setLoading(false);
  }, [children, last30Dates]);

  useEffect(() => { fetchActivity(); }, [fetchActivity]);

  // Build chart data
  const chartData: DayData[] = useMemo(() => {
    return last30Dates.map((date) => {
      const entry: DayData = { date: date.slice(5) }; // MM-DD
      for (const child of children) {
        const dayData = activityMap.get(child.user_id)?.get(date);
        entry[child.user_id] = dayData?.xp || 0;
      }
      return entry;
    });
  }, [last30Dates, children, activityMap]);

  // Build heatmap: aggregate all children per day
  const heatmapData = useMemo(() => {
    return last30Dates.map((date) => {
      let total = 0;
      for (const child of children) {
        const d = activityMap.get(child.user_id)?.get(date);
        if (d) total += d.xp;
      }
      return { date, total };
    });
  }, [last30Dates, children, activityMap]);

  // Monthly summary
  const monthlySummary = useMemo(() => {
    return children.map((child) => {
      let totalXp = 0, totalMin = 0, totalAyat = 0, activeDays = 0;
      const userMap = activityMap.get(child.user_id);
      if (userMap) {
        for (const [, v] of userMap) {
          totalXp += v.xp;
          totalMin += v.minutes;
          totalAyat += v.ayat;
          if (v.xp > 0) activeDays++;
        }
      }
      return { ...child, totalXp, totalMin, totalAyat, activeDays };
    });
  }, [children, activityMap]);

  const getHeatColor = (val: number) => {
    if (val === 0) return "bg-muted";
    if (val < 5) return "bg-primary/20";
    if (val < 15) return "bg-primary/40";
    if (val < 30) return "bg-primary/60";
    return "bg-primary";
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    const margin = 15;
    const PRIMARY = [34, 139, 96] as [number, number, number];
    const DARK = [30, 30, 30] as [number, number, number];
    const MUTED = [120, 120, 120] as [number, number, number];

    // Cover
    doc.setFillColor(245, 248, 245);
    doc.rect(0, 0, W, doc.internal.pageSize.getHeight(), "F");
    doc.setFontSize(24);
    doc.setTextColor(...PRIMARY);
    doc.text(t("familyHeatmap.pdfTitle"), W / 2, 40, { align: "center" });
    doc.setFontSize(11);
    doc.setTextColor(...MUTED);
    doc.text(new Date().toLocaleDateString(), W / 2, 50, { align: "center" });

    // Heatmap grid
    let y = 65;
    doc.setFontSize(14);
    doc.setTextColor(...DARK);
    doc.text(t("familyHeatmap.title"), margin, y);
    y += 8;

    const cellSize = 7;
    const gap = 2;
    heatmapData.forEach((d, i) => {
      const col = i % 7;
      const row = Math.floor(i / 7);
      const x = margin + col * (cellSize + gap);
      const cy = y + row * (cellSize + gap);

      if (d.total === 0) doc.setFillColor(235, 235, 235);
      else if (d.total < 5) doc.setFillColor(200, 230, 210);
      else if (d.total < 15) doc.setFillColor(130, 200, 160);
      else if (d.total < 30) doc.setFillColor(70, 170, 120);
      else doc.setFillColor(...PRIMARY);

      doc.roundedRect(x, cy, cellSize, cellSize, 1, 1, "F");
    });

    y += Math.ceil(30 / 7) * (cellSize + gap) + 15;

    // Summary table
    doc.setFontSize(14);
    doc.setTextColor(...DARK);
    doc.text(t("familyHeatmap.monthSummary"), margin, y);

    autoTable(doc, {
      startY: y + 5,
      margin: { left: margin, right: margin },
      head: [[
        t("familyHeatmap.child"),
        "XP",
        t("familyHeatmap.minutes"),
        t("familyHeatmap.ayat"),
        t("familyHeatmap.activeDays"),
      ]],
      body: monthlySummary.map((c) => [
        `${c.avatar_emoji} ${c.display_name}`,
        `${c.totalXp}`,
        `${c.totalMin}`,
        `${c.totalAyat}`,
        `${c.activeDays}/30`,
      ]),
      headStyles: { fillColor: PRIMARY, fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [245, 248, 245] },
    });

    const dateFile = new Date().toISOString().split("T")[0];
    doc.save(`famille-rapport-${dateFile}.pdf`);
    toast.success(t("familyHeatmap.pdfDownloaded"));
  };

  if (children.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays size={18} className="text-primary" />
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("familyHeatmap.title")}</h3>
        </div>
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 rounded-lg px-3 py-1.5 active:scale-95 transition-transform"
        >
          <Download size={14} /> PDF
        </button>
      </div>

      {loading ? (
        <div className="h-32 bg-muted/50 rounded-2xl animate-pulse" />
      ) : (
        <>
          {/* Heatmap */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-card/70 backdrop-blur-xl border border-border/50 rounded-2xl p-4">
            <div className="grid grid-cols-7 gap-1.5">
              {heatmapData.map((d, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded-md ${getHeatColor(d.total)} transition-colors`}
                  title={`${d.date}: ${d.total} XP`}
                />
              ))}
            </div>
            <div className="flex items-center justify-between mt-2 text-[9px] text-muted-foreground">
              <span>{last30Dates[0]}</span>
              <div className="flex items-center gap-1">
                <span>{t("familyHeatmap.less")}</span>
                {["bg-muted", "bg-primary/20", "bg-primary/40", "bg-primary/60", "bg-primary"].map((c, i) => (
                  <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
                ))}
                <span>{t("familyHeatmap.more")}</span>
              </div>
              <span>{last30Dates[29]}</span>
            </div>
          </motion.div>

          {/* XP/day chart per child */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card/70 backdrop-blur-xl border border-border/50 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 size={16} className="text-primary" />
              <p className="text-xs font-bold text-muted-foreground uppercase">{t("familyHeatmap.xpPerDay")}</p>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={chartData}>
                <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} width={30} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, fontSize: 11, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                  labelStyle={{ fontWeight: 700 }}
                />
                {children.map((child, idx) => (
                  <Area
                    key={child.user_id}
                    type="monotone"
                    dataKey={child.user_id}
                    name={child.display_name || "?"}
                    stroke={CHILD_COLORS[idx % CHILD_COLORS.length]}
                    fill={CHILD_COLORS[idx % CHILD_COLORS.length]}
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-2">
              {children.map((child, idx) => (
                <div key={child.user_id} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHILD_COLORS[idx % CHILD_COLORS.length] }} />
                  <span>{child.avatar_emoji} {child.display_name}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Monthly summary cards */}
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">{t("familyHeatmap.monthSummary")}</h3>
            <div className="space-y-2">
              {monthlySummary.map((child, idx) => (
                <motion.div
                  key={child.user_id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-card/70 backdrop-blur-xl border border-border/50 rounded-2xl p-3 flex items-center gap-3"
                >
                  <span className="text-2xl">{child.avatar_emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{child.display_name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {child.activeDays}/30 {t("familyHeatmap.activeDays")}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs font-bold text-primary">{child.totalXp}</p>
                      <p className="text-[9px] text-muted-foreground">XP</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{child.totalMin}</p>
                      <p className="text-[9px] text-muted-foreground">min</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{child.totalAyat}</p>
                      <p className="text-[9px] text-muted-foreground">{t("familyHeatmap.ayat")}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
