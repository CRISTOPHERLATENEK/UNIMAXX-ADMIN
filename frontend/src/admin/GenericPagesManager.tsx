// GenericPagesManager — CMS de páginas genéricas via Page Builder
import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Pencil, Trash2, Save, RefreshCw, ExternalLink,
  ArrowLeft, Search, FileText, AlertCircle, Globe,
  Image as ImageIcon, Link2, ShieldOff, Code2, Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { PageBuilder } from './PageBuilder';
import type { PageBlock, PageTheme } from './PageBuilder';
import { DEFAULT_THEME } from './PageBuilder';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

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
}

const EMPTY: GenericPage = {
  slug: '', title: '', meta_title: '', meta_description: '',
  og_image: '', og_title: '', og_description: '', canonical: '',
  robots_noindex: false, structured_data: '',
  theme: { ...DEFAULT_THEME },
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
  const fullUrl = `${siteOrigin}/${form.slug || 'slug'}`;
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

// ── Config Panel ───────────────────────────────────────────────────────────────
function ConfigPanel({ form, set, isNew }: {
  form: GenericPage;
  set: <K extends keyof GenericPage>(k: K, v: GenericPage[K]) => void;
  isNew: boolean;
}) {
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
      </div>
    </div>
  );
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
  const { toast } = useToast();

  const set = <K extends keyof GenericPage>(k: K, v: GenericPage[K]) =>
    setForm(p => ({ ...p, [k]: v }));

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
          {/* SEO Score badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: SEO_COLOR + '15', border: `1px solid ${SEO_COLOR}30` }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: SEO_COLOR }} />
            <span style={{ fontSize: 11, fontWeight: 800, color: SEO_COLOR }}>SEO: {SEO_LABEL}</span>
          </div>
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
            className="px-3.5 py-3 text-[13px] font-medium whitespace-nowrap transition border-b-2 flex items-center gap-2"
            style={{
              borderBottomColor: tab === t.id ? '#f97316' : 'transparent',
              color: tab === t.id ? '#f97316' : '#6e6e73',
            }}>
            {t.label}
            {t.id === 'seo' && (
              <span style={{ width: 16, height: 16, borderRadius: '50%', background: SEO_COLOR, color: '#fff', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {seoScore}
              </span>
            )}
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
                  theme={form.theme}
                  onThemeChange={t => set('theme', t)}
                />
              </div>
            </div>
          )}

          {tab === 'seo' && <SeoPanel form={form} set={set} />}

          {tab === 'config' && <ConfigPanel form={form} set={set} isNew={isNew} />}

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
      const parseObj = (v: any, fallback: any) => {
        if (!v) return fallback;
        try { return typeof v === 'string' ? JSON.parse(v) : v; } catch { return fallback; }
      };
      setPages(data.map((p: any) => ({
        ...p,
        is_active: !!p.is_active,
        robots_noindex: !!p.robots_noindex,
        blocks_json: parseArr(p.blocks_json),
        theme: parseObj(p.theme, { ...DEFAULT_THEME }),
      })));
    } catch {
      toast({ title: 'Erro ao carregar páginas', variant: 'destructive' });
    } finally { setLoading(false); }
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
          {filtered.map((page) => {
            const seoOk = page.og_image && page.meta_title && page.meta_description;
            return (
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
                      <Badge className={`text-[10px] border-0 px-2 py-0.5 ${seoOk ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                        SEO {seoOk ? '✓' : '!'}
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
            );
          })}
        </div>
      )}
    </div>
  );
}

export default GenericPagesManager;