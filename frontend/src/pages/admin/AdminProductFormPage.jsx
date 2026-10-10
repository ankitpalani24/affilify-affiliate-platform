import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Upload,
  Plus,
  Trash2,
  ExternalLink,
  Sparkles,
  Flame,
  CheckCircle2,
  Image as ImageIcon,
  Link2,
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const AdminProductFormPage = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: '',
    brand: '',
    price: '',
    originalPrice: '',
    discountPercentage: 0,
    affiliatePlatform: 'Amazon',
    affiliateUrl: '',
    buyButtonText: 'Buy on Amazon',
    shortDescription: '',
    description: '',
    features: [''],
    tags: '',
    isFeatured: false,
    isTrending: false,
    isActive: true,
    images: [],
  });

  const [newImageUrl, setNewImageUrl] = useState('');

  // Load categories and initial product if edit mode
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        const catsRes = await api.getCategories({ all: 'true' });
        if (catsRes.success) {
          setCategories(catsRes.data);
          if (!isEditMode && catsRes.data.length > 0) {
            setFormData((prev) => ({ ...prev, category: catsRes.data[0]._id }));
          }
        }

        if (isEditMode) {
          const prodRes = await api.getProductById(id);
          if (prodRes.success && prodRes.data) {
            const p = prodRes.data;
            setFormData({
              name: p.name || '',
              slug: p.slug || '',
              category: p.category?._id || p.category || '',
              brand: p.brand || '',
              price: p.price || '',
              originalPrice: p.originalPrice || '',
              discountPercentage: p.discountPercentage || 0,
              affiliatePlatform: p.affiliatePlatform || 'Amazon',
              affiliateUrl: p.affiliateUrl || '',
              buyButtonText: p.buyButtonText || `Buy on ${p.affiliatePlatform || 'Amazon'}`,
              shortDescription: p.shortDescription || '',
              description: p.description || '',
              features: p.features && p.features.length > 0 ? p.features : [''],
              tags: p.tags ? p.tags.join(', ') : '',
              isFeatured: Boolean(p.isFeatured),
              isTrending: Boolean(p.isTrending),
              isActive: p.isActive !== undefined ? Boolean(p.isActive) : true,
              images: p.images || [],
            });
          }
        }
      } catch (err) {
        addToast(err.message || 'Failed to load initial data', 'error');
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [id, isEditMode]);

  // Auto calculate discount percentage
  const handlePriceChange = (priceVal, origVal) => {
    const p = parseFloat(priceVal);
    const orig = parseFloat(origVal);
    let discount = 0;
    if (orig && p && orig > p) {
      discount = Math.round(((orig - p) / orig) * 100);
    }
    setFormData((prev) => ({
      ...prev,
      price: priceVal,
      originalPrice: origVal,
      discountPercentage: discount,
    }));
  };

  const handlePlatformChange = (platform) => {
    setFormData((prev) => ({
      ...prev,
      affiliatePlatform: platform,
      buyButtonText: `Buy on ${platform}`,
    }));
  };

  const handleAddFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, ''],
    }));
  };

  const handleFeatureChange = (index, value) => {
    const updated = [...formData.features];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, features: updated }));
  };

  const handleRemoveFeature = (index) => {
    const updated = formData.features.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      features: updated.length > 0 ? updated : [''],
    }));
  };

  const handleAddImageUrl = () => {
    if (newImageUrl.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()],
      }));
      setNewImageUrl('');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await api.uploadFile(file);
      if (res.success && res.url) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, res.url],
        }));
        addToast('Image uploaded successfully!', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Image upload failed', 'error');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!formData.name.trim()) {
      addToast('Product name is required', 'error');
      return;
    }
    if (!formData.category) {
      addToast('Please select a product category', 'error');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      addToast('Please enter a valid product price', 'error');
      return;
    }
    if (!formData.affiliateUrl.trim()) {
      addToast('Affiliate URL is required', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        features: formData.features.filter((f) => f.trim() !== ''),
        tags: formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };

      if (isEditMode) {
        await api.updateProduct(id, payload);
        addToast('Product updated successfully!', 'success');
      } else {
        await api.createProduct(payload);
        addToast('Product published to catalog successfully!', 'success');
      }

      navigate('/admin/products');
    } catch (err) {
      addToast(err.message || 'Failed to save product', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-slate-400">
        <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="p-2.5 bg-white hover:bg-surface-100 text-slate-600 rounded-xl border border-surface-300 transition-colors shadow-xs min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Back to products list"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {isEditMode ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Fill in product information, pricing, specifications, and affiliate target link.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold py-3 px-5 rounded-xl transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 disabled:opacity-50 min-h-[44px] self-start sm:self-auto w-full sm:w-auto"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : isEditMode ? 'Save Changes' : 'Publish Product'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="bg-white border border-surface-300 rounded-3xl p-5 sm:p-8 space-y-5 shadow-soft">
          <h2 className="text-sm font-bold text-brand-900 uppercase tracking-wider border-b border-surface-200 pb-3">
            1. Basic Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {/* Title */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Product Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Sony WH-1000XM5 Wireless Noise Canceling Headphones"
                className="w-full bg-surface-50 border border-surface-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-brand-500 focus:bg-white"
              />
            </div>

            {/* Custom Slug */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                SEO Slug (Auto-generated if blank)
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="sony-wh-1000xm5-wireless"
                className="w-full bg-surface-50 border border-surface-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-brand-500 focus:bg-white"
              />
            </div>

            {/* Brand */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Brand / Manufacturer</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="e.g. Sony, Apple, Samsung"
                className="w-full bg-surface-50 border border-surface-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-brand-500 focus:bg-white"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-surface-50 border border-surface-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-brand-500 focus:bg-white min-h-[44px]"
              >
                <option value="">Select a Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Search Tags (comma separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="headphones, bluetooth, anc, wireless"
                className="w-full bg-surface-50 border border-surface-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-brand-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Pricing & Affiliate Configuration */}
        <div className="bg-white border border-surface-300 rounded-3xl p-5 sm:p-8 space-y-5 shadow-soft">
          <h2 className="text-sm font-bold text-brand-900 uppercase tracking-wider border-b border-surface-200 pb-3">
            2. Pricing & Affiliate Links
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {/* Sale Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Current Sale Price (INR ₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => handlePriceChange(e.target.value, formData.originalPrice)}
                placeholder="24999"
                className="w-full bg-surface-50 border border-surface-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-brand-500 focus:bg-white"
              />
            </div>

            {/* Original Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Original / MRP Price (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formData.originalPrice}
                onChange={(e) => handlePriceChange(formData.price, e.target.value)}
                placeholder="29990"
                className="w-full bg-surface-50 border border-surface-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-brand-500 focus:bg-white"
              />
            </div>

            {/* Discount Calculation */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Discount % (Auto-calculated)</label>
              <div className="bg-surface-100 border border-surface-300 rounded-xl px-3.5 py-2.5 text-xs text-brand-800 font-bold flex items-center justify-between min-h-[44px]">
                <span>{formData.discountPercentage}% OFF</span>
                {formData.discountPercentage > 0 && (
                  <span className="text-[10px] bg-brand-200 text-brand-900 px-2 py-0.5 rounded font-extrabold">
                    DEAL
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 pt-2">
            {/* Affiliate Platform */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Affiliate Store / Partner</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {['Amazon', 'Flipkart', 'Myntra', 'Ajio', 'Nykaa'].map((plat) => (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => handlePlatformChange(plat)}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all min-h-[40px] flex items-center justify-center ${
                      formData.affiliatePlatform === plat
                        ? 'bg-brand-50 text-brand-800 border-brand-500 ring-2 ring-brand-500/20'
                        : 'bg-surface-50 text-slate-600 border-surface-300 hover:bg-surface-100'
                    }`}
                  >
                    {plat}
                  </button>
                ))}
              </div>
            </div>

            {/* Buy Button Text */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Button Call-to-Action Text</label>
              <input
                type="text"
                value={formData.buyButtonText}
                onChange={(e) => setFormData({ ...formData, buyButtonText: e.target.value })}
                placeholder="Buy on Amazon"
                className="w-full bg-surface-50 border border-surface-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-brand-500 focus:bg-white"
              />
            </div>

            {/* Affiliate Target URL */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>
                  Affiliate Target URL (With tracking tag) <span className="text-rose-500">*</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  e.g. https://www.amazon.in/dp/...?tag=youraffid-21
                </span>
              </label>
              <div className="relative">
                <input
                  type="url"
                  required
                  value={formData.affiliateUrl}
                  onChange={(e) => setFormData({ ...formData, affiliateUrl: e.target.value })}
                  placeholder="https://amzn.to/... or https://www.amazon.in/dp/..."
                  className="w-full bg-surface-50 border border-surface-300 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-brand-500 focus:bg-white font-mono"
                />
                <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Product Images Gallery */}
        <div className="bg-white border border-surface-300 rounded-3xl p-5 sm:p-8 space-y-5 shadow-soft">
          <h2 className="text-sm font-bold text-brand-900 uppercase tracking-wider border-b border-surface-200 pb-3">
            3. Product Images Gallery
          </h2>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Paste direct image URL (https://images.unsplash.com/...)"
              className="flex-1 bg-surface-50 border border-surface-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-brand-500 focus:bg-white"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-surface-100 hover:bg-surface-200 text-slate-800 text-xs font-bold rounded-xl border border-surface-300 transition-colors min-h-[44px] flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add URL
              </button>

              <label className="flex-1 sm:flex-none bg-brand-50 hover:bg-brand-100 text-brand-800 text-xs font-bold px-4 py-2.5 rounded-xl border border-brand-200 cursor-pointer flex items-center justify-center gap-1.5 transition-colors shadow-xs min-h-[44px]">
                <Upload className="w-4 h-4 text-brand-600" />
                <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Images Grid */}
          {formData.images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {formData.images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-2xl overflow-hidden border border-surface-300 bg-surface-50 group p-2 flex items-center justify-center"
                >
                  <img src={img} alt="" className="max-h-full max-w-full object-contain" />
                  <span className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    #{idx + 1} {idx === 0 && '(Cover)'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-2 right-2 bg-rose-600 text-white p-2 rounded-xl opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-rose-500 shadow min-w-[36px] min-h-[36px] flex items-center justify-center"
                    title="Remove image"
                    aria-label="Remove image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-surface-50 rounded-2xl border border-dashed border-surface-300 text-center space-y-2">
              <ImageIcon className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs text-slate-500">
                No images added yet. Add an image URL or upload a file.
              </p>
            </div>
          )}
        </div>

        {/* Section 4: Descriptions & Features */}
        <div className="bg-white border border-surface-300 rounded-3xl p-5 sm:p-8 space-y-5 shadow-soft">
          <h2 className="text-sm font-bold text-brand-900 uppercase tracking-wider border-b border-surface-200 pb-3">
            4. Descriptions & Key Features
          </h2>

          <div className="space-y-4">
            {/* Short Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Short Catchy Summary (1-2 sentences)
              </label>
              <textarea
                rows="2"
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                placeholder="e.g. Industry leading wireless headphones with exceptional active noise cancellation."
                className="w-full bg-surface-50 border border-surface-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-brand-500 focus:bg-white"
              ></textarea>
            </div>

            {/* Key Features Bullets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Key Features / Highlights</label>
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="text-xs font-bold text-brand-700 hover:text-brand-800 inline-flex items-center gap-1 min-h-[36px]"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Bullet Point
                </button>
              </div>

              <div className="space-y-2">
                {formData.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={feat}
                      onChange={(e) => handleFeatureChange(idx, e.target.value)}
                      placeholder={`Feature ${idx + 1}`}
                      className="flex-1 bg-surface-50 border border-surface-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-brand-500 focus:bg-white"
                    />
                    {formData.features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="p-2.5 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-surface-100 min-h-[40px] min-w-[40px] flex items-center justify-center"
                        aria-label="Remove feature"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Full Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Detailed Full Description</label>
              <textarea
                rows="5"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Comprehensive overview and technical details about the product..."
                className="w-full bg-surface-50 border border-surface-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-brand-500 focus:bg-white leading-relaxed"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Section 5: Visibility & Badges Toggles */}
        <div className="bg-white border border-surface-300 rounded-3xl p-5 sm:p-8 space-y-4 shadow-soft">
          <h2 className="text-sm font-bold text-brand-900 uppercase tracking-wider border-b border-surface-200 pb-3">
            5. Visibility & Badges
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {/* Active Switch */}
            <label className="flex items-center gap-3 p-4 bg-surface-50 rounded-2xl border border-surface-300 cursor-pointer hover:border-brand-400 transition-colors">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500"
              />
              <div>
                <div className="text-xs font-bold text-slate-900">Active (Visible)</div>
                <div className="text-[10px] text-slate-500">Show on public catalog</div>
              </div>
            </label>

            {/* Featured Switch */}
            <label className="flex items-center gap-3 p-4 bg-surface-50 rounded-2xl border border-surface-300 cursor-pointer hover:border-amber-400 transition-colors">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-5 h-5 rounded text-amber-500 focus:ring-amber-400"
              />
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Featured
                </div>
                <div className="text-[10px] text-slate-500">Hero & homepage spotlight</div>
              </div>
            </label>

            {/* Trending Switch */}
            <label className="flex items-center gap-3 p-4 bg-surface-50 rounded-2xl border border-surface-300 cursor-pointer hover:border-rose-400 transition-colors">
              <input
                type="checkbox"
                checked={formData.isTrending}
                onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                className="w-5 h-5 rounded text-rose-500 focus:ring-rose-400"
              />
              <div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-rose-500" /> Trending
                </div>
                <div className="text-[10px] text-slate-500">Hot deal ribbon</div>
              </div>
            </label>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4">
          <Link
            to="/admin/products"
            className="w-full sm:w-auto text-center px-5 py-3 bg-surface-100 hover:bg-surface-200 text-slate-700 text-xs font-bold rounded-xl transition-colors border border-surface-300 min-h-[44px] flex items-center justify-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 disabled:opacity-50 min-h-[44px]"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : isEditMode ? 'Update Product' : 'Publish Product'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProductFormPage;