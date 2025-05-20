import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, FileText, Plus, LogOut, FileOutput } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { UserManagement } from "./UserManagement";
import { QuestionManagement } from "./QuestionManagement";
import { ReportManagement } from "./ReportManagement";

// Domain and subdomain structure (used in overview stats)
const domainStructure = [
  {
    id: "EDM",
    name: "Evaluasi, Arahkan dan Pantau",
    subdomains: [
      { id: "EDM01", name: "Memastikan Pengaturan dan Pemeliharaan Kerangka Tata Kelola" },
      { id: "EDM02", name: "Memastikan Penyampaian Manfaat" },
      { id: "EDM03", name: "Memastikan Optimalisasi Risiko" },
    ]
  },
  {
    id: "APO",
    name: "Selaraskan, Rencanakan dan Organisasikan",
    subdomains: [
      { id: "APO01", name: "Mengelola Kerangka Manajemen TI" },
      { id: "APO09", name: "Mengelola Perjanjian Layanan" },
      { id: "APO10", name: "Mengelola Vendor" },
    ]
  },
  {
    id: "BAI",
    name: "Bangun, Peroleh dan Implementasikan",
    subdomains: [
      { id: "BAI03", name: "Mengelola Identifikasi dan Pembuatan Solusi" },
      { id: "BAI06", name: "Mengelola Perubahan TI" },
    ]
  },
  {
    id: "DSS",
    name: "Kirim, Layani dan Dukung",
    subdomains: [
      { id: "DSS01", name: "Mengelola Operasi" },
      { id: "DSS02", name: "Mengelola Permintaan Layanan dan Insiden" },
    ]
  },
  {
    id: "MEA",
    name: "Pantau, Evaluasi dan Nilai",
    subdomains: [
      { id: "MEA01", name: "Mengelola Pemantauan Kinerja dan Kesesuaian" },
      { id: "MEA02", name: "Mengelola Sistem Pengendalian Internal" },
    ]
  }
];

interface AdminDashboardComponentsProps {
  userCount: number;
  questionCount: number;
  auditCount: number;
  showTokenError?: boolean;
  tokenErrorMessage?: string;
}

export const DashboardOverview = ({ userCount, questionCount, auditCount }: {
  userCount: number;
  questionCount: number;
  auditCount: number;
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {/* Overview Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Ringkasan</CardTitle>
          <CardDescription>Statistik platform audit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Pengguna</span>
              <span className="text-2xl font-bold">{userCount}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Pertanyaan</span>
              <span className="text-2xl font-bold">{questionCount}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Domain</span>
              <span className="text-2xl font-bold">{domainStructure.length}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Audit</span>
              <span className="text-2xl font-bold">{auditCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Tindakan Cepat</CardTitle>
          <CardDescription>Tugas admin umum</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button className="w-full justify-start" variant="outline" id="users-tab-trigger">
            <Users className="mr-2 h-4 w-4" />
            Manajemen Pengguna
          </Button>
          <Button className="w-full justify-start" variant="outline" id="questions-tab-trigger">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Pertanyaan Baru
          </Button>
          <Button className="w-full justify-start" variant="outline" id="reports-tab-trigger">
            <FileText className="mr-2 h-4 w-4" />
            Lihat Laporan Audit
          </Button>
        </CardContent>
      </Card>

      {/* Welcome */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Selamat Datang!</CardTitle>
          <CardDescription>Dasbor Admin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Sebagai administrator, Anda dapat mengelola pengguna, pertanyaan audit, dan melihat laporan.
              Gunakan tab di bawah ini untuk menavigasi melalui berbagai bagian manajemen.
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
    </div>
  );
}

export const TokenErrorCard = ({ message }: { message: string }) => {
  const { logout } = useAuth();

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Error Akses Admin</CardTitle>
        <CardDescription>Terjadi kesalahan saat mengakses fitur admin</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-destructive">{message}</p>
          <p>
            Pastikan Anda telah login dengan akun admin yang valid. Jika masalah berlanjut,
            coba logout dan login kembali.
          </p>
          <div className="flex justify-center">
            <Button 
              variant="default" 
              onClick={() => {
                logout();
                window.location.href = "/login";
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout dan Coba Lagi
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const AdminDashboardComponents = ({
  userCount,
  questionCount,
  auditCount,
  showTokenError = false,
  tokenErrorMessage = "No admin access token available. Please try logging out and logging back in."
}: AdminDashboardComponentsProps) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("users");

  // Hardcoded superadmin email for auth check
  const hardcodedSuperadminEmail = "navazputra@students.amikom.ac.id";

  // Set up event listeners for the quick action buttons
  useEffect(() => {
    const usersTabTrigger = document.getElementById("users-tab-trigger");
    const questionsTabTrigger = document.getElementById("questions-tab-trigger");
    const reportsTabTrigger = document.getElementById("reports-tab-trigger");

    if (usersTabTrigger) {
      usersTabTrigger.addEventListener("click", () => {
        const tabButton = document.querySelector('[data-state="inactive"][value="users"]') as HTMLElement;
        if (tabButton) tabButton.click();
      });
    }

    if (questionsTabTrigger) {
      questionsTabTrigger.addEventListener("click", () => {
        const tabButton = document.querySelector('[data-state="inactive"][value="questions"]') as HTMLElement;
        if (tabButton) tabButton.click();
      });
    }

    if (reportsTabTrigger) {
      reportsTabTrigger.addEventListener("click", () => {
        const tabButton = document.querySelector('[data-state="inactive"][value="reports"]') as HTMLElement;
        if (tabButton) tabButton.click();
      });
    }

    return () => {
      if (usersTabTrigger) usersTabTrigger.removeEventListener("click", () => {});
      if (questionsTabTrigger) questionsTabTrigger.removeEventListener("click", () => {});
      if (reportsTabTrigger) reportsTabTrigger.removeEventListener("click", () => {});
    };
  }, []);

  if (showTokenError) {
    return <TokenErrorCard message={tokenErrorMessage} />;
  }

  return (
    <>
      <DashboardOverview 
        userCount={userCount}
        questionCount={questionCount}
        auditCount={auditCount}
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="users">
            <Users className="mr-2 h-4 w-4" />
            Manajemen Pengguna
          </TabsTrigger>
          <TabsTrigger value="questions">
            <FileText className="mr-2 h-4 w-4" />
            Pertanyaan Audit
          </TabsTrigger>
          <TabsTrigger id="reports-tab" value="reports">
            <FileOutput className="mr-2 h-4 w-4" />
            Laporan Audit
          </TabsTrigger>
        </TabsList>
        
        {/* Users Tab */}
        <TabsContent value="users">
          <UserManagement hardcodedSuperadminEmail={hardcodedSuperadminEmail} />
        </TabsContent>
        
        {/* Questions Tab */}
        <TabsContent value="questions">
          <QuestionManagement />
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <ReportManagement hardcodedSuperadminEmail={hardcodedSuperadminEmail} />
        </TabsContent>
      </Tabs>
    </>
  );
};
