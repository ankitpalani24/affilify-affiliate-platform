import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Heart, Star, Flame, Sparkles, ArrowUpRight } from 'lucide-react';
import { formatCurrency, getPlatformConfig } from '../utils/helpers';
import { useWishlist } from '../context/WishlistContext';

const ProductCard = ({ product }) => {
  const [imgSrc, setImgSrc] = useState(
    product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'
  );
  const [isRedirecting, setIsRedirecting] = useState(false);

  const { isInWishlist, toggleWishlist } = useWishlist();
  const isSaved = isInWishlist(product._id);
  const platformConfig = getPlatformConfig(product.affiliatePlatform);

  // Direct affiliate click redirect handler with backend tracking
  const handleBuyNow = (e) => {
    e.stopPropagation();
    setIsRedirecting(true);

    const redirectUrl = `/api/products/${product._id}/click`;
    window.open(redirectUrl, '_blank', 'noopener,noreferrer');

    setTimeout(() => {
      setIsRedirecting(false);
    }, 1500);
  };

  const discount =
    product.discountPercentage ||
    (product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0);

  return (
    <div className="group bg-white rounded-2xl border border-surface-300 hover:border-brand-400 shadow-xs hover:shadow-card transition-all duration-300 flex flex-col h-full overflow-hidden relative">
      {/* Top Badges & Image Frame */}
      <div className="relative aspect-square w-full bg-white overflow-hidden border-b border-surface-200 p-2 sm:p-3 flex items-center justify-center">
        {/* Main Product Image (Object Contain prevents any stretching) */}
        <Link to={`/product/${product.slug}`} className="w-full h-full flex items-center justify-center">
          <img
            src={imgSrc}
            alt={product.name}
            onError={() =>
              setImgSrc('https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600')
            }
            loading="lazy"
            className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Platform & Status Ribbons (Top Left) */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start max-w-[70%]">
          <span
            className={`text-[9px] sm:text-[11px] font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg shadow-xs backdrop-blur-md truncate ${platformConfig.badge}`}
          >
            {product.affiliatePlatform || 'Store'}
          </span>

          {product.isTrending && (
            <span className="bg-rose-500 text-white text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
              <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" /> Hot
            </span>
          )}

          {product.isFeatured && !product.isTrending && (
            <span className="bg-brand-600 text-white text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Pick
            </span>
          )}
        </div>

        {/* Wishlist Button (Top Right) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          aria-label={isSaved ? "Remove from wishlist" : "Save to wishlist"}
          className={`absolute top-2 right-2 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-200 shadow-xs ${
            isSaved
              ? 'bg-rose-500 text-white'
              : 'bg-white/95 text-slate-600 hover:text-rose-500 hover:bg-white backdrop-blur-sm border border-slate-200'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute bottom-2 right-2 z-10 bg-brand-600 text-white text-[9px] sm:text-xs font-black px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg shadow-xs">
            {discount}% OFF
          </div>
        )}
      </div>

      {/* Product Content Body */}
      <div className="p-2.5 sm:p-4 md:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category Info */}
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-400 mb-1 gap-1">
            <span className="font-bold text-brand-700 tracking-wider uppercase text-[9px] sm:text-[11px] truncate">
              {product.brand || 'Amazon Pick'}
            </span>
            {product.category && (
              <span className="text-[9px] sm:text-[11px] text-slate-500 truncate hidden sm:inline">
                {product.category?.name || ''}
              </span>
            )}
          </div>

          {/* Product Title */}
          <Link to={`/product/${product.slug}`} className="block group-hover:text-brand-700 transition-colors">
            <h3
              className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug mb-1.5"
              title={product.name}
            >
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1 sm:gap-1.5 mb-2 sm:mb-3">
            <div className="flex items-center gap-0.5 bg-amber-50 text-amber-800 px-1 sm:px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-bold border border-amber-200">
              <Star className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-500" />
              <span>{product.rating || 4.5}</span>
            </div>
            <span className="text-[9px] sm:text-[11px] text-slate-400 truncate">
              ({product.reviewCount || 120})
            </span>
          </div>
        </div>

        {/* Price & Action Buttons */}
        <div className="pt-2 sm:pt-3 border-t border-surface-200">
          <div className="flex flex-wrap items-baseline gap-1 sm:gap-2 mb-2 sm:mb-3">
            <span className="text-sm sm:text-lg md:text-xl font-black text-slate-900">
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            {/* View Details */}
            <Link
              to={`/product/${product.slug}`}
              className="w-full text-center py-2 px-1.5 sm:px-3 bg-surface-100 hover:bg-surface-200 text-slate-800 text-[11px] sm:text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1 border border-surface-300 min-h-[36px] sm:min-h-[40px]"
            >
              Details
            </Link>

            {/* Direct Buy Now (Affiliate redirect) */}
            <button
              onClick={handleBuyNow}
              disabled={isRedirecting}
              className={`w-full py-2 px-1.5 sm:px-3 text-[11px] sm:text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 shadow-xs active:scale-95 min-h-[36px] sm:min-h-[40px] truncate ${platformConfig.btnBg}`}
              title={product.buyButtonText || 'Buy on Store'}
            >
              <span className="truncate">{isRedirecting ? 'Redirecting...' : 'Buy Now'}</span>
              <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
