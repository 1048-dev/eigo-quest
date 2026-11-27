/**
 * プレミアムなモンスターカード。
 * レア度で額縁が変わる: ブロンズ（通常種）/ ゴールド（希少種）/ プラチナ（英雄級・ホロ）/ ダークエピック（神話級・ホロ＋プリズムのオーラ）
 *  - 額縁: メタルの帯＋内側の面取り線。ゴールド以上は 四隅に 属性の色の宝石
 *  - 絵の窓: 属性の色の光（英雄級以上は 後光の すじ）。左下に 属性の 漢字バッジ
 *  - 名前の札: 「・」の位置で 改行する（単語の途中で 切れない）
 * owned=false のときはシルエットと「？？？」だけ見せて、手に入れたくなる演出にする。
 */
import { Fragment } from "react";
import { MonsterArt } from "@/components/characters/MonsterArt";
import { archetypeOf, elementOf, RARITY_STYLE, resolveMonster } from "@/lib/game/monsters";

export function MonsterCard({ id, owned = true, count = 0, size = "md", isNew = false }: { id: string; owned?: boolean; count?: number; size?: "sm" | "md" | "lg"; isNew?: boolean }) {
  const m = resolveMonster(id);
  const st = RARITY_STYLE[m.rarity] ?? RARITY_STYLE.COMMON;
  const el = elementOf(m);
  const ar = archetypeOf(m);
  const art = size === "lg" ? 210 : size === "md" ? 120 : 86;
  const name = owned ? m.nameJa : "？？？";
  const parts = name.split("・");
  return (
    <div className={`mcard mcard-${st.frame} mcard-${size} ${st.holo && owned ? "mcard-holo" : ""}`} style={{ ["--el" as string]: el.glow }}>
      {st.stars >= 2 && (["tl", "tr", "bl", "br"] as const).map((c) => <span key={c} className={`mcard-gem mcard-gem-${c}`} aria-hidden />)}
      <div className="mcard-inner">
        <div className="mcard-head">
          <span className="mcard-no">{size === "sm" ? "" : "No."}{String(m.no).padStart(3, "0")}</span>
          <span className="mcard-stars" aria-label={`${st.stars}つ星`}>{"★".repeat(st.stars)}</span>
        </div>
        <div className="mcard-art mcard-window" style={{ height: art }}>
          {owned && <div className="mcard-glow" />}
          {owned && st.aura && <div className="mcard-rays" />}
          <svg viewBox="-6 -8 112 110" width={art} height={art} aria-hidden overflow="visible" className={owned ? "" : "mcard-silhouette"}>
            <g filter={owned ? "url(#f-rim)" : undefined}><MonsterArt id={m.id} /></g>
          </svg>
          {!owned && <span className="mcard-unknown" aria-hidden>?</span>}
          {owned && <span className="mcard-el" aria-label={`${el.ja}属性`}>{el.kanji}</span>}
          {isNew && <span className="mcard-new">NEW!</span>}
          {owned && count > 1 && <span className="mcard-count">×{count}</span>}
        </div>
        <div className="mcard-plate">
          <p className="mcard-grade">{size === "sm" ? st.gradeJa : `${st.frameJa}・${st.gradeJa}`}</p>
          <p className="mcard-name font-title">
            {parts.map((s, i) => <Fragment key={i}>{i > 0 && <>・<wbr /></>}{s}</Fragment>)}
          </p>
          {size !== "sm" ? <p className="mcard-title">{owned ? `「${m.titleJa}」` : "まだ出会っていない"}</p> : !owned && <span className="sr-only">まだ出会っていない</span>}
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
