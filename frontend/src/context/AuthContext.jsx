import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

function decodeToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const t = localStorage.getItem('token');
    return t ? decodeToken(t) : null;
  });
  const [isAdmin, setIsAdmin] = useState(() => !!localStorage.getItem('adminToken'));
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('adminToken'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      setUser(decodeToken(token));
    } else {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token]);

  useEffect(() => {
    if (adminToken) {
      localStorage.setItem('adminToken', adminToken);
      setIsAdmin(true);
    } else {
      localStorage.removeItem('adminToken');
      setIsAdmin(false);
    }
  }, [adminToken]);

  useEffect(() => {
    if (!user && adminToken) {
      const payload = decodeToken(adminToken);
      setUser({ name: payload.email, email: payload.email });
    }
  }, [adminToken, user]);

  const setAdmin = (token) => {
    setAdminToken(token);
    setIsAdmin(true);
    const payload = decodeToken(token);
    setUser({ name: payload.email, email: payload.email });
  };

  const login = async (email, password) => {
    const res = await fetch('https://saarang-event-hub.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error('Invalid credentials');
    const data = await res.json();
    setToken(data.token);
  };

  const signup = async (name, email, password) => {
    const res = await fetch('https://saarang-event-hub.onrender.com/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    if (!res.ok) throw new Error('Signup failed');
    const data = await res.json();
    setToken(data.token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setAdminToken(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, signup, isAdmin, setAdmin, adminToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 