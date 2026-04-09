import { useState } from 'react';
import type React from 'react';

import {
  Building2, Monitor, ShoppingCart, BarChart3, Zap, Globe,
  Package, Users, Settings, Star, Shield, Truck, CreditCard,
  Headphones, Layers, PieChart, TrendingUp, Database, Code,
  ArrowUpRight,
} from 'lucide-react';
import { useData } from '@/context/DataContext';

const ICON_MAP: Record<string, React.ElementType> = {
  Building2, Monitor, ShoppingCart, BarChart3, Zap, Globe,
  Package, Users, Settings, Star, Shield, Truck, CreditCard,
  Headphones, Layers, PieChart, TrendingUp, Database, Code,
};

export function QuickLinks() {
  const { data, loading } = useData();
  const ct = data.content || {};
  const [hov, setHov] = useState<number | null>(null);

  // Lê dinamicamente todos os links do banco
  const links: { id: string; title: string; subtitle: string; icon: string; color: string; href: string }[] = [];
  let i = 0;
  while (ct[`quicklinks.${i}.id`] !== undefined) {
    const id = ct[`quicklinks.${i}.id`];
    const title = ct[`quicklinks.${i}.title`];
    // Skip empty/deleted sentinel slots
    if (!id || id === '__deleted__' || !title) { i++; continue; }
    let color = ct[`quicklinks.${i}.color`] || '#3b82f6';
    // Converte cor antiga (classe tailwind) para hex
    if (color.includes('from-blue'))   color = '#3b82f6';
    else if (color.includes('from-green'))  color = '#22c55e';
    else if (color.includes('from-purple')) color = '#a855f7';
    else if (color.includes('from-orange')) color = '#f97316';
    else if (color.includes('from-red'))    color = '#ef4444';
    else if (color.includes('from-cyan'))   color = '#06b6d4';
    else if (color.includes('from-pink'))   color = '#ec4899';
    else if (color.includes('from-yellow')) color = '#f59e0b';

    links.push({
      id,
      title:    title    || '',
      subtitle: ct[`quicklinks.${i}.subtitle`] || '',
      icon:     ct[`quicklinks.${i}.icon`]     || 'Building2',
      color,
      href:     ct[`quicklinks.${i}.href`]     || '#',
    });
    i++;
  }

  if (loading || !links.length) return null;
  const items = links;

  const handleClick = (href: string) => {
    if (href.startsWith('#')) {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = href;
    }
  };

  const cols = Math.min(items.length, 4);

  return (
    <section style={{ padding: '24px 0', background: 'var(--s0)', position: 'relative', zIndex: 20 }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 2rem' }}>
        <div data-stagger style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12 }}>
          {items.map((link, idx) => {
            const Icon = ICON_MAP[link.icon] || Building2;
            const isHov = hov === idx;
            const c = link.color;
            return (
              <button
                key={link.id || idx}
                onClick={() => handleClick(link.href)}
                onMouseEnter={() => setHov(idx)}
                onMouseLeave={() => setHov(null)}
                style={{
                  textAlign: 'left', border: 'none', cursor: 'pointer',
                  padding: '20px', borderRadius: 18,
                  background: isHov ? c : 'var(--s0)',
                  boxShadow: isHov
                    ? `0 16px 48px ${c}30, 0 4px 12px ${c}20`
                    : '0 0 0 1.5px var(--b1)',
                  transition: 'all .3s cubic-bezier(.4,0,.2,1)',
                  transform: isHov ? 'translateY(-3px)' : 'translateY(0)',
                }}
              >
                <div style={{
                  width: 42, height: 42, borderRadius: 12, marginBottom: 16,
                  background: isHov ? 'rgba(255,255,255,.2)' : `${c}14`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background .3s',
                }}>
                  <Icon size={20} style={{ color: isHov ? '#fff' : c, transition: 'color .3s' }} />
                </div>
                <h3 style={{
                  fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 15,
                  margin: '0 0 4px', lineHeight: 1.2,
                  color: isHov ? '#fff' : '#1d1d1f', transition: 'color .3s',
                }}>
                  {link.title}
                </h3>
                <p style={{
                  fontFamily: "'DM Sans',sans-serif", fontSize: 12, margin: '0 0 14px',
                  color: isHov ? 'rgba(255,255,255,.75)' : '#6e6e73', transition: 'color .3s',
                }}>
                  {link.subtitle}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.02em', color: isHov ? '#fff' : c, transition: 'color .3s' }}>
                    Explorar
                  </span>
                  <ArrowUpRight size={13} style={{ color: isHov ? '#fff' : c, transition: 'color .3s' }} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
