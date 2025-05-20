
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AdminDashboardComponents } from "@/components/admin/AdminDashboardComponents";
import { useAuditData } from "@/hooks/useAuditData";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { AccountSettings } from "@/components/dashboard/AccountSettings";

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

  // Hardcoded superadmin email
  const hardcodedSuperadminEmail = "navazputra@students.amikom.ac.id";

  // Check if admin access token is available
  useEffect(() => {
    setTokenError(null);
    
    if (user?.role !== "admin" && user?.email !== hardcodedSuperadminEmail) {
      setTokenError("You must be logged in as an admin to access this page");
    } else if (!session?.access_token && user?.email !== hardcodedSuperadminEmail) {
      setTokenError("No admin access token available. Please try logging out and logging back in.");
    }
  }, [user, session]);

  // Fetch questions from database
  useEffect(() => {
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

    fetchQuestions();
  }, [toast]);

  // Fetch users from database
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        
        // Special case for superadmin user - if it's the hardcoded superadmin
        if (user?.email === hardcodedSuperadminEmail) {
          try {
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
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.data?.users) {
              setUsers(result.data.users || []);
            } else {
              throw new Error(result.error || "Failed to fetch users");
            }
          } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
          }
          
          setLoadingUsers(false);
          return;
        }

        if (!session?.access_token) {
          setTokenError("No access token available for admin operations");
          setUsers([]);
          return;
        }

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
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.data?.users) {
          setUsers(result.data.users || []);
        } else {
          throw new Error(result.error || "Failed to fetch users");
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

    if (user && (user.role === "admin" || user.email === hardcodedSuperadminEmail)) {
      fetchUsers();
    }
  }, [toast, session?.access_token, user, hardcodedSuperadminEmail]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dasbor Admin</h1>
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
      
      <AdminDashboardComponents
        userCount={users.length}
        questionCount={questions.length}
        auditCount={audits.length}
        showTokenError={!!tokenError}
        tokenErrorMessage={tokenError || ""}
      />

      {/* Account Settings Dialog */}
      <AccountSettings 
        open={accountSettingsOpen} 
        onOpenChange={setAccountSettingsOpen} 
      />
    </div>
  );
}
