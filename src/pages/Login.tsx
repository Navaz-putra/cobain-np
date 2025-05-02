
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        toast({
          title: "Login berhasil",
          description: "Selamat datang di platform COBAIN",
        });
        
        // Redirect based on user role (determined in login function)
        const userData = JSON.parse(localStorage.getItem("cobain_user") || "{}");
        
        if (userData.role === "admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/auditor-dashboard");
        }
      } else {
        toast({
          title: "Login gagal",
          description: "Email atau kata sandi tidak valid. Silakan coba lagi.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login error",
        description: "Terjadi kesalahan yang tidak terduga. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <img 
            src="/lovable-uploads/81c0d83a-211c-4ccb-95b8-199c8fe9a8b4.png" 
            alt="COBAIN Logo" 
            className="mx-auto h-16 w-16 mb-2" 
          />
          <CardTitle className="text-2xl font-bold">{t("login.title")}</CardTitle>
          <CardDescription>
            Masukkan kredensial Anda untuk mengakses akun
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("login.email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("login.password")}</Label>
                <a
                  href="#"
                  className="text-sm text-cobain-blue dark:text-blue-400 hover:underline"
                >
                  {t("login.forgotPassword")}
                </a>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  onClick={togglePasswordVisibility}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Masuk..." : t("login.submit")}
            </Button>
          </CardContent>
        </form>
        <CardFooter>
          <div className="text-center w-full text-sm">
            Belum memiliki akun?{" "}
            <Link to="/signup" className="text-blue-600 hover:underline">
              Daftar
            </Link>
          </div>
        </CardFooter>

        {/* Demo credentials */}
        <div className="px-6 pb-6 pt-2">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <p className="font-semibold mb-1">Kredensial Demo:</p>
            <p>Admin: admin@cobain.com / admin123</p>
            <p>Auditor: auditor@cobain.com / auditor123</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
