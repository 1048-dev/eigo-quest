import Link from "next/link";
import { AccountHeader } from "@/components/account/Form";
import { LEGAL_DOCS, LEGAL_SLUGS, readLegalDoc, type LegalSlug } from "@/lib/legal/docs";
import type { Block, Inline } from "@/lib/legal/markdown";

function Text({ xs }: { xs: Inline[] }) {
  return (
    <>
      {xs.map((x, i) => {
        const node = x.bold ? <strong key={i}>{x.text}</strong> : <span key={i}>{x.text}</span>;
        return x.check ? <mark key={i} className="rounded bg-[var(--gold)]/30 px-0.5 text-inherit">{node}</mark> : node;
      })}
    </>
  );
}

function BlockView({ b }: { b: Block }) {
  switch (b.kind) {
    case "heading":
      if (b.level === 1) return null; // ページの 見出しで 出す
      return b.level === 2
        ? <h2 className="mt-6 border-b border-[var(--gold)]/40 pb-1 text-base font-black"><Text xs={b.text} /></h2>
        : <h3 className="mt-4 text-sm font-black"><Text xs={b.text} /></h3>;
    case "quote":
      return (
        <div className="rounded-xl border border-[var(--gold)]/50 bg-black/30 p-3 text-xs">
          {b.lines.map((l, i) => <p key={i}><Text xs={l} /></p>)}
        </div>
      );
    case "paragraph":
      return <p className="mt-2"><Text xs={b.text} /></p>;
    case "list": {
      const Tag = b.ordered ? "ol" : "ul";
      return (
        <Tag className={`mt-2 space-y-1 pl-6 ${b.ordered ? "list-decimal" : "list-disc"}`}>
          {b.items.map((it, i) => (
            <li key={i}>
              <Text xs={it.text} />
              {it.children.length > 0 && (
                <ul className="mt-1 list-[circle] space-y-0.5 pl-5">{it.children.map((c, j) => <li key={j}><Text xs={c} /></li>)}</ul>
              )}
            </li>
          ))}
        </Tag>
      );
    }
    case "table":
      return (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>{b.header.map((h, i) => <th key={i} className="border border-[var(--gold)]/40 bg-black/30 p-2 text-left font-black"><Text xs={h} /></th>)}</tr>
            </thead>
            <tbody>
              {b.rows.map((r, i) => (
                <tr key={i}>{r.map((c, j) => <td key={j} className="border border-[var(--gold)]/30 p-2 align-top"><Text xs={c} /></td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

/** /terms・/privacy・/tokushoho の 中身（docs/legal/*.md を そのまま 出す） */
export function LegalDocument({ slug }: { slug: LegalSlug }) {
  const { title, blocks } = readLegalDoc(slug);
  const others = LEGAL_SLUGS.filter((s) => s !== slug);
  return (
    <div className="pb-6">
      <AccountHeader title={title} back={{ href: "/welcome", label: "スタート画面へ" }} />
      <article className="card rpg-rivets p-5 text-sm leading-relaxed" aria-label={title}>
        {blocks.map((b, i) => <BlockView key={i} b={b} />)}
      </article>
      <p className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
        {others.map((s) => (
          <Link key={s} href={LEGAL_DOCS[s].href} className="font-bold text-[var(--volt)] underline underline-offset-4">{LEGAL_DOCS[s].labelJa}</Link>
        ))}
      </p>
    </div>
  );
}
