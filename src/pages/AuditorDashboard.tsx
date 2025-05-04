import { useState, useEffect } from "react";
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
  ClipboardCheck, FileCheck, BarChart, Clock, ChevronRight, FileText,
  Info, Settings, Layout, Award, User, LogOut, Key
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PDFReport } from "@/components/PDFReport";
import { GettingStartedGuide } from "@/components/GettingStartedGuide";
import { MaturityLevelInfo } from "@/components/MaturityLevelInfo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  
  // Fetch user's audits from the database
  useEffect(() => {
    const fetchAudits = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from("audits")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
          
        if (error) {
          throw error;
        }
        
        // Fetch audit progress for each audit
        const auditsWithProgress = await Promise.all((data || []).map(async (audit) => {
          const progress = await getAuditProgress(audit.id);
          return {
            ...audit,
            progress: Math.round(progress)
          };
        }));
        
        setAudits(auditsWithProgress);
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
  }, [user, toast]);

  // Handle password change
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Password baru tidak cocok dengan konfirmasi",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setChangingPassword(true);
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast({
        title: "Sukses",
        description: "Password berhasil diubah"
      });
      
      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setAccountDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal mengubah password",
        variant: "destructive"
      });
    } finally {
      setChangingPassword(false);
    }
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
      toast({
        title: "Sukses",
        description: "Anda berhasil keluar"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal keluar dari akun",
        variant: "destructive"
      });
    }
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
      
      const totalQuestions = parseInt(questionsData[0]?.count as string) || 0;
      const answeredQuestions = parseInt(answersData[0]?.count as string) || 0;
      
      return totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
    } catch (error) {
      console.error("Error calculating audit progress:", error);
      return 0;
    }
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-950 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header with welcome banner */}
        <div className="mb-8 bg-gradient-to-r from-cobain-blue to-cobain-burgundy rounded-xl overflow-hidden shadow-lg">
          <div className="px-6 py-8 md:py-12 md:px-10 flex flex-col md:flex-row items-center justify-between">
            <div className="text-white mb-4 md:mb-0">
              <h1 className="text-3xl md:text-4xl font-bold">{t("auditor.title")}</h1>
              <p className="mt-2 opacity-90">
                Selamat datang di platform audit COBIT 2019. Mulai audit tata kelola TI atau lanjutkan pekerjaan Anda.
              </p>
              <div className="flex items-center gap-3 mt-4">
                <Link to="/start-audit">
                  <Button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm">
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    Mulai Audit Baru
                  </Button>
                </Link>
                {audits.length > 0 && (
                  <Link to={`/audit-checklist/${audits[0]?.id}`}>
                    <Button variant="outline" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border-white/30">
                      <Settings className="mr-2 h-4 w-4" />
                      Kelola Audit
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center justify-center">
              <img 
                src="/lovable-uploads/81c0d83a-211c-4ccb-95b8-199c8fe9a8b4.png" 
                alt="COBAIN Logo" 
                className="h-24 w-24 md:h-32 md:w-32 object-contain" 
              />
            </div>
          </div>
        </div>

        {/* User Account Settings Dialog */}
        <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Pengaturan Akun</DialogTitle>
              <DialogDescription>
                Ubah password atau keluar dari akun Anda di sini.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="current-password" className="text-right">Password Saat Ini</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-password" className="text-right">Password Baru</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="confirm-password" className="text-right">Konfirmasi Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={handleLogout} variant="outline" className="w-full sm:w-auto">
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
              </Button>
              <Button onClick={handleChangePassword} disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword} className="w-full sm:w-auto">
                {changingPassword ? (
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                ) : (
                  <Key className="mr-2 h-4 w-4" />
                )}
                Ubah Password
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Info and Quick Links */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <GettingStartedGuide />
          </div>
          <div>
            <MaturityLevelInfo />
          </div>
        </div>

        {/* Dashboard Content */}
        <Tabs defaultValue="current-audits" className="mb-6">
          <div className="flex justify-between items-center">
            <TabsList className="bg-background/80 backdrop-blur-sm">
              <TabsTrigger value="current-audits" className="flex items-center">
                <Layout className="mr-2 h-4 w-4" />
                Audit Saya
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center">
                <BarChart className="mr-2 h-4 w-4" />
                Statistik
              </TabsTrigger>
              <TabsTrigger value="activities" className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                Aktivitas
              </TabsTrigger>
            </TabsList>
            
            {/* Account Settings Button */}
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2" 
              onClick={() => setAccountDialogOpen(true)}
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Pengaturan Akun</span>
            </Button>
          </div>

          <TabsContent value="current-audits" className="pt-4">
            <Card className="shadow-md border-gray-200 dark:border-gray-800">
              <CardHeader className="bg-card border-b">
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5 text-cobain-blue" />
                  Audit Saya
                </CardTitle>
                <CardDescription>Daftar penilaian COBIT 2019 Anda</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="mt-2">Memuat data audit...</p>
                  </div>
                ) : audits.length > 0 ? (
                  <div className="grid gap-5">
                    {audits.map((audit) => (
                      <div
                        key={audit.id}
                        className="flex flex-col sm:flex-row bg-card hover:bg-muted/20 transition-colors space-y-3 sm:space-y-0 sm:space-x-4 p-5 border rounded-lg shadow-sm"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-lg">{audit.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Tanggal Audit: {audit.audit_date}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <div className="text-sm flex items-center">
                              <Info className="h-3.5 w-3.5 mr-1" />
                              Organisasi: <span className="font-medium ml-1">{audit.organization}</span>
                            </div>
                            <div className="ml-4 text-sm">
                              {getStatusBadge(audit.status)}
                            </div>
                          </div>
                          <div className="mt-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{audit.progress || 0}%</span>
                            </div>
                            <Progress value={audit.progress || 0} className="h-2" />
                          </div>
                        </div>

                        <div className="sm:text-right flex flex-col justify-between items-start sm:items-end">
                          <div className="flex gap-2 mt-3 sm:mt-0">
                            <PDFReport
                              auditId={audit.id}
                              variant="default" 
                              size="sm"
                              label="Lihat Laporan"
                              className="bg-cobain-burgundy hover:bg-cobain-burgundy/90"
                            />
                            <Link to={`/audit-checklist/${audit.id}`}>
                              <Button variant="outline" size="sm" className="flex items-center">
                                <span>Lanjutkan</span>
                                <ChevronRight className="ml-1 h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-muted/20 rounded-lg border border-dashed">
                    <div className="flex justify-center mb-4">
                      <ClipboardCheck className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Belum Ada Audit</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Anda belum membuat audit apapun. Mulai audit pertama Anda untuk menilai tingkat kematangan tata kelola TI.
                    </p>
                    <Link to="/start-audit">
                      <Button size="lg" className="bg-cobain-blue hover:bg-cobain-blue/90">
                        <ClipboardCheck className="mr-2 h-4 w-4" />
                        Mulai Audit Pertama Anda
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-center border-t pt-4 pb-2">
                <Link to="/start-audit">
                  <Button variant="outline">
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    Buat Audit Baru
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="pt-4">
            <Card className="shadow-md border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle>Statistik Audit</CardTitle>
                <CardDescription>Ringkasan aktivitas audit Anda</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-card rounded-lg p-4 border shadow-sm">
                    <div className="text-muted-foreground text-sm">Total Audit</div>
                    <div className="text-2xl font-bold mt-1">{audits.length || mockAudits.length}</div>
                  </div>
                  
                  <div className="bg-card rounded-lg p-4 border shadow-sm">
                    <div className="text-muted-foreground text-sm">Audit Selesai</div>
                    <div className="text-2xl font-bold mt-1 text-green-600 dark:text-green-500">
                      {audits.filter(a => a.status === "completed").length || mockAudits.filter(a => a.status === "completed").length}
                    </div>
                  </div>
                  
                  <div className="bg-card rounded-lg p-4 border shadow-sm">
                    <div className="text-muted-foreground text-sm">Sedang Berjalan</div>
                    <div className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-500">
                      {audits.filter(a => a.status === "in-progress").length || mockAudits.filter(a => a.status === "in-progress").length}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Total Audits</span>
                      <span className="font-medium">{mockAudits.length}</span>
                    </div>
                    <Progress value={100} className="h-2"/>
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
                      className="h-2 bg-muted"
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
                      className="h-2 bg-amber-200 dark:bg-amber-900"
                    />
                  </div>
                </div>

                {/* Domain coverage chart placeholder */}
                <div className="mt-8 border rounded-lg p-6 bg-muted/10">
                  <h3 className="text-sm font-medium mb-4">Domain Coverage</h3>
                  <div className="grid grid-cols-5 gap-2 text-center">
                    {['EDM', 'APO', 'BAI', 'DSS', 'MEA'].map((domain) => {
                      const auditCount = mockAudits.filter(a => a.domains?.includes(domain)).length;
                      const percentage = (auditCount / mockAudits.length) * 100;
                      
                      return (
                        <div key={domain} className="flex flex-col items-center">
                          <div className="text-sm font-medium mb-1">{domain}</div>
                          <div className="w-full bg-muted rounded-full h-16 flex items-end overflow-hidden">
                            <div 
                              className="bg-cobain-blue dark:bg-cobain-blue/80 w-full" 
                              style={{ height: `${percentage}%` }}
                            ></div>
                          </div>
                          <div className="text-xs mt-1">{Math.round(percentage)}%</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activities" className="pt-4">
            <Card className="shadow-md border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  Aktivitas Terbaru
                </CardTitle>
                <CardDescription>Tindakan terbaru Anda pada platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-4 py-3 px-2 border-b last:border-0 hover:bg-muted/10 rounded-md transition-colors"
                    >
                      <div className="bg-primary/10 rounded-full p-2.5">
                        <activity.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{activity.action}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-center border-t">
                <Button variant="ghost" className="text-sm">
                  Lihat Semua Aktivitas
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
