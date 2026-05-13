import { useEffect, lazy, Suspense } from 'react';
import { useTracker } from '@/hooks/useTracker';
import { useScrollAnimations } from '@/hooks/useScrollAnimations';
import type React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { WhatsAppWidget } from '@/components/WhatsAppWidget';
import { AnnouncementPopup } from '@/components/AnnouncementPopup';
import { CookieConsent } from '@/components/CookieConsent';
import { ScrollProgress } from '@/components/ScrollProgress';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { DataProvider, useData } from '@/context/DataContext';
import { Toaster } from '@/components/ui/sonner';

// ── Seções da home (carregadas imediatamente — críticas para LCP) ─────────
import { Header } from '@/sections/Header';
import { Hero } from '@/sections/Hero';
import { QuickLinks } from '@/sections/QuickLinks';
import { Solutions } from '@/sections/Solutions';
import { Numbers } from '@/sections/Numbers';
import { Segments } from '@/sections/Segments';
import { Differentials } from '@/sections/Differentials';
import { ClientLogos } from '@/sections/ClientLogos';
import { Testimonials } from '@/sections/Testimonials';
import { Partners } from '@/sections/Partners';
import { Contact } from '@/sections/Contact';
import { Footer } from '@/sections/Footer';
import { HomeHighlight } from '@/sections/HomeHighlight';
import { parseLayout } from '@/admin/PageLayoutManager';

// ── Páginas públicas secundárias (lazy — carregadas só quando acessadas) ──
const Solucoes         = lazy(() => import('./pages/Solucoes'));
const SolucaoDetalhe   = lazy(() => import('./pages/SolucaoDetalhe'));
const Segmentos        = lazy(() => import('./pages/Segmentos'));
const Sobre            = lazy(() => import('./pages/Sobre'));
const Carreiras        = lazy(() => import('./pages/Carreiras'));
const Blog             = lazy(() => import('./pages/Blog'));
const Imprensa         = lazy(() => import('./pages/Imprensa'));
const HelpCenter       = lazy(() => import('./pages/HelpCenter'));
const Cliente          = lazy(() => import('./pages/Cliente'));
const Privacidade      = lazy(() => import('./pages/Privacidade'));
const Termos           = lazy(() => import('./pages/Termos'));
const NotFound         = lazy(() => import('./pages/NotFound'));
const SolutionPageDetail = lazy(() => import('@/pages/SolutionPageDetail'));
const GenericPageView  = lazy(() => import('@/pages/GenericPageView'));
const PreviewView      = lazy(() => import('@/pages/PreviewView'));

// ── Admin (lazy — NUNCA carregado por visitantes públicos) ────────────────
const Login                = lazy(() => import('@/admin/Login').then(m => ({ default: m.Login })));
const AdminLayout          = lazy(() => import('@/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const Dashboard            = lazy(() => import('@/admin/Dashboard').then(m => ({ default: m.Dashboard })));
const ContentManager       = lazy(() => import('@/admin/ContentManager').then(m => ({ default: m.ContentManager })));
const UnifiedSolutionsManager = lazy(() => import('@/admin/UnifiedSolutionsManager'));
const InstitucionalManager = lazy(() => import('@/admin/InstitucionalManager').then(m => ({ default: m.InstitucionalManager })));
const LeadsManager         = lazy(() => import('@/admin/LeadsManager').then(m => ({ default: m.LeadsManager })));
const LegalManager         = lazy(() => import('@/admin/LegalManager').then(m => ({ default: m.LegalManager })));
const NewsletterManager    = lazy(() => import('@/admin/NewsletterManager').then(m => ({ default: m.NewsletterManager })));
const StatsManager         = lazy(() => import('@/admin/StatsManager').then(m => ({ default: m.StatsManager })));
const BannersManager       = lazy(() => import('@/admin/BannersManager').then(m => ({ default: m.BannersManager })));
const AdminSettings        = lazy(() => import('@/admin/Settings').then(m => ({ default: m.Settings })));
const QuickLinksManager    = lazy(() => import('@/admin/QuickLinksManager').then(m => ({ default: m.QuickLinksManager })));
const DifferentialsManager = lazy(() => import('@/admin/DifferentialsManager').then(m => ({ default: m.DifferentialsManager })));
const HelpCenterManager    = lazy(() => import('@/admin/HelpCenterManager').then(m => ({ default: m.HelpCenterManager })));
const ClientLogosManager   = lazy(() => import('@/admin/ClientLogosManager').then(m => ({ default: m.ClientLogosManager })));
const TestimonialsManager  = lazy(() => import('@/admin/TestimonialsManager').then(m => ({ default: m.TestimonialsManager })));
const PartnersManager      = lazy(() => import('@/admin/PartnersManager').then(m => ({ default: m.PartnersManager })));
const TrashManager         = lazy(() => import('@/admin/TrashManager').then(m => ({ default: m.TrashManager })));
const PageLayoutManager    = lazy(() => import('@/admin/PageLayoutManager').then(m => ({ default: m.PageLayoutManager })));
const GenericPagesManager  = lazy(() => import('@/admin/GenericPagesManager').then(m => ({ default: m.GenericPagesManager })));
const HomeEditor           = lazy(() => import('@/admin/HomeEditor').then(m => ({ default: m.HomeEditor })));
const AnalyticsDashboard   = lazy(() => import('@/admin/AnalyticsDashboard'));
const RedirectsManager     = lazy(() => import('@/admin/RedirectsManager').then(m => ({ default: m.RedirectsManager })));
const MediaLibraryPage     = lazy(() => import('@/admin/MediaLibrary'));

// Spinner usado pelo Suspense
function PageSpinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #fed7aa', borderTopColor: '#f97316', animation: 'spin 0.7s linear infinite' }} />
    </div>
  );
}

const SECTION_COMPONENTS: Record<string, React.ComponentType> = {
  hero: Hero,
  home_highlight: HomeHighlight,
  client_logos: ClientLogos,
  quicklinks: QuickLinks,
  solutions: Solutions,
  numbers: Numbers,
  segments: Segments,
  differentials: Differentials,
  testimonials: Testimonials,
  partners: Partners,
  contact: Contact,
};

function HomePage() {
  const { data } = useData();
  const layout = parseLayout(data.settings?.home_layout);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {layout
          .filter((slot) => slot.visible)
          .sort((a, b) => a.order - b.order)
          .map((slot) => {
            const Component = SECTION_COMPONENTS[slot.id];
            if (!Component) return null;
            return <Component key={slot.id} />;
          })}
      </main>
      <Footer />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-orange-200 border-t-orange-500 animate-spin" />
          <p className="text-gray-500 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

function MaintenancePage() {
  const { data } = useData();
  const title = data.settings?.maintenance_title || 'Site em manutenção';
  const message = data.settings?.maintenance_message || 'Estamos atualizando o site para melhorar sua experiência. Voltamos em breve.';
  const until = data.settings?.maintenance_until;

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'linear-gradient(135deg, #111827 0%, #0f172a 100%)' }}>
      <div className="max-w-2xl w-full rounded-[32px] border p-8 sm:p-10 text-white" style={{ borderColor: 'rgba(255,255,255,.12)', background: 'rgba(255,255,255,.04)', boxShadow: '0 24px 60px rgba(0,0,0,.28)', backdropFilter: 'blur(16px)' }}>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] mb-6" style={{ background: 'rgba(249,115,22,.14)', color: '#fdba74', border: '1px solid rgba(249,115,22,.28)' }}>
          <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
          Manutenção ativa
        </div>
        <h1 className="text-3xl sm:text-4xl font-black mb-4" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.04em' }}>{title}</h1>
        <p className="text-base sm:text-lg" style={{ color: 'rgba(255,255,255,.72)', lineHeight: 1.8 }}>{message}</p>
        {until && (
          <div className="mt-6 rounded-2xl px-4 py-3 text-sm" style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', color: 'rgba(255,255,255,.82)' }}>
            <strong className="text-white">Previsão de retorno:</strong> {new Date(until).toLocaleString('pt-BR')}
          </div>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="/admin/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', boxShadow: '0 12px 30px rgba(249,115,22,.24)' }}>
            Acesso administrativo
          </a>
        </div>
      </div>
    </div>
  );
}

function isMaintenanceEnabled(settings: Record<string, string> | undefined) {
  if (!settings || settings.maintenance_mode !== '1') return false;
  const until = settings.maintenance_until;
  if (!until) return true;
  const untilDate = new Date(until);
  if (Number.isNaN(untilDate.getTime())) return true;
  return untilDate.getTime() > Date.now();
}

function AnalyticsInjector() {
  const { data } = useData();
  const gid = data?.settings?.analytics_id;
  const fontH = data?.settings?.font_heading || 'Outfit';
  const fontB = data?.settings?.font_body || 'DM Sans';

  // ── Fontes ──────────────────────────────────────────
  useEffect(() => {
    const fontNames = [...new Set([fontH, fontB])].join('&family=');
    const linkId = 'dynamic-fonts';
    const existing = document.getElementById(linkId);
    const href = `https://fonts.googleapis.com/css2?family=${fontNames.replace(/ /g, '+')}:wght@300;400;500;600;700;800;900&display=swap`;
    if (existing) { (existing as HTMLLinkElement).href = href; }
    else {
      const link = document.createElement('link');
      link.id = linkId; link.rel = 'stylesheet'; link.href = href;
      document.head.appendChild(link);
    }
    document.documentElement.style.setProperty('--font-heading', `'${fontH}', sans-serif`);
    document.documentElement.style.setProperty('--font-body', `'${fontB}', sans-serif`);
  }, [fontH, fontB]);

  // ── Cores principais ────────────────────────────────
  const pc = data?.settings?.primary_color;
  useEffect(() => {
    if (pc) {
      document.documentElement.style.setProperty('--primary', pc);
      document.documentElement.style.setProperty('--orange', pc);
    }
  }, [pc]);

  // ── Tipografia avançada ─────────────────────────────
  const s = data?.settings || {};
  useEffect(() => {
    const set = (v: string, val: string) => document.documentElement.style.setProperty(v, val);

    // Cores de texto
    if (s.typo_h_color)     set('--typo-h-color',     s.typo_h_color);
    else document.documentElement.style.removeProperty('--typo-h-color');

    if (s.typo_body_color)  set('--typo-body-color',  s.typo_body_color);
    else document.documentElement.style.removeProperty('--typo-body-color');

    if (s.typo_label_color) set('--typo-label-color', s.typo_label_color);
    else document.documentElement.style.removeProperty('--typo-label-color');

    // Peso e espaçamento
    set('--typo-h-weight',  s.typo_h_weight  || '800');
    set('--typo-body-size', `${s.typo_body_size || '15'}px`);
    set('--typo-body-lh',   s.typo_body_lh   || '1.65');
    set('--typo-h-spacing', `${(parseInt(s.typo_h_spacing || '-3') / 100).toFixed(3)}em`);
    set('--typo-h-scale',   `${(parseInt(s.typo_h_scale || '100') / 100).toFixed(2)}`);
  }, [
    s.typo_h_color, s.typo_body_color, s.typo_label_color,
    s.typo_h_weight, s.typo_body_size, s.typo_body_lh,
    s.typo_h_spacing, s.typo_h_scale,
  ]);

  useEffect(() => {
    if (!gid) return;
    if (document.getElementById('ga-script')) return;
    const s = document.createElement('script');
    s.id = 'ga-script';
    s.src = `https://www.googletagmanager.com/gtag/js?id=${gid}`;
    s.async = true;
    document.head.appendChild(s);
    const i = document.createElement('script');
    i.id = 'ga-init';
    i.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gid}');`;
    document.head.appendChild(i);
  }, [gid]);
  return null;
}

function AppRoutes() {
  const location = useLocation();
  const { data } = useData();
  const { isAuthenticated } = useAuth();
  useTracker();
  useScrollAnimations();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const maintenanceActive = isMaintenanceEnabled(data.settings);
  const showMaintenance = maintenanceActive && !isAdminRoute && !isAuthenticated;
  const publicFallback = showMaintenance ? <MaintenancePage /> : <NotFound />;

  return (
    <div className={!isAdminRoute ? 'page-transition' : undefined}>
      <Suspense fallback={<PageSpinner />}>
      <Routes location={location}>
        <Route path="/" element={showMaintenance ? <MaintenancePage /> : <HomePage />} />
        <Route path="/solucoes" element={showMaintenance ? <MaintenancePage /> : <Solucoes />} />
        <Route path="/solucao/:id" element={showMaintenance ? <MaintenancePage /> : <SolucaoDetalhe />} />
        <Route path="/solucao-page/:slug" element={showMaintenance ? <MaintenancePage /> : <SolutionPageDetail />} />
        <Route path="/p/:slug" element={showMaintenance ? <MaintenancePage /> : <GenericPageView />} />
        <Route path="/preview/:token" element={<PreviewView />} />
        <Route path="/segmentos" element={showMaintenance ? <MaintenancePage /> : <Segmentos />} />
        <Route path="/sobre" element={showMaintenance ? <MaintenancePage /> : <Sobre />} />
        <Route path="/carreiras" element={showMaintenance ? <MaintenancePage /> : <Carreiras />} />
        <Route path="/imprensa" element={showMaintenance ? <MaintenancePage /> : <Imprensa />} />
        <Route path="/blog" element={showMaintenance ? <MaintenancePage /> : <Blog />} />
        <Route path="/suporte" element={showMaintenance ? <MaintenancePage /> : <HelpCenter />} />
        <Route path="/ajuda" element={showMaintenance ? <MaintenancePage /> : <HelpCenter />} />
        <Route path="/cliente" element={showMaintenance ? <MaintenancePage /> : <Cliente />} />
        <Route path="/privacidade" element={showMaintenance ? <MaintenancePage /> : <Privacidade />} />
        <Route path="/termos" element={showMaintenance ? <MaintenancePage /> : <Termos />} />

        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="home" element={<HomeEditor />} />
          <Route path="conteudo" element={<ContentManager />} />
          <Route path="solucoes" element={<UnifiedSolutionsManager />} />
          <Route path="estatisticas" element={<StatsManager />} />
          <Route path="banners" element={<BannersManager />} />
          <Route path="configuracoes" element={<AdminSettings />} />
          <Route path="links-rapidos" element={<QuickLinksManager />} />
          <Route path="diferenciais" element={<DifferentialsManager />} />
          <Route path="central-ajuda" element={<HelpCenterManager />} />
          <Route path="logos-clientes" element={<ClientLogosManager />} />
          <Route path="depoimentos" element={<TestimonialsManager />} />
          <Route path="parceiros" element={<PartnersManager />} />
          <Route path="lixeira" element={<TrashManager />} />
          <Route path="layout" element={<PageLayoutManager />} />
          <Route path="paginas" element={<GenericPagesManager />} />
          <Route path="institucional" element={<InstitucionalManager />} />
          <Route path="leads" element={<LeadsManager />} />
          <Route path="newsletter" element={<NewsletterManager />} />
          <Route path="legal" element={<LegalManager />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="redirects" element={<RedirectsManager />} />
          <Route path="midia" element={<MediaLibraryPage open={true} onClose={() => {}} />} />
        </Route>

        <Route path="*" element={isAdminRoute ? <NotFound /> : publicFallback} />
      </Routes>
      </Suspense>
      <AnalyticsInjector />
      {!showMaintenance && (
        <>
          <WhatsAppWidget />
          <AnnouncementPopup />
          <CookieConsent />
          <ScrollProgress />
        </>
      )}
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
