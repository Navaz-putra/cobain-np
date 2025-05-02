
import React from 'react';
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react"; 
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
  label = "Generate Report"
}) => {
  const { toast } = useToast();

  const handleGenerateReport = async () => {
    try {
      toast({
        title: "Generating Report",
        description: "Please wait while we generate your PDF report..."
      });
      
      await generateAuditReport(auditId);
      
      toast({
        title: "Success",
        description: "Report has been generated and downloaded"
      });
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate audit report. Please try again."
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
      {showIcon && <FileText className="mr-2 h-4 w-4" />}
      {label}
    </Button>
  );
};
