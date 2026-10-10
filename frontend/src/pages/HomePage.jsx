import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Sparkles,
  Layers,
  ArrowRight,
  ExternalLink,
  ShoppingBag,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Percent,
} from 'lucide-react';
import api from '../services/api';
import BannerHero from '../components/BannerHero';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import CategoryCard from '../components/CategoryCard';

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [heroProduct, setHeroProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        const [catsRes, trendingRes, featuredRes] = await Promise.all([
          api.getCategories(),
          api.getProducts({ isTrending: 'true', limit: 10 }),
          api.getProducts({ isFeatured: 'true', limit: 10 }),
        ]);

        if (catsRes.success && catsRes.data) {
          setCategories(catsRes.data);
        }

        if (trendingRes.success && trendingRes.data) {
          setTrendingProducts(trendingRes.data);
        }

        if (featuredRes.success && featuredRes.data) {
          setFeaturedProducts(featuredRes.data);
          if (featuredRes.data.length > 0) {
            setHeroProduct(featuredRes.data[0]);
          }
        }
      } catch (err) {
        console.error('Home page data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="space-y-10 sm:space-y-14 md:space-y-20 pb-16 overflow-x-hidden">
      {/* Dynamic Hero Spotlight Banner */}
      <BannerHero featuredProduct={heroProduct} />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-10 sm:space-y-14 md:space-y-20">
        {/* Top Categories Department Strip */}
        <section className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] sm:text-xs font-bold text-brand-600 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Explore Categories
              </span>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                Browse by Department
              </h2>
            </div>
            <Link
              to="/products"
              className="text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 group min-h-[44px]"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
            {categories.slice(0, 6).map((category) => (
              <CategoryCard key={category._id} category={category} />
            ))}
          </div>
        </section>

        {/* Trending Products Grid */}
        <section className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] sm:text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" /> High Demand
              </span>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                Trending Deals This Week
              </h2>
            </div>
            <Link
              to="/products?trending=true"
              className="text-xs sm:text-sm font-bold text-slate-700 hover:text-brand-600 flex items-center gap-1 min-h-[44px]"
            >
              <span>Explore Trending</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <ProductSkeleton key={i} />)
              : trendingProducts.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>

        {/* Multi-Platform Showcase Banner */}
        <section className="bg-gradient-to-r from-brand-50 via-surface-100 to-brand-100 rounded-3xl p-6 sm:p-10 border border-brand-200 shadow-soft">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-brand-700 bg-white px-3.5 py-1 rounded-full border border-brand-200 shadow-xs inline-block">
              Multi-Platform Aggregation
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-brand-950 tracking-tight">
              Shop Deals Directly on Your Favorite Stores
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
              Clicking any deal takes you straight to the retailer checkout with verified discounts and zero extra fees.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4">
              <Link
                to="/products?platform=Amazon"
                className="bg-[#FF9900] hover:bg-[#e68a00] text-slate-950 font-bold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all shadow-xs flex items-center gap-2 text-xs sm:text-sm min-h-[44px]"
              >
                <span>Amazon Deals</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>

              <Link
                to="/products?platform=Flipkart"
                className="bg-[#2874F0] hover:bg-[#1e5ec6] text-white font-bold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all shadow-xs flex items-center gap-2 text-xs sm:text-sm min-h-[44px]"
              >
                <span>Flipkart Offers</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>

              <Link
                to="/products?platform=Myntra"
                className="bg-[#FF3F6C] hover:bg-[#e02d58] text-white font-bold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all shadow-xs flex items-center gap-2 text-xs sm:text-sm min-h-[44px]"
              >
                <span>Myntra Fashion</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Handpicked Deals Section */}
        <section className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] sm:text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Editor's Choice
              </span>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                Featured Handpicked Selections
              </h2>
            </div>
            <Link
              to="/products?featured=true"
              className="text-xs sm:text-sm font-bold text-slate-700 hover:text-brand-600 flex items-center gap-1 min-h-[44px]"
            >
              <span>See All Featured</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => <ProductSkeleton key={i} />)
              : featuredProducts.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>

        {/* 3-Step Trust Section */}
        <section className="border border-surface-300 bg-white rounded-3xl p-6 sm:p-10 shadow-soft">
          <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8 space-y-1.5">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-brand-600">
              How Affilify Works
            </span>
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
              Seamless Deal Discovery in 3 Simple Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-center">
            <div className="space-y-2.5 p-4 sm:p-5 rounded-2xl bg-surface-50 border border-surface-200">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center mx-auto text-base sm:text-lg font-black border border-brand-200">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Browse & Compare</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Explore curated discounts across top brands, verified ratings, and genuine customer feedback.
              </p>
            </div>

            <div className="space-y-2.5 p-4 sm:p-5 rounded-2xl bg-surface-50 border border-surface-200">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-base sm:text-lg font-black border border-amber-200">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Click "Buy Now"</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Instantly redirect to official verified retailer portals (Amazon, Flipkart, Myntra) with active promo codes applied.
              </p>
            </div>

            <div className="space-y-2.5 p-4 sm:p-5 rounded-2xl bg-surface-50 border border-surface-200">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-base sm:text-lg font-black border border-emerald-200">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">Save Money Directly</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Complete your checkout directly on retailer sites with zero markup and 100% buyer protection.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
