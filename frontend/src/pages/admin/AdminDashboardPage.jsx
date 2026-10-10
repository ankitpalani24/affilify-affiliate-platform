import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  FolderTree,
  MousePointerClick,
  Sparkles,
  Flame,
  ArrowUpRight,
  TrendingUp,
  PlusCircle,
  ExternalLink,
  Clock,
  CheckCircle,
  BarChart2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '../../services/api';
import { formatCurrency, formatDate, getPlatformConfig } from '../../utils/helpers';

const COLORS = ['#606C38', '#2874F0', '#FF3F6C', '#BC6C25', '#4F5D2B'];

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await api.getDashboardStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-surface-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-surface-200 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-80 bg-surface-200 rounded-2xl"></div>
      </div>
    );
  }

  const metrics = stats?.metrics || {
    totalProducts: 0,
    activeProducts: 0,
    inactiveProducts: 0,
    totalCategories: 0,
    featuredProducts: 0,
    trendingProducts: 0,
    totalClicks: 0,
    clicksToday: 0,
    clicksThisWeek: 0,
    clicksThisMonth: 0,
  };

  const chartData =
    stats?.dailyClicks && stats.dailyClicks.length > 0
      ? stats.dailyClicks.map((d) => ({
          date: d._id.slice(5),
          clicks: d.count,
        }))
      : [
          { date: 'Mon', clicks: 12 },
          { date: 'Tue', clicks: 25 },
          { date: 'Wed', clicks: 18 },
          { date: 'Thu', clicks: 32 },
          { date: 'Fri', clicks: 45 },
          { date: 'Sat', clicks: 60 },
          { date: 'Sun', clicks: 52 },
        ];

  const pieData =
    stats?.platformDistribution && stats.platformDistribution.length > 0
      ? stats.platformDistribution.map((p) => ({
          name: p._id || 'Amazon',
          value: p.count,
        }))
      : [
          { name: 'Amazon', value: 75 },
          { name: 'Flipkart', value: 15 },
          { name: 'Myntra', value: 10 },
        ];

  return (
    <div className="space-y-6 sm:space-y-8 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Executive Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time catalog distribution, click-through rates, and partner store telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/products/new"
            className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-brand-500/20 flex items-center gap-2 min-h-[44px]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="bg-white border border-surface-300 rounded-3xl p-5 sm:p-6 space-y-3 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Catalog Items
            </span>
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center border border-brand-200">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {metrics.totalProducts}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="text-brand-700 font-bold">{metrics.activeProducts} active</span>
              <span>•</span>
              <span>{metrics.inactiveProducts} draft</span>
            </div>
          </div>
        </div>

        {/* Total Affiliate Clicks */}
        <div className="bg-white border border-surface-300 rounded-3xl p-5 sm:p-6 space-y-3 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Outbound Clicks
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-200">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {metrics.totalClicks}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="text-emerald-700 font-bold">+{metrics.clicksToday} today</span>
              <span>•</span>
              <span>{metrics.clicksThisMonth} this month</span>
            </div>
          </div>
        </div>

        {/* Active Categories */}
        <div className="bg-white border border-surface-300 rounded-3xl p-5 sm:p-6 space-y-3 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Store Categories
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <FolderTree className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {metrics.totalCategories}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Organized departments
            </div>
          </div>
        </div>

        {/* Featured / Trending */}
        <div className="bg-white border border-surface-300 rounded-3xl p-5 sm:p-6 space-y-3 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Spotlight Deals
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {metrics.featuredProducts + metrics.trendingProducts}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
              <span className="text-amber-700 font-bold">{metrics.featuredProducts} featured</span>
              <span>•</span>
              <span className="text-rose-700 font-bold">{metrics.trendingProducts} trending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-w-0">
        {/* Daily Outbound Clicks Area Chart */}
        <div className="lg:col-span-8 bg-white border border-surface-300 rounded-3xl p-5 sm:p-6 space-y-4 shadow-soft min-w-0 overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Affiliate Outgoing Clicks Trend</h3>
              <p className="text-xs text-slate-500">Daily redirect conversions to partner marketplaces</p>
            </div>
            <Link
              to="/admin/clicks"
              className="text-xs font-bold text-brand-700 hover:underline flex items-center gap-1 min-h-[36px]"
            >
              <span>View Logs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-64 w-full pt-2 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="clickColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#606C38" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#606C38" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#dbe0d1',
                    borderRadius: '0.75rem',
                    color: '#1f2937',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  stroke="#606C38"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#clickColor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Breakdown Pie Chart */}
        <div className="lg:col-span-4 bg-white border border-surface-300 rounded-3xl p-5 sm:p-6 space-y-4 flex flex-col justify-between shadow-soft min-w-0 overflow-hidden">
          <div>
            <h3 className="text-base font-bold text-slate-900">Network Distribution</h3>
            <p className="text-xs text-slate-500">Share of outgoing clicks per platform</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#dbe0d1',
                    borderRadius: '0.75rem',
                    color: '#1f2937',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-surface-200">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  ></span>
                  <span className="text-slate-700 font-semibold">{item.name}</span>
                </div>
                <span className="text-slate-500 font-bold">{item.value} clicks</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Clicked Products Container */}
      <div className="bg-white border border-surface-300 rounded-3xl p-5 sm:p-6 space-y-4 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Top Converting Products</h3>
            <p className="text-xs text-slate-500">Most clicked affiliate links across all categories</p>
          </div>
          <Link
            to="/admin/products"
            className="text-xs font-bold text-brand-700 hover:underline flex items-center gap-1 min-h-[36px]"
          >
            <span>All Products</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-surface-200 text-slate-500 font-bold uppercase tracking-wider text-[10px] bg-surface-50">
                <th className="py-3 px-3">Product</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Price</th>
                <th className="py-3 px-3">Platform</th>
                <th className="py-3 px-3 text-right">Total Clicks</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200">
              {stats?.topClickedProducts && stats.topClickedProducts.length > 0 ? (
                stats.topClickedProducts.map((p) => {
                  const plat = getPlatformConfig(p.affiliatePlatform);
                  return (
                    <tr key={p._id} className="hover:bg-surface-50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                            alt=""
                            className="w-10 h-10 object-cover rounded-lg bg-surface-100 border border-surface-300 shrink-0"
                          />
                          <span className="font-bold text-slate-900 line-clamp-1 max-w-xs">
                            {p.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium">{p.category?.name || 'General'}</td>
                      <td className="py-3 px-3 font-black text-slate-900">{formatCurrency(p.price)}</td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${plat.badge}`}>
                          {p.affiliatePlatform}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-black text-brand-700">
                        <span className="inline-flex items-center gap-1">
                          <MousePointerClick className="w-3.5 h-3.5 text-brand-600" />
                          <span>{p.clickCount}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          to={`/admin/products/edit/${p._id}`}
                          className="text-xs font-bold text-slate-700 hover:text-brand-700 bg-surface-100 hover:bg-surface-200 px-2.5 py-1 rounded-lg border border-surface-300 transition-colors inline-flex items-center min-h-[32px]"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-slate-400">
                    No clicks recorded yet. Share your store to start tracking!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Responsive Card Transformation (< 768px) */}
        <div className="md:hidden divide-y divide-surface-200">
          {stats?.topClickedProducts && stats.topClickedProducts.length > 0 ? (
            stats.topClickedProducts.map((p) => {
              const plat = getPlatformConfig(p.affiliatePlatform);
              return (
                <div key={p._id} className="py-3.5 space-y-2.5">
                  <div className="flex items-start gap-3">
                    <img
                      src={p.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                      alt=""
                      className="w-12 h-12 object-cover rounded-xl bg-surface-100 border border-surface-300 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                        {p.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-black text-slate-900">{formatCurrency(p.price)}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded ${plat.badge}`}>
                          {p.affiliatePlatform}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-surface-100 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-brand-700">
                      <MousePointerClick className="w-3.5 h-3.5 text-brand-600" />
                      <span>{p.clickCount} Outbound Clicks</span>
                    </div>

                    <Link
                      to={`/admin/products/edit/${p._id}`}
                      className="px-3 py-1.5 bg-surface-100 hover:bg-surface-200 text-slate-700 text-xs font-bold rounded-lg border border-surface-300 min-h-[36px] flex items-center"
                    >
                      Edit Product
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-6 text-center text-slate-400 text-xs">
              No clicks recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;