
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogOut, Key, User, Mail, Phone } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTabs, DialogTab } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface AccountSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const profileFormSchema = z.object({
  username: z.string().min(2, "Username harus minimal 2 karakter").optional(),
  email: z.string().email("Email tidak valid").optional(),
  phone: z.string().min(10, "Nomor telepon tidak valid").optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const AccountSettings: React.FC<AccountSettingsProps> = ({ open, onOpenChange }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user?.name || "",
      email: user?.email || "",
      phone: "",
    },
  });

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      profileForm.setValue("username", user.name || "");
      profileForm.setValue("email", user.email || "");
    }
  }, [user]);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Password baru tidak cocok dengan konfirmasi",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setChangingPassword(true);
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast({
        title: "Sukses",
        description: "Password berhasil diubah"
      });
      
      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal mengubah password",
        variant: "destructive"
      });
    } finally {
      setChangingPassword(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
      toast({
        title: "Sukses",
        description: "Anda berhasil keluar"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal keluar dari akun",
        variant: "destructive"
      });
    }
  };

  const onSubmitProfile = async (data: ProfileFormValues) => {
    try {
      setSavingProfile(true);
      
      // Update email if changed and not empty
      if (data.email && data.email !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: data.email,
        });
        
        if (emailError) throw emailError;
      }
      
      // Update user metadata (name and phone)
      const { error: metadataError } = await supabase.auth.updateUser({
        data: { 
          name: data.username,
          phone: data.phone 
        },
      });
      
      if (metadataError) throw metadataError;
      
      toast({
        title: "Sukses",
        description: "Profil berhasil diperbarui"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal memperbarui profil",
        variant: "destructive"
      });
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Pengaturan Akun</DialogTitle>
          <DialogDescription>
            Kelola informasi profil dan keamanan akun Anda di sini.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="profile">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="security">Keamanan</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-4 py-4">
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-4">
                <FormField
                  control={profileForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Nama Pengguna
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <Mail className="mr-2 h-4 w-4" />
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={profileForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <Phone className="mr-2 h-4 w-4" />
                        Nomor Telepon
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="tel" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={savingProfile}>
                    {savingProfile ? (
                      <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    ) : null}
                    Simpan Profil
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="security" className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password" className="flex items-center">
                  <Key className="mr-2 h-4 w-4" />
                  Password Saat Ini
                </Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Password Baru</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Konfirmasi Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={handleChangePassword} 
                  disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
                >
                  {changingPassword ? (
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  ) : (
                    <Key className="mr-2 h-4 w-4" />
                  )}
                  Ubah Password
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex items-center justify-between border-t pt-4">
          <Button onClick={handleLogout} variant="outline" className="flex items-center">
            <LogOut className="mr-2 h-4 w-4" />
            Keluar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
