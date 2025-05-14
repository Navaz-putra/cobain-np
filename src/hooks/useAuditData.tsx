
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UseAuditDataProps {
  userId: string | undefined;
}

export const useAuditData = ({ userId }: UseAuditDataProps) => {
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAudits = async () => {
      if (!userId) {
        setLoading(false);
        setAudits([]);
        return;
      }
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from("audits")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
          
        if (error) {
          throw error;
        }
        
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
        
        setAudits(auditsWithDetails);
      } catch (error) {
        console.error("Error fetching audits:", error);
        toast({
          title: "Error",
          description: "Failed to load audit data"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAudits();
  }, [userId, toast]);

  const getAuditProgress = async (auditId: string) => {
    try {
      // Get total questions
      const { data: questionsData, error: questionsError } = await supabase
        .from("cobit_questions")
        .select("count");
        
      if (questionsError) throw questionsError;
      
      // Get answered questions
      const { data: answersData, error: answersError } = await supabase
        .from("audit_answers")
        .select("count")
        .eq("audit_id", auditId);
        
      if (answersError) throw answersError;
      
      const totalQuestions = parseInt(questionsData[0]?.count as unknown as string) || 0;
      const answeredQuestions = parseInt(answersData[0]?.count as unknown as string) || 0;
      
      return totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
    } catch (error) {
      console.error("Error calculating audit progress:", error);
      return 0;
    }
  };

  return { audits, loading, setAudits };
};
