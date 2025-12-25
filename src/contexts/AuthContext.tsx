import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User, Empresa, AuthState } from '@/types/auth';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, nombre: string, apellido: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    empresa: null,
    isAuthenticated: false,
    isLoading: true,
    isAdmin: false,
  });

  // Fetch user profile from seg_usuarios
  const fetchUserProfile = async (email: string) => {
    try {
      const { data: usuario, error } = await supabase
        .from('seg_usuarios')
        .select('*')
        .eq('email', email)
        .eq('activo', true)
        .maybeSingle();

      if (error) throw error;
      
      if (!usuario) {
        return { user: null, empresa: null };
      }

      let empresa: Empresa | null = null;
      if (usuario.empresa_id) {
        const { data: empresaData } = await supabase
          .from('seg_empresas')
          .select('*')
          .eq('id', usuario.empresa_id)
          .maybeSingle();
        
        if (empresaData) {
          empresa = empresaData as Empresa;
        }
      }

      return { 
        user: usuario as User, 
        empresa 
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return { user: null, empresa: null };
    }
  };

  // Check if user has admin role
  const checkAdminRole = async (usuarioId: string) => {
    try {
      const { data: roles } = await supabase
        .from('seg_usuario_rol')
        .select(`
          rol_id,
          seg_roles!inner(nombre)
        `)
        .eq('usuario_id', usuarioId);

      if (roles && roles.length > 0) {
        return roles.some((r: any) => 
          r.seg_roles?.nombre?.toLowerCase().includes('admin') ||
          r.seg_roles?.nombre?.toLowerCase().includes('administrador')
        );
      }
      return false;
    } catch (error) {
      console.error('Error checking admin role:', error);
      return false;
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        
        if (session?.user?.email) {
          // Defer Supabase calls with setTimeout to avoid deadlocks
          setTimeout(async () => {
            const { user, empresa } = await fetchUserProfile(session.user.email!);
            const isAdmin = user ? await checkAdminRole(user.id) : false;
            
            setAuthState({
              user,
              empresa,
              isAuthenticated: !!user,
              isLoading: false,
              isAdmin,
            });
          }, 0);
        } else {
          setAuthState({
            user: null,
            empresa: null,
            isAuthenticated: false,
            isLoading: false,
            isAdmin: false,
          });
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.email) {
        fetchUserProfile(session.user.email).then(async ({ user, empresa }) => {
          const isAdmin = user ? await checkAdminRole(user.id) : false;
          setAuthState({
            user,
            empresa,
            isAuthenticated: !!user,
            isLoading: false,
            isAdmin,
          });
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        
        if (error.message.includes('Invalid login credentials')) {
          return { success: false, error: 'Email o contraseña incorrectos' };
        }
        if (error.message.includes('Email not confirmed')) {
          return { success: false, error: 'Por favor confirma tu email antes de iniciar sesión' };
        }
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Check if user exists in seg_usuarios and is active
        const { user: userProfile } = await fetchUserProfile(data.user.email!);
        
        if (!userProfile) {
          await supabase.auth.signOut();
          setAuthState(prev => ({ ...prev, isLoading: false }));
          return { success: false, error: 'Usuario no registrado en el sistema o cuenta desactivada' };
        }

        return { success: true };
      }

      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: 'Error desconocido' };
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: error.message || 'Error de conexión' };
    }
  }, []);

  const signup = useCallback(async (
    email: string, 
    password: string,
    nombre: string,
    apellido: string
  ): Promise<{ success: boolean; error?: string }> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            nombre,
            apellido,
          }
        }
      });

      if (error) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        
        if (error.message.includes('already registered')) {
          return { success: false, error: 'Este email ya está registrado' };
        }
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Create user in seg_usuarios table
        const { error: insertError } = await supabase
          .from('seg_usuarios')
          .insert({
            email: email.trim(),
            nombre,
            apellido,
            activo: true,
          });

        if (insertError) {
          console.error('Error creating user profile:', insertError);
          // Don't fail the signup, just log the error
        }

        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { success: true };
      }

      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: 'Error desconocido' };
    } catch (error: any) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: error.message || 'Error de conexión' };
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setAuthState({
      user: null,
      empresa: null,
      isAuthenticated: false,
      isLoading: false,
      isAdmin: false,
    });
  }, []);

  const updateUser = useCallback((userData: Partial<User>) => {
    setAuthState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...userData } : null,
    }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, login, signup, logout, updateUser }}>
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
