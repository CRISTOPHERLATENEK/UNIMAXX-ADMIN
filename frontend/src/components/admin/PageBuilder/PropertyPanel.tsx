import React, { useState } from 'react';
import { 
    Type, Palette, Layout, Code, Trash2, Copy, 
    ChevronUp, ChevronDown, Settings, Image as ImageIcon
} from 'lucide-react';

interface PropertyPanelProps {
    component: any;
    onChange: (updates: any) => void;
    onDelete: () => void;
    onDuplicate: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
    component, onChange, onDelete, onDuplicate, onMoveUp, onMoveDown
}) => {
    const [activeTab, setActiveTab] = useState<'content' | 'style' | 'advanced'>('content');

    const updateProps = (key: string, value: any) => {
        onChange({
            props: { ...component.props, [key]: value }
        });
    };

    const updateStyles = (key: string, value: any) => {
        onChange({
            styles: { ...component.styles, [key]: value }
        });
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold capitalize text-gray-800">{component.type}</h3>
                    <span className="text-xs text-gray-400 font-mono">{component.id.slice(-6)}</span>
                </div>

                {/* Ações rápidas */}
                <div className="flex gap-1">
                    <button onClick={onMoveUp} className="flex-1 p-1.5 hover:bg-gray-100 rounded" title="Mover para cima">
                        <ChevronUp size={16} />
                    </button>
                    <button onClick={onMoveDown} className="flex-1 p-1.5 hover:bg-gray-100 rounded" title="Mover para baixo">
                        <ChevronDown size={16} />
                    </button>
                    <button onClick={onDuplicate} className="flex-1 p-1.5 hover:bg-gray-100 rounded" title="Duplicar">
                        <Copy size={16} />
                    </button>
                    <button onClick={onDelete} className="flex-1 p-1.5 hover:bg-red-50 text-red-600 rounded" title="Excluir">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b">
                {(['content', 'style', 'advanced'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
                            activeTab === tab 
                                ? 'border-b-2 border-blue-500 text-blue-600' 
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {tab === 'content' && <Type size={16} />}
                        {tab === 'style' && <Palette size={16} />}
                        {tab === 'advanced' && <Code size={16} />}
                        {tab === 'content' ? 'Conteúdo' : tab === 'style' ? 'Estilo' : 'Avançado'}
                    </button>
                ))}
            </div>

            {/* Conteúdo */}
            <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'content' && (
                    <ContentFields 
                        type={component.type} 
                        props={component.props} 
                        onChange={updateProps}
                    />
                )}

                {activeTab === 'style' && (
                    <StyleFields 
                        styles={component.styles} 
                        onChange={updateStyles}
                    />
                )}

                {activeTab === 'advanced' && (
                    <AdvancedFields 
                        component={component}
                        onChange={onChange}
                    />
                )}
            </div>
        </div>
    );
};

const ContentFields: React.FC<{ type: string; props: any; onChange: (k: string, v: any) => void }> = ({ 
    type, props, onChange 
}) => {
    const renderField = (label: string, key: string, inputType: string = 'text', options?: any) => {
        const value = props[key] || '';

        return (
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                {inputType === 'textarea' ? (
                    <textarea
                        value={value}
                        onChange={(e) => onChange(key, e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                ) : inputType === 'select' ? (
                    <select
                        value={value}
                        onChange={(e) => onChange(key, e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    >
                        {options.map((opt: any) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                ) : inputType === 'color' ? (
                    <div className="flex gap-2">
                        <input
                            type="color"
                            value={value || '#000000'}
                            onChange={(e) => onChange(key, e.target.value)}
                            className="h-10 w-16 rounded border"
                        />
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => onChange(key, e.target.value)}
                            className="flex-1 px-3 py-2 border rounded-lg text-sm"
                        />
                    </div>
                ) : inputType === 'image' ? (
                    <div className="space-y-2">
                        {value && (
                            <img src={value} alt="" className="w-full h-32 object-cover rounded border" />
                        )}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={value}
                                onChange={(e) => onChange(key, e.target.value)}
                                placeholder="URL da imagem"
                                className="flex-1 px-3 py-2 border rounded-lg text-sm"
                            />
                            <button className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                                <ImageIcon size={16} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <input
                        type={inputType}
                        value={value}
                        onChange={(e) => onChange(key, e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                )}
            </div>
        );
    };

    switch (type) {
        case 'hero':
            return (
                <div>
                    {renderField('Título', 'title')}
                    {renderField('Subtítulo', 'subtitle', 'textarea')}
                    {renderField('Imagem de Fundo', 'backgroundImage', 'image')}
                    {renderField('Texto do Botão', 'ctaText')}
                    {renderField('Link do Botão', 'ctaLink')}
                    {renderField('Alinhamento', 'alignment', 'select', [
                        { value: 'left', label: 'Esquerda' },
                        { value: 'center', label: 'Centro' },
                        { value: 'right', label: 'Direita' }
                    ])}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Opacidade do Overlay: {Math.round((props.overlayOpacity || 0.5) * 100)}%
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={Math.round((props.overlayOpacity || 0.5) * 100)}
                            onChange={(e) => onChange('overlayOpacity', parseFloat(e.target.value) / 100)}
                            className="w-full"
                        />
                    </div>
                </div>
            );

        case 'text':
            return (
                <div>
                    {renderField('Título', 'title')}
                    {renderField('Conteúdo', 'content', 'textarea')}
                    {renderField('Alinhamento', 'alignment', 'select', [
                        { value: 'left', label: 'Esquerda' },
                        { value: 'center', label: 'Centro' },
                        { value: 'right', label: 'Direita' },
                        { value: 'justify', label: 'Justificado' }
                    ])}
                </div>
            );

        case 'features':
            return (
                <div>
                    {renderField('Título da Seção', 'title')}
                    {renderField('Subtítulo', 'subtitle')}
                    {renderField('Número de Colunas', 'columns', 'select', [
                        { value: 2, label: '2 colunas' },
                        { value: 3, label: '3 colunas' },
                        { value: 4, label: '4 colunas' }
                    ])}
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Itens</label>
                        {props.items?.map((item: any, idx: number) => (
                            <div key={idx} className="border rounded-lg p-3 mb-2 bg-gray-50">
                                <input
                                    type="text"
                                    value={item.title}
                                    onChange={(e) => {
                                        const newItems = [...props.items];
                                        newItems[idx].title = e.target.value;
                                        onChange('items', newItems);
                                    }}
                                    placeholder="Título"
                                    className="w-full px-2 py-1 mb-2 border rounded text-sm"
                                />
                                <textarea
                                    value={item.description}
                                    onChange={(e) => {
                                        const newItems = [...props.items];
                                        newItems[idx].description = e.target.value;
                                        onChange('items', newItems);
                                    }}
                                    placeholder="Descrição"
                                    rows={2}
                                    className="w-full px-2 py-1 border rounded text-sm"
                                />
                            </div>
                        ))}
                        <button
                            onClick={() => onChange('items', [...(props.items || []), { title: 'Novo Item', description: '' }])}
                            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-blue-500 hover:text-blue-600"
                        >
                            + Adicionar Item
                        </button>
                    </div>
                </div>
            );

        case 'image':
            return (
                <div>
                    {renderField('Imagem', 'src', 'image')}
                    {renderField('Texto Alternativo (SEO)', 'alt')}
                    {renderField('Legenda', 'caption')}
                    {renderField('Alinhamento', 'alignment', 'select', [
                        { value: 'left', label: 'Esquerda' },
                        { value: 'center', label: 'Centro' },
                        { value: 'right', label: 'Direita' }
                    ])}
                    {renderField('Borda Arredondada', 'borderRadius', 'select', [
                        { value: '0', label: 'Nenhuma' },
                        { value: '8px', label: 'Pequena' },
                        { value: '16px', label: 'Média' },
                        { value: '24px', label: 'Grande' }
                    ])}
                </div>
            );

        default:
            return (
                <div className="text-center text-gray-500 py-8">
                    <Settings size={32} className="mx-auto mb-2 opacity-50" />
                    <p>Editor específico não disponível para este componente</p>
                    <p className="text-xs mt-1">Use a aba "Avançado" para editar via JSON</p>
                </div>
            );
    }
};

const StyleFields: React.FC<{ styles: any; onChange: (k: string, v: any) => void }> = ({ styles, onChange }) => {
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Padding</label>
                <input
                    type="text"
                    value={styles.padding || '40px 20px'}
                    onChange={(e) => onChange('padding', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="ex: 40px 20px"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Margin</label>
                <input
                    type="text"
                    value={styles.margin || '0'}
                    onChange={(e) => onChange('margin', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="ex: 20px 0"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Cor de Fundo</label>
                <div className="flex gap-2">
                    <input
                        type="color"
                        value={styles.backgroundColor || '#ffffff'}
                        onChange={(e) => onChange('backgroundColor', e.target.value)}
                        className="h-10 w-16 rounded border"
                    />
                    <input
                        type="text"
                        value={styles.backgroundColor || ''}
                        onChange={(e) => onChange('backgroundColor', e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-lg text-sm"
                        placeholder="transparent, #fff, rgb()"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Imagem de Fundo</label>
                <input
                    type="text"
                    value={styles.backgroundImage || ''}
                    onChange={(e) => onChange('backgroundImage', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="URL da imagem"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Border Radius</label>
                <select
                    value={styles.borderRadius || '0'}
                    onChange={(e) => onChange('borderRadius', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                    <option value="0">0 (Quadrado)</option>
                    <option value="4px">4px</option>
                    <option value="8px">8px</option>
                    <option value="16px">16px</option>
                    <option value="24px">24px</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Borda</label>
                <input
                    type="text"
                    value={styles.border || 'none'}
                    onChange={(e) => onChange('border', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="1px solid #ddd"
                />
            </div>
        </div>
    );
};

const AdvancedFields: React.FC<{ component: any; onChange: (updates: any) => void }> = ({ component, onChange }) => {
    const [jsonValue, setJsonValue] = useState(JSON.stringify(component, null, 2));

    const handleJsonChange = (value: string) => {
        setJsonValue(value);
        try {
            const parsed = JSON.parse(value);
            onChange(parsed);
        } catch (e) {
            // JSON inválido, não atualiza
        }
    };

    return (
        <div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    CSS Personalizado
                </label>
                <textarea
                    value={component.styles?.customCSS || ''}
                    onChange={(e) => onChange({
                        styles: { ...component.styles, customCSS: e.target.value }
                    })}
                    rows={6}
                    className="w-full px-3 py-2 border rounded-lg text-sm font-mono text-xs"
                    placeholder=".custom-class {{ ... }}"
                />
                <p className="text-xs text-gray-500 mt-1">
                    Classes CSS serão aplicadas ao container do componente
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Dados brutos (JSON)
                </label>
                <textarea
                    value={jsonValue}
                    onChange={(e) => handleJsonChange(e.target.value)}
                    rows={10}
                    className="w-full px-3 py-2 border rounded-lg text-sm font-mono text-xs"
                />
            </div>
        </div>
    );
};
