import { useState } from 'react';
import type React from 'react';

import {
  Plus, Pencil, Trash2, Check, Home, Image, X,
  ArrowUp, ArrowDown, Eye, EyeOff, ChevronRight, Search,
  // ── ícones do seletor ───────────────────────────────────────
  Shirt, Footprints, Pill, Sparkles, UtensilsCrossed,
  Bike, Gift, Tv, Glasses, Fuel, Store, TrendingUp, Users,
  Sandwich, Coffee, BookOpen, Dumbbell, Car, Plane, Heart,
  Package, Wrench, Star, Building2, Zap,
  Phone, Mail, Globe, MapPin, Clock, Calendar,
  BarChart2, Target, Award, Shield, Lock,
  Briefcase, FileText, Tag, Plug,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import type { Segment, Banner } from '@/types';
import { Button } from '@/components/ui/button';
import { ImageUploadField, SPECS } from '@/components/ImageUploadField';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { HomeSectionModal } from '@/admin/HomeSectionModal';
import { HOME_SECTION_CONFIGS } from '@/admin/homeSectionConfigs';

// ── Mapa de ícones ────────────────────────────────────────────────────────────

// Remove duplicatas
const ICONS_CLEAN: Record<string, React.ElementType> = {
  Shirt, Tag, Gift,
  Pill, Heart, Dumbbell,
  UtensilsCrossed, Sandwich, Coffee,
  Car, Bike, Fuel, Plane,
  Tv, Plug, Zap,
  Store, Package, Briefcase,
  Wrench,
  Users, Building2, Globe, Home, Glasses,
  TrendingUp, BarChart2, Target, Award, Star,
  Phone, Mail, MapPin, Clock, Calendar,
  Shield, Lock, BookOpen, FileText,
  Sparkles, Footprints,
};

// Map key names (SettingsIcon stored as 'Wrench' in DB for simplicity)
const ICON_GROUPS: { label: string; icons: string[] }[] = [
  { label: 'Moda & Vestuário', icons: ['Shirt', 'Tag', 'Gift'] },
  { label: 'Saúde & Bem-estar', icons: ['Pill', 'Heart', 'Dumbbell'] },
  { label: 'Alimentação', icons: ['UtensilsCrossed', 'Sandwich', 'Coffee'] },
  { label: 'Veículos', icons: ['Car', 'Bike', 'Fuel', 'Plane'] },
  { label: 'Tecnologia', icons: ['Tv', 'Plug', 'Zap'] },
  { label: 'Comércio & Varejo', icons: ['Store', 'Package', 'Briefcase'] },
  { label: 'Serviços', icons: ['Wrench'] },
  { label: 'Pessoas & Empresas', icons: ['Users', 'Building2', 'Globe', 'Home', 'Glasses'] },
  { label: 'Crescimento', icons: ['TrendingUp', 'BarChart2', 'Target', 'Award', 'Star'] },
  { label: 'Comunicação', icons: ['Phone', 'Mail', 'MapPin', 'Clock', 'Calendar'] },
  { label: 'Segurança & Legal', icons: ['Shield', 'Lock', 'BookOpen', 'FileText'] },
  { label: 'Outros', icons: ['Sparkles', 'Footprints'] },
];

const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3001/api';
const BASE_URL = API_URL.replace('/api', '');
const imgSrc = (p?: string) => !p ? '' : p.startsWith('http') ? p : `${BASE_URL}${p}`;

// ── Helpers UI ────────────────────────────────────────────────────────────────

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: 'rgba(0,0,0,.07)' }}>
      {children}
    </div>
  );
}

function CardHead({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(0,0,0,.06)', background: 'rgba(0,0,0,.01)' }}>
      <div>
        <p className="font-bold text-sm text-[#1d1d1f]">{title}</p>
        {subtitle && <p className="text-xs text-[#98989d] mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div>
        <label className="text-xs font-semibold text-[#1d1d1f]">{label}</label>
        {hint && <p className="text-[11px] text-[#98989d] mt-0.5">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

// ── Seletor visual de ícones ──────────────────────────────────────────────────

function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const CurrentIcon = ICONS_CLEAN[value] || Shirt;

  const filtered = search.trim()
    ? Object.keys(ICONS_CLEAN).filter(k => k.toLowerCase().includes(search.toLowerCase()))
    : null;

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-[#1d1d1f]">Ícone</label>

      {/* Botão trigger */}
      <button type="button" onClick={() => setOpen(!open)}
        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl border text-sm text-left transition hover:border-orange-300"
        style={{ borderColor: open ? '#f97316' : 'rgba(0,0,0,.12)', background: open ? 'rgba(249,115,22,.03)' : '#fff' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(249,115,22,.1)' }}>
          <CurrentIcon size={16} style={{ color: '#f97316' }} />
        </div>
        <span className="flex-1 text-[#1d1d1f] font-medium">{value || 'Selecionar ícone'}</span>
        <span className="text-[#98989d] text-xs">{open ? 'Fechar ▲' : 'Trocar ▼'}</span>
      </button>

      {/* Painel */}
      {open && (
        <div className="rounded-xl border overflow-hidden shadow-lg" style={{ borderColor: 'rgba(0,0,0,.1)' }}>
          {/* Busca */}
          <div className="px-3 py-2.5 border-b flex items-center gap-2" style={{ borderColor: 'rgba(0,0,0,.07)', background: '#fafafa' }}>
            <Search size={13} className="text-[#98989d] flex-shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar ícone... (ex: car, shop, health)"
              className="flex-1 text-sm bg-transparent outline-none text-[#1d1d1f] placeholder:text-[#c0c0c0]"
              autoFocus
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-[#98989d] hover:text-[#1d1d1f]">
                <X size={12} />
              </button>
            )}
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: 320 }}>
            {filtered ? (
              /* Resultado de busca */
              <div className="p-3">
                {filtered.length === 0 ? (
                  <p className="text-center text-xs text-[#98989d] py-4">Nenhum ícone encontrado</p>
                ) : (
                  <div className="grid grid-cols-8 gap-1">
                    {filtered.map(name => {
                      const Ic = ICONS_CLEAN[name];
                      const sel = value === name;
                      return (
                        <button key={name} type="button"
                          onClick={() => { onChange(name); setOpen(false); setSearch(''); }}
                          title={name}
                          className="flex flex-col items-center gap-1 p-2 rounded-lg transition group"
                          style={{ background: sel ? 'rgba(249,115,22,.12)' : undefined }}
                          onMouseEnter={e => { if (!sel) (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,.04)'; }}
                          onMouseLeave={e => { if (!sel) (e.currentTarget as HTMLElement).style.background = ''; }}>
                          <Ic size={18} style={{ color: sel ? '#f97316' : '#6e6e73' }} />
                          <span className="text-[9px] text-[#98989d] truncate w-full text-center leading-tight">{name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* Grupos */
              ICON_GROUPS.map(group => {
                const icons = group.icons.filter(n => ICONS_CLEAN[n]);
                if (!icons.length) return null;
                return (
                  <div key={group.label} className="border-b last:border-0" style={{ borderColor: 'rgba(0,0,0,.05)' }}>
                    <p className="px-3 pt-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#98989d]">
                      {group.label}
                    </p>
                    <div className="grid grid-cols-8 gap-1 px-3 pb-3">
                      {icons.map(name => {
                        const Ic = ICONS_CLEAN[name];
                        const sel = value === name;
                        return (
                          <button key={name} type="button"
                            onClick={() => { onChange(name); setOpen(false); }}
                            title={name}
                            className="flex flex-col items-center gap-1 p-2 rounded-lg transition"
                            style={{ background: sel ? 'rgba(249,115,22,.12)' : undefined }}
                            onMouseEnter={e => { if (!sel) (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,.04)'; }}
                            onMouseLeave={e => { if (!sel) (e.currentTarget as HTMLElement).style.background = ''; }}>
                            <Ic size={18} style={{ color: sel ? '#f97316' : '#6e6e73' }} />
                            <span className="text-[9px] text-[#98989d] truncate w-full text-center leading-tight">{name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function SegmentsManager() {
  const { data, updateSegment, deleteSegment, uploadImage, addBanner, updateBanner, deleteBanner, getBannersByPage } = useData();
  const { toast } = useToast();

  const segments = (data.segments || []).sort((a: Segment, b: Segment) => a.order_num - b.order_num);
  const activeCount = segments.filter((s: Segment) => s.active === 1).length;
  const homeCount = segments.filter((s: Segment) => s.active === 1 && s.show_home !== 0).length;

  const [editing, setEditing] = useState<Segment | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const banners = getBannersByPage('segmentos');
  const [bannerForm, setBannerForm] = useState<Partial<Banner>>({});
  const [editingBannerId, setEditingBannerId] = useState<number | null>(null);
  const [savingBanner, setSavingBanner] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // ── Ops ───────────────────────────────────────────────────────

  const openNew = () => setEditing({
    id: '', segment_id: `seg-${Date.now()}`,
    name: '', description: '', icon: 'Store',
    order_num: segments.length, active: 1, show_home: 1,
  });

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await updateSegment(editing);
      setEditing(null);
      toast({ title: '✅ Segmento salvo!' });
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Excluir "${name}"?`)) return;
    try {
      await deleteSegment(id);
      if (editing?.segment_id === id) setEditing(null);
      toast({ title: 'Segmento excluído.' });
    } catch { toast({ title: 'Erro ao excluir', variant: 'destructive' }); }
  };

  const toggleActive = async (seg: Segment) => {
    try { await updateSegment({ ...seg, active: seg.active === 1 ? 0 : 1 }); }
    catch { toast({ title: 'Erro', variant: 'destructive' }); }
  };

  const toggleHome = async (seg: Segment) => {
    try { await updateSegment({ ...seg, show_home: seg.show_home === 0 ? 1 : 0 }); }
    catch { toast({ title: 'Erro', variant: 'destructive' }); }
  };

  const moveOrder = async (seg: Segment, dir: -1 | 1) => {
    const idx = segments.findIndex((s: Segment) => s.segment_id === seg.segment_id);
    const other = segments[idx + dir] as Segment | undefined;
    if (!other) return;
    try {
      await Promise.all([
        updateSegment({ ...seg, order_num: other.order_num }),
        updateSegment({ ...other, order_num: seg.order_num }),
      ]);
    } catch { toast({ title: 'Erro ao reordenar', variant: 'destructive' }); }
  };

  const startNewBanner = () => { setEditingBannerId(null); setBannerForm({ title: '', subtitle: '', description: '', image: '', cta_text: '', cta_link: '', page: 'segmentos', active: 1, use_default_bg: 0 }); };
  const startEditBanner = (b: Banner) => { setEditingBannerId(b.id ?? null); setBannerForm({ ...b }); };
  const cancelBanner = () => { setEditingBannerId(null); setBannerForm({}); };

  const saveBanner = async () => {
    setSavingBanner(true);
    try {
      if (editingBannerId != null) {
        await updateBanner({ ...bannerForm, id: editingBannerId } as Banner);
        toast({ title: 'Banner atualizado!' });
      } else {
        await addBanner({ ...bannerForm, order_num: banners.length, page: 'segmentos' } as Banner);
        toast({ title: 'Banner criado!' });
      }
      cancelBanner();
    } catch { toast({ title: 'Erro ao salvar', variant: 'destructive' }); }
    finally { setSavingBanner(false); }
  };

  const removeBanner = async (id: number) => {
    if (!confirm('Excluir este banner?')) return;
    try { await deleteBanner(id); toast({ title: 'Banner excluído.' }); }
    catch { toast({ title: 'Erro', variant: 'destructive' }); }
  };

  const showBannerForm = editingBannerId !== null || Object.keys(bannerForm).length > 0;
  const isNew = !editing?.id;

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="min-h-full bg-[#fafafa]">

      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex items-center justify-between"
        style={{ borderColor: 'rgba(0,0,0,.07)' }}>
        <div>
          <h1 className="font-bold text-[#1d1d1f] text-xl" style={{ fontFamily: "'Outfit',sans-serif" }}>Segmentos</h1>
          <p className="text-xs text-[#98989d] mt-0.5">
            {activeCount} ativos · <span style={{ color: '#f97316', fontWeight: 600 }}>{homeCount} na home</span>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <HomeSectionModal
            section={HOME_SECTION_CONFIGS.segments}
            trigger={
              <Button variant="outline" className="rounded-xl">
                <FileText className="w-4 h-4 mr-2" /> Texto da home
              </Button>
            }
          />
          <Button onClick={openNew}
            className="flex items-center gap-2 font-bold rounded-xl px-5 bg-orange-600 hover:bg-orange-700 text-white">
            <Plus size={15} /> Novo Segmento
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">

        {/* Layout principal */}
        <div className={`grid gap-6 ${editing ? 'lg:grid-cols-[1fr_420px]' : 'grid-cols-1'}`}>

          {/* ── Lista ── */}
          <SectionCard>
            <CardHead title="Segmentos cadastrados" subtitle="Clique para editar · passe o mouse para ver ações" />

            {segments.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center px-6">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
                  <Store size={22} className="text-orange-400" />
                </div>
                <p className="font-semibold text-[#1d1d1f] mb-1">Nenhum segmento</p>
                <p className="text-sm text-[#98989d] mb-4">Crie o primeiro segmento para exibir no site</p>
                <Button onClick={openNew} variant="outline" className="border-orange-200 text-orange-600 hover:bg-orange-50">
                  <Plus size={14} className="mr-2" /> Adicionar segmento
                </Button>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'rgba(0,0,0,.05)' }}>
                {segments.map((seg: Segment, idx: number) => {
                  const isActive = seg.active === 1;
                  const onHome = seg.show_home !== 0;
                  const isSelected = editing?.segment_id === seg.segment_id;
                  const thumb = imgSrc(seg.image);
                  const SegIcon = ICONS_CLEAN[seg.icon] || Store;

                  return (
                    <div key={seg.segment_id}
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer group transition-colors"
                      style={{ background: isSelected ? 'rgba(249,115,22,.04)' : undefined }}
                      onClick={() => setEditing(isSelected ? null : { ...seg })}>

                      {/* Ícone por padrão → imagem ao hover */}
                      <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 relative flex items-center justify-center"
                        style={{ background: 'rgba(249,115,22,.08)' }}>
                        {/* Imagem: escondida por padrão, aparece no hover */}
                        {thumb && (
                          <img src={thumb} alt=""
                            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        )}
                        {/* Ícone: visível por padrão, some no hover (só se tiver imagem) */}
                        <div className={`relative z-10 flex items-center justify-center transition-opacity duration-200 ${thumb ? 'group-hover:opacity-0' : ''}`}>
                          <SegIcon size={20} style={{ color: '#f97316' }} />
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-[#1d1d1f] truncate">{seg.name || '(sem nome)'}</p>
                          {!isActive && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-400 flex-shrink-0">Inativo</span>
                          )}
                        </div>
                        <p className="text-xs text-[#98989d] truncate mt-0.5">
                          {seg.description?.split('\n')[0] || <span className="italic">Sem descrição</span>}
                        </p>
                      </div>

                      {/* Actions on hover */}
                      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={e => e.stopPropagation()}>
                        <button onClick={() => moveOrder(seg, -1)} disabled={idx === 0}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#98989d] hover:bg-gray-100 disabled:opacity-20 transition">
                          <ArrowUp size={13} />
                        </button>
                        <button onClick={() => moveOrder(seg, 1)} disabled={idx === segments.length - 1}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#98989d] hover:bg-gray-100 disabled:opacity-20 transition">
                          <ArrowDown size={13} />
                        </button>
                        <button onClick={() => toggleHome(seg)} title={onHome ? 'Remover da home' : 'Mostrar na home'}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition"
                          style={{ background: onHome ? 'rgba(249,115,22,.12)' : 'rgba(0,0,0,.04)', color: onHome ? '#f97316' : '#c0c0c0' }}>
                          <Home size={13} />
                        </button>
                        <button onClick={() => toggleActive(seg)} title={isActive ? 'Desativar' : 'Ativar'}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition"
                          style={{ background: isActive ? 'rgba(34,197,94,.1)' : 'rgba(0,0,0,.04)', color: isActive ? '#16a34a' : '#c0c0c0' }}>
                          {isActive ? <Eye size={13} /> : <EyeOff size={13} />}
                        </button>
                        <button onClick={() => handleDelete(seg.segment_id, seg.name)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#98989d] hover:text-red-500 hover:bg-red-50 transition">
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <ChevronRight size={14} className="flex-shrink-0 transition-transform"
                        style={{ color: isSelected ? '#f97316' : '#d0d0d0', transform: isSelected ? 'rotate(90deg)' : 'none' }} />
                    </div>
                  );
                })}
              </div>
            )}

            {segments.length > 0 && (
              <div className="px-4 py-3 border-t flex flex-wrap gap-4 text-[11px] text-[#98989d]"
                style={{ borderColor: 'rgba(0,0,0,.05)', background: 'rgba(0,0,0,.01)' }}>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-orange-100 inline-block" /> home</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-100 inline-block" /> ativo</span>
                <span className="ml-auto">Passe o mouse para ver ações</span>
              </div>
            )}
          </SectionCard>

          {/* ── Editor ── */}
          {editing && (
            <SectionCard>
              <CardHead
                title={isNew ? 'Novo Segmento' : 'Editar Segmento'}
                subtitle={!isNew ? editing.name : undefined}
                action={
                  <button onClick={() => setEditing(null)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-[#98989d] hover:bg-gray-100 transition">
                    <X size={15} />
                  </button>
                }
              />
              <div className="p-5 space-y-5">

                <Field label="Nome do segmento">
                  <Input value={editing.name}
                    onChange={e => setEditing({ ...editing, name: e.target.value })}
                    placeholder="Ex: Farmácias, Supermercados..." className="h-10" />
                </Field>

                {/* Seletor visual de ícone */}
                <IconPicker
                  value={editing.icon || 'Store'}
                  onChange={v => setEditing({ ...editing, icon: v })}
                />

                <Field label="Descrição"
                  hint="1ª linha = subtítulo. Linhas seguintes = tópicos com bullet.">
                  <textarea
                    value={editing.description || ''}
                    onChange={e => setEditing({ ...editing, description: e.target.value })}
                    placeholder={"Soluções para o setor\nGestão de estoque integrada\nControle de validade\nPDV especializado"}
                    rows={5}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
                    style={{ borderColor: 'rgba(0,0,0,.1)', lineHeight: 1.7 }} />
                </Field>

                <Field label="Imagem de fundo" hint="Aparece no card do segmento">
                  <ImageUploadField
                    value={editing.image || ''}
                    onChange={url => setEditing({ ...editing, image: url })}
                    onUpload={async file => {
                      setUploading(true);
                      try {
                        const url = await uploadImage(file);
                        setEditing(e => e ? { ...e, image: url } : e);
                        toast({ title: 'Upload realizado!' });
                      } catch { toast({ title: 'Erro no upload', variant: 'destructive' }); }
                      finally { setUploading(false); }
                    }}
                    uploading={uploading}
                    spec={SPECS.segmentCard}
                    height={120}
                  />
                </Field>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#f5f5f7' }}>
                    <div>
                      <p className="text-sm font-semibold text-[#1d1d1f]">Mostrar na home</p>
                      <p className="text-[11px] text-[#98989d]">Aparece na seção de segmentos da página principal</p>
                    </div>
                    <Switch checked={editing.show_home !== 0} onCheckedChange={v => setEditing({ ...editing, show_home: v ? 1 : 0 })} />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#f5f5f7' }}>
                    <div>
                      <p className="text-sm font-semibold text-[#1d1d1f]">Segmento ativo</p>
                      <p className="text-[11px] text-[#98989d]">Visível no site para os visitantes</p>
                    </div>
                    <Switch checked={editing.active === 1} onCheckedChange={v => setEditing({ ...editing, active: v ? 1 : 0 })} />
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button onClick={handleSave} disabled={saving || !editing.name.trim()}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl">
                    {saving ? 'Salvando...' : <><Check size={14} className="mr-1.5" />{isNew ? 'Criar segmento' : 'Salvar alterações'}</>}
                  </Button>
                  <Button variant="outline" onClick={() => setEditing(null)} className="rounded-xl">Cancelar</Button>
                </div>
              </div>
            </SectionCard>
          )}
        </div>

        {/* ── Banner ── */}
        <SectionCard>
          <CardHead
            title="Banner da Página de Segmentos"
            subtitle="Topo da página /segmentos"
            action={!showBannerForm
              ? <Button onClick={startNewBanner} size="sm" className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs px-3">
                <Plus size={13} className="mr-1" /> Novo Banner
              </Button>
              : undefined}
          />
          <div className="px-5 py-2 border-b text-xs text-blue-700 bg-blue-50" style={{ borderColor: 'rgba(59,130,246,.12)' }}>
            Se não houver banner ativo, o hero padrão é exibido (editável em <strong>Textos do Site</strong>).
          </div>

          {showBannerForm && (
            <div className="p-5 space-y-4 border-b" style={{ borderColor: 'rgba(0,0,0,.06)' }}>
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm text-[#1d1d1f]">{editingBannerId != null ? 'Editar banner' : 'Novo banner'}</p>
                <button onClick={cancelBanner} className="w-7 h-7 rounded-lg flex items-center justify-center text-[#98989d] hover:bg-gray-100 transition"><X size={14} /></button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Título">
                  <Input value={bannerForm.title || ''} onChange={e => setBannerForm(f => ({ ...f, title: e.target.value }))} placeholder="Título do banner" className="h-10" />
                </Field>
                <Field label="Badge / subtítulo">
                  <Input value={bannerForm.subtitle || ''} onChange={e => setBannerForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="Ex: Segmentos de Mercado" className="h-10" />
                </Field>
                <Field label="Texto do botão">
                  <Input value={bannerForm.cta_text || ''} onChange={e => setBannerForm(f => ({ ...f, cta_text: e.target.value }))} placeholder="Ex: Ver Soluções" className="h-10" />
                </Field>
                <Field label="Link do botão">
                  <Input value={bannerForm.cta_link || ''} onChange={e => setBannerForm(f => ({ ...f, cta_link: e.target.value }))} placeholder="/solucoes" className="h-10" />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Descrição">
                    <textarea value={bannerForm.description || ''} onChange={e => setBannerForm(f => ({ ...f, description: e.target.value }))}
                      rows={2} placeholder="Texto de apoio..."
                      className="w-full px-3 py-2.5 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
                      style={{ borderColor: 'rgba(0,0,0,.1)' }} />
                  </Field>
                </div>
              </div>
              <Field label="Imagem de fundo">
                <ImageUploadField
                  value={bannerForm.image || ''}
                  onChange={url => setBannerForm(f => ({ ...f, image: url }))}
                  onUpload={async file => {
                    setUploadingBanner(true);
                    try { const url = await uploadImage(file); setBannerForm(f => ({ ...f, image: url })); toast({ title: 'Imagem enviada!' }); }
                    catch { toast({ title: 'Erro', variant: 'destructive' }); }
                    finally { setUploadingBanner(false); }
                  }}
                  uploading={uploadingBanner}
                  spec={{ dimensions: '1440 × 560 px', formats: 'JPG, PNG, WEBP', maxSize: '3 MB', where: 'Topo da página de segmentos' }}
                  height={100}
                />
              </Field>
              <div className="flex gap-2">
                <Button onClick={saveBanner} disabled={savingBanner} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl">
                  {savingBanner ? 'Salvando...' : <><Check size={14} className="mr-1.5" />Salvar banner</>}
                </Button>
                <Button variant="outline" onClick={cancelBanner} className="rounded-xl">Cancelar</Button>
              </div>
            </div>
          )}

          {banners.length === 0 && !showBannerForm ? (
            <div className="flex flex-col items-center py-10 text-center">
              <Image size={28} className="text-[#d0d0d0] mb-2" />
              <p className="text-sm text-[#98989d]">Nenhum banner cadastrado</p>
              <button onClick={startNewBanner} className="mt-2 text-xs font-medium text-orange-500 hover:text-orange-700 transition">+ Adicionar banner</button>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'rgba(0,0,0,.05)' }}>
              {banners.map((b: Banner) => (
                <div key={b.id} className="flex items-center gap-4 px-5 py-3">
                  {b.image
                    ? <div className="w-16 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100"><img src={imgSrc(b.image)} alt="" className="w-full h-full object-cover" /></div>
                    : <div className="w-16 h-10 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center"><Image size={14} className="text-gray-300" /></div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1d1d1f] truncate">{b.title || '(sem título)'}</p>
                    <p className="text-xs text-[#98989d] truncate">{b.description || b.subtitle || '—'}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => startEditBanner(b)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#98989d] hover:bg-gray-100 transition"><Pencil size={13} /></button>
                    <button onClick={() => removeBanner(b.id!)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#98989d] hover:text-red-500 hover:bg-red-50 transition"><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

      </div>
    </div>
  );
}