import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { surahs } from "@/data/surahs";
import type { HifzTask, HifzPlan } from "@/hooks/useHifzPlan";
import type { DailyActivity } from "@/hooks/useQuranHabits";
import { trackEvent } from "@/lib/trackEvent";

interface ReportData {
  // Page 1: Cover
  displayName: string;
  streak: number;
  level: number;
  xpTotal: number;
  xpToday: number;
  // Page 2: Hifz
  hifzPlan: HifzPlan | null;
  hifzTasks: HifzTask[];
  hifzProgress: number;
  // Page 3: Habits
  last30Days: DailyActivity[];
  habitStreak: number;
  // Page 4: Stats
  totalMinutes: number;
  totalAyat: number;
  topSurahs: { name: string; score: number }[];
  quizAvg: number;
  // i18n labels
  labels: Record<string, string>;
}

export function generateProgressReport(data: ReportData) {
  trackEvent("report_downloaded", "habits");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const margin = 15;

  // Colors
  const PRIMARY = [34, 139, 96] as [number, number, number];
  const DARK = [30, 30, 30] as [number, number, number];
  const MUTED = [120, 120, 120] as [number, number, number];

  // ─── PAGE 1: COVER ───
  doc.setFillColor(245, 248, 245);
  doc.rect(0, 0, W, doc.internal.pageSize.getHeight(), "F");

  doc.setFontSize(28);
  doc.setTextColor(...PRIMARY);
  doc.text("Ta'alam", W / 2, 50, { align: "center" });

  // Website URL
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text("app.taalam.eu", W / 2, 58, { align: "center" });

  doc.setFontSize(12);
  doc.setTextColor(...MUTED);
  doc.text(data.labels.reportTitle || "Progress Report", W / 2, 62, { align: "center" });

  doc.setFontSize(16);
  doc.setTextColor(...DARK);
  doc.text(data.displayName || "–", W / 2, 85, { align: "center" });

  // Stats boxes
  const stats = [
    { label: data.labels.streak || "Streak", value: `${data.streak} ${data.labels.days || "days"}` },
    { label: data.labels.level || "Level", value: `${data.level}` },
    { label: "XP", value: `${data.xpTotal}` },
    { label: data.labels.todayXP || "Today", value: `${data.xpToday} XP` },
  ];
  const boxW = (W - margin * 2 - 15) / 4;
  stats.forEach((s, i) => {
    const x = margin + i * (boxW + 5);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, 100, boxW, 30, 3, 3, "F");
    doc.setFontSize(14);
    doc.setTextColor(...PRIMARY);
    doc.text(s.value, x + boxW / 2, 115, { align: "center" });
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(s.label, x + boxW / 2, 124, { align: "center" });
  });

  const dateStr = new Date().toLocaleDateString();
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(dateStr, W / 2, 150, { align: "center" });

  // ─── PAGE 2: HIFZ ───
  doc.addPage();
  doc.setFontSize(18);
  doc.setTextColor(...PRIMARY);
  doc.text(data.labels.hifzSection || "Plan Hifz", margin, 25);

  if (data.hifzPlan) {
    doc.setFontSize(11);
    doc.setTextColor(...DARK);
    doc.text(`${data.hifzPlan.name} — ${data.hifzProgress}%`, margin, 35);

    // Progress bar
    doc.setFillColor(230, 230, 230);
    doc.roundedRect(margin, 40, W - margin * 2, 6, 3, 3, "F");
    doc.setFillColor(...PRIMARY);
    doc.roundedRect(margin, 40, (W - margin * 2) * (data.hifzProgress / 100), 6, 3, 3, "F");

    // Recent tasks table
    const recentTasks = data.hifzTasks
      .filter((t) => t.is_completed)
      .sort((a, b) => (b.completed_at || "").localeCompare(a.completed_at || ""))
      .slice(0, 20);

    if (recentTasks.length > 0) {
      autoTable(doc, {
        startY: 55,
        margin: { left: margin, right: margin },
        head: [[
          data.labels.surah || "Surah",
          data.labels.ayahs || "Ayahs",
          data.labels.type || "Type",
          data.labels.date || "Date",
        ]],
        body: recentTasks.map((t) => {
          const surah = surahs.find((s) => s.number === t.surah_number);
          return [
            surah?.name || `#${t.surah_number}`,
            `${t.ayah_from}–${t.ayah_to}`,
            t.task_type === "review" ? (data.labels.review || "Review") : (data.labels.newTask || "New"),
            t.completed_at ? new Date(t.completed_at).toLocaleDateString() : "–",
          ];
        }),
        headStyles: { fillColor: PRIMARY, fontSize: 9 },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [245, 248, 245] },
      });
    }
  } else {
    doc.setFontSize(11);
    doc.setTextColor(...MUTED);
    doc.text(data.labels.noPlan || "No Hifz plan created yet", margin, 40);
  }

  // ─── PAGE 3: HABITS ───
  doc.addPage();
  doc.setFontSize(18);
  doc.setTextColor(...PRIMARY);
  doc.text(data.labels.habitsSection || "Habits", margin, 25);

  doc.setFontSize(11);
  doc.setTextColor(...DARK);
  doc.text(`${data.labels.streak || "Streak"}: ${data.habitStreak} ${data.labels.days || "days"}`, margin, 35);

  // 30-day grid
  const gridX = margin;
  let gridY = 42;
  const cellSize = 7;
  const gap = 2;

  data.last30Days.forEach((d, i) => {
    const col = i % 7;
    const row = Math.floor(i / 7);
    const x = gridX + col * (cellSize + gap);
    const y = gridY + row * (cellSize + gap);
    const score = d.minutes_quran + d.ayat_recited;

    if (score === 0) doc.setFillColor(235, 235, 235);
    else if (score < 5) doc.setFillColor(200, 230, 210);
    else if (score < 15) doc.setFillColor(130, 200, 160);
    else if (score < 30) doc.setFillColor(70, 170, 120);
    else doc.setFillColor(...PRIMARY);

    doc.roundedRect(x, y, cellSize, cellSize, 1, 1, "F");
  });

  // ─── PAGE 4: GLOBAL STATS ───
  doc.addPage();
  doc.setFontSize(18);
  doc.setTextColor(...PRIMARY);
  doc.text(data.labels.statsSection || "Global Stats", margin, 25);

  const globalStats = [
    [data.labels.totalMinutes || "Total minutes", `${data.totalMinutes}`],
    [data.labels.totalAyat || "Total ayat", `${data.totalAyat}`],
    [data.labels.quizAvg || "Quiz avg.", `${data.quizAvg}%`],
  ];

  autoTable(doc, {
    startY: 35,
    margin: { left: margin, right: margin },
    body: globalStats,
    columnStyles: { 0: { fontStyle: "bold" } },
    bodyStyles: { fontSize: 11 },
    theme: "plain",
  });

  // Top surahs
  if (data.topSurahs.length > 0) {
    const topY = (doc as any).lastAutoTable?.finalY || 70;
    doc.setFontSize(13);
    doc.setTextColor(...PRIMARY);
    doc.text(data.labels.topSurahs || "Top Surahs", margin, topY + 15);

    autoTable(doc, {
      startY: topY + 20,
      margin: { left: margin, right: margin },
      head: [[data.labels.surah || "Surah", data.labels.score || "Score"]],
      body: data.topSurahs.map((s) => [s.name, `${s.score}%`]),
      headStyles: { fillColor: PRIMARY, fontSize: 9 },
      bodyStyles: { fontSize: 9 },
    });
  }

  // Save
  const dateFile = new Date().toISOString().split("T")[0];
  doc.save(`rapport-taalam-${dateFile}.pdf`);\n}
}
