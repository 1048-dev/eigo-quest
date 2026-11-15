/**
 * 背景用のイラスト素材（SVGの <g>）。ドット柄や絵文字のかわりに、手描き風の木・遺跡・草花を置く。
 * それぞれ原点 (0,0) が「地面に接する中心」になるように描いてある。
 */
const LINE = "rgba(43,34,22,.55)";

export function JungleTree({ s = 1, tone = 0 }: { s?: number; tone?: number }) {
  const leaf = ["#2f8f4e", "#3aa35a", "#2a7d46"][tone % 3];
  const leaf2 = ["#45b86a", "#56c977", "#3e9e5c"][tone % 3];
  return (
    <g transform={`scale(${s})`}>
      <path d="M-6 0 Q-4 -40 -2 -70 L4 -70 Q6 -40 8 0 Z" fill="#7a5230" stroke={LINE} strokeWidth={1.5} />
      <circle cx={-22} cy={-78} r={24} fill={leaf} stroke={LINE} strokeWidth={1.5} />
      <circle cx={22} cy={-80} r={24} fill={leaf} stroke={LINE} strokeWidth={1.5} />
      <circle cx={0} cy={-102} r={28} fill={leaf2} stroke={LINE} strokeWidth={1.5} />
      <circle cx={-8} cy={-110} r={8} fill="rgba(255,255,255,.18)" />
      <circle cx={14} cy={-74} r={3} fill="#ff6fa5" /><circle cx={-18} cy={-90} r={3} fill="#ffd23f" />
    </g>
  );
}

export function Palm({ s = 1 }: { s?: number }) {
  return (
    <g transform={`scale(${s})`}>
      <path d="M-4 0 Q-10 -40 4 -86 L10 -84 Q0 -40 6 0 Z" fill="#9a6a3a" stroke={LINE} strokeWidth={1.5} />
      {[-70, -30, 10, 40, 80, 130].map((r) => (
        <path key={r} d="M6 -86 Q34 -96 50 -76 Q30 -82 6 -86 Z" fill="#3aa35a" stroke={LINE} strokeWidth={1.2} transform={`rotate(${r} 6 -86)`} />
      ))}
      <circle cx={2} cy={-80} r={4} fill="#7a4a1a" /><circle cx={10} cy={-78} r={4} fill="#7a4a1a" />
    </g>
  );
}

export function Bush({ s = 1 }: { s?: number }) {
  return (
    <g transform={`scale(${s})`}>
      <ellipse cx={0} cy={-10} rx={26} ry={14} fill="#3aa35a" stroke={LINE} strokeWidth={1.2} />
      <ellipse cx={-14} cy={-16} rx={14} ry={12} fill="#45b86a" stroke={LINE} strokeWidth={1.2} />
      <ellipse cx={12} cy={-18} rx={14} ry={12} fill="#45b86a" stroke={LINE} strokeWidth={1.2} />
      <circle cx={-6} cy={-22} r={3} fill="#ff6fa5" /><circle cx={10} cy={-12} r={3} fill="#fff" /><circle cx={16} cy={-24} r={3} fill="#ffd23f" />
    </g>
  );
}

export function RuinPillar({ s = 1, broken = false }: { s?: number; broken?: boolean }) {
  return (
    <g transform={`scale(${s})`}>
      <rect x={-16} y={-8} width={32} height={8} rx={2} fill="#b69a6a" stroke={LINE} strokeWidth={1.5} />
      <rect x={-11} y={broken ? -46 : -70} width={22} height={broken ? 38 : 62} fill="#cdb488" stroke={LINE} strokeWidth={1.5} />
      {[-5, 0, 5].map((x) => <line key={x} x1={x} x2={x} y1={broken ? -44 : -68} y2={-10} stroke="rgba(0,0,0,.15)" strokeWidth={2} />)}
      {broken ? <path d="M-11 -46 L-4 -52 L2 -46 L8 -54 L11 -46 Z" fill="#cdb488" stroke={LINE} strokeWidth={1.5} />
        : <rect x={-16} y={-78} width={32} height={8} rx={2} fill="#b69a6a" stroke={LINE} strokeWidth={1.5} />}
      <path d="M-11 -30 Q-20 -24 -14 -14" stroke="#3aa35a" strokeWidth={4} fill="none" strokeLinecap="round" />
    </g>
  );
}

export function Flowers({ s = 1 }: { s?: number }) {
  return (
    <g transform={`scale(${s})`}>
      {[[-10, "#ff6fa5"], [0, "#ffd23f"], [10, "#4cc9f0"]].map(([x, c]) => (
        <g key={x as number} transform={`translate(${x} 0)`}>
          <path d="M0 0 L0 -12" stroke="#2f8f4e" strokeWidth={2} />
          {[0, 72, 144, 216, 288].map((r) => <ellipse key={r} cx={0} cy={-16} rx={2.6} ry={4} fill={c as string} transform={`rotate(${r} 0 -12)`} />)}
          <circle cx={0} cy={-12} r={2} fill="#fff" />
        </g>
      ))}
    </g>
  );
}

export function Rock({ s = 1 }: { s?: number }) {
  return (
    <g transform={`scale(${s})`}>
      <path d="M-18 0 Q-20 -14 -6 -18 Q8 -22 16 -10 Q20 -2 18 0 Z" fill="#9c917a" stroke={LINE} strokeWidth={1.5} />
      <path d="M-8 -14 Q0 -17 6 -14" stroke="rgba(255,255,255,.35)" strokeWidth={3} fill="none" strokeLinecap="round" />
    </g>
  );
}
