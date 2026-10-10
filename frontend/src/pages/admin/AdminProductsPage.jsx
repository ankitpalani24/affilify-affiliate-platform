import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Package,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  ExternalLink,
  Sparkles,
  Flame,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  MoreVertical,
  MousePointerClick,
} from 'lucide-react';
import api from '../../services/api';
import Pagination from '../../components/Pagination';
import ConfirmDialog from '../../components/ConfirmDialog';
import { formatCurrency, getPlatformConfig } from '../../utils/helpers';
import { useToast } from '../../context/ToastContext';

const AdminProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  // Filters State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { addToast } = useToast();

  // Load Categories on mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.getCategories({ all: 'true' });
        if (res.success) setCategories(res.data);
      } catch (err) {
        console.error('Category load error:', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch Products based on filters and pagination
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 15,
      };

      if (search.trim()) params.search = search.trim();
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedPlatform !== 'all') params.platform = selectedPlatform;
      if (statusFilter !== 'all') params.isActive = statusFilter === 'active';

      const res = await api.getProducts(params);
      if (res.success) {
        setProducts(res.data);
        setTotalCount(res.total || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      addToast(err.message || 'Failed to fetch products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, selectedCategory, selectedPlatform, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  // Toggle Featured status
  const handleToggleFeatured = async (product) => {
    try {
      const newStatus = !product.isFeatured;
      const res = await api.toggleFeatured(product._id, newStatus);
      if (res.success) {
        setProducts((prev) =>
          prev.map((p) => (p._id === product._id ? { ...p, isFeatured: newStatus } : p))
        );
        addToast(`Product ${newStatus ? 'marked as Featured' : 'unfeatured'}`, 'success');
      }
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  // Toggle Trending status
  const handleToggleTrending = async (product) => {
    try {
      const newStatus = !product.isTrending;
      const res = await api.toggleTrending(product._id, newStatus);
      if (res.success) {
        setProducts((prev) =>
          prev.map((p) => (p._id === product._id ? { ...p, isTrending: newStatus } : p))
        );
        addToast(`Product ${newStatus ? 'marked as Trending' : 'removed from Trending'}`, 'success');
      }
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  // Toggle Active Status
  const handleToggleStatus = async (product) => {
    try {
      const newStatus = !product.isActive;
      const res = await api.updateProduct(product._id, { isActive: newStatus });
      if (res.success) {
        setProducts((prev) =>
          prev.map((p) => (p._id === product._id ? { ...p, isActive: newStatus } : p))
        );
        addToast(`Product ${newStatus ? 'activated' : 'deactivated'}`, 'success');
      }
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  // Confirm and delete product
  const confirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      const res = await api.deleteProduct(productToDelete._id);
      if (res.success) {
        addToast('Product removed from catalog', 'success');
        setProducts((prev) => prev.filter((p) => p._id !== productToDelete._id));
        setTotalCount((prev) => Math.max(0, prev - 1));
        setDeleteModalOpen(false);
        setProductToDelete(null);
      }
    } catch (err) {
      addToast(err.message || 'Failed to delete product', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Product Catalog</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage affiliate products, sync statuses, pricing, and live badges. ({totalCount} items)
          </p>
        </div>

        <Link
          to="/admin/products/new"
          className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-1.5 self-start sm:self-auto min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Product</span>
        </Link>
      </div>

      {/* Filters & Search Control Strip */}
      <div className="bg-white border border-surface-300 rounded-3xl p-4 shadow-soft space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 sm:gap-3">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="lg:col-span-5 relative">
            <input
              type="text"
              placeholder="Search by title, brand, ASIN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-50 border border-surface-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-brand-500 focus:bg-white min-h-[40px]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          {/* Category Dropdown */}
          <div className="lg:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="w-full bg-surface-50 border border-surface-300 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-brand-500 focus:bg-white cursor-pointer min-h-[40px]"
              aria-label="Filter by Category"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Platform Dropdown */}
          <div className="lg:col-span-2">
            <select
              value={selectedPlatform}
              onChange={(e) => {
                setSelectedPlatform(e.target.value);
                setPage(1);
              }}
              className="w-full bg-surface-50 border border-surface-300 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-brand-500 focus:bg-white cursor-pointer min-h-[40px]"
              aria-label="Filter by Platform"
            >
              <option value="all">All Stores</option>
              <option value="Amazon">Amazon</option>
              <option value="Flipkart">Flipkart</option>
              <option value="Myntra">Myntra</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="lg:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-surface-50 border border-surface-300 rounded-xl px-3 py-2 text-xs text-slate-700 outline-none focus:border-brand-500 focus:bg-white cursor-pointer min-h-[40px]"
              aria-label="Filter by Status"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Display: Desktop Table View + Mobile Card Transformation */}
      <div className="bg-white border border-surface-300 rounded-3xl overflow-hidden shadow-soft">
        {/* 1. Mobile Cards Transformation (Visible on < 768px screens) */}
        <div className="md:hidden divide-y divide-surface-200">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-xs">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">No products found</div>
          ) : (
            products.map((p) => {
              const plat = getPlatformConfig(p.affiliatePlatform);
              return (
                <div key={p._id} className="p-4 space-y-3">
                  <div className="flex gap-3 items-start">
                    <img
                      src={p.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                      alt={p.name}
                      className="w-16 h-16 object-contain rounded-xl bg-surface-100 border border-surface-200 shrink-0 p-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${plat.badge}`}>
                          {p.affiliatePlatform}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate">
                          {p.category?.name || 'General'}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 line-clamp-2 leading-snug">
                        {p.name}
                      </h4>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-sm font-black text-slate-900">{formatCurrency(p.price)}</span>
                        {p.originalPrice && p.originalPrice > p.price && (
                          <span className="text-[10px] text-slate-400 line-through">
                            {formatCurrency(p.originalPrice)}
                          </span>
                        )}
                        <span className="text-[10px] font-semibold text-brand-700 ml-auto inline-flex items-center gap-0.5">
                          <MousePointerClick className="w-3 h-3 text-brand-600" />
                          <span>{p.clickCount || 0} clicks</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Badges Toolbar */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-surface-100">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleFeatured(p)}
                        className={`p-1.5 rounded-lg text-xs min-h-[36px] min-w-[36px] flex items-center justify-center ${
                          p.isFeatured ? 'bg-amber-100 text-amber-800' : 'text-slate-400 hover:bg-surface-100'
                        }`}
                        title="Toggle Featured"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleTrending(p)}
                        className={`p-1.5 rounded-lg text-xs min-h-[36px] min-w-[36px] flex items-center justify-center ${
                          p.isTrending ? 'bg-rose-100 text-rose-800' : 'text-slate-400 hover:bg-surface-100'
                        }`}
                        title="Toggle Trending"
                      >
                        <Flame className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(p)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold min-h-[32px] flex items-center gap-1 ${
                          p.isActive
                            ? 'bg-brand-50 text-brand-700 border border-brand-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {p.isActive ? 'Active' : 'Draft'}
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <Link
                        to={`/product/${p.slug}`}
                        target="_blank"
                        className="p-2 text-slate-600 hover:text-slate-900 bg-surface-100 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center"
                        title="View Live Store Page"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        to={`/admin/products/edit/${p._id}`}
                        className="p-2 text-brand-700 hover:text-white bg-brand-50 hover:bg-brand-600 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors"
                        title="Edit Product"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => {
                          setProductToDelete(p);
                          setDeleteModalOpen(true);
                        }}
                        className="p-2 text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 2. Desktop Table View (Visible on >= 768px screens) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-surface-200 text-slate-500 font-bold uppercase tracking-wider text-[10px] bg-surface-50">
                <th className="py-3.5 px-4">Thumb</th>
                <th className="py-3.5 px-4">Product Details</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Store</th>
                <th className="py-3.5 px-4 text-center">Clicks</th>
                <th className="py-3.5 px-4 text-center">Badges</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-surface-200">
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <span>Loading products catalog...</span>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-400">
                    No products found matching active filters.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const plat = getPlatformConfig(p.affiliatePlatform);
                  return (
                    <tr key={p._id} className="hover:bg-surface-50 transition-colors">
                      {/* Thumbnail */}
                      <td className="py-3 px-4">
                        <img
                          src={p.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                          alt={p.name}
                          className="w-12 h-12 object-contain rounded-xl bg-surface-100 border border-surface-200 p-1"
                        />
                      </td>

                      {/* Title & Brand */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-bold text-slate-900 line-clamp-1" title={p.name}>
                          {p.name}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                          Brand: <span className="font-semibold text-slate-700">{p.brand || 'Generic'}</span> {p.asin ? ` • ASIN: ${p.asin}` : ''}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-slate-600 font-medium whitespace-nowrap">
                        {p.category?.name || 'General'}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-black text-slate-900">{formatCurrency(p.price)}</div>
                        {p.originalPrice && p.originalPrice > p.price && (
                          <div className="text-[10px] text-slate-400 line-through">
                            {formatCurrency(p.originalPrice)}
                          </div>
                        )}
                      </td>

                      {/* Platform */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${plat.badge}`}>
                          {p.affiliatePlatform}
                        </span>
                      </td>

                      {/* Clicks */}
                      <td className="py-3 px-4 text-center font-bold text-brand-700">
                        {p.clickCount || 0}
                      </td>

                      {/* Badges Toggle */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleToggleFeatured(p)}
                            title={p.isFeatured ? 'Featured (Click to toggle)' : 'Not Featured (Click to toggle)'}
                            className={`p-1.5 rounded-lg text-xs transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center ${
                              p.isFeatured
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-surface-100'
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleTrending(p)}
                            title={p.isTrending ? 'Trending (Click to toggle)' : 'Not Trending (Click to toggle)'}
                            className={`p-1.5 rounded-lg text-xs transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center ${
                              p.isTrending
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-surface-100'
                            }`}
                          >
                            <Flame className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(p)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors min-h-[28px] ${
                            p.isActive
                              ? 'bg-brand-100 text-brand-800 border border-brand-300'
                              : 'bg-slate-100 text-slate-500 border border-slate-300'
                          }`}
                        >
                          {p.isActive ? (
                            <>
                              <CheckCircle className="w-3 h-3 text-brand-600" /> Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-slate-400" /> Inactive
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Public View */}
                          <Link
                            to={`/product/${p.slug}`}
                            target="_blank"
                            title="View on Public Website"
                            className="p-1.5 bg-surface-100 hover:bg-surface-200 text-slate-600 hover:text-slate-900 rounded-lg border border-surface-300 transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          {/* Test Affiliate Link */}
                          <a
                            href={`/api/products/${p._id}/click`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Test Affiliate Link & Track Click"
                            className="p-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg border border-brand-200 transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          {/* Edit */}
                          <Link
                            to={`/admin/products/edit/${p._id}`}
                            title="Edit Product Details"
                            className="p-1.5 bg-surface-100 hover:bg-brand-600 text-slate-700 hover:text-white rounded-lg border border-surface-300 transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              setProductToDelete(p);
                              setDeleteModalOpen(true);
                            }}
                            title="Delete Product"
                            className="p-1.5 bg-surface-100 hover:bg-rose-600 text-slate-600 hover:text-white rounded-lg border border-surface-300 transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-surface-200">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.name}"? This will permanently erase the product and its click tracking data.`}
        confirmText="Yes, Delete Product"
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setProductToDelete(null);
        }}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default AdminProductsPage;