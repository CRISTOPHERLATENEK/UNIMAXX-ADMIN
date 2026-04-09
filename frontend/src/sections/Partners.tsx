import { useState } from 'react';
import { useData } from '@/context/DataContext';

export function Partners() {
  const { data, loading } = useData();
  const content = data.content || {};
  const settings = data.settings || {};
  const primaryColor = settings.primary_color || '#f97316';
  const partners = (data.partners || [])
    .filter((p) => p.active === 1)
    .sort((a, b) => a.order_num - b.order_num);

  const categories = ['todos', ...Array.from(new Set(partners.map((p) => p.category).filter(Boolean)))];
  const [activeCategory, setActiveCategory] = useState('todos');

  const filtered = activeCategory === 'todos' ? partners : partners.filter((p) => p.category === activeCategory);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  const BASE_URL = API_URL.replace('/api', '');
  const imgSrc = (img: string) => (img.startsWith('http') ? img : `${BASE_URL}${img}`);

  if (loading || !partners.length) return null;

  return (
    <section className="py-24 bg-white dark:bg-[var(--s1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div data-reveal="up" className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
            style={{ background: `${primaryColor}12`, color: primaryColor, fontFamily: "'DM Sans', sans-serif" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: primaryColor }} />
            {content['partners.label'] || 'Integrações & Parceiros'}
          </div>
          <h2 className="text-[clamp(1.75rem,3.5vw,3rem)] font-bold text-[#1d1d1f] leading-tight mb-3"
            style={{ fontFamily: "'Outfit', sans-serif" }}>
            {content['partners.title'] || 'Ecossistema integrado'}
          </h2>
          <p className="text-[#6e6e73] max-w-md mx-auto text-base"
            style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {content['partners.description'] || 'Conectamos com as principais soluções do mercado para você ter tudo em um só lugar.'}
          </p>
        </div>

        {/* Category pills */}
        {categories.length > 2 && (
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className="px-5 py-2 rounded-full text-[13px] font-medium transition-all duration-200 capitalize"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  background: activeCategory === cat ? primaryColor : 'rgba(0,0,0,.04)',
                  color: activeCategory === cat ? '#fff' : '#6e6e73',
                  border: activeCategory === cat ? `1px solid ${primaryColor}` : '1px solid transparent',
                }}>
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Logo grid */}
        <div data-stagger className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {filtered.map((partner) => (
            <a key={partner.id}
              href={partner.url || '#'}
              target={partner.url ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="group flex items-center justify-center p-5 rounded-2xl transition-all duration-300 apple-card"
              style={{
                background: 'rgba(0,0,0,.02)',
                border: '1px solid rgba(0,0,0,.05)',
                cursor: partner.url ? 'pointer' : 'default',
                aspectRatio: '3/2',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = `${primaryColor}25`;
                el.style.boxShadow = `0 8px 24px ${primaryColor}0e`;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = 'rgba(0,0,0,.05)';
                el.style.boxShadow = 'none';
              }}
            >
              <img src={imgSrc(partner.image)} alt={partner.name}
                style={{ maxHeight: 36, maxWidth: '80%', objectFit: 'contain', opacity: 0.6, transition: 'opacity .2s ease' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '1'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0.6'; }}
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
