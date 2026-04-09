import { useState, useCallback, useEffect } from 'react';
import type { HelpCategory, HelpArticle, HelpArticleDetail, HelpImage } from '@/types/help';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export function useHelpCenter() {
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem('token');

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/help/categories`);
      if (!res.ok) throw new Error('Erro ao buscar categorias');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch articles by category
  const fetchArticlesByCategory = useCallback(async (categorySlug: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/help/categories/${categorySlug}/articles`);
      if (!res.ok) throw new Error('Erro ao buscar artigos');
      const data = await res.json();
      setArticles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch article detail
  const fetchArticleDetail = useCallback(async (slug: string): Promise<HelpArticleDetail | null> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/help/articles/${slug}`);
      if (!res.ok) throw new Error('Erro ao buscar artigo');
      const data = await res.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Search articles
  const searchArticles = useCallback(async (query: string): Promise<HelpArticle[]> => {
    if (query.length < 2) return [];
    try {
      const res = await fetch(`${API_URL}/help/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Erro na busca');
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Erro na busca:', err);
      return [];
    }
  }, []);

  // Admin: Create category
  const createCategory = useCallback(async (category: Partial<HelpCategory>) => {
    if (!token) throw new Error('Não autenticado');
    const res = await fetch(`${API_URL}/admin/help/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(category)
    });
    if (!res.ok) throw new Error('Erro ao criar categoria');
    return res.json();
  }, [token]);

  // Admin: Update category
  const updateCategory = useCallback(async (id: number, category: Partial<HelpCategory>) => {
    if (!token) throw new Error('Não autenticado');
    const res = await fetch(`${API_URL}/admin/help/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(category)
    });
    if (!res.ok) throw new Error('Erro ao atualizar categoria');
    return res.json();
  }, [token]);

  // Admin: Delete category
  const deleteCategory = useCallback(async (id: number) => {
    if (!token) throw new Error('Não autenticado');
    const res = await fetch(`${API_URL}/admin/help/categories/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Erro ao excluir categoria');
    return res.json();
  }, [token]);

  // Admin: Create article
  const createArticle = useCallback(async (article: Partial<HelpArticle>) => {
    if (!token) throw new Error('Não autenticado');
    const res = await fetch(`${API_URL}/admin/help/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(article)
    });
    if (!res.ok) throw new Error('Erro ao criar artigo');
    return res.json();
  }, [token]);

  // Admin: Update article
  const updateArticle = useCallback(async (id: number, article: Partial<HelpArticle>) => {
    if (!token) throw new Error('Não autenticado');
    const res = await fetch(`${API_URL}/admin/help/articles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(article)
    });
    if (!res.ok) throw new Error('Erro ao atualizar artigo');
    return res.json();
  }, [token]);

  // Admin: Delete article
  const deleteArticle = useCallback(async (id: number) => {
    if (!token) throw new Error('Não autenticado');
    const res = await fetch(`${API_URL}/admin/help/articles/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Erro ao excluir artigo');
    return res.json();
  }, [token]);

  // Admin: Upload image
  const uploadImage = useCallback(async (articleId: number, file: File, altText: string = '') => {
    if (!token) throw new Error('Não autenticado');
    const formData = new FormData();
    formData.append('image', file);
    formData.append('alt_text', altText);

    const res = await fetch(`${API_URL}/admin/help/articles/${articleId}/images`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    if (!res.ok) throw new Error('Erro ao fazer upload');
    return res.json();
  }, [token]);

  // Admin: Delete image
  const deleteImage = useCallback(async (imageId: number) => {
    if (!token) throw new Error('Não autenticado');
    const res = await fetch(`${API_URL}/admin/help/images/${imageId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Erro ao excluir imagem');
    return res.json();
  }, [token]);

  // Admin: Update image
  const updateImage = useCallback(async (imageId: number, data: Partial<HelpImage>) => {
    if (!token) throw new Error('Não autenticado');
    const res = await fetch(`${API_URL}/admin/help/images/${imageId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Erro ao atualizar imagem');
    return res.json();
  }, [token]);

  // Admin: Fetch all categories
  const fetchAllCategories = useCallback(async () => {
    if (!token) throw new Error('Não autenticado');
    const res = await fetch(`${API_URL}/admin/help/categories`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Erro ao buscar categorias');
    return res.json();
  }, [token]);

  // Admin: Fetch all articles
  const fetchAllArticles = useCallback(async () => {
    if (!token) throw new Error('Não autenticado');
    const res = await fetch(`${API_URL}/admin/help/articles`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Erro ao buscar artigos');
    return res.json();
  }, [token]);

  // Admin: Fetch images for article
  const fetchArticleImages = useCallback(async (articleId: number): Promise<HelpImage[]> => {
    if (!token) throw new Error('Não autenticado');
    const res = await fetch(`${API_URL}/admin/help/articles/${articleId}/images`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Erro ao buscar imagens');
    return res.json();
  }, [token]);


  useEffect(() => {
  console.log("HelpCenter carregado");
}, []);

  return {
    // State
    categories,
    articles,
    loading,
    error,

    // Public methods
    fetchCategories,
    fetchArticlesByCategory,
    fetchArticleDetail,
    searchArticles,

    // Admin methods
    createCategory,
    updateCategory,
    deleteCategory,
    createArticle,
    updateArticle,
    deleteArticle,
    uploadImage,
    deleteImage,
    updateImage,
    fetchAllCategories,
    fetchAllArticles,
    fetchArticleImages
  };
}
