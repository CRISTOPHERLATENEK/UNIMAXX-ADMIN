import type React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Building2, Monitor, ShoppingCart, CreditCard, Truck,
  BarChart3, Globe, Settings, Zap, Package, Star, Layers, FileText,
  RefreshCw,
} from 'lucide-react';
import { Header } from '@/sections/Header';
import { Footer } from '@/sections/Footer';
import { PageBanner } from '@/components/PageBanner';
import { useData } from '@/context/DataContext';

const ICON_MAP: Record<string, React.ElementType> = {
  Building2, Monitor, ShoppingCart, CreditCard, Truck,
  BarChart3, Globe, Settings, Zap, Package, Star, Layers, FileText,
};

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace('/api', '');
const resolveImg = (p?: string) => !p ? null : p.startsWith('http') ? p : `${BASE_URL}${p}`;

const GRADIENTS = [
  ['#1e3a5f','#2563eb'], ['#7c2d12','#c2410c'], ['#14532d','#16a34a'],
  ['#4a044e','#9333ea'], ['#0f2744','#0284c7'], ['#431407','#dc2626'],
  ['#1a1a2e','#6c4bce'], ['#064e3b','#059669'],
];

function Solucoes() {
  const { data } = useData();
  const solutions = (data.solutions || []).filter((s: any) => s.active === 1)
    .sort((a: any, b: any) => a.order_num - b.order_num);
  const settings = data.settings || {};
  const pc = settings.primary_color || '#f97316';
  const sc = settings.secondary_color || '#fb923c';

  const heroFallback = (
    <section style={{
      background: 'linear-gradient(110deg,#070709 0%,#111118 60%,#1a1a24 100%)',
      minHeight: 420, paddingTop: 68, display: 'flex', alignItems: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
      <div style={{ position: 'absolute', top: -80, right: '10%', width: 440, height: 440, borderRadius: '50%', background: `${pc}18`, filter: 'blur(100px)', pointerEvents: 'none' }} />
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '3rem 2rem', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 999, background: `${pc}18`, border: `1px solid ${pc}33`, color: pc, fontSize: 11, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 20 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: pc, display: 'inline-block' }} />
          Portfólio Completo
        </div>
        <h1 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: 'clamp(2.4rem,5vw,4rem)', color: '#fff', lineHeight: 1.06, letterSpacing: '-.03em', margin: '0 0 16px' }}>
          Nossas Soluções
        </h1>
        <p style={{ color: 'rgba(255,255,255,.48)', fontSize: '1.08rem', maxWidth: 520, lineHeight: 1.7, margin: 0 }}>
          Tecnologia especializada para o varejo. Do ERP ao PDV, tudo integrado em um único ecossistema.
        </p>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <Header />
      <PageBanner page="solucoes" fallback={heroFallback} />

      <section className="py-20 bg-[#f5f5f7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {solutions.length === 0 ? (
            <div className="text-center py-16">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: pc }} />
              <p style={{ color: '#6e6e73' }}>Carregando soluções...</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {solutions.map((sol: any, i: number) => {
                const Icon = ICON_MAP[sol.icon] || Building2;
                const photo = resolveImg(sol.image);
                const [c1, c2] = GRADIENTS[i % GRADIENTS.length];
                const href = sol.nav_link?.trim() || `/solucao-page/${sol.solution_id}`;

                return (
                  <Link key={sol.solution_id} to={href} className="group block">
                    <div className="relative rounded-2xl overflow-hidden transition-all duration-300 group-hover:-translate-y-2"
                      style={{ height: 280, boxShadow: '0 4px 20px rgba(0,0,0,.1)' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 40px rgba(0,0,0,.18)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,.1)'; }}>

                      {/* BG */}
                      {photo
                        ? <img src={photo} alt={sol.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        : <div className="absolute inset-0" style={{ background: `linear-gradient(165deg,${c1},${c2})` }} />
                      }
                      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,.22)' }} />

                      {/* Icon */}
                      <div className="absolute top-7 left-1/2 -translate-x-1/2 transition-transform duration-300 group-hover:scale-110">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center"
                          style={{ background: 'rgba(255,255,255,.2)', backdropFilter: 'blur(12px)', border: '2px solid rgba(255,255,255,.5)' }}>
                          <Icon style={{ width: 28, height: 28, color: '#fff' }} />
                        </div>
                      </div>

                      {/* Bottom */}
                      <div className="absolute bottom-0 left-0 right-0 p-5"
                        style={{ background: 'linear-gradient(to top,rgba(0,0,0,.82),transparent)' }}>
                        <p className="text-white font-bold text-[15px] text-center mb-3" style={{ fontFamily: "'Outfit',sans-serif" }}>
                          {sol.title}
                        </p>
                        <div className="flex items-center justify-center gap-1.5 text-white/80 text-[12px] font-medium transition-all duration-200 group-hover:gap-2.5">
                          Ver mais <ArrowRight style={{ width: 13, height: 13 }} />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg,${pc},${sc})` }}>
        <div className="absolute inset-0 opacity-[.05]"
          style={{ backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-[clamp(1.75rem,4vw,2.75rem)] font-bold text-white mb-4" style={{ fontFamily: "'Outfit',sans-serif" }}>
            Não encontrou o que procurava?
          </h2>
          <p className="text-white/75 text-lg mb-8 max-w-xl mx-auto">
            Fale com um especialista e descubra a solução ideal para o seu negócio.
          </p>
          <Link to="/cliente">
            <button className="flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-[15px] mx-auto transition active:scale-95"
              style={{ background: '#fff', color: pc, boxShadow: '0 8px 28px rgba(0,0,0,.2)' }}>
              Falar com Especialista <ArrowRight style={{ width: 18, height: 18 }} />
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Solucoes;
