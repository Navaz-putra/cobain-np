
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      // If authenticated, redirect to appropriate dashboard based on role
      if (user?.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/auditor-dashboard");
      }
    } else {
      // If not authenticated, redirect to landing page
      navigate("/");
    }
  }, [navigate, isAuthenticated, user]);

  return null;
};

export default Index;
