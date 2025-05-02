
import { createContext, useContext, useState, useEffect } from "react";

type Language = "id" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    "landing.title": "COBAIN - Comprehensive Online-Based Audit Instrument",
    "landing.subtitle": "Advanced COBIT 2019 Audit Platform",
    "landing.description": "COBAIN is a comprehensive audit platform designed to facilitate COBIT 2019 framework implementation and assessment",
    "landing.getStarted": "Get Started",
    "landing.learnMore": "Learn More",
    "landing.features.title": "Features",
    "landing.features.userManagement": "User & Role Management",
    "landing.features.assessment": "Assessment Management",
    "landing.features.maturity": "Maturity Level Calculation",
    "landing.features.gap": "Gap Analysis & Visualization",
    "landing.features.recommendation": "Recommendation Engine",
    "landing.features.reporting": "Reporting",
    "landing.features.document": "Document Management",
    "landing.features.audit": "Audit Trail",
    "login.title": "Login to COBAIN",
    "login.email": "Email",
    "login.password": "Password",
    "login.submit": "Login",
    "login.forgotPassword": "Forgot password?",
    "nav.home": "Home",
    "nav.dashboard": "Dashboard",
    "nav.audit": "Audit",
    "nav.reports": "Reports",
    "nav.settings": "Settings",
    "nav.users": "Users",
    "nav.logout": "Logout",
    "theme.light": "Light",
    "theme.dark": "Dark",
    "language.en": "English",
    "language.id": "Bahasa Indonesia",
    "admin.title": "Admin Dashboard",
    "admin.welcome": "Welcome to the Admin Dashboard",
    "admin.users.title": "User Management",
    "admin.users.add": "Add User",
    "admin.users.edit": "Edit User",
    "admin.users.delete": "Delete User",
    "admin.questions.title": "Audit Questions",
    "admin.questions.add": "Add Question",
    "admin.questions.edit": "Edit Question",
    "admin.questions.delete": "Delete Question",
    "auditor.title": "Auditor Dashboard",
    "auditor.welcome": "Welcome to the Auditor Dashboard",
    "auditor.startAudit": "Start New Audit",
    "auditor.continueAudit": "Continue Audit",
    "auditor.viewResults": "View Results",
    "chatbot.title": "COBAIN Assistant",
    "chatbot.placeholder": "Ask something about COBAIN...",
    "chatbot.welcome": "Hello! How can I help you with COBAIN today?",
  },
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
    "theme.light": "Terang",
    "theme.dark": "Gelap",
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
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const storedLanguage = localStorage.getItem("language") as Language | null;
    if (storedLanguage) {
      setLanguageState(storedLanguage);
    }
  }, []);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem("language", newLanguage);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
