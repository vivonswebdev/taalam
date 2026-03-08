import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, LayoutGrid } from "lucide-react";
import { useDesignPreference } from "@/hooks/useDesignPreference";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function DesignModeToggle() {
  const { mode, toggleMode } = useDesignPreference();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed bottom-20 right-4 z-50"
          >
            <Button
              onClick={toggleMode}
              size="icon"
              className={`
                rounded-full w-12 h-12 shadow-xl border-0
                ${
                  mode === "futuristic"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    : "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                }
              `}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ rotate: -180, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 180, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {mode === "futuristic" ? (
                    <Sparkles className="w-5 h-5 text-white" />
                  ) : (
                    <LayoutGrid className="w-5 h-5 text-white" />
                  )}
                </motion.div>
              </AnimatePresence>
            </Button>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="left" className="text-xs">
          {mode === "futuristic"
            ? "✨ Mode Futuriste — cliquez pour classique"
            : "📐 Mode Classique — cliquez pour futuriste"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
