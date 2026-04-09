import { useState } from 'react';
import { Briefcase, MapPin, Search, ArrowRight, Mail, Linkedin, DollarSign, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { Header } from '@/sections/Header';
import { Footer } from '@/sections/Footer';
import { PageBanner } from '@/components/PageBanner';
import { useData } from '@/context/DataContext';

function parseJson<T>(v: string | undefined, fallback: T): T {
  try { return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}

function Carreiras() {
  const { data } = useData();
  const ct = data.content || {};
  const pc = data.settings?.primary_color || '#f97316';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('todos');

  if (ct['carreiras.enabled'] === '0') {
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

  const todasVagas: any[] = parseJson(ct['carreiras.vagas'], []);
  // Filtra apenas vagas ativas
  const vagasAtivas = todasVagas.filter((v: any) => v.ativo !== false);

  const beneficios = (ct['carreiras.beneficios'] || '')
    .split(',').map((b: string) => b.trim()).filter(Boolean);

  const tipos = ['todos', ...Array.from(new Set(vagasAtivas.map((v: any) => v.tipo).filter(Boolean))) as string[]];

  const vagasFiltradas = vagasAtivas.filter((v: any) =>
    (selectedTipo === 'todos' || v.tipo === selectedTipo) &&
    (!searchTerm ||
      v.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.local?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const heroFallback = (
    <section className="relative py-32 bg-[#1d1d1f] overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500 rounded-full blur-3xl" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 text-center">
        <span className="inline-block px-4 py-1 bg-white/10 text-orange-400 rounded-full text-sm font-medium mb-6 border border-white/10">Carreiras</span>
        <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">{ct['carreiras.title'] || 'Trabalhe Conosco'}</h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">{ct['carreiras.subtitle'] || 'Faça parte de um time apaixonado por tecnologia e inovação.'}</p>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <PageBanner page="carreiras" fallback={heroFallback} />

      {/* Benefícios */}
      {beneficios.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Nossos <span style={{ color: pc }}>benefícios</span></h2>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {beneficios.map((b: string, i: number) => (
                <span key={i} className="px-4 py-2 rounded-full text-sm font-medium border"
                  style={{ background: `${pc}10`, borderColor: `${pc}30`, color: pc }}>
                  ✓ {b}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Vagas */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Vagas Abertas{' '}
              <span className="text-sm font-normal text-gray-400 ml-1">({vagasFiltradas.length} vaga{vagasFiltradas.length !== 1 ? 's' : ''})</span>
            </h2>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar vaga, área ou local..." className="pl-9 h-10" />
            </div>
          </div>

          {/* Filtro por tipo */}
          {tipos.length > 1 && (
            <div className="flex gap-2 flex-wrap mb-6">
              {tipos.map((tipo) => (
                <button key={tipo} onClick={() => setSelectedTipo(tipo)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold transition"
                  style={selectedTipo === tipo ? { background: pc, color: '#fff' } : { background: '#f5f5f7', color: '#6e6e73' }}>
                  {tipo === 'todos' ? 'Todos os tipos' : tipo}
                </button>
              ))}
            </div>
          )}

          {vagasFiltradas.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Nenhuma vaga encontrada</p>
              <p className="text-sm text-gray-400 mt-1">Tente um termo diferente ou volte em breve</p>
            </div>
          ) : (
            <div className="space-y-4">
              {vagasFiltradas.map((vaga: any, i: number) => (
                <div key={i} className="bg-white rounded-2xl border p-6 hover:shadow-md transition-all group" style={{ borderColor: 'rgba(0,0,0,.08)' }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        {vaga.area && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${pc}15`, color: pc }}>{vaga.area}</span>
                        )}
                        {vaga.tipo && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{vaga.tipo}</span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">{vaga.titulo}</h3>
                      <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                        {vaga.local && (
                          <span className="flex items-center gap-1 text-sm text-gray-500">
                            <MapPin className="w-3.5 h-3.5" /> {vaga.local}
                          </span>
                        )}
                        {vaga.salario && (
                          <span className="flex items-center gap-1 text-sm text-gray-500">
                            <DollarSign className="w-3.5 h-3.5" /> {vaga.salario}
                          </span>
                        )}
                      </div>
                      {vaga.descricao && <p className="text-gray-600 text-sm mt-3 leading-relaxed">{vaga.descricao}</p>}
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-orange-500 transition flex-shrink-0 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Contato candidatura */}
          {(ct['carreiras.email'] || ct['carreiras.linkedin']) && (
            <div className="mt-12 p-6 rounded-2xl border" style={{ background: `${pc}08`, borderColor: `${pc}20` }}>
              <p className="font-bold text-gray-800 mb-3">Candidatura espontânea</p>
              <p className="text-sm text-gray-600 mb-4">Não encontrou a vaga ideal? Entre em contato diretamente.</p>
              <div className="flex flex-wrap gap-3">
                {ct['carreiras.email'] && (
                  <a href={`mailto:${ct['carreiras.email']}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
                    style={{ background: pc }}>
                    <Mail className="w-4 h-4" /> {ct['carreiras.email']}
                  </a>
                )}
                {ct['carreiras.linkedin'] && (
                  <a href={ct['carreiras.linkedin']} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition hover:shadow-sm"
                    style={{ borderColor: pc, color: pc }}>
                    LinkedIn <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Carreiras;
