const { z } = require('zod');

const stringField = (max, message) => z.string().trim().max(max, message || `Máximo de ${max} caracteres`);
const requiredString = (max, label) => z.string().trim().min(1, `${label} é obrigatório`).max(max, `${label} deve ter no máximo ${max} caracteres`);
const optionalString = (max) => z.union([z.string(), z.null(), z.undefined()]).transform((value) => (value == null ? '' : String(value).trim())).refine((value) => value.length <= max, `Máximo de ${max} caracteres`);
const optionalUrlLike = (max = 2048) => optionalString(max);
const intField = (defaultValue = 0, min = 0, max = 100000) => z.union([z.number(), z.string(), z.undefined(), z.null()]).transform((value) => {
  if (value === undefined || value === null || value === '') return defaultValue;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : Number.NaN;
}).refine((value) => Number.isInteger(value) && value >= min && value <= max, `Valor deve ser um inteiro entre ${min} e ${max}`);
const boolField = (defaultValue = 1) => z.union([z.boolean(), z.number(), z.string(), z.undefined(), z.null()]).transform((value) => {
  if (value === undefined || value === null || value === '') return defaultValue;
  if (value === true || value === 1 || value === '1' || value === 'true') return 1;
  if (value === false || value === 0 || value === '0' || value === 'false') return 0;
  return defaultValue;
});
const idParamSchema = z.object({ id: z.string().trim().min(1, 'ID inválido').max(120, 'ID inválido') });
const numericIdParamSchema = z.object({ id: z.union([z.string(), z.number()]).transform((value) => String(value).trim()).refine((value) => /^\d+$/.test(value), 'ID deve ser numérico') });

const scalarValue = z.union([z.string(), z.number(), z.boolean(), z.null()]).transform((value) => value == null ? '' : String(value));
const contentRecordSchema = z.record(z.string().trim().min(1).max(120), scalarValue).superRefine((value, ctx) => {
  const entries = Object.entries(value || {});
  if (entries.length === 0) {
    ctx.addIssue({ code: 'custom', message: 'Nenhum campo enviado' });
    return;
  }
  if (entries.length > 250) {
    ctx.addIssue({ code: 'custom', message: 'Máximo de 250 campos por requisição' });
    return;
  }
  for (const [key, currentValue] of entries) {
    if (String(currentValue).length > 50000) {
      ctx.addIssue({ code: 'custom', path: [key], message: 'Valor excede o limite de 50.000 caracteres' });
      return;
    }
  }
});

const loginSchema = z.object({
  email: requiredString(255, 'E-mail').email('E-mail inválido').transform((value) => value.toLowerCase()),
  password: requiredString(255, 'Senha').max(255, 'Senha inválida'),
});

const profileSchema = z.object({
  name: requiredString(120, 'Nome'),
  email: requiredString(255, 'E-mail').email('E-mail inválido').transform((value) => value.toLowerCase()),
});

const passwordSchema = z.object({
  current: requiredString(255, 'Senha atual'),
  newPassword: z.string().min(12, 'Nova senha deve ter ao menos 12 caracteres').max(255, 'Nova senha muito longa'),
});

const solutionSchema = z.object({
  title: requiredString(160, 'Título'),
  description: requiredString(5000, 'Descrição'),
  cta_text: optionalString(120).default('Saiba mais'),
  icon: optionalString(80).default('Building2'),
  image: optionalUrlLike(2048),
  order_num: intField(0, 0, 100000),
  active: boolField(1),
  nav_link: optionalUrlLike(2048),
  features: z.array(z.string().trim().max(500)).max(100, 'Máximo de 100 funcionalidades').default([]),
});

// Schemas para blocos do Page Builder
const heroBlockSchema = z.object({
  type: z.literal('hero'),
  title: z.string().max(200).optional(),
  subtitle: z.string().max(500).optional(),
  image: z.string().max(2048).optional(),
  visible: z.boolean().optional().default(true),
});

const textBlockSchema = z.object({
  type: z.literal('text'),
  content: z.string().max(50000).optional(),
  visible: z.boolean().optional().default(true),
});

const imageBlockSchema = z.object({
  type: z.literal('image'),
  src: z.string().max(2048),
  alt: z.string().max(255).optional(),
  visible: z.boolean().optional().default(true),
});

const blockSchema = z.discriminatedUnion('type', [
  heroBlockSchema,
  textBlockSchema,
  imageBlockSchema,
  // Outros blocos podem ser adicionados aqui como z.object({ type: z.literal('...'), ... })
]).or(z.record(z.string(), z.any())); // Fallback para outros tipos de blocos não validados rigidamente

const pageSchema = z.object({
  slug: requiredString(160, 'Slug').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug inválido'),
  title: requiredString(160, 'Título'),
  icon: optionalString(80).default('Building2'),
  color_theme: optionalString(30).default('orange'),
  meta_title: optionalString(160),
  meta_description: optionalString(320),
  is_active: boolField(1),
  blocks_json: z.array(blockSchema).max(200, 'Máximo de 200 blocos').default([]),
});

const genericPageSchema = z.object({
  slug: requiredString(160, 'Slug').regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug inválido'),
  title: requiredString(160, 'Título'),
  meta_title: optionalString(160),
  meta_description: optionalString(320),
  is_active: boolField(1),
  blocks_json: z.array(blockSchema).max(200, 'Máximo de 200 blocos').default([]),
});

const segmentSchema = z.object({
  segment_id: optionalString(120),
  name: requiredString(120, 'Nome'),
  icon: optionalString(80).default('Shirt'),
  image: optionalUrlLike(2048),
  description: optionalString(5000),
  order_num: intField(0, 0, 100000),
  active: boolField(1),
  show_home: boolField(0),
});

const statSchema = z.object({
  value: requiredString(120, 'Valor'),
  label: requiredString(160, 'Rótulo'),
  stat_id: requiredString(120, 'Identificador'),
  section: optionalString(80).default('numbers'),
  order_num: intField(0, 0, 100000),
});

const statUpdateSchema = z.object({
  value: requiredString(120, 'Valor'),
  label: requiredString(160, 'Rótulo'),
  order_num: intField(0, 0, 100000),
});

const bannerSchema = z.object({
  title: optionalString(200),
  subtitle: optionalString(500),
  description: optionalString(5000),
  image: optionalUrlLike(2048),
  cta_text: optionalString(120),
  cta_link: optionalUrlLike(2048),
  order_num: intField(0, 0, 100000),
  active: boolField(1),
  use_default_bg: boolField(1),
  bg_color: optionalString(40).default('#f97316'),
  page: optionalString(80).default('home'),
  banner_style: optionalString(80).default('cinematic'),
  use_style: boolField(1),
});

const clientLogoSchema = z.object({
  name: requiredString(120, 'Nome'),
  image: requiredString(2048, 'Imagem'),
  url: optionalUrlLike(2048),
  order_num: intField(0, 0, 100000),
  active: boolField(1),
});

const testimonialSchema = z.object({
  author_name: requiredString(120, 'Autor'),
  author_role: optionalString(120),
  author_company: optionalString(120),
  author_photo: optionalUrlLike(2048),
  content: requiredString(5000, 'Conteúdo'),
  rating: intField(5, 1, 5),
  order_num: intField(0, 0, 100000),
  active: boolField(1),
});

const partnerSchema = z.object({
  name: requiredString(120, 'Nome'),
  image: requiredString(2048, 'Imagem'),
  url: optionalUrlLike(2048),
  category: optionalString(80).default('parceiro'),
  order_num: intField(0, 0, 100000),
  active: boolField(1),
});

const helpCategorySchema = z.object({
  name: requiredString(120, 'Nome'),
  description: optionalString(1000),
  icon: optionalString(80).default('HelpCircle'),
  order_position: intField(0, 0, 100000).optional(),
});

const helpArticleSchema = z.object({
  category_id: intField(0, 1, 100000),
  title: requiredString(160, 'Título'),
  short_description: optionalString(500),
  content: optionalString(50000),
  youtube_url: optionalUrlLike(2048),
});

const helpArticleUpdateSchema = z.object({
  title: requiredString(160, 'Título'),
  short_description: optionalString(500),
  content: optionalString(50000),
  youtube_url: optionalUrlLike(2048),
  order_position: intField(0, 0, 100000),
  status: boolField(1),
});

const helpImageSchema = z.object({
  alt_text: optionalString(255),
  order_position: intField(0, 0, 100000).optional(),
});

module.exports = {
  bannerSchema,
  clientLogoSchema,
  contentRecordSchema,
  genericPageSchema,
  helpArticleSchema,
  helpArticleUpdateSchema,
  helpCategorySchema,
  helpImageSchema,
  idParamSchema,
  loginSchema,
  numericIdParamSchema,
  pageSchema,
  partnerSchema,
  passwordSchema,
  profileSchema,
  segmentSchema,
  solutionSchema,
  statSchema,
  statUpdateSchema,
  testimonialSchema,
};
