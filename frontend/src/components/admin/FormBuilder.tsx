import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, Settings, Eye } from 'lucide-react';

type FieldType = 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio';

interface FormField {
    id: string;
    name: string;
    label: string;
    type: FieldType;
    required: boolean;
    placeholder?: string;
    options?: string[];
    order: number;
}

interface FormBuilderProps {
    initialFields?: FormField[];
    onSave: (fields: FormField[]) => void;
}

export const FormBuilder: React.FC<FormBuilderProps> = ({ 
    initialFields = [],
    onSave 
}) => {
    const [fields, setFields] = useState<FormField[]>(initialFields);
    const [previewMode, setPreviewMode] = useState(false);

    const addField = (type: FieldType) => {
        const newField: FormField = {
            id: `field-${Date.now()}`,
            name: `campo_${fields.length + 1}`,
            label: 'Novo Campo',
            type,
            required: false,
            order: fields.length
        };
        setFields([...fields, newField]);
    };

    const updateField = (id: string, updates: Partial<FormField>) => {
        setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const removeField = (id: string) => {
        setFields(fields.filter(f => f.id !== id));
    };

    const moveField = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index > 0) {
            const newFields = [...fields];
            [newFields[index], newFields[index - 1]] = [newFields[index - 1], newFields[index]];
            setFields(newFields);
        } else if (direction === 'down' && index < fields.length - 1) {
            const newFields = [...fields];
            [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
            setFields(newFields);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold">Construtor de Formulários</h3>
                    <p className="text-sm text-gray-500">Arraste os campos para reordenar</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPreviewMode(!previewMode)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                            previewMode ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                    >
                        <Eye size={18} />
                        {previewMode ? 'Editar' : 'Preview'}
                    </button>
                    <button
                        onClick={() => onSave(fields)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Salvar Formulário
                    </button>
                </div>
            </div>

            {previewMode ? (
                <div className="p-6 max-w-lg mx-auto">
                    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                        {fields.map((field) => (
                            <div key={field.id}>
                                <label className="block font-medium text-gray-800 mb-1">
                                    {field.label}
                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                </label>
                                {field.type === 'textarea' ? (
                                    <textarea
                                        className="w-full px-4 py-2 border rounded-lg"
                                        placeholder={field.placeholder}
                                        rows={4}
                                    />
                                ) : field.type === 'select' ? (
                                    <select className="w-full px-4 py-2 border rounded-lg">
                                        <option value="">Selecione...</option>
                                        {field.options?.map((opt, i) => (
                                            <option key={i} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type={field.type}
                                        className="w-full px-4 py-2 border rounded-lg"
                                        placeholder={field.placeholder}
                                    />
                                )}
                            </div>
                        ))}
                        {fields.length > 0 && (
                            <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium">
                                Enviar
                            </button>
                        )}
                    </form>
                </div>
            ) : (
                <div className="flex">
                    {/* Sidebar de tipos */}
                    <div className="w-64 p-6 border-r bg-gray-50">
                        <h4 className="font-medium mb-4">Adicionar Campo</h4>
                        <div className="space-y-2">
                            {[
                                { type: 'text', label: 'Texto' },
                                { type: 'email', label: 'Email' },
                                { type: 'tel', label: 'Telefone' },
                                { type: 'textarea', label: 'Texto Longo' },
                                { type: 'select', label: 'Seleção' },
                                { type: 'checkbox', label: 'Checkbox' },
                            ].map((item) => (
                                <button
                                    key={item.type}
                                    onClick={() => addField(item.type as FieldType)}
                                    className="w-full text-left px-4 py-2 bg-white border rounded-lg hover:border-blue-500 hover:text-blue-600"
                                >
                                    + {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Lista de campos */}
                    <div className="flex-1 p-6">
                        {fields.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                <p>Nenhum campo adicionado</p>
                                <p className="text-sm">Selecione um tipo de campo à esquerda</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex items-start gap-3 p-4 border rounded-lg bg-white">
                                        <div className="mt-2 text-gray-400">
                                            <GripVertical size={18} />
                                        </div>

                                        <div className="flex-1 grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Label</label>
                                                <input
                                                    type="text"
                                                    value={field.label}
                                                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                                                    className="w-full px-3 py-1.5 border rounded"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Nome (ID)</label>
                                                <input
                                                    type="text"
                                                    value={field.name}
                                                    onChange={(e) => updateField(field.id, { name: e.target.value })}
                                                    className="w-full px-3 py-1.5 border rounded"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Tipo</label>
                                                <select
                                                    value={field.type}
                                                    onChange={(e) => updateField(field.id, { type: e.target.value as FieldType })}
                                                    className="w-full px-3 py-1.5 border rounded"
                                                >
                                                    <option value="text">Texto</option>
                                                    <option value="email">Email</option>
                                                    <option value="tel">Telefone</option>
                                                    <option value="textarea">Texto Longo</option>
                                                    <option value="select">Seleção</option>
                                                    <option value="checkbox">Checkbox</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Placeholder</label>
                                                <input
                                                    type="text"
                                                    value={field.placeholder || ''}
                                                    onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                                                    className="w-full px-3 py-1.5 border rounded"
                                                />
                                            </div>
                                            {(field.type === 'select' || field.type === 'radio') && (
                                                <div className="col-span-2">
                                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                                        Opções (separadas por vírgula)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={field.options?.join(', ') || ''}
                                                        onChange={(e) => updateField(field.id, { options: e.target.value.split(',').map(s => s.trim()) })}
                                                        className="w-full px-3 py-1.5 border rounded"
                                                        placeholder="Opção 1, Opção 2, Opção 3"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <button
                                                onClick={() => moveField(index, 'up')}
                                                disabled={index === 0}
                                                className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                                            >
                                                ↑
                                            </button>
                                            <button
                                                onClick={() => moveField(index, 'down')}
                                                disabled={index === fields.length - 1}
                                                className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                                            >
                                                ↓
                                            </button>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="flex items-center gap-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={field.required}
                                                    onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                                    className="rounded"
                                                />
                                                Obrigatório
                                            </label>
                                            <button
                                                onClick={() => removeField(field.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
