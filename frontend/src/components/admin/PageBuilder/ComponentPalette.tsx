import React from 'react';
import { 
    Layout, Type, Image, Grid, Play, MessageSquare, 
    CreditCard, Users, Clock, HelpCircle, Mail, MapPin,
    Minus, ArrowUpCircle, Palette, Layers
} from 'lucide-react';

interface ComponentPaletteProps {
    onAdd: (type: string) => void;
}

const COMPONENT_CATEGORIES = [
    {
        name: 'Básicos',
        items: [
            { type: 'hero', name: 'Hero Banner', icon: Layout, description: 'Seção principal com título, subtítulo e CTA' },
            { type: 'text', name: 'Texto Rich', icon: Type, description: 'Bloco de texto com formatação' },
            { type: 'image', name: 'Imagem', icon: Image, description: 'Imagem única com legenda' },
            { type: 'divider', name: 'Divisor', icon: Minus, description: 'Linha separadora' },
            { type: 'spacer', name: 'Espaçador', icon: ArrowUpCircle, description: 'Espaço vertical' },
        ]
    },
    {
        name: 'Conteúdo',
        items: [
            { type: 'features', name: 'Grid de Recursos', icon: Grid, description: 'Cards em colunas' },
            { type: 'gallery', name: 'Galeria', icon: Image, description: 'Grid de imagens' },
            { type: 'video', name: 'Vídeo', icon: Play, description: 'Player de vídeo' },
            { type: 'testimonials', name: 'Depoimentos', icon: MessageSquare, description: 'Carrossel de depoimentos' },
        ]
    },
    {
        name: 'Marketing',
        items: [
            { type: 'pricing', name: 'Preços', icon: CreditCard, description: 'Tabela de planos' },
            { type: 'cta', name: 'Call to Action', icon: ArrowUpCircle, description: 'Banner de conversão' },
            { type: 'newsletter', name: 'Newsletter', icon: Mail, description: 'Formulário de email' },
            { type: 'countdown', name: 'Contador', icon: Clock, description: 'Contagem regressiva' },
        ]
    },
    {
        name: 'Empresa',
        items: [
            { type: 'team', name: 'Equipe', icon: Users, description: 'Perfis da equipe' },
            { type: 'map', name: 'Mapa', icon: MapPin, description: 'Mapa interativo' },
            { type: 'faq', name: 'FAQ', icon: HelpCircle, description: 'Acordeão de perguntas' },
        ]
    }
];

export const ComponentPalette: React.FC<ComponentPaletteProps> = ({ onAdd }) => {
    return (
        <div className="space-y-6">
            {COMPONENT_CATEGORIES.map((category) => (
                <div key={category.name}>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        {category.name}
                    </h4>
                    <div className="space-y-2">
                        {category.items.map((item) => (
                            <button
                                key={item.type}
                                onClick={() => onAdd(item.type)}
                                className="w-full flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group text-left"
                            >
                                <item.icon size={20} className="text-gray-400 group-hover:text-blue-500 mt-0.5" />
                                <div>
                                    <span className="block text-sm font-medium text-gray-700 group-hover:text-blue-700">
                                        {item.name}
                                    </span>
                                    <span className="block text-xs text-gray-500 mt-0.5">
                                        {item.description}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};
