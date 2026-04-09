import { useState } from 'react';
import { Calendar, User, ArrowRight, Search, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Header } from '@/sections/Header';
import { Footer } from '@/sections/Footer';
import { PageBanner } from '@/components/PageBanner';
import { useData } from '@/context/DataContext';

function parseJson<T>(v: string | undefined, fallback: T): T {
  try { return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}

function Blog() {
  const { data } = useData();
  const ct = data.content || {};
  const pc = data.settings?.primary_color || '#f97316';
  const sc = data.settings?.secondary_color || '#fb923c';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');

  if (ct['blog.enabled'] === '0') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center text-center px-4">
          <div>
            <p className="text-6xl mb-4">🔒</p>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Página indisponível</h1>
            <p className="text-gray-500 mb-6">Esta página está temporariamente desativada.</p>
            <Link to="/"><Button style={{ background: pc, color: '#fff' }}>Voltar ao início</Button></Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const posts: any[] = parseJson(ct['blog.posts'], []);
  const categorias = ['todas', ...Array.from(new Set(posts.map((p: any) => p.categoria).filter(Boolean))) as string[]];

  // Posts em destaque aparecem primeiro
  const postsSorted = [...posts].sort((a, b) => (b.destaque ? 1 : 0) - (a.destaque ? 1 : 0));

  const postsFiltrados = postsSorted.filter((p: any) =>
    (selectedCategory === 'todas' || p.categoria === selectedCategory) &&
    (!searchTerm ||
      p.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.resumo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.autor?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const heroFallback = (
    <section className="relative py-32 bg-[#1d1d1f] overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500 rounded-full blur-3xl" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 text-center">
        <span className="inline-block px-4 py-1 bg-white/10 text-orange-400 rounded-full text-sm font-medium mb-6 border border-white/10">Blog</span>
        <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">{ct['blog.title'] || 'Blog & Conteúdo'}</h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">{ct['blog.subtitle'] || 'Artigos sobre varejo, tecnologia e gestão.'}</p>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <PageBanner page="blog" fallback={heroFallback} />

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <div className="flex gap-2 flex-wrap">
              {categorias.map((cat: any) => (
                <button key={cat} onClick={() => setSelectedCategory(cat)}
                  className="px-4 py-2 rounded-full text-sm font-medium transition"
                  style={selectedCategory === cat ? { background: pc, color: '#fff' } : { background: '#f5f5f7', color: '#6e6e73' }}>
                  {cat === 'todas' ? 'Todos' : cat}
                </button>
              ))}
            </div>
            <div className="relative sm:ml-auto sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar artigo..." className="pl-9 h-10" />
            </div>
          </div>

          {postsFiltrados.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl">
              <p className="text-4xl mb-3">📝</p>
              <p className="text-gray-500 font-medium">Nenhum post encontrado</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {postsFiltrados.map((post: any, i: number) => (
                <div key={i} className={`bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition-all group relative ${post.destaque ? 'ring-2' : ''}`}
                  style={{ borderColor: 'rgba(0,0,0,.08)', ...(post.destaque ? { ringColor: pc } : {}) }}>
                  {post.destaque && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full text-white"
                        style={{ background: `linear-gradient(135deg,${pc},${sc})` }}>
                        <Sparkles className="w-2.5 h-2.5" /> Destaque
                      </span>
                    </div>
                  )}
                  <div className="h-2" style={{ background: `linear-gradient(to right, ${pc}, ${sc})` }} />
                  <div className="p-6">
                    {post.categoria && (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full mb-3 inline-block" style={{ background: `${pc}15`, color: pc }}>{post.categoria}</span>
                    )}
                    <h3 className="font-bold text-gray-900 mb-2 leading-snug group-hover:text-orange-500 transition">{post.titulo}</h3>
                    {post.resumo && <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3">{post.resumo}</p>}
                    <div className="flex items-center gap-3 text-xs text-gray-400 pt-3 border-t flex-wrap" style={{ borderColor: 'rgba(0,0,0,.06)' }}>
                      {post.autor && <span className="flex items-center gap-1"><User className="w-3 h-3" />{post.autor}</span>}
                      {post.data && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{post.data}</span>}
                      <ArrowRight className="w-4 h-4 ml-auto text-gray-300 group-hover:text-orange-500 transition" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Blog;
