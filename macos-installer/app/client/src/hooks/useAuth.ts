import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '@/lib/auth';
import type { User, LoginData, RegisterData } from '@shared/schema';

export function useAuth() {
  const [isInitialized, setIsInitialized] = useState(false);
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: () => authAPI.getCurrentUser(),
    enabled: !!authAPI.getToken() && isInitialized,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  const loginMutation = useMutation({
    mutationFn: (data: LoginData) => authAPI.login(data),
    onSuccess: (result) => {
      authAPI.setToken(result.token);
      queryClient.setQueryData(['auth', 'user'], result.user);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => authAPI.register(data),
    onSuccess: (result) => {
      authAPI.setToken(result.token);
      queryClient.setQueryData(['auth', 'user'], result.user);
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authAPI.logout(),
    onSuccess: () => {
      authAPI.clearToken();
      queryClient.setQueryData(['auth', 'user'], null);
      queryClient.clear();
    },
  });

  const login = (data: LoginData) => loginMutation.mutateAsync(data);
  const register = (data: RegisterData) => registerMutation.mutateAsync(data);
  const logout = () => logoutMutation.mutate();

  const isAuthenticated = !!user && !!authAPI.getToken();
  const isAdmin = user?.role === 'admin';

  return {
    user,
    isAuthenticated,
    isAdmin,
    isLoading: isLoading && isInitialized,
    isInitialized,
    error,
    login,
    register,
    logout,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}