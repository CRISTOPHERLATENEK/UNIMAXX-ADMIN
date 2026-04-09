// ─── BlockRenderer.tsx — Renderer compartilhado para SolutionPageDetail e GenericPageView
import React, { useState, useEffect, useRef } from 'react';

import { Link } from 'react-router-dom';
import {
  Check, ArrowRight, Phone, Zap, ChevronDown, Quote,
  Play, X,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const BASE_URL = API_URL.replace('/api', '');

export const resolveImg = (p?: string) =>
  !p ? null : p.startsWith('http') ? p : `${BASE_URL}${p}`;

export const DEFAULT_T = {
  from: '#f97316', to: '#c2410c', text: '#f97316', glow: 'rgba(249,115,22,.35)',
};

export const THEME: Record<string, typeof DEFAULT_T> = {
  orange: { from: '#f97316', to: '#c2410c', text: '#f97316', glow: 'rgba(249,115,22,.35)' },
  blue: { from: '#2563eb', to: '#1e40af', text: '#60a5fa', glow: 'rgba(37,99,235,.35)' },
  green: { from: '#16a34a', to: '#166534', text: '#4ade80', glow: 'rgba(22,163,74,.35)' },
  purple: { from: '#9333ea', to: '#6b21a8', text: '#c084fc', glow: 'rgba(147,51,234,.35)' },
  black: { from: '#1f2937', to: '#030712', text: '#9ca3af', glow: 'rgba(31,41,55,.5)' },
  white: { from: '#f8fafc', to: '#e2e8f0', text: '#475569', glow: 'rgba(248,250,252,.5)' },
};

import type { PageBlock } from '@/types';
import { BannerSlide } from '@/components/PageBanner';

// ── Helpers ───────────────────────────────────────────────────────────────────

function DarkCard({ pc, children }: { pc: string; children: React.ReactNode }) {
  return (
    <div style={{
      position: 'relative', overflow: 'hidden', borderRadius: 28,
      padding: '64px 48px', background: '#0d0d0f',
      border: '1px solid rgba(255,255,255,.07)',
      boxShadow: '0 32px 80px rgba(0,0,0,.35)',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 70% 60% at 5% 40%,${pc}0d,transparent),radial-gradient(ellipse 50% 70% at 95% 15%,${pc}08,transparent)`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: `linear-gradient(90deg,transparent,${pc}30,transparent)` }} />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}

// Spacing map
const SPACING: Record<string, string> = {
  compact: '40px 0',
  normal: '64px 0',
  spacious: '112px 0',
};
const RADIUS: Record<string, number> = {
  none: 0, medium: 16, large: 24,
};

function sectionPad(block: PageBlock) {
  return SPACING[block.blockSpacing || 'normal'];
}
function cardRadius(block: PageBlock) {
  return RADIUS[block.blockRadius || 'large'];
}

// ── FAQ ───────────────────────────────────────────────────────────────────────

function FaqBlock({ block, t }: { block: PageBlock; t: typeof DEFAULT_T }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section style={{ padding: sectionPad(block) }} className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="bg-white shadow-sm" style={{ borderRadius: cardRadius(block), border: '1px solid rgba(0,0,0,.06)', padding: '40px' }}>
        {block.title && (
          <div className="text-center mb-10">
            <h2 className="font-bold text-[#1d1d1f]" style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(1.5rem,3vw,2.5rem)' }}>{block.title}</h2>
          </div>
        )}
        <div className="max-w-2xl mx-auto space-y-3">
          {(block.faq || []).map((faq, i) => (
            <div key={i} className="overflow-hidden transition-all" style={{ borderRadius: 16, border: `1px solid ${open === i ? t.from + '35' : 'rgba(0,0,0,.07)'}` }}>
              <button className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
                style={{ background: open === i ? `${t.from}06` : '#fff' }}
                onClick={() => setOpen(open === i ? null : i)}>
                <span className="font-semibold text-[#1d1d1f] text-[15px]">{faq.question}</span>
                <ChevronDown className="w-5 h-5 flex-shrink-0 transition-transform" style={{ color: t.from, transform: open === i ? 'rotate(180deg)' : 'none' }} />
              </button>
              {open === i && <div className="px-6 pb-5 text-[#6e6e73] leading-relaxed text-sm">{faq.answer}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Video Modal ───────────────────────────────────────────────────────────────

function VideoModal({ videoId, onClose }: { videoId: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <div className="w-full max-w-4xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-end mb-3">
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center text-white transition"
            style={{ background: 'rgba(255,255,255,.15)' }}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="relative w-full rounded-2xl overflow-hidden" style={{ paddingTop: '56.25%', boxShadow: '0 40px 80px rgba(0,0,0,.8)' }}>
          <iframe className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title="Vídeo" allowFullScreen allow="autoplay" />
        </div>
      </div>
    </div>
  );
}

// ── BenefitsBlock ─────────────────────────────────────────────────────────────
function BenefitsBlock({ block, t }: { block: any; t: any }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const imgRef = useRef<HTMLDivElement>(null);

  const iconItems = block.iconItems || [];
  const simpleItems = block.items || [];
  const allItems = iconItems.length > 0 ? iconItems : simpleItems.map((s: string) => ({ icon: '⚡', label: s, desc: '' }));
  const imgSrc = resolveImg(block.imageUrl);
  const hasSide = imgSrc && block.benefitsLayout === 'side_image';

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).style.opacity = '1';
          (e.target as HTMLElement).style.transform = 'translateY(0)';
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });

    itemsRef.current.forEach(el => { if (el) obs.observe(el); });
    if (imgRef.current) obs.observe(imgRef.current);
    return () => obs.disconnect();
  }, [allItems.length]);

  return (
    <section style={{ padding: '60px 0' }} className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <style>{`
        @keyframes ben-float {
          0%,100% { transform: translateY(0px) rotate(-1deg); }
          50%      { transform: translateY(-18px) rotate(1deg); }
        }
        .ben-img-wrap { animation: ben-float 5s ease-in-out infinite; }
      `}</style>

      <div ref={containerRef} style={{ display: 'flex', alignItems: 'center', gap: 'clamp(40px,6vw,96px)', flexWrap: hasSide ? undefined : 'wrap' }}>

        {/* ── Left ── */}
        <div style={{ flex: 1, minWidth: 280 }}>
          {block.title && (
            <h2 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 'clamp(1.5rem,3vw,2.25rem)', color: '#1d1d1f', lineHeight: 1.12, marginBottom: 8 }}>
              {block.title}
            </h2>
          )}
          {block.subtitle && (
            <p style={{ color: '#9a9a9f', fontSize: 14, lineHeight: 1.6, marginBottom: 28, fontFamily: "'DM Sans',sans-serif", maxWidth: 460 }}>
              {block.subtitle}
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {allItems.map((item: any, i: number) => (
              <div
                key={i}
                ref={el => { itemsRef.current[i] = el; }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 16px', borderRadius: 14,
                  background: '#fff',
                  border: '1px solid rgba(0,0,0,.06)',
                  boxShadow: '0 1px 8px rgba(0,0,0,.04)',
                  opacity: 0,
                  transform: 'translateY(20px)',
                  transition: `opacity .45s ease ${i * 0.08}s, transform .45s ease ${i * 0.08}s`,
                }}
              >
                {/* icon */}
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${t.from}10`,
                  border: `1.5px solid ${t.from}30`,
                  fontSize: 18, lineHeight: 1,
                }}>
                  {typeof item === 'string' ? '⚡' : item.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, color: '#1d1d1f', fontSize: 14, marginBottom: (typeof item !== 'string' && item.desc) ? 2 : 0, fontFamily: "'Outfit',sans-serif" }}>
                    {typeof item === 'string' ? item : item.label}
                  </p>
                  {typeof item !== 'string' && item.desc && (
                    <p style={{ color: '#9a9a9f', fontSize: 12, lineHeight: 1.5, fontFamily: "'DM Sans',sans-serif" }}>{item.desc}</p>
                  )}
                </div>
                <div style={{ width: 2.5, height: 28, borderRadius: 99, background: t.from, opacity: 0.7, flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Right image ── */}
        {hasSide && (
          <div
            ref={imgRef}
            style={{
              flexShrink: 0, width: 'clamp(240px,38%,440px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: 0, transform: 'translateY(32px)',
              transition: 'opacity .7s ease .2s, transform .7s ease .2s',
            }}
          >
            {/* soft glow blob */}
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', inset: '-10%', borderRadius: '50%',
                background: `radial-gradient(circle, ${t.from}30 0%, transparent 65%)`,
                filter: 'blur(40px)',
              }} />
              <div className="ben-img-wrap">
                <img
                  src={imgSrc!}
                  alt={block.title || ''}
                  style={{ position: 'relative', zIndex: 1, width: '100%', maxHeight: 480, objectFit: 'contain', filter: 'drop-shadow(0 24px 48px rgba(0,0,0,.15))' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ── BlockRenderer ─────────────────────────────────────────────────────────────

export function BlockRenderer({ block, t = DEFAULT_T }: { block: PageBlock; t?: typeof DEFAULT_T }) {
  const [videoOpen, setVideoOpen] = useState(false);

  if (!block.visible) return null;

  const isDark = block.colorTheme === 'dark';
  const isBrand = block.colorTheme === 'brand';
  const textCol = (isDark || isBrand) ? 'white' : '#1d1d1f';
  const subCol = (isDark || isBrand) ? 'rgba(255,255,255,.6)' : '#6e6e73';

  switch (block.type) {

    // ── HERO ─────────────────────────────────────────────────────────────────
    case 'hero': {
      // Converte campos do PageBlock para o formato Banner — renderiza igual ao carrossel da home
      const heroBanner = {
        id: 0,
        title: block.title || '',
        subtitle: block.badge || '',
        description: block.description || '',
        cta_text: block.ctaLabel || '',
        cta_link: block.ctaLink || '',
        image: block.imageUrl || '',
        bg_color: block.accentColor || t.from,
        banner_style: (block.bannerStyle || 'cinematic') as any,
        use_style: (block as any).useStyle ?? 1,
        use_default_bg: (block as any).useDefaultBg ?? (block.imageUrl ? 0 : 1),
        active: 1,
        order_num: 0,
        page: '',
      };
      return <BannerSlide banner={heroBanner} />;
    }


    // ── FEATURES ─────────────────────────────────────────────────────────────
    case 'features': {
      const layout = block.featuresLayout || 'grid';
      const rr = cardRadius(block);
      const iconItems = block.iconItems || [];
      const simpleItems = block.items || [];
      const hasIconItems = iconItems.length > 0;

      const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <section style={{ padding: sectionPad(block) }} className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="bg-white shadow-sm" style={{ borderRadius: rr, border: '1px solid rgba(0,0,0,.06)', padding: '40px' }}>
            {block.title && <div className="text-center mb-10"><h2 className="font-bold text-[#1d1d1f]" style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(1.6rem,3vw,2.5rem)' }}>{block.title}</h2></div>}
            {children}
          </div>
        </section>
      );

      // Checklist minimalista — só texto simples
      if (layout === 'checklist') {
        return (
          <Wrapper>
            <div className="grid sm:grid-cols-2 gap-3 max-w-3xl mx-auto">
              {simpleItems.map((f, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 px-4 rounded-xl" style={{ background: '#f9f9fb', border: '1px solid rgba(0,0,0,.04)' }}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${t.from}15` }}>
                    <Check className="w-3 h-3" style={{ color: t.from }} />
                  </div>
                  <p className="text-[14px] text-[#1d1d1f] font-medium">{f}</p>
                </div>
              ))}
            </div>
          </Wrapper>
        );
      }

      // Cards com hover animado
      if (layout === 'cards_hover') {
        return (
          <Wrapper>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(hasIconItems ? iconItems : simpleItems.map(s => ({ icon: '✅', label: s, desc: '' }))).map((item, i) => (
                <div key={i} className="group p-6 rounded-2xl cursor-default transition-all duration-300"
                  style={{ background: '#f9f9fb', border: '1px solid rgba(0,0,0,.05)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${t.from}08`; (e.currentTarget as HTMLElement).style.borderColor = `${t.from}25`; (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 32px ${t.from}15`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#f9f9fb'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,.05)'; (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}>
                  <div className="text-2xl mb-3">{typeof item === 'string' ? '✅' : item.icon}</div>
                  <p className="font-bold text-[#1d1d1f] text-[15px] mb-1" style={{ fontFamily: "'Outfit',sans-serif" }}>
                    {typeof item === 'string' ? item : item.label}
                  </p>
                  {typeof item !== 'string' && item.desc && <p className="text-[13px] text-[#6e6e73] leading-relaxed">{item.desc}</p>}
                </div>
              ))}
            </div>
          </Wrapper>
        );
      }

      // Grid padrão (com ícone se disponível)
      return (
        <Wrapper>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(hasIconItems ? iconItems : simpleItems.map(s => ({ icon: '✅', label: s, desc: '' }))).map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: '#f9f9fb', border: '1px solid rgba(0,0,0,.05)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg" style={{ background: `${t.from}12` }}>
                  {typeof item === 'string' ? <Check className="w-4 h-4" style={{ color: t.from }} /> : item.icon}
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#1d1d1f] leading-snug">
                    {typeof item === 'string' ? item : item.label}
                  </p>
                  {typeof item !== 'string' && item.desc && <p className="text-[12px] text-[#6e6e73] mt-0.5 leading-relaxed">{item.desc}</p>}
                </div>
              </div>
            ))}
          </div>
        </Wrapper>
      );
    }

    // ── BENEFITS ─────────────────────────────────────────────────────────────
    case 'benefits':
      return <BenefitsBlock block={block} t={t} />;

    // ── IMAGE TEXT (novo — estilo "Combate Intenso") ──────────────────────────
    case 'image_text': {
      const imgSrc = resolveImg(block.imageUrl);
      const isDark = block.colorTheme === 'dark';
      const bg = isDark ? '#0d0d0f' : '#fff';
      const titleCol = isDark ? '#fff' : '#1d1d1f';
      const descCol = isDark ? 'rgba(255,255,255,.6)' : '#6e6e73';
      const imgRight = block.imagePosition !== 'left';
      const rr = cardRadius(block);

      return (
        <section style={{ padding: sectionPad(block) }} className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="overflow-hidden" style={{ background: bg, borderRadius: rr, border: isDark ? '1px solid rgba(255,255,255,.07)' : '1px solid rgba(0,0,0,.06)', boxShadow: isDark ? '0 32px 80px rgba(0,0,0,.35)' : '0 20px 60px rgba(0,0,0,.04)' }}>
            {isDark && <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 60% 80% at ${imgRight ? '0%' : '100%'} 50%,${t.from}0a,transparent)`, pointerEvents: 'none', borderRadius: rr }} />}
            <div className={`grid lg:grid-cols-2 ${imgRight ? '' : 'lg:[direction:rtl]'}`}>
              {/* Text side */}
              <div className="p-10 lg:p-14 flex flex-col justify-center" style={{ direction: 'ltr' }}>
                {block.badge && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5 self-start"
                    style={{ background: isDark ? `${t.from}18` : `${t.from}10`, color: t.from, border: `1px solid ${t.from}25` }}>
                    {block.badge}
                  </div>
                )}
                {block.title && (
                  <h2 className="font-black leading-tight mb-4"
                    style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(1.8rem,3.5vw,2.75rem)', letterSpacing: '-0.04em', color: titleCol }}>
                    {block.title}
                  </h2>
                )}
                {block.subtitle && (
                  <p className="font-semibold mb-3" style={{ color: t.from, fontFamily: "'Outfit',sans-serif" }}>
                    {block.subtitle}
                  </p>
                )}
                {block.description && (
                  <p className="leading-relaxed mb-8" style={{ color: descCol, fontSize: '0.95rem' }}>
                    {block.description}
                  </p>
                )}
                {block.items && block.items.length > 0 && (
                  <div className="space-y-2.5 mb-8">
                    {block.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${t.from}20` }}>
                          <Check className="w-3 h-3" style={{ color: t.from }} />
                        </div>
                        <p style={{ color: isDark ? 'rgba(255,255,255,.75)' : '#1d1d1f', fontSize: '0.9rem' }}>{item}</p>
                      </div>
                    ))}
                  </div>
                )}
                {(block.ctaLabel || block.secondaryLabel) && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    {block.ctaLabel && (
                      <Link to={block.ctaLink || '/cliente'}>
                        <button className="flex items-center gap-2.5 px-6 py-3 rounded-2xl font-bold text-[14px] text-white transition hover:scale-[1.02]"
                          style={{ background: `linear-gradient(135deg,${t.from},${t.to})`, boxShadow: `0 8px 24px ${t.from}30` }}>
                          <Phone className="w-4 h-4" />{block.ctaLabel}
                        </button>
                      </Link>
                    )}
                    {block.secondaryLabel && (
                      <Link to={block.secondaryLink || '/'}>
                        <button className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-[14px] transition hover:scale-[1.02]"
                          style={{ background: isDark ? 'rgba(255,255,255,.08)' : '#f5f5f7', color: isDark ? '#fff' : '#1d1d1f', border: isDark ? '1px solid rgba(255,255,255,.12)' : '1px solid rgba(0,0,0,.08)' }}>
                          {block.secondaryLabel}<ArrowRight className="w-4 h-4" />
                        </button>
                      </Link>
                    )}
                  </div>
                )}
              </div>
              {/* Image side */}
              <div className="relative" style={{ minHeight: 360, direction: 'ltr' }}>
                {imgSrc
                  ? <img src={imgSrc} alt={block.imageAlt || block.title || ''} className="w-full h-full object-cover" style={{ minHeight: 360 }} />
                  : <div className="w-full h-full flex items-center justify-center" style={{ minHeight: 360, background: isDark ? 'rgba(255,255,255,.03)' : '#f9f9fb' }}><span style={{ fontSize: 80 }}>🖼️</span></div>
                }
              </div>
            </div>
          </div>
        </section>
      );
    }

    // ── STEPS ─────────────────────────────────────────────────────────────────
    case 'steps': {
      const rr = cardRadius(block);
      return (
        <section style={{ padding: sectionPad(block) }} className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="bg-white shadow-sm" style={{ borderRadius: rr, border: '1px solid rgba(0,0,0,.06)', padding: '40px' }}>
            {block.title && <div className="text-center mb-10"><h2 className="font-bold text-[#1d1d1f]" style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(1.6rem,3vw,2.5rem)' }}>{block.title}</h2></div>}
            <div className="max-w-2xl mx-auto space-y-5">
              {(block.steps || []).map((step, i) => (
                <div key={i} className="flex gap-5 items-start">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold text-lg" style={{ background: `linear-gradient(135deg,${t.from},${t.to})`, color: '#fff', fontFamily: "'Outfit',sans-serif", boxShadow: `0 8px 24px ${t.glow}` }}>{i + 1}</div>
                  <div className="flex-1 pt-2 pb-5 border-b last:border-0" style={{ borderColor: 'rgba(0,0,0,.06)' }}>
                    <h3 className="font-bold text-[#1d1d1f] text-base mb-1" style={{ fontFamily: "'Outfit',sans-serif" }}>{step.title}</h3>
                    <p className="text-[#6e6e73] text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    // ── STATS ─────────────────────────────────────────────────────────────────
    case 'stats':
      return (
        <div className="bg-white border-b" style={{ borderColor: 'rgba(0,0,0,.06)' }}>
          <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {(block.stats || []).map((s, i) => (
              <div key={i} className="text-center">
                <p className="font-bold text-3xl mb-1" style={{ color: t.from, fontFamily: "'Outfit',sans-serif" }}>{s.value}</p>
                <p className="text-[#6e6e73] text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      );

    // ── TESTIMONIAL ───────────────────────────────────────────────────────────
    case 'testimonial':
      if (!block.quote) return null;
      return (
        <section style={{ padding: sectionPad(block) }} className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <DarkCard pc={t.from}>
            <div className="max-w-2xl mx-auto text-center">
              <Quote className="w-10 h-10 mx-auto mb-6" style={{ color: t.text }} />
              <blockquote className="text-white text-xl font-medium leading-relaxed mb-8 italic">"{block.quote}"</blockquote>
              {(block.author || block.role) && (
                <div>
                  {block.author && <p className="text-white font-bold" style={{ fontFamily: "'Outfit',sans-serif" }}>{block.author}</p>}
                  {block.role && <p className="text-white/50 text-sm mt-1">{block.role}</p>}
                </div>
              )}
            </div>
          </DarkCard>
        </section>
      );

    // ── FAQ ───────────────────────────────────────────────────────────────────
    case 'faq':
      if (!(block.faq || []).length) return null;
      return <FaqBlock block={block} t={t} />;

    // ── VIDEO ─────────────────────────────────────────────────────────────────
    case 'video': {
      if (!block.videoUrl) return null;
      const m = block.videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
      const vid = m ? m[1] : null;
      if (!vid) return null;
      return (
        <section style={{ padding: sectionPad(block) }} className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <DarkCard pc={t.from}>
            {block.title && <div className="text-center mb-8"><h2 className="font-bold text-white" style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(1.4rem,2.5vw,2.25rem)' }}>{block.title}</h2></div>}
            <div className="relative w-full rounded-2xl overflow-hidden max-w-3xl mx-auto" style={{ paddingTop: '56.25%', boxShadow: '0 32px 64px rgba(0,0,0,.6)' }}>
              <iframe className="absolute inset-0 w-full h-full" src={`https://www.youtube.com/embed/${vid}?rel=0&modestbranding=1`} title={block.title || 'Vídeo'} allowFullScreen />
            </div>
          </DarkCard>
        </section>
      );
    }

    // ── CTA ───────────────────────────────────────────────────────────────────
    case 'cta':
      return (
        <section style={{ padding: sectionPad(block) }} className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="rounded-3xl p-14 text-center relative overflow-hidden" style={{ background: `linear-gradient(135deg,${t.from} 0%,${t.to} 100%)` }}>
            <div className="absolute inset-0 opacity-[.05]" style={{ backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '24px 24px' }} />
            <div className="relative">
              {block.title && <h2 className="font-bold text-white mb-4 leading-tight" style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(1.75rem,4vw,3rem)' }}>{block.title}</h2>}
              {block.description && <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">{block.description}</p>}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {block.ctaLabel && <Link to={block.ctaLink || '/cliente'}><button className="flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-[15px] transition-all hover:scale-[1.03]" style={{ background: '#fff', color: t.from, boxShadow: '0 12px 32px rgba(0,0,0,.2)' }}><Phone className="w-5 h-5" />{block.ctaLabel}</button></Link>}
                {block.secondaryLabel && <Link to={block.secondaryLink || '/'}><button className="flex items-center gap-2.5 px-8 py-4 rounded-2xl font-semibold text-[15px] text-white transition-all hover:scale-[1.03]" style={{ background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.3)' }}>{block.secondaryLabel}<ArrowRight className="w-4 h-4" /></button></Link>}
              </div>
            </div>
          </div>
        </section>
      );

    // ── TEXT ──────────────────────────────────────────────────────────────────
    case 'text':
      return (
        <section style={{ padding: sectionPad(block) }} className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl p-10 shadow-sm" style={{ border: '1px solid rgba(0,0,0,.06)' }}>
            {block.title && <h2 className="font-bold text-[#1d1d1f] mb-4" style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(1.4rem,2.5vw,2rem)' }}>{block.title}</h2>}
            {block.description && <p className="text-[#6e6e73] leading-relaxed text-[15px] whitespace-pre-wrap">{block.description}</p>}
          </div>
        </section>
      );

    // ── RICHTEXT ──────────────────────────────────────────────────────────────
    case 'richtext':
      if (!block.html) return null;
      return (
        <section style={{ padding: sectionPad(block) }} className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl p-10 shadow-sm prose prose-base max-w-none" style={{ border: '1px solid rgba(0,0,0,.06)' }} dangerouslySetInnerHTML={{ __html: block.html }} />
        </section>
      );

    // ── IMAGE — sem borda, sem box ────────────────────────────────────────────
    case 'image': {
      const src = resolveImg(block.imageUrl);
      if (!src) return null;
      return (
        <section style={{ padding: sectionPad(block) }} className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="overflow-hidden" style={{ borderRadius: cardRadius(block) }}>
            <img src={src} alt={block.imageAlt || ''} className="w-full object-cover" />
          </div>
        </section>
      );
    }

    // ── INTEGRATIONS ──────────────────────────────────────────────────────────
    case 'integrations':
      if (!(block.items || []).length) return null;
      return (
        <section style={{ padding: sectionPad(block) }} className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl p-10 shadow-sm" style={{ border: '1px solid rgba(0,0,0,.06)' }}>
            {block.title && <div className="text-center mb-8"><h2 className="font-bold text-[#1d1d1f]" style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(1.4rem,2.5vw,2.25rem)' }}>{block.title}</h2></div>}
            <div className="flex flex-wrap gap-3 justify-center">
              {(block.items || []).map((item, i) => (
                <span key={i} className="px-5 py-2.5 rounded-full text-[13px] font-semibold" style={{ background: '#f5f5f7', color: '#1d1d1f', border: '1px solid rgba(0,0,0,.07)' }}>{item}</span>
              ))}
            </div>
          </div>
        </section>
      );

    // ── ALERT BANNER ──────────────────────────────────────────────────────────
    case 'alert_banner': {
      if (!block.alertText) return null;
      const ac = { info: { bg: '#eff6ff', text: '#1d4ed8', icon: 'ℹ️' }, success: { bg: '#f0fdf4', text: '#15803d', icon: '✅' }, warning: { bg: '#fffbeb', text: '#b45309', icon: '⚠️' }, error: { bg: '#fef2f2', text: '#dc2626', icon: '🚨' } }[block.alertType || 'info'];
      return (
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-3">
          <div className="rounded-2xl px-5 py-3.5 flex items-center gap-3 text-[14px] font-medium" style={{ background: ac.bg, color: ac.text }}>
            <span className="text-lg">{ac.icon}</span><span>{block.alertText}</span>
          </div>
        </div>
      );
    }

    // ── DIVIDER ───────────────────────────────────────────────────────────────
    case 'divider':
      if (block.dividerStyle === 'space') return <div style={{ height: 48 }} />;
      if (block.dividerStyle === 'dots') return (
        <div className="flex items-center justify-center gap-2 py-6">
          {[0, 1, 2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(0,0,0,.15)' }} />)}
        </div>
      );
      return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"><hr style={{ borderColor: 'rgba(0,0,0,.08)' }} /></div>;

    default:
      return null;
  }
}