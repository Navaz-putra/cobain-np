
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserAdded: () => void;
  hardcodedSuperadminEmail: string;
}

export const AddUserDialog = ({ 
  open, 
  onOpenChange, 
  onUserAdded, 
  hardcodedSuperadminEmail 
}: AddUserDialogProps) => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "auditor",
    password: "",
  });

  const handleAddUser = async () => {
    try {
      if (!newUser.email || !newUser.password) {
        toast({
          title: "Error",
          description: "Email dan password harus diisi",
          variant: 'destructive'
        });
        return;
      }

      if (user?.email === hardcodedSuperadminEmail) {
        const response = await fetch("https://dcslbtsxmctxkudozrck.supabase.co/functions/v1/admin-operations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            action: "createUser",
            userData: {
              email: newUser.email,
              password: newUser.password,
              name: newUser.name,
              role: newUser.role,
              emailConfirm: true
            },
            superadmin: true,
            superadminEmail: hardcodedSuperadminEmail
          })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || "Failed to create user");
        }

        toast({
          title: "Pengguna Ditambahkan",
          description: `${newUser.name} telah ditambahkan sebagai ${newUser.role === 'admin' ? 'admin' : 'auditor'}`
        });
        
        // Reset form and close dialog
        setNewUser({
          name: "",
          email: "",
          role: "auditor",
          password: "",
        });
        onOpenChange(false);
        onUserAdded();
        return;
      }
      
      if (!session?.access_token) {
        toast({
          title: "Error",
          description: "No access token available. Silakan logout dan login kembali.",
          variant: 'destructive'
        });
        return;
      }

      const response = await fetch("https://dcslbtsxmctxkudozrck.supabase.co/functions/v1/admin-operations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: "createUser",
          userData: {
            email: newUser.email,
            password: newUser.password,
            name: newUser.name,
            role: newUser.role,
            emailConfirm: true
          }
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to create user");
      }

      toast({
        title: "Pengguna Ditambahkan",
        description: `${newUser.name} telah ditambahkan sebagai ${newUser.role === 'admin' ? 'admin' : 'auditor'}`
      });
      
      // Reset form and close dialog
      setNewUser({
        name: "",
        email: "",
        role: "auditor",
        password: "",
      });
      onOpenChange(false);
      onUserAdded();
    } catch (error) {
      console.error("Error adding user:", error);
      toast({
        title: "Error",
        description: `Gagal menambahkan pengguna: ${error instanceof Error ? error.message : 'Error tidak diketahui'}`,
        variant: 'destructive'
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Pengguna Baru</DialogTitle>
          <DialogDescription>
            Buat akun pengguna baru pada platform COBAIN.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nama
            </Label>
            <Input
              id="name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Peran
            </Label>
            <Select
              value={newUser.role}
              onValueChange={(value) => setNewUser({ ...newUser, role: value })}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Pilih peran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="auditor">Auditor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              Kata Sandi
            </Label>
            <Input
              id="password"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAddUser}>Tambah Pengguna</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
