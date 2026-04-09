import { useState, useCallback } from 'react';
import {
  Plus, Trash2, Save, RotateCcw, GripVertical, ChevronDown, ChevronUp,
  ShoppingCart, CreditCard, BarChart3, Truck, Wifi, Bell,
  Zap, Shield, Clock, Package, Users, Star, RefreshCw,
  Smartphone, Globe, FileText, CheckCircle, TrendingUp, Lock, Headphones,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { toast } from 'sonner';
import { DEFAULT_ROW1, DEFAULT_ROW2, ICON_MAP } from '@/sections/ClientLogos';
import type { Feature } from '@/sections/ClientLogos';

// ─── Ícones disponíveis para o picker ──────────────────────────────────────────
const ICON_OPTIONS = [
  'ShoppingCart','CreditCard','BarChart3','Truck','Wifi','Bell',
  'Zap','Shield','Clock','Package','Users','Star','RefreshCw',
  'Smartphone','Globe','FileText','CheckCircle','TrendingUp','Lock','Headphones',
];

// ─── Cores padrão sugeridas ─────────────────────────────────────────────────────
const COLOR_PRESETS = [
  { color: '#f97316', bg: '#fff7ed' },
  { color: '#2563eb', bg: '#eff6ff' },
  { color: '#10b981', bg: '#ecfdf5' },
  { color: '#8b5cf6', bg: '#f5f3ff' },
  { color: '#e11d48', bg: '#fff1f2' },
  { color: '#f59e0b', bg: '#fffbeb' },
  { color: '#06b6d4', bg: '#ecfeff' },
  { color: '#64748b', bg: '#f8fafc' },
  { color: '#16a34a', bg: '#f0fdf4' },
  { color: '#7c3aed', bg: '#faf5ff' },
  { color: '#0ea5e9', bg: '#f0f9ff' },
  { color: '#ec4899', bg: '#fdf2f8' },
  { color: '#6366f1', bg: '#eef2ff' },
  { color: '#22c55e', bg: '#f0fdf4' },
  { color: '#ef4444', bg: '#fef2f2' },
  { color: '#14b8a6', bg: '#f0fdfa' },
];

// ─── Componente de pill de preview ─────────────────────────────────────────────
function FeaturePreview({ feat }: { feat: Feature }) {
  const Icon = ICON_MAP[feat.icon] || ShoppingCart;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '6px 14px', borderRadius: 999,
      background: '#fff', border: '1.5px solid #e5e7eb',
      boxShadow: '0 1px 4px rgba(0,0,0,.06)',
    }}>
      <span style={{ width: 22, height: 22, borderRadius: '50%', background: feat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={11} color={feat.color} strokeWidth={2.3} />
      </span>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: '#111827' }}>
        {feat.label || 'Label'}
      </span>
    </div>
  );
}

// ─── Editor de um item ──────────────────────────────────────────────────────────
function FeatureItemEditor({
  feat, index, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast,
}: {
  feat: Feature; index: number;
  onChange: (i: number, f: Feature) => void;
  onDelete: (i: number) => void;
  onMoveUp: (i: number) => void;
  onMoveDown: (i: number) => void;
  isFirst: boolean; isLast: boolean;
}) {
  const [open, setOpen] = useState(false);
  const Icon = ICON_MAP[feat.icon] || ShoppingCart;

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 14, background: '#fff', overflow: 'hidden' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', cursor: 'pointer' }}
        onClick={() => setOpen(v => !v)}>
        <GripVertical size={14} color="#d1d5db" />
        <span style={{ width: 24, height: 24, borderRadius: '50%', background: feat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={12} color={feat.color} strokeWidth={2.2} />
        </span>
        <span style={{ flex: 1, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: '#111827' }}>
          {feat.label || <span style={{ color: '#9ca3af' }}>Item sem label</span>}
        </span>
        <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
          <button disabled={isFirst} onClick={() => onMoveUp(index)}
            style={{ padding: '3px 6px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: isFirst ? 'not-allowed' : 'pointer', opacity: isFirst ? 0.4 : 1 }}>
            <ChevronUp size={12} />
          </button>
          <button disabled={isLast} onClick={() => onMoveDown(index)}
            style={{ padding: '3px 6px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#f9fafb', cursor: isLast ? 'not-allowed' : 'pointer', opacity: isLast ? 0.4 : 1 }}>
            <ChevronDown size={12} />
          </button>
          <button onClick={() => onDelete(index)}
            style={{ padding: '3px 6px', borderRadius: 6, border: '1px solid #fee2e2', background: '#fef2f2', cursor: 'pointer', color: '#ef4444' }}>
            <Trash2 size={12} />
          </button>
        </div>
        {open ? <ChevronUp size={14} color="#9ca3af" /> : <ChevronDown size={14} color="#9ca3af" />}
      </div>

      {open && (
        <div style={{ borderTop: '1px solid #f3f4f6', padding: '14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Label */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Label</label>
            <input type="text" value={feat.label} onChange={e => onChange(index, { ...feat, label: e.target.value })}
              placeholder="Ex: Venda rápida no PDV"
              style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 13, outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }} />
          </div>

          {/* Ícone */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Ícone</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {ICON_OPTIONS.map(name => {
                const Ic = ICON_MAP[name];
                return (
                  <button key={name} onClick={() => onChange(index, { ...feat, icon: name })}
                    title={name}
                    style={{
                      width: 34, height: 34, borderRadius: 8, border: feat.icon === name ? `2px solid ${feat.color}` : '1.5px solid #e5e7eb',
                      background: feat.icon === name ? feat.bg : '#f9fafb',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    }}>
                    <Ic size={14} color={feat.icon === name ? feat.color : '#6b7280'} strokeWidth={2} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cor */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Cor do ícone</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {COLOR_PRESETS.map(preset => (
                <button key={preset.color} onClick={() => onChange(index, { ...feat, color: preset.color, bg: preset.bg })}
                  title={preset.color}
                  style={{
                    width: 26, height: 26, borderRadius: '50%', background: preset.color, cursor: 'pointer',
                    border: feat.color === preset.color ? '3px solid #111' : '2px solid transparent',
                    outline: feat.color === preset.color ? `2px solid ${preset.color}40` : 'none',
                  }} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 10, color: '#9ca3af', marginBottom: 3, display: 'block' }}>Cor personalizada</label>
                <input type="color" value={feat.color} onChange={e => onChange(index, { ...feat, color: e.target.value })}
                  style={{ width: '100%', height: 34, borderRadius: 8, border: '1px solid #e5e7eb', cursor: 'pointer', padding: 2 }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: 10, color: '#9ca3af', marginBottom: 3, display: 'block' }}>Fundo do ícone</label>
                <input type="color" value={feat.bg} onChange={e => onChange(index, { ...feat, bg: e.target.value })}
                  style={{ width: '100%', height: 34, borderRadius: 8, border: '1px solid #e5e7eb', cursor: 'pointer', padding: 2 }} />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div style={{ paddingTop: 4 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Preview</label>
            <FeaturePreview feat={feat} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Manager principal ──────────────────────────────────────────────────────────
export function ClientLogosManager() {
  const { data, updateContent } = useData();
  const content = data.content || {};

  const parseRow = (key: string, fallback: Feature[]): Feature[] => {
    const raw = content[key];
    if (!raw) return fallback;
    try { const p = JSON.parse(raw); if (Array.isArray(p) && p.length) return p; } catch {}
    return fallback;
  };

  const [row1, setRow1] = useState<Feature[]>(() => parseRow('features.row1', DEFAULT_ROW1));
  const [row2, setRow2] = useState<Feature[]>(() => parseRow('features.row2', DEFAULT_ROW2));
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'row1' | 'row2'>('row1');

  const rows = { row1, row2 };
  const setRows = { row1: setRow1, row2: setRow2 };

  const changeItem = useCallback((tab: 'row1' | 'row2', i: number, feat: Feature) => {
    setRows[tab](prev => prev.map((f, idx) => idx === i ? feat : f));
  }, []);

  const deleteItem = useCallback((tab: 'row1' | 'row2', i: number) => {
    setRows[tab](prev => prev.filter((_, idx) => idx !== i));
  }, []);

  const addItem = useCallback((tab: 'row1' | 'row2') => {
    setRows[tab](prev => [...prev, { label: 'Nova feature', icon: 'Zap', color: '#f97316', bg: '#fff7ed' }]);
  }, []);

  const moveUp = useCallback((tab: 'row1' | 'row2', i: number) => {
    if (i === 0) return;
    setRows[tab](prev => { const a = [...prev]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; return a; });
  }, []);

  const moveDown = useCallback((tab: 'row1' | 'row2', i: number) => {
    setRows[tab](prev => { if (i >= prev.length - 1) return prev; const a = [...prev]; [a[i], a[i + 1]] = [a[i + 1], a[i]]; return a; });
  }, []);

  const resetRow = (tab: 'row1' | 'row2') => {
    if (!confirm('Restaurar os itens padrão desta faixa?')) return;
    setRows[tab](tab === 'row1' ? [...DEFAULT_ROW1] : [...DEFAULT_ROW2]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateContent({
        'features.row1': JSON.stringify(row1),
        'features.row2': JSON.stringify(row2),
      });
      toast.success('Faixa de features salva!');
    } catch {
      toast.error('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const currentRow = rows[activeTab];
  const otherLabel = activeTab === 'row1' ? 'Faixa 2 (reversa)' : 'Faixa 1 (normal)';

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Faixa de Features</h1>
          <p className="text-sm text-gray-500 mt-1">Dois carrosséis de funcionalidades exibidos na seção intermediária do site</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all"
          style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', opacity: saving ? 0.7 : 1 }}>
          <Save className="w-4 h-4" /> {saving ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['row1', 'row2'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              background: activeTab === tab ? '#f97316' : '#f9fafb',
              color: activeTab === tab ? '#fff' : '#6b7280',
              border: activeTab === tab ? '1.5px solid #f97316' : '1.5px solid #e5e7eb',
            }}>
            {tab === 'row1' ? '⟶ Faixa 1 (normal)' : '⟵ Faixa 2 (reversa)'}
          </button>
        ))}
      </div>

      {/* Conteúdo da aba */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: '#6b7280', fontFamily: "'DM Sans', sans-serif" }}>
            <strong style={{ color: '#111827' }}>{currentRow.length}</strong> features • O carrossel duplica automaticamente para loop contínuo
          </p>
          <button onClick={() => resetRow(activeTab)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#f9fafb', fontSize: 12, color: '#6b7280', cursor: 'pointer' }}>
            <RotateCcw size={11} /> Restaurar padrões
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {currentRow.map((feat, i) => (
            <FeatureItemEditor
              key={i}
              feat={feat}
              index={i}
              onChange={(idx, f) => changeItem(activeTab, idx, f)}
              onDelete={(idx) => deleteItem(activeTab, idx)}
              onMoveUp={(idx) => moveUp(activeTab, idx)}
              onMoveDown={(idx) => moveDown(activeTab, idx)}
              isFirst={i === 0}
              isLast={i === currentRow.length - 1}
            />
          ))}
        </div>

        <button onClick={() => addItem(activeTab)}
          style={{
            display: 'flex', alignItems: 'center', gap: 7, marginTop: 12,
            padding: '9px 16px', borderRadius: 10, border: '1.5px dashed #e5e7eb',
            background: '#fafafa', fontSize: 13, color: '#6b7280', cursor: 'pointer', width: '100%', justifyContent: 'center',
          }}>
          <Plus size={14} /> Adicionar feature
        </button>
      </div>

      {/* Preview strip */}
      <div style={{ marginTop: 20, padding: 16, borderRadius: 16, background: '#f9fafb', border: '1px solid #e5e7eb' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
          Preview — {activeTab === 'row1' ? 'Faixa 1' : 'Faixa 2'}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {currentRow.map((feat, i) => <FeaturePreview key={i} feat={feat} />)}
        </div>
      </div>
    </div>
  );
}
