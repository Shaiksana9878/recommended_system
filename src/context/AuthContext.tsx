import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserProfile, UserPreferences } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  preferences: UserPreferences | null;
  token: string | null;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateUserContext: (data: { user?: User; profile?: UserProfile; preferences?: UserPreferences }) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('techreel_token'));
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const currentToken = localStorage.getItem('techreel_token');
    if (!currentToken) {
      setUser(null);
      setProfile(null);
      setPreferences(null);
      setLoading(false);
      return;
    }

    try {
      const res = await authAPI.getMe();
      if (res.success && res.data) {
        setUser(res.data.user);
        setProfile(res.data.profile);
        setPreferences(res.data.preferences);
      } else {
        logout();
      }
    } catch (err) {
      console.warn('Session verification failed, logging out:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (credentials: any) => {
    const res = await authAPI.login(credentials);
    if (res.success && res.data) {
      localStorage.setItem('techreel_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setProfile(res.data.profile);
      setPreferences(res.data.preferences);
    } else {
      throw new Error(res.message || 'Login failed');
    }
  };

  const register = async (formData: any) => {
    const res = await authAPI.register(formData);
    if (res.success && res.data) {
      localStorage.setItem('techreel_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setProfile(res.data.profile);
      setPreferences(res.data.preferences);
    } else {
      throw new Error(res.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('techreel_token');
    setToken(null);
    setUser(null);
    setProfile(null);
    setPreferences(null);
  };

  const updateUserContext = (data: { user?: User; profile?: UserProfile; preferences?: UserPreferences }) => {
    if (data.user) setUser(data.user);
    if (data.profile) setProfile(data.profile);
    if (data.preferences) setPreferences(data.preferences);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        preferences,
        token,
        loading,
        login,
        register,
        logout,
        updateUserContext,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
