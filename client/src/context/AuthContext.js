import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authAPI.login({ email, password });
      const { token: newToken, user: userData } = response.data;

      // Store auth data
      await AsyncStorage.setItem('token', newToken);
      await AsyncStorage.setItem('user', JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al iniciar sesión'
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authAPI.register(userData);
      const { token: newToken, user: newUser } = response.data;

      // Store auth data
      await AsyncStorage.setItem('token', newToken);
      await AsyncStorage.setItem('user', JSON.stringify(newUser));

      setToken(newToken);
      setUser(newUser);

      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al registrarse'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout API
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear stored data
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      
      setToken(null);
      setUser(null);
    }
  };

  const updateUser = async (userData) => {
    try {
      const response = await authAPI.updateDetails(userData);
      const updatedUser = response.data.data;

      // Update stored user data
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      return { success: true };
    } catch (error) {
      console.error('Update user error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al actualizar perfil'
      };
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      await authAPI.updatePassword({ currentPassword, newPassword });
      return { success: true };
    } catch (error) {
      console.error('Update password error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al cambiar contraseña'
      };
    }
  };

  const updatePushToken = async (pushToken) => {
    try {
      await authAPI.updatePushToken(pushToken);
      return { success: true };
    } catch (error) {
      console.error('Update push token error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al actualizar token'
      };
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getMe();
      const userData = response.data.data;

      // Update stored user data
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return { success: true };
    } catch (error) {
      console.error('Refresh user error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Error al actualizar usuario'
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    register,
    logout,
    updateUser,
    updatePassword,
    updatePushToken,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 