import { BirimoArt } from "@/components/characters/CharacterArt";
import type { CompanionLine } from "@/lib/game/companion";

/** 相棒ビリモ＋吹き出し */
export function CompanionBubble({ line, size = 72, className = "" }: { line: CompanionLine; size?: number; className?: string }) {
  return (
    <div className={`flex items-end gap-3 ${className}`}>
      <svg viewBox="0 0 100 100" width={size} height={size} className="glow shrink-0 bob" role="img" aria-label="相棒ビリモ" overflow="visible">
        <BirimoArt mood={line.mood} />
      </svg>
      <p className="speech flex-1 px-3 py-2 text-sm font-bold leading-relaxed">
        <span className="font-title speech-name mr-1">ビリモ</span>
        {line.text}
      </p>
    </div>
  );
}
