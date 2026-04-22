import { useState, useEffect, useCallback } from 'react';

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

export const useMedia = (folder: string = 'general') => {
    const [files, setFiles] = useState<MediaFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMedia = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/media?folder=${folder}`);
            if (!res.ok) throw new Error('Erro ao carregar mídia');
            const data = await res.json();
            setFiles(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
        } finally {
            setLoading(false);
        }
    }, [folder]);

    useEffect(() => {
        fetchMedia();
    }, [fetchMedia]);

    const uploadFiles = async (filesToUpload: FileList): Promise<MediaFile[]> => {
        const formData = new FormData();
        Array.from(filesToUpload).forEach(file => {
            formData.append('files', file);
        });
        formData.append('folder', folder);

        const token = localStorage.getItem('token');
        const res = await fetch('/api/admin/media/upload', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        if (!res.ok) throw new Error('Erro no upload');

        const newFiles = await res.json();
        setFiles(prev => [...newFiles, ...prev]);
        return newFiles;
    };

    const deleteFile = async (id: number) => {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/admin/media/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error('Erro ao excluir');

        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const updateFile = async (id: number, updates: Partial<MediaFile>) => {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/admin/media/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updates)
        });

        if (!res.ok) throw new Error('Erro ao atualizar');

        setFiles(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    return {
        files,
        loading,
        error,
        refresh: fetchMedia,
        uploadFiles,
        deleteFile,
        updateFile
    };
};
