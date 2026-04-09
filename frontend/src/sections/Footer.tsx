import { useState } from "react";
import type React from "react";
import { Link } from "react-router-dom";
import { useData } from "@/context/DataContext";
import {
  ArrowUpRight, Linkedin, Facebook, Instagram, Youtube,
  Send, CheckCircle, Globe, Hash, MessageSquare, Search,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   FOOTER — 4 LAYOUTS SELECIONÁVEIS VIA ADMIN (settings.footer_layout)
   "default"       → colunas escuro original (com newsletter)
   "columns-white" → mega-footer branco com busca + colunas
   "columns-dark"  → mega-footer escuro com busca + colunas
   "minimal"       → centralizado simples (nav + social + copyright)
   ═══════════════════════════════════════════════════════════════ */

export function Footer() {
  const { data } = useData();
  const content = data.content || {};
  const settings = data.settings || {};

  const pc = settings.primary_color || "#f97316";
  const sc = settings.secondary_color || "#fb923c";

  // ── Cores/configs do rodapé (admin) ──
  const footerBg = settings.footer_bg || "#080809";
  const footerTextColor = settings.footer_text_color || "#ffffff";
  const showSocial = settings.footer_show_social !== "0";
  const showCnpj = settings.footer_show_cnpj === "1";
  const footerLayout = settings.footer_layout || "default";

  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
  const BASE_URL = API_URL.replace("/api", "");

  // ── Logo ──
  const logoValue = content["header.logo_white"] || content["header.logo"] || content["footer.logo"] || "";
  const isImageLogo = logoValue.startsWith("/uploads/") || logoValue.startsWith("http");
  const logoSrc = logoValue.startsWith("http") ? logoValue : logoValue ? `${BASE_URL}${logoValue}` : "";
  const companyName = content["header.company"] || "Unimaxx";

  // ── Colunas ──
  let customCols: { title: string; links: { label: string; url: string }[] }[] = [];
  try { customCols = JSON.parse(settings.footer_columns || "[]"); } catch {}

  const solutionLinks = (data.solutions || [])
    .filter((s: any) => s.active === 1)
    .slice(0, 5)
    .map((s: any) => ({ label: s.title, to: s.nav_link?.trim() || `/solucao-page/${s.solution_id}` }));

  const defaultCols = [
    { title: "Soluções", links: [{ label: "Todas as Soluções", to: "/solucoes" }, ...solutionLinks] },
    {
      title: "Empresa",
      links: [
        { label: "Sobre Nós", to: "/sobre" },
        { label: "Carreiras", to: "/carreiras" },
        { label: "Imprensa", to: "/imprensa" },
        { label: "Blog", to: "/blog" },
      ],
    },
    {
      title: "Suporte",
      links: [
        { label: "Central de Ajuda", to: "/suporte" },
        { label: "Fale Conosco", to: "/cliente" },
      ],
    },
  ];

  const customColsNorm = customCols
    .filter((c) => c.title)
    .map((c) => ({
      title: c.title,
      links: (c.links || []).filter((l) => l.label && l.url).map((l) => ({ label: l.label, to: l.url })),
    }));

  const linkCols = customColsNorm.length > 0 ? customColsNorm : defaultCols;

  // ── Nav items simplificados para footer minimal ──
  const footerNav = [
    { label: "Home", to: "/" },
    { label: content["header.nav.solutions"] || "Soluções", to: "/solucoes" },
    { label: "Blog", to: "/blog" },
    { label: "Central de Ajuda", to: "/suporte" },
    { label: "Sobre", to: "/sobre" },
  ];

  // ── Redes sociais ──
  const socials = [
    { Icon: Youtube, href: settings.social_youtube, label: "YouTube" },
    { Icon: Facebook, href: settings.social_facebook, label: "Facebook" },
    { Icon: Instagram, href: settings.social_instagram, label: "Instagram" },
    { Icon: Linkedin, href: settings.social_linkedin, label: "LinkedIn" },
    { Icon: Globe, href: settings.social_twitter, label: "X" },
    { Icon: Hash, href: settings.social_tiktok, label: "TikTok" },
    { Icon: MessageSquare, href: settings.social_telegram, label: "Telegram" },
  ].filter((s) => s.href);

  // ── Newsletter ──
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubLoading(true);
    try {
      const res = await fetch(`${API_URL}/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "rodapé" }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Erro ao inscrever");
      setSubscribed(true);
    } catch {
      setSubscribed(true);
    } finally {
      setSubLoading(false);
    }
  };

  const footerExtra = content["footer.extra"] || "";
  const copyrightText = content["footer.copyright"] || `© ${new Date().getFullYear()} ${companyName}. Todos os direitos reservados.`;

  // ── Render Logo ──
  const renderLogo = (color: string, size: number = 36) => (
    <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
      {isImageLogo ? (
        <img src={logoSrc} alt="Logo" style={{ height: size, width: "auto", objectFit: "contain" }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
      ) : (
        <>
          <div style={{
            width: size + 2, height: size + 2, borderRadius: 10, flexShrink: 0,
            background: `linear-gradient(135deg, ${pc}, ${sc})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: size * 0.47, fontWeight: 900, color: "#fff", fontFamily: "'Outfit'",
          }}>
            {companyName[0]}
          </div>
          <span style={{ fontFamily: "'Outfit'", fontWeight: 800, fontSize: size * 0.5, color }}>
            {companyName}
          </span>
        </>
      )}
    </Link>
  );

  // ── Social icons (reutilizável) ──
  const renderSocials = (iconColor: string, hoverBg: string, bgColor: string, borderColor: string, sz: number = 38) => (
    showSocial && socials.length > 0 ? (
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {socials.map(({ Icon, href, label }) => (
          <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}
            style={{
              width: sz, height: sz, borderRadius: 10,
              background: bgColor,
              border: `1px solid ${borderColor}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              textDecoration: "none", transition: "all 0.25s ease",
              color: iconColor,
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = hoverBg;
              el.style.borderColor = hoverBg;
              el.style.color = "#fff";
              el.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = bgColor;
              el.style.borderColor = borderColor;
              el.style.color = iconColor;
              el.style.transform = "translateY(0)";
            }}>
            <Icon size={16} />
          </a>
        ))}
      </div>
    ) : null
  );

  /* ═══════════════════════════════════════════
     LAYOUT "minimal" — Centralizado escuro
     ═══════════════════════════════════════════ */
  if (footerLayout === "minimal") {
    return (
      <footer style={{ background: "#0e1822", color: "#fff" }}>
        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${pc}40, ${sc}40, transparent)` }} />

        <div style={{ maxWidth: "80rem", margin: "0 auto", padding: "3.5rem 2rem 2rem", textAlign: "center" }}>
          {/* Nav links */}
          <nav style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "8px 24px", marginBottom: 28 }}>
            {footerNav.map((item) => (
              <Link key={item.to} to={item.to}
                style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500,
                  color: "rgba(255,255,255,.6)", textDecoration: "none", transition: "color 0.2s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.6)")}>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Social icons centered */}
          {showSocial && socials.length > 0 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 28 }}>
              {socials.map(({ Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}
                  style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: "rgba(255,255,255,.06)",
                    border: "1px solid rgba(255,255,255,.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    textDecoration: "none", transition: "all 0.25s ease",
                    color: "rgba(255,255,255,.45)",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = pc;
                    el.style.borderColor = pc;
                    el.style.color = "#fff";
                    el.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "rgba(255,255,255,.06)";
                    el.style.borderColor = "rgba(255,255,255,.1)";
                    el.style.color = "rgba(255,255,255,.45)";
                    el.style.transform = "translateY(0)";
                  }}>
                  <Icon size={17} />
                </a>
              ))}
            </div>
          )}

          {/* Divider */}
          <div style={{ height: 1, background: "rgba(255,255,255,.06)", marginBottom: 20 }} />

          {/* Copyright */}
          <p style={{ fontFamily: "'DM Sans'", fontSize: 12, color: "rgba(255,255,255,.3)" }}>
            {copyrightText}
          </p>
          {footerExtra && (
            <p style={{ fontFamily: "'DM Sans'", fontSize: 12, color: "rgba(255,255,255,.25)", marginTop: 4 }}>{footerExtra}</p>
          )}
        </div>
      </footer>
    );
  }

  /* ═══════════════════════════════════════════
     LAYOUT "columns-white" — Mega-footer branco
     ═══════════════════════════════════════════ */
  if (footerLayout === "columns-white") {
    return (
      <footer style={{ background: "#ffffff", color: "#1d1d1f" }}>
        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${pc}30, ${sc}30, transparent)` }} />

        <div style={{ maxWidth: "80rem", margin: "0 auto", padding: "4rem 2rem 2rem" }}>
          {/* Top: logo + search */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", marginBottom: 40, gap: 16 }}>
            {renderLogo("#1d1d1f")}

            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Search size={14} style={{ position: "absolute", left: 12, color: "#98989d", pointerEvents: "none" }} />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  height: 36, width: 200, paddingLeft: 34, paddingRight: 12,
                  fontSize: 13, borderRadius: 8, border: "1px solid rgba(0,0,0,.1)",
                  background: "#f5f5f7", color: "#1d1d1f", outline: "none",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
              <button style={{
                marginLeft: 8, height: 36, padding: "0 16px",
                borderRadius: 8, border: "none",
                background: `linear-gradient(135deg, ${pc}, ${sc})`,
                color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}>
                Buscar
              </button>
            </div>
          </div>

          {/* Columns */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "2rem", marginBottom: 40,
          }}>
            {linkCols.map((col, i) => (
              <div key={i}>
                <h4 style={{
                  fontFamily: "'DM Sans'", fontSize: 11, fontWeight: 700,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  color: "rgba(29,29,31,.35)", marginBottom: 18,
                }}>{col.title}</h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <Link to={link.to} style={{ textDecoration: "none" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          fontFamily: "'DM Sans'", fontSize: 13.5, color: "rgba(29,29,31,.52)",
                          transition: "color 0.2s",
                        }}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#1d1d1f")}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(29,29,31,.52)")}>
                          {link.label}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Social + copyright */}
          <div style={{
            borderTop: "1px solid rgba(0,0,0,.06)", paddingTop: 20,
            display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12,
          }}>
            <p style={{ fontFamily: "'DM Sans'", fontSize: 12, color: "rgba(29,29,31,.3)" }}>
              {copyrightText}
            </p>
            {renderSocials("rgba(29,29,31,.4)", pc, "rgba(0,0,0,.03)", "rgba(0,0,0,.06)", 34)}
          </div>
        </div>
      </footer>
    );
  }

  /* ═══════════════════════════════════════════
     LAYOUT "columns-dark" — Mega-footer escuro
     ═══════════════════════════════════════════ */
  if (footerLayout === "columns-dark") {
    return (
      <footer style={{ background: "#0e1822", color: "#ffffff" }}>
        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${pc}40, ${sc}40, transparent)` }} />

        <div style={{ maxWidth: "80rem", margin: "0 auto", padding: "4rem 2rem 2rem" }}>
          {/* Top: logo + search */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", marginBottom: 40, gap: 16 }}>
            {renderLogo("#ffffff")}

            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <Search size={14} style={{ position: "absolute", left: 12, color: "rgba(255,255,255,.35)", pointerEvents: "none" }} />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  height: 36, width: 200, paddingLeft: 34, paddingRight: 12,
                  fontSize: 13, borderRadius: 8, border: "1px solid rgba(255,255,255,.1)",
                  background: "rgba(255,255,255,.05)", color: "#fff", outline: "none",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
              <button style={{
                marginLeft: 8, height: 36, padding: "0 16px",
                borderRadius: 8, border: "none",
                background: `linear-gradient(135deg, ${pc}, ${sc})`,
                color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}>
                Buscar
              </button>
            </div>
          </div>

          {/* Columns */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "2rem", marginBottom: 40,
          }}>
            {linkCols.map((col, i) => (
              <div key={i}>
                <h4 style={{
                  fontFamily: "'DM Sans'", fontSize: 11, fontWeight: 700,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  color: "rgba(255,255,255,.3)", marginBottom: 18,
                }}>{col.title}</h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <Link to={link.to} style={{ textDecoration: "none" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          fontFamily: "'DM Sans'", fontSize: 13.5, color: "rgba(255,255,255,.45)",
                          transition: "color 0.2s",
                        }}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#fff")}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.45)")}>
                          {link.label}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Social + copyright */}
          <div style={{
            borderTop: "1px solid rgba(255,255,255,.06)", paddingTop: 20,
            display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12,
          }}>
            <p style={{ fontFamily: "'DM Sans'", fontSize: 12, color: "rgba(255,255,255,.25)" }}>
              {copyrightText}
            </p>
            {renderSocials("rgba(255,255,255,.4)", pc, "rgba(255,255,255,.05)", "rgba(255,255,255,.08)", 34)}
          </div>
        </div>
      </footer>
    );
  }

  /* ═══════════════════════════════════════════
     LAYOUT DEFAULT — Original completo (com newsletter)
     ═══════════════════════════════════════════ */
  return (
    <footer style={{ background: footerBg, color: footerTextColor }}>
      <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${pc}40, ${sc}40, transparent)` }} />

      <div style={{ maxWidth: "80rem", margin: "0 auto", padding: "5rem 2rem 3rem" }}>
        <div data-stagger style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "2.5rem",
        }}>
          {/* Brand column */}
          <div style={{ gridColumn: "span 2" }}>
            <div style={{ marginBottom: 20 }}>
              {renderLogo(footerTextColor)}
            </div>

            <p style={{ fontFamily: "'DM Sans'", fontSize: 13.5, color: `${footerTextColor}70`, lineHeight: 1.75, maxWidth: 240, marginBottom: 16 }}>
              {content["footer.description"] || ""}
            </p>

            {showCnpj && content["company.cnpj"] && (
              <p style={{ fontFamily: "'DM Sans'", fontSize: 11.5, color: `${footerTextColor}35`, marginBottom: 16 }}>
                CNPJ: {content["company.cnpj"]}
              </p>
            )}

            {renderSocials(`${footerTextColor}55`, pc, "rgba(255,255,255,.05)", "rgba(255,255,255,.08)")}
          </div>

          {/* Link columns */}
          {linkCols.map((col, i) => (
            <div key={i}>
              <h4 style={{
                fontFamily: "'DM Sans'", fontSize: 10, fontWeight: 700,
                letterSpacing: "0.14em", textTransform: "uppercase",
                color: `${footerTextColor}35`, marginBottom: 20,
              }}>{col.title}</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {col.links.map((link, j) => (
                  <li key={j}>
                    <Link to={link.to} style={{ textDecoration: "none" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        fontFamily: "'DM Sans'", fontSize: 13.5, color: `${footerTextColor}52`,
                        transition: "color 0.2s",
                      }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = footerTextColor)}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = `${footerTextColor}52`)}>
                        {link.label}
                        <ArrowUpRight size={11} style={{ opacity: 0 }} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div>
            <h4 style={{
              fontFamily: "'DM Sans'", fontSize: 10, fontWeight: 700,
              letterSpacing: "0.14em", textTransform: "uppercase",
              color: `${footerTextColor}35`, marginBottom: 20,
            }}>Newsletter</h4>
            <p style={{ fontFamily: "'DM Sans'", fontSize: 13, color: `${footerTextColor}40`, lineHeight: 1.6, marginBottom: 16 }}>
              Novidades sobre tecnologia e varejo direto no seu e-mail.
            </p>

            {subscribed ? (
              <div style={{
                display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
                borderRadius: 12, background: "rgba(34,197,94,.12)", border: "1px solid rgba(34,197,94,.25)",
              }}>
                <CheckCircle size={16} style={{ color: "#22c55e", flexShrink: 0 }} />
                <span style={{ fontFamily: "'DM Sans'", fontSize: 13, color: "#22c55e", fontWeight: 600 }}>Inscrito com sucesso!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com" required
                  style={{
                    width: "100%", padding: "10px 14px",
                    background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)",
                    borderRadius: 12, color: footerTextColor, fontSize: 13, outline: "none",
                    fontFamily: "'DM Sans'", boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = `${pc}60`)}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,.1)")} />
                <button type="submit" disabled={subLoading}
                  style={{
                    width: "100%", padding: "10px 14px",
                    background: subLoading ? "rgba(255,255,255,.1)" : `linear-gradient(135deg, ${pc}, ${sc})`,
                    border: "none", borderRadius: 12, color: "#fff",
                    fontSize: 13, fontWeight: 700, cursor: subLoading ? "wait" : "pointer",
                    fontFamily: "'DM Sans'", display: "flex", alignItems: "center",
                    justifyContent: "center", gap: 6,
                  }}>
                  {subLoading ? "Enviando..." : <><Send size={13} /> Inscrever</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{
          maxWidth: "80rem", margin: "0 auto", padding: "1.5rem 2rem",
          display: "flex", flexWrap: "wrap", justifyContent: "space-between",
          alignItems: "center", gap: 12,
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <p style={{ fontFamily: "'DM Sans'", fontSize: 12, color: `${footerTextColor}30` }}>
              {copyrightText}
            </p>
            {footerExtra && (
              <p style={{ fontFamily: "'DM Sans'", fontSize: 12, color: `${footerTextColor}30` }}>{footerExtra}</p>
            )}
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            {[{ label: "Privacidade", to: "/privacidade" }, { label: "Termos", to: "/termos" }].map((l) => (
              <Link key={l.to} to={l.to}
                style={{ fontFamily: "'DM Sans'", fontSize: 12, color: `${footerTextColor}30`, textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = `${footerTextColor}70`)}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = `${footerTextColor}30`)}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
