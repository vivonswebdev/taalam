import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink } from "lucide-react";

interface YouTubePlayerProps {
  videoId?: string;
  playlistId?: string;
  title: string;
  onClose: () => void;
}

export function YouTubePlayer({ videoId, playlistId, title, onClose }: YouTubePlayerProps) {
  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`
    : `https://www.youtube.com/embed/videoseries?list=${playlistId}&autoplay=1&rel=0&modestbranding=1`;

  const youtubeLink = videoId
    ? `https://www.youtube.com/watch?v=${videoId}`
    : `https://www.youtube.com/playlist?list=${playlistId}`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/90 flex flex-col"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-black/80">
          <p className="text-sm font-semibold text-white truncate flex-1 mr-3">{title}</p>
          <div className="flex items-center gap-2">
            <a
              href={youtubeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
            >
              <ExternalLink className="w-4 h-4 text-white" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Player */}
        <div className="flex-1 flex items-center justify-center p-2">
          <div className="w-full max-w-2xl aspect-video rounded-xl overflow-hidden">
            <iframe
              src={embedUrl}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
