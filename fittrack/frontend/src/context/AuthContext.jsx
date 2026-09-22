import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, profileApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('fittrack_user');
    const token = localStorage.getItem('fittrack_token');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        fetchProfile();
      } catch (e) {
        logout();
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await profileApi.get();
      if (res.data?.data) {
        setProfile(res.data.data);
      }
    } catch (err) {
      console.warn('Could not load profile:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    const authData = res.data.data;
    localStorage.setItem('fittrack_token', authData.accessToken);
    if (authData.refreshToken) {
      localStorage.setItem('fittrack_refresh_token', authData.refreshToken);
    }
    const userData = {
      id: authData.userId,
      fullName: authData.fullName,
      email: authData.email,
      role: authData.role,
      profileComplete: authData.profileComplete,
    };
    localStorage.setItem('fittrack_user', JSON.stringify(userData));
    setUser(userData);
    await fetchProfile();
    return authData;
  };

  const register = async (data) => {
    const res = await authApi.register(data);
    const authData = res.data.data;
    localStorage.setItem('fittrack_token', authData.accessToken);
    if (authData.refreshToken) {
      localStorage.setItem('fittrack_refresh_token', authData.refreshToken);
    }
    const userData = {
      id: authData.userId,
      fullName: authData.fullName,
      email: authData.email,
      role: authData.role,
      profileComplete: authData.profileComplete,
    };
    localStorage.setItem('fittrack_user', JSON.stringify(userData));
    setUser(userData);
    await fetchProfile();
    return authData;
  };

  const logout = () => {
    localStorage.removeItem('fittrack_token');
    localStorage.removeItem('fittrack_refresh_token');
    localStorage.removeItem('fittrack_user');
    setUser(null);
    setProfile(null);
  };

  const updateProfileState = (updatedProfile) => {
    setProfile(updatedProfile);
    if (updatedProfile?.fullName && user) {
      const updatedUser = { ...user, fullName: updatedProfile.fullName };
      setUser(updatedUser);
      localStorage.setItem('fittrack_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        register,
        logout,
        fetchProfile,
        updateProfileState,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
