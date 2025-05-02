
import { useEffect, useState } from "react";
import { useSearchParams, Navigate, Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function EmailConfirmation() {
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token_hash");
      const type = searchParams.get("type");
      
      if (!token || type !== "email_confirmation") {
        setVerifying(false);
        setSuccess(false);
        return;
      }

      try {
        // Verify the email using the token from the URL
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "email_confirmation" as any,
        });

        if (error) {
          console.error("Error verifying email:", error);
          setSuccess(false);
          toast({
            title: "Verifikasi gagal",
            description: "Link verifikasi tidak valid atau sudah kedaluwarsa",
            variant: "destructive",
          });
        } else {
          setSuccess(true);
          toast({
            title: "Verifikasi berhasil",
            description: "Email Anda telah berhasil diverifikasi"
          });
        }
      } catch (error) {
        console.error("Unexpected error during verification:", error);
        setSuccess(false);
        toast({
          title: "Terjadi kesalahan",
          description: "Tidak dapat memverifikasi email Anda",
          variant: "destructive",
        });
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams, toast]);

  // If there's no token or type in the URL, redirect to home
  if (!searchParams.get("token_hash") || searchParams.get("type") !== "email_confirmation") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <img 
            src="/lovable-uploads/81c0d83a-211c-4ccb-95b8-199c8fe9a8b4.png" 
            alt="COBAIN Logo" 
            className="mx-auto h-16 w-16 mb-2" 
          />
          <CardTitle className="text-2xl font-bold">Konfirmasi Email</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4 text-center">
          {verifying ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <p>Memverifikasi email Anda, mohon tunggu sebentar...</p>
            </div>
          ) : success ? (
            <div className="flex flex-col items-center justify-center py-8">
              <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Verifikasi Berhasil</h2>
              <p className="mb-4">Email Anda telah berhasil diverifikasi. Sekarang Anda dapat masuk ke akun COBAIN Anda.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <XCircle className="h-12 w-12 text-destructive mb-4" />
              <h2 className="text-xl font-semibold mb-2">Verifikasi Gagal</h2>
              <p className="mb-4">Link verifikasi tidak valid atau sudah kedaluwarsa. Silakan coba lagi atau hubungi dukungan jika masalah berlanjut.</p>
            </div>
          )}
        </CardContent>
        
        <CardFooter>
          <div className="w-full text-center">
            <Link to={success ? "/login" : "/"}>
              <Button className="w-full">
                {success ? "Masuk ke Akun" : "Kembali ke Halaman Utama"}
              </Button>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
