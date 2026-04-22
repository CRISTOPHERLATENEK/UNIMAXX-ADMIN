// UnifiedSolutionsManager — Lean: card + page builder (blocks_json only) + SEO
import { ImageUploadField, SPECS as IMAGE_SPECS } from '@/components/ImageUploadField';
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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const BASE_URL = API_URL.replace('/api', '');
const resolveImg = (p?: string) => !p ? null : p.startsWith('http') ? p : `${BASE_URL}${p}`;
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
  { id: 'card', label: '🃏 Card', desc: 'Card do carousel' },
  { id: 'construtor', label: '🧱 Construtor', desc: 'Page Builder' },
  { id: 'seo', label: '🔍 SEO', desc: 'Meta tags' },
];

// ── EDITOR ──────────────────────────────────────────────────────────────────
function Editor({ initial, isNew, onSave, onBack }: {
  initial: UnifiedSolution; isNew: boolean;
  onSave: (data: UnifiedSolution) => Promise<void>;
  onBack: () => void;
}) {
  const [form, setForm] = useState<UnifiedSolution>(initial);
  const [tab, setTab] = useState('card');
  const [saving, setSaving] = useState(false);
  const [uploadingCard, setUploadingCard] = useState(false);
  const { toast } = useToast();

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

  const handleSave = async () => {
    if (!form.title.trim()) { toast({ title: 'Título é obrigatório', variant: 'destructive' }); return; }
    if (!form.solution_id.trim()) { toast({ title: 'ID da solução é obrigatório', variant: 'destructive' }); return; }
    if (!form.description.trim()) { toast({ title: 'Descrição é obrigatória', variant: 'destructive' }); return; }
    setSaving(true);
    try { await onSave(form); }
    catch (e: any) { toast({ title: e?.message || 'Erro ao salvar', variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  const themeHex = COLOR_OPTIONS.find(c => c.v === form.pg_color_theme)?.hex || '#f97316';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '100vh' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b bg-white flex-shrink-0"
        style={{ borderColor: 'rgba(0,0,0,.07)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition"
            style={{ background: '#f5f5f7', color: '#6e6e73' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#e5e5ea'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#f5f5f7'; }}>
            <ArrowLeft style={{ width: 15, height: 15 }} />
          </button>
          <div>
            <h2 className="font-bold text-[#1d1d1f] text-[15px]" style={{ fontFamily: "'Outfit',sans-serif" }}>
              {isNew ? 'Nova Solução' : form.title || 'Editar Solução'}
            </h2>
            <p className="text-[11px]" style={{ color: '#98989d' }}>
              /solucao-page/{form.solution_id || 'id-aqui'}
            </p>
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
          <Button onClick={handleSave} disabled={saving} size="sm"
            className="gap-1.5 font-bold px-5 rounded-xl h-9"
            style={{ background: '#f97316', color: '#fff', border: 'none' }}>
            {saving
              ? <><RefreshCw style={{ width: 14, height: 14 }} className="animate-spin" /> Salvando…</>
              : <><Save style={{ width: 14, height: 14 }} /> Salvar</>}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b bg-white flex-shrink-0 px-5 gap-1"
        style={{ borderColor: 'rgba(0,0,0,.07)', overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex items-center gap-1.5 px-3.5 py-3 text-[13px] font-medium whitespace-nowrap transition border-b-2"
            style={{
              borderBottomColor: tab === t.id ? '#f97316' : 'transparent',
              color: tab === t.id ? '#f97316' : '#6e6e73',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Scrollable form */}
      <div className="flex-1 overflow-y-auto" style={{ background: '#fafafa' }}>
        <div className="max-w-2xl mx-auto p-5 pb-16 space-y-4">

          {/* ═══ TAB: CONSTRUTOR ═══ */}
          {tab === 'construtor' && (
            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(0,0,0,.07)' }}>
              <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'rgba(0,0,0,.06)', background: 'rgba(0,0,0,.01)' }}>
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
              <div className="p-4">
                <PageBuilder
                  blocks={form.pg_blocks}
                  onChange={blocks => set('pg_blocks', blocks)}
                />
              </div>
            </div>
          )}

          {/* ═══ TAB: CARD ═══ */}
          {tab === 'card' && (
            <>
              <Section icon={Layout} title="Identidade do Card" subtitle="Título, ID, ícone e cor de tema" defaultOpen>
                <div className="space-y-4">
                  <div>
                    <FL hint="Aparece no card e no header de soluções">Título da Solução *</FL>
                    <Input value={form.title}
                      onChange={(e) => { set('title', e.target.value); autoId(e.target.value); }}
                      placeholder="Ex: Maxx ERP" className="h-10" />
                  </div>
                  <div>
                    <FL hint="Usado na URL: /solucao-page/{id}">ID da Solução *</FL>
                    <div className="flex items-center">
                      <span className="px-3 h-10 flex items-center text-[12px] bg-[#f5f5f7] border border-r-0 rounded-l-xl flex-shrink-0"
                        style={{ borderColor: 'rgba(0,0,0,.1)', color: '#98989d' }}>
                        /solucao-page/
                      </span>
                      <Input value={form.solution_id}
                        onChange={(e) => set('solution_id', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder="maxx-erp" className="h-10 rounded-l-none flex-1" />
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
    </div>
  );
}

// ── LIST VIEW ────────────────────────────────────────────────────────────────
export default function UnifiedSolutionsManager() {
  const [solutions, setSolutions] = useState<UnifiedSolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<UnifiedSolution | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [search, setSearch] = useState('');
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

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Excluir "${title}"? Isso remove o card E a página.`)) return;
    await fetch(`${API_URL}/admin/solutions/${id}`, { method: 'DELETE', headers: authH() });
    const page = solutions.find(s => s.solution_id === id);
    if (page?.pg_id) {
      await fetch(`${API_URL}/admin/solution-pages/${page.pg_id}`, { method: 'DELETE', headers: authH() });
    }
    toast({ title: 'Solução excluída.' });
    fetchAll();
  };

  const handleNew = () => {
    setEditing({ ...EMPTY, solution_id: `solucao-${Date.now()}` });
    setIsNew(true);
  };

  if (editing) {
    return (
      <Editor
        initial={editing} isNew={isNew}
        onSave={handleSave}
        onBack={() => setEditing(null)}
      />
    );
  }

  const filtered = solutions.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.solution_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1d1d1f]" style={{ fontFamily: "'Outfit',sans-serif" }}>
            Soluções
          </h1>
          <p className="text-[13px] mt-0.5" style={{ color: '#6e6e73' }}>
            Edite o card do carousel e a página de cada solução em um só lugar
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <HomeSectionModal
            section={HOME_SECTION_CONFIGS.solutions}
            trigger={
              <Button variant="outline" className="gap-2 rounded-xl">
                <Layers style={{ width: 16, height: 16 }} /> Texto da home
              </Button>
            }
          />
          <Button onClick={handleNew} className="gap-2 font-bold rounded-xl px-5"
            style={{ background: '#f97316', color: '#fff', border: 'none' }}>
            <Plus style={{ width: 16, height: 16 }} /> Nova Solução
          </Button>
        </div>
      </div>

      <div className="relative mb-5">
        <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#98989d' }} />
        <Input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar soluções..." className="pl-10 h-10" />
      </div>



      {loading && (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="w-8 h-8 animate-spin" style={{ color: '#f97316' }} />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed rounded-2xl" style={{ borderColor: 'rgba(0,0,0,.08)' }}>
          <Layers style={{ width: 48, height: 48, color: '#c7c7cc', margin: '0 auto 16px' }} />
          <p className="font-medium mb-1" style={{ color: '#6e6e73' }}>{search ? 'Nenhuma solução encontrada' : 'Nenhuma solução criada ainda'}</p>
          {!search && <p className="text-[13px] mb-5" style={{ color: '#98989d' }}>Crie sua primeira solução para ela aparecer no carousel e no header</p>}
          {!search && (
            <Button onClick={handleNew} variant="outline" className="gap-2">
              <Plus style={{ width: 15, height: 15 }} /> Criar primeira solução
            </Button>
          )}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.sort((a, b) => a.order_num - b.order_num).map((sol) => {
            const themeHex = COLOR_OPTIONS.find(c => c.v === sol.pg_color_theme)?.hex || '#f97316';
            const hasPage = !!sol.pg_id;
            const cardImg = resolveImg(sol.image);
            const IconComp = ICON_OPTIONS.find(i => i.v === sol.icon)?.I || Building2;
            const blockCount = sol.pg_blocks?.length || 0;

            return (
              <div key={sol.solution_id}
                className="bg-white rounded-2xl border overflow-hidden transition-all duration-200 hover:shadow-md"
                style={{ borderColor: 'rgba(0,0,0,.07)' }}>
                <div className="flex items-center gap-4 p-4">
                  <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: themeHex }} />
                  <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center"
                    style={{ background: cardImg ? undefined : `linear-gradient(135deg,${themeHex}22,${themeHex}44)` }}>
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
                      <Badge className={`text-[10px] border-0 px-2 py-0.5 ${hasPage ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                        {hasPage ? `📄 ${blockCount} blocos` : '⚠️ Sem página'}
                      </Badge>
                    </div>
                    <p className="text-[12px] truncate" style={{ color: '#98989d' }}>
                      /solucao-page/{sol.solution_id}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a href={`/solucao-page/${sol.solution_id}`} target="_blank" rel="noreferrer"
                      className="w-8 h-8 rounded-xl flex items-center justify-center transition"
                      style={{ color: '#98989d', background: '#f5f5f7' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#e5e5ea'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#f5f5f7'; }}>
                      <ExternalLink style={{ width: 14, height: 14 }} />
                    </a>
                    <button
                      onClick={() => { setEditing(sol); setIsNew(false); }}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-semibold transition"
                      style={{ background: `${themeHex}10`, color: themeHex }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = `${themeHex}20`; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = `${themeHex}10`; }}>
                      <Pencil style={{ width: 13, height: 13 }} /> Editar
                    </button>
                    <button onClick={() => handleDelete(sol.solution_id, sol.title)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center transition"
                      style={{ color: '#c7c7cc', background: '#f5f5f7' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#ef4444'; (e.currentTarget as HTMLElement).style.background = '#fef2f2'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#c7c7cc'; (e.currentTarget as HTMLElement).style.background = '#f5f5f7'; }}>
                      <Trash2 style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
