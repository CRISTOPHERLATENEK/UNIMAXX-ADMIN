import { useState, useRef, useEffect, useCallback } from 'react';
import type React from 'react';
import {
  Plus, Trash2, Upload, RefreshCw, ChevronUp, ChevronDown,
  ExternalLink, X, Layout, Image as ImageIcon, Info,
  Eye, EyeOff, AlignLeft, AlignCenter, AlignRight,
  ArrowRight, Copy, Monitor, Smartphone,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { resolveImgSrc } from '@/utils/imageUtils';
import type { Banner } from '@/types';

// ─── Injetar keyframe de spin ─────────────────────────────────────────────────
if (typeof document !== 'undefined' && !document.getElementById('bm-spin-style')) {
  const s = document.createElement('style');
  s.id = 'bm-spin-style';
  s.textContent = `
    @keyframes bm-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    @keyframes bm-fadein { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:none} }
    .bm-spin { animation: bm-spin 1s linear infinite; }
    .bm-saving { animation: bm-fadein .2s ease; }
  `;
  document.head.appendChild(s);
}

const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3001/api';
const BASE_URL = API_URL.replace(/\/api\/?$/, '');

function imgSrc(path: string) {
  return resolveImgSrc(path);
}

// ─── Tipos estendidos localmente (enquanto types/index.ts não é atualizado) ───
interface BannerExt extends Banner {
  image_opacity?: number;
  text_align?: 'left' | 'center' | 'right';
  text_position?: 'left' | 'center' | 'right';
  banner_height?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  overlay_intensity?: number;
  cta2_text?: string;
  cta2_link?: string;
  badge_icon?: string;
  accent_color2?: string;
}

const PAGES = [
  { value: 'home', label: 'Início', path: '/' },
  { value: 'solucoes', label: 'Soluções', path: '/solucoes' },
  { value: 'segmentos', label: 'Segmentos', path: '/segmentos' },
  { value: 'sobre', label: 'Sobre', path: '/sobre' },
  { value: 'carreiras', label: 'Carreiras', path: '/carreiras' },
  { value: 'blog', label: 'Blog', path: '/blog' },
  { value: 'imprensa', label: 'Imprensa', path: '/imprensa' },
  { value: 'suporte', label: 'Suporte', path: '/suporte' },
  { value: 'cliente', label: 'Área Cliente', path: '/cliente' },
];

const STYLES = [
  { id: 'cinematic', label: 'Cinemático' },
  { id: 'neon', label: 'Neon' },
  { id: 'editorial', label: 'Editorial' },
  { id: 'split', label: 'Dividido' },
  { id: 'bold', label: 'Impacto' },
  { id: 'parallax', label: 'Parallax' },
] as const;

const HEIGHTS: { id: BannerExt['banner_height']; label: string; px: string }[] = [
  { id: 'sm', label: 'Compacto', px: '340px' },
  { id: 'md', label: 'Médio', px: '460px' },
  { id: 'lg', label: 'Grande', px: '580px' },
  { id: 'xl', label: 'Extra', px: '700px' },
  { id: 'full', label: 'Tela', px: '100vh' },
];

// ─── Mini thumb por estilo ────────────────────────────────────────────────────
function StyleThumb({ id, accent }: { id: string; accent: string }) {
  const a = accent || '#f97316';
  const base: React.CSSProperties = { width: '100%', aspectRatio: '16/7', position: 'relative', overflow: 'hidden', borderRadius: 6 };
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
  // parallax
  return (
    <div style={{ ...base, background: '#050507', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 60% 50%,rgba(255,255,255,.04) 0%,transparent 65%)' }} />
      <div style={{ position: 'absolute', left: 0, top: '10%', bottom: '10%', width: 2, background: `linear-gradient(to bottom,transparent,${a},transparent)`, borderRadius: 2 }} />
      <div style={{ position: 'absolute', top: 7, left: 10 }}>
        <div style={{ width: 18, height: 2, background: a, borderRadius: 2, marginBottom: 3 }} />
        <div style={{ width: 28, height: 4, background: '#fff', borderRadius: 2, marginBottom: 2 }} />
        <div style={{ width: 16, height: 7, background: a, borderRadius: 999, marginTop: 3 }} />
      </div>
    </div>
  );
}

// ─── Preview ao vivo do banner ───────────────────────────────────────────────
function BannerLivePreview({ draft, mobile }: { draft: BannerExt; mobile: boolean }) {
  const c = draft.bg_color || '#f97316';
  const c2 = draft.accent_color2 || c;
  const opacity = draft.image_opacity ?? 0.5;
  const overlayI = draft.overlay_intensity ?? 0.85;
  const style = draft.banner_style || 'cinematic';
  const hasImage = !!draft.image;
  const src = hasImage ? imgSrc(draft.image) : '';
  const align = draft.text_align || 'left';
  const position = draft.text_position || 'left';
  const height = HEIGHTS.find(h => h.id === (draft.banner_height || 'md'))?.px || '460px';

  const justifyContent = position === 'center' ? 'center' : position === 'right' ? 'flex-end' : 'flex-start';
  const textAlign = align as React.CSSProperties['textAlign'];
  const maxW = mobile ? '100%' : position === 'center' ? 560 : 620;

  const getOverlay = () => {
    if (style === 'cinematic') {
      if (position === 'center') return `linear-gradient(to bottom, rgba(5,5,8,${overlayI * .6}) 0%, rgba(5,5,8,${overlayI * .3}) 50%, rgba(5,5,8,${overlayI * .6}) 100%)`;
      if (position === 'right') return `linear-gradient(270deg, rgba(5,5,8,${overlayI}) 0%, rgba(5,5,8,${overlayI * .7}) 42%, rgba(5,5,8,.05) 100%)`;
      return `linear-gradient(110deg, rgba(5,5,8,${overlayI}) 0%, rgba(5,5,8,${overlayI * .7}) 42%, rgba(5,5,8,.05) 100%)`;
    }
    if (style === 'parallax') return `linear-gradient(115deg, rgba(5,5,8,${overlayI}) 0%, rgba(5,5,8,${overlayI * .6}) 50%, transparent 100%)`;
    return `linear-gradient(110deg, rgba(5,5,8,${overlayI}) 0%, rgba(5,5,8,${overlayI * .6}) 42%, rgba(5,5,8,.05) 100%)`;
  };

  // Estilos que usam layout diferente
  if (style === 'editorial') {
    return (
      <div style={{ position: 'relative', width: '100%', height, background: '#f7f7f5', overflow: 'hidden', borderRadius: 10 }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '42%', height: '100%', overflow: 'hidden', clipPath: 'polygon(12% 0,100% 0,100% 100%,0% 100%)' }}>
          {src ? <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: opacity + .3, mixBlendMode: 'multiply' }} />
            : <div style={{ width: '100%', height: '100%', background: `linear-gradient(160deg,${c},${c}77)` }} />}
        </div>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '0 clamp(1.5rem,4vw,3rem)' }}>
          <div style={{ maxWidth: 480, textAlign }}>
            <PreviewContent draft={draft} dark={false} />
          </div>
        </div>
      </div>
    );
  }

  if (style === 'split') {
    return (
      <div style={{ position: 'relative', width: '100%', height, background: '#0c0c0f', overflow: 'hidden', borderRadius: 10, display: 'flex' }}>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {src && <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity }} />}
          {!src && <div style={{ width: '100%', height: '100%', background: '#1a1a20' }} />}
          <div style={{ position: 'absolute', inset: '0 50% 0 0', background: 'linear-gradient(90deg,transparent,rgba(12,12,15,.5))' }} />
        </div>
        <div style={{ flex: 1, background: `linear-gradient(150deg,${c}ee,${c}88)`, display: 'flex', alignItems: 'center', padding: '0 clamp(1rem,3vw,2rem)' }}>
          <div style={{ maxWidth: 460, textAlign }}>
            <PreviewContent draft={draft} dark={false} />
          </div>
        </div>
      </div>
    );
  }

  if (style === 'bold') {
    return (
      <div style={{ position: 'relative', width: '100%', height, background: '#0e0e11', overflow: 'hidden', borderRadius: 10 }}>
        {src && <img src={src} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: opacity * .4 }} />}
        <div style={{ position: 'absolute', top: 0, right: 0, width: '36%', height: '100%', clipPath: 'polygon(18% 0,100% 0,100% 100%,0% 100%)', background: c, opacity: .92 }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent, padding: '0 clamp(1.5rem,4vw,3rem)' }}>
          <div style={{ maxWidth: maxW as number, textAlign }}><PreviewContent draft={draft} /></div>
        </div>
      </div>
    );
  }

  if (style === 'neon') {
    return (
      <div style={{ position: 'relative', width: '100%', height, background: '#04040a', overflow: 'hidden', borderRadius: 10 }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)', backgroundSize: '56px 56px' }} />
        <div style={{ position: 'absolute', top: -100, right: '8%', width: 400, height: 400, borderRadius: '50%', background: `${c}22`, filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: '5%', width: 280, height: 280, borderRadius: '50%', background: `${c2 || c}15`, filter: 'blur(70px)' }} />
        {src && <img src={src} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: opacity * .25 }} />}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent, padding: '0 clamp(1.5rem,4vw,3rem)' }}>
          <div style={{ maxWidth: maxW as number, textAlign }}><PreviewContent draft={draft} /></div>
        </div>
      </div>
    );
  }

  // Cinematic / Parallax
  return (
    <div style={{ position: 'relative', width: '100%', height, background: '#070709', overflow: 'hidden', borderRadius: 10 }}>
      {src && (
        <>
          <img src={src} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity }} />
          <div style={{ position: 'absolute', inset: 0, background: getOverlay() }} />
        </>
      )}
      {!src && <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 70% 50%,${c}15 0%,transparent 60%)` }} />}
      {style === 'parallax' && (
        <div style={{ position: 'absolute', left: 0, top: '15%', bottom: '15%', width: 3, borderRadius: 2, background: `linear-gradient(to bottom,transparent,${c},transparent)`, opacity: .7 }} />
      )}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent, padding: '0 clamp(1.5rem,4vw,3rem)' }}>
        <div style={{ maxWidth: maxW as number, textAlign }}><PreviewContent draft={draft} /></div>
      </div>
    </div>
  );
}

function PreviewContent({ draft, dark = true }: { draft: BannerExt; dark?: boolean }) {
  const c = draft.bg_color || '#f97316';
  const textPrimary = dark ? '#fff' : '#0d0d0e';
  const textSecondary = dark ? 'rgba(255,255,255,.55)' : '#6b6b70';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {draft.subtitle?.trim() && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginBottom: 16, padding: '5px 13px', borderRadius: 999, background: dark ? `${c}18` : `${c}18`, border: `1px solid ${c}35`, width: 'fit-content' }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: c, flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: c, letterSpacing: '.1em', textTransform: 'uppercase' }}>{draft.subtitle}</span>
        </div>
      )}
      {draft.title?.trim() && (
        <div style={{ fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.03em', color: textPrimary, marginBottom: 12, fontSize: 'clamp(1.4rem,3.5vw,2.8rem)' }}>
          {draft.title}
        </div>
      )}
      {draft.description?.trim() && (
        <p style={{ fontSize: 'clamp(.85rem,1.2vw,.95rem)', fontWeight: 300, lineHeight: 1.7, color: textSecondary, marginBottom: 24, maxWidth: 480 }}>
          {draft.description}
        </p>
      )}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        {draft.cta_text?.trim() && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '11px 24px', borderRadius: 999, background: `linear-gradient(135deg,${c},${c}cc)`, color: '#fff', fontWeight: 800, fontSize: 13 }}>
            {draft.cta_text} <ArrowRight size={13} />
          </div>
        )}
        {draft.cta2_text?.trim() && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '10px 22px', borderRadius: 999, border: `1.5px solid ${c}55`, color: dark ? 'rgba(255,255,255,.8)' : '#444', fontWeight: 700, fontSize: 13 }}>
            {draft.cta2_text}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Card da sidebar ──────────────────────────────────────────────────────────
function BannerCard({ banner, selected, onClick }: { banner: BannerExt; selected: boolean; onClick: () => void }) {
  const acc = banner.bg_color || '#f97316';
  const src = imgSrc(banner.image);
  return (
    <button onClick={onClick} style={{ width: '100%', textAlign: 'left', outline: 'none', padding: 0, background: 'none', border: 'none', cursor: 'pointer' }}>
      <div style={{
        borderRadius: 12, overflow: 'hidden',
        border: `2px solid ${selected ? acc : 'rgba(0,0,0,.07)'}`,
        boxShadow: selected ? `0 0 0 3px ${acc}20` : '0 1px 4px rgba(0,0,0,.05)',
        transition: 'all .18s',
      }}>
        <div style={{ position: 'relative', aspectRatio: '16/6', background: src ? '#000' : `linear-gradient(135deg,${acc},${acc}77)`, overflow: 'hidden' }}>
          {src && <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .8 }} />}
          {!src && <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle,rgba(255,255,255,.08) 1px,transparent 1px)', backgroundSize: '14px 14px' }} />}
          <span style={{
            position: 'absolute', top: 7, right: 7,
            fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999,
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
        <div style={{ background: '#fff', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', background: acc, flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: '#1d1d1f', flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            {banner.title || 'Sem título'}
          </span>
          <span style={{ fontSize: 10, color: '#98989d', textTransform: 'capitalize' }}>{banner.banner_style || 'cinematic'}</span>
        </div>
      </div>
    </button>
  );
}

// ─── Slider com label ─────────────────────────────────────────────────────────
function SliderField({ label, value, min, max, step = 0.01, format, onChange }: {
  label: string; value: number; min: number; max: number; step?: number;
  format?: (v: number) => string; onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const display = format ? format(value) : Math.round(value * 100) + '%';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <Label style={{ fontSize: 12, fontWeight: 600, color: '#1d1d1f' }}>{label}</Label>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#f97316', fontFamily: 'monospace' }}>{display}</span>
      </div>
      <div style={{ position: 'relative', height: 20, display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, height: 4, borderRadius: 2, background: '#f0f0f0', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg,#f97316,#fb923c)', borderRadius: 2 }} />
        </div>
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{ position: 'absolute', left: 0, right: 0, opacity: 0, cursor: 'pointer', width: '100%', height: 20 }}
        />
      </div>
    </div>
  );
}

// ─── Seção colapsável ─────────────────────────────────────────────────────────
function Section({ title, icon, children, defaultOpen = true }: {
  title: string; icon?: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,.07)', overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        {icon && <span style={{ color: '#f97316', display: 'flex' }}>{icon}</span>}
        <span style={{ fontWeight: 700, fontSize: 13, color: '#1d1d1f', flex: 1 }}>{title}</span>
        <ChevronDown size={15} color="#98989d" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
      </button>
      {open && <div style={{ padding: '0 18px 18px' }}>{children}</div>}
    </div>
  );
}

// ─── Manager principal ────────────────────────────────────────────────────────
export function BannersManager() {
  const { data, addBanner, updateBanner, deleteBanner, refreshData } = useData();
  const { toast } = useToast();

  const [selectedPage, setSelectedPage] = useState('home');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [draft, setDraft] = useState<BannerExt | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewMobile, setPreviewMobile] = useState(false);
  const [previewFullscreen, setPreviewFullscreen] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const pageBanners = (data.banners as BannerExt[])
    .filter(b => (b.page || 'home') === selectedPage)
    .sort((a, b) => (a.order_num || 0) - (b.order_num || 0));

  useEffect(() => {
    if (selectedId === null) { setDraft(null); return; }
    const found = (data.banners as BannerExt[]).find(b => b.id === selectedId);
    if (found) setDraft({ ...found });
    else setDraft(null);
  }, [selectedId, data.banners]);

  const setField = useCallback((patch: Partial<BannerExt>) => {
    if (!draft) return;
    const updated = { ...draft, ...patch };
    setDraft(updated);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => persistSave(updated), 800);
  }, [draft]);

  const persistSave = async (b: BannerExt) => {
    if (!b.id) return;
    setSaving(true);
    try { await updateBanner(b as Banner); }
    catch { toast({ title: 'Erro ao salvar', variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  const saveNow = async (patch: Partial<BannerExt>) => {
    if (!draft) return;
    const updated = { ...draft, ...patch };
    setDraft(updated);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaving(true);
    try { await updateBanner(updated as Banner); }
    catch { toast({ title: 'Erro ao salvar', variant: 'destructive' }); }
    finally { setSaving(false); }
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
      } as Banner);
      if (newId) setSelectedId(newId);
    } catch { toast({ title: 'Erro ao criar banner', variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  const handleDuplicate = async () => {
    if (!draft) return;
    const { id: _, ...rest } = draft;
    try {
      setSaving(true);
      const newId = await addBanner({ ...rest, title: `${draft.title} (cópia)`, order_num: pageBanners.length } as Banner);
      if (newId) setSelectedId(newId);
      toast({ title: 'Banner duplicado!' });
    } catch { toast({ title: 'Erro ao duplicar', variant: 'destructive' }); }
    finally { setSaving(false); }
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
    } finally { setUploading(false); }
  };

  const accent = draft?.bg_color || '#f97316';
  const previewSrc = draft?.image ? imgSrc(draft.image) : '';

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f5f5f7' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', background: '#fff', borderBottom: '1px solid rgba(0,0,0,.07)', flexShrink: 0, gap: 12 }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: 18, color: '#1d1d1f', margin: 0, letterSpacing: '-0.02em' }}>Banners / Carrossel</h1>
          <p style={{ fontSize: 12, color: '#98989d', margin: '2px 0 0' }}>
            {saving ? <span className="bm-saving" style={{ color: '#f97316', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <RefreshCw size={11} className="bm-spin" /> Salvando...
            </span> : 'Salvo automaticamente'}
          </p>
        </div>
        <Button onClick={handleAdd} disabled={saving}
          style={{ background: '#f97316', color: '#fff', borderRadius: 10, fontWeight: 700, gap: 5, height: 36, fontSize: 13 }}>
          <Plus size={15} /> Novo Banner
        </Button>
      </div>

      {/* Page tabs */}
      <div style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,.07)', padding: '0 24px', display: 'flex', gap: 2, overflowX: 'auto' }}>
        {PAGES.map(p => {
          const count = data.banners.filter(b => (b.page || 'home') === p.value).length;
          const isActive = selectedPage === p.value;
          return (
            <button key={p.value}
              onClick={() => { setSelectedPage(p.value); setSelectedId(null); }}
              style={{
                padding: '11px 14px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer',
                color: isActive ? '#f97316' : '#6e6e73', background: 'none', border: 'none',
                borderBottom: isActive ? '2px solid #f97316' : '2px solid transparent',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
              {p.label}
              {count > 0 && (
                <span style={{ fontSize: 9, fontWeight: 800, padding: '1px 5px', borderRadius: 999, background: isActive ? '#f97316' : '#f0f0f0', color: isActive ? '#fff' : '#888' }}>
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
        <div style={{ width: 240, flexShrink: 0, background: '#fff', borderRight: '1px solid rgba(0,0,0,.07)', overflowY: 'auto' }}>
          <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 7 }}>
            {pageBanners.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 16px' }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <ImageIcon size={18} color="#c7c7cc" />
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f', margin: '0 0 4px' }}>Nenhum banner</p>
                <p style={{ fontSize: 12, color: '#98989d', margin: '0 0 14px' }}>Crie o primeiro banner</p>
                <Button onClick={handleAdd} size="sm" style={{ background: '#f97316', color: '#fff', width: '100%', borderRadius: 9, gap: 4, fontSize: 12 }}>
                  <Plus size={13} /> Criar banner
                </Button>
              </div>
            ) : pageBanners.map(b => (
              <BannerCard key={b.id} banner={b} selected={selectedId === b.id} onClick={() => setSelectedId(b.id!)} />
            ))}
          </div>
        </div>

        {/* Editor + Preview */}
        {!draft ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 60, height: 60, borderRadius: 18, background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <Layout size={26} color="#c7c7cc" />
              </div>
              <p style={{ fontWeight: 600, color: '#1d1d1f', margin: '0 0 4px' }}>Selecione um banner</p>
              <p style={{ fontSize: 13, color: '#98989d' }}>Clique na lista à esquerda para editar</p>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

            {/* ── Preview ao vivo ── */}
            <div style={{ background: '#1a1a1a', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,.07)' }}>
              {/* Toolbar do preview */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.4)', letterSpacing: '.08em', textTransform: 'uppercase' }}>Preview ao vivo</span>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 0 2px #22c55e30' }} />
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => setPreviewMobile(false)}
                    style={{ padding: '5px 10px', borderRadius: 7, border: `1px solid ${!previewMobile ? 'rgba(255,255,255,.3)' : 'rgba(255,255,255,.1)'}`, background: !previewMobile ? 'rgba(255,255,255,.1)' : 'none', color: !previewMobile ? '#fff' : 'rgba(255,255,255,.4)', cursor: 'pointer', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Monitor size={13} /> Desktop
                  </button>
                  <button onClick={() => setPreviewMobile(true)}
                    style={{ padding: '5px 10px', borderRadius: 7, border: `1px solid ${previewMobile ? 'rgba(255,255,255,.3)' : 'rgba(255,255,255,.1)'}`, background: previewMobile ? 'rgba(255,255,255,.1)' : 'none', color: previewMobile ? '#fff' : 'rgba(255,255,255,.4)', cursor: 'pointer', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Smartphone size={13} /> Mobile
                  </button>
                </div>
              </div>

              {/* Preview frame */}
              <div style={{
                margin: '0 auto',
                width: previewMobile ? 380 : '100%',
                transition: 'width .3s ease',
                borderRadius: 12,
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,.08)',
              }}>
                <BannerLivePreview draft={draft} mobile={previewMobile} />
              </div>
            </div>

            {/* ── Controles ── */}
            <div style={{ flex: 1, padding: 20 }}>
              <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>

                {/* Barra de status + ações */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Switch checked={draft.active === 1} onCheckedChange={v => saveNow({ active: v ? 1 : 0 })} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: draft.active === 1 ? '#16a34a' : '#6b7280' }}>
                      {draft.active === 1 ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <a href={PAGES.find(p => p.value === selectedPage)?.path || '/'} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline" style={{ borderRadius: 8, fontSize: 12, gap: 4, height: 32 }}>
                        <ExternalLink size={12} /> Ver página
                      </Button>
                    </a>
                    <Button size="sm" variant="outline" onClick={handleDuplicate}
                      style={{ borderRadius: 8, fontSize: 12, gap: 4, height: 32 }}>
                      <Copy size={12} /> Duplicar
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleDelete}
                      style={{ borderRadius: 8, fontSize: 12, gap: 4, height: 32, color: '#ef4444', borderColor: '#fecaca' }}>
                      <Trash2 size={12} /> Excluir
                    </Button>
                  </div>
                </div>

                {/* ── IMAGEM ── */}
                <Section title="Imagem de fundo" icon={<ImageIcon size={14} />}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                    {[{ v: 0, l: 'Imagem' }, { v: 1, l: 'Cor sólida' }].map(({ v, l }) => (
                      <button key={v} onClick={() => saveNow({ use_default_bg: v })}
                        style={{ flex: 1, padding: '8px', borderRadius: 8, border: `1.5px solid ${draft.use_default_bg === v ? accent : 'rgba(0,0,0,.1)'}`, background: draft.use_default_bg === v ? `${accent}10` : '#fff', fontWeight: 700, fontSize: 12, color: draft.use_default_bg === v ? accent : '#888', cursor: 'pointer' }}>
                        {l}
                      </button>
                    ))}
                  </div>

                  {draft.use_default_bg === 0 ? (
                    <>
                      {/* Upload / Preview */}
                      <div style={{ position: 'relative', aspectRatio: '16/5', borderRadius: 10, overflow: 'hidden', cursor: previewSrc ? 'default' : 'pointer', background: '#111', marginBottom: 10 }}
                        onClick={() => !previewSrc && fileRef.current?.click()}>
                        {previewSrc ? (
                          <>
                            <img src={previewSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', inset: 0 }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,.5)'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, opacity: 0, transition: 'opacity .2s' }}
                                onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
                                onMouseLeave={e => { e.currentTarget.style.opacity = '0'; }}>
                                <button onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}
                                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8, background: '#fff', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                                  <Upload size={13} /> {uploading ? 'Enviando...' : 'Trocar'}
                                </button>
                                <button onClick={e => { e.stopPropagation(); saveNow({ image: '' }); }}
                                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8, background: '#ef4444', color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                                  <X size={13} /> Remover
                                </button>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, border: '2px dashed rgba(255,255,255,.15)', borderRadius: 10 }}>
                            {uploading
                              ? <RefreshCw size={26} color="#f97316" className="bm-spin" />
                              : <>
                                <Upload size={22} color="#6b7280" />
                                <p style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', margin: 0 }}>Clique para enviar imagem</p>
                                <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>PNG, JPG, WEBP</p>
                              </>
                            }
                          </div>
                        )}
                      </div>
                      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ''; }} />
                      <Input value={draft.image || ''} onChange={e => setField({ image: e.target.value })}
                        placeholder="Ou cole URL da imagem..." style={{ height: 36, fontSize: 12, marginBottom: 14 }} />

                      {/* Opacidade da imagem */}
                      <SliderField
                        label="Opacidade da imagem"
                        value={draft.image_opacity ?? 0.5}
                        min={0.05} max={1} step={0.01}
                        onChange={v => setField({ image_opacity: v })}
                      />

                      {/* Intensidade do overlay */}
                      <div style={{ marginTop: 12 }}>
                        <SliderField
                          label="Intensidade do overlay"
                          value={draft.overlay_intensity ?? 0.85}
                          min={0.1} max={1} step={0.01}
                          onChange={v => setField({ overlay_intensity: v })}
                        />
                      </div>

                      {/* Modo sobreposição */}
                      <div style={{ marginTop: 14 }}>
                        <Label style={{ fontSize: 12, fontWeight: 600, color: '#1d1d1f', display: 'block', marginBottom: 8 }}>Sobreposição de textos</Label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          {[{ v: 1, title: 'Com overlay', sub: 'Gradiente + textos' }, { v: 0, title: 'Só imagem', sub: 'Sem sobreposição' }].map(({ v, title, sub }) => {
                            const sel = (draft.use_style ?? 1) === v;
                            return (
                              <button key={v} onClick={() => saveNow({ use_style: v })}
                                style={{ borderRadius: 10, border: `1.5px solid ${sel ? accent : 'rgba(0,0,0,.1)'}`, cursor: 'pointer', textAlign: 'left', background: sel ? `${accent}08` : '#fff', padding: '10px 12px' }}>
                                <p style={{ fontSize: 12, fontWeight: 700, color: sel ? accent : '#1d1d1f', margin: '0 0 2px' }}>{title}</p>
                                <p style={{ fontSize: 11, color: '#98989d', margin: 0 }}>{sub}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Cor sólida */
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <input type="color" value={draft.bg_color || '#f97316'}
                        onChange={e => saveNow({ bg_color: e.target.value })}
                        style={{ width: 44, height: 44, borderRadius: 9, border: '1px solid rgba(0,0,0,.1)', cursor: 'pointer', padding: 3 }} />
                      <div style={{ flex: 1 }}>
                        <Label style={{ fontSize: 11, color: '#98989d', display: 'block', marginBottom: 4 }}>Cor de fundo</Label>
                        <Input value={draft.bg_color || '#f97316'} onChange={e => setField({ bg_color: e.target.value })}
                          style={{ height: 36, fontFamily: 'monospace', fontSize: 12 }} />
                      </div>
                    </div>
                  )}
                </Section>

                {/* ── ESTILO VISUAL ── */}
                <Section title="Estilo visual">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 6, marginBottom: 16 }}>
                    {STYLES.map(s => {
                      const sel = (draft.banner_style || 'cinematic') === s.id;
                      return (
                        <button key={s.id} onClick={() => saveNow({ banner_style: s.id })}
                          style={{ border: `2px solid ${sel ? accent : 'transparent'}`, borderRadius: 8, overflow: 'hidden', cursor: 'pointer', padding: 0, background: 'none' }}>
                          <StyleThumb id={s.id} accent={accent} />
                          <div style={{ fontSize: 9, fontWeight: sel ? 800 : 500, color: sel ? accent : '#98989d', padding: '3px 0', textAlign: 'center', background: '#fff' }}>
                            {s.label}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Altura */}
                  <div style={{ marginBottom: 14 }}>
                    <Label style={{ fontSize: 12, fontWeight: 600, color: '#1d1d1f', display: 'block', marginBottom: 8 }}>Altura do banner</Label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {HEIGHTS.map(h => {
                        const sel = (draft.banner_height || 'md') === h.id;
                        return (
                          <button key={h.id} onClick={() => setField({ banner_height: h.id })}
                            style={{ flex: 1, padding: '6px 4px', borderRadius: 7, border: `1.5px solid ${sel ? accent : 'rgba(0,0,0,.1)'}`, background: sel ? `${accent}10` : '#fff', fontWeight: sel ? 700 : 500, fontSize: 11, color: sel ? accent : '#888', cursor: 'pointer' }}>
                            {h.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cor de destaque */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <Label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>Cor de destaque principal</Label>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input type="color" value={draft.bg_color || '#f97316'}
                          onChange={e => saveNow({ bg_color: e.target.value })}
                          style={{ width: 36, height: 36, borderRadius: 7, border: '1px solid rgba(0,0,0,.1)', cursor: 'pointer', padding: 2, flexShrink: 0 }} />
                        <Input value={draft.bg_color || '#f97316'} onChange={e => setField({ bg_color: e.target.value })}
                          style={{ height: 36, fontFamily: 'monospace', fontSize: 12 }} />
                      </div>
                    </div>
                    <div>
                      <Label style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: 6 }}>Cor secundária (efeitos)</Label>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input type="color" value={draft.accent_color2 || draft.bg_color || '#f97316'}
                          onChange={e => saveNow({ accent_color2: e.target.value })}
                          style={{ width: 36, height: 36, borderRadius: 7, border: '1px solid rgba(0,0,0,.1)', cursor: 'pointer', padding: 2, flexShrink: 0 }} />
                        <Input value={draft.accent_color2 || ''} onChange={e => setField({ accent_color2: e.target.value })}
                          placeholder="mesma principal" style={{ height: 36, fontFamily: 'monospace', fontSize: 12 }} />
                      </div>
                    </div>
                  </div>
                </Section>

                {/* ── POSIÇÃO E ALINHAMENTO ── */}
                <Section title="Posição e alinhamento do conteúdo">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    <div>
                      <Label style={{ fontSize: 12, fontWeight: 600, color: '#1d1d1f', display: 'block', marginBottom: 8 }}>Posição horizontal</Label>
                      <div style={{ display: 'flex', borderRadius: 9, border: '1px solid rgba(0,0,0,.1)', overflow: 'hidden' }}>
                        {([['left', 'Esquerda'], ['center', 'Centro'], ['right', 'Direita']] as const).map(([v, l]) => {
                          const sel = (draft.text_position || 'left') === v;
                          return (
                            <button key={v} onClick={() => setField({ text_position: v })}
                              style={{ flex: 1, padding: '7px 4px', fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none', background: sel ? accent : 'transparent', color: sel ? '#fff' : '#6e6e73', borderRight: v !== 'right' ? '1px solid rgba(0,0,0,.08)' : 'none' }}>
                              {l}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <Label style={{ fontSize: 12, fontWeight: 600, color: '#1d1d1f', display: 'block', marginBottom: 8 }}>Alinhamento do texto</Label>
                      <div style={{ display: 'flex', borderRadius: 9, border: '1px solid rgba(0,0,0,.1)', overflow: 'hidden' }}>
                        {([['left', AlignLeft], ['center', AlignCenter], ['right', AlignRight]] as const).map(([v, Icon]) => {
                          const sel = (draft.text_align || 'left') === v;
                          return (
                            <button key={v} onClick={() => setField({ text_align: v })}
                              style={{ flex: 1, padding: '7px', cursor: 'pointer', border: 'none', background: sel ? accent : 'transparent', color: sel ? '#fff' : '#6e6e73', borderRight: v !== 'right' ? '1px solid rgba(0,0,0,.08)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Icon size={14} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </Section>

                {/* ── TEXTOS ── */}
                <Section title="Textos e conteúdo">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <Label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Título *</Label>
                      <Input value={draft.title || ''} onChange={e => setField({ title: e.target.value })}
                        placeholder="Ex: Tecnologia que Impulsiona" style={{ height: 38 }} />
                    </div>
                    <div>
                      <Label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Badge / Subtítulo</Label>
                      <Input value={draft.subtitle || ''} onChange={e => setField({ subtitle: e.target.value })}
                        placeholder="Frase de destaque" style={{ height: 38 }} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <Label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Descrição</Label>
                    <Textarea value={draft.description || ''} onChange={e => setField({ description: e.target.value })}
                      placeholder="Texto de apoio..." rows={2} style={{ resize: 'none', fontSize: 13 }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <Label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Botão principal – texto</Label>
                      <Input value={draft.cta_text || ''} onChange={e => setField({ cta_text: e.target.value })}
                        placeholder="Ex: Saiba mais" style={{ height: 36 }} />
                    </div>
                    <div>
                      <Label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Botão principal – link</Label>
                      <Input value={draft.cta_link || ''} onChange={e => setField({ cta_link: e.target.value })}
                        placeholder="/solucoes ou https://..." style={{ height: 36 }} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <Label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Botão secundário – texto</Label>
                      <Input value={draft.cta2_text || ''} onChange={e => setField({ cta2_text: e.target.value })}
                        placeholder="Ex: Ver demo" style={{ height: 36 }} />
                    </div>
                    <div>
                      <Label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Botão secundário – link</Label>
                      <Input value={draft.cta2_link || ''} onChange={e => setField({ cta2_link: e.target.value })}
                        placeholder="/demo ou https://..." style={{ height: 36 }} />
                    </div>
                  </div>
                </Section>

                {/* ── AGENDAMENTO ── */}
                <Section title="Agendamento (opcional)" defaultOpen={false}>
                  <p style={{ fontSize: 12, color: '#98989d', marginBottom: 12 }}>Defina datas para exibição automática.</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <Label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Início</Label>
                      <Input type="datetime-local" value={draft.starts_at ? draft.starts_at.slice(0, 16) : ''}
                        onChange={e => saveNow({ starts_at: e.target.value || undefined })} style={{ borderRadius: 9, fontSize: 13 }} />
                    </div>
                    <div>
                      <Label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Fim</Label>
                      <Input type="datetime-local" value={draft.ends_at ? draft.ends_at.slice(0, 16) : ''}
                        onChange={e => saveNow({ ends_at: e.target.value || undefined })} style={{ borderRadius: 9, fontSize: 13 }} />
                    </div>
                  </div>
                  {(draft.starts_at || draft.ends_at) && (
                    <button onClick={() => saveNow({ starts_at: undefined, ends_at: undefined })}
                      style={{ marginTop: 10, fontSize: 11, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                      Remover agendamento
                    </button>
                  )}
                </Section>

                {/* ── CONFIGURAÇÕES ── */}
                <Section title="Configurações" defaultOpen={false}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <Label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Página</Label>
                      <select value={draft.page || 'home'} onChange={e => saveNow({ page: e.target.value })}
                        style={{ width: '100%', height: 36, padding: '0 10px', borderRadius: 8, border: '1px solid rgba(0,0,0,.1)', fontSize: 13, background: '#fff', cursor: 'pointer' }}>
                        {PAGES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <Label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 5 }}>Ordem</Label>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => saveNow({ order_num: Math.max(0, (draft.order_num || 0) - 1) })}
                          style={{ height: 36, width: 36, borderRadius: 8, border: '1px solid rgba(0,0,0,.1)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ChevronUp size={15} />
                        </button>
                        <Input type="number" value={draft.order_num || 0} min={0}
                          onChange={e => setField({ order_num: Number(e.target.value) })}
                          style={{ height: 36, textAlign: 'center', flex: 1 }} />
                        <button onClick={() => saveNow({ order_num: (draft.order_num || 0) + 1 })}
                          style={{ height: 36, width: 36, borderRadius: 8, border: '1px solid rgba(0,0,0,.1)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ChevronDown size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </Section>

              </div>
            </div>
          </div>
        )}
      </div>

      <input type="hidden" style={{ display: 'none' }} />
    </div>
  );
}