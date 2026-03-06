import { useState } from 'react';
import { Heart, Tag, Pencil, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toggleLocalBookmark } from '@/lib/mushafDB';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { toast } from 'sonner';

interface AyahBookmarkProps {
  verseId: string;
  verseText: string;
  isBookmarked: boolean;
  onToggle: () => void;
}

const BOOKMARK_COLORS = [
  { name: 'Or', value: '#FFD700' },
  { name: 'Rose', value: '#FF6B6B' },
  { name: 'Bleu', value: '#4ECDC4' },
  { name: 'Violet', value: '#9B59B6' },
  { name: 'Vert', value: '#2ECC71' }
];

const CATEGORIES = [
  { id: 'favorite' as const, label: '⭐ Favori' },
  { id: 'memorizing' as const, label: '🧠 Mémorisation' },
  { id: 'study' as const, label: '📚 Étude' },
  { id: 'reflection' as const, label: '💭 Réflexion' },
];

export default function AyahBookmark({
  verseId,
  verseText,
  isBookmarked,
  onToggle
}: AyahBookmarkProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [showOptions, setShowOptions] = useState(false);
  const [note, setNote] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [color, setColor] = useState('#FFD700');
  const [category, setCategory] = useState<'favorite' | 'memorizing' | 'study' | 'reflection'>('favorite');

  const handleToggle = async () => {
    if (!user) {
      toast.error(t("mushaf.loginRequired" as any));
      return;
    }

    if (isBookmarked) {
      await toggleLocalBookmark(user.id, verseId);
      toast.success(t("mushaf.removeBookmark" as any));
      onToggle();
    } else {
      setShowOptions(true);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    await toggleLocalBookmark(user.id, verseId, {
      note,
      tags,
      color,
      category
    });

    toast.success(t("mushaf.addBookmark" as any) + ' ✨');
    onToggle();
    setShowOptions(false);
    setNote('');
    setTags([]);
    setCurrentTag('');
  };

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  return (
    <>
      <button
        onClick={handleToggle}
        className="p-1.5 rounded-full transition-transform active:scale-90"
      >
        <AnimatePresence mode="wait">
          <motion.div key={isBookmarked ? 'filled' : 'empty'} initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}>
            <Heart
              size={18}
              className={isBookmarked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}
            />
          </motion.div>
        </AnimatePresence>
      </button>

      <Sheet open={showOptions} onOpenChange={setShowOptions}>
        <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-sm">
              <Heart size={16} className="text-red-500" />
              {t("mushaf.addBookmark" as any)}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-4 pt-3">
            {/* Verse preview */}
            <div className="p-3 rounded-xl bg-muted text-right font-['Amiri','serif'] text-sm leading-relaxed" dir="rtl">
              {verseText.slice(0, 120)}... <span className="text-xs text-muted-foreground">({verseId})</span>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">
                {t("mushaf.category" as any) || 'Catégorie'}
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`p-2.5 rounded-xl border-2 transition-all text-left text-xs font-medium ${
                      category === cat.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs">
                <Palette size={12} />
                {t("mushaf.bookmarkColor" as any) || 'Couleur du signet'}
              </Label>
              <div className="flex gap-2">
                {BOOKMARK_COLORS.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setColor(c.value)}
                    className={`w-9 h-9 rounded-full transition-transform ${
                      color === c.value ? 'ring-2 ring-primary ring-offset-2 scale-110' : ''
                    }`}
                    style={{ backgroundColor: c.value }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Note */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs">
                <Pencil size={12} />
                {t("mushaf.personalNote" as any) || 'Note personnelle'}
              </Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t("mushaf.notePlaceholder" as any) || 'Vos réflexions sur ce verset...'}
                className="min-h-[70px] text-sm"
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs">
                <Tag size={12} />
                Tags
              </Label>
              <div className="flex gap-2">
                <Input
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTag()}
                  placeholder={t("mushaf.addTag" as any) || 'Ajouter un tag...'}
                  className="flex-1 text-sm"
                />
                <Button onClick={addTag} size="sm" variant="secondary">+</Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map(tag => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="cursor-pointer hover:bg-destructive/20 text-xs"
                      onClick={() => setTags(tags.filter(t => t !== tag))}
                    >
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} className="flex-1 text-sm">
                {t("common.save" as any) || 'Enregistrer'}
              </Button>
              <Button onClick={() => setShowOptions(false)} variant="ghost" className="flex-1 text-sm">
                {t("common.cancel" as any) || 'Annuler'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
