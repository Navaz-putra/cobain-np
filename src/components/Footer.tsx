
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

export function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white dark:bg-gray-900 shadow-inner mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src="/lovable-uploads/81c0d83a-211c-4ccb-95b8-199c8fe9a8b4.png" 
                alt="COBAIN Logo" 
                className="h-10 w-10" 
              />
              <span className="text-xl font-bold">COBAIN</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Comprehensive Online-Based Audit Instrument for COBIT 2019 implementation
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {currentYear} COBAIN. All rights reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">
              Platform
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-gray-500 hover:text-cobain-blue dark:text-gray-400 dark:hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="#features" className="text-sm text-gray-500 hover:text-cobain-blue dark:text-gray-400 dark:hover:text-white">
                  Features
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-cobain-blue dark:text-gray-400 dark:hover:text-white">
                  Pricing
                </a>
              </li>
              <li>
                <Link to="/login" className="text-sm text-gray-500 hover:text-cobain-blue dark:text-gray-400 dark:hover:text-white">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">
              Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-cobain-blue dark:text-gray-400 dark:hover:text-white">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-cobain-blue dark:text-gray-400 dark:hover:text-white">
                  COBIT Guide
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-cobain-blue dark:text-gray-400 dark:hover:text-white">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-cobain-blue dark:text-gray-400 dark:hover:text-white">
                  Community
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Legal */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-cobain-blue dark:text-gray-400 dark:hover:text-white">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-cobain-blue dark:text-gray-400 dark:hover:text-white">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-cobain-blue dark:text-gray-400 dark:hover:text-white">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-cobain-blue dark:text-gray-400 dark:hover:text-white">
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom line */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            COBAIN — Making IT Governance Assessments Simple and Effective
          </p>
        </div>
      </div>
    </footer>
  );
}
