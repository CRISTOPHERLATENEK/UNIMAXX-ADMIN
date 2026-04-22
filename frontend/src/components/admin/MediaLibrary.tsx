import React, { useState, useEffect, useCallback } from 'react';
import { 
    X, Upload, Grid, List, Trash2, Copy, Search, 
    Folder, Image as ImageIcon, FileText, Film, Music 
} from 'lucide-react';

interface MediaFile {
    id: number;
    filename: string;
    original_name: string;
    mime_type: string;
    size: number;
    url: string;
    alt_text?: string;
    folder: string;
    created_at: string;
}

interface MediaLibraryProps {
    onClose: () => void;
    onSelect: (files: MediaFile | MediaFile[]) => void;
    multiple?: boolean;
    accept?: string;
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({ 
    onClose, 
    onSelect, 
    multiple = false,
    accept = 'image/*' 
}) => {
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [selected, setSelected] = useState<MediaFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [currentFolder, setCurrentFolder] = useState('general');

    const folders = ['general', 'pages', 'products', 'blog', 'gallery'];

    useEffect(() => {
        fetchMedia();
    }, [currentFolder]);

    const fetchMedia = async () => {
        try {
            const res = await fetch(`/api/admin/media?folder=${currentFolder}`);
            if (res.ok) {
                const data = await res.json();
                setFiles(data);
            }
        } catch (error) {
            console.error('Erro ao carregar mídia:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        setUploading(true);
        const formData = new FormData();
        Array.from(e.target.files).forEach(file => {
            formData.append('files', file);
        });
        formData.append('folder', currentFolder);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/admin/media/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                const newFiles = await res.json();
                setFiles(prev => [...newFiles, ...prev]);
            }
        } catch (error) {
            alert('Erro no upload');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Excluir este arquivo?')) return;

        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/admin/media/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setFiles(files.filter(f => f.id !== id));
            setSelected(selected.filter(f => f.id !== id));
        } catch (error) {
            alert('Erro ao excluir');
        }
    };

    const toggleSelection = (file: MediaFile) => {
        if (multiple) {
            setSelected(prev => {
                const exists = prev.find(f => f.id === file.id);
                if (exists) {
                    return prev.filter(f => f.id !== file.id);
                }
                return [...prev, file];
            });
        } else {
            setSelected([file]);
        }
    };

    const handleSelect = () => {
        if (selected.length === 0) return;
        onSelect(multiple ? selected : selected[0]);
        onClose();
    };

    const getFileIcon = (mimeType: string) => {
        if (mimeType.startsWith('image/')) return <ImageIcon size={24} className="text-blue-500" />;
        if (mimeType.startsWith('video/')) return <Film size={24} className="text-red-500" />;
        if (mimeType.startsWith('audio/')) return <Music size={24} className="text-green-500" />;
        return <FileText size={24} className="text-gray-500" />;
    };

    const filteredFiles = files.filter(file => {
        const matchesSearch = file.original_name.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || 
            (filter === 'images' && file.mime_type.startsWith('image/')) ||
            (filter === 'videos' && file.mime_type.startsWith('video/')) ||
            (filter === 'documents' && file.mime_type.includes('pdf'));
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-5xl h-[80vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b">
                    <div>
                        <h2 className="text-xl font-bold">Biblioteca de Mídia</h2>
                        <p className="text-sm text-gray-500">
                            {selected.length} arquivo(s) selecionado(s)
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X size={24} />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap gap-4 p-4 border-b bg-gray-50">
                    <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
                        <Upload size={18} />
                        {uploading ? 'Enviando...' : 'Upload'}
                        <input 
                            type="file" 
                            multiple 
                            accept={accept} 
                            className="hidden" 
                            onChange={handleUpload}
                            disabled={uploading}
                        />
                    </label>

                    <select
                        value={currentFolder}
                        onChange={(e) => setCurrentFolder(e.target.value)}
                        className="px-4 py-2 border rounded-lg bg-white"
                    >
                        {folders.map(f => (
                            <option key={f} value={f}>
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </option>
                        ))}
                    </select>

                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar arquivos..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg"
                        />
                    </div>

                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2 border rounded-lg bg-white"
                    >
                        <option value="all">Todos</option>
                        <option value="images">Imagens</option>
                        <option value="videos">Vídeos</option>
                        <option value="documents">Documentos</option>
                    </select>

                    <div className="flex bg-white border rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-200' : ''}`}
                        >
                            <Grid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-200' : ''}`}
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            Carregando...
                        </div>
                    ) : filteredFiles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <ImageIcon size={48} className="mb-4" />
                            <p>Nenhum arquivo encontrado</p>
                            <label className="mt-2 text-blue-600 hover:underline cursor-pointer">
                                Fazer upload
                                <input type="file" className="hidden" onChange={handleUpload} multiple />
                            </label>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-4 gap-4">
                            {filteredFiles.map(file => (
                                <div
                                    key={file.id}
                                    onClick={() => toggleSelection(file)}
                                    className={`relative group border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                                        selected.find(s => s.id === file.id)
                                            ? 'border-blue-500 ring-2 ring-blue-200'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    {file.mime_type.startsWith('image/') ? (
                                        <img
                                            src={file.url}
                                            alt={file.alt_text || file.original_name}
                                            className="w-full h-40 object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-40 flex items-center justify-center bg-gray-100">
                                            {getFileIcon(file.mime_type)}
                                        </div>
                                    )}

                                    <div className="p-3">
                                        <p className="text-sm font-medium truncate">{file.original_name}</p>
                                        <p className="text-xs text-gray-500">
                                            {(file.size / 1024).toFixed(1)} KB
                                        </p>
                                    </div>

                                    {selected.find(s => s.id === file.id) && (
                                        <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center">
                                            ✓
                                        </div>
                                    )}

                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }}
                                        className="absolute top-2 left-2 p-1.5 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Arquivo</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tamanho</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Data</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredFiles.map(file => (
                                    <tr
                                        key={file.id}
                                        onClick={() => toggleSelection(file)}
                                        className={`cursor-pointer hover:bg-gray-50 ${
                                            selected.find(s => s.id === file.id) ? 'bg-blue-50' : ''
                                        }`}
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {file.mime_type.startsWith('image/') ? (
                                                    <img src={file.url} alt="" className="w-10 h-10 rounded object-cover" />
                                                ) : (
                                                    getFileIcon(file.mime_type)
                                                )}
                                                <span className="font-medium">{file.original_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {(file.size / 1024).toFixed(1)} KB
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {new Date(file.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSelect}
                        disabled={selected.length === 0}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        Selecionar {selected.length > 0 && `(${selected.length})`}
                    </button>
                </div>
            </div>
        </div>
    );
};
