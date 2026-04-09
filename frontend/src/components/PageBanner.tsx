import React from 'react';
// PageBanner.tsx — carrossel de banners por página. 100% do conteúdo vem do admin.
// Sem fallback, sem texto hardcoded. Se não houver banner ativo, não renderiza nada.

import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useData } from '@/context/DataContext';
import type { Banner } from '@/types';

const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3001/api';
const BASE_URL = API_URL.replace('/api', '');

function imgUrl(src: string) {
  if (!src) return '';
  return src.startsWith('http') ? src : `${BASE_URL}${src}`;
}

// ─── Parallax Slide ──────────────────────────────────────────────────────────
function ParallaxBannerSlide({ banner, c, hasImage, hasText }: { banner: Banner; c: string; hasImage: boolean; hasText: boolean }) {
  const imgRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        if (!imgRef.current || !containerRef.current) { ticking = false; return; }
        const rect = containerRef.current.getBoundingClientRect();
        const viewH = window.innerHeight;
        // só anima quando visível
        if (rect.bottom < 0 || rect.top > viewH) { ticking = false; return; }
        const progress = (viewH - rect.top) / (viewH + rect.height); // 0 → 1
        const shift = (progress - 0.5) * 120; // -60px … +60px
        imgRef.current.style.transform = `translateY(${shift}px)`;
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', width: '100%', minHeight: 520, paddingTop: 68, background: '#050507', overflow: 'hidden' }}
    >
      {/* Camada de imagem com parallax */}
      {hasImage && (
        <div
          ref={imgRef}
          style={{
            position: 'absolute',
            top: -60,
            left: 0,
            right: 0,
            bottom: -60,
            willChange: 'transform',
            transition: 'transform 0.05s linear',
          }}
        >
          <img
            src={imgUrl(banner.image)}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55 }}
          />
        </div>
      )}

      {/* Gradiente direcional */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(115deg, rgba(5,5,8,.94) 0%, rgba(5,5,8,.70) 45%, rgba(5,5,8,.10) 100%)`,
      }} />

      {/* Acento de cor lateral */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: '38%', height: '100%',
        background: `linear-gradient(to left, ${c}22, transparent)`,
        pointerEvents: 'none',
      }} />

      {/* Linha decorativa esquerda animada via CSS */}
      <div style={{
        position: 'absolute', left: 0, top: '15%', bottom: '15%',
        width: 3, borderRadius: 2,
        background: `linear-gradient(to bottom, transparent, ${c}, transparent)`,
        opacity: 0.7,
      }} />

      {/* Conteúdo */}
      {hasText && (
        <div style={{
          position: 'relative', zIndex: 3,
          maxWidth: '80rem', margin: '0 auto', padding: '0 2rem',
          display: 'flex', alignItems: 'center', minHeight: 452,
        }}>
          <div style={{ maxWidth: 640 }}>
            <SlideContent banner={banner} c={c} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Slide único ─────────────────────────────────────────────────────────────
export function BannerSlide({ banner }: { banner: Banner }) {
  const c = banner.bg_color || '#f97316';
  const hasImage = !!banner.image;
  const hasText = !!(banner.title?.trim() || banner.subtitle?.trim() || banner.description?.trim());

  // Modo: só imagem (sem overlay)
  if (hasImage && (banner.use_style ?? 1) === 0) {
    return (
      <div style={{ position: 'relative', width: '100%', minHeight: 520, paddingTop: 68, background: '#000', overflow: 'hidden' }}>
        <img
          src={imgUrl(banner.image)}
          alt={banner.title || ''}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {hasText && (
          <>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(110deg,rgba(0,0,0,.65) 0%,rgba(0,0,0,.2) 60%,transparent 100%)' }} />
            <SlideContent banner={banner} c={c} />
          </>
        )}
      </div>
    );
  }

  // Modo: com estilo (cinematic, neon, editorial, split, bold)
  const style = banner.banner_style || 'cinematic';

  if (style === 'split') {
    return (
      <div style={{ position: 'relative', width: '100%', minHeight: 520, paddingTop: 68, background: '#0c0c0f', overflow: 'hidden' }}>
        {/* Lado esquerdo: imagem */}
        {hasImage && (
          <div style={{ position: 'absolute', inset: '0 50% 0 0', overflow: 'hidden' }}>
            <img src={imgUrl(banner.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent,rgba(12,12,15,.5))' }} />
          </div>
        )}
        {/* Lado direito: cor + conteúdo */}
        <div style={{ position: 'absolute', inset: '0 0 0 50%', background: `linear-gradient(150deg,${c}ee,${c}88)` }} />
        <div style={{ position: 'relative', zIndex: 3, maxWidth: '80rem', margin: '0 auto', padding: '0 2rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', minHeight: 452 }}>
          <div style={{ maxWidth: 460, width: '100%' }}>
            <SlideContent banner={banner} c="#fff" dark={false} />
          </div>
        </div>
      </div>
    );
  }

  if (style === 'editorial') {
    return (
      <div style={{ position: 'relative', width: '100%', minHeight: 520, paddingTop: 68, background: 'var(--s1)', overflow: 'hidden' }}>
        {hasImage
          ? <div style={{ position: 'absolute', top: 0, right: 0, width: '42%', height: '100%', overflow: 'hidden', clipPath: 'polygon(12% 0,100% 0,100% 100%,0% 100%)' }}>
              <img src={imgUrl(banner.image)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .55, mixBlendMode: 'multiply' }} />
            </div>
          : <div style={{ position: 'absolute', top: 0, right: 0, width: '42%', height: '100%', clipPath: 'polygon(12% 0,100% 0,100% 100%,0% 100%)', background: `linear-gradient(160deg,${c},${c}88)` }} />
        }
        <div style={{ position: 'relative', zIndex: 3, maxWidth: '80rem', margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', minHeight: 452 }}>
          <div style={{ maxWidth: 540, paddingRight: '8%' }}>
            <SlideContent banner={banner} c={c} dark={false} />
          </div>
        </div>
      </div>
    );
  }

  if (style === 'bold') {
    return (
      <div style={{ position: 'relative', width: '100%', minHeight: 520, paddingTop: 68, background: '#0e0e11', overflow: 'hidden' }}>
        {hasImage && <img src={imgUrl(banner.image)} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: .22 }} />}
        <div style={{ position: 'absolute', top: 0, right: 0, width: '36%', height: '100%', clipPath: 'polygon(18% 0,100% 0,100% 100%,0% 100%)', background: c, opacity: .92 }} />
        <div style={{ position: 'relative', zIndex: 3, maxWidth: '80rem', margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', minHeight: 452 }}>
          <div style={{ maxWidth: 680 }}>
            <SlideContent banner={banner} c={c} />
          </div>
        </div>
      </div>
    );
  }

  if (style === 'neon') {
    return (
      <div style={{ position: 'relative', width: '100%', minHeight: 520, paddingTop: 68, background: '#04040a', overflow: 'hidden' }}>
        {/* Grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)', backgroundSize: '56px 56px' }} />
        {/* Orbs */}
        <div style={{ position: 'absolute', top: -100, right: '8%', width: 520, height: 520, borderRadius: '50%', background: `${c}22`, filter: 'blur(110px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -120, left: '3%', width: 340, height: 340, borderRadius: '50%', background: `${c}14`, filter: 'blur(90px)', pointerEvents: 'none' }} />
        {hasImage && <img src={imgUrl(banner.image)} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: .12 }} />}
        <div style={{ position: 'relative', zIndex: 3, maxWidth: '80rem', margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', minHeight: 452 }}>
          <div style={{ maxWidth: 680 }}>
            <SlideContent banner={banner} c={c} />
          </div>
        </div>
      </div>
    );
  }

  if (style === 'parallax') {
    return <ParallaxBannerSlide banner={banner} c={c} hasImage={hasImage} hasText={hasText} />;
  }

  // Default: cinematic
  return (
    <div style={{ position: 'relative', width: '100%', minHeight: 520, paddingTop: 68, background: '#070709', overflow: 'hidden' }}>
      {hasImage && (
        <>
          <img src={imgUrl(banner.image)} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: .5 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(110deg,rgba(5,5,8,.96) 0%,rgba(5,5,8,.72) 42%,rgba(5,5,8,.08) 100%)' }} />
        </>
      )}
      {!hasImage && (
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 70% 50%,${c}15 0%,transparent 60%)` }} />
      )}
      <div style={{ position: 'relative', zIndex: 3, maxWidth: '80rem', margin: '0 auto', padding: '0 2rem', display: 'flex', alignItems: 'center', minHeight: 452 }}>
        <div style={{ maxWidth: 640 }}>
          <SlideContent banner={banner} c={c} />
        </div>
      </div>
    </div>
  );
}

// ─── Conteúdo do slide (textos + CTA) ────────────────────────────────────────
function SlideContent({ banner, c, dark = true }: { banner: Banner; c: string; dark?: boolean }) {
  const textPrimary = dark ? '#fff' : '#0d0d0e';
  const textSecondary = dark ? 'rgba(255,255,255,.5)' : '#6b6b70';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Badge / subtítulo */}
      {banner.subtitle?.trim() && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 18,
          padding: '5px 14px', borderRadius: 999,
          background: dark ? `${c}15` : `${c}18`,
          border: `1px solid ${c}30`,
          width: 'fit-content',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: c, display: 'inline-block', flexShrink: 0 }} />
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700, color: c, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {banner.subtitle}
          </span>
        </div>
      )}

      {/* Título */}
      {banner.title?.trim() && (
        <h1 style={{
          fontFamily: "'Outfit',sans-serif",
          fontSize: 'clamp(2rem,4.5vw,3.8rem)',
          fontWeight: 900, lineHeight: 1.06, letterSpacing: '-0.03em',
          color: textPrimary, margin: '0 0 14px', maxWidth: 620,
        }}>
          {banner.title}
        </h1>
      )}

      {/* Descrição */}
      {banner.description?.trim() && (
        <p style={{
          fontFamily: "'DM Sans',sans-serif",
          fontSize: 'clamp(0.9rem,1.4vw,1.05rem)',
          fontWeight: 300, lineHeight: 1.72,
          color: textSecondary, margin: '0 0 30px', maxWidth: 500,
        }}>
          {banner.description}
        </p>
      )}

      {/* CTA */}
      {banner.cta_text?.trim() && (
        <div>
          <a
            href={banner.cta_link || '#'}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '13px 28px', borderRadius: 999,
              background: `linear-gradient(135deg,${c},${c}cc)`,
              boxShadow: `0 10px 36px ${c}40,0 2px 8px ${c}25`,
              color: '#fff', fontFamily: "'DM Sans',sans-serif",
              fontWeight: 800, fontSize: 14, textDecoration: 'none',
              transition: 'transform .2s,box-shadow .2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.04) translateY(-1px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; }}
          >
            {banner.cta_text}
            <ArrowRight size={15} />
          </a>
        </div>
      )}
    </div>
  );
}

// ─── Carrossel principal ──────────────────────────────────────────────────────
interface PageBannerProps {
  page: string;
  fallback?: React.ReactNode;
  dark?: boolean;
}

export function PageBanner({ page, fallback, dark }: PageBannerProps) {
  const { getBannersByPage } = useData();
  const banners = getBannersByPage(page);
  const [cur, setCur] = useState(0);

  // Garante que cur não fique fora do range quando banners mudam
  useEffect(() => {
    if (cur >= banners.length && banners.length > 0) setCur(0);
  }, [banners.length]);

  // Auto-avanço
  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setCur(p => (p + 1) % banners.length), 6500);
    return () => clearInterval(t);
  }, [banners.length]);

  const prev = useCallback(() => setCur(p => (p - 1 + banners.length) % banners.length), [banners.length]);
  const next = useCallback(() => setCur(p => (p + 1) % banners.length), [banners.length]);

  // Sem banners → não renderiza nada
  if (!banners.length) return null;

  const accent = banners[cur]?.bg_color || '#f97316';

  return (
    <div style={{ position: 'relative' }}>
      {/* Slides */}
      <div style={{ position: 'relative' }}>
        {banners.map((b, i) => (
          <div
            key={b.id}
            style={{
              ...(i === cur
                ? { position: 'relative', opacity: 1, zIndex: 2 }
                : { position: 'absolute', inset: 0, opacity: 0, zIndex: 1, pointerEvents: 'none', overflow: 'hidden' }),
              transition: 'opacity 0.75s ease',
            }}
          >
            <BannerSlide banner={b} />
          </div>
        ))}
      </div>

      {/* Controles — só aparecem com 2+ banners */}
      {banners.length > 1 && (
        <>
          {/* Prev */}
          <button
            onClick={prev}
            aria-label="Banner anterior"
            style={{
              position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
              zIndex: 10, width: 44, height: 44, borderRadius: '50%',
              background: 'rgba(0,0,0,.4)', border: '1px solid rgba(255,255,255,.15)',
              color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background .2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,.65)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,.4)'; }}
          >
            <ChevronLeft size={20} />
          </button>

          {/* Next */}
          <button
            onClick={next}
            aria-label="Próximo banner"
            style={{
              position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
              zIndex: 10, width: 44, height: 44, borderRadius: '50%',
              background: 'rgba(0,0,0,.4)', border: '1px solid rgba(255,255,255,.15)',
              color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background .2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,.65)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,.4)'; }}
          >
            <ChevronRight size={20} />
          </button>

          {/* Dots */}
          <div style={{
            position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
            zIndex: 10, display: 'flex', gap: 7, alignItems: 'center',
          }}>
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCur(i)}
                aria-label={`Slide ${i + 1}`}
                style={{
                  height: 4, borderRadius: 2, border: 'none', cursor: 'pointer',
                  width: i === cur ? 26 : 8,
                  background: i === cur ? accent : 'rgba(255,255,255,.3)',
                  transition: 'all .35s ease',
                  padding: 0,
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
