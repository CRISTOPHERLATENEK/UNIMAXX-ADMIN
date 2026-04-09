import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown, ArrowRight, Moon, Sun, Search, MapPin, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useData } from "@/context/DataContext";
import { useTheme } from "@/context/ThemeContext";

/* ═══════════════════════════════════════════════════════════════
   HEADER — 4 LAYOUTS SELECIONÁVEIS VIA ADMIN (settings.header_layout)
   "default"   → estilo original escuro
   "pill"      → pílula branca arredondada + busca + botões
   "pill-dark" → pílula escura arredondada
   "segmented" → barra cinza segmentada (location · logo · account)
   ═══════════════════════════════════════════════════════════════ */

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const { data } = useData();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const content = data.content;
  const settings = data.settings || {};
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
  const BASE_URL = API_URL.replace("/api", "");

  const pc = settings.primary_color || "#f97316";
  const sc = settings.secondary_color || "#fb923c";
  const headerLayout = settings.header_layout || "default";
  const headerBg = settings.header_bg_color || "";
  const headerText = settings.header_text_color || "";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
    setSearchOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  // ── Logo ──
  const logoValue = content["header.logo"] || "Unimaxx";
  const isImageLogo = logoValue.startsWith("/uploads/") || logoValue.startsWith("http");
  const companyName = content["header.company"] || "Unimaxx";

  // ── Nav items (mesma lógica original) ──
  const activeSolutions = (data.solutions || []).filter((s: any) => s.active === 1);
  const solutionsDropdown = [
    { label: "Todas as Soluções", to: "/solucoes" },
    ...activeSolutions.map((s: any) => ({
      label: s.title,
      to: s.nav_link?.trim() || `/solucao-page/${s.solution_id}`,
    })),
  ];

  const navItems = [
    { label: content["header.nav.solutions"] || "Soluções", dropdown: solutionsDropdown },
    { label: "Segmentos", to: "/segmentos" },
    {
      label: content["header.nav.institutional"] || "Institucional",
      dropdown: [
        { label: "Sobre Nós", to: "/sobre", show: content["sobre.enabled"] !== "0" },
        { label: "Carreiras", to: "/carreiras", show: content["carreiras.enabled"] !== "0" },
        { label: "Imprensa", to: "/imprensa", show: content["imprensa.enabled"] !== "0" },
        { label: "Blog", to: "/blog", show: content["blog.enabled"] !== "0" },
      ].filter((i) => i.show),
    },
    {
      label: content["header.nav.support"] || "Suporte",
      dropdown: [
        { label: "Central de Ajuda", to: "/suporte" },
        { label: "Fale Conosco", to: "/cliente" },
      ],
    },
  ].map((item) => ({
    ...item,
    ...(item.dropdown && item.dropdown.length === 0 ? { dropdown: undefined, to: "/" } : {}),
  }));

  const isActive = (path: string) => location.pathname === path;

  // ── Render Logo ──
  const renderLogo = (color: string = "white", size: "sm" | "md" = "md") => {
    const sz = size === "sm" ? 32 : 36;
    const fs = size === "sm" ? 15 : 17;
    return (
      <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
        {isImageLogo ? (
          <img
            src={logoValue.startsWith("http") ? logoValue : `${BASE_URL}${logoValue}`}
            alt="Logo"
            style={{ height: sz, width: "auto", objectFit: "contain" }}
          />
        ) : (
          <>
            <div
              className="rounded-[10px] flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-105"
              style={{
                width: sz, height: sz,
                background: `linear-gradient(135deg, ${pc} 0%, ${sc} 100%)`,
                boxShadow: `0 4px 16px ${pc}4D`,
              }}
            >
              <span className="text-white font-bold leading-none" style={{ fontFamily: "'Outfit', sans-serif", fontSize: sz * 0.45 }}>
                {companyName[0]}
              </span>
            </div>
            <span
              className="font-semibold tracking-tight transition-colors duration-300"
              style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.02em", fontSize: fs, color }}
            >
              {logoValue}
            </span>
          </>
        )}
      </Link>
    );
  };

  // ── Dropdown genérico ──
  const renderDropdown = (item: any, textColor: string, hoverBg: string) => (
    <div
      key={item.label}
      className="relative"
      onMouseEnter={() => item.dropdown && setActiveDropdown(item.label)}
      onMouseLeave={() => setActiveDropdown(null)}
    >
      {item.dropdown ? (
        <>
          <button
            className="flex items-center gap-1 px-4 py-2 text-[13px] font-medium rounded-lg transition-all duration-200"
            style={{ fontFamily: "'DM Sans', sans-serif", color: textColor }}
            onMouseEnter={(e) => { e.currentTarget.style.background = hoverBg; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            {item.label}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-250 ${activeDropdown === item.label ? "rotate-180" : ""}`} />
          </button>
          {activeDropdown === item.label && (
            <div
              className="absolute top-full left-0 mt-2 w-56 rounded-2xl shadow-2xl border py-2 animate-scale-in z-[60]"
              style={{
                background: "var(--s0, #fff)",
                backdropFilter: "saturate(180%) blur(20px)",
                borderColor: "var(--b1, rgba(0,0,0,.08))",
                boxShadow: "0 20px 60px rgba(0,0,0,.14), 0 4px 12px rgba(0,0,0,.06)",
              }}
            >
              {item.dropdown.map((sub: any, i: number) => (
                <Link
                  key={sub.label}
                  to={sub.to}
                  className={`flex items-center justify-between px-3.5 py-2.5 text-[13px] font-medium transition-all duration-150 mx-1 rounded-xl group/item ${isActive(sub.to)
                      ? "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-500/10"
                      : "text-[#1d1d1f]/80 hover:text-[#1d1d1f] hover:bg-gray-50 dark:text-white/70 dark:hover:text-white dark:hover:bg-white/[.06]"
                    }`}
                  style={{ animationDelay: `${i * 25}ms`, fontFamily: "'DM Sans', sans-serif" }}
                >
                  {sub.label}
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover/item:opacity-100 -translate-x-1 group-hover/item:translate-x-0 transition-all text-orange-500 duration-200" />
                </Link>
              ))}
            </div>
          )}
        </>
      ) : (
        <Link
          to={item.to!}
          className={`px-4 py-2 text-[13px] font-medium rounded-lg transition-all duration-200 ${isActive(item.to!) ? "font-bold" : ""
            }`}
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: isActive(item.to!) ? pc : textColor,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = hoverBg; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          {item.label}
        </Link>
      )}
    </div>
  );

  // ── Mobile menu (reutilizado por todos layouts) ──
  const mobileMenu = (
    <div
      className="lg:hidden overflow-hidden transition-all duration-400"
      style={{ maxHeight: isMenuOpen ? "100vh" : "0", opacity: isMenuOpen ? 1 : 0 }}
    >
      <div
        className="border-t dark:border-white/[.06]"
        style={{ background: "var(--s0, #fff)", backdropFilter: "saturate(180%) blur(20px)", borderColor: "var(--b1, rgba(0,0,0,.06))" }}
      >
        <div className="px-4 py-4 max-h-[75vh] overflow-y-auto space-y-0.5">
          {navItems.map((item) => (
            <div key={item.label}>
              {item.dropdown ? (
                <>
                  <p className="px-3 pt-4 pb-1.5 text-[10px] font-semibold text-[#98989d] uppercase tracking-[0.12em]"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    {item.label}
                  </p>
                  {item.dropdown.map((subItem) => (
                    <Link
                      key={subItem.label}
                      to={subItem.to}
                      className={`flex items-center justify-between px-3 py-3 text-[15px] font-medium rounded-xl transition-colors ${isActive(subItem.to)
                          ? "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-500/10"
                          : "text-[#1d1d1f] hover:bg-gray-50 dark:text-white/80 dark:hover:bg-white/[.05]"
                        }`}
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {subItem.label}
                      <ArrowRight className="w-3.5 h-3.5 text-gray-300" />
                    </Link>
                  ))}
                </>
              ) : (
                <Link
                  to={item.to!}
                  className={`flex items-center justify-between px-3 py-3 text-[15px] font-medium rounded-xl transition-colors ${isActive(item.to!)
                      ? "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-500/10"
                      : "text-[#1d1d1f] hover:bg-gray-50 dark:text-white/80 dark:hover:bg-white/[.05]"
                    }`}
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300" />
                </Link>
              )}
            </div>
          ))}
          <div className="pt-4 pb-2">
            <Link
              to="/cliente"
              className="flex items-center justify-center w-full px-5 py-3.5 text-[15px] font-semibold rounded-2xl text-white transition-all"
              style={{
                background: `linear-gradient(135deg, ${pc} 0%, ${sc} 100%)`,
                boxShadow: `0 6px 20px ${pc}40`,
                fontFamily: "'DM Sans', sans-serif",
              }}
              onClick={() => setIsMenuOpen(false)}
            >
              Fale Conosco
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Mobile toggle ──
  const mobileToggle = (iconColor: string) => (
    <div className="flex lg:hidden items-center gap-1">
      <button onClick={toggleTheme} className="p-2 rounded-lg transition-colors" style={{ color: iconColor }}>
        {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
      <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-lg transition-colors" style={{ color: iconColor }}>
        {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>
    </div>
  );

  /* ═══════════════════════════════════════════
     LAYOUT 1: "pill" — Pílula branca flutuante
     ═══════════════════════════════════════════ */
  if (headerLayout === "pill") {
    return (
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3">
          <div
            className={`flex items-center justify-between h-[56px] px-5 transition-all duration-500 ${isScrolled
                ? "bg-white/95 dark:bg-[#1a1a1d]/95 shadow-lg shadow-black/[.06] backdrop-blur-xl"
                : "bg-white dark:bg-[#1a1a1d] shadow-md shadow-black/[.04]"
              }`}
            style={{ borderRadius: 9999, border: "1px solid rgba(0,0,0,.06)" }}
          >
            {renderLogo(theme === "dark" ? "#fff" : "#1d1d1f", "sm")}

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {navItems.map((item) =>
                renderDropdown(item, theme === "dark" ? "rgba(255,255,255,.7)" : "rgba(29,29,31,.65)", theme === "dark" ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.04)")
              )}
            </nav>

            {/* Search + Buttons */}
            <div className="hidden lg:flex items-center gap-2">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 absolute left-3 text-gray-400 pointer-events-none" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 w-32 pl-8 pr-3 text-[12px] rounded-full border bg-gray-50 dark:bg-white/5 dark:border-white/10 text-[#1d1d1f] dark:text-white placeholder:text-gray-400 outline-none focus:border-orange-300 transition-all"
                  style={{ fontFamily: "'DM Sans', sans-serif", borderColor: "rgba(0,0,0,.1)" }}
                />
              </div>

              <button onClick={toggleTheme} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors">
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <Link
                to="/cliente"
                className="px-4 py-1.5 text-[12px] font-semibold rounded-full border-2 transition-all duration-200"
                style={{
                  borderColor: pc,
                  color: pc,
                  fontFamily: "'DM Sans', sans-serif",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = pc; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = pc; }}
              >
                Cadastrar
              </Link>

              <Link
                to="/cliente"
                className="px-4 py-1.5 text-[12px] font-semibold rounded-full text-white transition-all duration-200"
                style={{
                  background: `linear-gradient(135deg, ${pc}, ${sc})`,
                  boxShadow: `0 3px 12px ${pc}40`,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Login
              </Link>
            </div>

            {mobileToggle(theme === "dark" ? "#fff" : "#1d1d1f")}
          </div>
        </div>
        {mobileMenu}
      </header>
    );
  }

  /* ═══════════════════════════════════════════
     LAYOUT 2: "pill-dark" — Pílula escura
     ═══════════════════════════════════════════ */
  if (headerLayout === "pill-dark") {
    return (
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3">
          <div
            className={`flex items-center justify-between h-[56px] px-5 transition-all duration-500 ${isScrolled ? "shadow-lg shadow-black/[.15] backdrop-blur-xl" : "shadow-md shadow-black/[.1]"
              }`}
            style={{
              borderRadius: 9999,
              background: headerBg
                ? isScrolled ? `${headerBg}f2` : `${headerBg}e6`
                : isScrolled ? "rgba(14,24,34,.95)" : "#0e1822",
              border: "1px solid rgba(255,255,255,.06)",
            }}
          >
            {renderLogo("#ffffff", "sm")}

            <nav className="hidden lg:flex items-center gap-0.5">
              {navItems.map((item) => renderDropdown(item, "rgba(255,255,255,.7)", "rgba(255,255,255,.08)"))}
            </nav>

            <div className="hidden lg:flex items-center gap-2">
              <button onClick={toggleTheme} className="p-2 rounded-lg text-white/40 hover:text-white transition-colors">
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <Link
                to="/cliente"
                className="px-5 py-2 text-[12px] font-semibold rounded-full text-white transition-all duration-200"
                style={{
                  background: `linear-gradient(135deg, ${pc}, ${sc})`,
                  boxShadow: `0 3px 12px ${pc}50`,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Fale Conosco
              </Link>
            </div>

            {mobileToggle("#ffffff")}
          </div>
        </div>
        {mobileMenu}
      </header>
    );
  }

  /* ═══════════════════════════════════════════
     LAYOUT 3: "segmented" — Barra segmentada
     ═══════════════════════════════════════════ */
  if (headerLayout === "segmented") {
    return (
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? "shadow-md shadow-black/[.04]" : ""
          }`}
        style={{
          background: isScrolled
            ? theme === "dark" ? "rgba(26,26,29,.97)" : "rgba(244,245,247,.97)"
            : theme === "dark" ? "#1a1a1d" : "#f4f5f7",
          backdropFilter: isScrolled ? "blur(20px)" : undefined,
        }}
      >
        {/* Top bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[52px]"
            style={{ borderBottom: `1px solid ${theme === "dark" ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)"}` }}
          >
            <div className="hidden lg:flex items-center gap-2 text-[12px] font-medium"
              style={{ color: theme === "dark" ? "rgba(255,255,255,.5)" : "rgba(29,29,31,.5)", fontFamily: "'DM Sans', sans-serif" }}>
              <MapPin className="w-3.5 h-3.5" />
              <span>{content["company.address_short"] || "Localização"}</span>
            </div>

            <div className="flex-1 flex justify-center">
              {renderLogo(theme === "dark" ? "#fff" : "#1d1d1f", "md")}
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <button onClick={toggleTheme} className="p-2 rounded-lg transition-colors"
                style={{ color: theme === "dark" ? "rgba(255,255,255,.5)" : "rgba(29,29,31,.5)" }}>
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <Link to="/cliente"
                className="flex items-center gap-2 text-[12px] font-medium transition-colors"
                style={{ color: theme === "dark" ? "rgba(255,255,255,.5)" : "rgba(29,29,31,.5)", fontFamily: "'DM Sans', sans-serif" }}>
                <User className="w-3.5 h-3.5" />
                Minha Conta
              </Link>
            </div>

            {mobileToggle(theme === "dark" ? "#fff" : "#1d1d1f")}
          </div>
        </div>

        {/* Nav row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="hidden lg:flex items-center justify-center gap-0.5 h-[44px]">
            {navItems.map((item) =>
              renderDropdown(item, theme === "dark" ? "rgba(255,255,255,.65)" : "rgba(29,29,31,.6)", theme === "dark" ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.04)")
            )}
          </nav>
        </div>

        {mobileMenu}
      </header>
    );
  }

  /* ═══════════════════════════════════════════
     LAYOUT DEFAULT — Original escuro
     ═══════════════════════════════════════════ */
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
          ? "glass shadow-sm shadow-black/[.04] border-b border-black/[.06] dark:border-white/[.05]"
          : "backdrop-blur-xl"
        }`}
      style={{
        background: headerBg
          ? isScrolled ? `${headerBg}f2` : `${headerBg}e6`
          : isScrolled ? undefined : "rgba(10,10,12,0.90)",
      }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[2px] transition-opacity duration-500"
        style={{
          background: `linear-gradient(90deg, transparent, ${pc}, transparent)`,
          opacity: isScrolled ? 0.35 : 0,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[64px]">
          {renderLogo(headerText || (isScrolled ? (theme === "dark" ? "#fff" : "#1d1d1f") : "#fff"))}

          <nav className="hidden lg:flex items-center gap-0.5">
            {navItems.map((item) =>
              renderDropdown(
                item,
                headerText
                  ? headerText
                  : isScrolled
                    ? theme === "dark" ? "rgba(255,255,255,.7)" : "rgba(29,29,31,.65)"
                    : "rgba(255,255,255,.7)",
                isScrolled
                  ? theme === "dark" ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.04)"
                  : "rgba(255,255,255,.07)"
              )
            )}
          </nav>

          <div className="hidden lg:flex items-center gap-2.5">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-all duration-200"
              style={{
                color: headerText
                  ? `${headerText}80`
                  : isScrolled
                    ? theme === "dark" ? "rgba(255,255,255,.5)" : "rgba(29,29,31,.5)"
                    : "rgba(255,255,255,.5)",
              }}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link
              to="/cliente"
              className="text-[13px] font-medium px-4 py-2 rounded-lg transition-all duration-200"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: headerText
                  ? `${headerText}99`
                  : isScrolled
                    ? theme === "dark" ? "rgba(255,255,255,.6)" : "rgba(29,29,31,.65)"
                    : "rgba(255,255,255,.6)",
              }}
            >
              Área do Cliente
            </Link>

            <Link
              to="/cliente"
              className="px-5 py-2.5 text-[13px] font-semibold rounded-full text-white transition-all duration-300 btn-apple"
              style={{
                background: `linear-gradient(135deg, ${pc} 0%, ${sc} 100%)`,
                boxShadow: `0 4px 16px ${pc}47`,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Fale Conosco
            </Link>
          </div>

          {mobileToggle(headerText || (isScrolled ? (theme === "dark" ? "#fff" : "#1d1d1f") : "#fff"))}
        </div>
      </div>

      {mobileMenu}
    </header>
  );
}