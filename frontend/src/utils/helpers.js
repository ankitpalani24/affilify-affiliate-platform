// Currency formatter (default INR ₹ or custom)
export const formatCurrency = (amount, currency = 'INR') => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Date formatter
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// Short Number Formatter (e.g. 1.2k)
export const formatNumber = (num) => {
  if (!num) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
};

// Affiliate Platform styling helper (with Olive Green default)
export const getPlatformConfig = (platform = 'Amazon') => {
  const norm = (platform || '').toLowerCase();
  switch (norm) {
    case 'amazon':
      return {
        name: 'Amazon',
        bg: 'bg-amber-500/10 text-amber-800 border-amber-500/20',
        badge: 'bg-[#FF9900] text-slate-950 font-bold shadow-xs',
        btnBg: 'bg-[#FF9900] hover:bg-[#e68a00] text-slate-950 font-bold shadow-amber-500/20',
        iconBg: 'bg-[#131921] text-amber-400',
        textColor: 'text-amber-700',
        borderColor: 'border-amber-400',
      };
    case 'flipkart':
      return {
        name: 'Flipkart',
        bg: 'bg-blue-500/10 text-blue-800 border-blue-500/20',
        badge: 'bg-[#2874F0] text-white font-bold shadow-xs',
        btnBg: 'bg-[#2874F0] hover:bg-[#1f60ca] text-white font-bold shadow-blue-500/20',
        iconBg: 'bg-[#2874F0] text-yellow-300',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-400',
      };
    case 'myntra':
      return {
        name: 'Myntra',
        bg: 'bg-pink-500/10 text-pink-800 border-pink-500/20',
        badge: 'bg-[#FF3F6C] text-white font-bold shadow-xs',
        btnBg: 'bg-[#FF3F6C] hover:bg-[#e02d58] text-white font-bold shadow-pink-500/20',
        iconBg: 'bg-[#FF3F6C] text-white',
        textColor: 'text-pink-700',
        borderColor: 'border-pink-400',
      };
    case 'ajio':
      return {
        name: 'Ajio',
        bg: 'bg-slate-700/10 text-slate-800 border-slate-700/20',
        badge: 'bg-[#2C4152] text-white font-bold',
        btnBg: 'bg-[#2C4152] hover:bg-[#1e2e3b] text-white font-bold',
        iconBg: 'bg-[#2C4152] text-yellow-400',
        textColor: 'text-slate-800',
        borderColor: 'border-slate-700',
      };
    case 'nykaa':
      return {
        name: 'Nykaa',
        bg: 'bg-rose-500/10 text-rose-800 border-rose-500/20',
        badge: 'bg-[#fc2779] text-white font-bold',
        btnBg: 'bg-[#fc2779] hover:bg-[#e01967] text-white font-bold',
        iconBg: 'bg-[#fc2779] text-white',
        textColor: 'text-rose-700',
        borderColor: 'border-rose-400',
      };
    default:
      return {
        name: platform || 'Store',
        bg: 'bg-brand-50 text-brand-800 border-brand-200',
        badge: 'bg-brand-600 text-white font-bold',
        btnBg: 'bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-brand-500/20',
        iconBg: 'bg-brand-700 text-white',
        textColor: 'text-brand-700',
        borderColor: 'border-brand-400',
      };
  }
};
