import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface User {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  clubId: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [clubId, setClubId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('admin_access_token');
    const userData = localStorage.getItem('admin_user');
    const storedClubId = localStorage.getItem('admin_club_id');

    if (token && userData) {
      setAccessToken(token);
      setUser(JSON.parse(userData));
      setClubId(storedClubId);
    }
    setIsLoading(false);
  }, []);

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!accessToken) return;

    const refreshInterval = setInterval(async () => {
      const refreshToken = localStorage.getItem('admin_refresh_token');
      if (refreshToken) {
        try {
          const response = await apiService.refreshToken(refreshToken);
          const { accessToken: newToken, refreshToken: newRefreshToken } = response;

          setAccessToken(newToken);
          localStorage.setItem('admin_access_token', newToken);
          localStorage.setItem('admin_refresh_token', newRefreshToken);
        } catch (error) {
          console.error('Token refresh failed:', error);
          await logout();
        }
      }
    }, 50 * 60 * 1000); // Refresh every 50 minutes (token expires in 1 hour)

    return () => clearInterval(refreshInterval);
  }, [accessToken]);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login(email, password);
      const { accessToken, refreshToken, user } = response;

      setAccessToken(accessToken);
      setUser(user);

      localStorage.setItem('admin_access_token', accessToken);
      localStorage.setItem('admin_refresh_token', refreshToken);
      localStorage.setItem('admin_user', JSON.stringify(user));

      // Fetch and set club ID
      const clubs = await apiService.getClubs();
      if (clubs && clubs.length > 0) {
        const defaultClubId = clubs[0]._id;
        setClubId(defaultClubId);
        localStorage.setItem('admin_club_id', defaultClubId);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAccessToken(null);
      setUser(null);
      setClubId(null);
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_refresh_token');
      localStorage.removeItem('admin_user');
      localStorage.removeItem('admin_club_id');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        clubId,
        login,
        logout,
        isLoading,
        isAuthenticated: !!accessToken && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
