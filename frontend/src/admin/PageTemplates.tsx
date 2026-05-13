import React from 'react';
import { X } from 'lucide-react';
import type { PageBlock, BlockType } from '@/types';

interface PageTemplatesProps {
  open: boolean;
  onClose: () => void;
  onSelect: (blocks: PageBlock[]) => void;
}

function makeBlock(type: BlockType): PageBlock {
  const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const b: PageBlock = { id, type, visible: true, blockSpacing: 'normal', blockRadius: 'large' };
  if (type === 'hero') return { ...b, heroLayout: 'centered', title: '', subtitle: '', description: '', ctaLabel: 'Falar com Especialista', ctaLink: '/cliente', colorTheme: 'brand', badge: '' };
  if (type === 'features') return { ...b, title: 'Os blocos de uma plataforma poderosa', featuresLabel: 'FEATURES', items: [], colorTheme: 'dark', featuresLayout: 'split_dark', featuresAccent: '#f97316' };
  if (type === 'benefits') return { ...b, title: 'Benefícios', items: [], benefitsLayout: 'grid_cards', colorTheme: 'dark' };
  if (type === 'stats') return { ...b, stats: [], colorTheme: 'light' };
  if (type === 'cta') return { ...b, title: '', description: '', ctaLabel: 'Falar com Especialista', ctaLink: '/cliente', colorTheme: 'brand', ctaLayout: 'pill', badge: '', socialProof: '', ctaBgColor: '#f97316', ctaBtnBg: '#ffffff', ctaBtnText: '#f97316' };
  if (type === 'text') return { ...b, title: '', description: '', colorTheme: 'light' };
  if (type === 'richtext') return { ...b, html: '', colorTheme: 'light' };
  if (type === 'faq') return { ...b, title: 'Perguntas Frequentes', faq: [], colorTheme: 'light' };
  if (type === 'team') return { ...b, title: 'Nossa equipe', subtitle: 'Pessoas que fazem isso acontecer.', colorTheme: 'light', teamLayout: 'grid', teamColumns: 3, teamMembers: [] };
  if (type === 'pricing') return { ...b, title: 'Planos para todo tamanho de negócio', subtitle: 'Comece pequeno. Cresça quando quiser.', colorTheme: 'light', pricingShowToggle: true, pricingAnnualDiscountLabel: 'Economize 20%', pricingPlans: [] };
  return b;
}

interface TemplateDefinition {
  emoji: string;
  name: string;
  description: string;
  color: string;
  blocks: () => PageBlock[];
}

const TEMPLATES: TemplateDefinition[] = [
  {
    emoji: '🚀',
    name: 'Landing Page',
    description: 'Hero + Features + Stats + CTA',
    color: '#f97316',
    blocks: () => [
      { ...makeBlock('hero'), title: 'Transforme seu negócio com tecnologia', subtitle: 'A solução completa para sua operação', description: 'Simplifique processos, aumente vendas e tenha controle total.', ctaLabel: 'Começar agora', ctaLink: '/cliente' },
      { ...makeBlock('features'), title: 'Tudo que você precisa em um só lugar', featuresLayout: 'grid_cards' as any, items: ['Gestão de estoque em tempo real', 'PDV integrado e fácil de usar', 'Relatórios automáticos', 'Integrações fiscais nativas', 'Suporte 24/7', 'App para celular'] },
      { ...makeBlock('stats'), stats: [{ label: 'Clientes ativos', value: '10.000+' }, { label: 'Uptime garantido', value: '99.9%' }, { label: 'NPS', value: '92' }, { label: 'Anos no mercado', value: '10+' }] },
      { ...makeBlock('cta'), title: 'Pronto para começar?', description: 'Fale com um especialista e veja como podemos ajudar.', ctaLabel: 'Falar com Especialista', ctaLink: '/cliente' },
    ],
  },
  {
    emoji: '🏢',
    name: 'Sobre a Empresa',
    description: 'Hero + Texto + Equipe + CTA',
    color: '#3b82f6',
    blocks: () => [
      { ...makeBlock('hero'), heroLayout: 'centered', title: 'Nossa história', subtitle: 'Quem somos e o que nos move', colorTheme: 'brand' },
      { ...makeBlock('text'), title: 'Uma empresa comprometida com resultados', description: 'Desde nossa fundação, temos como missão simplificar a gestão de negócios e impulsionar o crescimento dos nossos clientes com tecnologia acessível e suporte humano.' },
      { ...makeBlock('team'), title: 'Nosso time', subtitle: 'As pessoas por trás do produto.', teamColumns: 3, teamMembers: [] },
      { ...makeBlock('cta'), title: 'Quer fazer parte disso?', description: 'Entre em contato e conheça o que podemos oferecer para o seu negócio.', ctaLabel: 'Falar Conosco', ctaLink: '/cliente' },
    ],
  },
  {
    emoji: '📦',
    name: 'Página de Produto',
    description: 'Hero + Features + Pricing + FAQ + CTA',
    color: '#8b5cf6',
    blocks: () => [
      { ...makeBlock('hero'), heroLayout: 'split', title: 'O produto que vai mudar sua operação', subtitle: 'Simples, poderoso e feito para crescer com você.', ctaLabel: 'Ver planos', ctaLink: '#precos' },
      { ...makeBlock('features'), title: 'Por que escolher nossa solução', featuresLayout: 'split_dark', items: ['Interface intuitiva e sem curva de aprendizado', 'Integração com seus sistemas atuais', 'Suporte dedicado e implantação assistida', 'Atualizações automáticas sem custo extra'] },
      { ...makeBlock('pricing'), title: 'Planos para todo tamanho de negócio', pricingShowToggle: true, pricingAnnualDiscountLabel: 'Economize 20%', pricingPlans: [] },
      { ...makeBlock('faq'), title: 'Dúvidas frequentes', faq: [{ question: 'Como funciona o período de teste?', answer: 'Você tem 14 dias grátis, sem cartão de crédito.' }, { question: 'Posso cancelar a qualquer momento?', answer: 'Sim, sem multas ou fidelidade.' }] },
      { ...makeBlock('cta'), title: 'Comece hoje mesmo', description: 'Sem taxa de setup. Sem compromisso. Cancele quando quiser.', ctaLabel: 'Testar Grátis', ctaLink: '/cliente' },
    ],
  },
  {
    emoji: '❓',
    name: 'FAQ',
    description: 'Texto + FAQ + CTA',
    color: '#f59e0b',
    blocks: () => [
      { ...makeBlock('text'), title: 'Central de Ajuda', description: 'Encontre respostas para as principais dúvidas sobre nossos produtos e serviços.' },
      { ...makeBlock('faq'), title: 'Perguntas Frequentes', faq: [{ question: 'Como entro em contato com o suporte?', answer: 'Você pode falar conosco pelo chat, e-mail ou telefone em dias úteis.' }, { question: 'Quais formas de pagamento são aceitas?', answer: 'Aceitamos boleto, cartão de crédito e Pix.' }, { question: 'Existe período de fidelidade?', answer: 'Não. Você pode cancelar sua assinatura a qualquer momento, sem multas.' }] },
      { ...makeBlock('cta'), title: 'Não encontrou o que procurava?', description: 'Nossa equipe está pronta para te ajudar.', ctaLabel: 'Falar com Suporte', ctaLink: '/cliente' },
    ],
  },
  {
    emoji: '📝',
    name: 'Blog Post',
    description: 'Hero centralizado + RichText + CTA',
    color: '#10b981',
    blocks: () => [
      { ...makeBlock('hero'), heroLayout: 'centered', title: 'Título do artigo', subtitle: 'Subtítulo ou chamada do post', colorTheme: 'light' },
      { ...makeBlock('richtext'), html: '<p>Escreva o conteúdo do seu artigo aqui. Use o editor para formatar o texto, adicionar links, imagens e muito mais.</p>' },
      { ...makeBlock('cta'), title: 'Gostou do conteúdo?', description: 'Conheça nossas soluções e veja como podemos ajudar seu negócio.', ctaLabel: 'Saber Mais', ctaLink: '/cliente' },
    ],
  },
  {
    emoji: '➕',
    name: 'Página em Branco',
    description: 'Começa sem blocos — adicione manualmente',
    color: '#64748b',
    blocks: () => [],
  },
];

export default function PageTemplates({ open, onClose, onSelect }: PageTemplatesProps) {
  if (!open) return null;

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 860, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.25)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: "'Outfit',sans-serif" }}>Escolha um modelo</h2>
            <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>Selecione um ponto de partida para sua página</p>
          </div>
          <button onClick={onClose}
            style={{ width: 36, height: 36, borderRadius: 10, background: '#f1f5f9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            <X size={16} />
          </button>
        </div>

        {/* Grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.name}
                onClick={() => { onSelect(tpl.blocks()); onClose(); }}
                style={{ padding: '20px 16px', borderRadius: 16, border: '2px solid #f1f5f9', background: '#fff', cursor: 'pointer', textAlign: 'left', transition: 'all .15s', display: 'flex', flexDirection: 'column', gap: 10 }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = tpl.color; (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 20px ${tpl.color}22`; (e.currentTarget as HTMLElement).style.background = `${tpl.color}08`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#f1f5f9'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.background = '#fff'; }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: `${tpl.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                  {tpl.emoji}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: '0 0 4px', fontFamily: "'Outfit',sans-serif" }}>{tpl.name}</p>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0, lineHeight: 1.5 }}>{tpl.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
