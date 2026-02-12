import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

export function useAuth() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['auth'],
    queryFn: () => api.auth.me(),
    retry: false,
  });

  const logout = async () => {
    await api.auth.logout();
    queryClient.setQueryData(['auth'], null);
  };

  return {
    user: data?.user ?? null,
    isLoading,
    error,
    logout,
  };
}
