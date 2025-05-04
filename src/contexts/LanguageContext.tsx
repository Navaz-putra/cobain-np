
import { createContext, useContext } from "react";

type Language = "id";

interface LanguageContextType {
  language: Language;
  t: (key: string) => string;
}

const translations = {
  id: {
    "landing.title": "COBAIN - Instrumen Audit Berbasis Online Komprehensif",
    "landing.subtitle": "Platform Audit COBIT 2019 Terdepan",
    "landing.description": "COBAIN adalah platform audit komprehensif yang dirancang untuk memfasilitasi implementasi dan penilaian kerangka kerja COBIT 2019",
    "landing.getStarted": "Mulai",
    "landing.learnMore": "Pelajari Lebih Lanjut",
    "landing.features.title": "Fitur",
    "landing.features.userManagement": "Manajemen Pengguna & Peran",
    "landing.features.assessment": "Manajemen Penilaian",
    "landing.features.maturity": "Perhitungan Tingkat Kematangan",
    "landing.features.gap": "Analisis & Visualisasi Kesenjangan",
    "landing.features.recommendation": "Mesin Rekomendasi",
    "landing.features.reporting": "Pelaporan",
    "landing.features.document": "Manajemen Dokumen",
    "landing.features.audit": "Jejak Audit",
    "login.title": "Masuk ke COBAIN",
    "login.email": "Email",
    "login.password": "Kata Sandi",
    "login.submit": "Masuk",
    "login.forgotPassword": "Lupa kata sandi?",
    "nav.home": "Beranda",
    "nav.dashboard": "Dasbor",
    "nav.audit": "Audit",
    "nav.reports": "Laporan",
    "nav.settings": "Pengaturan",
    "nav.users": "Pengguna",
    "nav.logout": "Keluar",
    "theme.light": "Mode Terang",
    "theme.dark": "Mode Gelap",
    "theme.system": "Default Sistem",
    "language.en": "Bahasa Inggris",
    "language.id": "Bahasa Indonesia",
    "admin.title": "Dasbor Admin",
    "admin.welcome": "Selamat Datang di Dasbor Admin",
    "admin.users.title": "Manajemen Pengguna",
    "admin.users.add": "Tambah Pengguna",
    "admin.users.edit": "Edit Pengguna",
    "admin.users.delete": "Hapus Pengguna",
    "admin.questions.title": "Pertanyaan Audit",
    "admin.questions.add": "Tambah Pertanyaan",
    "admin.questions.edit": "Edit Pertanyaan",
    "admin.questions.delete": "Hapus Pertanyaan",
    "auditor.title": "Dasbor Auditor",
    "auditor.welcome": "Selamat Datang di Dasbor Auditor",
    "auditor.startAudit": "Mulai Audit Baru",
    "auditor.continueAudit": "Lanjutkan Audit",
    "auditor.viewResults": "Lihat Hasil",
    "chatbot.title": "Asisten COBAIN",
    "chatbot.placeholder": "Tanyakan sesuatu tentang COBAIN...",
    "chatbot.welcome": "Halo! Bagaimana saya bisa membantu Anda dengan COBAIN hari ini?",
    "landing.benefits.title": "Manfaat Menggunakan COBAIN",
    "landing.benefits.standardized": "Proses Penilaian Terstandarisasi",
    "landing.benefits.standardized.desc": "Memastikan penerapan kerangka kerja COBIT 2019 secara konsisten di seluruh organisasi Anda.",
    "landing.benefits.efficient": "Efisiensi Waktu dan Sumber Daya",
    "landing.benefits.efficient.desc": "Mengurangi waktu dan upaya yang diperlukan untuk melakukan penilaian tata kelola TI yang komprehensif.",
    "landing.benefits.evidence": "Pendekatan Berbasis Bukti",
    "landing.benefits.evidence.desc": "Mendukung manajemen dokumentasi untuk bukti audit dan tujuan kepatuhan.",
    "landing.benefits.datadriven": "Pengambilan Keputusan Berbasis Data",
    "landing.benefits.datadriven.desc": "Memberikan wawasan yang dapat ditindaklanjuti melalui visualisasi dan pelaporan komprehensif.",
    "landing.benefits.continuous": "Peningkatan Berkelanjutan",
    "landing.benefits.continuous.desc": "Memungkinkan pelacakan inisiatif perbaikan dan kemajuan terhadap tingkat kematangan target.",
    "landing.benefits.regulatory": "Kepatuhan Regulasi",
    "landing.benefits.regulatory.desc": "Membantu organisasi memenuhi persyaratan peraturan melalui kerangka kerja tata kelola terstruktur.",
    "landing.cta.title": "Siap memulai perjalanan audit Anda?",
    "landing.cta.subtitle": "Bergabunglah dengan organisasi di seluruh dunia yang menggunakan COBAIN untuk mengimplementasikan dan menilai kerangka kerja COBIT 2019.",
    "landing.cta.button": "Mulai Sekarang",
    "landing.cobit.title": "Kerangka Audit COBIT 2019",
    "landing.cobit.desc": "Comprehensive Online-Based Audit Instrument (COBAIN) adalah platform terintegrasi yang dirancang untuk menyederhanakan dan merampingkan implementasi kerangka kerja COBIT 2019 untuk tata kelola dan manajemen TI.",
    "landing.streamlined": "Penilaian Terintegrasi",
    "landing.streamlined.desc": "Menyederhanakan proses penilaian COBIT 2019 yang kompleks dengan kuesioner terstruktur dan alur kerja terpandu.",
    "landing.analysis": "Analisis Mendalam",
    "landing.analysis.desc": "Menyediakan analisis kesenjangan komprehensif dan visualisasi antara tingkat kematangan saat ini dan target.",
    "landing.recommendations": "Rekomendasi Ahli",
    "landing.recommendations.desc": "Menghasilkan rekomendasi yang dapat ditindaklanjuti berdasarkan hasil penilaian untuk meningkatkan tata kelola TI.",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Fixed to Indonesian language
  const language: Language = "id";

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
