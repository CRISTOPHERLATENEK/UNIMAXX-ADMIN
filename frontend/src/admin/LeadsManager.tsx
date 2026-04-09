import { useState, useEffect } from 'react';
import { Mail, Phone, Tag, MessageSquare, Trash2, RefreshCw, Eye, EyeOff, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Lead {
  id: number; name: string; phone: string; email: string;
  segment: string; message: string; company: string; subject: string;
  read_at: string | null; created_at: string;
}

function timeAgo(date: string) {
  const d = new Date(date);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'agora';
  if (diff < 3600) return `${Math.floor(diff/60)}min atrás`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h atrás`;
  return d.toLocaleDateString('pt-BR');
}

export function LeadsManager() {
  const { toast } = useToast();
  const [leads, setLeads]     = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [filter, setFilter]   = useState<'all'|'unread'|'read'>('all');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_URL}/admin/leads`, { headers });
      if (!r.ok) throw new Error('Erro');
      const data = await r.json();
      setLeads(Array.isArray(data) ? data : []);
    } catch { setLeads([]); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: number) => {
    await fetch(`${API_URL}/admin/leads/${id}/read`, { method: 'PATCH', headers });
    setLeads(l => l.map(x => x.id === id ? { ...x, read_at: new Date().toISOString() } : x));
  };

  const del = async (id: number) => {
    if (!confirm('Excluir este lead?')) return;
    await fetch(`${API_URL}/admin/leads/${id}`, { method: 'DELETE', headers });
    setLeads(l => l.filter(x => x.id !== id));
    if (selected?.id === id) setSelected(null);
    toast({ title: 'Lead excluído' });
  };

  const exportCSV = () => {
    const rows = [['Nome','Telefone','Email','Segmento','Mensagem','Data']];
    leads.forEach(l => rows.push([l.name, l.phone, l.email, l.segment, l.message, l.created_at]));
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `leads-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  const filtered = leads.filter(l =>
    filter === 'all' ? true : filter === 'unread' ? !l.read_at : !!l.read_at
  );
  const unread = leads.filter(l => !l.read_at).length;

  return (
    <div className="min-h-full bg-[#f5f5f7]">
      {/* Header */}
      <div className="bg-white border-b px-5 py-4 flex items-center justify-between sticky top-0 z-10"
        style={{ borderColor: 'rgba(0,0,0,.07)' }}>
        <div>
          <h1 className="font-bold text-[#1d1d1f] text-[15px]">Leads & Contatos</h1>
          <p className="text-xs text-[#98989d] mt-0.5">{leads.length} total · {unread} não lidos</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-500">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold text-gray-600 hover:bg-gray-50 transition" style={{ borderColor: 'rgba(0,0,0,.1)' }}>
            <Download className="w-3.5 h-3.5" /> Exportar CSV
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-120px)]">
        {/* List */}
        <div className="w-80 flex-shrink-0 border-r bg-white overflow-y-auto" style={{ borderColor: 'rgba(0,0,0,.07)' }}>
          {/* Filter tabs */}
          <div className="flex border-b px-3 pt-3 gap-1" style={{ borderColor: 'rgba(0,0,0,.07)' }}>
            {(['all','unread','read'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-3 py-2 text-xs font-semibold rounded-lg transition mb-2"
                style={filter === f ? { background: '#f97316', color: '#fff' } : { color: '#6e6e73' }}>
                {f === 'all' ? 'Todos' : f === 'unread' ? `Não lidos${unread > 0 ? ` (${unread})` : ''}` : 'Lidos'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-300" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Mail className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">Nenhum lead encontrado</p>
            </div>
          ) : (
            filtered.map(lead => (
              <div key={lead.id}
                onClick={() => { setSelected(lead); if (!lead.read_at) markRead(lead.id); }}
                className="p-4 border-b cursor-pointer transition-colors"
                style={{
                  borderColor: 'rgba(0,0,0,.05)',
                  background: selected?.id === lead.id ? '#fff7ed' : lead.read_at ? '#fff' : '#fffbf5',
                  borderLeft: selected?.id === lead.id ? '3px solid #f97316' : lead.read_at ? 'none' : '3px solid #fcd34d',
                }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {!lead.read_at && <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />}
                      <p className="text-sm font-bold text-[#1d1d1f] truncate">{lead.name}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{lead.phone}</p>
                    {lead.message && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{lead.message}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 flex-shrink-0 mt-0.5">{timeAgo(lead.created_at)}</span>
                </div>
                {lead.segment && (
                  <span className="mt-2 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-orange-600">{lead.segment}</span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Detail */}
        <div className="flex-1 overflow-y-auto">
          {selected ? (
            <div className="max-w-xl mx-auto p-6 space-y-4">
              <div className="bg-white rounded-2xl border p-6 space-y-4" style={{ borderColor: 'rgba(0,0,0,.07)' }}>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-bold text-xl text-[#1d1d1f]">{selected.name}</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(selected.created_at).toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { markRead(selected.id); setSelected({ ...selected, read_at: new Date().toISOString() }); }}
                      className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-400" title="Marcar como lido">
                      {selected.read_at ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button onClick={() => del(selected.id)} className="p-2 rounded-xl hover:bg-red-50 transition text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {[
                  { icon: Phone, label: 'Telefone', value: selected.phone, href: `tel:${selected.phone}` },
                  { icon: Mail, label: 'E-mail', value: selected.email, href: `mailto:${selected.email}` },
                  { icon: Tag, label: 'Segmento', value: selected.segment },
                ].filter(f => f.value).map(({ icon: Ic, label, value, href }) => (
                  <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <Ic className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                      {href
                        ? <a href={href} className="text-sm font-medium text-[#f97316] hover:underline">{value}</a>
                        : <p className="text-sm font-medium text-[#1d1d1f]">{value}</p>}
                    </div>
                  </div>
                ))}

                {selected.message && (
                  <div className="p-4 rounded-xl bg-gray-50 border" style={{ borderColor: 'rgba(0,0,0,.06)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mensagem</p>
                    </div>
                    <p className="text-sm text-[#3a3a3c] leading-relaxed">{selected.message}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  {selected.phone && (
                    <a href={`https://wa.me/${selected.phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
                      className="flex-1 text-center py-2.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
                      style={{ background: '#25d366' }}>
                      WhatsApp
                    </a>
                  )}
                  {selected.email && (
                    <a href={`mailto:${selected.email}`}
                      className="flex-1 text-center py-2.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
                      style={{ background: '#f97316' }}>
                      Enviar E-mail
                    </a>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <Mail className="w-14 h-14 text-gray-200 mb-4" />
              <p className="font-semibold text-gray-400">Selecione um lead para ver os detalhes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
