// ─── Core site types ───────────────────────────────────────────────────────

export interface Solution {
  id: string;
  solution_id: string;
  title: string;
  description: string;
  features: string[];
  cta_text: string;
  icon: string;
  image?: string;
  order_num: number;
  active: number;
  nav_link?: string | null;
}

export interface Segment {
  id: string;
  segment_id: string;
  name: string;
  description: string;
  icon: string;
  image?: string;
  order_num: number;
  active: number;
  show_home?: number;
}

export interface NumberStat {
  id: string;
  stat_id: string;
  value: string;
  label: string;
  suffix: string;
  section?: string;
  order_num: number;
  active: number;
}

export interface Banner {
  id?: number;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  cta_text?: string;
  cta_link?: string;
  order_num: number;
  active: number;
  use_default_bg: number;
  use_style: number;
  bg_color?: string;
  page?: string;
  banner_style?: string;
}

export interface ClientLogo {
  id: number;
  name: string;
  image: string;
  url: string;
  order_num: number;
  active: number;
}

export interface Testimonial {
  id: number;
  author_name: string;
  author_role: string;
  author_company: string;
  author_photo: string;
  content: string;
  rating: number;
  order_num: number;
  active: number;
}

export interface Partner {
  id: number;
  name: string;
  image: string;
  url: string;
  category: string;
  order_num: number;
  active: number;
}

export type SiteContent = Record<string, string>;

export interface SiteData {
  content: SiteContent;
  solutions: Solution[];
  segments: Segment[];
  stats: NumberStat[];
  banners: Banner[];
  settings: Record<string, string>;
  client_logos: ClientLogo[];
  testimonials: Testimonial[];
  partners: Partner[];
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ─── Page Builder Block ──────────────────────────────────────────────────────

export type BlockType =
  | 'hero'
  | 'features'
  | 'benefits'
  | 'steps'
  | 'stats'
  | 'testimonial'
  | 'faq'
  | 'video'
  | 'cta'
  | 'text'
  | 'richtext'
  | 'image'
  | 'integrations'
  | 'alert_banner'
  | 'image_text'
  | 'divider';

// Variantes de layout para blocks específicos
export type FeaturesLayout = 'dark_numbered';
export type BenefitsLayout = 'grid_cards' | 'side_image' | 'carousel';
export type BlockSpacing = 'compact' | 'normal' | 'spacious';
export type BlockRadius = 'none' | 'medium' | 'large';

export interface PageBlock {
  id: string;
  type: BlockType;
  visible: boolean;
  // hero
  heroLayout?: 'centered' | 'split' | 'dark_glow' | 'magazine' | 'cinematic';
  bannerStyle?: 'cinematic' | 'neon' | 'editorial' | 'split' | 'bold' | 'parallax';
  accentColor?: string;
  badge?: string;
  // common
  title?: string;
  subtitle?: string;
  description?: string;
  colorTheme?: 'light' | 'dark' | 'brand';
  // layout variants (new)
  featuresLayout?: FeaturesLayout;
  benefitsLayout?: BenefitsLayout;
  // spacing & border radius (new)
  blockSpacing?: BlockSpacing;
  blockRadius?: BlockRadius;
  // lists
  items?: string[];
  // items with icons (new)
  iconItems?: { icon: string; label: string; desc?: string }[];
  // steps
  steps?: { title: string; description: string }[];
  // stats
  stats?: { label: string; value: string }[];
  // faq
  faq?: { question: string; answer: string }[];
  // testimonial
  quote?: string;
  author?: string;
  role?: string;
  // video
  videoUrl?: string;
  // cta / hero buttons
  ctaLabel?: string;
  ctaLink?: string;
  secondaryLabel?: string;
  secondaryLink?: string;
  // image
  imageUrl?: string;
  imageAlt?: string;
  imagePosition?: 'left' | 'right';
  // multiple images (image_text block)
  images?: { url: string; alt: string }[];
  // alert_banner
  alertType?: 'info' | 'success' | 'warning' | 'error';
  alertText?: string;
  // divider
  dividerStyle?: 'line' | 'space' | 'dots';
  // richtext
  html?: string;
}

// ─── Solution Pages (lean — conteúdo vive em blocks_json) ────────────────────

export interface SolutionPage {
  id: number;
  slug: string;
  title: string;
  icon: string;
  color_theme: 'orange' | 'blue' | 'green' | 'purple' | 'black' | 'white';
  meta_title?: string;
  meta_description?: string;
  is_active: boolean;
  blocks_json: PageBlock[];
  created_at?: string;
  updated_at?: string;
}

// ─── Generic Pages (CMS via Page Builder) ────────────────────────────────────

export interface GenericPage {
  id: number;
  slug: string;
  title: string;
  meta_title?: string;
  meta_description?: string;
  is_active: boolean;
  blocks_json: PageBlock[];
  created_at?: string;
  updated_at?: string;
}
