import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage, LANGUAGES, type Lang } from "@/hooks/useLanguage";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-card border border-border text-sm hover:bg-accent/50 transition-colors"
        aria-label="Change language"
      >
        <span className="text-lg leading-none">{current.flag}</span>
        <span className="text-xs font-medium text-foreground hidden sm:inline">{current.code.toUpperCase()}</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 z-50 bg-card border border-border rounded-xl shadow-lg overflow-hidden min-w-[140px]"
            >
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => { setLang(l.code); setOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-accent/50 transition-colors ${
                    lang === l.code ? "bg-primary/10" : ""
                  }`}
                >
                  <span className="text-lg">{l.flag}</span>
                  <span className={`text-sm ${lang === l.code ? "text-primary font-semibold" : "text-foreground"}`}>
                    {l.label}
                  </span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
