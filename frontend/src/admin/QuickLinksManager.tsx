import { useState, useEffect, useCallback } from 'react';
import type React from 'react';

import {
  Plus, Trash2, Save, RotateCcw, Link2, GripVertical,
  ArrowUp, ArrowDown, X, Check, Eye,
  Building2, Monitor, ShoppingCart, BarChart3, Zap, Globe,
  Package, Users, Settings as SettingsIcon, Star, Shield, Truck, CreditCard,
  Headphones, Layers, PieChart, TrendingUp, Database, Code,
  Search,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useToast } from '@/hooks/use-toast';
import { HomeSectionModal } from '@/admin/HomeSectionModal';
import { HOME_SECTION_CONFIGS } from '@/admin/homeSectionConfigs';
import { Switch } from '@/components/ui/switch';

// ── Ícones disponíveis ────────────────────────────────────────────────────────

const ICONS: { value: string; label: string; Icon: React.ElementType }[] = [
  { value: 'Building2', label: 'ERP / Prédio', Icon: Building2 },
  { value: 'Monitor', label: 'PDV / Monitor', Icon: Monitor },
  { value: 'ShoppingCart', label: 'E-commerce', Icon: ShoppingCart },
  { value: 'BarChart3', label: 'BI / Gráfico', Icon: BarChart3 },
  { value: 'Zap', label: 'Automação', Icon: Zap },
  { value: 'Globe', label: 'Web / Digital', Icon: Globe },
  { value: 'Package', label: 'Estoque', Icon: Package },
  { value: 'Users', label: 'CRM / Equipe', Icon: Users },
  { value: 'Settings', label: 'Config.', Icon: SettingsIcon },
  { value: 'Star', label: 'Destaque', Icon: Star },
  { value: 'Shield', label: 'Segurança', Icon: Shield },
  { value: 'Truck', label: 'Logística', Icon: Truck },
  { value: 'CreditCard', label: 'Financeiro', Icon: CreditCard },
  { value: 'Headphones', label: 'Suporte', Icon: Headphones },
  { value: 'Layers', label: 'Plataforma', Icon: Layers },
  { value: 'PieChart', label: 'Relatórios', Icon: PieChart },
  { value: 'TrendingUp', label: 'Vendas', Icon: TrendingUp },
  { value: 'Database', label: 'Dados', Icon: Database },
  { value: 'Code', label: 'Integrações', Icon: Code },
  { value: 'Search', label: 'Busca', Icon: Search },
];

const COLORS = [
  '#3b82f6', '#6366f1', '#22c55e', '#10b981', '#f97316',
  '#f59e0b', '#ef4444', '#ec4899', '#a855f7', '#06b6d4',
  '#64748b', '#1e293b',
];

const COLOR_LABELS: Record<string, string> = {
  '#3b82f6': 'Azul', '#6366f1': 'Índigo', '#22c55e': 'Verde', '#10b981': 'Esmeralda',
  '#f97316': 'Laranja', '#f59e0b': 'Âmbar', '#ef4444': 'Vermelho', '#ec4899': 'Rosa',
  '#a855f7': 'Roxo', '#06b6d4': 'Ciano', '#64748b': 'Cinza', '#1e293b': 'Escuro',
};

function getIcon(name: string): React.ElementType {
  return ICONS.find(i => i.value === name)?.Icon || Building2;
}

// ── Tipo ──────────────────────────────────────────────────────────────────────

interface QuickLink {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  href: string;
}

const makeNew = (): QuickLink => ({
  id: `ql-${Date.now()}`,
  title: '', subtitle: '', icon: 'Building2', color: '#3b82f6', href: '#solucoes',
});

// ── Preview card ──────────────────────────────────────────────────────────────

function PreviewCard({ link }: { link: QuickLink }) {
  const [hov, setHov] = useState(false);
  const Icon = getIcon(link.icon);
  const c = link.color || '#3b82f6';
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 14, padding: '16px 14px', cursor: 'default',
        background: hov ? c : '#fff',
        border: `1.5px solid ${hov ? c : 'rgba(0,0,0,.08)'}`,
        boxShadow: hov ? `0 8px 28px ${c}35` : '0 1px 4px rgba(0,0,0,.05)',
        transition: 'all .28s cubic-bezier(.4,0,.2,1)',
        transform: hov ? 'translateY(-2px)' : 'none',
      }}>
      <div style={{
        width: 36, height: 36, borderRadius: 9, marginBottom: 10,
        background: hov ? 'rgba(255,255,255,.2)' : `${c}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all .28s',
      }}>
        <Icon size={18} style={{ color: hov ? '#fff' : c, transition: 'color .28s' }} />
      </div>
      <p style={{ fontWeight: 700, fontSize: 12, margin: '0 0 2px', color: hov ? '#fff' : '#1d1d1f', transition: 'color .28s', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {link.title || '—'}
      </p>
      <p style={{ fontSize: 10, margin: 0, color: hov ? 'rgba(255,255,255,.7)' : '#98989d', transition: 'color .28s', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {link.subtitle || '—'}
      </p>
    </div>
  );
}

// ── Seletor de ícone visual ───────────────────────────────────────────────────

function IconPicker({ value, color, onChange }: { value: string; color: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const CurrentIcon = getIcon(value);

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-[#1d1d1f]">Ícone</label>
      <button type="button" onClick={() => setOpen(!open)}
        className="flex items-center gap-3 w-full px-3 py-2 rounded-xl border text-sm text-left transition"
        style={{ borderColor: open ? color : 'rgba(0,0,0,.12)', background: open ? `${color}06` : '#fff' }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}15` }}>
          <CurrentIcon size={15} style={{ color }} />
        </div>
        <span className="flex-1 text-[#1d1d1f]">{ICONS.find(i => i.value === value)?.label || 'Selecionar'}</span>
        <span className="text-[#98989d] text-[10px]">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="rounded-xl border overflow-hidden shadow-lg" style={{ borderColor: 'rgba(0,0,0,.1)' }}>
          <div className="grid grid-cols-5 gap-1 p-2">
            {ICONS.map(({ value: v, label, Icon: Ic }) => {
              const sel = v === value;
              return (
                <button key={v} type="button" title={label}
                  onClick={() => { onChange(v); setOpen(false); }}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg transition"
                  style={{ background: sel ? `${color}12` : undefined, border: `1.5px solid ${sel ? color : 'transparent'}` }}
                  onMouseEnter={e => { if (!sel) (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,.04)'; }}
                  onMouseLeave={e => { if (!sel) (e.currentTarget as HTMLElement).style.background = ''; }}>
                  <Ic size={18} style={{ color: sel ? color : '#6e6e73' }} />
                  <span className="text-[9px] text-center leading-tight truncate w-full" style={{ color: sel ? color : '#98989d' }}>{label.split('/')[0].trim()}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Manager ───────────────────────────────────────────────────────────────────

export function QuickLinksManager() {
  const { data, updateContent } = useData();
  const { toast } = useToast();

  const [links, setLinks] = useState<QuickLink[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const loadLinks = useCallback(() => {
    const ct = data.content || {};
    const loaded: QuickLink[] = [];
    let i = 0;
    while (ct[`quicklinks.${i}.id`] !== undefined) {
      const id = ct[`quicklinks.${i}.id`];
      // Skip empty/deleted slots written by the save cleanup loop
      if (!id || id === '__deleted__') { i++; continue; }
      let color = ct[`quicklinks.${i}.color`] || '#3b82f6';
      if (color.includes('from-blue')) color = '#3b82f6';
      else if (color.includes('from-green')) color = '#22c55e';
      else if (color.includes('from-purple')) color = '#a855f7';
      else if (color.includes('from-orange')) color = '#f97316';
      else if (color.includes('from-red')) color = '#ef4444';
      loaded.push({
        id,
        title: ct[`quicklinks.${i}.title`] || '',
        subtitle: ct[`quicklinks.${i}.subtitle`] || '',
        icon: ct[`quicklinks.${i}.icon`] || 'Building2',
        color,
        href: ct[`quicklinks.${i}.href`] || '#solucoes',
      });
      i++;
    }
    return loaded;
  }, [data.content]);

  useEffect(() => { setLinks(loadLinks()); setDirty(false); }, [data.content]);

  const update = (index: number, patch: Partial<QuickLink>) => {
    setLinks(prev => prev.map((l, i) => i === index ? { ...l, ...patch } : l));
    setDirty(true);
  };

  const addLink = () => {
    if (links.length >= 8) { toast({ title: 'Máximo 8 cards', variant: 'destructive' }); return; }
    const newLinks = [...links, makeNew()];
    setLinks(newLinks);
    setEditing(newLinks.length - 1);
    setDirty(true);
  };

  const deleteLink = (i: number) => {
    setLinks(prev => prev.filter((_, idx) => idx !== i));
    if (editing === i) setEditing(null);
    else if (editing !== null && editing > i) setEditing(editing - 1);
    setDirty(true);
  };

  const moveLink = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= links.length) return;
    const arr = [...links];
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setLinks(arr);
    setEditing(j);
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const updates: Record<string, string> = {};
      links.forEach((l, i) => {
        updates[`quicklinks.${i}.id`] = l.id;
        updates[`quicklinks.${i}.title`] = l.title;
        updates[`quicklinks.${i}.subtitle`] = l.subtitle;
        updates[`quicklinks.${i}.icon`] = l.icon;
        updates[`quicklinks.${i}.color`] = l.color;
        updates[`quicklinks.${i}.href`] = l.href;
      });
      for (let i = links.length; i < 8; i++) {
        updates[`quicklinks.${i}.id`] = '__deleted__';
        ['title', 'subtitle', 'icon', 'color', 'href'].forEach(k => {
          updates[`quicklinks.${i}.${k}`] = '';
        });
      }
      await updateContent(updates);
      setDirty(false);
      toast({ title: '✅ Links Rápidos salvos!' });
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const editedLink = editing !== null ? links[editing] : null;

  return (
    <div className="min-h-full bg-[#fafafa]">

      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex items-center gap-3"
        style={{ borderColor: 'rgba(0,0,0,.07)' }}>
        <div className="flex-1">
          <h1 className="font-bold text-[#1d1d1f] text-xl" style={{ fontFamily: "'Outfit',sans-serif" }}>Links Rápidos</h1>
          <p className="text-xs text-[#98989d] mt-0.5">Cards de acesso rápido na página inicial — {links.length}/8</p>
        </div>
        {dirty && (
          <span className="text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full">
            Alterações pendentes
          </span>
        )}
        <HomeSectionModal
          section={HOME_SECTION_CONFIGS.quicklinks}
          trigger={
            <button
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-semibold transition"
              style={{ borderColor: 'rgba(0,0,0,.12)', color: '#1d1d1f', background: '#fff' }}
            >
              <Link2 size={13} /> Texto da home
            </button>
          }
        />
        <button onClick={() => { setLinks(loadLinks()); setDirty(false); setEditing(null); }} disabled={!dirty}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-medium transition disabled:opacity-40"
          style={{ borderColor: 'rgba(0,0,0,.12)', color: '#6e6e73' }}>
          <RotateCcw size={13} /> Descartar
        </button>
        <button onClick={addLink} disabled={links.length >= 8}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-bold transition disabled:opacity-40"
          style={{ borderColor: '#f97316', color: '#f97316' }}>
          <Plus size={14} /> Novo card
        </button>
        <button onClick={save} disabled={!dirty || saving}
          className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-bold text-white transition disabled:opacity-40"
          style={{ background: dirty ? '#f97316' : '#e5e5ea' }}>
          <Save size={13} /> {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      <div className="p-6 space-y-5">

        {/* ── Preview ── */}
        <div className="bg-white rounded-2xl border p-5" style={{ borderColor: 'rgba(0,0,0,.07)' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#98989d] mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            Prévia ao vivo — passe o mouse para ver o efeito
          </p>
          {links.length === 0 ? (
            <p className="text-sm text-[#98989d] text-center py-6">Nenhum card cadastrado</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(links.length, 4)}, 1fr)`, gap: 8 }}>
              {links.map((l, i) => <PreviewCard key={l.id || i} link={l} />)}
            </div>
          )}
        </div>

        {/* ── Lista + Editor ── */}
        <div className={`grid gap-5 ${editedLink ? 'lg:grid-cols-[1fr_380px]' : 'grid-cols-1'}`}>

          {/* Lista */}
          <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(0,0,0,.07)' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(0,0,0,.06)', background: 'rgba(0,0,0,.01)' }}>
              <p className="font-bold text-sm text-[#1d1d1f]">Cards cadastrados</p>
              <p className="text-xs text-[#98989d]">Clique para editar</p>
            </div>

            {links.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center px-6">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center mb-3">
                  <Zap size={20} className="text-orange-400" />
                </div>
                <p className="font-semibold text-[#1d1d1f] mb-1">Nenhum card</p>
                <p className="text-sm text-[#98989d] mb-4">Adicione cards de acesso rápido</p>
                <button onClick={addLink}
                  className="px-4 py-2 rounded-xl border text-sm font-medium text-orange-600 border-orange-200 hover:bg-orange-50 transition">
                  <Plus size={13} className="inline mr-1" /> Adicionar card
                </button>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'rgba(0,0,0,.05)' }}>
                {links.map((link, i) => {
                  const Icon = getIcon(link.icon);
                  const isSelected = editing === i;
                  return (
                    <div key={link.id || i}
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer group transition-colors"
                      style={{ background: isSelected ? `${link.color}06` : undefined }}
                      onClick={() => setEditing(isSelected ? null : i)}>

                      {/* Ícone colorido */}
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${link.color}15` }}>
                        <Icon size={18} style={{ color: link.color }} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[#1d1d1f] truncate">{link.title || '(sem título)'}</p>
                        <p className="text-xs text-[#98989d] truncate">{link.subtitle || link.href}</p>
                      </div>

                      {/* Cor pill */}
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: link.color }} />

                      {/* Actions on hover */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        onClick={e => e.stopPropagation()}>
                        <button onClick={() => moveLink(i, -1)} disabled={i === 0}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#98989d] hover:bg-gray-100 disabled:opacity-20 transition">
                          <ArrowUp size={12} />
                        </button>
                        <button onClick={() => moveLink(i, 1)} disabled={i === links.length - 1}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#98989d] hover:bg-gray-100 disabled:opacity-20 transition">
                          <ArrowDown size={12} />
                        </button>
                        <button onClick={() => deleteLink(i)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#98989d] hover:text-red-500 hover:bg-red-50 transition">
                          <Trash2 size={12} />
                        </button>
                      </div>

                      {/* Chevron */}
                      <div className="text-[#d0d0d0] transition-transform flex-shrink-0"
                        style={{ transform: isSelected ? 'rotate(90deg)' : 'none', color: isSelected ? link.color : undefined }}>
                        ›
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer */}
            {links.length > 0 && (
              <div className="px-4 py-3 border-t" style={{ borderColor: 'rgba(0,0,0,.05)', background: 'rgba(0,0,0,.01)' }}>
                <p className="text-[11px] text-[#98989d]">Passe o mouse para reordenar · máximo 8 cards</p>
              </div>
            )}
          </div>

          {/* Editor inline */}
          {editedLink && editing !== null && (
            <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(0,0,0,.07)' }}>
              {/* Header editor */}
              <div className="flex items-center justify-between px-5 py-4 border-b"
                style={{ borderColor: 'rgba(0,0,0,.06)', background: `${editedLink.color}06` }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: editedLink.color }}>
                    {(() => { const Ic = getIcon(editedLink.icon); return <Ic size={16} color="#fff" />; })()}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-[#1d1d1f]">{editedLink.title || 'Novo card'}</p>
                    <p className="text-[11px] text-[#98989d]">Card {editing + 1} de {links.length}</p>
                  </div>
                </div>
                <button onClick={() => setEditing(null)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-[#98989d] hover:bg-gray-100 transition">
                  <X size={14} />
                </button>
              </div>

              <div className="p-5 space-y-5">

                {/* Título + Legenda */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1d1d1f]">Título *</label>
                    <input value={editedLink.title} onChange={e => update(editing, { title: e.target.value })}
                      placeholder="Ex: Maxx ERP"
                      className="w-full h-10 px-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                      style={{ borderColor: 'rgba(0,0,0,.1)' }} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#1d1d1f]">Legenda</label>
                    <input value={editedLink.subtitle} onChange={e => update(editing, { subtitle: e.target.value })}
                      placeholder="Ex: Gestão Completa"
                      className="w-full h-10 px-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                      style={{ borderColor: 'rgba(0,0,0,.1)' }} />
                  </div>
                </div>

                {/* Link */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#1d1d1f] flex items-center gap-1.5">
                    <Link2 size={11} /> Link de destino
                  </label>
                  <input value={editedLink.href} onChange={e => update(editing, { href: e.target.value })}
                    placeholder="#secao ou /pagina"
                    className="w-full h-10 px-3 rounded-xl border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-300"
                    style={{ borderColor: 'rgba(0,0,0,.1)' }} />
                  <p className="text-[11px] text-[#98989d]">Use <code className="bg-gray-100 px-1 rounded">#ancora</code> para rolar à seção ou <code className="bg-gray-100 px-1 rounded">/caminho</code> para outra página</p>
                </div>

                {/* Ícone */}
                <IconPicker
                  value={editedLink.icon}
                  color={editedLink.color}
                  onChange={v => update(editing, { icon: v })}
                />

                {/* Cor */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#1d1d1f]">Cor do card</label>
                  <div className="flex flex-wrap gap-2 items-center">
                    {COLORS.map(c => (
                      <button key={c} type="button" title={COLOR_LABELS[c] || c}
                        onClick={() => update(editing, { color: c })}
                        className="w-7 h-7 rounded-full transition-transform"
                        style={{
                          background: c,
                          outline: editedLink.color === c ? `3px solid ${c}` : 'none',
                          outlineOffset: 2,
                          transform: editedLink.color === c ? 'scale(1.2)' : 'scale(1)',
                          boxShadow: editedLink.color === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : 'none',
                        }} />
                    ))}
                    <input type="color" value={editedLink.color}
                      onChange={e => update(editing, { color: e.target.value })}
                      title="Cor personalizada"
                      className="w-7 h-7 rounded-full border-2 border-dashed cursor-pointer p-0.5"
                      style={{ borderColor: 'rgba(0,0,0,.2)' }} />
                  </div>
                </div>

                {/* Preview do card */}
                <div>
                  <p className="text-[10px] font-bold text-[#98989d] uppercase tracking-wider mb-2">Preview</p>
                  <div style={{ maxWidth: 160 }}>
                    <PreviewCard link={editedLink} />
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}