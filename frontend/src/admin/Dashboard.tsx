// src/admin/Dashboard.tsx — Dashboard com analytics próprio

import { useEffect, useState } from 'react';
import type React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye, Users, TrendingUp, TrendingDown, BarChart3,
  Globe, Activity, MousePointer, Briefcase, Image,
  AlertCircle, CheckCircle, Settings, ChevronRight,
  ExternalLink, Mail, Clock, ArrowUpRight,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

type AnalyticsSummary = {
  views7: number; views30: number; viewsAll: number;
  uniq7: number; uniq30: number;
  today: number; yesterday: number; growthViews: number;
};
type DailyRow  = { day: string; views: number; visitors: number };
type PageRow   = { page: string; views: number };
type SourceRow = { source: string; views: number };
type Analytics = {
  summary: AnalyticsSummary;
  topPages: PageRow[];
  daily: DailyRow[];
  sources: SourceRow[];
};

function MiniBarChart({ data }: { data: DailyRow[] }) {
  if (!data.length) return (
    <div className="h-20 flex items-center justify-center text-[12px] text-gray-400">
      Sem dados ainda — visite o site para gerar estatísticas
    </div>
  );
  const max = Math.max(...data.map(d => d.views), 1);
  const last14 = data.slice(-14);
  return (
    <div className="flex items-end gap-1 h-20 px-1">
      {last14.map((d, i) => {
        const h = Math.max(4, Math.round((d.views / max) * 72));
        const isToday = i === last14.length - 1;
        return (
          <div key={d.day} className="flex-1 flex flex-col items-center group relative">
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
              {d.day.slice(5)}: {d.views} views
            </div>
            <div className="w-full rounded-t-sm" style={{ height: h, background: isToday ? 'linear-gradient(180deg,#f97316,#ea580c)' : 'linear-gradient(180deg,#e2e8f0,#cbd5e1)' }} />
          </div>
        );
      })}
    </div>
  );
}

function MetricCard({ label, value, sub, icon: Icon, color, growth, loading }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string; growth?: number; loading?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.12em]">{label}</span>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      {loading ? <div className="h-8 bg-gray-100 rounded-lg animate-pulse" /> : (
        <p className="text-2xl font-black text-gray-900" style={{ fontFamily: "'Outfit',sans-serif" }}>{value}</p>
      )}
      <div className="flex items-center gap-2">
        {growth !== undefined && !loading && (
          <span className={`flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-full ${growth >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
            {growth >= 0 ? <TrendingUp className="w-3 h-3"/> : <TrendingDown className="w-3 h-3"/>}
            {Math.abs(growth)}%
          </span>
        )}
        {sub && <span className="text-[11px] text-gray-400">{sub}</span>}
      </div>
    </div>
  );
}

export function Dashboard() {
  const { data, loading: dataLoading } = useData();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => { if (!isAuthenticated) navigate('/admin/login'); }, [isAuthenticated, navigate]);
  useEffect(() => { const t = setInterval(() => setCurrentTime(new Date()), 60000); return () => clearInterval(t); }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/admin/analytics`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setAnalytics(await res.json());
      } catch { /* silencioso */ }
      finally { setAnalyticsLoading(false); }
    })();
  }, [isAuthenticated]);

  const hour = currentTime.getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
  const s = analytics?.summary;

  const checklist = [
    { label: 'Dados da empresa configurados',  ok: !!(data.content?.['header.company']),                                         link: '/admin/configuracoes' },
    { label: 'WhatsApp configurado',            ok: !!(data.settings?.whatsapp_number),                                           link: '/admin/configuracoes' },
    { label: 'Pelo menos 1 banner ativo',       ok: (data.banners || []).some((b: any) => b.active === 1),                       link: '/admin/banners' },
    { label: 'Pelo menos 1 solução cadastrada', ok: (data.solutions || []).some((s: any) => s.active === 1),                     link: '/admin/solucoes' },
    { label: 'Logo do header configurado',      ok: !!(data.content?.['header.logo']),                                            link: '/admin/conteudo' },
    { label: 'SEO configurado',                 ok: !!(data.settings?.seo_site_name && data.settings?.seo_default_description),  link: '/admin/configuracoes' },
  ];
  const checklistDone = checklist.filter(c => c.ok).length;
  const checklistPct  = Math.round((checklistDone / checklist.length) * 100);
  const totalSources  = analytics?.sources.reduce((a, b) => a + b.views, 0) || 1;

  if (dataLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-[1300px] mx-auto space-y-6 pb-10">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-orange-500 mb-1">{greeting}, {user?.name?.split(' ')[0] || 'Admin'} 👋</p>
          <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "'Outfit',sans-serif" }}>Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {currentTime.toLocaleString('pt-BR', { weekday:'long', day:'numeric', month:'long', hour:'2-digit', minute:'2-digit' })}
          </p>
        </div>
        <button onClick={() => window.open('/', '_blank')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition hover:scale-[1.02]"
          style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', boxShadow: '0 6px 20px rgba(249,115,22,.3)' }}>
          <ExternalLink className="w-4 h-4" /> Ver Site
        </button>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Visitas hoje"       value={s?.today ?? '—'}  sub={`Ontem: ${s?.yesterday ?? '—'}`} icon={Eye}       color="#f97316" loading={analyticsLoading} />
        <MetricCard label="Visitas (7 dias)"   value={s?.views7 ?? '—'} sub="Páginas vistas"                 icon={BarChart3} color="#6366f1" loading={analyticsLoading} />
        <MetricCard label="Visitantes únicos"  value={s?.uniq30 ?? '—'} sub="Últimos 30 dias"                icon={Users}     color="#10b981" loading={analyticsLoading} />
        <MetricCard label="Total (30 dias)"    value={s?.views30 ?? '—'} sub="vs mês anterior"               icon={TrendingUp} color="#3b82f6" growth={s?.growthViews} loading={analyticsLoading} />
      </div>

      {/* Gráfico + Fontes */}
      <div className="grid lg:grid-cols-[1fr_300px] gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[13px] font-bold text-gray-900">Visitas por dia</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">Últimos 14 dias</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-gray-400">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{background:'#f97316'}}/> Hoje</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-slate-200 inline-block"/> Anteriores</span>
            </div>
          </div>
          {analyticsLoading ? <div className="h-20 bg-gray-50 rounded-xl animate-pulse" /> : <MiniBarChart data={analytics?.daily || []} />}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="text-[13px] font-bold text-gray-900 mb-1">Fontes de tráfego</h2>
          <p className="text-[11px] text-gray-400 mb-4">Últimos 30 dias</p>
          {analyticsLoading ? (
            <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-8 bg-gray-50 rounded-lg animate-pulse"/>)}</div>
          ) : analytics?.sources.length ? (
            <div className="space-y-3">
              {analytics.sources.map(src => {
                const pct = Math.round((src.views / totalSources) * 100);
                const colors: Record<string,string> = { 'Direto':'#f97316','Google':'#4285f4','Redes Sociais':'#e1306c','WhatsApp':'#25d366','Outros':'#94a3b8' };
                const c = colors[src.source] || '#94a3b8';
                return (
                  <div key={src.source}>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-semibold text-gray-700">{src.source}</span>
                      <span className="text-gray-400">{src.views} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width:`${pct}%`, background: c }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <p className="text-[12px] text-gray-400 text-center py-6">Visite o site para gerar dados</p>}
        </div>
      </div>

      {/* Top páginas + Status */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <MousePointer className="w-4 h-4 text-gray-400" />
            <h2 className="text-[13px] font-bold text-gray-900">Páginas mais acessadas</h2>
            <span className="text-[10px] text-gray-400 ml-auto">30 dias</span>
          </div>
          {analyticsLoading ? (
            <div className="space-y-2">{[1,2,3,4,5].map(i=><div key={i} className="h-9 bg-gray-50 rounded-lg animate-pulse"/>)}</div>
          ) : analytics?.topPages.length ? (
            <div className="space-y-1">
              {analytics.topPages.map((p, i) => {
                const maxV = analytics.topPages[0]?.views || 1;
                const pct = Math.round((p.views / maxV) * 100);
                return (
                  <div key={p.page} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition">
                    <span className="text-[11px] font-black text-gray-300 w-4 text-center">{i+1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-gray-700 truncate">{p.page === '/' ? 'Home' : p.page}</p>
                      <div className="h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                        <div className="h-full rounded-full" style={{width:`${pct}%`,background:'linear-gradient(90deg,#f97316,#fb923c)'}}/>
                      </div>
                    </div>
                    <span className="text-[12px] font-bold text-gray-500 flex-shrink-0">{p.views}</span>
                  </div>
                );
              })}
            </div>
          ) : <p className="text-[12px] text-gray-400 text-center py-8">Nenhum dado ainda</p>}
        </div>

        <div className="space-y-4">
          {/* Checklist */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[13px] font-bold text-gray-900">Status do site</h2>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${checklistPct>=100?'bg-emerald-50 text-emerald-600':'bg-amber-50 text-amber-600'}`}>{checklistPct}% pronto</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
              <div className="h-full rounded-full transition-all duration-700" style={{ width:`${checklistPct}%`, background: checklistPct>=100?'#10b981':'#f97316' }}/>
            </div>
            <div className="space-y-0.5">
              {checklist.map((item, i) => (
                <button key={i} onClick={() => !item.ok && navigate(item.link)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition ${!item.ok?'hover:bg-amber-50 cursor-pointer':'cursor-default'}`}>
                  {item.ok ? <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0"/> : <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0"/>}
                  <span className="text-[11.5px] text-gray-500 flex-1">{item.label}</span>
                  {!item.ok && <ChevronRight className="w-3 h-3 text-amber-400 flex-shrink-0"/>}
                </button>
              ))}
            </div>
          </div>

          {/* Atalhos */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="text-[13px] font-bold text-gray-900 mb-3">Atalhos</h2>
            <div className="space-y-0.5">
              {[
                { label: 'Editor da Home',      icon: Globe,      link: '/admin/home' },
                { label: 'Banners / Carrossel', icon: Image,      link: '/admin/banners' },
                { label: 'Soluções',            icon: Briefcase,  link: '/admin/solucoes' },
                { label: 'Leads & Contatos',    icon: Mail,       link: '/admin/leads' },
                { label: 'Configurações',       icon: Settings,   link: '/admin/configuracoes' },
              ].map(item => { const Icon = item.icon; return (
                <button key={item.label} onClick={() => navigate(item.link)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-gray-50 transition text-left">
                  <Icon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"/>
                  <span className="text-[12px] text-gray-600 font-medium flex-1">{item.label}</span>
                  <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0"/>
                </button>
              );})}
            </div>
          </div>
        </div>
      </div>

      {/* Aviso de dados zerados */}
      {!analyticsLoading && (!analytics || analytics.summary.viewsAll === 0) && (
        <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center">
          <Activity className="w-8 h-8 text-gray-300 mx-auto mb-2"/>
          <p className="text-[13px] font-semibold text-gray-500">Estatísticas ainda não disponíveis</p>
          <p className="text-[12px] text-gray-400 mt-1">Visite o site como visitante para começar a gerar dados de acesso.</p>
          <button onClick={() => window.open('/', '_blank')}
            className="mt-3 flex items-center gap-1.5 mx-auto text-[12px] font-bold text-orange-500 hover:text-orange-600 transition">
            <ArrowUpRight className="w-3.5 h-3.5"/> Abrir o site
          </button>
        </div>
      )}
    </div>
  );
}
