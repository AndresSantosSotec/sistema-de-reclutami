import api from './api';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  order: number;
  is_active: boolean;
  gallery_posts?: GalleryPost[];
  created_at: string;
  updated_at: string;
}

export interface GalleryPost {
  id: number;
  category_id: number;
  created_by: number;
  title: string;
  description: string;
  media_type?: 'image' | 'video';
  image_path: string;
  image_thumbnail?: string;
  image_medium?: string;
  image_width?: number;
  image_height?: number;
  video_path?: string;
  video_thumbnail?: string;
  video_duration?: number;
  file_size?: number;
  views_count: number;
  is_published: boolean;
  published_at?: string;
  category?: Category;
  creator?: any;
  image_url?: string;
  thumbnail_url?: string;
  medium_url?: string;
  video_url?: string;
  video_thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

export interface GalleryResponse {
  success: boolean;
  message?: string;
  posts?: {
    data: GalleryPost[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  post?: GalleryPost;
  categories?: Category[];
  category?: Category;
}

class GalleryService {
  // ========== CATEGORIES ==========
  
  /**
   * Obtener todas las categorías
   */
  async getCategories(): Promise<Category[]> {
    try {
      const response = await api.get<GalleryResponse>('/admin/gallery/categories');
      return response.data.categories || [];
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener categorías');
    }
  }

  /**
   * Crear nueva categoría
   */
  async createCategory(data: {
    name: string;
    description?: string;
    icon?: string;
    order?: number;
    is_active?: boolean;
  }): Promise<Category> {
    try {
      const response = await api.post<GalleryResponse>('/admin/gallery/categories', data);
      return response.data.category!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear categoría');
    }
  }

  /**
   * Actualizar categoría
   */
  async updateCategory(id: number, data: Partial<Category>): Promise<Category> {
    try {
      const response = await api.put<GalleryResponse>(`/admin/gallery/categories/${id}`, data);
      return response.data.category!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar categoría');
    }
  }

  /**
   * Eliminar categoría
   */
  async deleteCategory(id: number): Promise<void> {
    try {
      await api.delete(`/admin/gallery/categories/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar categoría');
    }
  }

  // ========== GALLERY POSTS ==========

  /**
   * Obtener todas las publicaciones
   */
  async getPosts(params?: {
    category_id?: number;
    per_page?: number;
    page?: number;
  }): Promise<GalleryResponse['posts']> {
    try {
      const response = await api.get<GalleryResponse>('/admin/gallery/posts', { params });
      return response.data.posts;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener publicaciones');
    }
  }

  /**
   * Crear nueva publicación con imagen o video
   */
  async createPost(data: {
    category_id: number;
    title: string;
    description: string;
    media_type: 'image' | 'video';
    image?: File | null;
    video?: File | null;
    is_published?: boolean;
  }): Promise<GalleryPost> {
    try {
      const formData = new FormData();
      formData.append('category_id', data.category_id.toString());
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('media_type', data.media_type);
      
      if (data.media_type === 'image' && data.image) {
        formData.append('image', data.image);
      } else if (data.media_type === 'video' && data.video) {
        formData.append('video', data.video);
      }
      
      if (data.is_published !== undefined) {
        formData.append('is_published', data.is_published ? '1' : '0');
      }

      const response = await api.post<GalleryResponse>('/admin/gallery/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.post!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear publicación');
    }
  }

  /**
   * Actualizar publicación
   */
  async updatePost(id: number, data: {
    category_id?: number;
    title?: string;
    description?: string;
    media_type?: 'image' | 'video';
    image?: File | null;
    video?: File | null;
    is_published?: boolean;
  }): Promise<GalleryPost> {
    try {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      
      if (data.category_id) formData.append('category_id', data.category_id.toString());
      if (data.title) formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);
      if (data.media_type) formData.append('media_type', data.media_type);
      if (data.image) formData.append('image', data.image);
      if (data.video) formData.append('video', data.video);
      if (data.is_published !== undefined) {
        formData.append('is_published', data.is_published ? '1' : '0');
      }

      const response = await api.post<GalleryResponse>(`/admin/gallery/posts/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.post!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar publicación');
    }
  }

  /**
   * Eliminar publicación
   */
  async deletePost(id: number): Promise<void> {
    try {
      await api.delete(`/admin/gallery/posts/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al eliminar publicación');
    }
  }

  /**
   * Obtener publicación específica
   */
  async getPost(id: number): Promise<GalleryPost> {
    try {
      const response = await api.get<GalleryResponse>(`/admin/gallery/posts/${id}`);
      return response.data.post!;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener publicación');
    }
  }
}

export const galleryService = new GalleryService();
