
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, Plus, Search, Loader2 
} from "lucide-react";

// Import our new component services and components
import { useUserManagement } from "./user-management/UserManagement.service";
import { AddUserDialog } from "./user-management/AddUserDialog";
import { EditUserDialog } from "./user-management/EditUserDialog";
import { UserTable } from "./user-management/UserTable";

interface UserManagementProps {
  hardcodedSuperadminEmail: string;
}

export const UserManagement = ({ hardcodedSuperadminEmail }: UserManagementProps) => {
  const {
    loadingUsers,
    apiError,
    searchUser,
    setSearchUser,
    isAddUserDialogOpen,
    setIsAddUserDialogOpen,
    isEditUserDialogOpen,
    setIsEditUserDialogOpen,
    editUser,
    setEditUser,
    filteredUsers,
    refreshUsers,
    handleDeleteUser,
    openEditUserDialog
  } = useUserManagement(hardcodedSuperadminEmail);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Manajemen Pengguna</CardTitle>
        <CardDescription>Kelola pengguna dan peran mereka</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-2 md:space-y-0">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari pengguna..."
              className="pl-8"
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={refreshUsers} variant="outline" size="icon" title="Refresh data">
              {loadingUsers ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
              )}
            </Button>
            <Button onClick={() => setIsAddUserDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Pengguna
            </Button>
          </div>
        </div>
        
        {apiError && (
          <div className="bg-destructive/10 border border-destructive text-destructive p-3 rounded-md mb-4">
            <p className="text-sm font-medium">Kesalahan mengambil data: {apiError}</p>
            <p className="text-xs mt-1">Silakan coba refresh halaman atau logout dan login kembali</p>
          </div>
        )}
        
        {loadingUsers ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Memuat data pengguna...</p>
          </div>
        ) : (
          <UserTable 
            users={[]}
            filteredUsers={filteredUsers}
            onDeleteUser={handleDeleteUser}
            onEditUser={openEditUserDialog}
            apiError={apiError}
          />
        )}

        {/* Add User Dialog */}
        <AddUserDialog 
          open={isAddUserDialogOpen} 
          onOpenChange={setIsAddUserDialogOpen}
          onUserAdded={refreshUsers}
          hardcodedSuperadminEmail={hardcodedSuperadminEmail}
        />

        {/* Edit User Dialog */}
        <EditUserDialog 
          open={isEditUserDialogOpen} 
          onOpenChange={setIsEditUserDialogOpen}
          onUserUpdated={refreshUsers}
          editUser={editUser}
          setEditUser={setEditUser}
          hardcodedSuperadminEmail={hardcodedSuperadminEmail}
        />
      </CardContent>
    </Card>
  );
};
