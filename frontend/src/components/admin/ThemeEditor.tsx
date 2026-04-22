import React, { useState, useEffect } from 'react';
import { Palette, Type, Layout, Monitor, Check, X } from 'lucide-react';

interface ThemeSettings {
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    success_color: string;
    warning_color: string;
    error_color: string;
    font_family: string;
    heading_font: string;
    base_font_size: string;
    border_radius: string;
    max_width: string;
    custom_css: string;
}

const DEFAULT_THEME: ThemeSettings = {
    primary_color: '#0070f3',
    secondary_color: '#00c4cc',
    accent_color: '#7928ca',
    success_color: '#17c964',
    warning_color: '#f5a524',
    error_color: '#f31260',
    font_family: 'Inter',
    heading_font: 'Inter',
    base_font_size: '16px',
    border_radius: '8px',
    max_width: '1280px',
    custom_css: ''
};

const FONTS = [
    { value: 'Inter', label: 'Inter', category: 'Sans-serif' },
    { value: 'Roboto', label: 'Roboto', category: 'Sans-serif' },
    { value: 'Open Sans', label: 'Open Sans', category: 'Sans-serif' },
    { value: 'Poppins', label: 'Poppins', category: 'Sans-serif' },
    { value: 'Montserrat', label: 'Montserrat', category: 'Sans-serif' },
    { value: 'Playfair Display', label: 'Playfair Display', category: 'Serif' },
    { value: 'Merriweather', label: 'Merriweather', category: 'Serif' },
];

export const ThemeEditor: React.FC = () => {
    const [theme, setTheme] = useState<ThemeSettings>(DEFAULT_THEME);
    const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'layout' | 'css'>('colors');
    const [isSaving, setIsSaving] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);

    useEffect(() => {
        fetchTheme();
    }, []);

    const fetchTheme = async () => {
        try {
            const res = await fetch('/api/admin/theme');
            if (res.ok) {
                const data = await res.json();
                setTheme({ ...DEFAULT_THEME, ...data });
            }
        } catch (error) {
            console.error('Erro ao carregar tema:', error);
        }
    };

    const saveTheme = async () => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            await fetch('/api/admin/theme', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(theme)
            });

            // Aplicar tema em tempo real
            applyThemeToDocument(theme);
            alert('Tema salvo com sucesso!');
        } catch (error) {
            alert('Erro ao salvar tema');
        } finally {
            setIsSaving(false);
        }
    };

    const applyThemeToDocument = (t: ThemeSettings) => {
        const root = document.documentElement;
        root.style.setProperty('--primary-color', t.primary_color);
        root.style.setProperty('--secondary-color', t.secondary_color);
        root.style.setProperty('--accent-color', t.accent_color);
        root.style.setProperty('--font-family', t.font_family);
        root.style.setProperty('--border-radius', t.border_radius);
    };

    const updateTheme = (key: keyof ThemeSettings, value: string) => {
        const newTheme = { ...theme, [key]: value };
        setTheme(newTheme);
        if (previewMode) {
            applyThemeToDocument(newTheme);
        }
    };

    const resetTheme = () => {
        if (confirm('Tem certeza que deseja resetar para o tema padrão?')) {
            setTheme(DEFAULT_THEME);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Personalização do Tema</h1>
                    <p className="text-gray-600 mt-1">Configure as cores, fontes e estilos globais do site</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setPreviewMode(!previewMode)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                            previewMode ? 'bg-blue-50 border-blue-500 text-blue-700' : 'hover:bg-gray-50'
                        }`}
                    >
                        <Monitor size={18} />
                        {previewMode ? 'Desativar Preview' : 'Preview ao Vivo'}
                    </button>
                    <button
                        onClick={resetTheme}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50 text-red-600"
                    >
                        <X size={18} />
                        Resetar
                    </button>
                    <button
                        onClick={saveTheme}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        <Check size={18} />
                        {isSaving ? 'Salvando...' : 'Salvar Tema'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-8">
                {/* Sidebar de navegação */}
                <div className="col-span-1">
                    <nav className="space-y-1">
                        {[
                            { id: 'colors', label: 'Cores', icon: Palette },
                            { id: 'typography', label: 'Tipografia', icon: Type },
                            { id: 'layout', label: 'Layout', icon: Layout },
                            { id: 'css', label: 'CSS Personalizado', icon: Layout },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as any)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                                    activeTab === item.id 
                                        ? 'bg-blue-50 text-blue-700 font-medium' 
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <item.icon size={20} />
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    {/* Preview Box */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Preview</h4>
                        <div className="space-y-3">
                            <button 
                                className="w-full py-2 rounded text-white text-sm font-medium"
                                style={{ backgroundColor: theme.primary_color }}
                            >
                                Botão Primário
                            </button>
                            <button 
                                className="w-full py-2 rounded text-white text-sm font-medium"
                                style={{ backgroundColor: theme.secondary_color }}
                            >
                                Botão Secundário
                            </button>
                            <div 
                                className="p-3 rounded text-center text-sm"
                                style={{ 
                                    border: `2px solid ${theme.accent_color}`,
                                    color: theme.accent_color,
                                    borderRadius: theme.border_radius
                                }}
                            >
                                Borda Colorida
                            </div>
                            <p 
                                className="text-center text-sm"
                                style={{ fontFamily: theme.font_family }}
                            >
                                Fonte: {theme.font_family}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Conteúdo */}
                <div className="col-span-2 bg-white rounded-lg border p-6">
                    {activeTab === 'colors' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold mb-4">Paleta de Cores</h2>

                            {[
                                { key: 'primary_color', label: 'Cor Primária', desc: 'Botões principais, links, destaques' },
                                { key: 'secondary_color', label: 'Cor Secundária', desc: 'Botões secundários, badges' },
                                { key: 'accent_color', label: 'Cor de Ênfase', desc: 'Elementos especiais, gradientes' },
                                { key: 'success_color', label: 'Cor de Sucesso', desc: 'Mensagens positivas, confirmações' },
                                { key: 'warning_color', label: 'Cor de Aviso', desc: 'Alertas, notificações' },
                                { key: 'error_color', label: 'Cor de Erro', desc: 'Erros, validações' },
                            ].map((color) => (
                                <div key={color.key} className="flex items-center justify-between p-4 border rounded-lg hover:border-gray-300">
                                    <div>
                                        <label className="block font-medium text-gray-800">{color.label}</label>
                                        <p className="text-sm text-gray-500">{color.desc}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={theme[color.key as keyof ThemeSettings]}
                                            onChange={(e) => updateTheme(color.key as keyof ThemeSettings, e.target.value)}
                                            className="w-12 h-10 rounded cursor-pointer border-0"
                                        />
                                        <input
                                            type="text"
                                            value={theme[color.key as keyof ThemeSettings]}
                                            onChange={(e) => updateTheme(color.key as keyof ThemeSettings, e.target.value)}
                                            className="w-28 px-3 py-2 border rounded text-sm font-mono uppercase"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'typography' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold mb-4">Tipografia</h2>

                            <div>
                                <label className="block font-medium text-gray-800 mb-2">Fonte Principal</label>
                                <select
                                    value={theme.font_family}
                                    onChange={(e) => updateTheme('font_family', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg"
                                    style={{ fontFamily: theme.font_family }}
                                >
                                    {FONTS.map((font) => (
                                        <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                                            {font.label} ({font.category})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-medium text-gray-800 mb-2">Fonte dos Títulos</label>
                                <select
                                    value={theme.heading_font}
                                    onChange={(e) => updateTheme('heading_font', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg"
                                >
                                    {FONTS.map((font) => (
                                        <option key={font.value} value={font.value}>
                                            {font.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-medium text-gray-800 mb-2">Tamanho Base da Fonte</label>
                                <select
                                    value={theme.base_font_size}
                                    onChange={(e) => updateTheme('base_font_size', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg"
                                >
                                    <option value="14px">14px (Pequeno)</option>
                                    <option value="16px">16px (Padrão)</option>
                                    <option value="18px">18px (Grande)</option>
                                    <option value="20px">20px (Extra Grande)</option>
                                </select>
                            </div>

                            <div className="p-6 bg-gray-50 rounded-lg mt-6">
                                <h3 style={{ fontFamily: theme.heading_font }} className="text-2xl font-bold mb-2">
                                    Título de Exemplo
                                </h3>
                                <p style={{ fontFamily: theme.font_family, fontSize: theme.base_font_size }}>
                                    Este é um texto de exemplo para demonstrar como a tipografia ficará no seu site. 
                                    A fonte principal é {theme.font_family} e o tamanho base é {theme.base_font_size}.
                                </p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'layout' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold mb-4">Layout e Espaçamento</h2>

                            <div>
                                <label className="block font-medium text-gray-800 mb-2">Border Radius Padrão</label>
                                <select
                                    value={theme.border_radius}
                                    onChange={(e) => updateTheme('border_radius', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg"
                                >
                                    <option value="0px">Quadrado (0px)</option>
                                    <option value="4px">Pequeno (4px)</option>
                                    <option value="8px">Médio (8px)</option>
                                    <option value="12px">Grande (12px)</option>
                                    <option value="16px">Extra Grande (16px)</option>
                                    <option value="24px">Arredondado (24px)</option>
                                    <option value="9999px">Pill (100%)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-medium text-gray-800 mb-2">Largura Máxima do Container</label>
                                <select
                                    value={theme.max_width}
                                    onChange={(e) => updateTheme('max_width', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg"
                                >
                                    <option value="960px">960px (Estreito)</option>
                                    <option value="1024px">1024px</option>
                                    <option value="1280px">1280px (Padrão)</option>
                                    <option value="1440px">1440px (Largo)</option>
                                    <option value="100%">100% (Tela Cheia)</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mt-6">
                                <div 
                                    className="h-20 bg-blue-100 flex items-center justify-center text-sm"
                                    style={{ borderRadius: theme.border_radius }}
                                >
                                    Botão
                                </div>
                                <div 
                                    className="h-20 bg-gray-100 flex items-center justify-center text-sm border-2 border-dashed"
                                    style={{ borderRadius: theme.border_radius }}
                                >
                                    Card
                                </div>
                                <div 
                                    className="h-20 bg-green-100 flex items-center justify-center text-sm"
                                    style={{ borderRadius: theme.border_radius }}
                                >
                                    Badge
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'css' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold mb-4">CSS Personalizado</h2>
                            <p className="text-gray-600 mb-4">
                                Adicione CSS customizado para sobrepor estilos padrão. Use com cautela.
                            </p>
                            <textarea
                                value={theme.custom_css}
                                onChange={(e) => updateTheme('custom_css', e.target.value)}
                                rows={15}
                                className="w-full px-4 py-3 border rounded-lg font-mono text-sm"
                                placeholder={`:root {
  --custom-spacing: 20px;
}

.custom-class {
  color: ${theme.primary_color};
}`}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
