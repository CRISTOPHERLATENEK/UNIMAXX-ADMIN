import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Upload, Trash2, Search, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const BASE_URL = API_URL.replace(/\/api\/?$/, '');

const authH = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

interface MediaFile {
  filename: string;
  url: string;
  size: number;
  created_at: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface MediaLibraryProps {
  open: boolean;
  onClose: () => void;
  onSelect?: (url: string) => void;
  multiple?: boolean;
}

export default function MediaLibrary({ open, onClose, onSelect }: MediaLibraryProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [preview, setPreview] = useState<MediaFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/upload`, { headers: authH() });
      const data = await res.json();
      setFiles(Array.isArray(data) ? data : []);
    } catch {
      toast({ title: 'Erro ao carregar arquivos', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchFiles();
      setSearch('');
      setPreview(null);
    }
  }, [open, fetchFiles]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(`${API_URL}/admin/upload`, {
        method: 'POST',
        headers: authH(),
        body: fd,
      });
      if (!res.ok) throw new Error('Falha no upload');
      toast({ title: '✅ Imagem enviada!' });
      await fetchFiles();
    } catch {
      toast({ title: 'Erro ao enviar imagem', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (f: MediaFile) => {
    if (!confirm(`Excluir "${f.filename}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/admin/upload/file/${encodeURIComponent(f.filename)}`, {
        method: 'DELETE',
        headers: authH(),
      });
      if (!res.ok) throw new Error('Falha ao excluir');
      toast({ title: 'Arquivo excluído.' });
      setFiles(prev => prev.filter(x => x.filename !== f.filename));
      if (preview?.filename === f.filename) setPreview(null);
    } catch {
      toast({ title: 'Erro ao excluir arquivo', variant: 'destructive' });
    }
  };

  const handleImageClick = (f: MediaFile) => {
    if (onSelect) {
      const url = f.url.startsWith('http') ? f.url : `${BASE_URL}${f.url}`;
      onSelect(url);
      onClose();
    } else {
      setPreview(f);
    }
  };

  const filtered = files.filter(f =>
    f.filename.toLowerCase().includes(search.toLowerCase())
  );

  if (!open) return null;

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 900, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.25)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ImageIcon size={18} style={{ color: '#f97316' }} />
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: "'Outfit',sans-serif" }}>Biblioteca de Mídia</h2>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>{files.length} arquivo{files.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{ height: 36, padding: '0 14px', borderRadius: 10, background: uploading ? '#fbd38d' : '#f97316', border: 'none', color: '#fff', cursor: uploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700 }}>
              {uploading ? <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={13} />}
              {uploading ? 'Enviando…' : 'Enviar'}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ''; }} />
            <button onClick={onClose}
              style={{ width: 36, height: 36, borderRadius: 10, background: '#f1f5f9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome do arquivo…"
              style={{ width: '100%', height: 38, borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', padding: '0 12px 0 34px', fontSize: 13, outline: 'none', fontFamily: 'inherit', color: '#0f172a', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
              <RefreshCw size={28} style={{ color: '#f97316', animation: 'spin 1s linear infinite' }} />
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <ImageIcon size={48} style={{ color: '#e2e8f0', margin: '0 auto 16px' }} />
              <p style={{ fontSize: 15, fontWeight: 700, color: '#64748b', margin: '0 0 8px' }}>
                {search ? 'Nenhum arquivo encontrado' : 'Nenhum arquivo enviado ainda'}
              </p>
              <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
                {search ? 'Tente outro termo de busca.' : 'Clique em "Enviar" para adicionar imagens.'}
              </p>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
              {filtered.map(f => {
                const fullUrl = f.url.startsWith('http') ? f.url : `${BASE_URL}${f.url}`;
                return (
                  <div key={f.filename}
                    style={{ borderRadius: 12, border: '2px solid #f1f5f9', overflow: 'hidden', background: '#f8fafc', cursor: 'pointer', transition: 'border-color .15s, box-shadow .15s', position: 'relative' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#f97316'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(249,115,22,.15)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#f1f5f9'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
                    onClick={() => handleImageClick(f)}>
                    {/* Thumbnail */}
                    <div style={{ height: 100, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      <img src={fullUrl} alt={f.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    </div>
                    {/* Info */}
                    <div style={{ padding: '8px 10px' }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: '#0f172a', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={f.filename}>
                        {f.filename}
                      </p>
                      <p style={{ fontSize: 10, color: '#94a3b8', margin: 0 }}>{formatBytes(f.size)}</p>
                    </div>
                    {/* Delete button */}
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(f); }}
                      style={{ position: 'absolute', top: 6, right: 6, width: 26, height: 26, borderRadius: 6, background: 'rgba(255,255,255,0.9)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', transition: 'color .15s, background .15s', opacity: 0 }}
                      className="delete-btn"
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#ef4444'; (e.currentTarget as HTMLElement).style.background = '#fff'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#94a3b8'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.9)'; }}
                      title="Excluir">
                      <Trash2 size={13} />
                    </button>
                    <style>{`.delete-btn { opacity: 0 !important; } div:hover > .delete-btn { opacity: 1 !important; }`}</style>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Full-size preview overlay */}
      {preview && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}
          onClick={() => setPreview(null)}>
          <div style={{ position: 'relative', maxWidth: '80vw', maxHeight: '80vh' }} onClick={e => e.stopPropagation()}>
            <img
              src={preview.url.startsWith('http') ? preview.url : `${BASE_URL}${preview.url}`}
              alt={preview.filename}
              style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 12, display: 'block' }} />
            <button onClick={() => setPreview(null)}
              style={{ position: 'absolute', top: -14, right: -14, width: 32, height: 32, borderRadius: '50%', background: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a', boxShadow: '0 2px 8px rgba(0,0,0,.2)' }}>
              <X size={16} />
            </button>
            <div style={{ marginTop: 12, background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>{preview.filename}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{formatBytes(preview.size)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
