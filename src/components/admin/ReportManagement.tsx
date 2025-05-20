
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  FileText, Search, CheckCircle, CircleX, Loader2
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PDFReport } from "@/components/PDFReport";
import { useAuditData } from "@/hooks/useAuditData";

interface ReportManagementProps {
  hardcodedSuperadminEmail: string;
}

export const ReportManagement = ({ hardcodedSuperadminEmail }: ReportManagementProps) => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [searchAudit, setSearchAudit] = useState("");
  const { audits, loading: loadingAudits, setAudits } = useAuditData({ isAdmin: true });
  const [auditWithUsers, setAuditWithUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch additional user info for each audit
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        if (!audits.length) return;

        const auditsWithUserInfo = await Promise.all(audits.map(async (audit) => {
          let userEmail = "Unknown";
          let userName = "Unknown";
          
          if (audit.user_id) {
            try {
              if (user?.email === hardcodedSuperadminEmail) {
                const response = await fetch("https://dcslbtsxmctxkudozrck.supabase.co/functions/v1/admin-operations", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                    action: "getUserInfo",
                    userId: audit.user_id,
                    superadmin: true,
                    superadminEmail: hardcodedSuperadminEmail
                  })
                });
                
                if (response.ok) {
                  const result = await response.json();
                  if (result.data?.user) {
                    userEmail = result.data.user.email;
                    userName = result.data.user.user_metadata?.name || "Unknown";
                  }
                }
              } else if (session?.access_token) {
                const response = await fetch("https://dcslbtsxmctxkudozrck.supabase.co/functions/v1/admin-operations", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session.access_token}`
                  },
                  body: JSON.stringify({
                    action: "getUserInfo",
                    userId: audit.user_id
                  })
                });
                
                if (response.ok) {
                  const result = await response.json();
                  if (result.data?.user) {
                    userEmail = result.data.user.email;
                    userName = result.data.user.user_metadata?.name || "Unknown";
                  }
                }
              }
            } catch (err) {
              console.error("Error fetching user info:", err);
            }
          } else if (audit.user_id === "superadmin-id") {
            userEmail = hardcodedSuperadminEmail;
            userName = "Super Admin";
          }
          
          return {
            ...audit,
            user: { 
              email: userEmail,
              name: userName
            }
          };
        }));

        console.log("Audits with user info:", auditsWithUserInfo);
        setAuditWithUsers(auditsWithUserInfo);
      } catch (error) {
        console.error('Error processing audit data:', error);
        toast({
          title: 'Error',
          description: 'Gagal memproses data audit dengan informasi pengguna',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    if (audits.length > 0) {
      fetchUserInfo();
    } else {
      setLoading(loadingAudits);
    }
  }, [audits, session?.access_token, user, hardcodedSuperadminEmail, toast, loadingAudits]);

  // Filter audits based on search
  const filteredAudits = auditWithUsers.filter(audit => 
    audit.title?.toLowerCase().includes(searchAudit.toLowerCase()) ||
    audit.organization?.toLowerCase().includes(searchAudit.toLowerCase()) ||
    (audit.user?.email || "").toLowerCase().includes(searchAudit.toLowerCase()) ||
    (audit.user?.name || "").toLowerCase().includes(searchAudit.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Laporan Audit</CardTitle>
        <CardDescription>Lihat dan ekspor semua laporan hasil audit dari auditor</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari laporan audit..."
                className="pl-8"
                value={searchAudit}
                onChange={(e) => setSearchAudit(e.target.value)}
              />
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-8 flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p>Memuat data audit...</p>
            </div>
          ) : filteredAudits.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul</TableHead>
                    <TableHead>Organisasi</TableHead>
                    <TableHead>Tanggal Audit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Auditor</TableHead>
                    <TableHead>Progres</TableHead>
                    <TableHead className="text-right">Tindakan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAudits.map((audit) => (
                    <TableRow key={audit.id}>
                      <TableCell className="font-medium">{audit.title || "Tidak ada judul"}</TableCell>
                      <TableCell>{audit.organization || "Tidak ada organisasi"}</TableCell>
                      <TableCell>{audit.audit_date ? new Date(audit.audit_date).toLocaleDateString('id-ID') : "Tidak ada tanggal"}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {audit.status === "completed" ? (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                              Selesai
                            </>
                          ) : audit.status === "in_progress" ? (
                            <>
                              <CircleX className="mr-2 h-4 w-4 text-yellow-500" />
                              Dalam Proses
                            </>
                          ) : (
                            <>
                              <CircleX className="mr-2 h-4 w-4 text-gray-500" />
                              {audit.status || "Tidak diketahui"}
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{audit.user?.name || 'Tidak diketahui'}</span>
                          <span className="text-xs text-muted-foreground">{audit.user?.email || 'Tidak ada email'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div 
                            className="bg-cobain-blue h-2.5 rounded-full" 
                            style={{ width: `${audit.progress || 0}%` }}
                          ></div>
                        </div>
                        <div className="text-xs mt-1">
                          {audit.progress || 0}%
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              window.open(`/audit-checklist/${audit.id}`, '_blank');
                            }}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Lihat
                          </Button>
                          <PDFReport 
                            auditId={audit.id} 
                            size="sm"
                            label="Ekspor PDF"
                            showIcon={true}
                            variant="outline"
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p>Tidak ada data audit yang tersedia.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
