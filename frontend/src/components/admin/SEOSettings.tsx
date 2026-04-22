import React, { useState, useEffect } from 'react';
import { Search, Globe, Link, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface SEOData {
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
    og_image: string;
    og_title: string;
    og_description: string;
    canonical_url: string;
    robots_index: boolean;
    robots_follow: boolean;
    schema_type: string;
}

interface SEOSettingsProps {
    pageId?: string;
    initialData?: Partial<SEOData>;
    onSave: (data: SEOData) => void;
}

export const SEOSettings: React.FC<SEOSettingsProps> = ({ 
    pageId, 
    initialData = {},
    onSave 
}) => {
    const [seo, setSeo] = useState<SEOData>({
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        og_image: '',
        og_title: '',
        og_description: '',
        canonical_url: '',
        robots_index: true,
        robots_follow: true,
        schema_type: 'WebPage',
        ...initialData
    });

    const [preview, setPreview] = useState<'google' | 'facebook' | 'twitter'>('google');

    useEffect(() => {
        if (initialData) {
            setSeo(prev => ({ ...prev, ...initialData }));
        }
    }, [initialData]);

    const charCount = (text: string) => text?.length || 0;

    const getSeoScore = () => {
        let score = 0;
        if (charCount(seo.meta_title) >= 30 && charCount(seo.meta_title) <= 60) score += 30;
        if (charCount(seo.meta_description) >= 120 && charCount(seo.meta_description) <= 160) score += 30;
        if (seo.meta_keywords) score += 10;
        if (seo.og_image) score += 20;
        if (seo.canonical_url) score += 10;
        return score;
    };

    const score = getSeoScore();
    const scoreColor = score >= 80 ? 'green' : score >= 50 ? 'yellow' : 'red';

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Search size={24} />
                        Configurações SEO
                    </h2>
                    <p className="text-gray-600 mt-1">
                        Otimize sua página para motores de busca
                    </p>
                </div>
                <div className={`px-4 py-2 rounded-lg font-semibold ${
                    scoreColor === 'green' ? 'bg-green-100 text-green-700' :
                    scoreColor === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                }`}>
                    Score SEO: {score}/100
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
                {/* Formulário */}
                <div className="space-y-6">
                    <div>
                        <label className="block font-medium text-gray-800 mb-2">
                            Meta Title
                            <span className={`ml-2 text-sm ${charCount(seo.meta_title) > 60 ? 'text-red-500' : 'text-gray-500'}`}>
                                ({charCount(seo.meta_title)}/60)
                            </span>
                        </label>
                        <input
                            type="text"
                            value={seo.meta_title}
                            onChange={(e) => setSeo({ ...seo, meta_title: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Título da página"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Ideal: 50-60 caracteres
                        </p>
                    </div>

                    <div>
                        <label className="block font-medium text-gray-800 mb-2">
                            Meta Description
                            <span className={`ml-2 text-sm ${charCount(seo.meta_description) > 160 ? 'text-red-500' : 'text-gray-500'}`}>
                                ({charCount(seo.meta_description)}/160)
                            </span>
                        </label>
                        <textarea
                            value={seo.meta_description}
                            onChange={(e) => setSeo({ ...seo, meta_description: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Descrição da página"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Ideal: 150-160 caracteres
                        </p>
                    </div>

                    <div>
                        <label className="block font-medium text-gray-800 mb-2">
                            Palavras-chave (separadas por vírgula)
                        </label>
                        <input
                            type="text"
                            value={seo.meta_keywords}
                            onChange={(e) => setSeo({ ...seo, meta_keywords: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="palavra1, palavra2, palavra3"
                        />
                    </div>

                    <div>
                        <label className="block font-medium text-gray-800 mb-2">
                            URL Canônica
                        </label>
                        <div className="flex items-center gap-2">
                            <Link size={18} className="text-gray-400" />
                            <input
                                type="text"
                                value={seo.canonical_url}
                                onChange={(e) => setSeo({ ...seo, canonical_url: e.target.value })}
                                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="https://seusite.com/pagina"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block font-medium text-gray-800 mb-2">
                            Imagem Open Graph (OG)
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={seo.og_image}
                                onChange={(e) => setSeo({ ...seo, og_image: e.target.value })}
                                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="URL da imagem"
                            />
                            <button className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                                <ImageIcon size={18} />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Recomendado: 1200x630px
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={seo.robots_index}
                                    onChange={(e) => setSeo({ ...seo, robots_index: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                Indexar página
                            </label>
                        </div>
                        <div>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={seo.robots_follow}
                                    onChange={(e) => setSeo({ ...seo, robots_follow: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                Seguir links
                            </label>
                        </div>
                    </div>

                    <button
                        onClick={() => onSave(seo)}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                    >
                        Salvar Configurações SEO
                    </button>
                </div>

                {/* Preview */}
                <div>
                    <div className="flex gap-2 mb-4">
                        {(['google', 'facebook', 'twitter'] as const).map((type) => (
                            <button
                                key={type}
                                onClick={() => setPreview(type)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
                                    preview === type 
                                        ? 'bg-blue-100 text-blue-700' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                <Globe size={16} />
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="border rounded-lg p-6 bg-gray-50">
                        {preview === 'google' && (
                            <div className="max-w-[600px]">
                                <div className="text-sm text-[#202124] truncate">
                                    {seo.canonical_url || 'https://seusite.com › pagina'}
                                </div>
                                <div className="text-xl text-[#1a0dab] hover:underline cursor-pointer truncate mt-1">
                                    {seo.meta_title || 'Título da página'}
                                </div>
                                <div className="text-sm text-[#4d5156] leading-5 mt-1 line-clamp-2">
                                    {seo.meta_description || 'Descrição da página que aparecerá nos resultados de busca...'}
                                </div>
                            </div>
                        )}

                        {preview === 'facebook' && (
                            <div className="max-w-[500px] bg-white rounded-lg overflow-hidden border">
                                {seo.og_image ? (
                                    <img src={seo.og_image} alt="" className="w-full h-[260px] object-cover" />
                                ) : (
                                    <div className="w-full h-[260px] bg-gray-200 flex items-center justify-center text-gray-400">
                                        <ImageIcon size={48} />
                                    </div>
                                )}
                                <div className="p-3 bg-[#f0f2f5]">
                                    <div className="text-xs text-gray-500 uppercase">
                                        SEUSITE.COM
                                    </div>
                                    <div className="font-semibold text-[#1c1e21] truncate">
                                        {seo.og_title || seo.meta_title || 'Título'}
                                    </div>
                                    <div className="text-sm text-[#606770] line-clamp-2">
                                        {seo.og_description || seo.meta_description || 'Descrição'}
                                    </div>
                                </div>
                            </div>
                        )}

                        {preview === 'twitter' && (
                            <div className="max-w-[500px] bg-white rounded-xl overflow-hidden border">
                                {seo.og_image ? (
                                    <img src={seo.og_image} alt="" className="w-full h-[250px] object-cover" />
                                ) : (
                                    <div className="w-full h-[250px] bg-gray-200 flex items-center justify-center text-gray-400">
                                        <ImageIcon size={48} />
                                    </div>
                                )}
                                <div className="p-3">
                                    <div className="font-semibold text-[#0f1419] truncate">
                                        {seo.og_title || seo.meta_title || 'Título'}
                                    </div>
                                    <div className="text-sm text-[#536471] line-clamp-2">
                                        {seo.og_description || seo.meta_description || 'Descrição'}
                                    </div>
                                    <div className="text-sm text-[#536471] mt-1">
                                        {seo.canonical_url || 'seusite.com'}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {score < 50 && (
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
                            <AlertCircle className="text-yellow-600 flex-shrink-0" />
                            <div className="text-sm text-yellow-800">
                                <p className="font-medium">Melhorias recomendadas:</p>
                                <ul className="mt-1 space-y-1">
                                    {charCount(seo.meta_title) < 30 && <li>• Adicione um meta title mais descritivo</li>}
                                    {charCount(seo.meta_description) < 120 && <li>• Aumente a meta description</li>}
                                    {!seo.og_image && <li>• Adicione uma imagem Open Graph</li>}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
