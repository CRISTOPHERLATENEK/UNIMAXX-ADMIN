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
  /* ── Tipografia & estilo individual do card ── */
  card_accent_color?: string;   // cor do botão/gradiente deste card
  card_title_color?: string;    // cor do título no card e no modal
  card_body_color?: string;     // cor do texto descritivo no modal
  card_font_heading?: string;   // fonte do título (override)
  card_font_body?: string;      // fonte do corpo (override)
  card_title_weight?: string;   // peso do título
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
  cta2_text?: string;
  cta2_link?: string;
  order_num: number;
  active: number;
  use_default_bg: number;
  use_style: number;
  bg_color?: string;
  accent_color2?: string;
  page?: string;
  banner_style?: string;
  starts_at?: string;
  ends_at?: string;
  // Novos campos de controle avançado
  image_opacity?: number;          // 0.05–1.0 (default 0.5)
  text_align?: 'left' | 'center' | 'right';
  text_position?: 'left' | 'center' | 'right';
  banner_height?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  overlay_intensity?: number;      // 0.1–1.0 (default 0.85)
  badge_icon?: string;
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
export type FeaturesLayout = 'dark_numbered' | 'grid' | 'checklist' | 'cards_hover' | 'bento' | 'highlight_list' | 'minimal_pills' | 'split_dark' | 'dark_cards' | 'half_split' | 'community_connect';
export type BenefitsLayout = 'grid_cards' | 'side_image' | 'carousel';
export type BlockSpacing = 'compact' | 'normal' | 'spacious';
export type BlockRadius = 'none' | 'medium' | 'large';

// Fundo contínuo entre blocos
export type ContinuousBgMode = 'none' | 'self' | 'parent' | 'fixed' | 'js_offset';
export type ContinuousBgType = 'gradient' | 'solid' | 'image';
export type SectionShape = 'none' | 'wave' | 'wave-soft' | 'diagonal-right' | 'diagonal-left' | 'arc-down' | 'arc-up' | 'zigzag' | 'slant-both';

export interface PageBlock {
  id: string;
  type: BlockType;
  visible: boolean;
  // hero
  heroLayout?: 'centered' | 'centered_dark' | 'split' | 'dark_glow' | 'magazine' | 'cinematic';
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
  featuresNoWrapper?: boolean;
  featuresAccent?: string;
  featuresLabel?: string;
  benefitsLayout?: BenefitsLayout;
  // spacing & border radius (new)
  blockSpacing?: BlockSpacing;
  blockRadius?: BlockRadius;
  // lists
  items?: string[];
  // items with icons (new)
  iconItems?: {
    icon: string;
    label: string;
    desc?: string;
    align?: 'left' | 'center' | 'right';
    width?: number;
    paddingH?: number;
    paddingV?: number;
    fontSize?: number;
    descSize?: number;
    iconSize?: number;
    bold?: boolean;
    accentColor?: string;
  }[];
  // steps
  steps?: { title: string; description: string; number?: string }[];
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
  // image_text visual options
  imageBgColor?: string;
  imageHasBg?: boolean;
  imageContain?: boolean;
  imageMaxHeight?: number;
  // alert_banner
  alertType?: 'info' | 'success' | 'warning' | 'error';
  alertText?: string;
  // divider
  dividerStyle?: 'line' | 'space' | 'dots' | 'gradient' | 'dashed' | 'double' | 'wave' | 'ornament' | 'triangle' | 'clouds' | 'waves_fill' | 'mountains';
  dividerColor?: string;
  // animated background
  animatedBg?: 'none' | 'particles' | 'aurora' | 'grid' | 'waves' | 'pulse' | 'stars' | 'oxpay';
  animatedBgColor?: string;
  // richtext
  html?: string;
  // community_connect layout
  communityBgColor?: string;
  communityTextColor?: string;
  communityAccentColor?: string;
  communityMutedColor?: string;
  communityEyebrow?: string;
  communityCards?: { title: string; desc: string; linkLabel: string; linkUrl: string }[];
  // ── Fundo contínuo entre blocos ──────────────────────────────────────────
  continuousBgMode?: ContinuousBgMode;
  continuousBgType?: ContinuousBgType;
  continuousBgColor1?: string;
  continuousBgColor2?: string;
  continuousBgAngle?: number;
  continuousBgImage?: string;
  continuousBgOpacity?: number;
  // ── Forma da seção (corte SVG no topo/base) ──────────────────────────────
  sectionShapeTop?: SectionShape;
  sectionShapeBottom?: SectionShape;
  sectionShapeColor?: string;
  sectionShapeSize?: number; // 1–5, default 3
  // ── Per-block colour overrides ────────────────────────────────────────────
  bgColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  ctaBgColor?: string;
  ctaTextColor?: string;
  // ── Per-block font sizes ──────────────────────────────────────────────────
  titleSize?: string;
  subtitleSize?: string;
  // ── Layout / style variants ───────────────────────────────────────────────
  blockStyle?: string;
  block_style?: string;
  ctaLayout?: string;
  // ── Standalone CTA fields ─────────────────────────────────────────────────
  ctaText?: string;
  ctaUrl?: string;
  ctaBtnBg?: string;
  ctaBtnText?: string;
  socialProof?: string;
  // ── Integrations block ────────────────────────────────────────────────────
  logoItems?: { name: string; imageUrl: string }[];
  // ── Testimonial block ─────────────────────────────────────────────────────
  company?: string;
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