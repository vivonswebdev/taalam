import { useMemo } from 'react';

// Standard international tajwid colors
const TAJWID_COLORS: Record<string, string> = {
  ham_wasl: '#AAAAAA',
  slnt: '#AAAAAA',
  laam_shamsiyya: '#169777',
  madda_normal: '#FF7E1E',
  madda_permissible: '#FF7E1E',
  madda_necessary: '#FF7E1E',
  madda_obligatory: '#FF7E1E',
  qalqala: '#DD0008',
  ikhfa_shafawi: '#D500B7',
  ikhfa: '#D500B7',
  idgham_shafawi: '#169777',
  idgham_ghunnah: '#169777',
  idgham_wo_ghunnah: '#169777',
  idgham_mutajanisayn: '#169777',
  idgham_mutaqaribayn: '#169777',
  iqlab: '#26BFFD',
  ghunnah: '#FF7E1E',
  // Fallback mappings
  madd: '#FF7E1E',
  idghaam: '#169777',
  idghaam_ghunnah: '#169777',
  ikhfaa: '#D500B7',
  qalqalah: '#DD0008',
  lam_shamsiyyah: '#169777',
};

interface TajwidTextProps {
  text: string; // HTML with <tajweed class="xyz"> tags from Quran.com API
  fontSize?: number;
  className?: string;
  enableTajwid?: boolean;
  textColor?: string; // explicit text color for non-tajwid text
}

export default function TajwidText({
  text,
  fontSize = 28,
  className = '',
  enableTajwid = true
}: TajwidTextProps) {
  const renderedParts = useMemo(() => {
    if (!enableTajwid || !text) {
      // Strip any HTML tags for plain display
      const plain = text?.replace(/<[^>]+>/g, '') || '';
      return [{ text: plain, color: undefined, key: 'plain-0' }];
    }

    const parts: { text: string; color: string | undefined; key: string }[] = [];
    // Match <tajweed class="classname">text</tajweed> tags
    const regex = /<tajweed\s+class="([^"]*)"[^>]*>([^<]*)<\/tajweed>/gi;
    let lastIndex = 0;
    let match;
    let idx = 0;

    while ((match = regex.exec(text)) !== null) {
      // Text before this tag
      if (match.index > lastIndex) {
        const beforeText = text.slice(lastIndex, match.index).replace(/<[^>]+>/g, '');
        if (beforeText) {
          parts.push({ text: beforeText, color: undefined, key: `t-${idx++}` });
        }
      }

      const ruleName = match[1];
      const tajwidText = match[2];
      const color = TAJWID_COLORS[ruleName] || undefined;
      parts.push({ text: tajwidText, color, key: `tj-${idx++}` });

      lastIndex = match.index + match[0].length;
    }

    // Remaining text after last tag
    if (lastIndex < text.length) {
      const remaining = text.slice(lastIndex).replace(/<[^>]+>/g, '');
      if (remaining) {
        parts.push({ text: remaining, color: undefined, key: `t-${idx++}` });
      }
    }

    // If no tags found, show plain text
    if (parts.length === 0) {
      const plain = text.replace(/<[^>]+>/g, '');
      parts.push({ text: plain, color: undefined, key: 'plain-0' });
    }

    return parts;
  }, [text, enableTajwid]);

  return (
    <span
      className={`font-['UthmanicHafs','Amiri','Scheherazade_New','serif'] ${className}`}
      style={{
        fontSize: `${fontSize}px`,
        lineHeight: 2.2,
        direction: 'rtl',
        display: 'inline',
      }}
    >
      {renderedParts.map(part => (
        <span
          key={part.key}
          style={{
            color: part.color || 'inherit',
            fontWeight: part.color ? 600 : undefined,
          }}
        >
          {part.text}
        </span>
      ))}
    </span>
  );
}
