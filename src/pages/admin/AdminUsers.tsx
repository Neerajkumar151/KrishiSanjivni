import React, { useEffect, useState } from 'react';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { UserX, UserCheck, Trash2, Eye } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UserWithRoles {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  roles: string[];
  status: 'active' | 'banned';
}

export const AdminUsers: React.FC = () => {
  const { loading: authLoading } = useAdminCheck();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    // Fetch profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive'
      });
      return;
    }

    // Fetch all user roles
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles' as any)
      .select('*');

    if (rolesError) {
      toast({
        title: 'Error',
        description: 'Failed to fetch user roles',
        variant: 'destructive'
      });
      return;
    }

    // Combine data
    const usersWithRoles = profilesData.map(profile => {
      const userRoles = (rolesData as any[])
        .filter((role: any) => role.user_id === profile.user_id)
        .map((role: any) => role.role);

      // Use user_roles as the primary source of truth
      let finalRoles = [...userRoles];

      // If no roles specified in user_roles, default to farmer
      if (finalRoles.length === 0) {
        finalRoles.push('farmer');
      }

      return {
        ...profile,
        roles: finalRoles,
        status: (profile as any).status || 'active'
      };
    });

    setUsers(usersWithRoles);
  };

  const handleUpdateUserStatus = async (userId: string, status: 'active' | 'banned') => {
    // Optimistic update
    const previousUsers = [...users];
    setUsers(currentUsers =>
      currentUsers.map(u => u.user_id === userId ? { ...u, status } : u)
    );

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('user_id', userId);

      if (error) throw error;

      if (status === 'banned') {
        // Also delete their messages
        await supabase.from('messages').delete().eq('user_id', userId);
      }

      toast({
        title: status === 'banned' ? 'User Banned' : 'User Unbanned',
        description: `Successfully ${status === 'banned' ? 'banned' : 'unbanned'} the user.`
      });
      // Refresh to ensure sync with server
      fetchUsers();
    } catch (error: any) {
      // Rollback on error
      setUsers(previousUsers);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // 1. Delete messages
      await supabase.from('messages').delete().eq('user_id', userId);

      // 2. Delete profile
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: 'User Deleted',
        description: 'Profile and messages have been removed.'
      });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  if (authLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold mb-2">Manage Users</h1>
        <p className="text-muted-foreground">View all users and their roles</p>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className={user.status === 'banned' ? 'bg-destructive/5' : ''}>
                <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
                <TableCell>{user.phone || 'N/A'}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {user.roles.map((role, index) => (
                      <Badge
                        key={index}
                        variant={role === 'admin' ? 'default' : 'secondary'}
                      >
                        {role}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === 'banned' ? 'destructive' : 'outline'}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(user.created_at).toLocaleDateString('en-IN')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {user.status === 'active' ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="hover:text-destructive" title="Ban User">
                            <UserX className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Ban User: {user.full_name}</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to ban this user? They will be unable to chat, and all their existing messages will be deleted.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleUpdateUserStatus(user.user_id, 'banned')} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Ban User
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : (
                      <Button variant="ghost" size="icon" className="hover:text-primary text-primary" onClick={() => handleUpdateUserStatus(user.user_id, 'active')} title="Unban User">
                        <UserCheck className="h-4 w-4" />
                      </Button>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:text-destructive" title="Delete Profile">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete User Profile: {user.full_name}</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this user's profile and all their messages. This action cannot be undone.
                            Note: The authentication account must be manually managed in the Supabase Dashboard.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteUser(user.user_id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete User
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
