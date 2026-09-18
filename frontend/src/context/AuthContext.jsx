import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMeApi, getProfileApi, loginApi, registerApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('careerpilot_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      loadUserData();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userRes = await getMeApi();
      setUser(userRes.data);
      const profRes = await getProfileApi();
      setProfile(profRes.data);
    } catch (err) {
      console.error('Failed to load user session:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await loginApi({ email, password });
    const newToken = res.data.access_token;
    localStorage.setItem('careerpilot_token', newToken);
    setToken(newToken);
    return res.data;
  };

  const register = async (email, password, fullName) => {
    const res = await registerApi({ email, password, full_name: fullName });
    // Automatically log in after registration
    await login(email, password);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('careerpilot_token');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    try {
      const res = await getProfileApi();
      setProfile(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      token,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
