
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Download, Loader2, FileSignature } from "lucide-react"; 
import { generateAuditReport } from '@/utils/reportGenerator';
import { useToast } from '@/components/ui/use-toast';

interface PDFReportProps {
  auditId: string;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
  label?: string;
  disabled?: boolean;
}

export const PDFReport: React.FC<PDFReportProps> = ({
  auditId,
  className,
  variant = "outline",
  size = "default",
  showIcon = true,
  label = "Ekspor PDF",
  disabled = false
}) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);
      toast({
        title: "Menghasilkan Laporan",
        description: "Mohon tunggu sementara kami menghasilkan laporan PDF Anda..."
      });
      
      await generateAuditReport(auditId);
      
      toast({
        title: "Berhasil",
        description: "Laporan telah dihasilkan dan diunduh dengan halaman tanda tangan untuk berita acara."
      });
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal menghasilkan laporan audit. Silakan coba lagi."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      className={className}
      variant={variant}
      size={size}
      onClick={handleGenerateReport}
      disabled={disabled || isGenerating}
    >
      {showIcon && (
        isGenerating ? 
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 
          <FileSignature className="mr-2 h-4 w-4" />
      )}
      {isGenerating ? "Sedang menghasilkan..." : label}
    </Button>
  );
};
