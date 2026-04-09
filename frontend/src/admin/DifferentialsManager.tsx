import { useState, useEffect, useCallback } from 'react';
import type React from 'react';

import {
  Plus, Trash2, Save, RotateCcw, GripVertical, Info,
  Trophy, Heart, Lightbulb, Puzzle, Shield, Zap, Star,
  Target, Award, Rocket, TrendingUp, Users, Globe, Lock, Clock,
  CheckCircle, Flame, Eye, Layers, Package, Headphones, Code,
  EyeOff, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { HomeSectionModal } from '@/admin/HomeSectionModal';
import { HOME_SECTION_CONFIGS } from '@/admin/homeSectionConfigs';

const ICONS = [
  { value: 'Trophy', label: 'Troféu', Icon: Trophy },
  { value: 'Heart', label: 'Coração', Icon: Heart },
  { value: 'Lightbulb', label: 'Ideia', Icon: Lightbulb },
  { value: 'Puzzle', label: 'Integração', Icon: Puzzle },
  { value: 'Shield', label: 'Segurança', Icon: Shield },
  { value: 'Zap', label: 'Velocidade', Icon: Zap },
  { value: 'Star', label: 'Estrela', Icon: Star },
  { value: 'Target', label: 'Foco', Icon: Target },
  { value: 'Award', label: 'Prêmio', Icon: Award },
  { value: 'Rocket', label: 'Lançamento', Icon: Rocket },
  { value: 'TrendingUp', label: 'Crescimento', Icon: TrendingUp },
  { value: 'Users', label: 'Equipe', Icon: Users },
  { value: 'Globe', label: 'Global', Icon: Globe },
  { value: 'Lock', label: 'Privacidade', Icon: Lock },
  { value: 'Clock', label: 'Suporte 24h', Icon: Clock },
  { value: 'CheckCircle', label: 'Qualidade', Icon: CheckCircle },
  { value: 'Flame', label: 'Performance', Icon: Flame },
  { value: 'Eye', label: 'Visibilidade', Icon: Eye },
  { value: 'Layers', label: 'Plataforma', Icon: Layers },
  { value: 'Package', label: 'Produto', Icon: Package },
  { value: 'Headphones', label: 'Suporte', Icon: Headphones },
  { value: 'Code', label: 'Tecnologia', Icon: Code },
];

const ICON_MAP: Record<string, React.ElementType> = Object.fromEntries(ICONS.map(i => [i.value, i.Icon]));
function getIcon(n: string): React.ElementType { return ICON_MAP[n] || Star; }

const PALETTE = ['#f97316','#f59e0b','#f43f5e','#8b5cf6','#0ea5e9','#22c55e','#ec4899','#64748b','#e11d48','#7c3aed','#0891b2','#16a34a'];

interface Item { icon: string; title: string; description: string; accent: string; active: boolean; }
interface Form { sectionActive: boolean; badge: string; heading: string; headingAccent: string; description: string; layout: string; items: Item[]; }

const newItem = (): Item => ({ icon: 'Star', title: '', description: '', accent: '#f97316', active: true });

// ── Mini preview card ─────────────────────────────────────────────────────────
function MiniCard({ item, pc }: { item: Item; pc: string }) {
  const Icon = getIcon(item.icon);
  const c = item.accent || pc;
  return (
    <div style={{ borderRadius: 14, padding: '18px 16px', background: 'rgba(255,255,255,.04)', border: `1px solid rgba(255,255,255,.08)`, opacity: item.active ? 1 : .35, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${c}35,transparent)` }} />
      <div style={{ width: 36, height: 36, borderRadius: 10, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${c}15`, border: `1px solid ${c}25` }}>
        <Icon size={17} style={{ color: c }} />
      </div>
      <p style={{ fontFamily: "'Outfit',sans-serif", fontSize: 13, fontWeight: 800, color: '#fff', margin: '0 0 5px' }}>{item.title || 'Título'}</p>
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', margin: '0 0 12px', lineHeight: 1.5 }}>{item.description || 'Descrição'}</p>
      <div style={{ height: 2, borderRadius: 2, background: `linear-gradient(90deg,${c},transparent)`, width: 20 }} />
      {!item.active && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 14 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.4)', background: 'rgba(0,0,0,.5)', padding: '3px 8px', borderRadius: 6 }}>INATIVO</span>
        </div>
      )}
    </div>
  );
}

// ── Item editor ───────────────────────────────────────────────────────────────
function ItemEditor({ item, index, total, onChange, onDelete, pc }: {
  item: Item; index: number; total: number;
  onChange: (p: Partial<Item>) => void; onDelete: () => void; pc: string;
}) {
  const [iconOpen, setIconOpen] = useState(false);
  const Icon = getIcon(item.icon);
  const c = item.accent || pc;

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: `1.5px solid ${item.active ? 'rgba(0,0,0,.07)' : 'rgba(0,0,0,.04)'}`, overflow: 'hidden', opacity: item.active ? 1 : .6, transition: 'opacity .2s' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderBottom: '1px solid rgba(0,0,0,.06)', background: item.active ? `linear-gradient(90deg,${c}08,transparent)` : '#f9f9f9' }}>
        <GripVertical size={14} color="#c7c7cc" style={{ flexShrink: 0 }} />
        <div style={{ width: 30, height: 30, borderRadius: 8, background: item.active ? c : '#e5e5ea', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background .2s' }}>
          <Icon size={15} color="#fff" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#1d1d1f', margin: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{item.title || `Card ${index + 1}`}</p>
          <p style={{ fontSize: 10, color: '#98989d', margin: 0 }}>Item {index + 1} de {total}</p>
        </div>
        {/* Toggle ativo */}
        <button onClick={() => onChange({ active: !item.active })}
          title={item.active ? 'Desativar' : 'Ativar'}
          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 6, border: 'none', cursor: 'pointer', background: item.active ? '#dcfce7' : '#f5f5f7', color: item.active ? '#16a34a' : '#98989d', fontSize: 10, fontWeight: 700, flexShrink: 0, transition: 'all .2s' }}>
          {item.active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
          {item.active ? 'Ativo' : 'Inativo'}
        </button>
        {total > 1 && (
          <button onClick={onDelete} style={{ width: 26, height: 26, borderRadius: 7, border: 'none', cursor: 'pointer', background: '#fff1f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Trash2 size={12} />
          </button>
        )}
      </div>

      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <Label style={{ fontSize: 11, fontWeight: 600, color: '#6e6e73', display: 'block', marginBottom: 4 }}>Título *</Label>
            <Input value={item.title} onChange={e => onChange({ title: e.target.value })} placeholder="Ex: Suporte 24/7" style={{ height: 35, fontSize: 13 }} />
          </div>
          {/* Ícone */}
          <div>
            <Label style={{ fontSize: 11, fontWeight: 600, color: '#6e6e73', display: 'block', marginBottom: 4 }}>Ícone</Label>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setIconOpen(o => !o)}
                style={{ width: '100%', height: 35, borderRadius: 8, border: '1px solid rgba(0,0,0,.12)', background: '#fff', cursor: 'pointer', padding: '0 10px', display: 'flex', alignItems: 'center', gap: 7, fontSize: 13 }}>
                <Icon size={14} color={c} />
                <span style={{ flex: 1, textAlign: 'left', color: '#1d1d1f', fontSize: 12 }}>{ICONS.find(i => i.value === item.icon)?.label || 'Selecionar'}</span>
                <span style={{ color: '#98989d', fontSize: 9 }}>▼</span>
              </button>
              {iconOpen && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: '#fff', borderRadius: 12, border: '1px solid rgba(0,0,0,.1)', boxShadow: '0 8px 32px rgba(0,0,0,.12)', marginTop: 4, display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 3, padding: 8, maxHeight: 190, overflowY: 'auto' }}>
                  {ICONS.map(({ value, label, Icon: Ic }) => (
                    <button key={value} onClick={() => { onChange({ icon: value }); setIconOpen(false); }} title={label}
                      style={{ padding: '6px 3px', borderRadius: 7, border: `1.5px solid ${item.icon === value ? c : 'transparent'}`, background: item.icon === value ? `${c}12` : 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <Ic size={15} color={item.icon === value ? c : '#6e6e73'} />
                      <span style={{ fontSize: 7.5, color: item.icon === value ? c : '#98989d', textAlign: 'center', lineHeight: 1.2 }}>{label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div>
          <Label style={{ fontSize: 11, fontWeight: 600, color: '#6e6e73', display: 'block', marginBottom: 4 }}>Descrição</Label>
          <Textarea value={item.description} onChange={e => onChange({ description: e.target.value })} placeholder="Breve descrição..." rows={2} style={{ resize: 'none', fontSize: 13 }} />
        </div>
        {/* Cor */}
        <div>
          <Label style={{ fontSize: 11, fontWeight: 600, color: '#6e6e73', display: 'block', marginBottom: 4 }}>Cor de destaque</Label>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
            {PALETTE.map(col => (
              <button key={col} onClick={() => onChange({ accent: col })}
                style={{ width: 22, height: 22, borderRadius: '50%', border: `3px solid ${item.accent === col ? '#1d1d1f' : 'transparent'}`, background: col, cursor: 'pointer', padding: 0, transform: item.accent === col ? 'scale(1.2)' : 'scale(1)', transition: 'transform .15s' }} />
            ))}
            <input type="color" value={item.accent || '#f97316'} onChange={e => onChange({ accent: e.target.value })}
              style={{ width: 22, height: 22, borderRadius: '50%', border: '2px dashed rgba(0,0,0,.15)', cursor: 'pointer', padding: 1, background: 'transparent' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Manager ───────────────────────────────────────────────────────────────────
export function DifferentialsManager() {
  const { data, updateContent } = useData();
  const { toast } = useToast();
  const [form, setForm] = useState<Form>({ sectionActive: true, badge: '', heading: '', headingAccent: '', description: '', layout: 'cards', items: [] });
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const pc = data.settings?.primary_color || '#f97316';

  const load = useCallback((): Form => {
    const ct = data.content || {};
    const items: Item[] = [];
    for (let i = 1; i <= 8; i++) {
      const title = (ct[`differentials.item${i}_title`] || '').trim();
      if (!title) continue;
      items.push({ icon: ct[`differentials.item${i}_icon`] || 'Star', title, description: ct[`differentials.item${i}_desc`] || '', accent: ct[`differentials.item${i}_accent`] || pc, active: ct[`differentials.item${i}_active`] !== '0' });
    }
    return { sectionActive: ct['differentials.active'] !== '0', badge: ct['differentials.title'] || '', heading: ct['differentials.subtitle'] || '', headingAccent: ct['differentials.subtitle2'] || '', description: ct['differentials.description'] || '', layout: ct['differentials.layout'] || 'cards', items };
  }, [data.content, pc]);

  useEffect(() => { setForm(load()); setDirty(false); }, [data.content]);

  const set = (p: Partial<Form>) => { setForm(f => ({ ...f, ...p })); setDirty(true); };
  const updateItem = (i: number, p: Partial<Item>) => { setForm(f => { const items = [...f.items]; items[i] = { ...items[i], ...p }; return { ...f, items }; }); setDirty(true); };
  const addItem = () => { if (form.items.length >= 8) { toast({ title: 'Máximo 8 cards', variant: 'destructive' }); return; } setForm(f => ({ ...f, items: [...f.items, newItem()] })); setDirty(true); };
  const deleteItem = (i: number) => { setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) })); setDirty(true); };

  const save = async () => {
    setSaving(true);
    try {
      const u: Record<string, string> = {
        'differentials.active': form.sectionActive ? '1' : '0',
        'differentials.title': form.badge,
        'differentials.subtitle': form.heading,
        'differentials.subtitle2': form.headingAccent,
        'differentials.description': form.description,
        'differentials.layout': form.layout,
      };
      form.items.forEach((item, i) => {
        const n = i + 1;
        u[`differentials.item${n}_title`]  = item.title;
        u[`differentials.item${n}_desc`]   = item.description;
        u[`differentials.item${n}_icon`]   = item.icon;
        u[`differentials.item${n}_accent`] = item.accent;
        u[`differentials.item${n}_active`] = item.active ? '1' : '0';
      });
      for (let i = form.items.length + 1; i <= 8; i++) {
        ['title','desc','icon','accent','active'].forEach(k => { u[`differentials.item${i}_${k}`] = ''; });
      }
      await updateContent(u);
      setDirty(false);
      toast({ title: '✅ Salvo!' });
    } catch { toast({ title: 'Erro ao salvar', variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  const activeItems = form.items.filter(i => i.active);

  return (
    <div style={{ minHeight: '100vh', background: '#f7f7f9' }}>

      {/* Top bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: '#fff', borderBottom: '1px solid rgba(0,0,0,.07)', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 20, color: '#1d1d1f', margin: 0 }}>Diferenciais</h1>
          <p style={{ fontSize: 12, color: '#98989d', margin: '2px 0 0' }}>
            {form.items.length} cards — {activeItems.length} ativos
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Toggle seção inteira */}
          <button onClick={() => set({ sectionActive: !form.sectionActive })}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 10, border: `1.5px solid ${form.sectionActive ? '#22c55e' : 'rgba(0,0,0,.12)'}`, background: form.sectionActive ? '#dcfce7' : '#f5f5f7', color: form.sectionActive ? '#16a34a' : '#6e6e73', fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all .2s' }}>
            {form.sectionActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
            Seção {form.sectionActive ? 'visível' : 'oculta'}
          </button>
          {dirty && (
            <button onClick={() => { setForm(load()); setDirty(false); }}
              style={{ padding: '7px 14px', borderRadius: 10, border: '1px solid rgba(0,0,0,.12)', background: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: '#6e6e73', display: 'flex', alignItems: 'center', gap: 5 }}>
              <RotateCcw size={13} /> Descartar
            </button>
          )}
          <HomeSectionModal
            section={HOME_SECTION_CONFIGS.differentials}
            trigger={
              <button
                style={{ padding: '7px 14px', borderRadius: 10, border: '1px solid rgba(0,0,0,.12)', background: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', color: '#1d1d1f', display: 'flex', alignItems: 'center', gap: 5 }}
              >
                <Info size={13} /> Texto da home
              </button>
            }
          />
          <button onClick={addItem} disabled={form.items.length >= 8}
            style={{ padding: '7px 14px', borderRadius: 10, border: '1.5px solid #f97316', background: 'transparent', fontSize: 12, fontWeight: 700, cursor: 'pointer', color: '#f97316', display: 'flex', alignItems: 'center', gap: 5, opacity: form.items.length >= 8 ? .5 : 1 }}>
            <Plus size={14} /> Novo Card
          </button>
          <button onClick={save} disabled={!dirty || saving}
            style={{ padding: '7px 18px', borderRadius: 10, border: 'none', background: dirty ? '#f97316' : '#e5e5ea', fontSize: 12, fontWeight: 700, cursor: dirty ? 'pointer' : 'not-allowed', color: dirty ? '#fff' : '#98989d', display: 'flex', alignItems: 'center', gap: 5, transition: 'all .2s' }}>
            <Save size={14} /> {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 24px 48px' }}>

        {/* Aviso seção oculta */}
        {!form.sectionActive && (
          <div style={{ background: '#fef9c3', border: '1px solid #fde047', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <EyeOff size={16} color="#ca8a04" />
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#92400e' }}>Seção oculta — não aparece no site. Ative o toggle acima para exibir.</p>
          </div>
        )}

        {/* Cabeçalho */}
        <div style={{ background: '#fff', borderRadius: 18, border: '1.5px solid rgba(0,0,0,.07)', padding: 20, marginBottom: 18 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#98989d', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Info size={11} /> Cabeçalho da seção
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <Label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>Badge (pequeno, acima do título)</Label>
              <Input value={form.badge} onChange={e => set({ badge: e.target.value })} placeholder="Ex: Por que a Unimaxx?" style={{ height: 35, fontSize: 13 }} />
            </div>
            <div>
              <Label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>Texto complementar</Label>
              <Input value={form.description} onChange={e => set({ description: e.target.value })} placeholder="Subtexto opcional" style={{ height: 35, fontSize: 13 }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <Label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>Título (parte normal)</Label>
              <Input value={form.heading} onChange={e => set({ heading: e.target.value })} placeholder="Ex: Diferenciais que fazem a" style={{ height: 35, fontSize: 13 }} />
            </div>
            <div>
              <Label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 4 }}>Título (parte colorida em itálico)</Label>
              <Input value={form.headingAccent} onChange={e => set({ headingAccent: e.target.value })} placeholder="Ex: diferença" style={{ height: 35, fontSize: 13 }} />
            </div>
          </div>
          {/* Layout selector */}
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(0,0,0,.06)' }}>
            <Label style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 8 }}>Estilo de layout</Label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
              {[
                { v: 'cards',    l: 'Cards',      desc: 'Grade com bordas' },
                { v: 'list',     l: 'Lista',      desc: 'Linhas horizontais' },
                { v: 'featured', l: 'Destaque',   desc: '1 grande + menores' },
                { v: 'colorful', l: 'Colorido',   desc: 'Hover sólido' },
              ].map(({ v, l, desc }) => {
                const sel = (form.layout || 'cards') === v;
                return (
                  <button key={v} onClick={() => set({ layout: v })}
                    style={{ padding: '10px 8px', borderRadius: 10, border: `2px solid ${sel ? pc : 'rgba(0,0,0,.1)'}`, background: sel ? `${pc}10` : '#fff', cursor: 'pointer', textAlign: 'center', transition: 'all .15s' }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: sel ? pc : '#1d1d1f', margin: '0 0 2px' }}>{l}</p>
                    <p style={{ fontSize: 10, color: '#98989d', margin: 0 }}>{desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

                    {(form.heading || form.headingAccent) && (
            <div style={{ marginTop: 12, padding: '12px 16px', borderRadius: 10, background: '#08080b', textAlign: 'center' }}>
              <p style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: '1.5rem', color: '#fff', margin: 0, letterSpacing: '-0.03em' }}>
                {form.heading && <>{form.heading} </>}
                {form.headingAccent && <span style={{ color: pc, fontStyle: 'italic' }}>{form.headingAccent}</span>}
              </p>
            </div>
          )}
        </div>

        {/* Preview dark */}
        {form.items.length > 0 && (
          <div style={{ borderRadius: 18, overflow: 'hidden', marginBottom: 18, border: '1.5px solid rgba(0,0,0,.07)' }}>
            <div style={{ background: '#111', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: form.sectionActive ? '#22c55e' : '#ef4444' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Prévia ao vivo</span>
              </div>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,.25)' }}>{activeItems.length} de {form.items.length} visíveis</span>
            </div>
            <div style={{ background: '#08080b', padding: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(activeItems.length, 3)}, 1fr)`, gap: 12 }}>
                {activeItems.map((item, i) => <MiniCard key={i} item={item} pc={pc} />)}
              </div>
              {activeItems.length === 0 && (
                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,.2)', fontSize: 13, padding: '20px 0', margin: 0 }}>Nenhum card ativo para exibir</p>
              )}
            </div>
          </div>
        )}

        {/* Editores */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
          {form.items.map((item, i) => (
            <ItemEditor key={i} item={item} index={i} total={form.items.length} onChange={p => updateItem(i, p)} onDelete={() => deleteItem(i)} pc={pc} />
          ))}
          {form.items.length < 8 && (
            <button onClick={addItem}
              style={{ borderRadius: 16, border: '2px dashed rgba(0,0,0,.12)', background: 'transparent', cursor: 'pointer', minHeight: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#b0b0b8', transition: 'all .2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#f97316'; (e.currentTarget as HTMLElement).style.color = '#f97316'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,.12)'; (e.currentTarget as HTMLElement).style.color = '#b0b0b8'; }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(0,0,0,.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={18} /></div>
              <span style={{ fontSize: 12, fontWeight: 600 }}>Adicionar card</span>
            </button>
          )}
        </div>

        {form.items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#98989d' }}>
            <Layers size={40} color="#e5e5ea" style={{ marginBottom: 14 }} />
            <p style={{ fontWeight: 600, color: '#1d1d1f', margin: '0 0 6px' }}>Nenhum card ainda</p>
            <p style={{ fontSize: 13, margin: '0 0 18px' }}>Crie o primeiro diferencial da empresa</p>
            <button onClick={addItem} style={{ padding: '9px 22px', borderRadius: 10, border: 'none', background: '#f97316', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Plus size={15} /> Criar primeiro card
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
