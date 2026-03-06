import SEOHead from '@/components/SEOHead';
import MushafReaderV2 from '@/components/mushaf/MushafReaderV2';

export default function MushafPage() {
  return (
    <>
      <SEOHead
        title="Mushaf - Lecture du Coran"
        description="Lisez le Coran avec tajwid coloré, traduction française et mode offline. Zoom intelligent et favoris personnalisés."
        path="/mushaf"
      />
      <MushafReaderV2 />
    </>
  );
}
