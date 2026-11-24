/**
 * 全イラスト共通の「質感」定義（SVGの <defs>）。layout で1回だけ描画し、各SVGから url(#id) で参照する。
 *
 * 3Dアニメ風に見せるための部品:
 *  - shade-*   : 形の上に重ねる陰影（上から光が当たり、ふちが暗くなる＝立体感・アンビエントオクルージョン風）
 *  - spec-*    : ハイライト（つやのある反射）
 *  - f-drop    : 多層ドロップシャドウ（接地感）
 *  - f-bloom-* : 光のにじみ（ブルーム）
 *  - f-dof-*   : 被写界深度（手前・奥のぼかし）
 *  - f-relief  : 石の彫刻（スペキュラーライティングで凹凸を出す）
 *  - metal-gold: ダークゴールドのメタル
 */
import { ELEMENTS } from "@/lib/game/monsters";

export function ArtDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden focusable="false">
      <defs>
        {/* ---------- 陰影オーバーレイ（どんな色の上にも重ねられる） ---------- */}
        <radialGradient id="shade-sphere" cx="38%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#fff" stopOpacity=".55" />
          <stop offset="35%" stopColor="#fff" stopOpacity=".08" />
          <stop offset="70%" stopColor="#000" stopOpacity=".12" />
          <stop offset="100%" stopColor="#000" stopOpacity=".42" />
        </radialGradient>
        <linearGradient id="shade-cyl" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity=".35" />
          <stop offset="30%" stopColor="#fff" stopOpacity=".05" />
          <stop offset="75%" stopColor="#000" stopOpacity=".15" />
          <stop offset="100%" stopColor="#000" stopOpacity=".4" />
        </linearGradient>
        <linearGradient id="shade-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity=".35" />
          <stop offset="45%" stopColor="#fff" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity=".38" />
        </linearGradient>
        <radialGradient id="spec" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity=".95" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="blush" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff7f8f" stopOpacity=".55" />
          <stop offset="100%" stopColor="#ff7f8f" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ao-floor" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000" stopOpacity=".62" />
          <stop offset="35%" stopColor="#000" stopOpacity=".38" />
          <stop offset="70%" stopColor="#000" stopOpacity=".12" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        {/* 足の真下の濃い接地影（コンタクトシャドウ） */}
        <radialGradient id="ao-contact" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#000" stopOpacity=".85" />
          <stop offset="60%" stopColor="#000" stopOpacity=".35" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        {/* リムライト（逆光）: 形の右のふちに冷たい光、左上に暖かい光 */}
        <linearGradient id="rim-cool" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#9fe6ff" stopOpacity="0" />
          <stop offset="78%" stopColor="#9fe6ff" stopOpacity="0" />
          <stop offset="100%" stopColor="#bdf0ff" stopOpacity=".55" />
        </linearGradient>
        <linearGradient id="rim-warm" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff1c8" stopOpacity=".6" />
          <stop offset="22%" stopColor="#fff1c8" stopOpacity="0" />
        </linearGradient>
        {/* 髪の「天使の輪」（帯状のつや） */}
        <linearGradient id="hair-sheen" x1="0" y1="0" x2="0.25" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="24%" stopColor="#fff" stopOpacity="0" />
          <stop offset="31%" stopColor="#fff" stopOpacity=".34" />
          <stop offset="36%" stopColor="#fff" stopOpacity=".1" />
          <stop offset="42%" stopColor="#fff" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity=".25" />
        </linearGradient>
        {/* 布の陰影（上から光・すそが暗い） */}
        <linearGradient id="cloth-shade" x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity=".22" />
          <stop offset="30%" stopColor="#fff" stopOpacity="0" />
          <stop offset="70%" stopColor="#000" stopOpacity=".1" />
          <stop offset="100%" stopColor="#000" stopOpacity=".38" />
        </linearGradient>
        {/* ゴッドレイ（上ほど明るく、下で消える） */}
        <linearGradient id="ray-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff4cf" stopOpacity="1" />
          <stop offset="60%" stopColor="#fff4cf" stopOpacity=".35" />
          <stop offset="100%" stopColor="#fff4cf" stopOpacity="0" />
        </linearGradient>
        {/* 映画のカラーグレーディング（上は暖色・下はティール） */}
        <linearGradient id="grade-teal-orange" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffb35a" stopOpacity=".16" />
          <stop offset="55%" stopColor="#ffb35a" stopOpacity="0" />
          <stop offset="100%" stopColor="#0b4a52" stopOpacity=".28" />
        </linearGradient>

        {/* ---------- 肌・瞳 ---------- */}
        <radialGradient id="g-skin" cx="40%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#fff5ec" />
          <stop offset="22%" stopColor="#ffe3cb" />
          <stop offset="52%" stopColor="#f8caa6" />
          <stop offset="80%" stopColor="#e9a985" />
          <stop offset="100%" stopColor="#c98262" />
        </radialGradient>
        {/* 肌の陰（右下ほど暖かい影）・皮下散乱（ふちがほんのり赤い） */}
        <radialGradient id="skin-shade" cx="32%" cy="26%" r="92%">
          <stop offset="0%" stopColor="#7a3418" stopOpacity="0" />
          <stop offset="55%" stopColor="#7a3418" stopOpacity="0" />
          <stop offset="82%" stopColor="#7a3418" stopOpacity=".2" />
          <stop offset="100%" stopColor="#5a200c" stopOpacity=".42" />
        </radialGradient>
        <radialGradient id="skin-sss" cx="50%" cy="46%" r="54%">
          <stop offset="0%" stopColor="#ff5a46" stopOpacity="0" />
          <stop offset="68%" stopColor="#ff5a46" stopOpacity="0" />
          <stop offset="100%" stopColor="#ff4a3a" stopOpacity=".24" />
        </radialGradient>
        <linearGradient id="skin-rim" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="84%" stopColor="#fff" stopOpacity="0" />
          <stop offset="100%" stopColor="#ffeed8" stopOpacity=".5" />
        </linearGradient>
        <radialGradient id="eye-white" cx="50%" cy="72%" r="70%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="65%" stopColor="#f6efea" />
          <stop offset="100%" stopColor="#d8c4ba" />
        </radialGradient>
        {/* まぶたが白目に落とす影 */}
        <linearGradient id="eye-lid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a1e0c" stopOpacity=".6" />
          <stop offset="42%" stopColor="#4a1e0c" stopOpacity=".08" />
          <stop offset="60%" stopColor="#4a1e0c" stopOpacity="0" />
        </linearGradient>
        {[["brown", "#ffd08a", "#c27a2a", "#7a3e0c", "#2e1404"], ["green", "#d4ffb0", "#5cc46a", "#23753c", "#0b2e16"], ["violet", "#f0dcff", "#a57af0", "#5a30c0", "#1e0b45"], ["night", "#d4f1ff", "#56b4f0", "#1d58a6", "#081a3d"], ["hazel", "#ffe2a0", "#9a9a3a", "#55602a", "#1f240c"]].map(([n, a, b, c, d]) => (
          <radialGradient key={n} id={`iris-${n}`} cx="50%" cy="66%" r="62%">
            <stop offset="0%" stopColor={a} /><stop offset="35%" stopColor={b} /><stop offset="75%" stopColor={c} /><stop offset="100%" stopColor={d} />
          </radialGradient>
        ))}

        {/* ---------- 髪・服（キャラ別） ---------- */}
        <linearGradient id="g-hair-haru" x1="0" y1="0" x2="0.2" y2="1"><stop offset="0%" stopColor="#a06a3c" /><stop offset="30%" stopColor="#6e4020" /><stop offset="65%" stopColor="#4a2a12" /><stop offset="100%" stopColor="#24120a" /></linearGradient>
        <linearGradient id="g-hair-riko" x1="0" y1="0" x2="0.2" y2="1"><stop offset="0%" stopColor="#ffc787" /><stop offset="30%" stopColor="#ff9a48" /><stop offset="65%" stopColor="#e2681e" /><stop offset="100%" stopColor="#8e350b" /></linearGradient>
        <linearGradient id="g-hair-kiko" x1="0" y1="0" x2="0.2" y2="1"><stop offset="0%" stopColor="#9a7ae0" /><stop offset="30%" stopColor="#6a48b8" /><stop offset="65%" stopColor="#432784" /><stop offset="100%" stopColor="#1a0d3f" /></linearGradient>
        <linearGradient id="g-hair-emma" x1="0" y1="0" x2="0.2" y2="1"><stop offset="0%" stopColor="#d08a52" /><stop offset="30%" stopColor="#a35a2c" /><stop offset="65%" stopColor="#6e3216" /><stop offset="100%" stopColor="#331408" /></linearGradient>
        <linearGradient id="g-bandana" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff8a80" /><stop offset="40%" stopColor="#e8403e" /><stop offset="100%" stopColor="#8e1420" /></linearGradient>
        <linearGradient id="g-vest" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#86d09c" /><stop offset="35%" stopColor="#4e9e68" /><stop offset="70%" stopColor="#2c6a44" /><stop offset="100%" stopColor="#163c26" /></linearGradient>
        <linearGradient id="g-tee" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ffffff" /><stop offset="55%" stopColor="#efe7d8" /><stop offset="100%" stopColor="#c9bca4" /></linearGradient>
        <linearGradient id="g-shorts" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#e8c08a" /><stop offset="40%" stopColor="#bf8e52" /><stop offset="100%" stopColor="#6a4520" /></linearGradient>
        <linearGradient id="g-riko-dress" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ffcf96" /><stop offset="35%" stopColor="#ff9648" /><stop offset="70%" stopColor="#e0641f" /><stop offset="100%" stopColor="#9a3a10" /></linearGradient>
        <linearGradient id="g-kiko-dress" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#e6d6ff" /><stop offset="35%" stopColor="#b694ff" /><stop offset="70%" stopColor="#7c55e0" /><stop offset="100%" stopColor="#40208e" /></linearGradient>
        <linearGradient id="g-kiko-cape" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#5a3ca8" /><stop offset="50%" stopColor="#36207a" /><stop offset="100%" stopColor="#170b3c" /></linearGradient>
        <linearGradient id="g-leggings" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#6a5a90" /><stop offset="45%" stopColor="#3e3060" /><stop offset="100%" stopColor="#1e1632" /></linearGradient>
        <linearGradient id="g-boot" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0%" stopColor="#c07c42" /><stop offset="35%" stopColor="#8a4e22" /><stop offset="75%" stopColor="#4e2a10" /><stop offset="100%" stopColor="#241005" /></linearGradient>
        <linearGradient id="g-emma-jacket" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#5cc0c4" /><stop offset="35%" stopColor="#2a8a92" /><stop offset="70%" stopColor="#1a5e66" /><stop offset="100%" stopColor="#0b3238" /></linearGradient>

        {/* ---------- 相棒ビリモ ---------- */}
        <radialGradient id="g-volt" cx="36%" cy="28%" r="78%"><stop offset="0%" stopColor="#fffbe0" /><stop offset="18%" stopColor="#fff09a" /><stop offset="50%" stopColor="#ffd53a" /><stop offset="82%" stopColor="#f0a510" /><stop offset="100%" stopColor="#b86e00" /></radialGradient>
        <radialGradient id="g-volt-belly" cx="45%" cy="30%" r="80%"><stop offset="0%" stopColor="#fffef6" /><stop offset="60%" stopColor="#fff3c8" /><stop offset="100%" stopColor="#f2d488" /></radialGradient>
        <linearGradient id="g-sky" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#d6f8ff" /><stop offset="30%" stopColor="#7adcff" /><stop offset="60%" stopColor="#2eaee0" /><stop offset="100%" stopColor="#0e5e88" /></linearGradient>
        {/* モンスター共通のリムライト（どの属性の色の上にも重ねる） */}
        <linearGradient id="mon-rim" x1="0" y1="0" x2="1" y2="0.3">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="80%" stopColor="#fff" stopOpacity="0" />
          <stop offset="100%" stopColor="#e8fbff" stopOpacity=".45" />
        </linearGradient>

        {/* ---------- メタル・石・宝石 ---------- */}
        <linearGradient id="metal-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff2b0" /><stop offset="22%" stopColor="#e9b949" /><stop offset="48%" stopColor="#7a4e0c" />
          <stop offset="62%" stopColor="#f2cf6a" /><stop offset="100%" stopColor="#5a3806" />
        </linearGradient>
        <linearGradient id="g-stone" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8f8873" /><stop offset="100%" stopColor="#4d473a" /></linearGradient>
        <linearGradient id="g-stone-warm" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#b59f74" /><stop offset="100%" stopColor="#5e4d31" /></linearGradient>
        {[["emerald", "#b8ffd6", "#22b46c", "#0b4a2b"], ["sapphire", "#c7f0ff", "#2f8fd8", "#0b2f66"], ["ruby", "#ffc2c4", "#e0353d", "#5c0a10"], ["amethyst", "#e9d6ff", "#8a55e8", "#2c0f66"], ["topaz", "#fff3b8", "#f0a81c", "#6b3d00"], ["obsidian", "#9a9a9a", "#3c3a36", "#121110"]].map(([n, a, b, c]) => (
          <radialGradient key={n} id={`gem-${n}`} cx="35%" cy="28%" r="80%">
            <stop offset="0%" stopColor={a} /><stop offset="45%" stopColor={b} /><stop offset="100%" stopColor={c} />
          </radialGradient>
        ))}
        <radialGradient id="g-magic" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff6c8" stopOpacity=".95" /><stop offset="40%" stopColor="#ffd23f" stopOpacity=".45" /><stop offset="100%" stopColor="#ffd23f" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="g-teal-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#8ff5e6" stopOpacity=".8" /><stop offset="100%" stopColor="#1fb5a0" stopOpacity="0" />
        </radialGradient>

        {/* ---------- モンスターの属性ごとの色（体の陰影・オーラ・光る目） ---------- */}
        {ELEMENTS.map((e) => (
          <g key={e.id}>
            <radialGradient id={`el-${e.id}-body`} cx="36%" cy="28%" r="80%">
              <stop offset="0%" stopColor={e.light} /><stop offset="42%" stopColor={e.main} /><stop offset="100%" stopColor={e.dark} />
            </radialGradient>
            <linearGradient id={`el-${e.id}-wing`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={e.main} stopOpacity=".95" /><stop offset="100%" stopColor={e.dark} stopOpacity=".9" />
            </linearGradient>
            <radialGradient id={`el-${e.id}-aura`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={e.glow} stopOpacity=".75" /><stop offset="55%" stopColor={e.glow} stopOpacity=".22" /><stop offset="100%" stopColor={e.glow} stopOpacity="0" />
            </radialGradient>
            {/* 白っぽい毛なみ（ユニコーン・鷲の頭）: 白 → 属性の淡い色 → 属性の色 */}
            <radialGradient id={`el-${e.id}-pale`} cx="36%" cy="26%" r="85%">
              <stop offset="0%" stopColor="#ffffff" /><stop offset="45%" stopColor={e.light} /><stop offset="100%" stopColor={e.main} />
            </radialGradient>
          </g>
        ))}
        {/* 獅子の毛なみ（レオ・グリフォンの後ろ半分） */}
        <radialGradient id="g-tawny" cx="36%" cy="26%" r="85%">
          <stop offset="0%" stopColor="#ffe9bf" /><stop offset="40%" stopColor="#dcae6c" /><stop offset="80%" stopColor="#a26e34" /><stop offset="100%" stopColor="#5e3a16" />
        </radialGradient>
        {/* 精霊の衣: 下に向かって 透けて消える */}
        <linearGradient id="mon-fade-g" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" /><stop offset="62%" stopColor="#fff" stopOpacity=".85" /><stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="mon-fade" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" x="-20" y="-20" width="140" height="140">
          <rect x="-20" y="-20" width="140" height="120" fill="url(#mon-fade-g)" />
        </mask>
        <linearGradient id="metal-platinum" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" /><stop offset="25%" stopColor="#cfd8e6" /><stop offset="50%" stopColor="#6b7a90" /><stop offset="65%" stopColor="#e6edf7" /><stop offset="100%" stopColor="#4a5568" />
        </linearGradient>

        {/* ---------- フィルター ---------- */}
        <filter id="f-drop" x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#000" floodOpacity=".35" />
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000" floodOpacity=".35" />
        </filter>
        <filter id="f-rim" x="-25%" y="-20%" width="150%" height="145%" colorInterpolationFilters="sRGB">
          {/* 映画の3灯ライティング風: 左上から暖かいキーライトのふち＋右から冷たい逆光のふち（どちらも形の内側）＋やわらかい影 */}
          <feOffset in="SourceAlpha" dx="1.1" dy="1.3" result="sw" />
          <feComposite in="SourceAlpha" in2="sw" operator="out" result="edgeW" />
          <feGaussianBlur in="edgeW" stdDeviation=".45" result="edgeWb" />
          <feFlood floodColor="#ffe6b0" floodOpacity=".8" />
          <feComposite in2="edgeWb" operator="in" result="warm" />
          <feOffset in="SourceAlpha" dx="-1.5" dy=".2" result="sc" />
          <feComposite in="SourceAlpha" in2="sc" operator="out" result="edgeC" />
          <feGaussianBlur in="edgeC" stdDeviation=".55" result="edgeCb" />
          <feFlood floodColor="#94e2ff" floodOpacity=".6" />
          <feComposite in2="edgeCb" operator="in" result="coolRaw" />
          <feComposite in="coolRaw" in2="SourceAlpha" operator="in" result="cool" />
          <feDropShadow in="SourceGraphic" dx="0" dy="5" stdDeviation="4.5" floodColor="#05100e" floodOpacity=".5" result="shadowed" />
          <feMerge><feMergeNode in="shadowed" /><feMergeNode in="warm" /><feMergeNode in="cool" /></feMerge>
        </filter>
        {/* 小さなぼかし（髪が額に落とす影など） */}
        <filter id="f-soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation=".8" /></filter>
        <filter id="f-bloom-gold" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b" />
          <feColorMatrix in="b" type="matrix" values="1 0 0 0 .2  0 .9 0 0 .12  0 0 .4 0 0  0 0 0 .9 0" result="g" />
          <feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="f-bloom-volt" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b" />
          <feColorMatrix in="b" type="matrix" values="1 0 0 0 .3  0 1 0 0 .25  0 0 .2 0 0  0 0 0 1 0" result="g" />
          <feMerge><feMergeNode in="g" /><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="f-glow-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" /></filter>
        {/* 光（色を変えない発光） */}
        <filter id="f-bloom" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        {/* ふちを自然にゆらす（葉のしげみ・岩の輪郭を「描いた円」から「本物の形」に） */}
        <filter id="f-organic" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="2" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        {/* 細かい表面のざらつき（石・樹皮の質感） */}
        <filter id="f-texture" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.4 1.1" result="grain" />
          <feComposite in="grain" in2="SourceAlpha" operator="in" result="g2" />
          <feBlend in="SourceGraphic" in2="g2" mode="multiply" />
        </filter>
        <filter id="f-dof-1" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.2" /></filter>
        <filter id="f-dof-2" x="-15%" y="-15%" width="130%" height="130%"><feGaussianBlur stdDeviation="2.6" /></filter>
        <filter id="f-dof-4" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5" /></filter>
        <filter id="f-relief" x="-5%" y="-5%" width="110%" height="110%">
          {/* 石に彫られたレリーフ: アルファを高さとみなし、斜め上からの光で凹凸を出す */}
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.4" result="h" />
          <feSpecularLighting in="h" surfaceScale="3" specularConstant=".9" specularExponent="18" lightingColor="#fff1c9" result="spec">
            <feDistantLight azimuth="225" elevation="40" />
          </feSpecularLighting>
          <feComposite in="spec" in2="SourceAlpha" operator="in" result="specIn" />
          <feOffset in="SourceAlpha" dx="1.2" dy="1.6" result="off" />
          <feComposite in="off" in2="SourceAlpha" operator="out" result="cut" />
          <feFlood floodColor="#000" floodOpacity=".55" /><feComposite in2="cut" operator="in" result="shadow" />
          <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="shadow" /><feMergeNode in="specIn" /></feMerge>
        </filter>
      </defs>
    </svg>
  );
}
