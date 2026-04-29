// GenericPagesManager — CMS de páginas genéricas via Page Builder
import React, { useState, useEffect } from 'react';
import {
  Plus, Pencil, Trash2, Save, RefreshCw, ExternalLink,
  ArrowLeft, Search, FileText, AlertCircle, Globe,
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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const authH = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' });

interface GenericPage {
  id?: number;
  slug: string;
  title: string;
  meta_title: string;
  meta_description: string;
  is_active: boolean;
  blocks_json: PageBlock[];
}

const EMPTY: GenericPage = {
  slug: '', title: '', meta_title: '', meta_description: '',
  is_active: true, blocks_json: [],
};

function FL({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-1.5">
      <Label className="text-[12px] font-semibold text-[#1d1d1f]">{children}</Label>
      {hint && <p className="text-[11px] text-[#98989d] mt-0.5">{hint}</p>}
    </div>
  );
}

const TABS = [
  { id: 'construtor', label: '🧱 Construtor' },
  { id: 'meta',       label: '⚙️ Config & SEO' },
];

function Editor({ initial, isNew, onSave, onBack }: {
  initial: GenericPage; isNew: boolean;
  onSave: (data: GenericPage) => Promise<void>;
  onBack: () => void;
}) {
  const [form, setForm] = useState<GenericPage>(initial);
  const [tab, setTab] = useState('construtor');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const set = <K extends keyof GenericPage>(k: K, v: GenericPage[K]) =>
    setForm(p => ({ ...p, [k]: v }));

  const autoSlug = (title: string) => {
    if (!isNew) return;
    set('slug', title.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-'));
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast({ title: 'Título é obrigatório', variant: 'destructive' }); return; }
    if (!form.slug.trim()) { toast({ title: 'Slug é obrigatório', variant: 'destructive' }); return; }
    setSaving(true);
    try { await onSave(form); }
    catch (e: any) { toast({ title: e?.message || 'Erro ao salvar', variant: 'destructive' }); }
    finally { setSaving(false); }
  };

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
              {isNew ? 'Nova Página' : form.title || 'Editar Página'}
            </h2>
            <p className="text-[11px]" style={{ color: '#98989d' }}>/{form.slug || 'slug-aqui'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && form.slug && (
            <a href={`/p/${form.slug}`} target="_blank" rel="noreferrer"
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
        style={{ borderColor: 'rgba(0,0,0,.07)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="px-3.5 py-3 text-[13px] font-medium whitespace-nowrap transition border-b-2"
            style={{
              borderBottomColor: tab === t.id ? '#f97316' : 'transparent',
              color: tab === t.id ? '#f97316' : '#6e6e73',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto" style={{ background: '#fafafa' }}>
        <div className="max-w-2xl mx-auto p-5 pb-16 space-y-4">

          {tab === 'construtor' && (
            <div className="rounded-2xl border overflow-hidden bg-white" style={{ borderColor: 'rgba(0,0,0,.07)' }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(0,0,0,.06)', background: 'rgba(0,0,0,.01)' }}>
                <p className="font-bold text-sm text-[#1d1d1f]">Construtor de página</p>
                <p className="text-[11px]" style={{ color: '#98989d' }}>
                  Adicione e ordene blocos para montar o conteúdo da página.
                  {form.blocks_json.length > 0 && ` · ${form.blocks_json.filter(b => b.visible).length}/${form.blocks_json.length} visíveis`}
                </p>
              </div>
              <div className="p-4">
                <PageBuilder
                  blocks={form.blocks_json}
                  onChange={blocks => set('blocks_json', blocks)}
                />
              </div>
            </div>
          )}

          {tab === 'meta' && (
            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'rgba(0,0,0,.07)' }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(0,0,0,.06)', background: 'rgba(0,0,0,.01)' }}>
                <p className="font-bold text-sm text-[#1d1d1f]">Configurações & SEO</p>
              </div>
              <div className="p-5 space-y-4 bg-white">
                <div>
                  <FL hint="Nome da página no painel admin">Título *</FL>
                  <Input value={form.title}
                    onChange={(e) => { set('title', e.target.value); autoSlug(e.target.value); }}
                    placeholder="Ex: Sobre a Empresa" className="h-10" />
                </div>
                <div>
                  <FL hint="Usado na URL da página">Slug *</FL>
                  <div className="flex items-center">
                    <span className="px-3 h-10 flex items-center text-[12px] bg-[#f5f5f7] border border-r-0 rounded-l-xl flex-shrink-0"
                      style={{ borderColor: 'rgba(0,0,0,.1)', color: '#98989d' }}>
                      seusite.com/
                    </span>
                    <Input value={form.slug}
                      onChange={(e) => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      placeholder="sobre" className="h-10 rounded-l-none flex-1" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: '#f5f5f7' }}>
                  <div>
                    <p className="text-[13px] font-semibold text-[#1d1d1f]">Página ativa</p>
                    <p className="text-[11px]" style={{ color: '#98989d' }}>Visível para visitantes</p>
                  </div>
                  <Switch checked={form.is_active} onCheckedChange={(v) => set('is_active', v)} />
                </div>
                <hr style={{ borderColor: 'rgba(0,0,0,.07)' }} />
                <div>
                  <FL>Meta Title</FL>
                  <Input value={form.meta_title} onChange={(e) => set('meta_title', e.target.value)}
                    placeholder="Ex: Sobre a Unimaxx | Tecnologia para o Varejo" className="h-10" />
                  <p className="text-[11px] mt-1" style={{ color: form.meta_title.length > 60 ? '#ef4444' : '#98989d' }}>
                    {form.meta_title.length}/60 caracteres
                  </p>
                </div>
                <div>
                  <FL>Meta Description</FL>
                  <Textarea value={form.meta_description} onChange={(e) => set('meta_description', e.target.value)}
                    placeholder="Descrição para o Google..." rows={3} className="resize-none text-[13px]" />
                  <p className="text-[11px] mt-1" style={{ color: form.meta_description.length > 160 ? '#ef4444' : '#98989d' }}>
                    {form.meta_description.length}/160 caracteres
                  </p>
                </div>
                {/* Google preview */}
                <div className="p-4 rounded-xl border" style={{ borderColor: 'rgba(0,0,0,.08)', background: '#fafafa' }}>
                  <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: '#98989d' }}>Preview no Google</p>
                  <p className="text-[#1a0dab] text-[15px] font-medium leading-snug">
                    {form.meta_title || form.title || 'Título da página'}
                  </p>
                  <p className="text-[#006621] text-[12px] mt-0.5">
                    {`${window?.location?.origin || 'https://seusite.com'}/${form.slug || 'slug'}`}
                  </p>
                  <p className="text-[#4d5156] text-[13px] mt-0.5 leading-relaxed line-clamp-2">
                    {form.meta_description || 'Descrição da página...'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-2">
            <Button onClick={handleSave} disabled={saving} className="w-full h-12 font-bold text-[15px] rounded-2xl gap-2"
              style={{ background: '#f97316', color: '#fff', border: 'none' }}>
              {saving
                ? <><RefreshCw className="w-5 h-5 animate-spin" /> Salvando…</>
                : <><Save className="w-5 h-5" /> Salvar Página</>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── LIST VIEW ────────────────────────────────────────────────────────────────
export function GenericPagesManager() {
  const [pages, setPages] = useState<GenericPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<GenericPage | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/generic-pages`, { headers: authH() });
      const data = await res.json();
      const parseArr = (v: any): any[] => {
        if (!v) return [];
        try { return typeof v === 'string' ? JSON.parse(v) : v; } catch { return []; }
      };
      setPages(data.map((p: any) => ({ ...p, is_active: !!p.is_active, blocks_json: parseArr(p.blocks_json) })));
    } catch {
      toast({ title: 'Erro ao carregar páginas', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const handleSave = async (data: GenericPage) => {
    const body = {
      slug: data.slug, title: data.title,
      meta_title: data.meta_title, meta_description: data.meta_description,
      is_active: data.is_active, blocks_json: data.blocks_json,
    };
    const url = data.id
      ? `${API_URL}/admin/generic-pages/${data.id}`
      : `${API_URL}/admin/generic-pages`;
    const res = await fetch(url, {
      method: data.id ? 'PUT' : 'POST',
      headers: authH(), body: JSON.stringify(body),
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      throw new Error(e?.error || 'Erro ao salvar');
    }
    toast({ title: `✅ "${data.title}" salvo!` });
    setEditing(null);
    await fetchAll();
  };

  const handleDelete = async (page: GenericPage) => {
    if (!confirm(`Excluir "${page.title}"?`)) return;
    await fetch(`${API_URL}/admin/generic-pages/${page.id}`, { method: 'DELETE', headers: authH() });
    toast({ title: 'Página excluída.' });
    fetchAll();
  };

  if (editing) {
    return <Editor initial={editing} isNew={isNew} onSave={handleSave} onBack={() => setEditing(null)} />;
  }

  const filtered = pages.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1d1d1f]" style={{ fontFamily: "'Outfit',sans-serif" }}>
            Páginas do Site
          </h1>
          <p className="text-[13px] mt-0.5" style={{ color: '#6e6e73' }}>
            Crie e edite páginas customizadas usando o Page Builder
          </p>
        </div>
        <Button onClick={() => { setEditing({ ...EMPTY }); setIsNew(true); }}
          className="gap-2 font-bold rounded-xl px-5"
          style={{ background: '#f97316', color: '#fff', border: 'none' }}>
          <Plus style={{ width: 16, height: 16 }} /> Nova Página
        </Button>
      </div>

      <div className="relative mb-5">
        <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#98989d' }} />
        <Input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar páginas..." className="pl-10 h-10" />
      </div>

      <div className="flex items-start gap-3 p-4 rounded-2xl mb-5"
        style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
        <AlertCircle style={{ width: 16, height: 16, color: '#2563eb', flexShrink: 0, marginTop: 1 }} />
        <p className="text-[12px] leading-relaxed" style={{ color: '#1d4ed8' }}>
          Páginas criadas aqui ficam acessíveis em <strong>seusite.com/[slug]</strong>.
          Monte o conteúdo com o <strong>Page Builder</strong> e ative quando estiver pronta.
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="w-8 h-8 animate-spin" style={{ color: '#f97316' }} />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed rounded-2xl" style={{ borderColor: 'rgba(0,0,0,.08)' }}>
          <Globe style={{ width: 48, height: 48, color: '#c7c7cc', margin: '0 auto 16px' }} />
          <p className="font-medium mb-1" style={{ color: '#6e6e73' }}>
            {search ? 'Nenhuma página encontrada' : 'Nenhuma página criada ainda'}
          </p>
          {!search && (
            <Button onClick={() => { setEditing({ ...EMPTY }); setIsNew(true); }} variant="outline" className="gap-2 mt-4">
              <Plus style={{ width: 15, height: 15 }} /> Criar primeira página
            </Button>
          )}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((page) => (
            <div key={page.id}
              className="bg-white rounded-2xl border overflow-hidden transition-all duration-200 hover:shadow-md"
              style={{ borderColor: 'rgba(0,0,0,.07)' }}>
              <div className="flex items-center gap-4 p-4">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: '#f97316' + '12' }}>
                  <FileText style={{ width: 20, height: 20, color: '#f97316' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <h3 className="font-bold text-[#1d1d1f] text-[15px]" style={{ fontFamily: "'Outfit',sans-serif" }}>
                      {page.title}
                    </h3>
                    <Badge className={`text-[10px] border-0 px-2 py-0.5 ${page.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {page.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <Badge className="text-[10px] border-0 px-2 py-0.5 bg-blue-50 text-blue-600">
                      {page.blocks_json.length} blocos
                    </Badge>
                  </div>
                  <p className="text-[12px]" style={{ color: '#98989d' }}>/{page.slug}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {page.is_active && (
                    <a href={`/${page.slug}`} target="_blank" rel="noreferrer"
                      className="w-8 h-8 rounded-xl flex items-center justify-center transition"
                      style={{ color: '#98989d', background: '#f5f5f7' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#e5e5ea'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#f5f5f7'; }}>
                      <ExternalLink style={{ width: 14, height: 14 }} />
                    </a>
                  )}
                  <button
                    onClick={() => { setEditing(page); setIsNew(false); }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-semibold transition"
                    style={{ background: '#f9731610', color: '#f97316' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#f9731620'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#f9731610'; }}>
                    <Pencil style={{ width: 13, height: 13 }} /> Editar
                  </button>
                  <button onClick={() => handleDelete(page)}
                    className="w-8 h-8 rounded-xl flex items-center justify-center transition"
                    style={{ color: '#c7c7cc', background: '#f5f5f7' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#ef4444'; (e.currentTarget as HTMLElement).style.background = '#fef2f2'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#c7c7cc'; (e.currentTarget as HTMLElement).style.background = '#f5f5f7'; }}>
                    <Trash2 style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GenericPagesManager;
