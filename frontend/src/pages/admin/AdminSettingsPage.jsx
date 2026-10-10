import React, { useState } from 'react';
import { ShieldCheck, User, Lock, Save, KeyRound, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

const AdminSettingsPage = () => {
  const { admin } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState(admin?.name || 'Administrator');
  const [email, setEmail] = useState(admin?.email || 'admin@affilify.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      addToast('New passwords do not match', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name,
        email,
      };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await api.updateAdminProfile(payload);
      if (res.success) {
        addToast('Admin credentials updated successfully!', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      addToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Admin & Portal Settings</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your administrator account security, notifications, and store parameters.
        </p>
      </div>

      <div className="bg-white border border-surface-300 rounded-3xl p-5 sm:p-8 space-y-6 shadow-soft">
        <div className="flex items-center gap-3 border-b border-surface-200 pb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center border border-brand-200 shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-brand-900 uppercase tracking-wider">Account Credentials</h2>
            <p className="text-xs text-slate-500">Modify login email address and change password</p>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Admin Display Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface-50 border border-surface-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-brand-500 focus:bg-white min-h-[44px]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Admin Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface-50 border border-surface-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-brand-500 focus:bg-white min-h-[44px]"
              />
            </div>
          </div>

          {/* Password Section */}
          <div className="pt-4 border-t border-surface-200 space-y-4">
            <h3 className="text-xs font-bold text-brand-900 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-brand-600" />
              <span>Change Password (Leave blank to keep current)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-50 border border-surface-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-brand-500 focus:bg-white min-h-[44px]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-50 border border-surface-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-brand-500 focus:bg-white min-h-[44px]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-50 border border-surface-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-brand-500 focus:bg-white min-h-[44px]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold py-3 px-6 rounded-xl transition-all shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 disabled:opacity-50 min-h-[44px]"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Updating...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* System Status Box - Light Mode */}
      <div className="bg-white border border-surface-300 rounded-3xl p-5 sm:p-6 space-y-3 shadow-soft">
        <h3 className="text-sm font-bold text-slate-900">Affiliate Architecture Status</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs">
          <div className="p-3.5 bg-surface-50 rounded-xl border border-surface-300 space-y-1">
            <span className="text-slate-500 block">Database Isolation:</span>
            <span className="font-bold text-brand-700 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-brand-600" /> Isolated Collection
            </span>
          </div>
          <div className="p-3.5 bg-surface-50 rounded-xl border border-surface-300 space-y-1">
            <span className="text-slate-500 block">Click Redirect Engine:</span>
            <span className="font-bold text-brand-700 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-brand-600" /> 302 Outbound Active
            </span>
          </div>
          <div className="p-3.5 bg-surface-50 rounded-xl border border-surface-300 space-y-1">
            <span className="text-slate-500 block">Authentication:</span>
            <span className="font-bold text-brand-700 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-brand-600" /> JWT Secure Token
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;