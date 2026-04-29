/**
 * ImageUploadField — campo de upload padronizado com specs visíveis.
 * Usar em todo campo de imagem do admin.
 */
import React, { useRef } from 'react';
import { Upload, X, ImageIcon, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace('/api', '');
export const resolveImg = (p?: string) =>
  !p ? null : p.startsWith('http') ? p : `${BASE_URL}${p}`;

export interface ImgSpec {
  dimensions: string;   // ex: "1440 × 560 px"
  ratio?: string;       // ex: "16:9"
  formats?: string;     // ex: "PNG, WEBP"  (default: "JPG, PNG, WEBP")
  maxSize?: string;     // ex: "2 MB"       (default: "5 MB")
  maxSizeBytes?: number; // ex: 2 * 1024 * 1024
  where: string;        // ex: "Carousel hero da home"
  tip?: string;         // dica extra
  objectFit?: 'cover' | 'contain';  // default: 'cover'
}

interface Props {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  onUpload: (file: File) => Promise<void>;
  uploading?: boolean;
  spec: ImgSpec;
  height?: number;      // preview height px, default 148
  placeholder?: string;
}

export function ImageUploadField({
  label, value, onChange, onUpload, uploading = false,
  spec, height = 148, placeholder,
}: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const src = resolveImg(value);
  const fit = spec.objectFit ?? 'cover';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    // Validação de tipo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(f.type)) {
      toast.error("Formato não suportado. Use PNG, JPG ou WEBP.");
      e.target.value = '';
      return;
    }

    // Validação de tamanho
    const maxSize = spec.maxSizeBytes || 5 * 1024 * 1024;
    if (f.size > maxSize) {
      toast.error(`A imagem excede o limite de ${spec.maxSize || '5MB'}. Por favor, envie um arquivo menor.`);
      e.target.value = '';
      return;
    }

    try {
      await onUpload(f);
    } catch (err: any) {
      toast.error(err?.message || "Não foi possível salvar. Tente novamente mais tarde.");
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="iuf-root">
      {label && <p className="iuf-label">{label}</p>}

      {/* ── Drop zone / preview ── */}
      <div
        className="iuf-zone"
        style={{ height }}
        onClick={() => ref.current?.click()}
      >
        {src ? (
          <>
            <img src={src} alt="preview" className="iuf-preview-img" style={{ objectFit: fit }} />
            <div className="iuf-hover-overlay">
              <Upload style={{ width: 18, height: 18 }} />
              <span>Trocar imagem</span>
            </div>
          </>
        ) : (
          <div className="iuf-empty">
            <div className="iuf-icon-wrap">
              <ImageIcon style={{ width: 20, height: 20 }} />
            </div>
            <span className="iuf-empty-label">Clique para enviar</span>
            <span className="iuf-empty-sub">
              {spec.formats ?? 'JPG, PNG, WEBP'} · máx {spec.maxSize ?? '5 MB'}
            </span>
          </div>
        )}
        {uploading && (
          <div className="iuf-uploading-overlay">
            <div className="iuf-spinner" />
            <span>Enviando…</span>
          </div>
        )}
        <input ref={ref} type="file" accept="image/*" className="hidden"
          onChange={handleFileChange}
          disabled={uploading} />
      </div>

      {/* ── Spec pills ── */}
      <div className="iuf-pills">
        <span className="iuf-pill iuf-pill-orange">📐 {spec.dimensions}</span>
        {spec.ratio && <span className="iuf-pill">⬜ {spec.ratio}</span>}
        <span className="iuf-pill">📁 {spec.formats ?? 'JPG, PNG, WEBP'}</span>
        <span className="iuf-pill">⚖️ máx {spec.maxSize ?? '5 MB'}</span>
        <span className="iuf-pill iuf-pill-blue">👁 {spec.where}</span>
      </div>

      {/* ── Tip ── */}
      {spec.tip && (
        <div className="iuf-tip">
          <Lightbulb style={{ width: 12, height: 12, flexShrink: 0, marginTop: 1 }} />
          <p>{spec.tip}</p>
        </div>
      )}

      {/* ── URL input ── */}
      <div className="iuf-url-row">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? 'Ou cole a URL da imagem…'}
          className="iuf-url-input"
          style={{ fontFamily: 'monospace' }}
        />
        {value && (
          <button className="iuf-clear-btn" onClick={() => onChange('')} title="Remover">
            <X style={{ width: 12, height: 12 }} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Predefined specs ─────────────────────────────────────────────── */
export const SPECS = {
  banner: {
    dimensions: '1440 × 560 px',
    ratio: '~2.6:1',
    formats: 'JPG, PNG, WEBP',
    maxSize: '3 MB',
    maxSizeBytes: 3 * 1024 * 1024,
    where: 'Hero carousel da home',
    tip: 'Imagem horizontal de alta resolução. O título é sobreposto ao centro — prefira fotos escuras ou com degradê. Evite texto ou elementos importantes nas bordas.',
  } as ImgSpec,

  solutionCard: {
    dimensions: '400 × 600 px',
    ratio: '2:3  (vertical)',
    formats: 'JPG, PNG, WEBP',
    maxSize: '2 MB',
    maxSizeBytes: 2 * 1024 * 1024,
    where: 'Card do carousel de soluções',
    tip: 'O ícone e o título ficam sobrepostos — use fotos escuras. Sem foto? O card usa gradiente colorido automático.',
  } as ImgSpec,

  solutionHero: {
    dimensions: '1440 × 600 px',
    ratio: '~2.4:1',
    formats: 'JPG, PNG, WEBP',
    maxSize: '3 MB',
    maxSizeBytes: 3 * 1024 * 1024,
    where: 'Cabeçalho da página da solução',
    tip: 'Texto branco sobreposto — use fotos escuras ou com degradê para boa legibilidade. Mínimo recomendado: 1200 × 500 px.',
  } as ImgSpec,

  segmentCard: {
    dimensions: '800 × 500 px',
    ratio: '16:10',
    formats: 'JPG, PNG, WEBP',
    maxSize: '2 MB',
    maxSizeBytes: 2 * 1024 * 1024,
    where: 'Fundo dos cards de segmento',
    objectFit: 'cover',
    tip: 'Aparece com overlay escuro no hover. Fotos vibrantes e com boa iluminação funcionam melhor.',
  } as ImgSpec,

  clientLogo: {
    dimensions: '300 × 120 px',
    ratio: '~2.5:1',
    formats: 'PNG, WEBP, SVG',
    maxSize: '500 KB',
    maxSizeBytes: 500 * 1024,
    where: 'Tira de logos de clientes',
    objectFit: 'contain',
    tip: 'Use PNG com fundo transparente. Os logos são exibidos em escala de cinza e ficam coloridos no hover.',
  } as ImgSpec,

  partnerLogo: {
    dimensions: '300 × 150 px',
    ratio: '2:1',
    formats: 'PNG, WEBP, SVG',
    maxSize: '500 KB',
    maxSizeBytes: 500 * 1024,
    where: 'Grid de parceiros e integrações',
    objectFit: 'contain',
    tip: 'PNG transparente recomendado. O logo é exibido em tamanho fixo — evite muito espaço em branco ao redor.',
  } as ImgSpec,

  testimonialPhoto: {
    dimensions: '200 × 200 px',
    ratio: '1:1  (quadrado)',
    formats: 'JPG, PNG, WEBP',
    maxSize: '500 KB',
    maxSizeBytes: 500 * 1024,
    where: 'Avatar do depoimento',
    objectFit: 'cover',
    tip: 'Será recortada em círculo — centralize o rosto e evite muito espaço ao redor.',
  } as ImgSpec,
} as const;
