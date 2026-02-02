
import React from 'react';
import { Link } from 'react-router-dom';
import { LogoIcon } from './icons';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900/50 border-t border-slate-700/50 mt-16 pb-8 pt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1 mb-8 md:mb-0">
            <div className="flex items-center space-x-2 text-white">
              <LogoIcon className="h-8 w-8 text-cyan-400" />
              <span className="text-xl font-bold">Fifth Baptist Bank</span>
            </div>
            <p className="text-sm text-gray-400 mt-4">
              Your trusted financial partner, committed to your success.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-200">Services</h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-400">
              <li><Link to="/services/checking" className="hover:text-white">Checking</Link></li>
              <li><Link to="/services/savings" className="hover:text-white">Savings</Link></li>
              <li><Link to="/services/loans" className="hover:text-white">Loans</Link></li>
              <li><Link to="/services/credit-cards" className="hover:text-white">Credit Cards</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-200">About</h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-400">
              <li><Link to="/about" className="hover:text-white">Our Story</Link></li>
              <li><Link to="/about/careers" className="hover:text-white">Careers</Link></li>
              <li><Link to="/about/press" className="hover:text-white">Press</Link></li>
              <li><Link to="/about/investors" className="hover:text-white">Investor Relations</Link></li>
              <li><Link to="/admin/login" className="hover:text-white">Employee Access</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-200">Legal</h3>
            <ul className="mt-4 space-y-2 text-sm text-gray-400">
              <li><Link to="/legal/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/legal/terms" className="hover:text-white">Terms of Service</Link></li>
              <li><Link to="/legal/disclosures" className="hover:text-white">Disclosures</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-slate-800 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Fifth Baptist Bank. All Rights Reserved. Member FDIC.</p>
          <p className="mt-2">This is a fictional bank for entertainment and educational purposes.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
