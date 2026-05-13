import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { SiteData, Solution, Segment, NumberStat, SiteContent, Banner, ClientLogo, Testimonial, Partner } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface DataContextType {
  data: SiteData;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  updateContent: (updates: SiteContent) => Promise<void>;
  updateSettings: (updates: Record<string, string>) => Promise<void>;
  updateSolution: (solution: Solution) => Promise<void>;
  deleteSolution: (id: string) => Promise<void>;
  updateSegment: (segment: Segment) => Promise<void>;
  deleteSegment: (id: string) => Promise<void>;
  addStat: (stat: NumberStat) => Promise<void>;
  updateStat: (stat: NumberStat) => Promise<void>;
  deleteStat: (id: string) => Promise<void>;
  addBanner: (banner: Banner) => Promise<number>;
  updateBanner: (banner: Banner) => Promise<void>;
  deleteBanner: (id: number) => Promise<void>;
  getBannersByPage: (page: string) => Banner[];
  uploadImage: (file: File) => Promise<string>;
  // Client Logos
  saveClientLogo: (logo: Partial<ClientLogo>) => Promise<void>;
  deleteClientLogo: (id: number) => Promise<void>;
  // Testimonials
  saveTestimonial: (t: Partial<Testimonial>) => Promise<void>;
  deleteTestimonial: (id: number) => Promise<void>;
  // Partners
  savePartner: (p: Partial<Partner>) => Promise<void>;
  deletePartner: (id: number) => Promise<void>;
}

const CACHE_KEY = 'site_data_cache';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutos (fresh)

const defaultData: SiteData = {
  content: {},
  solutions: [],
  segments: [],
  stats: [],
  banners: [],
  settings: {},
  client_logos: [],
  testimonials: [],
  partners: [],
  nav_pages: [],
};

/** Lê o cache — retorna dados independente da idade (stale-while-revalidate) */
function loadCache(): { data: SiteData; fresh: boolean } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    return { data: data as SiteData, fresh: Date.now() - ts < CACHE_TTL };
  } catch {
    return null;
  }
}

function saveCache(data: SiteData) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
  } catch { }
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const cached = loadCache();
  // Se há cache (mesmo antigo) → mostra imediatamente, sem loading
  const [data, setData] = useState<SiteData>(cached?.data ?? defaultData);
  const [loading, setLoading] = useState(cached === null); // só mostra skeleton se não tem NADA no cache
  const [error, setError] = useState<string | null>(null);

  // silent=true → atualiza em background sem travar a tela (stale-while-revalidate)
  const fetchData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');

      // ==============================
      // SE ESTIVER LOGADO → ADMIN
      // ==============================
      if (token) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);
        try {
          const res = await fetch(`${API_URL}/admin/all-data`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
          });
          clearTimeout(timeout);
          if (!res.ok) throw new Error('Erro ao carregar dados admin');
          const adminData = await res.json();
          setData(adminData);
          saveCache(adminData);
          return;
        } catch (err: any) {
          clearTimeout(timeout);
          if (err?.name === 'AbortError') {
            throw new Error('Timeout: backend não respondeu em 6 segundos');
          }
          throw err;
        }
      }

      // ==============================
      // SE NÃO ESTIVER LOGADO → PÚBLICO
      // ==============================
      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 8000);
      try {
        const res = await fetch(`${API_URL}/public-data`, { signal: ctrl.signal });
        clearTimeout(timeout);
        if (!res.ok) throw new Error('Erro ao carregar dados públicos');
        const publicData = await res.json();
        const newData = {
          content: publicData.content ?? {},
          solutions: publicData.solutions ?? [],
          segments: publicData.segments ?? [],
          stats: publicData.stats ?? [],
          banners: publicData.banners ?? [],
          settings: publicData.settings ?? {},
          client_logos: publicData.client_logos ?? [],
          testimonials: publicData.testimonials ?? [],
          partners: publicData.partners ?? [],
          nav_pages: publicData.nav_pages ?? [],
        };
        setData(newData);
        saveCache(newData);
      } catch (err: any) {
        clearTimeout(timeout);
        if (err?.name === 'AbortError') throw new Error('Timeout: backend não respondeu em 8 segundos');
        throw err;
      }

    } catch (err: any) {
      // Em modo silencioso (revalidação) não mostra erro — mantém dados do cache
      if (!silent) {
        const msg = err?.name === 'AbortError' || err?.message?.includes('fetch')
          ? 'Backend indisponível. Verifique se o servidor está rodando.'
          : 'Erro ao carregar dados';
        console.warn('DataContext:', err?.message || err);
        setError(msg);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const refreshData = async () => {
    // Invalida cache para garantir dados frescos
    try { localStorage.removeItem(CACHE_KEY); } catch { }
    await fetchData(false);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // ===============================
  // SEGMENTS (CORRIGIDO AQUI)
  // ===============================

  const updateSegment = async (segment: Segment) => {
    const isNew = !data.segments.some(
      (s) => s.segment_id === segment.segment_id
    );

    const url = isNew
      ? `${API_URL}/admin/segments`
      : `${API_URL}/admin/segments/${segment.segment_id}`;

    const method = isNew ? 'POST' : 'PUT';

    const res = await fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: JSON.stringify(segment)
    });

    if (!res.ok) throw new Error('Erro ao salvar segmento');

    await refreshData();
  };

  const deleteSegment = async (id: string) => {
    const res = await fetch(`${API_URL}/admin/segments/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });

    if (!res.ok) throw new Error('Erro ao excluir segmento');

    await refreshData();
  };

  // ===============================
  // RESTO DO SISTEMA (INALTERADO)
  // ===============================

  const updateContent = async (updates: SiteContent) => {
    const res = await fetch(`${API_URL}/admin/content`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Erro ao atualizar conteúdo');
    await refreshData();
  };

  const updateSettings = async (updates: Record<string, string>) => {
    const res = await fetch(`${API_URL}/admin/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Erro ao atualizar configurações');
    await refreshData();
  };

  const updateSolution = async (solution: Solution) => {
    const res = await fetch(`${API_URL}/admin/solutions/${solution.solution_id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(solution)
    });
    if (!res.ok) throw new Error('Erro ao atualizar solução');
    await refreshData();
  };

  const deleteSolution = async (id: string) => {
    const res = await fetch(`${API_URL}/admin/solutions/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!res.ok) throw new Error('Erro ao excluir solução');
    await refreshData();
  };

  const addStat = async (stat: NumberStat) => {
    const res = await fetch(`${API_URL}/admin/stats`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(stat)
    });
    if (!res.ok) throw new Error('Erro ao adicionar estatística');
    await refreshData();
  };

  const updateStat = async (stat: NumberStat) => {
    const res = await fetch(`${API_URL}/admin/stats/${stat.stat_id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(stat)
    });
    if (!res.ok) throw new Error('Erro ao atualizar estatística');
    await refreshData();
  };

  const deleteStat = async (id: string) => {
    const res = await fetch(`${API_URL}/admin/stats/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!res.ok) throw new Error('Erro ao excluir estatística');
    await refreshData();
  };

  const addBanner = async (banner: Banner) => {
    const res = await fetch(`${API_URL}/admin/banners`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(banner)
    });
    if (!res.ok) throw new Error('Erro ao adicionar banner');
    const json = await res.json();
    await refreshData();
    return json.id as number;
  };

  const updateBanner = async (banner: Banner) => {
    const res = await fetch(`${API_URL}/admin/banners/${banner.id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(banner)
    });
    if (!res.ok) throw new Error('Erro ao atualizar banner');
    await refreshData();
  };

  const deleteBanner = async (id: number) => {
    const res = await fetch(`${API_URL}/admin/banners/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'Erro ao excluir banner');
    }
    // Só atualiza o estado APÓS confirmação do backend
    setData(prev => ({ ...prev, banners: prev.banners.filter(b => b.id !== id) }));
  };

  const getBannersByPage = (page: string): Banner[] => {
    const token = localStorage.getItem('token');
    // Admin: vê todos (incluindo sem título, para edição)
    // Público: só ativos com título preenchido
    return data.banners.filter(b =>
      (b.page || 'home') === page &&
      (token ? true : (b.active === 1 && (!!b.title?.trim() || !!b.image)))
    );
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${API_URL}/admin/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: formData
    });

    if (!res.ok) throw new Error('Erro ao fazer upload');

    const data = await res.json();
    return data.url;
  };

  // ===============================
  // CLIENT LOGOS
  // ===============================
  const saveClientLogo = async (logo: Partial<ClientLogo>) => {
    const method = logo.id ? 'PUT' : 'POST';
    const url = logo.id ? `${API_URL}/admin/client-logos/${logo.id}` : `${API_URL}/admin/client-logos`;
    const res = await fetch(url, { method, headers: getAuthHeaders(), body: JSON.stringify(logo) });
    if (!res.ok) throw new Error('Erro ao salvar logo');
    await refreshData();
  };
  const deleteClientLogo = async (id: number) => {
    const res = await fetch(`${API_URL}/admin/client-logos/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
    if (!res.ok) throw new Error('Erro ao excluir logo');
    await refreshData();
  };

  // ===============================
  // TESTIMONIALS
  // ===============================
  const saveTestimonial = async (t: Partial<Testimonial>) => {
    const method = t.id ? 'PUT' : 'POST';
    const url = t.id ? `${API_URL}/admin/testimonials/${t.id}` : `${API_URL}/admin/testimonials`;
    const res = await fetch(url, { method, headers: getAuthHeaders(), body: JSON.stringify(t) });
    if (!res.ok) throw new Error('Erro ao salvar depoimento');
    await refreshData();
  };
  const deleteTestimonial = async (id: number) => {
    const res = await fetch(`${API_URL}/admin/testimonials/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
    if (!res.ok) throw new Error('Erro ao excluir depoimento');
    await refreshData();
  };

  // ===============================
  // PARTNERS
  // ===============================
  const savePartner = async (p: Partial<Partner>) => {
    const method = p.id ? 'PUT' : 'POST';
    const url = p.id ? `${API_URL}/admin/partners/${p.id}` : `${API_URL}/admin/partners`;
    const res = await fetch(url, { method, headers: getAuthHeaders(), body: JSON.stringify(p) });
    if (!res.ok) throw new Error('Erro ao salvar parceiro');
    await refreshData();
  };
  const deletePartner = async (id: number) => {
    const res = await fetch(`${API_URL}/admin/partners/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
    if (!res.ok) throw new Error('Erro ao excluir parceiro');
    await refreshData();
  };

  useEffect(() => {
    const entry = loadCache();
    if (!entry) {
      // Primeira visita: sem cache → mostra loading normalmente
      fetchData(false);
    } else if (!entry.fresh) {
      // Cache existe mas está velho → mostra imediatamente + revalida em background
      fetchData(true);
    }
    // Cache fresco → não faz nada, os dados já estão no state
  }, []);

  return (
    <DataContext.Provider value={{
      data,
      loading,
      error,
      refreshData,
      updateContent,
      updateSettings,
      updateSolution,
      deleteSolution,
      updateSegment,
      deleteSegment,
      addStat,
      updateStat,
      deleteStat,
      addBanner,
      updateBanner,
      deleteBanner,
      getBannersByPage,
      uploadImage,
      saveClientLogo,
      deleteClientLogo,
      saveTestimonial,
      deleteTestimonial,
      savePartner,
      deletePartner,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}