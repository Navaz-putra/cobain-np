import { jsPDF } from 'jspdf';
import { supabase } from '@/integrations/supabase/client';
import autoTable from 'jspdf-autotable';

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

// Maturity level descriptions
const maturityLevelDescriptions: Record<number, {name: string, description: string}> = {
  0: {
    name: "Level 0 - Incomplete Process",
    description: "Proses tidak diterapkan atau gagal mencapai tujuannya. Tidak ada bukti pencapaian tujuan proses."
  },
  1: {
    name: "Level 1 - Performed Process",
    description: "Proses diterapkan dan mencapai tujuannya tetapi tidak terkelola dengan baik."
  },
  2: {
    name: "Level 2 - Managed Process",
    description: "Proses telah dijalankan dan dikelola secara sistematis (direncanakan, dipantau, dan disesuaikan)."
  },
  3: {
    name: "Level 3 - Established Process",
    description: "Proses telah terdokumentasi dan terstandarisasi di seluruh organisasi."
  },
  4: {
    name: "Level 4 - Predictable Process", 
    description: "Proses beroperasi dalam batas-batas yang ditetapkan dan menghasilkan hasil yang dapat diprediksi."
  },
  5: {
    name: "Level 5 - Optimizing Process",
    description: "Proses terus ditingkatkan untuk memenuhi tujuan bisnis saat ini dan masa depan."
  }
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

    // Fetch auditor information
    let auditorName = "Unknown";
    let auditorEmail = "Unknown";
    let auditorPosition = "Unknown";
    let auditorDepartment = "Unknown";
    
    if (auditData.user_id && auditData.user_id !== "superadmin-id") {
      try {
        // Fetch auditor information based on user_id
        const { data: userData, error: userError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", auditData.user_id)
          .single();
          
        if (!userError && userData) {
          auditorName = userData.full_name || "Unknown";
          auditorEmail = userData.email || "Unknown";
        }
        
        // Check if auditor_info exists in audit data
        if (auditData.auditor_info) {
          const auditorInfo = auditData.auditor_info;
          auditorName = auditorInfo.name || auditorName;
          auditorEmail = auditorInfo.email || auditorEmail;
          auditorPosition = auditorInfo.position || "Unknown";
          auditorDepartment = auditorInfo.department || "Unknown";
        }
      } catch (error) {
        console.error("Error fetching auditor data:", error);
      }
    } else if (auditData.auditor_info) {
      // Get auditor info directly from audit data
      const auditorInfo = auditData.auditor_info;
      auditorName = auditorInfo.name || auditorName;
      auditorEmail = auditorInfo.email || auditorEmail;
      auditorPosition = auditorInfo.position || "Unknown";
      auditorDepartment = auditorInfo.department || "Unknown";
    }

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

    // Generate domain-level maturity data
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
    pdf.text("COBIT 2019 Audit Report / Laporan Audit COBIT 2019", 105, 20, {
      align: "center"
    });

    // Add audit metadata
    pdf.setFontSize(11);
    pdf.text(`Organization / Organisasi: ${auditData.organization}`, 20, 35);
    pdf.text(`Audit Date / Tanggal Audit: ${auditData.audit_date}`, 20, 40);
    pdf.text(`Title / Judul: ${auditData.title}`, 20, 45);
    pdf.text(`Scope / Lingkup: ${auditData.scope || "Tidak ditentukan"}`, 20, 50);

    // Add auditor information
    pdf.setFontSize(12);
    pdf.setTextColor(30, 30, 30);
    pdf.text("Auditor Information / Informasi Auditor", 20, 60);
    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);
    pdf.text(`Name / Nama: ${auditorName}`, 25, 67);
    pdf.text(`Email: ${auditorEmail}`, 25, 72);
    pdf.text(`Position / Jabatan: ${auditorPosition}`, 25, 77);
    pdf.text(`Department / Departemen: ${auditorDepartment}`, 25, 82);

    // Add Executive Summary - adjust y position to account for auditor info
    pdf.setFontSize(14);
    pdf.setTextColor(30, 30, 30);
    pdf.text("Executive Summary / Ringkasan Eksekutif", 20, 92);
    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);
    const summary = generateExecutiveSummary(domainsData);
    const summaryLines = pdf.splitTextToSize(summary, 170);
    pdf.text(summaryLines, 20, 102);

    // Add maturity level explanation - adjust y position
    pdf.setFontSize(11);
    pdf.text("Maturity Level Scale / Skala Tingkat Kematangan:", 20, summaryLines.length * 5 + 105);
    
    let yPosition = summaryLines.length * 5 + 110;
    Object.entries(maturityLevelDescriptions).forEach(([level, { name, description }]) => {
      pdf.setFontSize(10);
      pdf.setTextColor(40, 40, 40);
      pdf.text(`${name}:`, 25, yPosition);
      pdf.setTextColor(70, 70, 70);
      const descLines = pdf.splitTextToSize(description, 165);
      pdf.text(descLines, 25, yPosition + 5);
      yPosition += 5 + (descLines.length * 5);
    });
    
    // Add new page for Radar Chart replacement
    pdf.addPage();
    pdf.setFontSize(14);
    pdf.setTextColor(30, 30, 30);
    pdf.text("Maturity Level Comparison / Perbandingan Tingkat Kematangan", 105, 20, {
      align: "center"
    });
    
    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);
    pdf.text("Comparison of current vs target maturity levels across domains", 105, 27, {
      align: "center"
    });
    pdf.text("Perbandingan tingkat kematangan saat ini dan target di semua domain", 105, 32, {
      align: "center"
    });
    
    // Replace radar chart with a comparison table
    addMaturityComparisonTable(pdf, domainsData, 40);
    
    // Add explanatory text below table
    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);
    const radarExplanation = "Tabel di atas menunjukkan perbandingan antara tingkat kematangan saat ini dan tingkat target untuk setiap domain COBIT. Semakin tinggi nilai, semakin tinggi tingkat kematangan. Area yang memiliki kesenjangan besar antara kondisi saat ini dan target memerlukan perhatian lebih.";
    const radarLines = pdf.splitTextToSize(radarExplanation, 170);
    
    // Add text below the table (get position from the last table)
    const finalY1 = (pdf as any).lastAutoTable?.finalY || 140;
    pdf.text(radarLines, 20, finalY1 + 10);

    // Add gap analysis
    pdf.setFontSize(14);
    pdf.setTextColor(30, 30, 30);
    pdf.text("Gap Analysis / Analisis Kesenjangan", 105, finalY1 + 30, {
      align: "center"
    });

    // Replace bar chart with a gap analysis table
    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);
    pdf.text("Table showing current levels, target levels, and gaps for each domain", 105, finalY1 + 37, {
      align: "center"
    });
    pdf.text("Tabel yang menunjukkan tingkat saat ini, tingkat target, dan kesenjangan untuk setiap domain", 105, finalY1 + 42, {
      align: "center"
    });
    
    // Add gap analysis table
    addGapAnalysisTable(pdf, domainsData, 20, finalY1 + 50);

    // Add a page break
    pdf.addPage();

    // Add text-based gap analysis
    pdf.setFontSize(14);
    pdf.setTextColor(30, 30, 30);
    pdf.text("Detailed Gap Analysis / Analisis Kesenjangan Terperinci", 105, 20, {
      align: "center"
    });
    
    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);
    pdf.text("Numerical representation of maturity level gaps between current state and targets", 105, 27, {
      align: "center"
    });
    pdf.text("Representasi numerik dari kesenjangan tingkat kematangan antara kondisi saat ini dan target", 105, 32, {
      align: "center"
    });
    
    // Add detailed gap analysis table
    addDetailedGapTable(pdf, domainsData, 20, 40);

    // Add heat map for prioritization
    pdf.addPage();
    pdf.setFontSize(14);
    pdf.setTextColor(30, 30, 30);
    pdf.text("Priority Heat Map / Peta Panas Prioritas", 105, 20, {
      align: "center"
    });
    
    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);
    pdf.text("Visualization of improvement priorities based on gap analysis", 105, 27, {
      align: "center"
    });
    pdf.text("Visualisasi prioritas perbaikan berdasarkan analisis kesenjangan", 105, 32, {
      align: "center"
    });

    // Add text-based priority map
    addPriorityTable(pdf, domainsData, 20, 40);

    // Add detailed results table
    pdf.addPage();
    pdf.setFontSize(14);
    pdf.setTextColor(30, 30, 30);
    pdf.text("Detailed Assessment Results / Hasil Penilaian Terperinci", 105, 20, {
      align: "center"
    });
    
    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);
    pdf.text("Comprehensive breakdown of audit results by domain and process", 105, 27, {
      align: "center"
    });
    pdf.text("Rincian komprehensif hasil audit berdasarkan domain dan proses", 105, 32, {
      align: "center"
    });

    // Add table with detailed results
    addDetailedResultsTable(pdf, auditResults, 40);

    // Add recommendations
    pdf.addPage();
    pdf.setFontSize(14);
    pdf.setTextColor(30, 30, 30);
    pdf.text("Recommendations / Rekomendasi", 105, 20, {
      align: "center"
    });
    
    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);
    pdf.text("Action items prioritized by impact and feasibility", 105, 27, {
      align: "center"
    });
    pdf.text("Item tindakan yang diprioritaskan berdasarkan dampak dan kelayakan", 105, 32, {
      align: "center"
    });

    addRecommendationsTable(pdf, recommendations, 40);

    // Add maturity trend analysis (replace chart with table)
    pdf.addPage();
    pdf.setFontSize(14);
    pdf.setTextColor(30, 30, 30);
    pdf.text("Maturity Trend Analysis / Analisis Tren Kematangan", 105, 20, {
      align: "center"
    });
    
    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);
    pdf.text("Projected maturity improvement over time with implementation of recommendations", 105, 27, {
      align: "center"
    });
    pdf.text("Proyeksi peningkatan kematangan dari waktu ke waktu dengan implementasi rekomendasi", 105, 32, {
      align: "center"
    });
    
    // Add maturity trend table
    addMaturityTrendTable(pdf, domainsData, 40);
    
    // Add explanatory text below table
    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);
    const trendExplanation = "Tabel ini menunjukkan proyeksi peningkatan tingkat kematangan dalam 12 bulan ke depan jika rekomendasi diterapkan sesuai prioritas. Proyeksi ini mengasumsikan implementasi yang efektif dari langkah-langkah yang direkomendasikan dan komitmen manajemen yang berkelanjutan.";
    const trendLines = pdf.splitTextToSize(trendExplanation, 170);
    
    // Get position from last table
    const finalY2 = (pdf as any).lastAutoTable?.finalY || 140;
    pdf.text(trendLines, 20, finalY2 + 10);

    // Add implementation roadmap
    pdf.addPage();
    pdf.setFontSize(14);
    pdf.setTextColor(30, 30, 30);
    pdf.text("Implementation Roadmap / Peta Jalan Implementasi", 105, 20, {
      align: "center"
    });
    
    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);
    pdf.text("Suggested phased approach to implementing recommendations", 105, 27, {
      align: "center"
    });
    pdf.text("Pendekatan bertahap yang disarankan untuk mengimplementasikan rekomendasi", 105, 32, {
      align: "center"
    });
    
    addImplementationRoadmap(pdf, domainsData, recommendations, 40);

    // Add footer with page numbers
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Page / Halaman ${i} of / dari ${pageCount}`, 105, 290, {
        align: "center"
      });
      pdf.text(`COBIT 2019 Assessment Report - Generated on / Dihasilkan pada ${new Date().toLocaleDateString()}`, 105, 295, {
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

  // Calculate average gap
  const avgGap = maturityData.reduce((sum, domain) => sum + (domain.targetLevel - domain.currentLevel), 0) / maturityData.length;

  return `Executive Summary (English):
This report presents the results of a COBIT 2019 assessment conducted across ${maturityData.length} domains. The overall IT maturity level of the organization is ${avgMaturity.toFixed(2)} out of 5. The best performing domain is ${highestDomain.domain} (${highestDomain.domainName}) at level ${highestDomain.currentLevel}, while the lowest performing domain is ${lowestDomain.domain} (${lowestDomain.domainName}) at level ${lowestDomain.currentLevel}. The assessment identifies an average maturity gap of ${avgGap.toFixed(2)} between current and target levels, and provides targeted recommendations to enhance IT governance and management practices.

Ringkasan Eksekutif (Bahasa Indonesia):
Laporan ini menyajikan hasil penilaian COBIT 2019 yang dilakukan untuk ${maturityData.length} domain. Tingkat kematangan TI organisasi secara keseluruhan adalah ${avgMaturity.toFixed(2)} dari 5. Domain dengan kinerja tertinggi adalah ${highestDomain.domain} (${highestDomain.domainName}) pada level ${highestDomain.currentLevel}, sedangkan domain dengan kinerja terendah adalah ${lowestDomain.domain} (${lowestDomain.domainName}) pada level ${lowestDomain.currentLevel}. Penilaian ini mengidentifikasi kesenjangan kematangan rata-rata sebesar ${avgGap.toFixed(2)} antara tingkat saat ini dan target, serta memberikan rekomendasi yang ditargetkan untuk meningkatkan praktik tata kelola dan manajemen TI.`;
};

const generateRecommendations = (maturityData: DomainMaturityData[]): Recommendation[] => {
  return maturityData.map((domain) => {
    const gap = domain.targetLevel - domain.currentLevel;
    let priority: 'Tinggi' | 'Sedang' | 'Rendah' = 'Rendah';
    let description = '';
    let impact = '';

    if (gap > 3) {
      priority = 'Tinggi';
      description = `Perbaikan kritis diperlukan di ${domain.domain} (${domain.domainName}). Tetapkan proses tata kelola dasar dan dokumentasi untuk membangun fondasi yang kuat.`;
      impact = 'Peningkatan signifikan dalam tata kelola TI organisasi, pengurangan risiko operasional, dan peningkatan keselarasan TI dengan tujuan bisnis.';
    } else if (gap > 2) {
      priority = 'Tinggi';
      description = `Perbaikan besar diperlukan di ${domain.domain} (${domain.domainName}). Formalkan proses yang ada dan terapkan metrik pengukuran yang jelas.`;
      impact = 'Peningkatan efektivitas operasional, pengurangan insiden terkait TI, dan peningkatan kualitas layanan TI.';
    } else if (gap > 1) {
      priority = 'Sedang';
      description = `Peningkatan moderat diperlukan di ${domain.domain} (${domain.domainName}). Fokus pada standardisasi proses dan pengukuran hasil yang konsisten.`;
      impact = 'Konsistensi yang lebih baik dalam operasi TI, keselarasan yang lebih baik dengan tujuan bisnis, dan peningkatan efisiensi dalam penggunaan sumber daya.';
    } else {
      priority = 'Rendah';
      description = `Penyempurnaan kecil direkomendasikan untuk ${domain.domain} (${domain.domainName}). Optimalkan proses yang ada dan fokus pada peningkatan berkelanjutan yang terukur.`;
      impact = 'Keunggulan operasional dan praktik tata kelola TI terdepan di industri, membuka peluang untuk inovasi dan transformasi digital yang berkelanjutan.';
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

// New function to add maturity comparison table (replaces radar chart)
const addMaturityComparisonTable = (pdf: jsPDF, data: DomainMaturityData[], startY: number): void => {
  const tableData = data.map(d => [
    d.domain,
    d.domainName,
    d.currentLevel.toString(),
    d.targetLevel.toString(),
  ]);

  autoTable(pdf, {
    startY: startY,
    head: [["Domain", "Domain Name / Nama Domain", "Current Level / Tingkat Saat Ini", "Target Level / Tingkat Target"]],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [80, 80, 80] },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 90 },
      2: { cellWidth: 35, halign: 'center' },
      3: { cellWidth: 35, halign: 'center' }
    },
    didParseCell: function(data) {
      // Color the current level cell based on value
      if (data.section === 'body' && data.column.index === 2) {
        const level = parseFloat(data.cell.raw?.toString() || "0");
        if (level < 2) {
          data.cell.styles.fillColor = [255, 179, 179]; // Light red for low levels
        } else if (level < 4) {
          data.cell.styles.fillColor = [255, 255, 179]; // Light yellow for medium levels
        } else {
          data.cell.styles.fillColor = [179, 255, 179]; // Light green for high levels
        }
      }
    }
  });
};

// New function to add detailed gap table
const addDetailedGapTable = (pdf: jsPDF, data: DomainMaturityData[], x: number, y: number): void => {
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
      d.domainName.length > 20 ? d.domainName.substring(0, 20) + "..." : d.domainName,
      d.currentLevel.toString(),
      d.targetLevel.toString(),
      gap.toFixed(2),
      priority
    ];
  });

  autoTable(pdf, {
    startY: y,
    head: [["Domain", "Nama Domain", "Saat Ini\nCurrent", "Target", "Kesenjangan\nGap", "Prioritas\nPriority"]],
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
  pdf.text("Gap Analysis Summary / Ringkasan Analisis Kesenjangan", 20, finalY + 20);
  pdf.setFontSize(10);
  pdf.setTextColor(60, 60, 60);

  // Generate gap analysis text
  let gapAnalysisText = "This table shows the maturity gap between current and target levels for each COBIT domain. Higher gaps indicate areas requiring more immediate attention.\n\n";
  gapAnalysisText += "Tabel ini menunjukkan kesenjangan kematangan antara tingkat saat ini dan target untuk setiap domain COBIT. Kesenjangan yang lebih tinggi menunjukkan area yang memerlukan perhatian lebih segera.\n\n";
  
  const gapAnalysis = data.map((d) => {
    const gap = d.targetLevel - d.currentLevel;
    return `${d.domain} (${d.domainName}): Current/Saat ini ${d.currentLevel} vs Target ${d.targetLevel} - Gap/Kesenjangan: ${gap.toFixed(2)}`;
  });

  gapAnalysisText += gapAnalysis.join("\n");
  const analysisLines = pdf.splitTextToSize(gapAnalysisText, 170);
  pdf.text(analysisLines, 20, finalY + 30);
};

// New function to add maturity trend table
const addMaturityTrendTable = (pdf: jsPDF, data: DomainMaturityData[], startY: number): void => {
  const periods = ["Current", "3 months", "6 months", "9 months", "12 months"];
  
  // Create header row with periods
  const headRow = ["Domain", "Domain Name / Nama Domain", ...periods];
  
  // Create body rows with simulated improvement progression for each domain
  const bodyRows = data.map(domain => {
    const gap = domain.targetLevel - domain.currentLevel;
    const progression = [
      domain.currentLevel,
      domain.currentLevel + (gap * 0.2),
      domain.currentLevel + (gap * 0.4),
      domain.currentLevel + (gap * 0.7),
      domain.currentLevel + (gap * 0.9)
    ].map(val => val.toFixed(2));
    
    return [
      domain.domain,
      domain.domainName.length > 25 ? domain.domainName.substring(0, 25) + "..." : domain.domainName,
      ...progression
    ];
  });
  
  autoTable(pdf, {
    startY: startY,
    head: [headRow],
    body: bodyRows,
    theme: 'grid',
    headStyles: { fillColor: [80, 80, 80] },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 60 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 20, halign: 'center' },
      6: { cellWidth: 20, halign: 'center' }
    },
    didParseCell: function(data) {
      // Apply color gradient to show improvement over time
      if (data.section === 'body' && data.column.index > 1) {
        // Calculate the shade intensity based on the column (time period)
        const intensity = Math.min(255, 255 - ((data.column.index - 2) * 40));
        data.cell.styles.fillColor = [intensity, 255, intensity];
      }
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
      d.domainName.length > 20 ? d.domainName.substring(0, 20) + "..." : d.domainName,
      d.currentLevel.toString(),
      d.targetLevel.toString(),
      gap.toFixed(2),
      priority
    ];
  });

  autoTable(pdf, {
    startY: y,
    head: [["Domain", "Nama Domain", "Saat Ini\nCurrent", "Target", "Kesenjangan\nGap", "Prioritas\nPriority"]],
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
  pdf.text("Gap Analysis Summary / Ringkasan Analisis Kesenjangan", 20, finalY + 20);
  pdf.setFontSize(10);
  pdf.setTextColor(60, 60, 60);

  // Generate gap analysis text
  let gapAnalysisText = "This table shows the maturity gap between current and target levels for each COBIT domain. Higher gaps indicate areas requiring more immediate attention.\n\n";
  gapAnalysisText += "Tabel ini menunjukkan kesenjangan kematangan antara tingkat saat ini dan target untuk setiap domain COBIT. Kesenjangan yang lebih tinggi menunjukkan area yang memerlukan perhatian lebih segera.\n\n";
  
  const gapAnalysis = data.map((d) => {
    const gap = d.targetLevel - d.currentLevel;
    return `${d.domain} (${d.domainName}): Current/Saat ini ${d.currentLevel} vs Target ${d.targetLevel} - Gap/Kesenjangan: ${gap.toFixed(2)}`;
  });

  gapAnalysisText += gapAnalysis.join("\n");
  const analysisLines = pdf.splitTextToSize(gapAnalysisText, 170);
  pdf.text(analysisLines, 20, finalY + 30);
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
            "Question / Pertanyaan",
            "Maturity / Kematangan",
            "Notes / Catatan"
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
        "Recommendation / Rekomendasi",
        "Priority / Prioritas",
        "Expected Impact / Dampak yang Diharapkan"
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
  
  // Add implementation guidance after table
  const finalY = (pdf as any).lastAutoTable?.finalY || (startY + 120);
  
  pdf.setFontSize(11);
  pdf.setTextColor(40, 40, 40);
  pdf.text("Implementation Guidance / Panduan Implementasi", 20, finalY + 15);
  
  pdf.setFontSize(10);
  pdf.setTextColor(60, 60, 60);
  const guidance = "For each recommendation, consider these implementation steps:\n1. Assign a responsible owner for the improvement initiative\n2. Define specific, measurable success criteria\n3. Establish a timeframe with milestones\n4. Identify required resources (budget, personnel, tools)\n5. Create a tracking mechanism to monitor progress\n\nUntuk setiap rekomendasi, pertimbangkan langkah-langkah implementasi berikut:\n1. Tetapkan penanggung jawab untuk inisiatif peningkatan\n2. Tentukan kriteria keberhasilan yang spesifik dan terukur\n3. Tetapkan kerangka waktu dengan tonggak pencapaian\n4. Identifikasi sumber daya yang diperlukan (anggaran, personel, alat)\n5. Buat mekanisme pelacakan untuk memantau kemajuan";
  
  const guidanceLines = pdf.splitTextToSize(guidance, 170);
  pdf.text(guidanceLines, 20, finalY + 25);
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
    let action = '';
    
    if (gap > 3) {
      priority = 'Kritis / Critical';
      action = 'Tindakan Segera / Immediate Action';
    } else if (gap > 2) {
      priority = 'Tinggi / High';
      action = 'Prioritas Tinggi / High Priority';
    } else if (gap > 1) {
      priority = 'Sedang / Medium';
      action = 'Peningkatan Terencana / Planned Improvement';
    } else {
      priority = 'Rendah / Low';
      action = 'Optimasi Berkelanjutan / Continuous Optimization';
    }
    
    return [
      d.domain,
      d.domainName.length > 20 ? d.domainName.substring(0, 20) + "..." : d.domainName,
      gap.toFixed(2),
      priority,
      action
    ];
  });

  autoTable(pdf, {
    startY: y,
    head: [["Domain", "Domain Name / Nama Domain", "Gap / Kesenjangan", "Priority / Prioritas", "Action / Tindakan"]],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [80, 80, 80] },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 50 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 30, halign: 'center' },
      4: { cellWidth: 55 }
    },
    didParseCell: function(data) {
      // Color the priority cell based on value
      if (data.section === 'body' && data.column.index === 3) {
        const priority = data.cell.raw?.toString();
        if (priority?.includes('Kritis')) {
          data.cell.styles.fillColor = [255, 99, 132];
          data.cell.styles.textColor = [255, 255, 255];
        } else if (priority?.includes('Tinggi')) {
          data.cell.styles.fillColor = [255, 159, 64];
          data.cell.styles.textColor = [255, 255, 255];
        } else if (priority?.includes('Sedang')) {
          data.cell.styles.fillColor = [255, 205, 86];
        } else {
          data.cell.styles.fillColor = [75, 192, 192];
        }
      }
    }
  });

  // Add legend and explanation
  const finalY = (pdf as any).lastAutoTable?.finalY || (y + 120);
  
  // Add colored rectangles for the legend
  pdf.setFontSize(12);
  pdf.setTextColor(40, 40, 40);
  pdf.text("Priority Legend / Legenda Prioritas", 20, finalY + 15);
  
  // Add colored rectangles
  pdf.setFillColor(255, 99, 132);
  pdf.rect(20, finalY + 25, 10, 5, 'F');
  pdf.setTextColor(40, 40, 40);
  pdf.setFontSize(10);
  pdf.text('Critical Gap (>3) / Kesenjangan Kritis: Immediate action required / Tindakan segera diperlukan', 35, finalY + 29);

  pdf.setFillColor(255, 159, 64);
  pdf.rect(20, finalY + 35, 10, 5, 'F');
  pdf.text('High Gap (2-3) / Kesenjangan Tinggi: High priority improvement needed / Peningkatan prioritas tinggi diperlukan', 35, finalY + 39);

  pdf.setFillColor(255, 205, 86);
  pdf.rect(20, finalY + 45, 10, 5, 'F');
  pdf.text('Medium Gap (1-2) / Kesenjangan Sedang: Moderate improvement needed / Peningkatan moderat diperlukan', 35, finalY + 49);

  pdf.setFillColor(75, 192, 192);
  pdf.rect(20, finalY + 55, 10, 5, 'F');
  pdf.text('Low Gap (<1) / Kesenjangan Rendah: Fine-tuning and optimization / Penyetelan dan optimasi', 35, finalY + 59);

  // Add explanation text
  pdf.setFontSize(11);
  pdf.setTextColor(60, 60, 60);
  pdf.text("Priority Explanation / Penjelasan Prioritas:", 20, finalY + 70);
  pdf.setFontSize(10);
  const priorityExplanation = "The heat map above identifies priority areas for improvement based on the gap between current and target maturity levels. Areas with larger gaps should be prioritized for improvement efforts. Critical and High gap areas require immediate attention and resource allocation.\n\nPeta panas di atas mengidentifikasi area prioritas untuk perbaikan berdasarkan kesenjangan antara tingkat kematangan saat ini dan target. Area dengan kesenjangan lebih besar harus diprioritaskan untuk upaya perbaikan. Area dengan kesenjangan Kritis dan Tinggi memerlukan perhatian segera dan alokasi sumber daya.";
  const explanationLines = pdf.splitTextToSize(priorityExplanation, 170);
  pdf.text(explanationLines, 20, finalY + 80);
};

// Add implementation roadmap to the report
const addImplementationRoadmap = (pdf: jsPDF, data: DomainMaturityData[], recommendations: Recommendation[], startY: number): void => {
  // Group recommendations by priority
  const highPriority = recommendations.filter(r => r.priority === 'Tinggi');
  const mediumPriority = recommendations.filter(r => r.priority === 'Sedang');
  const lowPriority = recommendations.filter(r => r.priority === 'Rendah');
  
  pdf.setFontSize(11);
  pdf.setTextColor(40, 40, 40);
  pdf.text("Phased Implementation Approach / Pendekatan Implementasi Bertahap", 20, startY);
  
  let yPos = startY + 10;
  
  // Phase 1
  pdf.setFillColor(255, 99, 132);
  pdf.rect(20, yPos, 10, 5, 'F');
  pdf.setFontSize(11);
  pdf.setTextColor(40, 40, 40);
  pdf.text("Phase 1: Immediate Actions (0-3 months) / Fase 1: Tindakan Segera (0-3 bulan)", 35, yPos + 4);
  
  yPos += 10;
  pdf.setFontSize(10);
  pdf.setTextColor(60, 60, 60);
  
  if (highPriority.length > 0) {
    const phase1Text = highPriority.map(r => `• ${r.domain}: ${r.description.substring(0, 80)}...`).join('\n');
    const phase1Lines = pdf.splitTextToSize(phase1Text, 170);
    pdf.text(phase1Lines, 25, yPos);
    yPos += phase1Lines.length * 5 + 5;
  } else {
    pdf.text("• No critical items identified", 25, yPos);
    yPos += 10;
  }
  
  // Phase 2
  pdf.setFillColor(255, 159, 64);
  pdf.rect(20, yPos, 10, 5, 'F');
  pdf.setFontSize(11);
  pdf.setTextColor(40, 40, 40);
  pdf.text("Phase 2: Short-Term Improvements (3-6 months) / Fase 2: Perbaikan Jangka Pendek (3-6 bulan)", 35, yPos + 4);
  
  yPos += 10;
  pdf.setFontSize(10);
  pdf.setTextColor(60, 60, 60);
  
  if (mediumPriority.length > 0) {
    // Take first half of medium priority items
    const phase2Items = mediumPriority.slice(0, Math.ceil(mediumPriority.length / 2));
    const phase2Text = phase2Items.map(r => `• ${r.domain}: ${r.description.substring(0, 80)}...`).join('\n');
    const phase2Lines = pdf.splitTextToSize(phase2Text, 170);
    pdf.text(phase2Lines, 25, yPos);
    yPos += phase2Lines.length * 5 + 5;
  } else {
    pdf.text("• No medium priority items identified", 25, yPos);
    yPos += 10;
  }
  
  // Phase 3
  pdf.setFillColor(255, 205, 86);
  pdf.rect(20, yPos, 10, 5, 'F');
  pdf.setFontSize(11);
  pdf.setTextColor(40, 40, 40);
  pdf.text("Phase 3: Medium-Term Improvements (6-9 months) / Fase 3: Perbaikan Jangka Menengah (6-9 bulan)", 35, yPos + 4);
  
  yPos += 10;
  pdf.setFontSize(10);
  pdf.setTextColor(60, 60, 60);
  
  if (mediumPriority.length > 1) {
    // Take second half of medium priority items
    const phase3Items = mediumPriority.slice(Math.ceil(mediumPriority.length / 2));
    const phase3Text = phase3Items.map(r => `• ${r.domain}: ${r.description.substring(0, 80)}...`).join('\n');
    const phase3Lines = pdf.splitTextToSize(phase3Text, 170);
    pdf.text(phase3Lines, 25, yPos);
    yPos += phase3Lines.length * 5 + 5;
  } else {
    pdf.text("• Continue implementing medium priority items from Phase 2", 25, yPos);
    yPos += 10;
  }
  
  // Phase 4
  pdf.setFillColor(75, 192, 192);
  pdf.rect(20, yPos, 10, 5, 'F');
  pdf.setFontSize(11);
  pdf.setTextColor(40, 40, 40);
  pdf.text("Phase 4: Long-Term Optimization (9-12+ months) / Fase 4: Optimasi Jangka Panjang (9-12+ bulan)", 35, yPos + 4);
  
  yPos += 10;
  pdf.setFontSize(10);
  pdf.setTextColor(60, 60, 60);
  
  if (lowPriority.length > 0) {
    const phase4Text = lowPriority.map(r => `• ${r.domain}: ${r.description.substring(0, 80)}...`).join('\n');
    const phase4Lines = pdf.splitTextToSize(phase4Text, 170);
    pdf.text(phase4Lines, 25, yPos);
    yPos += phase4Lines.length * 5 + 5;
  } else {
    pdf.text("• Focus on continuous improvement and optimization of all implemented processes", 25, yPos);
    yPos += 10;
  }
  
  // Final note
  yPos += 10;
  pdf.setFontSize(10);
  pdf.setTextColor(40, 40, 40);
  const implementationNote = "Note: This roadmap should be reviewed and adjusted quarterly based on progress and changing organizational priorities. Success metrics should be established for each phase to measure effectiveness.\n\nCatatan: Peta jalan ini harus ditinjau dan disesuaikan setiap triwulan berdasarkan kemajuan dan perubahan prioritas organisasi. Metrik keberhasilan harus ditetapkan untuk setiap fase untuk mengukur efektivitas.";
  const noteLines = pdf.splitTextToSize(implementationNote, 170);
  pdf.text(noteLines, 20, yPos);
};
