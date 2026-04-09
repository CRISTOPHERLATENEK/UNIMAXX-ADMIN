import { ArrowRight } from 'lucide-react';
import { useData } from '@/context/DataContext';

const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3001/api';
const BASE_URL = API_URL.replace('/api', '');

function imgUrl(src?: string) {
  if (!src) return '';
  return src.startsWith('http') ? src : `${BASE_URL}${src}`;
}

type HighlightItem = {
  image: string;
  badge: string;
  title: string;
  description: string;
  cta_text: string;
  cta_link: string;
  image_position?: string;
};

// Accent colors cycling per item
const ACCENTS = ['#f97316', '#2563eb', '#10b981', '#8b5cf6', '#e11d48'];

function HighlightBlock({ item, index }: { item: HighlightItem; index: number }) {
  const image = imgUrl(item.image);
  const imgLeft = (item.image_position || 'right') === 'left';
  const accent = ACCENTS[index % ACCENTS.length];
  const paragraphs = (item.description || '').split('\n').filter(Boolean);

  const textBlock = (
    <div
      data-reveal={imgLeft ? 'right' : 'left'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 'clamp(2rem,5vw,4rem) clamp(1.5rem,4vw,3.5rem)',
        position: 'relative',
        zIndex: 1,
      }}
    >
      {/* Decorative number */}
      <span style={{
        position: 'absolute',
        top: 24,
        right: imgLeft ? 'auto' : 24,
        left: imgLeft ? 24 : 'auto',
        fontFamily: "'Outfit', sans-serif",
        fontSize: 'clamp(5rem,10vw,9rem)',
        fontWeight: 900,
        letterSpacing: '-0.06em',
        lineHeight: 1,
        color: accent,
        opacity: 0.06,
        userSelect: 'none',
        pointerEvents: 'none',
      }}>
        {String(index + 1).padStart(2, '0')}
      </span>

      {item.badge && (
        <div style={{ marginBottom: 20 }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 14px',
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.10em',
            textTransform: 'uppercase' as const,
            fontFamily: "'DM Sans', sans-serif",
            color: accent,
            background: `${accent}12`,
            border: `1px solid ${accent}30`,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: accent, display: 'inline-block' }} />
            {item.badge}
          </span>
        </div>
      )}

      {item.title && (
        <h2 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)',
          fontWeight: 900,
          letterSpacing: '-0.04em',
          lineHeight: 1.05,
          color: 'var(--t1)',
          margin: '0 0 20px',
        }}>
          {item.title}
        </h2>
      )}

      {/* Accent line */}
      <div style={{ width: 48, height: 3, borderRadius: 99, background: accent, marginBottom: 20, opacity: 0.8 }} />

      {paragraphs.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
          {paragraphs.map((p, i) => (
            <p key={i} style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 15,
              lineHeight: 1.75,
              color: 'var(--t3)',
              margin: 0,
            }}>
              {p}
            </p>
          ))}
        </div>
      )}

      {item.cta_text && (
        <a
          href={item.cta_link || '#'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 24px',
            borderRadius: 999,
            fontSize: 14,
            fontWeight: 700,
            fontFamily: "'DM Sans', sans-serif",
            color: '#fff',
            background: accent,
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'none',
            alignSelf: 'flex-start',
            boxShadow: `0 8px 24px ${accent}35`,
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
            (e.currentTarget as HTMLElement).style.boxShadow = `0 14px 32px ${accent}45`;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${accent}35`;
          }}
        >
          {item.cta_text}
          <ArrowRight size={15} />
        </a>
      )}
    </div>
  );

  const imageBlock = (
    <div
      data-reveal={imgLeft ? 'left' : 'right'}
      style={{
        position: 'relative',
        borderRadius: 'clamp(16px, 2.5vw, 28px)',
        overflow: 'hidden',
        minHeight: 'clamp(300px, 40vw, 520px)',
        background: `${accent}10`,
      }}
    >
      {image ? (
        <>
          <img
            src={image}
            alt={item.title || 'Destaque'}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.6s cubic-bezier(0.2,0.8,0.2,1)',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
          />
          {/* Subtle gradient overlay at bottom for depth */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(160deg, transparent 50%, ${accent}22 100%)`,
            pointerEvents: 'none',
          }} />
          {/* Accent corner tag */}
          <div style={{
            position: 'absolute',
            top: 20,
            left: 20,
            padding: '6px 14px',
            borderRadius: 999,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.15)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase' as const,
            color: '#fff',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {item.badge || 'Destaque'}
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 64 }}>
          🖼️
        </div>
      )}
    </div>
  );

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 'clamp(16px, 4vw, 56px)',
      alignItems: 'stretch',
      borderRadius: 'clamp(20px, 3vw, 36px)',
      overflow: 'hidden',
      background: 'var(--s1)',
      border: '1px solid var(--b1)',
      boxShadow: '0 24px 80px rgba(0,0,0,.07)',
    }}
      className="highlight-block-grid"
    >
      {imgLeft ? (
        <>{imageBlock}{textBlock}</>
      ) : (
        <>{textBlock}{imageBlock}</>
      )}
    </div>
  );
}

export function HomeHighlight() {
  const { data } = useData();
  const content = data.content || {};

  const enabled = content['home_highlight.enabled'] !== '0';
  if (!enabled) return null;

  let items: HighlightItem[] = [];
  const rawItems = content['home_highlight.items'];
  if (rawItems) {
    try {
      const parsed = JSON.parse(rawItems);
      if (Array.isArray(parsed)) items = parsed;
    } catch { }
  }

  if (items.length === 0) {
    const legacy: HighlightItem = {
      image: content['home_highlight.image'] || '',
      badge: content['home_highlight.badge'] || '',
      title: content['home_highlight.title'] || '',
      description: content['home_highlight.description'] || '',
      cta_text: content['home_highlight.cta_text'] || '',
      cta_link: content['home_highlight.cta_link'] || '#contato',
      image_position: 'right',
    };
    if (legacy.image || legacy.title || legacy.badge) items = [legacy];
  }

  if (items.length === 0) return null;

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .highlight-block-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      <section id="home-highlight" style={{ padding: 'clamp(3rem,6vw,5rem) 0', background: 'var(--s0)' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 clamp(1rem,3vw,2rem)', display: 'flex', flexDirection: 'column', gap: 'clamp(1.5rem,3vw,2.5rem)' }}>
          {items.map((item, i) => (
            <HighlightBlock key={i} item={item} index={i} />
          ))}
        </div>
      </section>
    </>
  );
}