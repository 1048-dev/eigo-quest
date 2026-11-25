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
  python3 worksheets/generate_worksheets.py --month --world 1  # 月間まとめ（1ワールド＝約1か月、表紙・よていひょう・こたえつき）
  python3 worksheets/generate_worksheets.py --month --all      # 12ワールド分の 月間まとめ
  （npm run worksheets:month -- --world 1 ／ npm run worksheets:month -- --all）

日本語フォントは IPAexゴシック等の TTF を自動検出して埋め込む（EIGO_JA_FONT で指定可）。
見つからない場合は ReportLab 内蔵 CID フォントにフォールバック（日本語フォントのある環境でのみ表示）。
"""
from __future__ import annotations

import argparse
import json
import os
import random
import re
import sys
from io import BytesIO
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


def load_world_names() -> dict[int, str]:
    """ワールド名は src/lib/game/worlds.ts がただ1つのもと。そこから読む。"""
    src = (ROOT / "src" / "lib" / "game" / "worlds.ts").read_text(encoding="utf-8")
    block = src.split("WORLD_NAMES", 1)[1].split("};", 1)[0]
    return {int(k): v for k, v in re.findall(r'(\d+):\s*"([^"]+)"', block)}


NO_LINE_START = set("、。，．）」』】！？!?)・ーっゃゅょァィゥェォッャュョ")


def wrap_text(s: str, font: str, size: float, width: float) -> list[str]:
    """1文字ずつ幅をはかって折り返す（日本語向け。英単語の途中では なるべく切らない）。"""
    lines: list[str] = []
    cur = ""
    for ch in s:
        # 行頭禁則: 句読点・閉じかっこは 少しはみ出しても 前の行に つける
        if pdfmetrics.stringWidth(cur + ch, font, size) <= width or (ch in NO_LINE_START and cur):
            cur += ch
            continue
        # 英単語の途中なら、直前の空白で切る
        cut = cur.rfind(" ")
        if ch != " " and cur and cur[-1].isascii() and cur[-1].isalnum() and cut > 0:
            lines.append(cur[:cut])
            cur = cur[cut + 1:] + ch
        else:
            lines.append(cur)
            cur = ch.lstrip()
    if cur:
        lines.append(cur)
    return lines


def fit_text(s: str, font: str, size: float, width: float) -> str:
    """幅に入らなければ「…」で切る。"""
    if pdfmetrics.stringWidth(s, font, size) <= width:
        return s
    while s and pdfmetrics.stringWidth(s + "…", font, size) > width:
        s = s[:-1]
    return s + "…"


# ---------------------------------------------------------------------------
# 描画ヘルパ
# ---------------------------------------------------------------------------
class Sheet:
    def __init__(self, target, title: str, footer_label: str = "Eigo Quest", total_pages: int | None = None):
        """target: 出力先パス、または BytesIO（ページ数をはかる下書き用）。"""
        if isinstance(target, Path):
            target.parent.mkdir(parents=True, exist_ok=True)
            target = str(target)
        self.c = Canvas(target, pagesize=A4)
        self.c.setTitle(title)
        self.c.setAuthor("Eigo Quest")
        self.y = PAGE_H - MARGIN
        self.page_no = 0
        self.footer_label = footer_label
        self.total_pages = total_pages
        # need() で自動改ページしたときに出す見出し（None なら出さない）
        self.cont_header: str | None = None

    # --- 基本 ---
    def text(self, x, y, s, size=11, font=None, color=colors.black):
        font = font or (EN if s.isascii() else JA)
        self.c.setFont(font, size)
        self.c.setFillColor(color)
        self.c.drawString(x, y, s)

    def need(self, h):
        if self.y - h < MARGIN + 10 * mm:
            self.new_page()
            if self.cont_header:
                self.header(self.cont_header, with_name=False)

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
        no = f"{self.page_no} / {self.total_pages}" if self.total_pages else f"{self.page_no}"
        self.c.drawCentredString(PAGE_W / 2, 9 * mm, f"{self.footer_label}  —  {no}")

    def wrapped(self, x, s, size=10, width=None, color=colors.black, line_h=None):
        """日本語まじりの文を幅で折り返して書き、self.y を進める。"""
        width = width or (PAGE_W - MARGIN - x)
        line_h = line_h or size * 1.55
        for line in wrap_text(s, JA, size, width):
            self.need(line_h)
            self.text(x, self.y, line, size, JA, color)
            self.y -= line_h

    def header(self, title: str, sub: str = "", with_name=True):
        c = self.c
        c.setFillColor(ACCENT)
        c.roundRect(MARGIN, self.y - 16 * mm, PAGE_W - 2 * MARGIN, 16 * mm, 4 * mm, fill=1, stroke=0)
        inner = PAGE_W - 2 * MARGIN - 10 * mm
        self.text(MARGIN + 5 * mm, self.y - 10.5 * mm, fit_text(title, JA, 16, inner), 16, JA, colors.white)
        if sub:
            self.text(MARGIN + 5 * mm, self.y - 14.5 * mm, fit_text(sub, JA, 8, inner), 8, JA, colors.white)
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
            for line in wrap_text(note, JA, 8.5, PAGE_W - 2 * MARGIN - 7 * mm):
                self.text(MARGIN + 7 * mm, self.y - 5 * mm, line, 8.5, JA, INK2)
                self.y -= 4.2 * mm
            self.y -= 0.8 * mm
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
        while size > 10 and pdfmetrics.stringWidth(en, EN_BOLD, size) > cw - 8 * mm:
            size -= 1
        c.setFont(EN_BOLD, size)
        c.setFillColor(colors.black)
        c.drawCentredString(x + cw / 2, y + ch * 0.22, en)
        c.setFillColor(INK2)
        line = ja + (f"（{note[4:]}）" if note else "")
        if pdfmetrics.stringWidth(line, JA, 10) <= cw - 6 * mm:
            c.setFont(JA, 10)
            c.drawCentredString(x + cw / 2, y + ch * 0.1, line)
        else:  # 長い うごきの説明は 2行目に小さく
            c.setFont(JA, 10)
            c.drawCentredString(x + cw / 2, y + ch * 0.12, fit_text(ja, JA, 10, cw - 6 * mm))
            c.setFont(JA, 7.5)
            c.drawCentredString(x + cw / 2, y + ch * 0.12 - 4.2 * mm, fit_text(f"（{note[4:]}）" if note else "", JA, 7.5, cw - 6 * mm))
    s.y = MARGIN


@dataclass
class LessonKey:
    """レッスン教材の こたえ（解答ページを あとで まとめて書くために持ち回す）"""
    phon: list[str]
    exprs: list[Item]
    choices: list[Item]


def lesson_worksheet(lesson: dict, out: Path):
    n = lesson["lessonNo"]
    s = Sheet(out, f"Eigo Quest Session {n} ワークシート")
    key = lesson_student_pages(s, lesson)
    # ---- p3: 解答・保護者メモ ----
    s.new_page()
    s.header(f"Session {n}  こたえ・おうちの方へ", "", with_name=False)
    lesson_answer_block(s, lesson, key, compact=False)
    s.save()


def lesson_student_pages(s: Sheet, lesson: dict) -> LessonKey:
    """子どもが使うページ（フラッシュカード＋ワーク）を書き、こたえを返す。"""
    n = lesson["lessonNo"]
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
    return LessonKey(phon, exprs, choices)


def lesson_answer_block(s: Sheet, lesson: dict, key: LessonKey, compact: bool):
    """こたえ・よみあげ文・保護者メモ。compact=True は月間まとめ用（見出し1行＋詰めた行間で流し込む）。"""
    n = lesson["lessonNo"]
    phon, exprs, choices = key.phon, key.exprs, key.choices
    order = choices[:]
    random.Random(n * 7).shuffle(order)
    x = MARGIN + 6 * mm
    lh = 5 * mm if compact else 6 * mm
    size = 9.5 if compact else 10.5

    if compact:
        rows = len(phon) + len(exprs) + len(order) + len(lesson["school"]["testPoints"]) + len(lesson["tpr"]) + 5
        s.need(min(rows * lh + 12 * mm, 120 * mm))
        s.c.setFillColor(colors.HexColor("#e8f0fb"))
        s.c.roundRect(MARGIN, s.y - 2.2 * mm, PAGE_W - 2 * MARGIN, 7.5 * mm, 2 * mm, fill=1, stroke=0)
        s.text(MARGIN + 3 * mm, s.y, f"Session {n}  {lesson['titleJa']}", 11, JA, ACCENT)
        s.y -= 9 * mm
        s.need(lh * 3)
        s.text(x, s.y, "こたえ", size, JA, INK2)
        s.y -= lh
        ans = [f"2-({i + 1}) {w} → {w[0]}" for i, w in enumerate(phon)]
        ans += [f"3-({i + 1}) {e.text}" for i, e in enumerate(exprs)]
        s.wrapped(x + 4 * mm, "    ".join(ans), size, line_h=lh)
        s.need(lh * 2)
        s.text(x, s.y, "4. よみあげ文（ゆっくり2回ずつ）", size, JA, INK2)
        s.y -= lh
        reads = [f"({i + 1}) “{ch.text}” → {choices.index(ch) + 1}" for i, ch in enumerate(order)]
        s.wrapped(x + 4 * mm, "   ".join(reads) + "   （数字は 左から なんばんめ か）", size, line_h=lh)
        s.need(lh * 2)
        s.text(x, s.y, "テストの ねらいめ", size, JA, INK2)
        s.y -= lh
        s.wrapped(x + 4 * mm, " ／ ".join(lesson["school"]["testPoints"]), size, line_h=lh)
        s.need(lh * 2)
        s.text(x, s.y, "TPR あそび", size, JA, INK2)
        s.y -= lh
        s.wrapped(x + 4 * mm, " ／ ".join(f"{t['en']}（{t['ja']}）… {t['action']}" for t in lesson["tpr"]), size, line_h=lh)
        s.y -= 3 * mm
        return

    s.section("こたえ")
    for i, w in enumerate(phon):
        s.text(x, s.y, f"2-({i + 1})  {w} → {w[0]}", size, JA)
        s.y -= lh
    for i, e in enumerate(exprs):
        s.text(x, s.y, f"3-({i + 1})  {e.text}", size, EN)
        s.y -= lh
    s.y -= 4 * mm
    s.section("4. よみあげ文（ゆっくり2回ずつ）")
    for i, ch in enumerate(order):
        pos = choices.index(ch) + 1
        s.text(x, s.y, f"({i + 1})  “{ch.text}”   → こたえ: 左から{pos}ばんめ", size, JA)
        s.y -= lh
    s.y -= 4 * mm
    s.section("学校のテストで ねらわれるポイント")
    for t in lesson["school"]["testPoints"]:
        s.wrapped(x, "・" + t, size, line_h=lh)
    s.y -= 4 * mm
    s.section("TPR（からだで おぼえる）あそびかた")
    for t in lesson["tpr"]:
        s.wrapped(x, f"・{t['en']}（{t['ja']}）… {t['action']}", size, line_h=lh)
    s.text(x, s.y - 2 * mm, "おうちの人が英語で命令 → 子どもが動く。慣れたらスピードアップ！（アプリのスピードリスニングと連動）", 9, JA, INK2)


# ---------------------------------------------------------------------------
# まとめテスト / ボス戦テスト
# ---------------------------------------------------------------------------
def test_label(kind: str) -> str:
    return "まとめテスト" if kind == "mini" else "ボス戦 総まとめテスト"


def test_worksheet(kind: str, start: int, end: int, lessons: list[dict], out: Path):
    s = Sheet(out, f"Eigo Quest {test_label(kind)} {start}-{end}")
    answers = test_question_pages(s, kind, start, end, lessons)
    s.new_page()
    test_answer_block(s, kind, start, end, answers, compact=False)
    s.save()


def test_question_pages(s: Sheet, kind: str, start: int, end: int, lessons: list[dict]) -> list[str]:
    """問題ページを書き、こたえの行リストを返す。"""
    pool = [it for l in lessons if start <= l["lessonNo"] <= end for it in items_of(l)]
    total = MINI_QUESTIONS if kind == "mini" else BOSS_QUESTIONS
    rng = random.Random(f"{kind}-{start}-{end}")
    label = test_label(kind)
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

    return answers


def test_answer_block(s: Sheet, kind: str, start: int, end: int, answers: list[str], compact: bool):
    """テストのこたえ（2列）。compact=False は見出し帯つきで新しいページの先頭に書く。"""
    label = test_label(kind)
    q = len(answers)
    passing = int(q * (0.8 if kind == "mini" else 0.75) + 0.999)
    rows = (q + 1) // 2
    row_h = 5.5 * mm if compact else 6.5 * mm
    col_w = (PAGE_W - 2 * MARGIN) / 2
    if compact:
        s.need(rows * row_h + 14 * mm)
        s.c.setFillColor(colors.HexColor("#fdf1d6"))
        s.c.roundRect(MARGIN, s.y - 2.2 * mm, PAGE_W - 2 * MARGIN, 7.5 * mm, 2 * mm, fill=1, stroke=0)
        s.text(MARGIN + 3 * mm, s.y, f"{label}  Lesson {start}〜{end}", 11, JA, colors.HexColor("#9a6a00"))
        s.text(PAGE_W - MARGIN - 52 * mm, s.y, f"全{q}問 ／ ごうかく {passing}問以上", 9, JA, INK2)
        s.y -= 9 * mm
    else:
        s.header(f"{label} {start}〜{end}  こたえ・よみあげ", f"全{q}問 ／ ごうかく {passing}問以上", with_name=False)
    y0 = s.y
    for i, a in enumerate(answers):
        col = 0 if i < rows else 1
        row = i if col == 0 else i - rows
        a = fit_text(a, JA, 9.5, col_w - 3 * mm)
        s.text(MARGIN + col * col_w, y0 - row * row_h, a, 9.5, JA if not a.isascii() else EN)
    s.y = y0 - rows * row_h - 4 * mm


# ---------------------------------------------------------------------------
# 月間まとめ（1ワールド＝30レッスン＝約1か月を 1冊の PDF に）
# ---------------------------------------------------------------------------
@dataclass
class BundleLayout:
    """1回目の下書きで はかった ページ番号（表紙の よていひょうに書く）"""
    total: int
    lesson_pages: dict[int, tuple[int, int]]
    test_pages: dict[int, tuple[int, int]]  # テスト直前のレッスン番号 → ページ範囲
    answers_from: int


def gate_after(n: int) -> tuple[str, int, int] | None:
    """レッスン n の後のテスト（アプリの マップと同じ: 30の倍数→ボス 1〜n、5の倍数→まとめ n-4〜n）"""
    if n % BOSS_EVERY == 0:
        return ("boss", 1, n)
    if n % MINI_EVERY == 0:
        return ("mini", n - MINI_EVERY + 1, n)
    return None


def pages_label(r: tuple[int, int] | None) -> str:
    if not r:
        return "p.??"
    return f"p.{r[0]}" if r[0] == r[1] else f"p.{r[0]}〜{r[1]}"


def bundle_cover(s: Sheet, world: int, name: str, wl: list[dict], layout: BundleLayout | None):
    a, b = wl[0]["lessonNo"], wl[-1]["lessonNo"]
    lp = layout.lesson_pages if layout else {}
    tp = layout.test_pages if layout else {}
    ans = f"p.{layout.answers_from}〜{layout.total}" if layout else "p.??〜??"
    lesson_range = f"p.{lp[a][0]}〜{tp[b][1]}" if layout else "p.??〜??"

    # ---- 表紙1: おうちの方へ ----
    s.new_page()
    s.header(f"ワールド{world}「{name}」 1か月ワークブック",
             f"Lesson {a}〜{b}（30回）／ 1日1レッスンで 約1か月 ／ おうちの方へ", with_name=False)
    x = MARGIN + 6 * mm
    s.section("このワークブックについて")
    s.wrapped(x, "アプリ「Eigo Quest」の Lesson " f"{a}〜{b} と まったく同じ ことば・表現で作った 紙の教材です。"
              "1回分は「フラッシュカード 1まい＋ワーク 1まい」。5回ごとに まとめテスト、30回目に ボス戦テストが入っています。"
              "こたえ と よみあげ文は さいごに まとめてあります。", 10)
    grades = sorted({l["school"]["grade"] for l in wl})
    topics: list[str] = []
    for l in wl:
        if l["school"]["topic"] not in topics and not l["school"]["topic"].startswith("まとめ"):
            topics.append(l["school"]["topic"])
    s.y -= 1 * mm
    s.wrapped(x, f"がっこうの めやす: {'・'.join(grades)} ／ テーマ: " + "、".join(topics), 9, color=INK2)
    s.y -= 3 * mm

    s.section("いんさつの しかた")
    for t in [
        "A4・片面で 印刷してください。白黒でも だいじょうぶです。",
        "倍率は「実際のサイズ（100%）」。「ページに合わせる」だと 英語の4線が 小さくなります。",
        f"まとめて 印刷するなら 子ども用は {lesson_range}、おうちの方用の こたえは {ans}（子どもには わたさない）。",
        "毎日 印刷するなら、下の よていひょうの「ページ」だけを ページ指定して 印刷します。",
        "フラッシュカードは 厚めの紙に 印刷すると ながもちします。点線で 切ってください。",
    ]:
        s.wrapped(x, "・" + t, 10)
    s.y -= 3 * mm

    s.section("1日の すすめかた（15〜20分）")
    for i, t in enumerate([
        "アプリで その日の レッスンを する（約25分。紙だけの日が あっても OK）。",
        "フラッシュカードを 切って、TPR あそび（おうちの人が「Look!」→ 子どもが うごく）。",
        "ワークの ページ: なぞり書き → フォニックス → 学校テスト → リスニング。"
        "フォニックスと リスニングは、おうちの人が こたえページの「よみあげ文」を ゆっくり2回 読みます。",
        "こたえ合わせを して、できたら ○ や シールを。まちがいは 責めずに もういちど いっしょに。",
        "5回ごとの まとめテスト（ごうかく 80%）、30回目の ボス戦テスト（ごうかく 75%）は アプリの テストと 同じ範囲です。",
    ]):
        s.wrapped(x, f"{i + 1}. {t}", 10)
    s.y -= 3 * mm

    s.section("ページの みかた")
    for t in [
        "p.1〜2: この あんない と 30日の よていひょう",
        f"{lesson_range}: 子どもが つかう ページ（レッスン と テスト）",
        f"{ans}: こたえ・よみあげ文・学校テストの ねらいめ・TPR あそび（おうちの方用）",
    ]:
        s.wrapped(x, "・" + t, 10)

    # ---- 表紙2: 30日の よていひょう ----
    s.new_page()
    s.header(f"30日の よていひょう（ワールド{world}「{name}」）",
             "おわった日に □ に ✓ を。1日1回が めやすですが、ペースは おうちに あわせて だいじょうぶ。", with_name=False)
    cols = [("", 8), ("日め", 12), ("Lesson", 16), ("ないよう", 78), ("ページ", 26), ("テスト", 40)]
    xs = [MARGIN]
    for _, w in cols:
        xs.append(xs[-1] + w * mm)
    row_h = (s.y - MARGIN - 14 * mm) / (len(wl) + 1)
    row_h = min(row_h, 8 * mm)
    c = s.c
    c.setFillColor(colors.HexColor("#e8f0fb"))
    c.rect(MARGIN, s.y - row_h, xs[-1] - MARGIN, row_h, fill=1, stroke=0)
    for i, (label, _) in enumerate(cols):
        s.text(xs[i] + 1.5 * mm, s.y - row_h + 2.4 * mm, label, 9, JA, INK2)
    s.y -= row_h
    for day, l in enumerate(wl, start=1):
        n = l["lessonNo"]
        top = s.y
        if day % 2 == 0:
            c.setFillColor(colors.HexColor("#f6f8fb"))
            c.rect(MARGIN, top - row_h, xs[-1] - MARGIN, row_h, fill=1, stroke=0)
        base = top - row_h + 2.4 * mm
        c.setStrokeColor(INK2)
        c.setLineWidth(0.6)
        c.rect(xs[0] + 2 * mm, base - 0.6 * mm, 3.6 * mm, 3.6 * mm)
        s.text(xs[1] + 1.5 * mm, base, f"{day}", 9.5, EN)
        s.text(xs[2] + 1.5 * mm, base, f"L{n}", 9.5, EN_BOLD)
        s.text(xs[3] + 1.5 * mm, base, fit_text(l["titleJa"], JA, 9, cols[3][1] * mm - 3 * mm), 9, JA)
        s.text(xs[4] + 1.5 * mm, base, pages_label(lp.get(n)), 9, JA)
        gate = gate_after(n)
        if gate:
            kind, ga, gb = gate
            label = ("まとめ" if kind == "mini" else "ボス戦") + " " + pages_label(tp.get(n))
            s.text(xs[5] + 1.5 * mm, base, label, 9, JA, colors.HexColor("#9a6a00") if kind == "boss" else ACCENT)
        c.setStrokeColor(colors.HexColor("#dde3ec"))
        c.setLineWidth(0.4)
        c.line(MARGIN, top - row_h, xs[-1], top - row_h)
        s.y -= row_h
    s.y -= 5 * mm
    s.text(MARGIN, s.y, f"こたえ・よみあげ文: {ans}（おうちの方用）", 9, JA, INK2)


def bundle_worksheet(world: int, name: str, lessons: list[dict], out: Path) -> int:
    """ワールド1つ分の月間まとめ PDF を作る。ページ番号を表紙に書くため、下書き→本番の2回描く。返り値は総ページ数。"""
    wl = [l for l in lessons if l["world"] == world]
    if not wl:
        raise SystemExit(f"ワールド{world} の レッスンが ありません")
    wl.sort(key=lambda l: l["lessonNo"])
    title = f"Eigo Quest ワールド{world}「{name}」 1か月ワークブック"

    def render(target, layout: BundleLayout | None) -> BundleLayout:
        s = Sheet(target, title, footer_label=f"Eigo Quest  ワールド{world}「{name}」",
                  total_pages=layout.total if layout else None)
        bundle_cover(s, world, name, wl, layout)
        lesson_pages: dict[int, tuple[int, int]] = {}
        test_pages: dict[int, tuple[int, int]] = {}
        keys: dict[int, LessonKey] = {}
        test_answers: dict[int, list[str]] = {}
        for l in wl:
            n = l["lessonNo"]
            first = s.page_no + 1
            keys[n] = lesson_student_pages(s, l)
            lesson_pages[n] = (first, s.page_no)
            gate = gate_after(n)
            if gate:
                first = s.page_no + 1
                test_answers[n] = test_question_pages(s, gate[0], gate[1], gate[2], lessons)
                test_pages[n] = (first, s.page_no)
        # ---- こたえ（おうちの方用）----
        s.new_page()
        answers_from = s.page_no
        s.cont_header = f"こたえ・よみあげ文（ワールド{world} つづき）"
        s.header(f"こたえ・よみあげ文（ワールド{world}「{name}」）",
                 "おうちの方用。フォニックス・リスニングは ここの よみあげ文を ゆっくり2回ずつ 読んでください。", with_name=False)
        for l in wl:
            n = l["lessonNo"]
            lesson_answer_block(s, l, keys[n], compact=True)
            gate = gate_after(n)
            if gate:
                test_answer_block(s, gate[0], gate[1], gate[2], test_answers[n], compact=True)
        total = s.page_no
        s.save()
        return BundleLayout(total, lesson_pages, test_pages, answers_from)

    draft = render(BytesIO(), None)
    final = render(out, draft)
    if final.total != draft.total or final.lesson_pages != draft.lesson_pages:
        raise SystemExit(f"ワールド{world}: 下書きと本番で ページ数が ちがいます（{draft.total} → {final.total}）")
    return final.total


# ---------------------------------------------------------------------------
# 保護者向け 月間レポート（A4 1ページ）。中身はアプリ側 src/lib/report/monthlyReport.ts が作った JSON
# ---------------------------------------------------------------------------
def progress_report(data: dict, out: Path):
    child = str(data.get("childName", ""))
    month_label = str(data.get("monthLabelJa", ""))
    s = Sheet(out, f"Eigo Quest {month_label}の学習レポート（{child}）", footer_label="Eigo Quest  学習レポート", total_pages=1)
    s.new_page()
    s.header(f"{month_label}の 学習レポート", f"{child} さん  ／  作成日 {data.get('generatedOn', '')}  ／  おうちの方へ", with_name=False)
    c = s.c

    # --- 数字のカード ---
    stats = [
        ("今月のレッスン", f"{data.get('lessonsThisMonth', 0)} 回"),
        ("学習した日", f"{data.get('studyDaysThisMonth', 0)} 日"),
        ("連続日数", f"{data.get('streakDays', 0)} 日"),
        ("最長連続", f"{data.get('longestStreak', 0)} 日"),
    ]
    gap = 4 * mm
    w = (PAGE_W - 2 * MARGIN - gap * 3) / 4
    h = 20 * mm
    top = s.y
    for i, (label, value) in enumerate(stats):
        x = MARGIN + i * (w + gap)
        c.setFillColor(colors.HexColor("#eef4fc"))
        c.roundRect(x, top - h, w, h, 3 * mm, fill=1, stroke=0)
        s.text(x + 4 * mm, top - 6.5 * mm, label, 9, JA, INK2)
        s.text(x + 4 * mm, top - 15.5 * mm, value, 17, JA, ACCENT)
    s.y = top - h - 7 * mm
    s.text(MARGIN, s.y, fit_text(
        f"これまでに {data.get('lessonsDone', 0)} / {data.get('totalLessons', 0)} レッスン　・　合格したテスト（今月） {data.get('testsPassedThisMonth', 0)}　・　"
        f"いまのワールド {data.get('world', '')}「{data.get('worldNameJa', '')}」", JA, 9.5, PAGE_W - 2 * MARGIN), 9.5, JA)
    s.y -= 10 * mm

    # --- 6つの力 ---
    s.section("6つの力の 習得率", f"送信時点の値です（0〜100）。総合 {round(float(data.get('overall', 0)))}%")
    bar_x = MARGIN + 42 * mm
    bar_w = PAGE_W - MARGIN - bar_x - 16 * mm
    for m in data.get("mastery", [])[:6]:
        score = max(0.0, min(100.0, float(m.get("score", 0))))
        s.text(MARGIN + 4 * mm, s.y, fit_text(str(m.get("labelJa", "")), JA, 9.5, 36 * mm), 9.5, JA)
        c.setFillColor(colors.HexColor("#e3e8f0"))
        c.roundRect(bar_x, s.y - 1 * mm, bar_w, 4 * mm, 2 * mm, fill=1, stroke=0)
        if score > 0:
            c.setFillColor(ACCENT if score >= 60 else (COIN if score >= 30 else FOUR_LINE_RED))
            c.roundRect(bar_x, s.y - 1 * mm, max(4 * mm, bar_w * score / 100), 4 * mm, 2 * mm, fill=1, stroke=0)
        s.text(bar_x + bar_w + 3 * mm, s.y, f"{round(score)}", 9.5, EN_BOLD)
        s.y -= 7 * mm
    s.y -= 3 * mm

    # --- にがて ---
    weak_skills = data.get("weakSkills", [])
    weak_items = data.get("weakItems", [])
    s.section("にがて（伸びしろ）")
    if not weak_skills and not weak_items:
        s.wrapped(MARGIN + 4 * mm, "まだ学習の記録が少ないため、にがての判定はこれからです。", 9.5, color=INK2)
    else:
        if weak_skills:
            s.wrapped(MARGIN + 4 * mm, "力: " + "、".join(f"{x.get('labelJa', '')}（{round(float(x.get('score', 0)))}）" for x in weak_skills), 9.5)
        if weak_items:
            words = "　".join(f"{x.get('text', '')}（{x.get('ja', '')}）" for x in weak_items)
            s.wrapped(MARGIN + 4 * mm, "忘れかけの ことば: " + words, 9.5)
    s.y -= 3 * mm

    # --- 来月の予定 ---
    s.section("来月の 予定", f"Lesson {data.get('nextLessonNo')} から" if data.get("nextLessonNo") else "すべてのレッスンを終えました")
    for t in data.get("nextTopics", [])[:6]:
        s.wrapped(MARGIN + 4 * mm, f"・Lesson {t.get('lessonNo')}〜　{t.get('topicJa', '')}（{t.get('titleJa', '')}）", 9.5)
    ph = data.get("nextPhonics", [])
    if ph:
        s.wrapped(MARGIN + 4 * mm, "フォニックス: " + "　".join(str(p) for p in ph[:6]), 9.5)
    s.y -= 3 * mm

    # --- ひとこと ---
    s.section("おうちの方へ")
    s.wrapped(MARGIN + 4 * mm, str(data.get("commentJa", "")), 10)
    s.wrapped(MARGIN + 4 * mm, "同封の「1か月ワークブック」は、いまのワールドのレッスンと連動しています。1日1枚を目安に、アプリのあとで取り組んでください。", 8.5, color=INK2)
    if s.page_no != 1:
        raise SystemExit("レポートが1ページに収まりません")
    s.save()


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser(description="Eigo Quest A4ワークシート生成")
    ap.add_argument("--lesson", type=int, help="レッスン番号（Session）")
    ap.add_argument("--test", choices=["mini", "boss"], help="テスト種別")
    ap.add_argument("--range", help="テスト範囲 例: 1-5, 1-30")
    ap.add_argument("--all", action="store_true", help="全レッスン＋全テストを生成（--month と いっしょなら 12ワールド分の 月間まとめ）")
    ap.add_argument("--month", action="store_true", help="月間まとめ（1ワールド＝30レッスン）モード。--world N か --all と いっしょに")
    ap.add_argument("--world", type=int, help="月間まとめを作る ワールド番号（1〜12）")
    ap.add_argument("--out", type=Path, default=OUT_DIR)
    ap.add_argument("--report-json", type=Path, help="保護者向け月間レポートの JSON（アプリが作る）。--report-out と いっしょに")
    ap.add_argument("--report-out", type=Path, help="月間レポート PDF の出力先ファイル")
    args = ap.parse_args()

    if args.report_json:
        if not args.report_out:
            ap.error("--report-json には --report-out を つけてください")
        progress_report(json.loads(args.report_json.read_text(encoding="utf-8")), args.report_out)
        print(args.report_out)
        return

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

    if args.month or args.world:
        names = load_world_names()
        worlds = sorted({l["world"] for l in lessons}) if args.all else [args.world] if args.world else []
        if not worlds:
            ap.error("--month には --world N か --all を つけてください")
        for w in worlds:
            if w not in names:
                ap.error(f"ワールド{w} は ありません（1〜{max(names)}）")
            p = args.out / "monthly" / f"world-{w:02d}.pdf"
            pages = bundle_worksheet(w, names[w], lessons, p)
            print(f"{p.relative_to(ROOT)}  ({pages} ページ)")
        return

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
