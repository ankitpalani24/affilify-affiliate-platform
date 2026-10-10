import React from 'react';
import {
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  Flame,
  Check,
  X,
  ChevronDown,
} from 'lucide-react';

const FilterSidebar = ({
  categories = [],
  brands = [],
  platforms = ['Amazon', 'Flipkart', 'Myntra'],
  selectedCategory,
  setSelectedCategory,
  selectedPlatform,
  setSelectedPlatform,
  selectedBrand,
  setSelectedBrand,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  isFeatured,
  setIsFeatured,
  isTrending,
  setIsTrending,
  onReset,
  isOpen,
  onClose,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 lg:hidden"
        />
      )}

      {/* Main Filter Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-[min(88vw,360px)] lg:w-full bg-white border-r lg:border border-surface-300 lg:rounded-3xl p-5 lg:p-6 space-y-6 overflow-y-auto lg:overflow-visible transition-transform duration-300 ease-in-out shadow-xl lg:shadow-soft flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-surface-200 pb-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <SlidersHorizontal className="w-4 h-4 text-brand-600" />
              <span>Filters & Preferences</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onReset}
                className="text-xs text-brand-600 hover:text-brand-800 font-bold inline-flex items-center gap-1 p-1 min-h-[32px]"
                title="Reset All Filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="lg:hidden p-1 text-slate-400 hover:text-slate-700 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Special Deal Badges Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Deal Highlights
            </label>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer p-2.5 rounded-xl hover:bg-surface-100 transition-colors min-h-[44px]">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4 cursor-pointer"
                />
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Featured Deals</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer p-2.5 rounded-xl hover:bg-surface-100 transition-colors min-h-[44px]">
                <input
                  type="checkbox"
                  checked={isTrending}
                  onChange={(e) => setIsTrending(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer"
                />
                <Flame className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Trending Hot Deals</span>
              </label>
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Departments
            </label>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between min-h-[40px] ${
                  selectedCategory === 'all' || !selectedCategory
                    ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200'
                    : 'text-slate-600 hover:bg-surface-100'
                }`}
              >
                <span>All Departments</span>
                {(selectedCategory === 'all' || !selectedCategory) && (
                  <Check className="w-4 h-4 text-brand-600 shrink-0" />
                )}
              </button>

              {categories.map((cat) => (
                <button
                  key={cat._id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between min-h-[40px] ${
                    selectedCategory === cat.slug
                      ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200'
                      : 'text-slate-600 hover:bg-surface-100'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  {selectedCategory === cat.slug && (
                    <Check className="w-4 h-4 text-brand-600 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Platform / Store Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Online Retailer
            </label>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setSelectedPlatform('all')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between min-h-[40px] ${
                  selectedPlatform === 'all' || !selectedPlatform
                    ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200'
                    : 'text-slate-600 hover:bg-surface-100'
                }`}
              >
                <span>All Stores</span>
                {(selectedPlatform === 'all' || !selectedPlatform) && (
                  <Check className="w-4 h-4 text-brand-600 shrink-0" />
                )}
              </button>

              {platforms.map((plat) => (
                <button
                  key={plat}
                  type="button"
                  onClick={() => setSelectedPlatform(plat)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between min-h-[40px] ${
                    selectedPlatform === plat
                      ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200'
                      : 'text-slate-600 hover:bg-surface-100'
                  }`}
                >
                  <span>{plat}</span>
                  {selectedPlatform === plat && (
                    <Check className="w-4 h-4 text-brand-600 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Price Range (₹)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min ₹"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full bg-surface-50 border border-surface-300 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-brand-500 focus:bg-white min-h-[40px]"
              />
              <input
                type="number"
                placeholder="Max ₹"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full bg-surface-50 border border-surface-300 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-brand-500 focus:bg-white min-h-[40px]"
              />
            </div>
          </div>

          {/* Brand Filter */}
          {brands.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Brand
              </label>
              <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={() => setSelectedBrand('all')}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between min-h-[40px] ${
                    selectedBrand === 'all' || !selectedBrand
                      ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200'
                      : 'text-slate-600 hover:bg-surface-100'
                  }`}
                >
                  <span>All Brands</span>
                  {(selectedBrand === 'all' || !selectedBrand) && (
                    <Check className="w-4 h-4 text-brand-600 shrink-0" />
                  )}
                </button>

                {brands.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setSelectedBrand(b)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between min-h-[40px] ${
                      selectedBrand === b
                        ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200'
                        : 'text-slate-600 hover:bg-surface-100'
                    }`}
                  >
                    <span className="truncate">{b}</span>
                    {selectedBrand === b && (
                      <Check className="w-4 h-4 text-brand-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Drawer Bottom Apply CTA */}
        <div className="lg:hidden pt-4 border-t border-surface-200 sticky bottom-0 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-md min-h-[44px] flex items-center justify-center"
          >
            Apply Filters & View Results
          </button>
        </div>
      </aside>
    </>
  );
};

export default FilterSidebar;