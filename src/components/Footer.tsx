
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-white dark:bg-gray-900 shadow-inner mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <img 
              src="/lovable-uploads/81c0d83a-211c-4ccb-95b8-199c8fe9a8b4.png" 
              alt="COBAIN Logo" 
              className="h-8 w-8" 
            />
            <span className="text-sm font-semibold">COBAIN © {new Date().getFullYear()}</span>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-sm text-gray-500 hover:text-cobain-blue dark:text-gray-400 dark:hover:text-white">
              About
            </a>
            <a href="#" className="text-sm text-gray-500 hover:text-cobain-blue dark:text-gray-400 dark:hover:text-white">
              Privacy
            </a>
            <a href="#" className="text-sm text-gray-500 hover:text-cobain-blue dark:text-gray-400 dark:hover:text-white">
              Terms
            </a>
            <a href="#" className="text-sm text-gray-500 hover:text-cobain-blue dark:text-gray-400 dark:hover:text-white">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
