import React, { createContext, useContext, useState } from 'react';
import { authApi } from '../api/auth';

export interface User {
  id?: number;
  email: string;
  full_name?: string;
  role: 'ADMIN' | 'AUDITOR';
  must_change_password?: boolean;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  mustChangePassword: boolean;
  login: (email: string, password: string) => Promise<void>;
  setAuthFromToken: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getUserFromToken(token: string): User | null {
  try {
    const payload = JSON.parse(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
    );
    if (!payload.sub || !payload.role) return null;
    return {
      id: payload.user_id,
      email: payload.sub,
      full_name: payload.full_name,
      role: payload.role as 'ADMIN' | 'AUDITOR',
    };
  } catch {
    return null;
  }
}

function loadStoredUser(): User | null {
  const saved = localStorage.getItem('user');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // ignore
    }
  }
  const token = localStorage.getItem('token');
  if (token) {
    const fromToken = getUserFromToken(token);
    if (fromToken) return fromToken;
  }
  return null;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(loadStoredUser);

  const setAuthFromToken = (accessToken: string, userInfo: User) => {
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(userInfo));
    setToken(accessToken);
    setUser(userInfo);
  };

  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    const accessToken = data.access_token;

    const userInfo: User = {
      id: data.user.id,
      email: data.user.email,
      full_name: data.user.full_name,
      role: data.user.role as 'ADMIN' | 'AUDITOR',
      must_change_password: data.user.must_change_password,
    };

    setAuthFromToken(accessToken, userInfo);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token,
        isAdmin: true, // All users have access to all features
        mustChangePassword: !!(user?.must_change_password),
        login,
        setAuthFromToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
