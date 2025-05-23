
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Chatbot } from "@/components/Chatbot";

import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import EmailConfirmation from "@/pages/EmailConfirmation";
import AdminDashboard from "@/pages/AdminDashboard";
import AuditorDashboard from "@/pages/AuditorDashboard";
import StartAudit from "@/pages/StartAudit";
import AuditChecklist from "@/pages/AuditChecklist";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";

const queryClient = new QueryClient();

// FooterWrapper component to conditionally render footer based on route
const FooterWrapper = () => {
  const location = useLocation();
  const path = location.pathname;
  
  // Hide footer on dashboard and landing pages
  if (path === '/landing' || 
      path === '/admin-dashboard' || 
      path === '/auditor-dashboard') {
    return null;
  }
  
  return <Footer />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/landing" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/email-confirmation" element={<EmailConfirmation />} />
                    <Route path="/admin-dashboard" element={<AdminDashboard />} />
                    <Route path="/auditor-dashboard" element={<AuditorDashboard />} />
                    <Route path="/start-audit" element={<StartAudit />} />
                    <Route path="/audit-checklist/:auditId" element={<AuditChecklist />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <FooterWrapper />
              </div>
              <Chatbot />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
