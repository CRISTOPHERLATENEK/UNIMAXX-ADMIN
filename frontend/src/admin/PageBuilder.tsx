import React, { useState, useRef, useEffect } from 'react';
import { ANIM_BG_OPTIONS } from '@/components/AnimatedBgLayer';
import type { AnimatedBgType } from '@/components/AnimatedBgLayer';
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
import type { PageBlock, BlockType, FeaturesLayout, BenefitsLayout, BlockSpacing, BlockRadius, ContinuousBgMode, ContinuousBgType, SectionShape } from '@/types';

export type { PageBlock, BlockType };

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Ícones Lucide mais usados para seleção rápida
const ICON_LIBRARY = [
  '✅', '⚡', '🚀', '🎯', '💡', '🔒', '📊', '🌐', '📱', '💳', '🛒', '🏪', '🚛', '⭐', '🔗',
  '📈', '🤝', '🧩', '💬', '📞', '🎁', '🏆', '🔧', '📝', '👥', '🌟', '💰', '🕐', '🔑', '📋',
  '✨', '🎨', '🔔', '📦', '🏗️', '🤖', '💎', '🌱', '📡', '🔐',
];

const BLOCK_CATALOG = [
  { type: 'hero' as BlockType, label: 'Hero', description: 'Cabeçalho criativo com variantes visuais', emoji: '🌟' },
  { type: 'features' as BlockType, label: 'Funcionalidades', description: 'Lista de recursos em grid', emoji: '✅' },
  { type: 'benefits' as BlockType, label: 'Benefícios', description: 'Resultados e ganhos — fundo escuro', emoji: '⚡' },
  { type: 'steps' as BlockType, label: 'Como Funciona', description: 'Passo a passo numerado', emoji: '🔢' },
  { type: 'stats' as BlockType, label: 'Estatísticas', description: 'Números de impacto em destaque', emoji: '📊' },
  { type: 'testimonial' as BlockType, label: 'Depoimento', description: 'Citação de cliente', emoji: '💬' },
  { type: 'faq' as BlockType, label: 'FAQ', description: 'Perguntas frequentes com acordeão', emoji: '❓' },
  { type: 'video' as BlockType, label: 'Vídeo', description: 'Embed YouTube', emoji: '▶️' },
  { type: 'cta' as BlockType, label: 'CTA', description: 'Chamada para ação com gradiente', emoji: '📣' },
  { type: 'text' as BlockType, label: 'Texto Simples', description: 'Parágrafo ou título de texto', emoji: '📝' },
  { type: 'richtext' as BlockType, label: 'Rich Text', description: 'HTML livre', emoji: '🖊️' },
  { type: 'image' as BlockType, label: 'Imagem', description: 'Imagem com legenda opcional', emoji: '🖼️' },
  { type: 'integrations' as BlockType, label: 'Integrações', description: 'Tags de sistemas compatíveis', emoji: '🔌' },
  { type: 'image_text' as BlockType, label: 'Imagem + Texto', description: 'Imagem ao lado com título e descrição', emoji: '🖼️' },
  { type: 'divider' as BlockType, label: 'Divisor', description: 'Separador visual entre seções', emoji: '➖' },
];

const HERO_LAYOUTS = [
  { id: 'centered', label: 'Centralizado', desc: 'Título grande ao centro, gradiente de fundo' },
  { id: 'split', label: 'Dividido', desc: 'Texto à esquerda, imagem à direita' },
  { id: 'dark_glow', label: 'Dark Glow', desc: 'Fundo preto com glow neon da cor do tema' },
  { id: 'magazine', label: 'Magazine', desc: 'Imagem de fundo full-bleed com overlay' },
  { id: 'cinematic', label: 'Cinematic', desc: 'Estilo banner/game — imagem + título à esquerda + botão vídeo' },
  { id: 'oxpay', label: 'Oxpay', desc: 'Fundo escuro premium com orbes de luz e grid sutil' },
];

function makeBlock(type: BlockType): PageBlock {
  const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const b: PageBlock = { id, type, visible: true, blockSpacing: 'normal', blockRadius: 'large' };
  if (type === 'hero') return { ...b, heroLayout: 'centered', title: '', subtitle: '', description: '', ctaLabel: 'Falar com Especialista', ctaLink: '/cliente', colorTheme: 'brand', badge: '' };
  if (type === 'features') return { ...b, title: 'Os blocos de uma plataforma poderosa', featuresLabel: 'FEATURES', items: [], colorTheme: 'dark', featuresLayout: 'split_dark', featuresAccent: '#f97316' };
  if (type === 'benefits') return { ...b, title: 'Benefícios', items: [], benefitsLayout: 'grid_cards', colorTheme: 'dark' };
  if (type === 'steps') return { ...b, title: 'Como funciona', steps: [], colorTheme: 'light' };
  if (type === 'stats') return { ...b, stats: [], colorTheme: 'light' };
  if (type === 'testimonial') return { ...b, quote: '', author: '', role: '', colorTheme: 'dark' };
  if (type === 'faq') return { ...b, title: 'Perguntas Frequentes', faq: [], colorTheme: 'light' };
  if (type === 'video') return { ...b, title: '', videoUrl: '', colorTheme: 'dark' };
  if (type === 'cta') return { ...b, title: '', description: '', ctaLabel: 'Falar com Especialista', ctaLink: '/cliente', colorTheme: 'brand' };
  if (type === 'text') return { ...b, title: '', description: '', colorTheme: 'light' };
  if (type === 'richtext') return { ...b, html: '', colorTheme: 'light' };
  if (type === 'image') return { ...b, imageUrl: '', imageAlt: '', colorTheme: 'light' };
  if (type === 'integrations') return { ...b, title: 'Integrações', items: [], colorTheme: 'light' };
  if (type === 'image_text') return { ...b, title: '', description: '', imageUrl: '', imageAlt: '', imagePosition: 'right', colorTheme: 'dark', blockSpacing: 'normal', blockRadius: 'large' };
  if (type === 'divider') return { ...b, dividerStyle: 'line', colorTheme: 'light' };
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
            <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 text-[#98989d]">{i + 1}</span>
            <span className="flex-1 leading-snug">{item}</span>
          </div>
          <button onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="w-6 h-6 rounded-lg flex items-center justify-center text-[#c7c7cc] opacity-0 group-hover:opacity-100 transition hover:text-red-400 hover:bg-red-50">
            <X style={{ width: 11, height: 11 }} />
          </button>
        </div>
      ))}
      <div className="flex gap-2">
        <Input value={draft} onChange={e => setDraft(e.target.value)} placeholder={placeholder || 'Adicionar item…'} className="h-8 text-[13px]"
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} />
        <Button size="sm" variant="outline" onClick={add} className="h-8 px-3 flex-shrink-0"><Plus style={{ width: 13, height: 13 }} /></Button>
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
    { v: 'compact', label: 'Compacto', icon: <Minimize2 style={{ width: 12, height: 12 }} /> },
    { v: 'normal', label: 'Normal', icon: <Square style={{ width: 12, height: 12 }} /> },
    { v: 'spacious', label: 'Generoso', icon: <Maximize2 style={{ width: 12, height: 12 }} /> },
  ];

  const radiusOpts: { v: BlockRadius; label: string }[] = [
    { v: 'none', label: 'Quadrado' },
    { v: 'medium', label: 'Médio' },
    { v: 'large', label: 'Arredondado' },
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

      <SectionDivider label="Fundo Animado" />
      <div>
        <FL hint="Efeito animado aplicado por trás do conteúdo desta seção">Estilo</FL>
        <div className="grid grid-cols-3 gap-1.5 mb-2">
          {ANIM_BG_OPTIONS.map(opt => {
            const active = (block.animatedBg || 'none') === opt.value;
            const previewColor = block.animatedBgColor || '#f97316';
            return (
              <button key={opt.value} onClick={() => set('animatedBg', opt.value as AnimatedBgType)}
                className="rounded-xl border-2 transition overflow-hidden"
                style={{ borderColor: active ? '#f97316' : 'rgba(0,0,0,.08)', background: active ? '#fff7ed' : '#f5f5f7', padding: '8px 4px 4px' }}>
                {/* mini preview */}
                <div style={{ position: 'relative', height: 28, marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 6, background: active ? '#fff7ed' : '#eaeaec' }}>
                  {opt.value !== 'none' && (
                    <div style={{ position: 'absolute', inset: 0, color: previewColor, ...parseCss(opt.css) }} />
                  )}
                  {opt.value === 'none' && <span style={{ fontSize: 12, color: '#aaa' }}>—</span>}
                </div>
                <div className="text-[9px] font-bold text-center" style={{ color: active ? '#f97316' : '#6e6e73' }}>{opt.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {(block.animatedBg && block.animatedBg !== 'none') && (
        <div>
          <FL hint="Cor base das partículas / ondas / aurora">Cor do efeito</FL>
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            {['#f97316', '#6366f1', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6', '#ef4444', '#ffffff', '#1e293b'].map(c => (
              <button key={c} onClick={() => set('animatedBgColor', c)}
                className="w-7 h-7 rounded-lg border-2 transition"
                style={{ background: c, borderColor: (block.animatedBgColor || '#f97316') === c ? '#f97316' : 'transparent', boxShadow: (block.animatedBgColor || '#f97316') === c ? '0 0 0 2px #fff,0 0 0 4px #f97316' : 'none' }} />
            ))}
            <label className="w-7 h-7 rounded-lg border-2 overflow-hidden cursor-pointer relative" style={{ borderColor: 'rgba(0,0,0,.1)' }} title="Cor personalizada">
              <input type="color" value={block.animatedBgColor || '#f97316'} onChange={e => set('animatedBgColor', e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
              <div className="w-full h-full flex items-center justify-center text-[13px]">🎨</div>
            </label>
          </div>
        </div>
      )}
      <ContinuousBgControls block={block} onChange={onChange} />
      <SectionShapeControls block={block} onChange={onChange} />
    </>
  );
}


// ── Controles de Fundo Contínuo ───────────────────────────────────────────────

export function buildBgCSS(block: PageBlock): string {
  const mode = block.continuousBgMode || 'none';
  if (mode === 'none') return '';
  const type = block.continuousBgType || 'gradient';
  const c1 = block.continuousBgColor1 || '#07101f';
  const c2 = block.continuousBgColor2 || '#1a4a7a';
  const angle = block.continuousBgAngle ?? 160;
  if (type === 'solid') return c1;
  if (type === 'image') return block.continuousBgImage ? `url(${block.continuousBgImage})` : c1;
  return `linear-gradient(${angle}deg, ${c1}, ${c2})`;
}

// Paletas predefinidas para gradientes
const GRADIENT_PRESETS = [
  { label: 'Oceano', c1: '#07101f', c2: '#1a4a7a', angle: 160 },
  { label: 'Noite', c1: '#0a0a0c', c2: '#1e1b4b', angle: 135 },
  { label: 'Floresta', c1: '#042f2e', c2: '#065f46', angle: 150 },
  { label: 'Crepúsculo', c1: '#1a0a00', c2: '#7c2d12', angle: 145 },
  { label: 'Aurora', c1: '#0d1117', c2: '#7c3aed', angle: 135 },
  { label: 'Cosmos', c1: '#020617', c2: '#1d4ed8', angle: 160 },
  { label: 'Brasa', c1: '#1c0a00', c2: '#c2410c', angle: 150 },
  { label: 'Rosa Escuro', c1: '#0f0014', c2: '#86198f', angle: 140 },
  { label: 'Grafite', c1: '#111111', c2: '#374151', angle: 160 },
  { label: 'Limpo', c1: '#f8fafc', c2: '#e2e8f0', angle: 160 },
];

const SOLID_PRESETS = [
  '#07101f', '#0a0a0c', '#0d1117', '#111827', '#1e1b4b',
  '#042f2e', '#1a0a00', '#0c0a09', '#f8fafc', '#ffffff',
];

function ColorSwatch({ color, selected, onClick }: { color: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={color}
      style={{
        width: 28, height: 28, borderRadius: 8,
        background: color,
        border: selected ? '2px solid #f97316' : '2px solid rgba(0,0,0,.1)',
        boxShadow: selected ? '0 0 0 3px #fff, 0 0 0 5px #f97316' : 'none',
        cursor: 'pointer',
        transition: 'all .15s',
        flexShrink: 0,
      }}
    />
  );
}

function ColorPickerRow({
  label, hint, value, onChange, presets,
}: {
  label: string; hint: string; value: string;
  onChange: (v: string) => void; presets: string[];
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#1d1d1f', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 10, color: '#98989d', marginBottom: 6 }}>{hint}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        {presets.map(c => (
          <ColorSwatch key={c} color={c} selected={value === c} onClick={() => onChange(c)} />
        ))}
        {/* Custom color picker */}
        <label
          title="Cor personalizada"
          style={{
            width: 28, height: 28, borderRadius: 8,
            border: '2px dashed rgba(0,0,0,.2)',
            cursor: 'pointer', position: 'relative', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff)',
          }}
        >
          <input
            type="color"
            value={value}
            onChange={e => onChange(e.target.value)}
            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
          />
          <span style={{ fontSize: 12, color: '#fff', fontWeight: 700, textShadow: '0 1px 2px rgba(0,0,0,.8)', pointerEvents: 'none' }}>+</span>
        </label>
        {/* Hex input */}
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          maxLength={7}
          style={{
            width: 72, height: 28, borderRadius: 8, border: '1.5px solid rgba(0,0,0,.12)',
            fontSize: 11, fontFamily: 'monospace', paddingLeft: 8, color: '#1d1d1f',
            background: '#fafafa',
          }}
        />
      </div>
    </div>
  );
}

// Preview ao vivo do fundo contínuo — simula 3 seções empilhadas
function LiveBgPreview({ block }: { block: PageBlock }) {
  const mode = block.continuousBgMode || 'none';
  const bgCSS = buildBgCSS(block);
  const opacity = (block.continuousBgOpacity ?? 100) / 100;
  const bgType = block.continuousBgType || 'gradient';
  const isImage = bgType === 'image';

  const sectionLabels = ['Hero', 'Funcionalidades', 'CTA'];
  const sectionHeights = [52, 64, 44];

  if (mode === 'none') {
    return (
      <div style={{
        borderRadius: 12, overflow: 'hidden',
        border: '1.5px solid rgba(0,0,0,.08)',
        background: '#f5f5f7',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: 80, marginBottom: 12,
      }}>
        <span style={{ fontSize: 11, color: '#aaa' }}>Fundo desativado</span>
      </div>
    );
  }

  if (mode === 'parent') {
    // Todos os blocos dentro de um wrapper com o fundo
    return (
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 10, color: '#98989d', marginBottom: 4, fontWeight: 600 }}>
          PREVIEW · MODO PARENT
        </div>
        <div style={{
          borderRadius: 12, overflow: 'hidden',
          border: '1.5px solid rgba(0,0,0,.08)',
          backgroundImage: isImage ? bgCSS : undefined,
          background: !isImage ? bgCSS : undefined,
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity,
        }}>
          {sectionLabels.map((label, i) => (
            <div key={i} style={{
              height: sectionHeights[i],
              borderBottom: i < 2 ? '1px solid rgba(255,255,255,.1)' : 'none',
              display: 'flex', alignItems: 'center', paddingLeft: 12,
              position: 'relative',
            }}>
              <span style={{
                fontSize: 10, fontWeight: 700,
                color: 'rgba(255,255,255,.55)',
                letterSpacing: '.04em',
                textTransform: 'uppercase' as const,
              }}>{label}</span>
              {/* decorative nav dots */}
              <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 3 }}>
                {[14, 10, 6].map((w, j) => (
                  <div key={j} style={{ width: w, height: 3, borderRadius: 2, background: 'rgba(100,200,255,.35)' }} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 10, color: '#3b82f6', background: '#eff6ff', borderRadius: 8, padding: '5px 8px', marginTop: 6 }}>
          💡 Blocos consecutivos com o mesmo fundo compartilham um wrapper contínuo.
        </div>
      </div>
    );
  }

  if (mode === 'fixed') {
    // Cada bloco tem o fundo fixo ao viewport
    return (
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 10, color: '#98989d', marginBottom: 4, fontWeight: 600 }}>
          PREVIEW · MODO FIXED
        </div>
        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1.5px solid rgba(0,0,0,.08)' }}>
          {sectionLabels.map((label, i) => (
            <div key={i} style={{
              height: sectionHeights[i],
              backgroundImage: isImage ? bgCSS : undefined,
              background: !isImage ? bgCSS : undefined,
              backgroundSize: 'cover', backgroundPosition: 'center',
              opacity,
              borderBottom: i < 2 ? '1px solid rgba(255,255,255,.1)' : 'none',
              display: 'flex', alignItems: 'center', paddingLeft: 12,
            }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.55)', letterSpacing: '.04em', textTransform: 'uppercase' as const }}>{label}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 10, color: '#b45309', background: '#fffbeb', borderRadius: 8, padding: '5px 8px', marginTop: 6 }}>
          ⚠️ Não funciona em iOS Safari. Prefira Parent ou JS Offset em mobile.
        </div>
      </div>
    );
  }

  if (mode === 'js_offset') {
    // Mostra o efeito de fatia: cada seção exibe uma "janela" diferente do mesmo gradiente
    const totalH = sectionHeights.reduce((a, b) => a + b, 0);
    let accH = 0;
    return (
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 10, color: '#98989d', marginBottom: 4, fontWeight: 600 }}>
          PREVIEW · MODO JS OFFSET
        </div>
        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1.5px solid rgba(0,0,0,.08)' }}>
          {sectionLabels.map((label, i) => {
            const offsetPct = (accH / totalH) * 100;
            const h = sectionHeights[i];
            accH += h;
            return (
              <div key={i} style={{
                height: h,
                backgroundImage: isImage ? bgCSS : undefined,
                background: !isImage ? bgCSS : undefined,
                backgroundSize: `100% ${totalH * 2.5}px`,
                backgroundPosition: `0px -${(accH - h)}px`,
                backgroundRepeat: 'no-repeat',
                opacity,
                borderBottom: i < 2 ? '1px solid rgba(255,255,255,.1)' : 'none',
                display: 'flex', alignItems: 'center', paddingLeft: 12,
                position: 'relative',
              }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.55)', letterSpacing: '.04em', textTransform: 'uppercase' as const }}>{label}</span>
                <span style={{ position: 'absolute', right: 8, fontSize: 9, color: 'rgba(255,255,255,.3)', fontFamily: 'monospace' }}>
                  offset: {Math.round(offsetPct)}%
                </span>
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: 10, color: '#15803d', background: '#f0fdf4', borderRadius: 8, padding: '5px 8px', marginTop: 6 }}>
          ✅ Precisão máxima. Funciona em todos os browsers incluindo iOS Safari.
        </div>
      </div>
    );
  }

  return null;
}


// ─── Forma da Seção ────────────────────────────────────────────────────────────

const SECTION_SHAPES: { v: SectionShape; label: string; topPath: string; bottomPath: string }[] = [
  { v: 'none', label: 'Nenhum', topPath: 'M0,0 L100,0 L100,100 L0,100 Z', bottomPath: 'M0,0 L100,0 L100,100 L0,100 Z' },
  { v: 'wave', label: 'Onda', topPath: 'M0,60 C15,40 35,80 50,60 C65,40 85,80 100,60 L100,0 L0,0 Z', bottomPath: 'M0,40 C15,60 35,20 50,40 C65,60 85,20 100,40 L100,100 L0,100 Z' },
  { v: 'wave-soft', label: 'Onda Suave', topPath: 'M0,70 C25,50 75,90 100,70 L100,0 L0,0 Z', bottomPath: 'M0,30 C25,50 75,10 100,30 L100,100 L0,100 Z' },
  { v: 'diagonal-right', label: 'Diagonal /', topPath: 'M0,0 L100,0 L100,30 L0,100 Z', bottomPath: 'M0,0 L100,70 L100,100 L0,100 Z' },
  { v: 'diagonal-left', label: 'Diagonal \\', topPath: 'M0,30 L100,0 L100,0 L0,0 Z', bottomPath: 'M0,100 L100,100 L100,70 L0,100 Z' },
  { v: 'arc-down', label: 'Arco Down', topPath: 'M0,0 L100,0 Q50,100 0,0 Z', bottomPath: 'M0,100 L100,100 Q50,0 0,100 Z' },
  { v: 'arc-up', label: 'Arco Up', topPath: 'M0,100 Q50,0 100,100 L100,0 L0,0 Z', bottomPath: 'M0,0 Q50,100 100,0 L100,100 L0,100 Z' },
  { v: 'zigzag', label: 'Zigzag', topPath: 'M0,50 L12.5,0 L25,50 L37.5,0 L50,50 L62.5,0 L75,50 L87.5,0 L100,50 L100,0 L0,0 Z', bottomPath: 'M0,50 L12.5,100 L25,50 L37.5,100 L50,50 L62.5,100 L75,50 L87.5,100 L100,50 L100,100 L0,100 Z' },
  { v: 'slant-both', label: 'Inclinado', topPath: 'M0,60 L100,0 L100,0 L0,0 Z', bottomPath: 'M0,100 L100,100 L100,40 L0,100 Z' },
];

export function buildSectionShapeCSS(shape: SectionShape, position: 'top' | 'bottom', color: string, size: number): string {
  if (shape === 'none') return '';
  const found = SECTION_SHAPES.find(s => s.v === shape);
  if (!found) return '';
  const path = position === 'top' ? found.topPath : found.bottomPath;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='none'><path d='${path}' fill='${color.replace('#', '%23')}'/></svg>`;
  return `url("data:image/svg+xml,${svg}")`;
}

function ShapePreviewSVG({ path, active }: { path: string; active: boolean }) {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none"
      style={{ width: '100%', height: 34, display: 'block' }}>
      <rect width="100" height="100" fill={active ? '#fff7ed' : '#f0f0f2'} />
      <path d={path} fill={active ? '#f97316' : '#c7c7cc'} />
    </svg>
  );
}

function SectionShapeControls({ block, onChange }: { block: PageBlock; onChange: (b: PageBlock) => void }) {
  const set = <K extends keyof PageBlock>(k: K, v: PageBlock[K]) => onChange({ ...block, [k]: v });
  const shapeTop = (block.sectionShapeTop || 'none') as SectionShape;
  const shapeBottom = (block.sectionShapeBottom || 'none') as SectionShape;
  const shapeColor = block.sectionShapeColor || '#ffffff';
  const shapeSize = block.sectionShapeSize ?? 3;
  const [tab, setTab] = React.useState<'top' | 'bottom'>('top');
  const activeShape = tab === 'top' ? shapeTop : shapeBottom;
  const hasAny = shapeTop !== 'none' || shapeBottom !== 'none';

  return (
    <>
      <SectionDivider label="Forma da Seção" />
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {(['top', 'bottom'] as const).map(t => {
          const hasShape = t === 'top' ? shapeTop !== 'none' : shapeBottom !== 'none';
          return (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, height: 30, borderRadius: 8, fontSize: 11, fontWeight: 700,
              border: tab === t ? '2px solid #f97316' : '2px solid rgba(0,0,0,.1)',
              background: tab === t ? '#fff7ed' : '#f5f5f7',
              color: tab === t ? '#f97316' : '#6e6e73',
              cursor: 'pointer', position: 'relative' as const,
            }}>
              {t === 'top' ? '↑ Topo' : '↓ Base'}
              {hasShape && <span style={{ position: 'absolute', top: 4, right: 6, width: 6, height: 6, borderRadius: '50%', background: '#f97316' }} />}
            </button>
          );
        })}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5, marginBottom: 12 }}>
        {SECTION_SHAPES.map(s => {
          const active = activeShape === s.v;
          const path = tab === 'top' ? s.topPath : s.bottomPath;
          return (
            <button key={s.v}
              onClick={() => set(tab === 'top' ? 'sectionShapeTop' : 'sectionShapeBottom', s.v)}
              title={s.label}
              style={{
                borderRadius: 10, overflow: 'hidden', padding: 0,
                border: active ? '2px solid #f97316' : '2px solid rgba(0,0,0,.08)',
                cursor: 'pointer', display: 'flex', flexDirection: 'column' as const,
                alignItems: 'center', transition: 'all .15s', background: 'transparent',
              }}>
              <ShapePreviewSVG path={path} active={active} />
              <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 0 4px', color: active ? '#f97316' : '#6e6e73' }}>{s.label}</span>
            </button>
          );
        })}
      </div>
      {hasAny && (
        <>
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#1d1d1f' }}>Cor da Forma</div>
            </div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' as const, alignItems: 'center' }}>
              {['#ffffff', '#f5f5f7', '#07101f', '#0a0a0c', '#f97316', '#1a4a7a', '#312e81', '#065f46'].map(c => (
                <button key={c} onClick={() => set('sectionShapeColor', c)} style={{
                  width: 24, height: 24, borderRadius: 6, background: c,
                  border: shapeColor === c ? '2px solid #f97316' : '2px solid rgba(0,0,0,.12)',
                  boxShadow: shapeColor === c ? '0 0 0 2px #fff,0 0 0 4px #f97316' : 'none',
                  cursor: 'pointer',
                }} />
              ))}
              <label style={{ width: 24, height: 24, borderRadius: 6, border: '1.5px solid rgba(0,0,0,.1)', overflow: 'hidden', cursor: 'pointer', display: 'block', position: 'relative' as const }}>
                <input type="color" value={shapeColor} onChange={e => set('sectionShapeColor', e.target.value)}
                  style={{ position: 'absolute', inset: 0, opacity: 0, width: '200%', height: '200%', cursor: 'pointer' }} />
                <div style={{ width: '100%', height: '100%', background: shapeColor }} />
              </label>
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#1d1d1f' }}>Tamanho</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#f97316', background: '#fff7ed', borderRadius: 6, padding: '2px 8px', border: '1px solid #fed7aa' }}>
                {['XS', 'SM', 'MD', 'LG', 'XL'][shapeSize - 1]}
              </div>
            </div>
            <input type="range" min={1} max={5} step={1} value={shapeSize}
              onChange={e => set('sectionShapeSize', Number(e.target.value))}
              style={{ width: '100%', accentColor: '#f97316' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#98989d', marginTop: 2 }}>
              <span>XS</span><span>SM</span><span>MD</span><span>LG</span><span>XL</span>
            </div>
          </div>
          <div style={{ fontSize: 10, color: '#15803d', background: '#f0fdf4', borderRadius: 8, padding: '6px 8px', marginBottom: 4 }}>
            💡 Use a cor da seção adjacente para o efeito de corte visual perfeito.
          </div>
        </>
      )}
    </>
  );
}

function ContinuousBgControls({ block, onChange }: { block: PageBlock; onChange: (b: PageBlock) => void }) {
  const set = <K extends keyof PageBlock>(k: K, v: PageBlock[K]) => onChange({ ...block, [k]: v });
  const mode = block.continuousBgMode || 'none';
  const bgType = block.continuousBgType || 'gradient';
  const c1 = block.continuousBgColor1 || '#07101f';
  const c2 = block.continuousBgColor2 || '#1a4a7a';
  const angle = block.continuousBgAngle ?? 160;
  const opacity = block.continuousBgOpacity ?? 100;

  const modeOpts: { v: ContinuousBgMode; label: string; icon: string }[] = [
    { v: 'none', label: 'Desativado', icon: '○' },
    { v: 'parent', label: 'Parent', icon: '⊡' },
    { v: 'fixed', label: 'Fixed', icon: '⊞' },
    { v: 'js_offset', label: 'JS Offset', icon: '⊟' },
  ];

  const typeOpts: { v: ContinuousBgType; label: string; icon: string }[] = [
    { v: 'gradient', label: 'Gradiente', icon: '▣' },
    { v: 'solid', label: 'Sólido', icon: '■' },
    { v: 'image', label: 'Imagem', icon: '▨' },
  ];

  return (
    <>
      <SectionDivider label="Fundo Contínuo" />

      {/* Seletor de modo — cards visuais */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#1d1d1f', marginBottom: 2 }}>Modo</div>
        <div style={{ fontSize: 10, color: '#98989d', marginBottom: 8 }}>Como o fundo é aplicado neste bloco</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {modeOpts.map(o => (
            <button key={o.v} onClick={() => set('continuousBgMode', o.v)}
              style={{
                padding: '8px 6px',
                borderRadius: 10,
                border: mode === o.v ? '2px solid #f97316' : '2px solid rgba(0,0,0,.08)',
                background: mode === o.v ? '#fff7ed' : '#f5f5f7',
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 3,
                transition: 'all .15s',
              }}>
              <span style={{ fontSize: 16, lineHeight: 1 }}>{o.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: mode === o.v ? '#f97316' : '#6e6e73' }}>{o.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Preview ao vivo */}
      <LiveBgPreview block={block} />

      {mode !== 'none' && (
        <>
          {/* Tipo */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#1d1d1f', marginBottom: 6 }}>Tipo de Fundo</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
              {typeOpts.map(o => (
                <button key={o.v} onClick={() => set('continuousBgType', o.v)}
                  style={{
                    padding: '7px 4px',
                    borderRadius: 10,
                    border: bgType === o.v ? '2px solid #f97316' : '2px solid rgba(0,0,0,.08)',
                    background: bgType === o.v ? '#fff7ed' : '#f5f5f7',
                    cursor: 'pointer',
                    display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 2,
                    transition: 'all .15s',
                  }}>
                  <span style={{ fontSize: 14 }}>{o.icon}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: bgType === o.v ? '#f97316' : '#6e6e73' }}>{o.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Presets de gradiente */}
          {bgType === 'gradient' && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#1d1d1f', marginBottom: 6 }}>Presets</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 5 }}>
                {GRADIENT_PRESETS.map(p => {
                  const isSelected = c1 === p.c1 && c2 === p.c2 && angle === p.angle;
                  return (
                    <button key={p.label}
                      title={p.label}
                      onClick={() => onChange({ ...block, continuousBgColor1: p.c1, continuousBgColor2: p.c2, continuousBgAngle: p.angle })}
                      style={{
                        height: 32, borderRadius: 8,
                        background: `linear-gradient(${p.angle}deg, ${p.c1}, ${p.c2})`,
                        border: isSelected ? '2px solid #f97316' : '2px solid transparent',
                        boxShadow: isSelected ? '0 0 0 3px #fff, 0 0 0 5px #f97316' : '0 1px 3px rgba(0,0,0,.2)',
                        cursor: 'pointer', padding: 0,
                        transition: 'all .15s',
                      }} />
                  );
                })}
              </div>
            </div>
          )}

          {/* Cor 1 */}
          {(bgType === 'gradient' || bgType === 'solid') && (
            <ColorPickerRow
              label={bgType === 'solid' ? 'Cor' : 'Cor inicial'}
              hint={bgType === 'solid' ? 'Cor sólida do fundo' : 'Cor de início do gradiente'}
              value={c1}
              onChange={v => set('continuousBgColor1', v)}
              presets={SOLID_PRESETS}
            />
          )}

          {/* Cor 2 + ângulo */}
          {bgType === 'gradient' && (
            <>
              <ColorPickerRow
                label="Cor final"
                hint="Cor de término do gradiente"
                value={c2}
                onChange={v => set('continuousBgColor2', v)}
                presets={['#1a4a7a', '#312e81', '#065f46', '#7c3aed', '#1d4ed8', '#0891b2', '#c2410c', '#dc2626', '#f97316', '#be185d']}
              />
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#1d1d1f' }}>Ângulo</div>
                  <div style={{
                    fontSize: 11, fontWeight: 700, color: '#f97316',
                    background: '#fff7ed', borderRadius: 6, padding: '2px 8px',
                    border: '1px solid #fed7aa',
                  }}>{angle}°</div>
                </div>
                <input type="range" min={0} max={360} step={5} value={angle}
                  onChange={e => set('continuousBgAngle', Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#f97316' }}
                />
                {/* Ângulos rápidos */}
                <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                  {[0, 45, 90, 135, 160, 180].map(a => (
                    <button key={a} onClick={() => set('continuousBgAngle', a)}
                      style={{
                        flex: 1, height: 24, borderRadius: 6, fontSize: 9, fontWeight: 700,
                        border: angle === a ? '1.5px solid #f97316' : '1.5px solid rgba(0,0,0,.1)',
                        background: angle === a ? '#fff7ed' : '#f5f5f7',
                        color: angle === a ? '#f97316' : '#6e6e73',
                        cursor: 'pointer',
                      }}>{a}°</button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Imagem URL */}
          {bgType === 'image' && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#1d1d1f', marginBottom: 4 }}>URL da Imagem</div>
              <input
                type="text"
                value={block.continuousBgImage || ''}
                onChange={e => set('continuousBgImage', e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
                style={{
                  width: '100%', height: 36, borderRadius: 8,
                  border: '1.5px solid rgba(0,0,0,.12)',
                  fontSize: 11, paddingLeft: 10, color: '#1d1d1f',
                  background: '#fafafa', outline: 'none',
                }}
              />
              {block.continuousBgImage && (
                <div style={{
                  marginTop: 6, height: 60, borderRadius: 8, overflow: 'hidden',
                  backgroundImage: `url(${block.continuousBgImage})`,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  border: '1px solid rgba(0,0,0,.08)',
                }} />
              )}
            </div>
          )}

          {/* Opacidade */}
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#1d1d1f' }}>Opacidade</div>
              <div style={{
                fontSize: 11, fontWeight: 700, color: '#f97316',
                background: '#fff7ed', borderRadius: 6, padding: '2px 8px',
                border: '1px solid #fed7aa',
              }}>{opacity}%</div>
            </div>
            {/* Barra de opacidade com preview de cor */}
            <div style={{ position: 'relative', height: 20, borderRadius: 8, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `linear-gradient(90deg, transparent, ${c1})`,
                borderRadius: 8,
              }} />
              <input type="range" min={0} max={100} step={5} value={opacity}
                onChange={e => set('continuousBgOpacity', Number(e.target.value))}
                style={{ position: 'absolute', inset: 0, width: '100%', opacity: 0, cursor: 'pointer', height: '100%' }}
              />
              {/* Thumb indicator */}
              <div style={{
                position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                left: `calc(${opacity}% - 8px)`,
                width: 16, height: 16, borderRadius: '50%',
                background: '#fff', border: '2px solid #f97316',
                boxShadow: '0 1px 4px rgba(0,0,0,.2)',
                pointerEvents: 'none', transition: 'left .05s',
              }} />
            </div>
            <input type="range" min={0} max={100} step={5} value={opacity}
              onChange={e => set('continuousBgOpacity', Number(e.target.value))}
              style={{ width: '100%', accentColor: '#f97316' }}
            />
          </div>
        </>
      )}
    </>
  );
}

function parseCss(css: string): React.CSSProperties {
  const result: Record<string, string> = {};
  if (!css) return result;
  css.split(';').forEach(rule => {
    const [prop, ...vals] = rule.split(':');
    if (prop && vals.length) {
      const key = prop.trim().replace(/-([a-z])/g, (_, l) => l.toUpperCase());
      result[key] = vals.join(':').trim();
    }
  });
  return result as React.CSSProperties;
}

const BANNER_STYLES = [
  { id: 'cinematic', label: 'Cinemático' },
  { id: 'neon', label: 'Neon' },
  { id: 'editorial', label: 'Editorial' },
  { id: 'split', label: 'Dividido' },
  { id: 'bold', label: 'Impacto' },
  { id: 'parallax', label: 'Parallax' },
  { id: 'oxpay', label: 'Oxpay' },
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
  if (id === 'oxpay') return (
    <div style={{ ...base, background: '#050508' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px)', backgroundSize: '10px 10px', opacity: 0.2 }} />
      <div style={{ position: 'absolute', top: '10%', right: '10%', width: '40%', height: '40%', borderRadius: '50%', background: a, filter: 'blur(15px)', opacity: 0.3 }} />
      <div style={{ position: 'absolute', bottom: '10%', left: '10%', width: '30%', height: '30%', borderRadius: '50%', background: a, filter: 'blur(12px)', opacity: 0.2 }} />
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
            <Input value={block.title || ''} onChange={e => set('title', e.target.value)} placeholder="Ex: Tecnologia que Impulsiona" className="h-9" />
          </div>
          <div>
            <FL hint="Pílula pequena acima do título">Badge / Subtítulo</FL>
            <Input value={block.badge || ''} onChange={e => set('badge', e.target.value)} placeholder="Frase de destaque" className="h-9" />
          </div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <FL>Descrição</FL>
          <Textarea value={block.description || ''} onChange={e => set('description', e.target.value)}
            placeholder="Texto de apoio..." rows={2} className="resize-none text-[13px]" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <FL>Texto do Botão</FL>
            <Input value={block.ctaLabel || ''} onChange={e => set('ctaLabel', e.target.value)} placeholder="Ex: Saiba mais" className="h-9" />
          </div>
          <div>
            <FL>Link do Botão</FL>
            <Input value={block.ctaLink || ''} onChange={e => set('ctaLink', e.target.value)} placeholder="/solucoes ou https://..." className="h-9" />
          </div>
        </div>
      </div>
      <SpacingRadiusControls block={block} onChange={onChange} />
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
          { v: 'light' as const, label: 'Claro', bg: '#f5f5f7', fg: '#1d1d1f', border: 'rgba(0,0,0,.08)' },
          { v: 'dark' as const, label: 'Escuro', bg: '#0a0a0c', fg: '#fff', border: 'transparent' },
          { v: 'brand' as const, label: 'Cor tema', bg: '#f97316', fg: '#fff', border: 'transparent' },
        ].map(o => (
          <button key={o.v} onClick={() => set('colorTheme', o.v)}
            className="flex-1 h-8 rounded-xl text-[11px] font-bold border-2 transition"
            style={{ background: o.bg, color: o.fg, borderColor: block.colorTheme === o.v ? '#f97316' : o.border }}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );

  // ── Features ──────────────────────────────────────────────────────────────
  if (block.type === 'features') {
    const featLayouts: { v: string; label: string; desc: string; preview: string }[] = [
      { v: 'split_dark', label: 'Split Dark', desc: 'Título à esq., cards colunados à dir. — fundo escuro', preview: '◧' },
      { v: 'dark_cards', label: 'Dark Cards', desc: 'Cards escuros com ícone grande no topo', preview: '▦' },
      { v: 'half_split', label: 'Half & Half', desc: 'Fundo claro/escuro dividido, cards em grade', preview: '◑' },
      { v: 'highlight_list', label: 'Lista Numerada', desc: 'Número em destaque + texto, 2 colunas', preview: '⑆' },
      { v: 'checklist', label: 'Checklist', desc: 'Check com pílula arredondada', preview: '✓' },
      { v: 'cards_hover', label: 'Cards Hover', desc: 'Cards com animação no hover', preview: '▣' },
      { v: 'community_connect', label: 'Community Connect', desc: 'Título à esq., grid de links sociais/canais à dir.', preview: '⊞' },
    ];
    const currentLayout = block.featuresLayout || 'split_dark';
    const accent = block.featuresAccent || '#f97316';

    return (
      <div className="space-y-4">

        <SectionDivider label="Layout" />
        <div>
          <FL hint="Estilo visual da seção de features">Estilo Visual</FL>
          <div className="grid grid-cols-1 gap-1.5">
            {featLayouts.map(o => {
              const sel = currentLayout === o.v;
              return (
                <button key={o.v} onClick={() => set('featuresLayout', o.v as FeaturesLayout)}
                  className="text-left px-3 py-2.5 rounded-xl border-2 transition flex items-center gap-3"
                  style={{ borderColor: sel ? accent : 'rgba(0,0,0,.08)', background: sel ? `${accent}10` : '#fafafa' }}>
                  <span className="text-[18px] w-7 text-center flex-shrink-0" style={{ color: sel ? accent : '#aaa' }}>{o.preview}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[12px] font-bold" style={{ color: sel ? accent : '#1d1d1f' }}>{o.label}</p>
                      {sel && <span className="text-[10px] font-bold" style={{ color: accent }}>✓</span>}
                    </div>
                    <p className="text-[10px] leading-snug truncate" style={{ color: '#98989d' }}>{o.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <SectionDivider label="Cor de Destaque" />
        <div>
          <FL hint="Cor usada nos números, ícones e destaques">Cor do Tema</FL>
          <div className="flex items-center gap-2">
            <input type="color" value={accent} onChange={e => set('featuresAccent', e.target.value)}
              className="w-10 h-10 rounded-xl border-2 cursor-pointer flex-shrink-0"
              style={{ borderColor: 'rgba(0,0,0,.1)', padding: 2 }} />
            <Input value={accent} onChange={e => set('featuresAccent', e.target.value)}
              placeholder="#f97316" className="h-9 font-mono text-[13px]" />
            <div className="flex gap-1.5 flex-shrink-0">
              {['#f97316', '#2563eb', '#16a34a', '#9333ea', '#e11d48', '#0ea5e9'].map(c => (
                <button key={c} onClick={() => set('featuresAccent', c)}
                  className="w-6 h-6 rounded-lg border-2 transition"
                  style={{ background: c, borderColor: accent === c ? '#1d1d1f' : 'transparent' }} />
              ))}
            </div>
          </div>
        </div>

        <SectionDivider label="Conteúdo" />
        <div>
          <FL hint="Label pequeno acima do título (ex: FEATURES, RECURSOS)">Label / Badge</FL>
          <Input value={block.featuresLabel || ''} onChange={e => set('featuresLabel', e.target.value)} placeholder="FEATURES" className="h-9 font-mono text-[12px]" />
        </div>
        <div><FL>Título principal</FL><Input value={block.title || ''} onChange={e => set('title', e.target.value)} placeholder="Os blocos de uma plataforma poderosa" className="h-9" /></div>
        <div><FL hint="Subtítulo abaixo do título">Subtítulo / Descrição</FL>
          <Textarea value={block.subtitle || ''} onChange={e => set('subtitle', e.target.value)} placeholder="Nossa equipe vai entrar em contato para entender melhor suas necessidades" className="text-[13px] resize-none" rows={2} />
        </div>
        <div>
          <FL hint="Cada linha vira um card no layout selecionado">Itens</FL>
          <TagList items={block.items || []} onChange={v => set('items', v)} placeholder="Ex: Controle de estoque em tempo real" />
        </div>

        {/* ── Community Connect specific editor ── */}
        {currentLayout === 'community_connect' && (() => {
          const cbg = block.communityBgColor || '#1e2235';
          const ctxt = block.communityTextColor || '#ffffff';
          const cacc = block.communityAccentColor || '#7c9cff';
          const cmut = block.communityMutedColor || '#a0aabe';
          const setCard = (i: number, field: string, val: string) => {
            const a = [...(block.communityCards || [])];
            a[i] = { ...a[i], [field]: val };
            set('communityCards', a);
          };
          return (
            <>
              {/* ── Seção 1: Textos principais ── */}
              <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,.07)', borderRadius: 14, padding: 16, marginTop: 4 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#1d1d1f', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14 }}>✏️</span> Textos do Lado Esquerdo
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <p style={{ fontSize: 11, color: '#98989d', marginBottom: 4 }}>Eyebrow <span style={{ opacity: .6 }}>— texto pequeno acima do título</span></p>
                    <Input value={block.communityEyebrow || ''} onChange={e => set('communityEyebrow', e.target.value)}
                      placeholder="Before you go..." className="h-9" />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: '#98989d', marginBottom: 4 }}>Título principal</p>
                    <Input value={block.title || ''} onChange={e => set('title', e.target.value)}
                      placeholder="Connect with our Community!" className="h-9" />
                  </div>
                </div>
              </div>

              {/* ── Seção 2: Cores com mini-preview ── */}
              <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,.07)', borderRadius: 14, padding: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#1d1d1f', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14 }}>🎨</span> Cores
                </p>

                {/* Mini-preview ao vivo */}
                <div style={{ borderRadius: 10, overflow: 'hidden', marginBottom: 14, border: '1px solid rgba(0,0,0,.06)' }}>
                  <div style={{ background: cbg, padding: '10px 14px', display: 'grid', gridTemplateColumns: '1fr 1.4fr' }}>
                    <div style={{ paddingRight: 10, borderRight: '1px solid rgba(255,255,255,.1)' }}>
                      <p style={{ fontSize: 9, color: cmut, marginBottom: 2 }}>Before you go...</p>
                      <p style={{ fontSize: 11, fontWeight: 700, color: ctxt, lineHeight: 1.2 }}>Connect with<br />Community!</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, paddingLeft: 10 }}>
                      {['Discord', 'Github', 'LinkedIn', 'E-mail'].map((name, i) => (
                        <div key={i} style={{ padding: '4px 6px' }}>
                          <p style={{ fontSize: 8, fontWeight: 700, color: ctxt, marginBottom: 1 }}>{name}.</p>
                          <p style={{ fontSize: 7, color: cmut, marginBottom: 2 }}>Description here.</p>
                          <p style={{ fontSize: 7, color: cacc, fontWeight: 600 }}>Join ›</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { label: 'Fundo', hint: 'Cor de fundo do bloco', key: 'communityBgColor', val: cbg },
                    { label: 'Texto', hint: 'Títulos e texto principal', key: 'communityTextColor', val: ctxt },
                    { label: 'Links', hint: 'Cor dos links/botões', key: 'communityAccentColor', val: cacc },
                    { label: 'Secundário', hint: 'Descrições e textos menores', key: 'communityMutedColor', val: cmut },
                  ].map(({ label, hint, key, val }) => (
                    <div key={key}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: '#1d1d1f', marginBottom: 2 }}>{label}</p>
                      <p style={{ fontSize: 10, color: '#98989d', marginBottom: 6 }}>{hint}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: val, border: '1px solid rgba(0,0,0,.12)', cursor: 'pointer', overflow: 'hidden' }}>
                            <input type="color" value={val}
                              onChange={e => set(key as keyof typeof block, e.target.value)}
                              style={{ opacity: 0, position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                          </div>
                        </div>
                        <Input value={val} onChange={e => set(key as keyof typeof block, e.target.value)}
                          className="h-8 font-mono text-[11px]" style={{ flex: 1 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Seção 3: Cards de Canal ── */}
              <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,.07)', borderRadius: 14, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#1d1d1f', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 14 }}>🔗</span> Canais / Links
                    </p>
                    <p style={{ fontSize: 10, color: '#98989d', marginTop: 2 }}>Aparecem no grid à direita — máx. 6 recomendado</p>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 px-2 text-[11px] gap-1 flex-shrink-0"
                    onClick={() => set('communityCards', [...(block.communityCards || []), { title: '', desc: '', linkLabel: 'Join', linkUrl: '#' }])}>
                    <Plus style={{ width: 11, height: 11 }} /> Adicionar
                  </Button>
                </div>

                {(block.communityCards || []).length === 0 && (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: '#c7c7cc', fontSize: 12 }}>
                    Nenhum canal ainda — clique em Adicionar
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {(block.communityCards || []).map((card, i) => (
                    <div key={i} style={{ border: '1px solid rgba(0,0,0,.08)', borderRadius: 10, overflow: 'hidden' }}>
                      {/* Header do card — clicável para expandir */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: '#f9f9f9', cursor: 'default' }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: cbg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: ctxt }}>{i + 1}</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 12, fontWeight: 600, color: '#1d1d1f', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {card.title || <span style={{ color: '#c7c7cc' }}>Sem título</span>}
                          </p>
                          {card.desc && <p style={{ fontSize: 10, color: '#98989d', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.desc}</p>}
                        </div>
                        <a href={card.linkUrl || '#'} target="_blank" style={{ fontSize: 10, color: cacc, fontWeight: 600, flexShrink: 0, textDecoration: 'none' }}>{card.linkLabel || 'Join'} ›</a>
                        <button onClick={() => set('communityCards', (block.communityCards || []).filter((_, j) => j !== i))}
                          style={{ width: 22, height: 22, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c7c7cc', flexShrink: 0 }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fee2e2'; (e.currentTarget as HTMLElement).style.color = '#ef4444'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#c7c7cc'; }}>
                          <X style={{ width: 11, height: 11 }} />
                        </button>
                      </div>
                      {/* Campos do card */}
                      <div style={{ padding: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <p style={{ fontSize: 10, color: '#98989d', marginBottom: 3 }}>Título do canal</p>
                          <Input value={card.title} placeholder="Ex: Discord." className="h-8 text-[12px]"
                            onChange={e => setCard(i, 'title', e.target.value)} />
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <p style={{ fontSize: 10, color: '#98989d', marginBottom: 3 }}>Descrição curta</p>
                          <Input value={card.desc} placeholder="Ex: Connect our community channel." className="h-8 text-[12px]"
                            onChange={e => setCard(i, 'desc', e.target.value)} />
                        </div>
                        <div>
                          <p style={{ fontSize: 10, color: '#98989d', marginBottom: 3 }}>Texto do link</p>
                          <Input value={card.linkLabel} placeholder="Join" className="h-8 text-[12px]"
                            onChange={e => setCard(i, 'linkLabel', e.target.value)} />
                        </div>
                        <div>
                          <p style={{ fontSize: 10, color: '#98989d', marginBottom: 3 }}>URL de destino</p>
                          <Input value={card.linkUrl} placeholder="https://..." className="h-8 text-[12px]"
                            onChange={e => setCard(i, 'linkUrl', e.target.value)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          );
        })()}

        <SpacingRadiusControls block={block} onChange={onChange} />
      </div>
    );
  }

  // ── Benefits ──────────────────────────────────────────────────────────────
  if (block.type === 'benefits') {
    const layouts: { v: BenefitsLayout; label: string; desc: string }[] = [
      { v: 'grid_cards', label: 'Grid de Cards', desc: 'Cards em grade, fundo escuro' },
      { v: 'side_image', label: 'Lista c/ Imagem', desc: 'Texto à esq., imagem à dir.' },
      { v: 'carousel', label: 'Carrossel', desc: 'Navegação horizontal' },
    ];
    const [uploading, setUploading] = useState(false);
    const token = localStorage.getItem('token');
    const uploadImg = async (file: File) => {
      setUploading(true);
      try {
        const fd = new FormData(); fd.append('image', file);
        const res = await fetch(`${API_URL}/admin/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
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
        <div><FL>Título</FL><Input value={block.title || ''} onChange={e => set('title', e.target.value)} placeholder="Benefícios" className="h-9" /></div>
        <div>
          <FL hint="Itens com ícone para cada benefício">Benefícios com Ícone</FL>
          <div className="space-y-2">
            {(block.iconItems || []).map((item, i) => (
              <div key={i} className="p-3 rounded-xl bg-[#f5f5f7] group">
                <div className="flex items-center gap-2 mb-2">
                  <IconPicker value={item.icon} onChange={v => {
                    const a = [...(block.iconItems || [])]; a[i] = { ...a[i], icon: v }; set('iconItems', a);
                  }} />
                  <button onClick={() => set('iconItems', (block.iconItems || []).filter((_, j) => j !== i))}
                    className="ml-auto w-6 h-6 rounded-lg flex items-center justify-center text-[#c7c7cc] opacity-0 group-hover:opacity-100 transition hover:text-red-400 hover:bg-red-50">
                    <X style={{ width: 11, height: 11 }} />
                  </button>
                </div>
                <Input value={item.label} placeholder="Ex: +30% de vendas" className="h-8 text-[13px] bg-white mb-1.5"
                  onChange={e => { const a = [...(block.iconItems || [])]; a[i] = { ...a[i], label: e.target.value }; set('iconItems', a); }} />
                <Input value={item.desc || ''} placeholder="Descrição curta (opcional)" className="h-8 text-[13px] bg-white"
                  onChange={e => { const a = [...(block.iconItems || [])]; a[i] = { ...a[i], desc: e.target.value }; set('iconItems', a); }} />
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full h-8 text-[12px] gap-1.5"
              onClick={() => set('iconItems', [...(block.iconItems || []), { icon: '⚡', label: '', desc: '' }])}>
              <Plus style={{ width: 12, height: 12 }} /> Adicionar benefício
            </Button>
          </div>
        </div>

        {/* Lista simples como fallback */}
        <div>
          <FL hint="Lista simples (sem ícone)">Itens Simples (opcional)</FL>
          <TagList items={block.items || []} onChange={v => set('items', v)} placeholder="Ex: Redução de custos operacionais" />
        </div>

        <SpacingRadiusControls block={block} onChange={onChange} />
      </div>
    );
  }

  // ── Integrations ──────────────────────────────────────────────────────────
  if (block.type === 'integrations') return (
    <div className="space-y-3">
      <ThemePicker />
      <div><FL>Título</FL><Input value={block.title || ''} onChange={e => set('title', e.target.value)} placeholder="Integrações" className="h-9" /></div>
      <div><FL hint="Nome de cada sistema integrado">Sistemas</FL>
        <TagList items={block.items || []} onChange={v => set('items', v)} placeholder="Ex: iFood, SAP, Mercado Pago…" /></div>
      <SpacingRadiusControls block={block} onChange={onChange} />
    </div>
  );

  if (block.type === 'steps') return (
    <div className="space-y-3">
      <ThemePicker />
      <div><FL>Título</FL><Input value={block.title || ''} onChange={e => set('title', e.target.value)} placeholder="Como funciona" className="h-9" /></div>
      {(block.steps || []).map((step, i) => (
        <div key={i} className="p-3 rounded-xl bg-[#f5f5f7] space-y-2 group">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#f97316] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
            <Input value={step.title} placeholder="Título" className="h-8 text-[13px] bg-white flex-1"
              onChange={e => { const a = [...(block.steps || [])]; a[i] = { ...a[i], title: e.target.value }; set('steps', a); }} />
            <button onClick={() => set('steps', (block.steps || []).filter((_, j) => j !== i))}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-[#c7c7cc] opacity-0 group-hover:opacity-100 transition hover:text-red-400 hover:bg-red-50 flex-shrink-0">
              <X style={{ width: 11, height: 11 }} />
            </button>
          </div>
          <Textarea value={step.description} placeholder="Descrição…" rows={2} className="resize-none text-[13px] bg-white"
            onChange={e => { const a = [...(block.steps || [])]; a[i] = { ...a[i], description: e.target.value }; set('steps', a); }} />
        </div>
      ))}
      <Button variant="outline" size="sm" className="w-full h-8 text-[12px] gap-1.5"
        onClick={() => set('steps', [...(block.steps || []), { title: '', description: '' }])}>
        <Plus style={{ width: 12, height: 12 }} /> Adicionar passo
      </Button>
      <SpacingRadiusControls block={block} onChange={onChange} />
    </div>
  );

  if (block.type === 'stats') return (
    <div className="space-y-2">
      <ThemePicker />
      <FL hint="Máx. 4">Estatísticas</FL>
      {(block.stats || []).map((s, i) => (
        <div key={i} className="flex items-center gap-2 group">
          <Input value={s.value} placeholder="Ex: 500+" className="h-8 text-[13px]"
            onChange={e => { const a = [...(block.stats || [])]; a[i] = { ...a[i], value: e.target.value }; set('stats', a); }} />
          <Input value={s.label} placeholder="Ex: Clientes ativos" className="h-8 text-[13px]"
            onChange={e => { const a = [...(block.stats || [])]; a[i] = { ...a[i], label: e.target.value }; set('stats', a); }} />
          <button onClick={() => set('stats', (block.stats || []).filter((_, j) => j !== i))}
            className="w-6 h-6 rounded-lg flex items-center justify-center text-[#c7c7cc] opacity-0 group-hover:opacity-100 transition hover:text-red-400 hover:bg-red-50 flex-shrink-0">
            <X style={{ width: 11, height: 11 }} />
          </button>
        </div>
      ))}
      {(block.stats || []).length < 4 && (
        <Button variant="outline" size="sm" className="w-full h-8 text-[12px] gap-1.5"
          onClick={() => set('stats', [...(block.stats || []), { value: '', label: '' }])}>
          <Plus style={{ width: 12, height: 12 }} /> Adicionar
        </Button>
      )}
      <SpacingRadiusControls block={block} onChange={onChange} />
    </div>
  );

  if (block.type === 'testimonial') return (
    <div className="space-y-3">
      <ThemePicker />
      <div><FL>Citação</FL><Textarea value={block.quote || ''} onChange={e => set('quote', e.target.value)} rows={3} placeholder="O sistema transformou nossa gestão…" className="resize-none text-[13px]" /></div>
      <div className="grid grid-cols-2 gap-2">
        <div><FL>Autor</FL><Input value={block.author || ''} onChange={e => set('author', e.target.value)} placeholder="João Silva" className="h-9" /></div>
        <div><FL>Cargo</FL><Input value={block.role || ''} onChange={e => set('role', e.target.value)} placeholder="CEO, Rede Farma" className="h-9" /></div>
      </div>
      <SpacingRadiusControls block={block} onChange={onChange} />
    </div>
  );

  if (block.type === 'faq') return (
    <div className="space-y-3">
      <ThemePicker />
      <div><FL>Título</FL><Input value={block.title || ''} onChange={e => set('title', e.target.value)} placeholder="Perguntas Frequentes" className="h-9" /></div>
      {(block.faq || []).map((item, i) => (
        <div key={i} className="p-3 rounded-xl bg-[#f5f5f7] space-y-2 group">
          <div className="flex items-center gap-2">
            <Input value={item.question} placeholder="Pergunta…" className="h-8 text-[13px] bg-white flex-1"
              onChange={e => { const a = [...(block.faq || [])]; a[i] = { ...a[i], question: e.target.value }; set('faq', a); }} />
            <button onClick={() => set('faq', (block.faq || []).filter((_, j) => j !== i))}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-[#c7c7cc] opacity-0 group-hover:opacity-100 transition hover:text-red-400 hover:bg-red-50 flex-shrink-0">
              <X style={{ width: 11, height: 11 }} />
            </button>
          </div>
          <Textarea value={item.answer} placeholder="Resposta…" rows={2} className="resize-none text-[13px] bg-white"
            onChange={e => { const a = [...(block.faq || [])]; a[i] = { ...a[i], answer: e.target.value }; set('faq', a); }} />
        </div>
      ))}
      <Button variant="outline" size="sm" className="w-full h-8 text-[12px] gap-1.5"
        onClick={() => set('faq', [...(block.faq || []), { question: '', answer: '' }])}>
        <Plus style={{ width: 12, height: 12 }} /> Adicionar pergunta
      </Button>
      <SpacingRadiusControls block={block} onChange={onChange} />
    </div>
  );

  if (block.type === 'video') return (
    <div className="space-y-3">
      <ThemePicker />
      <div><FL>Título (opcional)</FL><Input value={block.title || ''} onChange={e => set('title', e.target.value)} placeholder="Veja o sistema em 2 minutos" className="h-9" /></div>
      <div><FL hint="URL completa do YouTube">URL do Vídeo</FL><Input value={block.videoUrl || ''} onChange={e => set('videoUrl', e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="h-9" /></div>
      {block.videoUrl && (() => {
        const m = block.videoUrl!.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
        const id = m ? m[1] : null;
        return id ? (
          <div className="rounded-xl overflow-hidden relative bg-black" style={{ paddingTop: '56.25%' }}>
            <iframe className="absolute inset-0 w-full h-full" src={`https://www.youtube.com/embed/${id}?rel=0`} title="preview" allowFullScreen />
          </div>
        ) : <p className="text-[12px] text-red-500">URL inválida.</p>;
      })()}
      <SpacingRadiusControls block={block} onChange={onChange} />
    </div>
  );

  if (block.type === 'cta') return (
    <div className="space-y-3">
      <ThemePicker />
      <div><FL>Título</FL><Input value={block.title || ''} onChange={e => set('title', e.target.value)} placeholder="Pronto para transformar seu negócio?" className="h-9" /></div>
      <div><FL>Descrição</FL><Textarea value={block.description || ''} onChange={e => set('description', e.target.value)} rows={2} placeholder="Fale com nossos especialistas…" className="resize-none text-[13px]" /></div>
      <div className="grid grid-cols-2 gap-2">
        <div><FL>Botão principal</FL><Input value={block.ctaLabel || ''} onChange={e => set('ctaLabel', e.target.value)} placeholder="Falar com Especialista" className="h-9" /></div>
        <div><FL>Link</FL><Input value={block.ctaLink || ''} onChange={e => set('ctaLink', e.target.value)} placeholder="/cliente" className="h-9" /></div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div><FL>Botão secundário</FL><Input value={block.secondaryLabel || ''} onChange={e => set('secondaryLabel', e.target.value)} placeholder="Ver soluções" className="h-9" /></div>
        <div><FL>Link secundário</FL><Input value={block.secondaryLink || ''} onChange={e => set('secondaryLink', e.target.value)} placeholder="/solucoes" className="h-9" /></div>
      </div>
      <SpacingRadiusControls block={block} onChange={onChange} />
    </div>
  );

  if (block.type === 'text') return (
    <div className="space-y-3">
      <ThemePicker />
      <div><FL>Título (opcional)</FL><Input value={block.title || ''} onChange={e => set('title', e.target.value)} placeholder="Título do bloco" className="h-9" /></div>
      <div><FL>Texto</FL><Textarea value={block.description || ''} onChange={e => set('description', e.target.value)} rows={5} placeholder="Seu texto aqui…" className="resize-none text-[13px]" /></div>
      <SpacingRadiusControls block={block} onChange={onChange} />
    </div>
  );

  if (block.type === 'richtext') return (
    <div className="space-y-3">
      <ThemePicker />
      <div>
        <FL hint="HTML puro — <b>, <ul>, <a href=...>, <h2>, etc.">Conteúdo HTML</FL>
        <Textarea value={block.html || ''} onChange={e => set('html', e.target.value)} rows={8}
          placeholder="<h2>Título</h2><p>Parágrafo...</p>"
          className="resize-none text-[12px] font-mono" />
      </div>
      {block.html && (
        <div>
          <p className="text-[10px] font-bold text-[#98989d] uppercase tracking-wider mb-1">Preview</p>
          <div className="p-3 rounded-xl border text-[13px]" style={{ borderColor: 'rgba(0,0,0,.07)', background: '#fafafa' }}
            dangerouslySetInnerHTML={{ __html: block.html }} />
        </div>
      )}
      <SpacingRadiusControls block={block} onChange={onChange} />
    </div>
  );

  if (block.type === 'image') return (
    <div className="space-y-3">
      <ThemePicker />
      <div><FL hint="URL da imagem">URL da Imagem</FL><Input value={block.imageUrl || ''} onChange={e => set('imageUrl', e.target.value)} placeholder="https://..." className="h-9" /></div>
      <div><FL>Texto alternativo</FL><Input value={block.imageAlt || ''} onChange={e => set('imageAlt', e.target.value)} placeholder="Descrição da imagem" className="h-9" /></div>
      {block.imageUrl && <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'rgba(0,0,0,.07)' }}><img src={block.imageUrl} alt={block.imageAlt || ''} className="w-full max-h-48 object-cover" /></div>}
      <SpacingRadiusControls block={block} onChange={onChange} />
    </div>
  );


  // ── Image + Text ──────────────────────────────────────────────────────────
  if (block.type === 'image_text') {
    const [uploading, setUploading] = useState(false);
    const token = localStorage.getItem('token');

    const uploadImgAt = async (i: number, file: File) => {
      setUploading(true);
      try {
        const fd = new FormData(); fd.append('image', file);
        const res = await fetch(`${API_URL}/admin/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
        if (!res.ok) throw new Error('Upload falhou');
        const { url } = await res.json();
        const imgs = block.images && block.images.length > 0 ? [...block.images] : block.imageUrl ? [{ url: block.imageUrl, alt: block.imageAlt || '' }] : [];
        imgs[i] = { ...imgs[i], url };
        onChange({ ...block, images: imgs, imageUrl: imgs[0]?.url || '', imageAlt: imgs[0]?.alt || '' });
      } finally { setUploading(false); }
    };

    const hasBg = block.imageHasBg !== false;
    const bgColor = block.imageBgColor || '#e0f2fe';
    const contain = block.imageContain !== false;
    const maxH = block.imageMaxHeight || 500;

    const imgs: { url: string; alt: string }[] = block.images && block.images.length > 0
      ? block.images
      : block.imageUrl ? [{ url: block.imageUrl, alt: block.imageAlt || '' }] : [];

    const setImgs = (next: { url: string; alt: string }[]) =>
      onChange({ ...block, images: next, imageUrl: next[0]?.url || '', imageAlt: next[0]?.alt || '' });

    return (
      <div className="space-y-4">

        <SectionDivider label="Posição da Imagem" />
        <div className="grid grid-cols-2 gap-2">
          {[
            { v: 'right', label: 'Texto | Imagem', icon: '▤' },
            { v: 'left', label: 'Imagem | Texto', icon: '▧' },
          ].map(o => {
            const sel = (block.imagePosition || 'right') === o.v;
            return (
              <button key={o.v} onClick={() => set('imagePosition', o.v as 'left' | 'right')}
                className="flex items-center gap-2 p-3 rounded-xl border-2 transition"
                style={{ borderColor: sel ? '#f97316' : 'rgba(0,0,0,.08)', background: sel ? '#fff7ed' : '#fafafa' }}>
                <span className="text-lg">{o.icon}</span>
                <p className="text-[11px] font-bold" style={{ color: sel ? '#f97316' : '#1d1d1f' }}>{o.label}</p>
                {sel && <span className="ml-auto text-[10px] font-bold" style={{ color: '#f97316' }}>✓</span>}
              </button>
            );
          })}
        </div>

        <SectionDivider label="Fundo da Imagem" />
        <button
          onClick={() => set('imageHasBg', !hasBg)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 transition text-left"
          style={{ borderColor: hasBg ? '#f97316' : 'rgba(0,0,0,.08)', background: hasBg ? '#fff7ed' : '#fafafa' }}>
          <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border-2 transition"
            style={{ borderColor: hasBg ? '#f97316' : 'rgba(0,0,0,.2)', background: hasBg ? '#f97316' : 'transparent' }}>
            {hasBg && <span className="text-white text-[9px] font-black">✓</span>}
          </div>
          <div>
            <p className="text-[12px] font-bold" style={{ color: hasBg ? '#f97316' : '#1d1d1f' }}>Mostrar fundo colorido</p>
            <p className="text-[10px]" style={{ color: '#98989d' }}>Adiciona cor de fundo atrás da imagem</p>
          </div>
        </button>

        {hasBg && (
          <div>
            <FL hint="Cor de fundo do lado da imagem">Cor do fundo</FL>
            <div className="flex items-center gap-2">
              <input type="color" value={bgColor} onChange={e => set('imageBgColor', e.target.value)}
                className="w-10 h-10 rounded-xl border-2 cursor-pointer flex-shrink-0"
                style={{ borderColor: 'rgba(0,0,0,.1)', padding: 2 }} />
              <Input value={bgColor} onChange={e => set('imageBgColor', e.target.value)}
                placeholder="#e0f2fe" className="h-9 font-mono text-[13px]" />
              <div className="flex gap-1.5 flex-shrink-0">
                {['#e0f2fe', '#f0fdf4', '#fef3c7', '#fce7f3', '#ede9fe', '#f1f5f9'].map(c => (
                  <button key={c} onClick={() => set('imageBgColor', c)}
                    className="w-6 h-6 rounded-lg border-2 transition"
                    style={{ background: c, borderColor: bgColor === c ? '#1d1d1f' : 'rgba(0,0,0,.1)' }} />
                ))}
              </div>
            </div>
          </div>
        )}

        <SectionDivider label="Tamanho e Ajuste" />
        <div>
          <FL hint="Altura máxima do bloco em pixels (recomendado: 480–560px)">Altura máxima do bloco</FL>
          <div className="flex items-center gap-2">
            <input type="range" min={300} max={800} step={20} value={maxH}
              onChange={e => set('imageMaxHeight', Number(e.target.value))}
              className="flex-1" />
            <span className="text-[13px] font-bold w-16 text-right" style={{ color: '#1d1d1f' }}>{maxH}px</span>
          </div>
          <div className="flex gap-2 mt-1.5">
            {[400, 480, 560, 640].map(v => (
              <button key={v} onClick={() => set('imageMaxHeight', v)}
                className="flex-1 h-7 rounded-lg text-[11px] font-bold border transition"
                style={{ borderColor: maxH === v ? '#f97316' : 'rgba(0,0,0,.1)', background: maxH === v ? '#fff7ed' : '#f5f5f7', color: maxH === v ? '#f97316' : '#6e6e73' }}>
                {v}
              </button>
            ))}
          </div>
        </div>

        <div>
          <FL hint="Como a imagem se ajusta ao espaço">Ajuste da imagem</FL>
          <div className="grid grid-cols-2 gap-2">
            {[
              { v: true, label: 'Imagem inteira (contain)', desc: 'Mostra a imagem completa' },
              { v: false, label: 'Preencher (cover)', desc: 'Corta para preencher' },
            ].map(o => {
              const sel = contain === o.v;
              return (
                <button key={String(o.v)} onClick={() => set('imageContain', o.v)}
                  className="text-left p-2.5 rounded-xl border-2 transition"
                  style={{ borderColor: sel ? '#f97316' : 'rgba(0,0,0,.08)', background: sel ? '#fff7ed' : '#fafafa' }}>
                  <p className="text-[11px] font-bold leading-tight" style={{ color: sel ? '#f97316' : '#1d1d1f' }}>{sel ? '✓ ' : ''}{o.label}</p>
                  <p className="text-[9px] mt-0.5" style={{ color: '#98989d' }}>{o.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        <SectionDivider label="Conteúdo" />
        <div><FL hint="Pílula/badge acima do título">Badge (opcional)</FL><Input value={block.badge || ''} onChange={e => set('badge', e.target.value)} placeholder="Ex: Recursos →" className="h-9" /></div>
        <div><FL>Título *</FL><Input value={block.title || ''} onChange={e => set('title', e.target.value)} placeholder="Ex: Automatize o seu delivery" className="h-9" /></div>
        <div><FL hint="Texto destacado com fundo colorido abaixo do título">Descrição</FL>
          <Textarea value={block.description || ''} onChange={e => set('description', e.target.value)} rows={3} placeholder="Veja como automatizar o WhatsApp do seu delivery pode melhorar seus resultados." className="resize-none text-[13px]" />
        </div>
        <div><FL hint="Lista de tópicos com check (opcional)">Tópicos</FL>
          <TagList items={block.items || []} onChange={v => set('items', v)} placeholder="Ex: Controle em tempo real" /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><FL>Botão principal</FL><Input value={block.ctaLabel || ''} onChange={e => set('ctaLabel', e.target.value)} placeholder="Conheça os planos" className="h-9" /></div>
          <div><FL>Link</FL><Input value={block.ctaLink || ''} onChange={e => set('ctaLink', e.target.value)} placeholder="/cliente" className="h-9" /></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div><FL>Botão secundário</FL><Input value={block.secondaryLabel || ''} onChange={e => set('secondaryLabel', e.target.value)} placeholder="Ver mais" className="h-9" /></div>
          <div><FL>Link secundário</FL><Input value={block.secondaryLink || ''} onChange={e => set('secondaryLink', e.target.value)} placeholder="/solucoes" className="h-9" /></div>
        </div>

        <SectionDivider label="Imagem" />
        <div className="space-y-3">
          {imgs.map((img, i) => (
            <div key={i} className="border rounded-xl p-3 space-y-2" style={{ borderColor: 'rgba(0,0,0,.09)', background: '#fafafa' }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-[#6e6e73] uppercase tracking-wide">Imagem {i + 1}</span>
                {imgs.length > 1 && (
                  <button onClick={() => setImgs(imgs.filter((_, idx) => idx !== i))} className="w-6 h-6 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 transition">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <ImageUploadField
                value={img.url}
                onChange={url => { const n = imgs.map((m, idx) => idx === i ? { ...m, url } : m); setImgs(n); }}
                onUpload={file => uploadImgAt(i, file)}
                uploading={uploading}
                spec={{ dimensions: '800×600 px — imagem aparece com contain, mostrando inteira', formats: 'JPG, PNG, WEBP', maxSize: '2 MB', where: `Imagem ${i + 1}` }}
                height={100}
              />
              <Input value={img.alt} onChange={e => { const n = imgs.map((m, idx) => idx === i ? { ...m, alt: e.target.value } : m); setImgs(n); }} placeholder="Texto alternativo" className="h-8 text-[12px]" />
            </div>
          ))}
          <button onClick={() => setImgs([...imgs, { url: '', alt: '' }])}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed text-[12px] font-bold transition hover:bg-orange-50"
            style={{ borderColor: '#f97316', color: '#f97316' }}>
            <Plus className="w-4 h-4" /> Adicionar imagem
          </button>
        </div>

        <SpacingRadiusControls block={block} onChange={onChange} />
      </div>
    );
  }
  if (block.type === 'divider') {
    const dc = block.dividerColor || '#3b82f6';
    const SHAPE_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f97316', '#ef4444', '#0ea5e9', '#ec4899', '#14b8a6', '#1e293b', '#6366f1'];
    const isShape = ['triangle', 'clouds', 'waves_fill', 'mountains'].includes(block.dividerStyle || '');

    type DivOpt = { value: string; label: string; preview: React.ReactNode };
    const SIMPLE_OPTIONS: DivOpt[] = [
      { value: 'line', label: 'Linha', preview: <div style={{ width: '100%', height: 1, background: 'rgba(0,0,0,.2)', margin: '6px 0' }} /> },
      { value: 'space', label: 'Espaço', preview: <div style={{ width: '100%', height: 8, background: 'repeating-linear-gradient(90deg,rgba(0,0,0,.06) 0,rgba(0,0,0,.06) 4px,transparent 4px,transparent 8px)', borderRadius: 2 }} /> },
      { value: 'dots', label: 'Pontos', preview: <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>{[0, 1, 2].map(i => <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(0,0,0,.25)', display: 'block' }} />)}</div> },
      { value: 'gradient', label: 'Gradiente', preview: <div style={{ width: '100%', height: 2, background: 'linear-gradient(90deg,transparent,rgba(0,0,0,.25),transparent)', margin: '6px 0' }} /> },
      { value: 'dashed', label: 'Tracejado', preview: <div style={{ width: '100%', borderTop: '2px dashed rgba(0,0,0,.2)', margin: '6px 0' }} /> },
      { value: 'double', label: 'Duplo', preview: <div style={{ display: 'flex', flexDirection: 'column', gap: 3, margin: '4px 0' }}><div style={{ height: 1, background: 'rgba(0,0,0,.2)' }} /><div style={{ height: 1, background: 'rgba(0,0,0,.12)' }} /></div> },
      { value: 'wave', label: 'Onda', preview: <svg viewBox="0 0 80 12" height="12" width="80" style={{ display: 'block', margin: '2px auto' }}><path d="M0 6 Q10 0 20 6 Q30 12 40 6 Q50 0 60 6 Q70 12 80 6" fill="none" stroke="rgba(0,0,0,.25)" strokeWidth="1.5" /></svg> },
      { value: 'ornament', label: 'Ornamento', preview: <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}><div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,.18)' }} /><span style={{ fontSize: 10, color: 'rgba(0,0,0,.3)' }}>◆</span><div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,.18)' }} /></div> },
    ];

    const SHAPE_OPTIONS: DivOpt[] = [
      {
        value: 'triangle',
        label: 'Triângulo',
        preview: (
          <svg viewBox="0 0 80 28" height="28" width="80" style={{ display: 'block' }}>
            <polygon points="0,0 80,0 80,28 0,12" fill={dc} />
          </svg>
        ),
      },
      {
        value: 'clouds',
        label: 'Nuvens',
        preview: (
          <svg viewBox="0 0 80 28" height="28" width="80" style={{ display: 'block' }}>
            <path d="M0 28 Q5 10 12 18 Q18 6 26 18 Q32 4 40 18 Q46 6 54 18 Q60 8 68 18 Q74 10 80 14 L80 28 Z" fill={dc} />
          </svg>
        ),
      },
      {
        value: 'waves_fill',
        label: 'Ondas',
        preview: (
          <svg viewBox="0 0 80 28" height="28" width="80" style={{ display: 'block' }}>
            <path d="M0 18 Q10 8 20 18 Q30 28 40 18 Q50 8 60 18 Q70 28 80 18 L80 28 L0 28 Z" fill={dc} opacity="0.5" />
            <path d="M0 22 Q10 14 20 22 Q30 30 40 22 Q50 14 60 22 Q70 30 80 22 L80 28 L0 28 Z" fill={dc} />
          </svg>
        ),
      },
      {
        value: 'mountains',
        label: 'Montanhas',
        preview: (
          <svg viewBox="0 0 80 28" height="28" width="80" style={{ display: 'block' }}>
            <polygon points="0,28 20,8 40,22 60,4 80,18 80,28" fill={dc} />
          </svg>
        ),
      },
    ];

    return (
      <div className="space-y-3">
        <div>
          <FL>Simples</FL>
          <div className="grid grid-cols-2 gap-1.5">
            {SIMPLE_OPTIONS.map(opt => {
              const active = (block.dividerStyle || 'line') === opt.value;
              return (
                <button key={opt.value} onClick={() => set('dividerStyle', opt.value as PageBlock['dividerStyle'])}
                  className="rounded-xl border-2 transition px-2 py-1.5"
                  style={{ borderColor: active ? '#f97316' : 'rgba(0,0,0,.08)', background: active ? '#fff7ed' : '#f5f5f7' }}>
                  <div style={{ pointerEvents: 'none' }}>{opt.preview}</div>
                  <div className="text-[10px] font-bold mt-1 text-center" style={{ color: active ? '#f97316' : '#6e6e73' }}>{opt.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <FL>Decorativos (com cor)</FL>
          <div className="grid grid-cols-2 gap-1.5">
            {SHAPE_OPTIONS.map(opt => {
              const active = block.dividerStyle === opt.value;
              return (
                <button key={opt.value} onClick={() => set('dividerStyle', opt.value as PageBlock['dividerStyle'])}
                  className="rounded-xl border-2 transition px-2 py-1.5 overflow-hidden"
                  style={{ borderColor: active ? '#f97316' : 'rgba(0,0,0,.08)', background: active ? '#fff7ed' : '#f5f5f7' }}>
                  <div style={{ pointerEvents: 'none', borderRadius: 6, overflow: 'hidden', background: '#e5e7eb' }}>{opt.preview}</div>
                  <div className="text-[10px] font-bold mt-1 text-center" style={{ color: active ? '#f97316' : '#6e6e73' }}>{opt.label}</div>
                </button>
              );
            })}
          </div>
        </div>

        {isShape && (
          <div>
            <FL>Cor do divisor</FL>
            <div className="flex flex-wrap gap-1.5">
              {SHAPE_COLORS.map(c => (
                <button key={c} onClick={() => set('dividerColor', c)}
                  className="w-7 h-7 rounded-lg border-2 transition"
                  style={{ background: c, borderColor: dc === c ? '#f97316' : 'transparent', boxShadow: dc === c ? '0 0 0 2px #fff,0 0 0 4px #f97316' : 'none' }} />
              ))}
              <label className="w-7 h-7 rounded-lg border-2 overflow-hidden cursor-pointer" style={{ borderColor: 'rgba(0,0,0,.1)' }}
                title="Cor personalizada">
                <input type="color" value={dc} onChange={e => set('dividerColor', e.target.value)}
                  className="w-full h-full opacity-0 cursor-pointer" style={{ marginTop: -4 }} />
                <div className="w-full h-full flex items-center justify-center text-[14px]" style={{ marginTop: -28 }}>🎨</div>
              </label>
            </div>
          </div>
        )}
      </div>
    );
  }

  return <p className="text-[12px] text-[#98989d]">Sem editor para este tipo.</p>;
}

// ── Block card ────────────────────────────────────────────────────────────────

function BlockCard({ block, index, total, onChange, onRemove, onMoveUp, onMoveDown, onDuplicate }: {
  block: PageBlock; index: number; total: number;
  onChange: (b: PageBlock) => void; onRemove: () => void; onMoveUp: () => void; onMoveDown: () => void; onDuplicate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const def = BLOCK_CATALOG.find(d => d.type === block.type);
  const summary = block.title || (block.quote || '').slice(0, 40) || (block.alertText || '').slice(0, 40) || (block.html || '').slice(0, 40) || '';

  const heroColors: Record<string, string> = { centered: '#6366f1', split: '#22c55e', dark_glow: '#0a0a0c', magazine: '#1e293b' };
  const blockColor = block.type === 'hero' ? (heroColors[block.heroLayout || 'centered'] || '#f97316') : '#f97316';

  // Badge de variante para features/benefits
  const variantLabel =
    block.type === 'features' ? (({ split_dark: 'Split Dark', dark_cards: 'Dark Cards', half_split: 'Half & Half', grid: 'Grid c/ Ícone', highlight_list: 'Lista Numerada', minimal_pills: 'Pílulas', checklist: 'Checklist', cards_hover: 'Cards Hover', community_connect: 'Community Connect', bento: 'Bento', dark_numbered: 'Numerado Dark' } as Record<string, string>)[block.featuresLayout || 'split_dark'] || 'Split Dark') :
      block.type === 'benefits' && block.benefitsLayout ? { grid_cards: 'Grid', side_image: 'c/ Imagem', carousel: 'Carrossel' }[block.benefitsLayout] :
        block.type === 'hero' && block.heroLayout ? HERO_LAYOUTS.find(l => l.id === block.heroLayout)?.label : null;

  // Badge de espaçamento
  const spacingLabel = block.blockSpacing && block.blockSpacing !== 'normal'
    ? { compact: '↕ Compacto', spacious: '↕ Generoso' }[block.blockSpacing] : null;

  return (
    <div className="rounded-2xl border overflow-hidden transition-all"
      style={{ borderColor: expanded ? `${blockColor}25` : 'rgba(0,0,0,.08)', opacity: block.visible ? 1 : 0.5, boxShadow: expanded ? `0 4px 20px ${blockColor}10` : 'none' }}>

      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-white">
        <GripVertical style={{ width: 14, height: 14, color: '#c7c7cc', flexShrink: 0 }} />
        <button className="flex items-center gap-2.5 flex-1 min-w-0 text-left" onClick={() => setExpanded(v => !v)}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-base leading-none"
            style={{ background: `${blockColor}14` }}>
            <span style={{ fontSize: 14 }}>{def?.emoji || '📦'}</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="text-[13px] font-semibold text-[#1d1d1f] leading-none">{def?.label || block.type}</p>
              {variantLabel && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: `${blockColor}15`, color: blockColor }}>
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
          <button disabled={index === 0} onClick={onMoveUp} className="w-6 h-6 rounded-lg flex items-center justify-center text-[#c7c7cc] disabled:opacity-25 hover:text-[#6e6e73] hover:bg-[#f5f5f7] transition" title="Mover para cima"><ChevronUp style={{ width: 13, height: 13 }} /></button>
          <button disabled={index === total - 1} onClick={onMoveDown} className="w-6 h-6 rounded-lg flex items-center justify-center text-[#c7c7cc] disabled:opacity-25 hover:text-[#6e6e73] hover:bg-[#f5f5f7] transition" title="Mover para baixo"><ChevronDown style={{ width: 13, height: 13 }} /></button>
          <button onClick={() => onChange({ ...block, visible: !block.visible })} className="w-6 h-6 rounded-lg flex items-center justify-center transition hover:bg-[#f5f5f7]" style={{ color: block.visible ? '#34c759' : '#c7c7cc' }} title={block.visible ? 'Ocultar bloco' : 'Mostrar bloco'}>
            {block.visible ? <Eye style={{ width: 13, height: 13 }} /> : <EyeOff style={{ width: 13, height: 13 }} />}
          </button>
          <button onClick={onDuplicate} className="w-6 h-6 rounded-lg flex items-center justify-center text-[#c7c7cc] hover:text-blue-400 hover:bg-blue-50 transition" title="Duplicar bloco">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="8" y="8" width="13" height="13" rx="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
            </svg>
          </button>
          <button onClick={() => { if (window.confirm('Excluir este bloco?')) onRemove(); }} className="w-6 h-6 rounded-lg flex items-center justify-center text-[#c7c7cc] hover:text-red-400 hover:bg-red-50 transition" title="Excluir bloco"><X style={{ width: 13, height: 13 }} /></button>
        </div>
      </div>

      {/* Expanded editor */}
      {expanded && (
        <div className="border-t px-4 py-4 bg-[#fafafa]" style={{ borderColor: 'rgba(0,0,0,.06)' }}>
          <BlockEditor block={block} onChange={onChange} />
        </div>
      )}
    </div>
  );
}

// ── Block picker modal ────────────────────────────────────────────────────────

function BlockPicker({ onAdd, onClose }: { onAdd: (type: BlockType) => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(0,0,0,.07)' }}>
          <div>
            <p className="font-bold text-[15px] text-[#1d1d1f]" style={{ fontFamily: "'Outfit',sans-serif" }}>Adicionar bloco</p>
            <p className="text-[11px] text-[#98989d]">Escolha o tipo de seção</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-[#f5f5f7] transition" style={{ color: '#6e6e73' }}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>
        <div className="p-4 grid grid-cols-2 gap-2 max-h-[65vh] overflow-y-auto">
          {BLOCK_CATALOG.map(def => (
            <button key={def.type} onClick={() => { onAdd(def.type); onClose(); }}
              className="flex items-start gap-3 p-3 rounded-2xl border text-left transition hover:border-[#f97316] hover:bg-orange-50 group"
              style={{ borderColor: 'rgba(0,0,0,.08)' }}>
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
  const [showPicker, setShowPicker] = useState<number | null>(null);
  const [history, setHistory] = useState<PageBlock[][]>([]);
  const [future, setFuture] = useState<PageBlock[][]>([]);

  // Wrap onChange to track history
  const applyChange = (newBlocks: PageBlock[]) => {
    setHistory(h => [...h.slice(-20), blocks]);
    setFuture([]);
    onChange(newBlocks);
  };

  const undo = () => {
    if (!history.length) return;
    const prev = history[history.length - 1];
    setHistory(h => h.slice(0, -1));
    setFuture(f => [blocks, ...f]);
    onChange(prev);
  };

  const redo = () => {
    if (!future.length) return;
    const next = future[0];
    setFuture(f => f.slice(1));
    setHistory(h => [...h, blocks]);
    onChange(next);
  };

  // Keyboard shortcuts: Ctrl+Z / Ctrl+Y
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [history, future, blocks]);

  const insertAt = (type: BlockType, afterIndex: number) => {
    const newBlock = makeBlock(type);
    if (afterIndex === -1) {
      applyChange([...blocks, newBlock]);
    } else {
      const n = [...blocks];
      n.splice(afterIndex + 1, 0, newBlock);
      applyChange(n);
    }
  };
  const upd = (i: number, b: PageBlock) => { const n = [...blocks]; n[i] = b; applyChange(n); };
  const rem = (i: number) => applyChange(blocks.filter((_, j) => j !== i));
  const mov = (i: number, d: -1 | 1) => { const n = [...blocks]; const t = i + d; if (t < 0 || t >= n.length) return;[n[i], n[t]] = [n[t], n[i]]; applyChange(n); };
  const dup = (i: number) => {
    const clone = { ...JSON.parse(JSON.stringify(blocks[i])), id: `block-${Date.now()}-${Math.random().toString(36).slice(2)}` };
    const n = [...blocks];
    n.splice(i + 1, 0, clone);
    applyChange(n);
  };

  const exportJSON = () => {
    const json = JSON.stringify(blocks, null, 2);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    a.download = `blocks-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          if (window.confirm(`Importar ${parsed.length} blocos? Isso substituirá os blocos atuais.`)) {
            applyChange(parsed);
          }
        } else {
          alert('Arquivo JSON inválido — esperado um array de blocos.');
        }
      } catch {
        alert('Erro ao ler o arquivo JSON.');
      }
    };
    input.click();
  };

  // Quick-add image_text block at a position without opening picker
  const quickAddImageText = (afterIndex: number) => {
    const n = [...blocks];
    n.splice(afterIndex + 1, 0, makeBlock('image_text'));
    applyChange(n);
  };

  return (
    <div className="space-y-2">
      {/* Toolbar: undo/redo + export/import */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={undo} disabled={!history.length}
          title="Desfazer (Ctrl+Z)"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border transition disabled:opacity-30"
          style={{ background: '#fff', borderColor: '#e5e7eb', color: '#374151' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 14L4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 010 11H11" /></svg>
          Desfazer
        </button>
        <button
          onClick={redo} disabled={!future.length}
          title="Refazer (Ctrl+Y)"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border transition disabled:opacity-30"
          style={{ background: '#fff', borderColor: '#e5e7eb', color: '#374151' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 14l5-5-5-5" /><path d="M20 9H9.5a5.5 5.5 0 000 11H13" /></svg>
          Refazer
        </button>
        <div className="flex-1" />
        <button
          onClick={importJSON}
          title="Importar blocos de JSON"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border transition"
          style={{ background: '#fff', borderColor: '#e5e7eb', color: '#374151' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
          Importar
        </button>
        <button
          onClick={exportJSON} disabled={!blocks.length}
          title="Exportar blocos como JSON"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold rounded-lg border transition disabled:opacity-30"
          style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
          Exportar
        </button>
      </div>
      {blocks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 rounded-2xl border-2 border-dashed text-center" style={{ borderColor: 'rgba(0,0,0,.08)' }}>
          <Layers style={{ width: 36, height: 36, color: '#c7c7cc', marginBottom: 10 }} />
          <p className="text-[13px] font-medium text-[#6e6e73]">Nenhum bloco ainda</p>
          <p className="text-[12px] text-[#98989d] mb-4">Adicione blocos para montar a página</p>
          <Button variant="outline" size="sm" className="gap-1.5 text-[12px]" onClick={() => setShowPicker(-1)}>
            <Plus style={{ width: 13, height: 13 }} /> Adicionar primeiro bloco
          </Button>
        </div>
      )}
      {blocks.map((block, i) => (
        <React.Fragment key={block.id}>
          <BlockCard block={block} index={i} total={blocks.length}
            onChange={b => upd(i, b)} onRemove={() => rem(i)} onMoveUp={() => mov(i, -1)} onMoveDown={() => mov(i, 1)} onDuplicate={() => dup(i)} />
          {/* Between-block inserter */}
          <div className="flex items-center gap-2 px-1 group/inserter" style={{ height: 28 }}>
            <div className="flex-1 h-px transition-all" style={{ background: 'rgba(0,0,0,.06)' }} />
            <button
              title="Adicionar Imagem + Texto aqui"
              onClick={() => quickAddImageText(i)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold opacity-0 group-hover/inserter:opacity-100 transition-all hover:scale-105"
              style={{ background: '#fff7ed', color: '#f97316', border: '1.5px dashed #f97316' }}>
              <Plus style={{ width: 11, height: 11 }} /> Imagem + Texto
            </button>
            <button
              title="Adicionar outro tipo de bloco aqui"
              onClick={() => setShowPicker(i)}
              className="w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover/inserter:opacity-100 transition-all hover:scale-110"
              style={{ background: '#f5f5f7', color: '#6e6e73', border: '1.5px dashed rgba(0,0,0,.15)' }}>
              <Plus style={{ width: 11, height: 11 }} />
            </button>
            <div className="flex-1 h-px transition-all" style={{ background: 'rgba(0,0,0,.06)' }} />
          </div>
        </React.Fragment>
      ))}
      {blocks.length > 0 && (
        <Button variant="outline" className="w-full h-10 gap-2 text-[13px] font-medium rounded-2xl border-dashed" onClick={() => setShowPicker(-1)}>
          <Plus style={{ width: 14, height: 14 }} /> Adicionar bloco
        </Button>
      )}
      {showPicker !== null && <BlockPicker onAdd={(type) => insertAt(type, showPicker)} onClose={() => setShowPicker(null)} />}
    </div>
  );
}