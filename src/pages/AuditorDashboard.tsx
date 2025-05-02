import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  ClipboardCheck, FileCheck, BarChart, Clock, ChevronRight, AlertCircle 
} from "lucide-react";

// Mock audit data
const mockAudits = [
  {
    id: 1,
    title: "Annual IT Governance Audit",
    date: "2025-03-15",
    domains: ["EDM", "APO"],
    status: "in-progress",
    progress: 35,
  },
  {
    id: 2,
    title: "Security Controls Assessment",
    date: "2025-02-20",
    domains: ["DSS"],
    status: "completed",
    progress: 100,
  },
  {
    id: 3,
    title: "Project Governance Review",
    date: "2025-04-10",
    domains: ["BAI"],
    status: "planned",
    progress: 0,
  },
];

// Recent activity mock data
const mockActivities = [
  {
    id: 1,
    action: "Completed security controls assessment",
    date: "2025-03-01 14:25",
    icon: FileCheck,
  },
  {
    id: 2,
    action: "Started annual IT governance audit",
    date: "2025-02-15 09:12",
    icon: ClipboardCheck,
  },
  {
    id: 3,
    action: "Generated maturity report for Q1",
    date: "2025-02-01 11:45",
    icon: BarChart,
  },
];

export default function AuditorDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isStartAuditDialogOpen, setIsStartAuditDialogOpen] = useState(false);
  
  // New audit form state
  const [newAudit, setNewAudit] = useState({
    title: "",
    date: "",
    domains: [],
  });

  const handleStartAudit = () => {
    // In a real app, this would be an API call
    toast({
      title: "Audit Started",
      description: `Created new audit: ${newAudit.title}`,
    });
    setIsStartAuditDialogOpen(false);
    setNewAudit({
      title: "",
      date: "",
      domains: [],
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in-progress":
        return (
          <div className="flex items-center text-amber-600 dark:text-amber-400">
            <Clock className="h-4 w-4 mr-1" />
            <span>In Progress</span>
          </div>
        );
      case "completed":
        return (
          <div className="flex items-center text-green-600 dark:text-green-400">
            <FileCheck className="h-4 w-4 mr-1" />
            <span>Completed</span>
          </div>
        );
      case "planned":
        return (
          <div className="flex items-center text-blue-600 dark:text-blue-400">
            <ClipboardCheck className="h-4 w-4 mr-1" />
            <span>Planned</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">{t("auditor.title")}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Welcome Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Selamat Datang, {user?.name}!</CardTitle>
            <CardDescription>{t("auditor.welcome")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Sebagai auditor, Anda dapat melakukan penilaian COBIT 2019, melacak kemajuan Anda, 
                dan menghasilkan laporan. Gunakan dasbor untuk mengelola aktivitas audit Anda.
              </p>
              <div className="flex justify-center">
                <img 
                  src="/lovable-uploads/81c0d83a-211c-4ccb-95b8-199c8fe9a8b4.png" 
                  alt="COBAIN Logo" 
                  className="h-16 w-16" 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Aksi Cepat</CardTitle>
            <CardDescription>Tugas auditor umum</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/start-audit">
              <Button className="w-full justify-start" variant="outline">
                <ClipboardCheck className="mr-2 h-4 w-4" />
                {t("auditor.startAudit")}
              </Button>
            </Link>

            <Button className="w-full justify-start" variant="outline">
              <FileCheck className="mr-2 h-4 w-4" />
              {t("auditor.continueAudit")}
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <BarChart className="mr-2 h-4 w-4" />
              {t("auditor.viewResults")}
            </Button>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Statistics</CardTitle>
            <CardDescription>Your audit activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Total Audits</span>
                  <span className="font-medium">{mockAudits.length}</span>
                </div>
                <Progress value={100} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Completed</span>
                  <span className="font-medium">
                    {mockAudits.filter((a) => a.status === "completed").length} / {mockAudits.length}
                  </span>
                </div>
                <Progress 
                  value={
                    (mockAudits.filter((a) => a.status === "completed").length / 
                    mockAudits.length) * 100
                  }
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>In Progress</span>
                  <span className="font-medium">
                    {mockAudits.filter((a) => a.status === "in-progress").length} / {mockAudits.length}
                  </span>
                </div>
                <Progress 
                  value={
                    (mockAudits.filter((a) => a.status === "in-progress").length / 
                    mockAudits.length) * 100
                  }
                  className="bg-amber-200 dark:bg-amber-900"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Audits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Audit Saya</CardTitle>
              <CardDescription>Daftar penilaian COBIT 2019 Anda</CardDescription>
            </CardHeader>
            <CardContent>
              {mockAudits.length > 0 ? (
                <div className="space-y-4">
                  {mockAudits.map((audit) => (
                    <div
                      key={audit.id}
                      className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">{audit.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Tanggal: {audit.date}
                        </p>
                        <div className="mt-2 flex items-center space-x-2">
                          <div className="text-sm">
                            Domain: {audit.domains.join(", ")}
                          </div>
                        </div>
                      </div>

                      <div className="sm:text-right flex flex-col justify-between items-start sm:items-end">
                        <div className="mb-2">{getStatusBadge(audit.status)}</div>
                        <div className="w-full sm:w-32 flex flex-col">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progres</span>
                            <span>{audit.progress}%</span>
                          </div>
                          <Progress value={audit.progress} className="h-2" />
                        </div>
                        <Button className="mt-2" variant="outline" size="sm">
                          <span>Lihat</span>
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="flex justify-center mb-4">
                    <ClipboardCheck className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Belum Ada Audit</h3>
                  <p className="text-muted-foreground mb-4">
                    Anda belum membuat audit apapun.
                  </p>
                  <Link to="/start-audit">
                    <Button>Mulai Audit Pertama Anda</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Aktivitas Terbaru</CardTitle>
            <CardDescription>Tindakan terbaru Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-4 py-2 border-b last:border-0"
                >
                  <div className="bg-muted rounded-full p-2">
                    <activity.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full">
              Lihat Semua Aktivitas
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Notifications */}
      <div className="mt-6">
        <Card className="border-amber-300 dark:border-amber-700">
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
              <CardTitle className="text-amber-600 dark:text-amber-400">Notifikasi</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-start space-x-4 py-2">
                <div className="text-sm">
                  <span className="font-medium">Audit Tata Kelola TI Tahunan</span> - 
                  Batas waktu untuk menyelesaikan audit ini akan segera berakhir (14 hari tersisa).
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
