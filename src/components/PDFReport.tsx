
import React from 'react';
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react"; 
import { generateAuditReport } from '@/utils/reportGenerator';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from 'react';

interface PDFReportProps {
  auditId: string;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
  label?: string;
  allowDomainSelection?: boolean;
}

export const PDFReport: React.FC<PDFReportProps> = ({
  auditId,
  className,
  variant = "outline",
  size = "default",
  showIcon = true,
  label = "Ekspor PDF",
  allowDomainSelection = false
}) => {
  const { toast } = useToast();
  const [selectedDomain, setSelectedDomain] = useState<string>("all");

  // Domain structure for selection
  const domainOptions = [
    { id: "all", name: "Semua Domain" },
    { id: "EDM", name: "EDM - Evaluasi, Arahkan dan Pantau" },
    { id: "APO", name: "APO - Selaraskan, Rencanakan dan Organisasikan" },
    { id: "BAI", name: "BAI - Bangun, Peroleh dan Implementasikan" },
    { id: "DSS", name: "DSS - Kirim, Layani dan Dukung" },
    { id: "MEA", name: "MEA - Pantau, Evaluasi dan Nilai" }
  ];

  const handleGenerateReport = async () => {
    try {
      toast({
        title: "Menghasilkan Laporan",
        description: "Mohon tunggu sementara kami menghasilkan laporan PDF Anda..."
      });
      
      await generateAuditReport(auditId, selectedDomain);
      
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
    <div className="flex flex-col gap-2">
      {allowDomainSelection && (
        <div className="mb-2">
          <Select
            value={selectedDomain}
            onValueChange={setSelectedDomain}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Pilih domain" />
            </SelectTrigger>
            <SelectContent>
              {domainOptions.map((domain) => (
                <SelectItem key={domain.id} value={domain.id}>
                  {domain.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      <Button 
        className={className}
        variant={variant}
        size={size}
        onClick={handleGenerateReport}
      >
        {showIcon && <Download className="mr-2 h-4 w-4" />}
        {label}
      </Button>
    </div>
  );
};
