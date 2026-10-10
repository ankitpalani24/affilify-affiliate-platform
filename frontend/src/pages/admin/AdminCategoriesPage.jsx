import React, { useState, useEffect } from 'react';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  X,
  Save,
  Upload,
  Image as ImageIcon,
  Tag,
  Package,
} from 'lucide-react';
import api from '../../services/api';
import ConfirmDialog from '../../components/ConfirmDialog';
import { useToast } from '../../context/ToastContext';

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    isActive: true,
    order: 0,
  });
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { addToast } = useToast();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.getCategories({ all: 'true' });
      if (res.success) {
        setCategories(res.data);
      }
    } catch (err) {
      addToast(err.message || 'Failed to fetch categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      image: '',
      isActive: true,
      order: categories.length + 1,
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      image: cat.image || '',
      isActive: cat.isActive !== undefined ? cat.isActive : true,
      order: cat.order || 0,
    });
    setModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await api.uploadFile(file);
      if (res.success && res.url) {
        setFormData((prev) => ({ ...prev, image: res.url }));
        addToast('Category banner uploaded', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Image upload failed', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      addToast('Category name is required', 'error');
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory._id, formData);
        addToast('Category updated successfully!', 'success');
      } else {
        await api.createCategory(formData);
        addToast('Category created successfully!', 'success');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      addToast(err.message || 'Failed to save category', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (cat) => {
    try {
      const newStatus = !cat.isActive;
      const res = await api.toggleCategoryStatus(cat._id, newStatus);
      if (res.success) {
        setCategories((prev) =>
          prev.map((c) => (c._id === cat._id ? { ...c, isActive: newStatus } : c))
        );
        addToast(`Category ${newStatus ? 'activated' : 'deactivated'}`, 'success');
      }
    } catch (err) {
      addToast('Failed to toggle status', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    try {
      const res = await api.deleteCategory(categoryToDelete._id);
      if (res.success) {
        addToast('Category deleted successfully', 'success');
        setCategories((prev) => prev.filter((c) => c._id !== categoryToDelete._id));
        setDeleteModalOpen(false);
        setCategoryToDelete(null);
      }
    } catch (err) {
      addToast(err.message || 'Failed to delete category', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Category System</h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, reorganize, or modify dynamic product categories without touching code.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-brand-500/20 flex items-center gap-1.5 self-start sm:self-auto min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Category</span>
        </button>
      </div>

      {/* Categories Content Container */}
      <div className="bg-white border border-surface-300 rounded-3xl overflow-hidden shadow-soft">
        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <span className="text-xs">Loading categories...</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No categories defined yet. Click "+ Add New Category" to create your first one.
          </div>
        ) : (
          <>
            {/* Desktop View: Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-surface-200 text-slate-500 font-bold uppercase tracking-wider text-[10px] bg-surface-50">
                    <th className="py-3.5 px-4">Banner</th>
                    <th className="py-3.5 px-4">Category Name</th>
                    <th className="py-3.5 px-4">Slug</th>
                    <th className="py-3.5 px-4 text-center">Products</th>
                    <th className="py-3.5 px-4 text-center">Display Order</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-surface-200">
                  {categories.map((cat) => (
                    <tr key={cat._id} className="hover:bg-surface-50 transition-colors">
                      {/* Image */}
                      <td className="py-3 px-4">
                        {cat.image ? (
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="w-12 h-10 object-cover rounded-xl bg-surface-100 border border-surface-300"
                          />
                        ) : (
                          <div className="w-12 h-10 rounded-xl bg-surface-100 border border-surface-300 flex items-center justify-center text-slate-400">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                        )}
                      </td>

                      {/* Name & Description */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{cat.name}</span>
                        {cat.description && (
                          <span className="text-[11px] text-slate-500 line-clamp-1">
                            {cat.description}
                          </span>
                        )}
                      </td>

                      {/* Slug */}
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                        {cat.slug}
                      </td>

                      {/* Product Count */}
                      <td className="py-3 px-4 text-center font-bold text-slate-700">
                        {cat.productCount || 0}
                      </td>

                      {/* Order */}
                      <td className="py-3 px-4 text-center font-bold text-slate-600">
                        {cat.order || 0}
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(cat)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                            cat.isActive
                              ? 'bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100'
                              : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {cat.isActive ? (
                            <>
                              <CheckCircle className="w-3 h-3 text-brand-600" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-slate-400" />
                              <span>Disabled</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(cat)}
                            className="p-1.5 bg-surface-100 hover:bg-brand-600 text-slate-600 hover:text-white rounded-lg border border-surface-300 transition-colors"
                            title="Edit Category"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setCategoryToDelete(cat);
                              setDeleteModalOpen(true);
                            }}
                            className="p-1.5 bg-surface-100 hover:bg-rose-600 text-slate-600 hover:text-white rounded-lg border border-surface-300 transition-colors"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View: Responsive Card Transformation (< 768px) */}
            <div className="md:hidden divide-y divide-surface-200">
              {categories.map((cat) => (
                <div key={cat._id} className="p-4 space-y-3 bg-white">
                  <div className="flex items-start gap-3">
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-14 h-14 object-cover rounded-xl bg-surface-100 border border-surface-300 shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-surface-100 border border-surface-300 flex items-center justify-center text-slate-400 shrink-0">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-bold text-slate-900 truncate">{cat.name}</h3>
                        <button
                          onClick={() => handleToggleStatus(cat)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                            cat.isActive
                              ? 'bg-brand-50 text-brand-700 border border-brand-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {cat.isActive ? 'Active' : 'Disabled'}
                        </button>
                      </div>
                      <p className="text-[11px] font-mono text-slate-500 truncate mt-0.5">
                        /{cat.slug}
                      </p>
                      {cat.description && (
                        <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                          {cat.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-surface-100 text-xs">
                    <div className="flex items-center gap-3 text-slate-500">
                      <span className="flex items-center gap-1">
                        <Package className="w-3.5 h-3.5 text-brand-600" />
                        <strong className="text-slate-800">{cat.productCount || 0}</strong> products
                      </span>
                      <span>Order: #{cat.order || 0}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(cat)}
                        className="px-3 py-1.5 bg-surface-100 hover:bg-surface-200 text-slate-700 text-xs font-bold rounded-lg border border-surface-300 flex items-center gap-1 min-h-[36px]"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          setCategoryToDelete(cat);
                          setDeleteModalOpen(true);
                        }}
                        className="p-2 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-lg border border-rose-200 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add / Edit Category Modal - Responsive Container */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-surface-300 rounded-3xl p-5 sm:p-7 w-[min(95vw,520px)] max-h-[90vh] overflow-y-auto space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-surface-200 pb-3">
              <div className="flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-brand-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 min-w-[40px] min-h-[40px] flex items-center justify-center"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Home & Living, Smart Electronics"
                  className="w-full bg-surface-50 border border-surface-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-brand-500 focus:bg-white"
                />
              </div>

              {/* Slug */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Custom Slug (Optional)</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="auto-generated-if-empty"
                  className="w-full bg-surface-50 border border-surface-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-brand-500 focus:bg-white"
                />
              </div>

              {/* Image */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Category Banner Image URL</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 bg-surface-50 border border-surface-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-brand-500 focus:bg-white"
                  />
                  <label className="bg-surface-100 hover:bg-surface-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl border border-surface-300 cursor-pointer flex items-center justify-center gap-1 shrink-0 shadow-xs min-h-[40px]">
                    <Upload className="w-3.5 h-3.5 text-brand-600" />
                    <span>{uploadingImage ? '...' : 'Upload'}</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Description</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief summary of items in this category..."
                  className="w-full bg-surface-50 border border-surface-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-brand-500 focus:bg-white"
                ></textarea>
              </div>

              {/* Order & Active */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Display Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    className="w-full bg-surface-50 border border-surface-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-brand-500 focus:bg-white"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2 sm:pt-6">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                    />
                    <span>Active in store</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-surface-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-surface-100 rounded-xl border border-surface-300 min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition-all shadow-md shadow-brand-500/20 flex items-center gap-1.5 disabled:opacity-50 min-h-[44px]"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Delete Category"
        message={`Are you sure you want to delete category "${categoryToDelete?.name}"? If any products currently belong to this category, deletion will be prevented to protect your product data.`}
        confirmText="Yes, Delete Category"
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setCategoryToDelete(null);
        }}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AdminCategoriesPage;