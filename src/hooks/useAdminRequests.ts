import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface AdminRequest {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export function useAdminRequests() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AdminRequest[];
    }
  });

  useEffect(() => {
    const channel = supabase
      .channel('admin-requests-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'admin_requests' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-requests'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}

export function useApproveAdminRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, userId }: { requestId: string; userId: string }) => {
      // First, add admin role to user
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: 'admin' });

      if (roleError) throw roleError;

      // Then update request status
      const { error: updateError } = await supabase
        .from('admin_requests')
        .update({ status: 'approved', updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-requests'] });
    }
  });
}

export function useRejectAdminRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from('admin_requests')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-requests'] });
    }
  });
}

export function useCreateAdminRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, email, fullName }: { userId: string; email: string; fullName: string }) => {
      const { error } = await supabase
        .from('admin_requests')
        .insert({
          user_id: userId,
          email,
          full_name: fullName
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-requests'] });
    }
  });
}

export function useMyAdminRequest(userId: string | undefined) {
  return useQuery({
    queryKey: ['my-admin-request', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('admin_requests')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as AdminRequest | null;
    },
    enabled: !!userId
  });
}
