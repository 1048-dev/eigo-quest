import { Portrait } from "@/components/characters/CharacterArt";
import { avatarFor } from "@/lib/auth/client";

/** 子どものアバター（きょうだいの登録順 index できまるキャラクターの顔＋色の輪） */
export function ChildAvatar({ childId, index, size = 56, className = "" }: { childId: string; index?: number; size?: number; className?: string }) {
  const a = avatarFor(childId, index);
  return (
    <span className={`inline-grid shrink-0 place-items-center rounded-full ${className}`} style={{ background: a.bg, width: size + 8, height: size + 8 }} aria-hidden>
      <Portrait id={a.id} size={size} ring={a.ring} />
    </span>
  );
}
