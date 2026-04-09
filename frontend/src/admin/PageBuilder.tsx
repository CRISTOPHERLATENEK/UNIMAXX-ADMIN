import React, { useState, useRef } from 'react';
import {
  Plus, X, ChevronUp, ChevronDown, Eye, EyeOff,
  GripVertical, Layers,
  AlignCenter, AlignLeft, LayoutGrid, List, Rows,
  Maximize2, Minimize2, Square,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ImageUploadField } from '@/components/ImageUploadField';
import type { PageBlock, BlockType, FeaturesLayout, BenefitsLayout, BlockSpacing, BlockRadius } from '@/types';

export type { PageBlock, BlockType };

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Ícones Lucide mais usados para seleção rápida
const ICON_LIBRARY = [
  '✅','⚡','🚀','🎯','💡','🔒','📊','🌐','📱','💳','🛒','🏪','🚛','⭐','🔗',
  '📈','🤝','🧩','💬','📞','🎁','🏆','🔧','📝','👥','🌟','💰','🕐','🔑','📋',
  '✨','🎨','🔔','📦','🏗️','🤖','💎','🌱','📡','🔐',
];

const BLOCK_CATALOG = [
  { type: 'hero'         as BlockType, label: 'Hero',            description: 'Cabeçalho criativo com variantes visuais',  emoji: '🌟' },
  { type: 'features'     as BlockType, label: 'Funcionalidades',  description: 'Lista de recursos em grid',                emoji: '✅' },
  { type: 'benefits'     as BlockType, label: 'Benefícios',       description: 'Resultados e ganhos — fundo escuro',       emoji: '⚡' },
  { type: 'steps'        as BlockType, label: 'Como Funciona',    description: 'Passo a passo numerado',                   emoji: '🔢' },
  { type: 'stats'        as BlockType, label: 'Estatísticas',     description: 'Números de impacto em destaque',           emoji: '📊' },
  { type: 'testimonial'  as BlockType, label: 'Depoimento',       description: 'Citação de cliente',                      emoji: '💬' },
  { type: 'faq'          as BlockType, label: 'FAQ',              description: 'Perguntas frequentes com acordeão',        emoji: '❓' },
  { type: 'video'        as BlockType, label: 'Vídeo',            description: 'Embed YouTube',                           emoji: '▶️' },
  { type: 'cta'          as BlockType, label: 'CTA',              description: 'Chamada para ação com gradiente',          emoji: '📣' },
  { type: 'text'         as BlockType, label: 'Texto Simples',    description: 'Parágrafo ou título de texto',             emoji: '📝' },
  { type: 'richtext'     as BlockType, label: 'Rich Text',        description: 'HTML livre',                              emoji: '🖊️' },
  { type: 'image'        as BlockType, label: 'Imagem',           description: 'Imagem com legenda opcional',             emoji: '🖼️' },
  { type: 'integrations' as BlockType, label: 'Integrações',      description: 'Tags de sistemas compatíveis',            emoji: '🔌' },
  { type: 'image_text'   as BlockType, label: 'Imagem + Texto',  description: 'Imagem ao lado com título e descrição', emoji: '🖼️' },
  { type: 'divider'      as BlockType, label: 'Divisor',          description: 'Separador visual entre seções',           emoji: '➖' },
];

const HERO_LAYOUTS = [
  { id: 'centered',   label: 'Centralizado',   desc: 'Título grande ao centro, gradiente de fundo' },
  { id: 'split',      label: 'Dividido',        desc: 'Texto à esquerda, imagem à direita' },
  { id: 'dark_glow',  label: 'Dark Glow',       desc: 'Fundo preto com glow neon da cor do tema' },
  { id: 'magazine',   label: 'Magazine',        desc: 'Imagem de fundo full-bleed com overlay' },
  { id: 'cinematic',  label: 'Cinematic',       desc: 'Estilo banner/game — imagem + título à esquerda + botão vídeo' },
];

function makeBlock(type: BlockType): PageBlock {
  const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
  const b: PageBlock = { id, type, visible: true, blockSpacing: 'normal', blockRadius: 'large' };
  if (type === 'hero')         return { ...b, heroLayout:'centered', title:'', subtitle:'', description:'', ctaLabel:'Falar com Especialista', ctaLink:'/cliente', colorTheme:'brand', badge:'' };
  if (type === 'features')     return { ...b, title:'Funcionalidades', items:[], colorTheme:'dark' };
  if (type === 'benefits')     return { ...b, title:'Benefícios', items:[], benefitsLayout:'grid_cards', colorTheme:'dark' };
  if (type === 'steps')        return { ...b, title:'Como funciona', steps:[], colorTheme:'light' };
  if (type === 'stats')        return { ...b, stats:[], colorTheme:'light' };
  if (type === 'testimonial')  return { ...b, quote:'', author:'', role:'', colorTheme:'dark' };
  if (type === 'faq')          return { ...b, title:'Perguntas Frequentes', faq:[], colorTheme:'light' };
  if (type === 'video')        return { ...b, title:'', videoUrl:'', colorTheme:'dark' };
  if (type === 'cta')          return { ...b, title:'', description:'', ctaLabel:'Falar com Especialista', ctaLink:'/cliente', colorTheme:'brand' };
  if (type === 'text')         return { ...b, title:'', description:'', colorTheme:'light' };
  if (type === 'richtext')     return { ...b, html:'', colorTheme:'light' };
  if (type === 'image')        return { ...b, imageUrl:'', imageAlt:'', colorTheme:'light' };
  if (type === 'integrations') return { ...b, title:'Integrações', items:[], colorTheme:'light' };
  if (type === 'image_text')   return { ...b, title:'', description:'', imageUrl:'', imageAlt:'', imagePosition:'right', colorTheme:'dark', blockSpacing:'normal', blockRadius:'large' };
  if (type === 'divider')      return { ...b, dividerStyle:'line', colorTheme:'light' };
  return b;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function FL({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-1">
      <Label className="text-[12px] font-semibold text-[#1d1d1f]">{children}</Label>
      {hint && <p className="text-[11px] text-[#98989d] mt-0.5">{hint}</p>}
    </div>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 pt-1 pb-0.5">
      <div className="h-px flex-1" style={{ background: 'rgba(0,0,0,.07)' }} />
      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#aeaeb2' }}>{label}</span>
      <div className="h-px flex-1" style={{ background: 'rgba(0,0,0,.07)' }} />
    </div>
  );
}

function TagList({ items, onChange, placeholder }: { items: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [draft, setDraft] = useState('');
  const add = () => { const v = draft.trim(); if (v) { onChange([...items, v]); setDraft(''); } };
  return (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 group">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] bg-[#f5f5f7]">
            <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 text-[#98989d]">{i+1}</span>
            <span className="flex-1 leading-snug">{item}</span>
          </div>
          <button onClick={() => onChange(items.filter((_,j)=>j!==i))}
            className="w-6 h-6 rounded-lg flex items-center justify-center text-[#c7c7cc] opacity-0 group-hover:opacity-100 transition hover:text-red-400 hover:bg-red-50">
            <X style={{width:11,height:11}} />
          </button>
        </div>
      ))}
      <div className="flex gap-2">
        <Input value={draft} onChange={e=>setDraft(e.target.value)} placeholder={placeholder||'Adicionar item…'} className="h-8 text-[13px]"
          onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();add();}}} />
        <Button size="sm" variant="outline" onClick={add} className="h-8 px-3 flex-shrink-0"><Plus style={{width:13,height:13}}/></Button>
      </div>
    </div>
  );
}

// ── Seletor de ícone emojis ───────────────────────────────────────────────────

function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState('');
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition"
        style={{ borderColor: open ? '#f97316' : 'rgba(0,0,0,.1)', background: '#fafafa' }}>
        <span className="text-xl leading-none">{value || '🔹'}</span>
        <span className="text-[12px]" style={{ color: '#6e6e73' }}>Trocar ícone</span>
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-50 bg-white rounded-2xl shadow-xl border p-3 w-64"
          style={{ borderColor: 'rgba(0,0,0,.08)' }}>
          <div className="grid grid-cols-8 gap-1 mb-2">
            {ICON_LIBRARY.map(icon => (
              <button key={icon} onClick={() => { onChange(icon); setOpen(false); }}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-base transition hover:bg-orange-50 hover:scale-110"
                style={{ background: value === icon ? '#fff7ed' : 'transparent' }}>
                {icon}
              </button>
            ))}
          </div>
          <div className="border-t pt-2" style={{ borderColor: 'rgba(0,0,0,.06)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#aeaeb2' }}>
              Ou cole qualquer emoji
            </p>
            <div className="flex gap-1.5">
              <Input value={custom} onChange={e => setCustom(e.target.value)} placeholder="🔑" className="h-7 text-sm" />
              <Button size="sm" className="h-7 px-2 text-[11px]" onClick={() => { if (custom.trim()) { onChange(custom.trim()); setCustom(''); setOpen(false); } }}>
                OK
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Controles de espaçamento e bordas ────────────────────────────────────────

function SpacingRadiusControls({ block, onChange }: { block: PageBlock; onChange: (b: PageBlock) => void }) {
  const set = <K extends keyof PageBlock>(k: K, v: PageBlock[K]) => onChange({ ...block, [k]: v });

  const spacingOpts: { v: BlockSpacing; label: string; icon: React.ReactNode }[] = [
    { v: 'compact',  label: 'Compacto',  icon: <Minimize2 style={{width:12,height:12}}/> },
    { v: 'normal',   label: 'Normal',    icon: <Square style={{width:12,height:12}}/> },
    { v: 'spacious', label: 'Generoso',  icon: <Maximize2 style={{width:12,height:12}}/> },
  ];

  const radiusOpts: { v: BlockRadius; label: string }[] = [
    { v: 'none',   label: 'Quadrado' },
    { v: 'medium', label: 'Médio' },
    { v: 'large',  label: 'Arredondado' },
  ];

  return (
    <>
      <SectionDivider label="Espaçamento e Bordas" />
      <div>
        <FL hint="Padding vertical da seção">Espaçamento</FL>
        <div className="grid grid-cols-3 gap-1.5">
          {spacingOpts.map(o => (
            <button key={o.v} onClick={() => set('blockSpacing', o.v)}
              className="h-9 rounded-xl flex items-center justify-center gap-1.5 text-[11px] font-semibold border-2 transition"
              style={{
                borderColor: (block.blockSpacing || 'normal') === o.v ? '#f97316' : 'rgba(0,0,0,.08)',
                background: (block.blockSpacing || 'normal') === o.v ? '#fff7ed' : '#f5f5f7',
                color: (block.blockSpacing || 'normal') === o.v ? '#f97316' : '#6e6e73',
              }}>
              {o.icon}{o.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <FL hint="Border radius dos cards internos">Cantos dos Cards</FL>
        <div className="grid grid-cols-3 gap-1.5">
          {radiusOpts.map(o => (
            <button key={o.v} onClick={() => set('blockRadius', o.v)}
              className="h-9 rounded-xl text-[11px] font-semibold border-2 transition"
              style={{
                borderColor: (block.blockRadius || 'large') === o.v ? '#f97316' : 'rgba(0,0,0,.08)',
                background: (block.blockRadius || 'large') === o.v ? '#fff7ed' : '#f5f5f7',
                color: (block.blockRadius || 'large') === o.v ? '#f97316' : '#6e6e73',
              }}>
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

const BANNER_STYLES = [
  { id: 'cinematic', label: 'Cinemático' },
  { id: 'neon',      label: 'Neon' },
  { id: 'editorial', label: 'Editorial' },
  { id: 'split',     label: 'Dividido' },
  { id: 'bold',      label: 'Impacto' },
  { id: 'parallax',  label: 'Parallax' },
] as const;

function BannerStyleThumb({ id, accent }: { id: string; accent: string }) {
  const a = accent || '#f97316';
  const base: React.CSSProperties = { width: '100%', aspectRatio: '16/7', position: 'relative', overflow: 'hidden' };
  if (id === 'cinematic') return (
    <div style={{ ...base, background: '#070709' }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 70% 50%,${a}18,transparent 65%)` }} />
      <div style={{ position: 'absolute', top: 7, left: 7 }}>
        <div style={{ width: 18, height: 2, background: a, borderRadius: 2, marginBottom: 3 }} />
        <div style={{ width: 28, height: 4, background: '#fff', borderRadius: 2, marginBottom: 2 }} />
        <div style={{ width: 16, height: 8, background: a, borderRadius: 999, marginTop: 3 }} />
      </div>
    </div>
  );
  if (id === 'neon') return (
    <div style={{ ...base, background: '#04040a' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px)`, backgroundSize: '12px 12px' }} />
      <div style={{ position: 'absolute', top: -10, right: 4, width: 40, height: 40, borderRadius: '50%', background: `${a}30`, filter: 'blur(12px)' }} />
      <div style={{ position: 'absolute', top: 7, left: 7 }}>
        <div style={{ width: 22, height: 3, border: `1.5px solid ${a}`, borderRadius: 1, marginBottom: 3 }} />
        <div style={{ width: 28, height: 4, background: '#fff', borderRadius: 2, marginBottom: 2 }} />
        <div style={{ width: 18, height: 8, border: `2px solid ${a}`, background: `${a}14`, borderRadius: 999, marginTop: 3 }} />
      </div>
    </div>
  );
  if (id === 'editorial') return (
    <div style={{ ...base, background: '#f7f7f5' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: '42%', height: '100%', background: `linear-gradient(160deg,${a},${a}77)`, clipPath: 'polygon(14% 0,100% 0,100% 100%,0% 100%)' }} />
      <div style={{ position: 'absolute', top: 7, left: 7 }}>
        <div style={{ width: 22, height: 2, border: `1.5px solid ${a}`, borderRadius: 1, marginBottom: 3 }} />
        <div style={{ width: 26, height: 4, background: '#111', borderRadius: 2, marginBottom: 2 }} />
        <div style={{ width: 16, height: 8, background: a, borderRadius: 999, marginTop: 3 }} />
      </div>
    </div>
  );
  if (id === 'split') return (
    <div style={{ ...base, background: '#0c0c0f', display: 'flex' }}>
      <div style={{ flex: 1, background: '#1a1a20' }} />
      <div style={{ flex: 1, background: `linear-gradient(150deg,${a}ee,${a}77)`, display: 'flex', alignItems: 'center', padding: '0 6px' }}>
        <div>
          <div style={{ width: 20, height: 3, background: 'rgba(255,255,255,.4)', borderRadius: 2, marginBottom: 3 }} />
          <div style={{ width: 24, height: 4, background: '#fff', borderRadius: 2, marginBottom: 2 }} />
          <div style={{ width: 16, height: 7, background: '#fff', borderRadius: 999, marginTop: 3 }} />
        </div>
      </div>
    </div>
  );
  if (id === 'bold') return (
    <div style={{ ...base, background: '#0e0e11' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: '36%', height: '100%', background: a, clipPath: 'polygon(20% 0,100% 0,100% 100%,0% 100%)' }} />
      <div style={{ position: 'absolute', top: 7, left: 7 }}>
        <div style={{ width: 22, height: 3, background: a, borderRadius: 999, marginBottom: 3 }} />
        <div style={{ width: 30, height: 5, background: '#fff', borderRadius: 2, marginBottom: 2 }} />
        <div style={{ width: 18, height: 7, border: '2px solid rgba(255,255,255,.3)', borderRadius: 999, marginTop: 3 }} />
      </div>
    </div>
  );
  return (
    <div style={{ ...base, background: '#050507', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 60% 50%,rgba(255,255,255,.04) 0%,transparent 65%)' }} />
      <div style={{ position: 'absolute', left: 0, top: '10%', bottom: '10%', width: 2, background: `linear-gradient(to bottom,transparent,${a},transparent)`, borderRadius: 2 }} />
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(115deg,rgba(5,5,8,.9) 0%,rgba(5,5,8,.5) 50%,transparent 100%)` }} />
      <div style={{ position: 'absolute', top: 7, left: 10 }}>
        <div style={{ width: 18, height: 2, background: a, borderRadius: 2, marginBottom: 3 }} />
        <div style={{ width: 28, height: 4, background: '#fff', borderRadius: 2, marginBottom: 2 }} />
        <div style={{ width: 16, height: 7, background: a, borderRadius: 999, marginTop: 3 }} />
      </div>
    </div>
  );
}

// ── Hero Editor ───────────────────────────────────────────────────────────────

function HeroEditor({ block, onChange }: { block: PageBlock; onChange: (b: PageBlock) => void }) {
  const set = <K extends keyof PageBlock>(k: K, v: PageBlock[K]) => onChange({ ...block, [k]: v });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const token = localStorage.getItem('token');
  const BASE_URL = API_URL.replace('/api', '');
  const accent = block.accentColor || '#f97316';

  // use_default_bg: 0 = imagem, 1 = cor
  const useDefaultBg: number = (block as any).useDefaultBg ?? (block.imageUrl ? 0 : 1);
  const useStyle: number = (block as any).useStyle ?? 1;

  const uploadImg = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData(); fd.append('image', file);
      const res = await fetch(`${API_URL}/admin/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
      if (!res.ok) throw new Error('Upload falhou');
      const { url } = await res.json();
      onChange({ ...block, imageUrl: url, ...(({ useDefaultBg: 0 }) as any) });
    } finally { setUploading(false); }
  };

  const previewSrc = block.imageUrl
    ? (block.imageUrl.startsWith('http') ? block.imageUrl : `${BASE_URL}${block.imageUrl}`)
    : '';

  return (
    <div className="space-y-4">

      {/* ── Fundo do Banner ── */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,.07)', padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <p style={{ fontWeight: 600, fontSize: 14, color: '#1d1d1f', margin: 0 }}>Fundo do Banner</p>
            <p style={{ fontSize: 12, color: '#98989d', margin: '3px 0 0' }}>Imagem ou cor sólida</p>
          </div>
          <div style={{ display: 'flex', borderRadius: 10, border: '1px solid rgba(0,0,0,.1)', overflow: 'hidden' }}>
            {([{ v: 0, l: 'Imagem' }, { v: 1, l: 'Cor' }] as const).map(({ v, l }) => (
              <button key={v} onClick={() => onChange({ ...block, ...(({ useDefaultBg: v }) as any) })}
                style={{
                  padding: '7px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
                  background: useDefaultBg === v ? '#f97316' : 'transparent',
                  color: useDefaultBg === v ? '#fff' : '#6e6e73',
                  borderRight: v === 0 ? '1px solid rgba(0,0,0,.08)' : 'none',
                }}>{l}</button>
            ))}
          </div>
        </div>

        {useDefaultBg === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div
              style={{ position: 'relative', aspectRatio: '16/6', borderRadius: 12, overflow: 'hidden', cursor: previewSrc ? 'default' : 'pointer', background: '#111' }}
              onClick={() => !previewSrc && fileRef.current?.click()}
            >
              {previewSrc ? (
                <>
                  <img src={previewSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, opacity: 0, transition: 'opacity .2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0'; }}>
                    <button onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                      ↑ {uploading ? 'Enviando...' : 'Trocar imagem'}
                    </button>
                    <button onClick={e => { e.stopPropagation(); set('imageUrl', ''); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: '#ef4444', color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                      ✕ Remover
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, border: '2px dashed rgba(255,255,255,.15)', borderRadius: 12 }}>
                  {uploading
                    ? <span style={{ color: '#f97316', fontSize: 13 }}>Enviando...</span>
                    : <>
                        <span style={{ fontSize: 28 }}>🖼️</span>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#9ca3af', margin: 0 }}>Clique para enviar imagem</p>
                        <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>PNG, JPG, WEBP — 1920×800 recomendado</p>
                      </>
                  }
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) uploadImg(f); e.target.value = ''; }} />
            <Input value={block.imageUrl || ''} onChange={e => set('imageUrl', e.target.value)}
              placeholder="Ou cole a URL da imagem..." className="h-9 text-[12px]" />

            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#1d1d1f', marginBottom: 8 }}>Sobreposição sobre a imagem</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {([{ v: 1, title: 'Com estilo', sub: 'Gradiente + textos' }, { v: 0, title: 'Só imagem', sub: 'Sem sobreposição' }] as const).map(({ v, title, sub }) => {
                  const sel = useStyle === v;
                  return (
                    <button key={v} onClick={() => onChange({ ...block, ...(({ useStyle: v }) as any) })}
                      style={{ borderRadius: 12, overflow: 'hidden', border: `2px solid ${sel ? accent : 'rgba(0,0,0,.1)'}`, cursor: 'pointer', textAlign: 'left', background: 'none', padding: 0 }}>
                      <div style={{ aspectRatio: '16/7', position: 'relative', background: '#222', overflow: 'hidden' }}>
                        {previewSrc && <img src={previewSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: v === 1 ? .5 : 1 }} />}
                        {v === 1 && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(110deg,rgba(5,5,8,.85),rgba(5,5,8,.3))' }} />}
                      </div>
                      <div style={{ padding: '8px 10px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <p style={{ fontSize: 11, fontWeight: 700, color: '#1d1d1f', margin: 0 }}>{title}</p>
                          <p style={{ fontSize: 10, color: '#98989d', margin: 0 }}>{sub}</p>
                        </div>
                        {sel && <div style={{ width: 18, height: 18, borderRadius: '50%', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                        </div>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input type="color" value={accent}
              onChange={e => set('accentColor', e.target.value)}
              style={{ width: 48, height: 48, borderRadius: 10, border: '1px solid rgba(0,0,0,.1)', cursor: 'pointer', padding: 3 }} />
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: '#98989d', display: 'block', marginBottom: 4 }}>Cor de destaque</label>
              <Input value={accent} onChange={e => set('accentColor', e.target.value)}
                style={{ height: 38, fontFamily: 'monospace', fontSize: 13 }} placeholder="#f97316" />
            </div>
            <div style={{ width: 80, height: 48, borderRadius: 12, background: `linear-gradient(135deg,${accent},${accent}88)` }} />
          </div>
        )}
      </div>

      {/* ── Estilo Visual ── */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,.07)', padding: 20 }}>
        <p style={{ fontWeight: 600, fontSize: 14, color: '#1d1d1f', margin: '0 0 14px' }}>Estilo Visual</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
          {BANNER_STYLES.map(s => {
            const sel = (block.bannerStyle || 'cinematic') === s.id;
            return (
              <button key={s.id} onClick={() => set('bannerStyle', s.id as PageBlock['bannerStyle'])}
                style={{ border: `2px solid ${sel ? accent : 'transparent'}`, borderRadius: 10, overflow: 'hidden', cursor: 'pointer', padding: 0, background: 'none' }}>
                <BannerStyleThumb id={s.id} accent={accent} />
                <div style={{ fontSize: 10, fontWeight: sel ? 700 : 500, color: sel ? accent : '#98989d', padding: '4px 0', textAlign: 'center', background: '#fff' }}>
                  {s.label}
                </div>
              </button>
            );
          })}
        </div>

        {useDefaultBg === 0 && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(0,0,0,.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="color" value={accent}
              onChange={e => set('accentColor', e.target.value)}
              style={{ width: 38, height: 38, borderRadius: 8, border: '1px solid rgba(0,0,0,.1)', cursor: 'pointer', padding: 2 }} />
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, color: '#98989d', display: 'block', marginBottom: 3 }}>Cor de destaque do estilo</label>
              <Input value={accent} onChange={e => set('accentColor', e.target.value)}
                style={{ height: 36, fontFamily: 'monospace', fontSize: 12 }} />
            </div>
          </div>
        )}
      </div>

      {/* ── Textos ── */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,.07)', padding: 20 }}>
        <p style={{ fontWeight: 600, fontSize: 14, color: '#1d1d1f', margin: '0 0 16px' }}>Textos</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <FL>Título *</FL>
            <Input value={block.title||''} onChange={e=>set('title',e.target.value)} placeholder="Ex: Tecnologia que Impulsiona" className="h-9" />
          </div>
          <div>
            <FL hint="Pílula pequena acima do título">Badge / Subtítulo</FL>
            <Input value={block.badge||''} onChange={e=>set('badge',e.target.value)} placeholder="Frase de destaque" className="h-9" />
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <FL>Descrição</FL>
          <Textarea value={block.description||''} onChange={e=>set('description',e.target.value)}
            placeholder="Texto de apoio..." rows={2} className="resize-none text-[13px]" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <FL>Texto do Botão</FL>
            <Input value={block.ctaLabel||''} onChange={e=>set('ctaLabel',e.target.value)} placeholder="Ex: Saiba mais" className="h-9" />
          </div>
          <div>
            <FL>Link do Botão</FL>
            <Input value={block.ctaLink||''} onChange={e=>set('ctaLink',e.target.value)} placeholder="/solucoes ou https://..." className="h-9" />
          </div>
        </div>
      </div>

    </div>
  );
}


// ── Block editors ─────────────────────────────────────────────────────────────

function BlockEditor({ block, onChange }: { block: PageBlock; onChange: (b: PageBlock) => void }) {
  const set = <K extends keyof PageBlock>(k: K, v: PageBlock[K]) => onChange({ ...block, [k]: v });

  if (block.type === 'hero') return <HeroEditor block={block} onChange={onChange} />;

  // Fundo do bloco — compartilhado
  const ThemePicker = () => (
    <div>
      <FL>Fundo do bloco</FL>
      <div className="flex gap-2">
        {[
          { v:'light' as const, label:'Claro',    bg:'#f5f5f7', fg:'#1d1d1f', border:'rgba(0,0,0,.08)' },
          { v:'dark'  as const, label:'Escuro',   bg:'#0a0a0c', fg:'#fff',    border:'transparent' },
          { v:'brand' as const, label:'Cor tema', bg:'#f97316', fg:'#fff',    border:'transparent' },
        ].map(o => (
          <button key={o.v} onClick={() => set('colorTheme', o.v)}
            className="flex-1 h-8 rounded-xl text-[11px] font-bold border-2 transition"
            style={{background:o.bg,color:o.fg,borderColor:block.colorTheme===o.v?'#f97316':o.border}}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );

  // ── Features ──────────────────────────────────────────────────────────────
  if (block.type === 'features') {
    return (
      <div className="space-y-4">
        <ThemePicker />

        <SectionDivider label="Conteúdo" />
        <div><FL>Título</FL><Input value={block.title||''} onChange={e=>set('title',e.target.value)} placeholder="Funcionalidades" className="h-9"/></div>

        <div>
          <FL hint="Cada linha vira um card numerado no estilo dark">Itens</FL>
          <TagList items={block.items||[]} onChange={v=>set('items',v)} placeholder="Ex: Controle de estoque em tempo real"/>
        </div>

        <SpacingRadiusControls block={block} onChange={onChange} />
      </div>
    );
  }

  // ── Benefits ──────────────────────────────────────────────────────────────
  if (block.type === 'benefits') {
    const layouts: { v: BenefitsLayout; label: string; desc: string }[] = [
      { v: 'grid_cards',  label: 'Grid de Cards',      desc: 'Cards em grade, fundo escuro' },
      { v: 'side_image',  label: 'Lista c/ Imagem',     desc: 'Texto à esq., imagem à dir.' },
      { v: 'carousel',    label: 'Carrossel',           desc: 'Navegação horizontal' },
    ];
    const [uploading, setUploading] = useState(false);
    const token = localStorage.getItem('token');
    const uploadImg = async (file: File) => {
      setUploading(true);
      try {
        const fd = new FormData(); fd.append('image', file);
        const res = await fetch(`${API_URL}/admin/upload`, { method:'POST', headers:{Authorization:`Bearer ${token}`}, body:fd });
        if (!res.ok) throw new Error('Upload falhou');
        const { url } = await res.json();
        set('imageUrl', url);
      } finally { setUploading(false); }
    };

    return (
      <div className="space-y-4">
        <ThemePicker />

        <SectionDivider label="Layout" />
        <div>
          <FL hint="Como os benefícios serão apresentados">Variante de Layout</FL>
          <div className="space-y-1.5">
            {layouts.map(o => {
              const sel = (block.benefitsLayout || 'grid_cards') === o.v;
              return (
                <button key={o.v} onClick={() => set('benefitsLayout', o.v)}
                  className="w-full text-left p-3 rounded-xl border-2 transition"
                  style={{ borderColor: sel ? '#f97316' : 'rgba(0,0,0,.08)', background: sel ? '#fff7ed' : '#fafafa' }}>
                  <div className="flex items-center gap-2">
                    {sel && <span className="text-orange-500 text-[12px] font-bold">✓</span>}
                    <p className="text-[12px] font-bold" style={{ color: sel ? '#f97316' : '#1d1d1f' }}>{o.label}</p>
                  </div>
                  <p className="text-[10px] mt-0.5" style={{ color: '#98989d' }}>{o.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {block.benefitsLayout === 'side_image' && (
          <div>
            <FL hint="Imagem exibida ao lado dos benefícios">Imagem Lateral</FL>
            <ImageUploadField
              value={block.imageUrl || ''}
              onChange={url => set('imageUrl', url)}
              onUpload={uploadImg}
              uploading={uploading}
              spec={{ dimensions: '800×600 px', formats: 'JPG, PNG, WEBP', maxSize: '2 MB', where: 'Seção Benefícios' }}
              height={90}
            />
          </div>
        )}

        <SectionDivider label="Conteúdo" />
        <div><FL>Título</FL><Input value={block.title||''} onChange={e=>set('title',e.target.value)} placeholder="Benefícios" className="h-9"/></div>
        <div>
          <FL hint="Itens com ícone para cada benefício">Benefícios com Ícone</FL>
          <div className="space-y-2">
            {(block.iconItems||[]).map((item, i) => (
              <div key={i} className="p-3 rounded-xl bg-[#f5f5f7] group">
                <div className="flex items-center gap-2 mb-2">
                  <IconPicker value={item.icon} onChange={v => {
                    const a=[...(block.iconItems||[])]; a[i]={...a[i],icon:v}; set('iconItems',a);
                  }}/>
                  <button onClick={() => set('iconItems', (block.iconItems||[]).filter((_,j)=>j!==i))}
                    className="ml-auto w-6 h-6 rounded-lg flex items-center justify-center text-[#c7c7cc] opacity-0 group-hover:opacity-100 transition hover:text-red-400 hover:bg-red-50">
                    <X style={{width:11,height:11}}/>
                  </button>
                </div>
                <Input value={item.label} placeholder="Ex: +30% de vendas" className="h-8 text-[13px] bg-white mb-1.5"
                  onChange={e=>{const a=[...(block.iconItems||[])];a[i]={...a[i],label:e.target.value};set('iconItems',a);}}/>
                <Input value={item.desc||''} placeholder="Descrição curta (opcional)" className="h-8 text-[13px] bg-white"
                  onChange={e=>{const a=[...(block.iconItems||[])];a[i]={...a[i],desc:e.target.value};set('iconItems',a);}}/>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full h-8 text-[12px] gap-1.5"
              onClick={() => set('iconItems', [...(block.iconItems||[]), { icon: '⚡', label: '', desc: '' }])}>
              <Plus style={{width:12,height:12}}/> Adicionar benefício
            </Button>
          </div>
        </div>

        {/* Lista simples como fallback */}
        <div>
          <FL hint="Lista simples (sem ícone)">Itens Simples (opcional)</FL>
          <TagList items={block.items||[]} onChange={v=>set('items',v)} placeholder="Ex: Redução de custos operacionais"/>
        </div>

        <SpacingRadiusControls block={block} onChange={onChange} />
      </div>
    );
  }

  // ── Integrations ──────────────────────────────────────────────────────────
  if (block.type === 'integrations') return (
    <div className="space-y-3">
      <ThemePicker />
      <div><FL>Título</FL><Input value={block.title||''} onChange={e=>set('title',e.target.value)} placeholder="Integrações" className="h-9"/></div>
      <div><FL hint="Nome de cada sistema integrado">Sistemas</FL>
        <TagList items={block.items||[]} onChange={v=>set('items',v)} placeholder="Ex: iFood, SAP, Mercado Pago…"/></div>
      <SpacingRadiusControls block={block} onChange={onChange} />
    </div>
  );

  if (block.type === 'steps') return (
    <div className="space-y-3">
      <ThemePicker />
      <div><FL>Título</FL><Input value={block.title||''} onChange={e=>set('title',e.target.value)} placeholder="Como funciona" className="h-9"/></div>
      {(block.steps||[]).map((step,i)=>(
        <div key={i} className="p-3 rounded-xl bg-[#f5f5f7] space-y-2 group">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#f97316] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">{i+1}</span>
            <Input value={step.title} placeholder="Título" className="h-8 text-[13px] bg-white flex-1"
              onChange={e=>{const a=[...(block.steps||[])];a[i]={...a[i],title:e.target.value};set('steps',a);}}/>
            <button onClick={()=>set('steps',(block.steps||[]).filter((_,j)=>j!==i))}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-[#c7c7cc] opacity-0 group-hover:opacity-100 transition hover:text-red-400 hover:bg-red-50 flex-shrink-0">
              <X style={{width:11,height:11}}/>
            </button>
          </div>
          <Textarea value={step.description} placeholder="Descrição…" rows={2} className="resize-none text-[13px] bg-white"
            onChange={e=>{const a=[...(block.steps||[])];a[i]={...a[i],description:e.target.value};set('steps',a);}}/>
        </div>
      ))}
      <Button variant="outline" size="sm" className="w-full h-8 text-[12px] gap-1.5"
        onClick={()=>set('steps',[...(block.steps||[]),{title:'',description:''}])}>
        <Plus style={{width:12,height:12}}/> Adicionar passo
      </Button>
      <SpacingRadiusControls block={block} onChange={onChange} />
    </div>
  );

  if (block.type === 'stats') return (
    <div className="space-y-2">
      <ThemePicker />
      <FL hint="Máx. 4">Estatísticas</FL>
      {(block.stats||[]).map((s,i)=>(
        <div key={i} className="flex items-center gap-2 group">
          <Input value={s.value} placeholder="Ex: 500+" className="h-8 text-[13px]"
            onChange={e=>{const a=[...(block.stats||[])];a[i]={...a[i],value:e.target.value};set('stats',a);}}/>
          <Input value={s.label} placeholder="Ex: Clientes ativos" className="h-8 text-[13px]"
            onChange={e=>{const a=[...(block.stats||[])];a[i]={...a[i],label:e.target.value};set('stats',a);}}/>
          <button onClick={()=>set('stats',(block.stats||[]).filter((_,j)=>j!==i))}
            className="w-6 h-6 rounded-lg flex items-center justify-center text-[#c7c7cc] opacity-0 group-hover:opacity-100 transition hover:text-red-400 hover:bg-red-50 flex-shrink-0">
            <X style={{width:11,height:11}}/>
          </button>
        </div>
      ))}
      {(block.stats||[]).length < 4 && (
        <Button variant="outline" size="sm" className="w-full h-8 text-[12px] gap-1.5"
          onClick={()=>set('stats',[...(block.stats||[]),{value:'',label:''}])}>
          <Plus style={{width:12,height:12}}/> Adicionar
        </Button>
      )}
      <SpacingRadiusControls block={block} onChange={onChange} />
    </div>
  );

  if (block.type === 'testimonial') return (
    <div className="space-y-3">
      <ThemePicker />
      <div><FL>Citação</FL><Textarea value={block.quote||''} onChange={e=>set('quote',e.target.value)} rows={3} placeholder="O sistema transformou nossa gestão…" className="resize-none text-[13px]"/></div>
      <div className="grid grid-cols-2 gap-2">
        <div><FL>Autor</FL><Input value={block.author||''} onChange={e=>set('author',e.target.value)} placeholder="João Silva" className="h-9"/></div>
        <div><FL>Cargo</FL><Input value={block.role||''} onChange={e=>set('role',e.target.value)} placeholder="CEO, Rede Farma" className="h-9"/></div>
      </div>
    </div>
  );

  if (block.type === 'faq') return (
    <div className="space-y-3">
      <ThemePicker />
      <div><FL>Título</FL><Input value={block.title||''} onChange={e=>set('title',e.target.value)} placeholder="Perguntas Frequentes" className="h-9"/></div>
      {(block.faq||[]).map((item,i)=>(
        <div key={i} className="p-3 rounded-xl bg-[#f5f5f7] space-y-2 group">
          <div className="flex items-center gap-2">
            <Input value={item.question} placeholder="Pergunta…" className="h-8 text-[13px] bg-white flex-1"
              onChange={e=>{const a=[...(block.faq||[])];a[i]={...a[i],question:e.target.value};set('faq',a);}}/>
            <button onClick={()=>set('faq',(block.faq||[]).filter((_,j)=>j!==i))}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-[#c7c7cc] opacity-0 group-hover:opacity-100 transition hover:text-red-400 hover:bg-red-50 flex-shrink-0">
              <X style={{width:11,height:11}}/>
            </button>
          </div>
          <Textarea value={item.answer} placeholder="Resposta…" rows={2} className="resize-none text-[13px] bg-white"
            onChange={e=>{const a=[...(block.faq||[])];a[i]={...a[i],answer:e.target.value};set('faq',a);}}/>
        </div>
      ))}
      <Button variant="outline" size="sm" className="w-full h-8 text-[12px] gap-1.5"
        onClick={()=>set('faq',[...(block.faq||[]),{question:'',answer:''}])}>
        <Plus style={{width:12,height:12}}/> Adicionar pergunta
      </Button>
      <SpacingRadiusControls block={block} onChange={onChange} />
    </div>
  );

  if (block.type === 'video') return (
    <div className="space-y-3">
      <ThemePicker />
      <div><FL>Título (opcional)</FL><Input value={block.title||''} onChange={e=>set('title',e.target.value)} placeholder="Veja o sistema em 2 minutos" className="h-9"/></div>
      <div><FL hint="URL completa do YouTube">URL do Vídeo</FL><Input value={block.videoUrl||''} onChange={e=>set('videoUrl',e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="h-9"/></div>
      {block.videoUrl && (()=>{
        const m=block.videoUrl!.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
        const id=m?m[1]:null;
        return id ? (
          <div className="rounded-xl overflow-hidden relative bg-black" style={{paddingTop:'56.25%'}}>
            <iframe className="absolute inset-0 w-full h-full" src={`https://www.youtube.com/embed/${id}?rel=0`} title="preview" allowFullScreen/>
          </div>
        ) : <p className="text-[12px] text-red-500">URL inválida.</p>;
      })()}
    </div>
  );

  if (block.type === 'cta') return (
    <div className="space-y-3">
      <ThemePicker />
      <div><FL>Título</FL><Input value={block.title||''} onChange={e=>set('title',e.target.value)} placeholder="Pronto para transformar seu negócio?" className="h-9"/></div>
      <div><FL>Descrição</FL><Textarea value={block.description||''} onChange={e=>set('description',e.target.value)} rows={2} placeholder="Fale com nossos especialistas…" className="resize-none text-[13px]"/></div>
      <div className="grid grid-cols-2 gap-2">
        <div><FL>Botão principal</FL><Input value={block.ctaLabel||''} onChange={e=>set('ctaLabel',e.target.value)} placeholder="Falar com Especialista" className="h-9"/></div>
        <div><FL>Link</FL><Input value={block.ctaLink||''} onChange={e=>set('ctaLink',e.target.value)} placeholder="/cliente" className="h-9"/></div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div><FL>Botão secundário</FL><Input value={block.secondaryLabel||''} onChange={e=>set('secondaryLabel',e.target.value)} placeholder="Ver soluções" className="h-9"/></div>
        <div><FL>Link secundário</FL><Input value={block.secondaryLink||''} onChange={e=>set('secondaryLink',e.target.value)} placeholder="/solucoes" className="h-9"/></div>
      </div>
    </div>
  );

  if (block.type === 'text') return (
    <div className="space-y-3">
      <ThemePicker />
      <div><FL>Título (opcional)</FL><Input value={block.title||''} onChange={e=>set('title',e.target.value)} placeholder="Título do bloco" className="h-9"/></div>
      <div><FL>Texto</FL><Textarea value={block.description||''} onChange={e=>set('description',e.target.value)} rows={5} placeholder="Seu texto aqui…" className="resize-none text-[13px]"/></div>
    </div>
  );

  if (block.type === 'richtext') return (
    <div className="space-y-3">
      <ThemePicker />
      <div>
        <FL hint="HTML puro — <b>, <ul>, <a href=...>, <h2>, etc.">Conteúdo HTML</FL>
        <Textarea value={block.html||''} onChange={e=>set('html',e.target.value)} rows={8}
          placeholder="<h2>Título</h2><p>Parágrafo...</p>"
          className="resize-none text-[12px] font-mono"/>
      </div>
      {block.html && (
        <div>
          <p className="text-[10px] font-bold text-[#98989d] uppercase tracking-wider mb-1">Preview</p>
          <div className="p-3 rounded-xl border text-[13px]" style={{borderColor:'rgba(0,0,0,.07)',background:'#fafafa'}}
            dangerouslySetInnerHTML={{__html:block.html}}/>
        </div>
      )}
    </div>
  );

  if (block.type === 'image') return (
    <div className="space-y-3">
      <ThemePicker />
      <div><FL hint="URL da imagem">URL da Imagem</FL><Input value={block.imageUrl||''} onChange={e=>set('imageUrl',e.target.value)} placeholder="https://..." className="h-9"/></div>
      <div><FL>Texto alternativo</FL><Input value={block.imageAlt||''} onChange={e=>set('imageAlt',e.target.value)} placeholder="Descrição da imagem" className="h-9"/></div>
      {block.imageUrl && <div className="rounded-xl overflow-hidden border" style={{borderColor:'rgba(0,0,0,.07)'}}><img src={block.imageUrl} alt={block.imageAlt||''} className="w-full max-h-48 object-cover"/></div>}
    </div>
  );


  // ── Image + Text ──────────────────────────────────────────────────────────
  if (block.type === 'image_text') {
    const [uploading, setUploading] = useState(false);
    const token = localStorage.getItem('token');
    const uploadImg = async (file: File) => {
      setUploading(true);
      try {
        const fd = new FormData(); fd.append('image', file);
        const res = await fetch(`${API_URL}/admin/upload`, { method:'POST', headers:{Authorization:`Bearer ${token}`}, body:fd });
        if (!res.ok) throw new Error('Upload falhou');
        const { url } = await res.json();
        set('imageUrl', url);
      } finally { setUploading(false); }
    };

    return (
      <div className="space-y-4">
        <ThemePicker />

        <SectionDivider label="Posição da Imagem" />
        <div>
          <FL hint="De qual lado a imagem aparece">Layout</FL>
          <div className="grid grid-cols-2 gap-2">
            {[
              { v: 'right', label: '← Texto | Imagem →', desc: 'Texto à esq., imagem à dir.' },
              { v: 'left',  label: '← Imagem | Texto →', desc: 'Imagem à esq., texto à dir.' },
            ].map(o => {
              const sel = (block.imagePosition || 'right') === o.v;
              return (
                <button key={o.v} onClick={() => set('imagePosition', o.v as 'left' | 'right')}
                  className="text-left p-3 rounded-xl border-2 transition"
                  style={{ borderColor: sel ? '#f97316' : 'rgba(0,0,0,.08)', background: sel ? '#fff7ed' : '#fafafa' }}>
                  <p className="text-[11px] font-bold" style={{ color: sel ? '#f97316' : '#1d1d1f' }}>
                    {sel ? '✓ ' : ''}{o.label}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: '#98989d' }}>{o.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        <SectionDivider label="Conteúdo" />
        <div><FL hint="Pílula acima do título">Badge (opcional)</FL><Input value={block.badge||''} onChange={e=>set('badge',e.target.value)} placeholder="Ex: Destaque" className="h-9"/></div>
        <div><FL>Título *</FL><Input value={block.title||''} onChange={e=>set('title',e.target.value)} placeholder="Ex: Combate Intenso" className="h-9"/></div>
        <div><FL>Subtítulo</FL><Input value={block.subtitle||''} onChange={e=>set('subtitle',e.target.value)} placeholder="Frase de destaque" className="h-9"/></div>
        <div><FL>Descrição</FL><Textarea value={block.description||''} onChange={e=>set('description',e.target.value)} rows={4} placeholder="Texto explicativo…" className="resize-none text-[13px]"/></div>

        <div><FL hint="Lista de tópicos com check (opcional)">Tópicos</FL>
          <TagList items={block.items||[]} onChange={v=>set('items',v)} placeholder="Ex: Controle em tempo real"/></div>

        <div className="grid grid-cols-2 gap-2">
          <div><FL>Botão principal</FL><Input value={block.ctaLabel||''} onChange={e=>set('ctaLabel',e.target.value)} placeholder="Saiba mais" className="h-9"/></div>
          <div><FL>Link</FL><Input value={block.ctaLink||''} onChange={e=>set('ctaLink',e.target.value)} placeholder="/cliente" className="h-9"/></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div><FL>Botão secundário</FL><Input value={block.secondaryLabel||''} onChange={e=>set('secondaryLabel',e.target.value)} placeholder="Ver mais" className="h-9"/></div>
          <div><FL>Link secundário</FL><Input value={block.secondaryLink||''} onChange={e=>set('secondaryLink',e.target.value)} placeholder="/solucoes" className="h-9"/></div>
        </div>

        <SectionDivider label="Imagens" />

        {/* Multiple images list */}
        {(() => {
          // Normalise: if old single imageUrl exists and images[] not yet set, seed it
          const imgs: { url: string; alt: string }[] = block.images && block.images.length > 0
            ? block.images
            : block.imageUrl ? [{ url: block.imageUrl, alt: block.imageAlt || '' }] : [];

          const setImgs = (next: { url: string; alt: string }[]) => {
            onChange({ ...block, images: next, imageUrl: next[0]?.url || '', imageAlt: next[0]?.alt || '' });
          };

          const addImg = () => setImgs([...imgs, { url: '', alt: '' }]);

          const removeImg = (i: number) => setImgs(imgs.filter((_, idx) => idx !== i));

          const updateImg = (i: number, field: 'url' | 'alt', val: string) => {
            const next = imgs.map((img, idx) => idx === i ? { ...img, [field]: val } : img);
            setImgs(next);
          };

          const uploadImgAt = async (i: number, file: File) => {
            setUploading(true);
            try {
              const fd = new FormData(); fd.append('image', file);
              const res = await fetch(`${API_URL}/admin/upload`, { method:'POST', headers:{Authorization:`Bearer ${token}`}, body:fd });
              if (!res.ok) throw new Error('Upload falhou');
              const { url } = await res.json();
              updateImg(i, 'url', url);
            } finally { setUploading(false); }
          };

          return (
            <div className="space-y-4">
              {imgs.map((img, i) => (
                <div key={i} className="border rounded-xl p-3 space-y-2" style={{ borderColor: 'rgba(0,0,0,.09)', background: '#fafafa' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-[#6e6e73] uppercase tracking-wide">Imagem {i + 1}</span>
                    {imgs.length > 1 && (
                      <button onClick={() => removeImg(i)} className="w-6 h-6 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 transition">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <ImageUploadField
                    value={img.url}
                    onChange={url => updateImg(i, 'url', url)}
                    onUpload={file => uploadImgAt(i, file)}
                    uploading={uploading}
                    spec={{ dimensions: '800×600 px', formats: 'JPG, PNG, WEBP', maxSize: '2 MB', where: `Imagem ${i + 1}` }}
                    height={90}
                  />
                  <div><FL>Texto alternativo</FL><Input value={img.alt} onChange={e => updateImg(i, 'alt', e.target.value)} placeholder="Descrição da imagem" className="h-8 text-[12px]"/></div>
                </div>
              ))}
              <button
                onClick={addImg}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed text-[12px] font-bold transition hover:bg-orange-50"
                style={{ borderColor: '#f97316', color: '#f97316' }}>
                <Plus className="w-4 h-4" /> Adicionar imagem
              </button>
              {imgs.length > 1 && (
                <p className="text-[11px] text-[#98989d] text-center">Múltiplas imagens aparecem em carrossel automático</p>
              )}
            </div>
          );
        })()}

        <SpacingRadiusControls block={block} onChange={onChange} />
      </div>
    );
  }

  if (block.type === 'divider') return (
    <div>
      <FL>Estilo</FL>
      <div className="grid grid-cols-3 gap-1.5">
        {(['line','space','dots'] as const).map(s=>(
          <button key={s} onClick={()=>set('dividerStyle',s)}
            className="h-8 rounded-xl text-[11px] font-bold border-2 transition"
            style={{borderColor:block.dividerStyle===s?'#f97316':'rgba(0,0,0,.08)',background:block.dividerStyle===s?'#fff7ed':'#f5f5f7',color:block.dividerStyle===s?'#f97316':'#6e6e73'}}>
            {s==='line'?'Linha':s==='space'?'Espaço':'Pontos'}
          </button>
        ))}
      </div>
    </div>
  );

  return <p className="text-[12px] text-[#98989d]">Sem editor para este tipo.</p>;
}

// ── Block card ────────────────────────────────────────────────────────────────

function BlockCard({ block, index, total, onChange, onRemove, onMoveUp, onMoveDown }: {
  block: PageBlock; index: number; total: number;
  onChange: (b: PageBlock) => void; onRemove: () => void; onMoveUp: () => void; onMoveDown: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const def = BLOCK_CATALOG.find(d=>d.type===block.type);
  const summary = block.title || (block.quote||'').slice(0,40) || (block.alertText||'').slice(0,40) || (block.html||'').slice(0,40) || '';

  const heroColors: Record<string, string> = { centered:'#6366f1', split:'#22c55e', dark_glow:'#0a0a0c', magazine:'#1e293b' };
  const blockColor = block.type === 'hero' ? (heroColors[block.heroLayout||'centered'] || '#f97316') : '#f97316';

  // Badge de variante para features/benefits
  const variantLabel =
    block.type === 'features' ? 'Dark Numerado' :
    block.type === 'benefits' && block.benefitsLayout ? { grid_cards:'Grid', side_image:'c/ Imagem', carousel:'Carrossel' }[block.benefitsLayout] :
    block.type === 'hero' && block.heroLayout ? HERO_LAYOUTS.find(l=>l.id===block.heroLayout)?.label : null;

  // Badge de espaçamento
  const spacingLabel = block.blockSpacing && block.blockSpacing !== 'normal'
    ? { compact: '↕ Compacto', spacious: '↕ Generoso' }[block.blockSpacing] : null;

  return (
    <div className="rounded-2xl border overflow-hidden transition-all"
      style={{borderColor: expanded ? `${blockColor}25` : 'rgba(0,0,0,.08)', opacity: block.visible ? 1 : 0.5, boxShadow: expanded ? `0 4px 20px ${blockColor}10` : 'none'}}>

      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-white">
        <GripVertical style={{width:14,height:14,color:'#c7c7cc',flexShrink:0}}/>
        <button className="flex items-center gap-2.5 flex-1 min-w-0 text-left" onClick={()=>setExpanded(v=>!v)}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-base leading-none"
            style={{background: `${blockColor}14`}}>
            <span style={{fontSize:14}}>{def?.emoji || '📦'}</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-[13px] font-semibold text-[#1d1d1f] leading-none">{def?.label || block.type}</p>
              {variantLabel && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{background:`${blockColor}15`, color: blockColor}}>
                  {variantLabel}
                </span>
              )}
              {spacingLabel && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#f5f5f7] text-[#aeaeb2]">
                  {spacingLabel}
                </span>
              )}
            </div>
            {summary && <p className="text-[11px] text-[#98989d] truncate mt-0.5">{summary}</p>}
          </div>
        </button>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button disabled={index===0} onClick={onMoveUp} className="w-6 h-6 rounded-lg flex items-center justify-center text-[#c7c7cc] disabled:opacity-25 hover:text-[#6e6e73] hover:bg-[#f5f5f7] transition"><ChevronUp style={{width:13,height:13}}/></button>
          <button disabled={index===total-1} onClick={onMoveDown} className="w-6 h-6 rounded-lg flex items-center justify-center text-[#c7c7cc] disabled:opacity-25 hover:text-[#6e6e73] hover:bg-[#f5f5f7] transition"><ChevronDown style={{width:13,height:13}}/></button>
          <button onClick={()=>onChange({...block,visible:!block.visible})} className="w-6 h-6 rounded-lg flex items-center justify-center transition hover:bg-[#f5f5f7]" style={{color:block.visible?'#34c759':'#c7c7cc'}}>
            {block.visible?<Eye style={{width:13,height:13}}/>:<EyeOff style={{width:13,height:13}}/>}
          </button>
          <button onClick={onRemove} className="w-6 h-6 rounded-lg flex items-center justify-center text-[#c7c7cc] hover:text-red-400 hover:bg-red-50 transition"><X style={{width:13,height:13}}/></button>
        </div>
      </div>

      {/* Expanded editor */}
      {expanded && (
        <div className="border-t px-4 py-4 bg-[#fafafa]" style={{borderColor:'rgba(0,0,0,.06)'}}>
          <BlockEditor block={block} onChange={onChange}/>
        </div>
      )}
    </div>
  );
}

// ── Block picker modal ────────────────────────────────────────────────────────

function BlockPicker({ onAdd, onClose }: { onAdd: (type: BlockType) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{background:'rgba(0,0,0,.45)',backdropFilter:'blur(4px)'}}
      onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{borderColor:'rgba(0,0,0,.07)'}}>
          <div>
            <p className="font-bold text-[15px] text-[#1d1d1f]" style={{fontFamily:"'Outfit',sans-serif"}}>Adicionar bloco</p>
            <p className="text-[11px] text-[#98989d]">Escolha o tipo de seção</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-[#f5f5f7] transition" style={{color:'#6e6e73'}}>
            <X style={{width:16,height:16}}/>
          </button>
        </div>
        <div className="p-4 grid grid-cols-2 gap-2 max-h-[65vh] overflow-y-auto">
          {BLOCK_CATALOG.map(def=>(
            <button key={def.type} onClick={()=>{onAdd(def.type);onClose();}}
              className="flex items-start gap-3 p-3 rounded-2xl border text-left transition hover:border-[#f97316] hover:bg-orange-50 group"
              style={{borderColor:'rgba(0,0,0,.08)'}}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#f5f5f7] text-lg leading-none group-hover:bg-orange-100 transition">
                {def.emoji}
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#1d1d1f] leading-none">{def.label}</p>
                <p className="text-[11px] text-[#98989d] mt-0.5 leading-snug">{def.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export interface PageBuilderProps { blocks: PageBlock[]; onChange: (blocks: PageBlock[]) => void; }

export function PageBuilder({ blocks, onChange }: PageBuilderProps) {
  const [showPicker, setShowPicker] = useState<number | null>(null); // null=hidden, -1=append, N=insert after index N
  const insertAt = (type: BlockType, afterIndex: number) => {
    const newBlock = makeBlock(type);
    if (afterIndex === -1) {
      onChange([...blocks, newBlock]);
    } else {
      const n = [...blocks];
      n.splice(afterIndex + 1, 0, newBlock);
      onChange(n);
    }
  };
  const upd = (i: number, b: PageBlock) => { const n=[...blocks]; n[i]=b; onChange(n); };
  const rem = (i: number) => onChange(blocks.filter((_,j)=>j!==i));
  const mov = (i: number, d: -1|1) => { const n=[...blocks]; const t=i+d; if(t<0||t>=n.length)return; [n[i],n[t]]=[n[t],n[i]]; onChange(n); };

  // Quick-add image_text block at a position without opening picker
  const quickAddImageText = (afterIndex: number) => {
    const n = [...blocks];
    n.splice(afterIndex + 1, 0, makeBlock('image_text'));
    onChange(n);
  };

  return (
    <div className="space-y-2">
      {blocks.length===0 && (
        <div className="flex flex-col items-center justify-center py-10 rounded-2xl border-2 border-dashed text-center" style={{borderColor:'rgba(0,0,0,.08)'}}>
          <Layers style={{width:36,height:36,color:'#c7c7cc',marginBottom:10}}/>
          <p className="text-[13px] font-medium text-[#6e6e73]">Nenhum bloco ainda</p>
          <p className="text-[12px] text-[#98989d] mb-4">Adicione blocos para montar a página</p>
          <Button variant="outline" size="sm" className="gap-1.5 text-[12px]" onClick={()=>setShowPicker(-1)}>
            <Plus style={{width:13,height:13}}/> Adicionar primeiro bloco
          </Button>
        </div>
      )}
      {blocks.map((block,i)=>(
        <React.Fragment key={block.id}>
          <BlockCard block={block} index={i} total={blocks.length}
            onChange={b=>upd(i,b)} onRemove={()=>rem(i)} onMoveUp={()=>mov(i,-1)} onMoveDown={()=>mov(i,1)}/>
          {/* Between-block inserter */}
          <div className="flex items-center gap-2 px-1 group/inserter" style={{height:28}}>
            <div className="flex-1 h-px transition-all" style={{background:'rgba(0,0,0,.06)'}}/>
            <button
              title="Adicionar Imagem + Texto aqui"
              onClick={() => quickAddImageText(i)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold opacity-0 group-hover/inserter:opacity-100 transition-all hover:scale-105"
              style={{background:'#fff7ed',color:'#f97316',border:'1.5px dashed #f97316'}}>
              <Plus style={{width:11,height:11}}/> Imagem + Texto
            </button>
            <button
              title="Adicionar outro tipo de bloco aqui"
              onClick={() => setShowPicker(i)}
              className="w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover/inserter:opacity-100 transition-all hover:scale-110"
              style={{background:'#f5f5f7',color:'#6e6e73',border:'1.5px dashed rgba(0,0,0,.15)'}}>
              <Plus style={{width:11,height:11}}/>
            </button>
            <div className="flex-1 h-px transition-all" style={{background:'rgba(0,0,0,.06)'}}/>
          </div>
        </React.Fragment>
      ))}
      {blocks.length>0 && (
        <Button variant="outline" className="w-full h-10 gap-2 text-[13px] font-medium rounded-2xl border-dashed" onClick={()=>setShowPicker(-1)}>
          <Plus style={{width:14,height:14}}/> Adicionar bloco
        </Button>
      )}
      {showPicker !== null && <BlockPicker onAdd={(type) => insertAt(type, showPicker)} onClose={()=>setShowPicker(null)}/>}
    </div>
  );
}
