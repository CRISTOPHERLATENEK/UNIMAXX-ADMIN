// AnimatedBgLayer.tsx — Fundo animado aplicável a qualquer seção
import { useEffect, useRef } from 'react';

export type AnimatedBgType =
  | 'none'
  | 'particles'
  | 'aurora'
  | 'grid'
  | 'waves'
  | 'pulse'
  | 'stars'
  | 'oxpay';

const STYLE_ID = 'animated-bg-keyframes';

const KEYFRAMES = `
@keyframes abg-float  { 0%{transform:translateY(0)   scale(1);  opacity:.7} 100%{transform:translateY(-110px) scale(0); opacity:0} }
@keyframes abg-aurora { 0%,100%{transform:translate(0,0)   scale(1);  } 50%{transform:translate(50px,-40px) scale(1.15);} }
@keyframes abg-shimmer{ 0%{background-position:0% 0%}  100%{background-position:200% 200%} }
@keyframes abg-wave   { 0%{transform:translateX(0)}   100%{transform:translateX(-50%)} }
@keyframes abg-pulse  { 0%{transform:scale(.4); opacity:.55} 100%{transform:scale(2.4); opacity:0} }
@keyframes abg-twinkle{ 0%,100%{opacity:.1; transform:scale(.8)} 50%{opacity:.9; transform:scale(1.2)} }
@keyframes abg-ox-orb { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-30px,20px) scale(1.1)} }
`;

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = KEYFRAMES;
  document.head.appendChild(s);
}

// ── Particles ─────────────────────────────────────────────────────────────────
function Particles({ color }: { color: string }) {
  const dots = Array.from({ length: 18 }, (_, i) => ({
    left: `${(i * 37 + 5) % 100}%`,
    size: 3 + (i % 4),
    delay: `${(i * 0.4) % 3}s`,
    dur: `${4 + (i % 5)}s`,
    bottom: `${(i * 13) % 40}%`,
  }));
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {dots.map((d, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: d.left,
          bottom: d.bottom,
          width: d.size,
          height: d.size,
          borderRadius: '50%',
          background: color,
          opacity: 0.6,
          animation: `abg-float ${d.dur} ${d.delay} ease-in infinite`,
        }} />
      ))}
    </div>
  );
}

// ── Aurora ────────────────────────────────────────────────────────────────────
function Aurora({ color }: { color: string }) {
  const blobs = [
    { left: '10%', top: '20%', w: '55%', h: '55%', delay: '0s', dur: '8s' },
    { left: '45%', top: '30%', w: '45%', h: '50%', delay: '2s', dur: '10s' },
    { left: '20%', top: '50%', w: '40%', h: '45%', delay: '4s', dur: '9s' },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {blobs.map((b, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: b.left, top: b.top,
          width: b.w, height: b.h,
          borderRadius: '50%',
          background: color,
          filter: 'blur(70px)',
          opacity: 0.18,
          animation: `abg-aurora ${b.dur} ${b.delay} ease-in-out infinite`,
        }} />
      ))}
    </div>
  );
}

// ── Grid ──────────────────────────────────────────────────────────────────────
function Grid({ color }: { color: string }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* dot grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `radial-gradient(circle, ${color} 1.2px, transparent 1.2px)`,
        backgroundSize: '32px 32px',
        opacity: 0.18,
      }} />
      {/* shimmer sweep */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(135deg, transparent 0%, ${color} 45%, transparent 55%, transparent 100%)`,
        backgroundSize: '400% 400%',
        opacity: 0.08,
        animation: 'abg-shimmer 6s linear infinite',
      }} />
    </div>
  );
}

// ── Waves ─────────────────────────────────────────────────────────────────────
function Waves({ color }: { color: string }) {
  const w = 1600;
  const wavePath = (amp: number, freq: number, phase: number) => {
    let d = `M0 ${80 + amp}`;
    for (let x = 0; x <= w; x += 8) {
      const y = 80 + amp + Math.sin((x / (w / freq)) * Math.PI * 2 + phase) * amp;
      d += ` L${x} ${y}`;
    }
    d += ` L${w} 160 L0 160 Z`;
    return d;
  };
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', bottom: 0 }}>
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '200%', animation: 'abg-wave 8s linear infinite' }}>
        <svg viewBox={`0 0 ${w * 2} 160`} width={`${w * 2}`} height="160" preserveAspectRatio="none"
          style={{ display: 'block', position: 'absolute', bottom: 0 }}>
          <path d={wavePath(22, 2, 0) + ' M' + w + ' ' + (80 + 22) + wavePath(22, 2, 0).replace('M0', '')} fill={color} opacity="0.12" />
          <path d={wavePath(14, 3, 1.5)} fill={color} opacity="0.18" transform={`translate(${w},0)`} />
        </svg>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '200%', animation: 'abg-wave 12s linear infinite reverse' }}>
        <svg viewBox={`0 0 ${w * 2} 120`} width={`${w * 2}`} height="120" preserveAspectRatio="none"
          style={{ display: 'block', position: 'absolute', bottom: 0 }}>
          <path d={wavePath(16, 2.5, 0.8)} fill={color} opacity="0.10" />
          <path d={wavePath(16, 2.5, 0.8)} fill={color} opacity="0.10" transform={`translate(${w},0)`} />
        </svg>
      </div>
    </div>
  );
}

// ── Pulse ─────────────────────────────────────────────────────────────────────
function Pulse({ color }: { color: string }) {
  const rings = [0, 1, 2, 3];
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {rings.map(i => (
        <div key={i} style={{
          position: 'absolute',
          width: 200,
          height: 200,
          borderRadius: '50%',
          border: `2px solid ${color}`,
          opacity: 0,
          animation: `abg-pulse 4s ${i * 1}s ease-out infinite`,
        }} />
      ))}
    </div>
  );
}

// ── Oxpay ─────────────────────────────────────────────────────────────────────
function Oxpay({ color }: { color: string }) {
  return (
    <div style={{ 
      position: 'absolute', 
      inset: 0, 
      overflow: 'hidden', 
      pointerEvents: 'none',
      background: color || '#050508'
    }} />
  );
}

// ── Stars ─────────────────────────────────────────────────────────────────────
function Stars({ color }: { color: string }) {
  const stars = Array.from({ length: 30 }, (_, i) => ({
    left: `${(i * 31 + 3) % 100}%`,
    top: `${(i * 47 + 7) % 100}%`,
    size: 1 + (i % 3),
    delay: `${(i * 0.3) % 5}s`,
    dur: `${2 + (i % 4)}s`,
  }));
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {stars.map((s, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: s.left, top: s.top,
          width: s.size, height: s.size,
          borderRadius: '50%',
          background: color,
          animation: `abg-twinkle ${s.dur} ${s.delay} ease-in-out infinite`,
        }} />
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function AnimatedBgLayer({ type, color = '#f97316' }: { type?: AnimatedBgType; color?: string }) {
  useEffect(() => { injectStyles(); }, []);
  if (!type || type === 'none') return null;
  const map: Record<AnimatedBgType, React.ReactNode> = {
    none: null,
    particles: <Particles color={color} />,
    aurora:    <Aurora    color={color} />,
    grid:      <Grid      color={color} />,
    waves:     <Waves     color={color} />,
    pulse:     <Pulse     color={color} />,
    stars:     <Stars     color={color} />,
    oxpay:     <Oxpay     color={color} />,
  };
  return <>{map[type]}</>;
}

// ── Miniature CSS preview (for admin only — no React deps) ───────────────────
export const ANIM_BG_OPTIONS: {
  value: AnimatedBgType;
  label: string;
  css: string; // small inline CSS for the thumbnail
}[] = [
  {
    value: 'none',
    label: 'Nenhum',
    css: '',
  },
  {
    value: 'particles',
    label: 'Partículas',
    css: `
      background: radial-gradient(circle at 20% 80%, currentColor 1.5px, transparent 1.5px),
                  radial-gradient(circle at 60% 30%, currentColor 2px, transparent 2px),
                  radial-gradient(circle at 80% 70%, currentColor 1px, transparent 1px),
                  radial-gradient(circle at 40% 50%, currentColor 1.5px, transparent 1.5px);
      background-size: 100% 100%;
    `,
  },
  {
    value: 'aurora',
    label: 'Aurora',
    css: `background: radial-gradient(ellipse 60% 55% at 30% 40%, currentColor, transparent),
                      radial-gradient(ellipse 45% 50% at 75% 60%, currentColor, transparent);
          opacity: .35; filter: blur(8px);`,
  },
  {
    value: 'grid',
    label: 'Grade',
    css: `background-image: radial-gradient(circle, currentColor 1px, transparent 1px);
          background-size: 10px 10px; opacity: .3;`,
  },
  {
    value: 'waves',
    label: 'Ondas',
    css: `background: linear-gradient(180deg, transparent 55%, currentColor 100%); opacity: .25;`,
  },
  {
    value: 'pulse',
    label: 'Pulso',
    css: `border: 2px solid currentColor; border-radius: 50%; width:30px!important; height:30px!important;
          margin: auto; opacity:.4; box-shadow: 0 0 0 6px currentColor22, 0 0 0 12px currentColor11;`,
  },
  {
    value: 'stars',
    label: 'Estrelas',
    css: `background: radial-gradient(circle at 15% 25%, currentColor 1px, transparent 1px),
                      radial-gradient(circle at 50% 60%, currentColor 1.5px, transparent 1.5px),
                      radial-gradient(circle at 80% 20%, currentColor 1px, transparent 1px),
                      radial-gradient(circle at 30% 75%, currentColor 1px, transparent 1px),
                      radial-gradient(circle at 70% 80%, currentColor 1.5px, transparent 1.5px);
          background-size: 100% 100%; opacity:.5;`,
  },
  {
    value: 'oxpay',
    label: 'Oxpay Dark',
    css: `background: #050508; 
          box-shadow: inset 0 0 20px currentColor;
          border: 1px solid currentColor;`,
  },
];
