import { useNavigate } from "react-router-dom";
import { useChildMode } from "@/hooks/useChildMode";
import FindAyah from "@/components/FindAyah";
import { surahs } from "@/data/surahs";
import { fetchFullSurah } from "@/lib/quranData";

export default function FindAyahPage() {
  const navigate = useNavigate();
  const { isChildMode } = useChildMode();

  return (
    <div className="min-h-screen pb-28 pt-14">
      <FindAyah
        onBack={() => navigate(-1)}
        onOpenSurah={(surahNumber, ayahNumber) => {
          navigate(`/quran?surah=${surahNumber}&ayah=${ayahNumber}&mode=mushaf`);
        }}
        onStartHifz={(surahNumber) => {
          navigate(`/quran?surah=${surahNumber}&mode=hifz`);
        }}
        isChildMode={isChildMode}
      />
    </div>
  );
}
