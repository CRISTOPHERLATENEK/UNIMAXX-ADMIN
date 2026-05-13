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
import { GripVertical, ChevronDown, Link2, Globe, Eye, EyeOff } from 'lucide-react';
import { useData } from '@/context/DataContext';

interface NavEntry {
  key: string;
  label: string;
  type: 'builtin-dropdown' | 'builtin-link' | 'custom-group' | 'standalone-page';
}

function typeIcon(type: NavEntry['type']) {
  if (type === 'builtin-dropdown' || type === 'custom-group')
    return <ChevronDown size={12} style={{ color: '#f97316' }} />;
  if (type === 'standalone-page')
    return <Globe size={12} style={{ color: '#6366f1' }} />;
  return <Link2 size={12} style={{ color: '#64748b' }} />;
}

function typeLabel(type: NavEntry['type']) {
  if (type === 'builtin-dropdown') return 'Menu dropdown';
  if (type === 'builtin-link')     return 'Link direto';
  if (type === 'custom-group')     return 'Categoria criada';
  return 'Página';
}

function SortableRow({
  entry, hidden, onToggleHidden,
}: {
  entry: NavEntry;
  hidden: boolean;
  onToggleHidden: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: entry.key, disabled: hidden });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: hidden ? 0.4 : isDragging ? 0.5 : 1,
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px',
        background: isDragging ? '#fff7ed' : '#fff',
        border: `1px solid ${isDragging ? '#fed7aa' : '#e2e8f0'}`,
        borderRadius: 10,
        userSelect: 'none',
        boxShadow: isDragging ? '0 6px 20px rgba(249,115,22,.12)' : '0 1px 2px rgba(0,0,0,.03)',
      }}
    >
      <div
        {...attributes}
        {...listeners}
        style={{ cursor: hidden ? 'not-allowed' : 'grab', color: '#d1d5db', display: 'flex', flexShrink: 0 }}
      >
        <GripVertical size={16} />
      </div>

      <div style={{ width: 24, height: 24, borderRadius: 6, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {typeIcon(entry.type)}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: hidden ? '#94a3b8' : '#0f172a', margin: 0, textDecoration: hidden ? 'line-through' : 'none' }}>
          {entry.label}
        </p>
        <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>
          {hidden ? 'Oculto' : typeLabel(entry.type)}
        </p>
      </div>

      <button
        onClick={onToggleHidden}
        title={hidden ? 'Mostrar no menu' : 'Ocultar do menu'}
        style={{
          width: 28, height: 28, borderRadius: 7, border: '1px solid #e2e8f0',
          background: hidden ? '#f1f5f9' : '#fff',
          color: hidden ? '#94a3b8' : '#64748b',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, transition: 'all .12s',
        }}
      >
        {hidden ? <EyeOff size={13} /> : <Eye size={13} />}
      </button>
    </div>
  );
}

function buildAllEntries(data: ReturnType<typeof useData>['data']): NavEntry[] {
  const settings = data.settings || {};
  const content  = data.content  || {};
  const navPages = data.nav_pages || [];
  let customGroups: { key: string; label: string; order: number }[] = [];
  try { customGroups = JSON.parse(settings.nav_custom_groups || '[]'); } catch { }
  const BUILTIN = new Set(['institucional', 'suporte', 'standalone', '']);
  return [
    { key: 'solucoes',      label: content['header.nav.solutions']     || 'Soluções',      type: 'builtin-dropdown' },
    { key: 'segmentos',     label: 'Segmentos',                                              type: 'builtin-link' },
    { key: 'institucional', label: content['header.nav.institutional'] || 'Institucional',  type: 'builtin-dropdown' },
    { key: 'suporte',       label: content['header.nav.support']       || 'Suporte',        type: 'builtin-dropdown' },
    ...customGroups.filter(g => !BUILTIN.has(g.key)).map(g => ({ key: `group_${g.key}`, label: g.label, type: 'custom-group' as const })),
    ...navPages.filter(p => !p.nav_group || p.nav_group === 'standalone').map(p => ({ key: `page_${p.slug}`, label: p.nav_label || p.title, type: 'standalone-page' as const })),
  ];
}

/** Componente embutido como aba — recebe settings/setSetting do pai (Settings.tsx) */
export function NavOrderTab({
  settings,
  setSetting,
}: {
  settings: Record<string, string>;
  setSetting: (k: string, v: string) => void;
}) {
  const { data } = useData();
  const [items, setItems] = useState<NavEntry[]>([]);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [segInSol, setSegInSol] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // Inicializa a partir de settings
  useEffect(() => {
    const all = buildAllEntries(data);
    let order: string[] = [];
    try { order = JSON.parse(settings.nav_order || '[]'); } catch { }
    let hiddenArr: string[] = [];
    try { hiddenArr = JSON.parse(settings.nav_hidden || '[]'); } catch { }
    setSegInSol(settings.nav_segmentos_in_solucoes === '1');
    setHidden(new Set(hiddenArr));

    if (order.length > 0) {
      const ordered: NavEntry[] = [];
      order.forEach(k => { const f = all.find(e => e.key === k); if (f) ordered.push(f); });
      all.forEach(e => { if (!ordered.find(o => o.key === e.key)) ordered.push(e); });
      setItems(ordered);
    } else {
      setItems(all);
    }
  }, [data, settings.nav_order, settings.nav_hidden, settings.nav_segmentos_in_solucoes]);

  const updateOrder = (next: NavEntry[]) => {
    setItems(next);
    setSetting('nav_order', JSON.stringify(next.map(i => i.key)));
  };

  const updateHidden = (next: Set<string>) => {
    setHidden(next);
    setSetting('nav_hidden', JSON.stringify([...next]));
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setItems(prev => {
      const next = arrayMove(prev, prev.findIndex(i => i.key === active.id), prev.findIndex(i => i.key === over.id));
      setSetting('nav_order', JSON.stringify(next.map(i => i.key)));
      return next;
    });
  };

  const toggleHidden = (key: string) => {
    const next = new Set(hidden);
    next.has(key) ? next.delete(key) : next.add(key);
    updateHidden(next);
  };

  const toggleSegInSol = () => {
    const next = !segInSol;
    setSegInSol(next);
    setSetting('nav_segmentos_in_solucoes', next ? '1' : '0');
    // Auto-oculta/mostra Segmentos no top-level
    const nextHidden = new Set(hidden);
    next ? nextHidden.add('segmentos') : nextHidden.delete('segmentos');
    updateHidden(nextHidden);
  };

  const resetAll = () => {
    const all = buildAllEntries(data);
    updateOrder(all);
    updateHidden(new Set());
    setSegInSol(false);
    setSetting('nav_segmentos_in_solucoes', '0');
  };

  const visibleCount = items.filter(i => !hidden.has(i.key)).length;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-.02em' }}>Ordem e visibilidade do menu</h2>
        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
          Arraste para reordenar · Olho para ocultar · {visibleCount} de {items.length} visíveis
        </p>
      </div>

      {/* Toggle: Segmentos dentro de Soluções */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: '0 0 2px' }}>Incluir Segmentos dentro de Soluções</p>
          <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Aparece como sub-item no dropdown em vez de link separado</p>
        </div>
        <button
          onClick={toggleSegInSol}
          style={{
            width: 42, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer',
            background: segInSol ? '#f97316' : '#d1d5db',
            position: 'relative', flexShrink: 0, transition: 'background .2s',
          }}
        >
          <span style={{
            position: 'absolute', top: 2, left: segInSol ? 20 : 2,
            width: 18, height: 18, borderRadius: 9, background: '#fff',
            boxShadow: '0 1px 3px rgba(0,0,0,.2)', transition: 'left .2s',
          }} />
        </button>
      </div>

      {/* DnD list */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(i => i.key)} strategy={verticalListSortingStrategy}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {items.map(entry => (
              <SortableRow
                key={entry.key}
                entry={entry}
                hidden={hidden.has(entry.key)}
                onToggleHidden={() => toggleHidden(entry.key)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button
        onClick={resetAll}
        style={{ marginTop: 14, height: 32, padding: '0 14px', borderRadius: 8, background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
      >
        Resetar ordem padrão
      </button>
    </div>
  );
}
