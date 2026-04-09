import { useEffect, useState } from 'react';
import { 
  ChevronRight, Phone, Users, Building2, Globe, 
  ShoppingCart, BarChart3, Zap, 
  ArrowRight, CheckCircle2, Store, Truck, CreditCard,
  MessageSquare, Mail, MapPin, Clock, TrendingUp,
  Award, Target, Cpu, Wallet, Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';

function Home() {
  const [showDialog, setShowDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState({ title: '', description: '' });
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const sections = ['solucoes', 'numeros', 'segmentos', 'diferenciais', 'contato', 'faq'];
    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const solutions = [
    {
      icon: <Store size={32} />,
      title: 'Maxx ERP',
      description: 'Sistema completo de gestão empresarial para varejo de todos os segmentos. Integre todas as áreas do seu negócio.',
      features: ['Gestão financeira', 'Controle de estoque', 'Fiscal', 'Compras'],
      link: '/solucao/erp'
    },
    {
      icon: <ShoppingCart size={32} />,
      title: 'Maxx PDV',
      description: 'Ponto de venda moderno e integrado para todas as operações. Rápido, seguro e fácil de usar.',
      features: ['Venda rápida', 'Múltiplas formas de pagamento', 'Fidelização', 'Offline'],
      link: '/solucao/pdv'
    },
    {
      icon: <Globe size={32} />,
      title: 'Maxx Commerce',
      description: 'Plataforma completa de e-commerce para vender online. Integração total com lojas físicas.',
      features: ['Loja virtual', 'Marketplaces', 'Integração omnichannel', 'Mobile'],
      link: '/solucao/commerce'
    },
    {
      icon: <CreditCard size={32} />,
      title: 'Maxx Pay',
      description: 'Soluções de pagamento integradas ao seu negócio. Aceite todas as formas de pagamento.',
      features: ['TEF', 'Maquininhas', 'Split de pagamentos', 'Antecipação'],
      link: '/solucao/pay'
    },
    {
      icon: <Truck size={32} />,
      title: 'Maxx Delivery',
      description: 'Gestão completa de entregas e logística. Otimize suas rotas e entregas.',
      features: ['Roteirização', 'Rastreamento', 'Integração com iFood', 'App entregador'],
      link: '/solucao/delivery'
    },
    {
      icon: <BarChart3 size={32} />,
      title: 'Maxx BI',
      description: 'Business Intelligence para decisões baseadas em dados. Dashboards e relatórios em tempo real.',
      features: ['Dashboards', 'Relatórios', 'Análise preditiva', 'KPIs'],
      link: '/solucao/bi'
    },
  ];

  const segments = [
    { name: 'Moda e Acessórios', icon: '👕' },
    { name: 'Calçados', icon: '👟' },
    { name: 'Farmácia', icon: '💊' },
    { name: 'Perfumaria', icon: '✨' },
    { name: 'Restaurantes', icon: '🍽️' },
    { name: 'Fast Food', icon: '🍔' },
    { name: 'Delivery', icon: '🛵' },
    { name: 'Presentes', icon: '🎁' },
    { name: 'Magazines', icon: '📺' },
    { name: 'Ótica', icon: '👓' },
    { name: 'Casa e Decoração', icon: '🏠' },
    { name: 'Postos de Combustível', icon: '⛽' },
  ];

  const diferenciais = [
    { icon: <Award size={28} />, title: 'Líder de Mercado', desc: '45,6% de market share no Brasil segundo o IDC' },
    { icon: <Target size={28} />, title: 'Foco no Cliente', desc: '97% de satisfação em atendimento — suporte 24/7' },
    { icon: <Cpu size={28} />, title: 'Inovação Constante', desc: '+180 soluções no portfólio, atualizadas regularmente' },
    { icon: <Wallet size={28} />, title: 'Ecossistema Completo', desc: 'ERP, PDV, e-commerce e pagamentos em um só lugar' },
  ];

  const faqs = [
    {
      q: 'Como funciona a implementação do sistema?',
      a: 'A implementação é conduzida por consultores especializados da Unimaxx. O processo inclui configuração, migração de dados, treinamento da equipe e acompanhamento nos primeiros meses. Cada projeto é adaptado às necessidades do seu negócio.',
    },
    {
      q: 'O sistema funciona offline?',
      a: 'Sim! O Maxx PDV possui modo offline completo. As vendas continuam normalmente sem internet e sincronizam automaticamente quando a conexão é restaurada, sem perda de dados.',
    },
    {
      q: 'Quais segmentos de varejo são atendidos?',
      a: 'Atendemos mais de 30 segmentos, incluindo moda, calçados, farmácia, restaurantes, fast food, postos de combustível, ótica, casa e decoração, e muito mais. Cada segmento conta com configurações específicas.',
    },
    {
      q: 'Qual o prazo de contrato mínimo?',
      a: 'Os planos são flexíveis, com opções mensais e anuais. Consulte nossos especialistas para encontrar o modelo ideal para o tamanho e momento do seu negócio.',
    },
  ];

  const integrations = ['iFood', 'Mercado Pago', 'PagSeguro', 'Stone', 'Cielo', 'Rede', 'TOTVS', 'SAP', 'Shopify', 'VTEX'];

  const revealClass = (id: string) =>
    `transition-all duration-700 ${isVisible[id] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--s0)' }}>

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: '#0a0a0c' }}>
        {/* Orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-80px] left-[-40px] w-[400px] h-[400px] rounded-full" style={{ background: 'rgba(249,115,22,.18)', filter: 'blur(80px)' }} />
          <div className="absolute bottom-[-100px] right-[-60px] w-[500px] h-[500px] rounded-full" style={{ background: 'rgba(139,92,246,.12)', filter: 'blur(100px)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full" style={{ background: 'rgba(236,72,153,.07)', filter: 'blur(80px)' }} />
        </div>

        {/* Dot grid */}
        <div className="absolute inset-0 dot-grid opacity-[.35] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-orange-400 text-xs font-semibold mb-7 animate-fade-in-up"
                style={{ background: 'rgba(249,115,22,.1)', border: '0.5px solid rgba(249,115,22,.28)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                <Zap size={13} className="animate-pulse" />
                Líder em Tecnologia para Varejo
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.08] mb-6 animate-fade-in-up delay-100"
                style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.04em' }}>
                Tem solução pra tudo,{' '}
                <span className="text-orange-gradient">tem Unimaxx pra tudo</span>
              </h1>

              <p className="text-base sm:text-lg mb-9 max-w-xl animate-fade-in-up delay-150"
                style={{ color: 'rgba(255,255,255,.5)', lineHeight: 1.75 }}>
                De cada esquina às maiores redes varejistas, nós estamos lá.
                Somos a resposta confiável que você precisa para prosperar.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-200">
                <Link to="/cliente">
                  <button className="btn-apple inline-flex items-center gap-2 px-7 py-3.5 text-[14px] font-semibold text-white rounded-full"
                    style={{
                      background: 'linear-gradient(180deg, #f97316 0%, #ea580c 100%)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,.2), 0 4px 20px rgba(249,115,22,.38)',
                      border: '0.5px solid #c2410c',
                      fontFamily: "'DM Sans', sans-serif",
                    }}>
                    <Phone size={16} />
                    Receba uma Ligação
                  </button>
                </Link>
                <Link to="/solucoes">
                  <button className="btn-apple inline-flex items-center gap-2 px-7 py-3.5 text-[14px] font-medium rounded-full"
                    style={{
                      background: 'rgba(255,255,255,.07)',
                      border: '0.5px solid rgba(255,255,255,.14)',
                      color: 'rgba(255,255,255,.8)',
                      fontFamily: "'DM Sans', sans-serif",
                    }}>
                    Conheça as Soluções
                    <ChevronRight size={16} />
                  </button>
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-14 flex items-center gap-10 flex-wrap animate-fade-in-up delay-300">
                {[
                  { value: '60K+', label: 'Empresas' },
                  { value: '180+', label: 'Soluções' },
                  { value: '45%', label: 'Market Share' },
                ].map((stat, i) => (
                  <div key={i}>
                    <div className="text-3xl sm:text-4xl font-bold text-orange-gradient"
                      style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.04em' }}>
                      {stat.value}
                    </div>
                    <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,.35)' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — floating solution cards */}
            <div className="relative hidden lg:block animate-float">
              <div className="absolute inset-0 rounded-3xl blur-2xl opacity-25"
                style={{ background: 'linear-gradient(135deg, #f97316, #8b5cf6)', transform: 'rotate(6deg)' }} />
              <div className="relative rounded-3xl p-8 grid grid-cols-2 gap-4"
                style={{ background: 'rgba(255,255,255,.04)', border: '0.5px solid rgba(255,255,255,.08)', backdropFilter: 'blur(20px)' }}>
                {[
                  { icon: <Store size={36} />, title: 'ERP', desc: 'Gestão Completa', link: '/solucao/erp' },
                  { icon: <ShoppingCart size={36} />, title: 'PDV', desc: 'Ponto de Venda', link: '/solucao/pdv' },
                  { icon: <Globe size={36} />, title: 'Digital', desc: 'E-commerce', link: '/solucao/commerce' },
                  { icon: <BarChart3 size={36} />, title: 'BI', desc: 'Inteligência', link: '/solucao/bi' },
                ].map((item, i) => (
                  <Link key={i} to={item.link}>
                    <div className="rounded-2xl p-6 text-center group cursor-pointer transition-all duration-300"
                      style={{ background: 'rgba(255,255,255,.07)', border: '0.5px solid rgba(255,255,255,.06)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,.13)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,.07)')}>
                      <div className="text-orange-500 mb-4 transition-transform duration-300 group-hover:scale-110">{item.icon}</div>
                      <div className="text-white font-bold text-sm" style={{ fontFamily: "'Outfit', sans-serif" }}>{item.title}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,.4)' }}>{item.desc}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-5 h-9 rounded-full border flex justify-center pt-2" style={{ borderColor: 'rgba(255,255,255,.2)' }}>
            <div className="w-0.5 h-2 rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,.4)' }} />
          </div>
        </div>
      </section>

      {/* ─── SOLUÇÕES ─── */}
      <section id="solucoes" className={`py-32 ${revealClass('solucoes')}`} style={{ background: 'var(--s1)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="section-badge bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 mb-4">
              <span className="sol-dot bg-orange-500" />
              Nossas Soluções
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
              style={{ color: 'var(--t1)', letterSpacing: '-0.04em', fontFamily: "'Outfit', sans-serif" }}>
              Sim, nós temos o que seu{' '}
              <span className="text-orange-gradient">negócio precisa!</span>
            </h2>
            <p className="text-base max-w-2xl mx-auto" style={{ color: 'var(--t3)', lineHeight: 1.75 }}>
              A Unimaxx possui mais de 50 soluções em ERP, PDV, digital, autoatendimento, delivery e muito mais.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {solutions.map((solution, index) => (
              <Link key={index} to={solution.link}>
                <div className="apple-card card-glow rounded-2xl p-8 h-full group cursor-pointer"
                  style={{ animationDelay: `${index * 0.08}s` }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300"
                    style={{ background: 'rgba(249,115,22,.08)', color: 'var(--orange)' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, #f97316, #ea580c)';
                      (e.currentTarget as HTMLElement).style.color = '#fff';
                      (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(249,115,22,.32)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(249,115,22,.08)';
                      (e.currentTarget as HTMLElement).style.color = 'var(--orange)';
                      (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                    }}>
                    {solution.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-orange-500 transition-colors"
                    style={{ color: 'var(--t1)', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>
                    {solution.title}
                  </h3>
                  <p className="text-sm mb-5" style={{ color: 'var(--t3)', lineHeight: 1.7 }}>{solution.description}</p>
                  <ul className="space-y-2">
                    {solution.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm" style={{ color: 'var(--t3)' }}>
                        <CheckCircle2 size={13} className="text-orange-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-7 flex items-center gap-1 text-sm font-semibold text-orange-500">
                    <span>Saiba mais</span>
                    <ArrowRight size={15} className="transform group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-14">
            <Link to="/solucoes">
              <button className="btn-apple inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold text-white rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,.2), 0 4px 16px rgba(249,115,22,.3)',
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                Ver Todas as Soluções
                <ArrowRight size={16} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── NÚMEROS ─── */}
      <section id="numeros" className={`py-32 relative overflow-hidden ${revealClass('numeros')}`}
        style={{ background: '#0a0a0c' }}>
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, rgba(249,115,22,.5), transparent 70%)', filter: 'blur(60px)' }} />
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,.5), transparent 70%)', filter: 'blur(60px)' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="section-badge mb-4"
              style={{ background: 'rgba(249,115,22,.1)', color: '#fb923c', border: '0.5px solid rgba(249,115,22,.25)', letterSpacing: '0.08em' }}>
              <span className="sol-dot" style={{ background: '#f97316' }} />
              Nossos Números
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4"
              style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.04em' }}>
              Mais de <span className="text-orange-gradient">60.000 empresas</span> confiam na Unimaxx
            </h2>
            <p className="text-base max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,.45)', lineHeight: 1.75 }}>
              Toda essa experiência é o que nos torna líderes no mercado de softwares de gestão.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {[
              { number: '60K+', label: 'Empresas Atendidas', icon: <Building2 size={22} /> },
              { number: '4K+', label: 'Colaboradores', icon: <Users size={22} /> },
              { number: '17', label: 'Escritórios no Brasil', icon: <MapPin size={22} /> },
              { number: '16', label: 'Países na América', icon: <Globe size={22} /> },
            ].map((stat, i) => (
              <div key={i} className="text-center p-8 rounded-2xl group transition-all duration-300"
                style={{ background: 'rgba(255,255,255,.04)', border: '0.5px solid rgba(255,255,255,.07)', backdropFilter: 'blur(20px)' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.07)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(249,115,22,.25)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.04)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.07)';
                }}>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-5 transition-all duration-300"
                  style={{ background: 'rgba(249,115,22,.12)', color: '#f97316' }}>
                  {stat.icon}
                </div>
                <div className="text-4xl sm:text-5xl font-bold text-white mb-1 transition-transform duration-300 group-hover:scale-105"
                  style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.04em' }}>
                  {stat.number}
                </div>
                <div className="text-sm" style={{ color: 'rgba(255,255,255,.4)' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { value: '180+', label: 'Soluções no portfólio', icon: <Package size={20} /> },
              { value: '165K+', label: 'Lojas atendidas', icon: <Store size={20} /> },
              { value: '45,6%', label: 'Market Share (IDC)', icon: <TrendingUp size={20} /> },
            ].map((item, i) => (
              <div key={i} className="glass rounded-2xl p-7 text-center group transition-all duration-300 cursor-default"
                style={{ border: '0.5px solid rgba(255,255,255,.08)' }}>
                <div className="text-orange-500 mb-3 flex justify-center transition-transform duration-300 group-hover:scale-110">{item.icon}</div>
                <div className="text-3xl font-bold text-orange-500 mb-1"
                  style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.04em' }}>
                  {item.value}
                </div>
                <div className="text-sm text-white">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SEGMENTOS ─── */}
      <section id="segmentos" className={`py-32 ${revealClass('segmentos')}`} style={{ background: 'var(--s0)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="section-badge bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 mb-4">
              <span className="sol-dot bg-orange-500" />
              Segmentos
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
              style={{ color: 'var(--t1)', letterSpacing: '-0.04em', fontFamily: "'Outfit', sans-serif" }}>
              Atendemos <span className="text-orange-gradient">todos os segmentos</span> do varejo
            </h2>
            <p className="text-base max-w-2xl mx-auto" style={{ color: 'var(--t3)', lineHeight: 1.75 }}>
              Soluções especializadas para cada tipo de negócio.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {segments.map((segment, index) => (
              <div
                key={index}
                className="apple-card card-glow rounded-2xl p-6 text-center group cursor-pointer"
                onClick={() => {
                  setDialogContent({ title: segment.name, description: `Soluções especializadas para ${segment.name}` });
                  setShowDialog(true);
                }}
              >
                <div className="text-4xl mb-3 transform transition-transform duration-300 group-hover:scale-125">
                  {segment.icon}
                </div>
                <div className="text-sm font-medium transition-colors duration-200 group-hover:text-orange-500"
                  style={{ color: 'var(--t2)' }}>
                  {segment.name}
                </div>
              </div>
            ))}
          </div>

          {/* Integrações */}
          <div className="mt-20">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] mb-6 text-center" style={{ color: 'var(--t4)' }}>
              Integrações
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {integrations.map((name) => (
                <div key={name}
                  className="px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 cursor-default"
                  style={{
                    background: 'var(--s1)',
                    border: '0.5px solid var(--b1)',
                    color: 'var(--t4)',
                    filter: 'grayscale(100%)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.filter = 'grayscale(0%)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--t1)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(249,115,22,.3)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.filter = 'grayscale(100%)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--t4)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--b1)';
                  }}>
                  {name}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-14">
            <Link to="/segmentos">
              <button className="btn-apple inline-flex items-center gap-2 px-8 py-3.5 text-sm font-semibold rounded-full"
                style={{
                  background: 'var(--s1)',
                  border: '0.5px solid var(--b2)',
                  color: 'var(--t1)',
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                Ver Todos os Segmentos
                <ArrowRight size={16} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── DIFERENCIAIS ─── */}
      <section id="diferenciais" className={`py-32 ${revealClass('diferenciais')}`} style={{ background: 'var(--s2)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="section-badge bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 mb-4">
              <span className="sol-dot bg-orange-500" />
              Por que Unimaxx?
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
              style={{ color: 'var(--t1)', letterSpacing: '-0.04em', fontFamily: "'Outfit', sans-serif" }}>
              Nossos <span className="text-orange-gradient">diferenciais</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {diferenciais.map((item, index) => (
              <div key={index} className="card-glow rounded-2xl p-8 group cursor-default"
                style={{
                  background: 'rgba(255,255,255,.85)',
                  backdropFilter: 'saturate(180%) blur(24px)',
                  border: '0.5px solid rgba(0,0,0,.05)',
                  boxShadow: '0 20px 80px rgba(0,0,0,.04)',
                }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: 'linear-gradient(135deg, #f97316, #ea580c)',
                    color: '#fff',
                    boxShadow: '0 6px 20px rgba(249,115,22,.32)',
                  }}>
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--t1)', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.02em' }}>
                  {item.title}
                </h3>
                <p className="text-sm" style={{ color: 'var(--t3)', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className={`py-32 ${revealClass('faq')}`} style={{ background: 'var(--s0)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="section-badge bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 mb-4">
              <span className="sol-dot bg-orange-500" />
              Dúvidas Frequentes
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold"
              style={{ color: 'var(--t1)', letterSpacing: '-0.04em', fontFamily: "'Outfit', sans-serif" }}>
              Perguntas <span className="text-orange-gradient">frequentes</span>
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-2xl overflow-hidden transition-all duration-300"
                style={{
                  background: 'var(--s0)',
                  border: openFaq === i ? '0.5px solid rgba(249,115,22,.3)' : '0.5px solid var(--b1)',
                  boxShadow: openFaq === i ? '0 0 20px rgba(249,115,22,.07)' : '0 20px 80px rgba(0,0,0,.03)',
                }}>
                <button
                  className="w-full flex items-center justify-between px-7 py-5 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-sm font-semibold pr-4" style={{ color: 'var(--t1)', fontFamily: "'Outfit', sans-serif" }}>
                    {faq.q}
                  </span>
                  <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-lg font-light transition-all duration-300"
                    style={{
                      background: openFaq === i ? '#f97316' : 'rgba(249,115,22,.1)',
                      color: openFaq === i ? '#fff' : '#f97316',
                      transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)',
                    }}>
                    +
                  </div>
                </button>
                <div style={{ maxHeight: openFaq === i ? '200px' : '0', overflow: 'hidden', transition: 'max-height 0.38s cubic-bezier(0.2,0.8,0.2,1)' }}>
                  <p className="px-7 pb-6 text-sm" style={{ color: 'var(--t3)', lineHeight: 1.75 }}>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CONTATO ─── */}
      <section id="contato" className={`py-32 ${revealClass('contato')}`} style={{ background: 'var(--s1)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <span className="section-badge bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 mb-6">
                <span className="sol-dot bg-orange-500" />
                Contato
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
                style={{ color: 'var(--t1)', letterSpacing: '-0.04em', fontFamily: "'Outfit', sans-serif" }}>
                Vamos <span className="text-orange-gradient">conversar?</span>
              </h2>
              <p className="text-base mb-10" style={{ color: 'var(--t3)', lineHeight: 1.75 }}>
                Ligamos para você em até 1h. Fale sobre os desafios do seu negócio e encontre a solução ideal.
              </p>

              <div className="space-y-5">
                {[
                  { icon: <Phone size={20} />, title: 'Telefone', info: '0800 770 3320' },
                  { icon: <Mail size={20} />, title: 'E-mail', info: 'contato@unimaxx.com.br' },
                  { icon: <MapPin size={20} />, title: 'Endereço', info: 'Av. das Nações Unidas, 7221 — São Paulo, SP' },
                  { icon: <Clock size={20} />, title: 'Horário', info: 'Segunda a Sexta, 8h às 18h' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-105"
                      style={{ background: 'rgba(249,115,22,.1)', color: '#f97316' }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, #f97316, #ea580c)';
                        (e.currentTarget as HTMLElement).style.color = '#fff';
                        (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(249,115,22,.3)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(249,115,22,.1)';
                        (e.currentTarget as HTMLElement).style.color = '#f97316';
                        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                      }}>
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm" style={{ color: 'var(--t1)' }}>{item.title}</h3>
                      <p className="text-sm" style={{ color: 'var(--t3)' }}>{item.info}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl p-8 lg:p-10"
              style={{
                background: 'var(--s0)',
                border: '0.5px solid var(--b1)',
                boxShadow: '0 20px 80px rgba(0,0,0,.06)',
              }}>
              <h3 className="text-2xl font-bold mb-7" style={{ color: 'var(--t1)', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.03em' }}>
                Receba uma ligação
              </h3>
              <form
                className="space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  setShowDialog(true);
                  setDialogContent({
                    title: 'Solicitação Enviada!',
                    description: 'Em breve nossa equipe entrará em contato com você. Obrigado pelo interesse!',
                  });
                }}
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--t2)' }}>Nome</label>
                    <Input placeholder="Seu nome" className="w-full h-11" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--t2)' }}>Telefone</label>
                    <Input placeholder="(00) 00000-0000" className="w-full h-11" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--t2)' }}>E-mail</label>
                  <Input type="email" placeholder="seu@email.com" className="w-full h-11" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--t2)' }}>Segmento</label>
                  <select className="w-full h-11 px-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    style={{ border: '1px solid var(--b2)', background: 'var(--s0)', color: 'var(--t1)', fontFamily: "'DM Sans', sans-serif" }}>
                    <option>Selecione seu segmento</option>
                    <option>Moda e Acessórios</option>
                    <option>Alimentação</option>
                    <option>Farmácia</option>
                    <option>Postos de Combustível</option>
                    <option>Outros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--t2)' }}>Mensagem</label>
                  <Textarea placeholder="Conte-nos sobre seu negócio" className="w-full min-h-[110px]" />
                </div>
                <button type="submit"
                  className="btn-apple w-full flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-white rounded-xl"
                  style={{
                    background: 'linear-gradient(180deg, #f97316 0%, #ea580c 100%)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,.2), 0 4px 16px rgba(249,115,22,.3)',
                    border: '0.5px solid #c2410c',
                    fontFamily: "'DM Sans', sans-serif",
                  }}>
                  <MessageSquare size={16} />
                  Solicitar Contato
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ background: '#060608', borderTop: '0.5px solid rgba(255,255,255,.05)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <Link to="/" className="flex items-center gap-2.5 mb-5 group">
                <div className="w-8 h-8 rounded-[10px] flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 4px 16px rgba(249,115,22,.3)' }}>
                  <span className="text-white font-bold text-base" style={{ fontFamily: "'Outfit', sans-serif" }}>U</span>
                </div>
                <span className="text-lg font-semibold text-white" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.03em' }}>
                  Unimaxx
                </span>
              </Link>
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,.35)' }}>
                Líder em tecnologia para o varejo. Transformando complexidade em resultado desde 1985.
              </p>
            </div>

            {[
              {
                title: 'Soluções',
                links: [
                  { name: 'Maxx ERP', to: '/solucao/erp' },
                  { name: 'Maxx PDV', to: '/solucao/pdv' },
                  { name: 'Maxx Commerce', to: '/solucao/commerce' },
                  { name: 'Maxx Pay', to: '/solucao/pay' },
                  { name: 'Maxx Delivery', to: '/solucao/delivery' },
                  { name: 'Maxx BI', to: '/solucao/bi' },
                ],
              },
              {
                title: 'Institucional',
                links: [
                  { name: 'Sobre Nós', to: '/sobre' },
                  { name: 'Carreiras', to: '/carreiras' },
                  { name: 'Imprensa', to: '/imprensa' },
                  { name: 'Blog', to: '/blog' },
                ],
              },
              {
                title: 'Suporte',
                links: [
                  { name: 'Central de Ajuda', to: '/suporte' },
                  { name: 'Área do Cliente', to: '/cliente' },
                  { name: 'Fale Conosco', to: '/cliente' },
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold text-sm mb-5 text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.name}>
                      <Link to={link.to} className="text-sm transition-colors duration-200 hover:text-orange-500"
                        style={{ color: 'rgba(255,255,255,.35)' }}>
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4"
            style={{ borderTop: '0.5px solid rgba(255,255,255,.06)', paddingTop: '2rem' }}>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,.25)' }}>
              © 2025 Unimaxx. Todos os direitos reservados.
            </p>
            <div className="flex gap-6">
              <Link to="/privacidade" className="text-xs transition-colors hover:text-orange-500" style={{ color: 'rgba(255,255,255,.25)' }}>
                Política de Privacidade
              </Link>
              <Link to="/termos" className="text-xs transition-colors hover:text-orange-500" style={{ color: 'rgba(255,255,255,.25)' }}>
                Termos de Uso
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold" style={{ color: 'var(--t1)', fontFamily: "'Outfit', sans-serif" }}>
              {dialogContent.title}
            </DialogTitle>
            <DialogDescription style={{ color: 'var(--t3)' }}>
              {dialogContent.description}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(249,115,22,.1)' }}>
              <CheckCircle2 className="text-orange-500" size={32} />
            </div>
          </div>
          <button
            onClick={() => setShowDialog(false)}
            className="btn-apple w-full py-3 text-sm font-semibold text-white rounded-xl"
            style={{
              background: 'linear-gradient(180deg, #f97316 0%, #ea580c 100%)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,.2)',
              fontFamily: "'DM Sans', sans-serif",
            }}>
            Fechar
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Home;
