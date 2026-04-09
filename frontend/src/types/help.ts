// Tipos para o módulo de Central de Ajuda

export interface HelpCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  order_position: number;
  created_at?: string;
  updated_at?: string;
}

export interface HelpArticle {
  id: number;
  category_id: number;
  title: string;
  slug: string;
  short_description: string;
  content: string;
  youtube_url?: string;
  order_position: number;
  status: number;
  views: number;
  created_at?: string;
  updated_at?: string;
  category_name?: string;
  category_slug?: string;
}

export interface HelpImage {
  id: number;
  article_id: number;
  image_path: string;
  alt_text: string;
  order_position: number;
  created_at?: string;
}

export interface HelpArticleDetail extends HelpArticle {
  images: HelpImage[];
}

export interface HelpSearchResult {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  category_name: string;
  category_slug: string;
}
