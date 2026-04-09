import { useData } from '@/context/DataContext';
import { useEffect, useRef, useState } from 'react';

function useInView(threshold = 0.05) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const fallback = setTimeout(() => setInView(true), 1500);
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      if (rect.top < window.innerHeight + 100) { setInView(true); clearTimeout(fallback); return () => clearTimeout(fallback); }
    }
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); clearTimeout(fallback); } }, { threshold, rootMargin: '100px 0px' });
    if (ref.current) obs.observe(ref.current);
    return () => { obs.disconnect(); clearTimeout(fallback); };
  }, [threshold]);
  return { ref, inView };
}

// ── Layout 1: Card arredondado escuro (padrão) ────────────────────────────────
function LayoutDark({ stats, pc, header }: any) {
  const { ref, inView } = useInView();
  return (
    <div data-reveal="up" style={{ padding: '48px 0' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 2rem' }}>
        <div ref={ref} style={{ position: 'relative', overflow: 'hidden', borderRadius: 28, padding: '72px 48px', background: '#0d0d0f', border: '1px solid rgba(255,255,255,.07)', boxShadow: '0 32px 80px rgba(0,0,0,.35)' }}>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 70% 60% at 5% 50%, ${pc}0d, transparent), radial-gradient(ellipse 50% 70% at 95% 15%, ${pc}08, transparent)`, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: `linear-gradient(90deg,transparent,${pc}30,transparent)` }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle,rgba(255,255,255,.03) 1px,transparent 1px)', backgroundSize: '44px 44px', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            {header}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(stats.length, 3)}, 1fr)`, gap: 16, maxWidth: '56rem', margin: '0 auto' }}>
              {stats.map((s: any, i: number) => (
                <StatCardDark key={i} stat={s} pc={pc} delay={i * 0.12} inView={inView} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCardDark({ stat, pc, delay, inView }: any) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ position: 'relative', borderRadius: 20, padding: '40px 32px', textAlign: 'center', background: hov ? 'rgba(255,255,255,.07)' : 'rgba(255,255,255,.04)', border: `1px solid ${hov ? pc + '30' : 'rgba(255,255,255,.07)'}`, boxShadow: hov ? `0 20px 60px ${pc}10` : 'none', opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(24px)', transition: `opacity .6s ${delay}s ease, transform .6s ${delay}s ease, background .3s, border-color .3s, box-shadow .3s` }}>
      <div style={{ fontSize: 'clamp(2.8rem,5vw,4.2rem)', fontWeight: 900, marginBottom: 8, background: `linear-gradient(135deg,#fff,${pc})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: "'Outfit',sans-serif", letterSpacing: '-0.04em', lineHeight: 1 }}>{stat.value}</div>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '0.16em', fontFamily: "'DM Sans',sans-serif" }}>{stat.label}</div>
      <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', height: 2, borderRadius: 2, background: `linear-gradient(90deg,transparent,${pc},transparent)`, width: hov ? 64 : 0, transition: 'width .4s' }} />
    </div>
  );
}

// ── Layout 2: Linha horizontal clean (fundo claro) ────────────────────────────
function LayoutLight({ stats, pc, header }: any) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} style={{ padding: '80px 0', background: 'var(--s0)' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 2rem' }}>
        {header}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)`, gap: 0 }}>
          {stats.map((s: any, i: number) => (
            <div key={i} style={{ padding: '32px 24px', textAlign: 'center', borderRight: i < stats.length - 1 ? '1px solid rgba(0,0,0,.08)' : 'none', opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(16px)', transition: `opacity .5s ${i * 0.1}s, transform .5s ${i * 0.1}s` }}>
              <div style={{ fontSize: 'clamp(2.4rem,4vw,3.5rem)', fontWeight: 900, color: pc, fontFamily: "'Outfit',sans-serif", letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 10 }}>{s.value}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: "'DM Sans',sans-serif" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Layout 3: Cards com borda colorida (fundo cinza claro) ────────────────────
function LayoutCards({ stats, pc, header }: any) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} style={{ padding: '80px 0', background: 'var(--s2)' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 2rem' }}>
        {header}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(stats.length, 3)}, 1fr)`, gap: 20 }}>
          {stats.map((s: any, i: number) => {
            const [hov, setHov] = useState(false);
            return (
              <div key={i} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
                style={{ background: 'var(--s0)', borderRadius: 20, padding: '40px 32px', borderTop: `4px solid ${hov ? pc : 'transparent'}`, boxShadow: hov ? `0 12px 40px ${pc}18` : '0 2px 12px rgba(0,0,0,.06)', transition: 'all .3s', transform: hov ? 'translateY(-4px)' : 'none', opacity: inView ? 1 : 0, transitionDelay: `${i * 0.1}s` }}>
                <div style={{ fontSize: 'clamp(2.4rem,4vw,3.5rem)', fontWeight: 900, color: hov ? pc : 'var(--t1)', fontFamily: "'Outfit',sans-serif", letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 10, transition: 'color .3s' }}>{s.value}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: "'DM Sans',sans-serif" }}>{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Layout 4: Linha com gradiente colorido ────────────────────────────────────
function LayoutGradient({ stats, pc, sc, header }: any) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} style={{ padding: '80px 0', background: `linear-gradient(135deg, ${pc}, ${sc || pc}cc)` }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 2rem' }}>
        {header && <div style={{ filter: 'invert(1) brightness(2)' }}>{header}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)`, gap: 0 }}>
          {stats.map((s: any, i: number) => (
            <div key={i} style={{ padding: '32px 24px', textAlign: 'center', borderRight: i < stats.length - 1 ? '1px solid rgba(255,255,255,.2)' : 'none', opacity: inView ? 1 : 0, transform: inView ? 'scale(1)' : 'scale(.9)', transition: `opacity .5s ${i * 0.1}s, transform .5s ${i * 0.1}s` }}>
              <div style={{ fontSize: 'clamp(2.8rem,5vw,4rem)', fontWeight: 900, color: '#fff', fontFamily: "'Outfit',sans-serif", letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 10 }}>{s.value}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.75)', textTransform: 'uppercase', letterSpacing: '0.14em', fontFamily: "'DM Sans',sans-serif" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Layout 5: Números gigantes minimalistas ───────────────────────────────────
function LayoutMinimal({ stats, pc, header }: any) {
  const { ref, inView } = useInView();
  return (
    <div ref={ref} style={{ padding: '80px 0', background: 'var(--s0)', borderTop: '1px solid var(--b1)', borderBottom: '1px solid var(--b1)' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 2rem' }}>
        {header}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '48px 64px' }}>
          {stats.map((s: any, i: number) => (
            <div key={i} style={{ textAlign: 'center', opacity: inView ? 1 : 0, transform: inView ? 'none' : 'translateY(20px)', transition: `opacity .6s ${i * 0.15}s, transform .6s ${i * 0.15}s` }}>
              <div style={{ fontSize: 'clamp(3.5rem,6vw,6rem)', fontWeight: 900, color: 'var(--t1)', fontFamily: "'Outfit',sans-serif", letterSpacing: '-0.06em', lineHeight: 1 }}>
                <span style={{ color: pc }}>{s.value}</span>
              </div>
              <div style={{ marginTop: 8, fontSize: 12, fontWeight: 600, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.16em', fontFamily: "'DM Sans',sans-serif" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function Numbers() {
  const { data, loading } = useData();
  const content = data.content || {};
  const settings = data.settings || {};
  const pc = settings.primary_color || '#f97316';
  const sc = settings.secondary_color || '#fb923c';

  const stats = (data.stats || []).filter((s: any) => s.section === 'numbers' || !s.section);

  if (loading || !stats.length) return null;

  const layout = content['stats.layout'] || 'dark';

  const headerContent = (content['stats.title'] || content['stats.subtitle']) ? (
    <div style={{ textAlign: 'center', marginBottom: 48 }}>
      {content['stats.title'] && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 16, padding: '4px 14px', borderRadius: 99, border: `1px solid ${layout === 'dark' ? pc + '30' : pc + '40'}`, background: layout === 'dark' ? `${pc}12` : `${pc}10` }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: pc, display: 'inline-block' }} />
          <span style={{ fontSize: 10.5, fontWeight: 700, color: pc, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: "'DM Sans',sans-serif" }}>{content['stats.title']}</span>
        </div>
      )}
      {content['stats.subtitle'] && (
        <h2 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: 'clamp(1.8rem,4vw,3rem)', letterSpacing: '-0.03em', color: 'var(--t1)', margin: '0 0 12px', lineHeight: 1.1 }}>{content['stats.subtitle']}</h2>
      )}
      {content['stats.description'] && (
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 15, lineHeight: 1.75, color: 'var(--t3)', margin: 0, maxWidth: 440, marginInline: 'auto' }}>{content['stats.description']}</p>
      )}
    </div>
  ) : null;

  if (layout === 'light')    return <LayoutLight    stats={stats} pc={pc} header={headerContent} />;
  if (layout === 'cards')    return <LayoutCards    stats={stats} pc={pc} header={headerContent} />;
  if (layout === 'gradient') return <LayoutGradient stats={stats} pc={pc} sc={sc} header={headerContent} />;
  if (layout === 'minimal')  return <LayoutMinimal  stats={stats} pc={pc} header={headerContent} />;
  return <LayoutDark stats={stats} pc={pc} header={headerContent} />;
}
