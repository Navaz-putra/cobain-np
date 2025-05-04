
import { jsPDF } from 'jspdf';
import { supabase } from '@/integrations/supabase/client';
import autoTable from 'jspdf-autotable';
import { Chart, ChartData, ChartOptions, registerables } from 'chart.js';

// Register all chart.js components
Chart.register(...registerables);

// Domain and subdomain name mappings with Indonesian translations
const domainNames: Record<string, string> = {
  "EDM": "Evaluasi, Arahkan dan Pantau",
  "APO": "Selaraskan, Rencanakan dan Organisasikan",
  "BAI": "Bangun, Peroleh dan Implementasikan",
  "DSS": "Kirim, Layani dan Dukung",
  "MEA": "Pantau, Evaluasi dan Nilai"
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
  priority: 'Tinggi' | 'Sedang' | 'Rendah';
  impact: string;
}

// Colors for charts
const chartColors = {
  currentLevel: 'rgba(99, 102, 241, 0.7)',
  targetLevel: 'rgba(244, 114, 182, 0.7)',
  gap: 'rgba(234, 179, 8, 0.5)'
};

export const generateAuditReport = async (auditId: string) => {
  try {
    // Fetch audit details
    const { data: auditData, error: auditError } = await supabase
      .from("audits")
      .select("*")
      .eq("id", auditId)
      .single();

    if (auditError) throw auditError;
    if (!auditData) throw new Error("Data audit tidak ditemukan");

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
    if (!answers || answers.length === 0) throw new Error("Tidak ada jawaban audit yang ditemukan");

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
    pdf.text("Laporan Audit COBIT 2019", 105, 20, {
      align: "center"
    });

    // Add audit metadata
    pdf.setFontSize(11);
    pdf.text(`Organisasi: ${auditData.organization}`, 20, 35);
    pdf.text(`Tanggal Audit: ${auditData.audit_date}`, 20, 40);
    pdf.text(`Judul: ${auditData.title}`, 20, 45);
    pdf.text(`Lingkup: ${auditData.scope || "Tidak ditentukan"}`, 20, 50);

    // Add Executive Summary
    pdf.setFontSize(14);
    pdf.setTextColor(30, 30, 30);
    pdf.text("Ringkasan Eksekutif", 20, 60);
    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);
    const summary = generateExecutiveSummary(domainsData);
    const summaryLines = pdf.splitTextToSize(summary, 170);
    pdf.text(summaryLines, 20, 70);

    // Create radar chart for maturity levels
    const radarChartCanvas = document.createElement('canvas');
    radarChartCanvas.width = 500;
    radarChartCanvas.height = 300;
    radarChartCanvas.style.display = 'none';
    document.body.appendChild(radarChartCanvas);
    
    // Generate radar chart
    createRadarChart(radarChartCanvas, domainsData);
    
    // Add chart to PDF
    pdf.addImage(radarChartCanvas.toDataURL(), 'PNG', 30, 95, 150, 90);
    
    // Remove canvas after generating image
    document.body.removeChild(radarChartCanvas);

    // Add a page break
    pdf.addPage();

    // Add gap analysis
    pdf.setFontSize(14);
    pdf.setTextColor(30, 30, 30);
    pdf.text("Analisis Kesenjangan", 105, 20, {
      align: "center"
    });

    // Create bar chart for gap analysis
    const barChartCanvas = document.createElement('canvas');
    barChartCanvas.width = 500;
    barChartCanvas.height = 300;
    barChartCanvas.style.display = 'none';
    document.body.appendChild(barChartCanvas);
    
    // Generate bar chart
    createBarChart(barChartCanvas, domainsData);
    
    // Add chart to PDF
    pdf.addImage(barChartCanvas.toDataURL(), 'PNG', 30, 30, 150, 90);
    
    // Remove canvas after generating image
    document.body.removeChild(barChartCanvas);
    
    // Add text-based gap analysis
    addGapAnalysisTable(pdf, domainsData, 20, 130);

    // Add detailed results table
    pdf.addPage();
    pdf.setFontSize(14);
    pdf.setTextColor(30, 30, 30);
    pdf.text("Hasil Penilaian Terperinci", 105, 20, {
      align: "center"
    });

    // Add table with detailed results
    addDetailedResultsTable(pdf, auditResults, 25);

    // Add recommendations
    pdf.addPage();
    pdf.setFontSize(14);
    pdf.setTextColor(30, 30, 30);
    pdf.text("Rekomendasi", 105, 20, {
      align: "center"
    });

    addRecommendationsTable(pdf, recommendations, 25);

    // Add heat map for prioritization
    pdf.addPage();
    pdf.setFontSize(14);
    pdf.setTextColor(30, 30, 30);
    pdf.text("Peta Panas Prioritas", 105, 20, {
      align: "center"
    });

    // Add text-based priority map
    addPriorityTable(pdf, domainsData, 20, 30);

    // Add footer with page numbers
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Halaman ${i} dari ${pageCount}`, 105, 290, {
        align: "center"
      });
      pdf.text(`Laporan Penilaian COBIT 2019 - Dihasilkan pada ${new Date().toLocaleDateString()}`, 105, 295, {
        align: "center"
      });
    }

    // Save the PDF
    pdf.save(`Laporan-Audit-COBIT-${auditData.organization}-${auditData.audit_date}.pdf`);
    console.log("PDF berhasil dihasilkan");
    
    return true;
  } catch (error) {
    console.error("Error menghasilkan laporan:", error);
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
  if (!maturityData.length) return "Tidak ada data kematangan yang tersedia untuk audit ini.";
  
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

  return `Laporan ini menyajikan hasil penilaian audit COBIT 2019 yang dilakukan untuk ${maturityData.length} domain. \nTingkat kematangan TI organisasi secara keseluruhan adalah ${avgMaturity.toFixed(2)} dari 5. \nDomain dengan kinerja tertinggi adalah ${highestDomain.domain} (${highestDomain.domainName}) pada level ${highestDomain.currentLevel}, \nsedangkan domain dengan kinerja terendah adalah ${lowestDomain.domain} (${lowestDomain.domainName}) pada level ${lowestDomain.currentLevel}. \nPenilaian ini mengidentifikasi kesenjangan antara tingkat kematangan saat ini dan target, serta memberikan rekomendasi yang ditargetkan untuk meningkatkan praktik tata kelola dan manajemen TI.`;
};

const generateRecommendations = (maturityData: DomainMaturityData[]): Recommendation[] => {
  return maturityData.map((domain) => {
    const gap = domain.targetLevel - domain.currentLevel;
    let priority: 'Tinggi' | 'Sedang' | 'Rendah' = 'Rendah';
    let description = '';
    let impact = '';

    if (gap > 3) {
      priority = 'Tinggi';
      description = `Perbaikan kritis diperlukan di ${domain.domain} (${domain.domainName}). Tetapkan proses tata kelola dasar dan dokumentasi.`;
      impact = 'Peningkatan signifikan dalam tata kelola TI organisasi dan manajemen risiko.';
    } else if (gap > 2) {
      priority = 'Tinggi';
      description = `Perbaikan besar diperlukan di ${domain.domain} (${domain.domainName}). Formalkan proses yang ada dan terapkan metrik.`;
      impact = 'Peningkatan efektivitas operasional dan pengurangan insiden terkait TI.';
    } else if (gap > 1) {
      priority = 'Sedang';
      description = `Peningkatan moderat diperlukan di ${domain.domain} (${domain.domainName}). Fokus pada standardisasi proses dan pengukuran hasil.`;
      impact = 'Konsistensi yang lebih baik dalam operasi TI dan keselarasan yang lebih baik dengan tujuan bisnis.';
    } else {
      priority = 'Rendah';
      description = `Penyempurnaan kecil direkomendasikan untuk ${domain.domain} (${domain.domainName}). Optimalkan proses yang ada dan fokus pada peningkatan berkelanjutan.`;
      impact = 'Keunggulan operasional dan praktik tata kelola TI terdepan di industri.';
    }

    return {
      domain: domain.domain,
      description,
      priority,
      impact
    };
  }).sort((a, b) => {
    const priorityValues = {
      'Tinggi': 3,
      'Sedang': 2,
      'Rendah': 1
    };
    return priorityValues[b.priority] - priorityValues[a.priority];
  });
};

// Create radar chart for maturity visualization
const createRadarChart = (canvas: HTMLCanvasElement, data: DomainMaturityData[]) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const labels = data.map(d => d.domain);
  const currentLevels = data.map(d => d.currentLevel);
  const targetLevels = data.map(d => d.targetLevel);
  
  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Tingkat Saat Ini',
          data: currentLevels,
          backgroundColor: chartColors.currentLevel,
          borderColor: chartColors.currentLevel.replace('0.7', '1'),
          borderWidth: 1
        },
        {
          label: 'Tingkat Target',
          data: targetLevels,
          backgroundColor: chartColors.targetLevel,
          borderColor: chartColors.targetLevel.replace('0.7', '1'),
          borderWidth: 1
        }
      ]
    },
    options: {
      scales: {
        r: {
          angleLines: {
            display: true
          },
          min: 0,
          max: 5,
          ticks: {
            stepSize: 1
          },
          pointLabels: {
            font: {
              size: 12
            }
          }
        }
      }
    }
  });
};

// Create bar chart for gap analysis
const createBarChart = (canvas: HTMLCanvasElement, data: DomainMaturityData[]) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  const labels = data.map(d => d.domain);
  const currentLevels = data.map(d => d.currentLevel);
  const targetLevels = data.map(d => d.targetLevel);
  const gaps = data.map(d => d.targetLevel - d.currentLevel);
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Tingkat Saat Ini',
          data: currentLevels,
          backgroundColor: chartColors.currentLevel,
          borderColor: 'rgba(0,0,0,0.1)',
          borderWidth: 1
        },
        {
          label: 'Tingkat Target',
          data: targetLevels,
          backgroundColor: chartColors.targetLevel,
          borderColor: 'rgba(0,0,0,0.1)',
          borderWidth: 1
        },
        {
          label: 'Kesenjangan',
          data: gaps,
          backgroundColor: chartColors.gap,
          borderColor: 'rgba(0,0,0,0.1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 5,
          title: {
            display: true,
            text: 'Tingkat Kematangan'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Domain'
          }
        }
      }
    }
  });
};

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
    head: [["Domain", "Nama Domain", "Tingkat Saat Ini", "Tingkat Target", "Kesenjangan"]],
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
    
    if (gap > 3) priority = 'Kritis';
    else if (gap > 2) priority = 'Tinggi';
    else if (gap > 1) priority = 'Sedang';
    else priority = 'Rendah';
    
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
    head: [["Domain", "Nama Domain", "Saat Ini", "Target", "Kesenjangan", "Prioritas"]],
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
        if (priority === 'Kritis') {
          data.cell.styles.fillColor = [255, 99, 132];
          data.cell.styles.textColor = [255, 255, 255];
        } else if (priority === 'Tinggi') {
          data.cell.styles.fillColor = [255, 159, 64];
          data.cell.styles.textColor = [255, 255, 255];
        } else if (priority === 'Sedang') {
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
  pdf.text("Ringkasan Analisis Kesenjangan", 20, finalY + 20);
  pdf.setFontSize(10);
  pdf.setTextColor(60, 60, 60);

  // Generate gap analysis text
  const gapAnalysis = data.map((d) => {
    const gap = d.targetLevel - d.currentLevel;
    return `${d.domain} (${d.domainName}): Saat ini ${d.currentLevel} vs Target ${d.targetLevel} - Kesenjangan: ${gap.toFixed(2)}`;
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
            "Pertanyaan",
            "Tingkat Kematangan",
            "Catatan"
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
        "Rekomendasi",
        "Prioritas",
        "Dampak yang Diharapkan"
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
        if (priority === 'Tinggi') {
          data.cell.styles.fillColor = [255, 100, 100];
          data.cell.styles.textColor = [255, 255, 255];
        } else if (priority === 'Sedang') {
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
      priority = 'Kritis';
      color = 'Merah';
    } else if (gap > 2) {
      priority = 'Tinggi';
      color = 'Oranye';
    } else if (gap > 1) {
      priority = 'Sedang';
      color = 'Kuning';
    } else {
      priority = 'Rendah';
      color = 'Hijau';
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
    head: [["Domain", "Nama Domain", "Kesenjangan", "Prioritas", "Tindakan"]],
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
        if (priority === 'Kritis') {
          data.cell.styles.fillColor = [255, 99, 132];
          data.cell.styles.textColor = [255, 255, 255];
        } else if (priority === 'Tinggi') {
          data.cell.styles.fillColor = [255, 159, 64];
          data.cell.styles.textColor = [255, 255, 255];
        } else if (priority === 'Sedang') {
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
  pdf.text('Kesenjangan Kritis (>3): Tindakan segera diperlukan', 35, finalY + 24);

  pdf.setFillColor(255, 159, 64);
  pdf.rect(20, finalY + 30, 10, 5, 'F');
  pdf.text('Kesenjangan Tinggi (2-3): Peningkatan prioritas tinggi diperlukan', 35, finalY + 34);

  pdf.setFillColor(255, 205, 86);
  pdf.rect(20, finalY + 40, 10, 5, 'F');
  pdf.text('Kesenjangan Sedang (1-2): Peningkatan moderat diperlukan', 35, finalY + 44);

  pdf.setFillColor(75, 192, 192);
  pdf.rect(20, finalY + 50, 10, 5, 'F');
  pdf.text('Kesenjangan Rendah (<1): Penyetelan dan optimasi', 35, finalY + 54);

  // Add explanation text
  pdf.setFontSize(11);
  pdf.setTextColor(60, 60, 60);
  pdf.text("Penjelasan Prioritas:", 20, finalY + 70);
  pdf.setFontSize(10);
  const priorityExplanation = "Tabel ini mengidentifikasi area prioritas untuk perbaikan berdasarkan kesenjangan antara tingkat kematangan saat ini dan target. Area dengan kesenjangan lebih besar harus diprioritaskan untuk upaya perbaikan. Area dengan kesenjangan Kritis dan Tinggi memerlukan perhatian segera dan alokasi sumber daya.";
  const explanationLines = pdf.splitTextToSize(priorityExplanation, 170);
  pdf.text(explanationLines, 20, finalY + 80);
};
