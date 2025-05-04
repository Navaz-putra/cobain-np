
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Settings, User } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { AccountSettings } from "@/components/dashboard/AccountSettings";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardHeaderProps {
  audits: any[];
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ audits }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  
  return (
    <>
      <div className="mb-8 bg-gradient-to-r from-cobain-blue to-cobain-burgundy rounded-xl overflow-hidden shadow-lg">
        <div className="px-6 py-8 md:py-12 md:px-10 flex flex-col md:flex-row items-center justify-between">
          <div className="text-white mb-4 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-bold">{t("auditor.title")}</h1>
            <p className="mt-2 opacity-90">
              Selamat datang di platform audit COBIT 2019. Mulai audit tata kelola TI atau lanjutkan pekerjaan Anda.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <Link to="/start-audit">
                <Button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm">
                  <ClipboardCheck className="mr-2 h-4 w-4" />
                  Mulai Audit Baru
                </Button>
              </Link>
              {audits.length > 0 && (
                <>
                  <Link to={`/audit-checklist/${audits[0]?.id}`}>
                    <Button variant="outline" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border-white/30">
                      <Settings className="mr-2 h-4 w-4" />
                      Kelola Audit
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border-white/30"
                    onClick={() => setAccountDialogOpen(true)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Pengaturan Akun
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center justify-center">
            <img 
              src="/lovable-uploads/81c0d83a-211c-4ccb-95b8-199c8fe9a8b4.png" 
              alt="COBAIN Logo" 
              className="h-24 w-24 md:h-32 md:w-32 object-contain" 
            />
          </div>
        </div>
      </div>
      
      {/* User Account Settings Dialog */}
      <AccountSettings 
        open={accountDialogOpen} 
        onOpenChange={setAccountDialogOpen} 
      />
    </>
  );
};
