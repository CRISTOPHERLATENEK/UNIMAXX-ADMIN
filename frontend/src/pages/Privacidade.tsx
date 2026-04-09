import { Shield, Lock, Calendar, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { Header } from '@/sections/Header';
import { Footer } from '@/sections/Footer';

function renderContent(text: string) {
  return text.split('\n\n').map((block, bi) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith('- ')) {
      const items = trimmed.split('\n').filter(l => l.startsWith('- ')).map(l => l.slice(2));
      return (
        <ul key={bi} className="space-y-2 my-4 pl-2">
          {items.map((item, ii) => (
            <li key={ii} className="flex items-start gap-2 text-gray-600">
              <span className="text-orange-500 mt-1 flex-shrink-0">•</span>
              <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>') }} />
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p key={bi} className="text-gray-600 leading-relaxed mb-4"
        dangerouslySetInnerHTML={{ __html: trimmed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>') }} />
    );
  });
}

const DEFAULT_PRIVACIDADE = {
  title: 'Política de Privacidade',
  subtitle: 'Sua privacidade é importante para nós. Saiba como protegemos seus dados.',
  updated_at: '15 de janeiro de 2025',
  intro: 'Esta empresa está comprometida em proteger a privacidade e segurança dos dados pessoais de todos os nossos clientes, parceiros e usuários. Esta política descreve como coletamos, usamos, armazenamos e protegemos suas informações, em conformidade com a Lei Geral de Proteção de Dados (LGPD).',
  sections: [
    { id: '1', title: '1. Dados que Coletamos', visible: true, content: 'Podemos coletar os seguintes tipos de informações:\n\n- **Dados de identificação:** nome, CPF, CNPJ, endereço, e-mail, telefone\n- **Dados de uso:** informações sobre como você usa nossos produtos e serviços\n- **Dados técnicos:** endereço IP, tipo de navegador, sistema operacional\n- **Dados de comunicação:** mensagens, solicitações de suporte e feedbacks' },
    { id: '2', title: '2. Como Usamos seus Dados', visible: true, content: 'Utilizamos as informações coletadas para:\n\n- Fornecer, manter e melhorar nossos serviços\n- Processar transações e enviar comunicações relacionadas\n- Enviar informações técnicas, atualizações e alertas de segurança\n- Responder a comentários, perguntas e solicitações de suporte\n- Cumprir obrigações legais e regulatórias' },
    { id: '3', title: '3. Compartilhamento de Dados', visible: true, content: 'Não vendemos, negociamos ou transferimos suas informações pessoais a terceiros sem o seu consentimento, exceto nas seguintes situações:\n\n- Prestadores de serviço que auxiliam na operação dos nossos serviços\n- Cumprimento de obrigações legais ou ordens judiciais\n- Proteção dos direitos, propriedade ou segurança da empresa e de terceiros' },
    { id: '4', title: '4. Segurança dos Dados', visible: true, content: 'Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição. Isso inclui criptografia SSL, controles de acesso e monitoramento contínuo de segurança.' },
    { id: '5', title: '5. Seus Direitos (LGPD)', visible: true, content: 'De acordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem os seguintes direitos:\n\n- **Acesso:** confirmar a existência de tratamento e acessar seus dados\n- **Correção:** solicitar a atualização de dados incompletos, inexatos ou desatualizados\n- **Exclusão:** solicitar a exclusão de dados desnecessários ou tratados em desconformidade\n- **Portabilidade:** receber seus dados em formato estruturado\n- **Oposição:** opor-se ao tratamento realizado com fundamento em legítimo interesse' },
    { id: '6', title: '6. Contato', visible: true, content: 'Para exercer seus direitos ou tirar dúvidas sobre esta política, entre em contato conosco através dos canais disponíveis em nossa página de contato.' },
  ],
};

function Privacidade() {
  const { data } = useData();
  const ct = data.content || {};
  const settings = data.settings || {};
  const pc = settings.primary_color || '#f97316';

  let doc = DEFAULT_PRIVACIDADE;
  try {
    if (ct['privacidade.data']) {
      const parsed = JSON.parse(ct['privacidade.data']);
      if (parsed.title) doc = parsed;
    }
  } catch {}

  const visibleSections = (doc.sections || []).filter(s => s.visible !== false);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="relative py-24 bg-[#1d1d1f] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-600 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1 bg-white/10 text-orange-400 rounded-full text-sm font-medium mb-6 border border-white/10">Legal</span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">{doc.title || 'Política de Privacidade'}</h1>
          {doc.subtitle && <p className="text-xl text-gray-300 max-w-2xl mx-auto">{doc.subtitle}</p>}
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">

          {/* Info box */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-10 flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${pc}18` }}>
              <Shield size={20} style={{ color: pc }} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-1">{doc.title || 'Política de Privacidade'}</h2>
              <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                <Calendar size={13} />
                <span>Última atualização: {doc.updated_at || '—'}</span>
              </div>
              {doc.intro && <p className="text-gray-600 text-sm mt-3 leading-relaxed">{doc.intro}</p>}
            </div>
          </div>

          {/* Índice */}
          {visibleSections.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-5 mb-10">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Índice</p>
              <ul className="space-y-1.5">
                {visibleSections.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#section-${s.id}`}
                      className="text-sm text-gray-600 hover:text-orange-600 transition flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                        style={{ background: `${pc}15`, color: pc }}>{i + 1}</span>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Seções */}
          <div className="space-y-10">
            {visibleSections.map(section => (
              <div key={section.id} id={`section-${section.id}`}>
                <div className="flex items-center gap-3 mb-4">
                  <Lock size={18} style={{ color: pc }} className="flex-shrink-0" />
                  <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                </div>
                <div className="pl-8">
                  {renderContent(section.content || '')}
                </div>
              </div>
            ))}
          </div>

          {/* Rodapé do documento */}
          <div className="mt-16 pt-8 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4 text-sm text-gray-400">
            <span>Última atualização: {doc.updated_at}</span>
            <Link to="/termos" className="hover:text-orange-600 transition">
              Ver Termos de Uso →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Privacidade;
