import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
  Flame,
  X,
  PackageOpen,
  Filter,
} from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import FilterSidebar from '../components/FilterSidebar';
import Pagination from '../components/Pagination';
import { useWishlist } from '../context/WishlistContext';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL query state parameters
  const searchQuery = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || 'all';
  const selectedPlatform = searchParams.get('platform') || 'all';
  const selectedBrand = searchParams.get('brand') || 'all';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const isFeatured = searchParams.get('featured') === 'true';
  const isTrending = searchParams.get('trending') === 'true';
  const isSavedOnly = searchParams.get('saved') === 'true';
  const sort = searchParams.get('sort') || 'newest';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filterMeta, setFilterMeta] = useState({ brands: [], platforms: [] });
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(pageParam);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const { wishlist } = useWishlist();

  // Helper to update individual URL query params cleanly
  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === undefined || value === null || value === '' || value === 'all' || value === false) {
      newParams.delete(key);
    } else {
      newParams.set(key, String(value));
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  // Reset all active filters
  const handleResetFilters = () => {
    setSearchParams({});
    setCurrentPage(1);
  };

  // Fetch Categories and Brands metadata for filter sidebar
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catsRes, prodsRes] = await Promise.all([
          api.getCategories(),
          api.getProducts({ limit: 100 }),
        ]);

        if (catsRes.success && catsRes.data) {
          setCategories(catsRes.data);
        }

        if (prodsRes.success && prodsRes.data) {
          const brands = Array.from(
            new Set(prodsRes.data.map((p) => p.brand).filter(Boolean))
          );
          const platforms = Array.from(
            new Set(prodsRes.data.map((p) => p.affiliatePlatform).filter(Boolean))
          );
          setFilterMeta({ brands, platforms });
        }
      } catch (err) {
        console.error('Filter metadata load error:', err);
      }
    };

    fetchMetadata();
  }, []);

  // Fetch filtered catalog products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        if (isSavedOnly) {
          setProducts(wishlist);
          setTotalCount(wishlist.length);
          setTotalPages(1);
          setLoading(false);
          return;
        }

        const params = {
          page: currentPage,
          limit: 12,
          sort,
        };

        if (searchQuery) params.search = searchQuery;
        if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory;
        if (selectedPlatform && selectedPlatform !== 'all') params.platform = selectedPlatform;
        if (selectedBrand && selectedBrand !== 'all') params.brand = selectedBrand;
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (isFeatured) params.isFeatured = 'true';
        if (isTrending) params.isTrending = 'true';

        const res = await api.getProducts(params);
        if (res.success && res.data) {
          setProducts(res.data);
          setTotalPages(res.totalPages || 1);
          setTotalCount(res.total || res.data.length);
        }
      } catch (err) {
        console.error('Product catalog fetch error:', err);
        setProducts([]);
      } finally {
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    fetchProducts();
  }, [
    searchQuery,
    selectedCategory,
    selectedPlatform,
    selectedBrand,
    minPrice,
    maxPrice,
    isFeatured,
    isTrending,
    isSavedOnly,
    sort,
    currentPage,
    wishlist,
  ]);

  const hasActiveFilters =
    Boolean(searchQuery) ||
    (selectedCategory && selectedCategory !== 'all') ||
    (selectedPlatform && selectedPlatform !== 'all') ||
    (selectedBrand && selectedBrand !== 'all') ||
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    isFeatured ||
    isTrending ||
    isSavedOnly;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 min-w-0">
      {/* Header & Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-200 pb-5 min-w-0">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight break-words">
            {isSavedOnly
              ? 'Saved Wishlist Deals'
              : searchQuery
              ? `Results for "${searchQuery}"`
              : selectedCategory && selectedCategory !== 'all'
              ? `${categories.find((c) => c.slug === selectedCategory)?.name || 'Category'} Deals`
              : 'All Curated Deals & Products'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Showing {totalCount} verified products across top affiliate networks
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs min-h-[44px] flex-1 sm:flex-none"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-1.5 bg-white border border-surface-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs min-h-[44px] flex-1 sm:flex-none justify-center sm:justify-start">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="bg-transparent outline-none cursor-pointer pr-1 text-xs font-semibold w-full sm:w-auto"
              aria-label="Sort products by"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
              <option value="featured">Featured Picks</option>
              <option value="discount">Highest Discount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-1 min-w-0">
          <span className="text-xs font-semibold text-slate-400 mr-1">Active:</span>

          {searchQuery && (
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-slate-200 text-slate-800 px-2.5 py-1 rounded-full max-w-[220px]">
              <span className="truncate">Search: "{searchQuery}"</span>
              <button onClick={() => updateParam('search', '')} aria-label="Clear search filter" className="shrink-0">
                <X className="w-3.5 h-3.5 text-slate-500 hover:text-slate-900" />
              </button>
            </span>
          )}

          {selectedCategory && selectedCategory !== 'all' && (
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-brand-100 text-brand-800 px-2.5 py-1 rounded-full max-w-[220px]">
              <span className="truncate">Category: {categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}</span>
              <button onClick={() => updateParam('category', 'all')} aria-label="Clear category filter" className="shrink-0">
                <X className="w-3.5 h-3.5 text-brand-600 hover:text-brand-900" />
              </button>
            </span>
          )}

          {selectedPlatform && selectedPlatform !== 'all' && (
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">
              <span>Store: {selectedPlatform}</span>
              <button onClick={() => updateParam('platform', 'all')} aria-label="Clear store filter" className="shrink-0">
                <X className="w-3.5 h-3.5 text-amber-600 hover:text-amber-900" />
              </button>
            </span>
          )}

          {selectedBrand && selectedBrand !== 'all' && (
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-sky-100 text-sky-800 px-2.5 py-1 rounded-full max-w-[180px]">
              <span className="truncate">Brand: {selectedBrand}</span>
              <button onClick={() => updateParam('brand', 'all')} aria-label="Clear brand filter" className="shrink-0">
                <X className="w-3.5 h-3.5 text-sky-600 hover:text-sky-900" />
              </button>
            </span>
          )}

          {isFeatured && (
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">
              <span>Featured Deals</span>
              <button onClick={() => updateParam('featured', false)} aria-label="Clear featured filter" className="shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {isTrending && (
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full">
              <span>Trending Hot</span>
              <button onClick={() => updateParam('trending', false)} aria-label="Clear trending filter" className="shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          <button
            onClick={handleResetFilters}
            className="text-xs text-brand-600 hover:underline font-semibold ml-2 inline-flex items-center gap-1 min-h-[36px]"
          >
            <RotateCcw className="w-3 h-3" /> Clear All
          </button>
        </div>
      )}

      {/* Main Catalog Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 items-start min-w-0">
        {/* Left Filter Sidebar */}
        <FilterSidebar
          categories={categories}
          brands={filterMeta.brands}
          platforms={filterMeta.platforms.length > 0 ? filterMeta.platforms : ['Amazon', 'Flipkart', 'Myntra']}
          selectedCategory={selectedCategory}
          setSelectedCategory={(val) => updateParam('category', val)}
          selectedPlatform={selectedPlatform}
          setSelectedPlatform={(val) => updateParam('platform', val)}
          selectedBrand={selectedBrand}
          setSelectedBrand={(val) => updateParam('brand', val)}
          minPrice={minPrice}
          setMinPrice={(val) => updateParam('minPrice', val)}
          maxPrice={maxPrice}
          setMaxPrice={(val) => updateParam('maxPrice', val)}
          isFeatured={isFeatured}
          setIsFeatured={(val) => updateParam('featured', val)}
          isTrending={isTrending}
          setIsTrending={(val) => updateParam('trending', val)}
          onReset={handleResetFilters}
          isOpen={isMobileFilterOpen}
          onClose={() => setIsMobileFilterOpen(false)}
        />

        {/* Right Product Grid */}
        <main className="lg:col-span-3 space-y-6 min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl border border-surface-300 p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto shadow-soft">
              <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <PackageOpen className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No matching products found</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                We couldn't find any products matching your active filters or search terms. Try adjusting or resetting your filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors inline-flex items-center gap-1.5 min-h-[44px]"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
              </button>
            </div>
          ) : (
            <>
              {/* Responsive Grid: 2 cols on mobile (320-767px), 3 on tablet (768-1023px), 4 on laptop/desktop */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProductsPage;