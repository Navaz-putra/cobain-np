
import React from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react"; 
import { generateAuditReport } from '@/utils/reportGenerator';
import { useToast } from '@/hooks/use-toast';

interface PDFReportProps {
  auditId: string;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
  label?: string;
}

export const PDFReport: React.FC<PDFReportProps> = ({
  auditId,
  className,
  variant = "outline",
  size = "default",
  showIcon = true,
  label = "Ekspor PDF"
}) => {
  const { toast } = useToast();

  const handleGenerateReport = async () => {
    try {
      toast({
        title: "Menghasilkan Laporan",
        description: "Mohon tunggu sementara kami menghasilkan laporan PDF Anda..."
      });
      
      await generateAuditReport(auditId);
      
      toast({
        title: "Berhasil",
        description: "Laporan telah dihasilkan dan diunduh"
      });
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menghasilkan laporan audit. Silakan coba lagi."
      });
    }
  };

  return (
    <Button 
      className={className}
      variant={variant}
      size={size}
      onClick={handleGenerateReport}
    >
      {showIcon && <Download className="mr-2 h-4 w-4" />}
      {label}
    </Button>
  );
};
