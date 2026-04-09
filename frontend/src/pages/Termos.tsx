import { FileText, Scale, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { Header } from '@/sections/Header';
import { Footer } from '@/sections/Footer';

function renderContent(text: string) {
  return text.split('\n\n').map((block, bi) => {
    const trimmed = block.trim();
    if (!trimmed) return null;

    // Lista com -
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

const DEFAULT_TERMOS = {
  title: 'Termos de Uso',
  subtitle: 'Condições e regras para utilização dos nossos serviços.',
  updated_at: '15 de janeiro de 2025',
  intro: 'Ao acessar e utilizar os serviços desta empresa, você concorda com os termos e condições descritos abaixo. Leia atentamente antes de utilizar nossos produtos e serviços.',
  sections: [
    { id: '1', title: '1. Aceitação dos Termos', visible: true, content: 'Ao acessar ou usar qualquer serviço, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não poderá acessar ou usar nossos serviços.' },
    { id: '2', title: '2. Descrição dos Serviços', visible: true, content: 'Fornecemos soluções tecnológicas para gestão empresarial, incluindo sistemas ERP, PDV e plataformas de e-commerce. Os serviços são fornecidos mediante contrato e sujeitos às condições estabelecidas.' },
    { id: '3', title: '3. Propriedade Intelectual', visible: true, content: 'Todo o conteúdo, incluindo mas não limitado a software, textos, gráficos, logos e interfaces, é propriedade exclusiva da empresa e protegido por leis de direitos autorais.' },
    { id: '4', title: '4. Limitação de Responsabilidade', visible: true, content: 'Não nos responsabilizamos por danos indiretos, incidentais ou consequentes decorrentes do uso ou da incapacidade de usar nossos serviços, mesmo que tenhamos sido avisados da possibilidade de tais danos.' },
    { id: '5', title: '5. Alterações nos Termos', visible: true, content: 'Reservamos o direito de modificar estes termos a qualquer momento. As alterações entram em vigor imediatamente após a publicação. O uso continuado dos serviços após as alterações constitui aceitação dos novos termos.' },
  ],
};

function Termos() {
  const { data } = useData();
  const ct = data.content || {};
  const settings = data.settings || {};
  const pc = settings.primary_color || '#f97316';

  let doc = DEFAULT_TERMOS;
  try {
    if (ct['termos.data']) {
      const parsed = JSON.parse(ct['termos.data']);
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
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">{doc.title || 'Termos de Uso'}</h1>
          {doc.subtitle && <p className="text-xl text-gray-300 max-w-2xl mx-auto">{doc.subtitle}</p>}
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">

          {/* Info box */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-10 flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${pc}18` }}>
              <Scale size={20} style={{ color: pc }} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 mb-1">{doc.title || 'Termos e Condições'}</h2>
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
                  <FileText size={20} style={{ color: pc }} className="flex-shrink-0" />
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
            <Link to="/privacidade" className="hover:text-orange-600 transition">
              Ver Política de Privacidade →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Termos;
