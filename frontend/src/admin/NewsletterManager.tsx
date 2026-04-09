import { useState, useEffect, useCallback } from 'react';
import type React from 'react';

import {
  Mail, Trash2, Download, RefreshCw, Search,
  UserCheck, UserX, Users, TrendingUp, CheckCircle, X,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Subscriber {
  id: number;
  email: string;
  name: string;
  source: string;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

function timeAgo(date: string) {
  const d = new Date(date);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60)    return 'agora';
  if (diff < 3600)  return `${Math.floor(diff / 60)}min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d atrás`;
  return d.toLocaleDateString('pt-BR');
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: number | string; color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border p-5 flex items-center gap-4"
      style={{ borderColor: 'rgba(0,0,0,.07)' }}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}12` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold text-[#1d1d1f]" style={{ fontFamily: "'Outfit',sans-serif" }}>{value}</p>
        <p className="text-xs text-[#98989d]">{label}</p>
      </div>
    </div>
  );
}

export function NewsletterManager() {
  const { toast } = useToast();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [total, setTotal]             = useState(0);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [filter, setFilter]           = useState<'all' | 'active' | 'unsub'>('all');
  const [page, setPage]               = useState(1);
  const [deleting, setDeleting]       = useState<number | null>(null);

  const token   = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const limit   = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page), limit: String(limit),
        ...(search  ? { search }  : {}),
        ...(filter !== 'all' ? { status: filter } : {}),
      });
      const r = await fetch(`${API_URL}/admin/newsletter?${params}`, { headers });
      if (!r.ok) throw new Error();
      const data = await r.json();
      setSubscribers(data.subscribers || []);
      setTotal(data.total || 0);
    } catch {
      toast({ title: 'Erro ao carregar inscritos', variant: 'destructive' });
    } finally { setLoading(false); }
  }, [page, search, filter]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, filter]);

  const handleDelete = async (id: number) => {
    if (!confirm('Remover este inscrito permanentemente?')) return;
    setDeleting(id);
    try {
      await fetch(`${API_URL}/admin/newsletter/${id}`, { method: 'DELETE', headers });
      setSubscribers(s => s.filter(x => x.id !== id));
      setTotal(t => t - 1);
      toast({ title: 'Inscrito removido.' });
    } catch {
      toast({ title: 'Erro ao remover', variant: 'destructive' });
    } finally { setDeleting(null); }
  };

  const handleUnsub = async (id: number) => {
    try {
      await fetch(`${API_URL}/admin/newsletter/${id}/unsubscribe`, { method: 'PATCH', headers });
      setSubscribers(s => s.map(x => x.id === id ? { ...x, unsubscribed_at: new Date().toISOString() } : x));
      toast({ title: 'Inscrito cancelado.' });
    } catch {
      toast({ title: 'Erro', variant: 'destructive' });
    }
  };

  const exportCSV = () => {
    window.open(`${API_URL}/admin/newsletter/export`, '_blank');
  };

  const activeCount = subscribers.filter(s => !s.unsubscribed_at).length;
  const unsubCount  = subscribers.filter(s =>  s.unsubscribed_at).length;
  const totalPages  = Math.ceil(total / limit);

  const pc = '#f97316';

  return (
    <div className="min-h-full bg-[#fafafa]">

      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex items-center gap-3"
        style={{ borderColor: 'rgba(0,0,0,.07)' }}>
        <div className="flex-1">
          <h1 className="font-bold text-[#1d1d1f] text-xl" style={{ fontFamily: "'Outfit',sans-serif" }}>
            Newsletter
          </h1>
          <p className="text-xs text-[#98989d] mt-0.5">{total} inscrito{total !== 1 ? 's' : ''} no total</p>
        </div>
        <button onClick={load} disabled={loading}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-[#98989d] hover:bg-gray-100 transition">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
        <button onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium text-[#6e6e73] hover:bg-gray-50 transition"
          style={{ borderColor: 'rgba(0,0,0,.12)' }}>
          <Download size={14} /> Exportar CSV
        </button>
      </div>

      <div className="p-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users}     label="Total"      value={total}       color="#6366f1" />
          <StatCard icon={UserCheck} label="Ativos"     value={subscribers.filter(s => !s.unsubscribed_at).length} color="#22c55e" />
          <StatCard icon={UserX}     label="Cancelados" value={subscribers.filter(s =>  s.unsubscribed_at).length} color="#ef4444" />
          <StatCard icon={TrendingUp} label="Hoje"      value={subscribers.filter(s => new Date(s.subscribed_at).toDateString() === new Date().toDateString()).length} color={pc} />
        </div>

        {/* Filtros + busca */}
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(0,0,0,.07)' }}>
          <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'rgba(0,0,0,.06)' }}>
            {/* Busca */}
            <div className="flex items-center gap-2 flex-1 max-w-xs">
              <Search size={13} className="text-[#98989d] flex-shrink-0" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por email..."
                className="flex-1 text-sm bg-transparent outline-none text-[#1d1d1f] placeholder:text-[#c0c0c0]" />
              {search && <button onClick={() => setSearch('')}><X size={12} className="text-[#98989d]" /></button>}
            </div>

            {/* Filtros */}
            <div className="flex gap-1 ml-auto">
              {([['all','Todos'], ['active','Ativos'], ['unsub','Cancelados']] as const).map(([v, l]) => (
                <button key={v} onClick={() => setFilter(v)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition"
                  style={{
                    background: filter === v ? pc : 'transparent',
                    color: filter === v ? '#fff' : '#6e6e73',
                  }}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Lista */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw size={20} className="animate-spin text-[#98989d]" />
            </div>
          ) : subscribers.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center px-6">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
                <Mail size={22} className="text-orange-400" />
              </div>
              <p className="font-semibold text-[#1d1d1f] mb-1">Nenhum inscrito</p>
              <p className="text-sm text-[#98989d]">
                {search ? 'Nenhum resultado para esta busca' : 'Os inscritos do rodapé aparecerão aqui'}
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y" style={{ borderColor: 'rgba(0,0,0,.05)' }}>
                {subscribers.map(sub => (
                  <div key={sub.id} className="flex items-center gap-4 px-5 py-3.5 group hover:bg-gray-50 transition-colors">

                    {/* Avatar com inicial */}
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
                      style={{
                        background: sub.unsubscribed_at ? '#f3f4f6' : `${pc}15`,
                        color: sub.unsubscribed_at ? '#9ca3af' : pc,
                      }}>
                      {sub.email[0].toUpperCase()}
                    </div>

                    {/* Email + info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-[#1d1d1f] truncate">{sub.email}</p>
                        {sub.unsubscribed_at ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-500">cancelado</span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-600">ativo</span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#98989d] mt-0.5">
                        {sub.source || 'rodapé'} · {timeAgo(sub.subscribed_at)}
                      </p>
                    </div>

                    {/* Data */}
                    <p className="text-xs text-[#98989d] flex-shrink-0 hidden sm:block">
                      {new Date(sub.subscribed_at).toLocaleDateString('pt-BR')}
                    </p>

                    {/* Ações */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      {!sub.unsubscribed_at && (
                        <button onClick={() => handleUnsub(sub.id)} title="Cancelar inscrição"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#98989d] hover:text-amber-500 hover:bg-amber-50 transition">
                          <UserX size={14} />
                        </button>
                      )}
                      <button onClick={() => handleDelete(sub.id)} title="Remover"
                        disabled={deleting === sub.id}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[#98989d] hover:text-red-500 hover:bg-red-50 transition">
                        {deleting === sub.id ? <RefreshCw size={13} className="animate-spin" /> : <Trash2 size={13} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: 'rgba(0,0,0,.05)', background: 'rgba(0,0,0,.01)' }}>
                  <p className="text-xs text-[#98989d]">
                    Mostrando {(page - 1) * limit + 1}–{Math.min(page * limit, total)} de {total}
                  </p>
                  <div className="flex gap-1">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#6e6e73] hover:bg-gray-100 disabled:opacity-30 transition">
                      ← Anterior
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const pg = page <= 3 ? i + 1 : page - 2 + i;
                      if (pg > totalPages) return null;
                      return (
                        <button key={pg} onClick={() => setPage(pg)}
                          className="w-7 h-7 rounded-lg text-xs font-medium transition"
                          style={{ background: pg === page ? pc : 'transparent', color: pg === page ? '#fff' : '#6e6e73' }}>
                          {pg}
                        </button>
                      );
                    })}
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#6e6e73] hover:bg-gray-100 disabled:opacity-30 transition">
                      Próxima →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Info */}
        <div className="flex items-start gap-3 p-4 rounded-xl text-xs text-blue-700 bg-blue-50 border border-blue-100">
          <CheckCircle size={14} className="flex-shrink-0 mt-0.5" />
          <p>
            Inscrições vêm do formulário de newsletter do rodapé do site. 
            Emails são salvos automaticamente quando o visitante confirma. 
            Use <strong>Exportar CSV</strong> para importar em ferramentas de e-mail marketing como Mailchimp, RD Station ou Brevo.
          </p>
        </div>

      </div>
    </div>
  );
}
