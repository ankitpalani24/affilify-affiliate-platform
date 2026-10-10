import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center text-3xl font-black text-slate-400">
        404
      </div>
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Page Not Found</h1>
      <p className="text-sm text-slate-500 max-w-md">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-brand-500/20"
      >
        <Home className="w-4 h-4" /> Return to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
