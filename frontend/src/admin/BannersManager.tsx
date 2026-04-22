import { useState, useRef, useEffect } from 'react';
import type React from 'react';

import {
  Plus, Trash2, Upload, RefreshCw, ChevronUp, ChevronDown,
  ExternalLink, X, Layout, Image as ImageIcon, Info,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import type { Banner } from '@/types';

// Inject spin keyframe once
if (typeof document !== 'undefined' && !document.getElementById('bm-spin-style')) {
  const s = document.createElement('style');
  s.id = 'bm-spin-style';
  s.textContent = '@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }';
  document.head.appendChild(s);
}


const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3001/api';
const BASE_URL = API_URL.replace('/api', '');

const PAGES = [
  { value: 'home',      label: 'Início',        path: '/' },
  { value: 'solucoes',  label: 'Soluções',       path: '/solucoes' },
  { value: 'segmentos', label: 'Segmentos',      path: '/segmentos' },
  { value: 'sobre',     label: 'Sobre',          path: '/sobre' },
  { value: 'carreiras', label: 'Carreiras',      path: '/carreiras' },
  { value: 'blog',      label: 'Blog',           path: '/blog' },
  { value: 'imprensa',  label: 'Imprensa',       path: '/imprensa' },
  { value: 'suporte',   label: 'Suporte',        path: '/suporte' },
  { value: 'cliente',   label: 'Área Cliente',   path: '/cliente' },
];

const STYLES = [
  { id: 'cinematic', label: 'Cinemático' },
  { id: 'neon',      label: 'Neon' },
  { id: 'editorial', label: 'Editorial' },
  { id: 'split',     label: 'Dividido' },
  { id: 'bold',      label: 'Impacto' },
  { id: 'parallax',  label: 'Parallax' },
] as const;

function imgSrc(path: string) {
  if (!path) return '';
  return path.startsWith('http') ? path : `${BASE_URL}${path}`;
}

// Mini thumbnail por estilo
function StyleThumb({ id, accent }: { id: string; accent: string }) {
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
  // bold
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
  // parallax
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

// Card na sidebar
function BannerCard({ banner, selected, onClick }: { banner: Banner; selected: boolean; onClick: () => void }) {
  const acc = banner.bg_color || '#f97316';
  const src = imgSrc(banner.image);
  return (
    <button onClick={onClick} style={{ width: '100%', textAlign: 'left', outline: 'none' }}>
      <div style={{
        borderRadius: 14, overflow: 'hidden',
        border: `2px solid ${selected ? acc : 'rgba(0,0,0,.07)'}`,
        boxShadow: selected ? `0 0 0 3px ${acc}20` : '0 2px 8px rgba(0,0,0,.05)',
        transition: 'all .2s',
      }}>
        {/* Thumbnail */}
        <div style={{ position: 'relative', aspectRatio: '16/6', background: src ? '#000' : `linear-gradient(135deg,${acc},${acc}77)`, overflow: 'hidden' }}>
          {src && <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .8 }} />}
          {!src && <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle,rgba(255,255,255,.08) 1px,transparent 1px)', backgroundSize: '14px 14px' }} />}
          <span style={{
            position: 'absolute', top: 7, right: 7,
            fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
            background: banner.active === 1 ? '#22c55e' : '#6b7280', color: '#fff',
          }}>
            {banner.active === 1 ? 'Ativo' : 'Inativo'}
          </span>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px 10px', background: 'linear-gradient(to top,rgba(0,0,0,.75),transparent)' }}>
            <p style={{ color: '#fff', fontSize: 11, fontWeight: 700, margin: 0, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              {banner.title || <span style={{ opacity: .5 }}>Sem título</span>}
            </p>
          </div>
        </div>
        {/* Info */}
        <div style={{ background: '#fff', padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: acc, flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: '#1d1d1f', flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            {banner.title || 'Sem título'}
          </span>
          <span style={{ fontSize: 10, color: '#98989d', textTransform: 'capitalize' }}>{banner.banner_style || 'cinematic'}</span>
        </div>
      </div>
    </button>
  );
}

// ─── Manager principal ────────────────────────────────────────────────────────
export function BannersManager() {
  const { data, addBanner, updateBanner, deleteBanner, refreshData } = useData();
  const { toast } = useToast();

  const [selectedPage, setSelectedPage] = useState('home');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Banner | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Banners da página selecionada (todos, inclusive sem título para edição)
  const pageBanners = data.banners
    .filter(b => (b.page || 'home') === selectedPage)
    .sort((a, b) => (a.order_num || 0) - (b.order_num || 0));

  // Sincroniza draft quando troca de banner selecionado
  useEffect(() => {
    if (selectedId === null) { setDraft(null); return; }
    const found = data.banners.find(b => b.id === selectedId);
    if (found) setDraft({ ...found });
    else setDraft(null);
  }, [selectedId, data.banners]);

  // Salva com debounce
  const setField = (patch: Partial<Banner>) => {
    if (!draft) return;
    const updated = { ...draft, ...patch };
    setDraft(updated);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => persistSave(updated), 900);
  };

  const persistSave = async (b: Banner) => {
    if (!b.id) return;
    setSaving(true);
    try {
      await updateBanner(b);
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const saveNow = async (patch: Partial<Banner>) => {
    if (!draft) return;
    const updated = { ...draft, ...patch };
    setDraft(updated);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaving(true);
    try {
      await updateBanner(updated);
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async () => {
    try {
      setSaving(true);
      const newId = await addBanner({
        title: 'Novo Banner', subtitle: '', description: '',
        cta_text: '', cta_link: '', image: '',
        order_num: pageBanners.length, active: 1,
        use_default_bg: 1, use_style: 1,
        bg_color: '#f97316', page: selectedPage, banner_style: 'cinematic',
      });
      if (newId) setSelectedId(newId);
    } catch {
      toast({ title: 'Erro ao criar banner', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!draft?.id) return;
    if (!confirm('Excluir este banner permanentemente?')) return;
    try {
      await deleteBanner(draft.id);
      setSelectedId(null);
      toast({ title: 'Banner excluído' });
    } catch (e: any) {
      await refreshData();
      setSelectedId(null);
      toast({ title: e?.message || 'Erro ao excluir', variant: 'destructive' });
    }
  };

  const handleUpload = async (file: File) => {
    if (!draft?.id) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(`${API_URL}/admin/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: fd,
      });
      if (!res.ok) throw new Error('Upload falhou');
      const { url } = await res.json();
      await saveNow({ image: url, use_default_bg: 0 });
      toast({ title: 'Imagem enviada!' });
    } catch (e: any) {
      toast({ title: e?.message || 'Erro no upload', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const previewSrc = draft?.image ? imgSrc(draft.image) : '';
  const accent = draft?.bg_color || '#f97316';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#fafafa' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', background: '#fff', borderBottom: '1px solid rgba(0,0,0,.07)', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 20, color: '#1d1d1f', margin: 0 }}>Banners / Carrossel</h1>
          <p style={{ fontSize: 12, color: '#98989d', margin: '3px 0 0' }}>Salvo automaticamente ao editar</p>
        </div>
        <Button onClick={handleAdd} disabled={saving}
          style={{ background: '#f97316', color: '#fff', borderRadius: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={16} /> Novo Banner
        </Button>
      </div>

      {/* Page tabs */}
      <div style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,.07)', padding: '0 24px', display: 'flex', gap: 4, overflowX: 'auto' }}>
        {PAGES.map(p => {
          const count = data.banners.filter(b => (b.page || 'home') === p.value).length;
          const isActive = selectedPage === p.value;
          return (
            <button key={p.value}
              onClick={() => { setSelectedPage(p.value); setSelectedId(null); }}
              style={{
                padding: '12px 16px', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer',
                color: isActive ? '#f97316' : '#6e6e73', background: 'none', border: 'none',
                borderBottom: isActive ? '2px solid #f97316' : '2px solid transparent',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
              {p.label}
              {count > 0 && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 999, background: isActive ? '#f97316' : '#f5f5f7', color: isActive ? '#fff' : '#6e6e73' }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Sidebar */}
        <div style={{ width: 260, flexShrink: 0, background: '#fff', borderRight: '1px solid rgba(0,0,0,.07)', overflowY: 'auto' }}>
          <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pageBanners.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 16px' }}>
                <div style={{ width: 48, height: 48, borderRadius: 16, background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <ImageIcon size={20} color="#98989d" />
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f', margin: '0 0 6px' }}>Nenhum banner</p>
                <p style={{ fontSize: 12, color: '#98989d', margin: '0 0 16px' }}>Crie o primeiro banner desta página</p>
                <Button onClick={handleAdd} size="sm" style={{ background: '#f97316', color: '#fff', width: '100%', borderRadius: 10, gap: 4 }}>
                  <Plus size={14} /> Criar banner
                </Button>
              </div>
            ) : pageBanners.map(b => (
              <div key={b.id}>
                <BannerCard banner={b} selected={selectedId === b.id} onClick={() => setSelectedId(b.id!)} />
              </div>
            ))}
          </div>
        </div>

        {/* Editor */}
        {!draft ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Layout size={28} color="#c7c7cc" />
              </div>
              <p style={{ fontWeight: 600, color: '#1d1d1f', margin: '0 0 4px' }}>Selecione um banner</p>
              <p style={{ fontSize: 13, color: '#98989d' }}>Clique em um banner à esquerda para editar</p>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <div style={{ maxWidth: 760, margin: '0 auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Barra de status */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: draft.active === 1 ? '#22c55e' : '#6b7280' }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f' }}>
                    {draft.active === 1 ? 'Ativo' : 'Inativo'}
                  </span>
                  <Switch checked={draft.active === 1} onCheckedChange={v => saveNow({ active: v ? 1 : 0 })} />
                  {saving && (
                    <span style={{ fontSize: 12, color: '#98989d', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} /> Salvando...
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <a href={PAGES.find(p => p.value === selectedPage)?.path || '/'} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="outline" style={{ borderRadius: 10, fontSize: 12, gap: 4 }}>
                      <ExternalLink size={13} /> Ver página
                    </Button>
                  </a>
                  <Button size="sm" variant="outline" onClick={handleDelete}
                    style={{ borderRadius: 10, fontSize: 12, gap: 4, color: '#ef4444', borderColor: '#fecaca' }}>
                    <Trash2 size={13} /> Excluir
                  </Button>
                </div>
              </div>

              {/* ── Agendamento ── */}
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,.07)', padding: 20 }}>
                <p style={{ fontWeight: 600, fontSize: 14, color: '#1d1d1f', marginBottom: 4 }}>Agendamento (opcional)</p>
                <p style={{ fontSize: 12, color: '#98989d', marginBottom: 14 }}>Defina datas de início e fim para exibição automática do banner.</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <Label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>Início</Label>
                    <Input
                      type="datetime-local"
                      value={draft.starts_at ? draft.starts_at.slice(0, 16) : ''}
                      onChange={e => saveNow({ starts_at: e.target.value || undefined })}
                      style={{ borderRadius: 10, fontSize: 13 }}
                    />
                  </div>
                  <div>
                    <Label style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>Fim</Label>
                    <Input
                      type="datetime-local"
                      value={draft.ends_at ? draft.ends_at.slice(0, 16) : ''}
                      onChange={e => saveNow({ ends_at: e.target.value || undefined })}
                      style={{ borderRadius: 10, fontSize: 13 }}
                    />
                  </div>
                </div>
                {(draft.starts_at || draft.ends_at) && (
                  <button
                    onClick={() => saveNow({ starts_at: undefined, ends_at: undefined })}
                    style={{ marginTop: 10, fontSize: 11, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    Remover agendamento
                  </button>
                )}
              </div>

              {/* ── Fundo ── */}
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,.07)', padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14, color: '#1d1d1f', margin: 0 }}>Fundo do Banner</p>
                    <p style={{ fontSize: 12, color: '#98989d', margin: '3px 0 0' }}>Imagem ou cor sólida</p>
                  </div>
                  <div style={{ display: 'flex', borderRadius: 10, border: '1px solid rgba(0,0,0,.1)', overflow: 'hidden' }}>
                    {[{ v: 0, l: 'Imagem' }, { v: 1, l: 'Cor' }].map(({ v, l }) => (
                      <button key={v} onClick={() => saveNow({ use_default_bg: v })}
                        style={{
                          padding: '7px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
                          background: draft.use_default_bg === v ? '#f97316' : 'transparent',
                          color: draft.use_default_bg === v ? '#fff' : '#6e6e73',
                          borderRight: v === 0 ? '1px solid rgba(0,0,0,.08)' : 'none',
                        }}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                {draft.use_default_bg === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {/* Área de upload */}
                    <div
                      style={{ position: 'relative', aspectRatio: '16/6', borderRadius: 12, overflow: 'hidden', cursor: previewSrc ? 'default' : 'pointer', background: '#111' }}
                      onClick={() => !previewSrc && fileRef.current?.click()}
                    >
                      {previewSrc ? (
                        <>
                          <img src={previewSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          {/* Overlay hover */}
                          <div className="group" style={{ position: 'absolute', inset: 0 }}>
                            <div style={{
                              position: 'absolute', inset: 0, background: 'rgba(0,0,0,.55)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                              opacity: 0, transition: 'opacity .2s',
                            }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0'; }}
                            >
                              <button onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}
                                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                                <Upload size={14} /> {uploading ? 'Enviando...' : 'Trocar imagem'}
                              </button>
                              <button onClick={e => { e.stopPropagation(); saveNow({ image: '' }); }}
                                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: '#ef4444', color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                                <X size={14} /> Remover
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, border: '2px dashed rgba(255,255,255,.15)', borderRadius: 12 }}>
                          {uploading
                            ? <RefreshCw size={32} color="#f97316" style={{ animation: 'spin 1s linear infinite' }} />
                            : <>
                                <Upload size={28} color="#6b7280" />
                                <p style={{ fontSize: 13, fontWeight: 600, color: '#9ca3af', margin: 0 }}>Clique para enviar imagem</p>
                                <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>PNG, JPG, WEBP</p>
                              </>
                          }
                        </div>
                      )}
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ''; }} />

                    {/* URL manual */}
                    <Input value={draft.image || ''} onChange={e => setField({ image: e.target.value })}
                      placeholder="Ou cole a URL da imagem..." style={{ height: 38, fontSize: 13 }} />

                    {/* Modo overlay */}
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#1d1d1f', marginBottom: 8 }}>Sobreposição sobre a imagem</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {[{ v: 1, title: 'Com estilo', sub: 'Gradiente + textos' }, { v: 0, title: 'Só imagem', sub: 'Sem sobreposição' }].map(({ v, title, sub }) => {
                          const sel = (draft.use_style ?? 1) === v;
                          return (
                            <button key={v} onClick={() => saveNow({ use_style: v })}
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
                  /* Modo cor */
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input type="color" value={draft.bg_color || '#f97316'}
                      onChange={e => saveNow({ bg_color: e.target.value })}
                      style={{ width: 48, height: 48, borderRadius: 10, border: '1px solid rgba(0,0,0,.1)', cursor: 'pointer', padding: 3 }} />
                    <div style={{ flex: 1 }}>
                      <Label style={{ fontSize: 12, color: '#98989d', display: 'block', marginBottom: 4 }}>Cor de destaque</Label>
                      <Input value={draft.bg_color || '#f97316'} onChange={e => setField({ bg_color: e.target.value })}
                        style={{ height: 38, fontFamily: 'monospace', fontSize: 13 }} placeholder="#f97316" />
                    </div>
                    <div style={{ width: 80, height: 48, borderRadius: 12, background: `linear-gradient(135deg,${draft.bg_color || '#f97316'},${draft.bg_color || '#f97316'}88)` }} />
                  </div>
                )}
              </div>

              {/* ── Estilo visual ── */}
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,.07)', padding: 20 }}>
                <p style={{ fontWeight: 600, fontSize: 14, color: '#1d1d1f', margin: '0 0 14px' }}>Estilo Visual</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
                  {STYLES.map(s => {
                    const sel = (draft.banner_style || 'cinematic') === s.id;
                    return (
                      <button key={s.id} onClick={() => saveNow({ banner_style: s.id })}
                        style={{ border: `2px solid ${sel ? accent : 'transparent'}`, borderRadius: 10, overflow: 'hidden', cursor: 'pointer', padding: 0, background: 'none' }}>
                        <StyleThumb id={s.id} accent={accent} />
                        <div style={{ fontSize: 10, fontWeight: sel ? 700 : 500, color: sel ? accent : '#98989d', padding: '4px 0', textAlign: 'center', background: '#fff' }}>
                          {s.label}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Cor de destaque (no modo imagem) */}
                {draft.use_default_bg === 0 && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(0,0,0,.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="color" value={draft.bg_color || '#f97316'}
                      onChange={e => saveNow({ bg_color: e.target.value })}
                      style={{ width: 38, height: 38, borderRadius: 8, border: '1px solid rgba(0,0,0,.1)', cursor: 'pointer', padding: 2 }} />
                    <div style={{ flex: 1 }}>
                      <Label style={{ fontSize: 11, color: '#98989d', display: 'block', marginBottom: 3 }}>Cor de destaque do estilo</Label>
                      <Input value={draft.bg_color || '#f97316'} onChange={e => setField({ bg_color: e.target.value })}
                        style={{ height: 36, fontFamily: 'monospace', fontSize: 12 }} />
                    </div>
                  </div>
                )}
              </div>

              {/* ── Textos ── */}
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,.07)', padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <p style={{ fontWeight: 600, fontSize: 14, color: '#1d1d1f', margin: 0 }}>Textos</p>
                  <span style={{ fontSize: 11, color: '#98989d', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Info size={12} /> Deixe vazio para não exibir
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div>
                    <Label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Título *</Label>
                    <Input value={draft.title || ''} onChange={e => setField({ title: e.target.value })}
                      placeholder="Ex: Tecnologia que Impulsiona" style={{ height: 38 }} />
                  </div>
                  <div>
                    <Label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Badge / Subtítulo</Label>
                    <Input value={draft.subtitle || ''} onChange={e => setField({ subtitle: e.target.value })}
                      placeholder="Frase de destaque" style={{ height: 38 }} />
                  </div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <Label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Descrição</Label>
                  <Textarea value={draft.description || ''} onChange={e => setField({ description: e.target.value })}
                    placeholder="Texto de apoio..." rows={2} style={{ resize: 'none', fontSize: 13 }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <Label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Texto do Botão</Label>
                    <Input value={draft.cta_text || ''} onChange={e => setField({ cta_text: e.target.value })}
                      placeholder="Ex: Saiba mais" style={{ height: 38 }} />
                  </div>
                  <div>
                    <Label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Link do Botão</Label>
                    <Input value={draft.cta_link || ''} onChange={e => setField({ cta_link: e.target.value })}
                      placeholder="/solucoes ou https://..." style={{ height: 38 }} />
                  </div>
                </div>
              </div>

              {/* ── Configurações ── */}
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,.07)', padding: 20 }}>
                <p style={{ fontWeight: 600, fontSize: 14, color: '#1d1d1f', margin: '0 0 14px' }}>Configurações</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <Label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Página</Label>
                    <select value={draft.page || 'home'} onChange={e => saveNow({ page: e.target.value })}
                      style={{ width: '100%', height: 38, padding: '0 10px', borderRadius: 8, border: '1px solid rgba(0,0,0,.1)', fontSize: 13, background: '#fff', cursor: 'pointer' }}>
                      {PAGES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>Ordem</Label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => saveNow({ order_num: Math.max(0, (draft.order_num || 0) - 1) })}
                        style={{ height: 38, width: 38, borderRadius: 8, border: '1px solid rgba(0,0,0,.1)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ChevronUp size={16} />
                      </button>
                      <Input type="number" value={draft.order_num || 0} min={0}
                        onChange={e => setField({ order_num: Number(e.target.value) })}
                        style={{ height: 38, textAlign: 'center', flex: 1 }} />
                      <button onClick={() => saveNow({ order_num: (draft.order_num || 0) + 1 })}
                        style={{ height: 38, width: 38, borderRadius: 8, border: '1px solid rgba(0,0,0,.1)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ChevronDown size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

    </div>
  );
}
