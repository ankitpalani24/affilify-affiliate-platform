import React, { useState, useEffect } from 'react';
import {
  MousePointerClick,
  Download,
  ExternalLink,
  Clock,
  Globe,
  Filter,
  Package,
} from 'lucide-react';
import api from '../../services/api';
import Pagination from '../../components/Pagination';
import { formatDate, getPlatformConfig } from '../../utils/helpers';
import { useToast } from '../../context/ToastContext';

const AdminClicksPage = () => {
  const [clicks, setClicks] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [loading, setLoading] = useState(true);

  const { addToast } = useToast();

  const fetchClicks = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 20,
      };
      if (selectedPlatform !== 'all') params.platform = selectedPlatform;

      const res = await api.getClickLogs(params);
      if (res.success) {
        setClicks(res.data);
        setTotalCount(res.total || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      addToast(err.message || 'Failed to fetch click logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClicks();
  }, [page, selectedPlatform]);

  const handleExportCSV = () => {
    if (clicks.length === 0) {
      addToast('No logs available to export', 'info');
      return;
    }

    const headers = ['Timestamp', 'Product Name', 'Category', 'Platform', 'IP Address', 'Referrer'];
    const rows = clicks.map((c) => [
      new Date(c.createdAt).toISOString(),
      `"${(c.productName || c.product?.name || '').replace(/"/g, '""')}"`,
      `"${c.categoryName || ''}"`,
      c.platform || 'Amazon',
      c.ip || 'unknown',
      `"${(c.referrer || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `affiliate_clicks_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('CSV export downloaded!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Affiliate Click Logs</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time conversion stream of visitors clicking outbound affiliate buttons. Total {totalCount} events tracked.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <select
            value={selectedPlatform}
            onChange={(e) => {
              setSelectedPlatform(e.target.value);
              setPage(1);
            }}
            className="bg-white border border-surface-300 text-slate-800 text-xs rounded-xl px-3.5 py-2.5 outline-none cursor-pointer shadow-xs min-h-[44px] flex-1 sm:flex-none"
          >
            <option value="all">All Stores</option>
            <option value="Amazon">Amazon</option>
            <option value="Flipkart">Flipkart</option>
            <option value="Myntra">Myntra</option>
            <option value="Ajio">Ajio</option>
            <option value="Nykaa">Nykaa</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/20 min-h-[44px] shrink-0"
          >
            <Download className="w-4 h-4 text-brand-200" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Clicks Log Container */}
      <div className="bg-white border border-surface-300 rounded-3xl overflow-hidden shadow-soft">
        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <span className="text-xs">Loading click streams...</span>
          </div>
        ) : clicks.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No clicks recorded yet.
          </div>
        ) : (
          <>
            {/* Desktop View: Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-surface-200 text-slate-500 font-bold uppercase tracking-wider text-[10px] bg-surface-50">
                    <th className="py-3.5 px-4">Timestamp</th>
                    <th className="py-3.5 px-4">Product Name</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Store Platform</th>
                    <th className="py-3.5 px-4">Visitor IP</th>
                    <th className="py-3.5 px-4 text-right">Destination</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-surface-200">
                  {clicks.map((c) => {
                    const plat = getPlatformConfig(c.platform);
                    return (
                      <tr key={c._id} className="hover:bg-surface-50 transition-colors">
                        {/* Time */}
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{formatDate(c.createdAt)}</span>
                          </div>
                        </td>

                        {/* Product Name */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <span className="font-bold text-slate-900 line-clamp-1">
                            {c.productName || c.product?.name || 'Deleted Product'}
                          </span>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {c.categoryName || 'General'}
                        </td>

                        {/* Platform */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${plat.badge}`}>
                            {c.platform}
                          </span>
                        </td>

                        {/* IP */}
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                          {c.ip || 'unknown'}
                        </td>

                        {/* Destination Preview */}
                        <td className="py-3.5 px-4 text-right">
                          {c.affiliateUrl || c.product?.affiliateUrl ? (
                            <a
                              href={c.affiliateUrl || c.product?.affiliateUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-700 hover:underline min-h-[32px] px-2 py-1"
                            >
                              <span>Open URL</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile View: Responsive Card Transformation (< 768px) */}
            <div className="md:hidden divide-y divide-surface-200">
              {clicks.map((c) => {
                const plat = getPlatformConfig(c.platform);
                return (
                  <div key={c._id} className="p-4 space-y-2.5 bg-white">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(c.createdAt)}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md ${plat.badge}`}>
                        {c.platform}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                        {c.productName || c.product?.name || 'Affiliate Product'}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                        <span>Category: <strong className="text-slate-700">{c.categoryName || 'General'}</strong></span>
                        <span>•</span>
                        <span className="font-mono text-[10px]">IP: {c.ip || 'unknown'}</span>
                      </div>
                    </div>

                    {(c.affiliateUrl || c.product?.affiliateUrl) && (
                      <div className="pt-1">
                        <a
                          href={c.affiliateUrl || c.product?.affiliateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 px-3 bg-surface-50 hover:bg-surface-100 text-brand-700 text-xs font-bold rounded-xl border border-surface-300 flex items-center justify-center gap-1.5 transition-colors min-h-[40px]"
                        >
                          <span>Open Affiliate URL</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Pagination */}
        <div className="p-4 border-t border-surface-200">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminClicksPage;