#!/usr/bin/env python3
"""
A4ワークシート（PDF）自動生成スクリプト。

アプリと同じ content/curriculum/lessons.json を読み、レッスン・テスト範囲に完全連動した教材を作る。
  - レッスン教材: 切り取りフラッシュカード（TPR命令＋単語）/ 英語4線のなぞり書き / フォニックス /
                 学校テスト対策の書き取り / おうちの人が読むリスニング / 解答と保護者メモ
  - まとめテスト（5回ごと）・ボス戦テスト（30回ごと）: 範囲から出題 + 解答ページ

使い方:
  python3 worksheets/generate_worksheets.py --lesson 1
  python3 worksheets/generate_worksheets.py --test mini --range 1-5
  python3 worksheets/generate_worksheets.py --test boss --range 1-30
  python3 worksheets/generate_worksheets.py --all            # 全レッスン＋全テスト

日本語フォントは IPAexゴシック等の TTF を自動検出して埋め込む（EIGO_JA_FONT で指定可）。
見つからない場合は ReportLab 内蔵 CID フォントにフォールバック（日本語フォントのある環境でのみ表示）。
"""
from __future__ import annotations

import argparse
import json
import os
import random
import sys
from dataclasses import dataclass
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.cidfonts import UnicodeCIDFont
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen.canvas import Canvas

ROOT = Path(__file__).resolve().parent.parent
CURRICULUM = ROOT / "content" / "curriculum" / "lessons.json"
OUT_DIR = Path(__file__).resolve().parent / "out"

# 日本語フォント: 埋め込み可能な TTF を優先（どの環境のビューアでも表示できる）。
# 見つからなければ ReportLab 内蔵 CID フォント（非埋め込み・日本語フォントのある環境でのみ表示）にフォールバック。
FONT_CANDIDATES = [
    os.environ.get("EIGO_JA_FONT", ""),
    str(Path(__file__).resolve().parent / "fonts" / "ipaexg.ttf"),
    "/usr/share/fonts/opentype/ipaexfont-gothic/ipaexg.ttf",
    "/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf",
    "/usr/share/fonts/truetype/fonts-japanese-gothic.ttf",
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
    "/System/Library/Fonts/ヒラギノ角ゴシック W4.ttc",
    "C:/Windows/Fonts/YuGothM.ttc",
    "C:/Windows/Fonts/msgothic.ttc",
]


def register_japanese_font() -> str:
    for path in FONT_CANDIDATES:
        if path and Path(path).exists():
            try:
                pdfmetrics.registerFont(TTFont("JaGothic", path, subfontIndex=0))
                return "JaGothic"
            except Exception:  # noqa: BLE001 - 形式非対応（CFF系OTFなど）は次の候補へ
                continue
    print("[warn] 埋め込み可能な日本語フォントが見つかりません。CIDフォント（非埋め込み）を使用します。"
          " EIGO_JA_FONT=/path/to/ipaexg.ttf を指定すると埋め込みます。", file=sys.stderr)
    pdfmetrics.registerFont(UnicodeCIDFont("HeiseiKakuGo-W5"))
    return "HeiseiKakuGo-W5"


JA = register_japanese_font()
EN = "Helvetica"
EN_BOLD = "Helvetica-Bold"

PAGE_W, PAGE_H = A4
MARGIN = 15 * mm
ACCENT = colors.HexColor("#2a78d6")
COIN = colors.HexColor("#eda100")
INK2 = colors.HexColor("#5a6478")
FOUR_LINE_RED = colors.HexColor("#e34948")

# アプリ側 src/lib/domain/config.ts の CURRICULUM_RULES と同じ値
MINI_EVERY = 5
BOSS_EVERY = 30
MINI_QUESTIONS = 15
BOSS_QUESTIONS = 30


# ---------------------------------------------------------------------------
# データ
# ---------------------------------------------------------------------------
@dataclass
class Item:
    lesson_no: int
    kind: str  # WORD / EXPRESSION / COMMAND / PHONICS
    text: str
    ja: str
    core: bool


def load_curriculum() -> dict:
    return json.loads(CURRICULUM.read_text(encoding="utf-8"))


def items_of(lesson: dict) -> list[Item]:
    n = lesson["lessonNo"]
    out = [Item(n, "WORD", v["en"], v["ja"], bool(v.get("core"))) for v in lesson["vocab"]]
    out += [Item(n, "EXPRESSION", e["en"], e["ja"], bool(e.get("core"))) for e in lesson["school"]["expressions"]]
    out += [Item(n, "COMMAND", c["en"], c["ja"], False) for c in lesson["tpr"]]
    out += [Item(n, "PHONICS", w, lesson["phonics"]["tipJa"], False) for w in lesson["phonics"]["words"]]
    return out


# ---------------------------------------------------------------------------
# 描画ヘルパ
# ---------------------------------------------------------------------------
class Sheet:
    def __init__(self, path: Path, title: str):
        path.parent.mkdir(parents=True, exist_ok=True)
        self.c = Canvas(str(path), pagesize=A4)
        self.c.setTitle(title)
        self.c.setAuthor("Eigo Quest")
        self.y = PAGE_H - MARGIN
        self.page_no = 0

    # --- 基本 ---
    def text(self, x, y, s, size=11, font=None, color=colors.black):
        font = font or (EN if s.isascii() else JA)
        self.c.setFont(font, size)
        self.c.setFillColor(color)
        self.c.drawString(x, y, s)

    def need(self, h):
        if self.y - h < MARGIN + 10 * mm:
            self.new_page()

    def new_page(self, header: str | None = None):
        if self.page_no > 0:
            self.footer()
            self.c.showPage()
        self.page_no += 1
        self.y = PAGE_H - MARGIN
        if header:
            self.header(header)

    def footer(self):
        self.c.setFont(JA, 8)
        self.c.setFillColor(INK2)
        self.c.drawCentredString(PAGE_W / 2, 9 * mm, f"Eigo Quest  —  {self.page_no}")

    def header(self, title: str, sub: str = "", with_name=True):
        c = self.c
        c.setFillColor(ACCENT)
        c.roundRect(MARGIN, self.y - 16 * mm, PAGE_W - 2 * MARGIN, 16 * mm, 4 * mm, fill=1, stroke=0)
        self.text(MARGIN + 5 * mm, self.y - 10.5 * mm, title, 16, JA, colors.white)
        if sub:
            self.text(MARGIN + 5 * mm, self.y - 14.5 * mm, sub, 8, JA, colors.white)
        self.y -= 20 * mm
        if with_name:
            self.text(MARGIN, self.y, "なまえ", 10)
            c.setStrokeColor(INK2)
            c.line(MARGIN + 14 * mm, self.y - 1.5 * mm, MARGIN + 80 * mm, self.y - 1.5 * mm)
            self.text(MARGIN + 95 * mm, self.y, "日づけ　　　月　　　日", 10)
            self.text(PAGE_W - MARGIN - 32 * mm, self.y, "てんすう　　　／", 10)
            self.y -= 9 * mm

    def section(self, title: str, note: str = ""):
        self.need(20 * mm)
        self.c.setFillColor(COIN)
        self.c.circle(MARGIN + 2.5 * mm, self.y + 1.2 * mm, 2.5 * mm, fill=1, stroke=0)
        self.text(MARGIN + 7 * mm, self.y, title, 12.5, JA)
        if note:
            self.text(MARGIN + 7 * mm, self.y - 5 * mm, note, 8.5, JA, INK2)
            self.y -= 5 * mm
        self.y -= 8 * mm

    def four_lines(self, x, y_top, width, trace: str | None = None, height=12 * mm, trace_size=None):
        """英語の4線。3本目（ベースライン）は赤。trace があれば灰色のなぞり文字を置く。"""
        c = self.c
        gap = height / 3
        for i in range(4):
            yy = y_top - i * gap
            c.setLineWidth(0.6 if i in (0, 3) else (0.8 if i == 2 else 0.4))
            c.setStrokeColor(FOUR_LINE_RED if i == 2 else INK2)
            if i == 1:
                c.setDash(2, 2)
            c.line(x, yy, x + width, yy)
            c.setDash()
        if trace:
            size = trace_size or gap * 2.6
            c.setFont(EN, size)
            c.setFillColor(colors.HexColor("#b9c0cc"))
            c.drawString(x + 2 * mm, y_top - 2 * gap + 0.3, trace)

    def picture_box(self, x, y, w, h, label="えを かこう"):
        c = self.c
        c.setStrokeColor(colors.HexColor("#c9d1de"))
        c.setDash(3, 2)
        c.roundRect(x, y, w, h, 2 * mm)
        c.setDash()
        c.setFont(JA, 7)
        c.setFillColor(colors.HexColor("#9aa3b2"))
        c.drawCentredString(x + w / 2, y + h / 2 - 2, label)

    def save(self):
        self.footer()
        self.c.save()


# ---------------------------------------------------------------------------
# レッスン教材
# ---------------------------------------------------------------------------
def flashcard_page(s: Sheet, lesson: dict):
    """切り取り用フラッシュカード（2列×4段）。Session 1 は Look / Stop / Come here / Go が先頭。"""
    n = lesson["lessonNo"]
    s.new_page()
    s.header(f"Session {n}  フラッシュカード", f"{lesson['title']} ／ 点線で切ってカードにしよう。おうちでも「Look!」「Stop!」ゲーム！", with_name=False)
    cards = [(t["en"], t["ja"], "うごき: " + t["action"], True) for t in lesson["tpr"]]
    cards += [(v["en"], v["ja"], "", False) for v in lesson["vocab"]]
    cols, rows = 2, 4
    cw = (PAGE_W - 2 * MARGIN) / cols
    ch = (s.y - MARGIN - 8 * mm) / rows
    for idx, (en, ja, note, is_cmd) in enumerate(cards[: cols * rows]):
        col, row = idx % cols, idx // cols
        x = MARGIN + col * cw
        y = s.y - (row + 1) * ch
        c = s.c
        c.setStrokeColor(colors.HexColor("#9aa3b2"))
        c.setDash(4, 3)
        c.rect(x, y, cw, ch)
        c.setDash()
        if is_cmd:
            c.setFillColor(COIN)
            c.roundRect(x + 4 * mm, y + ch - 9 * mm, 22 * mm, 6 * mm, 2 * mm, fill=1, stroke=0)
            s.text(x + 6 * mm, y + ch - 7.4 * mm, "TPR めいれい", 7, JA, colors.white)
        s.picture_box(x + cw / 2 - 22 * mm, y + ch * 0.42, 44 * mm, ch * 0.42)
        size = 26 if len(en) <= 10 else 18
        c.setFont(EN_BOLD, size)
        c.setFillColor(colors.black)
        c.drawCentredString(x + cw / 2, y + ch * 0.22, en)
        c.setFont(JA, 10)
        c.setFillColor(INK2)
        c.drawCentredString(x + cw / 2, y + ch * 0.1, ja + (f"（{note[4:]}）" if note else ""))
    s.y = MARGIN


def lesson_worksheet(lesson: dict, out: Path):
    n = lesson["lessonNo"]
    s = Sheet(out, f"Eigo Quest Session {n} ワークシート")
    items = items_of(lesson)

    # ---- p1: フラッシュカード ----
    flashcard_page(s, lesson)

    # ---- p2: ワーク ----
    s.new_page()
    s.header(f"Session {n}  {lesson['titleJa']}", f"学校: {lesson['school']['grade']}「{lesson['school']['topic']}」 ／ フォニックス: {' '.join(lesson['phonics']['focus'])}")

    s.section("1. なぞって かこう", "灰色の文字をなぞってから、となりに自分で書こう。3本目の赤い線に文字をのせるよ。")
    # A4 1枚に収まる量に絞る（TPR命令を優先 → 学校頻出の単語）
    words = ([i for i in items if i.kind == "COMMAND"][:2] + sorted([i for i in items if i.kind == "WORD"], key=lambda x: not x.core))[:4]
    half = (PAGE_W - 2 * MARGIN - 6 * mm) / 2
    for w in words:
        s.need(15 * mm)
        s.text(MARGIN, s.y - 6 * mm, w.ja, 8.5, JA, INK2)
        s.four_lines(MARGIN + 22 * mm, s.y, half - 22 * mm, trace=w.text)
        s.four_lines(MARGIN + half + 6 * mm, s.y, half)
        s.y -= 15 * mm

    s.section("2. フォニックス：さいしょの音に ○ をつけよう", "おうちの人が単語を読みます（こたえのページ参照）。" + lesson["phonics"]["tipJa"])
    rng = random.Random(n)
    pool = list("satpinmdgockeurhbfl")
    phon = lesson["phonics"]["words"][:3]
    for i, w in enumerate(phon):
        s.need(11 * mm)
        opts = sorted({w[0], *rng.sample([p for p in pool if p != w[0]], 2)})
        rng.shuffle(opts)
        x = MARGIN + 4 * mm
        s.text(x, s.y, f"({i + 1})", 11, EN)
        s.picture_box(x + 10 * mm, s.y - 3 * mm, 24 * mm, 10 * mm, "おとを きこう")
        for k, o in enumerate(opts):
            s.text(x + 45 * mm + k * 22 * mm, s.y, o, 20, EN_BOLD)
        s.y -= 12 * mm

    s.section("3. がっこうの テストに チャレンジ", "日本語に合う英語を書こう。文のはじめは大文字、さいごは「.」か「?」。")
    exprs = sorted([i for i in items if i.kind == "EXPRESSION"], key=lambda x: not x.core)[:2]
    for i, e in enumerate(exprs):
        s.need(20 * mm)
        s.text(MARGIN + 4 * mm, s.y, f"({i + 1}) {e.ja}", 10.5, JA)
        s.text(PAGE_W - MARGIN - 40 * mm, s.y, f"ヒント: {e.text.split()[0][0]} で はじまるよ", 8, JA, INK2)
        s.four_lines(MARGIN + 4 * mm, s.y - 3 * mm, PAGE_W - 2 * MARGIN - 8 * mm)
        s.y -= 18 * mm

    s.need(42 * mm)  # 見出しと絵カードを同じページに
    s.section("4. リスニング（おうちの人が よみあげます）", "よまれた ことばの ばんごうを □ に かこう。よみあげ文は さいごのページにあります。")
    s.need(18 * mm)
    choices = [i for i in items if i.kind == "WORD"][:4]
    bw = (PAGE_W - 2 * MARGIN) / max(1, len(choices))
    for k, ch in enumerate(choices):
        x = MARGIN + k * bw
        s.picture_box(x + 3 * mm, s.y - 12 * mm, bw - 6 * mm, 14 * mm, ch.ja)
        s.c.setStrokeColor(colors.black)
        s.c.rect(x + bw / 2 - 4 * mm, s.y - 20 * mm, 8 * mm, 6 * mm)
    s.y -= 26 * mm

    # ---- p3: 解答・保護者メモ ----
    s.new_page()
    s.header(f"Session {n}  こたえ・おうちの方へ", "", with_name=False)
    s.section("こたえ")
    for i, w in enumerate(phon):
        s.text(MARGIN + 6 * mm, s.y, f"2-({i + 1})  {w} → {w[0]}", 10.5, EN)
        s.y -= 6 * mm
    for i, e in enumerate(exprs):
        s.text(MARGIN + 6 * mm, s.y, f"3-({i + 1})  {e.text}", 10.5, EN)
        s.y -= 6 * mm
    s.y -= 4 * mm
    s.section("4. よみあげ文（ゆっくり2回ずつ）")
    order = choices[:]
    random.Random(n * 7).shuffle(order)
    for i, ch in enumerate(order):
        pos = choices.index(ch) + 1
        s.text(MARGIN + 6 * mm, s.y, f"({i + 1})  “{ch.text}”   → こたえ: 左から{pos}ばんめ", 10.5, JA)
        s.y -= 6 * mm
    s.y -= 4 * mm
    s.section("学校のテストで ねらわれるポイント")
    for t in lesson["school"]["testPoints"]:
        s.text(MARGIN + 6 * mm, s.y, "・" + t, 10.5, JA)
        s.y -= 6 * mm
    s.y -= 4 * mm
    s.section("TPR（からだで おぼえる）あそびかた")
    for t in lesson["tpr"]:
        s.text(MARGIN + 6 * mm, s.y, f"・{t['en']}（{t['ja']}）… {t['action']}", 10.5, JA)
        s.y -= 6 * mm
    s.text(MARGIN + 6 * mm, s.y - 2 * mm, "おうちの人が英語で命令 → 子どもが動く。慣れたらスピードアップ！（アプリのスピードリスニングと連動）", 9, JA, INK2)
    s.save()


# ---------------------------------------------------------------------------
# まとめテスト / ボス戦テスト
# ---------------------------------------------------------------------------
def test_worksheet(kind: str, start: int, end: int, lessons: list[dict], out: Path):
    pool = [it for l in lessons if start <= l["lessonNo"] <= end for it in items_of(l)]
    total = MINI_QUESTIONS if kind == "mini" else BOSS_QUESTIONS
    rng = random.Random(f"{kind}-{start}-{end}")
    label = "まとめテスト" if kind == "mini" else "ボス戦 総まとめテスト"
    s = Sheet(out, f"Eigo Quest {label} {start}-{end}")
    s.new_page()
    s.header(f"{label}  Lesson {start}〜{end}", "アプリのテストと同じ範囲・同じルールで出題。ごうかくライン 80%（ボスは75%）")

    words = [i for i in pool if i.kind == "WORD"]
    exprs = [i for i in pool if i.kind == "EXPRESSION" and i.core]
    phon = [i for i in pool if i.kind == "PHONICS"]
    cmds = [i for i in pool if i.kind == "COMMAND"]

    n_match = min(len(words), max(3, total // 4))
    n_spell = min(len([w for w in words if w.core]), max(3, total // 4))
    n_expr = min(len(exprs), max(2, total // 5))
    n_phon = min(len(phon), max(2, total // 6))
    n_cmd = max(0, min(len(cmds), total - n_match - n_spell - n_expr - n_phon))
    answers: list[str] = []
    q = 0

    # A. 単語と意味を線でむすぶ
    s.section("A. 英語と日本語を 線で むすぼう")
    sel = rng.sample(words, n_match)
    right = sel[:]
    rng.shuffle(right)
    for i, w in enumerate(sel):
        s.need(9 * mm)
        q += 1
        s.text(MARGIN + 8 * mm, s.y, f"{q}. {w.text}", 12, EN)
        s.c.circle(MARGIN + 60 * mm, s.y + 1.2 * mm, 1.2 * mm, fill=1)
        s.c.circle(MARGIN + 110 * mm, s.y + 1.2 * mm, 1.2 * mm, fill=1)
        s.text(MARGIN + 115 * mm, s.y, f"{chr(65 + i)}. {right[i].ja}", 11, JA)
        answers.append(f"{q}. {w.text} — {chr(65 + right.index(w))}（{w.ja}）")
        s.y -= 9 * mm

    # B. スペル（4線）
    s.section("B. 日本語を 英語で かこう（つづりに 気をつけて）")
    for w in rng.sample([w for w in words if w.core], n_spell):
        s.need(15 * mm)
        q += 1
        s.text(MARGIN + 4 * mm, s.y - 6 * mm, f"{q}. {w.ja}", 10.5, JA)
        s.four_lines(MARGIN + 45 * mm, s.y, 80 * mm)
        answers.append(f"{q}. {w.text}")
        s.y -= 15 * mm

    # C. 学校テスト形式（記号選択）
    s.section("C. 日本語に あう 英文を えらんで ○ をつけよう")
    for e in rng.sample(exprs, n_expr):
        s.need(22 * mm)
        q += 1
        others = [x for x in pool if x.kind == "EXPRESSION" and x.text != e.text]
        opts = [e] + rng.sample(others, min(2, len(others)))
        rng.shuffle(opts)
        s.text(MARGIN + 4 * mm, s.y, f"{q}. {e.ja}", 10.5, JA)
        s.y -= 6 * mm
        for k, o in enumerate(opts):
            s.text(MARGIN + 12 * mm, s.y, "アイウ"[k], 11, JA)
            s.text(MARGIN + 20 * mm, s.y, o.text, 11, EN)
            s.y -= 5.5 * mm
        answers.append(f"{q}. {'アイウ'[opts.index(e)]}  {e.text}")
        s.y -= 2 * mm

    # D. フォニックス
    s.section("D. 単語の さいしょの 文字を かこう（おうちの人が読みます）")
    for p in rng.sample(phon, n_phon):
        s.need(12 * mm)
        q += 1
        s.text(MARGIN + 4 * mm, s.y, f"{q}.", 11, EN)
        s.four_lines(MARGIN + 14 * mm, s.y + 6 * mm, 14 * mm)
        s.text(MARGIN + 32 * mm, s.y, "_" * (len(p.text) - 1), 16, EN)
        answers.append(f"{q}. {p.text}（よみあげ）→ {p.text[0]}")
        s.y -= 12 * mm

    # E. TPR リスニング
    if n_cmd:
        s.section("E. めいれいを 聞いて、あう 日本語の 記号を かこう（おうちの人が読みます）")
        for cmd in rng.sample(cmds, n_cmd):
            s.need(9 * mm)
            q += 1
            s.text(MARGIN + 4 * mm, s.y, f"{q}.  （　　）", 11, JA)
            answers.append(f"{q}. “{cmd.text}” → {cmd.ja}")
            s.y -= 8 * mm
        s.need(10 * mm)
        s.text(MARGIN + 4 * mm, s.y, "えらぶ日本語は解答ページの「よみあげ」を参考に、おうちの人が3択で提示してください。", 8.5, JA, INK2)
        s.y -= 8 * mm

    # 解答
    s.new_page()
    s.header(f"{label} {start}〜{end}  こたえ・よみあげ", f"全{q}問 ／ ごうかく {int(q * (0.8 if kind == 'mini' else 0.75) + 0.999)}問以上", with_name=False)
    col_w = (PAGE_W - 2 * MARGIN) / 2
    y0 = s.y
    for i, a in enumerate(answers):
        col = 0 if i < (len(answers) + 1) // 2 else 1
        row = i if col == 0 else i - (len(answers) + 1) // 2
        s.text(MARGIN + col * col_w, y0 - row * 6.5 * mm, a, 9.5, JA if not a.isascii() else EN)
    s.save()


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser(description="Eigo Quest A4ワークシート生成")
    ap.add_argument("--lesson", type=int, help="レッスン番号（Session）")
    ap.add_argument("--test", choices=["mini", "boss"], help="テスト種別")
    ap.add_argument("--range", help="テスト範囲 例: 1-5, 1-30")
    ap.add_argument("--all", action="store_true", help="全レッスン＋全テストを生成")
    ap.add_argument("--out", type=Path, default=OUT_DIR)
    args = ap.parse_args()

    data = load_curriculum()
    lessons = data["lessons"]
    by_no = {l["lessonNo"]: l for l in lessons}
    made: list[Path] = []

    def do_lesson(n: int):
        p = args.out / "lessons" / f"session-{n:03d}.pdf"
        lesson_worksheet(by_no[n], p)
        made.append(p)

    def do_test(kind: str, a: int, b: int):
        p = args.out / "tests" / f"{kind}-{a}-{b}.pdf"
        test_worksheet(kind, a, b, lessons, p)
        made.append(p)

    if args.all:
        for n in by_no:
            do_lesson(n)
        last = max(by_no)
        for end in range(MINI_EVERY, last + 1, MINI_EVERY):
            if end % BOSS_EVERY == 0:
                do_test("boss", 1, end)
            else:
                do_test("mini", end - MINI_EVERY + 1, end)
    elif args.lesson:
        do_lesson(args.lesson)
    elif args.test and args.range:
        a, b = map(int, args.range.split("-"))
        do_test(args.test, a, b)
    else:
        ap.error("--lesson / --test + --range / --all のいずれかを指定してください")

    for p in made:
        print(p.relative_to(ROOT))


if __name__ == "__main__":
    main()
