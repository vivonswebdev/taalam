import { motion } from "framer-motion";

const AVATARS = [
  "🌙", "🕌", "☪️", "🤲", "🕋", "🧕", "🧔", "👳‍♂️", "👳‍♀️",
  "📖", "🌟", "🏮", "🪷", "🕊️", "💎", "🫧",
];

interface IslamicAvatarPickerProps {
  selected: string;
  onSelect: (emoji: string) => void;
}

export default function IslamicAvatarPicker({ selected, onSelect }: IslamicAvatarPickerProps) {
  return (
    <div className="grid grid-cols-8 gap-2">
      {AVATARS.map((emoji) => (
        <motion.button
          key={emoji}
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={() => onSelect(emoji)}
          className={`text-2xl w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            selected === emoji
              ? "bg-primary/20 ring-2 ring-primary scale-110"
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          {emoji}
        </motion.button>
      ))}
    </div>
  );
}
