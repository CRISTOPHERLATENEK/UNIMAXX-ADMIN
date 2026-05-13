import React, { useState, useEffect } from 'react';
import { Plus, Trash2, RefreshCw, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const authH = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' });

interface Redirect {
  id: number;
  from_path: string;
  to_path: string;
  status_code: number;
  active: number;
  hits: number;
  created_at: string;
}

export function RedirectsManager() {
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [code, setCode] = useState<301 | 302>(301);
  const [adding, setAdding] = useState(false);
  const { toast } = useToast();

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/redirects`, { headers: authH() });
      const data = await res.json();
      setRedirects(Array.isArray(data) ? data : []);
    } catch {
      toast({ title: 'Erro ao carregar redirects', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAdd = async () => {
    if (!from.trim() || !to.trim()) {
      toast({ title: 'Preencha o caminho de origem e destino', variant: 'destructive' });
      return;
    }
    setAdding(true);
    try {
      const res = await fetch(`${API_URL}/admin/redirects`, {
        method: 'POST',
        headers: authH(),
        body: JSON.stringify({ from_path: from.trim(), to_path: to.trim(), status_code: code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Erro ao criar redirect');
      toast({ title: '✅ Redirect criado!' });
      setFrom('');
      setTo('');
      setCode(301);
      await fetchAll();
    } catch (e: any) {
      toast({ title: e?.message || 'Erro ao criar redirect', variant: 'destructive' });
    } finally {
      setAdding(false);
    }
  };

  const handleToggleActive = async (r: Redirect) => {
    try {
      const res = await fetch(`${API_URL}/admin/redirects/${r.id}`, {
        method: 'PUT',
        headers: authH(),
        body: JSON.stringify({ ...r, active: r.active ? 0 : 1 }),
      });
      if (!res.ok) throw new Error('Erro ao atualizar');
      setRedirects(prev => prev.map(x => x.id === r.id ? { ...x, active: r.active ? 0 : 1 } : x));
    } catch {
      toast({ title: 'Erro ao atualizar redirect', variant: 'destructive' });
    }
  };

  const handleDelete = async (r: Redirect) => {
    if (!confirm(`Excluir redirect "${r.from_path}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/admin/redirects/${r.id}`, { method: 'DELETE', headers: authH() });
      if (!res.ok) throw new Error('Erro ao excluir');
      toast({ title: 'Redirect excluído.' });
      setRedirects(prev => prev.filter(x => x.id !== r.id));
    } catch {
      toast({ title: 'Erro ao excluir redirect', variant: 'destructive' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #f1f5f9', padding: '28px 32px 20px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: 0, fontFamily: "'Outfit',sans-serif" }}>
            Redirects
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0', fontWeight: 500 }}>
            Gerencie redirecionamentos de URL (301 / 302)
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 32px 64px' }}>

        {/* Add form */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f1f5f9', padding: 24, marginBottom: 24 }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '0 0 16px', fontFamily: "'Outfit',sans-serif" }}>
            ➕ Novo Redirect
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: 12, alignItems: 'end' }}>
            <div>
              <Label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.04em', display: 'block', marginBottom: 6 }}>De (path)</Label>
              <Input
                value={from}
                onChange={e => setFrom(e.target.value)}
                placeholder="/caminho-antigo"
                className="h-10"
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
              />
            </div>
            <div>
              <Label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.04em', display: 'block', marginBottom: 6 }}>Para (URL ou path)</Label>
              <Input
                value={to}
                onChange={e => setTo(e.target.value)}
                placeholder="/novo-caminho ou https://..."
                className="h-10"
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
              />
            </div>
            <div>
              <Label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.04em', display: 'block', marginBottom: 6 }}>Código</Label>
              <select
                value={code}
                onChange={e => setCode(Number(e.target.value) as 301 | 302)}
                style={{ height: 40, borderRadius: 10, border: '1px solid rgba(0,0,0,.1)', padding: '0 10px', fontSize: 13, fontFamily: 'inherit', outline: 'none', background: '#fff', color: '#0f172a' }}>
                <option value={301}>301 — Permanente</option>
                <option value={302}>302 — Temporário</option>
              </select>
            </div>
            <button
              onClick={handleAdd}
              disabled={adding}
              style={{ height: 40, padding: '0 18px', borderRadius: 10, background: adding ? '#fbd38d' : '#f97316', border: 'none', color: '#fff', cursor: adding ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
              {adding ? <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={13} />}
              Adicionar
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f1f5f9', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
              <RefreshCw size={24} style={{ color: '#f97316', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : redirects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <ArrowRight size={40} style={{ color: '#e2e8f0', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 15, fontWeight: 700, color: '#64748b', margin: 0 }}>Nenhum redirect configurado</p>
              <p style={{ fontSize: 13, color: '#94a3b8', margin: '6px 0 0' }}>Adicione um redirect acima para começar.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                  {['De', 'Para', 'Código', 'Ativo', 'Visitas', 'Ações'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.04em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {redirects.map((r, i) => (
                  <tr key={r.id} style={{ borderBottom: i < redirects.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <code style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', background: '#f1f5f9', padding: '3px 7px', borderRadius: 6 }}>{r.from_path}</code>
                    </td>
                    <td style={{ padding: '14px 16px', maxWidth: 220 }}>
                      <span style={{ fontSize: 13, color: '#3b82f6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{r.to_path}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99, background: r.status_code === 301 ? '#dcfce7' : '#eff6ff', color: r.status_code === 301 ? '#15803d' : '#2563eb' }}>
                        {r.status_code}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <Switch checked={!!r.active} onCheckedChange={() => handleToggleActive(r)} />
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>{r.hits}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button
                        onClick={() => handleDelete(r)}
                        style={{ width: 32, height: 32, borderRadius: 8, background: '#f8fafc', border: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', transition: 'all .15s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fef2f2'; (e.currentTarget as HTMLElement).style.color = '#ef4444'; (e.currentTarget as HTMLElement).style.borderColor = '#fecaca'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; (e.currentTarget as HTMLElement).style.color = '#cbd5e1'; (e.currentTarget as HTMLElement).style.borderColor = '#f1f5f9'; }}
                        title="Excluir">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default RedirectsManager;
