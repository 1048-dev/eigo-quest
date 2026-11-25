/**
 * 子どもが えらぶ アバター（キャラクター）。DB の User.avatarCharacter に保存する。
 * 「だれが あそぶ？」・画面上のヘッダー・おうちの方のページで同じ顔を出す。
 */
export const AVATAR_CHARACTERS = ["haru", "riko", "kiko", "birimo"] as const;
export type AvatarCharacter = (typeof AVATAR_CHARACTERS)[number];

export const AVATAR_LABELS_JA: Record<AvatarCharacter, string> = {
  haru: "ハル",
  riko: "リコ",
  kiko: "キコ",
  birimo: "ビリモ",
};

export function isAvatarCharacter(v: unknown): v is AvatarCharacter {
  return typeof v === "string" && (AVATAR_CHARACTERS as readonly string[]).includes(v);
}

/** 登録順（0始まり）で決まる きまりの顔（マイグレーションで既存の子に入れたものと同じ並び） */
export function avatarForOrder(index: number): AvatarCharacter {
  const i = Number.isInteger(index) && index >= 0 ? index : 0;
  return AVATAR_CHARACTERS[i % AVATAR_CHARACTERS.length];
}

/**
 * 新しい子どもの顔（えらばれなかったとき）: きょうだいが まだ使っていない顔の中で いちばん前のもの。
 * 4人とも使っていれば 登録順のくり返し。
 */
export function defaultAvatarForNewChild(siblings: readonly string[]): AvatarCharacter {
  return AVATAR_CHARACTERS.find((a) => !siblings.includes(a)) ?? avatarForOrder(siblings.length);
}
