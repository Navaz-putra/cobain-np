
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  CheckCircle,
  CircleX,
  Edit,
  Trash,
} from "lucide-react";

interface User {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    role?: string;
  };
  banned_until: string | null;
}

interface UserTableProps {
  users: User[];
  filteredUsers: User[];
  onDeleteUser: (userId: string) => Promise<void>;
  onEditUser: (user: User) => void;
  apiError: string | null;
}

export const UserTable = ({
  users,
  filteredUsers,
  onDeleteUser,
  onEditUser,
  apiError,
}: UserTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Peran</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Tindakan</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.id && typeof user.id === 'string' ? user.id.substring(0, 8) + '...' : 'N/A'}</TableCell>
                <TableCell>{user.user_metadata?.name || "-"}</TableCell>
                <TableCell>{user.email || 'No email'}</TableCell>
                <TableCell className="capitalize">{user.user_metadata?.role || "auditor"}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {!user.banned_until ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        Aktif
                      </>
                    ) : (
                      <>
                        <CircleX className="mr-2 h-4 w-4 text-red-500" />
                        Nonaktif
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onEditUser(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onDeleteUser(user.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                {apiError ? 'Terjadi kesalahan saat memuat data' : 'Tidak ada data pengguna yang sesuai.'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
