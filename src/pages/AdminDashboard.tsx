
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AdminDashboardComponents } from "@/components/admin/AdminDashboardComponents";
import { useAuditData } from "@/hooks/useAuditData";
import { Button } from "@/components/ui/button";
import { Settings, RefreshCcw } from "lucide-react";
import { AccountSettings } from "@/components/dashboard/AccountSettings";
import { UserManagement } from "@/components/admin/UserManagement";

export default function AdminDashboard() {
  const { t } = useLanguage();
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const { audits, loading: loadingAudits } = useAuditData({ isAdmin: true });
  const [accountSettingsOpen, setAccountSettingsOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Hardcoded superadmin email
  const hardcodedSuperadminEmail = "navazputra@students.amikom.ac.id";

  // Check if admin access token is available
  useEffect(() => {
    setTokenError(null);
    
    if (user?.role !== "admin" && user?.email !== hardcodedSuperadminEmail) {
      setTokenError("Anda harus login sebagai admin untuk mengakses halaman ini");
    }
  }, [user, session, hardcodedSuperadminEmail]);
  
  // Function to refresh data
  const refreshData = async () => {
    setRefreshing(true);
    await fetchQuestions();
    setRefreshing(false);
  };

  // Fetch questions from database
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cobit_questions')
        .select('*');
      
      if (error) {
        throw error;
      }

      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengambil data pertanyaan audit',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial data loading
  useEffect(() => {
    fetchQuestions();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dasbor Admin</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={refreshData}
            disabled={refreshing}
          >
            <RefreshCcw size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh Data
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={() => setAccountSettingsOpen(true)}
          >
            <Settings size={16} />
            Pengaturan Akun
          </Button>
        </div>
      </div>
      
      <AdminDashboardComponents
        userCount={0}
        questionCount={questions.length}
        auditCount={audits.length}
        showTokenError={!!tokenError}
        tokenErrorMessage={tokenError || ""}
      />

      {/* User Management Component */}
      {!tokenError && (
        <div className="mt-6">
          <UserManagement 
            hardcodedSuperadminEmail={hardcodedSuperadminEmail} 
          />
        </div>
      )}

      {/* Account Settings Dialog */}
      <AccountSettings 
        open={accountSettingsOpen} 
        onOpenChange={setAccountSettingsOpen} 
      />
    </div>
  );
}
