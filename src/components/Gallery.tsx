import { useState, useEffect } from 'react';
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
    image: null as File | null,
    is_published: true,
  });
  const [imagePreview, setImagePreview] = useState<string>('');

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
      setUploadForm({ ...uploadForm, image: file });
      
      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.image || !uploadForm.category_id) {
      alert('Por favor selecciona una categoría y una imagen');
      return;
    }

    try {
      if (editingPost) {
        await updatePost(editingPost.id, uploadForm);
      } else {
        await createPost(uploadForm);
      }
      
      setShowUploadDialog(false);
      resetUploadForm();
      loadPosts();
    } catch (err) {
      console.error('Error al guardar publicación:', err);
    }
  };

  const handleDeletePost = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar esta publicación?')) {
      try {
        await deletePost(id);
        loadPosts();
      } catch (err) {
        console.error('Error al eliminar:', err);
      }
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryForm);
      } else {
        await createCategory(categoryForm);
      }
      
      setShowCategoryDialog(false);
      resetCategoryForm();
      loadCategories();
    } catch (err) {
      console.error('Error al guardar categoría:', err);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (confirm('¿Estás seguro? Esto eliminará la categoría si no tiene publicaciones.')) {
      try {
        await deleteCategory(id);
        loadCategories();
      } catch (err) {
        console.error('Error al eliminar categoría:', err);
      }
    }
  };

  const resetUploadForm = () => {
    setUploadForm({
      category_id: 0,
      title: '',
      description: '',
      image: null,
      is_published: true,
    });
    setImagePreview('');
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
                  Tamaño recomendado: mínimo 1200x800px, máximo 10MB
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUploadSubmit} className="space-y-4">
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

                <div>
                  <Label htmlFor="image">Imagen *</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    onChange={handleImageChange}
                    required={!editingPost}
                  />
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="mt-2 max-h-48 rounded" />
                  )}
                </div>

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
                    <img
                      src={`http://localhost:8000${post.thumbnail_url}`}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
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
                            image: null,
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
