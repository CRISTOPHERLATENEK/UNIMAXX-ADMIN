import { useState } from 'react';
import type React from 'react';
import { useData } from '@/context/DataContext';
import {
  Trophy, Heart, Lightbulb, Puzzle, Shield, Zap, Star,
  Target, Award, Rocket, TrendingUp, Users, Globe, Lock, Clock,
  CheckCircle, Flame, Eye, Layers, Package, Headphones, Code,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Trophy, Heart, Lightbulb, Puzzle, Shield, Zap, Star, Target, Award,
  Rocket, TrendingUp, Users, Globe, Lock, Clock,
  CheckCircle, Flame, Eye, Layers, Package, Headphones, Code,
};
function getIcon(n: string) { return ICON_MAP[n] || Star; }

interface Item { icon: string; title: string; description: string; accent: string; }

// Componente individual de card (hooks ficam aqui, fora do .map)
function DiffCard({ item, index, pc }: { item: Item; index: number; pc: string }) {
  const [hov, setHov] = useState(false);
  const Icon = getIcon(item.icon);
  const c = item.accent || pc;
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: 'relative', overflow: 'hidden', borderRadius: 18,
        padding: '28px 24px',
        background: hov ? `linear-gradient(145deg,${c}12,${c}06)` : 'rgba(255,255,255,.03)',
        border: `1px solid ${hov ? c + '35' : 'rgba(255,255,255,.08)'}`,
        transition: 'all .3s ease',
        transform: hov ? 'translateY(-4px)' : 'none',
        boxShadow: hov ? `0 20px 50px ${c}18` : 'none',
      }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${c}${hov ? '60' : '20'},transparent)`, transition: 'all .3s' }} />
      <div style={{ position: 'absolute', top: 14, right: 16, fontFamily: "'Outfit',sans-serif", fontSize: 11, fontWeight: 700, color: hov ? `${c}80` : 'rgba(255,255,255,.07)', transition: 'color .3s' }}>{String(index + 1).padStart(2, '0')}</div>
      <div style={{ width: 50, height: 50, borderRadius: 14, marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${c}18`, border: `1px solid ${c}28`, transition: 'all .3s', transform: hov ? 'scale(1.08) rotate(-5deg)' : 'none' }}>
        <Icon size={23} style={{ color: c }} />
      </div>
      <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 16, fontWeight: 800, color: '#fff', margin: '0 0 10px', letterSpacing: '-0.02em' }}>{item.title}</h3>
      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13.5, lineHeight: 1.7, color: 'rgba(255,255,255,.4)', margin: '0 0 18px' }}>{item.description}</p>
      <div style={{ height: 2, borderRadius: 2, background: `linear-gradient(90deg,${c},transparent)`, width: hov ? '65%' : 22, transition: 'width .4s ease' }} />
    </div>
  );
}

function ListItem({ item, index, pc }: { item: Item; index: number; pc: string }) {
  const [hov, setHov] = useState(false);
  const Icon = getIcon(item.icon);
  const c = item.accent || pc;
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 24,
        padding: '20px 16px',
        background: hov ? `${c}08` : 'transparent',
        borderBottom: '1px solid rgba(255,255,255,.06)',
        borderLeft: `3px solid ${hov ? c : 'transparent'}`,
        transition: 'all .25s',
      }}
    >
      <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(1.5rem,3vw,3rem)', fontWeight: 900, color: hov ? `${c}40` : 'rgba(255,255,255,.06)', lineHeight: 1, flexShrink: 0, letterSpacing: '-0.05em', transition: 'color .25s', minWidth: 48, textAlign: 'right' }}>
        {String(index + 1).padStart(2, '0')}
      </span>
      <div style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${c}15`, border: `1px solid ${c}25`, flexShrink: 0, transition: 'all .25s', transform: hov ? 'scale(1.1)' : 'none' }}>
        <Icon size={20} style={{ color: c }} />
      </div>
      <div style={{ flex: 1 }}>
        <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 16, fontWeight: 800, color: '#fff', margin: '0 0 4px', letterSpacing: '-0.02em' }}>{item.title}</h3>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13.5, lineHeight: 1.6, color: 'rgba(255,255,255,.38)', margin: 0 }}>{item.description}</p>
      </div>
    </div>
  );
}

function SmallCard({ item, pc }: { item: Item; pc: string }) {
  const [hov, setHov] = useState(false);
  const Icon = getIcon(item.icon);
  const c = item.accent || pc;
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ borderRadius: 18, padding: '22px 20px', background: hov ? `${c}0a` : 'rgba(255,255,255,.03)', border: `1px solid ${hov ? c + '30' : 'rgba(255,255,255,.07)'}`, transition: 'all .25s', transform: hov ? 'translateY(-3px)' : 'none' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${c}15`, border: `1px solid ${c}22`, flexShrink: 0 }}>
          <Icon size={17} style={{ color: c }} />
        </div>
        <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 15, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '-0.02em' }}>{item.title}</h3>
      </div>
      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, lineHeight: 1.65, color: 'rgba(255,255,255,.38)', margin: 0 }}>{item.description}</p>
    </div>
  );
}

function ColorCard({ item, pc }: { item: Item; pc: string }) {
  const [hov, setHov] = useState(false);
  const Icon = getIcon(item.icon);
  const c = item.accent || pc;
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ borderRadius: 20, padding: '26px 22px', background: hov ? c : 'rgba(255,255,255,.04)', border: `1.5px solid ${hov ? 'transparent' : 'rgba(255,255,255,.08)'}`, transition: 'all .35s cubic-bezier(.4,0,.2,1)', transform: hov ? 'scale(1.02) translateY(-4px)' : 'none', boxShadow: hov ? `0 24px 60px ${c}40` : 'none' }}
    >
      <div style={{ width: 46, height: 46, borderRadius: 13, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: hov ? 'rgba(255,255,255,.2)' : `${c}18`, transition: 'all .35s' }}>
        <Icon size={21} style={{ color: hov ? '#fff' : c, transition: 'color .35s' }} />
      </div>
      <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 15, fontWeight: 800, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.02em' }}>{item.title}</h3>
      <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, lineHeight: 1.7, color: hov ? 'rgba(255,255,255,.8)' : 'rgba(255,255,255,.38)', margin: 0, transition: 'color .35s' }}>{item.description}</p>
    </div>
  );
}

// Layouts
function LayoutCards({ items, pc }: { items: Item[]; pc: string }) {
  return (
    <div data-stagger className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))' }}>
      {items.map((item, i) => <DiffCard key={i} item={item} index={i} pc={pc} />)}
    </div>
  );
}

function LayoutList({ items, pc }: { items: Item[]; pc: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {items.map((item, i) => <ListItem key={i} item={item} index={i} pc={pc} />)}
    </div>
  );
}

function LayoutFeatured({ items, pc }: { items: Item[]; pc: string }) {
  const [first, ...rest] = items;
  const FIcon = getIcon(first?.icon);
  const fc = first?.accent || pc;
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))' }}>
      <div style={{ borderRadius: 22, padding: 'clamp(24px,4vw,44px) clamp(20px,3vw,36px)', background: `linear-gradient(145deg,${fc}18,${fc}06)`, border: `1px solid ${fc}30`, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', position: 'relative', overflow: 'hidden', minHeight: 260 }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: `radial-gradient(circle,${fc}18,transparent 65%)` }} />
        <div style={{ width: 56, height: 56, borderRadius: 16, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${fc}22`, border: `1px solid ${fc}35` }}>
          <FIcon size={26} style={{ color: fc }} />
        </div>
        <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(1.2rem,2.5vw,1.7rem)', fontWeight: 900, color: '#fff', margin: '0 0 10px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>{first?.title}</h3>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, lineHeight: 1.75, color: 'rgba(255,255,255,.5)', margin: '0 0 20px' }}>{first?.description}</p>
        <div style={{ height: 3, borderRadius: 3, background: `linear-gradient(90deg,${fc},transparent)`, width: '40%' }} />
      </div>
      {rest.map((item, i) => <SmallCard key={i} item={item} pc={pc} />)}
    </div>
  );
}

function LayoutColorful({ items, pc }: { items: Item[]; pc: string }) {
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))' }}>
      {items.map((item, i) => <ColorCard key={i} item={item} pc={pc} />)}
    </div>
  );
}

// Main
export function Differentials() {
  const { data, loading } = useData();
  const ct = data.content || {};
  const pc = data.settings?.primary_color || '#f97316';

  if (ct['differentials.active'] === '0') return null;

  const items: Item[] = [];
  for (let i = 1; i <= 8; i++) {
    const title = (ct[`differentials.item${i}_title`] || '').trim();
    if (!title) continue;
    if (ct[`differentials.item${i}_active`] === '0') continue;
    items.push({
      icon: ct[`differentials.item${i}_icon`] || 'Star',
      title,
      description: ct[`differentials.item${i}_desc`] || '',
      accent: ct[`differentials.item${i}_accent`] || pc,
    });
  }

  if (loading || !items.length) return null;

  const layout = ct['differentials.layout'] || 'cards';
  const badge   = ct['differentials.title']       || '';
  const heading = ct['differentials.subtitle']    || '';
  const accent  = ct['differentials.subtitle2']   || '';
  const desc    = ct['differentials.description'] || '';

  return (
    <section style={{ padding: '48px 0', background: 'transparent' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1rem' }}>
        <div data-reveal="up" style={{ position: 'relative', overflow: 'hidden', borderRadius: 24, padding: 'clamp(32px,5vw,72px) clamp(20px,4vw,56px)', background: '#0f0f12', border: '1px solid rgba(255,255,255,.07)', boxShadow: '0 32px 80px rgba(0,0,0,.35)' }}>
          <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 70% 60% at 5% 50%, ${pc}0d, transparent), radial-gradient(ellipse 50% 70% at 95% 15%, ${pc}08, transparent)`, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: `linear-gradient(90deg,transparent,${pc}30,transparent)` }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="flex flex-wrap items-end justify-between gap-6 mb-10 sm:mb-14">
              <div style={{ maxWidth: 600 }}>
                {badge && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 16, padding: '4px 14px', borderRadius: 4, border: `1px solid ${pc}35`, width: 'fit-content' }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: pc, display: 'inline-block' }} />
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: pc, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: "'DM Sans',sans-serif" }}>{badge}</span>
                  </div>
                )}
                {(heading || accent) && (
                  <h2 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: 'clamp(1.6rem,4vw,3rem)', lineHeight: 1.06, letterSpacing: '-0.035em', color: '#fff', margin: '0 0 10px' }}>
                    {heading && <>{heading} </>}
                    {accent && <span style={{ color: pc, fontStyle: 'italic' }}>{accent}</span>}
                  </h2>
                )}
                {desc && <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, lineHeight: 1.75, color: 'rgba(255,255,255,.38)', fontWeight: 300, margin: 0 }}>{desc}</p>}
              </div>
              <div style={{ flexShrink: 0, textAlign: 'right' }}>
                <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 'clamp(2rem,4vw,4rem)', fontWeight: 900, color: pc, lineHeight: 1, margin: 0, letterSpacing: '-0.04em' }}>{items.length}</p>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: 'rgba(255,255,255,.28)', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>diferenciais</p>
              </div>
            </div>

            {layout === 'list'     && <LayoutList     items={items} pc={pc} />}
            {layout === 'featured' && <LayoutFeatured items={items} pc={pc} />}
            {layout === 'colorful' && <LayoutColorful items={items} pc={pc} />}
            {layout !== 'list' && layout !== 'featured' && layout !== 'colorful' && <LayoutCards items={items} pc={pc} />}
          </div>
        </div>
      </div>
    </section>
  );
}
