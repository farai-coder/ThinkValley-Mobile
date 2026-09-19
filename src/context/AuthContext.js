import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuth = await authService.isAuthenticated();
      if (isAuth) {
        const userData = await authService.getUser();
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username, password) => {
    const data = await authService.login(username, password);
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  };

  const googleAuth = async (idToken) => {
    const data = await authService.googleAuth(idToken);
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  };

  const logout = async () => {
    // Clear all auth data
    await authService.logout();
    
    // Clear all app data from AsyncStorage
    try {
      const keys = await AsyncStorage.getAllKeys();
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
    }
    
    // Reset auth state
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (userData) => {
    const data = await authService.updateProfile(userData);
    setUser(data);
    return data;
  };

  const getProfile = async () => {
    const data = await authService.getProfile();
    setUser(data);
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        googleAuth,
        logout,
        updateProfile,
        getProfile,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
