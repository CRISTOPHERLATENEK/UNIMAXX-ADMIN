import { useState, useRef } from 'react';
import {
  GripVertical, Eye, EyeOff, Save, RotateCcw,
  Layout, Image, Link2, Briefcase, BarChart3,
  Tags, Star, Handshake, MessageSquare, Mail,
  ChevronUp, ChevronDown, Building2, Zap,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { toast } from 'sonner';

// ─── Definição de todas as seções disponíveis ───
export const ALL_SECTIONS = [
  { id: 'hero',           label: 'Banner / Carrossel',       icon: Image,        description: 'Slider principal com banners e CTAs', required: false },
  { id: 'home_highlight', label: 'Foto com Escrita',         icon: Image,        description: 'Bloco extra com foto, texto e botão', required: false },
  { id: 'client_logos',   label: 'Logos de Clientes',        icon: Building2,    description: 'Faixa de logos em scroll automático',  required: false },
  { id: 'quicklinks',   label: 'Links Rápidos',           icon: Zap,          description: 'Acesso rápido a páginas internas',     required: false },
  { id: 'solutions',    label: 'Soluções',                icon: Briefcase,    description: 'Cards com as soluções da empresa',     required: false },
  { id: 'numbers',      label: 'Números / Estatísticas',  icon: BarChart3,    description: 'Métricas e indicadores com animação',  required: false },
  { id: 'segments',     label: 'Segmentos Atendidos',     icon: Tags,         description: 'Grid de segmentos do varejo',          required: false },
  { id: 'differentials',label: 'Diferenciais',            icon: Star,         description: 'Por que escolher a Unimaxx',           required: false },
  { id: 'testimonials', label: 'Depoimentos',             icon: MessageSquare,description: 'Avaliações e depoimentos de clientes', required: false },
  { id: 'partners',     label: 'Parceiros & Integrações', icon: Handshake,    description: 'Grid de logos de parceiros',           required: false },
  { id: 'contact',      label: 'Contato',                 icon: Mail,         description: 'Formulário e informações de contato',  required: true  },
];

const DEFAULT_LAYOUT = ALL_SECTIONS.map((s, i) => ({
  id: s.id,
  visible: true,
  order: i,
}));

export type SectionSlot = { id: string; visible: boolean; order: number };

export function parseLayout(raw: string | undefined): SectionSlot[] {
  if (!raw) return DEFAULT_LAYOUT;
  try {
    const parsed: SectionSlot[] = JSON.parse(raw);
    // Merge: make sure all sections exist (forward-compat)
    const ids = new Set(parsed.map(s => s.id));
    const merged = [...parsed];
    ALL_SECTIONS.forEach((s, i) => {
      if (!ids.has(s.id)) merged.push({ id: s.id, visible: true, order: parsed.length + i });
    });
    return merged.sort((a, b) => a.order - b.order);
  } catch {
    return DEFAULT_LAYOUT;
  }
}

export function PageLayoutManager() {
  const { data, updateSettings } = useData();
  const rawLayout = data.settings?.home_layout;
  const [slots, setSlots] = useState<SectionSlot[]>(() => parseLayout(rawLayout));
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // ─── Drag state ───
  const dragIndex = useRef<number | null>(null);
  const dragOverIndex = useRef<number | null>(null);

  const update = (next: SectionSlot[]) => {
    setSlots(next);
    setDirty(true);
  };

  const toggleVisible = (id: string) => {
    const section = ALL_SECTIONS.find(s => s.id === id);
    if (section?.required) { toast.error('Esta seção é obrigatória e não pode ser ocultada'); return; }
    update(slots.map(s => s.id === id ? { ...s, visible: !s.visible } : s));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const next = [...slots];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    update(next.map((s, i) => ({ ...s, order: i })));
  };

  const moveDown = (index: number) => {
    if (index === slots.length - 1) return;
    const next = [...slots];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    update(next.map((s, i) => ({ ...s, order: i })));
  };

  // ─── Drag handlers ───
  const onDragStart = (index: number) => { dragIndex.current = index; };
  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    dragOverIndex.current = index;
  };
  const onDrop = () => {
    const from = dragIndex.current;
    const to = dragOverIndex.current;
    if (from === null || to === null || from === to) return;
    const next = [...slots];
    const [removed] = next.splice(from, 1);
    next.splice(to, 0, removed);
    update(next.map((s, i) => ({ ...s, order: i })));
    dragIndex.current = null;
    dragOverIndex.current = null;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({ home_layout: JSON.stringify(slots) });
      toast.success('Layout salvo! A página já reflete a nova ordem.');
      setDirty(false);
    } catch {
      toast.error('Erro ao salvar layout');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    update(DEFAULT_LAYOUT);
    toast.info('Layout redefinido para o padrão.');
  };

  const visibleCount = slots.filter(s => s.visible).length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editor de Layout</h1>
          <p className="text-sm text-gray-500 mt-1">
            Arraste as seções para reordenar, ou use as setas. Alterne o olho para mostrar/ocultar.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
            <RotateCcw className="w-4 h-4" /> Restaurar padrão
          </button>
          <button onClick={handleSave} disabled={saving || !dirty}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{
              background: dirty ? 'linear-gradient(135deg, #f97316, #ea580c)' : '#d1d5db',
              cursor: dirty ? 'pointer' : 'not-allowed',
            }}>
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : dirty ? 'Salvar Layout' : 'Salvo'}
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-orange-50 rounded-2xl border border-orange-100">
        <Layout className="w-5 h-5 text-orange-500 flex-shrink-0" />
        <p className="text-sm text-orange-700">
          <span className="font-semibold">{visibleCount}</span> de <span className="font-semibold">{slots.length}</span> seções visíveis na home.
          {dirty && <span className="ml-2 text-orange-500 font-medium">· Alterações não salvas</span>}
        </p>
      </div>

      {/* Preview strip */}
      <div className="mb-6 p-5 bg-white border border-gray-100 rounded-2xl">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Pré-visualização da ordem</p>
        <div className="flex flex-wrap gap-2">
          {slots.filter(s => s.visible).map((slot, i) => {
            const def = ALL_SECTIONS.find(s => s.id === slot.id);
            if (!def) return null;
            const Icon = def.icon;
            return (
              <div key={slot.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }}>
                <span className="text-gray-400 font-mono text-[10px]">{i + 1}</span>
                <Icon className="w-3 h-3" />
                <span>{def.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Drag list */}
      <div className="space-y-2">
        {slots.map((slot, index) => {
          const def = ALL_SECTIONS.find(s => s.id === slot.id);
          if (!def) return null;
          const Icon = def.icon;

          return (
            <div
              key={slot.id}
              draggable
              onDragStart={() => onDragStart(index)}
              onDragOver={(e) => onDragOver(e, index)}
              onDrop={onDrop}
              className="flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200 cursor-grab active:cursor-grabbing select-none"
              style={{
                background: slot.visible ? '#ffffff' : '#fafafa',
                borderColor: slot.visible ? 'rgba(0,0,0,.07)' : 'rgba(0,0,0,.04)',
                opacity: slot.visible ? 1 : 0.55,
                boxShadow: slot.visible ? '0 1px 4px rgba(0,0,0,.04)' : 'none',
              }}
              onDragEnter={(e) => {
                e.currentTarget.style.borderColor = '#f97316';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(249,115,22,.15)';
              }}
              onDragLeave={(e) => {
                e.currentTarget.style.borderColor = slot.visible ? 'rgba(0,0,0,.07)' : 'rgba(0,0,0,.04)';
                e.currentTarget.style.boxShadow = slot.visible ? '0 1px 4px rgba(0,0,0,.04)' : 'none';
              }}
            >
              {/* Drag handle */}
              <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />

              {/* Position badge */}
              <span className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                style={{ background: slot.visible ? '#fff7ed' : '#f5f5f7', color: slot.visible ? '#c2410c' : '#9ca3af' }}>
                {slot.visible ? index + 1 : '–'}
              </span>

              {/* Icon */}
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: slot.visible ? '#fff7ed' : '#f5f5f7' }}>
                <Icon className="w-4 h-4" style={{ color: slot.visible ? '#f97316' : '#9ca3af' }} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900 truncate">{def.label}</p>
                  {def.required && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide"
                      style={{ background: '#dcfce7', color: '#16a34a' }}>obrigatória</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 truncate">{def.description}</p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {/* Move up/down */}
                <button onClick={() => moveUp(index)} disabled={index === 0}
                  className="p-1.5 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-20 disabled:cursor-not-allowed">
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button onClick={() => moveDown(index)} disabled={index === slots.length - 1}
                  className="p-1.5 rounded-lg text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-20 disabled:cursor-not-allowed">
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Toggle visible */}
                <button onClick={() => toggleVisible(slot.id)}
                  className="ml-1 p-1.5 rounded-lg transition-colors"
                  style={{
                    background: slot.visible ? '#f0fdf4' : '#f9fafb',
                    color: slot.visible ? '#16a34a' : '#9ca3af',
                  }}
                  title={slot.visible ? 'Ocultar seção' : 'Mostrar seção'}>
                  {slot.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-center text-gray-400">
        Arraste os blocos para mudar a ordem · Clique no olho para mostrar/ocultar · As alterações só são aplicadas ao salvar
      </p>
    </div>
  );
}
