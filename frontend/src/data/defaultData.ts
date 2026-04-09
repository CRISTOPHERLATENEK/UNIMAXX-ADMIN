import type { SiteData } from '@/types';

export const defaultData: SiteData = {
  content: {
    'header.logo': 'Unimaxx',
    'header.nav.solutions': 'Soluções',
    'header.nav.segments': 'Segmentos',
    'header.nav.institutional': 'Institucional',
    'header.nav.support': 'Suporte',
    'header.nav.contact': 'Fale Conosco',

    'hero.badge': 'Líder em Tecnologia para Varejo',
    'hero.title': 'Tem solução pra tudo,',
    'hero.subtitle': 'tem Unimaxx pra tudo',
    'hero.description':
      'De cada esquina às maiores redes varejistas, nós estamos lá. Somos a resposta confiável que você precisa para prosperar.',
    // CTA do Hero é controlado via /admin/banners (campo cta_text/cta_link).
    // Estas chaves são legadas — mantidas para compatibilidade, alinhadas ao ContentManager.
    'hero.cta_primary': 'Receba uma Ligação',
    'hero.cta_secondary': 'Conheça as Soluções',
    'hero.image': '',

    'home_highlight.enabled': '0',
    'home_highlight.badge': 'Destaque',
    'home_highlight.title': '',
    'home_highlight.description': '',
    'home_highlight.cta_text': '',
    'home_highlight.cta_link': '/cliente',
    'home_highlight.image': '',

    'quicklinks.0.id': 'erp',
    'quicklinks.0.title': 'ERP',
    'quicklinks.0.subtitle': 'Gestão Completa',

    'quicklinks.1.id': 'pdv',
    'quicklinks.1.title': 'PDV',
    'quicklinks.1.subtitle': 'Ponto de Venda',

    'quicklinks.2.id': 'digital',
    'quicklinks.2.title': 'Digital',
    'quicklinks.2.subtitle': 'E-commerce',

    'quicklinks.3.id': 'bi',
    'quicklinks.3.title': 'BI',
    'quicklinks.3.subtitle': 'Inteligência',

    'solutions.title': 'Nossas Soluções',
    'solutions.subtitle': 'Sim, nós temos o que seu',
    'solutions.subtitle2': 'negócio precisa!',
    'solutions.description':
      'A Unimaxx possui mais de 50 soluções em ERP, PDV, digital, autoatendimento, delivery e muito mais.',
    'solutions.viewAll': 'Ver Todas as Soluções',

    'stats.title': '',
    'stats.subtitle': '',
    'stats.description': '',

    'segments.title': 'Atendemos',
    'segments.subtitle': 'todos os segmentos',
    'segments.subtitle2': 'do varejo',
    'segments.description': 'Soluções especializadas para cada tipo de negócio.',
    'segments.viewAll': 'Ver Todos os Segmentos',

    'differentials.title': 'Por que Unimaxx?',
    'differentials.subtitle': 'Nossos',
    'differentials.subtitle2': 'diferenciais',

    'contact.title': 'Vamos',
    'contact.subtitle': 'conversar?',
    'contact.description':
      'Ligamos para você em até 1h. Fale sobre os desafios do seu negócio e encontre a solução ideal.',
    'contact.phone': '0800 770 3320',
    'contact.email': 'contato@unimaxx.com.br',
    'contact.address': 'Rua Exemplo, 123 – Centro – Cidade/UF – CEP 00000-000',
    'contact.whatsapp': '5547999990000',
    'contact.hours': 'Segunda a Sexta, 8h às 18h',

    'contact.form.title': 'Receba uma ligação',
    'contact.form.name': 'Nome',
    'contact.form.phone': 'Telefone',
    'contact.form.email': 'E-mail',
    'contact.form.segment': 'Segmento',
    'contact.form.message': 'Mensagem',
    'contact.form.submit': 'Solicitar Contato',

    'footer.company': 'Unimaxx',
    'footer.description':
      'Soluções tecnológicas para o seu negócio crescer com eficiência.',
    'footer.copyright': `© ${new Date().getFullYear()} Unimaxx.`,
  },

  solutions: [
    {
      id: '1',
      solution_id: 'unimaxx-erp',
      title: 'Maxx ERP',
      description: 'Sistema completo de gestão empresarial.',
      features: ['Gestão financeira', 'Controle de estoque', 'Fiscal', 'Compras'],
      cta_text: 'Saiba mais',
      icon: 'Building2',
      order_num: 0,
      active: 1,
    },
  ],

  segments: [],
  stats: [],
  banners: [],
  settings: {},
  client_logos: [],
  testimonials: [],
  partners: [],
};
