import { useState } from "react";
import type React from "react";
import { Link } from "react-router-dom";
import { useData } from "@/context/DataContext";
import {
  ArrowUpRight, Linkedin, Facebook, Instagram, Youtube,
  Send, CheckCircle, Globe, Hash, MessageSquare, Search,
  ChevronDown,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   FOOTER — 4 LAYOUTS SELECIONÁVEIS VIA ADMIN (settings.footer_layout)
   "default"       → colunas escuro original (com newsletter)
   "columns-white" → mega-footer branco com busca + colunas
   "columns-dark"  → mega-footer escuro com busca + colunas
   "minimal"       → centralizado simples (nav + social + copyright)
   ═══════════════════════════════════════════════════════════════ */

const FOOTER_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  .fr * { box-sizing: border-box; }
  .fr a { text-decoration: none; }

  .fr-cols {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
  }
  @media (max-width: 860px) { .fr-cols { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 520px)  { .fr-cols { grid-template-columns: 1fr; } }

  .fr-main {
    display: grid;
    grid-template-columns: 260px 1fr;
    gap: 3rem;
    align-items: start;
  }
  @media (max-width: 820px) { .fr-main { grid-template-columns: 1fr; gap: 2rem; } }

  .fr-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
  }
  @media (max-width: 560px) {
    .fr-bottom { flex-direction: column; align-items: center; text-align: center; gap: 0.75rem; }
  }

  .fr-search-row {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .fr-socials { display: flex; flex-wrap: wrap; gap: 8px; }

  .fr-soc {
    display: flex; align-items: center; justify-content: center;
    border: 1px solid; cursor: pointer;
    transition: background 0.22s, border-color 0.22s, color 0.22s, transform 0.22s;
  }
  .fr-soc:hover { transform: translateY(-3px); }

  .fr-link {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 14px; transition: color 0.2s;
  }
  .fr-link .arr { opacity: 0; transform: translateX(-3px); transition: opacity 0.2s, transform 0.2s; }
  .fr-link:hover .arr { opacity: 1; transform: translateX(0); }

  .fr-col-title {
    font-size: 10px; font-weight: 700; letter-spacing: 0.15em;
    text-transform: uppercase; margin: 0 0 18px;
  }
  .fr-col-ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 11px; }

  /* Mobile accordion */
  .fr-acc-btn {
    display: none; width: 100%; background: none; border: none; cursor: pointer;
    padding: 12px 0; align-items: center; justify-content: space-between;
    border-bottom: 1px solid; font-size: 13px; font-weight: 600;
    transition: color 0.2s; font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .fr-acc-btn .chv { transition: transform 0.25s; flex-shrink: 0; }
  .fr-acc-btn.open .chv { transform: rotate(180deg); }

  .fr-acc-body {
    overflow: hidden; max-height: 0; opacity: 0;
    transition: max-height 0.3s ease, opacity 0.3s ease;
  }
  .fr-acc-body.open { max-height: 320px; opacity: 1; }

  @media (max-width: 520px) {
    .fr-acc-btn { display: flex; }
    .fr-col-title { display: none; }
  }
  @media (min-width: 521px) {
    .fr-acc-body { max-height: none !important; opacity: 1 !important; }
  }

  .fr-minimal-nav {
    display: flex; justify-content: center; flex-wrap: wrap; gap: 8px 20px; margin-bottom: 24px;
  }
  .fr-legal { display: flex; gap: 18px; flex-wrap: wrap; }
  @media (max-width: 560px) { .fr-legal { justify-content: center; } }
`;

function Styles() {
  return <style dangerouslySetInnerHTML={{ __html: FOOTER_CSS }} />;
}

export function Footer() {
  const { data } = useData();
  const content = data.content || {};
  const settings = data.settings || {};

  const pc = settings.primary_color || "#f97316";
  const sc = settings.secondary_color || "#fb923c";
  const footerBg = settings.footer_bg || "#080809";
  const footerTextColor = settings.footer_text_color || "#ffffff";
  const showSocial = settings.footer_show_social !== "0";
  const showCnpj = settings.footer_show_cnpj === "1";
  const footerLayout = settings.footer_layout || "default";

  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openCols, setOpenCols] = useState<Record<number, boolean>>({});

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
  const BASE_URL = API_URL.replace(/\/api\/?$/, "");
  const FONT = "'Plus Jakarta Sans', sans-serif";

  const logoValue = content["header.logo_white"] || content["header.logo"] || content["footer.logo"] || "";
  const isImageLogo = logoValue.startsWith("/uploads/") || logoValue.startsWith("http");
  const logoSrc = logoValue.startsWith("http") ? logoValue : logoValue ? `${BASE_URL}${logoValue}` : "";
  const companyName = content["header.company"] || "Unimaxx";

  let customCols: { title: string; links: { label: string; url: string }[] }[] = [];
  try { customCols = JSON.parse(settings.footer_columns || "[]"); } catch {}

  const solutionLinks = (data.solutions || [])
    .filter((s: any) => s.active === 1)
    .slice(0, 5)
    .map((s: any) => ({ label: s.title, to: s.nav_link?.trim() || `/solucao-page/${s.solution_id}` }));

  // Esconde links de páginas desabilitadas (carreiras/blog/imprensa/sobre)
  // Evita que o footer aponte pra "Página indisponível" — má UX
  const empresaLinks = [
    content['sobre.enabled'] !== '0' && { label: "Sobre Nós", to: "/sobre" },
    content['carreiras.enabled'] !== '0' && { label: "Carreiras", to: "/carreiras" },
    content['imprensa.enabled'] !== '0' && { label: "Imprensa", to: "/imprensa" },
    content['blog.enabled'] !== '0' && { label: "Blog", to: "/blog" },
  ].filter(Boolean) as { label: string; to: string }[];

  const defaultCols = [
    { title: "Soluções", links: [{ label: "Todas as Soluções", to: "/solucoes" }, ...solutionLinks] },
    ...(empresaLinks.length > 0 ? [{ title: "Empresa", links: empresaLinks }] : []),
    { title: "Suporte", links: [{ label: "Central de Ajuda", to: "/suporte" }, { label: "Fale Conosco", to: "/cliente" }] },
  ];

  const customColsNorm = customCols
    .filter((c) => c.title)
    .map((c) => ({ title: c.title, links: (c.links || []).filter((l) => l.label && l.url).map((l) => ({ label: l.label, to: l.url })) }));

  const linkCols = customColsNorm.length > 0 ? customColsNorm : defaultCols;

  // Footer nav esconde links desabilitados pra não levar visitante pra "Página indisponível"
  const footerNav = [
    { label: "Home", to: "/" },
    { label: content["header.nav.solutions"] || "Soluções", to: "/solucoes" },
    content['blog.enabled'] !== '0' && { label: "Blog", to: "/blog" },
    { label: "Central de Ajuda", to: "/suporte" },
    content['sobre.enabled'] !== '0' && { label: "Sobre", to: "/sobre" },
  ].filter(Boolean) as { label: string; to: string }[];

  const socials = [
    { Icon: Youtube, href: settings.social_youtube, label: "YouTube" },
    { Icon: Facebook, href: settings.social_facebook, label: "Facebook" },
    { Icon: Instagram, href: settings.social_instagram, label: "Instagram" },
    { Icon: Linkedin, href: settings.social_linkedin, label: "LinkedIn" },
    { Icon: Globe, href: settings.social_twitter, label: "X" },
    { Icon: Hash, href: settings.social_tiktok, label: "TikTok" },
    { Icon: MessageSquare, href: settings.social_telegram, label: "Telegram" },
  ].filter((s) => s.href);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubLoading(true);
    try {
      const res = await fetch(`${API_URL}/newsletter/subscribe`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email.trim(), source: "rodapé" }) });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Erro");
      setSubscribed(true);
    } catch { setSubscribed(true); }
    finally { setSubLoading(false); }
  };

  const footerExtra = content["footer.extra"] || "";
  const copyrightText = content["footer.copyright"] || `© ${new Date().getFullYear()} ${companyName}. Todos os direitos reservados.`;

  /* ── Logo ── */
  const Logo = ({ color, size = 34 }: { color: string; size?: number }) => (
    <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      {isImageLogo ? (
        <img src={logoSrc} alt="Logo" style={{ height: size, width: "auto", objectFit: "contain" }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
      ) : (
        <>
          <div style={{ width: size + 4, height: size + 4, borderRadius: 10, flexShrink: 0, background: `linear-gradient(135deg,${pc},${sc})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.48, fontWeight: 800, color: "#fff", fontFamily: FONT, boxShadow: `0 4px 14px ${pc}40` }}>
            {companyName[0]}
          </div>
          <span style={{ fontFamily: FONT, fontWeight: 800, fontSize: size * 0.52, color, letterSpacing: "-0.02em" }}>
            {companyName}
          </span>
        </>
      )}
    </Link>
  );

  /* ── Social icons ── */
  const Socials = ({ iconColor, hoverBg, bg, border, sz = 38, circle = false }: { iconColor: string; hoverBg: string; bg: string; border: string; sz?: number; circle?: boolean }) =>
    showSocial && socials.length > 0 ? (
      <div className="fr-socials">
        {socials.map(({ Icon, href, label }) => (
          <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}
            className="fr-soc"
            style={{ width: sz, height: sz, borderRadius: circle ? "50%" : 10, background: bg, borderColor: border, color: iconColor }}
            onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = hoverBg; el.style.borderColor = hoverBg; el.style.color = "#fff"; }}
            onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = bg; el.style.borderColor = border; el.style.color = iconColor; }}
          >
            <Icon size={16} />
          </a>
        ))}
      </div>
    ) : null;

  /* ── Column with mobile accordion ── */
  const Col = ({ col, i, tc, mc, bc }: { col: { title: string; links: { label: string; to: string }[] }; i: number; tc: string; mc: string; bc: string }) => (
    <div key={i}>
      <button className={`fr-acc-btn${openCols[i] ? " open" : ""}`} style={{ color: tc, borderBottomColor: bc }}
        onClick={() => setOpenCols((p) => ({ ...p, [i]: !p[i] }))}>
        <span style={{ fontFamily: FONT }}>{col.title}</span>
        <ChevronDown size={15} className="chv" />
      </button>
      <p className="fr-col-title" style={{ fontFamily: FONT, color: mc }}>{col.title}</p>
      <div className={`fr-acc-body${openCols[i] ? " open" : ""}`} style={{ paddingTop: 10 }}>
        <ul className="fr-col-ul">
          {col.links.map((link, j) => (
            <li key={j}>
              <Link to={link.to}>
                <span className="fr-link" style={{ fontFamily: FONT, color: `${tc}68` }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = tc)}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = `${tc}68`)}
                >
                  {link.label}
                  <ArrowUpRight size={11} className="arr" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  /* ── Bottom bar ── */
  const BottomBar = ({ tc, divider }: { tc: string; divider: string }) => (
    <div style={{ borderTop: `1px solid ${divider}` }}>
      <div style={{ maxWidth: "80rem", margin: "0 auto", padding: "1.2rem clamp(1rem,3vw,2rem)" }}>
        <div className="fr-bottom">
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <p style={{ fontFamily: FONT, fontSize: 12, color: `${tc}32`, margin: 0 }}>{copyrightText}</p>
            {footerExtra && <p style={{ fontFamily: FONT, fontSize: 12, color: `${tc}26`, margin: 0 }}>{footerExtra}</p>}
          </div>
          <div className="fr-legal">
            {[{ label: "Privacidade", to: "/privacidade" }, { label: "Termos", to: "/termos" }].map((l) => (
              <Link key={l.to} to={l.to}
                style={{ fontFamily: FONT, fontSize: 12, color: `${tc}32`, transition: "color 0.2s" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = `${tc}70`)}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = `${tc}32`)}
              >{l.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  /* ═══════════════════════════════════════
     minimal
  ═══════════════════════════════════════ */
  if (footerLayout === "minimal") return (
    <footer className="fr" style={{ background: "#0b0f18", color: "#fff" }}>
      <Styles />
      <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${pc}50,${sc}50,transparent)` }} />
      <div style={{ maxWidth: "80rem", margin: "0 auto", padding: "clamp(2.5rem,5vw,3.5rem) clamp(1rem,3vw,2rem) 2rem", textAlign: "center" }}>
        <div style={{ marginBottom: 28 }}><Logo color="#fff" size={32} /></div>
        <nav className="fr-minimal-nav">
          {footerNav.map((item) => (
            <Link key={item.to} to={item.to}
              style={{ fontFamily: FONT, fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,.52)", transition: "color 0.2s" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.52)")}
            >{item.label}</Link>
          ))}
        </nav>
        {showSocial && socials.length > 0 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 28 }}>
            {socials.map(({ Icon, href, label }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}
                className="fr-soc"
                style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,.06)", borderColor: "rgba(255,255,255,.1)", color: "rgba(255,255,255,.45)" }}
                onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = pc; el.style.borderColor = pc; el.style.color = "#fff"; }}
                onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,.06)"; el.style.borderColor = "rgba(255,255,255,.1)"; el.style.color = "rgba(255,255,255,.45)"; }}
              ><Icon size={17} /></a>
            ))}
          </div>
        )}
        <div style={{ height: 1, background: "rgba(255,255,255,.06)", marginBottom: 18 }} />
        <p style={{ fontFamily: FONT, fontSize: 12, color: "rgba(255,255,255,.3)", margin: 0 }}>{copyrightText}</p>
        {footerExtra && <p style={{ fontFamily: FONT, fontSize: 12, color: "rgba(255,255,255,.22)", marginTop: 4, marginBottom: 0 }}>{footerExtra}</p>}
      </div>
    </footer>
  );

  /* ═══════════════════════════════════════
     columns-white
  ═══════════════════════════════════════ */
  if (footerLayout === "columns-white") return (
    <footer className="fr" style={{ background: "var(--s0)", color: "var(--t1)" }}>
      <Styles />
      <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${pc}25,${sc}25,transparent)` }} />
      <div style={{ maxWidth: "80rem", margin: "0 auto", padding: "clamp(2.5rem,5vw,4rem) clamp(1rem,3vw,2rem) 0" }}>
        <div className="fr-search-row">
          <Logo color="var(--t1)" />
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--t4)", pointerEvents: "none" }} />
              <input type="text" placeholder="Buscar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                style={{ height: 38, width: "min(200px,100%)", paddingLeft: 34, paddingRight: 12, fontSize: 13, borderRadius: 10, border: "1px solid var(--b1)", background: "var(--s2)", color: "var(--t1)", outline: "none", fontFamily: FONT, transition: "border-color 0.2s" }}
                onFocus={(e) => (e.target.style.borderColor = `${pc}60`)}
                onBlur={(e) => (e.target.style.borderColor = "var(--b1)")} />
            </div>
            <button style={{ height: 38, padding: "0 18px", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${pc},${sc})`, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: FONT, boxShadow: `0 4px 14px ${pc}35`, transition: "opacity 0.2s" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.85")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
            >Buscar</button>
          </div>
        </div>
        <div style={{ height: 1, background: "var(--b1)", marginBottom: "2.5rem" }} />
        <div className="fr-cols" style={{ marginBottom: "2.5rem" }}>
          {linkCols.map((col, i) => <Col key={i} col={col} i={i} tc="var(--t1)" mc="var(--t4)" bc="var(--b1)" />)}
        </div>
        <div style={{ borderTop: "1px solid var(--b1)", paddingBottom: "1.5rem" }}>
          <div className="fr-bottom" style={{ paddingTop: 20 }}>
            <p style={{ fontFamily: FONT, fontSize: 12, color: "var(--t4)", margin: 0 }}>{copyrightText}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              {[{ label: "Privacidade", to: "/privacidade" }, { label: "Termos", to: "/termos" }].map((l) => (
                <Link key={l.to} to={l.to} style={{ fontFamily: FONT, fontSize: 12, color: "var(--t4)", transition: "color 0.2s" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--t1)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--t4)")}
                >{l.label}</Link>
              ))}
              <Socials iconColor="var(--t3)" hoverBg={pc} bg="var(--s2)" border="var(--b1)" sz={34} />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );

  /* ═══════════════════════════════════════
     columns-dark
  ═══════════════════════════════════════ */
  if (footerLayout === "columns-dark") return (
    <footer className="fr" style={{ background: "#0b0f18", color: "#fff" }}>
      <Styles />
      <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${pc}45,${sc}45,transparent)` }} />
      <div style={{ maxWidth: "80rem", margin: "0 auto", padding: "clamp(2.5rem,5vw,4rem) clamp(1rem,3vw,2rem) 0" }}>
        <div className="fr-search-row">
          <Logo color="#fff" />
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,.35)", pointerEvents: "none" }} />
              <input type="text" placeholder="Buscar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                style={{ height: 38, width: "min(200px,100%)", paddingLeft: 34, paddingRight: 12, fontSize: 13, borderRadius: 10, border: "1px solid rgba(255,255,255,.1)", background: "rgba(255,255,255,.06)", color: "#fff", outline: "none", fontFamily: FONT, transition: "border-color 0.2s" }}
                onFocus={(e) => (e.target.style.borderColor = `${pc}60`)}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,.1)")} />
            </div>
            <button style={{ height: 38, padding: "0 18px", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${pc},${sc})`, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: FONT, boxShadow: `0 4px 14px ${pc}35`, transition: "opacity 0.2s" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.85")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
            >Buscar</button>
          </div>
        </div>
        <div style={{ height: 1, background: "rgba(255,255,255,.07)", marginBottom: "2.5rem" }} />
        <div className="fr-cols" style={{ marginBottom: "2.5rem" }}>
          {linkCols.map((col, i) => <Col key={i} col={col} i={i} tc="#fff" mc="rgba(255,255,255,.28)" bc="rgba(255,255,255,.08)" />)}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,.07)", paddingBottom: "1.5rem" }}>
          <div className="fr-bottom" style={{ paddingTop: 20 }}>
            <p style={{ fontFamily: FONT, fontSize: 12, color: "rgba(255,255,255,.28)", margin: 0 }}>{copyrightText}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
              {[{ label: "Privacidade", to: "/privacidade" }, { label: "Termos", to: "/termos" }].map((l) => (
                <Link key={l.to} to={l.to} style={{ fontFamily: FONT, fontSize: 12, color: "rgba(255,255,255,.28)", transition: "color 0.2s" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.65)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.28)")}
                >{l.label}</Link>
              ))}
              <Socials iconColor="rgba(255,255,255,.4)" hoverBg={pc} bg="rgba(255,255,255,.06)" border="rgba(255,255,255,.09)" sz={34} />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );

  /* ═══════════════════════════════════════
     default — escuro com newsletter
  ═══════════════════════════════════════ */
  return (
    <footer className="fr" style={{ background: footerBg, color: footerTextColor }}>
      <Styles />
      <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${pc}45,${sc}45,transparent)` }} />

      <div style={{ maxWidth: "80rem", margin: "0 auto", padding: "clamp(2.5rem,6vw,5rem) clamp(1rem,3vw,2rem) 0" }}>
        <div className="fr-main" style={{ marginBottom: "2.5rem" }}>

          {/* Brand */}
          <div>
            <div style={{ marginBottom: 20 }}><Logo color={footerTextColor} /></div>
            <p style={{ fontFamily: FONT, fontSize: 13.5, color: `${footerTextColor}62`, lineHeight: 1.75, maxWidth: 240, marginBottom: 18 }}>
              {content["footer.description"] || ""}
            </p>
            {showCnpj && content["company.cnpj"] && (
              <p style={{ fontFamily: FONT, fontSize: 11.5, color: `${footerTextColor}30`, marginBottom: 18 }}>
                CNPJ: {content["company.cnpj"]}
              </p>
            )}
            <Socials iconColor={`${footerTextColor}50`} hoverBg={pc} bg="rgba(255,255,255,.05)" border="rgba(255,255,255,.09)" />
          </div>

          {/* Cols + newsletter */}
          <div className="fr-cols">
            {linkCols.map((col, i) => <Col key={i} col={col} i={i} tc={footerTextColor} mc={`${footerTextColor}30`} bc="rgba(255,255,255,.08)" />)}

            {/* Newsletter */}
            <div>
              <button className={`fr-acc-btn${openCols[99] ? " open" : ""}`}
                style={{ color: footerTextColor, borderBottomColor: "rgba(255,255,255,.08)" }}
                onClick={() => setOpenCols((p) => ({ ...p, [99]: !p[99] }))}>
                <span style={{ fontFamily: FONT }}>Newsletter</span>
                <ChevronDown size={15} className="chv" />
              </button>
              <p className="fr-col-title" style={{ fontFamily: FONT, color: `${footerTextColor}30` }}>Newsletter</p>
              <div className={`fr-acc-body${openCols[99] ? " open" : ""}`} style={{ paddingTop: 10 }}>
                <p style={{ fontFamily: FONT, fontSize: 13, color: `${footerTextColor}40`, lineHeight: 1.65, marginBottom: 14 }}>
                  Novidades sobre tecnologia e varejo direto no seu e-mail.
                </p>
                {subscribed ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 12, background: "rgba(34,197,94,.12)", border: "1px solid rgba(34,197,94,.22)" }}>
                    <CheckCircle size={15} style={{ color: "#22c55e", flexShrink: 0 }} />
                    <span style={{ fontFamily: FONT, fontSize: 13, color: "#22c55e", fontWeight: 600 }}>Inscrito com sucesso!</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required
                      style={{ width: "100%", padding: "10px 14px", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, color: footerTextColor, fontSize: 13, outline: "none", fontFamily: FONT, transition: "border-color 0.2s" }}
                      onFocus={(e) => (e.target.style.borderColor = `${pc}60`)}
                      onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,.1)")} />
                    <button type="submit" disabled={subLoading}
                      style={{ width: "100%", padding: "10px 14px", background: subLoading ? "rgba(255,255,255,.1)" : `linear-gradient(135deg,${pc},${sc})`, border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, cursor: subLoading ? "wait" : "pointer", fontFamily: FONT, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, boxShadow: subLoading ? "none" : `0 4px 14px ${pc}35`, transition: "opacity 0.2s" }}
                      onMouseEnter={(e) => { if (!subLoading) (e.currentTarget as HTMLElement).style.opacity = "0.85"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                    >
                      {subLoading ? "Enviando..." : <><Send size={13} /> Inscrever</>}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomBar tc={footerTextColor} divider="rgba(255,255,255,.07)" />
    </footer>
  );
}
