import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Flame,
  Zap,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { formatCurrency, getPlatformConfig } from '../utils/helpers';

const BannerHero = ({ featuredProduct }) => {
  const platformConfig = featuredProduct ? getPlatformConfig(featuredProduct.affiliatePlatform) : null;

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900 via-brand-950 to-slate-950 text-white p-6 sm:p-10 lg:p-14 shadow-2xl border border-brand-800/40">
      {/* Background ambient glow shapes */}
      <div className="absolute top-0 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-brand-400/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-10 w-60 sm:w-80 h-60 sm:h-80 bg-brand-300/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Headline & CTAs */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-800/60 border border-brand-400/30 text-brand-100 text-xs font-bold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-brand-300" />
              <span>Smart Affiliate Shopping & Deal Discovery</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-4xl lg:text-6xl font-black tracking-tight leading-[1.15] text-white">
              Discover Handpicked Deals at <span className="text-brand-200 underline decoration-brand-300 decoration-wavy decoration-2">Best Prices</span>
            </h1>

            {/* Description */}
            <p className="text-brand-100 text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal">
              We curate verified discounts and trending products from <span className="text-amber-300 font-bold">Amazon</span>, <span className="text-sky-200 font-bold">Flipkart</span>, and <span className="text-pink-200 font-bold">Myntra</span>. Browse, compare, and click directly to official retailers to grab the best offers.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
              <Link
                to="/products"
                className="w-full sm:w-auto bg-white hover:bg-surface-50 text-brand-900 font-black px-6 sm:px-7 py-3.5 rounded-2xl transition-all duration-200 shadow-lg shadow-black/10 flex items-center justify-center gap-2 text-sm sm:text-base group min-h-[48px]"
              >
                <span>Browse All Deals</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-brand-600" />
              </Link>

              <Link
                to="/products?trending=true"
                className="w-full sm:w-auto bg-brand-800/80 hover:bg-brand-800 text-white font-bold px-5 sm:px-6 py-3.5 rounded-2xl transition-colors border border-brand-400/30 flex items-center justify-center gap-2 text-sm sm:text-base backdrop-blur-sm min-h-[48px]"
              >
                <Flame className="w-4 h-4 text-rose-300" />
                <span>Trending Now</span>
              </Link>
            </div>

            {/* Value Trust Bar */}
            <div className="pt-5 sm:pt-6 grid grid-cols-3 gap-2 sm:gap-4 border-t border-brand-500/40 max-w-lg mx-auto lg:mx-0 text-left">
              <div>
                <div className="text-lg sm:text-2xl font-black text-white">100%</div>
                <div className="text-[10px] sm:text-[11px] text-brand-200 font-medium">Verified Stores</div>
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-black text-brand-200">0%</div>
                <div className="text-[10px] sm:text-[11px] text-brand-200 font-medium">Extra Fees</div>
              </div>
              <div>
                <div className="text-lg sm:text-2xl font-black text-amber-200">24/7</div>
                <div className="text-[10px] sm:text-[11px] text-brand-200 font-medium">Live Deal Drops</div>
              </div>
            </div>
          </div>

          {/* Right Column: Featured Spotlight Card */}
          <div className="lg:col-span-5">
            {featuredProduct ? (
              <div className="bg-white text-slate-900 border border-brand-200 rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-4 right-4 bg-brand-500 text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow flex items-center gap-1 z-10">
                  <Zap className="w-3.5 h-3.5 fill-current" /> TOP PICK
                </div>

                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-surface-100 mb-4 sm:mb-5 relative border border-surface-200 flex items-center justify-center p-2">
                  <img
                    src={featuredProduct.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'}
                    alt={featuredProduct.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
                    {featuredProduct.affiliatePlatform || 'Amazon'}
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-bold text-brand-600 uppercase tracking-wider block">
                    {featuredProduct.brand || 'Featured'} • {featuredProduct.category?.name || 'General'}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-2 leading-snug">
                    {featuredProduct.name}
                  </h3>

                  <div className="flex flex-wrap items-baseline gap-2 sm:gap-3 pt-1">
                    <span className="text-xl sm:text-2xl font-black text-brand-700">
                      {formatCurrency(featuredProduct.price)}
                    </span>
                    {featuredProduct.originalPrice && featuredProduct.originalPrice > featuredProduct.price && (
                      <span className="text-xs sm:text-sm text-slate-400 line-through">
                        {formatCurrency(featuredProduct.originalPrice)}
                      </span>
                    )}
                    {featuredProduct.discountPercentage > 0 && (
                      <span className="text-xs font-extrabold text-brand-700 bg-brand-100 border border-brand-300 px-2 py-0.5 rounded-md">
                        {featuredProduct.discountPercentage}% OFF
                      </span>
                    )}
                  </div>

                  <div className="pt-2 grid grid-cols-2 gap-2">
                    <Link
                      to={`/product/${featuredProduct.slug}`}
                      className="text-center py-2.5 bg-surface-100 hover:bg-surface-200 text-slate-800 text-xs font-bold rounded-xl transition-colors border border-surface-300 min-h-[44px] flex items-center justify-center"
                    >
                      View Details
                    </Link>

                    <a
                      href={`/api/products/${featuredProduct._id}/click`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-center py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1 shadow-sm min-h-[44px]"
                    >
                      <span>{featuredProduct.buyButtonText || 'Buy Now'}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/20 text-center space-y-4 text-white">
                <ShoppingBag className="w-12 h-12 text-brand-200 mx-auto" />
                <h3 className="text-lg font-bold">Smart Affiliate Catalog</h3>
                <p className="text-xs text-brand-100 leading-relaxed">
                  Discover trending electronics, home decor, fashion, and lifestyle items.
                </p>
                <Link
                  to="/products"
                  className="inline-block bg-white text-brand-900 text-xs font-bold px-5 py-2.5 rounded-xl shadow min-h-[44px]"
                >
                  Explore All Products
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BannerHero;