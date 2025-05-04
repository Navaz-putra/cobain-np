
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ClipboardCheck, Layout, BarChart, Clock, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import refactored components
import { AuditList } from "@/components/dashboard/AuditList";
import { StatisticsView } from "@/components/dashboard/StatisticsView";
import { RecentActivities, RecentActivitiesFooter } from "@/components/dashboard/RecentActivities";
import { AccountSettings } from "@/components/dashboard/AccountSettings";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useAuditData } from "@/hooks/useAuditData";
import { GettingStartedGuide } from "@/components/GettingStartedGuide";
import { MaturityLevelInfo } from "@/components/MaturityLevelInfo";

// Mock audit data
const mockAudits = [
  {
    id: "1",
    title: "Annual IT Governance Audit",
    audit_date: "2025-03-15",
    domains: ["EDM", "APO"],
    status: "in-progress",
    progress: 35,
    organization: "Example Corp"
  },
  {
    id: "2",
    title: "Security Controls Assessment",
    audit_date: "2025-02-20",
    domains: ["DSS"],
    status: "completed",
    progress: 100,
    organization: "Example Corp"
  },
  {
    id: "3",
    title: "Project Governance Review",
    audit_date: "2025-04-10",
    domains: ["BAI"],
    status: "planned",
    progress: 0,
    organization: "Example Corp"
  },
];

export default function AuditorDashboard() {
  const { user } = useAuth();
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  
  // Use the extracted hook to fetch audit data
  const { audits, loading } = useAuditData({ userId: user?.id });

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-950 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header with welcome banner */}
        <DashboardHeader audits={audits} />

        {/* User Account Settings Dialog */}
        <AccountSettings 
          open={accountDialogOpen} 
          onOpenChange={setAccountDialogOpen} 
        />

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
                  <Layout className="mr-2 h-5 w-5 text-cobain-blue" />
                  Audit Saya
                </CardTitle>
                <CardDescription>Daftar penilaian COBIT 2019 Anda</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <AuditList audits={audits} loading={loading} />
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
                <StatisticsView audits={audits} mockAudits={mockAudits} />
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
                <RecentActivities />
              </CardContent>
              <CardFooter className="flex justify-center border-t">
                <RecentActivitiesFooter />
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
