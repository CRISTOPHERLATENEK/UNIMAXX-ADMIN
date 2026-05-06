import React, { useState } from 'react';
import { 
    Layout, Type, Image, Grid, Play, MessageSquare, 
    CreditCard, Users, Clock, HelpCircle, Mail, MapPin,
    Minus, ArrowUpCircle, Palette, Layers, Search,
    Zap, Sparkles, MousePointer2, Smartphone
} from 'lucide-react';

interface ComponentPaletteProps {
    onAdd: (type: string) => void;
}

const COMPONENT_CATEGORIES = [
    {
        id: 'essentials',
        name: 'Essenciais',
        icon: Zap,
        items: [
            { type: 'hero', name: 'Hero Banner', icon: Layout, description: 'Cabeçalho de impacto com CTA', color: 'bg-orange-500' },
            { type: 'text', name: 'Texto Rich', icon: Type, description: 'Bloco de texto formatado', color: 'bg-blue-500' },
            { type: 'image', name: 'Imagem', icon: Image, description: 'Imagem única com legenda', color: 'bg-green-500' },
            { type: 'cta', name: 'Call to Action', icon: MousePointer2, description: 'Banner de conversão direta', color: 'bg-purple-500' },
        ]
    },
    {
        id: 'content',
        name: 'Conteúdo',
        icon: Layers,
        items: [
            { type: 'features', name: 'Recursos', icon: Grid, description: 'Grid de funcionalidades', color: 'bg-indigo-500' },
            { type: 'gallery', name: 'Galeria', icon: Image, description: 'Grid de imagens/fotos', color: 'bg-pink-500' },
            { type: 'video', name: 'Vídeo', icon: Play, description: 'Player de vídeo YouTube/Vimeo', color: 'bg-red-500' },
            { type: 'testimonials', name: 'Depoimentos', icon: MessageSquare, description: 'Feedback de clientes', color: 'bg-yellow-500' },
        ]
    },
    {
        id: 'marketing',
        name: 'Marketing',
        icon: Sparkles,
        items: [
            { type: 'pricing', name: 'Preços', icon: CreditCard, description: 'Tabelas de planos e preços', color: 'bg-emerald-500' },
            { type: 'newsletter', name: 'Newsletter', icon: Mail, description: 'Captura de leads por email', color: 'bg-cyan-500' },
            { type: 'countdown', name: 'Contador', icon: Clock, description: 'Urgência com cronômetro', color: 'bg-rose-500' },
        ]
    },
    {
        id: 'utility',
        name: 'Utilitários',
        icon: Smartphone,
        items: [
            { type: 'faq', name: 'FAQ', icon: HelpCircle, description: 'Perguntas frequentes', color: 'bg-amber-500' },
            { type: 'map', name: 'Mapa', icon: MapPin, description: 'Localização interativa', color: 'bg-slate-500' },
            { type: 'divider', name: 'Divisor', icon: Minus, description: 'Separação visual', color: 'bg-gray-400' },
        ]
    }
];

export const ComponentPalette: React.FC<ComponentPaletteProps> = ({ onAdd }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');

    const filteredCategories = COMPONENT_CATEGORIES.map(cat => ({
        ...cat,
        items: cat.items.filter(item => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })).filter(cat => cat.items.length > 0);

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Search Bar */}
            <div className="p-4 border-b bg-gray-50/50">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                        type="text"
                        placeholder="Buscar bloco..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    />
                </div>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 p-4 overflow-x-auto no-scrollbar border-b">
                <button 
                    onClick={() => setActiveCategory('all')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                        activeCategory === 'all' ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    Todos
                </button>
                {COMPONENT_CATEGORIES.map(cat => (
                    <button 
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-all ${
                            activeCategory === cat.id ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        <cat.icon size={12} />
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Components List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
                {filteredCategories
                    .filter(cat => activeCategory === 'all' || cat.id === activeCategory)
                    .map((category) => (
                    <div key={category.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-1.5 rounded-lg bg-gray-100 text-gray-500">
                                <category.icon size={14} />
                            </div>
                            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest">
                                {category.name}
                            </h4>
                            <div className="flex-1 h-px bg-gray-100 ml-2" />
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3">
                            {category.items.map((item) => (
                                <button
                                    key={item.type}
                                    onClick={() => onAdd(item.type)}
                                    className="group relative flex items-center gap-4 p-3 rounded-2xl border border-gray-100 bg-white hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 text-left overflow-hidden"
                                >
                                    {/* Background Accent */}
                                    <div className={`absolute right-0 top-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-[0.03] group-hover:opacity-[0.08] transition-opacity ${item.color}`} />
                                    
                                    {/* Icon Container */}
                                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${item.color} bg-opacity-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                        <item.icon size={22} className={`text-opacity-90 ${item.color.replace('bg-', 'text-')}`} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <span className="block text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                                            {item.name}
                                        </span>
                                        <span className="block text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                                            {item.description}
                                        </span>
                                    </div>

                                    {/* Add Icon */}
                                    <div className="opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white">
                                            <Zap size={12} fill="currentColor" />
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                {filteredCategories.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Search size={24} className="text-gray-300" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">Nenhum bloco encontrado</p>
                        <p className="text-xs text-gray-500 mt-1">Tente buscar por outro termo</p>
                    </div>
                )}
            </div>

            {/* Footer Tip */}
            <div className="p-4 bg-blue-50/50 border-t">
                <div className="flex items-center gap-2 text-blue-700">
                    <Sparkles size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Dica Pro</span>
                </div>
                <p className="text-[11px] text-blue-600/80 mt-1 leading-relaxed">
                    Clique em um bloco para adicioná-lo instantaneamente ao final da sua página.
                </p>
            </div>
        </div>
    );
};
