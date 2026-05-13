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
  Globe, Layers, BookOpen, Eye, EyeOff,
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
  if (type === 'builtin-dropdown') return 'Menu com dropdown';
  if (type === 'builtin-link')     return 'Link direto';
  if (type === 'custom-group')     return 'Categoria criada';
  return 'Página';
}

function SortableRow({
  entry, hidden, onToggleHidden, disabled,
}: {
  entry: NavEntry;
  hidden: boolean;
  onToggleHidden: () => void;
  disabled?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: entry.key, disabled });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: hidden ? 0.45 : isDragging ? 0.5 : 1,
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '13px 16px',
        background: isDragging ? '#fff7ed' : hidden ? '#f8fafc' : '#fff',
        border: `1px solid ${isDragging ? '#fed7aa' : hidden ? '#e2e8f0' : '#e2e8f0'}`,
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
        style={{ cursor: disabled ? 'not-allowed' : 'grab', color: '#cbd5e1', display: 'flex', alignItems: 'center', flexShrink: 0 }}
      >
        <GripVertical size={18} />
      </div>

      {/* Type icon */}
      <div style={{ width: 28, height: 28, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {typeIcon(entry.type)}
      </div>

      {/* Label */}
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: hidden ? '#94a3b8' : '#0f172a', margin: 0, textDecoration: hidden ? 'line-through' : 'none' }}>
          {entry.label}
        </p>
        <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>
          {hidden ? 'Oculto no site' : typeLabel(entry.type)}
        </p>
      </div>

      {/* Visibility toggle */}
      <button
        onClick={onToggleHidden}
        title={hidden ? 'Mostrar no menu' : 'Ocultar do menu'}
        style={{
          width: 32, height: 32, borderRadius: 8, border: '1px solid #e2e8f0',
          background: hidden ? '#f1f5f9' : '#f8fafc',
          color: hidden ? '#94a3b8' : '#475569',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, transition: 'all .15s',
        }}
      >
        {hidden ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  );
}

function buildAllEntries(data: ReturnType<typeof useData>['data']): NavEntry[] {
  const settings = data.settings || {};
  const content = data.content || {};
  const navPages = data.nav_pages || [];
  let customGroups: { key: string; label: string; order: number }[] = [];
  try { customGroups = JSON.parse(settings.nav_custom_groups || '[]'); } catch { }
  const BUILTIN_KEYS = new Set(['institucional', 'suporte', 'standalone', '']);
  return [
    { key: 'solucoes',      label: content['header.nav.solutions']     || 'Soluções',      type: 'builtin-dropdown' },
    { key: 'segmentos',     label: 'Segmentos',                                              type: 'builtin-link' },
    { key: 'institucional', label: content['header.nav.institutional'] || 'Institucional',  type: 'builtin-dropdown' },
    { key: 'suporte',       label: content['header.nav.support']       || 'Suporte',        type: 'builtin-dropdown' },
    ...customGroups
      .filter(g => !BUILTIN_KEYS.has(g.key))
      .map(g => ({ key: `group_${g.key}`, label: g.label, type: 'custom-group' as const })),
    ...navPages
      .filter(p => !p.nav_group || p.nav_group === 'standalone')
      .map(p => ({ key: `page_${p.slug}`, label: p.nav_label || p.title, type: 'standalone-page' as const })),
  ];
}

export function NavOrderManager() {
  const { data, updateSettings } = useData();
  const { toast } = useToast();
  const [items, setItems] = useState<NavEntry[]>([]);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [segmentosInSolucoes, setSegmentosInSolucoes] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    const settings = data.settings || {};
    const allEntries = buildAllEntries(data);

    let savedOrder: string[] = [];
    try { savedOrder = JSON.parse(settings.nav_order || '[]'); } catch { }

    let savedHidden: string[] = [];
    try { savedHidden = JSON.parse(settings.nav_hidden || '[]'); } catch { }

    const inSol = settings.nav_segmentos_in_solucoes === '1';
    setSegmentosInSolucoes(inSol);

    // Apply saved order
    if (savedOrder.length > 0) {
      const ordered: NavEntry[] = [];
      savedOrder.forEach(k => {
        const found = allEntries.find(e => e.key === k);
        if (found) ordered.push(found);
      });
      allEntries.forEach(e => {
        if (!ordered.find(o => o.key === e.key)) ordered.push(e);
      });
      setItems(ordered);
    } else {
      setItems(allEntries);
    }

    setHidden(new Set(savedHidden));
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

  const toggleHidden = (key: string) => {
    setHidden(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
    setDirty(true);
  };

  const toggleSegmentosInSolucoes = () => {
    const next = !segmentosInSolucoes;
    setSegmentosInSolucoes(next);
    // Se ativado, oculta Segmentos do top-level automaticamente
    if (next) {
      setHidden(prev => { const s = new Set(prev); s.add('segmentos'); return s; });
    } else {
      setHidden(prev => { const s = new Set(prev); s.delete('segmentos'); return s; });
    }
    setDirty(true);
  };

  const handleReset = () => {
    setItems(buildAllEntries(data));
    setHidden(new Set());
    setSegmentosInSolucoes(false);
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings({
        nav_order: JSON.stringify(items.map(i => i.key)),
        nav_hidden: JSON.stringify([...hidden]),
        nav_segmentos_in_solucoes: segmentosInSolucoes ? '1' : '0',
      });
      setDirty(false);
      toast({ title: '✅ Menu atualizado!' });
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const visibleCount = items.filter(i => !hidden.has(i.key)).length;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #f1f5f9', padding: '20px 32px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 13, background: 'linear-gradient(135deg,#fff7ed,#fed7aa)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={20} style={{ color: '#f97316' }} />
            </div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-.03em' }}>Ordem do Menu</h1>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>
                {visibleCount} de {items.length} itens visíveis
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleReset}
              style={{ height: 36, padding: '0 14px', borderRadius: 10, background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
              <RotateCcw size={13} /> Resetar
            </button>
            <button onClick={handleSave} disabled={saving || !dirty}
              style={{ height: 36, padding: '0 18px', borderRadius: 10, background: dirty ? '#f97316' : '#e2e8f0', border: 'none', color: dirty ? '#fff' : '#94a3b8', cursor: dirty ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, boxShadow: dirty ? '0 4px 12px rgba(249,115,22,.25)' : 'none', transition: 'all .15s' }}>
              <Save size={13} /> {saving ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: '28px auto', padding: '0 24px' }}>

        {/* Opção: Segmentos dentro de Soluções */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '16px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 3px' }}>
              Incluir Segmentos dentro de Soluções
            </p>
            <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
              Segmentos aparece como sub-item no dropdown de Soluções em vez de link separado
            </p>
          </div>
          <button
            onClick={toggleSegmentosInSolucoes}
            style={{
              width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
              background: segmentosInSolucoes ? '#f97316' : '#e2e8f0',
              position: 'relative', flexShrink: 0, transition: 'background .2s',
            }}
          >
            <span style={{
              position: 'absolute', top: 2, left: segmentosInSolucoes ? 22 : 2,
              width: 20, height: 20, borderRadius: 10, background: '#fff',
              boxShadow: '0 1px 4px rgba(0,0,0,.2)', transition: 'left .2s',
            }} />
          </button>
        </div>

        {/* Info */}
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '11px 16px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
          <BookOpen size={14} style={{ color: '#16a34a', flexShrink: 0 }} />
          <p style={{ fontSize: 12, color: '#15803d', margin: 0, lineHeight: 1.6 }}>
            <strong>Arraste</strong> para reordenar · Clique no <strong>olho</strong> para ocultar/mostrar um item no site
          </p>
        </div>

        {/* Drag list */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map(i => i.key)} strategy={verticalListSortingStrategy}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map(entry => (
                <SortableRow
                  key={entry.key}
                  entry={entry}
                  hidden={hidden.has(entry.key)}
                  onToggleHidden={() => toggleHidden(entry.key)}
                  disabled={hidden.has(entry.key)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
