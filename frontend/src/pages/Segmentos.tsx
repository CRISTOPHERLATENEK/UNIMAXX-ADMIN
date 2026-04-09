import { useRef } from 'react';
import type React from 'react';

import {
  Shirt, Footprints, Pill, Sparkles, UtensilsCrossed,
  Bike, Gift, Tv, Glasses, Home, Fuel, Store, TrendingUp, Users,
  ArrowRight, HelpCircle, Sandwich, Coffee, BookOpen,
  Dumbbell, Car, Plane, Heart, MessageCircle, ChevronRight,
  Package, Wrench, Star, Building2, Zap, Phone, Mail, Globe,
  MapPin, Clock, Calendar, BarChart2, Target, Award, Shield,
  Lock, Briefcase, FileText, Tag, Plug,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Header } from '@/sections/Header';
import { Footer } from '@/sections/Footer';
import { PageBanner } from '@/components/PageBanner';
import { useData } from '@/context/DataContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const BASE_URL = API_URL.replace('/api', '');

const iconMap: Record<string, React.ElementType> = {
  Shirt, Footprints, Pill, Sparkles, UtensilsCrossed,
  Bike, Gift, Tv, Glasses, Home, Fuel, Sandwich, Store,
  TrendingUp, Users, HelpCircle, Coffee, BookOpen,
  Dumbbell, Car, Plane, Heart,
  Package, Wrench, Star, Building2, Zap, Phone, Mail, Globe,
  MapPin, Clock, Calendar, BarChart2, Target, Award, Shield,
  Lock, Briefcase, FileText, Tag, Plug,
};

const colorPalette = [
  { bg: 'rgba(249,115,22,0.12)', accent: '#f97316', glow: 'rgba(249,115,22,0.25)' },
  { bg: 'rgba(59,130,246,0.12)', accent: '#3b82f6', glow: 'rgba(59,130,246,0.25)' },
  { bg: 'rgba(16,185,129,0.12)', accent: '#10b981', glow: 'rgba(16,185,129,0.25)' },
  { bg: 'rgba(139,92,246,0.12)', accent: '#8b5cf6', glow: 'rgba(139,92,246,0.25)' },
  { bg: 'rgba(236,72,153,0.12)', accent: '#ec4899', glow: 'rgba(236,72,153,0.25)' },
  { bg: 'rgba(245,158,11,0.12)', accent: '#f59e0b', glow: 'rgba(245,158,11,0.25)' },
];

// Inject page styles once
if (typeof document !== 'undefined' && !document.getElementById('seg-page-style')) {
  const s = document.createElement('style');
  s.id = 'seg-page-style';
  s.textContent = `
    .seg-card {
      position: relative;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      padding: 32px 28px;
      cursor: pointer;
      transition: transform 0.35s cubic-bezier(.4,0,.2,1), box-shadow 0.35s cubic-bezier(.4,0,.2,1), border-color 0.35s ease, background 0.35s ease;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .seg-card::before {
      content: '';
      position: absolute;
      inset: 0;
      opacity: 0;
      border-radius: inherit;
      transition: opacity 0.35s ease;
    }
    .seg-card:hover {
      transform: translateY(-6px);
      border-color: rgba(255,255,255,0.18);
    }
    .seg-card:hover::before { opacity: 1; }
    .seg-card:hover .seg-card-arrow { opacity: 1; transform: translateX(0); }
    .seg-card:hover .seg-icon-wrap { transform: scale(1.1); }
    .seg-card-arrow {
      opacity: 0;
      transform: translateX(-6px);
      transition: opacity 0.3s ease, transform 0.3s ease;
    }
    .seg-icon-wrap {
      transition: transform 0.35s cubic-bezier(.4,0,.2,1);
    }
    .seg-number {
      font-family: 'Outfit', sans-serif;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.15em;
      opacity: 1;
      color: #cbd5e1;
    }
    .seg-img-overlay {
      position: absolute;
      inset: 0;
      opacity: 0;
      transition: opacity 0.5s ease;
      border-radius: inherit;
      overflow: hidden;
      z-index: 0;
    }
    .seg-card:hover .seg-img-overlay { opacity: 1; }
    .seg-content { position: relative; z-index: 1; }
    @keyframes segIn {
      from { opacity: 0; transform: translateY(28px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .seg-card { animation: segIn 0.5s cubic-bezier(.4,0,.2,1) both; }
    @keyframes heroLine {
      from { width: 0; opacity: 0; }
      to   { width: 56px; opacity: 1; }
    }
    .hero-line { animation: heroLine 0.8s 0.4s cubic-bezier(.4,0,.2,1) both; }
    @keyframes badgePop {
      from { opacity: 0; transform: scale(0.85) translateY(10px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }
    .badge-pop { animation: badgePop 0.6s 0.1s cubic-bezier(.4,0,.2,1) both; }
  `;
  document.head.appendChild(s);
}

function Segmentos() {
  const { data } = useData();
  const settings = data.settings || {};
  const content = data.content || {};
  const primaryColor = settings.primary_color || '#f97316';

  // Hero texts — editáveis em Admin → Textos do Site → Página de Segmentos
  const heroBadge       = content['segmentos_page.badge']       || 'Segmentos de Mercado';
  const heroLine1       = content['segmentos_page.title_line1'] || 'Soluções para';
  const heroLine2       = content['segmentos_page.title_line2'] || 'cada negócio';
  const heroDescription = content['segmentos_page.description'] || 'Do varejo à alimentação, da farmácia ao delivery — temos a solução especializada para o seu segmento.';

  const segments = (data.segments || [])
    .filter((s: any) => Number(s.active) === 1)
    .sort((a: any, b: any) => (a.order_num ?? 0) - (b.order_num ?? 0));

  const heroFallback = (
    <section className="relative py-40 bg-[#0a0a0f] overflow-hidden">
      {/* Mesh background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px]"
          style={{ background: `${primaryColor}18` }} />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{ background: 'rgba(139,92,246,0.12)' }} />
        {/* Grid lines */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="badge-pop inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-xs font-bold uppercase tracking-[0.18em]"
            style={{ background: `${primaryColor}18`, color: primaryColor, border: `1px solid ${primaryColor}30` }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: primaryColor }} />
            {heroBadge}
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-6"
            style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.03em' }}>
            {heroLine1}<br />
            <span className="text-orange-gradient">{heroLine2}</span>
          </h1>

          <div className="hero-line h-0.5 mb-6 rounded-full" style={{ background: `linear-gradient(90deg, ${primaryColor}, transparent)` }} />

          <p className="text-lg text-white/50 max-w-xl leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {heroDescription}
          </p>
        </div>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <PageBanner page="segmentos" fallback={heroFallback} dark />

      {/* Stats strip */}
      <div style={{ background: '#fff', borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-wrap gap-8 items-center justify-between">
            {[
              { value: String(segments.length) || '0', label: 'Segmentos atendidos' },
              ...((data.stats || []).filter((s: any) => s.section === 'segmentos-strip').sort((a: any, b: any) => a.order_num - b.order_num).map((s: any) => ({ value: s.value, label: s.label }))),
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-2xl font-black" style={{ fontFamily: "'Outfit', sans-serif", color: primaryColor }}>
                  {item.value}
                </span>
                <span className="text-xs text-slate-500 uppercase tracking-widest" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main segments section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section label */}
          <div className="flex items-center gap-4 mb-16">
            <div className="h-px flex-1 max-w-[60px]" style={{ background: `linear-gradient(90deg, ${primaryColor}, transparent)` }} />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Explore os segmentos
            </span>
            <div className="h-px flex-1" style={{ background: '#e5e7eb' }} />
          </div>

          {segments.length === 0 ? (
            <div className="text-center py-32">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: '#f1f5f9', border: '1px solid #e2e8f0' }}>
                <HelpCircle size={32} className="text-slate-300" />
              </div>
              <p className="text-slate-400 text-lg" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Nenhum segmento cadastrado ainda.
              </p>
              <p className="text-slate-400 text-sm mt-1">Adicione segmentos no painel administrativo.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {segments.map((segment: any, index: number) => {
                const Icon = iconMap[segment.icon] || HelpCircle;
                const palette = colorPalette[index % colorPalette.length];
                const hasImage = segment.image && segment.image.length > 0;
                const imgSrc = hasImage
                  ? (segment.image.startsWith('http') ? segment.image : `${BASE_URL}${segment.image}`)
                  : null;
                const featureLines: string[] = segment.description
                  ? segment.description.split('\n').map((l: string) => l.trim()).filter(Boolean)
                  : [];

                return (
                  <div
                    key={segment.segment_id}
                    className="seg-card"
                    style={{ animationDelay: `${index * 60}ms` }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.background = palette.bg;
                      el.style.boxShadow = `0 24px 60px ${palette.glow}, 0 4px 16px rgba(0,0,0,0.4)`;
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.background = '#ffffff';
                      el.style.boxShadow = 'none';
                    }}
                  >
                    {/* Image overlay on hover */}
                    {imgSrc && (
                      <div className="seg-img-overlay">
                        <img src={imgSrc} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 100%)' }} />
                      </div>
                    )}

                    {/* Card content */}
                    <div className="seg-content flex flex-col gap-4 h-full">

                      {/* Top row: number + arrow */}
                      <div className="flex items-center justify-between">
                        <span className="seg-number" style={{ color: '#94a3b8' }}>
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="seg-card-arrow">
                          <ArrowRight size={16} style={{ color: palette.accent }} />
                        </div>
                      </div>

                      {/* Icon */}
                      <div
                        className="seg-icon-wrap w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{ background: palette.bg, border: `1px solid ${palette.accent}25` }}
                      >
                        <Icon size={24} style={{ color: palette.accent }} />
                      </div>

                      {/* Name */}
                      <div>
                        <h3
                          className="text-lg font-bold text-slate-900 leading-tight mb-1"
                          style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}
                        >
                          {segment.name}
                        </h3>

                        {featureLines.length > 0 && (
                          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                            {featureLines[0]}
                          </p>
                        )}
                      </div>

                      {/* Feature bullets */}
                      {featureLines.length > 1 && (
                        <div className="flex flex-col gap-1.5 mt-auto pt-4"
                          style={{ borderTop: '1px solid #f1f5f9' }}>
                          {featureLines.slice(1, 4).map((line: string, i: number) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: palette.accent }} />
                              <span className="text-xs text-slate-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>{line}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden p-12 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(139,92,246,0.1) 100%)',
              border: '1px solid rgba(249,115,22,0.2)',
            }}>
            {/* Glow orbs */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[80px] pointer-events-none"
              style={{ background: `${primaryColor}20` }} />

            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6 text-xs font-semibold uppercase tracking-widest"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <MessageCircle size={10} />
                Fale com um especialista
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4"
                style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.03em' }}>
                Não encontrou seu segmento?
              </h2>
              <p className="text-white/40 text-base mb-8 max-w-xl mx-auto" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Entre em contato. Temos soluções para todos os tipos de negócio do varejo brasileiro.
              </p>

              <Link
                to="/cliente"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-sm text-white transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, #ea580c)`,
                  boxShadow: `0 8px 32px ${primaryColor}40`,
                  fontFamily: "'DM Sans', sans-serif",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)';
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 40px ${primaryColor}60`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${primaryColor}40`;
                }}
              >
                Falar com um Especialista
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Segmentos;
