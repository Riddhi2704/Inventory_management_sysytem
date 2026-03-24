import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Global axios interceptor: auto-logout on 401 (expired/invalid token)
  useEffect(() => {
    const interceptorId = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const isLoginRequest = error.config?.url?.includes('/auth/login');
        const isLoginPage = window.location.pathname === '/login';
        
        if (error.response?.status === 401 && !isLoginRequest && !isLoginPage) {
          console.warn('[AuthContext] 401 Unauthorized – clearing session and redirecting to login.');
          setUser(null);
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptorId);
  }, []);

  useEffect(() => {
    // Check local storage for token on mount
    const checkUserLoggedIn = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          // Ensure token exists, otherwise it's a malformed session
          if (parsedUser && parsedUser.token) {
            setUser(parsedUser);
          } else {
            console.warn('[AuthContext] Malformed user object in storage (missing token). Clearing session.');
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      } catch (err) {
        console.error('[AuthContext] Error parsing stored user:', err);
        localStorage.removeItem('user');
      }
      setLoading(false);
    };
    checkUserLoggedIn();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post('http://localhost:5001/api/auth/login', { email, password });
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      return res.data;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    }
  };

  const register = async (userData) => {
    try {
      const res = await axios.post('http://localhost:5001/api/auth/register', userData);
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      return res.data;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    }
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
