import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { Header } from '@/sections/Header';
import { Footer } from '@/sections/Footer';
import { fetchSolutionPageBySlug } from '@/services/solutionPagesService';
import type { SolutionPage, PageBlock } from '@/types';
import { BlockRenderer, THEME } from '@/pages/BlockRenderer';

export default function SolutionPageDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<SolutionPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!slug) { setError('Slug não informado'); setLoading(false); return; }
    try { setLoading(true); setError(null); setPage(await fetchSolutionPageBySlug(slug)); }
    catch (e) { setError(e instanceof Error ? e.message : 'Erro'); }
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
          <h1 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: "'Outfit',sans-serif" }}>Solução não encontrada</h1>
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

  const t = THEME[page.color_theme] || THEME.orange;
  const blocks: PageBlock[] = Array.isArray(page.blocks_json)
    ? page.blocks_json.filter((b: PageBlock) => b.visible)
    : [];

  return (
    <div className="min-h-screen bg-[#f5f5f7]" style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <Header />
      {blocks.length > 0
        ? blocks.map((block) => <BlockRenderer key={block.id} block={block} t={t} />)
        : (
          <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="text-center max-w-md">
              <p className="text-6xl mb-6">🏗️</p>
              <h2 className="text-xl font-bold text-[#1d1d1f] mb-2" style={{ fontFamily: "'Outfit',sans-serif" }}>Página sem conteúdo</h2>
              <p className="text-[#6e6e73] mb-6">Esta solução ainda não tem blocos configurados.</p>
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition mx-auto">
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
            </div>
          </div>
        )
      }
      <Footer />
    </div>
  );
}
