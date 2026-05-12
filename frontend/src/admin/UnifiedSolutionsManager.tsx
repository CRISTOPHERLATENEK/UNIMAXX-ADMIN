// UnifiedSolutionsManager — Lean: card + page builder (blocks_json only) + SEO
import { ImageUploadField, SPECS as IMAGE_SPECS, resolveImg } from '@/components/ImageUploadField';
import React, { useState, useEffect } from 'react';
import {
  Plus, Pencil, Trash2, Save, X, RefreshCw, ExternalLink,
  ChevronRight, ChevronDown, Eye, EyeOff, Check, Search, AlertCircle,
  Building2, Monitor, ShoppingCart, CreditCard, Truck, FileText,
  Shield, Clock, HeadphonesIcon, Award, Rocket, Target, TrendingUp, Lock, Users, Wifi, Database, Code,
  Quote, Sparkles, Puzzle, Layout, ArrowLeft,
  BarChart3, Globe, Settings, Zap, Package, Star, Layers,
  Hash, Link2, Phone, CheckSquare,
  HelpCircle, PlayCircle, Camera, ListOrdered,
  Image as ImageIcon,
  LayoutGrid, Blocks, Type, MoreHorizontal, ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { PageBuilder } from './PageBuilder';
import type { PageBlock } from './PageBuilder';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { HomeSectionModal } from '@/admin/HomeSectionModal';
import { HOME_SECTION_CONFIGS } from '@/admin/homeSectionConfigs';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { AdminPage, AdminTopbar, AdminEmptyState } from '@/components/admin/primitives';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import { GripVertical } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const BASE_URL = API_URL.replace(/\/api\/?$/, '');
const authH = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' });

// ── Types ──────────────────────────────────────────────────────────────────
interface UnifiedSolution {
  // Card fields
  solution_id: string;
  title: string;
  description: string;
  features: string[];
  cta_text: string;
  icon: string;
  image: string;
  order_num: number;
  active: number;
  nav_link: string;
  // Page fields (lean)
  pg_id?: number;
  pg_color_theme: string;
  pg_meta_title: string;
  pg_meta_description: string;
  pg_is_active: boolean;
  pg_blocks: PageBlock[];
}

const EMPTY: UnifiedSolution = {
  solution_id: '', title: '', description: '', features: [],
  cta_text: 'Saiba mais', icon: 'Building2', image: '', order_num: 0,
  active: 1, nav_link: '',
  pg_color_theme: 'orange',
  pg_meta_title: '', pg_meta_description: '', pg_is_active: true,
  pg_blocks: [],
};

const ICON_OPTIONS = [
  { v: 'Building2', I: Building2, label: 'Empresa' },
  { v: 'ShoppingCart', I: ShoppingCart, label: 'Loja' },
  { v: 'CreditCard', I: CreditCard, label: 'Pagamento' },
  { v: 'Truck', I: Truck, label: 'Entrega' },
  { v: 'FileText', I: FileText, label: 'Documento' },
  { v: 'BarChart3', I: BarChart3, label: 'Gráfico' },
  { v: 'Globe', I: Globe, label: 'Web' },
  { v: 'Monitor', I: Monitor, label: 'Monitor' },
  { v: 'Settings', I: Settings, label: 'Config' },
  { v: 'Zap', I: Zap, label: 'Rápido' },
  { v: 'Package', I: Package, label: 'Pacote' },
  { v: 'Star', I: Star, label: 'Destaque' },
  { v: 'Layers', I: Layers, label: 'Camadas' },
];

const COLOR_OPTIONS = [
  { v: 'orange', label: 'Laranja', hex: '#f97316' },
  { v: 'blue', label: 'Azul', hex: '#2563eb' },
  { v: 'green', label: 'Verde', hex: '#16a34a' },
  { v: 'purple', label: 'Roxo', hex: '#9333ea' },
  { v: 'black', label: 'Preto', hex: '#1f2937' },
  { v: 'white', label: 'Branco', hex: '#94a3b8' },
];

// ── Score de completude ─────────────────────────────────────────────────────
// Calcula o quão "pronta" está uma solução. Retorna percentual + lista do que
// falta, separado em "Card" (carousel/header) e "Página" (landing page).
//
// Filosofia: campos OBRIGATÓRIOS visíveis ao usuário final pesam mais.
// Campos opcionais (nav_link, pg_blocks específicos) não entram no cálculo.
type SolutionChecklistItem = { ok: boolean; label: string; tab?: 'card' | 'construtor' | 'seo' };
type SolutionCompleteness = {
  card: { score: number; total: number; pct: number; items: SolutionChecklistItem[] };
  page: { score: number; total: number; pct: number; items: SolutionChecklistItem[] };
  overall: number; // 0-100, peso 50/50 entre card e página
};

function getCompleteness(s: UnifiedSolution): SolutionCompleteness {
  const cardItems: SolutionChecklistItem[] = [
    { ok: !!s.title?.trim(), label: 'Título', tab: 'card' },
    { ok: !!s.description?.trim(), label: 'Descrição curta', tab: 'card' },
    { ok: !!s.image?.trim(), label: 'Foto do card', tab: 'card' },
    { ok: !!s.icon?.trim(), label: 'Ícone', tab: 'card' },
    { ok: !!s.cta_text?.trim(), label: 'Texto do botão (CTA)', tab: 'card' },
    { ok: (s.features?.length ?? 0) >= 2, label: '≥ 2 features (lista de pontos)', tab: 'card' },
  ];
  const pageItems: SolutionChecklistItem[] = [
    { ok: (s.pg_blocks?.length ?? 0) >= 1, label: 'Pelo menos 1 bloco na página', tab: 'construtor' },
    { ok: (s.pg_blocks?.length ?? 0) >= 3, label: 'Página com 3+ blocos (recomendado)', tab: 'construtor' },
    { ok: !!s.pg_meta_title?.trim(), label: 'Meta título (SEO)', tab: 'seo' },
    { ok: !!s.pg_meta_description?.trim(), label: 'Meta descrição (SEO)', tab: 'seo' },
    { ok: !!s.pg_is_active, label: 'Página marcada como ativa', tab: 'card' },
  ];
  const cardScore = cardItems.filter(i => i.ok).length;
  const pageScore = pageItems.filter(i => i.ok).length;
  return {
    card: { score: cardScore, total: cardItems.length, pct: Math.round(100 * cardScore / cardItems.length), items: cardItems },
    page: { score: pageScore, total: pageItems.length, pct: Math.round(100 * pageScore / pageItems.length), items: pageItems },
    overall: Math.round((cardScore / cardItems.length + pageScore / pageItems.length) * 50),
  };
}

// ── Reusable list editor ────────────────────────────────────────────────────
function ListEditor({ items, onChange, placeholder }: {
  items: string[]; onChange: (v: string[]) => void; placeholder?: string;
}) {
  const [draft, setDraft] = useState('');
  const add = () => { const v = draft.trim(); if (v) { onChange([...items, v]); setDraft(''); } };
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2 group">
          <div className="flex-1 flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] text-[#1d1d1f]"
            style={{ background: '#f5f5f7' }}>
            <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[11px] font-bold flex-shrink-0"
              style={{ color: '#98989d' }}>{i + 1}</span>
            <span className="flex-1 leading-snug">{item}</span>
          </div>
          <button onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition opacity-0 group-hover:opacity-100"
            style={{ color: '#c7c7cc' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#ef4444'; (e.currentTarget as HTMLElement).style.background = '#fef2f2'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#c7c7cc'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
            <X style={{ width: 13, height: 13 }} />
          </button>
        </div>
      ))}
      <div className="flex gap-2">
        <Input value={draft} onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder || 'Adicionar item...'}
          className="h-9 text-[13px]"
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} />
        <Button size="sm" variant="outline" onClick={add} className="h-9 px-3 flex-shrink-0">
          <Plus style={{ width: 14, height: 14 }} />
        </Button>
      </div>
    </div>
  );
}

// ── Accordion section ───────────────────────────────────────────────────────
function Section({ icon: Icon, title, subtitle, defaultOpen = true, accent = '#f97316', children }: {
  icon: React.ElementType; title: string; subtitle: string;
  defaultOpen?: boolean; accent?: string; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'rgba(0,0,0,.07)' }}>
      <button className="w-full flex items-center gap-3.5 p-4 text-left transition-colors hover:bg-gray-50"
        onClick={() => setOpen(v => !v)}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${accent}12` }}>
          <Icon style={{ width: 16, height: 16, color: accent }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[#1d1d1f] text-sm">{title}</p>
          <p className="text-[12px] text-[#98989d] truncate">{subtitle}</p>
        </div>
        {open
          ? <ChevronDown style={{ width: 15, height: 15, color: '#98989d', flexShrink: 0 }} />
          : <ChevronRight style={{ width: 15, height: 15, color: '#98989d', flexShrink: 0 }} />}
      </button>
      {open && (
        <div className="border-t p-5 space-y-4 bg-white" style={{ borderColor: 'rgba(0,0,0,.06)' }}>
          {children}
        </div>
      )}
    </div>
  );
}

function FL({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5">
      <Label className="text-[12px] font-semibold text-[#1d1d1f]">{children}</Label>
      {hint && <p className="text-[11px] text-[#98989d] mt-0.5">{hint}</p>}
    </div>
  );
}

const TABS = [
  { id: 'card', label: 'Card', desc: 'Card do carousel', Icon: LayoutGrid },
  { id: 'construtor', label: 'Construtor', desc: 'Page Builder', Icon: Blocks },
  { id: 'seo', label: 'SEO', desc: 'Meta tags', Icon: Search },
] as const;

// ── Componente: Badge de completude com tooltip ────────────────────────────
// Substitui o badge "📄 X blocos" antigo por algo que comunica saúde da
// solução de forma escaneável (cor + percentual) e revela detalhes ao hover.
function CompletenessBadge({ completeness }: { completeness: SolutionCompleteness }) {
  const { card, page, overall } = completeness;
  const allDone = card.pct === 100 && page.pct === 100;

  // Cor segue semáforo: <50 vermelho, 50-79 âmbar, 80-99 azul, 100 verde
  const tone = allDone
    ? { bg: '#dcfce7', fg: '#15803d', dot: '#22c55e' }
    : overall >= 80
      ? { bg: '#dbeafe', fg: '#1e40af', dot: '#3b82f6' }
      : overall >= 50
        ? { bg: '#fef3c7', fg: '#a16207', dot: '#f59e0b' }
        : { bg: '#fee2e2', fg: '#b91c1c', dot: '#ef4444' };

  const label = allDone ? 'Completa' : `${overall}%`;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold cursor-help"
            style={{ background: tone.bg, color: tone.fg }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: tone.dot }} />
            {label}
          </span>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="start" className="max-w-xs p-0 overflow-hidden">
          <div className="p-3 bg-white">
            <p className="text-[11px] font-bold text-[#1d1d1f] mb-2">
              Completude da solução
            </p>
            <ChecklistColumn label="Card (carousel)" data={card} />
            <div className="h-px bg-gray-100 my-2" />
            <ChecklistColumn label="Página (landing)" data={page} />
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function ChecklistColumn({
  label, data,
}: {
  label: string;
  data: { score: number; total: number; pct: number; items: SolutionChecklistItem[] };
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-semibold text-[#6e6e73] uppercase tracking-wider">{label}</span>
        <span className="text-[10px] font-bold text-[#1d1d1f] tabular-nums">{data.score}/{data.total}</span>
      </div>
      <ul className="space-y-1">
        {data.items.map((item, i) => (
          <li key={i} className="flex items-start gap-1.5 text-[11px]">
            {item.ok
              ? <Check className="w-3 h-3 mt-0.5 text-green-600 flex-shrink-0" />
              : <X className="w-3 h-3 mt-0.5 text-gray-300 flex-shrink-0" />}
            <span className={item.ok ? 'text-[#6e6e73]' : 'text-[#1d1d1f] font-medium'}>
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Linha sortable da lista (B3) ────────────────────────────────────────────
// Extraída pra wrappear com dnd-kit. Precisa receber tudo via props porque
// está fora do escopo do componente principal.
interface SortableSolutionRowProps {
  sol: UnifiedSolution;
  idx: number;
  onEdit: () => void;
  onGoToBuilder: () => void;
  onDelete: () => void;
}
function SortableSolutionRow({
  sol, idx, onEdit, onGoToBuilder, onDelete,
}: SortableSolutionRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: sol.solution_id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };
  const themeHex = COLOR_OPTIONS.find(c => c.v === sol.pg_color_theme)?.hex || '#f97316';
  const hasPage = !!sol.pg_id;
  const cardImg = resolveImg(sol.image);
  const IconComp = ICON_OPTIONS.find(i => i.v === sol.icon)?.I || Building2;
  const orderLabel = idx + 1;
  const completeness = getCompleteness(sol);

  return (
    <div ref={setNodeRef} style={style}
      className="bg-white rounded-2xl border overflow-hidden transition-shadow hover:shadow-md group"
      {...{ 'data-dragging': isDragging || undefined }}
      // borda só pra style-lookup; cor real é inline
    >
      <div className="flex items-center gap-3 p-4">
        {/* Drag handle — só esse elemento ativa o drag */}
        <button
          {...attributes}
          {...listeners}
          className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-gray-500 transition cursor-grab active:cursor-grabbing flex-shrink-0"
          title="Arrastar para reordenar"
          aria-label="Reordenar"
        >
          <GripVertical style={{ width: 16, height: 16 }} />
        </button>

        {/* Barra colorida + número de ordem */}
        <div className="flex flex-col items-center gap-1.5 self-stretch flex-shrink-0">
          <div className="w-1 flex-1 rounded-full" style={{ background: themeHex, minHeight: 24 }} />
          <span className="text-[10px] font-bold tabular-nums" style={{ color: '#c7c7cc', fontFamily: 'monospace' }}>
            #{orderLabel}
          </span>
        </div>

        <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center"
          style={{ background: cardImg ? undefined : `linear-gradient(135deg,${themeHex}22,${themeHex}44)`, borderColor: 'rgba(0,0,0,.07)' }}>
          {cardImg
            ? <img src={cardImg} alt="" className="w-full h-full object-cover" />
            : <IconComp style={{ width: 26, height: 26, color: themeHex }} />
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-bold text-[#1d1d1f] text-[15px]" style={{ fontFamily: "'Outfit',sans-serif" }}>
              {sol.title}
            </h3>
            <Badge className={`text-[10px] border-0 px-2 py-0.5 ${sol.active === 1 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {sol.active === 1 ? 'Ativo' : 'Inativo'}
            </Badge>

            <CompletenessBadge completeness={completeness} />

            {!hasPage && (
              <button onClick={onGoToBuilder}
                className="flex items-center gap-1 text-[10px] font-medium border-0 px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 hover:bg-amber-200 transition cursor-pointer"
                title="Clique para abrir o Construtor e adicionar blocos">
                <AlertCircle style={{ width: 10, height: 10 }} />
                Sem página
                <ArrowRight style={{ width: 10, height: 10 }} />
              </button>
            )}
          </div>
          <p className="text-[12px] truncate" style={{ color: '#98989d' }}>
            /solucao-page/{sol.solution_id}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <a href={`/solucao-page/${sol.solution_id}`} target="_blank" rel="noreferrer"
            className="w-8 h-8 rounded-xl flex items-center justify-center transition"
            style={{ color: '#98989d', background: '#f5f5f7' }}
            title="Abrir página em nova aba"
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#e5e5ea'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#f5f5f7'; }}>
            <ExternalLink style={{ width: 14, height: 14 }} />
          </a>
          <button onClick={onEdit}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-semibold transition"
            style={{ background: `${themeHex}10`, color: themeHex }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = `${themeHex}20`; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = `${themeHex}10`; }}>
            <Pencil style={{ width: 13, height: 13 }} /> Editar
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-8 h-8 rounded-xl flex items-center justify-center transition"
                style={{ color: '#98989d', background: '#f5f5f7' }}
                title="Mais opções"
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#e5e5ea'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#f5f5f7'; }}>
                <MoreHorizontal style={{ width: 14, height: 14 }} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onEdit} className="gap-2 cursor-pointer">
                <Pencil style={{ width: 13, height: 13 }} /> Editar
              </DropdownMenuItem>
              {!hasPage && (
                <DropdownMenuItem onClick={onGoToBuilder} className="gap-2 cursor-pointer">
                  <Blocks style={{ width: 13, height: 13 }} /> Adicionar blocos
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="gap-2 cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50">
                <Trash2 style={{ width: 13, height: 13 }} /> Mover para Lixeira
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

// ── EDITOR ──────────────────────────────────────────────────────────────────
function Editor({ initial, isNew, onSave, onBack, onDirtyChange }: {
  initial: UnifiedSolution; isNew: boolean;
  onSave: (data: UnifiedSolution) => Promise<void>;
  onBack: () => void;
  /** Reporta dirty state pro pai — usado pelo Sheet pra pedir confirmação ao fechar */
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const [form, setForm] = useState<UnifiedSolution>(initial);
  const [tab, setTab] = useState<string>(() => {
    // Permite que a lista abra editor já no construtor (ex: clicando "Sem página")
    const hint = sessionStorage.getItem('solution_initial_tab');
    if (hint) sessionStorage.removeItem('solution_initial_tab');
    return hint || 'card';
  });
  const [saving, setSaving] = useState(false);
  const [uploadingCard, setUploadingCard] = useState(false);
  const { toast } = useToast();

  // ── Dirty state (B2) ─────────────────────────────────────────────────────
  // Detecta mudanças não salvas comparando estado atual vs inicial.
  // Mapeia campos → tabs para mostrar dot vermelho na tab certa.
  const FIELDS_BY_TAB: Record<string, (keyof UnifiedSolution)[]> = {
    card: ['title', 'solution_id', 'description', 'features', 'cta_text', 'icon', 'image', 'order_num', 'active', 'nav_link', 'pg_color_theme', 'pg_is_active'],
    construtor: ['pg_blocks'],
    seo: ['pg_meta_title', 'pg_meta_description'],
  };
  const dirtyTabs = React.useMemo(() => {
    const dirty = new Set<string>();
    for (const [tabId, fields] of Object.entries(FIELDS_BY_TAB)) {
      for (const f of fields) {
        if (JSON.stringify(form[f]) !== JSON.stringify(initial[f])) {
          dirty.add(tabId);
          break;
        }
      }
    }
    return dirty;
  }, [form, initial]);
  const isDirty = dirtyTabs.size > 0;

  // Reporta dirty state pro pai (usado pelo Sheet pra confirmar fechamento)
  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  // beforeunload — avisa se usuário tentar fechar/recarregar com mudanças
  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ''; // Chrome/Edge: required to trigger
      return '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  // Voltar com confirmação se houver mudanças
  const handleBack = () => {
    if (isDirty && !confirm('Você tem alterações não salvas. Sair sem salvar?')) return;
    onBack();
  };

  // Atalho Cmd+S / Ctrl+S — salva sem precisar mover o mouse
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (isDirty || isNew) handleSave();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty, isNew, form]);

  const set = <K extends keyof UnifiedSolution>(k: K, v: UnifiedSolution[K]) =>
    setForm(p => ({ ...p, [k]: v }));

  const autoId = (title: string) => {
    if (!isNew) return;
    set('solution_id', title.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-'));
  };

  const uploadImg = async (file: File, field: 'image', setUpl: (v: boolean) => void) => {
    setUpl(true);
    try {
      const fd = new FormData(); fd.append('image', file);
      const res = await fetch(`${API_URL}/admin/upload`, {
        method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, body: fd,
      });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      set(field, url);
      toast({ title: '✅ Imagem enviada!' });
    } catch { toast({ title: 'Erro no upload', variant: 'destructive' }); }
    finally { setUpl(false); }
  };

  // fix #7 — validação por campo com destaque visual
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  const handleSave = async () => {
    const errors: Record<string, string> = {};
    if (!form.title.trim()) errors.title = 'Título é obrigatório';
    if (!form.solution_id.trim()) errors.solution_id = 'ID da solução é obrigatório';
    if (!form.description.trim()) errors.description = 'Descrição é obrigatória';
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast({ title: 'Corrija os campos destacados', variant: 'destructive' });
      return;
    }
    setFieldErrors({});
    setSaving(true);
    try { await onSave(form); }
    catch (e: any) { toast({ title: e?.message || 'Erro ao salvar', variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  const themeHex = COLOR_OPTIONS.find(c => c.v === form.pg_color_theme)?.hex || '#f97316';

  // IMPORTANTE: dentro de Sheet, NÃO usar minHeight: 100vh (gera duplo-scroll).
  // height: 100% basta — Sheet já é 100vh. minHeight: 0 permite filho com flex:1 + overflow rolar.
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflow: 'hidden' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b bg-white flex-shrink-0"
        style={{ borderColor: 'rgba(0,0,0,.07)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="flex items-center gap-3">
          <button onClick={handleBack}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition"
            style={{ background: '#f5f5f7', color: '#6e6e73' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#e5e5ea'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#f5f5f7'; }}>
            <ArrowLeft style={{ width: 15, height: 15 }} />
          </button>
          <div className="flex items-center gap-2">
            <div>
              <h2 className="font-bold text-[#1d1d1f] text-[15px]" style={{ fontFamily: "'Outfit',sans-serif" }}>
                {isNew ? 'Nova Solução' : form.title || 'Editar Solução'}
              </h2>
              <p className="text-[11px]" style={{ color: '#98989d' }}>
                /solucao-page/{form.solution_id || 'id-aqui'}
              </p>
            </div>
            {/* Indicador "alterações não salvas" — discreto mas visível (B2) */}
            {isDirty && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-700">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Não salvo
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <a href={`/solucao-page/${form.solution_id}`} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium transition"
              style={{ color: '#6e6e73', background: '#f5f5f7' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#e5e5ea'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#f5f5f7'; }}>
              <ExternalLink style={{ width: 13, height: 13 }} /> Preview
            </a>
          )}
          <Button onClick={handleSave} disabled={saving || (!isDirty && !isNew)} size="sm"
            className="gap-1.5 font-bold px-5 rounded-xl h-9 transition-all"
            style={{
              background: isDirty || isNew ? '#f97316' : '#e5e5ea',
              color: isDirty || isNew ? '#fff' : '#98989d',
              border: 'none',
              boxShadow: isDirty || isNew ? '0 0 0 3px rgba(249,115,22,.15)' : 'none',
            }}
            title={
              saving ? 'Salvando…'
              : isDirty ? 'Salvar alterações (Cmd+S)'
              : isNew ? 'Criar solução'
              : 'Nada para salvar'
            }>
            {saving
              ? <><RefreshCw style={{ width: 14, height: 14 }} className="animate-spin" /> Salvando…</>
              : <><Save style={{ width: 14, height: 14 }} /> {isDirty ? 'Salvar alterações' : 'Salvar'}</>}
          </Button>
        </div>
      </div>

      {/* Tabs — ícones lucide + dot vermelho indicando tabs com alterações (B2) */}
      <div className="flex border-b bg-white flex-shrink-0 px-5 gap-1"
        style={{ borderColor: 'rgba(0,0,0,.07)', overflowX: 'auto' }}>
        {TABS.map(t => {
          const Icon = t.Icon;
          const active = tab === t.id;
          const isDirtyTab = dirtyTabs.has(t.id);
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-3.5 py-3 text-[13px] font-medium whitespace-nowrap transition border-b-2 relative"
              style={{
                borderBottomColor: active ? '#f97316' : 'transparent',
                color: active ? '#f97316' : '#6e6e73',
              }}>
              <Icon style={{ width: 14, height: 14 }} />
              {t.label}
              {isDirtyTab && (
                <span
                  className="w-1.5 h-1.5 rounded-full bg-amber-500"
                  title="Esta seção tem alterações não salvas"
                  style={{ animation: 'pulse 2s ease-in-out infinite' }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ═══ TAB: CONSTRUTOR — ocupa 100% da área disponível ═══ */}
      {tab === 'construtor' && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* Header do construtor */}
          <div className="px-5 py-3 border-b flex items-center justify-between flex-shrink-0"
            style={{ borderColor: 'rgba(0,0,0,.07)', background: '#fff' }}>
            <div>
              <p className="font-bold text-sm text-[#1d1d1f]">Construtor de página</p>
              <p className="text-[11px]" style={{ color: '#98989d' }}>
                Monte a página bloco a bloco — cada bloco é uma seção independente.
                {form.pg_blocks.length > 0 && ` · ${form.pg_blocks.filter(b => b.visible).length}/${form.pg_blocks.length} visíveis`}
              </p>
            </div>
            {form.pg_blocks.length > 0 && !form.pg_is_active && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                Página inativa
              </span>
            )}
          </div>
          {/* PageBuilder esticado para preencher todo o espaço restante */}
          <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', padding: '16px', display: 'flex', flexDirection: 'column' }}>
            <PageBuilder
              blocks={form.pg_blocks}
              onChange={blocks => set('pg_blocks', blocks)}
            />
          </div>
        </div>
      )}

      {/* Todas as outras abas — layout estreito/scrollável normal */}
      {tab !== 'construtor' && (
      <div className="flex-1 overflow-y-auto" style={{ background: '#fafafa' }}>
        <div className="max-w-2xl mx-auto p-5 pb-16 space-y-4">

          {/* ═══ TAB: CARD ═══ */}
          {tab === 'card' && (
            <>
              <Section icon={Layout} title="Identidade do Card" subtitle="Título, ID, ícone e cor de tema" defaultOpen>
                <div className="space-y-4">
                  <div>
                    <FL hint="Aparece no card e no header de soluções">Título da Solução *</FL>
                    <Input value={form.title}
                      onChange={(e) => { set('title', e.target.value); autoId(e.target.value); setFieldErrors(p => ({ ...p, title: '' })); }}
                      placeholder="Ex: Maxx ERP" className={`h-10 ${fieldErrors.title ? 'border-red-500' : ''}`} />
                    {fieldErrors.title && <p className="text-xs text-red-500 mt-1">{fieldErrors.title}</p>}
                  </div>
                  <div>
                    <FL hint="Usado na URL: /solucao-page/{id}">ID da Solução *</FL>
                    <div className="flex items-center">
                      <span className="px-3 h-10 flex items-center text-[12px] bg-[#f5f5f7] border border-r-0 rounded-l-xl flex-shrink-0"
                        style={{ borderColor: 'rgba(0,0,0,.1)', color: '#98989d' }}>
                        /solucao-page/
                      </span>
                      <Input value={form.solution_id}
                        onChange={(e) => { set('solution_id', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); setFieldErrors(p => ({ ...p, solution_id: '' })); }}
                        placeholder="maxx-erp" className={`h-10 rounded-l-none flex-1 ${fieldErrors.solution_id ? 'border-red-500' : ''}`} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Icon picker */}
                    <div>
                      <FL>Ícone</FL>
                      <div className="grid grid-cols-4 gap-1.5">
                        {ICON_OPTIONS.map(({ v, I, label }) => (
                          <button key={v} title={label} onClick={() => set('icon', v)}
                            className="p-2 rounded-xl flex flex-col items-center gap-1 transition"
                            style={{ background: form.icon === v ? '#f97316' : '#f5f5f7', color: form.icon === v ? '#fff' : '#6e6e73' }}>
                            <I style={{ width: 16, height: 16 }} />
                            <span style={{ fontSize: 9, fontWeight: 600, lineHeight: 1 }}>{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Color picker */}
                    <div>
                      <FL>Cor do Tema</FL>
                      <div className="grid grid-cols-3 gap-1.5">
                        {COLOR_OPTIONS.map(({ v, label, hex }) => (
                          <button key={v} onClick={() => set('pg_color_theme', v)}
                            className="p-2.5 rounded-xl flex flex-col items-center gap-1.5 border-2 transition"
                            style={{ borderColor: form.pg_color_theme === v ? hex : 'transparent', background: '#f5f5f7' }}>
                            <div className="w-5 h-5 rounded-full" style={{ background: hex }} />
                            <span style={{ fontSize: 10, fontWeight: 500, color: '#6e6e73' }}>{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Active card */}
                  <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: '#f5f5f7' }}>
                    <div>
                      <p className="text-[13px] font-semibold text-[#1d1d1f]">Solução ativa</p>
                      <p className="text-[11px]" style={{ color: '#98989d' }}>Aparece no site e no header</p>
                    </div>
                    <Switch checked={form.active === 1} onCheckedChange={(v) => set('active', v ? 1 : 0)} />
                  </div>
                  {/* Active page */}
                  <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: '#f5f5f7' }}>
                    <div>
                      <p className="text-[13px] font-semibold text-[#1d1d1f]">Página ativa</p>
                      <p className="text-[11px]" style={{ color: '#98989d' }}>Visível para visitantes</p>
                    </div>
                    <Switch checked={form.pg_is_active} onCheckedChange={(v) => set('pg_is_active', v)} />
                  </div>
                </div>
              </Section>

              <Section icon={ImageIcon} title="Foto do Card" subtitle="Imagem de fundo no carousel (opcional)" defaultOpen>
                <ImageUploadField
                  value={form.image}
                  onChange={(url) => set('image', url)}
                  onUpload={(f) => uploadImg(f, 'image', setUploadingCard)}
                  uploading={uploadingCard}
                  spec={IMAGE_SPECS.solutionCard}
                  height={160}
                  placeholder="Clique para enviar foto do card"
                />
              </Section>

              <Section icon={FileText} title="Texto do Card" subtitle="Descrição curta e botão CTA" defaultOpen>
                <div className="space-y-3">
                  <div>
                    <FL>Descrição curta</FL>
                    <Textarea value={form.description} onChange={(e) => set('description', e.target.value)}
                      placeholder="Breve descrição exibida no modal ao clicar no card"
                      rows={3} className="resize-none text-[13px]" />
                  </div>
                  <div>
                    <FL hint="Texto do botão no card do carousel">Texto do Botão CTA</FL>
                    <Input value={form.cta_text} onChange={(e) => set('cta_text', e.target.value)}
                      placeholder="Ex: Confira" className="h-9" />
                  </div>
                  <div>
                    <FL>Ordem de exibição</FL>
                    <Input type="number" value={form.order_num}
                      onChange={(e) => set('order_num', Number(e.target.value))}
                      className="h-9 w-24" />
                  </div>
                </div>
              </Section>

              <Section icon={CheckSquare} title="Funcionalidades do Card" subtitle="Lista exibida no modal ao clicar" defaultOpen>
                <ListEditor items={form.features} onChange={(v) => set('features', v)}
                  placeholder="Ex: Gestão de estoque em tempo real" />
              </Section>
            </>
          )}

          {/* ═══ TAB: SEO ═══ */}
          {tab === 'seo' && (
            <Section icon={Search} title="SEO" subtitle="Meta title e description para mecanismos de busca" defaultOpen>
              <div className="space-y-4">
                <div>
                  <FL>Meta Title</FL>
                  <Input value={form.pg_meta_title} onChange={(e) => set('pg_meta_title', e.target.value)}
                    placeholder="Ex: Maxx ERP — Gestão Completa | Unimaxx" className="h-10" />
                  <p className="text-[11px] mt-1" style={{ color: (form.pg_meta_title || '').length > 60 ? '#ef4444' : '#98989d' }}>
                    {(form.pg_meta_title || '').length}/60 caracteres
                  </p>
                </div>
                <div>
                  <FL>Meta Description</FL>
                  <Textarea value={form.pg_meta_description} onChange={(e) => set('pg_meta_description', e.target.value)}
                    placeholder="Descrição que aparece no Google..." rows={3} className="resize-none text-[13px]" />
                  <p className="text-[11px] mt-1" style={{ color: (form.pg_meta_description || '').length > 160 ? '#ef4444' : '#98989d' }}>
                    {(form.pg_meta_description || '').length}/160 caracteres
                  </p>
                </div>
                {/* Google snippet preview */}
                <div className="p-4 rounded-xl border" style={{ borderColor: 'rgba(0,0,0,.08)', background: '#fafafa' }}>
                  <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: '#98989d' }}>Preview no Google</p>
                  <p className="text-[#1a0dab] text-[15px] font-medium leading-snug">
                    {form.pg_meta_title || form.title || 'Título da página'}
                  </p>
                  <p className="text-[#006621] text-[12px] mt-0.5">
                    {`${window?.location?.origin || 'https://seusite.com'}/solucao-page/${form.solution_id || 'id'}`}
                  </p>
                  <p className="text-[#4d5156] text-[13px] mt-0.5 leading-relaxed line-clamp-2">
                    {form.pg_meta_description || form.description || 'Descrição da página...'}
                  </p>
                </div>
              </div>
            </Section>
          )}

          {/* Save button at bottom */}
          <div className="pt-2">
            <Button onClick={handleSave} disabled={saving} className="w-full h-12 font-bold text-[15px] rounded-2xl gap-2"
              style={{ background: '#f97316', color: '#fff', border: 'none' }}>
              {saving
                ? <><RefreshCw className="w-5 h-5 animate-spin" /> Salvando…</>
                : <><Save className="w-5 h-5" /> Salvar Solução + Página</>}
            </Button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

// ── LIST VIEW ────────────────────────────────────────────────────────────────
type StatusFilter = 'all' | 'active' | 'inactive' | 'no_page';

export default function UnifiedSolutionsManager() {
  const [solutions, setSolutions] = useState<UnifiedSolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<UnifiedSolution | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  // Estado do modal de exclusão (substitui confirm() nativo)
  const [deleteCandidate, setDeleteCandidate] = useState<UnifiedSolution | null>(null);
  // Ref atualizada pelo Editor quando dirty state muda — usado pelo Sheet
  // pra pedir confirmação ao tentar fechar (overlay click, X, Esc).
  const editorDirtyRef = React.useRef(false);
  const { toast } = useToast();

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [solRes, pgRes] = await Promise.all([
        fetch(`${API_URL}/admin/solutions`, { headers: authH() }),
        fetch(`${API_URL}/admin/solution-pages`, { headers: authH() }),
      ]);
      const sols = await solRes.json();
      const pages = await pgRes.json();

      const parseArr = (v: any): any[] => {
        if (!v) return [];
        try { return typeof v === 'string' ? JSON.parse(v) : v; } catch { return []; }
      };

      const merged: UnifiedSolution[] = sols.map((s: any) => {
        const page = pages.find((p: any) => p.slug === s.solution_id);
        return {
          solution_id: s.solution_id,
          title: s.title,
          description: s.description,
          features: parseArr(s.features),
          cta_text: s.cta_text || 'Saiba mais',
          icon: s.icon || 'Building2',
          image: s.image || '',
          order_num: s.order_num || 0,
          active: s.active ?? 1,
          nav_link: s.nav_link || `/solucao-page/${s.solution_id}`,
          pg_id: page?.id,
          pg_color_theme: page?.color_theme || 'orange',
          pg_meta_title: page?.meta_title || '',
          pg_meta_description: page?.meta_description || '',
          pg_is_active: page ? !!page.is_active : true,
          pg_blocks: parseArr(page?.blocks_json),
        };
      });
      setSolutions(merged);
    } catch (e) {
      toast({ title: 'Erro ao carregar soluções', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const handleSave = async (data: UnifiedSolution) => {
    const t = authH();
    const navLink = `/solucao-page/${data.solution_id}`;

    // 1. Salva card
    const solBody = {
      title: data.title, description: data.description,
      features: data.features, cta_text: data.cta_text,
      icon: data.icon, image: data.image,
      order_num: data.order_num, active: data.active,
      nav_link: navLink,
    };
    const solRes = await fetch(`${API_URL}/admin/solutions/${data.solution_id}`, {
      method: 'PUT', headers: t, body: JSON.stringify(solBody),
    });
    if (!solRes.ok) throw new Error('Erro ao salvar card da solução');

    // 2. Salva página (lean)
    const pageBody = {
      slug: data.solution_id,
      title: data.title,
      icon: data.icon,
      color_theme: data.pg_color_theme,
      meta_title: data.pg_meta_title,
      meta_description: data.pg_meta_description,
      is_active: data.pg_is_active,
      blocks_json: data.pg_blocks,
    };
    const pgUrl = data.pg_id
      ? `${API_URL}/admin/solution-pages/${data.pg_id}`
      : `${API_URL}/admin/solution-pages`;
    const pgRes = await fetch(pgUrl, {
      method: data.pg_id ? 'PUT' : 'POST', headers: t, body: JSON.stringify(pageBody),
    });
    if (!pgRes.ok) {
      const e = await pgRes.json().catch(() => ({}));
      throw new Error(e?.error || 'Erro ao salvar página da solução');
    }

    toast({ title: `✅ "${data.title}" salvo com sucesso!` });
    setEditing(null);
    await fetchAll();
  };

  // Soft-delete: card e página vão pra Lixeira (recuperáveis em /admin/lixeira)
  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    const sol = deleteCandidate;
    setDeleteCandidate(null);
    try {
      await fetch(`${API_URL}/admin/solutions/${sol.solution_id}`, { method: 'DELETE', headers: authH() });
      if (sol.pg_id) {
        await fetch(`${API_URL}/admin/solution-pages/${sol.pg_id}`, { method: 'DELETE', headers: authH() });
      }
      toast({ title: `"${sol.title}" foi para a Lixeira` });
      await fetchAll();
    } catch {
      toast({ title: 'Erro ao mover para a Lixeira', variant: 'destructive' });
    }
  };

  const handleNew = () => {
    setEditing({ ...EMPTY, solution_id: '' });
    setIsNew(true);
  };

  // Atalho: vai direto pro Construtor (usado quando clica no badge "Sem página")
  const goToBuilder = (sol: UnifiedSolution) => {
    setEditing(sol);
    setIsNew(false);
    // Editor abre na tab 'card' por padrão; vamos sinalizar via sessionStorage
    // pra Editor abrir já no Construtor. Hack simples e localizado.
    sessionStorage.setItem('solution_initial_tab', 'construtor');
  };

  // Tenta fechar o Sheet do editor — se houver dirty, pede confirmação.
  // Único caminho de fechamento: garante que back button, X do Sheet,
  // overlay click e Esc passam pela mesma checagem.
  const requestCloseEditor = () => {
    if (editorDirtyRef.current) {
      if (!confirm('Você tem alterações não salvas. Sair sem salvar?')) return;
    }
    editorDirtyRef.current = false;
    setEditing(null);
  };

  // Filtros combinados: busca textual + status
  const filtered = solutions.filter(s => {
    const q = search.toLowerCase();
    const matchesSearch = !q
      || s.title.toLowerCase().includes(q)
      || s.solution_id.toLowerCase().includes(q)
      || (s.description || '').toLowerCase().includes(q);
    if (!matchesSearch) return false;
    if (statusFilter === 'active' && s.active !== 1) return false;
    if (statusFilter === 'inactive' && s.active === 1) return false;
    if (statusFilter === 'no_page' && s.pg_id) return false;
    return true;
  });

  // Contadores para o header e badges de filtro
  const stats = {
    total: solutions.length,
    active: solutions.filter(s => s.active === 1).length,
    inactive: solutions.filter(s => s.active !== 1).length,
    noPage: solutions.filter(s => !s.pg_id).length,
  };

  // Memoiza lista ordenada — usado pelo DnD (precisa de array estável de IDs)
  const sortedFiltered = React.useMemo(
    () => [...filtered].sort((a, b) => a.order_num - b.order_num),
    [filtered]
  );

  // ── Drag-and-drop (B3) ───────────────────────────────────────────────────
  // Usa @dnd-kit com sensores Pointer + Keyboard (acessível).
  // activationConstraint: 8px de movimento antes de ativar — evita conflito
  // com clicks normais nos botões dentro da linha.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIdx = sortedFiltered.findIndex(s => s.solution_id === active.id);
    const newIdx = sortedFiltered.findIndex(s => s.solution_id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;

    // Reordenar localmente (otimista — UI responde instantaneamente)
    const reordered = arrayMove(sortedFiltered, oldIdx, newIdx);
    const updated = reordered.map((s, i) => ({ ...s, order_num: i }));

    // Atualiza estado: substitui as soluções reordenadas mantendo as filtradas
    setSolutions(prev => {
      const map = new Map(updated.map(s => [s.solution_id, s]));
      return prev.map(s => map.get(s.solution_id) || s);
    });

    // Persiste no backend — apenas as que mudaram order_num
    try {
      const changed = updated.filter((s, i) => {
        const original = sortedFiltered.find(o => o.solution_id === s.solution_id);
        return original && original.order_num !== i;
      });
      await Promise.all(changed.map(s => {
        // PUT /admin/solutions/:id — payload completo (Zod exige todos os campos)
        return fetch(`${API_URL}/admin/solutions/${s.solution_id}`, {
          method: 'PUT',
          headers: authH(),
          body: JSON.stringify({
            title: s.title, description: s.description, features: s.features,
            cta_text: s.cta_text, icon: s.icon, image: s.image,
            order_num: s.order_num, active: s.active, nav_link: s.nav_link,
          }),
        });
      }));
      toast({ title: 'Ordem atualizada' });
    } catch {
      toast({ title: 'Erro ao salvar nova ordem — recarregando…', variant: 'destructive' });
      await fetchAll();
    }
  };

  // Subtitle do topbar com contagem viva — comunica saúde sem ocupar espaço extra
  const subtitle = loading
    ? 'Carregando…'
    : stats.total === 0
      ? 'Nenhuma solução cadastrada ainda'
      : `${stats.total} solução(ões) · ${stats.active} ativa(s)${stats.inactive ? `, ${stats.inactive} inativa(s)` : ''}${stats.noPage ? ` · ${stats.noPage} sem página` : ''}`;

  // Filter chips — ações rápidas pra escanear estados específicos
  const filterChips: { id: StatusFilter; label: string; count: number }[] = [
    { id: 'all',      label: 'Todas',      count: stats.total },
    { id: 'active',   label: 'Ativas',     count: stats.active },
    { id: 'inactive', label: 'Inativas',   count: stats.inactive },
    { id: 'no_page',  label: 'Sem página', count: stats.noPage },
  ];

  return (
    <AdminPage>
      <AdminTopbar
        title="Soluções"
        subtitle={subtitle}
        actions={
          <>
            {/* "Texto da home" foi movido pra menu ··· secundário porque
                edita copy genérico do site, não pertence ao escopo "Soluções". */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 rounded-xl h-9 px-3" title="Mais opções">
                  <MoreHorizontal style={{ width: 16, height: 16 }} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <HomeSectionModal
                  section={HOME_SECTION_CONFIGS.solutions}
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="gap-2 cursor-pointer">
                      <Type style={{ width: 14, height: 14 }} />
                      Editar texto da home
                    </DropdownMenuItem>
                  }
                />
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={fetchAll} className="gap-2 cursor-pointer">
                  <RefreshCw style={{ width: 14, height: 14 }} />
                  Recarregar lista
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={handleNew} className="gap-2 font-bold rounded-xl px-5"
              style={{ background: '#f97316', color: '#fff', border: 'none' }}>
              <Plus style={{ width: 16, height: 16 }} /> Nova Solução
            </Button>
          </>
        }
      />

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-4xl mx-auto">

          {/* Search + filter chips (ferramenta real, não só caixinha) */}
          <div className="mb-5 space-y-3">
            <div className="relative">
              <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#98989d' }} />
              <Input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por título, ID ou descrição…" className="pl-10 h-10" />
              {search && (
                <button onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98989d] hover:text-[#1d1d1f] transition"
                  title="Limpar busca">
                  <X style={{ width: 14, height: 14 }} />
                </button>
              )}
            </div>

            {/* Filter chips + feedback de resultados */}
            <div className="flex items-center gap-2 flex-wrap">
              {filterChips.map(chip => {
                const active = statusFilter === chip.id;
                const isDimmed = chip.count === 0 && chip.id !== 'all';
                return (
                  <button key={chip.id} onClick={() => setStatusFilter(chip.id)}
                    disabled={isDimmed}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background: active ? '#f97316' : '#f5f5f7',
                      color: active ? '#fff' : '#6e6e73',
                    }}>
                    {chip.label}
                    <span className="font-bold text-[10px] px-1.5 rounded-full"
                      style={{
                        background: active ? 'rgba(255,255,255,.25)' : '#fff',
                        color: active ? '#fff' : '#6e6e73',
                      }}>
                      {chip.count}
                    </span>
                  </button>
                );
              })}

              {/* Feedback "X de Y resultados" — aparece só quando filtrando */}
              {(search || statusFilter !== 'all') && (
                <div className="text-[12px] ml-auto" style={{ color: '#98989d' }}>
                  Mostrando <strong style={{ color: '#1d1d1f' }}>{filtered.length}</strong> de {stats.total}
                </div>
              )}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="w-8 h-8 animate-spin" style={{ color: '#f97316' }} />
            </div>
          )}

          {/* Empty state — primitives + microcópia humana */}
          {!loading && filtered.length === 0 && (
            <div className="bg-white rounded-2xl border" style={{ borderColor: 'rgba(0,0,0,.08)' }}>
              <AdminEmptyState
                icon={<Layers size={28} />}
                title={
                  search
                    ? 'Nenhuma solução encontrada'
                    : statusFilter !== 'all'
                      ? 'Nada por aqui com esse filtro'
                      : 'Crie sua primeira solução'
                }
                description={
                  search
                    ? `Sua busca por "${search}" não retornou resultados. Tente outro termo ou limpe os filtros.`
                    : statusFilter !== 'all'
                      ? 'Mude o filtro acima para ver outras soluções, ou crie uma nova.'
                      : 'Soluções aparecem no carousel da home e no header. Comece com algo simples — você pode evoluir depois.'
                }
                action={!search && statusFilter === 'all' && (
                  <Button onClick={handleNew} className="gap-2"
                    style={{ background: '#f97316', color: '#fff' }}>
                    <Plus style={{ width: 15, height: 15 }} /> Criar primeira solução
                  </Button>
                )}
              />
            </div>
          )}

          {/* Lista — drag-and-drop só faz sentido sem busca/filtro ativo
              (caso contrário o usuário reordena uma view filtrada e fica
              confuso quando volta pra lista completa) */}
          {!loading && filtered.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis, restrictToParentElement]}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortedFiltered.map(s => s.solution_id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {/* Aviso quando está filtrado: drag-drop desabilitado */}
                  {(search || statusFilter !== 'all') && solutions.length > 1 && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100 text-[11px] text-blue-700">
                      <AlertCircle style={{ width: 12, height: 12 }} />
                      Limpe os filtros para reordenar arrastando.
                    </div>
                  )}
                  {sortedFiltered.map((sol, idx) => (
                    <SortableSolutionRow
                      key={sol.solution_id}
                      sol={sol}
                      idx={idx}
                      onEdit={() => { setEditing(sol); setIsNew(false); }}
                      onGoToBuilder={() => goToBuilder(sol)}
                      onDelete={() => setDeleteCandidate(sol)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

        </div>
      </div>

      {/* Modal de exclusão amigável — substitui confirm() nativo.
          Texto reflete soft-delete: "Mover pra Lixeira" (recuperável). */}
      <AlertDialog open={!!deleteCandidate} onOpenChange={(open) => { if (!open) setDeleteCandidate(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mover "{deleteCandidate?.title}" para a Lixeira?</AlertDialogTitle>
            <AlertDialogDescription>
              O card e a página serão movidos para a Lixeira. Você pode restaurá-los a qualquer momento em <strong>Admin › Lixeira</strong>.
              {deleteCandidate?.pg_blocks?.length ? (
                <span className="block mt-2 text-amber-700">
                  Esta solução tem <strong>{deleteCandidate.pg_blocks.length}</strong> bloco(s) na página.
                </span>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-300">
              Mover para Lixeira
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Editor como Sheet lateral (Sprint C) ─────────────────────────────
          Lista permanece visível atrás (overlay 50% preto). Slide da direita.
          Width 95vw — quase full-screen mas mantém glimpse da lista pra
          comunicar "você está editando ALGO da lista". Padrão Stripe/Linear. */}
      <Sheet
        open={!!editing}
        onOpenChange={(open) => {
          // Sheet só dispara onOpenChange(false) ao tentar fechar
          if (!open) requestCloseEditor();
        }}
      >
        <SheetContent
          side="right"
          // Override do default w-3/4 sm:max-w-sm — queremos quase full-width
          // mas com 5vw de glimpse da lista atrás (UX intencional).
          className="!max-w-none w-[95vw] sm:w-[95vw] p-0 gap-0 flex flex-col overflow-hidden [&>button.absolute]:hidden"
          // Não fechar ao clicar overlay se há dirty — onPointerDownOutside
          // dispara ANTES de onOpenChange, dá oportunidade de bloquear.
          onPointerDownOutside={(e) => {
            if (editorDirtyRef.current) {
              e.preventDefault();
              if (confirm('Você tem alterações não salvas. Sair sem salvar?')) {
                editorDirtyRef.current = false;
                setEditing(null);
              }
            }
          }}
          // Mesmo tratamento pra Esc
          onEscapeKeyDown={(e) => {
            if (editorDirtyRef.current) {
              e.preventDefault();
              if (confirm('Você tem alterações não salvas. Sair sem salvar?')) {
                editorDirtyRef.current = false;
                setEditing(null);
              }
            }
          }}
        >
          {/* SheetTitle obrigatório pra acessibilidade (Radix avisa no console) — escondido visualmente */}
          <SheetTitle className="sr-only">
            {isNew ? 'Nova Solução' : `Editar ${editing?.title || 'solução'}`}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Edite o card do carousel, monte a página com blocos visuais ou ajuste o SEO da solução.
          </SheetDescription>
          {editing && (
            <Editor
              initial={editing}
              isNew={isNew}
              onSave={handleSave}
              onBack={requestCloseEditor}
              onDirtyChange={(dirty) => { editorDirtyRef.current = dirty; }}
            />
          )}
        </SheetContent>
      </Sheet>
    </AdminPage>
  );
}
