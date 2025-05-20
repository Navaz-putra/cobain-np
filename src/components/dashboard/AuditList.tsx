
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Info, ChevronRight, Clock, ClipboardCheck, FileCheck, Trash2 } from "lucide-react";
import { PDFReport } from "@/components/PDFReport";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { logUserActivity } from '@/lib/activity-logger';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AuditItemProps {
  audit: {
    id: string;
    title: string;
    audit_date: string;
    organization: string;
    status: string;
    progress: number;
  };
  onDelete: (id: string) => void;
}

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

export const AuditItem: React.FC<AuditItemProps> = ({ audit, onDelete }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  return (
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
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center text-destructive hover:bg-destructive/10" 
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Audit</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus audit "{audit.title}"? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              onDelete(audit.id);
              setIsDeleteDialogOpen(false);
            }} className="bg-destructive hover:bg-destructive/90">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

interface AuditListProps {
  audits: any[];
  loading: boolean;
  setAudits?: React.Dispatch<React.SetStateAction<any[]>>;
}

export const AuditList: React.FC<AuditListProps> = ({ audits, loading, setAudits }) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const handleDeleteAudit = async (auditId: string) => {
    try {
      // Get audit info before deletion for logging
      let auditTitle = "Unknown audit";
      try {
        const { data: auditInfo } = await supabase
          .from('audits')
          .select('title')
          .eq('id', auditId)
          .single();
          
        if (auditInfo?.title) {
          auditTitle = auditInfo.title;
        }
      } catch (err) {
        console.error("Error fetching audit title before deletion:", err);
      }
      
      // Delete audit answers first (due to foreign key constraint)
      const { error: answersError } = await supabase
        .from('audit_answers')
        .delete()
        .eq('audit_id', auditId);
      
      if (answersError) throw answersError;
      
      // Then delete the audit
      const { error } = await supabase
        .from('audits')
        .delete()
        .eq('id', auditId);
        
      if (error) throw error;
      
      // Update UI by removing the deleted audit
      if (setAudits) {
        setAudits(prevAudits => prevAudits.filter(audit => audit.id !== auditId));
      }
      
      // Log this activity
      if (user?.id) {
        await logUserActivity(
          user.id,
          'delete_audit',
          `Menghapus audit "${auditTitle}"`
        );
      }
      
      toast({
        title: "Audit Dihapus",
        description: "Audit telah berhasil dihapus dari sistem."
      });
      
    } catch (error) {
      console.error("Error deleting audit:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menghapus audit. Silakan coba lagi."
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-2">Memuat data audit...</p>
      </div>
    );
  }

  if (audits.length === 0) {
    return (
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
    );
  }

  return (
    <div className="grid gap-5">
      {audits.map((audit) => (
        <AuditItem key={audit.id} audit={audit} onDelete={handleDeleteAudit} />
      ))}
    </div>
  );
};
