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
          <stop offset="0%" stopColor="#000" stopOpacity=".55" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>

        {/* ---------- 肌・瞳 ---------- */}
        <radialGradient id="g-skin" cx="42%" cy="32%" r="72%">
          <stop offset="0%" stopColor="#fff0e2" />
          <stop offset="55%" stopColor="#ffd2ad" />
          <stop offset="100%" stopColor="#e2a079" />
        </radialGradient>
        {[["brown", "#f3b25a", "#8a4a12", "#3b1d06"], ["green", "#9fe08a", "#2f8a4a", "#0f3b1d"], ["violet", "#d9b8ff", "#6a3fd1", "#24104f"], ["night", "#9ad7ff", "#1f5fa8", "#0b1f45"]].map(([n, a, b, c]) => (
          <radialGradient key={n} id={`iris-${n}`} cx="50%" cy="62%" r="60%">
            <stop offset="0%" stopColor={a} /><stop offset="60%" stopColor={b} /><stop offset="100%" stopColor={c} />
          </radialGradient>
        ))}

        {/* ---------- 髪・服（キャラ別） ---------- */}
        <linearGradient id="g-hair-haru" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8a5a33" /><stop offset="50%" stopColor="#5a3418" /><stop offset="100%" stopColor="#2e180a" /></linearGradient>
        <linearGradient id="g-hair-riko" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ffb469" /><stop offset="55%" stopColor="#ef7a2c" /><stop offset="100%" stopColor="#a8440f" /></linearGradient>
        <linearGradient id="g-hair-kiko" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7e5ac8" /><stop offset="55%" stopColor="#4a2c8e" /><stop offset="100%" stopColor="#1f1047" /></linearGradient>
        <linearGradient id="g-bandana" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ff6b6b" /><stop offset="100%" stopColor="#b3202a" /></linearGradient>
        <linearGradient id="g-vest" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#5fb47a" /><stop offset="100%" stopColor="#1f5236" /></linearGradient>
        <linearGradient id="g-shorts" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#d6a86a" /><stop offset="100%" stopColor="#7a5226" /></linearGradient>
        <linearGradient id="g-riko-dress" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ffb06b" /><stop offset="100%" stopColor="#c4521a" /></linearGradient>
        <linearGradient id="g-kiko-dress" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#c4a3ff" /><stop offset="100%" stopColor="#5a33b8" /></linearGradient>
        <linearGradient id="g-boot" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#9a5a2e" /><stop offset="100%" stopColor="#3a1d0a" /></linearGradient>

        {/* ---------- 相棒ビリモ ---------- */}
        <radialGradient id="g-volt" cx="38%" cy="30%" r="75%"><stop offset="0%" stopColor="#fff6b8" /><stop offset="45%" stopColor="#ffd83a" /><stop offset="100%" stopColor="#d48a00" /></radialGradient>
        <linearGradient id="g-sky" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#b8f1ff" /><stop offset="50%" stopColor="#3cc4f0" /><stop offset="100%" stopColor="#136f9c" /></linearGradient>

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
          </g>
        ))}
        <linearGradient id="metal-platinum" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" /><stop offset="25%" stopColor="#cfd8e6" /><stop offset="50%" stopColor="#6b7a90" /><stop offset="65%" stopColor="#e6edf7" /><stop offset="100%" stopColor="#4a5568" />
        </linearGradient>

        {/* ---------- フィルター ---------- */}
        <filter id="f-drop" x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#000" floodOpacity=".35" />
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000" floodOpacity=".35" />
        </filter>
        <filter id="f-rim" x="-20%" y="-20%" width="140%" height="140%">
          {/* 逆光のふち取り（左上から金色の光） */}
          <feMorphology in="SourceAlpha" operator="dilate" radius=".7" result="d" />
          <feOffset in="d" dx="-1" dy="-1" result="o" />
          <feComposite in="o" in2="SourceAlpha" operator="out" result="edge" />
          <feFlood floodColor="#ffd98a" floodOpacity=".5" />
          <feComposite in2="edge" operator="in" result="rim" />
          <feGaussianBlur in="rim" stdDeviation=".9" result="rimb" />
          <feDropShadow in="SourceGraphic" dx="0" dy="6" stdDeviation="5" floodColor="#000" floodOpacity=".45" result="shadowed" />
          <feMerge><feMergeNode in="shadowed" /><feMergeNode in="rimb" /></feMerge>
        </filter>
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
