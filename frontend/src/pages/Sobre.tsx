import { useEffect, useState } from 'react';
import { Target, Eye, Award, Users, TrendingUp, Globe, Building2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useData } from '@/context/DataContext';
import { Link } from 'react-router-dom';
import { Header } from '@/sections/Header';
import { Footer } from '@/sections/Footer';
import { PageBanner } from '@/components/PageBanner';

function parseJson<T>(v: string | undefined, fallback: T): T {
  try { return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}

function Sobre() {
  const { data } = useData();
  const ct = data.content || {};
  const pc = data.settings?.primary_color || '#f97316';

  // Redirect if disabled
  if (ct['sobre.enabled'] === '0') {
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


  const timeline    = parseJson(ct['sobre.timeline'],     []);
  const valoresList = parseJson(ct['sobre.valores_list'], []);
  const premiosList = parseJson(ct['sobre.premios_list'], []);

  const stats = [
    { number: ct['sobre.stat1_number'] || '35+',  label: ct['sobre.stat1_label'] || 'Anos de História', icon: <TrendingUp /> },
    { number: ct['sobre.stat2_number'] || '60K+', label: ct['sobre.stat2_label'] || 'Clientes',         icon: <Users />      },
    { number: ct['sobre.stat3_number'] || '4K+',  label: ct['sobre.stat3_label'] || 'Colaboradores',    icon: <Building2 />  },
    { number: ct['sobre.stat4_number'] || '16',   label: ct['sobre.stat4_label'] || 'Países',           icon: <Globe />      },
  ];

  const heroFallback = (
    <section className="relative py-32 bg-[#1d1d1f] overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="inline-block px-4 py-1 bg-white/10 text-orange-400 rounded-full text-sm font-medium mb-6 border border-white/10">Institucional</span>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
          {ct['sobre.title'] || 'Sobre a Unimaxx'}
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          {ct['sobre.subtitle'] || 'Líder em tecnologia para o varejo brasileiro.'}
        </p>
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <PageBanner page="sobre" fallback={heroFallback} />

      {/* Missão / Visão / Propósito */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Target size={32} />, title: 'Missão',   text: ct['sobre.missao']    || 'Transformar a complexidade do varejo em resultados simples e eficientes.' },
              { icon: <Eye    size={32} />, title: 'Visão',    text: ct['sobre.visao']     || 'Ser a plataforma tecnológica mais relevante para o varejo na América Latina.' },
              { icon: <Award  size={32} />, title: 'Propósito',text: ct['sobre.proposito'] || 'Empoderar o varejo brasileiro com tecnologia que faz a diferença.' },
            ].map(({ icon, title, text }) => (
              <div key={title} className="bg-white rounded-2xl p-8 shadow-lg text-center card-hover">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-500 mx-auto mb-6">{icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
                <p className="text-gray-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Estatísticas */}
      <section className="py-24 bg-[#1d1d1f] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,107,53,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(147,51,234,0.3) 0%, transparent 50%)` }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <div key={i} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl text-orange-500 mb-4 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">{s.icon}</div>
                <div className="text-4xl sm:text-5xl font-bold text-white mb-2">{s.number}</div>
                <div className="text-gray-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      {timeline.length > 0 && (
        <section id="historia" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium mb-4">Nossa História</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Uma trajetória de <span style={{ color: pc }}>sucesso</span></h2>
            </div>
            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-orange-200 hidden md:block" />
              <div className="space-y-12">
                {timeline.map((item: any, index: number) => (
                  <div key={index} className={`relative flex flex-col md:flex-row items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                    <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'}`}>
                      <div className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow">
                        <span className="text-3xl font-bold" style={{ color: pc }}>{item.year}</span>
                        <h3 className="text-xl font-bold text-gray-900 mt-2">{item.title}</h3>
                        <p className="text-gray-600 mt-2">{item.description}</p>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full border-4 border-white shadow-lg z-10 my-4 md:my-0" style={{ background: pc }} />
                    <div className="w-full md:w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Valores */}
      {valoresList.length > 0 && (
        <section id="valores" className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium mb-4">Nossos Valores</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">O que nos <span style={{ color: pc }}>guia</span></h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {valoresList.map((v: any, i: number) => (
                <div key={i} className="bg-white rounded-2xl p-8 shadow-lg text-center card-hover">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold" style={{ background: `${pc}15`, color: pc }}>{i + 1}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{v.title}</h3>
                  <p className="text-gray-600 text-sm">{v.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Prêmios */}
      {premiosList.length > 0 && (
        <section id="premios" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium mb-4">Reconhecimentos</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Nossos <span style={{ color: pc }}>prêmios</span></h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {premiosList.map((p: any, i: number) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-6 text-center hover:bg-orange-50 hover:shadow-lg transition-all group">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-500 mx-auto mb-4 group-hover:bg-orange-500 group-hover:text-white transition-all">
                    <Award size={24} />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{p.title}</h3>
                  <p className="text-gray-500 text-sm">{p.org}</p>
                  {p.year && <span className="inline-block mt-3 px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-xs font-medium">{p.year}</span>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            {ct['sobre.cta_title'] || <>Faça parte da nossa <span style={{ color: pc }}>história</span></>}
          </h2>
          <p className="text-lg text-gray-600 mb-8">{ct['sobre.cta_text'] || 'Junte-se a mais de 60 mil empresas que confiam na Unimaxx.'}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/cliente"><Button size="lg" className="text-white px-8" style={{ background: pc }}>Fale Conosco</Button></Link>
            <Link to="/carreiras"><Button size="lg" variant="outline" className="px-8" style={{ borderColor: pc, color: pc }}>Trabalhe Conosco <ChevronRight className="ml-2" size={20} /></Button></Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Sobre;
