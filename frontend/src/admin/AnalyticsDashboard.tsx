// AnalyticsDashboard — painel de analytics do admin
import React, { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, Eye, Calendar, BarChart2, Globe, ArrowUp, ArrowDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const authH = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' });

interface AnalyticsData {
  // backend wraps totals in summary object
  summary?: {
    today?: number;
    yesterday?: number;
    views7?: number;
    views30?: number;
    viewsAll?: number;
    uniq7?: number;
    uniq30?: number;
    growthViews?: number;
  };
  topPages?: Array<{ page: string; views: number }>;
  sources?: Array<{ source: string; views: number }>;   // backend field is `views`
  daily?: Array<{ day: string; views: number; visitors?: number }>; // backend field is `day`
}

function StatCard({ label, value, icon, color, sub }: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  sub?: string;
}) {
  return (
    <div style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(0,0,0,.06)', padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {React.cloneElement(icon as React.ReactElement<{ size?: number; color?: string }>, { size: 22, color })}
      </div>
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.07em', margin: '0 0 4px' }}>{label}</p>
        <p style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', margin: '0 0 2px', fontFamily: "'Outfit',sans-serif", lineHeight: 1 }}>{value.toLocaleString()}</p>
        {sub && <p style={{ fontSize: 11, color: '#64748b', margin: 0, fontWeight: 500 }}>{sub}</p>}
      </div>
    </div>
  );
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/analytics`, { headers: authH() });
      if (!res.ok) throw new Error('Erro ao carregar analytics');
      const json = await res.json();
      setData(json);
    } catch {
      toast({ title: 'Erro ao carregar analytics', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const s = data?.summary ?? {};
  const today  = s.today    ?? 0;
  const last7  = s.views7   ?? 0;
  const last30 = s.views30  ?? 0;
  const growth = s.growthViews ?? 0;
  const topPages = data?.topPages ?? [];
  const sources  = data?.sources  ?? [];
  const daily    = data?.daily    ?? [];

  const maxViews = daily.length > 0 ? Math.max(...daily.map(d => d.views), 1) : 1;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Outfit', sans-serif" }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #f1f5f9', padding: '28px 32px 20px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: 0, fontFamily: "'Outfit',sans-serif" }}>
              Analytics
            </h1>
            <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0', fontWeight: 500 }}>
              Visão geral de tráfego e engajamento
            </p>
          </div>
          <button onClick={fetchData} disabled={loading}
            style={{ height: 38, padding: '0 16px', borderRadius: 10, background: '#f1f5f9', border: 'none', color: '#64748b', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Atualizar
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 16px 80px' }}>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
            <RefreshCw size={32} style={{ color: '#f97316', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
              <StatCard label="Visitas hoje" value={today} icon={<Eye />} color="#f97316" />
              <StatCard label="Últimos 7 dias" value={last7} icon={<Calendar />} color="#3b82f6" />
              <StatCard label="Últimos 30 dias" value={last30} icon={<BarChart2 />} color="#8b5cf6" />
              <StatCard
                label="Crescimento"
                value={`${growth >= 0 ? '+' : ''}${growth}%`}
                icon={growth >= 0 ? <ArrowUp /> : <ArrowDown />}
                color={growth >= 0 ? '#22c55e' : '#ef4444'}
                sub="vs. período anterior"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              {/* Daily chart */}
              <div style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(0,0,0,.06)', padding: 24, gridColumn: daily.length > 0 ? '1 / -1' : undefined }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                  <TrendingUp size={16} color="#f97316" />
                  <p style={{ fontSize: 13, fontWeight: 800, color: '#1d1d1f', margin: 0 }}>Visitas diárias</p>
                </div>
                {daily.length === 0 ? (
                  <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '32px 0' }}>Sem dados disponíveis</p>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 140, overflowX: 'auto' }}>
                    {daily.map((d, i) => {
                      const pct = (d.views / maxViews) * 100;
                      return (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: '0 0 auto', minWidth: 32 }}
                          title={`${d.date}: ${d.views} visitas`}>
                          <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>{d.views > 0 ? d.views : ''}</span>
                          <div style={{ width: 24, height: `${Math.max(4, pct)}%`, background: '#f97316', borderRadius: '4px 4px 0 0', opacity: 0.8, transition: 'opacity .15s', minHeight: 4 }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '0.8'} />
                          <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap', transform: 'rotate(-45deg)', transformOrigin: 'center', display: 'block' }}>
                            {d.day?.slice(5)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Top pages */}
              <div style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(0,0,0,.06)', padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Globe size={16} color="#3b82f6" />
                  <p style={{ fontSize: 13, fontWeight: 800, color: '#1d1d1f', margin: 0 }}>Páginas mais visitadas</p>
                </div>
                {topPages.length === 0 ? (
                  <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '24px 0' }}>Sem dados</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {topPages.slice(0, 10).map((p, i) => {
                      const maxP = topPages[0]?.views || 1;
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 11, fontWeight: 800, color: '#94a3b8', minWidth: 16, textAlign: 'right' }}>{i + 1}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', margin: '0 0 3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.page}</p>
                            <div style={{ height: 4, borderRadius: 2, background: '#f1f5f9', overflow: 'hidden' }}>
                              <div style={{ height: '100%', borderRadius: 2, background: '#3b82f6', width: `${(p.views / maxP) * 100}%`, transition: 'width .3s' }} />
                            </div>
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', flexShrink: 0 }}>{p.views.toLocaleString()}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Traffic sources */}
              <div style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(0,0,0,.06)', padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <BarChart2 size={16} color="#8b5cf6" />
                  <p style={{ fontSize: 13, fontWeight: 800, color: '#1d1d1f', margin: 0 }}>Fontes de tráfego</p>
                </div>
                {sources.length === 0 ? (
                  <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '24px 0' }}>Sem dados</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {sources.slice(0, 8).map((s, i) => {
                      const maxS = sources[0]?.views || 1;
                      const colors = ['#f97316', '#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ec4899', '#14b8a6', '#64748b'];
                      const c = colors[i % colors.length];
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: c, flexShrink: 0 }} />
                          <p style={{ flex: 1, fontSize: 12, fontWeight: 600, color: '#0f172a', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {s.source || 'Direto'}
                          </p>
                          <div style={{ width: 80, height: 4, borderRadius: 2, background: '#f1f5f9', overflow: 'hidden' }}>
                            <div style={{ height: '100%', borderRadius: 2, background: c, width: `${(s.views / maxS) * 100}%` }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', minWidth: 30, textAlign: 'right' }}>{s.views.toLocaleString()}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
