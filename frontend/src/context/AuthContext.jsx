import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

const API = import.meta.env.VITE_API_URL || "http://localhost:3002";

const TOKEN_KEY = "arctrade_token";
const USER_KEY  = "arctrade_user";

const saveSession = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

const getStoredToken = () => localStorage.getItem(TOKEN_KEY);
const getStoredUser = () => {
  try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
};

const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token");
    const urlUser = params.get("user");

    if (urlToken && urlUser) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(urlUser));
        saveSession(urlToken, parsedUser);
        setUser(parsedUser);
        window.history.replaceState({}, "", window.location.pathname);
        setLoading(false);
        return;
      } catch { /* fall through */ }
    }

    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }

    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
      setLoading(false);
      axios
        .get(`${API}/api/auth/me`, authHeader(token))
        .then((res) => {
          if (res.data.success) {
            setUser(res.data.user);
            saveSession(token, res.data.user);
          }
        })
        .catch((err) => {
          if (err.response?.status === 401) {
            clearSession();
            setUser(null);
          }
        });
      return;
    }

    axios
      .get(`${API}/api/auth/me`, authHeader(token))
      .then((res) => {
        if (res.data.success) {
          setUser(res.data.user);
          saveSession(token, res.data.user);
        } else {
          clearSession();
          setUser(null);
        }
      })
      .catch(() => {
        clearSession();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const interceptor = axios.interceptors.request.use((config) => {
      const token = getStoredToken();
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    return () => axios.interceptors.request.eject(interceptor);
  }, []);

  const refreshUser = async () => {
    const token = getStoredToken();
    if (!token) return;
    try {
      const res = await axios.get(`${API}/api/auth/me`, authHeader(token));
      if (res.data.success) {
        setUser(res.data.user);
        saveSession(token, res.data.user);
      }
    } catch { /* keep state */ }
  };

  const login = async (email, password) => {
    const res = await axios.post(`${API}/api/auth/login`, { email, password });
    if (res.data.success) {
      saveSession(res.data.token, res.data.user);
      setUser(res.data.user);
    }
    return res.data;
  };

  const signup = async (name, email, password) => {
    const res = await axios.post(`${API}/api/auth/signup`, { name, email, password });
    if (res.data.success) {
      saveSession(res.data.token, res.data.user);
      setUser(res.data.user);
    }
    return res.data;
  };

  const logout = async () => {
    try {
      const token = getStoredToken();
      if (token) {
        await axios.post(`${API}/api/auth/logout`, {}, authHeader(token));
      }
    } catch { /* ignore */ }
    finally {
      clearSession();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;