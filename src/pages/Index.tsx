
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, loading } = useAuth();

  useEffect(() => {
    // Wait until authentication is complete before redirecting
    if (!loading) {
      if (isAuthenticated && user) {
        // If authenticated, redirect to appropriate dashboard based on role
        if (user.role === "admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/auditor-dashboard");
        }
      } else {
        // If not authenticated, redirect to landing page
        navigate("/landing");
      }
    }
  }, [navigate, isAuthenticated, user, loading]);

  // Return loading state instead of null to avoid rendering issues
  return <div className="flex items-center justify-center min-h-screen">
    <p className="text-gray-500">Redirecting...</p>
  </div>;
};

export default Index;
