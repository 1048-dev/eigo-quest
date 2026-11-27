/** 規約・ポリシーの ページ（ブラウザ側からも つかえるように fs を つかわない ファイルに わけた） */
export const LEGAL_DOCS = {
  terms: { file: "terms.md", href: "/terms", labelJa: "利用規約" },
  privacy: { file: "privacy.md", href: "/privacy", labelJa: "プライバシーポリシー" },
  tokushoho: { file: "tokushoho.md", href: "/tokushoho", labelJa: "特定商取引法に基づく表記" },
} as const;

export type LegalSlug = keyof typeof LEGAL_DOCS;

export const LEGAL_SLUGS = Object.keys(LEGAL_DOCS) as LegalSlug[];
