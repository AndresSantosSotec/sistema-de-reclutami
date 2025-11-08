import { useState, useCallback } from 'react';
import { galleryService, Category, GalleryPost } from '../lib/galleryService';

interface UseGalleryReturn {
  categories: Category[];
  posts: GalleryPost[];
  currentPost: GalleryPost | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  } | null;
  
  // Categories
  loadCategories: () => Promise<void>;
  createCategory: (data: any) => Promise<Category>;
  updateCategory: (id: number, data: any) => Promise<Category>;
  deleteCategory: (id: number) => Promise<void>;
  
  // Posts
  loadPosts: (params?: any) => Promise<void>;
  loadPost: (id: number) => Promise<void>;
  createPost: (data: any) => Promise<GalleryPost>;
  updatePost: (id: number, data: any) => Promise<GalleryPost>;
  deletePost: (id: number) => Promise<void>;
  
  clearError: () => void;
}

export function useGallery(): UseGalleryReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [posts, setPosts] = useState<GalleryPost[]>([]);
  const [currentPost, setCurrentPost] = useState<GalleryPost | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  // ===== CATEGORIES =====
  
  const loadCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await galleryService.getCategories();
      setCategories(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (data: any) => {
    try {
      setIsLoading(true);
      setError(null);
      const newCategory = await galleryService.createCategory(data);
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateCategory = useCallback(async (id: number, data: any) => {
    try {
      setIsLoading(true);
      setError(null);
      const updated = await galleryService.updateCategory(id, data);
      setCategories(prev => prev.map(cat => cat.id === id ? updated : cat));
      return updated;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteCategory = useCallback(async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      await galleryService.deleteCategory(id);
      setCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ===== POSTS =====

  const loadPosts = useCallback(async (params?: any) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await galleryService.getPosts(params);
      if (response) {
        setPosts(response.data);
        setPagination({
          currentPage: response.current_page,
          lastPage: response.last_page,
          perPage: response.per_page,
          total: response.total,
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadPost = useCallback(async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const post = await galleryService.getPost(id);
      setCurrentPost(post);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createPost = useCallback(async (data: any) => {
    try {
      setIsLoading(true);
      setError(null);
      const newPost = await galleryService.createPost(data);
      setPosts(prev => [newPost, ...prev]);
      return newPost;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePost = useCallback(async (id: number, data: any) => {
    try {
      setIsLoading(true);
      setError(null);
      const updated = await galleryService.updatePost(id, data);
      setPosts(prev => prev.map(post => post.id === id ? updated : post));
      if (currentPost?.id === id) {
        setCurrentPost(updated);
      }
      return updated;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentPost]);

  const deletePost = useCallback(async (id: number) => {
    try {
      setIsLoading(true);
      setError(null);
      await galleryService.deletePost(id);
      setPosts(prev => prev.filter(post => post.id !== id));
      if (currentPost?.id === id) {
        setCurrentPost(null);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentPost]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    categories,
    posts,
    currentPost,
    isLoading,
    error,
    pagination,
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    loadPosts,
    loadPost,
    createPost,
    updatePost,
    deletePost,
    clearError,
  };
}
