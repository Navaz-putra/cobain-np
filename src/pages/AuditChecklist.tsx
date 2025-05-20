import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Save, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { MaturityLevelInfo } from "@/components/MaturityLevelInfo";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

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
  index?: number; // Add index property to track question numbers
}

interface Domain {
  id: string;
  name: string;
  subdomains: Subdomain[];
  selected?: boolean; // Track if domain is selected for audit
}

interface Subdomain {
  id: string;
  name: string;
  questions: AuditQuestion[];
}

// Define audit domain interface for type safety
interface AuditDomain {
  id: string;
  audit_id: string;
  domain_id: string;
  selected: boolean;
  created_at?: string;
  updated_at?: string;
}

// Define domain and subdomain names
const domainNames: Record<string, string> = {
  "EDM": "Evaluate, Direct and Monitor",
  "APO": "Align, Plan and Organize",
  "BAI": "Build, Acquire and Implement",
  "DSS": "Deliver, Service and Support",
  "MEA": "Monitor, Evaluate and Assess"
};

// Define subdomain names
const subdomainNames: Record<string, string> = {
  // EDM Subdomains
  "EDM01": "Memastikan Kerangka Tata Kelola Ditetapkan dan Dipelihara",
  "EDM02": "Memastikan Penghantaran Manfaat",
  "EDM03": "Memastikan Optimalisasi Risiko",
  "EDM04": "Memastikan Optimalisasi Sumber Daya",
  "EDM05": "Memastikan Keterlibatan Pemangku Kepentingan",
  
  // APO Subdomains
  "APO01": "Mengelola Kerangka Manajemen TI",
  "APO02": "Mengelola Strategi",
  "APO03": "Mengelola Arsitektur Perusahaan",
  "APO04": "Mengelola Inovasi",
  "APO05": "Mengelola Portfolio",
  "APO06": "Mengelola Anggaran dan Biaya",
  "APO07": "Mengelola Sumber Daya Manusia",
  "APO08": "Mengelola Hubungan",
  "APO09": "Mengelola Perjanjian Layanan",
  "APO10": "Mengelola Vendor",
  "APO11": "Mengelola Kualitas",
  "APO12": "Mengelola Risiko",
  "APO13": "Mengelola Keamanan",
  "APO14": "Mengelola Data",
  
  // BAI Subdomains
  "BAI01": "Mengelola Program",
  "BAI02": "Mengelola Definisi Persyaratan",
  "BAI03": "Mengelola Identifikasi dan Pembangunan Solusi",
  "BAI04": "Mengelola Ketersediaan dan Kapasitas",
  "BAI05": "Mengelola Perubahan Organisasi",
  "BAI06": "Mengelola Perubahan TI",
  "BAI07": "Mengelola Penerimaan dan Transisi Perubahan TI",
  "BAI08": "Mengelola Pengetahuan",
  "BAI09": "Mengelola Aset",
  "BAI10": "Mengelola Konfigurasi",
  "BAI11": "Mengelola Proyek",
  
  // DSS Subdomains
  "DSS01": "Mengelola Operasi",
  "DSS02": "Mengelola Permintaan Layanan dan Insiden",
  "DSS03": "Mengelola Masalah",
  "DSS04": "Mengelola Kontinuitas",
  "DSS05": "Mengelola Layanan Keamanan",
  "DSS06": "Mengelola Kontrol Proses Bisnis",
  
  // MEA Subdomains
  "MEA01": "Mengelola Pemantauan Kinerja dan Kesesuaian",
  "MEA02": "Memantau, Mengevaluasi, dan Menilai Sistem Pengendalian Internal",
  "MEA03": "Memantau, Mengevaluasi, dan Menilai Kepatuhan terhadap Persyaratan Eksternal",
  "MEA04": "Memantau, Mengevaluasi, dan Menilai Jaminan"
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
  const [missingAnswers, setMissingAnswers] = useState<string[]>([]);
  const [remainingDomains, setRemainingDomains] = useState<number>(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // New states for domain selection
  const [showDomainSelector, setShowDomainSelector] = useState(false);
  const [selectedDomains, setSelectedDomains] = useState<Record<string, boolean>>({});
  const [filteredDomains, setFilteredDomains] = useState<Domain[]>([]);
  
  // Reference for scrolling to top
  const topRef = useRef<HTMLDivElement>(null);
  
  // References for question elements to enable scrolling
  const questionRefs = useRef<{ [key: string]: React.RefObject<HTMLDivElement> }>({});
  
  // Add a debounce timer for auto-save
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  
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
          .select("*")
          .order('domain_id')
          .order('subdomain_id');

        if (questionError) {
          console.error("Error fetching questions:", questionError);
          toast({
            title: "Error",
            description: "Gagal mengambil daftar pertanyaan",
          });
          return;
        }

        console.log("Fetched questions:", questionData?.length);
        
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
              name: domainNames[domainId] || domainId,
              subdomains: [],
              selected: true // Default all domains to selected
            };
          }
          
          const domain = domainMap[domainId];
          let subdomain = domain.subdomains.find(sd => sd.id === subdomainId);
          
          if (!subdomain) {
            subdomain = {
              id: subdomainId,
              name: subdomainNames[subdomainId] || subdomainId,
              questions: []
            };
            domain.subdomains.push(subdomain);
          }
          
          const questionWithAnswer = {
            ...question,
            answer: answersMap[question.id] || undefined,
            index: subdomain.questions.length + 1 // Add index for question numbering
          };
          
          subdomain.questions.push(questionWithAnswer);
        });
        
        const domainsArray = Object.values(domainMap);
        setDomains(domainsArray);
        
        // Initialize selected domains
        const selectedDomainsMap: Record<string, boolean> = {};
        domainsArray.forEach(domain => {
          selectedDomainsMap[domain.id] = true; // All domains selected by default
        });
        setSelectedDomains(selectedDomainsMap);
        setFilteredDomains(domainsArray); // Initially all domains are filtered
        
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
          
          // Calculate remaining domains
          calculateRemainingDomains(domainsArray, answersMap);
        }
        
        // Check if domain selection has been made before
        // Using the custom type assertion for audit_domains table
        const { data: auditDomainsData, error: domainsError } = await (supabase
          .from('audit_domains') as any)
          .select("*")
          .eq("audit_id", auditId);

        if (domainsError) {
          console.error("Error fetching audit domains:", domainsError);
        }
          
        if (auditDomainsData && auditDomainsData.length > 0) {
          // Use stored domain selections
          const storedSelectedDomains: Record<string, boolean> = {};
          auditDomainsData.forEach((domainData: AuditDomain) => {
            storedSelectedDomains[domainData.domain_id] = domainData.selected;
          });
          setSelectedDomains(storedSelectedDomains);
          
          // Filter domains based on stored selections
          const filteredDomainsArray = domainsArray.filter(domain => 
            storedSelectedDomains[domain.id]
          );
          setFilteredDomains(filteredDomainsArray);
          
          if (filteredDomainsArray.length > 0) {
            setCurrentDomain(filteredDomainsArray[0].id);
            if (filteredDomainsArray[0].subdomains.length > 0) {
              setQuestions(filteredDomainsArray[0].subdomains[0].questions);
            }
          }
          
          // Show domain selector if this is a new audit (no answers yet)
          if (!answersData || answersData.length === 0) {
            setShowDomainSelector(true);
          }
        } else {
          // Show domain selector if no selections have been stored
          setShowDomainSelector(true);
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

  // Calculate remaining domains to complete
  const calculateRemainingDomains = (domains: Domain[], answers: Record<string, any>) => {
    let remaining = 0;
    
    domains.forEach(domain => {
      const domainQuestions = domain.subdomains.flatMap(sd => sd.questions);
      const answeredDomainQuestions = domainQuestions.filter(q => answers[q.id]);
      
      if (answeredDomainQuestions.length < domainQuestions.length) {
        remaining++;
      }
    });
    
    setRemainingDomains(remaining);
  };

  // Update questions when domain or subdomain changes
  useEffect(() => {
    if (filteredDomains.length > 0 && currentDomain) {
      const domain = filteredDomains.find(d => d.id === currentDomain);
      if (domain && domain.subdomains.length > 0 && domain.subdomains[currentSubdomainIndex]) {
        const newQuestions = domain.subdomains[currentSubdomainIndex].questions;
        setQuestions(newQuestions);
        
        // Initialize refs for each question
        newQuestions.forEach(q => {
          if (!questionRefs.current[q.id]) {
            questionRefs.current[q.id] = React.createRef();
          }
        });
        
        // Clear missing answers highlight when changing domain/subdomain
        setMissingAnswers([]);
        
        // Scroll to top when domain or subdomain changes
        if (topRef.current) {
          topRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }, [currentDomain, currentSubdomainIndex, filteredDomains]);

  const handleMaturityLevelChange = async (questionId: string, value: string, index: number) => {
    const maturityLevel = parseInt(value);
    
    // Update local state
    const newAnswers = { ...answers };
    newAnswers[questionId] = {
      maturity_level: maturityLevel,
      notes: newAnswers[questionId]?.notes || null
    };
    setAnswers(newAnswers);
    
    // Remove from missing answers if it was there
    setMissingAnswers(prev => prev.filter(id => id !== questionId));
    
    // Update questions state for UI immediately
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? { ...q, answer: { maturity_level: maturityLevel, notes: newAnswers[questionId]?.notes || null }}
        : q
    ));
    
    // Update progress
    if (domains.length > 0) {
      const totalQuestions = filteredDomains.flatMap(domain => 
        domain.subdomains.flatMap(subdomain => subdomain.questions)
      ).length;
      
      const answeredQuestions = Object.keys(newAnswers).length;
      setProgress((answeredQuestions / totalQuestions) * 100);
      
      // Recalculate remaining domains
      calculateRemainingDomains(filteredDomains, newAnswers);
    }
    
    // Auto-save after a short delay
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    autoSaveTimerRef.current = setTimeout(() => {
      autoSaveAnswers();
    }, 1000);
    
    // Scroll to the next question after a short delay
    setTimeout(() => {
      // Find the next question reference
      const nextQuestionIndex = index + 1;
      if (nextQuestionIndex < questions.length) {
        const nextQuestionId = questions[nextQuestionIndex].id;
        const nextQuestionRef = questionRefs.current[nextQuestionId];
        
        if (nextQuestionRef && nextQuestionRef.current) {
          nextQuestionRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
          });
        }
      }
    }, 300); // Small delay to ensure the UI updates first
  };
  
  // Optional function to save individual answers without updating the whole batch
  // const saveAnswerToDatabase = async (questionId: string, maturityLevel: number, notes: string | null) => {
  //   if (!auditId) return;
  //   
  //   try {
  //     const { error } = await supabase
  //       .from("audit_answers")
  //       .upsert({
  //         audit_id: auditId,
  //         question_id: questionId,
  //         maturity_level: maturityLevel,
  //         notes: notes
  //       });
  //     
  //     if (error) {
  //       console.error("Error saving individual answer:", error);
  //     }
  //   } catch (error) {
  //     console.error("Error in saveAnswerToDatabase:", error);
  //   }
  // };

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
    
    // Auto-save notes after a longer delay (to avoid saving on every keystroke)
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    autoSaveTimerRef.current = setTimeout(() => {
      autoSaveAnswers();
    }, 2000);
  };

  // New function for auto-saving
  const autoSaveAnswers = async () => {
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
      
      if (answersToSave.length === 0) {
        setSaving(false);
        return;
      }
      
      // Upsert answers (insert if not exists, update if exists)
      const { error } = await supabase
        .from("audit_answers")
        .upsert(answersToSave, { onConflict: 'audit_id,question_id' });
      
      if (error) {
        throw error;
      }
      
      // Update last saved timestamp
      setLastSaved(new Date());
      
      // Optional: Show a subtle toast notification
      toast({
        title: "Auto-saved",
        description: "Kemajuan audit disimpan otomatis",
        duration: 2000,  // shorter duration for less intrusive notification
      });
    } catch (error) {
      console.error("Error auto-saving answers:", error);
      // Only show error toast for auto-save failures
      toast({
        title: "Error",
        description: "Gagal menyimpan otomatis, silakan coba simpan manual",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Keep the original saveAnswers function for manual saves
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
      
      // Update last saved timestamp
      setLastSaved(new Date());
      
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

  const validateSubdomainAnswers = () => {
    // Check if all questions in the current subdomain have maturity levels assigned
    const missingQuestionIds = questions
      .filter(q => !answers[q.id]?.maturity_level && answers[q.id]?.maturity_level !== 0)
      .map(q => q.id);
    
    if (missingQuestionIds.length > 0) {
      setMissingAnswers(missingQuestionIds);
      toast({
        title: "Peringatan",
        description: "Semua tingkat kematangan harus diisi sebelum melanjutkan",
      });
      return false;
    }
    
    return true;
  };

  const goToNextSubdomain = () => {
    // Validate that all questions in current subdomain have answers
    if (!validateSubdomainAnswers()) {
      return;
    }
    
    // Auto-save answers when going to next subdomain
    autoSaveAnswers();
    
    const currentDomainObj = filteredDomains.find(d => d.id === currentDomain);
    if (!currentDomainObj) return;
    
    if (currentSubdomainIndex < currentDomainObj.subdomains.length - 1) {
      setCurrentSubdomainIndex(currentSubdomainIndex + 1);
    } else {
      // Move to the next domain
      const currentDomainIndex = filteredDomains.findIndex(d => d.id === currentDomain);
      if (currentDomainIndex < filteredDomains.length - 1) {
        setCurrentDomain(filteredDomains[currentDomainIndex + 1].id);
        setCurrentSubdomainIndex(0);
      } else {
        // We've reached the end of the audit
        toast({
          title: "Audit Selesai",
          description: "Anda telah menyelesaikan semua pertanyaan audit",
        });
        // Save answers when reaching the end
        saveAnswers();
      }
    }
    
    // Scroll to top happens in the useEffect that watches currentDomain and currentSubdomainIndex
  };

  const goToPrevSubdomain = () => {
    // Auto-save answers when going to previous subdomain
    autoSaveAnswers();
    
    if (currentSubdomainIndex > 0) {
      setCurrentSubdomainIndex(currentSubdomainIndex - 1);
    } else {
      // Move to the previous domain
      const currentDomainIndex = filteredDomains.findIndex(d => d.id === currentDomain);
      if (currentDomainIndex > 0) {
        setCurrentDomain(filteredDomains[currentDomainIndex - 1].id);
        const prevDomain = filteredDomains[currentDomainIndex - 1];
        setCurrentSubdomainIndex(prevDomain.subdomains.length - 1);
      }
    }
  };
  
  // Function to toggle domain selection
  const toggleDomainSelection = (domainId: string) => {
    setSelectedDomains(prev => ({
      ...prev,
      [domainId]: !prev[domainId]
    }));
  };
  
  // Function to save domain selections
  const saveDomainSelections = async () => {
    if (!auditId) return;
    
    try {
      setSaving(true);
      
      // Delete any existing domain selections
      const { error: deleteError } = await (supabase
        .from('audit_domains') as any)
        .delete()
        .eq("audit_id", auditId);
        
      if (deleteError) {
        throw deleteError;
      }
      
      // Insert new domain selections
      const domainSelectionsToSave = Object.entries(selectedDomains).map(([domainId, selected]) => ({
        audit_id: auditId,
        domain_id: domainId,
        selected: selected
      }));
      
      // Using any type to bypass TypeScript check for now
      const { error } = await (supabase
        .from('audit_domains') as any)
        .insert(domainSelectionsToSave);
      
      if (error) {
        throw error;
      }
      
      // Update filtered domains
      const newFilteredDomains = domains.filter(domain => selectedDomains[domain.id]);
      setFilteredDomains(newFilteredDomains);
      
      // Update current domain if needed
      if (newFilteredDomains.length > 0) {
        if (!selectedDomains[currentDomain]) {
          setCurrentDomain(newFilteredDomains[0].id);
          setCurrentSubdomainIndex(0);
        }
      }
      
      // Close the domain selector
      setShowDomainSelector(false);
      
      toast({
        title: "Sukses",
        description: "Domain audit berhasil disimpan",
      });
    } catch (error) {
      console.error("Error saving domain selections:", error);
      toast({
        title: "Error",
        description: "Gagal menyimpan pilihan domain audit",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <p>Memuat data audit...</p>
      </div>
    );
  }

  const currentDomainObj = filteredDomains.find(d => d.id === currentDomain);
  const currentSubdomain = currentDomainObj?.subdomains[currentSubdomainIndex];

  // Map maturity levels to colors for visual indication
  const getMaturityColor = (level: number) => {
    switch (level) {
      case 0: return "maturity0"; 
      case 1: return "maturity1";
      case 2: return "maturity2";
      case 3: return "maturity3";
      case 4: return "maturity4";
      case 5: return "maturity5";
      default: return "default";
    }
  };

  // Generate background colors for maturity level badges
  const getMaturityBadgeColor = (level: number) => {
    switch (level) {
      case 0: return "bg-red-100 text-red-800 border-red-300";
      case 1: return "bg-orange-100 text-orange-800 border-orange-300";
      case 2: return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case 3: return "bg-blue-100 text-blue-800 border-blue-300";
      case 4: return "bg-indigo-100 text-indigo-800 border-indigo-300";
      case 5: return "bg-green-100 text-green-800 border-green-300";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Reference for scrolling to top */}
      <div ref={topRef} />
      
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
                {lastSaved && (
                  <span className="block text-xs text-muted-foreground mt-1">
                    Terakhir disimpan: {lastSaved.toLocaleTimeString()}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog open={showDomainSelector} onOpenChange={setShowDomainSelector}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Pilih Domain
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Pilih Domain untuk Audit</DialogTitle>
                    <DialogDescription>
                      Pilih domain yang akan diaudit dalam penilaian ini. Domain yang tidak dipilih tidak akan ditampilkan dalam checklist.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="py-4 space-y-4">
                    {domains.map((domain) => (
                      <div key={domain.id} className="flex items-start space-x-3">
                        <Checkbox 
                          id={`domain-${domain.id}`}
                          checked={selectedDomains[domain.id] || false}
                          onCheckedChange={() => toggleDomainSelection(domain.id)}
                        />
                        <div>
                          <label 
                            htmlFor={`domain-${domain.id}`}
                            className="font-medium text-sm cursor-pointer"
                          >
                            {domain.id} - {domain.name}
                          </label>
                          <p className="text-xs text-muted-foreground">
                            {domain.subdomains.length} subdomain, {domain.subdomains.reduce((count, sd) => count + sd.questions.length, 0)} pertanyaan
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShowDomainSelector(false)}
                    >
                      Batal
                    </Button>
                    <Button 
                      type="button"
                      onClick={saveDomainSelections}
                      disabled={saving || Object.values(selectedDomains).filter(Boolean).length === 0}
                    >
                      {saving ? "Menyimpan..." : "Simpan Pilihan"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Button 
                variant="outline" 
                onClick={saveAnswers}
                disabled={saving}
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Menyimpan..." : "Simpan Manual"}
              </Button>
            </div>
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

          {!currentDomainObj || !currentSubdomain ? (
            <div className="text-center py-8">
              <p className="text-lg text-muted-foreground">
                Tidak ada domain yang dipilih untuk audit. Silakan pilih minimal satu domain.
              </p>
              <Button 
                className="mt-4" 
                onClick={() => setShowDomainSelector(true)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Pilih Domain
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium mb-2">
                      {currentDomain} - {currentDomainObj?.name}
                    </h3>
                    <h4 className="text-md font-medium text-muted-foreground mb-4">
                      {currentSubdomain.id} - {currentSubdomain.name}
                    </h4>
                  </div>
                  
                  <Select
                    value={`${currentDomain}-${currentSubdomainIndex}`}
                    onValueChange={(value) => {
                      // Auto-save before changing domain/subdomain
                      autoSaveAnswers();
                      const [domainId, subdomainIdx] = value.split('-');
                      setCurrentDomain(domainId);
                      setCurrentSubdomainIndex(parseInt(subdomainIdx));
                    }}
                  >
                    <SelectTrigger className="w-[240px]">
                      <SelectValue placeholder="Pilih domain/subdomain" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredDomains.map((domain) => (
                        <React.Fragment key={domain.id}>
                          {domain.subdomains.map((subdomain, index) => (
                            <SelectItem key={`${domain.id}-${index}`} value={`${domain.id}-${index}`}>
                              {domain.id} - {subdomain.id}: {subdomain.name}
                            </SelectItem>
                          ))}
                        </React.Fragment>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-8">
                {currentSubdomain.questions.map((question, questionIndex) => (
                  <div 
                    key={question.id} 
                    ref={questionRefs.current[question.id] || (questionRefs.current[question.id] = React.createRef())}
                    className={`bg-white border p-6 rounded-lg shadow-sm ${missingAnswers.includes(question.id) ? 'border-red-500' : 'border-gray-200'}`}
                  >
                    <div>
                      <h5 className="font-medium text-lg mb-6">
                        <span className="inline-flex items-center justify-center bg-primary text-white rounded-full w-6 h-6 text-sm mr-2">
                          {question.index}
                        </span>
                        {question.text}
                      </h5>
                      
                      <div className="flex flex-col gap-6">
                        <div>
                          <label className="text-sm font-medium mb-3 block">
                            Tingkat Kematangan <span className="text-red-500">*</span>
                          </label>
                          
                          <div className="flex flex-col space-y-4">
                            <ToggleGroup 
                              type="single" 
                              value={String(question.answer?.maturity_level ?? "")}
                              onValueChange={(value) => value && handleMaturityLevelChange(question.id, value, questionIndex)}
                              className="flex flex-wrap"
                            >
                              {maturityLevels.map((level) => (
                                <ToggleGroupItem 
                                  key={level.value} 
                                  value={String(level.value)}
                                  variant={getMaturityColor(level.value)}
                                  className="flex-1 py-3 font-medium text-sm"
                                  aria-label={level.label}
                                >
                                  {level.label}
                                </ToggleGroupItem>
                              ))}
                            </ToggleGroup>
                            
                            {missingAnswers.includes(question.id) && (
                              <p className="text-xs text-red-500 mt-1">
                                Tingkat kematangan wajib diisi
                              </p>
                            )}
                            
                            {question.answer?.maturity_level !== undefined && (
                              <div className="mt-3 transition-all duration-300 animate-fade-in">
                                <div className={`text-sm px-4 py-3 rounded-md border ${getMaturityBadgeColor(question.answer.maturity_level)}`}>
                                  <span className="font-medium">Level {question.answer.maturity_level} dipilih:</span>{" "}
                                  {maturityLevels.find(l => l.value === question.answer?.maturity_level)?.description}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <label className="text-sm font-medium mb-2 block">
                            Catatan (Opsional)
                          </label>
                          <Textarea
                            placeholder="Masukkan catatan atau bukti pendukung..."
                            value={question.answer?.notes || ""}
                            onChange={(e) => handleNotesChange(question.id, e.target.value)}
                            className="h-24 border-gray-200 focus:border-gray-300"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>

        {(currentDomainObj && currentSubdomain) && (
          <CardFooter className="flex justify-between pt-6 border-t mt-6">
            <Button 
              variant="outline" 
              onClick={goToPrevSubdomain}
              disabled={currentDomain === filteredDomains[0]?.id && currentSubdomainIndex === 0}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Sebelumnya
            </Button>

            <Button onClick={goToNextSubdomain}>
              Selanjutnya
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
