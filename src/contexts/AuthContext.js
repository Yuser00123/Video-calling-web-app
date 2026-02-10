'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, loginUser, loginWithUsername, signupUser, logoutUser } from '@/lib/firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await getCurrentUser();
        if (result) {
          setUser(result.user);
          setUserData(result.userData);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (username, password) => {
    const result = await loginWithUsername(username, password);
    setUser(result.user);
    setUserData(result.userData);
    return result;
  };

  const loginWithEmail = async (email, password) => {
    const result = await loginUser(email, password);
    setUser(result.user);
    setUserData(result.userData);
    return result;
  };

  const signup = async (email, username, password) => {
    const result = await signupUser(email, username, password);
    setUser(result.user);
    setUserData(result.userData);
    return result;
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setUserData(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        login,
        loginWithEmail,
        signup,
        logout,
        isAdmin: userData?.role === 'admin',
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