import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { useBlockTypo } from '@/hooks/useBlockTypo';

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  @keyframes pc-scroll {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }

  .pc-viewport {
    overflow: hidden;
    position: relative;
    width: 100%;
  }

  /* fade masks */
  .pc-viewport::before,
  .pc-viewport::after {
    content: '';
    position: absolute;
    top: 0; bottom: 0;
    width: clamp(60px, 12vw, 200px);
    z-index: 10;
    pointer-events: none;
  }
  .pc-viewport::before { left: 0;  background: linear-gradient(90deg,  #fff 0%, transparent 100%); }
  .pc-viewport::after  { right: 0; background: linear-gradient(270deg, #fff 0%, transparent 100%); }

  .pc-track {
    display: flex;
    align-items: flex-end;
    width: max-content;
    animation: pc-scroll var(--pc-dur, 22s) linear infinite;
    will-change: transform;
  }
  .pc-track:hover { animation-play-state: paused; }

  .pc-item {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 clamp(20px, 3vw, 48px);
  }

  .pc-item img {
    display: block;
    object-fit: contain;
    pointer-events: none;
    filter: drop-shadow(0 20px 36px rgba(0,0,0,0.13));
    transition: filter 0.3s ease, transform 0.35s ease;
  }
  .pc-item:hover img {
    filter: drop-shadow(0 28px 48px rgba(0,0,0,0.22));
    transform: translateY(-6px);
  }
`;

export function Partners() {
  const { data, loading } = useData();
  const bt = useBlockTypo('partners');
  const content = data.content || {};
  const settings = data.settings || {};
  const primaryColor = settings.primary_color || '#f97316';

  const partners = (data.partners || [])
    .filter((p: any) => p.active === 1)
    .sort((a: any, b: any) => a.order_num - b.order_num);

  const categories = ['todos', ...Array.from(new Set(partners.map((p: any) => p.category).filter(Boolean)))];
  const [activeCategory, setActiveCategory] = useState('todos');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  const BASE_URL = API_URL.replace(/\/api\/?$/, '');
  const imgSrc = (img: string) => (img?.startsWith('http') ? img : `${BASE_URL}${img}`);

  const filtered = activeCategory === 'todos'
    ? partners
    : partners.filter((p: any) => p.category === activeCategory);

  if (loading || !partners.length) return null;

  const FONT = "'Plus Jakarta Sans', sans-serif";

  // Duplicate enough times so the track is always wide (min 8 slots visible)
  const MIN_COPIES = Math.max(2, Math.ceil(16 / (filtered.length || 1)));
  // We need even copies so the 50% translate seamlessly loops
  const copies = MIN_COPIES % 2 === 0 ? MIN_COPIES : MIN_COPIES + 1;
  const items = Array.from({ length: copies }, () => filtered).flat();

  // Slightly speed up when many items so it doesn't take forever
  const duration = Math.max(14, Math.min(32, filtered.length * 5));

  // Height of carousel images — tall like the reference
  const IMG_H = 260;

  return (
    <section style={{ background: '#fff', paddingTop: 'clamp(4rem,8vw,6.5rem)', paddingBottom: 'clamp(4rem,8vw,6.5rem)', overflow: 'hidden' }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* ── Header ── */}
      <div style={{ textAlign: 'center', marginBottom: 'clamp(2.5rem,5vw,4rem)', padding: '0 1.5rem' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '6px 16px', borderRadius: 999,
          background: `${primaryColor}15`, color: primaryColor,
          fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
          textTransform: 'uppercase', fontFamily: FONT, marginBottom: 20,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: primaryColor, flexShrink: 0 }} />
          {content['partners.label'] || 'INTEGRAÇÕES'}
        </div>

        <h2 style={{
          fontFamily: FONT, fontWeight: 'var(--typo-h-weight,800)',
          fontSize: 'clamp(1.8rem,4vw,3rem)',
          color: '#0f172a', lineHeight: 1.2,
          margin: '0 auto 16px', maxWidth: 640,
          letterSpacing: '-0.025em', ...bt.h}}>
          {content['partners.title'] || 'Conectado com as principais operadoras do mercado'}
        </h2>

        <p style={{
          fontFamily: FONT, fontSize: 'clamp(14px,1.6vw,16px)',
          color: '#64748b', maxWidth: 480, margin: '0 auto',
          lineHeight: 1.65,
        }}>
          {content['partners.description'] || 'Nossa plataforma integra-se perfeitamente com as principais máquinas de cartão'}
        </p>
      </div>

      {/* ── Category pills ── */}
      {categories.length > 2 && (
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 48, padding: '0 1.5rem' }}>
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              style={{
                padding: '7px 20px', borderRadius: 999, fontSize: 13, fontWeight: 600,
                fontFamily: FONT, cursor: 'pointer', transition: 'all 0.2s ease',
                background: activeCategory === cat ? primaryColor : 'rgba(0,0,0,.04)',
                color: activeCategory === cat ? '#fff' : '#64748b',
                border: activeCategory === cat ? `1px solid ${primaryColor}` : '1px solid transparent',
                boxShadow: activeCategory === cat ? `0 4px 14px ${primaryColor}35` : 'none',
              }}>
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* ── Infinite scroll track ── */}
      <div
        className="pc-viewport"
        style={{ height: IMG_H + 20 }}
      >
        <div
          className="pc-track"
          style={{ '--pc-dur': `${duration}s` } as React.CSSProperties}
        >
          {items.map((partner: any, idx: number) => (
            <div key={`${partner.id}-${idx}`} className="pc-item">
              <a
                href={partner.url || '#'}
                target={partner.url ? '_blank' : undefined}
                rel="noopener noreferrer"
                style={{ display: 'block' }}
              >
                <img
                  src={imgSrc(partner.image)}
                  alt={partner.name}
                  style={{ height: IMG_H, width: 'auto', maxWidth: 180 }}
                />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
