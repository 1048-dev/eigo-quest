/**
 * 3DCGでレンダリングした本物のキャラクター画像の差し替え口。
 *
 * public/art/ に画像（透過PNG / WebP。立ち絵は縦長 100:170 推奨）を置き、ここにパスを書くと、
 * そのキャラクターの立ち絵（StandingFigure）が SVG イラストの代わりにその画像で表示される。
 * 何も書かなければ、今までどおり SVG イラストを使う（存在しないファイルを読みに行くことはない）。
 *
 * 例: haru: "/art/haru-standing.webp",
 */
import type { CharacterId } from "@/lib/game/characters";

export const RENDERED_STANDING: Partial<Record<CharacterId, string>> = {};
