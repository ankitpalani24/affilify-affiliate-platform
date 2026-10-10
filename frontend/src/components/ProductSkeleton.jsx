import React from 'react';

const ProductSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-4 animate-pulse">
      {/* Thumbnail */}
      <div className="aspect-square bg-slate-200 rounded-xl w-full"></div>
      
      {/* Meta */}
      <div className="space-y-2">
        <div className="h-3 bg-slate-200 rounded w-1/3"></div>
        <div className="h-4 bg-slate-200 rounded w-5/6"></div>
        <div className="h-4 bg-slate-200 rounded w-4/6"></div>
      </div>

      {/* Rating */}
      <div className="h-4 bg-slate-200 rounded w-1/4"></div>

      {/* Price & Actions */}
      <div className="pt-3 border-t border-slate-100 space-y-3">
        <div className="h-6 bg-slate-200 rounded w-2/5"></div>
        <div className="grid grid-cols-2 gap-2">
          <div className="h-8 bg-slate-200 rounded-xl"></div>
          <div className="h-8 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
};

export default ProductSkeleton;
