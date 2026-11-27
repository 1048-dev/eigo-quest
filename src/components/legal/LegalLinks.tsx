import Link from "next/link";
import { LEGAL_DOCS, LEGAL_SLUGS } from "@/lib/legal/links";

/** 登録画面の 同意の ことわり（メールでの 登録・LINE での 登録の 両方に 出す） */
export function LegalConsentNote({ action }: { action: string }) {
  const link = "font-black text-[var(--volt)] underline underline-offset-4";
  return (
    <p className="text-center text-xs text-[var(--ink-2)]">
      「{action}」を おすと、
      <Link href={LEGAL_DOCS.terms.href} target="_blank" className={link}>{LEGAL_DOCS.terms.labelJa}</Link>
      と
      <Link href={LEGAL_DOCS.privacy.href} target="_blank" className={link}>{LEGAL_DOCS.privacy.labelJa}</Link>
      に同意したことになります。
    </p>
  );
}

/** すべての 画面の いちばん下の 小さな リンク（利用規約・プライバシーポリシー・特定商取引法に基づく表記） */
export function LegalFooter() {
  return (
    <footer className="mt-8 pb-2 text-center text-[11px] text-[var(--on-dark-2)]" aria-label="規約とポリシー">
      <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        {LEGAL_SLUGS.map((s) => (
          <Link key={s} href={LEGAL_DOCS[s].href} className="underline underline-offset-4 hover:text-[var(--volt)]">{LEGAL_DOCS[s].labelJa}</Link>
        ))}
      </nav>
    </footer>
  );
}
