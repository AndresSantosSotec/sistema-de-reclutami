import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useGallery } from '../hooks/useGallery';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  PlusIcon, 
  PhotoIcon, 
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  FolderIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

export default function Gallery() {
  const {
    categories,
    posts,
    isLoading,
    error,
    pagination,
    loadCategories,
    loadPosts,
    createPost,
    updatePost,
    deletePost,
    createCategory,
    updateCategory,
    deleteCategory,
    clearError,
  } = useGallery();

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  // Form states
  const [uploadForm, setUploadForm] = useState({
    category_id: 0,
    title: '',
    description: '',
    media_type: 'image' as 'image' | 'video',
    image: null as File | null,
    video: null as File | null,
    is_published: true,
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [videoPreview, setVideoPreview] = useState<string>('');

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: '',
    order: 0,
    is_active: true,
  });

  useEffect(() => {
    loadCategories();
    loadPosts();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño máximo 200MB
      const maxSize = 200 * 1024 * 1024; // 200MB en bytes
      if (file.size > maxSize) {
        toast.error('El archivo no debe superar 200MB');
        return;
      }

      setUploadForm({ ...uploadForm, image: file, media_type: 'image', video: null });
      setVideoPreview('');
      
      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño máximo 200MB
      const maxSize = 200 * 1024 * 1024; // 200MB en bytes
      if (file.size > maxSize) {
        toast.error('El video no debe superar 200MB');
        return;
      }

      setUploadForm({ ...uploadForm, video: file, media_type: 'video', image: null });
      setImagePreview('');
      
      // Preview de video
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadForm.category_id) {
      toast.error('Por favor selecciona una categoría');
      return;
    }

    if (uploadForm.media_type === 'image' && !uploadForm.image) {
      toast.error('Por favor selecciona una imagen');
      return;
    }

    if (uploadForm.media_type === 'video' && !uploadForm.video) {
      toast.error('Por favor selecciona un video');
      return;
    }

    try {
      if (editingPost) {
        await updatePost(editingPost.id, uploadForm);
        toast.success('Publicación actualizada exitosamente');
      } else {
        await createPost(uploadForm);
        toast.success('Publicación creada exitosamente');
      }
      
      setShowUploadDialog(false);
      resetUploadForm();
      loadPosts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al guardar publicación');
    }
  };

  const handleDeletePost = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar esta publicación?')) {
      try {
        await deletePost(id);
        toast.success('Publicación eliminada correctamente');
        loadPosts();
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Error al eliminar');
      }
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryForm);
        toast.success('Categoría actualizada exitosamente');
      } else {
        await createCategory(categoryForm);
        toast.success('Categoría creada exitosamente');
      }
      
      setShowCategoryDialog(false);
      resetCategoryForm();
      loadCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al guardar categoría');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (confirm('¿Estás seguro? Esto eliminará la categoría si no tiene publicaciones.')) {
      try {
        await deleteCategory(id);
        toast.success('Categoría eliminada correctamente');
        loadCategories();
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Error al eliminar categoría');
      }
    }
  };

  const resetUploadForm = () => {
    setUploadForm({
      category_id: 0,
      title: '',
      description: '',
      media_type: 'image',
      image: null,
      video: null,
      is_published: true,
    });
    setImagePreview('');
    setVideoPreview('');
    setEditingPost(null);
  };

  const resetCategoryForm = () => {
    setCategoryForm({
      name: '',
      description: '',
      icon: '',
      order: 0,
      is_active: true,
    });
    setEditingCategory(null);
  };

  const filterPostsByCategory = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    loadPosts(categoryId ? { category_id: categoryId } : {});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Galería de Fotos</h1>
          <p className="text-gray-600">Gestiona las imágenes y categorías del portal</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={resetCategoryForm}>
                <FolderIcon className="w-4 h-4 mr-2" />
                Gestionar Categorías
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Editar' : 'Nueva'} Categoría
                </DialogTitle>
                <DialogDescription>
                  Las categorías organizan las publicaciones de la galería
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div>
                  <Label htmlFor="cat-name">Nombre *</Label>
                  <Input
                    id="cat-name"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cat-desc">Descripción</Label>
                  <Textarea
                    id="cat-desc"
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="cat-icon">Icono (opcional)</Label>
                  <Input
                    id="cat-icon"
                    value={categoryForm.icon}
                    onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                    placeholder="ej: building-office"
                  />
                </div>
                <div>
                  <Label htmlFor="cat-order">Orden</Label>
                  <Input
                    id="cat-order"
                    type="number"
                    value={categoryForm.order}
                    onChange={(e) => setCategoryForm({ ...categoryForm, order: parseInt(e.target.value) })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="cat-active"
                    checked={categoryForm.is_active}
                    onChange={(e) => setCategoryForm({ ...categoryForm, is_active: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="cat-active">Categoría activa</Label>
                </div>
                <Button type="submit" className="w-full">
                  {editingCategory ? 'Actualizar' : 'Crear'} Categoría
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetUploadForm}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Subir Foto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingPost ? 'Editar' : 'Subir'} Publicación
                </DialogTitle>
                <DialogDescription>
                  Imágenes: máx 200MB (jpeg, png, webp) | Videos: máx 200MB (mp4, mov, avi, wmv, webm)
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="media_type">Tipo de contenido *</Label>
                  <Select
                    value={uploadForm.media_type}
                    onValueChange={(value: 'image' | 'video') => {
                      setUploadForm({ ...uploadForm, media_type: value, image: null, video: null });
                      setImagePreview('');
                      setVideoPreview('');
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image">📷 Imagen</SelectItem>
                      <SelectItem value="video">🎥 Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Categoría *</Label>
                  <Select
                    value={uploadForm.category_id.toString()}
                    onValueChange={(value) => setUploadForm({ ...uploadForm, category_id: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descripción *</Label>
                  <Textarea
                    id="description"
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                    required
                    rows={3}
                  />
                </div>

                {uploadForm.media_type === 'image' ? (
                  <div>
                    <Label htmlFor="image">Imagen *</Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,image/webp"
                      onChange={handleImageChange}
                      required={!editingPost}
                    />
                    <p className="text-xs text-gray-500 mt-1">Máximo 200MB</p>
                    {imagePreview && (
                      <img src={imagePreview} alt="Preview" className="mt-2 max-h-48 rounded" />
                    )}
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="video">Video *</Label>
                    <Input
                      id="video"
                      type="file"
                      accept="video/mp4,video/mov,video/avi,video/wmv,video/webm"
                      onChange={handleVideoChange}
                      required={!editingPost}
                    />
                    <p className="text-xs text-gray-500 mt-1">Máximo 200MB - Formatos: MP4, MOV, AVI, WMV, WEBM</p>
                    {videoPreview && (
                      <video src={videoPreview} controls className="mt-2 max-h-48 rounded w-full" />
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="published"
                    checked={uploadForm.is_published}
                    onChange={(e) => setUploadForm({ ...uploadForm, is_published: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="published">Publicar inmediatamente</Label>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Procesando...' : editingPost ? 'Actualizar' : 'Subir Foto'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="flex justify-between items-center">
            {error}
            <Button variant="ghost" size="sm" onClick={clearError}>
              <XCircleIcon className="w-4 h-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="posts" className="w-full">
        <TabsList>
          <TabsTrigger value="posts">Publicaciones</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
        </TabsList>

        {/* Posts Tab */}
        <TabsContent value="posts" className="space-y-4">
          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => filterPostsByCategory(null)}
            >
              Todas
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => filterPostsByCategory(cat.id)}
              >
                {cat.name}
              </Button>
            ))}
          </div>

          {/* Posts Grid */}
          {isLoading ? (
            <div className="text-center py-12">Cargando...</div>
          ) : posts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <PhotoIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No hay publicaciones aún</p>
                <Button className="mt-4" onClick={() => setShowUploadDialog(true)}>
                  Subir primera foto
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {posts.map((post) => (
                <Card key={post.id} className="overflow-hidden">
                  <div className="relative aspect-video bg-gray-100">
                    {post.media_type === 'video' ? (
                      <video
                        src={post.video_url ? `https://oportunidadescoosanjer.com.gt${post.video_url}` : undefined}
                        className="w-full h-full object-cover"
                        controls
                        preload="metadata"
                      />
                    ) : (
                      <img
                        src={post.thumbnail_url ? `${import.meta.env.VITE_BACKEND_URL || 'https://oportunidadescoosanjer.com.gt'}${post.thumbnail_url}` : `${import.meta.env.VITE_BACKEND_URL || 'https://oportunidadescoosanjer.com.gt'}${post.image_url}`}
                        alt={post.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = `${import.meta.env.VITE_BACKEND_URL || 'https://oportunidadescoosanjer.com.gt'}/images/placeholder.svg`
                        }}
                      />
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                      {post.media_type === 'video' && (
                        <Badge className="bg-blue-500">🎥 Video</Badge>
                      )}
                      {post.is_published ? (
                        <Badge className="bg-green-500">Publicado</Badge>
                      ) : (
                        <Badge variant="secondary">Borrador</Badge>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold truncate">{post.title}</h3>
                    <p className="text-sm text-gray-600 truncate">{post.description}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                      <EyeIcon className="w-3 h-3" />
                      {post.views_count} vistas
                      {post.media_type === 'video' && post.video_duration && (
                        <span className="ml-2">• {Math.floor(post.video_duration / 60)}:{(post.video_duration % 60).toString().padStart(2, '0')} min</span>
                      )}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setEditingPost(post);
                          setUploadForm({
                            category_id: post.category_id,
                            title: post.title,
                            description: post.description,
                            media_type: post.media_type || 'image',
                            image: null,
                            video: null,
                            is_published: post.is_published,
                          });
                          setShowUploadDialog(true);
                        }}
                      >
                        <PencilIcon className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleDeletePost(post.id)}
                      >
                        <TrashIcon className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.lastPage > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                disabled={pagination.currentPage === 1}
                onClick={() => loadPosts({ page: pagination.currentPage - 1 })}
              >
                Anterior
              </Button>
              <span className="py-2 px-4">
                Página {pagination.currentPage} de {pagination.lastPage}
              </span>
              <Button
                variant="outline"
                disabled={pagination.currentPage === pagination.lastPage}
                onClick={() => loadPosts({ page: pagination.currentPage + 1 })}
              >
                Siguiente
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Card key={cat.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{cat.name}</span>
                    {cat.is_active ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircleIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </CardTitle>
                  <CardDescription>{cat.description || 'Sin descripción'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setEditingCategory(cat);
                        setCategoryForm({
                          name: cat.name,
                          description: cat.description || '',
                          icon: cat.icon || '',
                          order: cat.order,
                          is_active: cat.is_active,
                        });
                        setShowCategoryDialog(true);
                      }}
                    >
                      <PencilIcon className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteCategory(cat.id)}
                    >
                      <TrashIcon className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
