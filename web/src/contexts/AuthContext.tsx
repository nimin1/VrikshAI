/**
 * Authentication Context for VrikshAI
 *
 * Provides authentication state and methods throughout the app.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginRequest, SignupRequest } from '../types';
import * as api from '../services/api';
import { toast } from 'react-toastify';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const token = api.getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const result = await api.verifyToken();
      if (!result.success || !result.user) {
        api.removeToken();
        setUser(null);
      } else {
        setUser(result.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      api.removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(data: LoginRequest) {
    try {
      setLoading(true);
      const response = await api.login(data);
      console.log('Login response:', response);
      setUser(response.user);
      console.log('User state set to:', response.user);
      console.log('Authenticated:', !!response.user);
      toast.success(`Welcome back, ${response.user.name}!`);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function signup(data: SignupRequest) {
    try {
      setLoading(true);
      const response = await api.signup(data);
      setUser(response.user);
      toast.success(`Welcome to VrikshAI, ${response.user.name}!`);
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setUser(null);
    api.logout();
    toast.info('Logged out successfully');
  }

  const value: AuthContextType = {
    user,
    loading,
    authenticated: !!user,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
