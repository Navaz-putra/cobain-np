
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UseAuditDataProps {
  userId?: string | undefined;
  isAdmin?: boolean;
}

export const useAuditData = ({ userId, isAdmin = false }: UseAuditDataProps = {}) => {
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAudits = async () => {
      try {
        setLoading(true);
        console.log("Fetching audits, isAdmin:", isAdmin, "userId:", userId);
        
        // Test database connection first
        const { data: testData, error: testError } = await supabase
          .from("audits")
          .select("count", { count: 'exact', head: true });
        
        if (testError) {
          console.error("Database connection test failed:", testError);
          throw new Error(`Database connection failed: ${testError.message}`);
        }
        
        console.log("Database connection successful, total audits:", testData);
        
        let query = supabase.from("audits").select(`
          *,
          audit_domains(*),
          audit_answers(*)
        `);
        
        // If not admin and userId is provided, filter by user_id
        if (!isAdmin && userId) {
          query = query.eq("user_id", userId);
        }
        
        // Order by creation date, newest first
        query = query.order("created_at", { ascending: false });
          
        const { data, error } = await query;
        
        if (error) {
          console.error("Error fetching audits:", error);
          throw error;
        }
        
        console.log("Raw audit data:", data);
        
        // Fetch audit progress and domains for each audit
        const auditsWithDetails = await Promise.all((data || []).map(async (audit) => {
          // Get audit progress
          const progress = await getAuditProgress(audit.id);
          
          // Get audit domains
          const { data: domainData, error: domainError } = await supabase
            .from("audit_domains")
            .select("domain_id")
            .eq("audit_id", audit.id)
            .eq("selected", true);
            
          if (domainError) {
            console.error("Error fetching audit domains:", domainError);
          }
          
          // Extract domain IDs
          const domains = (domainData || []).map(d => d.domain_id);
          
          return {
            ...audit,
            progress: Math.round(progress),
            domains: domains
          };
        }));
        
        console.log("Audits with details:", auditsWithDetails);
        setAudits(auditsWithDetails);
      } catch (error) {
        console.error("Error fetching audits:", error);
        toast({
          title: "Kesalahan Database",
          description: `Gagal memuat data audit: ${error instanceof Error ? error.message : 'Error tidak diketahui'}`,
          variant: "destructive"
        });
        setAudits([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAudits();
  }, [userId, isAdmin, toast]);

  const getAuditProgress = async (auditId: string) => {
    try {
      // Get total questions for this audit
      const { data: domainData } = await supabase
        .from("audit_domains")
        .select("domain_id")
        .eq("audit_id", auditId)
        .eq("selected", true);
        
      if (!domainData || domainData.length === 0) {
        return 0;
      }
      
      const selectedDomains = domainData.map(d => d.domain_id);
      
      // Count total questions for selected domains
      const { count: totalQuestions, error: questionsError } = await supabase
        .from("cobit_questions")
        .select("*", { count: 'exact', head: true })
        .in("domain_id", selectedDomains);
        
      if (questionsError) {
        console.error("Error counting questions:", questionsError);
        return 0;
      }
      
      // Count answered questions for this audit
      const { count: answeredQuestions, error: answersError } = await supabase
        .from("audit_answers")
        .select("*", { count: 'exact', head: true })
        .eq("audit_id", auditId);
        
      if (answersError) {
        console.error("Error counting answers:", answersError);
        return 0;
      }
      
      return totalQuestions && totalQuestions > 0 ? (answeredQuestions || 0) / totalQuestions * 100 : 0;
    } catch (error) {
      console.error("Error calculating audit progress:", error);
      return 0;
    }
  };

  return { audits, loading, setAudits };
};
