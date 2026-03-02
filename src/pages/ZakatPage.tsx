import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { ArrowLeft, Download, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

interface ZakatValues {
  gold_grams: number;
  silver_grams: number;
  cash: number;
  stocks: number;
  business: number;
  debts_owed_to_you: number;
  debts_you_owe: number;
}

const INITIAL: ZakatValues = {
  gold_grams: 0, silver_grams: 0, cash: 0, stocks: 0,
  business: 0, debts_owed_to_you: 0, debts_you_owe: 0,
};

// Nisab: 85g gold or 595g silver
const GOLD_NISAB_G = 85;

export default function ZakatPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [values, setValues] = useState<ZakatValues>(INITIAL);
  const [goldPrice, setGoldPrice] = useState<number>(70); // USD per gram fallback
  const [silverPrice, setSilverPrice] = useState<number>(0.85);
  const [currency, setCurrency] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch gold/silver prices
  useEffect(() => {
    setLoading(true);
    fetch("https://api.gold-api.com/price/XAU")
      .then(r => r.json())
      .then(data => {
        if (data?.price) setGoldPrice(data.price / 31.1035); // troy oz to gram
      })
      .catch(() => {});
    fetch("https://api.gold-api.com/price/XAG")
      .then(r => r.json())
      .then(data => {
        if (data?.price) setSilverPrice(data.price / 31.1035);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalAssets = values.gold_grams * goldPrice
    + values.silver_grams * silverPrice
    + values.cash + values.stocks + values.business
    + values.debts_owed_to_you;

  const totalLiabilities = values.debts_you_owe;
  const zakatableWealth = Math.max(0, totalAssets - totalLiabilities);
  const nisabValue = GOLD_NISAB_G * goldPrice;
  const isAboveNisab = zakatableWealth >= nisabValue;
  const zakatDue = isAboveNisab ? zakatableWealth * 0.025 : 0;

  const update = (key: keyof ZakatValues, val: string) => {
    const n = parseFloat(val) || 0;
    setValues(prev => ({ ...prev, [key]: n }));
  };

  const exportPDF = useCallback(async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Zakat Calculation", 20, 20);
    doc.setFontSize(11);
    const date = new Date().toLocaleDateString();
    doc.text(`Date: ${date}`, 20, 30);
    doc.text(`Gold: ${values.gold_grams}g × $${goldPrice.toFixed(2)} = $${(values.gold_grams * goldPrice).toFixed(2)}`, 20, 45);
    doc.text(`Silver: ${values.silver_grams}g × $${silverPrice.toFixed(2)} = $${(values.silver_grams * silverPrice).toFixed(2)}`, 20, 53);
    doc.text(`Cash: $${values.cash.toFixed(2)}`, 20, 61);
    doc.text(`Stocks/Investments: $${values.stocks.toFixed(2)}`, 20, 69);
    doc.text(`Business assets: $${values.business.toFixed(2)}`, 20, 77);
    doc.text(`Debts owed to you: $${values.debts_owed_to_you.toFixed(2)}`, 20, 85);
    doc.text(`Debts you owe: -$${values.debts_you_owe.toFixed(2)}`, 20, 93);
    doc.line(20, 97, 190, 97);
    doc.text(`Total zakatable: $${zakatableWealth.toFixed(2)}`, 20, 105);
    doc.text(`Nisab (85g gold): $${nisabValue.toFixed(2)}`, 20, 113);
    doc.setFontSize(14);
    doc.text(`ZAKAT DUE (2.5%): $${zakatDue.toFixed(2)}`, 20, 125);
    doc.save(`zakat-${date}.pdf`);
  }, [values, goldPrice, silverPrice, zakatableWealth, nisabValue, zakatDue]);

  const fields: { key: keyof ZakatValues; labelKey: string; emoji: string }[] = [
    { key: "gold_grams", labelKey: "zakat.gold", emoji: "🥇" },
    { key: "silver_grams", labelKey: "zakat.silver", emoji: "🥈" },
    { key: "cash", labelKey: "zakat.cash", emoji: "💵" },
    { key: "stocks", labelKey: "zakat.stocks", emoji: "📈" },
    { key: "business", labelKey: "zakat.business", emoji: "🏪" },
    { key: "debts_owed_to_you", labelKey: "zakat.debtsOwed", emoji: "📥" },
    { key: "debts_you_owe", labelKey: "zakat.debtsYouOwe", emoji: "📤" },
  ];

  const isGrams = (k: string) => k === "gold_grams" || k === "silver_grams";

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pb-2">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border shadow-sm">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">{t("zakat.title" as any)}</h1>
          <p className="text-xs text-muted-foreground">{t("zakat.subtitle" as any)}</p>
        </div>
        <button onClick={() => setValues(INITIAL)} className="w-10 h-10 rounded-xl bg-card flex items-center justify-center border border-border shadow-sm">
          <RotateCcw className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Nisab info */}
      <div className="px-4 mt-2">
        <div className="p-3 bg-accent/10 rounded-xl border border-accent/20 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{t("zakat.nisab" as any)}:</span>{" "}
          {GOLD_NISAB_G}g {t("zakat.gold" as any)} ≈ ${nisabValue.toFixed(0)} {currency}
          {loading && " ⏳"}
        </div>
      </div>

      {/* Form */}
      <div className="px-4 mt-3 space-y-2">
        {fields.map((f, i) => (
          <motion.div
            key={f.key}
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border/50"
          >
            <span className="text-lg">{f.emoji}</span>
            <div className="flex-1 min-w-0">
              <label className="text-xs font-semibold text-foreground block">{t(f.labelKey as any)}</label>
              <p className="text-[10px] text-muted-foreground">
                {isGrams(f.key) ? t("zakat.inGrams" as any) : currency}
              </p>
            </div>
            <input
              type="number"
              min={0}
              step={isGrams(f.key) ? 0.1 : 1}
              value={values[f.key] || ""}
              onChange={(e) => update(f.key, e.target.value)}
              placeholder="0"
              className="w-28 text-right bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-primary/30 focus:outline-none"
            />
          </motion.div>
        ))}
      </div>

      {/* Result */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="px-4 mt-4"
      >
        <div className={`p-4 rounded-2xl border shadow-lg ${
          isAboveNisab
            ? "bg-gradient-to-br from-primary/15 to-accent/10 border-primary/30"
            : "bg-card border-border"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{t("zakat.totalWealth" as any)}</span>
            <span className="font-mono text-sm font-bold text-foreground">${zakatableWealth.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground">{t("zakat.aboveNisab" as any)}</span>
            <span className={`text-sm font-bold ${isAboveNisab ? "text-primary" : "text-muted-foreground"}`}>
              {isAboveNisab ? "✅" : "❌"}
            </span>
          </div>
          <div className="border-t border-border/50 pt-3 flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">{t("zakat.zakatDue" as any)} (2.5%)</span>
            <span className="text-xl font-bold font-mono bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ${zakatDue.toFixed(2)}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Export */}
      {zakatDue > 0 && (
        <div className="px-4 mt-3">
          <button
            onClick={exportPDF}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm shadow-md active:scale-[0.98] transition-transform"
          >
            <Download className="w-4 h-4" />
            {t("zakat.exportPdf" as any)}
          </button>
        </div>
      )}
    </div>
  );
}
