// Hero.tsx — renderiza APENAS o que estiver cadastrado no admin.
// Sem nenhum texto, cor ou fallback hardcoded.
// Se não houver banners cadastrados e ativos, não renderiza o banner —
// mas mantém um H1 invisível pra SEO/A11Y (toda página DEVE ter um H1).

import { PageBanner } from '@/components/PageBanner';
import { useData } from '@/context/DataContext';

export function Hero() {
  const { data } = useData();
  const homeBanners = (data.banners || []).filter(
    b => (b.page || 'home') === 'home' && b.active === 1 && b.title?.trim()
  );
  const hasActiveBanner = homeBanners.length > 0;
  // Pega título preferencial: hero content > company name > fallback
  const fallbackTitle =
    data.content?.['hero.title'] ||
    data.settings?.company_name ||
    data.settings?.site_title ||
    'Unimaxx — Tecnologia para o Varejo';

  return (
    <>
      {/* H1 invisível garante semântica mesmo sem banner cadastrado.
          Quando há banner cinematic, o PageBanner já tem seu próprio H1
          visível — o `sr-only` aqui não duplica visualmente. */}
      {!hasActiveBanner && (
        <h1 className="sr-only">{fallbackTitle}</h1>
      )}
      <PageBanner page="home" />
    </>
  );
}
