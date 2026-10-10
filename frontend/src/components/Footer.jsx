import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Heart,
  Send,
  Sparkles,
  Info,
  CheckCircle,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { addToast } = useToast();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email && email.includes('@')) {
      setSubscribed(true);
      addToast('Thank you for subscribing to daily deal alerts!', 'success');
      setEmail('');
    }
  };

  return (
    <footer className="bg-white text-slate-700 border-t border-surface-300 pt-12 sm:pt-16 pb-12 mt-16 sm:mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 pb-10 sm:pb-12 border-b border-surface-200">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-md shadow-brand-500/25">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-brand-950 tracking-tight">
                Affil<span className="text-brand-500">ify</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm">
              Your premier product discovery catalog. We curate high-rated, handpicked deals and products across Amazon, Flipkart, Myntra, and top stores to help you shop smart and save more.
            </p>

            {/* Newsletter Subscription */}
            <div className="pt-2">
              <span className="text-xs font-bold text-slate-800 block mb-2">
                Get notified of flash discounts & price drops
              </span>
              {subscribed ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-brand-800 bg-brand-50 border border-brand-200 p-2.5 rounded-xl">
                  <CheckCircle className="w-4 h-4 text-brand-600" /> You are subscribed to daily deal drops!
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-sm w-full">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    className="bg-surface-50 text-slate-800 placeholder-slate-400 text-xs px-3.5 py-2.5 rounded-xl border border-surface-300 focus:border-brand-500 outline-none flex-1 min-h-[44px]"
                  />
                  <button
                    type="submit"
                    className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-xs min-h-[44px]"
                  >
                    <Send className="w-3.5 h-3.5" /> Join
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-brand-900 tracking-wider uppercase">Explore Deals</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
              <li>
                <Link to="/products" className="hover:text-brand-600 transition-colors inline-block py-0.5">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/products?featured=true" className="hover:text-brand-600 transition-colors inline-block py-0.5">
                  Featured Deals
                </Link>
              </li>
              <li>
                <Link to="/products?trending=true" className="hover:text-brand-600 transition-colors inline-block py-0.5">
                  Trending Hot
                </Link>
              </li>
              <li>
                <Link to="/products?platform=Amazon" className="hover:text-brand-600 transition-colors inline-block py-0.5">
                  Amazon Deals
                </Link>
              </li>
              <li>
                <Link to="/products?platform=Flipkart" className="hover:text-brand-600 transition-colors inline-block py-0.5">
                  Flipkart Offers
                </Link>
              </li>
              <li>
                <Link to="/products?platform=Myntra" className="hover:text-brand-600 transition-colors inline-block py-0.5">
                  Myntra Fashion
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-brand-900 tracking-wider uppercase">Categories</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
              <li>
                <Link to="/products?category=electronics-and-gadgets" className="hover:text-brand-600 transition-colors inline-block py-0.5">
                  Electronics & Tech
                </Link>
              </li>
              <li>
                <Link to="/products?category=home-and-living" className="hover:text-brand-600 transition-colors inline-block py-0.5">
                  Home Decor & Living
                </Link>
              </li>
              <li>
                <Link to="/products?category=fashion-and-style" className="hover:text-brand-600 transition-colors inline-block py-0.5">
                  Fashion & Streetwear
                </Link>
              </li>
              <li>
                <Link to="/products?category=kitchen-and-dining" className="hover:text-brand-600 transition-colors inline-block py-0.5">
                  Kitchen & Espresso
                </Link>
              </li>
              <li>
                <Link to="/products?category=beauty-and-skincare" className="hover:text-brand-600 transition-colors inline-block py-0.5">
                  Beauty & Skincare
                </Link>
              </li>
              <li>
                <Link to="/products?category=fitness-and-outdoors" className="hover:text-brand-600 transition-colors inline-block py-0.5">
                  Fitness & Outdoor
                </Link>
              </li>
            </ul>
          </div>

          {/* Compliance & Trust */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-brand-900 tracking-wider uppercase">Transparency</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
              <li>
                <Link to="/affiliate-disclosure" className="hover:text-brand-700 transition-colors font-bold text-brand-600 inline-block py-0.5">
                  Affiliate Disclosure
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-brand-600 transition-colors inline-block py-0.5">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-brand-600 transition-colors inline-block py-0.5">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Affiliate Disclosure Compliance Box */}
        <div className="mt-8 bg-surface-100 rounded-2xl p-4 sm:p-5 border border-surface-300 text-xs text-slate-600 leading-relaxed">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
            <Info className="w-4 h-4 text-brand-600 shrink-0" />
            <span>FTC Affiliate Disclosure & Disclaimer:</span>
          </div>
          Affilify participates in various affiliate marketing programs, including the Amazon Associates Program, Flipkart Affiliate Program, and others. When you click on product links and make a purchase on partner platforms, we may earn an affiliate commission at no extra cost to you. Product prices, discounts, and availability are subject to change by respective retailers.
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-surface-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Affilify Catalog. All rights reserved. Curated affiliate deals.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 font-medium text-brand-700">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
              Live Tracking Enabled
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;