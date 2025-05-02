
import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";

// Mock COBIT domains structure with questions
const mockAuditQuestions = {
  EDM: {
    name: "Evaluate, Direct and Monitor",
    subdomains: [
      {
        id: "EDM01",
        name: "Ensured Governance Framework Setting and Maintenance",
        questions: [
          { id: "EDM01.01", text: "Apakah tata kelola TI selaras dengan tata kelola perusahaan?", answer: null },
          { id: "EDM01.02", text: "Apakah ada struktur, proses, dan praktik yang jelas untuk tata kelola TI?", answer: null },
          { id: "EDM01.03", text: "Apakah keputusan TI strategis dibuat sesuai dengan kebutuhan stakeholder?", answer: null },
        ]
      },
      {
        id: "EDM02",
        name: "Ensured Benefits Delivery",
        questions: [
          { id: "EDM02.01", text: "Apakah nilai optimal dari inisiatif TI, layanan, dan aset telah diamankan?", answer: null },
          { id: "EDM02.02", text: "Apakah ada sistem pengukuran nilai yang jelas untuk investasi TI?", answer: null },
        ]
      }
    ]
  },
  APO: {
    name: "Align, Plan and Organize",
    subdomains: [
      {
        id: "APO01",
        name: "Managed IT Management Framework",
        questions: [
          { id: "APO01.01", text: "Apakah kerangka manajemen TI selaras dengan strategi perusahaan?", answer: null },
          { id: "APO01.02", text: "Apakah peran dan tanggung jawab TI didefinisikan dengan jelas?", answer: null },
        ]
      },
      {
        id: "APO02",
        name: "Managed Strategy",
        questions: [
          { id: "APO02.01", text: "Apakah strategi TI mendukung strategi bisnis keseluruhan?", answer: null },
          { id: "APO02.02", text: "Apakah ada roadmap implementasi strategi TI yang jelas?", answer: null },
        ]
      }
    ]
  },
  BAI: {
    name: "Build, Acquire and Implement",
    subdomains: [
      {
        id: "BAI01",
        name: "Managed Programs and Projects",
        questions: [
          { id: "BAI01.01", text: "Apakah ada metodologi manajemen proyek TI yang konsisten?", answer: null },
          { id: "BAI01.02", text: "Apakah kinerja proyek TI dipantau secara teratur?", answer: null },
        ]
      }
    ]
  },
  DSS: {
    name: "Deliver, Service and Support",
    subdomains: [
      {
        id: "DSS01",
        name: "Managed Operations",
        questions: [
          { id: "DSS01.01", text: "Apakah aktivitas operasional TI dilakukan sesuai dengan kebutuhan?", answer: null },
          { id: "DSS01.02", text: "Apakah outsourcing layanan TI dikelola dengan efektif?", answer: null },
        ]
      }
    ]
  },
  MEA: {
    name: "Monitor, Evaluate and Assess",
    subdomains: [
      {
        id: "MEA01",
        name: "Managed Performance and Conformance Monitoring",
        questions: [
          { id: "MEA01.01", text: "Apakah kinerja TI dipantau secara teratur?", answer: null },
          { id: "MEA01.02", text: "Apakah target kinerja TI ditetapkan dan direvisi secara berkala?", answer: null },
        ]
      }
    ]
  }
};

export default function AuditChecklist() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { auditId } = useParams();
  const [loading, setLoading] = useState(true);
  const [auditData, setAuditData] = useState(null);
  const [currentDomain, setCurrentDomain] = useState("EDM");
  const [currentSubdomainIndex, setCurrentSubdomainIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [questions, setQuestions] = useState([]);

  // In a real app, we would fetch the audit data based on the auditId
  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setAuditData({
        id: auditId || "new-audit",
        title: "Audit Tata Kelola TI",
        domains: Object.keys(mockAuditQuestions),
      });
      setLoading(false);
    }, 500);
  }, [auditId]);

  useEffect(() => {
    if (currentDomain && mockAuditQuestions[currentDomain]) {
      setQuestions(
        mockAuditQuestions[currentDomain].subdomains[currentSubdomainIndex]?.questions || []
      );
    }
  }, [currentDomain, currentSubdomainIndex]);

  useEffect(() => {
    // Calculate overall progress
    if (auditData) {
      const totalQuestions = Object.values(mockAuditQuestions).flatMap(
        domain => domain.subdomains.flatMap(subdomain => subdomain.questions)
      ).length;
      
      const answeredQuestions = Object.values(mockAuditQuestions).flatMap(
        domain => domain.subdomains.flatMap(subdomain => 
          subdomain.questions.filter(q => q.answer !== null)
        )
      ).length;
      
      setProgress((answeredQuestions / totalQuestions) * 100);
    }
  }, [auditData, questions]);

  const handleAnswerChange = (questionId, value) => {
    setQuestions(prev => 
      prev.map(q => 
        q.id === questionId ? { ...q, answer: value } : q
      )
    );

    // Update the mock data structure (in a real app, this would be an API call)
    const updatedData = { ...mockAuditQuestions };
    updatedData[currentDomain].subdomains[currentSubdomainIndex].questions = 
      updatedData[currentDomain].subdomains[currentSubdomainIndex].questions.map(q => 
        q.id === questionId ? { ...q, answer: value } : q
      );
  };

  const handleSave = () => {
    // In a real app, this would save to the backend
    toast({
      title: "Kemajuan Disimpan",
      description: "Jawaban audit Anda telah disimpan",
    });
  };

  const goToNextSubdomain = () => {
    const currentDomainData = mockAuditQuestions[currentDomain];
    if (currentSubdomainIndex < currentDomainData.subdomains.length - 1) {
      setCurrentSubdomainIndex(currentSubdomainIndex + 1);
    } else {
      // Move to the next domain
      const domains = Object.keys(mockAuditQuestions);
      const currentIndex = domains.indexOf(currentDomain);
      if (currentIndex < domains.length - 1) {
        setCurrentDomain(domains[currentIndex + 1]);
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
      const domains = Object.keys(mockAuditQuestions);
      const currentIndex = domains.indexOf(currentDomain);
      if (currentIndex > 0) {
        setCurrentDomain(domains[currentIndex - 1]);
        setCurrentSubdomainIndex(mockAuditQuestions[domains[currentIndex - 1]].subdomains.length - 1);
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

  const currentSubdomain = mockAuditQuestions[currentDomain]?.subdomains[currentSubdomainIndex];

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
              <CardTitle>{auditData.title}</CardTitle>
              <CardDescription className="mt-1">
                Jawab pertanyaan audit untuk domain COBIT 2019
              </CardDescription>
            </div>
            <Button variant="outline" onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Simpan Kemajuan
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
              {currentDomain} - {mockAuditQuestions[currentDomain].name}
            </h3>
            <h4 className="text-md font-medium text-muted-foreground mb-4">
              {currentSubdomain.id} - {currentSubdomain.name}
            </h4>
          </div>

          <div className="space-y-6">
            {questions.map((question) => (
              <div key={question.id} className="border p-4 rounded-md">
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id={question.id}
                    checked={question.answer === true}
                    onCheckedChange={(checked) => {
                      handleAnswerChange(question.id, checked);
                    }}
                  />
                  <div className="flex-1">
                    <label 
                      htmlFor={question.id} 
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {question.text}
                    </label>
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
            disabled={currentDomain === "EDM" && currentSubdomainIndex === 0}
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
