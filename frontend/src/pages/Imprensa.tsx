import { Mail, Phone, ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Header } from '@/sections/Header';
import { Footer } from '@/sections/Footer';
import { PageBanner } from '@/components/PageBanner';
import { useData } from '@/context/DataContext';

function parseJson<T>(v: string | undefined, fallback: T): T {
  try { return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}

function Imprensa() {
  const { data } = useData();
  const ct = data.content || {};
  const pc = data.settings?.primary_color || '#f97316';

  if (ct['imprensa.enabled'] === '0') {
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

  const releases: any[] = parseJson(ct['imprensa.releases'], []);

  const heroFallback = (
    <section className="relative py-32 bg-[#1d1d1f] overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500 rounded-full blur-3xl" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 text-center">
        <span className="inline-block px-4 py-1 bg-white/10 text-orange-400 rounded-full text-sm font-medium mb-6 border border-white/10">Imprensa</span>
        <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">{ct['imprensa.title'] || 'Sala de Imprensa'}</h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">{ct['imprensa.subtitle'] || 'Notícias, press releases e cobertura da mídia.'}</p>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <PageBanner page="imprensa" fallback={heroFallback} />

      {/* Contato de imprensa */}
      {(ct['imprensa.email'] || ct['imprensa.phone']) && (
        <section className="py-12 bg-gray-50 border-b" style={{ borderColor: 'rgba(0,0,0,.07)' }}>
          <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-6">
            <p className="text-sm font-semibold text-gray-600">Contato de Imprensa:</p>
            {ct['imprensa.email'] && (
              <a href={`mailto:${ct['imprensa.email']}`} className="flex items-center gap-2 text-sm font-medium transition hover:opacity-75" style={{ color: pc }}>
                <Mail className="w-4 h-4" /> {ct['imprensa.email']}
              </a>
            )}
            {ct['imprensa.phone'] && (
              <a href={`tel:${ct['imprensa.phone']}`} className="flex items-center gap-2 text-sm font-medium transition hover:opacity-75" style={{ color: pc }}>
                <Phone className="w-4 h-4" /> {ct['imprensa.phone']}
              </a>
            )}
          </div>
        </section>
      )}

      {/* Releases */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Press Releases <span className="text-sm font-normal text-gray-400 ml-2">({releases.length})</span>
          </h2>

          {releases.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl">
              <p className="text-4xl mb-3">📰</p>
              <p className="text-gray-500 font-medium">Nenhum release cadastrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {releases.map((r: any, i: number) => (
                <div key={i} className="bg-white rounded-2xl border p-6 hover:shadow-md transition-all group" style={{ borderColor: 'rgba(0,0,0,.08)' }}>
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        {r.data && <span className="text-xs text-gray-400">{r.data}</span>}
                        {r.categoria && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${pc}15`, color: pc }}>{r.categoria}</span>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900 leading-snug group-hover:text-orange-500 transition">{r.titulo}</h3>
                      {r.resumo && <p className="text-gray-500 text-sm mt-2 leading-relaxed">{r.resumo}</p>}
                      {r.link && (
                        <a href={r.link} target="_blank" rel="noreferrer"
                          className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold transition hover:opacity-75"
                          style={{ color: pc }}>
                          <ExternalLink className="w-3.5 h-3.5" /> Ver notícia completa
                        </a>
                      )}
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-orange-500 transition flex-shrink-0 mt-1" />
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

export default Imprensa;
