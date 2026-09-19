import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getToken, setToken } from '../services/api';
import { registerUser, loginUser, fetchCurrentUser, logoutUser } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function restore() {
      if (!getToken()) {
        setCheckingSession(false);
        return;
      }
      try {
        const me = await fetchCurrentUser();
        setUser(me);
      } catch {
        setToken(null);
      } finally {
        setCheckingSession(false);
      }
    }
    restore();
  }, []);

  const login = useCallback(async (credentials) => {
    setError('');
    try {
      const loggedInUser = await loginUser(credentials);
      setUser(loggedInUser);
      return { success: true, user: loggedInUser };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  }, []);

  const register = useCallback(async (payload) => {
    setError('');
    try {
      const newUser = await registerUser(payload);
      setUser(newUser);
      return { success: true, user: newUser };
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  }, []);

  const logout = useCallback(() => {
    logoutUser();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, checkingSession, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
