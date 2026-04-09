import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { Header } from '@/sections/Header';
import { Footer } from '@/sections/Footer';
import type { GenericPage, PageBlock } from '@/types';
import { BlockRenderer, DEFAULT_T } from '@/pages/BlockRenderer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function GenericPageView() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<GenericPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!slug) { setError('Slug não informado'); setLoading(false); return; }
    try {
      setLoading(true); setError(null);
      const res = await fetch(`${API_URL}/pages/${encodeURIComponent(slug)}`);
      if (res.status === 404) throw new Error('Página não encontrada');
      if (!res.ok) throw new Error('Erro ao carregar página');
      const data = await res.json();
      const parseArr = (v: any): any[] => {
        if (!v) return [];
        try { return typeof v === 'string' ? JSON.parse(v) : v; } catch { return []; }
      };
      setPage({ ...data, is_active: !!data.is_active, blocks_json: parseArr(data.blocks_json) });
    } catch (e) { setError(e instanceof Error ? e.message : 'Erro'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [slug]);
  useEffect(() => {
    if (page) document.title = page.meta_title || `${page.title} | Unimaxx`;
    return () => { document.title = 'Unimaxx'; };
  }, [page]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-gray-200 animate-spin" style={{ borderTopColor: '#f97316' }} />
        <p className="text-gray-400 text-sm">Carregando...</p>
      </div>
    </div>
  );

  if (error || !page) return (
    <><Header />
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: "'Outfit',sans-serif" }}>Página não encontrada</h1>
          <p className="text-gray-400 mb-8">{error}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
            <button onClick={load} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-medium" style={{ background: '#f97316' }}>
              <RefreshCw className="w-4 h-4" /> Tentar novamente
            </button>
          </div>
        </div>
      </div>
      <Footer /></>
  );

  const blocks = page.blocks_json.filter((b: PageBlock) => b.visible);

  return (
    <div className="min-h-screen bg-[#f5f5f7]" style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <Header />
      {blocks.length > 0
        ? blocks.map((block: PageBlock) => <BlockRenderer key={block.id} block={block} t={DEFAULT_T} />)
        : (
          <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="text-center max-w-md">
              <p className="text-6xl mb-6">🏗️</p>
              <h2 className="text-xl font-bold text-[#1d1d1f] mb-2" style={{ fontFamily: "'Outfit',sans-serif" }}>Página em construção</h2>
              <p className="text-[#6e6e73]">Esta página ainda não tem conteúdo publicado.</p>
            </div>
          </div>
        )
      }
      <Footer />
    </div>
  );
}
