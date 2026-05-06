import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Zap, ChevronDown, Quote, Play, X, Star } from 'lucide-react';
import { resolveImg } from '@/components/ImageUploadField';
import type { PageBlock, SectionShape } from '@/types';
import { BannerSlide } from '@/components/PageBanner';

// ─── BlockRenderer.tsx — Renderer compartilhado para SolutionPageDetail e GenericPageView

export const DEFAULT_T = { from: '#f97316', to: '#c2410c', text: '#f97316', glow: 'rgba(249,115,22,.35)' };
export const THEME: Record<string, typeof DEFAULT_T> = {
  orange: { from: '#f97316', to: '#c2410c', text: '#f97316', glow: 'rgba(249,115,22,.35)' },
  blue: { from: '#2563eb', to: '#1e40af', text: '#60a5fa', glow: 'rgba(37,99,235,.35)' },
  green: { from: '#16a34a', to: '#166534', text: '#4ade80', glow: 'rgba(22,163,74,.35)' },
  purple: { from: '#9333ea', to: '#6b21a8', text: '#c084fc', glow: 'rgba(147,51,234,.35)' },
  black: { from: '#1f2937', to: '#030712', text: '#9ca3af', glow: 'rgba(31,41,55,.5)' },
  white: { from: '#f8fafc', to: '#e2e8f0', text: '#475569', glow: 'rgba(248,250,252,.5)' },
};


// ── Helpers ───────────────────────────────────────────────────────────────────
const SPACING: Record<string, string> = { compact: '40px 0', normal: '72px 0', spacious: '120px 0' };
const RADIUS: Record<string, number> = { none: 0, small: 8, medium: 16, large: 24, full: 9999 };
function sectionPad(block: PageBlock) { return SPACING[block.blockSpacing || 'normal']; }
function cardRadius(block: PageBlock) { return RADIUS[block.blockRadius || 'large']; }

function getBlockStyles(block: PageBlock, t: typeof DEFAULT_T) {
  return {
    section: {
      padding: sectionPad(block),
      background: block.bgColor || (block.colorTheme === 'dark' ? '#0f172a' : block.colorTheme === 'brand' ? t.from : '#ffffff'),
    },
    title: {
      color: block.titleColor || (block.colorTheme === 'dark' || block.colorTheme === 'brand' ? '#ffffff' : '#111827'),
      fontSize: block.titleSize || 'clamp(1.5rem, 3vw, 2.5rem)',
      fontFamily: "'Outfit', sans-serif",
    },
    subtitle: {
      color: block.subtitleColor || (block.colorTheme === 'dark' || block.colorTheme === 'brand' ? 'rgba(255,255,255,0.7)' : '#4b5563'),
      fontSize: block.subtitleSize || '1.125rem',
    },
    cta: {
      background: block.ctaBgColor || (block.colorTheme === 'brand' ? '#ffffff' : t.from),
      color: block.ctaTextColor || (block.colorTheme === 'brand' ? t.from : '#ffffff'),
    }
  };
}

// ── Shared animations CSS ─────────────────────────────────────────────────────
const ANIM_CSS = `
  @keyframes fadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes scaleIn { from { opacity:0; transform:scale(.94); } to { opacity:1; transform:scale(1); } }
  @keyframes pulse-ring { 0%,100%{box-shadow:0 0 0 0 currentColor} 50%{box-shadow:0 0 0 8px transparent} }
  @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  @keyframes countUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  .anim-fade-up { animation: fadeUp .6s cubic-bezier(.22,1,.36,1) both; }
  .anim-scale-in { animation: scaleIn .5s cubic-bezier(.22,1,.36,1) both; }
`;

function useInView(ref: React.RefObject<Element | null>, once = true) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); if (once) obs.disconnect(); }
    }, { threshold: 0.12 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return visible;
}

// ── DarkCard ─────────────────────────────────────────────────────────────────
function DarkCard({ pc, children }: { pc: string; children: React.ReactNode }) {
  return (
    <div style={{
      position: 'relative', overflow: 'hidden', borderRadius: 28,
      padding: '64px 48px', background: '#0a0a0f',
      border: '1px solid rgba(255,255,255,.08)',
      boxShadow: '0 40px 100px rgba(0,0,0,.4)',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 70% 60% at 5% 40%,${pc}12,transparent),radial-gradient(ellipse 50% 70% at 95% 15%,${pc}08,transparent)`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: `linear-gradient(90deg,transparent,${pc}40,transparent)` }} />
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}

// ── Section heading ───────────────────────────────────────────────────────────
function SectionHead({ label, title, subtitle, t, dark = false, center = true }: {
  label?: string; title?: string; subtitle?: string; t: typeof DEFAULT_T; dark?: boolean; center?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const v = useInView(ref);
  if (!label && !title && !subtitle) return null;
  return (
    <div ref={ref} style={{
      textAlign: center ? 'center' : 'left', marginBottom: 48,
      opacity: v ? 1 : 0, transform: v ? 'translateY(0)' : 'translateY(24px)',
      transition: 'opacity .6s ease, transform .6s ease',
    }}>
      {label && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <div style={{ width: 24, height: 2, background: t.from, borderRadius: 2 }} />
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.14em', color: t.from, textTransform: 'uppercase' }}>{label}</span>
          <div style={{ width: 24, height: 2, background: t.from, borderRadius: 2 }} />
        </div>
      )}
      {title && (
        <h2 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
          fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.025em',
          color: dark ? '#fff' : '#0f172a', marginBottom: subtitle ? 16 : 0,
        }}>{title}</h2>
      )}
      {subtitle && <p style={{ fontSize: '1.05rem', color: dark ? 'rgba(255,255,255,.6)' : '#64748b', maxWidth: center ? 560 : 'none', margin: center ? '0 auto' : 0, lineHeight: 1.7 }}>{subtitle}</p>}
    </div>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────────
function FaqBlock({ block, t }: { block: PageBlock; t: typeof DEFAULT_T }) {
  const [open, setOpen] = useState<number | null>(null);
  const isDark = block.colorTheme === 'dark';
  const styles = getBlockStyles(block, t);

  return (
    <section style={styles.section} className="px-4 sm:px-6 lg:px-8">
      <style>{ANIM_CSS}</style>
      <div className="max-w-3xl mx-auto">
        <SectionHead title={block.title} t={t} dark={isDark} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(block.faq || []).map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={i} style={{
                borderRadius: 16,
                border: `1.5px solid ${isOpen ? t.from + '50' : isDark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.07)'}`,
                background: isOpen ? (isDark ? 'rgba(255,255,255,.04)' : `${t.from}06`) : (isDark ? 'rgba(255,255,255,.02)' : '#fff'),
                transition: 'border-color .2s, background .2s',
                overflow: 'hidden',
              }}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', gap: 16, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                >
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 15, color: isDark ? '#fff' : '#1e293b', lineHeight: 1.4 }}>{faq.question}</span>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: isOpen ? t.from : (isDark ? 'rgba(255,255,255,.08)' : '#f1f5f9'),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background .2s, transform .3s',
                    transform: isOpen ? 'rotate(180deg)' : 'none',
                  }}>
                    <ChevronDown style={{ width: 16, height: 16, color: isOpen ? '#fff' : (isDark ? 'rgba(255,255,255,.5)' : '#64748b') }} />
                  </div>
                </button>
                <div style={{
                  maxHeight: isOpen ? 400 : 0, overflow: 'hidden',
                  transition: 'max-height .35s cubic-bezier(.4,0,.2,1)',
                }}>
                  <p style={{ padding: '0 24px 20px', fontSize: 14.5, color: isDark ? 'rgba(255,255,255,.6)' : '#64748b', lineHeight: 1.75 }}>{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Video Modal ───────────────────────────────────────────────────────────────
function VideoModal({ videoId, onClose }: { videoId: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,.9)', backdropFilter: 'blur(12px)' }} onClick={onClose}>
      <div className="w-full max-w-4xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-end mb-4">
          <button onClick={onClose} style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,.12)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X style={{ width: 18, height: 18, color: '#fff' }} />
          </button>
        </div>
        <div style={{ position: 'relative', width: '100%', borderRadius: 20, overflow: 'hidden', paddingTop: '56.25%', boxShadow: '0 40px 80px rgba(0,0,0,.8)' }}>
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
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const imgRef = useRef<HTMLDivElement>(null);
  const styles = getBlockStyles(block, t);
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
    }, { threshold: 0.12 });
    itemsRef.current.forEach(el => { if (el) obs.observe(el); });
    if (imgRef.current) obs.observe(imgRef.current);
    return () => obs.disconnect();
  }, [allItems.length]);

  return (
    <section style={styles.section} className="px-4 sm:px-6 lg:px-8">
      <style>{`@keyframes ben-float { 0%,100%{transform:translateY(0) rotate(-1deg)} 50%{transform:translateY(-16px) rotate(1deg)} } .ben-img-wrap{animation:ben-float 5s ease-in-out infinite}`}</style>
      <div className="max-w-7xl mx-auto">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(40px,6vw,96px)', flexWrap: hasSide ? undefined : 'wrap' }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <SectionHead title={block.title} subtitle={block.subtitle} t={t} dark={block.colorTheme === 'dark'} center={false} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {allItems.map((item: any, i: number) => {
                const isObj = typeof item !== 'string';
                const align = isObj ? (item.align || 'left') : 'left';
                const w = isObj && item.width ? `${item.width}%` : '100%';
                const pH = isObj && item.paddingH != null ? item.paddingH : 16;
                const pV = isObj && item.paddingV != null ? item.paddingV : 13;
                const fs = isObj && item.fontSize ? item.fontSize : 14;
                const ds = isObj && item.descSize ? item.descSize : 12;
                const iconSz = isObj && item.iconSize ? item.iconSize : 42;
                const accent = (isObj && item.accentColor) ? item.accentColor : t.from;
                const justifyMap: Record<string, string> = { left: 'flex-start', center: 'center', right: 'flex-end' };
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: justifyMap[align] || 'flex-start' }}>
                    <div ref={el => { itemsRef.current[i] = el; }} style={{
                      width: w, display: 'flex', alignItems: 'center', gap: 14,
                      padding: `${pV}px ${pH}px`, borderRadius: 14,
                      background: block.colorTheme === 'dark' ? 'rgba(255,255,255,0.05)' : '#fff',
                      border: `1px solid ${block.colorTheme === 'dark' ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.06)'}`,
                      boxShadow: '0 2px 12px rgba(0,0,0,.05)',
                      opacity: 0, transform: 'translateY(20px)',
                      transition: `opacity .45s ease ${i * 0.07}s, transform .45s ease ${i * 0.07}s`,
                    }}>
                      <div style={{
                        width: iconSz, height: iconSz, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: `linear-gradient(135deg, ${accent}22, ${accent}10)`,
                        border: `1.5px solid ${accent}30`,
                        fontSize: Math.round(iconSz * 0.44), lineHeight: 1,
                      }}>{isObj ? item.icon : '⚡'}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: isObj && item.bold ? 700 : 600, color: block.colorTheme === 'dark' ? '#fff' : '#1e293b', fontSize: fs, marginBottom: (isObj && item.desc) ? 3 : 0, fontFamily: "'Outfit',sans-serif" }}>
                          {isObj ? item.label : item}
                        </p>
                        {isObj && item.desc && <p style={{ color: block.colorTheme === 'dark' ? 'rgba(255,255,255,0.45)' : '#94a3b8', fontSize: ds, lineHeight: 1.55 }}>{item.desc}</p>}
                      </div>
                      <div style={{ width: 3, height: 28, borderRadius: 99, background: `linear-gradient(180deg,${accent},${accent}60)`, flexShrink: 0 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          {hasSide && (
            <div ref={imgRef} style={{ flexShrink: 0, width: 'clamp(240px,38%,440px)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transform: 'translateY(32px)', transition: 'opacity .7s ease .2s, transform .7s ease .2s' }}>
              <div className="ben-img-wrap" style={{ borderRadius: 32, overflow: 'hidden', boxShadow: '0 48px 120px rgba(0,0,0,.22)' }}>
                <img src={imgSrc!} alt="" style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── Section Shape Helpers ─────────────────────────────────────────────────────
const SECTION_SHAPE_PATHS: Record<string, { top: string; bottom: string }> = {
  'wave': { top: 'M0,60 C15,40 35,80 50,60 C65,40 85,80 100,60 L100,0 L0,0 Z', bottom: 'M0,40 C15,60 35,20 50,40 C65,60 85,20 100,40 L100,100 L0,100 Z' },
  'wave-soft': { top: 'M0,70 C25,50 75,90 100,70 L100,0 L0,0 Z', bottom: 'M0,30 C25,50 75,10 100,30 L100,100 L0,100 Z' },
  'diagonal-right': { top: 'M0,0 L100,0 L100,30 L0,100 Z', bottom: 'M0,0 L100,70 L100,100 L0,100 Z' },
  'diagonal-left': { top: 'M0,30 L100,0 L100,0 L0,0 Z', bottom: 'M0,100 L100,100 L100,70 L0,100 Z' },
  'arc-down': { top: 'M0,0 L100,0 Q50,100 0,0 Z', bottom: 'M0,100 L100,100 Q50,0 0,100 Z' },
  'arc-up': { top: 'M0,100 Q50,0 100,100 L100,0 L0,0 Z', bottom: 'M0,0 Q50,100 100,0 L100,100 L0,100 Z' },
  'zigzag': { top: 'M0,50 L12.5,0 L25,50 L37.5,0 L50,50 L62.5,0 L75,50 L87.5,0 L100,50 L100,0 L0,0 Z', bottom: 'M0,50 L12.5,100 L25,50 L37.5,100 L50,50 L62.5,100 L75,50 L87.5,100 L100,50 L100,100 L0,100 Z' },
  'slant-both': { top: 'M0,60 L100,0 L100,0 L0,0 Z', bottom: 'M0,100 L100,100 L100,40 L0,100 Z' },
};

function SectionShapeLayer({ block }: { block: PageBlock }) {
  const shapeTop = (block.sectionShapeTop || 'none') as SectionShape;
  const shapeBottom = (block.sectionShapeBottom || 'none') as SectionShape;
  const color = block.sectionShapeColor || '#ffffff';
  const size = block.sectionShapeSize ?? 3;
  const heightPx = 40 + size * 16;
  const topPaths = shapeTop !== 'none' ? SECTION_SHAPE_PATHS[shapeTop] : null;
  const bottomPaths = shapeBottom !== 'none' ? SECTION_SHAPE_PATHS[shapeBottom] : null;
  if (!topPaths && !bottomPaths) return null;
  return (
    <>
      {topPaths && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: heightPx, zIndex: 3, overflow: 'hidden', pointerEvents: 'none' }}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', bottom: 0, width: '100%', height: '100%' }}>
            <path d={topPaths.top} fill={color} />
          </svg>
        </div>
      )}
      {bottomPaths && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: heightPx, zIndex: 3, overflow: 'hidden', pointerEvents: 'none' }}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, width: '100%', height: '100%' }}>
            <path d={bottomPaths.bottom} fill={color} />
          </svg>
        </div>
      )}
    </>
  );
}

function buildContinuousBgCSS(block: PageBlock): string {
  const type = block.continuousBgType || 'gradient';
  const c1 = block.continuousBgColor1 || '#07101f';
  const c2 = block.continuousBgColor2 || '#1a4a7a';
  const angle = block.continuousBgAngle ?? 160;
  if (type === 'solid') return c1;
  if (type === 'image') return block.continuousBgImage ? `url(${block.continuousBgImage})` : c1;
  return `linear-gradient(${angle}deg, ${c1}, ${c2})`;
}

function useJsOffsetBg(ref: React.RefObject<HTMLDivElement | null>, active: boolean) {
  useEffect(() => {
    if (!active || !ref.current) return;
    const el = ref.current;
    const apply = () => {
      const pageHeight = document.body.scrollHeight;
      const offsetTop = el.getBoundingClientRect().top + window.scrollY;
      el.style.backgroundSize = `100% ${pageHeight}px`;
      el.style.backgroundPosition = `0px -${offsetTop}px`;
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el); ro.observe(document.body);
    window.addEventListener('resize', apply);
    return () => { ro.disconnect(); window.removeEventListener('resize', apply); };
  }, [ref, active]);
}

// ─────────────────────────────────────────────────────────────────────────────
export function BlockRenderer({ block, t = DEFAULT_T }: { block: PageBlock; t?: typeof DEFAULT_T }) {
  const [videoOpen, setVideoOpen] = useState(false);
  const jsOffsetRef = useRef<HTMLDivElement>(null);
  const mode = block.continuousBgMode || 'none';
  const isJsOffset = mode === 'js_offset';
  useJsOffsetBg(jsOffsetRef, isJsOffset);
  const hasShape = (block.sectionShapeTop && block.sectionShapeTop !== 'none') ||
    (block.sectionShapeBottom && block.sectionShapeBottom !== 'none');

  if (!block.visible) return null;

  const isDark = block.colorTheme === 'dark';
  const isBrand = block.colorTheme === 'brand';
  const textCol = (isDark || isBrand) ? 'white' : '#1d1d1f';
  const subCol = (isDark || isBrand) ? 'rgba(255,255,255,.6)' : '#6e6e73';
  const inner = renderBlockInner({ block, t, textCol, subCol, videoOpen, setVideoOpen });

  if (mode === 'fixed' || mode === 'js_offset') {
    const bgCSS = buildContinuousBgCSS(block);
    const bgOpacity = (block.continuousBgOpacity ?? 100) / 100;
    const bgType = block.continuousBgType || 'gradient';
    const isImage = bgType === 'image';
    const bgLayerStyle: React.CSSProperties = {
      position: 'absolute', inset: 0, zIndex: 0,
      backgroundImage: isImage ? bgCSS : undefined,
      background: !isImage ? bgCSS : undefined,
      backgroundAttachment: mode === 'fixed' ? 'fixed' : 'scroll',
      backgroundSize: mode === 'fixed' ? 'cover' : undefined,
      backgroundRepeat: 'no-repeat', opacity: bgOpacity,
    };
    return (
      <div ref={isJsOffset ? jsOffsetRef : undefined} style={{ position: 'relative', isolation: 'isolate' }}>
        <div style={bgLayerStyle} />
        {hasShape && <SectionShapeLayer block={block} />}
        <div style={{ position: 'relative', zIndex: 1 }}>{inner}</div>
      </div>
    );
  }

  if (mode === 'parent') {
    if (!hasShape) return <>{inner}</>;
    return <div style={{ position: 'relative' }}><SectionShapeLayer block={block} />{inner}</div>;
  }

  if (!hasShape) return <>{inner}</>;
  return (
    <div style={{ position: 'relative' }}>
      <SectionShapeLayer block={block} />
      {inner}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function renderBlockInner({ block, t, textCol, subCol, videoOpen, setVideoOpen }: {
  block: PageBlock; t: typeof DEFAULT_T; textCol: string; subCol: string;
  videoOpen: boolean; setVideoOpen: (v: boolean) => void;
}): React.ReactNode {
  switch (block.type) {

    // ── HERO ─────────────────────────────────────────────────────────────────
    case 'hero': {
      const hasHeroContent = !!(block.title?.trim() || block.description?.trim() || block.imageUrl);
      if (!hasHeroContent) {
        return (
          <div style={{ position: 'relative', width: '100%', minHeight: 320, background: `linear-gradient(135deg, #0d0d10 0%, ${t.from}40 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
            <div style={{ border: `2px dashed ${t.from}80`, borderRadius: 12, padding: '24px 40px', textAlign: 'center' }}>
              <p style={{ color: t.from, fontFamily: "'Outfit',sans-serif", fontSize: 18, fontWeight: 700, margin: 0 }}>Bloco Hero</p>
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, margin: '6px 0 0' }}>Adicione um título, descrição ou imagem para visualizar</p>
            </div>
          </div>
        );
      }
      const heroBanner = {
        id: 0, title: block.title || '', subtitle: block.badge || '',
        description: block.description || '', cta_text: block.ctaLabel || '',
        cta_link: block.ctaLink || '', image: block.imageUrl || '',
        bg_color: block.accentColor || t.from,
        banner_style: (block.bannerStyle || 'cinematic') as any,
        use_style: (block as any).useStyle ?? 1,
        use_default_bg: (block as any).useDefaultBg ?? (block.imageUrl ? 0 : 1),
        active: 1, order_num: 0, page: '',
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

      if (layout === 'split_dark') {
        const cols = allItems.length <= 4 ? 2 : 3;
        return (
          <section style={{ padding: sectionPad(block) }} className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div style={{ background: '#13141b', borderRadius: rr, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1.6fr', boxShadow: '0 32px 80px rgba(0,0,0,.25)' }}>
              <div style={{ padding: '56px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,.06)', background: 'linear-gradient(160deg,#16171f,#0f1015)' }}>
                {label && <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.14em', color: ac, marginBottom: 16, textTransform: 'uppercase' }}>{label}</p>}
                <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(1.6rem,2.5vw,2.2rem)', fontWeight: 900, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: mainSub ? 18 : 0 }}>{mainTitle}</h2>
                {mainSub && <p style={{ fontSize: 14, color: 'rgba(255,255,255,.45)', lineHeight: 1.7 }}>{mainSub}</p>}
                <div style={{ marginTop: 32, width: 48, height: 3, borderRadius: 99, background: `linear-gradient(90deg,${ac},${ac}40)` }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 1, background: 'rgba(255,255,255,.04)' }}>
                {allItems.map((item, i) => {
                  const lbl = typeof item === 'string' ? item : item.label;
                  const ico = typeof item === 'string' ? '' : item.icon;
                  const dsc = typeof item === 'string' ? '' : (item.desc || '');
                  return (
                    <div key={i} style={{ padding: '28px 24px', background: '#13141b', display: 'flex', flexDirection: 'column', gap: 10, cursor: 'default', transition: 'background .2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#1a1b24'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#13141b'; }}>
                      {ico && <div style={{ fontSize: 20, width: 38, height: 38, borderRadius: 10, background: `${ac}18`, border: `1px solid ${ac}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{ico}</div>}
                      <div>
                        <p style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 14, color: '#fff', lineHeight: 1.35 }}>{lbl}</p>
                        {dsc && <p style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginTop: 5, lineHeight: 1.6 }}>{dsc}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      }

      if (layout === 'dark_cards') {
        return (
          <section style={{ padding: sectionPad(block) }} className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div style={{ background: '#0f1015', borderRadius: rr, padding: '56px 48px', boxShadow: '0 24px 60px rgba(0,0,0,.2)' }}>
              <SectionHead label={label} title={mainTitle} subtitle={mainSub} t={{ ...t, from: ac }} dark />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12 }}>
                {allItems.map((item, i) => {
                  const lbl = typeof item === 'string' ? item : item.label;
                  const ico = typeof item === 'string' ? '◈' : item.icon;
                  const dsc = typeof item === 'string' ? '' : (item.desc || '');
                  return (
                    <div key={i} style={{ background: '#1a1b26', border: `1px solid rgba(255,255,255,.07)`, borderRadius: 16, padding: '24px 20px', cursor: 'default', transition: 'border-color .2s, transform .25s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${ac}50`; (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.07)'; (e.currentTarget as HTMLElement).style.transform = ''; }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, border: `1px solid ${ac}30`, background: `${ac}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 14 }}>{ico}</div>
                      <p style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 14, color: '#fff', lineHeight: 1.35, marginBottom: dsc ? 6 : 0 }}>{lbl}</p>
                      {dsc && <p style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', lineHeight: 1.6 }}>{dsc}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      }

      if (layout === 'half_split') {
        const half = Math.ceil(allItems.length / 2);
        const leftItems = allItems.slice(0, half);
        const rightItems = allItems.slice(half);
        return (
          <section style={{ padding: sectionPad(block) }} className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div style={{ borderRadius: rr, overflow: 'hidden' }}>
              <div style={{ display: 'flex', position: 'relative' }}>
                <div style={{ flex: 1, background: '#f4f4f6', padding: '48px 40px 24px' }} />
                <div style={{ flex: 1, background: '#0f1017', padding: '48px 40px 24px' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 40, pointerEvents: 'none' }}>
                  <div style={{ textAlign: 'center', maxWidth: 640, padding: '0 20px' }}>
                    {label && <div style={{ display: 'inline-block', background: '#0f1017', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', padding: '5px 14px', borderRadius: 8, marginBottom: 16 }}>{label}</div>}
                    {mainTitle && <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(1.5rem,2.8vw,2.3rem)', fontWeight: 800, color: '#0f1017', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: mainSub ? 12 : 0 }}>{mainTitle}</h2>}
                    {mainSub && <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>{mainSub}</p>}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex' }}>
                <div style={{ flex: 1, background: '#f4f4f6', padding: '16px 40px 48px', display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                  {leftItems.map((item, i) => {
                    const lbl = typeof item === 'string' ? item : item.label;
                    const ico = typeof item === 'string' ? '' : item.icon;
                    const dsc = typeof item === 'string' ? '' : (item.desc || '');
                    return (
                      <div key={i} style={{ background: '#fff', border: '1px solid rgba(0,0,0,.07)', borderRadius: 16, padding: '20px', display: 'flex', gap: 14, alignItems: 'flex-start', transition: 'border-color .2s, transform .2s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${ac}50`; (e.currentTarget as HTMLElement).style.transform = 'translateX(4px)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,.07)'; (e.currentTarget as HTMLElement).style.transform = ''; }}>
                        {ico && <div style={{ width: 40, height: 40, borderRadius: 12, background: `${ac}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{ico}</div>}
                        <div>
                          <p style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 14, color: '#1a1a1a', lineHeight: 1.3 }}>{lbl}</p>
                          {dsc && <p style={{ fontSize: 12, color: '#888', marginTop: 4, lineHeight: 1.5 }}>{dsc}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ flex: 1, background: '#0f1017', padding: '16px 40px 48px', display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                  {rightItems.map((item, i) => {
                    const lbl = typeof item === 'string' ? item : item.label;
                    const ico = typeof item === 'string' ? '' : item.icon;
                    const dsc = typeof item === 'string' ? '' : (item.desc || '');
                    return (
                      <div key={i} style={{ background: '#1a1b24', border: '1px solid rgba(255,255,255,.07)', borderRadius: 16, padding: '20px', display: 'flex', gap: 14, alignItems: 'flex-start', transition: 'border-color .2s, transform .2s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${ac}50`; (e.currentTarget as HTMLElement).style.transform = 'translateX(-4px)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.07)'; (e.currentTarget as HTMLElement).style.transform = ''; }}>
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

      if (layout === 'highlight_list') {
        return (
          <section style={{ padding: sectionPad(block) }} className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <SectionHead label={label} title={mainTitle} subtitle={mainSub} t={{ ...t, from: ac }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 10 }}>
              {allItems.map((item, i) => {
                const lbl = typeof item === 'string' ? item : item.label;
                const dsc = typeof item === 'string' ? '' : (item.desc || '');
                return (
                  <div key={i} style={{ display: 'flex', gap: 14, padding: '18px', background: '#fff', border: '1px solid rgba(0,0,0,.07)', borderRadius: 14, alignItems: 'flex-start', transition: 'border-color .2s, box-shadow .2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${ac}50`; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${ac}12`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,.07)'; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg,${ac},${ac}bb)`, color: '#fff', fontWeight: 800, fontSize: 13, fontFamily: "'Outfit',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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

      if (layout === 'checklist') {
        return (
          <section style={{ padding: sectionPad(block) }} className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <SectionHead label={label} title={mainTitle} subtitle={mainSub} t={{ ...t, from: ac }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 8, maxWidth: 860, margin: '0 auto' }}>
              {allItems.map((item, i) => {
                const lbl = typeof item === 'string' ? item : item.label;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', background: '#fff', border: '1px solid rgba(0,0,0,.07)', borderRadius: 50, transition: 'all .2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${ac}50`; (e.currentTarget as HTMLElement).style.background = `${ac}06`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,.07)'; (e.currentTarget as HTMLElement).style.background = '#fff'; }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: `linear-gradient(135deg,${ac},${ac}bb)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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

      // default: cards_hover
      return (
        <section style={{ padding: sectionPad(block) }} className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <SectionHead label={label} title={mainTitle} subtitle={mainSub} t={{ ...t, from: ac }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
            {allItems.map((item, i) => {
              const lbl = typeof item === 'string' ? item : item.label;
              const ico = typeof item === 'string' ? '' : item.icon;
              const dsc = typeof item === 'string' ? '' : (item.desc || '');
              return (
                <div key={i} style={{ padding: '28px 22px', background: '#fff', border: '1px solid rgba(0,0,0,.07)', borderRadius: 20, cursor: 'default', transition: 'all .25s', boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)'; (e.currentTarget as HTMLElement).style.borderColor = `${ac}40`; (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 48px ${ac}18`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,.07)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,.04)'; }}>
                  {ico && <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg,${ac}20,${ac}10)`, border: `1px solid ${ac}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 16 }}>{ico}</div>}
                  <p style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 15, color: '#1a1a1a', lineHeight: 1.35, marginBottom: dsc ? 8 : 0 }}>{lbl}</p>
                  {dsc && <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6 }}>{dsc}</p>}
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

    // ── IMAGE TEXT ────────────────────────────────────────────────────────────
    case 'image_text': {
      const imgSrc = resolveImg(block.imageUrl);
      const imgRight = block.imagePosition !== 'left';
      const rr = cardRadius(block);
      const maxH = block.imageMaxHeight || 500;
      const hasBg = block.imageHasBg !== false;
      const bgColor = block.imageBgColor || '#e0f2fe';
      const contain = block.imageContain !== false;
      return (
        <section style={{ padding: sectionPad(block) }} className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', borderRadius: rr, overflow: 'hidden', maxHeight: maxH, border: '1px solid rgba(0,0,0,.07)', boxShadow: '0 16px 48px rgba(0,0,0,.08)' }}>
            {!imgRight && (
              <div style={{ background: hasBg ? bgColor : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', order: 0 }}>
                {imgSrc ? <img src={imgSrc} alt={block.imageAlt || ''} style={{ width: '100%', height: '100%', maxHeight: maxH, objectFit: contain ? 'contain' : 'cover', display: 'block', transition: 'transform .4s' }} onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')} onMouseLeave={e => (e.currentTarget.style.transform = '')} />
                  : <div style={{ width: '100%', height: maxH, background: hasBg ? bgColor : '#f9f9fb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 80 }}>🖼️</span></div>}
              </div>
            )}
            <div style={{ padding: '52px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#fff', order: imgRight ? 0 : 1 }}>
              {block.badge && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 50, border: `1.5px solid ${t.from}40`, color: t.from, fontSize: 12, fontWeight: 700, marginBottom: 20, alignSelf: 'flex-start', background: `${t.from}08` }}>
                  {block.badge} <ArrowRight style={{ width: 12, height: 12 }} />
                </div>
              )}
              {block.title && <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(1.8rem,3vw,2.75rem)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', color: '#0f172a', marginBottom: 16 }}>{block.title}</h2>}
              {block.description && <p style={{ fontSize: '0.95rem', lineHeight: 1.7, color: '#475569', marginBottom: (block.items && block.items.length > 0) ? 24 : 0 }}>{block.description}</p>}
              {block.items && block.items.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                  {block.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: `${t.from}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Check style={{ width: 11, height: 11, color: t.from, strokeWidth: 3 }} />
                      </div>
                      <p style={{ fontSize: '0.9rem', color: '#374151' }}>{item}</p>
                    </div>
                  ))}
                </div>
              )}
              {(block.ctaLabel || block.secondaryLabel) && (
                <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
                  {block.ctaLabel && <Link to={block.ctaLink || '/cliente'}><button style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', borderRadius: 12, background: `linear-gradient(135deg,${t.from},${t.to})`, color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', boxShadow: `0 8px 24px ${t.glow}` }}>{block.ctaLabel} <ArrowRight style={{ width: 16, height: 16 }} /></button></Link>}
                  {block.secondaryLabel && <Link to={block.secondaryLink || '/'}><button style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', borderRadius: 12, background: 'transparent', color: t.from, fontWeight: 700, fontSize: 14, border: `1.5px solid ${t.from}40`, cursor: 'pointer' }}>{block.secondaryLabel} <ArrowRight style={{ width: 16, height: 16 }} /></button></Link>}
                </div>
              )}
            </div>
            {imgRight && (
              <div style={{ background: hasBg ? bgColor : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', order: 1 }}>
                {imgSrc ? <img src={imgSrc} alt={block.imageAlt || ''} style={{ width: '100%', height: '100%', maxHeight: maxH, objectFit: contain ? 'contain' : 'cover', display: 'block', transition: 'transform .4s' }} onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')} onMouseLeave={e => (e.currentTarget.style.transform = '')} />
                  : <div style={{ width: '100%', height: maxH, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 80 }}>🖼️</span></div>}
              </div>
            )}
          </div>
        </section>
      );
    }

    // ── STEPS ─────────────────────────────────────────────────────────────────
    case 'steps': {
      const steps = block.steps || [];
      const ref = useRef<HTMLDivElement>(null);
      const v = useInView(ref);
      return (
        <section style={{ padding: sectionPad(block) }} className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <SectionHead title={block.title} subtitle={block.subtitle} t={t} dark={block.colorTheme === 'dark'} />
          <div ref={ref} className="max-w-2xl mx-auto" style={{ position: 'relative' }}>
            {/* connector line */}
            <div style={{ position: 'absolute', left: 27, top: 56, bottom: 28, width: 2, background: `linear-gradient(180deg,${t.from}40,transparent)`, borderRadius: 2 }} />
            {steps.map((step, i) => (
              <div key={i} style={{
                display: 'flex', gap: 24, marginBottom: i < steps.length - 1 ? 28 : 0,
                opacity: v ? 1 : 0, transform: v ? 'translateX(0)' : 'translateX(-20px)',
                transition: `opacity .5s ease ${i * 0.12}s, transform .5s ease ${i * 0.12}s`,
              }}>
                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: `linear-gradient(135deg,${t.from},${t.to})`,
                    color: '#fff', fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: 17,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 8px 24px ${t.glow}`, border: '3px solid #fff',
                  }}>{step.number || String(i + 1).padStart(2, '0')}</div>
                </div>
                <div style={{
                  flex: 1, padding: '14px 20px', borderRadius: 16,
                  background: block.colorTheme === 'dark' ? 'rgba(255,255,255,.04)' : '#fff',
                  border: `1px solid ${block.colorTheme === 'dark' ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.07)'}`,
                  boxShadow: '0 2px 12px rgba(0,0,0,.05)',
                  transition: 'border-color .2s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${t.from}40`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = block.colorTheme === 'dark' ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.07)'; }}>
                  <h3 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 16, color: block.colorTheme === 'dark' ? '#fff' : '#0f172a', marginBottom: step.description ? 6 : 0 }}>{step.title}</h3>
                  {step.description && <p style={{ fontSize: 14, color: block.colorTheme === 'dark' ? 'rgba(255,255,255,.55)' : '#64748b', lineHeight: 1.65 }}>{step.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      );
    }

    // ── STATS ─────────────────────────────────────────────────────────────────
    case 'stats': {
      const stats = block.stats || [];
      const ref = useRef<HTMLDivElement>(null);
      const v = useInView(ref);
      return (
        <section style={{ background: block.bgColor || (block.colorTheme === 'dark' ? '#0f172a' : '#fff'), borderTop: '1px solid rgba(0,0,0,.06)', borderBottom: '1px solid rgba(0,0,0,.06)' }}>
          <div ref={ref} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ padding: '56px 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)`, gap: 0 }}>
              {stats.map((s, i) => (
                <div key={i} style={{
                  textAlign: 'center', padding: '24px 32px',
                  borderRight: i < stats.length - 1 ? `1px solid ${block.colorTheme === 'dark' ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.07)'}` : 'none',
                  opacity: v ? 1 : 0, transform: v ? 'translateY(0)' : 'translateY(20px)',
                  transition: `opacity .55s ease ${i * 0.1}s, transform .55s ease ${i * 0.1}s`,
                }}>
                  <p style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: 'clamp(2rem,4vw,3rem)', lineHeight: 1, marginBottom: 8, background: `linear-gradient(135deg,${t.from},${t.to})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</p>
                  <p style={{ fontSize: 14, color: block.colorTheme === 'dark' ? 'rgba(255,255,255,.5)' : '#64748b', fontWeight: 500, letterSpacing: '.01em' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    // ── TESTIMONIAL ───────────────────────────────────────────────────────────
    case 'testimonial': {
      if (!block.quote) return null;
      const initials = (block.author || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
      return (
        <section style={{ padding: sectionPad(block) }} className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <DarkCard pc={t.from}>
            <div className="max-w-2xl mx-auto text-center">
              {/* stars */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 24 }}>
                {[0, 1, 2, 3, 4].map(i => <Star key={i} style={{ width: 18, height: 18, fill: t.from, color: t.from }} />)}
              </div>
              <Quote style={{ width: 36, height: 36, margin: '0 auto 20px', color: t.from, opacity: .8 }} />
              <blockquote style={{ color: '#fff', fontSize: 'clamp(1rem,2vw,1.25rem)', fontWeight: 500, lineHeight: 1.75, fontStyle: 'italic', marginBottom: 32 }}>"{block.quote}"</blockquote>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: `linear-gradient(135deg,${t.from},${t.to})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 16, color: '#fff' }}>{initials}</div>
                <div style={{ textAlign: 'left' }}>
                  {block.author && <p style={{ color: '#fff', fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 15 }}>{block.author}</p>}
                  {block.role && <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 13, marginTop: 2 }}>{block.role}{(block as any).company ? ` · ${(block as any).company}` : ''}</p>}
                </div>
              </div>
            </div>
          </DarkCard>
        </section>
      );
    }

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
      const thumb = `https://img.youtube.com/vi/${vid}/maxresdefault.jpg`;
      return (
        <section style={{ padding: sectionPad(block) }} className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <DarkCard pc={t.from}>
            {block.title && <SectionHead title={block.title} t={t} dark />}
            <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto', borderRadius: 16, overflow: 'hidden', cursor: 'pointer', boxShadow: '0 32px 64px rgba(0,0,0,.6)' }}
              onClick={() => setVideoOpen(true)}>
              <img src={thumb} alt={block.title || 'Vídeo'} style={{ width: '100%', display: 'block', aspectRatio: '16/9', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,.2)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,.35)'; }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: t.from, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 12px 40px ${t.glow}`, transition: 'transform .2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.1)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}>
                  <Play style={{ width: 28, height: 28, color: '#fff', fill: '#fff', marginLeft: 4 }} />
                </div>
              </div>
            </div>
            {videoOpen && <VideoModal videoId={vid} onClose={() => setVideoOpen(false)} />}
          </DarkCard>
        </section>
      );
    }

    // ── CTA ───────────────────────────────────────────────────────────────────
    case 'cta': {
      const bgOverride = block.bgColor;
      const isDarkCta = block.colorTheme === 'dark';
      const splitLayout = block.ctaLayout === 'split';

      // Split layout: texto esquerda + botões direita
      if (splitLayout) {
        return (
          <section style={{ padding: sectionPad(block), background: bgOverride || (isDarkCta ? '#0f172a' : '#f8fafc') }} className="px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
              <div style={{ borderRadius: 24, border: `1px solid ${isDarkCta ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.06)'}`, background: bgOverride || (isDarkCta ? 'rgba(255,255,255,.04)' : '#fff'), padding: 'clamp(28px,4vw,48px) clamp(24px,5vw,56px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 260 }}>
                  {block.badge && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', background: `${t.from}18`, color: t.from, marginBottom: 12 }}>{block.badge}</span>
                  )}
                  {block.title && <h2 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 'clamp(1.3rem,2.5vw,1.9rem)', color: isDarkCta ? '#fff' : '#0f172a', lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: block.description ? 10 : 0 }}>{block.title}</h2>}
                  {block.description && <p style={{ fontSize: '0.95rem', color: isDarkCta ? 'rgba(255,255,255,.6)' : '#64748b', lineHeight: 1.6, maxWidth: 480 }}>{block.description}</p>}
                </div>
                <div style={{ display: 'flex', gap: 12, flexShrink: 0, flexWrap: 'wrap', alignItems: 'center' }}>
                  {block.ctaLabel && (
                    <Link to={block.ctaLink || '/cliente'}>
                      <button style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', borderRadius: 12, background: block.ctaBtnBg || `linear-gradient(135deg,${t.from},${t.to})`, color: block.ctaBtnText || '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', boxShadow: `0 8px 24px ${t.glow}`, transition: 'transform .2s, box-shadow .2s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}>
                        {block.ctaLabel} <ArrowRight style={{ width: 15, height: 15 }} />
                      </button>
                    </Link>
                  )}
                  {block.secondaryLabel && (
                    <Link to={block.secondaryLink || '/'}>
                      <button style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 22px', borderRadius: 12, background: 'transparent', color: isDarkCta ? 'rgba(255,255,255,.8)' : '#475569', fontWeight: 600, fontSize: 14, border: `1.5px solid ${isDarkCta ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.12)'}`, cursor: 'pointer', transition: 'background .2s, color .2s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = isDarkCta ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.04)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                        {block.secondaryLabel}
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </section>
        );
      }

      // Layout centralizado (padrão)
      // bgColor = fundo da seção (fora do card), ctaBgColor = fundo do card CTA
      const sectionBg = block.bgColor || 'transparent';
      const cardBg = block.ctaBgColor || `linear-gradient(135deg,${t.from} 0%,${t.to} 100%)`;
      return (
        <section style={{ padding: sectionPad(block), background: sectionBg }} className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div style={{ borderRadius: 28, overflow: 'hidden', position: 'relative', background: cardBg, padding: 'clamp(48px,7vw,80px) clamp(32px,6vw,80px)', textAlign: 'center', boxShadow: `0 32px 80px ${t.glow}` }}>
            {/* dot pattern */}
            <div style={{ position: 'absolute', inset: 0, opacity: .07, backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />
            {/* glow orbs */}
            <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,.08)', filter: 'blur(60px)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-30%', left: '-5%', width: 280, height: 280, borderRadius: '50%', background: 'rgba(0,0,0,.12)', filter: 'blur(60px)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              {/* Badge/eyebrow */}
              {block.badge && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', background: 'rgba(255,255,255,.18)', color: '#fff', backdropFilter: 'blur(8px)', marginBottom: 18, border: '1px solid rgba(255,255,255,.25)' }}>{block.badge}</span>
              )}
              {block.title && <h2 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: 'clamp(1.75rem,4vw,3rem)', color: block.titleColor || '#fff', lineHeight: 1.1, letterSpacing: '-0.025em', marginBottom: 16 }}>{block.title}</h2>}
              {block.description && <p style={{ fontSize: '1.05rem', color: block.subtitleColor || 'rgba(255,255,255,.8)', marginBottom: 36, maxWidth: 520, margin: '0 auto 36px', lineHeight: 1.7 }}>{block.description}</p>}
              <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                {block.ctaLabel && (
                  <Link to={block.ctaLink || '/cliente'}>
                    <button style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 32px', borderRadius: 14, background: block.ctaBtnBg || '#fff', color: block.ctaBtnText || t.from, fontWeight: 800, fontSize: 15, border: 'none', cursor: 'pointer', boxShadow: '0 8px 32px rgba(0,0,0,.2)', transition: 'transform .2s, box-shadow .2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 40px rgba(0,0,0,.25)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(0,0,0,.2)'; }}>
                      {block.ctaLabel} <ArrowRight style={{ width: 16, height: 16 }} />
                    </button>
                  </Link>
                )}
                {block.secondaryLabel && (
                  <Link to={block.secondaryLink || '/'}>
                    <button style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 32px', borderRadius: 14, background: 'rgba(255,255,255,.15)', color: '#fff', fontWeight: 700, fontSize: 15, border: '1.5px solid rgba(255,255,255,.35)', cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'background .2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.22)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.15)'; }}>
                      {block.secondaryLabel} <ArrowRight style={{ width: 16, height: 16 }} />
                    </button>
                  </Link>
                )}
              </div>
              {/* Social proof */}
              {block.socialProof && (
                <p style={{ marginTop: 28, fontSize: 12, color: 'rgba(255,255,255,.55)', fontWeight: 500 }}>{block.socialProof}</p>
              )}
            </div>
          </div>
        </section>
      );
    }

    // ── TEXT ──────────────────────────────────────────────────────────────────
    case 'text': {
      const isDark = block.colorTheme === 'dark';
      return (
        <section style={{ padding: sectionPad(block), background: block.bgColor || (isDark ? '#0f172a' : '#fff') }} className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div style={{ borderLeft: `4px solid ${t.from}`, paddingLeft: 24 }}>
              {block.title && <h2 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: 'clamp(1.4rem,2.5vw,2rem)', color: isDark ? '#fff' : '#0f172a', marginBottom: 12, letterSpacing: '-0.02em' }}>{block.title}</h2>}
              {block.description && <p style={{ color: isDark ? 'rgba(255,255,255,.65)' : '#475569', lineHeight: 1.8, fontSize: '1rem', whiteSpace: 'pre-wrap' }}>{block.description}</p>}
            </div>
          </div>
        </section>
      );
    }

    // ── RICHTEXT ──────────────────────────────────────────────────────────────
    case 'richtext':
      if (!block.html) return null;
      return (
        <section style={{ padding: sectionPad(block) }} className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className={`${block.block_style === 'card' ? 'bg-white rounded-3xl p-10 shadow-sm border border-black/5' : ''} prose prose-lg prose-slate max-w-none`}
            style={{ '--tw-prose-headings': '#0f172a', '--tw-prose-links': t.from } as any}
            dangerouslySetInnerHTML={{ __html: block.html }} />
        </section>
      );

    // ── IMAGE ─────────────────────────────────────────────────────────────────
    case 'image': {
      const src = resolveImg(block.imageUrl);
      if (!src) return null;
      return (
        <section style={{ padding: sectionPad(block) }} className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div style={{ overflow: 'hidden', borderRadius: cardRadius(block), boxShadow: '0 16px 48px rgba(0,0,0,.12)', position: 'relative' }}>
            <img src={src} alt={block.imageAlt || ''} style={{ width: '100%', objectFit: 'cover', display: 'block', transition: 'transform .5s ease' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.02)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }} />
            {block.imageAlt && (
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '32px 24px 16px', background: 'linear-gradient(transparent,rgba(0,0,0,.5))' }}>
                <p style={{ color: 'rgba(255,255,255,.85)', fontSize: 13, textAlign: 'center' }}>{block.imageAlt}</p>
              </div>
            )}
          </div>
        </section>
      );
    }

    // ── INTEGRATIONS ──────────────────────────────────────────────────────────
    case 'integrations': {
      const logoItems: { name: string; imageUrl: string }[] = block.logoItems || [];
      const textItems: string[] = block.items || [];
      const hasLogos = logoItems.length > 0;
      const hasItems = hasLogos || textItems.length > 0;
      if (!hasItems) return null;
      const isDark = block.colorTheme === 'dark';
      // use marquee for many logos
      const useMarquee = hasLogos && logoItems.length >= 6;
      const doubled = [...logoItems, ...logoItems];
      return (
        <section style={{ padding: sectionPad(block), background: isDark ? '#0a0a10' : '#fafafa', overflow: 'hidden' }}>
          <style>{`@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {block.title && <SectionHead title={block.title} t={t} dark={isDark} />}
            {hasLogos ? (
              useMarquee ? (
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 80, background: `linear-gradient(90deg,${isDark ? '#0a0a10' : '#fafafa'},transparent)`, zIndex: 2, pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, background: `linear-gradient(-90deg,${isDark ? '#0a0a10' : '#fafafa'},transparent)`, zIndex: 2, pointerEvents: 'none' }} />
                  <div style={{ display: 'flex', gap: 16, animation: 'marquee 28s linear infinite', width: 'max-content' }}>
                    {doubled.map((logo, i) => (
                      <div key={i} title={logo.name} style={{ height: 60, padding: '0 24px', background: isDark ? 'rgba(255,255,255,.06)' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.08)'}`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, minWidth: 120 }}>
                        {logo.imageUrl ? <img src={resolveImg(logo.imageUrl) ?? logo.imageUrl} alt={logo.name} style={{ height: 32, maxWidth: 100, objectFit: 'contain' }} /> : <span style={{ fontSize: 13, fontWeight: 700, color: isDark ? '#fff' : '#1d1d1f' }}>{logo.name}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center', alignItems: 'center' }}>
                  {logoItems.map((logo, i) => (
                    <div key={i} title={logo.name} style={{ height: 60, padding: '0 24px', background: isDark ? 'rgba(255,255,255,.06)' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,.08)' : 'rgba(0,0,0,.08)'}`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,.05)', transition: 'all .2s', minWidth: 110 }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 20px rgba(0,0,0,.1)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = isDark ? 'none' : '0 2px 8px rgba(0,0,0,.05)'; }}>
                      {logo.imageUrl ? <img src={resolveImg(logo.imageUrl) ?? logo.imageUrl} alt={logo.name} style={{ height: 32, maxWidth: 100, objectFit: 'contain' }} /> : <span style={{ fontSize: 13, fontWeight: 700, color: isDark ? '#fff' : '#1d1d1f' }}>{logo.name}</span>}
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
                {textItems.map((item, i) => (
                  <span key={i} style={{ padding: '10px 20px', borderRadius: 50, fontSize: 13, fontWeight: 600, background: isDark ? 'rgba(255,255,255,.08)' : '#f1f5f9', color: isDark ? '#fff' : '#1d1d1f', border: `1px solid ${isDark ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.07)'}` }}>{item}</span>
                ))}
              </div>
            )}
          </div>
        </section>
      );
    }

    // ── DIVIDER ───────────────────────────────────────────────────────────────
    case 'divider':
      if (block.dividerStyle === 'space') return <div style={{ height: 56 }} />;
      if (block.dividerStyle === 'dots') return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '24px 0' }}>
          {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(0,0,0,.15)' }} />)}
        </div>
      );
      if (block.dividerStyle === 'gradient') return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div style={{ height: 2, background: `linear-gradient(90deg,transparent,${t.from}60,transparent)`, borderRadius: 2 }} />
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 0' }}>
          <svg viewBox="0 0 300 20" height="20" width="300">
            <path d="M0 10 Q25 2 50 10 Q75 18 100 10 Q125 2 150 10 Q175 18 200 10 Q225 2 250 10 Q275 18 300 10" fill="none" stroke="rgba(0,0,0,.15)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      );
      if (block.dividerStyle === 'ornament') return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 0', maxWidth: 1280, margin: '0 auto', }}>
          <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,transparent,${t.from}40)` }} />
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.from }} />
          <div style={{ flex: 1, height: 1, background: `linear-gradient(-90deg,transparent,${t.from}40)` }} />
        </div>
      );
      {
        const c = block.dividerColor || t.from;
        if (block.dividerStyle === 'triangle') return (
          <div style={{ lineHeight: 0, overflow: 'hidden' }}>
            <svg viewBox="0 0 1440 80" width="100%" height="80" preserveAspectRatio="none"><polygon points="0,0 1440,0 1440,80 0,30" fill={c} /></svg>
          </div>
        );
        if (block.dividerStyle === 'clouds') return (
          <div style={{ lineHeight: 0, overflow: 'hidden' }}>
            <svg viewBox="0 0 1440 80" width="100%" height="80" preserveAspectRatio="none">
              <path d="M0 80 Q60 20 130 50 Q200 10 290 50 Q360 5 450 50 Q520 15 610 50 Q680 10 770 50 Q840 15 930 50 Q1000 8 1090 50 Q1160 15 1250 50 Q1320 20 1440 40 L1440 80 Z" fill={c} />
            </svg>
          </div>
        );
        if (block.dividerStyle === 'waves_fill') return (
          <div style={{ lineHeight: 0, overflow: 'hidden' }}>
            <svg viewBox="0 0 1440 80" width="100%" height="80" preserveAspectRatio="none">
              <path d="M0 50 Q180 10 360 50 Q540 90 720 50 Q900 10 1080 50 Q1260 90 1440 50 L1440 80 L0 80 Z" fill={c} opacity="0.45" />
              <path d="M0 60 Q180 30 360 60 Q540 90 720 60 Q900 30 1080 60 Q1260 90 1440 60 L1440 80 L0 80 Z" fill={c} />
            </svg>
          </div>
        );
        if (block.dividerStyle === 'mountains') return (
          <div style={{ lineHeight: 0, overflow: 'hidden' }}>
            <svg viewBox="0 0 1440 80" width="100%" height="80" preserveAspectRatio="none">
              <polygon points="0,80 240,15 480,55 720,5 960,45 1200,20 1440,50 1440,80" fill={c} />
            </svg>
          </div>
        );
      }
      return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"><hr style={{ borderColor: 'rgba(0,0,0,.08)' }} /></div>;

    default:
      return null;
  }
}