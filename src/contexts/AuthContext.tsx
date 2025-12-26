import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAdminRole = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        console.error('Erro ao verificar role:', error);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(!!data);
    } catch (err) {
      console.error('Erro ao verificar permissões:', err);
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          // Usar setTimeout para evitar deadlocks com Supabase
          setTimeout(() => {
            checkAdminRole(currentSession.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
        }
        setLoading(false);

        // Redirecionar para página de reset quando detectar evento de recuperação
        if (event === 'PASSWORD_RECOVERY') {
          console.log('Recuperação de senha detectada, redirecionando...');
          // Usar setTimeout para garantir que o estado foi atualizado
          setTimeout(() => {
            window.location.href = '/reset-password';
          }, 100);
        } else if (event === 'SIGNED_OUT') {
          console.log('Usuário deslogado');
        }
      }
    );

    // Verificar sessão existente ao carregar
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      if (existingSession?.user) {
        checkAdminRole(existingSession.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [checkAdminRole]);

  /**
   * Login com email e senha
   */
  const signIn = async (email: string, password: string): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });
      return { error };
    } catch (err) {
      console.error('Erro no signIn:', err);
      return { error: err as AuthError };
    }
  };

  /**
   * Cadastro com email, senha e nome
   */
  const signUp = async (email: string, password: string, fullName: string): Promise<{ error: AuthError | null }> => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName.trim()
          }
        }
      });
      return { error };
    } catch (err) {
      console.error('Erro no signUp:', err);
      return { error: err as AuthError };
    }
  };

  /**
   * Logout - limpa sessão e estado local
   */
  const signOut = async () => {
    try {
      // Limpar estado antes do signOut para UX mais rápida
      setIsAdmin(false);

      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Erro ao fazer logout:', error);
      }

      // Garantir que o estado é limpo mesmo em caso de erro
      setUser(null);
      setSession(null);
      setIsAdmin(false);
    } catch (err) {
      console.error('Erro no signOut:', err);
      // Mesmo com erro, limpar estado local por segurança
      setUser(null);
      setSession(null);
      setIsAdmin(false);
    }
  };

  /**
   * Enviar email de recuperação de senha
   */
  const resetPassword = async (email: string): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );
      return { error };
    } catch (err) {
      console.error('Erro ao enviar email de recuperação:', err);
      return { error: err as AuthError };
    }
  };

  /**
   * Atualizar senha (usado após recuperação)
   */
  const updatePassword = async (newPassword: string): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      return { error };
    } catch (err) {
      console.error('Erro ao atualizar senha:', err);
      return { error: err as AuthError };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isAdmin,
      loading,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
