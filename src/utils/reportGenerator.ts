
import { jsPDF } from 'jspdf';
import { supabase } from '@/integrations/supabase/client';
import autoTable from 'jspdf-autotable';
import { Chart, ChartData, ChartOptions, registerables } from 'chart.js';

// Register all chart.js components
Chart.register(...registerables);

// Domain and subdomain name mappings
const domainNames: Record<string, string> = {
  "EDM": "Evaluate, Direct and Monitor",
  "APO": "Align, Plan and Organize",
  "BAI": "Build, Acquire and Implement",
  "DSS": "Deliver, Service and Support",
  "MEA": "Monitor, Evaluate and Assess"
};

const subdomainNames: Record<string, string> = {
  // EDM Subdomains
  "EDM01": "Memastikan Kerangka Tata Kelola Ditetapkan dan Dipelihara",
  "EDM02": "Memastikan Penghantaran Manfaat",
  "EDM03": "Memastikan Optimalisasi Risiko",
  "EDM04": "Memastikan Optimalisasi Sumber Daya",
  "EDM05": "Memastikan Keterlibatan Pemangku Kepentingan",
  // APO Subdomains
  "APO01": "Mengelola Kerangka Manajemen TI",
  "APO02": "Mengelola Strategi",
  "APO03": "Mengelola Arsitektur Perusahaan",
  "APO04": "Mengelola Inovasi",
  "APO05": "Mengelola Portfolio",
  "APO06": "Mengelola Anggaran dan Biaya",
  "APO07": "Mengelola Sumber Daya Manusia",
  "APO08": "Mengelola Hubungan",
  "APO09": "Mengelola Perjanjian Layanan",
  "APO10": "Mengelola Vendor",
  "APO11": "Mengelola Kualitas",
  "APO12": "Mengelola Risiko",
  "APO13": "Mengelola Keamanan",
  "APO14": "Mengelola Data",
  // BAI Subdomains
  "BAI01": "Mengelola Program",
  "BAI02": "Mengelola Definisi Persyaratan",
  "BAI03": "Mengelola Identifikasi dan Pembangunan Solusi",
  "BAI04": "Mengelola Ketersediaan dan Kapasitas",
  "BAI05": "Mengelola Perubahan Organisasi",
  "BAI06": "Mengelola Perubahan TI",
  "BAI07": "Mengelola Penerimaan dan Transisi Perubahan TI",
  "BAI08": "Mengelola Pengetahuan",
  "BAI09": "Mengelola Aset",
  "BAI10": "Mengelola Konfigurasi",
  "BAI11": "Mengelola Proyek",
  // DSS Subdomains
  "DSS01": "Mengelola Operasi",
  "DSS02": "Mengelola Permintaan Layanan dan Insiden",
  "DSS03": "Mengelola Masalah",
  "DSS04": "Mengelola Kontinuitas",
  "DSS05": "Mengelola Layanan Keamanan",
  "DSS06": "Mengelola Kontrol Proses Bisnis",
  // MEA Subdomains
  "MEA01": "Mengelola Pemantauan Kinerja dan Kesesuaian",
  "MEA02": "Memantau, Mengevaluasi, dan Menilai Sistem Pengendalian Internal",
  "MEA03": "Memantau, Mengevaluasi, dan Menilai Kepatuhan terhadap Persyaratan Eksternal",
  "MEA04": "Memantau, Mengevaluasi, dan Menilai Jaminan"
};

// Define the AuditResult interface to fix the type error
interface AuditResult {
  domain_id: string;
  domain_name: string;
  subdomain_id: string;
  subdomain_name: string;
  question_text: string;
  maturity_level: number;
  notes?: string;
}

interface DomainMaturityData {
  domain: string;
  domainName: string;
  currentLevel: number;
  targetLevel: number;
}

interface Recommendation {
  domain: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  impact: string;
}

export const generateAuditReport = async (auditId: string) => {
  try {
    // Fetch audit details
    const { data: auditData, error: auditError } = await supabase
      .from("audits")
      .select("*")
      .eq("id", auditId)
      .single();

    if (auditError) throw auditError;
    if (!auditData) throw new Error("Audit data not found");

    // Fetch all related audit questions and answers
    const { data: answers, error: answersError } = await supabase
      .from("audit_answers")
      .select(`
        maturity_level,
        notes,
        question_id,
        cobit_questions (
          domain_id,
          subdomain_id,
          text
        )
      `)
      .eq("audit_id", auditId);

    if (answersError) throw answersError;
    if (!answers || answers.length === 0) throw new Error("No audit answers found");

    // Process data for visualization
    const auditResults: AuditResult[] = answers.map((answer) => ({
      domain_id: answer.cobit_questions.domain_id,
      domain_name: domainNames[answer.cobit_questions.domain_id] || answer.cobit_questions.domain_id,
      subdomain_id: answer.cobit_questions.subdomain_id,
      subdomain_name: subdomainNames[answer.cobit_questions.subdomain_id] || answer.cobit_questions.subdomain_id,
      question_text: answer.cobit_questions.text,
      maturity_level: answer.maturity_level,
      notes: answer.notes
    }));

    // Generate domain-level maturity data for radar chart
    const domainsData = calculateDomainMaturityLevels(auditResults);

    // Generate recommendations based on gap analysis
    const recommendations = generateRecommendations(domainsData);

    // Create PDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Add document title and header
    pdf.setFontSize(18);
    pdf.setTextColor(40, 40, 40);
    pdf.text("COBIT 2019 Audit Report", 105, 20, {
      align: "center"
    });

    // Add audit metadata
    pdf.setFontSize(11);
    pdf.text(`Organization: ${auditData.organization}`, 20, 35);
    pdf.text(`Audit Date: ${auditData.audit_date}`, 20, 40);
    pdf.text(`Title: ${auditData.title}`, 20, 45);
    pdf.text(`Scope: ${auditData.scope || "Not specified"}`, 20, 50);

    // Add Executive Summary
    pdf.setFontSize(14);
    pdf.setTextColor(30, 30, 30);
    pdf.text("Executive Summary", 20, 60);
    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);
    const summary = generateExecutiveSummary(domainsData);
    const summaryLines = pdf.splitTextToSize(summary, 170);
    pdf.text(summaryLines, 20, 70);

    // Add simple text-based report instead of charts to avoid errors
    pdf.setFontSize(14);
    pdf.setTextColor(30, 30, 30);
    pdf.text("Maturity Assessment Results", 105, 95, {
      align: "center"
    });

    // Add text-based maturity table instead of chart
    addMaturityTable(pdf, domainsData, 20, 105);

    // Add a page break
    pdf.addPage();

    // Add gap analysis
    pdf.setFontSize(14);
    pdf.setTextColor(30, 30, 30);
    pdf.text("Gap Analysis", 105, 20, {
      align: "center"
    });

    // Add text-based gap analysis instead of radar chart
    addGapAnalysisTable(pdf, domainsData, 20, 30);

    // Add detailed results table
    pdf.addPage();
    pdf.setFontSize(14);
    pdf.setTextColor(30, 30, 30);
    pdf.text("Detailed Assessment Results", 105, 20, {
      align: "center"
    });

    // Add table with detailed results
    addDetailedResultsTable(pdf, auditResults, 25);

    // Add recommendations
    pdf.addPage();
    pdf.setFontSize(14);
    pdf.setTextColor(30, 30, 30);
    pdf.text("Recommendations", 105, 20, {
      align: "center"
    });

    addRecommendationsTable(pdf, recommendations, 25);

    // Add heat map for prioritization
    pdf.addPage();
    pdf.setFontSize(14);
    pdf.setTextColor(30, 30, 30);
    pdf.text("Prioritization Heat Map", 105, 20, {
      align: "center"
    });

    // Add text-based priority map instead of chart
    addPriorityTable(pdf, domainsData, 20, 30);

    // Add footer with page numbers
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Page ${i} of ${pageCount}`, 105, 290, {
        align: "center"
      });
      pdf.text(`COBIT 2019 Assessment Report - Generated on ${new Date().toLocaleDateString()}`, 105, 295, {
        align: "center"
      });
    }

    // Save the PDF
    pdf.save(`COBIT-Audit-Report-${auditData.organization}-${auditData.audit_date}.pdf`);
    console.log("PDF generated successfully");
    
    return true;
  } catch (error) {
    console.error("Error generating report:", error);
    throw error;
  }
};

const calculateDomainMaturityLevels = (results: AuditResult[]): DomainMaturityData[] => {
  const domainMap: Record<string, { total: number, count: number }> = {};

  // Calculate average maturity level for each domain
  results.forEach((result) => {
    if (!domainMap[result.domain_id]) {
      domainMap[result.domain_id] = {
        total: 0,
        count: 0
      };
    }
    domainMap[result.domain_id].total += result.maturity_level;
    domainMap[result.domain_id].count += 1;
  });

  // Generate maturity data with calculated averages
  return Object.entries(domainMap).map(([domain, data]) => ({
    domain,
    domainName: domainNames[domain] || domain,
    currentLevel: parseFloat((data.total / data.count).toFixed(2)),
    targetLevel: 5 // Target is always maximum level
  }));
};

const generateExecutiveSummary = (maturityData: DomainMaturityData[]): string => {
  if (!maturityData.length) return "No maturity data available for this audit.";
  
  const avgMaturity = maturityData.reduce((sum, domain) => sum + domain.currentLevel, 0) / maturityData.length;

  // Find highest and lowest domains
  let highestDomain = maturityData[0];
  let lowestDomain = maturityData[0];

  maturityData.forEach((domain) => {
    if (domain.currentLevel > highestDomain.currentLevel) {
      highestDomain = domain;
    }
    if (domain.currentLevel < lowestDomain.currentLevel) {
      lowestDomain = domain;
    }
  });

  return `This report presents the assessment results of a COBIT 2019 audit conducted for ${maturityData.length} domains. \nThe overall organizational IT maturity level is ${avgMaturity.toFixed(2)} out of 5. \nThe highest performing domain is ${highestDomain.domain} (${highestDomain.domainName}) at level ${highestDomain.currentLevel}, \nwhile the lowest performing domain is ${lowestDomain.domain} (${lowestDomain.domainName}) at level ${lowestDomain.currentLevel}. \nThis assessment identifies gaps between current and target maturity levels, and provides targeted recommendations to improve IT governance and management practices.`;
};

const generateRecommendations = (maturityData: DomainMaturityData[]): Recommendation[] => {
  return maturityData.map((domain) => {
    const gap = domain.targetLevel - domain.currentLevel;
    let priority: 'High' | 'Medium' | 'Low' = 'Low';
    let description = '';
    let impact = '';

    if (gap > 3) {
      priority = 'High';
      description = `Critical improvement needed in ${domain.domain} (${domain.domainName}). Establish basic governance processes and documentation.`;
      impact = 'Significant improvement in organizational IT governance and risk management.';
    } else if (gap > 2) {
      priority = 'High';
      description = `Major improvement required in ${domain.domain} (${domain.domainName}). Formalize existing processes and implement metrics.`;
      impact = 'Enhanced operational effectiveness and reduced IT-related incidents.';
    } else if (gap > 1) {
      priority = 'Medium';
      description = `Moderate enhancement needed in ${domain.domain} (${domain.domainName}). Focus on standardizing processes and measuring outcomes.`;
      impact = 'Improved consistency in IT operations and better alignment with business objectives.';
    } else {
      priority = 'Low';
      description = `Minor refinement recommended for ${domain.domain} (${domain.domainName}). Optimize existing processes and focus on continuous improvement.`;
      impact = 'Operational excellence and industry-leading IT governance practices.';
    }

    return {
      domain: domain.domain,
      description,
      priority,
      impact
    };
  }).sort((a, b) => {
    const priorityValues = {
      'High': 3,
      'Medium': 2,
      'Low': 1
    };
    return priorityValues[b.priority] - priorityValues[a.priority];
  });
};

// Replace chart-based functions with table-based alternatives
const addMaturityTable = (pdf: jsPDF, data: DomainMaturityData[], x: number, y: number): void => {
  const tableData = data.map(d => [
    d.domain,
    d.domainName,
    d.currentLevel.toString(),
    d.targetLevel.toString(),
    (d.targetLevel - d.currentLevel).toFixed(2)
  ]);

  autoTable(pdf, {
    startY: y,
    head: [["Domain", "Domain Name", "Current Level", "Target Level", "Gap"]],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [80, 80, 80] },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 70 },
      2: { cellWidth: 30, halign: 'center' },
      3: { cellWidth: 30, halign: 'center' },
      4: { cellWidth: 20, halign: 'center' }
    }
  });
};

const addGapAnalysisTable = (pdf: jsPDF, data: DomainMaturityData[], x: number, y: number): void => {
  // First add a table with the gap analysis data
  const tableData = data.map(d => {
    const gap = d.targetLevel - d.currentLevel;
    let priority = '';
    
    if (gap > 3) priority = 'Critical';
    else if (gap > 2) priority = 'High';
    else if (gap > 1) priority = 'Medium';
    else priority = 'Low';
    
    return [
      d.domain,
      d.domainName,
      d.currentLevel.toString(),
      d.targetLevel.toString(),
      gap.toFixed(2),
      priority
    ];
  });

  autoTable(pdf, {
    startY: y,
    head: [["Domain", "Domain Name", "Current", "Target", "Gap", "Priority"]],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [80, 80, 80] },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 60 },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 25, halign: 'center' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 25, halign: 'center' }
    },
    didParseCell: function(data) {
      // Color the priority cell based on value
      if (data.section === 'body' && data.column.index === 5) {
        const priority = data.cell.raw?.toString();
        if (priority === 'Critical') {
          data.cell.styles.fillColor = [255, 99, 132];
          data.cell.styles.textColor = [255, 255, 255];
        } else if (priority === 'High') {
          data.cell.styles.fillColor = [255, 159, 64];
          data.cell.styles.textColor = [255, 255, 255];
        } else if (priority === 'Medium') {
          data.cell.styles.fillColor = [255, 205, 86];
        } else {
          data.cell.styles.fillColor = [75, 192, 192];
        }
      }
    }
  });

  // Add gap analysis text
  const finalY = (pdf as any).lastAutoTable?.finalY || (y + 120);
  
  pdf.setFontSize(12);
  pdf.setTextColor(40, 40, 40);
  pdf.text("Gap Analysis Summary", 20, finalY + 20);
  pdf.setFontSize(10);
  pdf.setTextColor(60, 60, 60);

  // Generate gap analysis text
  const gapAnalysis = data.map((d) => {
    const gap = d.targetLevel - d.currentLevel;
    return `${d.domain} (${d.domainName}): Current ${d.currentLevel} vs Target ${d.targetLevel} - Gap: ${gap.toFixed(2)}`;
  });

  let yPosition = finalY + 30;
  gapAnalysis.forEach((text) => {
    const lines = pdf.splitTextToSize(text, 170);
    pdf.text(lines, 20, yPosition);
    yPosition += lines.length * 5 + 2;
  });
};

const addDetailedResultsTable = (pdf: jsPDF, results: AuditResult[], startY: number): void => {
  // Group results by domain and subdomain
  const groupedResults: Record<string, Record<string, AuditResult[]>> = {};
  
  results.forEach((result) => {
    if (!groupedResults[result.domain_id]) {
      groupedResults[result.domain_id] = {};
    }
    if (!groupedResults[result.domain_id][result.subdomain_id]) {
      groupedResults[result.domain_id][result.subdomain_id] = [];
    }
    groupedResults[result.domain_id][result.subdomain_id].push(result);
  });

  // Generate table data for each domain and subdomain
  let yPos = startY;

  Object.entries(groupedResults).forEach(([domainId, subdomains]) => {
    const domainName = domainNames[domainId] || domainId;

    // Add domain header
    pdf.setFontSize(12);
    pdf.setTextColor(40, 40, 40);
    pdf.text(`${domainId}: ${domainName}`, 20, yPos);
    yPos += 8;

    Object.entries(subdomains).forEach(([subdomainId, questions]) => {
      const subdomainName = subdomainNames[subdomainId] || subdomainId;

      // Add subdomain header
      pdf.setFontSize(11);
      pdf.setTextColor(60, 60, 60);
      pdf.text(`${subdomainId}: ${subdomainName}`, 25, yPos);
      yPos += 6;

      // Add table for this subdomain's questions
      const tableData = questions.map((q) => [
        q.question_text,
        q.maturity_level.toString(),
        q.notes || "-"
      ]);

      autoTable(pdf, {
        startY: yPos,
        head: [
          [
            "Question",
            "Maturity Level",
            "Notes"
          ]
        ],
        body: tableData,
        headStyles: {
          fillColor: [
            80,
            80,
            80
          ]
        },
        margin: {
          left: 25,
          right: 20
        },
        columnStyles: {
          0: {
            cellWidth: 90
          },
          1: {
            cellWidth: 25,
            halign: 'center'
          },
          2: {
            cellWidth: 50
          }
        }
      });

      // Get the final Y position after the table was drawn
      const finalY = (pdf as any).lastAutoTable?.finalY || (yPos + 50);
      yPos = finalY + 10;

      // Check if we need a new page
      if (yPos > 270) {
        pdf.addPage();
        yPos = 20;
      }
    });

    // Add a bit more space after each domain
    yPos += 5;

    // Check if we need a new page before the next domain
    if (yPos > 250) {
      pdf.addPage();
      yPos = 20;
    }
  });
};

const addRecommendationsTable = (pdf: jsPDF, recommendations: Recommendation[], startY: number): void => {
  const tableData = recommendations.map((r) => [
    r.domain,
    r.description,
    r.priority,
    r.impact
  ]);

  autoTable(pdf, {
    startY: startY,
    head: [
      [
        "Domain",
        "Recommendation",
        "Priority",
        "Expected Impact"
      ]
    ],
    body: tableData,
    headStyles: {
      fillColor: [80, 80, 80]
    },
    columnStyles: {
      0: {
        cellWidth: 20
      },
      1: {
        cellWidth: 70
      },
      2: {
        cellWidth: 25
      },
      3: {
        cellWidth: 55
      }
    },
    styles: {
      overflow: 'linebreak'
    },
    didParseCell: function(data) {
      // Color the priority cell based on value
      if (data.section === 'body' && data.column.index === 2) {
        const priority = data.cell.raw?.toString();
        if (priority === 'High') {
          data.cell.styles.fillColor = [255, 100, 100];
          data.cell.styles.textColor = [255, 255, 255];
        } else if (priority === 'Medium') {
          data.cell.styles.fillColor = [255, 180, 100];
          data.cell.styles.textColor = [255, 255, 255];
        } else {
          data.cell.styles.fillColor = [100, 200, 100];
          data.cell.styles.textColor = [255, 255, 255];
        }
      }
    }
  });
};

const addPriorityTable = (pdf: jsPDF, data: DomainMaturityData[], x: number, y: number): void => {
  // Sort data by gap size (largest to smallest)
  const sortedData = [...data].sort((a, b) => 
    (b.targetLevel - b.currentLevel) - (a.targetLevel - a.currentLevel)
  );

  // Create table data
  const tableData = sortedData.map(d => {
    const gap = d.targetLevel - d.currentLevel;
    let priority = '';
    let color = '';
    
    if (gap > 3) {
      priority = 'Critical';
      color = 'Red';
    } else if (gap > 2) {
      priority = 'High';
      color = 'Orange';
    } else if (gap > 1) {
      priority = 'Medium';
      color = 'Yellow';
    } else {
      priority = 'Low';
      color = 'Green';
    }
    
    return [
      d.domain,
      d.domainName,
      gap.toFixed(2),
      priority,
      color
    ];
  });

  autoTable(pdf, {
    startY: y,
    head: [["Domain", "Domain Name", "Gap", "Priority", "Action"]],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [80, 80, 80] },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 80 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 30, halign: 'center' },
      4: { cellWidth: 25, halign: 'center' }
    },
    didParseCell: function(data) {
      // Color the priority cell based on value
      if (data.section === 'body' && data.column.index === 3) {
        const priority = data.cell.raw?.toString();
        if (priority === 'Critical') {
          data.cell.styles.fillColor = [255, 99, 132];
          data.cell.styles.textColor = [255, 255, 255];
        } else if (priority === 'High') {
          data.cell.styles.fillColor = [255, 159, 64];
          data.cell.styles.textColor = [255, 255, 255];
        } else if (priority === 'Medium') {
          data.cell.styles.fillColor = [255, 205, 86];
        } else {
          data.cell.styles.fillColor = [75, 192, 192];
        }
      }
    }
  });

  // Add legend
  const finalY = (pdf as any).lastAutoTable?.finalY || (y + 120);
  
  // Add colored rectangles
  pdf.setFillColor(255, 99, 132);
  pdf.rect(20, finalY + 20, 10, 5, 'F');
  pdf.setTextColor(40, 40, 40);
  pdf.setFontSize(10);
  pdf.text('Critical Gap (>3): Immediate action required', 35, finalY + 24);

  pdf.setFillColor(255, 159, 64);
  pdf.rect(20, finalY + 30, 10, 5, 'F');
  pdf.text('High Gap (2-3): High priority improvement needed', 35, finalY + 34);

  pdf.setFillColor(255, 205, 86);
  pdf.rect(20, finalY + 40, 10, 5, 'F');
  pdf.text('Medium Gap (1-2): Moderate improvement needed', 35, finalY + 44);

  pdf.setFillColor(75, 192, 192);
  pdf.rect(20, finalY + 50, 10, 5, 'F');
  pdf.text('Low Gap (<1): Fine-tuning and optimization', 35, finalY + 54);

  // Add explanation text
  pdf.setFontSize(11);
  pdf.setTextColor(60, 60, 60);
  pdf.text("Priority Explanation:", 20, finalY + 70);
  pdf.setFontSize(10);
  const priorityExplanation = "This table identifies priority areas for improvement based on the gap between current and target maturity levels. Areas with larger gaps should be prioritized for remediation efforts. Critical and High gap areas require immediate attention and resource allocation.";
  const explanationLines = pdf.splitTextToSize(priorityExplanation, 170);
  pdf.text(explanationLines, 20, finalY + 80);
};
