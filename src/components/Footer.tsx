
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white dark:bg-gray-900 shadow-inner mt-auto py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            COBAIN — (Comprehensive Online-Based Audit Instrument) © {currentYear}
          </p>
        </div>
      </div>
    </footer>
  );
}
