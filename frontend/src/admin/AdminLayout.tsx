// src/admin/AdminLayout.tsx — Sidebar colapsável com ícones, tooltips e design refinado

import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, AlignLeft, LayoutTemplate, Link2,
  Star, Layers, BarChart2, Tag, MessageSquare, Handshake,
  HelpCircle, Building2, Scale, Inbox, Mail,
  Settings, LogOut, Menu, ChevronDown, User, X, Globe,
  ChevronRight, Search, Zap, ChevronLeft,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { GlobalSearch } from '@/admin/GlobalSearch';
import { useData } from '@/context/DataContext';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';

type MenuItem = { path: string; label: string; icon: React.ElementType; exact?: boolean; badge?: boolean };
type MenuGroup = { label: string; items: MenuItem[] };

const menuGroups: MenuGroup[] = [
  {
    label: 'MAIN',
    items: [
      { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: 'CONTEÚDO',
    items: [
      { path: '/admin/home',          label: 'Editor da Home',       icon: LayoutTemplate },
      { path: '/admin/conteudo',      label: 'Conteúdo Geral',       icon: AlignLeft },
      { path: '/admin/paginas',       label: 'Páginas do Site',      icon: FileText },
      { path: '/admin/links-rapidos', label: 'Links Rápidos',        icon: Link2 },
      { path: '/admin/diferenciais',  label: 'Diferenciais',         icon: Star },
    ],
  },
  {
    label: 'SOLUÇÕES',
    items: [
      { path: '/admin/solucoes',      label: 'Soluções',             icon: Layers },
    ],
  },
  {
    label: 'EMPRESA',
    items: [
      { path: '/admin/segmentos',     label: 'Segmentos',            icon: Tag },
      { path: '/admin/estatisticas',  label: 'Estatísticas',         icon: BarChart2 },
    ],
  },
  {
    label: 'PROVA SOCIAL',
    items: [
      { path: '/admin/logos-clientes',label: 'Features Marquee',     icon: Zap },
      { path: '/admin/depoimentos',   label: 'Depoimentos',          icon: MessageSquare },
      { path: '/admin/parceiros',     label: 'Parceiros',            icon: Handshake },
    ],
  },
  {
    label: 'SETTINGS',
    items: [
      { path: '/admin/central-ajuda', label: 'Central de Ajuda',     icon: HelpCircle },
      { path: '/admin/institucional', label: 'Institucional',        icon: Building2 },
      { path: '/admin/legal',         label: 'Termos & Privacidade', icon: Scale },
      { path: '/admin/leads',         label: 'Leads & Contatos',     icon: Inbox },
      { path: '/admin/newsletter',    label: 'Newsletter',           icon: Mail },
      { path: '/admin/configuracoes', label: 'Configurações',        icon: Settings, badge: true },
    ],
  },
];

const allMenuItems = menuGroups.flatMap(g => g.items);
const FULL = 216;
const MINI = 56;

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, logout }            = useAuth();
  const { data }                    = useData();
  const navigate                    = useNavigate();
  const location                    = useLocation();

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  const currentPage = allMenuItems.find(item =>
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)
  );

  const sideW = collapsed ? MINI : FULL;
  const transition = 'width 280ms cubic-bezier(0.4,0,0.2,1)';

  // ── Nav item ─────────────────────────────────────────────────────────────────
  function NavItem({ item, mini }: { item: MenuItem; mini: boolean }) {
    const Icon = item.icon;
    const link = (
      <NavLink
        to={item.path}
        end={item.exact}
        className={({ isActive }) =>
          `flex items-center rounded-[9px] cursor-pointer select-none
           transition-all duration-150
           ${mini ? 'justify-center p-[9px]' : 'gap-3 px-3 py-[7.5px]'}
           ${isActive
             ? 'text-white'
             : 'text-white/35 hover:text-white/75 hover:bg-white/[0.05]'
           }`
        }
        style={({ isActive }) => isActive
          ? { background: 'linear-gradient(135deg,rgba(249,115,22,.9),rgba(220,85,10,.9))', boxShadow: '0 2px 10px rgba(249,115,22,.25),inset 0 1px 0 rgba(255,255,255,.1)' }
          : {}
        }
      >
        {({ isActive }) => (
          <>
            <Icon size={14} strokeWidth={isActive ? 2.2 : 1.8} className="flex-shrink-0" />
            {!mini && <span className="text-[12.5px] font-medium leading-none flex-1 truncate">{item.label}</span>}
            {!mini && item.badge && data && !(data.settings?.whatsapp_number && data.settings?.seo_site_name) && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
            )}
          </>
        )}
      </NavLink>
    );
    if (!mini) return link;
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={14}
          style={{ background: '#1c1f2b', color: 'rgba(255,255,255,.9)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, fontSize: 12, fontWeight: 500, padding: '5px 10px' }}>
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  // ── Sidebar ──────────────────────────────────────────────────────────────────
  function Sidebar({ mobile = false }: { mobile?: boolean }) {
    const mini = collapsed && !mobile;
    return (
      <TooltipProvider delayDuration={60}>
        <div className="h-full flex flex-col" style={{ background: '#101217', borderRight: '1px solid rgba(255,255,255,.06)' }}>

          {/* Logo */}
          <div className={`h-[58px] flex items-center flex-shrink-0 ${mini ? 'justify-center px-3' : 'px-4 gap-3'}`}
            style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 rounded-[10px] flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#f97316,#ea6010)', boxShadow: '0 4px 14px rgba(249,115,22,.4)' }}>
                <span className="font-black text-[15px] text-white leading-none">U</span>
              </div>
              <div className="absolute -bottom-px -right-px w-2.5 h-2.5 rounded-full bg-emerald-400"
                style={{ border: '2px solid #101217' }} />
            </div>
            {!mini && (
              <div className="flex-1 min-w-0">
                <span className="font-extrabold text-[13px] text-white block leading-none tracking-widest">UNIMAXX</span>
                <span className="text-[9px] font-medium mt-0.5 block" style={{ color: 'rgba(255,255,255,.22)', letterSpacing: '0.05em' }}>PAINEL DE CONTROLE</span>
              </div>
            )}
            {mobile && (
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg ml-auto" style={{ color: 'rgba(255,255,255,.28)' }}>
                <X size={15} />
              </button>
            )}
          </div>

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto py-2" style={{ scrollbarWidth: 'none' }}>
            {menuGroups.map((group, gi) => (
              <div key={gi} className={gi > 0 ? 'mt-0.5' : ''}>
                {!mini
                  ? <p className="px-4 pt-4 pb-1.5 text-[9px] font-bold" style={{ color: 'rgba(255,255,255,.18)', letterSpacing: '0.16em' }}>{group.label}</p>
                  : gi > 0 && <div className="mx-2.5 my-2" style={{ borderTop: '1px solid rgba(255,255,255,.06)' }} />
                }
                <div className={`${mini ? 'px-1.5' : 'px-2'} space-y-px`}>
                  {group.items.map(item => <NavItem key={item.path} item={item} mini={mini} />)}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,.06)' }}>
            <div className={`${mini ? 'px-1.5 pt-2 pb-1' : 'px-2 pt-2 pb-1'}`}>
              {mini ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => window.open('/', '_blank')}
                      className="flex items-center justify-center w-full p-[9px] rounded-[9px] transition-colors text-white/25 hover:text-white/65 hover:bg-white/[0.05]">
                      <Globe size={14} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={14}
                    style={{ background: '#1c1f2b', color: 'rgba(255,255,255,.9)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, fontSize: 12, padding: '5px 10px' }}>
                    Visualizar Site
                  </TooltipContent>
                </Tooltip>
              ) : (
                <button onClick={() => window.open('/', '_blank')}
                  className="flex items-center gap-2.5 px-3 py-[7px] w-full rounded-[9px] transition-colors text-white/28 hover:text-white/65 hover:bg-white/[0.04]">
                  <Globe size={13} className="flex-shrink-0" />
                  <span className="text-[12px] font-medium flex-1 text-left">Visualizar Site</span>
                  <ChevronRight size={11} className="opacity-25" />
                </button>
              )}
            </div>

            {!mini ? (
              <div className="px-3 pb-3 pt-1">
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-[10px]"
                  style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)' }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#f97316,#c2500a)' }}>
                    <User size={12} className="text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold truncate leading-none" style={{ color: 'rgba(255,255,255,.72)' }}>{user?.name || 'Administrador'}</p>
                    <p className="text-[9px] truncate mt-0.5" style={{ color: 'rgba(255,255,255,.24)' }}>{user?.email || ''}</p>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={handleLogout}
                        className="p-1 rounded-md transition-colors text-white/20 hover:text-red-400 hover:bg-red-500/10">
                        <LogOut size={12} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top"
                      style={{ background: '#1c1f2b', color: 'rgba(255,255,255,.9)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, fontSize: 11, padding: '4px 8px' }}>
                      Sair da conta
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            ) : (
              <div className="px-1.5 pb-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={handleLogout}
                      className="flex items-center justify-center w-full p-[9px] rounded-[9px] transition-colors text-white/22 hover:text-red-400 hover:bg-red-500/10">
                      <LogOut size={14} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={14}
                    style={{ background: '#1c1f2b', color: 'rgba(255,255,255,.9)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, fontSize: 12, padding: '5px 10px' }}>
                    Sair da conta
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <>
      <div className="min-h-screen flex bg-[#f0f2f5]" style={{ colorScheme: 'light' }}>

        {/* DESKTOP SIDEBAR — fixed */}
        <aside
          className="hidden lg:flex fixed inset-y-0 left-0 z-40 flex-col"
          style={{ width: sideW, transition }}
        >
          <Sidebar />
          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(v => !v)}
            className="absolute -right-3 top-[70px] w-6 h-6 rounded-full flex items-center justify-center z-50"
            style={{ background: '#f97316', boxShadow: '0 2px 8px rgba(249,115,22,.5)', border: '2px solid #101217' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.15)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
          >
            {collapsed ? <ChevronRight size={10} className="text-white" /> : <ChevronLeft size={10} className="text-white" />}
          </button>
        </aside>

        {/* MOBILE SIDEBAR */}
        <div
          className="fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-300"
          style={{ width: FULL, transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)' }}
        >
          <Sidebar mobile />
        </div>
        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden"
            style={{ background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(4px)' }}
            onClick={() => setMobileOpen(false)} />
        )}

        {/* MAIN — margin-left matches sidebar */}
        <div
          className="flex-1 flex flex-col min-w-0 min-h-screen"
          style={{ marginLeft: 0, paddingLeft: 0, transition: 'padding-left 280ms cubic-bezier(0.4,0,0.2,1)' }}
        >
          {/* The lg: margin is applied via inline style below */}
          <style>{`@media (min-width:1024px){.admin-main-wrap{margin-left:${sideW}px!important;transition:margin-left 280ms cubic-bezier(0.4,0,0.2,1);}}`}</style>

          <div className="admin-main-wrap flex flex-col flex-1">
            {/* TOP BAR */}
            <header
              className="h-[54px] flex items-center justify-between px-4 lg:px-5 flex-shrink-0 sticky top-0 z-30"
              style={{ background: 'rgba(255,255,255,.97)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(0,0,0,.07)', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}
            >
              <div className="flex items-center gap-3 flex-1">
                <button onClick={() => setMobileOpen(true)}
                  className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors">
                  <Menu size={18} />
                </button>
                {currentPage && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold hidden sm:block text-gray-400">Admin</span>
                    <ChevronRight size={11} className="hidden sm:block text-gray-300" />
                    <span className="text-[13px] font-bold text-gray-800">{currentPage.label}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button onClick={() => setSearchOpen(true)}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-lg transition-colors text-gray-400 hover:text-gray-600"
                  style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                  <Search size={13} /> Buscar
                  <kbd className="ml-1 text-[9px] px-1.5 py-0.5 rounded font-mono"
                    style={{ background: '#fff', border: '1px solid #e5e7eb', color: '#9ca3af' }}>⌘K</kbd>
                </button>

                <button onClick={() => window.open('/', '_blank')}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold rounded-lg transition-all"
                  style={{ color: '#f97316', background: '#fff7ed', border: '1px solid #fed7aa' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#ffedd5'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff7ed'; }}>
                  <Globe size={13} /> Ver Site
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-colors hover:bg-gray-100 ml-1">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg,#f97316,#c2500a)', boxShadow: '0 2px 6px rgba(249,115,22,.25)' }}>
                        <User size={13} className="text-white" />
                      </div>
                      <div className="hidden sm:block text-left">
                        <p className="text-[12px] font-bold leading-tight text-gray-800">{user?.name || 'Administrador'}</p>
                        <p className="text-[10px] leading-tight text-gray-400">{user?.email || ''}</p>
                      </div>
                      <ChevronDown size={13} className="text-gray-400" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 shadow-xl border-gray-200/80">
                    <div className="px-3 py-2.5 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-800">{user?.name || 'Administrador'}</p>
                      <p className="text-xs text-gray-400">{user?.email || ''}</p>
                    </div>
                    <DropdownMenuItem onClick={() => navigate('/admin/configuracoes')} className="gap-2 cursor-pointer">
                      <Settings size={14} className="text-gray-400" /> Configurações
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.open('/', '_blank')} className="gap-2 cursor-pointer">
                      <Globe size={14} className="text-gray-400" /> Ver Site
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="gap-2 cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50">
                      <LogOut size={14} /> Sair da conta
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>

            {/* PAGE CONTENT */}
            <main className="flex-1 p-4 lg:p-6 overflow-auto">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
