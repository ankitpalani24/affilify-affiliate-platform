import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Heart,
  Menu,
  X,
  ShoppingBag,
  Flame,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Tag,
  ExternalLink,
} from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import api from '../services/api';
import { formatCurrency, getPlatformConfig } from '../utils/helpers';

const Navbar = () => {
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);
  const mobileSearchInputRef = useRef(null);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.getCategories();
        if (res.success && res.data) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error('Navbar category load error:', err);
      }
    };
    fetchCats();
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setShowSuggestions(false);
    setIsMobileSearchOpen(false);
  }, [location.pathname, location.search]);

  // Focus mobile search input when opened
  useEffect(() => {
    if (isMobileSearchOpen && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus();
    }
  }, [isMobileSearchOpen]);

  // Handle instant search suggestions debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        try {
          const res = await api.getProducts({ search: searchQuery.trim(), limit: 5 });
          if (res.success) {
            setSuggestions(res.data);
            setShowSuggestions(true);
          }
        } catch (err) {
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      setIsMobileSearchOpen(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-surface-200 transition-all">
      {/* Top Value / Trust Ticker (Desktop & Tablet) */}
      <div className="bg-brand-900 text-brand-100 text-[11px] py-1.5 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse shrink-0"></span>
            <span className="truncate">
              Handpicked verified discounts from <strong>Amazon</strong>, <strong>Flipkart</strong> & <strong>Myntra</strong>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-[11px] text-brand-200 shrink-0">
            <Link to="/affiliate-disclosure" className="hover:text-white transition-colors">
              Affiliate Transparency
            </Link>
            <span>|</span>
            <Link to="/admin/login" className="hover:text-white transition-colors font-semibold text-brand-300">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-6">
          {/* Left: Mobile Menu Button + Brand Logo */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 min-w-0">
            {/* Hamburger Toggle (Mobile / Tablet < 1024px) */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 -ml-1 text-slate-700 hover:text-brand-600 hover:bg-surface-100 rounded-xl transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Toggle Navigation Menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-2 min-w-0 group py-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-md shadow-brand-500/25 shrink-0 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-lg sm:text-2xl font-black text-brand-950 tracking-tight block leading-none">
                  Affil<span className="text-brand-500">ify</span>
                </span>
                <span className="hidden sm:block text-[9px] uppercase tracking-widest font-bold text-slate-400 mt-0.5">
                  Curated Deals
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Search Input with Instant Suggestions */}
          <div ref={searchRef} className="hidden lg:block flex-1 max-w-xl relative">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search deals, electronics, fashion, home decor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                className="w-full bg-surface-100 text-slate-800 placeholder-slate-400 text-xs sm:text-sm rounded-2xl pl-11 pr-24 py-3 border border-surface-300 focus:border-brand-500 focus:bg-white focus:ring-3 focus:ring-brand-500/15 outline-none transition-all"
              />
              <Search className="w-4 h-4 text-brand-600 absolute left-4 top-1/2 -translate-y-1/2" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-4 py-1.5 rounded-xl transition-all shadow-xs"
              >
                Search
              </button>
            </form>

            {/* Instant Search Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-surface-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-2 border-b border-surface-100 flex items-center justify-between text-[11px] font-bold text-slate-400">
                  <span>Product Matches</span>
                  <span>{suggestions.length} results</span>
                </div>
                <div className="divide-y divide-surface-100 max-h-80 overflow-y-auto">
                  {suggestions.map((p) => {
                    const platformCfg = getPlatformConfig(p.affiliatePlatform);
                    return (
                      <Link
                        key={p._id}
                        to={`/product/${p.slug}`}
                        onClick={() => setShowSuggestions(false)}
                        className="p-3 flex items-center gap-3 hover:bg-surface-50 transition-colors group"
                      >
                        <img
                          src={p.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                          alt={p.name}
                          className="w-11 h-11 object-contain rounded-lg bg-surface-100 shrink-0 border border-surface-200 p-1"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-slate-800 truncate group-hover:text-brand-600">
                            {p.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-bold text-brand-900">
                              {formatCurrency(p.price)}
                            </span>
                            {p.originalPrice && p.originalPrice > p.price && (
                              <span className="text-[11px] text-slate-400 line-through">
                                {formatCurrency(p.originalPrice)}
                              </span>
                            )}
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${platformCfg.bg}`}>
                              {p.affiliatePlatform}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    );
                  })}
                </div>
                <div className="p-2.5 bg-surface-50 text-center border-t border-surface-100">
                  <button
                    onClick={handleSearchSubmit}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 min-h-[36px]"
                  >
                    View all results for "{searchQuery}" <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <nav className="flex items-center gap-1 sm:gap-3 shrink-0">
            {/* Mobile Search Toggle Icon */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="lg:hidden p-2 text-slate-700 hover:text-brand-600 hover:bg-surface-100 rounded-xl transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Toggle Search Bar"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Explore Deals (Desktop & Tablet) */}
            <Link
              to="/products"
              className="hidden sm:flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-brand-600 px-3 py-2 rounded-xl hover:bg-brand-50 transition-colors min-h-[44px]"
            >
              <Layers className="w-4 h-4 text-brand-600" />
              <span>All Deals</span>
            </Link>

            {/* Featured Deals Link (Desktop) */}
            <Link
              to="/products?featured=true"
              className="hidden xl:flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-800 hover:text-amber-900 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors min-h-[44px]"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Featured</span>
            </Link>

            {/* Saved Wishlist Icon */}
            <Link
              to="/products?saved=true"
              className="relative p-2.5 text-slate-700 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] flex items-center justify-center"
              title="Saved Wishlist Deals"
              aria-label={`Wishlist (${wishlistCount} items)`}
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-white animate-scale">
                  {wishlistCount}
                </span>
              )}
            </Link>
          </nav>
        </div>

        {/* Mobile Expandable Search Bar */}
        {isMobileSearchOpen && (
          <div className="lg:hidden pb-3 pt-1 border-t border-surface-200 animate-in fade-in slide-in-from-top-2 duration-150">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  ref={mobileSearchInputRef}
                  type="text"
                  placeholder="Search Amazon, Flipkart deals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface-100 text-slate-800 placeholder-slate-400 text-xs rounded-xl pl-9 pr-3 py-2.5 border border-surface-300 focus:border-brand-500 focus:bg-white outline-none min-h-[44px]"
                />
                <Search className="w-4 h-4 text-brand-600 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              <button
                type="submit"
                className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs shrink-0 min-h-[44px]"
              >
                Search
              </button>
            </form>
          </div>
        )}

        {/* Secondary Category Navigation Bar (Desktop & Tablet Horizontal Strip) */}
        <div className="hidden md:flex items-center gap-5 py-2.5 border-t border-surface-200 text-xs font-medium text-slate-600 overflow-x-auto no-scrollbar">
          <Link
            to="/products"
            className="hover:text-brand-600 font-bold text-brand-900 whitespace-nowrap flex items-center gap-1 shrink-0 py-1"
          >
            <Layers className="w-3.5 h-3.5 text-brand-600" />
            <span>All Deals</span>
          </Link>
          <Link
            to="/products?featured=true"
            className="hover:text-brand-600 whitespace-nowrap flex items-center gap-1 font-semibold shrink-0 py-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Featured</span>
          </Link>
          <Link
            to="/products?trending=true"
            className="hover:text-brand-600 whitespace-nowrap flex items-center gap-1 font-semibold shrink-0 py-1"
          >
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            <span>Trending Now</span>
          </Link>
          <span className="text-surface-300 shrink-0">|</span>
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/products?category=${cat.slug}`}
              className="hover:text-brand-600 whitespace-nowrap transition-colors shrink-0 py-1"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile Drawer Navigation (Backdrop + Menu) */}
      {isMenuOpen && (
        <>
          <div
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          />
          <div className="fixed top-0 left-0 bottom-0 w-[min(85vw,340px)] bg-white z-50 shadow-2xl flex flex-col justify-between overflow-y-auto p-5 animate-in slide-in-from-left duration-200 border-r border-surface-200">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-surface-200 pb-4">
                <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <span className="text-lg font-black text-brand-950">
                    Affil<span className="text-brand-500">ify</span>
                  </span>
                </Link>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Quick Links */}
              <div className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1">
                  Main Navigation
                </div>
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-slate-800 hover:bg-brand-50 rounded-xl min-h-[44px]"
                >
                  <ShoppingBag className="w-4 h-4 text-brand-600" />
                  <span>Home</span>
                </Link>
                <Link
                  to="/products"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-slate-800 hover:bg-brand-50 rounded-xl min-h-[44px]"
                >
                  <Layers className="w-4 h-4 text-brand-600" />
                  <span>All Deals & Products</span>
                </Link>
                <Link
                  to="/products?featured=true"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-xl min-h-[44px]"
                >
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Featured Handpicked</span>
                </Link>
                <Link
                  to="/products?trending=true"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-semibold text-rose-900 bg-rose-50 hover:bg-rose-100 rounded-xl min-h-[44px]"
                >
                  <Flame className="w-4 h-4 text-rose-600" />
                  <span>Trending Now</span>
                </Link>
              </div>

              {/* Retailer Store Filters */}
              <div className="border-t border-surface-200 pt-4 space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1">
                  Stores
                </div>
                <Link
                  to="/products?platform=Amazon"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-surface-100 rounded-xl min-h-[44px]"
                >
                  <span>Amazon Deals</span>
                  <span className="text-[10px] font-bold bg-[#FF9900]/15 text-[#b36b00] px-2 py-0.5 rounded">Store</span>
                </Link>
                <Link
                  to="/products?platform=Flipkart"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-surface-100 rounded-xl min-h-[44px]"
                >
                  <span>Flipkart Offers</span>
                  <span className="text-[10px] font-bold bg-[#2874F0]/15 text-[#1e5ec6] px-2 py-0.5 rounded">Store</span>
                </Link>
                <Link
                  to="/products?platform=Myntra"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-surface-100 rounded-xl min-h-[44px]"
                >
                  <span>Myntra Fashion</span>
                  <span className="text-[10px] font-bold bg-[#FF3F6C]/15 text-[#c41b43] px-2 py-0.5 rounded">Store</span>
                </Link>
              </div>

              {/* Categories */}
              {categories.length > 0 && (
                <div className="border-t border-surface-200 pt-4 space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1">
                    Departments
                  </div>
                  {categories.map((cat) => (
                    <Link
                      key={cat._id}
                      to={`/products?category=${cat.slug}`}
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-3 py-2 text-sm font-medium text-slate-600 hover:text-brand-700 hover:bg-brand-50 rounded-xl min-h-[40px] flex items-center truncate"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="border-t border-surface-200 pt-4 space-y-2">
              <Link
                to="/admin/login"
                onClick={() => setIsMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-surface-100 hover:bg-brand-50 text-slate-700 hover:text-brand-700 text-xs font-bold py-2.5 rounded-xl border border-surface-300 min-h-[44px]"
              >
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                <span>Admin Control Panel</span>
              </Link>
              <Link
                to="/affiliate-disclosure"
                onClick={() => setIsMenuOpen(false)}
                className="block text-center text-[11px] text-slate-400 hover:text-slate-600 py-1"
              >
                Affiliate Transparency Disclosure
              </Link>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Navbar;