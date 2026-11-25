import { Portrait } from "@/components/characters/CharacterArt";
import { avatarFor } from "@/lib/auth/client";

/**
 * 子どものアバター（キャラクターの顔＋色の輪）。
 * avatar = 子どもが えらんだ顔。無ければ きょうだいの登録順 index で決まる顔。
 */
export function ChildAvatar({ childId, index, avatar, size = 56, className = "" }: { childId: string; index?: number; avatar?: string | null; size?: number; className?: string }) {
  const a = avatarFor(childId, index, avatar);
  return (
    <span className={`inline-grid shrink-0 place-items-center rounded-full ${className}`} style={{ background: a.bg, width: size + 8, height: size + 8 }} aria-hidden>
      <Portrait id={a.id} size={size} ring={a.ring} />
    </span>
  );
}
