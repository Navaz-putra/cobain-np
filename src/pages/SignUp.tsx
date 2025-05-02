
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

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUpWithEmail } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { success, error } = await signUpWithEmail(email, password, name);
      if (success) {
        toast({
          title: "Pendaftaran berhasil",
          description: "Kami telah mengirimkan email konfirmasi ke alamat email Anda. Silakan periksa kotak masuk atau folder spam Anda untuk verifikasi.",
        });
        // Show success state instead of redirecting
        setLoading(false);
        // Create a success state in the component
        setRegisterSuccess(true);
      } else {
        toast({
          title: "Pendaftaran gagal",
          description: error || "Terjadi kesalahan saat pendaftaran",
          variant: "destructive",
        });
        setLoading(false);
      }
    } catch (error) {
      toast({
        title: "Kesalahan sistem",
        description: "Terjadi kesalahan yang tidak terduga",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const [registerSuccess, setRegisterSuccess] = useState(false);

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
          {registerSuccess ? (
            <>
              <CardTitle className="text-2xl font-bold">Pendaftaran Berhasil</CardTitle>
              <CardDescription>
                Silakan periksa email Anda untuk mengonfirmasi pendaftaran
              </CardDescription>
            </>
          ) : (
            <>
              <CardTitle className="text-2xl font-bold">Daftar Akun</CardTitle>
              <CardDescription>
                Buat akun untuk mulai menggunakan platform COBAIN
              </CardDescription>
            </>
          )}
        </CardHeader>
        
        {registerSuccess ? (
          <CardContent className="space-y-4 pt-4">
            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-6 text-center">
              <h3 className="text-lg font-medium text-green-800 dark:text-green-300 mb-2">
                Email Konfirmasi Telah Dikirim
              </h3>
              <p className="text-green-700 dark:text-green-400 mb-4">
                Kami telah mengirimkan email konfirmasi ke <span className="font-medium">{email}</span>.
                Silakan periksa kotak masuk atau folder spam Anda untuk melengkapi proses pendaftaran.
              </p>
              <p className="text-sm text-green-600 dark:text-green-500">
                Jika Anda tidak menerima email dalam beberapa menit, silakan periksa folder spam atau coba daftar kembali.
              </p>
            </div>
            <div className="text-center pt-4">
              <Link to="/login">
                <Button variant="outline" className="mr-2">
                  Kembali ke halaman login
                </Button>
              </Link>
              <Button onClick={() => setRegisterSuccess(false)}>
                Daftar dengan email lain
              </Button>
            </div>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  placeholder="Nama Lengkap"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
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
                  <Label htmlFor="password">Kata Sandi</Label>
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
                {loading ? "Mendaftar..." : "Daftar"}
              </Button>
            </CardContent>
          </form>
        )}
        
        {!registerSuccess && (
          <CardFooter>
            <div className="text-center w-full text-sm">
              Sudah memiliki akun?{" "}
              <Link to="/login" className="text-blue-600 hover:underline">
                Masuk
              </Link>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
