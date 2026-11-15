/**
 * プレミアムなモンスターカード。
 * レア度で額縁が変わる: ブロンズ（通常種）/ ゴールド（希少種）/ プラチナ（英雄級・ホロ）/ ダークエピック（神話級・ホロ＋プリズムのオーラ）
 * owned=false のときはシルエットと「？？？」だけ見せて、手に入れたくなる演出にする。
 */
import { MonsterArt } from "@/components/characters/MonsterArt";
import { archetypeOf, elementOf, RARITY_STYLE, resolveMonster } from "@/lib/game/monsters";

export function MonsterCard({ id, owned = true, count = 0, size = "md", isNew = false }: { id: string; owned?: boolean; count?: number; size?: "sm" | "md" | "lg"; isNew?: boolean }) {
  const m = resolveMonster(id);
  const st = RARITY_STYLE[m.rarity] ?? RARITY_STYLE.COMMON;
  const el = elementOf(m);
  const ar = archetypeOf(m);
  const art = size === "lg" ? 210 : size === "md" ? 120 : 86;
  return (
    <div className={`mcard mcard-${st.frame} ${st.holo && owned ? "mcard-holo" : ""} ${size === "lg" ? "mcard-lg" : ""}`} style={{ ["--el" as string]: el.glow }}>
      <div className="mcard-inner">
        <div className="flex items-center justify-between px-2 pt-1.5 text-[10px] font-black">
          <span className="mcard-no">No.{String(m.no).padStart(3, "0")}</span>
          <span className="mcard-stars" aria-label={`${st.stars}つ星`}>{"★".repeat(st.stars)}</span>
        </div>
        <div className="mcard-art" style={{ height: art }}>
          {owned && <div className="mcard-glow" />}
          <svg viewBox="-6 -8 112 110" width={art} height={art} aria-hidden overflow="visible" className={owned ? "" : "mcard-silhouette"}>
            <g filter={owned ? "url(#f-rim)" : undefined}><MonsterArt id={m.id} /></g>
          </svg>
          {isNew && <span className="mcard-new">NEW!</span>}
          {owned && count > 1 && <span className="mcard-count">×{count}</span>}
        </div>
        <div className="px-2 pb-2 text-center">
          <p className="mcard-grade">{st.frameJa}・{st.gradeJa}</p>
          <p className={`font-title leading-tight ${size === "lg" ? "text-lg" : "text-[12px]"}`}>{owned ? m.nameJa : "？？？"}</p>
          {size !== "sm" && <p className="text-[10px] font-bold text-[var(--ink-2)]">{owned ? `「${m.titleJa}」` : "まだ出会っていない"}</p>}
          {size === "lg" && owned && (
            <div className="mt-2 grid grid-cols-3 gap-1 text-[10px] font-black">
              <span className="mcard-chip">{el.ja}</span>
              <span className="mcard-chip">{ar.ja}</span>
              <span className="mcard-chip">ちから {m.power}</span>
            </div>
          )}
          {size === "lg" && owned && (
            <p className="mt-2 text-[11px] font-bold text-[var(--ink-2)]">おぼえる英単語：{m.words.map((w) => `${w.en}（${w.ja}）`).join(" / ")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
