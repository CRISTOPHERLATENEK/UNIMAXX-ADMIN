import { useState } from 'react';
import { Plus, Trash2, Save, TrendingUp, Check, ArrowUp, ArrowDown } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { NumberStat } from '@/types';
import { Button } from '@/components/ui/button';
import { HomeSectionModal } from '@/admin/HomeSectionModal';
import { HOME_SECTION_CONFIGS } from '@/admin/homeSectionConfigs';

// ── Layouts disponíveis ───────────────────────────────────────────────────────

const LAYOUTS = [
  {
    id: 'dark',
    label: 'Card Escuro',
    desc: 'Container arredondado com fundo preto e gradiente',
    preview: (pc: string) => (
      <div style={{ background: '#0d0d0f', borderRadius: 12, padding: '16px 12px', border: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
          {['900','4K+','17'].map((v, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,.04)', borderRadius: 8, padding: '10px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 900, background: `linear-gradient(135deg,#fff,${pc})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: 'monospace' }}>{v}</div>
              <div style={{ fontSize: 7, color: 'rgba(255,255,255,.35)', marginTop: 3 }}>LABEL</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'light',
    label: 'Linha Clara',
    desc: 'Fundo branco, números coloridos separados por linha',
    preview: (pc: string) => (
      <div style={{ background: '#fff', borderRadius: 12, padding: '16px 12px', border: '1px solid rgba(0,0,0,.08)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 0 }}>
          {['900','4K+','17'].map((v, i) => (
            <div key={i} style={{ padding: '8px', textAlign: 'center', borderRight: i < 2 ? '1px solid rgba(0,0,0,.08)' : 'none' }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: pc, fontFamily: 'monospace' }}>{v}</div>
              <div style={{ fontSize: 7, color: '#98989d', marginTop: 3 }}>LABEL</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'cards',
    label: 'Cards Brancos',
    desc: 'Cards com borda colorida no topo ao hover',
    preview: (pc: string) => (
      <div style={{ background: '#f5f5f7', borderRadius: 12, padding: '10px', border: '1px solid rgba(0,0,0,.06)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
          {['900','4K+','17'].map((v, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 8, padding: '10px 8px', textAlign: 'center', borderTop: i === 0 ? `3px solid ${pc}` : '3px solid transparent' }}>
              <div style={{ fontSize: 16, fontWeight: 900, color: i === 0 ? pc : '#1d1d1f', fontFamily: 'monospace' }}>{v}</div>
              <div style={{ fontSize: 7, color: '#98989d', marginTop: 3 }}>LABEL</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'gradient',
    label: 'Gradiente',
    desc: 'Fundo com gradiente da cor primária, números brancos',
    preview: (pc: string) => (
      <div style={{ background: `linear-gradient(135deg,${pc},${pc}99)`, borderRadius: 12, padding: '16px 12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 0 }}>
          {['900','4K+','17'].map((v, i) => (
            <div key={i} style={{ padding: '8px', textAlign: 'center', borderRight: i < 2 ? '1px solid rgba(255,255,255,.2)' : 'none' }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>{v}</div>
              <div style={{ fontSize: 7, color: 'rgba(255,255,255,.7)', marginTop: 3 }}>LABEL</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'minimal',
    label: 'Minimalista',
    desc: 'Números enormes sobre fundo branco, estilo editorial',
    preview: (pc: string) => (
      <div style={{ background: '#fff', borderRadius: 12, padding: '16px 12px', border: '1px solid rgba(0,0,0,.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          {['900','4K+','17'].map((v, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: pc, fontFamily: 'monospace', letterSpacing: '-2px' }}>{v}</div>
              <div style={{ fontSize: 7, color: '#98989d', marginTop: 2 }}>LABEL</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

// ── Componente principal ──────────────────────────────────────────────────────

export function StatsManager() {
  const { data, addStat, updateStat, deleteStat, updateContent } = useData();
  const { toast } = useToast();
  const [saving, setSaving] = useState<string | null>(null);
  const [savingLayout, setSavingLayout] = useState(false);
  const [activeTab, setActiveTab] = useState<'numbers' | 'segmentos'>('numbers');

  const ct = data.content || {};
  const pc = data.settings?.primary_color || '#f97316';
  const currentLayout = ct['stats.layout'] || 'dark';

  const stats    = (data.stats || []).filter((s: any) => s.section === 'numbers' || !s.section);
  const segStats = (data.stats || []).filter((s: any) => s.section === 'segmentos-strip');

  const handleAdd = async (section: string) => {
    const list = section === 'numbers' ? stats : segStats;
    try {
      await addStat({ id: '', stat_id: `stat-${Date.now()}`, value: '0', label: 'Nova Estatística', suffix: '', section, order_num: list.length, active: 1 });
      toast({ title: 'Estatística adicionada!' });
    } catch { toast({ title: 'Erro ao adicionar', variant: 'destructive' }); }
  };

  const handleUpdate = async (stat: NumberStat) => {
    setSaving(stat.stat_id);
    try { await updateStat(stat); toast({ title: '✅ Salvo!' }); }
    catch { toast({ title: 'Erro ao salvar', variant: 'destructive' }); }
    finally { setSaving(null); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta estatística?')) return;
    try { await deleteStat(id); toast({ title: 'Excluído.' }); }
    catch { toast({ title: 'Erro ao excluir', variant: 'destructive' }); }
  };

  const setLayout = async (id: string) => {
    setSavingLayout(true);
    try { await updateContent({ 'stats.layout': id }); toast({ title: `✅ Layout "${LAYOUTS.find(l => l.id === id)?.label}" aplicado!` }); }
    catch { toast({ title: 'Erro ao salvar layout', variant: 'destructive' }); }
    finally { setSavingLayout(false); }
  };

  const StatRow = ({ stat }: { stat: NumberStat }) => {
    const [val, setVal] = useState(stat.value);
    const [lbl, setLbl] = useState(stat.label);
    const changed = val !== stat.value || lbl !== stat.label;
    return (
      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(0,0,0,.07)' }}>
        <div className="flex items-center gap-3 px-5 py-3 border-b" style={{ borderColor: 'rgba(0,0,0,.05)', background: 'rgba(0,0,0,.01)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${pc}12` }}>
            <TrendingUp size={14} style={{ color: pc }} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm text-[#1d1d1f]">{val || '(sem valor)'}</p>
            <p className="text-[11px] text-[#98989d]">{lbl || '(sem rótulo)'}</p>
          </div>
          {changed && <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">alterado</span>}
          <button onClick={() => handleDelete(stat.stat_id)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#98989d] hover:text-red-500 hover:bg-red-50 transition">
            <Trash2 size={13} />
          </button>
        </div>
        <div className="p-4 flex items-end gap-3">
          <div className="space-y-1.5 flex-1">
            <label className="text-xs font-semibold text-[#1d1d1f]">Valor</label>
            <input value={val} onChange={e => setVal(e.target.value)}
              placeholder="Ex: 900, 4K+, 98%"
              className="w-full h-10 px-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              style={{ borderColor: 'rgba(0,0,0,.1)', fontFamily: 'monospace', fontWeight: 700 }} />
          </div>
          <div className="space-y-1.5 flex-1">
            <label className="text-xs font-semibold text-[#1d1d1f]">Rótulo</label>
            <input value={lbl} onChange={e => setLbl(e.target.value)}
              placeholder="Ex: Empresas atendidas"
              className="w-full h-10 px-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
              style={{ borderColor: 'rgba(0,0,0,.1)' }} />
          </div>
          <button
            onClick={() => handleUpdate({ ...stat, value: val, label: lbl })}
            disabled={saving === stat.stat_id || !changed}
            className="h-10 px-4 rounded-xl text-sm font-bold text-white transition disabled:opacity-40 flex items-center gap-1.5 flex-shrink-0"
            style={{ background: changed ? pc : '#e5e5ea' }}>
            {saving === stat.stat_id ? <><span className="animate-spin">⟳</span> Salvando</> : <><Check size={13} /> Salvar</>}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-full bg-[#fafafa]">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex items-center justify-between gap-3 flex-wrap" style={{ borderColor: 'rgba(0,0,0,.07)' }}>
        <div>
          <h1 className="font-bold text-[#1d1d1f] text-xl" style={{ fontFamily: "'Outfit',sans-serif" }}>Estatísticas</h1>
          <p className="text-xs text-[#98989d] mt-0.5">Números de destaque e faixa de segmentos</p>
        </div>
        <HomeSectionModal
          section={HOME_SECTION_CONFIGS.stats}
          trigger={
            <Button variant="outline" className="rounded-xl">
              <TrendingUp className="w-4 h-4 mr-2" /> Texto da home
            </Button>
          }
        />
      </div>

      <div className="p-6 space-y-6">

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border p-1" style={{ borderColor: 'rgba(0,0,0,.07)', width: 'fit-content' }}>
          {[{ id: 'numbers', label: 'Números do Site' }, { id: 'segmentos', label: 'Faixa de Segmentos' }].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as 'numbers' | 'segmentos')}
              className="px-4 py-2 rounded-lg text-sm font-medium transition"
              style={{ background: activeTab === t.id ? pc : 'transparent', color: activeTab === t.id ? '#fff' : '#6e6e73' }}>
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'numbers' && (
          <>
            {/* Seletor de layout */}
            <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(0,0,0,.07)' }}>
              <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(0,0,0,.06)', background: 'rgba(0,0,0,.01)' }}>
                <div>
                  <p className="font-bold text-sm text-[#1d1d1f]">Estilo visual</p>
                  <p className="text-[11px] text-[#98989d]">Escolha como os números aparecem no site</p>
                </div>
                {savingLayout && <span className="text-xs text-orange-500">Salvando...</span>}
              </div>
              <div className="p-5 grid grid-cols-2 lg:grid-cols-5 gap-3">
                {LAYOUTS.map(layout => {
                  const sel = currentLayout === layout.id;
                  return (
                    <button key={layout.id} onClick={() => setLayout(layout.id)}
                      className="text-left rounded-xl border-2 overflow-hidden transition"
                      style={{ borderColor: sel ? pc : 'rgba(0,0,0,.08)', background: sel ? `${pc}04` : '#fff' }}>
                      {/* Mini preview */}
                      <div className="p-3">
                        {layout.preview(pc)}
                      </div>
                      <div className="px-3 pb-3">
                        <p className="text-xs font-bold text-[#1d1d1f] flex items-center gap-1.5">
                          {sel && <Check size={10} style={{ color: pc }} />}
                          {layout.label}
                        </p>
                        <p className="text-[10px] text-[#98989d] mt-0.5 leading-tight">{layout.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lista de stats */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-bold text-sm text-[#1d1d1f]">{stats.length} estatística{stats.length !== 1 ? 's' : ''}</p>
                <button onClick={() => handleAdd('numbers')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white"
                  style={{ background: pc }}>
                  <Plus size={14} /> Adicionar
                </button>
              </div>
              {stats.length === 0 ? (
                <div className="bg-white rounded-2xl border flex flex-col items-center py-14 text-center" style={{ borderColor: 'rgba(0,0,0,.07)' }}>
                  <TrendingUp size={28} className="text-gray-200 mb-3" />
                  <p className="text-sm text-[#98989d]">Nenhuma estatística cadastrada</p>
                  <button onClick={() => handleAdd('numbers')} className="mt-3 text-xs font-medium" style={{ color: pc }}>+ Adicionar a primeira</button>
                </div>
              ) : stats.map((s: any) => <StatRow key={s.stat_id} stat={s} />)}
            </div>
          </>
        )}

        {activeTab === 'segmentos' && (
          <div className="space-y-3">
            <div className="px-4 py-3 rounded-xl text-xs text-blue-700 bg-blue-50 border border-blue-100">
              Esses itens aparecem na faixa abaixo do banner da <strong>página de Segmentos</strong>. O primeiro item (contagem de segmentos ativos) é automático.
            </div>
            <div className="flex items-center justify-between">
              <p className="font-bold text-sm text-[#1d1d1f]">{segStats.length} item{segStats.length !== 1 ? 's' : ''}</p>
              <button onClick={() => handleAdd('segmentos-strip')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white"
                style={{ background: pc }}>
                <Plus size={14} /> Adicionar
              </button>
            </div>
            {segStats.length === 0 ? (
              <div className="bg-white rounded-2xl border flex flex-col items-center py-14 text-center" style={{ borderColor: 'rgba(0,0,0,.07)' }}>
                <TrendingUp size={28} className="text-gray-200 mb-3" />
                <p className="text-sm text-[#98989d]">Nenhum item cadastrado</p>
              </div>
            ) : segStats.map((s: any) => <StatRow key={s.stat_id} stat={s} />)}
          </div>
        )}

      </div>
    </div>
  );
}
