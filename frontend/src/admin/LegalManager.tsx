import { useState, useEffect, useRef } from 'react';
import type React from 'react';

import { Save, RefreshCw, FileText, Shield, Eye, EyeOff, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface LegalSection {
  id: string;
  title: string;
  content: string;
  visible: boolean;
}

interface LegalDoc {
  title: string;
  subtitle: string;
  updated_at: string;
  intro: string;
  sections: LegalSection[];
}

const emptyDoc = (): LegalDoc => ({
  title: '',
  subtitle: '',
  updated_at: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
  intro: '',
  sections: [],
});

const emptySection = (): LegalSection => ({
  id: crypto.randomUUID(),
  title: '',
  content: '',
  visible: true,
});

// ── Helpers UI ────────────────────────────────────────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: 'rgba(0,0,0,.07)' }}>
      {children}
    </div>
  );
}

function CardHead({ icon: Icon, title, subtitle, color = '#f97316' }: {
  icon: React.ElementType; title: string; subtitle?: string; color?: string;
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'rgba(0,0,0,.06)', background: 'rgba(0,0,0,.01)' }}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div>
        <p className="font-bold text-sm text-[#1d1d1f]">{title}</p>
        {subtitle && <p className="text-xs text-[#98989d]">{subtitle}</p>}
      </div>
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

// ── Editor de documento ───────────────────────────────────────────────────────

function DocEditor({ doc, onChange }: { doc: LegalDoc; onChange: (d: LegalDoc) => void }) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const set = (field: keyof LegalDoc, value: any) => onChange({ ...doc, [field]: value });

  const addSection = () => {
    const s = emptySection();
    onChange({ ...doc, sections: [...doc.sections, s] });
    setOpenSections(p => ({ ...p, [s.id]: true }));
  };

  const removeSection = (id: string) => {
    onChange({ ...doc, sections: doc.sections.filter(s => s.id !== id) });
  };

  const updateSection = (id: string, field: keyof LegalSection, value: any) => {
    onChange({
      ...doc,
      sections: doc.sections.map(s => s.id === id ? { ...s, [field]: value } : s),
    });
  };

  const moveSection = (i: number, dir: -1 | 1) => {
    const arr = [...doc.sections];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    onChange({ ...doc, sections: arr });
  };

  const toggleSection = (id: string) => setOpenSections(p => ({ ...p, [id]: !p[id] }));

  return (
    <div className="space-y-4">
      {/* Meta */}
      <Card>
        <div className="p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Título da página">
              <Input value={doc.title} onChange={e => set('title', e.target.value)}
                placeholder="Ex: Termos de Uso" className="h-10" />
            </Field>
            <Field label="Data da última atualização">
              <Input value={doc.updated_at} onChange={e => set('updated_at', e.target.value)}
                placeholder="15 de janeiro de 2025" className="h-10 text-sm" />
            </Field>
          </div>
          <Field label="Subtítulo / descrição curta" hint="Aparece abaixo do título no hero">
            <Input value={doc.subtitle} onChange={e => set('subtitle', e.target.value)}
              placeholder="Ex: Condições e regras para utilização dos nossos serviços." className="h-10 text-sm" />
          </Field>
          <Field label="Introdução" hint="Parágrafo de abertura exibido antes das seções">
            <textarea value={doc.intro} onChange={e => set('intro', e.target.value)}
              placeholder="Ao acessar e utilizar os serviços da [Empresa], você concorda com..."
              rows={4}
              className="w-full px-3 py-2.5 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
              style={{ borderColor: 'rgba(0,0,0,.1)', lineHeight: 1.7 }} />
          </Field>
        </div>
      </Card>

      {/* Seções */}
      <div className="space-y-2">
        {doc.sections.map((section, i) => (
          <Card key={section.id}>
            {/* Cabeçalho da seção */}
            <div className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
              style={{ background: 'rgba(0,0,0,.015)' }}
              onClick={() => toggleSection(section.id)}>
              <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ background: section.visible ? '#f97316' : '#c0c0c0' }}>
                {i + 1}
              </div>
              <span className="flex-1 text-sm font-semibold text-[#1d1d1f] truncate">
                {section.title || <span className="text-[#98989d] font-normal">Seção sem título</span>}
              </span>
              <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                <button onClick={() => moveSection(i, -1)} disabled={i === 0}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#98989d] hover:bg-gray-100 disabled:opacity-30 transition">
                  <ChevronUp size={14} />
                </button>
                <button onClick={() => moveSection(i, 1)} disabled={i === doc.sections.length - 1}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#98989d] hover:bg-gray-100 disabled:opacity-30 transition">
                  <ChevronDown size={14} />
                </button>
                <div className="flex items-center gap-1.5 px-2">
                  <Switch
                    checked={section.visible}
                    onCheckedChange={v => updateSection(section.id, 'visible', v)}
                  />
                  <span className="text-xs text-[#98989d]">{section.visible ? 'Visível' : 'Oculta'}</span>
                </div>
                <button onClick={() => removeSection(section.id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[#98989d] hover:text-red-500 hover:bg-red-50 transition">
                  <Trash2 size={13} />
                </button>
              </div>
              <div className="text-[#98989d]">
                {openSections[section.id] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
            </div>

            {/* Conteúdo da seção */}
            {openSections[section.id] && (
              <div className="p-5 space-y-4 border-t" style={{ borderColor: 'rgba(0,0,0,.06)' }}>
                <Field label="Título da seção">
                  <Input value={section.title} onChange={e => updateSection(section.id, 'title', e.target.value)}
                    placeholder="Ex: 1. Aceitação dos Termos" className="h-10" />
                </Field>
                <Field label="Conteúdo" hint="Use quebras de linha para separar parágrafos. Suporta markdown básico: **negrito**, *itálico*, - lista">
                  <textarea
                    value={section.content}
                    onChange={e => updateSection(section.id, 'content', e.target.value)}
                    placeholder={"Ao acessar ou usar qualquer serviço...\n\n- Item 1\n- Item 2\n\nOutro parágrafo..."}
                    rows={10}
                    className="w-full px-3 py-2.5 rounded-xl border text-sm resize-y focus:outline-none focus:ring-2 focus:ring-orange-300"
                    style={{ borderColor: 'rgba(0,0,0,.1)', lineHeight: 1.8, fontFamily: 'inherit' }}
                  />
                </Field>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Adicionar seção */}
      <button onClick={addSection}
        className="w-full h-11 rounded-xl border-2 border-dashed text-sm font-medium transition-all flex items-center justify-center gap-2"
        style={{ borderColor: 'rgba(0,0,0,.12)', color: '#98989d' }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.borderColor = '#f97316';
          (e.currentTarget as HTMLElement).style.color = '#f97316';
          (e.currentTarget as HTMLElement).style.background = 'rgba(249,115,22,.04)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,.12)';
          (e.currentTarget as HTMLElement).style.color = '#98989d';
          (e.currentTarget as HTMLElement).style.background = 'transparent';
        }}>
        <Plus size={15} /> Adicionar seção
      </button>
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────────────────────────

export function LegalManager() {
  const { data, updateContent } = useData();
  const { toast } = useToast();

  const [activeDoc, setActiveDoc] = useState<'termos' | 'privacidade'>('termos');
  const [termos, setTermos]         = useState<LegalDoc>(emptyDoc());
  const [privacidade, setPrivacidade] = useState<LegalDoc>(emptyDoc());
  const [saving, setSaving]         = useState(false);
  const [preview, setPreview]       = useState(false);

  // Carrega do DataContext
  useEffect(() => {
    const ct = data.content || {};
    try { if (ct['termos.data'])      setTermos(JSON.parse(ct['termos.data'])); }      catch {}
    try { if (ct['privacidade.data']) setPrivacidade(JSON.parse(ct['privacidade.data'])); } catch {}
  }, [data.content]);

  const currentDoc = activeDoc === 'termos' ? termos : privacidade;
  const setCurrentDoc = activeDoc === 'termos' ? setTermos : setPrivacidade;

  const save = async () => {
    setSaving(true);
    try {
      await updateContent({
        'termos.data':      JSON.stringify(termos),
        'privacidade.data': JSON.stringify(privacidade),
      });
      toast({ title: '✅ Documentos legais salvos!' });
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const DOCS = [
    { id: 'termos',      label: 'Termos de Uso',          icon: FileText, color: '#3b82f6' },
    { id: 'privacidade', label: 'Política de Privacidade', icon: Shield,   color: '#10b981' },
  ] as const;

  return (
    <div className="min-h-full bg-[#fafafa]">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 flex items-center justify-between"
        style={{ borderColor: 'rgba(0,0,0,.07)' }}>
        <div>
          <h1 className="font-bold text-[#1d1d1f] text-xl" style={{ fontFamily: "'Outfit',sans-serif" }}>
            Documentos Legais
          </h1>
          <p className="text-xs text-[#98989d] mt-0.5">Termos de Uso e Política de Privacidade editáveis</p>
        </div>
        <div className="flex items-center gap-3">
          <a href={`/${activeDoc === 'termos' ? 'termos' : 'privacidade'}`} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 text-sm text-[#6e6e73] hover:text-[#1d1d1f] px-3 py-2 rounded-xl hover:bg-gray-100 transition">
            <Eye size={14} /> Ver página
          </a>
          <Button onClick={save} disabled={saving}
            className="flex items-center gap-2 font-bold rounded-xl px-5 bg-orange-600 hover:bg-orange-700 text-white">
            {saving
              ? <><RefreshCw className="w-4 h-4 animate-spin" /> Salvando...</>
              : <><Save className="w-4 h-4" /> Salvar tudo</>}
          </Button>
        </div>
      </div>

      {/* Tabs dos documentos */}
      <div className="border-b bg-white px-6" style={{ borderColor: 'rgba(0,0,0,.07)' }}>
        <div className="flex gap-1">
          {DOCS.map(({ id, label, icon: Icon, color }) => (
            <button key={id} onClick={() => setActiveDoc(id as 'termos' | 'privacidade')}
              className="flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-all"
              style={{
                borderColor: activeDoc === id ? color : 'transparent',
                color: activeDoc === id ? color : '#6e6e73',
              }}>
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="p-6 max-w-3xl">
        <DocEditor doc={currentDoc} onChange={setCurrentDoc} />
      </div>
    </div>
  );
}
