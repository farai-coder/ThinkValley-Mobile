import apiClient from './api';
import { ENDPOINTS } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  login: async (username, password) => {
    const response = await apiClient.post(ENDPOINTS.LOGIN, { username, password });
    if (response.data.access) {
      await AsyncStorage.setItem('access_token', response.data.access);
      await AsyncStorage.setItem('refresh_token', response.data.refresh);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await apiClient.post(ENDPOINTS.REGISTER, userData);
    if (response.data.access) {
      await AsyncStorage.setItem('access_token', response.data.access);
      await AsyncStorage.setItem('refresh_token', response.data.refresh);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Probe whether an account exists for an email/username without authenticating.
  // Mirrors the web auth flow: probe mode on /auth/login/, /auth/check/ fallback.
  checkAccount: async (identifier) => {
    try {
      const response = await apiClient.post(ENDPOINTS.LOGIN, { email: identifier, probe: true });
      return response.data;
    } catch (error) {
      if (error.response?.status === 400 || error.response?.status === 404) {
        try {
          const response = await apiClient.post(ENDPOINTS.CHECK_ACCOUNT, { identifier });
          return response.data;
        } catch (checkError) {
          return { exists: false, email: identifier };
        }
      }
      throw error;
    }
  },

  sendRegisterOtp: async (email) => {
    const response = await apiClient.post(ENDPOINTS.SEND_REGISTER_OTP, { email });
    return response.data;
  },

  verifyRegisterOtp: async (payload) => {
    let response;
    try {
      response = await apiClient.post(ENDPOINTS.VERIFY_REGISTER_OTP, payload);
    } catch (error) {
      // Older backend without the OTP endpoints: register directly.
      if (error.response?.status === 404) {
        response = await apiClient.post(ENDPOINTS.REGISTER, {
          username: payload.email,
          email: payload.email,
          first_name: payload.first_name,
          last_name: payload.last_name,
          phone: payload.phone || '',
          password: payload.password,
        });
      } else {
        throw error;
      }
    }
    const data = response.data;
    if (data.access) {
      await AsyncStorage.setItem('access_token', data.access);
      await AsyncStorage.setItem('refresh_token', data.refresh);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  googleAuth: async (idToken) => {
    const response = await apiClient.post(ENDPOINTS.GOOGLE_AUTH, { id_token: idToken });
    if (response.data.access) {
      await AsyncStorage.setItem('access_token', response.data.access);
      await AsyncStorage.setItem('refresh_token', response.data.refresh);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await apiClient.post(ENDPOINTS.FORGOT_PASSWORD, { email });
    return response.data;
  },

  verifyOTP: async (email, otp) => {
    const response = await apiClient.post(ENDPOINTS.VERIFY_OTP, { email, otp });
    return response.data;
  },

  resetPassword: async (email, otp, newPassword) => {
    const response = await apiClient.post(ENDPOINTS.RESET_PASSWORD, {
      email,
      otp,
      new_password: newPassword,
    });
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get(ENDPOINTS.ME);
    await AsyncStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await apiClient.patch(ENDPOINTS.ME, userData);
    await AsyncStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await apiClient.post(ENDPOINTS.CHANGE_PASSWORD, {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
  },

  getUser: async () => {
    const userJson = await AsyncStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  },

  isAuthenticated: async () => {
    const token = await AsyncStorage.getItem('access_token');
    return !!token;
  },
};
