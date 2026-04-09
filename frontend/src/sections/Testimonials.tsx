import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type React from 'react';

import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { useData } from '@/context/DataContext';

const API_URL  = import.meta.env?.VITE_API_URL || 'http://localhost:3001/api';
const BASE_URL = API_URL.replace('/api', '');
const imgSrc   = (img: string) => img ? (img.startsWith('http') ? img : `${BASE_URL}${img}`) : '';

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();
}

export function Testimonials() {
  const { data, loading } = useData();
  const settings = data.settings || {};
  const content  = data.content || {};
  const pc = settings.primary_color || '#f97316';
  const sc = settings.secondary_color || '#fb923c';

  const list = useMemo(() =>
    (data.testimonials || [])
      .filter((t: any) => t.active === 1)
      .sort((a: any, b: any) => a.order_num - b.order_num),
    [data.testimonials]
  );

  const [cur, setCur]         = useState(0);
  const [animDir, setAnimDir] = useState<'left'|'right'|null>(null);
  const [visible, setVisible] = useState(true);
  const autoRef               = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback((d: 1|-1) => {
    if (!visible) return;
    setVisible(false);
    setAnimDir(d === 1 ? 'left' : 'right');
    setTimeout(() => {
      setCur(c => (c + d + list.length) % list.length);
      setAnimDir(d === 1 ? 'right' : 'left');
      setVisible(true);
    }, 280);
  }, [visible, list.length]);

  useEffect(() => {
    if (list.length <= 1) return;
    autoRef.current = setInterval(() => go(1), 6000);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [go, list.length]);

  // Reset cur when list changes
  useEffect(() => { setCur(0); }, [list.length]);

  if (loading || !list.length) return null;

  const t = list[cur];
  const slideStyle: React.CSSProperties = {
    transition: 'opacity 0.28s ease, transform 0.28s ease',
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateX(0)' : animDir === 'left' ? 'translateX(-20px)' : 'translateX(20px)',
  };

  return (
    <section className="py-32 relative overflow-hidden" style={{ background: 'var(--s1)' }}>
      <div style={{
        position: 'absolute', top: '-10%', right: '-5%', width: 500, height: 500,
        borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none',
        background: `radial-gradient(circle, ${pc}10 0%, transparent 65%)`,
      }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div data-reveal="up" className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
            style={{ background: `${pc}12`, color: pc, border: `1px solid ${pc}25` }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: pc }} />
            {content['testimonials.label'] || 'Depoimentos'}
          </div>
          <h2 style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 'clamp(1.9rem, 4vw, 3rem)',
            fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--t1)', lineHeight: 1.1,
          }}>
            {content['testimonials.title'] || 'O que nossos'}{' '}
            <span style={{ color: pc }}>{content['testimonials.subtitle'] || 'clientes dizem'}</span>
          </h2>
        </div>

        {/* Card */}
        <div style={{
          borderRadius: 28, overflow: 'hidden', background: 'var(--s0)',
          boxShadow: '0 24px 80px rgba(0,0,0,.09)',
        }}>
          <div style={{ height: 4, background: `linear-gradient(90deg, ${pc}, ${sc})` }} />
          <div style={{ padding: 'clamp(28px,5vw,52px)', minHeight: 260 }}>
            <div style={slideStyle}>
              <Quote style={{ width: 32, height: 32, color: `${pc}30`, marginBottom: 18 }} />
              <div style={{ display: 'flex', gap: 4, marginBottom: 18 }}>
                {Array.from({ length: t.rating || 5 }).map((_: unknown, i: number) => (
                  <Star key={i} style={{ width: 17, height: 17, color: '#f59e0b', fill: '#f59e0b' }} />
                ))}
              </div>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 'clamp(.95rem,2vw,1.15rem)', lineHeight: 1.75,
                color: '#3a3a3c', marginBottom: 28,
              }}>"{t.content}"</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                {t.author_photo ? (
                  <img src={imgSrc(t.author_photo)} alt={t.author_name}
                    style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${pc}30`, flexShrink: 0 }} />
                ) : (
                  <div style={{
                    width: 50, height: 50, borderRadius: '50%', flexShrink: 0,
                    background: `linear-gradient(135deg, ${pc}, ${sc})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 800, color: '#fff',
                  }}>{initials(t.author_name)}</div>
                )}
                <div>
                  <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 15, fontWeight: 800, color: 'var(--t1)' }}>{t.author_name}</p>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: 'var(--t3)', marginTop: 2 }}>
                    {t.author_role}{t.author_company ? ` · ${t.author_company}` : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {list.length > 1 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 28px 22px', borderTop: '1px solid rgba(0,0,0,.05)',
            }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {list.map((_: unknown, i: number) => (
                  <button key={i} onClick={() => { if (i !== cur) go(i > cur ? 1 : -1); }}
                    style={{
                      width: i === cur ? 22 : 7, height: 7, borderRadius: 99,
                      background: i === cur ? pc : 'rgba(0,0,0,.15)',
                      border: 'none', cursor: 'pointer', padding: 0,
                      transition: 'all 0.3s',
                    }} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {([[-1, ChevronLeft], [1, ChevronRight]] as const).map(([d, Ic]) => (
                  <button key={d} onClick={() => go(d)}
                    style={{
                      width: 38, height: 38, borderRadius: '50%',
                      border: '1.5px solid rgba(0,0,0,.1)', background: 'transparent',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--t3)', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = pc; el.style.borderColor = pc; el.style.color = '#fff'; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; el.style.borderColor = 'rgba(0,0,0,.1)'; el.style.color = '#6e6e73'; }}>
                    <Ic style={{ width: 17, height: 17 }} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Thumbnail strip */}
        {list.length > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
            {list.slice(0, 6).map((item: any, i: number) => (
              <button key={i} onClick={() => { if (i !== cur) go(i > cur ? 1 : -1); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '6px 12px', borderRadius: 99,
                  background: i === cur ? '#fff' : 'transparent',
                  border: `1.5px solid ${i === cur ? pc + '50' : 'rgba(0,0,0,.1)'}`,
                  cursor: 'pointer', transition: 'all 0.25s',
                  boxShadow: i === cur ? '0 4px 14px rgba(0,0,0,.07)' : 'none',
                }}>
                {item.author_photo ? (
                  <img src={imgSrc(item.author_photo)} style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: `linear-gradient(135deg, ${pc}, ${sc})`,
                    fontSize: 8, fontWeight: 800, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{initials(item.author_name)}</div>
                )}
                <span style={{
                  fontSize: 12, fontWeight: i === cur ? 700 : 500,
                  color: i === cur ? '#1d1d1f' : '#98989d',
                  fontFamily: "'DM Sans',sans-serif",
                }}>{item.author_name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
