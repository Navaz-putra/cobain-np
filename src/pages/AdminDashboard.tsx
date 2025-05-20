
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
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
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
    await fetchUsers();
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

  // Fetch users from database
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      
      // Special case for superadmin user
      if (user?.email === hardcodedSuperadminEmail) {
        console.log("Fetching users as superadmin");
        
        try {
          // Call the edge function with superadmin credentials
          const response = await fetch("https://dcslbtsxmctxkudozrck.supabase.co/functions/v1/admin-operations", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              action: "listUsers",
              superadmin: true,
              superadminEmail: hardcodedSuperadminEmail
            })
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Edge function error status:', response.status);
            console.error('Edge function error response:', errorText);
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          const result = await response.json();
          console.log("Edge function response:", result);
          
          if (result.data?.users) {
            setUsers(result.data.users);
          } else if (result.users) {
            // Handle alternative response format
            setUsers(result.users);
          } else {
            throw new Error(result.error || "Failed to fetch users - no users data in response");
          }
        } catch (error) {
          console.error('Error fetching users via edge function:', error);
          toast({
            title: 'Error',
            description: `Gagal mengambil data pengguna: ${error instanceof Error ? error.message : 'Error tidak diketahui'}`,
            variant: 'destructive'
          });
          setUsers([]); // Set empty array to prevent null reference errors
        }
        
        setLoadingUsers(false);
        return;
      }

      // For regular admin users
      if (!session?.access_token) {
        setTokenError("No access token available for admin operations");
        setUsers([]);
        setLoadingUsers(false);
        return;
      }

      // Use edge function for all admin operations
      console.log("Using edge function with access token");
      const response = await fetch("https://dcslbtsxmctxkudozrck.supabase.co/functions/v1/admin-operations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: "listUsers"
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Edge function error status:', response.status);
        console.error('Edge function error response:', errorText);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("Edge function response:", result);
      
      if (result.data?.users) {
        setUsers(result.data.users);
      } else if (result.users) {
        // Handle alternative response format
        setUsers(result.users);
      } else {
        throw new Error(result.error || "Failed to fetch users - no users data in response");
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: `Gagal mengambil data pengguna: ${error instanceof Error ? error.message : 'Error tidak diketahui'}`,
        variant: 'destructive'
      });
      // Set empty array to prevent null reference errors
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Initial data loading
  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (user && (user.role === "admin" || user.email === hardcodedSuperadminEmail)) {
      fetchUsers();
    }
  }, [user, session?.access_token, hardcodedSuperadminEmail]);

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
        userCount={users.length}
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
