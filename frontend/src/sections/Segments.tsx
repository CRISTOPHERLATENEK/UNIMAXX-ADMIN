import type React from 'react';
import {
  Shirt, Footprints, Pill, Sparkles, UtensilsCrossed, Bike, Gift, Tv, Glasses, Home, Fuel, ArrowRight,
  Store, TrendingUp, Users, Sandwich, Coffee, BookOpen, Dumbbell, Car, Plane, Heart,
  Package, Wrench, Star, Building2, Zap, Phone, Mail, Globe, MapPin, Clock,
  Calendar, BarChart2, Target, Award, Shield, Lock, Briefcase, FileText, Tag, Plug,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Link } from 'react-router-dom';

// Inject CSS once at module level — avoids inline <style> in JSX (React reconciliation issue)
if (typeof document !== 'undefined' && !document.getElementById('segment-hover-style')) {
  const s = document.createElement('style');
  s.id = 'segment-hover-style';
  s.textContent = '.segment-btn:hover .icon-wrap{background:rgba(255,255,255,.15)!important}.segment-btn:hover .segment-icon{color:#fb923c!important}';
  document.head.appendChild(s);
}

const iconMap: { [key: string]: React.ElementType } = {
  Shirt, Footprints, Pill, Sparkles, UtensilsCrossed, Bike, Gift, Tv, Glasses, Home, Fuel,
  Store, TrendingUp, Users, Sandwich, Coffee, BookOpen, Dumbbell, Car, Plane, Heart,
  Package, Wrench, Star, Building2, Zap, Phone, Mail, Globe, MapPin, Clock,
  Calendar, BarChart2, Target, Award, Shield, Lock, Briefcase, FileText, Tag, Plug,
};

export function Segments() {
  const { data, loading } = useData();
  const content = data.content || {};
  const settings = data.settings || {};
  const primaryColor = settings.primary_color || '#f97316';

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  const BASE_URL = API_URL.replace('/api', '');

  const segments = (data.segments || [])
    .filter((s: any) => Number(s.active) === 1 && (s.show_home === undefined || Number(s.show_home) === 1))
    .sort((a: any, b: any) => a.order_num - b.order_num);

  if (loading || !segments.length) return null;

  return (
    <section id="segmentos" className="py-32 bg-white dark:bg-[var(--s1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div data-reveal="up" className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
            style={{
              background: `${primaryColor}12`,
              color: primaryColor,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: primaryColor }} />
            Especialidades
          </div>
          <h2
            className="text-[clamp(2rem,4vw,3.5rem)] font-bold text-[#1d1d1f] leading-tight mb-4"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            {content['segments.title'] || 'Atendemos todos os'}{' '}
            <span className="text-orange-gradient">
              {content['segments.subtitle'] || 'segmentos'}
            </span>
          </h2>
          <p
            className="text-[#6e6e73] max-w-md mx-auto text-base leading-relaxed"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {content['segments.description'] ||
              'Soluções especializadas para cada tipo de negócio no varejo.'}
          </p>
        </div>

        {/* ── Segments grid ── */}
        <div data-stagger className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {segments.map((segment: any, index: number) => {
            const Icon = iconMap[segment.icon] || Shirt;
            const hasImage = segment.image && segment.image.length > 0;
            const imgSrc = hasImage ? (segment.image.startsWith('http') ? segment.image : `${BASE_URL}${segment.image}`) : null;

            return (
              <button
                key={segment.segment_id}
                className="segment-btn group flex flex-col items-center p-5 rounded-2xl transition-all duration-350 apple-card relative overflow-hidden"
                style={{
                  background: 'var(--s1)',
                  border: '1px solid var(--b1)',
                  animationDelay: `${index * 40}ms`,
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = 'var(--s3)';
                  el.style.borderColor = 'var(--b2)';
                  if (imgSrc) {
                    const iconWrap = el.querySelector('.icon-wrap') as HTMLElement;
                    if (iconWrap) { iconWrap.style.transform = 'translateY(-10px)'; iconWrap.style.opacity = '0'; }
                  }
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = 'var(--s1)';
                  el.style.borderColor = 'var(--b1)';
                  if (imgSrc) {
                    const iconWrap = el.querySelector('.icon-wrap') as HTMLElement;
                    if (iconWrap) { iconWrap.style.transform = 'translateY(0)'; iconWrap.style.opacity = '1'; }
                  }
                }}
              >
                {/* Background image overlay */}
                {imgSrc && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-350" style={{ zIndex: 0 }}>
                    <img src={imgSrc} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,.6)' }} />
                  </div>
                )}

                {/* Icon container — sobe e some no hover quando tem imagem */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 relative z-10 icon-wrap"
                  style={{
                    background: 'var(--s0)',
                    boxShadow: '0 2px 8px rgba(0,0,0,.12)',
                    transition: 'transform 0.3s ease, opacity 0.3s ease',
                  }}
                >
                  <Icon
                    className="segment-icon transition-colors duration-300"
                    style={{ width: 22, height: 22, color: primaryColor }}
                  />
                </div>
                <span
                  className="text-[11.5px] font-semibold text-center leading-tight transition-colors duration-300 group-hover:text-white/90 relative z-10"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: 'var(--t1)' }}
                >
                  {segment.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── CTA ── */}
        <div className="text-center mt-12">
          <Link
            to="/segmentos"
            className="inline-flex items-center gap-2 px-8 py-3.5 font-semibold text-[14px] rounded-full transition-all duration-300 btn-apple"
            style={{
              border: `2px solid ${primaryColor}`,
              color: primaryColor,
              fontFamily: "'DM Sans', sans-serif",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = primaryColor;
              el.style.color = '#ffffff';
              el.style.boxShadow = `0 8px 24px ${primaryColor}30`;
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = 'transparent';
              el.style.color = primaryColor;
              el.style.boxShadow = 'none';
            }}
          >
            {content['segments.viewAll'] || 'Ver Todos os Segmentos'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

    </section>
  );
}