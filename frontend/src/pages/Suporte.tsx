import { 
  Search, BookOpen, MessageCircle, Phone, 
  Mail, FileText, Video, ArrowRight, CheckCircle2,
  HelpCircle, Wrench
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Header } from '@/sections/Header';
import { Footer } from '@/sections/Footer';
import { PageBanner } from '@/components/PageBanner';

function Suporte() {
  const categorias = [
    {
      titulo: 'Primeiros Passos',
      icon: <BookOpen size={32} />,
      artigos: ['Como começar', 'Configuração inicial', 'Treinamentos básicos']
    },
    {
      titulo: 'Maxx ERP',
      icon: <FileText size={32} />,
      artigos: ['Gestão financeira', 'Controle de estoque', 'Relatórios']
    },
    {
      titulo: 'Maxx PDV',
      icon: <CheckCircle2 size={32} />,
      artigos: ['Operação de caixa', 'Cancelamentos', 'Fechamento']
    },
    {
      titulo: 'Maxx Commerce',
      icon: <MessageCircle size={32} />,
      artigos: ['Configuração da loja', 'Produtos', 'Pedidos']
    },
    {
      titulo: 'Vídeo Tutoriais',
      icon: <Video size={32} />,
      artigos: ['Tutoriais ERP', 'Tutoriais PDV', 'Webinars']
    },
    {
      titulo: 'Manutenção',
      icon: <Wrench size={32} />,
      artigos: ['Atualizações', 'Backup', 'Restauração']
    },
  ];

  const faqs = [
    {
      pergunta: 'Como faço para redefinir minha senha?',
      resposta: 'Acesse a página de login e clique em "Esqueci minha senha". Você receberá um e-mail com instruções para criar uma nova senha.'
    },
    {
      pergunta: 'Qual o horário de atendimento do suporte?',
      resposta: 'Nosso suporte técnico está disponível de segunda a sexta, das 8h às 20h, e aos sábados das 9h às 14h.'
    },
    {
      pergunta: 'Como reportar um bug ou problema?',
      resposta: 'Você pode abrir um chamado através da Área do Cliente ou entrar em contato pelo telefone 0800 770 3320.'
    },
    {
      pergunta: 'Onde encontro os manuais do sistema?',
      resposta: 'Todos os manuais estão disponíveis na seção de Documentação da Área do Cliente, organizados por produto.'
    },
    {
      pergunta: 'Como solicitar uma nova funcionalidade?',
      resposta: 'Envie sua sugestão através do formulário na Área do Cliente. Nossa equipe de produto avalia todas as sugestões.'
    },
  ];

  const canais = [
    {
      icon: <Phone size={32} />,
      titulo: '11 4003-7258',
      descricao: 'Atendimento telefônico',
      horario: 'Segunda a Sexta -feira das 8h às 19h'
      
      
    },
    {
      icon: <Mail size={32} />,
      titulo: 'suporte@unimaxx.com.br',
      descricao: 'Suporte por e-mail',
      horario: 'Resposta em até 24h'
    },
    {
      icon: <MessageCircle size={32} />,
      titulo: 'Chat Online',
      descricao: 'Atendimento em tempo real',
      horario: 'Seg-Sex: 8h às 18h'
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <PageBanner page="suporte" fallback={
        <section style={{ background: 'linear-gradient(110deg,#070709 0%,#111118 100%)', minHeight: 380, paddingTop: 68, display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '3rem 2rem', position: 'relative', zIndex: 2, textAlign: 'center' }}>
            <h1 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: 'clamp(2.2rem,4.5vw,3.5rem)', color: '#fff', letterSpacing: '-.03em', margin: '0 0 16px' }}>Central de Suporte</h1>
            <p style={{ color: 'rgba(255,255,255,.45)', fontSize: '1.05rem', maxWidth: 500, margin: '0 auto' }}>Como podemos ajudar você hoje?</p>
          </div>
        </section>
      } />

      {/* Categorias */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              Categorias
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold text-foreground">
              Escolha um <span className="text-primary">tema</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categorias.map((categoria, index) => (
              <div 
                key={index} 
                className="bg-card border border-border rounded-2xl p-8 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                  {categoria.icon}
                </div>

                <h3 className="text-xl font-semibold text-foreground mb-4 group-hover:text-primary transition-colors">
                  {categoria.titulo}
                </h3>

                <ul className="space-y-2">
                  {categoria.artigos.map((artigo, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ArrowRight size={14} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      {artigo}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              FAQ
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold text-foreground">
              Perguntas <span className="text-primary">Frequentes</span>
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                    <HelpCircle size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      {faq.pergunta}
                    </h3>
                    <p className="text-muted-foreground">
                      {faq.resposta}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Canais */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              Contato
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold text-foreground">
              Canais de <span className="text-primary">Atendimento</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {canais.map((canal, index) => (
              <div 
                key={index} 
                className="bg-card border border-border rounded-2xl p-8 shadow-sm text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
                  {canal.icon}
                </div>

                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {canal.titulo}
                </h3>

                <p className="text-muted-foreground mb-2">
                  {canal.descricao}
                </p>

                <p className="text-sm text-primary font-medium">
                  {canal.horario}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Suporte;