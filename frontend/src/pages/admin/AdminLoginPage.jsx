import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Mail, ShieldCheck, ArrowRight, ShoppingBag, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/admin';

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await login(email.trim(), password);
      addToast('Welcome back, Administrator!', 'success');
      navigate(redirectPath, { replace: true });
    } catch (err) {
      setErrorMsg(err.message || 'Invalid credentials. Access is restricted to authorized administrators.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfcf9] flex flex-col justify-center items-center p-4 sm:p-6 text-slate-800">
      {/* Background ambient olive glow */}
      <div className="absolute w-72 sm:w-96 h-72 sm:h-96 bg-brand-200/30 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <span className="text-3xl font-black text-brand-950 tracking-tight">
              Affil<span className="text-brand-500">ify</span>
            </span>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-800 text-xs font-bold border border-brand-200">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-600" /> Authorized Admin Access Only
          </div>
        </div>

        {/* Login Card - Strictly Secured Light Mode */}
        <div className="bg-white border border-surface-300 rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900">Administrator Sign In</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Please enter your authorized administrator credentials to access the management control center.
            </p>
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Admin Email</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter administrator email..."
                  className="w-full bg-surface-50 border border-surface-300 rounded-xl px-3.5 py-2.5 pl-10 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-brand-500 focus:bg-white transition-all min-h-[44px]"
                />
                <Mail className="w-4 h-4 text-brand-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  className="w-full bg-surface-50 border border-surface-300 rounded-xl px-3.5 py-2.5 pl-10 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-brand-500 focus:bg-white transition-all min-h-[44px]"
                />
                <Lock className="w-4 h-4 text-brand-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white text-xs font-extrabold py-3 px-4 rounded-xl transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 disabled:opacity-50 min-h-[44px]"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-surface-200 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
            <span>Protected by JWT session verification and password encryption.</span>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-700 transition-colors min-h-[44px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Public Storefront
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;