import { useState, useEffect } from 'react';
import type React from 'react';

import {
  Search, ChevronRight, AlertCircle, Loader,
  BookOpen, Settings, DollarSign, Zap, HelpCircle, Users, ArrowLeft,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Header } from '@/sections/Header';
import { Footer } from '@/sections/Footer';
import { PageBanner } from '@/components/PageBanner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const BASE_URL = API_URL.replace('/api', '');

interface HelpCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  order_position: number;
}

interface HelpArticle {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  category_name: string;
  category_slug: string;
  views: number;
}

interface HelpArticleDetail extends HelpArticle {
  content: string;
  youtube_url: string;
  images: Array<{ id: number; image_path: string; alt_text: string }>;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  BookOpen:   <BookOpen size={24} />,
  Settings:   <Settings size={24} />,
  DollarSign: <DollarSign size={24} />,
  Zap:        <Zap size={24} />,
  HelpCircle: <HelpCircle size={24} />,
  Users:      <Users size={24} />,
};

// Converte qualquer URL do YouTube para embed
function toEmbedUrl(url: string): string {
  if (!url) return '';
  if (url.includes('/embed/')) return url;
  const short = url.match(/youtu\.be\/([^?&]+)/);
  if (short) return `https://www.youtube.com/embed/${short[1]}`;
  const watch = url.match(/[?&]v=([^&]+)/);
  if (watch) return `https://www.youtube.com/embed/${watch[1]}`;
  return url;
}

export default function HelpCenter() {
  const [categories, setCategories]             = useState<HelpCategory[]>([]);
  const [articles, setArticles]                 = useState<HelpArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory | null>(null);
  const [selectedArticle, setSelectedArticle]   = useState<HelpArticleDetail | null>(null);
  const [searchTerm, setSearchTerm]             = useState('');
  const [searchResults, setSearchResults]       = useState<HelpArticle[]>([]);
  const [loading, setLoading]                   = useState(true);
  const [articleLoading, setArticleLoading]     = useState(false);
  const [searching, setSearching]               = useState(false);
  const [view, setView]                         = useState<'categories' | 'articles' | 'article' | 'search'>('categories');

  // ── Buscar categorias ──────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/help/categories`);
        if (res.ok) setCategories(await res.json());
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  // ── Buscar artigos da categoria ────────────────────────────────────────────
  useEffect(() => {
    if (!selectedCategory) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/help/categories/${selectedCategory.slug}/articles`);
        if (res.ok) setArticles(await res.json());
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [selectedCategory]);

  // ── Busca com debounce ─────────────────────────────────────────────────────
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      if (view === 'search') setView(selectedArticle ? 'article' : selectedCategory ? 'articles' : 'categories');
      return;
    }
    setView('search');
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`${API_URL}/help/search?q=${encodeURIComponent(searchTerm)}`);
        if (res.ok) setSearchResults(await res.json());
      } catch (e) { console.error(e); }
      finally { setSearching(false); }
    }, 350);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // ── Abrir artigo ───────────────────────────────────────────────────────────
  const openArticle = async (slug: string) => {
    setArticleLoading(true);
    try {
      const res = await fetch(`${API_URL}/help/articles/${slug}`);
      if (res.ok) {
        setSelectedArticle(await res.json());
        setView('article');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (e) { console.error(e); }
    finally { setArticleLoading(false); }
  };

  const goToCategory = (cat: HelpCategory) => {
    setSelectedCategory(cat);
    setSearchTerm('');
    setSearchResults([]);
    setSelectedArticle(null);
    setView('articles');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToCategories = () => {
    setSelectedCategory(null);
    setArticles([]);
    setSelectedArticle(null);
    setSearchTerm('');
    setView('categories');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBackFromArticle = () => {
    setSelectedArticle(null);
    if (searchTerm.length >= 2) { setView('search'); }
    else if (selectedCategory)  { setView('articles'); }
    else                        { setView('categories'); }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Hero fallback ──────────────────────────────────────────────────────────
  const heroFallback = (
    <section className="relative py-32 bg-[#1d1d1f] overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-600 rounded-full blur-3xl" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="inline-block px-4 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm font-medium mb-6 border border-orange-500/30">
          Central de Ajuda
        </span>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
          Como podemos <span className="text-orange-400">ajudar?</span>
        </h1>
        <p className="text-xl text-slate-300 max-w-3xl mx-auto">
          Encontre respostas, tutoriais e suporte para todas as nossas soluções.
        </p>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <PageBanner page="suporte" fallback={heroFallback} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* ── Barra de busca ── */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={22} />
            <Input
              placeholder="Buscar artigos, tutoriais, dúvidas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-14 h-16 text-lg bg-white border-slate-200 focus:border-orange-500 focus:ring-orange-200 rounded-2xl shadow-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >✕</button>
            )}
          </div>
        </div>

        {/* ══ SEARCH ══════════════════════════════════════════════════════════ */}
        {view === 'search' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-slate-900">
              Resultados para: <span className="text-orange-600">"{searchTerm}"</span>
            </h2>

            {searching ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="animate-spin text-orange-500" size={32} />
              </div>
            ) : searchResults.length === 0 ? (
              <Card className="p-8 text-center bg-white border-slate-200">
                <AlertCircle className="mx-auto text-slate-400 mb-2" size={32} />
                <p className="text-slate-600">Nenhum resultado para "{searchTerm}"</p>
              </Card>
            ) : searchResults.map(article => (
              <button key={article.id} onClick={() => openArticle(article.slug)} className="w-full text-left group">
                <Card className="p-6 bg-white border-slate-200 hover:shadow-lg hover:border-orange-400 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                          {article.title}
                        </h3>
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                          {article.category_name}
                        </span>
                      </div>
                      <p className="text-slate-500 text-sm">{article.short_description}</p>
                    </div>
                    <ChevronRight className="text-slate-400 group-hover:text-orange-500 flex-shrink-0 mt-1" size={20} />
                  </div>
                </Card>
              </button>
            ))}
          </div>
        )}

        {/* ══ CATEGORIES ══════════════════════════════════════════════════════ */}
        {view === 'categories' && (
          loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader className="animate-spin text-orange-500" size={36} />
            </div>
          ) : categories.length === 0 ? (
            <Card className="p-8 text-center bg-white border-slate-200 max-w-md mx-auto">
              <AlertCircle className="mx-auto text-slate-400 mb-2" size={32} />
              <p className="text-slate-600">Nenhuma categoria disponível</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map(cat => (
                <button key={cat.id} onClick={() => goToCategory(cat)} className="text-left group">
                  <Card className="h-full p-8 bg-white border-slate-200 hover:shadow-xl hover:border-orange-400 transition-all duration-200">
                    <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mb-6 group-hover:bg-orange-600 group-hover:text-white transition-all duration-200">
                      {ICON_MAP[cat.icon] || <HelpCircle size={24} />}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-slate-500 text-sm mb-4 leading-relaxed">{cat.description}</p>
                    <div className="flex items-center text-orange-600 font-semibold text-sm">
                      Ver artigos
                      <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                </button>
              ))}
            </div>
          )
        )}

        {/* ══ ARTICLES LIST ═══════════════════════════════════════════════════ */}
        {view === 'articles' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <button onClick={goToCategories} className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium transition-colors">
              <ArrowLeft size={16} /> Voltar para Categorias
            </button>

            {selectedCategory && (
              <div className="mb-2">
                <h2 className="text-2xl font-bold text-slate-900">{selectedCategory.name}</h2>
                {selectedCategory.description && (
                  <p className="text-slate-500 mt-1">{selectedCategory.description}</p>
                )}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader className="animate-spin text-orange-500" size={36} />
              </div>
            ) : articles.length === 0 ? (
              <Card className="p-8 text-center bg-white border-slate-200">
                <AlertCircle className="mx-auto text-slate-400 mb-2" size={32} />
                <p className="text-slate-600">Nenhum artigo disponível nesta categoria</p>
              </Card>
            ) : articles.map(article => (
              <button key={article.id} onClick={() => openArticle(article.slug)} className="w-full text-left group">
                <Card className="p-6 bg-white border-slate-200 hover:shadow-lg hover:border-orange-400 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors mb-1">
                        {article.title}
                      </h3>
                      <p className="text-slate-500 text-sm">{article.short_description}</p>
                      <p className="text-xs text-slate-400 mt-2">👁 {article.views} visualizações</p>
                    </div>
                    <ChevronRight className="text-slate-400 group-hover:text-orange-500 flex-shrink-0 mt-1" size={20} />
                  </div>
                </Card>
              </button>
            ))}
          </div>
        )}

        {/* ══ ARTICLE DETAIL ══════════════════════════════════════════════════ */}
        {view === 'article' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <button onClick={goBackFromArticle} className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium transition-colors">
              <ArrowLeft size={16} /> Voltar
            </button>

            {articleLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader className="animate-spin text-orange-500" size={36} />
              </div>
            ) : selectedArticle ? (
              <Card className="p-8 lg:p-12 bg-white border-slate-200 shadow-sm">
                {/* Meta */}
                <div className="mb-8">
                  <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold mb-4">
                    {selectedArticle.category_name}
                  </span>
                  <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-3 leading-tight">
                    {selectedArticle.title}
                  </h1>
                  {selectedArticle.short_description && (
                    <p className="text-lg text-slate-500 leading-relaxed">{selectedArticle.short_description}</p>
                  )}
                </div>

                {/* YouTube */}
                {selectedArticle.youtube_url && (
                  <div className="mb-8 rounded-2xl overflow-hidden border border-slate-200 shadow-sm" style={{ position: 'relative', paddingBottom: '56.25%' }}>
                    <iframe
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                      src={toEmbedUrl(selectedArticle.youtube_url)}
                      title={selectedArticle.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}

                {/* Conteúdo — renderiza HTML se houver tags, texto puro caso contrário */}
                {selectedArticle.content && (
                  <div className="mb-8">
                    {/<[a-z][\s\S]*>/i.test(selectedArticle.content) ? (
                      <div
                        className="prose prose-slate prose-lg max-w-none"
                        dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                      />
                    ) : (
                      <div className="text-slate-700 whitespace-pre-wrap leading-relaxed text-base">
                        {selectedArticle.content}
                      </div>
                    )}
                  </div>
                )}

                {/* Imagens */}
                {selectedArticle.images?.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Imagens Explicativas</h2>
                    <div className="space-y-4">
                      {selectedArticle.images.map(img => {
                        const src = img.image_path.startsWith('http') ? img.image_path : `${BASE_URL}${img.image_path}`;
                        return (
                          <div key={img.id} className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                            <img
                              src={src}
                              alt={img.alt_text || selectedArticle.title}
                              className="w-full h-auto max-h-[600px] object-contain"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = 'none';
                              }}
                            />
                            {img.alt_text && (
                              <p className="text-sm text-slate-500 text-center py-3 px-4 border-t border-slate-200 bg-white">
                                {img.alt_text}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Artigos relacionados */}
                {articles.length > 1 && (
                  <div className="mt-10 pt-8 border-t border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Artigos Relacionados</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {articles
                        .filter(a => a.slug !== selectedArticle.slug)
                        .slice(0, 4)
                        .map(article => (
                          <button key={article.id} onClick={() => openArticle(article.slug)} className="text-left group">
                            <Card className="p-4 bg-white border-slate-200 hover:shadow-md hover:border-orange-400 transition-all h-full">
                              <h3 className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors mb-1">
                                {article.title}
                              </h3>
                              <p className="text-sm text-slate-500 line-clamp-2">{article.short_description}</p>
                            </Card>
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </Card>
            ) : null}
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
}
