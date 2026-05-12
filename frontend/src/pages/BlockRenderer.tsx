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
  white: { from: 'var(--s1)', to: '#e2e8f0', text: '#475569', glow: 'rgba(248,250,252,.5)' },
};


// ── Helpers ───────────────────────────────────────────────────────────────────
const SPACING: Record<string, string> = { compact: '40px 0', normal: '72px 0', spacious: '120px 0' };
const RADIUS: Record<string, number> = { none: 0, small: 8, medium: 16, large: 24, full: 9999 };
function sectionPad(block: PageBlock) { return SPACING[block.blockSpacing || 'normal']; }
function cardRadius(block: PageBlock) { return RADIUS[block.blockRadius || 'large']; }

const TITLE_SIZE_MAP: Record<string, string> = {
  sm: 'clamp(1.1rem,2vw,1.5rem)', md: 'clamp(1.4rem,2.5vw,2rem)',
  lg: 'clamp(1.75rem,3.5vw,2.75rem)', xl: 'clamp(2rem,4vw,3.5rem)', '2xl': 'clamp(2.5rem,5vw,4.5rem)',
};
const SUBTITLE_SIZE_MAP: Record<string, string> = { sm: '0.9rem', md: '1.05rem', lg: '1.25rem' };
const CONTAINER_WIDTH_MAP: Record<string, string> = {
  narrow: '640px', normal: '1100px', wide: '1400px', full: '100%',
};
function containerMaxW(block: PageBlock) {
  return CONTAINER_WIDTH_MAP[block.containerWidth || 'normal'];
}

function getBlockStyles(block: PageBlock, t: typeof DEFAULT_T) {
  return {
    section: {
      padding: sectionPad(block),
      background: block.bgColor || (block.colorTheme === 'dark' ? '#0f172a' : block.colorTheme === 'brand' ? t.from : 'var(--s0)'),
    },
    title: {
      color: block.titleColor || (block.colorTheme === 'dark' || block.colorTheme === 'brand' ? '#ffffff' : 'var(--t1)'),
      fontSize: block.titleSize || TITLE_SIZE_MAP[block.titleSizePreset || 'lg'],
      fontFamily: "var(--font-heading,'Outfit'), sans-serif",
      textAlign: (block.titleAlign || 'center') as React.CSSProperties['textAlign'],
    },
    subtitle: {
      color: block.subtitleColor || (block.colorTheme === 'dark' || block.colorTheme === 'brand' ? 'rgba(255,255,255,0.7)' : 'var(--t3)'),
      fontSize: block.subtitleSize || SUBTITLE_SIZE_MAP[block.subtitleSizePreset || 'md'],
    },
    cta: {
      background: block.ctaBgColor || (block.colorTheme === 'brand' ? '#ffffff' : t.from),
      color: block.ctaTextColor || (block.colorTheme === 'brand' ? t.from : '#ffffff'),
    }
  };
}

// ── CTA button renderer (respeita ctaStyle + ctaRadius) ──────────────────────
function renderCtaButton(
  block: PageBlock, t: typeof DEFAULT_T,
  label: string, href: string,
  opts?: { accent?: string; className?: string }
) {
  const style = block.ctaStyle || 'filled';
  const rad = block.ctaRadius || 'rounded';
  const radius = rad === 'pill' ? 999 : rad === 'rounded' ? 12 : 6;
  const accent = opts?.accent || block.ctaBgColor || t.from;
  const accentText = block.ctaTextColor || '#fff';

  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '13px 28px', borderRadius: radius,
    fontSize: 15, fontWeight: 700, cursor: 'pointer', textDecoration: 'none',
    transition: 'all .2s', border: '2px solid transparent',
  };

  let extra: React.CSSProperties = {};
  if (style === 'filled')   extra = { background: accent, color: accentText, boxShadow: `0 8px 24px ${t.glow}` };
  if (style === 'outlined') extra = { background: 'transparent', color: accent, border: `2px solid ${accent}` };
  if (style === 'ghost')    extra = { background: `${accent}15`, color: accent, border: '2px solid transparent' };
  if (style === 'gradient') extra = { background: `linear-gradient(90deg,${accent},${t.to || accent})`, color: '#fff', boxShadow: `0 8px 24px ${t.glow}` };

  return (
    <a href={href} style={{ ...base, ...extra }}>
      {label} <ArrowRight size={16} />
    </a>
  );
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
function SectionHead({ label, title, subtitle, t, dark = false, center = true, as = 'h2', block }: {
  label?: string; title?: string; subtitle?: string; t: typeof DEFAULT_T; dark?: boolean; center?: boolean;
  as?: 'h1' | 'h2' | 'h3';
  block?: PageBlock;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const v = useInView(ref);
  if (!label && !title && !subtitle) return null;
  const Heading = as as 'h1';
  const align: React.CSSProperties['textAlign'] = block?.titleAlign || (center ? 'center' : 'left');
  const titleFontSize = block?.titleSize || TITLE_SIZE_MAP[block?.titleSizePreset || 'lg'];
  const subtitleFontSize = block?.subtitleSize || SUBTITLE_SIZE_MAP[block?.subtitleSizePreset || 'md'];
  const isCenter = align === 'center';
  return (
    <div ref={ref} style={{
      textAlign: align, marginBottom: 48,
      opacity: v ? 1 : 0, transform: v ? 'translateY(0)' : 'translateY(24px)',
      transition: 'opacity .6s ease, transform .6s ease',
    }}>
      {label && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          {isCenter && <div style={{ width: 24, height: 2, background: t.from, borderRadius: 2 }} />}
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.14em', color: t.from, textTransform: 'uppercase' }}>{label}</span>
          <div style={{ width: 24, height: 2, background: t.from, borderRadius: 2 }} />
        </div>
      )}
      {title && (
        <Heading style={{
          fontFamily: "var(--font-heading,'Outfit'), sans-serif",
          fontSize: titleFontSize,
          fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.025em',
          color: block?.titleColor || (dark ? '#fff' : '#0f172a'), marginBottom: subtitle ? 16 : 0,
        }}>{title}</Heading>
      )}
      {subtitle && <p style={{ fontSize: subtitleFontSize, color: block?.subtitleColor || (dark ? 'rgba(255,255,255,.6)' : 'var(--t3)'), maxWidth: isCenter ? 560 : 'none', margin: isCenter ? '0 auto' : 0, lineHeight: 1.7 }}>{subtitle}</p>}
    </div>
  );
}

// ── PRICING ───────────────────────────────────────────────────────────────────
function PricingBlock({ block, t, headingAs }: { block: PageBlock; t: typeof DEFAULT_T; headingAs: 'h1' | 'h2' | 'h3' }) {
  const plans = block.pricingPlans || [];
  const showToggle = block.pricingShowToggle !== false && plans.some(p => p.priceAnnual);
  const [annual, setAnnual] = useState(false);
  const isDark = block.colorTheme === 'dark';

  return (
    <section style={getBlockStyles(block, t).section} className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <SectionHead title={block.title} subtitle={block.subtitle} t={t} dark={isDark} as={headingAs} block={block} />

        {showToggle && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
            <div style={{ display: 'inline-flex', padding: 4, background: isDark ? 'rgba(255,255,255,.05)' : 'var(--s2)', borderRadius: 999, border: `1px solid ${isDark ? 'rgba(255,255,255,.08)' : 'var(--b1)'}` }}>
              {(['monthly', 'annual'] as const).map(period => {
                const active = (period === 'annual') === annual;
                const label = period === 'monthly' ? 'Mensal' : 'Anual';
                return (
                  <button key={period} onClick={() => setAnnual(period === 'annual')}
                    style={{
                      padding: '8px 20px', borderRadius: 999, fontSize: 13, fontWeight: 600,
                      background: active ? (isDark ? '#fff' : t.from) : 'transparent',
                      color: active ? (isDark ? '#1d1d1f' : '#fff') : (isDark ? 'rgba(255,255,255,.6)' : 'var(--t3)'),
                      border: 'none', cursor: 'pointer', transition: 'all .2s',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                    {label}
                    {period === 'annual' && block.pricingAnnualDiscountLabel && (
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 999, background: active ? 'rgba(255,255,255,.25)' : '#22c55e22', color: active ? '#fff' : '#15803d', fontWeight: 700 }}>
                        {block.pricingAnnualDiscountLabel}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div style={{
          display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${plans.length >= 3 ? 260 : 320}px, 1fr))`,
          gap: 20, alignItems: 'stretch',
        }}>
          {plans.map((plan, i) => {
            const price = annual && plan.priceAnnual ? plan.priceAnnual : plan.priceMonthly;
            const color = plan.color || t.from;
            return (
              <div key={i} style={{
                background: isDark ? 'rgba(255,255,255,.03)' : 'var(--s1)',
                border: `${plan.highlighted ? 2 : 1}px solid ${plan.highlighted ? color : (isDark ? 'rgba(255,255,255,.08)' : 'var(--b1)')}`,
                borderRadius: 20, padding: '32px 28px',
                display: 'flex', flexDirection: 'column',
                transform: plan.highlighted ? 'scale(1.02)' : 'none',
                boxShadow: plan.highlighted ? `0 24px 60px ${color}25` : 'none',
                position: 'relative', transition: 'transform .2s, box-shadow .2s',
              }}>
                {plan.badge && (
                  <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', padding: '4px 14px', borderRadius: 999, background: color, color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase' }}>
                    {plan.badge}
                  </div>
                )}
                <h3 style={{ fontFamily: "var(--font-heading,'Outfit'),sans-serif", fontSize: 22, fontWeight: 800, color: isDark ? '#fff' : 'var(--t1)', margin: '0 0 6px' }}>{plan.name}</h3>
                {plan.description && <p style={{ fontSize: 13, color: isDark ? 'rgba(255,255,255,.5)' : 'var(--t3)', margin: '0 0 20px' }}>{plan.description}</p>}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 }}>
                  <span style={{ fontSize: 16, color: isDark ? 'rgba(255,255,255,.5)' : 'var(--t3)' }}>{plan.priceCurrency || 'R$'}</span>
                  <span style={{ fontFamily: "var(--font-heading,'Outfit'),sans-serif", fontSize: 44, fontWeight: 900, color: isDark ? '#fff' : 'var(--t1)', lineHeight: 1 }}>{price}</span>
                  <span style={{ fontSize: 13, color: isDark ? 'rgba(255,255,255,.5)' : 'var(--t3)' }}>{plan.priceSuffix || '/mês'}</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                  {plan.features.map((f, fi) => (
                    <li key={fi} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, color: isDark ? 'rgba(255,255,255,.8)' : 'var(--t2)', lineHeight: 1.5 }}>
                      <Check size={16} style={{ color, flexShrink: 0, marginTop: 2 }} strokeWidth={2.5} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                {plan.ctaLabel && (
                  <Link to={plan.ctaLink || '/cliente'}>
                    <button style={{
                      width: '100%', padding: '13px 20px', borderRadius: 12, fontSize: 14, fontWeight: 700,
                      background: plan.highlighted ? color : 'transparent',
                      color: plan.highlighted ? '#fff' : (isDark ? '#fff' : color),
                      border: plan.highlighted ? 'none' : `1.5px solid ${color}`,
                      cursor: 'pointer', transition: 'all .2s',
                    }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}>
                      {plan.ctaLabel}
                    </button>
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {block.pricingFootnote && (
          <p style={{ fontSize: 13, color: isDark ? 'rgba(255,255,255,.5)' : 'var(--t3)', textAlign: 'center', marginTop: 32 }}>{block.pricingFootnote}</p>
        )}
      </div>
    </section>
  );
}

// ── DEMO_FORM ─────────────────────────────────────────────────────────────────
function DemoFormBlock({ block, t, headingAs }: { block: PageBlock; t: typeof DEFAULT_T; headingAs: 'h1' | 'h2' | 'h3' }) {
  const fields = block.formFields || [];
  const [state, setState] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isDark = block.colorTheme === 'dark';
  const apiUrl = block.formApiEndpoint || '/api/leads';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state),
      });
      if (!res.ok) throw new Error('Falha ao enviar');
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || 'Não foi possível enviar. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const layout = block.formLayout || 'inline';
  const benefits = block.formBenefits || [];

  const formContent = (
    <>
      {success ? (
        <div style={{ textAlign: 'center', padding: '32px 16px' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#22c55e22', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Check size={28} style={{ color: '#22c55e' }} strokeWidth={3} />
          </div>
          <h3 style={{ fontFamily: "var(--font-heading,'Outfit'),sans-serif", fontSize: 22, fontWeight: 800, color: isDark ? '#fff' : 'var(--t1)', margin: '0 0 8px' }}>{block.formSuccessTitle || 'Recebemos seu contato!'}</h3>
          <p style={{ fontSize: 14, color: isDark ? 'rgba(255,255,255,.6)' : 'var(--t3)' }}>{block.formSuccessMessage || 'Em breve entraremos em contato.'}</p>
        </div>
      ) : (
        <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {fields.map(f => (
            <div key={f.name} style={{ gridColumn: f.fullWidth ? '1 / -1' : undefined }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: isDark ? 'rgba(255,255,255,.7)' : 'var(--t2)', marginBottom: 6 }}>
                {f.label}{f.required && <span style={{ color: '#ef4444', marginLeft: 3 }}>*</span>}
              </label>
              {f.type === 'textarea' ? (
                <textarea required={f.required} placeholder={f.placeholder}
                  value={state[f.name] || ''}
                  onChange={e => setState(s => ({ ...s, [f.name]: e.target.value }))}
                  rows={3}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1px solid ${isDark ? 'rgba(255,255,255,.1)' : 'var(--b1)'}`, background: isDark ? 'rgba(255,255,255,.04)' : 'var(--s0)', color: isDark ? '#fff' : 'var(--t1)', fontSize: 14, resize: 'vertical', fontFamily: 'inherit' }} />
              ) : f.type === 'select' ? (
                <select required={f.required} value={state[f.name] || ''}
                  onChange={e => setState(s => ({ ...s, [f.name]: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1px solid ${isDark ? 'rgba(255,255,255,.1)' : 'var(--b1)'}`, background: isDark ? 'rgba(255,255,255,.04)' : 'var(--s0)', color: isDark ? '#fff' : 'var(--t1)', fontSize: 14, cursor: 'pointer' }}>
                  <option value="">{f.placeholder || 'Selecione…'}</option>
                  {(f.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : (
                <input type={f.type} required={f.required} placeholder={f.placeholder}
                  value={state[f.name] || ''}
                  onChange={e => setState(s => ({ ...s, [f.name]: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1px solid ${isDark ? 'rgba(255,255,255,.1)' : 'var(--b1)'}`, background: isDark ? 'rgba(255,255,255,.04)' : 'var(--s0)', color: isDark ? '#fff' : 'var(--t1)', fontSize: 14 }} />
              )}
            </div>
          ))}
          {error && <div style={{ gridColumn: '1 / -1', padding: '10px 14px', borderRadius: 10, background: '#fee2e2', color: '#b91c1c', fontSize: 13 }}>{error}</div>}
          <button type="submit" disabled={submitting}
            style={{ gridColumn: '1 / -1', padding: '14px 24px', borderRadius: 12, background: t.from, color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: submitting ? 'wait' : 'pointer', opacity: submitting ? 0.7 : 1, transition: 'all .2s', boxShadow: `0 8px 24px ${t.glow}` }}>
            {submitting ? 'Enviando…' : (block.formSubmitLabel || 'Enviar')}
          </button>
        </form>
      )}
    </>
  );

  return (
    <section style={getBlockStyles(block, t).section} className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {layout === 'inline' && (
          <>
            <SectionHead title={block.formTitle || block.title} subtitle={block.formDescription || block.subtitle} t={t} dark={isDark} as={headingAs} block={block} />
            <div style={{ maxWidth: 560, margin: '0 auto', padding: 32, background: isDark ? 'rgba(255,255,255,.03)' : 'var(--s1)', border: `1px solid ${isDark ? 'rgba(255,255,255,.08)' : 'var(--b1)'}`, borderRadius: 20 }}>
              {formContent}
            </div>
          </>
        )}
        {layout === 'split' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 1fr) minmax(320px, 1.2fr)', gap: 48, alignItems: 'center' }} className="form-split">
            <div>
              <Heading as={headingAs} style={{ fontFamily: "var(--font-heading,'Outfit'),sans-serif", fontSize: 'clamp(1.6rem, 3vw, 2.4rem)', fontWeight: 900, color: isDark ? '#fff' : 'var(--t1)', lineHeight: 1.1, letterSpacing: '-0.025em', margin: '0 0 14px' }}>
                {block.formTitle || block.title || 'Fale com a gente'}
              </Heading>
              {(block.formDescription || block.subtitle) && (
                <p style={{ fontSize: 16, color: isDark ? 'rgba(255,255,255,.6)' : 'var(--t3)', lineHeight: 1.6, margin: '0 0 24px' }}>
                  {block.formDescription || block.subtitle}
                </p>
              )}
              {benefits.length > 0 && (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {benefits.map((b, i) => (
                    <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 14, color: isDark ? 'rgba(255,255,255,.75)' : 'var(--t2)' }}>
                      <Check size={18} style={{ color: t.from, flexShrink: 0, marginTop: 2 }} strokeWidth={2.5} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div style={{ padding: 32, background: isDark ? 'rgba(255,255,255,.03)' : 'var(--s1)', border: `1px solid ${isDark ? 'rgba(255,255,255,.08)' : 'var(--b1)'}`, borderRadius: 20 }}>
              {formContent}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// Helper para render de heading dinâmico (h1/h2/h3)
function Heading({ as: Tag = 'h2', children, style }: { as?: 'h1' | 'h2' | 'h3'; children: React.ReactNode; style?: React.CSSProperties }) {
  return React.createElement(Tag, { style }, children);
}

// ── TABS ──────────────────────────────────────────────────────────────────────
function TabsBlock({ block, t, headingAs }: { block: PageBlock; t: typeof DEFAULT_T; headingAs: 'h1' | 'h2' | 'h3' }) {
  const tabs = block.tabsItems || [];
  const [active, setActive] = useState(0);
  const isDark = block.colorTheme === 'dark';
  const orientation = block.tabsOrientation || 'horizontal';
  const current = tabs[active];

  if (!current) return null;

  return (
    <section style={getBlockStyles(block, t).section} className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <SectionHead title={block.title} subtitle={block.subtitle} t={t} dark={isDark} as={headingAs} block={block} />

        <div style={{ display: 'flex', flexDirection: orientation === 'vertical' ? 'row' : 'column', gap: orientation === 'vertical' ? 32 : 24 }} className="tabs-block">
          {/* Tab buttons */}
          <div style={{
            display: 'flex',
            flexDirection: orientation === 'vertical' ? 'column' : 'row',
            gap: 4,
            flexShrink: 0,
            minWidth: orientation === 'vertical' ? 220 : undefined,
            background: isDark ? 'rgba(255,255,255,.04)' : 'var(--s2)',
            padding: 6,
            borderRadius: orientation === 'vertical' ? 14 : 999,
            overflowX: orientation === 'horizontal' ? 'auto' : undefined,
            alignSelf: orientation === 'horizontal' ? 'center' : 'flex-start',
          }}>
            {tabs.map((tab, i) => {
              const isActive = i === active;
              return (
                <button key={i} onClick={() => setActive(i)} role="tab" aria-selected={isActive}
                  style={{
                    padding: orientation === 'vertical' ? '12px 16px' : '10px 18px',
                    borderRadius: orientation === 'vertical' ? 10 : 999,
                    background: isActive ? (isDark ? '#fff' : t.from) : 'transparent',
                    color: isActive ? (isDark ? '#1d1d1f' : '#fff') : (isDark ? 'rgba(255,255,255,.7)' : 'var(--t2)'),
                    border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
                    textAlign: orientation === 'vertical' ? 'left' : 'center',
                    justifyContent: orientation === 'vertical' ? 'flex-start' : 'center',
                    transition: 'all .2s',
                  }}>
                  {tab.icon && <span style={{ fontSize: 16 }}>{tab.icon}</span>}
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab panel */}
          <div role="tabpanel" style={{
            flex: 1,
            padding: orientation === 'vertical' ? 0 : '8px 0',
            display: 'grid',
            gridTemplateColumns: current.imageUrl ? '1fr 1fr' : '1fr',
            gap: 32, alignItems: 'center',
          }} className="tabs-panel">
            <div>
              {current.title && <h3 style={{ fontFamily: "var(--font-heading,'Outfit'),sans-serif", fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', fontWeight: 800, color: isDark ? '#fff' : 'var(--t1)', margin: '0 0 12px', letterSpacing: '-0.02em' }}>{current.title}</h3>}
              {current.description && <p style={{ fontSize: 15, color: isDark ? 'rgba(255,255,255,.7)' : 'var(--t2)', lineHeight: 1.7, margin: '0 0 20px' }}>{current.description}</p>}
              {current.bullets && current.bullets.length > 0 && (
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {current.bullets.map((b, i) => (
                    <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14, color: isDark ? 'rgba(255,255,255,.75)' : 'var(--t2)' }}>
                      <Check size={16} style={{ color: t.from, flexShrink: 0, marginTop: 2 }} strokeWidth={2.5} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
              {current.ctaLabel && (
                <Link to={current.ctaLink || '#'}>
                  <button style={{ padding: '11px 22px', borderRadius: 12, background: t.from, color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: `0 6px 20px ${t.glow}` }}>
                    {current.ctaLabel} <ArrowRight size={15} />
                  </button>
                </Link>
              )}
            </div>
            {current.imageUrl && (
              <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,.15)' }}>
                <img src={resolveImg(current.imageUrl) ?? current.imageUrl} alt={current.title || ''} style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
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
        <SectionHead title={block.title} t={t} dark={isDark} block={block} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(block.faq || []).map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={i} style={{
                borderRadius: 16,
                border: `1.5px solid ${isOpen ? t.from + '50' : isDark ? 'rgba(255,255,255,.08)' : 'var(--b1)'}`,
                background: isOpen ? (isDark ? 'rgba(255,255,255,.04)' : `${t.from}0a`) : (isDark ? 'rgba(255,255,255,.02)' : 'var(--s1)'),
                transition: 'border-color .2s, background .2s',
                overflow: 'hidden',
              }}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', gap: 16, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                >
                  <span style={{ fontFamily: "var(--font-heading,'Outfit'), sans-serif", fontWeight: 700, fontSize: 15, color: isDark ? '#fff' : 'var(--t1)', lineHeight: 1.4 }}>{faq.question}</span>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: isOpen ? t.from : (isDark ? 'rgba(255,255,255,.08)' : 'var(--s2)'),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background .2s, transform .3s',
                    transform: isOpen ? 'rotate(180deg)' : 'none',
                  }}>
                    <ChevronDown style={{ width: 16, height: 16, color: isOpen ? '#fff' : (isDark ? 'rgba(255,255,255,.5)' : 'var(--t3)') }} />
                  </div>
                </button>
                <div style={{
                  maxHeight: isOpen ? 400 : 0, overflow: 'hidden',
                  transition: 'max-height .35s cubic-bezier(.4,0,.2,1)',
                }}>
                  <p style={{ padding: '0 24px 20px', fontSize: 14.5, color: isDark ? 'rgba(255,255,255,.6)' : 'var(--t3)', lineHeight: 1.75 }}>{faq.answer}</p>
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
            <SectionHead title={block.title} subtitle={block.subtitle} t={t} dark={block.colorTheme === 'dark'} center={false} block={block} />
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
                      background: block.colorTheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'var(--s1)',
                      border: `1px solid ${block.colorTheme === 'dark' ? 'rgba(255,255,255,.06)' : 'var(--b1)'}`,
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
                        <p style={{ fontWeight: isObj && item.bold ? 700 : 600, color: block.colorTheme === 'dark' ? '#fff' : 'var(--t1)', fontSize: fs, marginBottom: (isObj && item.desc) ? 3 : 0, fontFamily: "var(--font-heading,'Outfit'),sans-serif" }}>
                          {isObj ? item.label : item}
                        </p>
                        {isObj && item.desc && <p style={{ color: block.colorTheme === 'dark' ? 'rgba(255,255,255,0.45)' : 'var(--t4)', fontSize: ds, lineHeight: 1.55 }}>{item.desc}</p>}
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
export function BlockRenderer({ block, t = DEFAULT_T, isFirstBlock = false }: {
  block: PageBlock;
  t?: typeof DEFAULT_T;
  /** Quando true, o título principal usa <h1> (SEO/A11Y — só o primeiro bloco da página).
   *  Implementação: passa via prop pra renderBlockInner que repassa pro SectionHead. */
  isFirstBlock?: boolean;
}) {
  // Resolve a tag do título principal: h1 só pra primeiro bloco da página
  const headingAs: 'h1' | 'h2' = isFirstBlock ? 'h1' : 'h2';
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
  const textCol = (isDark || isBrand) ? 'white' : 'var(--t1)';
  const subCol = (isDark || isBrand) ? 'rgba(255,255,255,.6)' : '#6e6e73';
  const inner = renderBlockInner({ block, t, textCol, subCol, videoOpen, setVideoOpen, headingAs });

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
function renderBlockInner({ block, t, textCol, subCol, videoOpen, setVideoOpen, headingAs = 'h2' }: {
  block: PageBlock; t: typeof DEFAULT_T; textCol: string; subCol: string;
  videoOpen: boolean; setVideoOpen: (v: boolean) => void;
  headingAs?: 'h1' | 'h2' | 'h3';
}): React.ReactNode {
  switch (block.type) {

    // ── HERO ─────────────────────────────────────────────────────────────────
    case 'hero': {
      const hasHeroContent = !!(block.title?.trim() || block.description?.trim() || block.imageUrl);
      if (!hasHeroContent) {
        return (
          <div style={{ position: 'relative', width: '100%', minHeight: 320, background: `linear-gradient(135deg, #0d0d10 0%, ${t.from}40 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
            <div style={{ border: `2px dashed ${t.from}80`, borderRadius: 12, padding: '24px 40px', textAlign: 'center' }}>
              <p style={{ color: t.from, fontFamily: "var(--font-heading,'Outfit'),sans-serif", fontSize: 18, fontWeight: 700, margin: 0 }}>Bloco Hero</p>
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
            <div className="split-dark-block" style={{ background: '#13141b', borderRadius: rr, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 1.6fr', boxShadow: '0 32px 80px rgba(0,0,0,.25)' }}>
              <div className="split-dark-left" style={{ padding: '56px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,.06)', background: 'linear-gradient(160deg,#16171f,#0f1015)' }}>
                {label && <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.14em', color: ac, marginBottom: 16, textTransform: 'uppercase' }}>{label}</p>}
                <h2 style={{ fontFamily: "var(--font-heading,'Outfit'),sans-serif", fontSize: 'clamp(1.6rem,2.5vw,2.2rem)', fontWeight: 900, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.025em', marginBottom: mainSub ? 18 : 0 }}>{mainTitle}</h2>
                {mainSub && <p style={{ fontSize: 14, color: 'rgba(255,255,255,.45)', lineHeight: 1.7 }}>{mainSub}</p>}
                <div style={{ marginTop: 32, width: 48, height: 3, borderRadius: 99, background: `linear-gradient(90deg,${ac},${ac}40)` }} />
              </div>
              <div className="split-dark-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 1, background: 'rgba(255,255,255,.04)' }}>
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
                        <p style={{ fontFamily: "var(--font-heading,'Outfit'),sans-serif", fontWeight: 700, fontSize: 14, color: '#fff', lineHeight: 1.35 }}>{lbl}</p>
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
          <section style={{ padding: sectionPad(block) }} className="px-4 sm:px-6 lg:px-8" >
            <div style={{ maxWidth: containerMaxW(block), margin: '0 auto', background: '#0f1015', borderRadius: rr, padding: '56px 48px', boxShadow: '0 24px 60px rgba(0,0,0,.2)' }}>
              <SectionHead label={label} title={mainTitle} subtitle={mainSub} t={{ ...t, from: ac }} dark block={block} />
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
                      <p style={{ fontFamily: "var(--font-heading,'Outfit'),sans-serif", fontWeight: 700, fontSize: 14, color: '#fff', lineHeight: 1.35, marginBottom: dsc ? 6 : 0 }}>{lbl}</p>
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
                <div style={{ flex: 1, background: 'var(--s1)', padding: '48px 40px 24px' }} />
                <div style={{ flex: 1, background: '#0f1017', padding: '48px 40px 24px' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 40, pointerEvents: 'none' }}>
                  <div style={{ textAlign: 'center', maxWidth: 640, padding: '0 20px' }}>
                    {label && <div style={{ display: 'inline-block', background: '#0f1017', color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', padding: '5px 14px', borderRadius: 8, marginBottom: 16 }}>{label}</div>}
                    {mainTitle && <h2 style={{ fontFamily: "var(--font-heading,'Outfit'),sans-serif", fontSize: 'clamp(1.5rem,2.8vw,2.3rem)', fontWeight: 800, color: '#0f1017', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: mainSub ? 12 : 0 }}>{mainTitle}</h2>}
                    {mainSub && <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>{mainSub}</p>}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex' }}>
                <div style={{ flex: 1, background: 'var(--s1)', padding: '16px 40px 48px', display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                  {leftItems.map((item, i) => {
                    const lbl = typeof item === 'string' ? item : item.label;
                    const ico = typeof item === 'string' ? '' : item.icon;
                    const dsc = typeof item === 'string' ? '' : (item.desc || '');
                    return (
                      <div key={i} style={{ background: 'var(--s1)', border: '1px solid var(--b1)', borderRadius: 16, padding: '20px', display: 'flex', gap: 14, alignItems: 'flex-start', transition: 'border-color .2s, transform .2s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${ac}50`; (e.currentTarget as HTMLElement).style.transform = 'translateX(4px)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--b1)'; (e.currentTarget as HTMLElement).style.transform = ''; }}>
                        {ico && <div style={{ width: 40, height: 40, borderRadius: 12, background: `${ac}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{ico}</div>}
                        <div>
                          <p style={{ fontFamily: "var(--font-heading,'Outfit'),sans-serif", fontWeight: 700, fontSize: 14, color: '#1a1a1a', lineHeight: 1.3 }}>{lbl}</p>
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
                          <p style={{ fontFamily: "var(--font-heading,'Outfit'),sans-serif", fontWeight: 700, fontSize: 14, color: '#fff', lineHeight: 1.3 }}>{lbl}</p>
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
          <section style={{ padding: sectionPad(block) }} className="px-4 sm:px-6 lg:px-8">
            <div style={{ maxWidth: containerMaxW(block), margin: '0 auto' }}>
            <SectionHead label={label} title={mainTitle} subtitle={mainSub} t={{ ...t, from: ac }} block={block} />
            <div style={{ display: 'grid', gridTemplateColumns: block.gridColumns ? `repeat(${block.gridColumns},1fr)` : 'repeat(auto-fill,minmax(300px,1fr))', gap: 10 }}>
              {allItems.map((item, i) => {
                const lbl = typeof item === 'string' ? item : item.label;
                const dsc = typeof item === 'string' ? '' : (item.desc || '');
                return (
                  <div key={i} style={{ display: 'flex', gap: 14, padding: '18px', background: 'var(--s1)', border: '1px solid var(--b1)', borderRadius: 14, alignItems: 'flex-start', transition: 'border-color .2s, box-shadow .2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${ac}50`; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${ac}12`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--b1)'; (e.currentTarget as HTMLElement).style.boxShadow = ''; }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg,${ac},${ac}bb)`, color: '#fff', fontWeight: 800, fontSize: 13, fontFamily: "var(--font-heading,'Outfit'),sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div style={{ paddingTop: 2 }}>
                      <p style={{ fontFamily: "var(--font-heading,'Outfit'),sans-serif", fontWeight: 700, fontSize: 14, color: '#1a1a1a', lineHeight: 1.3 }}>{lbl}</p>
                      {dsc && <p style={{ fontSize: 12, color: '#888', marginTop: 4, lineHeight: 1.5 }}>{dsc}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
            </div>
          </section>
        );
      }

      if (layout === 'checklist') {
        return (
          <section style={{ padding: sectionPad(block) }} className="px-4 sm:px-6 lg:px-8">
            <div style={{ maxWidth: containerMaxW(block), margin: '0 auto' }}>
            <SectionHead label={label} title={mainTitle} subtitle={mainSub} t={{ ...t, from: ac }} block={block} />
            <div style={{ display: 'grid', gridTemplateColumns: block.gridColumns ? `repeat(${block.gridColumns},1fr)` : 'repeat(auto-fill,minmax(260px,1fr))', gap: 8, maxWidth: block.gridColumns ? 'none' : 860, margin: '0 auto' }}>
              {allItems.map((item, i) => {
                const lbl = typeof item === 'string' ? item : item.label;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', background: 'var(--s1)', border: '1px solid var(--b1)', borderRadius: 50, transition: 'all .2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${ac}50`; (e.currentTarget as HTMLElement).style.background = `${ac}06`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--b1)'; (e.currentTarget as HTMLElement).style.background = '#fff'; }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: `linear-gradient(135deg,${ac},${ac}bb)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check style={{ width: 11, height: 11, color: '#fff', strokeWidth: 3 }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', fontFamily: "var(--font-heading,'Outfit'),sans-serif" }}>{lbl}</span>
                  </div>
                );
              })}
            </div>
            </div>
          </section>
        );
      }

      // ── dark_numbered ─────────────────────────────────────────────────────────
      if (layout === 'dark_numbered') {
        return (
          <section style={{ padding: sectionPad(block), background: block.bgColor || '#080a0f' }} className="px-4 sm:px-6 lg:px-8">
            <div style={{ maxWidth: containerMaxW(block), margin: '0 auto' }}>
              <SectionHead label={label} title={mainTitle} subtitle={mainSub} t={{ ...t, from: ac }} dark block={block} />
              <div style={{ display: 'grid', gridTemplateColumns: block.gridColumns ? `repeat(${block.gridColumns},1fr)` : 'repeat(auto-fill,minmax(260px,1fr))', gap: 1, border: '1px solid rgba(255,255,255,.06)', borderRadius: rr, overflow: 'hidden' }}>
                {allItems.map((item, i) => {
                  const lbl = typeof item === 'string' ? item : item.label;
                  const ico = typeof item === 'string' ? '' : item.icon;
                  const dsc = typeof item === 'string' ? '' : (item.desc || '');
                  return (
                    <div key={i} style={{ padding: '36px 28px', background: 'rgba(255,255,255,.015)', borderRight: '1px solid rgba(255,255,255,.06)', borderBottom: '1px solid rgba(255,255,255,.06)', transition: 'background .2s', cursor: 'default' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.04)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.015)'; }}>
                      <div style={{ fontFamily: "var(--font-heading,'Outfit'),sans-serif", fontSize: 'clamp(3rem,5vw,4.5rem)', fontWeight: 900, lineHeight: 1, background: `linear-gradient(135deg,${ac}80,${ac}20)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 20, letterSpacing: '-0.04em' }}>
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      {ico && <div style={{ fontSize: 20, marginBottom: 10, opacity: .7 }}>{ico}</div>}
                      <p style={{ fontFamily: "var(--font-heading,'Outfit'),sans-serif", fontWeight: 700, fontSize: 16, color: '#fff', lineHeight: 1.35, marginBottom: dsc ? 8 : 0 }}>{lbl}</p>
                      {dsc && <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.42)', lineHeight: 1.65 }}>{dsc}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      }

      // ── bento ─────────────────────────────────────────────────────────────────
      if (layout === 'bento') {
        return (
          <section style={{ padding: sectionPad(block), background: block.bgColor || '#080a0f' }} className="px-4 sm:px-6 lg:px-8">
            <div style={{ maxWidth: containerMaxW(block), margin: '0 auto' }}>
              <SectionHead label={label} title={mainTitle} subtitle={mainSub} t={{ ...t, from: ac }} dark block={block} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {allItems.map((item, i) => {
                  const lbl = typeof item === 'string' ? item : item.label;
                  const ico = typeof item === 'string' ? '' : item.icon;
                  const dsc = typeof item === 'string' ? '' : (item.desc || '');
                  const isFeatured = i === 0;
                  return (
                    <div key={i} style={{
                      gridColumn: isFeatured ? 'span 2' : 'span 1',
                      padding: isFeatured ? '48px 40px' : '32px 28px',
                      background: isFeatured ? `linear-gradient(135deg,${ac}20,${ac}06)` : 'rgba(255,255,255,.025)',
                      border: `1px solid ${isFeatured ? ac + '40' : 'rgba(255,255,255,.07)'}`,
                      borderRadius: rr, position: 'relative', overflow: 'hidden',
                      transition: 'border-color .2s, transform .25s', cursor: 'default',
                    }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${ac}60`; (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = isFeatured ? `${ac}40` : 'rgba(255,255,255,.07)'; (e.currentTarget as HTMLElement).style.transform = ''; }}>
                      {isFeatured && <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: `${ac}18`, filter: 'blur(50px)', pointerEvents: 'none' }} />}
                      <div style={{ position: 'relative' }}>
                        {ico && (
                          <div style={{ fontSize: isFeatured ? 28 : 22, marginBottom: 14, width: isFeatured ? 56 : 44, height: isFeatured ? 56 : 44, borderRadius: 14, background: `${ac}18`, border: `1px solid ${ac}28`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{ico}</div>
                        )}
                        <p style={{ fontFamily: "var(--font-heading,'Outfit'),sans-serif", fontWeight: 800, fontSize: isFeatured ? 'clamp(1.3rem,2.2vw,1.75rem)' : 15, color: '#fff', lineHeight: 1.25, marginBottom: dsc ? 10 : 0 }}>{lbl}</p>
                        {dsc && <p style={{ fontSize: isFeatured ? 14.5 : 13, color: 'rgba(255,255,255,.48)', lineHeight: 1.65, marginTop: 8 }}>{dsc}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      }

      // ── minimal_pills ─────────────────────────────────────────────────────────
      if (layout === 'minimal_pills') {
        return (
          <section style={{ padding: sectionPad(block), background: block.bgColor || 'var(--s0)' }} className="px-4 sm:px-6 lg:px-8">
            <div style={{ maxWidth: containerMaxW(block), margin: '0 auto' }}>
              <SectionHead label={label} title={mainTitle} subtitle={mainSub} t={{ ...t, from: ac }} block={block} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: block.titleAlign === 'left' ? 'flex-start' : 'center' }}>
                {allItems.map((item, i) => {
                  const lbl = typeof item === 'string' ? item : item.label;
                  const ico = typeof item === 'string' ? '' : item.icon;
                  return (
                    <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 999, border: '1.5px solid var(--b1)', background: 'var(--s1)', fontSize: 14, fontWeight: 600, color: 'var(--t1)', transition: 'all .2s', cursor: 'default', boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}
                      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = `${ac}60`; el.style.color = ac; el.style.background = `${ac}08`; }}
                      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--b1)'; el.style.color = 'var(--t1)'; el.style.background = 'var(--s1)'; }}>
                      {ico && <span style={{ fontSize: 16 }}>{ico}</span>}
                      <span>{lbl}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      }

      // ── grid ─────────────────────────────────────────────────────────────────
      if (layout === 'grid') {
        const isDark = block.colorTheme === 'dark';
        return (
          <section style={{ padding: sectionPad(block), background: block.bgColor || (isDark ? '#0f172a' : 'var(--s0)') }} className="px-4 sm:px-6 lg:px-8">
            <div style={{ maxWidth: containerMaxW(block), margin: '0 auto' }}>
              <SectionHead label={label} title={mainTitle} subtitle={mainSub} t={{ ...t, from: ac }} dark={isDark} block={block} />
              <div style={{ display: 'grid', gridTemplateColumns: block.gridColumns ? `repeat(${block.gridColumns},1fr)` : 'repeat(auto-fill,minmax(180px,1fr))', gap: 24 }}>
                {allItems.map((item, i) => {
                  const lbl = typeof item === 'string' ? item : item.label;
                  const ico = typeof item === 'string' ? '' : item.icon;
                  const dsc = typeof item === 'string' ? '' : (item.desc || '');
                  return (
                    <div key={i} style={{ textAlign: 'center', padding: '28px 16px', borderRadius: rr, background: isDark ? 'rgba(255,255,255,.04)' : 'var(--s1)', border: `1px solid ${isDark ? 'rgba(255,255,255,.07)' : 'var(--b1)'}`, transition: 'border-color .2s, transform .25s', cursor: 'default' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${ac}50`; (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = isDark ? 'rgba(255,255,255,.07)' : 'var(--b1)'; (e.currentTarget as HTMLElement).style.transform = ''; }}>
                      {ico && (
                        <div style={{ fontSize: 28, width: 56, height: 56, borderRadius: 16, background: `${ac}14`, border: `1px solid ${ac}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>{ico}</div>
                      )}
                      <p style={{ fontFamily: "var(--font-heading,'Outfit'),sans-serif", fontWeight: 700, fontSize: 15, color: isDark ? '#fff' : 'var(--t1)', marginBottom: dsc ? 8 : 0, lineHeight: 1.3 }}>{lbl}</p>
                      {dsc && <p style={{ fontSize: 13, color: isDark ? 'rgba(255,255,255,.45)' : 'var(--t3)', lineHeight: 1.6 }}>{dsc}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      }

      // default: cards_hover
      return (
        <section style={{ padding: sectionPad(block) }} className="px-4 sm:px-6 lg:px-8">
          <div style={{ maxWidth: containerMaxW(block), margin: '0 auto' }}>
          <SectionHead label={label} title={mainTitle} subtitle={mainSub} t={{ ...t, from: ac }} block={block} />
          <div style={{ display: 'grid', gridTemplateColumns: block.gridColumns ? `repeat(${block.gridColumns},1fr)` : 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
            {allItems.map((item, i) => {
              const lbl = typeof item === 'string' ? item : item.label;
              const ico = typeof item === 'string' ? '' : item.icon;
              const dsc = typeof item === 'string' ? '' : (item.desc || '');
              return (
                <div key={i} style={{ padding: '28px 22px', background: 'var(--s1)', border: '1px solid var(--b1)', borderRadius: 20, cursor: 'default', transition: 'all .25s', boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)'; (e.currentTarget as HTMLElement).style.borderColor = `${ac}40`; (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 48px ${ac}18`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.borderColor = 'var(--b1)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,.04)'; }}>
                  {ico && <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg,${ac}20,${ac}10)`, border: `1px solid ${ac}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 16 }}>{ico}</div>}
                  <p style={{ fontFamily: "var(--font-heading,'Outfit'),sans-serif", fontWeight: 700, fontSize: 15, color: '#1a1a1a', lineHeight: 1.35, marginBottom: dsc ? 8 : 0 }}>{lbl}</p>
                  {dsc && <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6 }}>{dsc}</p>}
                </div>
              );
            })}
          </div>
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
          <div className="image-text-block" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', borderRadius: rr, overflow: 'hidden', maxHeight: maxH, border: '1px solid var(--b1)', boxShadow: '0 16px 48px rgba(0,0,0,.08)' }}>
            {!imgRight && (
              <div style={{ background: hasBg ? bgColor : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', order: 0 }}>
                {imgSrc ? <img src={imgSrc} alt={block.imageAlt || ''} style={{ width: '100%', height: '100%', maxHeight: maxH, objectFit: contain ? 'contain' : 'cover', display: 'block', transition: 'transform .4s' }} onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')} onMouseLeave={e => (e.currentTarget.style.transform = '')} />
                  : <div style={{ width: '100%', height: maxH, background: hasBg ? bgColor : 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 80 }}>🖼️</span></div>}
              </div>
            )}
            <div className="image-text-content" style={{ padding: '52px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--s1)', order: imgRight ? 0 : 1 }}>
              {block.badge && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 50, border: `1.5px solid ${t.from}40`, color: t.from, fontSize: 12, fontWeight: 700, marginBottom: 20, alignSelf: 'flex-start', background: `${t.from}08` }}>
                  {block.badge} <ArrowRight style={{ width: 12, height: 12 }} />
                </div>
              )}
              {block.title && <h2 style={{ fontFamily: "var(--font-heading,'Outfit'),sans-serif", fontSize: block.titleSize || TITLE_SIZE_MAP[block.titleSizePreset || 'xl'], fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em', color: block.titleColor || '#0f172a', marginBottom: 16, textAlign: (block.titleAlign || 'left') as React.CSSProperties['textAlign'] }}>{block.title}</h2>}
              {block.description && <p style={{ fontSize: block.subtitleSize || SUBTITLE_SIZE_MAP[block.subtitleSizePreset || 'md'], lineHeight: 1.7, color: block.subtitleColor || '#475569', marginBottom: (block.items && block.items.length > 0) ? 24 : 0 }}>{block.description}</p>}
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
                  {block.ctaLabel && renderCtaButton(block, t, block.ctaLabel, block.ctaLink || '/cliente')}
                  {block.secondaryLabel && renderCtaButton({ ...block, ctaStyle: block.ctaStyle === 'filled' ? 'outlined' : (block.ctaStyle || 'outlined') }, t, block.secondaryLabel, block.secondaryLink || '/')}
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
        <section style={{ padding: sectionPad(block) }} className="px-4 sm:px-6 lg:px-8">
          <div style={{ maxWidth: containerMaxW(block), margin: '0 auto' }}>
          <SectionHead title={block.title} subtitle={block.subtitle} t={t} dark={block.colorTheme === 'dark'} as={headingAs} block={block} />
          <div ref={ref} style={{ maxWidth: 680, margin: '0 auto', position: 'relative' }}>
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
                    color: '#fff', fontFamily: "var(--font-heading,'Outfit'),sans-serif", fontWeight: 900, fontSize: 17,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 8px 24px ${t.glow}`, border: '3px solid #fff',
                  }}>{step.number || String(i + 1).padStart(2, '0')}</div>
                </div>
                <div style={{
                  flex: 1, padding: '14px 20px', borderRadius: 16,
                  background: block.colorTheme === 'dark' ? 'rgba(255,255,255,.04)' : 'var(--s1)',
                  border: `1px solid ${block.colorTheme === 'dark' ? 'rgba(255,255,255,.07)' : 'var(--b1)'}`,
                  boxShadow: '0 2px 12px rgba(0,0,0,.05)',
                  transition: 'border-color .2s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${t.from}40`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = block.colorTheme === 'dark' ? 'rgba(255,255,255,.07)' : 'var(--b1)'; }}>
                  <h3 style={{ fontFamily: "var(--font-heading,'Outfit'),sans-serif", fontWeight: 800, fontSize: 16, color: block.colorTheme === 'dark' ? '#fff' : '#0f172a', marginBottom: step.description ? 6 : 0 }}>{step.title}</h3>
                  {step.description && <p style={{ fontSize: 14, color: block.colorTheme === 'dark' ? 'rgba(255,255,255,.55)' : 'var(--t3)', lineHeight: 1.65 }}>{step.description}</p>}
                </div>
              </div>
            ))}
          </div>
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
        <section style={{ background: block.bgColor || (block.colorTheme === 'dark' ? '#0f172a' : 'var(--s0)'), borderTop: '1px solid var(--b1)', borderBottom: '1px solid var(--b1)' }}>
          <div ref={ref} style={{ maxWidth: containerMaxW(block), margin: '0 auto', padding: '56px 24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${block.gridColumns || Math.min(stats.length, 4)}, 1fr)`, gap: 0 }}>
              {stats.map((s, i) => (
                <div key={i} style={{
                  textAlign: 'center', padding: '24px 32px',
                  borderRight: i < stats.length - 1 ? `1px solid ${block.colorTheme === 'dark' ? 'rgba(255,255,255,.08)' : 'var(--b1)'}` : 'none',
                  opacity: v ? 1 : 0, transform: v ? 'translateY(0)' : 'translateY(20px)',
                  transition: `opacity .55s ease ${i * 0.1}s, transform .55s ease ${i * 0.1}s`,
                }}>
                  <p style={{ fontFamily: "var(--font-heading,'Outfit'),sans-serif", fontWeight: 900, fontSize: 'clamp(2rem,4vw,3rem)', lineHeight: 1, marginBottom: 8, background: `linear-gradient(135deg,${t.from},${t.to})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</p>
                  <p style={{ fontSize: 14, color: block.colorTheme === 'dark' ? 'rgba(255,255,255,.5)' : 'var(--t3)', fontWeight: 500, letterSpacing: '.01em' }}>{s.label}</p>
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
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: `linear-gradient(135deg,${t.from},${t.to})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: "var(--font-heading,'Outfit'),sans-serif", fontWeight: 800, fontSize: 16, color: '#fff' }}>{initials}</div>
                <div style={{ textAlign: 'left' }}>
                  {block.author && <p style={{ color: '#fff', fontFamily: "var(--font-heading,'Outfit'),sans-serif", fontWeight: 700, fontSize: 15 }}>{block.author}</p>}
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
            {block.title && <SectionHead title={block.title} t={t} dark block={block} />}
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
      const ctaStyle = block.ctaLayout || 'pill';
      const ac = block.ctaBgColor || t.from;
      const titleFs = block.titleSize || TITLE_SIZE_MAP[block.titleSizePreset || 'lg'];
      const subFs = block.subtitleSize || SUBTITLE_SIZE_MAP[block.subtitleSizePreset || 'md'];

      // ── 1. PILL — fundo colorido vibrante + card pílula escuro flutuante ───
      if (ctaStyle === 'pill') {
        const noOuterBg = block.bgColor === 'transparent' || block.bgColor === 'none';
        const sectionBg = noOuterBg ? 'transparent' : (block.bgColor || `linear-gradient(135deg,${ac} 0%,${t.to || ac} 100%)`);
        return (
          <section style={{ background: sectionBg, padding: sectionPad(block), position: 'relative', overflow: 'hidden' }} className="px-4 sm:px-6 lg:px-8">
            {/* decorative circles — só quando há fundo */}
            {!noOuterBg && <div style={{ position: 'absolute', right: '-4%', top: '50%', transform: 'translateY(-50%)', width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,.08)', pointerEvents: 'none' }} />}
            {!noOuterBg && <div style={{ position: 'absolute', left: '-2%', bottom: '-40%', width: 220, height: 220, borderRadius: '50%', background: 'rgba(0,0,0,.08)', pointerEvents: 'none' }} />}
            <div style={{ maxWidth: containerMaxW(block), margin: '0 auto', position: 'relative' }}>
              <div style={{ background: block.ctaCardBg || 'rgba(15,17,30,.82)', backdropFilter: 'blur(20px)', borderRadius: 999, border: '1px solid rgba(255,255,255,.1)', padding: 'clamp(18px,2.5vw,28px) clamp(24px,3vw,40px)', display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap', boxShadow: '0 24px 60px rgba(0,0,0,.35)' }}>
                {/* Title col */}
                <div style={{ flex: '0 0 auto', paddingRight: 28, borderRight: '1px solid rgba(255,255,255,.1)', marginRight: 28 }}>
                  {block.badge && <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.1em', color: ac, textTransform: 'uppercase', marginBottom: 6 }}>{block.badge}</p>}
                  {block.title && <h2 style={{ fontFamily: "var(--font-heading,'Outfit'),sans-serif", fontWeight: 900, fontSize: 'clamp(1.1rem,2vw,1.5rem)', color: block.titleColor || '#fff', lineHeight: 1.2, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>{block.title}</h2>}
                </div>
                {/* Description col */}
                {block.description && (
                  <div style={{ flex: 1, minWidth: 160, paddingRight: 28, borderRight: '1px solid rgba(255,255,255,.1)', marginRight: 28 }}>
                    <p style={{ fontSize: subFs, color: block.subtitleColor || 'rgba(255,255,255,.6)', lineHeight: 1.55 }}>{block.description}</p>
                  </div>
                )}
                {/* Buttons col */}
                <div style={{ display: 'flex', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>
                  {block.ctaLabel && (
                    <a href={block.ctaLink || '/cliente'} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px', borderRadius: 999, background: block.ctaBtnBg || ac, color: block.ctaBtnText || '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none', whiteSpace: 'nowrap', transition: 'transform .2s, box-shadow .2s', boxShadow: `0 6px 20px ${ac}60` }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}>
                      {block.ctaLabel}
                    </a>
                  )}
                  {block.secondaryLabel && (
                    <a href={block.secondaryLink || '/'} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px', borderRadius: 999, background: 'rgba(255,255,255,.12)', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none', whiteSpace: 'nowrap', border: '1px solid rgba(255,255,255,.18)', transition: 'background .2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.2)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.12)'; }}>
                      {block.secondaryLabel}
                    </a>
                  )}
                </div>
              </div>
              {block.socialProof && <p style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: 'rgba(255,255,255,.55)', fontWeight: 500 }}>{block.socialProof}</p>}
            </div>
          </section>
        );
      }

      // ── 2. BANNER — faixa full-width, fundo sólido vibrante, 3 colunas ────
      if (ctaStyle === 'banner') {
        return (
          <section style={{ background: block.bgColor || ac, padding: 0, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%,rgba(255,255,255,.1) 0%,transparent 50%),radial-gradient(circle at 80% 50%,rgba(0,0,0,.12) 0%,transparent 50%)', pointerEvents: 'none' }} />
            <div style={{ maxWidth: containerMaxW(block), margin: '0 auto', padding: 'clamp(28px,4vw,44px) clamp(24px,4vw,48px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 28, flexWrap: 'wrap', position: 'relative' }}>
              <div style={{ flex: '1 1 200px' }}>
                {block.badge && <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 999, fontSize: 10, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', background: 'rgba(0,0,0,.2)', color: '#fff', marginBottom: 8 }}>{block.badge}</span>}
                {block.title && <h2 style={{ fontFamily: "var(--font-heading,'Outfit'),sans-serif", fontWeight: 900, fontSize: titleFs, color: block.titleColor || '#fff', lineHeight: 1.1, letterSpacing: '-0.025em' }}>{block.title}</h2>}
              </div>
              {block.description && (
                <div style={{ flex: '2 1 260px', borderLeft: '1px solid rgba(255,255,255,.25)', borderRight: '1px solid rgba(255,255,255,.25)', padding: '0 clamp(20px,3vw,40px)' }}>
                  <p style={{ fontSize: subFs, color: block.subtitleColor || 'rgba(255,255,255,.85)', lineHeight: 1.6 }}>{block.description}</p>
                </div>
              )}
              <div style={{ flex: '0 0 auto', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                {block.ctaLabel && (
                  <a href={block.ctaLink || '/cliente'} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', borderRadius: 999, background: block.ctaBtnBg || '#fff', color: block.ctaBtnText || ac, fontWeight: 800, fontSize: 14, textDecoration: 'none', boxShadow: '0 4px 20px rgba(0,0,0,.2)', transition: 'transform .2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}>
                    {block.ctaLabel}
                  </a>
                )}
                {block.secondaryLabel && (
                  <a href={block.secondaryLink || '/'} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 22px', borderRadius: 999, background: 'transparent', color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none', border: '2px solid rgba(255,255,255,.5)', transition: 'border-color .2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#fff'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.5)'; }}>
                    {block.secondaryLabel}
                  </a>
                )}
              </div>
            </div>
            {block.socialProof && <p style={{ textAlign: 'center', paddingBottom: 14, fontSize: 12, color: 'rgba(255,255,255,.5)', fontWeight: 500 }}>{block.socialProof}</p>}
          </section>
        );
      }

      // ── 3. SPOTLIGHT — escuro com cone de luz do topo, dramático ──────────
      if (ctaStyle === 'spotlight') {
        return (
          <section style={{ background: block.bgColor || '#07080e', padding: sectionPad(block), position: 'relative', overflow: 'hidden' }} className="px-4 sm:px-6 lg:px-8">
            {/* Spotlight cone */}
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '320px solid transparent', borderRight: '320px solid transparent', borderTop: `280px solid ${ac}22`, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, background: `radial-gradient(ellipse at 50% 0%,${ac}30 0%,transparent 70%)`, pointerEvents: 'none' }} />
            {/* Bottom glow line */}
            <div style={{ position: 'absolute', bottom: 0, left: '15%', right: '15%', height: 1, background: `linear-gradient(90deg,transparent,${ac}50,transparent)`, pointerEvents: 'none' }} />
            <div style={{ position: 'relative', maxWidth: containerMaxW(block), margin: '0 auto', textAlign: 'center' }}>
              {block.badge && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 16px', borderRadius: 999, border: `1px solid ${ac}60`, background: `${ac}15`, marginBottom: 22 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: ac, boxShadow: `0 0 6px ${ac}` }} />
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: ac }}>{block.badge}</span>
                </div>
              )}
              {block.title && <h2 style={{ fontFamily: "var(--font-heading,'Outfit'),sans-serif", fontWeight: 900, fontSize: titleFs, color: block.titleColor || '#fff', lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 18 }}>{block.title}</h2>}
              {block.description && <p style={{ fontSize: subFs, color: block.subtitleColor || 'rgba(255,255,255,.55)', maxWidth: 500, margin: '0 auto 36px', lineHeight: 1.7 }}>{block.description}</p>}
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                {block.ctaLabel && (
                  <a href={block.ctaLink || '/cliente'} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 999, background: `linear-gradient(90deg,${ac},${t.to || ac})`, color: block.ctaBtnText || '#fff', fontWeight: 800, fontSize: 15, textDecoration: 'none', boxShadow: `0 8px 28px ${ac}55`, transition: 'transform .2s, box-shadow .2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 14px 36px ${ac}70`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 28px ${ac}55`; }}>
                    {block.ctaLabel} <ArrowRight size={15} />
                  </a>
                )}
                {block.secondaryLabel && (
                  <a href={block.secondaryLink || '/'} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 999, background: 'transparent', color: 'rgba(255,255,255,.65)', fontWeight: 700, fontSize: 15, textDecoration: 'none', border: '1.5px solid rgba(255,255,255,.18)', transition: 'color .2s, border-color .2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.4)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.65)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.18)'; }}>
                    {block.secondaryLabel}
                  </a>
                )}
              </div>
              {block.socialProof && <p style={{ marginTop: 28, fontSize: 11, color: 'rgba(255,255,255,.3)', fontWeight: 500, letterSpacing: '.04em' }}>{block.socialProof}</p>}
            </div>
          </section>
        );
      }

      // ── 4. GLASS — card glassmorphism sobre fundo gradiente mesh ──────────
      {
        return (
          <section style={{ background: block.bgColor || `linear-gradient(135deg,${ac}ee 0%,${t.to || ac}cc 100%)`, padding: sectionPad(block), position: 'relative', overflow: 'hidden' }} className="px-4 sm:px-6 lg:px-8">
            {/* mesh blobs */}
            <div style={{ position: 'absolute', top: '-30%', left: '-10%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,.15)', filter: 'blur(60px)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-20%', right: '-5%', width: 350, height: 350, borderRadius: '50%', background: 'rgba(0,0,0,.18)', filter: 'blur(60px)', pointerEvents: 'none' }} />
            <div style={{ maxWidth: containerMaxW(block), margin: '0 auto', position: 'relative' }}>
              <div style={{ background: 'rgba(255,255,255,.12)', backdropFilter: 'blur(24px)', borderRadius: cardRadius(block) || 24, border: '1px solid rgba(255,255,255,.28)', padding: 'clamp(36px,5vw,60px) clamp(28px,5vw,64px)', textAlign: 'center', boxShadow: '0 32px 80px rgba(0,0,0,.2), inset 0 1px 0 rgba(255,255,255,.35)' }}>
                {block.badge && <span style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 14px', borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', background: 'rgba(255,255,255,.25)', color: '#fff', marginBottom: 18, border: '1px solid rgba(255,255,255,.3)' }}>{block.badge}</span>}
                {block.title && <h2 style={{ fontFamily: "var(--font-heading,'Outfit'),sans-serif", fontWeight: 900, fontSize: titleFs, color: block.titleColor || '#fff', lineHeight: 1.1, letterSpacing: '-0.025em', marginBottom: 14, textShadow: '0 2px 20px rgba(0,0,0,.15)' }}>{block.title}</h2>}
                {block.description && <p style={{ fontSize: subFs, color: block.subtitleColor || 'rgba(255,255,255,.88)', maxWidth: 520, margin: '0 auto 32px', lineHeight: 1.7 }}>{block.description}</p>}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {block.ctaLabel && (
                    <a href={block.ctaLink || '/cliente'} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 30px', borderRadius: 999, background: block.ctaBtnBg || '#fff', color: block.ctaBtnText || ac, fontWeight: 800, fontSize: 15, textDecoration: 'none', boxShadow: '0 8px 24px rgba(0,0,0,.2)', transition: 'transform .2s, box-shadow .2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 14px 32px rgba(0,0,0,.25)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,.2)'; }}>
                      {block.ctaLabel}
                    </a>
                  )}
                  {block.secondaryLabel && (
                    <a href={block.secondaryLink || '/'} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 26px', borderRadius: 999, background: 'rgba(255,255,255,.18)', color: '#fff', fontWeight: 700, fontSize: 15, textDecoration: 'none', border: '1.5px solid rgba(255,255,255,.4)', backdropFilter: 'blur(8px)', transition: 'background .2s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.28)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.18)'; }}>
                      {block.secondaryLabel}
                    </a>
                  )}
                </div>
                {block.socialProof && <p style={{ marginTop: 24, fontSize: 12, color: 'rgba(255,255,255,.6)', fontWeight: 500 }}>{block.socialProof}</p>}
              </div>
            </div>
          </section>
        );
      }
    }

    // ── TEXT ──────────────────────────────────────────────────────────────────
    case 'text': {
      const isDark = block.colorTheme === 'dark';
      return (
        <section style={{ padding: sectionPad(block), background: block.bgColor || (isDark ? '#0f172a' : 'var(--s0)') }} className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div style={{ borderLeft: `4px solid ${t.from}`, paddingLeft: 24 }}>
              {block.title && <h2 style={{ fontFamily: "var(--font-heading,'Outfit'),sans-serif", fontWeight: 900, fontSize: block.titleSize || TITLE_SIZE_MAP[block.titleSizePreset || 'md'], color: block.titleColor || (isDark ? '#fff' : '#0f172a'), marginBottom: 12, letterSpacing: '-0.02em', textAlign: (block.titleAlign || 'left') as React.CSSProperties['textAlign'] }}>{block.title}</h2>}
              {block.description && <p style={{ color: block.subtitleColor || (isDark ? 'rgba(255,255,255,.65)' : '#475569'), lineHeight: 1.8, fontSize: block.subtitleSize || SUBTITLE_SIZE_MAP[block.subtitleSizePreset || 'md'], whiteSpace: 'pre-wrap' }}>{block.description}</p>}
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
        <section style={{ padding: sectionPad(block), background: isDark ? '#0a0a10' : 'var(--s1)', overflow: 'hidden' }}>
          <style>{`@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {block.title && <SectionHead title={block.title} subtitle={block.subtitle} t={t} dark={isDark} as={headingAs} block={block} />}
            {hasLogos ? (
              useMarquee ? (
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 80, background: `linear-gradient(90deg,${isDark ? '#0a0a10' : 'var(--s1)'},transparent)`, zIndex: 2, pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, background: `linear-gradient(-90deg,${isDark ? '#0a0a10' : 'var(--s1)'},transparent)`, zIndex: 2, pointerEvents: 'none' }} />
                  <div style={{ display: 'flex', gap: 16, animation: 'marquee 28s linear infinite', width: 'max-content' }}>
                    {doubled.map((logo, i) => (
                      <div key={i} title={logo.name} style={{ height: 60, padding: '0 24px', background: isDark ? 'rgba(255,255,255,.06)' : 'var(--s1)', border: `1px solid ${isDark ? 'rgba(255,255,255,.08)' : 'var(--b1)'}`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, minWidth: 120 }}>
                        {logo.imageUrl ? <img src={resolveImg(logo.imageUrl) ?? logo.imageUrl} alt={logo.name} style={{ height: 32, maxWidth: 100, objectFit: 'contain' }} /> : <span style={{ fontSize: 13, fontWeight: 700, color: isDark ? '#fff' : 'var(--t1)' }}>{logo.name}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center', alignItems: 'center' }}>
                  {logoItems.map((logo, i) => (
                    <div key={i} title={logo.name} style={{ height: 60, padding: '0 24px', background: isDark ? 'rgba(255,255,255,.06)' : 'var(--s1)', border: `1px solid ${isDark ? 'rgba(255,255,255,.08)' : 'var(--b1)'}`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isDark ? 'none' : '0 2px 8px rgba(0,0,0,.05)', transition: 'all .2s', minWidth: 110 }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 20px rgba(0,0,0,.1)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = isDark ? 'none' : '0 2px 8px rgba(0,0,0,.05)'; }}>
                      {logo.imageUrl ? <img src={resolveImg(logo.imageUrl) ?? logo.imageUrl} alt={logo.name} style={{ height: 32, maxWidth: 100, objectFit: 'contain' }} /> : <span style={{ fontSize: 13, fontWeight: 700, color: isDark ? '#fff' : 'var(--t1)' }}>{logo.name}</span>}
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
                {textItems.map((item, i) => (
                  <span key={i} style={{ padding: '10px 20px', borderRadius: 50, fontSize: 13, fontWeight: 600, background: isDark ? 'rgba(255,255,255,.08)' : 'var(--s2)', color: isDark ? '#fff' : 'var(--t1)', border: `1px solid ${isDark ? 'rgba(255,255,255,.1)' : 'var(--b1)'}` }}>{item}</span>
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
            <div style={{ height: 1, background: 'var(--b1)' }} />
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
      return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"><hr style={{ borderColor: 'var(--b1)' }} /></div>;

    // ════════════════════════════════════════════════════════════════════════
    // PRICING — tabela de planos com toggle Mensal/Anual
    // ════════════════════════════════════════════════════════════════════════
    case 'pricing': {
      const plans = block.pricingPlans || [];
      if (plans.length === 0) return null;
      return <PricingBlock block={block} t={t} headingAs={headingAs} />;
    }

    // ════════════════════════════════════════════════════════════════════════
    // DEMO_FORM — formulário inline de captura de lead
    // ════════════════════════════════════════════════════════════════════════
    case 'demo_form': {
      return <DemoFormBlock block={block} t={t} headingAs={headingAs} />;
    }

    // ════════════════════════════════════════════════════════════════════════
    // TEAM — cards de membros da equipe
    // ════════════════════════════════════════════════════════════════════════
    case 'team': {
      const members = block.teamMembers || [];
      if (members.length === 0) return null;
      const isDark = block.colorTheme === 'dark';
      const cols = block.teamColumns || 3;
      const layout = block.teamLayout || 'grid';
      return (
        <section style={getBlockStyles(block, t).section} className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <SectionHead title={block.title} subtitle={block.subtitle} t={t} dark={isDark} as={headingAs} block={block} />
            <div style={{
              display: 'grid',
              gridTemplateColumns: layout === 'list' ? '1fr' : `repeat(auto-fit, minmax(${cols === 4 ? 220 : cols === 3 ? 260 : 320}px, 1fr))`,
              gap: 20,
            }}>
              {members.map((m, i) => (
                <div key={i} style={{
                  background: isDark ? 'rgba(255,255,255,.04)' : 'var(--s1)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,.08)' : 'var(--b1)'}`,
                  borderRadius: 16, padding: '24px 20px', textAlign: 'center',
                  transition: 'transform .2s, box-shadow .2s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(0,0,0,.08)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>
                  <div style={{ width: 92, height: 92, borderRadius: '50%', margin: '0 auto 16px', overflow: 'hidden', background: `linear-gradient(135deg, ${t.from}, ${t.to})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 32, fontFamily: "var(--font-heading,'Outfit'),sans-serif" }}>
                    {m.photo ? <img src={resolveImg(m.photo) ?? m.photo} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : m.name.split(' ').slice(0, 2).map(w => w[0] || '').join('').toUpperCase()}
                  </div>
                  <h3 style={{ fontFamily: "var(--font-heading,'Outfit'),sans-serif", fontSize: 17, fontWeight: 700, color: isDark ? '#fff' : 'var(--t1)', margin: '0 0 4px' }}>{m.name}</h3>
                  <p style={{ fontSize: 13, color: t.from, fontWeight: 600, margin: '0 0 12px' }}>{m.role}</p>
                  {m.bio && <p style={{ fontSize: 13, color: isDark ? 'rgba(255,255,255,.6)' : 'var(--t3)', lineHeight: 1.55, margin: '0 0 16px' }}>{m.bio}</p>}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                    {m.linkedin && <a href={m.linkedin} target="_blank" rel="noreferrer" aria-label={`LinkedIn de ${m.name}`} style={{ color: isDark ? 'rgba(255,255,255,.5)' : 'var(--t3)' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg></a>}
                    {m.twitter && <a href={m.twitter} target="_blank" rel="noreferrer" aria-label={`X/Twitter de ${m.name}`} style={{ color: isDark ? 'rgba(255,255,255,.5)' : 'var(--t3)' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>}
                    {m.email && <a href={`mailto:${m.email}`} aria-label={`Email de ${m.name}`} style={{ color: isDark ? 'rgba(255,255,255,.5)' : 'var(--t3)' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></a>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    // ════════════════════════════════════════════════════════════════════════
    // TABS — conteúdo tabulado horizontal ou vertical
    // ════════════════════════════════════════════════════════════════════════
    case 'tabs': {
      const tabs = block.tabsItems || [];
      if (tabs.length === 0) return null;
      return <TabsBlock block={block} t={t} headingAs={headingAs} />;
    }

    // ════════════════════════════════════════════════════════════════════════
    // COMPARISON_TABLE — matriz features × colunas
    // ════════════════════════════════════════════════════════════════════════
    case 'comparison_table': {
      const cols = block.comparisonColumns || [];
      const rows = block.comparisonRows || [];
      if (cols.length === 0 || rows.length === 0) return null;
      const isDark = block.colorTheme === 'dark';
      const showCats = block.comparisonShowCategories !== false;

      // Agrupa por categoria se ativado
      const groups = showCats
        ? rows.reduce<Record<string, typeof rows>>((acc, r) => {
            const cat = r.category || '';
            (acc[cat] ||= []).push(r);
            return acc;
          }, {})
        : { '': rows };

      const renderValue = (v: boolean | string) => {
        if (v === true) return <span style={{ color: '#22c55e', fontSize: 18, fontWeight: 700 }}>✓</span>;
        if (v === false) return <span style={{ color: isDark ? 'rgba(255,255,255,.25)' : '#d1d5db', fontSize: 16 }}>✗</span>;
        return <span style={{ fontSize: 13, color: isDark ? 'rgba(255,255,255,.7)' : 'var(--t2)' }}>{v}</span>;
      };

      return (
        <section style={getBlockStyles(block, t).section} className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <SectionHead title={block.title} subtitle={block.subtitle} t={t} dark={isDark} as={headingAs} block={block} />
            <div style={{ overflowX: 'auto', borderRadius: 16, border: `1px solid ${isDark ? 'rgba(255,255,255,.08)' : 'var(--b1)'}`, background: isDark ? 'rgba(255,255,255,.02)' : 'var(--s1)' }}>
              <table style={{ width: '100%', minWidth: 600, borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '18px 20px', fontWeight: 600, fontSize: 12, color: isDark ? 'rgba(255,255,255,.5)' : 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,.08)' : 'var(--b1)'}` }}>Recurso</th>
                    {cols.map((col, ci) => (
                      <th key={ci} style={{ textAlign: 'center', padding: '18px 16px', fontWeight: 700, fontSize: 14, color: col.highlighted ? t.from : (isDark ? '#fff' : 'var(--t1)'), borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,.08)' : 'var(--b1)'}`, background: col.highlighted ? `${t.from}10` : undefined, position: 'relative' }}>
                        {col.badge && <span style={{ display: 'block', fontSize: 9, fontWeight: 800, color: t.from, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>{col.badge}</span>}
                        {col.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(groups).map(([category, catRows]) => (
                    <React.Fragment key={category}>
                      {showCats && category && (
                        <tr><td colSpan={cols.length + 1} style={{ padding: '14px 20px 6px', fontWeight: 700, fontSize: 11, color: isDark ? 'rgba(255,255,255,.4)' : 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.1em' }}>{category}</td></tr>
                      )}
                      {catRows.map((row, ri) => (
                        <tr key={ri} style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,.05)' : 'var(--b1)'}` }}>
                          <td style={{ padding: '14px 20px', color: isDark ? 'rgba(255,255,255,.85)' : 'var(--t1)', fontWeight: 500 }}>{row.feature}</td>
                          {cols.map((col, ci) => (
                            <td key={ci} style={{ padding: '14px 16px', textAlign: 'center', background: col.highlighted ? `${t.from}06` : undefined }}>
                              {renderValue(row.values[ci])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      );
    }

    default:
      return null;
  }
}