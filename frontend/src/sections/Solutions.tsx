import { useState, useRef } from 'react';
import type React from 'react';

import { createPortal } from 'react-dom';
import {
  Building2, Monitor, ShoppingCart, CreditCard, Truck, BarChart3,
  ArrowRight, ChevronLeft, ChevronRight, Globe, Settings, Zap,
  Package, Star, Layers, FileText, X, Check, Phone, ExternalLink,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Link, useNavigate } from 'react-router-dom';
import { fetchSolutionPageBySlug } from '@/services/solutionPagesService';
import type { SolutionPage } from '@/types';

const ICON_MAP: Record<string, React.ElementType> = {
  Building2, Monitor, ShoppingCart, CreditCard, Truck, BarChart3,
  Globe, Settings, Zap, Package, Star, Layers, FileText,
};

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace('/api', '');
const resolveImg = (p?: string) => !p ? null : p.startsWith('http') ? p : `${BASE_URL}${p}`;

const GRADIENTS = [
  ['#1e3a5f', '#2563eb'], ['#7c2d12', '#c2410c'], ['#14532d', '#16a34a'],
  ['#4a044e', '#9333ea'], ['#0f2744', '#0284c7'], ['#431407', '#dc2626'],
  ['#1a1a2e', '#6c4bce'], ['#064e3b', '#059669'],
];

const COLOR_MAP: Record<string, string> = {
  orange: '#f97316', blue: '#2563eb', green: '#16a34a',
  purple: '#9333ea', black: '#1f2937', white: '#6b7280',
};

// ── Modal ─────────────────────────────────────────────────────────────────
function Modal({ sol, page, loading, primaryColor, onClose, onViewPage }: {
  sol: any; page: SolutionPage | null; loading: boolean;
  primaryColor: string; onClose: () => void; onViewPage: () => void;
}) {
  const Icon = ICON_MAP[sol.icon] || Building2;
  const photo = resolveImg(sol.image);
  const themeColor = page ? (COLOR_MAP[page.color_theme] || primaryColor) : primaryColor;

  const modal = (
    <div
      className="sol-modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="sol-modal-sheet">
        {/* Hero */}
        <div style={{ position: 'relative', height: 200, flexShrink: 0 }}>
          {photo
            ? <img src={photo} alt={sol.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg,${GRADIENTS[0][0]},${GRADIENTS[0][1]})` }} />
          }
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(0,0,0,.75) 0%,rgba(0,0,0,.1) 60%)' }} />
          <button onClick={onClose} className="sol-modal-close">
            <X style={{ width: 16, height: 16, color: '#fff' }} />
          </button>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px', display: 'flex', alignItems: 'flex-end', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'rgba(255,255,255,.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,.35)' }}>
              <Icon style={{ width: 22, height: 22, color: '#fff' }} />
            </div>
            <div>
              <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 2, fontFamily: "'DM Sans',sans-serif" }}>Solução Unimaxx</p>
              <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 20, lineHeight: 1.2, fontFamily: "'Outfit',sans-serif" }}>{sol.title}</h2>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
              <div className="sol-spinner" style={{ borderTopColor: primaryColor }} />
            </div>
          ) : (
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
              {((page as any)?.subtitle || (page as any)?.description || sol.description) && (
                <div>
                  {(page as any)?.subtitle && <p style={{ fontWeight: 700, color: '#1d1d1f', fontSize: 15, marginBottom: 6, fontFamily: "'Outfit',sans-serif" }}>{(page as any).subtitle}</p>}
                  <p style={{ color: '#6e6e73', fontSize: 14, lineHeight: 1.6 }}>{(page as any)?.description || sol.description}</p>
                </div>
              )}
              {(page as any)?.stats_json && (page as any).stats_json.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {(page as any).stats_json.slice(0, 4).map((s: any, i: number) => (
                    <div key={i} style={{ borderRadius: 16, padding: '14px 12px', textAlign: 'center', background: `${themeColor}08`, border: `1px solid ${themeColor}18` }}>
                      <p style={{ fontWeight: 700, fontSize: 22, marginBottom: 2, color: themeColor, fontFamily: "'Outfit',sans-serif" }}>{s.value}</p>
                      <p style={{ fontSize: 12, color: '#6e6e73' }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              )}
              {((page as any)?.features || sol.features)?.length > 0 && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#98989d', marginBottom: 10 }}>
                    {(page as any)?.features_title || 'Funcionalidades'}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 8 }}>
                    {((page as any)?.features || sol.features).map((f: string, i: number) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: 12, borderRadius: 12, background: '#f5f5f7' }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, background: `${themeColor}15` }}>
                          <Check style={{ width: 11, height: 11, color: themeColor }} />
                        </div>
                        <span style={{ fontSize: 13, color: 'rgba(29,29,31,.8)', lineHeight: 1.4 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {((page as any)?.benefits?.length ?? 0) > 0 && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#98989d', marginBottom: 10 }}>
                    {(page as any)?.benefits_title || 'Resultados'}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {(page as any)?.benefits?.map((b: any, i: number) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: `${themeColor}07`, border: `1px solid ${themeColor}15` }}>
                        <Star style={{ width: 14, height: 14, flexShrink: 0, color: themeColor, fill: themeColor }} />
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#1d1d1f' }}>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {((page as any)?.integrations?.length ?? 0) > 0 && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#98989d', marginBottom: 10 }}>Integrações</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {(page as any)?.integrations?.map((int: any, i: number) => (
                      <span key={i} style={{ padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 500, background: '#f5f5f7', color: '#1d1d1f' }}>{int}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* CTA */}
        <div style={{ flexShrink: 0, padding: 16, display: 'flex', gap: 10, borderTop: '1px solid rgba(0,0,0,.06)' }}>
          <Link to="/cliente" style={{ flex: 1 }} onClick={onClose}>
            <button style={{ width: '100%', padding: '12px 0', borderRadius: 16, fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: themeColor, color: '#fff', border: 'none', cursor: 'pointer', boxShadow: `0 8px 20px ${themeColor}35` }}>
              <Phone style={{ width: 16, height: 16 }} />
              {(page as any)?.cta_button_label || 'Falar com Especialista'}
            </button>
          </Link>
          <button onClick={onViewPage}
            style={{ flex: 1, padding: '12px 0', borderRadius: 16, fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#f5f5f7', color: '#1d1d1f', border: 'none', cursor: 'pointer' }}>
            <ExternalLink style={{ width: 16, height: 16 }} /> Ver página completa
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

// ── Card ──────────────────────────────────────────────────────────────────
function SolCard({ sol, index, pc, onClick }: {
  sol: any; index: number; pc: string; onClick: () => void;
}) {
  const Icon = ICON_MAP[sol.icon] || Building2;
  const photo = resolveImg(sol.image);
  const [c1, c2] = GRADIENTS[index % GRADIENTS.length];

  return (
    <div className="sol-card" onClick={onClick}>
      <div className="sol-card-inner">
        {photo
          ? <img src={photo} alt={sol.title} className="sol-card-bg-img" />
          : <div className="sol-card-bg-grad" style={{ background: `linear-gradient(165deg,${c1} 0%,${c2} 100%)` }} />
        }
        <div className="sol-card-overlay" />

        {/* ícone — some no hover */}
        <div className="sol-card-icon">
          <Icon style={{ width: 30, height: 30, color: '#fff' }} />
        </div>

        {/* título central — aparece no hover */}
        <div className="sol-card-hover-title">
          <span>{sol.title}</span>
        </div>

        <div className="sol-card-bottom">
          <p className="sol-card-name">{sol.title}</p>
          <button className="sol-card-btn" style={{ background: pc, boxShadow: `0 4px 14px ${pc}50` }}>
            {sol.cta_text || 'Confira'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Section ──────────────────────────────────────────────────────────
export function Solutions() {
  const { data, loading } = useData();
  const navigate = useNavigate();
  const solutions = (data.solutions || []).filter((s: any) => s.active === 1);
  const content = data.content || {};
  const pc = data.settings?.primary_color || '#f97316';
  const sc = data.settings?.secondary_color || '#fb923c';

  const trackRef = useRef<HTMLDivElement>(null);
  const [activeSol, setActiveSol] = useState<any>(null);
  const [activePage, setActivePage] = useState<SolutionPage | null>(null);
  const [pageLoading, setPageLoading] = useState(false);

  const scroll = (d: 1 | -1) => trackRef.current?.scrollBy({ left: d * 440, behavior: 'smooth' });

  const openModal = async (sol: any) => {
    setActiveSol(sol); setActivePage(null); setPageLoading(true);
    try { setActivePage(await fetchSolutionPageBySlug(sol.solution_id)); } catch { /* ok */ }
    finally { setPageLoading(false); }
  };

  if (loading || !solutions.length) return null;

  const useCarousel = solutions.length > 4;

  return (
    <section id="solucoes" className="sol-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        {useCarousel ? (
          /* Carousel header: title left, desc+arrows right */
          <div data-reveal="up" className="sol-header-row">
            <div>
              <div className="sol-label" style={{ background: `${pc}12`, color: pc }}>
                <span className="sol-dot" style={{ background: pc }} />
                {content['solutions.label'] || 'Portfólio Completo'}
              </div>
              <h2 className="sol-title">{content['solutions.title'] || 'Nossas Soluções'}</h2>
            </div>
            <div className="sol-header-right">
              <p className="sol-desc">{content['solutions.description'] || 'Tecnologia especializada para o varejo.'}</p>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                {([-1, 1] as const).map((d) => (
                  <button key={d} onClick={() => scroll(d)}
                    className="sol-arrow-btn"
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = pc; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,.1)'; }}>
                    {d === -1 ? <ChevronLeft style={{ width: 16, height: 16 }} /> : <ChevronRight style={{ width: 16, height: 16 }} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Grid header: everything centered */
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="sol-label" style={{ background: `${pc}12`, color: pc }}>
              <span className="sol-dot" style={{ background: pc }} />
              {content['solutions.label'] || 'Portfólio Completo'}
            </div>
            <h2 className="sol-title" style={{ marginBottom: 16 }}>
              {content['solutions.title'] || 'Nossas Soluções'}
            </h2>
            <p style={{ color: 'var(--t3)', fontSize: 16, maxWidth: 480, margin: '0 auto', fontFamily: "'DM Sans',sans-serif", lineHeight: 1.6 }}>
              {content['solutions.description'] || 'Tecnologia especializada para o varejo.'}
            </p>
          </div>
        )}

        {/* ── Cards ── */}
        {useCarousel ? (
          /* Scrollable carousel */
          <div style={{ position: 'relative', margin: '0 -16px' }}>
            <div className="sol-fade-l" />
            <div className="sol-fade-r" />
            <div ref={trackRef} className="sol-track">
              {solutions.map((sol: any, i: number) => (
                <SolCard key={sol.solution_id} sol={sol} index={i} pc={pc} onClick={() => openModal(sol)} />
              ))}
            </div>
          </div>
        ) : (
          /* Centered grid — 1 col mobile, 2 cols sm, up to 4 cols */
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(solutions.length, 4)}, 220px)`,
            gap: 24,
            justifyContent: 'center',
            marginBottom: 8,
          }}
            className="sol-grid-responsive">
            {solutions.map((sol: any, i: number) => (
              <SolCard key={sol.solution_id} sol={sol} index={i} pc={pc} onClick={() => openModal(sol)} />
            ))}
          </div>
        )}

        {/* ── Ver todas ── */}
        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <Link to="/solucoes" className="sol-view-all btn-apple"
            style={{ background: `linear-gradient(135deg,${pc},${sc})`, boxShadow: `0 12px 36px ${pc}30` }}>
            {content['solutions.viewAll'] || 'Ver Todas as Soluções'}
            <ArrowRight style={{ width: 16, height: 16 }} />
          </Link>
        </div>
      </div>

      {activeSol && (
        <Modal
          sol={activeSol} page={activePage} loading={pageLoading} primaryColor={pc}
          onClose={() => { setActiveSol(null); setActivePage(null); }}
          onViewPage={() => {
            setActiveSol(null);
            navigate(activeSol.nav_link || `/solucao-page/${activeSol.solution_id}`);
          }}
        />
      )}
    </section>
  );
}