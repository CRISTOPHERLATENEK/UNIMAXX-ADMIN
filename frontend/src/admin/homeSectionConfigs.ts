import { Image as ImageIcon, Layers3, Link2, Phone, Sparkles, LayoutTemplate } from 'lucide-react';
import type React from 'react';
import type { ImgSpec } from '@/components/ImageUploadField';

export type HomeFieldType = 'text' | 'textarea' | 'image' | 'toggle';

export type HomeFieldDef = {
  key: string;
  label: string;
  type?: HomeFieldType;
  placeholder?: string;
  rows?: number;
  hint?: string;
  spec?: ImgSpec;
};

export type HomeSectionDef = {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  previewUrl: string;
  fields: HomeFieldDef[];
};

export const HOME_SECTION_CONFIGS = {
  photoHighlight: {
    id: 'photo-highlight',
    icon: ImageIcon,
    title: 'Foto com escrita',
    description: 'Bloco extra para enriquecer a home com imagem, texto e botão.',
    previewUrl: '/#home-highlight',
    fields: [
      { key: 'home_highlight.enabled', label: 'Exibir bloco na home', type: 'toggle', hint: 'Ative para mostrar este destaque na página inicial.' },
      { key: 'home_highlight.badge', label: 'Badge / etiqueta', placeholder: 'Destaque especial' },
      { key: 'home_highlight.title', label: 'Título', type: 'textarea', rows: 2, placeholder: 'Tecnologia, atendimento e performance para fazer sua operação crescer.' },
      { key: 'home_highlight.description', label: 'Descrição', type: 'textarea', rows: 4, placeholder: 'Use este espaço para reforçar proposta de valor, campanha ou institucional da empresa.' },
      { key: 'home_highlight.cta_text', label: 'Texto do botão', placeholder: 'Falar com especialista' },
      { key: 'home_highlight.cta_link', label: 'Link do botão', placeholder: '/cliente' },
      { key: 'home_highlight.image_position', label: 'Posição da foto', type: 'text', placeholder: 'left  ← ou →  right', hint: 'Digite "left" para foto à esquerda ou "right" para foto à direita do texto.' },
      {
        key: 'home_highlight.image',
        label: 'Foto do destaque',
        type: 'image',
        hint: 'Imagem ampla para acompanhar o texto da home.',
        spec: {
          dimensions: '1600 × 900 px',
          formats: 'JPG, PNG, WEBP',
          maxSize: '2 MB',
          where: 'Bloco de destaque da home',
          objectFit: 'cover',
          tip: 'Prefira imagens horizontais com boa área livre para o texto.',
        },
      },
    ],
  } satisfies HomeSectionDef,
  quicklinks: {
    id: 'quicklinks',
    icon: Link2,
    title: 'Links rápidos',
    description: 'Títulos da faixa de atalhos logo abaixo do banner.',
    previewUrl: '/#quicklinks',
    fields: [
      { key: 'quicklinks.title', label: 'Título da seção', placeholder: 'Acesso Rápido' },
      { key: 'quicklinks.subtitle', label: 'Subtítulo', placeholder: 'Encontre o que precisa com agilidade' },
    ],
  } satisfies HomeSectionDef,
  solutions: {
    id: 'solutions',
    icon: Layers3,
    title: 'Soluções',
    description: 'Textos introdutórios da vitrine de soluções da home.',
    previewUrl: '/#solutions',
    fields: [
      { key: 'solutions.title', label: 'Título da seção', placeholder: 'Nossas Soluções' },
      { key: 'solutions.subtitle', label: 'Linha 1', placeholder: 'Tecnologia completa para o seu' },
      { key: 'solutions.subtitle2', label: 'Linha 2 em destaque', placeholder: 'negócio crescer' },
      { key: 'solutions.description', label: 'Descrição', type: 'textarea', rows: 3, placeholder: 'Explique resumidamente o portfólio de soluções.' },
      { key: 'solutions.viewAll', label: 'Texto do botão', placeholder: 'Ver Todas as Soluções' },
    ],
  } satisfies HomeSectionDef,
  stats: {
    id: 'stats',
    icon: Sparkles,
    title: 'Números / estatísticas',
    description: 'Cabeçalho da seção de indicadores da home.',
    previewUrl: '/#numbers',
    fields: [
      { key: 'stats.title', label: 'Título', placeholder: 'Nossos Números' },
      { key: 'stats.subtitle', label: 'Subtítulo', placeholder: 'Resultados que comprovam nossa presença' },
      { key: 'stats.description', label: 'Descrição', type: 'textarea', rows: 3, placeholder: 'Texto curto para contextualizar os números.' },
    ],
  } satisfies HomeSectionDef,
  segments: {
    id: 'segments',
    icon: LayoutTemplate,
    title: 'Segmentos',
    description: 'Texto da seção que apresenta os segmentos atendidos.',
    previewUrl: '/#segmentos',
    fields: [
      { key: 'segments.title', label: 'Título da seção', placeholder: 'Segmentos Atendidos' },
      { key: 'segments.subtitle', label: 'Linha 1', placeholder: 'Soluções para cada' },
      { key: 'segments.subtitle2', label: 'Linha 2 em destaque', placeholder: 'setor do varejo' },
      { key: 'segments.description', label: 'Descrição', type: 'textarea', rows: 3, placeholder: 'Mostre a amplitude dos setores atendidos.' },
      { key: 'segments.viewAll', label: 'Texto do botão', placeholder: 'Ver Todos os Segmentos' },
    ],
  } satisfies HomeSectionDef,
  differentials: {
    id: 'differentials',
    icon: Sparkles,
    title: 'Diferenciais',
    description: 'Argumentos de valor para reforçar confiança na home.',
    previewUrl: '/#diferenciais',
    fields: [
      { key: 'differentials.title', label: 'Título', placeholder: 'Por que a sua empresa deveria escolher a Unimaxx?' },
      { key: 'differentials.subtitle', label: 'Linha 1', placeholder: 'Nossos' },
      { key: 'differentials.subtitle2', label: 'Linha 2 em destaque', placeholder: 'diferenciais' },
      { key: 'differentials.description', label: 'Descrição', type: 'textarea', rows: 3, placeholder: 'Texto de apoio antes dos cards.' },
    ],
  } satisfies HomeSectionDef,
  contact: {
    id: 'contact',
    icon: Phone,
    title: 'Contato / CTA final',
    description: 'Último bloco da home, com chamada comercial e formulário.',
    previewUrl: '/#contato',
    fields: [
      { key: 'contact.title', label: 'Título', placeholder: 'Vamos' },
      { key: 'contact.subtitle', label: 'Palavra em destaque', placeholder: 'conversar?' },
      { key: 'contact.description', label: 'Descrição', type: 'textarea', rows: 3, placeholder: 'Texto que incentiva o lead a preencher o formulário.' },
      { key: 'contact.form.title', label: 'Título do formulário', placeholder: 'Receba uma ligação' },
      { key: 'contact.form.submit', label: 'Texto do botão enviar', placeholder: 'Solicitar contato' },
      { key: 'contact.phone', label: 'Telefone principal', placeholder: '(11) 4003-0000' },
      { key: 'contact.email', label: 'E-mail', placeholder: 'contato@empresa.com.br' },
      { key: 'contact.whatsapp', label: 'WhatsApp (somente números)', placeholder: '5511999999999' },
    ],
  } satisfies HomeSectionDef,
} as const;

export type HomeSectionKey = keyof typeof HOME_SECTION_CONFIGS;
