import { useState, useEffect } from 'react';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical, ChevronDown, Link2, RotateCcw, Save,
  Globe, Layers, BookOpen,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useToast } from '@/hooks/use-toast';

interface NavEntry {
  key: string;
  label: string;
  type: 'builtin-dropdown' | 'builtin-link' | 'custom-group' | 'standalone-page';
}

function typeIcon(type: NavEntry['type']) {
  if (type === 'builtin-dropdown' || type === 'custom-group')
    return <ChevronDown size={13} style={{ color: '#f97316' }} />;
  if (type === 'standalone-page')
    return <Globe size={13} style={{ color: '#6366f1' }} />;
  return <Link2 size={13} style={{ color: '#64748b' }} />;
}

function typeLabel(type: NavEntry['type']) {
  if (type === 'builtin-dropdown') return 'Menu fixo';
  if (type === 'builtin-link')     return 'Link fixo';
  if (type === 'custom-group')     return 'Categoria criada';
  return 'Página';
}

function SortableRow({ entry }: { entry: NavEntry }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: entry.key });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '13px 16px',
        background: isDragging ? '#fff7ed' : '#fff',
        border: `1px solid ${isDragging ? '#fed7aa' : '#e2e8f0'}`,
        borderRadius: 12,
        cursor: isDragging ? 'grabbing' : 'default',
        userSelect: 'none',
        boxShadow: isDragging ? '0 8px 24px rgba(249,115,22,.15)' : '0 1px 3px rgba(0,0,0,.04)',
      }}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        style={{ cursor: 'grab', color: '#cbd5e1', display: 'flex', alignItems: 'center', flexShrink: 0 }}
      >
        <GripVertical size={18} />
      </div>

      {/* Icon */}
      <div style={{ width: 28, height: 28, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {typeIcon(entry.type)}
      </div>

      {/* Label */}
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>{entry.label}</p>
        <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>{typeLabel(entry.type)}</p>
      </div>

      {/* Key badge */}
      <code style={{ fontSize: 10, background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: 6, padding: '2px 7px', color: '#64748b', fontFamily: 'monospace' }}>
        {entry.key}
      </code>
    </div>
  );
}

export function NavOrderManager() {
  const { data, updateSettings } = useData();
  const { toast } = useToast();
  const [items, setItems] = useState<NavEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // Constrói lista de todos os itens do nav
  useEffect(() => {
    const settings = data.settings || {};
    const content = data.content || {};
    const navPages = data.nav_pages || [];

    // Grupos customizados
    let customGroups: { key: string; label: string; order: number }[] = [];
    try { customGroups = JSON.parse(settings.nav_custom_groups || '[]'); } catch { }

    const BUILTIN_KEYS = new Set(['institucional', 'suporte', 'standalone', '']);

    const allEntries: NavEntry[] = [
      { key: 'solucoes',     label: content['header.nav.solutions']    || 'Soluções',     type: 'builtin-dropdown' },
      { key: 'segmentos',    label: 'Segmentos',                                           type: 'builtin-link' },
      { key: 'institucional',label: content['header.nav.institutional']|| 'Institucional', type: 'builtin-dropdown' },
      { key: 'suporte',      label: content['header.nav.support']      || 'Suporte',       type: 'builtin-dropdown' },
      ...customGroups
        .filter(g => !BUILTIN_KEYS.has(g.key))
        .map(g => ({ key: `group_${g.key}`, label: g.label, type: 'custom-group' as const })),
      ...navPages
        .filter(p => !p.nav_group || p.nav_group === 'standalone')
        .map(p => ({ key: `page_${p.slug}`, label: p.nav_label || p.title, type: 'standalone-page' as const })),
    ];

    // Aplica ordem salva
    let savedOrder: string[] = [];
    try { savedOrder = JSON.parse(settings.nav_order || '[]'); } catch { }

    if (savedOrder.length > 0) {
      const ordered: NavEntry[] = [];
      savedOrder.forEach(k => {
        const found = allEntries.find(e => e.key === k);
        if (found) ordered.push(found);
      });
      // Adiciona novos itens que não estavam no order salvo
      allEntries.forEach(e => {
        if (!ordered.find(o => o.key === e.key)) ordered.push(e);
      });
      setItems(ordered);
    } else {
      setItems(allEntries);
    }
    setDirty(false);
  }, [data]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems(prev => {
      const oldIndex = prev.findIndex(i => i.key === active.id);
      const newIndex = prev.findIndex(i => i.key === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
    setDirty(true);
  };

  const handleReset = () => {
    const settings = data.settings || {};
    const content = data.content || {};
    const navPages = data.nav_pages || [];
    let customGroups: { key: string; label: string; order: number }[] = [];
    try { customGroups = JSON.parse(settings.nav_custom_groups || '[]'); } catch { }
    const BUILTIN_KEYS = new Set(['institucional', 'suporte', 'standalone', '']);
    setItems([
      { key: 'solucoes',     label: content['header.nav.solutions']    || 'Soluções',     type: 'builtin-dropdown' },
      { key: 'segmentos',    label: 'Segmentos',                                           type: 'builtin-link' },
      { key: 'institucional',label: content['header.nav.institutional']|| 'Institucional', type: 'builtin-dropdown' },
      { key: 'suporte',      label: content['header.nav.support']      || 'Suporte',       type: 'builtin-dropdown' },
      ...customGroups
        .filter(g => !BUILTIN_KEYS.has(g.key))
        .map(g => ({ key: `group_${g.key}`, label: g.label, type: 'custom-group' as const })),
      ...navPages
        .filter(p => !p.nav_group || p.nav_group === 'standalone')
        .map(p => ({ key: `page_${p.slug}`, label: p.nav_label || p.title, type: 'standalone-page' as const })),
    ]);
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({ nav_order: JSON.stringify(items.map(i => i.key)) });
      setDirty(false);
      toast({ title: '✅ Ordem do menu salva!' });
    } catch {
      toast({ title: 'Erro ao salvar ordem', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #f1f5f9', padding: '20px 32px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 13, background: 'linear-gradient(135deg,#fff7ed,#fed7aa)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={20} style={{ color: '#f97316' }} />
            </div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-.03em' }}>Ordem do Menu</h1>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Arraste para reordenar os itens do header</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleReset}
              style={{ height: 36, padding: '0 14px', borderRadius: 10, background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
              <RotateCcw size={13} /> Resetar
            </button>
            <button onClick={handleSave} disabled={saving || !dirty}
              style={{ height: 36, padding: '0 18px', borderRadius: 10, background: dirty ? '#f97316' : '#e2e8f0', border: 'none', color: dirty ? '#fff' : '#94a3b8', cursor: dirty ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, boxShadow: dirty ? '0 4px 12px rgba(249,115,22,.25)' : 'none', transition: 'all .15s' }}>
              <Save size={13} /> {saving ? 'Salvando…' : 'Salvar Ordem'}
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div style={{ maxWidth: 680, margin: '32px auto', padding: '0 24px' }}>
        {/* Info */}
        <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <BookOpen size={15} style={{ color: '#f97316', marginTop: 1, flexShrink: 0 }} />
          <p style={{ fontSize: 12, color: '#92400e', margin: 0, lineHeight: 1.6 }}>
            Arraste os itens para definir a ordem em que aparecem no menu do site. Categorias e páginas novas aparecem automaticamente ao final até você salvar uma nova ordem.
          </p>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map(i => i.key)} strategy={verticalListSortingStrategy}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map(entry => (
                <SortableRow key={entry.key} entry={entry} />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8' }}>
            <Layers size={32} style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: 14, fontWeight: 600 }}>Nenhum item encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
