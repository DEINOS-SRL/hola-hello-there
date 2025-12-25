import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, Empresa, AuthState } from '@/types/auth';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data for demo purposes - will be replaced with Supabase
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@dnscloud.com',
    nombre: 'Eduardo',
    apellido: 'Torres',
    dni: '12345678',
    direccion: 'Calle Principal 123',
    telefono: '+1234567890',
    activo: true,
    empresa_id: '1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

const mockEmpresas: Empresa[] = [
  {
    id: '1',
    nombre: 'DNSCloud Corp',
    direccion: 'Av. Tecnología 456',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    empresa: null,
    isAuthenticated: false,
    isLoading: false,
    isAdmin: false,
  });

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.activo);
    
    if (user && password.length >= 6) {
      const empresa = mockEmpresas.find(e => e.id === user.empresa_id);
      setAuthState({
        user,
        empresa: empresa || null,
        isAuthenticated: true,
        isLoading: false,
        isAdmin: true, // First user is admin
      });
      return true;
    }
    
    setAuthState(prev => ({ ...prev, isLoading: false }));
    return false;
  }, []);

  const logout = useCallback(() => {
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
    <AuthContext.Provider value={{ ...authState, login, logout, updateUser }}>
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
