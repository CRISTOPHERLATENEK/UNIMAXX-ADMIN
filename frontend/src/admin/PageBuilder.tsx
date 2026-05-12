import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BlockRenderer, DEFAULT_T } from '@/pages/BlockRenderer';
import {
  Plus, X, Upload, ChevronUp, ChevronDown, Eye, EyeOff,
  GripVertical, Layers,
  AlignCenter, AlignLeft, LayoutGrid, List, Rows,
  Maximize2, Minimize2, Square, Search, Sparkles, Zap,
  Type, Image as ImageIcon, MessageSquare, HelpCircle,
  Play, CreditCard, MousePointer2, Smartphone, Settings,
  Code, Palette, Box, Copy, Trash2, MoveUp, MoveDown,
  ChevronRight, MoreHorizontal, Monitor, Tablet, Smartphone as MobileIcon,
  Undo2, Redo2, Bookmark, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ImageUploadField } from '@/components/ImageUploadField';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import type { PageBlock, BlockType, FeaturesLayout, BenefitsLayout, BlockSpacing, BlockRadius, ContinuousBgMode, ContinuousBgType, SectionShape } from '@/types';

export type { PageBlock, BlockType };

// Tema de página — override local de cores/fontes por página
export interface PageTheme {
  primaryColor?: string;
  fontHeading?: string;
  fontBody?: string;
  customCss?: string;
}

export const DEFAULT_THEME: PageTheme = {
  primaryColor: '',
  fontHeading: '',
  fontBody: '',
  customCss: '',
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const BASE_URL = API_URL.replace(/\/api\/?$/, '');

const BLOCK_CATALOG = [
  { type: 'hero' as BlockType, label: 'Hero — Banner Principal', description: 'Imagem de fundo, título e botão', emoji: '🌟', color: 'bg-orange-500', icon: LayoutGrid },
  { type: 'features' as BlockType, label: 'Grid de Cards', description: 'Recursos em colunas com ícone', emoji: '✅', color: 'bg-blue-500', icon: List },
  { type: 'benefits' as BlockType, label: 'Lista com Ícones', description: 'Benefícios em linha com ícone', emoji: '⚡', color: 'bg-yellow-500', icon: Zap },
  { type: 'steps' as BlockType, label: 'Passos Numerados', description: 'Fluxo em sequência vertical', emoji: '🔢', color: 'bg-indigo-500', icon: Rows },
  { type: 'stats' as BlockType, label: 'Contador em Destaque', description: 'Números grandes centralizados', emoji: '📊', color: 'bg-emerald-500', icon: Box },
  { type: 'testimonial' as BlockType, label: 'Citação com Avatar', description: 'Foto, nome e texto do cliente', emoji: '💬', color: 'bg-pink-500', icon: MessageSquare },
  { type: 'faq' as BlockType, label: 'Acordeão de Perguntas', description: 'Itens expansíveis com resposta', emoji: '❓', color: 'bg-amber-500', icon: HelpCircle },
  { type: 'video' as BlockType, label: 'Player Incorporado', description: 'YouTube ou Vimeo embutido', emoji: '▶️', color: 'bg-red-500', icon: Play },
  { type: 'cta' as BlockType, label: 'Faixa de Chamada', description: 'Fundo colorido com botão', emoji: '📣', color: 'bg-purple-500', icon: MousePointer2 },
  { type: 'text' as BlockType, label: 'Título + Parágrafo', description: 'Bloco de texto centralizado', emoji: '📝', color: 'bg-slate-500', icon: Type },
  { type: 'richtext' as BlockType, label: 'Editor Livre', description: 'HTML com formatação completa', emoji: '🖊️', color: 'bg-cyan-500', icon: Code },
  { type: 'image' as BlockType, label: 'Imagem', description: 'Imagem com legenda', emoji: '🖼️', color: 'bg-green-500', icon: ImageIcon },
  { type: 'integrations' as BlockType, label: 'Grid de Logos', description: 'Badges de sistemas integrados', emoji: '🔌', color: 'bg-zinc-500', icon: Settings },
  { type: 'image_text' as BlockType, label: 'Coluna Misto', description: 'Imagem ao lado de texto', emoji: '🖼️', color: 'bg-teal-500', icon: ImageIcon },
  { type: 'divider' as BlockType, label: 'Linha Separadora', description: 'Espaço ou linha entre blocos', emoji: '➖', color: 'bg-gray-400', icon: MinusIcon },
  // ── Novos blocos premium ─────────────────────────────────────────────────
  { type: 'pricing' as BlockType, label: 'Pricing — Planos', description: 'Tabela de planos com toggle Mensal/Anual', emoji: '💰', color: 'bg-emerald-600', icon: Box },
  { type: 'demo_form' as BlockType, label: 'Form de Captura', description: 'Formulário inline pra agendar demo / falar com vendedor', emoji: '📋', color: 'bg-blue-600', icon: MousePointer2 },
  { type: 'team' as BlockType, label: 'Equipe', description: 'Cards de membros com foto, cargo e redes sociais', emoji: '👥', color: 'bg-violet-500', icon: MessageSquare },
  { type: 'tabs' as BlockType, label: 'Abas de Conteúdo', description: 'Painéis tabulados — horizontal ou vertical', emoji: '🗂️', color: 'bg-sky-500', icon: List },
  { type: 'comparison_table' as BlockType, label: 'Tabela Comparativa', description: 'Matriz features × planos / produtos', emoji: '📊', color: 'bg-fuchsia-500', icon: Box },
];

function MinusIcon(props: any) { return <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>; }


const ICON_LIBRARY = [
  '✅', '⚡', '🚀', '🎯', '💡', '🔒', '📊', '🌐', '📱', '💳', '🛒', '🏪', '🚛', '⭐', '🔗',
  '📈', '🤝', '🧩', '💬', '📞', '🎁', '🏆', '🔧', '📝', '👥', '🌟', '💰', '🕐', '🔑', '📋',
  '✨', '🎨', '🔔', '📦', '🏗️', '🤖', '💎', '🌱', '📡', '🔐',
];

const HERO_LAYOUTS = [
  { id: 'centered', label: 'Centralizado', desc: 'Título grande ao centro, gradiente de fundo' },
  { id: 'split', label: 'Dividido', desc: 'Texto à esquerda, imagem à direita' },
  { id: 'dark_glow', label: 'Dark Glow', desc: 'Fundo preto com glow neon da cor do tema' },
  { id: 'magazine', label: 'Magazine', desc: 'Imagem de fundo full-bleed com overlay' },
  { id: 'cinematic', label: 'Cinematic', desc: 'Estilo banner/game — imagem + título à esquerda + botão vídeo' },
  { id: 'oxpay', label: 'Oxpay', desc: 'Fundo escuro premium com orbes de luz e grid sutil' },
];

const BLOCK_COLORS: Record<string, string> = {
  hero: '#6366f1', features: '#f97316', benefits: '#10b981', steps: '#3b82f6',
  stats: '#f59e0b', testimonial: '#8b5cf6', faq: '#ec4899', video: '#ef4444',
  cta: '#f97316', text: '#6b7280', richtext: '#6b7280', image: '#0ea5e9',
  integrations: '#14b8a6', image_text: '#f97316', divider: '#9ca3af',
};


// ── Snippets (blocos salvos) ──────────────────────────────────────────────────

export type Snippet = {
  id: string;
  label: string;
  emoji: string;
  blockType: string;
  block: PageBlock;
  createdAt: number;
};

const SNIPPETS_KEY = 'pb_snippets';

function loadSnippets(): Snippet[] {
  try { return JSON.parse(localStorage.getItem(SNIPPETS_KEY) || '[]'); }
  catch { return []; }
}

function persistSnippets(snips: Snippet[]) {
  try { localStorage.setItem(SNIPPETS_KEY, JSON.stringify(snips)); } catch { }
}

// ── Block factory ─────────────────────────────────────────────────────────────

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
  if (type === 'cta') return { ...b, title: '', description: '', ctaLabel: 'Falar com Especialista', ctaLink: '/cliente', colorTheme: 'brand', ctaLayout: 'centered', badge: '', socialProof: '', ctaBgColor: '#f97316', ctaBtnBg: '#ffffff', ctaBtnText: '#f97316' };
  if (type === 'text') return { ...b, title: '', description: '', colorTheme: 'light' };
  if (type === 'richtext') return { ...b, html: '', colorTheme: 'light' };
  if (type === 'image') return { ...b, imageUrl: '', imageAlt: '', colorTheme: 'light' };
  if (type === 'integrations') return { ...b, title: 'Integrações', items: [], colorTheme: 'light' };
  if (type === 'image_text') return { ...b, title: '', description: '', imageUrl: '', imageAlt: '', imagePosition: 'right', colorTheme: 'dark', blockSpacing: 'normal', blockRadius: 'large' };
  if (type === 'divider') return { ...b, dividerStyle: 'line', colorTheme: 'light' };

  // ── PRICING — 3 planos default já preenchidos pra o usuário não começar do zero
  if (type === 'pricing') return {
    ...b,
    title: 'Planos para todo tamanho de negócio',
    subtitle: 'Comece pequeno. Cresça quando quiser.',
    colorTheme: 'light',
    pricingShowToggle: true,
    pricingAnnualDiscountLabel: 'Economize 20%',
    pricingFootnote: 'Todos os planos incluem 14 dias de teste grátis. Sem cartão de crédito.',
    pricingPlans: [
      { name: 'Starter', description: 'Para começar', priceMonthly: '99', priceAnnual: '79', priceCurrency: 'R$', priceSuffix: '/mês',
        features: ['Até 500 produtos', '1 ponto de venda', 'Suporte por email'], ctaLabel: 'Começar grátis', ctaLink: '/cliente' },
      { name: 'Pro', description: 'Mais escolhido', priceMonthly: '249', priceAnnual: '199', priceCurrency: 'R$', priceSuffix: '/mês',
        features: ['Produtos ilimitados', 'Até 5 pontos de venda', 'Integrações fiscais', 'Suporte prioritário', 'Relatórios avançados'],
        ctaLabel: 'Falar com vendas', ctaLink: '/cliente', highlighted: true, badge: 'Mais popular' },
      { name: 'Enterprise', description: 'Operação completa', priceMonthly: '599', priceAnnual: '499', priceCurrency: 'R$', priceSuffix: '/mês',
        features: ['Tudo do Pro', 'Pontos de venda ilimitados', 'API dedicada', 'Gerente de conta', 'SLA 99.9%'],
        ctaLabel: 'Agendar reunião', ctaLink: '/cliente' },
    ],
  };

  // ── DEMO_FORM — campos mais comuns já configurados
  if (type === 'demo_form') return {
    ...b,
    formTitle: 'Agendar uma demonstração',
    formDescription: 'Veja como o Unimaxx funciona na prática. Sem compromisso.',
    colorTheme: 'light',
    formLayout: 'split',
    formBenefits: ['Demo personalizada para seu segmento', 'Sem compromisso de contratação', 'Resposta em até 1 dia útil'],
    formSubmitLabel: 'Quero ver na prática',
    formSuccessTitle: '✅ Recebemos seu contato!',
    formSuccessMessage: 'Nossa equipe vai te ligar em até 1 dia útil.',
    formApiEndpoint: '/api/leads',
    formFields: [
      { name: 'name', label: 'Nome completo', type: 'text', placeholder: 'Como você se chama?', required: true },
      { name: 'email', label: 'E-mail', type: 'email', placeholder: 'voce@empresa.com.br', required: true },
      { name: 'phone', label: 'WhatsApp', type: 'tel', placeholder: '(00) 00000-0000', required: true },
      { name: 'company', label: 'Empresa', type: 'text', placeholder: 'Nome da sua empresa', required: false },
      { name: 'segment', label: 'Segmento', type: 'select', options: ['Moda', 'Alimentação', 'Varejo Geral', 'E-commerce', 'Outro'], required: false, fullWidth: true },
      { name: 'message', label: 'Como podemos ajudar?', type: 'textarea', placeholder: 'Conte um pouco sobre seu negócio…', required: false, fullWidth: true },
    ],
  };

  // ── TEAM
  if (type === 'team') return {
    ...b,
    title: 'Nossa equipe',
    subtitle: 'Pessoas que fazem o Unimaxx acontecer.',
    colorTheme: 'light',
    teamLayout: 'grid',
    teamColumns: 3,
    teamMembers: [
      { name: 'Nome do Membro', role: 'Cargo · Diretoria', bio: 'Breve descrição da pessoa — anos de experiência, especialidade, etc.', photo: '', linkedin: '', email: '' },
    ],
  };

  // ── TABS
  if (type === 'tabs') return {
    ...b,
    title: 'Para cada tipo de operação',
    subtitle: 'Veja como o Unimaxx se adapta ao seu negócio.',
    colorTheme: 'light',
    tabsOrientation: 'horizontal',
    tabsItems: [
      { label: 'Lojas Físicas', icon: '🏪', title: 'Pra quem vende presencialmente', description: 'Frente de caixa rápida, integração com balança, código de barras e fiscal automático.', bullets: ['PDV em 3 cliques', 'Compatível com qualquer impressora', 'Funciona offline'] },
      { label: 'E-commerce', icon: '🛒', title: 'Pra quem vende online', description: 'Sincronia com seu site, marketplaces e ERP em tempo real.', bullets: ['Integração com Shopify, Nuvemshop, etc', 'Anti-fraude embutido', 'Cálculo de frete automático'] },
      { label: 'Distribuição', icon: '🚛', title: 'Pra operações maiores', description: 'Multi-CD, transferência entre lojas, controle de transportadoras.', bullets: ['Lote de pedidos', 'Roteirização inteligente', 'NF-e em massa'] },
    ],
  };

  // ── COMPARISON_TABLE
  if (type === 'comparison_table') return {
    ...b,
    title: 'Por que escolher o Unimaxx',
    subtitle: 'Compare com soluções alternativas do mercado.',
    colorTheme: 'light',
    comparisonShowCategories: true,
    comparisonColumns: [
      { name: 'Unimaxx', highlighted: true, badge: 'Nossa solução' },
      { name: 'Concorrente A' },
      { name: 'Planilha / Manual' },
    ],
    comparisonRows: [
      { category: 'Funcionalidades', feature: 'PDV integrado com fiscal', values: [true, true, false] },
      { category: 'Funcionalidades', feature: 'Multi-loja em tempo real', values: [true, false, false] },
      { category: 'Funcionalidades', feature: 'Relatórios automáticos', values: [true, 'Limitado', false] },
      { category: 'Suporte', feature: 'Atendimento humano 24/7', values: [true, false, false] },
      { category: 'Suporte', feature: 'Implantação assistida', values: [true, 'Pago à parte', false] },
      { category: 'Custos', feature: 'Sem taxa de setup', values: [true, false, true] },
      { category: 'Custos', feature: 'Atualizações grátis', values: [true, false, '—'] },
    ],
  };

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
  const BASE_URL = API_URL.replace(/\/api\/?$/, '');
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


// ── RichItem type ─────────────────────────────────────────────────────────────

type RichItem = {
  id: string;
  icon: string;
  label: string;
  desc?: string;
  align?: 'left' | 'center' | 'right';
  width?: number;
  paddingH?: number;
  paddingV?: number;
  fontSize?: number;
  descSize?: number;
  iconSize?: number;
  bold?: boolean;
  accentColor?: string;
};

function toRichItems(raw: any[]): RichItem[] {
  return raw.map((r, i) => {
    if (typeof r === 'string') return { id: `item-${i}-${Date.now()}`, icon: '⚡', label: r };
    return { id: r.id || `item-${i}-${Date.now()}`, ...r };
  });
}

// ── Sortable Item wrapper ─────────────────────────────────────────────────────

function SortableRichItem({ item, onUpdate, onRemove, accent }: {
  item: RichItem;
  onUpdate: (updated: RichItem) => void;
  onRemove: () => void;
  accent: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const [open, setOpen] = useState(false);
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  const set = (k: keyof RichItem, v: any) => onUpdate({ ...item, [k]: v });

  const alignBtns: { v: RichItem['align']; icon: string }[] = [
    { v: 'left', icon: '⬅' }, { v: 'center', icon: '↔' }, { v: 'right', icon: '➡' },
  ];

  return (
    <div ref={setNodeRef} style={style}>
      {/* ── Header row ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
        background: open ? '#fff7ed' : '#f5f5f7',
        border: `1.5px solid ${open ? '#f97316' : 'rgba(0,0,0,.08)'}`,
        borderRadius: open ? '12px 12px 0 0' : 12,
        cursor: 'pointer', transition: 'all .15s',
      }}>
        {/* drag handle */}
        <div {...attributes} {...listeners} style={{ cursor: 'grab', color: '#c7c7cc', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="9" cy="6" r="2" /><circle cx="15" cy="6" r="2" />
            <circle cx="9" cy="12" r="2" /><circle cx="15" cy="12" r="2" />
            <circle cx="9" cy="18" r="2" /><circle cx="15" cy="18" r="2" />
          </svg>
        </div>
        <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon || '⚡'}</span>
        <span style={{ flex: 1, fontSize: 12, fontWeight: 600, color: '#1d1d1f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.label || '(sem texto)'}
        </span>
        <button onClick={() => setOpen(o => !o)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: open ? '#f97316' : '#8e8e93', fontSize: 12, padding: '2px 6px', borderRadius: 6, fontWeight: 700 }}>
          {open ? '▲' : '▼'}
        </button>
        <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c7c7cc', display: 'flex', alignItems: 'center' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
          onMouseLeave={e => (e.currentTarget.style.color = '#c7c7cc')}>
          <X style={{ width: 13, height: 13 }} />
        </button>
      </div>

      {/* ── Controls panel ── */}
      {open && (
        <div style={{ background: '#fff', border: '1.5px solid #f97316', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '14px 12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Icon + Label */}
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 8, alignItems: 'start' }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#98989d', marginBottom: 4, textTransform: 'uppercase' }}>Ícone</p>
              <IconPicker value={item.icon || '⚡'} onChange={v => set('icon', v)} />
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#98989d', marginBottom: 4, textTransform: 'uppercase' }}>Título</p>
              <Input value={item.label} onChange={e => set('label', e.target.value)} className="h-8 text-[13px]" placeholder="Texto do item" />
            </div>
          </div>

          {/* Desc */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#98989d', marginBottom: 4, textTransform: 'uppercase' }}>Descrição</p>
            <Input value={item.desc || ''} onChange={e => set('desc', e.target.value)} className="h-8 text-[12px]" placeholder="Texto secundário (opcional)" />
          </div>

          {/* Align + Bold + Accent */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#98989d', marginBottom: 6, textTransform: 'uppercase' }}>Alinhamento</p>
              <div style={{ display: 'flex', gap: 4 }}>
                {alignBtns.map(({ v, icon }) => (
                  <button key={v} onClick={() => set('align', v)} style={{
                    flex: 1, height: 32, borderRadius: 8, border: `1.5px solid ${(item.align || 'left') === v ? '#f97316' : 'rgba(0,0,0,.1)'}`,
                    background: (item.align || 'left') === v ? '#fff7ed' : '#f9f9fb',
                    color: (item.align || 'left') === v ? '#f97316' : '#6e6e73',
                    cursor: 'pointer', fontSize: 14,
                  }}>{icon}</button>
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#98989d', marginBottom: 6, textTransform: 'uppercase' }}>Cor accent</p>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input type="color" value={item.accentColor || accent} onChange={e => set('accentColor', e.target.value)}
                  style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(0,0,0,.1)', cursor: 'pointer', padding: 2 }} />
                <Input value={item.accentColor || accent} onChange={e => set('accentColor', e.target.value)} className="h-8 text-[10px] font-mono" />
              </div>
            </div>
          </div>

          {/* Width slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#98989d', textTransform: 'uppercase' }}>Largura</p>
              <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#f97316', fontWeight: 700 }}>{item.width ?? 100}%</span>
            </div>
            <input type="range" min={25} max={100} step={5} value={item.width ?? 100} onChange={e => set('width', Number(e.target.value))}
              style={{ width: '100%', accentColor: '#f97316' }} />
          </div>

          {/* Padding sliders */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#98989d', textTransform: 'uppercase' }}>Pad. Horizontal</p>
                <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#6e6e73' }}>{item.paddingH ?? 16}px</span>
              </div>
              <input type="range" min={0} max={48} step={2} value={item.paddingH ?? 16} onChange={e => set('paddingH', Number(e.target.value))}
                style={{ width: '100%', accentColor: '#f97316' }} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#98989d', textTransform: 'uppercase' }}>Pad. Vertical</p>
                <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#6e6e73' }}>{item.paddingV ?? 12}px</span>
              </div>
              <input type="range" min={4} max={40} step={2} value={item.paddingV ?? 12} onChange={e => set('paddingV', Number(e.target.value))}
                style={{ width: '100%', accentColor: '#f97316' }} />
            </div>
          </div>

          {/* Font sizes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#98989d', textTransform: 'uppercase' }}>Fonte título</p>
                <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#6e6e73' }}>{item.fontSize ?? 14}px</span>
              </div>
              <input type="range" min={10} max={28} step={1} value={item.fontSize ?? 14} onChange={e => set('fontSize', Number(e.target.value))}
                style={{ width: '100%', accentColor: '#f97316' }} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#98989d', textTransform: 'uppercase' }}>Fonte desc.</p>
                <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#6e6e73' }}>{item.descSize ?? 12}px</span>
              </div>
              <input type="range" min={9} max={20} step={1} value={item.descSize ?? 12} onChange={e => set('descSize', Number(e.target.value))}
                style={{ width: '100%', accentColor: '#f97316' }} />
            </div>
          </div>

          {/* Icon size + Bold */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'end' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#98989d', textTransform: 'uppercase' }}>Tamanho ícone</p>
                <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#6e6e73' }}>{item.iconSize ?? 40}px</span>
              </div>
              <input type="range" min={24} max={72} step={4} value={item.iconSize ?? 40} onChange={e => set('iconSize', Number(e.target.value))}
                style={{ width: '100%', accentColor: '#f97316' }} />
            </div>
            <button onClick={() => set('bold', !item.bold)} style={{
              height: 32, padding: '0 14px', borderRadius: 8,
              border: `1.5px solid ${item.bold ? '#f97316' : 'rgba(0,0,0,.1)'}`,
              background: item.bold ? '#fff7ed' : '#f9f9fb',
              color: item.bold ? '#f97316' : '#6e6e73',
              cursor: 'pointer', fontWeight: 800, fontSize: 12,
            }}>
              Bold
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── RichItemEditor (drag-to-reorder + per-item controls) ──────────────────────

function RichItemEditor({ items, onChange, accent = '#f97316', placeholder = 'Adicionar item…' }: {
  items: any[];
  onChange: (v: RichItem[]) => void;
  accent?: string;
  placeholder?: string;
}) {
  const [richItems, setRichItems] = useState<RichItem[]>(() => toRichItems(items));
  const [draft, setDraft] = useState('');

  // Sync upward
  const update = (updated: RichItem[]) => { setRichItems(updated); onChange(updated); };

  // Sync downward when items prop changes externally.
  // Use JSON.stringify so ALL property changes (desc, align, accentColor, width, padding…)
  // trigger a re-sync, not just length changes (which was the original bug).
  // Compare with current richItems to avoid a feedback loop when the change came from inside.
  const itemsKey = JSON.stringify(items);
  useEffect(() => {
    if (itemsKey !== JSON.stringify(richItems)) {
      setRichItems(toRichItems(items));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsKey]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = richItems.findIndex(i => i.id === active.id);
      const newIndex = richItems.findIndex(i => i.id === over.id);
      update(arrayMove(richItems, oldIndex, newIndex));
    }
  };

  const add = () => {
    const t = draft.trim();
    if (!t) return;
    const newItem: RichItem = { id: `item-${Date.now()}`, icon: '⚡', label: t };
    update([...richItems, newItem]);
    setDraft('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={richItems.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {richItems.map((item) => (
            <SortableRichItem
              key={item.id}
              item={item}
              accent={accent}
              onUpdate={(updated) => update(richItems.map(i => i.id === updated.id ? updated : i))}
              onRemove={() => update(richItems.filter(i => i.id !== item.id))}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* Add new item */}
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <Input value={draft} onChange={e => setDraft(e.target.value)} placeholder={placeholder}
          className="h-9 text-[13px]"
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} />
        <Button size="sm" variant="outline" onClick={add} className="h-9 px-3 flex-shrink-0">
          <Plus style={{ width: 14, height: 14 }} />
        </Button>
      </div>
    </div>
  );
}


// ── Generic sortable drag handle ─────────────────────────────────────────────

function DragHandle(props: any) {
  return (
    <div {...props} style={{ cursor: 'grab', color: '#c7c7cc', display: 'flex', alignItems: 'center', flexShrink: 0, padding: '0 2px' }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="9" cy="6" r="2" /><circle cx="15" cy="6" r="2" />
        <circle cx="9" cy="12" r="2" /><circle cx="15" cy="12" r="2" />
        <circle cx="9" cy="18" r="2" /><circle cx="15" cy="18" r="2" />
      </svg>
    </div>
  );
}

// ── Sortable Step ─────────────────────────────────────────────────────────────

function SortableStep({ item, index, onUpdate, onRemove }: {
  item: { id: string; title: string; description: string };
  index: number;
  onUpdate: (v: typeof item) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  return (
    <div ref={setNodeRef} style={style} className="p-3 rounded-xl bg-[#f5f5f7] space-y-2 group">
      <div className="flex items-center gap-2">
        <DragHandle {...attributes} {...listeners} />
        <span className="w-5 h-5 rounded-full bg-[#3b82f6] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">{index + 1}</span>
        <Input value={item.title} placeholder="Título" className="h-8 text-[13px] bg-white flex-1"
          onChange={e => onUpdate({ ...item, title: e.target.value })} />
        <button onClick={onRemove}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-[#c7c7cc] opacity-0 group-hover:opacity-100 transition hover:text-red-400 hover:bg-red-50 flex-shrink-0">
          <X style={{ width: 11, height: 11 }} />
        </button>
      </div>
      <Textarea value={item.description} placeholder="Descrição…" rows={2} className="resize-none text-[13px] bg-white"
        onChange={e => onUpdate({ ...item, description: e.target.value })} />
    </div>
  );
}

// ── Sortable Stat ─────────────────────────────────────────────────────────────

function SortableStat({ item, onUpdate, onRemove }: {
  item: { id: string; value: string; label: string };
  onUpdate: (v: typeof item) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 group">
      <DragHandle {...attributes} {...listeners} />
      <Input value={item.value} placeholder="Ex: 500+" className="h-8 text-[13px]"
        onChange={e => onUpdate({ ...item, value: e.target.value })} />
      <Input value={item.label} placeholder="Ex: Clientes ativos" className="h-8 text-[13px]"
        onChange={e => onUpdate({ ...item, label: e.target.value })} />
      <button onClick={onRemove}
        className="w-6 h-6 rounded-lg flex items-center justify-center text-[#c7c7cc] opacity-0 group-hover:opacity-100 transition hover:text-red-400 hover:bg-red-50 flex-shrink-0">
        <X style={{ width: 11, height: 11 }} />
      </button>
    </div>
  );
}

// ── Sortable FAQ ──────────────────────────────────────────────────────────────

function SortableFAQ({ item, onUpdate, onRemove }: {
  item: { id: string; question: string; answer: string };
  onUpdate: (v: typeof item) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  return (
    <div ref={setNodeRef} style={style} className="p-3 rounded-xl bg-[#f5f5f7] space-y-2 group">
      <div className="flex items-center gap-2">
        <DragHandle {...attributes} {...listeners} />
        <Input value={item.question} placeholder="Pergunta…" className="h-8 text-[13px] bg-white flex-1"
          onChange={e => onUpdate({ ...item, question: e.target.value })} />
        <button onClick={onRemove}
          className="w-6 h-6 rounded-lg flex items-center justify-center text-[#c7c7cc] opacity-0 group-hover:opacity-100 transition hover:text-red-400 hover:bg-red-50 flex-shrink-0">
          <X style={{ width: 11, height: 11 }} />
        </button>
      </div>
      <Textarea value={item.answer} placeholder="Resposta…" rows={2} className="resize-none text-[13px] bg-white"
        onChange={e => onUpdate({ ...item, answer: e.target.value })} />
    </div>
  );
}

// ── useSortableList helper ────────────────────────────────────────────────────

function useSortableList<T extends { id: string }>(
  initial: T[],
  onCommit: (v: T[]) => void
) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIdx = initial.findIndex(i => i.id === active.id);
      const newIdx = initial.findIndex(i => i.id === over.id);
      onCommit(arrayMove(initial, oldIdx, newIdx));
    }
  };
  return { sensors, handleDragEnd };
}


// ── StepsEditor (hooks at top level) ─────────────────────────────────────────

function StepsEditor({ block, onChange }: { block: PageBlock; onChange: (b: PageBlock) => void }) {
  const set = <K extends keyof PageBlock>(k: K, v: PageBlock[K]) => onChange({ ...block, [k]: v });
  const stepsWithId = (block.steps || []).map((s, i) => (s as any).id ? s as any : { ...s, id: `step-${i}` });
  const commit = (updated: typeof stepsWithId) => set('steps', updated as any);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      commit(arrayMove(stepsWithId, stepsWithId.findIndex((i: any) => i.id === active.id), stepsWithId.findIndex((i: any) => i.id === over.id)));
    }
  };
  return (
    <div className="space-y-3">
      <div><FL>Título</FL><Input value={block.title || ''} onChange={e => set('title', e.target.value as any)} placeholder="Como funciona" className="h-9" /></div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={stepsWithId.map((s: any) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {stepsWithId.map((step: any, i: number) => (
              <SortableStep key={step.id} item={step} index={i}
                onUpdate={v => commit(stepsWithId.map((s: any) => s.id === v.id ? v : s))}
                onRemove={() => commit(stepsWithId.filter((s: any) => s.id !== step.id))} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <Button variant="outline" size="sm" className="w-full h-8 text-[12px] gap-1.5"
        onClick={() => commit([...stepsWithId, { id: `step-${Date.now()}`, title: '', description: '' }])}>
        <Plus style={{ width: 12, height: 12 }} /> Adicionar passo
      </Button>
      <SpacingRadiusControls block={block} onChange={onChange} />
    </div>
  );
}

// ── StatsEditor (hooks at top level) ─────────────────────────────────────────

function StatsEditor({ block, onChange }: { block: PageBlock; onChange: (b: PageBlock) => void }) {
  const set = <K extends keyof PageBlock>(k: K, v: PageBlock[K]) => onChange({ ...block, [k]: v });
  const statsWithId = (block.stats || []).map((s, i) => (s as any).id ? s as any : { ...s, id: `stat-${i}` });
  const commit = (updated: typeof statsWithId) => set('stats', updated as any);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      commit(arrayMove(statsWithId, statsWithId.findIndex((i: any) => i.id === active.id), statsWithId.findIndex((i: any) => i.id === over.id)));
    }
  };
  return (
    <div className="space-y-2">
      <FL hint="Máx. 4 — arraste para reordenar">Estatísticas</FL>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={statsWithId.map((s: any) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {statsWithId.map((s: any) => (
              <SortableStat key={s.id} item={s}
                onUpdate={v => commit(statsWithId.map((x: any) => x.id === v.id ? v : x))}
                onRemove={() => commit(statsWithId.filter((x: any) => x.id !== s.id))} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {statsWithId.length < 4 && (
        <Button variant="outline" size="sm" className="w-full h-8 text-[12px] gap-1.5"
          onClick={() => commit([...statsWithId, { id: `stat-${Date.now()}`, value: '', label: '' }])}>
          <Plus style={{ width: 12, height: 12 }} /> Adicionar
        </Button>
      )}
      <SpacingRadiusControls block={block} onChange={onChange} />
    </div>
  );
}

// ── FaqEditor (hooks at top level) ───────────────────────────────────────────

function FaqEditor({ block, onChange }: { block: PageBlock; onChange: (b: PageBlock) => void }) {
  const set = <K extends keyof PageBlock>(k: K, v: PageBlock[K]) => onChange({ ...block, [k]: v });
  const faqWithId = (block.faq || []).map((f, i) => (f as any).id ? f as any : { ...f, id: `faq-${i}` });
  const commit = (updated: typeof faqWithId) => set('faq', updated as any);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      commit(arrayMove(faqWithId, faqWithId.findIndex((i: any) => i.id === active.id), faqWithId.findIndex((i: any) => i.id === over.id)));
    }
  };
  return (
    <div className="space-y-3">
      <div><FL>Título</FL><Input value={block.title || ''} onChange={e => set('title', e.target.value as any)} placeholder="Perguntas Frequentes" className="h-9" /></div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={faqWithId.map((f: any) => f.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {faqWithId.map((item: any) => (
              <SortableFAQ key={item.id} item={item}
                onUpdate={v => commit(faqWithId.map((f: any) => f.id === v.id ? v : f))}
                onRemove={() => commit(faqWithId.filter((f: any) => f.id !== item.id))} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <Button variant="outline" size="sm" className="w-full h-8 text-[12px] gap-1.5"
        onClick={() => commit([...faqWithId, { id: `faq-${Date.now()}`, question: '', answer: '' }])}>
        <Plus style={{ width: 12, height: 12 }} /> Adicionar pergunta
      </Button>
      <SpacingRadiusControls block={block} onChange={onChange} />
    </div>
  );
}

// ── Block editors ─────────────────────────────────────────────────────────────

function BlockEditor({ block, onChange }: { block: PageBlock; onChange: (b: PageBlock) => void }) {
  const set = <K extends keyof PageBlock>(k: K, v: PageBlock[K]) => onChange({ ...block, [k]: v });

  if (block.type === 'hero') return <HeroEditor block={block} onChange={onChange} />;

  // ── Aparência completa (fundo + forma + espaçamento) ──────────────────────
  const AppearanceControls = () => {
    const [openSection, setOpenSection] = React.useState<'bg' | 'shape' | 'spacing' | null>('bg');
    const toggle = (s: 'bg' | 'shape' | 'spacing') => setOpenSection(openSection === s ? null : s);

    const bgMode = block.continuousBgMode || 'none';
    const bgType = block.continuousBgType || 'gradient';
    const shapeTop = block.sectionShapeTop || 'none';
    const shapeBottom = block.sectionShapeBottom || 'none';
    const shapeColor = block.sectionShapeColor || '#ffffff';

    const SHAPE_OPTIONS = [
      { v: 'none', label: 'Nenhuma', svg: null },
      { v: 'wave', label: 'Onda', svg: 'M0,60 C15,40 35,80 50,60 C65,40 85,80 100,60 L100,0 L0,0 Z' },
      { v: 'wave-soft', label: 'Onda suave', svg: 'M0,70 C25,50 75,90 100,70 L100,0 L0,0 Z' },
      { v: 'diagonal-right', label: 'Diagonal →', svg: 'M0,0 L100,0 L100,30 L0,100 Z' },
      { v: 'diagonal-left', label: 'Diagonal ←', svg: 'M0,30 L100,0 L100,0 L0,0 Z' },
    ] as const;

    const AccordionHeader = ({ id, label, emoji, active }: { id: 'bg' | 'shape' | 'spacing'; label: string; emoji: string; active: boolean }) => (
      <button onClick={() => toggle(id)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '9px 12px', borderRadius: active ? '10px 10px 0 0' : 10,
          background: active ? '#f97316' : '#f5f5f7',
          border: `1.5px solid ${active ? '#f97316' : 'rgba(0,0,0,.08)'}`,
          cursor: 'pointer', marginBottom: active ? 0 : 4,
          borderBottom: active ? 'none' : undefined,
          transition: 'all .15s',
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ fontSize: 14 }}>{emoji}</span>
          <span style={{ fontSize: 11, fontWeight: 800, color: active ? '#fff' : '#1d1d1f' }}>{label}</span>
        </div>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#8e8e93'} strokeWidth="2.5"
          style={{ transform: active ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    );

    const AccordionBody = ({ children }: { children: React.ReactNode }) => (
      <div style={{ background: '#fff', border: '1.5px solid #f97316', borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '12px 12px 14px', marginBottom: 4 }}>
        {children}
      </div>
    );

    return (
      <div style={{ marginBottom: 4 }}>
        <SectionDivider label="Aparência" />

        {/* ── FUNDO ── */}
        <AccordionHeader id="bg" label="Fundo da seção" emoji="🎨" active={openSection === 'bg'} />
        {openSection === 'bg' && (
          <AccordionBody>
            {/* Base theme */}
            <p style={{ fontSize: 10, fontWeight: 800, color: '#98989d', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Cor base</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 5, marginBottom: 12 }}>
              {[
                { v: 'light' as const, label: 'Claro', bg: '#f5f5f7', fg: '#1d1d1f' },
                { v: 'dark' as const, label: 'Escuro', bg: '#0a0a0c', fg: '#fff' },
                { v: 'brand' as const, label: 'Cor tema', bg: '#f97316', fg: '#fff' },
              ].map(o => (
                <button key={o.v} onClick={() => set('colorTheme', o.v)}
                  style={{
                    height: 36, borderRadius: 10, fontSize: 11, fontWeight: 700, border: `2px solid ${block.colorTheme === o.v ? '#f97316' : 'rgba(0,0,0,.08)'}`,
                    background: o.bg, color: o.fg, cursor: 'pointer',
                    boxShadow: block.colorTheme === o.v ? '0 0 0 3px rgba(249,115,22,.2)' : 'none',
                    transition: 'all .12s',
                  }}>
                  {o.label}
                </button>
              ))}
            </div>

            {/* Gradient overlay */}
            <p style={{ fontSize: 10, fontWeight: 800, color: '#98989d', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Gradiente / Imagem sobreposta</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 4, marginBottom: bgMode !== 'none' ? 10 : 0 }}>
              {([
                { v: 'none', label: 'Nenhum', icon: '○' },
                { v: 'self', label: 'Neste bloco', icon: '⬛' },
              ] as const).map(o => (
                <button key={o.v} onClick={() => set('continuousBgMode', o.v)}
                  style={{
                    height: 32, borderRadius: 8, fontSize: 11, fontWeight: 700,
                    border: `1.5px solid ${bgMode === o.v ? '#f97316' : 'rgba(0,0,0,.08)'}`,
                    background: bgMode === o.v ? '#fff7ed' : '#f9f9fb',
                    color: bgMode === o.v ? '#f97316' : '#6e6e73', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  }}>
                  <span>{o.icon}</span> {o.label}
                </button>
              ))}
            </div>

            {bgMode !== 'none' && (
              <div style={{ background: '#f9f9fb', borderRadius: 10, padding: 10 }}>
                {/* Type: gradient vs image */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginBottom: 10 }}>
                  {([
                    { v: 'gradient', label: '⬜ Gradiente' },
                    { v: 'image', label: '🖼 Imagem' },
                  ] as const).map(o => (
                    <button key={o.v} onClick={() => set('continuousBgType', o.v)}
                      style={{ height: 28, borderRadius: 7, fontSize: 10, fontWeight: 700, border: `1.5px solid ${bgType === o.v ? '#f97316' : 'rgba(0,0,0,.1)'}`, background: bgType === o.v ? '#fff7ed' : '#fff', color: bgType === o.v ? '#f97316' : '#6e6e73', cursor: 'pointer' }}>
                      {o.label}
                    </button>
                  ))}
                </div>

                {bgType === 'gradient' && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
                      {([
                        { key: 'continuousBgColor1' as const, label: 'Cor 1' },
                        { key: 'continuousBgColor2' as const, label: 'Cor 2' },
                      ]).map(({ key, label }) => (
                        <label key={key} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <span style={{ fontSize: 9, fontWeight: 700, color: '#98989d', textTransform: 'uppercase' }}>{label}</span>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <input type="color" value={(block[key] as string) || '#07101f'} onChange={e => set(key, e.target.value)}
                              style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(0,0,0,.1)', cursor: 'pointer', padding: 2, flexShrink: 0 }} />
                            <input type="text" value={(block[key] as string) || '#07101f'} onChange={e => set(key, e.target.value)}
                              style={{ flex: 1, height: 28, borderRadius: 6, border: '1px solid rgba(0,0,0,.1)', fontSize: 10, fontFamily: 'monospace', paddingLeft: 6, background: '#fff' }} />
                          </div>
                        </label>
                      ))}
                    </div>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#98989d', textTransform: 'uppercase' }}>Ângulo: {block.continuousBgAngle ?? 160}°</span>
                      <input type="range" min={0} max={360} value={block.continuousBgAngle ?? 160} onChange={e => set('continuousBgAngle', Number(e.target.value))}
                        style={{ width: '100%', accentColor: '#f97316' }} />
                    </label>
                    {/* Live preview strip */}
                    <div style={{ height: 28, borderRadius: 8, marginTop: 8, background: `linear-gradient(${block.continuousBgAngle ?? 160}deg, ${block.continuousBgColor1 || '#07101f'}, ${block.continuousBgColor2 || '#1a4a7a'})`, border: '1px solid rgba(0,0,0,.1)' }} />
                  </>
                )}

                {bgType === 'image' && (
                  <div>
                    <Input value={block.continuousBgImage || ''} onChange={e => set('continuousBgImage', e.target.value)}
                      placeholder="URL da imagem de fundo" className="h-8 text-xs" />
                    {block.continuousBgImage && (
                      <div style={{ height: 60, borderRadius: 8, marginTop: 6, backgroundImage: `url(${block.continuousBgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', border: '1px solid rgba(0,0,0,.1)' }} />
                    )}
                  </div>
                )}

                <label style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 8 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#98989d', textTransform: 'uppercase' }}>Opacidade: {block.continuousBgOpacity ?? 100}%</span>
                  <input type="range" min={5} max={100} value={block.continuousBgOpacity ?? 100} onChange={e => set('continuousBgOpacity', Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#f97316' }} />
                </label>
              </div>
            )}
          </AccordionBody>
        )}

        {/* ── FORMA DA SEÇÃO ── */}
        <AccordionHeader id="shape" label="Forma da seção" emoji="〰️" active={openSection === 'shape'} />
        {openSection === 'shape' && (
          <AccordionBody>
            <p style={{ fontSize: 10, fontWeight: 800, color: '#98989d', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Borda superior</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 4, marginBottom: 12 }}>
              {SHAPE_OPTIONS.map(s => {
                const sel = shapeTop === s.v;
                return (
                  <button key={s.v} onClick={() => set('sectionShapeTop', s.v)}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 4px', borderRadius: 8, border: `1.5px solid ${sel ? '#f97316' : 'rgba(0,0,0,.08)'}`, background: sel ? '#fff7ed' : '#f9f9fb', cursor: 'pointer' }}>
                    {s.svg ? (
                      <svg viewBox="0 0 100 100" style={{ width: 36, height: 20 }} preserveAspectRatio="none">
                        <path d={s.svg} fill={sel ? '#f97316' : '#c7c7cc'} />
                      </svg>
                    ) : (
                      <div style={{ width: 36, height: 20, background: sel ? '#f97316' : '#e5e5ea', borderRadius: 4 }} />
                    )}
                    <span style={{ fontSize: 9, fontWeight: 700, color: sel ? '#f97316' : '#8e8e93', textAlign: 'center', lineHeight: 1.2 }}>{s.label}</span>
                  </button>
                );
              })}
            </div>

            <p style={{ fontSize: 10, fontWeight: 800, color: '#98989d', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Borda inferior</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 4, marginBottom: 12 }}>
              {SHAPE_OPTIONS.map(s => {
                const sel = shapeBottom === s.v;
                return (
                  <button key={s.v} onClick={() => set('sectionShapeBottom', s.v)}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 4px', borderRadius: 8, border: `1.5px solid ${sel ? '#f97316' : 'rgba(0,0,0,.08)'}`, background: sel ? '#fff7ed' : '#f9f9fb', cursor: 'pointer' }}>
                    {s.svg ? (
                      <svg viewBox="0 0 100 100" style={{ width: 36, height: 20 }} preserveAspectRatio="none">
                        <path d={s.svg} fill={sel ? '#f97316' : '#c7c7cc'} />
                      </svg>
                    ) : (
                      <div style={{ width: 36, height: 20, background: sel ? '#f97316' : '#e5e5ea', borderRadius: 4 }} />
                    )}
                    <span style={{ fontSize: 9, fontWeight: 700, color: sel ? '#f97316' : '#8e8e93', textAlign: 'center', lineHeight: 1.2 }}>{s.label}</span>
                  </button>
                );
              })}
            </div>

            {(shapeTop !== 'none' || shapeBottom !== 'none') && (
              <div>
                <p style={{ fontSize: 10, fontWeight: 800, color: '#98989d', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Cor da forma</p>
                <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                  <input type="color" value={shapeColor} onChange={e => set('sectionShapeColor', e.target.value)}
                    style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(0,0,0,.1)', cursor: 'pointer', padding: 2 }} />
                  <input type="text" value={shapeColor} onChange={e => set('sectionShapeColor', e.target.value)}
                    style={{ flex: 1, height: 28, borderRadius: 6, border: '1px solid rgba(0,0,0,.1)', fontSize: 10, fontFamily: 'monospace', paddingLeft: 6, background: '#fff' }} />
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {['#ffffff', '#f5f5f7', '#0a0a0c', '#f97316', '#f0f7ff', '#1e293b'].map(c => (
                    <button key={c} onClick={() => set('sectionShapeColor', c)}
                      style={{ width: 24, height: 24, borderRadius: 6, background: c, border: shapeColor === c ? '2.5px solid #f97316' : '1.5px solid rgba(0,0,0,.12)', cursor: 'pointer' }} />
                  ))}
                </div>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 10 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#98989d', textTransform: 'uppercase' }}>Tamanho: {block.sectionShapeSize ?? 3}%</span>
                  <input type="range" min={1} max={10} step={0.5} value={block.sectionShapeSize ?? 3} onChange={e => set('sectionShapeSize', Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#f97316' }} />
                </label>
              </div>
            )}
          </AccordionBody>
        )}

        {/* ── ESPAÇAMENTO ── */}
        <AccordionHeader id="spacing" label="Espaçamento e cantos" emoji="📐" active={openSection === 'spacing'} />
        {openSection === 'spacing' && (
          <AccordionBody>
            <p style={{ fontSize: 10, fontWeight: 800, color: '#98989d', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Padding vertical</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 5, marginBottom: 12 }}>
              {([
                { v: 'compact', label: 'Compacto', preview: '▪' },
                { v: 'normal', label: 'Normal', preview: '▩' },
                { v: 'spacious', label: 'Generoso', preview: '◻' },
              ] as const).map(o => {
                const sel = (block.blockSpacing || 'normal') === o.v;
                return (
                  <button key={o.v} onClick={() => set('blockSpacing', o.v)}
                    style={{ height: 48, borderRadius: 10, fontSize: 20, border: `2px solid ${sel ? '#f97316' : 'rgba(0,0,0,.08)'}`, background: sel ? '#fff7ed' : '#f9f9fb', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <span>{o.preview}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: sel ? '#f97316' : '#8e8e93' }}>{o.label}</span>
                  </button>
                );
              })}
            </div>

            <p style={{ fontSize: 10, fontWeight: 800, color: '#98989d', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Cantos dos cards internos</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 5 }}>
              {([
                { v: 'none', label: 'Quadrado', r: 0 },
                { v: 'medium', label: 'Médio', r: 12 },
                { v: 'large', label: 'Arredondado', r: 24 },
              ] as const).map(o => {
                const sel = (block.blockRadius || 'large') === o.v;
                return (
                  <button key={o.v} onClick={() => set('blockRadius', o.v)}
                    style={{ height: 52, borderRadius: 10, border: `2px solid ${sel ? '#f97316' : 'rgba(0,0,0,.08)'}`, background: sel ? '#fff7ed' : '#f9f9fb', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <div style={{ width: 28, height: 18, borderRadius: o.r, border: `2px solid ${sel ? '#f97316' : '#c7c7cc'}` }} />
                    <span style={{ fontSize: 9, fontWeight: 700, color: sel ? '#f97316' : '#8e8e93' }}>{o.label}</span>
                  </button>
                );
              })}
            </div>
          </AccordionBody>
        )}
      </div>
    );
  };

  // ── Features ──────────────────────────────────────────────────────────────
  if (block.type === 'features') {
    const featLayouts: { v: string; label: string; desc: string; preview: string }[] = [
      { v: 'split_dark', label: 'Split Dark', desc: 'Título à esq., cards colunados à dir. — fundo escuro', preview: '◧' },
      { v: 'dark_cards', label: 'Dark Cards', desc: 'Cards escuros com ícone grande no topo', preview: '▦' },
      { v: 'bento', label: 'Bento Grid', desc: 'Card hero grande + grid compacto — fundo escuro', preview: '⊞' },
      { v: 'dark_numbered', label: 'Numerado Escuro', desc: 'Número gigante em gradiente, fundo escuro', preview: '①' },
      { v: 'grid', label: 'Grid Ícones', desc: 'Grade centralizada com ícone + título + desc', preview: '⊟' },
      { v: 'highlight_list', label: 'Lista Numerada', desc: 'Número em destaque + texto, 2 colunas', preview: '⑆' },
      { v: 'checklist', label: 'Checklist', desc: 'Check com pílula arredondada', preview: '✓' },
      { v: 'minimal_pills', label: 'Pílulas Mínimas', desc: 'Tags arredondadas, minimalista', preview: '○' },
      { v: 'cards_hover', label: 'Cards Hover', desc: 'Cards com animação no hover', preview: '▣' },

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
          <FL hint="Arraste para reordenar • Clique ▼ para editar alinhamento, largura, tamanhos">Itens (com drag & controles)</FL>
          <RichItemEditor items={block.iconItems && block.iconItems.length > 0 ? block.iconItems : (block.items || [])} onChange={v => { set('iconItems', v); set('items', v.map((i: any) => i.label)); }} accent="#f97316" placeholder="Ex: Controle de estoque em tempo real" />
        </div>


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
        <AppearanceControls />

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
          <FL hint="Arraste para reordenar • Clique ▼ para editar alinhamento, largura, tamanhos, ícone e cores">Itens (drag & controles avançados)</FL>
          <RichItemEditor
            items={block.iconItems && block.iconItems.length > 0 ? block.iconItems : (block.items || [])}
            onChange={v => { set('iconItems', v); set('items', v.map((i: any) => i.label)); }}
            accent="#10b981"
            placeholder="Ex: Redução de custos operacionais"
          />
        </div>

        <SpacingRadiusControls block={block} onChange={onChange} />
      </div>
    );
  }

  // ── Integrations ──────────────────────────────────────────────────────────
  if (block.type === 'integrations') {
    const logos: { name: string; imageUrl: string }[] = block.logoItems || [];
    const [uploadingIdx, setUploadingIdx] = React.useState<number | null>(null);
    const token = localStorage.getItem('token') || '';

    const addLogo = () => set('logoItems', [...logos, { name: '', imageUrl: '' }]);

    const updateLogo = (i: number, field: string, val: string) => {
      set('logoItems', logos.map((l, idx) => idx === i ? { ...l, [field]: val } : l));
    };

    const removeLogo = (i: number) => set('logoItems', logos.filter((_, idx) => idx !== i));

    const uploadLogo = async (i: number, file: File) => {
      setUploadingIdx(i);
      try {
        const fd = new FormData(); fd.append('image', file);
        const res = await fetch(`${API_URL}/admin/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
        if (!res.ok) throw new Error('Upload falhou');
        const { url } = await res.json();
        updateLogo(i, 'imageUrl', url);
      } catch { /* silently fail */ }
      finally { setUploadingIdx(null); }
    };

    return (
      <div className="space-y-3">
        <AppearanceControls />
        <div><FL>Título</FL><Input value={block.title || ''} onChange={e => set('title', e.target.value)} placeholder="Integrações" className="h-9" /></div>
        <div>
          <FL hint="Faça upload do logo de cada sistema integrado">Logos das Integrações</FL>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {logos.map((logo, i) => {
              const isUploading = uploadingIdx === i;
              const previewSrc = logo.imageUrl
                ? (logo.imageUrl.startsWith('http') ? logo.imageUrl : `${BASE_URL}${logo.imageUrl}`)
                : null;
              return (
                <div key={i} style={{ border: '1px solid rgba(0,0,0,.08)', borderRadius: 12, padding: 10, background: '#fafafa', display: 'flex', gap: 10, alignItems: 'center' }}>
                  {/* Upload zone */}
                  <label style={{ width: 64, height: 44, borderRadius: 10, border: `1.5px dashed ${previewSrc ? 'transparent' : 'rgba(0,0,0,.15)'}`, background: previewSrc ? '#fff' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, overflow: 'hidden', position: 'relative' }}
                    title="Clique para fazer upload">
                    {isUploading
                      ? <div style={{ fontSize: 10, color: '#94a3b8', textAlign: 'center', lineHeight: 1.3 }}>Enviando…</div>
                      : previewSrc
                        ? <img src={previewSrc} alt={logo.name} style={{ maxWidth: 56, maxHeight: 36, objectFit: 'contain' }} />
                        : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                          <Upload style={{ width: 16, height: 16, color: '#94a3b8' }} />
                          <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>LOGO</span>
                        </div>}
                    <input type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) uploadLogo(i, f); e.target.value = ''; }} />
                  </label>
                  {/* Name */}
                  <Input value={logo.name} onChange={e => updateLogo(i, 'name', e.target.value)}
                    placeholder="Nome do sistema" className="h-9 flex-1 text-[12px]" />
                  {/* Remove */}
                  <button onClick={() => removeLogo(i)}
                    style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: '#c7c7cc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fee2e2'; (e.currentTarget as HTMLElement).style.color = '#ef4444'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#c7c7cc'; }}>
                    <X style={{ width: 13, height: 13 }} />
                  </button>
                </div>
              );
            })}
            <button onClick={addLogo}
              style={{ width: '100%', padding: '10px', border: '1.5px dashed rgba(0,0,0,.12)', borderRadius: 12, background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Plus style={{ width: 13, height: 13 }} /> Adicionar integração
            </button>
          </div>
        </div>
        <SpacingRadiusControls block={block} onChange={onChange} />
      </div>
    );
  }

  if (block.type === 'steps') return <StepsEditor block={block} onChange={onChange} />;

  if (block.type === 'stats') return <StatsEditor block={block} onChange={onChange} />;

  if (block.type === 'testimonial') return (
    <div className="space-y-3">
      <AppearanceControls />
      <div><FL>Citação</FL><Textarea value={block.quote || ''} onChange={e => set('quote', e.target.value)} rows={3} placeholder="O sistema transformou nossa gestão…" className="resize-none text-[13px]" /></div>
      <div className="grid grid-cols-2 gap-2">
        <div><FL>Autor</FL><Input value={block.author || ''} onChange={e => set('author', e.target.value)} placeholder="João Silva" className="h-9" /></div>
        <div><FL>Cargo</FL><Input value={block.role || ''} onChange={e => set('role', e.target.value)} placeholder="CEO, Rede Farma" className="h-9" /></div>
      </div>
      <SpacingRadiusControls block={block} onChange={onChange} />
    </div>
  );

  if (block.type === 'faq') return <FaqEditor block={block} onChange={onChange} />;

  if (block.type === 'video') return (
    <div className="space-y-3">
      <AppearanceControls />
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

  if (block.type === 'cta') {
    const ctaLayouts = [
      { v: 'centered', emoji: '⬛', label: 'Gradiente', desc: 'Card colorido, centralizado, com dots' },
      { v: 'split',    emoji: '◫',  label: 'Dividido',  desc: 'Texto à esq., botões à dir.' },
      { v: 'glow',     emoji: '✦',  label: 'Glow',      desc: 'Fundo escuro + orbe de luz vibrante' },
      { v: 'minimal',  emoji: '—',  label: 'Mínimo',    desc: 'Borda lateral, sem decoração' },
    ];
    const curLayout = block.ctaLayout || 'centered';
    return (
      <div className="space-y-3">
        <AppearanceControls />

        <SectionDivider label="Estilo" />
        <div className="grid grid-cols-2 gap-1.5">
          {ctaLayouts.map(o => {
            const sel = curLayout === o.v;
            return (
              <button key={o.v} onClick={() => set('ctaLayout', o.v)}
                className="text-left px-3 py-2.5 rounded-xl border-2 transition"
                style={{ borderColor: sel ? '#f97316' : 'rgba(0,0,0,.08)', background: sel ? '#fff7ed' : '#fafafa' }}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span style={{ color: sel ? '#f97316' : '#aaa', fontSize: 14 }}>{o.emoji}</span>
                  <p className="text-[12px] font-bold" style={{ color: sel ? '#f97316' : '#1d1d1f' }}>{o.label}</p>
                  {sel && <span className="text-[10px] font-bold ml-auto" style={{ color: '#f97316' }}>✓</span>}
                </div>
                <p className="text-[10px] leading-snug" style={{ color: '#98989d' }}>{o.desc}</p>
              </button>
            );
          })}
        </div>

        <SectionDivider label="Conteúdo" />
        <div><FL hint="Pílula/badge exibida acima do título">Badge / eyebrow</FL><Input value={block.badge || ''} onChange={e => set('badge', e.target.value)} placeholder="✨ Novidade" className="h-9" /></div>
        <div><FL>Título</FL><Input value={block.title || ''} onChange={e => set('title', e.target.value)} placeholder="Pronto para transformar?" className="h-9" /></div>
        <div><FL>Descrição</FL><Textarea value={block.description || ''} onChange={e => set('description', e.target.value)} rows={2} placeholder="Fale com nossos especialistas…" className="resize-none text-[13px]" /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><FL>Botão principal</FL><Input value={block.ctaLabel || ''} onChange={e => set('ctaLabel', e.target.value)} placeholder="Falar com Especialista" className="h-9" /></div>
          <div><FL>Link</FL><Input value={block.ctaLink || ''} onChange={e => set('ctaLink', e.target.value)} placeholder="/cliente" className="h-9" /></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div><FL>Botão secundário</FL><Input value={block.secondaryLabel || ''} onChange={e => set('secondaryLabel', e.target.value)} placeholder="Ver soluções" className="h-9" /></div>
          <div><FL>Link secundário</FL><Input value={block.secondaryLink || ''} onChange={e => set('secondaryLink', e.target.value)} placeholder="/solucoes" className="h-9" /></div>
        </div>
        <div><FL hint="Exibido abaixo dos botões (ex: '3.200 empresas confiam')">Prova social</FL><Input value={block.socialProof || ''} onChange={e => set('socialProof', e.target.value)} placeholder="Mais de 3.200 empresas confiam" className="h-9" /></div>

        <SectionDivider label="Cores" />
        <ColorField label="Fundo da seção" value={block.bgColor || 'transparent'} onChange={v => set('bgColor', v)} />
        <ColorField label="Cor de destaque / gradiente" value={block.ctaBgColor || '#f97316'} onChange={v => set('ctaBgColor', v)} />
        <ColorField label="Título" value={block.titleColor || '#ffffff'} onChange={v => set('titleColor', v)} />
        <ColorField label="Descrição" value={block.subtitleColor || 'rgba(255,255,255,0.8)'} onChange={v => set('subtitleColor', v)} />
        <ColorField label="Botão — fundo" value={block.ctaBtnBg || '#ffffff'} onChange={v => set('ctaBtnBg', v)} />
        <ColorField label="Botão — texto" value={block.ctaBtnText || '#f97316'} onChange={v => set('ctaBtnText', v)} />

        <SpacingRadiusControls block={block} onChange={onChange} />
      </div>
    );
  }

  if (block.type === 'text') return (
    <div className="space-y-3">
      <AppearanceControls />
      <div><FL>Título (opcional)</FL><Input value={block.title || ''} onChange={e => set('title', e.target.value)} placeholder="Título do bloco" className="h-9" /></div>
      <div><FL>Texto</FL><Textarea value={block.description || ''} onChange={e => set('description', e.target.value)} rows={5} placeholder="Seu texto aqui…" className="resize-none text-[13px]" /></div>
      <SpacingRadiusControls block={block} onChange={onChange} />
    </div>
  );

  if (block.type === 'richtext') return (
    <div className="space-y-3">
      <AppearanceControls />
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
      <AppearanceControls />
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
          <RichItemEditor items={block.iconItems && block.iconItems.length > 0 ? block.iconItems : (block.items || [])} onChange={v => { set('iconItems', v); set('items', v.map((i: any) => i.label)); }} accent="#3b82f6" placeholder="Ex: Controle em tempo real" /></div>
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

  // ════════════════════════════════════════════════════════════════════════
  // PRICING — editor com array de planos, toggle anual, footnote
  // ════════════════════════════════════════════════════════════════════════
  if (block.type === 'pricing') {
    const plans = block.pricingPlans || [];
    const updatePlan = (i: number, patch: Partial<NonNullable<PageBlock['pricingPlans']>[number]>) => {
      const next = [...plans]; next[i] = { ...next[i], ...patch };
      set('pricingPlans', next);
    };
    return (
      <div className="space-y-3">
        <AppearanceControls />
        <div><FL>Título da seção</FL><Input value={block.title || ''} onChange={e => set('title', e.target.value)} placeholder="Planos para todo tamanho" className="h-9" /></div>
        <div><FL>Subtítulo</FL><Input value={block.subtitle || ''} onChange={e => set('subtitle', e.target.value)} placeholder="Comece pequeno. Cresça quando quiser." className="h-9" /></div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-[#f5f5f7]">
          <div>
            <p className="text-[12px] font-semibold text-[#1d1d1f]">Toggle Mensal / Anual</p>
            <p className="text-[11px] text-[#98989d]">Permite visitante comparar preços</p>
          </div>
          <Switch checked={block.pricingShowToggle !== false} onCheckedChange={v => set('pricingShowToggle', v)} />
        </div>
        <div><FL>Label do desconto anual</FL><Input value={block.pricingAnnualDiscountLabel || ''} onChange={e => set('pricingAnnualDiscountLabel', e.target.value)} placeholder="Economize 20%" className="h-9" /></div>
        <div><FL>Texto fino abaixo dos planos (opcional)</FL><Textarea value={block.pricingFootnote || ''} onChange={e => set('pricingFootnote', e.target.value)} rows={2} className="resize-none text-[13px]" /></div>

        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <FL>Planos ({plans.length})</FL>
            <Button size="sm" variant="outline" onClick={() => set('pricingPlans', [...plans, { name: 'Novo Plano', priceMonthly: '0', priceCurrency: 'R$', priceSuffix: '/mês', features: [] }])}
              className="h-7 text-[11px] gap-1">+ Adicionar plano</Button>
          </div>
          {plans.map((p, i) => (
            <details key={i} className="rounded-xl border mb-2" style={{ borderColor: 'rgba(0,0,0,.08)' }}>
              <summary className="cursor-pointer px-3 py-2.5 text-[12px] font-semibold flex items-center justify-between">
                <span className="flex items-center gap-2">{p.highlighted && <Star size={11} className="text-orange-500" />} {p.name || '(sem nome)'}</span>
                <span className="flex items-center gap-1">
                  <button onClick={(e) => { e.preventDefault(); set('pricingPlans', plans.filter((_, j) => j !== i)); }}
                    className="p-1 text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
                </span>
              </summary>
              <div className="p-3 space-y-2 border-t" style={{ borderColor: 'rgba(0,0,0,.06)' }}>
                <div className="grid grid-cols-2 gap-2">
                  <div><FL>Nome</FL><Input value={p.name} onChange={e => updatePlan(i, { name: e.target.value })} className="h-8 text-[12px]" /></div>
                  <div><FL>Descrição</FL><Input value={p.description || ''} onChange={e => updatePlan(i, { description: e.target.value })} placeholder="Para começar" className="h-8 text-[12px]" /></div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div><FL>Moeda</FL><Input value={p.priceCurrency || 'R$'} onChange={e => updatePlan(i, { priceCurrency: e.target.value })} className="h-8 text-[12px]" /></div>
                  <div><FL>Preço mensal</FL><Input value={p.priceMonthly} onChange={e => updatePlan(i, { priceMonthly: e.target.value })} placeholder="99" className="h-8 text-[12px]" /></div>
                  <div><FL>Preço anual</FL><Input value={p.priceAnnual || ''} onChange={e => updatePlan(i, { priceAnnual: e.target.value })} placeholder="79" className="h-8 text-[12px]" /></div>
                </div>
                <div><FL>Sufixo do preço</FL><Input value={p.priceSuffix || '/mês'} onChange={e => updatePlan(i, { priceSuffix: e.target.value })} className="h-8 text-[12px]" /></div>
                <div><FL hint="Uma feature por linha">Features (uma por linha)</FL>
                  <Textarea value={(p.features || []).join('\n')} onChange={e => updatePlan(i, { features: e.target.value.split('\n').filter(Boolean) })} rows={4} className="text-[12px] resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><FL>Texto do botão</FL><Input value={p.ctaLabel || ''} onChange={e => updatePlan(i, { ctaLabel: e.target.value })} placeholder="Começar grátis" className="h-8 text-[12px]" /></div>
                  <div><FL>Link do botão</FL><Input value={p.ctaLink || ''} onChange={e => updatePlan(i, { ctaLink: e.target.value })} placeholder="/cliente" className="h-8 text-[12px]" /></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><FL>Badge (opcional)</FL><Input value={p.badge || ''} onChange={e => updatePlan(i, { badge: e.target.value })} placeholder="Mais popular" className="h-8 text-[12px]" /></div>
                  <div><FL>Cor do tema (hex)</FL><Input value={p.color || ''} onChange={e => updatePlan(i, { color: e.target.value })} placeholder="#f97316" className="h-8 text-[12px] font-mono" /></div>
                </div>
                <label className="flex items-center gap-2 text-[12px] cursor-pointer pt-1">
                  <input type="checkbox" checked={!!p.highlighted} onChange={e => updatePlan(i, { highlighted: e.target.checked })} />
                  <span>Destacar este plano (escala + sombra)</span>
                </label>
              </div>
            </details>
          ))}
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // DEMO_FORM — editor com campos custom, success message, integração API
  // ════════════════════════════════════════════════════════════════════════
  if (block.type === 'demo_form') {
    const fields = block.formFields || [];
    const benefits = block.formBenefits || [];
    const updateField = (i: number, patch: Partial<NonNullable<PageBlock['formFields']>[number]>) => {
      const next = [...fields]; next[i] = { ...next[i], ...patch };
      set('formFields', next);
    };
    return (
      <div className="space-y-3">
        <AppearanceControls />
        <div><FL>Título do form</FL><Input value={block.formTitle || ''} onChange={e => set('formTitle', e.target.value)} placeholder="Agendar uma demonstração" className="h-9" /></div>
        <div><FL>Descrição</FL><Textarea value={block.formDescription || ''} onChange={e => set('formDescription', e.target.value)} rows={2} className="resize-none text-[13px]" /></div>

        <div><FL>Layout</FL>
          <div className="grid grid-cols-2 gap-2">
            {(['inline', 'split'] as const).map(l => (
              <button key={l} onClick={() => set('formLayout', l)}
                className="p-2 rounded-lg border text-[11px] font-medium transition"
                style={{ borderColor: (block.formLayout || 'inline') === l ? '#f97316' : 'rgba(0,0,0,.1)', background: (block.formLayout || 'inline') === l ? '#fff7ed' : '#fff' }}>
                {l === 'inline' ? 'Centralizado (form só)' : 'Split (benefícios + form)'}
              </button>
            ))}
          </div>
        </div>

        {(block.formLayout === 'split') && (
          <div><FL hint="Uma por linha — aparece à esquerda do form">Benefícios (lista)</FL>
            <Textarea value={benefits.join('\n')} onChange={e => set('formBenefits', e.target.value.split('\n').filter(Boolean))} rows={3} className="text-[12px] resize-none" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div><FL>Texto do botão</FL><Input value={block.formSubmitLabel || ''} onChange={e => set('formSubmitLabel', e.target.value)} placeholder="Enviar" className="h-9" /></div>
          <div><FL hint="Backend que recebe o POST">Endpoint API</FL><Input value={block.formApiEndpoint || ''} onChange={e => set('formApiEndpoint', e.target.value)} placeholder="/api/leads" className="h-9 font-mono text-[11px]" /></div>
        </div>
        <div><FL>Título de sucesso</FL><Input value={block.formSuccessTitle || ''} onChange={e => set('formSuccessTitle', e.target.value)} placeholder="✅ Recebemos seu contato!" className="h-9" /></div>
        <div><FL>Mensagem de sucesso</FL><Textarea value={block.formSuccessMessage || ''} onChange={e => set('formSuccessMessage', e.target.value)} rows={2} className="resize-none text-[13px]" /></div>

        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <FL>Campos do formulário ({fields.length})</FL>
            <Button size="sm" variant="outline" onClick={() => set('formFields', [...fields, { name: `field${fields.length}`, label: 'Novo campo', type: 'text' }])}
              className="h-7 text-[11px] gap-1">+ Adicionar</Button>
          </div>
          {fields.map((f, i) => (
            <details key={i} className="rounded-xl border mb-2" style={{ borderColor: 'rgba(0,0,0,.08)' }}>
              <summary className="cursor-pointer px-3 py-2.5 text-[12px] font-semibold flex items-center justify-between">
                <span>{f.label || '(sem label)'} <span className="text-[10px] text-[#98989d] font-normal">· {f.type}</span></span>
                <button onClick={(e) => { e.preventDefault(); set('formFields', fields.filter((_, j) => j !== i)); }}
                  className="p-1 text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
              </summary>
              <div className="p-3 space-y-2 border-t" style={{ borderColor: 'rgba(0,0,0,.06)' }}>
                <div className="grid grid-cols-2 gap-2">
                  <div><FL hint="Chave enviada à API">Nome (key)</FL><Input value={f.name} onChange={e => updateField(i, { name: e.target.value.replace(/[^a-z0-9_]/gi, '') })} className="h-8 text-[12px] font-mono" /></div>
                  <div><FL>Tipo</FL>
                    <select value={f.type} onChange={e => updateField(i, { type: e.target.value as any })} className="w-full h-8 px-2 rounded border text-[12px]" style={{ borderColor: 'rgba(0,0,0,.1)' }}>
                      <option value="text">Texto</option>
                      <option value="email">Email</option>
                      <option value="tel">Telefone</option>
                      <option value="select">Seleção</option>
                      <option value="textarea">Texto longo</option>
                    </select>
                  </div>
                </div>
                <div><FL>Label visível</FL><Input value={f.label} onChange={e => updateField(i, { label: e.target.value })} className="h-8 text-[12px]" /></div>
                <div><FL>Placeholder</FL><Input value={f.placeholder || ''} onChange={e => updateField(i, { placeholder: e.target.value })} className="h-8 text-[12px]" /></div>
                {f.type === 'select' && (
                  <div><FL hint="Uma opção por linha">Opções</FL>
                    <Textarea value={(f.options || []).join('\n')} onChange={e => updateField(i, { options: e.target.value.split('\n').filter(Boolean) })} rows={3} className="text-[12px] resize-none" />
                  </div>
                )}
                <div className="flex gap-3 pt-1">
                  <label className="flex items-center gap-1.5 text-[12px] cursor-pointer">
                    <input type="checkbox" checked={!!f.required} onChange={e => updateField(i, { required: e.target.checked })} />
                    <span>Obrigatório</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-[12px] cursor-pointer">
                    <input type="checkbox" checked={!!f.fullWidth} onChange={e => updateField(i, { fullWidth: e.target.checked })} />
                    <span>Largura total</span>
                  </label>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // TEAM — editor com array de membros
  // ════════════════════════════════════════════════════════════════════════
  if (block.type === 'team') {
    const members = block.teamMembers || [];
    const updateMember = (i: number, patch: Partial<NonNullable<PageBlock['teamMembers']>[number]>) => {
      const next = [...members]; next[i] = { ...next[i], ...patch };
      set('teamMembers', next);
    };
    return (
      <div className="space-y-3">
        <AppearanceControls />
        <div><FL>Título</FL><Input value={block.title || ''} onChange={e => set('title', e.target.value)} className="h-9" /></div>
        <div><FL>Subtítulo</FL><Input value={block.subtitle || ''} onChange={e => set('subtitle', e.target.value)} className="h-9" /></div>

        <div className="grid grid-cols-2 gap-2">
          <div><FL>Layout</FL>
            <select value={block.teamLayout || 'grid'} onChange={e => set('teamLayout', e.target.value as any)} className="w-full h-9 px-2 rounded-lg border text-[12px]" style={{ borderColor: 'rgba(0,0,0,.1)' }}>
              <option value="grid">Grid (cards)</option>
              <option value="list">Lista (horizontal)</option>
            </select>
          </div>
          <div><FL>Colunas (grid)</FL>
            <select value={block.teamColumns || 3} onChange={e => set('teamColumns', Number(e.target.value) as any)} className="w-full h-9 px-2 rounded-lg border text-[12px]" style={{ borderColor: 'rgba(0,0,0,.1)' }}>
              <option value={2}>2 colunas</option>
              <option value={3}>3 colunas</option>
              <option value={4}>4 colunas</option>
            </select>
          </div>
        </div>

        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <FL>Membros ({members.length})</FL>
            <Button size="sm" variant="outline" onClick={() => set('teamMembers', [...members, { name: 'Novo membro', role: 'Cargo' }])}
              className="h-7 text-[11px] gap-1">+ Adicionar</Button>
          </div>
          {members.map((m, i) => (
            <details key={i} className="rounded-xl border mb-2" style={{ borderColor: 'rgba(0,0,0,.08)' }}>
              <summary className="cursor-pointer px-3 py-2.5 text-[12px] font-semibold flex items-center justify-between">
                <span>{m.name || '(sem nome)'} <span className="text-[10px] text-[#98989d] font-normal">· {m.role}</span></span>
                <button onClick={(e) => { e.preventDefault(); set('teamMembers', members.filter((_, j) => j !== i)); }}
                  className="p-1 text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
              </summary>
              <div className="p-3 space-y-2 border-t" style={{ borderColor: 'rgba(0,0,0,.06)' }}>
                <div className="grid grid-cols-2 gap-2">
                  <div><FL>Nome</FL><Input value={m.name} onChange={e => updateMember(i, { name: e.target.value })} className="h-8 text-[12px]" /></div>
                  <div><FL>Cargo / função</FL><Input value={m.role} onChange={e => updateMember(i, { role: e.target.value })} className="h-8 text-[12px]" /></div>
                </div>
                <div><FL>Bio curta</FL><Textarea value={m.bio || ''} onChange={e => updateMember(i, { bio: e.target.value })} rows={2} className="text-[12px] resize-none" /></div>
                <div><FL hint="URL da foto (upload ou link). Se vazio, mostra iniciais.">Foto</FL><Input value={m.photo || ''} onChange={e => updateMember(i, { photo: e.target.value })} placeholder="/uploads/avatar.jpg ou https://..." className="h-8 text-[12px]" /></div>
                <div className="grid grid-cols-3 gap-2">
                  <div><FL>LinkedIn</FL><Input value={m.linkedin || ''} onChange={e => updateMember(i, { linkedin: e.target.value })} placeholder="https://linkedin.com/in/..." className="h-8 text-[11px]" /></div>
                  <div><FL>X / Twitter</FL><Input value={m.twitter || ''} onChange={e => updateMember(i, { twitter: e.target.value })} placeholder="https://x.com/..." className="h-8 text-[11px]" /></div>
                  <div><FL>Email</FL><Input value={m.email || ''} onChange={e => updateMember(i, { email: e.target.value })} placeholder="email@empresa.com" className="h-8 text-[11px]" /></div>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // TABS — editor com array de abas
  // ════════════════════════════════════════════════════════════════════════
  if (block.type === 'tabs') {
    const tabs = block.tabsItems || [];
    const updateTab = (i: number, patch: Partial<NonNullable<PageBlock['tabsItems']>[number]>) => {
      const next = [...tabs]; next[i] = { ...next[i], ...patch };
      set('tabsItems', next);
    };
    return (
      <div className="space-y-3">
        <AppearanceControls />
        <div><FL>Título da seção</FL><Input value={block.title || ''} onChange={e => set('title', e.target.value)} className="h-9" /></div>
        <div><FL>Subtítulo</FL><Input value={block.subtitle || ''} onChange={e => set('subtitle', e.target.value)} className="h-9" /></div>

        <div><FL>Orientação</FL>
          <div className="grid grid-cols-2 gap-2">
            {(['horizontal', 'vertical'] as const).map(o => (
              <button key={o} onClick={() => set('tabsOrientation', o)}
                className="p-2 rounded-lg border text-[11px] font-medium transition capitalize"
                style={{ borderColor: (block.tabsOrientation || 'horizontal') === o ? '#f97316' : 'rgba(0,0,0,.1)', background: (block.tabsOrientation || 'horizontal') === o ? '#fff7ed' : '#fff' }}>
                {o === 'horizontal' ? '↔ Horizontal' : '↕ Vertical'}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <FL>Abas ({tabs.length})</FL>
            <Button size="sm" variant="outline" onClick={() => set('tabsItems', [...tabs, { label: 'Nova aba', title: '', description: '' }])}
              className="h-7 text-[11px] gap-1">+ Adicionar</Button>
          </div>
          {tabs.map((tab, i) => (
            <details key={i} className="rounded-xl border mb-2" style={{ borderColor: 'rgba(0,0,0,.08)' }}>
              <summary className="cursor-pointer px-3 py-2.5 text-[12px] font-semibold flex items-center justify-between">
                <span className="flex items-center gap-2">{tab.icon} {tab.label || '(sem nome)'}</span>
                <button onClick={(e) => { e.preventDefault(); set('tabsItems', tabs.filter((_, j) => j !== i)); }}
                  className="p-1 text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
              </summary>
              <div className="p-3 space-y-2 border-t" style={{ borderColor: 'rgba(0,0,0,.06)' }}>
                <div className="grid grid-cols-2 gap-2">
                  <div><FL>Label (texto da aba)</FL><Input value={tab.label} onChange={e => updateTab(i, { label: e.target.value })} className="h-8 text-[12px]" /></div>
                  <div><FL>Ícone (emoji opcional)</FL><Input value={tab.icon || ''} onChange={e => updateTab(i, { icon: e.target.value })} placeholder="🏪" className="h-8 text-[12px]" /></div>
                </div>
                <div><FL>Título do painel</FL><Input value={tab.title || ''} onChange={e => updateTab(i, { title: e.target.value })} className="h-8 text-[12px]" /></div>
                <div><FL>Descrição</FL><Textarea value={tab.description || ''} onChange={e => updateTab(i, { description: e.target.value })} rows={3} className="text-[12px] resize-none" /></div>
                <div><FL hint="Um por linha">Bullets (lista de pontos)</FL>
                  <Textarea value={(tab.bullets || []).join('\n')} onChange={e => updateTab(i, { bullets: e.target.value.split('\n').filter(Boolean) })} rows={3} className="text-[12px] resize-none" />
                </div>
                <div><FL>Imagem (URL)</FL><Input value={tab.imageUrl || ''} onChange={e => updateTab(i, { imageUrl: e.target.value })} placeholder="/uploads/img.jpg" className="h-8 text-[12px]" /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><FL>Texto do botão</FL><Input value={tab.ctaLabel || ''} onChange={e => updateTab(i, { ctaLabel: e.target.value })} placeholder="Saiba mais" className="h-8 text-[12px]" /></div>
                  <div><FL>Link</FL><Input value={tab.ctaLink || ''} onChange={e => updateTab(i, { ctaLink: e.target.value })} placeholder="/cliente" className="h-8 text-[12px]" /></div>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // COMPARISON_TABLE — editor com colunas + linhas
  // ════════════════════════════════════════════════════════════════════════
  if (block.type === 'comparison_table') {
    const cols = block.comparisonColumns || [];
    const rows = block.comparisonRows || [];
    const updateCol = (i: number, patch: Partial<NonNullable<PageBlock['comparisonColumns']>[number]>) => {
      const next = [...cols]; next[i] = { ...next[i], ...patch };
      set('comparisonColumns', next);
    };
    const updateRow = (i: number, patch: Partial<NonNullable<PageBlock['comparisonRows']>[number]>) => {
      const next = [...rows]; next[i] = { ...next[i], ...patch };
      set('comparisonRows', next);
    };
    const updateRowValue = (rowIdx: number, colIdx: number, value: boolean | string) => {
      const row = rows[rowIdx]; if (!row) return;
      const values = [...row.values]; values[colIdx] = value;
      updateRow(rowIdx, { values });
    };
    return (
      <div className="space-y-3">
        <AppearanceControls />
        <div><FL>Título</FL><Input value={block.title || ''} onChange={e => set('title', e.target.value)} className="h-9" /></div>
        <div><FL>Subtítulo</FL><Input value={block.subtitle || ''} onChange={e => set('subtitle', e.target.value)} className="h-9" /></div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-[#f5f5f7]">
          <div>
            <p className="text-[12px] font-semibold text-[#1d1d1f]">Agrupar por categoria</p>
            <p className="text-[11px] text-[#98989d]">Mostra headers das categorias entre linhas</p>
          </div>
          <Switch checked={block.comparisonShowCategories !== false} onCheckedChange={v => set('comparisonShowCategories', v)} />
        </div>

        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <FL>Colunas / produtos ({cols.length})</FL>
            <Button size="sm" variant="outline"
              onClick={() => {
                const newCols = [...cols, { name: 'Nova coluna' }];
                set('comparisonColumns', newCols);
                set('comparisonRows', rows.map(r => ({ ...r, values: [...r.values, false] })));
              }}
              className="h-7 text-[11px] gap-1">+ Coluna</Button>
          </div>
          {cols.map((c, i) => (
            <div key={i} className="rounded-xl border p-2 mb-2" style={{ borderColor: 'rgba(0,0,0,.08)' }}>
              <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                <Input value={c.name} onChange={e => updateCol(i, { name: e.target.value })} className="h-8 text-[12px]" />
                <button onClick={() => {
                  set('comparisonColumns', cols.filter((_, j) => j !== i));
                  set('comparisonRows', rows.map(r => ({ ...r, values: r.values.filter((_, j) => j !== i) })));
                }} className="p-1.5 text-red-400 hover:text-red-600"><Trash2 size={13} /></button>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Input value={c.badge || ''} onChange={e => updateCol(i, { badge: e.target.value })} placeholder="Badge (ex: 'Nossa solução')" className="h-7 text-[11px]" />
                <label className="flex items-center gap-1.5 text-[11px] cursor-pointer px-2">
                  <input type="checkbox" checked={!!c.highlighted} onChange={e => updateCol(i, { highlighted: e.target.checked })} />
                  <span>Destacar coluna</span>
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <FL>Linhas / features ({rows.length})</FL>
            <Button size="sm" variant="outline"
              onClick={() => set('comparisonRows', [...rows, { feature: 'Nova feature', values: cols.map(() => false) }])}
              className="h-7 text-[11px] gap-1">+ Linha</Button>
          </div>
          {rows.map((row, ri) => (
            <details key={ri} className="rounded-xl border mb-2" style={{ borderColor: 'rgba(0,0,0,.08)' }}>
              <summary className="cursor-pointer px-3 py-2 text-[12px] font-semibold flex items-center justify-between">
                <span>{row.feature || '(sem nome)'}</span>
                <button onClick={(e) => { e.preventDefault(); set('comparisonRows', rows.filter((_, j) => j !== ri)); }}
                  className="p-1 text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
              </summary>
              <div className="p-3 space-y-2 border-t" style={{ borderColor: 'rgba(0,0,0,.06)' }}>
                <div><FL>Feature</FL><Input value={row.feature} onChange={e => updateRow(ri, { feature: e.target.value })} className="h-8 text-[12px]" /></div>
                <div><FL hint="Agrupa linhas com mesmo valor">Categoria (opcional)</FL><Input value={row.category || ''} onChange={e => updateRow(ri, { category: e.target.value })} placeholder="Ex: Funcionalidades, Suporte, Custos" className="h-8 text-[12px]" /></div>
                <div><FL>Valor por coluna</FL>
                  <div className="space-y-1.5">
                    {cols.map((col, ci) => {
                      const val = row.values[ci];
                      const isBool = typeof val === 'boolean';
                      return (
                        <div key={ci} className="flex items-center gap-2">
                          <span className="text-[11px] font-medium text-[#6e6e73] w-32 truncate">{col.name}</span>
                          <div className="flex items-center gap-1">
                            <button onClick={() => updateRowValue(ri, ci, true)}
                              className="px-2 h-7 rounded text-[11px] font-bold"
                              style={{ background: val === true ? '#22c55e' : '#f5f5f7', color: val === true ? '#fff' : '#6e6e73' }}>✓</button>
                            <button onClick={() => updateRowValue(ri, ci, false)}
                              className="px-2 h-7 rounded text-[11px] font-bold"
                              style={{ background: val === false ? '#ef4444' : '#f5f5f7', color: val === false ? '#fff' : '#6e6e73' }}>✗</button>
                            <Input value={isBool ? '' : (val || '')} onChange={e => updateRowValue(ri, ci, e.target.value)} placeholder="Texto custom" className="h-7 text-[11px] flex-1" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    );
  }

  return <p className="text-[12px] text-[#98989d]">Sem editor para este tipo.</p>;
}

// ── Block card ────────────────────────────────────────────────────────────────

// ── Main PageBuilder Component ──────────────────────────────────────────────────

export function PageBuilder({
  blocks: rawBlocks,
  onChange,
  theme,
  onThemeChange,
}: {
  blocks: PageBlock[];
  onChange: (blocks: PageBlock[]) => void;
  theme?: PageTheme;
  onThemeChange?: (t: PageTheme) => void;
}) {
  // Garante que todos os blocos têm IDs únicos (blocos antigos podem não ter)
  const blocks = React.useMemo(() =>
    rawBlocks.map((b, i) => b.id ? b : { ...b, id: `${b.type || 'block'}-${i}-${Date.now()}` }),
    [rawBlocks]
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [showPatterns, setShowPatterns] = useState(false);
  const [showSnippets, setShowSnippets] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // ── Undo / Redo ─────────────────────────────────────────────────────────────
  const historyRef = useRef<PageBlock[][]>([blocks]);
  const historyIdxRef = useRef(0);
  const isTimeTravelRef = useRef(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const refreshUndoState = useCallback(() => {
    setCanUndo(historyIdxRef.current > 0);
    setCanRedo(historyIdxRef.current < historyRef.current.length - 1);
  }, []);

  // Wrap every mutation through handleChange so history is tracked
  const handleChange = useCallback((newBlocks: PageBlock[]) => {
    if (!isTimeTravelRef.current) {
      const trimmed = historyRef.current.slice(0, historyIdxRef.current + 1);
      trimmed.push(newBlocks);
      if (trimmed.length > 20) trimmed.shift();
      historyRef.current = trimmed;
      historyIdxRef.current = trimmed.length - 1;
      refreshUndoState();
    }
    onChange(newBlocks);
  }, [onChange, refreshUndoState]);

  const undo = useCallback(() => {
    if (historyIdxRef.current <= 0) return;
    historyIdxRef.current--;
    isTimeTravelRef.current = true;
    onChange(historyRef.current[historyIdxRef.current]);
    isTimeTravelRef.current = false;
    refreshUndoState();
  }, [onChange, refreshUndoState]);

  const redo = useCallback(() => {
    if (historyIdxRef.current >= historyRef.current.length - 1) return;
    historyIdxRef.current++;
    isTimeTravelRef.current = true;
    onChange(historyRef.current[historyIdxRef.current]);
    isTimeTravelRef.current = false;
    refreshUndoState();
  }, [onChange, refreshUndoState]);

  // Keyboard shortcuts: Ctrl+Z = undo, Ctrl+Y / Ctrl+Shift+Z = redo
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);

  // ── Snippets (blocos salvos) ─────────────────────────────────────────────────
  const [snippets, setSnippets] = useState<Snippet[]>(loadSnippets);

  const saveSnippet = useCallback((block: PageBlock, label: string) => {
    const snippet: Snippet = {
      id: `snippet-${Date.now()}`,
      label: label.trim() || BLOCK_CATALOG.find(c => c.type === block.type)?.label || block.type,
      emoji: BLOCK_CATALOG.find(c => c.type === block.type)?.emoji || '📦',
      blockType: block.type,
      block,
      createdAt: Date.now(),
    };
    const next = [snippet, ...snippets];
    setSnippets(next);
    persistSnippets(next);
  }, [snippets]);

  const deleteSnippet = useCallback((id: string) => {
    const next = snippets.filter(s => s.id !== id);
    setSnippets(next);
    persistSnippets(next);
  }, [snippets]);

  const insertSnippet = useCallback((snippet: Snippet) => {
    const freshBlock = { ...snippet.block, id: `${snippet.block.type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` };
    handleChange([...blocks, freshBlock]);
    setSelectedId(freshBlock.id);
    setShowSnippets(false);
  }, [blocks, handleChange]);

  const addBlock = (type: BlockType) => {
    const newBlock: PageBlock = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      visible: true,
      blockSpacing: 'normal',
      blockRadius: 'large',
      colorTheme: 'light',
      // Default design values
      titleColor: '#111827',
      subtitleColor: '#4b5563',
      bgColor: '#ffffff',
      ctaBgColor: '#2563eb',
      ctaTextColor: '#ffffff',
      titleSize: '32px',
      subtitleSize: '18px',
    };
    handleChange([...blocks, newBlock]);
    setSelectedId(newBlock.id);
  };

  const removeBlock = (id: string) => {
    handleChange(blocks.filter(b => b.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const updateBlock = (id: string, data: PageBlock) => {
    handleChange(blocks.map(b => b.id === id ? data : b));
  };

  const moveBlock = (from: number, to: number) => {
    const newBlocks = [...blocks];
    const [removed] = newBlocks.splice(from, 1);
    newBlocks.splice(to, 0, removed);
    handleChange(newBlocks);
  };

  const selectedBlock = blocks.find(b => b.id === selectedId);

  return (
    <div style={{ display: 'flex', height: '100%', background: '#f0f2f5', overflow: 'hidden', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Left Sidebar: Block List */}
      <div style={{ width: 280, borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', background: '#fff', zIndex: 10 }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Layers size={18} />
            </div>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>Estrutura</h2>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setShowPicker(true)}
              style={{ flex: 1, padding: '12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 12px rgba(37,99,235,0.2)' }}>
              <Plus size={16} /> Adicionar bloco
            </button>
            <button onClick={() => setShowPatterns(true)} title="Estruturas prontas"
              style={{ padding: '12px 14px', background: '#f97316', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(249,115,22,0.25)' }}>
              ⚡
            </button>
            <button onClick={() => setShowSnippets(true)} title="Meus snippets salvos"
              style={{ padding: '12px 14px', background: snippets.length > 0 ? '#7c3aed' : '#e2e8f0', color: snippets.length > 0 ? '#fff' : '#94a3b8', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: snippets.length > 0 ? '0 4px 12px rgba(124,58,237,0.25)' : 'none', position: 'relative' }}>
              <BookOpen size={15} />
              {snippets.length > 0 && (
                <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 16, height: 16, borderRadius: 8, background: '#7c3aed', border: '2px solid #fff', color: '#fff', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>
                  {snippets.length}
                </span>
              )}
            </button>
          </div>
          {/* Undo / Redo */}
          <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
            <button onClick={undo} disabled={!canUndo} title="Desfazer (Ctrl+Z)"
              style={{ flex: 1, height: 32, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: canUndo ? 'pointer' : 'not-allowed', opacity: canUndo ? 1 : 0.35, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#334155' }}>
              <Undo2 size={13} /> Desfazer
            </button>
            <button onClick={redo} disabled={!canRedo} title="Refazer (Ctrl+Y)"
              style={{ flex: 1, height: 32, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', cursor: canRedo ? 'pointer' : 'not-allowed', opacity: canRedo ? 1 : 0.35, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: '#334155' }}>
              <Redo2 size={13} /> Refazer
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }} className="custom-scrollbar">
          {blocks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
              <p style={{ fontSize: 13 }}>Sua página está vazia</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {blocks.map((block, index) => (
                <div key={block.id ?? index} onClick={() => setSelectedId(block.id)}
                  style={{
                    padding: '10px 12px', borderRadius: '10px', cursor: 'pointer', border: '1px solid',
                    background: selectedId === block.id ? '#f0f7ff' : '#fff',
                    borderColor: selectedId === block.id ? '#3b82f6' : '#f1f5f9',
                    transition: 'all 0.2s'
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <GripVertical size={14} color="#cbd5e1" />
                    <div style={{ width: 28, height: 28, borderRadius: '6px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                      {BLOCK_CATALOG.find(c => c.type === block.type)?.emoji || '📦'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: selectedId === block.id ? '#2563eb' : '#334155', margin: 0 }}>{BLOCK_CATALOG.find(c => c.type === block.type)?.label || block.type}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); updateBlock(block.id, { ...block, visible: !block.visible }); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                      {block.visible ? <Eye size={14} color="#64748b" /> : <EyeOff size={14} color="#cbd5e1" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center: Preview Canvas */}
      {/* IMPORTANTE: container externo NÃO scrolla (overflow:hidden + minHeight:0 pra
          flex respeitar limite). Só o body interno scrolla — caso contrário o
          scroll fica disputado entre dois containers e o user não consegue rolar. */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Canvas Header / Device Switcher — viewport toggle + label de largura */}
        <div style={{ height: 56, background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexShrink: 0, position: 'relative' }}>
          {([
            { mode: 'desktop', icon: Monitor, label: 'Desktop', width: '100%', widthLabel: '1280+' },
            { mode: 'tablet', icon: Tablet, label: 'Tablet', width: '768px', widthLabel: '768px' },
            { mode: 'mobile', icon: MobileIcon, label: 'Mobile', width: '375px', widthLabel: '375px' },
          ] as const).map(({ mode, icon: Icon, label, widthLabel }) => {
            const active = previewMode === mode;
            return (
              <button key={mode} onClick={() => setPreviewMode(mode)} title={`${label} (${widthLabel})`}
                style={{
                  padding: '6px 12px', borderRadius: 8, gap: 6,
                  background: active ? '#eff6ff' : 'transparent',
                  border: '1px solid', borderColor: active ? '#bfdbfe' : 'transparent',
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  color: active ? '#2563eb' : '#64748b', fontSize: 12, fontWeight: 600,
                  transition: 'all .15s',
                }}>
                <Icon size={15} />
                <span>{label}</span>
                {active && (
                  <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: '#dbeafe', color: '#1e40af', fontFamily: 'monospace' }}>
                    {widthLabel}
                  </span>
                )}
              </button>
            );
          })}
          {/* Indicador "ao vivo" — confirma que mudanças são refletidas em tempo real */}
          <div style={{ position: 'absolute', right: 16, display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#64748b' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 0 3px rgba(34,197,94,.15)' }} />
            <span>Preview ao vivo</span>
          </div>
        </div>

        <div style={{ flex: 1, padding: '40px 20px', overflowY: 'auto', overflowX: 'hidden' }}>
          <div style={{
            width: previewMode === 'desktop' ? '100%' : previewMode === 'tablet' ? '768px' : '375px',
            maxWidth: '100%',
            margin: '0 auto',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            background: '#fff',
            minHeight: 400,
            borderRadius: previewMode === 'desktop' ? '0' : '24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            border: previewMode === 'desktop' ? 'none' : '8px solid #1e293b'
          }}>
            {blocks.map((block, index) => (
              <div key={block.id ?? index} onClick={() => setSelectedId(block.id)}
                style={{ position: 'relative', cursor: 'pointer', outline: selectedId === block.id ? '2px solid #2563eb' : 'none', outlineOffset: '-2px' }}>
                <div style={{ opacity: block.visible === false ? 0.3 : 1 }}>
                  <BlockRenderer block={block} t={DEFAULT_T} />
                </div>
              </div>
            ))}
            {blocks.length === 0 && (
              <div style={{ height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', textAlign: 'center', padding: 40 }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <Plus size={32} color="#cbd5e1" />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1e293b', margin: '0 0 8px' }}>Comece sua página</h3>
                <p style={{ fontSize: 14, maxWidth: 280, margin: 0 }}>Adicione blocos do catálogo para construir sua landing page profissional.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar: Inspector */}
      <div style={{ width: 360, borderLeft: '1px solid #e2e8f0', background: '#fff', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
        {selectedBlock ? (
          <Inspector block={selectedBlock}
            onChange={(data: PageBlock) => updateBlock(selectedBlock.id, data)}
            onRemove={() => removeBlock(selectedBlock.id)}
            onMoveUp={() => {
              const idx = blocks.findIndex(b => b.id === selectedId);
              if (idx > 0) moveBlock(idx, idx - 1);
            }}
            onMoveDown={() => {
              const idx = blocks.findIndex(b => b.id === selectedId);
              if (idx < blocks.length - 1) moveBlock(idx, idx + 1);
            }}
            onDuplicate={() => {
              const idx = blocks.findIndex(b => b.id === selectedId);
              const newBlock = { ...selectedBlock, id: `${selectedBlock.type}-${Date.now()}` };
              const newBlocks = [...blocks];
              newBlocks.splice(idx + 1, 0, newBlock);
              handleChange(newBlocks);
            }}
            onSaveSnippet={(label: string) => saveSnippet(selectedBlock, label)}
            onClose={() => setSelectedId(null)}
            total={blocks.length}
            index={blocks.findIndex(b => b.id === selectedId)}
          />
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Settings size={28} color="#cbd5e1" />
            </div>
            <p style={{ fontSize: 13, fontWeight: 500 }}>Selecione um bloco para editar</p>
          </div>
        )}
      </div>

      {showPicker && <BlockPicker onAdd={addBlock} onClose={() => setShowPicker(false)} />}
      {showPatterns && <PatternPicker onApply={(newBlocks) => { handleChange([...blocks, ...newBlocks]); setShowPatterns(false); }} onClose={() => setShowPatterns(false)} />}
      {showSnippets && <SnippetPicker snippets={snippets} onInsert={insertSnippet} onDelete={deleteSnippet} onClose={() => setShowSnippets(false)} />}
    </div>
  );
}

// ── Inspector Component ─────────────────────────────────────────────────────────

function Inspector({ block, onChange, onRemove, onMoveUp, onMoveDown, onDuplicate, onSaveSnippet, onClose, total, index }: any) {
  const def = BLOCK_CATALOG.find(c => c.type === block.type);
  const [snippetLabel, setSnippetLabel] = useState('');
  const [showSaveSnippet, setShowSaveSnippet] = useState(false);

  const handleSaveSnippet = () => {
    onSaveSnippet(snippetLabel);
    setSnippetLabel('');
    setShowSaveSnippet(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '20px', borderBottom: '1px solid #f1f5f9', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 44, height: 44, borderRadius: '12px', background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
            {def?.emoji || '📦'}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 16, fontWeight: 900, color: '#0f172a', margin: 0 }}>{BLOCK_CATALOG.find(c => c.type === block.type)?.label || block.type}</h3>
            <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0', fontWeight: 600 }}>ORDEM: {index + 1} DE {total}</p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, background: '#f1f5f9', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onMoveUp} disabled={index === 0} style={{ flex: 1, height: 36, borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: index === 0 ? 'not-allowed' : 'pointer', opacity: index === 0 ? 0.3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MoveUp size={14} /></button>
          <button onClick={onMoveDown} disabled={index === total - 1} style={{ flex: 1, height: 36, borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: index === total - 1 ? 'not-allowed' : 'pointer', opacity: index === total - 1 ? 0.3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MoveDown size={14} /></button>
          <button onClick={onDuplicate} style={{ flex: 1, height: 36, borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Copy size={14} /></button>
          <button onClick={onRemove} style={{ flex: 1, height: 36, borderRadius: '8px', border: '1px solid #fee2e2', background: '#fff', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={14} /></button>
        </div>

        {/* Save as Snippet */}
        {!showSaveSnippet ? (
          <button onClick={() => setShowSaveSnippet(true)}
            style={{ width: '100%', height: 34, marginTop: 8, borderRadius: 10, border: '1px dashed #c4b5fd', background: '#faf5ff', color: '#7c3aed', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Bookmark size={13} /> Salvar como snippet
          </button>
        ) : (
          <div style={{ marginTop: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
            <input
              autoFocus
              value={snippetLabel}
              onChange={e => setSnippetLabel(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSaveSnippet(); if (e.key === 'Escape') setShowSaveSnippet(false); }}
              placeholder={BLOCK_CATALOG.find(c => c.type === block.type)?.label || 'Nome do snippet…'}
              style={{ flex: 1, height: 34, borderRadius: 8, border: '1px solid #c4b5fd', padding: '0 10px', fontSize: 12, outline: 'none', fontFamily: 'inherit', color: '#1d1d1f' }}
            />
            <button onClick={handleSaveSnippet}
              style={{ height: 34, paddingInline: 12, borderRadius: 8, border: 'none', background: '#7c3aed', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
              ✓
            </button>
            <button onClick={() => setShowSaveSnippet(false)}
              style={{ height: 34, paddingInline: 10, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer', fontSize: 12 }}>
              ✕
            </button>
          </div>
        )}
      </div>

      <Tabs defaultValue="content" className="flex-1 flex flex-col overflow-hidden">
        <div className="px-5 pt-4">
          <TabsList className="w-full grid grid-cols-2 bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="content" className="rounded-lg text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600">CONTEÚDO</TabsTrigger>
            <TabsTrigger value="design" className="rounded-lg text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-blue-600">DESIGN</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          <TabsContent value="content" className="m-0 space-y-6">
            <BlockContentEditor block={block} onChange={onChange} />
          </TabsContent>
          <TabsContent value="design" className="m-0 space-y-8">
            <BlockDesignEditor block={block} onChange={onChange} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

// ── Design Editor ────────────────────────────────────────────────────────────

const TITLE_SIZE_PRESETS: { v: string; label: string; px: string }[] = [
  { v: 'sm',  label: 'P',   px: 'clamp(1.1rem,2vw,1.5rem)' },
  { v: 'md',  label: 'M',   px: 'clamp(1.4rem,2.5vw,2rem)' },
  { v: 'lg',  label: 'G',   px: 'clamp(1.75rem,3.5vw,2.75rem)' },
  { v: 'xl',  label: 'GG',  px: 'clamp(2rem,4vw,3.5rem)' },
  { v: '2xl', label: 'Max', px: 'clamp(2.5rem,5vw,4.5rem)' },
];
const SUBTITLE_SIZE_PRESETS: { v: string; label: string; px: string }[] = [
  { v: 'sm', label: 'P', px: '0.9rem' },
  { v: 'md', label: 'M', px: '1.05rem' },
  { v: 'lg', label: 'G', px: '1.25rem' },
];
const CONTAINER_WIDTH_OPTS = [
  { v: 'narrow', label: 'Estreito', w: '640px' },
  { v: 'normal', label: 'Normal', w: '1100px' },
  { v: 'wide',   label: 'Largo',  w: '1400px' },
  { v: 'full',   label: 'Full',   w: '100%' },
];
const HAS_CTA = ['hero','cta','image_text','benefits','demo_form'];
const HAS_GRID = ['features','benefits','team','integrations','stats'];

function BlockDesignEditor({ block, onChange }: { block: PageBlock; onChange: (b: PageBlock) => void }) {
  const set = (k: string, v: any) => onChange({ ...block, [k]: v });
  const [openPanel, setOpenPanel] = React.useState<string | null>('cores');
  const toggle = (p: string) => setOpenPanel(openPanel === p ? null : p);

  const colorFields: { label: string; key: keyof PageBlock; default: string }[] = (() => {
    switch (block.type) {
      case 'hero':
        return [
          { label: 'Fundo', key: 'bgColor', default: '#0f1015' },
          { label: 'Título', key: 'titleColor', default: '#ffffff' },
          { label: 'Subtítulo', key: 'subtitleColor', default: 'rgba(255,255,255,0.7)' },
          { label: 'Botão (fundo)', key: 'ctaBgColor', default: '#f97316' },
          { label: 'Botão (texto)', key: 'ctaTextColor', default: '#ffffff' },
        ];
      case 'features':
        return [
          { label: 'Fundo', key: 'bgColor', default: '#0f1015' },
          { label: 'Título', key: 'titleColor', default: '#ffffff' },
          { label: 'Subtítulo', key: 'subtitleColor', default: 'rgba(255,255,255,0.7)' },
        ];
      case 'benefits':
        return [
          { label: 'Fundo', key: 'bgColor', default: '#0f1015' },
          { label: 'Título', key: 'titleColor', default: '#ffffff' },
          { label: 'Subtítulo', key: 'subtitleColor', default: 'rgba(255,255,255,0.7)' },
        ];
      case 'cta':
        return [
          { label: 'Fundo da seção', key: 'bgColor', default: 'transparent' },
          { label: 'Fundo do card', key: 'ctaBgColor', default: '#f97316' },
          { label: 'Título', key: 'titleColor', default: '#ffffff' },
          { label: 'Descrição', key: 'subtitleColor', default: 'rgba(255,255,255,0.8)' },
          { label: 'Botão (fundo)', key: 'ctaBtnBg', default: '#ffffff' },
          { label: 'Botão (texto)', key: 'ctaBtnText', default: '#f97316' },
        ];
      case 'steps':
        return [
          { label: 'Fundo', key: 'bgColor', default: '#ffffff' },
          { label: 'Título', key: 'titleColor', default: '#111827' },
          { label: 'Subtítulo', key: 'subtitleColor', default: '#4b5563' },
        ];
      case 'stats':
        return [
          { label: 'Fundo', key: 'bgColor', default: '#0f1015' },
          { label: 'Título', key: 'titleColor', default: '#ffffff' },
        ];
      case 'testimonial':
        return [
          { label: 'Fundo', key: 'bgColor', default: '#0f1015' },
          { label: 'Texto', key: 'titleColor', default: '#ffffff' },
          { label: 'Nome / Role', key: 'subtitleColor', default: 'rgba(255,255,255,0.7)' },
        ];
      case 'faq':
        return [
          { label: 'Fundo', key: 'bgColor', default: '#ffffff' },
          { label: 'Título', key: 'titleColor', default: '#111827' },
        ];
      case 'video':
        return [
          { label: 'Fundo', key: 'bgColor', default: '#0f1015' },
          { label: 'Título', key: 'titleColor', default: '#ffffff' },
        ];
      case 'text':
        return [
          { label: 'Fundo', key: 'bgColor', default: '#ffffff' },
          { label: 'Título', key: 'titleColor', default: '#111827' },
          { label: 'Texto', key: 'subtitleColor', default: '#4b5563' },
        ];
      case 'image_text':
        return [
          { label: 'Fundo', key: 'bgColor', default: '#0f1015' },
          { label: 'Título', key: 'titleColor', default: '#ffffff' },
          { label: 'Descrição', key: 'subtitleColor', default: 'rgba(255,255,255,0.7)' },
          { label: 'Botão (fundo)', key: 'ctaBgColor', default: '#f97316' },
          { label: 'Botão (texto)', key: 'ctaTextColor', default: '#ffffff' },
        ];
      case 'integrations':
        return [
          { label: 'Fundo', key: 'bgColor', default: '#ffffff' },
          { label: 'Título', key: 'titleColor', default: '#111827' },
        ];
      default:
        return [{ label: 'Fundo', key: 'bgColor', default: '#ffffff' }];
    }
  })();

  const DesignPanel = ({ id, emoji, label, children }: { id: string; emoji: string; label: string; children: React.ReactNode }) => {
    const open = openPanel === id;
    return (
      <div className="rounded-xl overflow-hidden border" style={{ borderColor: open ? '#f97316' : 'rgba(0,0,0,.08)' }}>
        <button onClick={() => toggle(id)} className="w-full flex items-center justify-between px-3 py-2.5 transition"
          style={{ background: open ? '#fff7ed' : '#f9f9fb' }}>
          <div className="flex items-center gap-2">
            <span className="text-base">{emoji}</span>
            <span className="text-[12px] font-bold" style={{ color: open ? '#f97316' : '#1d1d1f' }}>{label}</span>
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={open ? '#f97316' : '#8e8e93'} strokeWidth="2.5"
            style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {open && <div className="px-3 pb-3 pt-2 space-y-3 bg-white border-t" style={{ borderColor: 'rgba(249,115,22,.15)' }}>{children}</div>}
      </div>
    );
  };

  const align = block.titleAlign || 'center';
  const titleSz = block.titleSizePreset || 'lg';
  const subSz = block.subtitleSizePreset || 'md';
  const cWidth = block.containerWidth || 'normal';
  const ctaStyle = block.ctaStyle || 'filled';
  const ctaRadius = block.ctaRadius || 'rounded';
  const gridCols = block.gridColumns;

  return (
    <div className="space-y-2">

      {/* ── CORES ── */}
      <DesignPanel id="cores" emoji="🎨" label="Cores">
        {colorFields.map(f => (
          <ColorField key={f.key as string} label={f.label}
            value={(block[f.key] as string) || f.default}
            onChange={v => set(f.key as string, v)} />
        ))}
      </DesignPanel>

      {/* ── TIPOGRAFIA ── */}
      <DesignPanel id="typo" emoji="✍️" label="Tipografia">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#98989d' }}>Alinhamento</p>
          <div className="grid grid-cols-3 gap-1.5">
            {(['left','center','right'] as const).map(a => (
              <button key={a} onClick={() => set('titleAlign', a)}
                className="h-9 rounded-lg border-2 flex items-center justify-center gap-1 text-[11px] font-bold transition"
                style={{ borderColor: align === a ? '#f97316' : 'rgba(0,0,0,.08)', background: align === a ? '#fff7ed' : '#f9f9fb', color: align === a ? '#f97316' : '#6e6e73' }}>
                {a === 'left' ? '⬅ Esq' : a === 'center' ? '⬛ Centro' : 'Dir ➡'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#98989d' }}>Tamanho do título</p>
          <div className="grid grid-cols-5 gap-1">
            {TITLE_SIZE_PRESETS.map(p => (
              <button key={p.v} onClick={() => set('titleSizePreset', p.v)}
                className="h-9 rounded-lg border-2 flex items-center justify-center text-[11px] font-black transition"
                style={{ borderColor: titleSz === p.v ? '#f97316' : 'rgba(0,0,0,.08)', background: titleSz === p.v ? '#fff7ed' : '#f9f9fb', color: titleSz === p.v ? '#f97316' : '#6e6e73', fontSize: p.v === 'sm' ? 9 : p.v === 'md' ? 10 : p.v === 'lg' ? 11 : p.v === 'xl' ? 12 : 13 }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#98989d' }}>Tamanho do subtítulo</p>
          <div className="grid grid-cols-3 gap-1.5">
            {SUBTITLE_SIZE_PRESETS.map(p => (
              <button key={p.v} onClick={() => set('subtitleSizePreset', p.v)}
                className="h-9 rounded-lg border-2 flex items-center justify-center text-[11px] font-bold transition"
                style={{ borderColor: subSz === p.v ? '#f97316' : 'rgba(0,0,0,.08)', background: subSz === p.v ? '#fff7ed' : '#f9f9fb', color: subSz === p.v ? '#f97316' : '#6e6e73' }}>
                {p.label === 'P' ? 'Pequeno' : p.label === 'M' ? 'Médio' : 'Grande'}
              </button>
            ))}
          </div>
        </div>
      </DesignPanel>

      {/* ── CONTAINER ── */}
      <DesignPanel id="container" emoji="📦" label="Largura do Container">
        <div className="grid grid-cols-2 gap-1.5">
          {CONTAINER_WIDTH_OPTS.map(o => (
            <button key={o.v} onClick={() => set('containerWidth', o.v)}
              className="h-12 rounded-lg border-2 flex flex-col items-center justify-center gap-0.5 transition"
              style={{ borderColor: cWidth === o.v ? '#f97316' : 'rgba(0,0,0,.08)', background: cWidth === o.v ? '#fff7ed' : '#f9f9fb' }}>
              <div style={{ width: o.v === 'narrow' ? 24 : o.v === 'normal' ? 36 : o.v === 'wide' ? 48 : 56, height: 4, borderRadius: 2, background: cWidth === o.v ? '#f97316' : '#c7c7cc' }} />
              <span className="text-[10px] font-bold" style={{ color: cWidth === o.v ? '#f97316' : '#6e6e73' }}>{o.label}</span>
              <span className="text-[9px]" style={{ color: '#98989d' }}>{o.w}</span>
            </button>
          ))}
        </div>
      </DesignPanel>

      {/* ── BOTÃO CTA (condicional) ── */}
      {HAS_CTA.includes(block.type) && (
        <DesignPanel id="cta_btn" emoji="🔘" label="Botão CTA">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#98989d' }}>Estilo</p>
            <div className="grid grid-cols-2 gap-1.5">
              {([
                { v: 'filled',   label: 'Sólido',    preview: { bg: '#f97316', border: '#f97316', color: '#fff' } },
                { v: 'outlined', label: 'Contorno',  preview: { bg: 'transparent', border: '#f97316', color: '#f97316' } },
                { v: 'ghost',    label: 'Fantasma',  preview: { bg: 'rgba(249,115,22,.1)', border: 'transparent', color: '#f97316' } },
                { v: 'gradient', label: 'Gradiente', preview: { bg: 'linear-gradient(90deg,#f97316,#ea580c)', border: 'transparent', color: '#fff' } },
              ] as const).map(s => (
                <button key={s.v} onClick={() => set('ctaStyle', s.v)}
                  className="h-10 rounded-lg border-2 flex items-center justify-center gap-2 transition text-[11px] font-bold"
                  style={{ borderColor: ctaStyle === s.v ? '#f97316' : 'rgba(0,0,0,.08)', background: ctaStyle === s.v ? '#fff7ed' : '#f9f9fb', color: ctaStyle === s.v ? '#f97316' : '#6e6e73' }}>
                  <span style={{ width: 20, height: 14, borderRadius: 4, background: s.preview.bg, border: `1.5px solid ${s.preview.border}`, display: 'inline-block', flexShrink: 0 }} />
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#98989d' }}>Forma</p>
            <div className="grid grid-cols-3 gap-1.5">
              {([
                { v: 'normal',  label: 'Quadrado', r: 6 },
                { v: 'rounded', label: 'Arredondado', r: 12 },
                { v: 'pill',    label: 'Pílula', r: 999 },
              ] as const).map(s => (
                <button key={s.v} onClick={() => set('ctaRadius', s.v)}
                  className="h-10 rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition"
                  style={{ borderColor: ctaRadius === s.v ? '#f97316' : 'rgba(0,0,0,.08)', background: ctaRadius === s.v ? '#fff7ed' : '#f9f9fb' }}>
                  <div style={{ width: 28, height: 10, borderRadius: s.r, background: ctaRadius === s.v ? '#f97316' : '#c7c7cc' }} />
                  <span className="text-[9px] font-bold" style={{ color: ctaRadius === s.v ? '#f97316' : '#6e6e73' }}>{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        </DesignPanel>
      )}

      {/* ── COLUNAS (condicional) ── */}
      {HAS_GRID.includes(block.type) && (
        <DesignPanel id="grid" emoji="⊞" label="Colunas do Grid">
          <div className="grid grid-cols-4 gap-1.5">
            {([1, 2, 3, 4] as const).map(n => (
              <button key={n} onClick={() => set('gridColumns', gridCols === n ? undefined : n)}
                className="h-12 rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition"
                style={{ borderColor: gridCols === n ? '#f97316' : 'rgba(0,0,0,.08)', background: gridCols === n ? '#fff7ed' : '#f9f9fb' }}>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${n},1fr)`, gap: 2, width: 28 }}>
                  {Array.from({ length: n }).map((_, i) => (
                    <div key={i} style={{ height: 10, borderRadius: 2, background: gridCols === n ? '#f97316' : '#c7c7cc' }} />
                  ))}
                </div>
                <span className="text-[10px] font-bold" style={{ color: gridCols === n ? '#f97316' : '#6e6e73' }}>{n} col{n > 1 ? 's' : ''}</span>
              </button>
            ))}
          </div>
          <p className="text-[10px]" style={{ color: '#98989d' }}>Sem seleção = automático (responsivo)</p>
        </DesignPanel>
      )}

      {/* ── ESPAÇAMENTO ── */}
      <DesignPanel id="spacing" emoji="📐" label="Espaçamento e Cantos">
        <SpacingRadiusControls block={block} onChange={onChange} />
      </DesignPanel>

    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
      <Label className="text-xs font-bold text-slate-600">{label}</Label>
      <div className="flex items-center gap-2">
        <div className="relative w-8 h-8 rounded-lg border border-slate-200 overflow-hidden shadow-sm">
          <input type="color" value={value} onChange={e => onChange(e.target.value)} className="absolute inset-0 w-full h-full cursor-pointer opacity-0" />
          <div style={{ background: value }} className="w-full h-full" />
        </div>
        <Input value={value} onChange={e => onChange(e.target.value)} className="w-20 h-8 text-[10px] font-mono p-1 text-center rounded-md border-slate-200" />
      </div>
    </div>
  );
}

// ── Content Editor — delegates to V3 BlockEditor ────────────────────────────

function BlockContentEditor({ block, onChange }: { block: PageBlock; onChange: (b: PageBlock) => void }) {
  return <BlockEditor block={block} onChange={onChange} />;
}

// ── Block Picker Modal ──────────────────────────────────────────────────────────

function BlockPicker({ onAdd, onClose }: { onAdd: (type: BlockType) => void; onClose: () => void }) {
  const [search, setSearch] = useState('');
  const filtered = BLOCK_CATALOG.filter(c => c.label.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#fff', borderRadius: '24px', width: '100%', maxWidth: 640, maxHeight: '85vh', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: 0 }}>Adicionar Bloco</h2>
              <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>Escolha um componente para sua página</p>
            </div>
            <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: '12px', border: 'none', background: '#f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><X size={20} /></button>
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input type="text" placeholder="Buscar blocos..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: 14, outline: 'none' }} />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, background: '#f8fafc' }} className="custom-scrollbar">
          {filtered.map(def => (
            <button key={def.type} onClick={() => { onAdd(def.type); onClose(); }}
              style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px', borderRadius: '18px', background: '#fff', border: '1px solid #e2e8f0', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#2563eb'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 15px -3px rgba(37,99,235,0.1)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)'; }}
            >
              <div style={{ width: 48, height: 48, borderRadius: '14px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{def.emoji}</div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', margin: 0 }}>{def.label}</p>
                <p style={{ fontSize: 11, color: '#64748b', marginTop: 4, lineHeight: 1.4 }}>{def.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Pattern Picker — Estruturas prontas ────────────────────────────────────────

function mkId(type: string) {
  return `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

const PATTERNS: { id: string; label: string; emoji: string; desc: string; blocks: () => PageBlock[] }[] = [
  {
    id: 'erp_completo',
    label: 'ERP Completo',
    emoji: '🏭',
    desc: 'Página de venda de sistema ERP — do problema à solução, com prova social',
    blocks: () => [
      {
        id: mkId('hero'), type: 'hero', visible: true, blockSpacing: 'normal', blockRadius: 'large', colorTheme: 'dark',
        title: 'Controle total da sua empresa em um só sistema', subtitle: 'Estoque, financeiro, compras, vendas e relatórios integrados — sem planilhas, sem retrabalho.',
        ctaText: 'Ver demonstração gratuita', ctaUrl: '#contato', heroLayout: 'centered_dark',
        titleColor: '#ffffff', subtitleColor: '#94a3b8', bgColor: '#0f172a', ctaBgColor: '#f97316', ctaTextColor: '#ffffff',
        titleSize: '46px', subtitleSize: '19px', blockStyle: 'fluid'
      },
      {
        id: mkId('stats'), type: 'stats', visible: true, blockSpacing: 'compact', blockRadius: 'large', colorTheme: 'dark',
        bgColor: '#f97316', titleColor: '#ffffff',
        stats: [
          { value: '+3.200', label: 'Empresas usando' },
          { value: '98%', label: 'Taxa de retenção' },
          { value: '30 dias', label: 'Para implantar' },
          { value: '24/7', label: 'Suporte incluso' },
        ], blockStyle: 'fluid'
      },
      {
        id: mkId('features'), type: 'features', visible: true, blockSpacing: 'normal', blockRadius: 'large', colorTheme: 'dark',
        title: 'Módulos que cobrem toda a operação', subtitle: 'Cada área do seu negócio integrada e comunicando em tempo real',
        featuresLayout: 'split_dark',
        items: [
          'Gestão de Estoque com alertas de mínimo e máximo',
          'Financeiro completo: contas a pagar, receber e fluxo de caixa',
          'Compras com cotação e aprovação por alçada',
          'Vendas com CRM integrado e histórico de cliente',
          'Fiscal: NF-e, NFC-e, SPED e obrigações acessórias',
          'Relatórios gerenciais e dashboards em tempo real',
        ], blockStyle: 'fluid'
      },
      {
        id: mkId('image_text'), type: 'image_text', visible: true, blockSpacing: 'normal', blockRadius: 'large', colorTheme: 'light',
        title: 'Do pedido ao faturamento sem digitar duas vezes', subtitle: 'O pedido de venda vira NF-e automaticamente, baixa o estoque, lança no financeiro e notifica o cliente — tudo em segundos.',
        ctaText: 'Ver como funciona', ctaUrl: '#contato', blockStyle: 'fluid'
      },
      {
        id: mkId('steps'), type: 'steps', visible: true, blockSpacing: 'normal', blockRadius: 'large', colorTheme: 'light',
        title: 'Implementação sem dor de cabeça',
        steps: [
          { number: '01', title: 'Migração dos seus dados', description: 'Importamos clientes, produtos, estoque e histórico do sistema atual sem perda.' },
          { number: '02', title: 'Treinamento da equipe', description: 'Treinamento online ao vivo para todos os usuários, gravado para quem não puder.' },
          { number: '03', title: 'Go-live com suporte', description: 'Acompanhamento nos primeiros 30 dias para garantir zero interrupção na operação.' },
        ], blockStyle: 'fluid'
      },
      {
        id: mkId('testimonial'), type: 'testimonial', visible: true, blockSpacing: 'normal', blockRadius: 'large', colorTheme: 'light',
        quote: 'Antes levávamos 3 dias para fechar o balanço mensal. Com o ERP, fechamos no mesmo dia. A visibilidade do negócio mudou completamente.',
        author: 'Roberto Carvalho', role: 'Diretor Financeiro', company: 'Distribuidora Carvalho & Filhos', blockStyle: 'fluid'
      },
      {
        id: mkId('faq'), type: 'faq', visible: true, blockSpacing: 'normal', blockRadius: 'large', colorTheme: 'light',
        title: 'Dúvidas comuns sobre o ERP',
        faq: [
          { question: 'Funciona para qual segmento de empresa?', answer: 'Atendemos indústria, comércio e distribuição de pequeno a grande porte. O sistema é parametrizável para o seu ramo.' },
          { question: 'É possível migrar do meu sistema atual?', answer: 'Sim. Nossa equipe faz a migração completa de dados — clientes, fornecedores, produtos, histórico financeiro e estoque.' },
          { question: 'Quanto tempo leva para estar funcionando?', answer: 'Em média 30 dias para implantação completa, com todas as parametrizações e integrações fiscais.' },
          { question: 'O sistema emite NF-e e NFC-e?', answer: 'Sim, emissão nativa de NF-e, NFC-e, NFS-e, CT-e e MDF-e, com transmissão direta para SEFAZ.' },
        ], blockStyle: 'fluid'
      },
      {
        id: mkId('cta'), type: 'cta', visible: true, blockSpacing: 'normal', blockRadius: 'large', colorTheme: 'dark',
        title: 'Seu concorrente já pode estar usando', subtitle: 'Agende uma demonstração e veja o ERP funcionando com dados do seu negócio',
        ctaText: 'Agendar demo gratuita', ctaUrl: '#contato', ctaLayout: 'centered',
        bgColor: '#0f172a', titleColor: '#ffffff', subtitleColor: '#94a3b8', ctaBgColor: '#f97316', ctaTextColor: '#ffffff',
        blockStyle: 'fluid'
      },
    ],
  },
  {
    id: 'emissor_fiscal',
    label: 'Emissor Fiscal',
    emoji: '🧾',
    desc: 'NF-e, NFC-e, NFS-e — página focada em quem precisa emitir nota rápido',
    blocks: () => [
      {
        id: mkId('hero'), type: 'hero', visible: true, blockSpacing: 'normal', blockRadius: 'large', colorTheme: 'dark',
        title: 'Emita NF-e, NFC-e e NFS-e em segundos', subtitle: 'Sem mensalidade por documento. Sem limite de emissão. Integrado com a SEFAZ de todos os estados.',
        ctaText: 'Testar grátis por 15 dias', ctaUrl: '#contato', heroLayout: 'centered_dark',
        titleColor: '#ffffff', subtitleColor: '#94a3b8', bgColor: '#1e293b', ctaBgColor: '#f97316', ctaTextColor: '#ffffff',
        titleSize: '44px', subtitleSize: '18px', blockStyle: 'fluid'
      },
      {
        id: mkId('features'), type: 'features', visible: true, blockSpacing: 'normal', blockRadius: 'large', colorTheme: 'dark',
        title: 'Tudo que um emissor precisa ter', subtitle: 'Funcionalidades que o contador e o operador vão agradecer',
        featuresLayout: 'checklist',
        items: [
          'NF-e, NFC-e, NFS-e, CT-e e MDF-e em uma só plataforma',
          'Transmissão direta para SEFAZ com contingência automática',
          'DANFE, DACTE e DANFCE personalizados com logo da empresa',
          'Importação de XML de terceiros e manifestação do destinatário',
          'Inutilização, cancelamento e carta de correção via sistema',
          'Relatórios fiscais: SPED, EFD, registro de entradas e saídas',
          'API para integração com ERP, e-commerce e PDV',
          'Multiempresa: gerencie todas as CNPJs em uma conta',
        ], blockStyle: 'fluid'
      },
      {
        id: mkId('image_text'), type: 'image_text', visible: true, blockSpacing: 'normal', blockRadius: 'large', colorTheme: 'light',
        title: 'Do cadastro do produto à nota emitida em menos de 1 minuto', subtitle: 'Interface pensada para quem emite dezenas de notas por dia. Atalhos de teclado, preenchimento automático e histórico de clientes agilizam cada emissão.',
        blockStyle: 'fluid'
      },
      {
        id: mkId('stats'), type: 'stats', visible: true, blockSpacing: 'compact', blockRadius: 'large', colorTheme: 'dark',
        bgColor: '#1e293b', titleColor: '#ffffff',
        stats: [
          { value: '1M+', label: 'Documentos emitidos/mês' },
          { value: '99,9%', label: 'Uptime garantido' },
          { value: '< 3s', label: 'Retorno da SEFAZ' },
          { value: '27 UFs', label: 'Estados atendidos' },
        ], blockStyle: 'fluid'
      },
      {
        id: mkId('testimonial'), type: 'testimonial', visible: true, blockSpacing: 'normal', blockRadius: 'large', colorTheme: 'light',
        quote: 'Emitíamos nota por um sistema lento que travava na SEFAZ. Com o novo emissor, zero problema de contingência e o suporte resolve na hora.',
        author: 'Marcos Teixeira', role: 'Contador', company: 'Teixeira Contabilidade', blockStyle: 'fluid'
      },
      {
        id: mkId('faq'), type: 'faq', visible: true, blockSpacing: 'normal', blockRadius: 'large', colorTheme: 'light',
        title: 'Perguntas sobre o emissor',
        faq: [
          { question: 'Precisa instalar algum programa?', answer: '100% web. Acesse de qualquer navegador, computador ou tablet, sem instalação.' },
          { question: 'Como funciona o certificado digital?', answer: 'Compatível com certificado A1 e A3. Fazemos o upload e toda a configuração junto com você.' },
          { question: 'E se a SEFAZ ficar fora do ar?', answer: 'O sistema entra em contingência automática (EPEC/FS-DA) e transmite os documentos assim que a SEFAZ voltar.' },
          { question: 'Tem limite de emissão por mês?', answer: 'Não. Emita quantos documentos precisar sem custo adicional por nota.' },
        ], blockStyle: 'fluid'
      },
      {
        id: mkId('cta'), type: 'cta', visible: true, blockSpacing: 'normal', blockRadius: 'large', colorTheme: 'dark',
        title: 'Comece a emitir hoje mesmo', subtitle: '15 dias grátis, sem cartão de crédito',
        ctaText: 'Criar conta gratuita', ctaUrl: '#contato', ctaLayout: 'centered',
        bgColor: '#f97316', titleColor: '#ffffff', subtitleColor: 'rgba(255,255,255,0.9)', ctaBgColor: '#0f172a', ctaTextColor: '#ffffff',
        blockStyle: 'fluid'
      },
    ],
  },
  {
    id: 'pdv_frente_caixa',
    label: 'PDV / Frente de Caixa',
    emoji: '🖥️',
    desc: 'Página de PDV para varejo, restaurante ou serviço — foco em velocidade e NFC-e',
    blocks: () => [
      {
        id: mkId('hero'), type: 'hero', visible: true, blockSpacing: 'normal', blockRadius: 'large', colorTheme: 'dark',
        title: 'PDV rápido, offline e com NFC-e automática', subtitle: 'Fecha venda, emite cupom fiscal e atualiza o estoque em segundos — mesmo sem internet.',
        ctaText: 'Solicitar demonstração', ctaUrl: '#contato', heroLayout: 'centered_dark',
        titleColor: '#ffffff', subtitleColor: '#94a3b8', bgColor: '#0f172a', ctaBgColor: '#f97316', ctaTextColor: '#ffffff',
        titleSize: '44px', subtitleSize: '18px', blockStyle: 'fluid'
      },
      {
        id: mkId('features'), type: 'features', visible: true, blockSpacing: 'normal', blockRadius: 'large', colorTheme: 'dark',
        title: 'Funciona para o seu tipo de negócio', subtitle: 'Do pet shop à loja de roupa, do restaurante à farmácia',
        featuresLayout: 'split_dark',
        items: [
          'Venda por código de barras, balança ou busca rápida',
          'NFC-e automática com contingência offline',
          'Sangria, suprimento e fechamento de caixa com relatório',
          'Múltiplas formas de pagamento: dinheiro, cartão, Pix e crediário',
          'Integração com TEF e maquininhas Cielo, Rede, Stone e Getnet',
          'Controle de mesas e comandas para restaurante e bar',
          'Programa de fidelidade e desconto por cliente cadastrado',
          'Sincronização com ERP para estoque e financeiro em tempo real',
        ], blockStyle: 'fluid'
      },
      {
        id: mkId('steps'), type: 'steps', visible: true, blockSpacing: 'normal', blockRadius: 'large', colorTheme: 'light',
        title: 'Começa a vender no mesmo dia',
        steps: [
          { number: '01', title: 'Instale o PDV', description: 'Windows, Linux ou Android. Instala em minutos e já vem com o certificado configurado.' },
          { number: '02', title: 'Cadastre os produtos', description: 'Importe da planilha ou cadastre manualmente com foto, código de barras e tributação.' },
          { number: '03', title: 'Abra o caixa', description: 'Defina o troco inicial e comece a vender. Simples assim.' },
        ], blockStyle: 'fluid'
      },
      {
        id: mkId('image_text'), type: 'image_text', visible: true, blockSpacing: 'normal', blockRadius: 'large', colorTheme: 'light',
        title: 'Sem internet? O caixa não para', subtitle: 'O PDV funciona 100% offline e sincroniza automaticamente quando a conexão voltar. Nenhuma venda perdida, nenhum cliente esperando.',
        blockStyle: 'fluid'
      },
      {
        id: mkId('testimonial'), type: 'testimonial', visible: true, blockSpacing: 'normal', blockRadius: 'large', colorTheme: 'light',
        quote: 'A internet caiu na Black Friday e o caixa continuou vendendo normalmente. Quando voltou, todas as notas foram transmitidas sozinhas. Salvou o dia.',
        author: 'Fernanda Lima', role: 'Proprietária', company: 'Boutique Fernanda Lima', blockStyle: 'fluid'
      },
      {
        id: mkId('integrations'), type: 'integrations', visible: true, blockSpacing: 'normal', blockRadius: 'large', colorTheme: 'light',
        title: 'Integra com quem você já usa',
        items: ['Cielo', 'Rede', 'Stone', 'Getnet', 'PagSeguro', 'Mercado Pago', 'iFood', 'Rappi'],
        blockStyle: 'fluid'
      },
      {
        id: mkId('cta'), type: 'cta', visible: true, blockSpacing: 'normal', blockRadius: 'large', colorTheme: 'dark',
        title: 'Pronto para um caixa que nunca trava?', subtitle: 'Demonstração online em 30 minutos com o seu segmento',
        ctaText: 'Agendar demonstração', ctaUrl: '#contato', ctaLayout: 'centered',
        bgColor: '#0f172a', titleColor: '#ffffff', subtitleColor: '#94a3b8', ctaBgColor: '#f97316', ctaTextColor: '#ffffff',
        blockStyle: 'fluid'
      },
    ],
  },
  {
    id: 'gestao_comercial',
    label: 'Gestão Comercial',
    emoji: '📊',
    desc: 'CRM + Pedidos + Força de vendas — para quem vende B2B ou tem representantes',
    blocks: () => [
      {
        id: mkId('hero'), type: 'hero', visible: true, blockSpacing: 'normal', blockRadius: 'large', colorTheme: 'dark',
        title: 'Sua equipe de vendas no controle, de qualquer lugar', subtitle: 'Pedidos, clientes, metas e comissões — tudo acessível pelo celular do representante.',
        ctaText: 'Testar agora', ctaUrl: '#contato', heroLayout: 'centered_dark',
        titleColor: '#ffffff', subtitleColor: '#94a3b8', bgColor: '#1e293b', ctaBgColor: '#f97316', ctaTextColor: '#ffffff',
        titleSize: '44px', subtitleSize: '18px', blockStyle: 'fluid'
      },
      {
        id: mkId('features'), type: 'features', visible: true, blockSpacing: 'normal', blockRadius: 'large', colorTheme: 'dark',
        title: 'Da prospecção ao faturamento', subtitle: 'Seu funil de vendas integrado com o back office',
        featuresLayout: 'highlight_list',
        items: [
          'Cadastro de clientes com histórico completo de compras e contatos',
          'Emissão de pedido pelo app mobile com catálogo atualizado',
          'Aprovação de desconto e alçada por hierarquia de vendas',
          'Acompanhamento de metas por vendedor, região e produto',
          'Cálculo automático de comissão com regras flexíveis',
          'Faturamento direto do pedido aprovado para NF-e no ERP',
        ], blockStyle: 'fluid'
      },
      {
        id: mkId('stats'), type: 'stats', visible: true, blockSpacing: 'compact', blockRadius: 'large', colorTheme: 'dark',
        bgColor: '#1e293b', titleColor: '#ffffff',
        stats: [
          { value: '+35%', label: 'Aumento médio nas vendas' },
          { value: '-70%', label: 'Menos pedidos com erro' },
          { value: '2x', label: 'Mais visitas por dia' },
          { value: '0 papel', label: 'Processo 100% digital' },
        ], blockStyle: 'fluid'
      },
      {
        id: mkId('testimonial'), type: 'testimonial', visible: true, blockSpacing: 'normal', blockRadius: 'large', colorTheme: 'light',
        quote: 'Nossos representantes passaram a fechar pedido na hora da visita, pelo celular. O faturamento aumentou 40% no primeiro trimestre.',
        author: 'Paulo Henrique', role: 'Gerente Comercial', company: 'Distribuidora Henrique & Cia', blockStyle: 'fluid'
      },
      {
        id: mkId('cta'), type: 'cta', visible: true, blockSpacing: 'normal', blockRadius: 'large', colorTheme: 'dark',
        title: 'Veja sua equipe vendendo mais em 30 dias', subtitle: 'Implantação rápida e treinamento incluído',
        ctaText: 'Falar com consultor', ctaUrl: '#contato', ctaLayout: 'centered',
        bgColor: '#f97316', titleColor: '#ffffff', subtitleColor: 'rgba(255,255,255,0.9)', ctaBgColor: '#0f172a', ctaTextColor: '#ffffff',
        blockStyle: 'fluid'
      },
    ],
  },
  {
    id: 'financeiro_contabil',
    label: 'Financeiro & Contábil',
    emoji: '💰',
    desc: 'Página focada em gestão financeira, DRE, conciliação e obrigações fiscais',
    blocks: () => [
      {
        id: mkId('hero'), type: 'hero', visible: true, blockSpacing: 'normal', blockRadius: 'large', colorTheme: 'dark',
        title: 'Feche o mês sem estresse', subtitle: 'DRE, fluxo de caixa, conciliação bancária e SPED — tudo gerado automaticamente pelo sistema.',
        ctaText: 'Ver como funciona', ctaUrl: '#contato', heroLayout: 'centered_dark',
        titleColor: '#ffffff', subtitleColor: '#94a3b8', bgColor: '#0f172a', ctaBgColor: '#f97316', ctaTextColor: '#ffffff',
        titleSize: '46px', subtitleSize: '19px', blockStyle: 'fluid'
      },
      {
        id: mkId('features'), type: 'features', visible: true, blockSpacing: 'normal', blockRadius: 'large', colorTheme: 'dark',
        title: 'Controle financeiro de verdade', subtitle: 'Não é só lançamento — é visão gerencial em tempo real',
        featuresLayout: 'dark_cards',
        items: [
          'Contas a pagar e receber com alerta de vencimento',
          'Fluxo de caixa projetado com base em pedidos e contratos',
          'Conciliação bancária automática via OFX e Open Finance',
          'DRE, Balanço e DLPA gerados com um clique',
          'Centros de custo e rateio por departamento ou projeto',
          'SPED Fiscal, SPED Contábil e ECF sem retrabalho',
        ], blockStyle: 'fluid'
      },
      {
        id: mkId('image_text'), type: 'image_text', visible: true, blockSpacing: 'normal', blockRadius: 'large', colorTheme: 'light',
        title: 'Seu contador acessa direto, sem exportar planilha', subtitle: 'O módulo contábil permite acesso exclusivo para o escritório de contabilidade, com visão dos lançamentos, exportação do SPED e relatórios fiscais.',
        blockStyle: 'fluid'
      },
      {
        id: mkId('testimonial'), type: 'testimonial', visible: true, blockSpacing: 'normal', blockRadius: 'large', colorTheme: 'light',
        quote: 'O DRE que antes levava 3 dias para fechar agora está pronto no dia 1. Conseguimos tomar decisões muito mais rápido.',
        author: 'Cristiane Borges', role: 'CFO', company: 'Grupo Borges Industrial', blockStyle: 'fluid'
      },
      {
        id: mkId('cta'), type: 'cta', visible: true, blockSpacing: 'normal', blockRadius: 'large', colorTheme: 'dark',
        title: 'Pare de fechar o mês na força do ódio', subtitle: 'Veja uma demonstração com cenários do seu negócio',
        ctaText: 'Quero uma demo', ctaUrl: '#contato', ctaLayout: 'centered',
        bgColor: '#0f172a', titleColor: '#ffffff', subtitleColor: '#94a3b8', ctaBgColor: '#f97316', ctaTextColor: '#ffffff',
        blockStyle: 'fluid'
      },
    ],
  },
];

// ── Snippet Picker Modal ──────────────────────────────────────────────────────

function SnippetPicker({ snippets, onInsert, onDelete, onClose }: {
  snippets: Snippet[];
  onInsert: (s: Snippet) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 560, maxHeight: '85vh', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '24px 24px 18px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#f5f3ff', border: '1px solid #ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={20} color="#7c3aed" />
              </div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: 0 }}>Meus Snippets</h2>
                <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>Blocos salvos para reutilizar em qualquer página</p>
              </div>
            </div>
            <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 12, border: 'none', background: '#f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }} className="custom-scrollbar">
          {snippets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔖</div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#334155', margin: '0 0 6px' }}>Nenhum snippet salvo ainda</p>
              <p style={{ fontSize: 12, margin: 0 }}>Selecione um bloco no editor e clique em "Salvar como snippet" para criar sua biblioteca pessoal.</p>
            </div>
          ) : (
            snippets.map(s => (
              <div key={s.id}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 14, background: '#f8fafc', border: '1.5px solid #e2e8f0', transition: 'border-color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#c4b5fd')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#e2e8f0')}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: '#fff', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {s.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</p>
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0', fontWeight: 500 }}>
                    {BLOCK_CATALOG.find(c => c.type === s.blockType)?.label || s.blockType} · {new Date(s.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => onInsert(s)}
                    style={{ height: 34, paddingInline: 14, borderRadius: 10, border: 'none', background: '#7c3aed', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Plus size={13} /> Inserir
                  </button>
                  {confirmDelete === s.id ? (
                    <>
                      <button onClick={() => { onDelete(s.id); setConfirmDelete(null); }}
                        style={{ height: 34, paddingInline: 12, borderRadius: 10, border: 'none', background: '#ef4444', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                        Confirmar
                      </button>
                      <button onClick={() => setConfirmDelete(null)}
                        style={{ height: 34, paddingInline: 10, borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer', fontSize: 12 }}>
                        ✕
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setConfirmDelete(s.id)}
                      style={{ height: 34, width: 34, borderRadius: 10, border: '1px solid #fee2e2', background: '#fff', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid #f1f5f9', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>
            {snippets.length} snippet{snippets.length !== 1 ? 's' : ''} salvo{snippets.length !== 1 ? 's' : ''}
          </p>
          <button onClick={onClose}
            style={{ height: 36, paddingInline: 20, borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Pattern Picker Modal ──────────────────────────────────────────────────────

function PatternPicker({ onApply, onClose }: { onApply: (blocks: PageBlock[]) => void; onClose: () => void }) {
  const [selected, setSelected] = React.useState<string | null>(null);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 660, maxHeight: '88vh', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff7ed', border: '1px solid #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚡</div>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: 0 }}>Estruturas Prontas</h2>
              </div>
              <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Escolha uma estrutura e personalize depois — os blocos serão adicionados à sua página</p>
            </div>
            <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 12, border: 'none', background: '#f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', flexShrink: 0 }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }} className="custom-scrollbar">
          {PATTERNS.map(p => {
            const isSelected = selected === p.id;
            return (
              <button key={p.id} onClick={() => setSelected(isSelected ? null : p.id)}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 18px', borderRadius: 16, background: isSelected ? '#fff7ed' : '#f8fafc', border: `2px solid ${isSelected ? '#f97316' : '#e2e8f0'}`, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', width: '100%' }}
                onMouseEnter={e => { if (!isSelected) { (e.currentTarget as HTMLElement).style.borderColor = '#f97316'; (e.currentTarget as HTMLElement).style.background = '#fff7ed'; } }}
                onMouseLeave={e => { if (!isSelected) { (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLElement).style.background = '#f8fafc'; } }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: isSelected ? '#f97316' : '#fff', border: `1px solid ${isSelected ? '#f97316' : '#e2e8f0'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, transition: 'all 0.15s' }}>
                  {p.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <p style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>{p.label}</p>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#f97316', background: '#fff7ed', border: '1px solid #fed7aa', padding: '2px 8px', borderRadius: 20 }}>
                      {p.blocks().length} blocos
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0, lineHeight: 1.5 }}>{p.desc}</p>
                </div>
                {isSelected && <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="12" height="9" viewBox="0 0 12 9" fill="none"><path d="M1 4L4.5 7.5L11 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 10, background: '#fff' }}>
          <button onClick={onClose}
            style={{ flex: 1, height: 44, borderRadius: 12, border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            Cancelar
          </button>
          <button
            disabled={!selected}
            onClick={() => { const p = PATTERNS.find(x => x.id === selected); if (p) onApply(p.blocks()); }}
            style={{ flex: 2, height: 44, borderRadius: 12, border: 'none', background: selected ? '#f97316' : '#e2e8f0', color: selected ? '#fff' : '#94a3b8', fontWeight: 800, fontSize: 14, cursor: selected ? 'pointer' : 'not-allowed', transition: 'all 0.15s', boxShadow: selected ? '0 4px 12px rgba(249,115,22,0.3)' : 'none' }}>
            {selected ? `✅ Usar "${PATTERNS.find(x => x.id === selected)?.label}"` : 'Selecione uma estrutura'}
          </button>
        </div>
      </div>
    </div>
  );
}