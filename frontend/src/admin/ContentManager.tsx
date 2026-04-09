import { useState } from 'react';
import type React from 'react';

import { Save, RotateCcw, Search, ChevronRight, Eye } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { ImageUploadField } from '@/components/ImageUploadField';
import type { ImgSpec } from '@/components/ImageUploadField';
import { useToast } from '@/hooks/use-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const BASE_URL = API_URL.replace('/api', '');

// ── Tipos ─────────────────────────────────────────────────────────────────────

type FieldType = 'text' | 'textarea' | 'image' | 'toggle' | 'color';

interface FieldDef {
  key: string;
  label: string;
  hint?: string;
  type?: FieldType;
  placeholder?: string;
  spec?: ImgSpec;
  rows?: number;
}

interface SectionDef {
  id: string;
  label: string;
  icon: string;
  fields: FieldDef[];
}

// ── Definição das seções ──────────────────────────────────────────────────────

const SECTIONS: SectionDef[] = [
  {
    id: 'header', label: 'Cabeçalho', icon: '🔝',
    fields: [
      { key: 'header.company', label: 'Nome da Empresa' },
      { key: 'header.logo', label: 'Logo principal', type: 'image', hint: 'Deixe vazio para usar o nome da empresa', spec: { dimensions: '400 × 120 px', formats: 'PNG, SVG, WEBP', maxSize: '1 MB', where: 'Header do site', objectFit: 'contain', tip: 'PNG com fundo transparente.' } },
      { key: 'header.logo_white', label: 'Logo versão clara', type: 'image', hint: 'Para fundos escuros (rodapé)', spec: { dimensions: 'Mesma proporção do logo', formats: 'PNG, SVG, WEBP', maxSize: '1 MB', where: 'Rodapé escuro', objectFit: 'contain' } },
      { key: 'header.nav.solutions', label: 'Menu: Soluções', placeholder: 'Soluções' },
      { key: 'header.nav.institutional', label: 'Menu: Institucional', placeholder: 'Institucional' },
      { key: 'header.nav.support', label: 'Menu: Suporte', placeholder: 'Suporte' },
      { key: 'header.nav.contact', label: 'Menu: Fale Conosco', placeholder: 'Fale Conosco' },
    ],
  },
  {
    id: 'hero', label: 'Banner Principal', icon: '🖼️',
    fields: [
      { key: 'hero.badge', label: 'Badge / Pílula acima do título', placeholder: 'Tecnologia para o varejo' },
      { key: 'hero.title', label: 'Título principal', type: 'textarea', rows: 2 },
      { key: 'hero.subtitle', label: 'Subtítulo (linha em destaque)', placeholder: 'resultados' },
      { key: 'hero.description', label: 'Descrição', type: 'textarea', rows: 2 },
      { key: 'hero.cta_primary', label: 'Botão primário (CTA)', placeholder: 'Conhecer Soluções' },
      { key: 'hero.cta_secondary', label: 'Botão secundário', placeholder: 'Fale com um especialista' },
      { key: 'hero.image', label: 'Imagem do banner', type: 'image', hint: 'Substitui os quadros de estatísticas quando preenchido', spec: { dimensions: '800 × 600 px', formats: 'PNG, WEBP', maxSize: '2 MB', where: 'Lado direito do hero', objectFit: 'contain' } },
    ],
  },
  {
    id: 'solutions', label: 'Soluções', icon: '💡',
    fields: [
      { key: 'solutions.title', label: 'Título da seção' },
      { key: 'solutions.subtitle', label: 'Subtítulo (palavra em destaque)' },
    ],
  },
  {
    id: 'segments', label: 'Segmentos', icon: '🏪',
    fields: [
      { key: 'segments.title', label: 'Título da seção' },
      { key: 'segments.subtitle', label: 'Subtítulo (palavra em destaque)' },
      { key: 'segments.description', label: 'Descrição abaixo do título', type: 'textarea', rows: 2 },
      { key: 'segments.viewAll', label: 'Texto do botão "Ver todos"', placeholder: 'Ver Todos os Segmentos' },
      { key: 'segmentos_page.badge', label: 'Página /segmentos — Badge', placeholder: 'Mercados que atendemos' },
      { key: 'segmentos_page.title_line1', label: 'Página /segmentos — Título linha 1' },
      { key: 'segmentos_page.title_line2', label: 'Página /segmentos — Título linha 2 (destaque)' },
      { key: 'segmentos_page.description', label: 'Página /segmentos — Descrição', type: 'textarea', rows: 2 },
    ],
  },
  {
    id: 'stats', label: 'Estatísticas', icon: '📊',
    fields: [
      { key: 'stats.title', label: 'Título da seção' },
      { key: 'stats.subtitle', label: 'Subtítulo' },
      { key: 'stats.description', label: 'Descrição', type: 'textarea', rows: 2 },
    ],
  },
  {
    id: 'differentials', label: 'Diferenciais', icon: '⭐',
    fields: [
      { key: 'differentials.title', label: 'Título da seção' },
      { key: 'differentials.subtitle', label: 'Subtítulo (destaque)' },
      { key: 'differentials.description', label: 'Descrição', type: 'textarea', rows: 2 },
      { key: 'differentials.item1_title', label: 'Item 1 — Título' },
      { key: 'differentials.item1_desc', label: 'Item 1 — Descrição', type: 'textarea', rows: 2 },
      { key: 'differentials.item2_title', label: 'Item 2 — Título' },
      { key: 'differentials.item2_desc', label: 'Item 2 — Descrição', type: 'textarea', rows: 2 },
      { key: 'differentials.item3_title', label: 'Item 3 — Título' },
      { key: 'differentials.item3_desc', label: 'Item 3 — Descrição', type: 'textarea', rows: 2 },
      { key: 'differentials.item4_title', label: 'Item 4 — Título' },
      { key: 'differentials.item4_desc', label: 'Item 4 — Descrição', type: 'textarea', rows: 2 },
    ],
  },
  {
    id: 'contact', label: 'Contato', icon: '📞',
    fields: [
      { key: 'contact.title', label: 'Título da seção' },
      { key: 'contact.subtitle', label: 'Subtítulo' },
      { key: 'contact.description', label: 'Descrição', type: 'textarea', rows: 2 },
      { key: 'contact.phone', label: 'Telefone principal', placeholder: '(11) 4003-0000' },
      { key: 'contact.phone2', label: 'Telefone secundário', placeholder: '(11) 4003-0001' },
      { key: 'contact.whatsapp', label: 'WhatsApp (só números)', placeholder: '5511999999999' },
      { key: 'contact.email', label: 'E-mail principal', placeholder: 'contato@empresa.com.br' },
      { key: 'contact.email_support', label: 'E-mail de suporte', placeholder: 'suporte@empresa.com.br' },
      { key: 'contact.address', label: 'Endereço — linha 1' },
      { key: 'contact.address2', label: 'Endereço — linha 2 (cidade, CEP)' },
      { key: 'contact.hours', label: 'Horário de atendimento', placeholder: 'Seg–Sex, 8h às 18h' },
      { key: 'contact.form.title', label: 'Formulário — Título' },
      { key: 'contact.form.submit', label: 'Formulário — Texto do botão enviar' },
    ],
  },
  {
    id: 'footer', label: 'Rodapé', icon: '🔻',
    fields: [
      { key: 'footer.description', label: 'Descrição abaixo do logo', type: 'textarea', rows: 3 },
      { key: 'footer.copyright', label: 'Texto de copyright', placeholder: `© ${new Date().getFullYear()} Empresa. Todos os direitos reservados.` },
      { key: 'footer.extra', label: 'Texto extra (abaixo do copyright)', type: 'textarea', rows: 2 },
    ],
  },
  {
    id: 'social_proof', label: 'Prova Social', icon: '🤝',
    fields: [
      { key: 'clients.title', label: 'Faixa de Features — Texto acima (pílula)' },
      { key: 'testimonials.label', label: 'Depoimentos — Badge/pílula', placeholder: 'Depoimentos' },
      { key: 'testimonials.title', label: 'Depoimentos — Título linha 1' },
      { key: 'testimonials.subtitle', label: 'Depoimentos — Linha 2 (destaque)' },
      { key: 'partners.label', label: 'Parceiros — Badge/pílula', placeholder: 'Integrações & Parceiros' },
      { key: 'partners.title', label: 'Parceiros — Título' },
      { key: 'partners.description', label: 'Parceiros — Descrição', type: 'textarea', rows: 2 },
    ],
  },
  {
    id: 'quicklinks', label: 'Links Rápidos', icon: '⚡',
    fields: [
      { key: 'quicklinks.title', label: 'Título da seção' },
      { key: 'quicklinks.subtitle', label: 'Subtítulo' },
      { key: 'quicklinks.0.title', label: 'Link 1 — Título' },
      { key: 'quicklinks.0.subtitle', label: 'Link 1 — Subtítulo' },
      { key: 'quicklinks.0.href', label: 'Link 1 — URL', placeholder: '/solucoes' },
      { key: 'quicklinks.1.title', label: 'Link 2 — Título' },
      { key: 'quicklinks.1.subtitle', label: 'Link 2 — Subtítulo' },
      { key: 'quicklinks.1.href', label: 'Link 2 — URL' },
      { key: 'quicklinks.2.title', label: 'Link 3 — Título' },
      { key: 'quicklinks.2.subtitle', label: 'Link 3 — Subtítulo' },
      { key: 'quicklinks.2.href', label: 'Link 3 — URL' },
      { key: 'quicklinks.3.title', label: 'Link 4 — Título' },
      { key: 'quicklinks.3.subtitle', label: 'Link 4 — Subtítulo' },
      { key: 'quicklinks.3.href', label: 'Link 4 — URL' },
    ],
  },
  {
    id: 'sobre', label: 'Sobre Nós', icon: '🏢',
    fields: [
      { key: 'sobre.title', label: 'Título da página' },
      { key: 'sobre.subtitle', label: 'Subtítulo' },
      { key: 'sobre.historia_title', label: 'Nossa História — Título' },
      { key: 'sobre.historia_text', label: 'Nossa História — Texto', type: 'textarea', rows: 5 },
      { key: 'sobre.missao', label: 'Missão', type: 'textarea', rows: 3 },
      { key: 'sobre.visao', label: 'Visão', type: 'textarea', rows: 3 },
      { key: 'sobre.valores', label: 'Valores', type: 'textarea', rows: 3 },
    ],
  },
  {
    id: 'notifications', label: 'Notificações', icon: '🔔',
    fields: [
      { key: 'top_banner.text', label: 'Banner do topo — Texto', placeholder: '🎉 Novidade: conheça nossa nova solução!' },
      { key: 'top_banner.url', label: 'Banner do topo — URL do link', placeholder: '/solucoes' },
      { key: 'top_banner.cta', label: 'Banner do topo — Texto do link', placeholder: 'Saiba mais' },
      { key: 'popup.title', label: 'Popup — Título' },
      { key: 'popup.text', label: 'Popup — Texto', type: 'textarea', rows: 3 },
      { key: 'popup.cta_text', label: 'Popup — Texto do botão CTA' },
      { key: 'popup.cta_url', label: 'Popup — URL do botão CTA' },
      { key: 'cookie.text', label: 'Cookie — Texto do aviso', type: 'textarea', rows: 2 },
      { key: 'cookie.accept', label: 'Cookie — Texto do botão aceitar', placeholder: 'Aceitar' },
    ],
  },
];

// ── Helpers UI ────────────────────────────────────────────────────────────────

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

// ── Componente principal ──────────────────────────────────────────────────────

export function ContentManager() {
  const { data, updateContent, uploadImage } = useData();
  const { toast } = useToast();

  const [edited, setEdited] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState('header');

  const getValue = (key: string) =>
    edited[key] !== undefined ? edited[key] : (data.content?.[key] || '');

  const set = (key: string, val: string) =>
    setEdited(p => ({ ...p, [key]: val }));

  const handleUpload = async (key: string, file: File) => {
    setUploading(key);
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
      set(key, url);
      toast({ title: '✅ Imagem enviada!' });
    } catch {
      toast({ title: 'Erro no upload', variant: 'destructive' });
    } finally { setUploading(null); }
  };

  const save = async () => {
    if (!Object.keys(edited).length) return;
    setSaving(true);
    try {
      await updateContent(edited);
      setEdited({});
      toast({ title: '✅ Conteúdo salvo!' });
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const discard = () => { setEdited({}); toast({ title: 'Alterações descartadas.' }); };

  const changedCount = Object.keys(edited).length;

  // Filtra por busca — mostra seções que tenham campos correspondentes
  const visibleSections = search.trim()
    ? SECTIONS.map(s => ({
      ...s,
      fields: s.fields.filter(f =>
        f.label.toLowerCase().includes(search.toLowerCase()) ||
        f.key.toLowerCase().includes(search.toLowerCase())
      ),
    })).filter(s => s.fields.length > 0)
    : SECTIONS;

  const activeSection = visibleSections.find(s => s.id === activeId) || visibleSections[0];

  return (
    <div className="min-h-full bg-[#fafafa]">

      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex items-center gap-4"
        style={{ borderColor: 'rgba(0,0,0,.07)' }}>
        <div className="flex-1">
          <h1 className="font-bold text-[#1d1d1f] text-xl" style={{ fontFamily: "'Outfit',sans-serif" }}>
            Gerenciar Conteúdo
          </h1>
          <p className="text-xs text-[#98989d] mt-0.5">Edite os textos e imagens do site</p>
        </div>

        {/* Busca */}
        <div className="relative w-56">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#98989d]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar campo..."
            className="w-full h-9 pl-8 pr-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-orange-300"
            style={{ borderColor: 'rgba(0,0,0,.12)' }} />
        </div>

        {changedCount > 0 && (
          <span className="text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full">
            {changedCount} alteração{changedCount > 1 ? 'ões' : ''}
          </span>
        )}

        <Button variant="outline" onClick={discard} disabled={!changedCount}
          className="rounded-xl text-sm">
          <RotateCcw size={13} className="mr-1.5" /> Descartar
        </Button>
        <Button onClick={save} disabled={!changedCount || saving}
          className="rounded-xl text-sm bg-orange-600 hover:bg-orange-700 text-white font-bold">
          <Save size={13} className="mr-1.5" />
          {saving ? 'Salvando...' : 'Salvar tudo'}
        </Button>
      </div>

      <div className="flex">

        {/* ── Sidebar de navegação ── */}
        <div className="w-52 flex-shrink-0 border-r bg-white sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto p-3"
          style={{ borderColor: 'rgba(0,0,0,.07)' }}>
          {(search.trim() ? visibleSections : SECTIONS).map(sec => {
            const hasChanges = sec.fields.some(f => edited[f.key] !== undefined);
            return (
              <button key={sec.id} onClick={() => { setActiveId(sec.id); setSearch(''); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5 text-left group"
                style={{
                  background: activeId === sec.id ? 'rgba(249,115,22,.08)' : 'transparent',
                  color: activeId === sec.id ? '#f97316' : '#6e6e73',
                }}>
                <span className="text-base leading-none">{sec.icon}</span>
                <span className="flex-1 truncate">{sec.label}</span>
                {hasChanges && (
                  <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* ── Conteúdo da seção ── */}
        <div className="flex-1 p-6 max-w-3xl">
          {search.trim() ? (
            // Modo busca — mostra todos os campos encontrados
            <div className="space-y-6">
              {visibleSections.map(sec => (
                <div key={sec.id} className="bg-white rounded-2xl border overflow-hidden"
                  style={{ borderColor: 'rgba(0,0,0,.07)' }}>
                  <div className="px-5 py-3.5 border-b flex items-center gap-2"
                    style={{ borderColor: 'rgba(0,0,0,.06)', background: 'rgba(0,0,0,.01)' }}>
                    <span>{sec.icon}</span>
                    <p className="font-bold text-sm text-[#1d1d1f]">{sec.label}</p>
                  </div>
                  <div className="p-5 space-y-5">
                    {sec.fields.map(f => <FieldRenderer key={f.key} f={f} getValue={getValue} set={set} handleUpload={handleUpload} uploading={uploading} edited={edited} />)}
                  </div>
                </div>
              ))}
            </div>
          ) : activeSection ? (
            // Modo normal — seção selecionada
            <div className="bg-white rounded-2xl border overflow-hidden"
              style={{ borderColor: 'rgba(0,0,0,.07)' }}>
              <div className="px-5 py-4 border-b flex items-center justify-between"
                style={{ borderColor: 'rgba(0,0,0,.06)', background: 'rgba(0,0,0,.01)' }}>
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{activeSection.icon}</span>
                  <div>
                    <p className="font-bold text-sm text-[#1d1d1f]">{activeSection.label}</p>
                    <p className="text-[11px] text-[#98989d]">{activeSection.fields.length} campos</p>
                  </div>
                </div>
                <a href={getSectionPreviewUrl(activeSection.id)} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs text-[#98989d] hover:text-[#1d1d1f] px-3 py-1.5 rounded-lg hover:bg-gray-100 transition">
                  <Eye size={12} /> Ver no site
                </a>
              </div>
              <div className="p-5 space-y-6">
                {activeSection.fields.map(f => (
                  <FieldRenderer key={f.key} f={f} getValue={getValue} set={set} handleUpload={handleUpload} uploading={uploading} edited={edited} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-[#98989d]">Nenhum resultado encontrado</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Renderizador de campo ─────────────────────────────────────────────────────

function FieldRenderer({ f, getValue, set, handleUpload, uploading, edited }: {
  f: FieldDef;
  getValue: (k: string) => string;
  set: (k: string, v: string) => void;
  handleUpload: (k: string, file: File) => void;
  uploading: string | null;
  edited: Record<string, string>;
}) {
  const val = getValue(f.key);
  const changed = edited[f.key] !== undefined;
  const inputStyle = { borderColor: changed ? '#f97316' : 'rgba(0,0,0,.1)', background: changed ? 'rgba(249,115,22,.03)' : undefined };

  if (f.type === 'image') {
    return (
      <div className="space-y-1.5">
        <div>
          <label className="text-xs font-semibold text-[#1d1d1f]">{f.label}</label>
          {f.hint && <p className="text-[11px] text-[#98989d] mt-0.5">{f.hint}</p>}
        </div>
        <ImageUploadField
          value={val}
          onChange={url => set(f.key, url)}
          onUpload={async (file) => { await handleUpload(f.key, file); }}
          uploading={uploading === f.key}
          spec={f.spec || { dimensions: 'Qualquer', formats: 'JPG, PNG, WEBP', maxSize: '2 MB', where: 'Site' }}
          height={120}
        />
      </div>
    );
  }

  if (f.type === 'toggle') {
    return (
      <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#f5f5f7' }}>
        <div>
          <p className="text-sm font-semibold text-[#1d1d1f]">{f.label}</p>
          {f.hint && <p className="text-[11px] text-[#98989d]">{f.hint}</p>}
        </div>
        <Switch checked={val === '1'} onCheckedChange={v => set(f.key, v ? '1' : '0')} />
      </div>
    );
  }

  if (f.type === 'textarea') {
    return (
      <div className="space-y-1.5">
        <div>
          <label className="text-xs font-semibold text-[#1d1d1f]">{f.label}</label>
          {f.hint && <p className="text-[11px] text-[#98989d] mt-0.5">{f.hint}</p>}
        </div>
        <textarea
          value={val}
          onChange={e => set(f.key, e.target.value)}
          rows={f.rows || 3}
          placeholder={f.placeholder}
          className="w-full px-3 py-2.5 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-300 transition"
          style={{ ...inputStyle, lineHeight: 1.7, fontFamily: 'inherit' }}
        />
      </div>
    );
  }

  // text (default)
  return (
    <div className="space-y-1.5">
      <div>
        <label className="text-xs font-semibold text-[#1d1d1f]">{f.label}</label>
        {f.hint && <p className="text-[11px] text-[#98989d] mt-0.5">{f.hint}</p>}
      </div>
      <input
        value={val}
        onChange={e => set(f.key, e.target.value)}
        placeholder={f.placeholder || ''}
        className="w-full h-10 px-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 transition"
        style={inputStyle}
      />
    </div>
  );
}

function getSectionPreviewUrl(id: string): string {
  const map: Record<string, string> = {
    header: '/', hero: '/', solutions: '/#solucoes', segments: '/#segmentos',
    stats: '/', differentials: '/', contact: '/#contato', footer: '/',
    social_proof: '/', quicklinks: '/', sobre: '/sobre',
    notifications: '/', segmentos_page: '/segmentos',
  };
  return map[id] || '/';
}