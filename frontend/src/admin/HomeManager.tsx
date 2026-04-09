// src/admin/HomeManager.tsx — Editor de conteúdo da home, seção por seção

import React, { useEffect, useMemo, useState } from 'react';
import {
  Eye,
  Image as ImageIcon,
  LayoutTemplate,
  Link2,
  Phone,
  Plus,
  Save,
  RotateCcw,
  Sparkles,
  Layers3,
  Layout,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ImageUploadField } from '@/components/ImageUploadField';
import { useToast } from '@/hooks/use-toast';
import type { ImgSpec } from '@/components/ImageUploadField';

type FieldType = 'text' | 'textarea' | 'image' | 'toggle';

type FieldDef = {
  key: string;
  label: string;
  type?: FieldType;
  placeholder?: string;
  rows?: number;
  hint?: string;
  spec?: ImgSpec;
};

type SectionDef = {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  previewUrl: string;
  fields: FieldDef[];
};

const HOME_SECTIONS: SectionDef[] = [
  {
    id: 'photo-highlight',
    icon: ImageIcon,
    title: 'Foto com Escrita',
    description: 'Blocos de destaque com imagem, texto e botão. Ative e preencha para exibir na home.',
    previewUrl: '/#home-highlight',
    fields: [
      {
        key: 'home_highlight.enabled',
        label: 'Exibir na home',
        type: 'toggle',
        hint: 'Quando ativado, os blocos aparecem na página inicial (conforme posição no Editor de Layout).',
      },
    ],
  },
  {
    id: 'quicklinks',
    icon: Link2,
    title: 'Links Rápidos',
    description: 'Faixa de atalhos logo após o banner principal.',
    previewUrl: '/#quicklinks',
    fields: [
      { key: 'quicklinks.title', label: 'Título da seção', placeholder: 'Acesso Rápido' },
      { key: 'quicklinks.subtitle', label: 'Subtítulo', placeholder: 'Encontre o que precisa com agilidade' },
    ],
  },
  {
    id: 'solutions',
    icon: Layers3,
    title: 'Soluções',
    description: 'Textos da vitrine de soluções da home.',
    previewUrl: '/#solutions',
    fields: [
      { key: 'solutions.title', label: 'Título da seção', placeholder: 'Nossas Soluções' },
      { key: 'solutions.subtitle', label: 'Linha 1', placeholder: 'Tecnologia completa para o seu' },
      { key: 'solutions.subtitle2', label: 'Linha 2 em destaque', placeholder: 'negócio crescer' },
      { key: 'solutions.description', label: 'Descrição', type: 'textarea', rows: 3 },
      { key: 'solutions.viewAll', label: 'Texto do botão', placeholder: 'Ver Todas as Soluções' },
    ],
  },
  {
    id: 'stats',
    icon: Sparkles,
    title: 'Números / Estatísticas',
    description: 'Cabeçalho da seção de indicadores. Os números são cadastrados em Estatísticas.',
    previewUrl: '/#numbers',
    fields: [
      { key: 'stats.title', label: 'Título', placeholder: 'Nossos Números' },
      { key: 'stats.subtitle', label: 'Subtítulo', placeholder: 'Resultados que comprovam nossa presença' },
      { key: 'stats.description', label: 'Descrição', type: 'textarea', rows: 3 },
    ],
  },
  {
    id: 'segments',
    icon: LayoutTemplate,
    title: 'Segmentos',
    description: 'Texto da seção de segmentos atendidos.',
    previewUrl: '/#segments',
    fields: [
      { key: 'segments.title', label: 'Título da seção', placeholder: 'Segmentos Atendidos' },
      { key: 'segments.subtitle', label: 'Linha 1', placeholder: 'Soluções para cada' },
      { key: 'segments.subtitle2', label: 'Linha 2 em destaque', placeholder: 'setor do varejo' },
      { key: 'segments.description', label: 'Descrição', type: 'textarea', rows: 3 },
      { key: 'segments.viewAll', label: 'Texto do botão', placeholder: 'Ver Todos os Segmentos' },
    ],
  },
  {
    id: 'differentials',
    icon: Sparkles,
    title: 'Diferenciais',
    description: 'Argumentos de valor exibidos na home.',
    previewUrl: '/#differentials',
    fields: [
      { key: 'differentials.title', label: 'Título', placeholder: 'Por que a Unimaxx?' },
      { key: 'differentials.subtitle', label: 'Linha 1', placeholder: 'Nossos' },
      { key: 'differentials.subtitle2', label: 'Linha 2 em destaque', placeholder: 'diferenciais' },
      { key: 'differentials.description', label: 'Descrição', type: 'textarea', rows: 3 },
      { key: 'differentials.item1_title', label: 'Card 1 — título', placeholder: 'Suporte 24/7' },
      { key: 'differentials.item1_desc', label: 'Card 1 — descrição', type: 'textarea', rows: 2 },
      { key: 'differentials.item2_title', label: 'Card 2 — título', placeholder: 'Integração Total' },
      { key: 'differentials.item2_desc', label: 'Card 2 — descrição', type: 'textarea', rows: 2 },
      { key: 'differentials.item3_title', label: 'Card 3 — título', placeholder: 'Experiência no Varejo' },
      { key: 'differentials.item3_desc', label: 'Card 3 — descrição', type: 'textarea', rows: 2 },
      { key: 'differentials.item4_title', label: 'Card 4 — título', placeholder: 'Escalabilidade' },
      { key: 'differentials.item4_desc', label: 'Card 4 — descrição', type: 'textarea', rows: 2 },
    ],
  },
  {
    id: 'contact',
    icon: Phone,
    title: 'Contato / CTA Final',
    description: 'Último bloco da home com chamada comercial e formulário.',
    previewUrl: '/#contato',
    fields: [
      { key: 'contact.title', label: 'Título', placeholder: 'Vamos' },
      { key: 'contact.subtitle', label: 'Palavra em destaque', placeholder: 'conversar?' },
      { key: 'contact.description', label: 'Descrição', type: 'textarea', rows: 3 },
      { key: 'contact.form.title', label: 'Título do formulário', placeholder: 'Receba uma ligação' },
      { key: 'contact.form.submit', label: 'Texto do botão enviar', placeholder: 'Solicitar Contato' },
      { key: 'contact.phone', label: 'Telefone', placeholder: '0800 000 0000' },
      { key: 'contact.email', label: 'E-mail', placeholder: 'contato@empresa.com.br' },
      { key: 'contact.whatsapp', label: 'WhatsApp (só números)', placeholder: '5511999999999' },
    ],
  },
];

// ── Campo ────────────────────────────────────────────────────────────────────

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div>
        <label className="text-xs font-semibold text-[#1d1d1f]">{label}</label>
        {hint && <p className="text-[11px] text-[#98989d] mt-0.5 leading-relaxed">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

// ── Renderizador de campo ────────────────────────────────────────────────────

function FieldRenderer({
  field, value, changed, onChange, onUpload, uploading,
}: {
  field: FieldDef; value: string; changed: boolean;
  onChange: (v: string) => void; onUpload: (f: File) => Promise<void>; uploading: boolean;
}) {
  const borderStyle = {
    borderColor: changed ? '#f97316' : 'rgba(0,0,0,.1)',
    background: changed ? 'rgba(249,115,22,.03)' : undefined,
  };

  if (field.type === 'image') {
    return (
      <Field label={field.label} hint={field.hint}>
        <ImageUploadField
          value={value}
          onChange={onChange}
          onUpload={onUpload}
          uploading={uploading}
          spec={field.spec || { dimensions: 'Livre', formats: 'JPG, PNG, WEBP', maxSize: '2 MB', where: 'Home' }}
          height={160}
        />
      </Field>
    );
  }

  if (field.type === 'toggle') {
    const isOn = value !== '0' && value !== '';
    return (
      <div
        className="rounded-2xl border px-4 py-3.5 flex items-center justify-between"
        style={{
          borderColor: isOn ? '#fdba74' : 'rgba(0,0,0,.08)',
          background: isOn ? '#fff7ed' : '#fafafa',
        }}
      >
        <div>
          <p className="text-sm font-semibold text-[#1d1d1f]">{field.label}</p>
          {field.hint && <p className="text-[11px] text-[#98989d] mt-0.5 leading-relaxed max-w-sm">{field.hint}</p>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          {isOn && (
            <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">Ativo</span>
          )}
          <Switch
            checked={isOn}
            onCheckedChange={(checked) => onChange(checked ? '1' : '0')}
          />
        </div>
      </div>
    );
  }

  if (field.type === 'textarea') {
    return (
      <Field label={field.label} hint={field.hint}>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={field.rows || 3}
          placeholder={field.placeholder}
          className="rounded-xl resize-none"
          style={borderStyle}
        />
      </Field>
    );
  }

  return (
    <Field label={field.label} hint={field.hint}>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder || ''}
        className="rounded-xl"
        style={borderStyle}
      />
    </Field>
  );
}

// ── Botão de navegação lateral ───────────────────────────────────────────────

function SectionNavButton({
  section, active, dirtyCount, onClick,
}: {
  section: SectionDef; active: boolean; dirtyCount: number; onClick: () => void;
}) {
  const Icon = section.icon;
  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl border px-4 py-3 text-left transition-all"
      style={{
        borderColor: active ? '#fdba74' : dirtyCount ? '#fed7aa' : 'rgba(0,0,0,.07)',
        background: active ? '#fff7ed' : '#fff',
        boxShadow: active ? '0 4px 20px rgba(249,115,22,.10)' : 'none',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: active ? 'rgba(249,115,22,.12)' : '#f5f5f7' }}
        >
          <Icon className="w-4 h-4" style={{ color: active ? '#f97316' : '#6b7280' }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[13px] font-bold text-[#1d1d1f] truncate">{section.title}</p>
            {dirtyCount > 0 && (
              <span className="text-[9px] font-bold uppercase tracking-wide text-orange-600 bg-orange-50 border border-orange-200 rounded-full px-1.5 py-0.5 flex-shrink-0">
                {dirtyCount} alt.
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#6b7280] mt-0.5 leading-4 line-clamp-2">{section.description}</p>
        </div>
      </div>
    </button>
  );
}


// ── Tipo de item highlight ───────────────────────────────────────────────────

type HighlightItem = {
  image: string;
  badge: string;
  title: string;
  description: string;
  cta_text: string;
  cta_link: string;
  image_position: string;
};

function emptyItem(): HighlightItem {
  return { image: '', badge: '', title: '', description: '', cta_text: '', cta_link: '/cliente', image_position: 'right' };
}

function parseItems(raw: string): HighlightItem[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {}
  return [];
}

// ── Editor de múltiplos blocos Foto com Escrita ──────────────────────────────

function PhotoHighlightEditor({
  values, edited, onChange, onUpload, uploadingKey,
}: {
  values: Record<string, string>;
  edited: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onUpload: (key: string, file: File) => Promise<void>;
  uploadingKey: string | null;
}) {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  const token = localStorage.getItem('token');

  // Toggle enabled
  const enabledVal = values['home_highlight.enabled'];
  const isOn = enabledVal !== '0' && enabledVal !== '';

  // Items stored as JSON in home_highlight.items
  // Falls back to legacy single fields if no items key yet
  const rawItems = values['home_highlight.items'] || '';
  const legacyItem: HighlightItem = {
    image: values['home_highlight.image'] || '',
    badge: values['home_highlight.badge'] || '',
    title: values['home_highlight.title'] || '',
    description: values['home_highlight.description'] || '',
    cta_text: values['home_highlight.cta_text'] || '',
    cta_link: values['home_highlight.cta_link'] || '/cliente',
    image_position: values['home_highlight.image_position'] || 'right',
  };
  const hasLegacy = !!(legacyItem.image || legacyItem.title || legacyItem.badge);
  const items: HighlightItem[] = rawItems ? parseItems(rawItems) : (hasLegacy ? [legacyItem] : [emptyItem()]);

  const setItems = (next: HighlightItem[]) => {
    onChange('home_highlight.items', JSON.stringify(next));
  };

  const updateItem = (i: number, field: keyof HighlightItem, val: string) => {
    const next = items.map((item, idx) => idx === i ? { ...item, [field]: val } : item);
    setItems(next);
  };

  const addItem = () => setItems([...items, emptyItem()]);
  const removeItem = (i: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, idx) => idx !== i));
  };

  const [uploadingIdx, setUploadingIdx] = React.useState<number | null>(null);
  const uploadForItem = async (i: number, file: File) => {
    setUploadingIdx(i);
    try {
      const fd = new FormData(); fd.append('image', file);
      const res = await fetch(`${API_URL}/admin/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
      if (!res.ok) throw new Error('Upload falhou');
      const { url } = await res.json();
      updateItem(i, 'image', url);
    } finally { setUploadingIdx(null); }
  };

  const borderStyle = (changed: boolean) => ({
    borderColor: changed ? '#f97316' : 'rgba(0,0,0,.1)',
    background: changed ? 'rgba(249,115,22,.03)' : undefined,
  });

  const itemsChanged = edited['home_highlight.items'] !== undefined;

  return (
    <div className="space-y-5">
      {/* Toggle exibir na home */}
      <FieldRenderer
        field={{ key: 'home_highlight.enabled', label: 'Exibir na home', type: 'toggle', hint: 'Quando ativado, os blocos aparecem na página inicial (conforme posição no Editor de Layout).' }}
        value={enabledVal ?? '1'}
        changed={edited['home_highlight.enabled'] !== undefined}
        onChange={(val) => onChange('home_highlight.enabled', val)}
        onUpload={async () => {}}
        uploading={false}
      />

      {/* Lista de blocos */}
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(0,0,0,.09)' }}>
            {/* Header do bloco */}
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(0,0,0,.06)', background: '#fafafa' }}>
              <span className="text-[13px] font-bold text-[#1d1d1f]" style={{ fontFamily: "'Outfit',sans-serif" }}>
                🖼️ Bloco {i + 1}
              </span>
              {items.length > 1 && (
                <button onClick={() => removeItem(i)}
                  className="flex items-center gap-1.5 text-[12px] font-semibold text-red-400 hover:text-red-600 hover:bg-red-50 px-2.5 py-1 rounded-lg transition">
                  <Trash2 className="w-3.5 h-3.5" /> Remover
                </button>
              )}
            </div>

            <div className="p-5 grid gap-4 md:grid-cols-2">
              {/* Foto */}
              <div className="md:col-span-2">
                <Field label="Foto principal" hint="Prefira imagens horizontais de alta resolução.">
                  <ImageUploadField
                    value={item.image}
                    onChange={(url) => updateItem(i, 'image', url)}
                    onUpload={(file) => uploadForItem(i, file)}
                    uploading={uploadingIdx === i}
                    spec={{ dimensions: '1600 × 900 px', formats: 'JPG, PNG, WEBP', maxSize: '2 MB', where: `Bloco ${i + 1}` }}
                    height={140}
                  />
                </Field>
              </div>

              {/* Badge */}
              <div>
                <Field label="Badge / etiqueta">
                  <Input value={item.badge} onChange={(e) => updateItem(i, 'badge', e.target.value)}
                    placeholder="Ex: Destaque" className="rounded-xl"
                    style={borderStyle(itemsChanged)} />
                </Field>
              </div>

              {/* Posição da foto */}
              <div>
                <Field label="Posição da foto">
                  <div className="grid grid-cols-2 gap-2">
                    {[{ v: 'right', label: '← Texto | Foto →' }, { v: 'left', label: '← Foto | Texto →' }].map(o => {
                      const sel = (item.image_position || 'right') === o.v;
                      return (
                        <button key={o.v} onClick={() => updateItem(i, 'image_position', o.v)}
                          className="py-2 rounded-xl border-2 text-[12px] font-bold transition"
                          style={{ borderColor: sel ? '#f97316' : 'rgba(0,0,0,.08)', background: sel ? '#fff7ed' : '#fafafa', color: sel ? '#f97316' : '#6e6e73' }}>
                          {o.label}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              </div>

              {/* Título */}
              <div className="md:col-span-2">
                <Field label="Título">
                  <textarea value={item.title} onChange={(e) => updateItem(i, 'title', e.target.value)}
                    placeholder="Tecnologia, atendimento e performance para fazer sua operação crescer."
                    rows={2}
                    className="w-full rounded-xl border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
                    style={borderStyle(itemsChanged)} />
                </Field>
              </div>

              {/* Descrição */}
              <div className="md:col-span-2">
                <Field label="Descrição">
                  <textarea value={item.description} onChange={(e) => updateItem(i, 'description', e.target.value)}
                    placeholder="Use este espaço para reforçar proposta de valor, campanha ou institucional."
                    rows={3}
                    className="w-full rounded-xl border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
                    style={borderStyle(itemsChanged)} />
                </Field>
              </div>

              {/* Botão */}
              <div>
                <Field label="Texto do botão">
                  <Input value={item.cta_text} onChange={(e) => updateItem(i, 'cta_text', e.target.value)}
                    placeholder="Falar com especialista" className="rounded-xl"
                    style={borderStyle(itemsChanged)} />
                </Field>
              </div>
              <div>
                <Field label="Link do botão">
                  <Input value={item.cta_link} onChange={(e) => updateItem(i, 'cta_link', e.target.value)}
                    placeholder="/cliente" className="rounded-xl"
                    style={borderStyle(itemsChanged)} />
                </Field>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Botão adicionar */}
      <button onClick={addItem}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed text-[13px] font-bold transition hover:bg-orange-50"
        style={{ borderColor: '#f97316', color: '#f97316' }}>
        <Plus className="w-4 h-4" /> Adicionar Foto com Escrita
      </button>
    </div>
  );
}

// ── Painel de edição da seção ────────────────────────────────────────────────

function SectionEditorPanel({
  section, values, edited, onChange, onUpload, uploadingKey,
}: {
  section: SectionDef;
  values: Record<string, string>;
  edited: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onUpload: (key: string, file: File) => Promise<void>;
  uploadingKey: string | null;
}) {
  const dirtyCount = section.fields.filter((f) => edited[f.key] !== undefined).length;

  return (
    <div
      className="rounded-[28px] border bg-white overflow-hidden"
      style={{ borderColor: dirtyCount ? '#fdba74' : 'rgba(0,0,0,.07)' }}
    >
      {/* Header do painel */}
      <div
        className="px-6 py-5 border-b"
        style={{ borderColor: 'rgba(0,0,0,.06)', background: 'linear-gradient(to right, #fff, #fff7ed)' }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-black text-[#1d1d1f]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {section.title}
              </h2>
              {dirtyCount > 0 && (
                <span className="text-[10px] font-bold uppercase tracking-wide text-orange-600 bg-orange-50 border border-orange-200 rounded-full px-2 py-0.5">
                  {dirtyCount} alteração{dirtyCount !== 1 ? 'ões' : ''}
                </span>
              )}
            </div>
            <p className="text-sm text-[#6b7280] mt-1.5">{section.description}</p>
          </div>
          <a
            href={section.previewUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold text-[#1d1d1f] hover:bg-[#fafafa] transition-colors flex-shrink-0"
            style={{ borderColor: 'rgba(0,0,0,.09)' }}
          >
            <Eye className="w-4 h-4" /> Ver no site
          </a>
        </div>

        {/* Aviso especial para Foto com Escrita */}
        {section.id === 'photo-highlight' && (
          <div className="mt-4 rounded-xl px-4 py-3 text-sm flex items-start gap-2.5"
            style={{ background: 'rgba(249,115,22,.07)', border: '1px solid rgba(249,115,22,.2)' }}>
            <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
            <p className="text-[#92400e] leading-relaxed">
              <strong>Como funciona:</strong> Ative o toggle "Exibir na home", preencha ao menos um campo de conteúdo e salve.
              A seção aparecerá na home conforme a posição definida no{' '}
              <a href="/admin/layout" className="underline font-semibold">Editor de Layout</a>.
            </p>
          </div>
        )}
      </div>

      {/* Campos */}
      <div className="p-6">
        {section.id === 'photo-highlight' ? (
          <PhotoHighlightEditor
            values={values}
            edited={edited}
            onChange={onChange}
            onUpload={onUpload}
            uploadingKey={uploadingKey}
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {section.fields.map((field) => (
              <div
                key={field.key}
                className={
                  field.type === 'textarea' || field.type === 'image' || field.type === 'toggle'
                    ? 'md:col-span-2'
                    : ''
                }
              >
                <FieldRenderer
                  field={field}
                  value={values[field.key] ?? ''}
                  changed={edited[field.key] !== undefined}
                  onChange={(val) => onChange(field.key, val)}
                  onUpload={async (file) => onUpload(field.key, file)}
                  uploading={uploadingKey === field.key}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────────────────────

export function HomeManager() {
  const { data, updateContent, uploadImage } = useData();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [edited, setEdited] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('photo-highlight');

  useEffect(() => { setEdited({}); }, [data.content]);

  const values = useMemo(() => ({ ...data.content, ...edited }), [data.content, edited]);
  const changedCount = Object.keys(edited).length;
  const selectedSection = HOME_SECTIONS.find((s) => s.id === selectedSectionId) ?? HOME_SECTIONS[0];

  const setValue = (key: string, value: string) => {
    const original = data.content?.[key] ?? '';
    setEdited((prev) => {
      if (value === original) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: value };
    });
  };

  const handleUpload = async (key: string, file: File) => {
    setUploadingKey(key);
    try {
      const url = await uploadImage(file);
      setValue(key, url);
      toast({ title: '✅ Imagem enviada!' });
    } catch {
      toast({ title: 'Erro no upload', variant: 'destructive' });
    } finally {
      setUploadingKey(null);
    }
  };

  const handleSave = async () => {
    if (!changedCount) return;
    setSaving(true);
    try {
      await updateContent(edited);
      setEdited({});
      toast({ title: '✅ Home atualizada com sucesso!' });
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-[1300px] mx-auto space-y-6">

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-orange-500 mb-1.5">
            Edição da Home
          </p>
          <h1 className="text-2xl font-black text-[#1d1d1f]" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Conteúdo da Página Inicial
          </h1>
          <p className="text-sm text-[#6b7280] mt-1.5">
            Edite os textos de cada seção da home. Banners e layout são gerenciados em seções próprias.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {changedCount > 0 && (
            <span className="text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-3 py-2 rounded-full">
              {changedCount} alteração{changedCount !== 1 ? 'ões' : ''} pendente{changedCount !== 1 ? 's' : ''}
            </span>
          )}
          <Button
            variant="outline"
            onClick={() => setEdited({})}
            disabled={!changedCount}
            className="rounded-xl"
          >
            <RotateCcw className="w-4 h-4 mr-2" /> Descartar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!changedCount || saving}
            className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar Home'}
          </Button>
        </div>
      </div>

      {/* Atalhos rápidos */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/admin/banners')}
          className="flex items-center gap-3 rounded-2xl border bg-white px-5 py-4 text-left hover:border-orange-200 hover:shadow-sm transition-all"
          style={{ borderColor: 'rgba(0,0,0,.07)' }}
        >
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
            <ImageIcon className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#1d1d1f]">Banner / Carrossel</p>
            <p className="text-xs text-[#6b7280] mt-0.5">Imagens, estilos e CTAs do topo</p>
          </div>
        </button>
        <button
          onClick={() => navigate('/admin/layout')}
          className="flex items-center gap-3 rounded-2xl border bg-white px-5 py-4 text-left hover:border-blue-200 hover:shadow-sm transition-all"
          style={{ borderColor: 'rgba(0,0,0,.07)' }}
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <Layout className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#1d1d1f]">Editor de Layout</p>
            <p className="text-xs text-[#6b7280] mt-0.5">Ordem e visibilidade das seções</p>
          </div>
        </button>
      </div>

      {/* Layout principal: sidebar + painel */}
      <div className="grid lg:grid-cols-[300px_minmax(0,1fr)] gap-5 items-start">

        {/* Sidebar de navegação */}
        <aside
          className="rounded-[24px] border p-4 space-y-2 sticky top-6"
          style={{ borderColor: 'rgba(0,0,0,.07)', background: '#fcfcfd' }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#98989d] px-1 pb-1">
            Seções editáveis
          </p>
          {HOME_SECTIONS.map((section) => {
            const dirtyCount = section.fields.filter((f) => edited[f.key] !== undefined).length;
            return (
              <SectionNavButton
                key={section.id}
                section={section}
                active={selectedSectionId === section.id}
                dirtyCount={dirtyCount}
                onClick={() => setSelectedSectionId(section.id)}
              />
            );
          })}
        </aside>

        {/* Painel de edição */}
        <div className="min-w-0">
          <SectionEditorPanel
            section={selectedSection}
            values={values}
            edited={edited}
            onChange={setValue}
            onUpload={handleUpload}
            uploadingKey={uploadingKey}
          />
        </div>
      </div>
    </div>
  );
}
