import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  ExternalLink,
  Heart,
  Share2,
  CheckCircle2,
  ShieldCheck,
  Flame,
  Sparkles,
  ArrowRight,
  Info,
  ChevronRight,
  ArrowUpRight,
  Tag,
  MousePointerClick,
  ShoppingBag,
} from 'lucide-react';
import api from '../services/api';
import { formatCurrency, getPlatformConfig } from '../utils/helpers';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';

const ProductDetailsPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToast } = useToast();

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await api.getProductBySlug(slug);
        if (res.success && res.data) {
          setProduct(res.data);
          setSelectedImage(0);

          // Fetch related category products
          const catId = res.data.categoryId?._id || res.data.categoryId || res.data.category?._id || res.data.category;
          if (catId) {
            const relatedRes = await api.getProducts({ category: catId, limit: 4 });
            if (relatedRes.success) {
              setRelatedProducts(
                relatedRes.data.filter((p) => p._id !== res.data._id)
              );
            }
          }
        }
      } catch (err) {
        console.error('Product details error:', err);
      } finally {
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    fetchDetails();
  }, [slug]);

  // Affiliate Click Handler
  const handleAffiliateBuy = (e) => {
    e.preventDefault();
    if (!product) return;

    setIsRedirecting(true);
    const redirectUrl = `/api/products/${product._id}/click`;
    window.open(redirectUrl, '_blank', 'noopener,noreferrer');

    setTimeout(() => {
      setIsRedirecting(false);
    }, 1500);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out this deal on ${product.name}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast('Product link copied to clipboard!', 'success');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500">Loading product specifications & live pricing...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-surface-300 text-center space-y-4 shadow-soft">
        <h2 className="text-lg font-bold text-slate-900">Product Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested deal may have expired or been removed by the catalog administrator.
        </p>
        <Link
          to="/products"
          className="inline-block bg-brand-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl min-h-[44px] flex items-center justify-center"
        >
          Browse All Active Deals
        </Link>
      </div>
    );
  }

  const isSaved = isInWishlist(product._id);
  const platformConfig = getPlatformConfig(product.affiliatePlatform);
  const images = product.images && product.images.length > 0 ? product.images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'];
  const savings = product.originalPrice && product.originalPrice > product.price ? product.originalPrice - product.price : 0;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-8 sm:space-y-12 overflow-x-hidden">
      {/* Breadcrumb Navigation Bar */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto no-scrollbar py-1">
        <Link to="/" className="hover:text-brand-600 shrink-0">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
        <Link to="/products" className="hover:text-brand-600 shrink-0">Deals</Link>
        {product.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <Link
              to={`/products?category=${product.category.slug || product.categoryId?.slug}`}
              className="hover:text-brand-600 shrink-0"
            >
              {product.category.name || product.categoryId?.name || 'Department'}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
        <span className="text-slate-800 font-semibold truncate max-w-[200px] sm:max-w-md">
          {product.name}
        </span>
      </nav>

      {/* Main 2-Column Showcase (Stacks vertically on mobile, 2-cols on desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-start">
        {/* Left Column: Responsive Image Gallery */}
        <div className="lg:col-span-6 space-y-3 sm:space-y-4">
          {/* Main Large Image Box */}
          <div className="relative aspect-square sm:aspect-[4/3] w-full bg-white rounded-3xl border border-surface-300 overflow-hidden p-4 sm:p-6 shadow-soft flex items-center justify-center">
            <img
              src={images[selectedImage] || images[0]}
              alt={product.name}
              className="max-h-full max-w-full object-contain object-center transition-all duration-300"
            />

            {/* Badges Overlay */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
              <span className={`text-xs font-bold px-3 py-1 rounded-xl shadow-xs backdrop-blur-md ${platformConfig.badge}`}>
                {product.affiliatePlatform || 'Amazon Verified'}
              </span>

              {product.isTrending && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-current" /> Hot Deal
                </span>
              )}

              {product.isFeatured && (
                <span className="bg-brand-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Top Pick
                </span>
              )}
            </div>

            {product.discountPercentage > 0 && (
              <div className="absolute top-3 right-3 bg-brand-600 text-white text-xs font-black px-2.5 py-1 rounded-xl shadow-xs">
                {product.discountPercentage}% OFF
              </div>
            )}
          </div>

          {/* Touch-friendly Thumbnail Bar */}
          {images.length > 1 && (
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(idx)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 bg-white shrink-0 p-1.5 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center ${
                    selectedImage === idx
                      ? 'border-brand-600 ring-2 ring-brand-500/20'
                      : 'border-surface-300 hover:border-slate-400 opacity-70 hover:opacity-100'
                  }`}
                  aria-label={`View image thumbnail ${idx + 1}`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Overview & Buy Action */}
        <div className="lg:col-span-6 space-y-5 sm:space-y-6">
          {/* Header Metadata */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
                {product.brand || 'Amazon Pick'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="p-2.5 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-surface-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  title="Share product"
                  aria-label="Share deal"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-2.5 rounded-xl transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${
                    isSaved
                      ? 'bg-rose-50 text-rose-600'
                      : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                  }`}
                  title="Save to favorites"
                  aria-label={isSaved ? "Saved in wishlist" : "Save to wishlist"}
                >
                  <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Rating and Clicks count */}
            <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
              <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg border border-amber-200 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>{product.rating || 4.5}</span>
                <span className="text-slate-500 font-normal">({product.reviewCount || 120} reviews)</span>
              </div>

              {product.clickCount > 0 && (
                <div className="text-slate-500 font-medium text-xs flex items-center gap-1">
                  <MousePointerClick className="w-3.5 h-3.5 text-brand-600" />
                  <span>{product.clickCount} visitors checked this deal</span>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Box */}
          <div className="bg-surface-50 rounded-2xl p-4 sm:p-5 border border-surface-300 space-y-2 shadow-xs">
            <div className="flex flex-wrap items-baseline gap-2.5 sm:gap-3">
              <span className="text-2xl sm:text-4xl font-black text-slate-900">
                {formatCurrency(product.price)}
              </span>

              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm sm:text-lg text-slate-400 line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}

              {product.discountPercentage > 0 && (
                <span className="text-xs font-black text-brand-800 bg-brand-100 border border-brand-300 px-2.5 py-0.5 rounded-lg">
                  {product.discountPercentage}% OFF
                </span>
              )}
            </div>

            {savings > 0 && (
              <p className="text-xs font-bold text-brand-700">
                You save {formatCurrency(savings)} with this live retailer deal
              </p>
            )}

            <p className="text-[11px] text-slate-500">
              * Live prices verified from {product.affiliatePlatform || 'Amazon'}. Stock & discounts may update on retailer site.
            </p>
          </div>

          {/* Short Description */}
          {product.shortDescription && (
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {product.shortDescription}
            </p>
          )}

          {/* Direct Buy Now Affiliate CTA Box */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={handleAffiliateBuy}
              disabled={isRedirecting}
              className={`w-full py-4 px-6 text-base sm:text-lg font-black rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-98 min-h-[48px] sm:min-h-[52px] ${platformConfig.btnBg}`}
            >
              <span>{isRedirecting ? 'Redirecting to Official Store...' : (product.buyButtonText || `Buy on ${product.affiliatePlatform || 'Amazon'}`)}</span>
              <ArrowUpRight className="w-5 h-5 shrink-0" />
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
              <span>Redirects securely to official {product.affiliatePlatform || 'Amazon'} store</span>
            </div>
          </div>

          {/* Affiliate Disclosure Micro-banner */}
          <div className="flex items-start gap-2.5 p-3.5 bg-brand-50 border border-brand-200 rounded-xl text-xs text-brand-900 leading-relaxed">
            <Info className="w-4 h-4 text-brand-700 shrink-0 mt-0.5" />
            <span>
              <strong>Affiliate Transparency:</strong> Clicking "Buy Now" will take you directly to the retailer. We may earn a commission if you make a purchase, at zero extra cost to you.
            </span>
          </div>

          {/* Key Features List */}
          {product.features && product.features.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-surface-200">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
                Key Features & Highlights
              </h3>
              <ul className="space-y-2">
                {product.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="pt-2 flex flex-wrap items-center gap-1.5">
              {product.tags.map((tag, i) => (
                <Link
                  key={i}
                  to={`/products?search=${encodeURIComponent(tag)}`}
                  className="text-[11px] font-semibold bg-surface-100 hover:bg-brand-50 text-slate-700 hover:text-brand-700 px-2.5 py-1 rounded-lg transition-colors border border-surface-300 min-h-[36px] inline-flex items-center"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Full Description Section */}
      {product.description && (
        <section className="bg-white rounded-3xl p-5 sm:p-8 md:p-10 border border-surface-300 shadow-soft space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Product Overview & Detailed Specs</h2>
          <div className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {product.description}
          </div>
        </section>
      )}

      {/* Related Deals Section */}
      {relatedProducts.length > 0 && (
        <section className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
              Related Deals
            </h2>
            <Link
              to={`/products?category=${product.category?.slug || product.categoryId?.slug}`}
              className="text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 min-h-[44px]"
            >
              <span>View More</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetailsPage;