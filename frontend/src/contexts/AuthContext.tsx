import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, Wedding, LoginDto, RegisterDto, AuthResponse, ForgotPasswordDto, ResetPasswordDto } from '../types';
import axios from 'axios';
import toast from 'react-hot-toast';
import { authApi } from '../services/api';

const API_URL = 'http://localhost:3000/api';

// Auth Context Interface
interface AuthContextType {
  user: User | null;
  wedding: Wedding | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginDto) => Promise<void>;
  register: (credentials: RegisterDto) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setWedding: (wedding: Wedding) => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Props
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [wedding, setWeddingState] = useState<Wedding | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Check if user is authenticated (restore session from localStorage)
  const checkAuth = async () => {
    try {
      const storedToken = localStorage.getItem('authToken');

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      // Validate token by fetching user data
      const response = await axios.get<User>(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });

      setUser(response.data);
      setToken(storedToken);

      // Fetch wedding data if user is authenticated
      await fetchWedding(storedToken);
    } catch (error) {
      console.error('Auth check failed:', error);
      // Invalid token, clear it
      localStorage.removeItem('authToken');
      setUser(null);
      setToken(null);
      setWeddingState(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch wedding data
  const fetchWedding = async (authToken: string) => {
    try {
      const response = await axios.get<Wedding>(`${API_URL}/weddings`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setWeddingState(response.data);
    } catch (error: any) {
      // Wedding might not exist yet (404), that's okay
      if (error.response?.status !== 404) {
        console.error('Failed to fetch wedding:', error);
      }
    }
  };

  // Login function
  const login = async (credentials: LoginDto) => {
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/auth/login`, credentials);
      const { token: authToken, user: userData } = response.data;

      // Save token and user
      localStorage.setItem('authToken', authToken);
      setToken(authToken);
      setUser(userData);

      // Fetch wedding data
      await fetchWedding(authToken);

      toast.success('התחברת בהצלחה!');
    } catch (error: any) {
      console.error('Login failed:', error);
      // Error is handled by axios interceptor
      throw error;
    }
  };

  // Register function
  const register = async (credentials: RegisterDto) => {
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/auth/register`, credentials);
      const { token: authToken, user: userData } = response.data;

      // Save token and user
      localStorage.setItem('authToken', authToken);
      setToken(authToken);
      setUser(userData);

      // No wedding yet for new user
      setWeddingState(null);

      toast.success('ההרשמה הושלמה בהצלחה!');
    } catch (error: any) {
      console.error('Registration failed:', error);
      // Error is handled by axios interceptor
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setToken(null);
    setWeddingState(null);
    toast.success('התנתקת בהצלחה');
  };

  // Set wedding (used after creating wedding)
  const setWedding = (weddingData: Wedding) => {
    setWeddingState(weddingData);
  };

  // Forgot password function
  const forgotPassword = async (email: string) => {
    try {
      const response = await authApi.forgotPassword({ email });
      toast.success(response.data.message || 'אם המייל קיים במערכת, נשלח אליו קישור לאיפוס סיסמה');
    } catch (error: any) {
      console.error('Forgot password failed:', error);
      // Error is handled by axios interceptor
      throw error;
    }
  };

  // Reset password function
  const resetPassword = async (token: string, newPassword: string) => {
    try {
      const response = await authApi.resetPassword({ token, newPassword });
      toast.success(response.data.message || 'הסיסמה אופסה בהצלחה! אנא התחבר עם הסיסמה החדשה');
    } catch (error: any) {
      console.error('Reset password failed:', error);
      // Error is handled by axios interceptor
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    wedding,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    checkAuth,
    setWedding,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
