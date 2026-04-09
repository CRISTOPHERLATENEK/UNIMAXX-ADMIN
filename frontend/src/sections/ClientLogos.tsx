import type React from 'react';
import { useData } from '@/context/DataContext';
import {
  ShoppingCart, CreditCard, BarChart3, Truck, Wifi, Bell,
  Zap, Shield, Clock, Package, Users, Star, RefreshCw,
  Smartphone, Globe, FileText, CheckCircle, TrendingUp, Lock, Headphones,
} from 'lucide-react';

if (typeof document !== 'undefined' && !document.getElementById('features-marquee-style')) {
  const s = document.createElement('style');
  s.id = 'features-marquee-style';
  s.textContent = `
    @keyframes marquee-fwd { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    @keyframes marquee-rev { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
  `;
  document.head.appendChild(s);
}

// Mapa de ícones disponíveis para serialização/desserialização
export const ICON_MAP: Record<string, React.ElementType> = {
  ShoppingCart, CreditCard, BarChart3, Truck, Wifi, Bell,
  Zap, Shield, Clock, Package, Users, Star, RefreshCw,
  Smartphone, Globe, FileText, CheckCircle, TrendingUp, Lock, Headphones,
};

export type Feature = { label: string; icon: string; color: string; bg: string };

// Defaults hardcoded — usados como fallback quando não há dados no CMS
export const DEFAULT_ROW1: Feature[] = [
  { label: 'Venda rápida no PDV',      icon: 'ShoppingCart', color: '#f97316', bg: '#fff7ed' },
  { label: 'Pagamento integrado',      icon: 'CreditCard',   color: '#2563eb', bg: '#eff6ff' },
  { label: 'Relatórios em tempo real', icon: 'BarChart3',    color: '#10b981', bg: '#ecfdf5' },
  { label: 'Gestão de entregas',       icon: 'Truck',        color: '#8b5cf6', bg: '#f5f3ff' },
  { label: 'Modo offline',             icon: 'Wifi',         color: '#e11d48', bg: '#fff1f2' },
  { label: 'Alertas automáticos',      icon: 'Bell',         color: '#f59e0b', bg: '#fffbeb' },
  { label: 'Alta performance',         icon: 'Zap',          color: '#06b6d4', bg: '#ecfeff' },
  { label: 'Segurança total',          icon: 'Shield',       color: '#64748b', bg: '#f8fafc' },
  { label: 'Controle de estoque',      icon: 'Package',      color: '#16a34a', bg: '#f0fdf4' },
  { label: 'Multi-usuário',            icon: 'Users',        color: '#7c3aed', bg: '#faf5ff' },
];

export const DEFAULT_ROW2: Feature[] = [
  { label: 'Fidelização de clientes',  icon: 'Star',         color: '#f97316', bg: '#fff7ed' },
  { label: 'Sincronização na nuvem',   icon: 'RefreshCw',    color: '#0ea5e9', bg: '#f0f9ff' },
  { label: 'App no celular',           icon: 'Smartphone',   color: '#ec4899', bg: '#fdf2f8' },
  { label: 'Venda online',             icon: 'Globe',        color: '#10b981', bg: '#ecfdf5' },
  { label: 'Nota fiscal automática',   icon: 'FileText',     color: '#6366f1', bg: '#eef2ff' },
  { label: 'Checkout facilitado',      icon: 'CheckCircle',  color: '#22c55e', bg: '#f0fdf4' },
  { label: 'Crescimento de vendas',    icon: 'TrendingUp',   color: '#f97316', bg: '#fff7ed' },
  { label: 'Dados protegidos',         icon: 'Lock',         color: '#ef4444', bg: '#fef2f2' },
  { label: 'Suporte 24/7',             icon: 'Headphones',   color: '#8b5cf6', bg: '#f5f3ff' },
  { label: 'Resposta ágil',            icon: 'Clock',        color: '#14b8a6', bg: '#f0fdfa' },
];

function parseFeatures(raw: string | undefined, fallback: Feature[]): Feature[] {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {}
  return fallback;
}

function FeaturePill({ feat }: { feat: Feature }) {
  const Icon = ICON_MAP[feat.icon] || ShoppingCart;
  return (
    <div
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        padding: '9px 18px', borderRadius: 999,
        background: 'var(--s0)', border: '1.5px solid var(--b1)',
        boxShadow: '0 2px 10px rgba(0,0,0,.06)', whiteSpace: 'nowrap' as const,
        flexShrink: 0, cursor: 'default',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 20px rgba(0,0,0,.10)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 10px rgba(0,0,0,.06)'; }}
    >
      <span style={{ width: 26, height: 26, borderRadius: '50%', background: feat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={13} color={feat.color} strokeWidth={2.2} />
      </span>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, fontWeight: 600, color: 'var(--t1)', letterSpacing: '-0.01em' }}>
        {feat.label}
      </span>
    </div>
  );
}

function MarqueeRow({ features, reverse = false, speed = 38 }: { features: Feature[]; reverse?: boolean; speed?: number }) {
  const doubled = [...features, ...features];
  return (
    <div style={{ overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 12, width: 'max-content', animation: `${reverse ? 'marquee-rev' : 'marquee-fwd'} ${speed}s linear infinite` }}>
        {doubled.map((feat, i) => <FeaturePill key={i} feat={feat} />)}
      </div>
    </div>
  );
}

export function ClientLogos() {
  const { data, loading } = useData();
  const content = data.content || {};
  const settings = data.settings || {};
  const pc = settings.primary_color || '#f97316';

  if (loading) return null;

  const row1 = parseFeatures(content['features.row1'], DEFAULT_ROW1);
  const row2 = parseFeatures(content['features.row2'], DEFAULT_ROW2);

  return (
    <section style={{ padding: '52px 0', background: 'var(--s1)', borderTop: '1px solid var(--b1)', borderBottom: '1px solid var(--b1)', overflow: 'hidden' }}>
      <div data-reveal="up" style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '4px 14px', borderRadius: 999, background: `${pc}10`, border: `1px solid ${pc}25` }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: pc, display: 'inline-block' }} />
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: pc }}>
            {content['clients.title'] || 'O que você encontra na Unimaxx'}
          </span>
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 140, zIndex: 2, background: 'linear-gradient(to right, var(--s1), transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 140, zIndex: 2, background: 'linear-gradient(to left, var(--s1), transparent)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <MarqueeRow features={row1} speed={38} />
          <MarqueeRow features={row2} reverse speed={44} />
        </div>
      </div>
    </section>
  );
}
