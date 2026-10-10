import React from 'react';
import { ShieldCheck, Info, ExternalLink, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const AffiliateDisclosurePage = () => {
  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 space-y-6 sm:space-y-8 px-3 sm:px-4">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors min-h-[44px]"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="bg-white rounded-3xl p-5 sm:p-8 md:p-12 border border-surface-300 shadow-soft space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-200 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Affiliate Disclosure & Transparency Policy
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Last updated: September 2026</p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-600 leading-relaxed space-y-4">
          <p>
            Welcome to <strong>Affilify</strong>. Transparency and integrity are our highest priorities. In compliance with the Federal Trade Commission (FTC) guidelines and international advertising disclosure standards, we provide this comprehensive statement regarding how we operate and earn compensation.
          </p>

          <h2 className="text-base sm:text-lg font-bold text-slate-900 pt-2">1. How Our Website Operates</h2>
          <p>
            Affilify is a product discovery and price comparison platform. We do not manufacture, stock, package, or directly sell the products listed on our website. Instead, we research, test, curate, and review top deals and products across leading verified online marketplaces.
          </p>

          <h2 className="text-base sm:text-lg font-bold text-slate-900 pt-2">2. What Happens When You Click "Buy Now"</h2>
          <p>
            When you click any <strong>"Buy Now"</strong>, <strong>"Check Deal"</strong>, or affiliate button on our website, you are redirected to the official retailer (such as Amazon, Flipkart, Myntra, or respective brand stores). You complete the transaction securely directly on their platform.
          </p>

          <h2 className="text-base sm:text-lg font-bold text-slate-900 pt-2">3. Affiliate Links and Commissions</h2>
          <p>
            Some of the links on this website are "affiliate links". This means that if you click on the link and make a purchase, we may receive an affiliate commission from the retailer.
          </p>
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-medium flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong>Zero Extra Cost to You:</strong> The commission we receive is paid directly by the retailer as part of their marketing budget. The price you pay remains exactly the same (or even cheaper if a special promo/coupon code is applied) as shopping directly on the retailer's site.
            </div>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-slate-900 pt-2">4. Affiliate Programs Participated In</h2>
          <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm pl-2">
            <li><strong>Amazon Services LLC Associates Program:</strong> An affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.in and international Amazon sites.</li>
            <li><strong>Flipkart Affiliate Program:</strong> Direct partner program for electronics, home essentials, and fashion.</li>
            <li><strong>Myntra & Ajio Affiliate Programs:</strong> Curated apparel, luxury lifestyle, and footwear.</li>
          </ul>

          <h2 className="text-base sm:text-lg font-bold text-slate-900 pt-2">5. Editorial Independence</h2>
          <p>
            Our product curation, editorial opinions, and ratings are independent. We only showcase products that meet rigorous standards of quality, positive verified customer reviews, and genuine value.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AffiliateDisclosurePage;