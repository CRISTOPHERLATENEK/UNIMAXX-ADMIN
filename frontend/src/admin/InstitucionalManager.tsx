import { useState, useEffect } from 'react';
import type React from 'react';

import {
  Save, RefreshCw, Building2, Megaphone, Cookie,
  Briefcase, Newspaper, BookOpen, Eye, EyeOff,
  Plus, Trash2, GripVertical, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, AlertCircle, Sparkles, X,
  MapPin, DollarSign, Mail, Phone, Globe,
  User, Calendar, Tag, Hash,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// ─── Types ───────────────────────────────────────────────────────────────────

interface TimelineItem { year: string; title: string; description: string; }
interface ValorItem    { icon: string; title: string; description: string; }
interface PremioItem   { title: string; org: string; year: string; }
interface VagaItem     { titulo: string; area: string; local: string; tipo: string; salario: string; descricao: string; ativo: boolean; }
interface PostItem     { titulo: string; resumo: string; categoria: string; autor: string; data: string; destaque: boolean; }
interface ReleaseItem  { titulo: string; data: string; resumo: string; categoria: string; link: string; }

// ─── UI Helpers ──────────────────────────────────────────────────────────────

function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${className}`}
      style={{ borderColor: 'rgba(0,0,0,.07)' }}>
      {children}
    </div>
  );
}

function SectionHead({ icon: Icon, title, subtitle, color = '#f97316' }: {
  icon: React.ElementType; title: string; subtitle?: string; color?: string;
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'rgba(0,0,0,.06)', background: 'rgba(0,0,0,.01)' }}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="font-bold text-sm text-[#1d1d1f]">{title}</p>
        {subtitle && <p className="text-xs text-[#98989d] mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-[#1d1d1f] flex items-center gap-1">
        {label}
        {hint && <span className="font-normal text-[#98989d] ml-1">— {hint}</span>}
      </label>
      {children}
    </div>
  );
}

function Textarea({ value, onChange, rows = 3, placeholder }: {
  value: string; onChange: (v: string) => void; rows?: number; placeholder?: string;
}) {
  return (
    <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-300 transition"
      style={{ borderColor: 'rgba(0,0,0,.1)', fontFamily: 'inherit' }} />
  );
}

function StatusBadge({ active, activeLabel = 'Ativo', inactiveLabel = 'Inativo' }: {
  active: boolean; activeLabel?: string; inactiveLabel?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
      active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
    }`}>
      {active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

function PageToggleCard({ label, sub, enabled, onToggle, color = '#f97316' }: {
  label: string; sub?: string; enabled: boolean; onToggle: (v: boolean) => void; color?: string;
}) {
  return (
    <div className={`relative rounded-2xl border-2 p-5 transition-all cursor-pointer select-none ${
      enabled ? 'border-green-300 bg-green-50/50' : 'border-gray-200 bg-gray-50/50'
    }`} onClick={() => onToggle(!enabled)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            enabled ? 'bg-green-100' : 'bg-gray-200'
          }`}>
            {enabled
              ? <Eye className="w-5 h-5 text-green-600" />
              : <EyeOff className="w-5 h-5 text-gray-400" />}
          </div>
          <div>
            <p className="font-bold text-sm text-[#1d1d1f]">{label}</p>
            {sub && <p className="text-xs text-[#98989d] mt-0.5">{sub}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge active={enabled} activeLabel="Visível" inactiveLabel="Oculta" />
          <Switch checked={enabled} onCheckedChange={onToggle} onClick={(e) => e.stopPropagation()} />
        </div>
      </div>
      {!enabled && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          Visitantes verão uma mensagem de página indisponível
        </div>
      )}
    </div>
  );
}

function InlineToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-gray-50 border" style={{ borderColor: 'rgba(0,0,0,.07)' }}>
      <span className="text-xs font-semibold text-[#1d1d1f]">{label}</span>
      <div className="flex items-center gap-2">
        <StatusBadge active={checked} />
        <Switch checked={checked} onCheckedChange={onChange} />
      </div>
    </div>
  );
}

// ─── List Editors ─────────────────────────────────────────────────────────────

const EMOJI_ICONS = ['💡','🎯','🚀','💎','🌟','🤝','🛡️','⚡','🔥','❤️','🌱','🏆'];

function TimelineEditor({ items, onChange }: { items: TimelineItem[]; onChange: (v: TimelineItem[]) => void }) {
  const add    = () => onChange([...items, { year: new Date().getFullYear().toString(), title: '', description: '' }]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i: number, f: Partial<TimelineItem>) => onChange(items.map((it, idx) => idx === i ? { ...it, ...f } : it));
  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <div className="text-center py-8 rounded-xl border-2 border-dashed" style={{ borderColor: 'rgba(0,0,0,.1)' }}>
          <p className="text-2xl mb-2">📅</p>
          <p className="text-sm text-gray-400">Nenhum marco cadastrado</p>
        </div>
      )}
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 p-4 rounded-xl border bg-gradient-to-r from-orange-50/50 to-transparent" style={{ borderColor: 'rgba(249,115,22,.2)' }}>
          <GripVertical className="w-4 h-4 text-gray-300 mt-3 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Ano</label>
                <Input value={item.year} onChange={(e) => update(i, { year: e.target.value })} placeholder="2020" className="h-9 text-sm font-bold" />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Título</label>
                <Input value={item.title} onChange={(e) => update(i, { title: e.target.value })} placeholder="Fundação da empresa" className="h-9 text-sm" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Descrição</label>
              <Textarea value={item.description} onChange={(v) => update(i, { description: v })} rows={2} placeholder="Descreva este marco..." />
            </div>
          </div>
          <button onClick={() => remove(i)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition mt-1 flex-shrink-0">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed text-sm font-semibold text-gray-400 hover:text-orange-500 hover:border-orange-300 transition w-full justify-center" style={{ borderColor: 'rgba(0,0,0,.1)' }}>
        <Plus className="w-4 h-4" /> Adicionar marco histórico
      </button>
    </div>
  );
}

function ValoresEditor({ items, onChange }: { items: ValorItem[]; onChange: (v: ValorItem[]) => void }) {
  const add    = () => onChange([...items, { icon: '💡', title: '', description: '' }]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i: number, f: Partial<ValorItem>) => onChange(items.map((it, idx) => idx === i ? { ...it, ...f } : it));
  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <div className="text-center py-8 rounded-xl border-2 border-dashed" style={{ borderColor: 'rgba(0,0,0,.1)' }}>
          <Sparkles className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Nenhum valor cadastrado</p>
        </div>
      )}
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 p-4 rounded-xl border bg-gradient-to-r from-blue-50/30 to-transparent" style={{ borderColor: 'rgba(0,0,0,.08)' }}>
          <GripVertical className="w-4 h-4 text-gray-300 mt-3 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex gap-2">
              <div className="w-24">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Emoji</label>
                <Input value={item.icon} onChange={(e) => update(i, { icon: e.target.value })} placeholder="💡" className="h-9 text-lg text-center" maxLength={4} />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Título</label>
                <Input value={item.title} onChange={(e) => update(i, { title: e.target.value })} placeholder="Inovação" className="h-9 text-sm" />
              </div>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {EMOJI_ICONS.map(e => (
                <button key={e} onClick={() => update(i, { icon: e })}
                  className={`text-base w-8 h-8 rounded-lg transition hover:scale-110 ${item.icon === e ? 'bg-orange-100 ring-2 ring-orange-400' : 'bg-gray-100 hover:bg-gray-200'}`}>
                  {e}
                </button>
              ))}
            </div>
            <Textarea value={item.description} onChange={(v) => update(i, { description: v })} rows={2} placeholder="Descreva este valor..." />
          </div>
          <button onClick={() => remove(i)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition mt-1 flex-shrink-0">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed text-sm font-semibold text-gray-400 hover:text-orange-500 hover:border-orange-300 transition w-full justify-center" style={{ borderColor: 'rgba(0,0,0,.1)' }}>
        <Plus className="w-4 h-4" /> Adicionar valor
      </button>
    </div>
  );
}

function PremiosEditor({ items, onChange }: { items: PremioItem[]; onChange: (v: PremioItem[]) => void }) {
  const add    = () => onChange([...items, { title: '', org: '', year: '' }]);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i: number, f: Partial<PremioItem>) => onChange(items.map((it, idx) => idx === i ? { ...it, ...f } : it));
  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <div className="text-center py-8 rounded-xl border-2 border-dashed" style={{ borderColor: 'rgba(0,0,0,.1)' }}>
          <p className="text-2xl mb-2">🏆</p>
          <p className="text-sm text-gray-400">Nenhum prêmio cadastrado</p>
        </div>
      )}
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 p-4 rounded-xl border bg-gradient-to-r from-yellow-50/40 to-transparent" style={{ borderColor: 'rgba(234,179,8,.2)' }}>
          <GripVertical className="w-4 h-4 text-gray-300 mt-3 flex-shrink-0" />
          <div className="flex-1 grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Nome do prêmio</label>
              <Input value={item.title} onChange={(e) => update(i, { title: e.target.value })} placeholder="Melhor Empresa de Tecnologia" className="h-9 text-sm" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Ano</label>
              <Input value={item.year} onChange={(e) => update(i, { year: e.target.value })} placeholder="2024" className="h-9 text-sm" />
            </div>
            <div className="col-span-3">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Organização / Concedente</label>
              <Input value={item.org} onChange={(e) => update(i, { org: e.target.value })} placeholder="IDC Brasil" className="h-9 text-sm" />
            </div>
          </div>
          <button onClick={() => remove(i)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition mt-1 flex-shrink-0">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed text-sm font-semibold text-gray-400 hover:text-orange-500 hover:border-orange-300 transition w-full justify-center" style={{ borderColor: 'rgba(0,0,0,.1)' }}>
        <Plus className="w-4 h-4" /> Adicionar prêmio
      </button>
    </div>
  );
}

function VagasEditor({ items, onChange }: { items: VagaItem[]; onChange: (v: VagaItem[]) => void }) {
  const [open, setOpen] = useState<number | null>(null);
  const add    = () => { onChange([...items, { titulo: '', area: '', local: '', tipo: 'CLT', salario: '', descricao: '', ativo: true }]); setOpen(items.length); };
  const remove = (i: number) => { onChange(items.filter((_, idx) => idx !== i)); setOpen(null); };
  const update = (i: number, f: Partial<VagaItem>) => onChange(items.map((it, idx) => idx === i ? { ...it, ...f } : it));
  return (
    <div className="space-y-2">
      {items.length === 0 && (
        <div className="text-center py-8 rounded-xl border-2 border-dashed" style={{ borderColor: 'rgba(0,0,0,.1)' }}>
          <Briefcase className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Nenhuma vaga cadastrada</p>
        </div>
      )}
      {items.map((item, i) => (
        <div key={i} className={`rounded-xl border overflow-hidden transition-all ${item.ativo !== false ? '' : 'opacity-60'}`} style={{ borderColor: 'rgba(0,0,0,.08)' }}>
          <div className="flex items-center gap-3 p-3 bg-white hover:bg-gray-50 transition cursor-pointer" onClick={() => setOpen(open === i ? null : i)}>
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.ativo !== false ? 'bg-green-400' : 'bg-gray-300'}`} />
            <Briefcase className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="flex-1 text-sm font-semibold text-[#1d1d1f] truncate">{item.titulo || 'Nova vaga'}</span>
            {item.area && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full hidden sm:block">{item.area}</span>}
            {item.tipo && <span className="text-xs font-medium bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full hidden sm:block">{item.tipo}</span>}
            <StatusBadge active={item.ativo !== false} activeLabel="Ativa" inactiveLabel="Inativa" />
            {open === i ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
          </div>
          {open === i && (
            <div className="p-4 border-t space-y-3" style={{ borderColor: 'rgba(0,0,0,.06)', background: '#fafafa' }}>
              <InlineToggle label="Vaga ativa (visível no site)" checked={item.ativo !== false} onChange={(v) => update(i, { ativo: v })} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Título da vaga</label>
                  <Input value={item.titulo} onChange={(e) => update(i, { titulo: e.target.value })} placeholder="Desenvolvedor Full Stack" className="h-9 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block flex items-center gap-1"><Tag className="w-3 h-3" /> Área</label>
                  <Input value={item.area} onChange={(e) => update(i, { area: e.target.value })} placeholder="Tecnologia" className="h-9 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block flex items-center gap-1"><MapPin className="w-3 h-3" /> Local</label>
                  <Input value={item.local} onChange={(e) => update(i, { local: e.target.value })} placeholder="São Paulo, SP" className="h-9 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Tipo</label>
                  <select value={item.tipo} onChange={(e) => update(i, { tipo: e.target.value })}
                    className="w-full h-9 px-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-orange-300" style={{ borderColor: 'rgba(0,0,0,.1)' }}>
                    <option value="CLT">CLT</option>
                    <option value="PJ">PJ</option>
                    <option value="Estágio">Estágio</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Híbrido">Híbrido</option>
                    <option value="Remoto">Remoto</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block flex items-center gap-1"><DollarSign className="w-3 h-3" /> Faixa salarial</label>
                  <Input value={item.salario || ''} onChange={(e) => update(i, { salario: e.target.value })} placeholder="A combinar" className="h-9 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Descrição</label>
                <Textarea value={item.descricao} onChange={(v) => update(i, { descricao: v })} rows={3} placeholder="Responsabilidades, requisitos, diferenciais..." />
              </div>
              <button onClick={() => remove(i)} className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-semibold transition px-2 py-1 rounded-lg hover:bg-red-50">
                <Trash2 className="w-3.5 h-3.5" /> Remover esta vaga
              </button>
            </div>
          )}
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed text-sm font-semibold text-gray-400 hover:text-orange-500 hover:border-orange-300 transition w-full justify-center" style={{ borderColor: 'rgba(0,0,0,.1)' }}>
        <Plus className="w-4 h-4" /> Adicionar vaga
      </button>
    </div>
  );
}

function PostsEditor({ items, onChange }: { items: PostItem[]; onChange: (v: PostItem[]) => void }) {
  const [open, setOpen] = useState<number | null>(null);
  const add    = () => { onChange([...items, { titulo: '', resumo: '', categoria: '', autor: '', data: '', destaque: false }]); setOpen(items.length); };
  const remove = (i: number) => { onChange(items.filter((_, idx) => idx !== i)); setOpen(null); };
  const update = (i: number, f: Partial<PostItem>) => onChange(items.map((it, idx) => idx === i ? { ...it, ...f } : it));
  return (
    <div className="space-y-2">
      {items.length === 0 && (
        <div className="text-center py-8 rounded-xl border-2 border-dashed" style={{ borderColor: 'rgba(0,0,0,.1)' }}>
          <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Nenhum post cadastrado</p>
        </div>
      )}
      {items.map((item, i) => (
        <div key={i} className="rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(0,0,0,.08)' }}>
          <div className="flex items-center gap-3 p-3 bg-white hover:bg-gray-50 transition cursor-pointer" onClick={() => setOpen(open === i ? null : i)}>
            {item.destaque && <Sparkles className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />}
            <BookOpen className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="flex-1 text-sm font-semibold text-[#1d1d1f] truncate">{item.titulo || 'Novo post'}</span>
            {item.categoria && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full hidden sm:block">{item.categoria}</span>}
            {item.autor && <span className="text-xs text-gray-400 hidden md:block">{item.autor}</span>}
            {open === i ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
          </div>
          {open === i && (
            <div className="p-4 border-t space-y-3" style={{ borderColor: 'rgba(0,0,0,.06)', background: '#fafafa' }}>
              <InlineToggle label="Post em destaque" checked={!!item.destaque} onChange={(v) => update(i, { destaque: v })} />
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Título</label>
                <Input value={item.titulo} onChange={(e) => update(i, { titulo: e.target.value })} placeholder="Título do artigo" className="h-9 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block flex items-center gap-1"><Tag className="w-3 h-3" /> Categoria</label>
                  <Input value={item.categoria} onChange={(e) => update(i, { categoria: e.target.value })} placeholder="Tecnologia" className="h-9 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block flex items-center gap-1"><User className="w-3 h-3" /> Autor</label>
                  <Input value={item.autor} onChange={(e) => update(i, { autor: e.target.value })} placeholder="João Silva" className="h-9 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block flex items-center gap-1"><Calendar className="w-3 h-3" /> Data</label>
                  <Input value={item.data || ''} onChange={(e) => update(i, { data: e.target.value })} placeholder="15 Jan 2025" className="h-9 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Resumo</label>
                <Textarea value={item.resumo} onChange={(v) => update(i, { resumo: v })} rows={3} placeholder="Descrição curta do artigo..." />
              </div>
              <button onClick={() => remove(i)} className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-semibold transition px-2 py-1 rounded-lg hover:bg-red-50">
                <Trash2 className="w-3.5 h-3.5" /> Remover este post
              </button>
            </div>
          )}
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed text-sm font-semibold text-gray-400 hover:text-orange-500 hover:border-orange-300 transition w-full justify-center" style={{ borderColor: 'rgba(0,0,0,.1)' }}>
        <Plus className="w-4 h-4" /> Adicionar post
      </button>
    </div>
  );
}

function ReleasesEditor({ items, onChange }: { items: ReleaseItem[]; onChange: (v: ReleaseItem[]) => void }) {
  const [open, setOpen] = useState<number | null>(null);
  const add    = () => { onChange([...items, { titulo: '', data: '', resumo: '', categoria: '', link: '' }]); setOpen(items.length); };
  const remove = (i: number) => { onChange(items.filter((_, idx) => idx !== i)); setOpen(null); };
  const update = (i: number, f: Partial<ReleaseItem>) => onChange(items.map((it, idx) => idx === i ? { ...it, ...f } : it));
  return (
    <div className="space-y-2">
      {items.length === 0 && (
        <div className="text-center py-8 rounded-xl border-2 border-dashed" style={{ borderColor: 'rgba(0,0,0,.1)' }}>
          <Newspaper className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Nenhum release cadastrado</p>
        </div>
      )}
      {items.map((item, i) => (
        <div key={i} className="rounded-xl border overflow-hidden" style={{ borderColor: 'rgba(0,0,0,.08)' }}>
          <div className="flex items-center gap-3 p-3 bg-white hover:bg-gray-50 transition cursor-pointer" onClick={() => setOpen(open === i ? null : i)}>
            <Newspaper className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="flex-1 text-sm font-semibold text-[#1d1d1f] truncate">{item.titulo || 'Novo release'}</span>
            {item.data && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full hidden sm:block">{item.data}</span>}
            {item.categoria && <span className="text-xs text-gray-400 hidden md:block">{item.categoria}</span>}
            {open === i ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
          </div>
          {open === i && (
            <div className="p-4 border-t space-y-3" style={{ borderColor: 'rgba(0,0,0,.06)', background: '#fafafa' }}>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Título</label>
                <Input value={item.titulo} onChange={(e) => update(i, { titulo: e.target.value })} placeholder="Título do comunicado" className="h-9 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block flex items-center gap-1"><Calendar className="w-3 h-3" /> Data</label>
                  <Input value={item.data} onChange={(e) => update(i, { data: e.target.value })} placeholder="15 Jan 2025" className="h-9 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block flex items-center gap-1"><Tag className="w-3 h-3" /> Categoria</label>
                  <Input value={item.categoria} onChange={(e) => update(i, { categoria: e.target.value })} placeholder="Parceria / Produto" className="h-9 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block flex items-center gap-1"><Globe className="w-3 h-3" /> Link externo (opcional)</label>
                <Input value={item.link || ''} onChange={(e) => update(i, { link: e.target.value })} placeholder="https://noticia.com.br/..." className="h-9 text-sm" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Resumo</label>
                <Textarea value={item.resumo} onChange={(v) => update(i, { resumo: v })} rows={3} placeholder="Resumo do comunicado..." />
              </div>
              <button onClick={() => remove(i)} className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-semibold transition px-2 py-1 rounded-lg hover:bg-red-50">
                <Trash2 className="w-3.5 h-3.5" /> Remover este release
              </button>
            </div>
          )}
        </div>
      ))}
      <button onClick={add} className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed text-sm font-semibold text-gray-400 hover:text-orange-500 hover:border-orange-300 transition w-full justify-center" style={{ borderColor: 'rgba(0,0,0,.1)' }}>
        <Plus className="w-4 h-4" /> Adicionar release
      </button>
    </div>
  );
}

// ─── JSON helper ──────────────────────────────────────────────────────────────

function parseJson<T>(v: string | undefined, fallback: T): T {
  try { return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}

// ─── TABS ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'sobre',     label: 'Sobre',     icon: Building2, color: '#3b82f6' },
  { id: 'carreiras', label: 'Carreiras', icon: Briefcase,  color: '#10b981' },
  { id: 'blog',      label: 'Blog',      icon: BookOpen,   color: '#8b5cf6' },
  { id: 'imprensa',  label: 'Imprensa',  icon: Newspaper,  color: '#f59e0b' },
  { id: 'popup',     label: 'Popup',     icon: Megaphone,  color: '#ef4444' },
  { id: 'cookie',    label: 'Cookie',    icon: Cookie,     color: '#6b7280' },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export function InstitucionalManager() {
  const { data, updateContent } = useData();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('sobre');
  const [form, setForm]           = useState<Record<string, string>>({});
  const [saving, setSaving]       = useState(false);
  const [unsaved, setUnsaved]     = useState(false);

  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [valores,  setValores]  = useState<ValorItem[]>([]);
  const [premios,  setPremios]  = useState<PremioItem[]>([]);
  const [vagas,    setVagas]    = useState<VagaItem[]>([]);
  const [posts,    setPosts]    = useState<PostItem[]>([]);
  const [releases, setReleases] = useState<ReleaseItem[]>([]);

  useEffect(() => {
    if (!data.content) return;
    const c = data.content;
    setForm({ ...c });
    setTimeline(parseJson(c['sobre.timeline'], []));
    setValores(parseJson(c['sobre.valores_list'], []));
    setPremios(parseJson(c['sobre.premios_list'], []));
    setVagas(parseJson(c['carreiras.vagas'], []));
    setPosts(parseJson(c['blog.posts'], []));
    setReleases(parseJson(c['imprensa.releases'], []));
    setUnsaved(false);
  }, [data.content]);

  const set = (k: string, v: string) => { setForm(p => ({ ...p, [k]: v })); setUnsaved(true); };
  const markUnsaved = () => setUnsaved(true);

  const save = async () => {
    setSaving(true);
    try {
      // Filtra apenas as chaves institucionais para não enviar o form inteiro
      const PREFIXES = ['sobre.','carreiras.','blog.','imprensa.','popup.','cookie.'];
      const filtered = Object.fromEntries(
        Object.entries(form).filter(([k]) => PREFIXES.some(p => k.startsWith(p)))
      );
      await updateContent({
        ...filtered,
        'sobre.timeline':      JSON.stringify(timeline),
        'sobre.valores_list':  JSON.stringify(valores),
        'sobre.premios_list':  JSON.stringify(premios),
        'carreiras.vagas':     JSON.stringify(vagas),
        'blog.posts':          JSON.stringify(posts),
        'imprensa.releases':   JSON.stringify(releases),
      });
      setUnsaved(false);
      toast({ title: '✅ Salvo com sucesso!', description: 'Todas as alterações foram aplicadas.' });
    } catch {
      toast({ title: 'Erro ao salvar', description: 'Verifique a conexão e tente novamente.', variant: 'destructive' });
    } finally { setSaving(false); }
  };

  const pc = data.settings?.primary_color || '#f97316';
  const sc = data.settings?.secondary_color || '#fb923c';

  const vagasAtivas  = vagas.filter(v => v.ativo !== false).length;
  const postCount    = posts.length;
  const releaseCount = releases.length;

  return (
    <div className="min-h-full bg-[#f5f5f7]">

      {/* Top Bar */}
      <div className="sticky top-0 z-20 bg-white border-b px-5 py-3.5 flex items-center justify-between gap-4"
        style={{ borderColor: 'rgba(0,0,0,.07)' }}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${pc}15` }}>
            <Building2 className="w-[18px] h-[18px]" style={{ color: pc }} />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-[#1d1d1f] text-[15px] leading-tight">Institucional & Comunicação</h1>
            <p className="text-xs text-[#98989d]">Páginas, conteúdo e comunicados do site</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {unsaved && (
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg font-medium">
              <AlertCircle className="w-3.5 h-3.5" /> Não salvo
            </span>
          )}
          <Button onClick={save} disabled={saving}
            className="flex items-center gap-2 font-bold rounded-xl px-5 h-9 text-sm"
            style={{ background: saving ? '#ccc' : pc, color: '#fff' }}>
            {saving
              ? <span className="flex items-center gap-2"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Salvando...</span>
              : <span className="flex items-center gap-2"><Save className="w-3.5 h-3.5" /> Salvar</span>}
          </Button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="bg-white border-b px-4 flex gap-0.5 overflow-x-auto scrollbar-none" style={{ borderColor: 'rgba(0,0,0,.07)' }}>
        {TABS.map(({ id, label, icon: Icon, color }) => {
          const isActive = activeTab === id;
          const badge = id === 'carreiras' ? vagasAtivas : id === 'blog' ? postCount : id === 'imprensa' ? releaseCount : null;
          return (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`group flex items-center gap-1.5 px-4 py-3 text-sm font-semibold transition relative whitespace-nowrap flex-shrink-0 ${
                isActive ? 'text-[#1d1d1f]' : 'text-[#98989d] hover:text-[#6e6e73]'
              }`}>
              <div className={`w-5 h-5 rounded-md flex items-center justify-center transition ${isActive ? '' : 'opacity-50 group-hover:opacity-70'}`}
                style={isActive ? { background: `${color}15` } : {}}>
                <Icon className="w-3.5 h-3.5" style={isActive ? { color } : {}} />
              </div>
              {label}
              {badge !== null && badge > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none"
                  style={isActive ? { background: `${color}20`, color } : { background: '#f0f0f0', color: '#999' }}>
                  {badge}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full" style={{ background: color }} />
              )}
            </button>
          );
        })}
      </div>

      <div className="max-w-3xl mx-auto p-5 space-y-4 pb-24">

        {/* ═══════════ SOBRE ═══════════ */}
        {activeTab === 'sobre' && (<>
          <SectionCard>
            <SectionHead icon={Eye} title="Visibilidade da Página" subtitle="Controle se /sobre está acessível" color="#3b82f6" />
            <div className="p-5">
              <PageToggleCard label="Página Sobre Nós (/sobre)" sub="Exibe informações sobre a empresa" enabled={form['sobre.enabled'] !== '0'} onToggle={(v) => set('sobre.enabled', v ? '1' : '0')} />
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHead icon={Hash} title="Topo da Página" color="#3b82f6" />
            <div className="p-5 space-y-4">
              <Field label="Título principal"><Input value={form['sobre.title'] || ''} onChange={(e) => set('sobre.title', e.target.value)} placeholder="Sobre a Unimaxx" className="h-10" /></Field>
              <Field label="Subtítulo"><Textarea value={form['sobre.subtitle'] || ''} onChange={(v) => set('sobre.subtitle', v)} rows={2} placeholder="Líder em tecnologia para o varejo brasileiro há mais de 35 anos." /></Field>
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHead icon={Sparkles} title="Missão, Visão e Propósito" color="#3b82f6" />
            <div className="p-5">
              <div className="grid sm:grid-cols-3 gap-4">
                <Field label="🎯 Missão"><Textarea value={form['sobre.missao'] || ''} onChange={(v) => set('sobre.missao', v)} rows={5} placeholder="Nossa missão é transformar a complexidade do varejo..." /></Field>
                <Field label="👁️ Visão"><Textarea value={form['sobre.visao'] || ''} onChange={(v) => set('sobre.visao', v)} rows={5} placeholder="Ser a plataforma mais relevante para o varejo..." /></Field>
                <Field label="💡 Propósito"><Textarea value={form['sobre.proposito'] || ''} onChange={(v) => set('sobre.proposito', v)} rows={5} placeholder="Empoderar o varejo com tecnologia..." /></Field>
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHead icon={Hash} title="Estatísticas de Destaque" subtitle="4 números na seção escura da página" color="#3b82f6" />
            <div className="p-5">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { kN: 'sobre.stat1_number', kL: 'sobre.stat1_label', ph: '35+', phL: 'Anos de História' },
                  { kN: 'sobre.stat2_number', kL: 'sobre.stat2_label', ph: '60K+', phL: 'Clientes' },
                  { kN: 'sobre.stat3_number', kL: 'sobre.stat3_label', ph: '4K+', phL: 'Colaboradores' },
                  { kN: 'sobre.stat4_number', kL: 'sobre.stat4_label', ph: '16', phL: 'Países' },
                ].map(({ kN, kL, ph, phL }, idx) => (
                  <div key={kN} className="p-3 rounded-xl bg-gray-50 border space-y-2" style={{ borderColor: 'rgba(0,0,0,.07)' }}>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Stat {idx + 1}</p>
                    <Input value={form[kN] || ''} onChange={(e) => set(kN, e.target.value)} placeholder={ph} className="h-10 text-xl font-bold text-center" />
                    <Input value={form[kL] || ''} onChange={(e) => set(kL, e.target.value)} placeholder={phL} className="h-8 text-xs text-center text-gray-500" />
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHead icon={BookOpen} title="Nossa História — Timeline" subtitle={`${timeline.length} marcos`} color="#3b82f6" />
            <div className="p-5"><TimelineEditor items={timeline} onChange={(v) => { setTimeline(v); markUnsaved(); }} /></div>
          </SectionCard>

          <SectionCard>
            <SectionHead icon={Sparkles} title="Nossos Valores" subtitle={`${valores.length} valores`} color="#3b82f6" />
            <div className="p-5"><ValoresEditor items={valores} onChange={(v) => { setValores(v); markUnsaved(); }} /></div>
          </SectionCard>

          <SectionCard>
            <SectionHead icon={CheckCircle2} title="Prêmios e Reconhecimentos" subtitle={`${premios.length} prêmios`} color="#3b82f6" />
            <div className="p-5"><PremiosEditor items={premios} onChange={(v) => { setPremios(v); markUnsaved(); }} /></div>
          </SectionCard>

          <SectionCard>
            <SectionHead icon={Megaphone} title="Call to Action Final" color="#3b82f6" />
            <div className="p-5 space-y-4">
              <Field label="Título do CTA"><Input value={form['sobre.cta_title'] || ''} onChange={(e) => set('sobre.cta_title', e.target.value)} placeholder="Faça parte da nossa história" className="h-10" /></Field>
              <Field label="Texto / descrição"><Textarea value={form['sobre.cta_text'] || ''} onChange={(v) => set('sobre.cta_text', v)} rows={2} placeholder="Junte-se a mais de 60 mil empresas que confiam na Unimaxx." /></Field>
            </div>
          </SectionCard>
        </>)}

        {/* ═══════════ CARREIRAS ═══════════ */}
        {activeTab === 'carreiras' && (<>
          <SectionCard>
            <SectionHead icon={Eye} title="Visibilidade da Página" color="#10b981" />
            <div className="p-5">
              <PageToggleCard label="Página Carreiras (/carreiras)" sub="Exibe vagas para candidatos" enabled={form['carreiras.enabled'] !== '0'} onToggle={(v) => set('carreiras.enabled', v ? '1' : '0')} />
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHead icon={Hash} title="Topo da Página" color="#10b981" />
            <div className="p-5 space-y-4">
              <Field label="Título"><Input value={form['carreiras.title'] || ''} onChange={(e) => set('carreiras.title', e.target.value)} placeholder="Trabalhe Conosco" className="h-10" /></Field>
              <Field label="Subtítulo"><Textarea value={form['carreiras.subtitle'] || ''} onChange={(v) => set('carreiras.subtitle', v)} rows={2} placeholder="Faça parte de um time apaixonado por tecnologia e inovação." /></Field>
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHead icon={CheckCircle2} title="Benefícios" subtitle="Separados por vírgula" color="#10b981" />
            <div className="p-5 space-y-3">
              <Field label="Lista de benefícios" hint="separados por vírgula">
                <Textarea value={form['carreiras.beneficios'] || ''} onChange={(v) => set('carreiras.beneficios', v)} rows={3} placeholder="Plano de saúde, Vale refeição, Flexibilidade de horário, Gympass, PLR..." />
              </Field>
              {form['carreiras.beneficios'] && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Preview dos badges</p>
                  <div className="flex flex-wrap gap-2">
                    {form['carreiras.beneficios'].split(',').map((b, i) => b.trim() && (
                      <span key={i} className="px-3 py-1.5 rounded-full text-xs font-medium border" style={{ background: '#10b98110', borderColor: '#10b98130', color: '#10b981' }}>
                        ✓ {b.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHead icon={Briefcase} title="Vagas Abertas" subtitle={`${vagasAtivas} ativa(s) de ${vagas.length} cadastrada(s)`} color="#10b981" />
            <div className="p-5"><VagasEditor items={vagas} onChange={(v) => { setVagas(v); markUnsaved(); }} /></div>
          </SectionCard>

          <SectionCard>
            <SectionHead icon={Mail} title="Contato para Candidaturas" subtitle="Opcional" color="#10b981" />
            <div className="p-5 grid sm:grid-cols-2 gap-4">
              <Field label="E-mail de RH">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input value={form['carreiras.email'] || ''} onChange={(e) => set('carreiras.email', e.target.value)} placeholder="rh@empresa.com.br" className="h-10 pl-9" />
                </div>
              </Field>
              <Field label="LinkedIn da empresa">
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input value={form['carreiras.linkedin'] || ''} onChange={(e) => set('carreiras.linkedin', e.target.value)} placeholder="https://linkedin.com/company/..." className="h-10 pl-9" />
                </div>
              </Field>
            </div>
          </SectionCard>
        </>)}

        {/* ═══════════ BLOG ═══════════ */}
        {activeTab === 'blog' && (<>
          <SectionCard>
            <SectionHead icon={Eye} title="Visibilidade da Página" color="#8b5cf6" />
            <div className="p-5">
              <PageToggleCard label="Página Blog (/blog)" sub="Exibe artigos para visitantes" enabled={form['blog.enabled'] !== '0'} onToggle={(v) => set('blog.enabled', v ? '1' : '0')} />
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHead icon={Hash} title="Topo da Página" color="#8b5cf6" />
            <div className="p-5 space-y-4">
              <Field label="Título"><Input value={form['blog.title'] || ''} onChange={(e) => set('blog.title', e.target.value)} placeholder="Blog & Conteúdo" className="h-10" /></Field>
              <Field label="Subtítulo"><Textarea value={form['blog.subtitle'] || ''} onChange={(v) => set('blog.subtitle', v)} rows={2} placeholder="Artigos sobre varejo, tecnologia e gestão." /></Field>
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHead icon={BookOpen} title="Posts do Blog" subtitle={`${postCount} post(s) cadastrado(s)`} color="#8b5cf6" />
            <div className="p-5"><PostsEditor items={posts} onChange={(v) => { setPosts(v); markUnsaved(); }} /></div>
          </SectionCard>
        </>)}

        {/* ═══════════ IMPRENSA ═══════════ */}
        {activeTab === 'imprensa' && (<>
          <SectionCard>
            <SectionHead icon={Eye} title="Visibilidade da Página" color="#f59e0b" />
            <div className="p-5">
              <PageToggleCard label="Página Imprensa (/imprensa)" sub="Sala de imprensa com press releases" enabled={form['imprensa.enabled'] !== '0'} onToggle={(v) => set('imprensa.enabled', v ? '1' : '0')} />
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHead icon={Hash} title="Topo da Página" color="#f59e0b" />
            <div className="p-5 space-y-4">
              <Field label="Título"><Input value={form['imprensa.title'] || ''} onChange={(e) => set('imprensa.title', e.target.value)} placeholder="Sala de Imprensa" className="h-10" /></Field>
              <Field label="Subtítulo"><Textarea value={form['imprensa.subtitle'] || ''} onChange={(v) => set('imprensa.subtitle', v)} rows={2} placeholder="Notícias, press releases e cobertura da mídia." /></Field>
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHead icon={Mail} title="Contato de Imprensa" color="#f59e0b" />
            <div className="p-5 grid sm:grid-cols-2 gap-4">
              <Field label="E-mail de imprensa">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input value={form['imprensa.email'] || ''} onChange={(e) => set('imprensa.email', e.target.value)} placeholder="imprensa@empresa.com.br" className="h-10 pl-9" />
                </div>
              </Field>
              <Field label="Telefone">
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input value={form['imprensa.phone'] || ''} onChange={(e) => set('imprensa.phone', e.target.value)} placeholder="(11) 99999-9999" className="h-10 pl-9" />
                </div>
              </Field>
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHead icon={Newspaper} title="Press Releases" subtitle={`${releaseCount} release(s)`} color="#f59e0b" />
            <div className="p-5"><ReleasesEditor items={releases} onChange={(v) => { setReleases(v); markUnsaved(); }} /></div>
          </SectionCard>
        </>)}

        {/* ═══════════ POPUP ═══════════ */}
        {activeTab === 'popup' && (
          <SectionCard>
            <SectionHead icon={Megaphone} title="Popup de Anúncio" subtitle="Aparece 2,5s após abrir o site — 1 vez por sessão" color="#ef4444" />
            <div className="p-5 space-y-4">
              <PageToggleCard label="Popup ativo" sub="Exibe o popup para visitantes" enabled={form['popup.enabled'] === '1'} onToggle={(v) => set('popup.enabled', v ? '1' : '0')} color="#ef4444" />

              <div className={`space-y-4 transition-opacity ${form['popup.enabled'] !== '1' ? 'opacity-50 pointer-events-none' : ''}`}>
                <Field label="Título"><Input value={form['popup.title'] || ''} onChange={(e) => set('popup.title', e.target.value)} placeholder="Ex: Novidade Unimaxx!" className="h-10" /></Field>
                <Field label="Mensagem principal"><Textarea value={form['popup.text'] || ''} onChange={(v) => set('popup.text', v)} rows={3} placeholder="Conheça nossa nova solução para o varejo..." /></Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Texto do botão"><Input value={form['popup.cta_label'] || ''} onChange={(e) => set('popup.cta_label', e.target.value)} placeholder="Saiba mais" className="h-10" /></Field>
                  <Field label="Link" hint="/solucoes ou https://..."><Input value={form['popup.cta_link'] || ''} onChange={(e) => set('popup.cta_link', e.target.value)} placeholder="/solucoes" className="h-10" /></Field>
                </div>
              </div>

              {(form['popup.title'] || form['popup.text']) && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Preview</p>
                  <div className="rounded-2xl overflow-hidden shadow-xl border max-w-sm mx-auto" style={{ borderColor: 'rgba(0,0,0,.1)' }}>
                    <div className="h-1.5" style={{ background: `linear-gradient(to right,${pc},${sc})` }} />
                    <div className="bg-white p-6 relative">
                      <button className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100"><X className="w-3.5 h-3.5" /></button>
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${pc}12` }}><span className="text-xl">✨</span></div>
                      {form['popup.title'] && <p className="font-bold text-[#1d1d1f] mb-2 pr-8">{form['popup.title']}</p>}
                      {form['popup.text'] && <p className="text-[#6e6e73] text-sm mb-5 leading-relaxed">{form['popup.text']}</p>}
                      <div className="flex items-center gap-2">
                        <span className="px-4 py-2.5 rounded-xl text-white text-sm font-bold" style={{ background: `linear-gradient(135deg,${pc},${sc})` }}>{form['popup.cta_label'] || 'Saiba mais'}</span>
                        <span className="px-4 py-2.5 rounded-xl text-sm text-gray-400 bg-gray-100">Agora não</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </SectionCard>
        )}

        {/* ═══════════ COOKIE ═══════════ */}
        {activeTab === 'cookie' && (
          <SectionCard>
            <SectionHead icon={Cookie} title="Aviso de Cookies" subtitle="Banner no rodapé — salvo no navegador do visitante" color="#6b7280" />
            <div className="p-5 space-y-4">
              <PageToggleCard label="Aviso de cookies ativo" sub="Exibe o banner de consentimento" enabled={form['cookie.enabled'] !== '0'} onToggle={(v) => set('cookie.enabled', v ? '1' : '0')} color="#6b7280" />

              <div className={`space-y-4 transition-opacity ${form['cookie.enabled'] === '0' ? 'opacity-50 pointer-events-none' : ''}`}>
                <Field label="Texto do aviso">
                  <Textarea value={form['cookie.text'] || ''} onChange={(v) => set('cookie.text', v)} rows={3} placeholder="Usamos cookies para melhorar sua experiência. Ao continuar navegando, você concorda com nossa Política de Privacidade." />
                </Field>
                <Field label="Texto do botão Aceitar">
                  <Input value={form['cookie.btn_label'] || ''} onChange={(e) => set('cookie.btn_label', e.target.value)} placeholder="Aceitar" className="h-10 max-w-xs" />
                </Field>
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Preview do banner</p>
                <div className="bg-[#1d1d1f] rounded-2xl px-5 py-4 flex items-center gap-4 shadow-lg">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${pc}20` }}>
                    <Cookie className="w-4 h-4" style={{ color: pc }} />
                  </div>
                  <p className="text-white/70 text-xs flex-1 leading-relaxed">
                    {form['cookie.text'] || 'Usamos cookies para melhorar sua experiência...'}{' '}
                    <span className="underline text-white/50">Política de Privacidade</span>
                  </p>
                  <span className="flex-shrink-0 px-4 py-2 rounded-xl text-white text-xs font-bold" style={{ background: pc }}>
                    {form['cookie.btn_label'] || 'Aceitar'}
                  </span>
                  <button className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-white/40"><X className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          </SectionCard>
        )}

      </div>

      {/* Floating Save mobile */}
      {unsaved && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 sm:hidden">
          <button onClick={save} disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-white font-bold text-sm shadow-2xl"
            style={{ background: pc }}>
            {saving ? <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Salvando...</span> : <span className="flex items-center gap-2"><Save className="w-4 h-4" /> Salvar alterações</span>}
          </button>
        </div>
      )}

    </div>
  );
}
