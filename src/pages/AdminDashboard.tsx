
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AdminDashboardComponents } from "@/components/admin/AdminDashboardComponents";

export default function AdminDashboard() {
  const { t } = useLanguage();
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingAudits, setLoadingAudits] = useState(true);
  const [tokenError, setTokenError] = useState<string | null>(null);

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
          
          const result = await response.json();
          
          if (response.ok) {
            setUsers(result.data?.users || []);
          } else {
            throw new Error(result.error || "Failed to fetch users");
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
        
        const result = await response.json();
        
        if (response.ok) {
          setUsers(result.data?.users || []);
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
      } finally {
        setLoadingUsers(false);
      }
    };

    if (user && (user.role === "admin" || user.email === hardcodedSuperadminEmail)) {
      fetchUsers();
    }
  }, [toast, session?.access_token, user, hardcodedSuperadminEmail]);

  // Fetch all audits from database
  useEffect(() => {
    const fetchAudits = async () => {
      try {
        setLoadingAudits(true);
        
        const { data, error } = await supabase
          .from('audits')
          .select(`
            *,
            audit_domains(*),
            audit_answers(*)
          `)
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }

        setAudits(data || []);
      } catch (error) {
        console.error('Error fetching audits:', error);
        toast({
          title: 'Error',
          description: 'Gagal mengambil data audit',
          variant: 'destructive'
        });
      } finally {
        setLoadingAudits(false);
      }
    };

    if (user && (user.role === "admin" || user.email === hardcodedSuperadminEmail)) {
      fetchAudits();
    }
  }, [toast, user, hardcodedSuperadminEmail]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dasbor Admin</h1>
      
      <AdminDashboardComponents
        userCount={users.length}
        questionCount={questions.length}
        auditCount={audits.length}
        showTokenError={!!tokenError}
        tokenErrorMessage={tokenError || ""}
      />
    </div>
  );
}
