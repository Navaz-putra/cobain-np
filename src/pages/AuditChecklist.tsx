
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Define maturity level descriptions
const maturityLevels = [
  { value: 0, label: "0 - Incomplete", description: "Process is not implemented or fails to achieve its purpose" },
  { value: 1, label: "1 - Performed", description: "Process is implemented and achieves its purpose" },
  { value: 2, label: "2 - Managed", description: "Process is planned, monitored and adjusted" },
  { value: 3, label: "3 - Established", description: "Process is well defined and follows standards" },
  { value: 4, label: "4 - Predictable", description: "Process is measured and controlled" },
  { value: 5, label: "5 - Optimizing", description: "Process is continuously improved" }
];

// Define types for our data
interface AuditQuestion {
  id: string;
  text: string;
  domain_id: string;
  subdomain_id: string;
  answer?: {
    maturity_level: number;
    notes: string | null;
  };
}

interface Domain {
  id: string;
  name: string;
  subdomains: Subdomain[];
}

interface Subdomain {
  id: string;
  name: string;
  questions: AuditQuestion[];
}

// Domain name mapping
const domainNames = {
  "EDM": "Evaluate, Direct and Monitor",
  "APO": "Align, Plan and Organize",
  "BAI": "Build, Acquire and Implement",
  "DSS": "Deliver, Service and Support",
  "MEA": "Monitor, Evaluate and Assess"
};

// Subdomain name mapping
const subdomainNames = {
  "EDM01": "Ensured Governance Framework Setting and Maintenance",
  "EDM02": "Ensured Benefits Delivery",
  "APO01": "Managed IT Management Framework",
  "APO02": "Managed Strategy",
  "BAI01": "Managed Programs and Projects",
  "DSS01": "Managed Operations",
  "MEA01": "Managed Performance and Conformance Monitoring"
};

export default function AuditChecklist() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { auditId } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [auditData, setAuditData] = useState<any>(null);
  const [currentDomain, setCurrentDomain] = useState<string>("EDM");
  const [currentSubdomainIndex, setCurrentSubdomainIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [questions, setQuestions] = useState<AuditQuestion[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [answers, setAnswers] = useState<Record<string, { maturity_level: number; notes: string | null }>>({});

  // Fetch audit data and questions from Supabase
  useEffect(() => {
    const fetchAudit = async () => {
      if (!auditId) {
        navigate("/auditor-dashboard");
        return;
      }

      try {
        setLoading(true);
        
        // Fetch audit details
        const { data: auditData, error: auditError } = await supabase
          .from("audits")
          .select("*")
          .eq("id", auditId)
          .single();

        if (auditError) {
          console.error("Error fetching audit:", auditError);
          toast({
            title: "Error",
            description: "Gagal mengambil data audit",
          });
          navigate("/auditor-dashboard");
          return;
        }

        setAuditData(auditData);
        
        // Fetch all COBIT questions
        const { data: questionData, error: questionError } = await supabase
          .from("cobit_questions")
          .select("*");

        if (questionError) {
          console.error("Error fetching questions:", questionError);
          toast({
            title: "Error",
            description: "Gagal mengambil daftar pertanyaan",
          });
          return;
        }

        // Fetch existing answers for this audit
        const { data: answersData, error: answersError } = await supabase
          .from("audit_answers")
          .select("*")
          .eq("audit_id", auditId);

        if (answersError) {
          console.error("Error fetching answers:", answersError);
        }

        // Organize questions by domains and subdomains
        const answersMap: Record<string, { maturity_level: number; notes: string | null }> = {};
        if (answersData) {
          answersData.forEach((answer: any) => {
            answersMap[answer.question_id] = {
              maturity_level: answer.maturity_level,
              notes: answer.notes
            };
          });
        }
        setAnswers(answersMap);

        // Organize questions by domain and subdomain
        const domainMap: Record<string, Domain> = {};
        
        questionData.forEach((question: any) => {
          const domainId = question.domain_id;
          const subdomainId = question.subdomain_id;
          
          if (!domainMap[domainId]) {
            domainMap[domainId] = {
              id: domainId,
              name: domainNames[domainId as keyof typeof domainNames] || domainId,
              subdomains: []
            };
          }
          
          const domain = domainMap[domainId];
          let subdomain = domain.subdomains.find(sd => sd.id === subdomainId);
          
          if (!subdomain) {
            subdomain = {
              id: subdomainId,
              name: subdomainNames[subdomainId as keyof typeof subdomainNames] || subdomainId,
              questions: []
            };
            domain.subdomains.push(subdomain);
          }
          
          const questionWithAnswer = {
            ...question,
            answer: answersMap[question.id] || undefined
          };
          
          subdomain.questions.push(questionWithAnswer);
        });
        
        const domainsArray = Object.values(domainMap);
        setDomains(domainsArray);
        
        if (domainsArray.length > 0) {
          setCurrentDomain(domainsArray[0].id);
          if (domainsArray[0].subdomains.length > 0) {
            setQuestions(domainsArray[0].subdomains[0].questions);
          }
        }
        
        // Calculate overall progress
        if (domainsArray.length > 0) {
          const totalQuestions = domainsArray.flatMap(domain => 
            domain.subdomains.flatMap(subdomain => subdomain.questions)
          ).length;
          
          const answeredQuestions = Object.keys(answersMap).length;
          setProgress((answeredQuestions / totalQuestions) * 100);
        }
      } catch (error) {
        console.error("Error in audit checklist:", error);
        toast({
          title: "Error",
          description: "Terjadi kesalahan saat memuat data audit",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAudit();
  }, [auditId, navigate, toast, user]);

  // Update questions when domain or subdomain changes
  useEffect(() => {
    if (domains.length > 0 && currentDomain) {
      const domain = domains.find(d => d.id === currentDomain);
      if (domain && domain.subdomains.length > 0 && domain.subdomains[currentSubdomainIndex]) {
        setQuestions(domain.subdomains[currentSubdomainIndex].questions);
      }
    }
  }, [currentDomain, currentSubdomainIndex, domains]);

  const handleMaturityLevelChange = async (questionId: string, value: string) => {
    const maturityLevel = parseInt(value);
    
    // Update local state
    const newAnswers = { ...answers };
    newAnswers[questionId] = {
      maturity_level: maturityLevel,
      notes: newAnswers[questionId]?.notes || null
    };
    setAnswers(newAnswers);
    
    // Update questions state for UI
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? { ...q, answer: { maturity_level: maturityLevel, notes: newAnswers[questionId]?.notes || null }}
        : q
    ));
    
    // Update progress
    if (domains.length > 0) {
      const totalQuestions = domains.flatMap(domain => 
        domain.subdomains.flatMap(subdomain => subdomain.questions)
      ).length;
      
      const answeredQuestions = Object.keys(newAnswers).length;
      setProgress((answeredQuestions / totalQuestions) * 100);
    }
  };

  const handleNotesChange = (questionId: string, notes: string) => {
    // Update local state
    const newAnswers = { ...answers };
    newAnswers[questionId] = {
      maturity_level: newAnswers[questionId]?.maturity_level || 0,
      notes: notes
    };
    setAnswers(newAnswers);
    
    // Update questions state for UI
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? { ...q, answer: { maturity_level: newAnswers[questionId]?.maturity_level || 0, notes: notes }}
        : q
    ));
  };

  const saveAnswers = async () => {
    if (!auditId) return;
    
    try {
      setSaving(true);
      
      // Prepare the data for upsert
      const answersToSave = Object.entries(answers).map(([questionId, answer]) => ({
        audit_id: auditId,
        question_id: questionId,
        maturity_level: answer.maturity_level,
        notes: answer.notes
      }));
      
      // Delete existing answers to prevent duplicates
      const { error: deleteError } = await supabase
        .from("audit_answers")
        .delete()
        .eq("audit_id", auditId);
      
      if (deleteError) {
        throw deleteError;
      }
      
      // Insert new answers
      if (answersToSave.length > 0) {
        const { error } = await supabase
          .from("audit_answers")
          .insert(answersToSave);
        
        if (error) {
          throw error;
        }
      }
      
      toast({
        title: "Sukses",
        description: "Jawaban audit berhasil disimpan",
      });
    } catch (error) {
      console.error("Error saving answers:", error);
      toast({
        title: "Error",
        description: "Gagal menyimpan jawaban audit",
      });
    } finally {
      setSaving(false);
    }
  };

  const goToNextSubdomain = () => {
    const currentDomainObj = domains.find(d => d.id === currentDomain);
    if (!currentDomainObj) return;
    
    if (currentSubdomainIndex < currentDomainObj.subdomains.length - 1) {
      setCurrentSubdomainIndex(currentSubdomainIndex + 1);
    } else {
      // Move to the next domain
      const currentDomainIndex = domains.findIndex(d => d.id === currentDomain);
      if (currentDomainIndex < domains.length - 1) {
        setCurrentDomain(domains[currentDomainIndex + 1].id);
        setCurrentSubdomainIndex(0);
      } else {
        // We've reached the end of the audit
        toast({
          title: "Audit Selesai",
          description: "Anda telah menyelesaikan semua pertanyaan audit",
        });
      }
    }
  };

  const goToPrevSubdomain = () => {
    if (currentSubdomainIndex > 0) {
      setCurrentSubdomainIndex(currentSubdomainIndex - 1);
    } else {
      // Move to the previous domain
      const currentDomainIndex = domains.findIndex(d => d.id === currentDomain);
      if (currentDomainIndex > 0) {
        setCurrentDomain(domains[currentDomainIndex - 1].id);
        const prevDomain = domains[currentDomainIndex - 1];
        setCurrentSubdomainIndex(prevDomain.subdomains.length - 1);
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <p>Memuat data audit...</p>
      </div>
    );
  }

  const currentDomainObj = domains.find(d => d.id === currentDomain);
  const currentSubdomain = currentDomainObj?.subdomains[currentSubdomainIndex];

  if (!currentSubdomain) {
    return (
      <div className="p-6 flex justify-center">
        <p>Tidak ada pertanyaan audit yang tersedia.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Button 
        variant="ghost" 
        onClick={() => navigate("/auditor-dashboard")}
        className="mb-6"
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Kembali ke Dasbor
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{auditData?.title || "Audit"}</CardTitle>
              <CardDescription className="mt-1">
                Penilaian tingkat kematangan berdasarkan COBIT 2019
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={saveAnswers}
              disabled={saving}
            >
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Menyimpan..." : "Simpan Kemajuan"}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="mb-6">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Kemajuan Keseluruhan</span>
              <span className="text-sm font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">
              {currentDomain} - {currentDomainObj?.name}
            </h3>
            <h4 className="text-md font-medium text-muted-foreground mb-4">
              {currentSubdomain.id} - {currentSubdomain.name}
            </h4>
          </div>

          <div className="space-y-6">
            {currentSubdomain.questions.map((question) => (
              <div key={question.id} className="border p-4 rounded-md">
                <div className="mb-4">
                  <h5 className="font-medium mb-2">{question.text}</h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        Tingkat Kematangan
                      </label>
                      <Select
                        value={String(question.answer?.maturity_level || "0")}
                        onValueChange={(value) => handleMaturityLevelChange(question.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih tingkat kematangan" />
                        </SelectTrigger>
                        <SelectContent>
                          {maturityLevels.map((level) => (
                            <SelectItem key={level.value} value={String(level.value)}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        {maturityLevels.find(l => l.value === (question.answer?.maturity_level || 0))?.description}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        Catatan (Opsional)
                      </label>
                      <Textarea
                        placeholder="Masukkan catatan atau bukti pendukung..."
                        value={question.answer?.notes || ""}
                        onChange={(e) => handleNotesChange(question.id, e.target.value)}
                        className="h-24"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={goToPrevSubdomain}
            disabled={currentDomain === domains[0]?.id && currentSubdomainIndex === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Sebelumnya
          </Button>

          <Button onClick={goToNextSubdomain}>
            Selanjutnya
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
