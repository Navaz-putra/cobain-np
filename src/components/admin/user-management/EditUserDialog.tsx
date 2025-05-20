
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

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: () => void;
  editUser: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  setEditUser: React.Dispatch<React.SetStateAction<{
    id: string;
    name: string;
    email: string;
    role: string;
  }>>;
  hardcodedSuperadminEmail: string;
}

export const EditUserDialog = ({ 
  open, 
  onOpenChange, 
  onUserUpdated,
  editUser,
  setEditUser,
  hardcodedSuperadminEmail 
}: EditUserDialogProps) => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEditUser = async () => {
    try {
      setIsSubmitting(true);
      
      if (!editUser.id || !editUser.email) {
        toast({
          title: "Error",
          description: "Data pengguna tidak lengkap",
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
            action: "updateUser",
            userId: editUser.id,
            userData: {
              email: editUser.email,
              name: editUser.name,
              role: editUser.role
            },
            superadmin: true,
            superadminEmail: hardcodedSuperadminEmail
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Error: ${response.status}`);
        }
        
        const result = await response.json();
        
        toast({
          title: "Pengguna Diperbarui",
          description: `${editUser.name} telah diperbarui`
        });
        
        onOpenChange(false);
        onUserUpdated();
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
          action: "updateUser",
          userId: editUser.id,
          userData: {
            email: editUser.email,
            name: editUser.name,
            role: editUser.role
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
      
      const result = await response.json();
      
      toast({
        title: "Pengguna Diperbarui",
        description: `${editUser.name} telah diperbarui`
      });
      
      onOpenChange(false);
      onUserUpdated();
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: `Gagal memperbarui pengguna: ${error instanceof Error ? error.message : 'Error tidak diketahui'}`,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Pengguna</DialogTitle>
          <DialogDescription>
            Perbarui detail pengguna
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-name" className="text-right">
              Nama
            </Label>
            <Input
              id="edit-name"
              value={editUser.name}
              onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-email" className="text-right">
              Email
            </Label>
            <Input
              id="edit-email"
              value={editUser.email}
              onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
              className="col-span-3"
              disabled
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-role" className="text-right">
              Peran
            </Label>
            <Select
              value={editUser.role}
              onValueChange={(value) => setEditUser({ ...editUser, role: value })}
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
        </div>
        <DialogFooter>
          <Button onClick={handleEditUser} disabled={isSubmitting}>
            {isSubmitting ? "Memproses..." : "Simpan Perubahan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
