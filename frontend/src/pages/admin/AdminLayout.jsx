import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  MousePointerClick,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  PlusCircle,
  ShoppingBag,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { admin, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    addToast('Logged out of Admin Portal', 'info');
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/admin', exact: true },
    { label: 'Products', icon: Package, to: '/admin/products' },
    { label: 'Categories', icon: FolderTree, to: '/admin/categories' },
    { label: 'Affiliate Clicks', icon: MousePointerClick, to: '/admin/clicks' },
    { label: 'Settings', icon: Settings, to: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-[#fbfcf9] text-slate-800 flex flex-col md:flex-row">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Sidebar - Light Mode with Olive Green Accent */}
      <aside
        className={`fixed md:sticky top-0 left-0 bottom-0 z-50 w-64 bg-white border-r border-surface-200 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 space-y-6">
          {/* Logo & Portal Title */}
          <div className="flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-md shadow-brand-500/25">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <span className="text-lg font-black text-brand-950 tracking-tight">
                  Affil<span className="text-brand-500">ify</span>
                </span>
                <span className="block text-[9px] uppercase tracking-widest font-black text-brand-600">
                  Control Center
                </span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action Button */}
          <Link
            to="/admin/products/new"
            onClick={() => setSidebarOpen(false)}
            className="w-full bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold py-2.5 px-3.5 rounded-xl transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add New Product</span>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 block mb-2">
              Management
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200'
                      : 'text-slate-600 hover:text-brand-700 hover:bg-surface-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-brand-600" />}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Admin Profile & Logout */}
        <div className="p-4 border-t border-surface-200 space-y-3 bg-surface-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 border border-brand-200 flex items-center justify-center text-xs font-bold shrink-0">
                {admin?.name ? admin.name[0].toUpperCase() : 'A'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">{admin?.name || 'Administrator'}</div>
                <div className="text-[10px] text-slate-500 truncate">{admin?.email || 'admin@affilify.com'}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 text-[11px] font-semibold bg-white hover:bg-surface-100 text-slate-700 py-1.5 px-2 rounded-lg border border-surface-300 transition-colors shadow-xs"
            >
              <span>Live Site</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1 text-[11px] font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 py-1.5 px-2 rounded-lg border border-rose-200 transition-colors"
            >
              <LogOut className="w-3 h-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header - Light Mode */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-surface-200 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 md:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span className="text-slate-900">Affiliate Administration</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              target="_blank"
              className="text-xs font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1 bg-brand-50 border border-brand-200 px-3 py-1.5 rounded-xl transition-colors shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Preview Store</span>
            </Link>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 p-4 sm:p-8 bg-[#fbfcf9] overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
