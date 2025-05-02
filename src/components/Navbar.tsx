
import { Link } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle } from "./LanguageToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const getLogo = () => (
    <div className="flex items-center space-x-2">
      <img src="/lovable-uploads/81c0d83a-211c-4ccb-95b8-199c8fe9a8b4.png" alt="COBAIN Logo" className="h-10 w-10" />
      <span className="text-xl font-bold font-poppins">COBAIN</span>
    </div>
  );

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link to="/">{getLogo()}</Link>
          </div>

          {/* Push everything to the right */}
          <div className="flex-1"></div>

          {/* Desktop menu */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link to="/">
                    <Button variant="ghost">{t("nav.home")}</Button>
                  </Link>
                  <Link to={user?.role === "admin" ? "/admin-dashboard" : "/auditor-dashboard"}>
                    <Button variant="ghost">{t("nav.dashboard")}</Button>
                  </Link>
                  <Link to="/audit">
                    <Button variant="ghost">{t("nav.audit")}</Button>
                  </Link>
                  {user?.role === "admin" && (
                    <Link to="/users">
                      <Button variant="ghost">{t("nav.users")}</Button>
                    </Link>
                  )}
                  <Button variant="ghost" onClick={logout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    {t("nav.logout")}
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button className="bg-cobain-blue hover:bg-cobain-navy">Masuk</Button>
                  </Link>
                  <Link to="/signup">
                    <Button variant="outline" className="border-cobain-blue text-cobain-blue hover:bg-cobain-blue/10">Daftar</Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center ml-4 space-x-2">
            <ThemeToggle />
            <LanguageToggle />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col space-y-4 pt-10">
                  <Link to="/" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      {t("nav.home")}
                    </Button>
                  </Link>

                  {isAuthenticated ? (
                    <>
                      <Link 
                        to={user?.role === "admin" ? "/admin-dashboard" : "/auditor-dashboard"} 
                        onClick={() => setIsOpen(false)}
                      >
                        <Button variant="ghost" className="w-full justify-start">
                          {t("nav.dashboard")}
                        </Button>
                      </Link>
                      <Link to="/audit" onClick={() => setIsOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start">
                          {t("nav.audit")}
                        </Button>
                      </Link>
                      {user?.role === "admin" && (
                        <Link to="/users" onClick={() => setIsOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start">
                            {t("nav.users")}
                          </Button>
                        </Link>
                      )}
                      <Button 
                        variant="ghost" 
                        onClick={handleLogout}
                        className="w-full justify-start"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        {t("nav.logout")}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" onClick={() => setIsOpen(false)}>
                        <Button className="w-full bg-cobain-blue hover:bg-cobain-navy">Masuk</Button>
                      </Link>
                      <Link to="/signup" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full border-cobain-blue text-cobain-blue hover:bg-cobain-blue/10">Daftar</Button>
                      </Link>
                    </>
                  )}
                  
                  <div className="flex space-x-2 pt-4">
                    <ThemeToggle />
                    <LanguageToggle />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
