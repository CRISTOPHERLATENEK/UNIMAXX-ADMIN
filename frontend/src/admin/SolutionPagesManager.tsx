import React, { useState, useRef } from 'react';
import {
  Plus, Pencil, Trash2, Save, X, Upload, Image as ImageIcon,
  RefreshCw, ExternalLink, ChevronRight,
  Building2, Monitor, ShoppingCart, CreditCard, Truck, FileText,
  BarChart3, Globe, Settings, Zap, Package, Star, Layers,
  Hash, AlignLeft, Link2, BarChart2, Phone, Search, AlertCircle,
  HelpCircle, PlayCircle, Camera, Quote, Sparkles,
  Shield, Clock, HeadphonesIcon, Award, Rocket, Target, 
  TrendingUp, Lock, Users, Wifi, Database, Code,
  ChevronUp, ChevronDown, GripVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const BASE_URL = API_URL.replace('/api', '');
const resolveImg = (p?: string) => !p ? null : p.startsWith('http') ? p : `${BASE_URL}${p}`;

// ── Types ──────────────────────────────────────────────────────────────────
interface Stat          { label: string; value: string; }
interface FaqItem       { question: string; answer: string; }
interface StepItem      { title: string; description: string; }
interface DiffItem      { icon: string; title: string; description: string; }

interface SolutionPage {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  benefits: string[];
  integrations: string[];
  hero_image?: string;
  icon: string;
  color_theme: string;
  meta_title?: string;
  meta_description?: string;
  is_active: boolean;
  stats_json?: Stat[];
  features_title?: string;
  benefits_title?: string;
  steps_json?: StepItem[];
  steps_title?: string;
  differentials_json?: DiffItem[];
  differentials_title?: string;
  highlight_title?: string;
  highlight_text?: string;
  testimonial_quote?: string;
  testimonial_author?: string;
  testimonial_role?: string;
  video_url?: string;
  video_title?: string;
  screenshots_json?: string[];
  screenshots_title?: string;
  faq_json?: FaqItem[];
  cta_title?: string;
  cta_description?: string;
  cta_button_label?: string;
  secondary_cta_label?: string;
  secondary_cta_link?: string;
}

const EMPTY: SolutionPage = {
  id: 0, slug: '', title: '', subtitle: '', description: '',
  features: [], benefits: [], integrations: [],
  hero_image: '', icon: 'Building2', color_theme: 'orange',
  meta_title: '', meta_description: '', is_active: true,
  stats_json: [], features_title: '', benefits_title: '',
  steps_json: [], steps_title: '',
  differentials_json: [], differentials_title: '',
  highlight_title: '', highlight_text: '',
  testimonial_quote: '', testimonial_author: '', testimonial_role: '',
  video_url: '', video_title: '',
  screenshots_json: [], screenshots_title: '',
  faq_json: [],
  cta_title: '', cta_description: '',
  cta_button_label: 'Falar com Especialista',
  secondary_cta_label: '', secondary_cta_link: '',
};

const ICON_OPTIONS = [
  { v: 'Building2',      label: 'Empresa',     I: Building2 },
  { v: 'ShoppingCart',   label: 'Carrinho',    I: ShoppingCart },
  { v: 'CreditCard',     label: 'Pagamento',   I: CreditCard },
  { v: 'Truck',          label: 'Entrega',     I: Truck },
  { v: 'FileText',       label: 'Documento',   I: FileText },
  { v: 'BarChart3',      label: 'Gráfico',     I: BarChart3 },
  { v: 'Globe',          label: 'Web',         I: Globe },
  { v: 'Monitor',        label: 'Monitor',     I: Monitor },
  { v: 'Settings',       label: 'Config',      I: Settings },
  { v: 'Zap',            label: 'Rápido',      I: Zap },
  { v: 'Package',        label: 'Pacote',      I: Package },
  { v: 'Star',           label: 'Destaque',    I: Star },
  { v: 'Layers',         label: 'Camadas',     I: Layers },
  { v: 'Database',       label: 'Dados',       I: Database },
  { v: 'Code',           label: 'Dev',         I: Code },
  { v: 'Users',          label: 'Usuários',    I: Users },
];

const DIFF_ICONS = [
  { v: 'Zap',         I: Zap },         { v: 'Shield',     I: Shield },
  { v: 'Clock',       I: Clock },       { v: 'HeadphonesIcon', I: HeadphonesIcon },
  { v: 'Award',       I: Award },       { v: 'Rocket',     I: Rocket },
  { v: 'Target',      I: Target },      { v: 'TrendingUp', I: TrendingUp },
  { v: 'Lock',        I: Lock },        { v: 'Users',      I: Users },
  { v: 'Wifi',        I: Wifi },        { v: 'Star',       I: Star },
  { v: 'Globe',       I: Globe },       { v: 'Database',   I: Database },
  { v: 'Settings',    I: Settings },    { v: 'BarChart3',  I: BarChart3 },
];

const COLOR_OPTIONS = [
  { v: 'orange', label: 'Laranja', hex: '#f97316' },
  { v: 'blue',   label: 'Azul',   hex: '#2563eb' },
  { v: 'green',  label: 'Verde',  hex: '#16a34a' },
  { v: 'purple', label: 'Roxo',   hex: '#9333ea' },
  { v: 'black',  label: 'Preto',  hex: '#1f2937' },
  { v: 'white',  label: 'Branco', hex: '#94a3b8' },
];

const TABS = [
  { id: 'identity', label: 'Identidade',   icon: '🎨' },
  { id: 'content',  label: 'Conteúdo',     icon: '📝' },
  { id: 'proof',    label: 'Prova Social', icon: '⭐' },
  { id: 'media',    label: 'Mídia',        icon: '🎬' },
  { id: 'cta',      label: 'CTA & SEO',    icon: '🚀' },
];

// ── String list editor ─────────────────────────────────────────────────────
function StringListEditor({ items, onChange, placeholder }: {
  items: string[]; onChange: (v: string[]) => void; placeholder?: string;
}) {
  const [draft, setDraft] = useState('');
  const add = () => { const v = draft.trim(); if (v) { onChange([...items, v]); setDraft(''); } };

  return (
    <div className="space-y-2">
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 group">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[#1d1d1f] bg-[#f5f5f7]">
              <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[11px] font-bold text-[#98989d] flex-shrink-0">{i + 1}</span>
              <span className="flex-1">{item}</span>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
              {i > 0 && (
                <button onClick={() => { const a = [...items]; [a[i-1],a[i]]=[a[i],a[i-1]]; onChange(a); }}
                  className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                  <ChevronUp className="w-3 h-3" />
                </button>
              )}
              {i < items.length - 1 && (
                <button onClick={() => { const a = [...items]; [a[i],a[i+1]]=[a[i+1],a[i]]; onChange(a); }}
                  className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                  <ChevronDown className="w-3 h-3" />
                </button>
              )}
              <button onClick={() => onChange(items.filter((_, j) => j !== i))}
                className="w-6 h-6 rounded flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50">
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={placeholder || 'Adicionar item...'}
          className="h-9 text-sm" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} />
        <Button size="sm" variant="outline" onClick={add} className="h-9 px-3 flex-shrink-0">
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ── Field group wrapper ─────────────────────────────────────────────────────
function FieldGroup({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="border-b pb-2" style={{ borderColor: 'rgba(0,0,0,.06)' }}>
        <p className="font-semibold text-[#1d1d1f] text-sm">{title}</p>
        {desc && <p className="text-xs text-[#98989d] mt-0.5">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

// ── PageEditor ──────────────────────────────────────────────────────────────
function PageEditor({ page, isNew, onSave, onCancel }: {
  page: SolutionPage; isNew: boolean;
  onSave: (data: SolutionPage) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<SolutionPage>(page);
  const [activeTab, setActiveTab] = useState('identity');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const set = <K extends keyof SolutionPage>(k: K, v: SolutionPage[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const autoSlug = (title: string) => {
    if (!isNew) return;
    set('slug', title.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-'));
  };

  const uploadHero = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData(); fd.append('image', file);
      const res = await fetch(`${API_URL}/admin/upload`, {
        method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, body: fd,
      });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      set('hero_image', url);
      toast({ title: '✅ Imagem enviada!' });
    } catch { toast({ title: 'Erro no upload', variant: 'destructive' }); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.slug.trim()) {
      toast({ title: 'Título e slug são obrigatórios', variant: 'destructive' }); return;
    }
    setSaving(true);
    try { await onSave(form); }
    finally { setSaving(false); }
  };

  const heroUrl = resolveImg(form.hero_image);
  const themeHex = COLOR_OPTIONS.find((c) => c.v === form.color_theme)?.hex || '#f97316';

  // ── Tab: Identidade ──
  const tabIdentity = (
    <div className="space-y-6">
      <FieldGroup title="Informações básicas" desc="Título e URL da página">
        <div>
          <Label className="text-xs font-semibold text-[#1d1d1f] mb-1.5 flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-[#f97316]" /> Título da Página *
          </Label>
          <Input value={form.title}
            onChange={(e) => { set('title', e.target.value); autoSlug(e.target.value); }}
            placeholder="Ex: ERP Completo para Varejo" className="h-10" />
        </div>
        <div>
          <Label className="text-xs font-semibold text-[#1d1d1f] mb-1.5 flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5 text-[#f97316]" /> Slug (URL) *
          </Label>
          <div className="flex items-center">
            <span className="px-3 h-10 flex items-center text-xs text-[#98989d] bg-[#f5f5f7] border border-r-0 rounded-l-lg" style={{ borderColor: 'rgba(0,0,0,.1)' }}>
              /solucao-page/
            </span>
            <Input value={form.slug}
              onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="erp-varejo" className="h-10 rounded-l-none flex-1" />
          </div>
        </div>
        <div>
          <Label className="text-xs font-semibold text-[#1d1d1f] mb-1.5 flex items-center gap-1.5">
            <AlignLeft className="w-3.5 h-3.5 text-[#f97316]" /> Subtítulo
          </Label>
          <Input value={form.subtitle} onChange={(e) => set('subtitle', e.target.value)}
            placeholder="Frase de destaque logo abaixo do título" className="h-10" />
        </div>
        <div>
          <Label className="text-xs font-semibold text-[#1d1d1f] mb-1.5 flex items-center gap-1.5">
            <AlignLeft className="w-3.5 h-3.5 text-[#f97316]" /> Descrição Principal
          </Label>
          <Textarea value={form.description} onChange={(e) => set('description', e.target.value)}
            placeholder="Descreva a solução em 2-3 frases..." rows={3} className="resize-none text-sm" />
        </div>
      </FieldGroup>

      <FieldGroup title="Imagem de Capa" desc="Aparece como fundo do hero. Use imagens escuras ou com bom contraste.">
        <div className="relative rounded-2xl overflow-hidden border-2 border-dashed cursor-pointer group transition-colors"
          style={{ borderColor: 'rgba(0,0,0,.1)', height: 160 }}
          onClick={() => fileRef.current?.click()}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#f97316')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(0,0,0,.1)')}>
          {heroUrl ? (
            <>
              <img src={heroUrl} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 text-white text-sm font-medium">
                <Upload className="w-5 h-5" /> Trocar imagem
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-[#98989d] group-hover:text-[#f97316] transition">
              <ImageIcon className="w-8 h-8" />
              <span className="text-sm font-medium">Clique para enviar imagem</span>
              <span className="text-xs text-[#c7c7cc]">PNG, JPG, WEBP — máx. 20MB</span>
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <RefreshCw className="w-7 h-7 text-white animate-spin" />
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadHero(f); }} />
        <Input value={form.hero_image || ''} onChange={(e) => set('hero_image', e.target.value)}
          placeholder="Ou cole a URL da imagem..." className="h-9 text-sm" />
      </FieldGroup>

      <FieldGroup title="Aparência" desc="Ícone e cor do tema da página">
        <div>
          <Label className="text-xs font-semibold text-[#1d1d1f] mb-2 block">Ícone</Label>
          <div className="grid grid-cols-8 gap-1.5">
            {ICON_OPTIONS.map(({ v, label, I }) => (
              <button key={v} onClick={() => set('icon', v)} title={label}
                className="p-2 rounded-xl flex flex-col items-center gap-1 transition-all"
                style={{ background: form.icon === v ? '#f97316' : '#f5f5f7', color: form.icon === v ? '#fff' : '#6e6e73' }}>
                <I className="w-4 h-4" />
                <span className="text-[9px] font-medium leading-none">{label}</span>
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label className="text-xs font-semibold text-[#1d1d1f] mb-2 block">Cor do Tema</Label>
          <div className="flex gap-2 flex-wrap">
            {COLOR_OPTIONS.map(({ v, label, hex }) => (
              <button key={v} onClick={() => set('color_theme', v)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all border-2"
                style={{ borderColor: form.color_theme === v ? hex : 'transparent', background: '#f5f5f7' }}>
                <div className="w-4 h-4 rounded-full" style={{ background: hex }} />
                <span className="text-xs font-medium text-[#6e6e73]">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </FieldGroup>

      <FieldGroup title="Estatísticas do Hero" desc="Números de impacto exibidos ao lado do título (máx. 4)">
        <div className="space-y-2">
          {(form.stats_json || []).map((s, i) => (
            <div key={i} className="flex items-center gap-2 p-3 rounded-xl group" style={{ background: '#f5f5f7' }}>
              <div className="flex-1 grid grid-cols-2 gap-2">
                <Input value={s.value} placeholder="Ex: 500+"
                  className="h-8 text-sm bg-white"
                  onChange={(e) => { const arr = [...(form.stats_json || [])]; arr[i] = { ...arr[i], value: e.target.value }; set('stats_json', arr); }} />
                <Input value={s.label} placeholder="Ex: Clientes ativos"
                  className="h-8 text-sm bg-white"
                  onChange={(e) => { const arr = [...(form.stats_json || [])]; arr[i] = { ...arr[i], label: e.target.value }; set('stats_json', arr); }} />
              </div>
              <button onClick={() => set('stats_json', (form.stats_json || []).filter((_, j) => j !== i))}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition opacity-0 group-hover:opacity-100">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {(form.stats_json || []).length < 4 && (
            <Button variant="outline" size="sm" className="w-full h-9 text-xs gap-1.5"
              onClick={() => set('stats_json', [...(form.stats_json || []), { value: '', label: '' }])}>
              <Plus className="w-3.5 h-3.5" /> Adicionar estatística
            </Button>
          )}
        </div>
      </FieldGroup>

      <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: '#f5f5f7' }}>
        <div>
          <p className="text-sm font-semibold text-[#1d1d1f]">Página ativa</p>
          <p className="text-xs text-[#98989d]">Visível no site público</p>
        </div>
        <Switch checked={form.is_active} onCheckedChange={(v) => set('is_active', v)} />
      </div>
    </div>
  );

  // ── Tab: Conteúdo ──
  const tabContent = (
    <div className="space-y-8">
      <FieldGroup title="Funcionalidades" desc="Lista de recursos e capacidades do produto">
        <div>
          <Label className="text-xs font-semibold text-[#1d1d1f] mb-1.5 block">Título da seção (opcional)</Label>
          <Input value={form.features_title || ''} onChange={(e) => set('features_title', e.target.value)}
            placeholder="Ex: Tudo que você precisa" className="h-9 text-sm mb-4" />
          <StringListEditor items={form.features} onChange={(v) => set('features', v)}
            placeholder="Ex: Gestão de estoque em tempo real" />
        </div>
      </FieldGroup>

      <FieldGroup title="Benefícios" desc="Resultados e ganhos concretos para o cliente">
        <div>
          <Label className="text-xs font-semibold text-[#1d1d1f] mb-1.5 block">Título da seção (opcional)</Label>
          <Input value={form.benefits_title || ''} onChange={(e) => set('benefits_title', e.target.value)}
            placeholder="Ex: Resultados comprovados" className="h-9 text-sm mb-4" />
          <StringListEditor items={form.benefits} onChange={(v) => set('benefits', v)}
            placeholder="Ex: Redução de 40% no tempo de fechamento" />
        </div>
      </FieldGroup>

      <FieldGroup title="Diferenciais" desc="Cards com ícone — Por que escolher esta solução (máx. 6)">
        <div className="space-y-3">
          <div>
            <Label className="text-xs font-semibold text-[#1d1d1f] mb-1.5 block">Título da seção (opcional)</Label>
            <Input value={form.differentials_title || ''} onChange={(e) => set('differentials_title', e.target.value)}
              placeholder="Ex: Por que a Unimaxx?" className="h-9 text-sm" />
          </div>
          <div className="space-y-3">
            {(form.differentials_json || []).map((d, i) => {
              const DIcon = DIFF_ICONS.find(ic => ic.v === d.icon)?.I || Zap;
              return (
                <div key={i} className="p-4 rounded-2xl group space-y-3" style={{ background: '#f5f5f7', border: '1px solid rgba(0,0,0,.05)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${themeHex}15` }}>
                      <DIcon className="w-5 h-5" style={{ color: themeHex }} />
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <Input value={d.title} placeholder="Título do diferencial" className="h-8 text-sm bg-white"
                        onChange={(e) => { const a = [...(form.differentials_json || [])]; a[i] = { ...a[i], title: e.target.value }; set('differentials_json', a); }} />
                    </div>
                    <button onClick={() => set('differentials_json', (form.differentials_json || []).filter((_, j) => j !== i))}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition opacity-0 group-hover:opacity-100 flex-shrink-0">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <Textarea value={d.description} placeholder="Descrição breve..." rows={2}
                    className="resize-none text-sm bg-white"
                    onChange={(e) => { const a = [...(form.differentials_json || [])]; a[i] = { ...a[i], description: e.target.value }; set('differentials_json', a); }} />
                  <div>
                    <Label className="text-[10px] font-bold text-[#98989d] uppercase tracking-wider mb-1.5 block">Ícone</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {DIFF_ICONS.map(({ v, I: Ic }) => (
                        <button key={v} onClick={() => { const a = [...(form.differentials_json || [])]; a[i] = { ...a[i], icon: v }; set('differentials_json', a); }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                          style={{ background: d.icon === v ? themeHex : '#fff', color: d.icon === v ? '#fff' : '#6e6e73', border: `1px solid ${d.icon === v ? themeHex : 'rgba(0,0,0,.1)'}` }}>
                          <Ic className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {(form.differentials_json || []).length < 6 && (
            <Button variant="outline" size="sm" className="w-full h-9 text-xs gap-1.5"
              onClick={() => set('differentials_json', [...(form.differentials_json || []), { icon: 'Zap', title: '', description: '' }])}>
              <Plus className="w-3.5 h-3.5" /> Adicionar diferencial
            </Button>
          )}
        </div>
      </FieldGroup>

      <FieldGroup title="Como Funciona" desc="Passo a passo do produto">
        <div className="space-y-3">
          <div>
            <Label className="text-xs font-semibold text-[#1d1d1f] mb-1.5 block">Título da seção (opcional)</Label>
            <Input value={form.steps_title || ''} onChange={(e) => set('steps_title', e.target.value)}
              placeholder="Ex: Em 3 passos simples" className="h-9 text-sm" />
          </div>
          <div className="space-y-2">
            {(form.steps_json || []).map((step, i) => (
              <div key={i} className="p-3 rounded-xl group space-y-2" style={{ background: '#f5f5f7' }}>
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: themeHex }}>{i + 1}</span>
                  <Input value={step.title} placeholder="Título do passo" className="h-8 text-sm bg-white flex-1"
                    onChange={(e) => { const a = [...(form.steps_json || [])]; a[i] = { ...a[i], title: e.target.value }; set('steps_json', a); }} />
                  <button onClick={() => set('steps_json', (form.steps_json || []).filter((_, j) => j !== i))}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition opacity-0 group-hover:opacity-100 flex-shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <Textarea value={step.description} placeholder="Descrição do passo..." rows={2}
                  className="resize-none text-sm bg-white"
                  onChange={(e) => { const a = [...(form.steps_json || [])]; a[i] = { ...a[i], description: e.target.value }; set('steps_json', a); }} />
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="w-full h-9 text-xs gap-1.5"
            onClick={() => set('steps_json', [...(form.steps_json || []), { title: '', description: '' }])}>
            <Plus className="w-3.5 h-3.5" /> Adicionar passo
          </Button>
        </div>
      </FieldGroup>

      <FieldGroup title="Integrações" desc="Sistemas e plataformas conectadas">
        <StringListEditor items={form.integrations} onChange={(v) => set('integrations', v)}
          placeholder="Ex: SAP, Totvs, Bling..." />
      </FieldGroup>

      <FieldGroup title="Destaque / Chamada Especial" desc="Bloco de texto em destaque — aparece entre as seções">
        <div className="space-y-3">
          <div>
            <Label className="text-xs font-semibold text-[#1d1d1f] mb-1.5 block">Título do destaque</Label>
            <Input value={form.highlight_title || ''} onChange={(e) => set('highlight_title', e.target.value)}
              placeholder="Ex: Tecnologia que transforma" className="h-9 text-sm" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-[#1d1d1f] mb-1.5 block">Texto do destaque</Label>
            <Textarea value={form.highlight_text || ''} onChange={(e) => set('highlight_text', e.target.value)}
              placeholder="Uma frase ou parágrafo marcante sobre a solução..." rows={3}
              className="resize-none text-sm" />
          </div>
          {(form.highlight_title || form.highlight_text) && (
            <div className="rounded-2xl p-5 relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${themeHex}12, ${themeHex}06)`, border: `1px solid ${themeHex}25` }}>
              <Sparkles className="w-5 h-5 mb-2" style={{ color: themeHex }} />
              {form.highlight_title && <p className="font-bold text-[#1d1d1f] text-sm mb-1">{form.highlight_title}</p>}
              {form.highlight_text && <p className="text-[#6e6e73] text-xs leading-relaxed">{form.highlight_text}</p>}
            </div>
          )}
        </div>
      </FieldGroup>
    </div>
  );

  // ── Tab: Prova Social ──
  const tabProof = (
    <div className="space-y-8">
      <FieldGroup title="Depoimento" desc="Uma citação de cliente específica para esta solução">
        <div className="space-y-3">
          <div>
            <Label className="text-xs font-semibold text-[#1d1d1f] mb-1.5 block">Citação</Label>
            <Textarea value={form.testimonial_quote || ''} onChange={(e) => set('testimonial_quote', e.target.value)}
              placeholder='"O sistema transformou completamente a gestão do nosso estoque..."'
              rows={3} className="resize-none text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-[#1d1d1f] mb-1.5 block">Nome do autor</Label>
              <Input value={form.testimonial_author || ''} onChange={(e) => set('testimonial_author', e.target.value)}
                placeholder="Ex: João Silva" className="h-9 text-sm" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-[#1d1d1f] mb-1.5 block">Cargo / Empresa</Label>
              <Input value={form.testimonial_role || ''} onChange={(e) => set('testimonial_role', e.target.value)}
                placeholder="Ex: CEO, Rede Farma" className="h-9 text-sm" />
            </div>
          </div>
          {form.testimonial_quote && (
            <div className="rounded-2xl p-5 space-y-3" style={{ background: '#0a0a0c' }}>
              <Quote className="w-6 h-6" style={{ color: themeHex }} />
              <p className="text-white/80 text-sm leading-relaxed italic">"{form.testimonial_quote}"</p>
              {(form.testimonial_author || form.testimonial_role) && (
                <div>
                  {form.testimonial_author && <p className="text-white text-xs font-bold">{form.testimonial_author}</p>}
                  {form.testimonial_role && <p className="text-white/50 text-xs">{form.testimonial_role}</p>}
                </div>
              )}
            </div>
          )}
        </div>
      </FieldGroup>

      <FieldGroup title="FAQ" desc="Perguntas e respostas frequentes sobre esta solução">
        <div className="space-y-2">
          {(form.faq_json || []).map((faq, i) => (
            <div key={i} className="p-3 rounded-xl group space-y-2" style={{ background: '#f5f5f7' }}>
              <div className="flex items-center gap-2">
                <Input value={faq.question} placeholder="Pergunta..." className="h-8 text-sm bg-white flex-1"
                  onChange={(e) => { const a = [...(form.faq_json || [])]; a[i] = { ...a[i], question: e.target.value }; set('faq_json', a); }} />
                <button onClick={() => set('faq_json', (form.faq_json || []).filter((_, j) => j !== i))}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition opacity-0 group-hover:opacity-100 flex-shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <Textarea value={faq.answer} placeholder="Resposta..." rows={2}
                className="resize-none text-sm bg-white"
                onChange={(e) => { const a = [...(form.faq_json || [])]; a[i] = { ...a[i], answer: e.target.value }; set('faq_json', a); }} />
            </div>
          ))}
          <Button variant="outline" size="sm" className="w-full h-9 text-xs gap-1.5"
            onClick={() => set('faq_json', [...(form.faq_json || []), { question: '', answer: '' }])}>
            <Plus className="w-3.5 h-3.5" /> Adicionar pergunta
          </Button>
        </div>
      </FieldGroup>
    </div>
  );

  // ── Tab: Mídia ──
  const tabMedia = (
    <div className="space-y-8">
      <FieldGroup title="Vídeo" desc="Embed de vídeo do YouTube">
        <div className="space-y-3">
          <div>
            <Label className="text-xs font-semibold text-[#1d1d1f] mb-1.5 block">URL do Vídeo (YouTube)</Label>
            <Input value={form.video_url || ''} onChange={(e) => set('video_url', e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..." className="h-10" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-[#1d1d1f] mb-1.5 block">Título acima do vídeo (opcional)</Label>
            <Input value={form.video_title || ''} onChange={(e) => set('video_title', e.target.value)}
              placeholder="Ex: Veja o sistema em 2 minutos" className="h-9" />
          </div>
          {form.video_url && (() => {
            const m = form.video_url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
            const id = m ? m[1] : null;
            return id ? (
              <div className="rounded-xl overflow-hidden" style={{ paddingTop: '56.25%', position: 'relative', background: '#000' }}>
                <iframe className="absolute inset-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${id}?rel=0`}
                  title="preview" allowFullScreen />
              </div>
            ) : <p className="text-xs text-red-500">URL inválida. Use um link do YouTube.</p>;
          })()}
        </div>
      </FieldGroup>

      <FieldGroup title="Screenshots / Galeria" desc="Imagens do sistema em ação (máx. 6)">
        <div className="space-y-3">
          <div>
            <Label className="text-xs font-semibold text-[#1d1d1f] mb-1.5 block">Título da galeria (opcional)</Label>
            <Input value={form.screenshots_title || ''} onChange={(e) => set('screenshots_title', e.target.value)}
              placeholder="Ex: Interface moderna e intuitiva" className="h-9" />
          </div>
          {(form.screenshots_json || []).length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {(form.screenshots_json || []).map((src, i) => {
                const imgSrc = resolveImg(src);
                return (
                  <div key={i} className="relative group rounded-xl overflow-hidden"
                    style={{ aspectRatio: '16/9', background: '#f5f5f7' }}>
                    {imgSrc && <img src={imgSrc} alt="" className="w-full h-full object-cover" />}
                    <button
                      onClick={() => set('screenshots_json', (form.screenshots_json || []).filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      style={{ background: 'rgba(0,0,0,.6)', color: '#fff' }}>
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          {(form.screenshots_json || []).length < 6 && (
            <label className="flex items-center justify-center gap-2 w-full h-10 rounded-xl border-2 border-dashed cursor-pointer transition text-xs font-medium"
              style={{ borderColor: 'rgba(0,0,0,.12)', color: '#98989d' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#f97316'; (e.currentTarget as HTMLElement).style.color = '#f97316'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,.12)'; (e.currentTarget as HTMLElement).style.color = '#98989d'; }}>
              <Camera className="w-3.5 h-3.5" />
              Adicionar screenshot ({(form.screenshots_json || []).length}/6)
              <input type="file" accept="image/*" className="hidden" multiple
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  const slots = 6 - (form.screenshots_json || []).length;
                  const uploaded: string[] = [];
                  for (const file of files.slice(0, slots)) {
                    const fd = new FormData(); fd.append('image', file);
                    const res = await fetch(`${API_URL}/admin/upload`, {
                      method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, body: fd,
                    });
                    if (res.ok) { const { url } = await res.json(); uploaded.push(url); }
                  }
                  if (uploaded.length) set('screenshots_json', [...(form.screenshots_json || []), ...uploaded]);
                  e.target.value = '';
                }} />
            </label>
          )}
        </div>
      </FieldGroup>
    </div>
  );

  // ── Tab: CTA & SEO ──
  const tabCTA = (
    <div className="space-y-8">
      <FieldGroup title="CTA Principal" desc="Seção de chamada para ação no final da página">
        <div className="space-y-4">
          <div>
            <Label className="text-xs font-semibold text-[#1d1d1f] mb-1.5 block">Título do CTA</Label>
            <Input value={form.cta_title || ''} onChange={(e) => set('cta_title', e.target.value)}
              placeholder="Ex: Pronto para transformar seu negócio?" className="h-10" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-[#1d1d1f] mb-1.5 block">Descrição do CTA</Label>
            <Textarea value={form.cta_description || ''} onChange={(e) => set('cta_description', e.target.value)}
              placeholder="Ex: Fale com nossos especialistas e descubra como podemos ajudar."
              rows={2} className="resize-none text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-[#1d1d1f] mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#f97316]" /> Botão principal
              </Label>
              <Input value={form.cta_button_label || ''} onChange={(e) => set('cta_button_label', e.target.value)}
                placeholder="Falar com Especialista" className="h-9" />
            </div>
            <div>
              <Label className="text-xs font-semibold text-[#1d1d1f] mb-1.5 block">Botão secundário (opcional)</Label>
              <Input value={form.secondary_cta_label || ''} onChange={(e) => set('secondary_cta_label', e.target.value)}
                placeholder="Ex: Ver demonstração" className="h-9" />
            </div>
          </div>
          <div>
            <Label className="text-xs font-semibold text-[#1d1d1f] mb-1.5 block">Link do botão secundário</Label>
            <Input value={form.secondary_cta_link || ''} onChange={(e) => set('secondary_cta_link', e.target.value)}
              placeholder="Ex: /solucoes ou https://..." className="h-9 text-sm" />
          </div>

          {/* CTA Preview */}
          <div className="rounded-2xl p-5 text-center" style={{ background: `linear-gradient(135deg, ${themeHex}, ${themeHex}cc)` }}>
            <p className="text-white font-bold text-base mb-1" style={{ fontFamily: "'Outfit',sans-serif" }}>
              {form.cta_title || 'Pronto para transformar seu negócio?'}
            </p>
            <p className="text-white/70 text-xs mb-4">{form.cta_description || 'Fale com um especialista hoje.'}</p>
            <div className="flex gap-2 justify-center flex-wrap">
              <span className="inline-block px-5 py-2 rounded-xl bg-white text-sm font-bold" style={{ color: themeHex }}>
                {form.cta_button_label || 'Falar com Especialista'}
              </span>
              {form.secondary_cta_label && (
                <span className="inline-block px-5 py-2 rounded-xl text-sm font-semibold text-white" style={{ border: '1px solid rgba(255,255,255,.4)', background: 'rgba(255,255,255,.12)' }}>
                  {form.secondary_cta_label}
                </span>
              )}
            </div>
          </div>
        </div>
      </FieldGroup>

      <FieldGroup title="SEO" desc="Metadados para mecanismos de busca">
        <div className="space-y-3">
          <div>
            <Label className="text-xs font-semibold text-[#1d1d1f] mb-1.5 block">Título SEO</Label>
            <Input value={form.meta_title || ''} onChange={(e) => set('meta_title', e.target.value)}
              placeholder="Ex: ERP para Varejo | Unimaxx" className="h-10" />
            <p className="text-[11px] text-[#98989d] mt-1">{(form.meta_title || '').length}/60 chars</p>
          </div>
          <div>
            <Label className="text-xs font-semibold text-[#1d1d1f] mb-1.5 block">Descrição SEO</Label>
            <Textarea value={form.meta_description || ''} onChange={(e) => set('meta_description', e.target.value)}
              placeholder="Descrição que aparece no Google..." rows={2} className="resize-none text-sm" />
            <p className="text-[11px] text-[#98989d] mt-1">{(form.meta_description || '').length}/160 chars</p>
          </div>
        </div>
      </FieldGroup>
    </div>
  );

  const tabContent_ = { identity: tabIdentity, content: tabContent, proof: tabProof, media: tabMedia, cta: tabCTA };

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white flex-shrink-0" style={{ borderColor: 'rgba(0,0,0,.07)' }}>
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition">
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
          <div>
            <h2 className="font-bold text-[#1d1d1f] text-base" style={{ fontFamily: "'Outfit',sans-serif" }}>
              {isNew ? 'Nova Página' : `Editando: ${page.title}`}
            </h2>
            <p className="text-xs text-[#98989d]">/solucao-page/{form.slug || 'slug-aqui'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          {!isNew && (
            <a href={`/solucao-page/${form.slug}`} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-gray-100 transition">
              <ExternalLink className="w-3.5 h-3.5" /> Ver no site
            </a>
          )}
          <Button onClick={handleSave} disabled={saving} size="sm"
            className="flex items-center gap-1.5 font-bold px-5 rounded-xl"
            style={{ background: '#f97316', color: '#fff' }}>
            <span className="flex items-center gap-1.5">
              {saving
                ? <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /><span>Salvando...</span></span>
                : <span className="flex items-center gap-2"><Save className="w-4 h-4" /><span>Salvar</span></span>}
            </span>
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: tabs + form */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b bg-white flex-shrink-0 px-4" style={{ borderColor: 'rgba(0,0,0,.07)' }}>
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-4 py-3 text-xs font-semibold transition-all relative whitespace-nowrap"
                style={{ color: activeTab === tab.id ? '#f97316' : '#98989d' }}>
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ background: '#f97316' }} />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto bg-[#fafafa]">
            <div className="max-w-2xl mx-auto p-6 pb-12">
              {tabContent_[activeTab as keyof typeof tabContent_]}
            </div>
          </div>
        </div>

        {/* RIGHT: preview panel */}
        <div className="w-72 xl:w-80 border-l overflow-y-auto flex-shrink-0 hidden lg:block" style={{ borderColor: 'rgba(0,0,0,.07)', background: '#f5f5f7' }}>
          <div className="p-4 space-y-4">
            <p className="text-[10px] font-bold text-[#98989d] uppercase tracking-widest">Preview</p>

            {/* Hero mini */}
            <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: '16/9', position: 'relative', background: `linear-gradient(135deg,${themeHex},${themeHex}88)` }}>
              {heroUrl && <img src={heroUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />}
              <div className="absolute inset-0" style={{ background: heroUrl ? 'linear-gradient(110deg,rgba(5,5,8,.88) 0%,rgba(5,5,8,.4) 100%)' : 'rgba(0,0,0,.2)' }} />
              <div className="absolute inset-0 p-3 flex flex-col justify-end">
                <p className="text-white font-bold text-sm leading-tight line-clamp-2" style={{ fontFamily: "'Outfit',sans-serif" }}>
                  {form.title || 'Título da página'}
                </p>
                {form.subtitle && <p className="text-white/55 text-[10px] mt-0.5 line-clamp-1">{form.subtitle}</p>}
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between bg-white rounded-xl p-3 border" style={{ borderColor: 'rgba(0,0,0,.07)' }}>
              <span className="text-xs text-[#6e6e73]">Status</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${form.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {form.is_active ? '● Ativa' : '○ Inativa'}
              </span>
            </div>

            {/* Theme */}
            <div className="rounded-xl p-3 text-white text-center" style={{ background: `linear-gradient(135deg,${themeHex},${themeHex}99)` }}>
              <p className="text-[10px] opacity-70 uppercase tracking-wider">Tema</p>
              <p className="font-bold text-sm capitalize">{COLOR_OPTIONS.find(c => c.v === form.color_theme)?.label || 'Laranja'}</p>
            </div>

            {/* Content summary */}
            <div className="bg-white rounded-xl border p-3 space-y-2" style={{ borderColor: 'rgba(0,0,0,.07)' }}>
              <p className="text-[10px] font-bold text-[#98989d] uppercase tracking-widest mb-2">Conteúdo</p>
              {[
                { label: 'Stats',          count: (form.stats_json || []).length },
                { label: 'Funcionalidades', count: form.features.length },
                { label: 'Benefícios',      count: form.benefits.length },
                { label: 'Diferenciais',    count: (form.differentials_json || []).length },
                { label: 'Passos',          count: (form.steps_json || []).length },
                { label: 'Integrações',     count: form.integrations.length },
                { label: 'Screenshots',     count: (form.screenshots_json || []).length },
                { label: 'FAQ',             count: (form.faq_json || []).length },
              ].map(({ label, count }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-[#6e6e73]">{label}</span>
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${count > 0 ? 'bg-[#f97316]/10 text-[#f97316]' : 'text-gray-300'}`}>
                    {count > 0 ? count : '—'}
                  </span>
                </div>
              ))}
              {[
                { label: 'Vídeo',       has: !!form.video_url },
                { label: 'Depoimento',  has: !!form.testimonial_quote },
                { label: 'Destaque',    has: !!(form.highlight_title || form.highlight_text) },
                { label: 'CTA 2º',      has: !!form.secondary_cta_label },
              ].map(({ label, has }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-[#6e6e73]">{label}</span>
                  <span className={`text-xs font-bold ${has ? 'text-[#f97316]' : 'text-gray-300'}`}>{has ? '✓' : '—'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main exported component ───────────────────────────────────────────────
export default function SolutionPagesManager() {
  const [pages, setPages] = useState<SolutionPage[]>([]);
  const [editing, setEditing] = useState<SolutionPage | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(false);
  const { toast } = useToast();

  const token = () => localStorage.getItem('token') || '';

  React.useEffect(() => { fetchPages(); }, []);

  const fetchPages = async () => {
    setLoading(true); setError(false);
    try {
      const res = await fetch(`${API_URL}/admin/solution-pages`, { headers: { Authorization: `Bearer ${token()}` } });
      if (!res.ok) throw new Error();
      const raw = await res.json();
      const parsed = raw.map((p: any) => {
        const parseArr = (v: any) => {
          if (!v) return [];
          try { return typeof v === 'string' ? JSON.parse(v) : v; } catch { return []; }
        };
        return {
          ...p,
          features:            parseArr(p.features),
          benefits:            parseArr(p.benefits),
          integrations:        parseArr(p.integrations),
          stats_json:          parseArr(p.stats_json),
          faq_json:            parseArr(p.faq_json),
          steps_json:          parseArr(p.steps_json),
          differentials_json:  parseArr(p.differentials_json),
          screenshots_json:    parseArr(p.screenshots_json),
          is_active: !!p.is_active,
        };
      });
      setPages(parsed);
    } catch { setError(true); toast({ title: 'Erro ao carregar páginas', variant: 'destructive' }); }
    finally { setLoading(false); }
  };

  const handleSave = async (data: SolutionPage) => {
    const url = isNew ? `${API_URL}/admin/solution-pages` : `${API_URL}/admin/solution-pages/${data.id}`;
    const res = await fetch(url, {
      method: isNew ? 'POST' : 'PUT',
      headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const { error: e } = await res.json().catch(() => ({}));
      toast({ title: e || 'Erro ao salvar', variant: 'destructive' });
      throw new Error(e);
    }
    toast({ title: '✅ Página salva com sucesso!' });
    await fetchPages();
    setEditing(null);
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Excluir "${title}"? Esta ação não pode ser desfeita.`)) return;
    await fetch(`${API_URL}/admin/solution-pages/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    toast({ title: 'Página excluída.' });
    fetchPages();
  };

  const filtered = pages.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase())
  );

  if (editing) {
    return (
      <div className="h-full flex flex-col" style={{ minHeight: '100vh' }}>
        <PageEditor page={editing} isNew={isNew} onSave={handleSave} onCancel={() => setEditing(null)} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1d1d1f]" style={{ fontFamily: "'Outfit',sans-serif" }}>
            Páginas de Soluções
          </h1>
          <p className="text-sm text-[#6e6e73] mt-1">Edite o conteúdo de cada página de solução individualmente</p>
        </div>
        <Button onClick={() => { setEditing({ ...EMPTY }); setIsNew(true); }}
          className="flex items-center gap-2 font-bold rounded-xl px-5"
          style={{ background: '#f97316', color: '#fff' }}>
          <Plus className="w-4 h-4" /> Nova Página
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#98989d]" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar páginas..." className="pl-9 h-10" />
      </div>

      {loading && <div className="flex items-center justify-center py-16"><RefreshCw className="w-8 h-8 animate-spin text-[#f97316]" /></div>}
      {error && (
        <div className="text-center py-16">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-[#6e6e73] mb-4">Erro ao carregar páginas</p>
          <Button onClick={fetchPages} variant="outline">Tentar novamente</Button>
        </div>
      )}

      {!loading && !error && (
        <>
          {filtered.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed rounded-2xl" style={{ borderColor: 'rgba(0,0,0,.08)' }}>
              <Layers className="w-12 h-12 text-[#c7c7cc] mx-auto mb-4" />
              <p className="text-[#6e6e73] mb-2 font-medium">{search ? 'Nenhuma página encontrada' : 'Nenhuma página criada ainda'}</p>
              {!search && <p className="text-[#98989d] text-sm mb-6">Crie uma página para cada solução da empresa</p>}
              {!search && (
                <Button onClick={() => { setEditing({ ...EMPTY }); setIsNew(true); }} variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" /> Criar primeira página
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((p) => {
                const themeHex = COLOR_OPTIONS.find((c) => c.v === p.color_theme)?.hex || '#f97316';
                const sections = [
                  p.features.length > 0 && 'Funcionalidades',
                  p.benefits.length > 0 && 'Benefícios',
                  (p.differentials_json || []).length > 0 && 'Diferenciais',
                  (p.steps_json || []).length > 0 && 'Passos',
                  p.integrations.length > 0 && 'Integrações',
                  p.video_url && 'Vídeo',
                  (p.screenshots_json || []).length > 0 && 'Screenshots',
                  (p.faq_json || []).length > 0 && 'FAQ',
                  p.testimonial_quote && 'Depoimento',
                ].filter(Boolean);

                return (
                  <div key={p.id}
                    className="bg-white rounded-2xl border overflow-hidden hover:shadow-md transition-all duration-200"
                    style={{ borderColor: 'rgba(0,0,0,.06)' }}>
                    <div className="flex items-center gap-4 p-4">
                      <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: themeHex }} />
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0"
                        style={{ background: `linear-gradient(135deg,${themeHex}22,${themeHex}44)` }}>
                        {p.hero_image && resolveImg(p.hero_image)
                          ? <img src={resolveImg(p.hero_image)!} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center">
                              <Layers className="w-6 h-6" style={{ color: themeHex }} />
                            </div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <h3 className="font-bold text-[#1d1d1f] text-sm" style={{ fontFamily: "'Outfit',sans-serif" }}>{p.title}</h3>
                          <Badge className={`text-[11px] border-0 ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {p.is_active ? 'Ativa' : 'Inativa'}
                          </Badge>
                        </div>
                        <p className="text-xs text-[#98989d] mb-1.5">/solucao-page/{p.slug}</p>
                        <div className="flex flex-wrap gap-1">
                          {sections.slice(0, 6).map((s) => (
                            <span key={String(s)} className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                              style={{ background: `${themeHex}10`, color: themeHex }}>
                              {s}
                            </span>
                          ))}
                          {sections.length > 6 && (
                            <span className="text-[10px] text-[#98989d]">+{sections.length - 6}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <a href={`/solucao-page/${p.slug}`} target="_blank" rel="noreferrer"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#98989d] hover:text-[#1d1d1f] hover:bg-gray-100 transition">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button onClick={() => { setEditing(p); setIsNew(false); }}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition"
                          style={{ background: `${themeHex}10`, color: themeHex }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = `${themeHex}20`)}
                          onMouseLeave={(e) => (e.currentTarget.style.background = `${themeHex}10`)}>
                          <Pencil className="w-3.5 h-3.5" /> Editar
                        </button>
                        <button onClick={() => handleDelete(p.id, p.title)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#c7c7cc] hover:text-red-400 hover:bg-red-50 transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
