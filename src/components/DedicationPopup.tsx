import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DEDICATION_KEY = "dedicaceSeen";

interface DedicationPopupProps {
  forceShow?: boolean;
  onClose?: () => void;
}

export default function DedicationPopup({ forceShow = false, onClose }: DedicationPopupProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (forceShow) {
      setShow(true);
      return;
    }
    const seen = localStorage.getItem(DEDICATION_KEY);
    if (!seen) {
      setShow(true);
    }
  }, [forceShow]);

  const handleClose = () => {
    localStorage.setItem(DEDICATION_KEY, "true");
    setShow(false);
    onClose?.();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          role="dialog"
          aria-modal="true"
          aria-label="إهداء"
          dir="rtl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-[90vw] sm:max-w-md rounded-3xl overflow-hidden shadow-2xl"
            style={{
              background: "#E8F5E8",
              border: "2px solid #D4AF37",
            }}
          >
            {/* Mosque icon */}
            <div className="flex justify-center pt-6 pb-2">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <span className="text-5xl" role="img" aria-label="mosque">
                  🕌
                </span>
              </motion.div>
            </div>

            {/* Gold ornament line */}
            <div className="flex justify-center mb-3">
              <div className="w-24 h-0.5 rounded-full" style={{ background: "linear-gradient(90deg, transparent, #D4AF37, transparent)" }} />
            </div>

            {/* Dedication text */}
            <div className="px-6 pb-4 text-center" style={{ fontFamily: "'Amiri', 'Scheherazade New', serif" }}>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-lg font-bold mb-4"
                style={{ color: "#1B5E20", lineHeight: 2 }}
              >
                إهداء خاص إلى أمي كريمة (الله يرحمها)
                <br />
                و حَجَّة زاهية يَنْطُور
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="text-xl font-bold mb-5"
                style={{ color: "#D4AF37", lineHeight: 2 }}
              >
                وَكُلِّ الأُمَّهَاتِ الصَّالِحَاتِ
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="text-base leading-loose"
                style={{ color: "#2E7D32", lineHeight: 2.2 }}
              >
                <p>اللهم ارحم كريمة واغفر لها وأسكنها فسيح جناتك،</p>
                <p>ونسأل الله أن يبارك في عمر زاهية وصحتها،</p>
                <p>وأن يجعل هذا العمل في ميزان حسناتهن جميعاً،</p>
                <p className="font-bold" style={{ color: "#1B5E20" }}>
                  وأن يرزقهن الفردوس الأعلى.
                </p>
              </motion.div>
            </div>

            {/* Gold ornament line */}
            <div className="flex justify-center mt-2 mb-4">
              <div className="w-24 h-0.5 rounded-full" style={{ background: "linear-gradient(90deg, transparent, #D4AF37, transparent)" }} />
            </div>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.4 }}
              className="px-6 pb-6 flex flex-col gap-3"
            >
              <button
                onClick={handleClose}
                className="w-full py-3.5 rounded-2xl text-lg font-bold transition-all active:scale-[0.97]"
                style={{
                  background: "linear-gradient(135deg, #2E7D32, #1B5E20)",
                  color: "#fff",
                  boxShadow: "0 0 20px rgba(46, 125, 50, 0.3)",
                  fontFamily: "'Amiri', serif",
                }}
              >
                آمين 🤲
              </button>
              <button
                onClick={handleClose}
                className="w-full py-2.5 rounded-xl text-sm transition-colors active:scale-[0.98]"
                style={{
                  color: "#666",
                  fontFamily: "'Amiri', serif",
                }}
              >
                إغلاق
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function useDedicationPopup() {
  const [forceShow, setForceShow] = useState(false);

  const showDedication = () => setForceShow(true);
  const hideDedication = () => setForceShow(false);

  return { forceShow, showDedication, hideDedication };
}
