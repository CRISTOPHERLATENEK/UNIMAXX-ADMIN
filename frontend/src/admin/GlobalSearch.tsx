import { useState, useEffect, useRef } from 'react';
import type React from 'react';

import { Search, X, ArrowRight, LayoutDashboard, FileText, Briefcase, Tags, BarChart3, Image, Zap, HelpCircle, Settings, Building2, MessageSquare, Handshake, Layout, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PAGES = [
  { label: 'Dashboard',        path: '/admin',                    icon: LayoutDashboard, tags: ['inicio','painel'] },
  { label: 'Editor de Layout', path: '/admin/layout',             icon: Layout,          tags: ['layout','ordem','seções'] },
  { label: 'Conteúdo Geral',   path: '/admin/conteudo',           icon: FileText,        tags: ['textos','conteúdo','institucional'] },
  { label: 'Soluções',         path: '/admin/solucoes',           icon: Briefcase,       tags: ['produtos','serviços'] },
  { label: 'Segmentos',        path: '/admin/segmentos',          icon: Tags,            tags: ['mercados','setores'] },
  { label: 'Estatísticas',     path: '/admin/estatisticas',       icon: BarChart3,       tags: ['números','stats'] },
  { label: 'Banners',          path: '/admin/banners',            icon: Image,           tags: ['imagens','carrossel','slides'] },
  { label: 'Links Rápidos',    path: '/admin/links-rapidos',      icon: Zap,             tags: ['links','atalhos'] },
  { label: 'Central de Ajuda', path: '/admin/central-ajuda',      icon: HelpCircle,      tags: ['faq','suporte','artigos'] },
  { label: 'Logos de Clientes',path: '/admin/logos-clientes',     icon: Building2,       tags: ['logos','marcas','clientes'] },
  { label: 'Depoimentos',      path: '/admin/depoimentos',        icon: MessageSquare,   tags: ['testimonials','avaliações'] },
  { label: 'Parceiros',        path: '/admin/parceiros',          icon: Handshake,       tags: ['parceiros','integrações'] },
  { label: 'Institucional',    path: '/admin/institucional',      icon: Globe,           tags: ['sobre','carreiras','blog'] },
  { label: 'Configurações',    path: '/admin/configuracoes',      icon: Settings,        tags: ['config','cores','fontes'] },
  { label: 'Leads',            path: '/admin/leads',              icon: MessageSquare,   tags: ['contatos','formulário'] },
];

export function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ]         = useState('');
  const [sel, setSel]     = useState(0);
  const inputRef          = useRef<HTMLInputElement>(null);
  const navigate          = useNavigate();

  const results = q.trim()
    ? PAGES.filter(p =>
        p.label.toLowerCase().includes(q.toLowerCase()) ||
        p.tags.some(t => t.includes(q.toLowerCase()))
      )
    : PAGES;

  useEffect(() => {
    if (open) { setQ(''); setSel(0); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [open]);

  useEffect(() => { setSel(0); }, [q]);

  const go = (path: string) => { navigate(path); onClose(); };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(s + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setSel(s => Math.max(s - 1, 0)); }
    if (e.key === 'Enter' && results[sel]) go(results[sel].path);
    if (e.key === 'Escape') onClose();
  };

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '12vh',
      }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 520, borderRadius: 20, overflow: 'hidden',
          background: '#fff', boxShadow: '0 32px 80px rgba(0,0,0,.25)',
        }}>
        {/* Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid rgba(0,0,0,.07)' }}>
          <Search style={{ width: 18, height: 18, color: '#98989d', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={onKey}
            placeholder="Buscar no admin..."
            style={{
              flex: 1, border: 'none', outline: 'none', fontSize: 15,
              fontFamily: "'DM Sans', sans-serif", color: '#1d1d1f', background: 'transparent',
            }}
          />
          <kbd style={{ padding: '2px 7px', borderRadius: 6, fontSize: 11, fontFamily: 'monospace', background: '#f5f5f7', color: '#98989d', border: '1px solid rgba(0,0,0,.08)' }}>esc</kbd>
          <button onClick={onClose} style={{ color: '#98989d', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Results */}
        <div style={{ maxHeight: 360, overflowY: 'auto' }}>
          {results.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: '#98989d', fontSize: 14 }}>
              Nenhum resultado para "{q}"
            </div>
          ) : (
            <>
              <p style={{ padding: '8px 16px 4px', fontSize: 10, fontWeight: 700, color: '#98989d', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {q ? 'Resultados' : 'Páginas'}
              </p>
              {results.map((page, i) => {
                const Ic = page.icon;
                return (
                  <button key={page.path} onClick={() => go(page.path)}
                    onMouseEnter={() => setSel(i)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      width: '100%', padding: '10px 16px',
                      background: i === sel ? '#fff7ed' : 'transparent',
                      border: 'none', cursor: 'pointer', textAlign: 'left',
                      transition: 'background 0.1s',
                    }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                      background: i === sel ? '#f9731620' : '#f5f5f7',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Ic style={{ width: 16, height: 16, color: i === sel ? '#f97316' : '#6e6e73' }} />
                    </div>
                    <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#1d1d1f', fontFamily: "'DM Sans', sans-serif" }}>
                      {page.label}
                    </span>
                    {i === sel && <ArrowRight style={{ width: 14, height: 14, color: '#f97316' }} />}
                  </button>
                );
              })}
            </>
          )}
        </div>

        <div style={{ padding: '8px 16px', borderTop: '1px solid rgba(0,0,0,.06)', display: 'flex', gap: 16 }}>
          {[['↑↓','Navegar'],['↵','Abrir'],['esc','Fechar']].map(([k, l]) => (
            <span key={k} style={{ fontSize: 11, color: '#98989d', display: 'flex', alignItems: 'center', gap: 4 }}>
              <kbd style={{ padding: '1px 5px', borderRadius: 4, background: '#f5f5f7', border: '1px solid rgba(0,0,0,.08)', fontFamily: 'monospace' }}>{k}</kbd>
              {l}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
