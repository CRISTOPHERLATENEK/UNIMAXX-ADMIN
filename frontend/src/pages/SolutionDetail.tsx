import { useEffect, useState } from 'react';
import type React from 'react';

import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Check, ArrowRight, Phone, ArrowLeft, RefreshCw, AlertCircle,
  Star, Zap, ChevronRight, Building2, Monitor, ShoppingCart,
  CreditCard, Truck, BarChart3, Globe, Settings, Package, Layers, FileText,
  ChevronDown, PlayCircle, Camera, HelpCircle, Puzzle, Quote, Sparkles,
  Shield, Clock, HeadphonesIcon, Award, Rocket, Target, TrendingUp, Lock, Users, Wifi, Database, Code,
} from 'lucide-react';
import { Header } from '@/sections/Header';
import { Footer } from '@/sections/Footer';
import { fetchSolutionPageBySlug } from '@/services/solutionPagesService';
import { AnimatedBgLayer } from '@/components/AnimatedBgLayer';
import type { SolutionPage, PageBlock } from '@/types';

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace('/api', '');
const resolveImg = (p?: string) => !p ? null : p.startsWith('http') ? p : `${BASE_URL}${p}`;

const ICON_MAP: Record<string, React.ElementType> = {
  Building2, Monitor, ShoppingCart, CreditCard, Truck, BarChart3,
  Globe, Settings, Zap, Package, Star, Layers, FileText,
};
const DIFF_ICON_MAP: Record<string, React.ElementType> = {
  Zap, Shield, Clock, HeadphonesIcon, Award, Rocket, Target,
  TrendingUp, Lock, Users, Wifi, Star, Globe, Database, Settings, BarChart3, Code,
};

const THEME: Record<string, { from: string; to: string; text: string; glow: string }> = {
  orange: { from: '#f97316', to: '#c2410c', text: '#f97316', glow: 'rgba(249,115,22,.35)' },
  blue: { from: '#2563eb', to: '#1e40af', text: '#60a5fa', glow: 'rgba(37,99,235,.35)' },
  green: { from: '#16a34a', to: '#166534', text: '#4ade80', glow: 'rgba(22,163,74,.35)' },
  purple: { from: '#9333ea', to: '#6b21a8', text: '#c084fc', glow: 'rgba(147,51,234,.35)' },
  black: { from: '#1f2937', to: '#030712', text: '#9ca3af', glow: 'rgba(31,41,55,.5)' },
  white: { from: '#f8fafc', to: '#e2e8f0', text: '#475569', glow: 'rgba(248,250,252,.5)' },
};

// ── Badge helper ──────────────────────────────────────────────────────────────
function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
      style={{ background: `${color}12`, color }}>
      {children}
    </div>
  );
}

// ── Dark card container (igual aos Diferenciais / Numbers) ────────────────────
function DarkCard({ pc, children }: { pc: string; children: React.ReactNode }) {
  return (
    <div style={{
      position: 'relative', overflow: 'hidden', borderRadius: 28,
      padding: '64px 48px',
      background: '#0d0d0f',
      border: '1px solid rgba(255,255,255,.07)',
      boxShadow: '0 32px 80px rgba(0,0,0,.35), 0 0 0 1px rgba(255,255,255,.04)',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 70% 60% at 5% 40%, ${pc}0d, transparent), radial-gradient(ellipse 50% 70% at 95% 15%, ${pc}08, transparent)`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: `linear-gradient(90deg,transparent,${pc}30,transparent)` }} />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}

// ── Block Renderer ────────────────────────────────────────────────────────────

// ── Block Renderer ─────────────────────────────────────────────────────────

function BlockRenderer({ block, t }: { block: PageBlock; t: typeof THEME[string] }) {
  if (!block.visible) return null;
  const isDark = block.colorTheme === 'dark';
  const isBrand = block.colorTheme === 'brand';
  const textCol = (isDark || isBrand) ? 'white' : '#1d1d1f';
  const subCol = (isDark || isBrand) ? 'rgba(255,255,255,.65)' : '#6e6e73';
  const bgStyle = isDark ? { background: '#0a0a0c' }
    : isBrand ? { background: `linear-gradient(135deg,${t.from} 0%,${t.to} 100%)` }
      : { background: '#f5f5f7' };

  const hasAnim = block.animatedBg && block.animatedBg !== 'none';
  const inner = renderSolutionBlock({ block, t, textCol, subCol, bgStyle });

  if (!hasAnim) return <>{inner}</>;
  return (
    <div style={{ position: 'relative', isolation: 'isolate' }}>
      <AnimatedBgLayer type={block.animatedBg} color={block.animatedBgColor || t.from} />
      <div style={{ position: 'relative', zIndex: 1 }}>{inner}</div>
    </div>
  );
}

function renderSolutionBlock({ block, t, textCol, subCol, bgStyle }: {
  block: PageBlock; t: typeof THEME[string]; textCol: string; subCol: string;
  bgStyle: React.CSSProperties;
}): React.ReactNode {
  switch (block.type) {

    case 'hero': {
      const layout = block.heroLayout || 'centered';
      const imgSrc = block.imageUrl ? (block.imageUrl.startsWith('http') ? block.imageUrl : `${BASE_URL}${block.imageUrl}`) : null;

      // ── Variante 1: Centralizado — gradiente de fundo, texto ao centro ──────
      if (layout === 'centered') {
        const isBrand = block.colorTheme !== 'dark' && block.colorTheme !== 'light';
        const isDark = block.colorTheme === 'dark';
        const bgCss = isDark ? '#0a0a0c'
          : isBrand ? `linear-gradient(135deg,${t.from} 0%,${t.to} 100%)`
            : '#f5f5f7';
        const fg = (isDark || isBrand) ? '#fff' : '#1d1d1f';
        const sub = (isDark || isBrand) ? 'rgba(255,255,255,.65)' : '#6e6e73';
        return (
          <section className="relative overflow-hidden py-32 px-4 sm:px-6 lg:px-8 text-center" style={{ background: bgCss }}>
            {(isDark || isBrand) && <div className="absolute inset-0 opacity-[.05]" style={{ backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '28px 28px' }} />}
            {isDark && <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 60% 50% at 50% 0%,${t.from}20,transparent)` }} />}
            <div className="relative max-w-4xl mx-auto">
              {block.badge && <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6" style={{ background: (isDark || isBrand) ? 'rgba(255,255,255,.12)' : `${t.from}10`, color: (isDark || isBrand) ? '#fff' : t.from, border: `1px solid ${(isDark || isBrand) ? 'rgba(255,255,255,.2)' : t.from + '20'}` }}>{block.badge}</div>}
              {block.title && <h1 className="font-black mb-4 leading-tight" style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(2.2rem,5vw,3.75rem)', color: fg, letterSpacing: '-0.04em' }}>{block.title}</h1>}
              {block.subtitle && <p className="text-xl mb-4 font-semibold" style={{ color: isBrand ? 'rgba(255,255,255,.85)' : isDark ? t.from : t.from, fontFamily: "'Outfit',sans-serif" }}>{block.subtitle}</p>}
              {block.description && <p className="text-[15px] leading-relaxed max-w-2xl mx-auto mb-10" style={{ color: sub }}>{block.description}</p>}
              {(block.ctaLabel || block.secondaryLabel) && (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {block.ctaLabel && <Link to={block.ctaLink || '/cliente'}><button className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-bold text-[15px] transition hover:scale-[1.02]" style={{ background: (isDark || isBrand) ? '#fff' : t.from, color: (isDark || isBrand) ? t.from : '#fff', boxShadow: '0 8px 28px rgba(0,0,0,.2)' }}><Phone className="w-5 h-5" />{block.ctaLabel}</button></Link>}
                  {block.secondaryLabel && <Link to={block.secondaryLink || '/solucoes'}><button className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-[15px] transition hover:scale-[1.02]" style={{ background: 'rgba(255,255,255,.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.25)', color: (isDark || isBrand) ? '#fff' : t.from }}>{block.secondaryLabel}<ArrowRight className="w-4 h-4" /></button></Link>}
                </div>
              )}
            </div>
          </section>
        );
      }

      // ── Variante 2: Split — texto esquerda, imagem direita ───────────────────
      if (layout === 'split') {
        return (
          <section className="relative overflow-hidden py-28 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 50% 60% at 0% 50%,${t.from}08,transparent)` }} />
            <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
              <div>
                {block.badge && <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5" style={{ background: `${t.from}10`, color: t.from }}>{block.badge}</div>}
                {block.title && <h1 className="font-black text-[#1d1d1f] mb-4 leading-tight" style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(2rem,4.5vw,3.5rem)', letterSpacing: '-0.04em' }}>{block.title}</h1>}
                {block.subtitle && <p className="text-lg font-semibold mb-4" style={{ color: t.from, fontFamily: "'Outfit',sans-serif" }}>{block.subtitle}</p>}
                {block.description && <p className="text-[#6e6e73] leading-relaxed mb-10 max-w-lg">{block.description}</p>}
                <div className="flex flex-col sm:flex-row gap-3">
                  {block.ctaLabel && <Link to={block.ctaLink || '/cliente'}><button className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-bold text-[15px] text-white transition hover:scale-[1.02]" style={{ background: `linear-gradient(135deg,${t.from},${t.to})`, boxShadow: `0 10px 28px ${t.from}30` }}><Phone className="w-5 h-5" />{block.ctaLabel}</button></Link>}
                  {block.secondaryLabel && <Link to={block.secondaryLink || '/solucoes'}><button className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-[15px] text-[#6e6e73] transition hover:text-[#1d1d1f]" style={{ background: '#f5f5f7', border: '1px solid rgba(0,0,0,.08)' }}>{block.secondaryLabel}<ArrowRight className="w-4 h-4" /></button></Link>}
                </div>
              </div>
              <div className="hidden lg:block">
                {imgSrc
                  ? <div className="rounded-3xl overflow-hidden" style={{ boxShadow: `0 40px 80px ${t.from}18` }}><img src={imgSrc} alt={block.title || ''} className="w-full h-auto object-cover" /></div>
                  : <div className="rounded-3xl h-80 flex items-center justify-center text-8xl" style={{ background: `${t.from}08`, border: `1px solid ${t.from}15` }}>🖥️</div>
                }
              </div>
            </div>
          </section>
        );
      }

      // ── Variante 3: Dark Glow — preto com glow neon ──────────────────────────
      if (layout === 'dark_glow') {
        return (
          <section className="relative overflow-hidden py-32 px-4 sm:px-6 lg:px-8 text-center" style={{ background: '#06060a' }}>
            <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 70% 60% at 50% -10%,${t.from}25,transparent 60%)` }} />
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg,transparent,${t.from}60,transparent)` }} />
            <div className="absolute inset-0 opacity-[.03]" style={{ backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '32px 32px' }} />
            <div className="relative max-w-4xl mx-auto">
              {block.badge && <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6" style={{ background: `${t.from}18`, border: `1px solid ${t.from}30`, color: t.from }}><span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: t.from }} />{block.badge}</div>}
              {block.title && <h1 className="font-black text-white mb-4 leading-tight" style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(2.5rem,5.5vw,4.5rem)', letterSpacing: '-0.05em', textShadow: `0 0 80px ${t.from}40` }}>{block.title}</h1>}
              {block.subtitle && <p className="text-xl mb-4 font-semibold" style={{ color: t.from, fontFamily: "'Outfit',sans-serif", textShadow: `0 0 20px ${t.from}60` }}>{block.subtitle}</p>}
              {block.description && <p className="text-white/50 leading-relaxed max-w-2xl mx-auto mb-10 text-[15px]">{block.description}</p>}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {block.ctaLabel && <Link to={block.ctaLink || '/cliente'}><button className="flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-[15px] transition hover:scale-[1.02]" style={{ background: `linear-gradient(135deg,${t.from},${t.to})`, color: '#fff', boxShadow: `0 12px 40px ${t.from}50` }}><Phone className="w-5 h-5" />{block.ctaLabel}</button></Link>}
                {block.secondaryLabel && <Link to={block.secondaryLink || '/solucoes'}><button className="flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-[15px] text-white transition hover:scale-[1.02]" style={{ background: 'rgba(255,255,255,.07)', border: `1px solid ${t.from}30`, backdropFilter: 'blur(8px)' }}>{block.secondaryLabel}<ArrowRight className="w-4 h-4" /></button></Link>}
              </div>
            </div>
          </section>
        );
      }

      // ── Variante 4: Magazine — imagem full-bleed com overlay ─────────────────
      return (
        <section className="relative overflow-hidden" style={{ minHeight: 580 }}>
          {imgSrc
            ? <><img src={imgSrc} alt="" className="absolute inset-0 w-full h-full object-cover" /><div className="absolute inset-0" style={{ background: 'linear-gradient(110deg,rgba(5,5,8,.93) 0%,rgba(5,5,8,.7) 55%,rgba(5,5,8,.35) 100%)' }} /><div className="absolute inset-0" style={{ background: `linear-gradient(225deg,${t.from}25 0%,transparent 55%)` }} /></>
            : <div className="absolute inset-0" style={{ background: `linear-gradient(135deg,${t.from},${t.to})` }} />
          }
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-32">
            {block.badge && <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl text-xs font-bold uppercase tracking-widest mb-6" style={{ background: 'rgba(255,255,255,.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,.18)', color: '#fff' }}>{block.badge}</div>}
            <div className="max-w-2xl">
              {block.title && <h1 className="font-black text-white mb-4 leading-tight" style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(2.2rem,5vw,4rem)', letterSpacing: '-0.04em' }}>{block.title}</h1>}
              {block.subtitle && <p className="text-xl mb-4 font-semibold" style={{ color: 'rgba(255,255,255,.8)', fontFamily: "'Outfit',sans-serif" }}>{block.subtitle}</p>}
              {block.description && <p className="text-white/55 leading-relaxed mb-10 text-[15px] max-w-lg">{block.description}</p>}
              <div className="flex flex-col sm:flex-row gap-3">
                {block.ctaLabel && <Link to={block.ctaLink || '/cliente'}><button className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-bold text-[15px] transition hover:scale-[1.02]" style={{ background: '#fff', color: t.from, boxShadow: '0 8px 28px rgba(0,0,0,.3)' }}><Phone className="w-5 h-5" />{block.ctaLabel}</button></Link>}
                {block.secondaryLabel && <Link to={block.secondaryLink || '/solucoes'}><button className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-[15px] text-white transition hover:scale-[1.02]" style={{ background: 'rgba(255,255,255,.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.25)' }}>{block.secondaryLabel}<ArrowRight className="w-4 h-4" /></button></Link>}
              </div>
            </div>
          </div>
        </section>
      );
    }

    case 'features':
      return (
        <section style={{ padding: '80px 16px', maxWidth: 1280, margin: '0 auto' }}>
          <div style={{
            position: 'relative', overflow: 'hidden', borderRadius: 32,
            background: '#09090b',
            border: '1px solid rgba(255,255,255,.08)',
            boxShadow: '0 40px 100px rgba(0,0,0,.5)',
          }}>
            <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: `linear-gradient(90deg,transparent,${t.from}70,transparent)` }} />
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(ellipse 55% 45% at 100% 0%, ${t.from}18, transparent), radial-gradient(ellipse 40% 50% at 0% 100%, ${t.from}0d, transparent)` }} />
            <div style={{ position: 'absolute', inset: 0, opacity: .03, backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1, padding: '60px 56px' }}>
              {block.title && (
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48, gap: 24, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 99, background: `${t.from}15`, border: `1px solid ${t.from}30`, marginBottom: 14 }}>
                      <Sparkles style={{ width: 12, height: 12, color: t.from }} />
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: t.from }}>Recursos</span>
                    </div>
                    <h2 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 'clamp(1.75rem,3vw,2.5rem)', color: '#fff', lineHeight: 1.1, letterSpacing: '-0.03em', margin: 0 }}>
                      {block.title}
                    </h2>
                  </div>
                  {(block.items || []).length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 12, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)' }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: t.from, display: 'inline-block', boxShadow: `0 0 8px ${t.from}` }} />
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', fontWeight: 500 }}>{(block.items || []).length} funcionalidades</span>
                    </div>
                  )}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
                {(block.items || []).map((f, i) => (
                  <div key={i}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 14,
                      padding: '20px 24px', borderRadius: 16,
                      background: 'rgba(255,255,255,.04)',
                      border: '1px solid rgba(255,255,255,.07)',
                      cursor: 'default',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = `${t.from}12`;
                      (e.currentTarget as HTMLElement).style.borderColor = `${t.from}35`;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.04)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.07)';
                    }}
                  >
                    <div style={{
                      flexShrink: 0, width: 32, height: 32, borderRadius: 10,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: `${t.from}20`, border: `1px solid ${t.from}40`,
                      fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 13, color: t.from,
                    }}>
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,.75)', lineHeight: 1.55, margin: 0, paddingTop: 6 }}>{f}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.07)' }} />
                <div style={{ display: 'flex', gap: 6 }}>
                  {[0, 1, 2].map(j => (
                    <div key={j} style={{ width: j === 0 ? 20 : 8, height: 4, borderRadius: 9, background: j === 0 ? t.from : 'rgba(255,255,255,.12)' }} />
                  ))}
                </div>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.07)' }} />
              </div>
            </div>
          </div>
        </section>
      );

    case 'benefits': {
      const iconItems = (block as any).iconItems || [];
      const sideImg = (block as any).imageUrl ? resolveImg((block as any).imageUrl) : null;
      const hasSide = sideImg && (block as any).benefitsLayout === 'side_image';
      return (
        <section className="py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div style={{
            position: 'relative', overflow: 'hidden', borderRadius: 28,
            padding: '64px 56px',
            background: '#0c0c0e',
            border: '1px solid rgba(255,255,255,.07)',
            boxShadow: '0 32px 80px rgba(0,0,0,.5)',
          }}>
            {/* background glows */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: `radial-gradient(ellipse 60% 70% at -5% 50%, ${t.from}22, transparent),
                           radial-gradient(ellipse 45% 55% at 105% 0%, ${t.from}14, transparent)`
            }} />
            <div style={{
              position: 'absolute', top: 0, left: '8%', right: '8%', height: 1,
              background: `linear-gradient(90deg,transparent,${t.from}50,transparent)`
            }} />

            <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 64, alignItems: 'center' }}>
              {/* ── Left ── */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {block.title && (
                  <h2 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 'clamp(1.75rem,3.5vw,2.75rem)', color: '#fff', lineHeight: 1.15, marginBottom: 12 }}>
                    {block.title}
                  </h2>
                )}
                {(block as any).subtitle && (
                  <p style={{ color: 'rgba(255,255,255,.45)', fontSize: 15, lineHeight: 1.6, marginBottom: 36, fontFamily: "'DM Sans',sans-serif" }}>
                    {(block as any).subtitle}
                  </p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {(iconItems.length > 0 ? iconItems : (block.items || []).map((b: string) => ({ icon: '⚡', label: b, desc: '' }))).map((item: any, i: number) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 18,
                      padding: '16px 20px', borderRadius: 16,
                      background: 'rgba(255,255,255,.05)',
                      border: '1px solid rgba(255,255,255,.10)',
                    }}>
                      {/* icon circle with strong glow */}
                      <div style={{
                        width: 54, height: 54, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: `#1a1a1c`,
                        border: `2px solid ${t.from}`,
                        boxShadow: `0 0 20px ${t.from}90, 0 0 40px ${t.from}40`,
                        fontSize: 24, lineHeight: 1,
                      }}>
                        {item.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {item.label && <p style={{ fontWeight: 700, color: '#fff', fontSize: 15, marginBottom: item.desc ? 3 : 0, fontFamily: "'Outfit',sans-serif" }}>{item.label}</p>}
                        {item.desc && <p style={{ color: 'rgba(255,255,255,.45)', fontSize: 13, lineHeight: 1.5, fontFamily: "'DM Sans',sans-serif" }}>{item.desc}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Right image ── */}
              {hasSide && (
                <div style={{ flexShrink: 0, width: 'clamp(260px,35%,420px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      position: 'absolute', inset: '-20%', borderRadius: '50%',
                      background: `radial-gradient(circle, ${t.from}60 0%, transparent 65%)`,
                      filter: 'blur(50px)'
                    }} />
                    <img src={sideImg!} alt="" style={{ position: 'relative', zIndex: 1, width: '100%', maxHeight: 460, objectFit: 'contain', filter: 'drop-shadow(0 20px 50px rgba(0,0,0,.7))' }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      );
    }

    case 'steps':
      return (
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl p-10 shadow-sm" style={{ border: '1px solid rgba(0,0,0,.06)' }}>
            {block.title && <div className="text-center mb-10"><h2 className="text-[clamp(1.6rem,3vw,2.5rem)] font-bold text-[#1d1d1f]" style={{ fontFamily: "'Outfit',sans-serif" }}>{block.title}</h2></div>}
            <div className="max-w-2xl mx-auto space-y-5">
              {(block.steps || []).map((step, i) => (
                <div key={i} className="flex gap-5 items-start">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold text-lg"
                    style={{ background: `linear-gradient(135deg,${t.from},${t.to})`, color: '#fff', fontFamily: "'Outfit',sans-serif", boxShadow: `0 8px 24px ${t.glow}` }}>{i + 1}</div>
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

    case 'testimonial':
      if (!block.quote) return null;
      return (
        <section className="py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
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

    case 'faq':
      if (!(block.faq || []).length) return null;
      return <FaqBlock block={block} t={t} />;

    case 'video': {
      if (!block.videoUrl) return null;
      const m = block.videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
      const vid = m ? m[1] : null;
      if (!vid) return null;
      return (
        <section className="py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <DarkCard pc={t.from}>
            {block.title && <div className="text-center mb-8"><h2 className="text-[clamp(1.4rem,2.5vw,2.25rem)] font-bold text-white" style={{ fontFamily: "'Outfit',sans-serif" }}>{block.title}</h2></div>}
            <div className="relative w-full rounded-2xl overflow-hidden max-w-3xl mx-auto" style={{ paddingTop: '56.25%', boxShadow: '0 32px 64px rgba(0,0,0,.6)' }}>
              <iframe className="absolute inset-0 w-full h-full" src={`https://www.youtube.com/embed/${vid}?rel=0&modestbranding=1`} title={block.title || 'Vídeo'} allowFullScreen />
            </div>
          </DarkCard>
        </section>
      );
    }

    case 'cta':
      return (
        <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="rounded-3xl p-14 text-center relative overflow-hidden"
            style={{ background: `linear-gradient(135deg,${t.from} 0%,${t.to} 100%)` }}>
            <div className="absolute inset-0 opacity-[.05]" style={{ backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '24px 24px' }} />
            <div className="relative">
              {block.title && <h2 className="font-bold text-white mb-4 leading-tight" style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(1.75rem,4vw,3rem)' }}>{block.title}</h2>}
              {block.description && <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">{block.description}</p>}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {block.ctaLabel && <Link to={block.ctaLink || '/cliente'}><button className="flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-[15px] transition-all hover:scale-[1.03]" style={{ background: '#fff', color: t.from, boxShadow: '0 12px 32px rgba(0,0,0,.2)' }}><Phone className="w-5 h-5" />{block.ctaLabel}</button></Link>}
                {block.secondaryLabel && <Link to={block.secondaryLink || '/solucoes'}><button className="flex items-center gap-2.5 px-8 py-4 rounded-2xl font-semibold text-[15px] text-white transition-all hover:scale-[1.03]" style={{ background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.3)' }}>{block.secondaryLabel}<ArrowRight className="w-4 h-4" /></button></Link>}
              </div>
            </div>
          </div>
        </section>
      );

    case 'text':
      return (
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl p-10 shadow-sm" style={{ border: '1px solid rgba(0,0,0,.06)' }}>
            {block.title && <h2 className="text-[clamp(1.4rem,2.5vw,2rem)] font-bold text-[#1d1d1f] mb-4" style={{ fontFamily: "'Outfit',sans-serif" }}>{block.title}</h2>}
            {block.description && <p className="text-[#6e6e73] leading-relaxed text-[15px] whitespace-pre-wrap">{block.description}</p>}
          </div>
        </section>
      );

    case 'richtext':
      if (!block.html) return null;
      return (
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl p-10 shadow-sm prose prose-base max-w-none"
            style={{ border: '1px solid rgba(0,0,0,.06)' }}
            dangerouslySetInnerHTML={{ __html: block.html }} />
        </section>
      );

    case 'image':
      if (!block.imageUrl) return null;
      return (
        <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="rounded-3xl overflow-hidden shadow-sm" style={{ border: '1px solid rgba(0,0,0,.06)' }}>
            <img src={block.imageUrl} alt={block.imageAlt || ''} className="w-full object-cover" />
          </div>
        </section>
      );

    case 'integrations':
      if (!(block.items || []).length) return null;
      return (
        <section className="py-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl p-10 shadow-sm" style={{ border: '1px solid rgba(0,0,0,.06)' }}>
            {block.title && <div className="text-center mb-8"><h2 className="text-[clamp(1.4rem,2.5vw,2.25rem)] font-bold text-[#1d1d1f]" style={{ fontFamily: "'Outfit',sans-serif" }}>{block.title}</h2></div>}
            <div className="flex flex-wrap gap-3 justify-center">
              {(block.items || []).map((item, i) => (
                <span key={i} className="px-5 py-2.5 rounded-full text-[13px] font-semibold" style={{ background: '#f5f5f7', color: '#1d1d1f', border: '1px solid rgba(0,0,0,.07)' }}>{item}</span>
              ))}
            </div>
          </div>
        </section>
      );

    case 'alert_banner': {
      if (!block.alertText) return null;
      const alertColors: Record<string, { bg: string; text: string; icon: string }> = {
        info: { bg: '#eff6ff', text: '#1d4ed8', icon: 'ℹ️' },
        success: { bg: '#f0fdf4', text: '#15803d', icon: '✅' },
        warning: { bg: '#fffbeb', text: '#b45309', icon: '⚠️' },
        error: { bg: '#fef2f2', text: '#dc2626', icon: '🚨' },
      };
      const ac = alertColors[block.alertType || 'info'];
      return (
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-3">
          <div className="rounded-2xl px-5 py-3.5 flex items-center gap-3 text-[14px] font-medium" style={{ background: ac.bg, color: ac.text }}>
            <span className="text-lg">{ac.icon}</span>
            <span>{block.alertText}</span>
          </div>
        </div>
      );
    }

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

function FaqBlock({ block, t }: { block: PageBlock; t: typeof THEME[string] }) {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="bg-white rounded-3xl p-10 shadow-sm" style={{ border: '1px solid rgba(0,0,0,.06)' }}>
        {block.title && (
          <div className="text-center mb-10">
            <h2 className="text-[clamp(1.5rem,3vw,2.5rem)] font-bold text-[#1d1d1f]" style={{ fontFamily: "'Outfit',sans-serif" }}>{block.title}</h2>
          </div>
        )}
        <div className="max-w-2xl mx-auto space-y-3">
          {(block.faq || []).map((faq, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border transition-all"
              style={{ borderColor: faqOpen === i ? `${t.from}35` : 'rgba(0,0,0,.07)' }}>
              <button className="w-full flex items-center justify-between px-6 py-5 text-left gap-4"
                style={{ background: faqOpen === i ? `${t.from}06` : '#fff' }}
                onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                <span className="font-semibold text-[#1d1d1f] text-[15px]">{faq.question}</span>
                <ChevronDown className="w-5 h-5 flex-shrink-0 transition-transform" style={{ color: t.from, transform: faqOpen === i ? 'rotate(180deg)' : 'none' }} />
              </button>
              {faqOpen === i && <div className="px-6 pb-5 text-[#6e6e73] leading-relaxed text-sm">{faq.answer}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function SolutionPageDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<SolutionPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!slug) { setError('Slug não informado'); setLoading(false); return; }
    try { setLoading(true); setError(null); setPage(await fetchSolutionPageBySlug(slug)); }
    catch (e) { setError(e instanceof Error ? e.message : 'Erro'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [slug]);
  useEffect(() => {
    if (page) document.title = page.meta_title || `${page.title} | Unimaxx`;
    return () => { document.title = 'Unimaxx'; };
  }, [page]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-gray-200 animate-spin" style={{ borderTopColor: '#f97316' }} />
        <p className="text-gray-400 text-sm">Carregando...</p>
      </div>
    </div>
  );

  if (error || !page) return (
    <><Header />
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: "'Outfit',sans-serif" }}>Solução não encontrada</h1>
          <p className="text-gray-400 mb-8">{error}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
            <button onClick={load} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-medium" style={{ background: '#f97316' }}>
              <RefreshCw className="w-4 h-4" /> Tentar novamente
            </button>
          </div>
        </div>
      </div>
      <Footer /></>
  );

  const t = THEME[page.color_theme] || THEME.orange;
  const blocks: PageBlock[] = Array.isArray(page.blocks_json)
    ? page.blocks_json.filter((b: PageBlock) => b.visible)
    : [];

  return (
    <div className="min-h-screen bg-[#f5f5f7]" style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <Header />
      {blocks.length > 0
        ? blocks.map((block) => <BlockRenderer key={block.id} block={block} t={t} />)
        : (
          <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="text-center max-w-md">
              <p className="text-6xl mb-6">🏗️</p>
              <h2 className="text-xl font-bold text-[#1d1d1f] mb-2" style={{ fontFamily: "'Outfit',sans-serif" }}>Página sem conteúdo</h2>
              <p className="text-[#6e6e73] mb-6">Esta solução ainda não tem blocos configurados. Acesse o painel administrativo para montar a página.</p>
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition mx-auto">
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
            </div>
          </div>
        )
      }
      <Footer />
    </div>
  );
}