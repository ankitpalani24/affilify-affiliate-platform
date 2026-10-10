import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    // Show first, last, current and immediate neighbors
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 py-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="p-2.5 rounded-xl border border-surface-300 bg-white text-slate-600 hover:bg-surface-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((p, idx) => (
        <React.Fragment key={idx}>
          {p === '...' ? (
            <span className="px-2 py-1 text-slate-400 text-xs">...</span>
          ) : (
            <button
              onClick={() => onPageChange(p)}
              className={`min-w-[40px] min-h-[40px] px-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center ${
                currentPage === p
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                  : 'bg-white text-slate-700 hover:bg-surface-100 border border-surface-300'
              }`}
            >
              {p}
            </button>
          )}
        </React.Fragment>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="p-2.5 rounded-xl border border-surface-300 bg-white text-slate-600 hover:bg-surface-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Pagination;