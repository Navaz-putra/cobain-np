
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";

export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="group">
          <div className="relative">
            <Globe className="h-[1.2rem] w-[1.2rem] transition-all duration-300 group-hover:text-cobain-blue" />
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-cobain-blue text-[10px] font-medium text-white">
              {language.toUpperCase()}
            </span>
          </div>
          <span className="sr-only">Change Language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="animate-fade-in">
        <DropdownMenuItem 
          onClick={() => setLanguage("en")} 
          className={`cursor-pointer flex items-center gap-2 ${language === "en" ? "bg-muted" : ""}`}
        >
          <span className="w-5 flex justify-center">🇺🇸</span>
          <span>{t("language.en")}</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLanguage("id")} 
          className={`cursor-pointer flex items-center gap-2 ${language === "id" ? "bg-muted" : ""}`}
        >
          <span className="w-5 flex justify-center">🇮🇩</span>
          <span>{t("language.id")}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
