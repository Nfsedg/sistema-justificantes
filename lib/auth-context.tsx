"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from './types';
import { mockUsers } from './mock-data';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void; // Solo para demo
  updateProfile: (data: { carrera?: string; semestre?: number; matricula?: string }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    // Simular login con Google - en producción usar NextAuth
    await new Promise(resolve => setTimeout(resolve, 800));
    // Por defecto, loguear como el primer alumno
    setUser(mockUsers[0]);
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
  };

  // Función solo para demo - permite cambiar de rol fácilmente
  const switchRole = (role: UserRole) => {
    const userWithRole = mockUsers.find(u => u.rol === role);
    if (userWithRole) {
      setUser(userWithRole);
    }
  };

  // Actualizar perfil del alumno
  const updateProfile = (data: { carrera?: string; semestre?: number; matricula?: string }) => {
    if (user) {
      setUser({
        ...user,
        ...data,
        perfilCompleto: !!(data.carrera && data.semestre && data.matricula),
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginWithGoogle, logout, switchRole, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
