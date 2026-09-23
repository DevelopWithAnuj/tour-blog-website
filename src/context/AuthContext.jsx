import axios from 'axios';
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get('/api/v1/auth/current-user', {
        withCredentials: true,
      });
      setUser(res.data.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    const res = await axios.post(
      '/api/v1/auth/login',
      { email, password },
      { withCredentials: true }
    );
    setUser(res.data.data.user);
    return res.data;
  };

  const logout = async () => {
    await axios.post('/api/v1/auth/logout', {}, { withCredentials: true });
    setUser(null);
  };

  const loginWithGoogle = () => {
    window.location.href = '/api/v1/auth/google';
  };
  const loginWithGitHub = () => {
    window.location.href = '/api/v1/auth/github';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        loginWithGoogle,
        loginWithGitHub,
        refetch: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
