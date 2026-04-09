// src/admin/HeaderFooterEditor.tsx — Editor completo de Header & Footer
import { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { ImageUploadField } from '@/components/ImageUploadField';
import {
  Save, Plus, Trash2, GripVertical, ChevronUp, ChevronDown,
  PanelTop, PanelBottom, Eye, EyeOff, Link2, Type, Palette,
  LayoutGrid, Settings2, Image as ImageIcon, Navigation, Hash,
  ExternalLink, Pencil, Copy, Check, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

/* ─── tipos ─── */
type FooterCol = { title: string; links: { label: string; url: string }[] };
type HeaderCTA = { label: string; link: string; style: 'ghost' | 'solid' };

/* ─── Tab principal ─── */
type MainTab = 'header' | 'footer';

export function HeaderFooterEditor() {
  const { data, updateContent, updateSettings, uploadImage } = useData();
  const content = data.content || {};
  const settings = data.settings || {};

  const [tab, setTab] = useState<MainTab>('header');
  const [saving, setSaving] = useState(false);

  /* ════════════════════════════════════════════════
     HEADER STATE
  ════════════════════════════════════════════════ */
  const [headerLogo, setHeaderLogo] = useState('');
  const [headerLogoWhite, setHeaderLogoWhite] = useState('');
  const [headerCompany, setHeaderCompany] = useState('');
  const [navSolutions, setNavSolutions] = useState('');
  const [navInstitutional, setNavInstitutional] = useState('');
  const [navSupport, setNavSupport] = useState('');
  const [navSegmentos, setNavSegmentos] = useState('');
  const [headerCTAs, setHeaderCTAs] = useState<HeaderCTA[]>([]);
  const [headerTopBarText, setHeaderTopBarText] = useState('');
  const [headerTopBarEnabled, setHeaderTopBarEnabled] = useState('0');
  const [headerTopBarLink, setHeaderTopBarLink] = useState('');

  /* ════════════════════════════════════════════════
     FOOTER STATE
  ════════════════════════════════════════════════ */
  const [footerDesc, setFooterDesc] = useState('');
  const [footerCopyright, setFooterCopyright] = useState('');
  const [footerExtra, setFooterExtra] = useState('');
  const [footerBg, setFooterBg] = useState('#080809');
  const [footerTextColor, setFooterTextColor] = useState('#ffffff');
  const [footerShowSocial, setFooterShowSocial] = useState('1');
  const [footerShowCnpj, setFooterShowCnpj] = useState('0');
  const [companyCnpj, setCompanyCnpj] = useState('');
  const [footerCols, setFooterCols] = useState<FooterCol[]>([]);
  const [footerNewsletterTitle, setFooterNewsletterTitle] = useState('');
  const [footerNewsletterDesc, setFooterNewsletterDesc] = useState('');

  /* ─── Carregar dados ─── */
  useEffect(() => {
    // Header
    setHeaderLogo(content['header.logo'] || '');
    setHeaderLogoWhite(content['header.logo_white'] || '');
    setHeaderCompany(content['header.company'] || 'Unimaxx');
    setNavSolutions(content['header.nav.solutions'] || 'Soluções');
    setNavInstitutional(content['header.nav.institutional'] || 'Institucional');
    setNavSupport(content['header.nav.support'] || 'Suporte');
    setNavSegmentos(content['header.nav.segmentos'] || 'Segmentos');
    setHeaderTopBarText(content['header.topbar.text'] || '');
    setHeaderTopBarEnabled(content['header.topbar.enabled'] || '0');
    setHeaderTopBarLink(content['header.topbar.link'] || '');

    try {
      setHeaderCTAs(JSON.parse(settings.header_ctas || '[]'));
    } catch {
      setHeaderCTAs([
        { label: 'Área do Cliente', link: '/cliente', style: 'ghost' },
        { label: 'Fale Conosco', link: '/cliente', style: 'solid' },
      ]);
    }

    // Footer
    setFooterDesc(content['footer.description'] || '');
    setFooterCopyright(content['footer.copyright'] || '');
    setFooterExtra(content['footer.extra'] || '');
    setFooterBg(settings.footer_bg || '#080809');
    setFooterTextColor(settings.footer_text_color || '#ffffff');
    setFooterShowSocial(settings.footer_show_social ?? '1');
    setFooterShowCnpj(settings.footer_show_cnpj || '0');
    setCompanyCnpj(content['company.cnpj'] || '');
    setFooterNewsletterTitle(content['footer.newsletter.title'] || 'Newsletter');
    setFooterNewsletterDesc(content['footer.newsletter.desc'] || 'Novidades sobre tecnologia e varejo direto no seu e-mail.');

    try {
      const cols = JSON.parse(settings.footer_columns || '[]');
      setFooterCols(cols.length > 0 ? cols : []);
    } catch {
      setFooterCols([]);
    }
  }, [data]);

  /* ─── Salvar ─── */
  const handleSave = async () => {
    setSaving(true);
    try {
      // Content updates
      await updateContent({
        'header.logo': headerLogo,
        'header.logo_white': headerLogoWhite,
        'header.company': headerCompany,
        'header.nav.solutions': navSolutions,
        'header.nav.institutional': navInstitutional,
        'header.nav.support': navSupport,
        'header.nav.segmentos': navSegmentos,
        'header.topbar.text': headerTopBarText,
        'header.topbar.enabled': headerTopBarEnabled,
        'header.topbar.link': headerTopBarLink,
        'footer.description': footerDesc,
        'footer.copyright': footerCopyright,
        'footer.extra': footerExtra,
        'company.cnpj': companyCnpj,
        'footer.newsletter.title': footerNewsletterTitle,
        'footer.newsletter.desc': footerNewsletterDesc,
      });

      // Settings updates
      await updateSettings({
        header_ctas: JSON.stringify(headerCTAs),
        footer_bg: footerBg,
        footer_text_color: footerTextColor,
        footer_show_social: footerShowSocial,
        footer_show_cnpj: footerShowCnpj,
        footer_columns: JSON.stringify(footerCols),
      });

      toast.success('Salvo com sucesso!');
    } catch (err) {
      toast.error('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  /* ─── Helpers Footer Columns ─── */
  const addFooterCol = () => setFooterCols(c => [...c, { title: 'Nova Coluna', links: [] }]);
  const removeFooterCol = (i: number) => setFooterCols(c => c.filter((_, j) => j !== i));
  const updateFooterCol = (i: number, col: FooterCol) => setFooterCols(c => c.map((x, j) => j === i ? col : x));

  const addColLink = (colIdx: number) => {
    const cols = [...footerCols];
    cols[colIdx].links.push({ label: '', url: '' });
    setFooterCols(cols);
  };
  const removeColLink = (colIdx: number, linkIdx: number) => {
    const cols = [...footerCols];
    cols[colIdx].links = cols[colIdx].links.filter((_, j) => j !== linkIdx);
    setFooterCols(cols);
  };
  const updateColLink = (colIdx: number, linkIdx: number, field: 'label' | 'url', val: string) => {
    const cols = [...footerCols];
    cols[colIdx].links[linkIdx][field] = val;
    setFooterCols(cols);
  };

  /* ─── Helpers Header CTAs ─── */
  const addCTA = () => setHeaderCTAs(c => [...c, { label: '', link: '', style: 'ghost' }]);
  const removeCTA = (i: number) => setHeaderCTAs(c => c.filter((_, j) => j !== i));
  const updateCTA = (i: number, field: keyof HeaderCTA, val: string) => {
    setHeaderCTAs(c => c.map((x, j) => j === i ? { ...x, [field]: val } : x));
  };

  /* ─── Move col up/down ─── */
  const moveCol = (i: number, dir: -1 | 1) => {
    const cols = [...footerCols];
    const ni = i + dir;
    if (ni < 0 || ni >= cols.length) return;
    [cols[i], cols[ni]] = [cols[ni], cols[i]];
    setFooterCols(cols);
  };

  /* ─── Estilos compartilhados ─── */
  const cardStyle = "bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden";
  const sectionTitle = "text-[13px] font-bold text-gray-800 flex items-center gap-2";
  const labelStyle = "text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block";
  const inputStyle = "w-full px-3.5 py-2.5 text-[13px] rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition-all";
  const btnPrimary = "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ── Título + Tabs + Salvar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-black text-gray-900" style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.03em' }}>
            Header & Footer
          </h1>
          <p className="text-[13px] text-gray-400 mt-0.5">Editar navegação, textos, links e layout</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={btnPrimary}
          style={{
            background: saving ? '#ccc' : 'linear-gradient(135deg, #f97316, #ea580c)',
            boxShadow: saving ? 'none' : '0 4px 16px rgba(249,115,22,.3)',
          }}
        >
          <Save size={14} />
          {saving ? 'Salvando...' : 'Salvar Tudo'}
        </button>
      </div>

      {/* ── Tab Switcher ── */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl w-fit">
        {[
          { key: 'header' as MainTab, label: 'Header', icon: PanelTop },
          { key: 'footer' as MainTab, label: 'Footer', icon: PanelBottom },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
              tab === t.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════
          HEADER TAB
      ═══════════════════════════════════════════════ */}
      {tab === 'header' && (
        <div className="space-y-5">

          {/* Logo & Nome */}
          <div className={cardStyle}>
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <ImageIcon size={15} className="text-orange-500" />
              <span className={sectionTitle}>Logo & Identidade</span>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelStyle}>Nome da Empresa</label>
                <input className={inputStyle} value={headerCompany} onChange={e => setHeaderCompany(e.target.value)} placeholder="Nome da empresa" />
              </div>
              <div>
                <label className={labelStyle}>Logo (imagem ou texto)</label>
                <input className={inputStyle} value={headerLogo} onChange={e => setHeaderLogo(e.target.value)} placeholder="Texto ou /uploads/logo.png" />
                <p className="text-[10px] text-gray-400 mt-1">Deixe vazio para usar ícone + nome</p>
              </div>
              <div className="md:col-span-2">
                <label className={labelStyle}>Logo Branco (Footer)</label>
                <input className={inputStyle} value={headerLogoWhite} onChange={e => setHeaderLogoWhite(e.target.value)} placeholder="/uploads/logo-white.png" />
                <p className="text-[10px] text-gray-400 mt-1">Versão branca do logo para fundo escuro do footer</p>
              </div>
            </div>
          </div>

          {/* Top Bar */}
          <div className={cardStyle}>
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Type size={15} className="text-orange-500" />
                <span className={sectionTitle}>Barra Superior (Top Bar)</span>
              </div>
              <button
                onClick={() => setHeaderTopBarEnabled(v => v === '1' ? '0' : '1')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                  headerTopBarEnabled === '1'
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    : 'bg-gray-50 text-gray-400 border border-gray-200'
                }`}
              >
                {headerTopBarEnabled === '1' ? <Eye size={12} /> : <EyeOff size={12} />}
                {headerTopBarEnabled === '1' ? 'Ativo' : 'Inativo'}
              </button>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelStyle}>Texto</label>
                <input className={inputStyle} value={headerTopBarText} onChange={e => setHeaderTopBarText(e.target.value)} placeholder="🚀 Nova versão disponível!" />
              </div>
              <div>
                <label className={labelStyle}>Link (opcional)</label>
                <input className={inputStyle} value={headerTopBarLink} onChange={e => setHeaderTopBarLink(e.target.value)} placeholder="/novidades" />
              </div>
            </div>
          </div>

          {/* Navegação */}
          <div className={cardStyle}>
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Navigation size={15} className="text-orange-500" />
              <span className={sectionTitle}>Labels de Navegação</span>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className={labelStyle}>Soluções</label>
                <input className={inputStyle} value={navSolutions} onChange={e => setNavSolutions(e.target.value)} />
              </div>
              <div>
                <label className={labelStyle}>Segmentos</label>
                <input className={inputStyle} value={navSegmentos} onChange={e => setNavSegmentos(e.target.value)} />
              </div>
              <div>
                <label className={labelStyle}>Institucional</label>
                <input className={inputStyle} value={navInstitutional} onChange={e => setNavInstitutional(e.target.value)} />
              </div>
              <div>
                <label className={labelStyle}>Suporte</label>
                <input className={inputStyle} value={navSupport} onChange={e => setNavSupport(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Botões CTA */}
          <div className={cardStyle}>
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ExternalLink size={15} className="text-orange-500" />
                <span className={sectionTitle}>Botões CTA do Header</span>
              </div>
              <button onClick={addCTA} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 transition-colors">
                <Plus size={12} /> Adicionar
              </button>
            </div>
            <div className="p-5 space-y-3">
              {headerCTAs.length === 0 && (
                <p className="text-[12px] text-gray-400 text-center py-6">Nenhum botão CTA. Usando padrão.</p>
              )}
              {headerCTAs.map((cta, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <GripVertical size={14} className="text-gray-300 flex-shrink-0" />
                  <input
                    className="flex-1 px-3 py-2 text-[12px] rounded-lg border border-gray-200 bg-white focus:border-orange-300 outline-none"
                    value={cta.label}
                    onChange={e => updateCTA(i, 'label', e.target.value)}
                    placeholder="Label"
                  />
                  <input
                    className="flex-1 px-3 py-2 text-[12px] rounded-lg border border-gray-200 bg-white focus:border-orange-300 outline-none"
                    value={cta.link}
                    onChange={e => updateCTA(i, 'link', e.target.value)}
                    placeholder="/pagina"
                  />
                  <select
                    className="px-3 py-2 text-[12px] rounded-lg border border-gray-200 bg-white focus:border-orange-300 outline-none"
                    value={cta.style}
                    onChange={e => updateCTA(i, 'style', e.target.value)}
                  >
                    <option value="ghost">Texto</option>
                    <option value="solid">Botão</option>
                  </select>
                  <button onClick={() => removeCTA(i)} className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          FOOTER TAB
      ═══════════════════════════════════════════════ */}
      {tab === 'footer' && (
        <div className="space-y-5">

          {/* Textos gerais */}
          <div className={cardStyle}>
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Type size={15} className="text-orange-500" />
              <span className={sectionTitle}>Textos do Footer</span>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className={labelStyle}>Descrição</label>
                <textarea className={inputStyle + " min-h-[70px] resize-y"} value={footerDesc} onChange={e => setFooterDesc(e.target.value)} placeholder="Descrição curta da empresa" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelStyle}>Copyright</label>
                  <input className={inputStyle} value={footerCopyright} onChange={e => setFooterCopyright(e.target.value)} placeholder="© 2025 Empresa. Todos os direitos..." />
                </div>
                <div>
                  <label className={labelStyle}>Texto Extra</label>
                  <input className={inputStyle} value={footerExtra} onChange={e => setFooterExtra(e.target.value)} placeholder="Texto adicional opcional" />
                </div>
              </div>
            </div>
          </div>

          {/* Aparência */}
          <div className={cardStyle}>
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Palette size={15} className="text-orange-500" />
              <span className={sectionTitle}>Aparência</span>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className={labelStyle}>Cor de Fundo</label>
                  <div className="flex items-center gap-2">
                    <input type="color" className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" value={footerBg} onChange={e => setFooterBg(e.target.value)} />
                    <input className={inputStyle} value={footerBg} onChange={e => setFooterBg(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className={labelStyle}>Cor do Texto</label>
                  <div className="flex items-center gap-2">
                    <input type="color" className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" value={footerTextColor} onChange={e => setFooterTextColor(e.target.value)} />
                    <input className={inputStyle} value={footerTextColor} onChange={e => setFooterTextColor(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className={labelStyle}>Redes Sociais</label>
                  <button
                    onClick={() => setFooterShowSocial(v => v === '1' ? '0' : '1')}
                    className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[12px] font-bold transition-all w-full justify-center ${
                      footerShowSocial === '1'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : 'bg-gray-50 text-gray-400 border border-gray-200'
                    }`}
                  >
                    {footerShowSocial === '1' ? <Eye size={13} /> : <EyeOff size={13} />}
                    {footerShowSocial === '1' ? 'Visível' : 'Oculto'}
                  </button>
                </div>
                <div>
                  <label className={labelStyle}>Exibir CNPJ</label>
                  <button
                    onClick={() => setFooterShowCnpj(v => v === '1' ? '0' : '1')}
                    className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[12px] font-bold transition-all w-full justify-center ${
                      footerShowCnpj === '1'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : 'bg-gray-50 text-gray-400 border border-gray-200'
                    }`}
                  >
                    {footerShowCnpj === '1' ? <Eye size={13} /> : <EyeOff size={13} />}
                    {footerShowCnpj === '1' ? 'Visível' : 'Oculto'}
                  </button>
                </div>
              </div>
              {footerShowCnpj === '1' && (
                <div className="mt-4">
                  <label className={labelStyle}>CNPJ</label>
                  <input className={inputStyle} value={companyCnpj} onChange={e => setCompanyCnpj(e.target.value)} placeholder="00.000.000/0001-00" />
                </div>
              )}

              {/* Preview mini */}
              <div className="mt-5 rounded-2xl p-5 border border-gray-100" style={{ background: footerBg }}>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: footerTextColor + '40' }}>Preview</p>
                <p className="text-[13px] font-medium" style={{ color: footerTextColor }}>{headerCompany || 'Empresa'}</p>
                <p className="text-[11px] mt-1" style={{ color: footerTextColor + '60' }}>{footerDesc || 'Descrição do footer...'}</p>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className={cardStyle}>
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Hash size={15} className="text-orange-500" />
              <span className={sectionTitle}>Newsletter do Footer</span>
            </div>
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelStyle}>Título</label>
                <input className={inputStyle} value={footerNewsletterTitle} onChange={e => setFooterNewsletterTitle(e.target.value)} placeholder="Newsletter" />
              </div>
              <div>
                <label className={labelStyle}>Descrição</label>
                <input className={inputStyle} value={footerNewsletterDesc} onChange={e => setFooterNewsletterDesc(e.target.value)} placeholder="Receba novidades..." />
              </div>
            </div>
          </div>

          {/* Colunas de Links */}
          <div className={cardStyle}>
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LayoutGrid size={15} className="text-orange-500" />
                <span className={sectionTitle}>Colunas de Links</span>
              </div>
              <button onClick={addFooterCol} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 transition-colors">
                <Plus size={12} /> Coluna
              </button>
            </div>
            <div className="p-5 space-y-4">
              {footerCols.length === 0 && (
                <div className="text-center py-8">
                  <LayoutGrid size={28} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-[13px] font-semibold text-gray-400">Nenhuma coluna customizada</p>
                  <p className="text-[11px] text-gray-300 mt-1">Colunas padrão (Soluções, Empresa, Suporte) serão exibidas</p>
                  <button onClick={addFooterCol} className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold bg-orange-500 text-white hover:bg-orange-600 transition-colors">
                    <Plus size={12} /> Criar coluna
                  </button>
                </div>
              )}

              {footerCols.map((col, ci) => (
                <div key={ci} className="rounded-2xl border border-gray-200 bg-gray-50/50 overflow-hidden">
                  {/* Header da coluna */}
                  <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
                    <div className="flex gap-0.5">
                      <button onClick={() => moveCol(ci, -1)} className="p-1 rounded text-gray-300 hover:text-gray-600"><ChevronUp size={12} /></button>
                      <button onClick={() => moveCol(ci, 1)} className="p-1 rounded text-gray-300 hover:text-gray-600"><ChevronDown size={12} /></button>
                    </div>
                    <input
                      className="flex-1 px-3 py-1.5 text-[13px] font-bold rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-300 outline-none"
                      value={col.title}
                      onChange={e => updateFooterCol(ci, { ...col, title: e.target.value })}
                      placeholder="Título da coluna"
                    />
                    <button onClick={() => addColLink(ci)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors">
                      <Plus size={11} /> Link
                    </button>
                    <button onClick={() => removeFooterCol(ci)} className="p-1.5 rounded-lg text-red-300 hover:text-red-600 hover:bg-red-50 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* Links */}
                  <div className="p-3 space-y-2">
                    {col.links.length === 0 && (
                      <p className="text-[11px] text-gray-300 text-center py-3">Nenhum link. Clique em "+ Link".</p>
                    )}
                    {col.links.map((link, li) => (
                      <div key={li} className="flex items-center gap-2">
                        <Link2 size={11} className="text-gray-300 flex-shrink-0" />
                        <input
                          className="flex-1 px-2.5 py-1.5 text-[12px] rounded-lg border border-gray-200 bg-white focus:border-orange-300 outline-none"
                          value={link.label}
                          onChange={e => updateColLink(ci, li, 'label', e.target.value)}
                          placeholder="Label"
                        />
                        <input
                          className="flex-1 px-2.5 py-1.5 text-[12px] rounded-lg border border-gray-200 bg-white focus:border-orange-300 outline-none"
                          value={link.url}
                          onChange={e => updateColLink(ci, li, 'url', e.target.value)}
                          placeholder="/pagina ou https://..."
                        />
                        <button onClick={() => removeColLink(ci, li)} className="p-1 rounded text-red-300 hover:text-red-500">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HeaderFooterEditor;
