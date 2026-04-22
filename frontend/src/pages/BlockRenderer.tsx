// ─── BlockRenderer.tsx — Renderer compartilhado para SolutionPageDetail e GenericPageView
import React, { useState, useEffect, useRef } from 'react';

import { Link } from 'react-router-dom';
import {
  Check, ArrowRight, Phone, Zap, ChevronDown, Quote,
  Play, X,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const BASE_URL = API_URL.replace('/api', '');

export const resolveImg = (p?: string) => {
  if (!p) return null;
  if (p.startsWith('http')) return p;
  // Se o caminho já começa com /uploads, não duplica
  const cleanPath = p.startsWith('/') ? p : `/${p}`;
  if (cleanPath.startsWith('/uploads')) {
    return `${BASE_URL}${cleanPath}`;
  }
  return `${BASE_URL}/uploads${cleanPath}`;
};

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
import { AnimatedBgLayer } from '@/components/AnimatedBgLayer';
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
  const isOxpay = block.animatedBg === 'oxpay';
  const textCol = (isDark || isBrand || isOxpay) ? 'white' : '#1d1d1f';
  const subCol = (isDark || isBrand || isOxpay) ? 'rgba(255,255,255,.6)' : '#6e6e73';
  const hasAnim = block.animatedBg && block.animatedBg !== 'none';

  const inner = renderBlockInner({ block, t, textCol, subCol, videoOpen, setVideoOpen });

  if (isOxpay) {
    const bgColor = block.animatedBgColor || '#050508';
    return (
      <div style={{ position: 'relative', isolation: 'isolate', marginTop: 60, padding: '0 20px' }}>
        {/* O Formato de Aba Oxpay (Folder Tab) */}
        <div style={{ 
          position: 'absolute', 
          top: -40, 
          right: 20, 
          width: '280px', 
          height: 41, 
          background: bgColor,
          borderRadius: '24px 24px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          boxShadow: '0 -10px 30px rgba(0,0,0,0.1)'
        }}>
          <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2 }} />
          <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2 }} />
          <div style={{ width: 40, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2 }} />
        </div>
        <div style={{ 
          position: 'relative', 
          zIndex: 1, 
          background: bgColor,
          borderRadius: '48px 0 48px 48px',
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
        }}>
          <div style={{ position: 'relative', zIndex: 2 }}>{inner}</div>
        </div>
      </div>
    );
  }

  if (!hasAnim) return <>{inner}</>;
  return (
    <div style={{ position: 'relative', isolation: 'isolate' }}>
      <AnimatedBgLayer type={block.animatedBg} color={block.animatedBgColor || t.from} />
      <div style={{ position: 'relative', zIndex: 1 }}>{inner}</div>
    </div>
  );
}

function renderBlockInner({ block, t, textCol, subCol, videoOpen, setVideoOpen }: {
  block: PageBlock; t: typeof DEFAULT_T; textCol: string; subCol: string;
  videoOpen: boolean; setVideoOpen: (v: boolean) => void;
}): React.ReactNode {
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
      const layout = block.featuresLayout || 'split_dark';
      const rr = cardRadius(block);
      const iconItems = block.iconItems || [];
      const simpleItems = block.items || [];
      const hasIconItems = iconItems.length > 0;
      const allItems = hasIconItems ? iconItems : simpleItems.map(s => ({ icon: '✅', label: s, desc: '' }));
      const ac = block.featuresAccent || t.from;
      const label = block.featuresLabel || '';
      const mainTitle = block.title || '';
      const mainSub = block.subtitle || '';

      // ── SPLIT DARK (inspiração 1 — painel escuro, título esq, cards col. dir) ──
      if (layout === 'split_dark') {
        const cols = allItems.length <= 4 ? 2 : 3;
        return (
          <section style={{ padding: sectionPad(block) }} className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div style={{ background: '#15161a', borderRadius: rr, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1.6fr' }}>
              {/* Lado esquerdo — título */}
              <div style={{ padding: '56px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,.07)' }}>
                {label && <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.1em', color: ac, marginBottom: 16 }}>{label}</p>}
                <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(1.6rem,2.5vw,2.2rem)', fontWeight: 800, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: mainSub ? 20 : 0 }}>{mainTitle}</h2>
                {mainSub && <p style={{ fontSize: 14, color: 'rgba(255,255,255,.5)', lineHeight: 1.6 }}>{mainSub}</p>}
              </div>
              {/* Lado direito — grid de cards */}
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 1, background: 'rgba(255,255,255,.05)' }}>
                {allItems.map((item, i) => {
                  const lbl = typeof item === 'string' ? item : item.label;
                  const ico = typeof item === 'string' ? '' : item.icon;
                  const dsc = typeof item === 'string' ? '' : (item.desc || '');
                  return (
                    <div key={i} style={{ padding: '28px 24px', background: '#15161a', display: 'flex', flexDirection: 'column', gap: 12, cursor: 'default', transition: 'background .2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#1c1d22'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#15161a'; }}>
                      {ico && <div style={{ fontSize: 20, width: 36, height: 36, borderRadius: 10, background: `${ac}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{ico}</div>}
                      <div>
                        <p style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 14, color: '#fff', lineHeight: 1.3 }}>{lbl}</p>
                        {dsc && <p style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', marginTop: 5, lineHeight: 1.5 }}>{dsc}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      }

      // ── DARK CARDS (inspiração 2 — fundo escuro, cards escuros, ícone grande) ──
      if (layout === 'dark_cards') {
        return (
          <section style={{ padding: sectionPad(block) }} className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div style={{ background: '#13141a', borderRadius: rr, padding: '56px 48px' }}>
              {(label || mainTitle || mainSub) && (
                <div style={{ marginBottom: 40 }}>
                  {label && <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', color: ac, marginBottom: 12 }}>{label}</p>}
                  {mainTitle && <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(1.6rem,2.8vw,2.4rem)', fontWeight: 800, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: mainSub ? 16 : 0, maxWidth: 520 }}>{mainTitle}</h2>}
                  {mainSub && <p style={{ fontSize: 14, color: 'rgba(255,255,255,.45)', lineHeight: 1.65, maxWidth: 480 }}>{mainSub}</p>}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12 }}>
                {allItems.map((item, i) => {
                  const lbl = typeof item === 'string' ? item : item.label;
                  const ico = typeof item === 'string' ? '◈' : item.icon;
                  const dsc = typeof item === 'string' ? '' : (item.desc || '');
                  return (
                    <div key={i} style={{ background: '#1c1d26', border: '1px solid rgba(255,255,255,.07)', borderRadius: 16, padding: '24px 20px', cursor: 'default', transition: 'border-color .2s, transform .2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${ac}50`; (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.07)'; (e.currentTarget as HTMLElement).style.transform = ''; }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, border: `1px solid ${ac}30`, background: `${ac}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 16 }}>{ico}</div>
                      <p style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 14, color: '#fff', lineHeight: 1.3, marginBottom: dsc ? 6 : 0 }}>{lbl}</p>
                      {dsc && <p style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', lineHeight: 1.55 }}>{dsc}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      }

      // ── HALF SPLIT (inspiração 3 — fundo claro/escuro dividido ao meio) ──
      if (layout === 'half_split') {
        const half = Math.ceil(allItems.length / 2);
        const leftItems = allItems.slice(0, half);
        const rightItems = allItems.slice(half);
        return (
          <section style={{ padding: sectionPad(block) }} className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div style={{ borderRadius: rr, overflow: 'hidden' }}>
              {/* Cabeçalho centralizado que cruza os dois lados */}
              <div style={{ display: 'flex', position: 'relative' }}>
                <div style={{ flex: 1, background: '#f4f4f6', padding: '48px 40px 24px' }} />
                <div style={{ flex: 1, background: '#0f1017', padding: '48px 40px 24px' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 40, pointerEvents: 'none' }}>
                  <div style={{ textAlign: 'center', maxWidth: 640, padding: '0 20px' }}>
                    {label && (
                      <div style={{ display: 'inline-block', background: '#0f1017', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', padding: '5px 14px', borderRadius: 8, marginBottom: 16 }}>{label}</div>
                    )}
                    {mainTitle && <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(1.5rem,2.8vw,2.3rem)', fontWeight: 800, color: '#0f1017', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: mainSub ? 12 : 0 }}>{mainTitle}</h2>}
                    {mainSub && <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>{mainSub}</p>}
                  </div>
                </div>
              </div>
              {/* Cards em dois lados */}
              <div style={{ display: 'flex' }}>
                {/* Lado claro */}
                <div style={{ flex: 1, background: '#f4f4f6', padding: '16px 40px 48px', display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                  {leftItems.map((item, i) => {
                    const lbl = typeof item === 'string' ? item : item.label;
                    const ico = typeof item === 'string' ? '' : item.icon;
                    const dsc = typeof item === 'string' ? '' : (item.desc || '');
                    return (
                      <div key={i} style={{ background: '#fff', border: '1px solid rgba(0,0,0,.07)', borderRadius: 16, padding: '20px 20px', display: 'flex', gap: 14, alignItems: 'flex-start', transition: 'border-color .2s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${ac}50`; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,.07)'; }}>
                        {ico && <div style={{ width: 40, height: 40, borderRadius: 12, background: `${ac}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{ico}</div>}
                        <div>
                          <p style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 14, color: '#1a1a1a', lineHeight: 1.3 }}>{lbl}</p>
                          {dsc && <p style={{ fontSize: 12, color: '#888', marginTop: 4, lineHeight: 1.5 }}>{dsc}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Lado escuro */}
                <div style={{ flex: 1, background: '#0f1017', padding: '16px 40px 48px', display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                  {rightItems.map((item, i) => {
                    const lbl = typeof item === 'string' ? item : item.label;
                    const ico = typeof item === 'string' ? '' : item.icon;
                    const dsc = typeof item === 'string' ? '' : (item.desc || '');
                    return (
                      <div key={i} style={{ background: '#1a1b24', border: '1px solid rgba(255,255,255,.07)', borderRadius: 16, padding: '20px 20px', display: 'flex', gap: 14, alignItems: 'flex-start', transition: 'border-color .2s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${ac}50`; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.07)'; }}>
                        {ico && <div style={{ width: 40, height: 40, borderRadius: 12, background: `${ac}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{ico}</div>}
                        <div>
                          <p style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 14, color: '#fff', lineHeight: 1.3 }}>{lbl}</p>
                          {dsc && <p style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', marginTop: 4, lineHeight: 1.5 }}>{dsc}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        );
      }

      // ── HIGHLIGHT LIST (lista numerada) ────────────────────────────────────
      if (layout === 'highlight_list') {
        return (
          <section style={{ padding: sectionPad(block) }} className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {(label || mainTitle || mainSub) && (
              <div style={{ textAlign: 'center', marginBottom: 36 }}>
                {label && <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: ac, marginBottom: 10 }}>{label}</p>}
                {mainTitle && <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(1.5rem,2.8vw,2.3rem)', fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.02em', marginBottom: mainSub ? 10 : 0 }}>{mainTitle}</h2>}
                {mainSub && <p style={{ fontSize: 14, color: '#888', lineHeight: 1.6 }}>{mainSub}</p>}
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 10 }}>
              {allItems.map((item, i) => {
                const lbl = typeof item === 'string' ? item : item.label;
                const dsc = typeof item === 'string' ? '' : (item.desc || '');
                return (
                  <div key={i} style={{ display: 'flex', gap: 14, padding: '16px 18px', background: '#fff', border: '1px solid rgba(0,0,0,.07)', borderRadius: 14, alignItems: 'flex-start', transition: 'border-color .2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${ac}50`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,.07)'; }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: ac, color: '#fff', fontWeight: 800, fontSize: 13, fontFamily: "'Outfit',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div style={{ paddingTop: 2 }}>
                      <p style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 14, color: '#1a1a1a', lineHeight: 1.3 }}>{lbl}</p>
                      {dsc && <p style={{ fontSize: 12, color: '#888', marginTop: 4, lineHeight: 1.5 }}>{dsc}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      }

      // ── CHECKLIST ──────────────────────────────────────────────────────────
      if (layout === 'checklist') {
        return (
          <section style={{ padding: sectionPad(block) }} className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {(label || mainTitle || mainSub) && (
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                {label && <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: ac, marginBottom: 10 }}>{label}</p>}
                {mainTitle && <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(1.5rem,2.8vw,2.3rem)', fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.02em', marginBottom: mainSub ? 10 : 0 }}>{mainTitle}</h2>}
                {mainSub && <p style={{ fontSize: 14, color: '#888' }}>{mainSub}</p>}
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 8, maxWidth: 860, margin: '0 auto' }}>
              {allItems.map((item, i) => {
                const lbl = typeof item === 'string' ? item : item.label;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#fff', border: '1px solid rgba(0,0,0,.07)', borderRadius: 50, transition: 'border-color .2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${ac}50`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,.07)'; }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: ac, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check style={{ width: 11, height: 11, color: '#fff', strokeWidth: 3 }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', fontFamily: "'Outfit',sans-serif" }}>{lbl}</span>
                  </div>
                );
              })}
            </div>
          </section>
        );
      }



      // ── COMMUNITY CONNECT ─────────────────────────────────────────────────────
      if (layout === 'community_connect') {
        const bg = block.communityBgColor || '#1e2235';
        const textCol = block.communityTextColor || '#ffffff';
        const accentCol = block.communityAccentColor || '#7c9cff';
        const mutedCol = block.communityMutedColor || '#a0aabe';
        const eyebrow = block.communityEyebrow || 'Before you go...';
        const cards = block.communityCards && block.communityCards.length > 0
          ? block.communityCards
          : [
            { title: 'Discord.', desc: 'Connect our community channel.', linkLabel: 'Join', linkUrl: '#' },
            { title: 'Github.', desc: 'Join our discussion channel.', linkLabel: 'Join', linkUrl: '#' },
            { title: 'Newsletter.', desc: 'Get news and company information.', linkLabel: 'Follow', linkUrl: '#' },
            { title: 'LinkedIn.', desc: 'Adopt best practices in projects.', linkLabel: 'Follow', linkUrl: '#' },
            { title: 'Discuss.', desc: 'Suggest your own ideas.', linkLabel: 'Join', linkUrl: '#' },
            { title: 'E-mail.', desc: 'Ask your follow-up questions.', linkLabel: 'Write', linkUrl: '#' },
          ];
        const cols = cards.length <= 3 ? cards.length : 3;
        const dividerColor = 'rgba(255,255,255,0.08)';
        return (
          <section style={{ padding: sectionPad(block) }} className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div style={{ background: bg, borderRadius: rr, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 2fr' }}>
              <div style={{ padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRight: `1px solid ${dividerColor}` }}>
                <p style={{ fontSize: 14, color: mutedCol, marginBottom: 'auto' }}>{eyebrow}</p>
                <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(1.8rem,2.8vw,2.6rem)', fontWeight: 800, color: textCol, lineHeight: 1.15, letterSpacing: '-0.02em', marginTop: 48 }}>
                  {mainTitle || 'Connect with our Community!'}
                </h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                {cards.map((card, i) => {
                  const rowCount = Math.ceil(cards.length / cols);
                  const cardRow = Math.floor(i / cols);
                  const isLastRow = cardRow === rowCount - 1;
                  return (
                    <div key={i} style={{
                      padding: '32px 24px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                      borderLeft: `1px solid ${dividerColor}`,
                      borderBottom: isLastRow ? 'none' : `1px solid ${dividerColor}`,
                    }}>
                      <div>
                        <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 14, color: textCol }}>{card.title}</span>
                        {' '}
                        <span style={{ fontSize: 13, color: mutedCol, lineHeight: 1.5 }}>{card.desc}</span>
                      </div>
                      <a
                        href={card.linkUrl || '#'}
                        style={{ fontSize: 13, color: accentCol, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, textDecoration: 'none', marginTop: 4 }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.75'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                      >
                        {card.linkLabel} <span style={{ fontSize: 11 }}>›</span>
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      }
      // ── CARDS HOVER ────────────────────────────────────────────────────────
      return (
        <section style={{ padding: sectionPad(block) }} className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {(label || mainTitle || mainSub) && (
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              {label && <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: ac, marginBottom: 10 }}>{label}</p>}
              {mainTitle && <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(1.5rem,2.8vw,2.3rem)', fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.02em', marginBottom: mainSub ? 10 : 0 }}>{mainTitle}</h2>}
              {mainSub && <p style={{ fontSize: 14, color: '#888' }}>{mainSub}</p>}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 14 }}>
            {allItems.map((item, i) => {
              const lbl = typeof item === 'string' ? item : item.label;
              const ico = typeof item === 'string' ? '' : item.icon;
              const dsc = typeof item === 'string' ? '' : (item.desc || '');
              return (
                <div key={i} style={{ padding: '24px 20px', background: '#fff', border: '1px solid rgba(0,0,0,.07)', borderRadius: 18, cursor: 'default', transition: 'all .25s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-5px)'; (e.currentTarget as HTMLElement).style.borderColor = `${ac}40`; (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 40px ${ac}18`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,.07)'; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}>
                  {ico && <div style={{ width: 44, height: 44, borderRadius: 14, background: `${ac}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 14 }}>{ico}</div>}
                  <p style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 14, color: '#1a1a1a', lineHeight: 1.35, marginBottom: dsc ? 6 : 0 }}>{lbl}</p>
                  {dsc && <p style={{ fontSize: 12, color: '#888', lineHeight: 1.5 }}>{dsc}</p>}
                </div>
              );
            })}
          </div>
        </section>
      );
    }

    // ── BENEFITS ─────────────────────────────────────────────────────────────
    case 'benefits':
      return <BenefitsBlock block={block} t={t} />;

    // ── IMAGE TEXT (novo — estilo "Combate Intenso") ──────────────────────────
    case 'image_text': {
      const imgSrc = resolveImg(block.imageUrl);
      const imgRight = block.imagePosition !== 'left';
      const rr = cardRadius(block);
      const maxH = block.imageMaxHeight || 500;
      const hasBg = block.imageHasBg !== false; // default true
      const bgColor = block.imageBgColor || '#e0f2fe';
      const contain = block.imageContain !== false; // default contain

      return (
        <section style={{ padding: sectionPad(block) }} className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div style={{
            display: 'grid',
            gridTemplateColumns: imgRight ? '1fr 1fr' : '1fr 1fr',
            borderRadius: rr,
            overflow: 'hidden',
            maxHeight: maxH,
            border: '1px solid rgba(0,0,0,.07)',
          }}>
            {/* Text side */}
            {!imgRight && (
              <div style={{ background: hasBg ? bgColor : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', order: 0 }}>
                {imgSrc
                  ? <img src={imgSrc} alt={block.imageAlt || block.title || ''} style={{ width: '100%', height: '100%', maxHeight: maxH, objectFit: contain ? 'contain' : 'cover', display: 'block' }} />
                  : <div style={{ width: '100%', height: maxH, background: hasBg ? bgColor : '#f9f9fb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 80 }}>🖼️</span></div>
                }
              </div>
            )}
            {/* Content side */}
            <div style={{ padding: '48px 52px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#fff', order: imgRight ? 0 : 1 }}>
              {block.badge && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 50, border: `1px solid ${t.from}`, color: t.from, fontSize: 13, fontWeight: 600, marginBottom: 20, alignSelf: 'flex-start' }}>
                  {block.badge} <ArrowRight style={{ width: 14, height: 14 }} />
                </div>
              )}
              {block.title && (
                <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(1.8rem,3vw,2.75rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', color: '#1a1a1a', marginBottom: 16 }}>
                  {block.title}
                </h2>
              )}
              {block.description && (
                <p style={{ fontSize: '0.95rem', lineHeight: 1.65, marginBottom: (block.items && block.items.length > 0) ? 24 : 0, display: 'block', padding: '8px 12px', background: t.from, color: '#fff', borderRadius: 6 }}>
                  {block.description}
                </p>
              )}
              {block.items && block.items.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                  {block.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: `${t.from}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Check style={{ width: 11, height: 11, color: t.from, strokeWidth: 3 }} />
                      </div>
                      <p style={{ fontSize: '0.9rem', color: '#333' }}>{item}</p>
                    </div>
                  ))}
                </div>
              )}
              {(block.ctaLabel || block.secondaryLabel) && (
                <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
                  {block.ctaLabel && (
                    <Link to={block.ctaLink || '/cliente'}>
                      <button style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 10, background: `linear-gradient(135deg,${t.from},${t.to})`, color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>
                        {block.ctaLabel} <ArrowRight style={{ width: 16, height: 16 }} />
                      </button>
                    </Link>
                  )}
                  {block.secondaryLabel && (
                    <Link to={block.secondaryLink || '/'}>
                      <button style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 10, background: 'transparent', color: t.from, fontWeight: 700, fontSize: 14, border: `1px solid ${t.from}`, cursor: 'pointer' }}>
                        {block.secondaryLabel} <ArrowRight style={{ width: 16, height: 16 }} />
                      </button>
                    </Link>
                  )}
                </div>
              )}
            </div>
            {/* Image side — right */}
            {imgRight && (
              <div style={{ background: hasBg ? bgColor : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', order: 1 }}>
                {imgSrc
                  ? <img src={imgSrc} alt={block.imageAlt || block.title || ''} style={{ width: '100%', height: '100%', maxHeight: maxH, objectFit: contain ? 'contain' : 'cover', display: 'block' }} />
                  : <div style={{ width: '100%', height: maxH, background: hasBg ? bgColor : '#f9f9fb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 80 }}>🖼️</span></div>
                }
              </div>
            )}
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
      if (block.dividerStyle === 'gradient') return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div style={{ height: 2, background: 'linear-gradient(90deg,transparent,rgba(0,0,0,.15),transparent)', borderRadius: 2 }} />
        </div>
      );
      if (block.dividerStyle === 'dashed') return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div style={{ borderTop: '2px dashed rgba(0,0,0,.12)' }} />
        </div>
      );
      if (block.dividerStyle === 'double') return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ height: 1, background: 'rgba(0,0,0,.12)' }} />
            <div style={{ height: 1, background: 'rgba(0,0,0,.06)' }} />
          </div>
        </div>
      );
      if (block.dividerStyle === 'wave') return (
        <div className="flex items-center justify-center py-4">
          <svg viewBox="0 0 300 20" height="20" width="300" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 10 Q25 2 50 10 Q75 18 100 10 Q125 2 150 10 Q175 18 200 10 Q225 2 250 10 Q275 18 300 10" fill="none" stroke="rgba(0,0,0,.15)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      );
      if (block.dividerStyle === 'ornament') return (
        <div className="flex items-center justify-center gap-4 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,.1)' }} />
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L14.5 9H22L16 13.5L18.5 20.5L12 16L5.5 20.5L8 13.5L2 9H9.5L12 2Z" fill="rgba(0,0,0,.18)"/>
          </svg>
          <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,.1)' }} />
        </div>
      );
      {
        const c = block.dividerColor || '#3b82f6';
        if (block.dividerStyle === 'triangle') return (
          <div style={{ lineHeight: 0, overflow: 'hidden' }}>
            <svg viewBox="0 0 1440 80" width="100%" height="80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="0,0 1440,0 1440,80 0,30" fill={c}/>
            </svg>
          </div>
        );
        if (block.dividerStyle === 'clouds') return (
          <div style={{ lineHeight: 0, overflow: 'hidden' }}>
            <svg viewBox="0 0 1440 80" width="100%" height="80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 80 Q60 20 130 50 Q200 10 290 50 Q360 5 450 50 Q520 15 610 50 Q680 10 770 50 Q840 15 930 50 Q1000 8 1090 50 Q1160 15 1250 50 Q1320 20 1440 40 L1440 80 Z" fill={c}/>
            </svg>
          </div>
        );
        if (block.dividerStyle === 'waves_fill') return (
          <div style={{ lineHeight: 0, overflow: 'hidden' }}>
            <svg viewBox="0 0 1440 80" width="100%" height="80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 50 Q180 10 360 50 Q540 90 720 50 Q900 10 1080 50 Q1260 90 1440 50 L1440 80 L0 80 Z" fill={c} opacity="0.45"/>
              <path d="M0 60 Q180 30 360 60 Q540 90 720 60 Q900 30 1080 60 Q1260 90 1440 60 L1440 80 L0 80 Z" fill={c}/>
            </svg>
          </div>
        );
        if (block.dividerStyle === 'mountains') return (
          <div style={{ lineHeight: 0, overflow: 'hidden' }}>
            <svg viewBox="0 0 1440 80" width="100%" height="80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="0,80 240,15 480,55 720,5 960,45 1200,20 1440,50 1440,80" fill={c}/>
            </svg>
          </div>
        );
      }
      return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"><hr style={{ borderColor: 'rgba(0,0,0,.08)' }} /></div>;

    default:
      return null;
  }
}