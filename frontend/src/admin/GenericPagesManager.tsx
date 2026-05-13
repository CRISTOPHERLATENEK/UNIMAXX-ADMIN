// GenericPagesManager — CMS de páginas genéricas via Page Builder
import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Pencil, Trash2, Save, RefreshCw, ExternalLink,
  ArrowLeft, Search, FileText, AlertCircle, Globe,
  Image as ImageIcon, Link2, ShieldOff, Code2, Eye,
  Copy, ChevronUp, ChevronDown, CheckSquare, Square,
  Clock, Download, Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { PageBuilder } from './PageBuilder';
import type { PageBlock, PageTheme } from './PageBuilder';
import { DEFAULT_THEME } from './PageBuilder';
import PageTemplates from './PageTemplates';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { AdminEmptyState } from '@/components/admin/primitives';
import { useData } from '@/context/DataContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const BASE_URL = API_URL.replace(/\/api\/?$/, '');
const authH = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' });
const authHFile = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

interface GenericPage {
  id?: number;
  slug: string;
  title: string;
  meta_title: string;
  meta_description: string;
  // SEO Extended
  og_image?: string;
  og_title?: string;
  og_description?: string;
  canonical?: string;
  robots_noindex?: boolean;
  structured_data?: string;
  // Theme
  theme?: PageTheme;
  is_active: boolean;
  blocks_json: PageBlock[];
  // Nav
  show_in_nav?: boolean;
  nav_label?: string;
  nav_group?: string;
  nav_order?: number;
  // Scheduling
  published_at?: string;
  expires_at?: string;
}

const EMPTY: GenericPage = {
  slug: '', title: '', meta_title: '', meta_description: '',
  og_image: '', og_title: '', og_description: '', canonical: '',
  robots_noindex: false, structured_data: '',
  theme: { ...DEFAULT_THEME },
  is_active: true, blocks_json: [],
  show_in_nav: false, nav_label: '', nav_group: 'standalone', nav_order: 99,
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
  { id: 'seo', label: '🔍 SEO & Social' },
  { id: 'config', label: '⚙️ Configurações' },
];

// ── SEO Panel ──────────────────────────────────────────────────────────────────
function SeoPanel({ form, set }: { form: GenericPage; set: <K extends keyof GenericPage>(k: K, v: GenericPage[K]) => void }) {
  const [previewTab, setPreviewTab] = useState<'google' | 'facebook' | 'twitter'>('google');
  const [uploadingOg, setUploadingOg] = useState(false);
  const ogImgRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const siteOrigin = window?.location?.origin || 'https://seusite.com';
  const fullUrl = `${siteOrigin}/p/${form.slug || 'slug'}`;
  const displayTitle = form.meta_title || form.title || 'Título da Página';
  const displayDesc = form.meta_description || 'Descrição da sua página...';
  const ogTitle = form.og_title || form.meta_title || form.title || 'Título da Página';
  const ogDesc = form.og_description || form.meta_description || 'Descrição para redes sociais...';
  const titleLen = form.meta_title.length;
  const descLen = form.meta_description.length;

  const uploadOgImage = async (file: File) => {
    setUploadingOg(true);
    try {
      const fd = new FormData(); fd.append('file', file);
      const r = await fetch(`${API_URL}/upload`, { method: 'POST', headers: authHFile(), body: fd });
      const d = await r.json();
      const url = d.url?.startsWith('http') ? d.url : `${BASE_URL}${d.url}`;
      set('og_image', url);
      toast({ title: '✅ OG Image enviada!' });
    } catch { toast({ title: 'Erro ao enviar imagem', variant: 'destructive' }); }
    finally { setUploadingOg(false); }
  };

  return (
    <div className="space-y-5">
      {/* Preview tabs */}
      <div style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(0,0,0,.07)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(0,0,0,.06)', background: 'rgba(0,0,0,.01)' }}>
          {([
            { id: 'google' as const, label: '🔍 Google' },
            { id: 'facebook' as const, label: '📘 Facebook' },
            { id: 'twitter' as const, label: '🐦 Twitter/X' },
          ]).map(t => (
            <button key={t.id} onClick={() => setPreviewTab(t.id)}
              style={{ flex: 1, padding: '11px 4px', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', background: 'transparent', borderBottom: `2px solid ${previewTab === t.id ? '#f97316' : 'transparent'}`, color: previewTab === t.id ? '#f97316' : '#6e6e73', transition: 'all 0.15s' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Google Preview */}
        {previewTab === 'google' && (
          <div style={{ padding: '20px 24px', background: '#fff' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Prévia no Google Search</p>
            <div style={{ fontFamily: 'arial, sans-serif', maxWidth: 600 }}>
              {/* Favicon + URL breadcrumb */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#f1f5f9', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>🌐</div>
                <div>
                  <div style={{ fontSize: 13, color: '#202124', lineHeight: 1.3 }}>Seu Site</div>
                  <div style={{ fontSize: 12, color: '#4d5156' }}>{fullUrl}</div>
                </div>
              </div>
              {/* Title */}
              <h3 style={{ fontSize: 20, fontWeight: 400, color: '#1a0dab', margin: '2px 0', lineHeight: 1.3, cursor: 'pointer' }}
                className="hover:underline">
                {displayTitle.length > 60 ? displayTitle.slice(0, 57) + '…' : displayTitle}
              </h3>
              {/* Description */}
              <p style={{ fontSize: 14, color: '#4d5156', margin: '4px 0 0', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>
                {displayDesc}
              </p>
              {/* Sitelinks hint */}
              {form.structured_data && (
                <div style={{ marginTop: 8, display: 'flex', gap: 12 }}>
                  {['Sobre', 'Contato', 'Serviços'].map(s => (
                    <span key={s} style={{ fontSize: 12, color: '#1a0dab', cursor: 'pointer' }} className="hover:underline">{s}</span>
                  ))}
                </div>
              )}
            </div>
            {/* Char indicators */}
            <div style={{ display: 'flex', gap: 12, marginTop: 14, paddingTop: 12, borderTop: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, fontWeight: 700, background: titleLen > 60 ? '#fef2f2' : titleLen > 45 ? '#fffbeb' : '#f0fdf4', color: titleLen > 60 ? '#ef4444' : titleLen > 45 ? '#f59e0b' : '#22c55e' }}>
                Title: {titleLen}/60
              </div>
              <div style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, fontWeight: 700, background: descLen > 160 ? '#fef2f2' : descLen > 130 ? '#fffbeb' : '#f0fdf4', color: descLen > 160 ? '#ef4444' : descLen > 130 ? '#f59e0b' : '#22c55e' }}>
                Desc: {descLen}/160
              </div>
              {form.robots_noindex && (
                <div style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, fontWeight: 700, background: '#fef2f2', color: '#ef4444' }}>
                  ⚠️ NOINDEX
                </div>
              )}
            </div>
          </div>
        )}

        {/* Facebook Preview */}
        {previewTab === 'facebook' && (
          <div style={{ padding: '20px 24px', background: '#fff' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Prévia no Facebook / WhatsApp</p>
            <div style={{ maxWidth: 480, border: '1px solid #dddfe2', borderRadius: 8, overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
              {form.og_image ? (
                <img src={form.og_image} alt="OG" style={{ width: '100%', height: 252, objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{ width: '100%', height: 252, background: 'linear-gradient(135deg, #1e293b, #334155)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#64748b' }}>
                  <ImageIcon size={32} />
                  <span style={{ fontSize: 12 }}>Sem OG Image — adicione abaixo</span>
                </div>
              )}
              <div style={{ padding: '10px 12px', background: '#f2f3f5', borderTop: '1px solid #dddfe2' }}>
                <p style={{ fontSize: 11, color: '#606770', textTransform: 'uppercase', margin: '0 0 3px' }}>{siteOrigin.replace(/^https?:\/\//, '')}</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#1c1e21', margin: '0 0 4px', lineHeight: 1.3 }}>{ogTitle.slice(0, 60)}</p>
                <p style={{ fontSize: 14, color: '#606770', margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>{ogDesc}</p>
              </div>
            </div>
          </div>
        )}

        {/* Twitter Preview */}
        {previewTab === 'twitter' && (
          <div style={{ padding: '20px 24px', background: '#fff' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Prévia no Twitter / X</p>
            <div style={{ maxWidth: 480, border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
              {form.og_image ? (
                <img src={form.og_image} alt="OG" style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{ width: '100%', height: 220, background: 'linear-gradient(135deg, #0f172a, #1e293b)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#64748b' }}>
                  <ImageIcon size={28} />
                  <span style={{ fontSize: 11 }}>OG Image não definida</span>
                </div>
              )}
              <div style={{ padding: '12px 14px', background: '#fff' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>{ogTitle.slice(0, 55)}</p>
                <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 6px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>{ogDesc}</p>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>🌐 {siteOrigin.replace(/^https?:\/\//, '')}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Meta Fields */}
      <div style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(0,0,0,.07)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(0,0,0,.06)', background: 'rgba(0,0,0,.01)' }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: '#1d1d1f', margin: 0 }}>🔍 Google / HTML</p>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <FL hint="Aparece como título azul no resultado do Google">Meta Title</FL>
            <Input value={form.meta_title} onChange={(e) => set('meta_title', e.target.value)}
              placeholder="Ex: Sobre a Empresa | Seu Site" className="h-10" maxLength={70} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
              <div style={{ height: 3, flex: 1, borderRadius: 2, background: '#f1f5f9', overflow: 'hidden', marginRight: 8 }}>
                <div style={{ height: '100%', borderRadius: 2, background: titleLen > 60 ? '#ef4444' : titleLen > 45 ? '#f59e0b' : '#22c55e', width: `${Math.min(100, (titleLen / 60) * 100)}%`, transition: 'width 0.3s' }} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: titleLen > 60 ? '#ef4444' : '#94a3b8', flexShrink: 0 }}>{titleLen}/60</span>
            </div>
          </div>
          <div>
            <FL hint="Aparece como texto cinza abaixo do título no Google">Meta Description</FL>
            <Textarea value={form.meta_description} onChange={(e) => set('meta_description', e.target.value)}
              placeholder="Descreva a página em 1-2 frases focadas no usuário..." rows={3} className="resize-none text-[13px]" maxLength={200} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
              <div style={{ height: 3, flex: 1, borderRadius: 2, background: '#f1f5f9', overflow: 'hidden', marginRight: 8 }}>
                <div style={{ height: '100%', borderRadius: 2, background: descLen > 160 ? '#ef4444' : descLen > 130 ? '#f59e0b' : '#22c55e', width: `${Math.min(100, (descLen / 160) * 100)}%`, transition: 'width 0.3s' }} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: descLen > 160 ? '#ef4444' : '#94a3b8', flexShrink: 0 }}>{descLen}/160</span>
            </div>
          </div>
        </div>
      </div>

      {/* Open Graph / Social */}
      <div style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(0,0,0,.07)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(0,0,0,.06)', background: 'rgba(0,0,0,.01)' }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: '#1d1d1f', margin: 0 }}>📲 Open Graph (Facebook, WhatsApp, Twitter)</p>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* OG Image upload */}
          <div>
            <FL hint="Imagem exibida quando compartilhado em redes sociais. Recomendado: 1200×630px">OG Image</FL>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Drop zone */}
              <div
                onClick={() => ogImgRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) uploadOgImage(f); }}
                style={{ position: 'relative', height: form.og_image ? 140 : 80, borderRadius: 12, border: `2px dashed ${form.og_image ? 'transparent' : '#e2e8f0'}`, cursor: 'pointer', overflow: 'hidden', background: form.og_image ? 'transparent' : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.2s' }}
                onMouseEnter={e => { if (!form.og_image) (e.currentTarget as HTMLElement).style.borderColor = '#f97316'; }}
                onMouseLeave={e => { if (!form.og_image) (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'; }}>
                {form.og_image ? (
                  <>
                    <img src={form.og_image} alt="OG" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.4)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0)'}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', opacity: 0, transition: 'opacity 0.2s' }}
                        className="group-hover:opacity-100">Trocar imagem</span>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                    {uploadingOg ? <RefreshCw size={20} className="animate-spin mx-auto mb-2" /> : <ImageIcon size={20} style={{ margin: '0 auto 6px' }} />}
                    <p style={{ fontSize: 12, fontWeight: 600, margin: 0 }}>{uploadingOg ? 'Enviando…' : 'Clique ou arraste uma imagem'}</p>
                    <p style={{ fontSize: 10, margin: '2px 0 0' }}>1200×630px · JPG ou PNG</p>
                  </div>
                )}
              </div>
              <input ref={ogImgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) uploadOgImage(f); e.target.value = ''; }} />
              <Input value={form.og_image || ''} onChange={e => set('og_image', e.target.value)}
                placeholder="Ou cole a URL da imagem (https://...)" className="h-9 text-[12px]" />
              {form.og_image && (
                <button onClick={() => set('og_image', '')}
                  style={{ fontSize: 11, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 600 }}>
                  ✕ Remover imagem
                </button>
              )}
            </div>
          </div>
          <div>
            <FL hint="Deixe vazio para usar o Meta Title">OG Title (opcional)</FL>
            <Input value={form.og_title || ''} onChange={e => set('og_title', e.target.value)}
              placeholder={form.meta_title || form.title || 'Usa o Meta Title por padrão'} className="h-10" />
          </div>
          <div>
            <FL hint="Deixe vazio para usar a Meta Description">OG Description (opcional)</FL>
            <Textarea value={form.og_description || ''} onChange={e => set('og_description', e.target.value)}
              placeholder={form.meta_description || 'Usa a Meta Description por padrão'} rows={2} className="resize-none text-[13px]" />
          </div>
        </div>
      </div>

      {/* Advanced */}
      <div style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(0,0,0,.07)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(0,0,0,.06)', background: 'rgba(0,0,0,.01)' }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: '#1d1d1f', margin: 0 }}>⚙️ Avançado</p>
        </div>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <FL hint="URL canônica — previne conteúdo duplicado. Deixe vazio para usar a URL padrão da página">Canonical URL</FL>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Link2 size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
              <Input value={form.canonical || ''} onChange={e => set('canonical', e.target.value)}
                placeholder={fullUrl} className="h-10 flex-1" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 12, background: form.robots_noindex ? '#fef2f2' : '#f8fafc', border: `1px solid ${form.robots_noindex ? '#fecaca' : '#e2e8f0'}`, transition: 'all 0.2s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ShieldOff size={18} style={{ color: form.robots_noindex ? '#ef4444' : '#94a3b8' }} />
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: form.robots_noindex ? '#dc2626' : '#1d1d1f', margin: 0 }}>Bloquear indexação (noindex)</p>
                <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>Impede que o Google indexe esta página</p>
              </div>
            </div>
            <Switch checked={!!form.robots_noindex} onCheckedChange={v => set('robots_noindex', v)} />
          </div>
          <div>
            <FL hint="JSON-LD para dados estruturados (Schema.org) — melhora rich snippets no Google">Dados Estruturados (JSON-LD)</FL>
            <div style={{ position: 'relative' }}>
              <Code2 size={13} style={{ position: 'absolute', top: 10, left: 10, color: '#94a3b8', zIndex: 1 }} />
              <Textarea
                value={form.structured_data || ''}
                onChange={e => set('structured_data', e.target.value)}
                placeholder={`{\n  "@context": "https://schema.org",\n  "@type": "WebPage",\n  "name": "${form.title || 'Título'}"\n}`}
                rows={5}
                style={{ fontFamily: 'monospace', fontSize: 12, paddingLeft: 28, resize: 'vertical' }}
                className="text-[12px]" />
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              {[
                { label: 'WebPage', json: `{\n  "@context": "https://schema.org",\n  "@type": "WebPage",\n  "name": "${form.title}",\n  "description": "${form.meta_description}",\n  "url": "${fullUrl}"\n}` },
                { label: 'Organization', json: `{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "Seu Site",\n  "url": "${siteOrigin}",\n  "logo": "${siteOrigin}/logo.png"\n}` },
                { label: 'FAQPage', json: `{\n  "@context": "https://schema.org",\n  "@type": "FAQPage",\n  "mainEntity": []\n}` },
              ].map(t => (
                <button key={t.label} onClick={() => set('structured_data', t.json)}
                  style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', cursor: 'pointer' }}>
                  + {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Nav group helpers ──────────────────────────────────────────────────────────
export interface NavGroup { key: string; label: string; order: number; }

const BUILTIN_GROUPS: NavGroup[] = [
  { key: 'institucional', label: 'Institucional', order: 1 },
  { key: 'suporte', label: 'Suporte', order: 2 },
];

function parseNavGroups(raw: string | undefined): NavGroup[] {
  try { if (raw) return JSON.parse(raw) as NavGroup[]; } catch { }
  return [];
}

// ── Config Panel ───────────────────────────────────────────────────────────────
function ConfigPanel({ form, set, isNew }: {
  form: GenericPage;
  set: <K extends keyof GenericPage>(k: K, v: GenericPage[K]) => void;
  isNew: boolean;
}) {
  const { data, updateSettings } = useData();
  const { toast } = useToast();
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [newGroupLabel, setNewGroupLabel] = useState('');
  const [savingGroup, setSavingGroup] = useState(false);

  // Merge built-in + custom groups (deduplicate by key)
  const customGroups = parseNavGroups(data.settings?.nav_custom_groups);
  const allGroups: NavGroup[] = [
    ...BUILTIN_GROUPS,
    ...customGroups.filter(g => !BUILTIN_GROUPS.some(b => b.key === g.key)),
  ].sort((a, b) => a.order - b.order);

  const handleCreateGroup = async () => {
    if (!newGroupLabel.trim()) return;
    const key = newGroupLabel.trim()
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-');
    if (!key) { toast({ title: 'Nome inválido', variant: 'destructive' }); return; }
    if (allGroups.some(g => g.key === key)) {
      toast({ title: 'Já existe um grupo com esse nome', variant: 'destructive' }); return;
    }
    const maxOrder = Math.max(0, ...allGroups.map(g => g.order));
    const updated = [...customGroups, { key, label: newGroupLabel.trim(), order: maxOrder + 1 }];
    setSavingGroup(true);
    try {
      await updateSettings({ nav_custom_groups: JSON.stringify(updated) });
      set('nav_group', key);
      setCreatingGroup(false);
      setNewGroupLabel('');
      toast({ title: `✅ Categoria "${newGroupLabel.trim()}" criada!` });
    } catch { toast({ title: 'Erro ao salvar categoria', variant: 'destructive' }); }
    finally { setSavingGroup(false); }
  };

  const autoSlug = (title: string) => {
    if (!isNew) return;
    set('slug', title.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-'));
  };

  return (
    <div style={{ background: '#fff', borderRadius: 20, border: '1px solid rgba(0,0,0,.07)', overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(0,0,0,.06)', background: 'rgba(0,0,0,.01)' }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: '#1d1d1f', margin: 0 }}>⚙️ Configurações da Página</p>
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
              seusite.com/p/
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

        {/* ── Scheduling ── */}
        <div style={{ borderTop: '1px solid rgba(0,0,0,.06)', paddingTop: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 800, color: '#64748b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.05em' }}>📅 Agendamento</p>
          <div className="space-y-3">
            <div>
              <FL hint="Publicar automaticamente nesta data/hora">Publicar em</FL>
              <Input type="datetime-local" value={form.published_at || ''} onChange={e => set('published_at', e.target.value)} className="h-10" />
            </div>
            <div>
              <FL hint="Despublicar automaticamente nesta data/hora (opcional)">Expirar em</FL>
              <Input type="datetime-local" value={form.expires_at || ''} onChange={e => set('expires_at', e.target.value)} className="h-10" />
            </div>
          </div>
        </div>

        {/* ── Nav settings ── */}
        <div style={{ borderTop: '1px solid rgba(0,0,0,.06)', paddingTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 800, color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: '.05em' }}>🧭 Navegação</p>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl mb-3" style={{ background: '#f5f5f7' }}>
            <div>
              <p className="text-[13px] font-semibold text-[#1d1d1f]">Exibir no menu</p>
              <p className="text-[11px]" style={{ color: '#98989d' }}>Aparece no header do site</p>
            </div>
            <Switch checked={!!form.show_in_nav} onCheckedChange={(v) => set('show_in_nav', v)} />
          </div>

          {/* Aviso: página inativa não aparece no nav */}
          {form.show_in_nav && !form.is_active && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#fef9c3', border: '1px solid #fde047', borderRadius: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 15 }}>⚠️</span>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#854d0e', margin: 0, lineHeight: 1.4 }}>
                <strong>Página inativa</strong> — ative a página acima para ela aparecer no menu.
              </p>
            </div>
          )}

          {form.show_in_nav && (
            <div className="space-y-3">
              {/* Label */}
              <div>
                <FL hint="Texto exibido no menu (deixe vazio para usar o título)">Label do menu</FL>
                <Input value={form.nav_label || ''} onChange={(e) => set('nav_label', e.target.value)}
                  placeholder={form.title || 'Ex: Sobre nós'} className="h-10" />
              </div>

              {/* Grupo */}
              <div>
                <FL hint="Em qual grupo/dropdown do header esta página aparece">Categoria do menu</FL>

                {/* Select with all groups */}
                <select
                  value={creatingGroup ? '__new__' : (form.nav_group || 'standalone')}
                  onChange={(e) => {
                    if (e.target.value === '__new__') {
                      setCreatingGroup(true);
                    } else {
                      setCreatingGroup(false);
                      set('nav_group', e.target.value);
                    }
                  }}
                  className="w-full h-10 rounded-xl border px-3 text-[13px] bg-white"
                  style={{ borderColor: 'rgba(0,0,0,.1)', marginBottom: creatingGroup ? 8 : 0 }}>
                  <option value="standalone">📌 Nível superior (item independente)</option>
                  <optgroup label="── Categorias ──">
                    {allGroups.map(g => (
                      <option key={g.key} value={g.key}>🗂 {g.label}</option>
                    ))}
                  </optgroup>
                  <option value="__new__">✚ Criar nova categoria…</option>
                </select>

                {/* Inline create form */}
                {creatingGroup && (
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '10px 12px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12 }}>
                    <span style={{ fontSize: 16 }}>🗂</span>
                    <Input
                      autoFocus
                      value={newGroupLabel}
                      onChange={(e) => setNewGroupLabel(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleCreateGroup(); if (e.key === 'Escape') { setCreatingGroup(false); setNewGroupLabel(''); } }}
                      placeholder="Nome da categoria (ex: Recursos)"
                      className="h-9 flex-1 text-[13px]"
                      style={{ background: '#fff' }}
                    />
                    <button
                      onClick={handleCreateGroup}
                      disabled={savingGroup || !newGroupLabel.trim()}
                      style={{ height: 36, padding: '0 14px', borderRadius: 9, background: savingGroup ? '#fde68a' : '#f97316', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {savingGroup ? '…' : 'Criar'}
                    </button>
                    <button
                      onClick={() => { setCreatingGroup(false); setNewGroupLabel(''); }}
                      style={{ width: 36, height: 36, borderRadius: 9, background: '#f1f5f9', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Ordem */}
              <div>
                <FL hint="Menor número = aparece primeiro dentro do grupo">Ordem</FL>
                <Input type="number" value={form.nav_order ?? 99}
                  onChange={(e) => set('nav_order', Number(e.target.value))}
                  className="h-10" min={0} max={999} />
              </div>
            </div>
          )}
        </div>

        {/* ── Nav Groups Manager ── */}
        {customGroups.length > 0 && (
          <div style={{ borderTop: '1px solid rgba(0,0,0,.06)', paddingTop: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 800, color: '#64748b', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '.05em' }}>🗂 Categorias personalizadas</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {customGroups.sort((a, b) => a.order - b.order).map((g, gi) => (
                <div key={g.key} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#1d1d1f' }}>{g.label}</span>
                  <span style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'monospace' }}>{g.key}</span>
                  <button
                    onClick={async () => {
                      if (gi === 0) return;
                      const arr = [...customGroups].sort((a, b) => a.order - b.order);
                      const prev = arr[gi - 1];
                      const curr = arr[gi];
                      const updated = customGroups.map(x => x.key === curr.key ? { ...x, order: prev.order } : x.key === prev.key ? { ...x, order: curr.order } : x);
                      try { await updateSettings({ nav_custom_groups: JSON.stringify(updated) }); toast({ title: 'Ordem atualizada' }); } catch { toast({ title: 'Erro', variant: 'destructive' }); }
                    }}
                    disabled={gi === 0}
                    style={{ width: 26, height: 26, borderRadius: 6, background: 'none', border: '1px solid #e2e8f0', cursor: gi === 0 ? 'not-allowed' : 'pointer', opacity: gi === 0 ? 0.3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                    <ChevronUp size={12} />
                  </button>
                  <button
                    onClick={async () => {
                      const arr = [...customGroups].sort((a, b) => a.order - b.order);
                      if (gi === arr.length - 1) return;
                      const next2 = arr[gi + 1];
                      const curr = arr[gi];
                      const updated = customGroups.map(x => x.key === curr.key ? { ...x, order: next2.order } : x.key === next2.key ? { ...x, order: curr.order } : x);
                      try { await updateSettings({ nav_custom_groups: JSON.stringify(updated) }); toast({ title: 'Ordem atualizada' }); } catch { toast({ title: 'Erro', variant: 'destructive' }); }
                    }}
                    disabled={gi === customGroups.length - 1}
                    style={{ width: 26, height: 26, borderRadius: 6, background: 'none', border: '1px solid #e2e8f0', cursor: gi === customGroups.length - 1 ? 'not-allowed' : 'pointer', opacity: gi === customGroups.length - 1 ? 0.3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                    <ChevronDown size={12} />
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm(`Excluir categoria "${g.label}"? As páginas nesta categoria não serão afetadas.`)) return;
                      const updated = customGroups.filter(x => x.key !== g.key);
                      try { await updateSettings({ nav_custom_groups: JSON.stringify(updated) }); toast({ title: `Categoria "${g.label}" excluída` }); } catch { toast({ title: 'Erro', variant: 'destructive' }); }
                    }}
                    style={{ width: 26, height: 26, borderRadius: 6, background: 'none', border: '1px solid #fecaca', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface PageVersion {
  id: number;
  page_id: number;
  title: string;
  saved_by: string;
  created_at: string;
}

// ── Editor ─────────────────────────────────────────────────────────────────────
function Editor({ initial, isNew, onSave, onBack }: {
  initial: GenericPage; isNew: boolean;
  onSave: (data: GenericPage) => Promise<void>;
  onBack: () => void;
}) {
  const [form, setForm] = useState<GenericPage>(initial);
  const [tab, setTab] = useState('construtor');
  const [saving, setSaving] = useState(false);
  const [creatingPreview, setCreatingPreview] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [versions, setVersions] = useState<PageVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const { toast } = useToast();

  const loadVersions = async () => {
    if (!form.id) return;
    setLoadingVersions(true);
    try {
      const res = await fetch(`${API_URL}/admin/generic-pages/${form.id}/versions`, { headers: authH() });
      const data = await res.json();
      setVersions(data || []);
    } catch { /* ignore */ }
    finally { setLoadingVersions(false); }
  };

  const handleRestoreVersion = async (vid: number) => {
    if (!form.id) return;
    try {
      const res = await fetch(`${API_URL}/admin/generic-pages/${form.id}/versions/${vid}`, { headers: authH() });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Erro');
      set('blocks_json', data.blocks_json);
      setShowVersions(false);
      toast({ title: '✅ Versão restaurada! Salve para confirmar.' });
    } catch (e: any) {
      toast({ title: e?.message || 'Erro ao restaurar versão', variant: 'destructive' });
    }
  };

  const set = <K extends keyof GenericPage>(k: K, v: GenericPage[K]) =>
    setForm(p => ({ ...p, [k]: v }));

  const handleCreatePreview = async () => {
    if (!form.id) return;
    setCreatingPreview(true);
    try {
      const res = await fetch(`${API_URL}/admin/preview-tokens`, {
        method: 'POST',
        headers: authH(),
        body: JSON.stringify({ page_type: 'generic_page', page_id: form.id, label: form.title, expires_hours: 24 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Erro ao criar preview');
      window.open(data.preview_url, '_blank');
    } catch (e: any) {
      toast({ title: e?.message || 'Erro ao criar preview', variant: 'destructive' });
    } finally {
      setCreatingPreview(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast({ title: 'Título é obrigatório', variant: 'destructive' }); return; }
    if (!form.slug.trim()) { toast({ title: 'Slug é obrigatório', variant: 'destructive' }); return; }
    // Validate JSON-LD if provided
    if (form.structured_data?.trim()) {
      try { JSON.parse(form.structured_data); } catch {
        toast({ title: 'JSON-LD inválido — verifique a sintaxe', variant: 'destructive' }); return;
      }
    }
    setSaving(true);
    try { await onSave(form); }
    catch (e: any) { toast({ title: e?.message || 'Erro ao salvar', variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  const seoScore = (() => {
    let s = 0;
    if (form.meta_title.length >= 30 && form.meta_title.length <= 60) s++;
    if (form.meta_description.length >= 80 && form.meta_description.length <= 160) s++;
    if (form.og_image) s++;
    if (!form.robots_noindex) s++;
    if (form.structured_data?.trim()) s++;
    return s;
  })();

  const SEO_LABEL = ['Crítico', 'Fraco', 'Básico', 'Bom', 'Ótimo', 'Perfeito'][seoScore];
  const SEO_COLOR = ['#ef4444', '#f97316', '#f59e0b', '#22c55e', '#22c55e', '#2563eb'][seoScore];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#f8fafc' }}>

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', background: '#fff', borderBottom: '1px solid #f1f5f9', flexShrink: 0, zIndex: 20 }}>
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack}
            style={{ width: 34, height: 34, borderRadius: 10, background: '#f1f5f9', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .15s' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#e2e8f0')}
            onMouseLeave={e => (e.currentTarget.style.background = '#f1f5f9')}>
            <ArrowLeft size={15} />
          </button>
          <div style={{ width: 1, height: 24, background: '#f1f5f9' }} />
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: "'Outfit',sans-serif", lineHeight: 1.2 }}>
              {isNew ? 'Nova Página' : form.title || 'Editar Página'}
            </h2>
            <p style={{ fontSize: 11, color: '#94a3b8', margin: 0, fontWeight: 500 }}>
              /p/{form.slug || 'slug-aqui'}
            </p>
          </div>
        </div>

        {/* Center — Tabs */}
        <div style={{ display: 'flex', gap: 2, background: '#f1f5f9', padding: '3px', borderRadius: 12 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                padding: '6px 16px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                background: tab === t.id ? '#fff' : 'transparent',
                color: tab === t.id ? '#0f172a' : '#64748b',
                boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,.08)' : 'none',
                transition: 'all .15s', display: 'flex', alignItems: 'center', gap: 6,
              }}>
              {t.label}
              {t.id === 'seo' && (
                <span style={{ width: 16, height: 16, borderRadius: '50%', background: SEO_COLOR, color: '#fff', fontSize: 9, fontWeight: 800, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  {seoScore}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: SEO_COLOR + '18', border: `1px solid ${SEO_COLOR}30` }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: SEO_COLOR, display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontWeight: 800, color: SEO_COLOR }}>SEO: {SEO_LABEL}</span>
          </div>
          {!isNew && form.slug && (
            <a href={`/p/${form.slug}`} target="_blank" rel="noreferrer"
              style={{ height: 34, padding: '0 12px', borderRadius: 10, background: '#f1f5f9', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, textDecoration: 'none', transition: 'background .15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#e2e8f0')}
              onMouseLeave={e => (e.currentTarget.style.background = '#f1f5f9')}>
              <ExternalLink size={13} /> Ver página
            </a>
          )}
          {!isNew && form.id && (
            <button onClick={handleCreatePreview} disabled={creatingPreview}
              style={{ height: 34, padding: '0 12px', borderRadius: 10, background: '#f1f5f9', border: 'none', color: '#64748b', cursor: creatingPreview ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, transition: 'background .15s' }}
              onMouseEnter={e => { if (!creatingPreview) (e.currentTarget as HTMLElement).style.background = '#e2e8f0'; }}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#f1f5f9'}>
              {creatingPreview ? <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Eye size={13} />}
              Preview
            </button>
          )}
          {!isNew && form.id && (
            <button onClick={() => { setShowVersions(v => !v); if (!showVersions) loadVersions(); }}
              title="Histórico de versões"
              style={{ width: 34, height: 34, borderRadius: 10, background: showVersions ? '#eff6ff' : '#f1f5f9', border: 'none', color: showVersions ? '#2563eb' : '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#e2e8f0'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = showVersions ? '#eff6ff' : '#f1f5f9'; }}>
              <Clock size={14} />
            </button>
          )}
          <button onClick={handleSave} disabled={saving}
            style={{ height: 34, padding: '0 18px', borderRadius: 10, background: saving ? '#fbd38d' : '#f97316', border: 'none', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 700, boxShadow: '0 2px 8px rgba(249,115,22,.3)', transition: 'all .15s' }}>
            {saving
              ? <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Salvando…</>
              : <><Save size={13} /> Salvar</>}
          </button>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      {/* Construtor — PageBuilder toma 100% do espaço restante */}
      {tab === 'construtor' && (
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <PageBuilder
            blocks={form.blocks_json}
            onChange={blocks => set('blocks_json', blocks)}
            theme={form.theme}
            onThemeChange={t => set('theme', t)}
          />
        </div>
      )}

      {/* SEO / Config — painel centrado com scroll */}
      {tab !== 'construtor' && (
        <div style={{ flex: 1, overflowY: 'auto', background: '#f8fafc' }}>
          <div style={{ maxWidth: 680, margin: '0 auto', padding: '28px 20px 80px' }}>
            {tab === 'seo' && <SeoPanel form={form} set={set} />}
            {tab === 'config' && <ConfigPanel form={form} set={set} isNew={isNew} />}
            <div style={{ marginTop: 24 }}>
              <button onClick={handleSave} disabled={saving}
                style={{ width: '100%', height: 48, borderRadius: 16, background: saving ? '#fbd38d' : '#f97316', border: 'none', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 16px rgba(249,115,22,.25)' }}>
                {saving
                  ? <><RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Salvando…</>
                  : <><Save size={16} /> Salvar Página</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Version History Drawer */}
      {showVersions && (
        <>
          <div onClick={() => setShowVersions(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.2)', zIndex: 40 }} />
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 320, background: '#fff', zIndex: 50, boxShadow: '-4px 0 24px rgba(0,0,0,.12)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '18px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={16} style={{ color: '#64748b' }} />
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: 0 }}>Histórico de versões</h3>
              </div>
              <button onClick={() => setShowVersions(false)} style={{ width: 28, height: 28, borderRadius: 8, background: '#f1f5f9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: 16 }}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
              {loadingVersions ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
                  <RefreshCw size={20} style={{ color: '#f97316', animation: 'spin 1s linear infinite' }} />
                </div>
              ) : versions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8' }}>
                  <Clock size={28} style={{ margin: '0 auto 8px' }} />
                  <p style={{ fontSize: 13, fontWeight: 600 }}>Nenhuma versão ainda</p>
                  <p style={{ fontSize: 11, marginTop: 4 }}>Versões são salvas ao editar</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {versions.map(v => (
                    <div key={v.id} style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', margin: '0 0 3px' }}>{v.title}</p>
                      <p style={{ fontSize: 11, color: '#64748b', margin: '0 0 8px' }}>
                        {new Date(v.created_at).toLocaleString('pt-BR')} · {v.saved_by}
                      </p>
                      <button onClick={() => handleRestoreVersion(v.id)}
                        style={{ height: 28, padding: '0 12px', borderRadius: 7, background: '#fff7ed', border: '1px solid #fed7aa', color: '#f97316', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>
                        Restaurar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
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
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showTemplates, setShowTemplates] = useState(false);
  const [sortBy, setSortBy] = useState<'title' | 'created' | 'status'>('created');
  const importRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { refreshData } = useData();

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
      const parseObj = (v: any, fallback: any) => {
        if (!v) return fallback;
        try { return typeof v === 'string' ? JSON.parse(v) : v; } catch { return fallback; }
      };
      setPages(data.map((p: any) => ({
        ...p,
        is_active: !!p.is_active,
        show_in_nav: !!p.show_in_nav,
        robots_noindex: !!p.robots_noindex,
        blocks_json: parseArr(p.blocks_json),
        theme: parseObj(p.theme, { ...DEFAULT_THEME }),
        nav_group: p.nav_group || 'standalone',
        nav_order: p.nav_order ?? 99,
        published_at: p.published_at || undefined,
        expires_at: p.expires_at || undefined,
      })));
    } catch {
      toast({ title: 'Erro ao carregar páginas', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(pages, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `paginas-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string) as GenericPage[];
        let count = 0;
        for (const p of imported) {
          const body = { ...p, id: undefined, slug: p.slug + '-imp', is_active: false, blocks_json: p.blocks_json || [], show_in_nav: 0, nav_group: p.nav_group || 'standalone', nav_order: p.nav_order ?? 99 };
          const res = await fetch(`${API_URL}/admin/generic-pages`, { method: 'POST', headers: authH(), body: JSON.stringify(body) });
          if (res.ok) count++;
        }
        toast({ title: `✅ ${count} página(s) importada(s)!` });
        fetchAll();
      } catch { toast({ title: 'Erro ao importar JSON', variant: 'destructive' }); }
    };
    reader.readAsText(file);
  };

  const handleSave = async (data: GenericPage) => {
    const body = {
      slug: data.slug,
      title: data.title,
      meta_title: data.meta_title,
      meta_description: data.meta_description,
      og_image: data.og_image || null,
      og_title: data.og_title || null,
      og_description: data.og_description || null,
      canonical: data.canonical || null,
      robots_noindex: data.robots_noindex ? 1 : 0,
      structured_data: data.structured_data || null,
      theme: data.theme ? JSON.stringify(data.theme) : null,
      is_active: data.is_active,
      blocks_json: data.blocks_json,
      show_in_nav: data.show_in_nav ? 1 : 0,
      nav_label: data.nav_label || null,
      nav_group: data.nav_group || 'standalone',
      nav_order: data.nav_order ?? 99,
      published_at: data.published_at || null,
      expires_at: data.expires_at || null,
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
    // Atualiza a lista local E o DataContext (Header usa nav_pages do contexto)
    await Promise.all([fetchAll(), refreshData()]);
  };

  const handleDelete = async (page: GenericPage) => {
    if (!confirm(`Excluir "${page.title}"?`)) return;
    await fetch(`${API_URL}/admin/generic-pages/${page.id}`, { method: 'DELETE', headers: authH() });
    toast({ title: 'Página excluída.' });
    fetchAll();
  };

  const handleToggleActive = async (page: GenericPage) => {
    await fetch(`${API_URL}/admin/generic-pages/${page.id}`, {
      method: 'PUT',
      headers: authH(),
      body: JSON.stringify({
        ...page,
        is_active: !page.is_active,
        blocks_json: page.blocks_json,
        show_in_nav: page.show_in_nav ? 1 : 0,
        nav_group: page.nav_group || 'standalone',
        nav_order: page.nav_order ?? 99,
      }),
    });
    toast({ title: !page.is_active ? `✅ "${page.title}" ativada!` : `"${page.title}" desativada.` });
    await Promise.all([fetchAll(), refreshData()]);
  };

  const handleDuplicate = async (page: GenericPage) => {
    const res = await fetch(`${API_URL}/admin/generic-pages/${page.id}/duplicate`, { method: 'POST', headers: authH() });
    if (!res.ok) { toast({ title: 'Erro ao duplicar', variant: 'destructive' }); return; }
    toast({ title: 'Página duplicada!' });
    fetchAll();
  };

  const handleBulkActivate = async (activate: boolean) => {
    await Promise.all(Array.from(selectedIds).map(id => {
      const page = pages.find(p => p.id === id);
      if (!page) return Promise.resolve();
      return fetch(`${API_URL}/admin/generic-pages/${id}`, {
        method: 'PUT', headers: authH(),
        body: JSON.stringify({ ...page, is_active: activate, blocks_json: page.blocks_json, show_in_nav: page.show_in_nav ? 1 : 0, nav_group: page.nav_group || 'standalone', nav_order: page.nav_order ?? 99 }),
      });
    }));
    toast({ title: `${selectedIds.size} página(s) ${activate ? 'ativada(s)' : 'desativada(s)'}.` });
    setSelectedIds(new Set());
    await Promise.all([fetchAll(), refreshData()]);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Excluir ${selectedIds.size} página(s)? Esta ação não pode ser desfeita.`)) return;
    await Promise.all(Array.from(selectedIds).map(id =>
      fetch(`${API_URL}/admin/generic-pages/${id}`, { method: 'DELETE', headers: authH() })
    ));
    toast({ title: `${selectedIds.size} página(s) excluída(s).` });
    setSelectedIds(new Set());
    fetchAll();
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  if (editing) {
    return <Editor initial={editing} isNew={isNew} onSave={handleSave} onBack={() => setEditing(null)} />;
  }

  const filtered = pages.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'title') return a.title.localeCompare(b.title, 'pt-BR');
    if (sortBy === 'status') return Number(b.is_active) - Number(a.is_active);
    return (b.id || 0) - (a.id || 0); // created (default)
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* ── Header ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #f1f5f9', padding: '28px 32px 20px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: 0, fontFamily: "'Outfit',sans-serif" }}>
              Páginas do Site
            </h1>
            <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0', fontWeight: 500 }}>
              {pages.length > 0 ? `${pages.length} página${pages.length > 1 ? 's' : ''} criada${pages.length > 1 ? 's' : ''}` : 'Crie e gerencie páginas com o Page Builder'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={handleExport} title="Exportar páginas como JSON"
              style={{ width: 40, height: 40, borderRadius: 12, background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Download size={16} />
            </button>
            <button onClick={() => importRef.current?.click()} title="Importar páginas de JSON"
              style={{ width: 40, height: 40, borderRadius: 12, background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Upload size={16} />
            </button>
            <input ref={importRef} type="file" accept="application/json" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleImport(f); e.target.value = ''; }} />
            <button onClick={() => setShowTemplates(true)}
              style={{ height: 40, padding: '0 18px', borderRadius: 12, background: '#f97316', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 700, boxShadow: '0 4px 12px rgba(249,115,22,.25)', whiteSpace: 'nowrap' }}>
              <Plus size={16} /> Nova Página
            </button>
          </div>
        </div>

        {/* Search + Sort */}
        <div style={{ maxWidth: 960, margin: '16px auto 0', display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar páginas por título ou slug…"
              style={{ width: '100%', height: 40, borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc', padding: '0 14px 0 38px', fontSize: 13, outline: 'none', fontFamily: 'inherit', color: '#0f172a', boxSizing: 'border-box' }} />
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as 'title' | 'created' | 'status')}
            style={{ height: 40, borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc', padding: '0 12px', fontSize: 13, color: '#0f172a' }}>
            <option value="created">Mais recentes</option>
            <option value="title">Nome A–Z</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

        <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 0 64px' }}>

          {/* Loading */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px 0' }}>
              <RefreshCw size={28} style={{ color: '#f97316', animation: 'spin 1s linear infinite' }} />
            </div>
          )}

          {/* Empty state */}
          {!loading && sorted.length === 0 && (
            <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f1f5f9', padding: '64px 40px', textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: 20, background: 'linear-gradient(135deg,#fff7ed,#fed7aa)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 4px 16px rgba(249,115,22,.12)' }}>
                <Globe size={32} style={{ color: '#f97316' }} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 8px', fontFamily: "'Outfit',sans-serif" }}>
                {search ? 'Nenhuma página encontrada' : 'Nenhuma página criada ainda'}
              </h3>
              <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 24px', maxWidth: 360, marginInline: 'auto', lineHeight: 1.6 }}>
                {search
                  ? `Nenhuma página com "${search}". Tente outro termo.`
                  : 'Crie páginas como Sobre, FAQ, Termos e Política usando o Page Builder visual.'}
              </p>
              {!search && (
                <button onClick={() => setShowTemplates(true)}
                  style={{ height: 44, padding: '0 24px', borderRadius: 12, background: '#f97316', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 16px rgba(249,115,22,.25)' }}>
                  <Plus size={16} /> Criar primeira página
                </button>
              )}
            </div>
          )}

          {/* Page cards */}
          {!loading && sorted.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sorted.map((page) => {
                const seoScore2 = [page.og_image, page.meta_title, page.meta_description].filter(Boolean).length;
                const seoColor2 = seoScore2 === 3 ? '#22c55e' : seoScore2 === 2 ? '#f59e0b' : '#ef4444';
                const blockCount = page.blocks_json?.length || 0;
                const isSelected = page.id !== undefined && selectedIds.has(page.id);
                return (
                  <div key={page.id}
                    style={{ background: '#fff', borderRadius: 16, border: `1px solid ${isSelected ? '#fed7aa' : '#f1f5f9'}`, overflow: 'hidden', transition: 'box-shadow .2s, border-color .2s', display: 'flex', alignItems: 'stretch' }}
                    onMouseEnter={e => { if (!isSelected) { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,.07)'; (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'; } }}
                    onMouseLeave={e => { if (!isSelected) { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.borderColor = '#f1f5f9'; } }}>
                    {/* Status stripe */}
                    <div style={{ width: 4, flexShrink: 0, background: page.is_active ? '#22c55e' : '#e2e8f0' }} />
                    {/* Content */}
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', minWidth: 0 }}>
                      {/* Checkbox */}
                      <button
                        onClick={() => page.id !== undefined && toggleSelect(page.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0, lineHeight: 0, color: isSelected ? '#f97316' : '#c8d2e0' }}
                        title={isSelected ? 'Desmarcar' : 'Selecionar'}>
                        {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                      </button>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FileText size={20} style={{ color: '#f97316' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                          <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: "'Outfit',sans-serif" }}>{page.title}</h3>
                          {/* Inline active toggle */}
                          <button
                            onClick={() => handleToggleActive(page)}
                            style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: page.is_active ? '#dcfce7' : '#f1f5f9', color: page.is_active ? '#15803d' : '#64748b', border: 'none', cursor: 'pointer', transition: 'all .15s' }}
                            title={page.is_active ? 'Clique para desativar' : 'Clique para ativar'}>
                            {page.is_active ? '● Ativo' : '○ Inativo'}
                          </button>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: '#eff6ff', color: '#2563eb' }}>
                            {blockCount} bloco{blockCount !== 1 ? 's' : ''}
                          </span>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: seoColor2 + '18', color: seoColor2 }}>
                            SEO {seoScore2}/3
                          </span>
                        </div>
                        <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, fontWeight: 500 }}>/p/{page.slug}</p>
                      </div>
                      {/* Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        {page.is_active && page.slug && (
                          <a href={`/p/${page.slug}`} target="_blank" rel="noreferrer"
                            style={{ width: 34, height: 34, borderRadius: 9, background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', textDecoration: 'none', transition: 'all .15s' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f1f5f9'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
                            title="Ver página">
                            <ExternalLink size={14} />
                          </a>
                        )}
                        <button onClick={() => handleDuplicate(page)}
                          style={{ width: 34, height: 34, borderRadius: 9, background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer', transition: 'all .15s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f1f5f9'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
                          title="Duplicar página">
                          <Copy size={14} />
                        </button>
                        <button onClick={() => { setEditing(page); setIsNew(false); }}
                          style={{ height: 34, padding: '0 14px', borderRadius: 9, background: '#fff7ed', border: '1px solid #fed7aa', color: '#f97316', cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5, transition: 'all .15s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#ffedd5'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff7ed'; }}>
                          <Pencil size={12} /> Editar
                        </button>
                        <button onClick={() => handleDelete(page)}
                          style={{ width: 34, height: 34, borderRadius: 9, background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', cursor: 'pointer', transition: 'all .15s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fef2f2'; (e.currentTarget as HTMLElement).style.color = '#ef4444'; (e.currentTarget as HTMLElement).style.borderColor = '#fecaca'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; (e.currentTarget as HTMLElement).style.color = '#cbd5e1'; (e.currentTarget as HTMLElement).style.borderColor = '#f1f5f9'; }}
                          title="Excluir">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      {/* Page Templates Modal */}
      <PageTemplates
        open={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelect={(blocks) => {
          setEditing({ ...EMPTY, blocks_json: blocks });
          setIsNew(true);
          setShowTemplates(false);
        }}
      />

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 100, background: '#1e293b', borderRadius: 16, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 8px 32px rgba(0,0,0,.25)', minWidth: 400 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', whiteSpace: 'nowrap' }}>
            {selectedIds.size} página{selectedIds.size > 1 ? 's' : ''} selecionada{selectedIds.size > 1 ? 's' : ''}
          </span>
          <div style={{ flex: 1 }} />
          <button onClick={() => handleBulkActivate(true)}
            style={{ height: 34, padding: '0 14px', borderRadius: 9, background: '#22c55e', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
            Ativar
          </button>
          <button onClick={() => handleBulkActivate(false)}
            style={{ height: 34, padding: '0 14px', borderRadius: 9, background: '#64748b', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
            Desativar
          </button>
          <button onClick={handleBulkDelete}
            style={{ height: 34, padding: '0 14px', borderRadius: 9, background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5 }}>
            <Trash2 size={13} /> Excluir
          </button>
          <button onClick={() => setSelectedIds(new Set())}
            style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(255,255,255,.1)', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default GenericPagesManager;