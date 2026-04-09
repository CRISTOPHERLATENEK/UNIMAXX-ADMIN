import React, { useState, useEffect } from 'react';
import {
  Save, User, Lock, Palette, Globe, Phone, Share2,
  RefreshCw, Eye, EyeOff, CheckCircle,
  Instagram, Linkedin, Youtube, Facebook,
  Building2, Search, Plug, Zap, FileText,
  Mail, MessageSquare, Hash, Star, Shield,
  ChevronDown, Settings as SettingsIcon, Image, Layout, Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { ImageUploadField } from '@/components/ImageUploadField';
import type { ImgSpec } from '@/components/ImageUploadField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { HomeSectionModal } from '@/admin/HomeSectionModal';
import { HOME_SECTION_CONFIGS } from '@/admin/homeSectionConfigs';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const TABS = [
  { id: 'aparencia', label: 'Aparência', icon: Palette },
  { id: 'empresa', label: 'Empresa', icon: Building2 },
  { id: 'contato', label: 'Contato', icon: Phone },
  { id: 'rodape', label: 'Rodapé', icon: Layout },
  { id: 'redes', label: 'Redes Sociais', icon: Share2 },
  { id: 'seo', label: 'SEO Global', icon: Search },
  { id: 'integracoes', label: 'Integrações', icon: Plug },
  { id: 'scripts', label: 'Scripts & Head', icon: FileText },
  { id: 'notificacoes', label: 'Notificações', icon: Sparkles },
  { id: 'manutencao', label: 'Manutenção', icon: SettingsIcon },
  { id: 'perfil', label: 'Perfil', icon: User },
  { id: 'seguranca', label: 'Segurança', icon: Lock },
];

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border p-6 space-y-5" style={{ borderColor: 'rgba(0,0,0,.07)' }}>
      <div className="pb-3 border-b" style={{ borderColor: 'rgba(0,0,0,.06)' }}>
        <p className="font-bold text-[#1d1d1f] text-base">{title}</p>
        {desc && <p className="text-xs text-[#98989d] mt-0.5">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div>
        <Label className="text-xs font-semibold text-[#1d1d1f]">{label}</Label>
        {hint && <p className="text-[11px] text-[#98989d]">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function ToggleRow({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: '#f5f5f7' }}>
      <div>
        <p className="font-semibold text-sm text-[#1d1d1f]">{label}</p>
        {desc && <p className="text-xs text-[#98989d] mt-0.5">{desc}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

// ─── Helpers de cor ──────────────────────────────────────────────────────────

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

function getLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const lin = (c: number) => c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function contrastGrade(ratio: number): { label: string; color: string; ok: boolean } {
  if (ratio >= 7) return { label: 'AAA ✓ Excelente', color: '#16a34a', ok: true };
  if (ratio >= 4.5) return { label: 'AA ✓ Bom', color: '#2563eb', ok: true };
  if (ratio >= 3) return { label: 'AA Large', color: '#d97706', ok: true };
  return { label: 'Falha ✗', color: '#dc2626', ok: false };
}

function generateHarmony(hex: string, type: string): string[] {
  const [h, s, l] = hexToHsl(hex);
  switch (type) {
    case 'complementar':
      return [hex, hslToHex((h + 180) % 360, s, l)];
    case 'analogica':
      return [hslToHex((h - 30 + 360) % 360, s, l), hex, hslToHex((h + 30) % 360, s, l)];
    case 'triádica':
      return [hex, hslToHex((h + 120) % 360, s, l), hslToHex((h + 240) % 360, s, l)];
    case 'tetrádica':
      return [hex, hslToHex((h + 90) % 360, s, l), hslToHex((h + 180) % 360, s, l), hslToHex((h + 270) % 360, s, l)];
    case 'split':
      return [hex, hslToHex((h + 150) % 360, s, l), hslToHex((h + 210) % 360, s, l)];
    default: return [hex];
  }
}

function generateShades(hex: string): string[] {
  const [h, s] = hexToHsl(hex);
  return [95, 85, 70, 55, 45, 35, 25, 15].map(l => hslToHex(h, s, l));
}

// ─── ColorSlider ──────────────────────────────────────────────────────────────

function ColorSlider({
  label, value, max, gradient, onChange
}: { label: string; value: number; max: number; gradient: string; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[11px] font-semibold text-[#6e6e73] uppercase tracking-wide">{label}</span>
        <span className="text-[11px] font-mono text-[#1d1d1f]">{value}°</span>
      </div>
      <div className="relative h-3 rounded-full overflow-hidden" style={{ background: gradient }}>
        <input
          type="range" min={0} max={max} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
          style={{ zIndex: 2 }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md pointer-events-none"
          style={{ left: `calc(${(value / max) * 100}% - 8px)`, background: 'white', zIndex: 1 }}
        />
      </div>
    </div>
  );
}

// ─── AdvancedColorPicker ──────────────────────────────────────────────────────

function AdvancedColorPicker({
  label, hint, value, onChange, showContrast, contrastWith,
}: {
  label: string; hint?: string; value: string; onChange: (v: string) => void;
  showContrast?: boolean; contrastWith?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const safeHex = /^#[0-9a-fA-F]{6}$/.test(value) ? value : '#000000';
  const [h, s, l] = hexToHsl(safeHex);

  const updateH = (v: number) => onChange(hslToHex(v, s, l));
  const updateS = (v: number) => onChange(hslToHex(h, v, l));
  const updateL = (v: number) => onChange(hslToHex(h, s, v));

  const shades = generateShades(safeHex);
  const contrast = contrastWith ? getContrastRatio(safeHex, contrastWith) : null;
  const grade = contrast ? contrastGrade(contrast) : null;

  const hGradient = `linear-gradient(to right,${[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360].map(v => hslToHex(v, s, l)).join(',')
    })`;
  const sGradient = `linear-gradient(to right,${hslToHex(h, 0, l)},${hslToHex(h, 100, l)})`;
  const lGradient = `linear-gradient(to right,#000,${hslToHex(h, s, 50)},#fff)`;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-xs font-semibold text-[#1d1d1f]">{label}</Label>
          {hint && <p className="text-[11px] text-[#98989d]">{hint}</p>}
        </div>
        {grade && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: grade.color + '18', color: grade.color }}>
            {grade.label} ({contrast!.toFixed(1)}:1)
          </span>
        )}
      </div>

      {/* Compact row */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen(o => !o)}
          className="w-10 h-10 rounded-xl border-2 cursor-pointer flex-shrink-0 transition-transform hover:scale-105"
          style={{ background: safeHex, borderColor: open ? '#f97316' : 'rgba(0,0,0,.1)' }}
        />
        <Input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="#000000"
          className="h-10 font-mono text-sm flex-1"
        />
        <input
          type="color"
          value={safeHex}
          onChange={e => onChange(e.target.value)}
          className="w-10 h-10 rounded-xl border cursor-pointer p-0.5 flex-shrink-0"
          style={{ borderColor: 'rgba(0,0,0,.1)' }}
          title="Picker nativo"
        />
      </div>

      {/* Expanded panel */}
      {open && (
        <div className="rounded-2xl border p-4 space-y-4 mt-1" style={{ background: '#f9f9fb', borderColor: 'rgba(0,0,0,.08)' }}>

          {/* HSL Sliders */}
          <div className="space-y-3">
            <ColorSlider label={`Matiz — ${h}°`} value={h} max={360} gradient={hGradient} onChange={updateH} />
            <ColorSlider label={`Saturação — ${s}%`} value={s} max={100} gradient={sGradient} onChange={updateS} />
            <ColorSlider label={`Luminosidade — ${l}%`} value={l} max={100} gradient={lGradient} onChange={updateL} />
          </div>

          {/* Info row */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: 'HEX', val: safeHex.toUpperCase() },
              { label: 'HSL', val: `${h}° ${s}% ${l}%` },
              { label: 'RGB', val: `${parseInt(safeHex.slice(1, 3), 16)} ${parseInt(safeHex.slice(3, 5), 16)} ${parseInt(safeHex.slice(5, 7), 16)}` },
            ].map(({ label: lb, val }) => (
              <div key={lb} className="rounded-xl p-2" style={{ background: 'rgba(0,0,0,.04)' }}>
                <p className="text-[9px] font-bold text-[#98989d] uppercase tracking-widest mb-0.5">{lb}</p>
                <p className="text-[10px] font-mono text-[#1d1d1f] leading-tight break-all">{val}</p>
              </div>
            ))}
          </div>

          {/* Shades strip */}
          <div>
            <p className="text-[10px] font-bold text-[#98989d] uppercase tracking-widest mb-2">Tons gerados</p>
            <div className="flex gap-1">
              {shades.map((shade, i) => (
                <button
                  key={i}
                  title={shade}
                  onClick={() => onChange(shade)}
                  className="flex-1 h-7 rounded-lg transition-transform hover:scale-110 hover:-translate-y-1 border border-black/5"
                  style={{ background: shade }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-[#c7c7cc]">Escuro</span>
              <span className="text-[9px] text-[#c7c7cc]">Claro</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── HarmonyPicker ────────────────────────────────────────────────────────────

function HarmonyPanel({ primary, onApply }: { primary: string; onApply: (colors: { secondary: string; accent: string }) => void }) {
  const [type, setType] = React.useState('complementar');
  const harmonyTypes = ['complementar', 'analogica', 'triádica', 'tetrádica', 'split'];
  const safeHex = /^#[0-9a-fA-F]{6}$/.test(primary) ? primary : '#f97316';
  const colors = generateHarmony(safeHex, type);

  return (
    <div className="rounded-2xl border p-4 space-y-3" style={{ background: '#f9f9fb', borderColor: 'rgba(0,0,0,.08)' }}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-[#1d1d1f]">🎨 Harmonia de Cores</p>
        <p className="text-[10px] text-[#98989d]">gerado a partir da Cor Primária</p>
      </div>

      {/* Type selector */}
      <div className="flex flex-wrap gap-1.5">
        {harmonyTypes.map(t => (
          <button key={t} onClick={() => setType(t)}
            className="px-3 py-1 rounded-full text-[11px] font-semibold capitalize transition-all"
            style={{
              background: type === t ? '#f97316' : 'rgba(0,0,0,.06)',
              color: type === t ? '#fff' : '#6e6e73',
            }}>
            {t}
          </button>
        ))}
      </div>

      {/* Swatches */}
      <div className="flex gap-2">
        {colors.map((c, i) => (
          <div key={i} className="flex-1 text-center">
            <div className="h-12 rounded-xl border border-black/8 mb-1.5 shadow-sm" style={{ background: c }} />
            <p className="text-[9px] font-mono text-[#98989d]">{c.toUpperCase()}</p>
            <p className="text-[9px] text-[#c7c7cc]">{i === 0 ? 'Primária' : i === 1 ? 'Secundária' : `Acento ${i - 1}`}</p>
          </div>
        ))}
      </div>

      {/* Apply button */}
      {colors.length >= 2 && (
        <button
          onClick={() => onApply({ secondary: colors[1], accent: colors[2] || colors[1] })}
          className="w-full py-2 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>
          Aplicar harmonia ao site
        </button>
      )}
    </div>
  );
}

// ─── LivePreviewMini ──────────────────────────────────────────────────────────

function LivePreviewMini({ pc, sc, ac, fontH, fontB }: { pc: string; sc: string; ac: string; fontH: string; fontB: string }) {
  return (
    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'rgba(0,0,0,.08)' }}>
      {/* Mini header */}
      <div className="flex items-center justify-between px-4 py-2.5" style={{ background: '#fff', borderBottom: '1px solid rgba(0,0,0,.06)' }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg" style={{ background: `linear-gradient(135deg,${pc},${sc})` }} />
          <span className="text-[11px] font-bold text-[#1d1d1f]" style={{ fontFamily: `'${fontH}',sans-serif` }}>Empresa</span>
        </div>
        <div className="flex gap-2">
          {['Soluções', 'Sobre', 'Contato'].map(item => (
            <span key={item} className="text-[9px] text-[#6e6e73]" style={{ fontFamily: `'${fontB}',sans-serif` }}>{item}</span>
          ))}
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: pc, fontFamily: `'${fontB}',sans-serif` }}>Login</span>
        </div>
      </div>

      {/* Mini hero */}
      <div className="px-4 py-5" style={{ background: `linear-gradient(135deg,${pc}12,${sc}08)` }}>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-2" style={{ background: `${ac}18`, border: `1px solid ${ac}30` }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: ac }} />
          <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: ac, fontFamily: `'${fontB}',sans-serif` }}>Destaque</span>
        </div>
        <p className="text-lg font-black leading-tight mb-1" style={{ fontFamily: `'${fontH}',sans-serif`, color: '#1d1d1f', letterSpacing: '-0.03em' }}>
          Sua empresa <span style={{ color: pc }}>aqui</span>
        </p>
        <p className="text-[10px] text-[#6e6e73] mb-3" style={{ fontFamily: `'${fontB}',sans-serif` }}>Soluções personalizadas para o seu negócio.</p>
        <div className="flex gap-2">
          <span className="text-[10px] font-bold px-3 py-1.5 rounded-full text-white shadow-sm" style={{ background: `linear-gradient(135deg,${pc},${sc})` }}>Começar agora</span>
          <span className="text-[10px] font-bold px-3 py-1.5 rounded-full border-2" style={{ borderColor: pc, color: pc }}>Saiba mais</span>
        </div>
      </div>

      {/* Mini cards */}
      <div className="grid grid-cols-3 gap-2 p-3" style={{ background: '#f9f9fb' }}>
        {[['Rápido', '⚡'], ['Seguro', '🔒'], ['Fácil', '✨']].map(([t, icon]) => (
          <div key={t} className="rounded-xl p-2.5 text-center" style={{ background: '#fff', border: `1px solid rgba(0,0,0,.06)` }}>
            <div className="text-base mb-1">{icon}</div>
            <p className="text-[9px] font-bold text-[#1d1d1f]" style={{ fontFamily: `'${fontH}',sans-serif` }}>{t}</p>
            <div className="w-4 h-0.5 rounded-full mx-auto mt-1" style={{ background: pc }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TAB: Aparência ───────────────────────────────────────────────────────────

const PALETTE_PRESETS = [
  { name: 'Laranja (padrão)', primary: '#f97316', secondary: '#fb923c', accent: '#fdba74' },
  { name: 'Azul Profundo', primary: '#2563eb', secondary: '#3b82f6', accent: '#60a5fa' },
  { name: 'Verde Esmeralda', primary: '#059669', secondary: '#10b981', accent: '#34d399' },
  { name: 'Roxo Violeta', primary: '#7c3aed', secondary: '#8b5cf6', accent: '#a78bfa' },
  { name: 'Rosa Fucsia', primary: '#db2777', secondary: '#ec4899', accent: '#f472b6' },
  { name: 'Vermelho Vivo', primary: '#dc2626', secondary: '#ef4444', accent: '#f87171' },
  { name: 'Teal', primary: '#0d9488', secondary: '#14b8a6', accent: '#2dd4bf' },
  { name: 'Âmbar', primary: '#d97706', secondary: '#f59e0b', accent: '#fbbf24' },
];

function TabAparencia({ settings, setSetting }: { settings: Record<string, string>; setSetting: (k: string, v: string) => void }) {
  const pc = settings.primary_color || '#f97316';
  const sc = settings.secondary_color || '#fb923c';
  const ac = settings.accent_color || '#fdba74';
  const fh = settings.font_heading || 'Outfit';
  const fb = settings.font_body || 'DM Sans';

  return (
    <div className="space-y-5">

      {/* ── Presets rápidos ── */}
      <div className="bg-white rounded-2xl border p-5 space-y-3" style={{ borderColor: 'rgba(0,0,0,.07)' }}>
        <div className="pb-2 border-b" style={{ borderColor: 'rgba(0,0,0,.06)' }}>
          <p className="font-bold text-[#1d1d1f] text-base">Paletas Prontas</p>
          <p className="text-xs text-[#98989d] mt-0.5">Clique para aplicar um tema completo instantaneamente</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PALETTE_PRESETS.map(preset => (
            <button
              key={preset.name}
              onClick={() => {
                setSetting('primary_color', preset.primary);
                setSetting('secondary_color', preset.secondary);
                setSetting('accent_color', preset.accent);
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl border transition-all hover:border-[#f97316] hover:bg-orange-50 text-left"
              style={{ borderColor: pc === preset.primary ? '#f97316' : 'rgba(0,0,0,.08)', background: pc === preset.primary ? '#fff7ed' : '#fff' }}>
              <div className="flex flex-col gap-0.5 flex-shrink-0">
                <div className="w-4 h-4 rounded-full" style={{ background: preset.primary }} />
                <div className="w-4 h-2 rounded-full" style={{ background: preset.secondary }} />
                <div className="w-4 h-1 rounded-full" style={{ background: preset.accent }} />
              </div>
              <span className="text-[10px] font-semibold text-[#3a3a3c] leading-tight">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Paleta avançada ── */}
      <Section title="Paleta de Cores Avançada" desc="Editor HSL com sliders, tons automáticos e verificador de contraste WCAG">

        <div className="grid sm:grid-cols-2 gap-5">
          <AdvancedColorPicker
            label="Cor Primária"
            hint="Botões, destaques, links — a cor mais importante"
            value={pc}
            onChange={v => setSetting('primary_color', v)}
            showContrast
            contrastWith="#ffffff"
          />
          <AdvancedColorPicker
            label="Cor Secundária"
            hint="Gradientes, hover states e variações"
            value={sc}
            onChange={v => setSetting('secondary_color', v)}
            showContrast
            contrastWith="#ffffff"
          />
          <AdvancedColorPicker
            label="Cor de Acento"
            hint="Bordas iluminadas, badges e detalhes finos"
            value={ac}
            onChange={v => setSetting('accent_color', v)}
          />
          <AdvancedColorPicker
            label="Cor de Fundo"
            hint="Background geral das seções claras"
            value={settings.bg_color || '#ffffff'}
            onChange={v => setSetting('bg_color', v)}
          />
          <AdvancedColorPicker
            label="Cor do Texto"
            hint="Texto principal em modo claro"
            value={settings.text_color || '#111114'}
            onChange={v => setSetting('text_color', v)}
            showContrast
            contrastWith={settings.bg_color || '#ffffff'}
          />
        </div>

        {/* Contraste rápido */}
        <div className="rounded-xl p-4 space-y-2" style={{ background: '#f9f9fb', border: '1px solid rgba(0,0,0,.06)' }}>
          <p className="text-[10px] font-bold text-[#98989d] uppercase tracking-widest mb-3">Verificação de Contraste WCAG</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { bg: pc, fg: '#ffffff', label: 'Primária / Branco' },
              { bg: sc, fg: '#ffffff', label: 'Secundária / Branco' },
              { bg: '#ffffff', fg: pc, label: 'Branco / Primária' },
              { bg: settings.bg_color || '#fff', fg: settings.text_color || '#111', label: 'Fundo / Texto' },
            ].map(({ bg, fg, label }) => {
              const safeB = /^#[0-9a-fA-F]{6}$/.test(bg) ? bg : '#ffffff';
              const safeF = /^#[0-9a-fA-F]{6}$/.test(fg) ? fg : '#111111';
              const ratio = getContrastRatio(safeB, safeF);
              const grade = contrastGrade(ratio);
              return (
                <div key={label} className="flex items-center gap-2 rounded-xl p-2.5" style={{ background: safeB, border: `1px solid rgba(0,0,0,.08)` }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-semibold truncate" style={{ color: safeF }}>{label}</p>
                    <p className="text-[9px]" style={{ color: safeF + 'aa' }}>{ratio.toFixed(1)}:1</p>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 border"
                    style={{ background: grade.ok ? '#dcfce7' : '#fee2e2', color: grade.ok ? '#16a34a' : '#dc2626', borderColor: grade.ok ? '#bbf7d0' : '#fecaca' }}>
                    {grade.label.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Harmony generator */}
        <HarmonyPanel primary={pc} onApply={({ secondary, accent }) => {
          setSetting('secondary_color', secondary);
          setSetting('accent_color', accent);
        }} />
      </Section>

      {/* ── Pré-visualização ao vivo ── */}
      <Section title="Pré-visualização ao Vivo" desc="Como o site vai aparecer com as configurações atuais">
        <LivePreviewMini pc={pc} sc={sc} ac={ac} fontH={fh} fontB={fb} />
        <div className="flex flex-wrap gap-3 mt-3">
          <button className="px-5 py-2.5 rounded-full text-white text-sm font-bold shadow-sm"
            style={{ background: `linear-gradient(135deg,${pc},${sc})` }}>Botão Primário</button>
          <button className="px-5 py-2.5 rounded-full text-sm font-bold border-2"
            style={{ borderColor: pc, color: pc }}>Botão Outline</button>
          <div className="px-5 py-2.5 rounded-full text-sm font-medium"
            style={{ background: `${pc}14`, color: pc }}>Badge</div>
          <div className="h-10 w-32 rounded-full shadow-sm"
            style={{ background: `linear-gradient(to right,${pc},${sc})` }} />
          <div className="px-4 py-2.5 rounded-xl text-sm font-medium border-2"
            style={{ borderColor: ac, color: '#1d1d1f', background: `${ac}10` }}>Acento</div>
        </div>
      </Section>

      <Section title="Tipografia" desc="Fontes usadas nos títulos e textos do site">
        <div className="grid sm:grid-cols-2 gap-5">
          <Field label="Fonte dos Títulos" hint="Usada em H1, H2, H3 e destaque">
            <select value={fh}
              onChange={(e) => setSetting('font_heading', e.target.value)}
              className="w-full h-10 px-3 rounded-xl border text-sm bg-white"
              style={{ borderColor: 'rgba(0,0,0,.1)' }}>
              {['Outfit', 'Space Grotesk', 'Syne', 'Raleway', 'Montserrat', 'Playfair Display', 'Inter', 'Poppins', 'Josefin Sans', 'DM Serif Display'].map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </Field>
          <Field label="Fonte do Corpo" hint="Usada em parágrafos e textos gerais">
            <select value={fb}
              onChange={(e) => setSetting('font_body', e.target.value)}
              className="w-full h-10 px-3 rounded-xl border text-sm bg-white"
              style={{ borderColor: 'rgba(0,0,0,.1)' }}>
              {['DM Sans', 'Inter', 'Plus Jakarta Sans', 'Nunito', 'Lato', 'Open Sans', 'Source Sans 3', 'Roboto', 'Figtree'].map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="p-4 rounded-xl" style={{ background: '#f5f5f7' }}>
          <p className="text-2xl font-bold text-[#1d1d1f] mb-1"
            style={{ fontFamily: `'${fh}', sans-serif` }}>
            Título de exemplo
          </p>
          <p className="text-sm text-[#6e6e73]"
            style={{ fontFamily: `'${fb}', sans-serif` }}>
            Este é um exemplo de texto de corpo com a fonte selecionada. Fácil de ler e bem espaçado.
          </p>
        </div>
      </Section>

      {/* ── Layout do Header ── */}
      <Section title="Layout do Header" desc="Escolha o estilo visual do cabeçalho do site">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'default', name: 'Clássico Escuro', desc: 'Barra fixa escura padrão', preview: '🌑' },
            { id: 'pill', name: 'Pílula Branca', desc: 'Flutuante arredondado + busca + login', preview: '💊' },
            { id: 'pill-dark', name: 'Pílula Escura', desc: 'Flutuante escuro minimalista', preview: '🖤' },
            { id: 'segmented', name: 'Segmentado', desc: 'Localização · Logo · Conta', preview: '📐' },
          ].map(layout => (
            <button
              key={layout.id}
              onClick={() => setSetting('header_layout', layout.id)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border transition-all hover:shadow-md text-center"
              style={{
                borderColor: (settings.header_layout || 'default') === layout.id ? pc : 'rgba(0,0,0,.08)',
                background: (settings.header_layout || 'default') === layout.id ? `${pc}08` : '#fff',
                boxShadow: (settings.header_layout || 'default') === layout.id ? `0 0 0 2px ${pc}30` : 'none',
              }}>
              <span className="text-2xl">{layout.preview}</span>
              <span className="text-[11px] font-bold text-[#1d1d1f]">{layout.name}</span>
              <span className="text-[9px] text-[#98989d] leading-tight">{layout.desc}</span>
            </button>
          ))}
        </div>

        {/* Cores do Header */}
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <Field label="Cor de fundo do header" hint="Deixe em branco para usar o padrão do layout">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.header_bg_color || '#0a0a0c'}
                onChange={(e) => setSetting('header_bg_color', e.target.value)}
                className="w-10 h-10 rounded-lg border cursor-pointer"
                style={{ borderColor: 'rgba(0,0,0,.1)', padding: 2 }}
              />
              <input
                type="text"
                value={settings.header_bg_color || ''}
                onChange={(e) => setSetting('header_bg_color', e.target.value)}
                placeholder="#0a0a0c (padrão do layout)"
                className="flex-1 h-10 px-3 rounded-xl border text-sm bg-white"
                style={{ borderColor: 'rgba(0,0,0,.1)', fontFamily: 'monospace' }}
              />
              {settings.header_bg_color && (
                <button onClick={() => setSetting('header_bg_color', '')}
                  className="text-[11px] text-red-400 hover:text-red-600 whitespace-nowrap">
                  Limpar
                </button>
              )}
            </div>
          </Field>
          <Field label="Cor do texto/ícones do header" hint="Cor dos links e ícones de navegação">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.header_text_color || '#ffffff'}
                onChange={(e) => setSetting('header_text_color', e.target.value)}
                className="w-10 h-10 rounded-lg border cursor-pointer"
                style={{ borderColor: 'rgba(0,0,0,.1)', padding: 2 }}
              />
              <input
                type="text"
                value={settings.header_text_color || ''}
                onChange={(e) => setSetting('header_text_color', e.target.value)}
                placeholder="#ffffff (padrão do layout)"
                className="flex-1 h-10 px-3 rounded-xl border text-sm bg-white"
                style={{ borderColor: 'rgba(0,0,0,.1)', fontFamily: 'monospace' }}
              />
              {settings.header_text_color && (
                <button onClick={() => setSetting('header_text_color', '')}
                  className="text-[11px] text-red-400 hover:text-red-600 whitespace-nowrap">
                  Limpar
                </button>
              )}
            </div>
          </Field>
        </div>
        {/* Preview rápido */}
        {(settings.header_bg_color || settings.header_text_color) && (
          <div className="mt-3 rounded-xl px-5 py-3 flex items-center justify-between"
            style={{
              background: settings.header_bg_color || '#0a0a0c',
              border: '1px solid rgba(0,0,0,.08)',
            }}>
            <span className="text-sm font-bold" style={{ color: settings.header_text_color || '#ffffff', fontFamily: `'Outfit',sans-serif` }}>
              Logo
            </span>
            <div className="flex gap-4">
              {['Soluções', 'Segmentos', 'Suporte'].map(l => (
                <span key={l} className="text-[12px]" style={{ color: settings.header_text_color || '#ffffff', opacity: 0.7, fontFamily: `'DM Sans',sans-serif` }}>{l}</span>
              ))}
            </div>
            <span className="text-[12px] font-semibold px-4 py-1.5 rounded-full" style={{ background: pc, color: '#fff', fontFamily: `'DM Sans',sans-serif` }}>
              Fale Conosco
            </span>
          </div>
        )}
      </Section>

      <Section title="Estilo do Site" desc="Comportamento visual geral">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Arredondamento geral" hint="Afeta botões, cards e campos">
            <select value={settings.border_radius || 'md'}
              onChange={(e) => setSetting('border_radius', e.target.value)}
              className="w-full h-10 px-3 rounded-xl border text-sm bg-white"
              style={{ borderColor: 'rgba(0,0,0,.1)' }}>
              <option value="none">Sem arredondamento</option>
              <option value="sm">Pequeno (4px)</option>
              <option value="md">Médio (8px)</option>
              <option value="lg">Grande (12px)</option>
              <option value="xl">Extra grande (16px)</option>
              <option value="full">Arredondado total (pill)</option>
            </select>
          </Field>
          <Field label="Estilo de sombra" hint="Sombras em cards e modais">
            <select value={settings.shadow_style || 'md'}
              onChange={(e) => setSetting('shadow_style', e.target.value)}
              className="w-full h-10 px-3 rounded-xl border text-sm bg-white"
              style={{ borderColor: 'rgba(0,0,0,.1)' }}>
              <option value="none">Sem sombra</option>
              <option value="sm">Suave</option>
              <option value="md">Médio</option>
              <option value="lg">Forte</option>
            </select>
          </Field>
        </div>
        <ToggleRow
          label="Animações e transições"
          desc="Efeitos de entrada e hover ao rolar a página"
          checked={settings.animations_enabled !== '0'}
          onChange={(v) => setSetting('animations_enabled', v ? '1' : '0')}
        />
        <ToggleRow
          label="Progresso de rolagem"
          desc="Barra de progresso no topo durante a leitura"
          checked={settings.scroll_progress !== '0'}
          onChange={(v) => setSetting('scroll_progress', v ? '1' : '0')}
        />
      </Section>
    </div>
  );
}

// ─── TAB: Empresa ─────────────────────────────────────────────────────────────

const SPEC_LOGO_MAIN: ImgSpec = {
  dimensions: 'Qualquer — recomendado 400 × 120 px',
  ratio: '~3:1',
  formats: 'PNG, SVG, WEBP',
  maxSize: '1 MB',
  where: 'Header do site',
  objectFit: 'contain',
  tip: 'Use PNG com fundo transparente. O logo é exibido em altura fixa de 40px — arquivos horizontais funcionam melhor.',
};

const SPEC_LOGO_WHITE: ImgSpec = {
  dimensions: 'Mesma proporção do logo principal',
  formats: 'PNG, SVG, WEBP',
  maxSize: '1 MB',
  where: 'Rodapé escuro do site',
  objectFit: 'contain',
  tip: 'Versão branca ou clara do logo, para uso sobre fundos escuros. Se não tiver, deixe vazio — o logo principal será usado.',
};

const SPEC_FAVICON: ImgSpec = {
  dimensions: '32 × 32 px (mínimo)',
  ratio: '1:1',
  formats: 'ICO, PNG, SVG',
  maxSize: '200 KB',
  where: 'Aba do navegador',
  objectFit: 'contain',
  tip: 'Para melhor resultado use um arquivo .ico ou PNG 32×32. Símbolos simples funcionam melhor em tamanho pequeno.',
};

const SPEC_OG: ImgSpec = {
  dimensions: '1200 × 630 px',
  ratio: '~1.9:1',
  formats: 'JPG, PNG, WEBP',
  maxSize: '2 MB',
  where: 'Compartilhamento no WhatsApp, redes sociais e links',
  tip: 'Imagem exibida quando o link do site é compartilhado. Deve ter 1200×630px para não ser cortada. Inclua o logo e identidade visual.',
};

function TabEmpresa({ settings, setSetting, content, setContentKey }: {
  settings: Record<string, string>; setSetting: (k: string, v: string) => void;
  content: Record<string, string>; setContentKey: (k: string, v: string) => void;
}) {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  const [uploading, setUploading] = React.useState<Record<string, boolean>>({});

  const uploadImg = async (key: 'logo' | 'logo_white' | 'favicon' | 'og', file: File, target: 'content' | 'setting', contentKey: string) => {
    setUploading(p => ({ ...p, [key]: true }));
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
      if (target === 'content') setContentKey(contentKey, url);
      else setSetting(contentKey, url);
    } catch (e: any) {
      alert(e?.message || 'Erro no upload');
    } finally {
      setUploading(p => ({ ...p, [key]: false }));
    }
  };

  return (
    <div className="space-y-5">
      <Section title="Identidade da Empresa" desc="Dados exibidos no header, rodapé e páginas institucionais">
        <Field label="Nome da Empresa">
          <Input value={content['header.company'] || ''} onChange={(e) => setContentKey('header.company', e.target.value)}
            placeholder="Ex: Unimaxx" className="h-10" />
        </Field>
        <Field label="Slogan / Tagline" hint="Frase curta exibida abaixo do nome em algumas seções">
          <Input value={content['company.tagline'] || ''} onChange={(e) => setContentKey('company.tagline', e.target.value)}
            placeholder="Tecnologia que transforma resultados" className="h-10" />
        </Field>
        <Field label="Descrição curta" hint="Aparece no rodapé abaixo do logo (2-3 linhas)">
          <textarea value={content['footer.description'] || ''}
            onChange={(e) => setContentKey('footer.description', e.target.value)}
            placeholder="Líder em tecnologia para o varejo..." rows={3}
            className="w-full px-3 py-2.5 rounded-xl border text-sm resize-none"
            style={{ borderColor: 'rgba(0,0,0,.1)' }} />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="CNPJ" hint="Exibido no rodapé (opcional)">
            <Input value={content['company.cnpj'] || ''} onChange={(e) => setContentKey('company.cnpj', e.target.value)}
              placeholder="00.000.000/0001-00" className="h-10 text-sm" />
          </Field>
          <Field label="Ano de fundação" hint="Usado em textos institucionais">
            <Input value={content['company.founded'] || ''} onChange={(e) => setContentKey('company.founded', e.target.value)}
              placeholder="2005" className="h-10 text-sm" />
          </Field>
        </div>
      </Section>

      <Section title="Logotipo" desc="Clique na área ou arraste para enviar. Também pode colar uma URL.">
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-semibold text-[#1d1d1f] mb-2">Logo principal</p>
            <ImageUploadField
              value={content['header.logo'] || ''}
              onChange={(url) => setContentKey('header.logo', url)}
              onUpload={(file) => uploadImg('logo', file, 'content', 'header.logo')}
              uploading={uploading['logo']}
              spec={SPEC_LOGO_MAIN}
              height={110}
            />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#1d1d1f] mb-2">Logo versão clara <span className="font-normal text-[#98989d]">— para fundo escuro</span></p>
            <div className="rounded-xl overflow-hidden" style={{ background: '#1d1d1f' }}>
              <ImageUploadField
                value={content['header.logo_white'] || ''}
                onChange={(url) => setContentKey('header.logo_white', url)}
                onUpload={(file) => uploadImg('logo_white', file, 'content', 'header.logo_white')}
                uploading={uploading['logo_white']}
                spec={SPEC_LOGO_WHITE}
                height={110}
              />
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 pt-2">
          <div>
            <p className="text-xs font-semibold text-[#1d1d1f] mb-2">Favicon <span className="font-normal text-[#98989d]">— aba do navegador</span></p>
            <ImageUploadField
              value={settings['favicon_url'] || ''}
              onChange={(url) => setSetting('favicon_url', url)}
              onUpload={(file) => uploadImg('favicon', file, 'setting', 'favicon_url')}
              uploading={uploading['favicon']}
              spec={SPEC_FAVICON}
              height={90}
            />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#1d1d1f] mb-2">Open Graph Image <span className="font-normal text-[#98989d]">— compartilhamento</span></p>
            <ImageUploadField
              value={settings['og_image'] || ''}
              onChange={(url) => setSetting('og_image', url)}
              onUpload={(file) => uploadImg('og', file, 'setting', 'og_image')}
              uploading={uploading['og']}
              spec={SPEC_OG}
              height={110}
            />
          </div>
        </div>
      </Section>

      <Section title="Copyright" desc="Texto na barra inferior do rodapé">
        <Field label="Texto de copyright">
          <Input value={content['footer.copyright'] || ''} onChange={(e) => setContentKey('footer.copyright', e.target.value)}
            placeholder={`© ${new Date().getFullYear()} Unimaxx. Todos os direitos reservados.`} className="h-10 text-sm" />
        </Field>
      </Section>
    </div>
  );
}

// ─── TAB: Contato ─────────────────────────────────────────────────────────────

function TabContato({ settings, setSetting, content, setContentKey }: {
  settings: Record<string, string>; setSetting: (k: string, v: string) => void;
  content: Record<string, string>; setContentKey: (k: string, v: string) => void;
}) {
  const pc = settings.primary_color || '#f97316';
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border p-5 flex items-center justify-between gap-4 flex-wrap" style={{ borderColor: 'rgba(0,0,0,.07)' }}>
        <div>
          <p className="font-bold text-[#1d1d1f] text-base">Contato / CTA final da home</p>
          <p className="text-xs text-[#98989d] mt-0.5">O texto final da home agora fica aqui, junto das configurações de contato.</p>
        </div>
        <HomeSectionModal
          section={HOME_SECTION_CONFIGS.contact}
          trigger={
            <Button variant="outline" className="rounded-xl">
              <Mail className="w-4 h-4 mr-2" /> Editar CTA final da home
            </Button>
          }
        />
      </div>
      <Section title="Informações de Contato" desc="Aparece na seção de contato e no rodapé">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Telefone principal">
            <Input value={content['contact.phone'] || ''} onChange={(e) => setContentKey('contact.phone', e.target.value)}
              placeholder="(11) 4003-0000" className="h-10" />
          </Field>
          <Field label="Telefone secundário" hint="Opcional">
            <Input value={content['contact.phone2'] || ''} onChange={(e) => setContentKey('contact.phone2', e.target.value)}
              placeholder="(11) 4003-0001" className="h-10" />
          </Field>
          <Field label="WhatsApp" hint="Apenas números com DDD e código do país">
            <Input value={content['contact.whatsapp'] || ''} onChange={(e) => setContentKey('contact.whatsapp', e.target.value)}
              placeholder="5511999999999" className="h-10" />
          </Field>
          <Field label="E-mail principal">
            <Input value={content['contact.email'] || ''} onChange={(e) => setContentKey('contact.email', e.target.value)}
              placeholder="contato@empresa.com.br" className="h-10" />
          </Field>
          <Field label="E-mail de suporte" hint="Opcional — para exibir separadamente">
            <Input value={content['contact.email_support'] || ''} onChange={(e) => setContentKey('contact.email_support', e.target.value)}
              placeholder="suporte@empresa.com.br" className="h-10" />
          </Field>
          <Field label="Horário de atendimento">
            <Input value={content['contact.hours'] || ''} onChange={(e) => setContentKey('contact.hours', e.target.value)}
              placeholder="Seg–Sex, 8h às 18h" className="h-10" />
          </Field>
          <Field label="Endereço — Linha 1">
            <Input value={content['contact.address'] || ''} onChange={(e) => setContentKey('contact.address', e.target.value)}
              placeholder="Av. Exemplo, 123 — Bairro" className="h-10" />
          </Field>
          <Field label="Endereço — Linha 2" hint="Complemento, cidade, estado, CEP">
            <Input value={content['contact.address2'] || ''} onChange={(e) => setContentKey('contact.address2', e.target.value)}
              placeholder="São Paulo, SP — CEP 00000-000" className="h-10" />
          </Field>
        </div>
      </Section>

      <Section title="Widget de WhatsApp" desc="Botão flutuante de WhatsApp no canto inferior direito do site">
        <ToggleRow
          label="Exibir botão WhatsApp"
          desc="Aparece em todas as páginas do site"
          checked={settings.whatsapp_visible === '1'}
          onChange={(v) => setSetting('whatsapp_visible', v ? '1' : '0')}
        />
        <Field label="Número do WhatsApp" hint="Com código do país e DDD, sem espaços ou símbolos">
          <Input value={settings.whatsapp_number || ''} onChange={(e) => setSetting('whatsapp_number', e.target.value)}
            placeholder="5511999999999" className="h-10" />
        </Field>
        <Field label="Mensagem pré-definida" hint="Texto que abre automaticamente na conversa">
          <Input value={settings.whatsapp_message || ''} onChange={(e) => setSetting('whatsapp_message', e.target.value)}
            placeholder="Olá! Gostaria de saber mais sobre as soluções..." className="h-10" />
        </Field>
        <Field label="Posição do widget">
          <select value={settings.whatsapp_position || 'right'}
            onChange={(e) => setSetting('whatsapp_position', e.target.value)}
            className="w-full h-10 px-3 rounded-xl border text-sm bg-white"
            style={{ borderColor: 'rgba(0,0,0,.1)' }}>
            <option value="right">Canto inferior direito</option>
            <option value="left">Canto inferior esquerdo</option>
          </select>
        </Field>
        {settings.whatsapp_number && settings.whatsapp_visible === '1' && (
          <div className="flex items-center gap-3 p-3 rounded-xl text-sm"
            style={{ background: '#dcfce7', border: '1px solid #bbf7d0' }}>
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <p className="text-green-700 font-medium">Widget ativo — número configurado</p>
          </div>
        )}
      </Section>
    </div>
  );
}

// ─── TAB: Rodapé ──────────────────────────────────────────────────────────────

function TabRodape({ settings, setSetting, content, setContentKey }: {
  settings: Record<string, string>; setSetting: (k: string, v: string) => void;
  content: Record<string, string>; setContentKey: (k: string, v: string) => void;
}) {
  const [cols, setCols] = useState<any[]>([]);

  // Sincroniza quando settings carrega do servidor
  useEffect(() => {
    try { setCols(JSON.parse(settings.footer_columns || '[]')); } catch { setCols([]); }
  }, [settings.footer_columns]);

  const addCol = () => {
    const next = [...cols, { title: '', links: [{ label: '', url: '' }] }];
    setCols(next);
    setSetting('footer_columns', JSON.stringify(next));
  };

  const removeCol = (ci: number) => {
    const next = cols.filter((_: any, i: number) => i !== ci);
    setCols(next);
    setSetting('footer_columns', JSON.stringify(next));
  };

  const updateCol = (ci: number, field: string, value: string) => {
    const next = cols.map((c: any, i: number) => i === ci ? { ...c, [field]: value } : c);
    setCols(next);
    setSetting('footer_columns', JSON.stringify(next));
  };

  const addLink = (ci: number) => {
    const next = cols.map((c: any, i: number) =>
      i === ci ? { ...c, links: [...(c.links || []), { label: '', url: '' }] } : c
    );
    setCols(next);
    setSetting('footer_columns', JSON.stringify(next));
  };

  const updateLink = (ci: number, li: number, field: string, value: string) => {
    const next = cols.map((c: any, i: number) =>
      i !== ci ? c : {
        ...c,
        links: c.links.map((l: any, j: number) => j === li ? { ...l, [field]: value } : l),
      }
    );
    setCols(next);
    setSetting('footer_columns', JSON.stringify(next));
  };

  const removeLink = (ci: number, li: number) => {
    const next = cols.map((c: any, i: number) =>
      i !== ci ? c : { ...c, links: c.links.filter((_: any, j: number) => j !== li) }
    );
    setCols(next);
    setSetting('footer_columns', JSON.stringify(next));
  };

  return (
    <div className="space-y-5">
      {/* ── Layout do Footer ── */}
      <Section title="Layout do Rodapé" desc="Escolha o estilo visual do rodapé">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'default', name: 'Completo Escuro', desc: 'Colunas + newsletter + redes sociais', preview: '🌃' },
            { id: 'columns-white', name: 'Colunas Branco', desc: 'Fundo branco com busca e colunas', preview: '☀️' },
            { id: 'columns-dark', name: 'Colunas Escuro', desc: 'Fundo escuro com busca e colunas', preview: '🌌' },
            { id: 'minimal', name: 'Minimalista', desc: 'Nav centralizado + social + copyright', preview: '✨' },
          ].map(layout => (
            <button
              key={layout.id}
              onClick={() => setSetting('footer_layout', layout.id)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border transition-all hover:shadow-md text-center"
              style={{
                borderColor: (settings.footer_layout || 'default') === layout.id ? (settings.primary_color || '#f97316') : 'rgba(0,0,0,.08)',
                background: (settings.footer_layout || 'default') === layout.id ? `${settings.primary_color || '#f97316'}08` : '#fff',
                boxShadow: (settings.footer_layout || 'default') === layout.id ? `0 0 0 2px ${settings.primary_color || '#f97316'}30` : 'none',
              }}>
              <span className="text-2xl">{layout.preview}</span>
              <span className="text-[11px] font-bold text-[#1d1d1f]">{layout.name}</span>
              <span className="text-[9px] text-[#98989d] leading-tight">{layout.desc}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Estilo do Rodapé" desc="Aparência visual da seção de rodapé">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Cor de fundo do rodapé">
            <div className="flex items-center gap-2">
              <input type="color" value={settings.footer_bg || '#1d1d1f'}
                onChange={(e) => setSetting('footer_bg', e.target.value)}
                className="w-10 h-10 rounded-xl border cursor-pointer p-0.5" style={{ borderColor: 'rgba(0,0,0,.1)' }} />
              <Input value={settings.footer_bg || '#1d1d1f'} onChange={(e) => setSetting('footer_bg', e.target.value)}
                placeholder="#1d1d1f" className="h-10 font-mono text-sm flex-1" />
            </div>
          </Field>
          <Field label="Cor do texto do rodapé">
            <div className="flex items-center gap-2">
              <input type="color" value={settings.footer_text_color || '#a3a3a3'}
                onChange={(e) => setSetting('footer_text_color', e.target.value)}
                className="w-10 h-10 rounded-xl border cursor-pointer p-0.5" style={{ borderColor: 'rgba(0,0,0,.1)' }} />
              <Input value={settings.footer_text_color || '#a3a3a3'} onChange={(e) => setSetting('footer_text_color', e.target.value)}
                placeholder="#a3a3a3" className="h-10 font-mono text-sm flex-1" />
            </div>
          </Field>
        </div>
        <ToggleRow
          label="Exibir botões de redes sociais no rodapé"
          desc="Mostra ícones de redes sociais configurados na aba Redes Sociais"
          checked={settings.footer_show_social !== '0'}
          onChange={(v) => setSetting('footer_show_social', v ? '1' : '0')}
        />
        <ToggleRow
          label="Exibir CNPJ no rodapé"
          desc="Mostra o CNPJ configurado na aba Empresa"
          checked={settings.footer_show_cnpj === '1'}
          onChange={(v) => setSetting('footer_show_cnpj', v ? '1' : '0')}
        />
      </Section>

      <Section title="Colunas de Links do Rodapé" desc="Menus de navegação exibidos no rodapé. Se vazio, usa as colunas padrão do sistema.">

        {/* Info sobre padrão */}
        {cols.length === 0 && (
          <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}>
            <span className="text-lg flex-shrink-0">ℹ️</span>
            <div>
              <p className="text-sm font-semibold text-blue-800">Usando colunas padrão</p>
              <p className="text-xs text-blue-700 mt-0.5">
                O rodapé exibe automaticamente: <strong>Soluções</strong> (gerado do banco), <strong>Empresa</strong> e <strong>Suporte</strong>.
                Adicione colunas abaixo para personalizar completamente.
              </p>
            </div>
          </div>
        )}

        {/* Colunas */}
        <div className="space-y-3">
          {cols.map((col: any, ci: number) => (
            <div key={ci} className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(0,0,0,.09)' }}>

              {/* Cabeçalho da coluna */}
              <div className="flex items-center gap-3 px-4 py-3" style={{ background: 'rgba(0,0,0,.02)', borderBottom: '1px solid rgba(0,0,0,.06)' }}>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: '#f97316' }}>
                  {ci + 1}
                </div>
                <Input
                  value={col.title}
                  onChange={e => updateCol(ci, 'title', e.target.value)}
                  placeholder="Título da coluna (ex: Empresa, Suporte...)"
                  className="h-9 text-sm font-semibold flex-1 border-0 bg-transparent p-0 focus:ring-0 shadow-none"
                  style={{ fontSize: 13 }}
                />
                <button
                  onClick={() => removeCol(ci)}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg transition flex-shrink-0">
                  ✕ Remover coluna
                </button>
              </div>

              {/* Links da coluna */}
              <div className="p-4 space-y-2">
                <div className="grid grid-cols-2 gap-2 mb-1">
                  <p className="text-[10px] font-bold text-[#98989d] uppercase tracking-wider pl-1">Texto exibido</p>
                  <p className="text-[10px] font-bold text-[#98989d] uppercase tracking-wider pl-1">URL / Caminho</p>
                </div>

                {(col.links || []).map((link: any, li: number) => (
                  <div key={li} className="flex items-center gap-2">
                    <div className="grid grid-cols-2 gap-2 flex-1">
                      <Input
                        value={link.label}
                        onChange={e => updateLink(ci, li, 'label', e.target.value)}
                        placeholder="Ex: Sobre Nós"
                        className="h-9 text-sm bg-[#f9f9f9]"
                      />
                      <Input
                        value={link.url}
                        onChange={e => updateLink(ci, li, 'url', e.target.value)}
                        placeholder="Ex: /sobre ou https://..."
                        className="h-9 text-sm font-mono bg-[#f9f9f9]"
                      />
                    </div>
                    <button
                      onClick={() => removeLink(ci, li)}
                      title="Remover link"
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-[#c0c0c0] hover:text-red-500 hover:bg-red-50 transition flex-shrink-0 text-base">
                      ✕
                    </button>
                  </div>
                ))}

                <button
                  onClick={() => addLink(ci)}
                  className="flex items-center gap-1.5 text-xs font-medium mt-1 px-3 py-2 rounded-lg transition"
                  style={{ color: '#f97316', background: 'rgba(249,115,22,.07)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(249,115,22,.14)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(249,115,22,.07)')}>
                  + Adicionar link
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Botão adicionar coluna */}
        <button
          onClick={addCol}
          className="w-full h-11 rounded-xl border-2 border-dashed text-sm font-medium transition-all flex items-center justify-center gap-2"
          style={{ borderColor: 'rgba(0,0,0,.15)', color: '#98989d' }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.borderColor = '#f97316';
            (e.currentTarget as HTMLElement).style.color = '#f97316';
            (e.currentTarget as HTMLElement).style.background = 'rgba(249,115,22,.04)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,.15)';
            (e.currentTarget as HTMLElement).style.color = '#98989d';
            (e.currentTarget as HTMLElement).style.background = 'transparent';
          }}>
          + Adicionar coluna
        </button>

        {/* Preview mini do rodapé */}
        {cols.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-[#98989d] uppercase tracking-wider mb-2">Preview das colunas</p>
            <div className="rounded-xl p-4 flex gap-8 overflow-x-auto" style={{ background: '#1a1a1a' }}>
              {cols.filter(c => c.title).map((col: any, ci: number) => (
                <div key={ci} className="flex-shrink-0 min-w-[120px]">
                  <p className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,.3)' }}>
                    {col.title}
                  </p>
                  <ul className="space-y-1.5">
                    {(col.links || []).filter((l: any) => l.label).map((link: any, li: number) => (
                      <li key={li} className="text-xs" style={{ color: 'rgba(255,255,255,.5)' }}>
                        {link.label}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </Section>

      <Section title="Texto de Rodapé" desc="Mensagens extras abaixo do copyright">
        <Field label="Texto adicional no rodapé" hint="Links de política, termos, etc.">
          <textarea value={content['footer.extra'] || ''}
            onChange={(e) => setContentKey('footer.extra', e.target.value)}
            placeholder="Política de Privacidade | Termos de Uso" rows={2}
            className="w-full px-3 py-2.5 rounded-xl border text-sm resize-none"
            style={{ borderColor: 'rgba(0,0,0,.1)' }} />
        </Field>
      </Section>
    </div>
  );
}

// ─── TAB: Redes Sociais ───────────────────────────────────────────────────────

function TabRedes({ settings, setSetting }: { settings: Record<string, string>; setSetting: (k: string, v: string) => void }) {
  const pc = settings.primary_color || '#f97316';
  const socials = [
    { key: 'social_linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/company/...' },
    { key: 'social_instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/...' },
    { key: 'social_facebook', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/...' },
    { key: 'social_youtube', label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/@...' },
    { key: 'social_twitter', label: 'X (Twitter)', icon: Globe, placeholder: 'https://x.com/...' },
    { key: 'social_tiktok', label: 'TikTok', icon: Hash, placeholder: 'https://tiktok.com/@...' },
    { key: 'social_telegram', label: 'Telegram', icon: MessageSquare, placeholder: 'https://t.me/...' },
  ];
  return (
    <div className="space-y-5">
      <Section title="Redes Sociais" desc="Links exibidos no rodapé e cabeçalho. Deixe vazio para ocultar o ícone.">
        {socials.map(({ key, label, icon: Icon, placeholder }) => (
          <Field key={key} label={label}>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${pc}10` }}>
                <Icon className="w-5 h-5" style={{ color: pc }} />
              </div>
              <Input value={settings[key] || ''} onChange={(e) => setSetting(key, e.target.value)}
                placeholder={placeholder} className="h-10 text-sm flex-1" />
              {settings[key] && (
                <a href={settings[key]} target="_blank" rel="noreferrer"
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-[#98989d] hover:text-[#1d1d1f] hover:bg-gray-100 transition flex-shrink-0">
                  <Eye className="w-4 h-4" />
                </a>
              )}
            </div>
          </Field>
        ))}
      </Section>
      <Section title="Compartilhamento" desc="Comportamento ao compartilhar páginas">
        <ToggleRow
          label="Botões de compartilhamento nas páginas"
          desc="Exibe botões para compartilhar soluções e artigos"
          checked={settings.share_buttons === '1'}
          onChange={(v) => setSetting('share_buttons', v ? '1' : '0')}
        />
      </Section>
    </div>
  );
}

// ─── TAB: SEO ─────────────────────────────────────────────────────────────────

function TabSEO({ settings, setSetting }: { settings: Record<string, string>; setSetting: (k: string, v: string) => void }) {
  return (
    <div className="space-y-5">
      <Section title="SEO Global" desc="Configurações padrão para mecanismos de busca">
        <Field label="Nome do site" hint="Aparece no final dos títulos de página (ex: Página | Unimaxx)">
          <Input value={settings.seo_site_name || ''} onChange={(e) => setSetting('seo_site_name', e.target.value)}
            placeholder="Unimaxx" className="h-10" />
        </Field>
        <Field label="Separador de título" hint="Caractere entre título da página e nome do site">
          <select value={settings.seo_separator || '|'}
            onChange={(e) => setSetting('seo_separator', e.target.value)}
            className="w-40 h-10 px-3 rounded-xl border text-sm bg-white"
            style={{ borderColor: 'rgba(0,0,0,.1)' }}>
            {['|', '–', '—', '·', '•', '/'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Descrição padrão" hint="Usada quando a página não tem meta description própria (máx. 160 chars)">
          <textarea value={settings.seo_default_description || ''}
            onChange={(e) => setSetting('seo_default_description', e.target.value)}
            placeholder="Soluções tecnológicas completas para o varejo." rows={3}
            className="w-full px-3 py-2.5 rounded-xl border text-sm resize-none"
            style={{ borderColor: 'rgba(0,0,0,.1)' }} />
          <p className="text-[11px] text-[#98989d]">{(settings.seo_default_description || '').length}/160</p>
        </Field>
        <Field label="Palavras-chave padrão" hint="Separadas por vírgula">
          <Input value={settings.seo_keywords || ''} onChange={(e) => setSetting('seo_keywords', e.target.value)}
            placeholder="software erp, pdv, gestão varejo" className="h-10 text-sm" />
        </Field>
        <div className="p-4 rounded-xl border" style={{ borderColor: 'rgba(0,0,0,.08)', background: '#fafafa' }}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#98989d] mb-2">Preview no Google</p>
          <p className="text-[#1a0dab] text-base font-medium leading-snug">
            Home {settings.seo_separator || '|'} {settings.seo_site_name || 'Unimaxx'}
          </p>
          <p className="text-[#006621] text-xs mt-0.5">https://seusite.com.br</p>
          <p className="text-[#4d5156] text-sm mt-1 leading-relaxed line-clamp-2">
            {settings.seo_default_description || 'Soluções tecnológicas completas para o varejo.'}
          </p>
        </div>
      </Section>

      <Section title="Indexação" desc="Controle de como robôs de busca acessam o site">
        <ToggleRow
          label="Permitir indexação pelos buscadores"
          desc="Desative durante desenvolvimento para não aparecer no Google"
          checked={settings.seo_indexable !== '0'}
          onChange={(v) => setSetting('seo_indexable', v ? '1' : '0')}
        />
        <ToggleRow
          label="Gerar sitemap automaticamente"
          desc="Ajuda o Google a encontrar todas as páginas"
          checked={settings.seo_sitemap !== '0'}
          onChange={(v) => setSetting('seo_sitemap', v ? '1' : '0')}
        />
        <Field label="URL canônica base" hint="URL oficial do site (sem barra no final)">
          <Input value={settings.seo_canonical_base || ''} onChange={(e) => setSetting('seo_canonical_base', e.target.value)}
            placeholder="https://www.seusite.com.br" className="h-10 text-sm" />
        </Field>
      </Section>
    </div>
  );
}

// ─── TAB: Integrações ─────────────────────────────────────────────────────────

function TabIntegracoes({ settings, setSetting }: { settings: Record<string, string>; setSetting: (k: string, v: string) => void }) {
  const mapsUrl = settings.maps_embed_url || '';
  const mapsValid = mapsUrl.includes('/maps/embed');
  return (
    <div className="space-y-5">
      <Section title="Google Analytics / Tag Manager" desc="Rastreamento de visitas e eventos">
        <Field label="Google Analytics 4 — ID de Medição" hint="Formato: G-XXXXXXXXXX">
          <Input value={settings.analytics_id || ''} onChange={(e) => setSetting('analytics_id', e.target.value)}
            placeholder="G-XXXXXXXXXX" className="h-10 font-mono" />
        </Field>
        <Field label="Google Tag Manager — ID do Contêiner" hint="Formato: GTM-XXXXXXX">
          <Input value={settings.gtm_id || ''} onChange={(e) => setSetting('gtm_id', e.target.value)}
            placeholder="GTM-XXXXXXX" className="h-10 font-mono" />
        </Field>
        {(settings.analytics_id || settings.gtm_id) && (
          <div className="flex items-center gap-3 p-3 rounded-xl text-sm"
            style={{ background: '#dcfce7', border: '1px solid #bbf7d0' }}>
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <p className="text-green-700 font-medium">
              {[settings.analytics_id && `GA4: ${settings.analytics_id}`, settings.gtm_id && `GTM: ${settings.gtm_id}`].filter(Boolean).join(' · ')}
            </p>
          </div>
        )}
      </Section>

      <Section title="Google Maps" desc="Mapa interativo na seção de contato">
        <div className="rounded-xl border p-4 space-y-2" style={{ background: '#f0f9ff', borderColor: '#bae6fd' }}>
          <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Como obter a URL correta</p>
          {['Acesse maps.google.com.br e busque o endereço da empresa', 'Clique em "Compartilhar" (ícone de compartilhamento)', 'Selecione a aba "Incorporar um mapa"', 'Clique em "Copiar HTML" — você vai obter um código iframe', 'Cole apenas a URL que está dentro de src="..." no campo abaixo'].map((step, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: '#0ea5e9', color: '#fff' }}>{i + 1}</span>
              <p className="text-xs text-blue-800 leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
        <Field label="URL de Embed" hint='Cole apenas o conteúdo do src="..." do iframe'>
          <Input value={mapsUrl} onChange={(e) => setSetting('maps_embed_url', e.target.value)}
            placeholder="https://www.google.com/maps/embed?pb=..." className="h-10 text-sm" />
        </Field>
        {mapsUrl && !mapsValid && (
          <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: '#fef3c7', border: '1px solid #fcd34d' }}>
            <span className="text-base flex-shrink-0">⚠️</span>
            <p className="text-amber-700 text-xs mt-0.5">URL incorreta — precisa conter <code className="bg-amber-100 px-1 rounded">/maps/embed</code></p>
          </div>
        )}
        {mapsUrl && mapsValid && (
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Preview</p>
            <div className="rounded-xl overflow-hidden border" style={{ height: 200, borderColor: 'rgba(0,0,0,.08)' }}>
              <iframe src={mapsUrl} width="100%" height="200" style={{ border: 0 }} loading="lazy" title="Mapa" />
            </div>
          </div>
        )}
      </Section>

      <Section title="Pixel & Rastreamento" desc="Pixels de remarketing e conversão">
        <Field label="Facebook Pixel ID">
          <Input value={settings.fb_pixel_id || ''} onChange={(e) => setSetting('fb_pixel_id', e.target.value)}
            placeholder="123456789012345" className="h-10 font-mono" />
        </Field>
        <Field label="Microsoft Clarity ID" hint="Para mapas de calor e gravações de sessão">
          <Input value={settings.clarity_id || ''} onChange={(e) => setSetting('clarity_id', e.target.value)}
            placeholder="xxxxxxxxxx" className="h-10 font-mono" />
        </Field>
        <Field label="HotJar ID" hint="Para análise de comportamento do usuário">
          <Input value={settings.hotjar_id || ''} onChange={(e) => setSetting('hotjar_id', e.target.value)}
            placeholder="0000000" className="h-10 font-mono" />
        </Field>
      </Section>

      <Section title="Chat & Atendimento" desc="Widgets de chat ao vivo">
        <Field label="Tawk.to Property ID" hint="Ex: 5f3d4e7b4704467e89f5c3d1/default">
          <Input value={settings.tawkto_id || ''} onChange={(e) => setSetting('tawkto_id', e.target.value)}
            placeholder="PROPERTY_ID/WIDGET_ID" className="h-10 font-mono text-sm" />
        </Field>
        <Field label="Intercom App ID">
          <Input value={settings.intercom_id || ''} onChange={(e) => setSetting('intercom_id', e.target.value)}
            placeholder="app_xxxx" className="h-10 font-mono text-sm" />
        </Field>
        <Field label="Zendesk Key">
          <Input value={settings.zendesk_key || ''} onChange={(e) => setSetting('zendesk_key', e.target.value)}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx" className="h-10 font-mono text-sm" />
        </Field>
      </Section>
    </div>
  );
}

// ─── TAB: Scripts & Head ──────────────────────────────────────────────────────

function TabScripts({ settings, setSetting }: { settings: Record<string, string>; setSetting: (k: string, v: string) => void }) {
  return (
    <div className="space-y-5">
      <div className="p-4 rounded-xl" style={{ background: '#fef3c7', border: '1px solid #fcd34d' }}>
        <p className="text-sm font-bold text-amber-800">⚠️ Uso avançado</p>
        <p className="text-xs text-amber-700 mt-1">Scripts injetados incorretamente podem quebrar o site. Cole apenas código de fontes confiáveis.</p>
      </div>

      <Section title="Scripts no &lt;head&gt;" desc="Inseridos antes do fechamento da tag head — ideal para meta tags, verificações e pixels">
        <Field label="Código personalizado no head">
          <textarea value={settings.custom_head || ''}
            onChange={(e) => setSetting('custom_head', e.target.value)}
            placeholder={'<!-- Cole aqui scripts, meta tags ou links -->\n<meta name="..." content="...">\n<link rel="...">'} rows={8}
            className="w-full px-3 py-2.5 rounded-xl border text-sm font-mono resize-y"
            style={{ borderColor: 'rgba(0,0,0,.1)', lineHeight: 1.6 }} />
        </Field>
      </Section>

      <Section title="Scripts no &lt;body&gt;" desc="Inseridos antes do fechamento da tag body — ideal para chats e pixels de conversão">
        <Field label="Código personalizado no body (início)">
          <textarea value={settings.custom_body_start || ''}
            onChange={(e) => setSetting('custom_body_start', e.target.value)}
            placeholder="<!-- noscript tags, iframes de pixels -->" rows={5}
            className="w-full px-3 py-2.5 rounded-xl border text-sm font-mono resize-y"
            style={{ borderColor: 'rgba(0,0,0,.1)', lineHeight: 1.6 }} />
        </Field>
        <Field label="Código personalizado no body (fim)">
          <textarea value={settings.custom_body_end || ''}
            onChange={(e) => setSetting('custom_body_end', e.target.value)}
            placeholder="<!-- scripts que devem carregar por último -->" rows={5}
            className="w-full px-3 py-2.5 rounded-xl border text-sm font-mono resize-y"
            style={{ borderColor: 'rgba(0,0,0,.1)', lineHeight: 1.6 }} />
        </Field>
      </Section>

      <Section title="CSS Personalizado" desc="Estilos extras injetados em todas as páginas">
        <Field label="CSS global">
          <textarea value={settings.custom_css || ''}
            onChange={(e) => setSetting('custom_css', e.target.value)}
            placeholder="/* Estilos personalizados */\n.minha-classe {\n  color: red;\n}" rows={8}
            className="w-full px-3 py-2.5 rounded-xl border text-sm font-mono resize-y"
            style={{ borderColor: 'rgba(0,0,0,.1)', lineHeight: 1.6 }} />
        </Field>
      </Section>
    </div>
  );
}

// ─── TAB: Notificações ────────────────────────────────────────────────────────

function TabNotificacoes({ settings, setSetting, content, setContentKey }: {
  settings: Record<string, string>; setSetting: (k: string, v: string) => void;
  content: Record<string, string>; setContentKey: (k: string, v: string) => void;
}) {
  return (
    <div className="space-y-5">
      <Section title="Banner de Aviso" desc="Faixa estreita no topo do site para avisos importantes">
        <ToggleRow
          label="Exibir banner de aviso"
          desc="Aparece no topo em todas as páginas"
          checked={settings.top_banner_visible === '1'}
          onChange={(v) => setSetting('top_banner_visible', v ? '1' : '0')}
        />
        <Field label="Texto do banner">
          <Input value={content['top_banner.text'] || ''} onChange={(e) => setContentKey('top_banner.text', e.target.value)}
            placeholder="🎉 Novidade: conheça nossa nova solução de PDV!" className="h-10" />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="URL do link (opcional)">
            <Input value={content['top_banner.url'] || ''} onChange={(e) => setContentKey('top_banner.url', e.target.value)}
              placeholder="/solucoes" className="h-10 text-sm" />
          </Field>
          <Field label="Texto do link">
            <Input value={content['top_banner.cta'] || ''} onChange={(e) => setContentKey('top_banner.cta', e.target.value)}
              placeholder="Saiba mais" className="h-10 text-sm" />
          </Field>
          <Field label="Cor de fundo">
            <div className="flex items-center gap-2">
              <input type="color" value={settings.top_banner_bg || '#f97316'}
                onChange={(e) => setSetting('top_banner_bg', e.target.value)}
                className="w-10 h-10 rounded-xl border cursor-pointer p-0.5" style={{ borderColor: 'rgba(0,0,0,.1)' }} />
              <Input value={settings.top_banner_bg || '#f97316'} onChange={(e) => setSetting('top_banner_bg', e.target.value)}
                className="h-10 font-mono text-sm flex-1" />
            </div>
          </Field>
          <Field label="Cor do texto">
            <div className="flex items-center gap-2">
              <input type="color" value={settings.top_banner_color || '#ffffff'}
                onChange={(e) => setSetting('top_banner_color', e.target.value)}
                className="w-10 h-10 rounded-xl border cursor-pointer p-0.5" style={{ borderColor: 'rgba(0,0,0,.1)' }} />
              <Input value={settings.top_banner_color || '#ffffff'} onChange={(e) => setSetting('top_banner_color', e.target.value)}
                className="h-10 font-mono text-sm flex-1" />
            </div>
          </Field>
        </div>
      </Section>

      <Section title="Cookie Consent" desc="Aviso de cookies exigido por LGPD">
        <ToggleRow
          label="Exibir aviso de cookies"
          desc="Banner de consentimento de cookies"
          checked={settings.cookie_consent !== '0'}
          onChange={(v) => setSetting('cookie_consent', v ? '1' : '0')}
        />
        <Field label="Texto do aviso de cookies">
          <textarea value={content['cookie.text'] || ''}
            onChange={(e) => setContentKey('cookie.text', e.target.value)}
            placeholder="Usamos cookies para melhorar sua experiência. Ao continuar navegando, você concorda com nossa Política de Privacidade."
            rows={2}
            className="w-full px-3 py-2.5 rounded-xl border text-sm resize-none"
            style={{ borderColor: 'rgba(0,0,0,.1)' }} />
        </Field>
        <Field label="Texto do botão de aceitar">
          <Input value={content['cookie.accept'] || ''} onChange={(e) => setContentKey('cookie.accept', e.target.value)}
            placeholder="Aceitar" className="h-10 text-sm" />
        </Field>
      </Section>

      <Section title="Popup de Anúncio" desc="Modal de destaque ao entrar no site">
        <ToggleRow
          label="Exibir popup ao entrar"
          desc="Aparece uma vez por sessão do usuário"
          checked={settings.announcement_popup === '1'}
          onChange={(v) => setSetting('announcement_popup', v ? '1' : '0')}
        />
        <Field label="Título do popup">
          <Input value={content['popup.title'] || ''} onChange={(e) => setContentKey('popup.title', e.target.value)}
            placeholder="Novidade importante!" className="h-10" />
        </Field>
        <Field label="Texto do popup">
          <textarea value={content['popup.text'] || ''}
            onChange={(e) => setContentKey('popup.text', e.target.value)}
            placeholder="Lançamos nossa nova solução..." rows={3}
            className="w-full px-3 py-2.5 rounded-xl border text-sm resize-none"
            style={{ borderColor: 'rgba(0,0,0,.1)' }} />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Texto do botão CTA">
            <Input value={content['popup.cta_text'] || ''} onChange={(e) => setContentKey('popup.cta_text', e.target.value)}
              placeholder="Saiba mais" className="h-10 text-sm" />
          </Field>
          <Field label="URL do botão CTA">
            <Input value={content['popup.cta_url'] || ''} onChange={(e) => setContentKey('popup.cta_url', e.target.value)}
              placeholder="/solucoes" className="h-10 text-sm" />
          </Field>
        </div>
      </Section>
    </div>
  );
}

// ─── TAB: Manutenção ──────────────────────────────────────────────────────────

function TabManutencao({ settings, setSetting }: { settings: Record<string, string>; setSetting: (k: string, v: string) => void }) {
  return (
    <div className="space-y-5">
      <Section title="Modo Manutenção" desc="Exibe uma página de manutenção para visitantes enquanto o site é atualizado">
        <ToggleRow
          label="Ativar modo manutenção"
          desc="O admin continua acessando normalmente. Visitantes veem a mensagem abaixo."
          checked={settings.maintenance_mode === '1'}
          onChange={(v) => setSetting('maintenance_mode', v ? '1' : '0')}
        />
        {settings.maintenance_mode === '1' && (
          <div className="flex items-center gap-3 p-3 rounded-xl text-sm"
            style={{ background: '#fef3c7', border: '1px solid #fcd34d' }}>
            <span className="text-base">⚠️</span>
            <p className="text-amber-700 font-medium">Site em manutenção — visitantes estão sendo redirecionados</p>
          </div>
        )}
        <Field label="Título da página de manutenção">
          <Input value={settings.maintenance_title || ''} onChange={(e) => setSetting('maintenance_title', e.target.value)}
            placeholder="Em manutenção" className="h-10" />
        </Field>
        <Field label="Mensagem para os visitantes">
          <textarea value={settings.maintenance_message || ''}
            onChange={(e) => setSetting('maintenance_message', e.target.value)}
            placeholder="Estamos atualizando o site. Voltamos em breve!" rows={3}
            className="w-full px-3 py-2.5 rounded-xl border text-sm resize-none"
            style={{ borderColor: 'rgba(0,0,0,.1)' }} />
        </Field>
        <Field label="Previsão de retorno (opcional)">
          <Input type="datetime-local" value={settings.maintenance_until || ''}
            onChange={(e) => setSetting('maintenance_until', e.target.value)}
            className="h-10 text-sm" />
        </Field>
      </Section>

      <Section title="Performance & Cache" desc="Otimizações de carregamento">
        <ToggleRow
          label="Lazy loading de imagens"
          desc="Carrega imagens apenas quando estão visíveis na tela"
          checked={settings.lazy_images !== '0'}
          onChange={(v) => setSetting('lazy_images', v ? '1' : '0')}
        />
        <ToggleRow
          label="Compressão de imagens automática"
          desc="Serve imagens em formato WebP quando suportado"
          checked={settings.webp_images === '1'}
          onChange={(v) => setSetting('webp_images', v ? '1' : '0')}
        />
      </Section>

      <Section title="Restrição de acesso" desc="Proteção extra para o painel administrativo">
        <Field label="IP's autorizados ao painel" hint="Um por linha. Deixe vazio para permitir qualquer IP.">
          <textarea value={settings.admin_allowed_ips || ''}
            onChange={(e) => setSetting('admin_allowed_ips', e.target.value)}
            placeholder={"192.168.0.1\n10.0.0.2"} rows={4}
            className="w-full px-3 py-2.5 rounded-xl border text-sm font-mono resize-none"
            style={{ borderColor: 'rgba(0,0,0,.1)' }} />
        </Field>
        <ToggleRow
          label="Log de acessos ao painel"
          desc="Registra logins e ações administrativas"
          checked={settings.admin_audit_log === '1'}
          onChange={(v) => setSetting('admin_audit_log', v ? '1' : '0')}
        />
      </Section>
    </div>
  );
}

// ─── TAB: Perfil ──────────────────────────────────────────────────────────────

function TabPerfil({ profile, setProfile, savingProfile, saveProfile }: {
  profile: { name: string; email: string };
  setProfile: React.Dispatch<React.SetStateAction<{ name: string; email: string }>>;
  savingProfile: boolean;
  saveProfile: () => void;
}) {
  const pc = '#f97316';
  return (
    <div className="space-y-5">
      <Section title="Informações do Perfil" desc="Nome e e-mail usados para acessar o painel">
        <Field label="Nome">
          <Input value={profile.name} onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
            placeholder="Seu nome" className="h-10" />
        </Field>
        <Field label="E-mail">
          <Input value={profile.email} onChange={(e) => setProfile(p => ({ ...p, email: e.target.value }))}
            placeholder="seu@email.com" type="email" className="h-10" />
        </Field>
        <Button onClick={saveProfile} disabled={savingProfile}
          className="flex items-center gap-2 font-bold rounded-xl" style={{ background: pc, color: '#fff' }}>
          {savingProfile
            ? <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Salvando...</span>
            : <span className="flex items-center gap-2"><Save className="w-4 h-4" /> Salvar perfil</span>}
        </Button>
      </Section>
    </div>
  );
}

// ─── TAB: Segurança ───────────────────────────────────────────────────────────

function TabSeguranca({ pw, setPw, showPw, setShowPw, savingPw, savePassword }: {
  pw: { current: string; newPw: string; confirm: string };
  setPw: React.Dispatch<React.SetStateAction<{ current: string; newPw: string; confirm: string }>>;
  showPw: boolean;
  setShowPw: React.Dispatch<React.SetStateAction<boolean>>;
  savingPw: boolean;
  savePassword: () => void;
}) {
  const pc = '#f97316';
  return (
    <div className="space-y-5">
      <Section title="Alterar Senha" desc="Mínimo de 6 caracteres">
        <Field label="Senha atual">
          <div className="relative">
            <Input type={showPw ? 'text' : 'password'} value={pw.current}
              onChange={(e) => setPw(p => ({ ...p, current: e.target.value }))}
              placeholder="••••••••" className="h-10 pr-10" />
            <button onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98989d] hover:text-[#1d1d1f]">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </Field>
        <Field label="Nova senha">
          <Input type={showPw ? 'text' : 'password'} value={pw.newPw}
            onChange={(e) => setPw(p => ({ ...p, newPw: e.target.value }))}
            placeholder="••••••••" className="h-10" />
        </Field>
        <Field label="Confirmar nova senha">
          <Input type={showPw ? 'text' : 'password'} value={pw.confirm}
            onChange={(e) => setPw(p => ({ ...p, confirm: e.target.value }))}
            placeholder="••••••••" className="h-10" />
          {pw.confirm && pw.newPw !== pw.confirm && (
            <p className="text-xs text-red-500 mt-1">As senhas não coincidem</p>
          )}
        </Field>
        <Button onClick={savePassword}
          disabled={savingPw || !pw.current || !pw.newPw || pw.newPw !== pw.confirm}
          className="flex items-center gap-2 font-bold rounded-xl" style={{ background: pc, color: '#fff' }}>
          {savingPw
            ? <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Alterando...</span>
            : <span className="flex items-center gap-2"><Lock className="w-4 h-4" /> Alterar senha</span>}
        </Button>
      </Section>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export function Settings() {
  const { user, logout } = useAuth();
  const { data, updateSettings, updateContent } = useData();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('aparencia');
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [content, setContent] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [pw, setPw] = useState({ current: '', newPw: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    if (data.settings) setSettings({ ...data.settings });
    if (data.content) setContent({ ...data.content });
  }, [data.settings, data.content]);

  const setSetting = (k: string, v: string) => setSettings(p => ({ ...p, [k]: v }));
  const setContentKey = (k: string, v: string) => setContent(p => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      await Promise.all([updateSettings(settings), updateContent(content)]);
      toast({ title: '✅ Configurações salvas!' });
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(profile),
      });
      const d = await res.json();
      if (!res.ok) { toast({ title: d.error || 'Erro', variant: 'destructive' }); return; }
      if (d.token) localStorage.setItem('token', d.token);
      toast({ title: '✅ Perfil atualizado!' });
    } catch { toast({ title: 'Erro ao salvar', variant: 'destructive' }); }
    finally { setSavingProfile(false); }
  };

  const savePassword = async () => {
    if (pw.newPw !== pw.confirm) { toast({ title: 'Senhas não coincidem', variant: 'destructive' }); return; }
    if (pw.newPw.length < 6) { toast({ title: 'Senha deve ter ao menos 6 caracteres', variant: 'destructive' }); return; }
    setSavingPw(true);
    try {
      const res = await fetch(`${API_URL}/auth/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ current: pw.current, newPassword: pw.newPw }),
      });
      const d = await res.json();
      if (!res.ok) { toast({ title: d.error || 'Erro', variant: 'destructive' }); return; }
      toast({ title: '✅ Senha alterada com sucesso!' });
      setPw({ current: '', newPw: '', confirm: '' });
    } catch { toast({ title: 'Erro ao alterar senha', variant: 'destructive' }); }
    finally { setSavingPw(false); }
  };

  const pc = settings.primary_color || '#f97316';
  const showSaveBtn = !['perfil', 'seguranca'].includes(activeTab);

  return (
    <div className="min-h-full bg-[#fafafa]">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex items-center justify-between"
        style={{ borderColor: 'rgba(0,0,0,.07)' }}>
        <div>
          <h1 className="font-bold text-[#1d1d1f] text-xl" style={{ fontFamily: "'Outfit',sans-serif" }}>Configurações</h1>
          <p className="text-xs text-[#98989d] mt-0.5">Aparência, contato, integrações, scripts e sua conta</p>
        </div>
        {showSaveBtn && (
          <Button onClick={save} disabled={saving}
            className="flex items-center gap-2 font-bold rounded-xl px-5 bg-orange-600 hover:bg-orange-700 text-white">
            {saving
              ? <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Salvando...</span>
              : <span className="flex items-center gap-2"><Save className="w-4 h-4" /> Salvar tudo</span>}
          </Button>
        )}
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-52 flex-shrink-0 border-r bg-white sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto p-3"
          style={{ borderColor: 'rgba(0,0,0,.07)' }}>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5 text-left ${activeTab === tab.id ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
                style={{ color: activeTab === tab.id ? pc : '#6e6e73' }}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 p-6 max-w-3xl">
          {activeTab === 'aparencia' && <TabAparencia settings={settings} setSetting={setSetting} />}
          {activeTab === 'empresa' && <TabEmpresa settings={settings} setSetting={setSetting} content={content} setContentKey={setContentKey} />}
          {activeTab === 'contato' && <TabContato settings={settings} setSetting={setSetting} content={content} setContentKey={setContentKey} />}
          {activeTab === 'rodape' && <TabRodape settings={settings} setSetting={setSetting} content={content} setContentKey={setContentKey} />}
          {activeTab === 'redes' && <TabRedes settings={settings} setSetting={setSetting} />}
          {activeTab === 'seo' && <TabSEO settings={settings} setSetting={setSetting} />}
          {activeTab === 'integracoes' && <TabIntegracoes settings={settings} setSetting={setSetting} />}
          {activeTab === 'scripts' && <TabScripts settings={settings} setSetting={setSetting} />}
          {activeTab === 'notificacoes' && <TabNotificacoes settings={settings} setSetting={setSetting} content={content} setContentKey={setContentKey} />}
          {activeTab === 'manutencao' && <TabManutencao settings={settings} setSetting={setSetting} />}
          {activeTab === 'perfil' && <TabPerfil profile={profile} setProfile={setProfile} savingProfile={savingProfile} saveProfile={saveProfile} />}
          {activeTab === 'seguranca' && <TabSeguranca pw={pw} setPw={setPw} showPw={showPw} setShowPw={setShowPw} savingPw={savingPw} savePassword={savePassword} />}
        </div>
      </div>
    </div>
  );
}