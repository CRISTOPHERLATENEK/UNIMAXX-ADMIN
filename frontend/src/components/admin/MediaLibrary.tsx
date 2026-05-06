import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    X, Upload, Grid, List, Trash2, Search,
    Image as ImageIcon, FileText, Film, Music, Tag, Crop,
    Check, ZoomIn, Download, Copy, RefreshCw, FolderOpen, Plus,
    ChevronLeft, ChevronRight, AlertCircle
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
    tags?: string[];
    created_at: string;
}

interface MediaLibraryProps {
    onClose: () => void;
    onSelect: (files: MediaFile | MediaFile[] | string) => void;
    multiple?: boolean;
    accept?: string;
}

// ─── Crop Modal ───────────────────────────────────────────────────────────────
const CropModal: React.FC<{ file: MediaFile; onClose: () => void; onDone: (croppedUrl: string) => void }> = ({ file, onClose, onDone }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [cropBox, setCropBox] = useState({ x: 50, y: 50, w: 200, h: 150 });
    const [dragging, setDragging] = useState<null | 'move' | 'resize'>(null);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0, ox: 0, oy: 0, ow: 0, oh: 0 });
    const [imgNaturalSize, setImgNaturalSize] = useState({ w: 1, h: 1 });
    const [imgDisplaySize, setImgDisplaySize] = useState({ w: 1, h: 1 });

    const onImgLoad = () => {
        const img = imgRef.current;
        if (!img) return;
        setImgNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
        setImgDisplaySize({ w: img.width, h: img.height });
        setCropBox({ x: 20, y: 20, w: img.width - 40, h: img.height - 40 });
    };

    const handleMouseDown = (e: React.MouseEvent, mode: 'move' | 'resize') => {
        e.preventDefault();
        setDragging(mode);
        setDragStart({ x: e.clientX, y: e.clientY, ox: cropBox.x, oy: cropBox.y, ow: cropBox.w, oh: cropBox.h });
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!dragging) return;
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        const maxW = imgDisplaySize.w;
        const maxH = imgDisplaySize.h;

        if (dragging === 'move') {
            setCropBox(prev => ({
                ...prev,
                x: Math.max(0, Math.min(maxW - prev.w, dragStart.ox + dx)),
                y: Math.max(0, Math.min(maxH - prev.h, dragStart.oy + dy)),
            }));
        } else {
            setCropBox(prev => ({
                ...prev,
                w: Math.max(40, Math.min(maxW - prev.x, dragStart.ow + dx)),
                h: Math.max(40, Math.min(maxH - prev.y, dragStart.oh + dy)),
            }));
        }
    }, [dragging, dragStart, imgDisplaySize]);

    const handleMouseUp = useCallback(() => setDragging(null), []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
    }, [handleMouseMove, handleMouseUp]);

    const applyCrop = () => {
        const img = imgRef.current;
        const canvas = canvasRef.current;
        if (!img || !canvas) return;

        const scaleX = imgNaturalSize.w / imgDisplaySize.w;
        const scaleY = imgNaturalSize.h / imgDisplaySize.h;

        canvas.width = cropBox.w * scaleX;
        canvas.height = cropBox.h * scaleY;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, cropBox.x * scaleX, cropBox.y * scaleY, cropBox.w * scaleX, cropBox.h * scaleY, 0, 0, canvas.width, canvas.height);
        const croppedUrl = canvas.toDataURL('image/jpeg', 0.92);
        onDone(croppedUrl);
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <div>
                        <h3 className="font-bold text-slate-800">Recortar Imagem</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Arraste para mover • Redimensione pelo canto inferior direito</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
                </div>
                <div className="p-6">
                    <div ref={containerRef} className="relative inline-block select-none border border-slate-200 rounded-xl overflow-hidden bg-slate-100">
                        <img
                            ref={imgRef}
                            src={file.url}
                            alt={file.original_name}
                            onLoad={onImgLoad}
                            className="max-w-full max-h-[400px] block"
                            crossOrigin="anonymous"
                        />
                        {/* Darkened overlay outside crop */}
                        <div className="absolute inset-0 pointer-events-none" style={{
                            background: `radial-gradient(transparent ${cropBox.x}px, rgba(0,0,0,0) 0)`,
                            boxShadow: `inset ${cropBox.x}px ${cropBox.y}px 0 rgba(0,0,0,0.5), inset -${imgDisplaySize.w - cropBox.x - cropBox.w}px -${imgDisplaySize.h - cropBox.y - cropBox.h}px 0 rgba(0,0,0,0.5)`,
                        }} />
                        {/* Crop box */}
                        <div
                            style={{ position: 'absolute', left: cropBox.x, top: cropBox.y, width: cropBox.w, height: cropBox.h, border: '2px solid #3b82f6', boxSizing: 'border-box', cursor: 'move' }}
                            onMouseDown={(e) => handleMouseDown(e, 'move')}
                        >
                            {/* Rule of thirds lines */}
                            <div style={{ position: 'absolute', left: '33%', top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.4)', pointerEvents: 'none' }} />
                            <div style={{ position: 'absolute', left: '66%', top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.4)', pointerEvents: 'none' }} />
                            <div style={{ position: 'absolute', top: '33%', left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.4)', pointerEvents: 'none' }} />
                            <div style={{ position: 'absolute', top: '66%', left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.4)', pointerEvents: 'none' }} />
                            {/* Corner handles */}
                            {[{ style: { top: -4, left: -4 } }, { style: { top: -4, right: -4 } }, { style: { bottom: -4, left: -4 } }].map((h, i) => (
                                <div key={i} style={{ ...h.style, position: 'absolute', width: 8, height: 8, background: '#3b82f6', borderRadius: 2, pointerEvents: 'none' }} />
                            ))}
                            {/* Resize handle bottom-right */}
                            <div
                                style={{ position: 'absolute', bottom: -5, right: -5, width: 12, height: 12, background: '#3b82f6', borderRadius: 3, cursor: 'se-resize' }}
                                onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'resize'); }}
                            />
                        </div>
                    </div>
                    <div className="mt-3 text-xs text-slate-400">
                        Recorte: {Math.round(cropBox.w)} × {Math.round(cropBox.h)}px
                    </div>
                </div>
                <div className="flex justify-end gap-3 px-6 py-4 border-t bg-slate-50">
                    <button onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-white">Cancelar</button>
                    <button onClick={applyCrop} className="px-6 py-2 text-sm bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2">
                        <Check size={16} />Aplicar Recorte
                    </button>
                </div>
                <canvas ref={canvasRef} className="hidden" />
            </div>
        </div>
    );
};

// ─── Main MediaLibrary ────────────────────────────────────────────────────────

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
export const MediaLibrary: React.FC<MediaLibraryProps> = ({
    onClose, onSelect, multiple = false, accept = 'image/*'
}) => {
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [selected, setSelected] = useState<MediaFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [currentFolder, setCurrentFolder] = useState('general');
    const [activeTag, setActiveTag] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [cropTarget, setCropTarget] = useState<MediaFile | null>(null);
    const [previewFile, setPreviewFile] = useState<MediaFile | null>(null);
    const [tagInput, setTagInput] = useState('');
    const [editingTagsFor, setEditingTagsFor] = useState<number | null>(null);
    const [newFolderName, setNewFolderName] = useState('');
    const [showNewFolder, setShowNewFolder] = useState(false);
    const [folders, setFolders] = useState(['general', 'pages', 'products', 'blog', 'gallery']);
    const dropZoneRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { fetchMedia(); }, [currentFolder]);

    const fetchMedia = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/admin/upload/list?folder=${currentFolder}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (res.ok) {
                const data = await res.json();
                // Normalize tags field
                setFiles(data.map((f: any) => ({ ...f, tags: f.tags || [] })));
            }
        } catch (error) {
            console.error('Erro ao carregar mídia:', error);
        } finally {
            setLoading(false);
        }
    };

    const doUpload = async (fileList: FileList) => {
        if (!fileList.length) return;
        setUploading(true);
        setUploadProgress(0);

        // Simulate progress (real XHR progress would require XMLHttpRequest)
        const progressInterval = setInterval(() => {
            setUploadProgress(p => Math.min(p + 12, 85));
        }, 150);

        const formData = new FormData();
        Array.from(fileList).forEach(file => formData.append('files', file));
        formData.append('folder', currentFolder);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/admin/upload`, {
                method: 'POST',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                body: formData
            });
            if (res.ok) {
                const newFiles = await res.json();
                setFiles(prev => [...newFiles.map((f: any) => ({ ...f, tags: f.tags || [] })), ...prev]);
                setUploadProgress(100);
            }
        } catch (error) {
            alert('Erro no upload');
        } finally {
            clearInterval(progressInterval);
            setTimeout(() => { setUploading(false); setUploadProgress(0); }, 800);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) doUpload(e.target.files);
        e.target.value = '';
    };

    // Drag-and-drop into the library
    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
    const handleDragLeave = (e: React.DragEvent) => {
        if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) setIsDragOver(false);
    };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files.length) doUpload(e.dataTransfer.files);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Excluir este arquivo?')) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/admin/upload/${id}`, {
                method: 'DELETE',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            setFiles(files.filter(f => f.id !== id));
            setSelected(selected.filter(f => f.id !== id));
        } catch { alert('Erro ao excluir'); }
    };

    const addTag = async (fileId: number, tag: string) => {
        const trimmed = tag.trim().toLowerCase();
        if (!trimmed) return;
        setFiles(prev => prev.map(f => {
            if (f.id !== fileId) return f;
            const tags = Array.from(new Set([...(f.tags || []), trimmed]));
            return { ...f, tags };
        }));
        setTagInput('');
        // Persist to server (best-effort)
        try {
            const token = localStorage.getItem('token');
            const file = files.find(f => f.id === fileId);
            if (!file) return;
            const newTags = Array.from(new Set([...(file.tags || []), trimmed]));
            await fetch(`${API_URL}/admin/upload/${fileId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
                body: JSON.stringify({ tags: newTags })
            });
        } catch { /* silent */ }
    };

    const removeTag = async (fileId: number, tag: string) => {
        setFiles(prev => prev.map(f => f.id !== fileId ? f : { ...f, tags: (f.tags || []).filter(t => t !== tag) }));
        try {
            const token = localStorage.getItem('token');
            const file = files.find(f => f.id === fileId);
            if (!file) return;
            const newTags = (file.tags || []).filter(t => t !== tag);
            await fetch(`${API_URL}/admin/upload/${fileId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
                body: JSON.stringify({ tags: newTags })
            });
        } catch { /* silent */ }
    };

    const allTags = Array.from(new Set(files.flatMap(f => f.tags || []))).sort();

    const toggleSelection = (file: MediaFile) => {
        if (multiple) {
            setSelected(prev => prev.find(f => f.id === file.id) ? prev.filter(f => f.id !== file.id) : [...prev, file]);
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

    const formatSize = (bytes: number) => bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

    const filteredFiles = files.filter(file => {
        const matchesSearch = file.original_name.toLowerCase().includes(search.toLowerCase()) ||
            (file.tags || []).some(t => t.includes(search.toLowerCase()));
        const matchesFilter = filter === 'all' ||
            (filter === 'images' && file.mime_type.startsWith('image/')) ||
            (filter === 'videos' && file.mime_type.startsWith('video/')) ||
            (filter === 'documents' && file.mime_type.includes('pdf'));
        const matchesTag = !activeTag || (file.tags || []).includes(activeTag);
        return matchesSearch && matchesFilter && matchesTag;
    });

    // Lightbox navigation
    const previewIndex = previewFile ? filteredFiles.findIndex(f => f.id === previewFile.id) : -1;
    const prevPreview = () => { if (previewIndex > 0) setPreviewFile(filteredFiles[previewIndex - 1]); };
    const nextPreview = () => { if (previewIndex < filteredFiles.length - 1) setPreviewFile(filteredFiles[previewIndex + 1]); };

    const createFolder = () => {
        const name = newFolderName.trim().toLowerCase().replace(/\s+/g, '-');
        if (!name || folders.includes(name)) return;
        setFolders(prev => [...prev, name]);
        setCurrentFolder(name);
        setNewFolderName('');
        setShowNewFolder(false);
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl w-full max-w-6xl h-[88vh] flex flex-col shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="flex justify-between items-center px-6 py-4 border-b bg-white">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                                <ImageIcon size={18} />
                            </div>
                            <div>
                                <h2 className="text-lg font-extrabold text-slate-800">Biblioteca de Mídia</h2>
                                <p className="text-xs text-slate-400">{files.length} arquivo{files.length !== 1 ? 's' : ''} · {selected.length} selecionado{selected.length !== 1 ? 's' : ''}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"><X size={22} /></button>
                    </div>

                    <div className="flex flex-1 overflow-hidden">
                        {/* Left Sidebar: Folders + Tags */}
                        <div className="w-52 border-r flex-shrink-0 flex flex-col bg-slate-50/50 overflow-y-auto">
                            {/* Folders */}
                            <div className="p-4 border-b">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pastas</span>
                                    <button onClick={() => setShowNewFolder(!showNewFolder)} className="p-0.5 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600 transition-colors">
                                        <Plus size={14} />
                                    </button>
                                </div>
                                {showNewFolder && (
                                    <div className="flex gap-1 mb-2">
                                        <input
                                            autoFocus
                                            value={newFolderName}
                                            onChange={e => setNewFolderName(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter') createFolder(); if (e.key === 'Escape') setShowNewFolder(false); }}
                                            placeholder="nova-pasta"
                                            className="flex-1 text-xs px-2 py-1 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                        <button onClick={createFolder} className="p-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><Check size={12} /></button>
                                    </div>
                                )}
                                <div className="space-y-0.5">
                                    {folders.map(f => (
                                        <button key={f} onClick={() => setCurrentFolder(f)}
                                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${currentFolder === f ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`}>
                                            <FolderOpen size={13} />
                                            <span className="truncate capitalize">{f}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {/* Tags */}
                            {allTags.length > 0 && (
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tags</span>
                                        {activeTag && (
                                            <button onClick={() => setActiveTag(null)} className="text-[10px] text-blue-600 hover:underline">Limpar</button>
                                        )}
                                    </div>
                                    <div className="space-y-0.5">
                                        {allTags.map(tag => (
                                            <button key={tag} onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                                                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTag === tag ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-200'}`}>
                                                <Tag size={11} />
                                                <span className="truncate">#{tag}</span>
                                                <span className="ml-auto text-[10px] opacity-60">{files.filter(f => (f.tags || []).includes(tag)).length}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 flex flex-col overflow-hidden">
                            {/* Toolbar */}
                            <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b bg-white">
                                {/* Upload button */}
                                <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl cursor-pointer hover:bg-blue-700 text-sm font-bold shadow-sm shadow-blue-200 transition-all active:scale-95">
                                    <Upload size={15} />
                                    {uploading ? `Enviando ${uploadProgress}%` : 'Upload'}
                                    <input ref={fileInputRef} type="file" multiple accept={accept} className="hidden" onChange={handleFileInputChange} disabled={uploading} />
                                </label>

                                {/* Search */}
                                <div className="flex-1 relative min-w-48">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                                    <input
                                        type="text"
                                        placeholder="Buscar por nome ou tag..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>

                                {/* Filter */}
                                <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-xl bg-white text-sm outline-none">
                                    <option value="all">Todos</option>
                                    <option value="images">Imagens</option>
                                    <option value="videos">Vídeos</option>
                                    <option value="documents">Documentos</option>
                                </select>

                                {/* View Toggle */}
                                <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                                    <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}><Grid size={16} /></button>
                                    <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}><List size={16} /></button>
                                </div>

                                <button onClick={fetchMedia} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors" title="Recarregar">
                                    <RefreshCw size={16} />
                                </button>
                            </div>

                            {/* Upload progress bar */}
                            {uploading && (
                                <div className="px-4 pt-2">
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                                    </div>
                                </div>
                            )}

                            {/* Active tag indicator */}
                            {activeTag && (
                                <div className="px-4 py-2 bg-blue-50 border-b flex items-center gap-2 text-sm text-blue-700">
                                    <Tag size={14} />
                                    Filtrando por: <strong>#{activeTag}</strong>
                                    <button onClick={() => setActiveTag(null)} className="ml-auto text-blue-400 hover:text-blue-600"><X size={14} /></button>
                                </div>
                            )}

                            {/* Drop zone + file grid/list */}
                            <div
                                ref={dropZoneRef}
                                className={`flex-1 overflow-y-auto p-4 transition-all ${isDragOver ? 'bg-blue-50 ring-4 ring-blue-400 ring-inset' : ''}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                {isDragOver && (
                                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                                        <div className="bg-white rounded-2xl px-10 py-8 shadow-2xl text-center border-2 border-blue-400">
                                            <Upload size={40} className="text-blue-500 mx-auto mb-3" />
                                            <p className="font-bold text-blue-700 text-lg">Soltar para fazer upload</p>
                                            <p className="text-sm text-blue-400 mt-1">Pasta: {currentFolder}</p>
                                        </div>
                                    </div>
                                )}

                                {loading ? (
                                    <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-3">
                                        <RefreshCw size={28} className="animate-spin opacity-40" />
                                        <span className="text-sm">Carregando...</span>
                                    </div>
                                ) : filteredFiles.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-3">
                                        <ImageIcon size={40} className="opacity-20" />
                                        <p className="text-sm font-medium">Nenhum arquivo encontrado</p>
                                        <p className="text-xs text-slate-300">Arraste arquivos aqui ou clique em Upload</p>
                                    </div>
                                ) : viewMode === 'grid' ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                        {filteredFiles.map(file => (
                                            <div key={file.id}
                                                onClick={() => toggleSelection(file)}
                                                className={`relative group border-2 rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-md ${selected.find(s => s.id === file.id)
                                                        ? 'border-blue-500 ring-2 ring-blue-200 shadow-md'
                                                        : 'border-transparent hover:border-slate-200'
                                                    }`}
                                            >
                                                {file.mime_type.startsWith('image/') ? (
                                                    <img src={file.url} alt={file.alt_text || file.original_name} className="w-full h-32 object-cover bg-slate-100" />
                                                ) : (
                                                    <div className="w-full h-32 flex items-center justify-center bg-slate-100">{getFileIcon(file.mime_type)}</div>
                                                )}

                                                {/* Hover overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="absolute bottom-0 inset-x-0 p-2 flex gap-1 justify-end">
                                                        {file.mime_type.startsWith('image/') && (
                                                            <button onClick={e => { e.stopPropagation(); setCropTarget(file); }} className="p-1.5 bg-white/90 rounded-lg hover:bg-white text-slate-700 transition-colors" title="Recortar"><Crop size={13} /></button>
                                                        )}
                                                        <button onClick={e => { e.stopPropagation(); setPreviewFile(file); }} className="p-1.5 bg-white/90 rounded-lg hover:bg-white text-slate-700 transition-colors" title="Visualizar"><ZoomIn size={13} /></button>
                                                        <button onClick={e => { e.stopPropagation(); handleDelete(file.id); }} className="p-1.5 bg-white/90 rounded-lg hover:bg-red-100 text-red-600 transition-colors" title="Excluir"><Trash2 size={13} /></button>
                                                    </div>
                                                </div>

                                                {/* Selection badge */}
                                                {selected.find(s => s.id === file.id) && (
                                                    <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg">
                                                        <Check size={12} />
                                                    </div>
                                                )}

                                                <div className="p-2 bg-white">
                                                    <p className="text-xs font-semibold truncate text-slate-700">{file.original_name}</p>
                                                    <div className="flex items-center justify-between mt-0.5">
                                                        <p className="text-[10px] text-slate-400">{formatSize(file.size)}</p>
                                                    </div>
                                                    {/* Tags */}
                                                    {(file.tags || []).length > 0 && (
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {(file.tags || []).slice(0, 2).map(tag => (
                                                                <span key={tag} className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">#{tag}</span>
                                                            ))}
                                                            {(file.tags || []).length > 2 && <span className="text-[9px] text-slate-400">+{(file.tags || []).length - 2}</span>}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Tag edit button */}
                                                <button
                                                    onClick={e => { e.stopPropagation(); setEditingTagsFor(editingTagsFor === file.id ? null : file.id); }}
                                                    className="absolute top-2 left-2 p-1.5 bg-white/90 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-blue-600"
                                                    title="Gerenciar tags"
                                                >
                                                    <Tag size={12} />
                                                </button>

                                                {/* Tag editor popup */}
                                                {editingTagsFor === file.id && (
                                                    <div className="absolute inset-0 bg-white rounded-xl p-3 z-10" onClick={e => e.stopPropagation()}>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-xs font-bold text-slate-700">Tags</span>
                                                            <button onClick={() => setEditingTagsFor(null)} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
                                                        </div>
                                                        <div className="flex flex-wrap gap-1 mb-2">
                                                            {(file.tags || []).map(tag => (
                                                                <span key={tag} className="flex items-center gap-1 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                                                    #{tag}
                                                                    <button onClick={() => removeTag(file.id, tag)} className="hover:text-red-600"><X size={9} /></button>
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <input
                                                                autoFocus
                                                                value={tagInput}
                                                                onChange={e => setTagInput(e.target.value)}
                                                                onKeyDown={e => { if (e.key === 'Enter') { addTag(file.id, tagInput); } }}
                                                                placeholder="nova tag..."
                                                                className="flex-1 text-[10px] px-2 py-1 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
                                                            />
                                                            <button onClick={() => addTag(file.id, tagInput)} className="px-2 py-1 bg-blue-600 text-white rounded-lg text-[10px]">+</button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    /* List View */
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="px-3 py-2 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Arquivo</th>
                                                <th className="px-3 py-2 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tags</th>
                                                <th className="px-3 py-2 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tamanho</th>
                                                <th className="px-3 py-2 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Data</th>
                                                <th className="px-3 py-2"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {filteredFiles.map(file => (
                                                <tr key={file.id} onClick={() => toggleSelection(file)} className={`cursor-pointer hover:bg-slate-50 transition-colors ${selected.find(s => s.id === file.id) ? 'bg-blue-50' : ''}`}>
                                                    <td className="px-3 py-2.5">
                                                        <div className="flex items-center gap-3">
                                                            {file.mime_type.startsWith('image/') ? (
                                                                <img src={file.url} alt="" className="w-10 h-10 rounded-lg object-cover border border-slate-100" />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">{getFileIcon(file.mime_type)}</div>
                                                            )}
                                                            <div>
                                                                <span className="text-sm font-medium text-slate-800">{file.original_name}</span>
                                                                {selected.find(s => s.id === file.id) && <span className="ml-2 text-[10px] text-blue-600 font-bold">✓ Selecionado</span>}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2.5">
                                                        <div className="flex flex-wrap gap-1">
                                                            {(file.tags || []).map(tag => (
                                                                <span key={tag} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">#{tag}</span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-2.5 text-sm text-slate-500">{formatSize(file.size)}</td>
                                                    <td className="px-3 py-2.5 text-sm text-slate-500">{new Date(file.created_at).toLocaleDateString('pt-BR')}</td>
                                                    <td className="px-3 py-2.5">
                                                        <div className="flex items-center gap-1">
                                                            {file.mime_type.startsWith('image/') && (
                                                                <button onClick={e => { e.stopPropagation(); setCropTarget(file); }} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors" title="Recortar"><Crop size={15} /></button>
                                                            )}
                                                            <button onClick={e => { e.stopPropagation(); setPreviewFile(file); }} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors" title="Visualizar"><ZoomIn size={15} /></button>
                                                            <button onClick={e => { e.stopPropagation(); handleDelete(file.id); }} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors" title="Excluir"><Trash2 size={15} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t bg-white flex items-center justify-between">
                        <div className="text-sm text-slate-400">
                            {filteredFiles.length} de {files.length} arquivo{files.length !== 1 ? 's' : ''}
                            {activeTag && ` · #${activeTag}`}
                        </div>
                        <div className="flex gap-3">
                            <button onClick={onClose} className="px-5 py-2 border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">Cancelar</button>
                            <button onClick={handleSelect} disabled={selected.length === 0}
                                className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm shadow-blue-200">
                                {selected.length > 0 ? `Usar ${selected.length} arquivo${selected.length !== 1 ? 's' : ''}` : 'Selecionar'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Crop Modal */}
            {cropTarget && (
                <CropModal
                    file={cropTarget}
                    onClose={() => setCropTarget(null)}
                    onDone={(croppedUrl) => {
                        // Return cropped image as a data URL for immediate use
                        onSelect(croppedUrl as any);
                        setCropTarget(null);
                        onClose();
                    }}
                />
            )}

            {/* Lightbox Preview */}
            {previewFile && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60]" onClick={() => setPreviewFile(null)}>
                    <button onClick={e => { e.stopPropagation(); prevPreview(); }} disabled={previewIndex === 0}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white disabled:opacity-20 transition-all">
                        <ChevronLeft size={24} />
                    </button>
                    <div className="max-w-4xl max-h-[80vh] flex flex-col items-center gap-4" onClick={e => e.stopPropagation()}>
                        {previewFile.mime_type.startsWith('image/') ? (
                            <img src={previewFile.url} alt={previewFile.original_name} className="max-h-[65vh] max-w-full object-contain rounded-xl shadow-2xl" />
                        ) : (
                            <div className="w-48 h-48 bg-white/10 rounded-2xl flex items-center justify-center">{getFileIcon(previewFile.mime_type)}</div>
                        )}
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 text-white text-center">
                            <p className="font-bold">{previewFile.original_name}</p>
                            <p className="text-sm text-white/60 mt-1">{formatSize(previewFile.size)} · {new Date(previewFile.created_at).toLocaleDateString('pt-BR')}</p>
                            {(previewFile.tags || []).length > 0 && (
                                <div className="flex gap-2 justify-center mt-2">
                                    {(previewFile.tags || []).map(t => <span key={t} className="text-xs bg-white/20 px-2 py-0.5 rounded-full">#{t}</span>)}
                                </div>
                            )}
                            <div className="flex gap-3 justify-center mt-4">
                                {previewFile.mime_type.startsWith('image/') && (
                                    <button onClick={() => { setCropTarget(previewFile); setPreviewFile(null); }} className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm transition-colors">
                                        <Crop size={15} /> Recortar
                                    </button>
                                )}
                                <button onClick={() => { toggleSelection(previewFile); setPreviewFile(null); }}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-bold transition-colors">
                                    <Check size={15} /> Selecionar
                                </button>
                            </div>
                        </div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); nextPreview(); }} disabled={previewIndex === filteredFiles.length - 1}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white disabled:opacity-20 transition-all">
                        <ChevronRight size={24} />
                    </button>
                    <button onClick={() => setPreviewFile(null)} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"><X size={20} /></button>
                </div>
            )}
        </>
    );
};