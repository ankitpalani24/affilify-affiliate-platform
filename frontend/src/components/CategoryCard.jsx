import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Tag } from 'lucide-react';

const CategoryCard = ({ category }) => {
  const [imgSrc, setImgSrc] = useState(
    category.image || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=200'
  );

  return (
    <Link
      to={`/products?category=${category.slug}`}
      className="group relative overflow-hidden rounded-2xl bg-white border border-surface-300 hover:border-brand-500/50 p-2.5 sm:p-4 transition-all duration-300 hover:shadow-card flex flex-col justify-between min-w-0"
    >
      <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
        {/* Category Image Avatar */}
        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-surface-100 shrink-0 border border-surface-200">
          <img
            src={imgSrc}
            alt={category.name}
            onError={() =>
              setImgSrc('https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=200')
            }
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xs sm:text-sm md:text-base font-bold text-slate-900 group-hover:text-brand-700 transition-colors truncate">
            {category.name}
          </h3>
          <p className="text-[10px] sm:text-xs text-slate-400 line-clamp-1 mt-0.5 hidden sm:block">
            {category.description || 'Explore curated deals'}
          </p>
          <div className="inline-flex items-center gap-1 text-[9px] sm:text-[11px] font-semibold text-brand-700 mt-1 sm:mt-2 bg-brand-50 px-1.5 sm:px-2 py-0.5 rounded-md">
            <Tag className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
            <span className="truncate">{category.productCount ? `${category.productCount} Deals` : 'Deals'}</span>
          </div>
        </div>
      </div>

      <div className="mt-2 sm:mt-3 pt-2 sm:pt-2.5 border-t border-surface-100 flex items-center justify-between text-[10px] sm:text-xs font-semibold text-slate-600 group-hover:text-brand-700">
        <span>Browse</span>
        <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 transform group-hover:translate-x-1 transition-transform shrink-0" />
      </div>
    </Link>
  );
};

export default CategoryCard;