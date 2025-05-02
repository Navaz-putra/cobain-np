
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="text-center max-w-md">
        <img 
          src="/lovable-uploads/81c0d83a-211c-4ccb-95b8-199c8fe9a8b4.png" 
          alt="COBAIN Logo" 
          className="w-24 h-24 mx-auto mb-6" 
        />
        <h1 className="text-6xl font-bold text-cobain-blue mb-4">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
          Oops! We couldn't find the page you're looking for.
        </p>
        <p className="text-gray-500 dark:text-gray-500 mb-8">
          The page you're trying to access might have been moved, deleted, or doesn't exist.
        </p>
        <Link to="/">
          <Button>
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
