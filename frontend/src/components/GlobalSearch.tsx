import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Command, ArrowRight } from 'lucide-react';

const ITEMS = [
  { label: 'Dashboard',           path: '/admin',                  group: 'Painel'       },
  { label: 'Editor de Layout',    path: '/admin/layout',           group: 'Conteúdo'     },
  { label: 'Textos do Site',      path: '/admin/conteudo',         group: 'Conteúdo'     },
  { label: 'Banners / Carrossel', path: '/admin/banners',          group: 'Conteúdo'     },
  { label: 'Links Rápidos',       path: '/admin/links-rapidos',    group: 'Conteúdo'     },
  { label: 'Soluções & Páginas',  path: '/admin/solucoes',         group: 'Soluções'     },
  { label: 'Segmentos',           path: '/admin/segmentos',        group: 'Empresa'      },
  { label: 'Estatísticas',        path: '/admin/estatisticas',     group: 'Empresa'      },
  { label: 'Logos de Clientes',   path: '/admin/logos-clientes',   group: 'Prova Social' },
  { label: 'Depoimentos',         path: '/admin/depoimentos',      group: 'Prova Social' },
  { label: 'Parceiros',           path: '/admin/parceiros',        group: 'Prova Social' },
  { label: 'Central de Ajuda',    path: '/admin/central-ajuda',    group: 'Suporte'      },
  { label: 'Institucional',       path: '/admin/institucional',    group: 'Suporte'      },
  { label: 'Configurações',       path: '/admin/configuracoes',    group: 'Sistema'      },
];

export function GlobalSearch() {
  const [open, setOpen]   = useState(false);
  const [q, setQ]         = useState('');
  const [sel, setSel]     = useState(0);
  const inputRef          = useRef<HTMLInputElement>(null);
  const navigate          = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen(v => !v); }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 50); setQ(''); setSel(0); }
  }, [open]);

  const filtered = q.trim()
    ? ITEMS.filter(i => i.label.toLowerCase().includes(q.toLowerCase()) || i.group.toLowerCase().includes(q.toLowerCase()))
    : ITEMS;

  const go = (path: string) => { navigate(path); setOpen(false); };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(s + 1, filtered.length - 1)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setSel(s => Math.max(s - 1, 0)); }
      if (e.key === 'Enter' && filtered[sel]) go(filtered[sel].path);
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, filtered, sel]);

  if (!open) return null;

  const groups = filtered.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, typeof ITEMS>);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      paddingTop: '15vh',
    }} onClick={() => setOpen(false)}>
      <div style={{
        width: '100%', maxWidth: 560, background: '#fff', borderRadius: 20,
        boxShadow: '0 32px 80px rgba(0,0,0,.25)', overflow: 'hidden',
        border: '1px solid rgba(0,0,0,.08)',
      }} onClick={e => e.stopPropagation()}>

        {/* Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: '1px solid rgba(0,0,0,.07)' }}>
          <Search size={18} style={{ color: '#98989d', flexShrink: 0 }} />
          <input ref={inputRef} value={q} onChange={e => { setQ(e.target.value); setSel(0); }}
            placeholder="Buscar no admin..."
            style={{ flex: 1, border: 'none', outline: 'none', fontFamily: "'DM Sans'", fontSize: 15, color: '#1d1d1f', background: 'transparent' }} />
          {q && <button onClick={() => setQ('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#98989d', padding: 2 }}><X size={15} /></button>}
          <kbd style={{ fontFamily: 'monospace', fontSize: 11, padding: '2px 6px', borderRadius: 6, background: '#f5f5f7', border: '1px solid rgba(0,0,0,.1)', color: '#6e6e73' }}>ESC</kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: 380, overflowY: 'auto', padding: '8px 0' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#98989d', fontFamily: "'DM Sans'", fontSize: 14 }}>
              Nenhum resultado para "{q}"
            </div>
          ) : (
            Object.entries(groups).map(([group, items]) => (
              <div key={group}>
                <div style={{ padding: '6px 18px 4px', fontFamily: "'DM Sans'", fontSize: 10, fontWeight: 700, color: '#98989d', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {group}
                </div>
                {items.map((item) => {
                  const idx = filtered.indexOf(item);
                  const isSelected = idx === sel;
                  return (
                    <button key={item.path} onClick={() => go(item.path)}
                      onMouseEnter={() => setSel(idx)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 18px', border: 'none', cursor: 'pointer',
                        background: isSelected ? '#f5f5f7' : 'transparent',
                        textAlign: 'left', transition: 'background 0.1s',
                      }}>
                      <span style={{ fontFamily: "'DM Sans'", fontSize: 14, fontWeight: 500, color: '#1d1d1f' }}>{item.label}</span>
                      {isSelected && <ArrowRight size={14} style={{ color: '#98989d' }} />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid rgba(0,0,0,.06)', padding: '8px 18px', display: 'flex', gap: 16 }}>
          {[['↑↓', 'navegar'], ['↵', 'selecionar'], ['esc', 'fechar']].map(([key, label]) => (
            <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: "'DM Sans'", fontSize: 11, color: '#98989d' }}>
              <kbd style={{ fontFamily: 'monospace', padding: '1px 5px', borderRadius: 5, background: '#f5f5f7', border: '1px solid rgba(0,0,0,.1)', fontSize: 10 }}>{key}</kbd>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
